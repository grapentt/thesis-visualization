import {
  defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, arrow, arrow3, dot, ring, line, roundRect,
  drawMolecule, rotation, vec3,
} from '../../../kit.js';
import { nitro, X0, nitroCamera, rotate, bend, centreOfMass, zeroMomentum, placed, VERTICAL, HORIZONTAL } from '../shared.js';

const SHIFT = [-1.4, -0.6, 0.3];
const AXIS = vec3.normalize([0.3, 1, 0.25]);
const TURN = 2.4; // radians walked along the fibre
const VERTICAL_RUN = [9.8, 15.6];
const BEND_RUN = [23.6, 28.4];
const COLLAPSE = [30, 33.5];
const COPIES = [0.5, 1]; // fractions of the turn where a copy is left on the fibre

// the sketch of X: base M underneath, fibres above it
const MAIN = 1200;
const NEXT = 1340;
const FIBRES = [940, 1030, MAIN, NEXT, 1440];
const baseY = (x) => 690 + 12 * Math.sin((x - 900) / 130);
const TOP = 250;
const START_Y = 640; // where x sits on its fibre
const CLIMB = 300;

const COM = centreOfMass(X0);
const SECTION = tex(String.raw`x \;\mapsto\; x - c(x), \qquad c(x) = \frac{\sum_i m_i x_i}{\sum_i m_i}`, 'x ↦ x − c(x),   c(x) = Σ mᵢxᵢ / Σ mᵢ');
const SPLIT = tex(String.raw`T_x X = V_x \oplus H_x, \qquad V_x \cong \mathfrak{so}(3)`, 'T_xX = V_x ⊕ H_x,   V_x ≅ 𝔰𝔬(3)');
const BUNDLE = tex(String.raw`SO(3) \hookrightarrow X \xrightarrow{\;\pi\;} M = X/SO(3)`, 'SO(3) ↪ X →π M = X/SO(3)');

// the horizontal (L = 0) out-and-back bend, from the rest pose
const bendAt = (tau) => 0.55 * Math.sin(Math.PI * tau);
const BEND_ROTATIONS = zeroMomentum((tau) => bend(X0, bendAt(tau)), 240);

