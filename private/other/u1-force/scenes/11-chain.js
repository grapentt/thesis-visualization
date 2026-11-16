// Scene 11: the whole chain, as a row of nine small icons drawn with the video's own devices (a ring
// on a stalk, a dial, two roads, a shaded cell, a worldline, a ribbon, a balance, the formula),
// lighting up in order; then the closing line, the relativistic remark and the references.
import { defineScene, seg, fade, text, wrap, type, color, font, rgba, tex, line, arrow, dot, C, frame, drawDial, drawAngle, drawPath, drawStrip, drawBalance, drawVector, stamp, header, TAU } from '../shared.js';
import { twoRoads, times, hump, varied, straightPath } from '../math.js';

const ICON_Y = 300; // the centre line of the icons
const SPOT_Y = 600; // the large copy of the step being spoken
const SPOT_SCALE = 2.1;
const ICON_FROM = 1.2; // the first icon lights up
const ICON_EVERY = 2.4;
const LINE_AT = 20; // "which leaves one line"
const CLOSING_AT = 26.5;
const RELATIVISTIC_AT = 31;
const REFERENCES_AT = 39.5;
const COLS = 9;
const CX = (i) => 180 + 160 * i;
const litAt = (i) => ICON_FROM + ICON_EVERY * i;

const F_ICON = [
  tex(String.raw`S^1 \to P \to M`, 'S¹ → P → M'),
  tex(String.raw`\omega`, 'ω'),
  tex(String.raw`\oint \omega`, '∮ω'),
  tex(String.raw`\Omega = d\omega`, 'Ω = dω'),
  tex(String.raw`S = S_{\rm kin} + \hbar\!\int\!\omega(U)\,dt`, 'S = S_kin + ħ∫ω(U) dt'),
  tex(String.raw`x + \varepsilon\,\eta`, 'x + εη'),
  tex(String.raw`\hbar\!\int\!\Omega(\eta, U)\,dt`, 'ħ∫Ω(η, U) dt'),
  tex(String.raw`-\!\int\! m\,\ddot x\,\eta\,dt`, '−∫ m ẍ η dt'),
  tex(String.raw`m\,\ddot x^\flat = e\,F(\cdot, U)`, 'm ẍ♭ = e F(·, U)'),
];
const LINES = [
  'a circle over every point',
  'a rule for the hand',
  'two roads disagree',
  'disagreement per area',
  'the action, with the phase',
  'a nudge is a loop',
  'its holonomy: the flux',
  'balanced against the mass',
  'force is curvature',
];
const F_RELATIVISTIC = tex(String.raw`\frac{dp_\mu}{d\tau} = e\,F_{\mu\nu}\,U^\nu`, 'dp_μ/dτ = e F_μν U^ν');

// the small pictures, computed with the same functions as the scenes
const ROADS = twoRoads([0, -1], [0, 1], 0.55, { n: 40 });
const TSMALL = times(1, 40);
const WORLD = TSMALL.map((t) => [-0.45 + 0.9 * t * t, t]); // a bending worldline
const STRAIGHT = straightPath(-0.4, 0.4, 1, 40);
const ETA = TSMALL.map((t) => hump(t, 0.5, 0.2));
const NUDGED = varied(STRAIGHT, ETA, 0.5);
const PTS = (xs) => xs.map((x, i) => [x, TSMALL[i]]);
/** A tiny frame around an icon's centre: plane [−1, 1]² (or [0, 1] in v) on a 110 px box. */
const box = (cx, cy, v = [-1, 1]) => frame({ x: cx - 55, y: cy - 55, w: 110, h: 110, u: [-1, 1], v });

