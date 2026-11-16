import { defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, tex, line, dot } from '../../../kit.js';
import { header, frame, axes, drawPath, drawCurve, clipped, legend, readout, track, caption, KL, INFO, MODEL, DATA } from '../shared.js';
import { TWO_BASINS, WRONG_MODEL, mixturePdf, flowKl, scoreGap, linspace } from '../math.js';

const IDENTITY = tex(String.raw`\mathrm{KL}(p_0\|q_0) - \mathrm{KL}(p_T\|q_T) = \int_0^T \mathbb E_{p_t}\big\|\nabla\log p_t - \nabla\log q_t\big\|_{W_t}^2\,dt`, 'KL(p₀‖q₀) − KL(p_T‖q_T) = ∫₀ᵀ E_{p_t} ‖∇log p_t − ∇log q_t‖²_{W_t} dt');
const DIFFUSION = tex(String.raw`dX = b_t(X)\,dt + \sqrt{2\,W_t(X)}\,dB`, 'dX = b_t(X) dt + √(2 W_t(X)) dB');

const T_END = 0.6;
const STEPS = 60;
const XS = linspace(-9, 10, 1901);
const TIMES = Array.from({ length: STEPS + 1 }, (_, i) => (T_END * i) / STEPS);
const KLS = TIMES.map((t) => flowKl(TWO_BASINS, WRONG_MODEL, t, XS));
const GAPS = TIMES.map((t) => scoreGap(TWO_BASINS, WRONG_MODEL, t, XS));
const INTEGRAL = [0];
for (let i = 1; i <= STEPS; i++) INTEGRAL[i] = INTEGRAL[i - 1] + ((GAPS[i - 1] + GAPS[i]) / 2) * (T_END / STEPS);
const at = (arr, time) => {
  const x = (time / T_END) * STEPS;
  const i = Math.min(STEPS - 1, Math.floor(x));
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};

const DENSITIES = frame({ x: 100, y: 236, w: 640, h: 360, u: [-3, 4], v: [0, 0.85] });
const KLPLOT = frame({ x: 880, y: 236, w: 620, h: 220, u: [0, T_END], v: [0, Math.max(...KLS) * 1.15] });
const GAPPLOT = frame({ x: 880, y: 540, w: 620, h: 130, u: [0, T_END], v: [0, Math.max(...GAPS) * 1.15] });

