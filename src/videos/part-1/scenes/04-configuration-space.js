import {
  defineScene, seg, lerp, oscillate, text, type, color, axisColor,
  drawMolecule, moleculeCamera, molecule, camera, arrow, dashedLine, dot, ring, randomDirection,
} from '../../../kit.js';
import { drawStackedConfiguration } from '../../common/configuration.js';

// A 3D view of three of the fifteen axes: x1, y3 and z5 (indices 0, 7, 14).
const AXES_CAM = camera({ yaw: -0.6, pitch: 0.25, scale: 140, cx: 1240, cy: 660, focal: 14 });
const SHOWN = [0, 7, 14];
const SHOWN_LABELS = ['x₁', 'y₃', 'z₅'];
const POINT_AT_REST = [1.1, 1.2, 1.1];
const GAIN = 2.0;
const MOTION_SCALE = 0.8;

export default defineScene({
  name: 'Configuration space',
  duration: 17,
  continues: true,
  narration:
    'Stacking all coordinates gives one long vector. A whole configuration is a single point x in ℝ¹⁵, and a motion of the whole molecule is a direction v in that space.',
  header: { eyebrow: '04 · CONFIGURATION SPACE', title: 'Stack them: one configuration is one point' },

  draw(ctx, t) {
    const move = seg(t, 0.2, 2.2);
    const cam = moleculeCamera({ cx: lerp(480, 300, move), cy: lerp(520, 540, move), scale: lerp(160, 118, move) });
    const amount = oscillate(t, 10.6, 16.2) * MOTION_SCALE;
    const X = molecule.positions.map((x, j) => x + amount * randomDirection[j]);
    drawMolecule(ctx, X, cam);

    drawStackedConfiguration(ctx, t, X);
    drawAxes(ctx, t, X);

    text(ctx, 'One configuration of 5 atoms = one point x ∈ ℝ¹⁵', 1240, 790, { ...type.body, align: 'center', alpha: seg(t, 7.2, 8) });
    text(ctx, 'One motion of all atoms = one direction v ∈ ℝ¹⁵', 1240, 826, { ...type.body, color: color.gold, align: 'center', alpha: seg(t, 9.6, 10.4) });
  },
});

/** Three of the fifteen axes, the configuration as a point, the motion as a direction. */
function drawAxes(ctx, t, X) {
  const a = seg(t, 5, 6.5);
  if (a <= 0) return;
  const p = (v) => AXES_CAM.project(v);
  ctx.save();
  ctx.globalAlpha = a;

  ctx.strokeStyle = color.grid;
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const v = g * 0.55;
    for (const [from, to] of [[[v, 0, 0], [v, 0, 2.2]], [[0, 0, v], [2.2, 0, v]]]) {
      const A = p(from);
      const B = p(to);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
  }
  const origin = p([0, 0, 0]);
  for (let k = 0; k < 3; k++) {
    const tip = p([0, 1, 2].map((i) => (i === k ? 2.4 : 0)));
    arrow(ctx, origin.x, origin.y, tip.x, tip.y, { color: axisColor[k], width: 2.5, head: 12 });
    text(ctx, SHOWN_LABELS[k], tip.x + (k === 2 ? -34 : 10), tip.y + (k === 1 ? -8 : 20), { ...type.math, size: 26, color: axisColor[k] });
  }
  text(ctx, '3 of the 15 axes', origin.x, origin.y + 70, { ...type.note, align: 'center' });

  const pointAlpha = seg(t, 6.5, 7.5);
  if (pointAlpha > 0) {
    const P = SHOWN.map((ix, k) => POINT_AT_REST[k] + GAIN * (X[ix] - molecule.positions[ix]));
    const pt = p(P);
    const floor = p([P[0], 0, P[2]]);
    const onX = p([P[0], 0, 0]);
    const onZ = p([0, 0, P[2]]);
    dashedLine(ctx, pt.x, pt.y, floor.x, floor.y, { color: color.muted, alpha: pointAlpha * 0.8 });
    dashedLine(ctx, floor.x, floor.y, onX.x, onX.y, { color: color.muted, alpha: pointAlpha * 0.6 });
    dashedLine(ctx, floor.x, floor.y, onZ.x, onZ.y, { color: color.muted, alpha: pointAlpha * 0.6 });

    const v = seg(t, 9, 10);
    if (v > 0) {
      const along = (sign) => p(SHOWN.map((ix, k) => POINT_AT_REST[k] + sign * GAIN * MOTION_SCALE * randomDirection[ix]));
      const rest = p(POINT_AT_REST);
      const head = along(1);
      const tail = along(-1);
      dashedLine(ctx, tail.x, tail.y, rest.x, rest.y, { color: color.gold, alpha: v * 0.5, width: 2, dash: [2, 6] });
      arrow(ctx, rest.x, rest.y, head.x, head.y, { color: color.gold, width: 4, head: 16, alpha: v });
      text(ctx, 'v', head.x + 10, head.y - 8, { ...type.math, size: 32, color: color.gold, alpha: v });
    }
    dot(ctx, pt.x, pt.y, 10, color.ink, pointAlpha);
    ring(ctx, pt.x, pt.y, 16, color.gold, pointAlpha);
    text(ctx, 'x', pt.x - 34, pt.y - 12, { ...type.math, size: 32, alpha: pointAlpha });
  }
  ctx.restore();
}
