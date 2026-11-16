// Scene 01: a circle over every point. The base plane in 3D, a ring over every lattice point (the
// fibre U(1)), a point of the total space and its projection, the tube over a curve (a circle of
// circles), a phase as the hand of a dial, and the question a connection will answer.
import { defineScene, seg, fade, lin, lerp, text, wrap, type, color, font, rgba, tex, line, dot, ring, polyline3, vec3, C, header, drawDial, stamp, TAU } from '../shared.js';
import { bundleCamera, drawFloor, drawRing, drawStalk, tube, drawTube, drawTubeRing, drawBaseCurve, floorPoint, circle3 } from '../space.js';

const DURATION = 50;
const H = 0.55; // height of the rings over the floor
const R = 0.24; // ring radius
const SITES = [-1.2, 0, 1.2];
/** The 3 × 3 lattice, in the order the rings appear (front row first, seen from the camera). */
const LATTICE = [];
for (const y of SITES) for (const x of SITES) LATTICE.push([x, y]);
const RING_AT = (k) => 1.6 + 0.55 * k; // when ring k appears
/** The straight base curve the tube sits over: the middle row of the lattice. */
const SEGMENT = Array.from({ length: 81 }, (_, i) => [lerp(-1.75, 1.75, i / 80), 0]);
const TUBE = tube(SEGMENT, { rho: R, h: H });
const THETA0 = 0.75; // the phase of the marked point (counter-clockwise from the ring's mark)
const MARKED = 4; // the centre ring carries the marked point
const HERE = 3; // "over here": the ring left of the centre
const THERE = 5; // "over there": the ring right of the centre
const TUBE_AT = 19;
const DIAL_AT = 27;
const QUESTION_AT = 38;
const PI_AT = 13; // the projection, when "pi" is said

const PROJECTION = tex(String.raw`\pi(x, e^{i\theta}) = x`, 'π(x, e^{iθ}) = x'); // π : P → M is already named in the column
const LOCAL = tex(String.raw`P \simeq M \times S^1 \ \text{(locally)}`, 'P ≅ M × S¹ (locally)');
const PHASE = tex(String.raw`e^{i\theta} \in U(1)`, 'e^{iθ} ∈ U(1)');

/** The point at angle θ on the ring over (x, y) (the same parametrisation as drawRing: facing −0.9). */
function ringPoint([x, y], theta, facing = -0.9) {
  const e1 = [-Math.sin(facing), 0, Math.cos(facing)];
  return vec3.add(floorPoint(x, y, H), vec3.add(vec3.scale(e1, R * Math.cos(theta)), [0, R * Math.sin(theta), 0]));
}

