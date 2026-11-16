// The mathematical contract of "What the noise should keep" (src/videos/retention).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  erf, erfc, normalCdf, normalQuantile, COORDINATES, ou, ouPaths, TWO_BASINS, WRONG_MODEL, mixturePdf, mixtureVariance,
  gaussianize, gaussianizeSlope, closure, closureTable, LINE, linspace, flowIdentity, circleFisher, retainedFractions,
  symmetricEigenvalues, linePosterior, normalPdf,
} from '../src/videos/retention/math.js';
import { grid, CHANNELS, OBSERVABLES, retention, retentionDirect, curves, SIGMAS, posterior, tilted, samples, whiten, whitenJacobian, bondMean, bondSd, torsionDensity, PHI, R, membership } from '../src/videos/retention/toy.js';

const near = (a, b, tol = 1e-9, what = '') => assert.ok(Math.abs(a - b) <= tol, `${what} ${a} != ${b} (tolerance ${tol})`);

test('special functions: erf, erfc, Φ and Φ⁻¹ agree with reference values and invert each other', () => {
  near(erf(1), 0.8427007929497149, 1e-14);
  near(erf(3), 0.9999779095030014, 1e-14);
  near(erfc(4), 1.541725790028002e-8, 1e-20);
  near(erfc(-3), 2 - erfc(3), 1e-14);
  near(normalQuantile(0.975), 1.959963984540054, 1e-12);
  for (const p of [1e-9, 0.01, 0.3, 0.5, 0.8, 0.999]) near(normalCdf(normalQuantile(p)), p, 1e-13 * Math.max(1, 1 / p));
});

test('harmonic coordinate: F_τ = J_τ² / C_τ, with the short- and long-lag limits of the table', () => {
  for (const c of Object.values(COORDINATES)) {
    for (const tau of [1e-4, 1e-2, 0.5, 3]) {
      const J = Math.exp(-c.k * tau);
      near(ou.fisher(c, tau), (J * J) / ou.conditionalVariance(c, tau), 1e-9 * ou.fisher(c, tau), c.name);
    }
    const short = 1e-6;
    near(ou.conditionalVariance(c, short) / (2 * c.D * short), 1, 2e-3, `${c.name} C_τ → 2Dτ`);
    near(ou.fisher(c, short) * 2 * c.D * short, 1, 2e-3, `${c.name} F_τ → 1/(2Dτ)`);
    near(ou.conditionalVariance(c, 100 / c.k), ou.variance(c), 1e-12, `${c.name} C_τ → v`);
    assert.ok(ou.fisher(c, 20 / c.k) < 1e-12 / ou.variance(c), `${c.name} F_τ → 0`);
    near(ou.increment(c, 1e-6) / (c.D * 1e-6), 1, 2e-3, 'increment → Dτ');
  }
  // the thermal metric ranks the bond above the torsion; the finite-lag Fisher information never does
  assert.ok(1 / ou.variance(COORDINATES.bond) > 1 / ou.variance(COORDINATES.torsion));
  for (const tau of [1e-4, 1e-3, 1e-2, 0.1, 1]) assert.ok(ou.fisher(COORDINATES.bond, tau) <= ou.fisher(COORDINATES.torsion, tau) + 1e-12);
  // at 1 ps the bond's step width is its equilibrium width; the torsion's is not
  near(ou.increment(COORDINATES.bond, 1) / ou.variance(COORDINATES.bond), 1, 1e-12);
  assert.ok(ou.increment(COORDINATES.torsion, 1) / ou.variance(COORDINATES.torsion) < 0.7);
});

test('exact sample paths have the conditional mean and variance of the formulas', () => {
  const c = COORDINATES.torsion;
  const paths = ouPaths(c, { x0: 3, count: 4000, steps: 40, dt: 0.05, seed: 3 });
  for (const n of [4, 20, 40]) {
    const tau = n * 0.05;
    const values = paths.map((p) => p[n]);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    near(mean, ou.mean(c, tau, 3), 0.06, `mean at ${tau}`);
    near(variance, ou.conditionalVariance(c, tau), 0.06, `variance at ${tau}`);
  }
});

