// What one client sees of the live scenes: the player, the export API and the
// tests each get their own LiveView, with their own simulation cursors, while
// the snapshots of the authored run are shared through each scene's track.
// A LiveView also holds the viewer's lens settings and explore mode.

import { inputsAt } from './controls.js';
import { stepAt, Track } from './simulation.js';

/** What a scene without controls or simulation resolves to. */
export const STILL = Object.freeze({ input: Object.freeze({}), state: null, pending: false, exploring: false });

export class LiveView {
  /**
   * @param {{ budgetMs?: number, levers?: object, lenses?: object }} [options]
   *   budgetMs: time per frame for catching a simulation up (Infinity: always compute to the end).
   *   levers, lenses: fixed values for every live scene, i.e. another input history (used by tests).
   */
  constructor({ budgetMs = Infinity, levers = null, lenses = null } = {}) {
    this.budgetMs = budgetMs;
    this.levers = levers;
    this.fixedLenses = lenses;
    this.cursors = new Map(); // scene index → cursor
    this.lenses = new Map(); // scene index → { name: value } set by the viewer
    this.explore = null;
  }

  /**
   * Inputs and simulation state of a scene at local time t, and whether the state is still
   * catching up (`pending`; then `state` is the latest computed one).
   */
  resolve(scene, t) {
    if (!scene.live) return STILL;
    const ex = this.explore;
    if (ex?.scene === scene) {
      const forked = this.#fork(ex);
      const state = forked ? ex.cursor.state : this.cursors.get(scene.index)?.state ?? null;
      return { input: this.#withLenses(scene, ex.input), state, pending: !forked, exploring: true };
    }
    const input = this.#withLenses(scene, { ...inputsAt(scene.controls, t), ...this.#levers(scene) });
    if (!scene.sim) return { input, state: null, pending: false, exploring: false };
    const cursor = this.#cursor(scene);
    const reached = cursor.seek(stepAt(scene.sim, t), this.#deadline(cursor, stepAt(scene.sim, t)));
    return { input, state: cursor.state, pending: !reached, exploring: false };
  }

  // ---- explore mode ------------------------------------------------------

  /**
   * Branch off the authored run at local time t0; the narration stays frozen there. If the
   * authored run has not reached t0 yet, the branch starts once it has (pending until then).
   */
  startExplore(scene, t0) {
    this.explore = { scene, t0, input: { ...inputsAt(scene.controls, t0), ...this.#levers(scene) }, cursor: null, paused: false, carry: 0 };
  }

  setLever(name, value) {
    if (this.explore) this.explore.input = { ...this.explore.input, [name]: value };
  }

  /** Run the explore simulation on by `seconds` of real time; returns whether it moved. */
  stepExplore(seconds) {
    const ex = this.explore;
    if (!ex?.cursor || ex.paused) return false;
    ex.carry += Math.min(seconds, 0.1) / ex.scene.sim.dt;
    const steps = Math.floor(ex.carry);
    ex.carry -= steps;
    ex.cursor.advanceTo(ex.cursor.n + steps);
    return steps > 0;
  }

  stopExplore() {
    this.explore = null;
  }

  // ---- lenses ------------------------------------------------------------

  setLens(scene, name, value) {
    this.lenses.set(scene.index, { ...this.lenses.get(scene.index), [name]: value });
  }

  lens(scene, name) {
    return this.lenses.get(scene.index)?.[name];
  }

  resetLenses(scene) {
    this.lenses.delete(scene.index);
  }

  /** Forget cursors, lens settings and explore mode. */
  clear() {
    this.cursors.clear();
    this.lenses.clear();
    this.explore = null;
  }

  /** Start the explore branch once the authored run has reached t0, within this frame's budget. */
  #fork(ex) {
    if (ex.cursor || !ex.scene.sim) return true;
    const cursor = this.#cursor(ex.scene);
    const n = stepAt(ex.scene.sim, ex.t0);
    if (!cursor.seek(n, this.#deadline(cursor, n))) return false;
    ex.cursor = cursor.fork(() => ex.input);
    return true;
  }

  /**
   * When to stop catching up towards step n. Within one snapshot interval of the cursor or of a
   * saved snapshot the work is small (at most 0.5 s of simulation), so it always finishes.
   */
  #deadline(cursor, n) {
    if (this.budgetMs === Infinity) return Infinity;
    const every = cursor.spec.stepsPerSnapshot;
    const near = (n >= cursor.n && n - cursor.n <= every) || cursor.track?.computed >= n - (n % every);
    return near ? Infinity : performance.now() + this.budgetMs;
  }

  /** The fixed lever values that apply to this scene (only its own levers). */
  #levers(scene) {
    return pick(this.levers, (name) => scene.levers.includes(name));
  }

  /** Fixed and viewer lens values on top of `input` (only the scene's own lenses). */
  #withLenses(scene, input) {
    const isLens = (name) => scene.controls?.[name]?.lens === true;
    return { ...input, ...pick(this.fixedLenses, isLens), ...pick(this.lenses.get(scene.index), isLens) };
  }

  #cursor(scene) {
    let cursor = this.cursors.get(scene.index);
    if (!cursor) {
      const levers = this.#levers(scene);
      const track = Object.keys(levers).length
        ? new Track(scene.sim, (t) => ({ ...inputsAt(scene.controls, t), ...levers }))
        : scene.track;
      cursor = track.cursor();
      this.cursors.set(scene.index, cursor);
    }
    return cursor;
  }
}

/** The entries of `values` whose names pass `keep`. */
function pick(values, keep) {
  const out = {};
  for (const name in values) if (keep(name)) out[name] = values[name];
  return out;
}

/**
 * Compute the authored runs of all live scenes in the background, `sliceMs` at a time,
 * so that later seeks find their snapshots. While `busy()` is true (the player is itself
 * catching up, along the same snapshots) it waits rather than compute the same steps twice.
 * Returns a function that stops it.
 */
export function warmUp(scenes, { sliceMs = 6, busy = () => false } = {}) {
  const jobs = scenes.filter((s) => s.track).map((s) => ({ cursor: s.track.cursor(), end: stepAt(s.sim, s.duration) }));
  let stopped = false;
  const work = () => {
    const job = jobs.find((j) => j.cursor.n < j.end);
    if (stopped || !job) return;
    if (busy()) {
      setTimeout(work, 50);
      return;
    }
    try {
      job.cursor.seek(job.end, performance.now() + sliceMs);
    } catch (err) {
      console.error('Warming up a live scene failed', err);
      return;
    }
    setTimeout(work, 0);
  };
  setTimeout(work, 0);
  return () => {
    stopped = true;
  };
}
