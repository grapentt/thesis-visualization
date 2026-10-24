import { defineScene, seg, text, wrap, type, color, drawMolecule, moleculeCamera, molecule } from '../../../kit.js';

export default defineScene({
  name: 'Title',
  duration: 6,
  narration:
    'This clip motivates why diffusion models for molecular configurations should add noise, predict scores and measure errors in a geometry that knows about stiffness.',

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 1170, cy: 470, scale: 175, yaw: 0.4 + t * 0.1, pitch: 0.3 });
    drawMolecule(ctx, molecule.positions, cam, { opacity: 0.9 * seg(t, 0.5, 2), labels: 0 });

    const a = seg(t, 0.2, 1.4);
    text(ctx, 'MASTER’S THESIS · PART 1', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'Diffusion in the', 100, 388, { ...type.title, size: 78, alpha: a });
    text(ctx, 'right geometry', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'Why flat Brownian noise struggles with stiff molecules, and how a Riemannian metric fixes it.', 100, 548, 620, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
