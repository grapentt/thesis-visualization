// Scene 03: the same Δp = 0.05 is hard to see near p = ½ and easy to see near p = 0. Both pairs of
// count hills on one shared axis (same scale), with zooms below; the step measured in standard
// deviations; and the exchange rate between a coordinate step and evidence, the Fisher information.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, header, frame, axes, drawPmf, drawPath, drawCurve, drawPoint, readout, exampleStamp, fmt, caption, pill, clipped } from '../shared.js';
import { binomialPmfs, bernoulliFisher, separationInSd, sum } from '../math.js';

const N = 100;
const SF = frame({ x: 110, y: 200, w: 640, h: 240, u: [-0.5, 100.5], v: [0, 0.3] });
const PAIRS = [
  { p: 0.5, q: 0.55, Z: frame({ x: 110, y: 560, w: 300, h: 160, u: [25, 80], v: [0, 0.1] }), ticks: [30, 40, 50, 60, 70, 80], zoom: 'zoom: counts 25 to 80' },
  { p: 0.02, q: 0.07, Z: frame({ x: 450, y: 560, w: 300, h: 160, u: [-0.5, 20.5], v: [0, 0.3] }), ticks: [0, 5, 10, 15, 20], zoom: 'zoom: counts 0 to 20' },
].map((pair) => {
  const a = binomialPmfs(N, pair.p);
  const b = binomialPmfs(N, pair.q);
  const sd = (p) => Math.sqrt(N * p * (1 - p));
  return { ...pair, a, b, overlap: sum(a.map((v, k) => Math.min(v, b[k]))), sdA: sd(pair.p), sdB: sd(pair.q), sep: separationInSd(pair.p, pair.q, N) };
});
const R = 850;
const GPLOT = frame({ x: R + 60, y: 620, w: 520, h: 170, u: [0, 1], v: [0, 60] });

const STEP = tex(String.raw`\frac{\text{step in heads}}{\text{sd of the count}} = \frac{n\,\Delta p}{\sqrt{n\,p(1-p)}} = \sqrt{n}\;\frac{\Delta p}{\sqrt{p(1-p)}}`, 'step/sd = nΔp/√(n p(1−p)) = √n Δp/√(p(1−p))');
const FISHER = tex(String.raw`g(p) = \frac{1}{p\,(1-p)}`, 'g(p) = 1 / (p(1−p))');
const SDS = tex(String.raw`\#\,\text{standard deviations} \;\approx\; \sqrt{n\, g(p)}\;\Delta p`, '# sd ≈ √(n g(p)) Δp');

export default defineScene({
  name: 'Distinguishability',
  duration: 123,
  narration: [
    [0, 'Now compare coins. Two coins near the middle, p equal point five and point five five, a hundred flips each. On the same axis as before, here are their two count hills: both wide, five heads apart, overlapping almost entirely. A hundred flips can barely tell these coins apart.'],
    [23, 'Two coins near the edge, p equal point oh two and point oh seven. The same step of five hundredths, the same hundred flips, the same axis. These hills are narrow, so the same five heads of separation leaves them almost disjoint: two heads against seven, visible at a glance. The two zooms below show each pair in detail, each at its own magnification.'],
    [50, 'Measure the step in units of the hills\' own width, the standard deviation. Near the middle the width is five heads, so the step is one standard deviation. Near the edge the width is about two heads, so the same step is about two and a half. The same coordinate step buys very different amounts of evidence, and the exchange rate depends on where you stand.'],
    [77, 'That exchange rate is the Fisher information. Divide the step in heads by the width of the hill: n delta p over root n p one minus p, which is root n times delta p over root p one minus p. The factor that depends on the coin, one over p one minus p, is g of p: four in the middle, fifty-one near the edge. It is the local ruler of the family. The number of standard deviations between two nearby coins after n flips is root n g times delta p.'],
    [113, 'A ruler that changes from place to place is exactly what a Riemannian metric is. Next: what this ruler is made of.'],
  ],
  header: header(3, 'DISTINGUISHABILITY', 'The same Δp is hard to see in the middle and easy to see at the edge'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    axes(ctx, SF, { xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 0.1, 0.2, 0.3], xLabel: 'heads in 100 flips', alpha: on, grid: true });
    caption(ctx, SF, 'both pairs on one axis, at one scale', on, { color: color.muted });
    PAIRS.forEach((pair, i) => drawPairShared(ctx, t, pair, i));
    PAIRS.forEach((pair, i) => drawZoom(ctx, t, pair, i));
    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `n = ${N} flips · binomial counts · everything on screen is computed`);
  },
});

