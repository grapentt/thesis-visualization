// Everything "From phase to force" computes on screen, with no DOM: connections on the plane and
// their holonomies and fluxes (scenes 1–4), the action of a particle on a line and its variations
// (scenes 5–9), and the Lorentz-force simulation in the plane (scene 9). Tested by
// tests/u1-force.test.mjs. Everything is phase-normalised: ω = (e/ħ) A, Ω = dω = (e/ħ) F, so angles
// are angles and the interaction action is ħ times the angle a dial turns.

// ---------------------------------------------------------------------------------------------------
// connections on the plane: ω = ω_x dx + ω_y dy, Ω = B(x, y) dx∧dy

/**
 * A connection whose curvature is B(x, y) = B0 + Σ B1 exp(−|p − c|² / s²): a uniform background in the
 * symmetric gauge, (B0/2)(−y dx + x dy), plus one radial gauge field per Gaussian bump,
 * Φ(r) / (2π r²) · (−(y − c_y) dx + (x − c_x) dy) with the enclosed flux Φ(r) = π s² B1 (1 − e^{−r²/s²}).
 * Returns { B(x, y), omega(x, y) → [ω_x, ω_y], flux(r) of each bump, params }.
 */
export function planeField({ B0 = 0, bumps = [] } = {}) {
  const B = (x, y) => {
    let b = B0;
    for (const { B1, c, s } of bumps) {
      const dx = x - c[0];
      const dy = y - c[1];
      b += B1 * Math.exp(-(dx * dx + dy * dy) / (s * s));
    }
    return b;
  };
  const omega = (x, y) => {
    let wx = (-B0 * y) / 2;
    let wy = (B0 * x) / 2;
    for (const { B1, c, s } of bumps) {
      const dx = x - c[0];
      const dy = y - c[1];
      const r2 = dx * dx + dy * dy;
      // Φ(r) / (2π r²), with its limit B1 / 2 at the centre
      const a = r2 < 1e-12 ? B1 / 2 : (B1 * s * s * (1 - Math.exp(-r2 / (s * s)))) / (2 * r2);
      wx += -a * dy;
      wy += a * dx;
    }
    return [wx, wy];
  };
  return { B, omega, params: { B0, bumps } };
}

/** The pure-gauge connection ω = dχ for χ(x, y): its holonomies all vanish. */
export const gaugeField = (chi, h = 1e-5) => ({
  B: () => 0,
  omega: (x, y) => [(chi(x + h, y) - chi(x - h, y)) / (2 * h), (chi(x, y + h) - chi(x, y - h)) / (2 * h)],
  chi,
});

/** The flat connection ω = 0. */
export const flatField = { B: () => 0, omega: () => [0, 0] };

/** ∫ω along a polyline of [x, y] points (midpoint rule on every segment). */
export function lineIntegral(field, points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [wx, wy] = field.omega((x0 + x1) / 2, (y0 + y1) / 2);
    total += wx * (x1 - x0) + wy * (y1 - y0);
  }
  return total;
}

/** The transported phase at every point of a polyline, starting from theta0: θ_i = θ0 + ∫ω up to i. */
export function transport(field, points, theta0 = 0) {
  const out = [theta0];
  let theta = theta0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [wx, wy] = field.omega((x0 + x1) / 2, (y0 + y1) / 2);
    theta += wx * (x1 - x0) + wy * (y1 - y0);
    out.push(theta);
  }
  return out;
}

/** Holonomy of a closed polyline (first point repeated at the end, or not: it is closed here). */
export function holonomy(field, loop) {
  const closed = loop[0][0] === loop[loop.length - 1][0] && loop[0][1] === loop[loop.length - 1][1] ? loop : [...loop, loop[0]];
  return lineIntegral(field, closed);
}

/** Signed area of a closed polygon (shoelace); counter-clockwise is positive. */
export function polygonArea(points) {
  let a = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    a += x0 * y1 - y0 * x1;
  }
  return a / 2;
}

/** The centroid of a closed polygon (area-weighted). */
export function centroid(points) {
  const n = points.length;
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    const w = x0 * y1 - y0 * x1;
    a += w;
    cx += (x0 + x1) * w;
    cy += (y0 + y1) * w;
  }
  if (Math.abs(a) < 1e-14) return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
  return [cx / (3 * a), cy / (3 * a)];
}

