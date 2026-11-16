// Scene 10: normalised embeddings. With M = κI the kernel e^{κ⟨x̂_i, x̂_j⟩} is the von Mises–Fisher
// density on the sphere (here a circle), the attention weights are the responsibilities of a vMF
// mixture whose components sit at the keys, and the output is the responsibility-weighted mean. In
// flat space the same weights come from a Gaussian mixture with equal covariances once key norms
// are constant.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, ring, rgba } from '../../../../src/kit.js';
import { KEYS, KEY_LABELS, QUERY, KEY, CONTEXT, INFO, chart, drawPlane, drawKeys, drawVector, drawPath, weightBars, readout, exampleStamp, chartCaption, header, track } from '../shared.js';
import { normalize, responsibilities, vonMises, softmax, dot as dotp, entropy } from '../math.js';

const P = chart({ extent: 1.9 });
const R = 850;
const H = 0.5; // height of the tallest bump, in units of the radius

const KERNEL = tex(String.raw`a_{ij} = \frac{e^{\kappa\langle \hat x_i, \hat x_j\rangle}}{\sum_k e^{\kappa\langle \hat x_i, \hat x_k\rangle}} = \frac{f(\hat x_i;\, \hat x_j, \kappa)}{\sum_k f(\hat x_i;\, \hat x_k, \kappa)}`, 'a_ij = e^{κ⟨x̂ᵢ,x̂ⱼ⟩} / Σₖ e^{κ⟨x̂ᵢ,x̂ₖ⟩} = f(x̂ᵢ; x̂ⱼ, κ) / Σₖ f(x̂ᵢ; x̂ₖ, κ)');
const VMF = tex(String.raw`f(x;\, \mu, \kappa) = C_d(\kappa)\, e^{\kappa\langle \mu, x\rangle},\qquad x \in S^{d-1}`, 'f(x; μ, κ) = C_d(κ) e^{κ⟨μ, x⟩},  x ∈ S^{d−1}');
const MEAN = tex(String.raw`\eta = \sum_j r_j\, \hat x_j,\qquad \text{then}\ \eta / \|\eta\|`, 'η = Σⱼ rⱼ x̂ⱼ,  then η / ‖η‖');
const GAUSS = tex(String.raw`\|q - k_j\|^2 = \|q\|^2 + \|k_j\|^2 - 2\, q\cdot k_j`, '‖q − kⱼ‖² = ‖q‖² + ‖kⱼ‖² − 2 q·kⱼ');
const SAME = tex(String.raw`\mathrm{softmax}_j\Big(-\tfrac{\|q - k_j\|^2}{2\sigma^2}\Big) = \mathrm{softmax}_j\Big(\tfrac{q\cdot k_j}{\sigma^2}\Big)\quad\text{if } \|k_j\| \text{ is constant}`, 'softmaxⱼ(−‖q − kⱼ‖²/2σ²) = softmaxⱼ(q·kⱼ/σ²) if ‖kⱼ‖ is constant');

const UNIT = KEYS.map(normalize);
const MUS = UNIT.map((k) => Math.atan2(k[1], k[0]));
const HAT_LABELS = ['x̂₁', 'x̂₂', 'x̂₃', 'x̂₄', 'x̂₅', 'x̂₆', 'x̂₇'];
const SAMPLES = 240;

/** The concentration over the scene: κ = 2, sharpened to 8, then relaxed to 3. */
const kappaAt = (t) => track(t, [[0, 2], [27, 2], [33, 8], [41, 8], [46, 3]]);
/** The query direction: one slow lap, pausing while the bumps sharpen. */
const phiAt = (t) => 0.5 + ((2 * Math.PI) / 44) * (t - 3 * seg(t, 27, 41)) ;

