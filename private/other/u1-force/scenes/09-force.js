// Scene 09: the force. Two answers to the same sideways push of the worldline: the flux through the
// ribbon (the field's) and the velocities the mass must change (the mass's). On the physical
// worldline they cancel pointwise for every push: m ẍ♭ = e F(·, U). Then the covector f♭ = e F(·, U)
// drawn as a stack of lines parallel to the velocity.
import {
  defineScene, seg, fade, lerp, lin, text, wrap, type, color, font, rgba, tex, line, dot, arrow, slider, choice,
  C, header, clock, leverSim, track, frame, clipped, axes, drawPath, drawStrip, drawPoint, drawSamples, readout, stamp, caption, fmt,
} from '../shared.js';
import { times, straightPath, shoot, velocities, hump, electricField, ribbonFlux, firstVariation, varied } from '../math.js';

// ---- the physics (everything else is drawn from these) --------------------------------------------
const T = 2;
const N = 400;
const E = 2; // the uniform electric field, in units of ħ/e: F = E dx∧dt
const M = 1; // the mass
const Q = 1; // the charge e
const XA = -1;
const XB = 0.8;
const FIELD = electricField({ E, gauge: 'phi' });
const TS = times(T, N);
const PHYSICAL = shoot(() => Q * E, XA, XB, T, N, { m: M }).xs; // m ẍ = e E from A to B
const STRAIGHT = straightPath(XA, XB, T, N);
const PATHS = { physical: PHYSICAL, straight: STRAIGHT };
const VELOCITIES = { physical: velocities(PHYSICAL, T), straight: velocities(STRAIGHT, T) };

/** The two answers to the push εη on the worldline xs: violet e F(εη, U) and green m ẍ εη, per node. */
function balance(xs, eps, where) {
  const etas = TS.map((t) => hump(t / T, where, 0.18));
  const { perTime } = ribbonFlux(FIELD, xs, etas, eps, T); // E η per unit ε
  const { onNodes } = firstVariation(xs, etas, T, { m: M }); // −m ẍ η per unit ε
  const field = perTime.map((f) => Q * f * eps);
  const mass = onNodes.map((f) => -f * eps);
  const dt = T / N;
  let dS = 0;
  for (let i = 1; i < N; i++) dS += (field[i] - mass[i]) * dt;
  return { etas, field, mass, dS };
}

/** The value of a grid function at time t0 (linear interpolation). */
const at = (ys, t0) => {
  const u = (Math.max(0, Math.min(T, t0)) / T) * N;
  const i = Math.min(N - 1, Math.floor(u));
  return lerp(ys[i], ys[i + 1], u - i);
};

// ---- the stage ---------------------------------------------------------------------------------------
const S = frame({ x: 110, y: 190, w: 540, h: 600, u: [-2, 2], v: [0, 2] });
const BP = frame({ x: 900, y: 200, w: 560, h: 240, u: [0, 2], v: [-2.4, 2.4] });
const RIGHT = 900;
const WIDE = 600;

const F_DS = tex(String.raw`\delta S \;=\; e\!\int\! F(\varepsilon\eta,\,U)\,dt \;-\; \int\! m\,\ddot x\,\varepsilon\eta\,dt`, 'δS = e∫F(εη, U) dt − ∫ m ẍ εη dt');
const F_LAW = tex(String.raw`\text{for every }\eta:\qquad m\,\ddot x^{\flat} \;=\; e\,F(\cdot,\,U)`, 'for every η:  m ẍ♭ = e F(·, U)');
const F_ONE = tex(String.raw`F = E\,dx\wedge dt,\qquad f = e\,E,\qquad V = -\,e\,E\,x`, 'F = E dx∧dt,  f = eE,  V = −eEx');
const F_COV = tex(String.raw`f^{\flat} \;=\; e\,F(\cdot,\,U)`, 'f♭ = e F(·, U)');
const F_COV2 = tex(String.raw`f^{\flat}(\eta) = e\,E\,\eta,\qquad f^{\flat}(U) = e\,F(U,U) = 0`, 'f♭(η) = eEη,   f♭(U) = eF(U, U) = 0');

