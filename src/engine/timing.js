// Time helpers used by every scene. A scene receives its local time `t`
// (seconds since the scene started) and derives all motion from it, so any
// frame can be rendered at any moment — which is what makes scrubbing and
// frame-exact export possible.

export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

export const lerp = (a, b, u) => a + (b - a) * u;

/** Interpolate in log space; use it for zooms so they feel uniform. */
export const lerpLog = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));

/** Cubic ease-in-out on [0, 1]. */
export const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/** Linear progress from 0 (at t = a) to 1 (at t = b), clamped. */
export const lin = (t, a, b) => clamp((t - a) / (b - a));

/** Eased progress from 0 (at t = a) to 1 (at t = b). The workhorse for fades and moves. */
export const seg = (t, a, b) => easeInOut(lin(t, a, b));

/**
 * Fade in over [a, b] and, if given, back out over [c, d].
 * fade(t, 1, 2)       → 0 … 1 and stays at 1
 * fade(t, 1, 2, 5, 6) → 0 … 1 … 0
 */
export function fade(t, a, b, c, d) {
  const fadeIn = seg(t, a, b);
  return c === undefined ? fadeIn : Math.min(fadeIn, 1 - seg(t, c, d));
}

/** Out-and-back motion: `cycles` full sine periods between a and b, zero outside. */
export const oscillate = (t, a, b, cycles = 1) =>
  t >= a && t <= b ? Math.sin(2 * Math.PI * cycles * lin(t, a, b)) : 0;