export default defineScene({
  name: 'On the sphere: von Mises–Fisher',
  duration: 65,
  narration: [
    [0, 'Normalise the embeddings, as QK-norm does, and take M to be kappa times the identity. The kernel e to the kappa times the cosine is then a density on the sphere: the von Mises–Fisher density with its mean direction at the key and concentration kappa. Here the sphere is a circle, and each key carries one bump.'],
    [14, 'A query direction sees all seven bumps at once. Its attention weights are the heights of the bumps at that angle, divided by their sum: the posterior responsibilities of a mixture whose components sit at the keys, with equal prior weights. Softmax is the E-step of a mixture model.'],
    [27, 'Raise kappa and the bumps sharpen. The responsibilities collapse onto the nearest key, exactly as attention sharpens with a larger inverse temperature. The output is the responsibility-weighted mean of the keys, a point inside the sphere, which the next normalisation pushes back out.'],
    [46, 'The flat-space reading is the same. A Gaussian mixture with equal covariances has responsibilities softmax of minus the squared distances. Expand the square: when all keys have the same norm only the dot product survives. Attention with constant key norms is the E-step of that mixture, with sigma squared as the temperature.'],
  ],
  header: header(10, 'ON THE SPHERE', 'Attention weights as mixture responsibilities'),

  draw(ctx, t) {
    const kappa = kappaAt(t);
    const phi = phiAt(t);
    const q = [Math.cos(phi), Math.sin(phi)];
    const r = responsibilities(phi, MUS, kappa);
    const eta = [0, 1].map((k) => UNIT.reduce((s, x, j) => s + r[j] * x[k], 0));
    const etaNorm = Math.hypot(eta[0], eta[1]);
    const intro = seg(t, 0.3, 1.3);

    drawPlane(ctx, P, { alpha: intro, grid: false });
    // the circle
    const circle = Array.from({ length: 121 }, (_, i) => [Math.cos((2 * Math.PI * i) / 120), Math.sin((2 * Math.PI * i) / 120)]);
    drawPath(ctx, P, circle, { colour: color.line, alpha: intro, width: 1.5, close: true });
    const [sx, sy] = P.point([1, 0]);
    text(ctx, 'S¹', sx + 8, sy - 10, { font: font.display, italic: true, size: 18, color: color.muted, alpha: intro });

    // one bump per key, then the mixture
    // every bump is drawn to the same scale, so their stack is exactly the mixture curve
    const bumps = seg(t, 4, 6);
    const mixMax = Math.max(...Array.from({ length: SAMPLES }, (_, i) => mixture((2 * Math.PI * i) / SAMPLES, kappa)));
    UNIT.forEach((_, j) => {
      const a = bumps * seg(t, 4 + 0.25 * j, 5 + 0.25 * j);
      const { band, outer } = bump(MUS[j], kappa, mixMax);
      drawPath(ctx, P, band, { colour: 'rgba(0,0,0,0)', alpha: a, width: 0, close: true, fill: rgba(KEY, 0.13) });
      drawPath(ctx, P, outer, { colour: KEY, alpha: 0.3 * a, width: 1 });
    });
    const mixOn = seg(t, 7, 8);
    const mixture_ = polar((ph) => 1 + (H * mixture(ph, kappa)) / mixMax);
    drawPath(ctx, P, mixture_, { colour: KEY, alpha: 0.9 * mixOn, width: 2.2, close: true });

    // keys on the circle, sized by their responsibility once the query is there
    const queryOn = seg(t, 14, 15);
    drawKeys(ctx, P, { points: UNIT, labels: HAT_LABELS, alpha: seg(t, 1.5, 2.5), weights: queryOn > 0.5 ? r : null });

    // the query direction and the radial line through the bumps
    const tipR = 1 + (H * mixture(phi, kappa)) / mixMax;
    drawPath(ctx, P, [[0, 0], [tipR * q[0], tipR * q[1]]], { colour: QUERY, alpha: 0.6 * queryOn, width: 1.5, dash: [5, 5] });
    drawVector(ctx, P, [0, 0], q, { colour: QUERY, alpha: queryOn, width: 3 });
    const [lx, ly] = P.point([0.72 * q[0], 0.72 * q[1]]);
    text(ctx, 'x̂_i', lx + 10 * q[1], ly + 10 * q[0] + 8, { font: font.display, italic: true, size: 22, color: QUERY, alpha: queryOn, align: 'center' });
    // the mixture height at the query's angle, split by responsibility
    if (queryOn > 0.003) {
      let from = 1;
      const total = tipR - 1;
      r.forEach((rj, j) => {
        const to = from + rj * total;
        drawPath(ctx, P, [[from * q[0], from * q[1]], [to * q[0], to * q[1]]], { colour: j % 2 ? KEY : color.ink, alpha: queryOn, width: 7 });
        from = to;
      });
    }

    // the output: the weighted mean inside the circle, normalised back out
    const outOn = seg(t, 36, 37);
    drawPath(ctx, P, [eta, [eta[0] / etaNorm, eta[1] / etaNorm]], { colour: CONTEXT, alpha: 0.8 * outOn, width: 1.5, dash: [4, 4] });
    dot(ctx, ...P.point(eta), 7, CONTEXT, outOn);
    ring(ctx, ...P.point([eta[0] / etaNorm, eta[1] / etaNorm]), 7, CONTEXT, outOn, 2);
    const [ex, ey] = P.point(eta);
    text(ctx, 'η', ex + 10, ey + 20, { font: font.display, italic: true, size: 20, color: CONTEXT, alpha: outOn });
    text(ctx, '‖η‖ = ' + fmt(etaNorm), ex + 10, ey + 42, { font: font.mono, size: 13, color: CONTEXT, alpha: outOn });

    chartCaption(ctx, P, t < 14 ? 'one von Mises bump e^{κ cos(φ − μ_j)} per key, stacked outside the circle · bright: their sum' : t < 46 ? 'the radial bar at the query: the mixture height, split by responsibility' : 'the same seven weights, read as a Gaussian mixture in the plane', fade(t, 4.5, 5.5));

    drawNotes(ctx, t, kappa, phi, q, r);
    exampleStamp(ctx, seg(t, 2, 3), 'd = 2, S¹ · the seven keys normalised · M = κ I · everything computed');
  },
});

