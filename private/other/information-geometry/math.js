// The mathematics of "The geometry of information": three families of distributions (coins,
// three-sided dice, Gaussians), their Fisher metrics, Fisher–Rao distances and geodesics, the
// Kullback–Leibler and Bregman divergences, the two flat connections of the simplex, and plain
// against natural-gradient descent. Pure functions, no DOM, no randomness; every identity the
// narration states is checked in tests/information-geometry.test.mjs.

export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const sum = (a) => a.reduce((s, v) => s + v, 0);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const normalize = (w) => {
  const z = sum(w);
  return w.map((v) => v / z);
};
/** x log y with the convention 0 log 0 = 0. */
export const xlogy = (x, y) => (x > 0 ? x * Math.log(y) : 0);

// ---- coins: the Bernoulli family -----------------------------------------------------------

/** Fisher information of one flip at bias p. */
export const bernoulliFisher = (p) => 1 / (p * (1 - p));
/** The angle φ = 2 arcsin √p ∈ [0, π]: the coordinate in which the Fisher metric is dφ² (flat). */
export const bernoulliAngle = (p) => 2 * Math.asin(Math.sqrt(clamp(p)));
export const bernoulliFromAngle = (phi) => Math.sin(phi / 2) ** 2;
/** Fisher–Rao distance between two coins: 2 arccos(√(pq) + √((1−p)(1−q))) = |φ(p) − φ(q)|. */
export const bernoulliDistance = (p, q) => 2 * Math.acos(clamp(Math.sqrt(p * q) + Math.sqrt((1 - p) * (1 - q)), -1, 1));
export const klBernoulli = (p, q) => xlogy(p, p / q) + xlogy(1 - p, (1 - p) / (1 - q));
export const logit = (p) => Math.log(p / (1 - p));
export const sigmoid = (x) => 1 / (1 + Math.exp(-x));
/** The same metric in the logit coordinate x: g(x) = p(1 − p) with p = σ(x). A tensor, not a number. */
export const bernoulliFisherLogit = (x) => {
  const p = sigmoid(x);
  return p * (1 - p);
};
/** Log-likelihood and score of one flip (x = 1 heads, 0 tails) at bias p. */
export const bernoulliLogLik = (x, p) => (x ? Math.log(p) : Math.log(1 - p));
export const bernoulliScore = (x, p) => (x ? 1 / p : -1 / (1 - p));

const LOG_FACTORIAL = [0];
export function logFactorial(n) {
  while (LOG_FACTORIAL.length <= n) LOG_FACTORIAL.push(LOG_FACTORIAL[LOG_FACTORIAL.length - 1] + Math.log(LOG_FACTORIAL.length));
  return LOG_FACTORIAL[n];
}
export const logChoose = (n, k) => logFactorial(n) - logFactorial(k) - logFactorial(n - k);
/** P(k heads in n flips) at bias p. */
export const binomialPmf = (n, p, k) => Math.exp(logChoose(n, k) + xlogy(k, p) + xlogy(n - k, 1 - p));
export const binomialPmfs = (n, p) => Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, p, k));
/** How many standard deviations apart two coins are after n flips: √n times their Fisher–Rao distance. */
export const separationInSd = (p, q, n) => Math.sqrt(n) * bernoulliDistance(p, q);
/** The usual z-score of the same test, (q − p) over the standard error at p; agrees to first order. */
export const zScore = (p, q, n) => (q - p) / Math.sqrt((p * (1 - p)) / n);
/** How many coins n flips can tell apart, one standard deviation at a time: √n × the length π of the family. */
export const distinguishableCoins = (n) => Math.sqrt(n) * Math.PI;
/** Coins one standard deviation apart after n flips: evenly spaced in φ, spacing 1/√n, centred in [0, π]. */
export function distinguishableGrid(n) {
  const step = 1 / Math.sqrt(n);
  const count = Math.floor(Math.PI / step);
  const margin = (Math.PI - count * step) / 2;
  return Array.from({ length: count + 1 }, (_, i) => bernoulliFromAngle(margin + i * step));
}
/** Cramér–Rao: no unbiased estimate of p from n flips has variance below 1 / (n g(p)) = p(1 − p) / n. */
export const cramerRao = (p, n) => (p * (1 - p)) / n;
/** Jeffreys prior √g, normalised: the Beta(½, ½) density 1 / (π √(p(1 − p))); uniform in φ. */
export const jeffreys = (p) => 1 / (Math.PI * Math.sqrt(p * (1 - p)));

