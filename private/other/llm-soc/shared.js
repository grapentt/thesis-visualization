// Shared pieces of the LLM-for-SOC video: the repo's kit, a colour code for the
// actors of the pipeline, a few composite drawing helpers (panels, nodes, icons,
// highlighted code, moving packets) and the running example that every scene
// of part 2 refers to.

export * from '../../../src/kit.js';
import { color, font, type, rgba, text, roundRect, arrow, dot, clamp } from '../../../src/kit.js';

/** Who is who. Keep these consistent across all scenes. */
export const C = Object.freeze({
  alert: '#ef6b6b', // Suricata alerts, attacker
  loki: '#6cc4e8', // logs from Loki
  fleet: '#86d08f', // hosts from FleetDM
  attack: '#ef8a5b', // MITRE ATT&CK
  llm: '#b79cf0', // the language model
  out: '#f2cf63', // the model's answer
  human: '#7ea6f2', // the analyst
  code: '#d3d7e0',
});

// ---------------------------------------------------------------------------
// panels and nodes

/** Rounded panel with an optional small title tab. */
export function panel(ctx, { x, y, w, h, accent = color.line, alpha = 1, fill = 'rgba(17,24,40,0.94)', title, radius = 12, glow = 0, dash }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (glow > 0.01) {
    ctx.shadowColor = rgba(accent, 0.55 * glow);
    ctx.shadowBlur = 26 * glow;
  }
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = rgba(accent, 0.55 + 0.4 * glow);
  ctx.lineWidth = 1.5 + glow;
  if (dash) ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
  if (title) text(ctx, title, x + 18, y + 26, { font: font.mono, size: 13, weight: 500, color: accent, tracking: 1.6 });
  ctx.restore();
}

/** Box centred on (x, y) with an icon, a title and a subtitle. */
export function node(ctx, { x, y, w = 240, h = 92, title, sub, accent = color.ink, icon: kind, alpha = 1, glow = 0, titleSize = 21 }) {
  if (alpha <= 0.003) return;
  panel(ctx, { x: x - w / 2, y: y - h / 2, w, h, accent, alpha, glow });
  const hasIcon = Boolean(kind);
  const tx = hasIcon ? x - w / 2 + 74 : x;
  const align = hasIcon ? 'left' : 'center';
  if (hasIcon) icon(ctx, kind, x - w / 2 + 40, y, 34, accent, alpha);
  const ty = sub ? y - 4 : y + 7;
  text(ctx, title, tx, ty, { font: font.sans, size: titleSize, weight: 500, color: color.ink, align, alpha });
  if (sub) text(ctx, sub, tx, y + 21, { font: font.mono, size: 13.5, color: color.muted, align, alpha });
}

