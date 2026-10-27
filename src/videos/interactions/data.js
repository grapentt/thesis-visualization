// Everything "Parts and Poses" computes, once, at import (storyboard §2.8): seeded, no clock.
// Cheap guards throw here, so a wrong number stops the page; the expensive checks live in
// tests/interactions.test.mjs. Numeric only: imports src/model/*, the engine's random numbers
// and the sibling numeric modules, never the kit.
//
// Conventions: configurations are flat [x, y, z, …] in Å, water first in every pair; angles in
// degrees unless a name says rad; energies in kcal/mol; rotations as nested 3 × 3 rows, or flat
// row-major Float64Arrays (9 per draw) in the bulk samples.

import { createRng } from '../../engine/random.js';
import { add, sub, scale, dot, cross, length, normalize } from '../../model/vec3.js';
import { apply, axisAngle, expRotation, multiply, transpose, rotationAngle } from '../../model/rotation.js';
import { centred as massCentred } from '../../model/rigidBody.js';
import {
  DEG, BETA, S0, COULOMB, LJ, WATER, PEROXIDE, buildWater, buildPeroxide, dipeptide, bisector, centroid, waterInternals,
  peroxideInternals, poseCoords, place, kabsch, V, join, U_W, U_P, U_int, gradU_W, gradU_P, forcesInt,
  scoresSmallNoise, netForceTorque, rigidSplit, haar, shapeSamplers, zeroMomentum, quotientInner, fibrePath,
  pushforward,
} from './toy.js';
import {
  springMatrices, interactionTweedie, plugInError, shrinkRatio, sampleNoisy, posterior, reverseSDE,
  scoreDecomposed, scoreMonomers, applyMatrix, PAIR_SPREAD,
} from './springs.js';
import { LOG_W, twoPointTable, threePointW, pairW } from './lines.js';
import { leastSquares } from './linalg.js';

const guard = (ok, what) => {
  if (!ok) throw new Error(`interactions data: ${what}`);
};

const at = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const count = (X) => X.length / 3;
const pointsOf = (X) => Array.from({ length: count(X) }, (_, i) => at(X, i));
const distance = (X, i, Y, j) => Math.hypot(X[3 * i] - Y[3 * j], X[3 * i + 1] - Y[3 * j + 1], X[3 * i + 2] - Y[3 * j + 2]);
const maxAbs = (values) => values.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
const nested = (F, o = 0) => [[F[o], F[o + 1], F[o + 2]], [F[o + 3], F[o + 4], F[o + 5]], [F[o + 6], F[o + 7], F[o + 8]]];
const gauss3 = (rng, s = 1) => [s * rng.gauss(), s * rng.gauss(), s * rng.gauss()];
const centre = (X) => {
  const c = centroid(X);
  return X.map((v, k) => v - c[k % 3]);
};
const sd = (values) => {
  const m = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1));
};
/** Normal CDF (Abramowitz–Stegun 7.1.26, error < 1e-7). */
const normalCdf = (x) => {
  const t = 1 / (1 + (0.3275911 * Math.abs(x)) / Math.SQRT2);
  const e = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-(x * x) / 2);
  return x >= 0 ? 1 - e / 2 : e / 2;
};

const R0 = WATER.r0, THETA0 = WATER.theta0 / DEG, P = PEROXIDE;
const WATER_MASSES = WATER.masses, PEROXIDE_MASSES = PEROXIDE.masses;
const OXYGENS = { 3: [0], 4: [1, 2] }, HYDROGENS = { 3: [1, 2], 4: [0, 3] };

/** Closest intermolecular O···H contact, with atom indices in join(XA, XB) numbering. */
export function closestOH(XA, XB) {
  const nA = count(XA), nB = count(XB);
  let best = { length: Infinity, o: -1, h: -1 };
  const scan = (X, os, Y, hs, offO, offH) => {
    for (const o of os) for (const h of hs) {
      const d = distance(X, o, Y, h);
      if (d < best.length) best = { length: d, o: offO + o, h: offH + h };
    }
  };
  scan(XA, OXYGENS[nA], XB, HYDROGENS[nB], 0, nA);
  scan(XB, OXYGENS[nB], XA, HYDROGENS[nA], nA, 0);
  return best;
}

const DONOR = { 3: { 1: 0, 2: 0 }, 4: { 0: 1, 3: 2 } }; // hydrogen → its own oxygen

/**
 * The best real hydrogen bond between two molecules, or null: O···H in [1.5, 2.4] Å, the donor angle
 * O–H···O above 120°, and no heavy-atom clash (every intermolecular O···O above 2.4 Å). Indices as closestOH.
 */
export function hBond(XA, XB) {
  const nA = count(XA), nB = count(XB);
  for (const i of OXYGENS[nA]) for (const j of OXYGENS[nB]) if (distance(XA, i, XB, j) <= 2.4) return null;
  let best = null;
  const scan = (X, os, Y, hs, offO, offH) => {
    for (const o of os) for (const h of hs) {
      const d = distance(X, o, Y, h);
      if (d < 1.5 || d > 2.4 || (best && d >= best.length)) continue;
      const D = DONOR[count(Y)][h], a = sub(at(Y, D), at(Y, h)), b = sub(at(X, o), at(Y, h));
      if (dot(a, b) / (length(a) * length(b)) < Math.cos(120 * DEG)) best = { length: d, o: offO + o, h: offH + h };
    }
  };
  scan(XA, OXYGENS[nA], XB, HYDROGENS[nB], 0, nA);
  scan(XB, OXYGENS[nB], XA, HYDROGENS[nA], nA, 0);
  return best;
}

// ---- stiff-limit bodies and pose energies (the hot loops) ---------------------------------

/** buildWater(r₀, r₀, θ) written into out (θ in rad). */
function waterInto(out, theta) {
  const s = R0 * Math.sin(theta / 2), c = R0 * Math.cos(theta / 2);
  out[0] = 0; out[1] = (-2 * c) / 3; out[2] = 0;
  out[3] = s; out[4] = c / 3; out[5] = 0;
  out[6] = -s; out[7] = c / 3; out[8] = 0;
  return out;
}

/** buildPeroxide({ tau }) at rest bonds and angles, written into out (τ in rad). */
function peroxideInto(out, tau) {
  const hx = P.oo / 2 - P.oh * Math.cos(P.a), hy = P.oh * Math.sin(P.a) * Math.cos(tau / 2), hz = P.oh * Math.sin(P.a) * Math.sin(tau / 2);
  const cy = hy / 2;
  out.set([-hx, hy - cy, -hz, -P.oo / 2, -cy, 0, P.oo / 2, -cy, 0, hx, hy - cy, hz]);
  return out;
}

/** A centroid-centred body turned by the flat rotation R[o…o+8] and moved to r[q…q+2], into out. */
function placeInto(out, body, R, o, r, q) {
  for (let i = 0; i < body.length; i += 3) {
    const x = body[i], y = body[i + 1], z = body[i + 2];
    out[i] = R[o] * x + R[o + 1] * y + R[o + 2] * z + r[q];
    out[i + 1] = R[o + 3] * x + R[o + 4] * y + R[o + 5] * z + r[q + 1];
    out[i + 2] = R[o + 6] * x + R[o + 7] * y + R[o + 8] * z + r[q + 2];
  }
  return out;
}

