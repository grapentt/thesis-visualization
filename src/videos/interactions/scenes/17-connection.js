// Scene 17: what "straight up" means. Two body frames read the same bend differently; the noise
// metric picks the connection (zero momentum and angular momentum per molecule); a shape loop turns
// water by its holonomy (5.9° for equal noise, 11.9° mass-scaled). Scores never need it; samplers
// that step in bundle coordinates do.

import { defineScene, seg, fade, text, type, font, color, tex, camera, arrow3, splitLines, roundRect, rgba, polyline3, rotation } from '../../../kit.js';
import { VERTICAL, HORIZONTAL, POSE, SCORE_W, SCORE_P, WATER_MOL, PEROXIDE_MOL, mixHex, drawMol, drawHalo, scoreArrow, tagCard, readout, toyStamp } from '../shared.js';
import { drawMaster, diagramCamera, diagPoint, project, toA, toB, toF, drawTiles, holonomyTiles, MAPPING_17, FLOOR_CAPTION } from '../diagram.js';
import { holonomy } from '../data.js';
import { buildWater, centroid, bisector, WATER, DEG } from '../toy.js';

const { opening: OPENING, unit: UNIT, mass: MASS, submersion: SUBMERSION, kabsch: KABSCH, torque: TORQUE } = holonomy;
const RIGHT = 860, WIDTH = 660;
const NOTE = { ...type.body, size: 20 };
const DIAGRAM = diagramCamera();
const TILT_GAIN = 2; // the computed tilts are a few px at this scale: drawn ×2, stated on screen
const TILES = holonomyTiles(holonomy.tiles).map((x) => ({ ...x, tiltA: TILT_GAIN * x.tiltA, tiltB: TILT_GAIN * x.tiltB }));
const STEEPEST = Math.max(...holonomy.tiles.map(({ duDDelta }) => Math.abs(duDDelta))); // du/dδ per Å (du/dθ ≈ 0 here)
const HORIZONTAL_EQ = tex(String.raw`\sum_i m_i\,\dot x_i = 0,\qquad \sum_i m_i\,(x_i - c)\times\dot x_i = 0`, 'Σᵢ mᵢ ẋᵢ = 0,   Σᵢ mᵢ (xᵢ − c) × ẋᵢ = 0');

// beats (scene-local seconds), keyed to the cue starts 0, 10, 23.5, 33, 45, 59, 68, 82
const FRAMES = 10, FLOOR = 23.5, FLAT = 33, LOOP = 45, MASSES = 59, SCORES = 68, SAMPLERS = 82;
const RUN_UNIT = [46.5, 54.5], RUN_MASS = [60, 65.5];
const MASS_TINT = mixHex(HORIZONTAL, '#ffffff', 0.5); // the mass-scaled lift, dashed

// ---- water's bend (opening): centroid fixed, no turn in the lab ---------------------------------

const THETA0 = WATER.theta0 / DEG;
const bend = (t) => seg(t, 2, 5) - seg(t, 6.5, 9.5) + seg(t, 12, 15.5) - seg(t, 19, 22.5);
const thetaAt = (t) => THETA0 + (125 - THETA0) * bend(t);
/** opening's readouts (degrees), interpolated in θ. */
const readingAt = (theta, key) => {
  const x = ((theta - THETA0) / (125 - THETA0)) * (OPENING.theta.length - 1);
  const i = Math.min(OPENING.theta.length - 2, Math.max(0, Math.floor(x))), f = x - i;
  return OPENING[key][i] + (OPENING[key][i + 1] - OPENING[key][i]) * f;
};

// ---- the loop's lifts: interpolated samples, turn angle of R(s) about water's normal -------------

