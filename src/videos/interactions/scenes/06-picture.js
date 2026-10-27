// Scene 06: the master diagram is born. Floor = the two own shapes, fibre = relative pose (one
// coordinate drawn, u); a point pops out as a real pair; monomer energies are flat on the climb,
// the interaction is not.

import { defineScene, seg, fade, lin, text, dot, type, font, color, tex, camera, rotation, vec3, polyline3 } from '../../../kit.js';
import { POSE, HORIZONTAL, SCORE_W, SCORE_P, INTER, PAIR_MOL, PEROXIDE_MOL, drawMol, drawHalo, drawHBond, toyStamp } from '../shared.js';
import { drawMaster, drawFibres, diagramCamera, diagPoint, toA, toB, toF } from '../diagram.js';
import { DOCKED, fibreSweep, pairOnFibre } from '../data.js';
import { join, centroid, bisector, poseCoords, waterInternals, peroxideInternals, place, DEG } from '../toy.js';

const THETA0 = 104.52, TAU_U = 120, TAU_REST = 111.8;
const U_DEF = tex(String.raw`u = \cos\angle(\hat b_A,\ c_B - c_A)`, 'u = cos∠(b̂_A, c_B − c_A)');
const INV_W = tex(String.raw`U_W(g_A x_A) = U_W(x_A)`, 'U_W(g_A x_A) = U_W(x_A)');
const INV_INT = tex(String.raw`U_{\rm int}(g\,x_A,\ g\,x_B) = U_{\rm int}(x_A, x_B)`, 'U_int(g x_A, g x_B) = U_int(x_A, x_B)');

// ---- the cursor's journey: keys [time, value], eased between keys -------------------------

const track = (t, keys, ease = seg) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [t1, v1] = keys[k];
    if (t <= t1) return keys[k - 1][1] + (v1 - keys[k - 1][1]) * ease(t, keys[k - 1][0], t1);
  }
  return keys[keys.length - 1][1];
};
const CLIMBS = [[43.6, 48.6], [50.5, 56.5], [61.8, 66.8]];
const U_DOCK = DOCKED.u;
const thetaAt = (t) => track(t, [[36.3, THETA0], [37, 95], [39, 115], [39.6, THETA0]]);
const tauAt = (t) => track(t, [[39.7, TAU_U], [41, 0], [42.3, TAU_U], [49, TAU_U], [50, TAU_REST]]);
const uAt = (t) => {
  const climb = CLIMBS.find(([a, b]) => t >= a && t <= b);
  if (climb) return -0.95 + 1.9 * lin(t, ...climb);
  return track(t, [[42.4, 0], [43.6, -0.95], [48.6, 0.95], [49, 0.95], [50, -0.95], [50.5, -0.95], [56.5, 0.95], [61, 0.95], [61.8, -0.95], [66.8, 0.95], [67.4, 0.95], [69, U_DOCK]]);
};

// ---- the pairs a point stands for ------------------------------------------------------------

/** Alternatives at u = 0 (25–35.5): c_B moved around the cone about water's bisector, peroxide turned about its centroid. */
const BASE_U0 = pairOnFibre(0, { theta: THETA0, tau: TAU_U });
const alternativeAt = (cone, spin = rotation.IDENTITY) => {
  const c = centroid(BASE_U0.XB, 4), Rc = rotation.axisAngle([0, 1, 0], cone);
  return place(BASE_U0.XB.map((v, i) => v - c[i % 3]), rotation.multiply(spin, Rc), rotation.apply(Rc, c));
};
const ALTERNATIVES = [
  alternativeAt(-1.3),
  alternativeAt(0, rotation.axisAngle([1, 0.4, 0.2], 2.1)),
  alternativeAt(-0.9, rotation.axisAngle([0, 0, 1], 1.4)),
].map((XB) => ({ XB, u: poseCoords(BASE_U0.XA, XB).u }));
const ALT_TIMES = [29.4, 31.4, 33.4];