/** One pair in the shared frame: two hills, the overlap, labels. */
function drawPairShared(ctx, t, { p, q, a, b, overlap }, i) {
  const t0 = i === 0 ? 0 : 23;
  const aOn = seg(t, t0 + 1.5, t0 + 2.5);
  const bOn = seg(t, t0 + 5, t0 + 6);
  const ov = seg(t, t0 + 9, t0 + 10);
  if (aOn <= 0.003) return;
  clipped(ctx, SF, () => {
    if (ov > 0.003) drawPmf(ctx, SF, a.map((v, k) => Math.min(v, b[k])), { colour: rgba(color.ink, 0.35), alpha: ov });
    drawPmf(ctx, SF, a, { colour: rgba(P_COL, 0.75), alpha: aOn * (1 - 0.35 * ov) });
    drawPmf(ctx, SF, b, { colour: rgba(Q_COL, 0.75), alpha: bOn * (1 - 0.35 * ov) });
    drawPath(ctx, SF, a.map((v, k) => [k, v]), { colour: P_COL, alpha: aOn * ov, width: 1.6 });
    drawPath(ctx, SF, b.map((v, k) => [k, v]), { colour: Q_COL, alpha: bOn * ov, width: 1.6 });
  });
  const top = Math.max(...a);
  const yl = SF.Y(top) - 14;
  text(ctx, `p = ${fmt(p)}`, SF.X(N * p) - (i === 0 ? 6 : 0), i === 0 ? yl : SF.y + 20, { font: font.mono, size: 14, color: P_COL, align: i === 0 ? 'right' : 'left', alpha: aOn });
  text(ctx, `q = ${fmt(q)}`, SF.X(N * q) + 6, i === 0 ? yl : SF.y + 40, { font: font.mono, size: 14, color: Q_COL, alpha: bOn });
  text(ctx, `overlap ${fmt(overlap)}`, SF.X(N * (p + q) / 2) + (i === 0 ? 0 : 60), SF.Y(0) - (i === 0 ? 110 : 160), { font: font.mono, size: 13, color: color.ink, align: 'center', alpha: ov });
}

/** The zoom of one pair, with its step in standard deviations. */
function drawZoom(ctx, t, { p, q, Z, ticks, a, b, sdA, sdB, sep, zoom }, i) {
  const on = seg(t, 38, 39);
  if (on <= 0.003) return;
  axes(ctx, Z, { xTicks: ticks, yTicks: [], alpha: on });
  text(ctx, zoom, Z.x, Z.y - 12, { ...type.note, size: 13, color: color.muted, alpha: on });
  clipped(ctx, Z, () => {
    drawPmf(ctx, Z, a.map((v, k) => Math.min(v, b[k])), { colour: rgba(color.ink, 0.35), alpha: on, from: Math.ceil(Z.u[0]), to: Math.floor(Z.u[1]) });
    drawPmf(ctx, Z, a, { colour: rgba(P_COL, 0.55), alpha: on, from: Math.ceil(Z.u[0]), to: Math.floor(Z.u[1]) });
    drawPmf(ctx, Z, b, { colour: rgba(Q_COL, 0.55), alpha: on, from: Math.ceil(Z.u[0]), to: Math.floor(Z.u[1]) });
    drawPath(ctx, Z, a.map((v, k) => [k, v]).filter(([k]) => k >= Z.u[0] && k <= Z.u[1]), { colour: P_COL, alpha: on, width: 1.5 });
    drawPath(ctx, Z, b.map((v, k) => [k, v]).filter(([k]) => k >= Z.u[0] && k <= Z.u[1]), { colour: Q_COL, alpha: on, width: 1.5 });
  });
  // the step, in standard deviations
  const sd = seg(t, 52 + 6 * i, 53 + 6 * i);
  if (sd > 0.003) {
    const y = Z.y + Z.h + 50;
    arrow(ctx, Z.X(N * p), y, Z.X(N * q), y, { color: METRIC, width: 2.5, head: 10, alpha: sd });
    line(ctx, Z.X(N * p), Z.y + Z.h, Z.X(N * p), y + 6, { color: P_COL, width: 1, dash: [3, 4], alpha: 0.7 * sd });
    line(ctx, Z.X(N * q), Z.y + Z.h, Z.X(N * q), y + 6, { color: Q_COL, width: 1, dash: [3, 4], alpha: 0.7 * sd });
    text(ctx, `5 heads = ${fmt(sep, 1)} sd`, Z.X(N * q) + 14, y + 5, { font: font.mono, size: 14, color: METRIC, alpha: sd });
    text(ctx, `sd of the count: ${fmt(sdA, 1)} and ${fmt(sdB, 1)}`, Z.x, y + 28, { font: font.mono, size: 12, color: color.muted, alpha: sd });
  }
}

