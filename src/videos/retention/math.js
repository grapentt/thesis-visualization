// Mathematics of "What the noise should keep". Everything here is exact or quadrature on a grid,
// with no DOM, so tests/retention.test.mjs can check it in Node:
//   - the harmonic (Ornstein–Uhlenbeck) coordinate: conditional moments, Fisher information,
//     the stationary increment statistic, exact sample paths;
//   - a two-basin density on a line: its Gaussianising map, the diffusion operator L_W, the
//     score-matching residual and the efficiency ratio;
//   - the Kullback–Leibler flow identity for two densities under one diffusion;
//   - the heat kernel on the circle and its initial-state Fisher information.
// The two-coordinate toy molecule (bond and torsion) is in toy.js.

import { createRng } from '../../engine/random.js';

// ---- special functions ------------------------------------------------------------------------

/** erf to about 1e-15: a Maclaurin series up to 2.5, a continued fraction for erfc beyond. */
export function erf(x) {
  const a = Math.abs(x);
  if (a >= 2.5) return Math.sign(x) * (1 - erfcTail(a));
  let term = a;
  let sum = a;
  for (let n = 1; n < 120; n++) {
    term *= (-a * a) / n;
    const add = term / (2 * n + 1);
    sum += add;
    if (Math.abs(add) < 1e-17 * Math.abs(sum)) break;
  }
  return (Math.sign(x) * 2 * sum) / Math.sqrt(Math.PI);
}

/** erfc(x) for x ≥ 2.5 by the continued fraction e^{−x²}/√π · 1/(x + ½/(x + 1/(x + 3/2/(x + …)))). */
function erfcTail(x) {
  let v = x;
  for (let n = 80; n >= 1; n--) v = x + n / 2 / v;
  return Math.exp(-x * x) / (Math.sqrt(Math.PI) * v);
}

export const erfc = (x) => (x >= 2.5 ? erfcTail(x) : x <= -2.5 ? 2 - erfcTail(-x) : 1 - erf(x));
export const normalPdf = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
export const normalCdf = (z) => 0.5 * erfc(-z / Math.SQRT2);

/** Φ⁻¹(p): Acklam's rational approximation, polished by one Halley step on the exact cdf. */
export function normalQuantile(p) {
  if (!(p > 0 && p < 1)) return p <= 0 ? -Infinity : Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  let x;
  if (p < 0.02425) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p > 1 - 0.02425) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  for (let i = 0; i < 2; i++) {
    const e = normalCdf(x) - p;
    const u = (e * Math.sqrt(2 * Math.PI)) * Math.exp((x * x) / 2);
    x -= u / (1 + (x * u) / 2);
  }
  return x;
}

// ---- one harmonic coordinate: dX = −kX dτ + √(2D) dB ------------------------------------------

/** Illustrative rates, 1/ps, with the same diffusivity D (Å²/ps): v = D/k gives widths 0.05 Å and 1 Å, κ = 400 as in Part 1. */
export const COORDINATES = Object.freeze({
  bond: { name: 'bond', k: 400, D: 1 },
  torsion: { name: 'torsion', k: 1, D: 1 },
});

export const ou = Object.freeze({
  /** Equilibrium variance v = D/k. */
  variance: ({ k, D }) => D / k,
  /** Conditional mean after lag τ from x₀. */
  mean: ({ k }, tau, x0) => Math.exp(-k * tau) * x0,
  /** Conditional variance C_τ = v (1 − e^{−2kτ}). */
  conditionalVariance: ({ k, D }, tau) => (D / k) * (1 - Math.exp(-2 * k * tau)),
  /** Fisher information about the start, F_τ = 1 / (v (e^{2kτ} − 1)) = J_τ² / C_τ. */
  fisher: ({ k, D }, tau) => 1 / ((D / k) * Math.expm1(2 * k * tau)),
  /** Stationary increment statistic ½ E[(X_τ − X_0)²] = v (1 − e^{−kτ}). */
  increment: ({ k, D }, tau) => (D / k) * (1 - Math.exp(-k * tau)),
});

