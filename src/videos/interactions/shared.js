// Palette, molecules and the recurring drawing devices of "Parts and Poses" (scene side).
//
// One meaning per colour, everywhere: gold symmetry, soft blue shapes, teal pose, rose water's
// frozen model, lime peroxide's, orange the interaction, muted dashed the plug-in, khaki the
// restraint. Atoms keep their element colours; a molecule's identity is a soft halo.

import { color, type, font, camera, rgba, mix, hexToRgb, text, splitLines, roundRect, arrow, arrow3, tex, drawMolecule, polyline3, rotation, vec3 } from '../../kit.js';
import { Molecule } from '../../model/molecule.js';
import { buildWater, buildPeroxide, dipeptide, centroid } from './toy.js';
import { SPRINGS } from './springs.js';

export { BEAD as POSE } from '../bundles/beads.js';
export const VERTICAL = color.gold, HORIZONTAL = color.soft;
export const SCORE_W = '#f497c0', SCORE_P = '#b5e655', INTER = '#ff8a3d';
export const PLUGIN = color.muted, RESTRAINT = '#c2a878', NOISE = color.body;
const OUTLINE = '#05080f';

/** Mix of two hex colours as hex (so rgba() can take it); u = 0 gives a. */
export const mixHex = (a, b, u) => `#${hexToRgb(a).map((x, i) => Math.round(x + (hexToRgb(b)[i] - x) * u).toString(16).padStart(2, '0')).join('')}`;

/** Status of the follow-up experiment: update together with scene 18's card tag and narration. */
export const FOLLOW_UP =
  'Alanine dipeptide alone, and with one water under an 8 Å restraint: 400 K MD on the LISE cluster, 96 replicas per system, 10 ns discarded and 40 ns kept, one frame per 10 ps (384 000 frames per system). Submitted and running; no results yet.';

// ---- molecules -------------------------------------------------------------------

const shifted = (X, [dx, dy, dz]) => Array.from(X, (v, i) => v + [dx, dy, dz][i % 3]);
const WATER_EL = ['O', 'H', 'H'], PEROXIDE_EL = ['H', 'O', 'O', 'H'];
const ALA2_EL = ['C', 'C', 'O', 'N', 'C', 'C', 'C', 'O', 'N', 'C'];
const WATER_BONDS = [[0, 1], [0, 2]], PEROXIDE_BONDS = [[0, 1], [1, 2], [2, 3]];
const ALA2_BONDS = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [4, 6], [6, 7], [6, 8], [8, 9]];
const offset = (bonds, k) => bonds.map(([i, j]) => [i + k, j + k]);
const combine = (parts) => {
  let k = 0;
  const spec = { elements: [], positions: [], bonds: [] };
  for (const [elements, positions, bonds] of parts) {
    spec.elements.push(...elements);
    spec.positions.push(...positions);
    spec.bonds.push(...offset(bonds, k));
    k += elements.length;
  }
  return new Molecule(spec);
};
const W = [WATER_EL, buildWater(), WATER_BONDS];
const P = (dx) => [PEROXIDE_EL, shifted(buildPeroxide(), [dx, 0, 0]), PEROXIDE_BONDS];

export const WATER_MOL = combine([W]);
export const PEROXIDE_MOL = combine([P(0)]);
/** Water (atoms 0–2) and peroxide (3–6): one drawMol call per cluster, so atoms depth-sort together. */
export const PAIR_MOL = combine([W, P(3.2)]);
export const DIMER_MOL = combine([W, [WATER_EL, shifted(buildWater(), [2.9, 0, 0]), WATER_BONDS]]);
/** Water A (0–2), peroxide B (3–6), water C (7–9). */
export const TRIMER_MOL = combine([W, P(3.2), [WATER_EL, shifted(buildWater(), [6.4, 0, 0]), WATER_BONDS]]);
export const ALA2_MOL = combine([[ALA2_EL, dipeptide(), ALA2_BONDS]]);

/**
 * The dipeptide with one water, an illustrative placement (not computed): the water's O 3.2 Å from the
 * backbone carbonyl O along C=O, one H pointing back at it, the molecule in the plane of C, O and Cα.
 */
export const ALA2_W = (() => {
  const X = dipeptide();
  const C = X.slice(18, 21), O = X.slice(21, 24), CA = X.slice(12, 15);
  const d = vec3.normalize(vec3.sub(O, C));
  const n = vec3.normalize(vec3.cross(d, vec3.cross(vec3.sub(CA, C), d)));
  const Ow = vec3.add(O, vec3.scale(d, 3.2));
  const H1 = vec3.sub(Ow, vec3.scale(d, 0.9572)); // donates towards the backbone O
  const a = (104.52 * Math.PI) / 180;
  const H2 = vec3.add(Ow, vec3.scale(vec3.add(vec3.scale(d, -Math.cos(a)), vec3.scale(n, Math.sin(a))), 0.9572));
  return [...X, ...Ow, ...H1, ...H2];
})();
/** Dipeptide (0–9) and one water (10–12), at ALA2_W. */
export const ALA2_W_MOL = new Molecule({ elements: [...ALA2_EL, ...WATER_EL], positions: ALA2_W, bonds: [...ALA2_BONDS, ...offset(WATER_BONDS, 10)] });
// The positions stored in these Molecule objects only fix elements and bonds; every drawMol call
// passes the coordinates it draws (DOCKED.X, DIMER_MIN.X, TRIMER.X, ALA2_W, …).

