// The mathematics of "The geometry of attention", with no DOM access, so tests/attention.test.mjs
// can run it in Node. Everything drawn in the video is computed from these functions.
//
// Vectors are plain arrays; a 2 × 2 matrix is [[a, b], [c, d]] (rows). The running example lives in
// shared.js (seven keys in the plane and one bilinear form M); the functions here take keys and
// forms as arguments.

import { simulation } from '../../../src/engine/simulation.js';

// ---- small linear algebra ---------------------------------------------------------------------

export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const norm = (a) => Math.sqrt(dot(a, a));
export const scale = (a, s) => a.map((v) => v * s);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const normalize = (a) => scale(a, 1 / norm(a));

/** M v for a square matrix given as rows. */
export const matVec = (M, v) => M.map((row) => dot(row, v));
/** Mᵀ v. */
export const matTVec = (M, v) => M[0].map((_, j) => M.reduce((s, row, i) => s + row[j] * v[i], 0));
export const transpose = (M) => M[0].map((_, j) => M.map((row) => row[j]));
export const matAdd = (M, N) => M.map((row, i) => row.map((v, j) => v + N[i][j]));
export const matScale = (M, s) => M.map((row) => row.map((v) => v * s));
export const matMul = (M, N) => M.map((row) => N[0].map((_, j) => row.reduce((s, v, k) => s + v * N[k][j], 0)));
/** The bilinear form xᵀ M y. */
export const form = (M, x, y) => dot(x, matVec(M, y));
/** Symmetric part ½(M + Mᵀ) and antisymmetric part ½(M − Mᵀ). */
export const symmetricPart = (M) => matScale(matAdd(M, transpose(M)), 0.5);
export const antisymmetricPart = (M) => matScale(matAdd(M, matScale(transpose(M), -1)), 0.5);
/** Outer product a bᵀ. */
export const outer = (a, b) => a.map((ai) => b.map((bj) => ai * bj));

/** Eigenvalues (descending) and unit eigenvectors of a symmetric 2 × 2 matrix. */
export function eigen2(S) {
  const [[a, b], [, d]] = S;
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const vec = (l) => (Math.abs(b) > 1e-12 ? normalize([b, l - a]) : Math.abs(a - l) < Math.abs(d - l) ? [1, 0] : [0, 1]);
  return { values: [l1, l2], vectors: [vec(l1), vec(l2)] };
}

/** 2 × 2 rotation by `angle`. */
export const rotation2 = (angle) => [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]];

// ---- softmax as an exponential family -----------------------------------------------------------

export function logSumExp(s) {
  const m = Math.max(...s);
  return m + Math.log(s.reduce((sum, v) => sum + Math.exp(v - m), 0));
}

/** softmax(β s). */
export function softmax(s, beta = 1) {
  const z = s.map((v) => beta * v);
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const Z = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / Z);
}

/** Scores ⟨θ, x_j⟩ of every key. */
export const scores = (theta, keys) => keys.map((x) => dot(theta, x));

/** Log-partition ψ(θ) = log Σ_j exp⟨θ, x_j⟩ of the family supported on the keys. */
export const logPartition = (theta, keys) => logSumExp(scores(theta, keys));

/** Attention weights a_j = exp⟨θ, x_j⟩ / Σ_k exp⟨θ, x_k⟩. */
export const weights = (theta, keys) => softmax(scores(theta, keys));

/** The mean parameter η = ∇ψ(θ) = Σ_j a_j x_j: the attended context. */
export function meanParameter(theta, keys) {
  const a = weights(theta, keys);
  return keys[0].map((_, k) => keys.reduce((s, x, j) => s + a[j] * x[k], 0));
}

/** The Fisher information ∇²ψ(θ) = Cov_a[x_j]: the covariance of the keys under the attention weights. */
export function fisher(theta, keys) {
  const a = weights(theta, keys);
  const eta = meanParameter(theta, keys);
  const d = keys[0].length;
  return Array.from({ length: d }, (_, p) =>
    Array.from({ length: d }, (_, q) => keys.reduce((s, x, j) => s + a[j] * (x[p] - eta[p]) * (x[q] - eta[q]), 0)),
  );
}

/** Covariance of arbitrary points under weights a (the same formula, for the shared drawing code). */
export function covariance(points, a) {
  const d = points[0].length;
  const mean = points[0].map((_, k) => points.reduce((s, x, j) => s + a[j] * x[k], 0));
  return Array.from({ length: d }, (_, p) =>
    Array.from({ length: d }, (_, q) => points.reduce((s, x, j) => s + a[j] * (x[p] - mean[p]) * (x[q] - mean[q]), 0)),
  );
}

