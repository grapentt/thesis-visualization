// The geometry of information — distributions as points, distinguishability as distance, the
// Fisher metric and where it leads. The edit: which scenes play, in which order.

import meta from './meta.json' with { type: 'json' };
import { paced } from './shared.js';
import title from './scenes/00-title.js';
import points from './scenes/01-points.js';
import flips from './scenes/02-flips.js';
import distinguishability from './scenes/03-distinguishability.js';
import likelihood from './scenes/04-likelihood.js';
import fisher from './scenes/05-fisher.js';
import tensor from './scenes/06-tensor.js';
import sphere from './scenes/07-sphere.js';
import chentsov from './scenes/08-chentsov.js';
import gaussians from './scenes/09-gaussians.js';
import cramerRao from './scenes/10-cramer-rao.js';
import naturalGradient from './scenes/11-natural-gradient.js';
import twoLines from './scenes/12-two-lines.js';
import pythagoras from './scenes/13-pythagoras.js';
import summary from './scenes/14-summary.js';

/** Pacing: each scene's clock is stretched so that its wordiest narration cue fits the exporter's voice (155 words per minute). */
const PACE = [2.30, 1.25, 1.20, 1.10, 1.20, 1.30, 1.70, 1.60, 1.55, 1.45, 1.55, 1.45, 1.65, 1.65, 1.50];
const scenes = [title, points, flips, distinguishability, likelihood, fisher, tensor, sphere, chentsov, gaussians, cramerRao, naturalGradient, twoLines, pythagoras, summary].map((scene, i) => paced(scene, PACE[i]));

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 7,
};
