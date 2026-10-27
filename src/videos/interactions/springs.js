// Two molecules made of zero-rest-length springs: the note's exactly solvable toy (I3).
//
// U = ½ Σ k_ij |x_i − x_j|² with β = 1; beads 0–4 are molecule A, 5–8 molecule B.
// Every matrix acts the same way on each Cartesian coordinate (it is M ⊗ I₃), so a
// configuration is drawn exactly by two of its three columns: Z = [[x, y], …] per bead.
// Noise is VE, z = x + σε, with the joint centroid removed. The noised score is
// s(z) = −S z with S(σ) = (L⁺ + σ²P)⁺P (coupling_checks.py); the monomer models S_A, S_B
// come from L_A and L_B alone, each in its own centred subspace.

import { symEig, pinv, cholesky } from './linalg.js';

const NA = 5, NB = 4, N = NA + NB;

/** Spring constants [i, j, k] from coupling_checks.py (seed 7); repeated pairs add. A and B local, interaction global. */
export const SPRINGS = {
  nA: NA,
  nB: NB,
  edgesA: [[0, 2, 1.9295], [1, 2, 0.7654], [1, 3, 2.7686], [3, 4, 1.5389], [0, 1, 2], [1, 2, 2], [2, 3, 2], [3, 4, 2]],
  edgesB: [[0, 1, 2.901], [0, 2, 0.7662], [0, 3, 2.859], [1, 2, 1.9339], [1, 3, 2.1698], [2, 3, 0.6168], [0, 1, 2], [1, 2, 2], [2, 3, 2]],
  edgesI: [[4, 6, 0.3114], [3, 7, 0.8316], [2, 7, 0.3203], [3, 5, 0.4059]],
};

/** Graph Laplacian (n × n, flat) of weighted edges, indices shifted by offset. */
export function laplacian(n, edges, offset = 0) {
  const L = new Float64Array(n * n);
  for (const [a, b, k] of edges) {
    const i = a + offset, j = b + offset;
    L[i * n + i] += k;
    L[j * n + j] += k;
    L[i * n + j] -= k;
    L[j * n + i] -= k;
  }
  return L;
}

const add = (A, B, s = 1) => A.map((v, i) => v + s * B[i]);
const projector = (n) => Float64Array.from({ length: n * n }, (_, k) => (k % (n + 1) === 0 ? 1 : 0) - 1 / n);
const mul = (A, B, n) => {
  const C = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) C[i * n + j] += A[i * n + k] * B[k * n + j];
  return C;
};
/** Embed an m × m block at (offset, offset) of an N × N matrix. */
const embed = (B, m, offset) => {
  const M = new Float64Array(N * N);
  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) M[(i + offset) * N + j + offset] = B[i * m + j];
  return M;
};

const LA = laplacian(NA, SPRINGS.edgesA);
const LB = laplacian(NB, SPRINGS.edgesB);
const Lref = add(embed(LA, NA, 0), embed(LB, NB, NA));
const Lint = laplacian(N, SPRINGS.edgesI);
const L = add(Lref, Lint);
const P = projector(N);
const Lplus = pinv(L, N);

/** Noised score matrix (L⁺ + σ²P)⁺P of a translation-invariant Gaussian network on n beads. */
const noisedScore = (Lm, n, sigma) => mul(pinv(add(pinv(Lm, n), projector(n), sigma * sigma), n), projector(n), n);

const cache = new Map();

/** All matrices at noise σ, memoised: S (pair), SA ⊕ SB = Sref (frozen monomers), Sint = S − Sref, C = cov of z. */
export function springMatrices(sigma) {
  if (cache.has(sigma)) return cache.get(sigma);
  const S = noisedScore(L, N, sigma);
  const SA = noisedScore(LA, NA, sigma);
  const SB = noisedScore(LB, NB, sigma);
  const Sref = add(embed(SA, NA, 0), embed(SB, NB, NA));
  const m = { S, SA, SB, Sref, Sint: add(S, Sref, -1), L, Lref, Lint, C: add(Lplus, P, sigma * sigma) };
  cache.set(sigma, m);
  return m;
}

