import { defineScene, seg, lin, lerp, easeInOut as smooth, text, type, font, camera, polyline3, rotation, vec3 } from '../../../kit.js';
import { buildWater, buildPeroxide, waterInternals, peroxideInternals, place, slerpRotation, join, DEG } from '../toy.js';
import { monomerSamples, DOCKED } from '../data.js';
import { SCORE_W, SCORE_P, INTER, POSE, HORIZONTAL, WATER_MOL, PEROXIDE_MOL, PAIR_MOL, drawMol, drawHalo, drawHBond, drawPadlock, tagCard, toyStamp } from '../shared.js';
import { diagramCamera, diagPoint, toA, toB, PROFILE_SITES } from '../diagram.js';

const ASK = 14.5, YES = 25, PICTURE = 34.5;
const GLIDE = [YES, 29.5];
const CENTRE = { x: 800, y: 360 };
const VIEW = { yaw: 0.25, pitch: 0.15, focal: 40 };
const COLUMNS = [{ cx: 420, tint: SCORE_W, tag: 'MODEL W', title: 'trained on water alone' }, { cx: 1180, tint: SCORE_P, tag: 'MODEL P', title: 'trained on peroxide alone' }];
// the kit card's 34 px title needs 450 px for 'trained on peroxide alone'; the data bars keep 360
const CARD = { y: 520, width: 450 };
const BAR = { y: 700, h: 20, width: 360 };
const PERIOD = 1.2, BLEND = 0.35;

// Peroxide is first shown turned 90° about its O–O axis (one H up, one down), then yawed 0.6 rad and
// tipped 0.3 rad towards the viewer, so the H–O–O–H twist (its torsion, a hand) shows.
const R_START = rotation.multiply(rotation.axisAngle([1, 0, 0], 0.3), rotation.multiply(rotation.axisAngle([0, 1, 0], 0.6), rotation.axisAngle([1, 0, 0], 90 * DEG)));
// Docked pair: water at the origin (rest, bisector +y), centred on the bounding box of its atoms.
const MID = [0, 1, 2].map((c) => {
  const v = Array.from({ length: 7 }, (_, i) => DOCKED.X[3 * i + c]);
  return (Math.min(...v) + Math.max(...v)) / 2;
});
const END_W = vec3.scale(MID, -1), END_P = vec3.sub(DOCKED.r, MID);

// One camera for the whole scene; the start places each molecule's centroid under its column.
const sceneCamera = (scale) => camera({ cx: CENTRE.x, cy: CENTRE.y, scale, ...VIEW });
const unproject = (cam, x, y) => {
  const [ex, ey, ez] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e) => cam.rotate(e));
  const v = [(x - cam.cx) / cam.scale, -(y - cam.cy) / cam.scale, 0];
  return [vec3.dot(ex, v), vec3.dot(ey, v), vec3.dot(ez, v)];
};
const START_W = unproject(sceneCamera(110), 420, 380), START_P = unproject(sceneCamera(110), 1180, 380);

/** Thermal sample shown at time t, and the next one blending in (opacity crossfade every 1.2 s). */
function cycle(t) {
  const n = Math.floor((t - 0.5) / PERIOD), phase = t - 0.5 - n * PERIOD;
  const k = (((n + 1) % 6) + 6) % 6;
  return { k, previous: (k + 5) % 6, w: smooth(lin(phase, 0, BLEND)) };
}
// the sample held when the glide starts (τ ≈ +103°, the same hand as DOCKED: no barrier is crossed)
const HELD = cycle(YES).k;

const lerp3 = (a, b, s) => a.map((v, i) => lerp(v, b[i], s));
const lerpAll = (A, B, s) => Object.fromEntries(Object.keys(A).map((key) => [key, lerp(A[key], B[key], s)]));
const W_FROM = waterInternals(monomerSamples.water[HELD]), W_TO = waterInternals(DOCKED.XA);
const P_FROM = peroxideInternals(monomerSamples.peroxide[HELD]), P_TO = peroxideInternals(buildPeroxide());

const shift = (X, c) => Array.from(X, (v, i) => v + c[i % 3]);
const startP = (X) => place(X, R_START, START_P);

