// The mathematical contract of "The geometry of information" (private/other/information-geometry/):
// every identity the narration states, on the running examples and on random instances.
// Run from the repo root: node --test private/other/information-geometry/tests/information-geometry.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../../../src/engine/random.js';
import {
  sum, dot, normalize, bernoulliFisher, bernoulliAngle, bernoulliFromAngle, bernoulliDistance, klBernoulli, logit, sigmoid, bernoulliFisherLogit,
  bernoulliLogLik, bernoulliScore, binomialPmf, binomialPmfs, separationInSd, zScore, distinguishableCoins, distinguishableGrid, cramerRao, jeffreys,
  entropy, kl, bhattacharyya, fisherRao, hellinger, sphere, fromSphere, chord, fisherRaoGeodesic, mixtureGeodesic, exponentialGeodesic,
  simplexFisher, simplexInverseFisher, fisherInner, fisherBall, eTangent, mTangent, pythagoreanTriple, merge,
  naturalParams, logPartition, fromNatural, meanParams, bregman, dualPotential, split, naturalFlowPath,
  gaussianFisher, toHalfPlane, fromHalfPlane, gaussianDistance, gaussianGeodesic, gaussianLength, gaussianPdf, klGaussian, fisherCircle,
  klGradient, naturalGradient, descend, eigen2, ellipsePoints, matMul, inverse2, gradFD, hessFD, fisherOfFamily,
} from '../math.js';

const rng = createRng(1945);
const close = (a, b, tol = 1e-9, what = '') => assert.ok(Math.abs(a - b) < tol, `${what} ${a} vs ${b}`);
const closeVec = (a, b, tol = 1e-9, what = '') => a.forEach((v, i) => close(v, b[i], tol, what));
const randomSimplex = (d = 3) => normalize(Array.from({ length: d }, () => 0.05 + rng.uniform()));
const randomP = () => 0.05 + 0.9 * rng.uniform();

// ---- scenes 02–04: the coin --------------------------------------------------------------------

test('the three faces of the Fisher information agree on the coin: variance of the score, expected curvature, Hessian of KL', () => {
  for (let k = 0; k < 10; k++) {
    const p = randomP();
    const g = bernoulliFisher(p);
    close(p * bernoulliScore(1, p) + (1 - p) * bernoulliScore(0, p), 0, 1e-12, 'the score has mean zero');
    close(p * bernoulliScore(1, p) ** 2 + (1 - p) * bernoulliScore(0, p) ** 2, g, 1e-9, 'variance of the score');
    const curvature = (x) => hessFD((th) => bernoulliLogLik(x, th[0]), [p])[0][0];
    close(-(p * curvature(1) + (1 - p) * curvature(0)), g, 1e-3, 'expected curvature');
    close(hessFD((th) => klBernoulli(p, th[0]), [p])[0][0], g, 1e-4 * g, 'Hessian of KL in the second argument');
    close(hessFD((th) => klBernoulli(th[0], p), [p])[0][0], g, 1e-4 * g, 'Hessian of KL in the first argument');
    const d = 1e-4;
    close(klBernoulli(p, p + d) / (0.5 * g * d * d), 1, 1e-2, 'KL ≈ ½ g δ²');
    close(fisherOfFamily((th) => [th[0], 1 - th[0]], [p])[0][0], g, 1e-6, 'generic finite-family Fisher');
  }
});

test('the coin example: Δp = 0.05 is 1.0 standard deviations near p = 0.5 and 2.5 near p = 0.02, after 100 flips', () => {
  close(bernoulliFisher(0.5), 4);
  close(bernoulliFisher(0.02), 51.0204, 1e-3);
  close(separationInSd(0.5, 0.55, 100), 1.0, 0.02);
  close(zScore(0.5, 0.55, 100), 1.0, 1e-12);
  close(separationInSd(0.02, 0.07, 100), 2.52, 0.02);
  assert.ok(zScore(0.02, 0.07, 100) > 3.5 && zScore(0.07, 0.02, 100) < -1.9, 'the one-sided z-scores bracket the symmetric value');
  for (const p of [0.5, 0.02, 0.07]) close(sum(binomialPmfs(100, p)), 1, 1e-12, 'pmf sums to one');
  close(sum(binomialPmfs(100, 0.5).map((v, k) => v * k)), 50, 1e-9, 'mean 50');
  close(sum(binomialPmfs(100, 0.02).map((v, k) => v * k)), 2, 1e-9, 'mean 2');
  close(binomialPmf(100, 0.5, 50), 0.07959, 1e-5);
});

