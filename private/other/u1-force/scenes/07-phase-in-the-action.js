// Scene 07: the phase joins the action. A runner climbs the worldline of a charge in the uniform
// field E carrying a stopwatch with two hands: Feynman's free hand, turning at ½ m ẋ²/ħ, and the
// connection's hand, turning at ω(U). Then the gauge lens: the hand's position on its fibre is the
// same in both gauges, its reading along the worldline is not. Live (lenses only).
import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, rgba, line, arrow, dot, choice, C, header, frame, axes, clipped, drawPath, drawPoint, drawRunner, drawDial, drawAngle, drawStrip, readout, pill, stamp, fmt } from '../shared.js';
import { times, shoot, straightPath, electricField, worldlineTransport, velocities, hump, varied } from '../math.js';

const E = 2;
const T = 2;
const N = 400;
const XA = -1;
const XB = 0.8;
const S = frame({ x: 110, y: 190, w: 540, h: 600, u: [-2, 2], v: [0, 2] });
const TS = times(T, N);
const ETA = TS.map((t) => hump(t / T, 0.5, 0.18));
const R = 900; // the right-hand column

/** Everything the runner carries along a worldline xs under the field strength Ef, in both gauges. */
function worldline(xs, Ef) {
  const dt = T / N;
  const free = [0]; // S_free/ħ up to every node: ∫ ½ m ẋ² dt (m = 1, ħ = 1 in phase units)
  for (let i = 0; i < N; i++) {
    const v = (xs[i + 1] - xs[i]) / dt;
    free.push(free[i] + 0.5 * v * v * dt);
  }
  return {
    xs,
    pts: xs.map((x, i) => [x, TS[i]]),
    vs: velocities(xs, T),
    free,
    theta: {
      phi: worldlineTransport(electricField({ E: Ef, gauge: 'phi' }), xs, T),
      vec: worldlineTransport(electricField({ E: Ef, gauge: 'vec' }), xs, T),
    },
  };
}

const WORLDLINES = {
  on: worldline(shoot(() => E, XA, XB, T, N).xs, E),
  off: worldline(straightPath(XA, XB, T, N), 0),
};

// the runner's three climbs: Feynman's hand alone, then with the connection's hand, then in the other gauge
const CLIMBS = [
  [2, 11.5],
  [16, 27],
  [53, 64],
];
const SECOND_HAND_AT = 14;
const SUM_AT = 27;
const WEYL_AT = 41;
const GAUGE_AT = 52;
const LOOP_AT = 66;

const F_STOP = tex(String.raw`\frac{d\theta_{\rm free}}{dt} = \frac{1}{\hbar}\,\tfrac12 m\dot x^{2}`, 'dθ_free/dt = ½ m ẋ² / ħ');
const F_SUM = tex(String.raw`\frac{S}{\hbar} = \frac{1}{\hbar}\int \tfrac12 m\dot x^{2}\,dt + \int \omega(U)\,dt`, 'S/ħ = (1/ħ)∫ ½ m ẋ² dt + ∫ ω(U) dt');
const F_L1 = tex(String.raw`L = \tfrac12 m\dot x^{2} + \hbar\,\omega(U) = \tfrac12 m\dot x^{2} + e\,A(U)`, 'L = ½ m ẋ² + ħ ω(U) = ½ m ẋ² + e A(U)');
const F_L2 = tex(String.raw`\phantom{L} = \tfrac12 m\dot x^{2} + e\,A\cdot\dot x - e\,\varphi`, '  = ½ m ẋ² + e A·ẋ − e φ');
const F_PHI = tex(String.raw`\omega = E\,x\,dt \qquad (\varphi = -E x,\; A = 0)`, 'ω = E x dt   (φ = −E x, A = 0)');
const F_VEC = tex(String.raw`\omega = -E\,t\,dx \qquad (\varphi = 0,\; A = -E t)`, 'ω = −E t dx   (φ = 0, A = −E t)');

