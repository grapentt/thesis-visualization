import {
  defineScene, seg, fade, lerp, text, wrap, type, color, axisColor, axisName, SUBSCRIPT, tex,
  drawMolecule, moleculeCamera, molecule, drawAxisTriad, columnVector,
} from '../../../kit.js';
import { COLUMN_SLOTS, COLUMN_TOP, drawStackedConfiguration } from '../../common/configuration.js';

const STACK_START = 11.2;
const POINT = tex(String.raw`x = (x_1, y_1, z_1, \dots, x_N, y_N, z_N) \in \mathbb{R}^{3N}`, 'x = (x₁, y₁, z₁, …, x_N, y_N, z_N) ∈ ℝ³ᴺ');
const ATOMS = [0, 1, 2, 3, 4];

export default defineScene({
  name: 'Configuration',
  duration: 22,
  narration:
    'A molecule is a set of numbered atoms. Each atom sits at a point of three-dimensional space, so it carries three coordinates. Stacked together, these 3N numbers describe the whole configuration: one point x in ℝ³ᴺ.',
  header: { eyebrow: '01 · THE SPACE WE WORK ON', title: 'A configuration is a point in ℝ³ᴺ' },

  draw(ctx, t) {
    const stack = Math.max(0, t - STACK_START);
    const toSide = seg(t, 5, 6.2);
    const toCorner = seg(stack, 0.2, 2.2);
    const cam = moleculeCamera({
      cx: lerp(lerp(800, 480, toSide), 300, toCorner),
      cy: lerp(520, 540, toCorner),
      scale: lerp(160, 118, toCorner),
      yaw: 0.5 + 0.5 * (1 - seg(t, 0, 5)),
    });
    const X = molecule.positions;
    drawMolecule(ctx, X, cam, {
      atomAlpha: ATOMS.map((i) => seg(t, 0.4 + 0.25 * i, 0.8 + 0.25 * i)),
      bondProgress: molecule.bonds.map((_, b) => seg(t, 1.8 + 0.3 * b, 2.3 + 0.3 * b)),
      atomScale: ATOMS.map((i) => seg(t, 3 + 0.12 * i, 4 + 0.12 * i)),
    });

    // each atom in turn: its axes, then its three coordinates
    if (t < STACK_START) {
      for (const i of ATOMS) {
        const focus = fade(t, 5.8 + i, 6.2 + i, 6.7 + i, 7.1 + i);
        if (focus > 0) drawAxisTriad(ctx, cam, molecule.atom(X, i), { length: 0.7 * focus, labelAlpha: focus, head: 11, labelSize: 24 });
        const rows = [0, 1, 2].map((k) => ({ symbol: axisName[k] + SUBSCRIPT[i + 1], value: X[3 * i + k], color: axisColor[k], highlight: focus }));
        columnVector(ctx, COLUMN_SLOTS[i], COLUMN_TOP, rows, { alpha: seg(t, 6 + i, 6.6 + i), label: `r${SUBSCRIPT[i + 1]}` });
      }
      text(ctx, 'every atom: a point in 3D, three coordinates (Å)', 1180, 470, { ...type.note, align: 'center', alpha: seg(t, 6, 7) });
    } else {
      drawStackedConfiguration(ctx, stack, X);
    }

    POINT.draw(ctx, 1000, 460, { size: 30, alpha: seg(t, 16, 17) });
    wrap(ctx, 'One configuration of N atoms is one point of ℝ³ᴺ. Here N = 5, so 15 numbers.', 1000, 540, 540, 32, {
      ...type.body,
      alpha: seg(t, 16.6, 17.6),
    });
  },
});
