import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, camera, dot, line } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { POSE, SCORE_W, SCORE_P, INTER, NOISE, PAIR_MOL, WATER_MOL, PEROXIDE_MOL, drawMol, drawHalo, drawHBond, drawPadlock, tagCard, toyStamp, scatterPanel } from '../shared.js';
import { drawMaster, diagramCamera, diagPoint, popOut, toA, toB, toF } from '../diagram.js';
import { centroid, WATER } from '../toy.js';
import { DOCKED, noisedProfiles, centringScatter } from '../data.js';

const RIGHT = 860;
const CAM = diagramCamera();
const THETA0 = 104.52;
const SITE = { a: toA(THETA0), b: toB(120) }; // the centre-line fibre carrying the u axis

// beats (scene-local seconds)
const NOISE_UP = [2, 8]; // σ 0 → 0.3 Å on the docked pair
const SIGMA_PAIR = 0.3;
const CENTRES = 10;
const SLIDE = [12.5, 15.5];
const MASS = 23.5;
const DIAGRAM = 37.5;
const REF_LEVELS = [39.5, 44]; // reference σ levels cycle through
const TARGET = 44.5;
const MELT = [50, 63]; // σ 0 → 2 Å, roughly log-spaced in time

const Z_NOISE = tex(String.raw`z_t = x_0 + \sigma_t\,\varepsilon`, 'zₜ = x₀ + σₜ ε');
const NU_T = tex(
  String.raw`\nu_t = \mu_{W,t}\otimes\mu_{P,t}\otimes\rho_t,\quad \rho_t = \mathcal N\big(0,\ [s_0^2 + \sigma_t^2(\tfrac13 + \tfrac14)]\,I\big)`,
  'νₜ = μ_W,ₜ ⊗ μ_P,ₜ ⊗ ρₜ,  ρₜ = N(0, [s₀² + σₜ²(1/3 + 1/4)] I)',
);
const P_T = tex(String.raw`p_t = \nu_t\cdot W_t,\qquad W_t(z) = \mathbb E_\nu\big[w(X_0)\mid Z_t = z\big]`, 'pₜ = νₜ · Wₜ,  Wₜ(z) = E_ν[w(X₀) | Zₜ = z]');

// the docked pair, its fixed noise draw and the speckle (40 seeded dots per atom)
const rng = createRng(907); // a draw with no atom pushed beyond 1.6 standard deviations
const EPS = Array.from({ length: 21 }, () => rng.gauss());
const SPECKLE = Array.from({ length: 7 }, () => Array.from({ length: 40 }, () => [rng.gauss(), rng.gauss(), rng.gauss()]));
const noisy = (sigma) => DOCKED.X.map((v, i) => v + sigma * EPS[i]);
const PAIR_CENTRE = centroid(DOCKED.X, 7);
const PAIR_VIEW = { cx: 420, cy: 520, scale: 85, yaw: 0.65, pitch: 0.3, focal: 30 }; // yaw 0.65: peroxide's H–O–O–H twist shows
const PAIR_CAM = camera({ ...PAIR_VIEW, center: PAIR_CENTRE });
const COPIES = { water: { x: 1010, y: 470, atoms: [0, 3], mol: WATER_MOL }, peroxide: { x: 1370, y: 470, atoms: [3, 7], mol: PEROXIDE_MOL } };

