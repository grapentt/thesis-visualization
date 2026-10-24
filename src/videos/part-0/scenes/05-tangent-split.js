import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, tex, arrow, dot, ring,
  drawMolecule, moleculeCamera, molecule,
} from '../../../kit.js';
import { VERTICAL, HORIZONTAL, centroidOf } from '../shared.js';
import { MOLECULE_TANGENTS, tangentColor, displaced, drawAtomArrows } from '../tangent.js';

const X0 = molecule.positions;
const BASE = { x: 1130, y: 400 }; // where x sits in the sketch of configuration space
const V_DIR = [0, -1]; // the vertical direction in the sketch
const H_DIR = [0.97, 0.24]; // a horizontal direction in the sketch
const PHASE_START = 6;
const PHASE_LENGTH = 3.6;

const VERTICAL_SPACE = tex(
  String.raw`V_x = \{(v + \omega \times x_i)_{i=1,\dots,N} : v, \omega \in \mathbb{R}^3\} \cong \mathfrak{se}(3)`,
  'V_x = {(v + ω × xᵢ)ᵢ : v, ω ∈ ℝ³} ≅ 𝔰𝔢(3)',
);
const SPLIT = tex(String.raw`T_x\mathbb{R}^{3N} = V_x \oplus H_x, \qquad 3N = 6 + (3N - 6)`, 'T_xℝ³ᴺ = V_x ⊕ H_x,   3N = 6 + (3N − 6)');

export default defineScene({
  name: 'Tangent space',
  duration: 40,
  narration:
    'Small changes of a configuration x are tangent vectors at x: one small arrow on every atom. Together they form the tangent space at x, a copy of ℝ³ᴺ attached to x. Some of them only translate or rotate the molecule: they generate the symmetries and are called vertical. Others really change the shape: horizontal. The tangent space splits as a direct sum of the two.',
  header: { eyebrow: '02 · THE TANGENT SPACE SPLITS', title: 'Small changes of x live in the tangent space at x' },

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 400, cy: 470, scale: 150 });
    const phase = Math.floor((t - PHASE_START) / PHASE_LENGTH);
    const active = phase >= 0 && phase < MOLECULE_TANGENTS.length ? MOLECULE_TANGENTS[phase] : null;
    const local = t - PHASE_START - phase * PHASE_LENGTH;
    const show = active ? fade(local, 0, 0.4, PHASE_LENGTH - 0.4, PHASE_LENGTH) : 0;
    const wiggle = active ? 0.35 * Math.sin((2 * Math.PI * lin(local, 0.4, PHASE_LENGTH - 0.4)) * 1) * seg(local, 0.3, 0.6) : 0;

    const X = active ? displaced(X0, active.vectors, wiggle) : X0;
    drawMolecule(ctx, X, cam, { opacity: seg(t, 0, 0.8) });
    if (active) drawAtomArrows(ctx, cam, X, active.vectors, { color: tangentColor(active.kind), alpha: show });

    drawSketch(ctx, t, cam, phase, show);

    // phase caption under the molecule
    if (active) {
      const tint = tangentColor(active.kind);
      text(ctx, active.label, 400, 770, { font: font.mono, size: 19, color: tint, align: 'center', alpha: show });
      const kind = active.kind === 'vertical' ? 'vertical: generates a symmetry, U does not change' : 'horizontal: changes the shape itself';
      text(ctx, kind, 400, 802, { ...type.note, align: 'center', alpha: show });
    }
    wrap(ctx, 'A tangent vector at x is one small arrow on every atom.', 120, 770, 560, 30, { ...type.body, alpha: fade(t, 3.4, 4.2, 5.6, 6) });

    // summary
    const s = (from) => seg(t, from, from + 1);
    text(ctx, 'Directions that only move the molecule rigidly are vertical motions.', 900, 660, { ...type.body, size: 21, color: VERTICAL, alpha: s(28) });
    VERTICAL_SPACE.draw(ctx, 900, 708, { size: 25, alpha: s(29) });
    text(ctx, 'the infinitesimal generators of SE(3): its Lie algebra 𝔰𝔢(3), acting at x', 900, 748, { ...type.note, alpha: s(29.6) });
    text(ctx, 'Real shape changes span a complement, the horizontal subspace H_x.', 900, 784, { ...type.body, size: 21, color: HORIZONTAL, alpha: s(31) });
    SPLIT.draw(ctx, 900, 840, { size: 30, alpha: s(32.5) });
    text(ctx, 'Which complement exactly is a choice: a connection (section 04).', 120, 840, { ...type.note, alpha: s(34) });
  },
});

