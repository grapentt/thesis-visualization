// Part 0 — The geometry of shape space 1.
// The edit: which scenes play, in which order. Reorder, drop or add scenes here.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import roadmap from './scenes/01-roadmap.js';
import configuration from './scenes/02-configuration.js';
import potentialEnergy from './scenes/03-potential-energy.js';
import symmetry from './scenes/04-symmetry.js';
import tangentSplit from './scenes/05-tangent-split.js';
import torusBundle from './scenes/06-torus-bundle.js';
import torusTangent from './scenes/07-torus-tangent.js';
import connection from './scenes/08-connection.js';
import metricConnection from './scenes/09-metric-connection.js';
import integrable from './scenes/10-integrable.js';
import holonomy from './scenes/11-holonomy.js';
import curvature from './scenes/12-curvature.js';
import shapeBundle from './scenes/13-shape-bundle.js';
import moleculeHolonomy from './scenes/14-molecule-holonomy.js';
import catExplained from './scenes/15-falling-cat-explained.js';
import fallingCat from './scenes/16-falling-cat.js';
import nextVideo from './scenes/17-next-video.js';

const scenes = [
  title,
  roadmap,
  configuration,
  potentialEnergy,
  symmetry,
  tangentSplit,
  torusBundle,
  torusTangent,
  connection,
  metricConnection,
  integrable,
  holonomy,
  curvature,
  shapeBundle,
  moleculeHolonomy,
  catExplained,
  fallingCat,
  nextVideo,
];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 3,
};
