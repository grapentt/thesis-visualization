// Palette and the recurring drawing devices of "What the noise should keep".
//
// One meaning per colour: orange the stiff bond (as in Part 1), a paler orange its width, blue the
// soft torsion within its basin, gold the basin population and the point that moves, lavender
// everything Fisher information produces (retained fractions, posterior clouds, the operator),
// green the model's functions, rose the Kullback–Leibler divergence, grey the data.

import { color, type, font, rgba, text, line, dot, ring, roundRect, formatNumber, lin, wrap, hexToRgb } from '../../kit.js';

export const BOND = color.stiff;
export const WIDTH = '#f3b58d';
export const TORSION = color.soft;
export const BASIN = color.gold;
export const INFO = '#c39bf5';
export const MODEL = '#86d08f';
export const KL = '#f497c0';
export const DATA = color.body;
export const OBSERVABLE_COLOURS = Object.freeze({ bond: BOND, width: WIDTH, torsion: TORSION, basin: BASIN });

/** A scene header: eyebrow 'NN · NAME' and the title. */
export const header = (n, name, title) => ({ eyebrow: `${String(n).padStart(2, '0')} · ${name}`, title });

/** Eased keyframes: [time, value] pairs, eased between keys (as seg()). */
export const track = (t, keys, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [t1, v1] = keys[k];
    if (t <= t1) return keys[k - 1][1] + (v1 - keys[k - 1][1]) * ease(lin(t, keys[k - 1][0], t1));
  }
  return keys[keys.length - 1][1];
};

export const fmt = (v, digits = 2) => formatNumber(v, digits);

// ---- frames: a rectangle of the stage showing a rectangle of the plane ---------------------------

/** Plane coordinates (u, v) ∈ [u0, u1] × [v0, v1] mapped to the stage rectangle x, y, w, h (v up). */
export function frame({ x, y, w, h, u = [0, 1], v = [0, 1] }) {
  const kx = w / (u[1] - u[0]);
  const ky = h / (v[1] - v[0]);
  return {
    x, y, w, h, u, v, kx, ky,
    X: (uu) => x + (uu - u[0]) * kx,
    Y: (vv) => y + h - (vv - v[0]) * ky,
    point: ([uu, vv]) => [x + (uu - u[0]) * kx, y + h - (vv - v[0]) * ky],
    inside: ([uu, vv]) => uu >= u[0] && uu <= u[1] && vv >= v[0] && vv <= v[1],
  };
}

export function clipped(ctx, F, fn, slack = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(F.x - slack, F.y - slack, F.w + 2 * slack, F.h + 2 * slack);
  ctx.clip();
  fn();
  ctx.restore();
}

/** Decade ticks for a log axis: [value in log10, label] for every power of ten in [lo, hi]. */
export const decades = (lo, hi) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => {
    const e = lo + i;
    return [e, e === 0 ? '1' : e > 0 ? `${10 ** e}` : `10${'⁻'}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[-e]}`];
  });

/**
 * Left and bottom axes of a frame with ticks. xTicks / yTicks: values or [value, label] pairs;
 * xLabel / yLabel: names at the ends; grid: faint lines through the ticks; box: all four sides.
 */
