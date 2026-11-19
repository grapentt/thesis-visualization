// E5.3 · The erasure clock, measured then painted (programme.md §4, E5). Measured half-erasure levels
// of BBA's observables (note 27 §5, best estimator, lower bounds) arrive on the bare rail, then fall
// into their lanes: Cartesian, internal at unit spread (C3), whitened two-block (C1), and ordered
// internal (first order, dashed; block alone, dotted ≥). Training shares decide range (≥ 1% of draws
// for every local feature); the order of the glyphs decides order. The fog rule and the mnemonic;
// "same word, four windows" for C3's size; then the playhead as a probe (lever `t`, hand-over).
import {
  defineScene, slider, text, wrap, line, font, type, seg, fade, lerp, rgba, P, CHARTS, WINDOWS,
  leverSim, clock, railX, RAIL, drawFog, drawRailAxis, drawPlayhead, glyph, FEATURES, chip, badge, rigStamp,
  formatT, header, T_MIN_CARTESIAN, sharePct, trainingShare,
} from '../shared.js';
import { LANES, rangeOf, levelOf, sizeWithoutBonds } from '../lanes.js';
import { drawLane, placeGlyphs, LANE_H } from '../laneView.js';

const AXIS_Y = 206;
const LANE0 = 250;
const laneTop = (i) => LANE0 + i * LANE_H;
const BOTTOM = laneTop(4);
const PAINT = [22, 34, 48, 56]; // when each lane paints
const ARRIVE = [9, 12, 15]; // when each measured chart's values arrive on the bare rail
const HANDOVER = 87;
const EXPLORE = 66;

const lane = (id) => LANES.find((l) => l.id === id);
const CART = rangeOf(lane('cartesian'));
const C3 = lane('internal');
const ORD = lane('ordered');
const e2e = levelOf(C3, 'endtoend');
const tor = levelOf(C3, 'torsion');

const VERDICTS = {
  cartesian: { text: `order without range · bonds in ${sharePct(CART.shares.bond)} of draws`, colour: P.wall },
  internal: { text: `range without order · anti-order: end-to-end ${e2e} < torsions ${tor}`, colour: P.wall },
  whitened: { text: 'range · size erased with the torsions', colour: P.body },
  ordered: { text: 'range, and order for size', colour: P.global },
};

const POSITIONS = LANES.map((l) => placeGlyphs(l.glyphs));
const FOUR = WINDOWS.c3RgFourWindows;

/** Does a lane know its size but not its bonds at level t? */
const probe = (l, t) => {
  const [a, b] = sizeWithoutBonds(l);
  return t > a && t < b;
};

