import { defineScene, seg, text, type, font, color, tex, line, drawSurface } from '../../../kit.js';
import { torusPoint, torusEnergy, torusCamera, energyColor } from '../shared.js';

const ITEMS = [
  { formula: tex(String.raw`T^*M`, 'T*M'), words: 'The cotangent space' },
  { formula: tex(String.raw`g \;\text{on}\; M`, 'g on M'), words: 'Changing the metric g on M' },
  { formula: tex(String.raw`T^*M \xrightarrow{\;\sharp_g\;} TM`, 'T*M →♯g TM'), words: 'The musical isomorphism' },
];

export default defineScene({
  name: 'Next video',
  duration: 15,
  narration:
    'In the next video, the geometry of shape space part 2: the cotangent space, what happens when we change the metric on M, and the musical isomorphism that turns covectors into vectors.',

  draw(ctx, t) {
    const cam = torusCamera({ cx: 400, cy: 480, scale: 110, yaw: 0.4 + 0.07 * t });
    ctx.save();
    ctx.globalAlpha = 0.85 * seg(t, 0, 1);
    drawSurface(ctx, cam, torusPoint, { nu: 60, nv: 22, color: (theta) => energyColor(torusEnergy(theta)) });
    ctx.restore();

    text(ctx, 'NEXT VIDEO', 820, 250, { ...type.eyebrow, tracking: 3, alpha: seg(t, 0.4, 1.2) });
    text(ctx, 'The geometry of', 820, 324, { ...type.title, size: 58, alpha: seg(t, 0.6, 1.6) });
    text(ctx, 'shape space 2', 820, 390, { ...type.title, size: 58, italic: true, color: color.gold, alpha: seg(t, 0.9, 1.9) });
    line(ctx, 820, 430, 1480, 430, { width: 1, alpha: seg(t, 1.5, 2.5) });

    ITEMS.forEach(({ formula, words }, i) => {
      const y = 500 + i * 100;
      const a = seg(t, 2.5 + 1.5 * i, 3.3 + 1.5 * i);
      text(ctx, String(i + 1), 820, y + 10, { font: font.mono, size: 22, weight: 500, color: color.gold, alpha: a });
      formula.draw(ctx, 870, y, { size: 34, alpha: a });
      text(ctx, words, 870, y + 44, { ...type.note, size: 17, alpha: a });
    });
  },
});