const QA = WATER.charges.map((q) => q * COULOMB), QB = PEROXIDE.charges, LJ4 = 4 * LJ.epsilon, SIGMA2 = LJ.sigma ** 2;
/** U_int of a water and a peroxide, as toy.U_int, written out for the hot loops (3× faster). */
function waterPeroxideEnergy(XA, XB) {
  let U = 0;
  for (let i = 0; i < 3; i++) {
    const ax = XA[3 * i], ay = XA[3 * i + 1], az = XA[3 * i + 2], qi = QA[i];
    for (let j = 0; j < 4; j++) {
      const dx = XB[3 * j] - ax, dy = XB[3 * j + 1] - ay, dz = XB[3 * j + 2] - az;
      U += (qi * QB[j]) / Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }
  for (let j = 1; j < 3; j++) {
    const dx = XB[3 * j] - XA[0], dy = XB[3 * j + 1] - XA[1], dz = XB[3 * j + 2] - XA[2];
    const s2 = SIGMA2 / (dx * dx + dy * dy + dz * dz), s6 = s2 * s2 * s2;
    U += LJ4 * (s6 * s6 - s6);
  }
  return U;
}

const PLACED = new Float64Array(12);
/** U_int of water XA (centred at the origin) and peroxide body XB at pose (R, r). */
const poseEnergy = (XA, XB, R, o, r, q) => waterPeroxideEnergy(XA, placeInto(PLACED, XB, R, o, r, q));

/** out = exp(w) · R for flat rotations (Rodrigues written out). */
function turnInto(out, wx, wy, wz, R) {
  const a = Math.hypot(wx, wy, wz);
  if (a < 1e-12) return out.set(R);
  const x = wx / a, y = wy / a, z = wz / a, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  const e = [c + x * x * t, x * y * t - z * s, x * z * t + y * s, y * x * t + z * s, c + y * y * t, y * z * t - x * s, z * x * t - y * s, z * y * t + x * s, c + z * z * t];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[3 * i + j] = e[3 * i] * R[j] + e[3 * i + 1] * R[3 + j] + e[3 * i + 2] * R[6 + j];
}

/**
 * createRng(seed) with normals by Marsaglia's polar method (two per logarithm, about twice as fast as
 * Box–Muller): the generator of the long Monte Carlo loops.
 */
function fastRng(seed) {
  const rng = createRng(seed);
  let spare = null;
  const gauss = () => {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u, v, q;
    do {
      u = 2 * rng.uniform() - 1;
      v = 2 * rng.uniform() - 1;
      q = u * u + v * v;
    } while (q >= 1 || q === 0);
    const f = Math.sqrt((-2 * Math.log(q)) / q);
    spare = v * f;
    return u * f;
  };
  return { uniform: rng.uniform, gauss };
}

{
  const A = buildWater(R0, R0, 98 * DEG), B = buildPeroxide({ tau: -37 * DEG });
  const a = waterInto(new Float64Array(9), 98 * DEG), b = peroxideInto(new Float64Array(12), -37 * DEG);
  guard(maxAbs(A.map((v, i) => v - a[i])) < 1e-12 && maxAbs(B.map((v, i) => v - b[i])) < 1e-12, 'fast builders match buildWater, buildPeroxide');
}

const WATER_REST = buildWater();
const PEROXIDE_REST = buildPeroxide();

// ---- scene 01, 03: monomer pictures ---------------------------------------------------------

/** Scene 01: six thermal samples of each flexible molecule (seed 11), centred, bisector or O–O fixed. */
export const monomerSamples = (() => {
  const rng = createRng(11);
  const water = Array.from({ length: 6 }, () => {
    const s = shapeSamplers.water(rng, { flexible: true });
    return buildWater(s.r1, s.r2, s.theta);
  });
  const peroxide = Array.from({ length: 6 }, () => buildPeroxide(shapeSamplers.peroxide(rng, { flexible: true })));
  return { water, peroxide };
})();

/** Scene 03: the small-noise score −β∇U_W of a distorted water, its net force and torque, and the 90 px arrow scale. */
export const monomerScore03 = (() => {
  const X = buildWater(R0 + 0.06, R0, (THETA0 + 12) * DEG);
  const s = gradU_W(X).map((v) => -BETA * v);
  const { force, torque } = netForceTorque(X, s);
  const largest = Math.max(...[0, 1, 2].map((i) => length(at(s, i))));
  guard(force < 1e-12 && torque < 1e-12, `scene 03 net force ${force}, torque ${torque}`);
  return { X, s, force, torque, pxPerUnit: 90 / largest };
})();

// ---- scene 02: the posterior behind one noisy water ----------------------------------------

/**
 * Scene 02 (seed 202): a flexible water x₀ (planar, face-on), its noisy copy z (σ = 0.35 Å, re-centred),
 * and `count` centred proposals (flexible shapes, Haar orientations; the first is x₀ itself) weighted
 * by e^{−|z − x|²/2σ²}. Returns the posterior mean, N_eff = (Σw)²/Σw², and the 24 heaviest proposals as
 * ghosts (weight relative to the heaviest), followed by x₀ (isX0) when it is not among them.
 */
export function waterPosterior(count = 20000) {
  const rng = createRng(202), sigma = 0.35;
  const s0 = shapeSamplers.water(rng, { flexible: true });
  const x0 = buildWater(s0.r1, s0.r2, s0.theta);
  const z = centre(x0.map((v) => v + sigma * rng.gauss()));
  const proposals = [x0];
  for (let k = 1; k < count; k++) {
    const s = shapeSamplers.water(rng, { flexible: true });
    proposals.push(place(buildWater(s.r1, s.r2, s.theta), haar(rng), [0, 0, 0]));
  }
  const logw = proposals.map((x) => -x.reduce((acc, v, i) => acc + (z[i] - v) ** 2, 0) / (2 * sigma * sigma));
  const top = Math.max(...logw);
  const w = logw.map((v) => Math.exp(v - top));
  const total = w.reduce((a, b) => a + b, 0);
  const mean = z.map((_, i) => proposals.reduce((acc, x, k) => acc + w[k] * x[i], 0) / total);
  const nEff = total ** 2 / w.reduce((acc, v) => acc + v * v, 0);
  const order = w.map((v, k) => k).sort((a, b) => w[b] - w[a]).slice(0, 24);
  if (!order.includes(0)) order.push(0);
  return {
    sigma, count, x0, z, mean, nEff,
    ghosts: order.map((k) => ({ X: proposals[k], weight: w[k] / w[order[0]], isX0: k === 0 })),
    x0Weight: w[0] / w[order[0]],
  };
}

/** Scene 02 posterior: 20 000 proposals, 60 000 if N_eff falls below 30. */
export const posterior02 = (() => {
  const p = waterPosterior(20000);
  return p.nEff >= 30 ? p : waterPosterior(60000);
})();

// ---- reference draws (scenes 07, 08, 09) ---------------------------------------------------

/**
 * Seed 61: 200 000 draws of the reference ν in the stiff limit (§2.4): θ, τ (rad) by inverse CDF,
 * Haar R (flat, 9 per draw), r ~ N(0, s₀²I) = c_B − c_A (water centred at the origin, bisector +y),
 * with U_int, u and d. `flexible`: the first 4 000 poses with bonds and angles from their thermal
 * Gaussians (seed 62), as { XA, XB }. `pairAt(n)` builds draw n.
 */
export const referenceDraws = (() => {
  const N = 200000, rng = fastRng(61);
  const theta = new Float64Array(N), tau = new Float64Array(N), R = new Float64Array(9 * N), r = new Float64Array(3 * N);
  const Uint = new Float64Array(N), u = new Float64Array(N), d = new Float64Array(N);
  const XA = new Float64Array(9), XB = new Float64Array(12);
  for (let n = 0; n < N; n++) {
    theta[n] = shapeSamplers.theta(rng);
    tau[n] = shapeSamplers.tau(rng);
    R.set(haar(rng).flat(), 9 * n);
    r.set(gauss3(rng, S0), 3 * n);
    Uint[n] = poseEnergy(waterInto(XA, theta[n]), peroxideInto(XB, tau[n]), R, 9 * n, r, 3 * n);
    d[n] = Math.hypot(r[3 * n], r[3 * n + 1], r[3 * n + 2]);
    u[n] = r[3 * n + 1] / d[n];
  }
  const pairAt = (n) => ({
    XA: buildWater(R0, R0, theta[n]),
    XB: place(buildPeroxide({ tau: tau[n] }), nested(R, 9 * n), at(r, n)),
  });
  const flexRng = fastRng(62);
  const flexible = Array.from({ length: 4000 }, (_, n) => {
    const w = shapeSamplers.water(flexRng, { flexible: true });
    const p = shapeSamplers.peroxide(flexRng, { flexible: true });
    return {
      XA: buildWater(w.r1, w.r2, theta[n]),
      XB: place(buildPeroxide({ ...p, tau: tau[n] }), nested(R, 9 * n), at(r, n)),
    };
  });
  return { N, theta, tau, R, r, Uint, u, d, flexible, pairAt };
})();

{
  const { XA, XB } = referenceDraws.pairAt(17);
  guard(Math.abs(U_int(XA, XB) - referenceDraws.Uint[17]) < 1e-10, 'fast pose energy matches U_int');
}

// ---- docked pair, scene-11 start, dimer, trimer ---------------------------------------------

/** Steepest descent of U_int over molecule B's rigid pose (net force, torque about its centroid). */
function descendPose(XA, body, R, r, { steps = 3000, eta = 0.02 } = {}) {
  for (let k = 0; k < steps; k++) {
    const XB = place(body, R, r);
    const { forceVec, torqueVec } = netForceTorque(XB, forcesInt(XA, XB).FB);
    r = add(r, scale(forceVec, eta));
    R = multiply(expRotation(scale(torqueVec, eta)), R);
  }
  return { R, r, XB: place(body, R, r) };
}

/**
 * The docked pair (§2.3): the best of the 200 000 reference poses at rest shapes, refined by steepest
 * descent on peroxide's 6 pose numbers (3 000 steps: 400 leave a soft mode unconverged). { XA, XB, X (joined), R, r, U, u, d, hbond },
 * hbond = closest O···H with atom indices in PAIR_MOL numbering.
 */
export const DOCKED = (() => {
  const { R, r, N } = referenceDraws;
  let best = 0, bestU = Infinity;
  for (let n = 0; n < N; n++) {
    const U = poseEnergy(WATER_REST, PEROXIDE_REST, R, 9 * n, r, 3 * n);
    if (U < bestU) [best, bestU] = [n, U];
  }
  const fit = descendPose(WATER_REST, PEROXIDE_REST, nested(R, 9 * best), at(r, best));
  const XA = Array.from(WATER_REST), XB = fit.XB;
  const { u, d } = poseCoords(XA, XB);
  const out = { XA, XB, X: join(XA, XB), R: fit.R, r: fit.r, U: U_int(XA, XB), u, d, hbond: closestOH(XA, XB), bestDraw: bestU };
  guard(out.U < -5, `DOCKED U_int ${out.U}`);
  guard(out.hbond.length < 2.1 && out.hbond.o === 0 && out.hbond.h >= 3, `DOCKED: peroxide donates to water's O (${out.hbond.length} Å)`);
  guard(d >= 3 && d <= 3.4, `DOCKED d ${d}`);
  return out;
})();
export const D_DOCK = DOCKED.d;

/**
 * Scene 11's start X★: water θ = 109°, r₁ = r₂ = r₀ + 0.01; peroxide τ = 160°, r_OO = 1.48; DOCKED's
 * pose with c_B moved 0.6 Å outwards, the whole of peroxide then carried 20° about water's normal (z)
 * through c_A, and turned a further 30° about z. The carry moves c_B off DOCKED's direction, so X★
 * sits at u ≈ −0.75 and docking visibly moves the point along its fibre (to u ≈ −0.93).
 */
export const XSTAR = (() => {
  const XA = buildWater(R0 + 0.01, R0 + 0.01, 109 * DEG);
  const body = buildPeroxide({ oo: 1.48, tau: 160 * DEG });
  const carry = axisAngle([0, 0, 1], 20 * DEG);
  const r = apply(carry, scale(DOCKED.r, 1 + 0.6 / D_DOCK));
  const XB = place(body, multiply(multiply(carry, axisAngle([0, 0, 1], 30 * DEG)), DOCKED.R), r);
  const { u } = poseCoords(XA, XB);
  guard(u - DOCKED.u > 0.15, `X★ u ${u} vs DOCKED ${DOCKED.u}`);
  return { XA, XB, X: join(XA, XB), u };
})();

/** Two rest waters from a linear H-bond (O···O 2.9 Å, donor H on the line), donor's pose descended. */
export const DIMER_MIN = (() => {
  const XA = Array.from(WATER_REST);
  // donor: rotated so O→H1 points along +y, its plane turned 90° about the O···O line; O_D = O_A − 2.9 ŷ
  const R = multiply(axisAngle([0, 1, 0], Math.PI / 2), axisAngle([0, 0, 1], WATER.theta0 / 2));
  const oD = sub(at(XA, 0), [0, 2.9, 0]);
  const r = sub(oD, apply(R, at(WATER_REST, 0)));
  const start = place(WATER_REST, R, r);
  const fit = descendPose(XA, WATER_REST, R, r);
  const out = { XA, XB: fit.XB, X: join(XA, fit.XB), start, U: U_int(XA, fit.XB), hbond: closestOH(XA, fit.XB) };
  guard(Math.abs(out.U + 6.5) <= 0.5, `DIMER_MIN U_int ${out.U}`);
  return out;
})();

/** Peroxide's own C₂: 180° about the axis through the O–O midpoint towards the midpoint of its H. */
function peroxideC2(XB) {
  const m = scale(add(at(XB, 1), at(XB, 2)), 0.5);
  const R = axisAngle(sub(scale(add(at(XB, 0), at(XB, 3)), 0.5), m), Math.PI);
  return (X) => pointsOf(X).flatMap((p) => add(apply(R, sub(p, m)), m));
}

const totalGradient = (Xs /* [A, B, C] */) => {
  const [A, B, C] = Xs;
  const g = [gradU_W(A), gradU_P(B), gradU_W(C)];
  for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) {
    const { FA, FB } = forcesInt(Xs[i], Xs[j]);
    FA.forEach((f, k) => { g[i][k] -= f; });
    FB.forEach((f, k) => { g[j][k] -= f; });
  }
  return g;
};

/**
 * Scene 15: water A – peroxide B – water C. C starts as C₂(A) about peroxide's own axis, then all
 * atoms relax by x ← x − ηβ∇U (η = 2·10⁻⁴, 4 000 steps). { XA, XB, XC, X (TRIMER_MOL order), U, hbonds },
 * hbonds.AB and hbonds.CB with atom indices in TRIMER_MOL numbering.
 */
export const TRIMER = (() => {
  const Xs = [Array.from(DOCKED.XA), Array.from(DOCKED.XB), peroxideC2(DOCKED.XB)(DOCKED.XA)];
  for (let step = 0; step < 4000; step++) {
    const g = totalGradient(Xs);
    Xs.forEach((X, m) => X.forEach((v, k) => { X[k] = v - 2e-4 * BETA * g[m][k]; }));
  }
  const [XA, XB, XC] = Xs;
  const U = U_W(XA) + U_P(XB) + U_W(XC) + U_int(XA, XB) + U_int(XB, XC) + U_int(XA, XC);
  // both in TRIMER_MOL numbering (A 0–2, B 3–6, C 7–9)
  const cb = closestOH(XC, XB), toTrimer = (i) => (i < 3 ? 7 + i : i);
  const hbonds = { AB: closestOH(XA, XB), CB: { ...cb, o: toTrimer(cb.o), h: toTrimer(cb.h) } };
  guard(hbonds.AB.length < 2.1 && hbonds.CB.length < 2.1, `TRIMER H-bonds ${hbonds.AB.length}, ${hbonds.CB.length}`);
  guard(distance(XA, 0, XC, 0) > 3, 'TRIMER O_A···O_C > 3 Å');
  return { XA, XB, XC, X: join(XA, XB, XC), U, hbonds };
})();

