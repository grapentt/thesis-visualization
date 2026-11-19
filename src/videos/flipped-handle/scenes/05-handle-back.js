// E5.4 · The handle, turned back (programme.md §4, E5). BBA's 27 Cartesian collective modes in library
// units (c₀² × mean square, mean 1) as log bars and as readability curves on the rail; the γ handle
// of E2.3 (λ ↦ λ^{1−γ}, renormalised to unit mean, R18) turned from 1 (whitened) back to 0
// (Cartesian). Trained size error at the four exponents of #1057 (dots only where measured, with the
// seed-spread yardstick of #1069), torsions and populations that do not follow, the reverse dose, and
// E2's promise recaptioned for BBA. Lever γ (hand-over).
import {
  defineScene, slider, text, wrap, line, dot, roundRect, rgba, font, type, seg, fade, lerp, clamp, P, BBA_MODES, ev, num, seeds,
  leverSim, clock, railX, RAIL, drawFog, drawRailAxis, glyph, chip, badge, stamp, budget, rigStamp, meterCurve, rampColour,
  libraryUnits, gammaSpectrum, ratio, tHalf, thousands, header, track, readability,
} from '../shared.js';

const { lambda: LAMBDA } = libraryUnits(BBA_MODES.ms_A2);
const N = LAMBDA.length;
const RG = ev('g1057.rg');
const TOR = ev('g1057.torsion');
const TIC = ev('g1057.tic');
const WHISK = ev('g1069.whisker').value;
const DOSE_RG = ev('g1057.dose.rg').value;
const DOSE_BOND = ev('g1057.dose.bond').value;
const UNDER = ev('n27.understated').value;
const GAMMAS = ['1', '0.5', '0.25', '0'];

const colourOf = (k) => rampColour(1 - k / (N - 1));

// panels
const BARS = { x: 90, y: 190, w: 640, h: 170, lo: Math.log(0.005), hi: Math.log(30) };
const DOSE = { x: 900, y: 190, w: 560, h: 160, yMax: 0.6 };
const MINI = { y: 384, h: 28, gap: 12 };
const CURVES = { top: 548, h: 84 };
const AXIS_Y = 648;

const gx = (g) => DOSE.x + 30 + (DOSE.w - 60) * g;
const dy = (v) => DOSE.y + DOSE.h - (DOSE.h * v) / DOSE.yMax;
const by = (l) => BARS.y + BARS.h - (BARS.h * (Math.log(l) - BARS.lo)) / (BARS.hi - BARS.lo);

const HANDOVER = 66;
const EXPLORE = 56;

/** Ratio, first and last half-erasure level at γ. */
export function fan(gamma) {
  const l = gammaSpectrum(LAMBDA, gamma);
  return { l, ratio: ratio(l), first: tHalf(l[0]), last: tHalf(l[N - 1]) };
}
const AT0 = fan(0);
const nearestTrained = (g) => GAMMAS.map(Number).reduce((best, x) => (Math.abs(x - g) < Math.abs(best - g) ? x : best), 1);

