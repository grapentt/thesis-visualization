import { defineScene, seg, fade, lin, lerpLog, text, type, font, color, bar, card, logDensityPlot, sigma } from '../../../kit.js';

const SOFT_PLOT = { x: 150, y: 250, w: 600, h: 270 };
const STIFF_PLOT = { x: 900, y: 250, w: 600, h: 270 };
const FULL_RANGE = 2.2; // Å, both plots start on the same ruler

export default defineScene({
  name: 'Problem 2',
  duration: 21,
  narration:
    'For the stiff molecule, log p changes slowly along the soft direction and fast along the stiff one. Relative to each direction’s own spread the change is identical, but in absolute terms the score components differ 20-fold. That is problem 2.',
  header: { eyebrow: '11 · PROBLEM 2', title: 'The score spans orders of magnitude' },

  draw(ctx, t) {
    const stiffRange = lerpLog(FULL_RANGE, FULL_RANGE / 20, seg(t, 6, 8));

    logDensityPlot(ctx, SOFT_PLOT, {
      sigma: sigma.soft,
      range: FULL_RANGE,
      color: color.soft,
      title: 'soft direction s',
      xLabel: 's (Å)',
      point: seg(t, 3, 4),
      slopeLabel: '∂ log p/∂s = −1.39 Å⁻¹',
      step: seg(t, 8.6, 9.6),
      stepLabel: 'step 0.22 Å (5% of range)',
      alpha: seg(t, 0.8, 1.8),
    });
    logDensityPlot(ctx, STIFF_PLOT, {
      sigma: sigma.stiff,
      range: stiffRange,
      color: color.stiff,
      title: 'stiff direction q',
      xLabel: 'q (Å)',
      point: seg(t, 3.6, 4.6),
      slopeLabel: '∂ log p/∂q = −27.8 Å⁻¹',
      step: seg(t, 9, 10),
      stepLabel: 'step 0.011 Å (5%)',
      alpha: seg(t, 1.2, 2.2),
    });
    const zoomNote = stiffRange < 2 ? `x-axis zoomed ×${(FULL_RANGE / stiffRange).toFixed(0)}` : 'same x-axis as the soft plot';
    text(ctx, zoomNote, 1500, 236, { font: font.mono, size: 15, color: color.stiff, align: 'right', alpha: seg(t, 1.4, 2.2) * (1 - seg(t, 13.4, 14)) });
    text(ctx, 'Zoomed in, both curves have the same shape: the stiff one is 20× narrower.', 800, 605, {
      ...type.body,
      size: 21,
      align: 'center',
      alpha: fade(t, 7.6, 8.4, 13.4, 14),
    });

    drawScoreMagnitudes(ctx, fade(t, 10.4, 11.2, 13.6, 14.2));

    card(ctx, {
      x: 150,
      y: 600,
      width: 1350,
      tag: 'PROBLEM 2',
      title: 'The network must output very different magnitudes',
      body: 'Score components scale like 1/σᵢ. Here the stiff component is 20× larger than the soft one, and the gap grows like √κ. One network with one output layer has to resolve tiny soft components right next to large stiff ones, in every coordinate of every configuration.',
      accent: color.stiff,
      alpha: seg(t, 14.2, 15),
      progress: lin(t, 14.6, 19),
    });
  },
});

function drawScoreMagnitudes(ctx, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  text(ctx, 'score magnitude |∂ log p| at one standard deviation (Å⁻¹)', 150, 665, { size: 20, weight: 500 });
  const rows = [
    { name: 'soft', value: 1 / sigma.soft, color: color.soft, y: 710 },
    { name: 'stiff', value: 1 / sigma.stiff, color: color.stiff, y: 760 },
  ];
  for (const r of rows) {
    const width = Math.max(4, (r.value / 30) * 1000);
    text(ctx, r.name, 280, r.y, { font: font.mono, size: 17, color: r.color, align: 'right', baseline: 'middle' });
    bar(ctx, 296, r.y - 13, width, 26, r.color);
    text(ctx, r.value.toFixed(r.value < 10 ? 2 : 1), 296 + width + 12, r.y, { font: font.mono, size: 18, color: r.color, baseline: 'middle' });
  }
  text(ctx, '×20  (and κ = 400 in curvature)', 150, 820, { font: font.mono, size: 17, color: color.gold });
  ctx.restore();
}