const turnOf = (R) => Math.atan2(R[1][0], R[0][0]) / DEG;
const liftAt = (lift, s) => {
  const x = s * (lift.samples.length - 1);
  const i = Math.min(lift.samples.length - 2, Math.floor(x)), f = x - i;
  const p = lift.samples[i], q = lift.samples[i + 1];
  const XA = p.XA.map((v, k) => v + (q.XA[k] - v) * f);
  const R = rotation.partialRotation(rotation.multiply(q.R, rotation.transpose(p.R)), f);
  return { XA, R: rotation.multiply(R, p.R), turn: turnOf(p.R) + (turnOf(q.R) - turnOf(p.R)) * f, u: p.u + (q.u - p.u) * f };
};
const boxPath = (lift, f0 = null) => lift.samples.map((s) => [toA(s.theta, MAPPING_17), toB(s.delta, MAPPING_17), f0 ?? toF(s.u)]);
const PATH_UNIT = boxPath(UNIT), PATH_MASS = boxPath(MASS), FLOOR_LOOP = boxPath(UNIT, 0);
const [A0, B0] = FLOOR_LOOP[0];
const upTo = (path, s) => path.slice(0, Math.max(2, Math.round(s * (path.length - 1)) + 1));

// ---- the lab view and the inset ------------------------------------------------------------------

const LAB = { cx: 1180, cy: 470, scale: 75, yaw: 0.15, pitch: -0.2, focal: 14 };
const midpoint = (XA, XB) => centroid(XA).map((v, k) => (v + centroid(XB, 4)[k]) / 2);
const labCamera = (XA0, XB) => camera({ ...LAB, center: midpoint(XA0, XB) });
const LAB_OPEN = labCamera(buildWater(), OPENING.XB);
const LAB_UNIT = labCamera(UNIT.samples[0].XA, UNIT.XB), LAB_MASS = labCamera(MASS.samples[0].XA, MASS.XB);
const INSET = { cx: 1320, cy: 700, r: 90 };

// ---- the torsion step (82–99) ----------------------------------------------------------------------

const STEP = KABSCH[0];
const EVIDENCE = { x: RIGHT, y: 240, w: WIDTH, h: 380 };
const pct = (v) => `${(100 * v).toFixed(1)} %`;

export default defineScene({
  name: 'Connection',
  duration: 99,
  narration: [
    [0, 'One last geometric subtlety. Let water bend while peroxide stays still in the lab. Where is peroxide, as water sees it?'],
    [10, "Read it in a frame on water's bisector, or on its first bond, and you get two different answers for the same motion. Which is right? The noise decides."],
    [23.5, "For this scene, the floor shows two of water's own shape numbers: its angle, and the difference of its bonds."],
    [33, 'With equal noise on every atom, a motion is horizontal when each molecule moves with no net momentum and no net angular momentum of its own.'],
    [45, 'Let water run a loop of shapes that way, with peroxide at rest. Water returns to its shape, but turned, by about six degrees. Seen from water, peroxide has moved.'],
    [59, 'Some models scale the noise by mass. Then the same loop turns water by about twelve degrees: another connection.'],
    [68, 'The good news: the scores never need it. A score is the gradient of a function that ignores the gauge, so it never needs to know which way is up.'],
    [82, "It matters only for samplers that step in bundle coordinates, like docking samplers, for splitting a force into pose and deformation, or for shape-only noise. Then use the noise's own connection everywhere."],
  ],
  header: { eyebrow: '17 · CONNECTION', title: 'What does ‘straight up’ mean?' },

  draw(ctx, t) {
    drawDiagram(ctx, t);
    drawLab(ctx, t);
    drawInset(ctx, t);
    drawNotes(ctx, t);
    drawScoresCard(ctx, t);
    drawEvidence(ctx, t);
  },
});

// ---- left: the master diagram, re-formed for this scene -------------------------------------------

