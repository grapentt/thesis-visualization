// Palette, the running examples and the recurring drawing devices of "The geometry of information".
//
// One meaning per colour, everywhere: gold the first distribution p (and the point that moves),
// soft blue the second distribution q, lavender the Fisher metric and everything it produces
// (balls, geodesics, distances, the natural gradient), orange the mixture (m-) geometry, green the
// exponential (e-) geometry, rose the Kullback–Leibler divergence, and the plain body colour for data.
//
// The running examples: coins with bias p (n = 100 flips), three-sided dice (the simplex, drawn as a
// triangle and as the octant of a sphere), and Gaussians N(μ, σ²) (the upper half-plane). Everything
// shown is computed from math.js.

import { defineScene, color, type, font, rgba, text, line, dot, ring, roundRect, formatNumber, lin } from '../../../src/kit.js';

export const P_COL = color.gold;
export const Q_COL = color.soft;
export const METRIC = '#c39bf5';
export const MIX = color.stiff;
export const EXP = '#86d08f';
export const KL_COL = '#f497c0';
export const DATA = color.body;

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

/**
 * The same scene with its clock stretched by k: duration, narration cues, beats, hand-overs and
 * control keyframes are k times later, and the frame at time t is the original frame at t / k.
 * Used to give the narration room without re-timing the choreography.
 */
export function paced(scene, k) {
  if (!(k > 0) || Math.abs(k - 1) < 1e-9) return scene;
  const stretch = (c) => (c.kind !== 'drag' && Array.isArray(c.value) ? { ...c, value: c.value.map(([time, v]) => [time * k, v]) } : c);
  return defineScene({
    ...scene,
    duration: scene.duration * k,
    narration: Array.isArray(scene.narration) ? scene.narration.map(([time, line]) => [time * k, line]) : scene.narration,
    beats: scene.beats.map(([time, name]) => [time * k, name]),
    handovers: scene.handovers.map((h) => ({ ...h, at: h.at * k })),
    exploreFrom: scene.exploreFrom * k,
    controls: scene.controls ? Object.fromEntries(Object.entries(scene.controls).map(([name, c]) => [name, stretch(c)])) : undefined,
    draw: (ctx, t, live) => scene.draw(ctx, t / k, live),
  });
}

// ---- frames: a rectangle of the stage showing a rectangle of the plane ---------------------------

/**
 * A frame maps plane coordinates (u, v) ∈ [u0, u1] × [v0, v1] to the stage rectangle x, y, w, h
 * (v up). F.X(u), F.Y(v), F.point([u, v]), F.inside([u, v]).
 */
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

/** Clip everything drawn by `fn` to the frame's rectangle (with a little slack). */
export function clipped(ctx, F, fn, slack = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(F.x - slack, F.y - slack, F.w + 2 * slack, F.h + 2 * slack);
  ctx.clip();
  fn();
  ctx.restore();
}

/**
 * Left and bottom axes of a frame with ticks. xTicks / yTicks: values; xLabel / yLabel: names at the
 * ends; grid: draw faint grid lines through the ticks.
 */
