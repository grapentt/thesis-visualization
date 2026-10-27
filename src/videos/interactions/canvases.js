// Scene 10's pre-rendered heatmaps (§2.8), built once at import. Scene side: canvases need the
// DOM, so the numeric data.js stays free of them.

import { densityHeatmap } from '../../kit.js';
import { tableAt } from './lines.js';
import { twoPointTables } from './data.js';

/**
 * Density of the noisy pair on [−3, 3]², p_t(z) ∝ e^{−|z|²/2} g(z₁ − z₂) (the VP reference stays N(0, I)),
 * from a two-point table; null gives the reference itself.
 */
const heatmap = (table) => densityHeatmap({
  size: 440, // near the 500 px it is drawn at: no stair steps along the narrow bands
  extent: 3,
  density: (u, v) => Math.exp(-(u * u + v * v) / 2 + (table ? tableAt(table, u - v).logg : 0)),
  gradLog: (u, v) => {
    const g = table ? tableAt(table, u - v).dlogg : 0;
    return [-u + g, -v - g];
  },
});

/** Scene 10: ν (round), p₀ = ν·w (the clean bands), and p_t at each σ of twoPointTables.sigmas. */
export const twoPointHeatmaps = {
  nu: heatmap(null),
  clean: heatmap(twoPointTables.clean),
  sigmas: twoPointTables.sigmas,
  bySigma: Object.fromEntries(twoPointTables.sigmas.map((s) => [s, heatmap(twoPointTables.tables[s])])),
};
