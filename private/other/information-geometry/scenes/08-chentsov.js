// Scene 08: why this ruler. Relabelling outcomes changes nothing; merging outcomes (coarse-graining)
// can only shrink Fisher–Rao distances; splitting an outcome in fixed proportions (a Markov
// embedding) keeps them; and Chentsov's theorem says the Fisher metric is the only metric on the
// simplices with that invariance, up to a constant factor.

import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, line, arrow, rgba } from '../../../../src/kit.js';
import { P_COL, Q_COL, METRIC, header, triangle, drawTriangle, drawSimplexPoint, drawSimplexPath, drawOutcomeBars, readout, exampleStamp, fmt, pill, aside } from '../shared.js';
import { fisherRao, fisherRaoGeodesic, merge, split, bernoulliDistance } from '../math.js';

const T = triangle({ x: 120, y: 250, size: 540 });
const P = [0.35, 0.5, 0.15];
const Q = [0.3, 0.15, 0.55];
const GEO = Array.from({ length: 61 }, (_, i) => fisherRaoGeodesic(P, Q, i / 60));
const PM = merge(P, [[0], [1, 2]]);
const QM = merge(Q, [[0], [1, 2]]);
const FRACTIONS = [1 / 3, 2 / 3];
const PS = split(P, 2, FRACTIONS);
const QS = split(Q, 2, FRACTIONS);
const D0 = fisherRao(P, Q);
const D_MERGED = fisherRao(PM, QM);
const D_SPLIT = fisherRao(PS, QS);
/** The coin (p₁, 1 − p₁) drawn on the base edge e₁–e₂ of the triangle: p₁ e₁ + (1 − p₁) e₂. */
const onBase = (p1) => [p1, 1 - p1, 0];
const R = 850;

const MONO = tex(String.raw`d_{\mathrm{FR}}\big(\kappa(p), \kappa(q)\big) \;\le\; d_{\mathrm{FR}}(p, q)\quad\text{for every Markov map } \kappa`, 'd_FR(κp, κq) ≤ d_FR(p, q) for every Markov map κ');
const CHENTSOV = tex(String.raw`g \text{ invariant under all Markov embeddings} \;\Rightarrow\; g = c\cdot g_{\mathrm{Fisher}}`, 'g invariant under all Markov embeddings ⇒ g = c · g_Fisher');

export default defineScene({
  name: 'Why this ruler',
  duration: 66,
  narration: [
    [0, 'Why this ruler and not another? Here are two dice on the triangle, zero point nine seven apart. Relabel the outcomes, turning the triangle onto itself, and nothing changes: the metric does not care which face is called one. Now merge outcomes two and three: each die becomes a coin, and the triangle collapses onto one edge.'],
    [18, 'The two coins are zero point one one apart. Merging threw away exactly the information that told these dice apart, and the distance shrank with it. In general a statistic can only shrink Fisher–Rao distances, and it keeps them exactly when it is sufficient.'],
    [33, 'Go the other way: split outcome three into two sub-outcomes in fixed proportions. The dice gain a face but no information, and the distance is unchanged: zero point nine seven again. Chentsov\'s theorem, from 1972, says that a metric defined on all the simplices and invariant under every such splitting is a constant multiple of the Fisher metric. There is no other invariant ruler.'],
    [52, 'The theorem extends to general sample spaces and to densities on manifolds, and it has a twin for connections that we meet at the end. The Fisher metric is not a convention. It is forced by asking that distances between distributions mean the same thing whatever we call the outcomes.'],
  ],
  header: header(8, 'WHY THIS RULER', 'Chentsov: invariant under coarse-graining, and the only one'),

  draw(ctx, t) {
    const on = seg(t, 0.3, 1.3);
    // relabelling: the triangle turns onto itself for a moment
    const turn = fade(t, 6, 8, 10, 12);
    ctx.save();
    if (turn > 0.003) {
      const [cx, cy] = T.centre;
      ctx.translate(cx, cy);
      ctx.rotate(((2 * Math.PI) / 3) * seg(t, 6, 10) * (t < 10 ? 1 : 1) - (t >= 10 ? ((2 * Math.PI) / 3) * seg(t, 10, 12) : 0));
      ctx.translate(-cx, -cy);
    }
    drawTriangle(ctx, T, { alpha: on, labels: ['1', '2', '3'] });
    drawSimplexPath(ctx, T, GEO, { colour: METRIC, alpha: on * seg(t, 1.5, 2.5), width: 2.2 });
    drawSimplexPoint(ctx, T, P, { colour: P_COL, alpha: on, r: 7, label: 'p', labelOffset: [-24, -8] });
    drawSimplexPoint(ctx, T, Q, { colour: Q_COL, alpha: on, r: 7, label: 'q', labelOffset: [12, -8] });
    ctx.restore();
    text(ctx, 'relabelling the faces: a symmetry of the triangle, the distance is unchanged', T.x, T.y - 16, { ...type.note, color: color.body, alpha: fade(t, 6, 7, 12, 13) });

    // merging 2 and 3: project along lines of constant p₁ onto the base edge
    const mergeOn = seg(t, 13, 14);
    if (mergeOn > 0.003) {
      for (const [p, tint] of [[P, P_COL], [Q, Q_COL]]) {
        const from = T.point(p);
        const to = T.point(onBase(p[0]));
        const prog = seg(t, 13.5, 16);
        arrow(ctx, from[0], from[1], from[0] + (to[0] - from[0]) * prog, from[1] + (to[1] - from[1]) * prog, { color: tint, width: 1.8, head: 9, dash: [5, 5], alpha: mergeOn });
      }
      const landed = seg(t, 16, 17);
      // the coin family is the base edge; the coins and their arc
      drawSimplexPoint(ctx, T, onBase(PM[0]), { colour: P_COL, alpha: landed, r: 6 });
      drawSimplexPoint(ctx, T, onBase(QM[0]), { colour: Q_COL, alpha: landed, r: 6 });
      const a = T.point(onBase(PM[0]));
      const b = T.point(onBase(QM[0]));
      line(ctx, a[0], a[1] + 14, b[0], b[1] + 14, { color: METRIC, width: 3, alpha: landed });
      text(ctx, `two coins: p₁ = ${fmt(PM[0])} and ${fmt(QM[0])}`, (a[0] + b[0]) / 2 + 60, a[1] - 26, { font: font.mono, size: 14, color: color.body, align: 'center', alpha: landed });
      text(ctx, 'lines of constant p₁ run parallel to the edge 2–3; merging slides each die along one', T.x, T.y + T.height + 76, { font: font.mono, size: 13, color: color.muted, alpha: mergeOn * fade(t, 14, 15, 32, 33) });
    }

    // the split: four-sided dice, as bars
    const splitOn = seg(t, 33.5, 34.5);
    if (splitOn > 0.003) {
      drawOutcomeBars(ctx, { x: T.x + 20, y: T.y + T.height + 66, w: 200, h: 72, values: PS, labels: ['1', '2', '3a', '3b'], colours: P_COL, alpha: splitOn, max: 0.6, title: 'p, with face 3 split ⅓ : ⅔' });
      drawOutcomeBars(ctx, { x: T.x + 300, y: T.y + T.height + 66, w: 200, h: 72, values: QS, labels: ['1', '2', '3a', '3b'], colours: Q_COL, alpha: splitOn, max: 0.6, title: 'q, with face 3 split ⅓ : ⅔' });
    }

    drawNotes(ctx, t);
    exampleStamp(ctx, seg(t, 2, 3), `p = (${P.join(', ')}) · q = (${Q.join(', ')}) · everything on screen is computed`);
  },
});

