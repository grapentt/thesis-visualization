// The Flipped Handle: the MVP probe of "Where to Add the Noise" (programme.md §9, phase 2). Five scenes
// from two episodes, joined by one handle: E2.3 and E2.9 set it (October, ALDP5), E5.3, E5.4 and E5.6
// turn it back on BBA (November). The full episodes will live in src/videos/wrong-ruler and
// src/videos/range-and-order; their scenes start from these files.

import meta from './meta.json' with { type: 'json' };
import title from './scenes/00-title.js';
import nineRulers from './scenes/01-nine-rulers.js';
import promise from './scenes/02-promise.js';
import station from './scenes/03-station.js';
import erasureClock from './scenes/04-erasure-clock.js';
import handleBack from './scenes/05-handle-back.js';
import twoLoud from './scenes/06-two-loud-modes.js';

const scenes = [title, nineRulers, promise, station, erasureClock, handleBack, twoLoud];

export default {
  ...meta,
  scenes,
  posterTime: 5,
};
