// Small plotting toolkit: tick helpers, axes, and the two plot types the video
// reuses (energy along a mode, log-density along a mode).

import { color, font } from './theme.js';
import { line, dashedLine, dot } from './shapes.js';
import { text } from './text.js';
import { kBT } from './widgets.js';
import { kT } from '../model/physics.js';

// ---- ticks ------------------------------------------------------------------

/** A round tick spacing giving about four ticks over [−range, range]. */
export function niceStep(range) {
  const r = range / 2;
  const p = Math.pow(10, Math.floor(Math.log10(r)));
  const m = r / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** Multiples of `step` inside [−range, range]. */
export function symmetricTicks(range, step) {
  const n = Math.floor(range / step + 1e-6);
  return Array.from({ length: 2 * n + 1 }, (_, i) => (i - n) * step);
}

export function formatTick(v, step) {
  if (Math.abs(v) < step * 1e-6) return '0';
  const digits = step >= 1 ? 0 : Math.ceil(-Math.log10(step) - 1e-9);
  return (v < 0 ? '−' : '') + Math.abs(v).toFixed(digits);
}

const TICK_FONT = { font: font.mono, size: 15, color: color.muted };

/** Tick marks and labels below a horizontal axis at height y. */
export function ticksBelow(ctx, values, toX, y, label = String) {
  for (const v of values) {
    line(ctx, toX(v), y, toX(v), y + 6, { color: color.line });
    text(ctx, label(v), toX(v), y + 10, { ...TICK_FONT, align: 'center', baseline: 'top' });
  }
}

/** Tick marks and labels left of a vertical axis at x. */
export function ticksLeft(ctx, values, toY, x, label = String) {
  for (const v of values) {
    line(ctx, x - 6, toY(v), x, toY(v), { color: color.line });
    text(ctx, label(v), x - 10, toY(v), { ...TICK_FONT, align: 'right', baseline: 'middle' });
  }
}

/** Left and bottom axis lines of a box. */
export function axesL(ctx, { x, y, w, h }) {
  ctx.save();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.restore();
}

function withClip(ctx, x, y, w, h, draw) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  draw();
  ctx.restore();
}

function strokeCurve(ctx, f, from, to, steps, stroke, width = 3) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const [x, y] = f(from + ((to - from) * i) / steps);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

// ---- energy along a mode ----------------------------------------------------

/**
 * E(s) = ½ k s² over s ∈ [−range, range] with the thermal energy k_B T marked.
 * Options: stiffness, range (Å), maxEnergy (eV), color, point (current s or null),
 *          title, readouts (lines at the top right), alpha.
 */