/** ∬ B dx dy over a triangle (signed by its orientation), by m² sub-triangles with the centroid rule. */
export function triangleFlux(B, P, Q, R, m = 4) {
  const area = ((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])) / 2;
  if (Math.abs(area) < 1e-16) return 0;
  const cell = area / (m * m);
  let total = 0;
  // barycentric grid: sub-triangles (i, j, i + 1, j) upright and (i + 1, j + 1 …) inverted
  const at = (u, v) => [P[0] + (Q[0] - P[0]) * u + (R[0] - P[0]) * v, P[1] + (Q[1] - P[1]) * u + (R[1] - P[1]) * v];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m - i; j++) {
      const [x1, y1] = at((i + 1 / 3) / m, (j + 1 / 3) / m);
      total += B(x1, y1) * cell;
      if (j < m - i - 1) {
        const [x2, y2] = at((i + 2 / 3) / m, (j + 2 / 3) / m);
        total += B(x2, y2) * cell;
      }
    }
  }
  return total;
}

/** ∬ B dx dy over a star-shaped closed polygon, as a fan of triangles from its centroid. */
export function polygonFlux(B, points, m = 4) {
  const c = centroid(points);
  const n = points.length;
  let total = 0;
  for (let i = 0; i < n; i++) total += triangleFlux(B, c, points[i], points[(i + 1) % n], m);
  return total;
}

/**
 * ∬ B dx dy over the strip between two polylines with the same number of points (the region swept
 * when path1 is deformed into path2), oriented as the loop "path1 out, path2 back": it equals that
 * loop's holonomy ∫_{path1} ω − ∫_{path2} ω (Stokes), positive when path2 lies to the left of path1
 * seen along the direction of travel.
 */
export function stripFlux(B, path1, path2, m = 3) {
  let total = 0;
  for (let i = 1; i < path1.length; i++) {
    // the quad path1[i−1] → path1[i] → path2[i] → path2[i−1], split in two triangles
    total += triangleFlux(B, path1[i - 1], path1[i], path2[i], m) + triangleFlux(B, path1[i - 1], path2[i], path2[i - 1], m);
  }
  return total;
}

/**
 * How much more a dial turns along path2 than along path1 (both from P to Q): ∫_{path2} ω − ∫_{path1} ω,
 * written as the curvature flux through the strip between them, oriented from path1 towards path2.
 */
export const disagreementFlux = (B, path1, path2, m = 3) => stripFlux(B, path2, path1, m);

// ---- loops ----------------------------------------------------------------------------------------

/** A closed loop of n + 1 points r(φ)·(cos φ, sin φ) around (cx, cy), counter-clockwise. */
export function circleLoop(radius, { n = 240, cx = 0, cy = 0 } = {}) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const phi = (i / n) * 2 * Math.PI;
    const r = typeof radius === 'function' ? radius(phi) : radius;
    return [cx + r * Math.cos(phi), cy + r * Math.sin(phi)];
  });
}

/** The axis-aligned square [x0, x0 + side] × [y0, y0 + side] as a counter-clockwise closed loop. */
export function squareLoop(x0, y0, side, { perSide = 60 } = {}) {
  const corners = [
    [x0, y0],
    [x0 + side, y0],
    [x0 + side, y0 + side],
    [x0, y0 + side],
  ];
  const pts = [];
  corners.forEach((a, k) => {
    const b = corners[(k + 1) % 4];
    for (let i = 0; i < perSide; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / perSide, a[1] + ((b[1] - a[1]) * i) / perSide]);
  });
  pts.push(corners[0]);
  return pts;
}

/**
 * Two roads from P to Q: a straight one, and one bulging sideways by `bulge` (positive: to the left of
 * the direction P → Q) with the profile sin(π u). Both have n + 1 points.
 */
export function twoRoads(P, Q, bulge, { n = 120 } = {}) {
  const dx = Q[0] - P[0];
  const dy = Q[1] - P[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const straight = [];
  const bent = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = P[0] + dx * u;
    const y = P[1] + dy * u;
    straight.push([x, y]);
    const b = bulge * Math.sin(Math.PI * u);
    bent.push([x + nx * b, y + ny * b]);
  }
  return { straight, bent };
}

/** Path 1 out, path 2 back: the closed loop two roads enclose (counter-clockwise if the bulge is left). */
export const roadsLoop = (road1, road2) => [...road1, ...[...road2].reverse().slice(1)];

