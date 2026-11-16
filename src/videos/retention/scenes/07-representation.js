import { defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, tex, line, roundRect } from '../../../kit.js';
import { header, frame, axes, drawPath, clipped, legend, panel, caption, INFO, MODEL, KL, DATA } from '../shared.js';
import { closureTable, LINE } from '../math.js';

const OPERATOR = tex(String.raw`L_W f = \frac1p\,\nabla\!\cdot\!\big(p\,W\,\nabla f\big)`, 'L_W f = (1/p) ∇·(p W ∇f)');
const RESIDUAL = tex(String.raw`r = L_W u + G\,\mathcal I^{-1}u\ \perp\ u,\qquad G = \mathbb E\big[(Du)\,W\,(Du)^{\top}\big]`, 'r = L_W u + G I⁻¹ u ⊥ u,   G = E[(Du) W (Du)ᵀ]');
const VARIANCE = tex(String.raw`\Gamma_{\mathrm{SM}} = \mathcal I^{-1} + G^{-1}\,\mathbb E[rr^{\top}]\,G^{-1}`, 'Γ_SM = I⁻¹ + G⁻¹ E[rrᵀ] G⁻¹');
const CONDITION = tex(String.raw`\Gamma_{\mathrm{SM}} = \Gamma_{\mathrm{MLE}}\iff L_W u \in \mathrm{span}(u)`, 'Γ_SM = Γ_MLE  ⇔  L_W u ∈ span(u)');
const MAP = tex(String.raw`z = \varphi(x) = \Phi^{-1}\big(F(x)\big),\qquad W = 1/\varphi'(x)^2`, 'z = φ(x) = Φ⁻¹(F(x)),   W = 1/φ′(x)²');
const CLOSED = tex(String.raw`L_W\varphi = -\varphi`, 'L_W φ = −φ');

const TABLE = closureTable();
const { xs, p, z, mobility, h } = LINE;
const every = (arr, step = 7) => Array.from({ length: Math.floor(arr.length / step) }, (_, i) => arr[i * step]);
const XS = every(xs);
const pts = (values) => XS.map((x, i) => [x, values[i * 7]]);
const CASE_A = TABLE.x.flat;
const CASE_B = TABLE.z.warped;
const SCALE_A = 10; // the density, drawn to the score's scale
const PLOT_A = frame({ x: 100, y: 236, w: 660, h: 290, u: [-2.4, 3.4], v: [-12, 12] });
const PLOT_B = frame({ x: 100, y: 236, w: 660, h: 290, u: [-2.4, 3.4], v: [-4, 4] });
const PHI_PLOT = frame({ x: 100, y: 610, w: 660, h: 200, u: [-2.4, 3.4], v: [-3.2, 3.2] });
const W_PLOT = frame({ x: 880, y: 700, w: 620, h: 120, u: [-2.4, 3.4], v: [-1, 7] });
const ratioLabel = (ratio) => (ratio > 1000 ? `${(ratio / 10 ** Math.floor(Math.log10(ratio))).toFixed(0)} × 10${'⁰¹²³⁴⁵⁶⁷⁸⁹'[Math.floor(Math.log10(ratio))]}` : ratio.toFixed(2));

