import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, drawMolecule, rotation } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { nitro, X0, nitroCamera, turnRotor, bend, centreOfMass, zeroMomentum, placed, VERTICAL, ROTOR } from '../shared.js';

const STEPS = 1200;
const T = 40; // simulated time, in units of the bend's relaxation time
const DT = T / STEPS;
const RUNS = 40;
const RUN = [4, 40]; // scene time over which the simulation plays
const RIGHT = 860;
const COM = centreOfMass(X0);
const CASES = {
  vibrations: { sigmaBend: 0.2, sigmaRotor: 0.35, freeRotor: false, tint: color.stiff, label: 'small vibrations around one shape' },
  rotor: { sigmaBend: 0.2, rotorD: 0.04, freeRotor: true, tint: ROTOR, label: 'a freely turning rotor' },
};

/** One noisy shape path: the bend relaxes (Ornstein–Uhlenbeck); the rotor relaxes too, or diffuses freely. */
function shapePath(rng, c) {
  let b = c.sigmaBend * rng.gauss();
  let p = c.freeRotor ? 0 : c.sigmaRotor * rng.gauss();
  const path = [];
  for (let i = 0; i <= STEPS; i++) {
    path.push([b, p]);
    b += -b * DT + Math.sqrt(2 * c.sigmaBend ** 2 * DT) * rng.gauss();
    p += c.freeRotor ? Math.sqrt(2 * c.rotorD * DT) * rng.gauss() : -p * DT + Math.sqrt(2 * c.sigmaRotor ** 2 * DT) * rng.gauss();
  }
  return path;
}
const shapeOf = ([b, p]) => bend(turnRotor(X0, p), b);

/** Simulated once, on first use: rms rotation angle over time for both cases, and one rotor run to show. */
let cache = null;
function simulate() {
  if (cache) return cache;
  const rms = {};
  let shown = null;
  for (const [key, c] of Object.entries(CASES)) {
    const sum = new Float64Array(STEPS + 1);
    for (let r = 0; r < RUNS; r++) {
      const path = shapePath(createRng(300 + r), c);
      const R = zeroMomentum((tau) => shapeOf(path[Math.round(tau * STEPS)]), STEPS);
      R.forEach((M, i) => (sum[i] += rotation.rotationAngle(M) ** 2));
      if (key === 'rotor' && r === 0) shown = { path, R };
    }
    rms[key] = Array.from(sum, (v) => (Math.sqrt(v / RUNS) * 180) / Math.PI);
  }
  cache = { rms, shown };
  return cache;
}

const CONFINED = tex(String.raw`D_{\text{rot}} = \tfrac12\, \lambda^2 D\, \sigma^2`, 'D_rot = ½ λ² D σ²');

