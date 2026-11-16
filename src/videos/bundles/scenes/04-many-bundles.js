import { defineScene, seg, fade, lerp, text, wrap, type, font, color, tex, arrow, drawMolecule, rotation } from '../../../kit.js';
import { nitro, X0, nitroCamera, rotate, turnRotor, centreOfMass, VERTICAL, ROTOR } from '../shared.js';

const R = rotation.axisAngle([0.2, 1, 0.35], 1.25);
const PHI = Math.PI / 2;
const COM = centreOfMass(X0);
const CORNERS = { x: [230, 330], rx: [640, 330], gx: [230, 650], both: [640, 650] };
const SIZE = 52;

const NODES = {
  top: { at: [1190, 260], formula: tex(String.raw`X = \mathbb{R}^{3N}_{\text{centred}}`, 'X = ℝ³ᴺ (centred)') },
  left: { at: [960, 470], formula: tex(String.raw`X/U(1)`, 'X/U(1)') },
  right: { at: [1420, 470], formula: tex(String.raw`M = X/SO(3)`, 'M = X/SO(3)') },
  bottom: { at: [1190, 690], formula: tex(String.raw`X/(SO(3)\times U(1)) = M/U(1)`, 'X/(SO(3)×U(1)) = M/U(1)') },
};
/** Diamond arrows: from, to, fibre label, colour, when it appears, a note under the label. */
const EDGES = [
  ['top', 'right', 'SO(3)', VERTICAL, 13, 'forget the orientation'],
  ['top', 'left', 'U(1)', ROTOR, 15, 'forget the rotor angle'],
  ['right', 'bottom', 'U(1)', ROTOR, 17.5, 'the rotor turns shapes'],
  ['left', 'bottom', 'SO(3)', VERTICAL, 19.5, ''],
];
const CENTRE = [1190, 475];
const COMMUTE = tex(String.raw`R \cdot (g_\varphi \cdot x) = g_\varphi \cdot (R \cdot x)`, 'R·(g_φ·x) = g_φ·(R·x)');

/** Draw a small copy of the molecule centred at screen point p. */
function copy(ctx, X, p, o = {}) {
  drawMolecule(ctx, X, nitroCamera({ cx: p[0], cy: p[1], scale: SIZE, yaw: 0.55, pitch: 0.3 }), { molecule: nitro, labels: 0, ...o });
}

export default defineScene({
  name: 'Many bundles',
  duration: 40,
  narration:
    'The two symmetries commute: rotate the molecule and then turn the lips, or turn the lips and then rotate, and you end up at the same configuration, because the axis turns with the molecule. So the product SO(3) × U(1) acts, and every quotient is a bundle. Configuration space is a bundle over shape space with fibre SO(3), a bundle over X/U(1) with fibre U(1), and both together. The rotor also acts on shape space itself: there, turning the lips is a change of shape.',
  header: { eyebrow: '04 · ONE SPACE, MANY BUNDLES', title: 'The two symmetries commute' },

  draw(ctx, t) {
    drawSquare(ctx, t);
    drawDiamond(ctx, t);

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'The axis turns with the molecule, so turning the lips commutes with rotating: SO(3) × U(1) acts on X.', 110, 790, 700, 30, { ...words, alpha: seg(t, 10, 11) });
    wrap(ctx, 'Each free action makes X a principal bundle. One space carries all of them at once.', 900, 790, 640, 30, { ...words, alpha: seg(t, 22, 23) });
    text(ctx, 'Where an action is not free (collinear molecules for SO(3), lips on the axis for U(1)), we leave the points out.', 900, 856, {
      ...type.note,
      size: 14,
      alpha: seg(t, 30, 31),
    });
  },
});

