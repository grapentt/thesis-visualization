import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, line, card } from '../../../kit.js';
import { VERTICAL, HORIZONTAL, bundleCamera } from '../shared.js';
import { TWIST, LIFT_START, drawFloor, drawFibres, drawTiles, loopPoints, enclosedArea, drawLoopAndLift } from '../bundleBox.js';

/** Closed polygon through the given corners, finely subdivided. */
function polygonLoop(corners, perSide = 40) {
  const pts = [];
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length];
    for (let k = 0; k < perSide; k++) pts.push([lerp(a[0], b[0], k / perSide), lerp(a[1], b[1], k / perSide)]);
  });
  pts.push(corners[0]);
  return pts;
}
const C = [0.5, -0.3];
const SHAPES = [
  { marker: 'square', loop: polygonLoop([[C[0] - 0.3, C[1] - 0.3], [C[0] + 0.3, C[1] - 0.3], [C[0] + 0.3, C[1] + 0.3], [C[0] - 0.3, C[1] + 0.3]]) },
  { marker: 'triangle', loop: polygonLoop([[C[0] - 0.42, C[1] - 0.25], [C[0] + 0.42, C[1] - 0.25], [C[0], C[1] + 0.48]]) },
  { marker: 'circle', loop: loopPoints(0.28, { cx: C[0], cy: C[1] }) },
];
const SHRINK_SAMPLES = [1, 0.8, 0.6, 0.45, 0.3];
const SHAPE_START = 7;
const SHAPE_LENGTH = 2.6;

const SMALL_LOOP = tex(String.raw`\mathrm{hol}(\varepsilon u, \varepsilon v) = \varepsilon^2\, \Omega(u, v) + O(\varepsilon^3)`, 'hol(εu, εv) = ε² Ω(u, v) + O(ε³)');
const TWO_FORM = tex(String.raw`\Omega_p : H_p \times H_p \to V_p, \qquad \Omega(v, u) = -\Omega(u, v)`, 'Ω_p : H_p × H_p → V_p,   Ω(v, u) = −Ω(u, v)');

export default defineScene({
  name: 'Curvature',
  duration: 32,
  continues: true,
  narration:
    'Shrink the loop. The holonomy shrinks with the enclosed area, and the ratio stays the same. Square, triangle or circle: for a small loop only the area matters, not the shape. So curvature is infinitesimal holonomy: it takes two horizontal vectors spanning a tiny loop and returns the vertical displacement, per unit area. That is why curvature is a two-form, the exterior covariant derivative of the connection form.',
  header: { eyebrow: '05 · CURVATURE', title: 'Curvature is holonomy around tiny loops' },

  draw(ctx, t) {
    const cam = bundleCamera();
    drawFloor(ctx, cam);
    drawFibres(ctx, cam);
    drawTiles(ctx, cam, TWIST, { alpha: 0.5 });

    // which loop is shown
    const shapeIndex = Math.floor((t - SHAPE_START) / SHAPE_LENGTH);
    let loop;
    if (t < SHAPE_START) loop = loopPoints(lerp(1, 0.3, seg(t, 1, 6)));
    else loop = SHAPES[Math.min(SHAPES.length - 1, shapeIndex)].loop;
    const lifted = drawLoopAndLift(ctx, cam, loop, LIFT_START, TWIST, { alpha: fade(t, 0, 0.5, 30, 31) });
    const area = enclosedArea(loop);
    const hol = lifted[lifted.length - 1][2] - LIFT_START;

    const readout = fade(t, 0.5, 1.2, 15, 15.6);
    text(ctx, `area A = ${area.toFixed(3)}`, 980, 560, { font: font.mono, size: 20, alpha: readout });
    text(ctx, `holonomy Δz = ${hol.toFixed(3)}`, 980, 594, { font: font.mono, size: 20, color: VERTICAL, alpha: readout });
    text(ctx, `Δz / A = ${(hol / area).toFixed(3)}`, 980, 628, { font: font.mono, size: 20, color: color.gold, alpha: readout });

    drawRatioChart(ctx, t);

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'Curvature is the holonomy of tiny loops, per unit area. For a small loop only its (oriented) area matters, not its shape.', 980, 570, 560, 30, {
      ...words,
      alpha: seg(t, 15.6, 16.4),
    });
    SMALL_LOOP.draw(ctx, 980, 680, { size: 28, alpha: seg(t, 17, 18) });
    TWO_FORM.draw(ctx, 980, 740, { size: 26, alpha: seg(t, 18.5, 19.5) });
    wrap(ctx, 'Two horizontal vectors span an infinitesimal loop; Ω returns its vertical displacement. That is why curvature is a 2-form.', 980, 790, 560, 28, {
      ...type.body,
      size: 19,
      alpha: seg(t, 19.5, 20.5),
    });

    card(ctx, {
      x: 980,
      y: 230,
      width: 560,
      tag: 'IN FORMULAS',
      title: 'Curvature from the connection',
      body: 'Ω = DA = dA + ½[A ∧ A], the exterior covariant derivative of the connection form A. For an abelian group simply Ω = dA. Here A = dz − λ·½(x dy − y dx), so |Ω| = λ = 0.5: the ratio measured above.',
      accent: color.gold,
      alpha: seg(t, 22, 22.8),
      progress: lin(t, 22.3, 26.5),
    });
  },
});