// scatter panels: each axis scaled to unit spread, so a tilt reads as correlation
const standardise = (points) => {
  const sd = [0, 1].map((k) => {
    const m = points.reduce((s, p) => s + p[k], 0) / points.length;
    return Math.sqrt(points.reduce((s, p) => s + (p[k] - m) ** 2, 0) / points.length);
  });
  return points.map(([x, y]) => [x / sd[0], y / sd[1]]);
};
const SCATTER = [
  { x: 880, title: 'plain centroid', points: standardise(centringScatter.plain.points), corr: centringScatter.plain.corr },
  { x: 1250, title: 'centre of mass', points: standardise(centringScatter.mass.points), corr: centringScatter.mass.corr },
];
const SCATTER_BOX = { y: 300, w: 270, h: 250 };
const signed = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(2)}`;
const magnitude = (v) => Math.abs(v).toFixed(2);
const CARD_BODY =
  `equal noise ⇒ plain centroid. With the centre of mass, water’s centred noise correlates with r: ${signed(centringScatter.mass.analytic)} (O), ` +
  `${signed(centringScatter.analyticH)} (H); peroxide’s atoms relative to water’s centre of mass: |corr| ${magnitude(centringScatter.r3.O)} and ${magnitude(centringScatter.r3.H)}.`;

// centre-line profiles, all on one scale: the highest clean target peak sets the width
const PROFILE_WIDTH = 0.45;
const TARGET_LEVELS = noisedProfiles.target; // floor KDEs
const SITE_LEVELS = noisedProfiles.sites; // per-fibre u-KDEs
const SIGMAS = TARGET_LEVELS.map((l) => l.sigma);
const P_MAX = Math.max(...SITE_LEVELS.map(({ levels }) => Math.max(...levels[0].p)));
const FLOOR_MAX = Math.max(...TARGET_LEVELS[0].floor.flat());
const REFERENCE_LEVELS = noisedProfiles.reference;
const REF_FLOOR_MAX = Math.max(...REFERENCE_LEVELS[0].floor.flat()); // the reference floor's own scale until the target arrives

/** Piecewise-linear position of σ among increasing levels: { i, w } (between level i and i + 1). */
function bracket(levels, sigma) {
  let i = 0;
  while (i < levels.length - 2 && sigma > levels[i + 1]) i++;
  return { i, w: Math.min(1, Math.max(0, (sigma - levels[i]) / (levels[i + 1] - levels[i]))) };
}
const blend = (a, b, w) => a.map((v, k) => (Array.isArray(v) ? blend(v, b[k], w) : lerp(v, b[k], w)));

/** σ of the melt: 0 → 2 Å, about exponential in time. */
const meltSigma = (t) => {
  const u = lin(t, ...MELT);
  return (2 * (Math.exp(5 * u) - 1)) / (Math.exp(5) - 1);
};

/** Position among the reference's σ levels: cycles through all five, then follows the melt (below 0.1 Å it stays at 0.1). */
const REF_SIGMAS = REFERENCE_LEVELS.map((l) => l.sigma);
const referenceStage = (t) => {
  if (t < TARGET) return lin(t, ...REF_LEVELS) * (REF_SIGMAS.length - 1);
  const { i, w } = bracket(REF_SIGMAS, Math.max(REF_SIGMAS[0], meltSigma(t)));
  return lerp(REF_SIGMAS.length - 1, i + w, seg(t, TARGET, TARGET + 1.5));
};

export default defineScene({
  name: 'Noise',
  duration: 66,
  narration: [
    [0, 'Now add noise, as the diffusion model does: the same schedule for every model, the same noise on every atom.'],
    [9.5, 'A molecule\'s density ignores where it is, so each model works on centred atoms. Which centre? The plain average of the atoms, because the noise treats all atoms alike.'],
    [23, 'Centre on the centre of mass instead, and water\'s noise becomes correlated with where peroxide sits relative to water. Then water\'s frozen model no longer sees what it was trained on.'],
    [37, 'With matched centring, the noisy reference is still a product, and still flat along every fibre.'],
    [44.5, 'The noisy target is the noisy reference times a new weight, W-t: the average of w over the clean pairs that molecules ignoring each other could have left behind this noisy pair.'],
    [59, 'As the noise grows, the peaks melt.'],
  ],
  header: { eyebrow: '09 · NOISE', title: 'The same noise for every model' },

  draw(ctx, t) {
    const early = fade(t, 0.5, 1.3, DIAGRAM - 0.5, DIAGRAM + 0.3);
    drawPair(ctx, t, early);
    drawCopies(ctx, t, fade(t, SLIDE[0] - 0.5, SLIDE[0], 23, 23.8));
    drawScatter(ctx, t, fade(t, 24.2, 25, DIAGRAM - 0.5, DIAGRAM + 0.3));
    Z_NOISE.draw(ctx, RIGHT, 226, { size: 32, alpha: fade(t, 1.5, 2.3, 23, 23.8) });
    text(ctx, 'on every atom, the same σₜ', RIGHT, 270, { ...type.note, color: color.body, alpha: fade(t, 2, 2.8, 23, 23.8) });
    drawDiagram(ctx, t, seg(t, DIAGRAM, DIAGRAM + 1.2));
    drawNotes(ctx, t);
    toyStamp(ctx, seg(t, 0.5, 1.3));
  },
});

// ---- the docked pair, noised and centred --------------------------------------------------------

const sigmaPair = (t) => SIGMA_PAIR * seg(t, ...NOISE_UP);
const atom = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const centreOf = (X, [from, to], weights = null) => {
  const c = [0, 0, 0];
  let total = 0;
  for (let i = from; i < to; i++) {
    const w = weights ? weights[i - from] : 1;
    for (let k = 0; k < 3; k++) c[k] += w * X[3 * i + k];
    total += w;
  }
  return c.map((v) => v / total);
};

/** Left: the docked pair with equal noise on every atom, its plain centroids, then water's centre of mass. */
function drawPair(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const sigma = sigmaPair(t);
  const Z = noisy(sigma);
  drawHalo(ctx, PAIR_CAM, Z, [0, 3], SCORE_W, { alpha });
  drawHalo(ctx, PAIR_CAM, Z, [3, 7], SCORE_P, { alpha });
  drawMol(ctx, Z, PAIR_CAM, PAIR_MOL, { opacity: alpha });
  hBondOf(ctx, PAIR_CAM, Z, alpha * (1 - seg(sigma, 0.03, 0.1)));

  // speckle: where each atom's noise could have put it
  ctx.save();
  ctx.globalAlpha *= alpha * 0.3 * Math.min(1, sigma / 0.06); // no pile of dots on the atoms at σ = 0
  ctx.fillStyle = NOISE;
  SPECKLE.forEach((dots, i) => {
    const x = atom(DOCKED.X, i);
    for (const e of dots) {
      const s = PAIR_CAM.project([x[0] + sigma * e[0], x[1] + sigma * e[1], x[2] + sigma * e[2]]);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.6, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
  ctx.restore();

  const cw = PAIR_CAM.project(centreOf(Z, [0, 3])), cp = PAIR_CAM.project(centreOf(Z, [3, 7]));
  text(ctx, 'water', cw.x + 110, cw.y - 40, { font: font.display, italic: true, size: 28, color: SCORE_W, alpha });
  text(ctx, 'peroxide', cp.x + 120, cp.y + 10, { font: font.display, italic: true, size: 28, color: SCORE_P, alpha });
  text(ctx, `σ = ${sigma.toFixed(2)} Å`, 420, 812, { font: font.mono, size: 18, color: color.ink, align: 'center', alpha: alpha * seg(t, NOISE_UP[0] - 0.5, NOISE_UP[0]) });

  // plain centroids (white), then water's centre of mass (hollow ring, almost on the oxygen)
  const c = alpha * seg(t, CENTRES, CENTRES + 0.8);
  for (const s of [cw, cp]) dot(ctx, s.x, s.y, 6, color.ink, c);
  const label = { x: 650, y: 528 };
  text(ctx, 'plain centroids', label.x, label.y, { ...type.note, color: color.ink, align: 'center', alpha: c });
  for (const s of [cw, cp]) {
    const from = { x: label.x - 50, y: s.y < label.y ? label.y - 18 : label.y + 8 };
    const d = Math.hypot(s.x - from.x, s.y - from.y);
    line(ctx, from.x, from.y, s.x - ((s.x - from.x) / d) * 9, s.y - ((s.y - from.y) / d) * 9, { color: color.ink, width: 1.2, alpha: 0.6 * c });
  }
  const m = alpha * seg(t, MASS, MASS + 0.8);
  const g = PAIR_CAM.project(centreOf(Z, [0, 3], WATER.masses));
  ctx.save();
  ctx.globalAlpha *= m;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 11, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'water’s centre of mass', g.x - 30, g.y + 52, { ...type.note, color: color.ink, align: 'right', alpha: m });
  line(ctx, g.x - 28, g.y + 40, g.x - 8, g.y + 9, { color: color.ink, width: 1.2, alpha: 0.6 * m });
}

/** The docked pair's hydrogen bond, while the noise is still small. */
function hBondOf(ctx, cam, Z, alpha) {
  if (alpha <= 0.003) return;
  const { o, h } = DOCKED.hbond;
  drawHBond(ctx, cam, Z.slice(3 * h, 3 * h + 3), Z.slice(3 * o, 3 * o + 3), { alpha });
}

/** Right: each molecule re-centred on its plain centroid; a ghost slides from the pair onto the copy. */
function drawCopies(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const Z = noisy(sigmaPair(t));
  for (const [name, { x, y, atoms, mol }] of Object.entries(COPIES)) {
    const c = centreOf(Z, atoms);
    const X = Z.slice(3 * atoms[0], 3 * atoms[1]);
    line(ctx, x - 110, y, x + 110, y, { color: color.line, width: 1.5, alpha });
    line(ctx, x, y - 100, x, y + 100, { color: color.line, width: 1.5, alpha });
    const arrived = seg(t, SLIDE[1] - 0.8, SLIDE[1]);
    const cam = camera({ ...PAIR_VIEW, cx: x, cy: y, center: c });
    drawHalo(ctx, cam, X, mol.count, name === 'water' ? SCORE_W : SCORE_P, { alpha: alpha * arrived });
    drawMol(ctx, X, cam, mol, { opacity: alpha * arrived });
    dot(ctx, x, y, 6, color.ink, alpha * arrived);
    text(ctx, `${name}, centred`, x, 352, { font: font.sans, size: 19, weight: 500, color: name === 'water' ? SCORE_W : SCORE_P, align: 'center', alpha });

    // the ghost: the pair's camera slides onto the copy's
    const s = seg(t, SLIDE[0] + (name === 'water' ? 0 : 0.4), SLIDE[1] - (name === 'water' ? 0.4 : 0));
    const ghost = alpha * Math.min(seg(t, SLIDE[0], SLIDE[0] + 0.3), 1 - seg(t, SLIDE[1], SLIDE[1] + 0.6));
    if (ghost > 0.003) {
      const moving = camera({
        ...PAIR_VIEW,
        cx: lerp(PAIR_VIEW.cx, x, s),
        cy: lerp(PAIR_VIEW.cy, y, s),
        center: PAIR_CENTRE.map((v, k) => lerp(v, c[k], s)),
      });
      drawMol(ctx, X, moving, mol, { ghost: color.muted, opacity: 0.7 * ghost });
    }
  }
  const lock = alpha * seg(t, 17, 17.8);
  drawPadlock(ctx, COPIES.water.x - 92, 344, 26, { tint: SCORE_W, alpha: lock });
  drawPadlock(ctx, COPIES.peroxide.x - 108, 344, 26, { tint: SCORE_P, alpha: lock });
  text(ctx, 'each model sees centred atoms', 880, 612, { ...type.body, color: color.ink, alpha: alpha * seg(t, 15.6, 16.4) });
  text(ctx, 'exactly what each frozen model was trained on', 880, 648, { ...type.note, color: color.ink, alpha: lock });
}

/** Two scatter panels: noise on water's centred O against noise on r, plain centroid vs centre of mass. */
function drawScatter(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const { y, w, h } = SCATTER_BOX;
  text(ctx, 'x-components of the noise; each axis scaled to unit spread', 880, 250, { ...type.note, alpha });
  SCATTER.forEach(({ x, title, points, corr }, k) => {
    const a = alpha * seg(t, 24.6 + 1.6 * k, 25.4 + 1.6 * k);
    scatterPanel(ctx, { x, y, w, h, points, title, extent: 3.2, tint: NOISE, alpha: a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = color.bg;
    ctx.fillRect(x + w - 136, y + 8, 128, 26);
    ctx.restore();
    text(ctx, `corr = ${signed(corr).replace('+', '')}`, x + w - 10, y + 26, { font: font.mono, size: 17, color: color.ink, align: 'right', alpha: a });
    text(ctx, 'noise on water’s O (centred)', x + w / 2, y + h + 22, { ...type.note, align: 'center', alpha: a });
    ctx.save();
    ctx.translate(x - 12, y + h / 2);
    ctx.rotate(-Math.PI / 2);
    text(ctx, 'noise on r = c_B − c_A', 0, 0, { ...type.note, align: 'center', alpha: a });
    ctx.restore();
  });
  wrap(ctx, 'tilted ⇒ not a product ⇒ water’s frozen model no longer sees what it was trained on', 880, 604, 640, 21, { ...type.note, color: color.ink, alpha: alpha * seg(t, 29, 29.8) });
  tagCard(ctx, { x: RIGHT, y: 646, width: 660, tag: 'MATCH THE CENTRING', body: CARD_BODY, accent: color.gold, alpha: alpha * seg(t, 31, 31.8), progress: lin(t, 31.4, 35) });
}

// ---- the diagram: noisy reference flat, noisy target melting -------------------------------------

function drawDiagram(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const target = seg(t, TARGET + 0.5, TARGET + 1.5);
  const sigma = meltSigma(t);
  const { i, w } = bracket(SIGMAS, sigma);
  // each centre-line fibre carries its own noisy target: that fibre's clean pairs, noised
  const targets = SITE_LEVELS.map(({ tau, levels }) => ({
    site: [THETA0, tau], profile: { u: noisedProfiles.u, p: blend(levels[i].p, levels[i + 1].p, w) }, pMax: P_MAX, width: PROFILE_WIDTH, band: false, alpha: target,
  }));
  // the noisy reference: flat at every σ (histograms of 4 000 noised reference draws), dashed steps
  const stage = referenceStage(t);
  const k = Math.min(REFERENCE_LEVELS.length - 2, Math.floor(stage));
  const ref = blend(REFERENCE_LEVELS[k].histogram.density, REFERENCE_LEVELS[k + 1].histogram.density, stage - k);
  // the floor: the noisy reference p̄_A p̄_B (blurred by σ), then the noisy target's
  const refFloor = blend(REFERENCE_LEVELS[k].floor, REFERENCE_LEVELS[k + 1].floor, stage - k);
  const floor = blend(refFloor, blend(TARGET_LEVELS[i].floor, TARGET_LEVELS[i + 1].floor, w), target);
  const reference = [-120, 0, 120].map((tau) => ({ site: [THETA0, tau], profile: { p: ref }, steps: true, dashed: true, pMax: P_MAX, width: PROFILE_WIDTH, alpha: seg(t, REF_LEVELS[0] - 1, REF_LEVELS[0]) }));
  drawMaster(ctx, {
    camera: CAM,
    alpha,
    // the floor on a fixed scale (the clean target's maximum), so blurring also dims it
    floor: { density: floor, max: lerp(REF_FLOOR_MAX, FLOOR_MAX, target), gamma: 0.5, densityAlpha: seg(t, DIAGRAM + 0.5, DIAGRAM + 1.5), alpha: 1 },
    fibres: { alpha: 1, highlight: [[THETA0, 120]] },
    uAxis: { alpha: 1 },
    profiles: [...targets, ...reference],
  });

  const pop = alpha * seg(t, TARGET + 2.5, TARGET + 3.5);
  popOut(ctx, CAM, SITE.a, SITE.b, toF(DOCKED.u), { cx: 1200, cy: 650, r: 140, pxPerA: 40, center: PAIR_CENTRE }, (c, cam) => {
    const Z = noisy(sigma);
    drawMol(c, DOCKED.X, cam, PAIR_MOL, { ghost: color.muted, opacity: 0.45 });
    drawHalo(c, cam, Z, [0, 3], SCORE_W);
    drawHalo(c, cam, Z, [3, 7], SCORE_P);
    // at large σ the bonds mean nothing: fade them, keep the atoms
    drawMol(c, Z, cam, PAIR_MOL, { bondProgress: 0 });
    drawMol(c, Z, cam, PAIR_MOL, { opacity: 1 - seg(sigma, 0.3, 0.8) });
    hBondOf(c, cam, Z, 1 - seg(sigma, 0.03, 0.1));
  }, { alpha: pop, caption: 'the docked pair, noised: its own u, θ, τ move too' });

  // labels on the diagram
  const legend = { ...type.note, color: POSE };
  text(ctx, 'dashed: noisy reference', 636, 392, { ...legend, alpha: alpha * seg(t, REF_LEVELS[0] - 0.5, REF_LEVELS[0] + 0.3) });
  text(ctx, 'on the centre line', 636, 413, { ...legend, alpha: alpha * seg(t, REF_LEVELS[0] - 0.5, REF_LEVELS[0] + 0.3) });
  text(ctx, 'filled: noisy target,', 636, 448, { ...legend, alpha: alpha * target });
  text(ctx, 'each fibre’s clean pairs', 636, 469, { ...legend, alpha: alpha * target });
  text(ctx, 'noised', 636, 490, { ...legend, alpha: alpha * target });
  const near = CAM.project(diagPoint(0, 0, 0));
  text(ctx, 'shapes of noisy configurations, blurred', near.x, near.y + 106, { ...type.note, color: color.body, align: 'center', alpha: alpha * seg(t, MELT[0], MELT[0] + 0.8) });
}

/** Notes column: the noisy reference, then the noisy target; σ readouts. */
function drawNotes(ctx, t) {
  const ref = fade(t, DIAGRAM + 1, DIAGRAM + 1.8, 66, 67);
  fitTex(ctx, NU_T, RIGHT, 226, 28, 660, ref);
  text(ctx, 'each centre gets noise σ²/(number of atoms): water 3, peroxide 4', RIGHT, 268, { ...type.note, color: color.body, alpha: fade(t, DIAGRAM + 1.6, DIAGRAM + 2.4, 66, 67) });
  const stage = referenceStage(t);
  const shown = REFERENCE_LEVELS[Math.round(stage)].sigma;
  const cycling = fade(t, REF_LEVELS[0] - 0.5, REF_LEVELS[0], TARGET - 0.4, TARGET);
  text(ctx, `noisy reference at σ = ${shown.toFixed(1)} Å: still flat`, RIGHT, 330, { font: font.mono, size: 18, color: POSE, alpha: cycling });

  const late = seg(t, TARGET, TARGET + 0.8);
  fitTex(ctx, P_T, RIGHT, 336, 30, 660, late);
  text(ctx, 'the identity as used by Lu et al., ICML 2023, for energy-weighted targets', RIGHT, 380, { ...type.note, alpha: seg(t, TARGET + 1.2, TARGET + 2) });
  text(ctx, 'E_ν: the reference’s cloud, molecules that ignore each other', RIGHT, 404, { ...type.note, color: color.body, alpha: seg(t, TARGET + 2, TARGET + 2.8) });
  wrap(ctx, 'w unnormalised: Wₜ → 1 far apart; as σ grows Wₜ flattens to a constant', RIGHT, 444, 660, 21, { ...type.note, color: INTER, alpha: seg(t, MELT[0] + 1.5, MELT[0] + 2.3) });
  const pop = seg(t, TARGET + 2.5, TARGET + 3.5);
  text(ctx, `σ = ${meltSigma(t).toFixed(2)} Å`, 1362, 600, { font: font.mono, size: 20, color: color.ink, alpha: pop });
}

/** A formula shrunk to fit maxWidth, vertically centred on y. */
function fitTex(ctx, f, x, y, size, maxWidth, alpha) {
  if (alpha <= 0.003) return;
  const width = f.metrics(size).width;
  f.draw(ctx, x, y, { size: width > maxWidth ? (size * maxWidth) / width : size, alpha });
}