function drawDiagram(ctx, t) {
  const on = fade(t, 0.5, 2);
  const morph = seg(t, FLOOR + 0.5, FLOOR + 3.5); // old labels fade out, then the new ones fade in
  const later = 1 - 0.35 * seg(t, SCORES, SCORES + 1); // lifts step back behind the cards
  const unitRun = seg(t, ...RUN_UNIT), massRun = seg(t, ...RUN_MASS);
  const loopOn = fade(t, LOOP, LOOP + 1);
  const tiles = fade(t, FLAT + 1, FLAT + 2.5, LOOP, LOOP + 1);
  const paths = [];
  if (t > LOOP) {
    paths.push({ points: FLOOR_LOOP, colour: color.ink, alpha: 0.85 * loopOn * later, width: 2.5 });
    if (unitRun > 0) paths.push({ points: upTo(PATH_UNIT, unitRun), colour: HORIZONTAL, alpha: later, width: 3.5 });
    if (massRun > 0) paths.push({ points: upTo(PATH_MASS, massRun), colour: MASS_TINT, alpha: later, width: 3, dashed: true });
  }
  const running = t < RUN_MASS[0] - 0.5 ? { path: PATH_UNIT, s: unitRun, alpha: fade(t, RUN_UNIT[0] - 0.5, RUN_UNIT[0], 55.2, 56) }
    : { path: PATH_MASS, s: massRun, alpha: fade(t, RUN_MASS[0] - 0.5, RUN_MASS[0], RUN_MASS[1] + 0.2, RUN_MASS[1] + 1) };
  const point = running.path[Math.round(running.s * (running.path.length - 1))];

  drawMaster(ctx, {
    floor: { alpha: on, mapping: MAPPING_17, morph, caption: [[FLOOR_CAPTION, Math.max(0, 1 - 2 * morph)], ["floor: water's own shape (θ, δ); peroxide held at rest", Math.max(0, 2 * morph - 1)]] },
    fibres: { alpha: on * (1 - 0.4 * Math.max(loopOn, tiles)), caption: true },
    paths,
    cursor: running.alpha > 0.003 ? { a: point[0], b: point[1], f: point[2], alpha: running.alpha } : null,
    camera: DIAGRAM,
  });

  // horizontal tiles at u = 0 (computed tilts)
  drawTiles(ctx, DIAGRAM, TILES, { alpha: tiles });

  // the loop's fibre, its start and the two gaps Δu
  const fibre = loopOn * later;
  if (fibre > 0.003) {
    polyline3(ctx, DIAGRAM, [diagPoint(A0, B0, 0), diagPoint(A0, B0, 1)], { color: POSE, width: 3, alpha: fibre });
    startDot(ctx, project(DIAGRAM, A0, B0, toF(0)), fibre);
  }
  gap(ctx, PATH_UNIT, UNIT.du, 'equal noise', 0, HORIZONTAL, fade(t, 56, 56.8) * later);
  gap(ctx, PATH_MASS, MASS.du, 'mass-scaled noise', 1, MASS_TINT, fade(t, RUN_MASS[1], RUN_MASS[1] + 0.8) * later);
}

