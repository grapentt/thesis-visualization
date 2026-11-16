// Scene 04: position as a connection. Tokens live in different fibres of the trivial vector bundle
// ℝᵈ × {1, …, n} over the sequence; a positional encoding is the transport between fibres. RoPE makes
// it a block rotation R_m, and since rotations commute, R_mᵀ R_n = R_{n−m}: a constant connection
// form, which is why only relative position enters the score.

import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, line, dot, arrow, rgba, roundRect } from '../../../../src/kit.js';
import { QUERY, KEY, SYM, CONTEXT, POSITION, panel, pill, exampleStamp, header } from '../shared.js';
import { rotation2, matVec, ropeScore, ropeScoreAbsolute } from '../math.js';

const OMEGA = 0.5; // radians per position, one 2-block
const FREQS = [OMEGA, OMEGA / 4, OMEGA / 16]; // RoPE's geometric ladder, three blocks
const FIBRE_X = (p) => 130 + 100 * (p - 1); // fibre centre of position p = 1 … 8
const FIBRE_Y = 300;
const HALF = 42; // half side of a fibre square
const PX = 34; // pixels per unit inside a fibre
const BASE_Y = 420;
const TOKENS = [[0.6, 0.7], [0.95, 0.25], [-0.5, 0.75], [0.8, -0.5], [-0.85, -0.3], [0.3, 0.9], [-0.7, 0.6], [0.9, 0.4]];
const NEW_TOKEN = [0.4, -0.8]; // enters at position 1 when the sequence shifts
const QI = 1; // the query token starts at position 2
const KI = 5; // the key token starts at position 6
const Q = TOKENS[QI];
const K = TOKENS[KI];
const Q6 = [...Q, 0.7, -0.4, -0.5, 0.6]; // three blocks, for the plot
const K6 = [...K, 0.6, 0.5, 0.8, -0.2];
const SHIFT_AT = 41.5;
const R = 960; // the notes column
const PLOT = { x: 960, y: 560, w: 580, h: 300 };

const BUNDLE = tex(String.raw`E = \mathbb{R}^d \times \{1, \dots, n\} \;\longrightarrow\; \{1, \dots, n\}`, 'E = ℝᵈ × {1, …, n} → {1, …, n}');
const ROPE = tex(
  String.raw`q_m = R_m\, q,\qquad k_n = R_n\, k,\qquad R_m = \begin{pmatrix} \cos m\omega & -\sin m\omega \\ \sin m\omega & \cos m\omega \end{pmatrix}`,
  'q_m = R_m q,  k_n = R_n k,  R_m = rotation by mω',
);
const LONG = tex(String.raw`s_{mn} = \langle R_m q,\; R_n k \rangle`, 's_mn = ⟨R_m q, R_n k⟩');
const COMMUTE = tex(String.raw`R_m^{\top} R_n = R_{n-m}`, 'R_mᵀ R_n = R_{n−m}');
const SHORT = tex(String.raw`s_{mn} = q^{\top} R_m^{\top} R_n\, k = q^{\top} R_{n-m}\, k`, 's_mn = qᵀ R_mᵀ R_n k = qᵀ R_{n−m} k');
const INVARIANT = tex(String.raw`s_{m+1,\,n+1} = s_{mn}`, 's_{m+1,n+1} = s_mn');
const TWIST = tex(String.raw`M_{mn} = R_m^{\top} M\, R_n`, 'M_mn = R_mᵀ M R_n');