test('the Fisher metric is a tensor: the same length in p and in the logit coordinate, and flat in the angle φ', () => {
  for (let k = 0; k < 10; k++) {
    const p = randomP();
    const x = logit(p);
    close(sigmoid(x), p, 1e-12);
    const dpdx = p * (1 - p);
    close(bernoulliFisherLogit(x), bernoulliFisher(p) * dpdx * dpdx, 1e-9, 'g_x = g_p (dp/dx)²');
    const dphidp = gradFD((th) => bernoulliAngle(th[0]), [p])[0];
    close(dphidp * dphidp, bernoulliFisher(p), 1e-5, 'dφ² = g dp²');
    close(bernoulliFromAngle(bernoulliAngle(p)), p, 1e-12);
  }
  // the distance is the difference of angles, and the whole family has length π
  for (let k = 0; k < 10; k++) {
    const p = randomP();
    const q = randomP();
    close(bernoulliDistance(p, q), Math.abs(bernoulliAngle(p) - bernoulliAngle(q)), 1e-9);
    close(bernoulliDistance(p, q), fisherRao([p, 1 - p], [q, 1 - q]), 1e-9, 'the coin is the 2-simplex');
  }
  close(bernoulliDistance(0, 1), Math.PI, 1e-12);
  // a numerical length of the path p ∈ [a, b] in the p coordinate, against the angle difference
  const a = 0.1;
  const b = 0.7;
  let L = 0;
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const p = a + ((b - a) * (i + 0.5)) / N;
    L += Math.sqrt(bernoulliFisher(p)) * ((b - a) / N);
  }
  close(L, bernoulliDistance(a, b), 1e-6, 'length ∫√g dp');
});

test('with 100 flips there are about 31 distinguishable coins, evenly spaced in φ and crowded near 0 and 1 in p', () => {
  close(distinguishableCoins(100), 31.4159, 1e-3);
  const grid = distinguishableGrid(100);
  assert.equal(grid.length, 32);
  for (let i = 1; i < grid.length; i++) close(separationInSd(grid[i - 1], grid[i], 100), 1, 1e-9, 'neighbours one sd apart');
  assert.ok(grid[1] - grid[0] < 0.2 * (grid[16] - grid[15]), 'crowded near 0 in p');
});

test('Cramér–Rao and Jeffreys: the bound is 1 / (n g), the proportion attains it, the prior is Beta(½, ½) and uniform in φ', () => {
  for (const p of [0.1, 0.3, 0.5]) {
    const n = 100;
    close(cramerRao(p, n), 1 / (n * bernoulliFisher(p)), 1e-12);
    const variance = sum(binomialPmfs(n, p).map((v, k) => v * (k / n - p) ** 2));
    close(variance, cramerRao(p, n), 1e-12, 'the sample proportion attains the bound');
    close(jeffreys(p), Math.sqrt(bernoulliFisher(p)) / Math.PI, 1e-12);
  }
  let mass = 0;
  const N = 200000;
  for (let i = 0; i < N; i++) mass += jeffreys((i + 0.5) / N) / N;
  close(mass, 1, 2e-3, 'normalised');
  // the density in φ is jeffreys(p) dp/dφ = 1/π
  for (const p of [0.1, 0.3, 0.5]) close(jeffreys(p) / Math.sqrt(bernoulliFisher(p)), 1 / Math.PI, 1e-12);
});

// ---- scenes 05–06: the simplex -----------------------------------------------------------------

