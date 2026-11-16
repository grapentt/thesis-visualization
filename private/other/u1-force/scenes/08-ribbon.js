// Scene 08: a nudge is a loop. Scene 3's two roads become a worldline and its nudge in spacetime;
// the two transported dials disagree at B by the holonomy of the thin loop between them, and a
// sweeping element paints the ribbon with the curvature flux Ω(η, U) dt, which adds up to the same
// angle. Live: the nudge (ε, t₀) are levers, the gauge a lens.
import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, rgba, line, arrow, dot, slider, choice, C, header, frame, axes, clipped, drawPath, drawPoint, drawRunner, drawDial, drawAngle, drawStrip, drawParallelogram, readout, pill, panel, stamp, clock, leverSim, fmt } from '../shared.js';
import { times, shoot, electricField, worldlineTransport, velocities, hump, varied, ribbonFlux } from '../math.js';

const E = 2;
const T = 2;
const N = 400;
const DT = T / N;
const XA = -1;
const XB = 0.8;
const S = frame({ x: 110, y: 190, w: 540, h: 600, u: [-2, 2], v: [0, 2] });
const TS = times(T, N);
const PHYS = shoot(() => E, XA, XB, T, N).xs;
const X0 = (XA + XB) / 2; // scene 3's vertical road, where the picture starts
const R = 900; // the right-hand column
const FIELDS = { phi: electricField({ E, gauge: 'phi' }), vec: electricField({ E, gauge: 'vec' }) };
const ELEMENT_DT = 0.08; // the visible step U dt of the sweeping element

const MORPH = [3.5, 7.5]; // the vertical road bends into the worldline
const LOOP_AT = 11; // the loop's orientation, and the ribbon is named
const CLIMB = [13.5, 19]; // the two runners carry their dials from A to B
const STOKES_AT = 21.5;
const PAINT = [22.5, 34.5]; // the element sweeps up the ribbon
const LEVERS = [38.5, 41.5, 44.5]; // push harder, move the nudge, flip it: each said as it happens
const NAMES_AT = 50.5;
const HANDOVER_AT = 60;
const GAUGE_AT = 65;
const END_AT = 74;
const AT = PAINT[1] + 2; // everything the levers affect is on screen

const F_HOL1 = tex(String.raw`\Delta\theta = \theta_2(B) - \theta_1(B) = \int_{\rm nudged}\omega - \int_{\rm original}\omega = \oint \omega`, 'Δθ = θ₂(B) − θ₁(B) = ∫_nudged ω − ∫_original ω = ∮ω');
const F_HOL2 = tex(String.raw`\Delta\theta = \theta_2(B) - \theta_1(B) = \oint \omega = \iint_{\rm ribbon} \Omega`, 'Δθ = θ₂(B) − θ₁(B) = ∮ω = ∬_ribbon Ω');
const F_ELEMENT = tex(String.raw`\iint_{\rm ribbon} \Omega = \int \Omega(\varepsilon\eta,\, U)\,dt = \varepsilon\int E\,\eta\,dt`, '∬_ribbon Ω = ∫ Ω(εη, U) dt = ε ∫ E η dt');
const F_DS = tex(String.raw`\delta S_{\rm int} = \hbar\,\Delta\theta = \hbar\iint_{\rm ribbon}\Omega = \hbar\int \Omega(\varepsilon\eta,\, U)\,dt = e\int F(\varepsilon\eta,\, U)\,dt`, 'δS_int = ħ Δθ = ħ ∬_ribbon Ω = ħ ∫ Ω(εη, U) dt = e ∫ F(εη, U) dt');