export default defineScene({
  name: 'Position as a connection',
  duration: 66,
  narration: [
    [0, 'Tokens do not share one vector space. Each position of the sequence carries its own copy of R to the d: a fibre of a trivial vector bundle over the sequence. A score pairs a query in one fibre with a key in another, so something has to carry one of them across. That is what a positional encoding supplies: a connection.'],
    [15, 'Rotary embeddings make the connection explicit. The token at position m is rotated by m times omega, a block rotation. The score is then the plain dot product of the two rotated vectors.'],
    [27, 'Read it as parallel transport. Carry the query from fibre m to fibre n, rotating by the difference of the positions, and pair it with the key there. Rotation blocks commute, so R m transposed R n equals R of n minus m. The long way and the short way give the same number.'],
    [41, 'Now shift both tokens by one position. The transported query arrives in the same orientation, and the score does not move. The connection form is constant along the sequence, and that is exactly why only relative position enters the pairing.'],
    [52, 'So the form M is twisted by transport: between positions m and n it reads R m transposed, M, R n. Against the offset, one block gives a cosine. RoPE stacks blocks on a geometric ladder of frequencies, and their sum oscillates and loses coherence with distance.'],
  ],
  header: header(4, 'POSITION AS A CONNECTION', "Transporting a query into a key's fibre"),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    const shiftU = seg(t, SHIFT_AT, SHIFT_AT + 1);
    const m = shiftU > 0.5 ? 3 : 2;
    const n = m + 4;
    drawBase(ctx, t, intro);
    drawTokens(ctx, t, shiftU, m, n);
    drawTransport(ctx, t, { t0: 28, t1: 33, until: 40.5, m: 2, n: 6 });
    drawTransport(ctx, t, { t0: 44, t1: 48.5, until: 64, m: 3, n: 7 });
    drawReadouts(ctx, t, m, n);
    drawNotes(ctx, t);
    drawPlot(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), 'd = 2 · ω = 0.5 rad per position · everything on screen is computed');
  },
});

/** The base line with its eight positions, and a fibre square above each. */
function drawBase(ctx, t, intro) {
  if (intro <= 0.003) return;
  line(ctx, 90, BASE_Y, 880, BASE_Y, { color: POSITION, width: 2, alpha: intro });
  text(ctx, 'the sequence: positions 1 … 8, the base', FIBRE_X(4.5), BASE_Y + 58, { ...type.note, color: POSITION, align: 'center', alpha: intro });
  for (let p = 1; p <= 8; p++) {
    const a = intro * seg(t, 0.6 + 0.12 * p, 1.4 + 0.12 * p);
    const cx = FIBRE_X(p);
    dot(ctx, cx, BASE_Y, 5, POSITION, intro);
    text(ctx, String(p), cx, BASE_Y + 30, { font: font.mono, size: 15, color: POSITION, align: 'center', alpha: intro });
    if (a <= 0.003) continue;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(POSITION, 0.06);
    roundRect(ctx, cx - HALF, FIBRE_Y - HALF, 2 * HALF, 2 * HALF, 8);
    ctx.fill();
    ctx.strokeStyle = rgba(POSITION, 0.55);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    line(ctx, cx - HALF + 6, FIBRE_Y, cx + HALF - 6, FIBRE_Y, { color: color.grid, width: 1, alpha: a });
    line(ctx, cx, FIBRE_Y - HALF + 6, cx, FIBRE_Y + HALF - 6, { color: color.grid, width: 1, alpha: a });
    line(ctx, cx, FIBRE_Y + HALF, cx, BASE_Y - 7, { color: color.line, width: 1, dash: [3, 4], alpha: a });
  }
  text(ctx, 'fibre ℝ²', FIBRE_X(1), FIBRE_Y - HALF - 14, { ...type.note, color: POSITION, align: 'center', alpha: fade(t, 1.6, 2.4, 12, 13) });
}

/** An arrow from the centre of a fibre at (cx, cy), in fibre units. */
function fibreArrow(ctx, cx, cy, v, { colour, alpha, width = 3, head = 10 }) {
  arrow(ctx, cx, cy, cx + v[0] * PX, cy - v[1] * PX, { color: colour, width, head, alpha });
}

/** Arc from world angle a0 to a1 (counter-clockwise positive) around (cx, cy). */
function arcBetween(ctx, cx, cy, r, a0, a1, colour, alpha) {
  if (alpha <= 0.003 || Math.abs(a1 - a0) < 0.02) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -a0, -a1, a1 > a0);
  ctx.stroke();
  ctx.restore();
}