test('the Gaussianising map sends the two-basin density to N(0, 1) and L_W φ = −φ with W = 1/φ′²', () => {
  const { xs, p, z, h } = LINE;
  const mass = p.reduce((s, v) => s + v * h, 0);
  near(mass, 1, 1e-6);
  const mean = z.reduce((s, v, i) => s + p[i] * v * h, 0);
  const variance = z.reduce((s, v, i) => s + p[i] * v * v * h, 0) - mean * mean;
  near(mean, 0, 1e-5);
  near(variance, 1, 1e-4);
  for (const x of [-1.5, -0.4, 0.5, 1.9, 2.8]) near(gaussianizeSlope(x), (gaussianize(x + 1e-6) - gaussianize(x - 1e-6)) / 2e-6, 1e-5, 'slope');
  const warped = closureTable().z.warped;
  let worst = 0;
  let meanSquare = 0;
  for (let i = 0; i < xs.length; i++) {
    const gap = warped.Lu[i] + warped.uc[i];
    meanSquare += p[i] * gap * gap * h;
    if (p[i] > 1e-2) worst = Math.max(worst, Math.abs(gap)); // pointwise where the density is not tiny
  }
  assert.ok(worst < 2e-3, `L_W φ = −φ fails by ${worst} in the basins`);
  assert.ok(Math.sqrt(meanSquare) < 2e-3, `L_W φ = −φ fails by ${Math.sqrt(meanSquare)} in L²(p)`);
  near(warped.ratio, 1, 1e-4, 'Γ_SM = Γ_MLE');
});

test('score-matching residual: orthogonal to u, E[(L_W u) u] = −G, and the two variance formulas agree', () => {
  const table = closureTable();
  for (const u of ['x', 'z']) {
    for (const W of ['flat', 'warped']) {
      const c = table[u][W];
      near(c.cross, -c.G, 1e-3 * c.G, `${u} ${W} cross`);
      near(c.orthogonality, 0, 1e-4 * c.G, `${u} ${W} orthogonality`);
      near(c.ratio, c.ratioSandwich, 1e-3 * c.ratio, `${u} ${W} ratio`);
      assert.ok(c.ratio >= 1 - 1e-9);
    }
  }
  assert.ok(table.x.flat.ratio > 5, 'u = x under flat mobility is far from efficient on two basins');
  assert.ok(table.z.flat.ratio > 1.5 && table.x.warped.ratio > 100, 'only the matched pair closes');
  // one Gaussian with u = x and W = 1 is exactly efficient
  const xs = linspace(-6, 6, 2401);
  const g = { weights: [1], means: [0.3], sds: [0.8] };
  const c = closure({ xs, p: Float64Array.from(xs, (x) => mixturePdf(x, g)), u: Float64Array.from(xs), W: new Float64Array(xs.length).fill(1) });
  near(c.ratio, 1, 1e-6);
  near(c.I, 0.64, 1e-6);
  // the warped mobility is largest in the barrier between the basins
  const at = (x) => LINE.mobility[Math.round((x + 3) / LINE.h)];
  assert.ok(at(0.45) > 1e4 * at(-1.0) && at(0.45) > 1e4 * at(1.9));
});

test('flow identity: the drop in KL equals the integrated score error in the mobility norm', () => {
  const { drop, integral } = flowIdentity(TWO_BASINS, WRONG_MODEL, 0.6);
  assert.ok(drop > 0.1);
  near(integral, drop, 2e-4 * drop);
});

test('Brownian motion on the circle: F_τ ≈ 1/τ at short times, 2e^{−τ} at long times, τ F_τ → 0', () => {
  near(circleFisher(0.02) * 0.02, 1, 1e-3);
  near(circleFisher(8) / (2 * Math.exp(-8)), 1, 1e-3);
  let previous = 1 + 1e-9;
  for (const tau of [0.05, 0.2, 0.5, 1, 2, 4, 8]) {
    const g = tau * circleFisher(tau);
    assert.ok(g <= previous && g <= 1 + 1e-9, `τF_τ at ${tau} is ${g}`);
    previous = g;
  }
  assert.ok(8 * circleFisher(8) < 0.01);
});