/** Exact sample paths from x₀ at lags n·dt: X_{n+1} = e^{−k dt} X_n + √(v (1 − e^{−2k dt})) ξ. */
export function ouPaths(coordinate, { x0, count, steps, dt, seed = 7 }) {
  const rng = createRng(seed);
  const decay = Math.exp(-coordinate.k * dt);
  const spread = Math.sqrt(ou.conditionalVariance(coordinate, dt));
  return Array.from({ length: count }, () => {
    const path = new Float64Array(steps + 1);
    path[0] = x0;
    for (let n = 0; n < steps; n++) path[n + 1] = decay * path[n] + spread * rng.gauss();
    return path;
  });
}

// ---- a two-basin density on a line -------------------------------------------------------------

/** The torsion marginal of the toy, cut open and laid on a line: two Gaussian basins. */
export const TWO_BASINS = Object.freeze({ weights: [0.65, 0.35], means: [-1.0, 1.9], sds: [0.35, 0.35] });
/** A wrong model of it, for the flow identity: the right basins, wrong weights and widths. */
export const WRONG_MODEL = Object.freeze({ weights: [0.5, 0.5], means: [-0.7, 1.5], sds: [0.55, 0.45] });

/** Density of a Gaussian mixture, each component's variance widened by `extra` (heat flow). */
export function mixturePdf(x, m, extra = 0) {
  let p = 0;
  for (let i = 0; i < m.weights.length; i++) {
    const s = Math.sqrt(m.sds[i] ** 2 + extra);
    p += (m.weights[i] * normalPdf((x - m.means[i]) / s)) / s;
  }
  return p;
}

export function mixtureCdf(x, m) {
  let F = 0;
  for (let i = 0; i < m.weights.length; i++) F += m.weights[i] * normalCdf((x - m.means[i]) / m.sds[i]);
  return F;
}

/** (log p)′, the score of the mixture. */
export function mixtureScore(x, m, extra = 0) {
  let p = 0;
  let dp = 0;
  for (let i = 0; i < m.weights.length; i++) {
    const s2 = m.sds[i] ** 2 + extra;
    const e = (m.weights[i] * normalPdf((x - m.means[i]) / Math.sqrt(s2))) / Math.sqrt(s2);
    p += e;
    dp -= (e * (x - m.means[i])) / s2;
  }
  return dp / p;
}

export const mixtureMean = (m) => m.weights.reduce((s, w, i) => s + w * m.means[i], 0);
export function mixtureVariance(m) {
  const mu = mixtureMean(m);
  return m.weights.reduce((s, w, i) => s + w * (m.sds[i] ** 2 + (m.means[i] - mu) ** 2), 0);
}

/** The Gaussianising map z = φ(x) = Φ⁻¹(F(x)) of a density on the line. */
export const gaussianize = (x, m = TWO_BASINS) => normalQuantile(mixtureCdf(x, m));
/** Its slope φ′(x) = p(x) / ϕ(φ(x)). */
export const gaussianizeSlope = (x, m = TWO_BASINS) => mixturePdf(x, m) / normalPdf(gaussianize(x, m));

/** A uniform grid [lo, hi] with n points. */
export const linspace = (lo, hi, n) => Float64Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));

/** Derivative on a uniform grid: central differences inside, one-sided at the ends. */
export function derivative(values, h) {
  const n = values.length;
  const d = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) d[i] = (values[i + 1] - values[i - 1]) / (2 * h);
  d[0] = (values[1] - values[0]) / h;
  d[n - 1] = (values[n - 1] - values[n - 2]) / h;
  return d;
}

/**
 * The score-matching residual of one score function u under the reversible operator
 * L_W f = (1/p) (p W f′)′ on a grid. Returns the Fisher information I = E[u²] (u centred),
 * G = E[W u′²], the residual r = L_W u + (G/I) u, and the variance ratio Γ_SM / Γ_MLE computed two
 * ways: 1 + I E[r²] / G² (the residual identity) and I E[(L_W u)²] / G² (the sandwich formula).
 * `du` is u′ when known analytically.
 */
