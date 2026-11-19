// E2.3 · Nine rulers in the fog (programme.md §4, E2). The nine principal modes of the ALDP5 backbone
// on the Erasure Clock: under flat noise each is half erased where its variance (in noise units)
// equals the noise; training draws t uniformly above the pilots' floor 0.01, so a mode's training
// share is (t½ − t_min)/(1 − t_min). The noise-shape handle γ sets λ ↦ λ^{1−γ} (γ = 1: shaped by the
// metric, every mode at t½(1) = 0.259). Lever γ; lens `unit` (the pilots' noise unit, or the
// backbone's own scale with the Cartesian floor 10⁻⁵).
import {
  defineScene, slider, choice, text, line, font, type, seg, fade, P, ALDP5, ev, num,
  leverSim, clock, railX, RAIL, drawFog, drawWaterline, drawRailAxis, glyph, decisionBar, shareBar, sharePct,
  backboneThumb, rampColour, badge, rigStamp, tHalf, trainingShare, IN_RANGE, gammaSpectrum, gammaForHalfAt,
  integratedBeta, T_MIN_INTERNAL, T_MIN_CARTESIAN, formatT, header,
} from '../shared.js';

const WIDTHS = ev('aldp5.widths').value;
const UNITS = { pilot: ev('aldp5.pilotUnit').value, own: ev('aldp5.ownUnit').value };
const FLOORS = { pilot: T_MIN_INTERNAL, own: T_MIN_CARTESIAN };
const BOND = ev('aldp5.bondHalf').value;

const AXIS_Y = 214;
const ROW0 = 266;
const ROW_H = 52;
const rowY = (k) => ROW0 + k * ROW_H;
const FOG = [242, rowY(8) + 30];
const colourOf = (k) => rampColour((0.5 * k) / 8);

/** Everything the frame shows for one γ and unit: per-mode λ, t½, share, and the verdict counts. */
export function rulers(gamma, unit) {
  const lambda = gammaSpectrum(WIDTHS.map((w) => (w / UNITS[unit]) ** 2), gamma, { unitMean: false });
  const tMin = FLOORS[unit];
  const half = lambda.map(tHalf);
  const share = half.map((t) => trainingShare(t, tMin));
  const atFloor = half.map((t) => Math.abs(t / tMin - 1) < 0.1);
  return {
    lambda, half, share, tMin,
    below: half.filter((t, k) => t < tMin && !atFloor[k]).length,
    atFloor: atFloor.filter(Boolean).length,
    outOfRange: share.filter((s) => s < IN_RANGE).length,
    spread: Math.max(...half) / Math.min(...half),
  };
}

const FLAT = rulers(0, 'pilot');
const OWN = rulers(0, 'own');
const ENTERS = gammaForHalfAt((WIDTHS[0] / UNITS.pilot) ** 2, Math.expm1(integratedBeta(T_MIN_INTERNAL)));
const UNIT_HALF = tHalf(1);

const HANDOVER = 64;
const EXPLORE = 42;

