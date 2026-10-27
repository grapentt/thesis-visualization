import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, ring } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
// the plane bundle with constant curvature λ from Part 0, reused as it is
import { bundleCamera, bundlePoint, horizontalLift } from '../../part-0/shared.js';
import { TWIST, FLOOR, drawFloor, drawFibres, drawTiles } from '../../part-0/bundleBox.js';
import { VERTICAL, HORIZONTAL } from '../shared.js';

const LAMBDA = TWIST; // 0.5
const START = -0.6; // height where lifts start
const DT = 0.004;
const RIGHT = 960;

/** Standard planar Brownian motion (E[dx²] = dt) from the origin, n steps of dt. */
function brownian(rng, n, dt = DT) {
  const path = [[0, 0]];
  for (let i = 0; i < n; i++) {
    const [x, y] = path[i];
    path.push([x + Math.sqrt(dt) * rng.gauss(), y + Math.sqrt(dt) * rng.gauss()]);
  }
  return path;
}
/** A Brownian loop (bridge) of duration n·dt: B_s − (s/t) B_t. */
function bridge(rng, n, dt = DT) {
  const free = brownian(rng, n, dt);
  const [ex, ey] = free[n];
  return free.map(([x, y], i) => [x - (i / n) * ex, y - (i / n) * ey]);
}
/** Lévy's area ½∮(x dy − y dx) of a closed path. */
const levyArea = (path) => path.slice(1).reduce((s, [x1, y1], i) => s + 0.5 * (path[i][0] * y1 - path[i][1] * x1), 0);

const rng = createRng(11);
const FREE = brownian(rng, 1500); // t = 6
const LOOP_T = 4;
const LOOP = bridge(createRng(29), Math.round(LOOP_T / DT));
const LOOP_LIFT = horizontalLift(LOOP, START, LAMBDA);
const FREE_LIFT = horizontalLift(FREE, START, LAMBDA);

// many loops of duration 4: their holonomy angles
const ENSEMBLE = (() => {
  const r = createRng(23);
  return Array.from({ length: 1000 }, () => LAMBDA * levyArea(bridge(r, 400, LOOP_T / 400)));
})();
const BIN = 0.125;
const BINS = 28; // −1.75 … 1.75 rad
const HIST = (() => {
  const counts = new Array(BINS).fill(0);
  ENSEMBLE.forEach((th) => {
    const k = Math.floor((th + (BINS * BIN) / 2) / BIN);
    if (k >= 0 && k < BINS) counts[k]++;
  });
  return counts;
})();
const RMS = Math.sqrt(ENSEMBLE.reduce((s, th) => s + th * th, 0) / ENSEMBLE.length);
const MEAN = ENSEMBLE.reduce((s, th) => s + th, 0) / ENSEMBLE.length;
/** Exact law of the loop holonomy: (π/(2λt)) sech²(πθ/(λt)). */
const density = (th) => (Math.PI / (2 * LAMBDA * LOOP_T)) / Math.cosh((Math.PI * th) / (LAMBDA * LOOP_T)) ** 2;

const LIFT_LAW = tex(String.raw`z_t - z_0 = \lambda\, A_t, \qquad A_t = \tfrac12 \int_0^t (x\, dy - y\, dx)`, 'z_t − z_0 = λ A_t,   A_t = ½∫(x dy − y dx)');
const LOOP_LAW = tex(String.raw`\mathbb{E}\,\theta = 0, \qquad \mathbb{E}\,\theta^2 = \frac{\lambda^2 t^2}{12}`, 'E θ = 0,   E θ² = λ²t²/12');

