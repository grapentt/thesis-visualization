// Scene 11: the natural gradient. Fitting a Gaussian to a target by minimising KL: plain gradient
// steps in (μ, σ) have no fixed scale (they overshoot when the fit is narrow and crawl when it is
// wide), natural-gradient steps −g⁻¹∇L do, and in the small-step limit their path is the straight
// line in the expectation coordinates (μ, μ² + σ²): an m-geodesic.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, header, frame, axes, drawPath, drawPoint, drawCurve, clipped, readout, exampleStamp, fmt, pill, caption } from '../shared.js';
import { descend, naturalFlowPath, klGaussian, klGradient, naturalGradient, fisherCircle, gaussianPdf } from '../math.js';

const H = frame({ x: 110, y: 200, w: 640, h: 360, u: [-1.6, 4.2], v: [0, 4.2] });
const B = frame({ x: 110, y: 700, w: 640, h: 135, u: [-4, 6], v: [0, 0.85] });
const LOSS = frame({ x: 920, y: 600, w: 560, h: 200, u: [0, 60], v: [-6, 1.5] });
const START = [3, 0.5];
const TARGET = [0, 1];
const RUNS = [
  { key: 'plainBig', label: 'plain gradient, η = 0.3', tint: MIX, path: descend(START, TARGET, { eta: 0.3, steps: 60, method: 'plain' }), from: 34, per: 1.2, dash: [6, 5] },
  { key: 'plainSmall', label: 'plain gradient, η = 0.02', tint: color.muted, path: descend(START, TARGET, { eta: 0.02, steps: 60, method: 'plain' }), from: 41, per: 0.14, dash: [] },
  { key: 'natural', label: 'natural gradient, η = 0.3', tint: METRIC, path: descend(START, TARGET, { eta: 0.3, steps: 60, method: 'natural' }), from: 51, per: 0.45, dash: [] },
];
const FLOW = naturalFlowPath(START, TARGET, 96);
const GRID = [];
for (const mu of [-1, 0, 1, 2, 3, 4]) for (const sigma of [0.4, 1, 1.8, 2.8, 3.8]) GRID.push([mu, sigma]);
const R = 850;

const LOSSF = tex(String.raw`L(\mu,\sigma) = \mathrm{KL}\big(\mathcal N(\mu^\ast,\sigma^{\ast 2})\,\|\,\mathcal N(\mu,\sigma^2)\big)`, 'L(μ, σ) = KL(N(μ*, σ*²) ‖ N(μ, σ²))');
const PLAIN = tex(String.raw`\theta \leftarrow \theta - \eta\,\nabla L,\qquad \partial_\mu L = \frac{\mu-\mu^\ast}{\sigma^2}`, 'θ ← θ − η ∇L,  ∂_μ L = (μ − μ*)/σ²');
const NATURAL = tex(String.raw`\tilde\nabla L = g^{-1}\nabla L = \arg\max_{\|v\|_g = \varepsilon}\big(-dL(v)\big)/\varepsilon`, '∇̃L = g⁻¹∇L: steepest under ‖v‖_g = ε');
const NATURAL_GAUSS = tex(String.raw`\tilde\nabla L = \Big(\mu-\mu^\ast,\;\; \tfrac{\sigma}{2} - \tfrac{\sigma^{\ast 2} + (\mu-\mu^\ast)^2}{2\sigma}\Big)`, '∇̃L = (μ − μ*, σ/2 − (σ*² + (μ − μ*)²)/(2σ))');
const ETA = tex(String.raw`\eta = \big(\mathbb E[x],\, \mathbb E[x^2]\big) = \big(\mu,\, \mu^2 + \sigma^2\big),\qquad \dot\eta = -(\eta - \eta^\ast)`, 'η = (E[x], E[x²]) = (μ, μ² + σ²),  η̇ = −(η − η*)');

/** How many steps of a run are shown at time t. */
const shown = (run, t) => Math.max(0, Math.min(run.path.length - 1, Math.floor((t - run.from) / run.per)));

