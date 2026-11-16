// Scene 02: the score as a constant (0, 2)-tensor on the residual stream. Bilinear means two
// families of parallel level lines; M = S + A splits it into an indefinite symmetric form
// (hyperbolas, two null lines) and a 2-form (an oriented area), which is what makes attention directed.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, rgba } from '../../../../src/kit.js';
import {
  KEYS, KEY_LABELS, M, S, A, S_EIGEN, QUERY, KEY, SYM, ANTI, chart, drawPlane, drawKeys, drawQuery, drawVector, drawContours, drawPath, matrix2, readout, exampleStamp, chartCaption, quadratic, header, track, clipped,
} from '../shared.js';
import { matVec, matTVec, form, dot as dotp } from '../math.js';

const P = chart();
const R = 850; // the notes column

const SCORE = tex(String.raw`s_{ij} = x_i^{\top} M\, x_j`, 's_ij = xᵢᵀ M xⱼ');
const TENSOR = tex(String.raw`M \in T^*\mathbb{R}^d \otimes T^*\mathbb{R}^d`, 'M ∈ T*ℝᵈ ⊗ T*ℝᵈ');
const SPLIT = tex(String.raw`M = S + A,\quad S = \tfrac12 (M + M^{\top}),\quad A = \tfrac12 (M - M^{\top})`, 'M = S + A,  S = ½(M + Mᵀ),  A = ½(M − Mᵀ)');
const QUAD = tex(String.raw`x^{\top} M x = x^{\top} S x`, 'xᵀ M x = xᵀ S x');
const OMEGA = tex(String.raw`\omega(x_i, x_j) = x_i^{\top} A\, x_j = -\,\omega(x_j, x_i)`, 'ω(xᵢ, xⱼ) = xᵢᵀ A xⱼ = −ω(xⱼ, xᵢ)');
const AREA = tex(String.raw`x_i^{\top} A\, x_j = a\,(x_{i1} x_{j2} - x_{i2} x_{j1})`, 'xᵢᵀ A xⱼ = a (x_i1 x_j2 − x_i2 x_j1)');
const ASYM = tex(String.raw`s_{ij} - s_{ji} = 2\,\omega(x_i, x_j)`, 's_ij − s_ji = 2 ω(xᵢ, xⱼ)');

const KEY_J = 1; // the key held fixed in the "bilinear" beat
const QUERY_FIXED = [1.1, -0.5];
/** The query for the directed beat: a fixed point so the parallelogram is readable. */
const QI = [-1.2, 0.9];
const XJ = KEYS[0];

