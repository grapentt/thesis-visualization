// Checks for "The geometry of attention" (src/videos/attention/): every identity the narration states,
// on the running example and on random instances. Run from the repo root with: node --test 'tests/*.test.mjs'.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../../../src/engine/random.js';
import { Track } from '../../../../src/engine/simulation.js';
import {
  dot, sub, scale, normalize, matVec, matTVec, form, symmetricPart, antisymmetricPart, outer, eigen2, rotation2, matMul, transpose,
  softmax, logPartition, weights, meanParameter, fisher, entropy, kl, bregman, dualPotential, sparsemax, entmax, tsallis,
  ropeScore, ropeScoreAbsolute, responsibilities, hopfieldEnergy, hopfieldUpdate, convexHull, contours, ellipsePoints,
  sphereFlow, sphereVelocity, interactionEnergy, countClusters,
} from '../math.js';

// the running example (copied from shared.js, which needs the DOM)
const KEYS = [[1.5, 0.6], [0.9, 1.45], [-0.65, 1.5], [-1.55, 0.35], [-1.1, -1.15], [0.25, -1.55], [1.3, -0.9]];
const M = [[0.9, 0.8], [-0.2, -0.4]];
const S = symmetricPart(M);
const A = antisymmetricPart(M);

const rng = createRng(2024);
const randomVector = (d = 2, s = 1.5) => Array.from({ length: d }, () => s * rng.gauss());
const close = (a, b, tol = 1e-9, what = '') => assert.ok(Math.abs(a - b) < tol, `${what} ${a} vs ${b}`);
const closeVec = (a, b, tol = 1e-9, what = '') => a.forEach((v, i) => close(v, b[i], tol, what));

/** Central-difference gradient and Hessian of f at x. */
const gradFD = (f, x, h = 1e-5) => x.map((_, i) => (f(x.map((v, k) => v + (k === i ? h : 0))) - f(x.map((v, k) => v - (k === i ? h : 0)))) / (2 * h));
const hessFD = (f, x, h = 1e-4) => x.map((_, i) => x.map((_, j) => {
  const e = (di, dj) => f(x.map((v, k) => v + (k === i ? di : 0) + (k === j ? dj : 0)));
  return (e(h, h) - e(h, -h) - e(-h, h) + e(-h, -h)) / (4 * h * h);
}));

// ---- scene 02: the form ----------------------------------------------------------------------

test('M = S + A with S symmetric, A antisymmetric; S is indefinite on the example', () => {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      close(S[i][j] + A[i][j], M[i][j]);
      close(S[i][j], S[j][i]);
      close(A[i][j], -A[j][i]);
    }
  }
  const { values } = eigen2(S);
  close(values[0], 0.9663, 1e-3, 'λ₁');
  close(values[1], -0.4663, 1e-3, 'λ₂');
  assert.ok(KEYS.some((x) => form(S, x, x) < 0), 'some key has negative squared length');
  assert.ok(KEYS.some((x) => form(S, x, x) > 0));
});

test('A drops out of the quadratic form, and s_ij − s_ji = 2 ω(x_i, x_j)', () => {
  for (let k = 0; k < 20; k++) {
    const x = randomVector();
    const y = randomVector();
    close(form(A, x, x), 0, 1e-12);
    close(form(M, x, x), form(S, x, x), 1e-12);
    close(form(M, x, y) - form(M, y, x), 2 * form(A, x, y), 1e-12);
    close(form(A, x, y), A[0][1] * (x[0] * y[1] - x[1] * y[0]), 1e-12, '2-form = a × oriented area');
  }
});

// ---- scene 03: the pullback ------------------------------------------------------------------

