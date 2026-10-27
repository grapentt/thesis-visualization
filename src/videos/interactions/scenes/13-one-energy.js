import { defineScene, seg, fade, lin, lerpLog, text, wrap, type, font, color, tex, camera, rgba, roundRect, line, ring, polyline3, polygon3, rotation, vec3 } from '../../../kit.js';
import { DEG, PEROXIDE, WATER, buildWater, buildPeroxide, frameOf, centroid, scoresSmallNoise, netForceTorque, U_int, join } from '../toy.js';
import { XSTAR, chirality, zPoseGrid } from '../data.js';
import {
  VERTICAL, SCORE_W, SCORE_P, INTER, PAIR_MOL, PEROXIDE_MOL, WATER_MOL, DIMER_MOL, ALA2_MOL, drawMol, drawHalo, drawFrame, drawScoreArrows, drawNetReadout, scoreArrow, tagCard, toyStamp,
} from '../shared.js';
import { diagramCamera, drawFloor, diagPoint, toA, toB } from '../diagram.js';

const RIGHT = 860;
const NOTE = { ...type.body, size: 20 };
const MONO = { font: font.mono, size: 17, color: color.ink };

// beats (scene-local seconds)
const TURN = [14.2, 19.6]; // the whole pair turns once, together
const FRAME = 21, DRIVE = [22, 27], CONE = [27, 31]; // H1 to 179.6°, then round a 0.4° cone
const SECOND = 33, DRIVE2 = [33.2, 35.2], SWING2 = [35.2, 36.2]; // the other anchor choice: H2 collinear, then round its cone
const CLOUD = [35.9, 36.6, 37.6, 38.2];
const SWAP = 38, PATH = [39.3, 43.8];
const MIRROR = 47, DATA = 56.5, NOISY = 66.5, FINAL = 78.5;

const LEARNED = tex(String.raw`\nabla\log W_t \approx \nabla_z\varphi(z,t),\qquad \varphi(gz,t) = \varphi(z,t)`, '∇log W_t ≈ ∇_z φ(z, t),    φ(gz, t) = φ(z, t)');

// ---- 0–21: one pair, its interaction arrows, a joint turn ---------------------------------

const PAIR = join(XSTAR.XA, XSTAR.XB);
const S_INT = scoresSmallNoise(XSTAR.XA, XSTAR.XB).sInt;
const PAIR_NET = netForceTorque(PAIR, S_INT);
const sumOver = (S, from, to) => [0, 1, 2].map((k) => { let s = 0; for (let i = from; i < to; i++) s += S[3 * i + k]; return s; });
const F_A = sumOver(S_INT, 0, 3), F_B = sumOver(S_INT, 3, 7);
const C_PAIR = centroid(PAIR, 7);
const PX = 9.5; // px per Å⁻¹: the largest atom arrow is 90 px
const TURN_AXIS = vec3.normalize([0.25, 1, 0.3]);

// ---- 21–38: frames from a molecule's own atoms ----------------------------------------------

const P_REST = buildPeroxide();
const O1 = P_REST.slice(3, 6), O2 = P_REST.slice(6, 9);
const at = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
/** Peroxide with H1 (or H2) at bond angle `a` from its O–O axis and azimuth `phi` about it; the O atoms stay put. */
function peroxideWith({ a1 = PEROXIDE.a, phi1 = -PEROXIDE.tau0 / 2, a2 = PEROXIDE.a, phi2 = PEROXIDE.tau0 / 2 }) {
  const oh = PEROXIDE.oh;
  const H1 = vec3.add(O1, vec3.scale([Math.cos(a1), Math.sin(a1) * Math.cos(phi1), Math.sin(a1) * Math.sin(phi1)], oh));
  const H2 = vec3.add(O2, vec3.scale([-Math.cos(a2), Math.sin(a2) * Math.cos(phi2), Math.sin(a2) * Math.sin(phi2)], oh));
  return [...H1, ...O1, ...O2, ...H2];
}
const COLLINEAR = 179.6 * DEG;

