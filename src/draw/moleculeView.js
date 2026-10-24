// Ball-and-stick rendering of a molecule configuration, plus 3D arrows.

import { molecule as defaultMolecule, ELEMENTS } from '../model/molecule.js';
import { camera } from '../model/camera.js';
import { add, axisVector } from '../model/vec3.js';
import { clamp } from '../engine/timing.js';
import { color, font, axisColor, axisName } from './theme.js';
import { mix } from './color.js';
import { arrow } from './shapes.js';
import { text } from './text.js';

/** A camera centred on the molecule, so it rotates about its own middle. */
export const moleculeCamera = (options = {}) => camera({ center: defaultMolecule.centroid, ...options });

/** Arrow from 3D point `origin` along 3D vector `delta`. Returns the projected tip. */
export function arrow3(ctx, cam, origin, delta, options) {
  const a = cam.project(origin);
  const b = cam.project(add(origin, delta));
  arrow(ctx, a.x, a.y, b.x, b.y, options);
  return b;
}

/**
 * x, y, z arrows at a 3D point, with labels.
 * active: index of the emphasised axis (others dim), −1 for none.
 */
export function drawAxisTriad(ctx, cam, origin, { length, active = -1, labelAlpha = 1, head = 13, labelSize = 28 }) {
  for (let k = 0; k < 3; k++) {
    const on = active === k;
    const tip = arrow3(ctx, cam, origin, axisVector(k, length), {
      color: axisColor[k],
      width: on ? 5 : 2.5,
      head,
      alpha: active === -1 || on ? 1 : 0.4,
    });
    const dx = k === 0 ? 10 : k === 2 ? -26 : 8;
    const dy = k === 1 ? -6 : k === 2 ? 18 : 8;
    text(ctx, axisName[k], tip.x + dx, tip.y + dy, { font: font.display, italic: true, size: labelSize, color: axisColor[k], alpha: labelAlpha });
  }
}

function bondPath(a, b, progress, spring) {
  const points = [];
  const steps = spring > 0 ? 64 : 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * progress;
    let offset = 0;
    if (spring > 0 && u > 0.22 && u < 0.78) {
      const w = (u - 0.22) / 0.56;
      const zigzag = Math.asin(Math.sin(w * Math.PI * 12)) / (Math.PI / 2);
      offset = spring * 10 * zigzag * Math.sin(w * Math.PI);
    }
    points.push([a.x + dx * u + nx * offset, a.y + dy * u + ny * offset]);
  }
  return points;
}

function strokePath(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

const pick = (value, i, fallback) => (Array.isArray(value) ? value[i] : value ?? fallback);

/**
 * Draw configuration X. Returns the projected atom positions.
 *
 * Options (per-atom options take a number or an array with one value per atom):
 *   opacity          overall opacity
 *   atomAlpha        per-atom opacity
 *   atomScale        per-atom size, 0 = small dot with an offset label, 1 = full sphere
 *   bondProgress     per-bond drawing progress 0 … 1
 *   labels           opacity of the atom numbers
 *   highlight        atom index or array of indices to ring
 *   highlightAlpha, highlightColor
 *   glowBond         index of a bond drawn glowing in the stiff colour
 *   ghost            colour → draw as a thin outline only (for overlays of many samples)
 *   spring           0 … 1 morphs bonds into zigzag springs
 *   molecule         another Molecule (defaults to the one in the video)
 */
export function drawMolecule(ctx, X, cam, o = {}) {
  const mol = o.molecule ?? defaultMolecule;
  const P = [];
  for (let i = 0; i < mol.count; i++) P.push(cam.project(mol.atom(X, i)));
  const opacity = o.opacity ?? 1;
  if (opacity <= 0.003) return P;

  const alphaOf = (i) => pick(o.atomAlpha, i, 1) * opacity;
  const scaleOf = (i) => pick(o.atomScale, i, 1);
  const highlighted = [].concat(o.highlight ?? []);
  const bondWidth = 0.07 * cam.scale;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  mol.bonds.forEach(([a, b], bi) => {
    const progress = pick(o.bondProgress, bi, 1);
    const alpha = Math.min(alphaOf(a), alphaOf(b));
    if (progress <= 0.002 || alpha <= 0.003) return;
    const path = bondPath(P[a], P[b], progress, o.spring || 0);
    ctx.globalAlpha = alpha;
    if (o.ghost) {
      ctx.strokeStyle = o.ghost;
      ctx.lineWidth = 2.2;
      strokePath(ctx, path);
      return;
    }
    ctx.strokeStyle = '#05080f';
    ctx.lineWidth = bondWidth + 5;
    strokePath(ctx, path);
    if (o.glowBond === bi) {
      ctx.save();
      ctx.shadowColor = color.stiff;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = color.stiff;
      ctx.lineWidth = bondWidth;
      strokePath(ctx, path);
      ctx.restore();
    } else {
      const ca = mix(ELEMENTS[mol.elements[a]].color, color.bg, 0.25);
      const cb = mix(ELEMENTS[mol.elements[b]].color, color.bg, 0.25);
      const g = ctx.createLinearGradient(P[a].x, P[a].y, P[b].x, P[b].y);
      g.addColorStop(0, ca);
      g.addColorStop(0.5, ca);
      g.addColorStop(0.5, cb);
      g.addColorStop(1, cb);
      ctx.strokeStyle = g;
      ctx.lineWidth = bondWidth;
      strokePath(ctx, path);
    }
  });

  const backToFront = P.map((_, i) => i).sort((i, j) => P[j].z - P[i].z);
  for (const i of backToFront) {
    const alpha = alphaOf(i);
    if (alpha <= 0.003) continue;
    const p = P[i];
    const element = ELEMENTS[mol.elements[i]];
    const size = scaleOf(i);
    const r = Math.max(6, element.radius * cam.scale * p.k * size);
    ctx.globalAlpha = alpha;

    if (o.ghost) {
      ctx.strokeStyle = o.ghost;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }

    const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.4, r * 0.08, p.x, p.y, r);
    g.addColorStop(0, mix(element.color, '#ffffff', 0.6));
    g.addColorStop(0.5, element.color);
    g.addColorStop(1, mix(element.color, '#000000', 0.55));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    const ringAlpha = o.highlightAlpha ?? 1;
    if (highlighted.includes(i) && ringAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha * ringAlpha;
      ctx.strokeStyle = o.highlightColor || color.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const labelAlpha = (o.labels ?? 1) * alpha;
    if (labelAlpha > 0.01) {
      const offset = (1 - clamp(size)) * 18;
      const fontSize = Math.round(clamp(r * 0.75, 15, 26));
      ctx.save();
      ctx.globalAlpha = labelAlpha;
      ctx.font = `600 ${fontSize}px ${font.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(5,8,15,.85)';
      ctx.strokeText(String(i + 1), p.x + offset, p.y - offset);
      ctx.fillStyle = '#fff';
      ctx.fillText(String(i + 1), p.x + offset, p.y - offset);
      ctx.restore();
    }
  }
  ctx.restore();
  return P;
}
