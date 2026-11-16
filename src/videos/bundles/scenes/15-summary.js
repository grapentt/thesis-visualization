import { defineScene, seg, text, wrap, type, font, color, dot, drawMolecule } from '../../../kit.js';
import { rotation } from '../../../kit.js';
import { nitro, X0, nitroCamera, turnRotor, rotate, drawRotorCircle, VERTICAL, HORIZONTAL, ROTOR } from '../shared.js';
import { BEAD } from '../beads.js';

const POINTS = [
  [VERTICAL, 'One space, many bundles.', 'Every free group action makes a principal bundle: the orientation SO(3), the rotor U(1) and both together live on the same configuration space.'],
  [color.ink, 'A section is a zero for the fibre.', 'Canonical for translations (the centre of mass); the torsion angle for the rotor on reasonable shapes, none on all of them; no global body frame for four or more beads.'],
  [BEAD, 'Associated bundles: space as the molecule sees it.', 'The beads are its sections, and the shape space of a whole molecule is a bundle over the shape space of a part.'],
  [ROTOR, 'One point fixes a frame only up to its stabiliser.', 'Two beads for SO(3), one lip off the axis for the rotor: not a matter of global versus local.'],
  [HORIZONTAL, 'Noise feels the curvature.', 'Random loops of shapes rotate the molecule by zero on average and by (t²/12)|Ω|² in mean square: the curvature that makes shape space more curved than configuration space.'],
];

export default defineScene({
  name: 'Summary',
  duration: 30,
  narration:
    'To sum up. One configuration space carries many bundles, one for every free symmetry. A section is a choice of zero on the fibres; only translations have a canonical one. Associated bundles are space as the molecule sees it: its beads are their sections, and the shape space of a whole is a bundle over the shape space of a part. One point fixes a frame only up to its stabiliser. And random shape changes feel the curvature: their rotation averages to zero, but its mean square is the curvature, squared.',
  header: { eyebrow: '15 · SUMMARY', title: 'What we have seen' },

  draw(ctx, t) {
    POINTS.forEach(([tint, head, body], k) => {
      const y = 250 + k * 118;
      const a = seg(t, 1 + 2.4 * k, 1.8 + 2.4 * k);
      dot(ctx, 112, y - 8, 7, tint, a);
      text(ctx, head, 140, y, { ...type.display, size: 27, alpha: a });
      wrap(ctx, body, 140, y + 34, 820, 26, { ...type.body, size: 18, color: color.muted, alpha: a });
    });
    const cam = nitroCamera({ cx: 1300, cy: 470, scale: 120, yaw: 0.5, pitch: 0.32 });
    const X = rotate(turnRotor(X0, 0.5 * t), rotation.axisAngle([0.2, 1, 0.1], 0.06 * t));
    drawRotorCircle(ctx, cam, X, { alpha: 0.6 * seg(t, 0.5, 2) });
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: seg(t, 0.5, 2), labels: 0 });
    text(ctx, 'the rigorous statements and proofs are in docs/many-bundles.md', 140, 860, { font: font.mono, size: 14, color: color.dim, alpha: seg(t, 14, 15) });
  },
});
