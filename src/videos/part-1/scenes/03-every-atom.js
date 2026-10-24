import {
  defineScene, seg, fade, lerp, clamp, oscillate, text, type, color, axisColor, axisName, SUBSCRIPT,
  drawMolecule, moleculeCamera, molecule, drawAxisTriad, columnVector,
} from '../../../kit.js';
import { COLUMN_SLOTS, COLUMN_TOP } from '../../common/configuration.js';

/** Atoms 2 and 3 wiggle along x, y, z in turn, 1.2 s per axis, starting at these times. */
const WIGGLES = [
  { atom: 1, start: 1.8 },
  { atom: 2, start: 6.6 },
];

export default defineScene({
  name: 'Every atom',
  duration: 14,
  continues: true,
  narration: 'Every other atom works the same way. Each contributes three coordinates of its own.',
  header: { eyebrow: '03 · EVERY ATOM', title: 'Each atom adds three more numbers' },

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 480, cy: 520, scale: 160 });

    // which atom is in focus: atom 1 hands over to 2, then 3, then 4 and 5 together
    const f1 = fade(t, 0.6, 1.2, 5.4, 5.9);
    const f2 = fade(t, 5.6, 6.1, 10.2, 10.7);
    const f45 = fade(t, 10.6, 11.0, 12.4, 13.2);
    const f0 = 1 - seg(t, 0, 0.8);
    const focus = [f0, f1, f2, f45, f45];
    const dim = Math.max(...focus);
    const atomAlpha = focus.map((f) => clamp(1 - 0.82 * dim + 0.82 * f));
    const highlight = f1 > 0.5 ? 1 : f2 > 0.5 ? 2 : f45 > 0.5 ? [3, 4] : f0 > 0.5 ? 0 : -1;

    const X = molecule.positions.slice();
    let movingAtom = -1;
    let movingAxis = -1;
    for (const { atom, start } of WIGGLES) {
      for (let k = 0; k < 3; k++) {
        const a = start + 1.2 * k;
        if (t >= a && t < a + 1.2) {
          X[3 * atom + k] += 0.35 * oscillate(t, a, a + 1.2);
          movingAtom = atom;
          movingAxis = k;
        }
      }
    }
    drawMolecule(ctx, X, cam, { atomAlpha, highlight, highlightAlpha: dim });

    for (const [atom, f] of [[1, f1], [2, f2]]) {
      if (f <= 0) continue;
      drawAxisTriad(ctx, cam, molecule.atom(molecule.positions, atom), {
        length: 0.8 * f,
        active: movingAtom === atom ? movingAxis : -1,
        labelAlpha: f,
        head: 12,
        labelSize: 26,
      });
    }

    const columnX = [lerp(1160, COLUMN_SLOTS[0], seg(t, 0, 1)), ...COLUMN_SLOTS.slice(1)];
    const columnAlpha = [1, seg(t, 1.4, 2.2), seg(t, 6.2, 7.0), seg(t, 10.8, 11.5), seg(t, 11.2, 11.9)];
    for (let i = 0; i < 5; i++) {
      const rows = [0, 1, 2].map((k) => ({
        symbol: axisName[k] + SUBSCRIPT[i + 1],
        value: X[3 * i + k],
        color: axisColor[k],
        highlight: movingAtom === i && movingAxis === k ? 1 : 0,
      }));
      columnVector(ctx, columnX[i], COLUMN_TOP, rows, { alpha: columnAlpha[i], label: `r${SUBSCRIPT[i + 1]}` });
    }
    text(ctx, 'coordinates in Å', 1180, 470, { ...type.note, align: 'center' });
    text(ctx, '5 atoms × 3 coordinates = 15 numbers', 1180, 580, { ...type.body, size: 24, align: 'center', alpha: seg(t, 11.8, 12.6) });
  },
});
