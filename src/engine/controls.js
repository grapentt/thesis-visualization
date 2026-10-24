// Controls of a live scene. Each control has an authored value over time: a
// constant, or [time, value] keyframes. Numbers ease from one keyframe to the
// next like seg(), so a sudden change needs a holding keyframe just before it;
// choices switch at their keyframe. No DOM access.
//
// A lever changes the simulated physics (it is listed in the simulation's
// `uses`); touching one starts explore mode. A lens only changes the view.

import { lerp, seg } from './timing.js';

/** A number between min and max. */
export const slider = (label, { min, max, step = (max - min) / 100, value, lens = false, digits = 2 }) =>
  Object.freeze({ kind: 'slider', label, min, max, step, value, lens, digits });

/** One of several named options, e.g. choice('Walls', { keep: 'keep the rule', drop: 'drop the current' }, …). */
export const choice = (label, options, { value, lens = false }) =>
  Object.freeze({ kind: 'choice', label, options: Object.freeze({ ...options }), value, lens });

/**
 * Dragging inside a stage region ([x0, y0, x1, y1] in stage units). Always a lens; its value is the
 * accumulated drag offset [dx, dy] in stage units, authored as [0, 0].
 */
export const drag = (label, { region }) => Object.freeze({ kind: 'drag', label, region: Object.freeze([...region]), value: [0, 0], lens: true });

const isKeyframes = (control) => control.kind !== 'drag' && Array.isArray(control.value);

/** The authored value of one control at time t. */
export function valueAt(control, t) {
  if (!isKeyframes(control)) return control.value;
  const keys = control.value;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t < t1) {
      const [t0, v0] = keys[i - 1];
      return control.kind === 'slider' ? lerp(v0, v1, seg(t, t0, t1)) : v0;
    }
  }
  return keys[keys.length - 1][1];
}

/** Authored values of all controls at time t, as { name: value }. */
export function inputsAt(controls, t) {
  const input = {};
  for (const name in controls) input[name] = valueAt(controls[name], t);
  return input;
}

/** Check a scene's controls; returns the names of its levers. */
export function checkControls(controls, uses, sceneName) {
  const fail = (why) => {
    throw new Error(`Scene "${sceneName}": ${why}`);
  };
  for (const [name, c] of Object.entries(controls)) {
    if (!['slider', 'choice', 'drag'].includes(c?.kind)) fail(`control "${name}" is not a slider, choice or drag.`);
    if (c.value === undefined || (isKeyframes(c) && !c.value.length)) fail(`control "${name}" needs a value or keyframes.`);
    if (isKeyframes(c) && c.value.some((k, i) => i > 0 && !(k[0] > c.value[i - 1][0]))) fail(`keyframes of "${name}" must have increasing times.`);
    const values = isKeyframes(c) ? c.value.map(([, v]) => v) : [c.value];
    if (c.kind === 'choice' && !values.every((v) => v in c.options)) fail(`"${name}" has a value that is not one of its options.`);
    // a lever is exactly a control the simulation uses; everything else must be a lens
    if (uses.includes(name) && c.lens) fail(`"${name}" feeds the simulation, so it cannot be a lens.`);
    if (!uses.includes(name) && !c.lens) fail(`"${name}" is not used by the simulation, so it must be a lens.`);
  }
  for (const name of uses) if (!controls[name]) fail(`the simulation uses "${name}", which is not a control.`);
  return uses.slice();
}
