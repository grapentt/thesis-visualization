// The mathematical contract of "From phase to force" (private/other/u1-force/): every identity the
// narration states, checked numerically on the running examples and on random instances.
// Run from the repo root: node --test private/other/u1-force/tests/u1-force.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../../../src/engine/random.js';
import {
  planeField, gaugeField, flatField, lineIntegral, transport, holonomy, polygonArea, centroid, triangleFlux, polygonFlux, stripFlux, disagreementFlux,
  circleLoop, squareLoop, twoRoads, roadsLoop, tiling,
  times, straightPath, bentPath, variations, sampleVariation, potentials, action, varied, firstVariation, accelerations, velocities, trajectory, shoot,
  electricField, worldlineTransport, ribbonFlux, lorentz, borisStep, cyclotron, nudgedRoads, hump, stripTiling, planeRibbonFlux,
} from '../math.js';

const rng = createRng(2026);
const close = (a, b, tol = 1e-9, what = '') => assert.ok(Math.abs(a - b) < tol, `${what}: ${a} vs ${b} (tol ${tol})`);
const uniform = (a, b) => a + (b - a) * rng.uniform();

/** The running field of scenes 3–4: a weak background and one bump. */
const FIELD = planeField({ B0: 0.3, bumps: [{ B1: 1.6, c: [0.5, -0.3], s: 0.6 }] });

// ---- scenes 1–4: connections, holonomy, curvature, Stokes ----------------------------------------

test('the curvature of the plane field is its stated density: ∂ω_y/∂x − ∂ω_x/∂y = B', () => {
  const h = 1e-5;
  for (let k = 0; k < 30; k++) {
    const x = uniform(-2, 2);
    const y = uniform(-2, 2);
    const curl = (FIELD.omega(x + h, y)[1] - FIELD.omega(x - h, y)[1]) / (2 * h) - (FIELD.omega(x, y + h)[0] - FIELD.omega(x, y - h)[0]) / (2 * h);
    close(curl, FIELD.B(x, y), 1e-6, 'dω = B dx∧dy');
  }
  // the symmetric gauge alone
  const uni = planeField({ B0: 0.7 });
  close(uni.omega(1, 2)[0], -0.7, 1e-12);
  close(uni.omega(1, 2)[1], 0.35, 1e-12);
  // the bump alone, at its centre, is regular
  const bump = planeField({ bumps: [{ B1: 2, c: [0, 0], s: 1 }] });
  close(bump.omega(0, 0)[0], 0, 1e-12);
  close(bump.omega(1e-7, 0)[1] / 1e-7, 1, 1e-6, 'a = B1/2 at the centre');
});

test('Stokes: the holonomy of a loop equals the flux of the curvature through it (circles, squares, two roads)', () => {
  for (const r of [0.2, 0.5, 1.1]) {
    for (let k = 0; k < 4; k++) {
      const c = [uniform(-1, 1), uniform(-1, 1)];
      const loop = circleLoop(r, { n: 720, cx: c[0], cy: c[1] });
      const hol = holonomy(FIELD, loop);
      const flux = polygonFlux(FIELD.B, loop.slice(0, -1), 6);
      close(hol, flux, 2e-3 * Math.max(1, Math.abs(hol)), `circle r = ${r}`);
      close(polygonArea(loop.slice(0, -1)), Math.PI * r * r, 1e-3, 'area of the circle');
    }
  }
  for (let k = 0; k < 6; k++) {
    const x0 = uniform(-1.5, 0.5);
    const y0 = uniform(-1.5, 0.5);
    const side = uniform(0.2, 1.2);
    const loop = squareLoop(x0, y0, side, { perSide: 120 });
    close(holonomy(FIELD, loop), polygonFlux(FIELD.B, loop.slice(0, -1), 8), 3e-3, 'square');
  }
  // two roads from P to Q: the loop out along the straight road and back along the bent one
  for (let k = 0; k < 6; k++) {
    const P = [uniform(-1.5, -0.5), uniform(-1, 1)];
    const Q = [uniform(0.5, 1.5), uniform(-1, 1)];
    const bulge = uniform(-1.2, 1.2);
    const { straight, bent } = twoRoads(P, Q, bulge, { n: 400 });
    const loop = roadsLoop(straight, bent);
    const hol = holonomy(FIELD, loop);
    // the disagreement of the two transported dials at Q is minus the holonomy of straight-out-bent-back
    const disagreement = transport(FIELD, bent).at(-1) - transport(FIELD, straight).at(-1);
    close(disagreement, -hol, 1e-9, 'Δθ = ∫_bent ω − ∫_straight ω = −hol(straight out, bent back)');
    close(disagreement, disagreementFlux(FIELD.B, straight, bent, 16), 3e-3, 'Δθ equals the flux through the strip, oriented from road 1 to road 2');
    close(stripFlux(FIELD.B, straight, bent, 16), hol, 3e-3, 'stripFlux(p1, p2) is the holonomy of p1 out, p2 back');
    // orientation: with the bent road to the left, "straight out, bent back" runs counter-clockwise
    const area = polygonArea(roadsLoop(straight, bent));
    assert.ok(Math.sign(area) === Math.sign(bulge) || Math.abs(bulge) < 1e-9, 'a left bulge encloses positive area for straight-out-bent-back');
  }
});