export function closure({ xs, p, u, W, du: analytic }) {
  const n = xs.length;
  const h = xs[1] - xs[0];
  let mass = 0;
  let mean = 0;
  for (let i = 0; i < n; i++) {
    mass += p[i] * h;
    mean += p[i] * u[i] * h;
  }
  mean /= mass;
  const uc = Float64Array.from(u, (v) => v - mean);
  const du = analytic ?? derivative(uc, h); // u′, analytic when known (the map's slope), else by differences
  const flux = Float64Array.from(du, (v, i) => p[i] * W[i] * v);
  const Lu = Float64Array.from(derivative(flux, h), (v, i) => v / p[i]);
  const average = (f) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += p[i] * f(i) * h;
    return s / mass;
  };
  const I = average((i) => uc[i] ** 2);
  const G = average((i) => W[i] * du[i] ** 2);
  const r = Float64Array.from(Lu, (v, i) => v + (G / I) * uc[i]);
  const residualVariance = average((i) => r[i] ** 2);
  return {
    I,
    G,
    uc,
    Lu,
    r,
    residualVariance,
    cross: average((i) => Lu[i] * uc[i]), // should be −G
    orthogonality: average((i) => r[i] * uc[i]), // should be 0
    ratio: 1 + (I * residualVariance) / (G * G),
    ratioSandwich: (I * average((i) => Lu[i] ** 2)) / (G * G),
  };
}

/** The grid of the one-dimensional example, with the density, the map and its mobility tabulated. */
export const LINE = (() => {
  const xs = linspace(-3.0, 4.0, 2801);
  const p = Float64Array.from(xs, (x) => mixturePdf(x, TWO_BASINS));
  const z = Float64Array.from(xs, (x) => gaussianize(x, TWO_BASINS));
  const slope = Float64Array.from(xs, (x) => gaussianizeSlope(x, TWO_BASINS));
  const mobility = Float64Array.from(slope, (s) => 1 / (s * s));
  return { xs, p, z, slope, mobility, h: xs[1] - xs[0] };
})();

/** The four combinations of the model's score function (x, or φ(x)) and the mobility (1, or 1/φ′²). */
export function closureTable() {
  const { xs, p, z, slope, mobility } = LINE;
  const ones = new Float64Array(xs.length).fill(1);
  const cases = { x: { u: Float64Array.from(xs), du: ones }, z: { u: z, du: slope } };
  const mobilities = { flat: ones, warped: mobility };
  const table = {};
  for (const [uName, { u, du }] of Object.entries(cases)) {
    table[uName] = {};
    for (const [wName, W] of Object.entries(mobilities)) table[uName][wName] = closure({ xs, p, u, W, du });
  }
  return table;
}

// ---- the flow identity --------------------------------------------------------------------------
// Both densities evolve by ∂_t p = (W p′)′ with W = 1, so each Gaussian component's variance grows by 2t.

export function flowKl(p, q, t, xs) {
  const h = xs[1] - xs[0];
  let kl = 0;
  for (const x of xs) {
    const a = mixturePdf(x, p, 2 * t);
    const b = mixturePdf(x, q, 2 * t);
    if (a > 1e-300) kl += a * Math.log(a / b) * h;
  }
  return kl;
}

/** E_{p_t}[(s_p − s_q)²], the squared score error weighted by W = 1. */
export function scoreGap(p, q, t, xs) {
  const h = xs[1] - xs[0];
  let s = 0;
  for (const x of xs) s += mixturePdf(x, p, 2 * t) * (mixtureScore(x, p, 2 * t) - mixtureScore(x, q, 2 * t)) ** 2 * h;
  return s;
}

