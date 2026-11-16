import { defineScene, seg, fade, lerp, text, wrap, type, font, color, tex, line, dot, rgba, camera } from '../../../kit.js';
import { INTER, SCORE_W, SCORE_P, TRIMER_MOL, tagCard, ideaTag, drawMol, drawHalo, drawHBond } from '../shared.js';
import { threeBody, TRIMER } from '../data.js';
import { centroid } from '../toy.js';

const RIGHT = 860;

// beats (scene-local seconds)
const NOISE_IN = [10.8, 12.3]; // clean trimer → noisy trimer, bells rise
const COPIES = [21.5, 23]; // the two pair models' copies of the middle point
const MERGE = [26.5, 28]; // … fuse into the one shared copy
const CURVE = 28.5;
const BARS = [32, 36]; // bars grow, one after another
const SMALL = 37.5; // "three percent at the smallest noise"
const PEAK = 41.5; // "up to about four fifths …"
const WIDTH = 43.5; // "… at about twice the width of the well"
const REUSE = 47;

const LHS = tex(String.raw`W_t(z) = \mathbb E\Big[\prod_{i<j} w_{ij}\,\Big|\,z\Big]`, 'Wₜ(z) = E[∏ wᵢⱼ | z]');
const NEQ = tex(String.raw`\neq`, '≠');
const RHS = tex(String.raw`\prod_{i<j}\mathbb E\big[w_{ij}\mid z_i,z_j\big]`, '∏ E[wᵢⱼ | zᵢ, zⱼ]');
const LIMIT = tex(String.raw`t\to 0:\ W_t\to w = \prod_{i<j} w_{ij}`, 't → 0: Wₜ → w = ∏ wᵢⱼ');
const POSTERIOR = tex(String.raw`x_i \mid z_i \sim \mathcal N(a z_i,\, \sigma^2),\quad a = \sqrt{1-\sigma^2}`, 'xᵢ | zᵢ ~ N(a zᵢ, σ²),  a = √(1 − σ²)');

// ---- the number line: three point molecules ----------------------------------------------------

const LINE = { x0: 80, x1: 800, y: 392, range: 2.5 };
const lineX = (v) => lerp(LINE.x0, LINE.x1, (v + LINE.range) / (2 * LINE.range));
const LEGEND = { font: font.sans, size: 16, color: color.muted }; // sans: subscript digits in the mono face are tiny
const BELL_PX = 36; // px per unit of density
const { bells, curve, shares, wellWidth } = threeBody;
const CLEAN = [-1, 0, 1];
const gaussian = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
const OUTER = [0, 2].map((i) => {
  const m = bells.means[i];
  const x = Array.from({ length: 121 }, (_, k) => m - 4 * bells.sigma + (8 * bells.sigma * k) / 120);
  return { x, p: x.map((v) => gaussian(v, m, bells.sigma)) };
});

export default defineScene({
  name: 'Many-body',
  duration: 60,
  narration: [
    [0, 'One catch remains. Suppose the physics is purely pairwise. Is the noisy interaction then a sum of pair terms, learned on dimers?'],
    [10.5, 'No. Given a noisy cluster, each molecule\'s clean position is uncertain, and that uncertainty is shared by every pair it belongs to.'],
    [21, 'Each pair model reweights its own copy of the middle molecule; the truth has only one copy, reweighted by both partners at once.'],
    [31.5, 'In a toy of three points on a line, the three-body part is three percent at the smallest noise, and up to about four fifths at about twice the width of the well.'],
    [46.5, 'Hydrogen-bond wells are a few tenths of an ångström wide; the noise runs to several. So dimer models compose exactly only at small noise.'],
  ],
  header: { eyebrow: '16 · MANY-BODY', title: 'Noise turns pairs into triples' },

  draw(ctx, t) {
    drawLine(ctx, t);
    drawCurve(ctx, t, seg(t, CURVE, CURVE + 1));
    drawQuestion(ctx, t);
    drawFormula(ctx, t, seg(t, NOISE_IN[0], NOISE_IN[0] + 1));
    drawBars(ctx, t, seg(t, BARS[0] - 0.5, BARS[0] + 0.3));
    drawReuse(ctx, t, seg(t, REUSE, REUSE + 0.8));
  },
});

