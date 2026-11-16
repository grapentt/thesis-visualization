import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, tex, arrow3, dot, drawMolecule, drawSurface, polyline3, polygon3,
  camera, vec3,
} from '../../../kit.js';
import { nitro, X0, nitroCamera, rotorCircle, circlePoint, drawRotorAxis, drawRotorCircle, turnRotor, ROTOR } from '../shared.js';
import { BEAD } from '../beads.js';

const RIGHT = 860;
const SPHERE_FROM = 14;
const SWING = [26, 40];
const THETA = (50 * Math.PI) / 180; // the cone the bond swings around
const SOLID = 2 * Math.PI * (1 - Math.cos(THETA));
const REFERENCE = Math.atan2(0.78, 1.2); // direction of bead 1 around the bond, in the rest pose

const LINE_BUNDLE = tex(String.raw`L = X \times_{U(1)} \mathbb{C}, \qquad L\big|_{S^2} \cong TS^2`, 'L = X ×_U(1) ℂ,   L|S² ≅ TS²');
const HOLONOMY = tex(String.raw`\text{turn} = \Omega = 2\pi\,(1 - \cos\theta)`, 'turn = Ω = 2π (1 − cos θ)');
const CHERN = tex(String.raw`\frac{1}{2\pi}\int_{S^2} K\, dA = \frac{4\pi}{2\pi} = 2`, '(1/2π) ∫ K dA = 4π/2π = 2');

/** Bond direction on the cone (y is up), s ∈ [0, 2π]. */
const bondAt = (s) => [Math.sin(THETA) * Math.cos(s), Math.cos(THETA), Math.sin(THETA) * Math.sin(s)];

// the lip direction carried along without turning about the bond: project onto each new tangent plane
const STEPS = 720;
const TRANSPORTED = (() => {
  const out = [];
  let v = vec3.normalize(vec3.cross(bondAt(0), [0, 1, 0]));
  for (let k = 0; k <= STEPS; k++) {
    const u = bondAt((2 * Math.PI * k) / STEPS);
    v = vec3.normalize(vec3.sub(v, vec3.scale(u, vec3.dot(v, u))));
    out.push(v);
  }
  return out;
})();

export default defineScene({
  name: 'The rotor’s plane',
  duration: 50,
  narration:
    'Replace the two lips by the plane they turn in, with one point in it that turns along with them. That is the associated bundle of the rotor, a complex line bundle. To get a section you need a reference in the plane, such as the direction of bead one: the lip measured from it is a section, zero where the lip is on the axis and undefined where bead one is. The plane is perpendicular to the bond, so over the sphere of bond directions the line bundle is the tangent bundle of the sphere. What does it mean that the lips do not turn while the bond swings? The mechanical connection says: no spin about the bond. Swing the bond once around a cone, and the lips come back turned by the solid angle the cone encloses, like a Foucault pendulum. The total curvature is four pi, twice two pi: Chern number two, counted by the two bond directions where the reference lines up with the bond. The hairy ball once more.',
  header: { eyebrow: '11 · THE ROTOR’S ASSOCIATED BUNDLE', title: 'Two lips become one plane' },

  draw(ctx, t) {
    const sphere = seg(t, SPHERE_FROM - 1, SPHERE_FROM);
    if (sphere < 1) drawPlaneOfLips(ctx, t, 1 - sphere);
    if (sphere > 0) drawSphere(ctx, t, sphere);

    const words = { ...type.body, size: 21 };
    const note = (s, from, to, y = 240) => wrap(ctx, s, RIGHT, y, 660, 30, { ...words, alpha: fade(t, from, from + 0.8, to, to + 0.6) });
    note('Replace the two lips by the plane they turn in, with one point in it that turns along with them: the rotor’s associated bundle, a complex line bundle.', 1, 8);
    note('A section needs a reference in the plane, such as the direction of bead 1. The lip measured from it, distance ρ and angle τ, is a section: zero where the lip is on the axis, undefined where bead 1 is.', 8.4, 13.6);
    note('The plane is perpendicular to the bond. Over the sphere of bond directions the line bundle is the tangent bundle of the sphere, up to orientation.', SPHERE_FROM + 0.4, 25.4);
    note('“The lips do not turn” needs a connection, and here it is a choice: turning the lips conserves no momentum. The natural one says: no spin about the bond. Swing the bond around a cone and carry the lips along …', SWING[0] - 0.4, SWING[1]);
    note('… they come back turned by the solid angle the cone encloses, like the swing plane of a Foucault pendulum. Curvature here is area on the sphere.', SWING[1] + 0.4, 50);
    LINE_BUNDLE.draw(ctx, RIGHT, 400, { size: 28, alpha: seg(t, 4, 5) });
    HOLONOMY.draw(ctx, RIGHT, 500, { size: 28, alpha: seg(t, SWING[1] + 1, SWING[1] + 2) });
    text(ctx, `here θ = 50°:  Ω = ${((SOLID * 180) / Math.PI).toFixed(1)}°`, RIGHT, 542, { ...type.note, alpha: seg(t, SWING[1] + 1.5, SWING[1] + 2.5) });
    CHERN.draw(ctx, RIGHT, 640, { size: 28, alpha: seg(t, 44, 45) });
    text(ctx, 'Chern number 2: the two bond directions where bead 1 lines up with the bond', RIGHT, 696, { ...type.note, alpha: seg(t, 44.6, 45.6) });
    text(ctx, '(the zero marks of the hairy ball, again)', RIGHT, 720, { ...type.note, alpha: seg(t, 44.6, 45.6) });
    text(ctx, 'for two identical lips opposite each other, where the natural choices agree', RIGHT, 860, { ...type.note, size: 14, alpha: seg(t, 30, 31) });
  },
});

