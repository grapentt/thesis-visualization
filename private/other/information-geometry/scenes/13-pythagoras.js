// Scene 13: Pythagoras for KL. The Bregman divergence of ψ is KL (arguments swapped); when the
// mixture segment p→q meets the exponential arc q→r at a right angle in the Fisher metric,
// KL(p‖r) = KL(p‖q) + KL(q‖r); KL(p‖·) along the exponential arc is minimised at the foot q (the
// m-projection, hence maximum likelihood); EM alternates an e- and an m-projection.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, EXP, KL_COL, header, frame, axes, triangle, drawTriangle, drawSimplexPoint, drawSimplexPath, drawFisherBallOnTriangle, drawPath, drawPoint, drawCurve, clipped, readout, exampleStamp, fmt, pill, panel } from '../shared.js';
import { kl, pythagoreanTriple, mixtureGeodesic, exponentialGeodesic, fisherInner, mTangent, eTangent, fisherBall, bregman, naturalParams } from '../math.js';

const T = triangle({ x: 140, y: 240, size: 440 });
const { p: P, q: Q, r: Rr } = pythagoreanTriple([1 / 3, 1 / 3, 1 / 3], [0.6, 0.3, 0.1], 0.12);
const M_SEG = Array.from({ length: 41 }, (_, i) => mixtureGeodesic(P, Q, i / 40));
const E_SEG = Array.from({ length: 41 }, (_, i) => exponentialGeodesic(Q, Rr, i / 40));
const E_LINE = Array.from({ length: 121 }, (_, i) => exponentialGeodesic(Q, Rr, -1.4 + (3.2 * i) / 120));
const KL_PQ = kl(P, Q);
const KL_QR = kl(Q, Rr);
const KL_PR = kl(P, Rr);
const ORTHO = fisherInner(Q, mTangent(Q, P), eTangent(Q, Rr));
const PLOT = frame({ x: 880, y: 560, w: 330, h: 170, u: [-1.4, 1.8], v: [0, 0.8] });
const R = 850;

const BREG = tex(String.raw`B_\psi(\theta_a, \theta_b) = \psi(\theta_a) - \psi(\theta_b) - \langle\nabla\psi(\theta_b),\, \theta_a - \theta_b\rangle = \mathrm{KL}(p_b\,\|\,p_a)`, 'B_ψ(θ_a, θ_b) = ψ(θ_a) − ψ(θ_b) − ⟨∇ψ(θ_b), θ_a − θ_b⟩ = KL(p_b ‖ p_a)');
const PYTH = tex(String.raw`\mathrm{KL}(p\,\|\,r) = \mathrm{KL}(p\,\|\,q) + \mathrm{KL}(q\,\|\,r)\quad\text{when}\quad \langle \dot\gamma_m, \dot\gamma_e\rangle_g = 0 \text{ at } q`, 'KL(p‖r) = KL(p‖q) + KL(q‖r) when ⟨γ̇_m, γ̇_e⟩_g = 0 at q');
const PROJ = tex(String.raw`q = \arg\min_{x \in E}\ \mathrm{KL}(p\,\|\,x)\quad\text{for an e-flat } E:\ \text{the m-projection, unique}`, 'q = argmin_{x∈E} KL(p‖x) for e-flat E: the m-projection');
const MLE = tex(String.raw`\hat\theta_{\mathrm{ML}} = \arg\min_\theta \mathrm{KL}(\hat p_{\mathrm{data}}\,\|\,p_\theta)`, 'θ̂_ML = argmin_θ KL(p̂_data ‖ p_θ)');

