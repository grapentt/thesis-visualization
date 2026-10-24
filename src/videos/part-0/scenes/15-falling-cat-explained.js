import { defineScene, seg, lin, text, wrap, type, font, color, tex, line, dot } from '../../../kit.js';
import { HORIZONTAL } from '../shared.js';
import { catState, drawCat, PHASE_LABELS, TWIST } from '../cat.js';

const RUN = [3, 17];
const INSET = { x: 980, y: 270, w: 420, h: 200 };
const deg = (r) => (r * 180) / Math.PI;
const TURN = tex(
  String.raw`\Delta\theta = \frac{I_{\text{out}} - I_{\text{in}}}{I_{\text{out}} + I_{\text{in}}}\,\Delta\delta = \frac{3}{5} \cdot 150^\circ = 90^\circ`,
  'Δθ = (I_out − I_in)/(I_out + I_in) · Δδ = 3/5 · 150° = 90°',
);
const MOMENTUM = tex(String.raw`L = I_{\text{front}}\,\dot\theta_{\text{front}} + I_{\text{back}}\,\dot\theta_{\text{back}} = 0`, 'L = I_front θ̇_front + I_back θ̇_back = 0');

export default defineScene({
  name: 'The falling cat, explained',
  duration: 32,
  narration:
    'This is how a falling cat turns over. With no angular momentum, the mechanical connection forbids rotating the body as a whole. But the cat can run a loop in shape space: tuck the front legs and stretch the back ones, twist, swap, twist back. The shape returns to where it started, yet the whole cat has turned. That rotation is the holonomy of the loop, and it exists because the bundle is curved.',
  header: { eyebrow: '07 · THE FALLING CAT', title: 'Turning over with zero angular momentum' },

  draw(ctx, t) {
    const loops = lin(t, ...RUN);
    const state = catState(loops);
    drawCat(ctx, { x: 470, y: 460, size: 1.25, front: state.front, back: state.back, legs: state.legs, alpha: seg(t, 0, 0.8) });
    text(ctx, 'back half', 330, 640, { ...type.note, align: 'center', alpha: seg(t, 1, 2) });
    text(ctx, 'front half', 600, 640, { ...type.note, align: 'center', alpha: seg(t, 1, 2) });

    const running = t >= RUN[0] && t < RUN[1];
    text(ctx, running ? PHASE_LABELS[state.phase] : '', 470, 740, { font: font.mono, size: 18, color: color.gold, align: 'center' });
    text(ctx, `front ${deg(state.front - Math.PI).toFixed(0)}°    back ${deg(state.back - Math.PI).toFixed(0)}°`, 470, 780, {
      font: font.mono,
      size: 18,
      align: 'center',
      alpha: seg(t, 2, 3),
    });
    text(ctx, 'turned since the start (0° = upside down)', 470, 806, { ...type.note, size: 14, align: 'center', alpha: seg(t, 2, 3) });

    drawShapeLoop(ctx, t, state);
    MOMENTUM.draw(ctx, 980, 540, { size: 26, alpha: seg(t, 2.5, 3.5) });
    text(ctx, 'at every instant: legs out = large I, tucked in = small I', 980, 580, { ...type.note, alpha: seg(t, 3, 4) });

    TURN.draw(ctx, 980, 650, { size: 28, alpha: seg(t, 17.5, 18.5) });
    wrap(ctx, 'One loop in shape space turns the cat by 90°. Twice round: 180°, and it lands on its feet.', 980, 712, 560, 30, {
      ...type.body,
      size: 21,
      alpha: seg(t, 18.5, 19.5),
    });
    wrap(ctx, 'Zero angular momentum rules out turning the body as a whole: the mechanical connection has no rigid rotations in H. Curvature still lets a loop of shapes end in a rotation.', 980, 790, 560, 26, {
      ...type.body,
      size: 18,
      color: color.muted,
      alpha: seg(t, 22, 23),
    });
  },
});

/** The loop in shape space: relative twist δ (right) and leg pose (up = back legs out). */
function drawShapeLoop(ctx, t, state) {
  const a = seg(t, 1.5, 2.5);
  if (a <= 0) return;
  const { x, y, w, h } = INSET;
  const X = (delta) => x + 30 + (delta / TWIST) * (w - 80);
  const Y = (pose) => y + h / 2 - pose * (h / 2 - 20);
  ctx.save();
  ctx.globalAlpha = a;
  text(ctx, 'loop in shape space', x, y - 20, { size: 19, weight: 500 });
  line(ctx, x + 30, y, x + 30, y + h);
  line(ctx, x + 30, Y(0), x + w, Y(0));
  text(ctx, 'relative twist δ →', x + w, y + h + 22, { ...type.note, size: 14, align: 'right' });
  text(ctx, 'back legs out', x + 38, y + 10, { ...type.note, size: 14 });
  text(ctx, 'front legs out', x + 38, y + h, { ...type.note, size: 14 });
  ctx.strokeStyle = HORIZONTAL;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  for (const [d, p] of [[0, 0], [0, 1], [TWIST, 1], [TWIST, -1], [0, -1], [0, 0]]) {
    d === 0 && p === 0 && ctx.moveTo(X(d), Y(p));
    ctx.lineTo(X(d), Y(p));
  }
  ctx.stroke();
  ctx.setLineDash([]);
  dot(ctx, X(state.twist), Y(state.pose), 7, color.ink);
  text(ctx, '150°', X(TWIST), Y(0) + 22, { ...type.note, size: 14, align: 'center' });
  ctx.restore();
}
