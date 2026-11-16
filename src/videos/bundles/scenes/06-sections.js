import {
  defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, rgba, arrow3, dot, ring, line,
  drawMolecule, drawSurface, polyline3, polygon3, camera, vec3,
} from '../../../kit.js';
import { Molecule } from '../../../model/molecule.js';
import { nitro, X0, nitroCamera, turnRotor, rotorCircle, circlePoint, drawRotorAxis, drawRotorCircle, ROTOR, VERTICAL } from '../shared.js';

const RIGHT = 860;
const C1_BOND = 1.52;
const E0 = (70 * Math.PI) / 180; // bead 1's angle from the backward axis at rest
const PSI0 = Math.atan2(0.78, 1.2); // and its direction around the axis
const NEAR = (7 * Math.PI) / 180; // how close bead 1 comes to the axis
const SPHERE_FROM = 27.5;
const TABLE_FROM = 41;

/** Bead 1 at angle ε from the axis line behind bead 2, turned by ψ about the axis. */
function withBeadOne(X, eps, psi) {
  const Y = X.slice();
  const c2 = nitro.atom(X, 1);
  Molecule.setAtom(Y, 0, vec3.add(c2, vec3.scale([-Math.cos(eps), Math.sin(eps) * Math.cos(psi), Math.sin(eps) * Math.sin(psi)], C1_BOND)));
  return Y;
}

/** Where bead 1 is over the scene: at rest, then towards the axis, then a small loop around it. */
function beadOneAt(t) {
  const eps = lerp(E0, NEAR, seg(t, 16.5, 19.5)) + (E0 - NEAR) * seg(t, 25, 26.8);
  const psi = PSI0 + 2 * Math.PI * seg(t, 20.5, 24.2);
  return [eps, psi];
}

/** The torsion angle shown: the lips turn a little at the start. */
const lipsAt = (t) => 2.3 * seg(t, 5, 8.5) - 2.3 * seg(t, 12.5, 14.5);

export default defineScene({
  name: 'Sections',
  duration: 56,
  narration:
    'An angle needs a zero. A section of the rotor bundle is a consistent choice of where the angle zero is. The chemist’s choice is the torsion angle: measure the lips from the half-plane through the axis and bead one. It works as long as bead one and the lip stay off the axis, which covers every reasonable shape. As bead one comes close to the axis, a tiny motion swings the zero all the way round, and on the axis there is no zero at all. In the lab frame one could measure from a fixed direction in space instead, but choosing the zero for every bond direction means combing a hairy ball: impossible, there is always a bald spot. Over all configurations no continuous zero exists. For translations there is a canonical one, the centre of mass; for the orientation of four or more beads there is no global body frame at all.',
  header: { eyebrow: '06 · SECTIONS', title: 'An angle needs a zero' },

  draw(ctx, t) {
    const molecule = 1 - seg(t, SPHERE_FROM - 1, SPHERE_FROM);
    if (molecule > 0) drawTorsion(ctx, t, molecule);
    const sphere = seg(t, SPHERE_FROM, SPHERE_FROM + 1.2);
    if (sphere > 0) drawHairyBall(ctx, t, sphere);

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 250) => wrap(ctx, s, RIGHT, y, 660, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('The fibre over a base point is a circle with no marked zero: only differences of angles are defined. A section marks a zero on every fibre, smoothly.', 1, 9);
    note('The chemist’s choice, the torsion angle: measure the lips from the half-plane through the axis and bead 1.', 9.4, 16);
    note('It works as long as bead 1 and lip 4 stay off the axis, which covers every chemically reasonable shape. Near the axis, a tiny motion of bead 1 swings the zero all the way round. On it there is no zero.', 16.4, 27);
    note('In the lab frame there is something else to measure from: a fixed direction w in space. Its shadow in the plane of the lips is a zero mark for every bond direction u …', SPHERE_FROM + 0.4, 34.6);
    note('… except where u points along ±w. Any other choice fails somewhere too: a continuous zero mark for every u would comb a hairy ball flat.', 35, TABLE_FROM - 0.6);
    drawTable(ctx, t);
  },
});