function drawNotes(ctx, t) {
  readout(ctx, 'd_FR(p, q) =', D0, R, 230, { colour: METRIC, alpha: seg(t, 2, 3), digits: 2, size: 20 });
  text(ctx, 'relabel the faces: unchanged', R + 260, 230, { font: font.mono, size: 15, color: color.body, alpha: fade(t, 7, 8, 32, 33) });
  const m = seg(t, 17, 18);
  pill(ctx, 'MERGE OUTCOMES 2 AND 3', R, 290, METRIC, m);
  readout(ctx, 'd_FR(coins) =', D_MERGED, R, 334, { colour: METRIC, alpha: seg(t, 18, 19), digits: 2, size: 20 });
  text(ctx, `the distance shrank from ${fmt(D0)} to ${fmt(D_MERGED)}`, R + 260, 334, { font: font.mono, size: 15, color: color.body, alpha: seg(t, 19, 20) });
  MONO.draw(ctx, R, 384, { size: 21, alpha: seg(t, 24, 25) });
  text(ctx, 'monotone under every statistic, equal exactly for sufficient ones (Ay, Jost, Lê & Schwachhöfer 2015)', R, 418, { ...type.note, size: 12, alpha: seg(t, 27, 28) });
  const s = seg(t, 34, 35);
  pill(ctx, 'SPLIT OUTCOME 3 IN FIXED PROPORTIONS', R, 470, METRIC, s);
  readout(ctx, 'd_FR(four-sided dice) =', D_SPLIT, R, 514, { colour: METRIC, alpha: seg(t, 36, 37), digits: 2, size: 20 });
  text(ctx, 'a Markov embedding: a new face, no new information, the same distance', R, 546, { ...type.note, alpha: seg(t, 38, 39) });
  const c = seg(t, 41, 42);
  pill(ctx, 'CHENTSOV 1972', R, 600, P_COL, c);
  CHENTSOV.draw(ctx, R, 646, { size: 21, alpha: c });
  text(ctx, 'for metrics on all simplices Δₙ at once, n ≥ 2 (Chentsov 1972; exact statement: Fujiwara 2022)', R, 680, { ...type.note, size: 12, alpha: seg(t, 44, 45) });
  const ext = seg(t, 52.5, 53.5);
  text(ctx, 'EXTENSIONS', R, 730, { ...type.eyebrow, size: 13, alpha: ext });
  const refs = [
    'Campbell 1986 · the positive cone (unnormalised measures)',
    'Ay, Jost, Lê & Schwachhöfer 2015 · parametrised models on arbitrary sample spaces',
    'Bauer, Bruveris & Michor 2016 · smooth densities on a manifold of dimension ≥ 2',
    'and the α-connections are the only invariant connections (scene 12)',
  ];
  refs.forEach((r, k) => text(ctx, r, R, 758 + 24 * k, { font: font.mono, size: 13, color: color.muted, alpha: ext * seg(t, 53 + 0.6 * k, 54 + 0.6 * k) }));
  wrap(ctx, 'Not a convention: forced by invariance.', R, 870, 660, 28, { ...type.body, size: 22, color: METRIC, alpha: seg(t, 60, 61) });
}