test('rank-one pullback: eigenvalues of S are ½(w_q·w_k ± ‖w_q‖‖w_k‖), negative iff not parallel', () => {
  for (let k = 0; k < 20; k++) {
    const wq = randomVector();
    const wk = randomVector();
    const St = symmetricPart(outer(wq, wk));
    const { values } = eigen2(St);
    const nq = Math.hypot(...wq);
    const nk = Math.hypot(...wk);
    close(values[0], 0.5 * (dot(wq, wk) + nq * nk), 1e-9);
    close(values[1], 0.5 * (dot(wq, wk) - nq * nk), 1e-9);
    assert.ok(values[1] < 0);
    // the key map's null direction changes no score
    const ker = normalize([wk[1], -wk[0]]);
    const x = randomVector();
    const q = randomVector();
    close(form(outer(wq, wk), q, x), form(outer(wq, wk), q, sub(x, scale(ker, -0.7))), 1e-12, 'null direction');
  }
  // equal maps: positive semidefinite
  const w = randomVector();
  const { values } = eigen2(symmetricPart(outer(w, w)));
  close(values[1], 0, 1e-12);
  close(values[0], dot(w, w), 1e-12);
});

// ---- scene 04: RoPE -------------------------------------------------------------------------

test('RoPE: rotating both into their fibres equals rotating by the relative position; shifting both positions changes nothing', () => {
  const freqs = [1, 0.25, 0.0625];
  for (let k = 0; k < 20; k++) {
    const q = randomVector(6);
    const key = randomVector(6);
    const m = Math.floor(rng.uniform() * 12);
    const n = Math.floor(rng.uniform() * 12);
    close(ropeScoreAbsolute(q, key, m, n, freqs), ropeScore(q, key, m, n, freqs), 1e-12);
    close(ropeScore(q, key, m, n, freqs), ropeScore(q, key, m + 5, n + 5, freqs), 1e-12, 'translation invariance');
  }
  // R_mᵀ R_n = R_{n−m}
  const Rm = rotation2(3 * 0.7);
  const Rn = rotation2(7 * 0.7);
  const P = matMul(transpose(Rm), Rn);
  const R = rotation2(4 * 0.7);
  P.forEach((row, i) => closeVec(row, R[i], 1e-12));
});

// ---- scenes 05–07: the exponential family, its Legendre map and Fisher metric --------------------

test('mean parameter is ∇ψ and the Fisher information is ∇²ψ = Cov_a[x_j]', () => {
  for (let k = 0; k < 15; k++) {
    const theta = randomVector();
    const psi = (th) => logPartition(th, KEYS);
    closeVec(meanParameter(theta, KEYS), gradFD(psi, theta), 1e-6, '∇ψ');
    const F = fisher(theta, KEYS);
    const H = hessFD(psi, theta);
    F.forEach((row, i) => closeVec(row, H[i], 1e-5, '∇²ψ'));
    assert.ok(F[0][0] > 0 && F[0][0] * F[1][1] - F[0][1] ** 2 > 0, 'positive definite');
  }
});

test('η lies inside the convex hull, tends to a vertex as β → ∞, and the Fisher information tends to zero there', () => {
  const hull = convexHull(KEYS);
  assert.equal(hull.length, 7, 'all seven keys are vertices of the hull');
  const theta0 = matTVec(M, [0.9, 0.5]);
  let lastTrace = Infinity;
  for (const beta of [0, 0.5, 1, 2, 4, 8, 16]) {
    const theta = scale(theta0, beta);
    const eta = meanParameter(theta, KEYS);
    assert.ok(insidePolygon(eta, hull), `β = ${beta}`);
    const F = fisher(theta, KEYS);
    const tr = F[0][0] + F[1][1];
    if (beta >= 2) assert.ok(tr < lastTrace, 'trace decreases once the attention is peaked');
    lastTrace = tr;
  }
  // x₁ and x₂ score within 0.02 of each other for this query, so a very large β is needed to separate them
  const far = meanParameter(scale(theta0, 3000), KEYS);
  const best = KEYS.reduce((b, x) => (dot(theta0, x) > dot(theta0, b) ? x : b), KEYS[0]);
  closeVec(far, best, 1e-6, 'vertex');
  assert.ok(fisher(scale(theta0, 3000), KEYS)[0][0] < 1e-6);
});

