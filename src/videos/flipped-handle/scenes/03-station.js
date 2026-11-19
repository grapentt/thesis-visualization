// Station card between the two episodes: from the promise (ALDP5, 2026-10-24) to the test on BBA
// (notes 27 and 30, 2026-11-11 → 11-18). A station card, not a scene of either episode.
import { defineScene, text, wrap, line, type, font, seg, P } from '../shared.js';

export default defineScene({
  name: 'Three weeks later',
  duration: 10,
  narration: 'Three weeks later the promise met a 28-bead protein, BBA, where the order in which features are erased can matter.',
  draw(ctx, t) {
    text(ctx, 'EPISODE 5 OF 6 · RANGE AND ORDER', 80, 300, { ...type.eyebrow, alpha: seg(t, 0.3, 1.1) });
    text(ctx, 'What must the noise keep readable?', 80, 380, { ...type.title, size: 56, alpha: seg(t, 0.6, 1.6) });
    wrap(ctx, 'ALDP5 has five beads and two torsions: it has no fold whose order of erasure could matter. BBA has 28 beads, a fold and a size.', 80, 450, 980, 36, { ...type.body, size: 25, alpha: seg(t, 1.8, 3) });
    const a = seg(t, 4, 5);
    line(ctx, 80, 640, 1000, 640, { width: 1, alpha: a });
    text(ctx, '2026-10-24  goal: synchronize (E4)', 80, 676, { font: font.mono, size: 16, color: P.muted, alpha: a });
    text(ctx, '2026-11-12  note 27 · readable windows', 80, 706, { font: font.mono, size: 16, color: P.muted, alpha: seg(t, 4.6, 5.6) });
    text(ctx, '2026-11-18  note 30 · why two loud modes', 80, 736, { font: font.mono, size: 16, color: P.muted, alpha: seg(t, 5.2, 6.2) });
  },
});