// ---- scenes 04, 05, 06, 13: cheap invariance checks ------------------------------------------

/** Scenes 04, 05: the energies under the motions the scenes animate (all should be flat to 1e-10). */
export const invariance = (() => {
  const { XA, XB } = DOCKED;
  const U0 = U_int(XA, XB);
  const both = centroid(join(XA, XB));
  const turn = (X, R, c) => pointsOf(X).flatMap((p) => add(apply(R, sub(p, c)), c));
  const joint = maxAbs(linspace(0, 1, 9).map((s) => {
    const R = axisAngle([0.2, 1, 0.1], s);
    return U_int(turn(XA, R, both), turn(XB, R, both)) - U0;
  }));
  const own = maxAbs(linspace(0, 1, 9).flatMap((s) => {
    const Y = turn(XB, axisAngle([0.3, 0.2, 1], 1.2 * s), centroid(XB)).map((v, k) => v + (k % 3 === 0 ? 0.8 * s : 0));
    return [U_W(XA) - U_W(DOCKED.XA), U_P(Y) - U_P(XB)];
  }));
  const diagonal = maxAbs(linspace(0, 120, 9).map((g) => {
    const R = axisAngle([0, 1, 0], g * DEG);
    return U_int(turn(XA, R, [0, 0, 0]), turn(XB, R, [0, 0, 0])) - U0;
  }));
  const flags = maxAbs(linspace(0, 360, 9).map((h) => length(apply(transpose(axisAngle([0, 1, 0], h * DEG)), DOCKED.r)) - D_DOCK));
  guard(joint < 1e-10 && diagonal < 1e-10, `U_int under joint rotations: ${joint}, ${diagonal}`);
  guard(own < 1e-10, `U_W, U_P under peroxide's own motion: ${own}`);
  guard(flags < 1e-12, `|r| while the flags move: ${flags}`);
  return { joint, own, diagonal, flags };
})();

/**
 * Scene 06: the climb of the centre-line fibre, fibrePath(u) for 120 values of u ∈ [−0.95, 0.95]
 * plus u_DOCKED itself (index iDock), with U_W, U_P, U_int along it.
 */
export const fibreSweep = (() => {
  const us = [...linspace(-0.95, 0.95, 120), DOCKED.u].sort((a, b) => a - b);
  const pairs = us.map((u) => fibrePath(u, DOCKED));
  const UW = pairs.map((p) => U_W(p.XA)), UP = pairs.map((p) => U_P(p.XB)), Uint = pairs.map((p) => U_int(p.XA, p.XB));
  const iDock = us.indexOf(DOCKED.u);
  const dUW = maxAbs(UW.map((v) => v - UW[0])), dUP = maxAbs(UP.map((v) => v - UP[0]));
  const docked = fibrePath(DOCKED.u, DOCKED);
  const back = maxAbs(docked.XB.map((v, i) => v - DOCKED.XB[i]));
  guard(dUW < 1e-9 && dUP < 1e-9, `monomer energies along the climb: ${dUW}, ${dUP}`);
  guard(back < 1e-9, `fibrePath(u_DOCKED) = DOCKED: ${back}`);
  guard(Math.abs(Math.min(...Uint) - DOCKED.U) < 1e-6, 'U_int minimum along the climb is DOCKED');
  return { u: us, UW, UP, Uint, iDock, dUW, dUP, d: pairs.map((p) => poseCoords(p.XA, p.XB).d) };
})();

/**
 * The pair a diagram point stands for (scenes 06, 07, 09, 18): own shapes θ, τ (degrees, bonds at rest)
 * and the climb fibrePath(u, DOCKED); water centred at the origin, bisector +y, peroxide's body turned
 * with the climb. Walking the floor at fixed u keeps c_B and peroxide's body orientation fixed.
 * pairOnFibre(u_DOCKED) is DOCKED.
 */
export function pairOnFibre(u, { theta = THETA0, tau = P.tau0 / DEG } = {}) {
  const turn = axisAngle(cross([0, 1, 0], DOCKED.r), Math.acos(Math.max(-1, Math.min(1, u))) - Math.acos(DOCKED.u));
  return { XA: buildWater(R0, R0, theta * DEG), XB: place(buildPeroxide({ tau: tau * DEG }), multiply(turn, DOCKED.R), apply(turn, DOCKED.r)) };
}

{
  const { XA, XB } = pairOnFibre(DOCKED.u), path = fibrePath(0.3, DOCKED), mine = pairOnFibre(0.3);
  const gap = maxAbs([...XA.map((v, i) => v - DOCKED.XA[i]), ...XB.map((v, i) => v - DOCKED.XB[i]), ...mine.XB.map((v, i) => v - path.XB[i])]);
  guard(gap < 1e-9, `pairOnFibre agrees with DOCKED and fibrePath: ${gap}`);
}

/** Scene 13: the L- and D-dipeptide (mirror x ↦ −x), signed volumes at Cα, the 45 distances; 30 noisy peroxides (σ = 1, seed 131). */
export const chirality = (() => {
  const L = dipeptide(-80, 150), D = dipeptide(-80, 150, { mirror: true });
  const volume = (X) => dot(sub(at(X, 3), at(X, 4)), cross(sub(at(X, 6), at(X, 4)), sub(at(X, 5), at(X, 4))));
  let maxDistance = 0;
  for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) maxDistance = Math.max(maxDistance, Math.abs(distance(L, i, L, j) - distance(D, i, D, j)));
  const rng = createRng(131);
  const noisyPeroxides = Array.from({ length: 30 }, () => PEROXIDE_REST.map((v) => v + rng.gauss()));
  const out = { L, D, volumeL: volume(L), volumeD: volume(D), maxDistance, noisyPeroxides };
  guard(Math.abs(out.volumeL - 2.597) < 0.01 && Math.abs(out.volumeD + 2.597) < 0.01, `signed volume ${out.volumeL}`);
  guard(maxDistance < 1e-12, `mirror distances ${maxDistance}`);
  return out;
})();

// ---- joint chain (scenes 07, 08, 09) ----------------------------------------------------------

/** Log density of the stiff-limit base (§2.4): sin θ e^{−βk_θ(θ−θ₀)²} e^{−βV(τ)}, θ and τ in rad. */
const shapeLog = (theta, tau) => (theta <= 0 || theta >= Math.PI ? -Infinity : Math.log(Math.sin(theta)) - BETA * WATER.ktheta * (theta - WATER.theta0) ** 2 - BETA * V(tau));

/**
 * One pose proposal from (R, r) into (R2, r2): with probability 0.1 an independence draw from Haar ⊗ ρ
 * (returns null: ρ cancels against the proposal), otherwise a local step, rotation 0.3 rad and shift
 * 0.3 Å (returns the log ratio of ρ).
 */
function proposePose(rng, R, r, R2, r2) {
  if (rng.uniform() < 0.1) {
    R2.set(haar(rng).flat());
    for (let k = 0; k < 3; k++) r2[k] = S0 * rng.gauss();
    return null;
  }
  turnInto(R2, 0.3 * rng.gauss(), 0.3 * rng.gauss(), 0.3 * rng.gauss(), R);
  for (let k = 0; k < 3; k++) r2[k] = r[k] + 0.3 * rng.gauss();
  return (r[0] ** 2 + r[1] ** 2 + r[2] ** 2 - r2[0] ** 2 - r2[1] ** 2 - r2[2] ** 2) / (2 * S0 * S0);
}

const histogram = (values, lo, hi, bins) => {
  const h = new Float64Array(bins);
  for (const v of values) {
    const k = Math.floor(((v - lo) / (hi - lo)) * bins);
    if (k >= 0 && k < bins) h[k] += 1;
  }
  const width = (hi - lo) / bins;
  return { lo, hi, density: Array.from(h, (c) => c / (values.length * width)) };
};

/**
 * Seed 5: Metropolis over (θ, τ, R, r) of the target pair (§2.4) with local moves (θ 0.05 rad, τ 0.35 rad
 * wrapped, rotation 0.3 rad, r 0.3 Å) and 10 % independence moves of the pose from Haar ⊗ ρ, accepted with
 * min(1, w′/w); 400 000 steps, burn-in 40 000, every 120th kept: 3 000 states (θ, τ in rad).
 * Readouts: |τ| and θ histograms (per degree), mean |τ| and θ (deg), bound fraction (U_int < −3),
 * H-bond fraction (hBond: O···H 1.5–2.4 Å, angle > 120°, no O···O clash). `pairAt(k)` builds state k.
 */
export const jointChain = (() => {
  const rng = fastRng(5), steps = 400000, burn = 40000, every = 120, n = (steps - burn) / every;
  const theta = new Float64Array(n), tau = new Float64Array(n), R = new Float64Array(9 * n), r = new Float64Array(3 * n), Uint = new Float64Array(n);
  const XA = new Float64Array(9), XB = new Float64Array(12);
  const energy = (t, s, Rf, rf) => poseEnergy(waterInto(XA, t), peroxideInto(XB, s), Rf, 0, rf, 0);
  let th = WATER.theta0, ta = P.tau0, Rc = Float64Array.from(DOCKED.R.flat()), rc = Float64Array.from(DOCKED.r);
  let Rq = new Float64Array(9), rq = new Float64Array(3);
  let U = energy(th, ta, Rc, rc), shape = shapeLog(th, ta), accepted = 0, kept = 0;
  for (let step = 0; step < steps; step++) {
    const prior = proposePose(rng, Rc, rc, Rq, rq);
    let thq = th, taq = ta;
    if (prior !== null) {
      thq = th + 0.05 * rng.gauss();
      taq = ta + 0.35 * rng.gauss();
      taq -= 2 * Math.PI * Math.round(taq / (2 * Math.PI));
    }
    const shapeQ = shapeLog(thq, taq);
    const Uq = shapeQ === -Infinity ? Infinity : energy(thq, taq, Rq, rq);
    if (Math.log(rng.uniform()) < -BETA * (Uq - U) + (prior ?? 0) + shapeQ - shape) {
      [th, ta, U, shape] = [thq, taq, Uq, shapeQ];
      [Rc, Rq, rc, rq] = [Rq, Rc, rq, rc];
      accepted++;
    }
    if (step >= burn && (step - burn) % every === every - 1) {
      theta[kept] = th;
      tau[kept] = ta;
      R.set(Rc, 9 * kept);
      r.set(rc, 3 * kept);
      Uint[kept] = U;
      kept++;
    }
  }
  const pairAt = (k) => ({
    XA: buildWater(R0, R0, theta[k]),
    XB: place(buildPeroxide({ tau: tau[k] }), nested(R, 9 * k), at(r, k)),
  });
  const absTau = Array.from(tau, (t) => Math.abs(t) / DEG), thetaDeg = Array.from(theta, (t) => t / DEG);
  const hbonded = Array.from({ length: n }, (_, k) => {
    const { XA, XB } = pairAt(k);
    return hBond(XA, XB) !== null;
  });
  return {
    n, theta, tau, R, r, Uint, pairAt,
    acceptance: accepted / steps,
    absTauHistogram: histogram(absTau, 0, 180, 36),
    thetaHistogram: histogram(thetaDeg, 92, 117, 25),
    meanAbsTau: absTau.reduce((a, b) => a + b, 0) / n,
    meanTheta: thetaDeg.reduce((a, b) => a + b, 0) / n,
    boundFraction: Uint.reduce((c, U) => c + (U < -3), 0) / n,
    hbondFraction: hbonded.filter(Boolean).length / n,
    hbonded,
  };
})();

