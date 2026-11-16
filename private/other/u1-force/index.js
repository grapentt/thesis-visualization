// From phase to force: the edit, which scenes play, in which order.
import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import bundle from './scenes/01-bundle.js';
import connection from './scenes/02-connection.js';
import holonomy from './scenes/03-holonomy.js';
import curvature from './scenes/04-curvature.js';
import stationaryAction from './scenes/05-stationary-action.js';
import potential from './scenes/06-potential.js';
import phaseInTheAction from './scenes/07-phase-in-the-action.js';
import ribbon from './scenes/08-ribbon.js';
import force from './scenes/09-force.js';
import tiltTheVelocity from './scenes/10-tilt-the-velocity.js';
import chain from './scenes/11-chain.js';

const scenes = [title, bundle, connection, holonomy, curvature, stationaryAction, potential, phaseInTheAction, ribbon, force, tiltTheVelocity, chain];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 16,
};
