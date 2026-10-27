import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, dot, drawMolecule, camera, rotation, vec3 } from '../../../kit.js';
import { nitro, X0, turnRotor, rotorAxis, centreOfMass, zeroMomentum, placed, VERTICAL, HORIZONTAL, ROTOR } from '../shared.js';

const STEPS = 1200;
const COM = centreOfMass(X0);
const ROTATIONS = zeroMomentum((tau) => turnRotor(X0, 2 * Math.PI * tau), STEPS);
/** How far the rest of the molecule has turned about the space x-axis, unwrapped (degrees). */
const TURNED = (() => {
  let previous = 0;
  let total = 0;
  return ROTATIONS.map((R) => {
    const a = Math.atan2(R[2][1], R[1][1]);
    total += Math.atan2(Math.sin(a - previous), Math.cos(a - previous));
    previous = a;
    return (total * 180) / Math.PI;
  });
})();
const HOLONOMY = ROTATIONS[STEPS];
const HOLONOMY_ANGLE = (rotation.rotationAngle(HOLONOMY) * 180) / Math.PI;
/** Angle between the holonomy's rotation axis and the C–N bond at the start (degrees). */
const AXIS_TILT = (() => {
  const R = HOLONOMY;
  const axis = vec3.normalize([R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]]);
  return (Math.acos(Math.abs(vec3.dot(axis, rotorAxis(X0).u))) * 180) / Math.PI;
})();
const REST_TURN = Math.round(-TURNED[STEPS]); // how far the rest turns back
const RUN = [4, 16];
const INSET = { x: 1190, y: 655, rx: 120, ry: 50 };
const RIGHT = 860;
const TURN = tex(String.raw`\text{turn} = 2\pi\, \frac{I_{\text{rest}}}{I_{\text{rest}} + I_{\text{rotor}}}`, 'turn = 2π I_rest / (I_rest + I_rotor)');

export default defineScene({
  name: 'The rotor in shape space',
  duration: 40,
  narration:
    'In shape space, turning the lips is a change of shape, and a full turn comes back to the same shape: the rotor’s orbit is a loop in M. Turn the lips once while keeping the total angular momentum zero. The rest of the molecule turns the other way. Back at the same shape, the whole molecule has rotated: the holonomy of the mechanical connection around the rotor’s loop. It is the swivel chair that turns when you spin a bicycle wheel on it. The two bundles talk to each other.',
  header: { eyebrow: '07 · TWO BUNDLES AT ONCE', title: 'Turning the rotor with zero angular momentum' },

  draw(ctx, t) {
    const tau = lin(t, ...RUN);
    const k = Math.round(tau * STEPS);
    const X = placed(turnRotor(X0, 2 * Math.PI * tau), ROTATIONS[k], COM);
    // the camera looks down the current C–N bond (a Newman projection), so turning about it reads like a clock
    const cam = bondCamera(X);
    drawMolecule(ctx, X0, bondCamera(X0), { molecule: nitro, ghost: color.muted, opacity: 0.6 * seg(t, 1, 2), labels: 0 });
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: seg(t, 0, 0.8), labels: 0.8 });
    text(ctx, 'seen down the C–N bond · outline: the molecule at the start', 430, 790, { ...type.note, align: 'center', alpha: seg(t, 1.5, 2.5) });

    const live = seg(t, 3, 3.8);
    const mono = { font: font.mono, size: 19 };
    text(ctx, `rotor, relative to the rest   ${(360 * tau).toFixed(0)}°`, RIGHT, 350, { ...mono, color: ROTOR, alpha: live });
    text(ctx, `rest of the molecule, in space   ${TURNED[k].toFixed(0)}°`, RIGHT, 386, { ...mono, color: VERTICAL, alpha: live });
    text(ctx, `lips, in space   +${(360 * tau + TURNED[k]).toFixed(0)}°`, RIGHT, 422, { ...mono, color: color.muted, alpha: live });
    text(ctx, 'total angular momentum   L = 0', RIGHT, 458, { ...mono, color: HORIZONTAL, alpha: live });
    text(ctx, 'angles about the C–N axis (x); the full rotation also tilts slightly', RIGHT, 486, { ...type.note, size: 14, alpha: live });

    drawLoop(ctx, t, tau);

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'In shape space M, turning the lips changes the shape, and a full turn is a loop.', RIGHT, 230, 660, 30, { ...words, alpha: fade(t, 0.6, 1.4, 2.8, 3.2) });
    wrap(ctx, `Back at the same shape, but the molecule has turned: the rest by about ${REST_TURN}° backwards, the lips by about ${360 - REST_TURN}° forwards. This rotation is the holonomy of the rotor’s loop.`, RIGHT, 230, 660, 30, {
      ...words,
      alpha: seg(t, 16.6, 17.4),
    });
    wrap(ctx, 'Spin a bicycle wheel while sitting on a swivel chair and the chair turns the other way. The rotor’s orbit is a loop in the base of the SO(3) bundle, and that bundle is curved.', RIGHT, 806, 660, 28, {
      ...type.body,
      size: 19,
      color: color.muted,
      alpha: fade(t, 23, 24, 29.4, 30),
    });
    TURN.draw(ctx, RIGHT, 790, { size: 28, alpha: seg(t, 30, 31) });
    wrap(ctx, `Exact when the rest is symmetric about the bond, as CH₃ is in nitromethane: 28°. Here bead 1 is off the axis: ${HOLONOMY_ANGLE.toFixed(1)}° about an axis ${AXIS_TILT.toFixed(0)}° from the bond.`, RIGHT, 836, 660, 22, {
      ...type.note,
      size: 14,
      alpha: seg(t, 30.6, 31.6),
    });
  },
});