export function axes(ctx, F, { xTicks = [], yTicks = [], xLabel = '', yLabel = '', grid = false, alpha = 1, format = (v) => String(v), formatY = format, box = false } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (grid) {
    for (const u of xTicks) line(ctx, F.X(u), F.y, F.X(u), F.y + F.h, { color: color.grid, width: 1 });
    for (const v of yTicks) line(ctx, F.x, F.Y(v), F.x + F.w, F.Y(v), { color: color.grid, width: 1 });
  }
  line(ctx, F.x, F.y, F.x, F.y + F.h, { color: color.line, width: 1.5 });
  line(ctx, F.x, F.y + F.h, F.x + F.w, F.y + F.h, { color: color.line, width: 1.5 });
  if (box) {
    line(ctx, F.x + F.w, F.y, F.x + F.w, F.y + F.h, { color: color.line, width: 1.5 });
    line(ctx, F.x, F.y, F.x + F.w, F.y, { color: color.line, width: 1.5 });
  }
  for (const u of xTicks) {
    line(ctx, F.X(u), F.y + F.h, F.X(u), F.y + F.h + 6, { color: color.line });
    text(ctx, format(u), F.X(u), F.y + F.h + 24, { font: font.mono, size: 14, color: color.muted, align: 'center' });
  }
  for (const v of yTicks) {
    line(ctx, F.x - 6, F.Y(v), F.x, F.Y(v), { color: color.line });
    text(ctx, formatY(v), F.x - 10, F.Y(v) + 5, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  }
  if (xLabel) text(ctx, xLabel, F.x + F.w, F.y + F.h + 46, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right' });
  if (yLabel) text(ctx, yLabel, F.x - 12, F.y + 8, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right' });
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

/** A marked point of the plane, with an optional label. */
export function drawPoint(ctx, F, p, { colour = color.ink, alpha = 1, r = 7, label = '', labelOffset = [12, -10], halo = 0, ringed = false } = {}) {
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
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: colour, alpha });
}

/** The graph of f(u) over [u0, u1] in a frame, optionally filled down to the baseline v = 0. */
export function drawCurve(ctx, F, f, { colour = color.ink, alpha = 1, width = 2.5, fill = null, n = 200, u = F.u, dash = [], progress = 1 } = {}) {
  if (alpha <= 0.003) return;
  const last = Math.max(1, Math.round(n * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  const pts = [];
  for (let i = 0; i <= last; i++) {
    const uu = u[0] + ((u[1] - u[0]) * i) / n;
    pts.push(F.point([uu, f(uu)]));
  }
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], F.Y(0));
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1][0], F.Y(0));
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
}

/** A probability mass function as thin bars over the integers k, in a frame whose u-axis counts k. */
export function drawPmf(ctx, F, pmf, { colour = DATA, alpha = 1, width = null, from = 0, to = pmf.length - 1 } = {}) {
  if (alpha <= 0.003) return;
  const bw = width ?? Math.max(1.5, F.kx * 0.8);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = colour;
  for (let k = Math.max(0, from); k <= Math.min(pmf.length - 1, to); k++) {
    const x = F.X(k);
    const y = F.Y(pmf[k]);
    if (F.Y(0) - y < 0.3) continue;
    ctx.fillRect(x - bw / 2, y, bw, F.Y(0) - y);
  }
  ctx.restore();
}

/** Outcome probabilities as a few labelled vertical bars, inside a box. Returns nothing. */
export function drawOutcomeBars(ctx, { x, y, w, h, values, labels, colours, alpha = 1, max = 1, title = '', digits = 2 }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (title) text(ctx, title, x, y - 12, { ...type.note, color: color.muted });
  line(ctx, x, y + h, x + w, y + h, { color: color.line });
  const n = values.length;
  const slot = w / n;
  values.forEach((v, i) => {
    const bw = slot * 0.56;
    const bx = x + slot * (i + 0.5) - bw / 2;
    const bh = (Math.max(0, v) / max) * h;
    const c = Array.isArray(colours) ? colours[i] : colours;
    ctx.fillStyle = rgba(c, 0.75);
    roundRect(ctx, bx, y + h - bh, bw, bh, 3);
    ctx.fill();
    text(ctx, labels[i], x + slot * (i + 0.5), y + h + 20, { font: font.mono, size: 14, color: color.muted, align: 'center' });
    text(ctx, fmt(v, digits), x + slot * (i + 0.5), y + h - bh - 8, { font: font.mono, size: 13, color: c, align: 'center' });
  });
  ctx.restore();
}

// ---- the triangle: the simplex of three-sided dice --------------------------------------------

/** A triangle of side `size` with its base at (x, y + height): vertices e₁ bottom left, e₂ bottom right, e₃ top. */
export function triangle({ x, y, size }) {
  const hgt = (size * Math.sqrt(3)) / 2;
  const V = [
    [x, y + hgt],
    [x + size, y + hgt],
    [x + size / 2, y],
  ];
  return {
    x, y, size, height: hgt, V,
    centre: [x + size / 2, y + (2 * hgt) / 3],
    /** The stage point of the distribution p = (p₁, p₂, p₃). */
    point: (p) => [p[0] * V[0][0] + p[1] * V[1][0] + p[2] * V[2][0], p[0] * V[0][1] + p[1] * V[1][1] + p[2] * V[2][1]],
  };
}

