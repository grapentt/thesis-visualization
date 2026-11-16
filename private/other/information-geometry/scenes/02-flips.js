// Scene 02: where the count distributions come from. A coin with p = ½ is flipped 100 times, the
// heads are counted, the run is repeated 2000 times (seeded) and the counts pile up into a hill: the
// binomial distribution. Its width is √(n p (1 − p)): one flip has variance p(1 − p), independent
// flips add variances. Then the whole family on one axis, as p sweeps from 0 to 1.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, rgba } from '../../../../src/kit.js';
import { createRng } from '../../../../src/engine/random.js';
import { P_COL, Q_COL, METRIC, DATA, header, frame, axes, drawPmf, drawCurve, drawPath, drawPoint, readout, exampleStamp, fmt, caption, pill, clipped } from '../shared.js';
import { binomialPmfs } from '../math.js';

const N = 100;
const RUNS = 2000;
const P0 = 0.5;
const rng = createRng(7);
const FLIPS = []; // the first five runs, flip by flip
const COUNTS = []; // heads in each of the 2000 runs
for (let r = 0; r < RUNS; r++) {
  let k = 0;
  const row = r < 5 ? [] : null;
  for (let i = 0; i < N; i++) {
    const heads = rng.uniform() < P0;
    if (heads) k++;
    if (row) row.push(heads);
  }
  if (row) FLIPS.push(row);
  COUNTS.push(k);
}
const PMF = binomialPmfs(N, P0);
const HF = frame({ x: 110, y: 430, w: 640, h: 230, u: [-0.5, 100.5], v: [0, 0.1] });
const SD = frame({ x: 880, y: 390, w: 300, h: 140, u: [0, 1], v: [0, 6] });
const SW = frame({ x: 880, y: 620, w: 640, h: 210, u: [-0.5, 100.5], v: [0, 0.3] });
const GHOSTS = [0.02, 0.1, 0.3, 0.5, 0.7, 0.9, 0.98].map((p) => ({ p, pmf: binomialPmfs(N, p) }));
const R = 850;
const sdOf = (p) => Math.sqrt(N * p * (1 - p));

const ONE = tex(String.raw`X \in \{0, 1\}:\qquad \mathbb E[X] = p,\qquad \operatorname{Var}[X] = p\,(1-p)`, 'X ∈ {0, 1}: E[X] = p, Var[X] = p(1−p)');
const MANY = tex(String.raw`K = X_1 + \dots + X_n:\qquad \mathbb E[K] = np,\qquad \operatorname{Var}[K] = n\,p\,(1-p)`, 'K = X₁ + … + Xₙ: E[K] = np, Var[K] = n p(1−p)');
const SDF = tex(String.raw`\mathrm{sd}(K) = \sqrt{n\,p\,(1-p)}`, 'sd(K) = √(n p(1−p))');
const BINOM = tex(String.raw`P(K = k \mid p) = \binom{n}{k}\, p^{k}\,(1-p)^{\,n-k}`, 'P(K = k | p) = C(n, k) pᵏ (1−p)ⁿ⁻ᵏ');

// the schedule of the runs: five shown flip by flip, then an exponential ramp to 2000
const ROWS = [
  { from: 0.5, to: 7 },
  { from: 9, to: 13 },
  { from: 14.5, to: 18 },
  { from: 19.5, to: 21.5 },
  { from: 22, to: 23.5 },
];
const coinsShown = (r, t) => Math.floor(lin(t, ROWS[r].from, ROWS[r].to) * N);
const runsDone = (t) => {
  if (t < 28) return ROWS.filter((row) => t >= row.to + 0.6).length;
  return Math.min(RUNS, Math.round(5 * Math.pow(RUNS / 5, lin(t, 28, 40))));
};

export default defineScene({
  name: 'Flipping coins',
  duration: 128,
  narration: [
    [0, 'Before comparing coins, watch where these count distributions come from. Take a coin with p equal to one half and flip it a hundred times: gold for heads, grey for tails. Count the heads: here, forty-three. Do it again: forty-four. And again: forty-eight. Each run of a hundred flips gives one number, and the numbers differ, because the flips are random.'],
    [28, 'Repeat the run two thousand times and tally the counts. The tally settles into a hill: most runs give close to fifty heads, a run with forty or sixty is rare, thirty almost never happens. The exact shape is the binomial distribution, drawn as the curve, and for a hundred flips it is close to a Gaussian.'],
    [51, 'What sets the width of the hill? One flip is a yes-or-no with mean p and variance p times one minus p. A hundred independent flips add their variances, so the count has variance a hundred times p times one minus p, and its standard deviation is the square root of that. At p equal one half, that is five heads.'],
    [76, 'Near p equal to zero the coin almost always shows tails, so the count hardly varies: at p equal point oh two the standard deviation is one point four heads. A fair coin is the most unpredictable coin there is; a lopsided coin is nearly deterministic. The spread is a property of the coin, not of the scale of the picture: here both hills are drawn on the same axis.'],
    [101, 'Here is the whole family on one axis. As p runs from zero to one, the hill slides from the left edge to the right, narrow at both ends and widest in the middle. Keep this in mind for the next scene: a step in p moves the hill by the same number of heads everywhere, but the hills it has to clear are wide in the middle and narrow at the edges.'],
  ],
  header: header(2, 'FLIPPING COINS', 'Where the count distributions come from, and what sets their width'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    drawRuns(ctx, t, on);
    drawHistogram(ctx, t, on);
    drawWidth(ctx, t);
    drawSweep(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `n = ${N} flips · ${RUNS} seeded runs · everything on screen is computed`);
  },
});