/** The axis names of the spacetime frame: t above the time axis, x past the end of the space axis (clear of the tick labels and of the caption below). */
function axisNames(ctx, F, alpha) {
  const style = { font: font.display, italic: true, size: 20, color: color.muted, alpha };
  text(ctx, 't', F.x, F.y - 16, { ...style, align: 'center' });
  text(ctx, 'x', F.x + F.w + 16, F.y + F.h + 7, style);
}

/** Where the runner is: the node k of the current (or latest) climb and the runner's visibility. */
function climbAt(t) {
  let out = { k: 0, alpha: 0, n: -1 };
  CLIMBS.forEach(([t0, t1], n) => {
    if (t < t0 - 0.6) return;
    out = { k: Math.round(N * seg(t, t0, t1)), alpha: fade(t, t0 - 0.6, t0, t1 + 1.6, t1 + 2.4), n };
  });
  return out;
}

/**
 * A stopwatch: the fibre ring with its zero mark at `zero`, the connection's hand (gold) at the
 * absolute angle `theta`, Feynman's short hand (green) at `free`, and, with `total` > 0, the one
 * hand (ink) at free + theta with the two turnings as wedges.
 */
function stopwatch(ctx, x, y, r, { free, theta, zero = 0, alpha = 1, gold = 1, total = 0, fill = 'rgba(13,19,33,0.88)' }) {
  if (alpha <= 0.003) return;
  drawDial(ctx, x, y, r, theta, { alpha, zero, fill, hand: gold > 0.003, colour: rgba(C.fibre, gold), width: r > 40 ? 3.5 : 3 });
  ctx.save();
  ctx.globalAlpha *= alpha;
  const fx = x + 0.58 * r * Math.cos(free);
  const fy = y - 0.58 * r * Math.sin(free);
  line(ctx, x, y, fx, fy, { color: C.kinetic, width: r > 40 ? 3 : 2.5 });
  dot(ctx, fx, fy, r > 40 ? 3.5 : 2.5, C.kinetic);
  if (total > 0.003) {
    ctx.globalAlpha *= total;
    drawAngle(ctx, x, y, 0.3 * r, 0, free, { colour: C.kinetic, width: 2 });
    drawAngle(ctx, x, y, 0.42 * r, free, free + theta, { colour: C.fibre, width: 2 });
    const tx = x + 0.98 * r * Math.cos(free + theta);
    const ty = y - 0.98 * r * Math.sin(free + theta);
    line(ctx, x, y, tx, ty, { color: color.ink, width: 1.5 });
    dot(ctx, tx, ty, 3, color.ink);
  }
  ctx.restore();
}

