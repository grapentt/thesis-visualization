// Layout shared by consecutive scenes, so that elements line up across cuts.

import { moleculeCamera, dataset } from '../../../kit.js';

/** The (s, q) data plot on the right of the data scenes (07 – 08). */
export const dataPlot = Object.freeze({
  box: { x: 880, y: 254, w: 600, h: 532 },
  cx: 1180,
  cy: 520,
  pxPerAngstrom: 600 / 4.5,
});
export const plotX = (s) => dataPlot.cx + s * dataPlot.pxPerAngstrom;
export const plotY = (q, zoom = 1) => dataPlot.cy - q * dataPlot.pxPerAngstrom * zoom;

/** The strip plot of scene 07 sits at this height; dots are jittered above it. */
export const STRIP_Y = 600;
export const stripDotY = (i) => STRIP_Y - 14 - dataset[i].jitter * 56;

/** Molecule on the left of the data scenes. */
export const dataSceneCamera = () => moleculeCamera({ cx: 420, cy: 500, scale: 170 });
