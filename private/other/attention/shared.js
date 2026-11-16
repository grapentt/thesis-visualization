// Palette, the running example and the recurring drawing devices of "The geometry of attention".
//
// One meaning per colour, everywhere: gold the query and its natural parameter θ, soft blue the
// keys, orange the attended context η (the output), green the symmetric part S of the form, rose
// the antisymmetric part A (and everything it causes: direction, circulation), lavender the
// information geometry (Fisher metric, KL, entropy), blue the positions of the sequence.
//
// The running example: a residual stream of dimension d = 2, so the whole space can be drawn, with
// seven keys x₁ … x₇ and one bilinear form M = S + A whose symmetric part is indefinite. Everything
// shown is computed from these numbers.

import { color, type, font, rgba, text, arrow, line, dot, ring, roundRect, formatNumber, lin } from '../../../src/kit.js';
import { contours, convexHull, matVec, symmetricPart, antisymmetricPart, eigen2, dot as dot2 } from './math.js';

export const QUERY = color.gold;
export const KEY = color.soft;
export const CONTEXT = color.stiff;
export const SYM = '#86d08f';
export const ANTI = '#f497c0';
export const INFO = '#c39bf5';
export const POSITION = '#7ea6f2';
export const VALUE = '#e0c8a0';

export const EYEBROW = 'THE GEOMETRY OF ATTENTION';
/** A scene header: eyebrow 'NN · NAME' and the title. */
export const header = (n, name, title) => ({ eyebrow: `${String(n).padStart(2, '0')} · ${name}`, title });

// ---- the running example -------------------------------------------------------------------

/** Seven keys in the residual stream ℝ², around the origin (all seven are vertices of their convex hull). */
export const KEYS = Object.freeze([
  [1.5, 0.6],
  [0.9, 1.45],
  [-0.65, 1.5],
  [-1.55, 0.35],
  [-1.1, -1.15],
  [0.25, -1.55],
  [1.3, -0.9],
].map(Object.freeze));
export const KEY_LABELS = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆', 'x₇'];

/** The form M = W_Qᵀ W_K / √d_k of one head, M = S + A with S indefinite (eigenvalues 0.97 and −0.47). */
export const M = Object.freeze([[0.9, 0.8], [-0.2, -0.4]].map(Object.freeze));
export const S = symmetricPart(M);
export const A = antisymmetricPart(M);
export const S_EIGEN = eigen2(S);

/** Three of the keys, for the simplex scenes. */
export const TRIO = [0, 2, 4];
export const TRIO_KEYS = TRIO.map((i) => KEYS[i]);
export const TRIO_LABELS = TRIO.map((i) => KEY_LABELS[i]);

/** The query's standard tour: a loop around the origin, radius 1.2, one lap per `period` seconds. */
export const queryAt = (t, { period = 20, radius = 1.2, phase = 0.4 } = {}) => {
  const w = phase + (2 * Math.PI * t) / period;
  return [radius * Math.cos(w), radius * Math.sin(w) * 0.9];
};

/** Eased keyframes: [time, value] pairs, eased between keys (as seg()). */
export const track = (t, keys, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [t1, v1] = keys[k];
    if (t <= t1) return keys[k - 1][1] + (v1 - keys[k - 1][1]) * ease(lin(t, keys[k - 1][0], t1));
  }
  return keys[keys.length - 1][1];
};

// ---- the plane: a chart of the residual stream ------------------------------------------------

/** The usual left-hand chart: a square of 620 px showing [−2.3, 2.3]². */
export const CHART = Object.freeze({ x: 90, y: 190, size: 620, extent: 2.3 });

/**
 * A chart maps world coordinates (u, v) to stage coordinates. P.X(u), P.Y(v); P.point([u, v]) → [x, y];
 * P.k is pixels per unit; P.cx, P.cy its centre.
 */
export function chart(o = {}) {
  const c = { ...CHART, ...o };
  const k = c.size / (2 * c.extent);
  const cx = c.x + c.size / 2;
  const cy = c.y + c.size / 2;
  return {
    ...c,
    k,
    cx,
    cy,
    X: (u) => cx + u * k,
    Y: (v) => cy - v * k,
    point: ([u, v]) => [cx + u * k, cy - v * k],
    inside: ([u, v]) => Math.abs(u) <= c.extent && Math.abs(v) <= c.extent,
  };
}

