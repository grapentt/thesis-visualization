import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, camera, arrow, dot, ring, rotation, vec3 } from '../../../kit.js';
import { centroid, poseCoords } from '../toy.js';
import { runs11, DOCKED, closestOH } from '../data.js';
import {
  HORIZONTAL, VERTICAL, SCORE_W, SCORE_P, INTER, RESTRAINT, POSE, PAIR_MOL, drawMol, drawHalo, drawHBond, drawRestraint, drawScoreArrows, drawNetReadout, scoreArrow, equationStrip, readout, toyStamp,
} from '../shared.js';
import { drawMaster, drawFibres, diagramCamera, project, toA, toB, toF } from '../diagram.js';

const RIGHT = 860;
const PAIR_SCALE = 120, ATOMS = 0.6; // px/Å and atom size of the large pair view
const CUE = { monomer: 10, peroxide: 17, picture: 23.5, inter: 36, relax: 48, bind: 54.5 };
const RUN_A = [49.2, 54], RUN_B = [55, 66];
const ETA = 2e-4; // Å², the step of the drift runs
const NET_GAIN = 4, RHO_GAIN = 40; // magnifications of the net and restraint arrows, stated on screen

const SMALL_NOISE = tex(String.raw`t\to 0:\quad s = -\beta\,\nabla U = F/kT`, 't → 0:  s = −β∇U = F/kT');
const THIRD_LAW = tex(String.raw`F_A + F_B = 0,\qquad \textstyle\sum_i (x_i - c)\times s_i = 0\ \text{ for any } c`, 'F_A + F_B = 0,   Σᵢ (xᵢ − c) × sᵢ = 0 for any c');
const DRIFT = tex(String.raw`x \leftarrow x + \eta\, s(x),\quad \eta = 2\cdot 10^{-4}\ \text{Å}^2`, 'x ← x + η s(x),  η = 2·10⁻⁴ Å²');

// Turn every configuration about water's normal so that c_B − c_A points up and to the right at
// 20°: water lower left, peroxide upper right, both nearly in the screen plane (arrows full length).
const { X: X_STAR, scores, pxPerUnit, net, push, a: RUN_MONO, b: RUN_BIND, binding: BINDING } = runs11;
const R_TURN = (() => {
  const { r } = poseCoords(X_STAR.slice(0, 9), X_STAR.slice(9));
  return rotation.axisAngle([0, 0, 1], Math.PI / 9 - Math.atan2(r[1], r[0]));
})();
const turn = (V) => {
  const out = [];
  for (let i = 0; i < V.length; i += 3) out.push(...rotation.apply(R_TURN, [V[i], V[i + 1], V[i + 2]]));
  return out;
};
const X = turn(X_STAR), GHOST = turn(DOCKED.X);
const S = { W: turn(scores.sW), P: turn(scores.sP), int: turn(scores.sInt), rhoA: rotation.apply(R_TURN, net.rho.A), rhoB: rotation.apply(R_TURN, net.rho.B) };
const FA = rotation.apply(R_TURN, net.FA), FB = rotation.apply(R_TURN, net.FB);
const C_A = centroid(X.slice(0, 9)), C_B = centroid(X.slice(9)), C_PAIR = centroid(X);
const CLOSE = closestOH(X.slice(0, 9), X.slice(9)); // peroxide's H nearest water's O
const atom = (V, i) => V.slice(3 * i, 3 * i + 3);