/** Scene 07: u histogram of the first 4 000 reference draws (20 bins, per unit u) and the H-bond fraction of the first 3 000. */
export const referencePictures = (() => {
  const uHistogram = histogram(Array.from(referenceDraws.u.subarray(0, 4000)), -1, 1, 20);
  let bonded = 0;
  for (let n = 0; n < 3000; n++) {
    const { XA, XB } = referenceDraws.pairAt(n);
    if (hBond(XA, XB)) bonded++;
  }
  const hbondFraction = bonded / 3000;
  guard(jointChain.hbondFraction > hbondFraction + 0.3, `H-bond fraction real ${jointChain.hbondFraction} vs reference ${hbondFraction}`);
  return { uHistogram, hbondFraction };
})();

// ---- fibre profiles (scene 07) -------------------------------------------------------------

const U_GRID = linspace(-1, 1, 81);

/** Gaussian KDE on [−1, 1] reflected at both ends (as toy.kde1), truncated at 5 bandwidths. */
export function reflectedKde(values, grid, bandwidth) {
  const out = new Float64Array(grid.length);
  const step = grid[1] - grid[0], reach = 5 * bandwidth;
  const norm = 1 / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
  const addAt = (c) => {
    const i0 = Math.max(0, Math.ceil((c - reach - grid[0]) / step)), i1 = Math.min(grid.length - 1, Math.floor((c + reach - grid[0]) / step));
    for (let i = i0; i <= i1; i++) out[i] += Math.exp(-0.5 * ((grid[i] - c) / bandwidth) ** 2) * norm;
  };
  for (const v of values) {
    addAt(v);
    addAt(-2 - v);
    addAt(2 - v);
  }
  return Array.from(out);
}

/** KDE with ±1 s.e. from 10 consecutive batches. */
function kdeWithErrors(values, bandwidth) {
  const p = reflectedKde(values, U_GRID, bandwidth);
  const size = values.length / 10;
  const batches = Array.from({ length: 10 }, (_, b) => reflectedKde(values.slice(b * size, (b + 1) * size), U_GRID, bandwidth));
  const se = U_GRID.map((_, i) => sd(batches.map((q) => q[i])) / Math.sqrt(10));
  return { u: U_GRID, p, se };
}

/**
 * Seed 71: p(u | θ₀, τ) at the three PROFILE_SITES (τ = −120°, 0°, 120°) for λ ∈ {0, 0.25, 0.5, 0.75, 1}:
 * Metropolis over (R, r) with log π = λ(−βU_int) − |r|²/2s₀² and 10 % independence moves; 25 000 steps,
 * 2 000 u values kept; reflected KDE (bandwidth 0.05) with ±1 s.e. from 10 batches. λ = 0 is the exact ½.
 * The λ ≥ 0.25 profiles peak at u = −1, not at DOCKED's u ≈ −0.93: u = cos ψ squeezes the orientations
 * near ψ = 180° into a narrow band of u, so the density of u (not the energy) is largest at the boundary.
 * [site] → { theta, tau, profiles: [{ lambda, u, p, se }] }.
 */
export const fibreProfiles = (() => {
  const rng = fastRng(71), lambdas = [0.25, 0.5, 0.75, 1];
  return [-120, 0, 120].map((tauDeg) => {
    const XA = waterInto(new Float64Array(9), WATER.theta0), XB = peroxideInto(new Float64Array(12), tauDeg * DEG);
    const flat = { lambda: 0, u: U_GRID, p: U_GRID.map(() => 0.5), se: U_GRID.map(() => 0) };
    const profiles = lambdas.map((lambda) => {
      let Rc = Float64Array.from(DOCKED.R.flat()), rc = Float64Array.from(DOCKED.r), Rq = new Float64Array(9), rq = new Float64Array(3);
      let U = poseEnergy(XA, XB, Rc, 0, rc, 0);
      const us = [], poses = [];
      for (let step = 0; step < 25000; step++) {
        const prior = proposePose(rng, Rc, rc, Rq, rq);
        const Uq = poseEnergy(XA, XB, Rq, 0, rq, 0);
        if (Math.log(rng.uniform()) < -lambda * BETA * (Uq - U) + (prior ?? 0)) {
          U = Uq;
          [Rc, Rq, rc, rq] = [Rq, Rc, rq, rc];
        }
        if (step >= 1000 && (step - 1000) % 12 === 11) {
          us.push(rc[1] / Math.hypot(rc[0], rc[1], rc[2]));
          if (lambda === 1) poses.push({ R: Float64Array.from(Rc), r: Float64Array.from(rc) });
        }
      }
      return { lambda, ...kdeWithErrors(us, 0.05), poses };
    });
    // the λ = 1 states as clean pairs (scene 09 noises them)
    const pairs = profiles[3].poses.map(({ R, r }) => ({ XA: Array.from(XA), XB: Array.from(placeInto(new Float64Array(12), XB, R, 0, r, 0)) }));
    profiles.forEach((q) => delete q.poses);
    return { theta: THETA0, tau: tauDeg, profiles: [flat, ...profiles], pairs };
  });
})();

{
  const top = fibreProfiles[2].profiles[4];
  const peak = top.u[top.p.indexOf(Math.max(...top.p))];
  guard(peak < -0.6, `λ = 1 profile at τ = 120° peaks at u = ${peak}`);
}

// ---- Z_pose grid, induced fit, affinity (scene 08) ---------------------------------------------

/**
 * Seed 81: Z_pose(θ, τ) = E_{Haar ⊗ ρ}[w] on θ ∈ {92, 97, 104.52, 112, 117}°, τ ∈ {0, 15, …, 180}°, from
 * 40 000 common draws with r from the defensive mixture ½ρ + ½q_shell (weights ρ/q ≤ 2), plus 5 mirror
 * points (θ, −τ). logZ, se (of log Z), maxShare (largest single draw / Σ); `fit(θ, τ)` the weighted
 * least-squares fit Σ_k cos kτ (c_k0 + c_k1Δθ + c_k2Δθ²) (degrees in, Δθ in rad); `marginals` by
 * quadrature on 200 × 360 points; `floor` 24 × 48 cell densities (θ rows, τ columns) lone and in the
 * pair; Zw = ∫ p̄_A p̄_B Z_pose; boundIS the bound fraction (U_int < −3) at θ₀ from the same draws.
 * Zw here is the quadrature value (≈ 27.7); affinity.Zw (≈ 31.0 ± 2.2) is the plain running mean over the
 * reference draws. Both estimate E_ν[w] and agree within about 1.5 s.e.; a scene that prints both says which.
 * The fit uses only cos kτ, so it is mirror-symmetric (τ ↦ −τ) by construction: the evidence for the mirror
 * symmetry is the 5 independent `mirror` points, guarded below. profileMass: Z_pose at the three profile
 * sites relative to the largest, about [0.005, 1, 0.005], so at true weight the side profiles are hairlines.
 */
export const zPoseGrid = (() => {
  const N = 40000, rng = createRng(81);
  const R = new Float64Array(9 * N), r = new Float64Array(3 * N), iw = new Float64Array(N);
  const above = 1 - normalCdf((1.2 - 3) / 0.5);
  for (let n = 0; n < N; n++) {
    R.set(haar(rng).flat(), 9 * n);
    let x;
    if (rng.uniform() < 0.5) x = gauss3(rng, S0);
    else {
      let radius;
      do radius = 3 + 0.5 * rng.gauss(); while (radius <= 1.2);
      x = scale(normalize(gauss3(rng)), radius);
    }
    r.set(x, 3 * n);
    const d = length(x);
    const rho = Math.exp(-(d * d) / (2 * S0 * S0)) / (2 * Math.PI * S0 * S0) ** 1.5;
    const shell = Math.exp(-((d - 3) ** 2) / (2 * 0.25)) / (Math.sqrt(2 * Math.PI * 0.25) * above * 4 * Math.PI * d * d);
    iw[n] = rho / (0.5 * rho + 0.5 * shell);
  }
  const XA = new Float64Array(9), XB = new Float64Array(12);
  const estimate = (thetaDeg, tauDeg) => {
    waterInto(XA, thetaDeg * DEG);
    peroxideInto(XB, tauDeg * DEG);
    let sum = 0, sum2 = 0, top = 0, bound = 0;
    for (let n = 0; n < N; n++) {
      const U = poseEnergy(XA, XB, R, 9 * n, r, 3 * n);
      const v = Math.exp(-BETA * U) * iw[n];
      sum += v;
      sum2 += v * v;
      if (v > top) top = v;
      if (U < -3) bound += v;
    }
    const Z = sum / N, se = Math.sqrt(Math.max(0, sum2 / N - Z * Z) / (N - 1));
    return { logZ: Math.log(Z), se: se / Z, maxShare: top / sum, bound: bound / sum };
  };
  const theta = [92, 97, THETA0, 112, 117], tau = linspace(0, 180, 13);
  const cells = theta.map((t) => tau.map((s) => estimate(t, s)));
  const logZ = cells.map((row) => row.map((c) => c.logZ)), se = cells.map((row) => row.map((c) => c.se));
  const maxShare = cells.map((row) => row.map((c) => c.maxShare));
  const mirror = [[92, 45], [97, 150], [THETA0, 120], [112, 15], [117, 90]].map(([t, s]) => {
    const m = estimate(t, -s), i = theta.indexOf(t), j = tau.indexOf(s);
    return { theta: t, tau: -s, logZ: m.logZ, se: m.se, diff: m.logZ - logZ[i][j], tolerance: 3 * Math.hypot(m.se, se[i][j]) };
  });

  const features = (thetaDeg, tauDeg) => {
    const dt = (thetaDeg - THETA0) * DEG;
    return [0, 1, 2, 3].flatMap((k) => [1, dt, dt * dt].map((p) => p * Math.cos(k * tauDeg * DEG)));
  };
  const rows = [], ys = [], ws = [];
  theta.forEach((t, i) => tau.forEach((s, j) => {
    rows.push(features(t, s));
    ys.push(logZ[i][j]);
    ws.push(1 / se[i][j] ** 2);
  }));
  const coefficients = Array.from(leastSquares(rows, ys, ws));
  const fit = (thetaDeg, tauDeg) => features(thetaDeg, tauDeg).reduce((acc, f, k) => acc + f * coefficients[k], 0);

  // marginals by quadrature (θ ∈ [92, 117]°, τ ∈ [−180, 180)°), densities per degree
  const tg = linspace(92, 117, 200), sg = Array.from({ length: 360 }, (_, j) => -180 + j + 0.5);
  const pA = tg.map((t) => shapeSamplers.pTheta(t * DEG)), pB = sg.map((s) => shapeSamplers.pTau(s * DEG));
  const joint = tg.map((t, i) => sg.map((s, j) => pA[i] * pB[j] * Math.exp(fit(t, s))));
  const dTheta = 25 / 199;
  const Zw = joint.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0) * dTheta * DEG * DEG;
  const normalise = (v, h) => {
    const total = v.reduce((a, b) => a + b, 0) * h;
    return v.map((x) => x / total);
  };
  const thetaLone = normalise(pA, dTheta), thetaPair = normalise(joint.map((row) => row.reduce((a, b) => a + b, 0)), dTheta);
  const tauLone = normalise(pB, 1), tauPair = normalise(sg.map((_, j) => joint.reduce((a, row) => a + row[j], 0)), 1);
  const meanOf = (grid, p, h, f = (x) => x) => grid.reduce((acc, x, i) => acc + f(x) * p[i], 0) * h;
  const marginals = {
    theta: tg, thetaLone, thetaPair, tau: sg, tauLone, tauPair,
    meanTheta: { lone: meanOf(tg, thetaLone, dTheta), pair: meanOf(tg, thetaPair, dTheta) },
    meanAbsTau: { lone: meanOf(sg, tauLone, 1, Math.abs), pair: meanOf(sg, tauPair, 1, Math.abs) },
  };

  const floorTheta = Array.from({ length: 24 }, (_, i) => 92 + (25 * (i + 0.5)) / 24);
  const floorTau = Array.from({ length: 48 }, (_, j) => -180 + (360 * (j + 0.5)) / 48);
  const lone = floorTheta.map((t) => floorTau.map((s) => (shapeSamplers.pTheta(t * DEG) * shapeSamplers.pTau(s * DEG)) * DEG * DEG));
  const floor = { theta: floorTheta, tau: floorTau, lone, pair: lone.map((row, i) => row.map((p, j) => (p * Math.exp(fit(floorTheta[i], floorTau[j]))) / Zw)) };

  // bound fraction at θ₀ from the importance draws: f(|τ|) interpolated, weighted by p̄_B Z_pose
  const i0 = theta.indexOf(THETA0);
  const boundAt = (s) => {
    const x = Math.abs(s) / 15, j = Math.min(11, Math.floor(x));
    return cells[i0][j].bound + (x - j) * (cells[i0][j + 1].bound - cells[i0][j].bound);
  };
  const weights = sg.map((s, j) => pB[j] * Math.exp(fit(THETA0, s)));
  const boundIS = sg.reduce((acc, s, j) => acc + weights[j] * boundAt(s), 0) / weights.reduce((a, b) => a + b, 0);

  const siteZ = (s) => Math.exp(logZ[i0][tau.indexOf(Math.abs(s))]);
  const largest = Math.max(siteZ(-120), siteZ(0), siteZ(120));
  const profileMass = [-120, 0, 120].map((s) => siteZ(s) / largest);
  const fibreLogZ = [97, THETA0, 112].map((t) => [-120, -60, 0, 60, 120, 180].map((s) => fit(t, s)));

  return {
    N, theta, tau, logZ, se, maxShare, mirror, coefficients, fit, marginals, floor, Zw, boundIS, profileMass, fibreLogZ,
    boundByTau: cells[i0].map((c) => c.bound),
  };
})();

