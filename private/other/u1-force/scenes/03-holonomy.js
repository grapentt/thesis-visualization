// Scene 03: holonomy. Two roads from P to Q, a dial carried along each; at Q the hands disagree by the
// holonomy of the loop that goes out along road 2 and back along road 1. No field is drawn on the
// plane (only its grid), and still the angle grows with the loop, flips with its orientation and
// changes from place to place. A pure-gauge connection closes the wedge wherever the loop sits.
import { defineScene, seg, fade, lerp, text, type, font, color, rgba, tex, line, arrow, slider, choice, drag, C, header, frame, gridLines, axes, drawPath, drawPoint, drawStrip, drawDial, drawRunner, drawAngle, stamp, pill, fmt, clock, leverSim, track } from '../shared.js';
import { planeField, gaugeField, nudgedRoads, transport } from '../math.js';

// ---- the shared layout of scenes 03 and 04 ----------------------------------------------------------

const P = frame({ x: 110, y: 170, w: 620, h: 620, u: [-2, 2], v: [-2, 2] });
const FIELD = planeField({ B0: 0.5, bumps: [{ B1: -1.6, c: [0.5, -0.3], s: 0.6 }] });
const GAUGE = gaugeField((x, y) => 0.8 * x + 0.5 * Math.sin(2 * y));
const HEIGHT = 2.8; // P = (x0, −1.4), Q = (x0, 1.4)
const N = 120;
const DIAL = { x: 1000, y: 320, r: 72 }; // the two dials at Q, superimposed (the same spot in scene 04)
const COL = 900; // the right-hand column
const MARGIN = 1.92; // the loop stays inside |x| < MARGIN
const YMARGIN = 1.75; // and |y| < YMARGIN, so that the labels of P and Q stay inside the frame

/**
 * The two roads of a loop: road 1 straight up at x = x0 (road 1 stays put while the nudge changes),
 * road 2 = road 1 + ε η, the strip centred vertically at cy, clamped so that it stays inside the plane.
 */
function loopAt([x0r, cy], eps, h = HEIGHT) {
  const x0min = -MARGIN - Math.min(0, eps);
  const x0max = MARGIN - Math.max(0, eps);
  const x0 = Math.min(x0max, Math.max(x0min, x0r));
  const yc = Math.min(YMARGIN - h / 2, Math.max(-YMARGIN + h / 2, cy));
  const { straight, nudged } = nudgedRoads({ x0, y0: yc - h / 2, y1: yc + h / 2, eps, n: N });
  return { road1: straight, road2: nudged, x0, yc, eps, P: straight[0], Q: straight[N] };
}

/** The drag lens offset [dx, dy] (stage pixels) as a plane displacement. */
const dragOffset = ([dx, dy]) => [dx / P.kx, -dy / P.ky];

/** A number with its sign (shared.js's fmt drops the plus). */
const signed = (v, digits = 2) => (v > 0.5 * 10 ** -digits ? '+' : '') + fmt(v, digits);

/** A filled sector from angle a to b (counter-clockwise positive, as every angle here). */
function sector(ctx, x, y, r, a, b, fill, alpha = 1) {
  if (alpha <= 0.003 || Math.abs(b - a) < 1e-4) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, -a, -b, b > a);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A short arrow along a road at the fraction u of the way, in the direction dir (+1 up the road, −1 down). */
function roadArrow(ctx, F, road, u, dir, colour, alpha = 1) {
  if (alpha <= 0.003) return;
  const k = Math.round(u * (road.length - 1));
  const [x0, y0] = F.point(road[k - 3 * dir]);
  const [x1, y1] = F.point(road[k + 3 * dir]);
  arrow(ctx, x0, y0, x1, y1, { color: colour, width: 2.5, head: 11, alpha });
}

