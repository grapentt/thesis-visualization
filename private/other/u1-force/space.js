// Three-dimensional pictures of "From phase to force", drawn through the repo's camera with the
// painter's algorithm: the floor (the base plane), rings standing for fibres, the tube (circle of
// circles) over a base curve with a lifted curve winding on it, tilted horizontal tiles, and a block
// of spacetime with worldlines, the ribbon between a worldline and its variation, and the flux lines
// of the curvature 2-form.
//
// World coordinates: [X, Y, Z] with Y up (the kit camera's convention). A point (x, y) of the base
// plane at height h is world [x, h, y]; a spacetime event (t, x, y) is world [x, t, y] (time up).

import { camera, polyline3, polygon3, vec3, rgba, color, dot, text, font } from '../../../src/kit.js';
import { C, TAU } from './shared.js';

export const floorPoint = (x, y, h = 0) => [x, h, y];
export const eventPoint = (t, x, y) => [x, t, y];

/** The camera of the bundle pictures: slightly above, looking at the origin of the floor. */
export const bundleCamera = (o = {}) => camera({ yaw: 0.55, pitch: 0.46, scale: 150, cx: 560, cy: 470, focal: 14, ...o });
/** The camera of the spacetime block. */
export const spacetimeCamera = (o = {}) => camera({ yaw: 0.62, pitch: 0.36, scale: 150, cx: 560, cy: 500, focal: 14, center: [0, 1.4, 0], ...o });

/** Grid lines on the floor z = h over [−a, a]². */
export function drawFloor(ctx, cam, { a = 2, step = 0.5, h = 0, alpha = 1, colour = color.line } = {}) {
  if (alpha <= 0.003) return;
  for (let k = -a; k <= a + 1e-9; k += step) {
    polyline3(ctx, cam, [floorPoint(-a, k, h), floorPoint(a, k, h)], { color: colour, width: 1, alpha });
    polyline3(ctx, cam, [floorPoint(k, -a, h), floorPoint(k, a, h)], { color: colour, width: 1, alpha });
  }
}

/** The n points of a circle of radius r around world point c, in the plane spanned by unit vectors e1, e2. */
export const circle3 = (c, r, e1, e2, n = 48) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (TAU * i) / n;
  return vec3.add(c, vec3.add(vec3.scale(e1, r * Math.cos(a)), vec3.scale(e2, r * Math.sin(a))));
});

/**
 * A fibre ring over the base point (x, y): a circle of radius r standing vertically, facing the
 * direction `facing` (an angle in the floor; 0 faces +x), with its zero mark and a point at angle θ
 * (θ = 0 at the mark, counter-clockwise seen from the facing side).
 */
export function drawRing(ctx, cam, [x, y], { r = 0.22, h = 0.5, theta = null, facing = -0.9, alpha = 1, colour = C.fibre, width = 1.5, zero = 0, mark = true, pointR = 4 } = {}) {
  if (alpha <= 0.003) return;
  const e1 = [-Math.sin(facing), 0, Math.cos(facing)]; // in the floor, perpendicular to the facing direction
  const e2 = [0, 1, 0];
  const c = floorPoint(x, y, h);
  const pts = circle3(c, r, e1, e2, 40);
  polyline3(ctx, cam, pts, { color: colour, width, alpha: 0.75 * alpha });
  const at = (a) => vec3.add(c, vec3.add(vec3.scale(e1, r * Math.cos(a)), vec3.scale(e2, r * Math.sin(a))));
  if (mark) polyline3(ctx, cam, [at(zero), vec3.add(c, vec3.add(vec3.scale(e1, 1.22 * r * Math.cos(zero)), vec3.scale(e2, 1.22 * r * Math.sin(zero))))], { color: colour, width: width + 0.5, alpha });
  if (theta !== null) {
    const p = cam.project(at(theta));
    dot(ctx, p.x, p.y, pointR, colour, alpha);
  }
}

