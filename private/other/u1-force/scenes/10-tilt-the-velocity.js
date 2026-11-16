// Scene 10: tilt the velocity. The spacetime block with the flux lines of F, a worldline whose tilt
// is the speed, the ribbon element of a sideways push and the covector's stack of planes; the
// component table F_{νμ} with the sampled entries lit; and the orbit of a charge in a uniform B,
// a real Boris simulation, with the force arrow drawn as "F with U plugged in" and the ribbon of a
// sideways nudge of the orbit.
import {
  defineScene, seg, fade, lerp, text, wrap, type, color, font, rgba, tex, line, dot, arrow, roundRect, slider, choice,
  C, header, clock, track, frame, clipped, axes, drawPath, drawStrip, drawPoint, drawCurvatureMap, drawRunner, drawVector, drawParallelogram, readout, stamp, caption, fmt,
} from '../shared.js';
import { simulation } from '../../../../src/engine/simulation.js';
import { planeField, hump, lorentz, borisStep, planeRibbonFlux, cyclotron } from '../math.js';
import { spacetimeCamera, drawBlock, drawSpacetimeAxes, drawFluxLines, drawWorldline, drawElement, drawArrow3, eventPoint } from '../space.js';

// ---- the block: a worldline moving in y, a sideways push in x ---------------------------------
const A = 1.6;
const TB = 2.4;
const B0 = 2; // |B| in the block and in the orbit (units of ħ/e)
const EX = 2; // the electric field of the E phase of beat 1
const X0 = -0.5;
const Y0 = -1.3;
const TP = 1.2; // the event of the worldline where the element sits
const Q = 1; // the charge e (the orbit's sign comes from the control)
const M = 1;

// ---- the orbit: a charge of speed V0 in the uniform B, a Boris simulation ------------------------
const V0 = 1.2;
const DT = 1 / 120;
const TRAIL = 360; // samples kept, one every other step: 6 s, about one cyclotron period
const RIBBON = 96; // trail samples of the sideways nudge
const RIBBON_EPS = 0.12;
const sign = (input) => ({ q: input.q === 'minus' ? -Q : Q, B: input.Bsign === 'down' ? -B0 : B0 });

const orbit = simulation({
  seed: 1,
  dt: DT,
  snapshotEvery: 0.5,
  uses: ['q', 'Bsign'],
  init: () => ({ x: V0 / B0, y: 0, vx: 0, vy: -V0, theta: 0, cx: 0, cy: 0, trail: new Float64Array(2 * TRAIL), head: 0, count: 0, tick: 0 }),
  step(state, input, rng, dt) {
    const { q, B } = sign(input);
    // the charge's phase carried along: ω = (e/ħ)A with A = (B/2)(−y dx + x dy), the symmetric gauge of planeField
    state.theta += (q / Q) * 0.5 * B * (-state.y * state.vx + state.x * state.vy) * dt;
    borisStep(state, { q, m: M, B, E: [0, 0] }, dt);
    // the centre of the current circle, p + (m / qB)(v_y, −v_x), followed smoothly (it jumps when q or B flips)
    const k = Math.min(1, 3 * dt);
    state.cx += (state.x + (M / (q * B)) * state.vy - state.cx) * k;
    state.cy += (state.y - (M / (q * B)) * state.vx - state.cy) * k;
    state.tick += 1;
    if (state.tick % 2 === 0) {
      state.trail[2 * state.head] = state.x;
      state.trail[2 * state.head + 1] = state.y;
      state.head = (state.head + 1) % TRAIL;
      state.count = Math.min(TRAIL, state.count + 1);
    }
  },
});

/** The trail as [x, y] points, oldest first. */
function trailPoints(state) {
  const pts = [];
  const start = (state.head - state.count + TRAIL) % TRAIL;
  for (let k = 0; k < state.count; k++) {
    const i = (start + k) % TRAIL;
    pts.push([state.trail[2 * i], state.trail[2 * i + 1]]);
  }
  return pts;
}

