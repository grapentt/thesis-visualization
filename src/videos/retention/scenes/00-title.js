import { defineScene, seg, fade, text, type, font, color } from '../../../kit.js';
import { frame, drawPath, BOND, TORSION, BASIN, WIDTH } from '../shared.js';
import { curves, SIGMAS, OBSERVABLES } from '../toy.js';

// the retention curves under flat noise, faint, as the backdrop of the title
const BACKDROP = frame({ x: 160, y: 600, w: 1280, h: 220, u: [-2.5, 1.5], v: [0, 1] });
const COLOURS = { bond: BOND, width: WIDTH, torsion: TORSION, basin: BASIN };
const CURVES = OBSERVABLES.map((o, k) => ({ colour: COLOURS[o.key], points: Array.from(SIGMAS, (s, i) => [Math.log10(s), curves.flat[k][i]]) }));

export default defineScene({
  name: 'Title',
  duration: 20,
  narration:
    'This video builds on Part 1 and on the covariance video. Part 1 gave configuration space a metric so that noise, score and loss respect stiffness. Here we ask what information geometry adds to that programme, and what it does not.',

  draw(ctx, t) {
    const a = seg(t, 0.3, 1.6);
    for (const { colour, points } of CURVES) drawPath(ctx, BACKDROP, points, { colour, alpha: 0.28 * seg(t, 1.5, 4), width: 3 });
    text(ctx, 'AN EXTENSION OF PART 1 · INFORMATION GEOMETRY AND THE NOISING PROCESS', 800, 250, { ...type.eyebrow, align: 'center', alpha: a });
    text(ctx, 'What the noise', 800, 370, { font: font.display, size: 92, weight: 500, color: color.ink, align: 'center', alpha: seg(t, 0.8, 2) });
    text(ctx, 'should keep', 800, 470, { font: font.display, size: 92, weight: 500, italic: true, color: color.gold, align: 'center', alpha: seg(t, 1.3, 2.5) });
    text(ctx, 'retention  ·  representation  ·  what a Fisher metric means', 800, 540, { ...type.body, size: 24, color: color.muted, align: 'center', alpha: seg(t, 2.4, 3.4) });
    text(ctx, 'builds on  Part 1 · Diffusion in the right geometry   and   Covariance · The geometry of fluctuations', 800, 856, {
      ...type.note,
      align: 'center',
      alpha: fade(t, 3.5, 4.5, 18.5, 19.5),
    });
  },
});
