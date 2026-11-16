import { defineScene, seg, fade, lin, lerpLog, text, wrap, type, font, color, rgba, tex, line, roundRect, sigma } from '../../../kit.js';
import { header, frame, axes, drawCurve, decades, legend, panel, pill, BOND, TORSION, INFO } from '../shared.js';

const ROWS = [
  { title: '1 · Noise', flat: tex(String.raw`dx_t = g(t)\,dW_t`, 'dxₜ = g(t) dWₜ'), metric: tex(String.raw`dx_t = g(t)\,G^{-1/2}\,dW_t`, 'dxₜ = g(t) G^(−1/2) dWₜ') },
  { title: '2 · Score', flat: tex(String.raw`\nabla\log p_t`, '∇log pₜ'), metric: tex(String.raw`G^{-1}\nabla\log p_t`, 'G⁻¹ ∇log pₜ') },
  { title: '3 · Loss', flat: tex(String.raw`\|s_\theta-\nabla\log p_t\|_2^2`, '‖s_θ − ∇log pₜ‖₂²'), metric: tex(String.raw`\|s_\theta-G^{-1}\nabla\log p_t\|_G^2`, '‖s_θ − G⁻¹∇log pₜ‖²_G') },
];
const FIX = tex(String.raw`G = K`, 'G = K');
const LEFT = tex(String.raw`\frac{\sigma_i^2}{\sigma_i^2+\sigma_t^2}`, 'σᵢ² / (σᵢ² + σₜ²)');

const PLOT = frame({ x: 900, y: 240, w: 600, h: 320, u: [-3, 0.5], v: [0, 1] });
const left = (width, logSigma) => (width * width) / (width * width + Math.pow(10, 2 * logSigma));

export default defineScene({
  name: 'Where Part 1 stopped',
  duration: 75,
  narration: [
    [0, 'Part 1 ended with one fix for three problems. Give configuration space a metric G equal to the stiffness K. Then noise has covariance G inverse, the score is a vector, and errors are measured in G.'],
    [18, 'Its first problem was measured by one curve per direction: the share of signal left after noise of size sigma t. Whitening lines the curves up, so stiff and soft directions lose information at the same rate.'],
    [38, 'That is a statement about Gaussian directions. Two questions remain open. Information about what, exactly? And once the noise is chosen, how hard is the score for the model to represent?'],
    [58, 'Those two criteria, retention and representation, are what information geometry can sharpen. They do not replace the thermal metric. They say what it should preserve.'],
  ],
  header: header(1, 'WHERE PART 1 STOPPED', 'Three problems, one fix, and two open questions'),

  draw(ctx, t) {
    // the three rows of Part 1, compressed
    const head = { font: font.mono, size: 15, tracking: 1, alpha: seg(t, 0.6, 1.4) };
    text(ctx, 'flat', 330, 222, { ...head, color: color.muted });
    text(ctx, 'metric G', 590, 222, { ...head, color: color.gold });
    ROWS.forEach((row, i) => {
      const y = 280 + i * 92;
      const a = seg(t, 1.2 + 2.2 * i, 2 + 2.2 * i);
      line(ctx, 80, y - 46, 840, y - 46, { width: 1, alpha: a });
      text(ctx, row.title, 80, y + 8, { ...type.display, size: 26, alpha: a });
      row.flat.draw(ctx, 330, y, { size: 24, alpha: a });
      row.metric.draw(ctx, 590, y, { size: 24, alpha: seg(t, 2 + 2.2 * i, 2.8 + 2.2 * i) });
    });
    const fixAlpha = seg(t, 9, 10.2);
    ctx.save();
    ctx.globalAlpha = fixAlpha;
    ctx.fillStyle = rgba(color.gold, 0.08);
    roundRect(ctx, 80, 520, 760, 70, 12);
    ctx.fill();
    ctx.strokeStyle = rgba(color.gold, 0.5);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    text(ctx, 'all three at once when', 110, 563, { ...type.body, alpha: fixAlpha });
    FIX.draw(ctx, 340, 556, { size: 34, alpha: fixAlpha });
    text(ctx, 'noise covariance G⁻¹ ∝ Σ, the thermal covariance', 340 + FIX.metrics(34).width + 36, 563, { ...type.body, size: 19, color: color.muted, alpha: fixAlpha });

    // Part 1's information-left curves, lined up by whitening
    const plotAlpha = seg(t, 18, 19.5);
    axes(ctx, PLOT, { xTicks: decades(-3, 0), yTicks: [[0, '0'], [0.5, '50%'], [1, '100%']], xLabel: 'noise level σₜ (Å, log)', grid: true, alpha: plotAlpha });
    text(ctx, 'share of signal left per direction', PLOT.x, PLOT.y - 22, { size: 19, weight: 500, alpha: plotAlpha });
    LEFT.draw(ctx, PLOT.x + 360, PLOT.y - 26, { size: 22, alpha: plotAlpha });
    const morph = seg(t, 28, 31.5); // whitening: the stiff curve slides onto the soft one
    const stiffWidth = lerpLog(sigma.stiff, sigma.soft, morph);
    drawCurve(ctx, PLOT, (l) => left(sigma.soft, l), { colour: TORSION, alpha: plotAlpha, width: 3.5 });
    drawCurve(ctx, PLOT, (l) => left(stiffWidth, l), { colour: BOND, alpha: plotAlpha, width: 3.5, dash: morph > 0.98 ? [8, 7] : [] });
    legend(ctx, PLOT.x + 20, PLOT.y + 30, [{ name: 'soft (torsion), σ = 1.02 Å', colour: TORSION }, { name: 'stiff (bond), σ = 0.036 Å', colour: BOND }], { alpha: plotAlpha * (1 - morph), vertical: true });
    text(ctx, 'whitened: one curve for every direction', PLOT.x + 20, PLOT.y + 30, { font: font.mono, size: 15, color: INFO, alpha: plotAlpha * morph });
    text(ctx, '×20 in noise level', PLOT.X(-1.6), PLOT.Y(0.5) + 46, { ...type.note, color: color.gold, align: 'center', alpha: fade(t, 21, 22, 27.5, 28.5) });

    // the two open questions
    for (const [i, q] of [
      { tag: 'RETENTION', colour: INFO, title: 'Information about what?', body: 'One curve per Gaussian direction says nothing about bonds versus basin populations. Which physical changes does the noisy molecule still reveal?' },
      { tag: 'REPRESENTATION', colour: color.y, title: 'What must the model learn?', body: 'Once the noise is chosen, does the diffusion operator act simply on the functions the score model has to represent?' },
    ].entries()) {
      const x = 80 + i * 740;
      const a = seg(t, 40 + 8 * i, 41 + 8 * i);
      panel(ctx, x, 650, 700, 190, { alpha: a, stroke: rgba(q.colour, 0.5) });
      pill(ctx, q.tag, x + 26, 684, q.colour, a);
      text(ctx, q.title, x + 26, 736, { ...type.display, size: 27, alpha: a });
      wrap(ctx, q.body, x + 26, 770, 650, 26, { ...type.body, size: 18, color: color.body, alpha: a * seg(t, 41.5 + 8 * i, 43 + 8 * i) });
    }
    text(ctx, 'not a replacement for the thermal metric: a sharper statement of what it should preserve', 800, 870, { ...type.note, color: color.gold, align: 'center', alpha: seg(t, 60, 61.5) });
  },
});