/** Shannon entropy H(a) = −Σ a log a in nats. */
export const entropy = (a) => -a.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);

/** KL(a ‖ b). */
export const kl = (a, b) => a.reduce((s, p, j) => s + (p > 0 ? p * Math.log(p / b[j]) : 0), 0);

/** Bregman divergence of ψ: B_ψ(θ₁, θ₂) = ψ(θ₁) − ψ(θ₂) − ⟨∇ψ(θ₂), θ₁ − θ₂⟩, which equals KL(p_θ₂ ‖ p_θ₁). */
export function bregman(theta1, theta2, keys) {
  return logPartition(theta1, keys) - logPartition(theta2, keys) - dot(meanParameter(theta2, keys), sub(theta1, theta2));
}

/** The dual potential on the simplex, ψ*(a) = Σ a log a = −H(a). */
export const dualPotential = (a) => -entropy(a);

// ---- sparse alternatives: sparsemax and α-entmax (Martins & Astudillo 2016; Peters, Niculae & Martins 2019)

/** sparsemax(s) = argmin_{a ∈ Δ} ‖a − s‖²: the Euclidean projection onto the simplex. */
export function sparsemax(s) {
  const z = [...s].sort((a, b) => b - a);
  let sum = 0;
  let k = 0;
  for (let j = 0; j < z.length; j++) {
    sum += z[j];
    if (1 + (j + 1) * z[j] > sum) k = j + 1;
    else break;
  }
  const tau = (z.slice(0, k).reduce((a, b) => a + b, 0) - 1) / k;
  return s.map((v) => Math.max(v - tau, 0));
}

/**
 * α-entmax(s) = argmax_{a ∈ Δ} ⟨a, s⟩ + H_α(a), with the Tsallis entropy H_α. α = 1 is softmax,
 * α = 2 sparsemax; every α > 1 can give exact zeros. Solved by bisection on the threshold τ:
 * a_j = [(α − 1) s_j − τ]₊^{1/(α − 1)}.
 */
export function entmax(s, alpha) {
  if (Math.abs(alpha - 1) < 1e-9) return softmax(s);
  if (Math.abs(alpha - 2) < 1e-9) return sparsemax(s);
  const p = 1 / (alpha - 1);
  const z = s.map((v) => (alpha - 1) * v);
  const mass = (tau) => z.reduce((sum, v) => sum + Math.pow(Math.max(v - tau, 0), p), 0);
  let lo = Math.max(...z) - 1;
  let hi = Math.max(...z);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (mass(mid) > 1) lo = mid;
    else hi = mid;
  }
  const tau = (lo + hi) / 2;
  const a = z.map((v) => Math.pow(Math.max(v - tau, 0), p));
  const Z = a.reduce((x, y) => x + y, 0);
  return a.map((v) => v / Z);
}

/** Tsallis entropy H_α(a) = (Σ_j a_j − a_j^α) / (α (α − 1)); Shannon at α = 1. */
export function tsallis(a, alpha) {
  if (Math.abs(alpha - 1) < 1e-9) return entropy(a);
  return a.reduce((s, p) => s + p - Math.pow(p, alpha), 0) / (alpha * (alpha - 1));
}

// ---- position as a connection: rotary embeddings ----------------------------------------------

/**
 * The RoPE score of a query at position m against a key at position n, summed over 2-blocks with
 * frequencies ω_b: Σ_b q_bᵀ R((n − m) ω_b) k_b. The blocks commute, so only n − m enters.
 */
export function ropeScore(q, k, m, n, freqs) {
  let s = 0;
  for (let b = 0; b < freqs.length; b++) {
    const R = rotation2((n - m) * freqs[b]);
    s += dot(q.slice(2 * b, 2 * b + 2), matVec(R, k.slice(2 * b, 2 * b + 2)));
  }
  return s;
}

/** The same score computed the long way: rotate both into their fibres, then take the plain dot product. */
export function ropeScoreAbsolute(q, k, m, n, freqs) {
  let s = 0;
  for (let b = 0; b < freqs.length; b++) {
    const qm = matVec(rotation2(m * freqs[b]), q.slice(2 * b, 2 * b + 2));
    const kn = matVec(rotation2(n * freqs[b]), k.slice(2 * b, 2 * b + 2));
    s += dot(qm, kn);
  }
  return s;
}

