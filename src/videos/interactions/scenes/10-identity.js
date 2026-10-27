import { defineScene, seg, fade, oscillate, lerpLog, text, wrap, type, font, color, tex, line, dot, ring, roundRect, mix } from '../../../kit.js';
import { VERTICAL, POSE, INTER, PLUGIN, NOISE, scoreArrow, equationStrip } from '../shared.js';
import { LOG_W, tableAt } from '../lines.js';
import { twoPointTables as TP } from '../data.js';
import { twoPointHeatmaps as HEAT } from '../canvases.js';
import { createRng } from '../../../engine/random.js';

// The two-point toy (§2.6): reference N(0, 1) per point, log w(r) = LOG_W(r), VP noise z = a x + σε.
const RIGHT = 860;
const PANEL = { x: 100, y: 210, size: 500, extent: 3 };
const S = PANEL.size / (2 * PANEL.extent); // px per unit
const PX = (u) => PANEL.x + (u + PANEL.extent) * S;
const PY = (v) => PANEL.y + (PANEL.extent - v) * S;
const LINE_Y = 792; // the number line under the panel, same scale as x₁
const REST = [0.5, -0.5]; // a clean pair one unit apart
const PROBE = TP.probe.z; // (0.55, −0.25)
const PX_PER_SCORE = 36; // arrow scale: ∇log W_t at the probe, σ = 0.2, is ≈ 98 px
const CLAMP = 200;
const SIGMAS = TP.sigmas;

// beats (scene-local seconds)
const NU = [12.3, 13.3], BANDS = [16.3, 17.8];
const VARIANT = 21.8;
const PROBE_MOVE = [32.8, 33.8], DISC = 37.5;
const AVERAGE = 43.5, BLUR = [48, 49];
const ARROWS = 55;
const STRIP_IN = 64, PLOT_IN = 67;

/** σ over the scene: 0.2, up to 0.8 and down to 0.05 while the disc grows (48.5–55), down to 0.02 and back at the end. */
function sigmaAt(t) {
  if (t < 48.5) return 0.2;
  if (t < 51.5) return lerpLog(0.2, 0.8, seg(t, 48.5, 51));
  if (t < 53.5) return lerpLog(0.8, 0.05, seg(t, 51.5, 53.5));
  if (t < 71) return lerpLog(0.05, 0.2, seg(t, 53.5, 55));
  // σ → 0 in steps through the precomputed levels, so each curve shown is exact while it holds
  if (t < 72.8) return lerpLog(0.2, 0.1, seg(t, 71, 71.8));
  if (t < 74.4) return lerpLog(0.1, 0.05, seg(t, 72.8, 73.6));
  if (t < 76.5) return lerpLog(0.05, 0.02, seg(t, 74.4, 75.2));
  return lerpLog(0.02, 0.2, seg(t, 76.5, 79));
}

/** Neighbouring precomputed σ levels and the crossfade between them (in log σ). */
function bracket(sigma) {
  let i = 0;
  while (i < SIGMAS.length - 2 && sigma > SIGMAS[i + 1]) i++;
  const f = Math.min(1, Math.max(0, Math.log(sigma / SIGMAS[i]) / Math.log(SIGMAS[i + 1] / SIGMAS[i])));
  return { lo: SIGMAS[i], hi: SIGMAS[i + 1], f };
}

/** log W_t(z) and its z₁ component of the gradient at the probe, from the 61-level probe series (log σ). */
function probeAt(sigma) {
  const { sigmas, logW, grad, difference } = TP.probe;
  const x = ((Math.log(sigma) - Math.log(sigmas[0])) / (Math.log(sigmas.at(-1)) - Math.log(sigmas[0]))) * (sigmas.length - 1);
  const k = Math.min(sigmas.length - 2, Math.max(0, Math.floor(x))), f = Math.min(1, Math.max(0, x - k));
  const at = (arr) => arr[k] + f * (arr[k + 1] - arr[k]);
  return { logW: at(logW), grad: at(grad), difference: at(difference) };
}

// the reference's cloud behind z: x₀ | z ~ N(a z, σ² I), drawn as fixed standard-normal offsets
const rng = createRng(1010);
const CLOUD = Array.from({ length: 70 }, () => [rng.gauss(), rng.gauss()]);
const W_MAX = Math.exp(3);

