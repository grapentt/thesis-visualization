import { defineScene, seg, text, wrap, type, color } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { createFlow } from '../torusFlow.js';
import { flowCamera, drawFlowTorus } from '../torusViews.js';

// a still sample of the cloud, drawn once from a fixed seed
const cloud = createFlow(createRng(1)).glued;

export default defineScene({
  name: 'Title',
  duration: 7,
  narration:
    'A prototype of a playable video. A cloud of particles circulates on a torus. Watch what happens when we try to flatten it onto one chart, then take the controls yourself.',

  draw(ctx, t) {
    const cam = flowCamera({ cx: 1150, cy: 430, yaw: 0.4 + t * 0.08, pitch: -0.8 });
    drawFlowTorus(ctx, cloud, cam, { alpha: 0.9 * seg(t, 0.4, 2), tracers: 0 });

    const a = seg(t, 0.2, 1.4);
    text(ctx, 'MASTER’S THESIS · ATLAS', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'Why one chart', 100, 388, { ...type.title, size: 78, alpha: a });
    text(ctx, 'is not enough', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'A flow on a torus, a flat coordinate chart, and why learning on such data needs an atlas of overlapping charts.', 100, 548, 620, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
    text(ctx, 'Prototype of a playable video: in the next scene you can take over the controls.', 100, 690, { ...type.note, alpha: seg(t, 2, 3) });
  },
});
