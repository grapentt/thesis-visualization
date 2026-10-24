import {
  defineScene, seg, fade, lin, text, type, font, color, line, dot, ring, dashedLine, symmetricTicks, formatTick,
  drawMolecule, molecule, configuration, dataset, sigma, formatNumber,
} from '../../../kit.js';
import { plotX, STRIP_Y, stripDotY, dataSceneCamera } from './shared.js';

const STEPPED = 6; // samples shown one at a time before the rest pour in
const STEP_END = 7.2;
const POUR_END = 11.8;
const sample = (i) => configuration(dataset[i].s, dataset[i].q);

export default defineScene({
  name: 'Data · soft',
  duration: 15,
  narration: 'Each sample in the data set is one molecule. Along the soft coordinate the samples spread widely.',
  header: { eyebrow: '07 · THE DATA', title: 'Every data point is one molecule' },

  draw(ctx, t) {
    const cam = dataSceneCamera();

    // how many samples are visible, and which one is "current"
    let current = -1;
    let shown = 0;
    if (t >= 1.0 && t < STEP_END) {
      current = Math.min(STEPPED - 1, Math.floor(lin(t, 1.0, STEP_END) * STEPPED));
      shown = current + 1;
    } else if (t >= STEP_END) {
      shown = STEPPED + Math.floor((dataset.length - STEPPED) * Math.pow(lin(t, STEP_END, POUR_END), 1.6));
      current = shown - 1;
    }

    const ghosts = seg(t, STEP_END, 8);
    if (ghosts > 0) {
      for (let i = Math.max(0, shown - 36); i < shown; i++) {
        drawMolecule(ctx, sample(i), cam, { ghost: color.soft, opacity: 0.09 * ghosts, labels: 0 });
      }
    }
    const P = drawMolecule(ctx, current >= 0 ? sample(current) : molecule.positions, cam, {
      highlight: 4,
      highlightAlpha: current >= 0 ? 1 : 0,
      highlightColor: color.soft,
    });

    // strip axis for the soft coordinate s
    const tick = { font: font.mono, size: 15, color: color.muted, align: 'center' };
    ctx.save();
    ctx.globalAlpha = seg(t, 0.3, 1.0);
    line(ctx, 880, STRIP_Y, 1480, STRIP_Y);
    for (const v of symmetricTicks(2.25, 1)) {
      line(ctx, plotX(v), STRIP_Y, plotX(v), STRIP_Y + 6);
      text(ctx, formatTick(v, 1), plotX(v), STRIP_Y + 28, tick);
    }
    text(ctx, 's (Å) · soft coordinate (twist of H5)', 1480, STRIP_Y + 56, { ...type.note, color: color.soft, align: 'right' });
    ctx.restore();

    for (let i = 0; i < shown; i++) dot(ctx, plotX(dataset[i].s), stripDotY(i), 4.5, color.soft, 0.8);
    if (current >= 0 && t < STEP_END) {
      const x = plotX(dataset[current].s);
      const y = stripDotY(current);
      ring(ctx, x, y, 10, color.gold, 1, 2.5);
      dashedLine(ctx, x, y, P[4].x, P[4].y, { color: color.gold, alpha: 0.55 });
      text(ctx, `s = ${formatNumber(dataset[current].s, 2, true)} Å`, x, y - 22, { font: font.mono, size: 17, color: color.gold, align: 'center' });
    }

    const curve = seg(t, 11.6, 12.8);
    if (curve > 0) {
      const gaussY = (s) => STRIP_Y - 80 - 190 * Math.exp((-s * s) / (2 * sigma.soft * sigma.soft));
      ctx.save();
      ctx.globalAlpha = curve;
      ctx.strokeStyle = color.soft;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const s = -2.25 + (4.5 * i) / 200;
        i ? ctx.lineTo(plotX(s), gaussY(s)) : ctx.moveTo(plotX(s), gaussY(s));
      }
      ctx.stroke();
      const y = gaussY(sigma.soft);
      dashedLine(ctx, plotX(-sigma.soft), y, plotX(sigma.soft), y, { color: color.gold, width: 2, dash: [4, 4] });
      text(ctx, '2σ_soft ≈ 1.44 Å', plotX(sigma.soft) + 12, y + 5, { font: font.mono, size: 16, color: color.gold });
      ctx.restore();
    }

    text(ctx, 'Each dot is one molecule from the data set, placed at its value of the soft coordinate.', 1180, 760, {
      ...type.body,
      size: 21,
      align: 'center',
      alpha: fade(t, 1.4, 2.2, 11, 11.6),
    });
    text(ctx, 'Wide spread: σ_soft ≈ 0.72 Å', 1180, 760, { ...type.body, color: color.ink, align: 'center', alpha: seg(t, 12.4, 13.2) });
  },
});
