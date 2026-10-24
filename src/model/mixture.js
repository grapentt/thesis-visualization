// A 2D Gaussian mixture used to illustrate the score as a covector.

const COMPONENTS = [
  { mean: [-1.1, 0.8], sd: 0.85, weight: 0.45 },
  { mean: [1.2, -0.3], sd: 0.7, weight: 0.35 },
  { mean: [0.1, -1.6], sd: 0.55, weight: 0.2 },
];

/** Unnormalised density p(u, v). */
export function density(u, v) {
  let p = 0;
  for (const c of COMPONENTS) {
    const dx = u - c.mean[0];
    const dy = v - c.mean[1];
    const s2 = c.sd * c.sd;
    p += (c.weight / s2) * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
  }
  return p;
}

/** ∇ log p(u, v). */
export function gradLogDensity(u, v) {
  let p = 0;
  let gx = 0;
  let gy = 0;
  for (const c of COMPONENTS) {
    const dx = u - c.mean[0];
    const dy = v - c.mean[1];
    const s2 = c.sd * c.sd;
    const e = (c.weight / s2) * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
    p += e;
    gx -= (e * dx) / s2;
    gy -= (e * dy) / s2;
  }
  return [gx / p, gy / p];
}