/** A camera looking (almost) down the C₂ → N bond of X, centred on N. */
function bondCamera(X) {
  const [ux, uy, uz] = rotorAxis(X).u;
  const yaw = Math.atan2(-ux, uz);
  const pitch = Math.atan2(uy, Math.hypot(ux, uz));
  return camera({ center: nitro.atom(X, 2), cx: 430, cy: 540, scale: 150, yaw: yaw + 0.2, pitch: pitch + 0.14 });
}

/** Shape space M with the rotor's orbit through [x]: a loop. */
function drawLoop(ctx, t, tau) {
  const a = seg(t, 2, 3);
  if (a <= 0) return;
  const { x, y, rx, ry } = INSET;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color.muted;
  ctx.fillStyle = 'rgba(138,150,173,0.06)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const s = (i / 120) * 2 * Math.PI;
    const r = 1 + 0.07 * Math.sin(3 * s + 0.4);
    const px = x + 2.4 * rx * r * Math.cos(s);
    const py = y + 1.9 * ry * r * Math.sin(s);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  text(ctx, 'M', x + 2.4 * rx + 10, y - 1.4 * ry, { ...type.math, size: 26, color: color.muted, alpha: a });

  const loop = Array.from({ length: 121 }, (_, i) => {
    const s = (i / 120) * 2 * Math.PI;
    return [x + rx * Math.sin(s), y + ry * (1 - Math.cos(s)) - ry];
  });
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = ROTOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  loop.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  ctx.restore();
  const [sx, sy] = loop[0];
  const [px, py] = loop[Math.round(tau * 120)];
  dot(ctx, sx, sy, 5, color.muted, a);
  dot(ctx, px, py, 8, color.ink, a);
  text(ctx, '[x]', sx - 14, sy - 8, { ...type.math, size: 22, align: 'right', alpha: a });
  text(ctx, 'U(1)·[x]', x + rx + 18, y + 2, { ...type.math, size: 22, color: ROTOR, alpha: a });
  text(ctx, 'a loop of shapes', x + rx + 18, y + 26, { ...type.note, size: 14, color: ROTOR, alpha: a });
}