export default defineScene({
  name: 'Brownian holonomy',
  duration: 54,
  narration:
    'Now let the shape wander at random, like thermal noise, and follow the bundle horizontally. In the plane bundle with constant curvature from Part 0, your height is exactly lambda times the signed area you have swept around the start: Lévy’s stochastic area. When the random walk comes back to where it started, the lift comes back to the same fibre at a different height: a random holonomy. Do it many times. Loops turn you left as often as right, so the average holonomy is zero. The curvature shows up in the spread: the mean square is lambda squared times t squared over twelve. So the root-mean-square rotation grows like the time, because a random loop of duration t encloses an area of order t.',
  header: { eyebrow: '12 · NOISE', title: 'Random loops, random holonomy' },

  draw(ctx, t) {
    const cam = bundleCamera({ cx: 470, cy: 520, scale: 100 });
    drawFloor(ctx, cam, seg(t, 0, 1));
    drawFibres(ctx, cam, seg(t, 0.3, 1.3));
    drawTiles(ctx, cam, LAMBDA, { alpha: 0.45 * seg(t, 0.6, 1.6) });

    // a free random walk and its lift
    const free = fade(t, 1, 2, 14, 15);
    if (free > 0) drawLifted(ctx, cam, FREE, FREE_LIFT, lin(t, 2, 12.5), free);
    // one Brownian loop and its holonomy
    const loop = fade(t, 15, 16, 27, 28);
    if (loop > 0) {
      const progress = lin(t, 16, 23);
      drawLifted(ctx, cam, LOOP, LOOP_LIFT, progress, loop);
      if (progress >= 1) {
        const start = cam.project(bundlePoint(0, 0, START));
        const end = cam.project(bundlePoint(0, 0, LOOP_LIFT[LOOP_LIFT.length - 1][2]));
        ring(ctx, start.x, start.y, 10, color.ink, loop);
        ring(ctx, end.x, end.y, 11, VERTICAL, loop);
        line(ctx, start.x + 18, start.y, start.x + 18, end.y, { color: VERTICAL, width: 3, alpha: loop });
        text(ctx, 'θ', start.x + 28, (start.y + end.y) / 2 + 8, { ...type.math, color: VERTICAL, alpha: loop });
      }
    }

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 240) => wrap(ctx, s, RIGHT, y, 580, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Let the shape wander at random and follow the bundle horizontally. In the plane bundle with constant curvature λ, your height is λ times the signed area swept around the start.', 1, 14.4);
    LIFT_LAW.draw(ctx, RIGHT, 420, { size: 24, alpha: fade(t, 4, 5, 14, 14.6) });
    text(ctx, 'Lévy’s stochastic area (Lévy 1951)', RIGHT, 462, { ...type.note, alpha: fade(t, 4.6, 5.6, 14, 14.6) });
    note('A random walk that comes back to its start: the lift returns to the same fibre, at a different height. A random holonomy θ = λ × (enclosed signed area).', 15.4, 27.4);
    const area = levyArea(LOOP);
    text(ctx, `this loop: t = ${LOOP_T},  A = ${area.toFixed(2)},  θ = ${(LAMBDA * area).toFixed(2)} rad`, RIGHT, 420, { font: font.mono, size: 18, color: VERTICAL, alpha: fade(t, 23, 24, 27, 27.6) });

    drawHistogram(ctx, t);
    note('Many loops of the same duration: they turn you left as often as right. The mean is zero; the curvature sets the spread.', 28.4, 54, 240);
    LOOP_LAW.draw(ctx, RIGHT, 716, { size: 30, alpha: seg(t, 40, 41) });
    wrap(ctx, 'So the rms rotation grows like t, not √t: a random loop of duration t encloses an area of order t. “Divide by the time” is right.', RIGHT, 784, 580, 28, {
      ...type.body,
      size: 19,
      color: color.muted,
      alpha: seg(t, 44, 45),
    });
  },
});

