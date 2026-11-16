// Scene 06: the Legendre map θ ↦ η = ∇ψ(θ), from the plane of natural parameters onto the interior
// of the convex hull of the keys. A grid is pushed through it, a point is followed, rays θ = β θ₀
// run from the centroid towards the extreme vertices, and the inverse is ∇ψ* of the dual potential.

import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, line, dot, ring, arrow, rgba, roundRect } from '../../../../src/kit.js';
import { KEYS, QUERY, KEY, CONTEXT, SYM, INFO, VALUE, chart, drawPlane, drawKeys, drawHull, drawPath, drawToken, readout, exampleStamp, chartCaption, header, clipped } from '../shared.js';
import { meanParameter, dot as dotp } from '../math.js';

const PT = chart({ x: 60, y: 200, size: 500, extent: 3.2 }); // natural parameters θ
const PK = chart({ x: 600, y: 200, size: 500 }); // the keys and η
const NX = 1140; // the notes column
const LEVELS = [-3, -2, -1, 0, 1, 2, 3];
const SAMPLES = 48;

/** The grid lines θ₁ = c and θ₂ = c of the θ-plane, and their images under ∇ψ. */
const GRID = LEVELS.flatMap((c) => {
  const span = Array.from({ length: SAMPLES + 1 }, (_, i) => -3.2 + (6.4 * i) / SAMPLES);
  return [span.map((v) => [c, v]), span.map((u) => [u, c])];
}).map((points) => ({ points, image: points.map((th) => meanParameter(th, KEYS)) }));
const CENTROID = meanParameter([0, 0], KEYS);
const RAYS = [20, 140, 260].map((deg) => {
  const dir = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  const extreme = KEYS.reduce((best, x, j) => (dotp(dir, x) > dotp(dir, KEYS[best]) ? j : best), 0);
  return { dir, extreme, tint: [QUERY, SYM, INFO][[20, 140, 260].indexOf(deg)] };
});
const BETA_MAX = 8;

const ETA = tex(String.raw`\eta = \nabla\psi(\theta) = \sum_j a_j(\theta)\, x_j`, 'η = ∇ψ(θ) = Σⱼ aⱼ(θ) xⱼ');
const RAY = tex(String.raw`\theta = \beta\, \theta_0,\qquad \beta \ge 0`, 'θ = β θ₀,  β ≥ 0');
const HESS = tex(String.raw`\nabla^2\psi(\theta) = \mathrm{Cov}_a[x_j] \succ 0`, '∇²ψ(θ) = Cov_a[xⱼ] ≻ 0');
const DUAL = tex(String.raw`\psi^*(\eta) = \sup_{\theta}\, \langle \theta, \eta\rangle - \psi(\theta)`, 'ψ*(η) = sup_θ ⟨θ, η⟩ − ψ(θ)');
const INVERSE = tex(String.raw`\theta = \nabla\psi^*(\eta)`, 'θ = ∇ψ*(η)');
const CHAIN = tex(String.raw`o_i = W_V\, \nabla\psi\big(M^{\top} x_i\big)`, 'oᵢ = W_V ∇ψ(Mᵀ xᵢ)');
const STAGES = [
  { sym: tex('x_i', 'xᵢ'), tint: QUERY },
  { sym: tex(String.raw`\theta = M^{\top} x_i`, 'θ = Mᵀ xᵢ'), tint: QUERY },
  { sym: tex(String.raw`\eta = \nabla\psi(\theta)`, 'η = ∇ψ(θ)'), tint: CONTEXT },
  { sym: tex(String.raw`o_i = W_V\, \eta`, 'oᵢ = W_V η'), tint: VALUE },
];
const MAPS = [['linear', SYM], ['Legendre', INFO], ['linear', VALUE]];

