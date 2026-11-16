// Scene 03: where M comes from. The score is the Euclidean pairing of ℝ^{d_k} pulled back along two
// different linear maps W_Q and W_K; with d_k = 1 each map is a covector, M = w_q w_kᵀ has rank one,
// keys moving along ker W_K are invisible, and W_Q = W_K gives an honest (degenerate) pullback metric.

import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, line, dot, arrow, rgba } from '../../../../src/kit.js';
import { KEYS, KEY_LABELS, QUERY, KEY, SYM, ANTI, chart, drawPlane, drawKeys, drawQuery, drawVector, drawContours, drawPath, matrix2, readout, exampleStamp, chartCaption, header, clipped } from '../shared.js';
import { dot as dotp, outer, symmetricPart, antisymmetricPart, eigen2, norm, normalize, form } from '../math.js';

const P = chart();
const R = 850;

const INNER = tex(String.raw`s_{ij} = \big\langle W_Q x_i,\; W_K x_j \big\rangle_{\mathbb{R}^{d_k}}`, 's_ij = ⟨W_Q xᵢ, W_K xⱼ⟩');
const RANK = tex(String.raw`\operatorname{rank} M \le d_k,\qquad \operatorname{rank} S \le 2 d_k`, 'rank M ≤ d_k,  rank S ≤ 2 d_k');
const KER = tex(String.raw`\dim \ker W_K \;\ge\; d - d_k`, 'dim ker W_K ≥ d − d_k');
const EQUAL = tex(String.raw`W_Q = W_K = W:\quad M = W^{\top} W \succeq 0,\quad \ker M = \ker W`, 'W_Q = W_K = W:  M = WᵀW ≽ 0,  ker M = ker W');
const EIG = tex(String.raw`\lambda_{\pm}(S) = \tfrac12\big(w_q\!\cdot\! w_k \pm \|w_q\|\|w_k\|\big)`, 'λ±(S) = ½(w_q·w_k ± ‖w_q‖‖w_k‖)');
const RANK1 = tex(String.raw`d_k = 1:\quad M = w_q\, w_k^{\top}`, 'd_k = 1:  M = w_q w_kᵀ');

const WQ = [1, 0.4];
const WK = [0.5, 1];
const QI = [-0.9, 1.1];
const SLIDE_KEY = 3; // x₄ slides along ker W_K
const kerK = normalize([WK[1], -WK[0]]);

