import {
  defineScene, seg, fade, lin, lerpLog, oscillate, text, wrap, type, font, color, card, energyPlot,
  drawMolecule, moleculeCamera, molecule, modes, configuration, arrow3, stiffness, vec3,
} from '../../../kit.js';

const SOFT_PLOT = { x: 880, y: 215, w: 600, h: 220 };
const STIFF_PLOT = { x: 880, y: 560, w: 600, h: 220 };

export default defineScene({
  name: 'Stiffness',
  duration: 25,
  narration:
    'Directions are not equal. Twisting the H about bond 2–3 costs almost no energy, so at thermal energy it moves about an ångström. Stretching bond 1–2 is stiff: only five hundredths of an ångström. The curvatures differ 400-fold. That is the stiffness problem.',
  header: { eyebrow: '05 · STIFFNESS', title: 'Some directions are soft, some are stiff' },

  draw(ctx, t) {
    const moleculeAlpha = 1 - 0.78 * seg(t, 16, 17);
    const s = 1.0 * oscillate(t, 2.6, 8.6, 2); // soft: twist by ±1 Å
    const q = 0.05 * oscillate(t, 10.4, 16, 2); // stiff: stretch by ±0.05 Å
    const softOn = fade(t, 1.6, 2.4, 8.8, 9.4);
    const stiffOn = fade(t, 9.6, 10.3, 16, 16.5);
    const cam = moleculeCamera({ cx: 400, cy: 500, scale: 170 });

    drawMolecule(ctx, configuration(s, q), cam, {
      opacity: moleculeAlpha,
      highlight: softOn > 0.5 ? 4 : stiffOn > 0.5 ? [0, 1] : -1,
      highlightAlpha: Math.max(softOn, stiffOn),
      highlightColor: softOn > 0.5 ? color.soft : color.stiff,
      glowBond: stiffOn > 0.5 ? 0 : -1,
    });

    const X0 = molecule.positions;
    const label = type.math;
    if (softOn > 0) {
      const a = softOn * moleculeAlpha;
      const h = molecule.atom(X0, 4);
      const style = { color: color.soft, width: 5, head: 16, alpha: a };
      const tip = arrow3(ctx, cam, h, vec3.scale(modes.twistTangent, 0.7), style);
      arrow3(ctx, cam, h, vec3.scale(modes.twistTangent, -0.7), style);
      text(ctx, 'v_soft', tip.x + 12, tip.y - 10, { ...label, color: color.soft, alpha: a });
    }
    if (stiffOn > 0) {
      const a = stiffOn * moleculeAlpha;
      const style = { color: color.stiff, width: 5, head: 15, alpha: a };
      arrow3(ctx, cam, molecule.atom(X0, 0), vec3.scale(modes.stretchAxis, -0.5), style);
      const tip = arrow3(ctx, cam, molecule.atom(X0, 1), vec3.scale(modes.stretchAxis, 0.5), style);
      text(ctx, 'v_stiff', tip.x + 8, tip.y - 16, { ...label, color: color.stiff, alpha: a });
    }

    const note = { ...type.body, size: 21 };
    wrap(ctx, 'v_soft is a direction in ℝ¹⁵ (here a torsion). It does not have to line up with any coordinate axis.', 80, 780, 700, 30, {
      ...note,
      alpha: softOn * moleculeAlpha * seg(t, 3, 4),
    });
    wrap(ctx, 'v_stiff stretches bond 1–2. The atoms barely move, yet the energy shoots up.', 80, 780, 700, 30, {
      ...note,
      alpha: stiffOn * moleculeAlpha * seg(t, 10.8, 11.6),
    });

    energyPlot(ctx, SOFT_PLOT, {
      stiffness: stiffness.soft,
      range: 1.5,
      color: color.soft,
      point: s,
      title: 'Soft · twist about bond 2–3',
      readouts: ['k = 0.05 eV/Å²', '±1.02 Å per kT'],
      alpha: seg(t, 1.2, 2.2),
    });
    energyPlot(ctx, STIFF_PLOT, {
      stiffness: stiffness.stiff,
      range: lerpLog(1.5, 0.075, seg(t, 12.6, 14.6)), // zoom ×20
      color: color.stiff,
      point: q,
      title: 'Stiff · stretch of bond 1–2',
      readouts: ['k = 20 eV/Å²', '±0.05 Å per kT'],
      alpha: seg(t, 9.2, 10.2),
    });
    text(ctx, 'x-axis zoomed ×20', 1480, 860, { font: font.mono, size: 16, color: color.stiff, align: 'right', alpha: seg(t, 12.8, 13.6) });

    card(ctx, {
      x: 80,
      y: 200,
      width: 720,
      tag: 'THE STIFFNESS PROBLEM',
      title: 'Every direction has its own ruler',
      body: 'The same thermal energy moves the molecule ±1 Å along the soft mode but only ±0.05 Å along the stiff mode, because the curvatures differ by a factor of 400. Flat coordinates measure every direction with the same ruler (Å), even though the natural scale of each direction differs by orders of magnitude.',
      alpha: seg(t, 16.6, 17.4),
      progress: lin(t, 17, 21.5),
    });
  },
});
