import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, card, drawMolecule, rotation, vec3,
} from '../../../kit.js';
import { nitro, X0, nitroCamera, turnRotor, bend, centreOfMass, zeroMomentum, placed, VERTICAL, HORIZONTAL } from '../shared.js';
import { drawBead, drawStick, BEAD } from '../beads.js';

const STEPS = 1500;
const LOOP = { phi: 1.5, beta: 0.6 };
const shapeAt = (tau) => bend(turnRotor(X0, LOOP.phi * (1 - Math.cos(2 * Math.PI * tau))), LOOP.beta * Math.sin(2 * Math.PI * tau));
const ROTATIONS = zeroMomentum(shapeAt, STEPS);
const HOLONOMY = (rotation.rotationAngle(ROTATIONS[STEPS]) * 180) / Math.PI;
const COM = centreOfMass(X0);
/** The second molecule B: two beads, given relative to A's centre of mass at the start. */
const B_BODY = [[0.5, -1.9, 0.6], [1.6, -1.7, -0.2]];
const B_LAB = B_BODY.map((q) => vec3.add(q, COM));
const RUN = [3.5, 16.5];
const RIGHT = 860;
const INSET = { x: 1080, y: 560, w: 300, h: 170 };

const WHOLE = tex(String.raw`M_{A+B} \;\supset\; X_A \times_{SO(3)} \mathbb{R}^{3\cdot 2} \;\xrightarrow{\;\;}\; M_A`, 'M_{A+B} ⊃ X_A ×_SO(3) ℝ⁶ → M_A');

export default defineScene({
  name: 'Coupling',
  duration: 46,
  narration:
    'Now couple a second, smaller molecule B, two beads, to the first. Where B sits relative to A is a point of the associated bundle with fibre ℝ⁶. Let A run a loop of shapes with zero angular momentum. Parallel transport in the associated bundle leaves B alone: in the lab it does not move. Back at its shape, A has turned, so seen from A, B has turned the other way, by the inverse of the holonomy. The shape space of the whole is a bundle over the shape space of a part. This treats B as a test particle; if B is tied to A and must move with it, its mass enters, and the right connection is the mechanical connection of the whole.',
  header: { eyebrow: '09 · COUPLING', title: 'Coupling a second molecule' },

  draw(ctx, t) {
    const tau = lin(t, ...RUN);
    const k = Math.round(tau * STEPS);
    const R = ROTATIONS[k];
    const started = t > RUN[0];
    const a = seg(t, 0, 0.8);
    const b = seg(t, 1, 2);

    // in the lab: A moves with L = 0, B is left alone
    const lab = nitroCamera({ cx: 240, cy: 450, scale: 100, yaw: 0.6, pitch: 0.3 });
    if (started) drawMolecule(ctx, X0, lab, { molecule: nitro, ghost: color.muted, opacity: 0.5, labels: 0 });
    drawMolecule(ctx, placed(shapeAt(tau), R, COM), lab, { molecule: nitro, opacity: a, labels: 0 });
    drawPair(ctx, lab, B_LAB, b);
    text(ctx, 'in the lab', 240, 250, { ...type.note, align: 'center', alpha: a });
    text(ctx, 'B stays where it is', 240, 720, { ...type.note, color: BEAD, align: 'center', alpha: b });

    // seen from A: A's own frame, so B appears to turn
    const own = nitroCamera({ cx: 610, cy: 450, scale: 100, yaw: 0.6, pitch: 0.3 });
    const seen = seg(t, 2.5, 3.5);
    const inverse = rotation.transpose(R);
    if (started) B_LAB.forEach((p) => drawBead(ctx, own, p, { ghost: true, alpha: seen }));
    drawMolecule(ctx, placed(shapeAt(tau), rotation.IDENTITY, COM), own, { molecule: nitro, opacity: seen, labels: 0 });
    drawPair(ctx, own, B_BODY.map((q) => vec3.add(rotation.apply(inverse, q), COM)), seen);
    text(ctx, 'seen from A', 610, 250, { ...type.note, align: 'center', alpha: seen });
    text(ctx, 'B turns, the other way', 610, 720, { ...type.note, color: BEAD, align: 'center', alpha: seen * seg(t, RUN[0], RUN[0] + 1) });
    text(ctx, started ? 'outlines: at the start' : '', 425, 780, { ...type.note, size: 14, align: 'center', alpha: seg(t, RUN[0], RUN[0] + 1) });

    drawInset(ctx, t, tau);
    const live = fade(t, RUN[0], RUN[0] + 0.6, 23.4, 24);
    const turned = (rotation.rotationAngle(R) * 180) / Math.PI;
    text(ctx, `A, in the lab, has turned by  ${turned.toFixed(1)}°`, RIGHT, 440, { font: font.mono, size: 19, color: VERTICAL, alpha: live });
    text(ctx, `B, seen from A, has turned by  −${turned.toFixed(1)}°`, RIGHT, 474, { font: font.mono, size: 19, color: BEAD, alpha: live });

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 240) => wrap(ctx, s, RIGHT, y, 660, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('A second, smaller molecule B: two beads. Where B sits relative to A is a point of the associated bundle with fibre ℝ³ × ℝ³ = ℝ⁶.', 0.8, 3.8);
    note('A runs a loop of shapes with zero angular momentum. Parallel transport in the associated bundle leaves B alone: in the lab it does not move.', 4.2, 17);
    note(`Back at its shape, A has turned by ${HOLONOMY.toFixed(0)}°: the holonomy of its loop. Seen from A, B has turned by the inverse.`, 17.4, 24);
    note('The shape space of the whole is a bundle over the shape space of a part, with fibre ℝ⁶: where B is, as A sees it.', 24.4, 46);
    WHOLE.draw(ctx, RIGHT, 370, { size: 30, alpha: seg(t, 25.5, 26.5) });
    text(ctx, 'wherever A itself is not collinear', RIGHT, 412, { ...type.note, alpha: seg(t, 26, 27) });
    card(ctx, {
      x: RIGHT,
      y: 480,
      width: 660,
      tag: 'TEST PARTICLE',
      title: 'Left alone, or tied on?',
      body: 'This transport treats B as a test particle that does not push back. If B is tied to A and has to move with it, its mass enters the angular momentum and A turns differently: then the connection to use is the mechanical connection of the whole.',
      accent: BEAD,
      alpha: seg(t, 31, 31.8),
      progress: lin(t, 31.4, 37.5),
    });
  },
});