// ---- energies along the climb (data.fibreSweep: θ₀, τ 111.8°, bonds at rest) --------------------

const SWEEP = fibreSweep;
const PLOT = { x: 950, y: 652, w: 560, h: 150, lo: -9, hi: 7 };
const plotX = (u) => PLOT.x + ((u + 1) / 2) * PLOT.w;
const plotY = (v) => PLOT.y + ((PLOT.hi - v) / (PLOT.hi - PLOT.lo)) * PLOT.h;
const WINDOW_BIG = { cx: 1200, cy: 560, r: 190, pxPerA: 55 };
const WINDOW_SMALL = { cx: 1200, cy: 480, r: 140, pxPerA: 40 };
const NOTES = 860, SIDE = 1362;
const DIAGRAM = diagramCamera();

export default defineScene({
  name: 'The picture',
  duration: 74,
  narration: [
    [0, "Now the picture we will keep. The floor holds the two own shapes: across, water's angle; into the page, peroxide's torsion, which wraps around."],
    [11, 'Above every point stands a fibre of relative poses. It has six dimensions; we draw one, u, the cosine of the angle between water\'s bisector and the direction to peroxide.'],
    [25, 'So each height stands for many poses. Any point pops out as a real pair, with the other five pose numbers chosen.'],
    [35.5, "In these drawn coordinates, walking along the floor changes only shapes. Climbing a fibre changes only the pose: peroxide behind water's oxygen, beside it, in front of its hydrogens."],
    [49, "Watch three energies on the climb. Water's own energy and peroxide's stay exactly flat: invariant under each molecule's own motion, they are functions on the floor."],
    [61, 'The interaction is invariant only under moving both together: a function on the whole bundle. An invariant network on atom coordinates computes exactly such a function.'],
  ],
  header: { eyebrow: '06 · THE PICTURE', title: 'Shapes below, poses above' },

  draw(ctx, t) {
    const theta = thetaAt(t), tau = tauAt(t), u = uAt(t);
    const cursorOn = fade(t, 25, 25.8);
    const pair = pairOnFibre(u, { theta, tau });
    const shrink = seg(t, 49, 50.2);
    const win = Object.fromEntries(Object.keys(WINDOW_BIG).map((k) => [k, WINDOW_BIG[k] + (WINDOW_SMALL[k] - WINDOW_BIG[k]) * shrink]));
    const cam = { ...win, yaw: 0.35, pitch: 0.3, center: vec3.scale(centroid(pair.XB, 4), 0.42) };
    const a = toA(theta), b = toB(tau), f = toF(u);
    const fibresDone = fade(t, 13.6, 14.4);

    // the cursor's trail: soft blue while it walks the floor, teal while it climbs
    const walk = fade(t, 36.3, 36.8, 48.6, 49.4);
    const paths = [];
    if (t > 36.3) paths.push({ points: trail(36.3, Math.min(t, 42.4)), colour: HORIZONTAL, alpha: 0.9 * walk, width: 3 });
    if (t > 43.6) paths.push({ points: trail(43.6, Math.min(t, 48.6)), colour: POSE, alpha: 0.9 * walk, width: 4 });

    drawMaster(ctx, {
      floor: { alpha: fade(t, 0.5, 2.2), axes: fade(t, 1.8, 3.5) },
      // 18 fibres rise from the floor, staggered 0.05 s, their glyphs riding the tops
      fibres: t > 11.4 ? { alpha: 1, caption: false, rise: (k) => seg(t, 11.5 + 0.05 * k, 12.7 + 0.05 * k) } : null,
      // the u axis follows the cursor onto peroxide's rest torsion (49–50) for the energy climb
      uAxis: { alpha: fade(t, 16.5, 17.5), site: [THETA0, t < 49 ? TAU_U : tau] },
      paths,
    });
    wrapPulse(ctx, t);
    drawFibres(ctx, DIAGRAM, { lines: false, glyphs: false, alpha: fibresDone });

    // the definition of u, drawn where the pop-out will open, then the pop-out around it
    const content = (alpha) => (c, wc) => drawPair(c, wc, pair, t, alpha);
    if (cursorOn > 0.003) drawMaster(ctx, { popOut: { a, b, f, ...cam, content: content(1), caption: false, alpha: cursorOn } }); // the pop-out fades its content
    const sketch = fade(t, 18.5, 19.5) * (1 - cursorOn);
    if (sketch > 0.003) content(sketch)(ctx, camera({ ...cam, scale: win.pxPerA, focal: 30 }));
    windowText(ctx, t, pair, win);

    // notes
    U_DEF.draw(ctx, NOTES, 232, { size: 30, alpha: fade(t, 18, 19, 48.6, 49.4) });
    text(ctx, "b̂_A: water's bisector (O towards the H's) · c: plain centroids", NOTES, 276, { ...type.note, alpha: fade(t, 18.6, 19.6, 48.6, 49.4) });
    const sameAs = fade(t, 35.8, 36.8, 48.6, 49.4);
    caption(ctx, "in these drawn coordinates (what 'the same pose' means is a choice: scene 17)", sameAs);
    climbLabels(ctx, t);
    energies(ctx, t);
    caption(ctx, 'learn to read this once', fade(t, 70, 70.8), { ...type.body, size: 24, color: color.ink });
    toyStamp(ctx, fade(t, 49.5, 50.5));
  },
});