test('Gaussian denoising on the line: the slope of the posterior mean is the posterior variance over σ²', () => {
  for (const sigma of [0.3, 0.8]) {
    for (const y of [-1.2, 0.2, 1.5]) {
      const h = 1e-4;
      const slope = (linePosterior(y + h, sigma).mean - linePosterior(y - h, sigma).mean) / (2 * h);
      near(slope, linePosterior(y, sigma).variance / (sigma * sigma), 1e-5, `y = ${y}, σ = ${sigma}`);
    }
  }
});

test('toy: the grid is a probability distribution with the designed moments', () => {
  near(grid.p.reduce((s, v) => s + v, 0), 1, 1e-12);
  near(grid.means[3], 0.35, 2e-3, 'basin B population');
  near(grid.means[2], 0, 1e-3, 'within-basin deviation is centred');
  let mass = 0;
  for (let i = 0; i < 4000; i++) mass += (torsionDensity(-Math.PI + ((i + 0.5) * 2 * Math.PI) / 4000) * 2 * Math.PI) / 4000;
  near(mass, 1, 1e-6);
  near(membership(1.9), 1, 1e-6);
  near(membership(-1.0), 0, 1e-6);
  near(CHANNELS.local.scale[1], 0.35, 1e-12);
  assert.ok(CHANNELS.global.scale[1] > 1.3 && CHANNELS.global.scale[1] < 1.6);
  near(CHANNELS.local.scale[0], 0.05 * (1 + 0.2 * samples.reduce((s, q) => s + Math.cos(q.phi), 0) / samples.length), 5e-3);
});

test('toy: the separable retention pass equals brute force, and I₀ − I_t = E[Cov(u | X_t)]', () => {
  for (const [channel, sigma] of [[CHANNELS.flat, 0.3], [CHANNELS.local, 1.5]]) {
    const fast = retention(channel.scale, sigma);
    const direct = retentionDirect(channel.scale, sigma);
    for (let k = 0; k < 4; k++) {
      for (let l = 0; l < 4; l++) {
        near(fast.cov[k][l], direct.cov[k][l], 1e-12, `${channel.key} I_t[${k}][${l}]`);
        near(direct.cov[k][l] + direct.within[k][l], grid.cov0[k][l], 1e-12, `${channel.key} total covariance [${k}][${l}]`);
      }
    }
  }
});

test('toy: the retention curves say what the narration says', () => {
  const at = (channel, key, sigma) => {
    const k = OBSERVABLES.findIndex((o) => o.key === key);
    const i = Array.from(SIGMAS).findIndex((s) => Math.abs(Math.log10(s / sigma)) < 0.08);
    assert.ok(i >= 0, `no sweep point near ${sigma}`);
    return curves[channel][k][i];
  };
  for (const channel of Object.keys(curves)) {
    for (const curve of curves[channel]) {
      assert.ok(curve[0] > 0.98 && curve[curve.length - 1] < 0.01, `${channel} runs from 1 to 0`);
      for (let i = 1; i < curve.length; i++) assert.ok(curve[i] <= curve[i - 1] + 1e-4, `${channel} is monotone`);
    }
  }
  // flat: the bond first, then the torsion within its basin, the basin population last
  const s = Math.pow(10, -2.5 + 4 * 14 / 28); // the middle of the sweep, σ ≈ 0.316
  assert.ok(at('flat', 'bond', s) < 0.1 && at('flat', 'torsion', s) > 0.4 && at('flat', 'basin', s) > 0.95);
  // local widths: bond and within-basin torsion lose information together; the basin survives
  assert.ok(Math.abs(at('local', 'bond', 1) - at('local', 'torsion', 1)) < 0.12);
  assert.ok(at('local', 'basin', 1) > 0.95 && at('local', 'basin', 3) > 0.4);
  // global covariance: the torsion within its basin is erased first
  assert.ok(at('global', 'torsion', 0.3) < at('global', 'bond', 0.3) - 0.3 && at('global', 'torsion', 0.3) < at('global', 'basin', 0.3) - 0.3);
  // widths go as the square of positions, up to the coupling
  near(at('local', 'width', 1), at('local', 'bond', 1) ** 2, 0.08);
});