// ---- the sphere: von Mises–Fisher mixtures and the Hopfield energy -------------------------------

/** Unnormalised von Mises density exp(κ cos(φ − μ)) on the circle. */
export const vonMises = (phi, mu, kappa) => Math.exp(kappa * Math.cos(phi - mu));

/** Responsibilities of a von Mises mixture with equal weights and components at the angles `mus`. */
export function responsibilities(phi, mus, kappa) {
  return softmax(mus.map((mu) => Math.cos(phi - mu)), kappa);
}

/** The modern Hopfield energy E(ξ) = −β⁻¹ log Σ_j exp(β ⟨x_j, ξ⟩) + ½‖ξ‖² (Ramsauer et al. 2020). */
export function hopfieldEnergy(xi, keys, beta) {
  return -logSumExp(keys.map((x) => beta * dot(x, xi))) / beta + 0.5 * dot(xi, xi);
}

/** One Hopfield update ξ ↦ X softmax(β Xᵀ ξ) = ∇ψ(β ξ): the attention output with the keys as values. */
export const hopfieldUpdate = (xi, keys, beta) => meanParameter(scale(xi, beta), keys);

// ---- geometry helpers for the drawings --------------------------------------------------------

/** Convex hull of 2D points, counter-clockwise (Andrew's monotone chain). */
export function convexHull(points) {
  const P = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of P) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...P].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * Level lines of f(u, v) on [−extent, extent]² by marching squares. Returns, per level, a list of
 * segments [[u0, v0], [u1, v1]].
 */
export function contours(f, levels, { extent = 2, n = 60 } = {}) {
  const h = (2 * extent) / n;
  const grid = [];
  for (let i = 0; i <= n; i++) {
    grid.push([]);
    for (let j = 0; j <= n; j++) grid[i].push(f(-extent + i * h, -extent + j * h));
  }
  return levels.map((level) => {
    const segments = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const corners = [
          [i, j, grid[i][j] - level],
          [i + 1, j, grid[i + 1][j] - level],
          [i + 1, j + 1, grid[i + 1][j + 1] - level],
          [i, j + 1, grid[i][j + 1] - level],
        ];
        const points = [];
        for (let e = 0; e < 4; e++) {
          const [ia, ja, fa] = corners[e];
          const [ib, jb, fb] = corners[(e + 1) % 4];
          if ((fa < 0) !== (fb < 0)) {
            const w = fa / (fa - fb);
            points.push([-extent + (ia + (ib - ia) * w) * h, -extent + (ja + (jb - ja) * w) * h]);
          }
        }
        if (points.length === 2) segments.push([points[0], points[1]]);
        else if (points.length === 4) segments.push([points[0], points[1]], [points[2], points[3]]);
      }
    }
    return segments;
  });
}

/** Points of the ellipse { x : (x − c)ᵀ Σ⁻¹ (x − c) = r² } for a symmetric 2 × 2 Σ (r = 1: one standard deviation). */
export function ellipsePoints(center, Sigma, r = 1, count = 64) {
  const { values, vectors } = eigen2(Sigma);
  return Array.from({ length: count + 1 }, (_, i) => {
    const phi = (2 * Math.PI * i) / count;
    const a = r * Math.sqrt(Math.max(values[0], 0)) * Math.cos(phi);
    const b = r * Math.sqrt(Math.max(values[1], 0)) * Math.sin(phi);
    return [center[0] + a * vectors[0][0] + b * vectors[1][0], center[1] + a * vectors[0][1] + b * vectors[1][1]];
  });
}

/** Trace of a square matrix. */
export const trace = (M) => M.reduce((s, row, i) => s + row[i], 0);

// ---- depth as a flow: interacting tokens on the sphere S² --------------------------------------

/**
 * Attention weights of token i over all tokens for the form M = I + a [ẑ]ₓ on the sphere:
 * x_iᵀ M x_j = x_i · x_j + a ẑ · (x_i × x_j). The antisymmetric part favours tokens ahead in azimuth.
 */
