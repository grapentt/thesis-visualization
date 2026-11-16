// One space, many bundles — global and local symmetries of one molecule.
// The edit: which scenes play, in which order. Reorder, drop or add scenes here.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import configuration from './scenes/01-configuration.js';
import orientation from './scenes/02-orientation.js';
import rotor from './scenes/03-rotor.js';
import manyBundles from './scenes/04-many-bundles.js';
import isItABundle from './scenes/05-is-it-a-bundle.js';
import sections from './scenes/06-sections.js';
import rotorHolonomy from './scenes/07-rotor-holonomy.js';
import associated from './scenes/08-associated.js';
import coupling from './scenes/09-coupling.js';
import oneBead from './scenes/10-one-bead.js';
import rotorLineBundle from './scenes/11-rotor-line-bundle.js';
import brownianHolonomy from './scenes/12-brownian-holonomy.js';
import whichCurvature from './scenes/13-which-curvature.js';
import thermalRotation from './scenes/14-thermal-rotation.js';
import summary from './scenes/15-summary.js';

const scenes = [title, configuration, orientation, rotor, manyBundles, isItABundle, sections, rotorHolonomy, associated, coupling, oneBead, rotorLineBundle, brownianHolonomy, whichCurvature, thermalRotation, summary];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 3,
};
