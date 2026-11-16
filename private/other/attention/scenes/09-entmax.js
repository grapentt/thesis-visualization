// Scene 09: softmax as an entropy-regularised argmax over the simplex. Swap the Shannon entropy
// for the Tsallis entropy H_α and the maximiser can reach the boundary: α-entmax and sparsemax give
// exact zeros at finite temperature. Sparse attention is a different divergence on the same simplex.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot } from '../../../../src/kit.js';
import { QUERY, INFO, KEY, readout, panel, exampleStamp, header, track } from '../shared.js';
import { scale, softmax, sparsemax, entmax, tsallis, entropy } from '../math.js';
import { drawTriangle, drawSimplexPath, drawPattern, drawBars, trioScores } from '../simplex.js';

const R = 850;
const ENT = '#5ec8c0'; // 1.5-entmax
const SPARSE = '#ef6b6b'; // sparsemax

const VARIATIONAL = tex(String.raw`a = \arg\max_{a \in \Delta}\; \langle a, s\rangle + H(a)`, 'a = argmax_{a∈Δ} ⟨a, s⟩ + H(a)');
const SHANNON = tex(String.raw`H(a) = -\sum_j a_j \log a_j = -\psi^*(a)`, 'H(a) = −Σ a_j log a_j = −ψ*(a)');
const TSALLIS = tex(String.raw`H_\alpha(a) = \frac{1}{\alpha(\alpha-1)} \sum_j \big(a_j - a_j^{\alpha}\big)`, 'H_α(a) = (Σ_j a_j − a_j^α) / (α(α − 1))');
const ENTMAX = tex(String.raw`\alpha\text{-entmax}(s) = \arg\max_{a \in \Delta}\; \langle a, s\rangle + H_\alpha(a)`, 'α-entmax(s) = argmax ⟨a, s⟩ + H_α(a)');
const SOLUTION = tex(String.raw`a_j = \big[(\alpha-1)\,s_j - \tau\big]_+^{1/(\alpha-1)}`, 'a_j = [(α − 1) s_j − τ]₊^{1/(α−1)}');

