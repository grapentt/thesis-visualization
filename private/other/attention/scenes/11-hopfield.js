// Scene 11: the modern Hopfield view. E(ξ) = −β⁻¹ log Σ_j e^{β⟨x_j, ξ⟩} + ½‖ξ‖² is an energy on the
// residual stream with the keys as stored patterns; its minimising update ξ ↦ X softmax(β Xᵀ ξ) is
// one attention step with the keys as values, and ∇ψ(βξ) once more. Small β merges the patterns
// into one metastable minimum, large β makes every pattern its own minimum (retrieval).

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, dot, ring, arrow, rgba } from '../../../../src/kit.js';
import { KEYS, KEY_LABELS, QUERY, KEY, CONTEXT, INFO, chart, drawPlane, drawKeys, drawContours, drawHeatmap, heatmapImage, defaultRamp, readout, exampleStamp, chartCaption, header, track, clipped } from '../shared.js';
import { hopfieldEnergy, hopfieldUpdate } from '../math.js';

const P = chart();
const R = 850;

const ENERGY = tex(String.raw`E(\xi) = -\frac{1}{\beta}\log\sum_j e^{\beta\langle x_j,\, \xi\rangle} + \tfrac12\|\xi\|^2`, 'E(ξ) = −β⁻¹ log Σⱼ e^{β⟨xⱼ, ξ⟩} + ½‖ξ‖²');
const PSI = tex(String.raw`= -\tfrac{1}{\beta}\,\psi(\beta\xi) + \tfrac12\|\xi\|^2`, '= −ψ(βξ)/β + ½‖ξ‖²');
const UPDATE = tex(String.raw`\xi_{k+1} = X\,\mathrm{softmax}\big(\beta X^{\top}\xi_k\big) = \nabla\psi(\beta\,\xi_k)`, 'ξₖ₊₁ = X softmax(β Xᵀ ξₖ) = ∇ψ(β ξₖ)');
const STATIONARY = tex(String.raw`\nabla E(\xi) = 0 \iff \xi = \sum_j a_j(\xi)\, x_j`, '∇E(ξ) = 0 ⟺ ξ = Σⱼ aⱼ(ξ) xⱼ');

const XI0 = [-0.3, 0.5];
const ITERATES = 6;
/** The three regimes, with the moment each begins. */
const PHASES = [
  { beta: 0.5, at: 0, id: 'hopfield-0.5' },
  { beta: 2, at: 24, id: 'hopfield-2' },
  { beta: 6, at: 38, id: 'hopfield-6' },
];
const betaAt = (t) => track(t, [[0, 0.5], [22.5, 0.5], [24, 2], [36.5, 2], [38, 6]]);

/** The range of E over the chart, for the colour ramp (minima bright). */
function range(beta) {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 60; i++) {
    for (let j = 0; j <= 60; j++) {
      const E = hopfieldEnergy([-P.extent + (2 * P.extent * i) / 60, -P.extent + (2 * P.extent * j) / 60], KEYS, beta);
      lo = Math.min(lo, E);
      hi = Math.max(hi, E);
    }
  }
  return { lo, hi };
}
const RANGES = PHASES.map(({ beta }) => range(beta));

/** The iterates ξ₀ … ξ₆ from the query at a given β, with their energies. */
function iterates(beta) {
  const pts = [XI0];
  for (let k = 0; k < ITERATES; k++) pts.push(hopfieldUpdate(pts[pts.length - 1], KEYS, beta));
  return pts.map((xi) => ({ xi, E: hopfieldEnergy(xi, KEYS, beta) }));
}
const CHAINS = PHASES.map(({ beta }) => iterates(beta));

export default defineScene({
  name: 'The Hopfield energy',
  duration: 60,
  narration: [
    [0, 'The same map has a third name. Ramsauer and colleagues wrote down an energy on the residual stream: minus the log-partition of the keys at inverse temperature beta, divided by beta, plus half the squared norm. Its landscape is on the left, with the keys as the stored patterns and the bright basins as its minima.'],
    [12, 'The update that minimises this energy is X times softmax of beta X transposed xi: one attention step with the keys as values, and once more the gradient of psi. Each step lowers the energy and converges to a stationary point, usually within a step or two.'],
    [24, 'At small beta the exponentials barely differ. The patterns merge into one metastable minimum near their mean, and every query ends up there.'],
    [38, 'At large beta every pattern is its own minimum. One update retrieves the nearest key: the modern Hopfield network as associative memory, and attention as its retrieval step.'],
    [50, 'Descending E is the same object we met as a Legendre transform. The energy is minus psi of beta xi plus a quadratic, so its stationary points are exactly the fixed points of the mean-parameter map.'],
  ],
  header: header(11, 'THE HOPFIELD VIEW', 'One attention step descends an energy'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    const beta = betaAt(t);
    // the landscape: one image per regime, crossfaded
    const w1 = seg(t, 22.5, 24);
    const w2 = seg(t, 36.5, 38);
    const images = PHASES.map(({ beta: b, id }, k) => heatmapImage(id, (u, v) => -hopfieldEnergy([u, v], KEYS, b), { extent: P.extent, size: 160, lo: -RANGES[k].hi, hi: -RANGES[k].lo, ramp: defaultRamp }));
    const landscape = seg(t, 1, 2.5);
    drawHeatmap(ctx, P, images[0], landscape);
    drawHeatmap(ctx, P, images[1], landscape * w1);
    drawHeatmap(ctx, P, images[2], landscape * w2);
    const phase = w2 > 0.5 ? 2 : w1 > 0.5 ? 1 : 0;
    const { lo, hi } = RANGES[phase];
    const levels = Array.from({ length: 9 }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / 9);
    clipped(ctx, P, () => drawContours(ctx, P, (u, v) => hopfieldEnergy([u, v], KEYS, beta), levels, { colour: color.ink, alpha: 0.22 * landscape, width: 1 }));
    drawPlane(ctx, P, { alpha: intro, grid: false });
    drawKeys(ctx, P, { alpha: seg(t, 1.5, 2.5) });
    chartCaption(ctx, P, `E(ξ) at β = ${fmt(beta, 1)} · bright: low energy · stored patterns: the keys`, seg(t, 2, 3));

    // the iterates of the current regime, one at a time
    const chain = CHAINS[phase];
    const start = PHASES[phase].at + (phase === 0 ? 12 : 1.5);
    const [qx, qy] = P.point(XI0);
    const q = seg(t, 3, 4);
    dot(ctx, qx, qy, 8, QUERY, q);
    ring(ctx, qx, qy, 13, QUERY, 0.8 * q, 2);
    text(ctx, 'ξ₀', qx - 34, qy - 12, { font: font.display, italic: true, size: 22, color: QUERY, alpha: q });
    for (let k = 1; k < chain.length; k++) {
      const a = seg(t, start + 0.9 * (k - 1), start + 0.9 * (k - 1) + 0.6);
      if (a <= 0.003) break;
      const [x0, y0] = P.point(chain[k - 1].xi);
      const [x1, y1] = P.point(chain[k].xi);
      const u = Math.min(1, a * 1.0);
      arrow(ctx, x0, y0, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, { color: CONTEXT, width: 2.5, head: 10, alpha: 0.9 });
      if (a > 0.95) {
        dot(ctx, x1, y1, 6, CONTEXT, 1);
        if (k <= 2) text(ctx, `ξ${SUB[k]}`, x1 + 10, y1 - 10, { font: font.display, italic: true, size: 19, color: CONTEXT });
      }
    }

    drawNotes(ctx, t, beta, phase, chain, start);
    exampleStamp(ctx, seg(t, 2, 3), 'd = 2 · the seven keys as stored patterns · ξ₀ = (−0.3, 0.5) · everything computed');
  },
});