/** The sideways nudge of the last RIBBON trail samples: η = hump × the right normal of the velocity. */
function orbitRibbon(pts, B) {
  const n = pts.length;
  if (n < RIBBON) return null;
  const path = pts.slice(n - RIBBON);
  const Np = path.length - 1;
  const etas = path.map((_, i) => {
    const k = Math.min(Math.max(i, 1), Np - 1);
    const dx = path[k + 1][0] - path[k - 1][0];
    const dy = path[k + 1][1] - path[k - 1][1];
    const L = Math.hypot(dx, dy) || 1;
    const h = hump(i / Np, 0.5, 0.2);
    return [(dy / L) * h, (-dx / L) * h];
  });
  return { path, ...planeRibbonFlux(planeField({ B0: B }), path, etas, RIBBON_EPS, Np * 2 * DT) };
}

// ---- the stage ---------------------------------------------------------------------------------------
const CAM = { cx: 410, cy: 540, scale: 118, pitch: 0.36, focal: 14, center: [0, 1.2, 0] };
const TABLE = { x: 900, y: 206, head: 48, cell: 108, row: 46 };
const NOTE_X = 1318;
const NOTE_W = 262; // the right column ends at 1580, 20 px inside the stage
const RADIUS = cyclotron(Q, M, B0, V0).radius;
// the orbit's box: small beside the notes, then large for the return to the cold open
const SMALL = { x: 900, y: 450, s: 400, half: 1.9 };
const LARGE = { x: 920, y: 196, s: 580, half: 1.05 };

/**
 * The orbit's frame at zoom k ∈ [0, 1]. It follows the orbit's (smoothed) centre c only as far as
 * needed to keep the circle and its dial inside (a flip of q or B moves the centre).
 */
function orbitFrame(k, c) {
  const x = lerp(SMALL.x, LARGE.x, k);
  const y = lerp(SMALL.y, LARGE.y, k);
  const s = lerp(SMALL.s, LARGE.s, k);
  const half = lerp(SMALL.half, LARGE.half, k);
  const room = Math.max(0, half - RADIUS - 0.85); // 0.85: the dial rides up to ~0.75 outside the circle
  const off = c.map((v) => v - Math.max(-room, Math.min(room, v)));
  return frame({ x, y, w: s, h: s, u: [off[0] - half, off[0] + half], v: [off[1] - half, off[1] + half] });
}

/** The uniform field B, painted quietly: a soft glow (violet for B up, teal for B down) in a hairline box. */
function drawGlow(ctx, F, B, alpha) {
  if (alpha <= 0.003) return;
  const hue = B >= 0 ? C.curvature : C.curvatureNeg;
  const cx = F.x + F.w / 2;
  const cy = F.y + F.h / 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 0.72 * F.w);
  glow.addColorStop(0, rgba(hue, 0.26));
  glow.addColorStop(0.55, rgba(hue, 0.14));
  glow.addColorStop(1, rgba(hue, 0.03));
  ctx.fillStyle = glow;
  ctx.fillRect(F.x, F.y, F.w, F.h);
  ctx.strokeStyle = rgba(hue, 0.35);
  ctx.lineWidth = 1;
  ctx.strokeRect(F.x, F.y, F.w, F.h);
  ctx.restore();
}

/** The trail of the last ~0.9 lap, fading to nothing at its tail. */
function drawTrail(ctx, F, pts, alpha) {
  const lap = Math.round((0.9 * cyclotron(Q, M, B0, V0).period) / (2 * DT));
  const trail = pts.slice(Math.max(0, pts.length - lap));
  const pieces = 24;
  for (let p = 0; p < pieces; p++) {
    const i0 = Math.floor((trail.length - 1) * (p / pieces));
    const i1 = Math.floor((trail.length - 1) * ((p + 1) / pieces));
    if (i1 - i0 < 1) continue;
    const w = Math.pow((p + 1) / pieces, 1.6);
    drawPath(ctx, F, trail.slice(i0, i1 + 1), { colour: C.path, width: 1.2 + 2.4 * w, alpha: alpha * w });
  }
}

