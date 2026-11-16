// The numeric core of the video: a toy force field for water and hydrogen
// peroxide with analytic gradients, pose coordinates, rotations and samplers.
// Configurations are flat arrays [x1, y1, z1, x2, …] in Å; angles in radians
// unless a name says degrees; energies in kcal/mol at 300 K.
// Imports only src/model/*, so Node tests can load it without a DOM.

import { add, sub, scale, dot, cross, length, normalize } from '../../model/vec3.js';
import { apply, axisAngle } from '../../model/rotation.js';
import { zeroMomentumRotations } from '../../model/rigidBody.js';

export const DEG = Math.PI / 180;
export const KT = 0.5962, BETA = 1 / KT, COULOMB = 332.0637, S0 = 2.5;

/** Flexible 3-site TIP3P-style water: atoms O, H1, H2. */
export const WATER = { charges: [-0.834, 0.417, 0.417], masses: [15.999, 1.008, 1.008], r0: 0.9572, theta0: 104.52 * DEG, kb: 450, ktheta: 55 };
/** Toy hydrogen peroxide: atoms H1, O1, O2, H2. */
export const PEROXIDE = { charges: [0.41, -0.41, -0.41, 0.41], masses: [1.008, 15.999, 15.999, 1.008], oo: 1.464, oh: 0.965, a: 99.4 * DEG, tau0: 111.8 * DEG, koh: 450, koo: 300, ka: 60 };
/** Lennard-Jones on oxygen pairs only. */
export const LJ = { sigma: 3.1507, epsilon: 0.1521 };

const at = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const flat = (points) => points.flat();
const count = (X) => X.length / 3;

// ---- geometry ------------------------------------------------------------------

export const centroid = (X, n = count(X)) => {
  const c = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += X[3 * i + k] / n;
  return c;
};

/** Weighted centre (plain centroid without weights). */
const centre = (X, weights) => {
  if (!weights) return centroid(X);
  const total = weights.reduce((a, b) => a + b, 0);
  const c = [0, 0, 0];
  weights.forEach((w, i) => { for (let k = 0; k < 3; k++) c[k] += (w * X[3 * i + k]) / total; });
  return c;
};

const centred = (points) => {
  const X = flat(points);
  const c = centroid(X);
  return X.map((v, i) => v - c[i % 3]);
};

/** Water from its shape; centroid-centred, in the xy-plane, bisector along +y. */
export function buildWater(r1 = WATER.r0, r2 = WATER.r0, theta = WATER.theta0) {
  const s = Math.sin(theta / 2), c = Math.cos(theta / 2);
  return centred([[0, 0, 0], [r1 * s, r1 * c, 0], [-r2 * s, r2 * c, 0]]);
}

/** Peroxide from its shape; O–O along x, τ the signed H1–O1–O2–H2 dihedral; centroid-centred. */
export function buildPeroxide({ oo = PEROXIDE.oo, oh1 = PEROXIDE.oh, oh2 = PEROXIDE.oh, a1 = PEROXIDE.a, a2 = PEROXIDE.a, tau = PEROXIDE.tau0 } = {}) {
  const O1 = [-oo / 2, 0, 0], O2 = [oo / 2, 0, 0];
  const H1 = add(O1, scale([Math.cos(a1), Math.sin(a1) * Math.cos(-tau / 2), Math.sin(a1) * Math.sin(-tau / 2)], oh1));
  const H2 = add(O2, scale([-Math.cos(a2), Math.sin(a2) * Math.cos(tau / 2), Math.sin(a2) * Math.sin(tau / 2)], oh2));
  return centred([H1, O1, O2, H2]);
}

/** NeRF: the atom d with |cd| = bond, ∠bcd = angle and dihedral(a, b, c, d) = torsion (degrees). */
export function placeNeRF(a, b, c, bond, angleDeg, torsionDeg) {
  const bc = normalize(sub(c, b));
  const n = normalize(cross(sub(b, a), bc));
  const m = cross(n, bc);
  const th = angleDeg * DEG, ph = torsionDeg * DEG;
  const d = [-bond * Math.cos(th), bond * Math.sin(th) * Math.cos(ph), bond * Math.sin(th) * Math.sin(ph)];
  return [0, 1, 2].map((k) => c[k] + bc[k] * d[0] + m[k] * d[1] + n[k] * d[2]);
}

