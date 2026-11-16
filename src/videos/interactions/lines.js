// Point molecules on a line (§2.6): the noisy weight W_t in closed-form quadratures.
//
// Reference: each point N(0, 1). Clean weight per pair: log w(r) = LOG_W(x_i − x_j), a narrow
// well at distance 1. Noise is VP, z = a x + σε with a = √(1 − σ²), so under the reference
// x | z ~ N(a z, σ² I): the reference is stationary and only the weight blurs.

export const LOG_W = (r) => 3 * Math.exp(-((Math.abs(r) - 1) ** 2) / (2 * 0.15 ** 2));
const DLOG_W = (r) => LOG_W(r) * (-(Math.abs(r) - 1) / 0.15 ** 2) * Math.sign(r);

const shrink = (sigma) => Math.sqrt(1 - sigma * sigma);

/**
 * Two points: W_t(z) = g(z₁ − z₂), g(d) = E[w(a d + √2σξ)], ξ ~ N(0, 1), tabulated on 2 001 points of
 * d ∈ [−6, 6] by the trapezoid rule on ξ ∈ [−8, 8] (step min(1, 0.15/(√2σ))/4), with
 * ∂_d log g = a E[w′]/E[w]. σ = 0 gives log w itself.
 */
export function twoPointTable(sigma) {
  const a = shrink(sigma), spread = Math.SQRT2 * sigma;
  const step = Math.min(1, spread > 0 ? 0.15 / spread : 1) / 4;
  const K = Math.round(8 / step);
  const xi = [], weight = [];
  for (let k = -K; k <= K; k++) {
    xi.push(k * step);
    weight.push(Math.exp(-0.5 * (k * step) ** 2) * (Math.abs(k) === K ? 0.5 : 1));
  }
  const d = new Float64Array(2001), logg = new Float64Array(2001), dlogg = new Float64Array(2001);
  for (let n = 0; n < 2001; n++) {
    d[n] = -6 + (12 * n) / 2000;
    let Ew = 0, Ewp = 0, total = 0;
    for (let k = 0; k < xi.length; k++) {
      const x = a * d[n] + spread * xi[k];
      const w = Math.exp(LOG_W(x));
      Ew += weight[k] * w;
      Ewp += weight[k] * w * DLOG_W(x);
      total += weight[k];
    }
    logg[n] = Math.log(Ew / total);
    dlogg[n] = (a * Ewp) / Ew;
  }
  return { d, logg, dlogg };
}

/** Linear interpolation in a two-point table: { logg, dlogg } at d (clamped to [−6, 6]). */
export function tableAt({ logg, dlogg }, d) {
  const x = Math.min(2000, Math.max(0, ((d + 6) / 12) * 2000));
  const n = Math.min(1999, Math.floor(x)), f = x - n;
  return { logg: logg[n] + f * (logg[n + 1] - logg[n]), dlogg: dlogg[n] + f * (dlogg[n + 1] - dlogg[n]) };
}

/**
 * Quadrature grid per σ: offsets U_k = k h, h = min(0.04, √2σ/10), |U| ≤ 5√2σ, with the Gaussian
 * factors needed below. Memoised. Options for convergence tests: refine (h / refine), reach (in √2σ).
 */
const grids = new Map();
function gridFor(sigma, { refine = 1, reach = 5 } = {}) {
  const key = `${sigma}:${refine}:${reach}`;
  if (grids.has(key)) return grids.get(key);
  const h = Math.min(0.04, (Math.SQRT2 * sigma) / 10) / refine;
  const K = Math.ceil((reach * Math.SQRT2 * sigma) / h);
  const n = 2 * K + 1;
  const U = Float64Array.from({ length: n }, (_, i) => (i - K) * h);
  const s6 = 6 * sigma * sigma;
  const gauss = U.map((u) => Math.exp(-(u * u) / s6)); // exp(−U²/6σ²)
  const cross = Float64Array.from({ length: 2 * n - 1 }, (_, k) => Math.exp(-(((k - n + 1) * h) ** 2) / s6));
  const pair = U.map((u) => Math.exp(-(u * u) / (4 * sigma * sigma))); // N(0, 2σ²) for one difference
  let Z3 = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) Z3 += gauss[i] * gauss[j] * cross[j - i + n - 1];
  const grid = { h, n, U, gauss, cross, pair, Z3, Z2: pair.reduce((s, v) => s + v, 0) };
  grids.set(key, grid);
  return grid;
}

/**
 * Three points: W₃(z) = E[w₁₂ w₁₃ w₂₃ | z]. In the difference offsets U = d₁₂ − a(z₁ − z₂),
 * V = d₁₃ − a(z₁ − z₃) the Gaussian factor is exp(−(U² + V² + (U − V)²)/6σ²), so the integrand
 * separates into A_i B_j C_{j−i}: an O(n²) trapezoid sum. The gradient comes from
 * ∂log W₃/∂(m₀, m₁) = Σ⁻¹ E_w[(U, V)], Σ = σ²[[2, 1], [1, 2]], m = a(z₁ − z₂, z₁ − z₃).
 */
export function threePointW(z, sigma, grid = {}) {
  const a = shrink(sigma);
  const { n, h, U, gauss, cross, Z3 } = gridFor(sigma, grid);
  const m0 = a * (z[0] - z[1]), m1 = a * (z[0] - z[2]);
  const A = U.map((u, i) => gauss[i] * Math.exp(LOG_W(m0 + u)));
  const B = U.map((u, j) => gauss[j] * Math.exp(LOG_W(m1 + u)));
  const C = cross.map((g, k) => g * Math.exp(LOG_W(m1 - m0 + (k - n + 1) * h)));
  const cutoff = 1e-14 * Math.max(...A);
  let S = 0, SU = 0, SV = 0;
  for (let i = 0; i < n; i++) {
    if (A[i] < cutoff) continue;
    let T = 0, TV = 0;
    for (let j = 0, k = n - 1 - i; j < n; j++, k++) {
      const t = B[j] * C[k];
      T += t;
      TV += t * U[j];
    }
    S += A[i] * T;
    SU += A[i] * T * U[i];
    SV += A[i] * TV;
  }
  const EU = SU / S, EV = SV / S, s3 = 3 * sigma * sigma;
  const dm0 = (2 * EU - EV) / s3, dm1 = (2 * EV - EU) / s3;
  return { logW: Math.log(S / Z3), grad: [a * (dm0 + dm1), -a * dm0, -a * dm1] };
}

/** One pair's model: W_ij = E[w(d) | z_i, z_j], d ~ N(a(z_i − z_j), 2σ²), on the same grid. */
export function pairW(zi, zj, sigma, grid = {}) {
  const a = shrink(sigma);
  const { U, pair, Z2 } = gridFor(sigma, grid);
  const m = a * (zi - zj);
  let S = 0, SU = 0;
  U.forEach((u, k) => {
    const t = pair[k] * Math.exp(LOG_W(m + u));
    S += t;
    SU += t * u;
  });
  const gi = (a * (SU / S)) / (2 * sigma * sigma);
  return { logW: Math.log(S / Z2), gi, gj: -gi };
}
