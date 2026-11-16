// Scene 07: the Fisher information of the key family, ∇²ψ(θ) = Cov_a[x_j], drawn as the
// one-standard-deviation ellipse of the attended keys. It is also the Jacobian of the head's output
// in its query: wiggle the query and the context moves by β Cov Mᵀ δ, until attention collapses
// onto one key and the Fisher metric degenerates.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, rgba } from '../../../../src/kit.js';
import { KEYS, M, QUERY, KEY, CONTEXT, INFO, chart, drawPlane, drawKeys, drawQuery, drawVector, drawPath, matrix2, readout, panel, exampleStamp, chartCaption, header, track, clipped } from '../shared.js';
import { matTVec, scale, weights, meanParameter, fisher, entropy, trace, ellipsePoints } from '../math.js';

const P = chart();
const R = 850;

const HESSIAN = tex(String.raw`\nabla^2\psi(\theta) = \operatorname{Cov}_{a}[x_j] = \sum_j a_j\,(x_j - \eta)(x_j - \eta)^{\top}`, '∇²ψ(θ) = Cov_a[x_j] = Σ_j a_j (x_j − η)(x_j − η)ᵀ');
const THETA = tex(String.raw`\theta = \beta\, M^{\top} x_i,\qquad \eta = \nabla\psi(\theta)`, 'θ = β Mᵀ xᵢ,  η = ∇ψ(θ)');
const JACOBIAN = tex(String.raw`\frac{\partial o_i}{\partial x_i} = W_V\,\frac{\partial \eta}{\partial x_i} = \beta\, W_V\, \operatorname{Cov}_{a}[x_j]\, M^{\top}`, '∂oᵢ/∂xᵢ = β W_V Cov_a[x_j] Mᵀ');
const VERTEX = tex(String.raw`a \to e_k:\quad \operatorname{Cov}_a[x_j] \to 0`, 'a → e_k:  Cov_a[x_j] → 0');

const XI = [-1.0, -0.6];
const THETA0 = matTVec(M, XI);
const WIGGLE_R = 0.15;
const WIGGLE_N = 48;
/** β over the scene: 1, down to 0.2, up through 1 to 10 (collapse), back to 1. */
const betaAt = (t) => Math.exp(track(t, [[13, 0], [16, 0], [22, Math.log(0.2)], [26, Math.log(0.2)], [32, 0], [40, Math.log(10)], [50, Math.log(10)], [56, 0]]));

// the entropy and the trace of the Fisher matrix against β, for the two small plots
const BETAS = Array.from({ length: 81 }, (_, i) => Math.pow(10, -1 + (2 * i) / 80));
const CURVES = BETAS.map((b) => {
  const th = scale(THETA0, b);
  return { beta: b, H: entropy(weights(th, KEYS)), tr: trace(fisher(th, KEYS)) };
});
const H_MAX = Math.log(KEYS.length);
const TR_MAX = 2.8;