const ENTRIES = [
  // F_{νμ}: row ν (the push η), column μ (the velocity U); F_{ti} = −E_i, F_{ij} = ε_{ijk} B_k
  [tex('0'), tex(String.raw`-E_x`, '−Eₓ'), tex(String.raw`-E_y`, '−E_y')],
  [tex(String.raw`+E_x`, '+Eₓ'), tex('0'), tex('B')],
  [tex(String.raw`+E_y`, '+E_y'), tex('-B', '−B'), tex('0')],
];
const INDEX = ['t', 'x', 'y'];
const F_TABLE = tex(String.raw`F_{\nu\mu}\,:\ \ F(\eta, U) = F_{\nu\mu}\,\eta^{\nu} U^{\mu}`, 'F_νμ:  F(η, U) = F_νμ η^ν U^μ');
const F_SAMPLE = tex(String.raw`F(\hat x, U) = E_x + \dot y\,B`, 'F(x̂, U) = Eₓ + ẏ B');
const F_ORBIT = tex(String.raw`F = B\,dx\wedge dy`, 'F = B dx∧dy');
const F_FORCE = tex(String.raw`f^{\flat} = e\,F(\cdot, U)`, 'f♭ = eF(·, U)');
const F_FORCE2 = tex(String.raw`= e\,B\,(\dot y\,dx - \dot x\,dy)`, '= eB (ẏ dx − ẋ dy)');
const F_LAW = tex(String.raw`m\,\ddot x^{\flat} = e\,F(\cdot, U)`, 'm ẍ♭ = e F(·, U)');

// the moments of the scene
const LINES_AT = 1;
const WORLD_AT = 3;
const ELEMENT_AT = 6;
const TABLE_AT = 10;
const TILT_AT = 15;
const E_AT = 25; // the E phase of beat 1: E_x on, B off
const B_BACK_AT = 33;
const ORBIT_AT = 35;
const RIBBON_AT = 48;
const FLIP_Q_AT = 62.5;
const FLIP_B_AT = FLIP_Q_AT + cyclotron(Q, M, B0, V0).period; // one lap later the orbit is back on its circle
const HANDOVER_AT = 71;
const SAME_AT = 78;
const COLD_AT = 83; // the orbit grows back into the cold open's picture
const SHOWN_BY = 50; // by then everything the levers change is on screen

/** The field of the block at time t: B fades out and E_x in during the E phase, and back. */
const blockField = (t) => {
  const e = fade(t, E_AT, E_AT + 2, B_BACK_AT, B_BACK_AT + 1.5);
  return { B: B0 * (1 - e), E: [EX * e, 0], e };
};

/** The component table, drawn by hand: a 3 × 3 grid with the sampled entries lit. */
function drawTable(ctx, { alpha, field, speed, lit }) {
  if (alpha <= 0.003) return;
  const { x, y, head, cell, row } = TABLE;
  const w = head + 3 * cell;
  const h = row + 3 * row;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(17,24,40,0.7)';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  for (let k = 1; k < 4; k++) line(ctx, x + head + (k - 1) * cell, y + 8, x + head + (k - 1) * cell, y + h - 8, { color: color.line, width: 1 });
  for (let k = 1; k < 4; k++) line(ctx, x + 8, y + k * row, x + w - 8, y + k * row, { color: color.line, width: 1 });
  ctx.restore();
  // the index labels: rows ν = η, columns μ = U
  text(ctx, 'η ╲ U', x + head / 2, y + row / 2 + 5, { font: font.mono, size: 13, color: color.dim, align: 'center', alpha });
  INDEX.forEach((name, j) => text(ctx, name, x + head + (j + 0.5) * cell, y + row / 2 + 7, { font: font.display, italic: true, size: 22, color: color.muted, align: 'center', alpha }));
  INDEX.forEach((name, i) => text(ctx, name, x + head / 2, y + (i + 1.5) * row + 7, { font: font.display, italic: true, size: 22, color: color.muted, align: 'center', alpha }));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cx = x + head + (j + 0.5) * cell;
      const cy = y + (i + 1.5) * row;
      // dim the entries whose field is off: E entries when E = 0, B entries when B = 0
      const isE = (i === 0 && j > 0) || (j === 0 && i > 0);
      const isB = i > 0 && j > 0 && i !== j;
      const present = isE ? Math.abs(field.E[0]) > 1e-3 : isB ? Math.abs(field.B) > 1e-3 : false;
      const on = lit.some(([a, b]) => a === i && b === j);
      if (on) {
        ctx.save();
        ctx.globalAlpha *= alpha * (present ? 1 : 0.4);
        ctx.fillStyle = rgba(C.curvature, 0.22);
        roundRect(ctx, cx - cell / 2 + 4, cy - row / 2 + 3, cell - 8, row - 6, 6);
        ctx.fill();
        ctx.strokeStyle = rgba(C.curvature, 0.9);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }
      ENTRIES[i][j].draw(ctx, cx, cy, { size: 22, align: 'center', alpha: alpha * (i === j ? 0.35 : present ? 1 : 0.3) });
    }
  }
}

