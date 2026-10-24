import { defineScene, seg, fade, text, type, color, drawMolecule, moleculeCamera, molecule } from '../../../kit.js';

const ATOMS = [0, 1, 2, 3, 4];

export default defineScene({
  name: 'Molecule',
  duration: 11,
  narration: 'Start with a small molecule: five atoms, numbered 1 to 5, held together by bonds.',
  header: { eyebrow: '01 · THE OBJECT', title: 'A molecule is a handful of numbered points' },

  draw(ctx, t) {
    // the camera settles while the molecule assembles: points → bonds → spheres
    const cam = moleculeCamera({ cx: 800, cy: 520, scale: 160, yaw: 0.5 + 0.8 * (1 - seg(t, 0, 11)) });
    drawMolecule(ctx, molecule.positions, cam, {
      atomAlpha: ATOMS.map((i) => seg(t, 0.8 + 0.45 * i, 1.2 + 0.45 * i)),
      bondProgress: molecule.bonds.map((_, b) => seg(t, 3.2 + 0.5 * b, 3.8 + 0.5 * b)),
      atomScale: ATOMS.map((i) => seg(t, 5.2 + 0.18 * i, 6.6 + 0.18 * i)),
    });

    text(ctx, 'N = 5 atoms · each one is a point in 3D space', 800, 835, {
      ...type.body,
      color: color.muted,
      align: 'center',
      alpha: fade(t, 8, 9, 10.3, 10.9),
    });
  },
});