const REFERENCE = tex(String.raw`\nu(x) = \mathcal N(x_1;0,1)\,\mathcal N(x_2;0,1)`, 'ν(x) = N(x₁; 0, 1) N(x₂; 0, 1)');
const CLEAN = tex(String.raw`p_0(x) \propto \nu(x)\,w(x_1 - x_2)`, 'p₀(x) ∝ ν(x) w(x₁ − x₂)');
const W_T = tex(String.raw`W_t(z) = \mathbb E_\nu\big[w(x_0)\,\big|\,z_t=z\big]`, 'Wₜ(z) = E_ν[w(x₀) | zₜ = z]');
const SCORE = tex(
  String.raw`\nabla\log p_t(z) = \underbrace{-z}_{\text{reference}} + \underbrace{\nabla\log W_t(z)}_{\text{new}}`,
  '∇log pₜ(z) = −z (reference) + ∇log Wₜ(z) (new)',
);

const fixed = (v, d = 2) => v.toFixed(d).replace('-', '−');
const percent = (v) => (v > 10 ? '> 1000 %' : v < 0.1 ? `${(100 * v).toFixed(1)} %` : `${Math.round(100 * v)} %`);

export default defineScene({
  name: 'The identity',
  duration: 80,
  narration: [
    [0, 'Here is that identity in the simplest setting: two point molecules on a line, each drawn from a standard Gaussian, liking to be one unit apart.'],
    [12, 'In the plane of both positions the reference is a round blob, and the weight lights up two narrow bands.'],
    [21.5, 'We use a variant of the noise that also shrinks towards the middle, so the reference stays the same. Nothing here depends on it.'],
    [32.5, 'Pick a noisy point. Which clean pairs could have produced it, if the two ignored each other? A small disc of them.'],
    [43, 'The noisy weight is the clean weight averaged over that disc. That is all. As the noise grows, the disc grows and the bands blur.'],
    [54.5, 'Take the gradient of the logarithm: the score of the pair is the reference\'s score plus one new term.'],
    [63.5, 'For molecules, the reference\'s score is the two frozen monomer scores plus the spring. The new term is not the clean weight read off at the noisy point.'],
  ],
  header: { eyebrow: '10 · THE IDENTITY', title: 'The weight, blurred' },

  draw(ctx, t) {
    const sigma = sigmaAt(t);
    const z = pointAt(t);
    drawPanel(ctx, t, sigma);
    drawCloud(ctx, t, sigma, z);
    drawArrows(ctx, t, sigma, z);
    drawNumberLine(ctx, t, sigma, z);
    drawNotes(ctx, t, sigma);
    drawPlot(ctx, t, sigma);
  },
});

/** The point in the plane: a clean pair moving both / apart, resting on a band, then the probe z. */
function pointAt(t) {
  const both = 0.7 * oscillate(t, 3.5, 7) + 0.6 * oscillate(t, 18.5, 21.5);
  const apart = 0.45 * oscillate(t, 7.5, 11);
  const clean = [REST[0] + both + apart, REST[1] + both - apart];
  const s = seg(t, ...PROBE_MOVE);
  return clean.map((v, i) => v + (PROBE[i] - v) * s);
}

