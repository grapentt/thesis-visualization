// Scene 12: two kinds of straight lines. Mixtures (straight in p), exponential arcs (straight in
// log p) and the Fisher–Rao geodesic between them; the simplex as an exponential family with natural
// parameters θ and mean parameters η = p, Legendre dual, g = ∇²ψ; Amari's dual flat connections.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, EXP, header, frame, axes, triangle, drawTriangle, drawSimplexPoint, drawSimplexPath, drawPath, drawPoint, clipped, readout, exampleStamp, fmt, pill } from '../shared.js';
import { fisherRaoGeodesic, mixtureGeodesic, exponentialGeodesic, naturalParams, logPartition, meanParams, simplexInverseFisher, entropy } from '../math.js';

const T = triangle({ x: 140, y: 240, size: 440 });
const TH = frame({ x: 880, y: 225, w: 250, h: 250, u: [-3.2, 3.2], v: [-3.2, 3.2] });
const P = [0.62, 0.23, 0.15];
const Q = [0.1, 0.32, 0.58];
const N = 60;
const CURVES = [
  { key: 'm', label: 'mixture (m-geodesic): (1 − s) p + s q', tint: MIX, pts: Array.from({ length: N + 1 }, (_, i) => mixtureGeodesic(P, Q, i / N)), at: 2 },
  { key: 'e', label: 'exponential arc (e-geodesic): ∝ p^{1−s} q^{s}', tint: EXP, pts: Array.from({ length: N + 1 }, (_, i) => exponentialGeodesic(P, Q, i / N)), at: 7 },
  { key: 'fr', label: 'Fisher–Rao geodesic: the great circle', tint: METRIC, pts: Array.from({ length: N + 1 }, (_, i) => fisherRaoGeodesic(P, Q, i / N)), at: 12 },
];
// a grid of the triangle (p_i constant), to show how the θ chart bends it
const GRIDLINES = [];
for (const c of [0.1, 0.3, 0.5, 0.7]) {
  for (const i of [0, 1, 2]) {
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const a = 0.004 + ((1 - c - 0.008) * k) / 40;
      const p = [0, 0, 0];
      p[i] = c;
      p[(i + 1) % 3] = a;
      p[(i + 2) % 3] = 1 - c - a;
      pts.push(p);
    }
    GRIDLINES.push(pts);
  }
}
const R = 850;

const FAMILY = tex(String.raw`p_\theta(i) = \exp\big(\theta_i - \psi(\theta)\big),\quad \theta_3 = 0,\quad \psi(\theta) = \log\!\big(1 + e^{\theta_1} + e^{\theta_2}\big)`, 'p_θ(i) = exp(θᵢ − ψ(θ)), θ₃ = 0, ψ = log(1 + e^{θ₁} + e^{θ₂})');
const LEGENDRE = tex(String.raw`\eta = \nabla\psi(\theta) = (p_1, p_2),\qquad \theta = \nabla\varphi(\eta),\qquad \varphi(\eta) = \textstyle\sum_i p_i \log p_i = -H`, 'η = ∇ψ(θ) = (p₁, p₂), θ = ∇φ(η), φ(η) = Σ pᵢ log pᵢ = −H');
const HESS = tex(String.raw`g_{ij}(\theta) = \partial_i\partial_j\psi = \operatorname{Cov}[T],\qquad g^{ij}(\eta) = \partial^i\partial^j\varphi`, 'g_ij(θ) = ∂ᵢ∂ⱼψ = Cov[T],  gⁱʲ(η) = ∂ⁱ∂ʲφ');
const DUAL = tex(String.raw`X\,g(Y,Z) = g\big(\nabla^{(e)}_X Y, Z\big) + g\big(Y, \nabla^{(m)}_X Z\big)`, 'X g(Y, Z) = g(∇ᵉ_X Y, Z) + g(Y, ∇ᵐ_X Z)');
const ALPHA = tex(String.raw`\nabla^{(\alpha)} = \tfrac{1+\alpha}{2}\nabla^{(e)} + \tfrac{1-\alpha}{2}\nabla^{(m)},\qquad \nabla^{(0)} = \text{Levi-Civita}`, '∇^(α) = ((1+α)/2) ∇ᵉ + ((1−α)/2) ∇ᵐ, ∇⁽⁰⁾ = Levi-Civita');

