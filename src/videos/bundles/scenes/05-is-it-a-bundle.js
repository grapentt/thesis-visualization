import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, drawMolecule, polyline3, vec3 } from '../../../kit.js';
import { Molecule } from '../../../model/molecule.js';
import { nitro, X0, nitroCamera, rotorCircle, circlePoint, drawRotorAxis, drawRotorCircle, ROTOR } from '../shared.js';

const RIGHT = 860;
const WIDTH = 660;
const HALF_MOUTH = (62.65 * Math.PI) / 180; // as in shared.js

/** The rest pose with the O–N–O half-angle set to h: h = 0 puts both lips on the axis. */
function withMouth(h) {
  const n = nitro.atom(X0, 2);
  const lip = vec3.length(vec3.sub(nitro.atom(X0, 3), n));
  const X = X0.slice();
  Molecule.setAtom(X, 3, vec3.add(n, [lip * Math.cos(h), lip * Math.sin(h), 0]));
  Molecule.setAtom(X, 4, vec3.add(n, [lip * Math.cos(h), -lip * Math.sin(h), 0]));
  return X;
}

const QA = [
  {
    from: 1,
    q: 'IS THE ROTOR REALLY A BUNDLE?',
    a: 'Yes, wherever at least one lip is off the axis. There U(1) acts freely, and a free action of a compact group always makes a principal bundle. If both lips sit on the axis, their circle shrinks to a point: we leave those configurations out, as we did with collinear molecules for SO(3).',
  },
  {
    from: 13,
    q: 'OVER WHAT? A COARSE-GRAINED MOLECULE?',
    a: 'The base keeps beads 1–3, each lip’s height along the axis and distance from it, and the angle between the lips: the lips become rings with a relative phase. It has 3N − 1 dimensions, never a multiple of 3, so it is never the configuration space of fewer beads.',
  },
  {
    from: 26,
    q: 'MUST THE ENERGY BE INVARIANT?',
    a: 'Not for the bundle: that needs only the motion. Invariance is what lets the energy live on the base. For SO(3) it is exact. For the NO₂ of nitromethane it nearly is: a barrier of about 2 cm⁻¹ against a thermal energy of about 200 cm⁻¹.',
  },
  {
    from: 37,
    q: 'DOES IT SPLIT?',
    a: 'Locally, yes: near any configuration, X looks like (base) × U(1) once you say where the angle 0 is. But there is no canonical choice, and over all configurations not even a continuous one. That is a statement about sections, the next scene.',
  },
];

export default defineScene({
  name: 'Is it a bundle?',
  duration: 50,
  narration:
    'Is the rotor really a bundle? Yes, wherever at least one lip is off the axis: there the circle acts freely, and a free action of a compact group always gives a principal bundle. If both lips lie on the axis their circle shrinks to a point, and we leave those configurations out. The base keeps everything except the rotor angle: picture the lips smeared into rings. That is coarser, but it has 3N minus 1 dimensions, so it is never the configuration space of fewer beads. The energy need not be invariant for the bundle to exist; invariance is what lets the energy live on the base. And locally the space splits as base times circle, but there is no canonical way to do it, and globally no continuous way: that is a question about sections.',
  header: { eyebrow: '05 · QUESTIONS', title: 'Is the rotor really a bundle?' },

  draw(ctx, t) {
    const cam = nitroCamera({ cx: 400, cy: 480, scale: 165, yaw: 0.78, pitch: 0.36 });
    const closing = seg(t, 3.5, 7) - seg(t, 9, 11.5);
    const X = withMouth(HALF_MOUTH * (1 - closing));
    const ring = fade(t, 13.5, 15.5, 25, 26.5);

    drawRotorAxis(ctx, cam, X, { alpha: seg(t, 0.5, 1.5) * 0.9, after: 2.1 });
    if (closing < 0.995) drawRotorCircle(ctx, cam, X, { alpha: seg(t, 0.5, 1.5) * (1 - ring), width: 2.5 });
    drawSmearedLips(ctx, cam, ring);
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: seg(t, 0, 0.8), labels: 0.8, atomAlpha: [1, 1, 1, 1 - ring, 1 - ring] });

    const tip = cam.project(vec3.add(nitro.atom(X, 2), [1.25, 0, 0]));
    text(ctx, 'both lips on the axis: the circle is a point', tip.x - 40, tip.y + 70, { ...type.note, color: ROTOR, align: 'center', alpha: fade(t, 6.4, 7, 9, 9.6) });
    text(ctx, 'a point of the base: the lips somewhere on this ring', 400, 800, { ...type.note, color: ROTOR, align: 'center', alpha: ring });
    text(ctx, 'Beads are labelled: the two O count as different, so turning by 180° is a new configuration.', 80, 870, { ...type.note, size: 13, alpha: seg(t, 3, 4) });

    QA.forEach(({ from, q, a }, k) => {
      const next = QA[k + 1]?.from ?? Infinity;
      const dim = t >= next ? 0.4 : 1;
      const shown = seg(t, from, from + 0.6);
      const y = 230 + k * 160;
      text(ctx, q, RIGHT, y, { font: font.mono, size: 15, weight: 500, color: color.gold, tracking: 1.5, alpha: shown * dim });
      wrap(ctx, a, RIGHT, y + 32, WIDTH, 27, { ...type.body, size: 19, alpha: shown * dim, chars: Math.floor(lin(t, from + 0.4, from + 6) * a.length) });
    });
  },
});

/** The lips smeared into a ring: they are somewhere on it, opposite each other. */
function drawSmearedLips(ctx, cam, alpha) {
  if (alpha <= 0.003) return;
  const circle = rotorCircle(X0);
  drawRotorCircle(ctx, cam, X0, { alpha: 0.35 * alpha, width: 16 });
  drawRotorCircle(ctx, cam, X0, { alpha, width: 2.5 });
  for (let k = 0; k < 12; k++) {
    const s = (k * Math.PI) / 12;
    polyline3(ctx, cam, [circlePoint(circle, s), circlePoint(circle, s + Math.PI)], { color: ROTOR, width: 1.2, alpha: 0.28 * alpha });
  }
  const c = cam.project(circle.centre);
  const top = cam.project(circlePoint(circle, 0));
  text(ctx, 'O, O', lerp(c.x, top.x, 1.25) + 18, lerp(c.y, top.y, 1.25), { ...type.label, color: ROTOR, alpha });
}
