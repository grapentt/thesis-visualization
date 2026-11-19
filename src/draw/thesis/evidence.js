// Evidence devices (programme.md §3.5): epistemic badges, status stamps, budget chips and the
// provenance strip. Monochrome capsules, legible in greyscale.
//   M measured (filled) · D derived (outline) · D·model (outline + "model") · H hypothesis (dashed)
//   I illustrative (dotted italic) · S cited (square corners)

import { text, setFont } from '../text.js';
import { font } from '../theme.js';
import { roundRect } from '../shapes.js';
import { P } from './palette.js';
import { ev, budgetChip } from '../../model/thesis/ledger.js';

const measure = (ctx, str, o) => {
  ctx.save();
  setFont(ctx, o);
  if (o.tracking) ctx.letterSpacing = `${o.tracking}px`;
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
};

/** An epistemic badge at (x, y) (left, vertical centre). Returns its width. */
export function badge(ctx, kind, x, y, { alpha = 1, size = 12 } = {}) {
  if (alpha <= 0.003) return 0;
  const label = kind === 'D·model' ? 'D · model' : kind;
  const o = { font: font.mono, size, weight: 600, italic: kind === 'I' };
  const w = measure(ctx, label, o) + 12;
  const h = size + 8;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = P.body;
  if (kind === 'H') ctx.setLineDash([3, 3]);
  if (kind === 'I') ctx.setLineDash([1, 2.5]);
  if (kind === 'S') {
    ctx.beginPath();
    ctx.rect(x, y - h / 2, w, h);
  } else roundRect(ctx, x, y - h / 2, w, h, h / 2);
  if (kind === 'M') {
    ctx.fillStyle = P.body;
    ctx.fill();
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  text(ctx, label, x + w / 2, y + size * 0.36, { ...o, color: kind === 'M' ? P.bg : P.body, align: 'center', alpha });
  return w;
}

/** A small capsule of text, e.g. an estimator chip "best estimator · ≥". Returns its width. */
export function chip(ctx, str, x, y, { colour = P.muted, alpha = 1, size = 13, align = 'left', fill = 'rgba(13,19,33,0.85)', dash = [] } = {}) {
  if (alpha <= 0.003) return 0;
  const o = { font: font.mono, size };
  const w = measure(ctx, str, o) + 16;
  const h = size + 10;
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= alpha;
  roundRect(ctx, left, y - h / 2, w, h, 6);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.2;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
  text(ctx, str, left + 8, y + size * 0.36, { ...o, color: colour, alpha });
  return w;
}

/** A status stamp in capitals, e.g. MECHANISM UNTESTED or DECLARED, NOT RUN. */
export function stamp(ctx, str, x, y, { colour = P.wall, alpha = 1, size = 14, align = 'left', angle = 0 } = {}) {
  if (alpha <= 0.003) return;
  const o = { font: font.mono, size, weight: 600, tracking: 2 };
  const w = measure(ctx, str, o) + 20;
  const h = size + 14;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const left = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.strokeRect(left, -h / 2, w, h);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  text(ctx, str, left + 10 + 1, size * 0.36, { ...o, color: colour, alpha });
  ctx.restore();
}

/** The budget chip of a ledger row, drawn in muted mono. */
export function budget(ctx, id, x, y, { alpha = 1, align = 'left', size = 12, colour = P.muted } = {}) {
  text(ctx, budgetChip(ev(id)), x, y, { font: font.mono, size, color: colour, align, alpha });
}

/** The rig stamp at the bottom right: what the picture is computed from. */
export function rigStamp(ctx, str, alpha = 1) {
  text(ctx, str, 1572, 890, { font: font.mono, size: 13, color: P.dim, align: 'right', alpha });
}