/** A density on the number line, sitting on it: filled (reference) or outlined (reweighted copies). */
function bell(ctx, xs, ps, { fill = null, stroke = null, alpha = 1, width = 2.5 }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  let started = false;
  xs.forEach((x, k) => {
    if (!fill && ps[k] < 0.02) return; // outlines skip the tails lying on the line
    const sx = lineX(x), sy = LINE.y - BELL_PX * ps[k];
    started ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
    started = true;
  });
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

/** Orange arc over the line between two points: the pair weight w_ij. */
function wellArc(ctx, from, to, height, label, alpha) {
  if (alpha <= 0.003) return;
  const a = lineX(from), b = lineX(to), mid = (a + b) / 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = INTER;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(a, LINE.y - 14);
  ctx.quadraticCurveTo(mid, LINE.y - 14 - 2 * height, b, LINE.y - 14);
  ctx.stroke();
  ctx.restore();
  const inside = height < 40; // short arcs carry their label underneath, the long one above
  text(ctx, label, mid, inside ? LINE.y - 20 : LINE.y - 22 - height, { font: font.sans, size: 19, color: INTER, align: 'center', alpha });
}

/** Top left: three point molecules, their pair wells, then the noisy trimer's bells and the middle point's copies. */
function drawLine(ctx, t) {
  const on = seg(t, 0.5, 1.3);
  text(ctx, 'three point molecules', LINE.x0, 222, { ...type.note, color: color.ink, alpha: on });
  text(ctx, `each pair: a narrow well at distance 1, width ${wellWidth}`, LINE.x0, 244, { ...type.note, color: INTER, alpha: fade(t, 1.5, 2.3, 20, 20.8) });
  line(ctx, LINE.x0, LINE.y, LINE.x1, LINE.y, { color: color.line, width: 1.5, alpha: on });
  for (let v = -2; v <= 2; v++) {
    line(ctx, lineX(v), LINE.y, lineX(v), LINE.y + 6, { color: color.line, alpha: on });
    text(ctx, v < 0 ? `−${-v}` : `${v}`, lineX(v), LINE.y + 30, { ...type.note, align: 'center', alpha: on });
  }

  // clean trimer and its pair wells
  const wells = fade(t, 2.5, 3.5, NOISE_IN[0] - 0.3, NOISE_IN[0] + 0.5);
  wellArc(ctx, -1, 0, 30, 'w₁₂', wells);
  wellArc(ctx, 0, 1, 30, 'w₂₃', wells);
  wellArc(ctx, -1, 1, 78, 'w₁₃', wells);

  // noise: the points move to the noisy trimer, each wearing its reference bell
  const s = seg(t, ...NOISE_IN);
  const noisy = seg(t, NOISE_IN[1] - 0.2, NOISE_IN[1] + 0.8);
  text(ctx, `σ = ${bells.sigma}`, LINE.x1, 222, { font: font.mono, size: 18, color: color.ink, align: 'right', alpha: noisy });
  const muted = rgba(color.muted, 0.35);
  OUTER.forEach(({ x, p }) => bell(ctx, x, p, { fill: muted, alpha: s }));
  bell(ctx, bells.x, bells.reference, { fill: muted, alpha: s });
  text(ctx, 'the reference’s cloud', lineX(0), 300, { ...type.note, color: color.body, align: 'center', alpha: fade(t, NOISE_IN[1], NOISE_IN[1] + 0.8, COPIES[0] - 1, COPIES[0]) });

  // the two pair models' copies of the middle point, fusing into the one shared copy
  const copies = seg(t, ...COPIES);
  const m = seg(t, ...MERGE);
  const by12 = bells.by12.map((v, k) => lerp(v, bells.both[k], m));
  const by23 = bells.by23.map((v, k) => lerp(v, bells.both[k], m));
  bell(ctx, bells.x, by12, { stroke: INTER, alpha: copies * seg(t, COPIES[0], COPIES[0] + 0.6) });
  bell(ctx, bells.x, by23, { stroke: INTER, alpha: copies * seg(t, COPIES[0] + 1, COPIES[0] + 1.6) });
  bell(ctx, bells.x, bells.both, { fill: rgba(INTER, 0.18), alpha: seg(t, MERGE[1] - 0.4, MERGE[1]) });

  const top = (ps, k) => LINE.y - BELL_PX * ps[k];
  const pairs = fade(t, COPIES[0] + 0.4, COPIES[0] + 1.2, MERGE[0], MERGE[0] + 0.6);
  const left = { x: lineX(-0.55), y: 300 }, right = { x: lineX(0.55), y: 300 };
  text(ctx, 'reweighted by w₁₂', left.x, left.y, { ...LEGEND, color: INTER, align: 'right', alpha: pairs });
  line(ctx, left.x + 4, left.y + 4, lineX(bells.x[62]) - 3, top(bells.by12, 62) + 2, { color: INTER, width: 1.2, alpha: 0.7 * pairs });
  text(ctx, 'reweighted by w₂₃', right.x, right.y, { ...LEGEND, color: INTER, alpha: pairs * seg(t, COPIES[0] + 1, COPIES[0] + 1.6) });
  line(ctx, right.x - 4, right.y + 4, lineX(bells.x[98]) + 3, top(bells.by23, 98) + 2, { color: INTER, width: 1.2, alpha: 0.7 * pairs * seg(t, COPIES[0] + 1, COPIES[0] + 1.6) });
  text(ctx, 'pair models: one copy each', lineX(0), 262, { ...type.note, color: color.ink, align: 'center', alpha: fade(t, COPIES[1], COPIES[1] + 0.8, MERGE[0], MERGE[0] + 0.6) });
  const one = seg(t, MERGE[0] + 0.6, MERGE[0] + 1.4);
  text(ctx, 'reweighted by both at once', lineX(0), 274, { ...type.note, color: INTER, align: 'center', alpha: one });
  text(ctx, 'the truth: one shared copy', lineX(0), 250, { ...type.note, color: color.ink, align: 'center', alpha: one });

  // the points: clean, then noisy
  CLEAN.forEach((v, i) => {
    const x = lineX(lerp(v, bells.z[i], s));
    dot(ctx, x, LINE.y, 11, color.ink, on);
    text(ctx, `${i + 1}`, x, LINE.y + 1, { font: font.mono, size: 15, weight: 600, color: color.bg, align: 'center', baseline: 'middle', alpha: on });
  });
}

/** Middle left: at σ = 0.2, −log W₃ against the sum of the pair models, the gap shaded. */
const PLOT = { x: 150, y: 466, w: 600, h: 118, d: [0.6, 1.6], v: [-4.5, -1] };
const px = (d) => PLOT.x + ((d - PLOT.d[0]) / (PLOT.d[1] - PLOT.d[0])) * PLOT.w;
const py = (v) => PLOT.y + PLOT.h - ((v - PLOT.v[0]) / (PLOT.v[1] - PLOT.v[0])) * PLOT.h;

function drawCurve(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const { x, y, w, h } = PLOT;
  text(ctx, `σ = ${curve.sigma}, noisy points at −d, 0, d (dotted: the trimer above)`, x, 448, { ...type.note, color: color.body, alpha });
  line(ctx, x, y, x, y + h, { color: color.line, alpha });
  line(ctx, x, y + h, x + w, y + h, { color: color.line, alpha });
  for (const v of [-4, -3, -2, -1]) {
    line(ctx, x - 6, py(v), x, py(v), { color: color.line, alpha });
    text(ctx, `−${-v}`, x - 10, py(v), { ...type.note, align: 'right', baseline: 'middle', alpha });
  }
  for (const d of [0.6, 0.8, 1, 1.2, 1.4, 1.6]) {
    line(ctx, px(d), y + h, px(d), y + h + 6, { color: color.line, alpha });
    text(ctx, d.toFixed(1), px(d), y + h + 22, { ...type.note, align: 'center', alpha });
  }
  text(ctx, 'd', x + w + 14, y + h + 5, { ...type.math, size: 22, color: color.body, alpha });
  line(ctx, px(bells.z[2]), y + 30, px(bells.z[2]), y + h, { color: color.ink, width: 1.2, dash: [2, 4], alpha: 0.6 * alpha });

  // gap between the curves: the three-body part
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = rgba(INTER, 0.2);
  ctx.beginPath();
  curve.d.forEach((d, k) => (k ? ctx.lineTo(px(d), py(curve.three[k])) : ctx.moveTo(px(d), py(curve.three[k]))));
  for (let k = curve.d.length - 1; k >= 0; k--) ctx.lineTo(px(curve.d[k]), py(curve.pairs[k]));
  ctx.closePath();
  ctx.fill();
  const path = (vals) => {
    ctx.beginPath();
    curve.d.forEach((d, k) => (k ? ctx.lineTo(px(d), py(vals[k])) : ctx.moveTo(px(d), py(vals[k]))));
    ctx.stroke();
  };
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = color.muted;
  ctx.setLineDash([7, 6]);
  path(curve.pairs);
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INTER;
  path(curve.three);
  ctx.restore();

  // legend (top left, where the curves are low) and the gap's label
  line(ctx, x + 14, y + 10, x + 44, y + 10, { color: INTER, width: 3, alpha });
  text(ctx, '−log W₃ (the truth)', x + 52, y + 16, { ...LEGEND, color: INTER, alpha });
  line(ctx, x + 14, y + 32, x + 44, y + 32, { color: color.muted, width: 2.2, dash: [7, 6], alpha });
  text(ctx, 'Σ −log W of the three pair models', x + 52, y + 38, { ...LEGEND, alpha });
  const k = curve.d.findIndex((d) => d >= 1.42);
  const gap = { x: px(curve.d[k]), y: (py(curve.three[k]) + py(curve.pairs[k])) / 2 };
  text(ctx, 'three-body part', px(1.36), y + 20, { ...type.note, color: INTER, align: 'right', alpha });
  line(ctx, px(1.36) + 4, y + 18, gap.x - 4, gap.y - 4, { color: INTER, width: 1.2, alpha: 0.7 * alpha });
}

// ---- right column -----------------------------------------------------------------------------

/** 0–10.5: the question, in words. */
function drawQuestion(ctx, t) {
  const a = fade(t, 1.5, 2.3, 10, 10.8);
  text(ctx, 'physics purely pairwise:  w = w₁₂ · w₁₃ · w₂₃', RIGHT, 250, { ...type.body, color: color.ink, alpha: a });
  wrap(ctx, 'is the noisy interaction then a sum of pair terms, each learned on dimers?', RIGHT, 300, 620, 30, { ...type.body, alpha: a * seg(t, 5, 5.8) });
}

/** 10.5 →: the noisy weight is not a product of pair models; it is at t → 0. Notes on the bells until the bars arrive. */
function drawFormula(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const size = 30, y = 236;
  const wl = LHS.metrics(size).width, wn = NEQ.metrics(size).width, gap = 16;
  LHS.draw(ctx, RIGHT, y, { size, alpha });
  NEQ.draw(ctx, RIGHT + wl + gap, y, { size, alpha });
  const xr = RIGHT + wl + wn + 2 * gap;
  RHS.draw(ctx, xr, y, { size, alpha });
  const labels = alpha * seg(t, NOISE_IN[0] + 2.5, NOISE_IN[0] + 3.3);
  text(ctx, 'the truth', RIGHT + wl / 2, 284, { ...type.note, color: INTER, align: 'center', alpha: labels });
  text(ctx, 'product of pair models', xr + RHS.metrics(size).width / 2, 284, { ...type.note, align: 'center', alpha: labels });
  LIMIT.draw(ctx, RIGHT, 324, { size: 26, alpha: alpha * seg(t, NOISE_IN[0] + 4, NOISE_IN[0] + 4.8) });

  const notes = fade(t, NOISE_IN[1], NOISE_IN[1] + 0.8, BARS[0] - 1.2, BARS[0] - 0.4);
  const body = { ...type.body, size: 20 };
  wrap(ctx, 'a noisy point stands for a cloud of clean configurations: each bell is where a clean point could be, given its noisy one', RIGHT, 398, 640, 28, { ...body, alpha: notes });
  const pw = POSTERIOR.metrics(22).width;
  POSTERIOR.draw(ctx, RIGHT, 466, { size: 22, alpha: notes });
  text(ctx, 'the reference’s cloud', RIGHT + pw + 20, 471, { ...type.note, color: color.body, alpha: notes });
  wrap(ctx, 'point 2’s uncertainty enters both pairs it belongs to, 1–2 and 2–3', RIGHT, 520, 640, 28, { ...body, color: color.ink, alpha: notes * seg(t, 16.5, 17.3) });
  wrap(ctx, 'left, below: as the outer points move, the sum of pair models misses the shaded gap', RIGHT, 600, 640, 28, { ...body, alpha: notes * seg(t, CURVE + 0.5, CURVE + 1.3) });
}

/** 31.5 →: the three-body share against σ, on a log axis, with ±1 s.e. whiskers. */
const BAR = { x: 925, y: 440, w: 560, h: 220, s: [0.016, 0.8] };
const bx = (s) => BAR.x + (Math.log(s / BAR.s[0]) / Math.log(BAR.s[1] / BAR.s[0])) * BAR.w;
const by = (share) => BAR.y + BAR.h * (1 - share);

function drawBars(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const { x, y, w, h } = BAR;
  wrap(ctx, 'the part of the noisy interaction score that the sum of pair terms misses', 880, 384, 640, 26, { ...type.body, size: 19, color: color.ink, alpha });

  // muted (gold is for symmetry): the well width and twice it
  const band = alpha * seg(t, WIDTH, WIDTH + 0.8);
  ctx.save();
  ctx.globalAlpha *= band;
  ctx.fillStyle = rgba(color.muted, 0.5);
  ctx.fillRect(bx(wellWidth) - 3, y, 6, h);
  ctx.restore();
  text(ctx, 'well width', bx(wellWidth) - 9, y - 8, { ...type.note, color: color.body, align: 'right', alpha: band });
  line(ctx, bx(2 * wellWidth), y + h + 28, bx(2 * wellWidth), y + h + 37, { color: color.muted, width: 2, alpha: band });
  text(ctx, 'two well widths', bx(2 * wellWidth), y + h + 52, { ...type.note, color: color.body, align: 'center', alpha: band });

  // axes
  line(ctx, x - 10, y + h, x + w + 10, y + h, { color: color.line, alpha });
  for (const v of [0, 0.5, 1]) {
    line(ctx, x - 16, by(v), x - 10, by(v), { color: color.line, alpha });
    text(ctx, `${Math.round(100 * v)} %`, x - 20, by(v), { ...type.note, align: 'right', baseline: 'middle', alpha });
  }
  text(ctx, 'noise σ (log scale)', x - 10, y + h + 52, { ...type.note, alpha });

  // bars, grown one after another; the smallest σ, then the peak, lit when the narration names them
  const step = (BARS[1] - BARS[0]) / shares.length;
  const peak = shares.reduce((b, row) => (row.share > b.share ? row : b));
  shares.forEach((row, i) => {
    const grow = seg(t, BARS[0] + i * step, BARS[0] + (i + 1) * step + 0.4);
    const lit = row.sigma === shares[0].sigma ? seg(t, SMALL, SMALL + 0.6) : row === peak ? seg(t, PEAK, PEAK + 0.6) : 0;
    const cx = bx(row.sigma), top = by(row.share * grow);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = INTER;
    ctx.globalAlpha *= 0.8 + 0.2 * lit;
    ctx.fillRect(cx - 12, top, 24, y + h - top);
    if (lit > 0.003) {
      ctx.globalAlpha *= lit;
      ctx.strokeStyle = color.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 12, top, 24, y + h - top);
    }
    ctx.restore();
    const done = alpha * seg(t, BARS[0] + (i + 1) * step, BARS[0] + (i + 1) * step + 0.4);
    const lo = by(row.share - row.se), hi = by(row.share + row.se);
    line(ctx, cx, lo, cx, hi, { color: color.ink, width: 1.5, alpha: done });
    line(ctx, cx - 5, hi, cx + 5, hi, { color: color.ink, width: 1.5, alpha: done });
    line(ctx, cx - 5, lo, cx + 5, lo, { color: color.ink, width: 1.5, alpha: done });
    text(ctx, `${Math.round(100 * row.share)} %`, cx, hi - 8, { font: font.mono, size: 15, weight: lit > 0.5 ? 600 : 400, color: lit > 0.5 ? color.ink : color.body, align: 'center', alpha: done });
    text(ctx, `${row.sigma}`, cx, y + h + 22, { ...type.note, align: 'center', alpha });
  });
  text(ctx, '1 000 trimers (400 at σ = 0.7), s.e. from 10 batches', 880, 740, { ...type.note, alpha: alpha * seg(t, BARS[1], BARS[1] + 0.8) });
}