export default defineScene({
  name: 'Nine rulers in the fog',
  duration: 80,
  header: header(2, 3, 'NINE RULERS IN THE FOG', 'Flat noise erases the stiff modes before training looks'),
  narration: [
    [0, 'Nine principal modes of the ALDP5 backbone, the stiffest at the top. Each row is one mode on one noise clock.'],
    [9, 'Under flat noise a mode is half erased where its variance equals the noise. The bar around each dot is its decision window.'],
    [20, `Training draws noise levels uniformly above a floor of ${formatT(T_MIN_INTERNAL)}. The bar under each dot is its training share: the draws that still see it more than half.`],
    [33, `${FLAT.below === 2 ? 'Two' : FLAT.below} modes are erased below the floor and a third at it. ${FLAT.outOfRange === 5 ? 'Five' : FLAT.outOfRange} of the nine get less than 1% of the draws.`],
    [44, `Now give the noise the metric's shape: each variance λ becomes λ to the power 1 − γ. At γ = 1 every mode is half erased at ${UNIT_HALF.toFixed(3)}.`],
    [56, 'In thermal units all nine share one clock. Under flat noise, no trained level resolves a bond.'],
    [HANDOVER, 'Your turn: find the γ at which the stiffest mode enters the band.'],
    [71, `A lens: at the backbone's own scale, ${UNITS.own} Å, with a floor of 10⁻⁵, every mode gets a usable share, the stiffest ${sharePct(OWN.share[0])}.`],
  ],
  beats: [[0, 'Nine modes'], [20, 'Training share'], [44, 'The γ handle'], [71, 'Own scale']],
  controls: {
    gamma: slider('noise shape γ (0 flat, 1 metric)', { min: 0, max: 1, step: 0.01, value: [[0, 0], [44, 0], [54, 1], [60, 1], [63.5, 0]] }),
    unit: choice('noise unit', { pilot: `pilots · ${UNITS.pilot} Å · floor 0.01`, own: `own scale · ${UNITS.own} Å · floor 10⁻⁵` }, { value: [[0, 'pilot'], [71, 'own']], lens: true }),
  },
  sim: leverSim(['gamma']),
  handovers: [{ at: HANDOVER, prompt: 'Find the γ at which the stiffest mode enters the band (its share becomes nonzero).' }],
  exploreFrom: EXPLORE,

  draw(ctx, t, live) {
    const c = clock(t, live, EXPLORE);
    const { gamma, unit } = live.input;
    const R = rulers(gamma, unit);

    const axisA = seg(c, 0.5, 1.5);
    drawFog(ctx, FOG[0], FOG[1], { alpha: axisA });
    const floorA = seg(c, 20, 22);
    const xw = drawWaterline(ctx, R.tMin, FOG[0], FOG[1], { alpha: floorA });
    if (xw - RAIL.x0 > 140) text(ctx, 'never trained', (RAIL.x0 + xw) / 2, FOG[0] + 16, { font: font.mono, size: 12, color: P.muted, align: 'center', alpha: floorA });
    text(ctx, `t_min = ${formatT(R.tMin)}`, xw + 6, FOG[0] + 16, { font: font.mono, size: 12, color: P.muted, alpha: floorA });
    drawRailAxis(ctx, AXIS_Y, { alpha: axisA });
    text(ctx, 'more noise →', RAIL.x1, AXIS_Y + 44, { font: font.mono, size: 12, color: P.dim, align: 'right', alpha: axisA });

    for (let k = 0; k < 9; k++) {
      const y = rowY(k);
      const a = seg(c, 1 + 0.35 * k, 2 + 0.35 * k);
      if (a <= 0.003) continue;
      const col = colourOf(k);
      line(ctx, RAIL.x0, y, RAIL.x1, y, { color: P.grid, width: 1, alpha: a });
      text(ctx, String(k + 1), 22, y + 5, { font: font.mono, size: 13, color: P.muted, alpha: a });
      backboneThumb(ctx, ALDP5.vectors[k], 82, y, { scale: 11, alpha: a, colour: col, arrowScale: 26 });
      decisionBar(ctx, R.lambda[k], y, { colour: col, alpha: a * seg(c, 9, 12) });
      const x = railX(Math.max(RAIL.tLo, R.half[k]));
      glyph(ctx, 'mode', x, y, { r: 10, alpha: a, estimator: 'exact', colour: col, fill: 0 });
      shareBar(ctx, R.share[k], x, y + 14, { colour: col, alpha: a * floorA, label: true });
    }
    text(ctx, 'softest', 22, rowY(8) + 30, { font: font.mono, size: 11, color: P.dim, alpha: seg(c, 4, 5) });

    // legend of the row devices
    const legA = seg(c, 10, 12);
    const ly = FOG[1] + 26;
    text(ctx, '○ half erased (t½)   ▬ decision window, readability 0.8 → 0.2   ▁ training share (bar: 10% = 40 px; rose: under 1%)', RAIL.x0, ly, { font: font.mono, size: 12, color: P.muted, alpha: legA });

    // readouts
    const rA = seg(c, 33, 35);
    const y0 = 790;
    const turning = Math.abs(gamma - 0) > 1e-6 || live.exploring;
    text(ctx, `γ = ${gamma.toFixed(2)}`, RAIL.x0, y0, { font: font.mono, size: 22, color: turning ? P.gold : P.ink, alpha: seg(c, 40, 42) });
    text(ctx, 'λ ↦ λ^(1−γ)', RAIL.x0, y0 + 26, { font: font.mono, size: 13, color: P.muted, alpha: seg(c, 40, 42) });
    const col = (x, label, value, alpha, warn = false) => {
      text(ctx, label, x, y0 - 6, { font: font.mono, size: 12, color: P.muted, alpha });
      text(ctx, value, x, y0 + 20, { font: font.mono, size: 20, color: warn ? P.wall : P.ink, alpha });
    };
    col(330, 't½ spread', `×${R.spread.toFixed(1)}`, rA);
    col(500, 'below / at the floor', `${R.below} / ${R.atFloor}`, rA, R.below > 0);
    col(720, 'out of range (< 1% of draws)', `${R.outOfRange} of 9`, rA, R.outOfRange > 0);
    col(1010, 'stiffest mode: share', sharePct(R.share[0]), rA, R.share[0] < IN_RANGE);

    // the honesty line for the handle, and what the rows are
    const hA = seg(c, 44, 46);
    const bw = badge(ctx, 'D·model', RAIL.x0, 852, { alpha: hA });
    text(ctx, 'display interpolation: the project compared γ = 0 and γ = 1 on ALDP5; the continuous dial is BBA’s (#1057)', RAIL.x0 + bw + 10, 856, { font: font.mono, size: 12, color: P.muted, alpha: hA });
    text(ctx, `principal directions, not bonds: a bond length (√2σ) is half erased at t ≈ ${num(BOND[0])}–${num(BOND[1])}`, RAIL.x1, 790 - 30, {
      font: font.mono, size: 12, color: P.body, align: 'right', alpha: seg(c, 24, 26) * (1 - seg(c, 70, 71)),
    });
    text(ctx, `the stiffest mode enters the band at γ ≈ ${ENTERS.toFixed(2)}`, RAIL.x1, 790 - 30, { font: font.mono, size: 12, color: P.body, align: 'right', alpha: fade(t, 76, 77) * (live.exploring ? 0 : 1) });
    rigStamp(ctx, `exact · 9 Gaussian modes · widths mdshare traj 1 · unit ${UNITS[unit]} Å`, seg(c, 2, 3));
  },
});
