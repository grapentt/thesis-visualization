import { defineScene, seg, lin, text, wrap, type, font, color, tex, camera, polyline3, polygon3, rgba } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { VERTICAL, HORIZONTAL } from '../shared.js';

const RIGHT = 860;
const WALL = -1.15;
const STEPS = 900;

/** A Brownian loop in three shape coordinates (q₁, q₂, q₃), duration 1, scaled to fit the box. */
const LOOP = (() => {
  const rng = createRng(41);
  const p = [[0, 0, 0]];
  for (let i = 0; i < STEPS; i++) p.push(p[i].map((v) => v + Math.sqrt(1 / STEPS) * rng.gauss()));
  const end = p[STEPS];
  return p.map((q, i) => q.map((v, k) => 1.05 * (v - (i / STEPS) * end[k])));
})();
/** Signed area swept in the plane of coordinates (a, b), up to step n. */
const areaIn = (a, b, n) => LOOP.slice(1, n + 1).reduce((s, q, i) => s + 0.5 * (LOOP[i][a] * q[b] - LOOP[i][b] * q[a]), 0);
// world coordinates: q₁ → x, q₂ → z (depth), q₃ → y (up)
const world = ([q1, q2, q3]) => [q1, q3, q2];
const PLANES = [
  { name: 'q₁q₂', a: 0, b: 1, flat: ([q1, q2]) => [q1, WALL, q2], tint: HORIZONTAL },
  { name: 'q₁q₃', a: 0, b: 2, flat: ([q1, , q3]) => [q1, q3, WALL], tint: VERTICAL },
  { name: 'q₂q₃', a: 1, b: 2, flat: ([, q2, q3]) => [WALL, q3, q2], tint: color.stiff },
];

const SPREAD = tex(String.raw`\mathbb{E}\,|\Theta|^2 = \frac{t^2}{12} \sum_{i<j} |\Omega_{ij}|^2 + O(t^3)`, 'E|Θ|² = (t²/12) Σ_{i<j} |Ω_ij|² + O(t³)');
const ONEILL = tex(String.raw`K_{\text{shape}}(X, Y) = \tfrac34\, |\Omega(X, Y)|^2_I \;\ge 0`, 'K_shape(X, Y) = ¾ |Ω(X, Y)|²_I ≥ 0');
const SCALAR = tex(String.raw`\mathbb{E}\,[\Theta \cdot I\,\Theta] = \frac{t^2}{18}\, s_M + O(t^3)`, 'E[Θ·IΘ] = (t²/18) s_M + O(t³)');
const MEAN = tex(String.raw`\mathbb{E}\,\Theta = 0, \qquad \mathbb{E}\,\mathrm{hol} = I + \frac{t^2}{24} \sum_{i<j} \Omega_{ij}^2 + O(t^3)`, 'E Θ = 0,   E hol = I + (t²/24) Σ Ω_ij² + O(t³)');

const QA = [
  {
    from: 1,
    q: 'WHICH CURVATURE DOES THE NOISE FEEL?',
    a: 'All planes at once. A random loop of shapes sweeps random areas in every plane of shape space, uncorrelated, each of size about t/√12. The rotations cancel on average and their squares add up:',
    formula: SPREAD,
    note: 'the energy density of the curvature (Yang–Mills), summed over all planes',
  },
  {
    from: 15,
    q: 'SO, RICCI OR SCALAR CURVATURE?',
    a: 'Close. Shape space is curved because the bundle twists. Configuration space is flat, and O’Neill’s formula gives every plane of shape space the curvature',
    formula: ONEILL,
    note: 'weight the rotation by the inertia tensor I, and the noise reads off the scalar curvature:',
  },
  {
    from: 31,
    q: 'AND THE AVERAGE ROTATION?',
    a: 'Exactly zero for every duration: with a reversible shape diffusion, a loop and its reverse are equally likely. The average rotation matrix shrinks instead of turning:',
    formula: MEAN,
    note: '',
  },
];

