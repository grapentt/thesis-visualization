import { defineScene, seg, text, wrap, type, color, camera, rotation, vec3, arrow } from '../../../kit.js';
import { PAIR_MOL, SCORE_W, SCORE_P, POSE, VERTICAL, drawMol, drawHalo, drawHBond } from '../shared.js';
import { diagramCamera, drawFloor, drawFibres, PROFILE_SITES } from '../diagram.js';
import { centroid } from '../toy.js';
import { DOCKED } from '../data.js';

// DOCKED centred on its plain centroid, so the global rotation turns it in place.
const C = centroid(DOCKED.X);
const BODY = Array.from(DOCKED.X, (v, i) => v - C[i % 3]);
const atom = (X, i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
const AXIS = vec3.normalize([0.2, 1, 0.1]);
const OMEGA = 0.09; // rad/s

const turned = (t) => {
  const R = rotation.axisAngle(AXIS, OMEGA * t);
  const X = [];
  for (let i = 0; i < BODY.length / 3; i++) X.push(...rotation.apply(R, atom(BODY, i)));
  return X;
};

/**
 * Faint gold ring about the turn axis (nearly vertical), drawn flat under the pair. Far side
 * dimmer; the gap and the head are on the near side and show the sense of the turn, taken from
 * how a point in front of the pair moves on screen.
 */
function rotationArc(ctx, cam, alpha) {
  if (alpha <= 0.003) return;
  const p = [[2, 0, 0], [-2, 0, 0], [0, 0, 2], [0, 0, -2]].reduce((m, q) => (cam.project(q).z < cam.project(m).z ? q : m)); // nearest to the eye
  const v = vec3.cross(AXIS, p), a = cam.project(p), b = cam.project(vec3.add(p, vec3.scale(v, 0.01)));
  const sense = Math.sign(b.x - a.x) || 1; // +1: the near side moves right
  const [cx, cy, rx, ry] = [1160, 735, 200, 34];
  const at = (phi) => ({ x: cx + rx * Math.cos(phi), y: cy + ry * Math.sin(phi) }); // phi = π/2 is the near side
  // increasing φ moves the near side left, so the path runs in −sense·φ and the head ends moving with the near side
  const s = Array.from({ length: 97 }, (_, k) => at(Math.PI / 2 - sense * (0.45 + ((2 * Math.PI - 0.9) * k) / 96)));
  ctx.save();
  const g = ctx.globalAlpha;
  ctx.strokeStyle = VERTICAL;
  ctx.lineWidth = 2.5;
  for (let k = 0; k < 94; k++) {
    ctx.globalAlpha = g * alpha * (1 - 0.65 * (cy + ry - s[k].y) / (2 * ry)); // far side (top) dimmer
    ctx.beginPath();
    ctx.moveTo(s[k].x, s[k].y);
    ctx.lineTo(s[k + 1].x, s[k + 1].y);
    ctx.stroke();
  }
  ctx.restore();
  arrow(ctx, s[91].x, s[91].y, s[96].x, s[96].y, { color: VERTICAL, width: 2.5, head: 13, alpha });
}

export default defineScene({
  name: 'Title',
  duration: 12,
  narration: 'Two molecules, a frozen model of each one alone, and one learned term that binds them. This is how it works, and why.',

  draw(ctx, t) {
    // the master diagram's silhouette, far behind
    const ghost = 0.2 * seg(t, 0.4, 2);
    const dcam = diagramCamera({ cx: 1160, cy: 470, scale: 60 });
    drawFloor(ctx, dcam, { alpha: ghost, grid: false, caption: false });
    drawFibres(ctx, dcam, { alpha: ghost, sites: PROFILE_SITES, glyphs: false, caption: false });

    // the docked pair, turning slowly as a whole
    const cam = camera({ cx: 1160, cy: 470, scale: 105, yaw: 0.45, pitch: 0.32 });
    const X = turned(t);
    const a = seg(t, 0.4, 2);
    rotationArc(ctx, cam, 0.5 * a);
    drawHalo(ctx, cam, X, [0, 3], SCORE_W, { alpha: a });
    drawHalo(ctx, cam, X, [3, 7], SCORE_P, { alpha: a });
    drawMol(ctx, X, cam, PAIR_MOL, { opacity: a });
    drawHBond(ctx, cam, atom(X, DOCKED.hbond.h), atom(X, DOCKED.hbond.o), { alpha: seg(t, 3, 4.2), label: false });

    const b = seg(t, 0.2, 1.4);
    text(ctx, 'MASTER’S THESIS · INTERACTIONS', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: b });
    text(ctx, 'Parts', 100, 388, { ...type.title, size: 78, alpha: b });
    text(ctx, 'and poses', 100, 474, { ...type.title, size: 78, italic: true, color: POSE, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'Learning how molecules bind from diffusion models of each molecule: two frozen parts, one learned interaction, and the bundle that explains why it is exact.', 100, 548, 640, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });
  },
});