/** Text on a dark backdrop, for labels drawn over the heatmap. */
function tag(ctx, str, x, y, { colour = color.ink, align = 'left', alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.globalAlpha *= alpha * 0.78;
  ctx.fillStyle = color.bg;
  roundRect(ctx, x0 - 6, y - 15, w + 12, 21, 5);
  ctx.fill();
  ctx.restore();
  text(ctx, str, x, y, { ...type.note, color: colour, align, alpha });
}

// ---- the plane of both positions -----------------------------------------------------------

function drawPanel(ctx, t, sigma) {
  const on = seg(t, 0.5, 1.3);
  const { x, y, size } = PANEL;
  ctx.save();
  ctx.globalAlpha *= on;
  ctx.fillStyle = color.panel;
  ctx.fillRect(x, y, size, size);

  // heatmaps: ν, then p₀ ∝ ν·w, then p_t at the current σ (crossfaded between precomputed levels)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const image = (canvas, a) => {
    if (a <= 0.003) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.drawImage(canvas, x, y, size, size);
    ctx.restore();
  };
  const heat = seg(t, ...NU);
  image(HEAT.nu, heat);
  image(HEAT.clean, seg(t, ...BANDS));
  const noisy = seg(t, ...BLUR);
  if (noisy > 0) {
    const { lo, hi, f } = bracket(sigma);
    image(HEAT.bySigma[lo], noisy);
    image(HEAT.bySigma[hi], noisy * f);
  }

  // grid, frame, ticks and axis labels
  for (const v of [-2, -1, 1, 2]) {
    line(ctx, PX(v), y, PX(v), y + size, { color: color.grid, alpha: 1 - 0.7 * heat });
    line(ctx, x, PY(v), x + size, PY(v), { color: color.grid, alpha: 1 - 0.7 * heat });
  }
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
  for (const v of [-2, 0, 2]) {
    text(ctx, fixed(v, 0), PX(v), y + size + 22, { ...type.note, align: 'center', alpha: on });
    text(ctx, fixed(v, 0), x - 10, PY(v) + 5, { ...type.note, align: 'right', alpha: on });
  }
  text(ctx, 'x₁ →', x + size + 10, y + size + 5, { font: font.mono, size: 17, color: color.ink, alpha: on });
  text(ctx, 'x₂ ↑', x - 10, y + 16, { font: font.mono, size: 17, color: color.ink, align: 'right', alpha: on });
  text(ctx, 'toy: log w(r) = 3 exp(−(|r| − 1)²/(2·0.15²)) · reference N(0, 1) each', x, 872, { ...type.note, alpha: on });

  // what the heatmap shows (top-left corner, where every picture is dark)
  // labels hand over one after the other, never overlapping
  const half = (a, b) => [seg(t, a, (a + b) / 2), seg(t, (a + b) / 2, b)];
  const [bandsOut, bandsIn] = half(...BANDS), [blurOut, blurIn] = half(...BLUR);
  tag(ctx, 'reference: ignore each other', x + 12, y + 26, { alpha: heat * (1 - bandsOut) });
  tag(ctx, 'clean p₀ ∝ ref · w', x + 12, y + 26, { colour: INTER, alpha: bandsIn * (1 - blurOut) });
  tag(ctx, 'noisy pₜ ∝ refₜ · Wₜ', x + 12, y + 26, { colour: INTER, alpha: blurIn });
  tag(ctx, `σ = ${sigma.toFixed(2)} · a = ${Math.sqrt(1 - sigma * sigma).toFixed(2)}`, x + size - 12, y + 26, { align: 'right', alpha: seg(t, 32.5, 33.3) });

  // the reference's level circles: unchanged by the noise variant
  const level = fade(t, VARIANT + 1.5, VARIANT + 2.5, 31.5, 32.5);
  ctx.save();
  ctx.setLineDash([6, 6]);
  for (const r of [1, 2]) ring(ctx, PX(0), PY(0), r * S, color.ink, 0.55 * level, 1.5);
  ctx.restore();
  tag(ctx, 'reference N(0, I): the same at every σ', x + 12, y + size - 14, { alpha: level });

  // the two directions of the plane
  const dirs = fade(t, 1.5, 2.5, 31.5, 32.5);
  const pulse = (a, b) => 1 + 0.6 * Math.abs(oscillate(t, a, b, 0.5));
  const o = [PX(0), PY(0)], L = 1.25 * S;
  scoreArrow(ctx, o[0], o[1], o[0] + L, o[1] - L, { colour: VERTICAL, width: 3 * pulse(3.5, 7), alpha: dirs });
  scoreArrow(ctx, o[0], o[1], o[0] + L, o[1] + L, { colour: POSE, width: 3 * pulse(7.5, 11), alpha: dirs });
  tag(ctx, 'move both', o[0] + L + 8, o[1] - L - 4, { colour: VERTICAL, alpha: dirs });
  tag(ctx, 'relative position', o[0] + L + 8, o[1] + L + 14, { colour: POSE, alpha: dirs });

  // the noise variant, over the panel
  const variant = seg(t, VARIANT, VARIANT + 0.8);
  text(ctx, 'noise variant: z = a x + σε, a = √(1 − σ²):', x, 166, { ...type.note, color: color.body, alpha: variant });
  text(ctx, 'shrinks towards the middle, so the reference stays N(0, I)', x, 188, { ...type.note, color: color.body, alpha: variant });
}

