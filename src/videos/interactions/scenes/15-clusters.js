import { defineScene, seg, fade, text, type, font, color, tex, camera, arrow, polyline3, vec3 } from '../../../kit.js';
import { VERTICAL, POSE, SCORE_W, SCORE_P, INTER, RESTRAINT, TRIMER_MOL, WATER_MOL, PEROXIDE_MOL, drawMol, drawHalo, drawHBond, drawGaugeFlag, drawRestraint, equationStrip, moleculeThumb, readout, tagCard, toyStamp } from '../shared.js';
import { TRIMER, clusterChecks } from '../data.js';
import { centroid, join } from '../toy.js';

const { XA, XB, XC, X: XT } = TRIMER;
const { lever, composition, closure } = clusterChecks;
const MID = centroid(XT, 10); // the cluster's plain centroid (equal noise on every atom)
const CENTRES = [centroid(XA), centroid(XB), centroid(XC)];
const RIGHT = 860;
const YAW = 2.775, PITCH = -0.5; // seen from above; the trimer turns slowly through ±10°
const cameraAt = (t) => camera({ cx: 430, cy: 530, scale: 48, yaw: YAW - 0.175 + (0.35 * t) / 62, pitch: PITCH, focal: 14, center: MID });

// beats (scene-local seconds), keyed to the cue starts 0, 11, 24, 36, 46
const ROOT = 11, ION = 24, LEVER = 28.5, BETTER = 36, SPRINGS = 39.5, FORMULA = 41.5, TRIANGLE = 46, IDENTITY = 53;

// pose graph (right column, y 210–480): node centres, thumbnails and tints
const NODES = { A: [1020, 425], B: [1180, 248], C: [1340, 425] };
const NODE_X = { A: XA, B: XB, C: XC };
const NODE_TINT = { A: SCORE_W, B: SCORE_P, C: SCORE_W };

const ROOT_SPACE = tex(String.raw`P_A\times_{SO(3)}\mathbb R^{3(N-N_A)}`, 'P_A ×_SO(3) ℝ^{3(N − N_A)}');
const BASE = tex(String.raw`M_A\times M_B\times M_C`, 'M_A × M_B × M_C');
const PHI_NOTE = tex(String.raw`\varphi\ \text{invariant under}\ SE(3)\ \text{and}\ A\leftrightarrow C`, 'φ invariant under SE(3) and A ↔ C');
const AXIS = { A: tex(String.raw`\theta_A`, 'θ_A'), B: tex(String.raw`\tau_B`, 'τ_B'), C: tex(String.raw`\theta_C`, 'θ_C') };
const LOOP = tex(String.raw`g_{AB}\,g_{BC}\,g_{CA} = \mathrm{identity}`, 'g_AB g_BC g_CA = identity');
const EDGE = { AB: tex('g_{AB}', 'g_AB'), BC: tex('g_{BC}', 'g_BC'), CA: tex('g_{CA}', 'g_CA') };
const SCORE = [
  { part: tex(String.raw`\nabla\log p_t`, '∇log pₜ') },
  { part: tex('=', '=') },
  { part: tex('s_W(x_A)', 's_W(x_A)'), colour: SCORE_W, label: 'frozen' },
  { part: tex('+', '+') },
  { part: tex('s_P(x_B)', 's_P(x_B)'), colour: SCORE_P, label: 'frozen' },
  { part: tex('+', '+') },
  { part: tex('s_W(x_C)', 's_W(x_C)'), colour: SCORE_W, label: 'frozen' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla\log\rho_t`, '∇log ρₜ'), colour: RESTRAINT, label: 'analytic' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla_z\varphi(z,t)`, '∇_z φ(z, t)'), colour: INTER, label: 'learned' },
];

const at = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const fmt = (v, d = 3) => v.toFixed(d);