/** Small tinted pill with mono text. Returns its width. */
export function chip(ctx, label, x, y, { color: c = color.ink, alpha = 1, size = 14, align = 'left', solid = false } = {}) {
  ctx.save();
  ctx.font = `500 ${size}px ${font.mono}`;
  const w = ctx.measureText(label).width + size * 1.3;
  const h = size * 1.75;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (alpha > 0.003) {
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = solid ? c : rgba(c, 0.17);
    roundRect(ctx, x0, y - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = rgba(c, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha /= alpha;
    text(ctx, label, x0 + w / 2, y + 0.5, { font: font.mono, size, weight: 500, color: solid ? color.bg : c, align: 'center', baseline: 'middle', alpha });
  }
  ctx.restore();
  return w;
}

/** A tilted rubber stamp, e.g. "NOT SUPPORTED". */
export function stamp(ctx, label, x, y, { color: c = C.alert, alpha = 1, size = 22, rotate = -0.08 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.font = `600 ${size}px ${font.mono}`;
  const w = ctx.measureText(label).width + 30;
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  roundRect(ctx, -w / 2, -size, w, size * 2, 6);
  ctx.stroke();
  ctx.fillStyle = c;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

/** Chat bubble with wrapped text; returns its height. */
export function bubble(ctx, str, x, y, w, { side = 'left', accent = color.line, alpha = 1, chars = Infinity, size = 19, fill } = {}) {
  ctx.save();
  ctx.font = `400 ${size}px ${font.sans}`;
  const lines = [];
  for (const para of str.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const cand = line ? `${line} ${word}` : word;
      if (ctx.measureText(cand).width > w - 36 && line) {
        lines.push(line);
        line = word;
      } else line = cand;
    }
    lines.push(line);
  }
  ctx.restore();
  const lh = size * 1.42;
  const h = lines.length * lh + 26;
  if (alpha <= 0.003) return h;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill ?? rgba(accent, 0.13);
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.45);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  let left = chars;
  lines.forEach((ln, i) => {
    if (left <= 0) return;
    text(ctx, left >= ln.length ? ln : ln.slice(0, left), x + 18, y + 13 + size + i * lh - 3, { font: font.sans, size, color: color.body, alpha });
    left -= ln.length + 1;
  });
  return h;
}

// ---------------------------------------------------------------------------
// paths, packets and connectors

function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/** Point at fraction u (0 … 1) of the arc length along a polyline. */
export function pointAt(pts, u) {
  const total = polylineLength(pts);
  let target = clamp(u) * total;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (target <= d || i === pts.length - 1) {
      const s = d > 0 ? Math.min(1, target / d) : 0;
      return [x0 + (x1 - x0) * s, y0 + (y1 - y0) * s];
    }
    target -= d;
  }
  return pts[pts.length - 1];
}

/** A polyline drawn up to `progress` of its length, with an arrow head once it is complete. */
export function connector(ctx, pts, { color: c = color.muted, width = 2, progress = 1, alpha = 1, dash, head = true } = {}) {
  if (alpha <= 0.003 || progress <= 0.001) return;
  const total = polylineLength(pts);
  let left = clamp(progress) * total;
  const drawn = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (left >= d) drawn.push(pts[i]);
    else drawn.push(pointAt([pts[i - 1], pts[i]], left / d));
    left -= d;
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = c;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  const last = drawn.length - 1;
  const [ex, ey] = drawn[last];
  const [px, py] = drawn[last - 1] ?? drawn[last];
  const shorten = head && progress >= 0.999 ? 10 : 0;
  const segLen = Math.hypot(ex - px, ey - py) || 1;
  ctx.beginPath();
  ctx.moveTo(drawn[0][0], drawn[0][1]);
  for (let i = 1; i < last; i++) ctx.lineTo(drawn[i][0], drawn[i][1]);
  ctx.lineTo(ex - ((ex - px) / segLen) * shorten, ey - ((ey - py) / segLen) * shorten);
  ctx.stroke();
  ctx.restore();
  if (shorten) arrow(ctx, ex - ((ex - px) / segLen) * 14, ey - ((ey - py) / segLen) * 14, ex, ey, { color: c, width, head: 12, alpha });
}

/** A glowing dot travelling along a polyline, with an optional label chip above it. */
export function packet(ctx, pts, u, { color: c = C.out, label, alpha = 1, r = 8 } = {}) {
  if (alpha <= 0.003 || u <= 0 || u >= 1) return;
  const [x, y] = pointAt(pts, u);
  const a = alpha * Math.min(1, u * 12, (1 - u) * 12);
  ctx.save();
  ctx.shadowColor = c;
  ctx.shadowBlur = 18;
  dot(ctx, x, y, r, c, a);
  ctx.restore();
  if (label) chip(ctx, label, x, y - 24, { color: c, alpha: a, size: 13, align: 'center' });
}

// ---------------------------------------------------------------------------
// icons, all drawn from strokes so they scale

/** Simple line icons centred on (x, y) with size s. */
export function icon(ctx, kind, x, y, s, c = color.ink, alpha = 1) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.strokeStyle = c;
  ctx.fillStyle = c;
  ctx.lineWidth = Math.max(1.6, s * 0.075);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const u = s / 2;
  ctx.beginPath();
  switch (kind) {
    case 'bell':
      ctx.moveTo(-u * 0.7, u * 0.45);
      ctx.quadraticCurveTo(-u * 0.6, u * 0.1, -u * 0.6, -u * 0.15);
      ctx.bezierCurveTo(-u * 0.6, -u * 0.8, u * 0.6, -u * 0.8, u * 0.6, -u * 0.15);
      ctx.quadraticCurveTo(u * 0.6, u * 0.1, u * 0.7, u * 0.45);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, u * 0.62, u * 0.16, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.62);
      ctx.lineTo(0, -u * 0.8);
      ctx.stroke();
      break;
    case 'chip': {
      roundRect(ctx, -u * 0.6, -u * 0.6, u * 1.2, u * 1.2, u * 0.15);
      ctx.stroke();
      ctx.beginPath();
      roundRect(ctx, -u * 0.28, -u * 0.28, u * 0.56, u * 0.56, u * 0.06);
      ctx.fill();
      ctx.beginPath();
      for (const k of [-0.3, 0, 0.3]) {
        ctx.moveTo(k * u, -u * 0.6);
        ctx.lineTo(k * u, -u * 0.85);
        ctx.moveTo(k * u, u * 0.6);
        ctx.lineTo(k * u, u * 0.85);
        ctx.moveTo(-u * 0.6, k * u);
        ctx.lineTo(-u * 0.85, k * u);
        ctx.moveTo(u * 0.6, k * u);
        ctx.lineTo(u * 0.85, k * u);
      }
      ctx.stroke();
      break;
    }
    case 'db':
      ctx.ellipse(0, -u * 0.55, u * 0.7, u * 0.22, 0, 0, Math.PI * 2);
      ctx.moveTo(-u * 0.7, -u * 0.55);
      ctx.lineTo(-u * 0.7, u * 0.55);
      ctx.ellipse(0, u * 0.55, u * 0.7, u * 0.22, 0, Math.PI, 0, true);
      ctx.lineTo(u * 0.7, -u * 0.55);
      ctx.moveTo(-u * 0.7, 0);
      ctx.ellipse(0, 0, u * 0.7, u * 0.22, 0, Math.PI, 0, true);
      ctx.stroke();
      break;
    case 'server':
      for (const yy of [-0.62, -0.08, 0.46]) {
        ctx.beginPath();
        roundRect(ctx, -u * 0.75, u * yy, u * 1.5, u * 0.42, u * 0.08);
        ctx.stroke();
        dot(ctx, u * 0.48, u * (yy + 0.21), u * 0.06, c);
      }
      break;
    case 'laptop':
      roundRect(ctx, -u * 0.62, -u * 0.55, u * 1.24, u * 0.85, u * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.9, u * 0.5);
      ctx.lineTo(u * 0.9, u * 0.5);
      ctx.stroke();
      break;
    case 'person':
      ctx.arc(0, -u * 0.38, u * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, u * 0.75, u * 0.62, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      break;
    case 'shield':
      ctx.moveTo(0, -u * 0.8);
      ctx.lineTo(u * 0.65, -u * 0.55);
      ctx.quadraticCurveTo(u * 0.65, u * 0.4, 0, u * 0.82);
      ctx.quadraticCurveTo(-u * 0.65, u * 0.4, -u * 0.65, -u * 0.55);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'eye':
      ctx.moveTo(-u * 0.85, 0);
      ctx.quadraticCurveTo(0, -u * 0.75, u * 0.85, 0);
      ctx.quadraticCurveTo(0, u * 0.75, -u * 0.85, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.24, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'lock':
      roundRect(ctx, -u * 0.55, -u * 0.1, u * 1.1, u * 0.85, u * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -u * 0.12, u * 0.36, Math.PI, 0);
      ctx.stroke();
      break;
    case 'doc':
      ctx.moveTo(-u * 0.55, -u * 0.8);
      ctx.lineTo(u * 0.25, -u * 0.8);
      ctx.lineTo(u * 0.55, -u * 0.5);
      ctx.lineTo(u * 0.55, u * 0.8);
      ctx.lineTo(-u * 0.55, u * 0.8);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      for (const yy of [-0.2, 0.1, 0.4]) {
        ctx.moveTo(-u * 0.32, u * yy);
        ctx.lineTo(u * 0.32, u * yy);
      }
      ctx.stroke();
      break;
    case 'gear': {
      const teeth = 8;
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 ? u * 0.58 : u * 0.8;
        const a0 = (i / (teeth * 2)) * Math.PI * 2;
        const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
        ctx.lineTo(r * Math.cos(a0), r * Math.sin(a0));
        ctx.lineTo(r * Math.cos(a1), r * Math.sin(a1));
      }
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.24, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'terminal':
      roundRect(ctx, -u * 0.8, -u * 0.62, u * 1.6, u * 1.24, u * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.45, -u * 0.2);
      ctx.lineTo(-u * 0.15, u * 0.05);
      ctx.lineTo(-u * 0.45, u * 0.3);
      ctx.moveTo(0, u * 0.32);
      ctx.lineTo(u * 0.45, u * 0.32);
      ctx.stroke();
      break;
    case 'cloud':
      ctx.moveTo(-u * 0.55, u * 0.4);
      ctx.arc(-u * 0.45, u * 0.08, u * 0.32, Math.PI * 0.6, Math.PI * 1.5);
      ctx.arc(0, -u * 0.18, u * 0.42, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(u * 0.48, u * 0.1, u * 0.3, Math.PI * 1.5, Math.PI * 0.45);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'check':
      ctx.moveTo(-u * 0.55, 0);
      ctx.lineTo(-u * 0.15, u * 0.42);
      ctx.lineTo(u * 0.6, -u * 0.45);
      ctx.stroke();
      break;
    case 'cross':
      ctx.moveTo(-u * 0.45, -u * 0.45);
      ctx.lineTo(u * 0.45, u * 0.45);
      ctx.moveTo(u * 0.45, -u * 0.45);
      ctx.lineTo(-u * 0.45, u * 0.45);
      ctx.stroke();
      break;
    case 'warn':
      ctx.moveTo(0, -u * 0.78);
      ctx.lineTo(u * 0.82, u * 0.62);
      ctx.lineTo(-u * 0.82, u * 0.62);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.25);
      ctx.lineTo(0, u * 0.18);
      ctx.stroke();
      dot(ctx, 0, u * 0.4, u * 0.06, c);
      break;
    case 'search':
      ctx.arc(-u * 0.12, -u * 0.12, u * 0.45, 0, Math.PI * 2);
      ctx.moveTo(u * 0.22, u * 0.22);
      ctx.lineTo(u * 0.7, u * 0.7);
      ctx.stroke();
      break;
    case 'grid':
      for (const gx of [-0.6, 0.05]) for (const gy of [-0.6, 0.05]) {
        ctx.beginPath();
        roundRect(ctx, u * gx, u * gy, u * 0.55, u * 0.55, u * 0.08);
        ctx.stroke();
      }
      break;
    case 'mail':
      roundRect(ctx, -u * 0.8, -u * 0.55, u * 1.6, u * 1.1, u * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.8, -u * 0.5);
      ctx.lineTo(0, u * 0.1);
      ctx.lineTo(u * 0.8, -u * 0.5);
      ctx.stroke();
      break;
    default:
      ctx.arc(0, 0, u * 0.6, 0, Math.PI * 2);
      ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// highlighted code

const PY_KEYWORDS = new Set('import from def return for in if else elif not and or with as True False None try except raise while lambda assert'.split(' '));
const CITATION = /(\[[LHA]\d+\])/;
const citationColor = (s) => (s[1] === 'L' ? C.loki : s[1] === 'H' ? C.fleet : C.alert);

const SYNTAX = {
  keyword: C.llm,
  string: '#a8d8a0',
  number: C.out,
  comment: color.dim,
  fn: C.loki,
  key: '#9fc6f0',
  punct: color.muted,
  plain: C.code,
};

function splitCitations(str, base) {
  return str.split(CITATION).filter(Boolean).map((s) => [s, CITATION.test(s) ? citationColor(s) : base]);
}

/** Split one line into [text, colour] pieces. */
function tokenize(line, lang, base) {
  if (lang === 'plain') return splitCitations(line, base);
  const out = [];
  if (lang === 'py') {
    const re = /(#.*$)|([rbf]?"(?:[^"\\]|\\.)*"|[rbf]?'(?:[^'\\]|\\.)*')|(\b\d[\d_]*(?:\.\d+)?(?:e\d+)?\b)|([A-Za-z_]\w*)(\s*\()?|(\s+)|([^\s\w])/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[1]) out.push([m[1], SYNTAX.comment]);
      else if (m[2]) out.push(...splitCitations(m[2], SYNTAX.string));
      else if (m[3]) out.push([m[3], SYNTAX.number]);
      else if (m[4]) {
        out.push([m[4], PY_KEYWORDS.has(m[4]) ? SYNTAX.keyword : m[5] ? SYNTAX.fn : base]);
        if (m[5]) out.push([m[5], SYNTAX.punct]);
      } else if (m[6]) out.push([m[6], base]);
      else out.push([m[7], SYNTAX.punct]);
    }
    return out;
  }
  // json
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|(\s+)|([^\s])/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1] && m[2]) out.push([m[1], SYNTAX.key], [m[2], SYNTAX.punct]);
    else if (m[1]) out.push(...splitCitations(m[1], SYNTAX.string));
    else if (m[3]) out.push([m[3], SYNTAX.number]);
    else if (m[4]) out.push([m[4], C.llm]);
    else if (m[5]) out.push([m[5], base]);
    else out.push([m[6], SYNTAX.punct]);
  }
  return out;
}