/** The two beads of B and the stick between them. */
function drawPair(ctx, cam, beads, alpha) {
  drawStick(ctx, cam, beads[0], beads[1], { alpha });
  beads.forEach((p) => drawBead(ctx, cam, p, { alpha, radius: 0.27 }));
  const q = cam.project(beads[1]);
  text(ctx, 'B', q.x + 22, q.y + 10, { font: font.display, italic: true, size: 30, color: BEAD, alpha });
}

/** A's loop of shapes: rotor angle φ to the right, bend β upwards. */
function drawInset(ctx, t, tau) {
  const a = fade(t, 2, 3, 23.4, 24);
  if (a <= 0) return;
  const { x, y, w, h } = INSET;
  const X = (phi) => x + 30 + (phi / (2 * LOOP.phi)) * (w - 60);
  const Y = (beta) => y + h / 2 - (beta / LOOP.beta) * (h / 2 - 16);
  ctx.save();
  ctx.globalAlpha = a;
  text(ctx, 'A’s loop in its own shape space', x, y - 18, { size: 18, weight: 500 });
  line(ctx, x + 30, y, x + 30, y + h);
  line(ctx, x + 30, Y(0), x + w, Y(0));
  text(ctx, 'rotor φ →', x + w, Y(0) + 24, { ...type.note, size: 14, align: 'right' });
  text(ctx, 'bend β', x + 38, y + 10, { ...type.note, size: 14 });
  ctx.strokeStyle = HORIZONTAL;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const s = i / 120;
    const px = X(LOOP.phi * (1 - Math.cos(2 * Math.PI * s)));
    const py = Y(LOOP.beta * Math.sin(2 * Math.PI * s));
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  dot(ctx, X(LOOP.phi * (1 - Math.cos(2 * Math.PI * tau))), Y(LOOP.beta * Math.sin(2 * Math.PI * tau)), 7, color.ink, a);
}
