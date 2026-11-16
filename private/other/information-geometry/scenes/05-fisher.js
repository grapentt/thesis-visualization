// Scene 05: the Fisher information, three forms built up slowly for the coin p₀ = 0.3. First the
// variance of the score, with the two squared pushes stacked; n flips carry n times the information.
// Second the expected log-likelihood ℓ̄(θ) = Σ_x p(x | p₀) log p(x | θ), constructed point by point as
// a weighted average of the two curves, peaking at the truth with curvature −g, and the derivation of
// why curvature equals variance. Third the KL divergence as the flipped curve, with its parabola.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, dot, rgba, roundRect } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, KL_COL, header, frame, axes, drawCurve, drawPoint, readout, exampleStamp, fmt, caption, pill, clipped } from '../shared.js';
import { bernoulliFisher, bernoulliLogLik, bernoulliScore, klBernoulli } from '../math.js';

const L = frame({ x: 110, y: 215, w: 620, h: 300, u: [0, 1], v: [-3.2, 0.2] });
const K = frame({ x: 110, y: 640, w: 620, h: 180, u: [0, 1], v: [0, 1.2] });
const R = 850;
const EPS = 0.02;
const P0 = 0.3;
const G0 = bernoulliFisher(P0);

const FORM1 = tex(String.raw`g(\theta) = \mathbb{E}_\theta\big[s(x,\theta)^2\big] = \operatorname{Var}_\theta[s]`, 'g(θ) = E_θ[s²] = Var_θ[s]');
const COIN_G = tex(String.raw`g(p) = p\cdot\Big(\frac{1}{p}\Big)^{2} + (1-p)\cdot\Big(\frac{1}{1-p}\Big)^{2} = \frac{1}{p} + \frac{1}{1-p} = \frac{1}{p(1-p)}`, 'g(p) = p(1/p)² + (1−p)(1/(1−p))² = 1/p + 1/(1−p) = 1/(p(1−p))');
const ADD = tex(String.raw`s_n = \sum_{i=1}^{n} s(x_i,\theta)\;\Rightarrow\; \operatorname{Var}[s_n] = n\,g(\theta)`, 'sₙ = Σ s(xᵢ, θ) ⇒ Var[sₙ] = n g(θ)');
const EXPECTED = tex(String.raw`\bar\ell(\theta) = \sum_x p(x\mid p_0)\,\log p(x\mid\theta) = p_0\log\theta + (1-p_0)\log(1-\theta)`, 'ℓ̄(θ) = Σ_x p(x|p₀) log p(x|θ) = p₀ log θ + (1−p₀) log(1−θ)');
const FORM2 = tex(String.raw`g(p_0) = -\,\bar\ell\,''(p_0) = -\,\mathbb{E}_{p_0}\!\left[\frac{\partial^2}{\partial\theta^2}\log p(x\mid\theta)\right]_{\theta = p_0}`, 'g(p₀) = −ℓ̄″(p₀) = −E[∂²_θ log p]');
const DERIV1 = tex(String.raw`\sum_x p(x\mid\theta)\, s(x,\theta) = 0 \quad\text{for all } \theta`, 'Σ_x p(x|θ) s(x, θ) = 0 for all θ');
const DERIV2 = tex(String.raw`\frac{\partial}{\partial\theta}:\quad \sum_x \partial_\theta p \cdot s + \sum_x p\cdot \partial_\theta s = 0,\qquad \partial_\theta p = p\, s`, '∂_θ: Σ ∂p·s + Σ p·∂s = 0, with ∂p = p s');
const DERIV3 = tex(String.raw`\Rightarrow\quad \mathbb{E}[s^2] + \mathbb{E}[\partial_\theta s] = 0\quad\Rightarrow\quad \operatorname{Var}[s] = -\,\mathbb{E}\big[\partial_\theta^2 \log p\big]`, '⇒ E[s²] + E[∂s] = 0 ⇒ Var[s] = −E[∂² log p]');
const FORM3 = tex(String.raw`\mathrm{KL}(p_0\,\|\,\theta) = \bar\ell(p_0) - \bar\ell(\theta) = \mathbb{E}_{p_0}\!\left[\log\frac{p(x\mid p_0)}{p(x\mid\theta)}\right] = \tfrac{1}{2}\,g(p_0)\,(\theta-p_0)^2 + O\big((\theta - p_0)^3\big)`, 'KL(p₀ ‖ θ) = ℓ̄(p₀) − ℓ̄(θ) = E[log p(x|p₀)/p(x|θ)] = ½ g (θ−p₀)² + …');
const FDIV = tex(String.raw`D_f(p_\theta \,\|\, p_{\theta+\delta}) = \tfrac{1}{2} f''(1)\, g(\theta)\,\delta^2 + O(\delta^3)`, 'D_f(p_θ ‖ p_{θ+δ}) = ½ f″(1) g δ² + O(δ³)');

