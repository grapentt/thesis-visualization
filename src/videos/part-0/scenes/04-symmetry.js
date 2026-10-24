import {
  defineScene, seg, fade, lerp, text, wrap, type, font, color, tex, arrow, dot, ring,
  drawMolecule, moleculeCamera, rotation, vec3,
} from '../../../kit.js';
import { energySamples, energyOf, rigidMotion, centroidOf } from '../shared.js';

const X = energySamples[3].X;
const SHIFT = [1.4, -0.3, 0];
const AXIS = [0.3, 1, 0.25];
const TRANSLATION = tex(String.raw`U(x_1 + a, \dots, x_N + a) = U(x_1, \dots, x_N)`, 'U(x₁ + a, …, x_N + a) = U(x₁, …, x_N)');
const ROTATION = tex(String.raw`U(Rx_1, \dots, Rx_N) = U(x_1, \dots, x_N), \quad R \in SO(3)`, 'U(Rx₁, …, Rx_N) = U(x₁, …, x_N),  R ∈ SO(3)');
const INVARIANCE = tex(String.raw`U(g \cdot x) = U(x) \quad \text{for all } g \in SE(3)`, 'U(g·x) = U(x)  for all g ∈ SE(3)');
const QUOTIENT = tex(String.raw`U : \mathbb{R}^{3N}/SE(3) = M \;\longrightarrow\; \mathbb{R}`, 'U : ℝ³ᴺ / SE(3) = M → ℝ');

/** Rigidly moved copies on the orbit of x: screen offset, yaw and pitch of their camera. */
const COPIES = [
  { dx: -330, dy: -40, yaw: 1.6, pitch: 0.9 },
  { dx: -200, dy: 170, yaw: -0.8, pitch: -0.4 },
  { dx: 60, dy: 215, yaw: 2.6, pitch: 0.2 },
  { dx: 320, dy: 120, yaw: -1.9, pitch: 1.1 },
  { dx: 300, dy: -150, yaw: 0.9, pitch: -0.9 },
  { dx: -120, dy: -200, yaw: 3.4, pitch: 0.5 },
];
const ORBIT_CENTRE = { x: 720, y: 500 };

export default defineScene({
  name: 'Symmetry',
  duration: 30,
  narration:
    'Translate the molecule: the energy does not change. Rotate it: again no change. U is invariant under all rigid motions, the group SE(3). So all rigidly moved copies of a configuration are really the same shape, and U is a function on the quotient M = ℝ³ᴺ / SE(3), the space we work on.',
  header: { eyebrow: '01 · THE SPACE WE WORK ON', title: 'Rigid motions do not change the energy' },

  draw(ctx, t) {
    // translation, then rotation about the centre
    const a = vec3.scale(SHIFT, seg(t, 2, 4) - seg(t, 6, 7.5));
    const angle = 1.1 * (seg(t, 8.5, 10.5) - seg(t, 12.5, 14));
    const moved = rigidMotion(X, rotation.axisAngle(AXIS, angle), a);
    const toOrbit = seg(t, 16, 17.5);
    const collapse = seg(t, 21, 23.5);
    const shrink = seg(t, 23.5, 25);
    const cam = moleculeCamera({ cx: lerp(560, ORBIT_CENTRE.x, toOrbit), cy: lerp(560, ORBIT_CENTRE.y, toOrbit), scale: lerp(135, 120, toOrbit) * (1 - 0.92 * shrink) });

    const moving = Math.abs(angle) > 0.01 || vec3.length(a) > 0.01;
    drawMolecule(ctx, X, cam, { ghost: color.muted, opacity: moving ? 0.6 : 0, labels: 0 });
    drawMolecule(ctx, moved, cam, { opacity: seg(t, 0.2, 1) * (1 - seg(t, 24.2, 25)) });
    if (vec3.length(a) > 0.05) {
      const from = cam.project(centroidOf(X));
      const to = cam.project(centroidOf(moved));
      arrow(ctx, from.x, from.y, to.x, to.y, { color: color.gold, width: 4, head: 16 });
      text(ctx, 'a', (from.x + to.x) / 2, (from.y + to.y) / 2 - 14, { ...type.math, color: color.gold });
    }

    // the energy stays exactly the same
    const panel = fade(t, 0.8, 1.8, 16, 16.8);
    text(ctx, 'potential energy', 1000, 252, { ...type.note, alpha: panel });
    text(ctx, `U = ${energyOf(moved).toFixed(4)} eV`, 1000, 296, { font: font.mono, size: 32, color: color.gold, alpha: panel });

    const eqs = (from) => fade(t, from, from + 1, 16, 16.8);
    TRANSLATION.draw(ctx, 1000, 380, { size: 28, alpha: eqs(3.6) });
    text(ctx, 'translate every atom by the same a ∈ ℝ³', 1000, 418, { ...type.note, alpha: eqs(3.8) });
    ROTATION.draw(ctx, 1000, 480, { size: 28, alpha: eqs(10) });
    text(ctx, 'rotate every atom about the centre', 1000, 518, { ...type.note, alpha: eqs(10.2) });
    INVARIANCE.draw(ctx, 1000, 590, { size: 32, alpha: eqs(14.4) });
    text(ctx, 'SE(3): all rotations and translations of space', 1000, 630, { ...type.note, alpha: eqs(14.6) });

    drawOrbit(ctx, t, collapse);
    drawQuotient(ctx, t);
  },
});

