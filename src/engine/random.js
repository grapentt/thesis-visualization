// Seeded randomness. Every random quantity in the video is drawn once, from a
// fixed seed, so the same frame always looks the same.

/** Mulberry32 generator with uniform and standard-normal draws. */
export function createRng(seed) {
  let a = seed | 0;

  const uniform = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** Box–Muller transform. */
  const gauss = () => {
    let u = 0;
    while (u === 0) u = uniform();
    const v = uniform();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  return {
    uniform,
    gauss,
    /** The whole generator state: save it with a snapshot to continue the stream exactly. */
    getState: () => a,
    setState: (state) => {
      a = state | 0;
    },
  };
}
