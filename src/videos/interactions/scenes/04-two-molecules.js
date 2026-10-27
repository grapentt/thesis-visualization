import { defineScene, seg, fade, text, type, font, color, tex, camera, rotation, vec3, polyline3, arrow } from '../../../kit.js';
import { PAIR_MOL, PEROXIDE_MOL, SCORE_W, SCORE_P, INTER, POSE, VERTICAL, HORIZONTAL, drawMol, drawHalo, coordinateBar, toyStamp } from '../shared.js';
import { DOCKED, D_DOCK } from '../data.js';
import { DEG, WATER, PEROXIDE, buildWater, buildPeroxide, place, centroid, join, U_W, U_P, U_int } from '../toy.js';

// The pair: DOCKED's pose with peroxide's centre moved out to 4 Å from water's.
const R4 = vec3.scale(DOCKED.r, 4 / D_DOCK);
const C0 = centroid(join(DOCKED.XA, place(buildPeroxide(), DOCKED.R, R4))); // the pair's plain centroid
// The motions data.js's `invariance` guards: joint turn, peroxide's own turn and shift.
const JOINT_AXIS = [0.2, 1, 0.1], OWN_AXIS = [0.3, 0.2, 1];
const NOTES = 860;

const pointsOf = (X) => Array.from({ length: X.length / 3 }, (_, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
const turn = (X, R, c) => pointsOf(X).flatMap((p) => vec3.add(rotation.apply(R, vec3.sub(p, c)), c));

/** Water and peroxide at local time t: every motion is an explicit function of t. */
function pairAt(t) {
  const theta = WATER.theta0 + (114 * DEG - WATER.theta0) * (seg(t, 8, 9.9) - seg(t, 10, 11.9));
  const tau = PEROXIDE.tau0 + (20 * DEG - PEROXIDE.tau0) * (seg(t, 12.2, 14.1) - seg(t, 14.2, 16.1));
  // peroxide's own motion (17–25, again for the second quotient 36.5–42.5); the joint turn (0.8–7.2, again for the first 27–32.5)
  const own = seg(t, 17, 20.5) - seg(t, 21.5, 25) + seg(t, 36.5, 39) - seg(t, 40, 42.5);
  const joint = 1.0 * (seg(t, 0.8, 3.8) - seg(t, 4.3, 7.2)) + 0.8 * (seg(t, 27, 29.5) - seg(t, 30, 32.5));
  return pairWith(theta, tau, own, joint);
}

/** The pair at given shapes, peroxide's own motion and the joint turn. */
function pairWith(theta, tau, own, joint) {
  const XA = buildWater(WATER.r0, WATER.r0, theta);
  const XB0 = place(buildPeroxide({ tau }), DOCKED.R, R4);
  const XB = turn(XB0, rotation.axisAngle(OWN_AXIS, 1.2 * own), centroid(XB0)).map((v, k) => v + (k % 3 === 0 ? 0.8 * own : 0));
  const R = rotation.axisAngle(JOINT_AXIS, joint);
  return { XA: turn(XA, R, C0), XB: turn(XB, R, C0), XB0: turn(XB0, R, C0) };
}

/** The outermost gold copies of both orbit beats (see orbitGhosts): the labels keep clear of them. */
const ORBIT_EXTREMES = [-1, 1].flatMap((s) => [pairWith(WATER.theta0, PEROXIDE.tau0, 0, 0.8 * s), pairWith(WATER.theta0, PEROXIDE.tau0, s, 0)]);

// Guards on the motions as drawn: U_int flat under the joint turn, U_W and U_P under peroxide's own motion.
{
  const drift = (ts, f) => Math.max(...ts.map((s) => Math.abs(f(pairAt(s)) - f(pairAt(ts[0])))));
  const own = [17, 19, 20.5, 22, 25];
  const joint = drift([0.8, 2, 3.8, 5, 7.2], ({ XA, XB }) => U_int(XA, XB));
  const mono = Math.max(drift(own, ({ XA }) => U_W(XA)), drift(own, ({ XB }) => U_P(XB)));
  if (!(joint < 1e-10 && mono < 1e-10)) throw new Error(`scene 04: U_int drift ${joint} under the joint turn, U_W/U_P drift ${mono} under peroxide's own motion`);
}

const QUOTIENT_JOINT = tex(String.raw`\mathbb R^{21}/SE(3) = M_{AB}`, 'ℝ²¹/SE(3) = M_AB');
const QUOTIENT_OWN = tex(String.raw`\mathbb R^{21}/\big(SE(3)\times SE(3)\big) = M_A\times M_B`, 'ℝ²¹/(SE(3) × SE(3)) = M_A × M_B');
const FORGET = tex(String.raw`M_{AB}\ \xrightarrow{\ \pi\ }\ M_A\times M_B`, 'M_AB —π→ M_A × M_B');
const M_AB = tex(String.raw`M_{AB}`, 'M_AB'), M_A_M_B = tex(String.raw`M_A\times M_B`, 'M_A × M_B');
const LABELS = [tex('U_W', 'U_W'), tex('U_P', 'U_P'), tex(String.raw`U_{\rm int}`, 'U_int')];

const CELLS = [
  { n: 6, fill: VERTICAL, label: 'move both together' },
  { n: 3, fill: HORIZONTAL, border: SCORE_W, label: 'water’s own shape' },
  { n: 6, fill: HORIZONTAL, border: SCORE_P, label: 'peroxide’s own shape' },
  { n: 6, fill: POSE, label: 'relative pose' },
];

export default defineScene({
  name: 'Two molecules',
  duration: 55,
  narration: [
    [0, 'Now water and peroxide together: twenty-one coordinates. Moving the pair rigidly changes nothing: six of them.'],
    [7.5, 'Water’s own shape takes three. Peroxide’s takes six; its softest is the torsion, the twist about the oxygen–oxygen bond.'],
    [16.5, 'What is left, six numbers, says how peroxide is turned and where it sits relative to water: the relative pose.'],
    [26, 'Two symmetry groups make two quotients. Divide out moving both together, and you get the cluster’s shape: fifteen numbers.'],
    [35, 'Divide out moving each molecule on its own, and you get the two own shapes: nine numbers. Forgetting the relative pose maps the first onto the second.'],
    [47.5, 'Everything that forgets to the same two own shapes forms the fibre, next.'],
  ],
  header: { eyebrow: '04 · TWO MOLECULES', title: 'Moving together, moving apart' },

  draw(ctx, t) {
    const a = seg(t, 0.5, 1.5);
    const cam = camera({ cx: 400, cy: 540, scale: 72, yaw: 2.5, pitch: -0.4, focal: 14, center: C0 });
    const { XA, XB, XB0 } = pairAt(t);
    const X = join(XA, XB);

    // the coordinate bar: which group of the 21 numbers is moving (or, later, which the formulas keep)
    const beat = (from, to) => fade(t, from, from + 0.6, to - 0.6, to) * (0.65 + 0.35 * Math.sin((2 * Math.PI * t) / 1.1));
    const pulses = [beat(0.6, 7.4), beat(7.7, 12), beat(12, 16.4), beat(16.6, 25.8)];
    const group = pulses.indexOf(Math.max(...pulses));
    const kept = [fade(t, 26.3, 27.3, 34.6, 35.2), fade(t, 35.2, 36.2, 47.2, 47.8), fade(t, 47.8, 48.8)];
    const dims = [Math.max(...kept), kept[2], kept[2], kept[1]];
    const cells = CELLS.map((c, i) => ({ ...c, dim: 0.8 * dims[i] }));
    coordinateBar(ctx, 80, 210, 1428, cells, { pulse: { group, amount: pulses[group] }, alpha: a });

    // the pair: water rose, peroxide lime; peroxide's start pose as a ghost while it moves on its own
    const ghost = 0.45 * fade(t, 17, 17.8, 25, 25.8);
    if (ghost > 0.003) drawMol(ctx, XB0, cam, PEROXIDE_MOL, { ghost: color.muted, opacity: ghost });
    drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha: a });
    drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha: a });
    drawMol(ctx, X, cam, PAIR_MOL, { opacity: a });
    // each name sits left of its molecule's leftmost atom and of the gold orbit copies, so it touches neither
    const label = (s, Y, tint, extremes) => {
      const left = Math.min(...[Y, ...extremes].flatMap(pointsOf).map((p) => cam.project(p).x));
      text(ctx, s, left - 36, cam.project(centroid(Y)).y + 8, { font: font.display, italic: true, size: 26, align: 'right', color: tint, alpha: a });
    };
    label('water', XA, SCORE_W, ORBIT_EXTREMES.map((e) => e.XA));
    label('peroxide', XB, SCORE_P, [...ORBIT_EXTREMES.map((e) => e.XB), XB0]);
    jointArc(ctx, cam, fade(t, 0.6, 1.2, 7, 7.5));
    orbitGhosts(ctx, cam, t);
    toyStamp(ctx, a);

    // live energies: monomer energies move only with their own shapes, U_int with the pose
    const energies = [[U_W(XA), SCORE_W, 'water’s own'], [U_P(XB), SCORE_P, 'peroxide’s own'], [U_int(XA, XB), INTER, 'interaction']];
    energies.forEach(([U, tint, what], k) => {
      const y = 300 + 32 * k;
      LABELS[k].draw(ctx, NOTES, y - 6, { size: 22, alpha: a });
      text(ctx, `${kcal(U)} kcal/mol`, NOTES + 64, y, { font: font.mono, size: 19, color: tint, alpha: a });
      text(ctx, what, NOTES + 270, y, { ...type.note, color: tint, alpha: a });
    });

    // what each motion means
    const caption = (s, from, to, tint = color.body) => text(ctx, s, NOTES, 420, { ...type.body, size: 20, color: tint, alpha: fade(t, from, from + 0.6, to - 0.6, to) });
    caption('SE(3) = rigid motions (shift and turn)', 0.8, 7.5, VERTICAL);
    caption('the interaction sees shapes too', 8.5, 16.5, INTER);
    caption('peroxide turns and shifts on its own: only the interaction changes', 17, 26, POSE);

    // two quotients, and the map between them
    const words = { ...type.body, size: 18 };
    const formula = (f, y, s, from) => {
      const alpha = seg(t, from, from + 0.8);
      f.draw(ctx, NOTES, y, { size: 25, alpha });
      text(ctx, s, NOTES + f.metrics(25).width + 22, y + 7, { ...words, alpha });
    };
    formula(QUOTIENT_JOINT, 430, 'the cluster’s shape · 21 − 6 = 15', 26.5);
    text(ctx, '(non-collinear molecules)', NOTES, 466, { ...type.note, alpha: seg(t, 27.2, 28) });
    formula(QUOTIENT_OWN, 510, 'the two own shapes · 3 + 6 = 9', 35.5);
    text(ctx, '(non-collinear molecules)', NOTES, 548, { ...type.note, alpha: seg(t, 36.2, 37) });
    formula(FORGET, 590, 'forget the relative pose', 41);

    const last = seg(t, 47.8, 48.8);
    text(ctx, 'fibre: 15 − 9 = 6', NOTES, 670, { font: font.display, size: 28, weight: 500, color: POSE, alpha: last });
    text(ctx, 'everything that forgets to the same two own shapes: next', NOTES, 704, { ...type.note, size: 16, color: color.body, alpha: seg(t, 48.4, 49.4) });
  },
});