/** Copies g·x on the orbit appear, then collapse onto one point [x] of M. */
function drawOrbit(ctx, t, collapse) {
  const shown = seg(t, 17.5, 19.5);
  if (shown <= 0 || collapse >= 1) return;
  COPIES.forEach((c, i) => {
    const a = seg(t, 17.5 + 0.25 * i, 18.3 + 0.25 * i) * (1 - seg(collapse, 0.6, 1));
    const cam = moleculeCamera({
      cx: ORBIT_CENTRE.x + c.dx * (1 - collapse),
      cy: ORBIT_CENTRE.y + c.dy * (1 - collapse),
      scale: lerp(62, 120, collapse),
      yaw: lerp(c.yaw, 0.5, collapse),
      pitch: lerp(c.pitch, 0.28, collapse),
    });
    drawMolecule(ctx, X, cam, { opacity: a * 0.9, labels: 0 });
  });
  text(ctx, 'All the same molecule, moved rigidly: one orbit SE(3) · x', ORBIT_CENTRE.x, 820, {
    ...type.body,
    align: 'center',
    alpha: fade(t, 19.2, 20, 22.6, 23.2),
  });
}

function drawQuotient(ctx, t) {
  const m = seg(t, 24, 25.2);
  if (m <= 0) return;
  const { x, y } = ORBIT_CENTRE;
  ctx.save();
  ctx.globalAlpha = m;
  ctx.strokeStyle = color.muted;
  ctx.fillStyle = 'rgba(138,150,173,0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const phi = (i / 120) * Math.PI * 2;
    const r = 1 + 0.08 * Math.sin(3 * phi + 0.7) + 0.05 * Math.cos(5 * phi);
    const px = x + 220 * r * Math.cos(phi);
    const py = y - 30 + 110 * r * Math.sin(phi);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  text(ctx, 'M = ℝ³ᴺ / SE(3)', x + 150, y - 120, { ...type.math, size: 26, color: color.muted, alpha: m });
  dot(ctx, x, y, 9, color.gold, m);
  ring(ctx, x, y, 16, color.gold, m);
  text(ctx, '[x] ∈ M', x + 24, y - 14, { ...type.math, size: 28, color: color.gold, alpha: m });

  QUOTIENT.draw(ctx, x, 712, { size: 40, align: 'center', alpha: seg(t, 25.4, 26.4) });
  wrap(ctx, 'M is the shape space. We do not care about the SE(3) part: the centre of mass and the orientation.', x - 330, 780, 660, 30, {
    ...type.body,
    alpha: seg(t, 26.2, 27.2),
  });
  text(ctx, 'Strictly, M is a smooth manifold away from degenerate (for example collinear) configurations.', x, 862, {
    ...type.note,
    size: 14,
    align: 'center',
    alpha: seg(t, 27, 28),
  });
}
