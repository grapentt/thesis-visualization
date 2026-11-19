// E2.9 ★ The promise: erase everything together (programme.md §4, E2). The nine rulers of E2.3 at
// γ = 1 stand in one column at t½(1) = 0.259 and fade in unison as the playhead moves (moon fill =
// readability r(t) = α²/(α² + σ²) for every mode at once); the four effects E1–E4 of the thermal
// metric (note 20 §4), each tagged with the modelling choice that owns it; "only the forward noise
// can do E4"; the honest limits (note 20 §4.7) and a "?" pin on E4 that Episode 5 answers.
import {
  defineScene, text, wrap, line, arrow, roundRect, rgba, font, type, seg, fade, lerp, P, ev,
  railX, RAIL, drawFog, drawRailAxis, drawPlayhead, glyph, rampColour, badge, rigStamp, tHalf, readability,
  T_MIN_INTERNAL, formatT, header, track,
} from '../shared.js';

const WIDTHS = ev('aldp5.widths').value;
const UNIT = ev('aldp5.pilotUnit').value;
const FLAT = WIDTHS.map((w) => tHalf((w / UNIT) ** 2));
const HALF = tHalf(1);

const AXIS_Y = 214;
const ROW0 = 262;
const ROW_H = 30;
const rowY = (k) => ROW0 + k * ROW_H;
const COLUMN_X = railX(HALF);
const colourOf = (k) => rampColour((0.5 * k) / 8);

const EFFECTS = [
  { id: 'E1', name: 'outputs on one scale', owner: 'target representation', detail: 'every mode’s score is O(1) in thermal units' },
  { id: 'E2', name: 'a balanced loss', owner: 'loss norm', detail: 'equal relative errors cost the same in every mode' },
  { id: 'E3', name: 'a conditioned target', owner: 'target representation', detail: 'the target’s Lipschitz constant no longer grows with stiffness' },
  { id: 'E4', name: 'synchronized erasure', owner: 'forward noise', detail: 'every mode loses information at the same rate' },
];

/** The playhead's level: a sweep through the noise, parked at the promise. */
const playhead = (t) => Math.exp(track(t, [[4, Math.log(2e-4)], [15, Math.log(0.6)], [17.5, Math.log(HALF)]]));

