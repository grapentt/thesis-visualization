// R2 · What a noisy state still knows about one Gaussian feature (DOM-free).
//   readability r(t) = α²λ / (α²λ + σ²) = SNR/(1 + SNR), SNR = λ α²/σ²;  a width keeps r²;
//   information −½ ln(1 − r).  The decision window (r from 0.8 to 0.2) spans SNR 4 → 1/4,
//   a factor 16, i.e. ln 16 ≈ 2.77 log-SNR units, whatever λ is.

import { alpha2, sigma2, logSnr } from './vp.js';

export const readability = (t, lambda) => {
  const s = alpha2(t) * lambda;
  return s / (s + sigma2(t));
};
export const widthReadability = (t, lambda) => readability(t, lambda) ** 2;
export const information = (r) => -0.5 * Math.log(1 - r);

/** Log-SNR of the noise at which the feature's own SNR = snr. */
export const logSnrForFeatureSnr = (lambda, snr) => Math.log(snr / lambda);
/** The linear decision window [ℓ at r = 0.2, ℓ at r = 0.8] in log-SNR units. */
export const decisionWindow = (lambda) => [logSnrForFeatureSnr(lambda, 0.25), logSnrForFeatureSnr(lambda, 4)];
export const DECISION_SPAN = Math.log(16);

/** Readability of the feature at the level t as a function of the noise log-SNR (for curves on the rail). */
export const readabilityAtLogSnr = (l, lambda) => {
  const snr = lambda * Math.exp(l);
  return snr / (1 + snr);
};
export { logSnr };
