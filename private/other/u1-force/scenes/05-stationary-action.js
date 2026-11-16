// Scene 05: which worldline does a free particle take? A fan of candidate paths from A to B; the
// action S = ∫ ½ m ẋ² dt; the nudge x + εη; S(ε) is a parabola whose vertex sits at ε = 0 wherever
// the nudge is placed (stationary); a bent base path is not stationary.
import { defineScene, seg, fade, text, type, color, font, tex, slider, choice, line, arrow, dot, niceStep, C, frame, clipped, axes, drawPath, drawPoint, drawSamples, stamp, fmt, header, clock, leverSim, caption } from '../shared.js';
import { times, straightPath, bentPath, hump, action, varied, firstVariation } from '../math.js';


// the spacetime frame of every mechanics scene: x right, t up
const S = frame({ x: 110, y: 190, w: 540, h: 600, u: [-2, 2], v: [0, 2] });
// the action against the size of the nudge
const P = frame({ x: 900, y: 230, w: 560, h: 300, u: [-1, 1], v: [0, 1] });
const XA = -1;
const XB = 0.8;
const T = 2;
const N = 400;
const M = 1;
const TS = times(T, N);
const STRAIGHT = straightPath(XA, XB, T, N);
const BENT = bentPath(XA, XB, T, N, 0.55);
/** The fan of candidates: bent paths of several amounts and a few wobbly ones. */
const FAN = [
  ...[-0.85, -0.6, -0.35, 0.35, 0.6, 0.85].map((a) => bentPath(XA, XB, T, N, a)),
  TS.map((t, i) => STRAIGHT[i] + 0.5 * Math.sin((2 * Math.PI * t) / T)),
  TS.map((t, i) => STRAIGHT[i] - 0.45 * Math.sin((2 * Math.PI * t) / T) + 0.2 * Math.sin((3 * Math.PI * t) / T)),
  TS.map((t, i) => STRAIGHT[i] + 0.3 * Math.sin((3 * Math.PI * t) / T) - 0.25 * Math.sin((Math.PI * t) / T)),
];
const EPS_SAMPLES = Array.from({ length: 41 }, (_, i) => -1 + i / 20);

const NUDGE_AT = 15.5; // the orange path appears
const PLOT_AT = 17; // the S(ε) plot appears
const AT = 20.5; // everything the controls affect is on screen (the vertex and the readouts included)
const BENT_AT = 42;
const HANDOVER_AT = 48;

const F_ACTION = tex(String.raw`S[x] = \int_0^T \tfrac12\, m\,\dot x^2\, dt`, 'S[x] = ∫₀ᵀ ½ m ẋ² dt');
const F_NUDGE = tex(String.raw`x(t) \;\to\; x(t) + \varepsilon\,\eta(t), \qquad \eta(0) = \eta(T) = 0`, 'x(t) → x(t) + ε η(t),  η(0) = η(T) = 0');
const F_STATIONARY = tex(String.raw`\left.\frac{dS}{d\varepsilon}\right|_{\varepsilon = 0} = 0 \quad \text{for every } \eta`, 'dS/dε |₀ = 0  for every η');

/** A sampled path x_i as plane points [x_i, t_i]. */
const pts = (xs) => xs.map((x, i) => [x, TS[i]]);

/** The variation η on the grid, a hump centred at the fraction u0 of T. */
const etasAt = (u0) => TS.map((t) => hump(t / T, u0, 0.18));