/** Height a codeBlock with these options will take. */
export function codeHeight(src, { size = 17, lh = size * 1.55, pad = 20, title } = {}) {
  return src.split('\n').length * lh + pad * 2 + (title ? 30 : 0);
}

/**
 * A code panel with syntax colours.
 *  lang:    'py' | 'json' | 'plain'
 *  chars:   typewriter: how many characters are visible (newlines count as one)
 *  active:  line index, array of line indices, or { from, to } range to highlight
 *  focus:   0 … 1, how strongly the active lines stand out (others dim)
 *  lineColors: per-line base colour override (plain text)
 * Returns { height, lineY(i) } so scenes can attach connectors to lines.
 */
export function codeBlock(ctx, src, o = {}) {
  const { x, y, w, size = 17, lh = size * 1.55, pad = 20, lang = 'py', chars = Infinity, active = null, focus = 1, activeColor = C.out, alpha = 1, title, accent = color.line, box = true, lineColors = [], caret = true } = o;
  const lines = src.split('\n');
  const top = y + pad + (title ? 30 : 0);
  const height = codeHeight(src, { size, lh, pad, title });
  const lineY = (i) => top + i * lh + lh / 2;
  const result = { height, lineY };
  if (alpha <= 0.003) return result;
  if (box) panel(ctx, { x, y, w, h: height, accent, alpha, title, fill: 'rgba(10,15,26,0.96)' });

  // active: a line index, an array of line indices, or { from, to } (inclusive)
  const isActive = (i) =>
    active === null ? false : typeof active === 'number' ? i === active : Array.isArray(active) ? active.includes(i) : i >= active.from && i <= active.to;
  const anyActive = active !== null && focus > 0.001;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `400 ${size}px ${font.mono}`;
  const typing = Number.isFinite(chars) && chars < src.length;
  let left = chars;
  for (let i = 0; i < lines.length; i++) {
    if (left < 0) break;
    const yy = lineY(i);
    const on = isActive(i);
    if (on && focus > 0.001) {
      ctx.fillStyle = rgba(activeColor, 0.14 * focus);
      ctx.fillRect(x + 6, yy - lh / 2, w - 12, lh);
      ctx.fillStyle = rgba(activeColor, 0.9 * focus);
      ctx.fillRect(x + 6, yy - lh / 2, 3, lh);
    }
    const lineAlpha = anyActive && !on ? 1 - 0.45 * focus : 1;
    let cx = x + pad + 8;
    for (const [str, col] of tokenize(lines[i], lang, lineColors[i] ?? C.code)) {
      if (left <= 0) break;
      const shown = left >= str.length ? str : str.slice(0, left);
      ctx.globalAlpha = alpha * lineAlpha;
      ctx.fillStyle = col;
      ctx.textBaseline = 'middle';
      ctx.fillText(shown, cx, yy);
      cx += ctx.measureText(shown).width;
      left -= shown.length;
    }
    if (left <= 0 && typing && caret && left > -1) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = C.out;
      ctx.fillRect(cx + 1, yy - size * 0.55, 2, size * 1.1);
    }
    left -= 1; // the newline
  }
  ctx.restore();
  return result;
}

