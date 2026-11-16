// Scene 05: fix a query. Its row of scores is linear in the key, ⟨θ, x_j⟩ with θ = Mᵀ x_i, and the
// softmax weights form an exponential family supported on the keys: sufficient statistic x_j, natural
// parameter θ, log-partition ψ. The attended context Σ_j a_j x_j is its mean parameter ∇ψ(θ).

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, rgba, roundRect } from '../../../../src/kit.js';
import {
  KEYS, KEY_LABELS, M, QUERY, KEY, CONTEXT, INFO, chart, drawPlane, drawKeys, drawQuery, drawVector, drawHull, drawContours, drawToken, pill, readout, exampleStamp, chartCaption, header, clipped, queryAt,
} from '../shared.js';
import { matTVec, scores, weights, meanParameter, logPartition, dot as dotp } from '../math.js';

const P = chart();
const R = 850;
const MOVE_AT = 42;
const Q0 = queryAt(0);

const THETA = tex(String.raw`\theta = M^{\top} x_i`, 'θ = Mᵀ xᵢ');
const SCORE_LIN = tex(String.raw`s_{ij} = x_i^{\top} M\, x_j = \langle \theta, x_j \rangle`, 's_ij = xᵢᵀ M xⱼ = ⟨θ, xⱼ⟩');
const WEIGHTS = tex(
  String.raw`a_{ij} = \frac{e^{\langle\theta, x_j\rangle}}{\sum_k e^{\langle\theta, x_k\rangle}} = e^{\langle\theta, x_j\rangle - \psi(\theta)}`,
  'a_ij = e^{⟨θ,xⱼ⟩} / Σ_k e^{⟨θ,x_k⟩} = e^{⟨θ,xⱼ⟩ − ψ(θ)}',
);
const T_STAT = tex(String.raw`T(j) = x_j`, 'T(j) = xⱼ');
const NAT = tex(String.raw`\theta = M^{\top} x_i`, 'θ = Mᵀ xᵢ');
const PSI = tex(String.raw`\psi(\theta) = \log \sum_j e^{\langle\theta, x_j\rangle}`, 'ψ(θ) = log Σⱼ e^{⟨θ,xⱼ⟩}');
const MEAN = tex(String.raw`\eta = \sum_j a_{ij}\, x_j = \nabla\psi(\theta)`, 'η = Σⱼ a_ij xⱼ = ∇ψ(θ)');
const CHAIN = tex(String.raw`o_i = W_V\, \nabla\psi\big(M^{\top} x_i\big)`, 'oᵢ = W_V ∇ψ(Mᵀ xᵢ)');

export default defineScene({
  name: 'Softmax as an exponential family',
  duration: 65,
  narration: [
    [0, 'Fix one query and look at its row of scores. Call theta the transposed form applied to the query. Every score is then a linear function of the key: theta dot x_j. The level lines of that function are parallel, and each key sits on the line of its own score.'],
    [14, 'Exponentiate and normalise. The weights are an exponential family supported on the keys: the sufficient statistic is the key itself, the natural parameter is theta, and the log-partition psi is the log of the sum of the exponentials. The query enters only through theta.'],
    [30, 'The attended context, the weighted sum of the keys, is the mean parameter of this family: the gradient of psi at theta. Positive weights that sum to one place it inside the convex hull of the keys.'],
    [42, 'Now move the query. Theta turns with it, the level lines turn, the weights flow from key to key, and the context slides around inside the hull. The whole head is a linear map of the query, pushed through the gradient of psi, then the value map.'],
  ],
  header: header(5, 'SOFTMAX AS AN EXPONENTIAL FAMILY', 'A distribution on the keys, with the query as its natural parameter'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    const q = t < MOVE_AT ? Q0 : queryAt(t - MOVE_AT, { period: 23 });
    const theta = matTVec(M, q);
    const s = scores(theta, KEYS);
    const a = weights(theta, KEYS);
    const eta = meanParameter(theta, KEYS);
    const psi = logPartition(theta, KEYS);

    drawPlane(ctx, P, { alpha: intro });
    // level lines of ⟨θ, x⟩
    const levelOn = seg(t, 6, 7);
    clipped(ctx, P, () => drawContours(ctx, P, (u, v) => dotp(theta, [u, v]), [-3, -2, -1, 0, 1, 2, 3], { colour: QUERY, alpha: 0.6 * levelOn, dashNegative: true }));
    // the hull and the context
    const hullOn = seg(t, 31, 32);
    drawHull(ctx, P, KEYS, { alpha: hullOn, dash: [6, 5] });
    // keys: plain first, then sized by their weights
    const weighted = seg(t, 20, 21);
    drawKeys(ctx, P, { alpha: seg(t, 1, 2) * (1 - weighted) });
    drawKeys(ctx, P, { alpha: weighted, weights: a });
    // scores beside the keys
    const scoreOn = fade(t, 8, 9, 19.5, 20.5);
    if (scoreOn > 0.003) {
      KEYS.forEach((x, j) => {
        const [sx, sy] = P.point(x);
        text(ctx, `s = ${fmt(s[j])}`, sx + 12, sy + 16, { font: font.mono, size: 14, color: s[j] >= 0 ? QUERY : color.muted, alpha: scoreOn });
      });
    }
    drawVector(ctx, P, [0, 0], theta, { colour: QUERY, alpha: seg(t, 3, 4), width: 3, label: 'θ' });
    drawQuery(ctx, P, q, { alpha: seg(t, 1.5, 2.5) });
    drawToken(ctx, P, eta, { colour: CONTEXT, alpha: hullOn, label: 'η', r: 8, halo: 0.6, labelOffset: [-28, -10] });

    const caption = t < 6 ? ['the query x_i and its natural parameter θ = Mᵀ x_i', fade(t, 3.5, 4.5, 5.5, 6.5)]
      : t < 20 ? ['level lines of ⟨θ, x⟩: each key sits on the line of its score', fade(t, 6.5, 7.5, 19.5, 20.5)]
      : t < 31 ? ['dot size: the attention weight a_j', fade(t, 20.5, 21.5, 30.5, 31.5)]
      : t < MOVE_AT ? ['η = Σ a_j x_j, the attended context, inside the hull', fade(t, 31.5, 32.5, 41.5, 42.5)]
      : ['the query moves: θ turns, the weights flow, η slides', seg(t, 42.5, 43.5)];
    chartCaption(ctx, P, caption[0], caption[1]);

    drawNotes(ctx, t, s, a, psi);
    exampleStamp(ctx, seg(t, 2, 3));
  },
});