export default defineScene({
  name: 'Pythagoras for KL',
  duration: 74,
  narration: [
    [0, 'Legendre duality gives a divergence for free: the Bregman divergence of psi, the gap between psi and its tangent plane. For an exponential family it is the KL divergence with the arguments swapped. It is not symmetric and not a distance, but to second order it is one half of the Fisher metric, as we saw.'],
    [16, 'And it obeys a Pythagorean theorem. Take a mixture segment from p to q and an exponential arc from q to r that meet at a right angle at q, measured by the Fisher metric. Then KL of p from r equals KL of p from q plus KL of q from r. With numbers: point one two four plus point two four zero equals point three six four.'],
    [34, 'The consequence is a projection theorem. Extend the exponential arc into a whole e-flat line and plot KL from p along it: it is minimised exactly at the foot q of the perpendicular. Minimising KL from a fixed p over an exponential family is an m-projection, unique by convexity. Maximum likelihood is this projection, of the empirical distribution onto the model.'],
    [52, 'The EM algorithm is two such projections alternating: an e-projection of the current model onto the data manifold, which computes the posterior over the hidden variables, then an m-projection back onto the model, which maximises the complete-data likelihood. Each step is the foot of a perpendicular, and KL never increases.'],
    [66, 'So the geometry has two flat charts and a Pythagoras between them.'],
  ],
  header: header(13, 'PYTHAGORAS FOR KL', 'Bregman divergences, projections, and EM'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    drawTriangle(ctx, T, { alpha: on, labels: ['1', '2', '3'], sublabels: false });
    const tri = seg(t, 17, 18);
    // the e-flat line through q and r, then the two legs
    drawSimplexPath(ctx, T, E_LINE, { colour: EXP, alpha: seg(t, 36, 37) * 0.7, width: 1.4, dash: [5, 5] });
    drawSimplexPath(ctx, T, M_SEG, { colour: MIX, alpha: tri, width: 2.6, progress: lin(t, 17, 19) });
    drawSimplexPath(ctx, T, E_SEG, { colour: EXP, alpha: tri, width: 2.6, progress: lin(t, 19, 21) });
    // the right angle at q: the Fisher ball and the two tangents, normalised in the Fisher norm
    const ang = seg(t, 21, 22);
    drawFisherBallOnTriangle(ctx, T, fisherBall(Q, 0.12, 48), { alpha: ang, width: 1.4 });
    const u = mTangent(Q, P);
    const v = eTangent(Q, Rr);
    const nu = Math.sqrt(fisherInner(Q, u, u));
    const nv = Math.sqrt(fisherInner(Q, v, v));
    const eps = 0.07;
    const cornerA = Q.map((x, i) => x + (eps * u[i]) / nu);
    const cornerB = Q.map((x, i) => x + (eps * v[i]) / nv);
    const cornerAB = Q.map((x, i) => x + (eps * u[i]) / nu + (eps * v[i]) / nv);
    drawSimplexPath(ctx, T, [cornerA, cornerAB, cornerB], { colour: METRIC, alpha: ang, width: 1.6 });
    drawSimplexPoint(ctx, T, P, { colour: P_COL, alpha: on, r: 7, label: 'p', labelOffset: [-26, -6] });
    drawSimplexPoint(ctx, T, Q, { colour: Q_COL, alpha: on, r: 7, label: 'q', labelOffset: [-26, 26] });
    drawSimplexPoint(ctx, T, Rr, { colour: KL_COL, alpha: on, r: 7, label: 'r', labelOffset: [14, 20] });
    // the moving point along the e-line, for the projection plot
    const proj = seg(t, 37, 38);
    if (proj > 0.003) {
      const s = -1.4 + 3.2 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (t - 37)) / 10));
      const x = exponentialGeodesic(Q, Rr, s);
      drawSimplexPoint(ctx, T, x, { colour: EXP, alpha: proj, r: 5, halo: true });
      drawSimplexPath(ctx, T, Array.from({ length: 21 }, (_, i) => mixtureGeodesic(P, x, i / 20)), { colour: MIX, alpha: 0.6 * proj, width: 1.2, dash: [3, 4] });
    }
    text(ctx, 'orange: mixture segment p → q · green: exponential arc q → r · lavender: a Fisher ball at q', T.x, T.y + T.height + 44, { font: font.mono, size: 13, color: color.muted, alpha: tri });
    readout(ctx, '⟨γ̇_m, γ̇_e⟩_g at q =', ORTHO, T.x, T.y + T.height + 72, { colour: METRIC, alpha: ang, digits: 3 });
    text(ctx, 'the small square is a right angle in the Fisher metric (it only looks skew in the triangle)', T.x, T.y + T.height + 96, { font: font.mono, size: 12, color: color.muted, alpha: ang });

    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `q = (⅓, ⅓, ⅓) · r = (0.6, 0.3, 0.1) · p chosen so that the angle at q is right · everything on screen is computed`);
  },
});

