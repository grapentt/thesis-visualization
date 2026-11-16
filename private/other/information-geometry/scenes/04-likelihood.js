// Scene 04: what p(x | θ) means, and the score. A model is a table: one distribution over outcomes
// x for each θ (one flip: p(H | θ) = θ; a hundred flips: the binomial hill). Fix the data and vary
// θ: the likelihood; take its log; its slope is the score, 1/p for heads and −1/(1 − p) for tails.
// Why the logarithm: relative change, additivity over independent flips, and the Gaussian parabola.
// At the true coin the score averages to zero.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, dot, rgba, brace } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, KL_COL, header, frame, axes, drawPmf, drawCurve, drawPath, drawPoint, drawOutcomeBars, readout, exampleStamp, fmt, caption, pill, clipped, panel } from '../shared.js';
import { binomialPmfs, bernoulliLogLik, bernoulliScore, gaussianPdf } from '../math.js';

const N = 100;
const TH = frame({ x: 110, y: 260, w: 400, h: 1, u: [0, 1], v: [0, 1] }); // the θ axis of the table
const HILL = frame({ x: 110, y: 335, w: 400, h: 100, u: [-0.5, 100.5], v: [0, 0.3] });
const LIK = frame({ x: 110, y: 500, w: 640, h: 300, u: [0, 1], v: [0, 1.05] });
const LOG = frame({ x: 110, y: 500, w: 640, h: 300, u: [0, 1], v: [-3.2, 0.2] });
const BELL = frame({ x: 1350, y: 620, w: 190, h: 64, u: [-3, 3], v: [0, 0.45] });
const PARAB = frame({ x: 1350, y: 722, w: 190, h: 64, u: [-3, 3], v: [-4.6, 0.2] });
const EPS = 0.02;
const R = 850;

const MODEL = tex(String.raw`p(x \mid \theta)\;:\quad \text{the probability of outcome } x \text{ if the parameter is } \theta`, 'p(x | θ): the probability of outcome x if the parameter is θ');
const COIN = tex(String.raw`p(\mathrm{H} \mid \theta) = \theta,\qquad p(\mathrm{T} \mid \theta) = 1 - \theta`, 'p(H | θ) = θ, p(T | θ) = 1 − θ');
const BIN = tex(String.raw`p(k \mid \theta) = \binom{n}{k}\theta^{k}(1-\theta)^{n-k}\quad\text{for } n \text{ flips}`, 'p(k | θ) = C(n, k) θᵏ (1−θ)ⁿ⁻ᵏ for n flips');
const LIKF = tex(String.raw`L(\theta) = p(x_{\text{seen}} \mid \theta)\quad\text{as a function of } \theta`, 'L(θ) = p(x_seen | θ) as a function of θ');
const SCORE = tex(String.raw`s(x,\theta) = \frac{\partial}{\partial\theta}\log p(x\mid\theta) = \frac{\partial_\theta\, p(x\mid\theta)}{p(x\mid\theta)}`, 's(x, θ) = ∂_θ log p(x | θ) = ∂_θ p / p');
const SCORES = tex(String.raw`s(\mathrm{H},p) = \frac{d}{d\theta}\log\theta\Big|_{p} = \frac{1}{p},\qquad s(\mathrm{T},p) = \frac{d}{d\theta}\log(1-\theta)\Big|_{p} = -\frac{1}{1-p}`, 's(H, p) = 1/p, s(T, p) = −1/(1−p)');
const ADD = tex(String.raw`\log\prod_i p(x_i\mid\theta) = \sum_i \log p(x_i\mid\theta)\;\Rightarrow\; s_n = \frac{k}{p} - \frac{n-k}{1-p}`, 'log Π pᵢ = Σ log pᵢ ⇒ sₙ = k/p − (n−k)/(1−p)');
const GAUSS = tex(String.raw`\log \mathcal N(x\mid\mu,\sigma^2) = -\frac{(x-\mu)^2}{2\sigma^2} + c\;\Rightarrow\; s_\mu = \frac{x-\mu}{\sigma^2}`, 'log N(x | μ, σ²) = −(x−μ)²/2σ² + c ⇒ s_μ = (x−μ)/σ²');
const ZERO = tex(String.raw`\mathbb E_p[s] = p\cdot\frac{1}{p} + (1-p)\cdot\Big(-\frac{1}{1-p}\Big) = 1 - 1 = 0`, 'E_p[s] = p(1/p) + (1−p)(−1/(1−p)) = 1 − 1 = 0');
const WHY0 = tex(String.raw`\sum_x p(x\mid\theta) = 1 \;\;\text{for all } \theta\;\Rightarrow\; \sum_x \partial_\theta p(x\mid\theta) = 0 \;\Rightarrow\; \mathbb E_\theta[s] = 0`, 'Σ_x p(x|θ) = 1 for all θ ⇒ Σ_x ∂_θ p = 0 ⇒ E_θ[s] = 0');

