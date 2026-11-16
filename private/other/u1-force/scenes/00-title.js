// Scene 00: the cold open. A charge circles in a uniform magnetic field, drawn as a faint violet glow,
// with a large dial riding along the orbit (its hand turning by the transported phase). Then the title.
import { defineScene, seg, fade, text, wrap, type, color, font, rgba, line, dot, C, frame, drawPath, drawDial, drawRunner, drawVector, stamp, fmt } from '../shared.js';
import { planeField, borisStep, transport, cyclotron } from '../math.js';

// a uniform magnetic field B along +z (in units of ħ/e), the symmetric gauge for its connection
const B0 = 1;
const FIELD = planeField({ B0 });
const Q = 1;
const M = 1;
const SPEED = 1.15;
const DT = 1 / 120;
const DURATION = 18;
/** The orbit, integrated with the Boris step from (r, 0) moving in −y: a positive charge circulates clockwise seen from +z. */
const ORBIT = (() => {
  const { radius } = cyclotron(Q, M, B0, SPEED);
  const s = { x: radius, y: 0, vx: 0, vy: -SPEED };
  const pts = [[s.x, s.y]];
  const vel = [[s.vx, s.vy]];
  for (let i = 0; i < DURATION * 120 + 2; i++) {
    borisStep(s, { q: Q, m: M, B: B0, E: [0, 0] }, DT);
    pts.push([s.x, s.y]);
    vel.push([s.vx, s.vy]);
  }
  return { pts, vel, radius, period: cyclotron(Q, M, B0, SPEED).period };
})();
/** The phase carried along the orbit: θ_i = ∫ ω along it (the hand of the dial). */
const THETA = transport(FIELD, ORBIT.pts, 0);

/** The plane's frame slides from the centre of the stage (the cold open) to the right (the title). */
const planeFrame = (t) => {
  const k = seg(t, 10.2, 12.2);
  return frame({ x: 490 + (900 - 490) * k, y: 150 + (150 - 150) * k, w: 620, h: 620, u: [-2, 2], v: [-2, 2] });
};