export default defineScene({
  name: 'Clusters',
  duration: 62,
  narration: [
    [0, 'Add a second water, C. The floor gains an axis, and the fibre grows: three turns, two arrows, minus one common turn: twelve dimensions.'],
    [11, 'We could look at everything from water A. That is correct, but it is a gauge, and a bad one. It singles out one of two identical waters.'],
    [24, 'It cannot root an ion or a linear molecule. And a small error in A\'s view moves C, which A never touches, by a lever arm.'],
    [36, 'Better: give every molecule its own bundle, pull each centre towards the cluster\'s centre, and use one energy over all atoms.'],
    [46, 'A model that predicts each pair\'s relative pose separately can contradict itself around a triangle. One energy over all atoms cannot: every relative pose is read off the same atoms.'],
  ],
  header: { eyebrow: '15 · CLUSTERS', title: 'A third molecule, and no favourite' },

  draw(ctx, t) {
    drawTrimer(ctx, t);
    drawShapeAxes(ctx, t);
    drawPoseGraph(ctx, t);
    drawNotes(ctx, t);
    toyStamp(ctx, seg(t, 0.5, 1.5));
  },
});

// ---- left: the trimer -------------------------------------------------------------------------

function drawTrimer(ctx, t) {
  const cam = cameraAt(t);
  const a = seg(t, 0.5, 1.5);
  const c = seg(t, 0.8, 2.2); // water C arrives
  const slide = vec3.scale(vec3.normalize(vec3.sub(CENTRES[2], CENTRES[1])), 1.5 * (1 - c));
  const X = join(XA, XB, Array.from(XC, (v, i) => v + slide[i % 3]));
  const root = fade(t, ROOT + 0.5, ROOT + 1.3, BETTER, BETTER + 0.8);
  const rings = seg(t, BETTER + 1, BETTER + 2.2);
  const springs = seg(t, SPRINGS, SPRINGS + 1.2);
  const { lever: leverGhost, composed } = ghosts(t);

  globalTurn(ctx, a);
  for (let k = 0; k < 3; k++) ownRing(ctx, cam, CENTRES[k], 'back', rings);
  drawGhosts(ctx, cam, t);
  // the khaki restraint, drawn behind the atoms: each centre towards the cluster's centroid
  const m = cam.project(MID);
  if (springs > 0.003) for (const p of CENTRES) drawRestraint(ctx, cam.project(p), m, { alpha: springs, toothPx: 11 });
  drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha: a });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha: a });
  drawHalo(ctx, cam, X, [7, 10], SCORE_W, { alpha: c });
  drawMol(ctx, X, cam, TRIMER_MOL, { opacity: a, atomAlpha: [1, 1, 1, 1, 1, 1, 1, c, c, c] });
  hbonds(ctx, cam, X, a, c * (1 - leverGhost), false);
  for (let k = 0; k < 3; k++) ownRing(ctx, cam, CENTRES[k], 'front', rings);

  if (springs > 0.003) {
    text(ctx, 'cluster centre', m.x + 52, m.y + 5, { ...type.note, color: RESTRAINT, alpha: fade(t, SPRINGS, SPRINGS + 1.2, TRIANGLE, TRIANGLE + 0.8) }); // gone before the lens
    for (const [p, r] of [...CENTRES.map((q) => [cam.project(q), 4]), [m, 6]]) {
      ctx.save();
      ctx.globalAlpha *= springs;
      ctx.fillStyle = RESTRAINT;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  }

  // root view: A's flag, and teal arrows c_A → c_B, c_A → c_C (dimmed while the lever arm is shown)
  if (root > 0.003) {
    drawGaugeFlag(ctx, cam, vec3.add(CENTRES[0], [0, 0.9, 0]), { label: 'root', alpha: root });
    const grow = seg(t, ROOT + 1, ROOT + 2.2), dim = 1 - 0.6 * leverGhost;
    for (const k of [1, 2]) {
      const p = cam.project(CENTRES[0]), q = cam.project(CENTRES[k]);
      const e = grow * (1 - 12 / Math.hypot(q.x - p.x, q.y - p.y));
      const x2 = p.x + (q.x - p.x) * e, y2 = p.y + (q.y - p.y) * e, alpha = root * dim * Math.min(1, 3 * grow);
      arrow(ctx, p.x, p.y, x2, y2, { color: '#05080f', width: 6, head: 17, alpha: 0.8 * alpha });
      arrow(ctx, p.x, p.y, x2, y2, { color: POSE, width: 3.5, head: 14, alpha });
    }
  }

  const labels = [['A · water', SCORE_W, a], ['B · peroxide', SCORE_P, a], ['C · water', SCORE_W, c]];
  labels.forEach(([s, tint, alpha], k) => {
    const p = cam.project(CENTRES[k]);
    text(ctx, s, p.x - 100, p.y + 8, { font: font.display, italic: true, size: 24, color: tint, align: 'right', alpha });
  });
  magnifier(ctx, t, Math.max(leverGhost, composed));
}