/** The expected log-likelihood under p₀ of the coin θ. */
const expected = (p0, th) => p0 * Math.log(th) + (1 - p0) * Math.log(1 - th);
/** The construction sweep: θ from 0.04 to 0.96 over 58–76 s. */
const sweepTheta = (t) => 0.04 + 0.92 * lin(t, 66, 84);

export default defineScene({
  name: 'The Fisher information',
  duration: 184,
  narration: [
    [0, 'The score of one observation pushes theta up or down, and at the true coin the pushes average to zero. The Fisher information measures how hard they push: the mean of the squared score, which is its variance. Take the coin p equal point three. Heads contributes one over p squared, with probability p; tails one over one minus p squared, with probability one minus p. Add the two: one over p plus one over one minus p, which is one over p times one minus p. Four point seven six here, four at p equal one half, fifty-one at p equal point oh two.'],
    [35, 'Scores of independent flips add, and the variance of a sum of independent terms is the sum of the variances, so a hundred flips carry a hundred times the information of one. That is the root n g of the earlier scene: the information of n flips is n times g, and the number of standard deviations in a step is its square root times delta p.'],
    [64, 'Second form. Fix the true coin, p zero equal point three, and ask how good each candidate theta is on average. For each theta take the log-likelihood of heads and of tails, weight them by the true probabilities, point three and point seven, and average. As theta sweeps across, the weighted average traces the lavender curve: the expected log-likelihood.'],
    [89, 'The curve peaks at the truth: on average no other coin explains the data better than the true one. Its slope at the peak is the mean score, zero. Its curvature at the peak is minus the Fisher information. Here is why. The mean score is zero for every theta; differentiate that statement with respect to theta. Two terms appear: the derivative of the probabilities times the score, which is the squared score, and the probabilities times the derivative of the score. Their sum is zero, so the variance of the score equals minus the expected second derivative of the log-likelihood. A sharp peak pins the parameter down; a flat one leaves it loose.'],
    [129, 'Third form. Flip the curve. The gap between the expected log-likelihood at the truth and at theta is the Kullback–Leibler divergence from p zero to theta: the average log-likelihood ratio per observation, how much better the truth explains its own data than theta does. It is zero at the truth, flat there, and rises like one half g times theta minus p zero squared. The Fisher information is the curvature of KL at coincidence, and every f-divergence shares it up to a constant.'],
    [158, 'Three forms of one quantity: the variance of the score, the expected curvature of the log-likelihood, and the quadratic part of KL. All three were computed in the coordinate p. Change coordinates, to the log-odds say, and the score changes like a slope does, so the variance changes by the square of the conversion factor. What does not change is the length of a path measured with it, and that is the next scene.'],
  ],
  header: header(5, 'THE FISHER INFORMATION', 'How hard the data push: three forms of one quantity'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    axes(ctx, L, { xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [-3, -2, -1, 0], xLabel: 'θ', alpha: on, grid: true });
    caption(ctx, L, t < 64 ? 'the log-likelihoods of heads and tails, and the coin p₀ = 0.3' : 'the expected log-likelihood ℓ̄(θ): the weighted average of the two curves', on, { color: color.muted });
    clipped(ctx, L, () => {
      drawCurve(ctx, L, (th) => bernoulliLogLik(1, th), { colour: P_COL, alpha: on, width: 2, u: [EPS, 1 - EPS], n: 300 });
      drawCurve(ctx, L, (th) => bernoulliLogLik(0, th), { colour: Q_COL, alpha: on, width: 2, u: [EPS, 1 - EPS], n: 300 });
    });
    text(ctx, 'heads: log θ', L.X(0.97), L.Y(Math.log(0.97)) + 26, { font: font.mono, size: 13, color: P_COL, align: 'right', alpha: on });
    text(ctx, 'tails: log(1 − θ)', L.X(0.03), L.Y(Math.log(0.97)) + 26, { font: font.mono, size: 13, color: Q_COL, alpha: on });
    line(ctx, L.X(P0), L.y, L.X(P0), L.y + L.h, { color: color.muted, dash: [4, 5], alpha: on });
    text(ctx, `p₀ = ${P0}`, L.X(P0) + 8, L.y + 18, { font: font.mono, size: 14, color: color.body, alpha: on });

    // the two pushes at p₀ (recap of the score), while form 1 is discussed
    const tan = fade(t, 2, 3, 55, 64);
    for (const [x, tint] of [[1, P_COL], [0, Q_COL]]) {
      const y0 = bernoulliLogLik(x, P0);
      const s = bernoulliScore(x, P0);
      drawPoint(ctx, L, [P0, y0], { colour: tint, alpha: tan, r: 5 });
      const yy = L.Y(y0) + (x ? -22 : 22);
      arrow(ctx, L.X(P0), yy, L.X(P0) + 14 * s, yy, { color: tint, width: 2.2, head: 9, alpha: tan });
      text(ctx, `s = ${fmt(s)}`, L.X(P0) + 14 * s + (s > 0 ? 8 : -8), yy + 5, { font: font.mono, size: 13, color: tint, align: s > 0 ? 'left' : 'right', alpha: tan });
    }

    drawConstruction(ctx, t);
    drawKL(ctx, t);
    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `the coin p₀ = ${P0} · everything on screen is computed`);
  },
});