function drawNotes(ctx, t) {
  BREG.draw(ctx, R, 225, { size: 18, alpha: seg(t, 1, 2) });
  text(ctx, 'the gap between ψ and its tangent plane at θ_b; swapped arguments: B_ψ(θ_p, θ_q) = KL(q ‖ p)', R, 262, { ...type.note, size: 12, alpha: seg(t, 4, 5) });
  readout(ctx, 'B_ψ(θ_p, θ_q) =', bregman(naturalParams(P), naturalParams(Q)), R, 290, { colour: KL_COL, alpha: seg(t, 7, 8), digits: 3, size: 14 });
  readout(ctx, 'KL(q ‖ p) =', kl(Q, P), R + 230, 290, { colour: KL_COL, alpha: seg(t, 7, 8), digits: 3, size: 14 });
  const py = seg(t, 17, 18);
  pill(ctx, 'GENERALISED PYTHAGOREAN THEOREM', R, 340, METRIC, py);
  PYTH.draw(ctx, R, 384, { size: 19, alpha: py });
  const nums = seg(t, 26, 27);
  text(ctx, `KL(p ‖ q) = ${fmt(KL_PQ, 3)}`, R, 428, { font: font.mono, size: 17, color: MIX, alpha: nums });
  text(ctx, `+  KL(q ‖ r) = ${fmt(KL_QR, 3)}`, R + 200, 428, { font: font.mono, size: 17, color: EXP, alpha: nums });
  text(ctx, `=  KL(p ‖ r) = ${fmt(KL_PR, 3)}`, R + 430, 428, { font: font.mono, size: 17, color: KL_COL, alpha: nums });
  text(ctx, `(check: ${fmt(KL_PQ + KL_QR, 6)} = ${fmt(KL_PR, 6)})`, R, 454, { font: font.mono, size: 12, color: color.muted, alpha: nums });
  // projection
  const pr = seg(t, 35, 36);
  pill(ctx, 'PROJECTION THEOREM', R, 500, EXP, pr);
  PROJ.draw(ctx, R + 230, 500, { size: 17, alpha: pr });
  if (pr > 0.003) {
    axes(ctx, PLOT, { xTicks: [-1, 0, 1], yTicks: [0, 0.4, 0.8], xLabel: 's', alpha: pr, grid: true });
    text(ctx, 'KL(p ‖ x(s)) along the e-line x(s) ∝ q^{1−s} r^{s}', PLOT.x, PLOT.y - 12, { ...type.note, size: 12, color: EXP, alpha: pr });
    clipped(ctx, PLOT, () => drawCurve(ctx, PLOT, (s) => kl(P, exponentialGeodesic(Q, Rr, s)), { colour: KL_COL, alpha: pr, width: 2.4, n: 160, progress: lin(t, 36, 39) }));
    drawPoint(ctx, PLOT, [0, KL_PQ], { colour: Q_COL, alpha: seg(t, 39, 40), r: 5, label: 'q', labelOffset: [8, -8] });
    drawPoint(ctx, PLOT, [1, KL_PR], { colour: KL_COL, alpha: seg(t, 39, 40), r: 4, label: 'r', labelOffset: [8, -8] });
    const s = -1.4 + 3.2 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (t - 37)) / 10));
    drawPoint(ctx, PLOT, [s, kl(P, exponentialGeodesic(Q, Rr, s))], { colour: EXP, alpha: seg(t, 37, 38), r: 4 });
  }
  MLE.draw(ctx, R + 360, 600, { size: 18, alpha: seg(t, 46, 47) });
  text(ctx, 'maximum likelihood = the m-projection', R + 360, 632, { ...type.note, size: 12, color: EXP, alpha: seg(t, 47, 48) });
  text(ctx, 'of the empirical distribution onto the model', R + 360, 650, { ...type.note, size: 12, color: EXP, alpha: seg(t, 47, 48) });
  // EM as alternating projections
  const em = seg(t, 52.5, 53.5);
  if (em > 0.003) drawEM(ctx, t, em);
}

/** A schematic: the data manifold D (m-flat) and the model manifold M (e-flat), with the zigzag of projections. */
function drawEM(ctx, t, alpha) {
  const x0 = R + 360;
  const y0 = 656;
  const w = 330;
  const h = 140;
  panel(ctx, x0, y0, w, h, { alpha });
  const D = (u) => [x0 + 30 + u * (w - 60), y0 + 40 + 18 * Math.sin(3 * u)];
  const M = (u) => [x0 + 30 + u * (w - 60), y0 + h - 40 - 22 * Math.sin(2.5 * u + 1)];
  const curve = (f, tint) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const [x, y] = f(i / 40);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };
  curve(D, MIX);
  curve(M, EXP);
  text(ctx, 'data manifold D (m-flat)', x0 + 30, y0 + 24, { font: font.mono, size: 12, color: MIX, alpha });
  text(ctx, 'model manifold M (e-flat)', x0 + 30, y0 + h - 12, { font: font.mono, size: 12, color: EXP, alpha });
  // the zigzag: start on M at u = 0.1, e-project to D, m-project to M, …
  const us = [0.1, 0.1, 0.32, 0.32, 0.5, 0.5, 0.64, 0.64, 0.74];
  let prev = M(us[0]);
  for (let k = 1; k < us.length; k++) {
    const onD = k % 2 === 1;
    const next = onD ? D(us[k]) : M(us[k]);
    const a = alpha * seg(t, 53 + 1.2 * k, 53.8 + 1.2 * k);
    arrow(ctx, prev[0], prev[1], next[0], next[1], { color: onD ? EXP : MIX, width: 1.8, head: 8, alpha: a });
    prev = next;
  }
  wrap(ctx, 'green: e-step, e-projection onto D (the posterior) · orange: m-step, m-projection onto M (the complete-data MLE)', x0, y0 + h + 20, w, 15, { font: font.mono, size: 11, color: color.muted, alpha: alpha * seg(t, 58, 59) });
  text(ctx, 'Csiszár & Tusnády 1984; Amari 1995', x0, y0 + h + 66, { font: font.mono, size: 11, color: color.dim, alpha: alpha * seg(t, 58, 59) });
}