/** The probe z, the reference's cloud behind it (centre a·z, rings at σ and 2σ) and its clean pairs. */
function drawCloud(ctx, t, sigma, z) {
  const a = Math.sqrt(1 - sigma * sigma);
  const c = [PX(a * z[0]), PY(a * z[1])];
  const disc = seg(t, DISC, DISC + 1);
  const tint = seg(t, AVERAGE, AVERAGE + 1);
  const zp = [PX(z[0]), PY(z[1])];

  // clean pairs of the cloud, lit by their weight once the average is taken
  CLOUD.forEach(([e1, e2], k) => {
    const x0 = [a * z[0] + sigma * e1, a * z[1] + sigma * e2];
    const share = (Math.exp(LOG_W(x0[0] - x0[1])) - 1) / (W_MAX - 1);
    const pop = seg(t, DISC + 0.8 + 0.012 * k, DISC + 1.4 + 0.012 * k);
    dot(ctx, PX(x0[0]), PY(x0[1]), 3 + 1.4 * tint * share, mix(NOISE, INTER, tint * share), pop * (0.7 + 0.3 * tint * share));
  });
  ctx.save();
  ctx.setLineDash([5, 5]);
  ring(ctx, c[0], c[1], sigma * S, color.ink, 0.85 * disc, 1.5);
  ring(ctx, c[0], c[1], 2 * sigma * S, color.ink, 0.6 * disc, 1.5);
  ctx.restore();
  const r = Math.max(2 * sigma * S, 18); // label clearance, also when the disc is tiny
  tag(ctx, 'the reference\'s cloud', c[0], c[1] - r - 12, { colour: color.body, align: 'center', alpha: disc });

  // shrink: z → a·z (visible once σ is large)
  const shrink = disc * fade(t, DISC + 0.5, DISC + 1.5, ARROWS - 0.8, ARROWS);
  if (Math.hypot(zp[0] - c[0], zp[1] - c[1]) > 4) scoreArrow(ctx, zp[0], zp[1], c[0], c[1], { colour: color.ink, width: 2, head: 8, alpha: shrink, outline: false });
  dot(ctx, c[0], c[1], 2.5, color.ink, shrink);
  tag(ctx, 'centre a·z: shrunk towards the middle', c[0], c[1] + r + 24, { align: 'center', alpha: shrink });

  // the point itself
  const on = seg(t, 1, 1.8);
  dot(ctx, zp[0], zp[1], 6.5, color.bg, on);
  dot(ctx, zp[0], zp[1], 5, color.ink, on);
  tag(ctx, 'z', zp[0] - 13, zp[1] - 9, { colour: color.ink, align: 'right', alpha: seg(t, PROBE_MOVE[1], PROBE_MOVE[1] + 0.6) });
}

/** ∇log W_t at z (orange) against the plug-in ∇log w(z) (dashed, hollow, clamped at 200 px). */
function drawArrows(ctx, t, sigma, z) {
  const on = seg(t, ARROWS, ARROWS + 1);
  if (on <= 0) return;
  const plug = seg(t, ARROWS + 1.5, ARROWS + 2.5);
  const zp = [PX(z[0]), PY(z[1])];
  const g = probeAt(sigma).grad, p = TP.probe.plugGrad;
  // gradient (g, −g) in the plane: screen direction (1, 1)/√2 times √2·g
  // the plug-in runs 8 px to the side, so it stays visible where both arrows are clamped
  const arrow = (value, style, side = 0) => {
    const len = Math.SQRT2 * Math.abs(value) * PX_PER_SCORE, s = Math.sign(value);
    const shown = Math.min(len, CLAMP);
    const o = [zp[0] + side / Math.SQRT2, zp[1] - side / Math.SQRT2];
    const tip = [o[0] + (s * shown) / Math.SQRT2, o[1] + (s * shown) / Math.SQRT2];
    scoreArrow(ctx, o[0], o[1], tip[0], tip[1], { ...style, clamped: len > CLAMP });
    return tip;
  };
  const plugTip = arrow(p, { colour: PLUGIN, dashed: true, hollow: true, alpha: plug }, 8);
  const tip = arrow(g, { colour: INTER, alpha: on });
  const size = (v) => (Math.SQRT2 * Math.abs(v)).toFixed(1);
  tag(ctx, `plug-in ∇log w(z): ${size(p)}`, plugTip[0] + 14, plugTip[1] - 4, { colour: color.body, alpha: plug });
  const mid = [(zp[0] + tip[0]) / 2, (zp[1] + tip[1]) / 2];
  tag(ctx, `∇log Wₜ(z): ${size(g)}`, mid[0] - 18, mid[1] + 26, { colour: INTER, align: 'right', alpha: on });
}

