// A video is an ordered list of scenes. The timeline places them end to end,
// finds the scene for any global time, and takes care of what every scene
// shares: background, the header block, and the dip-to-dark between scenes.

import { seg, fade } from './timing.js';
import { checkControls, inputsAt } from './controls.js';
import { LiveView, STILL } from './live.js';
import { Track } from './simulation.js';
import { rgba } from '../draw/color.js';
import { color, type } from '../draw/theme.js';
import { text } from '../draw/text.js';
import { sceneHeader } from '../draw/widgets.js';

/** All drawing happens in these stage units; the canvas scales them to its pixel size. */
export const STAGE = Object.freeze({ width: 1600, height: 900 });

const FADE_IN = 0.6;
const FADE_OUT = 0.45;

/**
 * @typedef {object} SceneSpec
 * @property {string} name                 Chapter label in the player.
 * @property {number} duration             Length in seconds.
 * @property {(ctx: CanvasRenderingContext2D, t: number, live: object) => void} draw
 *           Draws the frame at local time t (0 … duration) in stage units. A live scene reads
 *           live.input (control values) and live.state (its simulation at t).
 * @property {string | [number, string][]} [narration]  Script line shown under the stage, or
 *                                         [time, text] cues for a long scene.
 * @property {{eyebrow: string, title: string}} [header]  Drawn and faded automatically.
 * @property {boolean} [continues]         Flow straight on from the previous scene
 *                                         instead of dipping to dark between them.
 *
 * Live scenes (see docs/interactive-video.md) also declare:
 * @property {object} [controls]           { name: slider(…) | choice(…) | drag(…) } from engine/controls.js.
 * @property {object} [sim]                A simulation(…) from engine/simulation.js.
 * @property {[number, string][]} [beats]  Named moments, listed as sub-chapters.
 * @property {{at: number, prompt: string}[]} [handovers]  Invitations to take over the controls.
 * @property {number} [exploreFrom]        Earliest local time explore mode starts from (once the
 *                                         scene's content has faded in).
 */

/** Validate a scene definition and fill in defaults. */
export function defineScene(spec) {
  const fail = (why) => {
    throw new Error(`Scene "${spec.name ?? '(unnamed)'}" ${why}`);
  };
  if (!spec.name || !(spec.duration > 0) || typeof spec.draw !== 'function') fail('needs a name, a positive duration and draw(ctx, t).');
  const inScene = (time) => time >= 0 && time < spec.duration;
  const ordered = (times) => times.every((time, i) => inScene(time) && (i === 0 || time > times[i - 1]));
  if (Array.isArray(spec.narration) && !(spec.narration[0]?.[0] === 0 && ordered(spec.narration.map(([time]) => time)))) {
    fail('needs narration cues in order, the first at 0 s.');
  }
  if (!ordered((spec.beats ?? []).map(([time]) => time))) fail('has beats outside the scene or out of order.');
  if (!(spec.handovers ?? []).every(({ at }) => inScene(at))) fail('has a hand-over outside the scene.');

  const controls = spec.controls ? Object.freeze({ ...spec.controls }) : null;
  const sim = spec.sim ?? null;
  const live = Boolean(controls || sim);
  if (!live && (spec.handovers?.length || spec.exploreFrom)) fail('has hand-overs or exploreFrom but no controls.');
  const levers = live ? checkControls(controls ?? {}, sim?.uses ?? [], spec.name) : [];
  return Object.freeze({
    narration: '',
    header: null,
    continues: false,
    beats: [],
    handovers: [],
    exploreFrom: 0,
    ...spec,
    controls,
    sim,
    live,
    levers,
    // the authored run of the simulation, with snapshots shared by every viewer
    track: sim ? new Track(sim, (t) => inputsAt(controls, t)) : null,
  });
}

/** The narration line of a scene at local time t, and which cue it is. */
export function narrationAt(scene, t) {
  if (!Array.isArray(scene.narration)) return { text: scene.narration, cue: 0 };
  let cue = 0;
  while (cue < scene.narration.length - 1 && t >= scene.narration[cue + 1][0]) cue++;
  return { text: scene.narration[cue][1], cue };
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
    /** Used when render() is called without a view: the authored version, always fully computed. */
    this.view = new LiveView();
  }

  indexAt(T) {
    let i = 0;
    while (i < this.scenes.length - 1 && T >= this.scenes[i].start + this.scenes[i].duration) i++;
    return i;
  }

  sceneAt(T) {
    return this.scenes[this.indexAt(T)];
  }

  /**
   * Draw the frame at global time T as `view` sees it (a LiveView; default: the authored version).
   * Expects ctx scaled to stage units. Returns what the scene resolved: { input, state, pending, exploring }.
   */
  render(ctx, T, view = this.view) {
    const i = this.indexAt(T);
    const scene = this.scenes[i];
    const next = this.scenes[i + 1];
    const t = T - scene.start;
    const joinsPrevious = i > 0 && scene.continues;
    const joinsNext = Boolean(next?.continues);
    let live = STILL;
    try {
      live = view.resolve(scene, t);
    } catch (err) {
      console.error(`Scene "${scene.name}": simulating t = ${t.toFixed(2)} s failed`, err);
    }

    this.background?.(ctx);

    if (scene.header) {
      let alpha = joinsNext
        ? fade(t, 0.1, 0.9, scene.duration - 0.7, scene.duration - 0.1)
        : seg(t, 0.1, 0.9);
      if (live.exploring) alpha = 1;
      sceneHeader(ctx, scene.header, alpha);
    }

    ctx.save();
    try {
      scene.draw(ctx, t, live);
    } catch (err) {
      console.error(`Scene "${scene.name}" failed at t = ${t.toFixed(2)} s`, err);
    }
    ctx.restore();

    if (live.pending) text(ctx, 'computing the simulation …', STAGE.width - 40, STAGE.height - 30, { ...type.note, align: 'right' });

    const dipIn = i > 0 && !joinsPrevious ? 1 - seg(t, 0, FADE_IN) : 0;
    const dipOut = next && !joinsNext ? seg(t, scene.duration - FADE_OUT, scene.duration) : 0;
    const dip = live.exploring ? 0 : Math.max(dipIn, dipOut);
    if (dip > 0) {
      ctx.fillStyle = rgba(color.bg, dip);
      ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    }
    return live;
  }
}