export default defineScene({
  name: 'A circle over every point',
  duration: DURATION,
  header: header(1, 'FIBRE BUNDLES', 'A circle over every point'),
  narration: [
    [0, 'Start with a plane: the base. Over every point, put a circle: the fibre, U one, the circle of phases. A point of the total space P is a point of the base plus a phase, a point on its circle. The projection, pi, forgets the phase.'],
    [TUBE_AT, 'Over a curve, the circles make a tube: a circle of circles. Over the whole plane the circles would fill the space solid, so we draw each one as a dial. A phase is a point of the circle, e to the i theta: the dial\'s hand.'],
    [QUESTION_AT + 0.5, 'A circle over every point, and nothing that connects one circle to the next. Which point over here corresponds to which point over there? That needs a rule.'],
  ],

  draw(ctx, t) {
    const cam = bundleCamera({ yaw: 0.4 + 0.5 * (t / DURATION), scale: 170, cx: 500, cy: 570 });
    const floorOn = seg(t, 0.2, 1.4);
    drawFloor(ctx, cam, { a: 1.8, step: 0.45, alpha: floorOn });
    // the base label at the floor's nearest corner (the one drawn lowest)
    const corner = [[-1.8, -1.8], [1.8, -1.8], [1.8, 1.8], [-1.8, 1.8]].map(([x, y]) => cam.project(floorPoint(x, y, 0))).sort((a, b) => b.y - a.y)[0];
    text(ctx, 'base M', corner.x + 14, corner.y + 10, { ...type.math, size: 24, color: color.muted, alpha: seg(t, 0.8, 1.8) });

    // the tube forms over the middle row from TUBE_AT: rings densify, then the glassy surface
    const tubeOn = seg(t, TUBE_AT, TUBE_AT + 3.5);
    const surface = seg(t, TUBE_AT + 2.5, TUBE_AT + 5.5);
    const dimOffRow = 1 - 0.55 * seg(t, TUBE_AT, TUBE_AT + 2);
    if (surface > 0.003) {
      drawBaseCurve(ctx, cam, SEGMENT, { colour: C.path, width: 2, alpha: 0.8 * surface });
      drawTube(ctx, cam, TUBE, { every: 4, nv: 22, alpha: 0.3 * surface, colour: C.fibre, edge: 0.35 });
    }
    if (tubeOn > 0.003 && surface < 1) {
      // intermediate rings between the lattice rings of the middle row
      const extra = Math.round(lerp(0, 9, tubeOn));
      for (let j = 0; j <= extra; j++) {
        for (let seg2 = 0; seg2 < 2; seg2++) {
          const u = (j + 0.5) / (extra + 1);
          const x = lerp(SITES[seg2], SITES[seg2 + 1], u);
          const i = Math.round(((x + 1.75) / 3.5) * 80);
          drawTubeRing(ctx, cam, TUBE, i, { alpha: 0.55 * tubeOn * (1 - surface), colour: C.fibre, width: 1.2 });
        }
      }
    }

    // the lattice of rings, each with its stalk
    LATTICE.forEach(([x, y], k) => {
      const a = seg(t, RING_AT(k), RING_AT(k) + 0.8);
      if (a <= 0.003) return;
      const onRow = y === 0;
      const alpha = a * (onRow ? 1 : dimOffRow);
      drawStalk(ctx, cam, [x, y], { h: H, alpha });
      const marked = k === MARKED ? THETA0 : null;
      const highlight = (k === HERE || k === THERE) && t > QUESTION_AT ? seg(t, QUESTION_AT, QUESTION_AT + 1) : 0;
      drawRing(ctx, cam, [x, y], { r: R, h: H, alpha, theta: marked, width: 1.5 + 1.2 * highlight, pointR: 5, colour: C.fibre });
    });

    // the fibre label beside the first ring
    const p0 = cam.project(floorPoint(LATTICE[0][0], LATTICE[0][1], H + R));
    text(ctx, 'fibre S¹ = U(1)', p0.x - 22, p0.y - 6, { ...type.math, size: 22, color: C.fibre, align: 'right', alpha: fade(t, 3.2, 4, TUBE_AT - 1, TUBE_AT) });

    // a point of the total space over the centre, and its projection
    const pt = seg(t, 9, 10);
    if (pt > 0.003) {
      const world = ringPoint(LATTICE[MARKED], THETA0);
      const s = cam.project(world);
      const foot = cam.project(floorPoint(LATTICE[MARKED][0], LATTICE[MARKED][1], 0));
      ring(ctx, s.x, s.y, 11, C.fibre, 0.9 * pt, 2);
      const lab = pt * fade(t, 9, 10, TUBE_AT - 1, TUBE_AT);
      if (lab > 0.003) {
        // the label sits in the empty space above the lattice, tied to the point by a leader
        const lx = s.x + 170;
        const ly = s.y - 170;
        line(ctx, s.x + 9, s.y - 8, lx - 6, ly + 8, { color: '#0d1321', width: 5, alpha: 0.85 * lab }); // a dark halo lifts the leader off the rings
        line(ctx, s.x + 9, s.y - 8, lx - 6, ly + 8, { color: C.fibre, width: 1, alpha: 0.55 * lab });
        text(ctx, 'a point of P:', lx, ly, { ...type.note, size: 15, color: C.fibre, alpha: lab });
        text(ctx, 'base point + phase', lx, ly + 21, { ...type.note, size: 15, color: C.fibre, alpha: lab });
      }
      // the projection π: an arrow down the stalk, with its label
      const pr = fade(t, PI_AT, PI_AT + 1, TUBE_AT - 1, TUBE_AT);
      if (pr > 0.003) {
        ctx.save();
        ctx.globalAlpha *= pr;
        ctx.strokeStyle = C.connection;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + 12);
        ctx.lineTo(foot.x, foot.y - 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        dot(ctx, foot.x, foot.y, 5, C.connection, pr);
        text(ctx, 'π', (s.x + foot.x) / 2 + 16, (s.y + foot.y) / 2 + 8, { ...type.math, size: 26, color: C.connection, alpha: pr });
      }
    }

    // the tube's label and the marked point on it, with its fibre ring
    const tubeLabel = fade(t, TUBE_AT + 2, TUBE_AT + 3, QUESTION_AT - 1, QUESTION_AT);
    if (tubeLabel > 0.003) {
      // beside the tube's near end, off the glassy surface
      const end = cam.project(floorPoint(SEGMENT[0][0], 0, H));
      text(ctx, 'a circle of circles', end.x - 46, end.y + 10, { ...type.math, size: 22, color: C.fibre, align: 'right', alpha: tubeLabel });
    }

    // the question: which point over here goes with which point over there?
    const q = seg(t, QUESTION_AT, QUESTION_AT + 1);
    if (q > 0.003) {
      const here = cam.project(ringPoint(LATTICE[HERE], 2.1));
      const there = cam.project(ringPoint(LATTICE[THERE], 0.4));
      for (const [s, label] of [[here, 'over here'], [there, 'over there']]) {
        dot(ctx, s.x, s.y, 6, C.fibre, q);
        ring(ctx, s.x, s.y, 12, C.fibre, 0.8 * q, 1.5);
        // "over there" sits on the tube's far end, so its label goes up and to the right, off the surface
        const far = label === 'over there';
        text(ctx, label, far ? s.x + 16 : s.x, far ? s.y - 48 : s.y - 30, { ...type.note, size: 14, color: C.fibre, align: far ? 'left' : 'center', alpha: q });
      }
      // the pending correspondence: a dashed arc with a question mark
      const mid = [(here.x + there.x) / 2, Math.min(here.y, there.y) - 60];
      ctx.save();
      ctx.globalAlpha *= 0.8 * q;
      ctx.strokeStyle = C.connection;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.moveTo(here.x, here.y - 14);
      ctx.quadraticCurveTo(mid[0], mid[1], there.x, there.y - 14);
      ctx.stroke();
      ctx.restore();
      // the "?" sits just above the arc's own midpoint (not at its control point)
      const apex = [0.25 * here.x + 0.5 * mid[0] + 0.25 * there.x, 0.25 * (here.y - 14) + 0.5 * mid[1] + 0.25 * (there.y - 14)];
      text(ctx, '?', apex[0], apex[1] - 12, { ...type.display, size: 34, color: C.connection, align: 'center', alpha: q });
    }

    drawColumn(ctx, t);
    stamp(ctx, seg(t, 2, 3), 'the rings, the tube and the dial are one picture of the bundle P → M');
  },
});