/** Clip everything drawn by `fn` to the chart's square. */
export function clipped(ctx, P, fn) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(P.x, P.y, P.size, P.size);
  ctx.clip();
  fn();
  ctx.restore();
}

/** Grid every unit, the two axes through the origin, and the axis names. */
export function drawPlane(ctx, P, { alpha = 1, names = ['x₁', 'x₂'], grid = true, caption = null } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const n = Math.floor(P.extent);
  if (grid) {
    for (let i = -n; i <= n; i++) {
      line(ctx, P.X(i), P.y, P.X(i), P.y + P.size, { color: color.grid, width: 1 });
      line(ctx, P.x, P.Y(i), P.x + P.size, P.Y(i), { color: color.grid, width: 1 });
    }
  }
  line(ctx, P.x, P.cy, P.x + P.size, P.cy, { color: color.line, width: 1.5 });
  line(ctx, P.cx, P.y, P.cx, P.y + P.size, { color: color.line, width: 1.5 });
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(P.x, P.y, P.size, P.size);
  text(ctx, names[0], P.x + P.size - 8, P.cy - 10, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right' });
  text(ctx, names[1], P.cx + 10, P.y + 24, { font: font.display, italic: true, size: 20, color: color.muted });
  if (caption) text(ctx, caption, P.x, P.y + P.size + 28, { ...type.note });
  ctx.restore();
}

/** A token: a dot with a label beside it. */
export function drawToken(ctx, P, p, { colour = KEY, alpha = 1, label = '', r = 7, labelOffset = [12, -10], halo = 0, dim = 1 } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = P.point(p);
  if (halo > 0.003) {
    ctx.save();
    ctx.globalAlpha *= alpha * 0.35 * halo;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, r + 9, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  dot(ctx, x, y, r, colour, alpha * dim);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 20, color: colour, alpha: alpha * dim });
}

/** All keys of the running example (or the given points). weights: optional, scales each dot and its brightness. */
export function drawKeys(ctx, P, { points = KEYS, labels = KEY_LABELS, alpha = 1, weights = null, colour = KEY, labelled = true } = {}) {
  points.forEach((p, j) => {
    const w = weights ? weights[j] : null;
    drawToken(ctx, P, p, {
      colour,
      alpha,
      label: labelled ? labels[j] : '',
      r: w === null ? 7 : 5 + 16 * Math.sqrt(w),
      halo: w === null ? 0 : w,
      dim: w === null ? 1 : 0.45 + 0.55 * Math.min(1, 3 * w),
    });
  });
}

/** Arrow from `from` to `to` in world coordinates. */
export function drawVector(ctx, P, from, to, { colour = color.ink, alpha = 1, width = 3, head = 12, label = '', dash, labelShift = [10, -8] } = {}) {
  if (alpha <= 0.003) return;
  const [x1, y1] = P.point(from);
  const [x2, y2] = P.point(to);
  arrow(ctx, x1, y1, x2, y2, { color: colour, width, head, alpha, dash });
  if (label) text(ctx, label, x2 + labelShift[0], y2 + labelShift[1], { font: font.display, italic: true, size: 22, color: colour, alpha });
}

