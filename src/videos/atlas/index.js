// Atlas — why one chart is not enough. Prototype of a playable video:
// scene 01 is a live scene whose controls the viewer can take over.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import flow from './scenes/01-flow.js';

const scenes = [title, flow];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 3,
};