/** The two molecules during the glide, s ∈ [0, 1]: centroids linear, peroxide's turn by slerp, internals linear. */
function glide(s) {
  const w = lerpAll(W_FROM, W_TO, s), p = lerpAll(P_FROM, P_TO, s);
  const XA = shift(buildWater(w.r1, w.r2, w.theta), lerp3(START_W, END_W, s));
  const XB = place(buildPeroxide(p), slerpRotation(R_START, DOCKED.R, s), lerp3(START_P, END_P, s));
  return { XA, XB };
}

export default defineScene({
  name: 'Question',
  duration: 41,
  narration: [
    [0, 'Here are two molecules: water, and hydrogen peroxide. For each one alone we can train a good diffusion model, because single-molecule data are cheap: simulate one molecule as long as you like.'],
    [ASK, 'Data of the two together are scarce. So: can we keep both models, frozen, and learn only what is new when they meet?'],
    [YES, 'Yes, exactly, with one extra term. This video shows why, what that term is, and where the idea stops working.'],
    [PICTURE, 'We will build one picture for it: shapes below, poses above.'],
  ],
  header: { eyebrow: '01 · QUESTION', title: 'Reuse the parts, learn the meeting' },

  draw(ctx, t) {
    drawSilhouette(ctx, t);
    // molecules under the cards, so the peroxide's halo never glows over a card's edge
    drawMolecules(ctx, t);
    drawColumns(ctx, t);
    // one line, under the scarce bar (bottom 770 + 109 = 879)
    tagCard(ctx, { x: 500, y: 770, width: 600, tag: 'NEW', body: 'one interaction term: the only thing to learn', accent: INTER, alpha: seg(t, 30, 30.8), progress: seg(t, 30.2, 31.8) });
    // thermal samples and DOCKED both come from the toy force field
    toyStamp(ctx, seg(t, 1, 2));
  },
});

function drawMolecules(ctx, t) {
  const s = smooth(lin(t, ...GLIDE));
  const cam = sceneCamera(lerp(110, 70, s));
  const appear = seg(t, 0.5, 1.5);
  if (t < GLIDE[0]) {
    // two thermal samples per molecule, crossfading
    const { k, previous, w } = cycle(t);
    for (const [i, a] of [[previous, 1 - w], [k, w]]) {
      if (a <= 0.003) continue;
      const XA = shift(monomerSamples.water[i], START_W), XB = startP(monomerSamples.peroxide[i]);
      drawHalo(ctx, cam, XA, 3, SCORE_W, { alpha: a * appear });
      drawMol(ctx, XA, cam, WATER_MOL, { opacity: a * appear });
      drawHalo(ctx, cam, XB, 4, SCORE_P, { alpha: a * appear });
      drawMol(ctx, XB, cam, PEROXIDE_MOL, { opacity: a * appear });
    }
  } else {
    const { XA, XB } = glide(s);
    const d = vec3.length(lerp3(vec3.sub(START_P, START_W), vec3.sub(END_P, END_W), s));
    if (d < 4) {
      // within 4 Å: one call, so the atoms depth-sort together
      const X = join(XA, XB);
      drawHalo(ctx, cam, X, 3, SCORE_W);
      drawHalo(ctx, cam, X, [3, 7], SCORE_P);
      drawMol(ctx, X, cam, PAIR_MOL);
      const { o, h } = DOCKED.hbond;
      drawHBond(ctx, cam, X.slice(3 * h, 3 * h + 3), X.slice(3 * o, 3 * o + 3), { alpha: seg(t, 30, 31), label: false });
    } else {
      drawHalo(ctx, cam, XA, 3, SCORE_W);
      drawMol(ctx, XA, cam, WATER_MOL);
      drawHalo(ctx, cam, XB, 4, SCORE_P);
      drawMol(ctx, XB, cam, PEROXIDE_MOL);
    }
  }
  const names = seg(t, 1, 2) * (1 - seg(t, YES, YES + 0.8));
  const italic = { font: font.display, italic: true, size: 26, align: 'center', alpha: names };
  text(ctx, 'water', 420, 222, { ...italic, color: SCORE_W });
  text(ctx, 'hydrogen peroxide', 1180, 222, { ...italic, color: SCORE_P });
}