export default defineScene({
  name: 'Orientation',
  duration: 37,
  narration:
    'First remove translations: move the centre of mass to the origin. Every configuration has exactly one such translate, a canonical global section. What is left is rotations. At every configuration the tangent space splits: vertical directions only rotate the molecule, and moving along them you walk along the fibre through x. Every point of this fibre is an orientation of the same shape: the fibre is a copy of SO(3). Horizontal directions change the shape and lead from fibre to fibre. Shape space identifies all orientations of one shape.',
  header: { eyebrow: '02 · THE GLOBAL SYMMETRY', title: 'Orientation: walking along the fibre SO(3)' },

  draw(ctx, t) {
    const cam = nitroCamera({ cx: 400, cy: 470, scale: 140, yaw: 0.5, pitch: 0.3 });

    // translation to the origin, then the walk up the fibre, then the horizontal bend
    const slide = 1 - seg(t, 2, 5);
    const climb = seg(t, ...VERTICAL_RUN);
    const Rv = rotation.axisAngle(AXIS, TURN * climb);
    const tau = lin(t, ...BEND_RUN);
    const Rh = BEND_ROTATIONS[Math.round(tau * (BEND_ROTATIONS.length - 1))];
    const body = placed(bend(X0, bendAt(tau)), Rh, COM);
    const X = rotate(body, Rv, COM).map((v, j) => v + slide * SHIFT[j % 3]);
    drawMolecule(ctx, X, cam, { molecule: nitro, opacity: seg(t, 0, 0.8), labels: 0 });

    drawTranslation(ctx, t, cam, X);
    if (t > VERTICAL_RUN[0] && t < VERTICAL_RUN[1]) {
      const w = fade(t, VERTICAL_RUN[0], VERTICAL_RUN[0] + 0.4, VERTICAL_RUN[1] - 0.4, VERTICAL_RUN[1]);
      for (let i = 0; i < 5; i++) {
        const p = nitro.atom(X, i);
        arrow3(ctx, cam, p, vec3.scale(vec3.cross(AXIS, vec3.sub(p, COM)), 0.55), { color: VERTICAL, width: 3.5, head: 12, alpha: w });
      }
    }
    if (t > BEND_RUN[0] && t < BEND_RUN[1]) {
      const w = fade(t, BEND_RUN[0], BEND_RUN[0] + 0.4, BEND_RUN[1] - 0.4, BEND_RUN[1]);
      const h = 0.02;
      const ahead = rotate(placed(bend(X0, bendAt(Math.min(1, tau + h))), BEND_ROTATIONS[Math.round(Math.min(1, tau + h) * (BEND_ROTATIONS.length - 1))], COM), Rv, COM);
      for (let i = 0; i < 5; i++) {
        const v = vec3.scale(vec3.sub(nitro.atom(ahead, i), nitro.atom(X, i)), 0.5 / h);
        if (vec3.length(v) > 0.04) arrow3(ctx, cam, nitro.atom(X, i), v, { color: HORIZONTAL, width: 3.5, head: 12, alpha: w });
      }
    }

    drawSketch(ctx, t, climb, tau);

    const caption = (s, from, to) => wrap(ctx, s, 110, 770, 620, 30, { ...type.body, size: 21, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    caption('First, translations: move the centre of mass to the origin. Every configuration has exactly one such translate, so this is a canonical global section.', 1.2, 8.4);
    caption('Vertical directions only rotate the molecule. Moving along them, you walk along the fibre through x.', 9.4, 16.6);
    caption('Every point of this fibre is an orientation of the same shape: the fibre is a copy of SO(3).', 17, 22.8);
    caption('Horizontal directions change the shape and lead from fibre to fibre. With zero angular momentum the other beads give way a little.', 23.2, 29.2);
    caption('Shape space M = X/SO(3) identifies all orientations of one shape: the whole fibre becomes one point [x].', 29.8, 37);

    SECTION.draw(ctx, 900, 470, { size: 30, alpha: fade(t, 3, 4, 7.6, 8.2) });
    text(ctx, 'the centred configurations: from now on, X', 900, 530, { ...type.note, alpha: fade(t, 4, 5, 7.6, 8.2) });
    SPLIT.draw(ctx, 900, 780, { size: 28, alpha: seg(t, 11, 12) });
    text(ctx, 'vertical: 3 rotations · horizontal: 3N − 6 shape changes', 900, 818, { ...type.note, alpha: seg(t, 11.6, 12.6) * (1 - seg(t, 17, 17.6)) });
    BUNDLE.draw(ctx, 900, 840, { size: 28, alpha: seg(t, 18, 19) });
  },
});

/** The centre of mass slides onto the origin. */
function drawTranslation(ctx, t, cam, X) {
  const a = fade(t, 1, 1.8, 8.2, 9);
  if (a <= 0) return;
  const o = cam.project(COM);
  const c = cam.project(centreOfMass(X));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(o.x - 16, o.y);
  ctx.lineTo(o.x + 16, o.y);
  ctx.moveTo(o.x, o.y - 16);
  ctx.lineTo(o.x, o.y + 16);
  ctx.stroke();
  ctx.restore();
  tag(ctx, 'origin', o.x + 30, o.y + 46, color.ink, a);
  line(ctx, o.x + 6, o.y + 6, o.x + 28, o.y + 34, { color: color.ink, width: 1.2, alpha: a });
  if (Math.hypot(c.x - o.x, c.y - o.y) > 8) arrow(ctx, c.x, c.y, o.x, o.y, { color: color.ink, width: 2.5, head: 12, alpha: a });
  dot(ctx, c.x, c.y, 6, color.gold, a);
  ring(ctx, c.x, c.y, 11, color.gold, a, 2);
  const label = a * fade(t, 1, 1.8, 4.6, 5.2);
  tag(ctx, 'centre of mass', c.x - 150, c.y - 64, color.gold, label);
  line(ctx, c.x - 8, c.y - 8, c.x - 40, c.y - 52, { color: color.gold, width: 1.2, alpha: label });
}

/** A short label on a dark pill, readable on top of the molecule. */
function tag(ctx, str, x, y, tint, alpha) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `400 15px ${font.mono}`;
  const w = ctx.measureText(str).width + 18;
  ctx.fillStyle = 'rgba(13,19,33,0.92)';
  roundRect(ctx, x - 9, y - 18, w, 26, 8);
  ctx.fill();
  ctx.restore();
  text(ctx, str, x, y, { ...type.note, color: tint, alpha });
}

/** Configuration space: base M, fibres, the point x walking up its fibre and over to the next. */
function drawSketch(ctx, t, climb, tau) {
  const a = seg(t, 8.4, 9.4);
  if (a <= 0) return;
  const collapse = seg(t, ...COLLAPSE);
  ctx.save();
  ctx.globalAlpha = a;

  // base M
  ctx.strokeStyle = color.muted;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 900; x <= 1500; x += 6) x === 900 ? ctx.moveTo(x, baseY(x)) : ctx.lineTo(x, baseY(x));
  ctx.stroke();
  text(ctx, 'M', 1510, baseY(1500) + 8, { ...type.math, size: 26, color: color.muted });

  // fibres shrink onto the base when they are identified
  for (const x of FIBRES) {
    const y0 = baseY(x) - 24;
    const y1 = lerp(TOP, y0, collapse);
    line(ctx, x, y0, x, y1, { color: VERTICAL, width: x === MAIN ? 3 : 1.5, alpha: x === MAIN ? 0.9 : 0.45 });
    dot(ctx, x, baseY(x), 4, color.muted);
  }
  text(ctx, 'fibre SO(3) · x', MAIN - 16, TOP - 16, { ...type.note, color: VERTICAL, alpha: 1 - collapse });
  text(ctx, 'X', 900, TOP - 16, { ...type.math, size: 28, alpha: 1 - collapse });

  // copies left behind on the fibre
  const climbY = START_Y - CLIMB * climb;
  COPIES.forEach((f, k) => {
    const shown = climb >= f - 1e-6 ? 1 : 0;
    if (!shown) return;
    const y = lerp(START_Y - CLIMB * f, baseY(MAIN), collapse);
    const R = rotation.axisAngle(AXIS, TURN * f);
    const cam = nitroCamera({ cx: lerp(MAIN - 88, MAIN, collapse), cy: y, scale: lerp(36, 6, collapse) });
    drawMolecule(ctx, rotate(X0, R, COM), cam, { molecule: nitro, labels: 0, opacity: (1 - seg(collapse, 0.7, 1)) * (k === COPIES.length - 1 && climb < 1 ? 0 : 0.9) });
  });
  const startCam = nitroCamera({ cx: lerp(MAIN - 88, MAIN, collapse), cy: lerp(START_Y, baseY(MAIN), collapse), scale: lerp(36, 6, collapse) });
  drawMolecule(ctx, X0, startCam, { molecule: nitro, labels: 0, opacity: (climb > 0.02 ? 0.9 : 0) * (1 - seg(collapse, 0.7, 1)) });

  // the moving point
  const out = Math.sin(Math.PI * tau);
  const px = lerp(MAIN, NEXT, out);
  const py = lerp(climbY - 40 * out, baseY(MAIN), collapse);
  if (t > BEND_RUN[0] - 0.6) {
    arrow(ctx, MAIN, climbY, NEXT - 8, climbY - 40, { color: HORIZONTAL, width: 3, head: 13, alpha: fade(t, BEND_RUN[0] - 0.6, BEND_RUN[0], COLLAPSE[0] - 0.6, COLLAPSE[0]) });
    text(ctx, 'Hₓ', (MAIN + NEXT) / 2 - 6, climbY - 40, { ...type.math, size: 24, color: HORIZONTAL, alpha: fade(t, BEND_RUN[0], BEND_RUN[0] + 0.6, COLLAPSE[0] - 0.6, COLLAPSE[0]) });
  }
  if (t > VERTICAL_RUN[0] - 0.6) {
    const v = fade(t, VERTICAL_RUN[0] - 0.6, VERTICAL_RUN[0], VERTICAL_RUN[1], VERTICAL_RUN[1] + 0.6);
    arrow(ctx, MAIN + 24, climbY + 6, MAIN + 24, climbY - 70, { color: VERTICAL, width: 3, head: 13, alpha: v });
    text(ctx, 'Vₓ', MAIN + 36, climbY - 32, { ...type.math, size: 24, color: VERTICAL, alpha: v });
  }
  dot(ctx, px, py, 8, color.ink);
  ring(ctx, px, py, 14, color.gold);
  text(ctx, collapse > 0.5 ? '[x]' : 'x', px - 20, py - 18, { ...type.math, size: 26, align: 'right' });
  ctx.restore();
}