{
  const z = zPoseGrid, m = z.marginals;
  const shiftTau = m.meanAbsTau.lone - m.meanAbsTau.pair, shiftTheta = m.meanTheta.lone - m.meanTheta.pair;
  guard(shiftTau >= 6 && shiftTau <= 16, `mean |τ| shift towards cis ${shiftTau}°`);
  const fitted = linspace(0, 180, 181).map((s) => z.fit(THETA0, s));
  guard(fitted.every((v, i) => i === 0 || v < fitted[i - 1]), 'fitted log Z_pose(θ₀, |τ|) decreases on [0°, 180°]');
  guard(Math.abs(shiftTheta) >= 0.3 && Math.abs(shiftTheta) <= 2, `θ shift ${shiftTheta}°`);
  guard(Math.abs(m.meanAbsTau.pair - jointChain.meanAbsTau) <= 2.5, `mean |τ|: formula ${m.meanAbsTau.pair}° vs chain ${jointChain.meanAbsTau}°`);
  guard(z.mirror.every((p) => Math.abs(p.diff) <= p.tolerance), 'Z_pose mirror symmetry within 3 s.e.');
  guard(z.maxShare.flat().every((s) => s <= 0.1), `largest single-draw share ${Math.max(...z.maxShare.flat())}`);
  guard(Math.abs(jointChain.boundFraction - z.boundIS) <= 0.03, `bound fraction: chain ${jointChain.boundFraction} vs importance sampling ${z.boundIS}`);
}

/**
 * Scene 08 affinity from the plain reference draws: running mean of w = e^{−βU_int} (with ±1 s.e.) at 60
 * log-spaced counts 10² … 2·10⁵, ΔG = −kT log Z_w for s₀ = 2, 2.5, 3 Å (r rescaled by s₀/2.5), ESS fraction.
 * Zw is this plain Monte Carlo mean; zPoseGrid.Zw is the quadrature estimate of the same number.
 */
export const affinity = (() => {
  const { N, theta, tau, R, r, Uint } = referenceDraws;
  const w = Array.from(Uint, (U) => Math.exp(-BETA * U));
  const counts = linspace(2, Math.log10(N), 60).map((e) => Math.round(10 ** e));
  const runningMean = [], se = [];
  let sum = 0, sum2 = 0, n = 0;
  for (const c of counts) {
    for (; n < c; n++) {
      sum += w[n];
      sum2 += w[n] * w[n];
    }
    const m = sum / n;
    runningMean.push(m);
    se.push(Math.sqrt(Math.max(0, sum2 / n - m * m) / (n - 1)));
  }
  const Zw = sum / N;
  const XA = new Float64Array(9), XB = new Float64Array(12), rs = new Float64Array(3);
  const dGAt = (s) => {
    if (s === S0) return -Math.log(Zw) / BETA;
    let total = 0;
    for (let k = 0; k < N; k++) {
      for (let c = 0; c < 3; c++) rs[c] = (r[3 * k + c] * s) / S0;
      total += Math.exp(-BETA * poseEnergy(waterInto(XA, theta[k]), peroxideInto(XB, tau[k]), R, 9 * k, rs, 0));
    }
    return -Math.log(total / N) / BETA;
  };
  return {
    counts, runningMean, se, Zw, seZw: se.at(-1),
    dG: { 2: dGAt(2), 2.5: dGAt(2.5), 3: dGAt(3) },
    essFraction: sum ** 2 / (N * sum2),
  };
})();

// ---- noise (scene 09) ---------------------------------------------------------------------------

/** u of a (possibly noisy) water–peroxide pair from its atoms. */
const uOf = (XA, XB) => poseCoords(XA, XB).u;

/** 2D Gaussian KDE on the floor cells (θ rows, τ columns, τ wrapped), truncated at 4 bandwidths. */
function floorKde(points, thetaGrid, tauGrid, [bt, bs]) {
  const out = thetaGrid.map(() => new Float64Array(tauGrid.length));
  const norm = 1 / (points.length * 2 * Math.PI * bt * bs);
  for (const [t, s] of points) {
    thetaGrid.forEach((tg, i) => {
      const a = (tg - t) / bt;
      if (Math.abs(a) > 4) return;
      tauGrid.forEach((sg, j) => {
        let ds = sg - s;
        ds -= 360 * Math.round(ds / 360);
        const b = ds / bs;
        if (Math.abs(b) <= 4) out[i][j] += Math.exp(-0.5 * (a * a + b * b)) * norm;
      });
    });
  }
  return out.map((row) => Array.from(row));
}

/**
 * Scene 09. reference (seed 91): u histograms (20 bins) of the 4 000 flexible reference draws with equal
 * per-atom noise at σ ∈ {0.1, 0.3, 0.6, 1, 2} Å. target (seed 92): 400 chain states × 4 noise replicas at
 * σ ∈ {0, 0.1, 0.3, 0.6, 1, 2}: reflected u-KDEs (bandwidth 0.06) and floor KDEs of (θ(z_A), τ(z_B)) on the
 * 24 × 48 floor cells (bandwidths 2°, 8°); the reference's floor KDEs likewise, from the noised flexible draws.
 * sites (seed 94): per centre-line fibre, the 2 000 λ = 1 pairs of fibreProfiles (clean shape at the site),
 * noised, as reflected u-KDEs at the same σ levels: the profile each fibre carries.
 */
export const noisedProfiles = (() => {
  const refRng = fastRng(91);
  const { theta: floorTheta, tau: floorTau } = zPoseGrid.floor;
  const reference = [0.1, 0.3, 0.6, 1, 2].map((sigma) => {
    const u = [], shapes = [];
    for (const { XA, XB } of referenceDraws.flexible) {
      const ZA = XA.map((v) => v + sigma * refRng.gauss()), ZB = XB.map((v) => v + sigma * refRng.gauss());
      u.push(uOf(ZA, ZB));
      shapes.push([waterInternals(ZA).theta / DEG, peroxideInternals(ZB).tau / DEG]);
    }
    return { sigma, u, histogram: histogram(u, -1, 1, 20), floor: floorKde(shapes, floorTheta, floorTau, [2, 8]) };
  });
  const siteRng = fastRng(94);
  const sites = fibreProfiles.map(({ tau, pairs }) => ({
    tau,
    levels: [0, 0.1, 0.3, 0.6, 1, 2].map((sigma) => ({
      sigma,
      p: reflectedKde(pairs.map(({ XA, XB }) => uOf(XA.map((v) => v + sigma * siteRng.gauss()), XB.map((v) => v + sigma * siteRng.gauss()))), U_GRID, 0.06),
    })),
  }));
  const tgtRng = fastRng(92);
  const states = Array.from({ length: 400 }, (_, k) => jointChain.pairAt(Math.floor((k * jointChain.n) / 400)));
  const target = [0, 0.1, 0.3, 0.6, 1, 2].map((sigma) => {
    const us = [], shapes = [];
    for (const { XA, XB } of states) for (let rep = 0; rep < 4; rep++) {
      const ZA = XA.map((v) => v + sigma * tgtRng.gauss()), ZB = XB.map((v) => v + sigma * tgtRng.gauss());
      us.push(uOf(ZA, ZB));
      shapes.push([waterInternals(ZA).theta / DEG, peroxideInternals(ZB).tau / DEG]);
    }
    return { sigma, u: U_GRID, p: reflectedKde(us, U_GRID, 0.06), floor: floorKde(shapes, floorTheta, floorTau, [2, 8]) };
  });
  return { reference: reference.map(({ sigma, histogram: h, floor }) => ({ sigma, histogram: h, floor })), referenceU: reference, target, sites, u: U_GRID };
})();

/**
 * Scene 09 scatter (seed 93): 400 draws of equal noise on the 7 atoms; x-components of water's centred O
 * noise against the noise on r = c_B − c_A, with plain centroids and with centres of mass. Sample and
 * analytic correlations; r3: water's centred noise against peroxide's atoms relative to water's centre of mass.
 */
