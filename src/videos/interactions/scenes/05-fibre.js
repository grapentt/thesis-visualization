import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, rgba, camera, arrow3, rotation, vec3 } from '../../../kit.js';
import { POSE, VERTICAL, SCORE_W, SCORE_P, INTER, PAIR_MOL, WATER_MOL, PEROXIDE_MOL, drawMol, drawHalo, drawTorsorCarousel, drawGaugeFlag, toyStamp } from '../shared.js';
import { DOCKED } from '../data.js';
import { U_int, centroid, join, quatFromMatrix } from '../toy.js';

const DEG = Math.PI / 180;
const UP = [0, 1, 0];
const YAW = 0.35, PITCH = -0.55; // carousels and pair seen from slightly above
const RIGHT = 900;
const STEP = 45; // degrees between neighbouring copies on a ring; copy k sits at k·45° from the front

// bodies about their own centroids (DOCKED's orientations) and the docked arrow r₀ = c_B − c_A
const body = (X) => {
  const c = centroid(X);
  return Array.from(X, (v, i) => v - c[i % 3]);
};
const BODY_A = body(DOCKED.XA), BODY_B = body(DOCKED.XB);
const R0 = vec3.sub(centroid(DOCKED.XB), centroid(DOCKED.XA));
/** Every atom of X turned by R about the origin, then shifted. */
function turn(X, R, shift = [0, 0, 0]) {
  const out = [];
  for (let i = 0; i < X.length; i += 3) out.push(...vec3.add(rotation.apply(R, [X[i], X[i + 1], X[i + 2]]), shift));
  return out;
}
const about = (deg) => rotation.axisAngle(UP, deg * DEG);

const DECOMP = tex(String.raw`x_i = c_i + \bar x_i`, 'xᵢ = cᵢ + x̄ᵢ');
const FIBRE = tex(String.raw`F_{(b_A,b_B)} = \big(\pi_A^{-1}(b_A)\times\pi_B^{-1}(b_B)\times\mathbb R^3\big)/SO(3)`, 'F = (π_A⁻¹(b_A) × π_B⁻¹(b_B) × ℝ³)/SO(3)');
const GAUGE_A = tex(String.raw`\big(R_A^{-1}R_B,\ R_A^{-1}(c_B - c_A)\big)\in SO(3)\times\mathbb R^3`, '(R_A⁻¹R_B, R_A⁻¹(c_B − c_A)) ∈ SO(3) × ℝ³');
const GAUGE_B = tex(String.raw`\big(R_B^{-1}R_A,\ R_B^{-1}(c_A - c_B)\big)\in SO(3)\times\mathbb R^3`, '(R_B⁻¹R_A, R_B⁻¹(c_A − c_B)) ∈ SO(3) × ℝ³');
const Q_AB = tex(String.raw`R_A^{-1}R_B`, 'R_A⁻¹R_B'), V_AB = tex(String.raw`R_A^{-1}(c_B - c_A)`, 'R_A⁻¹(c_B − c_A)');
const Q_BA = tex(String.raw`R_B^{-1}R_A`, 'R_B⁻¹R_A'), V_BA = tex(String.raw`R_B^{-1}(c_A - c_B)`, 'R_B⁻¹(c_A − c_B)');
const UINT = tex(String.raw`U_{\mathrm{int}} =`, 'U_int =');
const ASSOC = tex(String.raw`M_{AB}\ \cong\ P_A\times_{SO(3)}\mathbb R^{3N_B}\quad(\text{A non-collinear})`, 'M_AB ≅ P_A ×_SO(3) ℝ^{3N_B}   (A non-collinear)');
const QUOTIENT = tex(String.raw`\times_{SO(3)}:\ \text{pairs } (x_A, y_B),\ \text{with } (Rx_A, Ry_B)\ \text{counted as the same point}`, '×_SO(3): pairs (x_A, y_B), with (Rx_A, Ry_B) counted as the same point');
const NETWORK = tex(String.raw`\text{an invariant network } f(x_A, y_B) \text{ with } f(Rx_A, Ry_B) = f(x_A, y_B)`, 'an invariant network f(x_A, y_B) with f(Rx_A, Ry_B) = f(x_A, y_B)');
const SPACE = tex(String.raw`M_{AB}`, 'M_AB');
const LABEL_A = tex(String.raw`x_A\ \text{(water)}`, 'x_A (water)');
const LABEL_B = tex(String.raw`y_B\ \text{(peroxide's atoms)}`, 'y_B (peroxide’s atoms)');