test('toy: the eigenvalues of R_t are between 0 and 1 and do not depend on how the observables are recombined', () => {
  const It = retention(CHANNELS.flat.scale, 0.2).cov;
  const lambda = retainedFractions(grid.cov0, It);
  for (const v of lambda) assert.ok(v > -1e-9 && v < 1 + 1e-9);
  const M = [[1, 0.5, 0, 0], [0, 2, 0, 0], [0.3, 0, 1, 0.2], [0, 0, 0, 0.7]];
  const mix = (A) => M.map((row) => M.map((col) => row.reduce((s, mi, i) => s + mi * col.reduce((t, mj, j) => t + mj * A[i][j], 0), 0)));
  const lambda2 = retainedFractions(mix(grid.cov0), mix(It));
  lambda.forEach((v, i) => near(v, lambda2[i], 1e-9, 'recombination'));
  const eig = symmetricEigenvalues([[2, 1], [1, 2]]);
  near(eig[0], 3, 1e-12);
  near(eig[1], 1, 1e-12);
});

test('toy: tilting along an observable changes exactly that statistic, with the covariance as the rate', () => {
  const theta = 0.02 / Math.sqrt(grid.cov0[0][0]);
  for (let k = 0; k < 4; k++) {
    const q = tilted(k, theta / Math.sqrt(grid.cov0[k][k]) * Math.sqrt(grid.cov0[0][0]));
    const t = theta / Math.sqrt(grid.cov0[k][k]) * Math.sqrt(grid.cov0[0][0]);
    for (let l = 0; l < 4; l++) {
      const shift = q.reduce((s, v, c) => s + v * grid.u[l][c], 0);
      near(shift, t * grid.cov0[l][k], 0.05 * Math.abs(t) * Math.sqrt(grid.cov0[l][l] * grid.cov0[k][k]) + 1e-12, `tilt ${k} moves ${l}`);
    }
  }
});

test('toy: the posterior at tiny noise is the clean point and at huge noise the whole distribution', () => {
  const tight = posterior(-1.0, 0.0, CHANNELS.flat.scale, 0.004);
  near(tight.means[3], membership(-1.0) - grid.means[3], 2e-3);
  const loose = posterior(0.3, 0.1, CHANNELS.flat.scale, 50);
  for (const m of loose.means) near(m, 0, 2e-3);
});

test('toy: conditional whitening makes the bond standard normal given the torsion and keeps the coupling in its Jacobian', () => {
  const xi = samples.map((q) => whiten(q.r, q.phi));
  const mean = xi.reduce((s, v) => s + v, 0) / xi.length;
  const variance = xi.reduce((s, v) => s + (v - mean) ** 2, 0) / xi.length;
  near(mean, 0, 0.1);
  near(variance, 1, 0.15);
  const J = whitenJacobian(0.04, 0.6);
  near(J.dxi_dr, 1 / bondSd(0.6), 1e-9);
  const h = 1e-6;
  near(J.dxi_dphi, (whiten(0.04, 0.6 + h) - whiten(0.04, 0.6 - h)) / (2 * h), 1e-5);
  assert.ok(Math.abs(J.dxi_dphi) > 0.1, 'the off-diagonal entry carries m′ and c′');
  near(bondMean(0), 0, 1e-12);
  assert.ok(PHI.n * R.n === grid.p.length);
  near(normalPdf(0), 1 / Math.sqrt(2 * Math.PI), 1e-15);
  assert.ok(mixtureVariance(TWO_BASINS) > 1.5);
});