export default defineScene({
  name: 'The Legendre map',
  duration: 60,
  narration: [
    [0, 'The map from theta to eta deserves its own picture. On the left, the plane of natural parameters. On the right, the plane of the keys with their convex hull. Every theta is sent to the attended context eta, the gradient of psi. Push a square grid through the map and it lands, bent, inside the hull.'],
    [15, 'Follow one point. As theta spirals outward, eta moves inside the hull and never leaves it: it is a weighted average of the keys with positive weights. Far from the origin, eta hugs the boundary.'],
    [30, 'Along a ray, theta is beta times a fixed direction. At beta zero every key has the same weight and eta is the centroid. As beta grows, eta runs towards the vertex of the hull that is extreme in that direction, and never quite reaches it. The vertices are limits, not values.'],
    [45, 'Psi is strictly convex, because the keys span the plane, so this map is a bijection from the whole theta plane onto the interior of the hull. Its inverse is the gradient of the dual potential psi star, the Legendre transform. The head is linear, then Legendre, then linear.'],
  ],
  header: header(6, 'THE LEGENDRE MAP', 'From natural parameters to the inside of the hull'),

  draw(ctx, t) {
    const intro = seg(t, 0.3, 1.3);
    drawPlane(ctx, PT, { alpha: intro, names: ['θ₁', 'θ₂'] });
    drawPlane(ctx, PK, { alpha: intro });
    chartCaption(ctx, PT, 'natural parameters θ', seg(t, 1, 2), { color: QUERY });
    chartCaption(ctx, PK, 'the keys x_j, their hull, and η = ∇ψ(θ)', seg(t, 1, 2), { color: CONTEXT });
    drawHull(ctx, PK, KEYS, { alpha: seg(t, 2, 3), dash: [6, 5] });

    drawGrid(ctx, t);
    drawKeys(ctx, PK, { alpha: seg(t, 1.5, 2.5) });
    drawSpiral(ctx, t);
    drawRays(ctx, t);
    drawNotes(ctx, t);
    drawChain(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), 'η = ∇ψ(θ) computed from the seven keys · everything on screen is computed');
  },
});

/** The θ-grid on the left (3–6 s) and its image on the right, one line after another (6–14 s). */
function drawGrid(ctx, t) {
  const gridOn = fade(t, 3, 5, 30, 31);
  const imageFade = fade(t, 6, 7, 30, 31);
  GRID.forEach(({ points, image }, k) => {
    const left = gridOn * (0.35 + 0.25 * (points[0][0] === points[1][0] && points[0][0] === 0 ? 1 : 0));
    clipped(ctx, PT, () => drawPath(ctx, PT, points, { colour: QUERY, alpha: left, width: 1 }));
    const progress = seg(t, 6 + 0.45 * k, 7 + 0.45 * k);
    if (progress <= 0.003) return;
    const shown = image.slice(0, 1 + Math.round(progress * (image.length - 1)));
    drawPath(ctx, PK, shown, { colour: CONTEXT, alpha: 0.55 * imageFade, width: 1.2 });
  });
  text(ctx, 'the grid, pushed through ∇ψ', PK.cx, PK.y + PK.size + 28, { ...type.note, color: CONTEXT, align: 'center', alpha: fade(t, 7, 8, 30, 31) });
}

/** θ(t) on a spiral, 15–30 s, and its image η(t) with a short trail. */
const spiralAt = (s) => {
  const r = 0.3 + 2.8 * s;
  const phi = 0.6 + 4 * Math.PI * s;
  return [r * Math.cos(phi), r * Math.sin(phi)];
};
function drawSpiral(ctx, t) {
  const on = fade(t, 15, 15.6, 30, 31);
  if (on <= 0.003) return;
  const s = lin(t, 15.5, 29.5);
  const theta = spiralAt(s);
  const eta = meanParameter(theta, KEYS);
  // trails of the last three seconds
  const s0 = Math.max(0, s - 3 / 14);
  const trail = Array.from({ length: 41 }, (_, i) => spiralAt(s0 + ((s - s0) * i) / 40));
  drawPath(ctx, PT, trail, { colour: QUERY, alpha: 0.7 * on, width: 2 });
  drawPath(ctx, PK, trail.map((th) => meanParameter(th, KEYS)), { colour: CONTEXT, alpha: 0.8 * on, width: 2 });
  // the link between the two charts
  const [ax, ay] = PT.point(theta);
  const [bx, by] = PK.point(eta);
  line(ctx, ax, ay, bx, by, { color: rgba(QUERY, 0.5), width: 1, dash: [4, 6], alpha: on });
  drawToken(ctx, PT, theta, { colour: QUERY, alpha: on, label: 'θ', r: 7 });
  drawToken(ctx, PK, eta, { colour: CONTEXT, alpha: on, label: 'η', r: 7, halo: 0.6 });
  readout(ctx, '|θ| =', Math.hypot(...theta), PT.x + 10, PT.y + PT.size - 12, { colour: QUERY, alpha: on, size: 15 });
}