// beats (scene-local seconds)
const OWN_B = [9.5, 12.5], DIAGONAL = [13, 17.5], COMMON = [30.5, 33.5], MOVE_A = [44.8, 46.3], MOVE_B = [46.8, 48.3], SWITCH = [49, 50.5];
const SWITCH_OUT = [49, 49.7], SWITCH_IN = [49.8, 50.5]; // water's readouts leave before peroxide's arrive
const POINT = [720, 735]; // the associated bundle's marked point
const ASSOCIATED = 57, SWEEP = [59.5, 65], COLLAPSE = [65.3, 66.8];
const FLAG_A = 1, FLAG_B = 1; // copies that get the reference flags
const DELTA = FLAG_A * STEP - 120; // the common turn that brings A's bright copy onto its flag: −75°
const MOVES_B = 2; // B's flag moves two copies (copy 3), so the quaternion does not just return to its old value
const PIN_B = -STEP; // at the switch, the common turn that brings B's bright copy (copy 4) onto its flag (copy 3)

/**
 * The carousel state at t: bright-copy angles, the arrow's angle and the flags (degrees / copy indices).
 * pinned: false leaves out the gauge switch's common turn (the inset keeps still: same pose).
 */
function state(t, pinned = true) {
  const gamma = 120 * seg(t, ...DIAGONAL) + DELTA * seg(t, ...COMMON) + (pinned ? PIN_B * seg(t, ...SWITCH) : 0);
  return {
    aA: gamma,
    aB: 135 * seg(t, ...OWN_B) + gamma,
    phi: gamma,
    hA: FLAG_A + seg(t, ...MOVE_A),
    hB: FLAG_B + MOVES_B * seg(t, ...MOVE_B),
  };
}

/** The lab pair the carousels stand for: A = R(α_A) x̄_A, B = R(α_B) x̄_B + R(φ) r₀. */
function labPair({ aA, aB, phi }) {
  const cB = rotation.apply(about(phi), R0);
  const XA = turn(BODY_A, about(aA)), XB = turn(BODY_B, about(aB), cB);
  return { XA, XB, X: join(XA, XB), cA: [0, 0, 0], cB };
}

const signed = (v) => `${v < -0.005 ? '−' : ' '}${Math.abs(v).toFixed(2)}`;
const tuple = (vs) => `(${vs.map(signed).join(', ')})`;

export default defineScene({
  name: 'Fibre',
  duration: 82,
  header: { eyebrow: '05 · FIBRE', title: 'What sits above two fixed shapes' },
  narration: [
    [0, 'Fix both own shapes. What is left? Each molecule can still turn, through its own orbit, a torsor.'],
    [8.5, 'The centres add one arrow, from water to peroxide. Turning everything together, arrow included, changes nothing, so we divide that out.'],
    [18.5, 'Two turns and one arrow, minus one common turn: six dimensions.'],
    [24, 'For coordinates, choose a reference copy on each ring. That turns each torsor into the rotation group. Then use the common turn to bring water onto its reference.'],
    [37, 'What remains is peroxide\'s orientation and position as water sees them: a docking pose.'],
    [44, 'Move a reference, and the numbers change, but not the pose. Pinning peroxide instead works just as well. A root is a gauge: a choice, not a fact.'],
    [57, 'There is a way to say this without any reference. Take water together with peroxide\'s atoms, and count turning both together as the same point.'],
    [68.5, 'That is peroxide as water sees it, without ever writing water\'s frame. This space is the associated bundle, and it is exactly the cluster\'s shape space.'],
  ],

  draw(ctx, t) {
    const s = state(t);
    const pair = labPair(state(t, false)); // a gauge switch only relabels: the drawn pair does not turn
    const toB = seg(t, ...SWITCH); // the common-turn role: 0 on water, 1 on peroxide
    const away = seg(t, ASSOCIATED, ASSOCIATED + 1); // carousels step back for the associated bundle

    drawCarousels(ctx, t, s, toB, away);
    drawInset(ctx, t, pair);
    drawAssociated(ctx, t, pair);
    drawNotes(ctx, t, s, pair);
    toyStamp(ctx, fade(t, 0.5, 1.5));
  },
});