/** The plane: grid, axes, the two roads, the strip between them with its orientation, P and Q. */
function drawPlane(ctx, L, { alpha = 1, strip = 1, loopArrows = 1, labels = 1, qAbove = 0, stripFill = rgba(C.curvature, 0.18) } = {}) {
  if (alpha <= 0.003) return;
  gridLines(ctx, P, { alpha });
  axes(ctx, P, { xTicks: [-2, -1, 0, 1, 2], yTicks: [-2, -1, 0, 1, 2], xLabel: 'x', alpha });
  text(ctx, 'y', P.x + 14, P.y + 26, { font: font.display, italic: true, size: 20, color: color.muted, alpha });
  drawStrip(ctx, P, L.road2, L.road1, { fill: stripFill, alpha: alpha * strip });
  drawPath(ctx, P, L.road1, { colour: C.path, width: 2.5, alpha });
  drawPath(ctx, P, L.road2, { colour: C.varied, width: 2.5, alpha });
  // the loop: out along road 2, back along road 1
  roadArrow(ctx, P, L.road2, 0.56, 1, C.fibre, alpha * loopArrows);
  roadArrow(ctx, P, L.road1, 0.44, -1, C.fibre, alpha * loopArrows);
  // P's and Q's labels to the left of the loop, or to its right when road 1 hugs the left edge
  const lx = P.X(L.x0) - 34 > P.x + 2 ? -30 : 14;
  drawPoint(ctx, P, L.P, { colour: C.path, r: 6, alpha, label: labels > 0.003 ? 'P' : '', labelOffset: [lx, 30], labelStyle: { alpha: alpha * labels } });
  // Q's label sits above Q while the climbing dials flank it, else to its upper left
  drawPoint(ctx, P, L.Q, { colour: C.path, r: 6, alpha, ringed: true, label: labels * (1 - qAbove) > 0.003 ? 'Q' : '', labelOffset: [lx, -14], labelStyle: { alpha: alpha * labels * (1 - qAbove) } });
  if (labels * qAbove > 0.003) text(ctx, 'Q', P.X(L.Q[0]), P.Y(L.Q[1]) - 22, { font: font.display, italic: true, size: 22, color: C.path, align: 'center', alpha: alpha * labels * qAbove });
}

/** The road labels: 'road 1' near the bottom, 'road 2 = road 1 + εη' at the apex of the nudge. */
function roadLabels(ctx, L, alpha, { road1 = 'road 1', road2 = 'road 2 = road 1 + εη', u1 = 0.12, alpha1 = 1, alpha2 = 1 } = {}) {
  if (alpha <= 0.003) return;
  const style = { font: font.display, italic: true, size: 19 };
  const width = (s) => {
    ctx.save();
    ctx.font = `italic 400 19px ${font.display}`;
    const w = ctx.measureText(s).width;
    ctx.restore();
    return w;
  };
  // road 1: on the side away from the nudge when there is room, else on the other side
  const [x1, y1] = P.point(L.road1[Math.round(u1 * N)]);
  const leftOk = x1 - 12 - width(road1) > P.x + 4;
  const rightOk = x1 + 12 + width(road1) < P.x + P.w - 4;
  const left = L.eps >= 0 ? leftOk : !rightOk;
  text(ctx, road1, left ? x1 - 12 : x1 + 12, y1 + 7, { ...style, alpha: alpha * alpha1, color: C.path, align: left ? 'right' : 'left' });
  // road 2: outside the apex of the nudge when there is room, else on the far side of road 1
  const [x2, y2] = P.point(L.road2[Math.round(0.5 * N)]);
  const w2 = width(road2);
  const s = L.eps >= 0 ? 1 : -1;
  let x = x2 + 14 * s;
  let align = s > 0 ? 'left' : 'right';
  if (s > 0 && x + w2 > P.x + P.w - 4) {
    x = P.X(L.x0) - 14;
    align = 'right';
  } else if (s < 0 && x - w2 < P.x + 4) {
    x = P.X(L.x0) + 14;
    align = 'left';
  }
  text(ctx, road2, x, y2 + 7, { ...style, alpha: alpha * alpha2, color: C.varied, align });
}