export default defineScene({
  name: 'The score as a tensor',
  duration: 74,
  narration: [
    [0, 'Fix one head. The score between a query and a key is a bilinear form on the residual stream: x_i transposed, M, x_j. M is a constant tensor of type zero-two on the flat space R to the d. It takes two vectors and returns one number. Here d is two, so the whole space fits on screen.'],
    [14, 'Hold a key fixed. The score is then a linear function of the query, and its level sets are parallel lines. Hold the query fixed instead, and you get a different family of parallel lines. Linear in each slot: that is what bilinear means.'],
    [28, 'Now split M into its symmetric and its antisymmetric part. S is a symmetric bilinear form, the kind of object a metric is. A is a 2-form.'],
    [38, 'Only S enters the quadratic form. S would like to be a metric, but here it is indefinite: along one eigenvector the squared length is positive, along the other it is negative. The level sets are hyperbolas, and on two lines through the origin the squared length is exactly zero. Some keys have negative squared length in this geometry.'],
    [56, 'The antisymmetric part pairs vectors with a sign. In two dimensions it is a multiple of the oriented area spanned by the two vectors. It adds nothing to x transposed M x, but it makes attention directed: the score from i to j and the score from j to i differ by twice omega.'],
  ],
  header: header(2, 'THE SCORE AS A TENSOR', 'A bilinear form on the residual stream'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    drawPlane(ctx, P, { alpha: intro });

    // --- 0–14: the keys, a query, and the score as a number ---------------------------------
    const q0 = QUERY_FIXED;
    const theta0 = matTVec(M, q0);
    const scoresOn = fade(t, 6, 7, 13, 14);
    // the keys stay, dimmed, while the form is split and its quadratic part is drawn
    drawKeys(ctx, P, { alpha: seg(t, 1, 2) * (1 - 0.6 * seg(t, 27.5, 28.5) * (1 - seg(t, 55, 56))) * (1 - seg(t, 56, 57)) });
    drawQuery(ctx, P, q0, { alpha: fade(t, 3, 4, 27.5, 28.5) });
    // score of each key, as a number next to it
    if (scoresOn > 0.003) {
      KEYS.forEach((x, j) => {
        const [sx, sy] = P.point(x);
        const s = dotp(theta0, x);
        text(ctx, `s = ${fmt(s)}`, sx + 12, sy + 14, { font: font.mono, size: 14, color: s >= 0 ? QUERY : color.muted, alpha: scoresOn });
      });
    }

    // --- 14–28: bilinear = two families of parallel lines --------------------------------------
    const keyFixed = fade(t, 14, 15, 20.5, 21.5);
    const queryFixed = fade(t, 21, 22, 27.5, 28.5);
    if (keyFixed > 0.003) {
      const xj = KEYS[KEY_J];
      const Mxj = matVec(M, xj);
      clipped(ctx, P, () => drawContours(ctx, P, (u, v) => dotp([u, v], Mxj), [-3, -2, -1, 0, 1, 2, 3], { colour: QUERY, alpha: 0.8 * keyFixed, dashNegative: true, labels: (l) => `${fmt(l, 0)}` }));
      drawKeys(ctx, P, { points: [xj], labels: [KEY_LABELS[KEY_J]], alpha: keyFixed, weights: [0.3] });
      chartCaption(ctx, P, 'key x₂ fixed: s(x, x₂) = xᵀ M x₂, linear in the query x', keyFixed, { color: QUERY });
    }
    if (queryFixed > 0.003) {
      clipped(ctx, P, () => drawContours(ctx, P, (u, v) => dotp(theta0, [u, v]), [-3, -2, -1, 0, 1, 2, 3], { colour: KEY, alpha: 0.8 * queryFixed, dashNegative: true, labels: (l) => `${fmt(l, 0)}` }));
      chartCaption(ctx, P, 'query x_i fixed: s(x_i, x) = x_iᵀ M x, linear in the key x', queryFixed, { color: KEY });
    }

    // --- 28–56: M = S + A; the quadratic form of S ---------------------------------------------
    const quadOn = fade(t, 38, 39, 55, 56);
    if (quadOn > 0.003) {
      const f = quadratic(S);
      clipped(ctx, P, () => {
        drawContours(ctx, P, f, [-2, -1, -0.5, 0.5, 1, 2], { colour: (l) => (l > 0 ? SYM : color.muted), alpha: 0.9 * quadOn, dashNegative: true, labels: (l) => fmt(l, 1) });
        // the two null lines xᵀ S x = 0
        const nullOn = quadOn * fade(t, 47, 48);
        drawContours(ctx, P, f, [0], { colour: ANTI, alpha: nullOn, width: 2.5 });
      });
      // eigen directions
      const eig = quadOn * fade(t, 41, 42);
      S_EIGEN.vectors.forEach((e, k) => {
        const lam = S_EIGEN.values[k];
        const len = 1.6;
        drawVector(ctx, P, [0, 0], [e[0] * len, e[1] * len], { colour: lam > 0 ? SYM : color.muted, alpha: eig, width: 2.5, label: `λ${k ? '₂' : '₁'} = ${fmt(lam)}` });
      });
      chartCaption(ctx, P, 'level sets of xᵀ S x (dashed: negative) · rose: xᵀ S x = 0', quadOn);
      // keys with their squared lengths
      const keyLen = quadOn * fade(t, 50, 51);
      drawKeys(ctx, P, { alpha: keyLen, labelled: false });
      if (keyLen > 0.003) {
        KEYS.forEach((x) => {
          const [sx, sy] = P.point(x);
          const v = form(S, x, x);
          text(ctx, fmt(v), sx + 10, sy - 10, { font: font.mono, size: 14, color: v >= 0 ? SYM : ANTI, alpha: keyLen });
        });
        text(ctx, '‖x_j‖²_S = x_jᵀ S x_j', P.x + P.size - 8, P.y + P.size - 12, { font: font.mono, size: 14, color: color.body, align: 'right', alpha: keyLen });
      }
    }

    // --- 56–74: the 2-form as an oriented area -------------------------------------------------
    const areaOn = seg(t, 56, 57);
    if (areaOn > 0.003) {
      drawParallelogram(ctx, t, areaOn);
    }

    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3));
  },
});

