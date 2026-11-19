// Drawing one lane of the Erasure Clock (E5.3, E5.6): its waterline, name and estimator, the glyphs
// stacked so none overlap, a training-share strip for the local features and a verdict label.

import { text, line, font, lerp, P, railX, RAIL, drawWaterline, glyph, stack, chip, formatT, FEATURES, sharePct } from './shared.js';
import { rangeOf } from './lanes.js';

export const LANE_H = 118;
const GLYPH_Y = 46;
const SUB_ROW = 21;

/** Glyph positions of a lane (stacked), as [{...g, x, row}]. */
export function placeGlyphs(glyphs) {
  return stack(glyphs.map((g) => ({ ...g, x: railX(Math.max(RAIL.tLo, g.t)) })), 23);
}

/**
 * Draw a lane at `top`. options:
 *   alpha            the whole lane
 *   glyphs           override the lane's glyph list (e.g. a morph between estimators)
 *   appear(i, g)     per-glyph alpha (default 1)
 *   drop(i, g)       per-glyph drop progress from `dropFrom` (y) into the lane (default 1)
 *   verdict          label at the right of the name row; verdictColour
 *   shares           draw the local share strip (default true)
 *   positions        precomputed placeGlyphs() result (keeps rows stable during a morph)
 */
export function drawLane(ctx, lane, top, o = {}) {
  const { alpha = 1, appear = () => 1, drop = () => 1, dropFrom = top, verdict = '', verdictColour = P.body, shares = true, chipText = lane.source, chipDash = [] } = o;
  if (alpha <= 0.003) return;
  const placed = o.positions ?? placeGlyphs(o.glyphs ?? lane.glyphs);
  line(ctx, RAIL.x0, top + LANE_H - 4, RAIL.x1, top + LANE_H - 4, { color: P.grid, width: 1, alpha });
  drawWaterline(ctx, lane.tMin, top + 26, top + LANE_H - 8, { alpha: alpha * 0.9 });
  text(ctx, lane.name, 20, top + GLYPH_Y + 6, { font: font.display, size: 21, weight: 500, color: P.ink, alpha });
  if (lane.sub) text(ctx, lane.sub, 20, top + GLYPH_Y + 26, { font: font.mono, size: 11, color: P.muted, alpha });
  text(ctx, `t_min ${formatT(lane.tMin)}`, 20, top + GLYPH_Y + (lane.sub ? 44 : 26), { font: font.mono, size: 11, color: P.dim, alpha });
  chip(ctx, chipText, RAIL.x0, top + 12, { size: 11, alpha: alpha * 0.9, dash: chipDash });
  if (verdict) text(ctx, verdict, RAIL.x1, top + 16, { font: font.mono, size: 13, color: verdictColour, align: 'right', alpha });

  placed.forEach((g, i) => {
    const a = alpha * appear(i, g);
    if (a <= 0.003) return;
    const yLane = top + GLYPH_Y + g.row * SUB_ROW;
    const y = lerp(dropFrom, yLane, drop(i, g));
    if (g.kind === 'wall') {
      glyph(ctx, 'wall', g.x, y, { r: 9, alpha: a, estimator: 'exact' });
      text(ctx, '≲', g.x - 15, y + 4, { font: font.mono, size: 12, color: P.wall, align: 'right', alpha: a });
      return;
    }
    if (g.range) {
      line(ctx, railX(g.range[0]), y, railX(g.range[1]), y, { color: FEATURES[g.kind].colour, width: 3, alpha: a * 0.7 });
    }
    glyph(ctx, g.kind, g.x, y, { r: 9, alpha: a, estimator: g.estimator === 'bound' ? 'exact' : g.estimator, fill: 1 });
  });

  if (shares) {
    const { shares: s } = rangeOf({ ...lane, glyphs: o.glyphs ?? lane.glyphs });
    const ok = s.bond >= 0.01;
    text(ctx, `bonds in ${sharePct(s.bond)} of draws`, 20, top + LANE_H - 14, { font: font.mono, size: 10, color: ok ? P.muted : P.wall, alpha });
  }
}
