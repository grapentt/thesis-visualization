import { defineScene, seg, text, type, font, color, drawSurface } from '../../../kit.js';
import { torusPoint, torusEnergy, torusCamera, energyColor } from '../shared.js';

const ITEMS = [
  ['The space we work on', 'Configurations up to rigid motions: ℝ³ᴺ / SE(3)'],
  ['The tangent space splits', 'Symmetry directions and real shape changes: V ⊕ H'],
  ['Bundles: a simple example', 'A torus as a circle of circles'],
  ['Connections', 'Which directions count as horizontal'],
  ['Curvature', 'Holonomy, and curvature as infinitesimal holonomy'],
  ['Back to molecules', 'The curvature of shape space, and how a falling cat turns'],
];

export default defineScene({
  name: 'Overview',
  duration: 16,
  narration:
    'Here is the plan. First the space we actually work on, configurations up to rigid motions. Then how its tangent space splits, a simple bundle on a torus, connections, curvature, and finally back to molecules and the falling cat.',
  header: { eyebrow: '00 · OVERVIEW', title: 'What this video shows' },

  draw(ctx, t) {
    ITEMS.forEach(([title, detail], i) => {
      const y = 245 + i * 98;
      const a = seg(t, 1 + 1.4 * i, 1.8 + 1.4 * i);
      text(ctx, String(i + 1), 100, y, { font: font.mono, size: 22, weight: 500, color: color.gold, alpha: a });
      text(ctx, title, 150, y, { ...type.display, alpha: a });
      text(ctx, detail, 150, y + 34, { ...type.note, size: 17, alpha: a });
    });

    const cam = torusCamera({ cx: 1230, cy: 520, scale: 105, yaw: 0.6 + t * 0.06 });
    ctx.save();
    ctx.globalAlpha = 0.55 * seg(t, 0.5, 2.5);
    drawSurface(ctx, cam, torusPoint, { nu: 54, nv: 22, color: (theta) => energyColor(torusEnergy(theta)) });
    ctx.restore();
  },
});
