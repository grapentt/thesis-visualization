// Checks for "Parts and Poses" (src/videos/interactions/, storyboard §2.8): the expensive guards that do
// not run at page load. Importing data.js also runs its cheap guards, which throw if a narrated number
// stopped being true. Run from the repo root with: node --test 'tests/*.test.mjs'.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/engine/random.js';
import { axisAngle, apply } from '../src/model/rotation.js';
import {
  DEG, BETA, PEROXIDE, buildWater, buildPeroxide, place, haar, centroid, V, dV, U_W, U_P, U_int, gradU_W, gradU_P,
  forcesInt, netForceTorque, gradFD, kde1,
} from '../src/videos/interactions/toy.js';
import { XSTAR, waterPosterior, referenceDraws, noisedProfiles, threeBody, threeBodyShares, reflectedKde } from '../src/videos/interactions/data.js';

const CHI2_19_DOF_P001 = 43.82; // χ² with 19 degrees of freedom, upper 0.1 % point
const SAMPLES = 20;

/** χ² of a histogram of values in [−1, 1] against the flat density (20 bins). */
function chi2Flat(values, bins = 20) {
  const counts = new Array(bins).fill(0);
  for (const v of values) counts[Math.min(bins - 1, Math.floor(((v + 1) / 2) * bins))]++;
  const expected = values.length / bins;
  return counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
}

/** Random distorted water–peroxide pairs, at least 2.6 Å apart (seed 301), and X★ of scene 11. */
const pairs = (() => {
  const rng = createRng(301);
  const jiggle = (X, s) => X.map((v) => v + s * rng.gauss());
  const out = [];
  while (out.length < SAMPLES) {
    const XA = jiggle(buildWater(), 0.05);
    const XB = place(jiggle(buildPeroxide({ tau: (rng.uniform() * 360 - 180) * DEG }), 0.05), haar(rng), [0, 1, 2].map(() => 3 * rng.gauss()));
    if (Math.hypot(...centroid(XB).map((c, k) => c - centroid(XA)[k])) > 2.6) out.push({ XA, XB });
  }
  return [...out, { XA: XSTAR.XA, XB: XSTAR.XB }];
})();

const relativeError = (g, fd) => Math.max(...g.map((v, i) => Math.abs(v - fd[i]))) / Math.max(...g.map(Math.abs));

test('analytic gradients agree with central differences', () => {
  for (const { XA, XB } of pairs) {
    assert.ok(relativeError(gradU_W(XA), gradFD(U_W, XA)) < 1e-6, 'U_W');
    assert.ok(relativeError(gradU_P(XB), gradFD(U_P, XB)) < 1e-6, 'U_P');
    const { FA, FB } = forcesInt(XA, XB);
    assert.ok(relativeError(FA.map((f) => -f), gradFD((Y) => U_int(Y, XB), XA)) < 1e-6, 'U_int, water');
    assert.ok(relativeError(FB.map((f) => -f), gradFD((Y) => U_int(XA, Y), XB)) < 1e-6, 'U_int, peroxide');
  }
});

test('monomer scores have no net force and no net torque', () => {
  for (const { XA, XB } of pairs) {
    for (const [X, g] of [[XA, gradU_W(XA)], [XB, gradU_P(XB)]]) {
      const { force, torque } = netForceTorque(X, g.map((v) => -BETA * v));
      assert.ok(force < 1e-12 && torque < 1e-12, `net force ${force}, torque ${torque}`);
    }
  }
});

test('interaction forces obey the third law, with no total torque about any one point', () => {
  const rng = createRng(302);
  for (const { XA, XB } of pairs) {
    const { FA, FB } = forcesInt(XA, XB);
    const point = [0, 1, 2].map(() => 3 * rng.gauss());
    const both = netForceTorque([...XA, ...XB], [...FA, ...FB], point);
    assert.ok(both.force < 1e-12, `F_A + F_B = ${both.force}`);
    assert.ok(both.torque < 1e-12, `total torque ${both.torque}`);
  }
});

test('U_int is invariant under a joint rigid motion', () => {
  const rng = createRng(303);
  for (const { XA, XB } of pairs) {
    const R = haar(rng), t = [0, 1, 2].map(() => 5 * rng.gauss());
    const move = (X) => Array.from({ length: X.length / 3 }, (_, i) => apply(R, X.slice(3 * i, 3 * i + 3)).map((v, k) => v + t[k])).flat();
    assert.ok(Math.abs(U_int(move(XA), move(XB)) - U_int(XA, XB)) < 1e-10);
  }
  // and is not invariant under turning one molecule alone
  const { XA, XB } = pairs[0];
  const c = centroid(XB), R = axisAngle([0, 0, 1], 0.5);
  const turned = Array.from({ length: 4 }, (_, i) => apply(R, XB.slice(3 * i, 3 * i + 3).map((v, k) => v - c[k])).map((v, k) => v + c[k])).flat();
  assert.ok(Math.abs(U_int(XA, turned) - U_int(XA, XB)) > 1e-6);
});

test('the torsion fit reproduces its four conditions', () => {
  const t0 = PEROXIDE.tau0;
  for (const [value, target] of [[V(0), 7], [V(Math.PI), 1.1], [V(t0), 0], [dV(t0), 0], [V(-t0), 0]]) assert.ok(Math.abs(value - target) < 1e-10);
});

test('scene 02: the posterior behind a noisy water has an effective sample size of at least 30', () => {
  for (const count of [20000, 60000]) {
    const { nEff } = waterPosterior(count);
    assert.ok(nEff >= 30, `${count} proposals: N_eff = ${nEff}`);
  }
});

test('scene 07: u is uniform under the reference', () => {
  const chi2 = chi2Flat(referenceDraws.u);
  assert.ok(chi2 < CHI2_19_DOF_P001, `χ² = ${chi2} over ${referenceDraws.N} draws`);
});

test('scene 09: u stays uniform under the noised reference', () => {
  for (const { sigma, u } of noisedProfiles.referenceU) {
    const chi2 = chi2Flat(u);
    assert.ok(chi2 < CHI2_19_DOF_P001, `σ = ${sigma}: χ² = ${chi2}`);
  }
});

test('scene 16: three-body shares are converged in the quadrature step', () => {
  const fine = threeBodyShares({ refine: 2 });
  threeBody.shares.forEach((row, i) => {
    assert.ok(Math.abs(row.share - fine[i].share) < 0.001, `σ = ${row.sigma}: ${row.share} vs ${fine[i].share} at h/2`);
  });
});

test('the truncated reflected KDE agrees with toy.kde1', () => {
  const rng = createRng(304);
  const values = Array.from({ length: 300 }, () => Math.tanh(rng.gauss()));
  const grid = Array.from({ length: 81 }, (_, i) => -1 + i / 40);
  const ours = reflectedKde(values, grid, 0.05), theirs = kde1(values, null, grid, 0.05);
  const top = Math.max(...theirs);
  ours.forEach((v, i) => assert.ok(Math.abs(v - theirs[i]) < 1e-5 * top));
});