/** The molecule; the lips fade into the plane perpendicular to the bond, with one point in it. */
function drawPlaneOfLips(ctx, t, alpha) {
  const cam = nitroCamera({ cx: 420, cy: 470, scale: 165, yaw: 0.78, pitch: 0.36 });
  const phi = 0.9 * Math.sin((2 * Math.PI * lin(t, 8.5, 13.5)));
  const X = turnRotor(X0, phi);
  const toPlane = seg(t, 2, 4.5);
  const circle = rotorCircle(X0);
  const corners = [0, 1, 2, 3].map((k) => circlePoint({ ...circle, radius: circle.radius * 1.55 }, Math.PI / 4 + (k * Math.PI) / 2));
  drawRotorAxis(ctx, cam, X0, { alpha: alpha, after: 2.1 });
  polygon3(ctx, cam, corners, { fill: rgba(ROTOR, 0.14), stroke: rgba(ROTOR, 0.8), width: 1.5, alpha: alpha * toPlane });
  drawRotorCircle(ctx, cam, X0, { alpha: alpha * (1 - 0.5 * toPlane) });
  drawMolecule(ctx, X, cam, { molecule: nitro, opacity: alpha, labels: 0, atomAlpha: [1, 1, 1, 1 - toPlane, 1 - toPlane] });
  // the section: lip 4's position in the plane
  const p = circlePoint(circle, phi);
  const c = cam.project(circle.centre);
  const s = cam.project(p);
  const a = alpha * toPlane;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = BEAD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(s.x, s.y);
  ctx.stroke();
  ctx.restore();
  dot(ctx, s.x, s.y, 9, BEAD, a);
  dot(ctx, c.x, c.y, 4, color.ink, a);
  text(ctx, 'the lip, seen in the plane', s.x + 16, s.y - 12, { ...type.note, color: BEAD, alpha: a });
  // the reference: the direction of bead 1 in the plane, and the angle τ measured from it
  const ref = seg(t, 8.6, 9.6) * alpha;
  const axes = { ...circle, e1: [0, 1, 0], e2: [0, 0, 1] };
  const r = cam.project(circlePoint({ ...axes, radius: circle.radius * 1.3 }, REFERENCE));
  ctx.save();
  ctx.globalAlpha = ref;
  ctx.strokeStyle = color.ink;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(r.x, r.y);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'bead 1’s direction', r.x + 10, r.y + 4, { ...type.note, alpha: ref });
  const lip = Math.atan2(vec3.dot(vec3.sub(p, circle.centre), [0, 0, 1]), vec3.dot(vec3.sub(p, circle.centre), [0, 1, 0]));
  const tau = Math.atan2(Math.sin(lip - REFERENCE), Math.cos(lip - REFERENCE));
  const arc = Array.from({ length: 41 }, (_, k) => circlePoint({ ...axes, radius: circle.radius * 0.45 }, REFERENCE + (tau * k) / 40));
  polyline3(ctx, cam, arc, { color: BEAD, width: 3, alpha: ref });
  const mid = cam.project(circlePoint({ ...axes, radius: circle.radius * 0.62 }, REFERENCE + tau / 2));
  text(ctx, 'τ', mid.x, mid.y + 8, { ...type.math, size: 26, color: BEAD, align: 'center', alpha: ref });
  text(ctx, 'plane ⊥ bond', c.x + 10, c.y + 150, { ...type.note, color: ROTOR, alpha: a });
}