/**
 * Stokes by tiling: the square [x0, x0 + side]² cut into n × n cells. For every cell: its exact
 * holonomy (the line integral around it) and the curvature-times-area estimate B(centre) · area.
 * Returns { cells: [{ x, y, side, hol, estimate }], sumHol, sumEstimate, boundary, flux }.
 * sumHol equals `boundary` up to rounding, because every interior edge is walked twice in opposite
 * directions; sumEstimate converges to the flux as n grows.
 */
export function tiling(field, x0, y0, side, n, { perSide = 12 } = {}) {
  const h = side / n;
  const cells = [];
  let sumHol = 0;
  let sumEstimate = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = x0 + i * h;
      const y = y0 + j * h;
      const hol = holonomy(field, squareLoop(x, y, h, { perSide }));
      const estimate = field.B(x + h / 2, y + h / 2) * h * h;
      cells.push({ x, y, side: h, hol, estimate });
      sumHol += hol;
      sumEstimate += estimate;
    }
  }
  const boundary = holonomy(field, squareLoop(x0, y0, side, { perSide: perSide * n }));
  const flux = polygonFlux(field.B, squareLoop(x0, y0, side, { perSide: 4 }).slice(0, -1), 24);
  return { cells, sumHol, sumEstimate, boundary, flux };
}

// ---------------------------------------------------------------------------------------------------
// a particle on a line: paths x(t) on a grid, actions, variations, trajectories

/** N + 1 equally spaced times from 0 to T. */
export const times = (T, N) => Array.from({ length: N + 1 }, (_, i) => (T * i) / N);

/** The straight path from xA at t = 0 to xB at t = T. */
export const straightPath = (xA, xB, T, N) => times(T, N).map((t) => xA + ((xB - xA) * t) / T);

/** A bent path: the straight one plus `amount` · sin(π t / T)². */
export const bentPath = (xA, xB, T, N, amount) => times(T, N).map((t) => xA + ((xB - xA) * t) / T + amount * Math.sin((Math.PI * t) / T) ** 2);

/** Variation shapes η(t) with η(0) = η(T) = 0. */
export const variations = {
  /** k humps: sin(k π t / T). */
  humps: (k) => (t, T) => Math.sin((k * Math.PI * t) / T),
  /** one hump localised at τ (fraction of T) of width w (fraction of T). */
  local: (tau, w = 0.12) => (t, T) => Math.sin((Math.PI * t) / T) * Math.exp(-((t / T - tau) ** 2) / (2 * w * w)),
};

/** Samples of η on the grid. */
export const sampleVariation = (eta, T, N) => times(T, N).map((t) => eta(t, T));

/** The potentials of scene 6: V(x) and V′(x). */
export const potentials = {
  none: { label: 'no potential', V: () => 0, dV: () => 0 },
  gravity: { label: 'uniform field (gravity)', V: (x) => 1.0 * x, dV: () => 1.0 },
  spring: { label: 'harmonic well (a spring)', V: (x) => 0.5 * x * x, dV: (x) => x }, // k = 1: half period π > T, so the path bends straight toward the bottom
  doubleWell: { label: 'double well', V: (x) => 1.2 * (x * x - 1) ** 2, dV: (x) => 1.2 * 4 * x * (x * x - 1) },
};

/**
 * The action S = ∫ (½ m ẋ² − V(x)) dt of a sampled path (midpoint rule: velocities on the segments,
 * the potential at the segment midpoints).
 */
export function action(xs, T, { m = 1, V = () => 0 } = {}) {
  const N = xs.length - 1;
  const dt = T / N;
  let S = 0;
  for (let i = 0; i < N; i++) {
    const v = (xs[i + 1] - xs[i]) / dt;
    S += (0.5 * m * v * v - V((xs[i] + xs[i + 1]) / 2)) * dt;
  }
  return S;
}

/** The varied path x + ε η. */
export const varied = (xs, etas, eps) => xs.map((x, i) => x + eps * etas[i]);

/**
 * The first variation δS = dS/dε at ε = 0 for the variation η: ∫ (m ẋ η̇ − V′(x) η) dt, and the
 * same number after integrating by parts, −∫ (m ẍ + V′(x)) η dt (η vanishes at the ends).
 * Returns { byParts: false value, byParts: true value } as { direct, byParts, integrands }.
 */