/** KL(p₀‖q₀) − KL(p_T‖q_T) against ∫₀ᵀ E_{p_t}[(s_p − s_q)²] dt (Simpson's rule). */
export function flowIdentity(p, q, T, { xs = linspace(-9, 10, 1901), steps = 60 } = {}) {
  const dt = T / steps;
  let integral = 0;
  for (let i = 0; i <= steps; i++) integral += (i === 0 || i === steps ? 1 : i % 2 ? 4 : 2) * scoreGap(p, q, i * dt, xs);
  integral *= dt / 3;
  return { drop: flowKl(p, q, 0, xs) - flowKl(p, q, T, xs), integral };
}

// ---- the heat kernel on the circle ----------------------------------------------------------------
// Brownian motion with generator ½ ∂²: k_τ(θ) = (1/2π) (1 + 2 Σ e^{−n²τ/2} cos nθ).

export function circleKernel(theta, tau, terms = 160) {
  let s = 1;
  for (let n = 1; n <= terms; n++) {
    const e = Math.exp((-n * n * tau) / 2);
    if (e < 1e-18) break;
    s += 2 * e * Math.cos(n * theta);
  }
  return s / (2 * Math.PI);
}

function circleKernelSlope(theta, tau, terms = 160) {
  let s = 0;
  for (let n = 1; n <= terms; n++) {
    const e = Math.exp((-n * n * tau) / 2);
    if (e < 1e-18) break;
    s -= 2 * n * e * Math.sin(n * theta);
  }
  return s / (2 * Math.PI);
}

/** Fisher information about the starting angle after time τ: ∫ (∂_θ k)² / k dθ. */
export function circleFisher(tau, points = 2048) {
  let F = 0;
  for (let i = 0; i < points; i++) {
    const theta = (-Math.PI + ((i + 0.5) * 2 * Math.PI) / points);
    F += circleKernelSlope(theta, tau) ** 2 / circleKernel(theta, tau);
  }
  return (F * 2 * Math.PI) / points;
}

// ---- small linear algebra (symmetric matrices as arrays of rows) ------------------------------------

export function cholesky(A) {
  const n = A.length;
  const L = A.map(() => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
    }
  }
  return L;
}

/** Eigenvalues of a symmetric matrix by Jacobi rotations, descending. */
export function symmetricEigenvalues(M) {
  const n = M.length;
  const A = M.map((row) => [...row]);
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
    if (off < 1e-24) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k][p];
          const akq = A[k][q];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k];
          const aqk = A[q][k];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
      }
    }
  }
  return A.map((row, i) => row[i]).sort((a, b) => b - a);
}

/** Eigenvalues of R = I₀^{−1/2} I_t I₀^{−1/2}: those of L⁻¹ I_t L⁻ᵀ with I₀ = L Lᵀ. */
export function retainedFractions(I0, It) {
  const n = I0.length;
  const L = cholesky(I0);
  const solve = (b) => {
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let k = 0; k < i; k++) s -= L[i][k] * y[k];
      y[i] = s / L[i][i];
    }
    return y;
  };
  const Y = It.map((row) => solve(row)); // rows: L⁻¹ applied to each row of I_t → (L⁻¹ I_t)ᵀ… symmetric, so fine
  const R = Array.from({ length: n }, (_, i) => solve(Y.map((row) => row[i])));
  return symmetricEigenvalues(R.map((row, i) => row.map((v, j) => (v + R[j][i]) / 2)));
}

// ---- Gaussian denoising of the line example (for the posterior-Fisher picture) ---------------------

/** Posterior mean and variance of x given y = x + σ z, by quadrature on the line grid. */
export function linePosterior(y, sigma, m = TWO_BASINS, xs = LINE.xs) {
  let w = 0;
  let mean = 0;
  let second = 0;
  for (const x of xs) {
    const weight = mixturePdf(x, m) * Math.exp(-((y - x) ** 2) / (2 * sigma * sigma));
    w += weight;
    mean += weight * x;
    second += weight * x * x;
  }
  mean /= w;
  return { mean, variance: second / w - mean * mean };
}
