// All random quantities, drawn once from one seeded generator.
// Keep the draw order stable: adding a draw in the middle changes everything after it.

import { createRng } from '../engine/random.js';
import { sigma } from './physics.js';

const rng = createRng(11);

/** 400 samples of (s, q) with noise draws e1, e2 and a jitter for strip plots. */
export const dataset = Array.from({ length: 400 }, () => ({
  s: sigma.soft * rng.gauss(),
  q: sigma.stiff * rng.gauss(),
  e1: rng.gauss(),
  e2: rng.gauss(),
  jitter: rng.uniform(),
}));
// Hand-picked values for the samples that are stepped through one by one.
[-1.1, 0.45, 1.25, -0.35, 0.85, -0.7].forEach((v, i) => (dataset[i].s = v));
[0.04, -0.03, 0.055, -0.018].forEach((v, i) => (dataset[i].q = v));

// ---- Brownian paths, one per coordinate (15 = 3N)
const DT = 1 / 40;
const STEPS = 440;
/** Diffusion constant (Å²/s) of the forward-noise animation. */
export const BROWNIAN_D = 0.0104;
const paths = Array.from({ length: 15 }, () => {
  const w = new Float32Array(STEPS + 1);
  for (let n = 1; n <= STEPS; n++) w[n] = w[n - 1] + rng.gauss() * Math.sqrt(DT);
  return w;
});

/** Brownian displacement of coordinate j after t seconds (linear interpolation of the path). */
export function brownian(j, t) {
  const x = t / DT;
  const n = Math.min(STEPS - 1, Math.floor(x));
  const f = Math.min(1, x - n);
  return Math.sqrt(BROWNIAN_D) * (paths[j][n] * (1 - f) + paths[j][n + 1] * f);
}

// ---- Thermal vibration: a few incommensurate sines per coordinate
const phases = Array.from({ length: 15 }, () => [rng.uniform() * 6.28, rng.uniform() * 6.28, rng.uniform() * 6.28]);

export function vibration(j, t) {
  const p = phases[j];
  const amplitude = j >= 12 ? 0.05 : 0.028; // the hydrogen moves more
  return (amplitude * (Math.sin(9.1 * t + p[0]) + Math.sin(13.7 * t + p[1]) + 0.7 * Math.sin(6.3 * t + p[2]))) / 1.8;
}

// ---- A generic direction in R^15 with visible x1, y3, z5 components
export const randomDirection = (() => {
  const v = Array.from({ length: 15 }, () => (rng.uniform() - 0.5) * 0.3);
  v[0] = 0.45;
  v[7] = 0.42;
  v[14] = -0.45;
  const norm = Math.hypot(...v);
  return v.map((x) => x / norm);
})();
