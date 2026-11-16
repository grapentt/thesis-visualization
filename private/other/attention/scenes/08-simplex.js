// Scene 08: the simplex of attention patterns over three keys is dually flat. Scores are the
// e-affine coordinates (straight lines are log-linear), weights the m-affine ones (straight lines
// are mixtures), temperature is an e-geodesic from the barycentre to a vertex, the dual potential
// is negative entropy and the Bregman divergence of ψ is the KL divergence.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, rgba } from '../../../../src/kit.js';
import { M, QUERY, KEY, CONTEXT, INFO, TRIO_KEYS, TRIO_LABELS, readout, panel, pill, exampleStamp, header, track } from '../shared.js';
import { matTVec, scale, add, sub, softmax, weights, logPartition, meanParameter, bregman, kl, entropy, dot as dotp } from '../math.js';
import { drawTriangle, drawSimplexPath, drawPattern, drawEntropyLevels, trioScores, BARYCENTRE } from '../simplex.js';

const R = 850;

const E_COORD = tex(String.raw`s_j = \langle \theta, x_j\rangle\quad\text{(up to a constant)}`, 's_j = ⟨θ, x_j⟩ (up to a constant)');
const M_COORD = tex(String.raw`a_j = \eta_j = \mathbb{E}_a[e_j]`, 'a_j = η_j = E_a[e_j]');
const M_GEO = tex(String.raw`a(u) = (1-u)\,a + u\,a'`, 'a(u) = (1 − u) a + u a′');
const E_GEO = tex(String.raw`a(u) \propto \exp\!\big((1-u)\,s + u\,s'\big)`, 'a(u) ∝ exp((1 − u) s + u s′)');
const TEMP = tex(String.raw`a(\beta) = \operatorname{softmax}(\beta\, s),\qquad \beta = 1/\sqrt{d_k}`, 'a(β) = softmax(β s),  β = 1/√d_k');
const DUAL = tex(String.raw`\psi^*(a) = \sum_j a_j \log a_j = -H(a)`, 'ψ*(a) = Σ_j a_j log a_j = −H(a)');
const BREG = tex(String.raw`B_\psi(\theta, \theta') = \psi(\theta) - \psi(\theta') - \langle \nabla\psi(\theta'),\, \theta - \theta'\rangle = \mathrm{KL}(a' \,\|\, a)`, 'B_ψ(θ, θ′) = ψ(θ) − ψ(θ′) − ⟨∇ψ(θ′), θ − θ′⟩ = KL(a′ ‖ a)');

// two patterns: a from query q₁, a′ from query q₂
const Q1 = [1.2, 0.3];
const Q2 = [-1.0, -0.6];
const THETA1 = matTVec(M, Q1);
const THETA2 = matTVec(M, Q2);
const S1 = trioScores(Q1);
const S2 = trioScores(Q2);
const A1 = softmax(S1);
const A2 = softmax(S2);
const N = 64;
const M_PATH = Array.from({ length: N + 1 }, (_, i) => add(scale(A1, 1 - i / N), scale(A2, i / N)));
const E_PATH = Array.from({ length: N + 1 }, (_, i) => softmax(add(scale(S1, 1 - i / N), scale(S2, i / N))));
// the temperature path of a third query
const QT = [0.6, 1.0];
const ST = trioScores(QT);
const BETA_MAX = 8;
const T_PATH = Array.from({ length: 161 }, (_, i) => softmax(ST, (BETA_MAX * i) / 160));
const betaAt = (t) => track(t, [[31, 0], [43, BETA_MAX]], (u) => u);
// the Bregman picture: ψ along the segment from θ′ to θ
const B_VALUE = bregman(THETA1, THETA2, TRIO_KEYS);
const KL_VALUE = kl(A2, A1);
const SEG = Array.from({ length: 61 }, (_, i) => {
  const u = -0.3 + (1.6 * i) / 60;
  return { u, psi: logPartition(add(THETA2, scale(sub(THETA1, THETA2), u)), TRIO_KEYS) };
});
const SLOPE = dotp(meanParameter(THETA2, TRIO_KEYS), sub(THETA1, THETA2));
const PSI2 = logPartition(THETA2, TRIO_KEYS);