/** The right-hand column: the step in standard deviations, the derivation, the Fisher information. */
function drawNotes(ctx, t) {
  const intro = fade(t, 51, 52, 113, 114);
  wrap(ctx, 'How many standard deviations of evidence does one step Δp buy? That depends on p.', R, 230, 650, 30, { ...type.body, size: 22, alpha: intro });
  const rows = [
    ['near p = 0.50', 'width 5.0 heads', P_COL],
    ['near p = 0.02', 'width ≈ 2 heads', Q_COL],
  ];
  rows.forEach(([label, width, tint], i) => {
    const a = fade(t, 53 + 6 * i, 54 + 6 * i, 113, 114);
    text(ctx, label, R, 300 + 34 * i, { font: font.mono, size: 16, color: tint, alpha: a });
    text(ctx, width, R + 180, 300 + 34 * i, { font: font.mono, size: 16, color: color.body, alpha: a });
    text(ctx, `Δp = 0.05  →  ${fmt(PAIRS[i].sep, 1)} sd`, R + 380, 300 + 34 * i, { font: font.mono, size: 16, color: METRIC, alpha: a });
  });
  STEP.draw(ctx, R, 400, { size: 22, alpha: seg(t, 66, 67) });
  text(ctx, 'the only part that depends on the coin is 1/√(p(1 − p))', R, 440, { ...type.note, size: 13, alpha: seg(t, 70, 71) });
  const g = seg(t, 79, 80);
  pill(ctx, 'THE FISHER INFORMATION OF ONE FLIP', R, 486, METRIC, g);
  FISHER.draw(ctx, R, 540, { size: 30, alpha: g });
  readout(ctx, 'g(0.50) =', bernoulliFisher(0.5), R + 260, 534, { colour: P_COL, alpha: seg(t, 84, 85), digits: 0 });
  readout(ctx, 'g(0.02) =', bernoulliFisher(0.02), R + 420, 534, { colour: Q_COL, alpha: seg(t, 85, 86), digits: 0 });
  text(ctx, 'squared, so that n flips carry n times g', R + 260, 560, { ...type.note, size: 12, alpha: seg(t, 86, 87) });
  const plot = seg(t, 88, 89);
  if (plot > 0.003) {
    axes(ctx, GPLOT, { xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: [0, 20, 40, 60], xLabel: 'p', alpha: plot, grid: true });
    text(ctx, 'g(p)', GPLOT.x - 12, GPLOT.y - 14, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', alpha: plot });
    drawCurve(ctx, GPLOT, (p) => Math.min(60, bernoulliFisher(p)), { colour: METRIC, width: 2.5, n: 400, u: [0.005, 0.995], alpha: plot, progress: lin(t, 88.5, 92) });
    const mark = seg(t, 92, 93) * plot;
    drawPoint(ctx, GPLOT, [0.5, 4], { colour: P_COL, alpha: mark, r: 6, label: '4', labelOffset: [10, -8] });
    drawPoint(ctx, GPLOT, [0.02, 51], { colour: Q_COL, alpha: mark, r: 6, label: '51', labelOffset: [12, 6] });
    drawPoint(ctx, GPLOT, [0.07, bernoulliFisher(0.07)], { colour: Q_COL, alpha: mark, r: 4 });
  }
  SDS.draw(ctx, R, 826, { size: 23, alpha: seg(t, 100, 101) });
  text(ctx, 'to first order in Δp; the exact count is √n × the Fisher–Rao distance (scene 06)', R, 860, { ...type.note, size: 12, alpha: seg(t, 104, 105) });
  const closing = seg(t, 113.5, 114.5);
  wrap(ctx, 'A ruler that changes from place to place: a Riemannian metric on the family.', R, 230, 650, 30, { ...type.body, size: 22, color: METRIC, alpha: closing });
}
