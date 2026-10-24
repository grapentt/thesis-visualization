// Geometry, data and conventions shared by the Part 0 scenes.

import {
  color, camera, molecule, configuration, sigma, springNetwork, springEnergy, zeroMomentumRotations, centred,
  vec3, rotation, hexToRgb,
} from '../../kit.js';
import { createRng } from '../../engine/random.js';

/** Vertical = symmetry directions (along the fibre), horizontal = real changes. */
export const VERTICAL = color.gold;
export const HORIZONTAL = color.soft;

// ---- energy colours --------------------------------------------------------

const ENERGY_STOPS = ['#1d2f55', '#245f86', '#3a9aa5', '#9fcf9a', '#f2cf63'].map(hexToRgb);

/** Colour for a normalised energy u ∈ [0, 1] (low = deep blue, high = gold). */
export function energyColor(u) {
  const x = Math.max(0, Math.min(1, u)) * (ENERGY_STOPS.length - 1);
  const k = Math.min(ENERGY_STOPS.length - 2, Math.floor(x));
  const f = x - k;
  const rgb = ENERGY_STOPS[k].map((v, i) => Math.round(v + (ENERGY_STOPS[k + 1][i] - v) * f));
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// ---- the molecule: energy, rigid motions, generators -------------------------

const springs = springNetwork(molecule.positions, molecule.count, molecule.bonds);
/** Potential energy U(x) in eV: harmonic springs between all atom pairs. */
export const energyOf = (X) => springEnergy(X, springs);

export const atomsOf = (X) => Array.from({ length: X.length / 3 }, (_, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
export const flatten = (points) => points.flat();
export const centroidOf = (X) => vec3.scale(atomsOf(X).reduce(vec3.add, [0, 0, 0]), 3 / X.length);

/** Apply x_i ↦ R (x_i − c) + c + a to every atom. */
export function rigidMotion(X, R, a = [0, 0, 0], c = centroidOf(X)) {
  return flatten(atomsOf(X).map((p) => vec3.add(vec3.add(rotation.apply(R, vec3.sub(p, c)), c), a)));
}

/** Tangent vectors at configuration X, one 3-vector per atom. */
export const generators = {
  translation: (X, direction) => atomsOf(X).map(() => direction),
  rotation: (X, axis) => {
    const c = centroidOf(X);
    return atomsOf(X).map((p) => vec3.cross(axis, vec3.sub(p, c)));
  },
  /** Derivative of a deformation family f(ε) at ε = 0. */
  shape: (deform) => {
    const h = 1e-4;
    const a = atomsOf(deform(-h));
    const b = atomsOf(deform(h));
    return a.map((p, i) => vec3.scale(vec3.sub(b[i], p), 1 / (2 * h)));
  },
};

// ---- energy samples for the "U(x)" scene ------------------------------------

const rng = createRng(7);
export const energySamples = Array.from({ length: 70 }, () => {
  const s = 1.3 * sigma.soft * rng.gauss();
  const q = 1.3 * sigma.stiff * rng.gauss();
  const base = configuration(s, q);
  const X = base.map((x) => x + 0.03 * rng.gauss());
  return { X, U: energyOf(X) };
});

// ---- a loop of shapes for the molecule (zero angular momentum) --------------

const X0 = molecule.positions;
const at = (i) => molecule.atom(X0, i);
const TORSION_AXIS = vec3.normalize(vec3.sub(at(1), at(0)));
const BEND_AXIS = vec3.normalize(vec3.cross(vec3.sub(at(0), at(1)), vec3.sub(at(3), at(1))));
export const MASSES = [12, 12, 16, 14, 1];

/** Shape with torsion a (O3 and H5 about bond 1–2) and bend b (N4 about atom 2), radians. */
export function shapeAB(a, b) {
  const P = [0, 1, 2, 3, 4].map(at);
  P[2] = vec3.rotateAbout(P[2], at(1), TORSION_AXIS, a);
  P[4] = vec3.rotateAbout(P[4], at(1), TORSION_AXIS, a);
  P[3] = vec3.rotateAbout(P[3], at(1), BEND_AXIS, b);
  return P;
}

/** The loop (a, b) = scale · (1.5 cos 2πτ, 0.5 sin 2πτ), an ellipse around the rest shape. */
export const LOOP = { a: 1.5, b: 0.5 };
export const loopCoordinates = (tau, s = 1) => [s * LOOP.a * Math.cos(2 * Math.PI * tau), s * LOOP.b * Math.sin(2 * Math.PI * tau)];
export const loopArea = (s = 1) => Math.PI * LOOP.a * LOOP.b * s * s;

const COM0 = vec3.scale(at(0).map((_, k) => [0, 1, 2, 3, 4].reduce((acc, i) => acc + MASSES[i] * at(i)[k], 0)), 1 / MASSES.reduce((a, b) => a + b, 0));

/** Rotations along one loop at the given size, plus the holonomy angle (degrees). */
export function loopHolonomy(s = 1, steps = 800) {
  const rotations = zeroMomentumRotations((tau) => shapeAB(...loopCoordinates(tau, s)), MASSES, steps);
  return { rotations, angle: (rotation.rotationAngle(rotations[steps]) * 180) / Math.PI };
}

/** Accumulated rotation after following the loop to τ (τ may exceed 1: repeated loops). */
export function loopRotation(holonomy, tau) {
  const loops = Math.floor(tau);
  const within = tau - loops;
  const last = holonomy.rotations[holonomy.rotations.length - 1];
  let R = holonomy.rotations[Math.round(within * (holonomy.rotations.length - 1))];
  for (let k = 0; k < loops; k++) R = rotation.multiply(last, R);
  return R;
}

/** Space positions after following the loop to τ (τ may exceed 1: repeated loops). */
export function loopConfiguration(holonomy, tau, s = 1) {
  const within = tau - Math.floor(tau);
  const R = loopRotation(holonomy, tau);
  const body = centred(shapeAB(...loopCoordinates(within, s)), MASSES);
  return flatten(body.map((q) => vec3.add(rotation.apply(R, q), COM0)));
}

// ---- the torus T² as a circle of circles -------------------------------------

export const TORUS = { R: 2, r: 0.75 };
export const torusPoint = (theta, phi) => {
  const w = TORUS.R + TORUS.r * Math.cos(phi);
  return [w * Math.cos(theta), TORUS.r * Math.sin(phi), w * Math.sin(theta)];
};
export const torusNormal = (theta, phi) => [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
/** Unit tangent along the fibre (small circle, φ direction). */
export const fibreTangent = (theta, phi) => [-Math.sin(phi) * Math.cos(theta), Math.cos(phi), -Math.sin(phi) * Math.sin(theta)];
/** Unit tangent along the big circle (θ direction). */
export const baseTangent = (theta) => [-Math.sin(theta), 0, Math.cos(theta)];
/** Energy on the torus: depends on θ only, so it is invariant along every fibre. Range ≈ 0 … 1. */
export const torusEnergy = (theta) => 0.5 + 0.34 * Math.cos(theta - 0.6) + 0.13 * Math.sin(2 * theta + 0.3);
export const torusCamera = (options = {}) => camera({ yaw: 0.25, pitch: 0.62, scale: 112, cx: 540, cy: 470, focal: 12, ...options });
/** Is the torus surface at (θ, φ) turned towards the camera? */
export const facesCamera = (cam, theta, phi) => cam.rotate(torusNormal(theta, phi))[2] < 0.05;
/** Base circle M drawn underneath the torus. */
export const BASE_Y = -1.75;
export const basePoint = (theta) => [TORUS.R * Math.cos(theta), BASE_Y, TORUS.R * Math.sin(theta)];

// ---- a bundle over the plane: fibres are vertical lines -----------------------

/** Bundle coordinates (x, y | z) → world (x, z, y), so the fibre direction is "up". */
export const bundlePoint = (x, y, z) => [x, z, y];
export const bundleCamera = (options = {}) => camera({ yaw: 0.55, pitch: 0.42, scale: 105, cx: 560, cy: 520, focal: 14, ...options });
/**
 * Horizontal plane at (x, y) for the connection A = dz − λ·½(x dy − y dx):
 * spanned by e₁ = (1, 0, −λy/2) and e₂ = (0, 1, λx/2).
 */
export const horizontalBasis = (x, y, lambda) => [
  [1, 0, (-lambda * y) / 2],
  [0, 1, (lambda * x) / 2],
];
/**
 * Horizontal lift of a closed base loop (array of [x, y], closed) starting at height z0.
 * Returns the lifted points [x, y, z]; the last z minus z0 is the holonomy, λ × enclosed area.
 */
export function horizontalLift(loop, z0, lambda) {
  const out = [[...loop[0], z0]];
  let z = z0;
  for (let i = 1; i < loop.length; i++) {
    const [x0, y0] = loop[i - 1];
    const [x1, y1] = loop[i];
    z += (lambda / 2) * (x0 * y1 - y0 * x1);
    out.push([x1, y1, z]);
  }
  return out;
}
