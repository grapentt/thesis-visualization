import { defineScene, seg, fade, text, type, font, color, tex, camera, ring, arrow } from '../../../kit.js';
import { WATER_MOL, SCORE_W, drawMol, drawHalo, drawScoreArrows, scoreArrow, readout, toyStamp } from '../shared.js';
import { WATER, buildWater, gradU_W } from '../toy.js';
import { posterior02 as POST } from '../data.js';

const RIGHT = 860;
const LEGEND = 175;
const DEG = Math.PI / 180;
const { x0: X0, z: Z, mean: MEAN, sigma: SIGMA } = POST;
const GHOSTS = POST.ghosts.filter((g) => !g.isX0);
/** A slightly bent water and its force −∇U_W (kcal/mol/Å), one arrow scale for the scene. */
const BENT = buildWater(WATER.r0 + 0.03, WATER.r0, WATER.theta0 + 10 * DEG);
const FORCE = gradU_W(BENT).map((g) => -g);
const PX_PER_FORCE = 3; // px per kcal/mol/Å: the largest arrow is 100 px
const COUNT = String(POST.count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const NOISE = tex(String.raw`z = x_0 + \sigma\,\varepsilon,\qquad \varepsilon\sim\mathcal N(0, I)`, 'z = x₀ + σε,   ε ~ N(0, I)');
const TARGET = tex(String.raw`\nabla_z \log q_t(z\mid x_0) = -\,(z - x_0)/\sigma^2`, '∇_z log q_t(z | x₀) = −(z − x₀)/σ²');
const TWEEDIE = tex(String.raw`\sigma^2\,\nabla\log p_t(z) = \mathbb E[x_0\mid z] - z`, 'σ² ∇log p_t(z) = E[x₀ | z] − z');
const BOLTZMANN = tex(
  String.raw`p(x)\propto e^{-U(x)/kT}\ \Rightarrow\ \nabla\log p_t\ \xrightarrow{\ t\to 0\ }\ -\beta\,\nabla U,\qquad \beta = 1/kT`,
  'p(x) ∝ e^(−U(x)/kT)  ⇒  ∇log p_t → −β∇U as t → 0,   β = 1/kT',
);

const atom = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const lerp = (A, B, s) => Array.from(A, (a, i) => a + (B[i] - a) * s);
const ease = (s) => s * s * (3 - 2 * s);

export default defineScene({
  name: 'Noise and scores',
  duration: 73,
  narration: [
    [0, 'First, the one piece of diffusion we need. The forward process adds noise of the same size to every atom, in every direction.'],
    [10.5, 'A diffusion model learns the score: the gradient of the log density of noisy molecules. Its training target is simple: point from the noisy atoms back to the clean ones, divided by sigma squared.'],
    [26, 'But the model never learns which clean molecule was used. Many clean waters, turned and bent differently, could have made this noisy one.'],
    [36.5, 'Over all of them, the best it can learn is the direction to their weighted average. That is the true score.'],
    [46.5, 'Keep this picture. A noisy point stands for a cloud of clean configurations. It will explain what goes wrong later, and what goes right.'],
    [57.5, 'One more fact. In thermal equilibrium, density is proportional to e to the minus energy over kT. So at small noise, the score is just the force divided by kT.'],
  ],
  header: { eyebrow: '02 · BACKGROUND', title: 'A noisy point stands for a cloud' },

  draw(ctx, t) {
    const cam = camera({ cx: 420, cy: 500, scale: 190, yaw: 0, pitch: 0, focal: 60 });
    drawNoisePicture(ctx, cam, t);
    drawForcePicture(ctx, cam, t);
    drawColumn(ctx, t);
  },
});

/** 0.5–59: the clean water, its noisy copy, the target, the cloud and the score. */
function drawNoisePicture(ctx, cam, t) {
  const on = fade(t, 0.5, 1.5, 57.5, 59);
  if (on <= 0) return;
  const noised = ease(seg(t, 5, 6.5));
  const cloud = seg(t, 29.5, 31.5) * on;
  const [before, after] = [(at) => 1 - seg(t, at, at + 0.5), (at) => seg(t, at + 0.6, at + 1.2)]; // legend swaps
  const morph = ease(seg(t, 39.5, 41.5));
  const small = 1 - 0.5 * noised; // smaller atoms once noised, so the displacements show

  // the clean water, solid with its halo, slides to the noisy z; x₀ stays as an outline
  // (grey, rose once it is one of the cloud)
  drawHalo(ctx, cam, X0, 3, SCORE_W, { alpha: on * (1 - noised) });
  drawMol(ctx, lerp(X0, Z, noised), cam, WATER_MOL, { opacity: on, atomScale: small });
  // outlines over the solid noisy water, so the cloud stays readable
  for (let i = 0; i < 3; i++) {
    const p = cam.project(atom(X0, i));
    ring(ctx, p.x, p.y, SIGMA * cam.scale * p.k, color.ink, 0.22 * on * noised * (1 - 0.6 * cloud), 1.5);
  }
  GHOSTS.forEach((g, k) => {
    const a = seg(t, 29.5 + (1.5 * k) / GHOSTS.length, 30.5 + (1.5 * k) / GHOSTS.length) * on;
    drawMol(ctx, g.X, cam, WATER_MOL, { ghost: color.muted, opacity: 0.6 * g.weight * a * (1 - 0.6 * morph), atomScale: small }); // dimmed for the mean
  });
  if (noised > 0) {
    drawMol(ctx, X0, cam, WATER_MOL, { ghost: color.muted, opacity: on * noised * (1 - cloud), atomScale: small });
    drawMol(ctx, X0, cam, WATER_MOL, { ghost: SCORE_W, opacity: on * cloud, atomScale: small });
  }
  dashedWater(ctx, cam, MEAN, { scale: small, alpha: on * morph });

  // σ² × target (to x₀), sliding into σ² × score (to the weighted mean)
  const arrows = seg(t, 18.5, 19.5) * on;
  const tips = lerp(X0, MEAN, morph);
  for (let i = 0; i < 3; i++) {
    const a = cam.project(atom(Z, i)), b = cam.project(atom(tips, i));
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const shown = Math.min(1, Math.max(0, (length - 10) / 8)); // an arrow hidden inside its atom is not drawn
    scoreArrow(ctx, a.x, a.y, b.x, b.y, { colour: color.ink, width: 3 + 1.5 * morph, head: Math.min(11 + 3 * morph, 0.45 * length), alpha: arrows * shown });
  }

  const note = { ...type.note, alpha: 0 };
  text(ctx, 'grey outline: clean x₀ · solid: noisy z · rings: radius σ', LEGEND, 770, { ...note, alpha: on * seg(t, 6, 7) * before(29.5) });
  text(ctx, 'grey outlines: clean waters that could have made z (alpha ∝ weight)', LEGEND, 770, { ...note, alpha: on * after(29.5) });
  legendArrow(ctx, 800, arrows);
  text(ctx, 'σ² × target', LEGEND + 44, 805, { ...note, color: color.ink, alpha: arrows * before(39.5) });
  text(ctx, 'σ² × score · dashed: weighted mean of the cloud', LEGEND + 44, 805, { ...note, color: color.ink, alpha: arrows * after(39.5) });
  text(ctx, 'rose outline: the one actually used: one of the cloud', LEGEND, 840, { ...note, color: SCORE_W, alpha: seg(t, 31.5, 32.5) * on });
}

/** 58.2–73: a clean, slightly bent water (cross-fading in as the cloud fades) and its force, relabelled as a score (× kT). */
function drawForcePicture(ctx, cam, t) {
  const on = seg(t, 58.2, 59.7);
  if (on <= 0) return;
  const arrows = seg(t, 61, 62);
  drawHalo(ctx, cam, BENT, 3, SCORE_W, { alpha: on });
  drawMol(ctx, BENT, cam, WATER_MOL, { opacity: on });
  drawScoreArrows(ctx, cam, BENT, FORCE, { colour: color.ink, pxPerUnit: PX_PER_FORCE, alpha: arrows, width: 3, head: 11 });

  const note = { ...type.note, alpha: seg(t, 59, 59.8) }; // after the noise legend has gone
  toyStamp(ctx, note.alpha);
  text(ctx, 'a slightly bent water: angle θ₀ + 10°, one bond 0.03 Å longer', LEGEND, 770, note);
  legendArrow(ctx, 800, arrows);
  text(ctx, 'force −∇U', LEGEND + 44, 805, { ...note, color: color.ink, alpha: arrows * (1 - seg(t, 66, 66.5)) });
  text(ctx, 'score (× kT): the same arrows', LEGEND + 44, 805, { ...note, color: color.ink, alpha: arrows * seg(t, 66.6, 67.2) });
  text(ctx, `arrow scale: 10 kcal/mol/Å = ${10 * PX_PER_FORCE} px · TIP3P-style toy`, LEGEND, 840, { ...note, alpha: arrows });
}

/** The weighted mean: a dashed water outline, 2.5 px (thicker than the ghosts' outlines). */
function dashedWater(ctx, cam, X, { scale, alpha }) {
  if (alpha <= 0.003) return;
  const P = [0, 1, 2].map((i) => cam.project(atom(X, i)));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  for (const i of [1, 2]) {
    ctx.moveTo(P[0].x, P[0].y);
    ctx.lineTo(P[i].x, P[i].y);
  }
  P.forEach((p, i) => {
    const r = Math.max(6, (i ? 0.2 : 0.29) * cam.scale * p.k * scale); // drawMolecule's H and O radii
    ctx.moveTo(p.x + r, p.y);
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  });
  ctx.stroke();
  ctx.restore();
}

function legendArrow(ctx, y, alpha) {
  arrow(ctx, LEGEND, y, LEGEND + 32, y, { color: color.ink, width: 2.5, head: 9, alpha });
}

/** The notes column on the right. */
function drawColumn(ctx, t) {
  const earlier = 1 - 0.4 * seg(t, 58, 59); // the background steps back for the last fact
  const note = (s, y, a, o = {}) => text(ctx, s, RIGHT, y, { ...type.note, alpha: a, ...o });

  NOISE.draw(ctx, RIGHT, 260, { size: 34, alpha: seg(t, 5.5, 6.5) * earlier });
  note('the same σ on every atom and every direction', 304, seg(t, 6.5, 7.5) * earlier);
  note('the same schedule for every model', 326, seg(t, 6.5, 7.5) * earlier);

  const score = fade(t, 13, 14, 19.5, 20.4); // said in words before the target formula takes its place
  note('the score: ∇ log pₜ(z)', 372, score, { color: color.ink, size: 17 });
  note('the gradient of the log density of noisy molecules', 396, score);

  TARGET.draw(ctx, RIGHT, 372, { size: 30, alpha: seg(t, 21, 22) * earlier });
  note('the training target (denoising score matching):', 414, seg(t, 22.5, 23.5) * earlier);
  note('it uses the x₀ that was actually drawn', 436, seg(t, 22.5, 23.5) * earlier);

  note('the model never sees which one', 484, fade(t, 27, 28, 40.5, 41.5), { color: color.ink, size: 17 });

  TWEEDIE.draw(ctx, RIGHT, 484, { size: 30, alpha: seg(t, 43, 44) * earlier });
  note('Tweedie’s formula (standard)', 524, seg(t, 43.5, 44.5) * earlier);
  readout(ctx, 'posterior from', `${COUNT} clean waters · effective sample size ${Math.round(POST.nEff)}`, RIGHT, 550, { size: 15, alpha: seg(t, 44, 45) * earlier });

  const sentence = { font: font.display, size: 28, color: color.ink, alpha: seg(t, 48, 49.5) * earlier };
  text(ctx, 'A noisy point stands for a cloud', RIGHT, 612, sentence);
  text(ctx, 'of clean configurations.', RIGHT, 648, sentence);

  const size = Math.min(28, (28 * 670) / BOLTZMANN.metrics(28).width); // fits the column
  BOLTZMANN.draw(ctx, RIGHT, 718, { size, alpha: seg(t, 63, 64) });
  note('at small noise: score = force / kT', 776, seg(t, 66, 67), { color: color.ink, size: 17 });
}