/** The label 'Δθ' outside the ring, beside the wedge from a to b (clear of the hand tips however small Δθ is). */
function wedgeLabel(ctx, x, y, r, a, b, alpha) {
  if (alpha <= 0.003 || Math.abs(b - a) < 1e-4) return;
  const mid = (a + b) / 2;
  const [c, s] = [Math.cos(mid), Math.sin(mid)];
  const align = c > 0.35 ? 'left' : c < -0.35 ? 'right' : 'center';
  const R = r + 14;
  const dy = align === 'center' ? (s > 0 ? -4 : 14) : 7;
  text(ctx, 'Δθ', x + R * c, y - R * s + dy, { font: font.display, italic: true, size: 20, color: C.fibre, align, alpha });
}

/** The two dials at Q superimposed: ink hand θ₁(Q), orange hand θ₂(Q), the gold wedge Δθ between them. */
function drawQDials(ctx, th1, th2, { alpha = 1, wedge = 1, r = DIAL.r, x = DIAL.x, y = DIAL.y } = {}) {
  if (alpha <= 0.003) return;
  drawDial(ctx, x, y, r, th1, { colour: C.path, alpha, width: 3.5, fill: 'rgba(13,19,33,0.9)' });
  sector(ctx, x, y, r * 0.62, th1, th2, rgba(C.fibre, 0.22), alpha * wedge);
  drawAngle(ctx, x, y, r * 0.62, th1, th2, { colour: C.fibre, width: 3, alpha: alpha * wedge });
  drawDial(ctx, x, y, r, th2, { colour: C.varied, ringColour: 'rgba(0,0,0,0)', tick: false, alpha, width: 3.5 });
  wedgeLabel(ctx, x, y, r, th1, th2, alpha * wedge);
}

// ---- this scene ------------------------------------------------------------------------------------

const X0 = [[0, [-0.9, 0]], [50, [-0.9, 0]], [54, [-0.25, -0.3]], [58.5, [0.41, -0.3]]]; // road 1's x and the loop's y-centre: the narrator carries the loop over the bump
const CLIMB = [2, 14]; // the runners climb from P to Q
const MERGE = [13.8, 15.6]; // the two dials fly to the right and superimpose
const AT = 17; // everything the controls affect is on screen
const HANDOVER = 60;

const HOL = tex(String.raw`\Delta\theta = \int_{\text{road 2}}\!\omega \;-\; \int_{\text{road 1}}\!\omega \;=\; \oint\omega`, 'Δθ = ∫_{road 2} ω − ∫_{road 1} ω = ∮ω');
const CHI = tex(String.raw`\omega = d\chi,\qquad \chi(x,y) = 0.8\,x + 0.5\sin 2y`, 'ω = dχ,  χ(x, y) = 0.8 x + 0.5 sin 2y');
const RULE = tex(String.raw`d\theta = \omega(dx)`, 'dθ = ω(dx)');
const CLOSED = tex(String.raw`\oint d\chi = \chi(\text{end}) - \chi(\text{start}) = 0`, '∮dχ = χ(end) − χ(start) = 0');