/** The first five runs, flip by flip, with their head counts. */
function drawRuns(ctx, t, on) {
  text(ctx, `a coin with p = ${P0}, flipped ${N} times, five runs`, 110, 200, { ...type.note, alpha: on });
  const x0 = 116;
  const dx = (640 - 12) / (N - 1);
  ROWS.forEach((row, r) => {
    const shown = coinsShown(r, t);
    const y = 228 + r * 30;
    for (let i = 0; i < shown; i++) {
      const heads = FLIPS[r][i];
      dot(ctx, x0 + i * dx, y, heads ? 4.2 : 3.2, heads ? P_COL : color.dim, heads ? 1 : 0.8);
    }
    const done = seg(t, row.to + 0.1, row.to + 0.6);
    text(ctx, `${COUNTS[r]} heads`, 760, y + 5, { font: font.mono, size: 15, color: P_COL, alpha: done });
    if (r === 0) {
      const live = fade(t, row.from, row.from + 0.3, row.to, row.to + 0.3);
      text(ctx, `${FLIPS[0].slice(0, shown).filter(Boolean).length} so far`, 760, y + 5, { font: font.mono, size: 13, color: color.muted, alpha: live });
    }
  });
  const legend = seg(t, 1, 2);
  dot(ctx, 118, 392, 4.2, P_COL, legend);
  text(ctx, 'heads', 130, 397, { font: font.mono, size: 13, color: color.muted, alpha: legend });
  dot(ctx, 196, 392, 3.2, color.dim, legend);
  text(ctx, 'tails', 208, 397, { font: font.mono, size: 13, color: color.muted, alpha: legend });
  const m = runsDone(t);
  text(ctx, `runs so far: ${m}`, 750, 397, { font: font.mono, size: 14, color: color.body, align: 'right', alpha: seg(t, 7.5, 8.5) });
}

/** The tally of head counts, as a histogram of frequencies, with the exact binomial curve. */
function drawHistogram(ctx, t, on) {
  const m = runsDone(t);
  axes(ctx, HF, { xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 0.05, 0.1], xLabel: 'heads in 100 flips', alpha: on, grid: true });
  caption(ctx, HF, m < 6 ? 'each run adds one mark at its count' : `the tally of ${m} runs, as fractions`, seg(t, 7, 8), { color: color.muted });
  if (m > 0) {
    const freq = new Array(N + 1).fill(0);
    for (let r = 0; r < m; r++) freq[COUNTS[r]]++;
    if (m <= 5) {
      // single marks, stacked
      for (let r = 0; r < m; r++) {
        const k = COUNTS[r];
        const stack = COUNTS.slice(0, r).filter((c) => c === k).length;
        dot(ctx, HF.X(k), HF.Y(0) - 8 - 14 * stack, 5, P_COL);
      }
    } else {
      drawPmf(ctx, HF, freq.map((v) => v / m), { colour: rgba(P_COL, 0.7) });
    }
  }
  const curve = seg(t, 42, 43);
  clipped(ctx, HF, () => drawPath(ctx, HF, PMF.map((v, k) => [k, v]), { colour: color.ink, alpha: curve, width: 2 }));
  BINOM.draw(ctx, HF.x + 20, HF.y + 30, { size: 20, alpha: curve });
  text(ctx, 'the exact distribution; for n = 100 nearly a Gaussian with the same mean and width', HF.x + 20, HF.y + 60, { ...type.note, size: 13, alpha: seg(t, 46, 47) });
  readout(ctx, 'mean', N * P0, HF.x + HF.w - 10, HF.y + 24, { colour: color.body, alpha: seg(t, 64, 65), align: 'right', digits: 0 });
  readout(ctx, 'sd', sdOf(P0), HF.x + HF.w - 10, HF.y + 46, { colour: METRIC, alpha: seg(t, 64, 65), align: 'right', digits: 1 });
}