/**
 * Alanine dipeptide, heavy atoms (Ace CH₃, C, O, N, Cα, Cβ, C, O, N, N-CH₃), from its two
 * backbone torsions in degrees; L by default, centroid-centred; `mirror` reflects x ↦ −x.
 */
export function dipeptide(t1 = -80, t2 = 150, { mirror = false } = {}) {
  const X = [];
  X[0] = [0, 0, 0];
  X[1] = [1.52, 0, 0];
  X[2] = add(X[1], scale([Math.cos(59 * DEG), Math.sin(59 * DEG), 0], 1.23));
  X[3] = placeNeRF(X[2], X[0], X[1], 1.33, 116, 180);
  X[4] = placeNeRF(X[0], X[1], X[3], 1.46, 122, 180);
  X[6] = placeNeRF(X[1], X[3], X[4], 1.52, 110, t1);
  X[5] = placeNeRF(X[1], X[3], X[4], 1.53, 110, t1 - 120);
  X[7] = placeNeRF(X[3], X[4], X[6], 1.23, 121, t2 + 180);
  X[8] = placeNeRF(X[3], X[4], X[6], 1.33, 116, t2);
  X[9] = placeNeRF(X[4], X[6], X[8], 1.46, 122, 180);
  const out = centred(X);
  if (mirror) for (let i = 0; i < out.length; i += 3) out[i] = -out[i];
  return out;
}

/** Unit bisector of a water: O towards the midpoint of its H. */
export const bisector = (XA) => normalize(sub(scale(add(at(XA, 1), at(XA, 2)), 0.5), at(XA, 0)));

const angle = (a, v, b) => {
  const u = sub(a, v), w = sub(b, v);
  return Math.acos(Math.max(-1, Math.min(1, dot(u, w) / (length(u) * length(w)))));
};

/** Signed dihedral p0–p1–p2–p3 in radians (IUPAC sign). */
export function dihedral(p0, p1, p2, p3) {
  const b1 = sub(p1, p0), b2 = sub(p2, p1), b3 = sub(p3, p2);
  const n1 = cross(b1, b2), n2 = cross(b2, b3);
  return Math.atan2(dot(cross(n1, n2), normalize(b2)), dot(n1, n2));
}

export function waterInternals(XA) {
  const [O, H1, H2] = [0, 1, 2].map((i) => at(XA, i));
  return { r1: length(sub(H1, O)), r2: length(sub(H2, O)), theta: angle(H1, O, H2) };
}

export function peroxideInternals(XB) {
  const [H1, O1, O2, H2] = [0, 1, 2, 3].map((i) => at(XB, i));
  return {
    oo: length(sub(O2, O1)), oh1: length(sub(H1, O1)), oh2: length(sub(H2, O2)),
    a1: angle(H1, O1, O2), a2: angle(O1, O2, H2), tau: dihedral(H1, O1, O2, H2),
  };
}

/** The relative pose seen through one function: u = cos∠(b̂_A, c_B − c_A), d = |c_B − c_A|. */
export function poseCoords(XA, XB) {
  const r = sub(centroid(XB), centroid(XA));
  const d = length(r);
  return { u: dot(bisector(XA), r) / d, d, r };
}

/** Turn a molecule by R about its centroid and move the centroid to r. */
export function place(XBbody, R, r) {
  const c = centroid(XBbody);
  const out = [];
  for (let i = 0; i < count(XBbody); i++) out.push(...add(apply(R, sub(at(XBbody, i), c)), r));
  return out;
}

/** Gram–Schmidt frame on atoms [i, j, k]: columns e₁ = unit(x_j − x_i), e₂ ⊥ e₁ towards x_k, e₃ = e₁ × e₂ (body → lab). */
export function frameOf(X, [i, j, k]) {
  const e1 = normalize(sub(at(X, j), at(X, i)));
  const v = sub(at(X, k), at(X, i));
  const e2 = normalize(sub(v, scale(e1, dot(v, e1))));
  const e3 = cross(e1, e2);
  return [0, 1, 2].map((r) => [e1[r], e2[r], e3[r]]);
}

