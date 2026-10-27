import {
  defineScene, seg, lin, text, wrap, type, font, color, tex, dot, ring, arrow, drawMolecule, polyline3, rotation, vec3,
} from '../../../kit.js';
import { nitro, X0, nitroCamera, rotate, centreOfMass, ROTOR } from '../shared.js';
import { drawBead, BEAD } from '../beads.js';

const COM = centreOfMass(X0);
const V = vec3.add(COM, [0.4, -1.7, 0.9]);
const W = vec3.add(COM, [-1.5, -0.9, -0.6]);
const LINE = vec3.normalize(vec3.sub(V, COM));
const RIGHT = 860;
const SPIN_V = [4, 11];
const SPIN_W = [16.5, 22.5];
const PLANE_FROM = 25;

const QUOTIENT = tex(String.raw`X \times_{SO(3)} \big(SO(3)/H\big) \;\cong\; X/H`, 'X ×_SO(3) (SO(3)/H) ≅ X/H');

const QA = [
  {
    from: 1,
    q: 'CAN ONE POINT OF ℝ³ TRACK THE ROTATION?',
    a: 'No. Every rotation about the line through the centre and v leaves v where it is. One extra bead records only a direction, a point of the sphere S² = SO(3)/SO(2): two of the three angles.',
  },
  {
    from: 13.5,
    q: 'AND TWO?',
    a: 'Two beads that are not in a line with the centre fix the orientation completely: only the identity leaves both where they are.',
  },
  {
    from: PLANE_FROM,
    q: 'WHY DOES ONE POINT WORK FOR THE ROTOR?',
    a: 'U(1) turning a plane moves every point except the centre. One point off the centre records the whole angle; the centre is the exception, just like lips on the axis.',
  },
  {
    from: 36,
    q: 'SO, GLOBAL VERSUS LOCAL?',
    a: 'Neither: what matters is the stabiliser, the rotations that leave the extra point where it is. A flat molecule turning in its own plane is a global U(1), and one bead off the centre tracks it.',
  },
];

export default defineScene({
  name: 'One bead is not a frame',
  duration: 52,
  narration:
    'Can one extra point of ℝ³ track the rotation of the molecule, the way a point on the circle tracks the rotor? No. Every rotation about the line through the centre and that point leaves the point where it is. One bead records only a direction, two of the three angles. Two beads that are not in a line with the centre fix the orientation completely. For the rotor, every turn moves every point of the plane except the centre, so one point off the centre is enough. The difference is not global versus local, it is the stabiliser: which rotations leave the extra point where it is.',
  header: { eyebrow: '10 · QUESTIONS', title: 'One bead is not a frame' },

  draw(ctx, t) {
    const plane = seg(t, PLANE_FROM - 1, PLANE_FROM);
    if (plane < 1) drawSpace(ctx, t, 1 - plane);
    if (plane > 0) drawPlane(ctx, t, plane);

    QA.forEach(({ from, q, a }, k) => {
      const next = QA[k + 1]?.from ?? Infinity;
      const dim = t >= next ? 0.4 : 1;
      const shown = seg(t, from, from + 0.6);
      const y = 230 + k * 150;
      text(ctx, q, RIGHT, y, { font: font.mono, size: 15, weight: 500, color: color.gold, tracking: 1.5, alpha: shown * dim });
      wrap(ctx, a, RIGHT, y + 32, 660, 27, { ...type.body, size: 19, alpha: shown * dim, chars: Math.floor(lin(t, from + 0.4, from + 5.5) * a.length) });
    });
    QUOTIENT.draw(ctx, RIGHT, 826, { size: 26, alpha: seg(t, 44, 45) });
    text(ctx, 'H: the stabiliser of the extra point (SO(2) for one bead, nothing for a frame)', RIGHT, 868, { ...type.note, alpha: seg(t, 44.6, 45.6) });
  },
});