export default defineScene({
  name: 'What the model must learn',
  duration: 120,
  narration: [
    [0, 'The second criterion is representation. Score matching estimates the same parameters as maximum likelihood, but with more variance unless a condition holds. Write u for the family’s score functions and L W for the reversible diffusion operator with mobility W.'],
    [24, 'Integration by parts gives a residual: L W applied to u, plus G I inverse u, is orthogonal to u. The excess variance of score matching is this residual’s covariance, sandwiched by G inverse. Score matching is efficient exactly when L W maps u into its own span.'],
    [50, 'On a line with two basins and the model’s score u equal to x, the operator produces the wiggly log-density slope. Its projection onto u leaves a residual, and the variance ratio is sixteen.'],
    [70, 'Now Gaussianise: z equals phi of x, with phi the inverse normal of the distribution function, and take mobility W equal to one over phi prime squared. Then L W phi equals minus phi exactly, and with u equal to phi the residual vanishes. Map, mobility and model functions close together.'],
    [96, 'Notice what that mobility does: it is largest in the barrier, where the density is low, so crossing it becomes cheap. Adding a large basin-distinguishing metric to the noise would do the opposite. And equal rates are not required: eigenfunctions with different eigenvalues are still efficient.'],
  ],
  header: header(7, 'REPRESENTATION', 'When score matching is as efficient as likelihood'),

  draw(ctx, t) {
    const path = (F, points, options) => clipped(ctx, F, () => drawPath(ctx, F, points, options), 2);
    OPERATOR.draw(ctx, 880, 250, { size: 24, alpha: seg(t, 12, 13.2) });
    RESIDUAL.draw(ctx, 880, 310, { size: 20, alpha: seg(t, 25, 26.2) });
    VARIANCE.draw(ctx, 880, 365, { size: 22, alpha: seg(t, 34, 35.2) });
    CONDITION.draw(ctx, 880, 420, { size: 22, alpha: seg(t, 42, 43.2) });

    // case A: u = x under flat mobility, on two basins
    const showA = fade(t, 50, 51.5, 70, 72);
    const showB = seg(t, 72, 73.5);
    for (const [F, show, c, name] of [[PLOT_A, showA, CASE_A, 'u = x, W = 1'], [PLOT_B, showB, CASE_B, 'u = φ(x), W = 1/φ′²']]) {
      if (show <= 0.003) continue;
      const scale = F === PLOT_A ? SCALE_A : 3;
      axes(ctx, F, { xTicks: [-2, -1, 0, 1, 2, 3], yTicks: F === PLOT_A ? [-10, 0, 10] : [-4, 0, 4], alpha: show });
      path(F, pts(Float64Array.from(p, (v) => v * scale)), { colour: rgba(DATA, 0.5), alpha: show, width: 1.5, fill: rgba(DATA, 0.12) });
      path(F, pts(c.uc), { colour: MODEL, alpha: show, width: 3 });
      path(F, pts(c.Lu), { colour: INFO, alpha: show * seg(t, F === PLOT_A ? 54 : 76, F === PLOT_A ? 55 : 77), width: 3 });
      path(F, pts(Float64Array.from(c.uc, (v) => (-c.G / c.I) * v)), { colour: INFO, alpha: show * seg(t, F === PLOT_A ? 58 : 80, F === PLOT_A ? 59 : 81), width: 2, dash: [7, 6] });
      path(F, pts(c.r), { colour: KL, alpha: show * seg(t, F === PLOT_A ? 61 : 83, F === PLOT_A ? 62 : 84), width: 3 });
      caption(ctx, F, name, show, { color: color.ink, size: 17 });
      legend(ctx, 100, 200, [{ name: 'p (scaled)', colour: rgba(DATA, 0.7) }, { name: 'u', colour: MODEL }, { name: 'L_W u', colour: INFO }, { name: '−G I⁻¹ u', colour: INFO, dash: [7, 6] }, { name: 'residual r', colour: KL }], { alpha: show, size: 13, gap: 18 });
      text(ctx, `Γ_SM / Γ_MLE = ${ratioLabel(c.ratio)}`, F.x + F.w - 12, F.y + F.h - 14, { font: font.mono, size: 16, color: KL, align: 'right', alpha: show * seg(t, F === PLOT_A ? 63 : 85, F === PLOT_A ? 64 : 86) });
    }

    // the table of the four combinations
    const table = seg(t, 86, 87.5);
    panel(ctx, 880, 470, 620, 210, { alpha: table });
    text(ctx, 'variance ratio Γ_SM / Γ_MLE, two basins', 900, 500, { font: font.mono, size: 14, color: color.muted, alpha: table });
    text(ctx, 'W = 1', 1200, 530, { font: font.mono, size: 15, color: color.body, align: 'center', alpha: table });
    text(ctx, 'W = 1/φ′²', 1390, 530, { font: font.mono, size: 15, color: color.body, align: 'center', alpha: table });
    [['x', 'u = x'], ['z', 'u = φ(x)']].forEach(([key, label], i) => {
      const y = 580 + 50 * i;
      text(ctx, label, 900, y, { font: font.mono, size: 16, color: MODEL, alpha: table });
      [['flat', 1200], ['warped', 1390]].forEach(([W, x]) => {
        const ratio = TABLE[key][W].ratio;
        const closed = ratio < 1.001;
        if (closed) {
          ctx.save();
          ctx.globalAlpha *= table;
          ctx.fillStyle = rgba(color.gold, 0.18);
          roundRect(ctx, x - 60, y - 24, 120, 36, 8);
          ctx.fill();
          ctx.restore();
        }
        text(ctx, ratioLabel(ratio), x, y, { font: font.mono, size: 18, color: closed ? color.gold : KL, align: 'center', alpha: table });
      });
    });
    text(ctx, 'only the matched pair closes: map, mobility and model functions chosen together', 900, 668, { ...type.note, size: 14, color: color.gold, alpha: table * seg(t, 89, 90.5) });

    // the map and its mobility
    const mapShow = seg(t, 70, 71.5);
    MAP.draw(ctx, 100, 575, { size: 21, alpha: mapShow });
    axes(ctx, PHI_PLOT, { xTicks: [-2, -1, 0, 1, 2, 3], yTicks: [-3, 0, 3], alpha: mapShow });
    text(ctx, 'φ(x)', PHI_PLOT.x + 12, PHI_PLOT.y + 24, { font: font.mono, size: 15, color: MODEL, alpha: mapShow });
    path(PHI_PLOT, pts(z), { colour: MODEL, alpha: mapShow, width: 3 });
    path(PHI_PLOT, pts(Float64Array.from(p, (v) => v * 2.4 - 3.1)), { colour: rgba(DATA, 0.5), alpha: mapShow, width: 1.5, fill: rgba(DATA, 0.1), close: false });
    CLOSED.draw(ctx, PHI_PLOT.x + PHI_PLOT.w - 150, PHI_PLOT.y + 30, { size: 24, alpha: seg(t, 78, 79.2) });

    const wShow = seg(t, 96, 97.5);
    axes(ctx, W_PLOT, { xTicks: [-2, -1, 0, 1, 2, 3], yTicks: [[0, '1'], [3, '10³'], [6, '10⁶']], yLabel: 'W', alpha: wShow });
    path(W_PLOT, pts(Float64Array.from(mobility, (v) => Math.log10(v))), { colour: INFO, alpha: wShow, width: 3 });
    const barrier = 0.45;
    line(ctx, W_PLOT.X(barrier), W_PLOT.y, W_PLOT.X(barrier), W_PLOT.y + W_PLOT.h, { color: color.gold, width: 1.5, dash: [5, 5], alpha: wShow });
    text(ctx, 'barrier: mobility ≈ 10⁶ × that of the basins', W_PLOT.X(barrier) + 10, W_PLOT.y + 18, { font: font.mono, size: 13, color: color.gold, alpha: wShow });
    wrap(ctx, 'equal rates are not required: eigenfunctions of L_W with different eigenvalues are still efficient; equal rates only help conditioning', 880, 866, 620, 20, { ...type.note, size: 14, color: color.muted, alpha: seg(t, 110, 111.5) });
  },
});
