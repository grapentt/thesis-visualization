import { defineScene, seg, fade, text, wrap, type, font, color, dot, ring, polyline3, brace } from '../../../kit.js';
import { VERTICAL, bundleCamera, bundlePoint } from '../shared.js';
import { TWIST, LIFT_START, FLOOR, drawFloor, drawFibres, drawTiles, drawSheets, loopPoints, enclosedArea, drawLoopAndLift } from '../bundleBox.js';

export default defineScene({
  name: 'Holonomy',
  duration: 36,
  narration:
    'One dimension more. The base is now a plane, the fibres are vertical lines, and at every point there is a horizontal plane. If all planes are flat, they fit together into surfaces: the distribution is integrable and the connection is flat. Now tilt the planes, more the further out they are. No surface fits them all. Walk around a loop, always horizontally: you come back to the same fibre, but at a different height. That mismatch is the holonomy, and it only depends on the area the loop encloses.',
  header: { eyebrow: '05 · CURVATURE', title: 'One dimension more: when the planes twist' },

  draw(ctx, t) {
    const cam = bundleCamera();
    const lambda = TWIST * seg(t, 10, 13);
    drawFloor(ctx, cam, seg(t, 0, 1));
    drawFibres(ctx, cam, seg(t, 0.4, 1.4));
    drawSheets(ctx, cam, fade(t, 3, 4, 8.5, 9.5));
    drawTiles(ctx, cam, lambda, { alpha: seg(t, 0.8, 2) * (1 - 0.5 * seg(t, 14, 15)) });

    // the loop and its horizontal lift
    const wobble = fade(t, 24, 25, 29.5, 30.5);
    const loop = loopPoints((phi) => 1 + wobble * 0.13 * Math.sin(3 * phi + 2.2 * t));
    const loopAlpha = seg(t, 14, 15);
    if (loopAlpha > 0) {
      const progress = t < 21 ? seg(t, 14.6, 21) : 1;
      const lifted = drawLoopAndLift(ctx, cam, loop, LIFT_START, lambda, { progress, alpha: loopAlpha });
      const k = Math.round(progress * (lifted.length - 1));
      const runner = cam.project(bundlePoint(...lifted[k]));
      const shadow = cam.project(bundlePoint(lifted[k][0], lifted[k][1], FLOOR));
      dot(ctx, runner.x, runner.y, 7, color.ink, loopAlpha);
      dot(ctx, shadow.x, shadow.y, 5, color.muted, loopAlpha);

      // the fibre through the start, and the gap at the end
      const [x0, y0] = loop[0];
      polyline3(ctx, cam, [bundlePoint(x0, y0, FLOOR), bundlePoint(x0, y0, 1.9)], { color: VERTICAL, width: 3, alpha: loopAlpha });
      const start = cam.project(bundlePoint(x0, y0, LIFT_START));
      ring(ctx, start.x, start.y, 10, color.ink, loopAlpha, 2);
      const gap = seg(t, 21, 22);
      if (gap > 0) {
        const end = cam.project(bundlePoint(...lifted[lifted.length - 1]));
        ring(ctx, end.x, end.y, 10, color.gold, gap, 2.5);
        drawVerticalBrace(ctx, start.x + 20, end.y, start.y, gap);
        text(ctx, 'holonomy', start.x + 50, (start.y + end.y) / 2 + 6, { ...type.math, size: 26, color: VERTICAL, alpha: gap });
      }

      const area = enclosedArea(loop);
      const readout = fade(t, 22.5, 23.3, 34, 35);
      text(ctx, `enclosed area   A = ${area.toFixed(2)}`, 980, 600, { font: font.mono, size: 20, alpha: readout });
      text(ctx, `holonomy   Δz = ${(lifted[lifted.length - 1][2] - LIFT_START).toFixed(2)}`, 980, 636, { font: font.mono, size: 20, color: VERTICAL, alpha: readout });
      text(ctx, `Δz / A = ${((lifted[lifted.length - 1][2] - LIFT_START) / area).toFixed(2)} = λ`, 980, 672, { font: font.mono, size: 20, color: color.gold, alpha: readout });
    }

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 270) => wrap(ctx, s, 980, y, 560, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Base M = ℝ² (the floor). Fibres: the vertical lines. At every point a horizontal plane H_p, here drawn as a small tile.', 0.8, 2.6);
    note('Flat tiles fit together into horizontal sheets: the distribution is integrable. A flat connection, curvature zero.', 3.2, 9.4);
    note('Now tilt the tiles, more the further out they sit. No surface is tangent to all of them any more: the distribution is not integrable.', 10.2, 14.4);
    note('Walk once around a loop, always horizontally. You come back to the same fibre, but higher up. This mismatch is called holonomy.', 14.8, 24);
    note('Wiggle the loop: the holonomy follows the enclosed area, nothing else.', 24.4, 31);
    note('For this connection, A = dz − λ·½(x dy − y dx) with λ = 0.5, the holonomy is exactly λ times the enclosed area.', 31.2, 36);
  },
});

/** A curly brace standing vertically between y0 (top) and y1 (bottom) at x, opening to the left. */
function drawVerticalBrace(ctx, x, y0, y1, alpha) {
  ctx.save();
  ctx.translate(x, (y0 + y1) / 2);
  ctx.rotate(-Math.PI / 2);
  brace(ctx, -(y1 - y0) / 2, (y1 - y0) / 2, 0, 1, VERTICAL, alpha);
  ctx.restore();
}