let layer = null;
/** An offscreen canvas at least as large as ctx's, for drawing a molecule once and fading it as a whole. */
function layerFor(ctx) {
  const { width, height } = ctx.canvas;
  layer ??= document.createElement('canvas');
  if (layer.width < width || layer.height < height) {
    layer.width = Math.max(layer.width, width);
    layer.height = Math.max(layer.height, height);
  }
  return layer.getContext('2d');
}

/**
 * THE way to draw a molecule: no atom numbers. opacity multiplies the context's alpha (as every other
 * device here does), and a partly transparent molecule is drawn once at full strength and faded as a
 * whole, so its bonds do not show through its atoms. Returns the projected atoms.
 */
export function drawMol(ctx, X, cam, mol, o = {}) {
  const alpha = (o.opacity ?? 1) * ctx.globalAlpha;
  const options = { molecule: mol, labels: 0, ...o };
  if (alpha <= 0.003 || alpha >= 0.997) {
    ctx.save();
    const P = drawMolecule(ctx, X, cam, { ...options, opacity: alpha });
    ctx.restore();
    return P;
  }
  // the molecule's bounding box on the device canvas
  const m = ctx.getTransform();
  const big = Math.max(1, ...[].concat(o.atomScale ?? 1));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < mol.count; i++) {
    const p = cam.project([X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
    const r = Math.max(6, 0.3 * cam.scale * p.k * big) + 14;
    for (const [x, y] of [[p.x - r, p.y - r], [p.x + r, p.y - r], [p.x - r, p.y + r], [p.x + r, p.y + r]]) {
      const q = m.transformPoint({ x, y });
      x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y);
    }
  }
  const { width, height } = ctx.canvas;
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(width, Math.ceil(x1)); y1 = Math.min(height, Math.ceil(y1));
  if (x1 <= x0 || y1 <= y0) return drawMolecule(ctx, X, cam, { ...options, opacity: 0 });
  const lctx = layerFor(ctx);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(x0, y0, x1 - x0, y1 - y0);
  lctx.setTransform(m);
  const P = drawMolecule(lctx, X, cam, { ...options, opacity: 1 });
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.drawImage(lctx.canvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
  return P;
}

/** Small molecule drawn centred on (x, y) at `scale` px/Å, nearly without perspective. halos: [[from, to, tint], …]. */
export function moleculeThumb(ctx, x, y, X, mol, { scale = 28, yaw = 0, pitch = 0, alpha = 1, halos = [] } = {}) {
  const cam = camera({ cx: x, cy: y, scale, yaw, pitch, focal: 40, center: centroid(X, mol.count) });
  for (const [from, to, tint] of halos) drawHalo(ctx, cam, X, [from, to], tint, { alpha: 2.5 * alpha });
  return drawMol(ctx, X, cam, mol, { opacity: alpha });
}

// ---- cards and small text ------------------------------------------------------------

/**
 * A card: tag pill, optional title and body. Without a title: height 76 + 33·lines, body from y + 96.
 * With a title (the kit card's layout, 132 + 33·lines): the title shrinks from 34 px to fit the
 * width. Returns the height.
 */
export function tagCard(ctx, { x, y, width, tag, title = null, body, accent = color.gold, alpha = 1, progress = 1 }) {
  const style = { ...type.body, size: 22 };
  const lines = splitLines(ctx, body, width - 56, style);
  const height = (title ? 132 : 76) + 33 * lines.length;
  if (alpha <= 0.003) return height;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(17,24,40,0.97)';
  roundRect(ctx, x, y, width, height, 14);
  ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  pill(ctx, tag, x + 28, y + 38, accent);
  if (title) {
    const size = fitSize(ctx, title, { ...type.title, size: 34 }, width - 56);
    text(ctx, title, x + 28, y + 98, { ...type.title, size });
  }
  let chars = Math.floor(progress * body.length);
  lines.forEach((line, k) => {
    if (chars > 0) text(ctx, chars >= line.length ? line : line.slice(0, chars), x + 28, y + (title ? 142 : 88) + 33 * k, style);
    chars -= line.length + 1;
  });
  ctx.restore();
  return height;
}

/** Largest size ≤ style.size (and ≥ 22) at which str fits maxWidth. */
function fitSize(ctx, str, style, maxWidth) {
  ctx.save();
  ctx.font = `${style.italic ? 'italic ' : ''}${style.weight ?? 400} ${style.size}px ${style.font}`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width <= maxWidth ? style.size : Math.max(22, Math.floor((style.size * maxWidth) / width));
}

/** Tag pill (as in the kit's card, at 15 px), vertically centred on y. Returns its width. */
export function pill(ctx, tag, x, y, accent, alpha = 1) {
  ctx.save();
  ctx.font = `500 15px ${font.mono}`;
  const width = ctx.measureText(tag).width + tag.length * 1.5 + 24;
  if (alpha > 0.003) {
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = rgba(accent, 0.16);
    roundRect(ctx, x, y - 14, width, 28, 14);
    ctx.fill();
    text(ctx, tag, x + 12, y + 1, { font: font.mono, size: 15, weight: 500, color: accent, baseline: 'middle', tracking: 1.5 });
  }
  ctx.restore();
  return width;
}

/** A dashed pill on every item the note marks as an idea. (x, y): left end, vertical centre. Returns its width. */
export function ideaTag(ctx, x, y, alpha = 1) {
  return dashedPill(ctx, 'an idea, untested', x, y, color.gold, alpha);
}

/** Stamp on any drawing that is not computed. */
export const schematicStamp = (ctx, x, y, alpha = 1) => dashedPill(ctx, 'schematic', x, y, color.muted, alpha);

function dashedPill(ctx, label, x, y, tint, alpha) {
  ctx.save();
  ctx.font = `500 15px ${font.mono}`;
  const width = ctx.measureText(label).width + 26;
  if (alpha > 0.003) {
    ctx.globalAlpha *= alpha;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y - 14, width, 28, 14);
    ctx.stroke();
    text(ctx, label, x + 13, y + 1, { font: font.mono, size: 15, weight: 500, color: tint, baseline: 'middle' });
  }
  ctx.restore();
  return width;
}

