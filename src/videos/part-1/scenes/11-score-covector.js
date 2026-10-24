import {
  defineScene, seg, fade, lin, clamp, text, wrap, type, font, color, tex, arrow, dot, ring, formatNumber, densityHeatmap,
} from '../../../kit.js';
import { density, gradLogDensity } from '../../../model/mixture.js';

const MAP = { x: 100, y: 230, size: 520, extent: 3 };
const PX_PER_UNIT = MAP.size / (2 * MAP.extent);
const HEATMAP = densityHeatmap({ size: MAP.size, extent: MAP.extent, density, gradLog: gradLogDensity });
/** The point where the score is evaluated, and the score there. */
const POINT = [0.6, 0.9];
const GRAD = gradLogDensity(...POINT);

const SCORE_ROW = tex(
  String.raw`\nabla_x \log p = \big[\;\partial_x \log p \quad \partial_y \log p \quad \partial_z \log p\;\big]`,
  '∇ₓ log p = [ ∂ₓ log p   ∂y log p   ∂z log p ]',
);
const PAIRING = tex(
  String.raw`\big\langle \nabla \log p,\, v \big\rangle = \partial_x \log p\; v_x + \partial_y \log p\; v_y + \partial_z \log p\; v_z`,
  '⟨∇log p, v⟩ = ∂ₓlog p·vₓ + ∂y log p·v_y + ∂z log p·v_z',
);

export default defineScene({
  name: 'The score',
  duration: 22,
  narration:
    'The network learns the score, the gradient of the log-density. Its components say how fast log p changes along each coordinate. It is naturally a covector: a row of numbers that turns a direction into a number.',
  header: { eyebrow: '10 · THE SCORE', title: 'The score is a covector' },

  draw(ctx, t) {
    const mapAlpha = seg(t, 0.3, 1.5);
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    ctx.drawImage(HEATMAP, MAP.x, MAP.y, MAP.size, MAP.size);
    ctx.strokeStyle = color.line;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(MAP.x, MAP.y, MAP.size, MAP.size);
    ctx.restore();
    text(ctx, 'a density p(x) and its level sets', MAP.x, MAP.y + MAP.size + 28, { ...type.note, alpha: mapAlpha });

    const px = MAP.x + (POINT[0] + MAP.extent) * PX_PER_UNIT;
    const py = MAP.y + (MAP.extent - POINT[1]) * PX_PER_UNIT;
    const levels = seg(t, 12, 13);
    drawCovectorLevels(ctx, px, py, levels);

    const L = 1.2 * PX_PER_UNIT;
    const axisLabel = { ...type.math, size: 26 };
    const ex = fade(t, 2.5, 3.2, 12, 12.6);
    const ey = fade(t, 5, 5.7, 12, 12.6);
    arrow(ctx, px, py, px + L, py, { color: color.x, width: 4, head: 14, alpha: ex });
    text(ctx, 'x', px + L + 8, py + 8, { ...axisLabel, color: color.x, alpha: ex });
    arrow(ctx, px, py, px, py - L, { color: color.y, width: 4, head: 14, alpha: ey });
    text(ctx, 'y', px + 8, py - L - 4, { ...axisLabel, color: color.y, alpha: ey });

    // a direction v sweeping round; the covector turns it into a number
    const sweep = seg(t, 12.4, 13.2);
    let derivative = null;
    if (sweep > 0) {
      const angle = Math.atan2(GRAD[1], GRAD[0]) + Math.PI * 0.75 + 2 * Math.PI * lin(t, 12.8, 20.5);
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      derivative = GRAD[0] * vx + GRAD[1] * vy;
      arrow(ctx, px, py, px + vx * L, py - vy * L, { color: color.ink, width: 4, head: 15, alpha: sweep });
      text(ctx, 'v', px + vx * (L + 22) - 6, py - vy * (L + 22) + 8, { ...type.math, alpha: sweep });
    }
    const pointAlpha = seg(t, 1.5, 2.2);
    dot(ctx, px, py, 7, color.gold, pointAlpha);
    ring(ctx, px, py, 12, color.ink, pointAlpha, 2);

    // right column
    const R = 700;
    const partial = { ...type.math, size: 30 };
    wrap(ctx, 'Score target ∇ log pₜ(x): how much does the log-density change if I move a little in one direction?', R, 232, 800, 32, {
      ...type.body,
      size: 23,
      alpha: seg(t, 0.8, 1.8),
    });
    text(ctx, `∂ log p / ∂x  =  ${formatNumber(GRAD[0], 2, true)}`, R, 340, { ...partial, color: color.x, alpha: seg(t, 3, 3.8) });
    text(ctx, `∂ log p / ∂y  =  ${formatNumber(GRAD[1], 2, true)}`, R, 392, { ...partial, color: color.y, alpha: seg(t, 5.5, 6.3) });
    text(ctx, '∂ log p / ∂z  for the third coordinate (this slice shows two)', R, 440, { ...partial, size: 24, color: color.z, alpha: seg(t, 7.5, 8.3) });
    SCORE_ROW.draw(ctx, R, 530, { size: 30, alpha: seg(t, 9, 10) });
    text(ctx, 'Written as a row (lying down): a covector, not a column vector.', R, 582, { ...type.note, alpha: seg(t, 9.4, 10.4) });
    PAIRING.draw(ctx, R, 660, { size: 27, alpha: seg(t, 10.5, 11.5) });
    text(ctx, 'Paired with a direction v it returns one number: the change of log p along v.', R, 708, { ...type.note, alpha: seg(t, 10.8, 11.8) });
    if (derivative !== null) {
      text(ctx, `⟨∇ log p, v⟩ = ${formatNumber(derivative, 2, true)}`, R, 786, { font: font.mono, size: 28, color: color.gold, alpha: sweep });
      text(ctx, 'gold lines: level sets of the linearized log p, one unit apart; the value counts how many v crosses', R, 830, {
        ...type.note,
        size: 14,
        alpha: levels,
      });
    }
  },
});

/** A covector drawn as a stack of parallel level lines, one unit of log p apart. */
function drawCovectorLevels(ctx, px, py, alpha) {
  if (alpha <= 0) return;
  const norm = Math.hypot(GRAD[0], GRAD[1]);
  const gx = GRAD[0] / norm;
  const gy = -GRAD[1] / norm; // screen y points down
  const spacing = clamp(PX_PER_UNIT / norm, 25, 120);
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, 130, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = color.gold;
  ctx.lineWidth = 2;
  for (let k = -4; k <= 4; k++) {
    const cx = px + gx * k * spacing;
    const cy = py + gy * k * spacing;
    ctx.globalAlpha = alpha * (k === 0 ? 0.95 : 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - gy * 200, cy + gx * 200);
    ctx.lineTo(cx + gy * 200, cy - gx * 200);
    ctx.stroke();
  }
  ctx.restore();
  ring(ctx, px, py, 130, color.gold, alpha * 0.35, 1);
}