export default defineScene({
  name: 'The Fisher metric',
  duration: 72,
  narration: [
    [0, 'Fix the query and ask how sensitive the head is to it. The attended context is the gradient of psi, so its derivative is the Hessian of psi: the Fisher information of the family. For an exponential family, that Hessian is the covariance of the sufficient statistic, here the covariance of the keys under the attention weights.'],
    [15, 'Draw it as the one-standard-deviation ellipse of the attended keys, centred on the context. Lower the inverse temperature and the weights even out: the ellipse grows to the covariance of all seven keys. Raise it, and the context slides to the most attended key while the ellipse shrinks. At a vertex of the simplex, with all weight on one key, the Fisher information is zero.'],
    [33, 'The same Hessian is the Jacobian of the output in the query. Wiggle the query around a small circle and watch the context: the image is that circle pushed through beta times the covariance times M transposed. With spread-out attention the context responds. Once attention has collapsed onto one key, the whole circle of queries maps to almost a point: the head has stopped listening to its query.'],
    [52, 'Plot the entropy of the weights and the trace of the Fisher matrix against beta: they fall together, from 1.9 nats and 2.6 at beta 0.2 to 0.05 nats and 0.02 at beta 10. That is the geometric content of attention entropy collapse in training: a sharp head sits near a vertex of the simplex, where the Fisher metric degenerates and gradients through the softmax vanish.'],
    [65, 'Attention is most sensitive to its query exactly when the attended keys are spread out, and the Fisher metric is the measure of that spread.'],
  ],
  header: header(7, 'THE FISHER METRIC', 'How sensitive the head is to its query'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    drawPlane(ctx, P, { alpha: intro });
    const beta = betaAt(t);
    const theta = scale(THETA0, beta);
    const a = weights(theta, KEYS);
    const eta = meanParameter(theta, KEYS);
    const F = fisher(theta, KEYS);

    // the ellipse of the attended keys
    const ell = fade(t, 8, 9.5);
    if (ell > 0.003) {
      clipped(ctx, P, () => drawPath(ctx, P, ellipsePoints(eta, F, 1, 72), { colour: INFO, alpha: ell, width: 2.5, fill: rgba(INFO, 0.12) }));
    }
    // the keys, sized by their weights, the query and the context
    drawKeys(ctx, P, { alpha: seg(t, 1, 2), weights: t > 4 ? a : null });
    drawQuery(ctx, P, XI, { alpha: seg(t, 2.5, 3.5), labelOffset: t > 34 && t < 64 ? [-48, 34] : [12, -12] });
    const ctxOn = seg(t, 5, 6);
    dot(ctx, ...P.point(eta), 7, CONTEXT, ctxOn);
    text(ctx, 'η', P.X(eta[0]) + 12, P.Y(eta[1]) - 10, { font: font.display, italic: true, size: 22, color: CONTEXT, alpha: ctxOn });

    // the wiggle: a circle of queries and its exact image around η
    const wig = fade(t, 34, 35.5, 63, 64.5);
    if (wig > 0.003) {
      const circle = [];
      const image = [];
      for (let k = 0; k <= WIGGLE_N; k++) {
        const phi = (2 * Math.PI * k) / WIGGLE_N;
        const d = [WIGGLE_R * Math.cos(phi), WIGGLE_R * Math.sin(phi)];
        const xq = [XI[0] + d[0], XI[1] + d[1]];
        circle.push(xq);
        image.push(meanParameter(scale(matTVec(M, xq), beta), KEYS));
      }
      drawPath(ctx, P, circle, { colour: QUERY, alpha: wig, width: 2, dash: [5, 4] });
      drawPath(ctx, P, image, { colour: CONTEXT, alpha: wig, width: 2.5 });
      // one perturbed query and its image, moving around the circle
      const phi = 2 * Math.PI * ((t - 34) / 6);
      const d = [WIGGLE_R * Math.cos(phi), WIGGLE_R * Math.sin(phi)];
      const xq = [XI[0] + d[0], XI[1] + d[1]];
      const im = meanParameter(scale(matTVec(M, xq), beta), KEYS);
      dot(ctx, ...P.point(xq), 5, QUERY, wig);
      dot(ctx, ...P.point(im), 5, CONTEXT, wig);
      drawVector(ctx, P, XI, xq, { colour: QUERY, alpha: 0.9 * wig, width: 1.5, head: 7, label: 'δ', labelShift: [6, -6] });
      drawVector(ctx, P, eta, im, { colour: CONTEXT, alpha: 0.9 * wig, width: 1.5, head: 7 });
      const maxR = Math.max(...image.map((p) => Math.hypot(p[0] - eta[0], p[1] - eta[1])));
      text(ctx, `queries x_i + δ, |δ| = ${WIGGLE_R.toFixed(2)}  →  contexts, up to ${fmt(maxR, 3)} away from η`, P.x, P.y + P.size + 28, { ...type.note, color: CONTEXT, alpha: wig });
    }

    chartCaption(ctx, P, t < 34 || t > 63 ? 'one-standard-deviation ellipse of the attended keys: ∇²ψ(θ) = Cov_a[x_j]' : 'a circle of queries (gold, dashed) and its exact image in the contexts (orange)', fade(t, 9, 10), { color: t < 34 || t > 63 ? INFO : color.body });
    readout(ctx, 'β =', beta, P.x + P.size - 8, P.y + P.size - 12, { colour: QUERY, alpha: seg(t, 13, 14), align: 'right', size: 18 });
    text(ctx, `a_max = ${fmt(Math.max(...a))}`, P.x + P.size - 8, P.y + P.size - 36, { font: font.mono, size: 14, color: KEY, alpha: seg(t, 13, 14), align: 'right' });

    drawNotes(ctx, t, beta, a, F);
    exampleStamp(ctx, seg(t, 2, 3), 'x_i = (−1.0, −0.6) · θ = β Mᵀ x_i · everything computed');
  },
});

