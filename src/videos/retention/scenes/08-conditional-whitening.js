import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, rgba, tex, line, dot } from '../../../kit.js';
import { header, frame, axes, drawCurve, clipped, panel, caption, readout, PHI_TICKS, BOND, TORSION, MODEL, DATA, INFO } from '../shared.js';
import { samples, bondMean, bondSd, whiten, R } from '../toy.js';

const LEFT = frame({ x: 100, y: 236, w: 620, h: 380, u: [-Math.PI, Math.PI], v: [-0.2, 0.2] });
const RIGHT = frame({ x: 880, y: 236, w: 620, h: 380, u: [-Math.PI, Math.PI], v: [-4, 4] });
const XI = tex(String.raw`\xi = C(s)^{-1/2}\,\big(r - m(s)\big)`, 'ξ = C(s)^(−½) (r − m(s))');
const COND = tex(String.raw`p(r\mid s) \approx \mathcal N\big(m(s), C(s)\big)\ \Longrightarrow\ p(\xi\mid s)\approx\mathcal N(0, I)`, 'p(r|s) ≈ N(m(s), C(s))  ⇒  p(ξ|s) ≈ N(0, I)');
const JACOBIAN = tex(String.raw`\frac{\partial(\xi,s)}{\partial(r,s)} = \begin{pmatrix} 1/c & -\big(m'(s) + \xi\,c'(s)\big)/c \\ 0 & 1\end{pmatrix},\qquad C = c^2`, '∂(ξ,s)/∂(r,s) = [[1/c, −(m′ + ξ c′)/c], [0, 1]],  C = c²');

const XIS = samples.map((q) => whiten(q.r, q.phi));
const XI_MEAN = XIS.reduce((s, v) => s + v, 0) / XIS.length;
const XI_VAR = XIS.reduce((s, v) => s + (v - XI_MEAN) ** 2, 0) / XIS.length;

export default defineScene({
  name: 'Whitening the stiff conditional',
  duration: 75,
  narration: [
    [0, 'Full Gaussianisation would solve the generative problem itself, so the useful version is restricted. In a chart that separates stiff r from soft s, suppose r given s is nearly Gaussian with mean m of s and covariance C of s.'],
    [20, 'Then xi equals C to the minus one half times r minus m makes the stiff conditional standard normal, while s keeps its basins and its periodicity for an expressive soft model.'],
    [40, 'The coupling is not lost: m and C and their derivatives sit in the Jacobian, so the pulled-back metric keeps its off-diagonal term. Replacing it by independent blocks would discard exactly that coupling. This is a proposed extension, to be compared against the existing spring and invariant maps, with topology and decoding cost included.'],
  ],
  header: header(8, 'CONDITIONAL WHITENING', 'Straighten the stiff conditional, keep the soft model'),

  draw(ctx, t) {
    const a = seg(t, 0.4, 1.6);
    const morph = seg(t, 22, 28);
    axes(ctx, LEFT, { xTicks: PHI_TICKS, yTicks: [[-0.2, '−0.2'], [0, '0'], [0.2, '0.2']], xLabel: 'soft s = φ', alpha: a, box: true });
    axes(ctx, RIGHT, { xTicks: PHI_TICKS, yTicks: [-4, -2, 0, 2, 4], xLabel: 'soft s = φ', alpha: seg(t, 20, 21.5), box: true });
    caption(ctx, LEFT, 'stiff r (Å) given s: mean m(s), width c(s)', a, { color: BOND });
    caption(ctx, RIGHT, 'ξ | s: N(0, 1) for every s', seg(t, 20, 21.5), { color: MODEL });

    // the band of the conditional on the left, and ±2 on the right
    const bandAlpha = a * seg(t, 6, 7.5);
    drawCurve(ctx, LEFT, bondMean, { colour: BOND, alpha: bandAlpha, width: 2.5 });
    for (const sign of [2, -2]) drawCurve(ctx, LEFT, (phi) => bondMean(phi) + sign * bondSd(phi), { colour: BOND, alpha: bandAlpha, width: 1.5, dash: [6, 6] });
    text(ctx, 'm(s) ± 2c(s)', LEFT.x + LEFT.w - 10, LEFT.y + 22, { font: font.mono, size: 14, color: BOND, align: 'right', alpha: bandAlpha });
    const rightBand = seg(t, 24, 26);
    for (const v of [2, 0, -2]) line(ctx, RIGHT.x, RIGHT.Y(v), RIGHT.x + RIGHT.w, RIGHT.Y(v), { color: MODEL, width: v ? 1.5 : 2.5, dash: v ? [6, 6] : [], alpha: rightBand });
    text(ctx, '0 ± 2', RIGHT.x + RIGHT.w - 10, RIGHT.y + 22, { font: font.mono, size: 14, color: MODEL, align: 'right', alpha: rightBand });

    // the samples travel from (s, r) to (s, ξ)
    ctx.save();
    ctx.globalAlpha = a * 0.75;
    ctx.fillStyle = DATA;
    samples.forEach((q, i) => {
      const from = LEFT.point([q.phi, q.r]);
      const to = RIGHT.point([q.phi, XIS[i]]);
      const u = seg(morph, (i % 20) / 60, 0.67 + (i % 20) / 60);
      const x = lerp(from[0], to[0], u);
      const y = lerp(from[1], to[1], u);
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();

    XI.draw(ctx, 880, 250 - 40, { size: 0.001, alpha: 0 }); // keep the formula warm (rendered at start-up)
    COND.draw(ctx, 100, 690, { size: 21, alpha: seg(t, 3, 4.2) });
    XI.draw(ctx, 100, 745, { size: 26, alpha: seg(t, 20, 21.2) });
    readout(ctx, 'sample mean of ξ', XI_MEAN, 460, 752, { colour: MODEL, size: 15, alpha: seg(t, 29, 30) });
    readout(ctx, 'sample variance', XI_VAR, 460, 776, { colour: MODEL, size: 15, alpha: seg(t, 29, 30) });
    wrap(ctx, 'the soft coordinate is untouched: its basins, its periodicity and an expressive soft model stay', 100, 800, 620, 24, { ...type.note, size: 15, color: TORSION, alpha: seg(t, 32, 33.5) });

    const jac = seg(t, 41, 42.2);
    JACOBIAN.draw(ctx, 880, 710, { size: 20, alpha: jac });
    // highlight the coupling entry
    ctx.save();
    ctx.globalAlpha = jac * seg(t, 46, 47);
    ctx.strokeStyle = color.gold;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(1012, 672, 190, 32);
    ctx.restore();
    text(ctx, 'm′ and c′ stay in the Jacobian: the pulled-back metric keeps its off-diagonal term', 880, 770, { font: font.mono, size: 14, color: color.gold, alpha: jac * seg(t, 46, 47) });
    wrap(ctx, 'proposed, not established: compare a bounded conditional correction against the existing spring and invariant maps, with topology, decoding cost and the physical measure included', 880, 806, 620, 23, { ...type.note, size: 14, color: color.muted, alpha: seg(t, 58, 59.5) });
  },
});