/** M z for a 9-vector, or column by column for beads given as rows [[x, y], …]. */
export function applyMatrix(M, z, n = N) {
  const rows = Array.isArray(z[0]);
  const cols = rows ? z[0].length : 1;
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = new Array(cols).fill(0);
    for (let j = 0; j < n; j++) {
      const m = M[i * n + j];
      if (rows) for (let c = 0; c < cols; c++) r[c] += m * z[j][c];
      else r[0] += m * z[j];
    }
    out.push(rows ? r : r[0]);
  }
  return out;
}

const posteriorCache = new Map();
/**
 * Posterior covariance Λ⁺ given z, Λ = (L or L_ref) + P/σ², on the centred subspace, and a root of it:
 * P · chol(Λ⁺ + 11ᵀ/N), whose covariance is P(Λ⁺ + 11ᵀ/N)P = Λ⁺.
 */
function posteriorCov(sigma, which) {
  const key = `${which}:${sigma}`;
  if (!posteriorCache.has(key)) {
    const cov = pinv(add(which === 'p' ? L : Lref, P, 1 / (sigma * sigma)), N);
    const root = mul(P, cholesky(cov.map((v) => v + 1 / N)), N);
    posteriorCache.set(key, { cov, root });
  }
  return posteriorCache.get(key);
}

/** Clean configurations behind a noisy z under the pair ('p') or the reference ('nu'): mean Λ⁺z/σ² and exact draws. */
export function posterior(z, sigma, which = 'p') {
  const { cov, root } = posteriorCov(sigma, which);
  const mean = applyMatrix(cov.map((v) => v / (sigma * sigma)), z);
  const sample = (rng) => {
    const cols = Array.isArray(z[0]) ? z[0].length : 0;
    const xi = Array.from({ length: N }, () => (cols ? Array.from({ length: cols }, rng.gauss) : rng.gauss()));
    const d = applyMatrix(root, xi);
    return mean.map((m, i) => (cols ? m.map((v, c) => v + d[i][c]) : m + d[i]));
  };
  return { mean, sample };
}

const tweedieCache = new Map();
/** The matrix T with ∇log W_t = T z (see interactionTweedie), memoised by σ. */
function tweedieMatrix(sigma) {
  if (!tweedieCache.has(sigma)) {
    const s2 = sigma * sigma;
    const Rp = posteriorCov(sigma, 'p').cov.map((v) => v / s2);
    const Rn = posteriorCov(sigma, 'nu').cov.map((v) => v / s2);
    tweedieCache.set(sigma, mul(mul(Rp, Lint, N), Rn, N).map((v) => -v));
  }
  return tweedieCache.get(sigma);
}

/**
 * The interaction term ∇log W_t, computed independently of S: the Tweedie difference (m_p − m_ν)/σ².
 * With m = Λ⁺z/σ², the difference is written as −(σ²Λ_p)⁺ L_int (σ²Λ_ν)⁺ z (the same matrices, no
 * cancellation), so it stays accurate to 1e-14 down to σ = 0.01.
 */
export const interactionTweedie = (z, sigma) => applyMatrix(tweedieMatrix(sigma), z);

/** C-weighted Frobenius norm √tr(M C Mᵀ). */
const normC = (M, C) => Math.sqrt(mul(mul(M, C, N), M.map((_, k) => M[(k % N) * N + Math.floor(k / N)]), N).reduce((s, v, k) => s + (k % (N + 1) === 0 ? v : 0), 0));

/** Exact relative error of the plug-in −L_int z against the true interaction term −S_int z, over z ~ p_σ. */
export const plugInError = (sigma) => {
  const { Sint, C } = springMatrices(sigma);
  return normC(add(Sint, Lint, -1), C) / normC(Sint, C);
};

/** How much the true term has shrunk relative to the clean force: ‖S_int‖_C / ‖L_int‖_C. */
export const shrinkRatio = (sigma) => {
  const { Sint, C } = springMatrices(sigma);
  return normC(Sint, C) / normC(Lint, C);
};

/** Relative-centroid direction c (1/5 on A, −1/4 on B) and the target's exact spread √(cᵀL⁺c) per coordinate. */
const REL = Array.from({ length: N }, (_, i) => (i < NA ? 1 / NA : -1 / NB));
const relVariance = (C) => REL.reduce((s, ci, i) => s + ci * REL.reduce((t, cj, j) => t + C[i * N + j] * cj, 0), 0);
export const PAIR_SPREAD = Math.sqrt(relVariance(Lplus));

