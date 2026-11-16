// Scene 04: curvature. The same plane, roads and dials as scene 03. Shrinking the loop around a point,
// its holonomy per oriented area settles on a number, B at the centre; the number is painted over the
// plane as a heat map (the reveal); Stokes along the strip: cut into cells, the shared cuts cancel in
// pairs and the sum of the cell holonomies is exactly the boundary holonomy; then the vertical axis is
// relabelled from y to t, and the two roads become a worldline and its nudge.
import { defineScene, seg, fade, lerp, text, type, font, color, rgba, tex, line, arrow, slider, drag, C, header, frame, gridLines, axes, drawPath, drawPoint, drawStrip, drawDial, drawAngle, drawCurvatureMap, stamp, roundRect, fmt, clock, leverSim, track } from '../shared.js';
import { planeField, nudgedRoads, transport, roadsLoop, centroid, polygonArea, stripTiling } from '../math.js';

// ---- the shared layout of scenes 03 and 04 (the same code as in 03-holonomy.js) ----------------------

const P = frame({ x: 110, y: 170, w: 620, h: 620, u: [-2, 2], v: [-2, 2] });
const FIELD = planeField({ B0: 0.5, bumps: [{ B1: -1.6, c: [0.5, -0.3], s: 0.6 }] });
const HEIGHT = 2.8;
const N = 120;
const DIAL = { x: 1000, y: 320, r: 72 };
const COL = 900;
const MARGIN = 1.92; // |x| of the loop
const YMARGIN = 1.75; // |y| of the loop: the labels of P and Q stay inside the frame
const RANGE = 1.2; // |B| drawn fully opaque, and the span of the legend
const MAP_ALPHA = 0.75; // the painted field stays a tint under the roads and the grid

const XBAR = (() => {
  const { straight, nudged } = nudgedRoads({ x0: 0, y0: 0, y1: 1, eps: 1, n: N });
  return centroid(roadsLoop(nudged, straight))[0];
})();

function loopAt([cx, cy], eps, h = HEIGHT) {
  const x0min = -MARGIN - Math.min(0, eps);
  const x0max = MARGIN - Math.max(0, eps);
  const x0 = Math.min(x0max, Math.max(x0min, cx - eps * XBAR));
  const yc = Math.min(YMARGIN - h / 2, Math.max(-YMARGIN + h / 2, cy));
  const { straight, nudged } = nudgedRoads({ x0, y0: yc - h / 2, y1: yc + h / 2, eps, n: N });
  return { road1: straight, road2: nudged, x0, yc, eps, P: straight[0], Q: straight[N] };
}

const dragOffset = ([dx, dy]) => [dx / P.kx, -dy / P.ky];

/** A number with its sign (shared.js's fmt drops the plus). */
const signed = (v, digits = 2) => (v > 0.5 * 10 ** -digits ? '+' : '') + fmt(v, digits);

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

function roadArrow(ctx, F, road, u, dir, colour, alpha = 1) {
  if (alpha <= 0.003) return;
  const k = Math.round(u * (road.length - 1));
  const [x0, y0] = F.point(road[k - 3 * dir]);
  const [x1, y1] = F.point(road[k + 3 * dir]);
  arrow(ctx, x0, y0, x1, y1, { color: colour, width: 2.5, head: 11, alpha });
}

