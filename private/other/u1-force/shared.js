// Palette, drawing devices and small helpers shared by every scene of "From phase to force".
//
// One meaning per colour, everywhere:
//   gold      the fibre U(1): dial hands, phases, holonomy angles
//   soft blue the connection ω (the transport rule) and horizontal lifts
//   violet    the curvature Ω: flux density, shaded areas and ribbons
//   ink       the path, the physical worldline
//   orange    the varied path x + εη and the variation η
//   green     kinetic energy, the velocity U, the inertial response m a
//   blue      the potential V and its landscape
//   rose      force
//
// Scenes draw into "frames": a rectangle of the stage showing a rectangle of a plane (v up).

import { defineScene, color, type, font, rgba, text, line, dot, ring, arrow, roundRect, formatNumber, lin, seg } from '../../../src/kit.js';
import { simulation } from '../../../src/engine/simulation.js';

export * from '../../../src/kit.js';

export const C = Object.freeze({
  fibre: color.gold,
  connection: color.soft,
  curvature: '#c39bf5',
  curvatureNeg: '#4fb3a3',
  path: color.ink,
  varied: '#ef8a5b',
  kinetic: '#86d08f',
  potential: '#7ea6f2',
  force: '#ef6b6b',
  base: color.line,
  muted: color.muted,
});

/** A scene header: eyebrow 'NN · NAME' and the title. */
export const header = (n, name, title) => ({ eyebrow: `${String(n).padStart(2, '0')} · ${name}`, title });

export const fmt = (v, digits = 2) => formatNumber(v, digits);
export const TAU = 2 * Math.PI;

/** Eased keyframes: [time, value] pairs, eased between keys (as seg()). */
export const track = (t, keys, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [t1, v1] = keys[k];
    if (t <= t1) return keys[k - 1][1] + (v1 - keys[k - 1][1]) * ease(lin(t, keys[k - 1][0], t1));
  }
  return keys[keys.length - 1][1];
};

/**
 * The scene's clock for its content: while the viewer explores a live scene, everything that the
 * controls affect should be visible, so the clock jumps to `at` (the time by which all of it has
 * appeared) if it is earlier.
 */
export const clock = (t, live, at) => (live?.exploring ? Math.max(t, at) : t);

/**
 * A simulation with no state, so that controls can be levers (touching one pauses the narration and
 * starts explore mode) in a scene whose frame is a pure function of its inputs.
 */
export const leverSim = (uses) => simulation({ seed: 1, dt: 0.5, snapshotEvery: 0.5, uses, init: () => ({}), step: () => {} });

/**
 * The same scene with its clock stretched by k: duration, narration cues, beats, hand-overs and
 * control keyframes are k times later, and the frame at time t is the original frame at t / k.
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
 * (v up). F.X(u), F.Y(v), F.point([u, v]), F.inside([u, v]), F.U(x) and F.V(y) back to the plane.
 */
