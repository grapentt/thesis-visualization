import {
  defineScene, seg, text, wrap, type, font, color, tex, line, dot, arrow, symmetricTicks, formatTick,
  drawMolecule, molecule, dataset, sigma,
} from '../../../kit.js';
import { dataPlot, plotX, plotY, dataSceneCamera } from './shared.js';

const COVARIANCE = tex(String.raw`\Sigma = \operatorname{Cov}[x] \qquad \text{(spread of the data)}`, 'Σ = Cov[x]   (spread of the data)');
const STIFFNESS = tex(
  String.raw`K = \nabla^2 E(x_0) \;\approx\; k_BT\,\Sigma^{-1} \qquad \text{(stiffness matrix)}`,
  'K = ∇²E(x₀) ≈ k_BT Σ⁻¹   (stiffness matrix)',
);
const EIGEN = tex(String.raw`K\,e_i = \lambda_i\, e_i`, 'K eᵢ = λᵢ eᵢ');
const EIGENVALUES = tex(
  String.raw`\lambda_{\text{soft}} = 0.05\qquad\lambda_{\text{stiff}} = 20\qquad \text{eV}/\mathring{\mathrm{A}}^2`,
  'λ_soft = 0.05    λ_stiff = 20    eV/Å²',
);
const KAPPA = tex(String.raw`\kappa(K) = \frac{\lambda_{\max}}{\lambda_{\min}} = \frac{20}{0.05} = 400`, 'κ(K) = λmax / λmin = 20 / 0.05 = 400');

export default defineScene({
  name: 'Conditioning',
  duration: 15,
  continues: true,
  narration:
    'The stiffness matrix K, the Hessian of the energy, captures this. Its eigenvalues say how stiff each direction is. Their ratio, the condition number κ, measures how badly scaled the geometry is.',
  header: { eyebrow: '08 · CONDITIONING', title: 'Stiffness, measured: the condition number' },

  draw(ctx, t) {
    drawMolecule(ctx, molecule.positions, dataSceneCamera(), { opacity: 1 - seg(t, 0, 0.8) });
    drawScatter(ctx, t);

    COVARIANCE.draw(ctx, 100, 240, { size: 30, alpha: seg(t, 1, 2) });
    STIFFNESS.draw(ctx, 100, 315, { size: 30, alpha: seg(t, 2.5, 3.5) });
    text(ctx, 'harmonic approximation around the equilibrium x₀', 100, 362, { ...type.note, size: 14, alpha: seg(t, 2.8, 3.8) });
    EIGEN.draw(ctx, 100, 425, { size: 30, alpha: seg(t, 4, 5) });
    EIGENVALUES.draw(ctx, 100, 490, { size: 30, alpha: seg(t, 5, 6) });
    KAPPA.draw(ctx, 100, 590, { size: 40, alpha: seg(t, 6.5, 7.5) });
    drawEigenvalueScale(ctx, seg(t, 8, 9.5));
    wrap(ctx, 'κ is taken over the internal modes. The larger κ, the stiffer the problem.', 100, 830, 700, 30, {
      ...type.body,
      size: 21,
      alpha: seg(t, 10, 10.8),
    });
  },
});

function drawScatter(ctx, t) {
  const { x: bx, y: by, w: bw, h: bh } = dataPlot.box;
  const cx = plotX(0);
  const cy = dataPlot.cy;
  const tick = { font: font.mono, size: 15, color: color.muted };

  line(ctx, bx, cy, bx + bw, cy);
  line(ctx, cx, by, cx, by + bh);
  for (const v of symmetricTicks(2.25, 1)) text(ctx, formatTick(v, 1), plotX(v), by + bh + 28, { ...tick, align: 'center' });
  for (const v of symmetricTicks(2, 1)) text(ctx, formatTick(v, 1), bx - 10, plotY(v), { ...tick, align: 'right', baseline: 'middle' });
  text(ctx, 's (Å)', bx + bw, by + bh + 56, { ...tick, color: color.soft, align: 'right' });
  text(ctx, 'q (Å)', cx + 12, by + 16, { ...tick, color: color.stiff });
  for (const d of dataset) dot(ctx, plotX(d.s), plotY(d.q), 4, color.soft, 0.6);

  // 1σ and 2σ ellipses of the data
  const e = seg(t, 0.8, 2);
  for (const k of [1, 2]) {
    ctx.save();
    ctx.globalAlpha = e * (k === 1 ? 0.9 : 0.5);
    ctx.strokeStyle = color.gold;
    ctx.lineWidth = 2;
    ctx.setLineDash(k === 2 ? [5, 5] : []);
    ctx.beginPath();
    ctx.ellipse(cx, cy, k * sigma.soft * dataPlot.pxPerAngstrom, Math.max(1.5, k * sigma.stiff * dataPlot.pxPerAngstrom), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const a = seg(t, 2, 3);
  arrow(ctx, cx, cy, cx + 130, cy, { color: color.soft, width: 4, head: 14, alpha: a });
  arrow(ctx, cx, cy, cx, cy - 130, { color: color.stiff, width: 4, head: 14, alpha: a });
  text(ctx, 'e_soft', cx + 96, 490, { ...type.math, size: 24, color: color.soft, alpha: a });
  text(ctx, 'e_stiff', cx + 10, 384, { ...type.math, size: 24, color: color.stiff, alpha: a });
  text(ctx, 'eigen-directions (unit length)', cx + 10, 358, { ...type.note, size: 14, alpha: a });
}

/** Both eigenvalues on a log axis, with the ×400 gap marked. */
function drawEigenvalueScale(ctx, alpha) {
  if (alpha <= 0) return;
  const x0 = 100;
  const x1 = 760;
  const y = 720;
  const X = (lambda) => x0 + ((Math.log10(lambda) + 2) / 4) * (x1 - x0);
  ctx.save();
  ctx.globalAlpha = alpha;
  line(ctx, x0, y, x1, y);
  ['10⁻²', '10⁻¹', '1', '10', '10²'].forEach((label, i) => {
    const x = x0 + (i * (x1 - x0)) / 4;
    line(ctx, x, y, x, y + 6);
    text(ctx, label, x, y + 28, { ...type.note, align: 'center' });
  });
  text(ctx, 'eigenvalue λ (eV/Å², log scale)', x1, y + 54, { ...type.note, size: 14, align: 'right' });
  dot(ctx, X(0.05), y, 9, color.soft);
  dot(ctx, X(20), y, 9, color.stiff);
  ctx.strokeStyle = color.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(0.05), y - 22);
  ctx.lineTo(X(0.05), y - 32);
  ctx.lineTo(X(20), y - 32);
  ctx.lineTo(X(20), y - 22);
  ctx.stroke();
  text(ctx, '× 400', (X(0.05) + X(20)) / 2, y - 42, { font: font.mono, size: 18, color: color.gold, align: 'center' });
  ctx.restore();
}