const thetaAt = (t) => 0.5 + 0.4 * Math.sin((2 * Math.PI * t) / 16);
/** The coin whose scores are shown: 0.3, then sliding to 0.6 and back while the slopes are discussed. */
const pAt = (t) => 0.3 + 0.3 * (0.5 - 0.5 * Math.cos(2 * Math.PI * lin(t, 68, 80)));

export default defineScene({
  name: 'Likelihood and score',
  duration: 186,
  narration: [
    [0, 'Now take the ruler apart. A statistical model is a table: for every value of the parameter theta, one probability distribution over the outcomes x. Write it p of x given theta: the probability of seeing x if the coin is theta. For one flip the outcomes are heads and tails; p of heads given theta is theta, and p of tails given theta is one minus theta. Slide theta and the two probabilities change.'],
    [27, 'For a hundred flips the outcome is the number of heads, and p of k given theta is the binomial hill of the previous scene, centred at a hundred theta. One parameter value, one hill; slide theta and the hill slides.'],
    [43, 'Now turn the table around. Fix what you saw and ask how probable it was under each theta. That function of theta is the likelihood. You saw heads: the likelihood is theta itself, a straight line rising to one. You saw tails: one minus theta, falling.'],
    [60, 'Take logarithms. The log-likelihood of heads is log theta, and its slope at theta equal p is one over p: that is the score of heads, s of H at p. For tails the slope of log one minus theta is minus one over one minus p: the score of tails. H and T are nothing more than the two outcomes. A score is a slope: how fast the log-probability of what you saw changes as you move the parameter.'],
    [94, 'Why the logarithm? The slope of log p is the change of p divided by p: the relative change. That is what evidence is made of. One more percentage point of probability is a small matter when p is one half, and a doubling when p is one in a hundred. Second, independent observations multiply their probabilities, so their logarithms add, and the score of a hundred flips is simply the sum of a hundred single-flip scores: k over p minus n minus k over one minus p. Each flip votes, and the votes add up.'],
    [132, 'Third, the Gaussian. Its log-density is a parabola, minus x minus mu squared over two sigma squared, so the score in mu is x minus mu over sigma squared: the observation\'s distance from the mean, in units of the variance. The logarithm turns the bell into the parabola whose curvature is the information.'],
    [154, 'One more property. At the true coin the average score is zero. Heads pushes up by one over p, and happens with probability p; tails pushes down by one over one minus p, with probability one minus p. The two pushes cancel exactly. That is no accident: the probabilities of all outcomes sum to one for every theta, so their derivatives sum to zero. On average the data push neither way, but they do push, and how hard they push is the next scene.'],
  ],
  header: header(4, 'LIKELIHOOD AND SCORE', 'What p(x | θ) means, and how fast it changes'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    drawTable(ctx, t, on);
    if (t < 61) drawLikelihood(ctx, t);
    else drawLogLikelihood(ctx, t);
    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), 'one coin, one flip · everything on screen is computed');
  },
});