const ICONS = [
  // 1 · a circle over every point: three rings on stalks over a base line
  (ctx, cx, cy, a) => {
    line(ctx, cx - 52, cy + 40, cx + 52, cy + 40, { color: color.muted, width: 2, alpha: a });
    for (const dx of [-34, 0, 34]) {
      line(ctx, cx + dx, cy + 40, cx + dx, cy - 6, { color: C.connection, width: 1.5, alpha: 0.8 * a });
      dot(ctx, cx + dx, cy + 40, 3, color.muted, a);
      drawDial(ctx, cx + dx, cy - 18, 13, 0, { alpha: a, hand: false, tick: false, width: 2.5 });
    }
  },
  // 2 · a rule for the hand: a path with a transported dial, the hand turning along it
  (ctx, cx, cy, a) => {
    const F = box(cx, cy);
    const path = TSMALL.map((t) => [-0.9 + 1.8 * t, -0.6 + 0.4 * Math.sin(Math.PI * t)]);
    drawPath(ctx, F, path, { colour: C.connection, width: 2.2, alpha: a, arrowHead: true });
    for (const [k, theta] of [[8, 0.2], [20, 0.9], [32, 1.9]]) {
      const [x, y] = F.point(path[k]);
      drawDial(ctx, x, y - 24, 11, theta, { alpha: a * (0.45 + 0.55 * (k / 32)), width: 2, fill: 'rgba(13,19,33,0.9)' });
    }
  },
  // 3 · two roads disagree: an ink road and an orange road from P to Q, two hands at Q
  (ctx, cx, cy, a) => {
    const F = box(cx, cy + 10, [-1.25, 1.25]);
    drawPath(ctx, F, ROADS.straight, { colour: C.path, width: 2.2, alpha: a });
    drawPath(ctx, F, ROADS.bent, { colour: C.varied, width: 2.2, alpha: a });
    const [qx, qy] = F.point([0, 1]);
    const [px, py] = F.point([0, -1]);
    dot(ctx, px, py, 3.5, C.path, a);
    drawDial(ctx, qx, qy, 16, 1.2, { alpha: a, width: 2.2, fill: 'rgba(13,19,33,0.9)', tick: false });
    drawDial(ctx, qx, qy, 16, 2.1, { alpha: a, width: 2.2, colour: C.varied, ringColour: 'rgba(0,0,0,0)', tick: false });
    drawAngle(ctx, qx, qy, 11, 1.2, 2.1, { alpha: a, width: 1.5 });
  },
  // 4 · per area: a shaded cell with the curvature's sign
  (ctx, cx, cy, a) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(C.curvature, 0.4);
    ctx.strokeStyle = C.curvature;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 30);
    ctx.lineTo(cx + 22, cy + 30);
    ctx.lineTo(cx + 40, cy - 30);
    ctx.lineTo(cx - 22, cy - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawAngle(ctx, cx, cy, 16, -0.6, 4.2, { alpha: a, width: 2 });
  },
  // 5 · the action with the phase: a worldline carrying a dial, its velocity U in green
  (ctx, cx, cy, a) => {
    const F = box(cx, cy, [0, 1]);
    line(ctx, F.x, F.y + F.h, F.x + F.w, F.y + F.h, { color: color.line, width: 1.5, alpha: a });
    line(ctx, F.x, F.y + F.h, F.x, F.y, { color: color.line, width: 1.5, alpha: a });
    drawPath(ctx, F, WORLD, { colour: C.path, width: 2.4, alpha: a });
    const k = 24;
    const d = [WORLD[k + 1][0] - WORLD[k - 1][0], WORLD[k + 1][1] - WORLD[k - 1][1]];
    const n = Math.hypot(d[0], d[1]);
    drawVector(ctx, F, WORLD[k], [d[0] / n, d[1] / n], { colour: C.kinetic, scale: 30, width: 2.2, head: 9, alpha: a });
    const [x, y] = F.point(WORLD[k]);
    drawDial(ctx, x - 26, y - 14, 12, 2.2, { alpha: a, width: 2, fill: 'rgba(13,19,33,0.9)' });
  },
  // 6 · a nudge is a loop: the worldline, its orange nudge, the strip between them
  (ctx, cx, cy, a) => {
    const F = box(cx, cy, [0, 1]);
    drawStrip(ctx, F, PTS(STRAIGHT), PTS(NUDGED), { fill: rgba(C.curvature, 0.22), alpha: a });
    drawPath(ctx, F, PTS(STRAIGHT), { colour: C.path, width: 2.4, alpha: a });
    drawPath(ctx, F, PTS(NUDGED), { colour: C.varied, width: 2.2, alpha: a, arrowHead: true });
    const k = 20;
    const [x0, y0] = F.point([STRAIGHT[k], TSMALL[k]]);
    const [x1] = F.point([NUDGED[k], TSMALL[k]]);
    arrow(ctx, x0, y0, x1, y0, { color: C.varied, width: 1.6, head: 7, alpha: a });
  },
  // 7 · its holonomy is the flux: the strip cut into violet cells, the angle at the top
  (ctx, cx, cy, a) => {
    const F = box(cx, cy, [0, 1]);
    for (let c = 0; c < 8; c++) {
      const i0 = c * 5;
      const i1 = i0 + 5;
      drawStrip(ctx, F, PTS(STRAIGHT).slice(i0, i1 + 1), PTS(NUDGED).slice(i0, i1 + 1), { fill: rgba(C.curvature, c % 2 ? 0.55 : 0.3), stroke: rgba(C.curvature, 0.8), alpha: a, width: 0.8 });
    }
    drawPath(ctx, F, PTS(STRAIGHT), { colour: C.path, width: 1.8, alpha: a });
    drawPath(ctx, F, PTS(NUDGED), { colour: C.varied, width: 1.8, alpha: a });
    const [qx, qy] = F.point([STRAIGHT[40], 1]);
    drawAngle(ctx, qx, qy, 14, 0.4, 1.9, { alpha: a, width: 2 });
  },
  // 8 · balanced: the two answers on a level beam
  (ctx, cx, cy, a) => {
    drawBalance(ctx, cx, cy - 18, 84, 1, 1, { alpha: a, colourA: C.curvature, colourB: C.kinetic });
  },
  // 9 · the formula, framed in rose
  (ctx, cx, cy, a) => {
    const size = 20;
    const w = F_ICON[8].metrics(size).width + 28;
    const x0 = cx - 62; // just clear of the arrow that comes in from step 8
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = C.force;
    ctx.fillStyle = rgba(C.force, 0.08);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, cy - 30, w, 60, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    F_ICON[8].draw(ctx, x0 + w / 2, cy, { size, align: 'center', alpha: a });
  },
];

