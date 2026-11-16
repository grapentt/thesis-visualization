// Roadmap: the attention formula, the head as a chain of three maps (linear, Legendre, linear),
// and the two layers of geometry this video reads into it.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, arrow, roundRect, rgba, line } from '../../../../src/kit.js';
import { QUERY, KEY, CONTEXT, SYM, ANTI, INFO, POSITION, VALUE, header } from '../shared.js';

const SCORE = tex(String.raw`s_{ij} = x_i^{\top} M\, x_j,\qquad M = \frac{W_Q^{\top} W_K}{\sqrt{d_k}}`, 's_ij = xᵢᵀ M xⱼ,  M = W_Qᵀ W_K / √d_k');
const WEIGHTS = tex(String.raw`a_{ij} = \frac{e^{s_{ij}}}{\sum_k e^{s_{ik}}}`, 'a_ij = e^{s_ij} / Σ_k e^{s_ik}');
const OUTPUT = tex(String.raw`o_i = W_V \sum_j a_{ij}\, x_j`, 'o_i = W_V Σ_j a_ij x_j');
const CHAIN = tex(String.raw`o_i \;=\; W_V\; \nabla\psi\big(M^{\top} x_i\big)`, 'o_i = W_V ∇ψ(Mᵀ xᵢ)');
const PSI = tex(String.raw`\psi(\theta) = \log \sum_j e^{\langle \theta,\, x_j\rangle}`, 'ψ(θ) = log Σ_j e^{⟨θ, x_j⟩}');

const STAGES = [
  { sym: tex('x_i', 'xᵢ'), name: 'the query token', colour: QUERY },
  { sym: tex(String.raw`\theta = M^{\top} x_i`, 'θ = Mᵀ xᵢ'), name: 'natural parameter', colour: QUERY },
  { sym: tex(String.raw`\eta = \nabla\psi(\theta)`, 'η = ∇ψ(θ)'), name: 'attended context', colour: CONTEXT },
  { sym: tex(String.raw`o_i = W_V\,\eta`, 'oᵢ = W_V η'), name: 'the output', colour: VALUE },
];
const MAPS = [
  { label: 'linear', sub: 'the form M', colour: SYM },
  { label: 'Legendre', sub: 'softmax over the keys', colour: INFO },
  { label: 'linear', sub: 'the value map', colour: VALUE },
];

const CHAPTERS = [
  ['02–04', 'Differential geometry of the residual stream', 'M as a tensor, its symmetric and antisymmetric parts, where it comes from, and position as a connection', SYM],
  ['05–09', 'Information geometry of the softmax', 'an exponential family on the keys, its Legendre transform, the Fisher metric, a dually flat simplex, sparse variants', INFO],
  ['10–12', 'The sphere and depth', 'von Mises–Fisher mixtures, the Hopfield energy, and tokens as interacting particles across layers', ANTI],
];

export default defineScene({
  name: 'Roadmap',
  duration: 46,
  narration: [
    [0, 'Here is one attention head. A score pairs a query token with every key through a matrix M. Softmax turns the scores of one query into weights that sum to one, and the output is a linear map of the weighted keys.'],
    [14, 'Written as a composition, the head is three maps. A linear map sends the query to a natural parameter theta. The gradient of the log-partition psi of the keys sends theta to the attended context eta. The value map is linear again. Only the middle map is nonlinear, and it is a Legendre transform.'],
    [31, 'We read that chain in two layers: the differential geometry of the residual stream, where M is a tensor and position a connection, and the information geometry of the softmax, where the Fisher metric governs sensitivity. Then we put the tokens on a sphere and let depth flow.'],
  ],
  header: header(1, 'ROADMAP', 'One head, three maps, two layers of geometry'),

  draw(ctx, t) {
    // the formula, three lines
    SCORE.draw(ctx, 100, 230, { size: 30, alpha: seg(t, 0.4, 1.4) });
    WEIGHTS.draw(ctx, 100, 312, { size: 30, alpha: seg(t, 4.5, 5.5) });
    OUTPUT.draw(ctx, 100, 392, { size: 30, alpha: seg(t, 9, 10) });
    text(ctx, 'one score per (query, key) pair', 640, 236, { ...type.note, alpha: seg(t, 1, 2) });
    text(ctx, 'one distribution over the keys, per query', 640, 318, { ...type.note, alpha: seg(t, 5.5, 6.5) });
    text(ctx, 'the weighted keys, then a linear map', 640, 398, { ...type.note, alpha: seg(t, 10, 11) });

    // the chain of maps
    drawChain(ctx, t);

    // the two layers
    const y0 = 650;
    CHAPTERS.forEach(([range, title, body, tint], k) => {
      const a = seg(t, 31.5 + 4 * k, 32.5 + 4 * k);
      const x = 100 + 480 * k;
      if (a <= 0.003) return;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = 'rgba(17,24,40,0.9)';
      roundRect(ctx, x, y0, 450, 190, 12);
      ctx.fill();
      ctx.strokeStyle = rgba(tint, 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, `SCENES ${range}`, x + 24, y0 + 34, { font: font.mono, size: 14, weight: 500, color: tint, tracking: 2 });
      wrap(ctx, title, x + 24, y0 + 72, 400, 30, { ...type.display, size: 24 });
      wrap(ctx, body, x + 24, y0 + 118, 400, 24, { ...type.note, size: 15, color: color.body, chars: Math.floor(lin(t, 32 + 4 * k, 35 + 4 * k) * body.length) });
      ctx.restore();
    });
  },
});

/** x_i → θ → η → o_i, with the three maps between them. */
function drawChain(ctx, t) {
  const y = 478;
  const xs = [150, 520, 890, 1260];
  const base = seg(t, 14, 15);
  if (base <= 0.003) return;
  STAGES.forEach((s, k) => {
    const a = base * seg(t, 14 + 2.6 * k, 15 + 2.6 * k);
    const x = xs[k];
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(s.colour, 0.12);
    roundRect(ctx, x - 92, y - 34, 184, 68, 12);
    ctx.fill();
    ctx.strokeStyle = rgba(s.colour, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    s.sym.draw(ctx, x, y, { size: 26, align: 'center', alpha: a });
    text(ctx, s.name, x, y + 60, { ...type.note, align: 'center', color: s.colour, alpha: a });
  });
  MAPS.forEach((m, k) => {
    const a = base * seg(t, 15.2 + 2.6 * k, 16.2 + 2.6 * k);
    const x0 = xs[k] + 96;
    const x1 = xs[k + 1] - 96;
    arrow(ctx, x0, y, x1, y, { color: m.colour, width: 3, head: 12, alpha: a });
    text(ctx, m.label, (x0 + x1) / 2, y - 16, { font: font.sans, size: 19, weight: 500, color: m.colour, align: 'center', alpha: a });
    text(ctx, m.sub, (x0 + x1) / 2, y + 30, { ...type.note, size: 13, align: 'center', alpha: a });
  });
  CHAIN.draw(ctx, 100, 600, { size: 28, alpha: fade(t, 24, 25, 44, 45.5) });
  PSI.draw(ctx, 560, 600, { size: 26, alpha: fade(t, 25, 26, 44, 45.5) });
  text(ctx, 'the only nonlinearity: a Legendre transform', 1020, 606, { ...type.note, color: INFO, alpha: fade(t, 26.5, 27.5, 44, 45.5) });
  line(ctx, 100, 634, 1500, 634, { width: 1, alpha: 0.5 * fade(t, 31, 32) });
}
