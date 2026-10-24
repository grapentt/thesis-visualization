// The torus flow of explorables/torus-flow.html as a seeded, fixed-step model.
// Particles on the torus, in angle coordinates (θ, φ), follow
//   dx = (D ∇log p + J/p) dt + √(2D) dW,   J = (j, j),
// which keeps the density p fixed while the cloud circulates around both cycles.
// Two clouds start from one sample of p. On the glued square a particle leaving one
// edge re-enters at the opposite one; on the walled square it is reflected, and the
// current is kept or dropped.
//
// A line-by-line port of the page with three deliberate changes: the noise comes from
// the seeded generator passed in, the step is a fixed 1/300 s (the page's 5 substeps of
// a 60 fps frame), and the page's per-frame bookkeeping runs on a fixed 1/60 s tick.
// DOM-free, so it runs in Node tests.
//
// State (typed arrays and numbers only, so snapshots are cheap and exact):
//   { time, ticks, glued: Cloud, walled: Cloud, spark, sparkHead, sparkCount }
//   Cloud = { x, y (θ, φ in [0, 2π]), hist, tv, rate, cross,
//             trail, trailHead, trailCount, events, eventHead, eventCount }
// Rings: `head` is the next slot to write, `count` the number of valid slots; the oldest
// valid slot is (head − count + capacity) % capacity. Trail slot s holds tracer i at
// [(s·NT + i)·2, +1]; event e is [x0, y0, x1, y1, time] (unwrapped → wrapped point);
// sparkline slot s holds [glued TV, walled TV] at [2s, 2s + 1].

import { simulation } from '../../engine/simulation.js';

export const TAU = 2 * Math.PI;

/** Particles per cloud; particles 0 … NT − 1 are the tracers. */
export const N = 3000;
export const NT = 14;
/** Tracer positions kept, one per tick (2.5 s). */
export const TRAIL = 150;
/** Histogram bins per axis. */
export const B = 24;
/** Sparkline samples, one per SPARK_EVERY ticks (30 s). */
export const SPARK = 600;
/** Seconds a teleport marker lives. */
export const EVENT_LIFE = 1.1;
/** Teleport ring size. Up to 155 markers were measured alive at once (60 s runs, seeds 1–5, D ≤ 0.6,
 *  j ≤ 1.2; 86 at the page's defaults); 256 leaves headroom but is not a proven bound. */
export const EVENTS = 256;

const DT = 1 / 300;
const TICK = 1 / 60;
const SPARK_EVERY = 3;
const EVENT_SIZE = 5;
const HIST_GAIN = 0.04; // histogram EMA, per tick
const RATE_KEEP = 0.985; // lap-rate EMA, per tick
const RATE_GAIN = 0.015;
const MAX_BOUNCES = 8;

// ---------- density ----------

export const K = 1.25;
export const L = 0.6;
export const PH = Math.PI / 3;
export const TH0 = 2;

/** Unnormalised log density. */
export const logp = (t, f) => K * Math.cos(f - t - PH) + L * Math.cos(t - TH0);

/** Normaliser: the mean of exp(logp) over the square on a 256² midpoint grid (≈ 1.5621367). */
export const A = (() => {
  const G = 256;
  let sum = 0;
  for (let i = 0; i < G; i++) for (let k = 0; k < G; k++) sum += Math.exp(logp(((i + 0.5) / G) * TAU, ((k + 0.5) / G) * TAU));
  return sum / (G * G);
})();

/** Density relative to uniform: mean 1 over the square. */
export const ptil = (t, f) => Math.exp(logp(t, f)) / A;
export const PMAX = Math.exp(K + L) / A;

/** Target bin probabilities from 6 × 6 sub-samples per bin; index i·B + k for θ bin i and φ bin k. */
export const Q = (() => {
  const S = 6;
  const q = new Float64Array(B * B);
  for (let i = 0; i < B; i++) {
    for (let k = 0; k < B; k++) {
      let s = 0;
      for (let a = 0; a < S; a++) {
        for (let b = 0; b < S; b++) s += ptil(((i + (a + 0.5) / S) / B) * TAU, ((k + (b + 0.5) / S) / B) * TAU);
      }
      q[i * B + k] = s / (S * S) / (B * B);
    }
  }
  return q;
})();

