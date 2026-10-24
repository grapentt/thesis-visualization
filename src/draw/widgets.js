// Reusable composite elements: scene header, callout card, column and row vectors.

import { color, font, type } from './theme.js';
import { rgba } from './color.js';
import { text, splitLines, formatNumber } from './text.js';
import { roundRect } from './shapes.js';

/** Eyebrow + title in the top-left corner. Drawn by the timeline from a scene's `header`. */
export function sceneHeader(ctx, { eyebrow, title }, alpha = 1) {
  if (alpha <= 0.003) return;
  text(ctx, eyebrow, 80, 74, { ...type.eyebrow, alpha });
  text(ctx, title, 80, 126, { ...type.title, alpha });
}

/**
 * Callout card with a tag pill, a title and a body that can type itself out.
 * @param {{x:number, y:number, width:number, tag:string, title:string, body:string,
 *          accent?:string, alpha?:number, progress?:number}} o
 */
export function card(ctx, { x, y, width, tag, title, body, accent = color.gold, alpha = 1, progress = 1 }) {
  if (alpha <= 0.003) return;
  const bodyStyle = { ...type.body, size: 22 };
  const lines = splitLines(ctx, body, width - 56, bodyStyle);
  const height = 132 + lines.length * 33;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(17,24,40,0.97)';
  roundRect(ctx, x, y, width, height, 14);
  ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `500 14px ${font.mono}`;
  const pillWidth = ctx.measureText(tag).width + tag.length * 1.5 + 24;
  ctx.fillStyle = rgba(accent, 0.16);
  roundRect(ctx, x + 28, y + 24, pillWidth, 28, 14);
  ctx.fill();
  text(ctx, tag, x + 40, y + 39, { font: font.mono, size: 14, weight: 500, color: accent, baseline: 'middle', tracking: 1.5 });
  text(ctx, title, x + 28, y + 98, { ...type.title, size: 34 });

  let chars = Math.floor(progress * body.length);
  let yy = y + 142;
  for (const line of lines) {
    if (chars <= 0) break;
    text(ctx, chars >= line.length ? line : line.slice(0, chars), x + 28, yy, bodyStyle);
    chars -= line.length + 1;
    yy += 33;
  }
  ctx.restore();
}

/** Square brackets (and an optional label above) around `count` rows starting at y0. */
export function columnFrame(ctx, { cx, y0, count, rowHeight = 44, width = 130, label, labelColor = color.ink, alpha = 1 }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const top = y0 - rowHeight / 2 - 4;
  const bottom = y0 + (count - 1) * rowHeight + rowHeight / 2 + 4;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2;
  for (const [x, dir] of [[cx - width / 2, 1], [cx + width / 2, -1]]) {
    ctx.beginPath();
    ctx.moveTo(x + dir * 10, top);
    ctx.lineTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineTo(x + dir * 10, bottom);
    ctx.stroke();
  }
  if (label) text(ctx, label, cx, top - 14, { ...type.math, align: 'center', color: labelColor });
  ctx.restore();
}

/** One entry of a column vector: symbol on the left, value on the right. */
export function vectorRow(ctx, { cx, y, width = 130, symbol, value, color: tint = color.ink, size = 25, highlight = 0, alpha = 1 }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (highlight > 0.01) {
    ctx.fillStyle = rgba(tint, 0.22 * highlight);
    roundRect(ctx, cx - width / 2 + 6, y - size * 0.75, width - 12, size * 1.5, 6);
    ctx.fill();
  }
  text(ctx, symbol, cx - width / 2 + 16, y, { font: font.display, italic: true, size, baseline: 'middle', color: tint });
  text(ctx, formatNumber(value, 2), cx + width / 2 - 14, y, { font: font.mono, size: size * 0.76, align: 'right', baseline: 'middle' });
  ctx.restore();
}

/**
 * Column vector with live values.
 * rows: [{ symbol, value, color, highlight }]
 */
export function columnVector(ctx, cx, y0, rows, { rowHeight = 44, width = 130, size = 25, label, labelColor, alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  columnFrame(ctx, { cx, y0, count: rows.length, rowHeight, width, label, labelColor, alpha });
  rows.forEach((r, k) =>
    vectorRow(ctx, { cx, y: y0 + k * rowHeight, width, symbol: r.symbol, value: r.value, color: r.color, size, highlight: r.highlight || 0, alpha }),
  );
}

/** Row vector of numbers (or strings), one colour per entry; `highlight` marks one entry. */
export function rowVector(ctx, x, y, values, colors, { highlight = -1, alpha = 1, width = 330 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2;
  const h = 24;
  for (const [xx, dir] of [[x, 1], [x + width, -1]]) {
    ctx.beginPath();
    ctx.moveTo(xx + dir * 9, y - h);
    ctx.lineTo(xx, y - h);
    ctx.lineTo(xx, y + h);
    ctx.lineTo(xx + dir * 9, y + h);
    ctx.stroke();
  }
  values.forEach((v, i) => {
    const cx = x + (width * (i + 0.5)) / values.length;
    if (i === highlight) {
      ctx.fillStyle = rgba(color.gold, 0.2);
      roundRect(ctx, cx - 72, y - 20, 144, 40, 6);
      ctx.fill();
    }
    const label = typeof v === 'string' ? v : formatNumber(v, 2);
    text(ctx, label, cx, y, { font: font.mono, size: 26, align: 'center', baseline: 'middle', color: colors[i] });
  });
  ctx.restore();
}

/** "k_B T" with a real subscript, for plots and annotations. */
export function kBT(ctx, x, y, size, tint, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = tint;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `italic 400 ${size}px ${font.display}`;
  ctx.fillText('k', x, y);
  let w = ctx.measureText('k').width;
  ctx.font = `400 ${size * 0.62}px ${font.display}`;
  ctx.fillText('B', x + w, y + size * 0.22);
  w += ctx.measureText('B').width + 1;
  ctx.font = `italic 400 ${size}px ${font.display}`;
  ctx.fillText('T', x + w, y);
  ctx.restore();
}
