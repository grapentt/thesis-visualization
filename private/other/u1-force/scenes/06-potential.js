// Scene 06: the gradient of the potential is a force. A landscape V(x) with its level lines (the
// 1-form dV) and the downhill arrows −V′; the physical path, shot from A to B under −V′, and its
// nudge; the two answers to a sideways push (the landscape's −V′η, the mass's m ẍ η), integration
// by parts once, slowly, and the balance that must hold for every nudge: m ẍ = −V′(x).
import { defineScene, seg, fade, lerp, text, type, color, font, rgba, tex, slider, choice, line, arrow, dot, ring, niceStep, C, frame, clipped, axes, drawPath, drawPoint, drawSamples, stamp, fmt, header, clock, caption } from '../shared.js';
import { times, hump, varied, firstVariation, potentials, shoot } from '../math.js';

// the landscape above the spacetime frame, both over the same x ∈ [−2, 2]
const L0 = { x: 110, y: 190, w: 540, h: 170, u: [-2, 2] };
const S = frame({ x: 110, y: 424, w: 540, h: 406, u: [-2, 2], v: [0, 2] });
const B0 = { x: 900, y: 520, w: 560, h: 240, u: [0, 2] };
const XA = -1;
const XB = 0.8;
const T = 2;
const N = 400;
const M = 1;
const TS = times(T, N);
const DV = 0.25; // the spacing of the level lines of V
const KEYS = ['none', 'gravity', 'spring', 'doubleWell'];
const SHORT = { none: 'no potential', gravity: 'uniform field', spring: 'harmonic well', doubleWell: 'double well' };

/** Everything per potential: the physical path shot from A to B, the landscape's range, its level lines. */
const WORLD = Object.fromEntries(
  KEYS.map((key) => {
    const { V, dV, label } = potentials[key];
    const { xs } = shoot((x) => -dV(x), XA, XB, T, N, { m: M });
    const samples = Array.from({ length: 801 }, (_, i) => -2 + i / 200);
    const inView = samples.filter((x) => Math.abs(x) <= 1.7).map(V);
    const lo = Math.min(...inView);
    const hi = Math.max(...inView);
    const span = Math.max(hi - lo, 1);
    const range = [lo - 0.18 * span, hi + 0.22 * span];
    // the level lines: the x at which V crosses n·ΔV, found by scanning
    const levels = [];
    for (let n = Math.ceil(range[0] / DV); n * DV <= range[1]; n++) {
      const level = n * DV;
      for (let i = 1; i < samples.length; i++) {
        const a = V(samples[i - 1]) - level;
        const b = V(samples[i]) - level;
        if (a === 0 && b !== 0) levels.push(samples[i - 1]);
        else if (a * b < 0) levels.push(samples[i - 1] + ((samples[i] - samples[i - 1]) * a) / (a - b));
      }
    }
    return [key, { V, dV, label, xs, range, levels, L: frame({ ...L0, v: range }) }];
  }),
);

const FRAME_AT = 4.5; // the spacetime frame, A, B and the free (straight) path appear
const PATH_AT = 19.5; // the physical path draws itself
const NUDGE_AT = 23; // the nudge appears
const ANSWERS_AT = 27; // the two answers appear in the plot
const PARTS_AT = 37; // integration by parts, 12 s
const ACROSS_AT = 49; // the mass term moves across: the balance plot
const EL_AT = 64.5; // m ẍ = −V′ appears, boxed
const WELL_AT = 69.5; // the harmonic well
const DOUBLE_AT = 75.5; // the double well
const AT = 54; // everything the lenses affect is on screen
const FREE = TS.map((t) => XA + ((XB - XA) * t) / T); // the free particle's straight worldline, for reference