// ---------- edges ----------

const wrap = (v) => v - TAU * Math.floor(v / TAU);

/** Reflect at both walls into [0, 2π]; after MAX_BOUNCES bounces, clamp. */
function reflect(v) {
  let n = 0;
  while ((v < 0 || v > TAU) && n++ < MAX_BOUNCES) {
    if (v < 0) v = -v;
    if (v > TAU) v = 2 * TAU - v;
  }
  return Math.min(TAU, Math.max(0, v));
}

// ---------- clouds ----------

function makeCloud() {
  return {
    x: new Float64Array(N),
    y: new Float64Array(N),
    hist: new Float64Array(B * B),
    tv: 0,
    rate: 0,
    cross: 0,
    trail: new Float64Array(TRAIL * NT * 2),
    trailHead: 0,
    trailCount: 0,
    events: new Float64Array(EVENTS * EVENT_SIZE),
    eventHead: 0,
    eventCount: 0,
  };
}

function pushTrail(cloud) {
  const o = cloud.trailHead * NT * 2;
  for (let i = 0; i < NT; i++) {
    cloud.trail[o + 2 * i] = cloud.x[i];
    cloud.trail[o + 2 * i + 1] = cloud.y[i];
  }
  cloud.trailHead = (cloud.trailHead + 1) % TRAIL;
  cloud.trailCount = Math.min(TRAIL, cloud.trailCount + 1);
}

function pushEvent(cloud, x0, y0, x1, y1, time) {
  const e = cloud.events;
  const o = cloud.eventHead * EVENT_SIZE;
  e[o] = x0;
  e[o + 1] = y0;
  e[o + 2] = x1;
  e[o + 3] = y1;
  e[o + 4] = time;
  cloud.eventHead = (cloud.eventHead + 1) % EVENTS;
  cloud.eventCount = Math.min(EVENTS, cloud.eventCount + 1);
}

/** Restart a cloud's statistics at its current positions, as the page's resample does. */
function restart(cloud) {
  cloud.hist.set(Q);
  cloud.tv = 0;
  cloud.rate = 0;
  cloud.cross = 0;
  cloud.trailHead = 0;
  cloud.trailCount = 0;
  pushTrail(cloud);
  cloud.eventHead = 0;
  cloud.eventCount = 0;
}

/** Both clouds from one rejection sample of p. */
export function createFlow(rng) {
  const glued = makeCloud();
  const walled = makeCloud();
  for (let i = 0; i < N; i++) {
    let t, f;
    do {
      t = rng.uniform() * TAU;
      f = rng.uniform() * TAU;
    } while (rng.uniform() * PMAX > ptil(t, f));
    glued.x[i] = walled.x[i] = t;
    glued.y[i] = walled.y[i] = f;
  }
  restart(glued);
  restart(walled);
  return { time: 0, ticks: 0, glued, walled, spark: new Float64Array(2 * SPARK), sparkHead: 0, sparkCount: 0 };
}

/**
 * One Euler–Maruyama step of one cloud, drawing the noise for θ then φ per particle.
 * Net crossings of the meridian θ = π, from the position before wrapping or reflecting,
 * add to cloud.cross. Glued: wrap, and log tracer teleports at `time`. Walled: reflect.
 */
