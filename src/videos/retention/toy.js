// The toy molecule of "What the noise should keep": a stiff bond coordinate r (Å) and a soft torsion
// φ on the circle with two basins. The bond's mean and width drift slightly with the torsion, so the
// two are coupled. Four observables name four kinds of physical change; the retention engine passes
// the distribution through a Gaussian noising channel on a grid and computes how much Fisher
// information about each observable the noisy point still carries:
//   I_t = Cov(E[u(X₀) | X_t]),   I₀ − I_t = E[Cov(u(X₀) | X_t)].
// No DOM; tested by tests/retention.test.mjs.

import { createRng } from '../../engine/random.js';
import { normalPdf } from './math.js';

const TWO_PI = 2 * Math.PI;
export const wrap = (phi) => phi - TWO_PI * Math.floor((phi + Math.PI) / TWO_PI);

export const BASINS = Object.freeze([
  { name: 'A', centre: -1.0, sd: 0.35, weight: 0.65 },
  { name: 'B', centre: 1.9, sd: 0.35, weight: 0.35 },
]);
/** Conditional mean and width of the bond given the torsion. */
export const bondMean = (phi) => 0.015 * Math.sin(phi);
export const bondSd = (phi) => 0.05 * (1 + 0.2 * Math.cos(phi));

function basinDensity(b, phi) {
  let p = 0;
  for (let k = -2; k <= 2; k++) p += normalPdf((phi - b.centre + TWO_PI * k) / b.sd) / b.sd;
  return p;
}
/** Marginal density of the torsion (a wrapped two-Gaussian mixture). */
export const torsionDensity = (phi) => BASINS.reduce((s, b) => s + b.weight * basinDensity(b, phi), 0);
/** Smooth basin membership: the posterior probability of basin B given φ. */
export const membership = (phi) => (BASINS[1].weight * basinDensity(BASINS[1], phi)) / torsionDensity(phi);
export const jointDensity = (r, phi) => (torsionDensity(phi) * normalPdf((r - bondMean(phi)) / bondSd(phi))) / bondSd(phi);

/** The observables u(x), not yet centred. */
export const OBSERVABLES = Object.freeze([
  { key: 'bond', name: 'bond stretch', f: (r) => r },
  { key: 'width', name: 'bond width', f: (r, phi) => (r - bondMean(phi)) ** 2 },
  {
    key: 'torsion',
    name: 'torsion within its basin',
    f: (r, phi) => {
      const w = membership(phi);
      return (1 - w) * Math.sin(phi - BASINS[0].centre) + w * Math.sin(phi - BASINS[1].centre);
    },
  },
  { key: 'basin', name: 'basin population', f: (r, phi) => membership(phi) },
]);

// ---- the grid -------------------------------------------------------------------------------------

export const PHI = (() => {
  const n = 80;
  const step = TWO_PI / n;
  return { n, step, values: Float64Array.from({ length: n }, (_, i) => -Math.PI + (i + 0.5) * step) };
})();
export const R = (() => {
  const n = 56;
  const min = -0.28;
  const max = 0.28;
  const step = (max - min) / n;
  return { n, min, max, step, values: Float64Array.from({ length: n }, (_, j) => min + (j + 0.5) * step) };
})();

/** Probability masses p[i·nr + j] of the cells, the centred observables on the cells, and their covariance I₀. */
export const grid = (() => {
  const { n: np } = PHI;
  const { n: nr } = R;
  const p = new Float64Array(np * nr);
  let total = 0;
  for (let i = 0; i < np; i++) for (let j = 0; j < nr; j++) total += p[i * nr + j] = jointDensity(R.values[j], PHI.values[i]);
  for (let c = 0; c < p.length; c++) p[c] /= total;
  const raw = OBSERVABLES.map(({ f }) => {
    const u = new Float64Array(np * nr);
    for (let i = 0; i < np; i++) for (let j = 0; j < nr; j++) u[i * nr + j] = f(R.values[j], PHI.values[i]);
    return u;
  });
  const means = raw.map((u) => u.reduce((s, v, c) => s + p[c] * v, 0));
  const u = raw.map((values, k) => Float64Array.from(values, (v) => v - means[k]));
  const cov0 = u.map((a) => u.map((b) => a.reduce((s, v, c) => s + p[c] * v * b[c], 0)));
  return { p, u, means, cov0 };
})();

/** Standard deviations the three channels scale their noise by: [bond, torsion] per unit σ. */
export const CHANNELS = (() => {
  const { p } = grid;
  let meanWidth = 0;
  let mPhi = 0;
  let mR2 = 0;
  for (let i = 0; i < PHI.n; i++) {
    for (let j = 0; j < R.n; j++) {
      const c = i * R.n + j;
      meanWidth += p[c] * bondSd(PHI.values[i]);
      mPhi += p[c] * PHI.values[i];
    }
  }
  let vPhi = 0;
  for (let i = 0; i < PHI.n; i++) for (let j = 0; j < R.n; j++) vPhi += p[i * R.n + j] * (PHI.values[i] - mPhi) ** 2;
  mR2 = grid.cov0[0][0];
  return Object.freeze({
    flat: { key: 'flat', name: 'flat noise', scale: [1, 1], unit: 'Å and rad' },
    local: { key: 'local', name: 'local thermal widths', scale: [meanWidth, BASINS[0].sd], unit: 'thermal widths' },
    global: { key: 'global', name: 'global covariance', scale: [Math.sqrt(mR2), Math.sqrt(vPhi)], unit: 'global widths' },
  });
})();

