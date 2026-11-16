import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, rgba, tex, line, dashedLine, dot } from '../../../kit.js';
import { header, frame, axes, drawCurve, drawPath, caption, pill, readout, panel, INFO, TORSION, DATA, MODEL } from '../shared.js';
import { COORDINATES, ou, ouPaths, linePosterior, LINE } from '../math.js';

const PROJECTION = tex(String.raw`F_\tau = J_\tau^{\top} C_\tau^{-1} J_\tau + \mathbb E\big[r_\tau r_\tau^{\top}\big]`, 'Fτ = Jτᵀ Cτ⁻¹ Jτ + E[rτ rτᵀ]');
const RESIDUAL = tex(String.raw`r_\tau = \nabla_x\log p_\tau(Y\mid x) - J_\tau^{\top}C_\tau^{-1}(Y-m_\tau)`, 'rτ = ∇ₓ log pτ(Y|x) − Jτᵀ Cτ⁻¹ (Y − mτ)');
const POSTERIOR = tex(String.raw`F^{\mathrm{post}}(y) = \frac{\alpha^2}{\sigma^4}\,C^{\mathrm{post}}(y),\qquad D_y m(y) = \frac{\alpha}{\sigma^2}\,C^{\mathrm{post}}(y)`, 'F^post(y) = α²/σ⁴ C^post(y),   D_y m(y) = α/σ² C^post(y)');
const SCORE = tex(String.raw`\nabla_y\log p(X\mid y) = \frac{\alpha}{\sigma^2}\big(X - m(y)\big)`, '∇_y log p(X|y) = α/σ² (X − m(y))');
const PULLBACK = tex(String.raw`q(z\mid x) = \mathcal N\big(\varphi(x), I\big)\ \Longrightarrow\ F_q(x) = D\varphi(x)^{\top} D\varphi(x)`, 'q(z|x) = N(φ(x), I)  ⇒  F_q(x) = Dφ(x)ᵀ Dφ(x)');

// column 1: the dynamics watched for a lag τ
const DYN = frame({ x: 100, y: 240, w: 400, h: 236, u: [0, 3], v: [-4, 4] });
const PATHS = ouPaths(COORDINATES.torsion, { x0: 3, count: 14, steps: 150, dt: 0.02, seed: 21 }).map((p) => Array.from(p, (v, n) => [n * 0.02, v]));

// column 2: Gaussian denoising of the two-basin line example, σ = 0.5, α = 1
const SIGMA = 0.5;
const DEN = frame({ x: 600, y: 240, w: 400, h: 236, u: [-2.6, 3.6], v: [-2.6, 3.6] });
const YS = Array.from({ length: 125 }, (_, i) => -2.6 + (6.2 * i) / 124);
const POST = YS.map((y) => linePosterior(y, SIGMA));
const postAt = (y) => {
  const x = ((y + 2.6) / 6.2) * 124;
  const i = Math.max(0, Math.min(123, Math.floor(x)));
  const f = x - i;
  return { mean: POST[i].mean + (POST[i + 1].mean - POST[i].mean) * f, variance: POST[i].variance + (POST[i + 1].variance - POST[i].variance) * f };
};

// column 3: a smooth map of the plane and the ellipses its pullback metric draws
const PULL = frame({ x: 1100, y: 240, w: 400, h: 236, u: [-1, 1], v: [-0.625, 0.625] });
const jacobian = (x, y) => [[1.6, 0.4 * 2 * Math.cos(2 * y)], [0.6 * x, 0.8]];
const ELLIPSES = [];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 3; j++) {
    const x = -0.8 + 0.4 * i;
    const y = -0.4 + 0.4 * j;
    const [[a, b], [c, d]] = jacobian(x, y);
    const det = a * d - b * c;
    const pts = [];
    for (let k = 0; k <= 48; k++) {
      const th = (2 * Math.PI * k) / 48;
      const zx = 0.16 * Math.cos(th);
      const zy = 0.16 * Math.sin(th);
      pts.push([x + (d * zx - b * zy) / det, y + (-c * zx + a * zy) / det]); // δ = (Dφ)⁻¹ z
    }
    ELLIPSES.push(pts);
  }
}

