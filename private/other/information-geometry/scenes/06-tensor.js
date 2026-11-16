// Scene 06: the Fisher information is a metric tensor, not a number. The same coins in three
// coordinates (p, log-odds x, angle φ); the length of a path is the same in each; in φ the metric is
// flat and the family has length π; the circle behind it; and Wootters' count: after n flips, coins
// one standard deviation apart are 1/√n apart in φ, so 100 flips tell about 31 coins apart.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, rgba, brace } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, header, frame, axes, drawPath, drawPoint, readout, exampleStamp, fmt, pill } from '../shared.js';
import { bernoulliFisher, bernoulliFisherLogit, bernoulliAngle, bernoulliFromAngle, bernoulliDistance, logit, sigmoid, distinguishableGrid, distinguishableCoins } from '../math.js';

const N = 100;
const AX = {
  p: frame({ x: 110, y: 300, w: 620, h: 1, u: [0, 1], v: [0, 1] }),
  x: frame({ x: 110, y: 430, w: 620, h: 1, u: [-5, 5], v: [0, 1] }),
  phi: frame({ x: 110, y: 560, w: 620, h: 1, u: [0, Math.PI], v: [0, 1] }),
};
const COORD = { p: (p) => p, x: (p) => logit(p), phi: (p) => bernoulliAngle(p) };
const SEGMENT = [0.1, 0.7];
const GRID = distinguishableGrid(N);
const C = { cx: 1180, cy: 860, r: 220 }; // the quarter circle of radius 2, drawn 110 px per unit
const circlePoint = (p) => [C.cx + C.r * Math.sqrt(p), C.cy - C.r * Math.sqrt(1 - p)];

/** Numerical lengths of the segment [0.1, 0.7] in the p and in the x coordinate: the same number. */
function lengthIn(coord, g, a, b, n = 4000) {
  const u0 = coord(a);
  const u1 = coord(b);
  let L = 0;
  for (let i = 0; i < n; i++) L += Math.sqrt(g(u0 + ((u1 - u0) * (i + 0.5)) / n)) * Math.abs(u1 - u0) / n;
  return L;
}
const LENGTH_P = lengthIn(COORD.p, bernoulliFisher, ...SEGMENT);
const LENGTH_X = lengthIn(COORD.x, bernoulliFisherLogit, ...SEGMENT);
const LENGTH_PHI = lengthIn(COORD.phi, () => 1, ...SEGMENT);

const TENSOR = tex(String.raw`g_x(x) = g_p(p)\left(\frac{dp}{dx}\right)^{2}`, 'g_x(x) = g_p(p) (dp/dx)²');
const LENGTH = tex(String.raw`L[\gamma] = \int \sqrt{g(\theta)}\;|d\theta|`, 'L[γ] = ∫ √g(θ) |dθ|');
const PHI = tex(String.raw`\varphi = 2\arcsin\sqrt{p},\qquad d\varphi^2 = \frac{dp^2}{p(1-p)}`, 'φ = 2 arcsin √p,  dφ² = dp²/(p(1−p))');
const CIRCLE = tex(String.raw`p \;\mapsto\; 2\big(\sqrt{p},\,\sqrt{1-p}\big)`, 'p ↦ 2(√p, √(1−p))');
const DIST = tex(String.raw`d_{\mathrm{FR}}(p,q) = 2\arccos\!\big(\sqrt{pq} + \sqrt{(1-p)(1-q)}\big)`, 'd_FR(p, q) = 2 arccos(√(pq) + √((1−p)(1−q)))');
const COUNT = tex(String.raw`\#\{\text{coins } n \text{ flips tell apart}\} \approx \sqrt{n}\, L = \sqrt{n}\,\pi`, '#coins n flips tell apart ≈ √n · L = √n · π');

