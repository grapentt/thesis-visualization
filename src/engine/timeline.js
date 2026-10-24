// A video is an ordered list of scenes. The timeline places them end to end,
// finds the scene for any global time, and takes care of what every scene
// shares: background, the header block, and the dip-to-dark between scenes.

import { seg, fade } from './timing.js';
import { rgba } from '../draw/color.js';
import { color } from '../draw/theme.js';
import { sceneHeader } from '../draw/widgets.js';

/** All drawing happens in these stage units; the canvas scales them to its pixel size. */
export const STAGE = Object.freeze({ width: 1600, height: 900 });

const FADE_IN = 0.6;
const FADE_OUT = 0.45;

/**
 * @typedef {object} SceneSpec
 * @property {string} name                 Chapter label in the player.
 * @property {number} duration             Length in seconds.
 * @property {(ctx: CanvasRenderingContext2D, t: number, scene: object) => void} draw
 *           Draws the frame at local time t (0 … duration) in stage units.
 * @property {string} [narration]          Script line shown under the stage.
 * @property {{eyebrow: string, title: string}} [header]  Drawn and faded automatically.
 * @property {boolean} [continues]         Flow straight on from the previous scene
 *                                         instead of dipping to dark between them.
 */

/** Validate a scene definition and fill in defaults. */
export function defineScene(spec) {
  if (!spec.name || !(spec.duration > 0) || typeof spec.draw !== 'function') {
    throw new Error(`Scene "${spec.name ?? '(unnamed)'}" needs a name, a positive duration and draw(ctx, t).`);
  }
  return Object.freeze({ narration: '', header: null, continues: false, ...spec });
}

export class Timeline {
  /**
   * @param {ReturnType<typeof defineScene>[]} scenes
   * @param {{ background?: (ctx: CanvasRenderingContext2D) => void }} [options]
   */
  constructor(scenes, { background } = {}) {
    let start = 0;
    this.scenes = scenes.map((scene, index) => {
      const entry = Object.freeze({ ...scene, index, start });
      start += scene.duration;
      return entry;
    });
    this.duration = start;
    this.background = background;
  }

  indexAt(T) {
    let i = 0;
    while (i < this.scenes.length - 1 && T >= this.scenes[i].start + this.scenes[i].duration) i++;
    return i;
  }

  sceneAt(T) {
    return this.scenes[this.indexAt(T)];
  }

  /** Draw the frame at global time T. Expects ctx scaled to stage units. */
  render(ctx, T) {
    const i = this.indexAt(T);
    const scene = this.scenes[i];
    const next = this.scenes[i + 1];
    const t = T - scene.start;
    const joinsPrevious = i > 0 && scene.continues;
    const joinsNext = Boolean(next?.continues);

    this.background?.(ctx);

    if (scene.header) {
      const alpha = joinsNext
        ? fade(t, 0.1, 0.9, scene.duration - 0.7, scene.duration - 0.1)
        : seg(t, 0.1, 0.9);
      sceneHeader(ctx, scene.header, alpha);
    }

    ctx.save();
    try {
      scene.draw(ctx, t, scene);
    } catch (err) {
      console.error(`Scene "${scene.name}" failed at t = ${t.toFixed(2)} s`, err);
    }
    ctx.restore();

    const dipIn = i > 0 && !joinsPrevious ? 1 - seg(t, 0, FADE_IN) : 0;
    const dipOut = next && !joinsNext ? seg(t, scene.duration - FADE_OUT, scene.duration) : 0;
    const dip = Math.max(dipIn, dipOut);
    if (dip > 0) {
      ctx.fillStyle = rgba(color.bg, dip);
      ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    }
  }
}