// the moments of the scene
const CURVES_AT = 2;
const MOVE_AT = 14;
const LAW_AT = 22;
const ONE_AT = 26;
const STRAIGHT_AT = 40;
const HANDOVER_AT = 56;
const COV_AT = 62;
const ETA_AT = 76;
const U_AT = 81;
const SHOWN_BY = 9; // by then everything the levers change is on screen
const COV_R = 150; // the disk of the covector, kept inside the frame by the range of its event (t₀ ∈ [1.2, 1.45])

/** The region between two sampled curves, filled. */
function shadeBetween(ctx, F, us, a, b, { fill, alpha = 1 }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  us.forEach((u, i) => {
    const [x, y] = F.point([u, a[i]]);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  for (let i = us.length - 1; i >= 0; i--) ctx.lineTo(...F.point([us[i], b[i]]));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

/** An arrow between two plane points of a frame, with a label at its tip. */
function planeArrow(ctx, F, p, q, { colour, alpha = 1, label = '', width = 3.5, labelOffset = [10, -8] }) {
  if (alpha <= 0.003) return;
  const [x0, y0] = F.point(p);
  const [x1, y1] = F.point(q);
  arrow(ctx, x0, y0, x1, y1, { color: colour, width, head: 13, alpha });
  if (label) text(ctx, label, x1 + labelOffset[0], y1 + labelOffset[1], { font: font.display, italic: true, size: 24, color: colour, alpha });
}

/** A label on a dark disc, so that it stays legible over the covector's lines. */
function backedLabel(ctx, s, x, y, colour, alpha) {
  if (alpha <= 0.003) return;
  dot(ctx, x, y - 7, 14, 'rgba(13,19,33,0.85)', alpha);
  text(ctx, s, x, y, { font: font.display, italic: true, size: 24, color: colour, align: 'center', alpha });
}

/**
 * The force covector f♭ = eE (dx − ẋ dt) at the event (x0, t0) of the worldline, drawn as its level
 * lines f♭ = k: lines parallel to U = (ẋ, 1), spaced 1/(eE) in x (1/(eE√(1+ẋ²)) perpendicularly),
 * inside a disk around the event.
 */
function drawCovector(ctx, F, x0, t0, xdot, { alpha = 1, radius = 150 }) {
  if (alpha <= 0.003) return;
  const [cx, cy] = F.point([x0, t0]);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = rgba(C.force, 0.07);
  ctx.fill();
  ctx.clip();
  const spacing = 1 / (Q * E);
  for (let k = -8; k <= 8; k++) {
    if (k === 0) continue;
    const c = x0 + k * spacing;
    const [ax, ay] = F.point([c - xdot * 0.8, t0 - 0.8]);
    const [bx, by] = F.point([c + xdot * 0.8, t0 + 0.8]);
    line(ctx, ax, ay, bx, by, { color: C.force, width: 1.8, alpha: 0.9 });
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = rgba(C.force, 0.55);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

export default defineScene({
  name: 'The force',
  duration: 90,
  header: header(9, 'THE FORCE', 'Curvature with the velocity in one slot'),
  narration: [
    [0, 'Two answers to one sideways push. The field’s: the flux through the ribbon, e F of eta and U, over time. The mass’s: the change of velocity it must pay for, m x double-dot eta.'],
    [MOVE_AT + 1, 'Move the push along the worldline: the two curves coincide at every instant. The field pays what the mass charges, for every push: that is the physical worldline.'],
    [ONE_AT, 'In one space dimension F has a single entry, E, and the force is e E: a uniform field, like scene six’s. The curvature picture reproduces the potential picture. A magnetic field has no landscape V; the ribbon still works.'],
    [STRAIGHT_AT + 2, 'Now the straight worldline. The field still answers; the mass answers nothing, since the velocity never changes. The curves disagree and delta S is not zero: this is not the path the particle takes.'],
    [HANDOVER_AT, 'Your turn: try to find a nudge where the curves disagree on the physical worldline.'],
    [COV_AT, 'Curvature is the phase response to an oriented area. The moving particle supplies one side, U d t. What is left is a linear function of the other side, the push: a force covector.'],
    [ETA_AT, 'A stack of lines along the velocity, as dense as the curvature. A sideways push counts the lines it crosses; a push along the motion crosses none. You cannot push a sail along its own length.'],
  ],
  beats: [
    [MOVE_AT, 'Move the push'],
    [ONE_AT, 'One dimension'],
    [STRAIGHT_AT, 'The straight worldline'],
    [HANDOVER_AT, 'Your turn'],
    [COV_AT, 'The force covector'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: try to find a nudge where the curves disagree.' }],
  exploreFrom: 1.5,
  controls: {
    eps: slider('Nudge ε', { min: -1, max: 1, step: 0.01, value: [[0, 0.5], [44, 0.5], [48, -0.6], [53, -0.6], [55.5, 0.5]] }),
    where: slider('Nudge at t₀ / T', { min: 0.12, max: 0.88, step: 0.01, value: [[0, 0.5], [MOVE_AT, 0.5], [18, 0.25], [20, 0.25], [24, 0.75], [30, 0.75], [33, 0.5]] }),
    path: choice('Worldline', { physical: 'physical', straight: 'straight' }, { value: [[0, 'physical'], [STRAIGHT_AT, 'straight'], [HANDOVER_AT, 'physical']], lens: true }),
  },
  sim: leverSim(['eps', 'where']),

  draw(ctx, t, live) {
    const tt = clock(t, live, SHOWN_BY);
    const { eps, where } = live.input;
    const which = live.input.path in PATHS ? live.input.path : 'physical';
    const xs = PATHS[which];
    const xdots = VELOCITIES[which];
    const { etas, field, mass, dS } = balance(xs, eps, where);
    const nudged = varied(xs, etas, eps);
    const world = xs.map((x, i) => [x, TS[i]]);
    const pushed = nudged.map((x, i) => [x, TS[i]]);
    const on = seg(tt, 0.2, 1.2);
    const covariant = seg(tt, COV_AT, COV_AT + 2); // the climax: the ribbon steps back

    // ---- left: the spacetime frame with the worldline, its nudge and the ribbon ----
    axes(ctx, S, { xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 1, 2], xLabel: 'x', grid: true, alpha: on });
    // the t axis name above the axis, clear of the top tick label
    text(ctx, 't', S.x, S.y - 12, { font: font.display, italic: true, size: 20, color: color.muted, align: 'center', alpha: on });
    caption(ctx, S, `the ${which} worldline, its nudge and the ribbon`, on);
    clipped(ctx, S, () => {
      const ribbon = on * (1 - 0.7 * covariant);
      drawStrip(ctx, S, pushed, world, { fill: rgba(eps * E >= 0 ? C.curvature : C.curvatureNeg, 0.32), alpha: ribbon });
      drawPath(ctx, S, pushed, { colour: C.varied, width: 2.5, alpha: ribbon });
      drawPath(ctx, S, world, { colour: C.path, width: 3.2, alpha: on });
    }, 4);
    drawPoint(ctx, S, world[0], { colour: C.path, r: 6, label: 'A', labelOffset: [-28, 8], alpha: on });
    drawPoint(ctx, S, world[N], { colour: C.path, r: 6, label: 'B', labelOffset: [14, 6], alpha: on });
    text(ctx, `ε = ${fmt(eps, 2)}    t₀ / T = ${fmt(where, 2)}    E = ${fmt(E, 1)}    e = m = 1`, S.x, 866, { font: font.mono, size: 15, color: color.muted, alpha: on });

    // the force covector at a moving event of the worldline (beat 4)
    if (covariant > 0.003) {
      // the event slides up the worldline; its disk stays inside the frame for t₀ ∈ [1.2, 1.45]
      const t0 = T * track(tt, [[COV_AT + 1, 0.6], [COV_AT + 11, 0.725]]);
      const x0 = at(xs, t0);
      const xdot = at(xdots, t0);
      clipped(ctx, S, () => drawCovector(ctx, S, x0, t0, xdot, { alpha: covariant, radius: COV_R }), 6);
      const P = [x0, t0];
      const pU = S.point(P);
      // the lines a unit sideways push crosses
      const etaOn = seg(tt, ETA_AT, ETA_AT + 1.5);
      planeArrow(ctx, S, P, [x0 + 1, t0], { colour: C.varied, alpha: etaOn });
      for (let k = 1; k <= Q * E; k++) {
        const [kx, ky] = S.point([x0 + k / (Q * E), t0]);
        dot(ctx, kx, ky, 5, C.force, etaOn);
      }
      const [ex, ey] = S.point([x0 + 1, t0]);
      backedLabel(ctx, 'η', ex - 14, ey - 18, C.varied, etaOn);
      // U along the worldline; at U_AT it grows: a push along the motion, between two lines
      const uOn = seg(tt, U_AT, U_AT + 1.5);
      const uLen = lerp(0.28, 0.42, uOn);
      const tip = [x0 + uLen * xdot, t0 + uLen];
      planeArrow(ctx, S, P, tip, { colour: C.kinetic, alpha: covariant, width: lerp(3.5, 4.5, uOn) });
      // the U label sits beside the tip, on the side away from the worldline's bend and from η
      const [qx, qy] = S.point(tip);
      const dl = Math.hypot(qx - pU[0], qy - pU[1]) || 1;
      const [dx, dy] = [(qx - pU[0]) / dl, (qy - pU[1]) / dl];
      backedLabel(ctx, 'U', qx + dy * 22 + dx * 4, qy - dx * 22 + dy * 4 + 8, C.kinetic, covariant);
      dot(ctx, pU[0], pU[1], 6, C.path, covariant);
      text(ctx, `rose lines: f♭ = k, spacing 1/(eE) = ${fmt(1 / (Q * E), 2)} in x`, S.x + S.w - 34, S.y + S.h + 44, { font: font.mono, size: 14, color: C.force, align: 'right', alpha: covariant });
    }

    // ---- right-top: the balance plot ----
    const plotOn = seg(tt, CURVES_AT - 0.5, CURVES_AT + 0.5);
    axes(ctx, BP, { xTicks: [0, 0.5, 1, 1.5, 2], yTicks: [-2, -1, 0, 1, 2], xLabel: 't', grid: true, alpha: plotOn, format: (v) => fmt(v, 1), formatY: (v) => fmt(v, 0) });
    const fieldOn = seg(tt, CURVES_AT, CURVES_AT + 3);
    const massOn = seg(tt, CURVES_AT + 3, CURVES_AT + 6);
    const shade = seg(tt, CURVES_AT + 6, CURVES_AT + 7);
    clipped(ctx, BP, () => {
      shadeBetween(ctx, BP, TS, field, mass, { fill: rgba(color.ink, 0.22), alpha: shade });
      drawSamples(ctx, BP, TS, field, { colour: C.curvature, width: 3.5, progress: fieldOn, alpha: plotOn });
      drawSamples(ctx, BP, TS, mass, { colour: C.kinetic, width: 2.5, dash: [7, 5], progress: massOn, alpha: plotOn });
    }, 4);
    text(ctx, 'e F(εη, U) = eE εη   the field', RIGHT, BP.y - 14, { font: font.mono, size: 15, color: C.curvature, alpha: fieldOn });
    text(ctx, 'm ẍ εη   the mass', RIGHT + 300, BP.y - 14, { font: font.mono, size: 15, color: C.kinetic, alpha: massOn });
    readout(ctx, 'δS = ∫ (violet − green) dt =', dS, RIGHT, 508, { colour: Math.abs(dS) < 2e-3 ? color.ink : C.force, digits: 3, size: 18, alpha: shade });
    text(ctx, Math.abs(dS) < 2e-3 ? 'balanced for this push' : 'not balanced', RIGHT + 420, 508, { font: font.mono, size: 14, color: Math.abs(dS) < 2e-3 ? color.muted : C.force, alpha: shade });

    // ---- right-bottom: formulas and notes, one beat at a time ----
    const beat1 = fade(tt, CURVES_AT + 7, CURVES_AT + 8, COV_AT - 1, COV_AT);
    F_DS.draw(ctx, RIGHT, 562, { size: 27, alpha: beat1 });
    F_LAW.draw(ctx, RIGHT, 620, { size: 27, alpha: fade(tt, LAW_AT, LAW_AT + 1, COV_AT - 1, COV_AT) });
    const note1 = fade(tt, CURVES_AT + 7.5, CURVES_AT + 8.5, ONE_AT - 0.6, ONE_AT);
    wrap(ctx, 'Violet: the field’s answer, e F(εη, U), the flux of F through the ribbon per unit time. Green: the mass’s answer, m ẍ εη.', RIGHT, 680, WIDE, 29, { ...type.body, size: 20, alpha: note1 });
    const beat2 = fade(tt, ONE_AT, ONE_AT + 1, STRAIGHT_AT - 0.6, STRAIGHT_AT);
    F_ONE.draw(ctx, RIGHT, 690, { size: 26, alpha: beat2 });
    wrap(ctx, 'The force e E is minus the slope of V = −e E x: a uniform field, as in scene 6. A magnetic field has no such V (scene 10).', RIGHT, 740, WIDE, 29, { ...type.body, size: 20, alpha: beat2 });
    const beat3 = fade(tt, STRAIGHT_AT, STRAIGHT_AT + 1, COV_AT - 1, COV_AT);
    wrap(ctx, 'The straight worldline: ẍ = 0, so the mass answers nothing. δS ≠ 0: some push lowers the action.', RIGHT, 690, WIDE, 29, { ...type.body, size: 20, alpha: beat3 * (1 - seg(tt, HANDOVER_AT - 0.5, HANDOVER_AT)) });
    wrap(ctx, 'Your turn: move the push, change its size. On the physical worldline the curves stay together.', RIGHT, 690, WIDE, 29, { ...type.body, size: 20, alpha: fade(tt, HANDOVER_AT, HANDOVER_AT + 0.8, COV_AT - 1, COV_AT) });
    const beat4 = seg(tt, COV_AT, COV_AT + 1);
    F_COV.draw(ctx, RIGHT, 580, { size: 40, alpha: beat4 });
    F_COV2.draw(ctx, RIGHT, 640, { size: 25, alpha: seg(tt, ETA_AT, ETA_AT + 1) });
    wrap(ctx, 'Its level lines run along U, because F(U, U) = 0, spaced 1/(eE√(1+ẋ²)) apart: as dense as the curvature.', RIGHT, 680, WIDE, 29, { ...type.body, size: 20, alpha: fade(tt, COV_AT + 1, COV_AT + 2, ETA_AT - 0.6, ETA_AT) });
    // what a unit push crosses: computed from the covector, in the colours of the arrows
    const crossings = Math.floor(Q * E * 1 + 1e-9);
    readout(ctx, 'f♭(η) = eE η =', Q * E * 1, RIGHT, 712, { colour: C.force, digits: 2, size: 17, alpha: seg(tt, ETA_AT + 0.5, ETA_AT + 1.5) });
    text(ctx, `a unit sideways η crosses ${crossings} lines`, RIGHT + 230, 712, { font: font.mono, size: 15, color: C.varied, alpha: seg(tt, ETA_AT + 0.5, ETA_AT + 1.5) });
    readout(ctx, 'f♭(U) = e F(U, U) =', 0, RIGHT, 746, { colour: C.kinetic, digits: 2, size: 17, alpha: seg(tt, U_AT, U_AT + 1) });
    text(ctx, 'U crosses none', RIGHT + 280, 746, { font: font.mono, size: 15, color: C.kinetic, alpha: seg(tt, U_AT, U_AT + 1) });

    stamp(ctx, on, 'worldline by shooting m ẍ = eE; curves from ribbonFlux and firstVariation');
  },
});