test('the entropy decreases with β along a temperature path', () => {
  const theta0 = matTVec(M, [0.9, 0.5]);
  let last = Infinity;
  for (const beta of [0.1, 0.3, 1, 3, 10]) {
    const H = entropy(weights(scale(theta0, beta), KEYS));
    assert.ok(H < last);
    last = H;
  }
  close(entropy(weights([0, 0], KEYS)), Math.log(7), 1e-12, 'uniform at β = 0');
});

// ---- scene 08: the dually flat simplex ---------------------------------------------------------

test('the Bregman divergence of ψ is the KL divergence between attention patterns', () => {
  for (let k = 0; k < 20; k++) {
    const theta1 = randomVector();
    const theta2 = randomVector();
    const a1 = weights(theta1, KEYS);
    const a2 = weights(theta2, KEYS);
    close(bregman(theta1, theta2, KEYS), kl(a2, a1), 1e-10, 'B_ψ(θ₁, θ₂) = KL(a₂ ‖ a₁)');
    assert.ok(bregman(theta1, theta2, KEYS) >= 0);
  }
});

test('the dual potential is negative entropy: ⟨s, a⟩ − ψ(s) = Σ a log a at a = softmax(s)', () => {
  for (let k = 0; k < 20; k++) {
    const s = randomVector(5, 2);
    const a = softmax(s);
    const lse = Math.log(s.reduce((sum, v) => sum + Math.exp(v), 0));
    close(dot(s, a) - lse, dualPotential(a), 1e-10);
    // and softmax maximises ⟨a, s⟩ + H(a) over the simplex
    const best = dot(a, s) + entropy(a);
    for (let r = 0; r < 20; r++) {
      const b = softmax(randomVector(5, 2));
      assert.ok(dot(b, s) + entropy(b) <= best + 1e-9);
    }
  }
});

test('the temperature path β ↦ softmax(β s) is an e-geodesic from the barycentre to a vertex', () => {
  const s = [1.2, 0.3, -0.5];
  closeVec(softmax(s, 0), [1 / 3, 1 / 3, 1 / 3], 1e-12);
  const far = softmax(s, 200);
  closeVec(far, [1, 0, 0], 1e-9);
  // log a(β) is affine in β up to normalisation: log a_j(β) − log a_k(β) = β (s_j − s_k)
  for (const beta of [0.5, 1, 3]) {
    const a = softmax(s, beta);
    close(Math.log(a[0]) - Math.log(a[2]), beta * (s[0] - s[2]), 1e-12);
  }
});

// ---- scene 09: entmax -----------------------------------------------------------------------

test('sparsemax and α-entmax are distributions, maximise their regularised objective, and give exact zeros', () => {
  for (let k = 0; k < 15; k++) {
    const s = randomVector(4, 1.5);
    for (const alpha of [1, 1.3, 1.5, 2]) {
      const a = entmax(s, alpha);
      close(a.reduce((x, y) => x + y, 0), 1, 1e-9, 'sums to one');
      assert.ok(a.every((v) => v >= 0));
      const objective = (b) => dot(b, s) + tsallis(b, alpha);
      const best = objective(a);
      for (let r = 0; r < 30; r++) assert.ok(objective(softmax(randomVector(4, 2))) <= best + 1e-7, `α = ${alpha}`);
    }
    closeVec(entmax(s, 2), sparsemax(s), 1e-9);
    closeVec(entmax(s, 1), softmax(s), 1e-9);
  }
  const peaked = sparsemax([3, 0, -1]);
  assert.deepEqual(peaked, [1, 0, 0]);
  assert.ok(entmax([2, 0.5, -1], 1.5).includes(0), '1.5-entmax has an exact zero for peaked scores');
  assert.ok(softmax([2, 0.5, -1], 1).every((v) => v > 0), 'softmax never does');
});

// ---- scene 10: the sphere -------------------------------------------------------------------

