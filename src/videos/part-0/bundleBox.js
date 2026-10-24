// A bundle over the plane drawn in 3D: the floor is the base ℝ², fibres are
// vertical lines, and the horizontal spaces are small tiles (pieces of planes).

import { color, rgba, polyline3, polygon3, vec3 } from '../../kit.js';
import { VERTICAL, HORIZONTAL, bundlePoint, horizontalBasis, horizontalLift } from './shared.js';

export const FLOOR = -1.9;
/** λ: how strongly the tiles twist in the curvature scenes. */
export const TWIST = 0.5;
/** Height where the horizontal lifts start. */
export const LIFT_START = -0.8;
const TILE_SITES = [-1.6, -0.8, 0, 0.8, 1.6];
const FIBRE_SITES = [-1.6, 0, 1.6];

export function drawFloor(ctx, cam, alpha = 1) {
  for (let k = -4; k <= 4; k++) {
    const v = k * 0.5;
    polyline3(ctx, cam, [bundlePoint(-2, v, FLOOR), bundlePoint(2, v, FLOOR)], { color: color.line, width: 1, alpha });
    polyline3(ctx, cam, [bundlePoint(v, -2, FLOOR), bundlePoint(v, 2, FLOOR)], { color: color.line, width: 1, alpha });
  }
}

export function drawFibres(ctx, cam, alpha = 1) {
  for (const x of FIBRE_SITES) {
    for (const y of FIBRE_SITES) {
      polyline3(ctx, cam, [bundlePoint(x, y, FLOOR), bundlePoint(x, y, 1.9)], { color: VERTICAL, width: 1.5, alpha: 0.55 * alpha });
    }
  }
}

/** Horizontal tiles at height z for the connection with twist λ. */
export function drawTiles(ctx, cam, lambda, { alpha = 1, z = 0, size = 0.28 } = {}) {
  if (alpha <= 0.003) return;
  const tiles = [];
  for (const x of TILE_SITES) {
    for (const y of TILE_SITES) {
      const [e1, e2] = horizontalBasis(x, y, lambda);
      const c = [x, y, z];
      const corner = (a, b) => {
        const p = vec3.add(c, vec3.add(vec3.scale(e1, a * size), vec3.scale(e2, b * size)));
        return bundlePoint(...p);
      };
      tiles.push({ pts: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], depth: cam.project(bundlePoint(x, y, z)).z });
    }
  }
  tiles.sort((a, b) => b.depth - a.depth);
  for (const { pts } of tiles) polygon3(ctx, cam, pts, { fill: rgba(HORIZONTAL, 0.2), stroke: rgba(HORIZONTAL, 0.85), width: 1.5, alpha });
}

/** Flat horizontal sheets z = const: the integral surfaces when λ = 0. */
export function drawSheets(ctx, cam, alpha = 1, levels = [-1, 0, 1]) {
  for (const z of levels) {
    const pts = [bundlePoint(-2, -2, z), bundlePoint(2, -2, z), bundlePoint(2, 2, z), bundlePoint(-2, 2, z)];
    polygon3(ctx, cam, pts, { fill: rgba(HORIZONTAL, 0.08), stroke: rgba(HORIZONTAL, 0.4), alpha });
  }
}

/** A closed base loop: n points of r(φ)·(cos φ, sin φ) around (cx, cy). */
export function loopPoints(radius, { n = 240, cx = 0, cy = 0 } = {}) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const phi = (i / n) * 2 * Math.PI;
    const r = typeof radius === 'function' ? radius(phi) : radius;
    return [cx + r * Math.cos(phi), cy + r * Math.sin(phi)];
  });
}

/** Signed area of a closed polygon (shoelace). */
export const enclosedArea = (loop) => loop.slice(1).reduce((s, [x1, y1], i) => s + 0.5 * (loop[i][0] * y1 - loop[i][1] * x1), 0);

/**
 * The loop on the floor and its horizontal lift from height z0, drawn up to `progress`.
 * Returns the lifted points.
 */
export function drawLoopAndLift(ctx, cam, loop, z0, lambda, { progress = 1, alpha = 1 } = {}) {
  const lifted = horizontalLift(loop, z0, lambda);
  polyline3(ctx, cam, loop.map(([x, y]) => bundlePoint(x, y, FLOOR)), { color: color.ink, width: 2.5, alpha: 0.8 * alpha });
  polyline3(ctx, cam, lifted.map((p) => bundlePoint(...p)), { color: HORIZONTAL, width: 4, alpha, progress });
  return lifted;
}