export function firstVariation(xs, etas, T, { m = 1, dV = () => 0 } = {}) {
  const N = xs.length - 1;
  const dt = T / N;
  let direct = 0;
  const onSegments = []; // m ẋ η̇ − V′ η at segment midpoints (the integrand before parts)
  for (let i = 0; i < N; i++) {
    const v = (xs[i + 1] - xs[i]) / dt;
    const etaDot = (etas[i + 1] - etas[i]) / dt;
    const xm = (xs[i] + xs[i + 1]) / 2;
    const etaM = (etas[i] + etas[i + 1]) / 2;
    const f = m * v * etaDot - dV(xm) * etaM;
    onSegments.push(f);
    direct += f * dt;
  }
  let byParts = 0;
  const onNodes = []; // −(m ẍ + V′(x)) η at the interior nodes
  for (let i = 0; i <= N; i++) {
    if (i === 0 || i === N) {
      onNodes.push(0);
      continue;
    }
    const acc = (xs[i + 1] - 2 * xs[i] + xs[i - 1]) / (dt * dt);
    const f = -(m * acc + dV(xs[i])) * etas[i];
    onNodes.push(f);
    byParts += f * dt;
  }
  return { direct, byParts, onSegments, onNodes, dt };
}

/** The accelerations ẍ on the grid (second differences, one-sided at the ends). */
export function accelerations(xs, T) {
  const N = xs.length - 1;
  const dt = T / N;
  return xs.map((_, i) => {
    const k = Math.min(Math.max(i, 1), N - 1);
    return (xs[k + 1] - 2 * xs[k] + xs[k - 1]) / (dt * dt);
  });
}

/** The velocities ẋ on the grid (central differences, one-sided at the ends). */
export function velocities(xs, T) {
  const N = xs.length - 1;
  const dt = T / N;
  return xs.map((_, i) => (i === 0 ? (xs[1] - xs[0]) / dt : i === N ? (xs[N] - xs[N - 1]) / dt : (xs[i + 1] - xs[i - 1]) / (2 * dt)));
}

/** Integrate m ẍ = force(x, ẋ, t) from (x0, v0) over [0, T] on N steps (Störmer–Verlet). */
export function trajectory(force, x0, v0, T, N, { m = 1 } = {}) {
  const dt = T / N;
  const xs = [x0];
  let x = x0;
  let v = v0;
  let a = force(x, v, 0) / m;
  for (let i = 0; i < N; i++) {
    const vHalf = v + 0.5 * dt * a;
    x += dt * vHalf;
    a = force(x, vHalf, (i + 1) * dt) / m;
    v = vHalf + 0.5 * dt * a;
    xs.push(x);
  }
  return xs;
}

/**
 * The trajectory from xA at t = 0 that reaches xB at t = T under the force (shooting on the initial
 * velocity by bisection, then the secant method). Returns { xs, v0 }.
 */
export function shoot(force, xA, xB, T, N, { m = 1, lo = -8, hi = 8, scan = 64 } = {}) {
  const end = (v0) => trajectory(force, xA, v0, T, N, { m })[N] - xB;
  // scan for the bracket with a sign change that is closest to v0 = 0 (the slowest shot)
  let a = NaN;
  let b = NaN;
  let fa = 0;
  let fb = 0;
  let best = Infinity;
  let prev = end(lo);
  for (let k = 1; k <= scan; k++) {
    const v = lo + ((hi - lo) * k) / scan;
    const f = end(v);
    const vPrev = lo + ((hi - lo) * (k - 1)) / scan;
    if (prev * f <= 0 && Math.min(Math.abs(v), Math.abs(vPrev)) < best) {
      best = Math.min(Math.abs(v), Math.abs(vPrev));
      a = vPrev;
      b = v;
      fa = prev;
      fb = f;
    }
    prev = f;
  }
  if (!Number.isFinite(a)) throw new Error('shoot: no sign change in the bracket');
  for (let k = 0; k < 60; k++) {
    const c = (a + b) / 2;
    const fc = end(c);
    if (fa * fc <= 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }
  let v0 = (a + b) / 2;
  for (let k = 0; k < 4; k++) {
    const f0 = end(v0);
    const f1 = end(v0 + 1e-6);
    const slope = (f1 - f0) / 1e-6;
    if (Math.abs(slope) < 1e-12) break;
    v0 -= f0 / slope;
  }
  return { xs: trajectory(force, xA, v0, T, N, { m }), v0 };
}

// ---------------------------------------------------------------------------------------------------
// a charge on a line in an electric field (phase units): a 1+1 connection ω = a(t, x) dt + b(t, x) dx
// whose curvature is Ω = dω = (∂a/∂x − ∂b/∂t) dx∧dt = E dx∧dt.

/**
 * The uniform field E in two gauges with the same curvature E dx∧dt:
 *   'phi':  ω = E x dt           (a scalar potential φ = −E x: the hand turns at a rate set by x)
 *   'vec':  ω = −E t dx          (a vector potential growing in time: the hand turns only while moving)
 * Returns { E(t, x), a(t, x), b(t, x), gauge, params }.
 */
export function electricField({ E = 1, gauge = 'phi' } = {}) {
  return {
    E: () => E,
    a: gauge === 'phi' ? (t, x) => E * x : () => 0,
    b: gauge === 'phi' ? () => 0 : (t) => -E * t,
    gauge,
    params: { E, gauge },
  };
}

/** The phase transported along the worldline (t_i, x_i): θ_i = ∫ (a + b ẋ) dt (midpoint rule). */
export function worldlineTransport(field, xs, T, theta0 = 0) {
  const N = xs.length - 1;
  const dt = T / N;
  const out = [theta0];
  let theta = theta0;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * dt;
    const x = (xs[i] + xs[i + 1]) / 2;
    const v = (xs[i + 1] - xs[i]) / dt;
    theta += (field.a(t, x) + field.b(t, x) * v) * dt;
    out.push(theta);
  }
  return out;
}