/** The two MODEL cards, their data bars, the scarce pair bar and the padlocks. */
function drawColumns(ctx, t) {
  const fadeBack = (1 - 0.7 * seg(t, 29, 30)) * (1 - seg(t, PICTURE - 0.5, PICTURE + 0.3)); // gone for the picture
  const cards = seg(t, 3, 4) * fadeBack;
  const bars = seg(t, 8, 8.6) * fadeBack;
  const grow = smooth(lin(t, 8, 9.6));
  for (const c of COLUMNS) {
    const x = c.cx - CARD.width / 2;
    tagCard(ctx, { x, y: CARD.y, width: CARD.width, tag: c.tag, title: c.title, body: '', accent: c.tint, alpha: cards });
    dataBar(ctx, c.cx - BAR.width / 2, BAR.width * grow, HORIZONTAL, bars);
    text(ctx, 'one molecule: plenty', c.cx, BAR.y + 46, { ...type.note, color: HORIZONTAL, align: 'center', alpha: bars });
    // each model's padlock wears its own colour (§1); the shackle snaps shut over 0.3 s at 20 s
    const lock = seg(t, 19, 19.6) * fadeBack, shut = seg(t, 19.9, 20.2);
    const px = x + CARD.width - 44, py = CARD.y + 48;
    drawPadlock(ctx, px, py, 36, { closed: false, tint: c.tint, alpha: lock * (1 - shut) });
    drawPadlock(ctx, px, py, 36, { closed: true, tint: c.tint, alpha: lock * shut });
    text(ctx, 'frozen', px - 28, py + 4, { ...type.note, color: c.tint, align: 'right', baseline: 'middle', alpha: lock });
  }
  const pair = seg(t, ASK + 0.5, ASK + 1.3) * (1 - seg(t, PICTURE - 0.5, PICTURE + 0.3)); // scarce, beside the NEW card
  dataBar(ctx, 700, 60 * smooth(lin(t, ASK + 0.5, ASK + 1.5)), INTER, pair);
  text(ctx, 'the pair: scarce', 730, BAR.y + 46, { ...type.note, color: INTER, align: 'center', alpha: pair });
}

function dataBar(ctx, x, w, tint, alpha) {
  if (alpha <= 0.003 || w <= 0.5) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = tint;
  ctx.fillRect(x, BAR.y, w, BAR.h);
  ctx.restore();
}

/** The master diagram's silhouette beside the pair (where peroxide's column was; no fibre crosses an atom): the floor outline draws itself, then three fibres rise. */
function drawSilhouette(ctx, t) {
  if (t < PICTURE) return;
  const cam = diagramCamera({ cx: 1200, cy: 470, scale: 70 });
  const floor = lin(t, PICTURE + 0.3, PICTURE + 1.8);
  const corners = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  const edges = 4 * floor;
  const path = [diagPoint(0, 0, 0)];
  for (let e = 0; e < 4 && e < edges; e++) {
    const [a0, b0] = corners[e], [a1, b1] = corners[e + 1], u = Math.min(1, edges - e);
    path.push(diagPoint(lerp(a0, a1, u), lerp(b0, b1, u), 0));
  }
  polyline3(ctx, cam, path, { color: HORIZONTAL, width: 2, alpha: 0.5 });
  PROFILE_SITES.forEach(([theta, tau], i) => {
    const rise = smooth(lin(t, PICTURE + 1.8 + 0.4 * i, PICTURE + 2.8 + 0.4 * i));
    if (rise <= 0) return;
    const a = toA(theta), b = toB(tau);
    polyline3(ctx, cam, [diagPoint(a, b, 0), diagPoint(a, b, rise)], { color: POSE, width: 2.2, alpha: 0.5 });
  });
  // labels: under the lowest floor corner, and beside the rightmost fibre top
  const low = corners.map(([a, b]) => cam.project(diagPoint(a, b, 0))).reduce((m, p) => (p.y > m.y ? p : m));
  text(ctx, 'shapes below', low.x, low.y + 30, { ...type.label, color: HORIZONTAL, align: 'center', alpha: seg(t, PICTURE + 1.2, PICTURE + 2) });
  const top = PROFILE_SITES.map(([theta, tau]) => cam.project(diagPoint(toA(theta), toB(tau), 1))).reduce((m, p) => (p.x > m.x ? p : m));
  text(ctx, 'poses above', top.x + 14, top.y + 6, { ...type.label, color: POSE, alpha: seg(t, PICTURE + 3.2, PICTURE + 4) });
}