/** Form 2: the expected log-likelihood, built point by point as a weighted average. */
function drawConstruction(ctx, t) {
  const on = seg(t, 65, 66);
  if (on <= 0.003) return;
  const theta = sweepTheta(t);
  const sweeping = t < 84;
  // the trail: the curve up to the current θ (the whole curve after the sweep)
  clipped(ctx, L, () => {
    drawCurve(ctx, L, (th) => expected(P0, th), { colour: METRIC, alpha: on, width: 2.6, u: [0.04, sweeping ? Math.max(0.041, theta) : 0.96], n: 300 });
    const par = seg(t, 100, 101);
    drawCurve(ctx, L, (th) => expected(P0, P0) - 0.5 * G0 * (th - P0) ** 2, { colour: color.ink, alpha: 0.85 * par, width: 1.5, dash: [5, 5], u: [P0 - 0.26, P0 + 0.26], n: 80 });
  });
  if (sweeping) {
    // the lever: the two values at θ and their weighted average
    const yH = Math.log(theta);
    const yT = Math.log(1 - theta);
    const yAvg = expected(P0, theta);
    line(ctx, L.X(theta), L.Y(Math.max(yH, -3.2)), L.X(theta), L.Y(Math.max(yT, -3.2)), { color: color.ink, width: 1.2, alpha: 0.8 * on });
    drawPoint(ctx, L, [theta, Math.max(yH, -3.2)], { colour: P_COL, alpha: on, r: 5 });
    drawPoint(ctx, L, [theta, Math.max(yT, -3.2)], { colour: Q_COL, alpha: on, r: 5 });
    drawPoint(ctx, L, [theta, yAvg], { colour: METRIC, alpha: on, r: 7, halo: 1 });
    text(ctx, `θ = ${fmt(theta)}:  ${P0} · log θ + ${fmt(1 - P0, 1)} · log(1 − θ) = ${fmt(yAvg)}`, L.x + 16, L.y + L.h - 14, { font: font.mono, size: 13, color: METRIC, alpha: on });
    // the weights as two small bars
    const bx = L.x + 290;
    const by = L.y + 22;
    text(ctx, 'weights p(x | p₀):', bx, by - 8, { font: font.mono, size: 12, color: color.muted, alpha: on });
    for (const [i, w, tint, label] of [[0, P0, P_COL, 'H'], [1, 1 - P0, Q_COL, 'T']]) {
      const yy = by + 6 + i * 20;
      ctx.save();
      ctx.globalAlpha *= on;
      ctx.fillStyle = rgba(tint, 0.7);
      roundRect(ctx, bx + 20, yy, 100 * w, 12, 3);
      ctx.fill();
      ctx.restore();
      text(ctx, label, bx, yy + 11, { font: font.mono, size: 12, color: tint, alpha: on });
      text(ctx, fmt(w, 1), bx + 26 + 100 * w, yy + 11, { font: font.mono, size: 12, color: tint, alpha: on });
    }
  } else {
    const peak = seg(t, 90, 91);
    drawPoint(ctx, L, [P0, expected(P0, P0)], { colour: METRIC, alpha: peak, r: 7, halo: 1 });
    text(ctx, 'peak at θ = p₀: no other coin does better on average', L.X(P0) + 12, L.Y(expected(P0, P0)) - 12, { font: font.mono, size: 13, color: METRIC, alpha: peak });
    const flat = seg(t, 94, 95);
    line(ctx, L.X(P0 - 0.14), L.Y(expected(P0, P0)), L.X(P0 + 0.14), L.Y(expected(P0, P0)), { color: METRIC, width: 1.5, dash: [3, 4], alpha: flat });
    text(ctx, 'slope 0 = the mean score', L.X(P0 + 0.15), L.Y(expected(P0, P0)) + 24, { font: font.mono, size: 12, color: METRIC, alpha: flat });
    text(ctx, `dashed: ℓ̄(p₀) − ½ g(p₀)(θ − p₀)², g(p₀) = ${fmt(G0)}: the curvature at the peak`, L.x + 16, L.y + L.h - 14, { font: font.mono, size: 13, color: color.ink, alpha: seg(t, 100, 101) });
  }
}

