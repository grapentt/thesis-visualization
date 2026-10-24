// Basic marks. All take stage coordinates; colours default to ink.

import { color as palette } from './theme.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Arrow from (x1, y1) to (x2, y2). Options: color, width, head, dash, alpha. */
export function arrow(ctx, x1, y1, x2, y2, o = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length < 1.5 || (o.alpha ?? 1) <= 0.003) return;
  const ux = dx / length;
  const uy = dy / length;
  const head = Math.min(o.head || 14, length * 0.55);
  const c = o.color || palette.ink;

  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.strokeStyle = c;
  ctx.fillStyle = c;
  ctx.lineWidth = o.width || 3;
  ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - ux * head * 0.8, y2 - uy * head * 0.8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * head - uy * head * 0.48, y2 - uy * head + ux * head * 0.48);
  ctx.lineTo(x2 - ux * head + uy * head * 0.48, y2 - uy * head - ux * head * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function line(ctx, x1, y1, x2, y2, { color = palette.line, width = 1.5, dash = [], alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export const dashedLine = (ctx, x1, y1, x2, y2, o = {}) => line(ctx, x1, y1, x2, y2, { dash: [5, 6], ...o });

export function dot(ctx, x, y, r, color, alpha = 1) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function ring(ctx, x, y, r, color, alpha = 1, width = 2.5) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Curly brace spanning x0 … x1 at height y.
 * direction  1: under a formula (tip points down), −1: over it (tip points up).
 * progress   grows the brace out from its centre (0 … 1).
 */
export function brace(ctx, x0, x1, y, direction, color, alpha = 1, progress = 1) {
  if (alpha <= 0.003 || x1 - x0 < 4) return;
  const mid = (x0 + x1) / 2;
  const half = Math.max(2, ((x1 - x0) / 2) * progress);
  const left = mid - half;
  const right = mid + half;
  const h = 11 * direction;
  const c = Math.min(12, half * 0.35);

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.quadraticCurveTo(left, y + h, left + c, y + h);
  ctx.lineTo(mid - c, y + h);
  ctx.quadraticCurveTo(mid, y + h, mid, y + 2 * h);
  ctx.quadraticCurveTo(mid, y + h, mid + c, y + h);
  ctx.lineTo(right - c, y + h);
  ctx.quadraticCurveTo(right, y + h, right, y);
  ctx.stroke();
  ctx.restore();
}

/** Horizontal bar with rounded ends; used for bar charts and meters. */
export function bar(ctx, x, y, width, height, color, alpha = 1) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, width, height, 6);
  ctx.fill();
  ctx.restore();
}