// ---- rotations -----------------------------------------------------------------

/** Unit quaternion [w, x, y, z] of a rotation matrix (Shepperd's method). */
export function quatFromMatrix(R) {
  const tr = R[0][0] + R[1][1] + R[2][2];
  const big = Math.max(tr, R[0][0], R[1][1], R[2][2]);
  let q;
  if (big === tr) {
    const s = 2 * Math.sqrt(1 + tr);
    q = [s / 4, (R[2][1] - R[1][2]) / s, (R[0][2] - R[2][0]) / s, (R[1][0] - R[0][1]) / s];
  } else if (big === R[0][0]) {
    const s = 2 * Math.sqrt(1 + R[0][0] - R[1][1] - R[2][2]);
    q = [(R[2][1] - R[1][2]) / s, s / 4, (R[0][1] + R[1][0]) / s, (R[0][2] + R[2][0]) / s];
  } else if (big === R[1][1]) {
    const s = 2 * Math.sqrt(1 + R[1][1] - R[0][0] - R[2][2]);
    q = [(R[0][2] - R[2][0]) / s, (R[0][1] + R[1][0]) / s, s / 4, (R[1][2] + R[2][1]) / s];
  } else {
    const s = 2 * Math.sqrt(1 + R[2][2] - R[0][0] - R[1][1]);
    q = [(R[1][0] - R[0][1]) / s, (R[0][2] + R[2][0]) / s, (R[1][2] + R[2][1]) / s, s / 4];
  }
  return q[0] < 0 ? q.map((v) => -v) : q;
}

export function matrixFromQuat(q) {
  const n = Math.hypot(...q);
  const [w, x, y, z] = q.map((v) => v / n);
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
  ];
}

/** Geodesic from R0 (s = 0) to R1 (s = 1). */
export function slerpRotation(R0, R1, s) {
  const q0 = quatFromMatrix(R0);
  let q1 = quatFromMatrix(R1);
  let c = q0.reduce((acc, v, i) => acc + v * q1[i], 0);
  if (c < 0) { q1 = q1.map((v) => -v); c = -c; }
  if (c > 1 - 1e-12) return matrixFromQuat(q0.map((v, i) => v + s * (q1[i] - v)));
  const om = Math.acos(c);
  const a = Math.sin((1 - s) * om) / Math.sin(om), b = Math.sin(s * om) / Math.sin(om);
  return matrixFromQuat(q0.map((v, i) => a * v + b * q1[i]));
}

/** Haar = uniformly random orientation: a unit quaternion from 4 Gaussians. */
export const haar = (rng) => matrixFromQuat([rng.gauss(), rng.gauss(), rng.gauss(), rng.gauss()]);

/** Largest eigenpair of a symmetric 4 × 4 matrix (cyclic Jacobi). */
function topEigenvector4(A) {
  const a = A.map((r) => [...r]);
  const V = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0;
    for (let p = 0; p < 4; p++) for (let q = p + 1; q < 4; q++) off += a[p][q] ** 2;
    if (off < 1e-30) break;
    for (let p = 0; p < 4; p++) for (let q = p + 1; q < 4; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 4; k++) {
        const akp = a[k][p], akq = a[k][q];
        a[k][p] = c * akp - s * akq;
        a[k][q] = s * akp + c * akq;
      }
      for (let k = 0; k < 4; k++) {
        const apk = a[p][k], aqk = a[q][k];
        a[p][k] = c * apk - s * aqk;
        a[q][k] = s * apk + c * aqk;
      }
      for (let k = 0; k < 4; k++) {
        const vkp = V[k][p], vkq = V[k][q];
        V[k][p] = c * vkp - s * vkq;
        V[k][q] = s * vkp + c * vkq;
      }
    }
  }
  let best = 0;
  for (let i = 1; i < 4; i++) if (a[i][i] > a[best][best]) best = i;
  return V.map((row) => row[best]);
}

