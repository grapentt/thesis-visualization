import { defineScene, seg, text, splitLines, type, font, color, dot } from '../../../kit.js';
import { setFont } from '../../../draw/text.js';
import { springData, runs11, fibreProfiles, zPoseGrid } from '../data.js';
import { HORIZONTAL, VERTICAL, POSE, SCORE_W, SCORE_P, INTER, PLUGIN, equationStrip } from '../shared.js';
import { drawMaster, diagramCamera, toA, toB, toF, PROFILE_SITES } from '../diagram.js';

const CUE = { inter: 6.5, bundle: 18 };
const BODY = { ...type.body, size: 18, color: color.muted };
const BODY_X = 140, BODY_W = 720;

// the spring toy's plug-in errors at σ = 0.3, 1, 3, as printed percentages
const percent = (sigma) => `${Math.round(100 * springData.table.find((row) => row.sigma === sigma).error)} %`;
const PLUG_IN = 'not the plug-in force';

const POINTS = [
  [[SCORE_W, SCORE_P], 'Adding the scores gives independence.', 's_W ⊕ s_P samples molecules that ignore each other.'],
  [INTER, 'One exact extra term.', `Wₜ = E_ref[w | zₜ]: the clean weight averaged over the reference’s cloud behind a noisy pair; ${PLUG_IN} (${percent(0.3)}, ${percent(1)}, ${percent(3)} off in the spring toy).`],
  [POSE, 'Shapes below, poses above.', 'Monomer scores: no net force or torque. Docking on the fibres, induced fit on the floor, affinity in total.'],
  [VERTICAL, 'The right symmetries.', 'One φ invariant under rigid motions (SE(3)) and swaps, not mirrors; the noise picks the connection; no root.'],
  [HORIZONTAL, 'Reuse, and its limits.', 'Frozen parts reuse exactly; pair terms compose only at small noise; water showed no data gain; the dipeptide test is under way.'],
];

// scene 18's layers: the reweighted floor and the centre-line peaks
const PEAKS = fibreProfiles.map((s, k) => ({ site: PROFILE_SITES[k], profile: s.profiles.at(-1), alpha: 0.6, band: false }));
// rose and lime at scene 11's starting point X★ (directions only); orange: what binding adds, from where the monomer scores lead
const { a: RUN, push, binding } = runs11;
const AT = { a: toA(RUN.theta[0]), b: toB(RUN.tau[0]), f: toF(RUN.u[0]) };
const RELAXED = { a: toA(RUN.theta.at(-1)), b: toB(RUN.tau.at(-1)), f: toF(RUN.u.at(-1)) };
const ARROW_BOX = 0.3;
const unitScale = ({ dTheta = 0, dTau = 0, du = 0 }) => ARROW_BOX / Math.hypot(dTheta / 25, dTau / 360, du / 2);
/** A gentle swing about the standard view, 0.05 rad/s at its fastest; yaw stays in [−0.7, −0.5], where no axis labels touch. */
const yawAt = (t) => -0.6 + 0.1 * Math.sin(t / 2);

// once every row is in, the row the narration is on stays bright and the others dim; all bright again at the end
const FOCUS = [[1, 9.5, CUE.bundle], [2, CUE.bundle, 27.5]];
const rowAlpha = (k, t) => 1 - 0.45 * Math.min(1, FOCUS.reduce((d, [row, a, b]) =>
  d + (row === k ? 0 : Math.min(seg(t, a, a + 0.8), 1 - seg(t, b, b + 0.8))), 0));

