import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, tex, arrow3, drawMolecule, polyline3, rotation, vec3, formatNumber,
} from '../../../kit.js';
import { nitro, X0, nitroCamera, rotate, centreOfMass, VERTICAL } from '../shared.js';
import { drawBead, BEAD } from '../beads.js';

const COM = centreOfMass(X0);
const V0 = vec3.add(COM, [0.5, -1.55, 1.0]); // the extra bead, at the start
const AXIS = vec3.normalize([0.25, 1, 0.3]);
const RIGHT = 860;
const TOGETHER = [2.5, 9.5];
const RELATIVE = [10.5, 17.5];
const SECTIONS = 19;
const FRAME = 33;

const ASSOCIATED = tex(String.raw`E = X \times_{SO(3)} \mathbb{R}^3 = (X \times \mathbb{R}^3)\,/\,(x, v) \sim (R\cdot x,\, R v)`, 'E = X ×_SO(3) ℝ³ = (X × ℝ³) / (x, v) ∼ (R·x, Rv)');
const TAUTOLOGICAL = tex(String.raw`s_i([x]) = [x, x_i] = [R\cdot x,\, R x_i]`, 's_i([x]) = [x, x_i] = [R·x, R x_i]');
const RECONSTRUCT = tex(String.raw`x_i = R\, q_i, \qquad R \in SO(3),\; q_i \in \mathbb{R}^3`, 'x_i = R q_i,   R ∈ SO(3), q_i ∈ ℝ³');

/** Body frame of X from beads 2, 3 and 1 (Gram–Schmidt), as columns e₁, e₂, e₃. */
function bodyFrame(X) {
  const c2 = nitro.atom(X, 1);
  const e1 = vec3.normalize(vec3.sub(nitro.atom(X, 2), c2));
  const a = vec3.sub(nitro.atom(X, 0), c2);
  const e2 = vec3.normalize(vec3.sub(a, vec3.scale(e1, vec3.dot(a, e1))));
  return [e1, e2, vec3.cross(e1, e2)];
}

/** Where the bead sits relative to the molecule: a little tour during the second part. */
function relativeOffset(t) {
  const u = lin(t, ...RELATIVE);
  const s = Math.sin(Math.PI * u);
  return [0.9 * s * Math.sin(2 * Math.PI * u), 0.7 * s, -0.6 * s * Math.cos(Math.PI * u) + 0.6 * s];
}

export default defineScene({
  name: 'Associated bundle',
  duration: 46,
  narration:
    'SO(3) acts on ℝ³, and that is why it is the symmetry: every bead lives in ℝ³. Put an extra bead next to the molecule and rotate both together: as far as shapes go nothing has changed. All these pairs are one point of the associated bundle E. Moving the bead relative to the molecule gives another point of the same fibre: the fibre is a copy of ℝ³, space as the molecule sees it. The beads of the molecule are points of E too, the same for every orientation: five sections, and the molecule is built from them. Conversely, an orientation and N vectors of ℝ³ give back a configuration.',
  header: { eyebrow: '08 · ASSOCIATED BUNDLES', title: 'Space, as the molecule sees it' },

  draw(ctx, t) {
    const cam = nitroCamera({ cx: 420, cy: 470, scale: 150, yaw: 0.6, pitch: 0.3 });
    const angle = 1.5 * Math.sin(Math.PI * lin(t, ...TOGETHER));
    const R = rotation.axisAngle(AXIS, angle);
    const X = rotate(X0, R, COM);
    const v = vec3.add(rotation.apply(R, vec3.sub(V0, COM)), vec3.add(COM, relativeOffset(t)));

    drawLattice(ctx, cam, R, fade(t, RELATIVE[0] - 0.5, RELATIVE[0] + 0.5, SECTIONS - 1, SECTIONS));
    const moving = Math.abs(angle) > 0.01;
    drawMolecule(ctx, X0, cam, { molecule: nitro, ghost: color.muted, opacity: moving ? 0.45 : 0, labels: 0 });
    if (moving) drawBead(ctx, cam, V0, { ghost: true });

    const sectionIndex = Math.floor((t - SECTIONS - 1) / 2.4);
    const highlight = sectionIndex >= 0 && sectionIndex < 5 ? sectionIndex : -1;
    drawMolecule(ctx, X, cam, {
      molecule: nitro,
      opacity: seg(t, 0, 0.8),
      labels: 0.8,
      highlight: highlight >= 0 ? highlight : [],
      highlightColor: BEAD,
      highlightAlpha: 1,
    });
    drawBead(ctx, cam, v, { alpha: seg(t, 1, 1.8) * (1 - seg(t, SECTIONS - 0.6, SECTIONS)), label: 'v' });
    if (highlight >= 0) {
      const p = cam.project(nitro.atom(X, highlight));
      text(ctx, `s${'₁₂₃₄₅'[highlight]}([x]) = [x, x${'₁₂₃₄₅'[highlight]}]`, p.x + 34, p.y - 30, { font: font.display, italic: true, size: 24, color: BEAD });
    }
    drawFrame(ctx, t, cam, X);

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 240) => wrap(ctx, s, RIGHT, y, 660, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Every bead lives in ℝ³, and SO(3) acts on ℝ³. Put an extra bead v next to the molecule and rotate both together: the shape of the pair has not changed.', 1, 9.6);
    note('Move the bead relative to the molecule: another point of the same fibre. The fibre over a shape is a copy of ℝ³, space as the molecule sees it.', 10.2, 18.2);
    note('The beads of the molecule are points of E too, and they do not care how the molecule is oriented: five sections of E. The configuration is built from them.', 18.6, 32.4);
    note('Conversely, an orientation R, a point of the principal fibre, and N vectors qᵢ of ℝ³ give back a configuration.', 33, 46);
    ASSOCIATED.draw(ctx, RIGHT, 400, { size: 24, alpha: seg(t, 5.5, 6.5) * (1 - seg(t, 32, 32.6)) });
    text(ctx, 'pairs (configuration, bead), up to rotating both together', RIGHT, 440, { ...type.note, alpha: seg(t, 6, 7) * (1 - seg(t, 32, 32.6)) });
    TAUTOLOGICAL.draw(ctx, RIGHT, 520, { size: 28, alpha: seg(t, 20, 21) * (1 - seg(t, 32, 32.6)) });
    text(ctx, 'the same for every representative x of the shape [x]: a section of E', RIGHT, 562, { ...type.note, alpha: seg(t, 20.6, 21.6) * (1 - seg(t, 32, 32.6)) });
    RECONSTRUCT.draw(ctx, RIGHT, 400, { size: 30, alpha: seg(t, 35, 36) });
    text(ctx, 'qᵢ: the coordinates of bead i in the molecule’s own frame', RIGHT, 444, { ...type.note, alpha: seg(t, 35.6, 36.6) });
    drawCoordinates(ctx, t, X);
  },
});

