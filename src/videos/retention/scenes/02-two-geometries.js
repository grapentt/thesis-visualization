import { defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, rgba, tex, line, dashedLine, dot } from '../../../kit.js';
import { header, frame, axes, drawCurve, drawPath, decades, caption, readout, legend, track, BOND, TORSION, INFO, DATA } from '../shared.js';
import { COORDINATES, ou, ouPaths } from '../math.js';

const SDE = tex(String.raw`dX_\tau = -k\,X_\tau\,d\tau + \sqrt{2D}\,dB_\tau,\qquad v = D/k`, 'dXτ = −k Xτ dτ + √(2D) dBτ,   v = D/k');
const COND = tex(String.raw`m_\tau(x) = e^{-k\tau}x,\qquad C_\tau = v\,(1-e^{-2k\tau})`, 'mτ(x) = e^(−kτ) x,   Cτ = v (1 − e^(−2kτ))');
const FISHER = tex(String.raw`F_\tau = \frac{1}{v\,(e^{2k\tau}-1)}`, 'Fτ = 1 / (v (e^(2kτ) − 1))');
const INCREMENT = tex(String.raw`\tfrac12\,\mathbb E[(X_\tau-X_0)^2] = v\,(1-e^{-k\tau})`, '½ E[(Xτ − X0)²] = v (1 − e^(−kτ))');

const BOND_PANEL = { coord: COORDINATES.bond, colour: BOND, F: frame({ x: 110, y: 262, w: 540, h: 206, u: [0, 0.012], v: [-0.2, 0.2] }), x0: 0.15, ticks: [0, 0.004, 0.008, 0.012], vTicks: [-0.2, 0, 0.2], label: 'bond · k = 400 /ps · x in Å over 0.012 ps' };
const TORSION_PANEL = { coord: COORDINATES.torsion, colour: TORSION, F: frame({ x: 110, y: 586, w: 540, h: 206, u: [0, 5], v: [-4, 4] }), x0: 3, ticks: [0, 1, 2, 3, 4, 5], vTicks: [-4, 0, 4], label: 'torsion · k = 1 /ps · x in Å over 5 ps' };
for (const panel of [BOND_PANEL, TORSION_PANEL]) {
  const steps = 240;
  const dt = panel.F.u[1] / steps;
  panel.paths = ouPaths(panel.coord, { x0: panel.x0, count: 22, steps, dt, seed: panel === BOND_PANEL ? 11 : 12 }).map((p) => Array.from(p, (v, n) => [n * dt, v]));
}

const PLOT = frame({ x: 790, y: 236, w: 700, h: 400, u: [-3.5, 1], v: [-5, 3] });
const log = Math.log10;
const CURVES = {
  variance: (c) => (l) => log(ou.conditionalVariance(c, 10 ** l)),
  fisher: (c) => (l) => log(ou.fisher(c, 10 ** l)),
  increment: (c) => (l) => log(ou.increment(c, 10 ** l)),
};