export default defineScene({
  name: 'The whole chain',
  duration: 45,
  header: header(11, 'THE WHOLE CHAIN', 'From phase to force, in nine steps'),
  narration: [
    [0, 'The whole chain. A circle over every point. A rule for carrying the hand. Two roads that disagree. Disagreement per area: the curvature.'],
    [10.5, 'The action, with the phase. A nudge is a thin loop; its holonomy is the curvature\'s flux. Balanced against the mass, for every nudge.'],
    [LINE_AT, 'Which leaves one line: m x-double-dot flat equals e F, with U in the second slot.'],
    [CLOSING_AT, 'Force is curvature with the velocity plugged in.'],
    [RELATIVISTIC_AT, 'Relativistically it is the same formula, with the same slot order: the rate of change of momentum is e F, with the four-velocity in the second slot.'],
  ],

  draw(ctx, t) {
    for (let i = 0; i < COLS; i++) {
      const cx = CX(i);
      const on = seg(t, 0.2 + 0.08 * i, 1 + 0.08 * i);
      const lit = seg(t, litAt(i), litAt(i) + 0.8);
      const a = on * (0.22 + 0.78 * lit);
      // a brief glow as the step lights up
      const glow = fade(t, litAt(i), litAt(i) + 0.5, litAt(i) + 0.9, litAt(i) + 2.2);
      if (glow > 0.003) {
        ctx.save();
        ctx.globalAlpha *= 0.35 * glow;
        const g = ctx.createRadialGradient(cx, ICON_Y, 10, cx, ICON_Y, 95);
        g.addColorStop(0, C.fibre);
        g.addColorStop(1, 'rgba(242,207,99,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, ICON_Y, 95, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ICONS[i](ctx, cx, ICON_Y, a);
      text(ctx, String(i + 1), cx, ICON_Y - 80, { font: font.mono, size: 14, color: lit > 0.5 ? C.fibre : color.dim, align: 'center', alpha: on });
      wrap(ctx, LINES[i], cx, ICON_Y + 92, 150, 18, { font: font.mono, size: 14, color: lit > 0.5 ? color.ink : color.dim, alpha: on * (0.6 + 0.4 * lit), align: 'center' });
      if (i < 8) F_ICON[i].draw(ctx, cx, ICON_Y + 136, { size: 18, align: 'center', alpha: on * (0.35 + 0.65 * lit) });
      // the arrow to the next step
      if (i < COLS - 1) arrow(ctx, cx + 64, ICON_Y, cx + 94, ICON_Y, { color: color.dim, width: 1.2, head: 7, alpha: on * (0.4 + 0.6 * seg(t, litAt(i + 1) - 0.4, litAt(i + 1))) });
    }

    // the step being spoken, drawn large below the row: a cross-fade from one step to the next
    for (let i = 0; i < COLS; i++) {
      const until = i < COLS - 1 ? litAt(i + 1) : CLOSING_AT - 1.2;
      const big = fade(t, litAt(i) + 0.2, litAt(i) + 0.9, until, until + 0.6);
      if (big < 0.003) continue;
      ctx.save();
      // icon 9's box starts at cx − 62 (clear of the row's arrow); centre it here
      const dx = i === COLS - 1 ? 62 - (F_ICON[8].metrics(20).width + 28) / 2 : 0;
      ctx.translate(800 + dx * SPOT_SCALE, SPOT_Y);
      ctx.scale(SPOT_SCALE, SPOT_SCALE);
      ICONS[i](ctx, 0, 0, big);
      ctx.restore();
      text(ctx, LINES[i], 800, SPOT_Y + 70 * SPOT_SCALE + 8, { ...type.body, size: 24, color: color.ink, align: 'center', alpha: big });
    }

    // the closing line, large
    const closing = seg(t, CLOSING_AT, CLOSING_AT + 1.4);
    text(ctx, 'Force is curvature with the velocity plugged in.', 800, 582, { ...type.title, size: 46, color: C.fibre, align: 'center', alpha: closing });

    // the relativistic remark
    const rel = seg(t, RELATIVISTIC_AT, RELATIVISTIC_AT + 1);
    F_RELATIVISTIC.draw(ctx, 800, 664, { size: 30, align: 'center', alpha: rel });
    text(ctx, 'relativistically: the four-velocity U in the second slot of F', 800, 714, { ...type.note, size: 15, color: color.body, align: 'center', alpha: seg(t, RELATIVISTIC_AT + 0.6, RELATIVISTIC_AT + 1.6) });

    // the references
    const refs = seg(t, REFERENCES_AT, REFERENCES_AT + 1);
    text(ctx, 'READING', 100, 790, { ...type.eyebrow, size: 14, alpha: refs });
    wrap(ctx, 'Tong, Classical Dynamics §2.5.7 and General Relativity §2.4 (differential forms) · Feynman Lectures II §15-5 · Baez & Muniain, Gauge Fields, Knots and Gravity · Frankel, The Geometry of Physics · and, in this series, "The geometry of shape space".', 100, 818, 1400, 21, { ...type.note, size: 14, color: color.muted, alpha: refs });
    stamp(ctx, seg(t, 2, 3), 'every picture in this video was computed from the formulas shown');
  },
});