const F_DV = tex(String.raw`dV = V'(x)\,dx`, 'dV = V′(x) dx');
const F_LAGR = tex(String.raw`L = \tfrac12\, m\,\dot x^2 - V(x)`, 'L = ½ m ẋ² − V(x)');
const F_DS1 = tex(String.raw`\delta S = \int_0^T \big( m\,\dot x\,\dot\eta \;-\; V'(x)\,\eta \big)\, dt`, 'δS = ∫₀ᵀ ( m ẋ η̇ − V′(x) η ) dt');
const F_PARTS = tex(String.raw`\int_0^T m\,\dot x\,\dot\eta\, dt = \big[\, m\,\dot x\,\eta \,\big]_0^T - \int_0^T m\,\ddot x\,\eta\, dt`, '∫ m ẋ η̇ dt = [m ẋ η]₀ᵀ − ∫ m ẍ η dt');
const F_DS2 = tex(String.raw`\delta S = \int_0^T \big( -m\,\ddot x \;-\; V'(x) \big)\, \eta\, dt`, 'δS = ∫₀ᵀ ( −m ẍ − V′(x) ) η dt');
const F_BAL = tex(String.raw`-V'(x)\,\eta \;=\; m\,\ddot x\,\eta \quad \text{for every } \eta`, '−V′(x) η = m ẍ η  for every η');
const F_EL = tex(String.raw`m\,\ddot x = -V'(x)`, 'm ẍ = −V′(x)');

/** A sampled path x_i as plane points [x_i, t_i]. */
const pts = (xs) => xs.map((x, i) => [x, TS[i]]);
/** Segment-midpoint values averaged onto the nodes (for drawing on the node grid). */
const onNodes = (segs) => segs.map((_, i) => (i === 0 ? segs[0] : (segs[i - 1] + segs[i]) / 2)).concat([segs[segs.length - 1]]);

