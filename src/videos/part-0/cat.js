// A toy falling cat: two body halves that can twist relative to each other about
// the long axis, each with legs that can be tucked in or stretched out.
//
// Physics (zero angular momentum about the long axis):
//   I_front θ̇_front + I_back θ̇_back = 0,   δ = θ_front − θ_back,
// so while the halves twist, θ̇_front = I_back/(I_front+I_back) δ̇ and
// θ̇_back = −I_front/(I_front+I_back) δ̇. Changing the leg pose at fixed δ turns nothing.
// A loop in shape space (pose, twist) therefore turns the whole cat: holonomy.

import { lerp, seg, clamp } from '../../kit.js';

export const INERTIA = { tucked: 1, extended: 4 };
const inertia = (extension) => lerp(INERTIA.tucked, INERTIA.extended, extension);
/** Relative twist per loop. Net turn per loop = TWIST · (4 − 1)/(4 + 1) = 90°. */
export const TWIST = (150 * Math.PI) / 180;
export const TURN_PER_LOOP = (TWIST * (INERTIA.extended - INERTIA.tucked)) / (INERTIA.extended + INERTIA.tucked);

/** Phases of one loop, as fractions of the loop time. */
const PHASES = [
  { until: 0.15, kind: 'pose', from: [0.5, 0.5], to: [0, 1] }, // tuck front legs, stretch back legs
  { until: 0.45, kind: 'twist', from: 0, to: 1 }, // twist the front half round
  { until: 0.6, kind: 'pose', from: [0, 1], to: [1, 0] }, // swap: stretch front, tuck back
  { until: 0.9, kind: 'twist', from: 1, to: 0 }, // twist back
  { until: 1.0, kind: 'pose', from: [1, 0], to: [0.5, 0.5] }, // relax
];
export const PHASE_LABELS = [
  'tuck the front legs, stretch the back legs',
  'twist: the light front half turns a lot, the heavy back half a little',
  'swap: stretch the front legs, tuck the back legs',
  'twist back: now the back half turns a lot, the front a little',
  'relax: same shape as before, but turned by 90°',
];

/**
 * State after `loops` loops (fractional allowed), starting from orientation `start`.
 * Returns angles (radians, 0 = legs down), leg extensions (0 tucked … 1 stretched),
 * the relative twist δ, the pose asymmetry p = back − front, and the current phase index.
 */
export function catState(loops, start = Math.PI) {
  const done = Math.floor(clamp(loops, 0, 1e9));
  const u = loops - done;
  let front = start + done * TURN_PER_LOOP;
  let back = front;
  let legs = [0.5, 0.5];
  let twist = 0;
  let phase = PHASES.length - 1;
  let begin = 0;
  for (let k = 0; k < PHASES.length; k++) {
    const p = PHASES[k];
    const f = seg(u, begin, p.until);
    if (p.kind === 'pose') {
      const now = [lerp(p.from[0], p.to[0], f), lerp(p.from[1], p.to[1], f)];
      if (u >= begin) legs = now;
    } else if (u >= begin) {
      const [i1, i2] = [inertia(legs[0]), inertia(legs[1])];
      const dTwist = TWIST * (lerp(p.from, p.to, f) - p.from);
      front += (i2 / (i1 + i2)) * dTwist;
      back -= (i1 / (i1 + i2)) * dTwist;
      twist = TWIST * lerp(p.from, p.to, f);
    }
    if (u >= begin && u < p.until) phase = k;
    begin = p.until;
  }
  return { front, back, legs, twist, pose: legs[1] - legs[0], phase };
}

// ---- drawing ---------------------------------------------------------------

const FUR = '#a4acbc';
const FUR_DARK = '#6c7486';
const BELLY = '#dfe2e8';
const OUTLINE = '#2a3142';

/**
 * Side view of the cat, long axis horizontal, head to the right.
 * angles: 0 means legs pointing down (towards +y on screen).
 */
export function drawCat(ctx, { x, y, size = 1, front, back, legs, alpha = 1, squash = 0 }) {
  if (alpha <= 0.003) return;
  const L = 230 * size; // body length
  const h = 62 * size; // body height
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.scale(1 + squash * 0.25, 1 - squash * 0.25);

  const halves = [
    { angle: back, extension: legs[1], x0: -L / 2, x1: 0, sign: -1 },
    { angle: front, extension: legs[0], x0: 0, x1: L / 2, sign: 1 },
  ];
  // legs behind the body first, then the body, then legs in front
  for (const half of halves) drawLegs(ctx, half, h, size, false);
  drawTail(ctx, halves[0], h, size, L);
  for (const half of halves) drawTorso(ctx, half, h);
  drawHead(ctx, halves[1], h, size, L);
  for (const half of halves) drawLegs(ctx, half, h, size, true);
  ctx.restore();
}