export default defineScene({
  name: 'Why the loss norm is the noise covariance',
  duration: 70,
  narration: [
    [0, 'One more identity ties the loss to the noise. Evolve the data and the model by the same diffusion with mobility W. Then the drop in Kullback–Leibler divergence from time zero to T equals the integral of the score error measured in W.'],
    [24, 'Here are two densities on a line, flowing together. The divergence between them falls, and the running integral of the score error matches the drop exactly.'],
    [42, 'So the error norm should match the noising covariance, and what is left at time T, the terminal mismatch, matters. The identity holds for any smooth densities. It does not extend asymptotic efficiency to neural scores, finite noise floors or finite training budgets.'],
  ],
  header: header(9, 'THE FLOW IDENTITY', 'Why the loss norm is the noise covariance'),

  draw(ctx, t) {
    const time = track(t, [[24, 0], [58, T_END]], (x) => x);
    const a = seg(t, 0.4, 1.6);
    DIFFUSION.draw(ctx, 880, 196, { size: 22, alpha: a });
    axes(ctx, DENSITIES, { xTicks: [-2, 0, 2, 4], yTicks: [0, 0.4, 0.8], xLabel: 'x', alpha: a });
    drawCurve(ctx, DENSITIES, (x) => mixturePdf(x, TWO_BASINS, 2 * time), { colour: color.ink, alpha: a, width: 2.5, fill: rgba(DATA, 0.18), n: 300 });
    drawCurve(ctx, DENSITIES, (x) => mixturePdf(x, WRONG_MODEL, 2 * time), { colour: MODEL, alpha: a * seg(t, 3, 4), width: 2.5, n: 300 });
    legend(ctx, DENSITIES.x + 14, DENSITIES.y + 24, [{ name: 'data p_t', colour: color.ink }, { name: 'model q_t', colour: MODEL }], { alpha: a });
    readout(ctx, 't =', time.toFixed(2), DENSITIES.x + DENSITIES.w - 12, DENSITIES.y + 24, { colour: color.gold, size: 16, alpha: seg(t, 24, 25), align: 'right' });
    caption(ctx, DENSITIES, 'both flow under ∂_t p = ∇·(W ∇p), W = 1', a);

    const plots = seg(t, 5, 6.5);
    axes(ctx, KLPLOT, { xTicks: [0, 0.2, 0.4, 0.6], yTicks: [0, 0.2, 0.4], xLabel: 't', yLabel: 'KL', alpha: plots });
    const upTo = Math.max(1, Math.round((time / T_END) * STEPS));
    drawPath(ctx, KLPLOT, TIMES.map((s, i) => [s, KLS[i]]), { colour: KL, alpha: plots, width: 3.5, progress: time / T_END + 1e-6 });
    drawPath(ctx, KLPLOT, TIMES.map((s, i) => [s, KLS[0] - INTEGRAL[i]]), { colour: INFO, alpha: plots * seg(t, 26, 27), width: 2.5, dash: [8, 7], progress: time / T_END + 1e-6 });
    legend(ctx, KLPLOT.x + 14, KLPLOT.y + 24, [{ name: 'KL(p_t ‖ q_t)', colour: KL }, { name: 'KL(p₀ ‖ q₀) − ∫₀ᵗ score error', colour: INFO, dash: [8, 7] }], { alpha: plots, vertical: true, gap: 24 });
    dot(ctx, KLPLOT.X(time), KLPLOT.Y(at(KLS, time)), 6, KL, plots * seg(t, 24, 25));

    axes(ctx, GAPPLOT, { xTicks: [0, 0.2, 0.4, 0.6], yTicks: [0, Math.round(Math.max(...GAPS) * 10) / 10], xLabel: 't', alpha: plots });
    caption(ctx, GAPPLOT, 'score error E_{p_t} ‖s_p − s_q‖²_W', plots, { color: INFO });
    drawPath(ctx, GAPPLOT, TIMES.map((s, i) => [s, GAPS[i]]), { colour: INFO, alpha: plots, width: 2.5 });
    const filled = TIMES.slice(0, upTo + 1).map((s, i) => [s, GAPS[i]]);
    filled.push([TIMES[upTo], 0], [0, 0]);
    drawPath(ctx, GAPPLOT, filled, { colour: rgba(INFO, 0), alpha: plots * seg(t, 24, 25), width: 0.1, fill: rgba(INFO, 0.25), close: true });
    text(ctx, 'the running integral, shaded', GAPPLOT.x + GAPPLOT.w - 10, GAPPLOT.y + 20, { font: font.mono, size: 13, color: INFO, align: 'right', alpha: plots * seg(t, 24, 25) });

    const numbers = seg(t, 30, 31);
    readout(ctx, 'drop in KL so far', KLS[0] - at(KLS, time), 880, 720, { colour: KL, digits: 4, size: 17, alpha: numbers });
    readout(ctx, 'integrated score error', at(INTEGRAL, time), 880, 748, { colour: INFO, digits: 4, size: 17, alpha: numbers });
    readout(ctx, 'terminal mismatch KL(p_T ‖ q_T)', KLS[STEPS], 880, 776, { colour: color.gold, digits: 4, size: 17, alpha: seg(t, 44, 45) });

    IDENTITY.draw(ctx, 100, 680, { size: 21, alpha: seg(t, 8, 9.2) });
    wrap(ctx, 'a population identity for any smooth densities, with no reversibility needed. It explains the norm of the loss and the cost of the terminal mismatch; it does not carry asymptotic efficiency over to neural scores, noise floors or finite budgets.', 100, 740, 640, 24, { ...type.body, size: 16, color: color.body, alpha: seg(t, 48, 49.5) });
  },
});