function drawNotes(ctx, t, beta, a, F) {
  THETA.draw(ctx, R, 228, { size: 24, alpha: seg(t, 1, 2) });
  HESSIAN.draw(ctx, R, 288, { size: 24, alpha: seg(t, 5, 6) });
  text(ctx, 'the covariance of the sufficient statistic: here, of the keys', R, 328, { ...type.note, alpha: seg(t, 7, 8) });

  // the matrix at the current β, with its trace and the entropy
  const mat = seg(t, 15.5, 16.5);
  matrix2(ctx, R + 110, 410, F, { label: 'Cov_a =', colour: INFO, alpha: mat, size: 22 });
  readout(ctx, 'tr Cov =', trace(F), R + 300, 400, { colour: INFO, alpha: mat });
  readout(ctx, 'H(a) =', entropy(a), R + 300, 428, { colour: color.ink, alpha: mat, digits: 3 });
  text(ctx, 'nats, of ln 7 = 1.95', R + 440, 428, { ...type.note, size: 13, alpha: mat });
  VERTEX.draw(ctx, R, 490, { size: 22, alpha: fade(t, 27, 28, 33, 34) });
  text(ctx, 'at a vertex of the simplex the family has no spread left', R + 300, 496, { ...type.note, alpha: fade(t, 27.5, 28.5, 33, 34) });

  // the Jacobian
  JACOBIAN.draw(ctx, R, 490, { size: 24, alpha: seg(t, 34, 35) });
  text(ctx, 'the head is most sensitive where the attended keys are spread out', R, 534, { ...type.note, alpha: fade(t, 36, 37, 51, 52) });

  // the two small plots: H(a) and tr Cov against β
  const plots = seg(t, 52, 53);
  if (plots > 0.003) drawPlots(ctx, t, beta, plots);
  wrap(ctx, 'Entropy collapse (Zhai et al. 2023): heads whose weights sharpen towards a vertex become unstable; here that is the Fisher metric going to zero.', R, 840, 660, 22, { ...type.note, size: 14, color: color.body, alpha: seg(t, 58, 59) });
}

/** Two panels: H(a) and tr Cov_a[x_j] against β on a log axis, with the current β marked. */
function drawPlots(ctx, t, beta, alpha) {
  const specs = [
    { x: R, key: 'H', max: H_MAX, label: 'H(a)  (nats)', colour: color.ink, ticks: [0, 1, 1.95] },
    { x: R + 345, key: 'tr', max: TR_MAX, label: 'tr Cov_a[x_j]', colour: INFO, ticks: [0, 1, 2] },
  ];
  for (const s of specs) {
    const box = { x: s.x, y: 560, w: 310, h: 250 };
    panel(ctx, box.x, box.y, box.w, box.h, { alpha });
    const px = box.x + 56;
    const pw = box.w - 76;
    const py = box.y + 36;
    const ph = box.h - 80;
    const X = (b) => px + ((Math.log10(b) + 1) / 2) * pw;
    const Y = (v) => py + ph - (v / s.max) * ph;
    line(ctx, px, py, px, py + ph, { color: color.dim, alpha });
    line(ctx, px, py + ph, px + pw, py + ph, { color: color.dim, alpha });
    for (const b of [0.1, 1, 10]) {
      line(ctx, X(b), py + ph, X(b), py + ph + 5, { color: color.dim, alpha });
      text(ctx, String(b), X(b), py + ph + 20, { font: font.mono, size: 12, color: color.muted, align: 'center', alpha });
    }
    for (const v of s.ticks) text(ctx, v.toFixed(v === 1.95 ? 2 : 0), px - 8, Y(v) + 4, { font: font.mono, size: 12, color: color.muted, align: 'right', alpha });
    text(ctx, 'β', px + pw + 10, py + ph + 4, { font: font.display, italic: true, size: 18, color: QUERY, alpha });
    text(ctx, s.label, box.x + 16, box.y + 22, { font: font.mono, size: 14, color: s.colour, alpha });
    // the curve, traced over 53–58
    const prog = lin(t, 53, 58);
    const n = Math.max(1, Math.round((CURVES.length - 1) * prog));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = s.colour;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const c = CURVES[i];
      i ? ctx.lineTo(X(c.beta), Y(c[s.key])) : ctx.moveTo(X(c.beta), Y(c[s.key]));
    }
    ctx.stroke();
    ctx.restore();
    // the current β
    const mark = alpha * seg(t, 58, 58.6);
    line(ctx, X(beta), py, X(beta), py + ph, { color: QUERY, alpha: 0.7 * mark, dash: [4, 4] });
    const value = s.key === 'H' ? entropy(weights(scale(THETA0, beta), KEYS)) : trace(fisher(scale(THETA0, beta), KEYS));
    dot(ctx, X(beta), Y(value), 5, s.colour, mark);
  }
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
