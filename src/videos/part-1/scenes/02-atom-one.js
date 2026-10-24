import {
  defineScene, seg, fade, lerp, oscillate, text, wrap, type, color, axisColor, axisName,
  drawMolecule, moleculeCamera, molecule, arrow3, drawAxisTriad, columnVector, vec3,
} from '../../../kit.js';

/** A generic small motion of atom 1 (Å). */
const DELTA = [0.34, 0.26, -0.34];
/** When the atom wiggles along x, y and z. */
const AXIS_WIGGLES = [[3.4, 6.0], [6.2, 8.8], [9.0, 11.6]];
const GENERAL_MOTION = [12.6, 16.2];

export default defineScene({
  name: 'Atom 1',
  duration: 17,
  continues: true,
  narration:
    'Focus on atom 1. Its position is three numbers. Moving along x changes only x₁, moving along y only y₁, and so on. Any small motion of the atom is a direction: a vector δr₁ with three components.',
  header: { eyebrow: '02 · ONE ATOM, THREE NUMBERS', title: 'Atom 1 sits at r₁ = (x₁, y₁, z₁)' },

  draw(ctx, t) {
    const cam = moleculeCamera({ cx: lerp(800, 480, seg(t, 0, 1.2)), cy: 520, scale: 160 });
    const dim = seg(t, 0.6, 1.6);
    const active = AXIS_WIGGLES.findIndex(([a, b]) => t >= a && t <= b);
    const general = 0.9 * oscillate(t, ...GENERAL_MOTION);
    const d = [0, 1, 2].map((k) => 0.42 * oscillate(t, ...AXIS_WIGGLES[k]) + general * DELTA[k]);

    const X = molecule.positions.slice();
    X[0] += d[0];
    X[1] += d[1];
    X[2] += d[2];
    drawMolecule(ctx, X, cam, { atomAlpha: [1, 0, 0, 0, 0].map((on) => (on ? 1 : 1 - 0.82 * dim)), highlight: 0, highlightAlpha: dim });

    // axis triad at the rest position, then the displacement along the active axis
    const origin = molecule.atom(molecule.positions, 0);
    const triad = seg(t, 1.6, 2.6) * (1 - 0.6 * seg(t, 12, 12.8));
    if (triad > 0) drawAxisTriad(ctx, cam, origin, { length: 0.85 * triad, active, labelAlpha: triad });
    if (active >= 0 && Math.abs(d[active]) > 0.02) {
      arrow3(ctx, cam, origin, vec3.axisVector(active, d[active]), { color: color.gold, width: 5, head: 15 });
    }

    // a general direction = sum of its three components
    const g = fade(t, 12.4, 13.2, 16.3, 16.9);
    if (g > 0) {
      let corner = origin;
      for (let k = 0; k < 3; k++) {
        const part = vec3.axisVector(k, DELTA[k]);
        arrow3(ctx, cam, corner, part, { color: axisColor[k], width: 2.5, head: 10, dash: [6, 6], alpha: g * 0.9 });
        corner = vec3.add(corner, part);
      }
      const tip = arrow3(ctx, cam, origin, DELTA, { color: color.gold, width: 5, head: 16, alpha: g });
      text(ctx, 'δr₁', tip.x + 12, tip.y + 26, { ...type.math, size: 30, color: color.gold, alpha: g });
    }

    const colAlpha = seg(t, 1.8, 2.8);
    columnVector(ctx, 1160, 330, [0, 1, 2].map((k) => ({ symbol: `${axisName[k]}₁`, value: X[k], color: axisColor[k], highlight: active === k ? 1 : 0 })), {
      alpha: colAlpha,
      label: 'r₁',
    });
    columnVector(ctx, 1360, 330, [0, 1, 2].map((k) => ({ symbol: `δ${axisName[k]}₁`, value: DELTA[k], color: axisColor[k] })), {
      alpha: fade(t, 12.8, 13.6, 16.2, 16.9),
      width: 150,
      label: 'δr₁',
      labelColor: color.gold,
    });
    text(ctx, 'coordinates in Å', 1160, 470, { ...type.note, align: 'center', alpha: colAlpha });

    const note = { ...type.body, size: 23 };
    wrap(ctx, 'Move along one axis: only that one number changes.', 1000, 580, 520, 32, { ...note, alpha: fade(t, 3.6, 4.4, 11.6, 12.2) });
    wrap(ctx, 'Any small motion of atom 1 is a direction: three numbers, one arrow.', 1000, 580, 520, 32, { ...note, alpha: fade(t, 13.4, 14.2, 16.3, 16.9) });
  },
});