/** Weighted best fit X ≈ R Xref + t (Horn's quaternion method). */
export function kabsch(Xref, X, weights = null) {
  const n = count(X);
  const w = weights ?? new Array(n).fill(1);
  const cr = centre(Xref, w), cx = centre(X, w);
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {
    const p = sub(at(Xref, i), cr), q = sub(at(X, i), cx);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] += w[i] * p[a] * q[b];
  }
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = S;
  const N = [
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ];
  const R = matrixFromQuat(topEigenvector4(N));
  return { R, t: sub(cx, apply(R, cr)) };
}

/** Concatenate configurations for one drawMol call. */
export const join = (...Xs) => Float64Array.from(Xs.flatMap((X) => Array.from(X)));

// ---- energies ------------------------------------------------------------------

function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** V(τ) = c₀ + c₁cos τ + c₂cos 2τ + c₃cos 3τ with V(0) = 7, V(π) = 1.1, V(τ₀) = 0, V′(τ₀) = 0. */
export const torsionCoefficients = (() => {
  const t0 = PEROXIDE.tau0;
  const row = (t) => [1, Math.cos(t), Math.cos(2 * t), Math.cos(3 * t)];
  return solve([row(0), row(Math.PI), row(t0), [0, -Math.sin(t0), -2 * Math.sin(2 * t0), -3 * Math.sin(3 * t0)]], [7, 1.1, 0, 0]);
})();

const [C0, C1, C2, C3] = torsionCoefficients;
export const V = (tau) => C0 + C1 * Math.cos(tau) + C2 * Math.cos(2 * tau) + C3 * Math.cos(3 * tau);
export const dV = (tau) => -C1 * Math.sin(tau) - 2 * C2 * Math.sin(2 * tau) - 3 * C3 * Math.sin(3 * tau);

export const U_W = (XA) => {
  const { r1, r2, theta } = waterInternals(XA);
  return WATER.kb * ((r1 - WATER.r0) ** 2 + (r2 - WATER.r0) ** 2) + WATER.ktheta * (theta - WATER.theta0) ** 2;
};

export const U_P = (XB) => {
  const { oo, oh1, oh2, a1, a2, tau } = peroxideInternals(XB);
  const P = PEROXIDE;
  return P.koh * ((oh1 - P.oh) ** 2 + (oh2 - P.oh) ** 2) + P.koo * (oo - P.oo) ** 2 + P.ka * ((a1 - P.a) ** 2 + (a2 - P.a) ** 2) + V(tau);
};

/** Add c · ∂r/∂x for the bond i–j to g. */
function addBond(g, X, i, j, c) {
  const e = sub(at(X, j), at(X, i));
  const r = length(e);
  for (let k = 0; k < 3; k++) {
    g[3 * j + k] += (c * e[k]) / r;
    g[3 * i + k] -= (c * e[k]) / r;
  }
  return r;
}

/** Add c · ∂θ/∂x for the angle a–v–b (vertex v) to g: ∂θ/∂a = −(ŵ − cos θ û)/(|u| sin θ). */
function addAngle(g, X, a, v, b, c) {
  const u = sub(at(X, a), at(X, v)), w = sub(at(X, b), at(X, v));
  const lu = length(u), lw = length(w);
  const uh = scale(u, 1 / lu), wh = scale(w, 1 / lw);
  const cos = dot(uh, wh), sin = Math.sqrt(Math.max(1e-300, 1 - cos * cos));
  const ga = scale(sub(wh, scale(uh, cos)), -1 / (lu * sin));
  const gb = scale(sub(uh, scale(wh, cos)), -1 / (lw * sin));
  for (let k = 0; k < 3; k++) {
    g[3 * a + k] += c * ga[k];
    g[3 * b + k] += c * gb[k];
    g[3 * v + k] -= c * (ga[k] + gb[k]);
  }
}

