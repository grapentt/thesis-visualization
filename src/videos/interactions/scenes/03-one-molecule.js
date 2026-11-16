import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, camera, arrow, line, dot, ring, polyline3, polygon3, rotation, vec3 } from '../../../kit.js';
import { DEG, WATER, buildWater, waterInternals } from '../toy.js';
import { monomerScore03 } from '../data.js';
import {
  VERTICAL, HORIZONTAL, SCORE_W, WATER_MOL, drawMol, drawHalo, mixHex, coordinateBar, drawTorsorCarousel, drawGaugeFlag, drawScoreArrows, drawNetReadout, toyStamp,
} from '../shared.js';

const RIGHT = 860;
const X0 = buildWater();
const SHIFT = [1.5, 4.5]; // 0.8 Å along x and back
const TURN = [5, 9.5]; // 70° about [0.3, 1, 0.2] and back
const TURN_AXIS = vec3.normalize([0.3, 1, 0.2]);
const RESHAPE = [10, 12.5, 14.2, 15.4]; // r₁ +0.12 Å, θ −12°, then back to rest
const DISTORT = [52, 53.5]; // to scene 03's distorted shape (r₁ = r₀ + 0.06, θ = θ₀ + 12°)
const LEFT_TAP = 2, RIGHT_TAP = 6; // copies the two observers call upright: the ring's left and right ends
const RING_START = -0.3; // puts copies 2 and 6 at the ends of the ring as the camera sees it
const ORBIT = 19; // the carousel appears with 'Turn one shape in every way'
const TAPS = [29.5, 32.5]; // the observers reach for their copies
const NOTE = { ...type.body, size: 20 };

const INVARIANCE = tex(
  String.raw`p(Rx + t) = p(x)\ \Rightarrow\ \textstyle\sum_a s_a = 0,\quad \sum_a (x_a - \bar x)\times s_a = 0`,
  'p(Rx + t) = p(x)  ⇒  Σₐ sₐ = 0,   Σₐ (xₐ − x̄) × sₐ = 0',
);

/** The water at time t: rest, shifted, turned, reshaped, or the distorted shape of the score beat. */
function waterAt(t) {
  const reshape = seg(t, RESHAPE[0], RESHAPE[1]) * (1 - seg(t, RESHAPE[2], RESHAPE[3]));
  const distort = seg(t, ...DISTORT);
  const X = buildWater(WATER.r0 + 0.12 * reshape + 0.06 * distort, WATER.r0, WATER.theta0 + (-12 * reshape + 12 * distort) * DEG);
  const R = rotation.axisAngle(TURN_AXIS, 70 * DEG * Math.sin(Math.PI * lin(t, ...TURN)));
  const dx = 0.8 * Math.sin(Math.PI * lin(t, ...SHIFT));
  const out = [];
  for (let i = 0; i < 3; i++) out.push(...vec3.add(rotation.apply(R, X.slice(3 * i, 3 * i + 3)), [dx, 0, 0]));
  return { X, Y: out, dx, angle: 70 * DEG * Math.sin(Math.PI * lin(t, ...TURN)), reshape, distort };
}

