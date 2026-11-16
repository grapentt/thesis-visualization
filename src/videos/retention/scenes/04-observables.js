import { defineScene, seg, fade, lin, text, wrap, type, font, color, rgba, tex, line } from '../../../kit.js';
import { header, frame, axes, heatmap, panel, pill, readout, PHI_TICKS, OBSERVABLE_COLOURS, INFO } from '../shared.js';
import { grid, PHI, R, OBSERVABLES, BASINS, tilted } from '../toy.js';

const TOY = frame({ x: 100, y: 240, w: 680, h: 400, u: [-Math.PI, Math.PI], v: [R.min, R.max] });
const PEAK = 1.25 * Math.max(...grid.p);
const TILT = tex(String.raw`p_\theta(x) = p(x)\,\exp\{\theta^{\top}u(x) - A(\theta)\}`, 'p_θ(x) = p(x) exp{θᵀu(x) − A(θ)}');
const INFO0 = tex(String.raw`\mathcal I_0 = \mathrm{Cov}_p\big(u(X_0)\big)`, 'I₀ = Cov_p(u(X₀))');
const SYMBOLS = [
  tex(String.raw`u_1 = r`, 'u₁ = r'),
  tex(String.raw`u_2 = \big(r - m(\varphi)\big)^2`, 'u₂ = (r − m(φ))²'),
  tex(String.raw`u_3 = \textstyle\sum_b w_b(\varphi)\,\sin(\varphi-\varphi_b)`, 'u₃ = Σ_b w_b(φ) sin(φ − φ_b)'),
  tex(String.raw`u_4 = w_B(\varphi)`, 'u₄ = w_B(φ)'),
];
const CHANGES = ['shifts the bond', 'widens or narrows the bond', 'turns the torsion inside its basin', 'moves population between basins'];

export default defineScene({
  name: 'Information about what?',
  duration: 85,
  narration: [
    [0, 'So, information about what? Take a toy molecule with two coordinates: a stiff bond r, and a torsion phi with two basins, drawn on a circle cut open. The bond’s mean and width drift slightly with the torsion.'],
    [20, 'Choose observables u: the bond stretch, its squared fluctuation for the width, the torsion’s deviation within its basin, and the smooth basin membership. Each one names a kind of physical change.'],
    [42, 'Tilting the distribution, p theta proportional to p times e to the theta u, changes exactly that statistic. The first shifts the bond, the second widens it, the third turns the torsion inside its basin, the fourth moves population between basins.'],
    [66, 'Fisher information about theta, at theta equals zero, is the covariance of u. That is the information the clean data carry about these changes. The question is how much of it survives the noise.'],
  ],
  header: header(4, 'OBSERVABLES', 'Information about what?'),

  draw(ctx, t) {
    // which observable is being tilted, and by how much
    let active = -1;
    let theta = 0;
    for (let k = 0; k < 4; k++) {
      const start = 43 + 6 * k;
      if (t >= start && t < start + 6) {
        active = k;
        const u = (t - start) / 6;
        theta = (1.1 / Math.sqrt(grid.cov0[k][k])) * Math.sin(2 * Math.PI * 1.5 * u) * Math.sin(Math.PI * u);
      }
    }
    const values = active >= 0 ? tilted(active, theta) : grid.p;

    const a = seg(t, 0.4, 1.6);
    heatmap(ctx, TOY, values, PHI.n, R.n, { alpha: a, max: PEAK, gamma: 0.6 });
    axes(ctx, TOY, { xTicks: PHI_TICKS, yTicks: [[-0.2, '−0.2'], [0, '0'], [0.2, '0.2']], xLabel: 'torsion φ (rad)', yLabel: 'bond r (Å)', alpha: a, box: true });
    for (const b of BASINS) {
      const x = TOY.X(b.centre);
      text(ctx, `basin ${b.name} · ${Math.round(b.weight * 100)} %`, x, TOY.y - 14, { font: font.mono, size: 15, color: color.gold, align: 'center', alpha: seg(t, 6, 7) });
      line(ctx, x, TOY.y - 6, x, TOY.y + 10, { color: color.gold, alpha: seg(t, 6, 7) });
    }
    wrap(ctx, 'p(r, φ): two basins in the torsion, a narrow Gaussian bond whose mean m(φ) and width c(φ) follow the torsion', 100, 720, 680, 24, { ...type.note, size: 15, alpha: seg(t, 9, 10.5) });
    if (active >= 0) {
      const name = OBSERVABLES[active].name;
      text(ctx, `p_θ tilted along u_${active + 1} (${name}), θ = ${theta >= 0 ? '+' : '−'}${Math.abs(theta * Math.sqrt(grid.cov0[active][active])).toFixed(2)} sd`, 100, 790, { font: font.mono, size: 15, color: OBSERVABLE_COLOURS[OBSERVABLES[active].key] });
    }

    // the four observables
    OBSERVABLES.forEach((o, k) => {
      const y = 240 + 100 * k;
      const colour = OBSERVABLE_COLOURS[o.key];
      const on = seg(t, 21 + 5 * k, 22 + 5 * k);
      const hot = active === k ? 1 : 0;
      panel(ctx, 840, y, 680, 88, { alpha: on, stroke: rgba(colour, 0.35 + 0.65 * hot), fill: hot ? rgba(colour, 0.08) : 'rgba(17,24,40,0.85)' });
      pill(ctx, `u${'₁₂₃₄'[k]}`, 862, y + 26, colour, on);
      text(ctx, o.name, 920, y + 32, { ...type.display, size: 23, alpha: on });
      SYMBOLS[k].draw(ctx, 862, y + 64, { size: 19, alpha: on });
      text(ctx, `tilting it ${CHANGES[k]}`, 1500, y + 68, { font: font.mono, size: 14, color: colour, align: 'right', alpha: on * seg(t, 42 + 6 * k, 43 + 6 * k) });
    });

    TILT.draw(ctx, 840, 690, { size: 24, alpha: seg(t, 42, 43.2) });
    INFO0.draw(ctx, 840, 745, { size: 24, alpha: seg(t, 66, 67.2) });
    OBSERVABLES.forEach((o, k) => readout(ctx, `sd(u${'₁₂₃₄'[k]})`, Math.sqrt(grid.cov0[k][k]).toPrecision(3), 1120 + 200 * (k % 2), 735 + 22 * Math.floor(k / 2), { colour: OBSERVABLE_COLOURS[o.key], size: 15, alpha: seg(t, 68 + k, 69 + k) }));
    wrap(ctx, 'the information the clean ensemble carries about each change; the covariance I₀ is the Fisher information of the tilt family at θ = 0', 840, 800, 680, 24, { ...type.note, size: 15, alpha: seg(t, 72, 73.5) });
  },
});