export default defineScene({
  name: 'Where the form comes from',
  duration: 62,
  narration: [
    [0, 'Where does M come from? The score is a Euclidean inner product in a smaller space. The query map sends x_i to R to the d_k, the key map sends x_j there too, and the score is their dot product. So M is the flat pairing of that small space, pulled back along two different linear maps. To see it, take d_k equal to one: each map is then a single covector, a stack of level lines.'],
    [18, 'A map into fewer dimensions has a null space. Slide a key along the null direction of the key map: its image does not move, and no score changes. M has rank at most d_k, and its symmetric part at most twice that. In a real head, d_k is sixty-four or so against a stream of thousands. Most directions are invisible to one head.'],
    [36, 'If the two maps were the same, M would be W transposed W: positive semidefinite, with the null space of W. Watch the query covector turn into the key covector. The hyperbolas of S flatten into pairs of parallel lines, the negative eigenvalue rises to zero, and the 2-form vanishes. That is an honest pullback metric, degenerate but Riemannian.'],
    [51, 'The query-key asymmetry is exactly the departure from a pullback metric. The negative eigenvalue of S and the whole 2-form A appear the moment the two covectors point in different directions.'],
  ],
  header: header(3, 'WHERE THE FORM COMES FROM', 'The Euclidean pairing, pulled back twice'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    drawPlane(ctx, P, { alpha: intro });

    // the query covector morphs into the key covector between 38 and 46; back at 52
    const morph = fade(t, 38, 46, 52, 54);
    const wq = [lerp(WQ[0], WK[0], morph), lerp(WQ[1], WK[1], morph)];
    const wk = WK;
    const Mt = outer(wq, wk);
    const St = symmetricPart(Mt);
    const At = antisymmetricPart(Mt);
    const eig = eigen2(St);

    // the sliding key
    const slide = 0.9 * Math.sin(2 * Math.PI * lin(t, 21, 29));
    const keys = KEYS.map((x, j) => (j === SLIDE_KEY && t > 21 && t < 29.5 ? [x[0] + slide * kerK[0], x[1] + slide * kerK[1]] : x));

    // covectors as stacks of level lines
    const covOn = fade(t, 6, 7, 35.5, 37);
    const covAgain = seg(t, 37, 38);
    const cov = Math.max(covOn, covAgain);
    clipped(ctx, P, () => {
      drawContours(ctx, P, (u, v) => dotp(wk, [u, v]), [-3, -2, -1, 0, 1, 2, 3], { colour: KEY, alpha: 0.6 * cov, dashNegative: true, labels: (l) => (l === 0 ? 'k = 0' : '') });
      drawContours(ctx, P, (u, v) => dotp(wq, [u, v]), [-3, -2, -1, 0, 1, 2, 3], { colour: QUERY, alpha: 0.6 * cov, dashNegative: true, labels: (l) => (l === 0 ? 'q = 0' : '') });
    });
    drawVector(ctx, P, [0, 0], wq, { colour: QUERY, alpha: cov, width: 3, label: 'w_q' });
    drawVector(ctx, P, [0, 0], wk, { colour: KEY, alpha: cov, width: 3, label: 'w_k' });

    // the null direction of the key map
    const nullOn = fade(t, 19, 20, 35, 36);
    const L = 2.3;
    drawPath(ctx, P, [[-kerK[0] * L, -kerK[1] * L], [kerK[0] * L, kerK[1] * L]], { colour: ANTI, alpha: 0.8 * nullOn, width: 2, dash: [8, 6] });
    if (nullOn > 0.003) {
      const [lx, ly] = P.point([kerK[0] * 1.9, kerK[1] * 1.9]);
      text(ctx, 'ker W_K', lx + 10, ly - 10, { font: font.mono, size: 15, color: ANTI, alpha: nullOn });
    }

    // the quadratic form of S during the morph
    const quadOn = fade(t, 36.5, 37.5);
    if (quadOn > 0.003) {
      const f = (u, v) => form(St, [u, v], [u, v]);
      clipped(ctx, P, () => drawContours(ctx, P, f, [-1, -0.5, 0.5, 1, 2, 3], { colour: (l) => (l > 0 ? SYM : color.muted), alpha: 0.8 * quadOn, dashNegative: true }));
    }

    drawKeys(ctx, P, { points: keys, alpha: seg(t, 1, 2), weights: t > 19 && t < 36 ? KEYS.map((_, j) => (j === SLIDE_KEY ? 0.3 : 0)) : null });
    drawQuery(ctx, P, QI, { alpha: fade(t, 2.5, 3.5, 35.5, 37) });
    chartCaption(ctx, P, t < 36 ? 'the two covectors w_q and w_k, as stacks of level lines' : morph > 0.5 ? 'W_Q = W_K: level sets of xᵀ S x are pairs of parallel lines' : 'level sets of xᵀ S x while w_q turns towards w_k', fade(t, 7, 8));

    drawNumberLine(ctx, t, keys, wq, wk);
    drawNotes(ctx, t, Mt, St, At, eig, wq);
    exampleStamp(ctx, seg(t, 2, 3), 'd = 2, d_k = 1 · w_q = (1, 0.4), w_k = (0.5, 1) · everything computed');
  },
});

/** ℝ^{d_k} = ℝ: the images q_i and k_j on a number line, and the score as their product. */
function drawNumberLine(ctx, t, keys, wq, wk) {
  const on = fade(t, 7, 8, 35.5, 37);
  if (on <= 0.003) return;
  const x0 = R;
  const x1 = R + 560;
  const y = 420;
  const X = (v) => x0 + ((v + 2.5) / 5) * (x1 - x0);
  line(ctx, x0, y, x1, y, { color: color.line, width: 2, alpha: on });
  for (const v of [-2, -1, 0, 1, 2]) {
    line(ctx, X(v), y - 5, X(v), y + 5, { color: color.line, alpha: on });
    text(ctx, fmt(v, 0), X(v), y + 24, { font: font.mono, size: 13, color: color.muted, align: 'center', alpha: on });
  }
  text(ctx, 'ℝ^{d_k} = ℝ: images of the tokens', x0, y - 40, { ...type.note, color: color.body, alpha: on });
  keys.forEach((x, j) => {
    const k = dotp(wk, x);
    dot(ctx, X(k), y - 10, 5, KEY, on);
    text(ctx, KEY_LABELS[j].replace('x', 'k'), X(k), y - 20, { font: font.display, italic: true, size: 15, color: KEY, align: 'center', alpha: on });
  });
  const q = dotp(wq, QI);
  dot(ctx, X(q), y + 10, 6, QUERY, on);
  text(ctx, 'q_i', X(q), y + 44, { font: font.display, italic: true, size: 17, color: QUERY, align: 'center', alpha: on });
  const sj = fade(t, 10, 11, 35.5, 37);
  const k2 = dotp(wk, keys[1]);
  readout(ctx, 's_i2 = q_i · k_2 =', q * k2, x0, y + 80, { colour: color.ink, alpha: sj });
  text(ctx, `= ${fmt(q)} × ${fmt(k2)}`, x0 + 330, y + 80, { font: font.mono, size: 15, color: color.muted, alpha: sj });
  // the sliding key's score, which does not change
  const sl = fade(t, 20.5, 21.5, 29.5, 30.5);
  const k4 = dotp(wk, keys[SLIDE_KEY]);
  readout(ctx, 's_i4 = q_i · k_4 =', q * k4, x0, y + 112, { colour: ANTI, alpha: sl });
  text(ctx, 'x₄ moves, k₄ does not', x0 + 330, y + 112, { font: font.mono, size: 15, color: ANTI, alpha: sl });
}