/** Add c · ∂τ/∂x for the dihedral p0–p1–p2–p3 to g (Blondel–Karplus). */
function addDihedral(g, X, [i0, i1, i2, i3], c) {
  const F = sub(at(X, i0), at(X, i1)), G = sub(at(X, i1), at(X, i2)), H = sub(at(X, i3), at(X, i2));
  const A = cross(F, G), B = cross(H, G);
  const lg = length(G), a2 = dot(A, A), b2 = dot(B, B);
  const fg = dot(F, G) / (a2 * lg), hg = dot(H, G) / (b2 * lg);
  const g0 = scale(A, -lg / a2), g3 = scale(B, lg / b2);
  const g1 = sub(add(scale(A, lg / a2), scale(A, fg)), scale(B, hg));
  const g2 = sub(sub(scale(B, -lg / b2), scale(A, fg)), scale(B, -hg));
  [g0, g1, g2, g3].forEach((gi, n) => { for (let k = 0; k < 3; k++) g[3 * [i0, i1, i2, i3][n] + k] += c * gi[k]; });
}

/** Analytic ∇U_W. */
export function gradU_W(XA) {
  const g = new Array(9).fill(0);
  const { r1, r2, theta } = waterInternals(XA);
  addBond(g, XA, 0, 1, 2 * WATER.kb * (r1 - WATER.r0));
  addBond(g, XA, 0, 2, 2 * WATER.kb * (r2 - WATER.r0));
  addAngle(g, XA, 1, 0, 2, 2 * WATER.ktheta * (theta - WATER.theta0));
  return g;
}

/** Analytic ∇U_P (bonds, angles, and the torsion by the chain rule). */
export function gradU_P(XB) {
  const P = PEROXIDE;
  const g = new Array(12).fill(0);
  const { oo, oh1, oh2, a1, a2, tau } = peroxideInternals(XB);
  addBond(g, XB, 1, 0, 2 * P.koh * (oh1 - P.oh));
  addBond(g, XB, 2, 3, 2 * P.koh * (oh2 - P.oh));
  addBond(g, XB, 1, 2, 2 * P.koo * (oo - P.oo));
  addAngle(g, XB, 0, 1, 2, 2 * P.ka * (a1 - P.a));
  addAngle(g, XB, 1, 2, 3, 2 * P.ka * (a2 - P.a));
  addDihedral(g, XB, [0, 1, 2, 3], dV(tau));
  return g;
}

/** Charges and oxygen indices by molecule size: 3 atoms = water, 4 = peroxide. */
const SPECIES = { 3: { q: WATER.charges, o: [0] }, 4: { q: PEROXIDE.charges, o: [1, 2] } };
const speciesOf = (X, q, o) => ({ q: q ?? SPECIES[count(X)].q, o: o ?? SPECIES[count(X)].o });