// ---- three-sided dice: the simplex ---------------------------------------------------------

export const entropy = (p) => -sum(p.map((v) => xlogy(v, v)));
/** KL(p ‖ q) = Σ p_i log(p_i / q_i). */
export const kl = (p, q) => sum(p.map((v, i) => xlogy(v, v / q[i])));
export const bhattacharyya = (p, q) => sum(p.map((v, i) => Math.sqrt(v * q[i])));
/** Fisher–Rao distance on the simplex: the great-circle distance 2 arccos Σ √(p_i q_i) on the sphere of radius 2. */
export const fisherRao = (p, q) => 2 * Math.acos(clamp(bhattacharyya(p, q), -1, 1));
/** Hellinger distance, H² = ½ Σ (√p_i − √q_i)² = 1 − Σ √(p_i q_i); the chord of that sphere is 2√2 H. */
export const hellinger = (p, q) => Math.sqrt(Math.max(0, 1 - bhattacharyya(p, q)));
/** The square-root embedding p ↦ 2√p onto the sphere of radius 2, where the Fisher metric is the round one. */
export const sphere = (p, radius = 2) => p.map((v) => radius * Math.sqrt(Math.max(v, 0)));
export const fromSphere = (x, radius = 2) => x.map((v) => (v / radius) ** 2);
export const chord = (p, q) => Math.hypot(...sphere(p).map((v, i) => v - sphere(q)[i]));

/** The Fisher–Rao geodesic from p to q at fraction s of its length: a great circle, squared back. */
export function fisherRaoGeodesic(p, q, s) {
  const u = p.map(Math.sqrt);
  const v = q.map(Math.sqrt);
  const th = Math.acos(clamp(dot(u, v), -1, 1));
  if (th < 1e-9) return p.slice();
  const a = Math.sin((1 - s) * th) / Math.sin(th);
  const b = Math.sin(s * th) / Math.sin(th);
  return u.map((ui, i) => (a * ui + b * v[i]) ** 2);
}
/** The mixture (m-) geodesic: straight in p. */
export const mixtureGeodesic = (p, q, s) => p.map((v, i) => (1 - s) * v + s * q[i]);
/** The exponential (e-) geodesic: straight in log p, renormalised. */
export const exponentialGeodesic = (p, q, s) => normalize(p.map((v, i) => Math.exp((1 - s) * Math.log(v) + s * Math.log(q[i]))));

/** Fisher metric of the 3-simplex in the coordinates (p₁, p₂), with p₃ = 1 − p₁ − p₂. */
export const simplexFisher = (p) => [
  [1 / p[0] + 1 / p[2], 1 / p[2]],
  [1 / p[2], 1 / p[1] + 1 / p[2]],
];
/** Its inverse: the covariance of the outcome indicators, [[p₁(1−p₁), −p₁p₂], [−p₁p₂, p₂(1−p₂)]]. */
export const simplexInverseFisher = (p) => [
  [p[0] * (1 - p[0]), -p[0] * p[1]],
  [-p[0] * p[1], p[1] * (1 - p[1])],
];
/** The Fisher inner product of two tangent vectors (components summing to zero) at p: Σ u_i v_i / p_i. */
export const fisherInner = (p, u, v) => sum(u.map((ui, i) => (ui * v[i]) / p[i]));
/** Points of the Fisher ball of radius r around p, in the coordinates (p₁, p₂). */
export const fisherBall = (p, r, count = 64) => ellipsePoints([p[0], p[1]], simplexInverseFisher(p), r, count);
/** Tangent at q of the e-geodesic from q towards r. */
export function eTangent(q, r) {
  const w = q.map((v, i) => Math.log(r[i]) - Math.log(v));
  const c = dot(q, w);
  return q.map((v, i) => v * (w[i] - c));
}
/** Tangent at q of the m-geodesic from q towards p. */
export const mTangent = (q, p) => p.map((v, i) => v - q[i]);
/**
 * A triangle p, q, r in which the m-geodesic from p to q meets the e-geodesic from q to r at a right
 * angle (in the Fisher metric), so that KL(p ‖ r) = KL(p ‖ q) + KL(q ‖ r). p = q + α u with u ⊥ 𝟙 and
 * u ⊥ (log r − log q).
 */