export default defineScene({
  name: 'One molecule',
  duration: 74,
  narration: [
    [0, 'One water has nine coordinates. Shift it or turn it as a rigid body and nothing about it changes. Six coordinates are rigid motion; three, two bond lengths and the angle, are its shape.'],
    [15.5, 'Centring removes the shift; what is left is turning. Turn one shape in every way and you get its orbit: a copy of the rotation group.'],
    [27.5, 'But no copy is special. One observer calls this copy upright, another that one; both are right. An orientation space with no zero is called a torsor.'],
    [40, 'Put all shapes on a floor, and above each shape stand its orbit of turned copies. That is a bundle; the floor is its base.'],
    [51.5, 'A molecule’s density ignores its own rigid motions, so its score has no component along them. Add up its arrows: no net force, and no net torque.'],
    [64, 'That does not forbid turning by changing shape, like a falling cat; more on that at the end.'],
  ],
  header: { eyebrow: '03 · ONE MOLECULE', title: 'Shape, orbit, and a score that never pushes' },

  draw(ctx, t) {
    const cam = camera({ cx: 330, cy: 480, scale: 150, yaw: 0.3, pitch: -0.5, focal: 10 });
    const w = waterAt(t);
    const dimLeft = 1 - 0.7 * fade(t, 40, 41.5, 51.5, 52.5); // the left dims while the bundle is built

    drawBar(ctx, t, w);

    // the torsor carousel; once the observers arrive no copy is bright (none is special)
    const orbit = fade(t, ORBIT, ORBIT + 1, 51.5, 52.5) * (1 - 0.7 * seg(t, 40, 41.5));
    if (orbit > 0) {
      const torsor = { centre: [0, 0, 0], radius: 1.6, axis: [0, 1, 0], copies: 8, scale: 0.4, start: RING_START };
      const calm = seg(t, 27.5, 28.3);
      const tapped = (tap) => seg(t, tap + 0.8, tap + 1.3); // 'this copy': brought up to full strength
      const copies = drawTorsorCarousel(ctx, cam, X0, WATER_MOL, {
        ...torsor, bright: ((t - ORBIT) * 0.55) % 8, brightAlpha: 1 - calm, dimAlpha: 0.35 + 0.4 * calm, alpha: orbit,
        highlight: [[LEFT_TAP, tapped(TAPS[0])], [RIGHT_TAP, tapped(TAPS[1])]],
      });
      drawObservers(ctx, cam, t, copies, orbit);
    }

    // the water itself (the turn axis first, so the atoms cover it)
    const moving = Math.abs(w.dx) > 0.01 || Math.abs(w.angle) > 0.01;
    if (moving) drawMol(ctx, X0, cam, WATER_MOL, { ghost: color.muted, opacity: 0.45 });
    const turning = fade(t, TURN[0] - 0.4, TURN[0], TURN[1], TURN[1] + 0.4);
    if (turning > 0) polyline3(ctx, cam, [vec3.scale(TURN_AXIS, -1.1), vec3.scale(TURN_AXIS, 1.3)], { color: VERTICAL, width: 2, dash: [6, 6], alpha: 0.7 * turning });
    drawHalo(ctx, cam, w.Y, 3, SCORE_W, { alpha: seg(t, 0.3, 1.2) * dimLeft });
    drawMol(ctx, w.Y, cam, WATER_MOL, { opacity: seg(t, 0.3, 1.2) * dimLeft });
    drawRigidArrows(ctx, cam, t, w);

    const pinned = fade(t, 15.5, 16.5, 51.5, 52.5) * dimLeft;
    const c = cam.project([0, 0, 0]);
    dot(ctx, c.x, c.y, 6, color.ink, pinned);
    ring(ctx, c.x, c.y, 6, '#05080f', pinned, 1.5);

    // the shape readout
    const shape = waterInternals(w.Y);
    const tint = mixHex(color.ink, HORIZONTAL, seg(t, RESHAPE[0], RESHAPE[0] + 0.6) * (1 - seg(t, RESHAPE[3], RESHAPE[3] + 0.6)));
    text(ctx, `r₁ ${shape.r1.toFixed(3)} Å · r₂ ${shape.r2.toFixed(3)} Å · θ ${(shape.theta / DEG).toFixed(1)}°`, RIGHT, 260, { font: font.mono, size: 20, color: tint, alpha: fade(t, 0.5, 1.3, 15.5, 16.3) });

    // orbit and torsor captions
    const late = 1 - seg(t, 51.5, 52.3);
    wrap(ctx, 'orbit of one shape: every orbit is a copy of SO(3)', RIGHT, 262, 660, 30, { ...type.body, alpha: seg(t, 23, 24) * late });
    wrap(ctx, 'no copy is special: an orientation space with no zero, a torsor', RIGHT, 304, 660, 30, { ...type.body, color: VERTICAL, alpha: seg(t, 35, 36) * late });

    drawMiniBundle(ctx, t, fade(t, 40.5, 41.5, 51.5, 52.3));
    drawScoreBeat(ctx, cam, t);
  },
});

/** 9 cells: shift, turn (gold), shape (soft blue), pulsing while the water shows them. */
function drawBar(ctx, t, w) {
  const centred = seg(t, 15.5, 16.5);
  const scored = seg(t, 53.5, 54.5);
  const cells = [
    { n: 3, fill: VERTICAL, label: [['shift', 1 - seg(t, 15.5, 16)], ['centred: the shift is gone', seg(t, 16, 16.6)]], dim: 0.8 * centred },
    { n: 3, fill: VERTICAL, label: 'turn', dim: 0.8 * scored },
    { n: 3, fill: HORIZONTAL, label: 'shape' },
  ];
  const beat = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.2 * t);
  const active = [
    fade(t, SHIFT[0], SHIFT[0] + 0.3, SHIFT[1], SHIFT[1] + 0.3),
    fade(t, TURN[0], TURN[0] + 0.3, TURN[1], TURN[1] + 0.3),
    Math.max(fade(t, RESHAPE[0], RESHAPE[0] + 0.3, RESHAPE[3], RESHAPE[3] + 0.3), scored * (1 - seg(t, 63, 64))),
  ];
  const group = active.indexOf(Math.max(...active));
  const alpha = seg(t, 0.5, 1.3);
  coordinateBar(ctx, 80, 220, 680, cells, { pulse: active[group] > 0 ? { group, amount: active[group] * beat } : null, alpha }); // 'shift' hands over to 'centred'
}