/** The tokens in their fibres, RoPE's rotated copies (16–27 s), and the shift of the whole sequence. */
function drawTokens(ctx, t, shiftU, m, n) {
  const ropeOn = fade(t, 16, 17, 26, 27);
  const turn = seg(t, 16, 19);
  const draw = (v, pos, j, alpha, role) => {
    const cx = FIBRE_X(pos);
    const colour = role === 'q' ? QUERY : role === 'k' ? KEY : color.muted;
    if (alpha <= 0.003) return;
    if (role) {
      ctx.save();
      ctx.globalAlpha *= 0.18 * alpha;
      ctx.fillStyle = colour;
      roundRect(ctx, cx - HALF + 2, FIBRE_Y - HALF + 2, 2 * HALF - 4, 2 * HALF - 4, 7);
      ctx.fill();
      ctx.restore();
    }
    fibreArrow(ctx, cx, FIBRE_Y, v, { colour, alpha: alpha * (1 - 0.65 * ropeOn), width: role ? 3 : 2.2 });
    if (ropeOn > 0.003 && j !== null) {
      const angle = (j + 1) * OMEGA * turn;
      const w = matVec(rotation2(angle), v);
      fibreArrow(ctx, cx, FIBRE_Y, w, { colour, alpha: alpha * ropeOn, width: role ? 3 : 2.2 });
      arcBetween(ctx, cx, FIBRE_Y, 13, Math.atan2(v[1], v[0]), Math.atan2(v[1], v[0]) + angle, colour, alpha * ropeOn * 0.8);
    }
    if (role) {
      const label = role === 'q' ? `q · m = ${m}` : `k · n = ${n}`;
      text(ctx, label, cx, FIBRE_Y - HALF - 14, { font: font.mono, size: 15, color: colour, align: 'center', alpha });
    }
  };
  TOKENS.forEach((v, j) => {
    const on = seg(t, 1.4 + 0.12 * j, 2.2 + 0.12 * j);
    const pos = j + 1 + shiftU;
    const exit = j === 7 ? 1 - shiftU : 1;
    draw(v, pos, j, on * exit, j === QI ? 'q' : j === KI ? 'k' : null);
  });
  if (shiftU > 0.003) draw(NEW_TOKEN, shiftU, null, shiftU, null);
  // the RoPE caption
  text(ctx, 'RoPE: every token turned by its own position, mω', 485, FIBRE_Y + HALF + 24, { ...type.note, color: color.body, align: 'center', alpha: ropeOn * fade(t, 17, 18) });
}

/** A copy of the query travels from fibre m to fibre n, rotating by (m − n)ω on the way, and is paired with the key there. */
function drawTransport(ctx, t, { t0, t1, until, m, n }) {
  const on = fade(t, t0, t0 + 0.4, until, until + 1);
  if (on <= 0.003) return;
  const u = seg(t, t0, t1);
  const cx = lerp(FIBRE_X(m), FIBRE_X(n), u);
  const cy = FIBRE_Y - 64 * Math.sin(Math.PI * u);
  const v = matVec(rotation2((m - n) * OMEGA * u), Q);
  // the path flown so far
  ctx.save();
  ctx.globalAlpha *= 0.5 * on;
  ctx.strokeStyle = QUERY;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const s = (u * i) / 40;
    const x = lerp(FIBRE_X(m), FIBRE_X(n), s);
    const y = FIBRE_Y - 64 * Math.sin(Math.PI * s);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  fibreArrow(ctx, cx, cy, v, { colour: QUERY, alpha: on, width: 3 });
  if (u < 1) {
    text(ctx, `rotating by (m − n)ω = ${fmt((m - n) * OMEGA * u, 2)}`, cx, cy - HALF - 28, { font: font.mono, size: 14, color: QUERY, align: 'center', alpha: on * fade(t, t0 + 0.5, t0 + 1) });
  } else {
    // paired with the key in fibre n: the angle between them is what the dot product measures
    const paired = on * seg(t, t1, t1 + 0.6);
    arcBetween(ctx, cx, FIBRE_Y, 20, Math.atan2(v[1], v[0]), Math.atan2(K[1], K[0]), CONTEXT, paired);
    text(ctx, 'paired in fibre n', cx, FIBRE_Y + HALF + 24, { font: font.mono, size: 14, color: CONTEXT, align: 'center', alpha: paired });
  }
}