export default defineScene({
  name: 'The handle, turned back',
  duration: 96,
  header: header(5, 4, 'THE HANDLE, TURNED BACK', 'On BBA, the whitening fix is what erased the order'),
  narration: [
    [0, `On BBA, October's handle at γ = 1: all ${N} collective modes at unit variance, all half erased together near ${fan(1).first.toFixed(2)}.`],
    [9, `Turn it back to γ = 0, Cartesian. The variances span about 1.4 × 10³, and the loudest mode, the molecule's size, is erased last, at ${AT0.first.toFixed(2)}.`],
    [25, `Training at the four exponents of #1057: the size error falls from about ${num(RG.value['1'][0], 2)} to ${num(RG.value['0'][0])} Å as γ goes from 1 to 0. One seed each; only the end points differ by the effect rule.`],
    [38, 'Torsions and populations do not follow the exponent.'],
    [44, `The reverse dose agrees: removing order from Cartesian raised its size error from ${DOSE_RG[0]} to ${DOSE_RG[1]} Å, while its bonds improved.`],
    [54, `The windows ranked these arms correctly but understated the differences: half the exponent shrinks the size window by ${Math.round(UNDER[0] * 100)}% and multiplies the error by ${UNDER[1]}.`],
    [HANDOVER, 'Your turn: turn γ back. Where does the size error stop improving?'],
    [74, 'So the promise is recaptioned for BBA: range without order. ALDP5 could not test order, and its stiff modes kept the gain.'],
    [86, 'Unit variance in every direction is what erases the order. The local whitening itself does not.'],
  ],
  beats: [[0, 'Whitened'], [9, 'Turned back'], [25, 'Trained'], [44, 'Reverse dose'], [74, 'Recaption']],
  controls: {
    gamma: slider('whitening exponent γ', { min: 0, max: 1, step: 0.01, value: [[0, 1], [9, 1], [23, 0]] }),
  },
  sim: leverSim(['gamma']),
  handovers: [{ at: HANDOVER, prompt: 'Turn γ: where does the size error stop improving? (Dots exist only at the four trained exponents.)' }],
  exploreFrom: EXPLORE,

  draw(ctx, t, live) {
    const c = clock(t, live, EXPLORE);
    const { gamma } = live.input;
    const F = fan(gamma);
    const turning = live.exploring || (t > 9 && t < 24);

    // ---- the 27 mode variances, log bars ----
    const barA = seg(c, 0.4, 1.4);
    text(ctx, `${N} collective modes · variance in library units (mean 1, log scale)`, BARS.x, BARS.y - 14, { font: font.mono, size: 12, color: P.muted, alpha: barA });
    for (const v of [0.01, 0.1, 1, 10]) {
      line(ctx, BARS.x, by(v), BARS.x + BARS.w, by(v), { color: P.grid, width: 1, alpha: barA });
      text(ctx, String(v), BARS.x - 8, by(v) + 4, { font: font.mono, size: 11, color: P.dim, align: 'right', alpha: barA });
    }
    const bw = BARS.w / N;
    F.l.forEach((l, k) => {
      const x = BARS.x + k * bw;
      const y = by(Math.max(Math.exp(BARS.lo), l));
      ctx.save();
      ctx.globalAlpha *= barA;
      ctx.fillStyle = rgba(colourOf(k), 0.75);
      ctx.fillRect(x + 2, y, bw - 4, BARS.y + BARS.h - y);
      ctx.restore();
    });
    text(ctx, 'mode 1 (size)', BARS.x, BARS.y + BARS.h + 18, { font: font.mono, size: 11, color: P.global, alpha: barA });
    text(ctx, `mode ${N}`, BARS.x + BARS.w, BARS.y + BARS.h + 18, { font: font.mono, size: 11, color: P.stiff, align: 'right', alpha: barA });
    // readouts of the fan
    const ry = BARS.y + BARS.h + 56;
    text(ctx, `γ = ${gamma.toFixed(2)}`, BARS.x, ry + 6, { font: font.mono, size: 22, color: turning ? P.gold : P.ink, alpha: barA });
    text(ctx, 'largest / smallest', BARS.x + 150, ry - 10, { font: font.mono, size: 11, color: P.muted, alpha: barA });
    text(ctx, thousands(F.ratio), BARS.x + 150, ry + 12, { font: font.mono, size: 19, color: P.ink, alpha: barA });
    text(ctx, 'first / last t½', BARS.x + 330, ry - 10, { font: font.mono, size: 11, color: P.muted, alpha: barA });
    text(ctx, `${F.first.toFixed(2)} / ${F.last.toFixed(3)}`, BARS.x + 330, ry + 12, { font: font.mono, size: 19, color: P.ink, alpha: barA });
    text(ctx, `γ = 0 from the file: ${thousands(AT0.ratio)} (note 27 prints ${thousands(ev('bba.ratio.n27').value)})`, BARS.x + 150, ry + 34, { font: font.mono, size: 11, color: P.dim, alpha: seg(c, 20, 21) });

    // ---- the curves on the rail ----
    const curveA = seg(c, 1, 2);
    drawFog(ctx, CURVES.top - 8, AXIS_Y, { alpha: curveA });
    drawRailAxis(ctx, AXIS_Y, { alpha: curveA, logSnr: false });
    text(ctx, 'readability of each mode', RAIL.x0, CURVES.top - 14, { font: font.mono, size: 12, color: P.muted, alpha: curveA });
    for (let k = N - 1; k >= 0; k--) {
      meterCurve(ctx, F.l[k], CURVES.top, CURVES.h, { colour: colourOf(k), alpha: curveA * (k === 0 || k === N - 1 ? 0.95 : 0.4), width: k === 0 || k === N - 1 ? 2 : 1 });
    }
    const firstX = railX(F.first);
    const lastX = railX(F.last);
    glyph(ctx, 'rg', firstX, CURVES.top + CURVES.h / 2, { r: 9, estimator: 'exact', alpha: curveA, fill: 0.5 });
    glyph(ctx, 'mode', lastX, CURVES.top + CURVES.h / 2, { r: 9, estimator: 'exact', colour: P.stiff, alpha: curveA, fill: 0.5 });
    text(ctx, 'size (mode 1)', firstX + 14, CURVES.top + CURVES.h / 2 - 12, { font: font.mono, size: 11, color: P.global, alpha: curveA });
    text(ctx, `mode ${N}`, lastX - 14, CURVES.top + CURVES.h / 2 - 12, { font: font.mono, size: 11, color: P.stiff, align: 'right', alpha: curveA });
    text(ctx, 'principal modes, not bonds: a Cartesian bond is half erased at 0.0004', RAIL.x1, CURVES.top - 14, { font: font.mono, size: 11, color: P.muted, align: 'right', alpha: seg(c, 12, 13) });

    // ---- dose–response: trained size error at four exponents ----
    const dA = seg(c, 25, 26.5);
    if (dA > 0.003) {
      line(ctx, DOSE.x, DOSE.y + DOSE.h, DOSE.x + DOSE.w, DOSE.y + DOSE.h, { color: P.line, width: 1.5, alpha: dA });
      line(ctx, DOSE.x, DOSE.y, DOSE.x, DOSE.y + DOSE.h, { color: P.line, width: 1.5, alpha: dA });
      for (const v of [0, 0.2, 0.4, 0.6]) {
        text(ctx, v.toFixed(1), DOSE.x - 8, dy(v) + 4, { font: font.mono, size: 11, color: P.dim, align: 'right', alpha: dA });
        if (v) line(ctx, DOSE.x, dy(v), DOSE.x + DOSE.w, dy(v), { color: P.grid, width: 1, alpha: dA });
      }
      for (const g of [0, 0.25, 0.5, 1]) text(ctx, String(g), gx(g), DOSE.y + DOSE.h + 18, { font: font.mono, size: 12, color: P.muted, align: 'center', alpha: dA });
      text(ctx, 'γ', DOSE.x + DOSE.w + 12, DOSE.y + DOSE.h + 6, { font: font.display, italic: true, size: 18, color: P.muted, alpha: dA });
      text(ctx, 'size error, Rg W1 (Å)', DOSE.x, DOSE.y - 14, { font: font.mono, size: 12, color: P.muted, alpha: dA });
      badge(ctx, 'M', DOSE.x + 190, DOSE.y - 18, { alpha: dA, size: 11 });
      // floor
      line(ctx, DOSE.x, dy(RG.floor), DOSE.x + DOSE.w, dy(RG.floor), { color: P.dim, width: 1, dash: [3, 4], alpha: dA });
      text(ctx, `floor ${RG.floor} Å`, DOSE.x + DOSE.w - 4, dy(RG.floor) - 5, { font: font.mono, size: 10, color: P.dim, align: 'right', alpha: dA });
      // the dots, with the seed-spread yardstick on one-seed points
      GAMMAS.forEach((key, i) => {
        const a = dA * seg(c, 26 + 1.2 * i, 27 + 1.2 * i);
        const g = Number(key);
        const vals = RG.value[key];
        vals.forEach((v, s) => {
          const x = gx(g) + (vals.length > 1 ? (s ? 6 : -6) : 0);
          if (vals.length === 1) {
            line(ctx, x, dy(v - WHISK[1] / 2), x, dy(v + WHISK[1] / 2), { color: P.global, width: 1, alpha: a * 0.45 });
            line(ctx, x, dy(v - WHISK[0] / 2), x, dy(v + WHISK[0] / 2), { color: P.global, width: 3, alpha: a * 0.7 });
          }
          dot(ctx, x, dy(v), 6, P.global, a);
        });
        text(ctx, vals.map((v) => v.toFixed(3)).join(' / '), gx(g) + 12, dy(vals[0]) - 8, { font: font.mono, size: 11, color: P.body, alpha: a });
      });
      text(ctx, `measured at four exponents only · one seed each except γ = 1 · whiskers: two-seed spreads ${WHISK[0]}–${WHISK[1]} Å (#1069)`, DOSE.x, 478, { font: font.mono, size: 10, color: P.muted, alpha: dA });
      budget(ctx, 'g1057.rg', DOSE.x, 494, { alpha: dA, size: 10 });

      // the reverse dose: Cartesian pure modes, γ 0 → 0.5
      const rA = seg(c, 44, 45.5);
      [0, 0.5].forEach((g, i) => {
        const x = gx(g) - 18;
        ctx.save();
        ctx.globalAlpha *= rA;
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(x - 5, dy(DOSE_RG[i]) - 5, 10, 10);
        ctx.restore();
      });
      line(ctx, gx(0) - 18, dy(DOSE_RG[0]), gx(0.5) - 18, dy(DOSE_RG[1]), { color: P.ink, width: 1, dash: [3, 4], alpha: rA * 0.7 });
      text(ctx, `□ Cartesian, pure modes (reverse dose): size ${DOSE_RG[0]} → ${DOSE_RG[1]} Å, bonds ${DOSE_BOND[0]} → ${DOSE_BOND[1]} Å`, DOSE.x, 510, { font: font.mono, size: 10, color: P.ink, alpha: rA });

      // the handle's position on the dose axis
      const hA = seg(c, 56, 57);
      line(ctx, gx(gamma), DOSE.y, gx(gamma), DOSE.y + DOSE.h + 4, { color: P.gold, width: 2, alpha: hA });
      const near = nearestTrained(gamma);
      text(ctx, `nearest trained: γ = ${near} → ${RG.value[String(near)].map((v) => v.toFixed(3)).join(' / ')} Å`, gx(gamma) + (gamma > 0.6 ? -8 : 8), DOSE.y + 14, { font: font.mono, size: 11, color: P.gold, align: gamma > 0.6 ? 'right' : 'left', alpha: hA });
    }

    // ---- torsions and populations do not follow ----
    const mA = seg(c, 38, 39.5);
    if (mA > 0.003) {
      const mini = (row, label, rowData, max, unit, floor) => {
        const y0 = MINI.y + row * (MINI.h + MINI.gap);
        text(ctx, label, DOSE.x - 8, y0 + MINI.h / 2 + 4, { font: font.mono, size: 11, color: P.muted, align: 'right', alpha: mA });
        line(ctx, DOSE.x, y0 + MINI.h, DOSE.x + DOSE.w, y0 + MINI.h, { color: P.line, width: 1, alpha: mA });
        if (floor !== undefined) line(ctx, DOSE.x, y0 + MINI.h - (MINI.h * floor) / max, DOSE.x + DOSE.w, y0 + MINI.h - (MINI.h * floor) / max, { color: P.dim, width: 1, dash: [3, 4], alpha: mA });
        GAMMAS.forEach((key) => {
          rowData.value[key].forEach((v, s, all) => {
            const x = gx(Number(key)) + (all.length > 1 ? (s ? 6 : -6) : 0);
            dot(ctx, x, y0 + MINI.h - (MINI.h * v) / max, 4.5, P.soft, mA);
          });
          text(ctx, seeds(rowData.value[key]), gx(Number(key)) + 10, y0 + 10, { font: font.mono, size: 10, color: P.muted, alpha: mA });
        });
        text(ctx, unit, DOSE.x + DOSE.w + 6, y0 + MINI.h, { font: font.mono, size: 10, color: P.dim, alpha: mA });
      };
      mini(0, 'torsion error', TOR, 12, '°');
      mini(1, 'population JS', TIC, 0.12, 'nats', TIC.floor);
    }

    // ---- the windows understated; the lesson ----
    const uA = fade(c, 54, 55.5, 73, 74) * (live.exploring ? 1 : 1);
    wrap(ctx, `The readable windows ranked these arms correctly but understated the differences: γ 0 → 0.5 shrinks the size window by ${Math.round(UNDER[0] * 100)}% and multiplies the error by ${UNDER[1]} (note 27 §7; #1057).`, 90, 720, 720, 22, { font: font.mono, size: 13, color: P.body, alpha: uA });

    // ---- the promise recaptioned ----
    const pA = seg(c, 74, 75.5) * (live.exploring ? 0 : 1);
    if (pA > 0.003) {
      const x0 = 90;
      const y0 = 700;
      for (let k = 0; k < 9; k++) glyph(ctx, 'mode', x0 + 20, y0 + 10 + k * 15, { r: 6, estimator: 'exact', colour: rampColour((0.5 * k) / 8), alpha: pA, fill: 0.5 });
      text(ctx, 'the promise (Episode 2): erase everything together', x0 + 46, y0 + 22, { font: font.mono, size: 13, color: P.muted, alpha: pA });
      text(ctx, 'on BBA: range without order', x0 + 46, y0 + 58, { ...type.display, size: 28, alpha: pA });
      text(ctx, 'ALDP5 cannot test order, and its stiff modes kept the gain', x0 + 46, y0 + 88, { font: font.mono, size: 13, color: P.body, alpha: pA });
      text(ctx, 'the order hypothesis lost (11-05) on a molecule that could not test it', x0 + 46, y0 + 112, { font: font.mono, size: 12, color: P.muted, alpha: seg(c, 79, 80) * pA });
      stamp(ctx, 'REVISED ON BBA · 10-24 GOAL → 11-12/14 DIAGNOSIS', 900, y0 + 30, { colour: P.ink, alpha: seg(c, 76, 77) * pA, size: 13 });
      const lA = seg(c, 86, 87.5) * pA;
      text(ctx, 'unit variance in every direction is what erases the order;', 900, y0 + 92, { font: font.mono, size: 13, color: P.body, alpha: lA });
      text(ctx, 'the local whitening itself does not', 900, y0 + 112, { font: font.mono, size: 13, color: P.body, alpha: lA });
      badge(ctx, 'S', 900 + 330, y0 + 108, { alpha: lA, size: 11 });
      text(ctx, '#1057', 900 + 360, y0 + 112, { font: font.mono, size: 11, color: P.muted, alpha: lA });
    }
    rigStamp(ctx, `R18 · ${N} modes from collective_modes.json · λ^(1−γ) renormalised to mean 1`, barA);
  },
});