/** Form 3: KL(p₀ ‖ θ) against θ, the flipped curve, with its parabola. */
function drawKL(ctx, t) {
  const on = seg(t, 130, 131);
  if (on <= 0.003) return;
  axes(ctx, K, { xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [0, 0.5, 1], xLabel: 'θ', alpha: on, grid: true });
  caption(ctx, K, 'KL(p₀ ‖ θ) = ℓ̄(p₀) − ℓ̄(θ): the lavender curve flipped, with its parabola', on, { color: color.muted });
  clipped(ctx, K, () => {
    drawCurve(ctx, K, (th) => klBernoulli(P0, th), { colour: KL_COL, alpha: on, width: 2.4, u: [EPS, 1 - EPS], n: 300, progress: lin(t, 131, 136) });
    drawCurve(ctx, K, (th) => 0.5 * G0 * (th - P0) ** 2, { colour: color.ink, alpha: 0.85 * on * seg(t, 142, 143), width: 1.4, dash: [5, 5], u: [P0 - 0.3, P0 + 0.3], n: 80 });
  });
  line(ctx, K.X(P0), K.y, K.X(P0), K.y + K.h, { color: color.muted, dash: [4, 5], alpha: on });
  drawPoint(ctx, K, [P0, 0], { colour: KL_COL, alpha: on, r: 5 });
  text(ctx, 'zero and flat at the truth', K.X(P0) + 10, K.Y(0) - 10, { font: font.mono, size: 12, color: KL_COL, alpha: seg(t, 137, 138) });
}