/** The width: variance of one flip, of n flips, and the curve sd(p) = √(n p (1 − p)). */
function drawWidth(ctx, t) {
  const w = seg(t, 52, 53);
  pill(ctx, 'WHAT SETS THE WIDTH', R, 205, METRIC, w);
  ONE.draw(ctx, R, 250, { size: 21, alpha: seg(t, 53, 54) });
  text(ctx, 'one flip is a yes-or-no; its variance p(1 − p) peaks at p = ½ (¼) and vanishes at 0 and 1', R, 284, { ...type.note, size: 13, alpha: seg(t, 55, 56) });
  MANY.draw(ctx, R, 322, { size: 21, alpha: seg(t, 58, 59) });
  text(ctx, 'independent flips add their variances', R, 354, { ...type.note, size: 13, alpha: seg(t, 60, 61) });
  const plot = seg(t, 64, 65);
  if (plot > 0.003) {
    axes(ctx, SD, { xTicks: [0, 0.5, 1], yTicks: [0, 2, 4, 6], xLabel: 'p', alpha: plot, grid: true });
    text(ctx, 'sd of the count, √(100 p(1 − p))', SD.x, SD.y - 14, { ...type.note, size: 13, color: METRIC, alpha: plot });
    drawCurve(ctx, SD, sdOf, { colour: METRIC, alpha: plot, width: 2.5, n: 200, progress: lin(t, 64.5, 68) });
    drawPoint(ctx, SD, [0.5, sdOf(0.5)], { colour: P_COL, alpha: seg(t, 69, 70), r: 5, label: '5.0', labelOffset: [8, -8] });
    drawPoint(ctx, SD, [0.02, sdOf(0.02)], { colour: Q_COL, alpha: seg(t, 78, 79), r: 5, label: '1.4', labelOffset: [8, -6] });
    drawPoint(ctx, SD, [0.07, sdOf(0.07)], { colour: Q_COL, alpha: seg(t, 79, 80), r: 4, label: '2.6', labelOffset: [8, -4] });
  }
  SDF.draw(ctx, R + 340, 420, { size: 24, alpha: seg(t, 64, 65) });
  readout(ctx, 'p = 0.50:  sd =', sdOf(0.5), R + 340, 462, { colour: P_COL, alpha: seg(t, 69, 70), digits: 1 });
  readout(ctx, 'p = 0.02:  sd =', sdOf(0.02), R + 340, 488, { colour: Q_COL, alpha: seg(t, 78, 79), digits: 1 });
  text(ctx, 'nearly deterministic: almost every flip is tails', R + 340, 512, { ...type.note, size: 13, alpha: seg(t, 86, 87) });
}

/** The whole family on one axis: two hills first, then the sweep with ghosts. */
function drawSweep(ctx, t) {
  const on = seg(t, 80, 81);
  if (on <= 0.003) return;
  axes(ctx, SW, { xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 0.1, 0.2, 0.3], xLabel: 'heads in 100 flips', alpha: on, grid: true });
  const sweeping = t >= 103;
  caption(ctx, SW, sweeping ? 'every p on one axis: the hill slides, narrow at the ends, widest in the middle' : 'the same axis for both: p = 0.5 (gold) and p = 0.02 (blue)', on, { color: color.muted });
  clipped(ctx, SW, () => {
    if (!sweeping) {
      drawPath(ctx, SW, PMF.map((v, k) => [k, v]), { colour: P_COL, alpha: on, width: 2.2, fill: rgba(P_COL, 0.15), close: false });
      const edge = GHOSTS[0].pmf;
      drawPath(ctx, SW, edge.map((v, k) => [k, v]), { colour: Q_COL, alpha: on * seg(t, 82, 83), width: 2.2 });
      text(ctx, 'sd 5.0', SW.X(50), SW.Y(PMF[50]) - 10, { font: font.mono, size: 13, color: P_COL, align: 'center', alpha: on });
      text(ctx, 'sd 1.4', SW.X(2) + 30, SW.Y(0.2), { font: font.mono, size: 13, color: Q_COL, alpha: on * seg(t, 82, 83) });
    } else {
      const p = 0.02 + 0.96 * lin(t, 103, 121);
      for (const g of GHOSTS) {
        const passed = seg(t, 103 + ((g.p - 0.02) / 0.96) * 18, 104 + ((g.p - 0.02) / 0.96) * 18);
        drawPath(ctx, SW, g.pmf.map((v, k) => [k, v]), { colour: METRIC, alpha: 0.45 * passed, width: 1.2 });
      }
      const pmf = binomialPmfs(N, p);
      drawPath(ctx, SW, pmf.map((v, k) => [k, v]), { colour: P_COL, width: 2.4, fill: rgba(P_COL, 0.15) });
      readout(ctx, 'p =', p, SW.x + SW.w - 10, SW.y + 22, { colour: P_COL, align: 'right', size: 15 });
      readout(ctx, 'mean', N * p, SW.x + SW.w - 10, SW.y + 44, { colour: color.body, align: 'right', size: 14, digits: 0 });
      readout(ctx, 'sd', sdOf(p), SW.x + SW.w - 10, SW.y + 64, { colour: METRIC, align: 'right', size: 14, digits: 1 });
    }
  });
  text(ctx, 'five heads of separation: a small step for a wide hill,', SW.x + 12, SW.y + 24, { ...type.note, size: 13, color: METRIC, alpha: seg(t, 116, 117) });
  text(ctx, 'a large one for a narrow hill', SW.x + 12, SW.y + 44, { ...type.note, size: 13, color: METRIC, alpha: seg(t, 116, 117) });
}