export function energyPlot(ctx, box, { stiffness, range, maxEnergy = 0.1, color: tint, point = null, title = '', readouts = [], alpha = 1 }) {
  if (alpha <= 0.003) return;
  const { x, y, w, h } = box;
  const X = (s) => x + w / 2 + (s / range) * (w / 2);
  const Y = (E) => y + h - (E / maxEnergy) * h;
  const energy = (s) => 0.5 * stiffness * s * s;

  ctx.save();
  ctx.globalAlpha *= alpha;
  axesL(ctx, box);
  dashedLine(ctx, X(0), y, X(0), y + h, { color: color.line, width: 1, dash: [3, 5] });
  const step = niceStep(range);
  ticksBelow(ctx, symmetricTicks(range, step), X, y + h, (v) => formatTick(v, step));
  ticksLeft(ctx, [0, 0.05, 0.1].filter((e) => e <= maxEnergy + 1e-9), Y, x, (e) => (e ? e.toFixed(2) : '0'));

  dashedLine(ctx, x, Y(kT), x + w, Y(kT), { color: color.gold, alpha: 0.7 });
  kBT(ctx, x + 10, Y(kT) - 9, 19, color.gold);
  text(ctx, '(300 K)', x + 44, Y(kT) - 9, { font: font.mono, size: 13, color: color.gold });

  withClip(ctx, x, y - 6, w, h + 6, () => {
    strokeCurve(ctx, (s) => [X(s), Math.max(Y(energy(s)), y - 60)], -range, range, 800, tint);
    if (point !== null && Y(energy(point)) >= y - 4) dot(ctx, X(point), Y(energy(point)), 8, color.gold);
  });

  text(ctx, title, x, y - 18, { size: 21, weight: 500, color: tint });
  text(ctx, 'E (eV)', x - 10, y - 18, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  text(ctx, 'displacement (Å)', x + w, y + h + 46, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  readouts.forEach((s, i) => text(ctx, s, x + w - 8, y + 22 + i * 24, { font: font.mono, size: 16, color: tint, align: 'right' }));
  ctx.restore();
}

// ---- log-density along a mode ----------------------------------------------

/**
 * log p(s) = −s² / 2σ² over s ∈ [−range, range].
 * Options: sigma, range, color, title, xLabel, alpha,
 *          point (0 … 1: show the point s = σ and its tangent), slopeLabel,
 *          step (0 … 1: show a step from σ to 1.3σ), stepLabel.
 */
export function logDensityPlot(ctx, box, o) {
  const { sigma, range, color: tint, title = '', xLabel = 'Å', point = 0, step = 0, slopeLabel = '', stepLabel = '', alpha = 1 } = o;
  if (alpha <= 0.003) return;
  const { x, y, w, h } = box;
  const top = y + 26;
  const depth = 4.5;
  const X = (s) => x + w / 2 + (s / range) * (w / 2);
  const Y = (l) => top + (-l / depth) * (y + h - top);
  const logp = (s) => -(s * s) / (2 * sigma * sigma);

  ctx.save();
  ctx.globalAlpha *= alpha;
  axesL(ctx, box);
  const tickStep = niceStep(range);
  ticksBelow(ctx, symmetricTicks(range, tickStep), X, y + h, (v) => formatTick(v, tickStep));
  ticksLeft(ctx, [0, -2, -4], Y, x, (l) => (l ? `−${-l}` : '0'));

  withClip(ctx, x, y, w, h, () => {
    strokeCurve(ctx, (s) => [X(s), Math.min(Y(logp(s)), y + h + 40)], -range, range, 900, tint);
    if (point > 0) {
      ctx.save();
      ctx.globalAlpha *= point;
      line(ctx, X(sigma * 0.45), Y(-0.5 + 0.55), X(sigma * 1.55), Y(-0.5 - 0.55), { color: color.ink, width: 2 });
      dot(ctx, X(sigma), Y(-0.5), 7, color.gold);
      ctx.restore();
    }
    if (step > 0) {
      ctx.save();
      ctx.globalAlpha *= step;
      ctx.strokeStyle = color.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(X(sigma), Y(-0.5));
      ctx.lineTo(X(1.3 * sigma), Y(-0.5));
      ctx.lineTo(X(1.3 * sigma), Y(-0.845));
      ctx.stroke();
      ctx.restore();
    }
  });

  if (point > 0) text(ctx, slopeLabel, X(sigma) + 18, Y(-0.5) - 26, { font: font.mono, size: 17, alpha: point });
  if (step > 0) {
    text(ctx, 'Δ log p = −0.35', X(1.3 * sigma) + 14, Y(-0.68) + 6, { font: font.mono, size: 17, color: color.gold, alpha: step });
    text(ctx, stepLabel, X(1.3 * sigma) + 14, Y(-0.68) + 32, { font: font.mono, size: 15, color: color.muted, alpha: step });
  }
  text(ctx, title, x, y - 18, { size: 21, weight: 500, color: tint });
  text(ctx, 'log p', x - 10, y - 18, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  text(ctx, xLabel, x + w, y + h + 46, { font: font.mono, size: 14, color: color.muted, align: 'right' });
  ctx.restore();
}