export default defineScene({
  name: 'Noise turns the molecule',
  duration: 50,
  narration:
    'Back to the molecule. Let its shape jitter at random, the way thermal noise would, but with zero angular momentum: no torque at all. With small vibrations around one shape, the orientation jitters but stays where it is; the little loops turn it left and right, and for molecular vibrations the drift is tiny. A freely turning rotor, like the nitro group of nitromethane, is different: it wanders all the way round, and every net turn rotates the molecule by the holonomy of the rotor’s loop. The orientation does a random walk, driven by noise in the shape alone.',
  header: { eyebrow: '14 · NOISE', title: 'Shape noise turns the molecule' },

  draw(ctx, t) {
    const { rms, shown } = simulate();
    const i = Math.round(lin(t, ...RUN) * STEPS);
    const cam = nitroCamera({ cx: 400, cy: 470, scale: 140, yaw: 0.6, pitch: 0.3 });
    const X = placed(shapeOf(shown.path[i]), shown.R[i], COM);
    drawMolecule(ctx, X0, cam, { molecule: nitro, ghost: color.muted, opacity: 0.5 * seg(t, 3, 4), labels: 0 });
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: seg(t, 0, 0.8), labels: 0 });
    text(ctx, `the molecule has turned by ${((rotation.rotationAngle(shown.R[i]) * 180) / Math.PI).toFixed(0)}° since the start`, 400, 770, {
      font: font.mono,
      size: 18,
      color: VERTICAL,
      align: 'center',
      alpha: seg(t, 4, 5),
    });
    text(ctx, 'one run with a freely turning rotor · L = 0 throughout · outline: the start', 400, 800, { ...type.note, size: 14, align: 'center', alpha: seg(t, 4, 5) });

    drawChart(ctx, t, rms, i);

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 240) => wrap(ctx, s, RIGHT, y, 660, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Let the shape jitter at random, the way thermal noise would, but with zero angular momentum: no torque at all.', 0.8, 12);
    note('Small vibrations around one shape: the orientation jitters but stays put. The little loops turn it left and right, and the drift is tiny.', 12.4, 24);
    note('A freely turning rotor wanders all the way round, and every net turn rotates the molecule by the holonomy of the rotor’s loop: a random walk of the orientation.', 24.4, 50);
    CONFINED.draw(ctx, RIGHT, 760, { size: 28, alpha: seg(t, 38, 39) });
    text(ctx, 'confined noise in the plane model: curvature λ, shape diffusion D, spread σ²', RIGHT, 798, { ...type.note, size: 14, alpha: seg(t, 38.6, 39.6) });
    text(ctx, 'rotation at L = 0 from internal noise: Katz & Efrati, PRL 2019; Silva & Efrati 2025', RIGHT, 860, { ...type.note, size: 14, alpha: seg(t, 41, 42) });
  },
});

/** rms rotation angle of 40 runs against time, for both kinds of noise. */
function drawChart(ctx, t, rms, i) {
  const a = seg(t, 3, 4);
  if (a <= 0) return;
  const box = { x: RIGHT + 30, y: 380, w: 600, h: 300 };
  const X = (k) => box.x + (k / STEPS) * box.w;
  const Y = (deg) => box.y + box.h - (deg / 100) * box.h;
  ctx.save();
  ctx.globalAlpha = a;
  line(ctx, box.x, box.y + box.h, box.x + box.w, box.y + box.h, { color: color.ink, width: 1.5 });
  line(ctx, box.x, box.y, box.x, box.y + box.h, { color: color.ink, width: 1.5 });
  for (const deg of [0, 25, 50, 75, 100]) text(ctx, `${deg}°`, box.x - 10, Y(deg), { ...type.note, size: 13, align: 'right', baseline: 'middle' });
  for (const s of [0, 10, 20, 30, 40]) text(ctx, String(s), X((s / T) * STEPS), box.y + box.h + 22, { ...type.note, size: 13, align: 'center' });
  text(ctx, 'time (relaxation times of the bend)', box.x + box.w, box.y + box.h + 46, { ...type.note, size: 13, align: 'right' });
  text(ctx, 'rms rotation of 40 molecules', box.x, box.y - 16, { ...type.note });
  Object.entries(CASES).forEach(([key, c], k) => {
    const show = key === 'vibrations' ? seg(t, 12.4, 13.4) : seg(t, 24.4, 25.4);
    ctx.strokeStyle = c.tint;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = a * show;
    ctx.beginPath();
    for (let j = 0; j <= i; j += 4) (j ? ctx.lineTo(X(j), Y(rms[key][j])) : ctx.moveTo(X(j), Y(rms[key][j])));
    ctx.stroke();
    ctx.globalAlpha = a;
    line(ctx, box.x + 24, box.y + 18 + 24 * k, box.x + 52, box.y + 18 + 24 * k, { color: c.tint, width: 2.5, alpha: show });
    text(ctx, c.label, box.x + 62, box.y + 23 + 24 * k, { ...type.note, size: 14, color: c.tint, alpha: show });
  });
  ctx.restore();
}