export default defineScene({
  name: 'Two geometries, not one',
  duration: 120,
  narration: [
    [0, 'Before adding anything, one correction. Thermal stiffness and the Fisher information of the dynamics are different geometries. Take one harmonic coordinate: it relaxes at rate k, diffuses with D, and its equilibrium variance is v equals D over k.'],
    [22, 'Start many copies at the same point and watch. The mean decays like e to the minus k tau. The spread grows like 2 D tau at first, and saturates at v. A bond, with k four hundred times larger, saturates almost at once.'],
    [45, 'Now ask how much the position after lag tau tells about the start. That is the initial-state Fisher information F tau. It begins at one over 2 D tau, the same for every coordinate, and then collapses, fastest for the stiff bond, which forgets its start first.'],
    [70, 'The thermal metric is one over v. It magnifies the bond. The finite-lag Fisher metric suppresses it. The two agree only through extra relations between mobility and stiffness, so one cannot stand in for the other.'],
    [92, 'The learned warp of the repository fits the mean squared step at one picosecond. That statistic is v times one minus e to the minus k tau: for bonds already the equilibrium width, for torsions a width still far below the spread across basins. It is a finite-lag thermal construction, and its lag should be stated.'],
  ],
  header: header(2, 'TWO GEOMETRIES', 'Thermal stiffness is not dynamical Fisher information'),

  draw(ctx, t) {
    SDE.draw(ctx, 110, 196, { size: 24, alpha: seg(t, 1, 2.2) });

    // sample paths of the two coordinates, each on its own time axis
    const pathProgress = lin(t, 23, 40);
    for (const panel of [BOND_PANEL, TORSION_PANEL]) {
      const { F, coord, colour } = panel;
      const a = seg(t, 20, 21.5);
      axes(ctx, F, { xTicks: panel.ticks, yTicks: panel.vTicks, xLabel: 'τ (ps)', alpha: a, format: (v) => String(v) });
      caption(ctx, F, panel.label, a, { color: colour });
      for (const path of panel.paths) drawPath(ctx, F, path, { colour: DATA, alpha: 0.32 * a, width: 1.2, progress: pathProgress });
      const envelope = seg(t, 30, 32) * a;
      drawCurve(ctx, F, (tau) => ou.mean(coord, tau, panel.x0), { colour, alpha: envelope, width: 3 });
      for (const sign of [1, -1]) drawCurve(ctx, F, (tau) => ou.mean(coord, tau, panel.x0) + sign * 2 * Math.sqrt(ou.conditionalVariance(coord, tau)), { colour, alpha: envelope, width: 1.5, dash: [6, 6] });
      text(ctx, 'mean ± 2√C_τ', F.x + F.w - 8, F.y + 22, { font: font.mono, size: 14, color: colour, align: 'right', alpha: envelope });
    }

    // the right plot: conditional variance, then Fisher information, then the increment statistic
    const phases = [
      { key: 'variance', alpha: fade(t, 22, 24, 44.5, 46), title: 'conditional variance C_τ', guide: (l) => log(2 * 10 ** l), guideName: '2Dτ', formula: COND },
      { key: 'fisher', alpha: fade(t, 46, 48, 91, 93), title: 'initial-state Fisher information F_τ', guide: (l) => -log(2 * 10 ** l), guideName: '1 / 2Dτ', formula: FISHER },
      { key: 'increment', alpha: seg(t, 93, 95), title: 'stationary step statistic ½ E[(X_τ − X_0)²]', guide: (l) => log(10 ** l), guideName: 'Dτ', formula: INCREMENT },
    ];
    const plotAlpha = seg(t, 22, 23.5);
    axes(ctx, PLOT, { xTicks: decades(-3, 1), yTicks: decades(-4, 2).filter((_, i) => i % 2 === 0), xLabel: 'lag τ (ps, log)', grid: true, alpha: plotAlpha });
    for (const phase of phases) {
      if (phase.alpha <= 0.003) continue;
      text(ctx, phase.title, PLOT.x, PLOT.y - 22, { size: 19, weight: 500, alpha: phase.alpha });
      drawCurve(ctx, PLOT, phase.guide, { colour: color.dim, alpha: phase.alpha, width: 1.5, dash: [4, 6] });
      text(ctx, phase.guideName, PLOT.X(-2.9), PLOT.Y(phase.guide(-2.9)) + (phase.key === 'fisher' ? -14 : 24), { font: font.mono, size: 14, color: color.dim, alpha: phase.alpha });
      for (const panel of [BOND_PANEL, TORSION_PANEL]) drawCurve(ctx, PLOT, CURVES[phase.key](panel.coord), { colour: panel.colour, alpha: phase.alpha, width: 3.5, n: 400 });
      phase.formula.draw(ctx, 790, 796, { size: 24, alpha: phase.alpha });
    }
    legend(ctx, PLOT.x + 470, PLOT.y - 22, [{ name: 'bond', colour: BOND }, { name: 'torsion', colour: TORSION }], { alpha: plotAlpha });

    // the thermal metric 1/v, during the Fisher phase
    const thermal = fade(t, 70, 72, 91, 93);
    for (const panel of [BOND_PANEL, TORSION_PANEL]) {
      const level = -log(ou.variance(panel.coord));
      dashedLine(ctx, PLOT.x, PLOT.Y(level), PLOT.x + PLOT.w, PLOT.Y(level), { color: panel.colour, width: 2, alpha: thermal, dash: [10, 8] });
      text(ctx, `thermal metric 1/v = ${1 / ou.variance(panel.coord)}`, PLOT.x + PLOT.w - 8, PLOT.Y(level) - 10, { font: font.mono, size: 14, color: panel.colour, align: 'right', alpha: thermal });
    }
    wrap(ctx, 'Thermal: the bond counts 400× more. Fisher at any finite lag: the bond counts less, at every τ.', 790, 718, 700, 26, { ...type.body, size: 19, alpha: thermal });

    // a cursor sweeping the lag, with readouts
    const sweep = phases[0].alpha > 0.5 ? lin(t, 25, 43) : phases[1].alpha > 0.5 ? lin(t, 49, 68) : -1;
    if (sweep >= 0 && sweep < 1) {
      const l = lerp(-3.5, 1, sweep);
      const tau = 10 ** l;
      const key = phases[0].alpha > 0.5 ? 'variance' : 'fisher';
      line(ctx, PLOT.X(l), PLOT.y, PLOT.X(l), PLOT.y + PLOT.h, { color: color.gold, width: 1.5 });
      for (const panel of [BOND_PANEL, TORSION_PANEL]) {
        const value = CURVES[key](panel.coord)(l);
        if (value > PLOT.v[0] && value < PLOT.v[1]) dot(ctx, PLOT.X(l), PLOT.Y(value), 6, panel.colour);
      }
      readout(ctx, 'τ =', `${tau.toPrecision(2)} ps`, PLOT.X(l) + (l < -0.5 ? 12 : -12), PLOT.y + PLOT.h - 14, { colour: color.gold, size: 15, align: l < -0.5 ? 'left' : 'right' });
    }

    // the 1 ps marker of the learned warp
    const marker = seg(t, 96, 97.5);
    line(ctx, PLOT.X(0), PLOT.y, PLOT.X(0), PLOT.y + PLOT.h, { color: color.gold, width: 2, alpha: marker });
    text(ctx, 'the warp’s lag: 1 ps', PLOT.X(0) + 10, PLOT.y + 20, { font: font.mono, size: 15, color: color.gold, alpha: marker });
    for (const [i, panel] of [BOND_PANEL, TORSION_PANEL].entries()) {
      const share = ou.increment(panel.coord, 1) / ou.variance(panel.coord);
      readout(ctx, `${panel.coord.name} step width at 1 ps:`, `${Math.round(share * 100)} % of its equilibrium width`, 790, 720 + 28 * i, { colour: panel.colour, size: 16, alpha: seg(t, 99 + 3 * i, 100 + 3 * i) });
    }
    wrap(ctx, 'a finite-lag thermal construction, not an estimate of mobility D: keep the thermal objective, make the lag explicit', 790, 842, 700, 24, { ...type.note, size: 15, color: color.gold, alpha: seg(t, 108, 109.5) });
  },
});
