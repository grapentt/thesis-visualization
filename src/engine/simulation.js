// Seeded, fixed-step simulations that a live scene can seek like time.
// The state after n steps depends only on the seed and on the inputs of steps
// 0 … n−1, so any moment can be recomputed exactly: from the start, or from a
// saved snapshot. No DOM access, so models built on this run in Node tests.
//
// One step, from step index n to n + 1 (simulated time n·dt to (n + 1)·dt):
//   1. events scheduled at step n change the state;
//   2. step(state, input(n·dt), rng, dt) advances it;
//   3. after every `tick` of simulated time, onTick(state, tick) updates statistics;
//   4. every `snapshotEvery` of simulated time, a cursor on a track saves the state.

import { createRng } from './random.js';

/**
 * Validate a simulation and precompute its step counts.
 * @param {{ seed: number, dt: number, tick?: number, snapshotEvery?: number, uses?: string[],
 *           init: (rng) => object, step: (state, input, rng, dt) => void,
 *           onTick?: (state, tick) => void, events?: [number, (state) => void][] }} spec
 *   uses: names of the controls the physics reads; other controls never re-simulate.
 *   events: [time, fn] pairs, applied before the step at that time.
 */
export function simulation({ seed, dt, tick = dt, snapshotEvery = 0.5, uses = [], init, step, onTick = () => {}, events = [] }) {
  const stepsPerTick = Math.round(tick / dt);
  const stepsPerSnapshot = Math.round(snapshotEvery / dt);
  if (!(dt > 0) || stepsPerTick < 1 || Math.abs(stepsPerTick * dt - tick) > 1e-9 || stepsPerSnapshot < stepsPerTick || stepsPerSnapshot % stepsPerTick) {
    throw new Error('simulation: tick must be a whole number of steps, and snapshotEvery a whole number of ticks.');
  }
  if (typeof init !== 'function' || typeof step !== 'function') throw new Error('simulation: needs init(rng) and step(state, input, rng, dt).');
  const eventsAt = new Map();
  for (const [time, fn] of events) {
    const n = Math.round(time / dt);
    eventsAt.set(n, [...(eventsAt.get(n) ?? []), fn]);
  }
  return Object.freeze({ seed, dt, tick, stepsPerTick, stepsPerSnapshot, uses: Object.freeze([...uses]), init, step, onTick, eventsAt });
}

/** The one rule that maps simulated time to a step index. */
export const stepAt = (spec, t) => Math.max(0, Math.floor(t / spec.dt + 1e-6));

/** Deep copy of a state made of typed arrays, arrays, plain objects and primitives. */
export function cloneState(value) {
  if (ArrayBuffer.isView(value)) return value.slice();
  if (Array.isArray(value)) return value.map(cloneState);
  if (value && typeof value === 'object') {
    const copy = {};
    for (const key of Object.keys(value)) copy[key] = cloneState(value[key]);
    return copy;
  }
  return value;
}

/** Snapshots of one input history, appended in order and shared by every cursor on it. */
export class Track {
  /** @param {(t: number) => object} inputAt  inputs at simulated time t */
  constructor(spec, inputAt) {
    this.spec = spec;
    this.inputAt = inputAt;
    this.snapshots = [];
  }

  clear() {
    this.snapshots.length = 0;
  }

  /** Last step with a saved snapshot, or −1. */
  get computed() {
    return this.snapshots.length ? this.snapshots[this.snapshots.length - 1].n : -1;
  }

  /** The latest snapshot at or before step n, or null. */
  snapshotBefore(n) {
    const i = Math.min(this.snapshots.length - 1, Math.floor(n / this.spec.stepsPerSnapshot));
    return i >= 0 ? this.snapshots[i] : null;
  }

  cursor() {
    return new Cursor(this.spec, this.inputAt, this);
  }
}

/** One position in a simulation with its own state buffers. */
export class Cursor {
  constructor(spec, inputAt, track = null, from = null) {
    this.spec = spec;
    this.inputAt = inputAt;
    this.track = track;
    this.rng = createRng(spec.seed);
    if (from) this.#restore(from);
    else this.#start();
  }

  /**
   * Move to step n: restore the nearest earlier snapshot when that is shorter, then step.
   * Stops once `deadline` (a performance.now() time) has passed; returns whether n was reached.
   */
  seek(n, deadline = Infinity) {
    const snapshot = this.track?.snapshotBefore(n);
    if (snapshot && (n < this.n || snapshot.n > this.n)) this.#restore(snapshot);
    else if (n < this.n) this.#start();
    return this.advanceTo(n, deadline);
  }

  /** Step forward to step n (never backward); see seek for the deadline. */
  advanceTo(n, deadline = Infinity) {
    while (this.n < n) {
      this.#step();
      if (this.n % this.spec.stepsPerTick === 0 && performance.now() > deadline) return this.n >= n;
    }
    return true;
  }

  snapshot() {
    return { n: this.n, state: cloneState(this.state), rng: this.rng.getState() };
  }

  /** An independent copy that continues from here under other inputs (explore mode). */
  fork(inputAt) {
    return new Cursor(this.spec, inputAt, null, this.snapshot());
  }

  #step() {
    const { spec, state } = this;
    const events = spec.eventsAt.get(this.n);
    if (events) for (const fn of events) fn(state);
    spec.step(state, this.inputAt(this.n * spec.dt), this.rng, spec.dt);
    this.n += 1;
    if (this.n % spec.stepsPerTick === 0) spec.onTick(state, spec.tick);
    if (this.n % spec.stepsPerSnapshot === 0) this.#record();
  }

  #start() {
    this.rng.setState(this.spec.seed);
    this.n = 0;
    this.state = this.spec.init(this.rng);
    this.#record();
  }

  /** Append to the track only when this is its next snapshot, so the track stays contiguous. */
  #record() {
    const { track } = this;
    if (track && track.snapshots.length * this.spec.stepsPerSnapshot === this.n) track.snapshots.push(this.snapshot());
  }

  #restore({ n, state, rng }) {
    this.n = n;
    this.state = cloneState(state);
    this.rng.setState(rng);
  }
}