/** Two beads on a line: the pair the point stands for (x₁, x₂, then z₁, z₂), with the score's pull. */
function drawNumberLine(ctx, t, sigma, z) {
  const on = seg(t, 1, 1.8);
  line(ctx, PX(-3), LINE_Y, PX(3), LINE_Y, { color: color.line, width: 2, alpha: on });
  for (let v = -3; v <= 3; v++) line(ctx, PX(v), LINE_Y - 5, PX(v), LINE_Y + 5, { color: color.line, alpha: on });
  const noisy = seg(t, ...PROBE_MOVE);
  const names = noisy < 0.5 ? ['x₁', 'x₂'] : ['z₁', 'z₂'];
  const g = probeAt(sigma).grad;
  const pull = seg(t, ARROWS, ARROWS + 1);
  z.forEach((v, i) => {
    const px = PX(v);
    if (pull > 0) {
      const len = Math.min(Math.abs(g) * PX_PER_SCORE, 140) * Math.sign(i === 0 ? g : -g);
      const x0 = px + 12 * Math.sign(len);
      scoreArrow(ctx, x0, LINE_Y, x0 + len, LINE_Y, { colour: INTER, width: 3, head: 11, alpha: pull, clamped: Math.abs(g) * PX_PER_SCORE > 140 });
    }
    dot(ctx, px, LINE_Y, 9, color.ink, on);
    text(ctx, names[i], px, LINE_Y - 18, { font: font.mono, size: 17, color: color.ink, align: 'center', alpha: on * Math.abs(1 - 2 * noisy) ** 0.5 });
  });
  text(ctx, `d = ${noisy < 0.5 ? 'x₁ − x₂' : 'z₁ − z₂'} = ${fixed(z[0] - z[1])}`, PX(3) + 18, LINE_Y + 5, { font: font.mono, size: 16, color: POSE, alpha: on });
}

// ---- the right column ----------------------------------------------------------------------

function drawNotes(ctx, t, sigma) {
  // the toy in formulas, until the noisy point arrives
  const early = (a) => fade(t, a, a + 0.8, 31.8, 32.6);
  REFERENCE.draw(ctx, RIGHT, 230, { size: 28, alpha: early(6.5) });
  text(ctx, 'the reference: two points that ignore each other', RIGHT, 272, { ...type.note, alpha: early(7) });
  CLEAN.draw(ctx, RIGHT, 330, { size: 28, alpha: early(BANDS[0]) });
  text(ctx, 'the weight: two narrow bands, x₁ − x₂ = ±1', RIGHT, 372, { ...type.note, color: INTER, alpha: early(BANDS[1]) });

  text(ctx, 'which clean pairs x₀ could have produced z,', RIGHT, 226, { ...type.body, color: color.ink, alpha: fade(t, 33.5, 34.3, 42.6, 43.2) });
  text(ctx, 'if the two ignored each other?', RIGHT, 258, { ...type.body, color: color.ink, alpha: fade(t, 33.5, 34.3, 42.6, 43.2) });
  W_T.draw(ctx, RIGHT, 230, { size: 28, alpha: seg(t, 43.4, 44.4) });
  text(ctx, 'the clean weight, averaged over the reference\'s cloud behind z', RIGHT, 270, { ...type.note, alpha: seg(t, 44.6, 45.4) });

  const live = probeAt(sigma);
  const mono = { font: font.mono, size: 17, color: color.ink };
  text(ctx, `Wₜ(z) = ${Math.exp(live.logW).toFixed(2)}`, RIGHT, 302, { ...mono, color: INTER, alpha: seg(t, 45.4, 46.2) });
  text(ctx, `w(z) = ${Math.exp(TP.probe.logw).toFixed(2)}`, RIGHT + 230, 302, { ...mono, alpha: seg(t, 45.4, 46.2) });
  text(ctx, `difference from the plug-in: ${percent(live.difference)}`, RIGHT, 332, { ...mono, alpha: seg(t, ARROWS + 2, ARROWS + 2.8) });
  text(ctx, `arrows: 1 unit of score = ${PX_PER_SCORE} px; clamped at ${CLAMP} px (tail mark)`, RIGHT, 358, { ...type.note, alpha: seg(t, ARROWS + 2, ARROWS + 2.8) });

  SCORE.draw(ctx, RIGHT, 398, { size: 24, alpha: fade(t, 59, 60, STRIP_IN - 0.8, STRIP_IN) });

  // the molecules' version: born here
  const strip = seg(t, STRIP_IN, STRIP_IN + 1);
  if (strip <= 0) return;
  equationStrip(ctx, RIGHT, 430, { size: 30, maxWidth: 640, oplusCaption: true, alpha: strip });
  const note = { ...type.note, color: color.body, alpha: seg(t, STRIP_IN + 1, STRIP_IN + 1.8) };
  text(ctx, 'in the toy, the reference N(0, I) supplies −z', RIGHT, 522, note);
  text(ctx, 'for monomers and spring together', RIGHT, 543, note);
}