export default defineScene({
  name: 'Cold open',
  duration: DURATION,
  narration: [
    [0, 'There is no rope. Nothing pulls this charge to the centre, and the field does no work on it. What bends its path? A curvature. Not of space: of a circle over every point of space. By the end, the force law will be a picture.'],
  ],

  draw(ctx, t) {
    const F = planeFrame(t);
    const on = seg(t, 0.2, 1.4);
    const [cx, cy] = F.point([0, 0]);
    const reach = 0.56 * F.w; // the vignette's radius: the field fades out before the frame's edge
    // the field, painted quietly: a faint violet glow with a soft radial vignette, no frame
    ctx.save();
    ctx.globalAlpha *= on;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
    glow.addColorStop(0, rgba(C.curvature, 0.24));
    glow.addColorStop(0.55, rgba(C.curvature, 0.15));
    glow.addColorStop(1, rgba(C.curvature, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(F.x - 40, F.y - 40, F.w + 80, F.h + 80);
    ctx.restore();
    // "a circle over every point": faint fibres (dials without hands) fade in when it is said
    const fibres = seg(t, 8.4, 10.2);
    if (fibres > 0.003) {
      for (let u = -1.75; u <= 1.76; u += 0.5) {
        for (let v = -1.75; v <= 1.76; v += 0.5) {
          const [x, y] = F.point([u, v]);
          const vig = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / reach);
          drawDial(ctx, x, y, 8, 0, { hand: false, ringColour: C.fibre, alpha: 0.42 * fibres * Math.min(1, 1.6 * vig), width: 1.6 });
        }
      }
    }

    // the orbit so far: a trail of most of a lap, fading to nothing at its tail
    const k = Math.min(ORBIT.pts.length - 1, Math.max(0, Math.floor(t / DT)));
    const lap = Math.round((0.8 * ORBIT.period) / DT);
    const trailFrom = Math.max(0, k - lap);
    if (k - trailFrom >= 2) {
      const trail = ORBIT.pts.slice(trailFrom, k + 1);
      const pieces = 28;
      const full = (k - trailFrom) / lap; // the trail grows during the first lap
      for (let p = 0; p < pieces; p++) {
        const i0 = Math.floor((trail.length - 1) * (p / pieces));
        const i1 = Math.floor((trail.length - 1) * ((p + 1) / pieces));
        if (i1 - i0 < 1) continue;
        const w = Math.pow((p + 1) / pieces, 1.6) * Math.min(1, 0.4 + full);
        drawPath(ctx, F, trail.slice(i0, i1 + 1), { colour: C.path, width: 1.2 + 2.6 * w, alpha: on * w });
      }
    }
    const p = ORBIT.pts[k];
    const v = ORBIT.vel[k];
    // the hook: no rope ties the charge to the centre (a struck-out tether, then gone)
    const rope = fade(t, 0.6, 1.4, 4.2, 5.4);
    const [px, py] = F.point(p);
    if (rope > 0.003) {
      line(ctx, cx, cy, px, py, { color: color.muted, width: 1.5, dash: [2, 6], alpha: 0.8 * rope });
      const mx = (cx + px) / 2;
      const my = (cy + py) / 2;
      const s = 9;
      line(ctx, mx - s, my - s, mx + s, my + s, { color: C.force, width: 2.5, alpha: rope });
      line(ctx, mx - s, my + s, mx + s, my - s, { color: C.force, width: 2.5, alpha: rope });
      dot(ctx, cx, cy, 3.5, color.muted, rope);
      // the label sits on the far side of the centre from the charge, so the tether never crosses it
      const d = Math.hypot(px - cx, py - cy) || 1;
      const away = 30 + (44 * Math.abs(px - cx)) / d; // farther when the label lies sideways (it is wide)
      text(ctx, 'no rope', cx - (away * (px - cx)) / d, cy - (away * (py - cy)) / d + 7, { ...type.label, size: 20, color: color.body, align: 'center', alpha: rope });
    }
    // the velocity (green) and the charge with a large dial riding outside the orbit (gold hand: the transported phase)
    drawVector(ctx, F, p, [v[0] / SPEED, v[1] / SPEED], { colour: C.kinetic, scale: 84, width: 3.5, alpha: on, head: 13 });
    const out = Math.hypot(p[0], p[1]) || 1;
    drawRunner(ctx, F, p, { colour: C.path, alpha: on, r: 8, dial: THETA[k], dialOffset: [(76 * p[0]) / out, (-76 * p[1]) / out], dialR: 38 });
    // the labels of the cold open
    const lab = fade(t, 1.2, 2, 10, 11.2);
    text(ctx, `a charge in a uniform magnetic field  B = ${fmt(B0, 0)}`, F.x + F.w / 2, F.y - 6, { ...type.note, color: C.curvature, align: 'center', alpha: lab });
    text(ctx, `speed ${fmt(SPEED, 2)}   radius ${fmt(ORBIT.radius, 2)}   phase carried along: θ = ${fmt(THETA[k], 2)}`, F.x + F.w / 2, F.y + F.h + 20, { font: font.mono, size: 15, color: color.muted, align: 'center', alpha: lab });

    // the title
    const a = seg(t, 11, 12.2);
    text(ctx, 'U(1) BUNDLES · HOLONOMY · STATIONARY ACTION', 100, 300, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'From phase', 100, 388, { ...type.title, size: 78, alpha: a });
    text(ctx, 'to force', 100, 474, { ...type.title, size: 78, italic: true, color: color.gold, alpha: seg(t, 11.4, 12.6) });
    wrap(ctx, 'Fibre bundles, connections and holonomy; stationary action; and why the curvature of a U(1) bundle, with the velocity plugged in, is the Lorentz force.', 100, 548, 700, 36, {
      ...type.body,
      size: 25,
      color: color.muted,
      alpha: seg(t, 12, 13.2),
    });
    text(ctx, 'Playable: in every live scene the controls under the video are yours.', 100, 690, { ...type.note, alpha: seg(t, 13, 14) });
    stamp(ctx, seg(t, 13.5, 14.5), 'the orbit and the dial are computed: a Boris step in B, the phase transported along it');
  },
});
