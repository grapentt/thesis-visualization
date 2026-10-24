// Text on the canvas. Options:
//   font, size, weight, italic, color, align, baseline, tracking (px), alpha
// plus for wrap(): chars (typewriter reveal: how many characters to show).

import { color as palette, font as fonts } from './theme.js';

export const SUBSCRIPT = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

export function setFont(ctx, o = {}) {
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 24}px ${o.font || fonts.sans}`;
}

export function text(ctx, str, x, y, o = {}) {
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  setFont(ctx, o);
  ctx.fillStyle = o.color || palette.ink;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'alphabetic';
  if (o.tracking) ctx.letterSpacing = `${o.tracking}px`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function splitLines(ctx, str, maxWidth, o = {}) {
  ctx.save();
  setFont(ctx, o);
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

/** Word-wrapped text. Returns the height used. */
export function wrap(ctx, str, x, y, maxWidth, lineHeight, o = {}) {
  if ((o.alpha ?? 1) <= 0.003) return 0;
  const lines = splitLines(ctx, str, maxWidth, o);
  let chars = o.chars ?? Infinity;
  let yy = y;
  for (const line of lines) {
    if (chars <= 0) break;
    text(ctx, chars >= line.length ? line : line.slice(0, chars), x, yy, o);
    chars -= line.length + 1;
    yy += lineHeight;
  }
  return lines.length * lineHeight;
}

/**
 * Text bent along a circular arc, centred on (x, y).
 * bend: total angle of the arc in radians; 0 is straight, positive bulges upward.
 */
export function curvedText(ctx, str, x, y, bend, o = {}) {
  if (Math.abs(bend) < 1e-3) {
    text(ctx, str, x, y, { ...o, align: 'center' });
    return;
  }
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  setFont(ctx, o);
  ctx.fillStyle = o.color || palette.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = o.baseline || 'alphabetic';
  const widths = [...str].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const radius = total / bend;
  let s = -total / 2;
  [...str].forEach((ch, i) => {
    const phi = (s + widths[i] / 2) / radius;
    ctx.save();
    ctx.translate(x + radius * Math.sin(phi), y + radius - radius * Math.cos(phi));
    ctx.rotate(phi);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    s += widths[i];
  });
  ctx.restore();
}

/** Signed number with a real minus sign. */
export function formatNumber(v, digits = 2, showPlus = false) {
  const s = Math.abs(v).toFixed(digits);
  if (Number(s) === 0) return (0).toFixed(digits);
  return (v < 0 ? '−' : showPlus ? '+' : '') + s;
}
