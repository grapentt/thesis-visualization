// Scene 14: end to end. Five cards, each a small computed picture with its formula, retell the
// argument: distinguishability as a metric, the sphere in the simplex, the hyperbolic plane of
// Gaussians, invariance and what the ruler buys, and the two flat charts with their Pythagoras.

import { defineScene, seg, lin, text, wrap, type, font, color, tex, line, dot, rgba, roundRect } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, EXP, KL_COL, header, frame, drawPmf, drawPath, drawCurve, triangle, drawTriangle, drawSimplexPath, drawFisherBallOnTriangle, drawSimplexPoint, clipped } from '../shared.js';
import { binomialPmfs, bernoulliFromAngle, distinguishableGrid, fisherBall, fisherRaoGeodesic, mixtureGeodesic, exponentialGeodesic, gaussianGeodesic, fisherCircle, pythagoreanTriple, descend } from '../math.js';

const CARDS = [
  { tint: METRIC, tag: 'DISTINGUISHABILITY', formula: tex(String.raw`g_{ij} = \mathbb E\big[\partial_i \ell\, \partial_j \ell\big]`, 'g_ij = E[∂ᵢℓ ∂ⱼℓ]'), gloss: 'the Fisher metric: how well n samples tell two distributions apart; KL ≈ ½ g δ²' },
  { tint: Q_COL, tag: 'THE SPHERE', formula: tex(String.raw`d_{\mathrm{FR}} = 2\arccos\textstyle\sum_i\sqrt{p_i q_i}`, 'd_FR = 2 arccos Σ √(pᵢqᵢ)'), gloss: 'p ↦ 2√p: the simplex is an octant of a sphere; distance is an angle, Jeffreys is uniform' },
  { tint: P_COL, tag: 'THE HYPERBOLIC PLANE', formula: tex(String.raw`ds^2 = \frac{d\mu^2 + 2\,d\sigma^2}{\sigma^2}`, 'ds² = (dμ² + 2dσ²)/σ²'), gloss: 'Gaussians: curvature −½, geodesics widen before they move; Cramér–Rao and the natural gradient read this metric' },
  { tint: KL_COL, tag: 'INVARIANCE', formula: tex(String.raw`g = c\cdot g_{\mathrm{Fisher}}`, 'g = c · g_Fisher'), gloss: 'Chentsov: the only metric that coarse-graining cannot inflate and relabelling cannot change' },
  { tint: EXP, tag: 'TWO FLAT CHARTS', formula: tex(String.raw`\mathrm{KL}(p\|r) = \mathrm{KL}(p\|q) + \mathrm{KL}(q\|r)`, 'KL(p‖r) = KL(p‖q) + KL(q‖r)'), gloss: 'θ and η, Legendre dual; e- and m-geodesics; a Pythagoras for KL, projections, EM' },
];
const CARD_W = 280;
const GAP = 20;
const CARD_Y = 190;
const CARD_H = 392;

const REFERENCES = [
  'Rao 1945 · Information and the accuracy attainable in the estimation of statistical parameters',
  'Jeffreys 1946 · An invariant form for the prior probability in estimation problems',
  'Chentsov 1972 · Statistical decision rules and optimal inference (Engl. transl. 1982)',
  'Wootters 1981 · Statistical distance and Hilbert space',
  'Amari 1998 · Natural gradient works efficiently in learning',
  'Amari & Nagaoka 2000 · Methods of information geometry',
  'Amari 2016 · Information geometry and its applications',
  'Ay, Jost, Lê & Schwachhöfer 2017 · Information geometry',
  'Nielsen 2020 · An elementary introduction to information geometry (Entropy)',
];

// the small pictures
const PMFS = [binomialPmfs(100, 0.5), binomialPmfs(100, 0.55)];
const BALLS = [[1 / 3, 1 / 3, 1 / 3], [0.72, 0.14, 0.14], [0.1, 0.1, 0.8], [0.4, 0.5, 0.1]].map((c) => fisherBall(c, 0.16, 40));
const GEO = Array.from({ length: 41 }, (_, i) => fisherRaoGeodesic([0.65, 0.2, 0.15], [0.1, 0.3, 0.6], i / 40));
const GGEO = gaussianGeodesic([-3, 0.5], [3, 0.5], 48);
const NG = descend([3, 0.5], [0, 1], { eta: 0.3, steps: 20, method: 'natural' });
const TRIPLE = pythagoreanTriple([1 / 3, 1 / 3, 1 / 3], [0.6, 0.3, 0.1], 0.12);
const GRID = distinguishableGrid(100);

