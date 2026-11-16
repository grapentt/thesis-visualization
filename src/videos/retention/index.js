// What the noise should keep — an extension of Part 1: what information geometry adds to the
// choice of the noising process (retention) and of the model's representation (closure), and
// what it does not. The edit: which scenes play, in which order.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import partOne from './scenes/01-part-one.js';
import twoGeometries from './scenes/02-two-geometries.js';
import threeExperiments from './scenes/03-three-experiments.js';
import observables from './scenes/04-observables.js';
import whatSurvives from './scenes/05-what-survives.js';
import retentionCurves from './scenes/06-retention-curves.js';
import representation from './scenes/07-representation.js';
import conditionalWhitening from './scenes/08-conditional-whitening.js';
import flowIdentity from './scenes/09-flow-identity.js';
import notSaid from './scenes/10-not-said.js';
import programme from './scenes/11-programme.js';

const scenes = [title, partOne, twoGeometries, threeExperiments, observables, whatSurvives, retentionCurves, representation, conditionalWhitening, flowIdentity, notSaid, programme];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 5,
};