/** A vertical stalk from the floor to a ring's centre, so the ring reads as sitting over its point. */
export function drawStalk(ctx, cam, [x, y], { h = 0.5, alpha = 1, colour = C.fibre } = {}) {
  polyline3(ctx, cam, [floorPoint(x, y, 0), floorPoint(x, y, h - 0.02)], { color: colour, width: 1, alpha: 0.35 * alpha, dash: [3, 4] });
  const p = cam.project(floorPoint(x, y, 0));
  dot(ctx, p.x, p.y, 2.5, colour, 0.8 * alpha);
}

// ---- the tube: the circle of circles over a base curve ---------------------------------------------

/**
 * Frames along a planar base curve (array of [x, y], open or closed): unit tangent and left normal.
 * Returns { points, tangents, normals, closed }.
 */
export function curveFrames(curve) {
  const n = curve.length;
  const closed = Math.hypot(curve[0][0] - curve[n - 1][0], curve[0][1] - curve[n - 1][1]) < 1e-9;
  const tangents = curve.map((p, i) => {
    const prev = curve[i === 0 ? (closed ? n - 2 : 0) : i - 1];
    const next = curve[i === n - 1 ? (closed ? 1 : n - 1) : i + 1];
    const d = [next[0] - prev[0], next[1] - prev[1]];
    const L = Math.hypot(d[0], d[1]) || 1;
    return [d[0] / L, d[1] / L];
  });
  const normals = tangents.map(([tx, ty]) => [-ty, tx]);
  return { points: curve, tangents, normals, closed };
}

/**
 * The tube of radius ρ over a base curve at height h: point T(i, φ) = c_i + ρ (cos φ n_i + sin φ up).
 * φ = 0 points along the curve's left normal, φ = π/2 straight up.
 */
export function tube(curve, { rho = 0.28, h = 0.5 } = {}) {
  const F = curveFrames(curve);
  const at = (i, phi) => {
    const [x, y] = F.points[i];
    const [nx, ny] = F.normals[i];
    return [x + rho * Math.cos(phi) * nx, h + rho * Math.sin(phi), y + rho * Math.cos(phi) * ny];
  };
  const normalAt = (i, phi) => {
    const [nx, ny] = F.normals[i];
    return [Math.cos(phi) * nx, Math.sin(phi), Math.cos(phi) * ny];
  };
  return { ...F, rho, h, at, normalAt };
}

/**
 * Draw a tube as a glassy surface (painter's algorithm, far quads first). `every`: use every k-th
 * point of the base curve as a mesh row; `nv`: segments around.
 */