/** Matrix square root V√Λ of a covariance (null directions exactly zero), memoised by name. */
const roots = new Map();
const sqrtCov = (key, C, n) => {
  if (!roots.has(key)) {
    const { values, vectors } = symEig(C(), n);
    const cut = 1e-12 * Math.max(...values);
    roots.set(key, vectors.map((v, k) => (values[k % n] > cut ? v * Math.sqrt(values[k % n]) : 0)));
  }
  return roots.get(key);
};

/**
 * One exact noisy configuration, two columns [[x, y], …] with joint centroid zero.
 * 'p': the noised pair, z = V√Λ ξ with Λ the eigenvalues of L⁺ + σ²P.
 * 'nu': the noised reference. Its relative position is free, so each monomer's centred part is drawn
 * from its own noised Gaussian and the relative centroid as in the noised pair.
 */
export function sampleNoisy(sigma, rng, which = 'p') {
  const draw = (root, n) => applyMatrix(root, Array.from({ length: n }, () => [rng.gauss(), rng.gauss()]), n);
  const s2 = sigma * sigma;
  if (which === 'p') return draw(sqrtCov(`p:${sigma}`, () => springMatrices(sigma).C, N), N);
  const A = draw(sqrtCov(`A:${sigma}`, () => add(pinv(LA, NA), projector(NA), s2), NA), NA);
  const B = draw(sqrtCov(`B:${sigma}`, () => add(pinv(LB, NB), projector(NB), s2), NB), NB);
  const sd = Math.sqrt(relVariance(springMatrices(sigma).C));
  const r = [rng.gauss() * sd, rng.gauss() * sd];
  return [...A.map(([x, y]) => [x + (NB / N) * r[0], y + (NB / N) * r[1]]), ...B.map(([x, y]) => [x - (NA / N) * r[0], y - (NA / N) * r[1]])];
}

/**
 * Score functions for the reverse sampler. Decomposed: frozen monomers −S_ref z plus the Tweedie
 * interaction term (summed into one matrix per σ). Monomers only: −S_ref z.
 */
const scoreCache = new Map();
const scoreMatrix = (sigma, decomposed) => {
  const key = `${decomposed}:${sigma}`;
  if (!scoreCache.has(key)) {
    const T = tweedieMatrix(sigma);
    scoreCache.set(key, springMatrices(sigma).Sref.map((v, k) => (decomposed ? T[k] : 0) - v));
  }
  return scoreCache.get(key);
};
export const scoreDecomposed = (z, sigma) => applyMatrix(scoreMatrix(sigma, true), z);
export const scoreMonomers = (z, sigma) => applyMatrix(scoreMatrix(sigma, false), z);

/**
 * Reverse VE Euler–Maruyama on a geometric σ grid sigmaMax → sigmaMin:
 * z ← z + (σ_k² − σ_{k+1}²) s(z, σ_k) + √(σ_k² − σ_{k+1}²) ε, joint centroid removed after each step.
 * start: array of configurations [[x, y], …]. Returns frames { step, sigma, Z } every keepEvery steps (and the last).
 */
export function reverseSDE(scoreFn, start, rng, { sigmaMax = 4, sigmaMin = 0.01, steps = 200, keepEvery = 5 } = {}) {
  const sigmaAt = (k) => sigmaMax * (sigmaMin / sigmaMax) ** (k / steps);
  const copy = (Z) => Z.map((z) => z.map((row) => [...row]));
  const Z = copy(start);
  const frames = [{ step: 0, sigma: sigmaMax, Z: copy(Z) }];
  for (let k = 0; k < steps; k++) {
    const s0 = sigmaAt(k), s1 = sigmaAt(k + 1);
    const dv = s0 * s0 - s1 * s1;
    const kick = Math.sqrt(dv);
    for (const z of Z) {
      const s = scoreFn(z, s0);
      const n = z.length, cols = z[0].length;
      for (let c = 0; c < cols; c++) {
        let mean = 0;
        for (let i = 0; i < n; i++) {
          z[i][c] += dv * s[i][c] + kick * rng.gauss();
          mean += z[i][c] / n;
        }
        for (let i = 0; i < n; i++) z[i][c] -= mean;
      }
    }
    if ((k + 1) % keepEvery === 0 || k + 1 === steps) frames.push({ step: k + 1, sigma: s1, Z: copy(Z) });
  }
  return frames;
}