/** The parallelogram spanned by x_i and x_j, shaded by the sign of ω, and the directed scores. */
function drawParallelogram(ctx, t, alpha) {
  const swap = seg(t, 66, 67.5); // the roles of i and j are swapped: the orientation flips
  const xi = QI;
  const xj = XJ;
  const omega = form(A, xi, xj);
  const sign = omega * (1 - 2 * swap) >= 0 ? 1 : -1;
  const tint = sign > 0 ? ANTI : color.muted;
  drawPath(ctx, P, [[0, 0], xi, [xi[0] + xj[0], xi[1] + xj[1]], xj], { colour: tint, alpha, width: 1.5, close: true, fill: rgba(tint, 0.18) });
  // the first vector in the pairing is drawn solid, the second dashed
  const first = swap < 0.5 ? xi : xj;
  const second = swap < 0.5 ? xj : xi;
  drawVector(ctx, P, [0, 0], first, { colour: QUERY, alpha, width: 3, label: swap < 0.5 ? 'x_i' : 'x_j' });
  drawVector(ctx, P, [0, 0], second, { colour: KEY, alpha, width: 3, label: swap < 0.5 ? 'x_j' : 'x_i' });
  // the orientation arc
  const a0 = Math.atan2(first[1], first[0]);
  const a1 = Math.atan2(second[1], second[0]);
  let d = a1 - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const arc = Array.from({ length: 25 }, (_, k) => {
    const phi = a0 + (d * k) / 24;
    return [0.45 * Math.cos(phi), 0.45 * Math.sin(phi)];
  });
  drawPath(ctx, P, arc, { colour: tint, alpha, width: 2.5 });
  const [ax, ay] = P.point(arc[12]);
  text(ctx, d > 0 ? '+' : '−', ax + (d > 0 ? 10 : -22), ay + 6, { font: font.mono, size: 20, color: tint, alpha });
  const area = sign > 0 ? 'positive' : 'negative';
  chartCaption(ctx, P, `oriented area from ${swap < 0.5 ? 'x_i to x_j' : 'x_j to x_i'}: ${area} · ω = ${fmt(swap < 0.5 ? omega : -omega)}`, alpha, { color: tint });
}