/** Opacities of the two ghost beats: C′ after a 3° error in A's view (24–36); C placed twice (46–53). */
const ghosts = (t) => ({
  lever: fade(t, LEVER + 0.5, LEVER + 1.5, BETTER, BETTER + 0.8),
  composed: fade(t, TRIANGLE + 1, TRIANGLE + 2.2, IDENTITY, IDENTITY + 1),
  turn: seg(t, LEVER + 0.5, LEVER + 2),
});
const turnedC = (s) => Array.from(XC, (v, i) => v + (lever.XC[i] - v) * s);

function drawGhosts(ctx, cam, t) {
  const g = ghosts(t);
  if (g.lever > 0.003) drawMol(ctx, turnedC(g.turn), cam, WATER_MOL, { ghost: SCORE_W, opacity: 0.9 * g.lever });
  if (g.composed > 0.003) for (const Y of [composition.viaA, composition.viaB]) drawMol(ctx, Y, cam, WATER_MOL, { ghost: SCORE_W, opacity: 0.95 * g.composed });
}

/** The two hydrogen bonds (peroxide donates to A and to C); X in TRIMER_MOL order. */
function hbonds(ctx, cam, X, alphaAB, alphaCB, label) {
  const { AB, CB } = TRIMER.hbonds; // TRIMER_MOL numbering
  drawHBond(ctx, cam, at(X, AB.h), at(X, AB.o), { alpha: 0.8 * alphaAB, label });
  drawHBond(ctx, cam, at(X, CB.h), at(X, CB.o), { alpha: 0.8 * alphaCB, label });
}

/** A magnifier on water C (×2.6) for the lever arm and the composed ghosts, with a leader from C. */
const LENS = { x: 670, y: 420, r: 118, scale: 125, atoms: 0.42 };
const LENS_CENTRE = vec3.add(CENTRES[2], vec3.scale(vec3.sub(at(XB, TRIMER.hbonds.CB.h - 3), CENTRES[2]), 0.2)); // C, towards the H it accepts
function magnifier(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const g = ghosts(t);
  const main = cameraAt(t).project(CENTRES[2]);
  const { x, y, r } = LENS;
  const L = Math.hypot(x - main.x, y - main.y), ux = (x - main.x) / L, uy = (y - main.y) / L;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = color.muted;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(main.x + 26 * ux, main.y + 26 * uy);
  ctx.lineTo(x - r * ux, y - r * uy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color.panel;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.clip();
  const base = cameraAt(t);
  const cam = camera({ yaw: base.yaw, pitch: base.pitch, cx: x, cy: y, scale: LENS.scale, focal: 40, center: LENS_CENTRE });
  const small = { atomScale: LENS.atoms };
  const X = join(XA, XB, XC);
  if (g.lever > 0.003) {
    const C2 = turnedC(g.turn);
    drawMol(ctx, X, cam, TRIMER_MOL, { ...small, atomAlpha: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1] }); // the lens alpha is on the context
    drawMol(ctx, C2, cam, WATER_MOL, { ...small, ghost: SCORE_W, opacity: g.lever });
    const Z = join(XA, XB, C2), hb = TRIMER.hbonds.CB;
    hbonds(ctx, cam, X, 0, 0.6, false);
    drawHBond(ctx, cam, at(Z, hb.h), at(Z, hb.o), { alpha: g.lever, label: false });
    pairLabels(ctx, cam, [XC, C2], ['C', 'C′'], g.lever);
  }
  if (g.composed > 0.003) {
    drawMol(ctx, X, cam, TRIMER_MOL, { ...small, atomAlpha: [0, 0, 0, 1, 1, 1, 1, 0.35, 0.35, 0.35] });
    [composition.viaA, composition.viaB].forEach((Y) => drawMol(ctx, Y, cam, WATER_MOL, { ...small, ghost: SCORE_W, opacity: g.composed }));
    pairLabels(ctx, cam, [composition.viaA, composition.viaB], ['via A', 'via B'], g.composed);
  }
  ctx.restore();
  const title = (s, alpha2) => text(ctx, s, x, y - r - 16, { ...type.note, color: color.body, align: 'center', alpha: alpha * alpha2 });
  title('C after a 3° error in A’s view', g.lever);
  if (g.composed > 0.003) {
    text(ctx, 'pose-by-pose predictions', x, y - r - 38, { ...type.note, color: color.ink, align: 'center', alpha: g.composed });
    text(ctx, '(e.g. separate docking): C placed twice', x, y - r - 16, { ...type.note, color: color.body, align: 'center', alpha: g.composed });
  }
}