/** The right-hand column: the three forms, timed to the narration. */
function drawNotes(ctx, t) {
  const f1 = seg(t, 3, 4);
  pill(ctx, 'FIRST FORM · THE VARIANCE OF THE SCORE', R, 215, METRIC, f1);
  FORM1.draw(ctx, R, 258, { size: 22, alpha: f1 });
  text(ctx, 'the mean squared push of one observation', R, 292, { ...type.note, size: 13, alpha: seg(t, 5, 6) });
  // the two squared pushes, stacked
  const stack = seg(t, 9, 10);
  if (stack > 0.003) {
    const parts = [
      { w: P0, s2: bernoulliScore(1, P0) ** 2, tint: P_COL, label: `p · (1/p)² = 1/p = ${fmt(1 / P0)}`, at: 10 },
      { w: 1 - P0, s2: bernoulliScore(0, P0) ** 2, tint: Q_COL, label: `(1 − p) · (1/(1 − p))² = 1/(1 − p) = ${fmt(1 / (1 - P0))}`, at: 15 },
    ];
    let x = R;
    const y = 330;
    const scale = 70; // px per unit of g
    parts.forEach((part) => {
      const a = seg(t, part.at, part.at + 1);
      const w = part.w * part.s2 * scale;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = rgba(part.tint, 0.7);
      roundRect(ctx, x, y - 12, w, 22, 4);
      ctx.fill();
      ctx.restore();
      text(ctx, part.label, x, y + 36 + (part.tint === Q_COL ? 22 : 0), { font: font.mono, size: 13, color: part.tint, alpha: a });
      x += w;
    });
    text(ctx, `sum = ${fmt(G0)} = 1/(p(1 − p))`, x + 12, y + 5, { font: font.mono, size: 14, color: METRIC, alpha: seg(t, 20, 21) });
  }
  COIN_G.draw(ctx, R, 420, { size: 19, alpha: seg(t, 22, 23) });
  readout(ctx, 'g(0.30) =', G0, R, 460, { colour: METRIC, alpha: seg(t, 26, 27), digits: 2 });
  readout(ctx, 'g(0.50) =', bernoulliFisher(0.5), R + 180, 460, { colour: P_COL, alpha: seg(t, 28, 29), digits: 0 });
  readout(ctx, 'g(0.02) =', bernoulliFisher(0.02), R + 340, 460, { colour: Q_COL, alpha: seg(t, 30, 31), digits: 0 });
  // additivity
  const add = fade(t, 36, 37, 64, 65);
  ADD.draw(ctx, R, 520, { size: 21, alpha: add });
  text(ctx, 'independent flips: scores add, variances add; n flips carry n g, and a step is √(n g) Δp standard deviations', R, 556, { ...type.note, size: 13, alpha: fade(t, 42, 43, 64, 65) });
  // form 2
  const f2 = seg(t, 65, 66);
  if (f2 > 0.003) {
    ctx.save();
    ctx.globalAlpha *= f2;
    ctx.fillStyle = color.bg;
    ctx.fillRect(R - 10, 496, 720, 400);
    ctx.restore();
  }
  pill(ctx, 'SECOND FORM · THE EXPECTED CURVATURE', R, 520, METRIC, f2);
  EXPECTED.draw(ctx, R, 564, { size: 19, alpha: seg(t, 68, 69) });
  text(ctx, 'for each θ: the average log-likelihood under the true coin, a weighted average of the two curves', R, 598, { ...type.note, size: 12, alpha: seg(t, 71, 72) });
  FORM2.draw(ctx, R, 646, { size: 20, alpha: seg(t, 97, 98) });
  const d = seg(t, 104, 105);
  text(ctx, 'WHY CURVATURE = VARIANCE', R, 690, { ...type.eyebrow, size: 12, alpha: d });
  DERIV1.draw(ctx, R, 716, { size: 18, alpha: d });
  DERIV2.draw(ctx, R, 752, { size: 18, alpha: seg(t, 110, 111) });
  DERIV3.draw(ctx, R, 790, { size: 18, alpha: seg(t, 116, 117) });
  text(ctx, 'sharp peak: much information · flat peak: little', R, 826, { ...type.note, size: 13, alpha: seg(t, 123, 124) });
  // form 3 replaces the derivation
  const f3 = seg(t, 129, 130);
  if (f3 > 0.003) {
    ctx.save();
    ctx.globalAlpha *= f3;
    ctx.fillStyle = color.bg;
    ctx.fillRect(R - 10, 620, 720, 280);
    ctx.restore();
  }
  pill(ctx, 'THIRD FORM · THE QUADRATIC PART OF KL', R, 650, KL_COL, f3);
  FORM3.draw(ctx, R, 700, { size: 17, alpha: seg(t, 133, 134) });
  text(ctx, 'the average log-likelihood ratio per observation: how much better the truth explains its data', R, 738, { ...type.note, size: 12, alpha: seg(t, 138, 139) });
  FDIV.draw(ctx, R, 782, { size: 18, alpha: seg(t, 150, 151) });
  text(ctx, 'KL: f″(1) = 1 · χ²: 2 · squared Hellinger: ¼ · Jensen–Shannon: ¼', R, 814, { ...type.note, size: 13, alpha: seg(t, 152, 153) });
  // closing
  const c = seg(t, 159, 160);
  if (c > 0.003) {
    ctx.save();
    ctx.globalAlpha *= c;
    ctx.fillStyle = color.bg;
    ctx.fillRect(R - 10, 620, 770, 280);
    ctx.restore();
    text(ctx, 'THREE FORMS', R, 650, { ...type.eyebrow, size: 12, alpha: c });
    text(ctx, '1 · Var[s] = E[s²]', R, 684, { font: font.mono, size: 16, color: METRIC, alpha: seg(t, 160, 161) });
    text(ctx, '2 · −E[∂²_θ log p]  (the curvature of ℓ̄ at its peak)', R, 712, { font: font.mono, size: 16, color: METRIC, alpha: seg(t, 162, 163) });
    text(ctx, '3 · the coefficient of ½ δ² in KL(p_θ ‖ p_{θ+δ})', R, 740, { font: font.mono, size: 16, color: KL_COL, alpha: seg(t, 164, 165) });
    wrap(ctx, 'All in the coordinate p. In the log-odds x the score becomes s · dp/dx (a slope converts like a slope) and g becomes g · (dp/dx)². Both depend on the coordinates; the length of a path does not.', R, 790, 700, 24, { ...type.note, size: 14, color: color.body, alpha: seg(t, 170, 171) });
  }
}