/** Rotate then turn, or turn then rotate: the same configuration. */
function drawSquare(ctx, t) {
  const a = seg(t, 0.4, 1.2);
  copy(ctx, X0, CORNERS.x, { opacity: a });
  text(ctx, 'x', CORNERS.x[0] - 110, CORNERS.x[1] - 60, { ...type.math, size: 28, alpha: a });

  const leg = (from, to, start, label, tint, below) => {
    const p = seg(t, start, start + 2.2);
    if (p <= 0) return;
    const [x0, y0] = CORNERS[from];
    const [x1, y1] = CORNERS[to];
    const horizontal = y0 === y1;
    const pad = horizontal ? [95, 0] : [0, 85];
    const s = [x0 + Math.sign(x1 - x0) * pad[0], y0 + Math.sign(y1 - y0) * pad[1]];
    const e = [x1 - Math.sign(x1 - x0) * pad[0], y1 - Math.sign(y1 - y0) * pad[1]];
    arrow(ctx, s[0], s[1], lerp(s[0], e[0], p), lerp(s[1], e[1], p), { color: tint, width: 3, head: 13 });
    const lx = horizontal ? (s[0] + e[0]) / 2 : s[0] + (below ? -16 : 16);
    const ly = horizontal ? s[1] + (below ? 34 : -16) : (s[1] + e[1]) / 2 + 6;
    text(ctx, label, lx, ly, { font: font.display, italic: true, size: 24, color: tint, align: horizontal ? 'center' : below ? 'right' : 'left', alpha: seg(t, start, start + 0.6) });
  };

  // path 1: rotate, then turn
  leg('x', 'rx', 1.6, 'R ∈ SO(3)', VERTICAL, false);
  const p1 = seg(t, 1.6, 3.8);
  if (p1 > 0) copy(ctx, rotate(X0, rotation.partialRotation(R, p1), COM), lerp2(CORNERS.x, CORNERS.rx, p1), { opacity: 1 });
  leg('rx', 'both', 4, 'gᵩ', ROTOR, false);
  const q1 = seg(t, 4, 6.2);
  const rx = rotate(X0, R, COM);
  if (q1 > 0) copy(ctx, turnRotor(rx, PHI * q1), lerp2(CORNERS.rx, CORNERS.both, q1));

  // path 2: turn, then rotate
  leg('x', 'gx', 6.6, 'gᵩ ∈ U(1)', ROTOR, true);
  const p2 = seg(t, 6.6, 8.6);
  if (p2 > 0) copy(ctx, turnRotor(X0, PHI * p2), lerp2(CORNERS.x, CORNERS.gx, p2));
  leg('gx', 'both', 8.6, 'R', VERTICAL, true);
  const q2 = seg(t, 8.6, 10.6);
  const gx = turnRotor(X0, PHI);
  if (q2 > 0) copy(ctx, rotate(gx, rotation.partialRotation(R, q2), COM), lerp2(CORNERS.gx, CORNERS.both, q2), { ghost: q2 >= 1 ? color.gold : undefined, opacity: 1 });

  COMMUTE.draw(ctx, 435, 500, { size: 26, align: 'center', alpha: seg(t, 11, 12) });
  text(ctx, 'outline: the second path lands exactly on the first', CORNERS.both[0], CORNERS.both[1] + 92, { ...type.note, size: 14, align: 'center', alpha: seg(t, 11, 12) });
}

const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

/** The diamond of quotients, each arrow a principal bundle with the fibre written on it. */
function drawDiamond(ctx, t) {
  const show = (key) => (key === 'top' ? seg(t, 12, 13) : Math.max(...EDGES.filter((e) => e[1] === key || e[0] === key).map((e) => seg(t, e[4] + 0.6, e[4] + 1.4))));
  for (const [key, { at, formula }] of Object.entries(NODES)) formula.draw(ctx, at[0], at[1], { size: 28, align: 'center', alpha: show(key) });

  for (const [from, to, label, tint, start, note] of EDGES) {
    const p = seg(t, start, start + 1.4);
    if (p <= 0) continue;
    const [x0, y0] = NODES[from].at;
    const [x1, y1] = NODES[to].at;
    const s = [lerp(x0, x1, 0.2), lerp(y0, y1, 0.2)];
    const e = [lerp(x0, x1, 0.8), lerp(y0, y1, 0.8)];
    arrow(ctx, s[0], s[1], lerp(s[0], e[0], p), lerp(s[1], e[1], p), { color: tint, width: 3, head: 13 });
    // label outside the diamond, beside the middle of the arrow
    const m = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2];
    const out = [m[0] - CENTRE[0], m[1] - CENTRE[1]];
    const n = Math.hypot(out[0], out[1]);
    const lx = m[0] + (34 * out[0]) / n;
    const ly = m[1] + (34 * out[1]) / n + 6;
    const align = out[0] < 0 ? 'right' : 'left';
    text(ctx, label, lx, ly, { font: font.display, italic: true, size: 24, color: tint, align, alpha: seg(t, start + 0.4, start + 1) });
    if (note) text(ctx, note, lx, ly + 22, { ...type.note, size: 14, align, alpha: seg(t, start + 0.8, start + 1.4) });
  }

  // the diagonal: both at once
  const d = seg(t, 24, 25.4);
  if (d > 0) {
    const [x0, y0] = NODES.top.at;
    const [, y1] = NODES.bottom.at;
    arrow(ctx, x0, y0 + 40, x0, lerp(y0 + 40, y1 - 40, d), { color: color.muted, width: 2.5, head: 12, dash: [6, 6] });
    text(ctx, 'SO(3) × U(1)', x0 - 12, (y0 + y1) / 2 + 60, { font: font.display, italic: true, size: 22, color: color.muted, align: 'right', alpha: seg(t, 24.6, 25.4) });
  }
  text(ctx, 'every arrow: a principal bundle, with its fibre written on it', 1190, 740, { ...type.note, size: 14, align: 'center', alpha: seg(t, 26, 27) });
}