export function frame({ x, y, w, h, u = [0, 1], v = [0, 1] }) {
  const kx = w / (u[1] - u[0]);
  const ky = h / (v[1] - v[0]);
  return {
    x, y, w, h, u, v, kx, ky,
    X: (uu) => x + (uu - u[0]) * kx,
    Y: (vv) => y + h - (vv - v[0]) * ky,
    U: (xx) => u[0] + (xx - x) / kx,
    V: (yy) => v[0] + (y + h - yy) / ky,
    point: ([uu, vv]) => [x + (uu - u[0]) * kx, y + h - (vv - v[0]) * ky],
    inside: ([uu, vv]) => uu >= u[0] && uu <= u[1] && vv >= v[0] && vv <= v[1],
    /** The stage rectangle as a drag region [x0, y0, x1, y1]. */
    region: [x, y, x + w, y + h],
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

/** A faint grid through the ticks of a frame, the kind of graph paper the plane is drawn on. */
export function gridLines(ctx, F, { step = 0.5, alpha = 1, colour = color.grid } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let u = Math.ceil(F.u[0] / step) * step; u <= F.u[1] + 1e-9; u += step) line(ctx, F.X(u), F.y, F.X(u), F.y + F.h, { color: colour, width: 1 });
  for (let v = Math.ceil(F.v[0] / step) * step; v <= F.v[1] + 1e-9; v += step) line(ctx, F.x, F.Y(v), F.x + F.w, F.Y(v), { color: colour, width: 1 });
  ctx.restore();
}

/**
 * Left and bottom axes of a frame with ticks. xTicks / yTicks: values; xLabel / yLabel: names at the
 * ends; grid: faint grid lines through the ticks; box: all four sides.
 */
export function axes(ctx, F, { xTicks = [], yTicks = [], xLabel = '', yLabel = '', grid = false, alpha = 1, format = (v) => String(v), formatY = format, box = false, labelStyle = {} } = {}) {
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
  if (xLabel) text(ctx, xLabel, F.x + F.w, F.y + F.h + 46, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', ...labelStyle });
  if (yLabel) text(ctx, yLabel, F.x - 12, F.y + 8, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', ...labelStyle });
  ctx.restore();
}

/** A polyline through plane points. progress: draw only the first part; arrowHead: at the end. */
export function drawPath(ctx, F, points, { colour = color.ink, alpha = 1, width = 2.5, dash = [], close = false, fill = null, progress = 1, arrowHead = false } = {}) {
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
  ctx.setLineDash([]);
  if (arrowHead && last >= 1) {
    const [x1, y1] = F.point(points[last]);
    const [x0, y0] = F.point(points[Math.max(0, last - 3)]);
    const d = Math.hypot(x1 - x0, y1 - y0) || 1;
    arrow(ctx, x1 - ((x1 - x0) / d) * 16, y1 - ((y1 - y0) / d) * 16, x1, y1, { color: colour, width, head: 13 });
  }
  ctx.restore();
}

/** The region between two polylines of the same length, filled (and optionally outlined). */
export function drawStrip(ctx, F, path1, path2, { fill = rgba(C.curvature, 0.25), stroke = null, alpha = 1, width = 1 } = {}) {
  if (alpha <= 0.003 || path1.length < 2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  path1.forEach((p, i) => {
    const [x, y] = F.point(p);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  for (let i = path2.length - 1; i >= 0; i--) {
    const [x, y] = F.point(path2[i]);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
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
    ctx.arc(x, y, r + 9, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  dot(ctx, x, y, r, colour, alpha);
  if (ringed) ring(ctx, x, y, r + 5, colour, 0.8 * alpha, 2);
  if (label) text(ctx, label, x + labelOffset[0], y + labelOffset[1], { font: font.display, italic: true, size: 22, color: colour, alpha, ...labelStyle });
}

/** The graph of f(u) over [u0, u1] in a frame, optionally filled down to the baseline v = 0. */
export function drawCurve(ctx, F, f, { colour = color.ink, alpha = 1, width = 2.5, fill = null, n = 200, u = F.u, dash = [], progress = 1, baseline = 0 } = {}) {
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
    ctx.moveTo(pts[0][0], F.Y(baseline));
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1][0], F.Y(baseline));
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

/** Sampled values y_i at u_i (arrays) as a curve in a frame, optionally filled to the baseline. */
export function drawSamples(ctx, F, us, ys, { colour = color.ink, alpha = 1, width = 2.5, fill = null, dash = [], baseline = 0, progress = 1 } = {}) {
  if (alpha <= 0.003 || us.length < 2) return;
  const last = Math.max(1, Math.round((us.length - 1) * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(F.X(us[0]), F.Y(baseline));
    for (let i = 0; i <= last; i++) ctx.lineTo(F.X(us[i]), F.Y(ys[i]));
    ctx.lineTo(F.X(us[last]), F.Y(baseline));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= last; i++) {
    const x = F.X(us[i]);
    const y = F.Y(ys[i]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// ---- dials: the fibre U(1) and a phase on it ------------------------------------------------------

/**
 * A dial at stage point (x, y): a ring (the fibre), a tick at its zero mark (angle `zero`,
 * counter-clockwise from the right, as every angle here) and a hand at angle θ (also measured from
 * the right, so the hand's position on the ring is what a gauge transformation does not change; the
 * number it reads, θ − zero, is what changes).
 */
export function drawDial(ctx, x, y, r, theta, { colour = C.fibre, ringColour = C.fibre, alpha = 1, zero = 0, hand = true, width = 2.5, fill = null, tick = true, readout = false, size = 13 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = ringColour;
  ctx.lineWidth = Math.max(1, width * 0.6);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  if (tick) {
    ctx.lineWidth = width * 0.8;
    ctx.beginPath();
    ctx.moveTo(x + r * 0.78 * Math.cos(zero), y - r * 0.78 * Math.sin(zero));
    ctx.lineTo(x + r * 1.0 * Math.cos(zero), y - r * 1.0 * Math.sin(zero));
    ctx.stroke();
  }
  if (hand) {
    const hx = x + r * 0.9 * Math.cos(theta);
    const hy = y - r * 0.9 * Math.sin(theta);
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    dot(ctx, hx, hy, Math.max(2, width * 1.1), colour);
    dot(ctx, x, y, Math.max(1.5, width * 0.6), colour);
  }
  ctx.restore();
  if (readout) text(ctx, `${fmt(theta - zero, 2)} rad`, x, y + r + size + 4, { font: font.mono, size, color: colour, align: 'center', alpha });
}

/** Dials on a lattice of the frame, with the hand angle theta(u, v) and the zero mark zero(u, v). */
export function drawDialField(ctx, F, { spacing = 0.5, r = 13, theta = () => 0, zero = () => 0, alpha = 1, colour = C.fibre, ringColour = rgba(C.fibre, 0.55), hand = true, offset = spacing / 2 } = {}) {
  if (alpha <= 0.003) return;
  for (let u = F.u[0] + offset; u <= F.u[1] - offset / 2 + 1e-9; u += spacing) {
    for (let v = F.v[0] + offset; v <= F.v[1] - offset / 2 + 1e-9; v += spacing) {
      const [x, y] = F.point([u, v]);
      drawDial(ctx, x, y, r, theta(u, v), { colour, ringColour, alpha, zero: zero(u, v), hand, width: 2 });
    }
  }
}

/** A runner (a bright dot with a halo) at a plane point, carrying a dial beside it. */
export function drawRunner(ctx, F, p, { colour = color.ink, alpha = 1, r = 7, dial = null, dialOffset = [34, -34], dialR = 24, readout = false, zero = 0 } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = F.point(p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 16;
  dot(ctx, x, y, r, colour);
  ctx.restore();
  if (dial !== null) {
    const dx = x + dialOffset[0];
    const dy = y + dialOffset[1];
    line(ctx, x, y, dx - (dialOffset[0] / Math.hypot(...dialOffset)) * dialR, dy - (dialOffset[1] / Math.hypot(...dialOffset)) * dialR, { color: rgba(colour, 0.5), width: 1, alpha });
    drawDial(ctx, dx, dy, dialR, dial, { alpha, fill: 'rgba(13,19,33,0.85)', readout, zero, width: 3 });
  }
}

/** A curved arrow marking an angle from a to b (counter-clockwise) at radius r around (x, y). */
export function drawAngle(ctx, x, y, r, a, b, { colour = C.fibre, alpha = 1, width = 2.5, label = '', labelOffset = 18 } = {}) {
  if (alpha <= 0.003 || Math.abs(b - a) < 1e-4) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  // canvas angles run clockwise, ours counter-clockwise
  ctx.arc(x, y, r, -a, -b, b > a);
  ctx.stroke();
  const end = b;
  const dir = Math.sign(b - a);
  const ex = x + r * Math.cos(end);
  const ey = y - r * Math.sin(end);
  const tx = -Math.sin(end) * dir;
  const ty = -Math.cos(end) * dir;
  arrow(ctx, ex - tx * 8, ey - ty * 8, ex + tx * 2, ey + ty * 2, { color: colour, width, head: 10 });
  ctx.restore();
  if (label) {
    const mid = (a + b) / 2;
    text(ctx, label, x + (r + labelOffset) * Math.cos(mid), y - (r + labelOffset) * Math.sin(mid) + 6, { font: font.display, italic: true, size: 20, color: colour, align: 'center', alpha });
  }
}

// ---- the curvature as a heat map ----------------------------------------------------------------

const maps = new Map();

/**
 * Paint Ω = B dx∧dy over a frame as a heat map: violet where B > 0, teal where B < 0, transparent at
 * zero; `range` is the |B| drawn fully opaque. Rendered once per (key, frame size) into an offscreen
 * canvas; pass a `key` that identifies the field.
 */
export function drawCurvatureMap(ctx, F, B, { key, range = 2, alpha = 1, cells = 120 } = {}) {
  if (alpha <= 0.003) return;
  const id = `${key}|${F.w}x${F.h}|${F.u}|${F.v}|${range}|${cells}`;
  let canvas = maps.get(id);
  if (!canvas) {
    const nx = cells;
    const ny = Math.round((cells * F.h) / F.w);
    canvas = document.createElement('canvas');
    canvas.width = nx;
    canvas.height = ny;
    const g = canvas.getContext('2d');
    const img = g.createImageData(nx, ny);
    const pos = C.curvature.slice(1).match(/../g).map((h) => parseInt(h, 16));
    const neg = C.curvatureNeg.slice(1).match(/../g).map((h) => parseInt(h, 16));
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const u = F.u[0] + ((F.u[1] - F.u[0]) * (i + 0.5)) / nx;
        const v = F.v[1] - ((F.v[1] - F.v[0]) * (j + 0.5)) / ny;
        const b = B(u, v);
        const a = Math.min(1, Math.abs(b) / range);
        const rgb = b >= 0 ? pos : neg;
        const k = 4 * (j * nx + i);
        img.data[k] = rgb[0];
        img.data[k + 1] = rgb[1];
        img.data[k + 2] = rgb[2];
        img.data[k + 3] = Math.round(255 * 0.8 * a);
      }
    }
    g.putImageData(img, 0, 0);
    if (maps.size > 12) maps.delete(maps.keys().next().value);
    maps.set(id, canvas);
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas, F.x, F.y, F.w, F.h);
  ctx.restore();
}

/** A small legend bar for the curvature map. */
export function curvatureLegend(ctx, x, y, w, { range = 2, alpha = 1, label = 'curvature Ω per unit area' } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, rgba(C.curvature, 0.08));
  g.addColorStop(1, rgba(C.curvature, 0.8));
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, 10, 5);
  ctx.fill();
  ctx.restore();
  text(ctx, '0', x, y + 26, { font: font.mono, size: 12, color: color.muted, alpha });
  text(ctx, fmt(range, 1), x + w, y + 26, { font: font.mono, size: 12, color: color.muted, align: 'right', alpha });
  text(ctx, label, x + w / 2, y + 26, { font: font.mono, size: 12, color: C.curvature, align: 'center', alpha });
}

// ---- small widgets ----------------------------------------------------------------------------

/** A rounded panel (for an inset). */
export function panel(ctx, x, y, w, h, { alpha = 1, stroke = color.line, fill = 'rgba(17,24,40,0.88)', radius = 12 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, radius);
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
export function readout(ctx, label, value, x, y, { colour = color.ink, digits = 2, size = 17, alpha = 1, align = 'left', unit = '' } = {}) {
  const str = `${label} ${typeof value === 'number' ? fmt(value, digits) : value}${unit}`;
  text(ctx, str, x, y, { font: font.mono, size, color: colour, alpha, align });
  ctx.save();
  ctx.font = `400 ${size}px ${font.mono}`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

/** The stamp at the bottom right: that everything is computed. */
export const stamp = (ctx, alpha = 1, note = 'everything on screen is computed from the formulas shown') =>
  text(ctx, note, 1572, 890, { ...type.note, align: 'right', color: color.dim, alpha });

/** A caption centred over a frame. */
export const caption = (ctx, F, s, alpha, style = {}) => text(ctx, s, F.x + F.w / 2, F.y - 16, { ...type.note, color: color.body, align: 'center', alpha, ...style });

/** A note with a coloured left rule (for asides and references). wrapFn is the kit's wrap(). */
export function aside(ctx, x, y, w, body, { colour = color.muted, alpha = 1, size = 14, lineHeight = 20, wrapFn } = {}) {
  if (alpha <= 0.003) return 0;
  const h = wrapFn(ctx, body, x + 16, y, w - 16, lineHeight, { ...type.note, size, color: color.body, alpha });
  line(ctx, x, y - size, x, y - size + h, { color: colour, width: 2, alpha });
  return h;
}

/** A labelled vector arrow from a plane point in a plane direction (scaled by `scale` stage px per unit). */
export function drawVector(ctx, F, p, d, { colour = color.ink, alpha = 1, scale = 60, width = 3, label = '', head = 12, labelOffset = [8, -8] } = {}) {
  if (alpha <= 0.003) return;
  const [x, y] = F.point(p);
  const x1 = x + d[0] * scale;
  const y1 = y - d[1] * scale;
  arrow(ctx, x, y, x1, y1, { color: colour, width, head, alpha });
  if (label) text(ctx, label, x1 + labelOffset[0], y1 + labelOffset[1], { font: font.display, italic: true, size: 21, color: colour, alpha });
}

/** The small parallelogram spanned by two plane vectors a, b at p (the "oriented area" element). */
export function drawParallelogram(ctx, F, p, a, b, { fill = rgba(C.curvature, 0.35), stroke = C.curvature, alpha = 1, width = 1.5, scale = 1 } = {}) {
  if (alpha <= 0.003) return;
  const P = [p, [p[0] + a[0] * scale, p[1] + a[1] * scale], [p[0] + (a[0] + b[0]) * scale, p[1] + (a[1] + b[1]) * scale], [p[0] + b[0] * scale, p[1] + b[1] * scale]];
  drawPath(ctx, F, P, { colour: stroke, alpha, width, close: true, fill });
}

/** A hand-drawn-looking balance between two values: a beam that tilts by (b − a). */
export function drawBalance(ctx, x, y, w, a, b, { alpha = 1, colourA = C.curvature, colourB = C.kinetic, labelA = '', labelB = '', maxTilt = 0.25, scale = 1 } = {}) {
  if (alpha <= 0.003) return;
  const tilt = Math.max(-maxTilt, Math.min(maxTilt, (b - a) * scale));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  // the pivot
  ctx.fillStyle = color.muted;
  ctx.beginPath();
  ctx.moveTo(-14, 22);
  ctx.lineTo(14, 22);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(tilt);
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.stroke();
  // the pans
  for (const [sx, c, label] of [[-1, colourA, labelA], [1, colourB, labelB]]) {
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((sx * w) / 2, 0);
    ctx.lineTo((sx * w) / 2, 26);
    ctx.stroke();
    ctx.fillStyle = rgba(c, 0.25);
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc((sx * w) / 2, 26, 22, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (label) text(ctx, label, (sx * w) / 2, 70, { font: font.mono, size: 13, color: c, align: 'center' });
  }
  ctx.restore();
}
