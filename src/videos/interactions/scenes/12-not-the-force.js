import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, camera, line, rgba } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { INTER, PLUGIN, SCORE_W, SCORE_P, NOISE, PAIR_MOL, drawMol, drawHalo, drawScoreArrows, scoreArrow, view2d, drawSpringMolecule, tagCard, toyStamp } from '../shared.js';
import { centroid } from '../toy.js';
import { springData } from '../data.js';

const RIGHT = 860;
const { molecular: MOL, samples, cloud: CLOUD, table, spread: SPREAD, tweedie: TWEEDIE, noteMonteCarlo: MONTE_CARLO } = springData;
const NOISY = 7; // the docked pair turns noisy
const SPRINGS_IN = 13;
const NOTE = { ...type.body, size: 20 };

const LIMIT = tex(String.raw`\nabla\log W_t\ \xrightarrow{\ t\to 0\ }\ -\beta\,\nabla U_{\rm int}`, '∇log Wₜ  →(t → 0)  −β∇U_int');
const TWEEDIE_FORM = tex(String.raw`\sigma^2\,\nabla\log W_t(z) = \mathbb E_p[x_0\mid z] - \mathbb E_\nu[x_0\mid z]`, 'σ²∇log Wₜ(z) = E_p[x₀ | z] − E_ν[x₀ | z]');

// ---- the docked pair: clean interaction score, one noisy copy (seed 120) and its plug-in ----------------

const norm3 = (S, i) => Math.hypot(S[3 * i], S[3 * i + 1], S[3 * i + 2]);
const MOL_PX = 95 / Math.max(...Array.from({ length: 7 }, (_, i) => Math.max(norm3(MOL.clean, i), norm3(MOL.plugIn, i))));
const MOL_CAM = camera({ cx: 420, cy: 500, scale: 85, yaw: 0.35, pitch: 0.3, focal: 30, center: centroid(MOL.X, 7) });
const rng = createRng(122);
const SPECKLE = Array.from({ length: 7 }, (_, i) => Array.from({ length: 50 }, () => [0, 1, 2].map((c) => MOL.X[3 * i + c] + MOL.sigma * rng.gauss())));

// ---- the spring toy: one state per σ, in order on screen -----------------------------------------------

const sample = (sigma) => samples.find((s) => s.sigma === sigma);
const longest = (V) => Math.max(...V.map(([x, y]) => Math.hypot(x, y)));
const STATES = [
  { sigma: 0.01, from: SPRINGS_IN, to: 27.5, arrows: 22.7 },
  { sigma: 1, from: 27.5, to: 48, cloud: true },
  { sigma: 3, from: 48, to: 56, arrows: 48.6 },
  { sigma: 0.3, from: 56, to: 59.5, arrows: 56.3 },
  { sigma: 1, from: 59.5, to: 63, arrows: 59.8 },
  { sigma: 3, from: 63, to: 78.5, arrows: 63.3 },
].map((s) => {
  const { z, true: truth, plugIn } = sample(s.sigma);
  return { ...s, z, truth, plugIn, view: view2d({ cx: 400, cy: 520, scale: 190 / (1 + s.sigma) }), px: 70 / longest(truth) };
});
const BARS = [0.3, 1, 3].map((sigma, k) => ({ sigma, at: [56.5, 60, 63.5][k], ...table.find((r) => r.sigma === sigma), note: MONTE_CARLO[sigma] }));
const MONOMER_NET = Math.max(...BARS.map((b) => b.monomerNet)), PAIR_NET = Math.max(...BARS.map((b) => b.interactionNet));
const tiny = (v) => v.toExponential(0);

const CARD = 'Using the clean energy at the noisy point is inexact; Lu et al. (ICML 2023) show why, and learn the exact intermediate energy instead (contrastive energy prediction).';