/** The table: a θ axis with a moving θ, the two outcome probabilities, and the binomial hill. */
function drawTable(ctx, t, on) {
  const theta = thetaAt(t);
  text(ctx, 'the model: one distribution over x for each θ', 110, 205, { ...type.note, alpha: on });
  axes(ctx, { ...TH, h: 0 }, { xTicks: [0, 0.25, 0.5, 0.75, 1], alpha: on });
  text(ctx, 'θ', TH.x + TH.w + 14, TH.y + 5, { font: font.display, italic: true, size: 20, color: color.muted, alpha: on });
  drawPoint(ctx, TH, [theta, 0], { colour: P_COL, alpha: on, r: 7, label: `θ = ${fmt(theta)}`, labelOffset: [-30, -18] });
  const bars = seg(t, 4, 5);
  drawOutcomeBars(ctx, { x: 560, y: 215, w: 170, h: 70, values: [theta, 1 - theta], labels: ['H', 'T'], colours: [P_COL, Q_COL], alpha: on * bars, title: 'p(x | θ) for one flip' });
  // the binomial hill of n flips
  const hill = seg(t, 28, 29);
  if (hill > 0.003) {
    axes(ctx, HILL, { xTicks: [0, 50, 100], yTicks: [], alpha: hill });
    text(ctx, 'p(k | θ) for 100 flips: the hill of scene 02, centred at 100 θ', HILL.x, HILL.y - 10, { ...type.note, size: 13, alpha: hill });
    const pmf = binomialPmfs(N, Math.min(0.98, Math.max(0.02, theta)));
    clipped(ctx, HILL, () => drawPath(ctx, HILL, pmf.map((v, k) => [k, v]), { colour: P_COL, alpha: hill, width: 2, fill: rgba(P_COL, 0.15) }));
    line(ctx, TH.X(theta), TH.y + 8, HILL.X(N * theta), HILL.y + HILL.h, { color: P_COL, width: 1, dash: [3, 4], alpha: 0.6 * hill });
  }
}

/** The likelihood of heads and of tails against θ (before the logarithm). */
function drawLikelihood(ctx, t) {
  const on = seg(t, 44, 45);
  if (on <= 0.003) return;
  axes(ctx, LIK, { xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [0, 0.5, 1], xLabel: 'θ', alpha: on, grid: true });
  caption(ctx, LIK, 'the likelihood: the data fixed, θ varying', on, { color: color.muted });
  const h = seg(t, 45, 46);
  const tl = seg(t, 52, 53);
  clipped(ctx, LIK, () => {
    drawCurve(ctx, LIK, (th) => th, { colour: P_COL, alpha: h, width: 2.4, n: 2, progress: lin(t, 45, 48) });
    drawCurve(ctx, LIK, (th) => 1 - th, { colour: Q_COL, alpha: tl, width: 2.4, n: 2, progress: lin(t, 52, 55) });
  });
  text(ctx, 'you saw heads: L(θ) = θ', LIK.X(0.62), LIK.Y(0.62) - 16, { font: font.mono, size: 15, color: P_COL, alpha: h });
  text(ctx, 'you saw tails: L(θ) = 1 − θ', LIK.X(0.62), LIK.Y(0.38) + 26, { font: font.mono, size: 15, color: Q_COL, alpha: tl });
}