/**
 * A 'reference' flag at a ring point, for copy k (fractional while it moves). Its label sits inside the
 * ring for copy 1, near the front, and changes sides (fading out and in) to the left of the pole by
 * copy 2, where the inside is crowded by the back copies.
 */
function drawFlag(ctx, cam, point, k, alpha) {
  const u = Math.min(Math.max(k - 1, 0), 1);
  drawGaugeFlag(ctx, cam, point, { side: u < 0.5 ? 'right' : 'left', labelAlpha: Math.abs(1 - 2 * u), alpha });
}

/** Two torsor carousels, A (water) and B (peroxide), with their flags and the common-turn tick. */
function drawCarousels(ctx, t, { aA, aB, hA, hB }, toB, away) {
  const show = (from) => (1 - 0.85 * away) * seg(t, from, from + 1.5); // the rings stay at 0.15
  const extras = 1 - away; // labels, flags, ticks and the caption leave completely
  const fixed = seg(t, COMMON[1], COMMON[1] + 1); // ring A has been used up by the common turn
  const rings = [
    { cx: 290, X: DOCKED.XA, mol: WATER_MOL, bright: aA / STEP, flag: hA, plant: 24.5, dim: fixed * (1 - toB), label: 'A · water', tint: SCORE_W, from: 0.5 },
    { cx: 690, X: DOCKED.XB, mol: PEROXIDE_MOL, bright: aB / STEP, flag: hB, plant: 25.5, dim: toB, label: 'B · peroxide', tint: SCORE_P, from: 1 },
  ];
  for (const r of rings) {
    const cam = camera({ cx: r.cx, cy: 420, scale: 65, yaw: YAW, pitch: PITCH, focal: 14 });
    const a = show(r.from) * (1 - 0.7 * r.dim);
    const ring = drawTorsorCarousel(ctx, cam, r.X, r.mol, { centre: [0, 0, 0], radius: 1.9, axis: UP, bright: r.bright, start: -YAW, scale: 0.55, caption: false, alpha: a });
    // the flag keeps full strength on a dimmed ring: moving it is the point at 44 s
    drawFlag(ctx, cam, ring.pointAt(r.flag), r.flag, extras * seg(t, r.plant, r.plant + 1));
    text(ctx, r.label, r.cx, 290, { font: font.display, italic: true, size: 23, color: r.tint, align: 'center', alpha: a * extras });
  }
  text(ctx, 'drawn: turns about one axis; SO(3) has three', 490, 536, { ...type.note, align: 'center', alpha: show(2.5) * extras });

  // the common turn is fixed with one molecule: '0 := A', later '0 := B'
  const tick = extras * seg(t, COMMON[1] + 0.5, COMMON[1] + 1.5);
  drawGaugeFlag(ctx, null, { x: 362, y: 312 }, { label: '0 := A', variant: 'tick', alpha: tick * (1 - toB) });
  drawGaugeFlag(ctx, null, { x: 780, y: 312 }, { label: '0 := B', variant: 'tick', alpha: tick * toB });
}

/** 'The pair' (until 57 s): the lab configuration the two bright copies and the arrow stand for. */
function drawInset(ctx, t, { X, cA, cB }) {
  const a = fade(t, 0.5, 1.5, ASSOCIATED, ASSOCIATED + 0.8);
  if (a <= 0.003) return;
  const [cx, cy, r] = [490, 720, 115];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = color.panel;
  ctx.fill();
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  text(ctx, 'the pair', cx, cy - r - 12, { ...type.note, align: 'center', alpha: a });
  if (t >= ASSOCIATED) return; // from here the pair grows out of the window (drawAssociated)

  const cam = pairCamera(t, cA, cB);
  const ends = [[cA, 0, 3], [cB, 3, 7]].map(([c, from, to]) => [cam.project(c), from, to]);
  ctx.save();
  ctx.globalAlpha *= a * 0.7 * fade(t, 2, 3, 8.5, 9.5);
  ctx.strokeStyle = color.body;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const [p, from, to] of ends) {
    for (let i = from; i < to; i++) {
      const q = cam.project([X[3 * i], X[3 * i + 1], X[3 * i + 2]]);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
    }
  }
  ctx.stroke();
  ctx.restore();
  drawPair(ctx, cam, X, a);
  arrow3(ctx, cam, cA, vec3.sub(cB, cA), { color: POSE, width: 3.5, head: 12, alpha: a * seg(t, 8.5, 9.5) });
  ctx.save();
  ctx.globalAlpha *= a * seg(t, 2, 3);
  ctx.fillStyle = '#ffffff';
  for (const [p] of ends) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

