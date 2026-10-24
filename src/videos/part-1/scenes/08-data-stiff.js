import {
  defineScene, seg, fade, lin, lerp, text, type, font, color, line, dot, ring, dashedLine,
  niceStep, symmetricTicks, formatTick, drawMolecule, molecule, configuration, dataset, formatNumber,
} from '../../../kit.js';
import { dataPlot, plotX, plotY, STRIP_Y, stripDotY, dataSceneCamera } from './shared.js';

const STEPPED = 4;
const STEP_START = 1.6;
const STEP_END = 6.4;
const sample = (i) => configuration(dataset[i].s, dataset[i].q);
const wrapIndex = (i) => STEPPED + (((i - STEPPED) % (dataset.length - STEPPED)) + (dataset.length - STEPPED)) % (dataset.length - STEPPED);

export default defineScene({
  name: 'Data · stiff',
  duration: 18,
  continues: true,
  narration:
    'Along the stiff coordinate the samples barely move. Drawn with the same ruler, the data set is a thin sliver. Stretched 20-fold, the stiff spread has the same shape as the soft one.',
  header: { eyebrow: '07 · THE DATA', title: '…and the stiff coordinate' },

  draw(ctx, t) {
    const cam = dataSceneCamera();
    const m = seg(t, 0, 1.4); // strip → 2D plot
    const axisY = lerp(STRIP_Y, dataPlot.cy, m);
    const zoom = Math.exp(Math.log(20) * (seg(t, 10, 12.5) - seg(t, 15.5, 17.5)));
    const Y = (q) => plotY(q, zoom);

    // step through a few samples, then cycle quickly through the rest
    const current = t >= STEP_START && t < STEP_END ? Math.min(STEPPED - 1, Math.floor(lin(t, STEP_START, STEP_END) * STEPPED)) : -1;
    const cycling = t >= STEP_END ? wrapIndex(STEPPED + Math.floor((t - STEP_END) * 6)) : -1;
    const ghosts = seg(t, STEP_END, 7.2);
    if (ghosts > 0) {
      for (let k = 0; k < 30; k++) drawMolecule(ctx, sample(wrapIndex(cycling - k)), cam, { ghost: color.muted, opacity: 0.08 * ghosts, labels: 0 });
    }
    const X = current >= 0 ? sample(current) : cycling >= 0 ? sample(cycling) : molecule.positions;
    drawMolecule(ctx, X, cam, { glowBond: t > 1.2 ? 0 : -1 });
    text(ctx, `bond 1–2:  ${molecule.bondLength(X, 0, 1).toFixed(3)} Å`, 420, 800, {
      font: font.mono,
      size: 20,
      color: color.stiff,
      align: 'center',
      alpha: seg(t, 1.2, 2),
    });

    // axes, grid and ticks
    const { x: bx, y: by, w: bw, h: bh } = dataPlot.box;
    const labelY = lerp(628, by + bh + 28, m);
    const halfRangeQ = 2.0 / zoom;
    const stepQ = niceStep(halfRangeQ);
    const tick = { font: font.mono, size: 15, color: color.muted };
    ctx.save();
    ctx.globalAlpha = m * 0.6;
    for (const v of symmetricTicks(2.25, 1)) line(ctx, plotX(v), by, plotX(v), by + bh, { color: color.grid, width: 1 });
    for (const v of symmetricTicks(halfRangeQ, stepQ)) line(ctx, bx, Y(v), bx + bw, Y(v), { color: color.grid, width: 1 });
    ctx.globalAlpha = 1;
    line(ctx, bx, axisY, bx + bw, axisY);
    for (const v of symmetricTicks(2.25, 1)) text(ctx, formatTick(v, 1), plotX(v), labelY, { ...tick, align: 'center' });
    text(ctx, 's (Å) · soft', bx + bw, labelY + 28, { ...tick, color: color.soft, align: 'right' });
    ctx.globalAlpha = m;
    line(ctx, plotX(0), by, plotX(0), by + bh);
    for (const v of symmetricTicks(halfRangeQ, stepQ)) text(ctx, formatTick(v, stepQ), bx - 10, Y(v), { ...tick, align: 'right', baseline: 'middle' });
    text(ctx, 'q (Å) · stiff (bond 1–2 stretch)', plotX(0) + 12, by + 16, { ...tick, color: color.stiff });
    ctx.restore();

    // the data: from the jittered strip to their (s, q) positions
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();
    dataset.forEach((d, i) => dot(ctx, plotX(d.s), lerp(stripDotY(i), Y(d.q), m), 4, i === current ? color.gold : color.soft, 0.75));
    if (current >= 0) {
      const x = plotX(dataset[current].s);
      const y = Y(dataset[current].q);
      ring(ctx, x, y, 11, color.gold, 1, 2.5);
      dashedLine(ctx, x, y, plotX(0), y, { color: color.stiff, alpha: 0.9, width: 2, dash: [3, 4] });
      text(ctx, `q = ${formatNumber(dataset[current].q, 3, true)} Å`, x + 16, y - 16, { font: font.mono, size: 17, color: color.stiff });
    }
    ctx.restore();

    if (zoom > 1.05) {
      text(ctx, `vertical axis ×${zoom.toFixed(zoom < 10 ? 1 : 0)}`, bx + bw - 8, by + 22, { font: font.mono, size: 17, color: color.stiff, align: 'right' });
    }
    const caption = { ...type.body, size: 21, align: 'center' };
    text(ctx, 'Same ruler (Å) on both axes: the stiff spread is a thin sliver.', 1180, 870, { ...caption, alpha: fade(t, 6.6, 7.4, 9.6, 10.2) });
    text(ctx, 'Stretched ×20 it has the same shape: σ_stiff ≈ 0.036 Å.', 1180, 870, { ...caption, color: color.ink, alpha: fade(t, 12.4, 13.2, 15.4, 16) });
  },
});
