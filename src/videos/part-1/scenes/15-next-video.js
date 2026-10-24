import { defineScene, seg, text, wrap, type, font, color, line, drawMolecule, moleculeCamera, molecule } from '../../../kit.js';

export default defineScene({
  name: 'Next video',
  duration: 14,
  narration:
    'The next video introduces the spring metric, which satisfies G ≈ K approximately, and shows why it works. Rigorous proofs of the three problems and their resolution accompany this clip.',

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 430, cy: 470, scale: 150, yaw: 0.5 + 0.35 * Math.sin(t * 0.35) });
    drawMolecule(ctx, molecule.positions, cam, { spring: seg(t, 1.5, 3.5), opacity: seg(t, 0, 0.8) });
    text(ctx, 'bonds as springs', 430, 760, { font: font.mono, size: 16, color: color.muted, align: 'center', alpha: seg(t, 3, 3.8) });

    text(ctx, 'NEXT VIDEO', 820, 270, { ...type.eyebrow, tracking: 3, alpha: seg(t, 0.4, 1.2) });
    text(ctx, 'The spring metric', 820, 350, { ...type.title, size: 68, alpha: seg(t, 0.6, 1.6) });
    wrap(ctx, 'Treat every bond as a spring and build the metric from the spring constants. It satisfies G ≈ K approximately, which is exactly what the three problems require.', 820, 410, 640, 36, {
      ...type.body,
      size: 25,
      alpha: seg(t, 2, 3),
    });

    const later = seg(t, 5.5, 6.5);
    line(ctx, 820, 560, 1480, 560, { width: 1, alpha: later });
    wrap(ctx, 'Behind this clip: rigorous proofs of all three problems, and of how the metric resolves each one.', 820, 612, 640, 34, {
      ...type.body,
      size: 23,
      color: color.ink,
      alpha: later,
    });
    text(ctx, 'Next: why the spring metric works.', 820, 730, { ...type.title, size: 34, weight: 400, italic: true, color: color.gold, alpha: seg(t, 8, 9) });
  },
});