/** The triangle, its vertex labels ('all on 1' …) and the barycentre. */
export function drawTriangle(ctx, T, { alpha = 1, labels = ['e₁', 'e₂', 'e₃'], sublabels = true, barycentre = 1, fill = 0.06, edge = color.line, labelColour = color.muted } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  T.V.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = rgba(Q_COL, fill);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const offsets = [[-12, 30], [12, 30], [14, 6]];
  const aligns = ['right', 'left', 'left'];
  T.V.forEach(([x, y], i) => {
    dot(ctx, x, y, 5, labelColour);
    text(ctx, labels[i], x + offsets[i][0], y + offsets[i][1], { font: font.display, italic: true, size: 21, color: labelColour, align: aligns[i] });
    if (sublabels) text(ctx, `all on outcome ${i + 1}`, x + offsets[i][0], y + offsets[i][1] + 19, { font: font.mono, size: 12, color: color.dim, align: aligns[i] });
  });
  if (barycentre > 0.003) {
    const [bx, by] = T.point([1 / 3, 1 / 3, 1 / 3]);
    ring(ctx, bx, by, 4.5, color.muted, barycentre, 1.5);
  }
  ctx.restore();
}

/** Clip everything drawn by `fn` to the triangle. */
export function clippedToTriangle(ctx, T, fn) {
  ctx.save();
  ctx.beginPath();
  T.V.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  fn();
  ctx.restore();
}

/** A path through distributions of the triangle. */
export function drawSimplexPath(ctx, T, points, { colour = color.ink, alpha = 1, width = 2.5, dash = [], progress = 1, fill = null, close = false } = {}) {
  if (alpha <= 0.003 || points.length < 2) return;
  const last = Math.max(1, Math.round((points.length - 1) * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  for (let i = 0; i <= last; i++) {
    const [x, y] = T.point(points[i]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  if (close) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

/** One distribution of the triangle as a marker. */
export function drawSimplexPoint(ctx, T, p, { colour = color.ink, alpha = 1, r = 7, label = '', labelOffset = [12, -10], halo = false } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = T.point(p);
  if (halo) ring(ctx, x, y, r + 6, colour, 0.8 * alpha, 2);
  dot(ctx, x, y, r, colour, alpha);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: colour, alpha });
}

/** The ball of Fisher radius r around p, drawn on the triangle (points in (p₁, p₂) → barycentric). */
export function drawFisherBallOnTriangle(ctx, T, ballPoints, { colour = METRIC, alpha = 1, width = 1.8, fill = rgba(METRIC, 0.14) } = {}) {
  const pts = ballPoints.map(([a, b]) => [a, b, 1 - a - b]);
  drawSimplexPath(ctx, T, pts, { colour, alpha, width, fill, close: true });
}

// ---- small widgets ----------------------------------------------------------------------------

/** A rounded panel (for an inset). */
export function panel(ctx, x, y, w, h, { alpha = 1, stroke = color.line, fill = 'rgba(17,24,40,0.85)' } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

/** Pill tag. Returns its width. */
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

/** 'label value' in mono; returns the width. */
export function readout(ctx, label, value, x, y, { colour = color.ink, digits = 2, size = 17, alpha = 1, align = 'left' } = {}) {
  const str = `${label} ${typeof value === 'number' ? fmt(value, digits) : value}`;
  text(ctx, str, x, y, { font: font.mono, size, color: colour, alpha, align });
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

/** The stamp at the bottom right: what the example is, and that everything is computed. */
export const exampleStamp = (ctx, alpha = 1, note = 'everything on screen is computed from the formulas shown') =>
  text(ctx, note, 1572, 890, { ...type.note, align: 'right', color: color.dim, alpha });

/** A caption centred over a frame. */
export const caption = (ctx, F, s, alpha, style = {}) => text(ctx, s, F.x + F.w / 2, F.y - 16, { ...type.note, color: color.body, align: 'center', alpha, ...style });

/** A note with a coloured left rule (for asides and references). */
export function aside(ctx, x, y, w, body, { colour = color.muted, alpha = 1, size = 14, lineHeight = 20, wrapFn } = {}) {
  if (alpha <= 0.003) return 0;
  const h = wrapFn(ctx, body, x + 16, y, w - 16, lineHeight, { ...type.note, size, color: color.body, alpha });
  line(ctx, x, y - size, x, y - size + h, { color: colour, width: 2, alpha });
  return h;
}
