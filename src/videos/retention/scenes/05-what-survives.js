import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, rgba, tex, line, bar, dot, ring } from '../../../kit.js';
import { header, frame, axes, heatmap, clipped, panel, readout, track, PHI_TICKS, OBSERVABLE_COLOURS, INFO, DATA } from '../shared.js';
import { grid, PHI, R, OBSERVABLES, CHANNELS, posterior, retainedAt, wrap as wrapAngle } from '../toy.js';

const TOY = frame({ x: 100, y: 240, w: 660, h: 380, u: [-Math.PI, Math.PI], v: [R.min, R.max] });
const DERIVATIVE = tex(String.raw`\partial_\theta\log p_{\theta,t}(y)\,\big|_{\theta=0} = \mathbb E\big[u(X_0)\mid X_t = y\big]`, '∂_θ log p_{θ,t}(y)|₀ = E[u(X₀) | X_t = y]');
const RETAINED = tex(String.raw`\mathcal I_t = \mathrm{Cov}\big(\mathbb E[u(X_0)\mid X_t]\big)`, 'I_t = Cov(E[u(X₀) | X_t])');
const SPLIT = tex(String.raw`\mathcal I_0 - \mathcal I_t = \mathbb E\big[\mathrm{Cov}\big(u(X_0)\mid X_t\big)\big]`, 'I₀ − I_t = E[Cov(u(X₀) | X_t)]');
const FRACTION = tex(String.raw`R_t = \mathcal I_0^{-1/2}\,\mathcal I_t\,\mathcal I_0^{-1/2},\qquad 0 \preceq R_t \preceq I`, 'R_t = I₀^(−½) I_t I₀^(−½),   0 ≼ R_t ≼ I');
const GAUSSIAN = tex(String.raw`R_t = \frac{v}{v + \sigma_t^2}`, 'R_t = v / (v + σ_t²)');

