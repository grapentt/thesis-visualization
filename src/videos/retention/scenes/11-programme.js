import { defineScene, seg, lin, text, wrap, type, font, color, rgba, card, roundRect } from '../../../kit.js';
import { header, INFO, MODEL, BOND } from '../shared.js';

const STEPS = [
  { tag: '1 · RETENTION CURVES', title: 'Add them to the assessment', accent: INFO, body: 'Measure R_t for bonds, widths, periodic torsions and basin membership separately, next to generation and force checks. They tell a poor noise floor from a poor representation or too little population data.', at: 1 },
  { tag: '2 · MAPS WITH THE MODEL', title: 'Evaluate them jointly', accent: MODEL, body: 'Supplement displacement whitening with score complexity and approximate operator closure. Begin on manufactured distributions with a known score, so estimator error cannot pose as geometry.', at: 25 },
  { tag: '3 · CONDITIONAL STIFF WHITENING', title: 'Test it with a soft model', accent: BOND, body: 'Start from a strong spring or invariant map; compare a bounded conditional correction against that initialiser, with topology, decoding cost and the physical measure corrections included.', at: 45 },
];

export default defineScene({
  name: 'Three changes, in order',
  duration: 80,
  narration: [
    [0, 'Three changes to the research programme, in this order. First, add retention curves to the assessment of candidates: bonds, widths, periodic torsions and basin membership, separately. They distinguish a poor noise floor from a poor representation or too little population data.'],
    [24, 'Second, evaluate maps jointly with the model: displacement whitening plus score complexity and approximate operator closure, first on manufactured distributions with known scores, so estimator error cannot pose as geometry.'],
    [44, 'Third, test conditional stiff whitening with an explicit soft model, starting from a strong spring or invariant map, with topology, decoding cost and the physical measure accounted for.'],
    [60, 'Throughout, the physical density and force contract stays fixed: changing the geometry must not silently change the reference measure or the force target. Keep the thermal objective. Make its lag explicit. Decide what the noise should keep.'],
  ],
  header: header(11, 'THE PROGRAMME', 'Three changes, in order'),

  draw(ctx, t) {
    STEPS.forEach((s, i) => {
      card(ctx, { x: 80 + 480 * i, y: 220, width: 440, tag: s.tag, title: s.title, body: s.body, accent: s.accent, alpha: seg(t, s.at, s.at + 1), progress: lin(t, s.at + 0.6, s.at + 9) });
    });
    const contract = seg(t, 61, 62.2);
    ctx.save();
    ctx.globalAlpha = contract;
    ctx.fillStyle = rgba(color.gold, 0.08);
    roundRect(ctx, 80, 640, 1440, 110, 12);
    ctx.fill();
    ctx.strokeStyle = rgba(color.gold, 0.5);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    text(ctx, 'The contract', 110, 683, { ...type.display, alpha: contract });
    wrap(ctx, 'The physical density and force contract stays fixed: a change of geometry must not silently change the physical reference measure or the force target.', 300, 672, 1180, 28, { ...type.body, size: 20, alpha: contract });
    text(ctx, 'Keep the thermal objective.   Make its lag explicit.   Decide what the noise should keep.', 800, 820, { font: font.display, size: 30, weight: 500, color: color.gold, align: 'center', alpha: seg(t, 70, 71.5) });
  },
});