test('orientation and locality: reversing a loop flips the holonomy; shrinking it gives the curvature per area', () => {
  const loop = circleLoop(0.6, { n: 400, cx: 0.3, cy: 0.2 });
  close(holonomy(FIELD, [...loop].reverse()), -holonomy(FIELD, loop), 1e-12);
  for (const c of [[0.5, -0.3], [-1, 1], [0, 0.6]]) {
    const ratios = [0.4, 0.2, 0.1, 0.05].map((r) => {
      const l = circleLoop(r, { n: 400, cx: c[0], cy: c[1] });
      return holonomy(FIELD, l) / polygonArea(l.slice(0, -1));
    });
    const B = FIELD.B(c[0], c[1]);
    close(ratios.at(-1), B, 1e-2 * Math.max(1, Math.abs(B)), `hol/area → B at ${c}`);
    assert.ok(Math.abs(ratios[3] - B) <= Math.abs(ratios[0] - B) + 1e-12, 'the ratio converges as the loop shrinks');
  }
});

test('gauge invariance: a pure-gauge connection has no holonomy, and adding it to ω changes none', () => {
  const chi = (x, y) => 0.8 * x + 0.5 * Math.sin(2 * y) - 0.3 * x * y;
  const pure = gaugeField(chi);
  const loop = circleLoop(0.9, { n: 600, cx: 0.1, cy: -0.2 });
  close(holonomy(pure, loop), 0, 1e-6, '∮dχ = 0');
  const sum = { omega: (x, y) => FIELD.omega(x, y).map((w, i) => w + pure.omega(x, y)[i]) };
  close(holonomy(sum, loop), holonomy(FIELD, loop), 1e-6, 'holonomy is gauge invariant');
  close(holonomy(flatField, loop), 0, 1e-15);
  // along an open path the pure-gauge transport is χ(Q) − χ(P), whatever the road
  const { straight, bent } = twoRoads([-1, 0.2], [1, -0.4], 0.9, { n: 400 });
  close(lineIntegral(pure, straight), chi(1, -0.4) - chi(-1, 0.2), 1e-5);
  close(lineIntegral(pure, bent), chi(1, -0.4) - chi(-1, 0.2), 1e-5);
});

test('tiling: the small holonomies add up to the boundary holonomy exactly, and curvature × area converges to the flux', () => {
  const big = tiling(FIELD, -0.4, -1.1, 1.6, 1);
  const sums = [1, 2, 4, 8, 16].map((n) => tiling(FIELD, -0.4, -1.1, 1.6, n));
  for (const t of sums) {
    close(t.sumHol, t.boundary, 1e-9, 'interior edges cancel');
    close(t.boundary, big.boundary, 3e-3, 'the same loop, sampled more finely');
  }
  const errors = sums.map((t) => Math.abs(t.sumEstimate - t.flux));
  for (let i = 1; i < errors.length; i++) assert.ok(errors[i] < errors[i - 1] || errors[i] < 1e-6, `estimate error shrinks with n: ${errors}`);
  close(sums.at(-1).sumEstimate, sums.at(-1).flux, 5e-3, 'n = 16 is close');
  close(big.flux, big.boundary, 3e-3, 'flux equals the boundary holonomy (Stokes)');
  // each small cell: holonomy ≈ curvature × area
  for (const c of sums.at(-1).cells.slice(0, 20)) close(c.hol, c.estimate, 1.5e-3, 'cell holonomy ≈ B · area');
});