/** The convex hull of the points, as a filled polygon with an outline. */
export function drawHull(ctx, P, points, { fill = KEY, stroke = KEY, alpha = 1, fillAlpha = 0.08, dash = [] } = {}) {
  if (alpha <= 0.003) return;
  const hull = convexHull(points);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  hull.forEach((p, i) => {
    const [x, y] = P.point(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = rgba(fill, fillAlpha);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

/** A polyline through world points. */
export function drawPath(ctx, P, points, { colour = color.ink, alpha = 1, width = 2, dash = [], close = false, fill = null } = {}) {
  if (alpha <= 0.003 || points.length < 2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  points.forEach((p, i) => {
    const [x, y] = P.point(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  if (close) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

/**
 * Level lines of f(u, v) over the chart. levels: the values; one colour, or colour(level).
 * Positive and negative levels can be told apart by `dashNegative`.
 */
export function drawContours(ctx, P, f, levels, { colour = color.muted, alpha = 1, width = 1.5, dashNegative = false, n = 70, labels = null } = {}) {
  if (alpha <= 0.003) return;
  const lines = contours(f, levels, { extent: P.extent, n });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round';
  lines.forEach((segments, k) => {
    ctx.strokeStyle = typeof colour === 'function' ? colour(levels[k]) : colour;
    ctx.lineWidth = width;
    ctx.setLineDash(dashNegative && levels[k] < 0 ? [6, 6] : []);
    ctx.beginPath();
    for (const [a, b] of segments) {
      const [x1, y1] = P.point(a);
      const [x2, y2] = P.point(b);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    if (labels && segments.length) {
      // label at the segment nearest the chart's right edge
      const best = segments.reduce((m, s) => (s[0][0] > m[0][0] ? s : m), segments[0]);
      const [x, y] = P.point(best[0]);
      text(ctx, labels(levels[k]), x + 6, y - 6, { font: font.mono, size: 13, color: typeof colour === 'function' ? colour(levels[k]) : colour });
    }
  });
  ctx.restore();
}

// ---- heatmaps, cached ------------------------------------------------------------------------

const images = new Map();
/**
 * An image of f(u, v) over [−extent, extent]², `size` px wide, coloured by ramp(x) for x ∈ [0, 1]
 * where x = (f − lo) / (hi − lo). Cached under `id` (compute once per id).
 */
export function heatmapImage(id, f, { extent = CHART.extent, size = 180, lo = 0, hi = 1, ramp = defaultRamp } = {}) {
  if (images.has(id)) return images.get(id);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const image = g.createImageData(size, size);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const u = -extent + (2 * extent * (i + 0.5)) / size;
      const v = extent - (2 * extent * (j + 0.5)) / size;
      const x = Math.max(0, Math.min(1, (f(u, v) - lo) / (hi - lo)));
      const [r, gg, b] = ramp(x);
      const o = (j * size + i) * 4;
      image.data[o] = r;
      image.data[o + 1] = gg;
      image.data[o + 2] = b;
      image.data[o + 3] = 255;
    }
  }
  g.putImageData(image, 0, 0);
  images.set(id, canvas);
  return canvas;
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RAMP = [[0, '#0d1321'], [0.35, '#1b3350'], [0.65, '#2a6f82'], [0.85, '#6db0a6'], [1, '#f0d27a']].map(([s, h]) => [s, hex(h)]);
/** Dark → teal → gold. */
export function defaultRamp(x) {
  for (let k = 1; k < RAMP.length; k++) {
    if (x <= RAMP[k][0]) {
      const u = (x - RAMP[k - 1][0]) / (RAMP[k][0] - RAMP[k - 1][0]);
      return RAMP[k - 1][1].map((v, i) => v + (RAMP[k][1][i] - v) * u);
    }
  }
  return RAMP[RAMP.length - 1][1];
}
/** A ramp through a single colour: dark → the colour. */
export const tintRamp = (tint) => {
  const c = hex(tint);
  const bg = hex(color.bg);
  return (x) => bg.map((v, i) => v + (c[i] - v) * x);
};

/** Draw a heatmap image over the chart. */
export function drawHeatmap(ctx, P, image, alpha = 1) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, P.x, P.y, P.size, P.size);
  ctx.restore();
}

// ---- matrices, bars and readouts -------------------------------------------------------------

/**
 * A 2 × 2 matrix with brackets, centred on (cx, cy). label: drawn to the left (e.g. 'M ='). cells:
 * optional colour per entry [[c, c], [c, c]]; highlight: 0 … 1 glow on the whole matrix.
 */
export function matrix2(ctx, cx, cy, Mat, { label = '', colour = color.ink, cells = null, alpha = 1, size = 24, digits = 2, labelColour = colour } = {}) {
  if (alpha <= 0.003) return;
  const w = size * 3.6;
  const h = size * 1.6;
  const left = cx - w;
  const top = cy - h;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  for (const [x, dir] of [[left - 10, 1], [cx + w + 10, -1]]) {
    ctx.beginPath();
    ctx.moveTo(x + dir * 9, top - 4);
    ctx.lineTo(x, top - 4);
    ctx.lineTo(x, cy + h + 4);
    ctx.lineTo(x + dir * 9, cy + h + 4);
    ctx.stroke();
  }
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const v = Mat[i][j];
      const s = typeof v === 'string' ? v : formatNumber(v, digits);
      text(ctx, s, cx - w / 2 + j * w, cy - h / 2 + i * h, { font: font.mono, size, color: cells ? cells[i][j] : colour, align: 'center', baseline: 'middle' });
    }
  }
  if (label) text(ctx, label, left - 24, cy, { font: font.display, italic: true, size: size + 4, color: labelColour, align: 'right', baseline: 'middle' });
  ctx.restore();
  return { left: left - 10, right: cx + w + 10, top: top - 4, bottom: cy + h + 4 };
}

/** A 2 × 2 matrix whose entries are themselves TeX-like strings is just matrix2 with strings. */

/**
 * Horizontal bars of the attention weights (or any values in [0, max]), one row per key, labelled
 * on the left, the value on the right. Returns the height used.
 */
export function weightBars(ctx, { x, y, width = 240, rowHeight = 30, values, labels, colour = KEY, alpha = 1, max = 1, digits = 2, title = '', highlight = -1, barColour = null }) {
  if (alpha <= 0.003) return values.length * rowHeight;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (title) text(ctx, title, x, y - 14, { ...type.note, color: colour });
  values.forEach((v, j) => {
    const yy = y + j * rowHeight;
    const w = Math.max(2, (Math.min(v, max) / max) * (width - 110));
    text(ctx, labels[j], x, yy + 7, { font: font.display, italic: true, size: 19, color: colour });
    ctx.fillStyle = rgba(typeof barColour === 'function' ? barColour(j) : barColour ?? colour, j === highlight ? 0.95 : 0.55);
    roundRect(ctx, x + 40, yy - 8, w, 18, 4);
    ctx.fill();
    text(ctx, formatNumber(v, digits), x + 48 + w, yy + 6, { font: font.mono, size: 15, color: color.body });
  });
  ctx.restore();
  return values.length * rowHeight;
}

/** 'label value' in mono, value formatted; returns the width. */
export function readout(ctx, label, value, x, y, { colour = color.ink, digits = 2, size = 17, alpha = 1, align = 'left' } = {}) {
  const str = `${label} ${typeof value === 'number' ? formatNumber(value, digits) : value}`;
  text(ctx, str, x, y, { font: font.mono, size, color: colour, alpha, align });
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

/** 'd = 2 · seven keys · everything computed', bottom right. */
export const exampleStamp = (ctx, alpha = 1, note = 'd = 2 · seven keys · everything on screen is computed') =>
  text(ctx, note, 1572, 890, { ...type.note, align: 'right', color: color.dim, alpha });

/** A caption centred over the chart. */
export const chartCaption = (ctx, P, s, alpha, style = {}) => text(ctx, s, P.cx, P.y - 16, { ...type.note, color: color.body, align: 'center', alpha, ...style });

/** A rounded panel (for a small inset plot). */
export function panel(ctx, x, y, w, h, { alpha = 1, stroke = color.line } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(17,24,40,0.85)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

/** Pill tag (as in the kit's cards). Returns its width. */
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

/** A small circle marker with a ring, for the query. */
export function drawQuery(ctx, P, q, { alpha = 1, label = 'x_i', labelOffset = [12, -12] } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = P.point(q);
  dot(ctx, x, y, 8, QUERY, alpha);
  ring(ctx, x, y, 13, QUERY, alpha * 0.8, 2);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: QUERY, alpha });
}

/** Signed level set helpers for the form: the value of a quadratic form at (u, v). */
export const quadratic = (Mat) => (u, v) => dot2([u, v], matVec(Mat, [u, v]));