/** Screen offset (y) and depth of a direction at `angle` in the cross-section. */
const down = (angle) => ({ y: Math.cos(angle), depth: Math.sin(angle) });
const side = (angle) => ({ y: -Math.sin(angle), depth: Math.cos(angle) });

function drawTorso(ctx, { angle, x0, x1 }, h) {
  const cx = (x0 + x1) / 2;
  const w = Math.abs(x1 - x0) / 2 + h * 0.25;
  ctx.save();
  ctx.fillStyle = FUR;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, 0, w, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, 0, w, h / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  // belly patch on the leg side, stripes on the back side
  const d = down(angle);
  ctx.fillStyle = BELLY;
  ctx.globalAlpha *= 0.35 + 0.65 * Math.max(0, d.depth * 0.5 + 0.5);
  ctx.beginPath();
  ctx.ellipse(cx, d.y * h * 0.42, w * 0.85, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = FUR_DARK;
  ctx.lineWidth = h * 0.09;
  ctx.lineCap = 'round';
  for (let k = -2; k <= 2; k++) {
    const sx = cx + k * w * 0.32;
    ctx.beginPath();
    ctx.moveTo(sx, -d.y * h * 0.5);
    ctx.lineTo(sx + h * 0.06, -d.y * h * 0.12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLegs(ctx, { angle, extension, x0, x1 }, h, size, inFront) {
  const d = down(angle);
  const s = side(angle);
  const length = h * (0.35 + 0.85 * extension);
  for (const lateral of [-1, 1]) {
    const depth = d.depth * 0.6 + s.depth * lateral * 0.35;
    if (depth > 0 !== inFront) continue;
    for (const fx of [0.3, 0.7]) {
      const bx = lerp(x0, x1, fx) + lateral * 4 * size;
      const by = d.y * h * 0.38 + s.y * lateral * h * 0.18;
      const tx = bx;
      const ty = by + d.y * length;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 15 * size;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = depth > 0 ? FUR : FUR_DARK;
      ctx.lineWidth = 11 * size;
      ctx.stroke();
      ctx.fillStyle = BELLY;
      ctx.beginPath();
      ctx.arc(tx, ty, 6 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawHead(ctx, { angle }, h, size, L) {
  const d = down(angle);
  const s = side(angle);
  const hx = L / 2 + h * 0.55;
  const r = h * 0.55;
  ctx.save();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  // ears point away from the legs
  for (const lateral of [-1, 1]) {
    const ex = hx + lateral * r * 0.05;
    const ey = -d.y * r * 0.85 + s.y * lateral * r * 0.45;
    const tipY = ey - d.y * r * 0.7;
    ctx.fillStyle = s.depth * lateral > 0 ? FUR : FUR_DARK;
    ctx.beginPath();
    ctx.moveTo(ex - r * 0.32, ey);
    ctx.lineTo(ex, tipY);
    ctx.lineTo(ex + r * 0.32, ey);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.arc(hx, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // eyes on the side turned to the viewer, nose at the front
  for (const lateral of [-1, 1]) {
    const depth = s.depth * lateral;
    if (depth < -0.2) continue;
    const ey = -d.y * r * 0.15 + s.y * lateral * r * 0.38;
    ctx.fillStyle = '#26303f';
    ctx.beginPath();
    ctx.ellipse(hx + r * 0.42, ey, r * 0.1, r * 0.16 * (0.4 + 0.6 * Math.max(0, depth + 0.2)), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#d98b8b';
  ctx.beginPath();
  ctx.arc(hx + r * 0.95, d.y * r * 0.12, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTail(ctx, { angle }, h, size, L) {
  const d = down(angle);
  const bx = -L / 2 - h * 0.1;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 15 * size;
  ctx.beginPath();
  ctx.moveTo(bx, 0);
  ctx.bezierCurveTo(bx - h * 0.9, -d.y * h * 0.2, bx - h * 1.1, -d.y * h * 1.0, bx - h * 0.6, -d.y * h * 1.35);
  ctx.stroke();
  ctx.strokeStyle = FUR_DARK;
  ctx.lineWidth = 10 * size;
  ctx.stroke();
  ctx.restore();
}
