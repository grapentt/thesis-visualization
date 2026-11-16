// Scene 01: a family of distributions is a space. Three families (coins, three-sided dice,
// Gaussians) with a moving point and the distribution it stands for; then the trouble with
// coordinates: the same two coins are 0.05 apart in p and either 0.20 or 1.30 apart in log-odds.

import { defineScene, seg, fade, text, wrap, type, font, color, tex, line, rgba, brace } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, DATA, header, frame, axes, triangle, drawTriangle, drawSimplexPoint, drawOutcomeBars, drawCurve, drawPoint, panel, exampleStamp, fmt } from '../shared.js';
import { gaussianPdf, logit, sigmoid } from '../math.js';

const COIN = frame({ x: 110, y: 330, w: 380, h: 1, u: [0, 1], v: [0, 1] });
const DIE = triangle({ x: 600, y: 250, size: 270 });
const GAUSS = frame({ x: 1090, y: 230, w: 420, h: 230, u: [-4, 4], v: [0, 2.6] });
const P_AXIS = frame({ x: 110, y: 640, w: 1400, h: 1, u: [0, 1], v: [0, 1] });
const X_AXIS = frame({ x: 110, y: 780, w: 1400, h: 1, u: [-4.6, 4.6], v: [0, 1] });
const PAIRS = [
  [0.5, 0.55],
  [0.02, 0.07],
];
const FAMILY = tex(String.raw`\{\,p_\theta : \theta \in \Theta\,\}`, '{ p_θ : θ ∈ Θ }');
const LOGODDS = tex(String.raw`x = \log\frac{p}{1-p}`, 'x = log p/(1−p)');

const coinAt = (t) => 0.5 + 0.42 * Math.sin((2 * Math.PI * t) / 14);
const dieAt = (t) => {
  const w = (2 * Math.PI * t) / 17;
  const a = 0.22 * Math.cos(w);
  const b = 0.22 * Math.sin(w);
  return [1 / 3 + a, 1 / 3 - 0.5 * a + 0.866 * b, 1 / 3 - 0.5 * a - 0.866 * b];
};
const gaussAt = (t) => [1.6 * Math.sin((2 * Math.PI * t) / 11), 1.3 + 0.9 * Math.sin((2 * Math.PI * t) / 7.3)];

export default defineScene({
  name: 'Distributions as points',
  duration: 62,
  narration: [
    [0, 'Start with three families. A coin with bias p: one number, so the family is an interval. A three-sided die: three probabilities that sum to one, a triangle. A Gaussian with mean mu and width sigma: a half-plane. Every point of these shapes is a whole probability distribution.'],
    [17, 'Move a point and the distribution moves with it. The coordinates are convenient labels, nothing more. We could label the same coins by their log-odds instead, and the interval would stretch to the whole line.'],
    [32, 'That is the problem. Two coins five hundredths apart in p are two tenths apart in log-odds near the middle, and one point three apart near the edge. Coordinates do not measure anything. A distance between distributions has to come from the distributions themselves.'],
    [49, "Information geometry's answer is a ruler built from distinguishability: how well can data tell two nearby distributions apart? That ruler is the Fisher metric, and the rest of this video follows it."],
  ],
  header: header(1, 'DISTRIBUTIONS AS POINTS', 'A family of distributions is a space; its parameters are coordinates'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    const p = coinAt(t);
    const q = dieAt(t);
    const [mu, sigma] = gaussAt(t);
    const insets = seg(t, 17, 18);

    // the coin: an interval
    text(ctx, 'COINS', COIN.x, 205, { ...type.eyebrow, size: 14, color: P_COL, alpha: on });
    text(ctx, 'bias p ∈ [0, 1]: an interval', COIN.x, 232, { ...type.note, alpha: on });
    axes(ctx, { ...COIN, h: 0, Y: () => COIN.y, y: COIN.y }, { xTicks: [0, 0.5, 1], alpha: on });
    drawPoint(ctx, COIN, [p, 0], { colour: P_COL, alpha: on, r: 8, label: `p = ${fmt(p)}`, labelOffset: [-28, -22] });
    drawOutcomeBars(ctx, { x: COIN.x + 100, y: 395, w: 180, h: 95, values: [p, 1 - p], labels: ['heads', 'tails'], colours: P_COL, alpha: on * insets, title: 'the coin at p' });

    // the die: a triangle
    text(ctx, 'THREE-SIDED DICE', DIE.x, 205, { ...type.eyebrow, size: 14, color: P_COL, alpha: on });
    text(ctx, '(p₁, p₂, p₃), Σ pᵢ = 1: a triangle', DIE.x, 232, { ...type.note, alpha: on });
    drawTriangle(ctx, DIE, { alpha: on, labels: ['e₁', 'e₂', 'e₃'], sublabels: false });
    drawSimplexPoint(ctx, DIE, q, { colour: P_COL, alpha: on, r: 8 });
    drawOutcomeBars(ctx, { x: DIE.x + 300, y: 395, w: 130, h: 95, values: q, labels: ['1', '2', '3'], colours: P_COL, alpha: on * insets, title: 'the die at p' });

    // the Gaussian: a half-plane
    text(ctx, 'GAUSSIANS', GAUSS.x, 205, { ...type.eyebrow, size: 14, color: P_COL, alpha: on });
    text(ctx, '(μ, σ), σ > 0: a half-plane', GAUSS.x, 232, { ...type.note, alpha: on });
    const H = frame({ x: GAUSS.x, y: 250, w: 180, h: 150, u: [-3, 3], v: [0, 2.5] });
    axes(ctx, H, { xTicks: [-2, 0, 2], yTicks: [1, 2], xLabel: 'μ', yLabel: 'σ', alpha: on, grid: true });
    drawPoint(ctx, H, [mu, sigma], { colour: P_COL, alpha: on, r: 8 });
    const B = frame({ x: GAUSS.x + 230, y: 290, w: 260, h: 110, u: [-4, 4], v: [0, 0.85] });
    ctx.save();
    ctx.globalAlpha *= on * insets;
    line(ctx, B.x, B.Y(0), B.x + B.w, B.Y(0), { color: color.line });
    drawCurve(ctx, B, (x) => gaussianPdf(x, mu, sigma), { colour: P_COL, width: 2.2, fill: rgba(P_COL, 0.15), n: 200 });
    text(ctx, 'the Gaussian at (μ, σ)', B.x, B.y - 12, { ...type.note });
    ctx.restore();

    FAMILY.draw(ctx, 110, 540, { size: 26, alpha: seg(t, 3, 4) });
    text(ctx, 'a statistical manifold: one point per distribution, θ its coordinates', 300, 546, { ...type.note, alpha: seg(t, 4, 5) });

    drawCoordinates(ctx, t, p);
    exampleStamp(ctx, seg(t, 2, 3));
  },
});

