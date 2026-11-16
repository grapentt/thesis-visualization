// Title card: the three families breathe in the background (a coin, a die, a Gaussian), each with a
// moving point and the distribution it stands for, while the title types in.

import { defineScene, seg, text, wrap, type, color, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, frame, triangle, drawTriangle, drawSimplexPoint, drawSimplexPath, drawFisherBallOnTriangle, drawCurve, drawPoint, drawPath } from '../shared.js';
import { fisherRaoGeodesic, fisherBall, gaussianPdf, gaussianGeodesic, fisherCircle } from '../math.js';

const T = triangle({ x: 940, y: 180, size: 330 });
const G = frame({ x: 940, y: 560, w: 560, h: 240, u: [-5, 5], v: [0, 0.9] });
const A = [0.65, 0.2, 0.15];
const B = [0.12, 0.3, 0.58];
const GEO = Array.from({ length: 65 }, (_, i) => fisherRaoGeodesic(A, B, i / 64));
const BALLS = [[0.15, 0.15, 0.7], [0.45, 0.45, 0.1], [0.3, 0.1, 0.6], [0.12, 0.76, 0.12], [1 / 3, 1 / 3, 1 / 3], [0.6, 0.1, 0.3]];
const GA = [-2.5, 0.5];
const GB = [2.5, 0.6];
const GGEO = gaussianGeodesic(GA, GB, 48);

export default defineScene({
  name: 'Title',
  duration: 10,
  narration:
    'The geometry of information. A family of distributions is a space, and this video builds its natural ruler, the Fisher metric, from one question: how hard is it to tell two distributions apart? Then it follows that ruler to a sphere, a hyperbolic plane, the natural gradient and two kinds of straight lines.',

  draw(ctx, t) {
    const alpha = 0.9 * seg(t, 0.3, 1.8);
    // the simplex with Fisher balls and one geodesic
    drawTriangle(ctx, T, { alpha, sublabels: false, labels: ['', '', ''] });
    BALLS.forEach((p, i) => drawFisherBallOnTriangle(ctx, T, fisherBall(p, 0.22, 48), { alpha: alpha * seg(t, 0.8 + 0.15 * i, 1.6 + 0.15 * i), width: 1.3 }));
    drawSimplexPath(ctx, T, GEO, { colour: METRIC, alpha, width: 2.5, progress: seg(t, 1.5, 4) });
    drawSimplexPoint(ctx, T, A, { colour: P_COL, alpha, r: 6 });
    drawSimplexPoint(ctx, T, B, { colour: Q_COL, alpha: alpha * seg(t, 3.5, 4), r: 6 });
    // a Gaussian sliding along the geodesic between two narrow ones
    const s = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 12);
    const k = Math.round(s * (GGEO.length - 1));
    const [mu, sigma] = GGEO[k];
    ctx.save();
    ctx.globalAlpha *= alpha;
    drawCurve(ctx, G, (x) => gaussianPdf(x, GA[0], GA[1]), { colour: P_COL, alpha: 0.7, width: 1.5, n: 300 });
    drawCurve(ctx, G, (x) => gaussianPdf(x, GB[0], GB[1]), { colour: Q_COL, alpha: 0.7, width: 1.5, n: 300 });
    drawCurve(ctx, G, (x) => gaussianPdf(x, mu, sigma), { colour: METRIC, width: 2.5, fill: rgba(METRIC, 0.12), n: 300 });
    ctx.restore();
    text(ctx, 'the Fisher–Rao geodesic between two narrow Gaussians widens on its way', G.x, G.y + G.h + 30, { ...type.note, color: color.dim, alpha });

    const a0 = seg(t, 0.2, 1.4);
    text(ctx, 'DISTINGUISHABILITY AS DISTANCE', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a0 });
    text(ctx, 'The geometry of', 100, 388, { ...type.title, size: 78, alpha: a0 });
    text(ctx, 'information', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'The Fisher metric, built from how well data tell two distributions apart; the sphere hidden in the simplex; the hyperbolic plane of Gaussians; the natural gradient; and the two straight lines of information geometry.', 100, 548, 720, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