export default defineScene({
  name: 'Which curvature?',
  duration: 50,
  narration:
    'Which curvature does the noise feel? A random loop of shapes is not a planar loop: it sweeps random areas in every plane of shape space at once, uncorrelated. The rotations cancel on average, and the squares add up, so the mean square rotation is t squared over twelve times the sum of the squared curvatures over all planes: the energy density of the curvature. So is it Ricci or scalar curvature? Close: shape space is curved precisely because the bundle twists. Configuration space is flat, and O’Neill’s formula says each plane of shape space has curvature three quarters of the squared curvature of the connection. Weight the rotation by the inertia tensor, and the noise measures the scalar curvature of shape space. And the average rotation is exactly zero: a loop and its reverse are equally likely.',
  header: { eyebrow: '13 · QUESTIONS', title: 'Which curvature does the noise feel?' },

  draw(ctx, t) {
    drawLoop(ctx, t);
    QA.forEach(({ from, q, a, formula, note }, k) => {
      const next = QA[k + 1]?.from ?? Infinity;
      const dim = t >= next ? 0.35 : 1;
      const shown = seg(t, from, from + 0.6);
      const y = [230, 430, 720][k];
      text(ctx, q, RIGHT, y, { font: font.mono, size: 15, weight: 500, color: color.gold, tracking: 1.5, alpha: shown * dim });
      const h = wrap(ctx, a, RIGHT, y + 32, 680, 27, { ...type.body, size: 19, alpha: shown * dim, chars: Math.floor(lin(t, from + 0.4, from + 5) * a.length) });
      formula.draw(ctx, RIGHT, y + 32 + h + 18, { size: 24, alpha: seg(t, from + 4.5, from + 5.5) * dim });
      if (note) text(ctx, note, RIGHT, y + 32 + h + 60, { ...type.note, size: 14, alpha: seg(t, from + 6, from + 7) * dim });
    });
    SCALAR.draw(ctx, RIGHT + 40, 652, { size: 24, alpha: seg(t, 23, 24) * (t >= 31 ? 0.35 : 1) });
    text(ctx, 's_M: scalar curvature of shape space · for horizontal transport (a real trajectory adds ordinary rotational diffusion) · derived for this video', RIGHT + 40, 690, { ...type.note, size: 13, alpha: seg(t, 23.6, 24.6) * (t >= 31 ? 0.35 : 1) });
    text(ctx, 'Lévy 1951 · Gaveau 1977 · O’Neill 1966 · Arnaudon–Thalmaier 2003 · Vassilevich 2003', RIGHT, 872, { ...type.note, size: 13, alpha: seg(t, 40, 41) });
  },
});

/** One Brownian loop in three shape coordinates, with its shadows on three walls and the areas they sweep. */
function drawLoop(ctx, t) {
  const a = seg(t, 0.3, 1.3);
  const cam = camera({ cx: 420, cy: 500, scale: 140, yaw: 0.62, pitch: -0.42, focal: 12 });
  const n = Math.max(1, Math.round(lin(t, 1.5, 12) * STEPS));
  // the three walls
  const walls = [
    [[-1.2, WALL, -1.2], [1.2, WALL, -1.2], [1.2, WALL, 1.2], [-1.2, WALL, 1.2]],
    [[-1.2, -1.2, WALL], [1.2, -1.2, WALL], [1.2, 1.2, WALL], [-1.2, 1.2, WALL]],
    [[WALL, -1.2, -1.2], [WALL, 1.2, -1.2], [WALL, 1.2, 1.2], [WALL, -1.2, 1.2]],
  ];
  walls.forEach((w, k) => polygon3(ctx, cam, w, { fill: rgba(PLANES[k].tint, 0.05), stroke: rgba(PLANES[k].tint, 0.35), width: 1, alpha: a }));
  // shadows, then the loop itself
  for (const plane of PLANES) {
    polyline3(ctx, cam, LOOP.slice(0, n + 1).map((q) => plane.flat(q)), { color: plane.tint, width: 1.4, alpha: 0.75 * a });
  }
  polyline3(ctx, cam, LOOP.slice(0, n + 1).map(world), { color: color.ink, width: 2, alpha: a });
  const head = cam.project(world(LOOP[n]));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = color.ink;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  PLANES.forEach((plane, k) => {
    text(ctx, `area in ${plane.name}:  ${areaIn(plane.a, plane.b, n) >= 0 ? '+' : '−'}${Math.abs(areaIn(plane.a, plane.b, n)).toFixed(2)}`, 160, 780 + 26 * k, {
      font: font.mono,
      size: 17,
      color: plane.tint,
      alpha: a * seg(t, 2, 3),
    });
  });
  text(ctx, 'one random loop of shapes, and its shadows on three coordinate planes', 400, 236, { ...type.note, align: 'center', alpha: a });
}