export default defineScene({
  name: 'Not the force',
  duration: 78,
  narration: [
    [0, 'At small noise, that interaction arrow is exactly the intermolecular force field. It is tempting to use the force at every noise level, evaluated at the noisy atoms.'],
    [13, 'That is wrong. To see it exactly, take two molecules made of springs, where every term has an exact formula.'],
    [22.5, 'At tiny noise, the two arrows agree on every bead.'],
    [27.5, 'The right term asks: given this noisy pair, which clean pairs could have produced it? A denoiser that knows about the interaction makes one guess; one that does not makes another.'],
    [41.5, 'The interaction score is the step between their guesses, divided by sigma squared.'],
    [48, 'Diffusion starts from noise many times the molecule’s size, and there the plug-in force ignores the cloud.'],
    [56, 'It is off by three quarters at sigma point three, by more than three times at sigma one, and by more than twenty times at sigma three.'],
    [68.5, 'The true term fades as the noise grows. The plug-in does not.'],
  ],
  header: { eyebrow: '12 · FINITE NOISE', title: 'The noisy term is not the force' },

  draw(ctx, t) {
    drawPair(ctx, t, fade(t, 0.5, 1.3, SPRINGS_IN, SPRINGS_IN + 1));

    // the formulas, right
    const formulas = 1 - seg(t, 48, 48.8);
    LIMIT.draw(ctx, RIGHT, 260, { size: 34, alpha: seg(t, 1.5, 2.5) * formulas });
    text(ctx, 'small-noise scores are force fields: Arts et al., JCTC 2023', RIGHT, 312, { ...type.note, alpha: seg(t, 2.5, 3.3) * formulas });
    const tweedie = seg(t, 43, 44) * formulas;
    TWEEDIE_FORM.draw(ctx, RIGHT, 372, { size: 30, alpha: tweedie });
    text(ctx, 'Tweedie, applied twice', RIGHT, 420, { ...type.note, color: color.body, alpha: tweedie });
    text(ctx, `difference from the noised-score formula: ${tiny(TWEEDIE)}`, RIGHT, 446, { font: font.mono, size: 16, color: color.ink, alpha: seg(t, 45, 45.8) * formulas });

    // what the toy is, and what the first comparison shows
    wrap(ctx, 'The shortcut: use −β∇U_int at every noise level, evaluated at the noisy atoms.', RIGHT, 400, 640, 30, { ...NOTE, alpha: fade(t, 8, 9, SPRINGS_IN, SPRINGS_IN + 0.6) });
    wrap(ctx, 'Springs of zero rest length: every density here is Gaussian, so every score, guess and error has a closed form.', RIGHT, 400, 640, 30, { ...NOTE, alpha: fade(t, 15, 16, 29.3, 30) });
    wrap(ctx, 'σ = 0.01: the true term and the plug-in coincide on every bead.', RIGHT, 480, 640, 30, { ...NOTE, color: color.ink, alpha: fade(t, 24, 25, 26.8, 27.4) });
    wrap(ctx, 'σ = 3: the noise is about four times the pair’s spread. The true term comes from Wₜ(z) = E_ref[w(x₀) | z], the weight averaged over the cloud; the plug-in reads the springs at this one noisy point.', RIGHT, 260, 640, 30, { ...NOTE, alpha: fade(t, 49.5, 50.3, 55.3, 56) });

    // the spring toy, left
    const toy = seg(t, SPRINGS_IN + 0.5, SPRINGS_IN + 1.5);
    text(ctx, 'two molecules made of springs: every term has an exact formula', 80, 205, { ...type.body, size: 21, alpha: toy });
    text(ctx, 'two of three coordinates, exact', 80, 236, { ...type.note, alpha: toy });
    text(ctx, 'A, B: toy spring molecules (rose/lime = monomer A/B, not water/peroxide)', 80, 260, { ...type.note, alpha: toy });
    for (const s of STATES) drawState(ctx, t, s, toy * fade(t, s.from, s.from + 0.5, s.to - 0.5, s.to));
    drawArrowLegend(ctx, fade(t, 23, 24));
    drawCloudLegend(ctx, t, fade(t, 30, 31, 47.3, 48));
    drawBars(ctx, t);

    // the verdict
    text(ctx, `monomer net force ${tiny(MONOMER_NET)} · F_A + F_B ${tiny(PAIR_NET)}`, 880, 762, { font: font.mono, size: 16, color: color.ink, alpha: seg(t, 70, 70.8) });
    text(ctx, 'exact (Gaussian formulas); the fading is a property of this toy', 880, 796, { ...type.note, alpha: seg(t, 70.5, 71.3) });
    tagCard(ctx, { x: RIGHT, y: 200, width: 660, tag: 'ATTEMPT 2 · NO', body: CARD, accent: PLUGIN, alpha: seg(t, 70.5, 71.3), progress: lin(t, 70.9, 74.5) });
  },
});