/** Total character count of a source, as codeBlock's typewriter counts it. */
export const charCount = (src) => src.length;

// ---------------------------------------------------------------------------
// small layout helpers

/** Numbered step badge. */
export function badge(ctx, n, x, y, { color: c = C.out, alpha = 1, r = 17 } = {}) {
  if (alpha <= 0.003) return;
  dot(ctx, x, y, r, c, alpha);
  text(ctx, String(n), x, y + 1, { font: font.mono, size: r * 1.05, weight: 600, color: color.bg, align: 'center', baseline: 'middle', alpha });
}

/** Small caption under or beside something. */
export const caption = (ctx, str, x, y, o = {}) => text(ctx, str, x, y, { ...type.note, ...o });

/** A horizontal meter (0 … 1) with a label and value text. */
export function meter(ctx, { x, y, w, h = 18, value, color: c, label, valueText, alpha = 1, max = 1, overflowColor = C.alert }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(138,150,173,0.12)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  const v = Math.max(0, value);
  const inside = Math.min(v, max) / max;
  if (inside > 0.002) {
    ctx.fillStyle = c;
    roundRect(ctx, x, y, Math.max(h, w * inside), h, h / 2);
    ctx.fill();
  }
  if (v > max) {
    ctx.fillStyle = overflowColor;
    roundRect(ctx, x + w - h, y, h + (w * (v - max)) / max, h, h / 2);
    ctx.fill();
  }
  ctx.restore();
  if (label) text(ctx, label, x, y - 10, { font: font.mono, size: 14, color: color.muted, alpha });
  if (valueText) text(ctx, valueText, x + w, y - 10, { font: font.mono, size: 14, color: c, align: 'right', alpha });
}