/** Interaction energy: Coulomb on all pairs, Lennard-Jones on O–O pairs. Charges default by molecule size. */
export function U_int(XA, XB, { qA, qB, oA, oB } = {}) {
  const a = speciesOf(XA, qA, oA), b = speciesOf(XB, qB, oB);
  let U = 0;
  for (let i = 0; i < a.q.length; i++) for (let j = 0; j < b.q.length; j++) {
    const dx = XB[3 * j] - XA[3 * i], dy = XB[3 * j + 1] - XA[3 * i + 1], dz = XB[3 * j + 2] - XA[3 * i + 2];
    U += (COULOMB * a.q[i] * b.q[j]) / Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  for (const i of a.o) for (const j of b.o) {
    const dx = XB[3 * j] - XA[3 * i], dy = XB[3 * j + 1] - XA[3 * i + 1], dz = XB[3 * j + 2] - XA[3 * i + 2];
    const s6 = (LJ.sigma ** 2 / (dx * dx + dy * dy + dz * dz)) ** 3;
    U += 4 * LJ.epsilon * (s6 * s6 - s6);
  }
  return U;
}

/** Analytic −∇U_int on each molecule; pairwise central forces, so F_A = −F_B summed and no net torque. */
export function forcesInt(XA, XB, { qA, qB, oA, oB } = {}) {
  const a = speciesOf(XA, qA, oA), b = speciesOf(XB, qB, oB);
  const FA = new Array(XA.length).fill(0), FB = new Array(XB.length).fill(0);
  const pair = (i, j, f /* (r²) → −(dU/dr)/r */) => {
    const e = [0, 1, 2].map((k) => XB[3 * j + k] - XA[3 * i + k]);
    const c = f(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
    for (let k = 0; k < 3; k++) {
      FB[3 * j + k] += c * e[k];
      FA[3 * i + k] -= c * e[k];
    }
  };
  for (let i = 0; i < a.q.length; i++) for (let j = 0; j < b.q.length; j++) {
    pair(i, j, (r2) => (COULOMB * a.q[i] * b.q[j]) / (r2 * Math.sqrt(r2)));
  }
  for (const i of a.o) for (const j of b.o) {
    pair(i, j, (r2) => {
      const s6 = (LJ.sigma ** 2 / r2) ** 3;
      return (24 * LJ.epsilon * (2 * s6 * s6 - s6)) / r2;
    });
  }
  return { FA, FB };
}

/**
 * Scores at small noise (−β∇U) of a water–peroxide pair: sW on water's 9 coordinates, sP on
 * peroxide's 12, sInt and sRho on all 21 (water first). The restraint's score
 * −(c_B − c_A)/s₀² is spread equally over B's atoms, and the opposite over A's.
 */
export function scoresSmallNoise(XA, XB) {
  const sW = gradU_W(XA).map((v) => -BETA * v);
  const sP = gradU_P(XB).map((v) => -BETA * v);
  const { FA, FB } = forcesInt(XA, XB);
  const sInt = [...FA, ...FB].map((v) => BETA * v);
  const r = sub(centroid(XB), centroid(XA));
  const nA = count(XA), nB = count(XB);
  const sRho = [
    ...Array.from({ length: nA }, () => scale(r, 1 / (S0 * S0 * nA))).flat(),
    ...Array.from({ length: nB }, () => scale(r, -1 / (S0 * S0 * nB))).flat(),
  ];
  return { sW, sP, sInt, sRho };
}

/** Net force ΣF and net torque Σ(x − centre) × F (centre: weighted centre by default), with their sizes. */
export function netForceTorque(X, F, centreAt = null, weights = null) {
  const c = centreAt ?? centre(X, weights);
  let f = [0, 0, 0], t = [0, 0, 0];
  for (let i = 0; i < count(X); i++) {
    const Fi = at(F, i);
    f = add(f, Fi);
    t = add(t, cross(sub(at(X, i), c), Fi));
  }
  return { force: length(f), torque: length(t), forceVec: f, torqueVec: t };
}

function solve3(A, b) {
  const det = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const D = det(A);
  return [0, 1, 2].map((k) => det(A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)))) / D);
}

/**
 * Split a step u_i = F_i/g_i into its rigid part v + ω × (x_i − c_g) (v = Σg_iu_i/Σg_i,
 * ω = I_g⁻¹Σg_i(x_i − c_g) × u_i) and the rest, the shape part.
 */
export function rigidSplit(X, F, weights) {
  const n = count(X);
  const g = weights ?? new Array(n).fill(1);
  const c = centre(X, g);
  const total = g.reduce((a, b) => a + b, 0);
  const u = Array.from({ length: n }, (_, i) => scale(at(F, i), 1 / g[i]));
  let v = [0, 0, 0], L = [0, 0, 0];
  const I = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {
    const p = sub(at(X, i), c);
    v = add(v, scale(u[i], g[i] / total));
    L = add(L, scale(cross(p, u[i]), g[i]));
    const p2 = dot(p, p);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) I[a][b] += g[i] * ((a === b ? p2 : 0) - p[a] * p[b]);
  }
  const w = solve3(I, L);
  const rigid = [], shape = [];
  for (let i = 0; i < n; i++) {
    const ri = add(v, cross(w, sub(at(X, i), c)));
    rigid.push(...ri);
    shape.push(...sub(u[i], ri));
  }
  return { rigid, shape };
}

/** Central-difference gradient, for tests. */
export function gradFD(f, X, h = 1e-6) {
  const Y = Array.from(X);
  return Y.map((v, k) => {
    Y[k] = v + h;
    const up = f(Y);
    Y[k] = v - h;
    const down = f(Y);
    Y[k] = v;
    return (up - down) / (2 * h);
  });
}

// ---- samplers and densities ----------------------------------------------------