/** The same coins in p and in log-odds: the two pairs 0.05 apart in p. */
function drawCoordinates(ctx, t, p) {
  const on = seg(t, 19, 20);
  if (on <= 0.003) return;
  const wrapOn = seg(t, 33, 34);
  text(ctx, 'the same coins, labelled by p', P_AXIS.x + P_AXIS.w, P_AXIS.y - 36, { ...type.note, color: P_COL, alpha: on, align: 'right' });
  axes(ctx, { ...P_AXIS, h: 0 }, { xTicks: [0, 0.25, 0.5, 0.75, 1], alpha: on });
  LOGODDS.draw(ctx, X_AXIS.x + X_AXIS.w, X_AXIS.y + 60, { size: 24, alpha: on, align: 'right' });
  text(ctx, 'the same coins, labelled by their log-odds x', X_AXIS.x + X_AXIS.w, X_AXIS.y - 36, { ...type.note, color: Q_COL, alpha: on, align: 'right' });
  axes(ctx, { ...X_AXIS, h: 0 }, { xTicks: [-4, -2, 0, 2, 4], alpha: on });
  // threads from p to x for a few coins, and the moving coin
  ctx.save();
  ctx.globalAlpha *= on;
  for (const c of [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98]) {
    line(ctx, P_AXIS.X(c), P_AXIS.y, X_AXIS.X(logit(c)), X_AXIS.y, { color: color.dim, width: 1, alpha: 0.5 });
  }
  line(ctx, P_AXIS.X(p), P_AXIS.y, X_AXIS.X(logit(p)), X_AXIS.y, { color: P_COL, width: 1.5, alpha: 0.9 });
  drawPoint(ctx, P_AXIS, [p, 0], { colour: P_COL, r: 6 });
  drawPoint(ctx, X_AXIS, [logit(p), 0], { colour: P_COL, r: 6 });
  ctx.restore();
  // the two pairs
  PAIRS.forEach(([a, b], i) => {
    const pa = seg(t, 34 + 5 * i, 35 + 5 * i) * on;
    if (pa <= 0.003) return;
    const tint = i === 0 ? METRIC : KL_FOR_PAIR;
    for (const c of [a, b]) {
      drawPoint(ctx, P_AXIS, [c, 0], { colour: tint, alpha: pa, r: 5 });
      drawPoint(ctx, X_AXIS, [logit(c), 0], { colour: tint, alpha: pa, r: 5 });
      line(ctx, P_AXIS.X(c), P_AXIS.y, X_AXIS.X(logit(c)), X_AXIS.y, { color: tint, width: 1.2, alpha: 0.8 * pa });
    }
    brace(ctx, P_AXIS.X(a), P_AXIS.X(b), P_AXIS.y - 14, -1, tint, pa);
    text(ctx, `Δp = ${fmt(b - a)}`, (P_AXIS.X(a) + P_AXIS.X(b)) / 2, P_AXIS.y - 50 - (i === 1 ? 0 : 0), { font: font.mono, size: 15, color: tint, align: 'center', alpha: pa });
    brace(ctx, X_AXIS.X(logit(a)), X_AXIS.X(logit(b)), X_AXIS.y + 14, 1, tint, pa);
    text(ctx, `Δx = ${fmt(logit(b) - logit(a))}`, (X_AXIS.X(logit(a)) + X_AXIS.X(logit(b))) / 2, X_AXIS.y + 62, { font: font.mono, size: 15, color: tint, align: 'center', alpha: pa });
  });
  const verdict = seg(t, 44, 45);
  text(ctx, 'same Δp, different Δx: a coordinate difference is not a distance', 110, 860, { ...type.body, size: 20, color: color.ink, alpha: verdict });
  const answer = seg(t, 50, 51);
  text(ctx, '→ measure distance by distinguishability: the Fisher metric', 760, 860, { ...type.body, size: 20, color: METRIC, alpha: answer });
}

const KL_FOR_PAIR = '#f497c0';
