import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, line, dot, drawMolecule, moleculeCamera, rotation,
} from '../../../kit.js';
import { VERTICAL, HORIZONTAL, loopHolonomy, loopConfiguration, loopRotation, loopCoordinates, loopArea } from '../shared.js';

const HOLONOMY = loopHolonomy(1, 1200);
const SIZES = [1, 0.5, 0.25, 0.125].map((s) => {
  const { angle } = loopHolonomy(s, 2000);
  return { s, angle, ratio: angle / loopArea(s) };
});
const LOOPS = 2;
const RUN = [3, 17];
const INSET = { x: 980, y: 260, w: 330, h: 190 };
const toInset = ([a, b]) => [INSET.x + INSET.w / 2 + (a / 1.65) * (INSET.w / 2), INSET.y + INSET.h / 2 - (b / 0.6) * (INSET.h / 2)];
const degrees = (R) => (rotation.rotationAngle(R) * 180) / Math.PI;

export default defineScene({
  name: 'Molecule holonomy',
  duration: 34,
  narration:
    'Here is that curvature at work. Change the shape of the molecule around a loop, twisting and bending, while keeping the total angular momentum exactly zero. After each loop the shape is the same as before, but the molecule has turned. Shrink the loop and the rotation shrinks with its area; the ratio is the curvature of the shape-space bundle at this shape.',
  header: { eyebrow: '06 · OUR SHAPE-SPACE BUNDLE', title: 'A loop of shapes rotates the molecule' },

  draw(ctx, t) {
    const tau = LOOPS * lin(t, ...RUN);
    const cam = moleculeCamera({ cx: 430, cy: 480, scale: 150 });
    drawMolecule(ctx, loopConfiguration(HOLONOMY, 0), cam, { ghost: color.muted, opacity: 0.7 * seg(t, 1, 2), labels: 0 });
    drawMolecule(ctx, loopConfiguration(HOLONOMY, tau), cam);
    text(ctx, 'outline: the molecule at the start', 430, 800, { ...type.note, align: 'center', alpha: seg(t, 1.5, 2.5) });

    drawInset(ctx, t, tau);

    const live = fade(t, 2.5, 3.3, 20.4, 21);
    text(ctx, 'total angular momentum  L = 0', 980, 540, { font: font.mono, size: 19, color: HORIZONTAL, alpha: live });
    text(ctx, `loops completed  ${Math.min(LOOPS, Math.floor(tau + 1e-6))}`, 980, 574, { font: font.mono, size: 19, alpha: live });
    text(ctx, `the molecule has turned by  ${degrees(loopRotation(HOLONOMY, tau)).toFixed(1)}°`, 980, 608, { font: font.mono, size: 19, color: VERTICAL, alpha: live });
    wrap(ctx, `Same shape as at the start, but rotated by ${degrees(loopRotation(HOLONOMY, LOOPS)).toFixed(0)}°: zero angular momentum, yet a net rotation. The holonomy of the mechanical connection.`, 980, 670, 560, 30, {
      ...type.body,
      size: 21,
      alpha: fade(t, 17.4, 18.2, 20.4, 21),
    });

    drawShrinkTable(ctx, t);
  },
});

function drawInset(ctx, t, tau) {
  const a = seg(t, 1, 2);
  const { x, y, w, h } = INSET;
  ctx.save();
  ctx.globalAlpha = a;
  text(ctx, 'path in shape space M', x, y - 20, { size: 19, weight: 500 });
  line(ctx, x, y + h / 2, x + w, y + h / 2);
  line(ctx, x + w / 2, y, x + w / 2, y + h);
  text(ctx, 'torsion a', x + w, y + h + 22, { ...type.note, size: 14, align: 'right' });
  text(ctx, 'bend b', x + w / 2 + 8, y + 12, { ...type.note, size: 14 });

  const shrinking = seg(t, 21, 25);
  const sizes = shrinking > 0 ? SIZES.filter((_, k) => k <= Math.floor(shrinking * SIZES.length - 1e-6) || k === 0) : [SIZES[0]];
  for (const { s } of sizes) {
    ctx.strokeStyle = HORIZONTAL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const [px, py] = toInset(loopCoordinates(i / 120, s));
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  if (t < 21) {
    const [px, py] = toInset(loopCoordinates(tau - Math.floor(tau)));
    dot(ctx, px, py, 7, color.ink);
  }
  dot(ctx, ...toInset([0, 0]), 4, color.muted);
  ctx.restore();
}

function drawShrinkTable(ctx, t) {
  const a = seg(t, 21, 22);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  const cols = [980, 1140, 1300];
  const head = { ...type.note, size: 15 };
  text(ctx, 'loop size', cols[0], 520, head);
  text(ctx, 'rotation', cols[1], 520, head);
  text(ctx, 'rotation / area', cols[2], 520, head);
  SIZES.forEach(({ s, angle, ratio }, k) => {
    const y = 556 + 34 * k;
    const row = seg(t, 21.5 + k, 22.2 + k);
    const cell = { font: font.mono, size: 19, alpha: row };
    text(ctx, `× ${s}`, cols[0], y, cell);
    text(ctx, `${angle.toFixed(k < 2 ? 2 : 3)}°`, cols[1], y, { ...cell, color: VERTICAL });
    text(ctx, `${ratio.toFixed(2)} °/rad²`, cols[2], y, { ...cell, color: color.gold });
  });
  ctx.restore();
  wrap(ctx, 'Shrink the loop: the rotation shrinks with the area, and their ratio settles at the curvature of the shape-space bundle at this shape.', 980, 720, 560, 30, {
    ...type.body,
    size: 21,
    alpha: seg(t, 26, 27),
  });
  text(ctx, 'Masses C 12, O 16, N 14, H 1. Rotation from integrating L = 0 along each loop.', 980, 840, { ...type.note, size: 14, alpha: seg(t, 27, 28) });
}