test('the square-root embedding: the Fisher metric of the simplex is the round metric of the sphere of radius 2', () => {
  for (let k = 0; k < 10; k++) {
    const p = randomSimplex();
    const x = sphere(p);
    close(Math.hypot(...x), 2, 1e-12, 'on the sphere of radius 2');
    closeVec(fromSphere(x), p, 1e-12);
    // pull the Euclidean metric of ℝ³ back along p ↦ 2√p, in the coordinates (p₁, p₂)
    const embed = (c) => sphere([c[0], c[1], 1 - c[0] - c[1]]);
    const J = [0, 1].map((i) => gradFD((c) => embed(c)[i], [p[0], p[1]]));
    const J3 = gradFD((c) => embed(c)[2], [p[0], p[1]]);
    const pulled = [0, 1].map((i) => [0, 1].map((j) => J[0][i] * J[0][j] + J[1][i] * J[1][j] + J3[i] * J3[j]));
    const g = simplexFisher(p);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close(pulled[i][j], g[i][j], 1e-5, 'pulled-back metric = Fisher');
    const gi = matMul(g, simplexInverseFisher(p));
    close(gi[0][0], 1, 1e-9);
    close(gi[1][1], 1, 1e-9);
    close(gi[0][1], 0, 1e-9);
    close(gi[1][0], 0, 1e-9);
    const q = randomSimplex();
    close(fisherRao(p, q), 2 * Math.acos(dot(p.map(Math.sqrt), q.map(Math.sqrt))), 1e-12);
    close(chord(p, q), 4 * Math.sin(fisherRao(p, q) / 4), 1e-9, 'chord 2R sin(ϑ/2)');
    close(chord(p, q), 2 * Math.SQRT2 * hellinger(p, q), 1e-9, 'the chord is 2√2 Hellinger');
    assert.ok(chord(p, q) <= fisherRao(p, q), 'chord ≤ arc');
    // the generic Fisher of the family (p₁, p₂) ↦ (p₁, p₂, 1 − p₁ − p₂) is the same matrix
    const F = fisherOfFamily((c) => [c[0], c[1], 1 - c[0] - c[1]], [p[0], p[1]]);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close(F[i][j], g[i][j], 1e-5);
  }
});

test('geodesics: the Fisher–Rao geodesic is a great circle, length = distance; m- and e-geodesics stay on the simplex', () => {
  for (let k = 0; k < 10; k++) {
    const p = randomSimplex();
    const q = randomSimplex();
    const N = 400;
    let L = 0;
    let prev = fisherRaoGeodesic(p, q, 0);
    closeVec(prev, p, 1e-12);
    for (let i = 1; i <= N; i++) {
      const cur = fisherRaoGeodesic(p, q, i / N);
      close(sum(cur), 1, 1e-12, 'on the simplex');
      L += fisherRao(prev, cur);
      prev = cur;
    }
    closeVec(prev, q, 1e-12);
    close(L, fisherRao(p, q), 1e-6, 'length of the great circle = distance');
    for (const s of [0.25, 0.5, 0.75]) {
      close(sum(mixtureGeodesic(p, q, s)), 1, 1e-12);
      close(sum(exponentialGeodesic(p, q, s)), 1, 1e-12);
      const e = exponentialGeodesic(p, q, s);
      // e-geodesic: log e is affine in s up to normalisation
      const lp = p.map(Math.log);
      const lq = q.map(Math.log);
      const le = e.map(Math.log);
      const diff = le.map((v, i) => v - ((1 - s) * lp[i] + s * lq[i]));
      close(diff[0], diff[1], 1e-12);
      close(diff[1], diff[2], 1e-12);
    }
    // the Fisher ball: every point of fisherBall(p, r) is at Fisher-norm r from p to first order
    for (const pt of fisherBall(p, 0.01, 16)) {
      const v = [pt[0] - p[0], pt[1] - p[1], -(pt[0] - p[0]) - (pt[1] - p[1])];
      close(Math.sqrt(fisherInner(p, v, v)), 0.01, 1e-9, 'Fisher norm r');
    }
  }
});

