// Helpers for playable scenes whose frame is a pure function of time and inputs (promoted by copy
// from the u1-force side video, private/other/u1-force/shared.js on its branch).

import { simulation } from '../../engine/simulation.js';
import { lin } from '../../engine/timing.js';

/**
 * A simulation with no state, so that controls can be levers (touching one pauses the narration and
 * starts explore mode) in a scene whose frame is a pure function of its inputs.
 */
export const leverSim = (uses) => simulation({ seed: 1, dt: 0.5, snapshotEvery: 0.5, uses, init: () => ({}), step: () => {} });

/**
 * The scene's clock for its content: while the viewer explores a live scene, everything the controls
 * affect should be visible, so the clock jumps to `at` (by when all of it has appeared) if earlier.
 */
export const clock = (t, live, at) => (live?.exploring ? Math.max(t, at) : t);

/** Eased keyframes: [time, value] pairs, eased between keys. */
export const track = (t, keys, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [t1, v1] = keys[k];
    if (t <= t1) return keys[k - 1][1] + (v1 - keys[k - 1][1]) * ease(lin(t, keys[k - 1][0], t1));
  }
  return keys[keys.length - 1][1];
};
