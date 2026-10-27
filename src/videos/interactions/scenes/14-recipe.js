import { defineScene, seg, fade, lin, lerp, lerpLog, text, wrap, type, font, color, tex, camera, line, arrow, dot, roundRect, rgba } from '../../../kit.js';
import {
  POSE, SCORE_W, SCORE_P, INTER, RESTRAINT, WATER_MOL, DIMER_MOL, PAIR_MOL, TRIMER_MOL,
  drawMol, drawHalo, drawHBond, drawPadlock, ideaTag, toyStamp, view2d,
} from '../shared.js';
import { centroid } from '../toy.js';
import { setFont } from '../../../draw/text.js';
import { DOCKED, DIMER_MIN, TRIMER, springData } from '../data.js';

// beats (scene-local seconds)
const FREEZE = 7.2; // padlocks close on "and freeze it"
const LOSS = 16; // after "denoising score matching"
const SDE = 32;
const RUN = [33, 41]; // σ 4 → 0.01
const DROP = 44; // monomer-only run
const REUSE = 48.5;
const PARTNERS = [52, 53, 54.3]; // "another water, a peroxide, a cluster"
const EXACT = 62;
const BREAKS = 68;

const LEFT = 80;
const RIGHT = 880;

// ---- the training loss, from coloured parts ---------------------------------------------------