/** The log-likelihoods, the coin p, the tangents and the scores. */
function drawLogLikelihood(ctx, t) {
  const on = seg(t, 61, 62);
  const p = pAt(t);
  axes(ctx, LOG, { xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [-3, -2, -1, 0], xLabel: 'θ', alpha: on, grid: true });
  caption(ctx, LOG, 'the log-likelihood of each outcome; the score is its slope at the coin p', on, { color: color.muted });
  clipped(ctx, LOG, () => {
    drawCurve(ctx, LOG, (th) => bernoulliLogLik(1, th), { colour: P_COL, alpha: on, width: 2.2, u: [EPS, 1 - EPS], n: 300 });
    drawCurve(ctx, LOG, (th) => bernoulliLogLik(0, th), { colour: Q_COL, alpha: on, width: 2.2, u: [EPS, 1 - EPS], n: 300 });
  });
  text(ctx, 'heads: log θ', LOG.X(0.97), LOG.Y(Math.log(0.97)) + 26, { font: font.mono, size: 14, color: P_COL, align: 'right', alpha: on });
  text(ctx, 'tails: log(1 − θ)', LOG.X(0.03), LOG.Y(Math.log(0.97)) + 26, { font: font.mono, size: 14, color: Q_COL, alpha: on });
  const mark = seg(t, 63, 64);
  line(ctx, LOG.X(p), LOG.y, LOG.X(p), LOG.y + LOG.h, { color: color.muted, dash: [4, 5], alpha: mark });
  text(ctx, `the coin: p = ${fmt(p)}`, LOG.X(p) + 8, LOG.y + 18, { font: font.mono, size: 14, color: color.body, alpha: mark });
  const tan = seg(t, 65, 66);
  for (const [x, tint, name] of [[1, P_COL, 'H'], [0, Q_COL, 'T']]) {
    const y0 = bernoulliLogLik(x, p);
    const s = bernoulliScore(x, p);
    const dx = 0.12;
    line(ctx, LOG.X(p - dx), LOG.Y(y0 - s * dx), LOG.X(p + dx), LOG.Y(y0 + s * dx), { color: tint, width: 1.6, alpha: tan });
    drawPoint(ctx, LOG, [p, y0], { colour: tint, alpha: mark, r: 5 });
    const yy = LOG.Y(y0) + (x ? -24 : 24);
    arrow(ctx, LOG.X(p), yy, LOG.X(p) + 16 * s, yy, { color: tint, width: 2.2, head: 9, alpha: tan });
    text(ctx, `s(${name}, p) = ${fmt(s)}`, LOG.X(p) + 16 * s + (s > 0 ? 8 : -8), yy + 5, { font: font.mono, size: 13, color: tint, align: s > 0 ? 'left' : 'right', alpha: tan });
  }
  // the relative-change reading: a step Δθ and the step in log θ
  const rel = fade(t, 96, 97, 109, 110);
  if (rel > 0.003) {
    const d = 0.1;
    const y0 = Math.log(p);
    const y1 = Math.log(p + d);
    line(ctx, LOG.X(p), LOG.Y(y0), LOG.X(p + d), LOG.Y(y0), { color: color.ink, width: 1.2, alpha: rel });
    line(ctx, LOG.X(p + d), LOG.Y(y0), LOG.X(p + d), LOG.Y(y1), { color: color.ink, width: 1.2, alpha: rel });
    text(ctx, `Δθ = ${fmt(d, 1)}`, LOG.X(p + d / 2), LOG.Y(y0) + 18, { font: font.mono, size: 12, color: color.ink, align: 'center', alpha: rel });
    text(ctx, `Δ log θ = ${fmt(y1 - y0)} ≈ Δθ/θ`, LOG.X(p + d) + 8, LOG.Y((y0 + y1) / 2) + 4, { font: font.mono, size: 12, color: color.ink, alpha: rel });
  }
  // the two pushes weighted by their probabilities, for the zero mean
  const zero = seg(t, 156, 157);
  if (zero > 0.003) {
    const y = LOG.y + LOG.h - 40;
    const sH = bernoulliScore(1, p);
    const sT = bernoulliScore(0, p);
    text(ctx, 'weighted pushes:', LOG.x + 20, y - 40, { font: font.mono, size: 13, color: color.body, alpha: zero });
    arrow(ctx, LOG.x + 180, y - 44, LOG.x + 180 + 60 * p * sH, y - 44, { color: P_COL, width: 4, head: 10, alpha: zero });
    text(ctx, `p · (1/p) = ${fmt(p * sH)}`, LOG.x + 250, y - 40, { font: font.mono, size: 13, color: P_COL, alpha: zero });
    arrow(ctx, LOG.x + 180, y - 16, LOG.x + 180 + 60 * (1 - p) * sT, y - 16, { color: Q_COL, width: 4, head: 10, alpha: zero });
    text(ctx, `(1 − p) · (−1/(1 − p)) = ${fmt((1 - p) * sT)}`, LOG.x + 250, y - 12, { font: font.mono, size: 13, color: Q_COL, alpha: zero });
    text(ctx, 'sum = 0: at the true coin the data push neither way on average', LOG.x + 20, y + 14, { font: font.mono, size: 13, color: METRIC, alpha: seg(t, 161, 162) });
  }
}

