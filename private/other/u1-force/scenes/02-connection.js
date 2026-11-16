// Scene 02: a rule for carrying a phase. Left: the tube over a bent road γ from P to Q in 3D with
// the lift winding on it. Right: the plane with a faint dial field, the road, a runner carrying a
// dial, and the graph of θ(s). The connection (flat, pure gauge, magnetic) is a lens.
import { defineScene, seg, fade, lerp, text, wrap, type, color, font, rgba, tex, choice, line, dot, ring, C, header, frame, axes, drawPath, drawPoint, drawSamples, drawDial, drawDialField, drawRunner, clipped, readout, stamp, clock, fmt, TAU } from '../shared.js';
import { planeField, gaugeField, flatField, twoRoads, transport } from '../math.js';
import { bundleCamera, drawFloor, tube, drawTube, drawTubeRing, drawLift, drawBaseCurve, floorPoint } from '../space.js';
import { polyline3 } from '../shared.js';

const DURATION = 65;
const GAUGE_AT = 14;
const MAGNETIC_AT = 40;
const FORMULA_AT = 57;
const SECOND_AT = 46.3; // the magnetic second road: announced, walked, landed by 51
const ALL_SHOWN = 52.5; // by then every road has been walked twice (the last lands at 51)

// the plane, its field (the running field of scenes 3 and 4) and the pure gauge χ
const FIELD = planeField({ B0: 0.5, bumps: [{ B1: -1.6, c: [0.5, -0.3], s: 0.6 }] });
const chi = (x, y) => 0.8 * x + 0.5 * Math.sin(2 * y);
const FIELDS = { flat: flatField, gauge: gaugeField(chi), magnetic: FIELD };
// the roads: γ (bent, to the left of P → Q) and the straight second road
const P = [-1.3, -1.1];
const Q = [1.2, 1.2];
const ROADS = twoRoads(P, Q, 0.75, { n: 120 });
const GAMMA = ROADS.bent;
const STRAIGHT = ROADS.straight;
const THETA_P = 0;
/** θ along each road for each connection, computed once. */
const THETA = Object.fromEntries(Object.entries(FIELDS).map(([k, f]) => [k, { 1: transport(f, GAMMA, THETA_P), 2: transport(f, STRAIGHT, THETA_P) }]));
/** The graph's θ range for each connection: both roads, with a margin, always including 0. */
const RANGE = Object.fromEntries(Object.entries(THETA).map(([k, r]) => {
  const all = [...r[1], ...r[2], 0];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = Math.max(0.25, 0.15 * (hi - lo));
  return [k, [lo - pad, hi + pad]];
}));
const ticksIn = ([lo, hi]) => {
  const step = hi - lo > 2.5 ? 1 : 0.5;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 2) / 2);
  return out;
};
const S = Array.from({ length: GAMMA.length }, (_, i) => i / (GAMMA.length - 1));

// the 3D tube over γ (and the straight road's fibres, for its lift only)
const RHO = 0.26;
const HT = 0.55;
const TUBE = tube(GAMMA, { rho: RHO, h: HT });
const TUBE2 = tube(STRAIGHT, { rho: RHO, h: HT });
const PHI = (theta) => theta - Math.PI / 2; // θ = 0 sits on the near side of the tube, facing the camera

// the 2D frames
const R = frame({ x: 1040, y: 185, w: 360, h: 360, u: [-2, 2], v: [-2, 2] });
const graphFrame = (conn) => frame({ x: 1040, y: 688, w: 360, h: 125, u: [0, 1], v: RANGE[conn] });

/** The runner's episodes: which road is walked when (narrative time). */
const EPISODES = [
  { road: 1, a: 1.5, b: 12 },
  { road: 1, a: GAUGE_AT + 0.5, b: GAUGE_AT + 7.5 },
  { road: 2, a: GAUGE_AT + 8, b: GAUGE_AT + 14 },
  { road: 1, a: MAGNETIC_AT + 0.5, b: MAGNETIC_AT + 6 },
  { road: 2, a: SECOND_AT + 0.2, b: SECOND_AT + 4.7 },
];
/** Progress of each road's runner at time tt: { p1, p2, walking }. */
function runners(tt) {
  let e = -1;
  for (let k = 0; k < EPISODES.length; k++) if (tt >= EPISODES[k].a) e = k;
  if (e < 0) return { p1: 0, p2: 0, walking: 0 };
  const { road, a, b } = EPISODES[e];
  const p = seg(tt, a, b);
  return road === 1 ? { p1: p, p2: 0, walking: p < 1 ? 1 : 0 } : { p1: 1, p2: p, walking: p < 1 ? 2 : 0 };
}
const index = (p) => Math.round(p * (GAMMA.length - 1));

