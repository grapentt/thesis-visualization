import {
  defineScene, seg, fade, lerp, text, wrap, type, color, axisColor, axisName, SUBSCRIPT, tex,
  drawMolecule, drawAxisTriad, columnVector,
} from '../../../kit.js';
import { ELEMENTS } from '../../../model/molecule.js';
import { COLUMN_SLOTS, COLUMN_TOP, drawStackedConfiguration } from '../../common/configuration.js';
import { nitro, X0, nitroCamera } from '../shared.js';

const STACK_START = 10.5;
const BEADS = [0, 1, 2, 3, 4];
const POINT = tex(String.raw`x = (x_1, y_1, z_1, \dots, x_N, y_N, z_N) \in \mathbb{R}^{3N}`, 'x = (x₁, y₁, z₁, …, x_N, y_N, z_N) ∈ ℝ³ᴺ');
const beadColor = (i) => ELEMENTS[nitro.elements[i]].color;

export default defineScene({
  name: 'Configuration',
  duration: 21,
  narration:
    'Label every bead of the molecule with its three coordinates. Our example is nitroethane, with the CH₃ and CH₂ groups drawn as single beads. Stacked together, the 3N numbers describe the whole configuration: one point x of ℝ³ᴺ.',
  header: { eyebrow: '01 · CONFIGURATIONS', title: 'Every bead is a point of ℝ³' },

  draw(ctx, t) {
    const stack = Math.max(0, t - STACK_START);
    const toSide = seg(t, 4, 5.2);
    const toCorner = seg(stack, 0.2, 2.2);
    const cam = nitroCamera({
      cx: lerp(lerp(800, 480, toSide), 300, toCorner),
      cy: lerp(500, 540, toCorner),
      scale: lerp(170, 118, toCorner),
      yaw: 0.25 + 0.4 * (1 - seg(t, 0, 4)),
      pitch: 0.25,
    });
    drawMolecule(ctx, X0, cam, {
      molecule: nitro,
      atomAlpha: BEADS.map((i) => seg(t, 0.3 + 0.25 * i, 0.7 + 0.25 * i)),
      bondProgress: nitro.bonds.map((_, b) => seg(t, 1.5 + 0.3 * b, 2 + 0.3 * b)),
    });
    text(ctx, 'CH₃ and CH₂ drawn as single beads (united atoms)', 800, 760, { ...type.note, align: 'center', alpha: fade(t, 2.2, 3, 3.8, 4.4) });

    if (t < STACK_START) {
      for (const i of BEADS) {
        const focus = fade(t, 5 + i, 5.3 + i, 5.8 + i, 6.1 + i);
        if (focus > 0) drawAxisTriad(ctx, cam, nitro.atom(X0, i), { length: 0.7 * focus, labelAlpha: focus, head: 11, labelSize: 24 });
        const rows = [0, 1, 2].map((k) => ({ symbol: axisName[k] + SUBSCRIPT[i + 1], value: X0[3 * i + k], color: axisColor[k], highlight: focus }));
        columnVector(ctx, COLUMN_SLOTS[i], COLUMN_TOP, rows, { alpha: seg(t, 5.1 + i, 5.6 + i), label: `r${SUBSCRIPT[i + 1]}` });
      }
      text(ctx, 'every bead: a point of ℝ³, three coordinates (Å)', 1180, 470, { ...type.note, align: 'center', alpha: seg(t, 5, 6) });
    } else {
      drawStackedConfiguration(ctx, stack, X0, beadColor);
    }

    POINT.draw(ctx, 1000, 460, { size: 30, alpha: seg(t, 15, 16) });
    wrap(ctx, 'One configuration of N beads is one point of ℝ³ᴺ. Here N = 5, so 15 numbers.', 1000, 540, 540, 32, { ...type.body, alpha: seg(t, 15.6, 16.6) });
  },
});