/** A small arrowhead on a polyline at index i, pointing along (dir = +1) or against (−1) it. */
function arrowOn(ctx, F, pts, i, dir, colour, alpha) {
  if (alpha <= 0.003) return;
  const j = Math.min(Math.max(i - 4 * dir, 0), pts.length - 1);
  const [x0, y0] = F.point(pts[j]);
  const [x1, y1] = F.point(pts[i]);
  const d = Math.hypot(x1 - x0, y1 - y0) || 1;
  arrow(ctx, x1 - ((x1 - x0) / d) * 18, y1 - ((y1 - y0) / d) * 18, x1, y1, { color: colour, width: 2.5, head: 13, alpha });
}

/** The two dials at B drawn as one: two hands, the zero mark of the current gauge, the gold wedge, and Δθ outside the ring beside the wedge. */
function twoDials(ctx, x, y, r, th1, th2, zero, alpha) {
  if (alpha <= 0.003) return;
  drawDial(ctx, x, y, r, th1, { alpha, zero, fill: 'rgba(13,19,33,0.9)', colour: C.path, width: 3.5 });
  drawDial(ctx, x, y, r, th2, { alpha, zero, colour: C.varied, width: 3.5, tick: false, ringColour: 'rgba(0,0,0,0)' });
  drawAngle(ctx, x, y, 0.62 * r, th1, th2, { colour: C.fibre, alpha, width: 2.5 });
  const mid = (th1 + th2) / 2;
  const lr = r + 24;
  text(ctx, 'Δθ', x + lr * Math.cos(mid), y - lr * Math.sin(mid) + 7, { font: font.display, italic: true, size: 20, color: C.fibre, align: 'center', alpha: alpha * lin(Math.abs(th2 - th1), 0.005, 0.03) });
}

/** The axis names of the spacetime frame: t above the time axis, x past the end of the space axis (clear of the tick labels and of the caption below). */
function axisNames(ctx, F, alpha) {
  const style = { font: font.display, italic: true, size: 20, color: color.muted, alpha };
  text(ctx, 't', F.x, F.y - 16, { ...style, align: 'center' });
  text(ctx, 'x', F.x + F.w + 16, F.y + F.h + 7, style);
}