export default defineScene({
  name: 'Summary',
  duration: 31,
  header: { eyebrow: '19 · SUMMARY', title: 'Shapes below, poses above' },
  narration: [
    [0, 'To sum up. Adding the frozen scores gives molecules that ignore each other.'],
    [CUE.inter, 'The exact correction is one interaction term: the weight averaged over the reference’s cloud behind a noisy pair, not the force at the noisy point.'],
    [CUE.bundle, 'On the bundle, shapes lie below and poses above. The frozen parts reshape, and, apart from the known spring, only the learned term binds.'],
  ],

  draw(ctx, t) {
    POINTS.forEach(([tint, head, body], k) => {
      const y = 230 + 112 * k;
      const fade = seg(t, 2 + 1.5 * k, 2.8 + 1.5 * k);
      if (fade <= 0.003) return;
      const a = fade * rowAlpha(k, t);
      rowDot(ctx, 112, y - 8, tint, fade);
      text(ctx, head, BODY_X, y, { ...type.display, size: 27, alpha: a });
      const lines = splitLines(ctx, body, BODY_W, BODY);
      lines.forEach((line, i) => text(ctx, line, BODY_X, y + 34 + 26 * i, { ...BODY, alpha: a }));
      if (body.includes(PLUG_IN)) underline(ctx, lines, body.indexOf(PLUG_IN), PLUG_IN.length, y + 34, a);
    });

    const highlight = t < CUE.inter ? ['W', 'P'] : t < CUE.bundle ? 'int' : null;
    equationStrip(ctx, 960, 230, { size: 24, maxWidth: 560, highlight, alpha: seg(t, 0.5, 1.5) });

    const alpha = seg(t, 0.5, 1.8);
    drawMaster(ctx, {
      camera: diagramCamera({ cx: 1220, cy: 490, scale: 70, yaw: yawAt(t) }),
      alpha,
      floor: { alpha: 1, thumbnails: false, density: zPoseGrid.floor.pair, densityAlpha: 0.6 },
      fibres: { alpha: 0.75 },
      profiles: PEAKS,
      arrows: [
        { ...AT, d: push.W, scale: unitScale(push.W), colour: SCORE_W, alpha: seg(t, 1, 2) },
        { ...AT, d: push.P, scale: unitScale(push.P), colour: SCORE_P, alpha: seg(t, 1.5, 2.5) },
        { ...RELAXED, d: binding, scale: 1, colour: INTER, alpha: seg(t, CUE.inter + 0.5, CUE.inter + 1.5) },
      ],
      cursor: AT,
    });
    legend(ctx, 960, 808, [[seg(t, 1, 2), [['s_W', SCORE_W], [' and ', color.muted], ['s_P', SCORE_P], [': along the floor, they reshape', color.muted]]],
      [seg(t, CUE.inter + 0.5, CUE.inter + 1.5), [['learned', INTER], [': moves the point along its fibre (docking)', color.muted]]]]);

    text(ctx, 'statements and proofs: docs/bundle-generative-models.md §13–15', 80, 862, { font: font.mono, size: 15, color: color.dim, alpha: seg(t, 10, 11) });
  },
});

/** Arrow legend under the diagram: lines of coloured mono segments, each line with its own alpha. */
function legend(ctx, x, y, lines) {
  text(ctx, 'rose, lime: directions only · orange: true length', x, y, { ...type.note, alpha: lines[0][0] });
  lines.forEach(([alpha, parts], i) => {
    let xx = x;
    for (const [str, c] of parts) {
      text(ctx, str, xx, y + 24 * (i + 1), { ...type.note, color: c, alpha });
      setFont(ctx, type.note);
      xx += ctx.measureText(str).width;
    }
  });
}

/** A row's dot; two colours make two half-dots (water | peroxide). */
function rowDot(ctx, x, y, tint, alpha) {
  if (!Array.isArray(tint)) return dot(ctx, x, y, 7, tint, alpha);
  tint.forEach((c, i) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, 7, Math.PI / 2 + i * Math.PI, 1.5 * Math.PI + i * Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

/** Small dashed plug-in underline under the characters [from, from + length) of the wrapped body. */
function underline(ctx, lines, from, length, y0, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  setFont(ctx, BODY);
  ctx.strokeStyle = PLUGIN;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 4]);
  let start = 0;
  lines.forEach((line, i) => {
    const s = Math.max(from, start), e = Math.min(from + length, start + line.length);
    if (e > s) {
      const x0 = BODY_X + ctx.measureText(line.slice(0, s - start)).width;
      const x1 = BODY_X + ctx.measureText(line.slice(0, e - start)).width;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + 26 * i + 5);
      ctx.lineTo(x1, y0 + 26 * i + 5);
      ctx.stroke();
    }
    start += line.length + 1;
  });
  ctx.restore();
}