export default defineScene({
  name: 'A dually flat simplex',
  duration: 78,
  narration: [
    [0, 'Take just three keys, so that the simplex of attention patterns is a triangle. A point of it is one weight vector. The pure patterns are the vertices, the even pattern is the barycentre, and the Fisher metric of the last scene is a metric on this triangle.'],
    [13, 'Two coordinate systems are flat on it. In the weights themselves, the mean parameters, straight lines are mixtures: the segment from a to a prime. In the scores, the natural parameters, straight lines are log-linear: the e-geodesic between the same two patterns bows away from the mixture. Amari calls a space with both a dually flat space.'],
    [30, 'Temperature is a straight line in the e-coordinates. Scale the scores of one query by beta. At beta zero the pattern is the barycentre; as beta grows it slides along an e-geodesic to the vertex of the best key, passing the usual scale, one over root d_k, on the way.'],
    [46, 'The dual potential is the negative Shannon entropy, and the level sets of the entropy sit on the triangle like contour lines around the barycentre, where it reaches log three.'],
    [56, 'The Bregman divergence of psi is the KL divergence between patterns: the gap between psi and its tangent, evaluated along the segment from theta prime to theta. Numerically the two agree to every digit, 3.2704 here.'],
    [69, 'So the simplex of attention patterns is dually flat: scores on one side, weights on the other, psi and negative entropy as the two potentials, and KL as the divergence.'],
  ],
  header: header(8, 'A DUALLY FLAT SIMPLEX', 'Scores are e-affine, weights are m-affine'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.5);
    drawEntropyLevels(ctx, { alpha: fade(t, 47, 48.5), colour: INFO });
    drawTriangle(ctx, { alpha: intro, barycentre: seg(t, 5, 6) });

    // the first pattern a, then a′
    const aOn = seg(t, 2, 3);
    drawPattern(ctx, A1, { colour: color.ink, alpha: aOn, label: 'a', halo: t > 2 && t < 13 });
    const a2On = seg(t, 14, 15);
    drawPattern(ctx, A2, { colour: color.ink, alpha: a2On, label: 'a′', labelOffset: [12, 26] });

    // m-geodesic (mixtures, orange) and e-geodesic (log-linear, gold)
    drawSimplexPath(ctx, M_PATH, { colour: CONTEXT, alpha: fade(t, 15, 16), width: 3, progress: lin(t, 15.5, 19) });
    drawSimplexPath(ctx, E_PATH, { colour: QUERY, alpha: fade(t, 20, 21), width: 3, progress: lin(t, 20.5, 24) });
    const mid = fade(t, 24.5, 25.5, 29.5, 30.5);
    drawPattern(ctx, M_PATH[N / 2], { colour: CONTEXT, alpha: mid, r: 5, label: 'u = ½', labelOffset: [10, 24] });
    drawPattern(ctx, E_PATH[N / 2], { colour: QUERY, alpha: mid, r: 5, label: 'u = ½', labelOffset: [-62, -12] });
    legend(ctx, 'm-geodesic: mixtures (1 − u) a + u a′', CONTEXT, 168, fade(t, 15.5, 16.5));
    legend(ctx, 'e-geodesic: log-linear, exp((1 − u) s + u s′)', QUERY, 188, fade(t, 20.5, 21.5));

    // the temperature path
    const beta = betaAt(t);
    const tempOn = fade(t, 30.5, 31.5);
    const upto = Math.min(T_PATH.length - 1, Math.round((beta / BETA_MAX) * 160));
    if (tempOn > 0.003 && upto >= 1) drawSimplexPath(ctx, T_PATH.slice(0, upto + 1), { colour: QUERY, alpha: tempOn, width: 3, dash: [7, 5] });
    const current = softmax(ST, beta);
    drawPattern(ctx, current, { colour: QUERY, alpha: tempOn, r: 7, label: `β = ${fmt(beta, 1)}`, labelOffset: [14, -12] });
    const one = fade(t, 33, 34);
    drawPattern(ctx, softmax(ST, 1), { colour: color.ink, alpha: one, r: 4, label: 'β = 1', labelOffset: [-66, 24] });
    dot(ctx, ...toStageSafe(BARYCENTRE), 5, QUERY, tempOn * (1 - seg(t, 33, 34)));
    legend(ctx, 'temperature: softmax(β s), an e-geodesic from the barycentre to a vertex', QUERY, 208, fade(t, 31, 32));

    // the two patterns' KL, as a note on the triangle
    legend(ctx, 'level sets of the entropy H(a): ln 3 = 1.10 at the barycentre, 0 at the vertices', INFO, 228, fade(t, 47.5, 48.5));
    legend(ctx, `KL(a′ ‖ a) = ${KL_VALUE.toFixed(4)}  ·  B_ψ(θ, θ′) = ${B_VALUE.toFixed(4)}`, INFO, 248, fade(t, 60, 61));

    drawNotes(ctx, t, beta, current);
    exampleStamp(ctx, seg(t, 2, 3), 'three keys x₁, x₃, x₅ · patterns from queries (1.2, 0.3), (−1.0, −0.6), (0.6, 1.0) · everything computed');
  },
});

