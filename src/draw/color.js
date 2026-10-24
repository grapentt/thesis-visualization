export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Linear mix of two hex colours; u = 0 gives a, u = 1 gives b. */
export function mix(a, b, u) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * u)).join(',')})`;
}
