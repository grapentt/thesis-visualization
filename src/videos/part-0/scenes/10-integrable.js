import { defineScene, seg, text, wrap, type, color, tex, drawSurface, polyline3, vec3 } from '../../../kit.js';
import { createRng } from '../../../engine/random.js';
import { HORIZONTAL, torusPoint, torusEnergy, torusCamera, energyColor, facesCamera, baseTangent } from '../shared.js';

const TAU = 2 * Math.PI;
const GRID = [];
for (let i = 0; i < 48; i++) for (let j = 0; j < 14; j++) GRID.push([((i + 0.5) * TAU) / 48, ((j + 0.5) * TAU) / 14]);
// reveal the horizontal spaces in random order
const rng = createRng(5);
for (let i = GRID.length - 1; i > 0; i--) {
  const j = Math.floor(rng.uniform() * (i + 1));
  [GRID[i], GRID[j]] = [GRID[j], GRID[i]];
}
const LEAVES = [0.35, 1.25, 2.15, 3.05, 3.95, 4.85, 5.75];
const DISTRIBUTION = tex(String.raw`H = \bigsqcup_{p \in T^2} H_p \;\subset\; T\,T^2`, 'H = ⊔_{p ∈ T²} H_p ⊂ TT²');

export default defineScene({
  name: 'Horizontal distribution',
  duration: 26,
  narration:
    'Put a horizontal space at every point: together they form the horizontal distribution H. On the torus we can integrate it: there are curves tangent to H everywhere, so the distribution is integrable. Here that is automatic. The base is one-dimensional, so the curvature, a two-form on the base, must vanish: the connection is flat and the bundle is simply S¹ × S¹.',
  header: { eyebrow: '05 · CURVATURE', title: 'The horizontal distribution' },

  draw(ctx, t) {
    const cam = torusCamera({ cx: 540, cy: 480, scale: 120, yaw: 0.25 + 0.02 * t });
    drawSurface(ctx, cam, torusPoint, { nu: 64, nv: 24, color: (theta) => energyColor(torusEnergy(theta)), alpha: 0.9 });

    // more and more horizontal spaces
    const count = Math.floor(GRID.length * Math.pow(seg(t, 1, 8), 1.4));
    const fade = 1 - 0.6 * seg(t, 11, 12.5);
    ctx.save();
    ctx.globalAlpha = fade;
    for (let k = 0; k < count; k++) {
      const [theta, phi] = GRID[k];
      if (!facesCamera(cam, theta, phi)) continue;
      const p = torusPoint(theta, phi);
      const d = vec3.scale(baseTangent(theta), 0.17);
      polyline3(ctx, cam, [vec3.sub(p, d), vec3.add(p, d)], { color: HORIZONTAL, width: 2.5 });
    }
    ctx.restore();

    // integral curves of H: the circles φ = constant
    LEAVES.forEach((phi, k) => {
      const progress = seg(t, 11.5 + 0.4 * k, 14 + 0.4 * k);
      if (progress <= 0) return;
      const pts = Array.from({ length: 121 }, (_, i) => torusPoint((i / 120) * TAU, phi));
      polyline3(ctx, cam, pts, { color: HORIZONTAL, width: 3.5, progress, visible: (i) => facesCamera(cam, (i / 120) * TAU, phi) });
    });

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'One horizontal space H_p at every point p of the total space:', 960, 270, 580, 30, { ...words, alpha: seg(t, 1.5, 2.3) });
    DISTRIBUTION.draw(ctx, 960, 350, { size: 32, alpha: seg(t, 8.4, 9.4) });
    text(ctx, 'the horizontal distribution', 960, 400, { ...type.note, alpha: seg(t, 9, 10) });
    wrap(ctx, 'Integrate it: these circles are tangent to H everywhere.', 960, 470, 580, 30, { ...words, alpha: seg(t, 12, 12.8) });
    text(ctx, 'H is integrable.', 960, 530, { ...type.display, color: HORIZONTAL, alpha: seg(t, 14.5, 15.3) });
    wrap(ctx, 'Here this is automatic: the base M = S¹ is one-dimensional, so the curvature, a 2-form on M, has to vanish. The connection is flat, and the bundle is just the product S¹ × S¹.', 960, 600, 580, 30, {
      ...words,
      alpha: seg(t, 17.5, 18.5),
    });
  },
});