test('triangle and polygon flux reduce to area for B = 1, and centroid is the mean for a square', () => {
  const sq = squareLoop(0, 0, 2, { perSide: 10 }).slice(0, -1);
  close(polygonFlux(() => 1, sq, 3), 4, 1e-12);
  close(triangleFlux(() => 1, [0, 0], [1, 0], [0, 1], 5), 0.5, 1e-12);
  close(triangleFlux(() => 1, [0, 0], [0, 1], [1, 0], 5), -0.5, 1e-12, 'orientation');
  const c = centroid(sq);
  close(c[0], 1, 1e-12);
  close(c[1], 1, 1e-12);
  // a linear density is integrated exactly by the centroid rule
  close(polygonFlux((x, y) => 3 * x - y, sq, 1), 3 * 1 * 4 - 1 * 4, 1e-12);
});

// ---- scenes 5–6: the action and its variations --------------------------------------------------

const T = 2;
const N = 400;

test('the free particle: the straight path is stationary (and minimal) and a bent one is not', () => {
  const xs = straightPath(-1, 0.8, T, N);
  for (const k of [1, 2, 3]) {
    const etas = sampleVariation(variations.humps(k), T, N);
    const { direct, byParts } = firstVariation(xs, etas, T, { m: 1 });
    close(direct, 0, 1e-9, `δS = 0 for ${k} humps`);
    close(byParts, 0, 1e-9);
    const S0 = action(xs, T);
    for (const eps of [-0.5, 0.3, 1]) assert.ok(action(varied(xs, etas, eps), T) > S0, 'the straight path has the least action');
    // the numerical derivative of S(ε) agrees with the first variation
    const h = 1e-4;
    close((action(varied(xs, etas, h), T) - action(varied(xs, etas, -h), T)) / (2 * h), direct, 1e-6);
  }
  const bent = bentPath(-1, 0.8, T, N, 0.7);
  const etas = sampleVariation(variations.humps(1), T, N);
  const { direct, byParts } = firstVariation(bent, etas, T);
  assert.ok(Math.abs(direct) > 0.1, 'a bent path is not stationary');
  close(direct, byParts, 1e-6, 'integration by parts');
  const h = 1e-4;
  close((action(varied(bent, etas, h), T) - action(varied(bent, etas, -h), T)) / (2 * h), direct, 1e-5);
});

test('with a potential: the shot trajectory is stationary for every variation, m ẍ = −V′(x)', () => {
  for (const key of ['gravity', 'spring', 'doubleWell']) {
    const { V, dV } = potentials[key];
    const { xs, v0 } = shoot((x) => -dV(x), -1, 0.8, T, N, { m: 1 });
    close(xs[0], -1, 1e-12);
    close(xs[N], 0.8, 1e-8, `${key}: hits the end point`);
    assert.ok(Number.isFinite(v0));
    const acc = accelerations(xs, T);
    for (let i = 5; i < N - 5; i += 20) close(acc[i], -dV(xs[i]), 2e-3 * (1 + Math.abs(dV(xs[i]))), `${key}: m ẍ = −V′ at node ${i}`);
    for (const eta of [variations.humps(1), variations.humps(3), variations.local(0.3), variations.local(0.75)]) {
      const etas = sampleVariation(eta, T, N);
      const { direct, byParts } = firstVariation(xs, etas, T, { m: 1, dV });
      close(direct, 0, 2e-4, `${key}: δS = 0 (up to the O(dt²) of the integrator)`);
      close(direct, byParts, 1e-4, 'integration by parts, up to O(dt²)');
      const h = 1e-4;
      close((action(varied(xs, etas, h), T, { V }) - action(varied(xs, etas, -h), T, { V })) / (2 * h), direct, 1e-5);
    }
    // the straight path is not stationary in a potential
    const etas = sampleVariation(variations.humps(1), T, N);
    assert.ok(Math.abs(firstVariation(straightPath(-1, 0.8, T, N), etas, T, { dV }).direct) > 0.05, `${key}: the straight path is not stationary`);
  }
  // gravity: the trajectory is the parabola x = −1 + v0 t − t²/2
  const { xs, v0 } = shoot(() => -1, -1, 0.8, T, N);
  for (let i = 0; i <= N; i += 50) close(xs[i], -1 + v0 * times(T, N)[i] - 0.5 * times(T, N)[i] ** 2, 1e-9, 'parabola');
  // velocities: the straight path has constant velocity
  const vs = velocities(straightPath(-1, 0.8, T, N), T);
  for (const v of vs) close(v, 0.9, 1e-9);
});

// ---- scenes 7–9: the charge, the ribbon, the balance ----------------------------------------------