/** The right-hand column. */
function drawNotes(ctx, t) {
  MODEL.draw(ctx, R, 225, { size: 20, alpha: seg(t, 2, 3) });
  COIN.draw(ctx, R, 275, { size: 24, alpha: seg(t, 10, 11) });
  text(ctx, 'one θ, one distribution: the bars on the left', R, 310, { ...type.note, size: 13, alpha: seg(t, 12, 13) });
  BIN.draw(ctx, R, 352, { size: 21, alpha: seg(t, 29, 30) });
  LIKF.draw(ctx, R, 404, { size: 21, alpha: seg(t, 45, 46) });
  text(ctx, 'the same table, read along a row instead of down a column', R, 438, { ...type.note, size: 13, alpha: seg(t, 47, 48) });
  SCORE.draw(ctx, R, 486, { size: 23, alpha: seg(t, 62, 63) });
  SCORES.draw(ctx, R, 536, { size: 19, alpha: seg(t, 66, 67) });
  text(ctx, 'H and T: the two outcomes; the score of each is the slope of its log-likelihood', R, 570, { ...type.note, size: 13, alpha: seg(t, 70, 71) });
  // why the logarithm
  const why = seg(t, 95, 96);
  pill(ctx, 'WHY THE LOGARITHM · 1 · RELATIVE CHANGE', R, 616, METRIC, why);
  text(ctx, '∂_θ log p = ∂_θ p / p: +1 point is +2 % at p = 0.5 but +100 % at p = 0.01', R, 648, { ...type.note, size: 12, alpha: seg(t, 98, 99) });
  const add = seg(t, 110, 111);
  pill(ctx, '2 · ADDITIVITY', R, 690, METRIC, add);
  ADD.draw(ctx, R, 732, { size: 19, alpha: seg(t, 112, 113) });
  text(ctx, 'k heads and n − k tails: each flip votes, the votes add', R, 766, { ...type.note, size: 13, alpha: seg(t, 117, 118) });
  const ga = seg(t, 133, 134);
  pill(ctx, '3 · THE GAUSSIAN', R, 812, METRIC, ga);
  GAUSS.draw(ctx, R, 856, { size: 18, alpha: seg(t, 135, 136) });
  if (ga > 0.003) {
    // the bell and its logarithm, a parabola, in a small panel
    line(ctx, BELL.x, BELL.Y(0), BELL.x + BELL.w, BELL.Y(0), { color: color.line, alpha: ga });
    drawCurve(ctx, BELL, (x) => gaussianPdf(x, 0, 1), { colour: P_COL, alpha: ga, width: 2, n: 200, fill: rgba(P_COL, 0.12) });
    text(ctx, 'the bell', BELL.x, BELL.y - 8, { font: font.mono, size: 12, color: P_COL, alpha: ga });
    line(ctx, PARAB.x, PARAB.Y(0), PARAB.x + PARAB.w, PARAB.Y(0), { color: color.line, alpha: ga });
    drawCurve(ctx, PARAB, (x) => -0.5 * x * x, { colour: METRIC, alpha: ga * seg(t, 136, 137), width: 2, n: 200 });
    text(ctx, 'its log: a parabola', PARAB.x, PARAB.y - 8, { font: font.mono, size: 12, color: METRIC, alpha: ga * seg(t, 136, 137) });
  }
  // zero mean (drawn over the earlier notes once they have served)
  const z = seg(t, 155, 156);
  if (z > 0.003) {
    ctx.save();
    ctx.globalAlpha *= z;
    ctx.fillStyle = color.bg;
    ctx.fillRect(R - 10, 600, 720, 290);
    ctx.restore();
    pill(ctx, 'THE MEAN SCORE IS ZERO AT THE TRUTH', R, 616, KL_COL, z);
    ZERO.draw(ctx, R, 664, { size: 21, alpha: seg(t, 158, 159) });
    WHY0.draw(ctx, R, 722, { size: 18, alpha: seg(t, 168, 169) });
    text(ctx, 'the derivatives of the probabilities sum to zero, so the mean score does too', R, 758, { ...type.note, size: 13, alpha: seg(t, 171, 172) });
    text(ctx, 'next: the data push neither way on average, but how hard do they push?', R, 820, { ...type.body, size: 20, color: METRIC, alpha: seg(t, 179, 180) });
  }
}