const toStageSafe = (a) => {
  // the barycentre's stage point (kept local: a tiny helper so the import list stays small)
  const V = [[125, 790], [735, 790], [430, 262]];
  return [a[0] * V[0][0] + a[1] * V[1][0] + a[2] * V[2][0], a[0] * V[0][1] + a[1] * V[1][1] + a[2] * V[2][1]];
};

/** A one-line legend above the triangle. */
function legend(ctx, s, tint, y, alpha) {
  if (alpha <= 0.003) return;
  line(ctx, 100, y - 5, 130, y - 5, { color: tint, width: 3, alpha });
  text(ctx, s, 140, y, { font: font.mono, size: 13, color: tint, alpha });
}

function drawNotes(ctx, t, beta, current) {
  // the two coordinate systems
  const coords = seg(t, 13.5, 14.5);
  pill(ctx, 'e-affine', R, 232, QUERY, coords);
  E_COORD.draw(ctx, R + 120, 232, { size: 22, alpha: coords });
  text(ctx, 'the scores: natural parameters, straight lines are log-linear', R, 262, { ...type.note, alpha: coords });
  pill(ctx, 'm-affine', R, 306, CONTEXT, coords);
  M_COORD.draw(ctx, R + 120, 306, { size: 22, alpha: coords });
  text(ctx, 'the weights: mean parameters, since the sufficient statistic of pattern j is e_j', R, 336, { ...type.note, alpha: coords });
  M_GEO.draw(ctx, R, 392, { size: 24, alpha: seg(t, 15.5, 16.5) });
  E_GEO.draw(ctx, R, 440, { size: 24, alpha: seg(t, 20.5, 21.5) });
  readout(ctx, 'a =', `(${A1.map((v) => v.toFixed(2)).join(', ')})`, R + 380, 398, { colour: color.body, size: 15, alpha: seg(t, 3, 4) });
  readout(ctx, 'a′ =', `(${A2.map((v) => v.toFixed(2)).join(', ')})`, R + 380, 426, { colour: color.body, size: 15, alpha: seg(t, 14.5, 15.5) });
  readout(ctx, 's =', `(${S1.map((v) => fmt(v)).join(', ')})`, R + 380, 454, { colour: color.muted, size: 15, alpha: seg(t, 20.5, 21.5) });
  readout(ctx, 's′ =', `(${S2.map((v) => fmt(v)).join(', ')})`, R + 380, 482, { colour: color.muted, size: 15, alpha: seg(t, 20.5, 21.5) });

  // temperature
  const temp = fade(t, 31, 32, 55, 56);
  TEMP.draw(ctx, R, 520, { size: 24, alpha: temp });
  readout(ctx, 'a(β) =', `(${current.map((v) => v.toFixed(3)).join(', ')})`, R, 562, { colour: QUERY, size: 16, alpha: temp });
  text(ctx, `s = (${ST.map((v) => fmt(v)).join(', ')}) for the query (0.6, 1.0)`, R, 590, { ...type.note, alpha: temp });
  text(ctx, 'a straight line β ↦ β s in the e-coordinates: an e-geodesic', R, 616, { ...type.note, color: QUERY, alpha: temp });

  // the dual potential
  const dual = seg(t, 46.5, 47.5);
  const lift = seg(t, 55.5, 56.5); // makes room for the Bregman picture
  DUAL.draw(ctx, R, 672 - 188 * lift, { size: 24 - 4 * lift, alpha: dual });
  text(ctx, `at the barycentre H = ln 3 = ${Math.log(3).toFixed(3)} nats; at a vertex H = 0`, R, 712, { ...type.note, alpha: fade(t, 47.5, 48.5, 55.5, 56.5) });

  // the Bregman picture
  const breg = seg(t, 56, 57);
  if (breg > 0.003) {
    BREG.draw(ctx, R, 520, { size: 20, alpha: breg });
    drawBregmanPanel(ctx, t, breg);
  }
}

