import { defineScene, seg, fade, lin, lerp, text, type, font, color, line } from '../../../kit.js';
import { catState, drawCat } from '../cat.js';

const FALL = [1.5, 15];
const GROUND = 790;
const TOP = 300;
const BOTTOM = 712; // body centre when the paws touch the ground

export default defineScene({
  name: 'The falling cat',
  duration: 19,
  narration: 'And now in one go: upside down at the top, two loops in shape space on the way down, feet first at the bottom. Zero angular momentum all the way.',
  header: { eyebrow: '07 · THE FALLING CAT', title: 'Feet first' },

  draw(ctx, t) {
    const u = lin(t, ...FALL);
    const y = lerp(TOP, BOTTOM, u * u); // free fall: height drops with t²
    const state = catState(2 * seg(t, FALL[0] + 0.4, FALL[1] - 0.6));
    const landed = t >= FALL[1];
    const squash = landed ? fade(t, FALL[1], FALL[1] + 0.15, FALL[1] + 0.45, FALL[1] + 0.9) : 0;

    line(ctx, 160, GROUND, 1440, GROUND, { color: color.muted, width: 2 });
    drawCat(ctx, { x: 800, y: y + squash * 12, size: 0.95, front: state.front, back: state.back, legs: state.legs, squash });

    text(ctx, 'slow motion', 1440, 200, { font: font.mono, size: 16, color: color.muted, align: 'right', alpha: fade(t, 0.5, 1.2, 15, 15.6) });
    text(ctx, 'L = 0', 1440, 232, { font: font.mono, size: 22, color: color.soft, align: 'right', alpha: seg(t, 0.5, 1.2) });
    text(ctx, `turned ${((state.front - Math.PI) * 180 / Math.PI).toFixed(0)}°`, 1440, 264, { font: font.mono, size: 18, align: 'right', alpha: seg(t, 0.5, 1.2) });
    text(ctx, 'lands on its feet.', 800, 860, { ...type.title, size: 34, italic: true, color: color.gold, align: 'center', alpha: seg(t, FALL[1] + 0.6, FALL[1] + 1.4) });
  },
});
