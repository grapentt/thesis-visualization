// Scene 07: three outcomes. Fisher balls on the triangle flatten against its edges; the square-root
// map y = 2√p bends the triangle onto the positive octant of the sphere of radius 2, where the Fisher
// metric is the round one: balls become caps, geodesics great circles, distance an angle, the chord
// the Hellinger distance. Back on the triangle the geodesic bows away from the straight mixture line.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, rgba, camera, drawSurface, polyline3 } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, MIX, header, triangle, drawTriangle, drawSimplexPoint, drawSimplexPath, drawFisherBallOnTriangle, readout, exampleStamp, fmt, pill } from '../shared.js';
import { fisherBall, fisherRao, fisherRaoGeodesic, mixtureGeodesic, hellinger, chord, bhattacharyya } from '../math.js';

const T = triangle({ x: 140, y: 235, size: 440 });
const P = [0.62, 0.23, 0.15];
const Q = [0.1, 0.32, 0.58];
const BALL_R = 0.16;
const CENTRES = [[1 / 3, 1 / 3, 1 / 3], [0.7, 0.15, 0.15], [0.15, 0.7, 0.15], [0.15, 0.15, 0.7], [0.45, 0.45, 0.1], [0.1, 0.45, 0.45], [0.45, 0.1, 0.45], [0.88, 0.06, 0.06], [0.06, 0.06, 0.88], [0.3, 0.6, 0.1], [0.6, 0.1, 0.3]];
const BALLS = CENTRES.map((c) => ({ c, pts: fisherBall(c, BALL_R, 48).map(([a, b]) => [a, b, 1 - a - b]) }));
const GEO = Array.from({ length: 81 }, (_, i) => fisherRaoGeodesic(P, Q, i / 80));
const MIXLINE = Array.from({ length: 41 }, (_, i) => mixtureGeodesic(P, Q, i / 40));
const R = 850;

const METRIC_SIMPLEX = tex(String.raw`ds^2 = \sum_{i=1}^{3} \frac{dp_i^2}{p_i}\quad\text{on}\quad \textstyle\sum_i p_i = 1`, 'ds² = Σ dpᵢ²/pᵢ on Σ pᵢ = 1');
const SQRT = tex(String.raw`y_i = 2\sqrt{p_i}\;\;\Rightarrow\;\; \textstyle\sum_i y_i^2 = 4,\qquad \sum_i dy_i^2 = \sum_i \frac{dp_i^2}{p_i}`, 'yᵢ = 2√pᵢ ⇒ Σ yᵢ² = 4, Σ dyᵢ² = Σ dpᵢ²/pᵢ');
const DIST = tex(String.raw`d_{\mathrm{FR}}(p,q) = 2\arccos\sum_i \sqrt{p_i q_i}\;\le\;\pi`, 'd_FR(p, q) = 2 arccos Σ √(pᵢqᵢ) ≤ π');
const HELL = tex(String.raw`\|2\sqrt{p}-2\sqrt{q}\| = 2\sqrt{2}\,H(p,q),\qquad H^2 = 1 - \sum_i\sqrt{p_i q_i}`, '‖2√p − 2√q‖ = 2√2 H(p, q), H² = 1 − Σ √(pᵢqᵢ)');

/** The morph from the flat triangle (y = 2p) to the octant (y = 2√p), in world coordinates (y₁ right, y₃ up, y₂ into the depth). */
const morph = (p, s) => {
  const y = p.map((v) => (1 - s) * 2 * v + s * 2 * Math.sqrt(Math.max(v, 0)));
  return [y[0], y[2], y[1]];
};
const sphereAt = (t) => seg(t, 18, 27);

