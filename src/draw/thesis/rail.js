// R31 · The Erasure Clock rail (programme.md §3.3): one horizontal axis for every piece.
//   x(t) = 140 + 1340 · (13.8145 − ℓ(t)) / 18.753 for t ∈ [10⁻⁵, 0.7], ℓ = ln(α²/σ²)
//   (71.46 px per log-SNR unit). Log-SNR ticks above, t labels below; the fog thickens rightward
//   with alpha σ_t² (cap 0.85); each lane is hatched left of its own trained floor t_min.

import { logSnr, sigma2, tAtLogSnr } from '../../model/thesis/vp.js';
import { P } from './palette.js';
import { text } from '../text.js';
import { font } from '../theme.js';

export const RAIL = Object.freeze({ x0: 140, x1: 1480, lMax: 13.8145, span: 18.753, tLo: 1e-5, tHi: 0.7 });
export const PX_PER_LOGSNR = (RAIL.x1 - RAIL.x0) / RAIL.span;

export const railX = (t) => RAIL.x0 + ((RAIL.x1 - RAIL.x0) * (RAIL.lMax - logSnr(t))) / RAIL.span;
export const railXFromLogSnr = (l) => RAIL.x0 + ((RAIL.x1 - RAIL.x0) * (RAIL.lMax - l)) / RAIL.span;
export const railT = (x) => tAtLogSnr(RAIL.lMax - ((x - RAIL.x0) * RAIL.span) / (RAIL.x1 - RAIL.x0));
export const clampT = (t) => Math.min(RAIL.tHi, Math.max(RAIL.tLo, t));
export const fogAlpha = (t) => Math.min(0.85, sigma2(t));

export const T_TICKS = [1e-5, 1e-4, 4e-4, 0.001, 0.01, 0.05, 0.1, 0.26, 0.5, 0.7];
export const formatT = (t) => {
  if (t >= 0.001) return String(+t.toPrecision(2));
  const e = Math.round(Math.log10(t));
  if (Math.abs(t - 10 ** e) < 1e-12) return `10${superscript(e)}`;
  return `${+(t / 10 ** Math.floor(Math.log10(t))).toPrecision(2)}×10${superscript(Math.floor(Math.log10(t)))}`;
};
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const superscript = (n) => [...String(n)].map((c) => SUP[c]).join('');

/**
 * The fog band between y0 and y1: a horizontal gradient of the noise haze, alpha = min(0.85, σ_t²)
 * scaled by `strength` (the band is a backdrop, so it is drawn faint).
 */
export function drawFog(ctx, y0, y1, { alpha = 1, strength = 0.32, x0 = RAIL.x0, x1 = RAIL.x1 } = {}) {
  if (alpha <= 0.003) return;
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  for (let i = 0; i <= 60; i++) {
    const x = x0 + ((x1 - x0) * i) / 60;
    g.addColorStop(i / 60, `rgba(170,184,214,${(fogAlpha(railT(x)) * strength).toFixed(4)})`);
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
}

/** Diagonal hatching left of a lane's trained floor: "never trained". */
export function drawWaterline(ctx, tMin, y0, y1, { alpha = 1, label = false } = {}) {
  if (alpha <= 0.003) return;
  const xw = railX(tMin);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.rect(RAIL.x0, y0, xw - RAIL.x0, y1 - y0);
  ctx.clip();
  ctx.strokeStyle = P.dim;
  ctx.lineWidth = 1;
  ctx.globalAlpha *= 0.55;
  for (let x = RAIL.x0 - (y1 - y0); x < xw; x += 9) {
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x + (y1 - y0), y0);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = P.muted;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(xw, y0);
  ctx.lineTo(xw, y1);
  ctx.stroke();
  ctx.restore();
  return xw;
}


const LOGSNR_TICKS = [12, 8, 4, 0, -4];

/**
 * The rail's axis at height y: t labels below (the training clock), log-SNR ticks above (the
 * geometry of the axis). `ticks` overrides the t labels.
 */
export function drawRailAxis(ctx, y, { alpha = 1, ticks = T_TICKS, logSnr: showLogSnr = true, label = true } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = P.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(RAIL.x0, y);
  ctx.lineTo(RAIL.x1 + 30, y);
  ctx.stroke();
  // the cap "→ 1": the rail stops at 0.7, the schedule at 1
  text(ctx, '→ 1', RAIL.x1 + 34, y + 5, { font: font.mono, size: 13, color: P.dim });
  for (const t of ticks) {
    const x = railX(t);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
    text(ctx, formatT(t), x, y + 22, { font: font.mono, size: 13, color: P.muted, align: 'center' });
  }
  if (showLogSnr) {
    for (const l of LOGSNR_TICKS) {
      const x = railXFromLogSnr(l);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 5);
      ctx.stroke();
      text(ctx, String(l).replace('-', '−'), x, y - 10, { font: font.mono, size: 12, color: P.dim, align: 'center' });
    }
    if (label) text(ctx, 'log-SNR', RAIL.x0 - 34, y - 10, { font: font.mono, size: 12, color: P.dim, align: 'right' });
  }
  if (label) text(ctx, 'noise t', RAIL.x0 - 34, y + 22, { font: font.mono, size: 13, color: P.muted, align: 'right' });
  ctx.restore();
}

/** A gold playhead at level t from y0 to y1, with its label above. */
export function drawPlayhead(ctx, t, y0, y1, { alpha = 1, label = true, labelY = y0 - 8 } = {}) {
  if (alpha <= 0.003) return;
  const x = railX(t);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.stroke();
  ctx.restore();
  if (label) text(ctx, `t = ${formatT(t < 0.001 ? +t.toPrecision(2) : +t.toFixed(t < 0.1 ? 3 : 2))}`, x, labelY, { font: font.mono, size: 14, color: P.gold, align: 'center', alpha });
}