/** Inverse-CDF sampler of an unnormalised density on a grid, with the normalised density. */
function gridSampler(lo, hi, density, n = 2000) {
  const x = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
  const p = x.map(density);
  const cdf = [0];
  for (let i = 1; i < n; i++) cdf.push(cdf[i - 1] + ((p[i] + p[i - 1]) / 2) * (x[i] - x[i - 1]));
  const Z = cdf[n - 1];
  const sample = (rng) => {
    const target = rng.uniform() * Z;
    let a = 0, b = n - 1;
    while (b - a > 1) {
      const m = (a + b) >> 1;
      if (cdf[m] < target) a = m; else b = m;
    }
    return x[a] + ((x[b] - x[a]) * (target - cdf[a])) / (cdf[b] - cdf[a] || 1);
  };
  return { sample, pdf: (v) => density(v) / Z };
}

const gaussAbout = (rng, mean, k) => mean + rng.gauss() * Math.sqrt(KT / (2 * k));

/**
 * Shape samplers of the stiff-limit base: θ ∝ sin θ e^{−βk_θ(θ−θ₀)²}, τ ∝ e^{−βV(τ)} (dτ), with
 * their normalised densities. `water` and `peroxide` give full shapes; `flexible` adds Gaussian
 * bonds and angles at their thermal spreads √(kT/2k).
 */
export const shapeSamplers = (() => {
  const theta = gridSampler(60 * DEG, 150 * DEG, (t) => Math.sin(t) * Math.exp(-BETA * WATER.ktheta * (t - WATER.theta0) ** 2));
  const tau = gridSampler(-Math.PI, Math.PI, (t) => Math.exp(-BETA * V(t)));
  const P = PEROXIDE;
  return {
    theta: theta.sample, tau: tau.sample, pTheta: theta.pdf, pTau: tau.pdf,
    water: (rng, { flexible = false } = {}) => {
      const r = () => (flexible ? gaussAbout(rng, WATER.r0, WATER.kb) : WATER.r0);
      return { r1: r(), r2: r(), theta: theta.sample(rng) };
    },
    peroxide: (rng, { flexible = false } = {}) => {
      const g = (mean, k) => (flexible ? gaussAbout(rng, mean, k) : mean);
      return { oo: g(P.oo, P.koo), oh1: g(P.oh, P.koh), oh2: g(P.oh, P.koh), a1: g(P.a, P.ka), a2: g(P.a, P.ka), tau: tau.sample(rng) };
    },
  };
})();

/**
 * Equal isotropic noise σε on every atom. Returns the noisy atoms Z and, per molecule
 * (`splits`: [start, end) atom ranges), its centre ('plain' or 'mass', masses per atom)
 * and its atoms relative to that centre.
 */
export function addNoise(X, sigma, rng, splits = [[0, count(X)]], { centre: kind = 'plain', masses = null } = {}) {
  const Z = Array.from(X, (v) => v + sigma * rng.gauss());
  const parts = splits.map(([s, e]) => {
    const Xi = Z.slice(3 * s, 3 * e);
    const c = centre(Xi, kind === 'mass' ? masses.slice(s, e) : null);
    return { centre: c, centred: Xi.map((v, k) => v - c[k % 3]) };
  });
  return { Z, centres: parts.map((p) => p.centre), centred: parts.map((p) => p.centred) };
}

/** Gaussian KDE on a grid, reflected at both ends of `reflect` (null: no reflection). */
export function kde1(values, weights, grid, bandwidth, { reflect = [-1, 1] } = {}) {
  const w = weights ?? values.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  const norm = 1 / (total * bandwidth * Math.sqrt(2 * Math.PI));
  const k = (d) => Math.exp(-0.5 * (d / bandwidth) ** 2);
  return grid.map((x) => {
    let s = 0;
    values.forEach((v, i) => {
      s += w[i] * k(x - v);
      if (reflect) s += w[i] * (k(x - (2 * reflect[0] - v)) + k(x - (2 * reflect[1] - v)));
    });
    return s * norm;
  });
}

