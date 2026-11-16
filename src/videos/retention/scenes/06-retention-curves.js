import { defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, line, dot } from '../../../kit.js';
import { header, frame, axes, drawPath, decades, panel, pill, legend, track, PHI_TICKS, OBSERVABLE_COLOURS, INFO } from '../shared.js';
import { OBSERVABLES, CHANNELS, curves, SIGMAS } from '../toy.js';

const PLOT = frame({ x: 100, y: 240, w: 930, h: 500, u: [-2.5, 1.5], v: [0, 1] });
const LOGS = Array.from(SIGMAS, (s) => Math.log10(s));
const KEYS = ['flat', 'local', 'global'];
const NOTES = {
  flat: 'flat noise: the bond goes first, the torsion within its basin next, the basin population last',
  local: 'local thermal widths: bond and within-basin torsion lose information together; the basin survives many widths longer',
  global: 'global covariance: the basin joins the bond, and the torsion within its basin is now erased first',
};

/** How much of each channel is showing: crossfades flat → local → global → local. */
function blend(t) {
  const local1 = seg(t, 26, 29);
  const global = seg(t, 52, 55);
  const local2 = seg(t, 76, 79);
  const w = { flat: 1 - local1, local: local1 * (1 - global) + global * local2, global: global * (1 - local2) };
  return w;
}

export default defineScene({
  name: 'Retention curves',
  duration: 115,
  narration: [
    [0, 'Now sweep the noise and plot the retained fraction of each observable. First, flat noise: the same sigma added to the bond in ångström and to the torsion in radians. The bond goes first, then the torsion within its basin, and the basin population last.'],
    [26, 'Whiten with the local thermal covariance, as Part 1 proposes: noise proportional to each coordinate’s thermal width. The bond and the within-basin torsion now lose information together. The basin population survives far longer, because basins are separated by many thermal widths.'],
    [52, 'Whiten with the global covariance instead, and the basin curve joins the bond, but the torsion within its basin is now erased first. No linear rescaling of the torsion can align both of its curves. They are two scales of one coordinate.'],
    [76, 'So good bond whitening need not improve information about basin populations, which is consistent with the repository’s Sprint 11 evidence: much faster stiff-coordinate learning, no corresponding torsion advantage.'],
    [96, 'That makes R t a diagnostic, not a loss. Maximising it everywhere would choose no noise at all. And nothing says every observable should vanish together: keeping basin identity longer may be what coarse-to-fine generation wants.'],
  ],
  header: header(6, 'RETENTION CURVES', 'Which information goes first depends on the channel'),

  draw(ctx, t) {
    const w = blend(t);
    const a = seg(t, 0.4, 1.6);
    axes(ctx, PLOT, { xTicks: decades(-2, 1), yTicks: [[0, '0'], [0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']], xLabel: 'noise multiplier σ (log) · flat: Å and rad · whitened: units of the chosen widths', grid: true, alpha: a, labelStyle: { size: 16 } });
    text(ctx, 'retained fraction R_t of each observable', PLOT.x, PLOT.y - 22, { size: 19, weight: 500, alpha: a });

    const reveal = lin(t, 2, 14);
    const half = [];
    OBSERVABLES.forEach((o, k) => {
      const colour = OBSERVABLE_COLOURS[o.key];
      const points = LOGS.map((l, i) => [l, KEYS.reduce((s, key) => s + w[key] * curves[key][k][i], 0)]);
      drawPath(ctx, PLOT, points, { colour, alpha: a, width: 3.5, progress: Math.min(1, reveal * 1.15 - 0.05 * k) });
      // the half-information point
      const j = points.findIndex((p) => p[1] < 0.5);
      if (j > 0 && reveal > 0.98) {
        const [l0, r0] = points[j - 1];
        const [l1, r1] = points[j];
        const l = l0 + ((0.5 - r0) * (l1 - l0)) / (r1 - r0);
        dot(ctx, PLOT.X(l), PLOT.Y(0.5), 6, colour, a);
        half[k] = (10 ** l).toPrecision(2);
      }
    });

    // the channels
    text(ctx, 'noising channel  (σ_r : σ_φ)', 1090, 250, { font: font.mono, size: 14, color: color.muted, alpha: a });
    KEYS.forEach((key, i) => {
      const channel = CHANNELS[key];
      const y = 270 + 100 * i;
      const hot = w[key];
      const on = a * seg(t, [0, 24, 50][i], [1, 25.5, 51.5][i]);
      panel(ctx, 1090, y, 430, 84, { alpha: on, stroke: rgba(INFO, 0.25 + 0.75 * hot), fill: hot > 0.5 ? rgba(INFO, 0.08) : 'rgba(17,24,40,0.85)' });
      text(ctx, channel.name, 1112, y + 34, { ...type.display, size: 22, alpha: on });
      text(ctx, `σ_r : σ_φ = ${channel.scale[0].toFixed(3)} : ${channel.scale[1].toFixed(2)}  (${channel.unit})`, 1112, y + 62, { font: font.mono, size: 13, color: color.muted, alpha: on });
      // the noise ellipse, torsion across and bond up
      const max = Math.max(...channel.scale);
      const ex = Math.max(3, 28 * (channel.scale[1] / max));
      const ey = Math.max(3, 28 * (channel.scale[0] / max));
      ctx.save();
      ctx.globalAlpha *= on;
      ctx.strokeStyle = color.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(1478, y + 42, ex, ey, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    });
    legend(ctx, 1090, 600, OBSERVABLES.map((o, k) => ({ name: half[k] ? `${o.name} · σ½ = ${half[k]}` : o.name, colour: OBSERVABLE_COLOURS[o.key] })), { alpha: a, vertical: true, gap: 28, size: 14 });

    const note = KEYS.reduce((best, key) => (w[key] > w[best] ? key : best), 'flat');
    wrap(ctx, NOTES[note], 100, 836, 930, 26, { ...type.body, size: 19, color: color.ink, alpha: a * Math.max(...KEYS.map((key) => w[key])) });
    wrap(ctx, 'a diagnostic, not a loss: maximising R_t everywhere would choose no noise at all', 1090, 760, 430, 24, { ...type.note, size: 15, color: color.gold, alpha: seg(t, 97, 98.5) });
    wrap(ctx, 'nor must everything vanish together: keeping basin identity longer is coarse-to-fine generation', 1090, 812, 430, 24, { ...type.note, size: 15, color: color.gold, alpha: seg(t, 106, 107.5) });
  },
});