const RULE = tex(String.raw`d\theta = \omega(dx)`, 'dθ = ω(dx)');
const TOTAL = tex(String.raw`\theta(Q) = \theta(P) + \int_\gamma \omega`, 'θ(Q) = θ(P) + ∫_γ ω');
const GAUGE_TOTAL = tex(String.raw`\theta(Q) - \theta(P) = \chi(Q) - \chi(P)`, 'θ(Q) − θ(P) = χ(Q) − χ(P)');
const RELABEL = tex(String.raw`\theta \to \theta - \chi,\qquad \omega \to \omega - d\chi`, 'θ → θ − χ,   ω → ω − dχ');
const CONN = {
  flat: tex(String.raw`\omega = 0`, 'ω = 0'),
  gauge: tex(String.raw`\omega = d\chi,\quad \chi(x, y) = 0.8\,x + 0.5\sin 2y`, 'ω = dχ,  χ(x, y) = 0.8 x + 0.5 sin 2y'),
  magnetic: tex(String.raw`\omega \ \text{with}\ d\omega = B(x, y)\, dx\wedge dy`, 'ω with dω = B(x, y) dx∧dy'),
};
const CONN_NOTE = {
  flat: 'the hand never turns: the lift rides at a constant angle',
  gauge: 'the hand turns, but the total from P to Q is χ(Q) − χ(P) on every road',
  magnetic: 'the hand turns, and the total depends on the road',
};

