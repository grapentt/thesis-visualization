// Pieces shared by several videos: the per-atom column vectors and their stacking
// into one configuration vector x ∈ ℝ³ᴺ.

import { seg, lerp, text, type, font, color, axisColor, axisName, SUBSCRIPT, columnFrame, vectorRow, dot, atomColor } from '../../kit.js';

/** x-centres of the five per-atom column vectors. */
export const COLUMN_SLOTS = [880, 1030, 1180, 1330, 1480];
/** y of the first row of those column vectors. */
export const COLUMN_TOP = 330;
/** Where the stacked 15-vector ends up. */
export const STACK = { cx: 820, top: 225, rowHeight: 37, width: 160 };

/**
 * The five per-atom 3-vectors slide together into one 15-vector.
 * t is the time since the stacking started: frames fade 0–0.6 s, rows move 0.3–3.4 s,
 * the big bracket and the atom badges appear 2.8–4.1 s.
 */
export function drawStackedConfiguration(ctx, t, X) {
  const oldFrames = 1 - seg(t, 0, 0.6);
  for (let i = 0; i < 5; i++) {
    columnFrame(ctx, { cx: COLUMN_SLOTS[i], y0: COLUMN_TOP, count: 3, label: `r${SUBSCRIPT[i + 1]}`, alpha: oldFrames });
  }
  for (let j = 0; j < 15; j++) {
    const atom = Math.floor(j / 3);
    const k = j % 3;
    const u = seg(t, 0.3 + 0.08 * j, 2.3 + 0.08 * j);
    vectorRow(ctx, {
      cx: lerp(COLUMN_SLOTS[atom], STACK.cx, u),
      y: lerp(COLUMN_TOP + k * 44, STACK.top + j * STACK.rowHeight, u),
      width: lerp(130, STACK.width, u),
      symbol: axisName[k] + SUBSCRIPT[atom + 1],
      value: X[j],
      color: axisColor[k],
      size: lerp(25, 22, u),
    });
  }

  const a = seg(t, 2.8, 3.6);
  columnFrame(ctx, { cx: STACK.cx, y0: STACK.top, count: 15, rowHeight: STACK.rowHeight, width: STACK.width, alpha: a });
  text(ctx, 'x ∈ ℝ¹⁵', STACK.cx, STACK.top - 34, { ...type.math, size: 30, color: color.gold, align: 'center', alpha: a });
  text(ctx, '3N = 15 numbers', STACK.cx, STACK.top + 14 * STACK.rowHeight + 56, { ...type.note, align: 'center', alpha: a });

  // atom badges next to each group of three rows
  for (let i = 0; i < 5; i++) {
    const y = STACK.top + (3 * i + 1) * STACK.rowHeight;
    const badge = seg(t, 3 + 0.1 * i, 3.6 + 0.1 * i);
    ctx.save();
    ctx.globalAlpha = badge;
    dot(ctx, STACK.cx + 102, y, 13, atomColor(i));
    text(ctx, String(i + 1), STACK.cx + 102, y + 1, { font: font.mono, size: 15, weight: 600, color: color.bg, align: 'center', baseline: 'middle' });
    ctx.strokeStyle = color.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(STACK.cx + 86, y - STACK.rowHeight * 1.2);
    ctx.lineTo(STACK.cx + 86, y + STACK.rowHeight * 1.2);
    ctx.stroke();
    ctx.restore();
  }
}