export function pythagoreanTriple(q, r, alpha) {
  const w = q.map((v, i) => Math.log(r[i]) - Math.log(v));
  const u = [w[1] - w[2], w[2] - w[0], w[0] - w[1]];
  return { p: q.map((v, i) => v + alpha * u[i]), q, r };
}
/** Coarse-graining: merge outcomes into groups, e.g. merge(p, [[0], [1, 2]]) turns a die into a coin. */
export const merge = (p, groups) => groups.map((g) => sum(g.map((i) => p[i])));
/** A Markov embedding: split outcome i into sub-outcomes with fixed fractions, e.g. split(p, 2, [⅓, ⅔]). */
export const split = (p, i, fractions) => p.flatMap((v, k) => (k === i ? fractions.map((f) => f * v) : [v]));

// the simplex as an exponential family, with the last outcome as reference
export const naturalParams = (p) => p.slice(0, -1).map((v) => Math.log(v / p[p.length - 1]));
export const logPartition = (theta) => Math.log(1 + sum(theta.map(Math.exp)));
export function fromNatural(theta) {
  const e = theta.map(Math.exp);
  const z = 1 + sum(e);
  return [...e.map((v) => v / z), 1 / z];
}
/** The mean parameters η = ∇ψ(θ) = (p₁, …, p_{d−1}). */
export const meanParams = (theta) => fromNatural(theta).slice(0, -1);
/** The Bregman divergence of ψ: B_ψ(θ_a, θ_b) = ψ(θ_a) − ψ(θ_b) − ⟨∇ψ(θ_b), θ_a − θ_b⟩ = KL(p_b ‖ p_a). */
export const bregman = (thetaA, thetaB) => logPartition(thetaA) - logPartition(thetaB) - dot(meanParams(thetaB), thetaA.map((v, i) => v - thetaB[i]));
/** The dual potential φ(η) = Σ p log p = −H(p), so that ψ(θ) + φ(η) = ⟨θ, η⟩. */
export const dualPotential = (p) => -entropy(p);

// ---- Gaussians: the hyperbolic plane -------------------------------------------------------