/**
 * The two quotients on the molecules: gold copies of what each group does, collapsing to one.
 * 27–35: the pair turned as a whole is one point of M_AB; 36.5–47: peroxide moved on its own is one point of M_A × M_B.
 */
function orbitGhosts(ctx, cam, t) {
  const beats = [
    { show: fade(t, 27, 27.8, 33.6, 34.2), g: 1 - seg(t, 32.5, 34), at: (s) => pairWith(WATER.theta0, PEROXIDE.tau0, 0, 0.8 * s), all: true, tag: M_AB, tagAlpha: fade(t, 32.8, 33.6, 34.8, 35.4) },
    { show: fade(t, 36.5, 37.3, 43.6, 44.2), g: 1 - seg(t, 42.5, 44), at: (s) => pairWith(WATER.theta0, PEROXIDE.tau0, s, 0), all: false, tag: M_A_M_B, tagAlpha: fade(t, 43.2, 44, 47, 47.6) },
  ];
  for (const { show, g, at, all, tag, tagAlpha } of beats) {
    for (const s of [-1, 1]) {
      if (show <= 0.003) continue;
      const { XA, XB } = at(s * g);
      drawMol(ctx, all ? join(XA, XB) : XB, cam, all ? PAIR_MOL : PEROXIDE_MOL, { ghost: VERTICAL, opacity: 0.55 * show });
    }
    if (tagAlpha <= 0.003) continue;
    const words = 'same point of ', style = { ...type.body, size: 20, color: VERTICAL, alpha: tagAlpha };
    ctx.save();
    ctx.font = `400 20px ${font.sans}`;
    const w = ctx.measureText(words).width;
    ctx.restore();
    const x = 400 - (w + tag.metrics(22).width) / 2;
    text(ctx, words, x, 800, style);
    tag.drawOnBaseline(ctx, x + w, 800, { size: 22, alpha: tagAlpha });
  }
}