export default defineScene({
  name: 'The sphere in the simplex',
  duration: 78,
  narration: [
    [0, 'Three outcomes. The dice fill a triangle, and the Fisher metric at each point is the sum over outcomes of d p i squared over p i. Here are balls of one Fisher radius at different places: round in the middle, flattened against the edges and crushed into the corners, where a small change of a rare outcome is a big step.'],
    [17, 'Now stretch each coordinate to twice its square root. The triangle bends into the positive eighth of a sphere of radius two, and in these coordinates the Fisher metric is the ordinary round metric. The flattened balls become round caps, all of one size.'],
    [34, 'So the geometry of three-sided dice is spherical. Geodesics are great circles. The Fisher–Rao distance between two dice is two arccos of the sum of root p i q i, an angle again, never more than pi. And the straight chord between the same two points is, up to a constant, the Hellinger distance.'],
    [51, 'Back in the triangle the geodesic bows toward the centre; the straight segment between the two dice is longer. The straight segment is not wrong, though: it is the mixture of the two dice, a geodesic of a different, flat geometry that returns at the end of the video.'],
    [66, 'One picture to keep: probabilities live on a sphere, and distinguishability is the angle between them.'],
  ],
  header: header(7, 'THE SPHERE IN THE SIMPLEX', 'Three outcomes: the square-root map bends the triangle onto a sphere'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    const s = sphereAt(t);
    drawTriangle(ctx, T, { alpha: on });
    // balls on the triangle
    const balls = seg(t, 3, 4);
    BALLS.forEach(({ pts }, i) => drawFisherBallOnTriangle(ctx, T, pts.map(([a, b]) => [a, b]), { alpha: balls * seg(t, 3 + 0.25 * i, 4 + 0.25 * i), width: 1.4 }));
    // the straight segment and the geodesic, on the triangle
    const geoOn = seg(t, 51.5, 52.5);
    drawSimplexPath(ctx, T, MIXLINE, { colour: MIX, alpha: geoOn, width: 2, dash: [6, 5] });
    drawSimplexPath(ctx, T, GEO, { colour: METRIC, alpha: geoOn, width: 3, progress: lin(t, 52, 55) });
    drawSimplexPoint(ctx, T, P, { colour: P_COL, alpha: seg(t, 34.5, 35.5), r: 7, label: 'p', labelOffset: [-26, 8] });
    drawSimplexPoint(ctx, T, Q, { colour: Q_COL, alpha: seg(t, 34.5, 35.5), r: 7, label: 'q', labelOffset: [14, -8] });
    text(ctx, 'dashed: the straight segment, the mixture of p and q', T.x, T.y + T.height + 66, { font: font.mono, size: 14, color: MIX, alpha: geoOn });
    text(ctx, 'solid: the Fisher–Rao geodesic, the great circle brought back', T.x, T.y + T.height + 88, { font: font.mono, size: 14, color: METRIC, alpha: geoOn });
    // the distances, under the triangle
    const d = seg(t, 40, 41);
    readout(ctx, 'd_FR(p, q) =', fisherRao(P, Q), T.x, T.y + T.height + 130, { colour: METRIC, alpha: d, digits: 3, size: 18 });
    readout(ctx, 'Σ √(pᵢqᵢ) =', bhattacharyya(P, Q), T.x + 250, T.y + T.height + 130, { colour: color.body, alpha: d, digits: 3 });
    const h = seg(t, 47, 48);
    readout(ctx, 'chord ‖2√p − 2√q‖ =', chord(P, Q), T.x, T.y + T.height + 160, { colour: color.ink, alpha: h, digits: 3 });
    readout(ctx, 'H(p, q) =', hellinger(P, Q), T.x + 310, T.y + T.height + 160, { colour: color.ink, alpha: h, digits: 3 });
    text(ctx, 'chord < arc: Hellinger underestimates Fisher–Rao, and agrees to first order', T.x, T.y + T.height + 186, { font: font.mono, size: 13, color: color.muted, alpha: seg(t, 48, 49) });
    text(ctx, `balls of Fisher radius ${BALL_R}`, T.x, T.y - 16, { ...type.note, color: METRIC, alpha: balls });

    drawSphere(ctx, t, s);
    drawNotes(ctx, t, s);
    exampleStamp(ctx, seg(t, 2, 3), `p = (${P.join(', ')}) · q = (${Q.join(', ')}) · everything on screen is computed`);
  },
});