/** ψ along the segment θ′ + u (θ − θ′), its tangent at θ′, and the gap at u = 1. */
function drawBregmanPanel(ctx, t, alpha) {
  const box = { x: R, y: 560, w: 660, h: 270 };
  panel(ctx, box.x, box.y, box.w, box.h, { alpha });
  const px = box.x + 60;
  const pw = box.w - 90;
  const py = box.y + 40;
  const ph = box.h - 86;
  const tangent = (u) => PSI2 + SLOPE * u;
  const lo = Math.min(...SEG.map((s) => s.psi), tangent(1.3)) - 0.3;
  const hi = Math.max(...SEG.map((s) => s.psi)) + 0.3;
  const X = (u) => px + ((u + 0.3) / 1.6) * pw;
  const Y = (v) => py + ph - ((v - lo) / (hi - lo)) * ph;
  line(ctx, px, py, px, py + ph, { color: color.dim, alpha });
  line(ctx, px, py + ph, px + pw, py + ph, { color: color.dim, alpha });
  for (const [u, label] of [[0, 'θ′'], [1, 'θ']]) {
    line(ctx, X(u), py + ph, X(u), py + ph + 6, { color: color.dim, alpha });
    text(ctx, label, X(u), py + ph + 24, { font: font.display, italic: true, size: 18, color: QUERY, align: 'center', alpha });
  }
  text(ctx, 'ψ along the segment from θ′ to θ', box.x + 16, box.y + 24, { font: font.mono, size: 14, color: INFO, alpha });
  // the curve
  const prog = lin(t, 57, 60);
  const n = Math.max(1, Math.round((SEG.length - 1) * prog));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = INFO;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) i ? ctx.lineTo(X(SEG[i].u), Y(SEG[i].psi)) : ctx.moveTo(X(SEG[i].u), Y(SEG[i].psi));
  ctx.stroke();
  ctx.restore();
  // the tangent at θ′
  const tan = alpha * seg(t, 60, 61);
  line(ctx, X(-0.3), Y(tangent(-0.3)), X(1.3), Y(tangent(1.3)), { color: color.muted, width: 1.5, alpha: tan, dash: [6, 5] });
  text(ctx, 'tangent at θ′', X(1.3), Y(tangent(1.3)) - 12, { font: font.mono, size: 13, color: color.muted, alpha: tan, align: 'right' });
  dot(ctx, X(0), Y(PSI2), 5, INFO, tan);
  // the gap at θ
  const gap = alpha * seg(t, 61.5, 62.5);
  const psi1 = SEG.find((s) => Math.abs(s.u - 1) < 1e-9)?.psi ?? logPartition(THETA1, TRIO_KEYS);
  line(ctx, X(1), Y(tangent(1)), X(1), Y(psi1), { color: INFO, width: 3, alpha: gap });
  dot(ctx, X(1), Y(psi1), 5, INFO, gap);
  dot(ctx, X(1), Y(tangent(1)), 4, color.muted, gap);
  text(ctx, `B_ψ(θ, θ′) = ${B_VALUE.toFixed(4)}`, X(1) - 12, (Y(tangent(1)) + Y(psi1)) / 2 - 6, { font: font.mono, size: 14, color: INFO, alpha: gap, align: 'right' });
  text(ctx, `KL(a′ ‖ a) = ${KL_VALUE.toFixed(4)}`, X(1) - 12, (Y(tangent(1)) + Y(psi1)) / 2 + 14, { font: font.mono, size: 14, color: INFO, alpha: gap, align: 'right' });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
