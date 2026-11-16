// Extra beads that are not part of the molecule: points of an associated bundle.

import { color, text, type, font } from '../../kit.js';
import { mix } from '../../draw/color.js';

/** Colour of everything that lives in an associated bundle. */
export const BEAD = '#5fd3b0';

/** A shaded bead at 3D point p. Options: alpha, radius (Å), label, ghost (outline only), tint. */
export function drawBead(ctx, cam, p, { alpha = 1, radius = 0.24, label, ghost = false, tint = BEAD } = {}) {
  if (alpha <= 0.003) return null;
  const s = cam.project(p);
  const r = Math.max(5, radius * cam.scale * s.k);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (ghost) {
    ctx.strokeStyle = mix(tint, color.bg, 0.4);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const g = ctx.createRadialGradient(s.x - r * 0.35, s.y - r * 0.4, r * 0.08, s.x, s.y, r);
    g.addColorStop(0, mix(tint, '#ffffff', 0.6));
    g.addColorStop(0.5, tint);
    g.addColorStop(1, mix(tint, '#000000', 0.55));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (label && !ghost) text(ctx, label, s.x + r + 8, s.y + 8, { font: font.display, italic: true, size: 26, color: tint, alpha });
  return s;
}

/** A bond-like stick between two beads. */
export function drawStick(ctx, cam, a, b, { alpha = 1, tint = BEAD, width = 0.07 } = {}) {
  if (alpha <= 0.003) return;
  const p = cam.project(a);
  const q = cam.project(b);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#05080f';
  ctx.lineWidth = width * cam.scale + 5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();
  ctx.strokeStyle = mix(tint, color.bg, 0.25);
  ctx.lineWidth = width * cam.scale;
  ctx.stroke();
  ctx.restore();
}

export const beadLabel = (ctx, str, x, y, alpha = 1) => text(ctx, str, x, y, { ...type.note, color: BEAD, alpha });
