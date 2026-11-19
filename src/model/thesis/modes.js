// R26 · Bead weights of the collective modes on the 28-bead chain (DOM-free).
//   The modes are principal directions of the centred cloud in the library's fixed Helmert basis
//   H (28 × 27, orthonormal, translation-free): bead weights w_p = H V_p, and the mode vector of a
//   molecule x is a_p = Σ_i w_p,i x_i (a 3-vector, Å). Rouse mode q: √(2/N) cos(πq(i + ½)/N).

export function helmert(n) {
  const h = Array.from({ length: n }, () => new Float64Array(n - 1));
  for (let j = 0; j < n - 1; j++) {
    const s = Math.sqrt((j + 1) * (j + 2));
    for (let i = 0; i <= j; i++) h[i][j] = 1 / s;
    h[j + 1][j] = -(j + 1) / s;
  }
  return h;
}

/** Bead weights (n numbers) of a mode with Helmert-basis coefficients v (n − 1 numbers). */
export function beadWeights(v, h = helmert(v.length + 1)) {
  return h.map((row) => row.reduce((acc, hij, j) => acc + hij * v[j], 0));
}

export const rouse = (q, n) => Array.from({ length: n }, (_, i) => Math.sqrt(2 / n) * Math.cos((Math.PI * q * (i + 0.5)) / n));

export const dotProduct = (a, b) => a.reduce((acc, x, i) => acc + x * b[i], 0);

/** a_p = Σ_i w_i x_i for a molecule x (n × 3). */
export const modeVector = (w, x) => [0, 1, 2].map((k) => w.reduce((acc, wi, i) => acc + wi * x[i][k], 0));

export const radiusOfGyration = (x) => {
  const n = x.length;
  const c = [0, 1, 2].map((k) => x.reduce((a, p) => a + p[k], 0) / n);
  return Math.sqrt(x.reduce((a, p) => a + (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2, 0) / n);
};