/** The molecule with one, then two extra beads, spun about the line through the first. */
function drawSpace(ctx, t, alpha) {
  const cam = nitroCamera({ cx: 420, cy: 470, scale: 140, yaw: 0.6, pitch: 0.3 });
  const spin = 2 * Math.PI * (seg(t, ...SPIN_V) + seg(t, ...SPIN_W));
  const R = rotation.axisAngle(LINE, spin);
  const X = rotate(X0, R, COM);
  const w = vec3.add(rotation.apply(R, vec3.sub(W, COM)), COM);

  // the line through the centre and v
  const lineAlpha = alpha * seg(t, 2.5, 3.5);
  polyline3(ctx, cam, [vec3.sub(COM, vec3.scale(LINE, 1.6)), vec3.add(V, vec3.scale(LINE, 0.9))], { color: BEAD, width: 2, dash: [7, 7], alpha: lineAlpha });
  drawMolecule(ctx, X, cam, { molecule: nitro, opacity: alpha, labels: 0 });
  drawBead(ctx, cam, V, { alpha: alpha * seg(t, 1, 2), label: 'v' });

  const two = seg(t, 14, 15) * alpha;
  if (two > 0) {
    // w's circle about the line
    const n = 60;
    const centre = vec3.add(COM, vec3.scale(LINE, vec3.dot(vec3.sub(W, COM), LINE)));
    const pts = Array.from({ length: n + 1 }, (_, k) => vec3.add(rotation.apply(rotation.axisAngle(LINE, (2 * Math.PI * k) / n), vec3.sub(W, centre)), centre));
    polyline3(ctx, cam, pts, { color: BEAD, width: 1.5, alpha: 0.5 * two * seg(t, SPIN_W[0], SPIN_W[0] + 1) });
    drawBead(ctx, cam, w, { alpha: two, label: 'w' });
  }
  const c = cam.project(COM);
  dot(ctx, c.x, c.y, 5, color.ink, alpha * seg(t, 2.5, 3.5));
  const spinning = t > SPIN_V[0] && t < SPIN_V[1];
  text(ctx, spinning ? 'the molecule turns, v stays put' : '', 420, 800, { ...type.note, color: BEAD, align: 'center', alpha });
  if (t > SPIN_W[0] && t < SPIN_W[1]) text(ctx, 'now w moves: the pair (v, w) sees every rotation', 420, 800, { ...type.note, color: BEAD, align: 'center', alpha });
}

/** U(1) turning a plane: a point off the centre always moves, the centre never does. */
function drawPlane(ctx, t, alpha) {
  const cx = 420;
  const cy = 480;
  const r = 190;
  const turn = 2 * Math.PI * lin(t, PLANE_FROM + 2, PLANE_FROM + 9);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(197,138,249,0.08)';
  ctx.strokeStyle = ROTOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // the starting ray and the point
  const p0 = [cx + 120, cy];
  const p = [cx + 120 * Math.cos(-turn), cy + 120 * Math.sin(-turn)];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = ROTOR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, -turn, true);
  ctx.stroke();
  ctx.restore();
  dot(ctx, p0[0], p0[1], 6, color.muted, alpha);
  arrow(ctx, cx, cy, p[0], p[1], { color: ROTOR, width: 2, head: 10, alpha: alpha * 0.6 });
  dot(ctx, p[0], p[1], 11, BEAD, alpha);
  ring(ctx, cx, cy, 9, color.stiff, alpha * seg(t, PLANE_FROM + 4, PLANE_FROM + 5));
  dot(ctx, cx, cy, 4, color.ink, alpha);
  text(ctx, 'the plane of the lips, U(1) turning it', cx, cy + r + 40, { ...type.note, color: ROTOR, align: 'center', alpha });
  text(ctx, 'fixed by every turn', cx, cy + 44, { ...type.note, color: color.stiff, align: 'center', alpha: alpha * seg(t, PLANE_FROM + 4, PLANE_FROM + 5) });
  text(ctx, `angle ${((turn * 180) / Math.PI).toFixed(0)}°`, cx, cy - r - 24, { font: font.mono, size: 18, color: BEAD, align: 'center', alpha });
}