/** 'toy force field · 300 K', bottom right, whenever the water–peroxide energies drive a picture. */
export const toyStamp = (ctx, alpha = 1) => text(ctx, 'toy force field · 300 K', 1572, 890, { ...type.note, align: 'right', color: color.dim, alpha });

const SUPER = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** 2e-15 → '2 × 10⁻¹⁵'. */
export function sci(v, digits = 0) {
  if (v === 0) return '0';
  const [m, e] = Math.abs(v).toExponential(digits).split('e');
  const exponent = String(Number(e)).replace(/./g, (c) => SUPER[c]);
  return `${v < 0 ? '−' : ''}${m} × 10${exponent}`;
}

/** Compact number for readouts: 2e-16 for tiny values, fixed digits otherwise. */
const short = (v, digits = 3) => (v === 0 ? '0' : (Math.abs(v) < 1e-3 ? v.toExponential(0) : v.toFixed(digits)).replace(/^-/, '−'));

/** Mono readout 'label value'. value: number (fixed digits) or string. Returns the text width. */
export function readout(ctx, label, value, x, y, { colour = color.ink, digits = 3, size = 17, alpha = 1, align = 'left' } = {}) {
  const str = `${label} ${typeof value === 'number' ? short(value, digits) : value}`;
  text(ctx, str, x, y, { font: font.mono, size, color: colour, alpha, align });
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

/** 'net force 2e-16 · net torque 3e-16', dimmed once both are below 1e-12. */
export function drawNetReadout(ctx, x, y, { force, torque, tint = color.ink, alpha = 1, align = 'left' }) {
  const zero = Math.abs(force) < 1e-12 && Math.abs(torque) < 1e-12;
  text(ctx, `net force ${short(force)} · net torque ${short(torque)}`, x, y, { font: font.mono, size: 16, color: tint, align, alpha: alpha * (zero ? 0.6 : 1) });
}

// ---- molecules: halo, score arrows, hydrogen bonds ---------------------------------------

/**
 * Soft halo under a molecule's atoms (25 % of the tint at alpha 1). atoms: a count n (atoms 0 … n−1)
 * or a range [from, to). At small scales (thumbnails, grid cells) pass alpha up to 4 to keep it visible.
 */
export function drawHalo(ctx, cam, X, atoms, tint, { alpha = 1, radius = 0.55 } = {}) {
  if (alpha <= 0.003) return;
  const [from, to] = Array.isArray(atoms) ? atoms : [0, atoms];
  ctx.save();
  ctx.globalAlpha *= 0.25 * alpha;
  ctx.fillStyle = tint;
  ctx.filter = `blur(${Math.max(2, 0.12 * cam.scale).toFixed(1)}px)`;
  ctx.beginPath();
  for (let i = from; i < to; i++) {
    const s = cam.project([X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
    ctx.moveTo(s.x + radius * cam.scale * s.k, s.y);
    ctx.arc(s.x, s.y, radius * cam.scale * s.k, 0, 2 * Math.PI);
  }
  ctx.fill('nonzero');
  ctx.restore();
}

/**
 * An arrow with a dark outline (readable on red oxygens). dashed + hollow is the plug-in style.
 * clamped: draw a break mark near the tail (the true length is longer). The head never exceeds 0.45 of
 * the length, so short arrows stay arrows. start: leave the first `start` px out (an arrow from a bead
 * or a dot starts at its rim, and the break mark clears it).
 */
export function scoreArrow(ctx, x1, y1, x2, y2, { colour, width = 3.5, head = 13, alpha = 1, outline = true, dashed = false, hollow = false, clamped = false, start = 0 } = {}) {
  let length = Math.hypot(x2 - x1, y2 - y1);
  if (start > 0 && length > start) {
    x1 += ((x2 - x1) / length) * start;
    y1 += ((y2 - y1) / length) * start;
    length -= start;
  }
  if (length < 1.5 || alpha <= 0.003) return;
  head = Math.min(head, 0.45 * length);
  const dash = dashed ? [7, 5] : undefined;
  if (outline && !hollow) arrow(ctx, x1, y1, x2, y2, { color: OUTLINE, width: width + 2, head: head + 2, alpha, dash });
  if (hollow) {
    const ux = (x2 - x1) / length, uy = (y2 - y1) / length;
    const h = Math.min(head, length * 0.55);
    const bx = x2 - ux * h, by = y2 - uy * h;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colour;
    ctx.lineWidth = width * 0.7;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color.bg;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(bx - uy * h * 0.48, by + ux * h * 0.48);
    ctx.lineTo(bx + uy * h * 0.48, by - ux * h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    arrow(ctx, x1, y1, x2, y2, { color: colour, width, head, alpha, dash });
  }
  if (clamped) {
    const ux = (x2 - x1) / length, uy = (y2 - y1) / length;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    for (const d of [14, 21]) {
      const cx = x1 + ux * d, cy = y1 + uy * d;
      ctx.beginPath();
      ctx.moveTo(cx - uy * 8 - ux * 3, cy + ux * 8 - uy * 3);
      ctx.lineTo(cx + uy * 8 + ux * 3, cy - ux * 8 + uy * 3);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Per-atom score arrows: atom i of X gets the vector S[3i … 3i+2], drawn pxPerUnit px per unit
 * of score (in the screen plane, before perspective). Arrows longer than maxPx are clamped.
 * Returns the unclamped screen lengths.
 */
export function drawScoreArrows(ctx, cam, X, S, { colour, pxPerUnit, alpha = 1, outline = true, dashed = false, hollow = false, maxPx = 280, width = 3.5, head = 13 } = {}) {
  const lengths = [];
  for (let i = 0; i < X.length / 3; i++) {
    const p = [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
    const v = [S[3 * i], S[3 * i + 1], S[3 * i + 2]];
    const a = cam.project(p);
    const b = cam.project(vec3.add(p, vec3.scale(v, pxPerUnit / cam.scale)));
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    lengths.push(length);
    const k = length > maxPx ? maxPx / length : 1;
    scoreArrow(ctx, a.x, a.y, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, { colour, alpha, outline, dashed, hollow, clamped: k < 1, width, head });
  }
  return lengths;
}

/** Hydrogen bond: dashed orange between H and O (3D points), stopping at the atoms, with its length. alpha multiplies the context's, as drawMol's opacity does. */
export function drawHBond(ctx, cam, pH, pO, { alpha = 1, label = true } = {}) {
  if (alpha <= 0.003) return;
  const a = cam.project(pH), b = cam.project(pO);
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  if (L < 1) return;
  const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
  const ra = 0.2 * cam.scale * a.k + 4, rb = 0.29 * cam.scale * b.k + 4;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = INTER;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(a.x + ux * ra, a.y + uy * ra);
  ctx.lineTo(b.x - ux * rb, b.y - uy * rb);
  ctx.stroke();
  ctx.restore();
  if (label) {
    const d = vec3.length(vec3.sub(pO, pH));
    let nx = -uy, ny = ux;
    if (nx < 0) [nx, ny] = [-nx, -ny]; // label on the right-hand side of the bond
    text(ctx, `${d.toFixed(2)} Å`, (a.x + b.x) / 2 + nx * 12, (a.y + b.y) / 2 + ny * 12, { font: font.mono, size: 15, color: INTER, baseline: 'middle', alpha });
  }
}

// ---- symmetry devices --------------------------------------------------------------------

/**
 * Padlock: (x, y) centre of its body, size its full height. Open: the shackle lifted and swung.
 * tint is required: a padlock wears its model's colour (SCORE_W or SCORE_P), never gold.
 */
export function drawPadlock(ctx, x, y, size, { closed = true, tint, alpha = 1 } = {}) {
  if (!tint) throw new Error('drawPadlock: pass the model colour as tint');
  if (alpha <= 0.003) return;
  const w = size * 0.72, h = size * 0.5, r = w * 0.32;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = tint;
  ctx.lineWidth = Math.max(1.5, size * 0.09);
  ctx.lineCap = 'round';
  const top = y - h / 2;
  const lift = closed ? 0 : size * 0.16;
  const sx = closed ? x : x + r * 0.9;
  ctx.beginPath();
  ctx.moveTo(sx - r, top);
  ctx.lineTo(sx - r, top - h * 0.45 - lift);
  ctx.arc(sx, top - h * 0.45 - lift, r, Math.PI, 0);
  ctx.lineTo(sx + r, top - (closed ? 0 : lift));
  ctx.stroke();
  ctx.fillStyle = mix(tint, color.bg, 0.78);
  roundRect(ctx, x - w / 2, top, w, h, size * 0.08);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.arc(x, y - h * 0.06, size * 0.06, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

/**
 * A gauge choice in gold: a flag on a pole ('reference') or a small tick ('0 :=', 'upright?').
 * point: a 3D point seen through cam, or with cam = null a screen point {x, y}. side: 'right' or 'left',
 * where the label sits; labelAlpha fades the label alone (e.g. while it changes sides).
 */
export function drawGaugeFlag(ctx, cam, point, { label = 'reference', variant = 'flag', alpha = 1, side = 'right', labelAlpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  const s = cam ? cam.project(point) : point;
  const left = side === 'left';
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.fillStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  if (variant === 'flag') {
    const top = s.y - 46;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 6);
    ctx.lineTo(s.x, top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.x, top);
    ctx.lineTo(s.x + 24, top + 8);
    ctx.lineTo(s.x, top + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (label) text(ctx, label, left ? s.x - 8 : s.x + 30, top + 13, { ...type.note, color: VERTICAL, alpha: alpha * labelAlpha, align: left ? 'right' : 'left' });
    return;
  }
  ctx.beginPath();
  ctx.moveTo(s.x - 8, s.y - 22);
  ctx.lineTo(s.x - 2, s.y - 15);
  ctx.lineTo(s.x + 9, s.y - 30);
  ctx.stroke();
  ctx.restore();
  if (label) text(ctx, label, left ? s.x - 14 : s.x + 14, s.y - 20, { ...type.note, color: VERTICAL, alpha: alpha * labelAlpha, align: left ? 'right' : 'left' });
}

/**
 * Torsor carousel: a gold ring (radius in Å, about `axis` through `centre`) carrying `copies`
 * real turned copies of the shape X at `scale` size. Copy k sits at angle start + 2πk/copies in the
 * basis e1 = axis × (x̂, or ẑ if the axis is near x̂), e2 = axis × e1, so which screen end a copy
 * index lands on depends on the axis and the camera: pick indices from the returned screen positions.
 * bright: the travelling bright copy, as a (possibly fractional) copy index, or null for none, drawn
 * at brightAlpha (fade it out by lowering brightAlpha). highlight: copy indices drawn at full opacity,
 * or [index, amount] pairs to bring a copy up gradually.
 * The dim copies are drawn at dimAlpha (default 0.75, or 0.5 beside a bright copy). No copy is marked
 * until `flags` say so: [{ index, label, variant, side, alpha }]; a flag's own alpha does not dim with
 * the ring (default: the ring's alpha). caption: true, or false when two rings sit close (draw one
 * caption yourself). Returns the copies [{ p, s }] (3D and screen), with .pointAt(k) for any index.
 */
export function drawTorsorCarousel(ctx, cam, X, mol, { centre, radius, axis = [0, 1, 0], copies = 8, bright = null, brightAlpha = 1, highlight = [], dimAlpha = null, scale = 0.4, alpha = 1, flags = [], caption = true, start = 0 }) {
  const n = vec3.normalize(axis);
  const helper = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
  const e1 = vec3.normalize(vec3.cross(n, helper));
  const e2 = vec3.cross(n, e1);
  const angleOf = (k) => start + (2 * Math.PI * k) / copies;
  const pointAt = (phi) => vec3.add(centre, vec3.add(vec3.scale(e1, radius * Math.cos(phi)), vec3.scale(e2, radius * Math.sin(phi))));
  const ring = Array.from({ length: 97 }, (_, k) => pointAt((2 * Math.PI * k) / 96));
  const out = Array.from({ length: copies }, (_, k) => ({ p: pointAt(angleOf(k)), s: cam.project(pointAt(angleOf(k))) }));
  out.pointAt = (k) => pointAt(angleOf(k));
  const drawFlags = () => {
    for (const { index, alpha: own, ...o } of flags) drawGaugeFlag(ctx, cam, pointAt(angleOf(index)), { ...o, alpha: own ?? alpha });
  };
  if (alpha <= 0.003) {
    drawFlags();
    return out;
  }
  polyline3(ctx, cam, ring, { color: VERTICAL, width: 2.5, alpha: 0.75 * alpha });

  const c = centroid(X, mol.count);
  const body = Array.from(X, (v, i) => v - c[i % 3]);
  const dim = dimAlpha ?? (bright === null ? 0.75 : 0.5);
  const lift = (k) => highlight.reduce((m, h) => (Array.isArray(h) ? (h[0] === k ? Math.max(m, h[1]) : m) : h === k ? 1 : m), 0);
  const items = out.map(({ p }, k) => ({ phi: angleOf(k), p, opacity: dim + (1 - dim) * lift(k) }));
  if (bright !== null && brightAlpha > 0.003) items.push({ phi: angleOf(bright), p: pointAt(angleOf(bright)), opacity: brightAlpha });
  items.sort((a, b) => cam.project(b.p).z - cam.project(a.p).z);
  for (const { phi, p, opacity } of items) {
    const R = rotation.axisAngle(n, phi - start);
    const Y = [];
    for (let i = 0; i < mol.count; i++) Y.push(...rotation.apply(R, [body[3 * i], body[3 * i + 1], body[3 * i + 2]]));
    const s = cam.project(p);
    const mini = camera({ ...cam, cx: s.x, cy: s.y, scale: cam.scale * s.k * scale, center: [0, 0, 0] });
    drawMol(ctx, Y, mini, mol, { opacity: alpha * opacity });
  }
  drawFlags();
  if (caption) {
    const lowest = ring.reduce((m, p) => Math.max(m, cam.project(p).y), -Infinity);
    text(ctx, 'drawn: turns about one axis; SO(3) has three', cam.project(centre).x, lowest + 52, { ...type.note, align: 'center', alpha });
  }
  return out;
}

/**
 * A row of coordinate cells, grouped: cells [{ n, fill, border = fill, label, labelAlpha = 1, dim = 0 }]
 * (two cells' labels can crossfade through labelAlpha; label may also be an array of [text, alpha]).
 * pulse: a group index, an array of them, or { group, amount } (amount 0 … 1, e.g. a sine).
 */
export function coordinateBar(ctx, x, y, w, cells, { pulse = null, cellH = 34, alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  const total = cells.reduce((s, c) => s + c.n, 0);
  const step = w / total;
  const groups = pulse === null ? [] : [].concat(pulse.group ?? pulse);
  const amount = pulse?.amount ?? 1;
  let k = 0;
  ctx.save();
  ctx.globalAlpha *= alpha;
  cells.forEach((g, gi) => {
    const on = groups.includes(gi) ? amount : 0;
    const fill = mixHex(g.fill, color.dim, g.dim ?? 0);
    const border = mixHex(g.border ?? g.fill, color.dim, g.dim ?? 0);
    for (let i = 0; i < g.n; i++) {
      const cx = x + (k + i) * step;
      ctx.fillStyle = rgba(fill, 0.28 + 0.55 * on);
      roundRect(ctx, cx + 2, y, step - 4, cellH, 5);
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth = g.border ? 2.5 : 1.5;
      ctx.stroke();
    }
    const labels = Array.isArray(g.label) ? g.label : [[g.label, g.labelAlpha ?? 1]];
    for (const [str, a] of labels) if (str) text(ctx, str, x + (k + g.n / 2) * step, y + cellH + 22, { ...type.note, color: border, align: 'center', alpha: a });
    k += g.n;
  });
  ctx.restore();
}

// ---- the equation strip --------------------------------------------------------------------

const STRIP = [
  { part: tex(String.raw`\nabla\log p_t`, '∇log pₜ') },
  { part: tex('=', '=') },
  { part: tex(String.raw`s_W(x_A)`, 's_W(x_A)'), key: 'W', colour: SCORE_W, label: 'frozen' },
  { part: tex(String.raw`\oplus`, '⊕'), oplus: true },
  { part: tex(String.raw`s_P(x_B)`, 's_P(x_B)'), key: 'P', colour: SCORE_P, label: 'frozen' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla\log\rho_t`, '∇log ρₜ'), key: 'rho', colour: RESTRAINT, label: 'analytic' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla\log W_t`, '∇log Wₜ'), key: 'int', colour: INTER, label: 'learned' },
];

/**
 * The score decomposition from separate parts, each coloured term underlined and labelled.
 * (x, y): left end and baseline. highlight: 'W' | 'P' | 'rho' | 'int' (or an array); the other
 * terms drop to 35 %. Shrinks the size to fit maxWidth. terms: another list of parts in the same
 * colours ([{ part, key, colour, label, oplus }], e.g. n molecules); gap: space between parts in
 * units of size. Returns { width, size, terms: [{ key, x0, x1 }] }.
 */
export function equationStrip(ctx, x, y, { size = 30, maxWidth = 640, highlight = null, labels = true, padlocks = true, leadIn = true, oplusCaption = false, alpha = 1, terms: parts = STRIP, gap: gapUnits = 0.32 } = {}) {
  const lead = 'for molecules:';
  const leadSize = (s) => Math.max(15, Math.round(0.6 * s));
  const leadWidth = (s) => {
    if (!leadIn) return 0;
    ctx.save();
    ctx.font = `400 ${leadSize(s)}px ${font.mono}`;
    const lw = ctx.measureText(lead).width + 0.5 * s;
    ctx.restore();
    return lw;
  };
  const measure = (s) => leadWidth(s) + parts.reduce((sum, { part }) => sum + part.metrics(s).width, 0) + (parts.length - 1) * gapUnits * s;
  for (let k = 0; k < 3 && measure(size) > maxWidth; k++) size *= maxWidth / measure(size);
  const width = measure(size);
  const gap = gapUnits * size;
  const on = highlight === null ? null : [].concat(highlight);
  const dimmed = (key) => (on && !on.includes(key) ? 0.35 : 1);
  let xx = x;
  if (leadIn) {
    text(ctx, lead, xx, y, { font: font.mono, size: leadSize(size), color: color.muted, alpha: alpha * (on ? 0.35 : 1) });
    xx += leadWidth(size);
  }
  const terms = [];
  let oplusX = null;
  for (const { part, key, colour, label, oplus } of parts) {
    const a = alpha * (key ? dimmed(key) : on ? 0.35 : 1);
    const m = part.drawOnBaseline(ctx, xx, y, { size, alpha: a });
    if (oplus) oplusX = xx + m.width / 2;
    if (colour) {
      const under = y + m.depth + 7;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = colour;
      ctx.fillRect(xx, under, m.width, 4);
      ctx.restore();
      if (labels) text(ctx, label, xx + m.width / 2, under + 22, { ...type.note, color: colour, align: 'center', alpha: a });
      if (padlocks && label === 'frozen') drawPadlock(ctx, xx + m.width / 2, y - m.height + m.depth - 0.42 * size, 0.62 * size, { tint: colour, alpha: a });
      terms.push({ key, x0: xx, x1: xx + m.width });
    }
    xx += m.width + gap;
  }
  if (oplusCaption && oplusX !== null) {
    const capY = y + 0.25 * size + 7 + (labels ? 52 : 30);
    ctx.save();
    ctx.font = `400 15px ${font.mono}`;
    const cw = ctx.measureText('water’s arrows on water’s atoms, peroxide’s on peroxide’s').width;
    ctx.restore();
    const cx = Math.max(x + cw / 2, oplusX);
    text(ctx, 'water’s arrows on water’s atoms, peroxide’s on peroxide’s', cx, capY, { ...type.note, color: color.body, align: 'center', alpha });
  }
  return { width, size, terms };
}

// ---- the spring toy and the scatter panels -------------------------------------------------------

/** Planar view for two-column configurations [[x, y], …]: y up. */
export const view2d = ({ cx, cy, scale }) => ({ cx, cy, scale, project: ([x, y]) => ({ x: cx + scale * x, y: cy - scale * y }) });

const uniquePairs = (edges, k = 0) => [...new Map(edges.map(([i, j]) => [`${i + k}-${j + k}`, [i + k, j + k]])).values()];
const SPRING_A = uniquePairs(SPRINGS.edgesA);
const SPRING_B = uniquePairs(SPRINGS.edgesB, SPRINGS.nA);
const SPRING_I = uniquePairs(SPRINGS.edgesI);

function zigzag(ctx, a, b, amplitude) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const w = u > 0.15 && u < 0.85 ? Math.asin(Math.sin(((u - 0.15) / 0.7) * Math.PI * 8)) / (Math.PI / 2) : 0;
    const x = a.x + dx * u + nx * amplitude * w, y = a.y + dy * u + ny * amplitude * w;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

/**
 * Two spring molecules (beads 0–4 A in rose, 5–8 B in lime). tint: one colour for all beads.
 * ghost: thin outlines only; ghost: 'faint' a light sketch (dots and hairlines) for clouds of tens of
 * posterior draws; dashed: dashed outlines (mean configurations). interactionAlpha dims the
 * interaction springs (drawn under the beads) relative to the molecule.
 */
export function drawSpringMolecule(ctx, view, Z, { tint = null, alpha = 1, ghost = false, dashed = false, showInteraction = true, interactionAlpha = 1, radius = 11, lineWidth = 1.6 } = {}) {
  if (alpha <= 0.003) return;
  const P = Z.map((z) => view.project(z));
  const beadTint = (i) => tint ?? (i < SPRINGS.nA ? SCORE_W : SCORE_P);
  if (ghost === 'faint' || ghost === 'beads') {
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (ghost === 'faint') {
      ctx.strokeStyle = rgba(tint ?? color.muted, 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [i, j] of [...SPRING_A, ...SPRING_B]) {
        ctx.moveTo(P[i].x, P[i].y);
        ctx.lineTo(P[j].x, P[j].y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = rgba(tint ?? color.muted, 0.45);
    for (const p of P) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  const outline = ghost || dashed;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (showInteraction && interactionAlpha > 0.003) {
    ctx.save();
    ctx.globalAlpha *= interactionAlpha;
    ctx.strokeStyle = outline ? rgba(tint ?? INTER, 0.6) : INTER;
    ctx.lineWidth = outline ? 1.2 : 2;
    ctx.setLineDash([6, 5]);
    for (const [i, j] of SPRING_I) zigzag(ctx, P[i], P[j], 0);
    ctx.restore();
  }
  for (const [i, j] of [...SPRING_A, ...SPRING_B]) {
    ctx.strokeStyle = outline ? rgba(beadTint(i), 0.55) : color.dim;
    ctx.lineWidth = outline ? 1.2 : 2;
    if (dashed) ctx.setLineDash([5, 4]);
    zigzag(ctx, P[i], P[j], outline ? 0 : 4);
    ctx.setLineDash([]);
  }
  P.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    if (outline) {
      ctx.strokeStyle = beadTint(i);
      ctx.lineWidth = lineWidth;
      if (dashed) ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const g = ctx.createRadialGradient(p.x - radius * 0.35, p.y - radius * 0.4, radius * 0.1, p.x, p.y, radius);
      g.addColorStop(0, mix(beadTint(i), '#ffffff', 0.55));
      g.addColorStop(0.55, beadTint(i));
      g.addColorStop(1, mix(beadTint(i), '#000000', 0.5));
      ctx.fillStyle = g;
      ctx.fill();
    }
  });
  ctx.restore();
}

/**
 * The restraint between two centres (screen points): a khaki dashed zigzag, about one tooth per
 * toothPx, with a dark underlay so it reads over atoms.
 */
export function drawRestraint(ctx, a, b, { alpha = 1, amplitude = 6, toothPx = 10, width = 2.5 } = {}) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
  if (L < 4 || alpha <= 0.003) return;
  const nx = -dy / L, ny = dx / L, teeth = Math.max(3, Math.round(L / toothPx));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  for (let i = 1; i < 2 * teeth; i++) {
    const u = i / (2 * teeth), w = i % 2 ? amplitude : -amplitude;
    ctx.lineTo(a.x + dx * u + nx * w, a.y + dy * u + ny * w);
  }
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = 'rgba(5,8,15,0.7)';
  ctx.lineWidth = width + 3;
  ctx.stroke();
  ctx.strokeStyle = RESTRAINT;
  ctx.lineWidth = width;
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.restore();
}

/**
 * Scatter of 2D points with axes through the middle. extent: half-width in data units
 * (default: from the points). Prints the title above, 'corr = …' inside the emptiest corner, xLabel
 * under the right end and yLabel up the left side, outside the panel.
 */
export function scatterPanel(ctx, { x, y, w, h, points, corr = null, title, xLabel, yLabel, extent = null, tint = color.body, alpha = 1 }) {
  if (alpha <= 0.003) return;
  const E = extent ?? 1.1 * Math.max(...points.flat().map(Math.abs));
  const px = (u) => x + w / 2 + (u / E) * (w / 2), py = (v) => y + h / 2 - (v / E) * (h / 2);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
  ctx.fillStyle = rgba(tint, 0.55);
  for (const [u, v] of points) {
    if (Math.abs(u) > E || Math.abs(v) > E) continue;
    ctx.beginPath();
    ctx.arc(px(u), py(v), 2.2, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
  if (title) text(ctx, title, x, y - 14, { font: font.sans, size: 18, weight: 500, color: color.ink, alpha });
  if (corr !== null) {
    // the corner with the fewest points
    const corners = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([su, sv]) => ({ su, sv, n: points.filter(([u, v]) => u * su > 0.35 * E && v * sv > 0.45 * E).length }));
    const { su, sv } = corners.reduce((m, c) => (c.n < m.n ? c : m));
    text(ctx, `corr = ${corr.toFixed(2).replace('-', '−')}`, su > 0 ? x + w - 10 : x + 10, sv > 0 ? y + 24 : y + h - 12, { font: font.mono, size: 17, color: color.ink, align: su > 0 ? 'right' : 'left', alpha });
  }
  if (xLabel) text(ctx, xLabel, x + w, y + h + 22, { ...type.note, align: 'right', alpha });
  if (yLabel) {
    ctx.save();
    ctx.translate(x - 10, y + h / 2);
    ctx.rotate(-Math.PI / 2);
    text(ctx, yLabel, 0, 0, { ...type.note, align: 'center', alpha });
    ctx.restore();
  }
}

/**
 * A frame (three orthonormal axes, the columns of F) in gold, from a 3D origin, with labels e₁ e₂ e₃
 * past the tips: a gauge, so gold (the kit's drawAxisTriad uses axis colours and cannot turn).
 */
export function drawFrame(ctx, cam, origin, F, length, { alpha = 1, labels = ['e₁', 'e₂', 'e₃'], size = 17 } = {}) {
  if (alpha <= 0.003) return;
  labels.forEach((name, k) => {
    const axis = [F[0][k], F[1][k], F[2][k]];
    const tip = arrow3(ctx, cam, origin, vec3.scale(axis, length), { color: VERTICAL, width: k === 0 ? 3.5 : 3, head: 13, alpha });
    if (!name) return;
    const o = cam.project(origin), dx = tip.x - o.x, dy = tip.y - o.y, L = Math.hypot(dx, dy) || 1;
    text(ctx, name, tip.x + (dx / L) * 16, tip.y + (dy / L) * 16, { font: font.mono, size, color: VERTICAL, align: 'center', baseline: 'middle', alpha });
  });
}