/** The sphere of bond directions; the bond swings around a cone carrying the plane and the lip direction. */
function drawSphere(ctx, t, alpha) {
  const cam = camera({ cx: 420, cy: 500, scale: 200, yaw: 1.15, pitch: -0.62, focal: 12 });
  const ball = (a, b) => [Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)];
  ctx.save();
  ctx.globalAlpha = 0.8 * alpha;
  drawSurface(ctx, cam, ball, { nu: 40, nv: 20, v: [0, Math.PI], color: () => '#24345a', ambient: 0.5 });
  ctx.restore();
  const front = (p) => cam.rotate(p)[2] < 0;

  // the cone's circle on the sphere
  const n = 180;
  const latitude = Array.from({ length: n + 1 }, (_, k) => bondAt((2 * Math.PI * k) / n));
  polyline3(ctx, cam, latitude, { color: ROTOR, width: 2.5, alpha: alpha * seg(t, SWING[0] - 1, SWING[0]), visible: (k) => front(latitude[k]) });
  polyline3(ctx, cam, latitude, { color: ROTOR, width: 1.2, dash: [4, 6], alpha: 0.5 * alpha * seg(t, SWING[0] - 1, SWING[0]), visible: (k) => !front(latitude[k]) });

  const s = 2 * Math.PI * lin(t, ...SWING);
  const k = Math.round((s / (2 * Math.PI)) * STEPS);
  const u = bondAt(s);
  const v = TRANSPORTED[k];
  const w = vec3.cross(u, v);
  const disc = Array.from({ length: 4 }, (_, j) => {
    const a = (j * Math.PI) / 2 + Math.PI / 4;
    return vec3.add(u, vec3.add(vec3.scale(v, 0.5 * Math.cos(a)), vec3.scale(w, 0.5 * Math.sin(a))));
  });
  polygon3(ctx, cam, disc, { fill: rgba(ROTOR, 0.2), stroke: rgba(ROTOR, 0.9), width: 1.5, alpha });
  arrow3(ctx, cam, [0, 0, 0], u, { color: color.ink, width: 3, head: 12, alpha });
  const tip = cam.project(u);
  text(ctx, 'u', tip.x - 22, tip.y - 12, { ...type.math, size: 26, alpha });

  // the transported lip direction; after the loop, its starting direction as a ghost
  if (t > SWING[1]) arrow3(ctx, cam, u, vec3.scale(TRANSPORTED[0], 0.46), { color: color.muted, width: 2.5, head: 10, alpha: alpha * seg(t, SWING[1], SWING[1] + 0.6) });
  arrow3(ctx, cam, u, vec3.scale(v, 0.46), { color: BEAD, width: 3.5, head: 12, alpha });
  text(ctx, 'sphere of bond directions', 420, 236, { ...type.note, align: 'center', alpha });
  text(ctx, 'the plane of the lips is the tangent plane at u', 420, 262, { ...type.note, color: ROTOR, align: 'center', alpha });
  const turned = (Math.acos(Math.max(-1, Math.min(1, vec3.dot(v, TRANSPORTED[0])))) * 180) / Math.PI;
  text(ctx, t > SWING[1] ? `back at the start, the lips have turned by ${turned.toFixed(0)}°` : '', 420, 790, { font: font.mono, size: 18, color: BEAD, align: 'center', alpha: alpha * seg(t, SWING[1], SWING[1] + 0.6) });
}
