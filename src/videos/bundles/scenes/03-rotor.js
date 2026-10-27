import { defineScene, seg, fade, lerp, text, wrap, type, color, tex, arrow3, drawMolecule, vec3 } from '../../../kit.js';
import {
  nitro, X0, nitroCamera, turnRotor, rotorCircle, circlePoint, rotorAxis, drawRotorCircle, drawRotorAxis, LIPS, MOUTH, ROTOR,
} from '../shared.js';

const ACTION = tex(String.raw`g_\varphi \cdot x = (x_1,\, x_2,\, x_3,\, x_4',\, x_5')`, 'gᵩ · x = (x₁, x₂, x₃, x₄′, x₅′)');
const LIP_MOVE = tex(String.raw`x_k' = x_3 + R_u(\varphi)\,(x_k - x_3), \quad k = 4, 5`, 'xₖ′ = x₃ + Rᵤ(φ)(xₖ − x₃),  k = 4, 5');
const AXIS = tex(String.raw`u = \frac{x_3 - x_2}{|x_3 - x_2|}, \qquad g_\varphi\, g_\psi = g_{\varphi + \psi}`, 'u = (x₃ − x₂)/|x₃ − x₂|,   g_φ g_ψ = g_{φ+ψ}');
const CIRCLE = rotorCircle(X0);
const RIGHT = 960;

/** The rotor angle over the scene: a quarter turn, a full turn, a wiggle, then φ ≈ 120°. */
function angleAt(t) {
  if (t < 15.5) return (Math.PI / 2) * seg(t, 6, 9) + 1.5 * Math.PI * seg(t, 10.5, 15);
  if (t < 30) return 0.45 * Math.sin(2 * Math.PI * Math.max(0, t - 23.5) / 3) * seg(t, 23.5, 24) * (1 - seg(t, 29, 30));
  return 2.1 * seg(t, 30.5, 33);
}

export default defineScene({
  name: 'The rotor',
  duration: 39,
  narration:
    'Now a second symmetry. Part of the molecule is shaped like a less-than sign: the nitrogen and its two oxygens. Turn the two lips about the x-axis, through the carbon–nitrogen bond, here by ninety degrees, or by any angle: a whole circle of configurations. Only beads four and five move. The axis is read off the configuration and does not change when the lips turn, so this is an action of U(1). It is a local symmetry: its generator vanishes on the other beads. Relative to where we started, each configuration on the circle is described by exactly one angle: a U(1) orientation, just as a rotation described the rotated copies.',
  header: { eyebrow: '03 · A LOCAL SYMMETRY', title: 'A second symmetry: the rotor' },

  draw(ctx, t) {
    const cam = nitroCamera({ cx: 500, cy: 480, scale: 175, yaw: 0.78, pitch: 0.36 });
    const phi = angleAt(t);
    const X = turnRotor(X0, phi);

    const axisAlpha = seg(t, 3.5, 5);
    const tip = drawRotorAxis(ctx, cam, X0, { alpha: axisAlpha, after: 2.1 });
    text(ctx, 'the x-axis, through the C–N bond', tip.x + 10, tip.y - 14, { ...type.note, color: ROTOR, alpha: fade(t, 4, 5, 15, 16) });

    // the circle the lips run around, and the arcs they have run so far
    const fullCircle = seg(t, 12, 14);
    drawRotorCircle(ctx, cam, X0, { alpha: 0.55 * fullCircle, width: 2 });
    if (t > 6 && t < 16) {
      const swept = phi;
      drawRotorCircle(ctx, cam, X0, { sweep: swept, width: 4, alpha: 1 - fullCircle * 0.6 });
      drawRotorCircle(ctx, cam, X0, { from: Math.PI, sweep: swept, width: 4, alpha: 1 - fullCircle * 0.6 });
    }
    if (t > 30) drawAngle(ctx, cam, phi, fade(t, 30.5, 31.5, 38, 38.8));

    const moving = Math.abs(phi) > 0.02;
    drawMolecule(ctx, X0, cam, { molecule: nitro, ghost: color.muted, opacity: moving ? 0.55 : 0, labels: 0, atomAlpha: [0, 0, 0, 1, 1] });
    drawMolecule(ctx, X, cam, {
      molecule: nitro,
      opacity: seg(t, 0, 0.8),
      highlight: MOUTH,
      highlightColor: ROTOR,
      highlightAlpha: fade(t, 1.2, 2, 5.5, 6.5),
    });

    // the generator: arrows on the lips only
    const gen = fade(t, 22.8, 23.6, 29.2, 30);
    if (gen > 0) {
      const { origin, u } = rotorAxis(X);
      for (const i of LIPS) {
        const p = nitro.atom(X, i);
        arrow3(ctx, cam, p, vec3.scale(vec3.cross(u, vec3.sub(p, origin)), 0.8), { color: ROTOR, width: 4, head: 13, alpha: gen });
      }
      for (const i of [0, 1, 2]) {
        const p = cam.project(nitro.atom(X, i));
        text(ctx, '0', p.x + 16, p.y - 16, { ...type.label, color: ROTOR, alpha: gen });
      }
    }

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 250) => wrap(ctx, s, RIGHT, y, 580, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Part of the molecule is shaped like ‘<’: the N and its two O, the NO₂ group.', 1.2, 5.6);
    note('Turn the two lips about the x-axis, here by 90°,', 5.8, 9.8);
    note('or by any angle φ: a whole circle of configurations. Only beads 4 and 5 move.', 10.4, 15.6);
    note('The same rotation Rᵤ(φ) for both lips, about the axis u through the C–N bond:', 16, 22.4);
    ACTION.draw(ctx, RIGHT, 350, { size: 28, alpha: fade(t, 16.6, 17.6, 22.4, 23) });
    LIP_MOVE.draw(ctx, RIGHT, 410, { size: 26, alpha: fade(t, 17.2, 18.2, 22.4, 23) });
    AXIS.draw(ctx, RIGHT, 480, { size: 26, alpha: fade(t, 18, 19, 22.4, 23) });
    wrap(ctx, 'Turning the lips does not change u, so turning by ψ and then by φ is turning by φ + ψ: an action of the circle group U(1) = SO(2).', RIGHT, 550, 580, 30, {
      ...words,
      alpha: fade(t, 19.2, 20, 22.4, 23),
    });
    note('A local symmetry: its generator is zero on beads 1, 2 and 3. A rotation of the whole molecule moves every bead.', 23.2, 29.6);
    note('Relative to the start x, every configuration on the circle is gᵩ·x for exactly one angle φ ∈ U(1): a U(1) orientation, just as R ∈ SO(3) labelled the rotated copies.', 30.2, 39);
  },
});

/** The angle φ the lips have turned, marked on the circle from the start position. */
function drawAngle(ctx, cam, phi, alpha) {
  if (alpha <= 0.003) return;
  const centre = cam.project(CIRCLE.centre);
  const start = cam.project(circlePoint(CIRCLE, 0));
  const now = cam.project(circlePoint(CIRCLE, phi));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = ROTOR;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(centre.x, centre.y);
  ctx.lineTo(now.x, now.y);
  ctx.stroke();
  ctx.restore();
  drawRotorCircle(ctx, cam, X0, { sweep: phi, width: 4.5, alpha });
  const mid = cam.project(circlePoint(CIRCLE, phi / 2));
  text(ctx, 'φ', lerp(centre.x, mid.x, 1.35), lerp(centre.y, mid.y, 1.35) + 8, { ...type.math, size: 30, color: ROTOR, align: 'center', alpha });
}