/** Fisher metric of N(μ, σ²) in the coordinates (μ, σ): diag(1/σ², 2/σ²). */
export const gaussianFisher = (mu, sigma) => [
  [1 / sigma ** 2, 0],
  [0, 2 / sigma ** 2],
];
/** (μ, σ) ↦ (μ/√2, σ) sends the family onto the Poincaré half-plane, up to a factor 2 in ds²: curvature −½. */
export const toHalfPlane = ([mu, sigma]) => [mu / Math.SQRT2, sigma];
export const fromHalfPlane = ([x, y]) => [x * Math.SQRT2, y];
/** Fisher–Rao distance between two Gaussians, in closed form. */
export function gaussianDistance(a, b) {
  const [x1, y1] = toHalfPlane(a);
  const [x2, y2] = toHalfPlane(b);
  return Math.SQRT2 * Math.acosh(1 + ((x1 - x2) ** 2 + (y1 - y2) ** 2) / (2 * y1 * y2));
}
/** Points of the Fisher–Rao geodesic from a to b, evenly spaced in Fisher–Rao length (a half-ellipse in (μ, σ)). */
export function gaussianGeodesic(a, b, count = 64) {
  const [x1, y1] = toHalfPlane(a);
  const [x2, y2] = toHalfPlane(b);
  if (Math.abs(x1 - x2) < 1e-9) return Array.from({ length: count + 1 }, (_, i) => fromHalfPlane([x1, y1 * Math.pow(y2 / y1, i / count)]));
  const c = (x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2) / (2 * (x1 - x2));
  const rho = Math.hypot(x1 - c, y1);
  const u = (x, y) => Math.log(Math.tan(Math.atan2(y, x - c) / 2));
  const u1 = u(x1, y1);
  const u2 = u(x2, y2);
  return Array.from({ length: count + 1 }, (_, i) => {
    const th = 2 * Math.atan(Math.exp(u1 + ((u2 - u1) * i) / count));
    return fromHalfPlane([c + rho * Math.cos(th), rho * Math.sin(th)]);
  });
}
/** The Fisher–Rao length of a polyline in (μ, σ), summed with the metric at the midpoints. */
export function gaussianLength(points) {
  let L = 0;
  for (let i = 1; i < points.length; i++) {
    const [m0, s0] = points[i - 1];
    const [m1, s1] = points[i];
    const s = (s0 + s1) / 2;
    L += Math.sqrt(((m1 - m0) ** 2 + 2 * (s1 - s0) ** 2) / (s * s));
  }
  return L;
}
export const gaussianPdf = (x, mu, sigma) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
/** KL(N(μ₁, σ₁²) ‖ N(μ₂, σ₂²)). */
export const klGaussian = ([m1, s1], [m2, s2]) => Math.log(s2 / s1) + (s1 * s1 + (m1 - m2) ** 2) / (2 * s2 * s2) - 0.5;
/** The Fisher circle of radius r around (μ, σ): semi-axes rσ along μ and rσ/√2 along σ. */
export const fisherCircle = ([mu, sigma], r, count = 64) =>
  Array.from({ length: count + 1 }, (_, i) => {
    const a = (2 * Math.PI * i) / count;
    return [mu + r * sigma * Math.cos(a), sigma + (r * sigma * Math.sin(a)) / Math.SQRT2];
  });

// ---- plain against natural gradient ----------------------------------------------------------

/** Gradient in (μ, σ) of the loss L(μ, σ) = KL(N(μ*, σ*²) ‖ N(μ, σ²)). */
export const klGradient = ([mu, sigma], [m0, s0]) => [(mu - m0) / sigma ** 2, 1 / sigma - (s0 * s0 + (mu - m0) ** 2) / sigma ** 3];
/** The natural gradient g⁻¹ ∇L = (σ² ∂_μ L, ½ σ² ∂_σ L). */
export const naturalGradient = (theta, target) => {
  const g = klGradient(theta, target);
  const s2 = theta[1] ** 2;
  return [s2 * g[0], (s2 / 2) * g[1]];
};
/**
 * Descent on L from `start`: 'plain' (gradient steps in (μ, σ)), 'log' (gradient steps in (μ, log σ)),
 * 'natural' (natural-gradient steps, the same in every coordinate system up to O(η²)). Returns the
 * visited points, start first.
 */
export function descend(start, target, { eta = 0.5, steps = 40, method = 'plain' } = {}) {
  const path = [start.slice()];
  let [mu, sigma] = start;
  for (let k = 0; k < steps; k++) {
    const [gm, gs] = klGradient([mu, sigma], target);
    if (method === 'plain') {
      mu -= eta * gm;
      sigma -= eta * gs;
    } else if (method === 'log') {
      mu -= eta * gm;
      sigma = Math.exp(Math.log(sigma) - eta * sigma * gs); // ∂L/∂(log σ) = σ ∂L/∂σ
    } else {
      const [nm, ns] = naturalGradient([mu, sigma], target);
      mu -= eta * nm;
      sigma -= eta * ns;
    }
    if (!(sigma > 1e-6) || !Number.isFinite(mu)) break;
    path.push([mu, sigma]);
  }
  return path;
}