/** The two computations of the score, and the invariance under a shift. */
function drawReadouts(ctx, t, m, n) {
  const x = 100;
  text(ctx, 'ω = 0.5 rad per position; with d = 2 there is one rotation block', x, 512, { ...type.note, color: color.body, alpha: fade(t, 16, 17) });
  const longOn = seg(t, 21, 22);
  if (longOn > 0.003) {
    pill(ctx, 'THE LONG WAY', x, 540, POSITION, longOn);
    text(ctx, `⟨R_m q, R_n k⟩ = ${fmt(ropeScoreAbsolute(Q, K, m, n, [OMEGA]), 4)}`, x, 585, { font: font.mono, size: 21, color: color.ink, alpha: longOn });
    text(ctx, 'rotate each token by its own position, then take the plain dot product', x, 612, { ...type.note, alpha: longOn });
  }
  const shortOn = seg(t, 34, 35);
  if (shortOn > 0.003) {
    pill(ctx, 'THE SHORT WAY', x, 655, QUERY, shortOn);
    text(ctx, `qᵀ R_{n−m} k = ${fmt(ropeScore(Q, K, m, n, [OMEGA]), 4)}`, x, 700, { font: font.mono, size: 21, color: color.ink, alpha: shortOn });
    text(ctx, 'carry the query from m to n, a rotation by (m − n)ω, then pair it with the key in fibre n', x, 727, { ...type.note, alpha: shortOn });
  }
  const same = seg(t, 49.5, 50.5);
  if (same > 0.003) {
    text(ctx, `after the shift, m = 3 and n = 7:  ${fmt(ropeScoreAbsolute(Q, K, 3, 7, [OMEGA]), 4)}  — unchanged`, x, 775, { font: font.mono, size: 19, color: SYM, alpha: same });
    text(ctx, 'only the offset n − m = 4 enters', x, 802, { ...type.note, color: SYM, alpha: same });
  }
}

function drawNotes(ctx, t) {
  const bundle = fade(t, 1, 2, 14.5, 15.5);
  BUNDLE.draw(ctx, R, 212, { size: 24, alpha: bundle });
  wrap(ctx, 'one copy of ℝᵈ above every position; a query at m and a key at n live in different copies, so their dot product is not yet defined', R, 252, 580, 22, { ...type.note, alpha: bundle });
  text(ctx, 'to pair them, carry one across: that is a connection', R, 320, { ...type.note, color: CONTEXT, alpha: fade(t, 8, 9, 14.5, 15.5) });

  const rope = seg(t, 15, 16);
  ROPE.draw(ctx, R, 222, { size: 21, alpha: rope });
  text(ctx, 'the token at position m is rotated by mω; for d = 2 that is one block', R, 270, { ...type.note, alpha: rope });
  LONG.draw(ctx, R, 322, { size: 26, alpha: seg(t, 20, 21) });

  const transport = seg(t, 27, 28);
  COMMUTE.draw(ctx, R, 382, { size: 26, alpha: transport });
  text(ctx, 'rotation blocks commute', R + 230, 388, { ...type.note, alpha: transport });
  SHORT.draw(ctx, R, 432, { size: 24, alpha: seg(t, 33, 34) });

  const inv = fade(t, 41, 42, 52, 53);
  INVARIANT.draw(ctx, R, 486, { size: 24, alpha: inv });
  text(ctx, 'a constant connection form: invariant under shifts of the sequence', R, 524, { ...type.note, color: SYM, alpha: inv });

  const twist = seg(t, 52.5, 53.5);
  TWIST.draw(ctx, R, 486, { size: 26, alpha: twist });
  text(ctx, 'the same M at every position, seen through the transport', R, 524, { ...type.note, alpha: twist });
}

