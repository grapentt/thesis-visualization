// Parts and poses — learning how two molecules bind from frozen models of each molecule.
// The edit: which scenes play, in which order. Reorder, drop or add scenes here.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import question from './scenes/01-question.js';
import noiseAndScores from './scenes/02-noise-and-scores.js';
import oneMolecule from './scenes/03-one-molecule.js';
import twoMolecules from './scenes/04-two-molecules.js';
import fibre from './scenes/05-fibre.js';
import picture from './scenes/06-picture.js';
import justAdd from './scenes/07-just-add.js';
import inducedFit from './scenes/08-induced-fit.js';
import noise from './scenes/09-noise.js';
import identity from './scenes/10-identity.js';
import threeArrows from './scenes/11-three-arrows.js';
import notTheForce from './scenes/12-not-the-force.js';
import oneEnergy from './scenes/13-one-energy.js';
import recipe from './scenes/14-recipe.js';
import clusters from './scenes/15-clusters.js';
import manyBody from './scenes/16-many-body.js';
import connection from './scenes/17-connection.js';
import verdict from './scenes/18-verdict.js';
import summary from './scenes/19-summary.js';

const scenes = [title, question, noiseAndScores, oneMolecule, twoMolecules, fibre, picture, justAdd, inducedFit, noise, identity, threeArrows, notTheForce, oneEnergy, recipe, clusters, manyBody, connection, verdict, summary];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 3,
};