/** Halfway between the two centres: the pair sits evenly in its window and turns about this point. */
const middle = (cA, cB) => vec3.scale(vec3.add(cA, cB), 0.5);

/** The inset's camera, growing into the large picture of the associated bundle from 57 s. */
function pairCamera(t, cA, cB) {
  const g = seg(t, ASSOCIATED, ASSOCIATED + 1.5);
  return camera({ cx: lerp(490, 480, g), cy: lerp(720, 470, g), scale: lerp(42, 60, g), yaw: YAW, pitch: PITCH, focal: 30, center: middle(cA, cB) });
}

/** The pair with its two halos. */
function drawPair(ctx, cam, X, alpha) {
  drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha });
  drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha });
  drawMol(ctx, X, cam, PAIR_MOL, { opacity: alpha });
}

/** From 57 s: the pair turned as a whole, its ghosts on a gold arc, all one point of the associated bundle. */
function drawAssociated(ctx, t, { X, cA, cB }) {
  if (t < ASSOCIATED) return;
  const c = middle(cA, cB);
  const beta = 360 * seg(t, ...SWEEP);
  const turned = (deg) => turn(Array.from(X, (v, i) => v - c[i % 3]), about(deg), c);
  const cam = pairCamera(t, cA, cB), Y = turned(beta);
  drawPair(ctx, cam, Y, 1);

  // the two labels ride along beside their molecules
  const labels = seg(t, 58.5, 59.5);
  for (const [label, from, to] of [[LABEL_A, 0, 3], [LABEL_B, 3, 7]]) {
    const ps = [];
    for (let i = from; i < to; i++) ps.push(cam.project([Y[3 * i], Y[3 * i + 1], Y[3 * i + 2]]));
    const right = Math.max(...ps.map((p) => p.x)), mid = ps.reduce((m, p) => m + p.y, 0) / ps.length;
    label.drawOnBaseline(ctx, right + 34, mid + 7, { size: 21, alpha: labels });
  }

  // a gold arc under the pair carries 8 ghost copies in small windows, one per 45° of the sweep
  const ARC = { x: 470, y: 400, r: 330 };
  const arcAngle = (k) => (-135 + (90 * k) / 7) * DEG;
  const arcPoint = (k) => [ARC.x + ARC.r * Math.cos(arcAngle(k)), ARC.y - ARC.r * Math.sin(arcAngle(k))];
  const collapse = seg(t, ...COLLAPSE);
  const arcAlpha = seg(t, SWEEP[0], SWEEP[0] + 0.4) * (1 - collapse);
  if (arcAlpha > 0.003) {
    ctx.save();
    ctx.globalAlpha *= 0.7 * arcAlpha;
    ctx.strokeStyle = VERTICAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ARC.x, ARC.y, ARC.r, -arcAngle(0), -arcAngle(Math.min(beta / STEP, 7)), true);
    ctx.stroke();
    ctx.restore();
  }
  for (let k = 0; k < 8; k++) {
    const show = lin(beta, k * STEP, k * STEP + 12) * (1 - collapse);
    if (show <= 0.003) continue;
    const [x0, y0] = arcPoint(k);
    const [x, y] = [lerp(x0, POINT[0], collapse), lerp(y0, POINT[1], collapse)];
    const size = 1 - 0.8 * collapse;
    ctx.save();
    ctx.globalAlpha *= show;
    ctx.beginPath();
    ctx.arc(x, y, 34 * size, 0, 2 * Math.PI);
    ctx.fillStyle = color.panel;
    ctx.fill();
    ctx.strokeStyle = VERTICAL;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    const mini = camera({ cx: x, cy: y, scale: 13 * size, yaw: YAW, pitch: PITCH, focal: 30, center: c });
    drawPair(ctx, mini, turned(k * STEP), show); // halos keep the two molecules apart at this size
  }

  // the space glyph and its one marked point
  const glyph = seg(t, 63.5, 64.5);
  if (glyph > 0.003) {
    ctx.save();
    ctx.globalAlpha *= glyph;
    ctx.beginPath();
    ctx.ellipse(POINT[0], POINT[1], 64, 38, -0.15, 0, 2 * Math.PI);
    ctx.fillStyle = rgba(POSE, 0.08);
    ctx.fill();
    ctx.strokeStyle = POSE;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    SPACE.draw(ctx, POINT[0] + 74, POINT[1] - 34, { size: 22, alpha: glyph });
  }
  const mark = seg(t, COLLAPSE[1] - 0.2, COLLAPSE[1] + 0.4);
  if (mark > 0.003) {
    const pulse = lin(t, COLLAPSE[1], COLLAPSE[1] + 1.2);
    ctx.save();
    ctx.globalAlpha *= mark;
    ctx.fillStyle = POSE;
    ctx.beginPath();
    ctx.arc(POINT[0], POINT[1], 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = POSE;
    ctx.lineWidth = 2;
    ctx.globalAlpha *= 1 - pulse;
    ctx.beginPath();
    ctx.arc(POINT[0], POINT[1], 7 + 22 * pulse, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  text(ctx, 'turning both together: the same point', POINT[0], POINT[1] + 72, { ...type.note, color: POSE, align: 'center', alpha: seg(t, COLLAPSE[1], COLLAPSE[1] + 0.8) });
}

/** The right-hand column: formulas, chips, live readouts, captions and the closing notes. */
function drawNotes(ctx, t, { aA, aB, phi, hA, hB }, { XA, XB }) {
  const gaugeOut = 1 - seg(t, ASSOCIATED, ASSOCIATED + 0.8);
  const water = 1 - seg(t, ...SWITCH_OUT), peroxide = seg(t, ...SWITCH_IN); // whose view the readouts give
  DECOMP.draw(ctx, RIGHT, 258, { size: 26, alpha: seg(t, 2.5, 3.5) * gaugeOut });
  text(ctx, 'c: centroid · x̄: the atoms about it', RIGHT + 170, 264, { ...type.note, alpha: seg(t, 3, 4) * gaugeOut });

  // 8.5–23: the interaction energy of the drawn pair, live
  const energy = fade(t, 9, 9.8, 23, 23.8);
  UINT.drawOnBaseline(ctx, RIGHT, 600, { size: 24, alpha: energy });
  text(ctx, `${U_int(XA, XB).toFixed(2).replace('-', '−')} kcal/mol`, RIGHT + UINT.metrics(24).width + 10, 600, { font: font.mono, size: 19, color: INTER, alpha: energy });
  text(ctx, 'relative pose: unchanged', RIGHT, 634, { font: font.mono, size: 17, color: POSE, alpha: Math.min(energy, seg(t, DIAGONAL[0] + 0.3, DIAGONAL[0] + 1.1)) });

  // 18.5: the fibre and its dimension
  FIBRE.draw(ctx, RIGHT, 310, { size: 26, alpha: seg(t, 18.7, 19.7) });
  drawChips(ctx, t);

  // 24–37: references, then the common turn
  const step = { ...type.body, size: 20 };
  text(ctx, 'a reference per shape turns each torsor into SO(3)', RIGHT, 620, { ...step, color: VERTICAL, alpha: fade(t, 25, 26, 29.6, 30.2) });
  text(ctx, 'fix the common turn with water', RIGHT, 620, { ...step, color: VERTICAL, alpha: fade(t, 30.6, 31.4, 36.6, 37.2) });
  GAUGE_A.draw(ctx, RIGHT, 444, { size: 24, alpha: seg(t, 31, 32) * gaugeOut * water });
  GAUGE_B.draw(ctx, RIGHT, 444, { size: 24, alpha: gaugeOut * peroxide });

  // 37: the docking pose, read off live in the chosen gauge
  const live = seg(t, 37.5, 38.3) * gaugeOut;
  if (live > 0.003) {
    const RA = about(aA - hA * STEP), RB = about(aB - hB * STEP), r = rotation.apply(about(phi), R0);
    const rows = [
      [Q_AB, quatFromMatrix(rotation.multiply(rotation.transpose(RA), RB)), rotation.apply(rotation.transpose(RA), r), V_AB, water],
      [Q_BA, quatFromMatrix(rotation.multiply(rotation.transpose(RB), RA)), rotation.apply(rotation.transpose(RB), vec3.scale(r, -1)), V_BA, peroxide],
    ];
    for (const [qLabel, q, v, vLabel, w] of rows) {
      const a = live * w;
      if (a <= 0.003) continue;
      const mono = { font: font.mono, size: 17, color: POSE, alpha: a };
      qLabel.drawOnBaseline(ctx, RIGHT, 494, { size: 22, alpha: a });
      text(ctx, `as a quaternion: ${tuple(q)}`, RIGHT + qLabel.metrics(22).width + 10, 494, mono);
      vLabel.drawOnBaseline(ctx, RIGHT, 530, { size: 22, alpha: a });
      text(ctx, `= ${tuple(v)} Å · |r| = ${vec3.length(v).toFixed(2)} Å`, RIGHT + vLabel.metrics(22).width + 10, 530, mono);
    }
  }
  const pose = { ...step, color: POSE };
  text(ctx, 'peroxide as water sees it: a docking pose, one point of the fibre', RIGHT, 572, { ...pose, alpha: seg(t, 38.5, 39.3) * gaugeOut * water });
  text(ctx, 'water as peroxide sees it', RIGHT, 572, { ...pose, alpha: gaugeOut * peroxide });
  text(ctx, 'another reference changes the coordinates, not the pose', RIGHT, 620, { ...step, color: VERTICAL, alpha: fade(t, 45, 45.8) * gaugeOut });

  // 68.5: the associated bundle
  ASSOC.draw(ctx, RIGHT, 520, { size: 26, alpha: seg(t, 68.8, 69.8) });
  QUOTIENT.draw(ctx, RIGHT, 562, { size: 19, alpha: seg(t, 69.5, 70.5) });
  const note = { ...type.body, size: 20 };
  wrap(ctx, 'peroxide as water sees it, without writing water’s frame: the associated bundle, which is exactly the cluster’s shape space', RIGHT, 614, 640, 28, { ...note, color: POSE, alpha: seg(t, 71, 72) });
  NETWORK.draw(ctx, RIGHT, 694, { size: 21, alpha: seg(t, 74.5, 75.5) });
  text(ctx, 'is a function on this space', RIGHT, 730, { ...note, alpha: seg(t, 74.5, 75.5) });
  text(ctx, 'n molecules: n turns + (n − 1) arrows − 1 common turn: 6(n − 1)', RIGHT, 786, { ...note, color: color.muted, alpha: seg(t, 77.5, 78.5) });
}

/** '3 + 3 + 3 − 3 = 6': turns + turns + arrow − common turn. */
function drawChips(ctx, t) {
  const chips = [
    ['3', 'A’s turns', VERTICAL], ['+'], ['3', 'B’s turns', VERTICAL], ['+'], ['3', 'arrow', POSE], ['−'], ['3', 'common turn', VERTICAL], ['='], ['6', 'fibre', POSE],
  ];
  let x = RIGHT, k = 0;
  for (const [n, label, tint] of chips) {
    if (!label) {
      text(ctx, n, x + 14, 368, { font: font.display, size: 26, color: color.body, align: 'center', alpha: seg(t, 19.6 + 0.4 * k, 20.4 + 0.4 * k) });
      x += 28;
      continue;
    }
    const a = seg(t, 19.5 + 0.4 * k, 20.3 + 0.4 * k);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(tint, 0.16);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x + 30, 344, 44, 34, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    text(ctx, n, x + 52, 369, { font: font.mono, size: 21, weight: 500, color: tint, align: 'center', alpha: a });
    text(ctx, label, x + 52, 400, { ...type.note, color: tint, align: 'center', alpha: a });
    x += 104;
    k++;
  }
}