/**
 * The curvature flux through the ribbon between the worldline xs and xs + ε η, oriented by the
 * ordered pair (η across, U along) so that it equals ∫_{new} ω − ∫_{old} ω: ∬ E dx dt over the strip,
 * and the same quantity as ∫ Ω(εη, U) dt = ∫ E ε η dt (exact for a uniform E). Returns
 * { flux, alongWorldline, perTime } with perTime the integrand E η on the grid (per unit ε).
 */
export function ribbonFlux(field, xs, etas, eps, T) {
  const N = xs.length - 1;
  const dt = T / N;
  let flux = 0;
  let along = 0;
  const perTime = xs.map((x, i) => field.E(i * dt, x) * etas[i]);
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * dt;
    const x = (xs[i] + xs[i + 1]) / 2;
    const eta = (etas[i] + etas[i + 1]) / 2;
    flux += field.E(t, x) * eps * eta * dt;
    along += field.E(t, x) * eps * eta * dt;
  }
  return { flux, alongWorldline: along, perTime };
}

// ---------------------------------------------------------------------------------------------------
// two roads as a worldline and its nudge: P at the bottom, Q at the top, the nudge sideways in x

/**
 * The roads of scene 3 drawn like the worldlines of scene 8: the straight road from P to Q straight
 * up (x = x0, y from y0 to y1) and the nudged road x0 + ε η(u) with η the hump at u0 (fraction of the
 * way) of width w: η(u) = sin(π u) · exp(−(u − u0)² / 2w²). Both have n + 1 points.
 */
export function nudgedRoads({ x0 = 0, y0 = -1.4, y1 = 1.4, eps = 0.4, u0 = 0.5, w = 0.18, n = 120 } = {}) {
  const straight = [];
  const nudged = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const y = y0 + (y1 - y0) * u;
    straight.push([x0, y]);
    nudged.push([x0 + eps * hump(u, u0, w), y]);
  }
  return { straight, nudged };
}

/** The hump η(u) = sin(π u) exp(−(u − u0)² / 2w²) on u ∈ [0, 1]: zero at both ends. */
export const hump = (u, u0 = 0.5, w = 0.18) => Math.sin(Math.PI * u) * Math.exp(-((u - u0) ** 2) / (2 * w * w));

/**
 * Stokes along a strip: the region between path1 and path2 (same length) cut into n cells along the
 * way. For every cell: its holonomy (the line integral around it, counter-clockwise when path2 lies
 * to the right of path1 seen along the direction of travel, i.e. oriented as (across, along)), and
 * the curvature-times-area estimate B(centre) · area. Returns { cells, sumHol, sumEstimate,
 * boundary, flux }: sumHol equals `boundary` (= ∫_{path2} ω − ∫_{path1} ω) exactly, because every
 * cut between neighbouring cells is walked twice in opposite directions; sumEstimate converges to
 * `flux` as n grows.
 */
