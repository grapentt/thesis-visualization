// Scene 12 (live): depth as a flow. Forty-eight tokens on the sphere move towards the context they
// attend to (the value map the identity, M = I + a[ẑ]ₓ). With a = 0 the flow is a gradient flow of
// the interaction energy E_β and the tokens cluster; the 2-form adds a circulation around ẑ that is
// not a gradient. The same tokens are released three times (events at 40 s and 62 s), so each act
// starts from a spread cloud: symmetric, then with the 2-form, then for the viewer.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, ring, arrow, rgba, camera, drawSurface, polyline3, slider, drag } from '../../../../src/kit.js';
import { simulation } from '../../../../src/engine/simulation.js';
import { sphereFlow, sphereVelocity } from '../math.js';
import { KEY, QUERY, SYM, ANTI, INFO, header, panel, readout, exampleStamp } from '../shared.js';

const R = 850;
const DURATION = 85;
const SPHERE_BOX = [40, 150, 760, 860];
const RESTART_A = 40; // the same tokens again, with the 2-form on
const RESTART_B = 62; // a third time, for the viewer
const HANDOVER_AT = 62.5;
const PLOT = { x: R, y: 392, w: 690, h: 200 };
/** Simulation coordinates to drawing coordinates: the camera's up is y, so the simulation's ẑ goes there (a rotation). */
const W = (p) => [p[1], p[2], p[0]];

const FLOW = tex(String.raw`\dot x_i = P^{\perp}_{x_i}\sum_j a_{ij}\, x_j,\qquad a_{ij} = \mathrm{softmax}_j\big(\beta\, x_i^{\top} M x_j\big)`, 'ẋᵢ = P⊥ Σⱼ aᵢⱼ xⱼ,  aᵢⱼ = softmaxⱼ(β xᵢᵀ M xⱼ)');
const FORM = tex(String.raw`M = I + a\,[\hat z]_\times,\qquad x_i^{\top} A\, x_j = a\, \hat z\cdot(x_i \times x_j)`, 'M = I + a[ẑ]ₓ,  xᵢᵀ A xⱼ = a ẑ·(xᵢ × xⱼ)');
const ENERGY = tex(String.raw`E_\beta(X) = \frac{1}{2\beta n^2}\sum_{i,j} e^{\beta\, x_i\cdot x_j}`, 'E_β(X) = (1/2βn²) Σᵢⱼ e^{β xᵢ·xⱼ}');

// the simulation of math.js, with the tokens' first positions kept so two events can release them again
const base = sphereFlow();
const restart = (state) => {
  state.X.set(state.X0);
  state.clusters = state.n;
};
export const flow = simulation({
  ...base,
  init: (rng) => {
    const state = base.init(rng);
    state.X0 = state.X.slice();
    return state;
  },
  events: [[RESTART_A, restart], [RESTART_B, restart]],
});