test('coarse-graining can only shrink Fisher–Rao distances; a relabelling keeps them', () => {
  for (let k = 0; k < 20; k++) {
    const p = randomSimplex();
    const q = randomSimplex();
    const before = fisherRao(p, q);
    const after = fisherRao(merge(p, [[0], [1, 2]]), merge(q, [[0], [1, 2]]));
    assert.ok(after <= before + 1e-12, `merging outcomes: ${after} ≤ ${before}`);
    close(after, bernoulliDistance(p[0], q[0]), 1e-9, 'a merged die is a coin');
    const perm = [2, 0, 1];
    close(fisherRao(perm.map((i) => p[i]), perm.map((i) => q[i])), before, 1e-12, 'relabelling');
    close(fisherRao(split(p, 2, [1 / 3, 2 / 3]), split(q, 2, [1 / 3, 2 / 3])), before, 1e-12, 'a Markov embedding keeps the distance');
    close(sum(split(p, 2, [1 / 3, 2 / 3])), 1, 1e-12);
  }
  // the running numbers of scene 06
  const p = [0.35, 0.5, 0.15];
  const q = [0.3, 0.15, 0.55];
  close(fisherRao(p, q), 0.97, 0.01, 'before merging');
  close(fisherRao(merge(p, [[0], [1, 2]]), merge(q, [[0], [1, 2]])), 0.107, 0.002, 'after merging outcomes 2 and 3');
});

// ---- scenes 10–11: dual geometry -------------------------------------------------------------

test('the simplex as an exponential family: η = ∇ψ, Fisher = ∇²ψ = Cov, Bregman of ψ is KL (in the dual order), ψ + φ = ⟨θ, η⟩', () => {
  for (let k = 0; k < 10; k++) {
    const p = randomSimplex();
    const theta = naturalParams(p);
    closeVec(fromNatural(theta), p, 1e-12);
    closeVec(gradFD(logPartition, theta), meanParams(theta), 1e-6, '∇ψ = η');
    const H = hessFD(logPartition, theta);
    const C = simplexInverseFisher(p);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close(H[i][j], C[i][j], 1e-5, '∇²ψ = covariance = Fisher in θ');
    const q = randomSimplex();
    const thetaQ = naturalParams(q);
    close(bregman(theta, thetaQ), kl(q, p), 1e-9, 'B_ψ(θ_p, θ_q) = KL(q ‖ p)');
    close(logPartition(theta) + dualPotential(p), dot(theta, meanParams(theta)), 1e-9, 'Legendre: ψ + φ = ⟨θ, η⟩');
    // the Fisher matrix in η = (p₁, p₂) coordinates is the inverse of the one in θ
    const gEta = simplexFisher(p);
    const gi = matMul(gEta, C);
    close(gi[0][0], 1, 1e-9);
    close(gi[0][1], 0, 1e-9);
  }
});

test('the generalised Pythagorean theorem: m-geodesic ⟂ e-geodesic at q gives KL(p ‖ r) = KL(p ‖ q) + KL(q ‖ r)', () => {
  for (let k = 0; k < 20; k++) {
    const q = randomSimplex();
    const r = randomSimplex();
    const { p } = pythagoreanTriple(q, r, 0.1 * rng.uniform());
    if (p.some((v) => v <= 0)) continue;
    close(sum(p), 1, 1e-12);
    close(fisherInner(q, mTangent(q, p), eTangent(q, r)), 0, 1e-9, 'orthogonal at q');
    close(kl(p, r), kl(p, q) + kl(q, r), 1e-9, 'Pythagoras');
    // and KL is not symmetric, nor is the relation in the other order in general
    assert.ok(Math.abs(kl(r, p) - kl(r, q) - kl(q, p)) > 1e-6 || Math.abs(kl(p, q) - kl(q, p)) < 1e-6);
  }
  // the running example of scene 11
  const { p, q, r } = pythagoreanTriple([1 / 3, 1 / 3, 1 / 3], [0.6, 0.3, 0.1], 0.12);
  assert.ok(p.every((v) => v > 0.1), `p = ${p}`);
  close(kl(p, q), 0.124, 0.002);
  close(kl(q, r), 0.240, 0.002);
  close(kl(p, r), kl(p, q) + kl(q, r), 1e-12);
});

// ---- scenes 07–09: Gaussians ---------------------------------------------------------------------