// ---------------------------------------------------------------------------
// the running example of part 2

export const ATTACKER = '10.10.0.66';
export const VICTIM = '10.10.0.21';

export const ALERT_JSON = `{
  "timestamp": "2026-11-12T14:03:27.412+0100",
  "event_type": "alert",
  "src_ip": "10.10.0.66",
  "src_port": 51544,
  "dest_ip": "10.10.0.21",
  "dest_port": 22,
  "proto": "TCP",
  "alert": {
    "signature_id": 2001219,
    "signature": "ET SCAN Potential SSH Scan",
    "category": "Attempted Information Leak",
    "severity": 2
  }
}`;

/** Condensed Suricata records around the alert, as the pipeline hands them to the model. */
export const LOG_LINES = [
  { id: 'L1', time: '14:00:51', text: 'flow  10.10.0.66 → 10.10.0.21:22   1.2 s   3.1 kB  closed' },
  { id: 'L2', time: '14:00:51', text: 'ssh   client libssh2_1.10.0 · server OpenSSH_8.9p1' },
  { id: 'L3', time: '14:00:52', text: '…213 more flows like L1 until 14:03:58, one every 0.9 s' },
  { id: 'L4', time: '14:03:27', text: 'alert ET SCAN Potential SSH Scan  (the triggering alert)' },
  { id: 'L5', time: '14:04:01', text: 'flow  10.10.0.66 → 10.10.0.21:22   662 s   2.3 MB  long' },
  { id: 'L6', time: '14:05:12', text: 'flow  10.10.0.21 → 10.10.0.66:4444   41 s   180 kB' },
];

/** Host facts from FleetDM. */
export const HOST_LINES = [
  { id: 'H1', text: 'web-01 · Ubuntu 22.04.3 LTS · label: public web server' },
  { id: 'H2', text: 'software: openssh-server 8.9p1, apache2 2.4.52, mysql 8.0' },
  { id: 'H3', text: 'policy "SSH password login disabled": FAILING' },
];

export const OUTPUT_JSON = `{
  "technique": "T1110.001",
  "technique_name": "Brute Force: Password Guessing",
  "what_happened": [
    "214 short SSH sessions from 10.10.0.66 in 3 min [L1][L3]",
    "client was libssh2, common in attack tools [L2]",
    "web-01 accepts SSH passwords [H3]",
    "then a 662 s session: login likely worked [L5]",
    "web-01 connected back to port 4444 [L6]"
  ],
  "requires_reaction": true,
  "severity": "high",
  "next_steps": [
    "isolate web-01 from the network",
    "check auth.log on web-01 for accepted logins",
    "block 10.10.0.66, reset affected passwords",
    "disable SSH password login"
  ]
}`;