/** Box points of the cursor's path between two times. */
function trail(t0, t1) {
  const n = Math.max(2, Math.ceil((t1 - t0) * 30));
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = t0 + ((t1 - t0) * i) / n;
    return [toA(thetaAt(s)), toB(tauAt(s)), toF(uAt(s))];
  });
}

/** τ wraps: the near and far edges (−180° and 180°) pulse together. */
function wrapPulse(ctx, t) {
  const p = fade(t, 7.5, 8.3, 10.2, 11) * (0.6 + 0.4 * Math.sin(2 * Math.PI * (t - 7.5) / 1.4));
  for (const b of [0, 1]) polyline3(ctx, DIAGRAM, [diagPoint(0, b, 0), diagPoint(1, b, 0)], { color: SCORE_P, width: 5, alpha: p });
}

/** The pair in the window: halos, both molecules, and the two directions whose angle defines u. */
function drawPair(ctx, cam, pair, t, alpha) {
  const X = join(pair.XA, pair.XB);
  // an alternative pair at the same u takes over while the shown peroxide fades back
  const alt = alternative(t), back = alt ? 1 - 0.7 * alt.alpha : 1;
  drawHalo(ctx, cam, X, 3, SCORE_W, { alpha });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha: alpha * back });
  drawMol(ctx, X, cam, PAIR_MOL, { opacity: alpha, atomAlpha: [1, 1, 1, back, back, back, back] });
  if (alt) {
    drawHalo(ctx, cam, alt.XB, 4, SCORE_P, { alpha: 0.8 * alt.alpha * alpha });
    drawMol(ctx, alt.XB, cam, PEROXIDE_MOL, { opacity: 0.8 * alt.alpha * alpha });
  }
  // b̂_A and c_B − c_A from water's centroid, with the angle between them (for the alternative too)
  const cA = centroid(pair.XA, 3), cB = centroid(pair.XB, 4), bis = bisector(pair.XA);
  const p = cam.project(cA), tipB = cam.project(vec3.add(cA, vec3.scale(bis, 1.15)));
  stroke(ctx, [[p.x, p.y], [tipB.x, tipB.y]], { colour: POSE, width: 2.5, alpha });
  const q = angleTo(ctx, cam, cA, bis, cB, alpha * back);
  if (alt) angleTo(ctx, cam, cA, bis, centroid(alt.XB, 4), alpha * alt.alpha);
  text(ctx, 'b̂', tipB.x + 8, tipB.y - 4, { font: font.display, italic: true, size: 20, color: POSE, alpha });
  dot(ctx, p.x, p.y, 4, color.ink, alpha);
  // the two centroids named while u is being defined
  const named = alpha * fade(t, 18.8, 19.8, 28.6, 29.2);
  text(ctx, 'c_A', p.x - 34, p.y + 40, { font: font.mono, size: 15, color: color.ink, align: 'right', alpha: named });
  text(ctx, 'c_B', q.x + 14, q.y + 28, { font: font.mono, size: 15, color: color.ink, alpha: named });
  // back at the docked pose: its hydrogen bond
  const { o, h } = DOCKED.hbond;
  drawHBond(ctx, cam, X.slice(3 * h, 3 * h + 3), X.slice(3 * o, 3 * o + 3), { alpha: alpha * fade(t, 68.8, 69.6), label: false });
}