/** 46.5 →: what can be reused, and a reminder that real physics is many-body too. */
function drawReuse(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const card = { x: 80, y: 630, width: 720 };
  tagCard(ctx, {
    ...card,
    tag: 'REUSE',
    body: 'pretrain the pair part on dimers; add a many-body correction that vanishes as t → 0 (e.g. a factor σₜ)',
    accent: INTER,
    alpha,
    progress: seg(t, REUSE + 0.4, REUSE + 4),
  });
  ctx.save();
  ctx.font = `500 15px ${font.mono}`;
  const width = ctx.measureText('an idea, untested').width + 26;
  ctx.restore();
  ideaTag(ctx, card.x + card.width - 28 - width, card.y + 38, alpha);
  wrap(ctx, 'real physics has many-body terms too: polarisation, 10–20 % of water-cluster binding (as stated in the note)', 880, 770, 620, 21, { ...type.note, color: color.body, alpha: seg(t, REUSE + 3, REUSE + 3.8) });
  drawMolecularScale(ctx, alpha * seg(t, REUSE + 0.5, REUSE + 1.3));
}

/** Back to molecules: scene 15's trimer with its two hydrogen bonds, and the scales that matter. */
function drawMolecularScale(ctx, alpha) {
  if (alpha <= 0.003) return;
  const { hbonds } = TRIMER;
  const T = TRIMER.X, X = Array.from(T, (_, i) => (i % 3 === 0 ? -T[i + 1] : i % 3 === 1 ? T[i - 1] : T[i])); // sideways, as in scene 14
  const cam = camera({ cx: 165, cy: 834, scale: 17, yaw: 0, pitch: 0.2, focal: 40, center: centroid(X, 10) });
  drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha: 2 * alpha });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha: 2 * alpha });
  drawHalo(ctx, cam, X, [7, 10], SCORE_W, { alpha: 2 * alpha });
  drawMol(ctx, X, cam, TRIMER_MOL, { opacity: alpha });
  const atom = (i) => X.slice(3 * i, 3 * i + 3);
  for (const { h, o } of [hbonds.AB, hbonds.CB]) drawHBond(ctx, cam, atom(h), atom(o), { alpha, label: false });
  const mono = { font: font.mono, size: 15, color: color.ink, alpha };
  text(ctx, 'molecules: H-bond well ≈ 0.2–0.3 Å · diffusion σ up to several Å', 270, 826, mono);
  text(ctx, '→ most of the schedule lies right of the peak', 270, 850, { ...mono, color: INTER });
}