/** Configuration space near x: the orbit through x, the tangent plane at x, the vectors. */
function drawSketch(ctx, t, cam, phase, show) {
  const a = seg(t, 0.6, 1.8);
  if (a <= 0) return;
  const { x, y } = BASE;
  ctx.save();
  ctx.globalAlpha = a;

  // tangent plane, sketched as a parallelogram
  const hu = [H_DIR[0] * 210, H_DIR[1] * 210];
  const vu = [V_DIR[0] * 150, V_DIR[1] * 150];
  ctx.fillStyle = rgba(color.ink, 0.06);
  ctx.strokeStyle = rgba(color.ink, 0.35);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - hu[0] - vu[0], y - hu[1] - vu[1]);
  ctx.lineTo(x + hu[0] - vu[0], y + hu[1] - vu[1]);
  ctx.lineTo(x + hu[0] + vu[0], y + hu[1] + vu[1]);
  ctx.lineTo(x - hu[0] + vu[0], y - hu[1] + vu[1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  text(ctx, 'T_xℝ³ᴺ ≅ ℝ³ᴺ', x + hu[0] - 10, y + hu[1] + vu[1] - 14, { ...type.math, size: 26, align: 'right' });
  text(ctx, '15-dimensional, sketched as a plane', x + hu[0] - 10, y + hu[1] - vu[1] + 28, { ...type.note, size: 14, align: 'right' });

  // the orbit SE(3)·x through x: the vertical direction is tangent to it
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const s = -1.25 + (2.5 * i) / 60;
    const px = x + 80 * s * s;
    const py = y - 180 * s;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, 'orbit SE(3) · x', x + 118, y - 205, { ...type.note, color: VERTICAL });
  ctx.restore();

  // the thread from the molecule to the point x it is
  const c = cam.project(centroidOf(molecule.positions));
  const thread = seg(t, 1.6, 2.8);
  ctx.save();
  ctx.globalAlpha = thread;
  ctx.strokeStyle = color.gold;
  ctx.setLineDash([3, 7]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(c.x + 150, c.y - 20);
  ctx.bezierCurveTo(c.x + 360, c.y - 150, x - 260, y + 40, x - 14, y + 4);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'x = this configuration', 690, 342, { ...type.note, color: color.gold, alpha: thread });
  dot(ctx, x, y, 8, color.ink, a);
  ring(ctx, x, y, 14, color.gold, a);
  text(ctx, 'x', x - 26, y + 26, { ...type.math, alpha: a });

  // tangent vectors at x: earlier ones faint, the current one bright
  MOLECULE_TANGENTS.forEach((g, i) => {
    if (i > phase) return;
    const vertical = g.kind === 'vertical';
    const spread = vertical ? [0, 14, -14, 28][i] ?? 0 : [0, 0, 0, 0, -18, 18][i];
    const dir = vertical ? V_DIR : H_DIR;
    const length = vertical ? 110 - 12 * i : 150;
    const ox = vertical ? spread : 0;
    const oy = vertical ? 0 : spread;
    const alpha = i === phase ? Math.max(0.3, show) : 0.3;
    arrow(ctx, x + ox, y + oy, x + ox + dir[0] * length, y + oy + dir[1] * length, { color: tangentColor(g.kind), width: i === phase ? 4 : 2.5, head: 13, alpha: alpha * a });
  });
}