function stepCloud(cloud, glued, useJ, { D, j }, rng, dt, time) {
  const { x, y } = cloud;
  const sq = Math.sqrt(2 * D * dt);
  let cross = 0;
  for (let i = 0; i < N; i++) {
    const t = x[i];
    const f = y[i];
    const c = Math.cos(f - t - PH);
    const s = Math.sin(f - t - PH);
    const pt = Math.exp(K * c + L * Math.cos(t - TH0)) / A;
    const gt = K * s - L * Math.sin(t - TH0); // ∇log p
    const gf = -K * s;
    const jv = useJ ? j / pt : 0; // J/p
    const nt = t + (D * gt + jv) * dt + sq * rng.gauss();
    const nf = f + (D * gf + jv) * dt + sq * rng.gauss();
    if (t < Math.PI && nt >= Math.PI) cross++;
    else if (t >= Math.PI && nt < Math.PI) cross--;
    if (glued) {
      const wt = wrap(nt);
      const wf = wrap(nf);
      if (i < NT && (wt !== nt || wf !== nf)) pushEvent(cloud, nt, nf, wt, wf, time);
      x[i] = wt;
      y[i] = wf;
    } else {
      x[i] = reflect(nt);
      y[i] = reflect(nf);
    }
  }
  cloud.cross += cross;
}

/**
 * One step of both clouds, glued first. The glued cloud always carries the current;
 * the walled one only while walls === 'keep'. Time advances first, so teleports carry the
 * time at the end of the step, as on the page.
 * @param {{ D: number, j: number, walls: 'keep' | 'drop' }} input
 */
export function stepFlow(state, input, rng, dt) {
  state.time += dt;
  stepCloud(state.glued, true, true, input, rng, dt, state.time);
  stepCloud(state.walled, false, input.walls === 'keep', input, rng, dt, state.time);
}

const binCount = new Float64Array(B * B);

/** Smoothed histogram, its TV distance to Q, smoothed lap rate, trail. */
function cloudStats(cloud, tick) {
  const { x, y, hist } = cloud;
  binCount.fill(0);
  for (let i = 0; i < N; i++) {
    const bi = Math.min(B - 1, Math.floor((x[i] / TAU) * B));
    const bk = Math.min(B - 1, Math.floor((y[i] / TAU) * B));
    binCount[bi * B + bk]++;
  }
  let tv = 0;
  for (let q = 0; q < B * B; q++) {
    hist[q] = (1 - HIST_GAIN) * hist[q] + (HIST_GAIN * binCount[q]) / N;
    tv += Math.abs(hist[q] - Q[q]);
  }
  cloud.tv = tv / 2;
  cloud.rate = cloud.rate * RATE_KEEP + (cloud.cross / N / tick) * RATE_GAIN;
  cloud.cross = 0;
  pushTrail(cloud);
}

/** The page's per-frame statistics, once per tick: both clouds, then the sparkline every SPARK_EVERY ticks. */
export function updateStats(state, tick) {
  cloudStats(state.glued, tick);
  cloudStats(state.walled, tick);
  if (state.ticks % SPARK_EVERY === 0) {
    state.spark[2 * state.sparkHead] = state.glued.tv;
    state.spark[2 * state.sparkHead + 1] = state.walled.tv;
    state.sparkHead = (state.sparkHead + 1) % SPARK;
    state.sparkCount = Math.min(SPARK, state.sparkCount + 1);
  }
  state.ticks += 1;
}

/** dst takes src's positions and restarts its statistics (a scene event: restart the walled cloud from the glued one). */
export function copyCloud(src, dst) {
  dst.x.set(src.x);
  dst.y.set(src.y);
  restart(dst);
}

/** Restart the walled cloud from the glued one and forget its sparkline history, which nobody saw. */
export function restartWalled(state) {
  copyCloud(state.glued, state.walled);
  for (let s = 1; s < state.spark.length; s += 2) state.spark[s] = NaN;
}

/** The seekable simulation of both clouds; `events` are [time, (state) => void] pairs. */
export function flowSimulation({ seed = 5, events = [] } = {}) {
  return simulation({
    seed,
    dt: DT,
    tick: TICK,
    snapshotEvery: 0.5,
    uses: ['D', 'j', 'walls'],
    init: createFlow,
    step: stepFlow,
    onTick: updateStats,
    events,
  });
}