/** A faint lattice fixed in the molecule's frame: the fibre ℝ³ of E. */
function drawLattice(ctx, cam, R, alpha) {
  if (alpha <= 0.003) return;
  const at = (p) => vec3.add(rotation.apply(R, p), COM);
  const L = 1.7;
  for (const a of [-1.2, 0, 1.2]) {
    for (const b of [-1.2, 0, 1.2]) {
      polyline3(ctx, cam, [at([-L, a, b]), at([L, a, b])], { color: BEAD, width: 1, alpha: 0.22 * alpha });
      polyline3(ctx, cam, [at([a, -L, b]), at([a, L, b])], { color: BEAD, width: 1, alpha: 0.22 * alpha });
      polyline3(ctx, cam, [at([a, b, -L]), at([a, b, L])], { color: BEAD, width: 1, alpha: 0.22 * alpha });
    }
  }
}

/** The molecule's own frame, drawn at bead 2. */
function drawFrame(ctx, t, cam, X) {
  const a = seg(t, FRAME + 0.5, FRAME + 1.5);
  if (a <= 0) return;
  const origin = nitro.atom(X, 1);
  bodyFrame(X).forEach((e, k) => {
    const tip = arrow3(ctx, cam, origin, vec3.scale(e, 1.1), { color: VERTICAL, width: 3.5, head: 12, alpha: a });
    text(ctx, `e${'₁₂₃'[k]}`, tip.x + 8, tip.y - 8, { ...type.math, size: 22, color: VERTICAL, alpha: a });
  });
  const p = cam.project(origin);
  text(ctx, 'R: the molecule’s frame', p.x - 20, p.y + 54, { ...type.note, color: VERTICAL, align: 'right', alpha: a });
}

/** Body-frame coordinates q_i of the five beads. */
function drawCoordinates(ctx, t, X) {
  const a = seg(t, FRAME + 3, FRAME + 4);
  if (a <= 0) return;
  const frame = bodyFrame(X);
  const c2 = nitro.atom(X, 1);
  const columns = [RIGHT + 150, RIGHT + 260, RIGHT + 370];
  text(ctx, 'bead', RIGHT, 520, { ...type.note, alpha: a });
  ['q₁', 'q₂', 'q₃'].forEach((h, k) => text(ctx, h, columns[k], 520, { ...type.note, align: 'right', alpha: a }));
  for (let i = 0; i < 5; i++) {
    const d = vec3.sub(nitro.atom(X, i), c2);
    const row = seg(t, FRAME + 3.2 + 0.3 * i, FRAME + 4 + 0.3 * i);
    text(ctx, String(i + 1), RIGHT, 556 + 32 * i, { font: font.mono, size: 18, alpha: row });
    frame.forEach((e, k) => text(ctx, formatNumber(vec3.dot(d, e), 2), columns[k], 556 + 32 * i, { font: font.mono, size: 18, align: 'right', alpha: row }));
  }
  wrap(ctx, 'These numbers do not change when the molecule is rotated. Shape space, plus one orientation, is the whole configuration.', RIGHT, 740, 660, 30, {
    ...type.body,
    size: 20,
    color: color.muted,
    alpha: seg(t, FRAME + 6, FRAME + 7),
  });
}