test('Gaussians: Fisher = diag(1/σ², 2/σ²) by the definition, the half-plane is isometric up to the factor 2, distance in closed form', () => {
  for (let k = 0; k < 8; k++) {
    const mu = 4 * rng.uniform() - 2;
    const sigma = 0.3 + 2 * rng.uniform();
    // the definition: variance of the score under the density, by quadrature
    const g = [[0, 0], [0, 0]];
    const N = 4000;
    for (let i = 0; i < N; i++) {
      const x = mu + sigma * (-8 + (16 * (i + 0.5)) / N);
      const w = gaussianPdf(x, mu, sigma) * ((16 * sigma) / N);
      const s = [(x - mu) / sigma ** 2, -1 / sigma + (x - mu) ** 2 / sigma ** 3];
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) g[a][b] += w * s[a] * s[b];
    }
    const G = gaussianFisher(mu, sigma);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) close(g[a][b], G[a][b], 1e-6, `g[${a}][${b}]`);
    // the same from the Hessian of KL
    const H = hessFD((th) => klGaussian([mu, sigma], th), [mu, sigma]);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) close(H[a][b], G[a][b], 1e-4, 'Hessian of KL');
    // the half-plane: ds² = (dμ² + 2 dσ²) / σ² = 2 (dx² + dy²) / y²
    const [x, y] = toHalfPlane([mu, sigma]);
    close(y, sigma);
    closeVec(fromHalfPlane([x, y]), [mu, sigma], 1e-12);
    const other = [mu + 3 * rng.uniform() - 1.5, 0.3 + 2 * rng.uniform()];
    const path = gaussianGeodesic([mu, sigma], other, 2000);
    closeVec(path[0], [mu, sigma], 1e-9);
    closeVec(path[2000], other, 1e-9);
    close(gaussianLength(path), gaussianDistance([mu, sigma], other), 1e-4, 'length of the geodesic = closed-form distance');
    // a straight line in (μ, σ) is longer
    const straight = Array.from({ length: 2001 }, (_, i) => [mu + ((other[0] - mu) * i) / 2000, sigma + ((other[1] - sigma) * i) / 2000]);
    assert.ok(gaussianLength(straight) >= gaussianLength(path) - 1e-9, 'the geodesic is shortest');
    // the Fisher circle has Fisher radius r
    for (const pt of fisherCircle([mu, sigma], 0.01, 8)) {
      const d = [pt[0] - mu, pt[1] - sigma];
      close(Math.sqrt(d[0] * d[0] * G[0][0] + d[1] * d[1] * G[1][1]), 0.01, 1e-9);
    }
  }
  // the geodesic between two narrow Gaussians far apart passes through wide ones (scene 07's numbers)
  const geo = gaussianGeodesic([-3, 0.5], [3, 0.5], 64);
  const top = Math.max(...geo.map(([, s]) => s));
  close(top, Math.sqrt(4.5 + 0.25), 1e-6, 'σ at the midpoint: √(μ²/2 + σ²)');
  assert.ok(top > 2.1 && top < 2.2);
  close(geo[32][0], 0, 1e-9, 'symmetric midpoint');
  // two wide Gaussians with the same mean difference are closer than two narrow ones
  assert.ok(gaussianDistance([-3, 3], [3, 3]) < gaussianDistance([-3, 0.5], [3, 0.5]));
  // a vertical geodesic (same mean) in log σ
  const vertical = gaussianGeodesic([0, 0.5], [0, 2], 4);
  close(vertical[2][1], 1, 1e-9);
  close(gaussianDistance([0, 0.5], [0, 2]), Math.SQRT2 * Math.log(4), 1e-9, 'd = √2 |log σ₂/σ₁|');
});