function startDot(ctx, p, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.ink;
  ctx.strokeStyle = '#05080f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

/** Gold bracket left of the loop's fibre, from the start (u = 0) to where a lift ends; labels stacked above-left. */
function gap(ctx, path, du, label, row, tint, alpha) {
  if (alpha <= 0.003) return;
  const p = project(DIAGRAM, A0, B0, toF(0)), q = project(DIAGRAM, ...path.at(-1));
  const x = p.x - 12 - 12 * row;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - 4, p.y);
  ctx.lineTo(x, p.y);
  ctx.lineTo(x, q.y);
  ctx.lineTo(q.x - 4, q.y);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.arc(q.x, q.y, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  const lx = p.x - 50, ly = p.y - 92 + 44 * row;
  ctx.save();
  ctx.globalAlpha *= 0.6 * alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(lx + 6, ly + 14);
  ctx.lineTo(x - 1, (p.y + q.y) / 2);
  ctx.stroke();
  ctx.restore();
  text(ctx, `Δu = ${du.toFixed(3).replace('-', '−')}`, lx, ly, { font: font.mono, size: 16, color: VERTICAL, align: 'right', alpha });
  text(ctx, label, lx, ly + 19, { ...type.note, color: tint, align: 'right', alpha });
}

// ---- right: water and peroxide in the lab -----------------------------------------------------------

/** Which configuration the lab shows at t: the bend, rest, the unit-mass loop, the mass-scaled loop. */
function labState(t) {
  if (t < LOOP + 1) return { XA: buildWater(WATER.r0, WATER.r0, thetaAt(t) * DEG), XB: OPENING.XB, cam: LAB_OPEN, R: rotation.IDENTITY, turn: 0 };
  const unit = t < MASSES + 0.2;
  const lift = unit ? UNIT : MASS;
  const s = unit ? seg(t, ...RUN_UNIT) : seg(t, ...RUN_MASS);
  return { ...liftAt(lift, s), XB: lift.XB, cam: unit ? LAB_UNIT : LAB_MASS, lift };
}

function drawLab(ctx, t) {
  const alpha = fade(t, 0.5, 1.5, 66, 67) * (1 - 0.55 * fade(t, FLOOR, FLOOR + 1, LOOP - 0.5, LOOP + 0.5)) * (1 - fade(t, 58.6, 59.2, 59.4, 60));
  if (alpha <= 0.003) return;
  const { XA, XB, cam, R } = labState(t);
  const cA = centroid(XA), cB = centroid(XB, 4);
  drawHalo(ctx, cam, XA, 3, SCORE_W, { alpha });
  drawHalo(ctx, cam, XB, 4, SCORE_P, { alpha });
  // the direction being read: water's centroid → peroxide's
  const a = cam.project(cA), b = cam.project(cB);
  ctx.save();
  ctx.globalAlpha *= alpha * fade(t, FRAMES, FRAMES + 1, FLOOR, FLOOR + 1);
  ctx.strokeStyle = POSE;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
  drawMol(ctx, XA, cam, WATER_MOL, { opacity: alpha });
  drawMol(ctx, XB, cam, PEROXIDE_MOL, { opacity: alpha });
  text(ctx, 'in the lab: peroxide still', LAB.cx, 584, { ...type.note, align: 'center', alpha });
  bodyFrames(ctx, cam, XA, alpha * fade(t, FRAMES + 0.5, FRAMES + 1.5, FLOOR, FLOOR + 1));
  turnMark(ctx, cam, cA, R, alpha * fade(t, RUN_UNIT[0] - 0.5, RUN_UNIT[0]));
}

/** The bisector frame (soft blue) and the bond frame on O–H₁ (muted): e₁, e₂ in water's plane, drawn at its centroid. */
function bodyFrames(ctx, cam, XA, alpha) {
  if (alpha <= 0.003) return;
  const at = (i) => [XA[3 * i], XA[3 * i + 1], XA[3 * i + 2]];
  const O = at(0), c = centroid(XA), unit = (v) => { const n = Math.hypot(...v); return v.map((x) => x / n); };
  const sub = (p, q) => p.map((v, k) => v - q[k]);
  const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  const h1 = sub(at(1), O), h2 = sub(at(2), O);
  const e3 = unit(cross(h1, h2));
  const frames = [
    { e1: bisector(XA), colour: HORIZONTAL, label: 'bisector' },
    { e1: unit(h1), colour: color.muted, label: 'bond' },
  ];
  for (const { e1, colour, label } of frames) {
    const e2 = cross(e3, e1);
    for (const e of [e1, e2]) arrow3(ctx, cam, c, e.map((v) => 0.9 * v), { color: '#05080f', width: 5, head: 12, alpha });
    for (const [e, width] of [[e1, 3], [e2, 2.2]]) arrow3(ctx, cam, c, e.map((v) => 0.9 * v), { color: colour, width, head: 10, alpha });
    const tip = cam.project(c.map((v, k) => v + 1.02 * e1[k]));
    const bond = label === 'bond';
    text(ctx, `${label} e₁`, tip.x + (bond ? 8 : 0), tip.y - (bond ? 2 : 8), { ...type.note, color: colour, align: bond ? 'left' : 'center', alpha });
  }
}

/** Gold line along water's lab body axis R(s)·ŷ, with a faint copy of where it started. */
function turnMark(ctx, cam, c, R, alpha) {
  if (alpha <= 0.003) return;
  const tip = (M) => cam.project(c.map((v, k) => v + 1.0 * rotation.apply(M, [0, 1, 0])[k]));
  const o = cam.project(c), from = tip(rotation.IDENTITY), now = tip(R);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = 2;
  ctx.strokeStyle = VERTICAL;
  ctx.setLineDash([4, 4]);
  ctx.globalAlpha *= 0.55;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(from.x, from.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha /= 0.55;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(now.x, now.y);
  ctx.stroke();
  ctx.restore();
}

/** Inset: the same motion seen from water (its lift's frame R(s)): water only deforms, peroxide moves. */
function drawInset(ctx, t) {
  const alpha = fade(t, RUN_UNIT[0] - 0.5, RUN_UNIT[0] + 0.5, 66, 67) * (1 - fade(t, 58.6, 59.2, 59.4, 60));
  if (alpha <= 0.003) return;
  const { XA, XB, R, lift } = labState(t);
  const back = (X) => {
    const out = [];
    for (let i = 0; i < X.length; i += 3) out.push(...rotation.apply(rotation.transpose(R), [X[i], X[i + 1], X[i + 2]]));
    return out;
  };
  const bodyA = back(XA), bodyB = back(XB);
  const cam = camera({ cx: INSET.cx, cy: INSET.cy, scale: 33, yaw: LAB.yaw, pitch: LAB.pitch, focal: 14, center: midpoint(lift.samples[0].XA, lift.XB) });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.arc(INSET.cx, INSET.cy, INSET.r, 0, 2 * Math.PI);
  ctx.fillStyle = color.panel;
  ctx.fill();
  ctx.save();
  ctx.clip();
  drawMol(ctx, lift.XB, cam, PEROXIDE_MOL, { ghost: color.muted, opacity: 0.6 });
  drawHalo(ctx, cam, bodyA, 3, SCORE_W);
  drawHalo(ctx, cam, bodyB, 4, SCORE_P);
  drawMol(ctx, bodyA, cam, WATER_MOL);
  drawMol(ctx, bodyB, cam, PEROXIDE_MOL);
  ctx.restore();
  ctx.strokeStyle = POSE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(INSET.cx, INSET.cy, INSET.r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'seen from water', INSET.cx, INSET.cy + INSET.r + 26, { ...type.note, color: POSE, align: 'center', alpha });
  text(ctx, 'ghost: where it started', INSET.cx, INSET.cy + INSET.r + 46, { ...type.note, align: 'center', alpha });
}

// ---- right: notes, one block at a time ---------------------------------------------------------------

/** Wrapped text in the notes column; returns the height used. */
function note(ctx, str, y, style, alpha, lineHeight = 26) {
  if (alpha <= 0.003) return 0;
  const lines = splitLines(ctx, str, WIDTH, style);
  lines.forEach((line, k) => text(ctx, line, RIGHT, y + lineHeight * k, { ...style, alpha }));
  return lines.length * lineHeight;
}

function drawNotes(ctx, t) {
  // 0–23.5: the bend and the two frame readings
  const theta = thetaAt(t);
  const open = fade(t, 0.5, 1.5, FLOOR - 0.5, FLOOR + 0.3);
  readout(ctx, 'water angle θ', `${theta.toFixed(1)}°`, RIGHT, 222, { colour: SCORE_W, alpha: open });
  const frames = fade(t, FRAMES + 0.5, FRAMES + 1.5, FLOOR - 0.5, FLOOR + 0.3);
  const deg = (v) => `${v.toFixed(1).replace('-', '−')}°`;
  readout(ctx, "peroxide's direction seen in the bisector frame:", deg(readingAt(theta, 'bisector')), RIGHT, 260, { colour: HORIZONTAL, alpha: frames });
  readout(ctx, '… in the bond frame:', deg(readingAt(theta, 'bond')), RIGHT, 300, { colour: color.body, alpha: frames });
  note(ctx, 'same motion, two answers: which is right? The noise decides.', 340, { ...NOTE, color: color.ink }, fade(t, 17, 18, FLOOR - 0.5, FLOOR + 0.3));

  // 23.5–33: the floor for this scene
  const floor = fade(t, FLOOR + 1, FLOOR + 2, FLAT - 0.5, FLAT + 0.3);
  note(ctx, "for this scene: two of water's own shape numbers, θ and δ", 222, NOTE, floor);
  note(ctx, 'δ = r₁ − r₂: the difference of its two bond lengths', 254, { ...type.note, color: SCORE_W }, floor);
  note(ctx, 'fibres drawn straight: a trivialisation (a gauge)', 300, { ...NOTE, color: VERTICAL }, fade(t, FLOOR + 4.5, FLOOR + 5.5, FLAT - 0.5, FLAT + 0.3));

  // 33–45: horizontal = zero momentum and angular momentum per molecule
  const flat = fade(t, FLAT + 1, FLAT + 2, LOOP - 0.5, LOOP + 0.3);
  note(ctx, 'horizontal: each molecule with zero momentum and angular momentum of its own (unit masses for equal noise)', 222, { ...NOTE, color: HORIZONTAL }, flat);
  HORIZONTAL_EQ.draw(ctx, RIGHT, 306, { size: 26, alpha: fade(t, FLAT + 3, FLAT + 4, LOOP - 0.5, LOOP + 0.3) });
  note(ctx, `tiles: the horizontal directions at u = 0; tilts computed, drawn ×${TILT_GAIN}`, 352, { ...type.note, color: HORIZONTAL }, fade(t, FLAT + 2, FLAT + 3, LOOP - 0.5, LOOP + 0.3));
  note(ctx, `steepest tile: du/dδ = ${STEEPEST.toFixed(2)} per Å (horizontal ≠ flat)`, 376, { ...type.note, color: HORIZONTAL }, fade(t, FLAT + 3, FLAT + 4, LOOP - 0.5, LOOP + 0.3));

  // 45–59: the loop, equal noise
  const loop = fade(t, LOOP + 0.5, LOOP + 1.5, MASSES - 0.5, MASSES + 0.3);
  note(ctx, 'water runs a loop of shapes horizontally; peroxide stays at rest in the lab', 222, NOTE, loop);
  note(ctx, 'loop exaggerated: several times the thermal size', 280, type.note, loop);
  const now = labState(t);
  readout(ctx, 'water has turned by', `${Math.abs(now.turn).toFixed(1)}°`, RIGHT, 318, { colour: VERTICAL, size: 20, alpha: fade(t, RUN_UNIT[0], RUN_UNIT[0] + 0.6, MASSES - 0.5, MASSES + 0.3) });

  // 59–68: mass-scaled noise, another connection
  const masses = fade(t, MASSES + 0.3, MASSES + 1.2, 66.5, 67.5);
  note(ctx, 'some models scale the noise by mass (noise scaled by 1/√m)', 222, NOTE, masses);
  readout(ctx, 'equal noise (unit masses):', `${UNIT.angle.toFixed(1)}°`, RIGHT, 262, { colour: VERTICAL, alpha: masses * 0.75 });
  const turned = t > MASSES ? Math.abs(now.turn) : 0;
  readout(ctx, 'mass-scaled noise (masses 16 : 1 : 1):', `${turned.toFixed(1)}°`, RIGHT, 292, { colour: VERTICAL, alpha: fade(t, RUN_MASS[0] - 0.3, RUN_MASS[0] + 0.3, 66.5, 67.5) });
  note(ctx, 'the noise metric picks the connection', 334, { ...NOTE, color: color.ink }, fade(t, 63.5, 64.5, 66.5, 67.5));
}

// ---- 68–82: the scores don't care ----------------------------------------------------------------------

function drawScoresCard(ctx, t) {
  const alpha = fade(t, SCORES + 0.5, SCORES + 1.5, 81, 81.8);
  if (alpha <= 0.003) return;
  const height = tagCard(ctx, {
    x: RIGHT, y: 230, width: WIDTH, tag: "SCORES DON'T CARE", accent: HORIZONTAL, alpha,
    body: 'A score is the gradient of a function that ignores the gauge (Dα = dα for such α), so the connection never enters the scores, the decomposition or training (C1, C2). Each monomer score step is horizontal for the per-molecule connection of the noise metric; the full score is horizontal only for the global rotations.',
  });
  const y = 230 + height + 34;
  const checks = fade(t, 73, 74, 81, 81.8);
  readout(ctx, '2 molecules: max |cos(horizontal, vertical)| =', SUBMERSION.two.toExponential(0), RIGHT, y, { colour: POSE, alpha: checks });
  readout(ctx, '4 molecules:', `${SUBMERSION.four.toExponential(0)} (computed now)`, RIGHT, y + 30, { colour: POSE, alpha: checks });
  note(ctx, "pose directions and shape directions are exactly perpendicular in the noise's geometry", y + 66, { ...type.note, color: POSE }, checks, 21);
}

// ---- 82–99: where it matters ----------------------------------------------------------------------------

const ARROW_GAIN = 12;
const PANEL_CAM = (cx) => camera({ cx, cy: 424, scale: 72, yaw: 0.4, pitch: 0.35, focal: 30, center: centroid(STEP.X, 4) });
const VIEWS = [
  { cam: PANEL_CAM(RIGHT + 165), D: STEP.D1, label: 'unweighted (unit masses)' },
  { cam: PANEL_CAM(RIGHT + 495), D: STEP.Dm, label: 'mass-weighted' },
];

function drawEvidence(ctx, t) {
  const alpha = fade(t, SAMPLERS + 0.5, SAMPLERS + 1.5);
  if (alpha <= 0.003) return;
  const { x, y, w, h } = EVIDENCE;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = rgba(color.panel, 0.97);
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  text(ctx, `a docking-style torsion step: peroxide takes Δτ = ${STEP.step}°`, x + 24, y + 36, { ...type.label, size: 18, alpha });
  const realign = fade(t, 85, 86);
  splitLines(ctx, 'then the sampler re-aligns the molecule to its previous pose: unweighted or mass-weighted', w - 48, type.note)
    .forEach((line, k) => text(ctx, line, x + 24, y + 64 + 21 * k, { ...type.note, alpha: alpha * realign }));

  const arrows = fade(t, 86.5, 87.5);
  for (const { cam, D, label } of VIEWS) {
    drawHalo(ctx, cam, STEP.X, 4, SCORE_P, { alpha });
    drawMol(ctx, STEP.X, cam, PEROXIDE_MOL, { opacity: alpha, atomScale: 0.6 });
    for (let i = 0; i < 4; i++) {
      const p = [0, 1, 2].map((k) => STEP.X[3 * i + k]);
      const a = cam.project(p), b = cam.project(p.map((v, k) => v + ARROW_GAIN * D[3 * i + k]));
      if (Math.hypot(b.x - a.x, b.y - a.y) < 8) continue; // a near-zero displacement: no arrow, not a stray head
      scoreArrow(ctx, a.x, a.y, b.x, b.y, { colour: HORIZONTAL, width: 3, head: 10, alpha: alpha * arrows });
    }
    text(ctx, label, cam.cx, y + 294, { ...type.label, color: HORIZONTAL, align: 'center', alpha: alpha * realign });
  }
  const diff = fade(t, 88, 89);
  text(ctx, `arrows: each atom's displacement after re-alignment, ×${ARROW_GAIN}`, x + 24, y + 320, { ...type.note, alpha: alpha * diff });
  text(ctx, `relative difference ${KABSCH.map((k) => pct(k.diff)).join(' · ')}`, x + 24, y + 346, { font: font.mono, size: 16, color: color.ink, alpha: alpha * diff });
  text(ctx, `at Δτ = ${KABSCH.map((k) => `${k.step}°`).join(', ')}: does not shrink`, x + 24, y + 367, { font: font.mono, size: 16, color: color.ink, alpha: alpha * diff });

  const split = fade(t, 89.5, 90.5);
  [
    'net force and net torque about a fixed lab point:',
    `identical under both metrics (difference ${TORQUE.difference.toExponential(0)})`,
    `the per-atom pose/shape split: changes by ${(100 * TORQUE.splitChange).toFixed(0)} %`,
  ].forEach((str, k) => text(ctx, str, RIGHT, 660 + 22 * k, { font: font.mono, size: 15, color: color.body, alpha: split }));
  toyStamp(ctx, split);

  // closing chip
  const chip = fade(t, 92.5, 93.5);
  if (chip <= 0.003) return;
  const style = { ...NOTE, color: color.ink };
  const chipLines = splitLines(ctx, "if a connection is used anywhere (bundle-coordinate samplers, force splits, shape-only noise), use the noise metric's, everywhere (C5)", w - 48, style);
  const top = 744, chipH = 26 + 27 * chipLines.length;
  ctx.save();
  ctx.globalAlpha *= chip;
  ctx.fillStyle = rgba(HORIZONTAL, 0.12);
  roundRect(ctx, x, top, w, chipH, chipH / 2 > 28 ? 22 : chipH / 2);
  ctx.fill();
  ctx.strokeStyle = rgba(HORIZONTAL, 0.7);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  chipLines.forEach((line, k) => text(ctx, line, x + 24, top + 32 + 27 * k, { ...style, alpha: chip }));
}
