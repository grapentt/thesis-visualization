// R30 (subset) · Evidence arithmetic the scenes share (DOM-free).
//   training share = (t½ − t_min)/(1 − t_min): the share of uniform-t training draws that still see
//   a feature more than half readable. A feature is "in range" at a share ≥ 1% (a declared design
//   threshold of the programme, not a theorem).
//   effect rule (PR #1069): a gap between two recipes counts only if it exceeds the largest two-seed
//   difference of either.

export const IN_RANGE = 0.01;

export const trainingShare = (tHalf, tMin) => Math.max(0, (tHalf - tMin) / (1 - tMin));
export const inRange = (tHalf, tMin) => trainingShare(tHalf, tMin) >= IN_RANGE;

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const spread = (xs) => (xs.length > 1 ? Math.max(...xs) - Math.min(...xs) : 0);

/** { gap, yardstick, effect } for two recipes given their per-seed values. */
export function effectRule(a, b) {
  const gap = Math.abs(mean(a) - mean(b));
  const yardstick = Math.max(spread(a), spread(b));
  return { gap, yardstick, effect: gap > yardstick };
}
export { mean, spread };