/** Gold straight arrow for the shift, gold curved arrow about the axis for the turn (the axis is drawn under the water). */
function drawRigidArrows(ctx, cam, t, w) {
  const a = cam.project([0, 0, 0]);
  if (Math.abs(w.dx) > 0.02) {
    const b = cam.project([w.dx, 0, 0]);
    arrow(ctx, a.x, a.y + 150, b.x, b.y + 150, { color: VERTICAL, width: 4, head: 16 });
  }
  const turning = fade(t, TURN[0] - 0.4, TURN[0], TURN[1], TURN[1] + 0.4);
  if (turning <= 0) return;
  const sense = Math.cos(Math.PI * lin(t, ...TURN)) >= 0 ? 1 : -1; // turning out, then back
  const centre = vec3.scale(TURN_AXIS, 1.0);
  const e1 = vec3.normalize(vec3.cross(TURN_AXIS, [0, 0, 1]));
  const arc = Array.from({ length: 41 }, (_, k) => vec3.add(centre, rotation.apply(rotation.axisAngle(TURN_AXIS, sense * (-0.9 + (1.6 * Math.PI * k) / 40)), vec3.scale(e1, 0.5))));
  polyline3(ctx, cam, arc, { color: VERTICAL, width: 4, alpha: turning });
  const p = cam.project(arc[39]), q = cam.project(arc[40]);
  const ux = q.x - p.x, uy = q.y - p.y, L = Math.hypot(ux, uy) || 1;
  arrow(ctx, q.x - (ux / L) * 4, q.y - (uy / L) * 4, q.x + (ux / L) * 10, q.y + (uy / L) * 10, { color: VERTICAL, width: 4, head: 16, alpha: turning });
}

/** An eye glyph looking along (dx, dy). */
function drawEye(ctx, x, y, dx, dy, alpha) {
  if (alpha <= 0.003) return;
  const L = Math.hypot(dx, dy);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.quadraticCurveTo(x, y - 15, x + 18, y);
  ctx.quadraticCurveTo(x, y + 15, x - 18, y);
  ctx.stroke();
  ctx.restore();
  dot(ctx, x + (4 * dx) / L, y + (3 * dy) / L, 5.5, VERTICAL, alpha);
}

/** Two observers at the ring's left and right; each taps one copy with a gold tick and asks 'upright?'. */
function drawObservers(ctx, cam, t, copies, alpha) {
  const eyes = [
    { x: 48, y: 352, copy: LEFT_TAP, tap: TAPS[0], align: 'left' },
    { x: 612, y: 352, copy: RIGHT_TAP, tap: TAPS[1], align: 'right' },
  ];
  for (const { x, y, copy, tap, align } of eyes) {
    const s = copies[copy].s;
    const dx = s.x - x, dy = s.y - 40 - y, L = Math.hypot(dx, dy);
    drawEye(ctx, x, y, dx, dy, alpha * seg(t, 27.8, 28.8));
    const reach = lin(t, tap, tap + 0.8);
    if (reach > 0) line(ctx, x + (dx / L) * 24, y + (dy / L) * 24, x + (dx / L) * (24 + (L - 30) * reach), y + (dy / L) * (24 + (L - 30) * reach), { color: VERTICAL, dash: [5, 6], width: 2, alpha: 0.8 * alpha });
    const ticked = alpha * seg(t, tap + 0.8, tap + 1.3);
    drawGaugeFlag(ctx, cam, copies[copy].p, { label: '', variant: 'tick', alpha: ticked });
    text(ctx, 'upright?', align === 'left' ? x - 20 : x + 20, y - 26, { ...type.note, color: VERTICAL, align, alpha: ticked });
  }
}

