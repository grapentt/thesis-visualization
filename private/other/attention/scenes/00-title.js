// Title card: the running example breathes in the background, a query circling seven keys with
// its score field and attention weights, while the title types in.

import { defineScene, seg, text, wrap, type, color } from '../../../../src/kit.js';
import { KEYS, M, QUERY, chart, drawPlane, drawKeys, drawQuery, drawVector, drawContours, drawHull, queryAt } from '../shared.js';
import { matTVec, weights, meanParameter, dot } from '../math.js';

const P = chart({ x: 900, y: 170, size: 600 });

export default defineScene({
  name: 'Title',
  duration: 9,
  narration:
    'The geometry of attention. One head of a transformer, read as a bilinear form on the residual stream, a connection over the sequence, a Legendre transform of an exponential family, and, across layers, a flow of interacting particles.',

  draw(ctx, t) {
    const q = queryAt(t, { period: 14 });
    const theta = matTVec(M, q);
    const a = weights(theta, KEYS);
    const eta = meanParameter(theta, KEYS);
    const alpha = 0.9 * seg(t, 0.3, 1.8);

    drawPlane(ctx, P, { alpha, grid: false });
    drawHull(ctx, P, KEYS, { alpha: alpha * 0.8 });
    drawContours(ctx, P, (u, v) => dot(theta, [u, v]), [-2, -1, 0, 1, 2, 3], { colour: QUERY, alpha: 0.35 * alpha, dashNegative: true });
    drawKeys(ctx, P, { alpha, weights: a, labelled: false });
    drawVector(ctx, P, [0, 0], theta, { colour: QUERY, alpha: 0.9 * alpha, width: 2.5 });
    drawQuery(ctx, P, q, { alpha, label: '' });
    drawVector(ctx, P, q, eta, { colour: color.stiff, alpha, width: 2, dash: [5, 5] });
    drawKeys(ctx, P, { points: [eta], labels: [''], alpha, colour: color.stiff, labelled: false });

    const a0 = seg(t, 0.2, 1.4);
    text(ctx, 'READING ONE HEAD GEOMETRICALLY', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a0 });
    text(ctx, 'The geometry of', 100, 388, { ...type.title, size: 78, alpha: a0 });
    text(ctx, 'attention', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'A bilinear form on the residual stream, a connection over the sequence, a Legendre transform of the keys, and a flow with depth.', 100, 548, 660, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