/** The docked pair with its interaction score; from NOISY s, the speckle, one noisy copy and the plug-in. */
function drawPair(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const noisy = seg(t, NOISY, NOISY + 1);
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const cloud of SPECKLE) {
    for (const p of cloud) {
      const s = MOL_CAM.project(p);
      ctx.fillStyle = NOISE;
      ctx.globalAlpha = alpha * 0.25 * noisy;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.8, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  ctx.globalAlpha = alpha;
  drawHalo(ctx, MOL_CAM, MOL.X, [0, 3], SCORE_W, { alpha: 1 - noisy });
  drawHalo(ctx, MOL_CAM, MOL.X, [3, 7], SCORE_P, { alpha: 1 - noisy });
  if (noisy < 1) drawMol(ctx, MOL.X, MOL_CAM, PAIR_MOL, { opacity: 1 - noisy });
  if (noisy > 0) drawMol(ctx, MOL.X, MOL_CAM, PAIR_MOL, { opacity: 0.45 * noisy, ghost: color.muted });
  drawScoreArrows(ctx, MOL_CAM, MOL.X, MOL.clean, { colour: INTER, pxPerUnit: MOL_PX, alpha: 1 - 0.65 * noisy });
  if (noisy > 0.003) {
    drawMol(ctx, MOL.Z, MOL_CAM, PAIR_MOL, { opacity: noisy });
    drawScoreArrows(ctx, MOL_CAM, MOL.Z, MOL.plugIn, { colour: PLUGIN, pxPerUnit: MOL_PX, alpha: seg(t, NOISY + 1, NOISY + 2), dashed: true, hollow: true, outline: false });
  }
  ctx.restore();
  const w = MOL_CAM.project(centroid(MOL.X.slice(0, 9), 3)), p = MOL_CAM.project(centroid(MOL.X.slice(9), 4));
  text(ctx, 'water', w.x - 120, w.y, { font: font.display, italic: true, size: 24, color: SCORE_W, align: 'right', alpha: alpha * seg(t, 0.8, 1.6) });
  text(ctx, 'peroxide', p.x - 150, p.y, { font: font.display, italic: true, size: 24, color: SCORE_P, align: 'right', alpha: alpha * seg(t, 0.8, 1.6) });
  text(ctx, 'small noise: the force field', 420, 740, { ...type.body, size: 20, color: INTER, align: 'center', alpha: alpha * seg(t, 1, 1.8) * (1 - 0.5 * noisy) });
  text(ctx, 'plug-in: the force at the noisy atoms (σ = 0.3 Å)', 420, 772, { ...type.body, size: 20, color: PLUGIN, align: 'center', alpha: alpha * seg(t, NOISY + 1, NOISY + 2) });
  text(ctx, `t → 0: score = −β∇U · arrows: 10 Å⁻¹ = ${Math.round(10 * MOL_PX)} px`, 420, 806, { ...type.note, align: 'center', alpha: alpha * seg(t, 1.5, 2.3) });
  toyStamp(ctx, alpha);
}

/** One σ of the spring toy: the noisy pair, its scale bar and readout, and its arrows or its posterior clouds. */
function drawState(ctx, t, s, alpha) {
  if (alpha <= 0.003) return;
  const { view, z, sigma } = s;
  if (s.cloud) drawClouds(ctx, t, view, alpha);
  // the interaction springs (straight, dashed orange) dim to 40 % once the arrows come
  const springs = s.arrows ? 1 - 0.6 * seg(t, s.arrows, s.arrows + 0.8) : 1;
  drawSpringMolecule(ctx, view, z, { alpha: alpha * (s.cloud ? 1 - 0.45 * seg(t, 30, 31) : 1), showInteraction: !s.cloud, interactionAlpha: springs });
  if (s.cloud) drawGuessArrows(ctx, view, alpha * seg(t, 41.8, 42.8));
  if (s.arrows) {
    const a = alpha * seg(t, s.arrows, s.arrows + 0.8);
    drawToyArrows(ctx, view, z, s.truth, s.px, { colour: INTER }, a);
    drawToyArrows(ctx, view, z, s.plugIn, s.px, { colour: PLUGIN, dashed: true, hollow: true, outline: false, width: 3 }, a);
  }
  // the pair's spread as a scale bar, and σ against it
  const L = SPREAD * view.scale, y = 772;
  ctx.save();
  ctx.globalAlpha *= alpha;
  line(ctx, 400 - L / 2, y, 400 + L / 2, y, { color: color.ink, width: 2.5 });
  for (const x of [400 - L / 2, 400 + L / 2]) line(ctx, x, y - 7, x, y + 7, { color: color.ink, width: 2.5 });
  ctx.restore();
  text(ctx, `the pair’s spread: ${SPREAD.toFixed(2)}`, 400 + L / 2 + 14, y + 5, { ...type.note, color: color.body, alpha });
  text(ctx, `σ = ${sigma} = ${(sigma / SPREAD).toPrecision(2)}× the pair’s spread · one exact noisy pair`, 400, 804, { font: font.mono, size: 16, color: color.ink, align: 'center', alpha });
}

/** Per-bead 2D arrows (y up), `px` px per unit, clamped at 280 px with a tail mark. */
function drawToyArrows(ctx, view, Z, V, px, style, alpha) {
  Z.forEach((p, i) => {
    const a = view.project(p);
    let dx = V[i][0] * px, dy = -V[i][1] * px;
    const L = Math.hypot(dx, dy), k = L > 280 ? 280 / L : 1;
    scoreArrow(ctx, a.x, a.y, a.x + dx * k, a.y + dy * k, { ...style, alpha, clamped: k < 1 });
  });
}

/** σ = 1: 20 clean pairs under ν and 20 under p behind the noisy pair, then the two posterior means. */
function drawClouds(ctx, t, view, alpha) {
  const settle = 1 - 0.5 * seg(t, 35, 36);
  // the clouds as beads only (at most 0.25), the two guesses thick and on top
  CLOUD.nu.forEach((G) => drawSpringMolecule(ctx, view, G, { ghost: 'beads', tint: color.muted, showInteraction: false, alpha: 0.55 * alpha * settle * seg(t, 30, 31) }));
  CLOUD.p.forEach((G) => drawSpringMolecule(ctx, view, G, { ghost: 'beads', tint: INTER, showInteraction: false, alpha: 0.55 * alpha * settle * seg(t, 31.5, 32.5) }));
  drawSpringMolecule(ctx, view, CLOUD.meanP, { dashed: true, tint: INTER, showInteraction: false, radius: 9, lineWidth: 2.5, alpha: alpha * seg(t, 35, 36) });
  drawSpringMolecule(ctx, view, CLOUD.meanNu, { dashed: true, showInteraction: false, radius: 9, lineWidth: 2.5, alpha: alpha * seg(t, 38.5, 39.5) });
}

/** m_p − m_ν at each bead, drawn where the beads are (σ = 1, so this is ∇log W_t itself). */
function drawGuessArrows(ctx, view, alpha) {
  CLOUD.meanNu.forEach((m, i) => {
    const a = view.project(m), b = view.project(CLOUD.meanP[i]);
    scoreArrow(ctx, a.x, a.y, b.x, b.y, { colour: INTER, width: 3, head: 10, alpha });
  });
}

/** Bottom left: which arrow is which, and the scale rule. */
function drawArrowLegend(ctx, alpha) {
  if (alpha <= 0.003) return;
  const y = 842;
  scoreArrow(ctx, 80, y - 5, 120, y - 5, { colour: INTER, width: 3, head: 10, alpha });
  text(ctx, 'true term σ²∇log Wₜ', 132, y, { ...type.note, color: color.body, alpha });
  scoreArrow(ctx, 360, y - 5, 400, y - 5, { colour: PLUGIN, width: 3, head: 10, dashed: true, hollow: true, outline: false, alpha });
  text(ctx, 'plug-in −σ²L_int z: the force at the noisy beads', 412, y, { ...type.note, color: color.body, alpha });
  text(ctx, 'one scale per σ: largest orange arrow 70 px; plug-in clamped at 280 px', 80, y + 26, { ...type.note, alpha });
}

/** Right, while the clouds are up: what the outlines are. */
function drawCloudLegend(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const items = [
    { y: 520, at: 30, tint: color.muted, dot: true, label: 'the reference’s cloud: molecules that ignore each other' },
    { y: 556, at: 31.5, tint: INTER, dot: true, label: 'the pair’s cloud: with the interaction' },
    { y: 592, at: 35, tint: INTER, dashed: true, label: 'the pair’s guess  m_p = E_p[x₀ | z]' },
    { y: 628, at: 38.5, tint: [SCORE_W, SCORE_P], dashed: true, label: 'the reference’s guess  m_ref = E_ref[x₀ | z]' },
    { y: 664, at: 41.8, arrow: true, label: 'the step from one guess to the other' },
  ];
  for (const { y, at, tint, dot, dashed, arrow, label } of items) {
    const a = alpha * seg(t, at, at + 0.8);
    if (a <= 0.003) continue;
    if (arrow) scoreArrow(ctx, RIGHT + 4, y - 5, RIGHT + 30, y - 5, { colour: INTER, width: 3, head: 10, alpha: a });
    else if (dot) [6, 16, 26].forEach((dx, k) => dotAt(ctx, RIGHT + dx, y - 5 + [2, -4, 1][k], tint, a));
    else {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.lineWidth = 1.8;
      if (dashed) ctx.setLineDash([4, 3]);
      const tints = [tint].flat();
      tints.forEach((c, k) => {
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(RIGHT + 16 + (k - (tints.length - 1) / 2) * 15, y - 5, tints.length > 1 ? 7 : 9, 0, 2 * Math.PI);
        ctx.stroke();
      });
      ctx.restore();
    }
    text(ctx, label, RIGHT + 42, y, { ...type.note, size: 16, color: color.body, alpha: a });
  }
}

const dotAt = (ctx, x, y, tint, alpha) => {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = rgba(tint, 0.8);
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
};

/** Plug-in error on a log axis, one bar per σ, the note's Monte-Carlo values as white ticks; then the shrink ratios. */
function drawBars(ctx, t) {
  const alpha = seg(t, 55, 55.8);
  if (alpha <= 0.003) return;
  const X0 = 1020, X1 = 1500, TOP = 490, BASE = 670;
  const yOf = (v) => BASE - Math.log10(v / 0.1) * ((BASE - TOP) / 3); // 10 % … 10 000 %
  text(ctx, 'plug-in error at the noisy point (log scale)', 880, 440, { ...type.body, size: 19, color: color.ink, alpha });
  line(ctx, 880, 462, 900, 462, { color: color.ink, width: 2, alpha });
  text(ctx, 'the note’s Monte-Carlo value', 910, 467, { ...type.note, alpha });
  [0.1, 1, 10, 100].forEach((v, k) => {
    line(ctx, X0, yOf(v), X1, yOf(v), { color: color.grid, width: 1.5, alpha });
    text(ctx, `${['10', '100', '1000', '10 000'][k]} %`, X0 - 12, yOf(v) + 5, { ...type.note, align: 'right', alpha });
  });
  line(ctx, X0, TOP - 6, X0, BASE, { color: color.line, width: 1.5, alpha });
  BARS.forEach((b, k) => {
    const x = 1100 + 160 * k, a = alpha * seg(t, b.at, b.at + 0.6);
    if (a <= 0.003) return;
    const top = yOf(b.error), grow = seg(t, b.at, b.at + 0.9);
    const yy = BASE - (BASE - top) * grow;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = PLUGIN;
    ctx.fillRect(x - 46, yy, 92, BASE - yy);
    ctx.restore();
    line(ctx, x - 54, yOf(b.note), x + 54, yOf(b.note), { color: color.ink, width: 2, alpha: a * seg(t, b.at + 0.9, b.at + 1.3) });
    text(ctx, `${Math.round(100 * b.error)} %`, x, yy - 12, { font: font.mono, size: 19, weight: 600, color: color.ink, align: 'center', alpha: a * seg(t, b.at + 0.5, b.at + 0.9) });
    text(ctx, `σ = ${b.sigma}`, x, BASE + 24, { ...type.note, color: color.body, align: 'center', alpha: a });
    text(ctx, b.shrink.toFixed(2), x, 728, { font: font.mono, size: 17, color: INTER, align: 'center', alpha: alpha * seg(t, 69 + 0.4 * k, 69.6 + 0.4 * k) });
  });
  text(ctx, 'true / force field', 1040, 728, { ...type.note, color: INTER, align: 'right', alpha: alpha * seg(t, 69, 69.6) });
}