/** The molecule, the half-plane through the axis and bead 1, its zero mark and the torsion angle. */
function drawTorsion(ctx, t, alpha) {
  const cam = nitroCamera({ cx: 420, cy: 480, scale: 165, yaw: 0.78, pitch: 0.36 });
  const [eps, psi] = beadOneAt(t);
  const phi = lipsAt(t);
  const X = withBeadOne(turnRotor(X0, phi), eps, psi);
  const circle = rotorCircle(X0);
  const shown = alpha * seg(t, 0.4, 1.2);

  drawRotorAxis(ctx, cam, X, { alpha: shown, after: 2.1, before: 2 });
  drawRotorCircle(ctx, cam, X0, { alpha: 0.7 * shown });

  // the half-plane through the axis and bead 1, and where it meets the lips' circle
  const plane = seg(t, 9.6, 11) * alpha;
  const zeroDir = [0, Math.cos(psi), Math.sin(psi)];
  const reach = circle.radius * 1.25;
  const back = nitro.atom(X0, 1);
  const front = vec3.add(circle.centre, [0.35, 0, 0]);
  const definedness = Math.min(1, Math.sin(eps) / Math.sin(NEAR * 1.6));
  const corners = [vec3.sub(back, [0.6, 0, 0]), front, vec3.add(front, vec3.scale(zeroDir, reach)), vec3.add(vec3.sub(back, [0.6, 0, 0]), vec3.scale(zeroDir, reach))];
  polygon3(ctx, cam, corners, { fill: rgba(color.ink, 0.08), stroke: rgba(color.ink, 0.5), width: 1.2, alpha: plane * Math.max(0.25, definedness) });
  const zero = circlePoint({ ...circle, e1: [0, 1, 0], e2: [0, 0, 1] }, psi);
  const zp = cam.project(zero);
  dot(ctx, zp.x, zp.y, 6, color.ink, plane);
  text(ctx, '0', zp.x - 16, zp.y - 10, { ...type.math, size: 26, color: color.ink, align: 'right', alpha: plane });

  // the torsion angle from the zero mark to lip 4
  const lip = rotorCircle(X, 3);
  const lipAngle = Math.atan2(vec3.dot(lip.e1, [0, 0, 1]), vec3.dot(lip.e1, [0, 1, 0]));
  let torsion = lipAngle - psi;
  torsion = Math.atan2(Math.sin(torsion), Math.cos(torsion));
  const arcAlpha = fade(t, 11, 12, 16, 17) * alpha;
  if (arcAlpha > 0) {
    const n = 40;
    const pts = Array.from({ length: n + 1 }, (_, k) => circlePoint({ ...circle, e1: [0, 1, 0], e2: [0, 0, 1] }, psi + (torsion * k) / n));
    polyline3(ctx, cam, pts, { color: ROTOR, width: 4.5, alpha: arcAlpha });
  }
  const readout = fade(t, 11, 12, 26.4, 27) * alpha;
  const deg = (torsion * 180) / Math.PI;
  const label = Math.sin(eps) < Math.sin(NEAR) * 1.05 && t > 19.5 && t < 25 ? 'undefined near the line' : `${deg >= 0 ? '+' : '−'}${Math.abs(deg).toFixed(0)}°`;
  text(ctx, `torsion angle  ${label}`, 420, 790, { font: font.mono, size: 20, color: ROTOR, align: 'center', alpha: readout });

  drawMolecule(ctx, X, cam, { molecule: nitro, opacity: alpha, labels: 0.8, highlight: 0, highlightColor: color.ink, highlightAlpha: fade(t, 9.6, 10.4, 26, 27) });
}