/** 2D Gaussian KDE [i][j] at (gridU[i], gridV[j]); `period` wraps an axis (e.g. τ). */
export function kde2(points, weights, gridU, gridV, [bu, bv], { period = [null, null] } = {}) {
  const w = weights ?? points.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  const norm = 1 / (total * 2 * Math.PI * bu * bv);
  const wrap = (d, P) => (P ? d - P * Math.round(d / P) : d);
  return gridU.map((x) => gridV.map((y) => {
    let s = 0;
    points.forEach(([pu, pv], i) => {
      s += w[i] * Math.exp(-0.5 * ((wrap(x - pu, period[0]) / bu) ** 2 + (wrap(y - pv, period[1]) / bv) ** 2));
    });
    return s * norm;
  }));
}

// ---- connection, submersion, the fibre ------------------------------------------

/** Rotations along a loop of shapes with zero angular momentum (shapeAt: s ∈ [0, 1] → [[x, y, z], …]). */
export const zeroMomentum = (shapeAt, masses, steps = 3000) => zeroMomentumRotations(shapeAt, masses, steps);

/** Columns of the infinitesimal global rigid motions at z: a + η × (z_i − c). */
function rigidBasis(z) {
  const c = centroid(z);
  const cols = [];
  for (let k = 0; k < 3; k++) cols.push(Array.from({ length: z.length }, (_, i) => (i % 3 === k ? 1 : 0)));
  for (let k = 0; k < 3; k++) {
    const eta = [0, 1, 2].map((j) => (j === k ? 1 : 0));
    cols.push(Array.from({ length: count(z) }, (_, i) => cross(eta, sub(at(z, i), c))).flat());
  }
  return cols;
}

/** Remove the global rigid part of w orthogonally in the mass metric. */
export function horizontalPart(z, masses, w) {
  const W = Array.from({ length: z.length }, (_, i) => masses[Math.floor(i / 3)]);
  const B = rigidBasis(z);
  const ip = (a, b) => a.reduce((s, v, i) => s + v * W[i] * b[i], 0);
  const coeff = solve(B.map((bi) => B.map((bj) => ip(bi, bj))), B.map((bi) => ip(bi, w)));
  return w.map((v, i) => v - B.reduce((s, bk, k) => s + coeff[k] * bk[i], 0));
}

/** The note's quotient_inner: the shape-space mass-metric inner product of u and v at z. */
export function quotientInner(z, masses, u, v) {
  const hu = horizontalPart(z, masses, u), hv = horizontalPart(z, masses, v);
  return { inner: hu.reduce((s, x, i) => s + x * masses[Math.floor(i / 3)] * hv[i], 0), hu, hv };
}

/**
 * Climb the fibre over the docked shapes: c_B on the circle of radius D_DOCK in the plane of
 * b̂_A and the docked c_B − c_A, at angle arccos u from b̂_A; peroxide turned with it, so
 * fibrePath(u_DOCKED, docked) is the docked pair. docked = { XA, XB } (DOCKED from data.js).
 */
export function fibrePath(u, docked) {
  const { XA, XB } = docked;
  const b = bisector(XA);
  const cA = centroid(XA);
  const { u: u0, r } = poseCoords(XA, XB);
  const R = axisAngle(cross(b, r), Math.acos(Math.max(-1, Math.min(1, u))) - Math.acos(u0));
  const out = [];
  for (let i = 0; i < count(XB); i++) out.push(...add(apply(R, sub(at(XB, i), cA)), cA));
  return { XA: Array.from(XA), XB: out };
}

/** Change of (θ_A, τ_B) in degrees and of u along per-atom vectors (vA, vB), by central differences. */
export function pushforward(XA, XB, vA, vB, h = 1e-5) {
  const step = (s) => {
    const A = Array.from(XA, (x, i) => x + s * vA[i]), B = Array.from(XB, (x, i) => x + s * vB[i]);
    return { theta: waterInternals(A).theta, tau: peroxideInternals(B).tau, u: poseCoords(A, B).u };
  };
  const p = step(h), m = step(-h);
  const dTau = Math.atan2(Math.sin(p.tau - m.tau), Math.cos(p.tau - m.tau));
  return { dTheta: (p.theta - m.theta) / (2 * h) / DEG, dTau: dTau / (2 * h) / DEG, du: (p.u - m.u) / (2 * h) };
}
