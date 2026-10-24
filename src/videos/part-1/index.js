// Part 1 — Diffusion in the right geometry.
// The edit: which scenes play, in which order. Reorder, drop or add scenes here.

import meta from './meta.json' with { type: 'json' };

import title from './scenes/00-title.js';
import molecule from './scenes/01-molecule.js';
import atomOne from './scenes/02-atom-one.js';
import everyAtom from './scenes/03-every-atom.js';
import configurationSpace from './scenes/04-configuration-space.js';
import stiffness from './scenes/05-stiffness.js';
import forwardNoise from './scenes/06-forward-noise.js';
import dataSoft from './scenes/07-data-soft.js';
import dataStiff from './scenes/08-data-stiff.js';
import conditioning from './scenes/09-conditioning.js';
import problemOne from './scenes/10-problem-one.js';
import scoreCovector from './scenes/11-score-covector.js';
import problemTwo from './scenes/12-problem-two.js';
import problemThree from './scenes/13-problem-three.js';
import oneFix from './scenes/14-one-fix.js';
import nextVideo from './scenes/15-next-video.js';

const scenes = [
  title,
  molecule,
  atomOne,
  everyAtom,
  configurationSpace,
  stiffness,
  forwardNoise,
  dataSoft,
  dataStiff,
  conditioning,
  problemOne,
  scoreCovector,
  problemTwo,
  problemThree,
  oneFix,
  nextVideo,
];

export default {
  ...meta,
  scenes,
  /** Frame shown before the viewer presses play (the title card, fully drawn). */
  posterTime: 2.6,
};