export default defineScene({
  name: 'The gradient becomes the force',
  duration: 85,
  header: header(6, 'STATIONARY ACTION', 'The gradient of the potential is a force'),
  narration: [
    [0, 'Give the particle a landscape: a potential V. Its slope is a force, minus V prime, pushing downhill.'],
    [8, 'd V is a one-form: it eats a displacement and returns an energy. Its picture: a stack of level lines; closer lines, a steeper hill.'],
    [18.5, 'Now the action integrates kinetic minus potential, the Lagrangian. The computed path bends. Nudge it.'],
    [26.5, 'The kinetic term answers with m x-dot eta-dot; the potential with minus V prime eta: the slope at the particle, times the push.'],
    [36, 'Integrate by parts: m x-dot eta-dot becomes minus m x-double-dot eta, the same area. No boundary term, since eta is pinned at both ends.'],
    [47, 'So the whole change is one bracket, times eta. Move the mass term across: blue, the landscape\'s answer; green, the mass\'s.'],
    [58, 'Slide the nudge along the worldline: it picks out the bracket at that moment. To vanish for every nudge, it must vanish at every time: m x-double-dot equals minus V prime.'],
    [70, 'A well: the path curves toward the bottom, the arrows point downhill.'],
    [76, 'A double well: blue and green still coincide. Two answers to one sideways push; the physical path is where they cancel.'],
  ],
  beats: [
    [8, 'The one-form dV'],
    [PATH_AT, 'The path bends'],
    [36, 'By parts'],
    [47, 'Two answers'],
    [58, 'Every nudge'],
    [WELL_AT, 'A well'],
    [DOUBLE_AT, 'A double well'],
  ],
  controls: {
    V: choice('Potential', { none: 'none', gravity: 'uniform field', spring: 'harmonic well', doubleWell: 'double well' }, { value: [[0, 'gravity'], [WELL_AT, 'spring'], [DOUBLE_AT, 'doubleWell']], lens: true }),
    eps: slider('Nudge ε', { min: -1, max: 1, step: 0.01, lens: true, value: [[0, 0], [NUDGE_AT, 0], [NUDGE_AT + 3, 0.7], [52, 0.7], [55, -0.6], [57, -0.6], [59, 0.5]] }),
    where: slider('Nudge at t₀ / T', { min: 0.12, max: 0.88, step: 0.01, lens: true, value: [[0, 0.5], [59, 0.5], [61.5, 0.25], [63, 0.25], [65.5, 0.75], [67, 0.75], [68.5, 0.5]] }),
  },

  draw(ctx, t, live) {
    const tt = clock(t, live, AT);
    const { eps, where } = live.input;
    const world = WORLD[live.input.V] ?? WORLD.gravity;
    const { V, dV, xs, L, levels } = world;
    const etas = TS.map((s) => hump(s / T, where, 0.18));
    const nudged = varied(xs, etas, eps);
    const fv = firstVariation(xs, etas, T, { m: M, dV });
    const fvK = firstVariation(xs, etas, T, { m: M }); // the kinetic part alone: m ẋ η̇ (segments), −m ẍ η (nodes)
    const blue = xs.map((x, i) => -dV(x) * etas[i]); // the landscape's answer
    const kinBefore = onNodes(fvK.onSegments); // m ẋ η̇
    const kinAfter = fvK.onNodes; // −m ẍ η
    const k1 = seg(tt, PARTS_AT + 1, PARTS_AT + 7); // by parts: m ẋ η̇ → −m ẍ η
    const k2 = seg(tt, ACROSS_AT + 1, ACROSS_AT + 3.5); // across: −m ẍ η → +m ẍ η
    const green = kinBefore.map((g, i) => (1 - k1) * g + k1 * (1 - 2 * k2) * kinAfter[i]);
    const k0 = Math.round(where * N); // the node at t₀
    const x0 = xs[k0];

    // ---- the landscape V(x), its downhill arrows, its level lines ----
    const on = seg(tt, 0.2, 1.2);
    const step = niceStep(L.v[1] - L.v[0]);
    const yTicks = [];
    for (let v = Math.ceil(L.v[0] / step) * step; v <= L.v[1] + 1e-9; v += step) yTicks.push(Math.round(v * 1e6) / 1e6);
    axes(ctx, L, { yTicks, alpha: on, formatY: (v) => fmt(v, 1) });
    text(ctx, 'V', L.x - 12, L.y - 10, { font: font.display, italic: true, size: 20, color: C.potential, align: 'right', alpha: on });
    const stackOn = seg(tt, 8.5, 10.5);
    clipped(ctx, L, () => {
      // the level lines of V: the picture of the one-form dV
      for (const xl of levels) line(ctx, L.X(xl), L.y, L.X(xl), L.y + L.h, { color: C.potential, width: 1.2, alpha: 0.45 * stackOn });
      drawSamples(ctx, L, Array.from({ length: 201 }, (_, i) => -2 + i / 50), Array.from({ length: 201 }, (_, i) => V(-2 + i / 50)), { colour: C.potential, width: 2.8, alpha: on, progress: seg(tt, 0.4, 2.2), fill: rgba(C.potential, 0.08), baseline: L.v[0] });
      // the force −V′(x) along the landscape, in rose
      const arrowsOn = seg(tt, 2.8, 4.6);
      for (let i = 0; i < 8; i++) {
        const x = -1.75 + 0.5 * i;
        const f = Math.max(-42, Math.min(42, -dV(x) * 24));
        const [px, py] = L.point([x, V(x)]);
        if (Math.abs(f) > 2) arrow(ctx, px, py, px + f, py, { color: C.force, width: 2.2, head: 9, alpha: arrowsOn * seg(tt, 2.8 + 0.18 * i, 3.6 + 0.18 * i) });
      }
    }, 2);
    text(ctx, `V(x): ${SHORT[live.input.V] ?? SHORT.gravity}`, L.x + L.w + 16, L.y + 20, { font: font.mono, size: 14, color: C.potential, alpha: on });
    text(ctx, 'rose: −V′(x), the force', L.x + L.w + 16, L.y + 44, { font: font.mono, size: 14, color: C.force, alpha: seg(tt, 3.5, 4.5) });
    text(ctx, levels.length ? `level lines every ΔV = ${fmt(DV, 2)}, spaced ΔV/|V′|` : 'no slope, no level lines: V is flat', L.x, L.y + L.h + 24, { ...type.note, size: 14, color: C.potential, alpha: stackOn });

    // ---- the spacetime frame: the physical path and its nudge ----
    const frameOn = seg(tt, FRAME_AT, FRAME_AT + 1);
    axes(ctx, S, { xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 1, 2], xLabel: 'x', alpha: frameOn, grid: true });
    text(ctx, 't', S.x - 12, S.y - 16, { font: font.display, italic: true, size: 20, color: color.muted, align: 'right', alpha: frameOn });
    const nudgeOn = seg(tt, NUDGE_AT, NUDGE_AT + 1);
    clipped(ctx, S, () => {
      // the free particle's straight worldline, faint, so that the bend shows
      drawPath(ctx, S, pts(FREE), { colour: color.muted, width: 1.6, dash: [6, 8], alpha: 0.5 * frameOn, progress: seg(tt, FRAME_AT + 0.5, FRAME_AT + 2) });
      drawPath(ctx, S, pts(xs), { colour: C.path, width: 3.2, alpha: frameOn, progress: seg(tt, PATH_AT, PATH_AT + 3) });
      drawPath(ctx, S, pts(nudged), { colour: C.varied, width: 2.6, alpha: nudgeOn });
      const [ax, ay] = S.point([x0, TS[k0]]);
      const [bx] = S.point([nudged[k0], TS[k0]]);
      if (Math.abs(bx - ax) > 6) arrow(ctx, ax, ay, bx, ay, { color: C.varied, width: 2, head: 9, alpha: nudgeOn });
      text(ctx, 'ε η', (ax + bx) / 2 + (bx >= ax ? 8 : -8), ay - 12, { font: font.display, italic: true, size: 20, color: C.varied, align: bx >= ax ? 'left' : 'right', alpha: nudgeOn * seg(Math.abs(bx - ax), 6, 20) });
    });
    drawPoint(ctx, S, [XA, 0], { colour: C.path, alpha: frameOn, r: 6, label: 'A', labelOffset: [-26, 8] });
    drawPoint(ctx, S, [XB, T], { colour: C.path, alpha: frameOn, r: 6, label: 'B', labelOffset: [12, -4] });
    text(ctx, 'the physical path, computed', S.x + S.w - 8, S.y + S.h - 14, { font: font.mono, size: 14, color: C.path, align: 'right', alpha: seg(tt, PATH_AT + 2.5, PATH_AT + 3.5) });
    text(ctx, 'free path', S.x + S.w - 8, S.y + S.h - 36, { font: font.mono, size: 14, color: color.muted, align: 'right', alpha: 0.8 * fade(tt, FRAME_AT + 1.5, FRAME_AT + 2.5, PATH_AT + 2.5, PATH_AT + 3.5) });
    // t₀ and the particle at t₀, projected up onto the landscape with the force there
    {
      const y0 = S.Y(where * T);
      line(ctx, S.x, y0, S.x + S.w, y0, { color: C.varied, width: 1.2, dash: [2, 6], alpha: 0.45 * nudgeOn });
      text(ctx, '0', S.x + S.w - 8, y0 - 4, { font: font.display, italic: true, size: 13, color: C.varied, align: 'right', alpha: nudgeOn }); // the display face has no ₀
      text(ctx, 't', S.x + S.w - 16, y0 - 9, { font: font.display, italic: true, size: 20, color: C.varied, align: 'right', alpha: nudgeOn });
      const markOn = seg(tt, ANSWERS_AT + 2, ANSWERS_AT + 3);
      const [px, py] = L.point([x0, Math.max(L.v[0], Math.min(L.v[1], V(x0)))]);
      // the particle at t₀, projected up onto the landscape (the line breaks around the caption)
      line(ctx, px, py, px, L.y + L.h, { color: color.muted, width: 1, dash: [3, 6], alpha: 0.7 * markOn });
      line(ctx, px, S.y, px, y0, { color: color.muted, width: 1, dash: [3, 6], alpha: 0.7 * markOn });
      dot(ctx, S.X(x0), y0, 5, C.path, markOn);
      ctx.save();
      ctx.globalAlpha *= markOn;
      ctx.shadowColor = C.path;
      ctx.shadowBlur = 12;
      dot(ctx, px, py, 6, C.path);
      ctx.restore();
      const f = Math.max(-60, Math.min(60, -dV(x0) * 24));
      if (Math.abs(f) > 2) arrow(ctx, px, py, px + f, py, { color: C.force, width: 3, head: 11, alpha: markOn });
      text(ctx, `at t₀: −V′ = ${fmt(-dV(x0), 2)}`, L.x + L.w + 16, L.y + 68, { font: font.mono, size: 15, color: C.force, alpha: markOn });
    }
    text(ctx, `ε = ${fmt(eps, 2)}   t₀/T = ${fmt(where, 2)}   V: ${SHORT[live.input.V] ?? SHORT.gravity}`, S.x, 884, { ...type.note, color: color.body, alpha: nudgeOn });

    // ---- the right column: the formulas, after the pictures ----
    F_DV.draw(ctx, 900, 206, { size: 25, alpha: seg(tt, 9, 10) });
    text(ctx, 'a one-form: displacement in, energy out', 900, 240, { ...type.note, alpha: fade(tt, 10, 11, PATH_AT, PATH_AT + 1) });
    F_LAGR.draw(ctx, 900, 290, { size: 27, alpha: seg(tt, PATH_AT, PATH_AT + 1) });
    const partsOn = seg(tt, PARTS_AT, PARTS_AT + 1);
    const acrossOn = seg(tt, ACROSS_AT - 1, ACROSS_AT);
    F_DS1.draw(ctx, 900, 345, { size: 24, alpha: seg(tt, ANSWERS_AT, ANSWERS_AT + 1) * (1 - acrossOn) });
    F_DS2.draw(ctx, 900, 345, { size: 24, alpha: acrossOn });
    const partsOut = 1 - seg(tt, ACROSS_AT + 2, ACROSS_AT + 3);
    F_PARTS.draw(ctx, 900, 400, { size: 22, alpha: partsOn * partsOut });
    text(ctx, '[m ẋ η]₀ᵀ = 0: η is pinned at both ends', 900, 432, { ...type.note, color: C.kinetic, alpha: seg(tt, PARTS_AT + 7, PARTS_AT + 8) * partsOut });
    F_BAL.draw(ctx, 900, 410, { size: 24, alpha: seg(tt, ACROSS_AT + 3, ACROSS_AT + 4) });
    F_EL.draw(ctx, 1320, 410, { size: 26, alpha: seg(tt, EL_AT, EL_AT + 1) });
    ctx.save();
    ctx.globalAlpha *= seg(tt, EL_AT + 0.5, EL_AT + 1.5);
    ctx.strokeStyle = C.force;
    ctx.lineWidth = 1.5;
    const m = F_EL.metrics(26);
    ctx.strokeRect(1310, 410 - m.height / 2 - 8, m.width + 20, m.height + 16);
    ctx.restore();

    // ---- the balance plot: the two answers along the worldline ----
    const plotOn = seg(tt, ANSWERS_AT, ANSWERS_AT + 1);
    if (plotOn > 0.003) {
      const top = Math.max(0.2, ...blue.map(Math.abs), ...green.map(Math.abs)) * 1.2;
      const B = frame({ ...B0, v: [-top, top] });
      const ystep = niceStep(2 * top);
      const ticks = [];
      for (let v = Math.ceil(B.v[0] / ystep) * ystep; v <= B.v[1] + 1e-9; v += ystep) ticks.push(Math.round(v * 1e6) / 1e6);
      axes(ctx, B, { xTicks: [0, 0.5, 1, 1.5, 2], yTicks: ticks, xLabel: 't', alpha: plotOn, grid: true, format: (v) => fmt(v, 1), formatY: (v) => fmt(v, 1) });
      line(ctx, B.x, B.Y(0), B.x + B.w, B.Y(0), { color: color.muted, width: 1, alpha: 0.6 * plotOn });
      const what = k2 > 0.999 ? 'blue, the landscape\'s answer; green, the mass\'s' : k1 > 0.001 ? 'by parts: m ẋ η̇ becomes −m ẍ η, the same area' : 'the two answers to the nudge, along the worldline';
      caption(ctx, B, what, plotOn, { color: color.muted });
      clipped(ctx, B, () => {
        // the shaded difference once the mass term is across
        const diffOn = seg(tt, ACROSS_AT + 3.5, ACROSS_AT + 4.5);
        if (diffOn > 0.003) {
          ctx.save();
          ctx.globalAlpha *= diffOn;
          ctx.fillStyle = rgba(C.force, 0.4);
          ctx.beginPath();
          TS.forEach((s, i) => (i ? ctx.lineTo(B.X(s), B.Y(blue[i])) : ctx.moveTo(B.X(s), B.Y(blue[i]))));
          for (let i = N; i >= 0; i--) ctx.lineTo(B.X(TS[i]), B.Y(green[i]));
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        drawSamples(ctx, B, TS, green, { colour: C.kinetic, width: 2.6, alpha: plotOn, fill: rgba(C.kinetic, 0.14), progress: seg(tt, ANSWERS_AT + 0.3, ANSWERS_AT + 2.3) });
        // blue on top, dashed once the two coincide, so that both stay visible
        drawSamples(ctx, B, TS, blue, { colour: C.potential, width: 2.6, alpha: plotOn * seg(tt, ANSWERS_AT + 3, ANSWERS_AT + 4), fill: k2 > 0.5 ? null : rgba(C.potential, 0.14), dash: k2 > 0.5 ? [8, 7] : [], progress: seg(tt, ANSWERS_AT + 3, ANSWERS_AT + 5) });
        // the pinned ends: η = 0 at t = 0 and t = T
        const pinOn = seg(tt, PARTS_AT + 7, PARTS_AT + 8);
        ring(ctx, B.X(0), B.Y(0), 6, C.kinetic, pinOn, 2);
        ring(ctx, B.X(T), B.Y(0), 6, C.kinetic, pinOn, 2);
        // t₀
        line(ctx, B.X(where * T), B.y, B.X(where * T), B.y + B.h, { color: C.varied, width: 1, dash: [3, 6], alpha: 0.7 * plotOn });
      }, 4);
      // the readouts
      const kinLabel = k1 > 0.999 ? (k2 > 0.999 ? '∫ m ẍ η dt' : '−∫ m ẍ η dt') : '∫ m ẋ η̇ dt';
      const kinValue = k1 > 0.999 ? (k2 > 0.999 ? -fvK.byParts : fvK.byParts) : fvK.direct;
      text(ctx, `${kinLabel} = ${fmt(kinValue, 3)}`, 900, 836, { font: font.mono, size: 15, color: C.kinetic, alpha: plotOn });
      const morphing = k1 > 0.001 && k1 < 0.999;
      text(ctx, `∫ −V′(x) η dt = ${fmt(fv.direct - fvK.direct, 3)}`, 1150, 836, { font: font.mono, size: 15, color: C.potential, alpha: morphing ? 0 : plotOn * seg(tt, ANSWERS_AT + 3, ANSWERS_AT + 4) });
      text(ctx, `by parts: ${fmt(fvK.direct, 3)} → ${fmt(fvK.byParts, 3)}, the same area`, 1150, 836, { font: font.mono, size: 15, color: C.kinetic, alpha: morphing ? plotOn : 0 });
      text(ctx, 'dS/dε', 900, 862, { font: font.mono, size: 18, color: color.muted, alpha: plotOn * seg(tt, ANSWERS_AT + 4, ANSWERS_AT + 5) });
      text(ctx, fmt(fv.direct, 3), 975, 862, { font: font.mono, size: 18, weight: 500, color: C.fibre, alpha: plotOn * seg(tt, ANSWERS_AT + 4, ANSWERS_AT + 5) });
      text(ctx, k2 > 0.999 ? 'their difference, integrated' : 'the two answers, added', 1060, 862, { font: font.mono, size: 14, color: color.muted, alpha: plotOn * seg(tt, ANSWERS_AT + 5, ANSWERS_AT + 6) });
    }
    stamp(ctx, seg(tt, PATH_AT + 3, PATH_AT + 4), 'the path is shot from A to B under −V′; every curve and number is computed from it');
  },
});