export default defineScene({
  name: 'Same word, three experiments',
  duration: 80,
  narration: [
    [0, 'Every Fisher metric answers a question about a stated experiment. Watching the dynamics for a lag tau gives the initial-state information F tau. Its covariance part is exact: F equals J transpose C inverse J plus the covariance of a residual, the part of the score that linear endpoint observables miss.'],
    [24, 'Gaussian denoising is a different experiment. The posterior score is alpha over sigma squared times x minus its posterior mean, so the posterior Fisher information is a multiple of the posterior covariance, and so is the slope of the posterior mean. In posterior-mean coordinates the metric is the inverse posterior covariance.'],
    [50, 'And every Euclidean pullback is already a Fisher metric: observe z equals phi of x plus unit noise, and the information about x is D phi transpose D phi. So calling a metric Fisher gives it a precise meaning once the experiment is named. It does not by itself show that the metric helps learning.'],
  ],
  header: header(3, 'THREE EXPERIMENTS', 'A Fisher metric is only as precise as its experiment'),

  draw(ctx, t) {
    const show = [seg(t, 0.8, 2), seg(t, 24, 25.2), seg(t, 50, 51.2)];
    const tags = ['DYNAMICS, LAG τ', 'GAUSSIAN DENOISING', 'EUCLIDEAN PULLBACK'];
    [100, 600, 1100].forEach((x, i) => pill(ctx, tags[i], x, 190, [TORSION, INFO, MODEL][i], show[i]));

    // 1 · the dynamics
    axes(ctx, DYN, { xTicks: [0, 1, 2, 3], yTicks: [-4, 0, 4], xLabel: 'τ (ps)', alpha: show[0] });
    for (const path of PATHS) drawPath(ctx, DYN, path, { colour: DATA, alpha: 0.35 * show[0], width: 1.2, progress: lin(t, 2, 12) });
    drawCurve(ctx, DYN, (tau) => ou.mean(COORDINATES.torsion, tau, 3), { colour: TORSION, alpha: show[0] * seg(t, 6, 7), width: 2.5 });
    dot(ctx, DYN.X(0), DYN.Y(3), 6, color.gold, show[0]);
    text(ctx, 'x₀', DYN.X(0) + 10, DYN.Y(3) - 12, { ...type.math, size: 20, color: color.gold, alpha: show[0] });
    caption(ctx, DYN, 'where is it after a lag τ?', show[0]);
    PROJECTION.draw(ctx, 100, 548, { size: 23, alpha: show[0] * seg(t, 8, 9) });
    RESIDUAL.draw(ctx, 100, 596, { size: 18, alpha: show[0] * seg(t, 12, 13) });
    wrap(ctx, 'The covariance part is what linear endpoint observables carry about the start. The residual is the rest of the initial-state score: exact, as an orthogonal projection, and not zero merely because the noise is Gaussian when the covariance itself moves.', 100, 644, 420, 24, { ...type.body, size: 16, color: color.body, alpha: show[0] * seg(t, 14, 15.5) });

    // 2 · denoising: the posterior mean and its slope
    axes(ctx, DEN, { xTicks: [-2, 0, 2], yTicks: [-2, 0, 2], xLabel: 'noisy y', yLabel: 'm(y)', alpha: show[1] });
    dashedLine(ctx, DEN.X(-2.6), DEN.Y(-2.6), DEN.X(3.6), DEN.Y(3.6), { color: color.dim, alpha: show[1] });
    const band = YS.map((y, i) => [y, POST[i].mean + Math.sqrt(POST[i].variance)]).concat(YS.map((y, i) => [y, POST[i].mean - Math.sqrt(POST[i].variance)]).reverse());
    drawPath(ctx, DEN, band, { colour: rgba(INFO, 0), alpha: show[1], fill: rgba(INFO, 0.18), close: true, width: 0.1 });
    drawPath(ctx, DEN, YS.map((y, i) => [y, POST[i].mean]), { colour: INFO, alpha: show[1], width: 3 });
    text(ctx, 'posterior mean ± √C^post', DEN.x + 10, DEN.y + 22, { font: font.mono, size: 14, color: INFO, alpha: show[1] });
    const sweep = lin(t, 27, 47);
    if (show[1] > 0 && sweep > 0 && sweep < 1) {
      const y = lerp(-2.2, 3.2, sweep);
      const { mean, variance } = postAt(y);
      const slope = variance / (SIGMA * SIGMA);
      line(ctx, DEN.X(y - 0.5), DEN.Y(mean - 0.5 * slope), DEN.X(y + 0.5), DEN.Y(mean + 0.5 * slope), { color: color.gold, width: 3, alpha: show[1] });
      dot(ctx, DEN.X(y), DEN.Y(mean), 6, color.gold, show[1]);
      readout(ctx, 'slope of m =', slope, DEN.x + 10, DEN.y + DEN.h - 36, { colour: color.gold, size: 15, alpha: show[1] });
      readout(ctx, 'C^post / σ² =', slope, DEN.x + 10, DEN.y + DEN.h - 14, { colour: INFO, size: 15, alpha: show[1] });
    }
    caption(ctx, DEN, 'two basins seen through noise σ = 0.5', show[1]);
    SCORE.draw(ctx, 600, 548, { size: 22, alpha: show[1] * seg(t, 27, 28) });
    POSTERIOR.draw(ctx, 600, 596, { size: 20, alpha: show[1] * seg(t, 33, 34) });
    wrap(ctx, 'An exponential family in y: in locally invertible posterior-mean coordinates the metric is the inverse posterior covariance. Precise, and still not a statement about which molecular metric learns best.', 600, 644, 420, 24, { ...type.body, size: 16, color: color.body, alpha: show[1] * seg(t, 40, 41.5) });

    // 3 · the pullback
    axes(ctx, PULL, { xTicks: [-1, 0, 1], yTicks: [-0.5, 0, 0.5], alpha: show[2], box: true });
    for (const [k, pts] of ELLIPSES.entries()) drawPath(ctx, PULL, pts, { colour: MODEL, alpha: show[2] * seg(t, 52 + 0.3 * k, 53 + 0.3 * k), width: 2, close: true, fill: rgba(MODEL, 0.12) });
    caption(ctx, PULL, 'unit balls of Dφᵀ Dφ in x', show[2]);
    PULLBACK.draw(ctx, 1100, 548, { size: 20, alpha: show[2] * seg(t, 53, 54) });
    wrap(ctx, 'Observe z = φ(x) through unit noise: the information about x is the pullback metric. Every pullback the repository already uses is a Fisher metric of this experiment.', 1100, 600, 420, 24, { ...type.body, size: 16, color: color.body, alpha: show[2] * seg(t, 58, 59.5) });

    const closing = seg(t, 66, 67.5);
    panel(ctx, 100, 790, 1400, 66, { alpha: closing, stroke: rgba(color.gold, 0.5) });
    text(ctx, 'Fisher of which experiment?  Name it, and the metric has a meaning.  A meaning is not yet a benefit for learning.', 800, 831, { ...type.body, size: 22, color: color.ink, align: 'center', alpha: closing });
  },
});