export default defineScene({
  name: 'Depth as a flow',
  duration: DURATION,
  header: header(12, 'DEPTH AS A FLOW', 'Tokens as interacting particles on the sphere'),
  narration: [
    [0, 'Now let depth flow. Put the tokens on the sphere, a normalised residual stream, and let every token move towards the context it attends to, projected back onto the sphere. Forty-eight tokens, the identity as the value map, and the symmetric part of the form equal to the identity.'],
    [10, 'Within ten units of depth the tokens have gathered into two clusters, each on the far side of the other. With a symmetric form this is a gradient flow of the interaction energy E on the sphere, in a suitable metric, so E can only grow. That is why tokens cluster with depth.'],
    [24, 'Lower beta. At beta four each cluster saw only itself, and two clusters were a stable state. At beta one they see each other, the larger cluster wins, and by depth thirty-four they have merged. Metastable clusters, then a single point: the long-time fate of this flow.'],
    [RESTART_A, 'The same tokens again, with the 2-form switched on. A pairs tokens with a sign and favours tokens ahead in azimuth. The rose arrow is what the antisymmetric part adds to a velocity, and it is not a gradient. The tokens swirl around the axis while they gather, a full turn before they settle, and nothing forces E upward any more.'],
    [54, 'So the general attention flow is dissipative plus circulatory, and the split of the velocity field is the split M equals S plus A of the form we started with.'],
    [RESTART_B, 'Your turn: the same tokens a third time, at beta two with a weak 2-form. Change beta or the 2-form while the tokens are still spread, and watch the energy and the cluster count.'],
    [74, 'Across layers, then: a flow of interacting particles whose gradient part comes from S and whose rotation comes from A. Next, the whole picture, end to end.'],
  ],
  beats: [
    [10, 'Clusters'],
    [24, 'Lower β'],
    [RESTART_A, 'The 2-form'],
    [RESTART_B, 'Your turn'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: change β or the 2-form a while the tokens are still spread. Can you keep them from clustering?' }],
  exploreFrom: 1.5,
  controls: {
    beta: slider('Inverse temperature β', { min: 0.5, max: 9, step: 0.1, value: [[0, 4], [23.5, 4], [25, 1], [RESTART_A - 0.5, 1], [RESTART_A, 4], [RESTART_B - 0.5, 4], [RESTART_B, 2]] }),
    anti: slider('2-form strength a', { min: 0, max: 2, step: 0.05, value: [[0, 0], [RESTART_A - 0.5, 0], [RESTART_A, 1.2], [RESTART_B - 0.5, 1.2], [RESTART_B, 0.6]] }),
    view: drag('Drag the sphere to rotate it', { region: SPHERE_BOX }),
  },
  sim: flow,

  draw(ctx, t, { input, state }) {
    const [dx, dy] = input.view;
    const cam = camera({ cx: 400, cy: 525, scale: 265, yaw: 0.45 + 0.02 * t + 0.006 * dx, pitch: 0.32 - 0.004 * dy, focal: 12 });
    const on = seg(t, 0, 0.8);
    drawSphere(ctx, cam, on);
    const axisOn = fade(t, RESTART_A - 1, RESTART_A + 0.5);
    drawAxis(ctx, cam, axisOn, input.anti);
    drawTokens(ctx, cam, state, input, on, t);

    // readouts under the sphere
    const act = t < RESTART_A ? 'first release' : t < RESTART_B ? 'second release: the same tokens' : 'third release: the same tokens';
    text(ctx, act, 400, 868, { ...type.note, align: 'center', color: color.body, alpha: on });
    const flash = Math.max(fade(t, RESTART_A, RESTART_A + 0.2, RESTART_A + 1.2, RESTART_A + 2), fade(t, RESTART_B, RESTART_B + 0.2, RESTART_B + 1.2, RESTART_B + 2));
    text(ctx, 'released again from their first positions', 400, 190, { ...type.note, align: 'center', color: QUERY, alpha: flash });

    drawNotes(ctx, t, state, input);
    drawEnergy(ctx, t, state, input);
    exampleStamp(ctx, seg(t, 2, 3), 'n = 48 tokens on S² · dt = 1/60 · value map = identity · everything computed');
  },
});

/** The unit sphere, shaded, with a few parallels and meridians on the near side. */
function drawSphere(ctx, cam, alpha) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawSurface(ctx, cam, (u, v) => [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)], {
    nu: 40,
    nv: 20,
    u: [0, 2 * Math.PI],
    v: [0, Math.PI],
    color: () => '#1b2742',
    alpha: 0.92,
    ambient: 0.45,
  });
  const near = (points) => (i) => cam.rotate(points[i])[2] < -0.02;
  for (const z of [-0.8, -0.4, 0, 0.4, 0.8]) {
    const r = Math.sqrt(1 - z * z);
    const pts = Array.from({ length: 73 }, (_, i) => [r * Math.cos((2 * Math.PI * i) / 72), z, r * Math.sin((2 * Math.PI * i) / 72)]);
    polyline3(ctx, cam, pts, { color: color.line, width: z === 0 ? 1.4 : 0.9, alpha: z === 0 ? 0.9 : 0.55, visible: near(pts) });
  }
  for (let k = 0; k < 8; k++) {
    const phi = (Math.PI * k) / 8;
    const pts = Array.from({ length: 73 }, (_, i) => {
      const v = (2 * Math.PI * i) / 72;
      return [Math.sin(v) * Math.cos(phi), Math.cos(v), Math.sin(v) * Math.sin(phi)];
    });
    polyline3(ctx, cam, pts, { color: color.line, width: 0.9, alpha: 0.5, visible: near(pts) });
  }
  ctx.restore();
}