/** The sphere of bond directions with the zero marks given by a fixed direction w: two bald spots. */
function drawHairyBall(ctx, t, alpha) {
  const cam = camera({ cx: 420, cy: 500, scale: 210, yaw: 0.5, pitch: 0.42, focal: 12 });
  const sphere = (a, b) => [Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)];
  ctx.save();
  ctx.globalAlpha = 0.85 * alpha;
  drawSurface(ctx, cam, sphere, { nu: 40, nv: 20, v: [0, Math.PI], color: () => '#24345a', ambient: 0.5 });
  ctx.restore();

  const w = [0, 1, 0];
  const field = (p) => vec3.sub(w, vec3.scale(p, vec3.dot(w, p)));
  const facing = (p) => cam.rotate(p)[2] < -0.05;
  for (let i = 1; i < 9; i++) {
    const b = (i * Math.PI) / 9;
    const count = Math.max(4, Math.round(16 * Math.sin(b)));
    for (let k = 0; k < count; k++) {
      const p = sphere((k * 2 * Math.PI) / count + 0.2 * i, b);
      if (!facing(p)) continue;
      const v = field(p);
      arrow3(ctx, cam, vec3.scale(p, 1.01), vec3.scale(v, 0.32), { color: color.ink, width: 2, head: 8, alpha: alpha * 0.7 });
    }
  }
  const pole = cam.project(w);
  ring(ctx, pole.x, pole.y, 14, color.stiff, alpha * seg(t, 35, 36));
  text(ctx, 'u = w: no zero mark', pole.x + 40, pole.y - 40, { ...type.note, color: color.stiff, alpha: alpha * seg(t, 35, 36) });
  text(ctx, 'and at u = −w, behind', 420, 780, { ...type.note, color: color.stiff, align: 'center', alpha: alpha * seg(t, 35.6, 36.6) });

  // one bond direction u travelling to the pole, with the plane of the lips and its zero mark
  const travel = seg(t, SPHERE_FROM + 2, SPHERE_FROM + 7);
  const b = lerp(1.9, 0.02, travel);
  const u = sphere(0.9, b);
  const e1 = vec3.normalize(vec3.cross(u, [0.3, 0.2, 1]));
  const e2 = vec3.cross(u, e1);
  const disc = Array.from({ length: 4 }, (_, k) => {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    return vec3.add(u, vec3.add(vec3.scale(e1, 0.36 * Math.cos(a)), vec3.scale(e2, 0.36 * Math.sin(a))));
  });
  const travelAlpha = alpha * fade(t, SPHERE_FROM + 1, SPHERE_FROM + 2, TABLE_FROM - 1, TABLE_FROM);
  polygon3(ctx, cam, disc, { fill: rgba(ROTOR, 0.18), stroke: rgba(ROTOR, 0.8), width: 1.5, alpha: travelAlpha });
  const v = field(u);
  if (vec3.length(v) > 0.03) arrow3(ctx, cam, u, vec3.scale(v, 0.5), { color: color.ink, width: 3.5, head: 12, alpha: travelAlpha });
  const up = cam.project(u);
  dot(ctx, up.x, up.y, 6, ROTOR, travelAlpha);
  text(ctx, 'u', up.x + 12, up.y + 24, { ...type.math, size: 26, color: ROTOR, alpha: travelAlpha });
  text(ctx, 'sphere of bond directions u', 420, 236, { ...type.note, align: 'center', alpha });
  text(ctx, 'plane of the lips ⊥ u, with its zero mark', 420, 262, { ...type.note, color: ROTOR, align: 'center', alpha: travelAlpha });
}

const ROWS = [
  ['translations', 'a canonical global section: the centre of mass', color.ink],
  ['the rotor, on reasonable shapes', 'a section: the torsion angle, while bead 1 and lip 4 stay off the axis', ROTOR],
  ['the rotor, on all configurations', 'no continuous one: hairy ball (bond), Hopf (lips through the axis)', ROTOR],
  ['SO(3), the orientation', 'a global body frame for N = 3, none at all for N ≥ 4 (Littlejohn–Reinsch)', VERTICAL],
];

function drawTable(ctx, t) {
  const a = seg(t, TABLE_FROM, TABLE_FROM + 0.8);
  if (a <= 0) return;
  text(ctx, 'WHICH SECTIONS EXIST', RIGHT, 250, { font: font.mono, size: 15, weight: 500, color: color.gold, tracking: 1.5, alpha: a });
  ROWS.forEach(([what, answer, tint], k) => {
    const y = 300 + k * 92;
    const r = seg(t, TABLE_FROM + 0.8 + 1.6 * k, TABLE_FROM + 1.6 + 1.6 * k);
    line(ctx, RIGHT, y - 30, RIGHT + 660, y - 30, { color: color.line, alpha: r });
    text(ctx, what, RIGHT, y, { ...type.body, size: 21, color: tint, alpha: r });
    text(ctx, answer, RIGHT, y + 30, { ...type.note, size: 16, alpha: r });
  });
  wrap(ctx, 'The fibre has no origin of its own; a section supplies one. Canonical is a further wish: no zero for the lips can treat the two identical O atoms alike.', RIGHT, 700, 660, 30, {
    ...type.body,
    size: 21,
    alpha: seg(t, TABLE_FROM + 8, TABLE_FROM + 9),
  });
}