export default defineScene({
  name: 'The promise',
  duration: 45,
  header: header(2, 9, 'THE PROMISE', 'Shaped by the metric, the noise erases every mode together'),
  narration: [
    [0, 'Shaped by the metric, the same nine rulers stand in one column.'],
    [5, `Move through the noise: all nine fade in unison, and at ${HALF.toFixed(3)} every mode is half erased at once.`],
    [17, 'The stiffness metric promised four effects, each owned by one modelling choice.'],
    [23, 'E1, outputs on one scale, and E3, a well-conditioned target, belong to the target representation. E2, a balanced loss, belongs to the loss norm.'],
    [32, 'E4, synchronized erasure, belongs to the forward noise alone: no target or loss changes what the noisy state still knows.'],
    [39, 'It says nothing about torsions, rare basins or long-range correlations. The promise: erase everything together.'],
  ],
  beats: [[0, 'One column'], [17, 'Four effects'], [39, 'The promise']],

  draw(ctx, t) {
    const a = seg(t, 0.4, 1.4);
    drawFog(ctx, ROW0 - 24, rowY(8) + 20, { alpha: a });
    drawRailAxis(ctx, AXIS_Y, { alpha: a });
    const tp = playhead(t);
    const fillOf = readability(tp, 1);

    for (let k = 0; k < 9; k++) {
      const y = rowY(k);
      const ra = seg(t, 0.6 + 0.12 * k, 1.4 + 0.12 * k);
      const col = colourOf(k);
      // the flat position, as a ghost, and the move to the column
      const xf = railX(FLAT[k]);
      glyph(ctx, 'mode', xf, y, { r: 8, alpha: ra * 0.3, estimator: 'exact', colour: P.muted, fill: 0 });
      line(ctx, xf + 10, y, COLUMN_X - 12, y, { color: P.dim, width: 1, dash: [2, 5], alpha: ra * 0.6 });
      glyph(ctx, 'mode', COLUMN_X, y, { r: 11, alpha: ra, estimator: 'exact', colour: col, fill: seg(t, 4, 5) ? fillOf : 1 });
    }
    text(ctx, 'flat (E2.3), as ghosts', railX(FLAT[0]) - 16, rowY(0) + 4, { font: font.mono, size: 12, color: P.muted, align: 'right', alpha: seg(t, 1.5, 2.5) });
    drawPlayhead(ctx, tp, ROW0 - 16, rowY(8) + 16, { alpha: seg(t, 3.5, 4.5), labelY: rowY(8) + 36 });
    text(ctx, `readability of every mode ${fillOf.toFixed(2)}`, COLUMN_X + 26, rowY(8) + 6, { font: font.mono, size: 13, color: P.info, alpha: seg(t, 5, 6) * (1 - seg(t, 38, 39)) });

    // the climax caption
    const climax = seg(t, 39.5, 41.5);
    text(ctx, 'the promise', COLUMN_X + 30, rowY(3) + 4, { ...type.title, size: 40, italic: true, weight: 400, alpha: climax });
    text(ctx, 'nine real rulers, one window, t½ = 0.259', COLUMN_X + 32, rowY(3) + 34, { font: font.mono, size: 13, color: P.muted, alpha: climax });

    // the four effects
    const cardW = 318;
    const gap = 22;
    const cy = 568;
    for (let i = 0; i < 4; i++) {
      const e = EFFECTS[i];
      const ca = seg(t, 17.5 + 2.2 * i, 18.7 + 2.2 * i);
      if (ca <= 0.003) continue;
      const x = RAIL.x0 + i * (cardW + gap);
      const isE4 = i === 3;
      const hl = isE4 ? seg(t, 32, 33.5) : 0;
      ctx.save();
      ctx.globalAlpha *= ca;
      roundRect(ctx, x, cy, cardW, 168, 12);
      ctx.fillStyle = 'rgba(20,28,46,0.92)';
      ctx.fill();
      ctx.strokeStyle = isE4 ? rgba(P.ink, 0.35 + 0.4 * hl) : P.line;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      text(ctx, e.id, x + 20, cy + 40, { font: font.mono, size: 22, weight: 600, color: P.ink, alpha: ca });
      text(ctx, e.name, x + 70, cy + 40, { ...type.display, size: 24, alpha: ca });
      wrap(ctx, e.detail, x + 20, cy + 78, cardW - 40, 24, { ...type.body, size: 17, alpha: ca });
      text(ctx, `owned by: ${e.owner}`, x + 20, cy + 148, { font: font.mono, size: 13, color: isE4 ? P.ink : P.muted, alpha: ca });
      if (isE4) {
        // the "?" pin: Episode 5 tests this effect on a molecule where order can matter
        const pin = seg(t, 37, 38);
        ctx.save();
        ctx.globalAlpha *= pin;
        ctx.beginPath();
        ctx.arc(x + cardW - 4, cy - 4, 15, 0, 2 * Math.PI);
        ctx.fillStyle = P.bg;
        ctx.fill();
        ctx.strokeStyle = P.ink;
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        text(ctx, '?', x + cardW - 4, cy + 3, { font: font.display, size: 22, color: P.ink, align: 'center', alpha: pin });
      }
    }
    const onlyA = seg(t, 33, 34.5);
    text(ctx, 'only the forward noise can do E4: no target or loss changes the information in the noisy state', RAIL.x0, cy + 200, { font: font.mono, size: 14, color: P.body, alpha: onlyA });
    const bw = badge(ctx, 'D', RAIL.x0, cy + 232, { alpha: onlyA });
    text(ctx, 'note 20 §4.6 (one-basin model; E3 holds for a frozen metric only)', RAIL.x0 + bw + 10, cy + 236, { font: font.mono, size: 12, color: P.muted, alpha: onlyA });
    const limA = seg(t, 39, 40);
    text(ctx, 'limits: says nothing about torsions, rare basins or long-range correlations (note 20 §4.7)', RAIL.x1, cy + 236, { font: font.mono, size: 12, color: P.wall, align: 'right', alpha: limA });
    rigStamp(ctx, `exact · 9 Gaussian modes at λ = 1 · floor ${formatT(T_MIN_INTERNAL)}`, a);
  },
});