function drawNotes(ctx, t, s, a, psi) {
  THETA.draw(ctx, R, 208, { size: 28, alpha: seg(t, 2, 3) });
  SCORE_LIN.draw(ctx, R, 258, { size: 26, alpha: seg(t, 5, 6) });
  text(ctx, 'linear in the key: a covector on the keys', R + 440, 264, { ...type.note, alpha: fade(t, 6, 7, 14, 15) });

  WEIGHTS.draw(ctx, R, 322, { size: 26, alpha: seg(t, 14, 15) });

  // the three ingredients of an exponential family
  const rows = [
    ['SUFFICIENT STATISTIC', T_STAT, 17, KEY],
    ['NATURAL PARAMETER', NAT, 20, QUERY],
    ['LOG-PARTITION', PSI, 23, INFO],
  ];
  rows.forEach(([tag, formula, at, tint], k) => {
    const alpha = seg(t, at, at + 1);
    const y = 380 + 40 * k;
    const w = pill(ctx, tag, R, y, tint, alpha);
    formula.draw(ctx, R + w + 16, y, { size: 22, alpha });
  });
  readout(ctx, 'ψ(θ) =', psi, R + 420, 466, { colour: INFO, alpha: seg(t, 24, 25) });

  drawTable(ctx, t, s, a);

  const mean = seg(t, 30, 31);
  MEAN.draw(ctx, R, 762, { size: 26, alpha: mean });
  text(ctx, 'the mean parameter: a convex combination of the keys, inside their hull', R, 804, { ...type.note, alpha: seg(t, 33, 34) });
  const chain = seg(t, 46, 47);
  CHAIN.draw(ctx, R, 850, { size: 26, alpha: chain });
  text(ctx, 'linear · Legendre · linear', R + 330, 856, { ...type.note, color: INFO, alpha: chain });
}

/** key · score · exponential · weight (as a bar), one row per key. */
function drawTable(ctx, t, s, a) {
  const on = seg(t, 15, 16);
  if (on <= 0.003) return;
  const y0 = 528;
  const rowH = 27;
  const cols = [
    { x: R + 90, title: 's_j', at: 15, value: (j) => fmt(s[j]), tint: QUERY },
    { x: R + 200, title: 'e^{s_j}', at: 18.5, value: (j) => fmt(Math.exp(s[j])), tint: color.body },
    { x: R + 330, title: 'a_j', at: 22, value: null, tint: KEY },
  ];
  ctx.save();
  ctx.globalAlpha *= on;
  text(ctx, 'key', R, 504, { ...type.note });
  for (const c of cols) text(ctx, c.title, c.x, 504, { ...type.note, color: c.tint, alpha: seg(t, c.at, c.at + 1) });
  const sumE = s.reduce((acc, v) => acc + Math.exp(v), 0);
  KEYS.forEach((_, j) => {
    const y = y0 + j * rowH;
    text(ctx, KEY_LABELS[j], R, y, { font: font.display, italic: true, size: 18, color: KEY });
    for (const c of cols) {
      const alpha = seg(t, c.at, c.at + 1);
      if (c.value) text(ctx, c.value(j), c.x, y, { font: font.mono, size: 16, color: c.tint, alpha });
      else {
        const w = Math.max(2, a[j] * 170);
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.fillStyle = rgba(KEY, 0.6);
        roundRect(ctx, c.x, y - 13, w, 16, 4);
        ctx.fill();
        ctx.restore();
        text(ctx, fmt(a[j]), c.x + w + 8, y, { font: font.mono, size: 15, color: color.body, alpha });
      }
    }
  });
  const ys = y0 + KEYS.length * rowH + 2;
  text(ctx, `Σ e^{s_j} = ${fmt(sumE)}`, R + 200, ys, { font: font.mono, size: 14, color: color.muted, alpha: seg(t, 19.5, 20.5) });
  text(ctx, 'Σ a_j = 1.00', R + 370, ys, { font: font.mono, size: 14, color: color.muted, alpha: seg(t, 23, 24) });
  ctx.restore();
}

const fmt = (v, digits = 2) => {
  const str = Math.abs(v).toFixed(digits);
  return (Number(str) === 0 ? '' : v < 0 ? '−' : '') + str;
};