export default defineScene({
  name: 'A rule for carrying a phase',
  duration: DURATION,
  header: header(2, 'CONNECTIONS', 'How a phase travels along a path'),
  narration: [
    [0, 'A connection is the rule: for each step, how much the hand turns: d theta equals omega of d x. With omega zero the hand never turns; the lift, the phase over the road, rides level.'],
    [GAUGE_AT, 'A pure gauge: omega is d chi, a gradient. The hand turns and the lift winds, but the total from P to Q is chi of Q minus chi of P. The second road will land on the same hand.'],
    [GAUGE_AT + 15.5, 'Turning every zero mark by chi relabels theta to theta minus chi, and shifts omega by minus d chi. Nothing physical can depend on the zero marks.'],
    [MAGNETIC_AT, 'Magnetic: a rule that is not a gradient. Along this road the hand turns only a little.'],
    [SECOND_AT, 'Now the second road, the straight one. Watch where its hand lands.'],
    [SECOND_AT + 5.2, 'Elsewhere. The total depends on the road. That dependence is the whole story.'],
    [FORMULA_AT, 'Theta at Q: theta at P plus the integral of omega along the road. Switch the rule; watch the lift.'],
  ],
  beats: [
    [GAUGE_AT, 'Pure gauge'],
    [MAGNETIC_AT, 'Magnetic'],
  ],
  controls: {
    conn: choice('Connection', { flat: 'flat ω = 0', gauge: 'pure gauge ω = dχ', magnetic: 'magnetic' }, { value: [[0, 'flat'], [GAUGE_AT, 'gauge'], [MAGNETIC_AT, 'magnetic']], lens: true }),
  },

  draw(ctx, t, live) {
    const tt = clock(t, live, ALL_SHOWN);
    const conn = live.input.conn ?? 'flat';
    const field = FIELDS[conn];
    const th1 = THETA[conn][1];
    const th2 = THETA[conn][2];
    const { p1, p2, walking } = runners(tt);
    const i1 = index(p1);
    const i2 = index(p2);
    const road2Seen = p2 > 0;
    const on = seg(t, 0.2, 1.2);
    // the zero marks turn by χ while the gauge remark is said (and only in the pure gauge)
    const zeroTurn = conn === 'gauge' ? seg(tt, GAUGE_AT + 16, GAUGE_AT + 19) : 0;
    const zeroAt = ([x, y]) => zeroTurn * chi(x, y);

    // ---- left: the 3D tube over γ, the lift, the second road's lift ---------------------------
    const cam = bundleCamera({ yaw: 0.35 + 0.012 * t, pitch: 0.46, scale: 138, cx: 440, cy: 430 });
    drawFloor(ctx, cam, { a: 2, step: 0.5, alpha: on });
    drawBaseCurve(ctx, cam, STRAIGHT, { colour: C.varied, width: 2, alpha: 0.85 * seg(tt, GAUGE_AT + 7.5, GAUGE_AT + 8.5), dash: [6, 6] });
    drawBaseCurve(ctx, cam, GAMMA, { colour: C.path, width: 2.5, alpha: on });
    for (const [pt, label, dx] of [[P, 'P', -22], [Q, 'Q', 16]]) {
      const s = cam.project(floorPoint(pt[0], pt[1], 0));
      dot(ctx, s.x, s.y, 4.5, color.ink, on);
      text(ctx, label, s.x + dx, s.y + 24, { ...type.math, size: 24, alpha: on });
    }
    drawTube(ctx, cam, TUBE, { every: 3, nv: 22, alpha: 0.3 * on, colour: C.fibre, edge: 0.35 });
    // the fibres over P and Q
    drawTubeRing(ctx, cam, TUBE, 0, { alpha: 0.9 * on, colour: C.fibre, width: 1.6 });
    drawTubeRing(ctx, cam, TUBE, GAMMA.length - 1, { alpha: 0.9 * on, colour: C.fibre, width: 1.6 });
    // the lift along γ (soft blue) and along the straight road (orange, dashed when hidden)
    if (p1 > 0) {
      drawLift(ctx, cam, TUBE, th1.map(PHI), { colour: C.connection, width: 3.5, alpha: on, progress: p1 });
      const s = cam.project(TUBE.at(i1, PHI(th1[i1])));
      dot(ctx, s.x, s.y, 5.5, C.connection, on);
      if (walking === 1) drawTubeRing(ctx, cam, TUBE, i1, { alpha: 0.7 * on, colour: C.fibre, width: 1.2 });
    }
    if (road2Seen) {
      // the second road's lift: over the straight road there is no tube drawn, so nothing hides it
      polyline3(ctx, cam, th2.map((th, i) => TUBE2.at(i, PHI(th))), { color: C.varied, width: 2.5, alpha: 0.9 * on, progress: Math.max(p2, 1 / 120) });
      const s = cam.project(TUBE2.at(i2, PHI(th2[i2])));
      dot(ctx, s.x, s.y, 5, C.varied, on);
    }
    // the start of the lift over P
    const sP = cam.project(TUBE.at(0, PHI(THETA_P)));
    ring(ctx, sP.x, sP.y, 7, C.connection, 0.8 * on, 1.5);
    // the lift's name, above the fibre over P where the lift starts (clear of the tube's surface)
    const liftLabel = fade(tt, 3, 4, 12.5, 13.5);
    const ringTop = cam.project(TUBE.at(0, Math.PI / 2)); // the top of the fibre over P: the label sits above it, clear of tube and road
    text(ctx, 'the lift: the phase carried over the road', sP.x - 24, ringTop.y - 22, { ...type.note, size: 14, color: C.connection, alpha: liftLabel });

    // ---- bottom left: the rule, the current connection, the formula --------------------------
    RULE.draw(ctx, 90, 690, { size: 30, alpha: seg(t, 2, 3) });
    text(ctx, 'a 1-form: a direction in, a rate of turning out', 300, 698, { ...type.note, size: 14, alpha: seg(t, 5, 6) });
    text(ctx, 'connection', 90, 752, { ...type.eyebrow, size: 14, alpha: seg(t, 1, 2) });
    CONN[conn].draw(ctx, 215, 745, { size: 24, alpha: seg(t, 1, 2) });
    text(ctx, CONN_NOTE[conn], 215, 778, { ...type.note, size: 14, alpha: seg(t, 1, 2) });
    const relabel = conn === 'gauge' ? seg(tt, GAUGE_AT + 16, GAUGE_AT + 17) : 0;
    RELABEL.draw(ctx, 90, 830, { size: 24, alpha: relabel * (1 - seg(t, FORMULA_AT, FORMULA_AT + 1)) });
    text(ctx, 'a pure gauge is only a choice of zero marks', 90, 862, { ...type.note, size: 14, alpha: relabel * (1 - seg(t, FORMULA_AT, FORMULA_AT + 1)) });
    TOTAL.draw(ctx, 90, 830, { size: 28, alpha: seg(t, FORMULA_AT, FORMULA_AT + 1) });
    text(ctx, 'the hand at Q: the start plus everything the rule said along the road', 90, 866, { ...type.note, size: 14, alpha: seg(t, FORMULA_AT + 1, FORMULA_AT + 2) });

    // ---- right: the plane with the dial field, the roads and the runners ------------------
    axes(ctx, R, { xTicks: [-2, -1, 0, 1, 2], yTicks: [-2, -1, 0, 1, 2], alpha: on, box: true });
    clipped(ctx, R, () => {
      drawDialField(ctx, R, { spacing: 0.5, r: 10, hand: false, alpha: 0.5 * on, zero: (u, v) => zeroAt([u, v]), ringColour: rgba(C.fibre, 0.45) });
      drawPath(ctx, R, STRAIGHT, { colour: C.varied, width: 2, alpha: 0.9 * seg(tt, GAUGE_AT + 7.5, GAUGE_AT + 8.5), dash: [6, 6] });
      drawPath(ctx, R, GAMMA, { colour: C.path, width: 2.5, alpha: on });
      drawPath(ctx, R, GAMMA, { colour: C.connection, width: 3.5, alpha: on * (p1 > 0 ? 1 : 0), progress: Math.max(p1, 1 / 120) });
      if (road2Seen) drawPath(ctx, R, STRAIGHT, { colour: C.varied, width: 3, alpha: on, progress: Math.max(p2, 1 / 120) });
    }, 3);
    drawPoint(ctx, R, P, { colour: color.ink, r: 5, label: 'P', labelOffset: [-26, 8], alpha: on });
    drawPoint(ctx, R, Q, { colour: color.ink, r: 5, label: 'Q', labelOffset: [12, 26], alpha: on });
    text(ctx, zeroTurn > 0.5 ? 'the dials of the plane, zero marks turned by χ' : 'the dials of the plane (hands hidden)', R.x + R.w / 2, R.y - 14, { ...type.note, size: 14, align: 'center', alpha: on });
    // runner 1 (and its dial, which stays at Q once it has arrived)
    if (p1 > 0) {
      const at = GAMMA[i1];
      drawRunner(ctx, R, at, { colour: C.path, r: 6, dial: th1[i1], dialOffset: [34, -34], dialR: 22, zero: zeroAt(at), alpha: on });
    }
    if (road2Seen) {
      const at = STRAIGHT[i2];
      // once both have arrived, the two dials sit on top of each other: one ring, two hands
      drawRunner(ctx, R, at, { colour: C.varied, r: 6, dial: th2[i2], dialOffset: [34, -34], dialR: 22, zero: zeroAt(at), alpha: on });
      if (p2 >= 1) {
        const [qx, qy] = R.point(Q);
        drawDial(ctx, qx + 34, qy - 34, 22, th2[i2], { colour: C.varied, ringColour: 'rgba(0,0,0,0)', tick: false, width: 3, zero: zeroAt(Q) });
        drawDial(ctx, qx + 34, qy - 34, 22, th1[GAMMA.length - 1], { colour: C.path, ringColour: 'rgba(0,0,0,0)', tick: false, width: 3, zero: zeroAt(Q) });
      }
    }
    // readouts: θ at Q on each road
    const rx = R.x;
    const ry = R.y + R.h + 56;
    readout(ctx, 'θ₁(Q) =', p1 >= 1 ? th1[GAMMA.length - 1] : th1[i1], rx, ry, { colour: C.path, size: 16, alpha: on * seg(tt, 1.5, 2.5), unit: p1 >= 1 ? ' rad' : ' rad  (on the way)' });
    if (road2Seen) readout(ctx, 'θ₂(Q) =', p2 >= 1 ? th2[GAMMA.length - 1] : th2[i2], rx + 190, ry, { colour: C.varied, size: 16, alpha: on, unit: ' rad' });
    if (conn === 'gauge' && road2Seen) readout(ctx, 'χ(Q) − χ(P) =', chi(...Q) - chi(...P), rx, ry + 26, { colour: C.fibre, size: 16, alpha: on, unit: ' rad' });
    else if (road2Seen && p2 >= 1) readout(ctx, 'θ₂(Q) − θ₁(Q) =', th2[GAMMA.length - 1] - th1[GAMMA.length - 1], rx, ry + 26, { colour: C.fibre, size: 16, alpha: on, unit: ' rad' });

    // the graph θ(s) along the roads
    const g = seg(t, 1, 2);
    const G = graphFrame(conn);
    axes(ctx, G, { xTicks: [0, 0.5, 1], yTicks: ticksIn(RANGE[conn]), alpha: g, grid: true, format: (v) => (v === 0 ? 'P' : v === 1 ? 'Q' : ''), formatY: (v) => fmt(v, 1), labelStyle: { size: 16 } });
    text(ctx, 'θ along the road (rad), from P to Q', G.x, G.y - 12, { ...type.note, size: 14, alpha: g });
    clipped(ctx, G, () => {
      line(ctx, G.x, G.Y(THETA_P), G.x + G.w, G.Y(THETA_P), { color: rgba(color.ink, 0.25), width: 1, dash: [3, 4], alpha: g });
      if (p1 > 0) drawSamples(ctx, G, S, th1, { colour: C.connection, width: 2.5, alpha: g, progress: Math.max(p1, 1 / 120) });
      if (road2Seen) drawSamples(ctx, G, S, th2, { colour: C.varied, width: 2.2, alpha: g, progress: Math.max(p2, 1 / 120), dash: [5, 4] });
      if (p1 > 0) drawPoint(ctx, G, [S[i1], th1[i1]], { colour: C.connection, r: 4, alpha: g });
      if (road2Seen) drawPoint(ctx, G, [S[i2], th2[i2]], { colour: C.varied, r: 4, alpha: g });
    }, 4);

    stamp(ctx, seg(t, 2, 3), 'every hand and every lift is the phase transported by ω along the road, computed');
  },
});