export default defineScene({
  name: 'Two kinds of straight lines',
  duration: 84,
  narration: [
    [0, 'There is more structure than the metric. On the simplex two other kinds of line are natural. Mixtures: the straight segment from p to q, with weights one minus s and s. Exponential arcs: straight in log probabilities, the geometric mixtures p to the one minus s times q to the s, renormalised. And between them the Fisher–Rao geodesic, the great circle.'],
    [18, 'Each kind is straight in its own chart. Write the die as an exponential family: natural parameters theta, the log-odds against the third face, and log-partition psi. In the theta plane the exponential arcs are straight and the mixtures bend. In the probability triangle, the mean parameters eta, it is the other way round.'],
    [36, 'The two charts are Legendre dual. Eta is the gradient of psi; theta is the gradient of the dual potential phi, which is minus the entropy; and the Fisher metric is the Hessian of either, g in theta, its inverse in eta. That is why, for an exponential family, the Fisher metric is the covariance of the sufficient statistic.'],
    [54, 'Amari\'s reading: the two kinds of straight line are geodesics of two flat connections, e and m, dual with respect to the Fisher metric: the derivative of an inner product splits into an e-derivative of one factor and an m-derivative of the other. Their average is the Levi-Civita connection of the sphere, which is curved. That is a dually flat space, and Chentsov\'s twin theorem makes these connections, with the alpha-family between them, the only invariant ones.'],
    [74, 'Three kinds of straight line, one metric, and a duality between two charts. The payoff is a Pythagorean theorem for KL.'],
  ],
  header: header(12, 'TWO KINDS OF STRAIGHT LINES', 'Mixtures, exponential arcs, and the Fisher metric between them'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    drawTriangle(ctx, T, { alpha: on, labels: ['1', '2', '3'], sublabels: false });
    text(ctx, 'the η chart: probabilities (p₁, p₂)', T.x, T.y - 16, { ...type.note, color: MIX, alpha: seg(t, 19, 20) });
    CURVES.forEach((c) => drawSimplexPath(ctx, T, c.pts, { colour: c.tint, alpha: on * seg(t, c.at, c.at + 0.5), width: c.key === 'fr' ? 3 : 2.4, progress: lin(t, c.at, c.at + 3) }));
    drawSimplexPoint(ctx, T, P, { colour: P_COL, alpha: on, r: 7, label: 'p', labelOffset: [-26, 8] });
    drawSimplexPoint(ctx, T, Q, { colour: Q_COL, alpha: on, r: 7, label: 'q', labelOffset: [14, -8] });
    CURVES.forEach((c, k) => text(ctx, c.label, T.x, T.y + T.height + 44 + 24 * k, { font: font.mono, size: 14, color: c.tint, alpha: seg(t, c.at + 0.5, c.at + 1.5) }));

    drawThetaChart(ctx, t);
    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `p = (${P.join(', ')}) · q = (${Q.join(', ')}) · everything on screen is computed`);
  },
});

/** The θ chart: the same triangle and the same three curves in the natural parameters. */
function drawThetaChart(ctx, t) {
  const on = seg(t, 19, 20);
  if (on <= 0.003) return;
  axes(ctx, TH, { xTicks: [-2, 0, 2], yTicks: [-2, 0, 2], xLabel: 'θ₁', yLabel: 'θ₂', alpha: on, grid: false, box: true });
  text(ctx, 'the θ chart: log-odds against face 3', TH.x, TH.y - 16, { ...type.note, color: EXP, alpha: on });
  clipped(ctx, TH, () => {
    for (const g of GRIDLINES) drawPath(ctx, TH, g.map(naturalParams), { colour: color.line, alpha: 0.8 * on, width: 1 });
    CURVES.forEach((c) => drawPath(ctx, TH, c.pts.map(naturalParams), { colour: c.tint, alpha: on * seg(t, 20 + 2 * CURVES.indexOf(c), 21 + 2 * CURVES.indexOf(c)), width: c.key === 'fr' ? 3 : 2.4 }));
  });
  drawPoint(ctx, TH, naturalParams(P), { colour: P_COL, alpha: on, r: 6, label: 'p', labelOffset: [10, -8] });
  drawPoint(ctx, TH, naturalParams(Q), { colour: Q_COL, alpha: on, r: 6, label: 'q', labelOffset: [-22, -8] });
  drawPoint(ctx, TH, [0, 0], { colour: color.muted, alpha: on, r: 3 });
  wrap(ctx, 'grey: the lines pᵢ = 0.1, 0.3, 0.5, 0.7 of the triangle; its edges are at infinity', TH.x + TH.w + 40, TH.y + 30, 380, 18, { font: font.mono, size: 12, color: color.muted, alpha: on });
  text(ctx, 'straight here: the exponential arcs', TH.x + TH.w + 40, TH.y + 90, { font: font.mono, size: 12, color: EXP, alpha: seg(t, 26, 27) });
  text(ctx, 'bent here: the mixtures', TH.x + TH.w + 40, TH.y + 112, { font: font.mono, size: 12, color: MIX, alpha: seg(t, 28, 29) });
}

function drawNotes(ctx, t) {
  const fam = seg(t, 20, 21);
  FAMILY.draw(ctx, R, 556, { size: 19, alpha: fam });
  LEGENDRE.draw(ctx, R, 602, { size: 19, alpha: seg(t, 37, 38) });
  HESS.draw(ctx, R, 646, { size: 20, alpha: seg(t, 44, 45) });
  const thP = naturalParams(P);
  readout(ctx, 'at p: θ =', `(${fmt(thP[0])}, ${fmt(thP[1])})`, R, 684, { colour: EXP, alpha: seg(t, 22, 23), size: 14 });
  readout(ctx, 'ψ(θ) =', logPartition(thP), R + 240, 684, { colour: color.body, alpha: seg(t, 22, 23), size: 14 });
  readout(ctx, 'φ(η) = −H(p) =', -entropy(P), R + 400, 684, { colour: MIX, alpha: seg(t, 40, 41), size: 14, digits: 3 });
  const C = simplexInverseFisher(P);
  text(ctx, `∇²ψ at p = [[${fmt(C[0][0], 3)}, ${fmt(C[0][1], 3)}], [${fmt(C[1][0], 3)}, ${fmt(C[1][1], 3)}]] = Cov of the face indicators = g⁻¹ of scene 07`, R, 710, { font: font.mono, size: 12, color: METRIC, alpha: seg(t, 47, 48) });
  // dual connections
  const d = seg(t, 54.5, 55.5);
  pill(ctx, 'DUAL FLAT CONNECTIONS · AMARI', R, 752, METRIC, d);
  DUAL.draw(ctx, R, 792, { size: 20, alpha: d });
  ALPHA.draw(ctx, R, 834, { size: 17, alpha: seg(t, 64, 65) });
  text(ctx, 'e- and m-flat, Levi-Civita curved: dually flat; the α-connections are the only invariant ones', R, 868, { font: font.mono, size: 12, color: color.muted, alpha: seg(t, 60, 61) });
}