export default defineScene({
  name: 'End to end',
  duration: 58,
  narration: [
    [0, 'So, end to end. Distances between distributions come from distinguishability, and the local exchange rate between a parameter step and evidence is the Fisher metric: the variance of the score, the curvature of the likelihood, the quadratic part of KL.'],
    [12, 'On the simplex that metric is the round metric of a sphere, reached by taking square roots, so distance is an angle and the Jeffreys prior is uniform.'],
    [22, 'On the Gaussians it is a hyperbolic plane, where geodesics widen before they move; the same metric sets the resolution of estimation and defines the natural gradient.'],
    [33, 'It is the only metric that is invariant under relabelling and never inflated by coarse-graining: Chentsov\'s theorem.'],
    [42, 'And beneath it lie two flat charts, natural and expectation parameters, Legendre dual, whose straight lines meet at right angles in a Pythagorean theorem for KL. Distributions as points, distinguishability as distance: that is the geometry of information.'],
  ],
  header: header(14, 'END TO END', 'Distributions as points, distinguishability as distance'),

  draw(ctx, t) {
    CARDS.forEach((card, k) => {
      const a = seg(t, 0.5 + 9.5 * k, 1.5 + 9.5 * k);
      if (a <= 0.003) return;
      const x = 60 + k * (CARD_W + GAP);
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = 'rgba(17,24,40,0.92)';
      roundRect(ctx, x, CARD_Y, CARD_W, CARD_H, 14);
      ctx.fill();
      ctx.strokeStyle = rgba(card.tint, 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, card.tag, x + 20, CARD_Y + 30, { font: font.mono, size: 13, weight: 500, color: card.tint, tracking: 2 });
      [drawDistinguishCard, drawSphereCard, drawHyperbolicCard, drawInvarianceCard, drawDualCard][k](ctx, x + 40, CARD_Y + 50, 200, t - (0.5 + 9.5 * k), card.tint);
      card.formula.draw(ctx, x + CARD_W / 2, CARD_Y + 282, { size: 19, align: 'center' });
      wrap(ctx, card.gloss, x + 20, CARD_Y + 318, CARD_W - 40, 18, { ...type.note, size: 12.5, color: color.body });
      ctx.restore();
    });

    const s = seg(t, 46, 47);
    wrap(ctx, 'Distributions are points; the Fisher metric measures how well data tell neighbours apart; it is a sphere on the simplex and a hyperbolic plane on the Gaussians; it is the only invariant ruler; it sets the resolution of estimation and the direction of the natural gradient; and beneath it two flat, Legendre-dual charts give KL a Pythagorean theorem.', 60, 630, 1480, 30, {
      ...type.body,
      size: 21,
      color: color.ink,
      alpha: s,
      chars: Math.floor(lin(t, 46, 54) * 400),
    });

    const r = seg(t, 48, 49);
    line(ctx, 60, 730, 1540, 730, { width: 1, alpha: 0.6 * r });
    text(ctx, 'REFERENCES', 60, 758, { ...type.eyebrow, size: 13, alpha: r });
    REFERENCES.forEach((ref, k) => {
      const col = k < 5 ? 0 : 1;
      text(ctx, ref, 60 + col * 760, 786 + (k % 5) * 24, { font: font.mono, size: 12, color: color.muted, alpha: r * seg(t, 48.5 + 0.3 * k, 49 + 0.3 * k) });
    });
  },
});

/** Two overlapping binomial count distributions. */
function drawDistinguishCard(ctx, x, y, size, t, tint) {
  const F = frame({ x, y: y + 20, w: size, h: size - 60, u: [25, 80], v: [0, 0.1] });
  drawPmf(ctx, F, PMFS[0], { colour: rgba(P_COL, 0.7), from: 25, to: 80 });
  drawPmf(ctx, F, PMFS[1], { colour: rgba(Q_COL, 0.6), from: 25, to: 80 });
  line(ctx, F.x, F.Y(0), F.x + F.w, F.Y(0), { color: color.line });
  text(ctx, 'p = 0.50 and 0.55, 100 flips', x, y + size - 8, { font: font.mono, size: 11, color: color.muted });
  frameBox(ctx, x, y, size);
}

