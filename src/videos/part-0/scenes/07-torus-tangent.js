import {
  defineScene, seg, fade, text, wrap, type, font, color, rgba, tex, dot, ring,
  drawSurface, polyline3, polygon3, arrow3, vec3,
} from '../../../kit.js';
import {
  VERTICAL, HORIZONTAL, torusPoint, torusEnergy, torusCamera, energyColor, facesCamera, fibreTangent, baseTangent,
} from '../shared.js';

const P = { theta: -1.3, phi: -0.5 }; // on the side facing the camera
const SPLIT = tex(String.raw`T_pT^2 = V_p \oplus H_p`, 'T_pT² = V_p ⊕ H_p');
const GENERAL = tex(String.raw`T_pP = V_p \oplus H_p, \qquad V_p \cong T_p(\text{fibre})`, 'T_pP = V_p ⊕ H_p,   V_p ≅ T_p(fibre)');
const circle = (f, n = 120) => Array.from({ length: n + 1 }, (_, i) => f((i / n) * 2 * Math.PI));

export default defineScene({
  name: 'Vertical and horizontal',
  duration: 24,
  narration:
    'Take one point p of the torus and its tangent plane. One direction runs along the fibre: the symmetry, under which the energy stays the same. That is the vertical space. The other runs across the fibres, where the energy changes: the horizontal space. In any bundle the tangent space splits this way; the vertical part is the tangent space of the fibre, the horizontal part connects neighbouring fibres. Which horizontal space we choose is called a connection.',
  header: { eyebrow: '04 · CONNECTIONS', title: 'At every point, the tangent plane splits' },

  draw(ctx, t) {
    const cam = torusCamera({ cx: 540, cy: 560, scale: 125 });
    drawSurface(ctx, cam, torusPoint, { nu: 64, nv: 24, color: (theta) => energyColor(torusEnergy(theta)), alpha: 0.95 });

    const p = torusPoint(P.theta, P.phi);
    const eV = fibreTangent(P.theta, P.phi);
    const eH = baseTangent(P.theta);

    // the two generating flows: around the fibre, then along the big circle
    const fibreFlow = fade(t, 2, 2.6, 6.4, 7);
    const baseFlow = fade(t, 6.6, 7.2, 11, 11.6);
    polyline3(ctx, cam, circle((phi) => torusPoint(P.theta, phi)), {
      color: VERTICAL,
      width: 3.5,
      alpha: fibreFlow,
      visible: (i) => facesCamera(cam, P.theta, (i / 120) * 2 * Math.PI),
    });
    polyline3(ctx, cam, circle((theta) => torusPoint(theta, P.phi)), {
      color: HORIZONTAL,
      width: 3.5,
      alpha: baseFlow,
      visible: (i) => facesCamera(cam, (i / 120) * 2 * Math.PI, P.phi),
    });
    const runner = fibreFlow > 0 ? torusPoint(P.theta, P.phi + 2 * Math.PI * seg(t, 2.4, 6.2)) : torusPoint(P.theta + 2 * Math.PI * seg(t, 7, 10.8), P.phi);
    const runnerTheta = fibreFlow > 0 ? P.theta : P.theta + 2 * Math.PI * seg(t, 7, 10.8);
    const r = cam.project(runner);
    if (fibreFlow + baseFlow > 0.01) dot(ctx, r.x, r.y, 7, color.ink, Math.max(fibreFlow, baseFlow));
    text(ctx, `U = ${torusEnergy(runnerTheta).toFixed(2)}`, 960, 560, {
      font: font.mono,
      size: 28,
      color: energyColor(torusEnergy(runnerTheta)),
      alpha: Math.max(fibreFlow, baseFlow),
    });

    // tangent plane with the vertical and the (possibly tilted) horizontal direction
    const plane = seg(t, 0.8, 1.8);
    const s = 0.7;
    const corner = (a, b) => vec3.add(p, vec3.add(vec3.scale(eH, a * s), vec3.scale(eV, b * s)));
    polygon3(ctx, cam, [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], { fill: rgba(color.ink, 0.16), stroke: rgba(color.ink, 0.6), alpha: plane });
    const tilt = 0.55 * Math.sin(Math.PI * seg(t, 16.5, 19)) + 0.3 * seg(t, 19, 21);
    const h = vec3.add(vec3.scale(eH, Math.cos(tilt)), vec3.scale(eV, Math.sin(tilt)));
    const vTip = arrow3(ctx, cam, p, vec3.scale(eV, 0.7), { color: VERTICAL, width: 5, head: 16, alpha: plane });
    const hTip = arrow3(ctx, cam, p, vec3.scale(h, 0.7), { color: HORIZONTAL, width: 5, head: 16, alpha: plane });
    if (tilt > 0.02) arrow3(ctx, cam, p, vec3.scale(eH, 0.7), { color: HORIZONTAL, width: 2, head: 10, dash: [4, 5], alpha: 0.6 });
    text(ctx, 'V_p', vTip.x + 8, vTip.y - 8, { ...type.math, size: 26, color: VERTICAL, alpha: plane });
    text(ctx, 'H_p', hTip.x + 10, hTip.y + 8, { ...type.math, size: 26, color: HORIZONTAL, alpha: plane });
    const pp = cam.project(p);
    dot(ctx, pp.x, pp.y, 6, color.ink, plane);
    text(ctx, 'p', pp.x - 22, pp.y + 22, { ...type.math, alpha: plane });

    const words = { ...type.body, size: 21 };
    text(ctx, 'V_p: along the fibre. U does not change.', 960, 270, { ...words, color: VERTICAL, alpha: seg(t, 2.5, 3.3) });
    text(ctx, 'H_p: across the fibres. U changes.', 960, 310, { ...words, color: HORIZONTAL, alpha: seg(t, 7.2, 8) });
    SPLIT.draw(ctx, 960, 372, { size: 32, alpha: seg(t, 11, 12) });
    GENERAL.draw(ctx, 960, 440, { size: 26, alpha: seg(t, 12.5, 13.5) });
    wrap(ctx, 'For any bundle P → M the vertical space is the tangent space of the fibre, and the horizontal space connects neighbouring fibres.', 960, 486, 580, 28, {
      ...type.body,
      size: 19,
      alpha: seg(t, 13, 14),
    });
    wrap(ctx, 'H_p is not forced on us: tilting it gives another valid choice. That choice is called a connection.', 960, 650, 580, 30, {
      ...words,
      color: color.ink,
      alpha: seg(t, 16, 17),
    });
  },
});