export function drawTube(ctx, cam, T, { every = 4, nv = 20, alpha = 0.32, colour = C.fibre, ambient = 0.45, rows = null, edge = 0.5 } = {}) {
  if (alpha <= 0.003) return;
  const n = T.points.length;
  const idx = rows ?? Array.from({ length: Math.ceil(n / every) }, (_, k) => Math.min(n - 1, k * every));
  if (idx[idx.length - 1] !== n - 1) idx.push(n - 1);
  const quads = [];
  const toLight = vec3.normalize([-0.4, 0.6, -0.7]);
  for (let a = 0; a < idx.length - 1; a++) {
    for (let j = 0; j < nv; j++) {
      const p0 = (TAU * j) / nv;
      const p1 = (TAU * (j + 1)) / nv;
      const pts = [T.at(idx[a], p0), T.at(idx[a + 1], p0), T.at(idx[a + 1], p1), T.at(idx[a], p1)];
      const screen = pts.map((p) => cam.project(p));
      const depth = screen.reduce((s, q) => s + q.z, 0) / 4;
      let nrm = cam.rotate(T.normalAt(idx[a], (p0 + p1) / 2));
      const facing = nrm[2] < 0;
      if (!facing) nrm = nrm.map((v) => -v);
      const shade = ambient + (1 - ambient) * Math.max(0, vec3.dot(nrm, toLight));
      quads.push({ screen, depth, shade, facing });
    }
  }
  quads.sort((p, q) => q.depth - p.depth);
  const [r, g, b] = colour.slice(1).match(/../g).map((x) => parseInt(x, 16));
  ctx.save();
  ctx.lineJoin = 'round';
  for (const { screen, shade, facing } of quads) {
    const fill = `rgba(${Math.round(r * shade)},${Math.round(g * shade)},${Math.round(b * shade)},${(alpha * (facing ? 1 : 0.55)).toFixed(3)})`;
    ctx.fillStyle = fill;
    ctx.strokeStyle = `rgba(${r},${g},${b},${(alpha * edge).toFixed(3)})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    screen.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** The fibre circle of the tube over base point i (drawn as a ring on the tube). */
export function drawTubeRing(ctx, cam, T, i, { alpha = 1, colour = C.fibre, width = 1.5, theta = null, pointR = 4.5, pointColour = C.fibre, dash = [] } = {}) {
  const pts = Array.from({ length: 49 }, (_, k) => T.at(i, (TAU * k) / 48));
  polyline3(ctx, cam, pts, { color: colour, width, alpha, dash });
  if (theta !== null) {
    const p = cam.project(T.at(i, theta));
    dot(ctx, p.x, p.y, pointR, pointColour, alpha);
  }
}

/**
 * The lifted curve on the tube: the point over base point i at angle thetas[i]. Drawn in two passes,
 * the hidden part (back of the tube) dimmer and dashed, the visible part solid; `progress` draws the
 * first part only. Returns the world points.
 */
export function drawLift(ctx, cam, T, thetas, { colour = C.connection, width = 3.5, alpha = 1, progress = 1, hiddenAlpha = 0.28 } = {}) {
  const pts = thetas.map((th, i) => T.at(i, th));
  const visible = thetas.map((th, i) => cam.rotate(T.normalAt(i, th))[2] < 0.04);
  polyline3(ctx, cam, pts, { color: colour, width: width * 0.7, alpha: alpha * hiddenAlpha, dash: [4, 5], visible: (i) => !visible[i], progress });
  polyline3(ctx, cam, pts, { color: colour, width, alpha, visible: (i) => visible[i], progress });
  return pts;
}

/** The base curve drawn on the floor under the tube. */
export const drawBaseCurve = (ctx, cam, curve, { colour = color.ink, width = 2.5, alpha = 1, progress = 1, dash = [] } = {}) =>
  polyline3(ctx, cam, curve.map(([x, y]) => floorPoint(x, y, 0)), { color: colour, width, alpha, progress, dash });

// ---- tilted tiles: the horizontal spaces of a connection over the plane -------------------------

/**
 * Small tiles at lattice points of the floor, tilted as the horizontal planes of the connection with
 * form ω = ω_x dx + ω_y dy on the fibre coordinate z: horizontal vectors (1, 0, ω_x), (0, 1, ω_y).
 */
export function drawTiles(ctx, cam, omega, { sites = [-1.5, -0.75, 0, 0.75, 1.5], h = 0.5, size = 0.22, alpha = 1, colour = C.connection, gain = 1 } = {}) {
  if (alpha <= 0.003) return;
  const tiles = [];
  for (const x of sites) {
    for (const y of sites) {
      const [wx, wy] = omega(x, y);
      const e1 = [1, gain * wx, 0];
      const e2 = [0, gain * wy, 1];
      const c = floorPoint(x, y, h);
      const corner = (a, b) => vec3.add(c, vec3.add(vec3.scale(e1, a * size), vec3.scale(e2, b * size)));
      tiles.push({ pts: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], depth: cam.project(c).z });
    }
  }
  tiles.sort((a, b) => b.depth - a.depth);
  for (const { pts } of tiles) polygon3(ctx, cam, pts, { fill: rgba(colour, 0.22), stroke: rgba(colour, 0.85), width: 1.4, alpha });
}

// ---- the spacetime block ---------------------------------------------------------------------------

/** The edges of the block [−a, a] × [0, T] × [−a, a] (x, t, y), and the floor grid at t = 0. */
export function drawBlock(ctx, cam, { a = 1.6, T = 2.4, alpha = 1, floor = true, step = 0.4 } = {}) {
  if (alpha <= 0.003) return;
  if (floor) {
    for (let k = -a; k <= a + 1e-9; k += step) {
      polyline3(ctx, cam, [eventPoint(0, -a, k), eventPoint(0, a, k)], { color: color.line, width: 1, alpha });
      polyline3(ctx, cam, [eventPoint(0, k, -a), eventPoint(0, k, a)], { color: color.line, width: 1, alpha });
    }
  }
  const corners = [[-a, -a], [a, -a], [a, a], [-a, a]];
  for (const [x, y] of corners) polyline3(ctx, cam, [eventPoint(0, x, y), eventPoint(T, x, y)], { color: color.line, width: 1, alpha: 0.6 * alpha, dash: [4, 6] });
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = corners[i];
    const [x1, y1] = corners[(i + 1) % 4];
    polyline3(ctx, cam, [eventPoint(T, x0, y0), eventPoint(T, x1, y1)], { color: color.line, width: 1, alpha: 0.6 * alpha, dash: [4, 6] });
  }
}

/** Axis arrows and labels of the block: t up, x and y along the floor. */
export function drawSpacetimeAxes(ctx, cam, { a = 1.6, T = 2.4, alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  const axis = (from, to, label, colour) => {
    const p = cam.project(from);
    const q = cam.project(to);
    polyline3(ctx, cam, [from, to], { color: colour, width: 2, alpha });
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const ux = (q.x - p.x) / d;
    const uy = (q.y - p.y) / d;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x - ux * 12 - uy * 5, q.y - uy * 12 + ux * 5);
    ctx.lineTo(q.x - ux * 12 + uy * 5, q.y - uy * 12 - ux * 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    text(ctx, label, q.x + ux * 16, q.y + uy * 16 + 7, { font: font.display, italic: true, size: 22, color: colour, align: 'center', alpha });
  };
  axis(eventPoint(0, -a, -a), eventPoint(T + 0.3, -a, -a), 't', C.kinetic);
  axis(eventPoint(0, -a, -a), eventPoint(0, a + 0.3, -a), 'x', color.muted);
  axis(eventPoint(0, -a, -a), eventPoint(0, -a, a + 0.3), 'y', color.muted);
}

/** A worldline (t_i, x_i, y_i) as a 3D curve; `progress` draws the first part. */
export const drawWorldline = (ctx, cam, events, { colour = color.ink, width = 3, alpha = 1, progress = 1, dash = [] } = {}) =>
  polyline3(ctx, cam, events.map(([t, x, y]) => eventPoint(t, x, y)), { color: colour, width, alpha, progress, dash });

/**
 * The ribbon between two worldlines with the same number of events, as a surface whose quads are
 * shaded by the flux density through them: fluxAt(i) in [−1, 1] after scaling (positive violet,
 * negative teal). `upTo`: draw only the first k quads.
 */
export function drawRibbon(ctx, cam, events1, events2, { fluxAt = () => 0.5, alpha = 1, upTo = Infinity, stroke = true } = {}) {
  if (alpha <= 0.003) return;
  const quads = [];
  const last = Math.min(events1.length - 1, upTo);
  for (let i = 1; i <= last; i++) {
    const pts = [eventPoint(...events1[i - 1]), eventPoint(...events1[i]), eventPoint(...events2[i]), eventPoint(...events2[i - 1])];
    const depth = pts.reduce((s, p) => s + cam.project(p).z, 0) / 4;
    quads.push({ pts, depth, f: fluxAt(i) });
  }
  quads.sort((a, b) => b.depth - a.depth);
  for (const { pts, f } of quads) {
    const c = f >= 0 ? C.curvature : C.curvatureNeg;
    polygon3(ctx, cam, pts, { fill: rgba(c, 0.12 + 0.6 * Math.min(1, Math.abs(f))), stroke: stroke ? rgba(c, 0.35) : null, width: 0.8, alpha });
  }
}

/**
 * Flux lines of the curvature 2-form F = B dx∧dy + E_x dx∧dt + E_y dy∧dt in 2+1 dimensions: F(a, b)
 * = G · (a × b) with the coordinate dual G = (G_t, G_x, G_y) = (B, E_y, −E_x). Lines are drawn along
 * G through a lattice of seed events; the flux through a small surface counts the lines piercing it.
 */
export const fluxDirection = ({ B = 0, E = [0, 0] }) => [B, E[1], -E[0]];

export function drawFluxLines(ctx, cam, field, { a = 1.6, T = 2.4, spacing = 0.8, alpha = 1, colour = C.curvature, width = 1.2, arrows = true } = {}) {
  if (alpha <= 0.003) return;
  const G = fluxDirection(field);
  const L = Math.hypot(...G);
  if (L < 1e-9) return;
  const d = G.map((g) => g / L); // (t, x, y)
  // seeds on the two planes the lines cross: choose the plane most perpendicular to d
  const lines = [];
  const seeds = [];
  const k = [Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])];
  const main = k.indexOf(Math.max(...k));
  const span = main === 0 ? [[-a, a], [-a, a]] : main === 1 ? [[0, T], [-a, a]] : [[0, T], [-a, a]];
  for (let u = span[0][0] + spacing / 2; u <= span[0][1]; u += spacing) {
    for (let v = span[1][0] + spacing / 2; v <= span[1][1]; v += spacing) {
      seeds.push(main === 0 ? [0, u, v] : main === 1 ? [u, -a, v] : [u, v, -a]);
    }
  }
  const inside = ([t, x, y]) => t >= -1e-9 && t <= T + 1e-9 && Math.abs(x) <= a + 1e-9 && Math.abs(y) <= a + 1e-9;
  for (const s of seeds) {
    // march from the seed along ±d until leaving the block
    const pts = [];
    for (const sign of [-1, 1]) {
      let p = s.slice();
      const part = [];
      for (let n = 0; n < 400; n++) {
        if (!inside(p)) break;
        part.push(p.slice());
        p = p.map((c, i) => c + sign * d[i] * 0.05);
      }
      if (sign < 0) pts.push(...part.reverse());
      else pts.push(...part.slice(1));
    }
    if (pts.length > 1) lines.push(pts);
  }
  for (const pts of lines) {
    polyline3(ctx, cam, pts.map(([t, x, y]) => eventPoint(t, x, y)), { color: colour, width, alpha: 0.55 * alpha });
    if (arrows) {
      const m = Math.floor(pts.length / 2);
      const p = cam.project(eventPoint(...pts[m]));
      const q = cam.project(eventPoint(...pts[Math.min(pts.length - 1, m + 2)]));
      const dd = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const ux = (q.x - p.x) / dd;
      const uy = (q.y - p.y) / dd;
      ctx.save();
      ctx.globalAlpha *= 0.8 * alpha;
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.moveTo(p.x + ux * 6, p.y + uy * 6);
      ctx.lineTo(p.x - ux * 5 - uy * 4, p.y - uy * 5 + ux * 4);
      ctx.lineTo(p.x - ux * 5 + uy * 4, p.y - uy * 5 - ux * 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

/** The parallelogram spanned by two spacetime vectors a, b at the event p, as a filled polygon. */
export function drawElement(ctx, cam, p, a, b, { fill = rgba(C.curvature, 0.45), stroke = C.curvature, alpha = 1, width = 1.5 } = {}) {
  const P = [p, [p[0] + a[0], p[1] + a[1], p[2] + a[2]], [p[0] + a[0] + b[0], p[1] + a[1] + b[1], p[2] + a[2] + b[2]], [p[0] + b[0], p[1] + b[1], p[2] + b[2]]];
  polygon3(ctx, cam, P.map((e) => eventPoint(...e)), { fill, stroke, width, alpha });
}

/** A 3D arrow from event p along the spacetime vector d (t, x, y). */
export function drawArrow3(ctx, cam, p, d, { colour = color.ink, width = 3, alpha = 1, label = '', head = 12 } = {}) {
  if (alpha <= 0.003) return;
  const from = cam.project(eventPoint(...p));
  const to = cam.project(eventPoint(p[0] + d[0], p[1] + d[1], p[2] + d[2]));
  const L = Math.hypot(to.x - from.x, to.y - from.y);
  if (L < 1) return;
  const ux = (to.x - from.x) / L;
  const uy = (to.y - from.y) / L;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x - ux * head * 0.8, to.y - uy * head * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - ux * head - uy * head * 0.45, to.y - uy * head + ux * head * 0.45);
  ctx.lineTo(to.x - ux * head + uy * head * 0.45, to.y - uy * head - ux * head * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (label) text(ctx, label, to.x + ux * 14, to.y + uy * 14 + 7, { font: font.display, italic: true, size: 22, color: colour, align: 'center', alpha });
}