test('attention on normalised embeddings is the E-step of a von Mises mixture, and of a Gaussian mixture when key norms are equal', () => {
  const mus = KEYS.map((x) => Math.atan2(x[1], x[0]));
  const unit = mus.map((mu) => [Math.cos(mu), Math.sin(mu)]);
  for (let k = 0; k < 10; k++) {
    const phi = 2 * Math.PI * rng.uniform();
    const kappa = 0.5 + 8 * rng.uniform();
    const q = [Math.cos(phi), Math.sin(phi)];
    closeVec(responsibilities(phi, mus, kappa), weights(scale(q, kappa), unit), 1e-12);
    // Gaussian mixture with equal covariance σ² I at keys of norm 1: responsibilities = softmax(q·k / σ²)
    const sigma2 = 1 / kappa;
    const qq = scale(q, 1.7);
    const gauss = softmax(unit.map((x) => -dot(sub(qq, x), sub(qq, x)) / (2 * sigma2)));
    closeVec(gauss, softmax(unit.map((x) => dot(qq, x) / sigma2)), 1e-12);
  }
});

// ---- scene 11: Hopfield -----------------------------------------------------------------------

test('the Hopfield update is ∇ψ(β ξ) and never increases the energy', () => {
  for (const beta of [0.5, 2, 6]) {
    for (let k = 0; k < 10; k++) {
      let xi = randomVector(2, 1.5);
      closeVec(hopfieldUpdate(xi, KEYS, beta), meanParameter(scale(xi, beta), KEYS), 1e-12);
      let E = hopfieldEnergy(xi, KEYS, beta);
      for (let it = 0; it < 6; it++) {
        xi = hopfieldUpdate(xi, KEYS, beta);
        const E2 = hopfieldEnergy(xi, KEYS, beta);
        assert.ok(E2 <= E + 1e-12, `β = ${beta}: ${E} → ${E2}`);
        E = E2;
      }
    }
  }
});

// ---- scene 12: the flow -----------------------------------------------------------------------

test('the sphere flow keeps tokens on the sphere, clusters them, and its energy is non-decreasing while A = 0', () => {
  const spec = sphereFlow({ n: 32 });
  const track = new Track(spec, () => ({ beta: 4, anti: 0 }));
  const cursor = track.cursor();
  const n0 = countClusters(cursor.state.X);
  cursor.seek(Math.round(30 / spec.dt));
  const { X, energy, ticks } = cursor.state;
  for (let i = 0; i < X.length / 3; i++) close(Math.hypot(X[3 * i], X[3 * i + 1], X[3 * i + 2]), 1, 1e-9);
  assert.ok(countClusters(X) < n0 / 2, `clusters ${n0} → ${countClusters(X)}`);
  for (let k = 1; k < ticks; k++) assert.ok(energy[k] >= energy[k - 1] - 1e-6, `energy dipped at tick ${k}`);
  assert.ok(interactionEnergy(X, 4) > interactionEnergy(track.cursor().state.X, 4));
});

test('the antisymmetric part adds a velocity component that the symmetric flow does not have', () => {
  const spec = sphereFlow({ n: 32 });
  const X = new Track(spec, () => ({ beta: 4, anti: 0 })).cursor().state.X;
  let different = 0;
  for (let i = 0; i < 32; i++) {
    const v = sphereVelocity(X, i, 4, 1.2);
    const vS = sphereVelocity(X, i, 4, 0);
    const d = Math.hypot(...sub(v, vS));
    if (d > 1e-3) different++;
    // both are tangent to the sphere
    const x = [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
    close(dot(v, x), 0, 1e-12);
    close(dot(vS, x), 0, 1e-12);
  }
  assert.ok(different > 24);
});

// ---- drawing helpers --------------------------------------------------------------------------

test('contours of a linear function are straight, and the ellipse of a covariance has the right axes', () => {
  const [segments] = contours((u, v) => u + 2 * v, [0.5], { extent: 2, n: 40 });
  for (const [a, b] of segments) {
    close(a[0] + 2 * a[1], 0.5, 1e-9);
    close(b[0] + 2 * b[1], 0.5, 1e-9);
  }
  const Sigma = [[2, 0], [0, 0.5]];
  const pts = ellipsePoints([1, 1], Sigma, 1, 4);
  closeVec(pts[0], [1 + Math.sqrt(2), 1], 1e-9);
  closeVec(pts[1], [1, 1 + Math.sqrt(0.5)], 1e-9);
});

function insidePolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
