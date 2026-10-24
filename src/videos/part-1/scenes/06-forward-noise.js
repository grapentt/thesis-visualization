import {
  defineScene, seg, fade, text, wrap, type, font, color, rgba, tex, ring, dashedLine,
  drawMolecule, moleculeCamera, molecule, brownian, BROWNIAN_D, vibration,
} from '../../../kit.js';

const SDE = tex(String.raw`dx_t = g(t)\,dW_t`, 'dxₜ = g(t) dWₜ');
const MARGINAL = tex(String.raw`x_t \mid x_0 \;\sim\; \mathcal{N}\!\big(x_0,\ \sigma_t^2\, I_{15}\big)`, 'xₜ | x₀ ~ N(x₀, σₜ² I₁₅)');

const NOISE_STARTS = 3.2;
const BALL = { cx: 1230, cy: 600, pxPerAngstrom: 170 };

export default defineScene({
  name: 'Forward noise',
  duration: 13,
  narration:
    'Diffusion models start by adding noise. The standard forward process adds the same isotropic Brownian noise to every coordinate, no matter how stiff the direction is.',
  header: { eyebrow: '06 · DIFFUSION', title: 'Forward process: the same noise on every coordinate' },

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: 520, cy: 520, scale: 170 });
    const vibrate = seg(t, 0.3, 1.5);
    const tNoise = Math.max(0, t - NOISE_STARTS);
    const X = molecule.positions.map((x, j) => x + vibrate * vibration(j, t) + brownian(j, tNoise));

    drawMolecule(ctx, molecule.positions, cam, { ghost: color.muted, opacity: 0.5 * seg(t, 3.2, 4.2), labels: 0 });
    drawMolecule(ctx, X, cam);
    const caption = { font: font.mono, size: 16, color: color.muted, align: 'center' };
    text(ctx, 'thermal vibration', 520, 830, { ...caption, alpha: fade(t, 0.6, 1.4, 3, 3.6) });
    text(ctx, 'grey outline: the clean configuration x₀', 520, 830, { ...caption, alpha: seg(t, 4, 4.8) });

    SDE.draw(ctx, 980, 250, { size: 40, alpha: seg(t, 3, 4) });
    MARGINAL.draw(ctx, 980, 330, { size: 36, alpha: seg(t, 3.6, 4.6) });
    text(ctx, 'Flat: one σₜ for all 15 coordinates.', 980, 400, { ...type.body, alpha: seg(t, 4.2, 5) });

    const sigmaT = Math.sqrt(BROWNIAN_D * tNoise);
    const a = seg(t, 4.6, 5.4);
    if (a > 0) {
      const { cx, cy } = BALL;
      const r = Math.max(sigmaT * BALL.pxPerAngstrom, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = rgba(color.gold, 0.12);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ring(ctx, cx, cy, r, color.gold, 0.9, 2);
      dashedLine(ctx, cx - 90, cy, cx + 90, cy, { color: color.dim, width: 1, dash: [3, 5] });
      dashedLine(ctx, cx, cy - 90, cx, cy + 90, { color: color.dim, width: 1, dash: [3, 5] });
      text(ctx, 'noise ball: the same radius in every direction', cx, cy + 122, { ...type.note, align: 'center' });
      text(ctx, `σₜ = ${sigmaT.toFixed(2)} Å`, 980, 520, { font: font.mono, size: 22, color: color.gold });
      ctx.restore();
    }

    wrap(ctx, 'A stiff bond and a soft torsion receive exactly the same kick.', 980, 780, 520, 32, {
      ...type.body,
      size: 23,
      color: color.ink,
      alpha: seg(t, 8.5, 9.3),
    });
  },
});