/** Per-frame pose readouts of a run, and its path on the diagram. */
const describe = (run) => {
  const frames = run.frames.map((F) => turn(F));
  const start = [centroid(frames[0].slice(0, 9)), centroid(frames[0].slice(9))];
  let worst = 0;
  const shift = frames.map((F) => {
    worst = Math.max(worst, vec3.length(vec3.sub(centroid(F.slice(0, 9)), start[0])), vec3.length(vec3.sub(centroid(F.slice(9)), start[1])));
    return worst;
  });
  return {
    frames, shift,
    d: frames.map((F) => vec3.length(vec3.sub(centroid(F.slice(9)), centroid(F.slice(0, 9))))),
    path: run.theta.map((th, k) => [toA(th), toB(run.tau[k]), toF(run.u[k])]),
    Uint: run.Uint, u: run.u,
  };
};
const MONO = describe(RUN_MONO), BIND = describe(RUN_BIND);
const LAST = MONO.frames.length - 1;
/** Frame index at time t: eased so the fast first relaxation is not over in a blink. */
const frameAt = (t, [t0, t1]) => Math.round(LAST * lin(t, t0, t1) ** 2.2);

// the diagram, and push-forwards of one step η s (degrees, degrees, u)
const DIAGRAM = diagramCamera({ cx: 420, cy: 465, scale: 90 });
const START = MONO.path[0];
const perStep = (d) => ({ dTheta: ETA * d.dTheta, dTau: ETA * d.dTau, du: ETA * d.du });
const ARROW_BOX = 0.26; // every diagram arrow is drawn this long in box units: directions only
const unitScale = ({ dTheta, dTau, du }) => ARROW_BOX / Math.hypot(dTheta / 25, dTau / 360, du / 2);

export default defineScene({
  name: 'Who moves what',
  duration: 72,
  header: { eyebrow: '11 · SCORES', title: 'Who moves what' },
  narration: [
    [0, 'Now the three kinds of arrow on real atoms, at small noise, where each score is a force divided by kT.'],
    [CUE.monomer, 'Water’s own score pulls its bonds and angle back towards their preferred values. Its arrows add up to no net force and no net torque. The same for peroxide.'],
    [CUE.picture, 'On the picture they move along the floor, and here not up the drawn fibre. In general a monomer step can tilt; we come back to that.'],
    [CUE.inter, 'The interaction arrows pull peroxide’s hydrogen towards water’s oxygen. Their forces cancel, and so do their torques about any one point: Newton’s third law, for scores.'],
    [CUE.relax, 'Follow only the monomer scores: both molecules relax, and their centres never move.'],
    [CUE.bind, 'Add the interaction, and the spring’s gentle pull on the centres: the point moves along its fibre and docks. Apart from that spring, which cannot orient anything, binding lives in exactly one term.'],
  ],

  draw(ctx, t) {
    drawDiagram(ctx, t);
    drawPair(ctx, t, fade(t, 0.5, 1.5, CUE.relax, CUE.relax + 0.8));
    drawRightNotes(ctx, t);
    drawRuns(ctx, t, seg(t, CUE.relax + 0.8, CUE.relax + 1.6)); // after the pair has gone: no crossed text
    const highlight = t < CUE.monomer ? null : t < CUE.peroxide ? 'W' : t < CUE.inter ? ['W', 'P'] : t < CUE.relax ? ['int', 'rho'] : t < CUE.bind ? ['W', 'P'] : null;
    equationStrip(ctx, 60, 860, { size: 24, maxWidth: 700, labels: false, highlight, alpha: seg(t, 0.5, 1.5) });
    toyStamp(ctx, seg(t, 0.5, 1.5));
  },
});

// ---- the pair, large, with its three families of arrows -------------------------------------