const QT = [0.6, 1.0];
const S = trioScores(QT);
const MAPS = [
  { name: 'softmax', alpha: 1, colour: INFO, f: (b) => softmax(S, b) },
  { name: '1.5-entmax', alpha: 1.5, colour: ENT, f: (b) => entmax(scale(S, b), 1.5) },
  { name: 'sparsemax', alpha: 2, colour: SPARSE, f: (b) => sparsemax(scale(S, b)) },
];
const BETA_MAX = 4;
const N = 200;
for (const m of MAPS) m.path = Array.from({ length: N + 1 }, (_, i) => m.f((BETA_MAX * i) / N));
/** The β at which the smallest weight first hits zero, and at which the largest reaches one (bisection). */
function threshold(f, test) {
  let lo = 0;
  let hi = 40;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (test(f(mid))) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
for (const m of MAPS) {
  if (m.alpha > 1) {
    m.edge = threshold(m.f, (a) => Math.min(...a) > 0);
    m.vertex = threshold(m.f, (a) => Math.max(...a) < 1);
  }
}
const betaAt = (t) => track(t, [[29, 0], [45, BETA_MAX]], (u) => u);

export default defineScene({
  name: 'Entropy-regularised argmax',
  duration: 62,
  narration: [
    [0, 'Softmax has a variational form: the pattern maximises the score plus the Shannon entropy over the simplex. The entropy is the regulariser that keeps every weight strictly positive, however large the scores. Its negative is the dual potential of the last scene.'],
    [13, 'Swap the Shannon entropy for the Tsallis entropy of order alpha. Alpha one is softmax. Alpha two is sparsemax, the Euclidean projection onto the simplex, and alpha three halves lies between. For any alpha above one the maximiser can sit on the boundary of the triangle, so some weights become exactly zero.'],
    [29, 'Follow the same scores as the inverse temperature rises. Softmax approaches the vertex but never touches an edge. Sparsemax reaches the edge at beta 0.72, where the weight of x5 is exactly zero, and the vertex at beta 1.52. 1.5-entmax does the same at 1.84 and 3.03.'],
    [48, 'Sparse attention is therefore not a different score. It is a different divergence on the same simplex: change the entropy, and you change the geometry of the projection that softmax performs.'],
  ],
  header: header(9, 'SOFTMAX AS A VARIATIONAL PROBLEM', 'Change the entropy, change the geometry'),

  draw(ctx, t) {
    drawTriangle(ctx, { alpha: seg(t, 0.3, 1.5), barycentre: seg(t, 1, 2) });
    const beta = betaAt(t);

    // the three temperature paths and the current patterns
    MAPS.forEach((m, k) => {
      const on = k === 0 ? fade(t, 2, 3) : fade(t, 17 + 3 * k, 18 + 3 * k);
      if (on <= 0.003) return;
      const upto = t < 29 ? N : Math.max(1, Math.round((beta / BETA_MAX) * N));
      const pathAlpha = t < 29 ? 0.5 * on : on;
      drawSimplexPath(ctx, m.path.slice(0, upto + 1), { colour: m.colour, alpha: pathAlpha, width: 3, dash: k === 0 ? [] : k === 1 ? [8, 5] : [3, 5] });
      if (t >= 29) drawPattern(ctx, m.f(beta), { colour: m.colour, alpha: on, r: 7 });
      legend(ctx, k, m, on);
      // the moments where the sparse maps hit the edge and the vertex
      if (m.alpha > 1) {
        const edgeOn = on * fade(t, 29 + (m.edge / BETA_MAX) * 16, 29.6 + (m.edge / BETA_MAX) * 16);
        drawPattern(ctx, m.f(m.edge), { colour: m.colour, alpha: edgeOn, r: 4, halo: true, label: `β = ${m.edge.toFixed(2)}`, labelOffset: [-10, 28] });
        const vertexOn = on * fade(t, 29 + (m.vertex / BETA_MAX) * 16, 29.6 + (m.vertex / BETA_MAX) * 16);
        drawPattern(ctx, m.f(m.vertex), { colour: m.colour, alpha: vertexOn, r: 4, halo: true, label: `β = ${m.vertex.toFixed(2)}`, labelOffset: [-30, k === 1 ? -36 : -56] });
      }
    });
    text(ctx, `β = ${beta.toFixed(2)}`, 740, 300, { font: font.mono, size: 20, color: QUERY, align: 'right', alpha: seg(t, 29, 30) });
    text(ctx, `s = (${S.map((v) => fmt(v)).join(', ')})`, 740, 326, { ...type.note, align: 'right', alpha: seg(t, 2, 3) });

    drawNotes(ctx, t, beta);
    exampleStamp(ctx, seg(t, 2, 3), 'three keys x₁, x₃, x₅ · scores of the query (0.6, 1.0) · everything computed');
  },
});

function legend(ctx, k, m, alpha) {
  const y = 170 + 20 * k;
  line(ctx, 100, y - 5, 130, y - 5, { color: m.colour, width: 3, alpha, dash: k === 0 ? [] : k === 1 ? [8, 5] : [3, 5] });
  text(ctx, `α = ${m.alpha}: ${m.name}${m.alpha > 1 ? `  ·  edge at β = ${m.edge.toFixed(2)}, vertex at β = ${m.vertex.toFixed(2)}` : '  ·  inside for every finite β'}`, 140, y, { font: font.mono, size: 13, color: m.colour, alpha });
}

function drawNotes(ctx, t, beta) {
  VARIATIONAL.draw(ctx, R, 232, { size: 26, alpha: seg(t, 0.8, 1.8) });
  SHANNON.draw(ctx, R, 284, { size: 22, alpha: seg(t, 5, 6) });
  text(ctx, 'strictly concave and infinitely steep at the boundary: no weight is ever exactly zero', R, 322, { ...type.note, alpha: fade(t, 7, 8, 13, 14) });

  const ts = seg(t, 13.5, 14.5);
  TSALLIS.draw(ctx, R, 380, { size: 24, alpha: ts });
  text(ctx, 'α → 1 recovers Shannon; α = 2 is the Gini entropy ½ Σ a_j (1 − a_j)', R, 426, { ...type.note, alpha: seg(t, 15, 16) });
  ENTMAX.draw(ctx, R, 478, { size: 24, alpha: seg(t, 17, 18) });
  SOLUTION.draw(ctx, R, 526, { size: 22, alpha: seg(t, 23, 24) });
  text(ctx, 'τ chosen so the weights sum to one; the bracket is what makes zeros possible', R, 562, { ...type.note, alpha: seg(t, 24, 25) });

  // the weights of the three maps at the current β, and the smallest weight against β
  const bars = seg(t, 29.5, 30.5);
  if (bars > 0.003) {
    MAPS.forEach((m, k) => {
      drawBars(ctx, { x: R + 225 * k, y: 624, values: m.f(beta), colour: m.colour, alpha: bars, title: m.name, width: 110 });
    });
    drawMinPlot(ctx, t, beta, bars * seg(t, 31, 32));
  }
  // the Tsallis entropies of the current softmax pattern, as a reminder that the regulariser differs
  wrap(ctx, 'Martins & Astudillo 2016 (sparsemax); Peters, Niculae & Martins 2019 (α-entmax). Same simplex, same scores, same Fisher metric: only the potential, hence the projection, has changed.', R, 830, 680, 21, { ...type.note, size: 13, color: color.body, alpha: seg(t, 49, 50) });
}

/** The smallest weight of each map against β. */
function drawMinPlot(ctx, t, beta, alpha) {
  if (alpha <= 0.003) return;
  const box = { x: R, y: 704, w: 660, h: 100 };
  const px = box.x + 50;
  const pw = box.w - 80;
  const py = box.y + 10;
  const ph = box.h - 36;
  const X = (b) => px + (b / BETA_MAX) * pw;
  const Y = (v) => py + ph - (v / (1 / 3)) * ph;
  line(ctx, px, py, px, py + ph, { color: color.dim, alpha });
  line(ctx, px, py + ph, px + pw, py + ph, { color: color.dim, alpha });
  for (const b of [0, 1, 2, 3, 4]) text(ctx, String(b), X(b), py + ph + 18, { font: font.mono, size: 12, color: color.muted, align: 'center', alpha });
  text(ctx, '⅓', px - 8, py + 6, { font: font.mono, size: 12, color: color.muted, align: 'right', alpha });
  text(ctx, '0', px - 8, py + ph + 4, { font: font.mono, size: 12, color: color.muted, align: 'right', alpha });
  text(ctx, 'smallest weight', px + 40, py + 4, { font: font.mono, size: 13, color: color.muted, alpha });
  text(ctx, 'β', px + pw + 12, py + ph + 4, { font: font.display, italic: true, size: 18, color: QUERY, alpha });
  const upto = Math.max(1, Math.round((beta / BETA_MAX) * N));
  for (const m of MAPS) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = m.colour;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= upto; i++) {
      const v = Math.min(...m.path[i]);
      const x = X((BETA_MAX * i) / N);
      i ? ctx.lineTo(x, Y(v)) : ctx.moveTo(x, Y(v));
    }
    ctx.stroke();
    ctx.restore();
    if (m.alpha > 1 && beta >= m.edge) dot(ctx, X(m.edge), Y(0), 4, m.colour, alpha);
  }
  line(ctx, X(beta), py, X(beta), py + ph, { color: QUERY, alpha: 0.6 * alpha, dash: [4, 4] });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