/** The right-hand column: what the pieces are called, the dial, and the formulas. */
function drawColumn(ctx, t) {
  const x = 980;
  const rows = [
    ['base M', 'the plane: the space the particle moves in', color.muted, 0.8],
    ['fibre S¹ = U(1)', 'a circle over every point: every phase θ', C.fibre, 3.2],
    ['total space P', 'every point of the plane with every phase', C.fibre, 9],
    ['π : P → M', 'the projection: it forgets the phase', C.connection, PI_AT],
  ];
  rows.forEach(([name, what, tint, at], i) => {
    const a = seg(t, at, at + 0.8);
    const y = 215 + i * 62;
    text(ctx, name, x, y, { ...type.math, size: 24, color: tint, alpha: a });
    // the explanations step back once the dial needs the column's attention; the names stay
    text(ctx, what, x, y + 24, { ...type.note, size: 14, alpha: a * (1 - seg(t, DIAL_AT - 1, DIAL_AT)) });
  });

  // the dial: a phase as the hand of a dial
  const d = seg(t, DIAL_AT, DIAL_AT + 1);
  if (d > 0.003) {
    const cx = 1080;
    const cy = 590;
    const theta = THETA0 + 0.9 * seg(t, DIAL_AT + 3, DIAL_AT + 7) - 0.9 * seg(t, DIAL_AT + 7, DIAL_AT + 10);
    drawDial(ctx, cx, cy, 60, theta, { alpha: d, fill: 'rgba(13,19,33,0.85)', width: 3.5, readout: true, size: 14 });
    text(ctx, 'zero mark', cx + 58, cy + 30, { ...type.note, size: 14, color: C.fibre, alpha: d });
    text(ctx, 'θ', cx + 34 * Math.cos(theta / 2) + 8, cy - 34 * Math.sin(theta / 2) + 6, { ...type.math, size: 22, color: C.fibre, alpha: d * seg(t, DIAL_AT + 1, DIAL_AT + 2) });
    PHASE.draw(ctx, 1250, 560, { size: 26, alpha: seg(t, DIAL_AT + 1.5, DIAL_AT + 2.5) });
    text(ctx, 'a phase is a point of the circle;', 1250, 598, { ...type.note, size: 14, alpha: seg(t, DIAL_AT + 2, DIAL_AT + 3) });
    text(ctx, 'we draw it as the hand of a dial', 1250, 618, { ...type.note, size: 14, alpha: seg(t, DIAL_AT + 2, DIAL_AT + 3) });
  }

  // the formulas of the punchline
  PROJECTION.draw(ctx, x, 720, { size: 26, alpha: seg(t, QUESTION_AT + 3, QUESTION_AT + 4) });
  LOCAL.draw(ctx, x, 770, { size: 26, alpha: seg(t, QUESTION_AT + 5, QUESTION_AT + 6) });
  text(ctx, 'near any point: plane × circle', x, 806, { ...type.note, size: 14, alpha: seg(t, QUESTION_AT + 6, QUESTION_AT + 7) });
}