export default defineScene({
  name: 'Two roads, one loop',
  duration: 75,
  header: header(3, 'HOLONOMY', 'Two roads to the same point'),
  narration: [
    [0, 'Two roads from P to Q. Road one runs straight up; road two is road one pushed sideways by a small hump, epsilon eta. Carry a dial along each.'],
    [11.5, 'Out along road two, back along road one: a loop. At Q the hands disagree; that disagreement is the holonomy angle: the integral of omega around the loop.'],
    [22.5, 'Widen the loop, and the angle grows with it. A bigger loop, a bigger angle: the angle is counting something inside the loop.'],
    [35, 'Flip the nudge: the loop runs the other way, and the angle flips with it. Orientation matters.'],
    [48.5, 'Carry the loop across the plane. It looks empty, yet the angle shrinks, crosses zero, turns negative. Loops sense something invisible that varies from place to place.'],
    [HANDOVER, 'Your turn: carry it, widen it, flip it.'],
    [64.5, 'Switch to a pure gauge: both hands land together; the wedge stays closed. A loop ignores where the zero marks are. Holonomy is physical.'],
  ],
  beats: [
    [20, 'Widen the loop'],
    [37, 'Flip it'],
    [50, 'Carry it elsewhere'],
    [HANDOVER, 'Your turn'],
  ],
  handovers: [{ at: HANDOVER, prompt: 'Your turn: carry the loop somewhere else; widen it; flip it.' }],
  exploreFrom: AT,
  controls: {
    eps: slider('Nudge ε', { min: -1.2, max: 1.2, step: 0.01, value: [[0, 0.25], [20, 0.25], [24, 1.0], [34, 1.0], [37, -0.8], [46, -0.8], [49, 0.25]] }),
    loop: drag('Drag the loop across the plane', { region: P.region }),
    conn: choice('Connection', { magnetic: 'magnetic', gauge: 'pure gauge dχ' }, { value: [[0, 'magnetic'], [64.5, 'gauge'], [72.5, 'magnetic']], lens: true }),
  },
  sim: leverSim(['eps']),

  draw(ctx, t, live) {
    const tt = clock(t, live, AT);
    const { eps, loop: dragged, conn } = live.input;
    const field = conn === 'gauge' ? GAUGE : FIELD;
    const [ox, oy] = dragOffset(dragged);
    const where = [track(tt, X0.map(([at, c]) => [at, c[0]])) + ox, track(tt, X0.map(([at, c]) => [at, c[1]])) + oy];
    const L = loopAt(where, eps);
    const th1 = transport(field, L.road1, 0);
    const th2 = transport(field, L.road2, 0);
    const dtheta = th2[N] - th1[N];

    const on = seg(tt, 0.2, 1.2);
    drawPlane(ctx, L, { alpha: on, strip: seg(tt, 11, 12.5), loopArrows: seg(tt, 11.5, 13), qAbove: fade(tt, 1.6, 2.4, MERGE[1], MERGE[1] + 1) });
    // the runners climb, each carrying its dial; at Q the dials fly to the right and superimpose
    const climb = seg(tt, CLIMB[0], CLIMB[1]);
    // a road label ducks while the dial riding ~22 px above the runner passes it
    const climbing = seg(tt, 1.6, 2.4) * (1 - seg(tt, MERGE[0], MERGE[1]));
    const duck = (u) => 1 - climbing * (1 - seg(Math.abs(climb + 0.05 - u), 0.07, 0.17));
    roadLabels(ctx, L, fade(tt, 1.2, 2.2, 12, 13) + seg(tt, 16, 17) * 0.75, { u1: 0.85, alpha1: duck(0.85), alpha2: duck(0.5) });
    const k = Math.round(climb * N);
    const merge = seg(tt, MERGE[0], MERGE[1]);
    const s = eps >= 0 ? 1 : -1;
    const runners = seg(tt, 1.6, 2.4);
    drawRunner(ctx, P, L.road1[k], { colour: C.path, r: 6, alpha: runners });
    drawRunner(ctx, P, L.road2[k], { colour: C.varied, r: 6, alpha: runners });
    const dials = [
      [L.road1[k], th1[k], C.path, -s, true],
      [L.road2[k], th2[k], C.varied, s, false],
    ];
    for (const [p, theta, colour, side, first] of dials) {
      const [rx, ry] = P.point(p);
      const sx = rx + side * 60;
      const sy = ry - 22;
      const x = lerp(sx, DIAL.x, merge);
      const y = lerp(sy, DIAL.y, merge);
      const r = lerp(22, DIAL.r, merge);
      if (merge < 1) {
        line(ctx, rx, ry, sx - side * 22, sy + 6, { color: rgba(colour, 0.5), width: 1, alpha: runners * (1 - merge) });
        drawDial(ctx, x, y, r, theta, { colour, alpha: runners, ringColour: first ? C.fibre : rgba(C.fibre, 1 - merge), tick: first, width: 3, fill: first ? 'rgba(13,19,33,0.9)' : null });
      }
    }
    if (merge >= 1) drawQDials(ctx, th1[N], th2[N], { alpha: 1, wedge: seg(tt, 15.6, 16.6) });

    // the right-hand column: the rule while the runners climb, then the dials at Q
    const rule = fade(tt, 2.5, 3.5, 13, 14);
    text(ctx, 'carry a dial along each road', COL, 226, { ...type.body, size: 20, alpha: rule });
    RULE.draw(ctx, COL, 272, { size: 26, alpha: rule });
    text(ctx, 'every step dx turns the hand by ω(dx); nothing is painted on the plane', COL, 314, { ...type.note, size: 14, alpha: rule });
    const arrived = seg(tt, 15.4, 16.4);
    text(ctx, 'the two dials at Q, superimposed', 1140, 296, { ...type.body, size: 20, alpha: arrived });
    text(ctx, 'ink hand: carried along road 1', 1140, 330, { font: font.mono, size: 15, color: C.path, alpha: arrived });
    text(ctx, 'orange hand: carried along road 2', 1140, 356, { font: font.mono, size: 15, color: C.varied, alpha: arrived });
    const dtAlpha = seg(tt, 16, 17);
    text(ctx, 'Δθ = θ₂(Q) − θ₁(Q) =', COL, 444, { font: font.mono, size: 17, color: color.muted, alpha: dtAlpha });
    text(ctx, `${signed(dtheta, 3)} rad`, COL + 236, 444, { font: font.mono, size: 18, color: C.fibre, alpha: dtAlpha });
    HOL.draw(ctx, COL, 500, { size: 26, alpha: seg(tt, 17.5, 18.5) });
    text(ctx, 'the loop: out along road 2, back along road 1', COL, 548, { ...type.note, size: 14, alpha: seg(tt, 18.5, 19.5) });
    text(ctx, 'counter-clockwise for ε > 0', COL, 570, { ...type.note, size: 14, alpha: seg(tt, 18.5, 19.5) });
    text(ctx, 'reverse the loop (ε < 0): the angle flips its sign', COL, 612, { ...type.note, size: 14, color: color.body, alpha: fade(tt, 36, 37, 47.5, 48.5) });
    text(ctx, 'no field is drawn, yet Δθ depends on where the loop sits', COL, 612, { ...type.note, size: 14, color: color.body, alpha: fade(tt, 52, 53, 63, 64) });

    // the connection in use
    const pillAlpha = seg(tt, 2, 3);
    pill(ctx, conn === 'gauge' ? 'CONNECTION · PURE GAUGE ω = dχ' : 'CONNECTION · MAGNETIC', COL, 706, conn === 'gauge' ? C.connection : C.curvature, pillAlpha);
    if (conn === 'gauge') {
      CHI.draw(ctx, COL, 756, { size: 23, alpha: pillAlpha });
      CLOSED.draw(ctx, COL, 806, { size: 23, alpha: pillAlpha * Math.max(seg(tt, 65, 66), live.exploring ? 1 : 0) });
      text(ctx, 'both hands turn by χ(Q) − χ(P); the wedge stays closed for every loop', COL, 846, { ...type.note, size: 14, alpha: pillAlpha * Math.max(seg(tt, 66, 67), live.exploring ? 1 : 0) });
    } else {
      text(ctx, 'ω of the running field; its curvature stays hidden until scene 04', COL, 748, { ...type.note, size: 14, alpha: pillAlpha * fade(tt, 2, 3, 63, 64) });
      text(ctx, 'back to the magnetic connection: the wedge opens again. Holonomy is physical.', COL, 748, { ...type.note, size: 14, color: color.body, alpha: pillAlpha * seg(tt, 72.5, 73.5) });
    }

    // the nudge
    text(ctx, `nudge ε = ${signed(eps, 2)} · η is a hump, zero at P and Q · dials start at θ(P) = 0`, P.x, 862, { ...type.note, size: 14, alpha: seg(tt, 2.5, 3.5) });
    stamp(ctx, seg(tt, 2.5, 3.5), 'every hand is transported with dθ = ω(dx) along the road shown; Δθ is read off the dials');
  },
});