function drawPair(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const cam = camera({ cx: 1190, cy: 575, scale: PAIR_SCALE, yaw: 0.2, pitch: -0.2, focal: 30, center: C_PAIR });
  drawMol(ctx, GHOST, cam, PAIR_MOL, { ghost: color.muted, opacity: 0.4 * alpha, atomScale: ATOMS });
  drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha });
  drawMol(ctx, X, cam, PAIR_MOL, { opacity: alpha, atomScale: ATOMS });

  const zeros = fade(t, CUE.monomer + 4, CUE.monomer + 5, CUE.picture, CUE.picture + 1);
  drawZeros(ctx, cam.project(C_A), alpha * zeros);
  drawZeros(ctx, cam.project(C_B), alpha * zeros * seg(t, CUE.peroxide + 2.5, CUE.peroxide + 3.5));
  const mono = alpha * (1 - seg(t, CUE.inter, CUE.inter + 1));
  drawScoreArrows(ctx, cam, X.slice(0, 9), S.W, { colour: SCORE_W, pxPerUnit: pxPerUnit * seg(t, CUE.monomer + 0.5, CUE.monomer + 2.5), alpha: mono });
  drawScoreArrows(ctx, cam, X.slice(9), S.P, { colour: SCORE_P, pxPerUnit: pxPerUnit * seg(t, CUE.peroxide, CUE.peroxide + 2), alpha: mono });

  const inter = alpha * seg(t, CUE.inter + 0.5, CUE.inter + 2) * (1 - 0.5 * seg(t, CUE.inter + 4, CUE.inter + 5));
  drawHBond(ctx, cam, atom(X, CLOSE.h), atom(X, CLOSE.o), { alpha: 0.7 * inter * (1 - seg(t, CUE.inter + 4, CUE.inter + 5)) });
  drawScoreArrows(ctx, cam, X, S.int, { colour: INTER, pxPerUnit: pxPerUnit * seg(t, CUE.inter + 0.5, CUE.inter + 2), alpha: inter });
  const nets = alpha * seg(t, CUE.inter + 4, CUE.inter + 5);
  for (const [c, F] of [[C_A, FA], [C_B, FB]]) {
    const p = cam.project(c), q = cam.project(vec3.add(c, vec3.scale(F, (NET_GAIN * pxPerUnit) / cam.scale)));
    scoreArrow(ctx, p.x, p.y, q.x, q.y, { colour: INTER, width: 7, head: 20, alpha: nets });
  }
  const rho = alpha * seg(t, CUE.inter + 6, CUE.inter + 7);
  if (rho > 0.003) {
    drawRestraint(ctx, cam.project(C_A), cam.project(C_B), { alpha: rho, amplitude: 7, toothPx: 12 });
    for (const [c, F] of [[C_A, S.rhoA], [C_B, S.rhoB]]) {
      const p = cam.project(c), q = cam.project(vec3.add(c, vec3.scale(F, (RHO_GAIN * pxPerUnit) / cam.scale)));
      scoreArrow(ctx, p.x, p.y, q.x, q.y, { colour: RESTRAINT, dashed: true, alpha: rho });
    }
  }
  const cA = cam.project(C_A), cB = cam.project(C_B);
  text(ctx, 'water', cA.x - 95, cA.y + 8, { font: font.display, italic: true, size: 26, color: SCORE_W, align: 'right', alpha });
  text(ctx, 'peroxide', cB.x + 95, cB.y + 8, { font: font.display, italic: true, size: 26, color: SCORE_P, alpha });
}

/** Gold zero at a centroid: a ring with 0 (net force) inside a circling arrow (net torque). */
function drawZeros(ctx, c, alpha) {
  if (alpha <= 0.003) return;
  dot(ctx, c.x, c.y, 11, color.bg, alpha);
  ring(ctx, c.x, c.y, 11, VERTICAL, alpha, 2.2);
  text(ctx, '0', c.x, c.y + 1, { font: font.mono, size: 15, weight: 600, color: VERTICAL, align: 'center', baseline: 'middle', alpha });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 19, -0.4 * Math.PI, 1.25 * Math.PI);
  ctx.stroke();
  ctx.restore();
  const e = 1.25 * Math.PI;
  const ex = c.x + 19 * Math.cos(e), ey = c.y + 19 * Math.sin(e);
  arrow(ctx, ex - 9 * Math.sin(e), ey + 9 * Math.cos(e), ex + 2 * Math.sin(e), ey - 2 * Math.cos(e), { color: VERTICAL, width: 2.2, head: 10, alpha });
}