export const centringScatter = (() => {
  const rng = createRng(93);
  const mA = WATER_MASSES, mB = PEROXIDE_MASSES;
  const MA = mA.reduce((a, b) => a + b, 0), MB = mB.reduce((a, b) => a + b, 0);
  const plain = [], mass = [];
  for (let k = 0; k < 400; k++) {
    const eA = mA.map(() => rng.gauss()), eB = mB.map(() => rng.gauss());
    const cA = eA.reduce((a, b) => a + b, 0) / 3, cB = eB.reduce((a, b) => a + b, 0) / 4;
    const gA = eA.reduce((a, e, i) => a + e * mA[i], 0) / MA, gB = eB.reduce((a, e, i) => a + e * mB[i], 0) / MB;
    plain.push([eA[0] - cA, cB - cA]);
    mass.push([eA[0] - gA, gB - gA]);
  }
  const corr = (pts) => {
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    let sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of pts) {
      sxy += (x - mx) * (y - my);
      sxx += (x - mx) ** 2;
      syy += (y - my) ** 2;
    }
    return sxy / Math.sqrt(sxx * syy);
  };
  const sA = mA.reduce((a, m) => a + m * m, 0) / MA ** 2, sB = mB.reduce((a, m) => a + m * m, 0) / MB ** 2;
  const analytic = (m) => -(m / MA - sA) / Math.sqrt((1 - (2 * m) / MA + sA) * (sA + sB));
  const r3 = (m) => -(m / MA - sA) / Math.sqrt((1 - (2 * m) / MA + sA) * (1 + sA));
  const out = {
    plain: { points: plain, corr: corr(plain), analytic: 0 },
    mass: { points: mass, corr: corr(mass), analytic: analytic(mA[0]) },
    analyticH: analytic(mA[1]),
    r3: { O: r3(mA[0]), H: r3(mA[1]) },
  };
  guard(Math.abs(out.mass.analytic + 0.61) <= 0.005 && Math.abs(out.analyticH - 0.512) <= 0.005, `analytic correlations ${out.mass.analytic}, ${out.analyticH}`);
  guard(Math.abs(Math.abs(out.r3.O) - 0.5) <= 0.01 && Math.abs(Math.abs(out.r3.H) - 0.43) <= 0.01, `R3 correlations ${out.r3.O}, ${out.r3.H}`);
  guard(Math.abs(out.plain.corr) <= 0.1 && Math.abs(out.mass.corr - out.mass.analytic) <= 0.1, `sample correlations ${out.plain.corr}, ${out.mass.corr}`);
  return out;
})();

// ---- two points on a line (scene 10) -----------------------------------------------------------

/**
 * Scene 10: log g and ∂ log g tables (lines.twoPointTable) at the heatmap σ, the clean weight (σ = 0), and
 * at the probe z = (0.55, −0.25) for 61 log-spaced σ ∈ [0.02, 0.8]: log W_t, its gradient (z₁ component;
 * z₂ is the negative), the plug-in ∇log w(z) and their relative difference.
 */
export const twoPointTables = (() => {
  const sigmas = [0.02, 0.05, 0.1, 0.2, 0.4, 0.8];
  const tables = Object.fromEntries(sigmas.map((s) => [s, twoPointTable(s)]));
  const clean = twoPointTable(0);
  const z = [0.55, -0.25], d = z[0] - z[1];
  const plug = (LOG_W(d + 1e-6) - LOG_W(d - 1e-6)) / 2e-6;
  const probeSigmas = linspace(Math.log(0.02), Math.log(0.8), 61).map(Math.exp);
  const series = probeSigmas.map((s) => pairW(z[0], z[1], s));
  const probe = {
    z, sigmas: probeSigmas, logW: series.map((p) => p.logW), grad: series.map((p) => p.gi),
    logw: LOG_W(d), plugGrad: plug, difference: series.map((p) => Math.abs(p.gi - plug) / Math.abs(p.gi)),
  };
  guard(probe.difference[0] < 0.05, `scene 10: plug-in at σ = 0.02 off by ${probe.difference[0]}`);
  return { sigmas, tables, clean, probe };
})();

// ---- scene 11: three arrows and two runs ------------------------------------------------------

const split = (v, nA) => [v.slice(0, 3 * nA), v.slice(3 * nA)];

/**
 * Scene 11 at X★: the small-noise scores (sW, sP on their molecules; sInt, sRho on all 21 coordinates),
 * one arrow scale (largest arrow of the three families 100 px), net readouts and push-forwards
 * (dθ, dτ in degrees per unit step, du). runs: x ← x + η s (η = 2·10⁻⁴ Å², 6 000 steps, every 20th kept):
 * (a) s_W ⊕ s_P, (b) + s_ρ + s_int; frames are joined 21-vectors, with U_int, u, θ and τ (degrees) per frame.
 * push.rho is exactly zero: the restraint pulls along c_B − c_A, which changes d but no drawn coordinate.
 * Run (b) ends below DOCKED's U_int (about −8.1 against −7.3) because the two shapes relax as well.
 */
export const runs11 = (() => {
  const { XA, XB } = XSTAR;
  const s = scoresSmallNoise(XA, XB);
  const [intA, intB] = split(s.sInt, 3), [rhoA, rhoB] = split(s.sRho, 3);
  const largest = (v) => Math.max(...pointsOf(v).map(length));
  const family = { W: largest(s.sW), P: largest(s.sP), int: largest(s.sInt) };
  const pxPerUnit = 100 / Math.max(family.W, family.P, family.int);
  guard(Object.values(family).every((m) => m * pxPerUnit >= 35), `scene 11: every family's largest arrow ≥ 35 px (${JSON.stringify(family)})`);
  const zeros = (n) => new Array(n).fill(0);
  const pair = join(XA, XB);
  const net = {
    W: netForceTorque(XA, s.sW), P: netForceTorque(XB, s.sP),
    int: netForceTorque(pair, s.sInt, centroid(pair)), FA: netForceTorque(XA, intA).forceVec, FB: netForceTorque(XB, intB).forceVec,
    rho: { A: netForceTorque(XA, rhoA).forceVec, B: netForceTorque(XB, rhoB).forceVec },
  };
  const push = {
    W: pushforward(XA, XB, s.sW, zeros(12)), P: pushforward(XA, XB, zeros(9), s.sP),
    int: pushforward(XA, XB, intA, intB), rho: pushforward(XA, XB, rhoA, rhoB),
  };

  const run = (binding) => {
    const A = Array.from(XA), B = Array.from(XB);
    const frames = [join(A, B)], Uint = [U_int(A, B)], u = [uOf(A, B)];
    const theta = [waterInternals(A).theta / DEG], tau = [peroxideInternals(B).tau / DEG];
    for (let step = 1; step <= 6000; step++) {
      const q = scoresSmallNoise(A, B);
      const dA = binding ? q.sW.map((v, k) => v + q.sInt[k] + q.sRho[k]) : q.sW;
      const dB = binding ? q.sP.map((v, k) => v + q.sInt[9 + k] + q.sRho[9 + k]) : q.sP;
      A.forEach((v, k) => { A[k] = v + 2e-4 * dA[k]; });
      B.forEach((v, k) => { B[k] = v + 2e-4 * dB[k]; });
      if (step % 20 === 0) {
        frames.push(join(A, B));
        Uint.push(U_int(A, B));
        u.push(uOf(A, B));
        theta.push(waterInternals(A).theta / DEG);
        tau.push(peroxideInternals(B).tau / DEG);
      }
    }
    return { frames, Uint, u, theta, tau };
  };
  const a = run(false), b = run(true);
  const shift = Math.max(...a.frames.map((X) => {
    const [A, B] = split(Array.from(X), 3);
    return Math.max(length(sub(centroid(A), centroid(XA))), length(sub(centroid(B), centroid(XB))));
  }));
  const du = maxAbs(a.u.map((v) => v - a.u[0]));
  guard(shift < 1e-10 && du < 1e-9, `scene 11 run (a): centroid shift ${shift}, Δu ${du}`);
  guard(b.Uint.at(-1) < -5 && Math.abs(b.Uint.at(-1) - DOCKED.U) <= 1, `scene 11 run (b) ends at U_int ${b.Uint.at(-1)}`);
  // what binding adds on the picture: run (b)'s end minus run (a)'s (both start at X★), in (θ°, τ°, u)
  const binding = { dTheta: b.theta.at(-1) - a.theta.at(-1), dTau: b.tau.at(-1) - a.tau.at(-1), du: b.u.at(-1) - a.u.at(-1) };
  guard(binding.du < -0.1, `scene 11: binding moves the point down its fibre, towards the peak (du ${binding.du})`);
  return { X: pair, scores: s, family, pxPerUnit, net, push, a: { ...a, centroidShift: shift, du }, b, binding };
})();

// ---- spring toy (scenes 12, 14) -----------------------------------------------------------------

/** Largest |column sum| of an N × N flat matrix: the net force it puts on any z. */
const maxColumnSum = (M, n) => Math.max(...Array.from({ length: n }, (_, j) => Math.abs(Array.from({ length: n }, (_, i) => M[i * n + j]).reduce((a, b) => a + b, 0))));

/** Joint relative-centroid x-coordinate of a spring configuration: mean of A − mean of B. */
const relativeX = (Z) => Z.slice(0, 5).reduce((a, p) => a + p[0], 0) / 5 - Z.slice(5).reduce((a, p) => a + p[0], 0) / 4;
const relativeSd = (Zs) => Math.sqrt(Zs.reduce((acc, Z) => {
  const q = [0, 1].map((c) => Z.slice(0, 5).reduce((a, p) => a + p[c], 0) / 5 - Z.slice(5).reduce((a, p) => a + p[c], 0) / 4);
  return acc + q[0] ** 2 + q[1] ** 2;
}, 0) / (2 * Zs.length));

/**
 * The spring molecules (§2.5). table: plug-in error, shrink ratio and net-force rows at σ ∈ {0.01, 0.1, 0.3,
 * 1, 3}. samples (seed 121): exact noisy pairs at σ ∈ {0.01, 0.3, 1, 3} with the true arrows σ²∇log W_t =
 * −σ²S_int z and the plug-in −σ²L_int z; cloud at σ = 1: 20 posterior draws under ν and under p, the two
 * means, arrows m_p − m_ν. sde (seed 141): reverse SDE from σ = 4 to 0.01, decomposed and monomers only
 * (frames of the first 30 samples; relative-centroid x of all 300 at the end). molecular (seed 120):
 * −β∇U_int at DOCKED and at one noisy copy (σ = 0.3 Å).
 */
