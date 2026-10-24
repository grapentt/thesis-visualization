import { defineScene, seg, text, wrap, type, color, drawSurface } from '../../../kit.js';
import { torusPoint, torusEnergy, torusCamera, energyColor } from '../shared.js';

export default defineScene({
  name: 'Title',
  duration: 7,
  narration:
    'Part 0 of the thesis videos: the geometry of shape space. Molecules live on a quotient space, and understanding it means understanding bundles, connections and curvature.',

  draw(ctx, t) {
    const cam = torusCamera({ cx: 1170, cy: 470, scale: 120, yaw: 0.2 + t * 0.08 });
    ctx.save();
    ctx.globalAlpha = 0.9 * seg(t, 0.4, 2);
    drawSurface(ctx, cam, torusPoint, { nu: 60, nv: 24, color: (theta) => energyColor(torusEnergy(theta)) });
    ctx.restore();

    const a = seg(t, 0.2, 1.4);
    text(ctx, 'MASTER’S THESIS · PART 0', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'The geometry of', 100, 388, { ...type.title, size: 78, alpha: a });
    text(ctx, 'shape space 1', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'Why molecules live on a quotient space, and what bundles, connections and curvature have to do with it.', 100, 548, 620, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
