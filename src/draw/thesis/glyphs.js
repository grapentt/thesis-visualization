// Feature glyphs (programme.md §3.2): one small icon per observable, in its ramp hue, so features
// can share a lane without colour alone telling them apart.
//   Fill = readability (a moon fill where a curve exists); outline = estimator:
//   solid = best estimator (a lower bound, "≥"), dashed = first order, dotted = block alone.

import { P } from './palette.js';
import { text } from '../text.js';
import { font } from '../theme.js';

export const FEATURES = Object.freeze({
  bond: { colour: P.stiff, label: 'bonds' },
  angle: { colour: P.angle, label: 'angles' },
  torsion: { colour: P.soft, label: 'torsions' },
  near: { colour: P.angle, label: 'pairs 3 apart' },
  mid: { colour: P.mid, label: 'pairs 7–10 apart' },
  longrange: { colour: P.mid, label: 'long-range (≥ 11 apart)' },
  contacts: { colour: P.mid, label: 'contacts' },
  endtoend: { colour: P.mid, label: 'end-to-end' },
  rg: { colour: P.global, label: 'size (Rg)' },
  tic: { colour: P.global, label: 'slowest TIC' },
  closest: { colour: P.wall, label: 'closest non-neighbour' },
  wall: { colour: P.wall, label: 'the wall' },
  mode: { colour: P.soft, label: 'principal mode' },
});

/**
 * A feature glyph centred at (x, y), radius r. estimator: 'best' | 'first' | 'block' | 'exact'.
 * fill ∈ [0, 1]: how much of the disc is filled (readability, a moon fill from the left).
 */
export function glyph(ctx, kind, x, y, { r = 10, alpha = 1, estimator = 'best', fill = 1, colour } = {}) {
  if (alpha <= 0.003) return;
  const c = colour ?? FEATURES[kind]?.colour ?? P.ink;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // the disc: filled to `fill`, outlined by estimator
  if (fill > 0.002) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.fillStyle = c;
    ctx.globalAlpha *= 0.28;
    ctx.fillRect(x - r, y - r, 2 * r * Math.min(1, fill), 2 * r);
    ctx.restore();
  }
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.setLineDash(estimator === 'first' ? [4, 3] : estimator === 'block' ? [1.5, 2.5] : []);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  // the icon
  ctx.fillStyle = c;
  ctx.lineWidth = 1.6;
  const s = r * 0.55;
  const dotAt = (px, py, rr = 1.9) => {
    ctx.beginPath();
    ctx.arc(px, py, rr, 0, 2 * Math.PI);
    ctx.fill();
  };
  const seg = (x0, y0, x1, y1) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };
  switch (kind) {
    case 'bond':
      seg(x - s, y, x + s, y);
      dotAt(x - s, y);
      dotAt(x + s, y);
      break;
    case 'angle':
    case 'near':
      seg(x - s, y + s * 0.6, x, y - s * 0.6);
      seg(x, y - s * 0.6, x + s, y + s * 0.6);
      dotAt(x - s, y + s * 0.6, 1.5);
      dotAt(x, y - s * 0.6, 1.5);
      dotAt(x + s, y + s * 0.6, 1.5);
      break;
    case 'torsion':
    case 'mode':
      ctx.beginPath();
      ctx.arc(x, y, s, -0.3 * Math.PI, 1.25 * Math.PI);
      ctx.stroke();
      seg(x + s * Math.cos(-0.3 * Math.PI), y + s * Math.sin(-0.3 * Math.PI), x + s * Math.cos(-0.3 * Math.PI) + 3, y + s * Math.sin(-0.3 * Math.PI) + 3);
      break;
    case 'mid':
    case 'longrange':
      ctx.beginPath();
      ctx.arc(x, y + s * 0.5, s, Math.PI, 2 * Math.PI);
      ctx.stroke();
      dotAt(x - s, y + s * 0.5);
      dotAt(x + s, y + s * 0.5);
      break;
    case 'contacts':
      dotAt(x - s * 0.7, y + s * 0.6, 1.6);
      dotAt(x, y, 1.6);
      dotAt(x + s * 0.7, y - s * 0.6, 1.6);
      break;
    case 'endtoend':
      seg(x - s, y, x + s, y);
      seg(x - s, y, x - s + 3, y - 3);
      seg(x - s, y, x - s + 3, y + 3);
      seg(x + s, y, x + s - 3, y - 3);
      seg(x + s, y, x + s - 3, y + 3);
      break;
    case 'rg':
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.stroke();
      dotAt(x, y, 1.6);
      break;
    case 'tic':
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const u = -s + (2 * s * i) / 12;
        const v = Math.sin((i / 12) * 2 * Math.PI) * s * 0.5;
        i ? ctx.lineTo(x + u, y + v) : ctx.moveTo(x + u, y + v);
      }
      ctx.stroke();
      break;
    case 'closest':
      dotAt(x - s * 0.7, y);
      dotAt(x + s * 0.7, y);
      seg(x, y - s * 0.7, x, y + s * 0.7);
      break;
    case 'wall':
      dotAt(x - s * 0.8, y);
      dotAt(x + s * 0.8, y);
      ctx.lineWidth = 3;
      seg(x - 1.5, y - s, x - 1.5, y + s);
      seg(x + 1.5, y - s, x + 1.5, y + s);
      break;
    default:
      dotAt(x, y, 2.5);
  }
  ctx.restore();
  if (estimator === 'best' || estimator === 'block') text(ctx, '≥', x + r + 2, y - r + 4, { font: font.mono, size: 11, color: c, alpha: alpha * 0.9 });
}

/**
 * Place glyphs along a lane without overlap: items [{x, ...}] get a `row` (0, 1, 2, …) so that
 * glyphs closer than `gap` px sit on different sub-rows (greedy, left to right).
 */
export function stack(items, gap = 24) {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const lastX = [];
  for (const it of sorted) {
    let row = 0;
    while (lastX[row] !== undefined && it.x - lastX[row] < gap) row++;
    lastX[row] = it.x;
    it.row = row;
  }
  return items;
}