export const springData = (() => {
  const table = [0.01, 0.1, 0.3, 1, 3].map((sigma) => {
    const m = springMatrices(sigma);
    return {
      sigma, error: plugInError(sigma), shrink: shrinkRatio(sigma),
      monomerNet: Math.max(maxColumnSum(m.SA, 5), maxColumnSum(m.SB, 4)), interactionNet: maxColumnSum(m.Sint, 9),
    };
  });
  const errorAt = (s) => table.find((row) => row.sigma === s).error;
  guard(errorAt(0.3) >= 0.73 && errorAt(0.3) <= 0.75, `plug-in error at σ = 0.3: ${errorAt(0.3)}`);
  guard(errorAt(1) >= 3.6 && errorAt(1) <= 3.7, `plug-in error at σ = 1: ${errorAt(1)}`);
  guard(errorAt(3) >= 22.4 && errorAt(3) <= 22.7, `plug-in error at σ = 3: ${errorAt(3)}`);

  let tweedie = 0;
  const check = (z, sigma) => {
    const t = interactionTweedie(z, sigma), s = applyMatrix(springMatrices(sigma).Sint, z);
    t.forEach((row, i) => row.forEach((v, c) => { tweedie = Math.max(tweedie, Math.abs(v + s[i][c])); }));
  };
  const arrows = (z, sigma) => {
    const { Sint, Lint } = springMatrices(sigma);
    const s2 = sigma * sigma;
    check(z, sigma);
    return {
      sigma, z,
      true: applyMatrix(Sint, z).map((p) => p.map((v) => -s2 * v)),
      plugIn: applyMatrix(Lint, z).map((p) => p.map((v) => -s2 * v)),
    };
  };
  const rng = createRng(121);
  const z1 = sampleNoisy(1, rng);
  const nu = posterior(z1, 1, 'nu'), pp = posterior(z1, 1, 'p');
  const cloud = {
    sigma: 1, z: z1,
    nu: Array.from({ length: 20 }, () => nu.sample(rng)), p: Array.from({ length: 20 }, () => pp.sample(rng)),
    meanNu: nu.mean, meanP: pp.mean, arrows: pp.mean.map((m, i) => m.map((v, c) => v - nu.mean[i][c])),
  };
  const samples = [0.01, 0.3, 1, 3].map((sigma) => arrows(sigma === 1 ? z1 : sampleNoisy(sigma, rng), sigma));

  const sdeRng = createRng(141);
  const start = Array.from({ length: 300 }, () => sampleNoisy(4, sdeRng, 'p'));
  const decomposed = reverseSDE(scoreDecomposed, start, sdeRng);
  const startMonomers = Array.from({ length: 300 }, () => sampleNoisy(4, sdeRng, 'nu'));
  const monomers = reverseSDE(scoreMonomers, startMonomers, sdeRng);
  decomposed.forEach((f) => { if (f.step % 20 === 0) f.Z.slice(0, 10).forEach((Z) => check(Z, f.sigma)); });
  guard(tweedie < 1e-12, `Tweedie interaction term vs −(S − S_ref)z: ${tweedie}`);
  const sdDecomposed = relativeSd(decomposed.at(-1).Z), sdMonomers = relativeSd(monomers.at(-1).Z);
  guard(Math.abs(sdDecomposed / PAIR_SPREAD - 1) < 0.1, `decomposed relative-centroid sd ${sdDecomposed}`);
  guard(sdMonomers > 2, `monomer-only relative-centroid sd ${sdMonomers}`);
  const trim = (frames) => frames.map((f) => ({ step: f.step, sigma: f.sigma, Z: f.Z.slice(0, 30) }));
  const sde = {
    decomposed: trim(decomposed), monomers: trim(monomers),
    relX: { decomposed: decomposed.at(-1).Z.map(relativeX), monomers: monomers.at(-1).Z.map(relativeX) },
    sd: { decomposed: sdDecomposed, monomers: sdMonomers, target: PAIR_SPREAD },
  };

  const molRng = createRng(120);
  const Z = Array.from(DOCKED.X, (v) => v + 0.3 * molRng.gauss());
  const [ZA, ZB] = split(Z, 3);
  const molecular = { X: DOCKED.X, Z, clean: scoresSmallNoise(DOCKED.XA, DOCKED.XB).sInt, plugIn: scoresSmallNoise(ZA, ZB).sInt, sigma: 0.3 };

  return { spread: PAIR_SPREAD, table, noteMonteCarlo: { 0.3: 0.727, 1: 3.702, 3: 22.49 }, samples, cloud, tweedie, sde, molecular };
})();

// ---- three points on a line (scene 16) -----------------------------------------------------------

/** Seed 171: 400 000 N(0, I₃) draws, importance-resampled by Π w_ij to 1 000 trimers. */
const TRIMERS = (() => {
  const rng = createRng(171), M = 400000;
  const draws = new Float64Array(3 * M), cumulative = new Float64Array(M);
  const logw = new Float64Array(M);
  for (let k = 0; k < M; k++) {
    const x = [rng.gauss(), rng.gauss(), rng.gauss()];
    draws.set(x, 3 * k);
    logw[k] = LOG_W(x[0] - x[1]) + LOG_W(x[0] - x[2]) + LOG_W(x[1] - x[2]);
  }
  const top = logw.reduce((m, v) => Math.max(m, v), -Infinity);
  let total = 0;
  for (let k = 0; k < M; k++) cumulative[k] = total += Math.exp(logw[k] - top);
  return Array.from({ length: 1000 }, () => {
    const target = rng.uniform() * total;
    let lo = 0, hi = M - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1; else hi = mid;
    }
    return [draws[3 * lo], draws[3 * lo + 1], draws[3 * lo + 2]];
  });
})();

/**
 * Three-body share √(Σ‖∇log W₃ − Σ∇log W_ij‖² / Σ‖∇log W₃‖²) over the resampled trimers (400 at σ = 0.7),
 * VP noise from seed 172, ±1 s.e. from 10 batch ratios. `grid` passes lines.js quadrature options.
 */
export function threeBodyShares(grid = {}) {
  const noise = createRng(172);
  return [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.7].map((sigma) => {
    const a = Math.sqrt(1 - sigma * sigma), n = sigma === 0.7 ? 400 : 1000;
    const num = new Float64Array(10), den = new Float64Array(10);
    for (let k = 0; k < n; k++) {
      const z = TRIMERS[k].map((v) => a * v + sigma * noise.gauss());
      const g3 = threePointW(z, sigma, grid).grad;
      const p12 = pairW(z[0], z[1], sigma, grid), p13 = pairW(z[0], z[2], sigma, grid), p23 = pairW(z[1], z[2], sigma, grid);
      const gp = [p12.gi + p13.gi, p12.gj + p23.gi, p13.gj + p23.gj];
      const b = Math.floor((k * 10) / n);
      num[b] += g3.reduce((q, v, c) => q + (v - gp[c]) ** 2, 0);
      den[b] += g3.reduce((q, v) => q + v * v, 0);
    }
    const sum = (v) => v.reduce((x, y) => x + y, 0);
    const batches = Array.from(num, (v, b) => Math.sqrt(v / den[b]));
    return { sigma, share: Math.sqrt(sum(num) / sum(den)), se: sd(batches) / Math.sqrt(10) };
  });
}

/**
 * Scene 16. shares (see threeBodyShares); curve at σ = 0.2: −log W₃ and −Σ log W_ij at z = (−d, 0, d)
 * for 80 values of d ∈ [0.6, 1.6]; bells at σ = 0.2 for the noisy trimer z = (−1.15, 0, 1.15), whose
 * posterior means a·z sit slightly more than one well apart: the middle bead's posterior density under the
 * reference, reweighted by w₁₂ (leans left), by w₂₃ (leans right), and by all three weights at once (the
 * truth), on 161 points x₂.
 */
export const threeBody = (() => {
  const shares = threeBodyShares();
  const shareAt = (s) => shares.find((row) => row.sigma === s).share;
  guard(shareAt(0.02) < 0.06, `three-body share at σ = 0.02: ${shareAt(0.02)}`);
  guard(shareAt(0.3) >= 0.7 && shareAt(0.3) <= 0.9, `three-body share at σ = 0.3: ${shareAt(0.3)}`);
  guard(shareAt(0.4) >= 0.6 && shareAt(0.4) <= 0.85, `three-body share at σ = 0.4: ${shareAt(0.4)}`);
  guard(shareAt(0.7) >= 0.3 && shareAt(0.7) <= 0.46, `three-body share at σ = 0.7: ${shareAt(0.7)}`);
  const peak = shares.reduce((b, row) => (row.share > b.share ? row : b)).sigma;
  guard([0.2, 0.3, 0.4].includes(peak), `three-body share peaks at σ = ${peak}`);

  const sigma = 0.2, a = Math.sqrt(1 - sigma * sigma);
  const ds = linspace(0.6, 1.6, 80);
  const curve = {
    sigma, d: ds,
    three: ds.map((d) => -threePointW([-d, 0, d], sigma).logW),
    pairs: ds.map((d) => -(pairW(-d, 0, sigma).logW + pairW(-d, d, sigma).logW + pairW(0, d, sigma).logW)),
  };

  const z = [-1.15, 0, 1.15];
  const w = (r) => Math.exp(LOG_W(r));
  const gaussian = (x, m) => Math.exp(-((x - m) ** 2) / (2 * sigma * sigma));
  const x = linspace(a * z[1] - 4 * sigma, a * z[1] + 4 * sigma, 161);
  const g1 = linspace(a * z[0] - 5 * sigma, a * z[0] + 5 * sigma, 121), g3 = linspace(a * z[2] - 5 * sigma, a * z[2] + 5 * sigma, 121);
  const p1 = g1.map((v) => gaussian(v, a * z[0])), p3 = g3.map((v) => gaussian(v, a * z[2]));
  const w13 = g1.map((x1) => g3.map((x3) => w(x1 - x3)));
  const reference = x.map((v) => gaussian(v, a * z[1]));
  const by12 = x.map((v, i) => reference[i] * g1.reduce((acc, x1, k) => acc + p1[k] * w(x1 - v), 0));
  const by23 = x.map((v, i) => reference[i] * g3.reduce((acc, x3, k) => acc + p3[k] * w(v - x3), 0));
  const both = x.map((v, i) => {
    const f3 = g3.map((x3, k) => p3[k] * w(v - x3));
    let total = 0;
    g1.forEach((x1, j) => {
      const f1 = p1[j] * w(x1 - v);
      for (let k = 0; k < g3.length; k++) total += f1 * f3[k] * w13[j][k];
    });
    return reference[i] * total;
  });
  const h = x[1] - x[0];
  const normalise = (v) => {
    const t = v.reduce((p, q) => p + q, 0) * h;
    return v.map((y) => y / t);
  };
  const bells = { sigma, z, means: z.map((v) => a * v), x, reference: normalise(reference), by12: normalise(by12), by23: normalise(by23), both: normalise(both) };
  return { shares, wellWidth: 0.15, curve, bells };
})();

// ---- connection (scene 17) ----------------------------------------------------------------------

/** Rigid motion a + η × (x_i − c) of a configuration, a and η Gaussian. */
const randomRigid = (X, rng) => {
  const c = centroid(X), a = gauss3(rng), eta = gauss3(rng);
  return pointsOf(X).flatMap((p) => add(a, cross(eta, sub(p, c))));
};

/**
 * Scene 17. opening: water bends θ 104.52° → 125° (centroid fixed, no rotation), peroxide's direction read
 * in the bisector frame and in the bond frame (degrees). loops (unit and water masses): the shape loop
 * r₁,₂ = r₀ ± 0.2 sin 2πs, θ = θ₀ + 20°(1 − cos 2πs) lifted with zero momentum; at 121 values of s the
 * rotation R, water's lab atoms (weighted centre fixed), u, and the lift (θ, δ, u); angle = holonomy (deg).
 * tiles: du/dθ (per degree) and du/dδ (per Å) of the unit-mass lift at 5 × 5 floor points at u = 0
 * (θ 105 … 145°, δ −0.36 … 0.36 Å; diagram.holonomyTiles maps them to drawTiles).
 * submersion: max |cos(horizontal, vertical)| of the quotient metric for 2 (3 + 4 atoms) and 4 molecules
 * (5, 4, 3, 6 atoms), unit masses, 200 configurations each. kabsch: a 10°, 1°, 0.1° torsion step of
 * DOCKED's peroxide re-aligned unweighted and mass-weighted; displacements and their relative difference.
 * torque: the interaction force on peroxide at X★ split into pose and shape parts under both metrics: net
 * force and lab-point torque (identical) and the relative change of the per-atom pose part.
 */