/**
 * The natural-gradient flow of L = KL(p* ‖ p_θ) on an exponential family runs along the m-geodesic
 * from the start to the target: a straight line in the expectation coordinates η = (μ, μ² + σ²),
 * traversed as η(s) = η₀ + s (η* − η₀). Returned in (μ, σ).
 */
export function naturalFlowPath(start, target, count = 64) {
  const eta = ([m, s]) => [m, m * m + s * s];
  const e0 = eta(start);
  const e1 = eta(target);
  return Array.from({ length: count + 1 }, (_, i) => {
    const s = i / count;
    const m = e0[0] + s * (e1[0] - e0[0]);
    const v = e0[1] + s * (e1[1] - e0[1]) - m * m;
    return [m, Math.sqrt(Math.max(v, 1e-12))];
  });
}

// ---- numerics ---------------------------------------------------------------------------------

/** Eigen-decomposition of a symmetric 2 × 2 matrix. */
export function eigen2(S) {
  const [[a, b], [, d]] = S;
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const unit = (v) => {
    const n = Math.hypot(v[0], v[1]);
    return [v[0] / n, v[1] / n];
  };
  const vec = (l) => (Math.abs(b) > 1e-12 ? unit([b, l - a]) : Math.abs(a - l) < Math.abs(d - l) ? [1, 0] : [0, 1]);
  return { values: [l1, l2], vectors: [vec(l1), vec(l2)] };
}
/** Points of the ellipse {x : (x − c)ᵀ Σ⁻¹ (x − c) = r²}. */
export function ellipsePoints(center, Sigma, r = 1, count = 64) {
  const { values, vectors } = eigen2(Sigma);
  return Array.from({ length: count + 1 }, (_, i) => {
    const phi = (2 * Math.PI * i) / count;
    const a = r * Math.sqrt(Math.max(values[0], 0)) * Math.cos(phi);
    const b = r * Math.sqrt(Math.max(values[1], 0)) * Math.sin(phi);
    return [center[0] + a * vectors[0][0] + b * vectors[1][0], center[1] + a * vectors[0][1] + b * vectors[1][1]];
  });
}
export const matVec = (M, v) => M.map((row) => dot(row, v));
export const matMul = (M, N) => M.map((row) => N[0].map((_, j) => row.reduce((s, v, k) => s + v * N[k][j], 0)));
export const inverse2 = ([[a, b], [c, d]]) => {
  const det = a * d - b * c;
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ];
};
/** Central-difference gradient and Hessian of a scalar function. */
export const gradFD = (f, x, h = 1e-5) => x.map((_, i) => (f(x.map((v, k) => v + (k === i ? h : 0))) - f(x.map((v, k) => v - (k === i ? h : 0)))) / (2 * h));
export const hessFD = (f, x, h = 1e-4) =>
  x.map((_, i) =>
    x.map((_, j) => {
      const e = (di, dj) => f(x.map((v, k) => v + (k === i ? di : 0) + (k === j ? dj : 0)));
      return (e(h, h) - e(h, -h) - e(-h, h) + e(-h, -h)) / (4 * h * h);
    }),
  );
/** Fisher information of a finite family θ ↦ probs(θ) by the definition E[∂_i log p ∂_j log p], differences for the scores. */
export function fisherOfFamily(probs, theta, h = 1e-5) {
  const p = probs(theta);
  const scores = theta.map((_, i) => {
    const plus = probs(theta.map((v, k) => v + (k === i ? h : 0)));
    const minus = probs(theta.map((v, k) => v - (k === i ? h : 0)));
    return p.map((_, x) => (Math.log(plus[x]) - Math.log(minus[x])) / (2 * h));
  });
  return theta.map((_, i) => theta.map((_, j) => sum(p.map((px, x) => px * scores[i][x] * scores[j][x]))));
}