export default defineScene({
  name: 'The erasure clock',
  duration: 96,
  header: header(5, 3, 'THE ERASURE CLOCK', 'Range and order: no earlier chart had both'),
  narration: [
    [0, 'BBA, the 28-bead protein. Each of its features has a readable window on the same noise clock.'],
    [8, 'First the measurements: the half-erasure levels of three charts from the best estimator, lower bounds, from note 27.'],
    [21, `Cartesian: bonds are half erased at ${levelOf(lane('cartesian'), 'bond')}, inside ${sharePct(CART.shares.bond)} of the training draws, and size goes last. Order without range.`],
    [34, `Internal coordinates at unit spread: every local feature is inside the training, but the fold goes first, end-to-end at ${e2e} before the torsions at ${tor}. Anti-order.`],
    [48, 'The whitened two-block chart: range, with size erased among the torsions.'],
    [55, `Ordered internal coordinates add two loud collective modes. At first order, dashed, bonds stay at ${levelOf(ORD, 'bond').toFixed(2)} and size moves to ${levelOf(ORD, 'rg').toFixed(2)}. The block alone, dotted, keeps size readable to at least ${WINDOWS.block.rg}.`],
    [67, 'The fog rule: at a quiet feature’s own half point the haze is still faint. Range means inside the training; order means the cool glyphs deepest in the fog.'],
    [77, `A caution: a window depends on its estimator. Internal size has four printed values, from ${FOUR[0].value} to ${FOUR[3].value}.`],
    [HANDOVER, 'Your turn: find the noise where the molecule knows its size but has lost its bonds.'],
  ],
  beats: [[0, 'The rail'], [8, 'Measured'], [21, 'Four lanes'], [67, 'The fog rule'], [77, 'Four windows'], [HANDOVER, 'Probe']],
  controls: {
    t: slider('probe level t', { min: 0.0002, max: 0.6, step: 0.001, digits: 3, value: [[0, 0.35], [89, 0.35], [93, 0.3]] }),
  },
  sim: leverSim(['t']),
  handovers: [{ at: HANDOVER, prompt: 'Move t: where does each chart still know its size but has lost its bonds?' }],
  exploreFrom: EXPLORE,

  draw(ctx, tt, live) {
    const c = clock(tt, live, EXPLORE);
    const axisA = seg(c, 0.4, 1.4);
    drawFog(ctx, LANE0, BOTTOM, { alpha: axisA, strength: 0.4 });
    drawRailAxis(ctx, AXIS_Y, { alpha: axisA });

    // measured values arrive on the bare rail, one chart at a time, with their estimator chip
    ['cartesian', 'internal', 'whitened'].forEach((id, li) => {
      const arrive = seg(c, ARRIVE[li], ARRIVE[li] + 1.5) * (1 - seg(c, PAINT[li] - 0.2, PAINT[li] + 0.8));
      if (arrive <= 0.003) return;
      for (const g of lane(id).glyphs) {
        if (g.estimator !== 'best') continue;
        const x = railX(g.t);
        line(ctx, x, AXIS_Y - 2, x, AXIS_Y - 16 - li * 6, { color: FEATURES[g.kind].colour, width: 2, alpha: arrive });
      }
    });
    chip(ctx, 'best estimator · lower bounds (≥) · note 27 §5 · PR #1055 · 2026-11-12', RAIL.x0, AXIS_Y - 44, { size: 12, alpha: seg(c, 9, 10) * (1 - seg(c, 21, 22)) });

    // the lanes paint
    LANES.forEach((l, li) => {
      const start = PAINT[li];
      const a = seg(c, start - 0.5, start + 0.5);
      if (a <= 0.003) return;
      const v = VERDICTS[l.id];
      drawLane(ctx, l, laneTop(li), {
        alpha: a,
        positions: POSITIONS[li],
        dropFrom: AXIS_Y,
        drop: (i) => seg(c, start + 0.06 * i, start + 0.9 + 0.06 * i),
        verdict: v.text,
        verdictColour: v.colour,
        chipDash: l.id === 'ordered' ? [4, 3] : [],
      });
      // verdict text appears a beat after the glyphs
    });
    text(ctx, 'Euclid was arbitrary, not useless: its steep spectrum is an order', RAIL.x1, laneTop(1) - 8, { font: font.mono, size: 11, color: P.muted, align: 'right', alpha: seg(c, 28, 29) * (1 - seg(c, HANDOVER - 2, HANDOVER - 1)) });
    text(ctx, 'wall glyph ≲ 0.001: a wall sharper than ≈ 0.1 Å needs a level near 0.001 or below (#1101, extrapolated)', railX(0.001) + 16, laneTop(2) - 8, { font: font.mono, size: 11, color: P.wall, alpha: seg(c, 40, 41) * 0.9 * (1 - seg(c, HANDOVER - 2, HANDOVER - 1)) });
    text(ctx, 'chain distances erased with the bonds, before the torsions, at first order; their measured windows are not yet computed', RAIL.x1, BOTTOM - 2, {
      font: font.mono, size: 11, color: P.muted, align: 'right', alpha: seg(c, 62, 63) * (1 - seg(c, HANDOVER - 1, HANDOVER)),
    });

    // legend for estimators
    const legA = seg(c, 57, 58);
    const ly = BOTTOM + 30;
    glyph(ctx, 'rg', RAIL.x0 + 8, ly - 4, { r: 8, estimator: 'best', alpha: legA });
    text(ctx, 'best estimator (≥)', RAIL.x0 + 26, ly, { font: font.mono, size: 12, color: P.muted, alpha: legA });
    glyph(ctx, 'rg', RAIL.x0 + 188, ly - 4, { r: 8, estimator: 'first', alpha: legA });
    text(ctx, 'first order', RAIL.x0 + 206, ly, { font: font.mono, size: 12, color: P.muted, alpha: legA });
    glyph(ctx, 'rg', RAIL.x0 + 318, ly - 4, { r: 8, estimator: 'block', alpha: legA });
    text(ctx, 'block alone (≥)', RAIL.x0 + 336, ly, { font: font.mono, size: 12, color: P.muted, alpha: legA });
    const kinds = ['bond', 'angle', 'torsion', 'longrange', 'contacts', 'endtoend', 'rg', 'tic'];
    let lx = RAIL.x0 + 500;
    for (const k of kinds) {
      glyph(ctx, k, lx, ly - 4, { r: 8, estimator: 'exact', alpha: legA });
      text(ctx, FEATURES[k].label.replace('long-range (≥ 11 apart)', 'long-range'), lx + 13, ly, { font: font.mono, size: 11, color: P.muted, alpha: legA });
      lx += 34 + FEATURES[k].label.replace('long-range (≥ 11 apart)', 'long-range').length * 6.9;
    }

    // the fog rule and the mnemonic
    const fogA = fade(c, 67, 68.5, 76, 77) * (live.exploring ? 0 : 1);
    text(ctx, 'inside the training, into the fog', RAIL.x0, BOTTOM + 78, { ...type.display, size: 28, italic: true, alpha: fogA });
    wrap(ctx, 'Fog rule: at a feature’s own half point the haze has alpha λ/(1 + λ), so a quiet feature such as a Cartesian bond is erased in fog that is still invisible. Generation reads right to left.', 640, BOTTOM + 64, 840, 21, { font: font.mono, size: 13, color: P.muted, alpha: fogA });

    // same word, four windows: internal size, on the rail's own scale
    const fourA = fade(c, 77, 78.5, HANDOVER - 1, HANDOVER) * (live.exploring ? 0 : 1);
    if (fourA > 0.003) {
      const y0 = BOTTOM + 44;
      text(ctx, 'same word, four windows:', 20, y0 + 4, { font: font.mono, size: 13, color: P.body, alpha: fourA });
      text(ctx, 'internal size, four printed values', 20, y0 + 24, { font: font.mono, size: 12, color: P.muted, alpha: fourA });
      const textX = railX(0.3) + 40;
      FOUR.forEach((w, i) => {
        const y = y0 + i * 22;
        const v = Array.isArray(w.value) ? (w.value[0] + w.value[1]) / 2 : w.value;
        const x = railX(v);
        line(ctx, RAIL.x0, y, RAIL.x1, y, { color: P.grid, width: 1, alpha: fourA * 0.6 });
        if (Array.isArray(w.value)) line(ctx, railX(w.value[0]), y, railX(w.value[1]), y, { color: P.global, width: 3, alpha: fourA });
        glyph(ctx, 'rg', x, y, { r: 7, estimator: i === 0 ? 'first' : 'best', alpha: fourA, fill: i === 2 ? 1 : 0 });
        line(ctx, x + 12, y, textX - 6, y, { color: P.dim, width: 1, dash: [2, 4], alpha: fourA });
        text(ctx, `${Array.isArray(w.value) ? w.value.join('–') : w.value}  ${w.estimator}${i === 2 ? '  · the canon' : ''}`, textX, y + 4, { font: font.mono, size: 12, color: i === 2 ? P.ink : P.muted, alpha: fourA });
      });
    }

    // the probe
    const probeA = seg(c, HANDOVER - 2, HANDOVER);
    if (probeA > 0.003) {
      const t = live.input.t;
      drawPlayhead(ctx, t, LANE0 - 6, BOTTOM, { alpha: probeA, labelY: BOTTOM + 14 });
      LANES.forEach((l, li) => {
        const [a, b] = sizeWithoutBonds(l);
        const y = laneTop(li) + LANE_H - 10;
        if (b > a) line(ctx, railX(a), y, railX(b), y, { color: P.info, width: 4, alpha: probeA * 0.8 });
        const ok = probe(l, t);
        text(ctx, ok ? '✓ knows its size, lost its bonds' : '✗', railX(Math.max(b, a)) + 10, y + 4, { font: font.mono, size: 11, color: ok ? P.info : P.dim, alpha: probeA });
      });
      text(ctx, 'lavender: where size is still readable and bonds are not', RAIL.x0, BOTTOM + 60, { font: font.mono, size: 12, color: P.info, alpha: probeA });
    }

    rigStamp(ctx, 'measured lanes: best estimator, lower bounds · ordered: first order and block alone · BBA', axisA);
  },
});