/** The axis ẑ of the 2-form, with an arc showing the sense of the circulation it favours. */
function drawAxis(ctx, cam, alpha, anti) {
  if (alpha <= 0.003) return;
  const axis = [[0, 0, -1], [0, 0, -1], [0, 0, 1], [0, 0, 1.25]].map(W);
  polyline3(ctx, cam, [axis[2], axis[3]], { color: ANTI, width: 2, alpha: 0.9 * alpha });
  polyline3(ctx, cam, [axis[1], axis[2]], { color: ANTI, width: 1, alpha: 0.3 * alpha, dash: [3, 6] });
  const top = cam.project(axis[3]);
  text(ctx, 'ẑ', top.x + 10, top.y - 2, { font: font.display, italic: true, size: 22, color: ANTI, alpha });
  // the circulation: an arc around the pole, in the sense the 2-form favours (counter-clockwise seen from +ẑ)
  const sense = alpha * Math.min(1, anti / 0.6);
  const arc = Array.from({ length: 37 }, (_, i) => {
    const phi = -0.3 + (1.9 * Math.PI * i) / 36;
    return W([0.3 * Math.cos(phi), 0.3 * Math.sin(phi), 1.12]);
  });
  polyline3(ctx, cam, arc, { color: ANTI, width: 2, alpha: sense });
  const a = cam.project(arc[33]);
  const b = cam.project(arc[36]);
  arrow(ctx, a.x, a.y, b.x + (b.x - a.x) * 0.6, b.y + (b.y - a.y) * 0.6, { color: ANTI, width: 2, head: 11, alpha: sense });
  text(ctx, 'the sense A favours', top.x + 30, top.y - 2, { font: font.mono, size: 13, color: ANTI, alpha: sense });
}

