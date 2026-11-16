// Scene 10: what the ruler buys. Cramér–Rao: the scatter of the sample frequencies of a die from
// n = 100 rolls is the Fisher ball of radius 1/√n (seeded samples, drawn exactly); Jeffreys: the
// Riemannian volume √det g is the parametrisation-free prior, U-shaped in p and flat in φ for the coin,
// uniform on the sphere for the die.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, rgba } from '../../../../src/kit.js';
import { createRng } from '../../../../src/engine/random.js';
import { P_COL, Q_COL, METRIC, header, frame, axes, triangle, drawTriangle, drawSimplexPoint, drawFisherBallOnTriangle, drawCurve, drawPoint, readout, exampleStamp, fmt, pill, clipped } from '../shared.js';
import { fisherBall, cramerRao, jeffreys, bernoulliFisher, bernoulliAngle, simplexInverseFisher } from '../math.js';

const T = triangle({ x: 120, y: 240, size: 500 });
const N = 100;
const SAMPLES = 160;
const TRUTHS = [
  { p: [1 / 3, 1 / 3, 1 / 3], tint: P_COL },
  { p: [0.75, 0.15, 0.1], tint: Q_COL },
  { p: [0.08, 0.12, 0.8], tint: METRIC },
];
// seeded multinomial samples of n rolls, as frequency vectors; and their empirical covariance in (p₁, p₂)
const rng = createRng(1946);
for (const truth of TRUTHS) {
  truth.hats = [];
  for (let s = 0; s < SAMPLES; s++) {
    const counts = [0, 0, 0];
    for (let k = 0; k < N; k++) {
      const u = rng.uniform();
      counts[u < truth.p[0] ? 0 : u < truth.p[0] + truth.p[1] ? 1 : 2]++;
    }
    truth.hats.push(counts.map((c) => c / N));
  }
  const mean = [0, 1].map((i) => truth.hats.reduce((a, h) => a + h[i], 0) / SAMPLES);
  truth.cov = [0, 1].map((i) => [0, 1].map((j) => truth.hats.reduce((a, h) => a + (h[i] - mean[i]) * (h[j] - mean[j]), 0) / SAMPLES));
  truth.bound = simplexInverseFisher(truth.p).map((row) => row.map((v) => v / N));
  truth.ball = fisherBall(truth.p, 1 / Math.sqrt(N), 64);
}
const CR = frame({ x: 880, y: 262, w: 300, h: 150, u: [0, 1], v: [0, 0.003] });
const JP = frame({ x: 880, y: 560, w: 300, h: 170, u: [0, 1], v: [0, 3] });
const JPHI = frame({ x: 1260, y: 560, w: 260, h: 170, u: [0, Math.PI], v: [0, 3 / Math.PI * 3] });
const R = 850;

const CRAMER = tex(String.raw`\operatorname{Cov}_\theta\big[\hat\theta\big] \;\succeq\; \frac{1}{n}\, g(\theta)^{-1}`, 'Cov[θ̂] ⪰ g(θ)⁻¹ / n');
const JEFF = tex(String.raw`\pi_{\mathrm{J}}(\theta)\,d\theta \;\propto\; \sqrt{\det g(\theta)}\;d\theta`, 'π_J(θ) dθ ∝ √det g(θ) dθ');
const COIN_J = tex(String.raw`\pi_{\mathrm{J}}(p) = \frac{1}{\pi\sqrt{p(1-p)}},\qquad \pi_{\mathrm{J}}(\varphi) = \frac{1}{\pi}`, 'π_J(p) = 1/(π√(p(1−p))),  π_J(φ) = 1/π');

export default defineScene({
  name: 'What the ruler buys',
  duration: 70,
  narration: [
    [0, 'What does the ruler buy? First, resolution. Estimate a die from a hundred rolls, many times over, and the estimates scatter around the truth. The Cramér–Rao bound says no unbiased estimator scatters less than the inverse Fisher metric divided by n, and the sample frequencies attain it. The one-sigma cloud of estimates is exactly the Fisher ball of radius one over root n.'],
    [20, 'So the balls of the earlier scenes were pictures of estimation error: large where distributions are hard to tell apart, small where they are easy. The bound is an inequality between tensors: change coordinates and both sides transform together, which is why it holds in every parametrisation.'],
    [36, 'Second, a prior. Jeffreys asked for a prior that does not depend on the parametrisation, and the answer is the Riemannian volume of the Fisher metric, root det g. For the coin it is one over pi root p one minus p: piled up near zero and one in p, flat in the angle phi. For the die it is uniform on the sphere.'],
    [54, 'Resolution and volume are the metric read two ways. A ball of Fisher radius one over root n is what n observations can resolve, and the number of such balls that fit in a model is its Jeffreys volume: the complexity term of minimum description length.'],
  ],
  header: header(10, 'WHAT THE RULER BUYS', 'Cramér–Rao sets the resolution; Jeffreys measures the volume'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    drawTriangle(ctx, T, { alpha: on, labels: ['1', '2', '3'], sublabels: false });
    // the clouds of estimates, then the Fisher balls of radius 1/√n
    TRUTHS.forEach(({ p, tint, hats, ball }, i) => {
      const cloud = seg(t, 2 + 2.5 * i, 3.5 + 2.5 * i);
      const count = Math.floor(cloud * SAMPLES);
      ctx.save();
      ctx.globalAlpha *= on;
      for (let s = 0; s < count; s++) {
        const [x, y] = T.point(hats[s]);
        dot(ctx, x, y, 2.3, tint, 0.6);
      }
      ctx.restore();
      drawFisherBallOnTriangle(ctx, T, ball, { colour: tint, alpha: on * seg(t, 11 + 1.5 * i, 12 + 1.5 * i), width: 2, fill: 'rgba(0,0,0,0)' });
      drawSimplexPoint(ctx, T, p, { colour: color.ink, alpha: on, r: 3.5 });
    });
    text(ctx, `${SAMPLES} estimates p̂ = counts / ${N} per die, from seeded rolls`, T.x, T.y - 16, { ...type.note, alpha: on });
    text(ctx, `rings: the Fisher ball of radius 1/√n = ${fmt(1 / Math.sqrt(N), 2)} around each true die`, T.x, T.y + T.height + 44, { ...type.note, color: METRIC, alpha: seg(t, 11, 12) });
    // empirical against bound, for the first die
    const num = seg(t, 15, 16);
    const e = TRUTHS[0];
    text(ctx, `die 1: Cov(p̂₁, p̂₂) from the samples = [[${fmt(e.cov[0][0] * 1e3, 2)}, ${fmt(e.cov[0][1] * 1e3, 2)}], [·, ${fmt(e.cov[1][1] * 1e3, 2)}]] × 10⁻³`, T.x, T.y + T.height + 70, { font: font.mono, size: 13, color: P_COL, alpha: num });
    text(ctx, `bound g⁻¹/n = [[${fmt(e.bound[0][0] * 1e3, 2)}, ${fmt(e.bound[0][1] * 1e3, 2)}], [·, ${fmt(e.bound[1][1] * 1e3, 2)}]] × 10⁻³`, T.x, T.y + T.height + 92, { font: font.mono, size: 13, color: METRIC, alpha: num });

    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `n = ${N} rolls · ${SAMPLES} seeded repetitions · everything on screen is computed`);
  },
});

