// Minimal 3-vector helpers on plain [x, y, z] arrays.

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (a) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a) => scale(a, 1 / length(a));

/** Unit vector along axis k (0 = x, 1 = y, 2 = z), scaled by s. */
export const axisVector = (k, s = 1) => [0, 1, 2].map((i) => (i === k ? s : 0));

/** Rotate point p about the line through `origin` with unit direction `axis` (Rodrigues). */
export function rotateAbout(p, origin, axis, angle) {
  const v = sub(p, origin);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const d = dot(axis, v);
  const k = cross(axis, v);
  return [0, 1, 2].map((i) => origin[i] + v[i] * c + k[i] * s + axis[i] * d * (1 - c));
}
