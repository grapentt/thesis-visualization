import {
  defineScene, seg, fade, lin, text, wrap, curvedText, type, font, color, tex, drawMolecule, moleculeCamera, molecule,
} from '../../../kit.js';
import { MOLECULE_TANGENTS, tangentColor, displaced, drawAtomArrows } from '../tangent.js';

const BUNDLE = tex(String.raw`SE(3) \hookrightarrow \mathbb{R}^{3N} \xrightarrow{\;\pi\;} \mathbb{R}^{3N}/SE(3) = M`, 'SE(3) ↪ ℝ³ᴺ →π ℝ³ᴺ/SE(3) = M');
const SPLIT = tex(String.raw`T_x\mathbb{R}^{3N} = V_x \oplus H_x`, 'T_xℝ³ᴺ = V_x ⊕ H_x');
const START = 1.5;
const LENGTH = 2.2;

export default defineScene({
  name: 'Shape-space bundle',
  duration: 22,
  narration:
    'Back to molecules. Configuration space is a bundle over shape space, with the rigid motions as fibres. At every configuration, translations and rotations are vertical, real shape changes horizontal, with the mechanical connection: zero momentum. Unlike on the torus, this horizontal distribution is not integrable. The shape-space bundle has curvature.',
  header: { eyebrow: '06 · OUR SHAPE-SPACE BUNDLE', title: 'Back to molecules' },

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 400, cy: 470, scale: 150 });
    const i = Math.floor((t - START) / LENGTH);
    const g = i >= 0 && i < MOLECULE_TANGENTS.length ? MOLECULE_TANGENTS[i] : null;
    const local = t - START - i * LENGTH;
    const show = g ? fade(local, 0, 0.3, LENGTH - 0.3, LENGTH) : 0;
    const X = g ? displaced(molecule.positions, g.vectors, 0.3 * Math.sin(2 * Math.PI * lin(local, 0.2, LENGTH - 0.2))) : molecule.positions;
    drawMolecule(ctx, X, cam);
    if (g) {
      drawAtomArrows(ctx, cam, X, g.vectors, { color: tangentColor(g.kind), alpha: show });
      text(ctx, g.label, 400, 770, { font: font.mono, size: 19, color: tangentColor(g.kind), align: 'center', alpha: show });
      text(ctx, g.kind, 400, 802, { ...type.note, align: 'center', alpha: show });
    }

    BUNDLE.draw(ctx, 960, 270, { size: 30, alpha: seg(t, 1, 2) });
    text(ctx, 'the shape-space bundle (away from degenerate configurations)', 960, 314, { ...type.note, alpha: seg(t, 1.4, 2.4) });
    SPLIT.draw(ctx, 960, 382, { size: 30, alpha: seg(t, 3, 4) });
    text(ctx, 'V_x: rigid motions, 𝔰𝔢(3)     H_x = V_x^⊥: zero momentum', 960, 424, { ...type.note, alpha: seg(t, 3.5, 4.5) });

    wrap(ctx, 'Unlike on the torus, the horizontal distribution of this bundle is not integrable. The shape-space bundle has', 960, 520, 580, 32, {
      ...type.body,
      alpha: seg(t, 15, 16),
    });
    curvedText(ctx, 'curvature', 1230, 650, 1.3 * seg(t, 17, 19), { font: font.display, italic: true, weight: 500, size: 66, color: color.gold, alpha: seg(t, 16, 17) });
  },
});
