// The molecule of this video and the two symmetries acting on it.
//
// Nitroethane in a united-atom model: the CH₃ and CH₂ groups are single beads.
//   1 C (CH₃)   2 C (CH₂)   3 N   4 O   5 O
// The N and its two O form a '<' that opens along +x; the C₂–N bond lies on the x-axis.
// Two groups act on configurations X ∈ ℝ¹⁵ (flat arrays [x1, y1, z1, x2, …]):
//   SO(3)  rotates every bead about the centre of mass (orientation),
//   U(1)   the rotor: turns the two O about the C₂–N axis (a local symmetry).

import { color, camera, vec3, rotation, polyline3, zeroMomentumRotations, centred } from '../../kit.js';
import { Molecule } from '../../model/molecule.js';

/** Vertical for SO(3) (orientation), horizontal (shape changes), and the rotor U(1). */
export const VERTICAL = color.gold;
export const HORIZONTAL = color.soft;
export const ROTOR = '#c58af9';

const LIP = 1.22; // N–O bond length, Å
const HALF_MOUTH = (62.65 * Math.PI) / 180; // half the O–N–O angle (125.3°, as in nitromethane)

export const nitro = new Molecule({
  elements: ['C', 'C', 'N', 'O', 'O'],
  positions: [
    -0.52, 1.2, 0.78,
    0, 0, 0,
    1.47, 0, 0,
    1.47 + LIP * Math.cos(HALF_MOUTH), LIP * Math.sin(HALF_MOUTH), 0,
    1.47 + LIP * Math.cos(HALF_MOUTH), -LIP * Math.sin(HALF_MOUTH), 0,
  ],
  bonds: [[0, 1], [1, 2], [2, 3], [2, 4]],
});

/** United-atom masses: CH₃ 15, CH₂ 14, N 14, O 16, O 16. */
export const MASSES = [15, 14, 14, 16, 16];
export const X0 = nitro.positions;
export const LIPS = [3, 4];
export const MOUTH = [2, 3, 4];

export const atomsOf = (X) => Array.from({ length: X.length / 3 }, (_, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
export const flatten = (points) => points.flat();
const TOTAL_MASS = MASSES.reduce((a, b) => a + b, 0);
export const centreOfMass = (X) => atomsOf(X).reduce((c, p, i) => vec3.add(c, vec3.scale(p, MASSES[i] / TOTAL_MASS)), [0, 0, 0]);

/** Camera centred on the molecule's centroid at rest. */
export const nitroCamera = (options = {}) => camera({ center: nitro.centroid, yaw: 0.55, pitch: 0.3, scale: 150, ...options });

// ---- the two actions ----------------------------------------------------------

/** SO(3): rotate every bead by R about the centre of mass c (default: the configuration's own). */
export function rotate(X, R, c = centreOfMass(X)) {
  return flatten(atomsOf(X).map((p) => vec3.add(rotation.apply(R, vec3.sub(p, c)), c)));
}

/** The rotor axis at X: through N, along the C₂ → N bond. */
export function rotorAxis(X) {
  const n = nitro.atom(X, 2);
  return { origin: n, u: vec3.normalize(vec3.sub(n, nitro.atom(X, 1))) };
}

/** U(1): turn both O by φ (radians) about the rotor axis. */
export function turnRotor(X, phi) {
  const { origin, u } = rotorAxis(X);
  const Y = X.slice();
  for (const i of LIPS) Molecule.setAtom(Y, i, vec3.rotateAbout(nitro.atom(X, i), origin, u, phi));
  return Y;
}

/** A shape change that is not the rotor: bend the CH₃ bead about C₂, in the C–C–N plane (radians). */
export function bend(X, beta) {
  const c2 = nitro.atom(X, 1);
  const axis = vec3.normalize(vec3.cross(vec3.sub(nitro.atom(X, 0), c2), vec3.sub(nitro.atom(X, 2), c2)));
  const Y = X.slice();
  Molecule.setAtom(Y, 0, vec3.rotateAbout(nitro.atom(X, 0), c2, axis, beta));
  return Y;
}

/** The circle a lip runs around under the rotor: centre, radius and an orthonormal basis of its plane. */
export function rotorCircle(X, lip = 3) {
  const { origin, u } = rotorAxis(X);
  const d = vec3.sub(nitro.atom(X, lip), origin);
  const along = vec3.dot(d, u);
  const centre = vec3.add(origin, vec3.scale(u, along));
  const radial = vec3.sub(d, vec3.scale(u, along));
  const radius = vec3.length(radial);
  const e1 = vec3.scale(radial, 1 / radius);
  return { centre, radius, e1, e2: vec3.cross(u, e1), u };
}

/** Point of the rotor circle at angle s from the lip's current position. */
export const circlePoint = ({ centre, radius, e1, e2 }, s) =>
  vec3.add(centre, vec3.add(vec3.scale(e1, radius * Math.cos(s)), vec3.scale(e2, radius * Math.sin(s))));

/** Draw the rotor circle through the lips of X (from angle `from` over `sweep` radians). */
export function drawRotorCircle(ctx, cam, X, { from = 0, sweep = 2 * Math.PI, color: tint = ROTOR, width = 2.5, alpha = 1, dash = [] } = {}) {
  if (alpha <= 0.003 || Math.abs(sweep) < 1e-3) return;
  const circle = rotorCircle(X);
  const n = Math.max(2, Math.ceil(Math.abs(sweep) * 24));
  const points = Array.from({ length: n + 1 }, (_, k) => circlePoint(circle, from + (sweep * k) / n));
  polyline3(ctx, cam, points, { color: tint, width, alpha, dash });
}

/** The rotor axis as a dashed line from behind C₂ to beyond the mouth. */
export function drawRotorAxis(ctx, cam, X, { alpha = 1, color: tint = ROTOR, before = 0.9, after = 1.8, width = 2 } = {}) {
  const { origin, u } = rotorAxis(X);
  const c2 = nitro.atom(X, 1);
  const from = vec3.sub(c2, vec3.scale(u, before));
  const to = vec3.add(origin, vec3.scale(u, after));
  polyline3(ctx, cam, [from, to], { color: tint, width, alpha, dash: [7, 7] });
  return cam.project(to);
}

// ---- motions with zero angular momentum -------------------------------------

/** Rotations R(τ) that keep L = 0 while the shape follows shapeAt(τ), τ ∈ [0, 1]. */
export function zeroMomentum(shapeAt, steps = 800) {
  return zeroMomentumRotations((tau) => atomsOf(shapeAt(tau)), MASSES, steps);
}

/** Space positions of shape X_body (any representative) placed with rotation R about the start's centre of mass. */
export function placed(X, R, c = centreOfMass(X0)) {
  const body = centred(atomsOf(X), MASSES);
  return flatten(body.map((q) => vec3.add(rotation.apply(R, q), c)));
}