/** A path on the floor and its horizontal lift, both drawn up to `progress`. */
function drawLifted(ctx, cam, path, lifted, progress, alpha) {
  const n = Math.max(1, Math.round(progress * (path.length - 1)));
  const floor = path.slice(0, n + 1).map(([x, y]) => bundlePoint(x, y, FLOOR));
  const up = lifted.slice(0, n + 1).map((p) => bundlePoint(...p));
  const stroke = (pts, tint, width, a) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = tint;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => {
      const s = cam.project(p);
      i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
    });
    ctx.stroke();
    ctx.restore();
  };
  stroke(floor, color.ink, 1.5, 0.7 * alpha);
  stroke(up, HORIZONTAL, 2.5, alpha);
  const head = cam.project(up[up.length - 1]);
  const shadow = cam.project(floor[floor.length - 1]);
  dot(ctx, head.x, head.y, 6, color.ink, alpha);
  dot(ctx, shadow.x, shadow.y, 4, color.muted, alpha);
}

/** Histogram of the holonomy of 600 loops, filling in, with the exact law on top. */
function drawHistogram(ctx, t) {
  const a = seg(t, 28.5, 29.5);
  if (a <= 0) return;
  const box = { x: RIGHT, y: 360, w: 560, h: 220 };
  const shown = Math.floor(lin(t, 29.5, 38) * ENSEMBLE.length);
  const counts = new Array(BINS).fill(0);
  for (let i = 0; i < shown; i++) {
    const k = Math.floor((ENSEMBLE[i] + (BINS * BIN) / 2) / BIN);
    if (k >= 0 && k < BINS) counts[k]++;
  }
  const peak = Math.max(...HIST);
  const X = (th) => box.x + ((th + (BINS * BIN) / 2) / (BINS * BIN)) * box.w;
  const Y = (c) => box.y + box.h - (c / peak) * box.h * 0.92;
  ctx.save();
  ctx.globalAlpha = a;
  line(ctx, box.x, box.y + box.h, box.x + box.w, box.y + box.h, { color: color.ink, width: 1.5 });
  counts.forEach((c, k) => {
    if (!c) return;
    ctx.fillStyle = 'rgba(242,207,99,0.55)';
    ctx.fillRect(X(-(BINS * BIN) / 2 + k * BIN) + 1, Y(c), box.w / BINS - 2, box.y + box.h - Y(c));
  });
  // the exact law, scaled to the full ensemble
  const law = seg(t, 38, 39.5);
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2;
  ctx.globalAlpha = a * law;
  ctx.beginPath();
  for (let i = 0; i <= 140; i++) {
    const th = -(BINS * BIN) / 2 + (i / 140) * BINS * BIN;
    const c = density(th) * ENSEMBLE.length * BIN;
    i ? ctx.lineTo(X(th), Y(c)) : ctx.moveTo(X(th), Y(c));
  }
  ctx.stroke();
  ctx.restore();
  for (const th of [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]) {
    line(ctx, X(th), box.y + box.h, X(th), box.y + box.h + 6, { color: color.ink, alpha: a });
    text(ctx, `${Math.round((th * 180) / Math.PI)}°`, X(th), box.y + box.h + 24, { ...type.note, size: 13, align: 'center', alpha: a });
  }
  text(ctx, `holonomy θ of ${shown} random loops, each of duration t = ${LOOP_T}, λ = ${LAMBDA}`, box.x, box.y - 14, { ...type.note, alpha: a });
  text(ctx, `mean ${((MEAN * 180) / Math.PI).toFixed(1)}°   rms ${((RMS * 180) / Math.PI).toFixed(1)}°   (exact: 0°, ${((LAMBDA * LOOP_T * 180) / Math.PI / Math.sqrt(12)).toFixed(1)}°)`, box.x, box.y + box.h + 56, {
    font: font.mono,
    size: 16,
    color: VERTICAL,
    alpha: a * seg(t, 38, 39),
  });
  text(ctx, 'white: Lévy’s exact law, density (π/2λt) sech²(πθ/λt) · heights read as angles', box.x, box.y + box.h + 80, { ...type.note, size: 13, alpha: a * seg(t, 38, 39.5) });
}