/** The quarter circle with the distinguishable coins. */
function drawSphereCard(ctx, x, y, size, t, tint) {
  const cx = x + 20;
  const cy = y + size - 20;
  const r = size - 40;
  ctx.save();
  ctx.strokeStyle = METRIC;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, 0);
  ctx.stroke();
  line(ctx, cx, cy, cx + r + 10, cy, { color: color.line });
  line(ctx, cx, cy, cx, cy - r - 10, { color: color.line });
  for (const c of GRID) {
    const px = cx + r * Math.sqrt(c);
    const py = cy - r * Math.sqrt(1 - c);
    const ux = (px - cx) / r;
    const uy = (py - cy) / r;
    line(ctx, px - 4 * ux, py - 4 * uy, px + 4 * ux, py + 4 * uy, { color: METRIC, width: 1.2 });
  }
  ctx.restore();
  text(ctx, '31 coins per 100 flips, on the arc', x, y + size - 8, { font: font.mono, size: 11, color: color.muted });
  frameBox(ctx, x, y, size);
}

/** The half-plane with the geodesic and the natural-gradient path. */
function drawHyperbolicCard(ctx, x, y, size, t, tint) {
  const F = frame({ x, y: y + 10, w: size, h: size - 40, u: [-4, 4], v: [0, 3.2] });
  clipped(ctx, F, () => {
    for (const mu of [-3, 0, 3]) for (const sigma of [0.5, 1.3, 2.4]) drawPath(ctx, F, fisherCircle([mu, sigma], 0.3), { colour: METRIC, alpha: 0.4, width: 1, close: true });
    drawPath(ctx, F, GGEO, { colour: METRIC, width: 2.2, progress: seg(t, 1, 3) });
    drawPath(ctx, F, NG, { colour: KL_COL, width: 1.6, dash: [3, 3], progress: seg(t, 2, 4) });
  });
  line(ctx, F.x, F.Y(0), F.x + F.w, F.Y(0), { color: color.line });
  text(ctx, 'geodesic and natural gradient', x, y + size - 8, { font: font.mono, size: 11, color: color.muted });
  frameBox(ctx, x, y, size);
}

/** The triangle with Fisher balls and the geodesic. */
function drawInvarianceCard(ctx, x, y, size, t, tint) {
  const T = triangle({ x: x + 10, y: y + 20, size: size - 20 });
  drawTriangle(ctx, T, { labels: ['', '', ''], sublabels: false, barycentre: 0 });
  BALLS.forEach((b) => drawFisherBallOnTriangle(ctx, T, b, { width: 1.2 }));
  drawSimplexPath(ctx, T, GEO, { colour: METRIC, width: 2, progress: seg(t, 1, 3) });
  text(ctx, 'equal balls: the Jeffreys volume', x, y + size - 8, { font: font.mono, size: 11, color: color.muted });
  frameBox(ctx, x, y, size);
}

/** The Pythagorean triangle on the simplex. */
function drawDualCard(ctx, x, y, size, t, tint) {
  const T = triangle({ x: x + 10, y: y + 20, size: size - 20 });
  drawTriangle(ctx, T, { labels: ['', '', ''], sublabels: false, barycentre: 0 });
  const { p, q, r } = TRIPLE;
  drawSimplexPath(ctx, T, Array.from({ length: 21 }, (_, i) => mixtureGeodesic(p, q, i / 20)), { colour: MIX, width: 2, progress: seg(t, 1, 2) });
  drawSimplexPath(ctx, T, Array.from({ length: 21 }, (_, i) => exponentialGeodesic(q, r, i / 20)), { colour: EXP, width: 2, progress: seg(t, 2, 3) });
  drawSimplexPoint(ctx, T, p, { colour: P_COL, r: 4 });
  drawSimplexPoint(ctx, T, q, { colour: Q_COL, r: 4 });
  drawSimplexPoint(ctx, T, r, { colour: KL_COL, r: 4 });
  text(ctx, 'm-segment ⟂ e-arc at q', x, y + size - 8, { font: font.mono, size: 11, color: color.muted });
  frameBox(ctx, x, y, size);
}

function frameBox(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}