/** Wrapped Gaussian kernel on the circle, as a circulant over the grid, normalised to sum 1. */
function torsionKernel(sigma) {
  const k = new Float64Array(PHI.n);
  const images = Math.ceil((3 * sigma) / TWO_PI) + 1;
  let sum = 0;
  for (let d = 0; d < PHI.n; d++) {
    const delta = wrap(d * PHI.step);
    let v = 0;
    for (let m = -images; m <= images; m++) v += Math.exp(-((delta + TWO_PI * m) ** 2) / (2 * sigma * sigma));
    sum += k[d] = v;
  }
  for (let d = 0; d < PHI.n; d++) k[d] /= sum;
  return k;
}

/** The noisy bond grid for noise σ_r and the kernel from every clean cell to it, each row normalised to 1. */
function bondKernel(sigma) {
  // below six grid steps the noisy grid is the clean grid extended, so a narrow kernel never straddles cells
  const fine = sigma <= 6 * R.step;
  const step = fine ? R.step : sigma / 6;
  const extra = Math.ceil((3.5 * sigma) / step);
  const lo = fine ? R.values[0] - extra * step : R.min - 3.5 * sigma;
  const ny = fine ? R.n + 2 * extra : Math.ceil((R.max + 3.5 * sigma - lo) / step) + 1;
  const ys = Float64Array.from({ length: ny }, (_, j) => lo + j * step);
  const K = new Float64Array(R.n * ny);
  for (let i = 0; i < R.n; i++) {
    let sum = 0;
    for (let j = 0; j < ny; j++) sum += K[i * ny + j] = Math.exp(-((ys[j] - R.values[i]) ** 2) / (2 * sigma * sigma));
    for (let j = 0; j < ny; j++) K[i * ny + j] /= sum;
  }
  return { ys, ny, K };
}

/**
 * Information about every observable left after noise σ·scale: the covariance I_t of the conditional
 * means over the noisy grid. Two separable passes: bond kernel for every torsion row, then the
 * circulant torsion kernel. Returns I_t and the retained fraction of each observable on its own.
 */
export function retention(scale, sigma) {
  const sr = sigma * scale[0];
  const sp = sigma * scale[1];
  const { p, u, cov0 } = grid;
  const np = PHI.n;
  const nr = R.n;
  const nf = u.length + 1;
  const fields = [p, ...u.map((uk) => Float64Array.from(uk, (v, c) => v * p[c]))];
  const { ny, K } = bondKernel(sr);
  // pass 1: A[f][i][j] = Σ_r K[r][j] · field_f[i][r]
  const A = new Float64Array(nf * np * ny);
  for (let f = 0; f < nf; f++) {
    const field = fields[f];
    for (let i = 0; i < np; i++) {
      const row = f * np * ny + i * ny;
      for (let r = 0; r < nr; r++) {
        const v = field[i * nr + r];
        if (v === 0) continue;
        const krow = r * ny;
        for (let j = 0; j < ny; j++) A[row + j] += v * K[krow + j];
      }
    }
  }
  // pass 2: B[f][b][j] = Σ_a k[(b − a) mod n] · A[f][a][j]
  const kphi = torsionKernel(sp);
  const B = new Float64Array(nf * np * ny);
  for (let f = 0; f < nf; f++) {
    for (let a = 0; a < np; a++) {
      const src = f * np * ny + a * ny;
      for (let b = 0; b < np; b++) {
        const w = kphi[(b - a + np) % np];
        const dst = f * np * ny + b * ny;
        for (let j = 0; j < ny; j++) B[dst + j] += w * A[src + j];
      }
    }
  }
  const m = u.length;
  const cov = Array.from({ length: m }, () => new Array(m).fill(0));
  const mean = new Array(m);
  for (let c = 0; c < np * ny; c++) {
    const w = B[c];
    if (w < 1e-300) continue;
    for (let k = 0; k < m; k++) mean[k] = B[(k + 1) * np * ny + c] / w;
    for (let k = 0; k < m; k++) for (let l = k; l < m; l++) cov[k][l] += w * mean[k] * mean[l];
  }
  for (let k = 0; k < m; k++) for (let l = 0; l < k; l++) cov[k][l] = cov[l][k];
  return { cov, fraction: cov.map((row, k) => row[k] / cov0[k][k]) };
}

/**
 * The same by brute force, cell by cell, for the tests: returns I_t and the average conditional
 * covariance E[Cov(u | X_t)], whose sum must be I₀.
 */