/** Names over the oxygens of two waters, outward: the left one right-aligned, the right one left-aligned. */
function pairLabels(ctx, cam, Ys, names, alpha) {
  const O = Ys.map((Y) => cam.project(at(Y, 0)));
  const left = O[0].x <= O[1].x ? 0 : 1;
  names.forEach((s, k) => {
    const out = k === left ? -1 : 1;
    text(ctx, s, O[k].x + 16 * out, O[k].y - 18, { font: font.mono, size: 16, color: SCORE_W, align: out < 0 ? 'right' : 'left', alpha });
  });
}

/** Gold arc under the trimer: its front half, moving left as the camera's yaw grows (a global turn). */
function globalTurn(ctx, alpha) {
  if (alpha <= 0.003) return;
  const cx = 430, cy = 728, rx = 190, ry = 22, from = 0.2, to = Math.PI - 0.2;
  ctx.save();
  ctx.globalAlpha *= 0.75 * alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, from, to);
  ctx.stroke();
  ctx.restore();
  const end = (phi) => [cx + rx * Math.cos(phi), cy + ry * Math.sin(phi)];
  const [x1, y1] = end(to - 0.12), [x2, y2] = end(to);
  arrow(ctx, x1, y1, x2, y2, { color: VERTICAL, width: 2.5, head: 12, alpha: 0.75 * alpha });
  text(ctx, 'the whole cluster turning: nothing changes', cx, cy + ry + 26, { ...type.note, color: VERTICAL, align: 'center', alpha: 0.85 * alpha });
}

/** Each molecule's own torsor ring (gold, horizontal, radius 1.15 Å), split so atoms sit inside it. */
function ownRing(ctx, cam, c, half, alpha) {
  if (alpha <= 0.003) return;
  const point = (phi) => vec3.add(c, [1.15 * Math.cos(phi), 0, 1.15 * Math.sin(phi)]);
  const ring = Array.from({ length: 73 }, (_, k) => point((2 * Math.PI * k) / 72));
  const zc = cam.project(c).z;
  let run = [];
  const flush = () => {
    if (run.length > 1) polyline3(ctx, cam, run, { color: VERTICAL, width: 2.5, alpha: 0.8 * alpha });
    run = [];
  };
  for (const p of ring) {
    const behind = cam.project(p).z > zc;
    if (behind === (half === 'back')) run.push(p);
    else flush();
  }
  flush();
}


// ---- under the trimer: the floor's three axes ----------------------------------------------------