export default defineScene({
  name: 'Tilt the velocity',
  duration: 95,
  header: header(10, 'ELECTRIC AND MAGNETIC', 'The velocity chooses the plane'),
  narration: [
    [0, 'A magnetic field alone: the flux lines of F run along time. A particle at rest moves along them; the ribbon of a sideways push contains them and catches nothing. No flux, no force: the ribbon is the force’s detector.'],
    [TILT_AT + 0.5, 'Tilt the velocity: the ribbon now cuts across the lines, and its flux grows with the speed. The table lights F x y.'],
    [E_AT, 'An electric field runs across the block: even at rest the ribbon catches it, F x t. One two-form; the velocity picks the entries.'],
    [ORBIT_AT, 'The orbit, on the painted plane of scene four. F is B d x wedge d y; with the velocity plugged in, the force is perpendicular to it. No work: a circle.'],
    [RIBBON_AT, 'A sideways nudge of the orbit encloses a strip of the plane; both readouts give its flux. The curvature, with the push in one slot and the velocity in the other: the force.'],
    [FLIP_Q_AT, 'Flip the charge: the orbit reverses, the arrow with it. Flip the field as well, a lap later: it reverses back.'],
    [HANDOVER_AT, 'Your turn: flip the charge or the field. The orbit reverses, and the arrow stays perpendicular.'],
    [SAME_AT, 'A magnetic force is the same curvature, read by a moving particle.'],
    [COLD_AT, 'Remember the cold open: no rope pulls the charge around. There is a circle over every point of space, stitched together with a twist, and the particle feels the stitching.'],
  ],
  beats: [
    [TILT_AT, 'Tilt the velocity'],
    [E_AT, 'An electric field'],
    [ORBIT_AT, 'The orbit'],
    [RIBBON_AT, 'The ribbon on the plane'],
    [HANDOVER_AT, 'Your turn'],
    [SAME_AT, 'The same curvature'],
    [COLD_AT, 'The cold open, again'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: flip the charge or the field; the orbit reverses, the arrow stays perpendicular.' }],
  exploreFrom: 1.5,
  controls: {
    speed: slider('Speed', { min: 0, max: 1.2, step: 0.01, value: [[0, 0], [TILT_AT, 0], [TILT_AT + 6, 0.9], [E_AT + 1.5, 0.9], [E_AT + 3.5, 0], [B_BACK_AT, 0], [B_BACK_AT + 2.5, 0.9]], lens: true }),
    q: choice('Charge', { plus: '+e', minus: '−e' }, { value: [[0, 'plus'], [FLIP_Q_AT, 'minus'], [SAME_AT, 'plus']] }),
    Bsign: choice('B', { up: 'B up', down: 'B down' }, { value: [[0, 'up'], [FLIP_B_AT, 'down'], [SAME_AT, 'up']] }),
  },
  sim: orbit,

  draw(ctx, t, live) {
    const tt = clock(t, live, SHOWN_BY);
    const { speed } = live.input;
    const { q, B } = sign(live.input);
    const state = live.state;
    const on = seg(tt, 0.2, 1.2);

    // ---- left: the spacetime block ----
    const cam = spacetimeCamera({ ...CAM, yaw: 0.55 + 0.3 * Math.sin(0.16 * tt) });
    const blk = blockField(tt);
    drawBlock(ctx, cam, { a: A, T: TB, alpha: on });
    drawSpacetimeAxes(ctx, cam, { a: A, T: TB, alpha: on });
    const linesOn = seg(tt, LINES_AT, LINES_AT + 2);
    // the flux lines of each field, cross-faded during the E phase (seeds depend on the direction)
    drawFluxLines(ctx, cam, { B: B0, E: [0, 0] }, { a: A, T: TB, alpha: linesOn * (1 - blk.e) });
    drawFluxLines(ctx, cam, { B: 0, E: [EX, 0] }, { a: A, T: TB, alpha: linesOn * blk.e });
    // the worldline: moving in y at `speed`, pushed sideways in x
    const worldOn = seg(tt, WORLD_AT, WORLD_AT + 2.5);
    const events = Array.from({ length: 41 }, (_, i) => {
      const tau = (TB * i) / 40;
      return [tau, X0, Y0 + speed * tau];
    });
    drawWorldline(ctx, cam, events, { colour: C.path, width: 3, alpha: on, progress: worldOn });
    const P = [TP, X0, Y0 + speed * TP];
    const elementOn = seg(tt, ELEMENT_AT, ELEMENT_AT + 1.5);
    const fluxAt = blk.E[0] + speed * blk.B; // F(x̂, U) = E_x + ẏ B
    const etaV = [0, 0.45, 0];
    const uV = [0.45, 0, 0.45 * speed];
    drawElement(ctx, cam, P, etaV, uV, { fill: rgba(fluxAt >= 0 ? C.curvature : C.curvatureNeg, 0.12 + 0.5 * Math.min(1, Math.abs(fluxAt))), stroke: rgba(C.curvature, 0.9), alpha: elementOn });
    // the covector's planes: lines parallel to U, spaced 1/(e F(x̂, U)) in x
    const spacing = Math.abs(Q * fluxAt) > 1e-6 ? 1 / Math.abs(Q * fluxAt) : Infinity;
    const uLen = Math.hypot(1, speed);
    for (let k = -6; k <= 6; k++) {
      if (k === 0 || Math.abs(k * spacing) > 1.4 || Math.abs(P[1] + k * spacing) > A) continue;
      const c = [P[0], P[1] + k * spacing, P[2]];
      const d = [0.55 / uLen, 0, (0.55 * speed) / uLen];
      drawWorldline(ctx, cam, [[c[0] - d[0], c[1], c[2] - d[2]], [c[0] + d[0], c[1], c[2] + d[2]]], { colour: C.force, width: 1.6, alpha: 0.85 * elementOn });
    }
    drawArrow3(ctx, cam, P, etaV, { colour: C.varied, alpha: elementOn, label: 'η' });
    drawArrow3(ctx, cam, P, uV, { colour: C.kinetic, alpha: elementOn });
    const pP = cam.project(eventPoint(...P));
    // U's label beside its tip, on the side away from η (the worldline runs through the tip)
    const pU = cam.project(eventPoint(P[0] + uV[0], P[1] + uV[1], P[2] + uV[2]));
    const pE = cam.project(eventPoint(P[0] + etaV[0], P[1] + etaV[1], P[2] + etaV[2]));
    const uL = Math.hypot(pU.x - pP.x, pU.y - pP.y) || 1;
    let [nx, ny] = [-(pU.y - pP.y) / uL, (pU.x - pP.x) / uL];
    if (nx * (pE.x - pP.x) + ny * (pE.y - pP.y) > 0) [nx, ny] = [-nx, -ny];
    text(ctx, 'U', pU.x + nx * 20, pU.y + ny * 20 + 8, { font: font.display, italic: true, size: 22, color: C.kinetic, align: 'center', alpha: elementOn });
    dot(ctx, pP.x, pP.y, 5, C.path, elementOn);
    readout(ctx, 'F(η, U) = E_x + ẏ B =', fluxAt, 80, 848, { colour: C.curvature, digits: 2, size: 16, alpha: elementOn });
    text(ctx, `ẏ = ${fmt(speed, 2)}   B = ${fmt(blk.B, 2)}   E_x = ${fmt(blk.E[0], 2)}`, 80, 872, { font: font.mono, size: 14, color: color.muted, alpha: elementOn });
    text(ctx, blk.e > 0.5 ? 'F = E_x dx∧dt: the lines run across the block' : 'F = B dx∧dy: the flux lines run along t', 80, 180, { ...type.note, color: color.body, alpha: linesOn });

    // ---- right-top: the component table (it steps aside for the return to the cold open) ----
    const away = 1 - seg(tt, COLD_AT - 1, COLD_AT);
    const tableOn = seg(tt, TABLE_AT, TABLE_AT + 1.2) * away;
    const lit = [];
    if (tt >= TABLE_AT + 1.5) lit.push([1, 0]); // F_xt: η = x̂, U has a t component always
    if (speed > 0.02) lit.push([1, 2]); // F_xy: moving in y
    drawTable(ctx, { alpha: tableOn, field: blk, speed, lit });
    F_TABLE.draw(ctx, TABLE.x, TABLE.y - 24, { size: 20, alpha: tableOn });
    wrap(ctx, 'Row: the push η. Column: the velocity U. Lit: the entries this particle reads.', NOTE_X, TABLE.y + 14, NOTE_W, 22, { ...type.note, size: 14, color: color.body, alpha: tableOn * (1 - seg(tt, ORBIT_AT, ORBIT_AT + 1.5)) });
    F_SAMPLE.draw(ctx, NOTE_X, TABLE.y + 128, { size: 20, alpha: seg(tt, TABLE_AT + 1.5, TABLE_AT + 2.5) * away });

    // ---- right-bottom: the orbit in the (x, y) plane, large again at the end ----
    const orbitOn = seg(tt, ORBIT_AT, ORBIT_AT + 1.5);
    if (orbitOn > 0.003 && state) {
      const zoom = seg(tt, COLD_AT, COLD_AT + 2.5);
      const O = orbitFrame(zoom, [state.cx, state.cy]);
      const pts = trailPoints(state);
      const ribbonOn = seg(tt, RIBBON_AT, RIBBON_AT + 1.5) * (1 - seg(tt, COLD_AT, COLD_AT + 1.5));
      const rib = ribbonOn > 0.003 ? orbitRibbon(pts, B) : null;
      const [fx, fy] = lorentz(q, B, [0, 0], state.vx, state.vy);
      const vL = Math.hypot(state.vx, state.vy) || 1;
      const etaR = [state.vy / vL, -state.vx / vL]; // the right normal of the velocity: a unit sideways push
      text(ctx, `the orbit in the plane: B = ${fmt(Math.abs(B), 0)} ${B > 0 ? 'up' : 'down'}, charge ${q > 0 ? '+e' : '−e'}`, O.x, O.y - 18, { ...type.note, color: color.body, alpha: orbitOn });
      drawGlow(ctx, O, B, orbitOn);
      const forceOn = seg(tt, ORBIT_AT + 3, ORBIT_AT + 4.5);
      clipped(ctx, O, () => {
        // the ribbon of a sideways nudge of the recent orbit
        if (rib) drawStrip(ctx, O, rib.nudged, rib.path, { fill: rgba(rib.flux >= 0 ? C.curvature : C.curvatureNeg, 0.7), stroke: rgba(C.varied, 0.9), alpha: ribbonOn, width: 1.5 });
        drawTrail(ctx, O, pts, orbitOn);
        // the force arrow as F with U plugged in: the element spanned by U and a unit sideways η
        const p = [state.x, state.y];
        // arrows grow a little with the zoom, less than the orbit does
        const px = SMALL.s / (2 * SMALL.half) * (1 + 0.45 * zoom); // stage px per unit of arrow
        const uS = [state.vx / vL, -state.vy / vL]; // U's direction on the stage (y down)
        const fL0 = Math.hypot(fx, fy) || 1;
        const fS = [fx / fL0, -fy / fL0];
        drawParallelogram(ctx, O, p, [etaR[0] * 0.4, etaR[1] * 0.4], [state.vx * 0.5, state.vy * 0.5], { fill: rgba(B >= 0 ? C.curvature : C.curvatureNeg, 0.45), stroke: C.curvature, alpha: forceOn, scale: px / O.kx });
        drawVector(ctx, O, p, [state.vx, state.vy], { colour: C.kinetic, scale: 0.5 * px, width: 3, label: 'U', head: 11, alpha: orbitOn, labelOffset: [uS[0] * 16 - 6, uS[1] * 16 + 7] });
        // η and f are parallel here (the force is the flux per sideways push): η's label sits on the side away from U, f's beyond its tip
        // (when η points out of the circle, against f, its label goes beyond its tip, clear of the dial)
        const etaS = [etaR[0], -etaR[1]];
        const etaOut = etaS[0] * fS[0] + etaS[1] * fS[1] < 0;
        const etaLabel = etaOut ? [etaS[0] * 16 - 5, etaS[1] * 16 + 7] : [-uS[0] * 20 - 6, -uS[1] * 20 + 7];
        drawVector(ctx, O, p, etaR, { colour: C.varied, scale: 0.4 * px, width: 2.5, label: 'η', head: 10, alpha: forceOn, labelOffset: etaLabel });
        drawVector(ctx, O, p, [fx, fy], { colour: C.force, scale: 0.25 * px, width: 3.5, label: 'f', head: 12, alpha: forceOn, labelOffset: [fS[0] * 16 - 5, fS[1] * 16 + 7] });
        // the dial rides outside the circle and behind the charge: clear of U, of η and f (which lie along the
        // radius, inwards or outwards depending on the signs) and of the ribbon
        const out = [-fS[0] - uS[0], -fS[1] - uS[1]];
        const oL = Math.hypot(...out) || 1;
        const reach = lerp(62, 88, zoom);
        drawRunner(ctx, O, p, { colour: C.path, r: 7, dial: state.theta, dialOffset: [(out[0] / oL) * reach, (out[1] / oL) * reach], dialR: lerp(22, 34, zoom), alpha: orbitOn });
      }, 2);
      text(ctx, 'dial: the charge’s phase θ = ∫ω(U) dt', O.x + 12, O.y + O.h - 14, { font: font.mono, size: 14, color: C.fibre, alpha: orbitOn * (1 - zoom) }); // the large dial at the end speaks for itself
      // beside the orbit: the 2-form, the force covector, then the ribbon's flux two ways
      const side = seg(tt, ORBIT_AT + 3, ORBIT_AT + 4) * away;
      F_ORBIT.draw(ctx, NOTE_X, O.y + 22, { size: 20, alpha: side });
      F_FORCE.draw(ctx, NOTE_X, O.y + 64, { size: 20, alpha: side });
      F_FORCE2.draw(ctx, NOTE_X + 18, O.y + 98, { size: 20, alpha: side });
      const ribbonText = seg(tt, RIBBON_AT + 1, RIBBON_AT + 2) * away;
      wrap(ctx, 'The ribbon of a sideways nudge εη of the orbit. Its flux, two ways:', NOTE_X, O.y + 232, NOTE_W, 22, { ...type.note, size: 14, color: color.body, alpha: ribbonText });
      if (rib) {
        readout(ctx, '∬Ω over the strip   =', rib.flux, NOTE_X, O.y + 296, { colour: C.curvature, digits: 3, size: 15, alpha: ribbonText });
        readout(ctx, 'ε∫B(η_x ẏ−η_y ẋ)dt =', rib.alongPath, NOTE_X, O.y + 322, { colour: C.curvature, digits: 3, size: 15, alpha: ribbonText });
        text(ctx, `ε = ${fmt(RIBBON_EPS, 2)}: differ by ${fmt(rib.alongPath - rib.flux, 3)}`, NOTE_X, O.y + 348, { font: font.mono, size: 14, color: C.varied, alpha: ribbonText });
        text(ctx, 'the gap is second order in ε', NOTE_X, O.y + 370, { ...type.note, size: 14, color: color.body, alpha: ribbonText });
      }
      F_LAW.draw(ctx, LARGE.x + LARGE.s / 2, LARGE.y + LARGE.s + 52, { size: 30, align: 'center', alpha: seg(tt, COLD_AT + 2, COLD_AT + 3) });
    }

    stamp(ctx, on, 'orbit: Boris steps of m v̇ = q v × B; flux lines and ribbon flux computed from F');
  },
});
