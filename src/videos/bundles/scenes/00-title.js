import { defineScene, seg, text, wrap, type, color, drawMolecule } from '../../../kit.js';
import { nitro, X0, nitroCamera, turnRotor, rotate, drawRotorCircle, drawRotorAxis } from '../shared.js';
import { rotation } from '../../../kit.js';

export default defineScene({
  name: 'Title',
  duration: 7,
  narration:
    'One configuration space, many symmetries. A molecule can be rotated as a whole, but parts of it can also turn on their own. Each of these symmetries makes configuration space a bundle, with its own sections, associated bundles and curvature.',

  draw(ctx, t) {
    const cam = nitroCamera({ cx: 1160, cy: 470, scale: 175, yaw: 0.45, pitch: 0.32 });
    const X = rotate(turnRotor(X0, 0.55 * t), rotation.axisAngle([0.2, 1, 0.1], 0.09 * t));
    const a = seg(t, 0.4, 2);
    drawRotorAxis(ctx, cam, X, { alpha: 0.7 * a });
    drawRotorCircle(ctx, cam, X, { alpha: 0.65 * a });
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: a, labels: 0 });

    const b = seg(t, 0.2, 1.4);
    text(ctx, 'MASTER’S THESIS · SYMMETRIES', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: b });
    text(ctx, 'One space,', 100, 388, { ...type.title, size: 78, alpha: b });
    text(ctx, 'many bundles', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'Global and local symmetries of one molecule: the bundles they make, what their sections and associated bundles mean, and how noise feels their curvature.', 100, 548, 640, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