test('the ribbon: the two dials disagree by the curvature flux through the ribbon, ∫ Ω(εη, U) dt, in either gauge', () => {
  const xs = bentPath(-1, 0.8, T, N, 0.4);
  for (const eta of [variations.humps(1), variations.humps(2), variations.local(0.6)]) {
    const etas = sampleVariation(eta, T, N);
    for (const eps of [0.3, -0.5, 1]) {
      const results = ['phi', 'vec'].map((gauge) => {
        const field = electricField({ E: 0.8, gauge });
        const dTheta = worldlineTransport(field, varied(xs, etas, eps), T).at(-1) - worldlineTransport(field, xs, T).at(-1);
        const { flux, alongWorldline } = ribbonFlux(field, xs, etas, eps, T);
        close(dTheta, flux, 2e-3, `${gauge}: two dials disagree by the ribbon flux`);
        close(flux, alongWorldline, 1e-12, '∬Ω = ∫Ω(εη, U) dt, exact for a uniform E');
        return { dTheta, single: worldlineTransport(field, xs, T).at(-1) };
      });
      close(results[0].dTheta, results[1].dTheta, 2e-3, 'the disagreement is gauge invariant');
      assert.ok(Math.abs(results[0].single - results[1].single) > 0.05, 'the phase along one path depends on the gauge');
    }
  }
});

test('two roads as a worldline and its nudge; Stokes along the strip, cell by cell', () => {
  const { straight, nudged } = nudgedRoads({ x0: 0.1, eps: 0.15, u0: 0.4, n: 240 });
  close(nudged[0][0], 0.1, 1e-12);
  close(nudged[240][0], 0.1, 1e-12);
  assert.ok(nudged[96][0] > 0.1 + 0.09, 'the nudge bulges to the right (positive ε)');
  close(hump(0, 0.5), 0, 1e-12);
  close(hump(1, 0.5), 0, 1e-12);
  // positive ε: out along the nudged road (right), back along the straight one: counter-clockwise, positive area
  assert.ok(polygonArea(roadsLoop(nudged, straight)) > 0);
  const dTheta = transport(FIELD, nudged).at(-1) - transport(FIELD, straight).at(-1);
  close(dTheta, disagreementFlux(FIELD.B, straight, nudged, 12), 2e-3, 'Δθ = flux through the strip oriented (η, U)');
  const tilings = [1, 2, 4, 8, 16, 32].map((n) => stripTiling(FIELD, straight, nudged, n));
  for (const tl of tilings) {
    close(tl.sumHol, tl.boundary, 1e-9, 'the cell holonomies add up to the boundary exactly');
    close(tl.boundary, dTheta, 1e-12);
  }
  // the Riemann sum of B(centre) · area converges, for a thin strip, to the flux (exactly so as ε → 0)
  const errors = tilings.map((tl) => Math.abs(tl.sumEstimate - tl.flux));
  assert.ok(errors.at(-1) < errors[0], `the Riemann sum converges: ${errors}`);
  close(tilings.at(-1).sumEstimate, tilings.at(-1).flux, 2e-3);
  for (const c of tilings.at(-1).cells) close(c.hol, c.estimate, 4e-3, 'a thin cell: holonomy ≈ B · area');
});

test('the ribbon in the plane: a sideways nudge of a planar path has flux ε ∫ B (η_x ẏ − η_y ẋ) dt', () => {
  const Tp = 2;
  const Np = 300;
  const path = Array.from({ length: Np + 1 }, (_, i) => {
    const t = (Tp * i) / Np;
    return [-1.2 + 1.1 * t, -0.8 + 0.4 * Math.sin(1.5 * t)];
  });
  const etas = path.map((_, i) => {
    const u = i / Np;
    const h = hump(u, 0.5, 0.2);
    // sideways: the left normal of the path
    const k = Math.min(Math.max(i, 1), Np - 1);
    const dx = path[k + 1][0] - path[k - 1][0];
    const dy = path[k + 1][1] - path[k - 1][1];
    const L = Math.hypot(dx, dy);
    return [(-dy / L) * h, (dx / L) * h];
  });
  for (const eps of [0.05, 0.02]) {
    const { flux, alongPath, nudged } = planeRibbonFlux(FIELD, path, etas, eps, Tp);
    const dTheta = transport(FIELD, nudged).at(-1) - transport(FIELD, path).at(-1);
    close(dTheta, flux, 1e-3, 'two dials disagree by the flux');
    close(flux, alongPath, 0.3 * eps * eps + 2e-4, 'first order in ε');
  }
});

