// Scene 13: end to end. Five cards, each a small computed picture with its formula, retell the
// chain: an indefinite degenerate form, twisted by a flat connection over positions, feeding a
// Legendre transform whose Fisher metric governs sensitivity, with a value map on the output, and
// across layers a flow whose gradient and rotational parts are S and A.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, arrow, roundRect, rgba } from '../../../../src/kit.js';
import { KEYS, M, S, QUERY, KEY, CONTEXT, SYM, ANTI, INFO, POSITION, VALUE, chart, drawKeys, drawHull, drawPath, drawContours, drawVector, quadratic, header, clipped } from '../shared.js';
import { matTVec, weights, meanParameter, fisher, ellipsePoints, rotation2, matVec, dot as dotp } from '../math.js';

const CARDS = [
  { tint: SYM, tag: 'FORM', formula: tex(String.raw`M = S + A`, 'M = S + A'), gloss: 'a degenerate, indefinite bilinear form on the residual stream' },
  { tint: POSITION, tag: 'CONNECTION', formula: tex(String.raw`M_{mn} = R_m^{\top} M R_n`, 'M_mn = R_mᵀ M R_n'), gloss: 'twisted by a flat connection over the positions' },
  { tint: INFO, tag: 'LEGENDRE', formula: tex(String.raw`\eta = \nabla\psi(\theta)`, 'η = ∇ψ(θ)'), gloss: 'a Legendre transform of the exponential family on the keys' },
  { tint: CONTEXT, tag: 'FISHER · VALUE', formula: tex(String.raw`o_i = W_V\,\eta,\;\; \nabla^2\psi = \mathrm{Cov}_a[x_j]`, 'o_i = W_V η,  ∇²ψ = Cov_a[x_j]'), gloss: 'the Fisher metric governs sensitivity; a value map on the output' },
  { tint: ANTI, tag: 'FLOW', formula: tex(String.raw`\dot x_i = P^{\perp}_{x_i}\textstyle\sum_j a_{ij} x_j`, 'ẋ_i = P⊥ Σ_j a_ij x_j'), gloss: 'across layers: a gradient part from S, a circulation from A' },
];
const CARD_W = 280;
const GAP = 20;
const CARD_Y = 190;
const CARD_H = 372;

const REFERENCES = [
  'Vaswani et al. 2017 · Attention is all you need',
  'Su et al. 2021 · RoFormer: rotary position embedding',
  'Amari 2016 · Information geometry and its applications',
  'Martins & Astudillo 2016 · From softmax to sparsemax',
  'Peters, Niculae & Martins 2019 · Sparse sequence-to-sequence models',
  'Ramsauer et al. 2020 · Hopfield networks is all you need',
  'Zhai et al. 2023 · Preventing attention entropy collapse',
  'Geshkovski, Letrouit, Polyanskiy & Rigollet 2023 · A mathematical perspective on transformers',
];

const QUERY_PT = [0.9, 0.5];

export default defineScene({
  name: 'End to end',
  duration: 52,
  narration: [
    [0, 'So, end to end. A degenerate, indefinite bilinear form on the residual stream, with a symmetric part that measures and an antisymmetric part that directs.'],
    [9, 'Twisted by a flat connection over the positions, so that only relative position enters the pairing.'],
    [17, 'Feeding a Legendre transform of a key-supported exponential family: the attended context is the mean parameter of the keys under the attention distribution.'],
    [26, 'Whose Fisher metric, the covariance of the attended keys, governs how sensitive the head is to its query, with a value map on the output.'],
    [35, 'And across layers, a particle flow on the sphere whose gradient and non-gradient parts are exactly the symmetric and antisymmetric parts of the form. One head, read geometrically.'],
  ],
  header: header(13, 'END TO END', 'One head, read geometrically'),

  draw(ctx, t) {
    CARDS.forEach((card, k) => {
      const a = seg(t, 0.5 + 8.7 * k, 1.5 + 8.7 * k);
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
      const P = chart({ x: x + 40, y: CARD_Y + 48, size: 200, extent: 2.3 });
      [drawFormCard, drawConnectionCard, drawLegendreCard, drawFisherCard, drawFlowCard][k](ctx, P, t - (0.5 + 8.7 * k), card.tint);
      card.formula.draw(ctx, x + CARD_W / 2, CARD_Y + 282, { size: 20, align: 'center' });
      wrap(ctx, card.gloss, x + 20, CARD_Y + 316, CARD_W - 40, 19, { ...type.note, size: 13, color: color.body });
      ctx.restore();
    });

    // the one sentence
    const s = seg(t, 42, 43);
    wrap(ctx, 'A degenerate indefinite bilinear form on the residual stream, twisted by a flat connection over positions, feeding a Legendre transform of a key-supported exponential family whose Fisher metric governs sensitivity, with a value map on the output; and across layers, a particle flow whose gradient and non-gradient parts are the symmetric and antisymmetric parts of the form.', 60, 612, 1480, 30, {
      ...type.body,
      size: 21,
      color: color.ink,
      alpha: s,
      chars: Math.floor(lin(t, 42, 50) * 420),
    });

    // references
    const r = seg(t, 44, 45);
    line(ctx, 60, 728, 1540, 728, { width: 1, alpha: 0.6 * r });
    text(ctx, 'REFERENCES', 60, 756, { ...type.eyebrow, size: 13, alpha: r });
    REFERENCES.forEach((ref, k) => {
      const col = k < 4 ? 0 : 1;
      text(ctx, ref, 60 + col * 760, 786 + (k % 4) * 26, { font: font.mono, size: 13, color: color.muted, alpha: r * seg(t, 44.5 + 0.3 * k, 45 + 0.3 * k) });
    });
  },
});