export default defineScene({
  name: 'The natural gradient',
  duration: 86,
  narration: [
    [0, 'Now use the ruler to learn. Fit a Gaussian to a target by minimising the KL divergence. Plain gradient descent asks which step of fixed coordinate length lowers the loss most. But coordinate length means nothing here, and the plain gradient in mu carries a factor one over sigma squared: huge when the fit is narrow, tiny when it is wide.'],
    [18, 'Ask instead for the step of fixed Fisher length, and the answer is the inverse metric times the gradient: Amari\'s natural gradient. It is the same vector in every parametrisation, and for this loss its mu component is simply mu minus mu star, whatever sigma is.'],
    [33, 'Start narrow and far from the target. Plain descent with step size point three overshoots at once: sigma jumps to twenty-four, mu to minus point six, and the fit never recovers. With step size point oh two it is safe, and after sixty steps it is still nowhere near. No single step size serves both regimes.'],
    [50, 'The natural gradient with step size point three widens first, slides across while wide, and narrows onto the target in about fifteen steps: the geodesic\'s strategy, found without knowing the geodesic. In the limit of small steps its path is a straight line in the expectation coordinates, mu and mu squared plus sigma squared: a geodesic of the second, flat geometry.'],
    [70, 'Steepest descent means nothing without a metric. With the Fisher metric the descent happens in the space of distributions, and the parametrisation drops out.'],
  ],
  header: header(11, 'THE NATURAL GRADIENT', 'Steepest descent, measured by the Fisher metric'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    axes(ctx, H, { xTicks: [-1, 0, 1, 2, 3, 4], yTicks: [1, 2, 3, 4], xLabel: 'μ', yLabel: 'σ', alpha: on, grid: true });
    caption(ctx, H, 'fitting N(μ, σ²) to the target N(0, 1) from N(3, 0.5²), three descents', on, { color: color.muted });
    clipped(ctx, H, () => {
      GRID.forEach((c) => drawPath(ctx, H, fisherCircle(c, 0.25), { colour: METRIC, alpha: 0.35 * on, width: 1, close: true }));
      // the natural-gradient flow (the m-geodesic), then the three runs
      drawPath(ctx, H, FLOW, { colour: METRIC, alpha: seg(t, 62, 63), width: 1.6, dash: [4, 5] });
      for (const run of RUNS) {
        const k = shown(run, t);
        if (k < 1) continue;
        const pts = run.path.slice(0, k + 1);
        drawPath(ctx, H, pts, { colour: run.tint, width: run.key === 'natural' ? 2.6 : 2, dash: run.dash, alpha: 0.95 });
        for (const p of pts) if (H.inside(p)) drawPoint(ctx, H, p, { colour: run.tint, r: run.key === 'plainSmall' ? 2 : 3.5 });
      }
    });
    drawPoint(ctx, H, TARGET, { colour: P_COL, alpha: on, r: 7, ringed: true, label: 'target N(0, 1)', labelOffset: [14, -12] });
    drawPoint(ctx, H, START, { colour: Q_COL, alpha: on, r: 7, label: 'start N(3, 0.5²)', labelOffset: [12, 24] });
    // readouts of the last shown step per run
    RUNS.forEach((run, i) => {
      const k = shown(run, t);
      const a = seg(t, run.from, run.from + 0.5);
      const p = run.path[Math.min(k, run.path.length - 1)];
      text(ctx, `${run.label}: step ${k}, (μ, σ) = (${fmt(p[0], 2)}, ${fmt(p[1], 2)}), L = ${fmt(klGaussian(TARGET, p), 3)}`, H.x, H.y + H.h + 50 + 20 * i, { font: font.mono, size: 13, color: run.tint, alpha: a });
    });
    text(ctx, 'the plain run at η = 0.3 leaves the picture: σ = 23.9 after one step', H.x + H.w - 8, H.y + 24, { font: font.mono, size: 13, color: MIX, align: 'right', alpha: fade(t, 36, 37, 50, 51) });
    text(ctx, 'dashed: the natural-gradient flow, a straight line in (μ, μ² + σ²)', H.x + H.w - 8, H.y + 24, { font: font.mono, size: 13, color: METRIC, align: 'right', alpha: seg(t, 62.5, 63.5) });

    // the bells: target and the natural-gradient fit
    const bells = seg(t, 51, 52);
    if (bells > 0.003) {
      const k = shown(RUNS[2], t);
      const p = RUNS[2].path[k];
      ctx.save();
      ctx.globalAlpha *= bells;
      line(ctx, B.x, B.Y(0), B.x + B.w, B.Y(0), { color: color.line });
      drawCurve(ctx, B, (x) => gaussianPdf(x, TARGET[0], TARGET[1]), { colour: P_COL, width: 1.8, n: 300, alpha: 0.9 });
      drawCurve(ctx, B, (x) => gaussianPdf(x, START[0], START[1]), { colour: Q_COL, width: 1.2, n: 300, alpha: 0.5, dash: [4, 4] });
      drawCurve(ctx, B, (x) => gaussianPdf(x, p[0], p[1]), { colour: METRIC, width: 2.6, fill: rgba(METRIC, 0.14), n: 300 });
      text(ctx, `natural-gradient fit after ${k} steps`, B.x, B.y - 12, { ...type.note, color: METRIC });
      ctx.restore();
    }

    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), 'target N(0, 1) · start N(3, 0.5²) · every step on screen is computed');
  },
});