export function stripTiling(field, path1, path2, n) {
  const N = path1.length - 1;
  const cells = [];
  let sumHol = 0;
  let sumEstimate = 0;
  for (let k = 0; k < n; k++) {
    const i0 = Math.round((N * k) / n);
    const i1 = Math.round((N * (k + 1)) / n);
    if (i1 <= i0) continue;
    // the cell boundary: along path1 from i0 to i1, across to path2, back along path2, across to path1
    const loop = [...path1.slice(i0, i1 + 1), ...path2.slice(i0, i1 + 1).reverse(), path1[i0]];
    const hol = -lineIntegral(field, loop); // path1 out, path2 back is the reverse orientation
    const corners = [path1[i0], path1[i1], path2[i1], path2[i0]];
    const area = -polygonArea(corners);
    const c = centroid(corners);
    const estimate = field.B(c[0], c[1]) * area;
    cells.push({ i0, i1, corners, hol, estimate, area });
    sumHol += hol;
    sumEstimate += estimate;
  }
  const boundary = lineIntegral(field, path2) - lineIntegral(field, path1);
  const flux = disagreementFlux(field.B, path1, path2, 12);
  return { cells, sumHol, sumEstimate, boundary, flux };
}

// ---------------------------------------------------------------------------------------------------
// a charge in the plane: the Lorentz force as curvature with the velocity plugged in

/**
 * The force covector f♭ = q F(·, U) for F = B dx∧dy + E_x dx∧dt (+ E_y dy∧dt) and U = (1, vx, vy):
 * f = q (E + v × B ẑ) = q (E_x + B vy, E_y − B vx).
 */
export const lorentz = (q, B, E, vx, vy) => [q * (E[0] + B * vy), q * (E[1] - B * vx)];

/** One Boris step of a charge of mass m in B (along z) and E: exact energy conservation for E = 0. */
export function borisStep(state, { q = 1, m = 1, B = 1, E = [0, 0] }, dt) {
  // half kick by E
  let vx = state.vx + ((0.5 * dt * q) / m) * E[0];
  let vy = state.vy + ((0.5 * dt * q) / m) * E[1];
  // rotation by B: v′ = v + v × t, v⁺ = v + v′ × s with t = (qB/m)(dt/2), s = 2t / (1 + t²)
  const tz = ((q * B) / m) * (0.5 * dt);
  const sz = (2 * tz) / (1 + tz * tz);
  // v × ẑ t = (vy t, −vx t)
  const vpx = vx + vy * tz;
  const vpy = vy - vx * tz;
  vx += vpy * sz;
  vy += -vpx * sz;
  // half kick by E
  vx += ((0.5 * dt * q) / m) * E[0];
  vy += ((0.5 * dt * q) / m) * E[1];
  state.vx = vx;
  state.vy = vy;
  state.x += dt * vx;
  state.y += dt * vy;
}

/**
 * The ribbon in the plane: a path (x_i, y_i) sampled in time and a sideways nudge η_i (vectors), the
 * curvature flux through the strip between the path and path + ε η, oriented by (η, U): equals
 * ε ∫ B (η_x ẏ − η_y ẋ) dt to first order, and exactly ∫_{new} ω − ∫_{old} ω. Returns
 * { flux, alongPath, perTime } with perTime the integrand B (η_x ẏ − η_y ẋ) on the grid (per unit ε).
 */
export function planeRibbonFlux(field, path, etas, eps, T) {
  const N = path.length - 1;
  const dt = T / N;
  const nudged = path.map(([x, y], i) => [x + eps * etas[i][0], y + eps * etas[i][1]]);
  const flux = disagreementFlux(field.B, path, nudged, 6);
  const perTime = path.map(([x, y], i) => {
    const k = Math.min(Math.max(i, 1), N - 1);
    const vx = (path[k + 1][0] - path[k - 1][0]) / (2 * dt);
    const vy = (path[k + 1][1] - path[k - 1][1]) / (2 * dt);
    return field.B(x, y) * (etas[i][0] * vy - etas[i][1] * vx);
  });
  let along = 0;
  for (let i = 1; i < N; i++) along += eps * perTime[i] * dt;
  return { flux, alongPath: along, perTime, nudged };
}

/** Cyclotron radius and period for speed v: r = m v / (|q| B), T = 2π m / (|q| B). */
export const cyclotron = (q, m, B, v) => ({ radius: (m * v) / Math.abs(q * B), period: (2 * Math.PI * m) / Math.abs(q * B) });