export default defineScene({
  name: 'A metric, not a number',
  duration: 72,
  narration: [
    [0, 'Fisher information is not a number attached to a distribution; it depends on the coordinates. Change from p to the log-odds x and it changes by the square of dp by dx, as a metric tensor must. What does not change is the length of a path, the integral of root g along it: from p equal point one to point seven it is one point three four in either coordinate.'],
    [18, 'For the coin there is a coordinate in which the ruler is constant. Take phi equal to two arcsine root p. Then d phi squared is g d p squared: in phi, equally distinguishable coins are equally spaced, and the whole family, from p zero to one, has length pi.'],
    [33, 'Here is why. Send the coin to the point two root p, two root one minus p, on the circle of radius two. The Fisher metric is the arc length of that circle, and the Fisher–Rao distance between two coins is an angle: two arccos of root p q plus root one minus p one minus q.'],
    [48, 'Now count. After n flips, coins one standard deviation apart sit one over root n apart in phi. So a hundred flips can tell apart about thirty-one coins along the whole family, and in p they crowd towards zero and one. That is Wootters\' reading of the metric: Fisher–Rao distance counts distinguishable distributions.'],
    [64, 'Keep this picture. The Fisher metric is the arc length of a sphere in disguise, and with three outcomes the disguise comes off.'],
  ],
  header: header(6, 'A METRIC, NOT A NUMBER', 'Lengths are the same in every coordinate system'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    const rows = [
      ['p', 'bias p', [0, 0.25, 0.5, 0.75, 1], on, P_COL, (v) => String(v)],
      ['x', 'log-odds x', [-4, -2, 0, 2, 4], seg(t, 2, 3), Q_COL, (v) => String(v)],
      ['phi', 'angle φ = 2 arcsin √p', [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI], seg(t, 18.5, 19.5), METRIC, (v) => (v === 0 ? '0' : v === Math.PI ? 'π' : `${fmt(v / Math.PI, 2)}π`)],
    ];
    for (const [key, label, ticks, a, tint, format] of rows) {
      const F = AX[key];
      axes(ctx, { ...F, h: 0 }, { xTicks: ticks, alpha: a, format });
      text(ctx, label, F.x, F.y - 34, { ...type.note, color: tint, alpha: a });
      // the segment [0.1, 0.7] and its length
      const sgm = a * fade(t, 5, 6, 47, 48);
      const u0 = COORD[key](SEGMENT[0]);
      const u1 = COORD[key](SEGMENT[1]);
      line(ctx, F.X(u0), F.y, F.X(u1), F.y, { color: tint, width: 6, alpha: 0.8 * sgm });
      const len = key === 'p' ? LENGTH_P : key === 'x' ? LENGTH_X : LENGTH_PHI;
      text(ctx, `length ∫√g = ${fmt(len)}`, F.X(u1) + 14, F.y - 10, { font: font.mono, size: 14, color: tint, alpha: sgm * seg(t, 9, 10) });
      // threads to the next axis for a few coins
      if (key !== 'phi') {
        const next = AX[key === 'p' ? 'x' : 'phi'];
        const nextCoord = COORD[key === 'p' ? 'x' : 'phi'];
        const nextOn = key === 'p' ? seg(t, 2, 3) : seg(t, 18.5, 19.5);
        for (const c of [0.02, 0.1, 0.3, 0.5, 0.7, 0.9, 0.98]) line(ctx, F.X(COORD[key](c)), F.y, next.X(nextCoord(c)), next.y, { color: color.dim, width: 1, alpha: 0.45 * nextOn * a });
      }
      // the distinguishable coins
      const grid = a * seg(t, 49, 50);
      if (grid > 0.003) {
        for (const c of GRID) {
          const u = COORD[key](c);
          if (u < F.u[0] || u > F.u[1]) continue;
          line(ctx, F.X(u), F.y - 7, F.X(u), F.y + 7, { color: METRIC, width: 1.5, alpha: grid });
        }
      }
    }
    text(ctx, `${GRID.length} coins, neighbours one standard deviation apart after ${N} flips: evenly spaced in φ, 1/√n = 0.1 apart`, 110, 610, { ...type.note, color: METRIC, alpha: seg(t, 50, 51) });
    text(ctx, 'in p they crowd towards 0 and 1, where a small Δp is a large step', 110, 634, { ...type.note, alpha: seg(t, 53, 54) });

    drawCircle(ctx, t);
    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), 'lengths integrated numerically · everything on screen is computed');
  },
});

