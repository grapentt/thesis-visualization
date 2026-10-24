import {
  defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, line, dot, ring, card, arrow,
  drawSurface, polyline3,
} from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import {
  VERTICAL, torusPoint, torusEnergy, torusCamera, energyColor, facesCamera, basePoint, TORUS,
} from '../shared.js';

const AXIS = { x: 1000, top: 260, bottom: 780 };
const Y = (U) => AXIS.bottom - U * (AXIS.bottom - AXIS.top);
const FIBRES = Array.from({ length: 10 }, (_, k) => (k * 2 * Math.PI) / 10 + 0.15);

const rng = createRng(3);
// φ < 0: the side of the torus that faces the camera
const SAMPLES = Array.from({ length: 40 }, () => ({ theta: rng.uniform() * 2 * Math.PI, phi: -0.5 - 0.9 * rng.uniform() }));
const TIMES = [];
for (let t = 1.5, dt = 1.4; t < 13 && TIMES.length < SAMPLES.length; t += dt, dt = Math.max(0.08, dt * 0.8)) TIMES.push(t);

const FLAT = tex(String.raw`U : T^2 \to \mathbb{R}`, 'U : T² → ℝ');
const REDUCED = tex(String.raw`U : T^2/S^1 \cong S^1 = M \;\to\; \mathbb{R}`, 'U : T²/S¹ ≅ S¹ = M → ℝ');
const BUNDLE = tex(String.raw`S^1 \hookrightarrow T^2 \xrightarrow{\;\pi\;} T^2/S^1 = M`, 'S¹ ↪ T² →π T²/S¹ = M');

const circle = (f, n = 96) => Array.from({ length: n + 1 }, (_, i) => f((i / n) * 2 * Math.PI));

export default defineScene({
  name: 'A torus bundle',
  duration: 34,
  narration:
    'The same idea in two dimensions. Put an energy on a torus and sample it as before. Suppose the energy does not change around the small circles, only around the big one. Then U really lives on the circle of small circles: T² is the total space, the small circles are the fibres, and M = T²/S¹ is the base. This is a principal S¹-bundle, the simplest kind there is.',
  header: { eyebrow: '03 · BUNDLES: A SIMPLE EXAMPLE', title: 'A torus is a circle of circles' },

  draw(ctx, t) {
    const lift = seg(t, 14.5, 16.5);
    const cam = torusCamera({ cx: 540, cy: lerp(470, 380, lift), yaw: 0.25 + 0.03 * t });
    drawBaseCircle(ctx, t, cam); // behind the torus
    ctx.save();
    ctx.globalAlpha = seg(t, 0, 1);
    drawSurface(ctx, cam, torusPoint, { nu: 64, nv: 24, color: (theta) => energyColor(torusEnergy(theta)) });
    ctx.restore();

    drawSampling(ctx, t, cam);
    drawFibres(ctx, t, cam);
    drawProjection(ctx, t, cam);

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'Assume U is invariant around the small circles: turning around them is a symmetry.', 980, 300, 560, 30, { ...words, alpha: fade(t, 16, 16.8, 21, 21.6) });
    wrap(ctx, 'Around the big circle, U really changes.', 980, 380, 560, 30, { ...words, alpha: fade(t, 19.5, 20.3, 21, 21.6) });

    FLAT.draw(ctx, 980, 260, { size: 30, alpha: fade(t, 21.8, 22.6, 23.6, 24.2) });
    REDUCED.draw(ctx, 980, 260, { size: 30, alpha: seg(t, 24, 25) });
    text(ctx, 'U only needs the base: one value per small circle.', 980, 302, { ...type.note, alpha: seg(t, 24.6, 25.4) });
    BUNDLE.draw(ctx, 980, 380, { size: 32, alpha: seg(t, 27, 28) });
    wrap(ctx, 'A principal S¹-bundle (also called a U(1)-bundle), about the simplest one there is.', 980, 430, 560, 28, { ...type.body, size: 20, alpha: seg(t, 27.6, 28.6) });
    card(ctx, {
      x: 980,
      y: 520,
      width: 560,
      tag: 'ASIDE',
      title: 'Yes, the U(1) of Maxwell',
      body: 'Principal U(1)-bundles are the setting of electromagnetism: a connection on such a bundle is the electromagnetic potential A, and its curvature is the field strength F = dA.',
      accent: color.soft,
      alpha: seg(t, 29.5, 30.3),
      progress: lin(t, 29.8, 33),
    });
  },
});