/** Three rays θ = β θ₀ on the left, and their images from the centroid towards the extreme keys. */
function drawRays(ctx, t) {
  const on = seg(t, 31, 32);
  if (on <= 0.003) return;
  const beta = BETA_MAX * lin(t, 33, 43);
  drawToken(ctx, PK, CENTROID, { colour: color.body, alpha: on * fade(t, 32, 33, 43, 44), label: 'centroid', r: 5, labelOffset: [10, 22] });
  RAYS.forEach(({ dir, extreme, tint }, k) => {
    const a = on * seg(t, 31.5 + 0.5 * k, 32.5 + 0.5 * k);
    // the ray to the edge of the chart, with an arrow head there
    const edge = 3.2 / Math.max(Math.abs(dir[0]), Math.abs(dir[1]));
    const [x0, y0] = PT.point([0, 0]);
    const [x1, y1] = PT.point([dir[0] * edge, dir[1] * edge]);
    arrow(ctx, x0, y0, x1, y1, { color: tint, width: 1.5, head: 10, alpha: 0.7 * a });
    const theta = [beta * dir[0], beta * dir[1]];
    if (beta <= edge) drawToken(ctx, PT, theta, { colour: tint, alpha: a, r: 6 });
    // the image curve from β = 0 to the current β
    const image = Array.from({ length: 61 }, (_, i) => meanParameter([(beta * i * dir[0]) / 60, (beta * i * dir[1]) / 60], KEYS));
    drawPath(ctx, PK, image, { colour: tint, alpha: a, width: 2.5 });
    drawToken(ctx, PK, image[image.length - 1], { colour: tint, alpha: a, r: 6 });
    // the extreme key, the limit of the ray
    const [ex, ey] = PK.point(KEYS[extreme]);
    ring(ctx, ex, ey, 14, tint, a * fade(t, 36, 37), 2);
  });
  readout(ctx, 'β =', beta, PT.x + 10, PT.y + PT.size - 12, { colour: color.body, alpha: on, size: 15 });
  text(ctx, 'rings: the key extreme in each direction θ₀, the limit of η as β → ∞', PK.cx, PK.y + PK.size + 28, { ...type.note, align: 'center', alpha: on * fade(t, 36.5, 37.5) });
}

function drawNotes(ctx, t) {
  const W = 400;
  ETA.draw(ctx, NX, 228, { size: 25, alpha: seg(t, 2, 3) });
  wrap(ctx, 'a_j(θ) > 0 and Σ_j a_j = 1: a convex combination of the keys, strictly inside their hull', NX, 274, W, 24, { ...type.note, alpha: seg(t, 16, 17) });

  const rays = seg(t, 30.5, 31.5);
  RAY.draw(ctx, NX, 352, { size: 24, alpha: rays });
  text(ctx, 'β = 0: uniform weights, η = the centroid', NX, 396, { ...type.note, color: color.body, alpha: seg(t, 32, 33) });
  text(ctx, 'β → ∞: η → the key extreme in direction θ₀', NX, 422, { ...type.note, color: color.body, alpha: seg(t, 36.5, 37.5) });
  text(ctx, 'a vertex is a limit, never a value', NX, 448, { ...type.note, color: CONTEXT, alpha: seg(t, 40, 41) });

  const convex = seg(t, 45, 46);
  HESS.draw(ctx, NX, 506, { size: 22, alpha: convex });
  wrap(ctx, 'strictly convex because the keys span the plane: ∇ψ is a bijection from ℝ² onto the interior of the hull', NX, 540, W, 24, { ...type.note, alpha: seg(t, 46.5, 47.5) });
  const dual = seg(t, 50, 51);
  DUAL.draw(ctx, NX, 626, { size: 22, alpha: dual });
  INVERSE.draw(ctx, NX, 674, { size: 24, alpha: dual });
  text(ctx, 'the inverse map is the Legendre transform', NX, 712, { ...type.note, color: INFO, alpha: seg(t, 51, 52) });
}

/** x_i → θ → η → o_i along the bottom. */
function drawChain(ctx, t) {
  const base = seg(t, 53, 54);
  if (base <= 0.003) return;
  const y = 806;
  const xs = [150, 420, 690, 960];
  STAGES.forEach((s, k) => {
    const a = base * seg(t, 53 + 0.6 * k, 54 + 0.6 * k);
    const x = xs[k];
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(s.tint, 0.12);
    roundRect(ctx, x - 85, y - 30, 170, 60, 12);
    ctx.fill();
    ctx.strokeStyle = rgba(s.tint, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    s.sym.draw(ctx, x, y, { size: 24, align: 'center', alpha: a });
  });
  MAPS.forEach(([label, tint], k) => {
    const a = base * seg(t, 53.3 + 0.6 * k, 54.3 + 0.6 * k);
    arrow(ctx, xs[k] + 89, y, xs[k + 1] - 89, y, { color: tint, width: 3, head: 11, alpha: a });
    text(ctx, label, (xs[k] + xs[k + 1]) / 2, y - 14, { font: font.sans, size: 17, weight: 500, color: tint, align: 'center', alpha: a });
  });
  CHAIN.draw(ctx, NX, y, { size: 26, alpha: base * seg(t, 55, 56) });
}