/** The peroxide of the frame beat at t, which anchors frame it, and the frame's swing so far (degrees). */
function frameState(t) {
  if (t < SECOND) {
    const drive = seg(t, ...DRIVE), cone = lin(t, ...CONE);
    const a1 = PEROXIDE.a + (COLLINEAR - PEROXIDE.a) * drive * (1 - seg(t, SECOND - 1, SECOND));
    return { X: peroxideWith({ a1, phi1: -PEROXIDE.tau0 / 2 + 2 * Math.PI * seg(t, ...CONE) }), anchors: [1, 2, 0], angle: a1, swing: 360 * seg(t, ...CONE), coneOn: cone > 0 };
  }
  const a2 = PEROXIDE.a + (COLLINEAR - PEROXIDE.a) * seg(t, ...DRIVE2), swing = seg(t, ...SWING2);
  return { X: peroxideWith({ a2, phi2: PEROXIDE.tau0 / 2 + 2 * Math.PI * swing }), anchors: [2, 1, 3], angle: a2, swing: 360 * swing, coneOn: t > SWING2[0] };
}

// ---- 47–84: mirrors -----------------------------------------------------------------------

const GAP = 4; // Å from the mirror plane to each molecule's centroid
const shift = (X, dx) => Array.from(X, (v, i) => (i % 3 === 0 ? v + dx : v));
const L_POS = shift(chirality.L, -GAP), D_POS = shift(chirality.D, GAP); // D is L reflected through x = 0
const THUMB = diagramCamera({ cx: 250, cy: 300, scale: 56, pitch: -0.95 });
const FLOOR_Z = zPoseGrid.floor.theta.map((th) => zPoseGrid.floor.tau.map((ta) => Math.exp(zPoseGrid.fit(th, ta))));
const signed = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(2)}`;

export default defineScene({
  name: 'One energy',
  duration: 84,
  narration: [
    [0, "So learn the term as the gradient of one scalar energy, phi. Then it is conservative; and if phi ignores moving everything together, Newton's third law comes for free."],
    [13.5, 'Which symmetries must phi have? Rigid motions of everything together: yes. And it needs no frame.'],
    [21, 'A tempting shortcut: write peroxide in a frame built from its own atoms. Every choice of anchors breaks somewhere; that is a theorem, not bad luck.'],
    [33, 'And at high noise, diffusion visits every shape, including these.'],
    [38, "Swaps of identical molecules: yes. No rule like 'the left one' survives an exchange; it has to jump somewhere."],
    [47, 'Mirror images: no. The physics is mirror-blind: reflect alanine dipeptide and every distance stays the same, while its hand flips.'],
    [56.5, 'But the data are not mirror-blind: we only ever see the left hand. A mirror-blind monomer model would make both hands.'],
    [66.5, 'The noisy interaction term averages over that one-handed cloud, so at finite noise it has a hand too. Only at small noise does it become the mirror-blind force field. So: rotations, not reflections.'],
  ],
  header: { eyebrow: '13 · SYMMETRY', title: 'One energy, the right symmetries' },

  draw(ctx, t) {
    drawPairBeat(ctx, t, fade(t, 0.5, 1.3, 20.2, 20.9));
    drawFrameBeat(ctx, t, fade(t, FRAME, FRAME + 0.8, SWAP - 0.5, SWAP));
    drawExchange(ctx, t, fade(t, SWAP + 0.2, SWAP + 1, MIRROR - 0.5, MIRROR));
    drawMirror(ctx, t, seg(t, MIRROR - 0.1, MIRROR + 0.7));
    drawNotes(ctx, t, fade(t, 0.5, 1.3, MIRROR - 0.6, MIRROR));
    drawMirrorNotes(ctx, t);
    drawChips(ctx, t);
  },
});

/** The pair with its orange interaction arrows; the sums on each molecule are equal and opposite; then the whole pair turns. */
function drawPairBeat(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const R = rotation.axisAngle(TURN_AXIS, 2 * Math.PI * seg(t, ...TURN));
  const move = (p) => vec3.add(C_PAIR, rotation.apply(R, vec3.sub(p, C_PAIR)));
  const X = [], S = [];
  for (let i = 0; i < 7; i++) {
    X.push(...move(at(PAIR, i)));
    S.push(...rotation.apply(R, at(S_INT, i)));
  }
  const cam = camera({ cx: 420, cy: 525, scale: 95, yaw: 0.3, pitch: -0.25, focal: 12, center: C_PAIR });
  drawHalo(ctx, cam, X, 3, SCORE_W, { alpha });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha });
  drawMol(ctx, X, cam, PAIR_MOL, { opacity: alpha });

  const net = seg(t, 9, 10); // Newton's third law: one arrow per molecule
  drawScoreArrows(ctx, cam, X, S, { colour: INTER, pxPerUnit: PX, alpha: alpha * seg(t, 2.5, 3.5) * (1 - 0.7 * net) });
  const sums = [[centroid(X.slice(0, 9), 3), rotation.apply(R, F_A), 'sum on water'], [centroid(X.slice(9), 4), rotation.apply(R, F_B), 'sum on peroxide']];
  for (const [c, F, label] of sums) {
    const a = cam.project(c), b = cam.project(vec3.add(c, vec3.scale(F, (2 * PX) / cam.scale)));
    scoreArrow(ctx, a.x, a.y, b.x, b.y, { colour: INTER, width: 6, head: 18, alpha: alpha * net });
    text(ctx, label, b.x, b.y + (b.y > a.y ? 24 : -14), { ...type.note, color: INTER, align: 'center', alpha: alpha * net });
  }

  text(ctx, 'water', 190, 375, { font: font.display, italic: true, size: 24, color: SCORE_W, align: 'right', alpha });
  text(ctx, 'peroxide', 190, 675, { font: font.display, italic: true, size: 24, color: SCORE_P, align: 'right', alpha });

  text(ctx, 'small noise: ∇φ ≈ −β∇U_int on every atom (orange)', 60, 214, { ...type.note, color: INTER, alpha: alpha * seg(t, 2.5, 3.5) });
  text(ctx, `arrow 1 Å = ${(cam.scale / PX).toFixed(0)} Å⁻¹`, 60, 238, { ...type.note, alpha: alpha * seg(t, 2.5, 3.5) });
  text(ctx, 'thick: the sum on each molecule, drawn at twice the scale', 60, 262, { ...type.note, color: INTER, alpha: alpha * net });
  text(ctx, 'equal and opposite: Newton’s third law', 420, 770, { ...NOTE, color: INTER, align: 'center', alpha: alpha * fade(t, 10, 10.8, TURN[0] - 0.4, TURN[0]) });
  drawNetReadout(ctx, 420, 805, { ...PAIR_NET, align: 'center', alpha: alpha * seg(t, 10.5, 11.3) });

  const turning = alpha * seg(t, TURN[0] - 0.2, TURN[0] + 0.4);
  text(ctx, 'both molecules turned together', 420, 770, { ...NOTE, color: VERTICAL, align: 'center', alpha: turning });
  text(ctx, `U_int ${U_int(X.slice(0, 9), X.slice(9)).toFixed(2).replace('-', '−')} kcal/mol at every angle`, 420, 832, { ...MONO, align: 'center', alpha: turning });
  toyStamp(ctx, alpha);
}

/** Formula and the check items it buys (notes area, until the mirror beat). */
function drawNotes(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  LEARNED.draw(ctx, RIGHT, 240, { size: 28, alpha });
  text(ctx, 'φ: learned', RIGHT, 286, { ...type.note, color: INTER, alpha });
  text(ctx, 'g: any rigid motion of everything together', RIGHT + 120, 286, { ...type.note, alpha });
  const items = [
    [4.5, 'from the gradient alone', null, 330],
    [4.8, 'conservative', true, 360],
    [8.5, 'from the invariance', null, 402],
    [8.8, 'net force = 0', true, 432],
    [9.6, 'net torque = 0 (about any point)', true, 462],
    [11, 'small t: φ ≈ −βU_int + const (a learned force field)', true, 504],
    [11.8, 'gives log W_t for reweighting and MCMC', true, 534],
  ];
  for (const [at0, label, check, y] of items) {
    const a = alpha * seg(t, at0, at0 + 0.7);
    if (!check) text(ctx, label, RIGHT, y, { ...type.note, alpha: a });
    else {
      text(ctx, '✓', RIGHT, y, { ...NOTE, color: VERTICAL, alpha: a });
      text(ctx, label, RIGHT + 30, y, { ...NOTE, color: color.ink, alpha: a });
    }
  }
  wrap(ctx, 'never write the model in a molecule’s frame; an invariant network on atom coordinates needs none', RIGHT, 604, 660, 30, { ...NOTE, color: VERTICAL, alpha: alpha * seg(t, 36, 36.8) });
}

/** The anchor frame of the peroxide breaking where its anchors line up; a second choice; the noisy cloud. */
function drawFrameBeat(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const scale = lerpLog(160, 85, seg(t, CLOUD[0] - 0.1, CLOUD[1]));
  const cam = camera({ cx: 380, cy: 480, scale, yaw: 0.35, pitch: -0.3, focal: 20 });
  const cloud = alpha * fade(t, ...CLOUD);
  for (const Y of chirality.noisyPeroxides) drawMol(ctx, Y, cam, PEROXIDE_MOL, { ghost: color.body, opacity: 0.2 * cloud });

  const { X, anchors, angle, swing, coneOn } = frameState(t);
  const second = seg(t, SECOND, SECOND + 0.6);
  const frameAlpha = alpha * (t < SECOND ? 1 - seg(t, SECOND - 0.5, SECOND) : second) * (1 - 0.6 * cloud);
  drawHalo(ctx, cam, X, 4, SCORE_P, { alpha: alpha * (1 - 0.6 * cloud) });
  drawMol(ctx, X, cam, PEROXIDE_MOL, { opacity: alpha });
  for (const i of anchors) {
    const p = cam.project(at(X, i));
    ring(ctx, p.x, p.y, 0.3 * cam.scale, VERTICAL, frameAlpha, 2);
  }
  drawFrame(ctx, cam, at(X, anchors[0]), frameOf(X, anchors), 0.6, { alpha: frameAlpha });

  const names = t < SECOND ? 'O1, O2, H1' : 'O2, O1, H2';
  text(ctx, 'shortcut: write peroxide in a frame from its own atoms', 60, 214, { ...NOTE, color: color.ink, alpha: alpha * (1 - cloud) });
  text(ctx, `anchors ${names} (gold rings), frame by Gram–Schmidt`, 60, 244, { ...type.note, color: VERTICAL, alpha: frameAlpha * (1 - cloud) });
  const h = t < SECOND ? 'H1–O1–O2' : 'O1–O2–H2';
  text(ctx, `angle ${h} ${(angle / DEG).toFixed(1)}°${coneOn ? ` · e₂ has turned ${swing.toFixed(0)}°` : ''}`, 60, 730, { ...MONO, alpha: alpha * seg(t, DRIVE[0], DRIVE[0] + 0.5) * (1 - cloud) });
  text(ctx, 'this frame breaks where its three anchors line up (an illustration)', 60, 762, { ...NOTE, color: VERTICAL, alpha: alpha * fade(t, CONE[0], CONE[0] + 0.8, SECOND - 0.4, SECOND) });
  text(ctx, 'H1 circles a 0.4° cone (radius 0.007 Å): the frame swings a full turn', 60, 792, { ...type.note, alpha: alpha * fade(t, CONE[0] + 0.5, CONE[0] + 1.3, SECOND - 0.4, SECOND) });
  wrap(ctx, 'another choice breaks elsewhere: no frame covers every shape (R9a)', 60, 762, 740, 26, { ...NOTE, color: VERTICAL, alpha: alpha * seg(t, DRIVE2[0] + 0.8, DRIVE2[0] + 1.6) * (1 - cloud) });
  text(ctx, 'high noise visits every shape: 30 peroxides at σ = 1 Å', 420, 820, { ...NOTE, align: 'center', alpha: cloud });

  drawWaterInset(ctx, t, alpha * (1 - seg(t, CLOUD[0] - 0.4, CLOUD[0])));
}

/** A water's bisector frame: three atoms that never line up here, so the frame always exists. */
function drawWaterInset(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const cam = camera({ cx: 740, cy: 360, scale: 90, yaw: 0.35, pitch: -0.3, focal: 12 });
  const X = buildWater(WATER.r0, WATER.r0, WATER.theta0 + 10 * DEG * Math.sin(1.3 * (t - FRAME)));
  const O = at(X, 0), H1 = at(X, 1), H2 = at(X, 2);
  const e1 = vec3.normalize(vec3.sub(vec3.scale(vec3.add(H1, H2), 0.5), O));
  const e3 = vec3.normalize(vec3.cross(vec3.sub(H1, O), vec3.sub(H2, O)));
  const e2 = vec3.cross(e3, e1);
  drawHalo(ctx, cam, X, 3, SCORE_W, { alpha });
  drawMol(ctx, X, cam, WATER_MOL, { opacity: alpha });
  drawFrame(ctx, cam, O, [0, 1, 2].map((r) => [e1[r], e2[r], e3[r]]), 0.6, { alpha });
  text(ctx, '3 atoms, never collinear here:', 830, 270, { ...type.note, align: 'right', alpha });
  text(ctx, 'a frame exists', 830, 292, { ...type.note, align: 'right', alpha });
}

/** Two identical waters trade places along a circle; the label 'the left one' must jump. */
function drawExchange(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  // low enough that the gold tag over the upper water stays 30 px clear of the captions at 214–244
  const cam = camera({ cx: 420, cy: 550, scale: 80, yaw: 0.2, pitch: -0.2, focal: 12 });
  const R0 = rotation.axisAngle(vec3.normalize([1, 0.4, 0.2]), -0.5);
  const W0 = buildWater();
  const body = [0, 1, 2].flatMap((i) => rotation.apply(R0, at(W0, i)));
  const s = seg(t, ...PATH), angle = Math.PI * s;
  const pos = [[-1.8 * Math.cos(angle), -1.8 * Math.sin(angle), 0], [1.8 * Math.cos(angle), 1.8 * Math.sin(angle), 0]];
  const X = pos.flatMap((c) => [0, 1, 2].flatMap((i) => vec3.add(c, at(body, i))));

  const circle = Array.from({ length: 73 }, (_, k) => [1.8 * Math.cos((k * Math.PI) / 36), 1.8 * Math.sin((k * Math.PI) / 36), 0]);
  polyline3(ctx, cam, circle, { color: color.muted, width: 1.5, dash: [5, 6], alpha: 0.6 * alpha });
  drawHalo(ctx, cam, X, 3, SCORE_W, { alpha });
  drawHalo(ctx, cam, X, [3, 6], SCORE_W, { alpha });
  drawMol(ctx, X, cam, DIMER_MOL, { opacity: alpha });
  pos.forEach((c, k) => {
    const p = cam.project(vec3.add(c, [0, -1.0, 0]));
    text(ctx, k ? 'b' : 'a', p.x, p.y + 6, { font: font.display, italic: true, size: 22, color: SCORE_W, align: 'center', alpha });
  });

  // the rule '1 = the left one': it sits on whichever water has the smaller x, and jumps at 90°
  const left = Math.cos(angle) >= 0 ? 0 : 1;
  const top = cam.project(vec3.add(pos[left], [0, 1.15, 0]));
  const blink = s > 0.44 && s < 0.56 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * 6 * (s - 0.44) / 0.12) : 1;
  goldTag(ctx, '1 = the left one', top.x, Math.max(290, top.y - 20), alpha * seg(t, SWAP + 0.8, SWAP + 1.5) * blink);

  text(ctx, 'two identical waters trade places; orientations kept', 60, 214, { ...NOTE, color: color.ink, alpha });
  text(ctx, `turned ${(180 * s).toFixed(0)}° about the midpoint`, 60, 244, { ...type.note, alpha });
  const end = alpha * seg(t, PATH[1] + 0.2, PATH[1] + 0.9);
  text(ctx, 'same picture at the end, labels swapped', 60, 790, { ...NOTE, color: color.ink, alpha: end });
  text(ctx, 'no continuous labelling (R9b) → φ invariant under swaps (Sₙ)', 60, 822, { ...NOTE, color: VERTICAL, alpha: end * seg(t, PATH[1] + 0.9, PATH[1] + 1.6) });
}

/** A filled gold pill centred on (x, y). */
function goldTag(ctx, label, x, y, alpha) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.font = `500 15px ${font.mono}`;
  const w = ctx.measureText(label).width + 24;
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.bg;
  roundRect(ctx, x - w / 2, y - 14, w, 28, 14);
  ctx.fill();
  ctx.fillStyle = rgba(VERTICAL, 0.18);
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - w / 2, y - 14, w, 28, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  text(ctx, label, x, y + 1, { font: font.mono, size: 15, weight: 500, color: VERTICAL, align: 'center', baseline: 'middle', alpha });
}

/** The physics is mirror-blind (Z_pose on the floor; the two hands of the dipeptide); the data are not. */
function drawMirror(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  // the floor of the master diagram, coloured by Z_pose, with its mirror line τ = 0
  drawFloor(ctx, THUMB, { density: FLOOR_Z, alpha, caption: false });
  const mirrorLine = alpha * seg(t, MIRROR + 1, MIRROR + 1.8);
  polyline3(ctx, THUMB, [diagPoint(0, toB(0), 0), diagPoint(1, toB(0), 0)], { color: VERTICAL, width: 2.5, dash: [7, 5], alpha: mirrorLine });
  const pairs = alpha * seg(t, MIRROR + 2, MIRROR + 2.8);
  for (const { theta, tau } of zPoseGrid.mirror) {
    const p = THUMB.project(diagPoint(toA(theta), toB(tau), 0)), q = THUMB.project(diagPoint(toA(theta), toB(-tau), 0));
    line(ctx, p.x, p.y, q.x, q.y, { color: VERTICAL, width: 1.2, dash: [3, 4], alpha: 0.7 * pairs });
    ring(ctx, p.x, p.y, 4, VERTICAL, pairs, 2);
    ring(ctx, q.x, q.y, 4, VERTICAL, pairs, 2);
  }
  // minimal axis labels: θ across, τ into the page, and the mirror line
  const edge = (a, b, dx, dy) => { const p = THUMB.project(diagPoint(a, b, 0)); return [p.x + dx, p.y + dy]; };
  text(ctx, 'θ (water)', ...edge(0.5, 0, 24, 36), { ...type.note, color: SCORE_W, align: 'center', alpha });
  text(ctx, 'τ (peroxide)', ...edge(0, 0.5, -18, 18), { ...type.note, color: SCORE_P, align: 'right', alpha });
  text(ctx, 'τ = 0', ...edge(1, toB(0), 12, 4), { ...type.note, color: VERTICAL, alpha: mirrorLine });
  text(ctx, 'Z_pose(θ, −τ) = Z_pose(θ, τ)', 470, 262, { ...MONO, alpha });
  wrap(ctx, 'reflecting through water’s plane maps τ to −τ; the physics is mirror-blind', 470, 296, 340, 22, { ...type.note, color: color.body, alpha });
  // data.js throws unless all 5 are within 3 s.e. (the fit itself is mirror-symmetric by construction)
  wrap(ctx, 'checked at 5 mirror pairs (gold rings): all within 3 s.e.', 470, 384, 340, 22, { ...type.note, color: VERTICAL, alpha: pairs });

  // the dipeptide and its mirror image; the mirror plane between them in painter's order
  const cam = camera({ cx: 440, cy: 640, scale: 42, yaw: 0.1, pitch: -0.15, focal: 30 });
  const ghostD = alpha * seg(t, MIRROR + 1, MIRROR + 2);
  const solidD = alpha * fade(t, MIRROR + 2.5, MIRROR + 3.5, DATA + 0.5, DATA + 1.5);
  const dashedD = alpha * seg(t, DATA + 0.5, DATA + 1.5);
  drawMol(ctx, L_POS, cam, ALA2_MOL, { opacity: alpha });
  const plane = [[0, -2.6, -2.8], [0, 2.6, -2.8], [0, 2.6, 2.8], [0, -2.6, 2.8]];
  polygon3(ctx, cam, plane, { fill: rgba(VERTICAL, 0.06), stroke: VERTICAL, width: 1.5, alpha: alpha * 0.8 });
  if (solidD < 0.99) {
    ctx.save();
    if (t > DATA) ctx.setLineDash([5, 5]);
    drawMol(ctx, D_POS, cam, ALA2_MOL, { ghost: color.muted, opacity: Math.max(ghostD * (1 - solidD) * (t < DATA ? 1 : 0), dashedD) });
    ctx.restore();
  }
  drawMol(ctx, D_POS, cam, ALA2_MOL, { opacity: solidD });
  for (const [X, a] of [[L_POS, alpha], [D_POS, Math.max(solidD, 0.5 * ghostD * (1 - dashedD))]]) {
    const p = cam.project(at(X, 4));
    ring(ctx, p.x, p.y, 17, VERTICAL, a * seg(t, MIRROR + 3.5, MIRROR + 4.3), 2);
  }
  const lc = cam.project([-GAP, -2.6, 0]), dc = cam.project([GAP, -2.6, 0]);
  text(ctx, 'L: left hand', lc.x, 812, { ...NOTE, color: color.ink, align: 'center', alpha });
  text(ctx, 'D: its mirror image', dc.x, 812, { ...NOTE, color: color.ink, align: 'center', alpha: ghostD * (1 - seg(t, DATA + 0.3, DATA + 0.9)) });
  text(ctx, 'mirror', cam.project([0, 2.6, 2.8]).x, cam.project([0, 2.6, 2.8]).y - 12, { ...type.note, color: VERTICAL, align: 'center', alpha });

  // the data: only the left hand
  const cross = dashedD * seg(t, DATA + 1.2, DATA + 2);
  if (cross > 0) {
    const c = cam.project([GAP, 0, 0]);
    line(ctx, c.x - 90, c.y - 90, c.x + 90, c.y + 90, { color: color.muted, width: 4, alpha: cross });
    line(ctx, c.x - 90, c.y + 90, c.x + 90, c.y - 90, { color: color.muted, width: 4, alpha: cross });
  }
  text(ctx, 'the data: only the left hand', dc.x, 812, { ...NOTE, color: color.muted, align: 'center', alpha: alpha * seg(t, DATA + 0.9, DATA + 1.5) });
}

/** Readouts, chip rows and the card on the right during the mirror beat. */
function drawMirrorNotes(ctx, t) {
  const a1 = seg(t, MIRROR + 3.5, MIRROR + 4.3), a2 = seg(t, MIRROR + 5.5, MIRROR + 6.3);
  text(ctx, `signed volume at Cα: ${signed(chirality.volumeL)} Å³ → ${signed(chirality.volumeD)} Å³`, RIGHT, 300, { ...MONO, alpha: a1 });
  text(ctx, `all 45 distances: identical (max difference ${chirality.maxDistance.toFixed(3)})`, RIGHT, 330, { ...MONO, alpha: a2 });
  chip(ctx, 'U_int: mirror-blind (physics)', RIGHT, 380, INTER, seg(t, MIRROR + 7, MIRROR + 7.8));
  chip(ctx, 'monomer model blind to mirrors: makes both hands', RIGHT, 420, color.body, seg(t, DATA + 4.5, DATA + 5.3));
  const third = seg(t, NOISY + 4, NOISY + 4.8);
  chip(ctx, 'W_t at finite noise: inherits the data’s hand', RIGHT, 460, INTER, third);
  chip(ctx, 't → 0: the mirror-blind force field', RIGHT, 498, INTER, seg(t, NOISY + 8, NOISY + 8.8));
  tagCard(ctx, {
    x: RIGHT, y: 532, width: 660, tag: 'SO(3), NOT O(3)', accent: VERTICAL,
    body: 'an O(3)-invariant monomer model of an enantiopure molecule makes the racemate (R10a); W_t averages over the one-handed reference cloud, so φ needs features that see the hand (follows from I1).',
    alpha: seg(t, NOISY + 9.5, NOISY + 10.3), progress: lin(t, NOISY + 9.8, NOISY + 13.5),
  });
}

/** The growing list of symmetries φ must have (bottom of the notes area). */
function drawChips(ctx, t) {
  const old = 1 - seg(t, FINAL, FINAL + 0.5);
  let x = RIGHT;
  x += chip(ctx, 'rigid motions (SE(3)): yes', x, 820, VERTICAL, seg(t, 15.5, 16.3) * old) + 14;
  chip(ctx, 'swaps of identical molecules: yes', x, 820, VERTICAL, seg(t, SWAP + 1.5, SWAP + 2.3) * old);
  const now = seg(t, FINAL + 0.5, FINAL + 1.1);
  x = RIGHT;
  x += chip(ctx, 'SE(3): yes', x, 820, VERTICAL, now) + 14;
  x += chip(ctx, 'swaps of identical molecules: yes', x, 820, VERTICAL, now) + 14;
  chip(ctx, 'mirrors: no', x, 820, color.body, now);
}

/** A rounded chip with its left end at x, vertically centred on y. Returns its width. */
function chip(ctx, label, x, y, tint, alpha) {
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const w = ctx.measureText(label).width + 24;
  if (alpha > 0.003) {
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = rgba(tint, 0.12);
    roundRect(ctx, x, y - 14, w, 28, 14);
    ctx.fill();
    ctx.stroke();
    text(ctx, label, x + 12, y + 1, { font: font.mono, size: 15, color: tint, baseline: 'middle' });
  }
  ctx.restore();
  return w;
}