function drawNotes(ctx, t) {
  LOSSF.draw(ctx, R, 225, { size: 22, alpha: seg(t, 1, 2) });
  PLAIN.draw(ctx, R, 275, { size: 22, alpha: seg(t, 6, 7) });
  text(ctx, 'a step of fixed coordinate length: 1/σ² times too big when narrow, too small when wide', R, 312, { ...type.note, size: 13, alpha: seg(t, 9, 10) });
  const ng = seg(t, 18.5, 19.5);
  pill(ctx, 'NATURAL GRADIENT · AMARI 1998', R, 360, METRIC, ng);
  NATURAL.draw(ctx, R, 404, { size: 22, alpha: ng });
  text(ctx, 'the same vector in every parametrisation: a coordinate-free direction of descent', R, 440, { ...type.note, size: 13, alpha: seg(t, 23, 24) });
  NATURAL_GAUSS.draw(ctx, R, 486, { size: 21, alpha: seg(t, 26, 27) });
  text(ctx, 'the μ component no longer depends on σ', R, 520, { ...type.note, color: METRIC, alpha: seg(t, 29, 30) });
  // the loss plot
  const plot = seg(t, 34, 35);
  if (plot > 0.003) {
    axes(ctx, LOSS, { xTicks: [0, 15, 30, 45, 60], yTicks: [-6, -4, -2, 0], xLabel: 'step', alpha: plot, grid: true, formatY: (v) => (v === 0 ? '1' : `10${['⁰', '⁻¹', '⁻²', '⁻³', '⁻⁴', '⁻⁵', '⁻⁶'][-v]}`) });
    text(ctx, 'loss L (log scale)', LOSS.x, LOSS.y - 12, { ...type.note, size: 13, alpha: plot });
    clipped(ctx, LOSS, () => {
      for (const run of RUNS) {
        const k = shown(run, t);
        if (k < 1) continue;
        const pts = run.path.slice(0, k + 1).map((p, i) => [i, Math.log10(Math.max(1e-7, klGaussian(TARGET, p)))]);
        drawPath(ctx, LOSS, pts, { colour: run.tint, width: run.key === 'natural' ? 2.4 : 1.8, dash: run.dash });
      }
    }, 4);
  }
  ETA.draw(ctx, R, 836, { size: 20, alpha: seg(t, 63, 64) });
  text(ctx, 'a straight line in η = the mixture geodesic of scene 12; the η = 0.3 steps follow it approximately', R, 868, { ...type.note, size: 12, alpha: seg(t, 65, 66) });
}