function drawNotes(ctx, t) {
  const cr = seg(t, 1, 2);
  pill(ctx, 'CRAMÉR–RAO', R, 200, METRIC, cr);
  CRAMER.draw(ctx, R + 160, 200, { size: 24, alpha: cr });
  // the coin: the bound p(1 − p)/n against p
  const plot = seg(t, 21, 22);
  if (plot > 0.003) {
    axes(ctx, CR, { xTicks: [0, 0.5, 1], yTicks: [0, 0.001, 0.002, 0.003], xLabel: 'p', alpha: plot, grid: true, format: (v) => (v < 1 && v > 0 ? v.toFixed(v < 0.01 ? 3 : 1) : String(v)) });
    drawCurve(ctx, CR, (p) => cramerRao(p, N), { colour: METRIC, alpha: plot, width: 2.5, n: 200 });
    text(ctx, 'Var(p̂) ≥ p(1 − p)/n for the coin; the sample proportion attains it', CR.x, CR.y - 12, { ...type.note, size: 13, alpha: plot });
    text(ctx, '1/(n g)', CR.X(0.5) + 8, CR.Y(cramerRao(0.5, N)) - 10, { font: font.mono, size: 13, color: METRIC, alpha: plot });
  }
  text(ctx, 'a tensor inequality: Cov[η̂] ⪰ J g⁻¹ Jᵀ/n in any other coordinates η(θ), J = ∂η/∂θ', R, 456, { ...type.note, size: 13, alpha: seg(t, 27, 28) });
  // Jeffreys
  const j = seg(t, 36.5, 37.5);
  pill(ctx, 'JEFFREYS PRIOR', R, 490, P_COL, j);
  JEFF.draw(ctx, R + 190, 490, { size: 24, alpha: j });
  const coin = seg(t, 42, 43);
  if (coin > 0.003) {
    axes(ctx, JP, { xTicks: [0, 0.5, 1], yTicks: [0, 1, 2, 3], xLabel: 'p', alpha: coin, grid: true });
    clipped(ctx, JP, () => drawCurve(ctx, JP, (p) => Math.min(3, jeffreys(p)), { colour: P_COL, alpha: coin, width: 2.5, u: [0.002, 0.998], n: 400 }));
    text(ctx, 'π_J(p): the Beta(½, ½) density', JP.x, JP.y - 12, { ...type.note, size: 13, color: P_COL, alpha: coin });
    axes(ctx, JPHI, { xTicks: [0, Math.PI / 2, Math.PI], yTicks: [0, 1 / Math.PI], xLabel: 'φ', alpha: coin, grid: true, format: (v) => (v === 0 ? '0' : Math.abs(v - Math.PI) < 1e-9 ? 'π' : Math.abs(v - Math.PI / 2) < 1e-9 ? 'π/2' : '1/π') });
    drawCurve(ctx, JPHI, () => 1 / Math.PI, { colour: P_COL, alpha: coin, width: 2.5, n: 2 });
    text(ctx, 'the same prior in φ = 2 arcsin √p: flat', JPHI.x, JPHI.y - 12, { ...type.note, size: 13, color: P_COL, alpha: coin });
  }
  COIN_J.draw(ctx, R, 790, { size: 21, alpha: seg(t, 44, 45) });
  text(ctx, 'for the die: ∝ 1/√(p₁p₂p₃), the Dirichlet(½, ½, ½), uniform on the octant of the sphere', R, 826, { ...type.note, size: 13, alpha: seg(t, 49, 50) });
  wrap(ctx, 'Volume in Fisher balls of radius 1/√n counts what n observations can resolve: the complexity term of MDL (Rissanen 1996; Balasubramanian 1997).', R, 850, 700, 18, { ...type.note, size: 12, color: color.body, alpha: seg(t, 58, 59) });
}
