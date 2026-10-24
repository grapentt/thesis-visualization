// The torus cut open into a rectangle: θ (base direction) to the right,
// φ (fibre direction) upwards. Opposite edges are glued.
// A connection is drawn as a field of short horizontal dashes with slope
// dφ/dθ = λ · c(θ); the connection 1-form is A = dφ − λ c(θ) dθ.

import { text, type, color, line, arrow } from '../../kit.js';
import { VERTICAL, HORIZONTAL } from './shared.js';

const TAU = 2 * Math.PI;
export const RECT = { x0: 120, x1: 840, y0: 230, y1: 770 };
export const X = (theta) => RECT.x0 + (theta / TAU) * (RECT.x1 - RECT.x0);
export const Y = (phi) => RECT.y1 - (phi / TAU) * (RECT.y1 - RECT.y0);
const PX_THETA = (RECT.x1 - RECT.x0) / TAU;
const PX_PHI = (RECT.y1 - RECT.y0) / TAU;

export const FIBRES = Array.from({ length: 8 }, (_, k) => ((k + 0.5) * TAU) / 8);

/** Slope of the horizontal direction, dφ/dθ, for tilt λ. */
export const slope = (theta, lambda) => lambda * 0.8 * Math.sin(theta);
/** Horizontal lift through (θs, φs): φ(θ) = φs + 0.8 λ (cos θs − cos θ). */
export const lift = (thetaStart, phiStart, lambda) => (theta) => phiStart + lambda * 0.8 * (Math.cos(thetaStart) - Math.cos(theta));

/** Unit screen direction of the horizontal dash at θ. */
export function dashDirection(theta, lambda) {
  const dx = PX_THETA;
  const dy = -slope(theta, lambda) * PX_PHI;
  const n = Math.hypot(dx, dy);
  return [dx / n, dy / n];
}

/** Frame, fibres and the base axis M underneath. */
export function drawRectangle(ctx, alpha = 1) {
  if (alpha <= 0.003) return;
  const { x0, x1, y0, y1 } = RECT;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  for (const theta of FIBRES) line(ctx, X(theta), y0, X(theta), y1, { color: VERTICAL, width: 2.5, alpha: 0.85 });
  line(ctx, x0, 835, x1, 835, { color: color.ink, width: 3 });
  for (const theta of FIBRES.filter((_, k) => k % 2 === 1)) {
    arrow(ctx, X(theta), y1 + 8, X(theta), 826, { color: color.muted, width: 1.5, head: 9, dash: [3, 4] });
  }
  text(ctx, 'base M (θ)', x1, 868, { ...type.math, size: 22, align: 'right' });
  text(ctx, 'π', X(FIBRES[1]) + 10, 808, { ...type.math, size: 22, color: color.muted });
  text(ctx, 'fibre (φ)', X(FIBRES[0]) + 8, y0 - 12, { ...type.math, size: 22, color: VERTICAL });
  text(ctx, 'the torus cut open: opposite edges are glued', x0, y0 - 40, { ...type.note });
  ctx.restore();
}

/** The horizontal distribution as short dashes on a grid. */
export function drawDashes(ctx, lambda, alpha = 1, length = 22) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = HORIZONTAL;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    for (let j = 0; j < 10; j++) {
      const theta = ((i + 0.5) * TAU) / 14;
      const phi = ((j + 0.5) * TAU) / 10;
      const [dx, dy] = dashDirection(theta, lambda);
      ctx.beginPath();
      ctx.moveTo(X(theta) - (dx * length) / 2, Y(phi) - (dy * length) / 2);
      ctx.lineTo(X(theta) + (dx * length) / 2, Y(phi) + (dy * length) / 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
