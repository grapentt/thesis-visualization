// Scene 09 (live, lenses only): the Gaussian family as a hyperbolic plane. Fisher circles across the
// (μ, σ) half-plane, the half-ellipse geodesic between two Gaussians against the straight segment,
// the bells along the geodesic, and the closed-form distance. Two sliders move the second Gaussian;
// everything is a pure function of time and of the slider values, so the scene is always live.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, rgba, slider } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, header, frame, axes, drawPath, drawPoint, drawCurve, clipped, readout, exampleStamp, fmt, pill, caption } from '../shared.js';
import { gaussianFisher, gaussianDistance, gaussianGeodesic, gaussianLength, gaussianPdf, fisherCircle, klGaussian } from '../math.js';

const H = frame({ x: 110, y: 200, w: 640, h: 340, u: [-5.2, 5.2], v: [0, 3.5] });
const B = frame({ x: 110, y: 650, w: 640, h: 170, u: [-5.2, 5.2], v: [0, 0.85] });
const A = [-3, 0.5];
const CIRCLE_R = 0.3;
const GRID = [];
for (const mu of [-4, -2, 0, 2, 4]) for (const sigma of [0.4, 0.9, 1.6, 2.6]) GRID.push([mu, sigma]);
const R = 850;

const FISHER = tex(String.raw`g = \begin{pmatrix} 1/\sigma^2 & 0 \\ 0 & 2/\sigma^2 \end{pmatrix},\qquad ds^2 = \frac{d\mu^2 + 2\,d\sigma^2}{\sigma^2}`, 'g = diag(1/σ², 2/σ²),  ds² = (dμ² + 2dσ²)/σ²');
const HALFPLANE = tex(String.raw`(x, y) = \Big(\tfrac{\mu}{\sqrt 2},\, \sigma\Big):\quad ds^2 = 2\,\frac{dx^2 + dy^2}{y^2},\qquad K = -\tfrac{1}{2}`, '(x, y) = (μ/√2, σ): ds² = 2 (dx² + dy²)/y², K = −½');
const DIST = tex(String.raw`d_{\mathrm{FR}} = \sqrt{2}\,\operatorname{arcosh}\!\Big(1 + \frac{(\mu_1-\mu_2)^2 + 2(\sigma_1-\sigma_2)^2}{4\,\sigma_1\sigma_2}\Big)`, 'd_FR = √2 arcosh(1 + ((μ₁−μ₂)² + 2(σ₁−σ₂)²)/(4σ₁σ₂))');

export default defineScene({
  name: 'Gaussians: a hyperbolic plane',
  duration: 86,
  narration: [
    [0, 'Gaussians, with mean mu and width sigma. The Fisher metric is one over sigma squared along mu and two over sigma squared along sigma: both shrink as the width grows. Here are Fisher circles of one size across the half-plane. Near the bottom, where distributions are narrow, a tiny shift is a big step; high up, wide Gaussians barely notice the same shift.'],
    [19, 'Rescale mu by root two and this is the Poincaré half-plane, up to a factor two: a surface of constant negative curvature, minus one half, as Hotelling noticed as early as 1929. Geodesics are the half-ellipses that stand on the mu axis, and the distance has a closed form.'],
    [35, 'So the shortest path between two narrow Gaussians far apart is not the straight segment. It climbs: it widens the distribution, slides it across while it is wide and cheap to move, and narrows it again. The bells below trace that path.'],
    [50, 'Widen the second Gaussian and the distance drops; move its mean and the geodesic bends to follow. The two sliders under the video are yours at any time: this scene is computed live. And note the contrast with optimal transport: in the Wasserstein geometry this half-plane is flat and the straight segment wins. Fisher–Rao pays for distinguishability, not for how far the mass moves.'],
    [70, 'Unlike the sphere of the simplex, this plane is unbounded: two unit Gaussians a hundred apart are about twelve units apart, and the distance grows only logarithmically with the gap.'],
  ],
  header: header(9, 'GAUSSIANS', 'The (μ, σ) half-plane is hyperbolic'),
  controls: {
    mu2: slider('Mean μ₂ of the second Gaussian', { min: -4.5, max: 4.5, step: 0.1, value: [[0, 3], [50, 3], [56, 1.2], [62, 1.2], [67, 3.2]], lens: true, digits: 1 }),
    sigma2: slider('Width σ₂ of the second Gaussian', { min: 0.2, max: 3, step: 0.05, value: [[0, 0.5], [50, 0.5], [55, 2.2], [61, 2.2], [66, 0.6]], lens: true, digits: 2 }),
  },

  draw(ctx, t, { input }) {
    const on = seg(t, 0.3, 1.3);
    const Bp = [input.mu2, input.sigma2];
    const geo = gaussianGeodesic(A, Bp, 96);
    const straight = Array.from({ length: 97 }, (_, i) => [A[0] + ((Bp[0] - A[0]) * i) / 96, A[1] + ((Bp[1] - A[1]) * i) / 96]);
    const dFR = gaussianDistance(A, Bp);
    const dStraight = gaussianLength(straight);

    axes(ctx, H, { xTicks: [-4, -2, 0, 2, 4], yTicks: [1, 2, 3], xLabel: 'μ', yLabel: 'σ', alpha: on, grid: true });
    caption(ctx, H, 'Fisher circles of radius 0.3 · the geodesic (solid) and the straight segment (dashed)', on, { color: color.muted });
    // Fisher circles
    const circles = seg(t, 3, 4);
    clipped(ctx, H, () => {
      GRID.forEach((c, i) => drawPath(ctx, H, fisherCircle(c, CIRCLE_R), { colour: METRIC, alpha: circles * seg(t, 3 + 0.12 * i, 3.8 + 0.12 * i), width: 1.3, fill: rgba(METRIC, 0.1), close: true }));
      // the two Gaussians, the straight segment, the geodesic
      const paths = seg(t, 20, 21);
      drawPath(ctx, H, straight, { colour: MIX, alpha: paths * seg(t, 36, 37), width: 1.8, dash: [6, 5] });
      drawPath(ctx, H, geo, { colour: METRIC, alpha: paths, width: 3, progress: lin(t, 21, 24) });
    });
    drawPoint(ctx, H, A, { colour: P_COL, alpha: seg(t, 1.5, 2.5), r: 7, label: 'N(−3, 0.5²)', labelOffset: [-44, 34] });
    drawPoint(ctx, H, Bp, { colour: Q_COL, alpha: seg(t, 1.5, 2.5), r: 7, label: `N(${fmt(Bp[0], 1)}, ${fmt(Bp[1], 2)}²)`, labelOffset: [-50, 34] });
    // the moving point along the geodesic, and the bells
    const slide = seg(t, 36, 37);
    const s = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - 36)) / 9);
    const k = Math.round(s * (geo.length - 1));
    const here = geo[k];
    drawPoint(ctx, H, here, { colour: METRIC, alpha: slide, r: 6, halo: 1 });
    readout(ctx, 'd_FR =', dFR, H.x + H.w - 8, H.y + 24, { colour: METRIC, alpha: seg(t, 24, 25), align: 'right', size: 18 });
    readout(ctx, 'straight segment:', dStraight, H.x + H.w - 8, H.y + 48, { colour: MIX, alpha: seg(t, 36.5, 37.5), align: 'right', size: 15 });
    readout(ctx, 'ratio', dStraight / dFR, H.x + H.w - 8, H.y + 68, { colour: color.muted, alpha: seg(t, 37.5, 38.5), align: 'right', size: 13 });

    // the bells
    const bells = seg(t, 36, 37);
    if (bells > 0.003) {
      ctx.save();
      ctx.globalAlpha *= bells;
      line(ctx, B.x, B.Y(0), B.x + B.w, B.Y(0), { color: color.line });
      drawCurve(ctx, B, (x) => gaussianPdf(x, A[0], A[1]), { colour: P_COL, width: 1.8, n: 300, alpha: 0.85 });
      drawCurve(ctx, B, (x) => gaussianPdf(x, Bp[0], Bp[1]), { colour: Q_COL, width: 1.8, n: 300, alpha: 0.85 });
      drawCurve(ctx, B, (x) => gaussianPdf(x, here[0], here[1]), { colour: METRIC, width: 2.6, fill: rgba(METRIC, 0.14), n: 300 });
      text(ctx, `along the geodesic: μ = ${fmt(here[0])}, σ = ${fmt(here[1])}`, B.x, B.y - 12, { ...type.note, color: METRIC });
      text(ctx, 'widen · slide · narrow', B.x + B.w, B.y - 12, { ...type.note, color: color.muted, align: 'right' });
      ctx.restore();
    }

    drawNotes(ctx, t, Bp, dFR);
    exampleStamp(ctx, seg(t, 2, 3), 'live: the sliders move the second Gaussian · everything on screen is computed');
  },
});

