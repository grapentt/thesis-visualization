// Title card of the probe: what it is (five scenes from Episodes 2 and 5) and the one gesture that
// ties them: a handle set in October and turned back in November.
import { defineScene, text, wrap, line, type, font, seg, P, railX, drawRailAxis, glyph } from '../shared.js';

export default defineScene({
  name: 'Title',
  duration: 9,
  narration: 'Where to add the noise. Five scenes from two episodes, joined by one handle: set in October, turned back in November.',
  draw(ctx, t) {
    text(ctx, 'WHERE TO ADD THE NOISE · A PROBE OF FIVE SCENES', 80, 250, { ...type.eyebrow, alpha: seg(t, 0.2, 1) });
    text(ctx, 'The Flipped Handle', 80, 340, { ...type.title, size: 76, alpha: seg(t, 0.4, 1.4) });
    wrap(ctx, 'Episode 2 sets a handle that whitens the noise and promises to erase everything together. Episode 5 turns the same handle back on a 28-bead protein and finds what the promise cost.', 80, 410, 900, 36, { ...type.body, size: 25, alpha: seg(t, 1.4, 2.6) });

    // the rail, with one ruler at the promise and one turned back
    const a = seg(t, 3, 4.5);
    drawRailAxis(ctx, 690, { alpha: a * 0.8, logSnr: false, label: false, ticks: [1e-5, 0.01, 0.26, 0.7] });
    const g = seg(t, 5, 7.5);
    glyph(ctx, 'mode', railX(0.26), 650, { r: 13, alpha: a, estimator: 'exact', colour: P.soft });
    glyph(ctx, 'rg', railX(0.26 + (0.52 - 0.26) * g), 610, { r: 13, alpha: a * g, estimator: 'exact', colour: P.global });
    glyph(ctx, 'bond', railX(0.26 - (0.26 - 0.028) * g), 610, { r: 13, alpha: a * g, estimator: 'exact', colour: P.stiff });
    line(ctx, 80, 790, 1520, 790, { width: 1, alpha: seg(t, 6, 7) });
    text(ctx, 'Episode 2 · scenes 03 and 09   ·   Episode 5 · scenes 03, 04 and 06', 80, 826, { ...type.note, alpha: seg(t, 6, 7) });
    text(ctx, 'every number from a tested rig or the evidence ledger', 1520, 826, { ...type.note, align: 'right', alpha: seg(t, 6.5, 7.5) });
  },
});
