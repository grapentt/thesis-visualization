// The geometry of attention — the score as a tensor, position as a connection, softmax as a
// Legendre map, and depth as a flow. The edit: which scenes play, in which order.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import roadmap from './scenes/01-roadmap.js';
import bilinear from './scenes/02-bilinear-form.js';
import pullback from './scenes/03-pullback.js';
import position from './scenes/04-position.js';
import family from './scenes/05-exponential-family.js';
import legendre from './scenes/06-legendre.js';
import fisher from './scenes/07-fisher.js';
import simplex from './scenes/08-simplex.js';
import entmax from './scenes/09-entmax.js';
import sphere from './scenes/10-sphere.js';
import hopfield from './scenes/11-hopfield.js';
import flow from './scenes/12-flow.js';
import summary from './scenes/13-summary.js';

const scenes = [title, roadmap, bilinear, pullback, position, family, legendre, fisher, simplex, entmax, sphere, hopfield, flow, summary];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 3,
};