/** The bundle in miniature: a floor of shapes (θ) and three orbits standing on it. */
function drawMiniBundle(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const cam = camera({ cx: 1190, cy: 610, scale: 64, yaw: 0, pitch: -0.35, focal: 14 });
  const xOf = (deg) => ((deg - 105) / 10) * 3.4;
  const FLOOR = -1.9, R = 1.25, STALK = 0.5;
  polygon3(ctx, cam, [[-4.9, FLOOR, -0.5], [4.9, FLOOR, -0.5], [4.9, FLOOR, 0.5], [-4.9, FLOOR, 0.5]], { fill: `${HORIZONTAL}2e`, stroke: HORIZONTAL, width: 2, alpha });
  polyline3(ctx, cam, [[-4.9, FLOOR, 0], [4.9, FLOOR, 0]], { color: HORIZONTAL, width: 2.5, alpha });

  [95, 104.5, 115].forEach((deg, k) => {
    const foot = cam.project([xOf(deg), FLOOR, -0.5]);
    text(ctx, `θ ${deg}°`, foot.x, foot.y + 24, { ...type.note, color: HORIZONTAL, align: 'center', alpha });
    const a = alpha * seg(t, 42 + 0.7 * k, 42.8 + 0.7 * k);
    if (a <= 0.003) return;
    polyline3(ctx, cam, [[xOf(deg), FLOOR, 0], [xOf(deg), FLOOR + STALK, 0]], { color: VERTICAL, width: 2.5, alpha: a });
    const X = buildWater(WATER.r0, WATER.r0, deg * DEG);
    drawTorsorCarousel(ctx, cam, X, WATER_MOL, { centre: [xOf(deg), FLOOR + STALK + R, 0], radius: R, axis: [0, 0, 1], copies: 6, bright: null, scale: 22 / 64, alpha: a, caption: false, start: Math.PI / 6 });
  });

  text(ctx, 'bundle = base + a fibre over every point', 880, 448, { ...type.body, color: color.ink, alpha: alpha * seg(t, 47, 48) });
  const top = cam.project([xOf(115), FLOOR + STALK + 2 * R, 0]);
  text(ctx, 'fibre over a shape: its orbit', 1500, top.y - 30, { ...type.note, color: VERTICAL, align: 'right', alpha: alpha * seg(t, 43.5, 44.5) });
  text(ctx, 'base: the shapes (θ)', 880, 790, { ...type.note, color: HORIZONTAL, alpha: alpha * seg(t, 48.7, 49.5) });
}

/** The distorted water's score: rose arrows, gold zeros at the centroid, the readout and the formula. */
function drawScoreBeat(ctx, cam, t) {
  const { X, s, force, torque, pxPerUnit } = monomerScore03;
  const arrows = seg(t, 54, 55);
  drawScoreArrows(ctx, cam, X, s, { colour: SCORE_W, pxPerUnit, alpha: arrows });
  const c = cam.project([0, 0, 0]);
  const zf = seg(t, 60.2, 61), zt = seg(t, 61.5, 62.3); // 'no net force', 'and no net torque'
  dot(ctx, c.x, c.y, 14, color.bg, zf);
  ring(ctx, c.x, c.y, 14, VERTICAL, zf, 2.5);
  text(ctx, '0', c.x, c.y + 1, { font: font.mono, size: 17, weight: 600, color: VERTICAL, align: 'center', baseline: 'middle', alpha: zf });
  // net torque: a curved arrow around the whole molecule, labelled 0
  const [r, from, to] = [190, 1.08 * Math.PI, 1.92 * Math.PI];
  if (zt > 0) {
    ctx.save();
    ctx.globalAlpha *= zt;
    ctx.strokeStyle = VERTICAL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r, 0.6 * r, 0, from, to);
    ctx.stroke();
    ctx.restore();
    const ex = c.x + r * Math.cos(to), ey = c.y + 0.6 * r * Math.sin(to);
    const tx = -Math.sin(to), ty = 0.6 * Math.cos(to), L = Math.hypot(tx, ty); // tangent, in the arc's direction
    arrow(ctx, ex - (14 * tx) / L, ey - (14 * ty) / L, ex + (4 * tx) / L, ey + (4 * ty) / L, { color: VERTICAL, width: 2.5, head: 14, alpha: zt });
  }
  text(ctx, '0', c.x, c.y - 0.6 * r - 14, { font: font.mono, size: 18, weight: 600, color: VERTICAL, align: 'center', alpha: zt });
  drawNetReadout(ctx, 330, 700, { force, torque, align: 'center', alpha: seg(t, 58.6, 59.4) }); // 'add up its arrows'
  text(ctx, `rose arrows: water’s score −β∇U · arrow 1 Å = ${Math.round(cam.scale / pxPerUnit)} Å⁻¹`, 330, 730, { ...type.note, align: 'center', alpha: arrows });
  toyStamp(ctx, arrows);

  INVARIANCE.draw(ctx, RIGHT, 330, { size: 27, alpha: seg(t, 56.3, 57.1) }); // with 'its score has no component along them'
  wrap(ctx, 'for any density invariant under the molecule’s own rigid motions: its gradient vanishes along them; the torque vanishes about any point, since the net force is zero', RIGHT, 400, 660, 30, { ...NOTE, alpha: seg(t, 58, 58.8) });
  wrap(ctx, 'drawn at small noise (score = −β∇U); at every noise level the same holds, by invariance', RIGHT, 510, 660, 22, { ...type.note, alpha: seg(t, 59.5, 60.3) });
  const closing = { ...type.body, color: VERTICAL, alpha: seg(t, 64.3, 65.3) };
  text(ctx, 'no net torque ≠ cannot turn:', RIGHT, 800, closing);
  text(ctx, 'a shape change can still reorient (scene 17)', RIGHT, 830, closing);
}