/** The dashed c_A → c_B line, its end dot and the arc from b̂_A to it; returns c_B on screen. */
function angleTo(ctx, cam, cA, bis, cB, alpha) {
  const dir = vec3.normalize(vec3.sub(cB, cA)), p = cam.project(cA), q = cam.project(cB);
  stroke(ctx, [[p.x, p.y], [q.x, q.y]], { colour: POSE, width: 2.5, alpha, dash: [6, 5] });
  const angle = Math.acos(Math.max(-1, Math.min(1, vec3.dot(bis, dir))));
  const axis = vec3.normalize(vec3.cross(bis, dir));
  const arc = Array.from({ length: 25 }, (_, i) => vec3.add(cA, vec3.scale(rotation.apply(rotation.axisAngle(axis, (angle * i) / 24), bis), 0.75)));
  polyline3(ctx, cam, arc, { color: POSE, width: 2, alpha });
  dot(ctx, q.x, q.y, 4, color.ink, alpha);
  return q;
}

/** A screen polyline. */
function stroke(ctx, pts, { colour, width = 1.2, alpha = 1, dash = [] }) {
  if (alpha <= 0.003 || pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

/** Which faint alternative (same u) is in the window, and how strongly. */
function alternative(t) {
  for (let k = 0; k < ALT_TIMES.length; k++) {
    const s = ALT_TIMES[k];
    const alpha = fade(t, s, s + 0.4, s + 1.5, s + 1.9);
    if (alpha > 0.003) return { ...ALTERNATIVES[k], alpha };
  }
  return null;
}

/** Caption and readouts under (or beside) the window. */
function windowText(ctx, t, pair, win) {
  const first = fade(t, 25.8, 26.6, 35.6, 36.3);
  ['one of many pairs at this height:', 'the other five pose numbers chosen'].forEach((line, k) =>
    text(ctx, line, win.cx, win.cy + win.r + 32 + 21 * k, { ...type.note, color: POSE, align: 'center', alpha: first }));
  const alt = alternative(t);
  const uNow = alt ? alt.u : poseCoords(pair.XA, pair.XB).u;
  text(ctx, `u = ${num(uNow, 2)}`, win.cx, win.cy + win.r + 92, { font: font.mono, size: 17, color: POSE, align: 'center', alpha: fade(t, 26.5, 27.3, 35.6, 36.3) });

  // walk and climb: shapes (soft blue) and pose (teal), recomputed from the drawn atoms
  const live = fade(t, 36, 36.8, 48.8, 49.4);
  if (live > 0.003) {
    const { theta } = waterInternals(pair.XA), { tau } = peroxideInternals(pair.XB), { u, d } = poseCoords(pair.XA, pair.XB);
    const y = win.cy + win.r + 40;
    const items = [[`θ ${(theta / DEG).toFixed(1)}°`, HORIZONTAL], [`τ ${(tau / DEG).toFixed(1)}°`, HORIZONTAL], [`u ${num(u, 2)}`, POSE], [`d ${d.toFixed(2)} Å`, POSE]];
    items.forEach(([s, c], k) => text(ctx, s, win.cx - 255 + 170 * k, y, { font: font.mono, size: 17, color: c, alpha: live }));
    text(ctx, 'shapes', win.cx - 255, y + 26, { ...type.note, color: HORIZONTAL, alpha: live });
    text(ctx, 'pose', win.cx + 85, y + 26, { ...type.note, color: POSE, alpha: live });
  }
  // energy phase: the pose beside the small window
  const late = fade(t, 50, 50.8);
  if (late > 0.003) {
    const { u, d } = poseCoords(pair.XA, pair.XB);
    text(ctx, `u ${num(u, 2)}`, SIDE, 410, { font: font.mono, size: 17, color: POSE, alpha: late });
    text(ctx, `d ${d.toFixed(2)} Å`, SIDE, 438, { font: font.mono, size: 17, color: POSE, alpha: late });
  }
}

const num = (v, digits) => {
  const s = v.toFixed(digits);
  return (Number(s) === 0 ? (0).toFixed(digits) : s).replace('-', '−');
};

/** A caption centred over the diagram. */
function caption(ctx, s, alpha, style = { ...type.note, color: color.body }) {
  text(ctx, s, 440, 178, { ...style, align: 'center', alpha });
}

/** Where peroxide is during the first climb. */
function climbLabels(ctx, t) {
  const labels = [[-0.9, 'behind the oxygen'], [0, 'beside'], [0.9, 'in front of the hydrogens']];
  const [c0, c1] = CLIMBS[0];
  labels.forEach(([u, s]) => {
    const at = c0 + ((u + 0.95) / 1.9) * (c1 - c0);
    const alpha = fade(t, at - 0.6, at - 0.3, Math.min(at + 0.4, 48.7), Math.min(at + 0.7, 49));
    if (alpha > 0.003) text(ctx, s, WINDOW_BIG.cx, WINDOW_BIG.cy - WINDOW_BIG.r - 18, { font: font.sans, size: 20, color: POSE, align: 'center', alpha });
  });
}

/** Energies against u, traced as the cursor climbs: U_W and U_P (49–61), then U_int (61–74). */
function energies(ctx, t) {
  const axes = fade(t, 49.6, 50.4);
  if (axes <= 0.003) return;
  const { x, y, w, h } = PLOT;
  stroke(ctx, [[x, y], [x, y + h], [x + w, y + h]], { colour: color.dim, alpha: axes });
  stroke(ctx, [[x, plotY(0)], [x + w, plotY(0)]], { colour: color.dim, alpha: axes, dash: [3, 5] });
  for (const v of [-5, 0, 5]) text(ctx, `${v < 0 ? '−' : ''}${Math.abs(v)}`, x - 10, plotY(v) + 5, { font: font.mono, size: 15, color: color.muted, align: 'right', alpha: axes });
  text(ctx, 'kcal/mol', x - 10, y - 10, { ...type.note, align: 'right', alpha: axes });
  for (const u of [-1, 0, 1]) text(ctx, u > 0 ? '+1' : u < 0 ? '−1' : '0', plotX(u), y + h + 20, { font: font.mono, size: 15, color: color.muted, align: 'center', alpha: axes });
  text(ctx, 'u', x + w + 14, y + h + 6, { font: font.display, italic: true, size: 22, color: POSE, alpha: axes });
  text(ctx, 'along the fibre at θ 104.5°, τ 111.8° (rest shapes)', x + w, y + h + 42, { ...type.note, align: 'right', alpha: axes });

  const pW = lin(t, ...CLIMBS[1]), pI = lin(t, ...CLIMBS[2]);
  const upto = (p) => SWEEP.u.findLastIndex((u) => u <= -0.95 + 1.9 * p + 1e-12);
  const curve = (values, p, colour, dash = []) =>
    stroke(ctx, SWEEP.u.slice(0, upto(p) + 1).map((u, i) => [plotX(u), plotY(values[i])]), { colour, width: 3, alpha: axes, dash });
  curve(SWEEP.UW, pW, SCORE_W);
  curve(SWEEP.UP, pW, SCORE_P, [10, 8]);
  curve(SWEEP.Uint, pI, INTER);
  const end = plotX(0.95) + 8;
  const legend = axes * fade(t, 50.4, 51);
  text(ctx, 'U_W', end, plotY(0) - 6, { font: font.mono, size: 15, color: SCORE_W, alpha: legend });
  text(ctx, 'U_P', end, plotY(0) + 16, { font: font.mono, size: 15, color: SCORE_P, alpha: legend });
  text(ctx, 'U_int', end, plotY(SWEEP.Uint.at(-1)) + 5, { font: font.mono, size: 15, color: INTER, alpha: axes * fade(t, 61.8, 62.4) });

  // max variation so far along the traced path
  const n = Math.max(0, upto(pW));
  const spread = (values) => values.slice(0, n + 1).reduce((m, v) => Math.max(m, Math.abs(v - values[0])), 0);
  const flat = fade(t, 50.5, 51.2);
  text(ctx, `ΔU_W = ${spread(SWEEP.UW).toFixed(3)}`, SIDE, 506, { font: font.mono, size: 17, color: SCORE_W, alpha: flat });
  text(ctx, `ΔU_P = ${spread(SWEEP.UP).toFixed(3)}`, SIDE, 534, { font: font.mono, size: 17, color: SCORE_P, alpha: flat });
  text(ctx, 'max change', SIDE, 560, { ...type.note, alpha: flat });
  text(ctx, 'on the climb', SIDE, 579, { ...type.note, alpha: flat });

  // the cursor on the plot while it climbs
  const climbing = CLIMBS.slice(1).some(([c0, c1]) => t >= c0 - 0.3 && t <= c1 + 0.3);
  if (climbing) stroke(ctx, [[plotX(uAt(t)), y], [plotX(uAt(t)), y + h]], { colour: color.ink, alpha: 0.6 * axes });

  // the minimum of U_int: DOCKED
  const minAlpha = fade(t, 66.6, 67.4);
  if (minAlpha > 0.003) {
    const i = SWEEP.iDock, px = plotX(SWEEP.u[i]), py = plotY(SWEEP.Uint[i]);
    dot(ctx, px, py, 5, INTER, minAlpha);
    stroke(ctx, [[px, py - 8], [px, plotY(1.2)]], { colour: INTER, alpha: 0.7 * minAlpha, dash: [2, 4] });
    text(ctx, `minimum ${num(SWEEP.Uint[i], 1)} kcal/mol`, px + 4, plotY(1.2) - 27, { ...type.note, color: INTER, alpha: minAlpha });
    text(ctx, `at u = ${num(SWEEP.u[i], 2)}: docked`, px + 4, plotY(1.2) - 7, { ...type.note, color: INTER, alpha: minAlpha });
  }

  // invariance notes
  const own = fade(t, 51, 52, 60.6, 61.4);
  INV_W.draw(ctx, NOTES, 228, { size: 26, alpha: own });
  text(ctx, "→ invariant under water's own motion: a function on the floor", NOTES, 268, { ...type.note, color: color.body, alpha: own });
  const joint = fade(t, 61.6, 62.6);
  INV_INT.draw(ctx, NOTES, 228, { size: 26, alpha: joint });
  text(ctx, '→ invariant only under the joint motion: a function on the whole bundle', NOTES, 268, { ...type.note, color: color.body, alpha: joint });
  text(ctx, 'an invariant network on atom coordinates computes exactly such a function', NOTES, 306, { ...type.note, color: color.body, alpha: fade(t, 68, 69) });
}