export function retentionDirect(scale, sigma) {
  const sr = sigma * scale[0];
  const sp = sigma * scale[1];
  const { p, u } = grid;
  const np = PHI.n;
  const nr = R.n;
  const m = u.length;
  const { ny, K } = bondKernel(sr);
  const kphi = torsionKernel(sp);
  const cov = Array.from({ length: m }, () => new Array(m).fill(0));
  const within = Array.from({ length: m }, () => new Array(m).fill(0));
  const mean = new Array(m);
  const second = Array.from({ length: m }, () => new Array(m));
  for (let b = 0; b < np; b++) {
    for (let j = 0; j < ny; j++) {
      let w = 0;
      mean.fill(0);
      second.forEach((row) => row.fill(0));
      for (let a = 0; a < np; a++) {
        const kp = kphi[(b - a + np) % np];
        for (let r = 0; r < nr; r++) {
          const c = a * nr + r;
          const weight = p[c] * kp * K[r * ny + j];
          if (weight === 0) continue;
          w += weight;
          for (let k = 0; k < m; k++) {
            mean[k] += weight * u[k][c];
            for (let l = 0; l < m; l++) second[k][l] += weight * u[k][c] * u[l][c];
          }
        }
      }
      if (w < 1e-300) continue;
      for (let k = 0; k < m; k++) {
        for (let l = 0; l < m; l++) {
          cov[k][l] += (mean[k] * mean[l]) / w;
          within[k][l] += second[k][l] - (mean[k] * mean[l]) / w;
        }
      }
    }
  }
  return { cov, within };
}

/** Noise multipliers of the sweep, log-spaced, and the retained fractions of every channel. */
export const SIGMAS = Float64Array.from({ length: 29 }, (_, i) => Math.pow(10, -2.5 + (4 * i) / 28));
export const curves = Object.fromEntries(
  Object.values(CHANNELS).map((channel) => {
    const rows = Array.from(SIGMAS, (sigma) => retention(channel.scale, sigma));
    return [channel.key, OBSERVABLES.map((_, k) => Float64Array.from(rows, (row) => row.fraction[k]))];
  }),
);

/** Retained fraction of observable k at multiplier σ, interpolated on the log-σ sweep. */
export function retainedAt(channelKey, k, sigma) {
  const curve = curves[channelKey][k];
  const x = ((Math.log10(sigma) + 2.5) * 28) / 4;
  if (x <= 0) return curve[0];
  if (x >= curve.length - 1) return curve[curve.length - 1];
  const i = Math.floor(x);
  return curve[i] + (curve[i + 1] - curve[i]) * (x - i);
}

/** The posterior over clean cells given one noisy point y = (φ, r): weights on the grid and the conditional means of u. */
export function posterior(yPhi, yR, scale, sigma) {
  const sr = sigma * scale[0];
  const sp = sigma * scale[1];
  const { p, u } = grid;
  const weights = new Float64Array(p.length);
  let total = 0;
  for (let i = 0; i < PHI.n; i++) {
    const d = wrap(PHI.values[i] - yPhi);
    let kp = 0;
    for (let k = -2; k <= 2; k++) kp += Math.exp(-((d + TWO_PI * k) ** 2) / (2 * sp * sp));
    for (let j = 0; j < R.n; j++) {
      const c = i * R.n + j;
      total += weights[c] = p[c] * kp * Math.exp(-((R.values[j] - yR) ** 2) / (2 * sr * sr));
    }
  }
  for (let c = 0; c < weights.length; c++) weights[c] /= total;
  return { weights, means: u.map((uk) => uk.reduce((s, v, c) => s + weights[c] * v, 0)) };
}

/** The tilted density p_θ ∝ p e^{θ u_k} on the grid, normalised. */
export function tilted(k, theta) {
  const { p, u } = grid;
  const q = Float64Array.from(p, (v, c) => v * Math.exp(theta * u[k][c]));
  const total = q.reduce((s, v) => s + v, 0);
  for (let c = 0; c < q.length; c++) q[c] /= total;
  return q;
}

/** Seeded samples (φ, r) of the toy, for the scatter plots. */
export const samples = (() => {
  const rng = createRng(2027);
  return Array.from({ length: 600 }, () => {
    const b = rng.uniform() < BASINS[0].weight ? BASINS[0] : BASINS[1];
    const phi = wrap(b.centre + b.sd * rng.gauss());
    return { phi, r: bondMean(phi) + bondSd(phi) * rng.gauss() };
  });
})();

/** The conditional whitening ξ = (r − m(φ)) / c(φ) and its Jacobian entries. */
export const whiten = (r, phi) => (r - bondMean(phi)) / bondSd(phi);
export function whitenJacobian(r, phi) {
  const h = 1e-6;
  const dm = (bondMean(phi + h) - bondMean(phi - h)) / (2 * h);
  const dc = (bondSd(phi + h) - bondSd(phi - h)) / (2 * h);
  const xi = whiten(r, phi);
  return { dxi_dr: 1 / bondSd(phi), dxi_dphi: -(dm + xi * dc) / bondSd(phi) };
}