export const holonomy = (() => {
  const peroxideAt = (c) => place(PEROXIDE_REST, DOCKED.R, c);
  const pAway = [D_DOCK, 0, 0];

  // opening
  const XB0 = peroxideAt(pAway);
  const frames = (XA) => {
    const O = at(XA, 0), e3 = normalize(cross(sub(at(XA, 1), O), sub(at(XA, 2), O)));
    const bis = bisector(XA), bond = normalize(sub(at(XA, 1), O));
    const r = sub(centroid(XB0), centroid(XA));
    const read = (e1) => {
      const e2 = cross(e3, e1);
      return Math.atan2(dot(r, e2), dot(r, e1)) / DEG;
    };
    return { bisector: read(bis), bond: read(bond) };
  };
  const bend = linspace(THETA0, 125, 41).map((t) => ({ theta: t, ...frames(buildWater(R0, R0, t * DEG)) }));
  const opening = { theta: bend.map((b) => b.theta), bisector: bend.map((b) => b.bisector), bond: bend.map((b) => b.bond), XB: XB0 };
  const spread = Math.abs((bend.at(-1).bisector - bend[0].bisector) - (bend.at(-1).bond - bend[0].bond));
  guard(spread > 5, `scene 17: the two frame readouts differ by ${spread}° at the end of the bend`);

  // the loop and its lifts
  const loopShape = (s) => ({ r1: R0 + 0.2 * Math.sin(2 * Math.PI * s), r2: R0 - 0.2 * Math.sin(2 * Math.PI * s), theta: (THETA0 + 20 * (1 - Math.cos(2 * Math.PI * s))) * DEG });
  const shapeAt = (s) => {
    const { r1, r2, theta } = loopShape(s);
    return pointsOf(buildWater(r1, r2, theta));
  };
  const lift = (masses) => {
    const rotations = zeroMomentum(shapeAt, masses, 3000);
    const c0 = centroid(massCentred(shapeAt(0), masses).flat());
    const XB = peroxideAt(add(c0, pAway));
    const samples = linspace(0, 1, 121).map((s, k) => {
      const R = rotations[k * 25];
      const XA = massCentred(shapeAt(s), masses).flatMap((p) => apply(R, p));
      const { r1, r2, theta } = loopShape(s);
      return { s, R, XA, u: uOf(XA, XB), theta: theta / DEG, delta: r1 - r2 };
    });
    return { masses, XB, samples, angle: rotationAngle(rotations[3000]) / DEG, du: samples[120].u - samples[0].u };
  };
  const unit = lift([1, 1, 1]), mass = lift(WATER_MASSES);
  guard(unit.angle >= 5 && unit.angle <= 7, `holonomy, unit masses: ${unit.angle}°`);
  guard(mass.angle >= 10.5 && mass.angle <= 13.5, `holonomy, water masses: ${mass.angle}°`);

  // tiles: one integrator step of the unit-mass lift from q − εe to q + εe; peroxide fixed in the lab at
  // D_DOCK, in water's plane, perpendicular to the bisector at q (so u = 0 there: r₁ ≠ r₂ tilts the bisector)
  const tiles = [];
  for (const theta of [105, 115, 125, 135, 145]) for (const delta of [-0.36, -0.18, 0, 0.18, 0.36]) {
    const at_ = (t, dl) => pointsOf(buildWater(R0 + dl / 2, R0 - dl / 2, t * DEG));
    const XB = peroxideAt(scale(normalize(cross(bisector(at_(theta, delta).flat()), [0, 0, 1])), D_DOCK));
    const rate = (dt, dd, eps) => {
      const path = (s) => at_(theta + (2 * s - 1) * dt * eps, delta + (2 * s - 1) * dd * eps);
      const [, R] = zeroMomentum(path, [1, 1, 1], 1);
      const before = massCentred(path(0), [1, 1, 1]).flat(), after = massCentred(path(1), [1, 1, 1]).flatMap((p) => apply(R, p));
      const shift = centroid(massCentred(at_(theta, delta), [1, 1, 1]).flat());
      const move = (X) => X.map((v, k) => v - shift[k % 3]);
      return (uOf(move(after), XB) - uOf(move(before), XB)) / (2 * eps);
    };
    tiles.push({ theta, delta, u: 0, duDTheta: rate(1, 0, 1e-3), duDDelta: rate(0, 1, 1e-4) });
  }

  // submersion checks (the note's quotient_inner, unit masses)
  const rng = createRng(171717);
  const submersionMax = (sizes) => {
    let worst = 0;
    for (let trial = 0; trial < 200; trial++) {
      const xs = sizes.map((n) => {
        const offset = gauss3(rng, 4);
        return Array.from({ length: n }, () => add(gauss3(rng), offset)).flat();
      });
      const z = xs.flat(), ones = new Array(count(z)).fill(1);
      const Vh = xs.flatMap((x) => quotientInner(x, new Array(count(x)).fill(1), Array.from(x, () => rng.gauss()), new Array(x.length).fill(0)).hu);
      const Vv = xs.flatMap((x) => randomRigid(x, rng));
      const hv = quotientInner(z, ones, Vh, Vv).inner, hh = quotientInner(z, ones, Vh, Vh).inner, vv = quotientInner(z, ones, Vv, Vv).inner;
      worst = Math.max(worst, Math.abs(hv) / Math.sqrt(hh * vv));
    }
    return worst;
  };
  const submersion = { two: submersionMax([3, 4]), four: submersionMax([5, 4, 3, 6]) };
  guard(submersion.two < 1e-12 && submersion.four < 1e-12, `submersion |cos| ${submersion.two}, ${submersion.four}`);

  // re-alignment after a torsion step: unweighted (unit-mass connection) vs mass-weighted
  const X = DOCKED.XB;
  const kabschSteps = [10, 1, 0.1].map((step) => {
    const O1 = at(X, 1), O2 = at(X, 2), R = axisAngle(sub(O2, O1), step * DEG);
    const Y = [...X.slice(0, 9), ...add(apply(R, sub(at(X, 3), O2)), O2)];
    const align = (w) => {
      const fit = kabsch(Y, X, w);
      return pointsOf(Y).flatMap((p, i) => sub(add(apply(fit.R, p), fit.t), at(X, i)));
    };
    const D1 = align(null), Dm = align(PEROXIDE_MASSES);
    return { step, X, Y, D1, Dm, diff: Math.hypot(...D1.map((v, i) => v - Dm[i])) / Math.hypot(...Dm) };
  });
  guard(Math.abs(kabschSteps[2].diff / kabschSteps[0].diff - 1) < 0.1, 'Kabsch difference does not shrink with the step');

  // net force and torque about a fixed lab point (water's centroid): metric-free; the per-atom split is not.
  // The force is the interaction force on peroxide at X★ (at DOCKED it would nearly vanish).
  const F = forcesInt(XSTAR.XA, XSTAR.XB).FB, labPoint = centroid(XSTAR.XA);
  const posePart = (g) => {
    const { rigid } = rigidSplit(XSTAR.XB, F, g);
    return rigid.map((v, k) => v * (g ? g[Math.floor(k / 3)] : 1));
  };
  const P1 = posePart(null), Pm = posePart(PEROXIDE_MASSES);
  const total = netForceTorque(XSTAR.XB, F, labPoint), n1 = netForceTorque(XSTAR.XB, P1, labPoint), nm = netForceTorque(XSTAR.XB, Pm, labPoint);
  const torque = {
    force: total.force, torque: total.torque,
    difference: Math.max(length(sub(n1.torqueVec, nm.torqueVec)), length(sub(n1.forceVec, nm.forceVec)), length(sub(n1.torqueVec, total.torqueVec))),
    splitChange: Math.hypot(...P1.map((v, i) => v - Pm[i])) / Math.hypot(...Pm),
  };
  guard(torque.difference < 1e-12 * Math.max(1, total.torque, total.force), `lab-point torque under both metrics: ${torque.difference}`);

  return { opening, unit, mass, tiles, submersion, kabsch: kabschSteps, torque };
})();

// ---- clusters (scene 15) -------------------------------------------------------------------------

/** Rigid maps { R, t }: x ↦ R x + t. */
const compose = (a, b) => ({ R: multiply(a.R, b.R), t: add(apply(a.R, b.t), a.t) });
const invert = (a) => {
  const Rt = transpose(a.R);
  return { R: Rt, t: scale(apply(Rt, a.t), -1) };
};
const applyMap = (g, X) => pointsOf(X).flatMap((p) => add(apply(g.R, p), g.t));
const rmsBetween = (X, Y) => Math.sqrt(X.reduce((acc, v, i) => acc + (v - Y[i]) ** 2, 0) / count(X));

/**
 * Scene 15 on TRIMER. Frames F_i (Kabsch of each rest body onto it), poses g_ij = F_i⁻¹F_j and the closure
 * g_AB g_BC g_CA = identity; lever arm: C turned 3° about c_A (normal of the centroids' plane), its shift and
 * the C–B H-bond before and after; perturbed composition: g′_ij = g_ij·R(n_ij, 3°), C placed via A and via B
 * (lab atoms), and the closure error between them.
 */
export const clusterChecks = (() => {
  const { XA, XB, XC } = TRIMER;
  const frame = (X, rest) => kabsch(rest, X);
  const F = { A: frame(XA, WATER_REST), B: frame(XB, PEROXIDE_REST), C: frame(XC, WATER_REST) };
  const g = (i, j) => compose(invert(F[i]), F[j]);
  const loop = compose(compose(g('A', 'B'), g('B', 'C')), g('C', 'A'));
  const closure = Math.max(maxAbs(loop.R.flat().map((v, k) => v - (k % 4 === 0 ? 1 : 0))), maxAbs(loop.t));
  guard(closure < 1e-10, `trimer closure ${closure}`);

  const cA = centroid(XA), cB = centroid(XB), cC = centroid(XC);
  const n = normalize(cross(sub(cB, cA), sub(cC, cA)));
  const turn = axisAngle(n, 3 * DEG);
  const XC2 = pointsOf(XC).flatMap((p) => add(apply(turn, sub(p, cA)), cA));
  const hb = TRIMER.hbonds.CB; // TRIMER_MOL numbering
  const contact = (Xc) => {
    const Z = join(XA, XB, Xc);
    return distance(Z, hb.o, Z, hb.h);
  };
  const lever = { XC: XC2, shift: length(sub(centroid(XC2), cC)), hbondBefore: contact(XC), hbondAfter: contact(XC2), axis: n };
  guard(lever.shift > 0.1, `lever-arm shift ${lever.shift}`);

  const perturb = (gij, axis) => compose(gij, { R: axisAngle(axis, 3 * DEG), t: [0, 0, 0] });
  const gAB = perturb(g('A', 'B'), [1, 0, 0]), gBC = perturb(g('B', 'C'), [0, 1, 0]), gCA = perturb(g('C', 'A'), [0, 0, 1]);
  const bodyC = applyMap(invert(F.C), XC);
  const viaA = applyMap(compose(F.A, invert(gCA)), bodyC), viaB = applyMap(compose(F.A, compose(gAB, gBC)), bodyC);
  const composition = { viaA, viaB, closureError: rmsBetween(viaA, viaB) };
  guard(composition.closureError > 0.1, `perturbed closure error ${composition.closureError}`);
  return { frames: F, closure, lever, composition };
})();
