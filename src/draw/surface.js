// Simple 3D drawing through a camera: shaded parametric surfaces (painter's
// algorithm), polylines, and flat polygons such as tangent planes.

import { cross, sub, normalize, dot } from '../model/vec3.js';
import { hexToRgb } from './color.js';

const TO_LIGHT = normalize([-0.4, 0.6, -0.7]); // view coordinates: towards the upper left front

/**
 * Shaded surface p(u, v) over a grid.
 * Options: nu, nv, u: [from, to], v: [from, to], color(u, v) → hex string, alpha (number or (u, v) → number),
 *          ambient (0 … 1).
 */
export function drawSurface(ctx, cam, point, { nu = 48, nv = 24, u = [0, 2 * Math.PI], v = [0, 2 * Math.PI], color, alpha = 1, ambient = 0.38 }) {
  const P = [];
  for (let i = 0; i <= nu; i++) {
    const row = [];
    for (let j = 0; j <= nv; j++) {
      const uu = u[0] + ((u[1] - u[0]) * i) / nu;
      const vv = v[0] + ((v[1] - v[0]) * j) / nv;
      const world = point(uu, vv);
      row.push({ uu, vv, world, screen: cam.project(world) });
    }
    P.push(row);
  }

  const quads = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = P[i][j];
      const b = P[i + 1][j];
      const c = P[i + 1][j + 1];
      const d = P[i][j + 1];
      const depth = (a.screen.z + b.screen.z + c.screen.z + d.screen.z) / 4;
      quads.push({ a, b, c, d, depth });
    }
  }
  quads.sort((q, r) => r.depth - q.depth);

  ctx.save();
  const baseAlpha = ctx.globalAlpha;
  ctx.lineJoin = 'round';
  for (const { a, b, c, d } of quads) {
    let n = cam.rotate(normalize(cross(sub(c.world, a.world), sub(d.world, b.world))));
    if (n[2] > 0) n = n.map((x) => -x); // light both sides
    const shade = ambient + (1 - ambient) * Math.max(0, dot(n, TO_LIGHT));
    const um = (a.uu + c.uu) / 2;
    const vm = (a.vv + c.vv) / 2;
    const [r, g, bl] = hexToRgb(color(um, vm)).map((x) => Math.round(x * shade));
    const fill = `rgb(${r},${g},${bl})`;
    ctx.globalAlpha = baseAlpha * (typeof alpha === 'function' ? alpha(um, vm) : alpha);
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(a.screen.x, a.screen.y);
    ctx.lineTo(b.screen.x, b.screen.y);
    ctx.lineTo(c.screen.x, c.screen.y);
    ctx.lineTo(d.screen.x, d.screen.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Polyline through 3D points. Options: color, width, alpha, dash,
 * visible(i) → boolean to skip hidden segments, progress (0 … 1) to draw only the first part.
 */
export function polyline3(ctx, cam, points, { color = '#ffffff', width = 2, alpha = 1, dash = [], visible, progress = 1 } = {}) {
  if (alpha <= 0.003 || points.length < 2) return;
  const last = Math.max(1, Math.round((points.length - 1) * progress));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= last; i++) {
    if (visible && !visible(i)) {
      pen = false;
      continue;
    }
    const p = cam.project(points[i]);
    pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    pen = true;
  }
  ctx.stroke();
  ctx.restore();
}

/** Flat polygon through 3D points. Options: fill, stroke, width, alpha. */
export function polygon3(ctx, cam, points, { fill, stroke, width = 1.5, alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  points.forEach((p, i) => {
    const s = cam.project(p);
    i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
  });
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
}
