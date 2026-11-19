// Rig checks for the "Where to Add the Noise" programme (programme.md §5). Expected values come from
// the number canon (g4) and the verifiers; thresholds were fixed before the rigs were first run.
// Run from the repo root: node --test 'tests/**/*.test.mjs'

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as vp from '../../src/model/thesis/vp.js';
import * as meter from '../../src/model/thesis/meter.js';
import { trainingShare, inRange, effectRule } from '../../src/model/thesis/evidence.js';
import { libraryUnits, gammaSpectrum, ratio, halfLevels, gammaForHalfAt } from '../../src/model/thesis/spectrum.js';
import { helmert, beadWeights, rouse, dotProduct as dot } from '../../src/model/thesis/modes.js';
import { ev, budgetChip, claimWord, ledgerIds } from '../../src/model/thesis/ledger.js';
import { railX, RAIL } from '../../src/draw/thesis/rail.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../../src/data/thesis/${name}`, import.meta.url))).data;
const close = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b} (±${tol})`);

test('R1 · VP schedule (g4 §3.3)', () => {
  close(vp.alpha(0.01), 0.999003, 1e-6, 'α(0.01)');
  close(vp.sigma(0.01), 0.044643, 1e-6, 'σ(0.01)');
  close(vp.noiseToSignal(0.05), 0.17414, 1e-5, 's(0.05)');
  close(vp.alpha(1), 0.006572, 1e-6, 'α(1)');
  close(vp.logSnr(0.259), 0, 0.01, 'ℓ(0.259)');
  close(vp.tHalf(1), 0.259, 5e-4, 't½(1)');
  close(vp.tHalf(15.5), 0.526, 5e-4, 't½(15.5)');
  close(vp.tHalf(0.011), 0.0285, 5e-4, 't½(0.011)');
  close(vp.tHalf(0.003), 0.013, 5e-4, 't½(0.003)');
  close(vp.tHalf(4.2e-5), 0.0004, 5e-5, 't½(4.2e-5)');
  for (const t of [1e-5, 0.01, 0.3, 0.9]) close(vp.tAtLogSnr(vp.logSnr(t)), t, 1e-9, 'ℓ round trip');
});

test('R2 · meter (r4 E1; g3 C2)', () => {
  [[0.01, 0.027], [0.1, 0.093], [10, 0.486], [100, 0.676]].forEach(([l, t]) => close(vp.tHalf(l), t, 5e-4, `t½(${l})`));
  close(meter.readability(vp.tHalf(0.3), 0.3), 0.5, 1e-9, 'r = ½ at t½');
  const [a, b] = meter.decisionWindow(2.5);
  close(b - a, 2.77, 0.005, 'window span');
  close(meter.DECISION_SPAN, 2.7726, 1e-4, 'ln 16');
  // 100× more variance moves t½ only 0.093 → 0.486
  close(vp.tHalf(10) - vp.tHalf(0.1), 0.393, 0.002, 'λ 0.1 → 10');
});

test('R3 · ALDP5 nine rulers (g1 §3.1; E2.3)', () => {
  const widths = ev('aldp5.widths').value;
  const unit = ev('aldp5.pilotUnit').value;
  const flat = widths.map((w) => vp.tHalf((w / unit) ** 2));
  const expected = [0.00483, 0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196];
  flat.forEach((t, k) => close(t, expected[k], 0.0006 * Math.max(1, expected[k] / 0.02), `flat t½ mode ${k + 1}`));
  const shares = flat.map((t) => trainingShare(t, vp.T_MIN_INTERNAL) * 100);
  [0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9, 18.8].forEach((s, k) => close(shares[k], s, 0.06, `share mode ${k + 1}`));
  assert.equal(flat.filter((t) => !inRange(t, vp.T_MIN_INTERNAL)).length, 5, 'five modes out of range');
  close(trainingShare(vp.tHalf(1), vp.T_MIN_INTERNAL) * 100, 25.2, 0.06, 'unit channel share (25.15, printed 25.2)');
  close(gammaForHalfAt((widths[0] / unit) ** 2, Math.expm1(vp.integratedBeta(0.01))), 0.142, 0.002, 'stiffest enters the band');
  const spreadAt = (g) => {
    const t = gammaSpectrum(widths.map((w) => (w / unit) ** 2), g, { unitMean: false }).map(vp.tHalf);
    return Math.max(...t) / Math.min(...t);
  };
  close(spreadAt(0), 40.6, 0.2, 'spread γ = 0');
  close(spreadAt(0.5), 4.8, 0.1, 'spread γ = 0.5');
  close(spreadAt(0.75), 2.0, 0.1, 'spread γ = 0.75');
  // own scale 0.267 Å with floor 1e-5: every mode gets a usable share, the stiffest 2.5%
  const own = widths.map((w) => trainingShare(vp.tHalf((w / ev('aldp5.ownUnit').value) ** 2), vp.T_MIN_CARTESIAN));
  close(own[0] * 100, 2.5, 0.05, 'own-scale stiffest share');
  assert.ok(own.every((s) => s >= 0.01));
  // the asset reproduces the logged widths
  load('aldp5-modes.json').widths_A.forEach((w, k) => close(w / widths[k], 1, 0.02, `A1 width ${k + 1}`));
});

test('R18 · BBA spectrum and the γ dial (v-numbers N2; Fe-F11)', () => {
  const m = load('bba-modes.json');
  const { c0, lambda } = libraryUnits(m.ms_A2);
  close(c0, 0.15706, 1e-5, 'c₀');
  close(lambda.reduce((a, b) => a + b, 0), 27, 1e-9, 'Σ = 27');
  close(lambda[0], 15.031, 0.001, 'λ₁');
  close(lambda[26], 0.0105, 0.0001, 'λ₂₇');
  close(ratio(lambda), 1428, 1, 'ratio');
  assert.ok(Math.abs(ratio(lambda) / ev('bba.ratio.n27').value - 1) < 0.005, 'within 0.5% of n27');
  const t0 = halfLevels(gammaSpectrum(lambda, 0));
  close(t0[0], 0.5231, 2e-4, 'first t½ γ = 0');
  close(t0[26], 0.0278, 2e-4, 'last t½ γ = 0');
  [[0.25, 232, 0.5, 0.065], [0.5, 38, 0.45, 0.13], [0.75, 6.1, 0.37, 0.2], [1, 1, 0.26, 0.26]].forEach(([g, r, a, b]) => {
    const l = gammaSpectrum(lambda, g);
    close(ratio(l), r, r * 0.02, `ratio γ = ${g}`);
    const t = halfLevels(l);
    close(t[0], a, 0.006, `first t½ γ = ${g}`);
    close(t[26], b, 0.006, `last t½ γ = ${g}`);
  });
});

test('R26 · collective modes on the chain', () => {
  const m = load('bba-modes.json');
  const h = helmert(28);
  // H is orthonormal and translation-free
  for (let j = 0; j < 27; j++) {
    close(h.reduce((a, row) => a + row[j], 0), 0, 1e-12, 'column sum');
    close(h.reduce((a, row) => a + row[j] * row[j], 0), 1, 1e-12, 'column norm');
  }
  const w = m.V.slice(0, 4).map((v) => beadWeights(v, h));
  [0.990553, 0.985402, 0.91424, 0.915233].forEach((o, q) => close(Math.abs(dot(w[q], rouse(q + 1, 28))), o, 1e-5, `Rouse overlap ${q + 1}`));
  const sign = w[0].map(Math.sign);
  const flips = sign.map((s, i) => (i && s !== sign[i - 1] ? i : -1)).filter((i) => i > 0);
  // computed from the file: the sign change sits between beads 15 and 16 (1-based), one bead past the
  // chain's middle; the programme draft's "between beads 13 and 14" was off (corrected in the scene)
  assert.deepEqual(flips, [15], 'mode 1 changes sign between beads 15 and 16 (1-based)');
});

test('R30 · training share and the effect rule (g4)', () => {
  close(trainingShare(0.0004, 1e-5) * 100, 0.039, 0.001, 'Cartesian bonds 0.04%');
  close(trainingShare(0.259, 0.01) * 100, 25.2, 0.05, 'C3 bonds 25%');
  assert.equal(effectRule([0.117, 0.091], [0.071, 0.077]).effect, true);
  close(effectRule([0.117, 0.091], [0.071, 0.077]).gap, 0.03, 1e-9, 'gap');
});

test('R31 · rail anchors (programme §3.3, ±1 px)', () => {
  [[1e-5, 140], [4e-4, 406], [0.01, 683], [0.05, 877], [0.1, 973], [0.26, 1128], [0.5, 1303], [0.7, 1480]].forEach(([t, x]) => close(railX(t), x, 1, `x(${t})`));
  assert.equal(RAIL.x0, 140);
});

test('ledger · rows, chips and the "predicted" guard', () => {
  assert.ok(ledgerIds().length > 10);
  assert.match(budgetChip(ev('r1088.ordered.rg')), /190,350 upd \(10%\) · s2\/s3 · 100k mol · floor 0.006 Å · #1088/);
  assert.throws(() => claimWord(ev('g1057.rg'), 'predicted'));
  assert.equal(claimWord(ev('r1071.corner'), 'predicted'), 'predicted');
  for (const id of ledgerIds()) {
    const r = ev(id);
    assert.ok(['M', 'D', 'D·model', 'H', 'S', 'I'].includes(r.badge), `${id} badge`);
    assert.ok(r.source, `${id} source`);
    if (r.badge === 'M' && r.budget && !r.panel) assert.ok(r.seeds && r.N, `${id}: a trained number needs seeds and count`);
  }
});

test('A12 · first-order windows from the run reproduce the canon', () => {
  const c = load('bba-charts.json');
  close(c.t_half['radius of gyration'].internal, 0.19, 0.005, 'internal Rg');
  close(c.t_half['radius of gyration']['+2'], 0.44, 0.005, '+2 Rg');
  close(c.t_half['end-to-end distance'].internal, 0.14, 0.005, 'internal end-to-end');
  close(c.t_half['pairs >= 11 apart']['+2'], 0.29, 0.005, '+2 ≥ 11 apart');
  const block = c.constraint_block_share;
  [[0.742, 0.874, 0.961]].forEach((x) => block['+2'].forEach((b, i) => close(1 - b, x[i], 0.001, 'internal share natural')));
});

test('E5.3 lanes · every narrated range and order verdict', async () => {
  const { LANES, rangeOf, levelOf, sizeWithoutBonds } = await import('../../src/videos/flipped-handle/lanes.js');
  const lane = (id) => LANES.find((l) => l.id === id);
  // Cartesian: order without range (bonds 0.04% of draws), size last
  const cart = rangeOf(lane('cartesian'));
  assert.equal(cart.range, false);
  close(cart.shares.bond * 100, 0.039, 0.001, 'Cartesian bond share');
  assert.ok(levelOf(lane('cartesian'), 'rg') > levelOf(lane('cartesian'), 'torsion'), 'Cartesian size after torsions');
  // internal: range without order, anti-order end-to-end 0.18 < torsions 0.35
  assert.equal(rangeOf(lane('internal')).range, true);
  assert.ok(levelOf(lane('internal'), 'endtoend') < levelOf(lane('internal'), 'torsion'), 'anti-order');
  close(rangeOf(lane('internal')).shares.bond * 100, 25.25, 0.1, 'C3 bonds 25%');
  // ordered (first order): range, and size the last glyph
  const ord = lane('ordered');
  assert.equal(rangeOf(ord).range, true);
  const rg = levelOf(ord, 'rg');
  assert.ok(ord.glyphs.filter((g) => g.estimator === 'first').every((g) => g.t <= rg), 'size erased last at first order');
  close(rg, 0.44, 0.005, 'ordered Rg first order');
  // the probe "knows its size, lost its bonds": Cartesian 0.0004–0.47, ordered 0.26–0.44, C3 0.26–0.28
  const [a, b] = sizeWithoutBonds(lane('internal'));
  close(b - a, 0.02, 0.0051, 'C3 almost none');
  close(sizeWithoutBonds(ord)[1], 0.444, 0.001, 'ordered top');
  close(sizeWithoutBonds(lane('cartesian'))[1], 0.47, 1e-9, 'Cartesian top');
});