export default defineScene({
  name: 'Stationary action',
  duration: 55,
  header: header(5, 'STATIONARY ACTION', 'Which worldline does a free particle take?'),
  narration: [
    [0, 'A particle could go any of these ways. Nature picks one.'],
    [5.5, 'Give every path a number: its action, the kinetic energy integrated along the worldline. The path taken is the one no small nudge changes.'],
    [15, 'Push the straight path sideways: its action changes. Plot it against the size of the push: a parabola, its vertex at zero push. Flat there: a small push costs nothing, to first order. Stationary.'],
    [29, 'Now slide the nudge along the worldline. The parabola reshapes, but its vertex stays at zero. That is what "for every nudge" means.'],
    [41.5, 'A bent worldline is not stationary: its vertex leaves zero. Some nudge lowers the action.'],
    [HANDOVER_AT, 'Your turn: nudge the path anywhere, straight or bent, and watch the vertex.'],
  ],
  beats: [
    [NUDGE_AT, 'The nudge'],
    [29, 'Every nudge'],
    [BENT_AT, 'A bent path'],
    [HANDOVER_AT, 'Your turn'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: nudge the path anywhere, straight or bent, and watch the vertex.' }],
  exploreFrom: AT,
  controls: {
    eps: slider('Nudge ε', { min: -1, max: 1, step: 0.01, value: [[0, 0], [16, 0], [19, 0.7], [21, 0.7], [24, -0.6], [27, 0], [28, 0], [30, 0.5]] }),
    where: slider('Nudge at t₀ / T', { min: 0.12, max: 0.88, step: 0.01, value: [[0, 0.5], [30, 0.5], [33, 0.25], [36, 0.25], [39, 0.75], [44, 0.75], [46, 0.5]] }),
    base: choice('Base path', { straight: 'straight', bent: 'bent' }, { value: [[0, 'straight'], [BENT_AT, 'bent']], lens: true }),
  },
  sim: leverSim(['eps', 'where']),

  draw(ctx, t, live) {
    const tt = clock(t, live, AT);
    const { eps, where, base } = live.input;
    const xs = base === 'bent' ? BENT : STRAIGHT;
    const etas = etasAt(where);
    const nudged = varied(xs, etas, eps);
    const fv = firstVariation(xs, etas, T, { m: M });
    const Ss = EPS_SAMPLES.map((e) => action(varied(xs, etas, e), T, {}));
    const Snow = action(nudged, T, {});
    // S(ε) is exactly quadratic for a free particle: fit the vertex from three samples
    const S0 = Ss[20];
    const Sm = Ss[0];
    const Sp = Ss[40];
    const curv = (Sp + Sm - 2 * S0) / 2;
    const slope = (Sp - Sm) / 2;
    const vertex = curv > 1e-12 ? -slope / (2 * curv) : 0;
    const Svertex = S0 + slope * vertex + curv * vertex * vertex;

    // ---- the spacetime frame: A, B, the fan, the base path, the nudge ----
    const on = seg(tt, 0.2, 1.2);
    axes(ctx, S, { xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 1, 2], xLabel: 'x', alpha: on, grid: true });
    text(ctx, 't', S.x - 12, S.y - 16, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', alpha: on });
    const fanOut = 1 - seg(tt, 12, 14);
    clipped(ctx, S, () => {
      FAN.forEach((path, i) => {
        const progress = seg(tt, 0.6 + 0.22 * i, 2.4 + 0.22 * i);
        drawPath(ctx, S, pts(path), { colour: color.muted, width: 1.6, alpha: 0.55 * fanOut * on, progress });
      });
      // the base path (ink), drawn after the fan
      drawPath(ctx, S, pts(xs), { colour: C.path, width: 3.2, alpha: on, progress: seg(tt, 1.2, 3.2) });
      // the nudged path (orange) and the strip of the nudge
      const nudgeOn = seg(tt, NUDGE_AT, NUDGE_AT + 1);
      drawPath(ctx, S, pts(nudged), { colour: C.varied, width: 2.6, alpha: nudgeOn });
      // the push εη at the centre of the hump
      const k = Math.round(where * N);
      const [x0, y0] = S.point([xs[k], TS[k]]);
      const [x1] = S.point([nudged[k], TS[k]]);
      if (Math.abs(x1 - x0) > 6) arrow(ctx, x0, y0, x1, y0, { color: C.varied, width: 2, head: 9, alpha: nudgeOn });
      text(ctx, 'ε η', (x0 + x1) / 2 + (x1 >= x0 ? 10 : -10), y0 - 12, { font: font.display, italic: true, size: 20, color: C.varied, align: x1 >= x0 ? 'left' : 'right', alpha: nudgeOn * seg(Math.abs(x1 - x0), 6, 20) });
    });
    // t₀, where the hump sits: a faint dotted line across the frame, its label inside the right edge
    {
      const y0 = S.Y(where * T);
      const t0On = seg(tt, NUDGE_AT, NUDGE_AT + 1);
      line(ctx, S.x, y0, S.x + S.w, y0, { color: C.varied, width: 1.2, dash: [2, 6], alpha: 0.45 * t0On });
      text(ctx, '0', S.x + S.w - 8, y0 - 4, { font: font.display, italic: true, size: 13, color: C.varied, align: 'right', alpha: t0On }); // the display face has no ₀
      text(ctx, 't', S.x + S.w - 16, y0 - 9, { font: font.display, italic: true, size: 20, color: C.varied, align: 'right', alpha: t0On });
    }
    drawPoint(ctx, S, [XA, 0], { colour: C.path, alpha: on, r: 6, label: 'A', labelOffset: [-26, 8] });
    drawPoint(ctx, S, [XB, T], { colour: C.path, alpha: on, r: 6, label: 'B', labelOffset: [12, -4] });
    text(ctx, base === 'bent' ? 'a bent worldline' : 'the straight worldline', S.x + S.w - 8, S.y + S.h - 14, { font: font.mono, size: 14, color: C.path, align: 'right', alpha: seg(tt, 13, 14) });
    text(ctx, 'candidate worldlines from A to B', S.x + S.w - 8, S.y + S.h - 14, { font: font.mono, size: 14, color: color.muted, align: 'right', alpha: fade(tt, 1, 2, 12, 13) });
    text(ctx, `ε = ${fmt(eps, 2)}   t₀/T = ${fmt(where, 2)}   base: ${base}`, S.x, 872, { ...type.note, color: color.body, alpha: seg(tt, NUDGE_AT, NUDGE_AT + 1) });

    // ---- the right column: S(ε), the readouts, the formulas ----
    const plotOn = seg(tt, PLOT_AT, PLOT_AT + 1.2);
    if (plotOn > 0.003) {
      const lo = Math.min(...Ss, Snow);
      const hi = Math.max(...Ss, Snow);
      const span = Math.max(hi - lo, 0.05);
      const PF = frame({ x: P.x, y: P.y, w: P.w, h: P.h, u: P.u, v: [lo - 0.18 * span, hi + 0.18 * span] });
      const step = niceStep(span);
      const yTicks = [];
      for (let v = Math.ceil(PF.v[0] / step) * step; v <= PF.v[1] + 1e-9; v += step) yTicks.push(Math.round(v * 1e6) / 1e6);
      axes(ctx, PF, { xTicks: [-1, -0.5, 0, 0.5, 1], yTicks, xLabel: 'ε', alpha: plotOn, grid: true, format: (v) => fmt(v, 1), formatY: (v) => fmt(v, 2) });
      text(ctx, 'S', PF.x - 12, PF.y - 10, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', alpha: plotOn });
      caption(ctx, PF, 'the action of the nudged path, against ε', plotOn, { color: color.muted });
      clipped(ctx, PF, () => {
        // ε = 0: the base path
        line(ctx, PF.X(0), PF.y, PF.X(0), PF.y + PF.h, { color: color.muted, width: 1, dash: [4, 6], alpha: 0.7 * plotOn });
        drawSamples(ctx, PF, EPS_SAMPLES, Ss, { colour: C.varied, width: 2.6, alpha: plotOn, progress: seg(tt, PLOT_AT + 0.4, PLOT_AT + 2.2) });
        // the vertex
        const vOn = plotOn * seg(tt, PLOT_AT + 2.2, PLOT_AT + 2.8);
        const [vx, vy] = PF.point([vertex, Svertex]);
        line(ctx, vx, vy, vx, PF.y + PF.h, { color: C.fibre, width: 1.2, dash: [3, 5], alpha: 0.8 * vOn });
        dot(ctx, vx, vy, 4, C.fibre, vOn);
        // a short tag at the foot of the vertex line, on the side away from the ε = 0 line; the value is a readout below
        const right = vertex > -0.05;
        text(ctx, 'vertex', vx + (right ? 9 : -9), PF.y + PF.h - 10, { font: font.mono, size: 14, color: C.fibre, align: right ? 'left' : 'right', alpha: vOn });
        // the tangent at ε = 0: dS/dε
        const tOn = plotOn * seg(tt, PLOT_AT + 2.6, PLOT_AT + 3.2);
        const dx = 0.32;
        const [ax, ay] = PF.point([-dx, S0 - fv.direct * dx]);
        const [bx, by] = PF.point([dx, S0 + fv.direct * dx]);
        line(ctx, ax, ay, bx, by, { color: C.path, width: 1.6, alpha: 0.8 * tOn });
      }, 4);
      // the dot at the current nudge
      const [dx, dy] = PF.point([eps, Snow]);
      ctx.save();
      ctx.globalAlpha *= plotOn;
      ctx.shadowColor = C.varied;
      ctx.shadowBlur = 14;
      dot(ctx, dx, dy, 7, C.varied);
      ctx.restore();
      // readouts: dS/dε prominent, S small
      const rOn = plotOn * seg(tt, PLOT_AT + 2.6, PLOT_AT + 3.4);
      text(ctx, 'dS/dε at ε = 0', 900, 612, { font: font.mono, size: 18, color: color.muted, alpha: rOn });
      text(ctx, fmt(fv.direct, 3), 1080, 612, { font: font.mono, size: 18, weight: 500, color: Math.abs(fv.direct) < 0.02 ? C.fibre : C.varied, alpha: rOn });
      text(ctx, Math.abs(fv.direct) < 0.02 ? 'stationary' : 'not stationary', 1180, 612, { font: font.mono, size: 15, color: Math.abs(fv.direct) < 0.02 ? C.fibre : C.varied, alpha: rOn });
      text(ctx, `S(ε) = ${fmt(Snow, 3)}`, 900, 640, { font: font.mono, size: 15, color: color.muted, alpha: rOn });
      text(ctx, `S(0) = ${fmt(S0, 3)}`, 1080, 640, { font: font.mono, size: 15, color: color.muted, alpha: rOn });
      text(ctx, `vertex at ε = ${fmt(vertex, 2)}`, 1260, 640, { font: font.mono, size: 15, color: C.fibre, alpha: rOn });
    }
    // the formulas, after the pictures
    F_ACTION.draw(ctx, 900, 700, { size: 27, alpha: seg(tt, 6, 7) });
    text(ctx, 'the action of a worldline', 900, 735, { ...type.note, alpha: seg(tt, 6.5, 7.5) });
    F_NUDGE.draw(ctx, 900, 775, { size: 24, alpha: seg(tt, NUDGE_AT + 0.5, NUDGE_AT + 1.5) });
    F_STATIONARY.draw(ctx, 900, 820, { size: 24, alpha: seg(tt, 26, 27) });
    text(ctx, 'stationary means: the vertex stays at ε = 0, wherever the nudge sits', 900, 852, { ...type.note, alpha: seg(tt, 28, 29) });
    stamp(ctx, seg(tt, PLOT_AT + 1, PLOT_AT + 2), 'S(ε), its vertex and dS/dε are computed from the worldlines shown');
  },
});