/** The score against the offset Δ = n − m: one block, then three blocks on a geometric ladder. */
function drawPlot(ctx, t) {
  const on = seg(t, 53, 54);
  if (on <= 0.003) return;
  const { x, y, w, h } = PLOT;
  panel(ctx, x, y, w, h, { alpha: on });
  const x0 = x + 50;
  const x1 = x + w - 30;
  const yTop = y + 50;
  const yBot = y + h - 40;
  const X = (d) => x0 + ((d + 60) / 120) * (x1 - x0);
  const Y = (s) => yBot - ((s + 2.4) / 4.8) * (yBot - yTop);
  ctx.save();
  ctx.globalAlpha *= on;
  line(ctx, x0, Y(0), x1, Y(0), { color: color.line, width: 1.2 });
  line(ctx, x0, yTop, x0, yBot, { color: color.line, width: 1.2 });
  for (const d of [-60, -40, -20, 0, 20, 40, 60]) {
    line(ctx, X(d), Y(0) - 4, X(d), Y(0) + 4, { color: color.line });
    text(ctx, fmt(d, 0), X(d), yBot + 20, { font: font.mono, size: 13, color: color.muted, align: 'center' });
  }
  for (const s of [-2, 0, 2]) text(ctx, fmt(s, 0), x0 - 10, Y(s) + 5, { font: font.mono, size: 13, color: color.muted, align: 'right' });
  text(ctx, 'score against the offset Δ = n − m', x + 20, y + 28, { ...type.note, color: color.body });
  text(ctx, 'Δ', x1 + 8, yBot + 20, { font: font.display, italic: true, size: 18, color: color.muted });

  const curve = (score, progress, colour, width) => {
    if (progress <= 0.003) return;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    const steps = 480;
    const last = Math.round(steps * progress);
    for (let i = 0; i <= last; i++) {
      const d = -60 + (120 * i) / steps;
      const px = X(d);
      const py = Y(score(d));
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  };
  const one = (d) => ropeScore(Q, K, 0, d, [OMEGA]);
  const three = (d) => ropeScore(Q6, K6, 0, d, FREQS);
  const threeOn = seg(t, 58, 59);
  ctx.globalAlpha *= 1;
  curve(one, lin(t, 53.5, 57.5), rgba(POSITION, 1 - 0.6 * threeOn), 2.5);
  curve(three, lin(t, 58, 63), CONTEXT, 2.5);
  // our pair: Δ = 4, the value of the readouts
  const mark = seg(t, 55, 56);
  line(ctx, X(4), yTop, X(4), yBot, { color: QUERY, width: 1, dash: [3, 4], alpha: mark });
  dot(ctx, X(4), Y(one(4)), 5, QUERY, mark);
  text(ctx, 'Δ = 4: the pair above', X(4) + 8, yTop + 14, { font: font.mono, size: 13, color: QUERY, alpha: mark });
  // legend
  text(ctx, 'one block, ω: a cosine', x + w - 20, y + 28, { ...type.note, color: POSITION, align: 'right', alpha: seg(t, 54, 55) });
  text(ctx, 'three blocks, ω, ω/4, ω/16: oscillates, loses coherence', x + w - 20, y + 50, { ...type.note, color: CONTEXT, align: 'right', alpha: threeOn });
  ctx.restore();
}

const fmt = (v, digits = 2) => {
  const s = Math.abs(v).toFixed(digits);
  return (Number(s) === 0 ? '' : v < 0 ? '−' : '') + s;
};