export default defineScene({
  name: 'A nudge is a loop',
  duration: 85,
  header: header(8, 'THE RIBBON', 'Varying the worldline encloses a loop'),
  narration: [
    [0, 'Scene three’s picture, now in spacetime. Under the field E, the road bends into the physical worldline from A to B; the nudge, epsilon eta, rides along.'],
    [LOOP_AT, 'The original and its nudge enclose a thin loop: the ribbon. Carry a dial along each. At B they disagree by the loop’s holonomy, delta theta.'],
    [STOKES_AT, 'Stokes: that holonomy is the curvature’s flux through the ribbon. Each small piece is spanned by the push eta, then the step U d t; its flux is capital Omega of eta and U, d t. Painted up, they add to delta theta.'],
    [LEVERS[0], 'Push harder.'],
    [LEVERS[1], 'Move the nudge.'],
    [LEVERS[2], 'Flip it: the violet flux and the gold disagreement stay equal, for every nudge.'],
    [NAMES_AT, 'Three names, one angle: the holonomy of the loop; the Aharonov–Bohm phase between two neighbouring paths; and delta S over h-bar.'],
    [HANDOVER_AT, 'Your turn: move the nudge. The ribbon and the dials keep agreeing.'],
    [GAUGE_AT, 'Now switch the gauge. Each dial’s reading changes; their disagreement does not. The flux through the ribbon never knew about the gauge.'],
    [END_AT, 'A nudge is a loop, and the loop’s holonomy is the change of the interaction action. Next: what the mass says to the same nudge.'],
  ],
  beats: [
    [CLIMB[0], 'Carry two dials'],
    [STOKES_AT, 'Paint the ribbon'],
    [LEVERS[0], 'Move the nudge'],
    [NAMES_AT, 'Three names, one angle'],
    [HANDOVER_AT, 'Your turn'],
    [GAUGE_AT, 'Change the gauge'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: move the nudge; the ribbon and the dials keep agreeing.' }],
  exploreFrom: 1.5,
  controls: {
    // push harder, move the nudge, flip it (each as the narration names it), then back to the start
    eps: slider('Nudge ε', { min: -1, max: 1, step: 0.01, value: [[0, 0.3], [LEVERS[0], 0.3], [LEVERS[0] + 2, 0.8], [LEVERS[2], 0.8], [LEVERS[2] + 2, -0.6], [NAMES_AT, -0.6], [NAMES_AT + 2.5, 0.3]] }),
    where: slider('Nudge at t₀ / T', { min: 0.12, max: 0.88, step: 0.01, value: [[0, 0.5], [LEVERS[1], 0.5], [LEVERS[1] + 2, 0.3], [NAMES_AT, 0.3], [NAMES_AT + 2.5, 0.5]] }),
    gauge: choice('Gauge of ω', { phi: 'ω = E x dt', vec: 'ω = −E t dx' }, { value: [[0, 'phi'], [GAUGE_AT + 1, 'vec']], lens: true }),
  },
  sim: leverSim(['eps', 'where']),

  draw(ctx, t, live) {
    const tt = clock(t, live, AT);
    const eps = live?.input?.eps ?? 0.3;
    const CURV = eps * E >= 0 ? C.curvature : C.curvatureNeg; // violet for positive flux, teal for negative
    const where = live?.input?.where ?? 0.5;
    const gauge = live?.input?.gauge ?? 'phi';
    const field = FIELDS[gauge];

    // ---- the geometry at this moment: scene 3's vertical road bending into the worldline ----
    const bend = seg(tt, MORPH[0], MORPH[1]);
    const xs = PHYS.map((x) => lerp(X0, x, bend));
    const etas = TS.map((tau) => hump(tau / T, where, 0.18));
    const nudged = varied(xs, etas, eps);
    const pts = xs.map((x, i) => [x, TS[i]]);
    const pts2 = nudged.map((x, i) => [x, TS[i]]);
    const vs = velocities(xs, T);
    const th1 = worldlineTransport(field, xs, T);
    const th2 = worldlineTransport(field, nudged, T);
    const abs1 = gauge === 'phi' ? th1 : worldlineTransport(FIELDS.phi, xs, T); // the hands' positions on the fibre
    const abs2 = gauge === 'phi' ? th2 : worldlineTransport(FIELDS.phi, nudged, T);
    const dTheta = th2[N] - th1[N];
    const flux = ribbonFlux(field, xs, etas, eps, T).flux;

    // the painted part of the ribbon and the sweeping element
    const kPaint = tt < PAINT[1] ? Math.round(N * lin(tt, PAINT[0], PAINT[1])) : N;
    const glide = ((tt - PAINT[1]) / 10) % 1;
    const kEl = tt < PAINT[1] ? kPaint : Math.round(N * glide);
    const elAlpha = tt < PAINT[1] ? seg(tt, PAINT[0] - 0.5, PAINT[0]) : Math.min(1, 6 * Math.min(glide, 1 - glide));
    const painted = kPaint >= 1 ? ribbonFlux(field, xs.slice(0, kPaint + 1), etas.slice(0, kPaint + 1), eps, kPaint * DT).flux : 0;

    // ---- the spacetime frame ----
    const on = seg(t, 0.2, 1.2);
    axes(ctx, S, { xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 1, 2], grid: true, alpha: on });
    axisNames(ctx, S, on);
    const stripOn = seg(tt, 0.6, 1.6);
    clipped(ctx, S, () => {
      // the thin loop: faint from the start, painted violet by the element
      drawStrip(ctx, S, pts, pts2, { fill: rgba(CURV, 0.1), alpha: stripOn });
      if (kPaint >= 1) drawStrip(ctx, S, pts.slice(0, kPaint + 1), pts2.slice(0, kPaint + 1), { fill: rgba(CURV, 0.34), alpha: seg(tt, PAINT[0], PAINT[0] + 0.5) });
      drawPath(ctx, S, pts, { colour: C.path, width: 3, alpha: on });
      drawPath(ctx, S, pts2, { colour: C.varied, width: 2.5, alpha: stripOn });
      // the loop's orientation: up the nudged path, back down the original
      const orient = seg(tt, LOOP_AT + 0.5, LOOP_AT + 1.5);
      arrowOn(ctx, S, pts2, Math.round(0.62 * N), 1, C.fibre, orient); // gold, as the loop arrows of scenes 3 and 4
      arrowOn(ctx, S, pts, Math.round(0.38 * N), -1, C.fibre, orient);
      // the element: spanned by εη across, then U dt along
      if (elAlpha > 0.003 && kEl < N - 2) {
        drawParallelogram(ctx, S, pts[kEl], [eps * etas[kEl], 0], [vs[kEl] * ELEMENT_DT, ELEMENT_DT], { fill: rgba(CURV, 0.7), stroke: CURV, alpha: elAlpha, width: 1.5 });
      }
    }, 8);
    // endpoints: P, Q of scene 3 become A, B
    const pq = 1 - seg(tt, MORPH[0] + 0.5, MORPH[0] + 1.5);
    const ab = seg(tt, MORPH[0] + 1, MORPH[0] + 2);
    drawPoint(ctx, S, pts[0], { colour: C.path, alpha: on, r: 6 });
    drawPoint(ctx, S, pts[N], { colour: C.path, alpha: on, r: 6 });
    text(ctx, 'P', S.X(pts[0][0]) - 30, S.Y(0) - 2, { font: font.display, italic: true, size: 22, color: C.path, alpha: on * pq });
    text(ctx, 'Q', S.X(pts[N][0]) - 30, S.Y(T) + 8, { font: font.display, italic: true, size: 22, color: C.path, alpha: on * pq });
    text(ctx, 'A', S.X(pts[0][0]) - 32, S.Y(0) - 2, { font: font.display, italic: true, size: 22, color: C.path, alpha: ab });
    text(ctx, 'B', S.X(pts[N][0]) - 32, S.Y(T) + 8, { font: font.display, italic: true, size: 22, color: C.path, alpha: ab });
    const kLabel = Math.round(Math.min(where, 0.62) * N); // beside the nudge, below the dials at B
    text(ctx, 'x + εη', S.X(nudged[kLabel]) + (eps >= 0 ? 12 : -12), S.Y(TS[kLabel]) + 6, { font: font.display, italic: true, size: 20, color: C.varied, align: eps >= 0 ? 'left' : 'right', alpha: stripOn });
    // one caption under the frame: what the picture is, then (while the ribbon is painted) what the element is
    // (the two captions fade one after the other, never on top of each other)
    const elCaption = fade(tt, PAINT[0] + 0.6, PAINT[0] + 1.2, PAINT[1] + 1, PAINT[1] + 1.6);
    const capY = S.y + S.h + 50;
    const cap0 = seg(t, 1, 2) * (1 - fade(tt, PAINT[0], PAINT[0] + 0.6, PAINT[1] + 1.6, PAINT[1] + 2.2));
    text(ctx, 'scene 3: two roads and the thin loop between them', S.x, capY, { ...type.note, color: color.body, alpha: cap0 * (1 - seg(tt, MORPH[0], MORPH[0] + 0.5)) });
    text(ctx, 'the worldline under E and its nudge', S.x, capY, { ...type.note, color: color.body, alpha: cap0 * seg(tt, MORPH[0] + 0.5, MORPH[0] + 1) });
    text(ctx, 'the element Ω(η, U) dt: η across, then U dt along', S.x, capY, { ...type.note, color: CURV, alpha: elCaption });

    // the two runners with their dials
    const kRun = Math.round(N * seg(tt, CLIMB[0], CLIMB[1]));
    const runAlpha = fade(tt, CLIMB[0] - 0.6, CLIMB[0], CLIMB[1] + 0.8, CLIMB[1] + 1.6);
    if (runAlpha > 0.003) {
      const zeroK = abs1[kRun] - th1[kRun];
      const dy = -12 + (30 * kRun) / N; // the dials ride a little above the runners near A, a little below near B
      drawRunner(ctx, S, pts[kRun], { colour: C.path, alpha: runAlpha, r: 6, dial: abs1[kRun], dialOffset: [-60, dy], dialR: 22, zero: zeroK });
      drawRunner(ctx, S, pts2[kRun], { colour: C.varied, alpha: runAlpha, r: 6, dial: abs2[kRun], dialOffset: [60, dy], dialR: 22, zero: abs2[kRun] - th2[kRun] });
    }
    // the two dials at B, superimposed: in scene 3's picture, and once the runners have arrived
    const dialsAlpha = Math.max(seg(tt, 1.2, 2.2) * (1 - seg(tt, CLIMB[0] - 0.8, CLIMB[0])), seg(tt, CLIMB[1] + 0.6, CLIMB[1] + 1.5));
    const DX = 560;
    const DY = 245;
    const [bx, by] = S.point(pts[N]);
    line(ctx, bx, by, DX - 36, DY - 22, { color: rgba(C.path, 0.5), width: 1, alpha: dialsAlpha });
    const zeroB = abs1[N] - th1[N];
    twoDials(ctx, DX, DY, 42, abs1[N], abs2[N], zeroB, dialsAlpha);
    text(ctx, `ε = ${fmt(eps, 2)}    t₀/T = ${fmt(where, 2)}`, S.x, 874, { ...type.note, color: color.body, alpha: seg(t, 1, 2) });

    // ---- the right column ----
    // the two readings: carried along with the runners, then the values at B
    const carrying = runAlpha > 0.003 && tt < CLIMB[1] + 0.6;
    const readAlpha = Math.max(dialsAlpha, runAlpha);
    pill(ctx, 'THE TWO DIALS DISAGREE', R, 208, C.fibre, readAlpha);
    readout(ctx, carrying ? 'θ₁ =' : 'θ₁(B) =', carrying ? th1[kRun] : th1[N], R, 246, { colour: C.path, size: 16, alpha: readAlpha, unit: ' rad' });
    readout(ctx, carrying ? 'θ₂ =' : 'θ₂(B) =', carrying ? th2[kRun] : th2[N], R, 272, { colour: C.varied, size: 16, alpha: readAlpha, unit: ' rad' });
    readout(ctx, 'Δθ = θ₂(B) − θ₁(B) =', dTheta, R, 306, { colour: C.fibre, size: 18, digits: 3, alpha: dialsAlpha, unit: ' rad' });
    const paintOn = seg(tt, PAINT[0], PAINT[0] + 1);
    pill(ctx, 'THE RIBBON’S FLUX', R, 354, CURV, paintOn);
    readout(ctx, '∬ Ω over the painted ribbon =', painted, R, 392, { colour: CURV, size: 18, digits: 3, alpha: paintOn, unit: ' rad' });
    const agree = seg(tt, PAINT[1] + 0.5, PAINT[1] + 1.5);
    text(ctx, Math.abs(flux - dTheta) < 2e-3 ? 'equal, for every ε and t₀ (uniform E: exactly)' : `differ by ${fmt(flux - dTheta, 3)}`, R, 420, { ...type.note, size: 14, color: color.body, alpha: agree });
    const stokes = seg(tt, PAINT[0] + 1, PAINT[0] + 2);
    const dim = 1 - 0.7 * fade(tt, GAUGE_AT, GAUGE_AT + 1, END_AT, END_AT + 1); // the gauge is the focus; the painting's explanation steps back
    F_HOL1.draw(ctx, R, 468, { size: 21, alpha: seg(tt, CLIMB[1] + 1.5, CLIMB[1] + 2.5) * (1 - stokes) });
    F_HOL2.draw(ctx, R, 468, { size: 22, alpha: stokes * dim });
    F_ELEMENT.draw(ctx, R, 512, { size: 22, alpha: seg(tt, PAINT[0] + 4, PAINT[0] + 5) * dim });

    // the element, magnified: across first, then along
    const inset = seg(tt, PAINT[0] + 1, PAINT[0] + 2) * dim;
    if (inset > 0.003) {
      const IX = R;
      const IY = 542;
      panel(ctx, IX, IY, 260, 150, { alpha: inset });
      const sgn = eps >= 0 ? 1 : -1;
      const ox = IX + 130 - sgn * 50;
      const oy = IY + 112;
      const ax = sgn * 100;
      const [bxx, byy] = [28, -66];
      ctx.save();
      ctx.globalAlpha *= inset;
      ctx.fillStyle = rgba(CURV, 0.45);
      ctx.strokeStyle = CURV;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + ax, oy);
      ctx.lineTo(ox + ax + bxx, oy + byy);
      ctx.lineTo(ox + bxx, oy + byy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      arrow(ctx, ox, oy, ox + ax, oy, { color: C.varied, width: 3, head: 11 });
      arrow(ctx, ox, oy, ox + bxx, oy + byy, { color: C.kinetic, width: 3, head: 11 });
      dot(ctx, ox, oy, 4, C.path);
      text(ctx, 'η', ox + ax / 2, oy + 22, { font: font.display, italic: true, size: 20, color: C.varied, align: 'center' });
      text(ctx, 'U dt', ox + bxx / 2 - sgn * 12 - 10, oy + byy / 2 + 6, { font: font.display, italic: true, size: 19, color: C.kinetic, align: sgn > 0 ? 'right' : 'left' });
      text(ctx, 'Ω(η, U) dt', IX + 130, IY + 24, { font: font.display, italic: true, size: 20, color: CURV, align: 'center' });
      ctx.restore();
    }
    // three names, one angle
    const names = seg(tt, NAMES_AT, NAMES_AT + 1) * dim;
    pill(ctx, 'THREE NAMES, ONE ANGLE', 1190, 556, C.fibre, names);
    const lines = [
      [NAMES_AT + 1.5, 'the holonomy of the loop'],
      [NAMES_AT + 3.5, 'the Aharonov–Bohm phase between two neighbouring paths'],
      [NAMES_AT + 6.5, 'δS_int / ħ, the change of the interaction action'],
    ];
    let ly = 594;
    for (const [at, s] of lines) {
      const a = seg(tt, at, at + 0.8) * dim;
      dot(ctx, 1198, ly - 6, 4, C.fibre, a);
      ly += wrap(ctx, s, 1212, ly, 300, 20, { ...type.note, size: 14, color: color.body, alpha: a }) + 8;
    }
    F_DS.draw(ctx, R, 740, { size: 21, alpha: seg(tt, PAINT[1] + 1, PAINT[1] + 2) });
    // the gauge lens: the readings change, the wedge does not
    const gaugeOn = seg(tt, GAUGE_AT, GAUGE_AT + 1);
    pill(ctx, 'THE GAUGE', R, 792, C.connection, gaugeOn);
    text(ctx, gauge === 'phi' ? 'ω = E x dt' : 'ω = −E t dx', R + 150, 797, { font: font.mono, size: 16, color: C.connection, alpha: gaugeOn });
    text(ctx, 'the zero mark at B turns by χ(B): each θ shifts, Δθ does not', R, 832, { ...type.note, size: 14, color: color.body, alpha: gaugeOn });

    stamp(ctx, seg(t, 2, 3), `E = ${fmt(E, 1)}: the worldline, the dials, the ribbon and both readouts are computed`);
  },
});