test('the balance: on the physical worldline the curvature response equals the inertial response for every η, so m ẍ = eE', () => {
  const E = 0.9;
  const field = electricField({ E });
  const { xs } = shoot(() => E, -1, 0.8, T, N, { m: 1 }); // q = 1: force eE
  const acc = accelerations(xs, T);
  for (let i = 10; i < N - 10; i += 25) close(acc[i], E, 1e-6, 'ẍ = E');
  for (const eta of [variations.humps(1), variations.humps(3), variations.local(0.25), variations.local(0.8)]) {
    const etas = sampleVariation(eta, T, N);
    const { perTime } = ribbonFlux(field, xs, etas, 1, T);
    const kinetic = firstVariation(xs, etas, T, { m: 1 }); // −∫ m ẍ η dt on the nodes
    // the integrand of δS = e F(η, U) − m ẍ η vanishes pointwise
    for (let i = 10; i < N - 10; i += 25) close(perTime[i] + kinetic.onNodes[i], 0, 1e-5, 'pointwise balance');
    const dSint = perTime.reduce((s, f, i) => s + (i === 0 || i === N ? 0 : f * (T / N)), 0);
    close(dSint + kinetic.byParts, 0, 1e-5, 'δS_int + δS_kin = 0');
  }
  // a worldline that is not the physical one is not balanced
  const wrong = straightPath(-1, 0.8, T, N);
  const etas = sampleVariation(variations.humps(1), T, N);
  const dSint = ribbonFlux(field, wrong, etas, 1, T).alongWorldline;
  assert.ok(Math.abs(dSint + firstVariation(wrong, etas, T).byParts) > 0.1);
});

test('the Lorentz force is curvature with the velocity plugged in: perpendicular to v for E = 0, and the Boris orbit is the cyclotron circle', () => {
  for (let k = 0; k < 10; k++) {
    const vx = uniform(-1, 1);
    const vy = uniform(-1, 1);
    const B = uniform(-2, 2);
    const q = rng.uniform() < 0.5 ? 1 : -1;
    const [fx, fy] = lorentz(q, B, [0, 0], vx, vy);
    close(fx * vx + fy * vy, 0, 1e-12, 'no work');
    close(Math.hypot(fx, fy), Math.abs(q * B) * Math.hypot(vx, vy), 1e-12);
    // F(η, U) for F = B dx∧dy: the force covector applied to η is q B (vy ηx − vx ηy)
    const eta = [uniform(-1, 1), uniform(-1, 1)];
    const F = (u, v) => B * (u[0] * v[1] - u[1] * v[0]);
    close(fx * eta[0] + fy * eta[1], q * F(eta, [vx, vy]), 1e-12, 'f♭ = q F(·, U)');
    // and with an electric field, F = B dx∧dy + E_x dx∧dt + E_y dy∧dt with U = (1, v): F(η, U) = E·η + B(ηx vy − ηy vx)
    const Ef = [uniform(-1, 1), uniform(-1, 1)];
    const [gx, gy] = lorentz(q, B, Ef, vx, vy);
    close(gx * eta[0] + gy * eta[1], q * (Ef[0] * eta[0] + Ef[1] * eta[1] + F(eta, [vx, vy])), 1e-12);
  }
  const state = { x: 0, y: 0, vx: 1.2, vy: 0 };
  const B = 1.5;
  const { radius, period } = cyclotron(1, 1, B, 1.2);
  const dt = 1 / 240;
  const steps = Math.round(period / dt);
  let maxSpeedError = 0;
  for (let i = 0; i < steps; i++) {
    borisStep(state, { q: 1, m: 1, B, E: [0, 0] }, dt);
    maxSpeedError = Math.max(maxSpeedError, Math.abs(Math.hypot(state.vx, state.vy) - 1.2));
  }
  close(maxSpeedError, 0, 1e-12, 'Boris conserves the speed');
  close(state.x, 0, 3e-3, 'back at the start after one period');
  close(state.y, 0, 3e-3);
  // the centre of the circle sits at −r in y for q B > 0 and v along +x (force q v × B ẑ = (0, −qBv))
  const s2 = { x: 0, y: 0, vx: 1.2, vy: 0 };
  for (let i = 0; i < Math.round(steps / 2); i++) borisStep(s2, { q: 1, m: 1, B, E: [0, 0] }, dt);
  close(s2.y, -2 * radius, 5e-3, 'half a turn later it is 2r below');
});