/** The 3D view: the triangle morphing into the octant, with the balls, the geodesic and the chord. */
function drawSphere(ctx, t, s) {
  const on = seg(t, 17.5, 18.5);
  if (on <= 0.003) return;
  const cam = camera({ cx: 1230, cy: 640, scale: 140, yaw: 0.62 + 0.012 * (t - 18), pitch: 0.42, focal: 9, center: [0.75, 0.75, 0.75] });
  ctx.save();
  ctx.globalAlpha *= on;
  drawSurface(ctx, cam, (u, v) => morph([u * (1 - v), (1 - u) * (1 - v), v], s), {
    nu: 28,
    nv: 28,
    u: [0, 1],
    v: [0, 1],
    color: () => '#1d2a48',
    alpha: 0.95,
    ambient: 0.4,
  });
  // the three axes of ℝ³
  for (const [axis, label] of [[[2.3, 0, 0], 'y₁'], [[0, 2.3, 0], 'y₃'], [[0, 0, 2.3], 'y₂']]) {
    polyline3(ctx, cam, [[0, 0, 0], axis], { color: color.line, width: 1.2, alpha: 0.9 });
    const e = cam.project(axis);
    text(ctx, label, e.x + 6, e.y - 6, { font: font.display, italic: true, size: 17, color: color.muted });
  }
  // the balls, as curves on the morphing surface
  const ballOn = seg(t, 19, 20);
  for (const { pts } of BALLS) polyline3(ctx, cam, pts.map((p) => morph(p, s)), { color: METRIC, width: 1.4, alpha: 0.9 * ballOn });
  // the geodesic (a great circle once s = 1), the chord and the two points
  const geo = seg(t, 35, 36);
  polyline3(ctx, cam, GEO.map((p) => morph(p, s)), { color: METRIC, width: 3, alpha: geo, progress: lin(t, 35.5, 38.5) });
  const chordOn = seg(t, 44, 45);
  polyline3(ctx, cam, [morph(P, s), morph(Q, s)], { color: color.ink, width: 1.6, alpha: 0.8 * chordOn, dash: [5, 5] });
  for (const [p, tint, label] of [[P, P_COL, 'p'], [Q, Q_COL, 'q']]) {
    const e = cam.project(morph(p, s));
    ctx.save();
    ctx.globalAlpha *= geo;
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 6.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    text(ctx, label, e.x + 10, e.y - 8, { font: font.display, italic: true, size: 20, color: tint, alpha: geo });
  }
  text(ctx, s < 0.5 ? 'the triangle y = 2p in ℝ³' : 'the octant y = 2√p of the sphere of radius 2', 1230, 866, { ...type.note, align: 'center', color: color.body });
  text(ctx, `morph ${(100 * s).toFixed(0)} %`, 1230, 886, { font: font.mono, size: 12, color: color.dim, align: 'center', alpha: fade(t, 18, 19, 27, 28) });
  ctx.restore();
}

/** Formulas and readouts on the right. */
function drawNotes(ctx, t, s) {
  METRIC_SIMPLEX.draw(ctx, R, 225, { size: 24, alpha: seg(t, 1, 2) });
  text(ctx, 'in the coordinates (p₁, p₂): g = [[1/p₁ + 1/p₃, 1/p₃], [1/p₃, 1/p₂ + 1/p₃]]', R, 262, { ...type.note, size: 13, alpha: fade(t, 2.5, 3.5, 17, 18) });
  SQRT.draw(ctx, R, 300, { size: 22, alpha: seg(t, 20, 21) });
  text(ctx, 'the Fisher metric is the round metric of the sphere of radius 2, pulled back', R, 336, { ...type.note, color: METRIC, alpha: seg(t, 24, 25) });
  DIST.draw(ctx, R, 384, { size: 23, alpha: fade(t, 36, 37, 44, 45) });
  HELL.draw(ctx, R, 384, { size: 19, alpha: seg(t, 45, 46) });
  wrap(ctx, 'Probabilities live on a sphere; distinguishability is the angle between them.', T.x, 846, 660, 26, { ...type.body, size: 20, color: METRIC, alpha: seg(t, 66.5, 67.5) });
}