/** The column of notes on the right: formulas, matrices and readouts, timed to the narration. */
function drawNotes(ctx, t) {
  // the form and the tensor type
  SCORE.draw(ctx, R, 230, { size: 34, alpha: seg(t, 0.8, 1.8) });
  TENSOR.draw(ctx, R, 290, { size: 24, alpha: fade(t, 5, 6, 27.5, 28.5) });
  text(ctx, 'constant on ℝᵈ: the same M at every point of the residual stream', R, 328, { ...type.note, alpha: fade(t, 6, 7, 27.5, 28.5) });
  const mOn = seg(t, 2.5, 3.5);
  const mx = R + 80;
  const my = 440;
  const shift = seg(t, 28, 29.5); // M moves up to make room for S and A
  matrix2(ctx, mx, my - 70 * shift, M, { label: 'M =', alpha: mOn });
  text(ctx, 'd = 2: four numbers', mx + 110, my - 70 * shift + 6, { ...type.note, alpha: fade(t, 3.5, 4.5, 27.5, 28.5) });

  // the two readings of bilinearity
  const bil = fade(t, 14.5, 15.5, 27.5, 28.5);
  wrap(ctx, 'Linear in each slot: s(x, x₂) = ⟨x, M x₂⟩ and s(x_i, x) = ⟨Mᵀ x_i, x⟩. Each key defines a covector M x_j on queries; each query defines a covector Mᵀ x_i on keys.', R, 560, 640, 30, { ...type.body, alpha: bil });

  // M = S + A
  const split = seg(t, 28.5, 29.5);
  SPLIT.draw(ctx, R, 300, { size: 24, alpha: split });
  matrix2(ctx, mx, 520, S, { label: 'S =', colour: SYM, alpha: seg(t, 30, 31) });
  matrix2(ctx, mx + 330, 520, A, { label: 'A =', colour: ANTI, alpha: seg(t, 33, 34) });
  text(ctx, 'symmetric', mx, 585, { ...type.note, color: SYM, align: 'center', alpha: seg(t, 30.5, 31.5) });
  text(ctx, '2-form', mx + 330, 585, { ...type.note, color: ANTI, align: 'center', alpha: seg(t, 33.5, 34.5) });
  text(ctx, 'eigenvalues 0.97 and −0.47: indefinite', mx, 612, { ...type.note, color: color.body, align: 'center', alpha: fade(t, 42, 43, 55, 56) });
  text(ctx, 'signature (+, −): not a metric', mx, 636, { ...type.note, color: color.body, align: 'center', alpha: fade(t, 43.5, 44.5, 55, 56) });
  QUAD.draw(ctx, R, 690, { size: 26, alpha: fade(t, 38.5, 39.5, 55, 56) });
  text(ctx, 'A drops out of the quadratic form: xᵀ A x = 0', R, 730, { ...type.note, alpha: fade(t, 39.5, 40.5, 55, 56) });
  wrap(ctx, 'Degenerate and indefinite: not a Riemannian metric, but still a symmetric tensor that measures squared lengths and angles, some of them negative.', R, 770, 640, 28, { ...type.note, size: 16, color: color.body, alpha: fade(t, 51, 52, 55, 56) });

  // the 2-form
  const om = seg(t, 56.5, 57.5);
  OMEGA.draw(ctx, R, 690, { size: 26, alpha: om });
  AREA.draw(ctx, R, 740, { size: 24, alpha: seg(t, 59, 60) });
  text(ctx, 'with a = 0.5 here: half the oriented area of the parallelogram', R, 778, { ...type.note, alpha: seg(t, 60, 61) });
  const dir = seg(t, 64, 65);
  ASYM.draw(ctx, R, 826, { size: 24, alpha: dir });
  const sij = form(M, QI, XJ);
  const sji = form(M, XJ, QI);
  readout(ctx, 's_ij =', sij, R + 400, 820, { colour: QUERY, alpha: dir });
  readout(ctx, 's_ji =', sji, R + 400, 846, { colour: KEY, alpha: dir });
  text(ctx, `= ${fmt(form(S, QI, XJ))} + ${fmt(form(A, QI, XJ))}`, R + 530, 820, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 68, 69) });
  text(ctx, `= ${fmt(form(S, XJ, QI))} − ${fmt(form(A, QI, XJ))}`, R + 530, 846, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 68, 69) });
  text(ctx, 'S part, A part', R + 530, 870, { ...type.note, size: 13, alpha: seg(t, 68.5, 69.5) });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
