import { defineScene, seg, lin, text, wrap, type, color, tex, card } from '../../../kit.js';
import { HORIZONTAL } from '../shared.js';
import { X, Y, FIBRES, drawRectangle, drawDashes } from '../flatTorus.js';

const RIGHT = 920;
const ORTHOGONAL = tex(String.raw`H_p = V_p^{\perp}`, 'H_p = V_p^⊥');
const MECHANICAL = tex(
  String.raw`H_x = \Big\{\dot x : \sum_i m_i \dot x_i = 0,\; \sum_i m_i\, x_i \times \dot x_i = 0\Big\}`,
  'H_x = { ẋ : Σ mᵢẋᵢ = 0, Σ mᵢ xᵢ × ẋᵢ = 0 }',
);
const MARKS = [[FIBRES[1], 2.0], [FIBRES[3], 4.4], [FIBRES[6], 1.3]];

export default defineScene({
  name: 'Metric connection',
  duration: 26,
  continues: true,
  narration:
    'A metric on the total space says what orthogonal means, and so it picks a natural connection: the horizontal space is the orthogonal complement of the vertical one. In geometric mechanics, with the kinetic-energy metric, this is the mechanical connection: horizontal motions are exactly those with zero total linear and angular momentum. We take that momentum to be zero.',
  header: { eyebrow: '04 · CONNECTIONS', title: 'A metric picks a natural connection' },

  draw(ctx, t) {
    const lambda = 1 - seg(t, 2, 5);
    drawRectangle(ctx);
    drawDashes(ctx, lambda);

    // right-angle marks where horizontal meets vertical
    const marks = seg(t, 5, 6);
    for (const [theta, phi] of MARKS) {
      const x = X(theta);
      const y = Y(phi);
      ctx.save();
      ctx.globalAlpha = marks;
      ctx.strokeStyle = HORIZONTAL;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 40, y);
      ctx.lineTo(x + 40, y);
      ctx.stroke();
      ctx.strokeStyle = color.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y - 12, 12, 12);
      ctx.restore();
    }

    const words = { ...type.body, size: 21 };
    wrap(ctx, 'A metric on the total space says what orthogonal means. That picks a natural connection: the horizontal space is the orthogonal complement of the vertical one.', RIGHT, 270, 600, 30, {
      ...words,
      alpha: seg(t, 1, 2),
    });
    ORTHOGONAL.draw(ctx, RIGHT, 390, { size: 36, alpha: seg(t, 5, 6) });

    card(ctx, {
      x: RIGHT,
      y: 450,
      width: 600,
      tag: 'GEOMETRIC MECHANICS',
      title: 'The mechanical connection',
      body: 'With the kinetic-energy metric of the atoms, H_x contains exactly the motions with zero total linear and angular momentum. This is the mechanical connection; throughout, we take that momentum to be 0.',
      accent: color.gold,
      alpha: seg(t, 8.5, 9.3),
      progress: lin(t, 8.8, 13),
    });
    MECHANICAL.draw(ctx, RIGHT, 790, { size: 26, alpha: seg(t, 14, 15) });
  },
});