/** Σ_j e^{κ cos(φ − μ_j)}. */
function mixture(phi, kappa) {
  return MUS.reduce((s, mu) => s + vonMises(phi, mu, kappa), 0);
}

/** One von Mises bump as a band between the circle and 1 + H f/scale, over the arc where f/e^κ > 0.05. */
function bump(mu, kappa, scale) {
  const w = Math.acos(Math.max(-1, 1 + Math.log(0.05) / kappa));
  const n = 80;
  const outer = Array.from({ length: n + 1 }, (_, i) => {
    const ph = mu - w + (2 * w * i) / n;
    const rr = 1 + (H * vonMises(ph, mu, kappa)) / scale;
    return [rr * Math.cos(ph), rr * Math.sin(ph)];
  });
  const inner = Array.from({ length: n + 1 }, (_, i) => {
    const ph = mu + w - (2 * w * i) / n;
    return [Math.cos(ph), Math.sin(ph)];
  });
  return { band: [...outer, ...inner], outer };
}

/** A closed polar curve r(φ). */
function polar(radius) {
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const ph = (2 * Math.PI * i) / SAMPLES;
    const rr = radius(ph);
    return [rr * Math.cos(ph), rr * Math.sin(ph)];
  });
}

function drawNotes(ctx, t, kappa, phi, q, r) {
  KERNEL.draw(ctx, R, 232, { size: 24, alpha: seg(t, 0.8, 1.8) });
  VMF.draw(ctx, R, 292, { size: 23, alpha: seg(t, 2.5, 3.5) });
  text(ctx, 'the normaliser C_d(κ) is the same for every key, so it cancels in the weights', R, 326, { ...type.note, alpha: seg(t, 3.5, 4.5) });

  // the responsibilities
  const bars = seg(t, 15, 16);
  weightBars(ctx, { x: R, y: 386, width: 300, rowHeight: 27, values: r, labels: HAT_LABELS, colour: KEY, alpha: bars, title: 'responsibilities r_j = attention weights a_ij', digits: 3 });
  readout(ctx, 'κ =', kappa, R + 430, 386, { colour: QUERY, alpha: bars, digits: 1 });
  readout(ctx, 'φ_i =', `${((((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) * (180 / Math.PI)).toFixed(0)}°`, R + 430, 414, { colour: QUERY, alpha: bars });
  readout(ctx, 'H(r) =', entropy(r), R + 430, 442, { colour: INFO, alpha: bars, digits: 2 });
  text(ctx, 'nats; log 7 = 1.95', R + 430, 464, { ...type.note, size: 13, alpha: bars });
  text(ctx, `largest r_j = ${fmt(Math.max(...r), 3)}`, R + 430, 500, { font: font.mono, size: 15, color: KEY, alpha: bars * seg(t, 28, 29) });
  wrap(ctx, 'the E-step of a mixture model: the posterior responsibilities of a vMF mixture with equal priors and the keys as centres', R, 594, 690, 20, { ...type.note, size: 14, color: color.body, alpha: fade(t, 20, 21, 45.5, 46.5) });

  // the output
  MEAN.draw(ctx, R, 626, { size: 23, alpha: fade(t, 36.5, 37.5, 45.5, 46.5) });
  wrap(ctx, 'The responsibility-weighted mean lies inside the sphere (‖η‖ < 1, and the sharper the weights, the closer to the surface). QK-norm or the next LayerNorm projects it back: the hyperspherical idealisation.', R, 662, 690, 26, { ...type.note, size: 15, color: color.body, alpha: fade(t, 37.5, 38.5, 45.5, 46.5) });

  // the Gaussian mixture reading
  const g = seg(t, 46.5, 47.5);
  GAUSS.draw(ctx, R, 626, { size: 24, alpha: g });
  SAME.draw(ctx, R, 684, { size: 21, alpha: seg(t, 51, 52) });
  const sigma2 = 1 / kappa;
  const byDistance = softmax(UNIT.map((k) => -((q[0] - k[0]) ** 2 + (q[1] - k[1]) ** 2) / (2 * sigma2)));
  const byDot = softmax(UNIT.map((k) => dotp(q, k) / sigma2));
  const diff = Math.max(...byDistance.map((v, j) => Math.abs(v - byDot[j])));
  const check = seg(t, 54, 55);
  readout(ctx, 'σ² = 1/κ =', sigma2, R, 736, { colour: QUERY, alpha: check, digits: 3 });
  text(ctx, `max |softmax(−‖q − k_j‖²/2σ²) − softmax(q·k_j/σ²)| = ${diff === 0 ? '0' : diff.toExponential(0)}`, R, 766, { font: font.mono, size: 15, color: INFO, alpha: check });
  wrap(ctx, 'Gaussian components of equal covariance σ²I at the keys: ‖q‖² and the constant ‖k_j‖² cancel in the softmax, and the responsibilities are exactly the attention weights with β = 1/σ².', R, 800, 690, 26, { ...type.note, size: 15, color: color.body, alpha: seg(t, 56, 57) });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