export function axes(ctx, F, { xTicks = [], yTicks = [], xLabel = '', yLabel = '', grid = false, alpha = 1, format = (v) => String(v), formatY = format, box = false, labelStyle = {} } = {}) {
  if (alpha <= 0.003) return;
  const value = (tick) => (Array.isArray(tick) ? tick[0] : tick);
  const label = (tick, f) => (Array.isArray(tick) ? tick[1] : f(tick));
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (grid) {
    for (const u of xTicks) line(ctx, F.X(value(u)), F.y, F.X(value(u)), F.y + F.h, { color: color.grid, width: 1 });
    for (const v of yTicks) line(ctx, F.x, F.Y(value(v)), F.x + F.w, F.Y(value(v)), { color: color.grid, width: 1 });
  }
  line(ctx, F.x, F.y, F.x, F.y + F.h, { color: color.line, width: 1.5 });
  line(ctx, F.x, F.y + F.h, F.x + F.w, F.y + F.h, { color: color.line, width: 1.5 });
  if (box) {
    line(ctx, F.x + F.w, F.y, F.x + F.w, F.y + F.h, { color: color.line, width: 1.5 });
    line(ctx, F.x, F.y, F.x + F.w, F.y, { color: color.line, width: 1.5 });
  }
  for (const u of xTicks) {
    line(ctx, F.X(value(u)), F.y + F.h, F.X(value(u)), F.y + F.h + 6, { color: color.line });
    text(ctx, label(u, format), F.X(value(u)), F.y + F.h + 24, { font: font.mono, size: 14, color: color.muted, align: 'center' });
  }
  for (const v of yTicks) {
    line(ctx, F.x - 6, F.Y(value(v)), F.x, F.Y(value(v)), { color: color.line });
    text(ctx, label(v, formatY), F.x - 10, F.Y(value(v)) + 5, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  }
  const style = { font: font.display, italic: true, size: 20, color: color.muted, ...labelStyle };
  if (xLabel) text(ctx, xLabel, F.x + F.w, F.y + F.h + 48, { ...style, align: 'right' });
  if (yLabel) text(ctx, yLabel, F.x - 12, F.y + 6, { ...style, align: 'right' });
  ctx.restore();
}

/** A polyline through plane points. progress: draw only the first part. */
export function drawPath(ctx, F, points, { colour = color.ink, alpha = 1, width = 2.5, dash = [], close = false, fill = null, progress = 1 } = {}) {
  if (alpha <= 0.003 || points.length < 2) return;
  const last = Math.max(1, Math.round((points.length - 1) * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  for (let i = 0; i <= last; i++) {
    const [x, y] = F.point(points[i]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  if (close) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

/** The graph of f(u) over the frame's u range (or `u`), optionally filled down to v = 0 (or `base`). */
export function drawCurve(ctx, F, f, { colour = color.ink, alpha = 1, width = 2.5, fill = null, n = 240, u = F.u, dash = [], progress = 1, base = 0, clip = true } = {}) {
  if (alpha <= 0.003) return;
  const last = Math.max(1, Math.round(n * progress));
  const pts = [];
  for (let i = 0; i <= last; i++) {
    const uu = u[0] + ((u[1] - u[0]) * i) / n;
    const vv = f(uu);
    if (Number.isFinite(vv)) pts.push(F.point([uu, vv]));
  }
  if (pts.length < 2) return;
  const draw = () => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (fill) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], F.Y(base));
      for (const [x, y] of pts) ctx.lineTo(x, y);
      ctx.lineTo(pts[pts.length - 1][0], F.Y(base));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  if (clip) clipped(ctx, F, draw, 2);
  else draw();
}

/** A marked point of the plane, with an optional label. */
export function drawPoint(ctx, F, p, { colour = color.ink, alpha = 1, r = 7, label = '', labelOffset = [12, -10], halo = 0, ringed = false, labelStyle = {} } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = F.point(p);
  if (halo > 0.003) {
    ctx.save();
    ctx.globalAlpha *= alpha * 0.35 * halo;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, r + 9, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  dot(ctx, x, y, r, colour, alpha);
  if (ringed) ring(ctx, x, y, r + 5, colour, 0.8 * alpha, 2);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: colour, alpha, ...labelStyle });
}

/** Scatter of plane points. */
export function drawSamples(ctx, F, points, { colour = DATA, alpha = 0.7, r = 3, count = points.length } = {}) {
  if (alpha <= 0.003) return;
  clipped(ctx, F, () => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = colour;
    for (let i = 0; i < Math.min(count, points.length); i++) {
      const [x, y] = F.point(points[i]);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  });
}

// ---- heat maps ------------------------------------------------------------------------------------

const RAMP = [
  [0, '#0d1321'],
  [0.3, '#163050'],
  [0.6, '#1f6b7e'],
  [0.85, '#6db0a6'],
  [1, '#f0d27a'],
].map(([stop, hex]) => [stop, hexToRgb(hex)]);

function ramp(x) {
  for (let k = 1; k < RAMP.length; k++) {
    if (x <= RAMP[k][0]) {
      const u = (x - RAMP[k - 1][0]) / (RAMP[k][0] - RAMP[k - 1][0]);
      return RAMP[k - 1][1].map((v, i) => v + (RAMP[k][1][i] - v) * u);
    }
  }
  return RAMP[RAMP.length - 1][1];
}

/**
 * Draw cell values[i · nv + j] (i along u, j along v, both ascending) into the frame as a heat map.
 * gamma flattens the ramp; `tint` draws a single colour with alpha ∝ value instead of the ramp;
 * `max` fixes the normalisation (default: the maximum of the values).
 */
export function heatmap(ctx, F, values, nu, nv, { alpha = 1, gamma = 0.6, tint = null, max = null, smooth = true } = {}) {
  if (alpha <= 0.003) return;
  const canvas = document.createElement('canvas');
  canvas.width = nu;
  canvas.height = nv;
  const g = canvas.getContext('2d');
  const image = g.createImageData(nu, nv);
  let top = max ?? 0;
  if (max === null) for (const v of values) if (v > top) top = v;
  const tintRgb = tint ? hexToRgb(tint) : null;
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const r = Math.min(1, Math.max(0, values[i * nv + j] / top));
      const o = ((nv - 1 - j) * nu + i) * 4;
      if (tintRgb) {
        image.data[o] = tintRgb[0];
        image.data[o + 1] = tintRgb[1];
        image.data[o + 2] = tintRgb[2];
        image.data[o + 3] = Math.round(255 * Math.pow(r, gamma));
      } else {
        const c = ramp(Math.pow(r, gamma));
        image.data[o] = c[0];
        image.data[o + 1] = c[1];
        image.data[o + 2] = c[2];
        image.data[o + 3] = 255;
      }
    }
  }
  g.putImageData(image, 0, 0);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, F.x, F.y, F.w, F.h);
  ctx.restore();
}