const LOSS_PARTS = [
  { part: tex(String.raw`\mathbb E\,\big\|\,`, 'E ‖') },
  { part: tex('s_W', 's_W'), colour: SCORE_W, label: 'frozen' },
  { part: tex(String.raw`\oplus`, '⊕') },
  { part: tex('s_P', 's_P'), colour: SCORE_P, label: 'frozen' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla\log\rho_t`, '∇log ρₜ'), colour: RESTRAINT, label: 'analytic' },
  { part: tex('+', '+') },
  { part: tex(String.raw`\nabla_z\varphi(z_t,t)`, '∇_z φ(zₜ, t)'), colour: INTER, label: 'learned' },
  { part: tex('-', '−') },
  { part: tex(String.raw`\nabla_{z_t}\log q_t(z_t\mid z_0)`, '∇ log qₜ(zₜ | z₀)'), colour: color.ink, label: 'target' },
  { part: tex(String.raw`\big\|^2`, '‖²') },
];
const LABEL_TIMES = { target: 16.5, frozen: 17.4, analytic: 19.2, learned: 21 }; // as each is said

// ---- the spring toy's reverse SDE (springData.sde, seed 141) --------------------------------------

const { sde } = springData;
const FRAMES = sde.decomposed;
const MONO_SCALE = 12; // px per unit for the monomer-only run's last frame (its pairs spread over ±5.5)
const centres = (Z) => [0, 5].map((from) => {
  const rows = Z.slice(from, from === 0 ? 5 : 9);
  return [0, 1].map((c) => rows.reduce((s, p) => s + p[c], 0) / rows.length);
});
const CENTRES = FRAMES.map((f) => f.Z.map(centres));
const APART = sde.monomers.at(-1).Z.map(centres);
const TOP = { cx: 1200, cy: 330 };

const HIST = { x0: RIGHT, x1: 1520, base: 640, range: 12, pxPerDensity: 280 };
const histX = (v) => HIST.x0 + ((v + HIST.range) / (2 * HIST.range)) * (HIST.x1 - HIST.x0);
const histY = (p) => HIST.base - p * HIST.pxPerDensity;
function histogram(values, width) {
  const n = Math.round((2 * HIST.range) / width);
  const counts = new Array(n).fill(0);
  for (const v of values) counts[Math.min(n - 1, Math.max(0, Math.floor((v + HIST.range) / width)))]++;
  return counts.map((c, k) => ({ lo: -HIST.range + k * width, hi: -HIST.range + (k + 1) * width, p: c / (values.length * width) }));
}
const BARS = histogram(sde.relX.decomposed, 0.4).filter((b) => b.p > 0);
const OUTLINE = histogram(sde.relX.monomers, 1.2);
const gauss = (x, s) => Math.exp(-(x * x) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

// ---- the reuse board: three clusters drawn sideways (water A on the left) ---------------------------

const sideways = (X) => Array.from(X, (_, i) => (i % 3 === 0 ? -X[i + 1] : i % 3 === 1 ? X[i - 1] : X[i]));
const pointOf = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const W_LABEL = 's_W (one frozen model)', P_LABEL = 's_P (frozen)';
const PANELS = [
  {
    X: sideways(DIMER_MIN.X), mol: DIMER_MOL, cx: 255, cy: 342, title: 'water + another water', phi: 'new φ: water–water', at: PARTNERS[0],
    labels: [[[0, 3], W_LABEL, SCORE_W, 'below'], [[3, 6], W_LABEL, SCORE_W, 'above']],
    hbonds: [[DIMER_MIN.hbond.h, DIMER_MIN.hbond.o]],
  },
  {
    X: sideways(DOCKED.X), mol: PAIR_MOL, cx: 625, cy: 342, title: 'water + a peroxide', phi: 'new φ: water–peroxide', at: PARTNERS[1],
    labels: [[[0, 3], W_LABEL, SCORE_W, 'below'], [[3, 7], P_LABEL, SCORE_P, 'above']],
    hbonds: [[DOCKED.hbond.h, DOCKED.hbond.o]],
  },
  {
    X: sideways(TRIMER.X), mol: TRIMER_MOL, cx: 450, cy: 636, title: 'a cluster: water + peroxide + water', phi: 'the same pair terms; their sum is exact only at small noise (M4)', at: PARTNERS[2],
    labels: [[[0, 3], W_LABEL, SCORE_W, 'left'], [[3, 7], P_LABEL, SCORE_P, 'above'], [[7, 10], W_LABEL, SCORE_W, 'right']],
    hbonds: [[TRIMER.hbonds.AB.h, TRIMER.hbonds.AB.o], [TRIMER.hbonds.CB.h, TRIMER.hbonds.CB.o]],
  },
].map((p) => {
  const cam = camera({ cx: p.cx, cy: p.cy, scale: 32, yaw: 0.3, pitch: 0.25, focal: 40, center: centroid(p.X, p.mol.count) });
  return { ...p, cam };
});

const REUSES = [
  ['monomer models, frozen, any partner (R5, I1)', 50],
  ['one model per species, shared by identical molecules (M3)', 52.5],
  ['small-noise interaction terms as a pairwise force field, if the physics is pairwise (M4)', 57.5],
];
const BREAKS_IF = [
  ['different noise or unmatched centring (R3, I7)', BREAKS],
  ['monomer and pair data from different environments (I7)', BREAKS + 0.9],
  ['pair data not generated under the reference’s restraint (I6)', BREAKS + 1.8],
  ['dimer terms reused at finite noise in clusters (M4)', BREAKS + 2.7],
];

export default defineScene({
  name: 'Recipe',
  duration: 76,
  narration: [
    [0, 'So the recipe. One: train a monomer model per species on plentiful data of that molecule alone, and freeze it.'],
    [9.5, 'Two: on the scarce pair data, generated under the same spring, run denoising score matching with the frozen scores and the analytic spring added, and train only phi.'],
    [22.5, 'If the monomer models are exact, its optimum is the true interaction term; if not, it quietly absorbs their errors.'],
    [32, 'Sampling is the usual reverse process, in atom coordinates. In the spring model, the decomposed sampler reproduces the pair, up to step size and sampling error.'],
    [44, 'Drop the interaction, and nothing holds the molecules together.'],
    [48.5, 'And one frozen water model serves every partner: another water, a peroxide, a cluster. Each pair of species needs its own interaction term; the monomer model is shared.'],
    [61.5, 'That reuse is exact because every model sees the same noise on every atom. It breaks if the environments differ, or the noise, or the centring.'],
  ],
  header: { eyebrow: '14 · RECIPE', title: 'Freeze the parts, learn the binding' },

  draw(ctx, t) {
    const recipe = fade(t, 0.5, 1.3, REUSE, REUSE + 0.8) * (1 - 0.4 * seg(t, SDE, SDE + 0.8));
    drawPipeline(ctx, t, recipe);
    drawLoss(ctx, t, recipe);
    wrap(
      ctx,
      'optimum: ∇log Wₜ if the monomer scores are exact; otherwise it also absorbs their errors on the data’s support: fine for sampling, misleading to interpret (I7)',
      LEFT, 730, 720, 28, { ...type.body, size: 20, alpha: recipe * seg(t, 23.5, 24.3) },
    );
    drawSampler(ctx, t, fade(t, SDE + 0.3, SDE + 1.1, REUSE - 0.6, REUSE));
    drawReuse(ctx, t);
    drawBoard(ctx, t);
    text(
      ctx,
      'reverse SDE in atom coordinates → at t → 0 the full score (monomers + interaction) is a force field for overdamped Langevin, Boltzmann data only (I7)',
      LEFT, 860, { ...type.note, color: color.body, alpha: seg(t, SDE + 1, SDE + 1.8) },
    );
    toyStamp(ctx, seg(t, REUSE + 0.5, REUSE + 1.3));
  },
});

// ---- 1 · 2 · 3: the pipeline ------------------------------------------------------------------

function box(ctx, y, border, alpha, width = 1.8) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.panel;
  roundRect(ctx, 60, y, 760, 100, 12);
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

/** A stack of n thin data bars, top-left (x, y); split: each bar half rose, half lime (pair data). */
function dataStack(ctx, x, y, n, tint, { split = false, grow = 1, alpha = 1, w = 54 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const shown = Math.round(n * grow);
  for (let k = 0; k < shown; k++) {
    const yy = y + k * 1.9;
    ctx.fillStyle = split ? SCORE_W : tint;
    ctx.fillRect(x, yy, split ? w / 2 : w, 1.2);
    if (split) {
      ctx.fillStyle = SCORE_P;
      ctx.fillRect(x + w / 2, yy, w / 2, 1.2);
    }
  }
  ctx.restore();
}

function drawPipeline(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const title = { font: font.sans, size: 21, weight: 500, color: color.ink };

  // 1 · monomer models
  const a1 = alpha * seg(t, 0.5, 1.3);
  box(ctx, 240, color.line, a1);
  text(ctx, '1 · monomer models', LEFT, 282, { ...title, alpha: a1 });
  text(ctx, 'one per species', LEFT, 310, { ...type.note, alpha: a1 });
  const close = seg(t, FREEZE, FREEZE + 0.5);
  [['water model', SCORE_W, 336], ['peroxide model', SCORE_P, 580]].forEach(([name, tint, x], k) => {
    const a = alpha * seg(t, 1 + 0.4 * k, 1.8 + 0.4 * k);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    roundRect(ctx, x, 250, 228, 80, 9);
    ctx.stroke();
    ctx.restore();
    drawPadlock(ctx, x + 24, 285, 26, { closed: false, tint, alpha: a * (1 - close) });
    drawPadlock(ctx, x + 24, 285, 26, { closed: true, tint, alpha: a * close });
    text(ctx, name, x + 46, 284, { font: font.sans, size: 17, weight: 500, color: tint, alpha: a });
    text(ctx, 'plentiful data', x + 46, 310, { ...type.note, alpha: a * (1 - seg(t, FREEZE - 0.1, FREEZE + 0.2)) });
    text(ctx, 'frozen', x + 46, 310, { ...type.note, alpha: a * seg(t, FREEZE + 0.25, FREEZE + 0.55) });
    dataStack(ctx, x + 188, 253, 40, tint, { w: 32, grow: seg(t, 1.5 + 0.4 * k, 4.5 + 0.4 * k), alpha: a });
  });

  // 2 · train φ only
  const a2 = alpha * seg(t, 9.5, 10.3);
  arrow(ctx, 200, 342, 200, 358, { color: color.muted, width: 2, head: 8, alpha: a2 });
  box(ctx, 360, INTER, a2, 2.2);
  text(ctx, '2 · train φ only', LEFT, 402, { ...title, alpha: a2 });
  text(ctx, 'pair data under the same spring (I6)', LEFT, 430, { ...type.note, color: color.body, alpha: alpha * seg(t, 12, 12.8) });
  dataStack(ctx, 742, 400, 4, INTER, { split: true, grow: seg(t, 10.5, 11.5), alpha: alpha * seg(t, 10.5, 10.8) });
  text(ctx, 'scarce', 742, 438, { ...type.note, alpha: alpha * seg(t, 11, 11.8) });

  // 3 · dimers → trimers
  const a3 = alpha * seg(t, 29, 29.8);
  arrow(ctx, 200, 462, 200, 478, { color: color.muted, width: 2, head: 8, alpha: a3 });
  box(ctx, 480, color.dim, a3);
  // the curriculum is an idea; the small-noise statement is proven (M4), so it carries no pill
  const head = '3 · curriculum: dimers → trimers';
  text(ctx, head, LEFT, 522, { ...title, color: color.muted, alpha: a3 });
  setFont(ctx, title);
  ideaTag(ctx, LEFT + ctx.measureText(head).width + 18, 515, a3);
  text(ctx, 'reuse exact only at small noise (M4)', LEFT, 550, { ...type.note, alpha: a3 });
}

/** The denoising score-matching loss, each term underlined in its colour and labelled. */
function drawLoss(ctx, t, alpha) {
  const a = alpha * seg(t, LOSS, LOSS + 0.8);
  if (a <= 0.003) return;
  const size = 24, y = 640, gap = 0.28 * size;
  const labelWidth = (s) => {
    ctx.save();
    ctx.font = `400 15px ${font.mono}`;
    const w = ctx.measureText(s).width;
    ctx.restore();
    return w;
  };
  // lay out first: a label that needs room pushes its term right, and the operator before it moves half as far
  const xs = [];
  let x = LEFT, lastLabelEnd = -Infinity;
  LOSS_PARTS.forEach(({ part, label }, i) => {
    const m = part.metrics(size);
    if (label) {
      const push = Math.max(0, lastLabelEnd + 18 + labelWidth(label) / 2 - m.width / 2 - x);
      if (i > 0 && !LOSS_PARTS[i - 1].label) xs[i - 1] += push / 2;
      x += push;
      lastLabelEnd = x + m.width / 2 + labelWidth(label) / 2;
    }
    xs.push(x);
    x += m.width + gap;
  });
  LOSS_PARTS.forEach(({ part, colour, label }, i) => {
    const m = part.metrics(size), x = xs[i];
    part.drawOnBaseline(ctx, x, y, { size, alpha: a });
    if (label) {
      const under = y + m.depth + 7;
      const l = a * seg(t, LABEL_TIMES[label], LABEL_TIMES[label] + 0.6);
      ctx.save();
      ctx.globalAlpha *= l;
      ctx.fillStyle = colour;
      ctx.fillRect(x, under, m.width, 4);
      ctx.restore();
      text(ctx, label, x + m.width / 2, under + 22, { ...type.note, color: colour === color.ink ? color.body : colour, align: 'center', alpha: l });
    }
  });
}

// ---- 32–48.5: the decomposed sampler on the spring molecules -----------------------------------------

function drawSampler(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const f = lin(t, ...RUN) * (FRAMES.length - 1);
  const k = Math.min(FRAMES.length - 2, Math.floor(f)), w = f - k;
  const sigma = FRAMES[k].sigma * (FRAMES[k + 1].sigma / FRAMES[k].sigma) ** w;
  // from DROP the view zooms out (the decomposed pairs shrink to a tight knot), then the monomer-only
  // run's last frame replaces them at the same zoom: nothing holds those pairs together
  const zoom = seg(t, DROP, DROP + 1), apart = seg(t, DROP + 0.9, DROP + 1.7);
  const view = view2d({ ...TOP, scale: lerpLog(55 / (1 + sigma), MONO_SCALE, zoom) });

  const heading = { font: font.sans, size: 19, weight: 500, color: color.ink };
  text(ctx, 'spring molecules: the decomposed sampler, 30 of 300 runs', RIGHT, 214, { ...heading, alpha: alpha * (1 - apart) });
  text(ctx, 'spring molecules: monomers only, 30 of 300 runs', RIGHT, 214, { ...heading, color: SCORE_W, alpha: alpha * apart });
  text(ctx, `σ = ${sigma < 0.1 ? sigma.toFixed(3) : sigma.toFixed(2)}`, 1520, 214, { font: font.mono, size: 18, color: color.ink, align: 'right', alpha });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(RIGHT, 232, 640, 196);
  ctx.restore();

  const pairs = (list, a) => list.forEach((pair) => {
    const [p, q] = pair.map((c) => view.project(c));
    line(ctx, p.x, p.y, q.x, q.y, { color: color.muted, width: 1, alpha: 0.5 * a });
    dot(ctx, p.x, p.y, 4.5, SCORE_W, a);
    dot(ctx, q.x, q.y, 4.5, SCORE_P, a);
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(RIGHT, 232, 640, 166);
  ctx.clip();
  pairs(CENTRES[k].map((pair, s) => pair.map((c, m) => c.map((v, j) => lerp(v, CENTRES[k + 1][s][m][j], w)))), alpha * (1 - apart));
  pairs(APART, alpha * apart);
  ctx.restore();
  // scale bar: one length unit at the current zoom
  line(ctx, RIGHT + 20, 412, RIGHT + 20 + view.scale, 412, { color: color.ink, width: 2, alpha });
  text(ctx, '1 unit (view zooms with σ)', RIGHT + 28 + view.scale, 417, { ...type.note, alpha: alpha * (1 - zoom) });
  text(ctx, '1 unit (zoomed out)', RIGHT + 28 + view.scale, 417, { ...type.note, alpha: alpha * zoom });
  dot(ctx, 1296, 412, 4.5, SCORE_W, alpha);
  text(ctx, 'A’s centre', 1306, 417, { ...type.note, alpha });
  dot(ctx, 1410, 412, 4.5, SCORE_P, alpha);
  text(ctx, 'B’s centre', 1420, 417, { ...type.note, alpha });
  text(ctx, 'A, B: toy spring molecules (rose/lime = monomer A/B, not water/peroxide)', RIGHT, 452, { ...type.note, alpha });

  // histogram of c_A − c_B (x) over all 300 runs
  const h = alpha * seg(t, RUN[1] - 0.6, RUN[1] + 0.2);
  line(ctx, HIST.x0, HIST.base, HIST.x1, HIST.base, { color: color.line, width: 1.5, alpha: h });
  for (const v of [-10, -5, 0, 5, 10]) {
    line(ctx, histX(v), HIST.base, histX(v), HIST.base + 6, { color: color.line, width: 1.5, alpha: h });
    text(ctx, String(v).replace('-', '−'), histX(v), HIST.base + 24, { ...type.note, align: 'center', alpha: h });
  }
  text(ctx, 'x of c_A − c_B (relative centroid)', HIST.x1, HIST.base + 48, { ...type.note, align: 'right', alpha: h });

  const drop = alpha * seg(t, DROP, DROP + 0.8);
  ctx.save();
  ctx.globalAlpha *= drop;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(histX(-HIST.range), HIST.base);
  for (const b of OUTLINE) {
    ctx.lineTo(histX(b.lo), histY(b.p));
    ctx.lineTo(histX(b.hi), histY(b.p));
  }
  ctx.lineTo(histX(HIST.range), HIST.base);
  ctx.strokeStyle = SCORE_W;
  ctx.stroke();
  ctx.setLineDash([9, 9]);
  ctx.strokeStyle = SCORE_P;
  ctx.stroke();
  ctx.restore();

  const grow = seg(t, RUN[1], RUN[1] + 1.2);
  ctx.save();
  ctx.globalAlpha *= h;
  ctx.fillStyle = rgba(INTER, 0.85);
  for (const b of BARS) ctx.fillRect(histX(b.lo) + 0.5, histY(b.p * grow), histX(b.hi) - histX(b.lo) - 1, b.p * grow * HIST.pxPerDensity);
  ctx.restore();

  const exact = alpha * seg(t, RUN[1] + 1, RUN[1] + 1.8);
  ctx.save();
  ctx.globalAlpha *= exact;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 240; i++) {
    const v = -4 + (8 * i) / 240;
    const p = [histX(v), histY(gauss(v, sde.sd.target))];
    i ? ctx.lineTo(...p) : ctx.moveTo(...p);
  }
  ctx.stroke();
  ctx.restore();

  const legend = (y, label, tint, a) => text(ctx, label, RIGHT, y, { font: font.mono, size: 16, color: tint, alpha: a });
  legend(484, `decomposed sampler  sd ${sde.sd.decomposed.toFixed(3)}`, INTER, h * seg(t, RUN[1] + 0.6, RUN[1] + 1.4));
  legend(508, `exact pair (white)  sd ${sde.sd.target.toFixed(3)}`, color.ink, exact);
  legend(532, `monomers only       sd ${sde.sd.monomers.toFixed(2)}`, SCORE_W, drop);

  wrap(
    ctx,
    'sanity check: frozen monomer terms from L_A, L_B alone + interaction term from the Tweedie difference; the sampler machinery is right.',
    RIGHT, 718, 640, 21, { ...type.note, color: color.body, alpha: alpha * seg(t, RUN[1] + 1.8, RUN[1] + 2.6) },
  );
  text(ctx, 'Without the interaction the pair falls apart.', RIGHT, 781, { ...type.note, color: SCORE_W, alpha: drop });
}

// ---- 48.5–76: one frozen water model, every partner -------------------------------------------------

/** Padlock and label for one molecule of a cluster: above, below or beside it. */
function speciesLabel(ctx, p, [[from, to], label, tint, side], alpha) {
  if (alpha <= 0.003) return;
  const c = p.cam.project(centroid(p.X.slice(3 * from, 3 * to), to - from));
  const ys = Array.from({ length: to - from }, (_, i) => p.cam.project(pointOf(p.X, from + i)).y);
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const width = ctx.measureText(label).width + 24;
  ctx.restore();
  const [x, y] = {
    above: [c.x - width / 2, Math.min(...ys) - 28],
    below: [c.x - width / 2, Math.max(...ys) + 38],
    left: [c.x - 26 - width, c.y + 5],
    right: [c.x + 26, c.y + 5],
  }[side];
  drawPadlock(ctx, x + 8, y - 6, 18, { tint, alpha });
  text(ctx, label, x + 24, y, { ...type.note, color: tint, alpha });
}

function drawReuse(ctx, t) {
  const first = seg(t, REUSE + 0.5, REUSE + 1.3);
  if (first <= 0.003) return;
  const phi = seg(t, 56.5, 57.3);
  for (const p of PANELS) {
    const partner = seg(t, p.at, p.at + 0.7);
    const { X, cam, mol } = p;
    const row1 = p.cy < 450;
    text(ctx, p.title, p.cx, row1 ? 228 : 500, { font: font.sans, size: 18, weight: 500, color: color.ink, align: 'center', alpha: partner });
    text(ctx, p.phi, p.cx, row1 ? 458 : 522, { font: font.sans, size: 16, color: INTER, align: 'center', alpha: phi * partner });
    // the first water alone, then the whole cluster (one drawMol call) as its partner arrives
    p.labels.forEach(([[from, to], , tint]) => drawHalo(ctx, cam, X, [from, to], tint, { alpha: from === 0 ? first : partner }));
    drawMol(ctx, X.slice(0, 9), cam, WATER_MOL, { opacity: first * (1 - partner) });
    drawMol(ctx, X, cam, mol, { opacity: partner });
    for (const [h, o] of p.hbonds) drawHBond(ctx, cam, pointOf(X, h), pointOf(X, o), { alpha: partner, label: false });
    p.labels.forEach((l) => speciesLabel(ctx, p, l, l[0][0] === 0 ? first : partner));
  }
  text(ctx, 'a new interaction term φ for each pair of species; the monomer model is shared', LEFT, 724, { ...type.body, size: 19, color: color.ink, alpha: seg(t, 57.5, 58.3) });
}

/** Right column: why reuse is exact, and when it breaks. */
function drawBoard(ctx, t) {
  const on = seg(t, REUSE + 1, REUSE + 1.8);
  if (on <= 0.003) return;
  wrap(
    ctx,
    'same per-atom noise and centring ⇒ the noised reference factorises ⇒ each frozen model is exactly the trained marginal at every t',
    RIGHT, 248, 640, 27, { ...type.body, size: 19, color: color.ink, alpha: seg(t, EXACT, EXACT + 0.8) },
  );
  const column = (x, heading, tint, items, from) => {
    const a = seg(t, from, from + 0.6);
    text(ctx, heading, x, 334, { font: font.mono, size: 15, weight: 500, color: tint, tracking: 1.5, alpha: a });
    line(ctx, x, 346, x + 300, 346, { color: tint, width: 1.5, alpha: 0.6 * a });
    let y = 376;
    for (const [item, at] of items) {
      const ai = seg(t, at, at + 0.6);
      dot(ctx, x + 4, y - 6, 3.5, tint, ai);
      y += wrap(ctx, item, x + 16, y, 290, 23, { ...type.body, size: 17, alpha: ai }) + 14;
    }
  };
  column(RIGHT, 'REUSES', POSE, REUSES, REUSES[0][1] - 0.3);
  column(1220, 'BREAKS IF', RESTRAINT, BREAKS_IF, BREAKS - 0.3);
}