export default defineScene({
  name: 'The phase joins the action',
  duration: 75,
  header: header(7, 'ELECTROMAGNETISM', 'The transported phase is the interaction action'),
  narration: [
    [0, 'Feynman’s stopwatch: every path carries a hand turning at the rate of the action, one half m x-dot squared over h-bar. The particle starts at rest and speeds up; the hand turns faster and faster.'],
    [SECOND_HAND_AT, 'The particle’s phase lives in the fibre over its event, its point in spacetime. Comparing neighbouring events takes the connection: the hand gets a second turning, omega of the velocity U, d t.'],
    [SUM_AT, 'Add them: the Lagrangian is one half m x-dot squared plus h-bar omega of U. Call h-bar omega over e the potential A: the second turning, times h-bar, is the interaction action, e A of U.'],
    [WEYL_AT, 'Here omega is E x d t. Weyl’s clock: the hand’s rate is minus the potential at the particle: it turns faster where the potential is lower.'],
    [GAUGE_AT, 'Now change the gauge: omega equals minus E t d x. Same curvature, same field F. The zero marks turn from event to event; the hand stays put, but reads a different number.'],
    [LOOP_AT, 'A single path’s number is a gauge artefact. What is physical? Only what a loop measures. And a nudge makes a loop.'],
  ],
  beats: [
    [SECOND_HAND_AT, 'The second turning'],
    [SUM_AT, 'Two turnings, one hand'],
    [WEYL_AT, 'Weyl’s clock'],
    [GAUGE_AT, 'Change the gauge'],
    [LOOP_AT, 'A nudge makes a loop'],
  ],
  controls: {
    gauge: choice('Gauge of ω', { phi: 'ω = E x dt', vec: 'ω = −E t dx' }, { value: [[0, 'phi'], [GAUGE_AT, 'vec']], lens: true }),
    field: choice('Field', { on: 'E on', off: 'E off' }, { value: 'on', lens: true }),
  },

  draw(ctx, t, live) {
    const gauge = live?.input?.gauge ?? 'phi';
    const fieldOn = (live?.input?.field ?? 'on') === 'on';
    const W = WORLDLINES[fieldOn ? 'on' : 'off'];
    const { k, alpha: runnerAlpha, n: climb } = climbAt(t);
    const thetaAbs = W.theta.phi[k]; // the hand's position on its fibre
    const reading = W.theta[gauge][k];
    const zero = thetaAbs - reading; // the zero mark of this gauge at the runner's event
    const free = W.free[k];
    const goldOn = seg(t, SECOND_HAND_AT, SECOND_HAND_AT + 1.5);
    const sumOn = seg(t, SUM_AT, SUM_AT + 1);

    // ---- the spacetime frame ----
    const on = seg(t, 0.2, 1.2);
    axes(ctx, S, { xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 1, 2], grid: true, alpha: on });
    axisNames(ctx, S, on);
    // where the connection's hand turns: the rate of ω(U) as a soft-blue shading of spacetime
    const shade = goldOn * (fieldOn ? 1 : 0);
    if (shade > 0.003) {
      ctx.save();
      ctx.globalAlpha *= 0.9 * shade;
      const g = gauge === 'phi' ? ctx.createLinearGradient(S.x, 0, S.x + S.w, 0) : ctx.createLinearGradient(0, S.y + S.h, 0, S.y);
      g.addColorStop(0, rgba(C.connection, gauge === 'phi' ? 0.22 : 0));
      if (gauge === 'phi') g.addColorStop(0.5, rgba(C.connection, 0));
      g.addColorStop(1, rgba(C.connection, 0.22));
      ctx.fillStyle = g;
      ctx.fillRect(S.x, S.y, S.w, S.h);
      ctx.restore();
      // Weyl's clock: in the φ-gauge the rate E x is −φ, so the hand turns fastest where φ is lowest
      const weylNote = gauge === 'phi' ? seg(t, WEYL_AT, WEYL_AT + 1) : 0;
      if (gauge === 'phi') {
        text(ctx, 'rate of the hand: E x', S.x + 12, S.y + 26, { ...type.note, size: 14, color: C.connection, alpha: shade * (1 - weylNote) });
        text(ctx, 'rate of the hand: E x = −φ', S.x + 12, S.y + 26, { ...type.note, size: 14, color: C.connection, alpha: shade * weylNote });
      } else text(ctx, 'rate: −E t ẋ, only while moving', S.x + 12, S.y + 26, { ...type.note, size: 14, color: C.connection, alpha: shade });
      if (gauge === 'phi') {
        text(ctx, '−', S.x + 10, S.y + S.h - 12, { font: font.mono, size: 16, color: C.connection, alpha: shade });
        text(ctx, '+', S.x + S.w - 20, S.y + S.h - 12, { font: font.mono, size: 16, color: C.connection, alpha: shade });
      }
    }
    // Weyl's clock: a row of clocks at rest, each turning at its own rate E x = −φ (backwards where φ > 0)
    const clocks = shade * (gauge === 'phi' ? fade(t, WEYL_AT + 0.5, WEYL_AT + 1.5, GAUGE_AT, GAUGE_AT + 0.6) : 0);
    if (clocks > 0.003) {
      for (const x of [-1.5, -0.5, 0.5, 1.5]) {
        const [cx, cy] = S.point([x, 0.3]);
        drawDial(ctx, cx, cy, 17, (E * x * (t - WEYL_AT)) / 1.5, { alpha: clocks, fill: 'rgba(13,19,33,0.85)', width: 2.5 });
        text(ctx, `${x > 0 ? '+' : '−'}${fmt(Math.abs(E * x), 2)}`, cx, cy + 36, { font: font.mono, size: 14, color: C.connection, align: 'center', alpha: clocks });
      }
    }
    if (!fieldOn) text(ctx, 'E off: ω = 0, no second turning', S.x + 12, S.y + 26, { ...type.note, size: 14, color: color.muted, alpha: on });

    // the worldline, drawn by the first climb
    const progress = climb === 0 ? Math.max(k / N, 0.003) : climb < 0 ? 0.003 : 1;
    const pathAlpha = on * (climb < 0 ? 0 : 1);
    clipped(ctx, S, () => drawPath(ctx, S, W.pts, { colour: C.path, width: 3, alpha: pathAlpha, progress }), 8);
    drawPoint(ctx, S, [XA, 0], { colour: C.path, alpha: on, r: 6, label: 'A', labelOffset: [14, -6] });
    drawPoint(ctx, S, [XB, T], { colour: C.path, alpha: on, r: 6, label: 'B', labelOffset: [14, 8] });
    text(ctx, fieldOn ? 'the physical worldline under the field E, from A to B' : 'E off: the free worldline from A to B, straight', S.x, S.y + S.h + 46, { ...type.note, color: color.body, alpha: seg(t, 1, 2) });

    // a nudge makes a loop: the teaser for the next scene
    const loop = seg(t, LOOP_AT + 1, LOOP_AT + 3);
    if (loop > 0.003) {
      const nudged = varied(W.xs, ETA, 0.3).map((x, i) => [x, TS[i]]);
      drawStrip(ctx, S, W.pts, nudged, { fill: rgba(C.curvature, 0.22), alpha: loop });
      drawPath(ctx, S, nudged, { colour: C.varied, width: 2.5, alpha: loop });
      text(ctx, 'x + εη', S.X(W.xs[200] + 0.3 * ETA[200]) + 14, S.Y(TS[200]) + 6, { font: font.display, italic: true, size: 21, color: C.varied, alpha: loop });
    }

    // the runner, its velocity and its stopwatch
    if (runnerAlpha > 0.003) {
      const p = W.pts[k];
      const [px, py] = S.point(p);
      const [ux, uy] = S.point([p[0] + 0.24 * W.vs[k], p[1] + 0.24]);
      const uAlpha = runnerAlpha * lin(T - TS[k], 0.28, 0.5); // the velocity arrow fades before its tip reaches B
      arrow(ctx, px, py, ux, uy, { color: C.kinetic, width: 2.5, head: 10, alpha: uAlpha });
      text(ctx, 'U', ux + 8, uy + 2, { font: font.display, italic: true, size: 19, color: C.kinetic, alpha: uAlpha });
      drawRunner(ctx, S, p, { colour: C.path, alpha: runnerAlpha, r: 7 });
      // the stopwatch rides at the runner's left, a little above it near A and below it near B
      const dx = px - 54;
      const dy = py - 30 + (62 * k) / N;
      line(ctx, px, py, dx + 24, dy + 12 * Math.sign(py - dy), { color: rgba(C.path, 0.5), width: 1, alpha: runnerAlpha });
      stopwatch(ctx, dx, dy, 27, { free, theta: thetaAbs, zero, alpha: runnerAlpha, gold: goldOn });
    }

    // ---- the right column: the stopwatch argument ----
    pill(ctx, 'FEYNMAN’S STOPWATCH', R, 208, C.kinetic, seg(t, 0.4, 1.2));
    F_STOP.draw(ctx, R, 250, { size: 24, alpha: seg(t, 0.8, 1.8) });
    const DX = 975;
    const DY = 345;
    stopwatch(ctx, DX, DY, 62, { free, theta: thetaAbs, zero, alpha: seg(t, 1, 2), gold: goldOn, total: sumOn });
    const RX = 1068;
    readout(ctx, 'S_free/ħ = ∫ ½ m ẋ² dt =', free, RX, 318, { colour: C.kinetic, size: 16, alpha: seg(t, 2, 3) });
    readout(ctx, 'θ = ∫ ω(U) dt =', reading, RX, 350, { colour: C.fibre, size: 16, alpha: goldOn, unit: ' rad' });
    readout(ctx, 'S_int = ħ θ =', reading, RX, 382, { colour: C.fibre, size: 16, alpha: seg(t, SUM_AT + 8, SUM_AT + 9), unit: ' ħ' });
    text(ctx, 'every path carries e^(iS/ħ): a hand turning at S/ħ', RX, 290, { ...type.note, size: 14, alpha: seg(t, 3, 4) });
    text(ctx, sumOn > 0.5 ? 'green: Feynman’s · gold: connection’s · ink: S/ħ' : 'green: Feynman’s hand · gold: the connection’s', RX, 412, { ...type.note, size: 14, alpha: goldOn });

    F_SUM.draw(ctx, R, 458, { size: 23, alpha: sumOn });
    F_L1.draw(ctx, R, 506, { size: 23, alpha: seg(t, SUM_AT + 2.5, SUM_AT + 3.5) });
    F_L2.draw(ctx, R, 546, { size: 23, alpha: seg(t, SUM_AT + 5.5, SUM_AT + 6.5) });

    // the gauge: which expression of ω the hand's reading uses
    const gaugeOn = goldOn;
    pill(ctx, 'THE CONNECTION, IN THIS GAUGE', R, 602, C.connection, gaugeOn);
    (gauge === 'phi' ? F_PHI : F_VEC).draw(ctx, R, 642, { size: 22, alpha: gaugeOn });
    const weyl = seg(t, WEYL_AT, WEYL_AT + 1) * (1 - seg(t, GAUGE_AT, GAUGE_AT + 0.6));
    wrap(ctx, gauge === 'phi' ? 'Weyl’s clock: the rate E x is minus the potential φ at the particle. Lower potential, faster hand.' : 'In this gauge the rate is −E t ẋ: a particle at rest gets no turning at all.', R, 684, 640, 20, { ...type.note, size: 14, color: color.body, alpha: weyl });
    // the reading at B in both gauges: the same hand, two numbers
    const both = seg(t, GAUGE_AT, GAUGE_AT + 1);
    pill(ctx, 'θ(B) ALONG THE SAME WORLDLINE', R, 724, C.fibre, both);
    for (const [i, g] of ['phi', 'vec'].entries()) {
      const mine = g === gauge;
      readout(ctx, `${g === 'phi' ? 'ω = E x dt  ' : 'ω = −E t dx '} θ(B) =`, W.theta[g][N], R, 760 + 28 * i, { colour: mine ? C.fibre : rgba(C.fibre, 0.55), size: 16, alpha: both, unit: ' rad' });
    }
    text(ctx, fieldOn ? 'one hand on its fibre, two readings: only the zero marks moved' : 'E off: ω = 0 in both gauges, nothing to read', R, 838, { ...type.note, size: 14, alpha: seg(t, GAUGE_AT + 6, GAUGE_AT + 7) });

    stamp(ctx, seg(t, 2, 3), `E = ${fmt(E, 1)}, m = 1, ħ = 1: the worldline, the hands and every readout are computed`);
  },
});