/** Hyperbolas of xᵀ S x with its two null lines. */
function drawFormCard(ctx, P, t, tint) {
  const f = quadratic(S);
  clipped(ctx, P, () => {
    drawContours(ctx, P, f, [-2, -1, -0.5, 0.5, 1, 2], { colour: (l) => (l > 0 ? SYM : color.muted), alpha: 0.9, dashNegative: true, n: 40 });
    drawContours(ctx, P, f, [0], { colour: ANTI, alpha: seg(t, 1.5, 2.5), width: 2, n: 40 });
  });
  frame(ctx, P);
}

/** Four fibres over the base, with a rotated token in each. */
function drawConnectionCard(ctx, P, t, tint) {
  const y0 = P.y + P.size - 24;
  line(ctx, P.x, y0, P.x + P.size, y0, { color: tint, width: 2 });
  const omega = 0.55;
  const v = [0, 0.75];
  for (let m = 0; m < 4; m++) {
    const cx = P.x + 28 + m * 48;
    const cy = P.y + 70;
    dot(ctx, cx, y0, 3.5, tint);
    line(ctx, cx, y0, cx, cy + 40, { color: tint, width: 1, dash: [3, 4] });
    ctx.save();
    ctx.strokeStyle = rgba(tint, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
    const r = matVec(rotation2(m * omega), v);
    arrow(ctx, cx, cy, cx + r[0] * 40, cy - r[1] * 40, { color: m === 0 ? QUERY : KEY, width: 2, head: 8, alpha: seg(t, 1 + 0.3 * m, 1.5 + 0.3 * m) });
  }
  text(ctx, 'R_m', P.x + 8, P.y + 20, { font: font.mono, size: 12, color: tint });
  frame(ctx, P);
}

/** Keys, their hull and the attended context for one query. */
function drawLegendreCard(ctx, P, t, tint) {
  const theta = matTVec(M, QUERY_PT);
  const a = weights(theta, KEYS);
  const eta = meanParameter(theta, KEYS);
  drawHull(ctx, P, KEYS, { alpha: 0.9 });
  drawKeys(ctx, P, { alpha: 1, weights: a, labelled: false });
  drawVector(ctx, P, [0, 0], theta, { colour: QUERY, width: 2, head: 9, alpha: seg(t, 1, 1.8) });
  drawKeys(ctx, P, { points: [eta], labels: [''], colour: CONTEXT, labelled: false, alpha: seg(t, 1.8, 2.6) });
  frame(ctx, P);
}

/** The Fisher ellipse at η. */
function drawFisherCard(ctx, P, t, tint) {
  const theta = matTVec(M, QUERY_PT);
  const a = weights(theta, KEYS);
  const eta = meanParameter(theta, KEYS);
  drawKeys(ctx, P, { alpha: 0.9, weights: a, labelled: false });
  drawPath(ctx, P, ellipsePoints(eta, fisher(theta, KEYS), 1), { colour: INFO, width: 2, alpha: seg(t, 1, 1.8), fill: rgba(INFO, 0.15) });
  drawKeys(ctx, P, { points: [eta], labels: [''], colour: CONTEXT, labelled: false });
  const o = [0.6 * eta[0] - 0.9, 0.6 * eta[1] - 0.3];
  drawVector(ctx, P, eta, o, { colour: VALUE, width: 2, head: 9, alpha: seg(t, 2, 2.8), dash: [4, 4] });
  frame(ctx, P);
}

/** A circle of tokens with a gradient arrow (inward along the circle) and a circulation arrow. */
function drawFlowCard(ctx, P, t, tint) {
  const r = 1.7;
  const circle = Array.from({ length: 65 }, (_, i) => [r * Math.cos((2 * Math.PI * i) / 64), r * Math.sin((2 * Math.PI * i) / 64)]);
  drawPath(ctx, P, circle, { colour: color.line, width: 1.5 });
  const angles = [0.3, 0.6, 1.0, 2.2, 2.5, 3.9, 4.2, 4.4, 5.4];
  const spin = 0.25 * seg(t, 1, 3);
  angles.forEach((phi0, i) => {
    const phi = phi0 + spin;
    const p = [r * Math.cos(phi), r * Math.sin(phi)];
    dot(ctx, ...P.point(p), 4.5, KEY);
    if (i === 2) {
      // its velocity: tangential, split into a part towards the cluster (green) and a circulation (rose)
      const tangent = [-Math.sin(phi), Math.cos(phi)];
      drawVector(ctx, P, p, [p[0] - tangent[0] * 0.55, p[1] - tangent[1] * 0.55], { colour: SYM, width: 2.2, head: 8, alpha: seg(t, 1.5, 2.3) });
      drawVector(ctx, P, p, [p[0] + tangent[0] * 0.45, p[1] + tangent[1] * 0.45], { colour: ANTI, width: 2.2, head: 8, alpha: seg(t, 2.3, 3.1) });
    }
  });
  frame(ctx, P);
}

function frame(ctx, P) {
  ctx.save();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(P.x, P.y, P.size, P.size);
  ctx.restore();
}
