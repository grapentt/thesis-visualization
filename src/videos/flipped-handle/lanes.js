// The four lanes of the Erasure Clock on BBA (E5.3, E5.6), DOM-free so the narrated verdicts can be
// tested: every glyph's level, estimator and training share, and each lane's range and order.
//   best  : note 27 §5 best-estimator envelope, lower bounds (bba-windows.json)
//   first : first-order linear rule, lab 2026-11-18 (bba-charts.json)
//   block : the loud block alone, lower bounds, lab 2026-11-16 (bba-windows.json)

import windows from '../../data/thesis/bba-windows.json' with { type: 'json' };
import charts from '../../data/thesis/bba-charts.json' with { type: 'json' };
import { trainingShare, IN_RANGE } from '../../model/thesis/evidence.js';

const W = windows.data;
const FIRST = charts.data.t_half;
const LOCAL = ['bond', 'angle', 'torsion'];

const mid = (v) => (Array.isArray(v) ? (v[0] + v[1]) / 2 : v);

function measured(chart) {
  return Object.entries(W.best[chart]).map(([kind, v]) => ({ kind, t: mid(v), range: Array.isArray(v) ? v : null, estimator: 'best' }));
}

/** First-order glyphs of a chart column of bba-charts.json ('internal' or '+2'). */
export function firstOrder(column) {
  const map = [
    ['bond', 'bond lengths'], ['torsion', 'torsions (cos, sin)'], ['near', 'pairs 3 apart'], ['mid', 'pairs 7-10 apart'],
    ['longrange', 'pairs >= 11 apart'], ['endtoend', 'end-to-end distance'], ['rg', 'radius of gyration'], ['closest', 'closest non-neighbour'],
  ];
  return map.map(([kind, key]) => ({ kind, t: FIRST[key][column], estimator: 'first' }));
}

const blockAlone = () => ['rg', 'longrange', 'contacts'].map((kind) => ({ kind, t: W.block[kind], estimator: 'block' }));
const wall = () => ({ kind: 'wall', t: W.wall.t, estimator: 'bound' });

export const LANES = Object.freeze([
  { id: 'cartesian', name: 'Cartesian', tMin: W.charts.cartesian.tMin, glyphs: measured('cartesian'), source: 'best estimator · n27 §5' },
  { id: 'internal', name: 'internal', sub: 'unit spread (C3)', tMin: W.charts.internal.tMin, glyphs: [...measured('internal'), wall()], source: 'best estimator · n27 §5' },
  { id: 'whitened', name: 'whitened', sub: 'two-block (C1)', tMin: W.charts.whitened.tMin, glyphs: measured('whitened'), source: 'best estimator · n27 §5' },
  { id: 'ordered', name: 'ordered', sub: 'internal + 2 loud', tMin: W.charts.internal.tMin, glyphs: [...firstOrder('+2'), ...blockAlone(), wall()], source: 'first order · lab 11-18; block alone · lab 11-16' },
]);

/** Training shares of a lane's local features, and whether every one is in range. */
export function rangeOf(lane) {
  const shares = {};
  for (const g of lane.glyphs) if (LOCAL.includes(g.kind) && !(g.kind in shares)) shares[g.kind] = trainingShare(g.t, lane.tMin);
  return { shares, range: Object.values(shares).every((s) => s >= IN_RANGE) };
}

/** The level of the first glyph of a kind (first-order glyphs before block-alone ones). */
export const levelOf = (lane, kind) => lane.glyphs.find((g) => g.kind === kind)?.t;

/** The probe interval where size is still readable and bonds are not: [t½(bond), t½(Rg)]. */
export function sizeWithoutBonds(lane) {
  const bond = levelOf(lane, 'bond');
  const rg = lane.glyphs.find((g) => g.kind === 'rg');
  const top = rg.range ? rg.range[1] : rg.t;
  return [bond, top];
}
