// The simplex of attention patterns over three keys, drawn as a triangle (scenes 08 and 09).
// A pattern a = (a₁, a₂, a₃) with Σ a_j = 1 is the point a₁ V₁ + a₂ V₂ + a₃ V₃; the vertices are the
// pure patterns, the barycentre the even one. Everything here is a pure drawing device over math.js.

import { color, font, text, dot, ring, line, rgba, roundRect } from '../../../src/kit.js';
import { KEY, TRIO_KEYS, TRIO_LABELS, M } from './shared.js';
import { contours, scores, matTVec } from './math.js';

/** Stage positions of the three vertices: x₁ bottom left, x₃ bottom right, x₅ at the top. */
export const VERTICES = Object.freeze([[125, 790], [735, 790], [430, 262]]);
export const BARYCENTRE = [1 / 3, 1 / 3, 1 / 3];

/** The point of the triangle that the weight vector a stands for. */
export const toStage = (a) => [a[0] * VERTICES[0][0] + a[1] * VERTICES[1][0] + a[2] * VERTICES[2][0], a[0] * VERTICES[0][1] + a[1] * VERTICES[1][1] + a[2] * VERTICES[2][1]];

/** The scores ⟨Mᵀ q, x_j⟩ of a query q against the three keys. */
export const trioScores = (q) => scores(matTVec(M, q), TRIO_KEYS);

/** The triangle, its vertex labels and the barycentre. */
export function drawTriangle(ctx, { alpha = 1, labels = TRIO_LABELS, barycentre = 1, edgeAlpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  VERTICES.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = rgba(KEY, 0.06);
  ctx.fill();
  ctx.strokeStyle = rgba(KEY, 0.9 * edgeAlpha);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const offsets = [[-14, 30], [14, 30], [16, 8]];
  const aligns = ['right', 'left', 'left'];
  VERTICES.forEach(([x, y], i) => {
    dot(ctx, x, y, 6, KEY);
    text(ctx, labels[i], x + offsets[i][0], y + offsets[i][1], { font: font.display, italic: true, size: 22, color: KEY, align: aligns[i] });
    text(ctx, 'all weight on', x + offsets[i][0], y + offsets[i][1] + 20, { font: font.mono, size: 12, color: color.muted, align: aligns[i] });
  });
  if (barycentre > 0.003) {
    const [bx, by] = toStage(BARYCENTRE);
    ring(ctx, bx, by, 5, color.muted, barycentre, 1.5);
    text(ctx, '⅓, ⅓, ⅓', bx + 10, by + 22, { font: font.mono, size: 13, color: color.muted, alpha: barycentre });
  }
  ctx.restore();
}

/** Clip everything drawn by `fn` to the triangle. */
export function clippedToTriangle(ctx, fn) {
  ctx.save();
  ctx.beginPath();
  VERTICES.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  fn();
  ctx.restore();
}

/** A path through weight vectors. progress: draw only the first part. */
export function drawSimplexPath(ctx, patterns, { colour = color.ink, alpha = 1, width = 2.5, dash = [], progress = 1 } = {}) {
  if (alpha <= 0.003 || patterns.length < 2) return;
  const last = Math.max(1, Math.round((patterns.length - 1) * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= last; i++) {
    const [x, y] = toStage(patterns[i]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/** One pattern as a marker. */
export function drawPattern(ctx, a, { colour = color.ink, alpha = 1, r = 7, label = '', labelOffset = [12, -10], halo = false } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = toStage(a);
  if (halo) ring(ctx, x, y, r + 6, colour, 0.8 * alpha, 2);
  dot(ctx, x, y, r, colour, alpha);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: colour, alpha });
}

// level lines of the Shannon entropy over the triangle, computed once: the entropy is extended
// continuously outside the triangle (H of the absolute values), and the drawing is clipped to it
const LEVELS = [0.3, 0.6, 0.8, 0.95, 1.05];
let entropyLines = null;
function entropySegments() {
  if (entropyLines) return entropyLines;
  const H = (b) => -b.reduce((s, v) => s + (Math.abs(v) > 1e-12 ? Math.abs(v) * Math.log(Math.abs(v)) : 0), 0);
  const bary = (u, v) => {
    const b1 = 0.5 + 0.65 * u;
    const b2 = 0.5 + 0.65 * v;
    return [b1, b2, 1 - b1 - b2];
  };
  const lines = contours((u, v) => H(bary(u, v)), LEVELS, { extent: 1, n: 140 });
  entropyLines = lines.map((segments) => segments.map(([p, q]) => [toStage(bary(...p)), toStage(bary(...q))]));
  return entropyLines;
}

/** Level lines of H(a) on the triangle, with the value of the outermost ones labelled. */
export function drawEntropyLevels(ctx, { alpha = 1, colour = color.muted, width = 1.2 } = {}) {
  if (alpha <= 0.003) return;
  const lines = entropySegments();
  clippedToTriangle(ctx, () => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (const segments of lines) for (const [[x1, y1], [x2, y2]] of segments) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.restore();
  });
  // labels inside the triangle, where each level line crosses the ray from the barycentre towards the right edge
  const [bx, by] = toStage(BARYCENTRE);
  const [mx, my] = VERTICES[1]; // towards the x₃ vertex, where H falls from ln 3 to 0
  const dir = [mx - bx, my - by];
  const len = Math.hypot(...dir);
  const ray = [dir[0] / len, dir[1] / len];
  LEVELS.forEach((level, k) => {
    let best = null;
    let bestOff = Infinity;
    for (const seg of lines[k]) for (const [x, y] of seg) {
      const along = (x - bx) * ray[0] + (y - by) * ray[1];
      const off = Math.abs(-(x - bx) * ray[1] + (y - by) * ray[0]);
      if (along > 0 && along < len && off < bestOff) {
        bestOff = off;
        best = [x, y];
      }
    }
    if (best) text(ctx, level.toFixed(2), best[0] + 6, best[1] - 6, { font: font.mono, size: 12, color: colour, alpha });
  });
}

/** Three weights as horizontal bars; a weight that is exactly zero prints as '0'. Returns the height used. */
export function drawBars(ctx, { x, y, values, labels = TRIO_LABELS, colour = KEY, alpha = 1, title = '', width = 150, rowHeight = 24, titleColour = colour }) {
  if (alpha <= 0.003) return values.length * rowHeight;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (title) text(ctx, title, x, y - 12, { font: font.mono, size: 14, color: titleColour });
  values.forEach((v, j) => {
    const yy = y + j * rowHeight;
    text(ctx, labels[j], x, yy + 6, { font: font.display, italic: true, size: 17, color: KEY });
    const w = Math.max(v === 0 ? 0 : 2, v * width);
    ctx.fillStyle = rgba(colour, v === 0 ? 0.25 : 0.7);
    roundRect(ctx, x + 34, yy - 7, Math.max(w, 1.5), 15, 3);
    ctx.fill();
    text(ctx, v === 0 ? '0' : v.toFixed(3), x + 42 + width, yy + 5, { font: font.mono, size: 14, color: v === 0 ? colour : color.body });
  });
  ctx.restore();
  return values.length * rowHeight;
}

/** Axis box of a small plot. */
export function plotAxes(ctx, { x, y, w, h, alpha = 1 }) {
  if (alpha <= 0.003) return;
  line(ctx, x, y, x, y + h, { color: color.dim, alpha });
  line(ctx, x, y + h, x + w, y + h, { color: color.dim, alpha });
}