export default defineScene({
  name: 'What the noisy molecule still knows',
  duration: 95,
  narration: [
    [0, 'Pass every tilted distribution through the same noising channel. The derivative of the noisy log density with respect to theta is the conditional mean of u given the noisy point. So the information left is the covariance of that conditional mean.'],
    [24, 'Picture one noisy point y. Behind it sits a cloud of clean configurations it could have come from. The conditional mean averages u over that cloud. At small noise the cloud is tight and the mean still varies with y. At large noise every cloud is the whole distribution, and the mean is constant.'],
    [50, 'The law of total covariance splits the clean information in two: the part the noisy point still carries, and the average conditional covariance, the part the noise has erased. The retained fraction R t lies between zero and one.'],
    [72, 'For one Gaussian direction of variance v under flat noise, R is v over v plus sigma squared: exactly Part 1’s curve. So this is Part 1’s measure, generalised to any observable of any distribution.'],
  ],
  header: header(5, 'RETENTION', 'What the noisy molecule still knows'),

  draw(ctx, t) {
    // the noisy point wanders; the noise grows, shrinks for the bars, and grows again
    const sigma = track(t, [[0, 0.08], [30, 0.08], [48, 1.2], [52, 1.2], [54, 0.03], [70, 3], [72, 3], [74, 0.25], [95, 0.25]]);
    const yPhi = wrapAngle(-1.0 + 1.3 * Math.sin(0.16 * Math.max(0, t - 24)));
    const yR = 0.03 * Math.cos(0.27 * Math.max(0, t - 24));
    const post = posterior(yPhi, yR, CHANNELS.flat.scale, sigma);

    const a = seg(t, 0.4, 1.4);
    heatmap(ctx, TOY, grid.p, PHI.n, R.n, { alpha: a * 0.7, gamma: 0.6 });
    const cloud = fade(t, 24, 25.5, 92, 94);
    heatmap(ctx, TOY, post.weights, PHI.n, R.n, { alpha: cloud, gamma: 0.5, tint: INFO });
    axes(ctx, TOY, { xTicks: PHI_TICKS, yTicks: [[-0.2, '−0.2'], [0, '0'], [0.2, '0.2']], xLabel: 'torsion φ', yLabel: 'bond r', alpha: a, box: true });
    clipped(ctx, TOY, () => {
      ctx.save();
      ctx.globalAlpha *= cloud * (1 - seg(sigma, 0.8, 1.3)); // the noise ellipse, until it outgrows the frame
      ctx.strokeStyle = color.gold;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.ellipse(TOY.X(yPhi), TOY.Y(yR), sigma * TOY.kx, sigma * TOY.ky, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    });
    dot(ctx, TOY.X(yPhi), TOY.Y(yR), 7, color.gold, cloud);
    ring(ctx, TOY.X(yPhi), TOY.Y(yR), 12, color.gold, cloud, 2);
    text(ctx, 'y', TOY.X(yPhi) + 16, TOY.Y(yR) - 14, { ...type.math, size: 24, color: color.gold, alpha: cloud });
    text(ctx, `noise σ = ${sigma.toFixed(2)} (flat, in Å and rad)`, TOY.x + 10, TOY.y + 22, { font: font.mono, size: 14, color: color.gold, alpha: cloud });
    text(ctx, 'the cloud of clean configurations behind y, p(x₀ | y)', TOY.x + TOY.w, TOY.y + TOY.h + 70, { font: font.mono, size: 14, color: INFO, align: 'right', alpha: cloud });

    // conditional means of the four observables at this y
    const readouts = fade(t, 27, 28.5, 92, 94);
    text(ctx, 'E[u | y] − E[u], in standard deviations of u', 100, 712, { font: font.mono, size: 14, color: color.muted, alpha: readouts });
    OBSERVABLES.forEach((o, k) => {
      const z = post.means[k] / Math.sqrt(grid.cov0[k][k]);
      const colour = OBSERVABLE_COLOURS[o.key];
      const y = 740 + 28 * k;
      text(ctx, o.name, 100, y, { font: font.mono, size: 15, color: colour, alpha: readouts });
      bar(ctx, 420, y - 11, 300, 14, color.panel, readouts);
      bar(ctx, 570 + Math.min(0, z) * 50, y - 11, Math.min(150, Math.abs(z) * 50), 14, colour, readouts);
      line(ctx, 570, y - 14, 570, y + 3, { color: color.muted, alpha: readouts });
      text(ctx, (z >= 0 ? '+' : '−') + Math.abs(z).toFixed(2), 740, y, { font: font.mono, size: 15, color: colour, alpha: readouts });
    });

    // the identities
    DERIVATIVE.draw(ctx, 860, 250, { size: 22, alpha: seg(t, 5, 6.2) });
    RETAINED.draw(ctx, 860, 310, { size: 24, alpha: seg(t, 15, 16.2) });
    SPLIT.draw(ctx, 860, 370, { size: 22, alpha: seg(t, 51, 52.2) });
    FRACTION.draw(ctx, 860, 430, { size: 21, alpha: seg(t, 64, 65.2) });

    // the split of I₀ into retained and erased, as the noise grows
    const bars = fade(t, 52, 53.5, 92, 94);
    text(ctx, `clean information I₀ of each observable, split at noise σ = ${sigma.toFixed(2)}`, 860, 500, { font: font.mono, size: 14, color: color.muted, alpha: bars });
    OBSERVABLES.forEach((o, k) => {
      const y = 520 + 36 * k;
      const r = retainedAt('flat', k, sigma);
      const colour = OBSERVABLE_COLOURS[o.key];
      text(ctx, o.name, 860, y + 18, { font: font.mono, size: 14, color: colour, alpha: bars });
      bar(ctx, 1100, y, 340, 22, color.panel, bars);
      bar(ctx, 1100, y, Math.max(2, 340 * r), 22, INFO, bars);
      text(ctx, `R = ${r.toFixed(2)}`, 1452, y + 17, { font: font.mono, size: 14, color: INFO, alpha: bars });
    });
    text(ctx, 'retained  I_t', 1100, 672, { font: font.mono, size: 13, color: INFO, alpha: bars });
    text(ctx, 'erased  E[Cov(u | X_t)]', 1440, 672, { font: font.mono, size: 13, color: color.muted, align: 'right', alpha: bars });

    // the Gaussian case: Part 1's curve
    const gauss = seg(t, 73, 74.2);
    panel(ctx, 860, 700, 640, 130, { alpha: gauss, stroke: rgba(color.gold, 0.5) });
    text(ctx, 'one Gaussian direction, variance v, flat noise σ_t:', 886, 736, { ...type.body, size: 18, alpha: gauss });
    GAUSSIAN.draw(ctx, 886, 790, { size: 26, alpha: gauss });
    wrap(ctx, 'Part 1’s “share of signal left”, now one case of a general measure: any observable, any distribution, any channel.', 1080, 770, 400, 24, { ...type.body, size: 17, color: color.gold, alpha: gauss * seg(t, 76, 77.5) });
  },
});