/** Tokens, their velocities, and the split velocity of token 0. */
function drawTokens(ctx, cam, state, input, alpha, t) {
  if (alpha <= 0.003 || !state) return;
  const { X, n } = state;
  const L = 0.55; // units of velocity drawn per unit of velocity
  const entries = [];
  for (let i = 0; i < n; i++) {
    const p = W([X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
    const z = cam.rotate(p)[2];
    entries.push({ i, p, front: z < 0, s: cam.project(p) });
  }
  entries.sort((a, b) => (a.front === b.front ? 0 : a.front ? 1 : -1));
  ctx.save();
  ctx.globalAlpha *= alpha;
  const arrowsOn = seg(t, 1, 2);
  for (const { i, p, front, s } of entries) {
    const dim = front ? 1 : 0.28;
    if (i === 0) continue;
    // every token's velocity, thin, so the field is visible
    if (front && arrowsOn > 0.003) {
      const v = sphereVelocity(X, i, input.beta, input.anti);
      const speed = Math.hypot(v[0], v[1], v[2]);
      if (speed > 0.02) {
        const tip = cam.project(W([X[3 * i] + L * v[0], X[3 * i + 1] + L * v[1], X[3 * i + 2] + L * v[2]]));
        arrow(ctx, s.x, s.y, tip.x, tip.y, { color: color.body, width: 1.3, head: 7, alpha: 0.55 * arrowsOn });
      }
    }
    dot(ctx, s.x, s.y, front ? 6 : 3.5, KEY, dim);
  }
  // token 0: the velocity split v = v_S + (v − v_S)
  const first = entries.find((e) => e.i === 0);
  const { s, front } = first;
  const p0 = [X[0], X[1], X[2]];
  const v = sphereVelocity(X, 0, input.beta, input.anti);
  const vS = sphereVelocity(X, 0, input.beta, 0);
  const tipS = cam.project(W([p0[0] + L * vS[0], p0[1] + L * vS[1], p0[2] + L * vS[2]]));
  const tip = cam.project(W([p0[0] + L * v[0], p0[1] + L * v[1], p0[2] + L * v[2]]));
  const a0 = (front ? 1 : 0.4) * arrowsOn;
  arrow(ctx, s.x, s.y, tipS.x, tipS.y, { color: SYM, width: 4, head: 13, alpha: a0 });
  const circ = Math.hypot(v[0] - vS[0], v[1] - vS[1], v[2] - vS[2]);
  if (circ > 0.01) arrow(ctx, tipS.x, tipS.y, tip.x, tip.y, { color: ANTI, width: 4, head: 13, alpha: a0 });
  dot(ctx, s.x, s.y, front ? 8 : 4.5, QUERY, front ? 1 : 0.5);
  ring(ctx, s.x, s.y, front ? 13 : 8, QUERY, (front ? 0.8 : 0.4) * alpha, 2);
  ctx.restore();
  // legend for the arrows, bottom left of the sphere
  const lx = 60;
  const ly = 808;
  const legend = arrowsOn;
  arrow(ctx, lx, ly, lx + 40, ly, { color: SYM, width: 3, head: 10, alpha: legend });
  text(ctx, 'v_S: the symmetric part, a gradient', lx + 52, ly + 5, { font: font.mono, size: 14, color: SYM, alpha: legend });
  const l2 = fade(t, RESTART_A - 0.5, RESTART_A + 0.5);
  arrow(ctx, lx, ly + 26, lx + 40, ly + 26, { color: ANTI, width: 3, head: 10, alpha: l2 });
  text(ctx, 'v − v_S: what the 2-form adds, a circulation', lx + 52, ly + 31, { font: font.mono, size: 14, color: ANTI, alpha: l2 });
}

/** Formulas, readouts and the timed notes of the right-hand column. */
function drawNotes(ctx, t, state, input) {
  FLOW.draw(ctx, R, 218, { size: 25, alpha: seg(t, 0.5, 1.5) });
  text(ctx, 'the residual update x_i ← x_i + W_O W_V Σ_j a_ij x_j, depth as time, value map the identity', R, 258, { ...type.note, size: 13, alpha: seg(t, 1.5, 2.5) });
  FORM.draw(ctx, R, 300, { size: 22, alpha: seg(t, 3, 4) });
  text(ctx, 'S = I: the plain dot product · A: a 2-form about the axis ẑ, off until the second release', R, 336, { ...type.note, size: 13, alpha: fade(t, 4, 5, RESTART_A - 1, RESTART_A) });
  text(ctx, 'A favours tokens ahead in azimuth about ẑ: the score from i to j rises when j lies ahead of i', R, 336, { ...type.note, size: 13, color: ANTI, alpha: seg(t, RESTART_A, RESTART_A + 1) });
  ENERGY.draw(ctx, R, 372, { size: 22, alpha: seg(t, 11, 12) });

  // readouts
  const y = 636;
  const ro = seg(t, 1, 2);
  readout(ctx, 'β =', input.beta, R, y, { colour: QUERY, alpha: ro, digits: 1 });
  readout(ctx, 'a =', input.anti, R + 120, y, { colour: ANTI, alpha: ro, digits: 2 });
  readout(ctx, 'clusters', state ? state.clusters : 0, R + 250, y, { colour: KEY, alpha: ro, digits: 0 });
  const depth = t < RESTART_A ? t : t < RESTART_B ? t - RESTART_A : t - RESTART_B;
  readout(ctx, 'depth', depth, R + 530, y, { colour: color.body, alpha: ro, digits: 1 });
  text(ctx, 'closer than 0.08 rad: one cluster', R + 250, y + 20, { ...type.note, size: 13, alpha: ro });
  text(ctx, 'since the last release', R + 530, y + 20, { ...type.note, size: 13, alpha: ro });

  // notes timed to the narration
  const Y = 694;
  const n1 = fade(t, 12, 13, 23.5, 24.5);
  wrap(ctx, 'a = 0: the flow is a gradient flow of E_β on the sphere (for a metric that differs from the round one), so E_β never decreases and the tokens cluster. Geshkovski, Letrouit, Polyanskiy & Rigollet, A mathematical perspective on transformers (2023).', R, Y, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n1 });
  const n2 = fade(t, 26, 27, RESTART_A - 1, RESTART_A);
  wrap(ctx, 'Two tight clusters on opposite sides are a stationary state: each token attends almost only to its own cluster, and the attended context is where it already is. At β = 1 the other cluster carries weight e^{−2} ≈ 0.14 instead of e^{−8} ≈ 0.0003, the balance tips, and the clusters merge. Metastability, then collapse.', R, Y, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n2 });
  const n3 = fade(t, RESTART_A + 2, RESTART_A + 3, 61, RESTART_B);
  wrap(ctx, 'The gradient part v_S comes from S, the circulation v − v_S from A. The circulation turns the cloud about ẑ about once while the clusters form, and the gradient-flow guarantee is gone: nothing forces E_β upward (here it still happens to rise).', R, Y, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n3 });
  const n4 = fade(t, 54.5, 55.5, 61, RESTART_B);
  text(ctx, 'dissipative + circulatory  ⟺  M = S + A', R, Y + 90, { font: font.mono, size: 18, color: INFO, alpha: n4 });
  const n5 = seg(t, RESTART_B + 1, RESTART_B + 2);
  wrap(ctx, 'Every lever is yours: β sets how far a token looks, a how much it prefers what lies ahead. Clusters always win in the end; the 2-form only decides how the tokens get there.', R, Y, 690, 26, { ...type.note, size: 15, color: color.body, alpha: n5 });
}