/** The quarter circle of radius 2 with the coins on it, two of them with their angle. */
function drawCircle(ctx, t) {
  const on = seg(t, 33.5, 34.5);
  if (on <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= on;
  line(ctx, C.cx, C.cy, C.cx + C.r + 30, C.cy, { color: color.line, width: 1.5 });
  line(ctx, C.cx, C.cy, C.cx, C.cy - C.r - 30, { color: color.line, width: 1.5 });
  text(ctx, '2√p', C.cx + C.r + 36, C.cy + 5, { font: font.display, italic: true, size: 18, color: color.muted });
  text(ctx, '2√(1−p)', C.cx + 10, C.cy - C.r - 36, { font: font.display, italic: true, size: 18, color: color.muted });
  ctx.strokeStyle = METRIC;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(C.cx, C.cy, C.r, -Math.PI / 2, 0);
  ctx.stroke();
  text(ctx, 'p = 0', C.cx - 10, C.cy - C.r + 4, { font: font.mono, size: 13, color: color.muted, align: 'right' });
  text(ctx, 'p = 1', C.cx + C.r + 6, C.cy - 10, { font: font.mono, size: 13, color: color.muted });
  // the family's length π
  text(ctx, 'arc length = π', C.cx + 0.72 * C.r, C.cy - 0.75 * C.r, { font: font.mono, size: 14, color: METRIC });
  // a few coins and the two of the segment
  for (const c of [0.1, 0.25, 0.5, 0.75, 0.9]) {
    const [x, y] = circlePoint(c);
    ring(ctx, x, y, 3.5, color.muted);
  }
  const [x0, y0] = circlePoint(SEGMENT[0]);
  const [x1, y1] = circlePoint(SEGMENT[1]);
  const two = seg(t, 38, 39);
  ctx.globalAlpha *= 1;
  line(ctx, C.cx, C.cy, x0, y0, { color: P_COL, width: 1.5, alpha: two });
  line(ctx, C.cx, C.cy, x1, y1, { color: Q_COL, width: 1.5, alpha: two });
  drawDot(ctx, x0, y0, P_COL, two, 'p = 0.1');
  drawDot(ctx, x1, y1, Q_COL, two, 'q = 0.7');
  // the arc between them
  const a0 = Math.atan2(y0 - C.cy, x0 - C.cx);
  const a1 = Math.atan2(y1 - C.cy, x1 - C.cx);
  ctx.save();
  ctx.globalAlpha *= two;
  ctx.strokeStyle = P_COL;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(C.cx, C.cy, C.r, Math.min(a0, a1), Math.max(a0, a1));
  ctx.stroke();
  ctx.restore();
  text(ctx, `d_FR(0.1, 0.7) = ${fmt(bernoulliDistance(...SEGMENT))}`, 850, 760, { font: font.mono, size: 15, color: P_COL, alpha: two });
  text(ctx, '= the length of the segment above', 850, 782, { font: font.mono, size: 13, color: color.muted, alpha: two });
  text(ctx, 'radius 2, so arc length = 2 × angle', 850, 804, { font: font.mono, size: 13, color: color.muted, alpha: two });
  // the distinguishable coins on the arc
  const grid = seg(t, 49, 50);
  if (grid > 0.003) {
    for (const c of GRID) {
      const [x, y] = circlePoint(c);
      const ux = (x - C.cx) / C.r;
      const uy = (y - C.cy) / C.r;
      line(ctx, x - 6 * ux, y - 6 * uy, x + 6 * ux, y + 6 * uy, { color: METRIC, width: 1.5, alpha: grid });
    }
    text(ctx, `${GRID.length} evenly spaced ticks on the arc, 1/√n apart`, 850, 838, { font: font.mono, size: 13, color: METRIC, alpha: grid });
  }
  ctx.restore();
}

function ring(ctx, x, y, r, tint) {
  ctx.save();
  ctx.strokeStyle = tint;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}
function drawDot(ctx, x, y, tint, alpha, label) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  text(ctx, label, x + 10, y - 10, { font: font.mono, size: 14, color: tint, alpha });
}

/** Formulas on the right, timed to the narration. */
function drawNotes(ctx, t) {
  const R = 850;
  TENSOR.draw(ctx, R, 222, { size: 26, alpha: seg(t, 1, 2) });
  text(ctx, 'a (0, 2)-tensor: the transformation law of a metric', R, 258, { ...type.note, size: 13, alpha: seg(t, 2.5, 3.5) });
  LENGTH.draw(ctx, R, 298, { size: 26, alpha: seg(t, 6, 7) });
  text(ctx, 'invariant: the same in every coordinate system', R, 334, { ...type.note, size: 13, alpha: seg(t, 7, 8) });
  PHI.draw(ctx, R, 378, { size: 24, alpha: seg(t, 19, 20) });
  text(ctx, 'flat in φ: g_φ = 1, length of the family = φ(1) − φ(0) = π', R, 414, { ...type.note, size: 13, color: METRIC, alpha: seg(t, 24, 25) });
  CIRCLE.draw(ctx, R, 462, { size: 24, alpha: fade(t, 34, 35, 47, 48) });
  DIST.draw(ctx, R, 510, { size: 21, alpha: fade(t, 42, 43, 47, 48) });
  // Wootters
  const w = seg(t, 49, 50);
  pill(ctx, 'COUNTING DISTINGUISHABLE DISTRIBUTIONS', R, 466, METRIC, w);
  COUNT.draw(ctx, R, 512, { size: 22, alpha: w });
  readout(ctx, `n = ${N}:  √n · π =`, distinguishableCoins(N), R, 550, { colour: METRIC, alpha: seg(t, 51, 52), digits: 1 });
  text(ctx, 'Wootters 1981: with n samples the metric is n·g, so √n × d_FR ≈ standard deviations', R, 578, { ...type.note, size: 12, alpha: seg(t, 55, 56) });
  // the closing line
  wrap(ctx, 'The Fisher metric is the arc length of a sphere in disguise.', 110, 720, 620, 28, { ...type.body, size: 22, color: METRIC, alpha: seg(t, 64.5, 65.5) });
}
