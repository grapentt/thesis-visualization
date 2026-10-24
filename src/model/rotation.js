// 3 × 3 rotation matrices as arrays of rows.

import { normalize, cross } from './vec3.js';

export const IDENTITY = Object.freeze([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);

/** Rotation by `angle` (rad) about unit-or-not `axis` (Rodrigues). */
export function axisAngle(axis, angle) {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    [c + x * x * t, x * y * t - z * s, x * z * t + y * s],
    [y * x * t + z * s, c + y * y * t, y * z * t - x * s],
    [z * x * t - y * s, z * y * t + x * s, c + z * z * t],
  ];
}

/** exp of the skew matrix of w: rotation by |w| about w. */
export function expRotation(w) {
  const angle = Math.hypot(w[0], w[1], w[2]);
  return angle < 1e-12 ? IDENTITY.map((r) => [...r]) : axisAngle(w, angle);
}

export const apply = (R, p) => [0, 1, 2].map((i) => R[i][0] * p[0] + R[i][1] * p[1] + R[i][2] * p[2]);

export const multiply = (A, B) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]));

export const transpose = (A) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => A[j][i]));

/** Rotation angle of R in radians, 0 … π. */
export const rotationAngle = (R) => Math.acos(Math.max(-1, Math.min(1, (R[0][0] + R[1][1] + R[2][2] - 1) / 2)));

/** Interpolate from the identity to R (same axis, fraction u of the angle). */
export function partialRotation(R, u) {
  const angle = rotationAngle(R);
  if (angle < 1e-9) return IDENTITY.map((r) => [...r]);
  const axis = [R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]];
  return axisAngle(axis, angle * u);
}

/** A unit vector perpendicular to v. */
export function perpendicular(v) {
  const helper = Math.abs(v[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return normalize(cross(v, helper));
}
