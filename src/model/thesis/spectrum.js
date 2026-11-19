// R18 · BBA's 27 Cartesian collective modes in library units, and the whitening exponent γ (DOM-free).
//   library units: c₀² × mean square, c₀ = √(27 / Σ mean squares) = 0.15706 Å⁻¹, so they average 1.
//   γ dial (#1057): λ_k(γ) = λ_k^{1−γ}, renormalised to unit mean; γ = 0 is Cartesian, γ = 1 whitened.
//   R3's ALDP5 family uses λ^{1−γ} without the renormalisation (γ = 1 puts every mode at λ = 1).

import { tHalf } from './vp.js';

export const libraryUnits = (meanSquares) => {
  const c0 = Math.sqrt(meanSquares.length / meanSquares.reduce((a, b) => a + b, 0));
  return { c0, lambda: meanSquares.map((m) => c0 * c0 * m) };
};

export function gammaSpectrum(lambda, gamma, { unitMean = true } = {}) {
  const raw = lambda.map((l) => l ** (1 - gamma));
  if (!unitMean) return raw;
  const m = raw.reduce((a, b) => a + b, 0) / raw.length;
  return raw.map((l) => l / m);
}

export const ratio = (lambda) => Math.max(...lambda) / Math.min(...lambda);
export const halfLevels = (lambda) => lambda.map(tHalf);

/** The γ at which a mode of variance λ (no renormalisation) is half erased at level t: λ^{1−γ} = e^{B(t)} − 1. */
export const gammaForHalfAt = (lambda, target) => 1 - Math.log(target) / Math.log(lambda);
