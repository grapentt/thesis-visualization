import { defineScene, seg, text, wrap, type, font, color, rgba, tex, line, roundRect } from '../../../kit.js';

const FLAT_X = 420;
const METRIC_X = 930;

/** One row per problem: the flat version and the Riemannian one. */
const ROWS = [
  {
    title: '1 · Noise',
    subtitle: 'information loss',
    flat: tex(String.raw`dx_t = g(t)\, dW_t`, 'dxₜ = g(t) dWₜ'),
    flatNote: 'stiff modes erased at a ~20× smaller noise level',
    metric: tex(String.raw`dx_t = g(t)\, G^{-1/2}\, dW_t`, 'dxₜ = g(t) G^(−1/2) dWₜ'),
    metricNote: 'noise covariance G⁻¹ ∝ Σ: all modes lose information at the same rate',
  },
  {
    title: '2 · Score',
    subtitle: 'conditioning of the target',
    flat: tex(String.raw`\nabla \log p_t \quad (\text{covector})`, '∇log pₜ  (covector)'),
    flatNote: 'Jacobian −K/k_BT: κ = 400',
    metric: tex(String.raw`G^{-1}\,\nabla \log p_t \quad (\text{vector})`, 'G⁻¹ ∇log pₜ  (vector)'),
    metricNote: 'index raised with G⁻¹; with G = K: Jacobian −I/k_BT, κ = 1',
  },
  {
    title: '3 · Loss',
    subtitle: 'error weighting',
    flat: tex(String.raw`\big\| s_\theta - \nabla \log p_t \big\|_2^2`, '‖ s_θ − ∇log pₜ ‖₂²'),
    flatNote: 'stiff errors weighted κ = 400× more',
    metric: tex(String.raw`\big\| s_\theta - G^{-1}\nabla \log p_t \big\|_G^2 = \delta^{\top} G\, \delta`, '‖ s_θ − G⁻¹∇log pₜ ‖²_G = δᵀGδ'),
    metricNote: 'error measured in G: equal relative errors cost the same',
  },
];
const REQUIREMENT = tex(String.raw`G = K \quad\Longleftrightarrow\quad G^{-1} = K^{-1} \propto \Sigma`, 'G = K  ⇔  G⁻¹ = K⁻¹ ∝ Σ');

export default defineScene({
  name: 'One fix: G = K',
  duration: 19,
  narration:
    'All three problems share one fix: give configuration space a metric G. Noise is drawn with covariance G⁻¹, the score is turned into a vector by raising its index with G⁻¹, and errors are measured in G. All three work when G equals the stiffness matrix K.',
  header: { eyebrow: '13 · ONE FIX FOR ALL THREE', title: 'Put the stiffness into the metric' },

  draw(ctx, t) {
    const columnHead = { font: font.mono, size: 16, tracking: 1, alpha: seg(t, 0.8, 1.6) };
    text(ctx, 'flat (Euclidean)', FLAT_X, 212, { ...columnHead, color: color.muted });
    text(ctx, 'Riemannian, metric G', METRIC_X, 212, { ...columnHead, color: color.gold });

    ROWS.forEach((row, i) => {
      const y = 290 + i * 160;
      const a = seg(t, 1.5 + 3 * i, 2.5 + 3 * i);
      const b = seg(t, 2.3 + 3 * i, 3.3 + 3 * i);
      const note = { font: font.mono, size: 15 };
      line(ctx, 100, y - 62, 1500, y - 62, { width: 1, alpha: a });
      text(ctx, row.title, 100, y + 8, { ...type.display, alpha: a });
      text(ctx, row.subtitle, 100, y + 40, { ...type.note, size: 14, alpha: a });
      row.flat.draw(ctx, FLAT_X, y, { size: 28, alpha: a });
      wrap(ctx, row.flatNote, FLAT_X, y + 46, 440, 24, { ...note, color: color.stiff, alpha: a });
      row.metric.draw(ctx, METRIC_X, y, { size: 28, alpha: b });
      wrap(ctx, row.metricNote, METRIC_X, y + 46, 560, 24, { ...note, color: color.soft, alpha: b });
    });

    const q = seg(t, 11, 12.2);
    ctx.save();
    ctx.globalAlpha = q;
    ctx.fillStyle = rgba(color.gold, 0.08);
    roundRect(ctx, 100, 730, 1400, 110, 12);
    ctx.fill();
    ctx.strokeStyle = rgba(color.gold, 0.5);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    text(ctx, 'What this requires', 130, 793, { ...type.display, alpha: q });
    REQUIREMENT.draw(ctx, 410, 785, { size: 36, alpha: q });
    const textX = 410 + REQUIREMENT.metrics(36).width + 40;
    wrap(ctx, 'The metric matches the stiffness matrix, so its inverse, the noise covariance, matches the data covariance (at least approximately).', textX, 772, 1480 - textX, 28, {
      ...type.body,
      size: 20,
      alpha: seg(t, 11.6, 12.6),
    });
  },
});