function sphereWeights(X, i, n, beta, anti) {
  const xi = X[3 * i];
  const yi = X[3 * i + 1];
  const zi = X[3 * i + 2];
  const s = new Float64Array(n);
  let max = -Infinity;
  for (let j = 0; j < n; j++) {
    const xj = X[3 * j];
    const yj = X[3 * j + 1];
    const zj = X[3 * j + 2];
    s[j] = beta * (xi * xj + yi * yj + zi * zj + anti * (xi * yj - yi * xj));
    if (s[j] > max) max = s[j];
  }
  let Z = 0;
  for (let j = 0; j < n; j++) {
    s[j] = Math.exp(s[j] - max);
    Z += s[j];
  }
  for (let j = 0; j < n; j++) s[j] /= Z;
  return s;
}

/** Velocity of token i: the attended mean, projected onto the tangent plane of the sphere at x_i. */
export function sphereVelocity(X, i, beta, anti) {
  const n = X.length / 3;
  const a = sphereWeights(X, i, n, beta, anti);
  let vx = 0;
  let vy = 0;
  let vz = 0;
  for (let j = 0; j < n; j++) {
    vx += a[j] * X[3 * j];
    vy += a[j] * X[3 * j + 1];
    vz += a[j] * X[3 * j + 2];
  }
  const xi = X[3 * i];
  const yi = X[3 * i + 1];
  const zi = X[3 * i + 2];
  const radial = vx * xi + vy * yi + vz * zi;
  return [vx - radial * xi, vy - radial * yi, vz - radial * zi];
}

/** Interaction energy E_β(X) = (1 / 2βn²) Σ_ij exp(β x_i · x_j), as a fraction of its maximum e^β / 2β (all tokens together). */
export function interactionEnergy(X, beta) {
  const n = X.length / 3;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sum += Math.exp(beta * (X[3 * i] * X[3 * j] + X[3 * i + 1] * X[3 * j + 1] + X[3 * i + 2] * X[3 * j + 2] - 1));
    }
  }
  return sum / (n * n);
}

/** Number of clusters: tokens closer than `angle` (radians) to an existing cluster centre join it. */
export function countClusters(X, angle = 0.08) {
  const n = X.length / 3;
  const centres = [];
  const cos = Math.cos(angle);
  for (let i = 0; i < n; i++) {
    const p = [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
    if (!centres.some((c) => dot(c, p) > cos)) centres.push(p);
  }
  return centres.length;
}

/** The history of one simulation tick: capacity for `seconds` at 60 ticks per second. */
const HISTORY = 6000;

/**
 * The flow x_i' = P⊥_{x_i} Σ_j a_ij x_j on the sphere, a_ij = softmax_j(β x_iᵀ M x_j), M = I + anti·[ẑ]ₓ.
 * Controls (levers): beta, anti. The state keeps every token, the energy history and the cluster count.
 */
export function sphereFlow({ seed = 11, n = 48, dt = 1 / 60 } = {}) {
  return simulation({
    seed,
    dt,
    tick: dt,
    uses: ['beta', 'anti'],
    init: (rng) => {
      const X = new Float64Array(3 * n);
      for (let i = 0; i < n; i++) {
        // uniform on the sphere, but away from the poles, so the azimuthal circulation is visible
        const z = 0.85 * (2 * rng.uniform() - 1);
        const phi = 2 * Math.PI * rng.uniform();
        const r = Math.sqrt(1 - z * z);
        X[3 * i] = r * Math.cos(phi);
        X[3 * i + 1] = r * Math.sin(phi);
        X[3 * i + 2] = z;
      }
      return { n, X, ticks: 0, energy: new Float32Array(HISTORY), clusters: n, beta: 0, anti: 0 };
    },
    step: (state, input, rng, h) => {
      const { X } = state;
      const V = new Float64Array(3 * n);
      for (let i = 0; i < n; i++) {
        const v = sphereVelocity(X, i, input.beta, input.anti);
        V[3 * i] = v[0];
        V[3 * i + 1] = v[1];
        V[3 * i + 2] = v[2];
      }
      for (let i = 0; i < n; i++) {
        const x = X[3 * i] + h * V[3 * i];
        const y = X[3 * i + 1] + h * V[3 * i + 1];
        const z = X[3 * i + 2] + h * V[3 * i + 2];
        const r = Math.hypot(x, y, z);
        X[3 * i] = x / r;
        X[3 * i + 1] = y / r;
        X[3 * i + 2] = z / r;
      }
      state.beta = input.beta;
      state.anti = input.anti;
    },
    onTick: (state) => {
      if (state.ticks < HISTORY) state.energy[state.ticks] = interactionEnergy(state.X, state.beta);
      state.ticks += 1;
      if (state.ticks % 6 === 0) state.clusters = countClusters(state.X);
    },
  });
}