test('natural gradient: the metric gradient of KL; natural steps are the same in (μ, σ) and (μ, log σ) to first order, plain ones are not', () => {
  const target = [0, 1];
  for (let k = 0; k < 10; k++) {
    const th = [3 * rng.uniform() - 1.5, 0.4 + 2 * rng.uniform()];
    closeVec(klGradient(th, target), gradFD((x) => klGaussian(target, x), th), 1e-6, '∇L');
    const G = gaussianFisher(th[0], th[1]);
    closeVec(naturalGradient(th, target), inverse2(G).map((row) => dot(row, klGradient(th, target))), 1e-12, 'g⁻¹∇L');
    // the natural-gradient direction, computed in (μ, log σ) and mapped back, is the same vector
    const tau = Math.log(th[1]);
    const Ltau = (x) => klGaussian(target, [x[0], Math.exp(x[1])]);
    const gTau = [[1 / th[1] ** 2, 0], [0, 2]]; // Fisher in (μ, τ): dσ = σ dτ
    const nTau = inverse2(gTau).map((row) => dot(row, gradFD(Ltau, [th[0], tau])));
    closeVec([nTau[0], nTau[1] * th[1]], naturalGradient(th, target), 1e-5, 'coordinate-free direction');
    const plainTau = gradFD(Ltau, [th[0], tau]);
    assert.ok(Math.abs(plainTau[1] * th[1] - klGradient(th, target)[1]) > 1e-3 || Math.abs(th[1] - 1) < 1e-3, 'plain gradients depend on the coordinates');
  }
  // the running example of scene 09: from (3, 3) towards (0, 1)
  const natural = descend([3, 3], target, { eta: 0.5, steps: 40, method: 'natural' });
  const plain = descend([3, 3], target, { eta: 0.5, steps: 40, method: 'plain' });
  const logs = descend([3, 3], target, { eta: 0.5, steps: 40, method: 'log' });
  const loss = (p) => klGaussian(target, p);
  assert.ok(loss(natural[10]) < 1e-3, `natural gradient after 10 steps: ${loss(natural[10])}`);
  assert.ok(loss(plain[10]) > 0.05, `plain gradient after 10 steps: ${loss(plain[10])}`);
  assert.ok(loss(plain[40]) > loss(natural[40]) * 10);
  assert.ok(logs.every(([, s]) => s > 0) && natural.every(([, s]) => s > 0) && plain.every(([, s]) => s > 0));
  // the natural path is monotone in μ (halving each step at η = ½ it is exactly μ_k = 3 / 2^k)
  natural.forEach(([mu], k) => close(mu, 3 / 2 ** k, 1e-9, 'μ halves'));
  // the scene's example from (3, 0.5): natural steps at η = 0.3 converge, plain ones at η = 0.3 blow up, at η = 0.02 crawl
  const ng = descend([3, 0.5], target, { eta: 0.3, steps: 60, method: 'natural' });
  const gdBig = descend([3, 0.5], target, { eta: 0.3, steps: 60, method: 'plain' });
  const gdSmall = descend([3, 0.5], target, { eta: 0.02, steps: 60, method: 'plain' });
  assert.ok(loss(ng[15]) < 0.01 && loss(ng[60]) < 1e-6, 'natural gradient converges');
  assert.ok(Math.max(...ng.map(([, s]) => s)) > 3, 'it widens first');
  assert.ok(gdBig[1][1] > 20 && loss(gdBig[60]) > 1, 'plain gradient at the same step size overshoots σ and stalls');
  assert.ok(loss(gdSmall[60]) > 0.5, 'plain gradient at a safe step size crawls');
  // the natural-gradient flow follows the m-geodesic: small natural steps stay on naturalFlowPath
  const fine = descend([3, 0.5], target, { eta: 0.002, steps: 3000, method: 'natural' });
  const flow = naturalFlowPath([3, 0.5], target, 3000);
  const etaOf = ([m, s]) => [m, m * m + s * s];
  for (const pt of fine.filter((_, k) => k % 300 === 0)) {
    const e = etaOf(pt);
    const e0 = etaOf([3, 0.5]);
    const e1 = etaOf(target);
    // on the line through e0 and e1 in η-space: the cross product vanishes
    const cross = (e[0] - e0[0]) * (e1[1] - e0[1]) - (e[1] - e0[1]) * (e1[0] - e0[0]);
    close(cross, 0, 0.05, 'on the m-geodesic');
  }
  closeVec(flow[0], [3, 0.5], 1e-9);
  closeVec(flow[3000], target, 1e-6);
});

// ---- numerics -----------------------------------------------------------------------------------

test('eigen2, ellipsePoints and inverse2', () => {
  const S = [[2, 1], [1, 2]];
  const { values, vectors } = eigen2(S);
  close(values[0], 3);
  close(values[1], 1);
  closeVec(matMul(S, [[vectors[0][0]], [vectors[0][1]]]).map((r) => r[0]), vectors[0].map((v) => 3 * v), 1e-9);
  for (const [x, y] of ellipsePoints([0, 0], S, 1, 8)) close(dot([x, y], inverse2(S).map((row) => dot(row, [x, y]))), 1, 1e-9);
  const I = matMul(S, inverse2(S));
  close(I[0][0], 1);
  close(I[1][0], 0);
});