/** The plane: grid, axes (the vertical axis named by `yLabel`), the roads, the strip, P and Q. */
function drawPlane(ctx, L, { alpha = 1, strip = 1, loopArrows = 1, stripFill = rgba(C.curvature, 0.18), yLabel = 'y', ylAlpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  gridLines(ctx, P, { alpha });
  axes(ctx, P, { xTicks: [-2, -1, 0, 1, 2], yTicks: [-2, -1, 0, 1, 2], xLabel: 'x', alpha });
  text(ctx, yLabel, P.x + 14, P.y + 26, { font: font.display, italic: true, size: 20, color: color.muted, alpha: alpha * ylAlpha });
  drawStrip(ctx, P, L.road2, L.road1, { fill: stripFill, alpha: alpha * strip });
  drawPath(ctx, P, L.road1, { colour: C.path, width: 2.5, alpha });
  drawPath(ctx, P, L.road2, { colour: C.varied, width: 2.5, alpha });
  roadArrow(ctx, P, L.road2, 0.56, 1, C.fibre, alpha * loopArrows);
  roadArrow(ctx, P, L.road1, 0.44, -1, C.fibre, alpha * loopArrows);
  // P's and Q's labels to the left of the loop, or to its right when road 1 hugs the left edge
  const lx = P.X(L.x0) - 34 > P.x + 2 ? -30 : 14;
  drawPoint(ctx, P, L.P, { colour: C.path, r: 6, alpha, label: 'P', labelOffset: [lx, 30] });
  drawPoint(ctx, P, L.Q, { colour: C.path, r: 6, alpha, ringed: true, label: 'Q', labelOffset: [lx, -14] });
}

function roadLabels(ctx, L, alpha, { road1 = 'road 1', road2 = 'road 2 = road 1 + εη', u1 = 0.12 } = {}) {
  if (alpha <= 0.003) return;
  const style = { font: font.display, italic: true, size: 19, alpha };
  const width = (s) => {
    ctx.save();
    ctx.font = `italic 400 19px ${font.display}`;
    const w = ctx.measureText(s).width;
    ctx.restore();
    return w;
  };
  // road 1: to its left when there is room, else to its right
  const [x1, y1] = P.point(L.road1[Math.round(u1 * N)]);
  const leftOk = x1 - 12 - width(road1) > P.x + 4;
  text(ctx, road1, leftOk ? x1 - 12 : x1 + 12, y1 + 7, { ...style, color: C.path, align: leftOk ? 'right' : 'left' });
  // road 2: outside the apex of the nudge when there is room, else on the far side of road 1
  const [x2, y2] = P.point(L.road2[Math.round(0.5 * N)]);
  const w2 = width(road2);
  const s = L.eps >= 0 ? 1 : -1;
  let x = x2 + 14 * s;
  let align = s > 0 ? 'left' : 'right';
  let dy = 7;
  if (s > 0 && x + w2 > P.x + P.w - 4) {
    x = P.X(L.x0) - 14;
    align = 'right';
    dy = 34;
  } else if (s < 0 && x - w2 < P.x + 4) {
    x = P.X(L.x0) + 14;
    align = 'left';
    dy = 34;
  }
  text(ctx, road2, x, y2 + dy, { ...style, color: C.varied, align });
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

function drawQDials(ctx, th1, th2, { alpha = 1, wedge = 1, r = DIAL.r, x = DIAL.x, y = DIAL.y } = {}) {
  if (alpha <= 0.003) return;
  drawDial(ctx, x, y, r, th1, { colour: C.path, alpha, width: 3.5, fill: 'rgba(13,19,33,0.9)' });
  sector(ctx, x, y, r * 0.62, th1, th2, rgba(C.fibre, 0.22), alpha * wedge);
  drawAngle(ctx, x, y, r * 0.62, th1, th2, { colour: C.fibre, width: 3, alpha: alpha * wedge });
  drawDial(ctx, x, y, r, th2, { colour: C.varied, ringColour: 'rgba(0,0,0,0)', tick: false, alpha, width: 3.5 });
  wedgeLabel(ctx, x, y, r, th1, th2, alpha * wedge);
}

// ---- this scene ------------------------------------------------------------------------------------

const EPS = 0.6; // the nudge of the full-size loop; the loop shrinks to a point as size → 0
const CENTRE = [[0, [0.5, -0.3]], [21, [0.5, -0.3]], [25.5, [-1.2, 0.8]], [50, [-1.2, 0.8]], [54, [0.1, -0.1]]];
const REVEAL = [27, 33];
const STOKES_AT = 55;
const WAVE_AT = 58; // the shared cuts dim out in pairs, from P to Q
const RELABEL = [73, 76];
const AT = 7;
const HANDOVER = 49.5;
const VALUE_X = COL + 330; // readout values, right-aligned
const BAR = { x: COL, y: 584, w: 480 }; // the number line that becomes the legend

const HOL = tex(String.raw`\Delta\theta = \int_{\text{road 2}}\!\omega \;-\; \int_{\text{road 1}}\!\omega \;=\; \oint\omega`, 'Δθ = ∫_{road 2} ω − ∫_{road 1} ω = ∮ω');
const CURV = tex(String.raw`\Omega(u,v) = \lim_{\text{area}\to 0}\frac{\Delta\theta}{\text{area}},\qquad \Omega(v,u) = -\Omega(u,v),\qquad \Omega = d\omega`, 'Ω(u, v) = lim Δθ / area,   Ω(v, u) = −Ω(u, v),   Ω = dω');
const FIELDF = tex(String.raw`\Omega = B(x,y)\,dx\wedge dy`, 'Ω = B(x, y) dx∧dy');
const STOKES = tex(String.raw`\oint_{\partial S}\omega \;=\; \sum_{\text{cells}}\oint\omega \;=\; \iint_S \Omega \;=\; \iint_S B\,dx\,dy`, '∮_∂S ω = Σ_cells ∮ω = ∬_S Ω = ∬_S B dx dy');
const SPACETIME = tex(String.raw`\Omega = E\,dx\wedge dt`, 'Ω = E dx∧dt');

/** A soft dark vignette over the frame, so the painted field has no hard square edge. */
function vignette(ctx, alpha) {
  if (alpha <= 0.003) return;
  const cx = P.x + P.w / 2;
  const cy = P.y + P.h / 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createRadialGradient(cx, cy, P.w * 0.4, cx, cy, P.w * 0.74);
  g.addColorStop(0, 'rgba(13,19,33,0)');
  g.addColorStop(1, 'rgba(13,19,33,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(P.x, P.y, P.w, P.h);
  ctx.restore();
}

/** A readout row: label in muted mono, the value right-aligned in colour. */
function row(ctx, label, value, y, colour, alpha, { digits = 4, unit = '', x = COL, valueX = VALUE_X } = {}) {
  if (alpha <= 0.003) return;
  text(ctx, label, x, y, { font: font.mono, size: 16, color: color.muted, alpha });
  text(ctx, `${signed(value, digits)}${unit}`, valueX, y, { font: font.mono, size: 17, color: colour, alpha, align: 'right' });
}

/** The number line for B: two marks (Δθ/area in gold, B at the centre in ink); at the reveal it becomes the legend. */
function numberLine(ctx, ratio, bc, { alpha, legend, label, name = 'B' }) {
  if (alpha <= 0.003) return;
  const { x, y, w } = BAR;
  const X = (v) => x + w / 2 + (Math.max(-RANGE, Math.min(RANGE, v)) / RANGE) * (w / 2);
  const plain = 1 - legend;
  line(ctx, x, y + 5, x + w, y + 5, { color: color.line, width: 1.5, alpha: alpha * plain });
  for (const v of [-RANGE, 0, RANGE]) line(ctx, X(v), y + 1, X(v), y + 9, { color: color.line, width: 1.5, alpha: alpha * plain });
  if (legend > 0.003) {
    // the legend of the painted map: teal for B < 0, violet for B > 0
    ctx.save();
    ctx.globalAlpha *= alpha * legend;
    for (const [x0, x1, c0, c1] of [[x, x + w / 2, rgba(C.curvatureNeg, 0.8), rgba(C.curvatureNeg, 0.08)], [x + w / 2, x + w, rgba(C.curvature, 0.08), rgba(C.curvature, 0.8)]]) {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      roundRect(ctx, x0, y, x1 - x0, 10, 5);
      ctx.fill();
    }
    ctx.restore();
    text(ctx, label, x + w + 16, y + 10, { font: font.mono, size: 14, color: C.curvature, alpha: alpha * legend });
  }
  // the tick labels stay put through the reveal; one gives way to the B mark below the bar
  const gx = X(ratio);
  const bx = X(bc);
  for (const [v, align, dx] of [[-RANGE, 'left', 14], [0, 'center', 0], [RANGE, 'right', -14]]) {
    const clear = seg(Math.abs(X(v) + dx - bx), 22, 34);
    text(ctx, v === 0 ? '0' : fmt(v, 1), X(v), y + 28, { font: font.mono, size: 13, color: color.muted, align, alpha: alpha * clear });
  }
  // the marks: Δθ/area above the bar (gold), B at the centre below it (ink), each with its label
  line(ctx, gx, y - 18, gx, y + 12, { color: C.fibre, width: 3, alpha });
  text(ctx, 'Δθ / area', gx, y - 26, { font: font.mono, size: 14, color: C.fibre, align: 'center', alpha });
  line(ctx, bx, y - 2, bx, y + 14, { color: color.ink, width: 2, alpha });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.ink;
  ctx.beginPath();
  ctx.moveTo(bx, y + 14);
  ctx.lineTo(bx - 6, y + 24);
  ctx.lineTo(bx + 6, y + 24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  text(ctx, `${name}(centre)`, bx, y + 50, { font: font.mono, size: 14, color: color.ink, align: 'center', alpha });
}

export default defineScene({
  name: 'Holonomy per area',
  duration: 95,
  header: header(4, 'CURVATURE', 'Holonomy per unit of oriented area'),
  narration: [
    [0, 'Same two roads, same dials. Now shrink the loop around a point: the holonomy shrinks with the area.'],
    [8, 'Holonomy per unit of oriented area is the curvature, capital Omega. Swap the two directions spanning the area and its sign flips: a two-form, Omega equals d omega. And it settles, on B at the centre.'],
    [22, 'Carry the small loop to an empty corner: a different number.'],
    [27, 'Now paint what the loops were detecting: a density of holonomy per area, Omega equals B d x wedge d y. B is in units of h-bar over e: radians per unit area.'],
    [40, 'A magnetic field, seen as curvature. The plane is flat; the bending lives upstairs, in how the dials are stitched. Loops are its meters.'],
    [HANDOVER, 'Your turn: shrink the loop over the teal bump, then over an empty corner.'],
    [STOKES_AT, 'Cut the strip into cells. Every inner cut is walked twice, in opposite directions, and cancels; only the boundary survives.'],
    [64, 'So the holonomy of the big loop is the sum over the cells, and as they shrink, the integral of the curvature. Stokes.'],
    [RELABEL[0], 'Nothing here used that the vertical axis is space. Call it time. A path is now a worldline, a nudged path a worldline pushed sideways, and the two enclose a thin loop. A nudge in time is a loop in spacetime. Hold that picture. First: which worldline does a particle take?'],
  ],
  beats: [
    [3, 'Shrink it'],
    [REVEAL[0], 'The painted field'],
    [HANDOVER, 'Your turn'],
    [STOKES_AT, 'Stokes'],
    [RELABEL[0], 'Call it time'],
  ],
  handovers: [{ at: HANDOVER, prompt: 'Your turn: shrink the loop over the teal bump, then over an empty corner.' }],
  exploreFrom: AT,
  controls: {
    size: slider('Loop size', { min: 0.15, max: 1, step: 0.01, value: [[0, 1], [3, 1], [13, 0.2], [26, 0.2], [29, 0.6]] }),
    loop: drag('Drag the loop across the plane', { region: P.region }),
    cells: slider('Cells along the strip', { min: 1, max: 24, step: 1, value: [[0, 1], [STOKES_AT - 0.5, 1], [57, 6], [64, 24]], lens: true, digits: 0 }),
  },
  sim: leverSim(['size']),

  draw(ctx, t, live) {
    const tt = clock(t, live, AT);
    const { size, loop: dragged, cells } = live.input;
    const [ox, oy] = dragOffset(dragged);
    const centre = [track(tt, CENTRE.map(([at, c]) => [at, c[0]])) + ox, track(tt, CENTRE.map(([at, c]) => [at, c[1]])) + oy];
    const L = loopAt(centre, EPS * size, HEIGHT * size);
    const th1 = transport(FIELD, L.road1, 0);
    const th2 = transport(FIELD, L.road2, 0);
    const dtheta = th2[N] - th1[N];
    const loopPts = roadsLoop(L.road2, L.road1);
    const area = polygonArea(loopPts); // counter-clockwise: positive
    const cen = centroid(loopPts);
    const bc = FIELD.B(cen[0], cen[1]);
    const ratio = dtheta / area;
    const n = Math.max(1, Math.round(cells));
    const reveal = seg(tt, REVEAL[0], REVEAL[1]);
    const relabel = seg(tt, RELABEL[0], RELABEL[1]);
    const cellsOn = Math.max(seg(tt, STOKES_AT, STOKES_AT + 1), n > 1 ? 1 : 0) * (1 - relabel);
    const T = cellsOn > 0.003 ? stripTiling(FIELD, L.road1, L.road2, n) : null;

    // the plane: the heat map under the grid once revealed; the strip's violet fades to a neutral tint over it
    const on = seg(tt, 0.2, 1.2);
    drawCurvatureMap(ctx, P, FIELD.B, { key: 'field', range: RANGE, alpha: MAP_ALPHA * reveal * on });
    vignette(ctx, reveal * on);
    drawPlane(ctx, L, { alpha: on, strip: 1 - reveal, yLabel: 'y', ylAlpha: 1 - relabel });
    text(ctx, 't', P.x + 14, P.y + 26, { font: font.display, italic: true, size: 20, color: color.muted, alpha: on * relabel });
    drawStrip(ctx, P, L.road2, L.road1, { fill: rgba(color.ink, 0.1), alpha: on * reveal * (1 - 0.5 * cellsOn) });
    if (T) drawCells(ctx, L, T, tt, cellsOn * on);
    // the centre's label left of road 1 (right of the dot when road 1 hugs the edge); it gives way to the cell numbers
    const cenAlpha = on * fade(tt, 3, 4, RELABEL[0], RELABEL[1]);
    const cenLeft = P.X(L.x0) - 64 > P.x + 2;
    drawPoint(ctx, P, cen, { colour: color.ink, r: 3.5, alpha: cenAlpha, label: 'centre', labelOffset: cenLeft ? [P.X(L.x0) - P.X(cen[0]) - 10, 5] : [10, 5], labelStyle: { size: 15, align: cenLeft ? 'right' : 'left', alpha: cenAlpha * (1 - cellsOn) } });
    roadLabels(ctx, L, on * (1 - relabel) * seg(size, 0.5, 0.58) * (1 - cellsOn));
    roadLabels(ctx, L, on * relabel, { road1: 'worldline x(t)', road2: 'nudged: x(t) + εη(t)' });

    // the two dials at Q, superimposed (as in scene 03)
    const dialsOn = seg(tt, 1, 2);
    drawQDials(ctx, th1[N], th2[N], { alpha: dialsOn, wedge: seg(tt, 1.5, 2.5) });
    text(ctx, 'the two dials at Q, superimposed', 1140, 296, { ...type.body, size: 20, alpha: dialsOn });
    text(ctx, 'ink hand: carried along road 1', 1140, 330, { font: font.mono, size: 15, color: C.path, alpha: dialsOn * (1 - relabel) });
    text(ctx, 'orange hand: carried along road 2', 1140, 356, { font: font.mono, size: 15, color: C.varied, alpha: dialsOn * (1 - relabel) });
    text(ctx, 'ink hand: carried along the worldline', 1140, 330, { font: font.mono, size: 15, color: C.path, alpha: dialsOn * relabel });
    text(ctx, 'orange hand: carried along its nudge', 1140, 356, { font: font.mono, size: 15, color: C.varied, alpha: dialsOn * relabel });

    // readouts: Δθ, the oriented area, their ratio, and B at the centre
    row(ctx, 'Δθ', dtheta, 440, C.fibre, seg(tt, 2, 3), { unit: ' rad' });
    const shrinkRows = 1 - cellsOn; // while the strip is cut into cells, its sums take this place
    row(ctx, 'oriented area', area, 468, color.body, seg(tt, 3.5, 4.5) * shrinkRows);
    row(ctx, 'Δθ / area', ratio, 496, C.fibre, seg(tt, 4.5, 5.5) * shrinkRows);
    const bColour = bc >= 0 ? C.curvature : C.curvatureNeg;
    row(ctx, relabel > 0.5 ? 'E at the centre' : 'B at the centre', bc, 524, bColour, seg(tt, 6, 7) * shrinkRows);
    numberLine(ctx, ratio, bc, { alpha: seg(tt, 6, 7) * shrinkRows, legend: reveal, label: relabel > 0.5 ? 'Ω = E dx∧dt' : 'Ω = B dx∧dy', name: relabel > 0.5 ? 'E' : 'B' });

    // formulas: Ω as holonomy per area; the painted field; Stokes; the relabelling
    CURV.draw(ctx, COL, 690, { size: 25, alpha: fade(tt, 14, 15, 63, 64) });
    STOKES.draw(ctx, COL, 690, { size: 24, alpha: fade(tt, 64, 65, RELABEL[0], RELABEL[1]) });
    FIELDF.draw(ctx, COL, 736, { size: 24, alpha: fade(tt, 30, 31, RELABEL[0], RELABEL[1]) });
    SPACETIME.draw(ctx, COL, 736, { size: 24, alpha: seg(tt, RELABEL[0], RELABEL[1]) });
    text(ctx, 'B in units of ħ/e: radians of holonomy per unit area', COL, 768, { ...type.note, size: 14, alpha: fade(tt, 33, 34, RELABEL[0], RELABEL[1]) });
    text(ctx, 'the vertical axis is now t; E is in radians per unit area of spacetime', COL, 768, { ...type.note, size: 14, alpha: seg(tt, RELABEL[0] + 1, RELABEL[1] + 1) });

    // Stokes along the strip
    if (T) {
      const a = cellsOn;
      text(ctx, `n = ${n} ${n === 1 ? 'cell' : 'cells'} · their holonomies add up to the boundary holonomy, to every digit`, COL, 480, { ...type.note, size: 14, color: C.fibre, alpha: a });
      row(ctx, 'Σ cell holonomies', T.sumHol, 516, C.fibre, a, { digits: 5, valueX: COL + 300 });
      row(ctx, '∮ω = Δθ', T.boundary, 544, C.fibre, a, { digits: 5, valueX: COL + 300 });
      row(ctx, 'Σ B(centre) · area', T.sumEstimate, 516, C.curvature, a, { digits: 5, x: COL + 340, valueX: COL + 640 });
      row(ctx, '∬ B dA', T.flux, 544, C.curvature, a, { digits: 5, x: COL + 340, valueX: COL + 640 });
    }
    // the relabelling
    text(ctx, 'Next: which worldline does a particle take?', COL, 812, { ...type.note, size: 14, color: color.muted, alpha: seg(tt, 84, 85) });

    text(ctx, `ε = ${fmt(EPS * size, 2)} · loop size ${fmt(size, 2)} · ε and the loop's height scale together`, P.x, 862, { ...type.note, size: 14, alpha: seg(tt, 2, 3) * (1 - relabel) });
    stamp(ctx, seg(tt, 2, 3), `Δθ from the transported dials; area and centre from the loop; ${relabel > 0.5 ? 'E(x, t)' : 'B(x, y)'} from the field painted above`);
  },
});

/** The strip cut into n cells, each tinted by its holonomy, the cuts between them dimming out in pairs. */
function drawCells(ctx, L, T, tt, alpha) {
  if (alpha <= 0.003) return;
  const holMax = Math.max(1e-6, ...T.cells.map((c) => Math.abs(c.hol)));
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const cell of T.cells) {
    const tint = cell.hol >= 0 ? C.curvature : C.curvatureNeg;
    drawPath(ctx, P, cell.corners, { colour: rgba(C.fibre, 0.35), width: 1, close: true, fill: rgba(tint, 0.15 + 0.45 * (Math.abs(cell.hol) / holMax)) });
  }
  // the shared cuts: each walked twice, in opposite directions, by the two cells it separates
  const Nn = T.cells.length;
  T.cells.forEach((cell, j) => {
    if (j === 0) return;
    const wave = seg(tt, WAVE_AT + (3 * (j - 1)) / Math.max(1, Nn - 1), WAVE_AT + 1.2 + (3 * (j - 1)) / Math.max(1, Nn - 1));
    const a = lerp(1, 0.22, wave);
    const [x1, y1] = P.point(L.road1[cell.i0]);
    const [x2, y2] = P.point(L.road2[cell.i0]);
    line(ctx, x1, y1, x2, y2, { color: C.fibre, width: 2, alpha: a });
    if (Math.abs(x2 - x1) > 30) {
      // the cell below walks this cut from road 2 to road 1, the cell above from road 1 to road 2
      const m = (x1 + x2) / 2;
      const d = Math.sign(x2 - x1) * 9;
      arrow(ctx, m + d, y1 + 4, m - d, y1 + 4, { color: C.fibre, width: 2, head: 8, alpha: a });
      arrow(ctx, m - d, y1 - 4, m + d, y1 - 4, { color: C.fibre, width: 2, head: 8, alpha: a });
    }
  });
  // the holonomy of every cell, when there is room for the numbers
  if (Nn <= 8) {
    for (const cell of T.cells) {
      const xs = cell.corners.map((c) => c[0]);
      const ys = cell.corners.map((c) => c[1]);
      const right = P.X(Math.max(...xs)) + 12;
      const fits = right + 64 < P.x + P.w;
      const x = fits ? right : P.X(Math.min(...xs)) - 12;
      text(ctx, fmt(cell.hol, 3, true), x, P.Y((Math.min(...ys) + Math.max(...ys)) / 2) + 4, { font: font.mono, size: 13, color: C.fibre, align: fits ? 'left' : 'right' });
    }
  }
  ctx.restore();
}