// ---- small widgets ----------------------------------------------------------------------------------

export function panel(ctx, x, y, w, h, { alpha = 1, stroke = color.line, fill = 'rgba(17,24,40,0.85)', radius = 12 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/** A small tag pill, drawn with its left edge at x and centred on y. Returns its width. */
export function pill(ctx, tag, x, y, accent, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `500 13px ${font.mono}`;
  const width = ctx.measureText(tag).width + tag.length * 1.5 + 22;
  ctx.fillStyle = rgba(accent, 0.16);
  roundRect(ctx, x, y - 13, width, 26, 13);
  ctx.fill();
  text(ctx, tag, x + 11, y, { font: font.mono, size: 13, weight: 500, color: accent, baseline: 'middle', tracking: 1.5 });
  ctx.restore();
  return width;
}

/** 'label  value' in mono, the value in colour. */
export function readout(ctx, label, value, x, y, { colour = color.ink, digits = 2, size = 17, alpha = 1, align = 'left' } = {}) {
  if (alpha <= 0.003) return;
  const v = typeof value === 'number' ? fmt(value, digits) : value;
  if (align === 'right') {
    text(ctx, v, x, y, { font: font.mono, size, color: colour, alpha, align: 'right' });
    ctx.save();
    ctx.font = `400 ${size}px ${font.mono}`;
    const w = ctx.measureText(v).width;
    ctx.restore();
    text(ctx, label, x - w - 10, y, { font: font.mono, size, color: color.muted, alpha, align: 'right' });
    return;
  }
  text(ctx, label, x, y, { font: font.mono, size, color: color.muted, alpha });
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  const w = ctx.measureText(label).width;
  ctx.restore();
  text(ctx, v, x + w + 10, y, { font: font.mono, size, color: colour, alpha });
}

/** A caption centred above a frame. */
export const caption = (ctx, F, s, alpha, style = {}) => text(ctx, s, F.x + F.w / 2, F.y - 16, { ...type.note, color: color.body, align: 'center', alpha, ...style });

/** Wrapped muted body text. Returns the height used. */
export const aside = (ctx, x, y, w, body, { colour = color.muted, alpha = 1, size = 16, lineHeight = 23, font: face = font.sans } = {}) =>
  wrap(ctx, body, x, y, w, lineHeight, { font: face, size, color: colour, alpha });

/** A legend: coloured swatches with names, in a row (or a column with `vertical`). */
export function legend(ctx, x, y, entries, { alpha = 1, gap = 26, vertical = false, size = 15 } = {}) {
  if (alpha <= 0.003) return;
  let cx = x;
  let cy = y;
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  for (const { name, colour, dash } of entries) {
    line(ctx, cx, cy - 5, cx + 22, cy - 5, { color: colour, width: 3, dash: dash ?? [], alpha });
    text(ctx, name, cx + 30, cy, { font: font.mono, size, color: color.body, alpha });
    if (vertical) cy += gap;
    else cx += ctx.measureText(name).width + 30 + gap;
  }
  ctx.restore();
}

/** The reminder that nothing on screen is drawn by hand. */
export const stamp = (ctx, alpha = 1, note = 'everything on screen is computed from the formulas shown') =>
  text(ctx, note, 1520, 866, { ...type.note, size: 13, color: color.dim, align: 'right', alpha });

/** Tick labels for the torsion axis. */
export const PHI_TICKS = [[-Math.PI, '−π'], [-Math.PI / 2, '−π/2'], [0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']];
