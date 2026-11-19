// What every scene of the "Flipped Handle" probe shares: data, the rail, the evidence devices and
// a few drawing helpers. Thesis-wide pieces live in src/model/thesis and src/draw/thesis.

import { text, wrap, line, dot, arrow, roundRect, rgba, hexToRgb, font, type, seg, lin, clamp } from '../../kit.js';
import { P, RAMP } from '../../draw/thesis/palette.js';
import { railX, railXFromLogSnr, RAIL, drawFog, drawWaterline, drawRailAxis, drawPlayhead, formatT, fogAlpha } from '../../draw/thesis/rail.js';
import { readability, decisionWindow } from '../../model/thesis/meter.js';
import { trainingShare } from '../../model/thesis/evidence.js';

import aldp5 from '../../data/thesis/aldp5-modes.json' with { type: 'json' };
import bbaModes from '../../data/thesis/bba-modes.json' with { type: 'json' };
import bbaCharts from '../../data/thesis/bba-charts.json' with { type: 'json' };
import bbaWindows from '../../data/thesis/bba-windows.json' with { type: 'json' };
import bbaFrames from '../../data/thesis/bba-frames.json' with { type: 'json' };

export * from '../../kit.js';
export { P, RAMP };
export * from '../../draw/thesis/rail.js';
export * from '../../draw/thesis/glyphs.js';
export * from '../../draw/thesis/evidence.js';
export * from '../../model/thesis/vp.js';
export * from '../../model/thesis/meter.js';
export * from '../../model/thesis/evidence.js';
export * from '../../model/thesis/spectrum.js';
export * from '../../model/thesis/modes.js';
export { ev, budgetChip, num, seeds, thousands } from '../../model/thesis/ledger.js';
export { leverSim, clock, track } from '../common/live-helpers.js';

export const ALDP5 = aldp5.data;
export const BBA_MODES = bbaModes.data;
export const CHARTS = bbaCharts.data;
export const WINDOWS = bbaWindows.data;
export const FRAMES = bbaFrames.data;

/** Scene header: "EPISODE n OF 6 · NN · NAME" and a claim title. */
export const header = (episode, n, name, title) => ({ eyebrow: `EPISODE ${episode} OF 6 · ${String(n).padStart(2, '0')} · ${name}`, title });

/** Linear mix of two hex colours, as hex (so rgba() can take it). */
export function mixHex(a, b, u) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `#${A.map((x, i) => Math.round(x + (B[i] - x) * u).toString(16).padStart(2, '0')).join('')}`;
}

/** A colour along the warm-to-cool ramp, u = 0 (stiff) … 1 (global). */
export function rampColour(u) {
  const x = clamp(u) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  return mixHex(RAMP[i], RAMP[i + 1], x - i);
}

/** The decision window of a linear Gaussian feature (r from 0.8 to 0.2) as a bar on the rail. */
export function decisionBar(ctx, lambda, y, { colour = P.soft, alpha = 1, h = 8 } = {}) {
  if (alpha <= 0.003) return;
  const [lLo, lHi] = decisionWindow(lambda); // r = 0.2 at lLo (more noise, right), r = 0.8 at lHi (left)
  const xa = Math.max(RAIL.x0, railXFromLogSnr(lHi));
  const xb = Math.min(RAIL.x1, railXFromLogSnr(lLo));
  if (xb <= xa) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(xa, 0, xb, 0);
  g.addColorStop(0, rgba(colour, 0.55));
  g.addColorStop(1, rgba(colour, 0.08));
  ctx.fillStyle = g;
  roundRect(ctx, xa, y - h / 2, xb - xa, h, h / 2);
  ctx.fill();
  ctx.restore();
}

/** A feature's readability curve r(t) across the rail, drawn in a band [yTop, yTop + h]. */
export function meterCurve(ctx, lambda, yTop, h, { colour = P.info, alpha = 1, width = 1.6, x0 = RAIL.x0, x1 = RAIL.x1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const x = x0 + ((x1 - x0) * i) / 160;
    const l = RAIL.lMax - ((x - RAIL.x0) * RAIL.span) / (RAIL.x1 - RAIL.x0);
    const snr = lambda * Math.exp(l);
    const y = yTop + h * (1 - snr / (1 + snr));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/** The training-share bar under a glyph: 4 px tall, `pxPerShare` px per unit share. */
export function shareBar(ctx, share, x, y, { colour = P.ink, alpha = 1, pxPerShare = 400, label = true, threshold = 0.01 } = {}) {
  if (alpha <= 0.003) return;
  const w = Math.max(1.5, share * pxPerShare);
  const ok = share >= threshold;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = ok ? colour : P.dim;
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.restore();
  if (label) text(ctx, sharePct(share), x, y + 18, { font: font.mono, size: 12, color: ok ? P.body : P.wall, align: 'center', alpha });
}

/** "0.04%", "2.7%", "25%": a share as the programme prints it. */
export function sharePct(share) {
  const p = share * 100;
  if (p === 0) return '0%';
  if (p < 0.1) return `${p.toFixed(2)}%`;
  if (p < 10) return `${p.toFixed(1)}%`;
  return `${p.toFixed(0)}%`;
}

export { readability, trainingShare, railX, RAIL, drawFog, drawWaterline, drawRailAxis, drawPlayhead, formatT, fogAlpha };

/** A thumbnail of the five-bead ALDP5 backbone with one principal direction as arrows. */
export function backboneThumb(ctx, vector, cx, cy, { scale = 9, alpha = 1, colour = P.soft, arrowScale = 34 } = {}) {
  if (alpha <= 0.003) return;
  const mean = ALDP5.mean_A;
  // project onto the plane of the backbone's two largest spreads (fixed for every thumbnail)
  const pts = mean.map(([x, y]) => [cx + x * scale, cy - y * scale]);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = P.bead;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
  pts.forEach(([x, y]) => dot(ctx, x, y, 2.6, P.bead, alpha));
  pts.forEach(([x, y], i) => {
    const dx = vector[3 * i] * arrowScale;
    const dy = -vector[3 * i + 1] * arrowScale;
    if (Math.hypot(dx, dy) > 2.5) arrow(ctx, x, y, x + dx, y + dy, { color: colour, width: 1.4, head: 5, alpha });
  });
}

/** Mix helper for scene-level fades: a·b clamped. */
export const both = (...xs) => xs.reduce((a, b) => a * b, 1);
export { seg, lin, clamp };