const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆'];

function drawNotes(ctx, t, beta, phase, chain, start) {
  ENERGY.draw(ctx, R, 228, { size: 26, alpha: seg(t, 0.8, 1.8) });
  PSI.draw(ctx, R + 20, 278, { size: 22, alpha: seg(t, 5, 6) });
  text(ctx, 'the log-partition of the keys again, at the natural parameter βξ', R + 20, 312, { ...type.note, alpha: seg(t, 5.5, 6.5) });
  text(ctx, 'Ramsauer et al., Hopfield networks is all you need (2020)', R, 344, { ...type.note, size: 14, color: color.muted, alpha: seg(t, 7, 8) });

  UPDATE.draw(ctx, R, 404, { size: 25, alpha: seg(t, 12.5, 13.5) });
  text(ctx, 'attention with the keys as values, applied once: the concave–convex procedure on E', R, 440, { ...type.note, alpha: seg(t, 14, 15) });

  // the energies along the chain
  const listOn = seg(t, start - 0.2, start + 0.6);
  text(ctx, `energies at β = ${fmt(PHASES[phase].beta, 1)}`, R, 494, { ...type.note, color: INFO, alpha: listOn });
  chain.forEach(({ E, xi }, k) => {
    const a = k === 0 ? listOn : listOn * seg(t, start + 0.9 * (k - 1) + 0.4, start + 0.9 * (k - 1) + 0.7);
    const y = 522 + 24 * k;
    text(ctx, `E(ξ${SUB[k]}) = ${fmt(E, 4)}`, R, y, { font: font.mono, size: 16, color: k ? CONTEXT : QUERY, alpha: a });
    if (k > 0) text(ctx, `Δ = ${fmt(E - chain[k - 1].E, 4)}`, R + 230, y, { font: font.mono, size: 14, color: E <= chain[k - 1].E + 1e-12 ? INFO : '#ef6b6b', alpha: a });
    text(ctx, `ξ${SUB[k]} = (${fmt(xi[0])}, ${fmt(xi[1])})`, R + 370, y, { font: font.mono, size: 14, color: color.muted, alpha: a });
  });
  const mono = chain.every(({ E }, k) => k === 0 || E <= chain[k - 1].E + 1e-12);
  text(ctx, mono ? 'never increases: E(ξₖ₊₁) ≤ E(ξₖ), the chain converges to a stationary point' : 'E increased: check', R, 700, { ...type.note, size: 14, color: mono ? INFO : '#ef6b6b', alpha: listOn * seg(t, start + 5, start + 6) });

  // regime notes
  const n0 = fade(t, 24.5, 25.5, 37, 38);
  wrap(ctx, 'β = 0.5: all seven exponentials are close to one, so the sum is nearly flat and E ≈ ½‖ξ − mean‖² + const. The patterns are not separately stored: they merge into one metastable minimum near their mean, and every query is pulled there.', R, 740, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n0 });
  const n1 = fade(t, 38.5, 39.5, 49.5, 50.5);
  wrap(ctx, 'β = 6: each key sits in its own basin, and the chain reaches x₃ in a step or two. Retrieval from a partial cue, with an error that shrinks exponentially in β. Attention with keys as values is exactly this retrieval.', R, 740, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n1 });
  const n2 = seg(t, 50.5, 51.5);
  STATIONARY.draw(ctx, R, 752, { size: 23, alpha: n2 });
  wrap(ctx, 'The stationary points of E are the fixed points of the mean-parameter map ξ ↦ ∇ψ(βξ): the same Legendre map, now read as a descent.', R, 792, 690, 26, { ...type.note, size: 15, color: color.body, alpha: seg(t, 52, 53) });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