/** Δz / A for every loop shown so far: always λ. */
function drawRatioChart(ctx, t) {
  const a = fade(t, 1, 2, 21, 21.8);
  if (a <= 0) return;
  const box = { x: 980, y: 270, w: 520, h: 220 };
  const Y = (r) => box.y + box.h - r * box.h;
  ctx.save();
  ctx.globalAlpha = a;
  text(ctx, 'holonomy per area, Δz / A, for every loop so far', box.x, box.y - 22, { size: 19, weight: 500 });
  line(ctx, box.x, box.y + box.h, box.x + box.w, box.y + box.h);
  line(ctx, box.x, box.y, box.x, box.y + box.h);
  for (const r of [0, 0.5, 1]) text(ctx, r.toFixed(1), box.x - 10, Y(r), { ...type.note, align: 'right', baseline: 'middle' });
  line(ctx, box.x, Y(TWIST), box.x + box.w, Y(TWIST), { color: color.gold, dash: [6, 6] });
  text(ctx, 'λ = 0.5', box.x + box.w, Y(TWIST) - 10, { font: font.mono, size: 15, color: color.gold, align: 'right' });

  const points = [];
  SHRINK_SAMPLES.forEach((rho, i) => {
    if (lerp(1, 0.3, seg(t, 1, 6)) <= rho + 1e-6) points.push({ label: `r = ${rho}`, marker: 'circle', size: 4 + 6 * rho, i });
  });
  SHAPES.forEach((s, k) => {
    if (t >= SHAPE_START + k * SHAPE_LENGTH) points.push({ label: s.marker, marker: s.marker, size: 7, i: SHRINK_SAMPLES.length + k });
  });
  for (const p of points) {
    const x = box.x + 40 + p.i * 56;
    const y = Y(TWIST);
    drawMarker(ctx, p.marker, x, y, p.size, p.i < SHRINK_SAMPLES.length ? color.ink : HORIZONTAL);
  }
  text(ctx, 'shrinking circles', box.x + 40, box.y + box.h + 26, { ...type.note, size: 14 });
  text(ctx, 'other shapes', box.x + 40 + SHRINK_SAMPLES.length * 56, box.y + box.h + 26, { ...type.note, size: 14, alpha: seg(t, SHAPE_START, SHAPE_START + 0.5) });
  ctx.restore();
}

function drawMarker(ctx, marker, x, y, size, tint) {
  ctx.save();
  ctx.fillStyle = tint;
  ctx.beginPath();
  if (marker === 'square') ctx.rect(x - size, y - size, 2 * size, 2 * size);
  else if (marker === 'triangle') {
    ctx.moveTo(x, y - size * 1.2);
    ctx.lineTo(x + size * 1.1, y + size * 0.8);
    ctx.lineTo(x - size * 1.1, y + size * 0.8);
    ctx.closePath();
  } else ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