function drawShapeAxes(ctx, t) {
  const a = seg(t, 0.5, 1.5), c = seg(t, 2.6, 3.6);
  const y = 830;
  BASE.draw(ctx, 60, y, { size: 24, alpha: a });
  const axes = [[AXIS.A, SCORE_W, a], [AXIS.B, SCORE_P, a], [AXIS.C, SCORE_W, c]];
  axes.forEach(([label, tint, alpha], k) => {
    const x0 = 290 + 165 * k;
    arrow(ctx, x0, y, x0 + 120, y, { color: tint, width: 2.5, head: 10, alpha });
    for (const dx of [20, 50, 80]) tick(ctx, x0 + dx, y, tint, alpha);
    label.draw(ctx, x0 + 60, y - 22, { size: 22, align: 'center', alpha });
  });
  text(ctx, 'the floor: each molecule’s own shape (one number drawn for each)', 60, y + 36, { ...type.note, alpha: Math.min(a, c) });
}

function tick(ctx, x, y, tint, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = tint;
  ctx.fillRect(x - 1, y - 5, 2, 10);
  ctx.restore();
}

// ---- right: the pose graph -----------------------------------------------------------------------

function drawPoseGraph(ctx, t) {
  const show = { A: seg(t, 0.5, 1.5), B: seg(t, 0.5, 1.5), C: seg(t, 0.8, 2.2) };
  const rings = seg(t, 6, 6.8), edges = seg(t, 7, 7.8);
  const root = fade(t, ROOT + 0.5, ROOT + 1.3, BETTER, BETTER + 0.8);
  const perturbed = fade(t, TRIANGLE + 1, TRIANGLE + 2.2, IDENTITY, IDENTITY + 1);
  const labels = seg(t, TRIANGLE + 0.5, TRIANGLE + 1.5);

  // edges: teal; A's two become arrows in the root view, B–C fades; dashed while each pose is 3° off
  const edge = (i, j, { alpha, head }) => {
    line(i, j, { alpha: alpha * (1 - perturbed), head, dash: undefined });
    line(i, j, { alpha: alpha * perturbed, head, dash: [8, 6] });
  };
  const line = (i, j, { alpha, head, dash }) => {
    const p = NODES[i], q = NODES[j];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L;
    const x1 = p[0] + 54 * ux, y1 = p[1] + 54 * uy, x2 = q[0] - 54 * ux, y2 = q[1] - 54 * uy;
    if (alpha <= 0.003) return;
    if (head > 0.01) arrow(ctx, x1, y1, x2, y2, { color: POSE, width: 3, head: 14 * head, alpha, dash });
    else {
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.strokeStyle = POSE;
      ctx.lineWidth = 3;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  };
  edge('A', 'B', { alpha: edges, head: root });
  edge('A', 'C', { alpha: edges, head: root });
  edge('B', 'C', { alpha: edges * (1 - 0.82 * root), head: 0 });

  // edge labels g_ij (46–62)
  if (labels > 0.003) {
    EDGE.AB.draw(ctx, 1066, 324, { size: 22, align: 'right', alpha: labels });
    EDGE.BC.draw(ctx, 1294, 324, { size: 22, alpha: labels });
    EDGE.CA.draw(ctx, 1180, 452, { size: 22, align: 'center', alpha: labels });
  }

  for (const k of ['A', 'B', 'C']) {
    const [x, y] = NODES[k];
    torsorRing(ctx, x, y, 'back', rings * show[k]);
    moleculeThumb(ctx, x, y, NODE_X[k], k === 'B' ? PEROXIDE_MOL : WATER_MOL, { scale: 28, yaw: YAW, pitch: PITCH, alpha: show[k] });
    torsorRing(ctx, x, y, 'front', rings * show[k]);
    const dx = k === 'A' ? -66 : 66;
    text(ctx, k, x + dx, y + 9, { font: font.display, italic: true, size: 28, color: NODE_TINT[k], align: k === 'A' ? 'right' : 'left', alpha: show[k] });
  }
  if (root > 0.003) {
    const [x, y] = NODES.A;
    flag2d(ctx, x - 6, y - 34, root);
  }

  // inside the triangle: '3° off' while perturbed, then the closed loop
  const [cx, cy] = [1180, 370];
  text(ctx, 'each pose 3° off', cx, cy + 5, { ...type.note, color: color.body, align: 'center', alpha: perturbed });
  const loop = seg(t, IDENTITY + 1, IDENTITY + 2); // after '3° off' has gone
  if (loop > 0.003) loopArrow(ctx, cx, cy, loop);
}

/** A gold orbit ellipse around a node; drawn in two halves so the thumbnail sits inside it. */
function torsorRing(ctx, x, y, half, alpha) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= 0.85 * alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (half === 'back') ctx.ellipse(x, y + 4, 50, 17, 0, Math.PI, 2 * Math.PI);
  else ctx.ellipse(x, y + 4, 50, 17, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

/** A small gold flag above a node (the root's reference). */
function flag2d(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = VERTICAL;
  ctx.fillStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - 36);
  ctx.lineTo(x + 22, y - 29);
  ctx.lineTo(x, y - 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A teal circular arrow inside the triangle: going round returns to the start. */
function loopArrow(ctx, cx, cy, alpha) {
  const r = 26, from = -Math.PI / 2 + 0.35, to = from + 2 * Math.PI - 0.7;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = POSE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, from, to);
  ctx.stroke();
  ctx.restore();
  const x2 = cx + r * Math.cos(to), y2 = cy + r * Math.sin(to);
  const tx = -Math.sin(to), ty = Math.cos(to); // clockwise tangent on screen
  arrow(ctx, x2 - 2 * tx, y2 - 2 * ty, x2 + 12 * tx, y2 + 12 * ty, { color: POSE, width: 3, head: 12, alpha });
}

// ---- right: notes, formulas, readouts, card ------------------------------------------------------

function drawNotes(ctx, t) {
  // 6–11.8: the fibre's dimension
  const count = (from) => fade(t, from, from + 0.6, ROOT + 0.2, ROOT + 1);
  const big = { font: font.sans, size: 22 };
  let x = RIGHT;
  for (const [s, tint, from] of [['3 turns', VERTICAL, 6], [' + 2 arrows', POSE, 7], [' − 1 common turn', VERTICAL, 8]]) {
    text(ctx, s, x, 530, { ...big, color: tint, alpha: count(from) });
    x += measure(ctx, s, big);
  }
  text(ctx, '9 + 6 − 3 = 12 = 6(n − 1)', RIGHT, 572, { font: font.mono, size: 22, color: color.ink, alpha: count(9.2) });
  text(ctx, 'fibre dimension, n = 3 molecules', RIGHT, 602, { ...type.note, alpha: count(9.6) });

  // 11–36: the root view
  const rootA = fade(t, ROOT + 2, ROOT + 3, BETTER, BETTER + 0.8);
  text(ctx, 'everything as A sees it:', RIGHT, 527, { ...big, color: POSE, alpha: rootA });
  ROOT_SPACE.draw(ctx, RIGHT + measure(ctx, 'everything as A sees it:', big) + 14, 519, { size: 25, alpha: rootA });
  const icon = (s, y, from, glyph) => {
    const alpha = fade(t, from, from + 0.7, BETTER, BETTER + 0.8);
    glyph(ctx, RIGHT + 16, y - 6, alpha);
    text(ctx, s, RIGHT + 52, y, { ...type.body, size: 20, alpha });
  };
  icon('identical waters: S₂ broken', 585, 19.5, glyphWaters);
  icon('root needs 3 non-collinear atoms: never an ion or CO₂', 630, ION + 0.5, glyphAtoms);
  icon('lever arm: a small error at A moves C', 675, LEVER + 4, glyphLever);
  const lev = fade(t, LEVER + 2.2, LEVER + 3, BETTER, BETTER + 0.8);
  readout(ctx, 'C moved', `${fmt(lever.shift)} Å`, RIGHT + 52, 725, { colour: color.ink, alpha: lev });
  readout(ctx, 'C–B hydrogen bond:', `${fmt(lever.hbondBefore)} → ${fmt(lever.hbondAfter)} Å`, RIGHT + 52, 755, { colour: INTER, alpha: lev });

  // 36–62: one energy over all atoms
  const f = seg(t, FORMULA, FORMULA + 1);
  if (f > 0.003) equationStrip(ctx, RIGHT, 515, { terms: SCORE, size: 26, maxWidth: 660, gap: 0.3, padlocks: false, leadIn: false, alpha: f });
  PHI_NOTE.draw(ctx, RIGHT, 585, { size: 21, alpha: fade(t, FORMULA + 2, FORMULA + 2.8, TRIANGLE, TRIANGLE + 0.8) });
  text(ctx, 'every molecule its own ring: no root, no favourite', RIGHT, 627, { ...type.note, color: VERTICAL, alpha: fade(t, BETTER + 1.2, BETTER + 2, TRIANGLE, TRIANGLE + 0.8) });
  text(ctx, 'restraint: each centre towards the cluster’s centroid', RIGHT, 657, { ...type.note, color: RESTRAINT, alpha: fade(t, SPRINGS + 0.5, SPRINGS + 1.3, TRIANGLE, TRIANGLE + 0.8) });

  // 46–62: closure
  readout(ctx, 'pose-by-pose: closure error', `${fmt(composition.closureError, 2)} Å`, RIGHT, 590, { colour: color.ink, alpha: fade(t, TRIANGLE + 3, TRIANGLE + 4, IDENTITY, IDENTITY + 1) });
  const id = seg(t, IDENTITY + 1, IDENTITY + 2); // after the closure error has gone
  readout(ctx, 'the real trimer:', '', RIGHT, 590, { colour: color.body, alpha: id });
  LOOP.draw(ctx, RIGHT + 190, 583, { size: 22, alpha: id });
  readout(ctx, 'largest deviation', closure, RIGHT + 190 + LOOP.metrics(22).width + 18, 590, { colour: color.muted, size: 15, alpha: id });
  text(ctx, 'true by construction for any real configuration (the flatness lemma, R9c)', RIGHT, 626, { ...type.note, color: color.body, alpha: seg(t, IDENTITY + 1.5, IDENTITY + 2.5) });
  tagCard(ctx, {
    x: RIGHT, y: 680, width: 660, tag: 'ONE ENERGY', accent: POSE,
    body: 'every relative pose is read off the same atoms: consistent by construction (M5, R9c)',
    alpha: seg(t, 55.5, 56.3), progress: seg(t, 55.8, 58.5),
  });
}

const measure = (ctx, s, { font: f, size }) => {
  ctx.save();
  ctx.font = `400 ${size}px ${f}`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
};

/** The score for three molecules from separate parts, each coloured term underlined and labelled. */

// small icons for the root's problems
function glyphWaters(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = SCORE_W;
  for (const dx of [-9, 9]) {
    ctx.beginPath();
    ctx.arc(x + dx, y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = VERTICAL;
  ctx.fillRect(x - 10, y - 22, 2, 14);
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 22);
  ctx.lineTo(x + 2, y - 18);
  ctx.lineTo(x - 8, y - 14);
  ctx.fill();
  ctx.restore();
}

function glyphAtoms(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.muted;
  ctx.beginPath();
  ctx.arc(x - 12, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  for (const dx of [-2, 7, 16]) {
    ctx.beginPath();
    ctx.arc(x + dx, y, 3.5, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

function glyphLever(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.muted;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 6);
  ctx.lineTo(x + 18, y - 4);
  ctx.moveTo(x - 16, y + 6);
  ctx.lineTo(x + 18, y + 6);
  ctx.stroke();
  ctx.fillStyle = SCORE_W;
  ctx.beginPath();
  ctx.arc(x + 18, y - 4, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}