/** Energy as '−2.71' (no '−0.00'). */
const kcal = (U) => (Math.abs(U) < 0.005 ? '0.00' : U.toFixed(2).replace('-', '−')).padStart(6);

/** Gold double-headed arc about the joint rotation axis, under the pair: it turns there and back. */
function jointArc(ctx, cam, alpha) {
  if (alpha <= 0.003) return;
  const axis = vec3.normalize(JOINT_AXIS);
  const e1 = vec3.normalize(vec3.cross(axis, [0, 0, 1])), e2 = vec3.cross(axis, e1);
  const at = (phi) => vec3.add(C0, vec3.add(vec3.scale(axis, -2.9), vec3.add(vec3.scale(e1, 2.4 * Math.cos(phi)), vec3.scale(e2, 2.4 * Math.sin(phi)))));
  let near = 0;
  for (let k = 0, zMin = Infinity; k < 72; k++) {
    const z = cam.project(at((k / 72) * 2 * Math.PI)).z;
    if (z < zMin) [zMin, near] = [z, (k / 72) * 2 * Math.PI];
  }
  const points = Array.from({ length: 49 }, (_, k) => at(near - 1.6 + (3.2 * k) / 48));
  polyline3(ctx, cam, points, { color: VERTICAL, width: 2.5, alpha });
  for (const [i, j] of [[46, 48], [2, 0]]) {
    const p = cam.project(points[i]), q = cam.project(points[j]);
    const L = Math.hypot(q.x - p.x, q.y - p.y);
    arrow(ctx, q.x - (18 * (q.x - p.x)) / L, q.y - (18 * (q.y - p.y)) / L, q.x, q.y, { color: VERTICAL, width: 2.5, head: 14, alpha });
  }
}