// ---- the notes on the right ----------------------------------------------------------------

const fmt = (v, digits = 2, unit = '') => (Math.abs(v) < 1e-6 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}${unit}`);
const pushText = (d) => `(dθ, dτ, du) = (${fmt(d.dTheta, 2, '°')}, ${fmt(d.dTau, 2, '°')}, ${fmt(d.du, 4)})`;

function drawRightNotes(ctx, t) {
  const top = fade(t, 0.5, 1.5, CUE.relax, CUE.relax + 0.8);
  SMALL_NOISE.draw(ctx, RIGHT, 236, { size: 28, alpha: top });
  text(ctx, `one arrow scale: 1 Å of arrow = ${(PAIR_SCALE / pxPerUnit).toFixed(1)} Å⁻¹ of score · outline: the docked pose`, RIGHT, 276, { ...type.note, alpha: top });

  // monomer readouts, then the interaction's
  const mono = fade(t, CUE.monomer + 5, CUE.monomer + 6, CUE.inter, CUE.inter + 0.8);
  text(ctx, 'water', RIGHT, 322, { font: font.mono, size: 16, color: SCORE_W, alpha: mono });
  drawNetReadout(ctx, RIGHT + 100, 322, { force: net.W.force, torque: net.W.torque, tint: SCORE_W, alpha: mono });
  const monoB = mono * seg(t, CUE.peroxide + 3, CUE.peroxide + 4);
  text(ctx, 'peroxide', RIGHT, 348, { font: font.mono, size: 16, color: SCORE_P, alpha: monoB });
  drawNetReadout(ctx, RIGHT + 100, 348, { force: net.P.force, torque: net.P.torque, tint: SCORE_P, alpha: monoB });

  const inter = fade(t, CUE.inter + 4, CUE.inter + 5, CUE.relax, CUE.relax + 0.8);
  readout(ctx, '|F_A| =', `${vec3.length(FA).toFixed(2)} Å⁻¹ · |F_A + F_B| = ${net.int.force.toExponential(0)}`, RIGHT, 322, { colour: INTER, size: 16, alpha: inter });
  readout(ctx, 'net torque about one common point (the pair’s centroid):', net.int.torque.toExponential(0), RIGHT, 348, { colour: INTER, size: 16, alpha: inter * seg(t, CUE.inter + 5, CUE.inter + 6) });
  text(ctx, `fat arrows: net per molecule (×${NET_GAIN}) · khaki: the restraint on the centres (×${RHO_GAIN})`, RIGHT, 806, { ...type.note, color: color.body, alpha: inter * seg(t, CUE.inter + 6, CUE.inter + 7) });
  THIRD_LAW.draw(ctx, RIGHT, 852, { size: 22, alpha: inter * seg(t, CUE.inter + 8, CUE.inter + 9) });

  wrap(ctx, 'here du = 0: water is symmetric and u sees only peroxide’s centre. In general a monomer step tilts with the connection (scene 17).', RIGHT, 812, 660, 21, { ...type.note, alpha: fade(t, CUE.picture + 6, CUE.picture + 7, CUE.inter, CUE.inter + 0.8) });
}

// ---- the master diagram -------------------------------------------------------------------

function drawDiagram(ctx, t) {
  const alpha = seg(t, 0.5, 1.5);
  const runA = seg(t, RUN_A[0] - 0.5, RUN_A[0]), runB = seg(t, RUN_B[0] - 0.5, RUN_B[0]);
  const kA = frameAt(t, RUN_A), kB = frameAt(t, RUN_B);
  // the cursor follows run (a), glides back to X★, then follows run (b)
  const back = seg(t, RUN_B[0] - 0.8, RUN_B[0] - 0.1);
  const here = t >= RUN_B[0] ? BIND.path[kB] : t < RUN_A[0] ? START : MONO.path[kA].map((v, i) => v + (START[i] - v) * back);
  const picture = fade(t, CUE.picture + 0.5, CUE.picture + 1.5, CUE.inter, CUE.inter + 1);
  const inter = fade(t, CUE.inter + 1, CUE.inter + 2, CUE.relax, CUE.relax + 1);
  const arrows = [
    { d: perStep(push.W), colour: SCORE_W, alpha: picture },
    { d: perStep(push.P), colour: SCORE_P, alpha: picture * seg(t, CUE.picture + 2.5, CUE.picture + 3.5) },
    { d: perStep(push.int), colour: INTER, alpha: inter },
  ].map(({ d, ...o }) => ({ a: START[0], b: START[1], f: START[2], d, scale: unitScale(d), ...o }));
  // what binding adds: run (b)'s end minus run (a)'s, drawn at its true length from run (a)'s end
  const relaxed = MONO.path.at(-1), bindArrow = seg(t, CUE.bind, CUE.bind + 1);
  arrows.push({ a: relaxed[0], b: relaxed[1], f: relaxed[2], d: BINDING, scale: 1, colour: INTER, alpha: bindArrow });
  drawMaster(ctx, {
    camera: DIAGRAM,
    alpha,
    floor: { alpha: 1 },
    fibres: { alpha: 0.75, caption: true },
    paths: [
      { points: MONO.path.slice(0, kA + 1), colour: HORIZONTAL, alpha: runA, width: 6 }, // wide: (b) runs close by
      { points: BIND.path.slice(0, kB + 1), colour: INTER, alpha: runB, width: 2.5 },
    ],
    arrows,
    cursor: { a: here[0], b: here[1], f: here[2] },
  });
  // the fibre over X★'s own shapes, drawn bright
  drawFibres(ctx, DIAGRAM, { sites: [[109, 160]], highlight: [[109, 160]], glyphs: false, caption: false, alpha: alpha * fade(t, 1, 2, CUE.relax, CUE.relax + 1) });

  const s0 = project(DIAGRAM, ...START);
  text(ctx, 'X★', s0.x + 10, s0.y - 12, { font: font.mono, size: 16, color: color.ink, alpha: alpha * fade(t, 1, 2, RUN_A[0], RUN_A[0] + 0.5) });
  const ends = seg(t, 58.5, 59.5);
  const u0 = RUN_BIND.u[0], u1 = RUN_BIND.u.at(-1), signed = (v) => v.toFixed(2).replace('-', '−');
  const undrawn = [`docking moves the point along its fibre, u ${signed(u0)} → ${signed(u1)};`, 'the rest happens in d and orientation, which are not drawn'];
  undrawn.forEach((line, i) => text(ctx, line, 60, 200 + 24 * i, { ...type.note, color: POSE, alpha: ends }));

  // the binding arrow's label, beside run (a)'s end
  const r = project(DIAGRAM, ...MONO.path.at(-1));
  text(ctx, 'binding: along the fibre, to the peak', r.x + 14, r.y + 22, { ...type.note, color: INTER, alpha: alpha * seg(t, CUE.bind + 0.5, CUE.bind + 1.5) });

  // push-forward readouts, top left: one step η s on the picture
  const label = (str, y, colour, a) => text(ctx, str, 60, y, { font: font.mono, size: 15, color: colour, alpha: a });
  label(`water        ${pushText(perStep(push.W))}`, 200, SCORE_W, picture);
  label(`peroxide     ${pushText(perStep(push.P))}`, 224, SCORE_P, picture * seg(t, CUE.picture + 2.5, CUE.picture + 3.5));
  label(`interaction  ${pushText(perStep(push.int))}`, 200, INTER, inter);
  label('restraint    (0, 0, 0): it changes d, not u', 224, RESTRAINT, inter * seg(t, CUE.inter + 6, CUE.inter + 7));
  const notes = Math.max(picture, inter);
  text(ctx, 'one step η s on the picture', 820, 200, { ...type.note, color: color.body, align: 'right', alpha: notes });
  text(ctx, 'arrows: directions only', 820, 224, { ...type.note, color: color.body, align: 'right', alpha: notes });
}

// ---- the two drift runs ----------------------------------------------------------------------

function drawRuns(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  DRIFT.draw(ctx, RIGHT, 236, { size: 28, alpha });
  text(ctx, 'follow the arrows: the t → 0 drift, an illustration, not a sampler', RIGHT, 276, { ...type.note, alpha });
  const panels = [
    { cx: 1030, run: MONO, k: frameAt(t, RUN_A), title: 'monomer scores only', tint: HORIZONTAL, a: alpha },
    { cx: 1370, run: BIND, k: frameAt(t, RUN_B), title: '+ interaction + spring', tint: INTER, a: alpha * seg(t, CUE.bind, CUE.bind + 1) },
  ];
  for (const { cx, run, k, title, tint, a } of panels) {
    if (a <= 0.003) continue;
    const F = run.frames[k];
    const cam = camera({ cx, cy: 525, scale: 56, yaw: 0.2, pitch: -0.2, focal: 30, center: C_PAIR });
    text(ctx, title, cx, 390, { ...type.label, color: tint, align: 'center', alpha: a });
    drawMol(ctx, GHOST, cam, PAIR_MOL, { ghost: color.muted, opacity: 0.4 * a, atomScale: ATOMS });
    drawHalo(ctx, cam, F, [0, 3], SCORE_W, { alpha: a });
    drawHalo(ctx, cam, F, [3, 7], SCORE_P, { alpha: a });
    drawMol(ctx, F, cam, PAIR_MOL, { opacity: a, atomScale: ATOMS });
    const bond = closestOH(F.slice(0, 9), F.slice(9));
    if (bond.length < 2.2) drawHBond(ctx, cam, atom(F, bond.h), atom(F, bond.o), { alpha: a, label: false });
    if (run === BIND) {
      // the restraint offset 8 px sideways, so it does not run over the hydrogen-bond dash
      const p = cam.project(centroid(F.slice(0, 9))), q = cam.project(centroid(F.slice(9)));
      const L = Math.hypot(q.x - p.x, q.y - p.y) || 1, nx = (-8 * (q.y - p.y)) / L, ny = (8 * (q.x - p.x)) / L;
      drawRestraint(ctx, { x: p.x + nx, y: p.y + ny }, { x: q.x + nx, y: q.y + ny }, { alpha: 0.5 * a, amplitude: 6, toothPx: 12 });
    }
    for (const c of [centroid(F.slice(0, 9)), centroid(F.slice(9))]) {
      const s = cam.project(c);
      dot(ctx, s.x, s.y, 4, color.ink, a);
    }
    const lines = run === MONO
      ? [`centroid shift ${run.shift[k].toFixed(6)} Å`, `u ${run.u[k].toFixed(3)} fixed · d ${run.d[k].toFixed(2)} Å`, `U_int ${run.Uint[k].toFixed(2)} kcal/mol`]
      : [`d ${run.d[k].toFixed(2)} Å · u ${run.u[k].toFixed(3)}`, `U_int ${run.Uint[k].toFixed(2)} kcal/mol`, `docked: d ${DOCKED.d.toFixed(2)} Å · U_int ${DOCKED.U.toFixed(2)}`, '(flexible here; DOCKED: rest shapes)'];
    lines.forEach((s, i) => text(ctx, s.replace(/-/g, '−'), cx, 680 + 26 * i, { font: font.mono, size: 16, color: i >= 2 && run === BIND ? color.muted : color.ink, align: 'center', alpha: a }));
  }
  text(ctx, 'outline: the docked pose', 1200, 780, { ...type.note, align: 'center', alpha });
  text(ctx, 'binding lives in one term (plus the known spring)', 1200, 826, { ...type.body, size: 22, color: INTER, align: 'center', alpha: seg(t, 66, 67) });
}