function drawNotes(ctx, t, Mt, St, At, eig, wq) {
  INNER.draw(ctx, R, 230, { size: 30, alpha: seg(t, 0.8, 1.8) });
  wrap(ctx, 'the Euclidean pairing of ℝ^{d_k}, pulled back along W_Q in the first slot and along W_K in the second', R, 274, 640, 22, { ...type.note, alpha: seg(t, 2, 3) });
  RANK1.draw(ctx, R, 320, { size: 24, alpha: fade(t, 11, 12, 35.5, 37) });
  text(ctx, 'q_i = w_q · x_i,   k_j = w_k · x_j', R + 340, 326, { font: font.mono, size: 16, color: color.body, alpha: fade(t, 12, 13, 35.5, 37) });

  // null space and rank
  const nul = fade(t, 19.5, 20.5, 35.5, 37);
  KER.draw(ctx, R, 580, { size: 24, alpha: nul });
  RANK.draw(ctx, R, 630, { size: 24, alpha: fade(t, 29.5, 30.5, 35.5, 37) });
  wrap(ctx, 'Here d − d_k = 1: one invisible direction per map. In a head with d = 4096 and d_k = 128, the key map forgets 3968 directions, and S has rank at most 256.', R, 680, 640, 28, { ...type.note, size: 16, color: color.body, alpha: fade(t, 31, 32, 35.5, 37) });

  // the equal-maps case and the eigenvalues, with live numbers during the morph
  const eq = seg(t, 36.5, 37.5);
  EQUAL.draw(ctx, R, 320, { size: 24, alpha: eq });
  const live = seg(t, 37.5, 38.5);
  matrix2(ctx, R + 80, 450, Mt, { label: 'M =', alpha: live });
  matrix2(ctx, R + 80, 580, St, { label: 'S =', colour: SYM, alpha: live });
  matrix2(ctx, R + 400, 580, At, { label: 'A =', colour: ANTI, alpha: live });
  EIG.draw(ctx, R, 680, { size: 23, alpha: seg(t, 39, 40) });
  const lamOn = seg(t, 40, 41);
  readout(ctx, 'λ₊ =', eig.values[0], R, 730, { colour: SYM, alpha: lamOn });
  readout(ctx, 'λ₋ =', eig.values[1], R + 160, 730, { colour: eig.values[1] < -1e-3 ? ANTI : SYM, alpha: lamOn });
  readout(ctx, 'a =', At[0][1], R + 320, 730, { colour: ANTI, alpha: lamOn });
  text(ctx, 'the 2-form', R + 440, 730, { ...type.note, alpha: lamOn });
  const angle = (Math.acos(Math.max(-1, Math.min(1, dotp(normalize(wq), normalize(WK))))) * 180) / Math.PI;
  readout(ctx, 'angle between w_q and w_k:', `${angle.toFixed(1)}°`, R, 764, { colour: color.body, alpha: lamOn, size: 15 });
  wrap(ctx, 'λ₋ < 0 and A ≠ 0 exactly when w_q and w_k are not parallel: the asymmetry of the two maps is the whole departure from a pullback metric.', R, 806, 640, 28, { ...type.note, size: 16, color: color.body, alpha: seg(t, 52, 53) });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
