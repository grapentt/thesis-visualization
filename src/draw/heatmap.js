// Pre-rendered density image with faint level lines of log p.

import { hexToRgb } from './color.js';
import { clamp } from '../engine/timing.js';
import { color } from './theme.js';

const RAMP = [
  [0, '#0d1321'],
  [0.3, '#163050'],
  [0.6, '#1f6b7e'],
  [0.85, '#6db0a6'],
  [1, '#f0d27a'],
].map(([stop, hex]) => [stop, hexToRgb(hex)]);

function ramp(x) {
  for (let k = 1; k < RAMP.length; k++) {
    if (x <= RAMP[k][0]) {
      const u = (x - RAMP[k - 1][0]) / (RAMP[k][0] - RAMP[k - 1][0]);
      return RAMP[k - 1][1].map((v, i) => v + (RAMP[k][1][i] - v) * u);
    }
  }
  return RAMP[RAMP.length - 1][1];
}

/**
 * Render density(u, v) on [−extent, extent]² into a size × size canvas.
 * Level lines of log p are drawn every `levelStep`, about one pixel wide everywhere
 * (their width is corrected with the gradient).
 */
export function densityHeatmap({ size, extent, density, gradLog, levelStep = 0.6 }) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const image = g.createImageData(size, size);
  const toU = (i) => -extent + (2 * extent * (i + 0.5)) / size;
  const toV = (j) => extent - (2 * extent * (j + 0.5)) / size;
  const pxPerUnit = size / (2 * extent);

  const values = new Float32Array(size * size);
  let max = 0;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const p = density(toU(i), toV(j));
      values[j * size + i] = p;
      if (p > max) max = p;
    }
  }

  const ink = hexToRgb(color.ink);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const r = values[j * size + i] / max;
      let c = ramp(Math.pow(r, 0.75));
      const level = Math.log(r) / levelStep;
      if (level > -8) {
        const distance = Math.abs(level - Math.round(level));
        const [gu, gv] = gradLog(toU(i), toV(j));
        const levelsPerPx = Math.hypot(gu, gv) / levelStep / pxPerUnit;
        const distancePx = distance / Math.max(levelsPerPx, 1e-6);
        const a = clamp(1 - distancePx / 1.3) * 0.38;
        if (a > 0) c = c.map((x, k) => x + (ink[k] - x) * a);
      }
      const o = (j * size + i) * 4;
      image.data[o] = c[0];
      image.data[o + 1] = c[1];
      image.data[o + 2] = c[2];
      image.data[o + 3] = 255;
    }
  }
  g.putImageData(image, 0, 0);
  return canvas;
}