/** log w(d) and log W_t(d) at the current σ against d = z₁ − z₂ (x 860–1500, y 560–780). */
function drawPlot(ctx, t, sigma) {
  const on = seg(t, PLOT_IN, PLOT_IN + 1);
  if (on <= 0) return;
  const box = { x: 905, y: 600, w: 580, h: 160 };
  const range = [-0.2, 3.2];
  const X = (d) => box.x + ((d + 3) / 6) * box.w;
  const Y = (v) => box.y + box.h - ((v - range[0]) / (range[1] - range[0])) * box.h;

  text(ctx, `against d = z₁ − z₂, at σ = ${sigma.toFixed(2)}`, RIGHT, 582, { font: font.mono, size: 16, color: color.ink, alpha: on });
  line(ctx, box.x, box.y, box.x, box.y + box.h, { color: color.line, alpha: on });
  line(ctx, box.x, Y(0), box.x + box.w, Y(0), { color: color.line, alpha: on });
  for (const d of [-2, -1, 0, 1, 2]) text(ctx, fixed(d, 0), X(d), box.y + box.h + 20, { ...type.note, align: 'center', alpha: on });
  for (const v of [0, 3]) text(ctx, String(v), box.x - 8, Y(v) + 5, { ...type.note, align: 'right', alpha: on });

  const curve = (f, style) => {
    ctx.save();
    ctx.globalAlpha *= style.alpha;
    ctx.strokeStyle = style.colour;
    ctx.lineWidth = style.width;
    ctx.setLineDash(style.dash ?? []);
    ctx.beginPath();
    for (let k = 0; k <= 360; k++) {
      const d = -3 + k / 60;
      k ? ctx.lineTo(X(d), Y(f(d))) : ctx.moveTo(X(d), Y(f(d)));
    }
    ctx.stroke();
    ctx.restore();
  };
  curve(LOG_W, { colour: PLUGIN, width: 2, dash: [7, 5], alpha: on });
  const { lo, hi, f } = bracket(sigma);
  curve((d) => tableAt(TP.tables[lo], d).logg, { colour: INTER, width: 3, alpha: on * (1 - f) });
  curve((d) => tableAt(TP.tables[hi], d).logg, { colour: INTER, width: 3, alpha: on * f });

  // the probe's d
  const d0 = PROBE[0] - PROBE[1];
  line(ctx, X(d0), box.y, X(d0), box.y + box.h, { color: color.ink, dash: [3, 5], alpha: 0.6 * on });
  text(ctx, 'z', X(d0) - 6, box.y + 12, { font: font.mono, size: 15, color: color.ink, align: 'right', alpha: on });

  // legend, top right
  const lx = box.x + box.w - 150;
  line(ctx, lx, 612, lx + 28, 612, { color: PLUGIN, width: 2, dash: [7, 5], alpha: on });
  text(ctx, 'log w(d)', lx + 36, 617, { ...type.note, color: color.body, alpha: on });
  line(ctx, lx, 636, lx + 28, 636, { color: INTER, width: 3, alpha: on });
  text(ctx, 'log Wₜ(d)', lx + 36, 641, { ...type.note, color: INTER, alpha: on });

  wrap(ctx, 'Wₜ is flatter: lower at the wells, higher between and beyond them; its wells sit slightly outwards (±1/a) and meet w as σ → 0', RIGHT, 812, 660, 21, { ...type.note, color: color.body, alpha: seg(t, 69.5, 70.3) });
}
