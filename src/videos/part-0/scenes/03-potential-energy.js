import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, dot, ring, columnVector, axisColor, axisName, SUBSCRIPT,
  drawMolecule, moleculeCamera, molecule,
} from '../../../kit.js';
import { energySamples } from '../shared.js';

const AXIS = { x: 1100, top: 250, bottom: 790, max: 0.35 };
const Y = (U) => AXIS.bottom - (U / AXIS.max) * (AXIS.bottom - AXIS.top);
const MAP = tex(String.raw`U : \mathbb{R}^{3N} \to \mathbb{R}, \qquad x \mapsto U(x)`, 'U : ℝ³ᴺ → ℝ,   x ↦ U(x)');

// sampling times: the first samples slowly, then faster and faster
const FIRST = 2.5;
const LAST = 16.5;
const TIMES = [];
for (let t = FIRST, dt = 1.6; t < LAST && TIMES.length < energySamples.length; t += dt, dt = Math.max(0.07, dt * 0.8)) TIMES.push(t);
const sampleAt = (t) => {
  let k = -1;
  while (k + 1 < TIMES.length && TIMES[k + 1] <= t) k++;
  return k;
};

export default defineScene({
  name: 'Potential energy',
  duration: 26,
  narration:
    'Every configuration has a potential energy. Draw it on a vertical axis: each sampled configuration, each point x, gives one number U(x). Sampling faster and faster fills in a function U from ℝ³ᴺ to ℝ.',
  header: { eyebrow: '01 · THE SPACE WE WORK ON', title: 'Every configuration has a potential energy' },

  draw(ctx, t) {
    const k = sampleAt(t);
    const sample = k >= 0 ? energySamples[k] : { X: molecule.positions, U: 0 };
    const sinceSample = k >= 0 ? t - TIMES[k] : 0;
    const cam = moleculeCamera({ cx: 360, cy: 500, scale: 140 });
    drawMolecule(ctx, sample.X, cam, { opacity: seg(t, 0, 0.6) });

    const rows = sample.X.map((value, j) => ({ symbol: axisName[j % 3] + SUBSCRIPT[Math.floor(j / 3) + 1], value, color: axisColor[j % 3] }));
    columnVector(ctx, 720, 250, rows, { rowHeight: 30, width: 150, size: 20, label: 'x', alpha: 0.5 * seg(t, 0.5, 1.5) });

    // the energy axis
    const axisAlpha = seg(t, 0.8, 1.8);
    ctx.save();
    ctx.globalAlpha = axisAlpha;
    line(ctx, AXIS.x, AXIS.bottom, AXIS.x, AXIS.top - 20, { color: color.ink, width: 2 });
    for (const U of [0, 0.1, 0.2, 0.3]) {
      line(ctx, AXIS.x - 8, Y(U), AXIS.x, Y(U), { color: color.ink, width: 2 });
      text(ctx, U.toFixed(1), AXIS.x - 14, Y(U), { ...type.note, align: 'right', baseline: 'middle' });
    }
    text(ctx, 'U (eV)', AXIS.x, AXIS.top - 34, { font: font.mono, size: 16, color: color.gold, align: 'center' });
    ctx.restore();

    // all samples so far, then the current one with its mapping arrow
    for (let i = 0; i < k; i++) {
      const jitter = ((i * 37) % 23) / 23;
      dot(ctx, AXIS.x + 16 + jitter * 44, Y(energySamples[i].U), 4, color.gold, 0.55);
    }
    if (k >= 0) {
      const y = Y(sample.U);
      const pulse = 1 - seg(sinceSample, 0, 0.35);
      ctx.save();
      ctx.strokeStyle = color.gold;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(805, 460);
      ctx.bezierCurveTo(930, 460, 960, y, AXIS.x - 10, y);
      ctx.stroke();
      ctx.restore();
      dot(ctx, AXIS.x, y, 8, color.gold);
      ring(ctx, AXIS.x, y, 12 + 14 * pulse, color.gold, 0.4 + 0.6 * pulse, 2);
      text(ctx, `U(x) = ${sample.U.toFixed(3)} eV`, AXIS.x + 80, y + 6, { font: font.mono, size: 18, color: color.gold, alpha: lin(t, FIRST, FIRST + 0.3) });
    }

    text(ctx, `${Math.max(0, k + 1)} configurations sampled`, AXIS.x + 80, AXIS.bottom + 40, { ...type.note, alpha: seg(t, 6, 7) });
    wrap(ctx, 'Every configuration x has one potential energy U(x).', 1190, 300, 360, 32, { ...type.body, alpha: fade(t, 3, 4, 17, 17.6) });
    MAP.draw(ctx, 800, 852, { size: 34, align: 'center', alpha: seg(t, 17.5, 18.7) });
  },
});