/** E_β over depth, the whole scene on one axis, with the two releases marked. */
function drawEnergy(ctx, t, state, input) {
  const alpha = seg(t, 11, 12);
  if (alpha <= 0.003) return;
  const { x, y, w, h } = PLOT;
  panel(ctx, x, y, w, h, { alpha });
  const X = (s) => x + 48 + ((w - 64) * s) / DURATION;
  const Y = (e) => y + h - 28 - (h - 66) * e;
  ctx.save();
  ctx.globalAlpha *= alpha;
  line(ctx, X(0), Y(0), X(DURATION), Y(0), { color: color.line });
  line(ctx, X(0), Y(0), X(0), Y(1), { color: color.line });
  for (const e of [0, 0.5, 1]) {
    line(ctx, X(0) - 5, Y(e), X(0), Y(e), { color: color.line });
    text(ctx, e.toFixed(1), X(0) - 10, Y(e) + 5, { font: font.mono, size: 13, color: color.muted, align: 'right' });
  }
  for (const s of [0, 20, 40, 60]) text(ctx, String(s), X(s), Y(0) + 18, { font: font.mono, size: 13, color: color.muted, align: 'center' });
  text(ctx, 'E_β / E_max', X(0) + 8, y + 18, { font: font.mono, size: 14, color: INFO });
  text(ctx, 'scene time', X(DURATION), Y(0) + 18, { font: font.mono, size: 13, color: color.muted, align: 'right' });
  for (const [s, label] of [[RESTART_A, '2-form on'], [RESTART_B, 'your turn']]) {
    line(ctx, X(s), Y(0), X(s), Y(1) - 4, { color: ANTI, width: 1, dash: [4, 4], alpha: 0.8 });
    text(ctx, label, X(s) + 6, Y(0) - 8, { font: font.mono, size: 12, color: ANTI });
  }
  if (state && state.ticks > 1) {
    const ticks = Math.min(state.ticks, state.energy.length);
    ctx.strokeStyle = INFO;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let pen = false;
    for (let k = 0; k < ticks; k += 2) {
      const s = (k + 1) / 60;
      const px = X(s);
      const py = Y(Math.min(1, state.energy[k]));
      // lift the pen across a release, so the drop is a gap, not a slope
      const across = [RESTART_A, RESTART_B].some((r) => Math.abs(s - r) < 1.5 / 60);
      if (!pen || across) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      pen = true;
    }
    ctx.stroke();
    const last = state.energy[ticks - 1];
    dot(ctx, X(ticks / 60), Y(Math.min(1, last)), 4, INFO);
    text(ctx, last.toFixed(3), X(ticks / 60) + 8, Y(Math.min(1, last)) - 8, { font: font.mono, size: 13, color: INFO });
  }
  ctx.restore();
  const note = t < RESTART_A - 1 ? 'a = 0, β held: a gradient flow, E_β never decreases' : t < RESTART_B ? 'a ≠ 0: not a gradient, no monotonicity promised' : `β = ${fmt(input.beta, 1)}, a = ${fmt(input.anti, 2)}`;
  text(ctx, note, X(0) + 8, y + 34, { font: font.mono, size: 12, color: t < RESTART_A - 1 ? SYM : ANTI, alpha });
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