function drawNotes(ctx, t, Bp, dFR) {
  FISHER.draw(ctx, R, 240, { size: 24, alpha: seg(t, 1, 2) });
  text(ctx, 'both entries shrink like 1/σ²: wide Gaussians are hard to tell apart', R, 290, { ...type.note, alpha: seg(t, 5, 6) });
  HALFPLANE.draw(ctx, R, 345, { size: 22, alpha: seg(t, 20, 21) });
  text(ctx, 'curvature −½ (Hotelling 1929, Rao 1945); geodesics: half-ellipses standing on the μ axis', R, 384, { ...type.note, size: 13, alpha: seg(t, 24, 25) });
  DIST.draw(ctx, R, 440, { size: 21, alpha: seg(t, 28, 29) });
  readout(ctx, `d_FR(N(−3, 0.5²), N(${fmt(Bp[0], 1)}, ${fmt(Bp[1], 2)}²)) =`, dFR, R, 486, { colour: METRIC, alpha: seg(t, 30, 31), size: 15 });
  const top = Math.max(...gaussianGeodesic(A, Bp, 64).map(([, s]) => s));
  readout(ctx, 'widest Gaussian on the geodesic: σ =', top, R, 512, { colour: METRIC, alpha: seg(t, 38, 39), size: 15 });
  const w = seg(t, 52, 53);
  pill(ctx, 'FISHER–RAO AGAINST WASSERSTEIN', R, 570, MIX, w);
  wrap(ctx, 'In the Wasserstein-2 geometry the (μ, σ) half-plane is flat: W₂² = (μ₁ − μ₂)² + (σ₁ − σ₂)², geodesics are straight segments, and the cost is how far the mass moves. Fisher–Rao charges for distinguishability instead, so moving a wide Gaussian is cheap.', R, 606, 660, 24, { ...type.note, size: 15, color: color.body, alpha: seg(t, 53, 54) });
  const u = seg(t, 70.5, 71.5);
  pill(ctx, 'UNBOUNDED', R, 740, METRIC, u);
  readout(ctx, 'd_FR(N(0, 1), N(100, 1)) =', gaussianDistance([0, 1], [100, 1]), R, 782, { colour: METRIC, alpha: seg(t, 72, 73), size: 16 });
  text(ctx, 'grows like 2√2 log(Δμ/σ): the simplex is a sphere with diameter π, this plane is not', R, 812, { ...type.note, size: 13, alpha: seg(t, 74, 75) });
  readout(ctx, 'KL(first ‖ second) =', klGaussian(A, Bp), R, 850, { colour: color.muted, alpha: seg(t, 31, 32), size: 13 });
}
