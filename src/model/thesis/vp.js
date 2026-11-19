// R1 · The variance-preserving schedule every thesis piece uses (DOM-free).
//   β(t) = 0.1 + 19.9 t,  B(t) = ∫β = 0.1 t + 9.95 t²,  α² = e^{−B},  σ² = 1 − α²
//   log-SNR ℓ(t) = ln(α²/σ²);  a Gaussian feature of variance λ (in noise units) is half
//   erased where α²λ = σ², i.e. B = ln(1 + λ):  t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1 + λ))) / 19.9.

export const T_MIN_CARTESIAN = 1e-5;
export const T_MIN_INTERNAL = 0.01;

export const beta = (t) => 0.1 + 19.9 * t;
export const integratedBeta = (t) => 0.1 * t + 9.95 * t * t;
export const alpha2 = (t) => Math.exp(-integratedBeta(t));
export const alpha = (t) => Math.exp(-integratedBeta(t) / 2);
export const sigma2 = (t) => -Math.expm1(-integratedBeta(t));
export const sigma = (t) => Math.sqrt(sigma2(t));
/** σ/α: the noise in units of the (shrunk) signal. */
export const noiseToSignal = (t) => Math.sqrt(Math.expm1(integratedBeta(t)));
export const logSnr = (t) => -integratedBeta(t) - Math.log(sigma2(t));

/** The level t at which the integrated β equals b (inverse of integratedBeta, b ≥ 0). */
export const tAtIntegratedBeta = (b) => (-0.1 + Math.sqrt(0.01 + 39.8 * b)) / 19.9;
/** The level t with log-SNR ℓ. */
export const tAtLogSnr = (l) => tAtIntegratedBeta(Math.log1p(Math.exp(-l)));
/** Half-erasure level of a linear Gaussian feature of variance λ in noise units. */
export const tHalf = (lambda) => tAtIntegratedBeta(Math.log1p(lambda));