/** Pick points on the torus faster and faster, mark their energy on an axis. */
function drawSampling(ctx, t, cam) {
  const a = fade(t, 0.8, 1.6, 13.6, 14.4);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  line(ctx, AXIS.x, AXIS.bottom, AXIS.x, AXIS.top - 20, { color: color.ink, width: 2 });
  for (const U of [0, 0.5, 1]) {
    line(ctx, AXIS.x - 8, Y(U), AXIS.x, Y(U), { color: color.ink, width: 2 });
    text(ctx, U.toFixed(1), AXIS.x - 14, Y(U), { ...type.note, align: 'right', baseline: 'middle' });
  }
  text(ctx, 'U', AXIS.x, AXIS.top - 34, { ...type.math, color: color.gold, align: 'center' });

  let k = -1;
  while (k + 1 < TIMES.length && TIMES[k + 1] <= t) k++;
  for (let i = 0; i <= k; i++) {
    const { theta, phi } = SAMPLES[i];
    const U = torusEnergy(theta);
    const p = cam.project(torusPoint(theta, phi));
    const current = i === k;
    dot(ctx, p.x, p.y, current ? 7 : 3.5, current ? color.ink : color.gold, current ? 1 : 0.7);
    dot(ctx, AXIS.x + 16 + ((i * 37) % 23) * 2, Y(U), 4, energyColor(U), 0.9);
    if (current) {
      ring(ctx, p.x, p.y, 13, color.gold);
      line(ctx, p.x + 14, p.y, AXIS.x - 10, Y(U), { color: color.gold, width: 1.5, dash: [5, 6], alpha: 0.8 });
      dot(ctx, AXIS.x, Y(U), 8, color.gold);
      text(ctx, `U(p) = ${U.toFixed(2)}`, AXIS.x + 80, Y(U) + 6, { font: font.mono, size: 18, color: color.gold });
    }
  }
  ctx.restore();
}

/** The fibres (small circles); a point running around one of them, then along the big circle. */
function drawFibres(ctx, t, cam) {
  const a = seg(t, 15, 16);
  if (a <= 0) return;
  for (const theta of FIBRES) {
    const pts = circle((phi) => torusPoint(theta, phi));
    polyline3(ctx, cam, pts, { color: VERTICAL, width: 2.5, alpha: a * 0.9, visible: (i) => facesCamera(cam, theta, (i / 96) * 2 * Math.PI) });
  }
  const around = seg(t, 16.2, 19);
  const along = seg(t, 19.3, 21.5);
  if (t > 16 && t < 22) {
    const theta = 0.9 + 2.6 * along;
    const phi = 0.9 + 2 * Math.PI * around;
    const p = cam.project(torusPoint(theta, phi));
    const visible = facesCamera(cam, theta, phi);
    dot(ctx, p.x, p.y, 8, color.ink, visible ? 1 : 0.35);
    ring(ctx, p.x, p.y, 13, color.gold, visible ? 1 : 0.35);
    const U = torusEnergy(theta);
    text(ctx, `U = ${U.toFixed(2)}`, 980, 470, { font: font.mono, size: 30, color: energyColor(U), alpha: fade(t, 16.2, 16.8, 21.4, 22) });
    text(ctx, along > 0 ? 'moving along the big circle' : 'moving around a fibre: U stays the same', 980, 506, { ...type.note, alpha: fade(t, 16.2, 16.8, 21.4, 22) });
  }
  text(ctx, 'fibre S¹', ...labelAt(cam, FIBRES[2], -0.4, 26, -18), { ...type.math, size: 24, color: VERTICAL, alpha: seg(t, 22, 23) });
  text(ctx, 'total space T²', ...labelAt(cam, 4.2, -1.2, -40, -60), { ...type.math, size: 24, alpha: seg(t, 22.4, 23.4) });
}

const labelAt = (cam, theta, phi, dx, dy) => {
  const p = cam.project(torusPoint(theta, phi));
  return [p.x + dx, p.y + dy];
};

/** The base circle M under the torus, coloured by the energy it carries. */
function drawBaseCircle(ctx, t, cam) {
  const a = seg(t, 21.8, 23);
  if (a <= 0) return;
  const n = 96;
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * 2 * Math.PI;
    const t1 = ((i + 1) / n) * 2 * Math.PI;
    polyline3(ctx, cam, [basePoint(t0), basePoint(t1)], { color: energyColor(torusEnergy(t0)), width: 6, alpha: a });
  }
}

/** The projection π from each fibre to its point of the base, and labels. */
function drawProjection(ctx, t, cam) {
  const a = seg(t, 21.8, 23);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  for (const theta of FIBRES.filter((_, k) => k % 3 === 0)) {
    const from = cam.project(torusPoint(theta, -Math.PI / 2));
    const to = cam.project(basePoint(theta));
    arrow(ctx, from.x, from.y, to.x, to.y - 6, { color: color.muted, width: 2, head: 11, dash: [4, 5] });
  }
  const label = cam.project([TORUS.R + 0.6, -1.75, 0.4]);
  text(ctx, 'base M = T²/S¹ ≅ S¹', label.x + 10, label.y + 30, { ...type.math, size: 24 });
  const pi = cam.project([-TORUS.R - 0.2, -1.2, 0.6]);
  text(ctx, 'π', pi.x - 30, pi.y, { ...type.math, size: 28, color: color.muted });
  ctx.restore();
}
