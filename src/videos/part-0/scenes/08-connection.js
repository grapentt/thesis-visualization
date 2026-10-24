import { defineScene, seg, fade, lerp, text, wrap, type, color, tex, arrow, dot, ring, line } from '../../../kit.js';
import { VERTICAL, HORIZONTAL } from '../shared.js';
import { RECT, X, Y, FIBRES, slope, lift, drawRectangle, drawDashes } from '../flatTorus.js';

const RIGHT = 920;
const LIFT_STARTS = [1.2, 2.8, 4.3];
const PROJECTED = [
  [-1.0, 1.0], [-0.7, 2.6], [-1.15, 3.9], [-0.55, 5.2], [0.6, 0.8], [0.95, 2.1], [0.5, 3.4], [1.1, 4.6], [0.75, 5.6], [-0.85, 4.6],
];
const SPLIT = tex(String.raw`v = v^H + v^V, \qquad A_p(v) = v^V`, 'v = v^H + v^V,   A_p(v) = v^V');
const FORM = tex(String.raw`A_p : T_pP \to V_p, \qquad \ker A_p = H_p`, 'A_p : T_pP → V_p,   ker A_p = H_p');

export default defineScene({
  name: 'Connections',
  duration: 36,
  narration:
    'Cut the torus open into a rectangle: fibres run upwards, the base runs to the right. Draw each horizontal space as a short dash. Tilting the dashes gives another connection. Following the dashes carries a point on one fibre to a point on the next: the connection identifies neighbouring fibres. Equivalently, it splits every vector into a horizontal and a vertical part, so it is a projection onto the vertical space, the connection one-form A.',
  header: { eyebrow: '04 · CONNECTIONS', title: 'A connection says how to go from fibre to fibre' },

  draw(ctx, t) {
    const lambda = seg(t, 8, 10);
    drawRectangle(ctx, seg(t, 0, 1.2));
    drawDashes(ctx, lambda, seg(t, 3, 4.5) * (1 - 0.55 * seg(t, 27, 28)));
    drawLifts(ctx, t, lambda);
    drawDecomposition(ctx, t, lambda);
    drawProjection(ctx, t, lambda);

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'Draw each horizontal space H_p as a short dash. Here they simply point along θ.', RIGHT, 270, 600, 30, { ...words, alpha: fade(t, 3.5, 4.3, 7.6, 8) });
    wrap(ctx, 'Another connection: the dashes tilt.', RIGHT, 270, 600, 30, { ...words, alpha: fade(t, 8.2, 9, 10.2, 10.6) });
    wrap(ctx, 'Follow the dashes from one fibre to the next. The connection says which point of the next fibre corresponds to a point of this one: parallel transport.', RIGHT, 270, 600, 30, {
      ...words,
      alpha: fade(t, 10.8, 11.6, 19.4, 20),
    });
    wrap(ctx, 'Any vector splits into a horizontal part along the dash and a vertical part along the fibre.', RIGHT, 270, 600, 30, { ...words, alpha: fade(t, 20.6, 21.4, 27, 27.6) });
    SPLIT.draw(ctx, RIGHT, 390, { size: 30, alpha: fade(t, 24, 25, 27, 27.6) });
    wrap(ctx, 'Slide points along the dashes onto one fibre: the connection is a projection onto the vertical.', RIGHT, 270, 600, 30, { ...words, alpha: seg(t, 28, 28.8) });
    FORM.draw(ctx, RIGHT, 390, { size: 30, alpha: seg(t, 32, 33) });
    text(ctx, 'the connection 1-form A: vertical part of a vector, horizontal vectors ↦ 0', RIGHT, 432, { ...type.note, alpha: seg(t, 32.6, 33.6) });
  },
});

function drawLifts(ctx, t, lambda) {
  const a = fade(t, 10.4, 11, 19.4, 20);
  if (a <= 0) return;
  const from = FIBRES[0];
  const to = FIBRES[6];
  LIFT_STARTS.forEach((phi0, k) => {
    const curve = lift(from, phi0, lambda);
    const progress = seg(t, 11 + 0.5 * k, 16 + 0.5 * k);
    const end = lerp(from, to, progress);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = HORIZONTAL;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const theta = lerp(from, end, i / 80);
      i ? ctx.lineTo(X(theta), Y(curve(theta))) : ctx.moveTo(X(theta), Y(curve(theta)));
    }
    ctx.stroke();
    ctx.restore();
    dot(ctx, X(from), Y(phi0), 7, color.ink, a);
    dot(ctx, X(end), Y(curve(end)), 7, color.ink, a);
    if (progress > 0.99) ring(ctx, X(to), Y(curve(to)), 12, color.gold, a);
  });
}

function drawDecomposition(ctx, t, lambda) {
  const a = fade(t, 20.6, 21.4, 27, 27.6);
  if (a <= 0) return;
  const theta = 3.3;
  const phi = 2.2;
  const dTheta = 0.85;
  const dPhi = 1.0;
  const px = X(theta);
  const py = Y(phi);
  const pxPerTheta = X(1) - X(0);
  const pxPerPhi = Y(0) - Y(1);
  const vx = px + dTheta * pxPerTheta;
  const vy = py - dPhi * pxPerPhi;
  const hx = px + dTheta * pxPerTheta;
  const hy = py - dTheta * slope(theta, lambda) * pxPerPhi;
  const hA = seg(t, 22.3, 23);
  const vA = seg(t, 23.3, 24);
  const cornerY = py + (vy - hy); // the parallelogram's fourth corner is (px, cornerY)
  line(ctx, px, py, px, cornerY, { color: color.muted, dash: [4, 5], alpha: a * vA });
  line(ctx, px, cornerY, vx, vy, { color: color.muted, dash: [4, 5], alpha: a * vA });
  arrow(ctx, px, py, vx, vy, { color: color.ink, width: 4, head: 15, alpha: a });
  arrow(ctx, px, py, hx, hy, { color: HORIZONTAL, width: 4, head: 14, alpha: a * hA });
  arrow(ctx, hx, hy, vx, vy, { color: VERTICAL, width: 4, head: 14, alpha: a * vA });
  dot(ctx, px, py, 6, color.ink, a);
  text(ctx, 'v', (px + vx) / 2 - 24, (py + vy) / 2, { ...type.math, alpha: a });
  text(ctx, 'v^H', (px + hx) / 2, (py + hy) / 2 + 28, { ...type.math, size: 24, color: HORIZONTAL, alpha: a * hA });
  text(ctx, 'v^V', hx + 12, (hy + vy) / 2, { ...type.math, size: 24, color: VERTICAL, alpha: a * vA });
}

function drawProjection(ctx, t, lambda) {
  const a = seg(t, 27.6, 28.4);
  if (a <= 0) return;
  const target = FIBRES[5];
  line(ctx, X(target), RECT.y0, X(target), RECT.y1, { color: VERTICAL, width: 5, alpha: a });
  const u = seg(t, 28.8, 31.8);
  for (const [offset, phi0] of PROJECTED) {
    const start = target + offset;
    const curve = lift(start, phi0, lambda);
    const now = lerp(start, target, u);
    ctx.save();
    ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = HORIZONTAL;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const theta = lerp(start, now, i / 30);
      i ? ctx.lineTo(X(theta), Y(curve(theta))) : ctx.moveTo(X(theta), Y(curve(theta)));
    }
    ctx.stroke();
    ctx.restore();
    dot(ctx, X(now), Y(curve(now)), 6, u > 0.98 ? color.gold : color.ink, a);
  }
}
