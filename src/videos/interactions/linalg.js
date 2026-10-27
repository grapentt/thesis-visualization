// Small dense linear algebra for the exact toys (matrices of at most a few dozen rows).
//
// Matrices are flat row-major arrays of n × n numbers; nested arrays of rows are
// accepted on input as well. Results are Float64Arrays.

const flat = (A, n) => (Array.isArray(A[0]) ? Float64Array.from(A.flat()) : Float64Array.from(A.slice(0, n * n)));
const sizeOf = (A) => (Array.isArray(A[0]) ? A.length : Math.round(Math.sqrt(A.length)));

/**
 * Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations.
 * Returns values in ascending order and vectors as columns: V[i * n + k] is component i of vector k.
 */
export function symEig(A, n = sizeOf(A)) {
  const a = flat(A, n);
  const V = new Float64Array(n * n);
  for (let i = 0; i < n; i++) V[i * n + i] = 1;
  const scale = a.reduce((s, v) => s + v * v, 0) || 1;
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p * n + q] ** 2;
    if (off <= 1e-34 * scale) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q];
        if (apq === 0) continue;
        const theta = (a[q * n + q] - a[p * n + p]) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k * n + p], akq = a[k * n + q];
          a[k * n + p] = c * akp - s * akq;
          a[k * n + q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p * n + k], aqk = a[q * n + k];
          a[p * n + k] = c * apk - s * aqk;
          a[q * n + k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k * n + p], vkq = V[k * n + q];
          V[k * n + p] = c * vkp - s * vkq;
          V[k * n + q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const order = Array.from({ length: n }, (_, k) => k).sort((i, j) => a[i * n + i] - a[j * n + j]);
  const values = Float64Array.from(order, (k) => a[k * n + k]);
  const vectors = new Float64Array(n * n);
  order.forEach((k, col) => {
    for (let i = 0; i < n; i++) vectors[i * n + col] = V[i * n + k];
  });
  return { values, vectors };
}

/** f(A) = V f(Λ) Vᵀ for a symmetric matrix. */
export function symFunction(A, n, f) {
  const { values, vectors: V } = symEig(A, n);
  const fv = Array.from(values, f);
  const out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += V[i * n + k] * fv[k] * V[j * n + k];
      out[i * n + j] = out[j * n + i] = s;
    }
  }
  return out;
}

/** Moore–Penrose pseudo-inverse of a symmetric matrix; eigenvalues below tol · max|λ| count as zero. */
export function pinv(A, n = sizeOf(A), tol = 1e-12) {
  const { values } = symEig(A, n);
  const cut = tol * Math.max(...Array.from(values, Math.abs));
  return symFunction(A, n, (v) => (Math.abs(v) > cut ? 1 / v : 0));
}

/** Solve A x = b by Gaussian elimination with partial pivoting. */
export function solve(A, b) {
  const n = b.length;
  const a = flat(A, n);
  const x = Float64Array.from(b);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r * n + c]) > Math.abs(a[p * n + c])) p = r;
    if (p !== c) {
      for (let k = 0; k < n; k++) [a[c * n + k], a[p * n + k]] = [a[p * n + k], a[c * n + k]];
      [x[c], x[p]] = [x[p], x[c]];
    }
    for (let r = c + 1; r < n; r++) {
      const f = a[r * n + c] / a[c * n + c];
      if (f === 0) continue;
      for (let k = c; k < n; k++) a[r * n + k] -= f * a[c * n + k];
      x[r] -= f * x[c];
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = x[r];
    for (let k = r + 1; k < n; k++) s -= a[r * n + k] * x[k];
    x[r] = s / a[r * n + r];
  }
  return x;
}

/** Lower-triangular L with A = L Lᵀ (A symmetric positive definite). */
export function cholesky(A) {
  const n = sizeOf(A);
  const a = flat(A, n);
  const L = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = a[i * n + j];
      for (let k = 0; k < j; k++) s -= L[i * n + k] * L[j * n + k];
      L[i * n + j] = i === j ? Math.sqrt(Math.max(s, 0)) : s / L[j * n + j];
    }
  }
  return L;
}

/** Weighted least squares: coefficients c minimising Σ w_k (X_k · c − y_k)², X given as rows. */
export function leastSquares(X, y, w = null) {
  const p = X[0].length;
  const XtX = new Float64Array(p * p);
  const Xty = new Float64Array(p);
  X.forEach((row, k) => {
    const wk = w ? w[k] : 1;
    for (let i = 0; i < p; i++) {
      Xty[i] += wk * row[i] * y[k];
      for (let j = 0; j < p; j++) XtX[i * p + j] += wk * row[i] * row[j];
    }
  });
  return solve(XtX, Xty);
}
