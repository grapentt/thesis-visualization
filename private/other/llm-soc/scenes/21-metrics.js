import { defineScene, seg, fade, text, wrap, color, font, rgba, C, panel, icon, node, line, chip } from '../shared.js';

const ROWS = [
  ['T1110.001', 'T1110.001'],
  ['T1110.001', 'T1110.001'],
  ['T1046', 'T1046'],
  ['T1046', 'T1110.001'],
  ['none', 'none'],
  ['T1110.001', 'T1110.001'],
  ['T1059.004', 'T1059.004'],
  ['none', 'T1046'],
  ['T1046', 'T1046'],
  ['T1110.001', 'T1110.001'],
];
const FOCUS = 'T1110.001';
const CLAIMS = [
  ['214 short SSH sessions from 10.10.0.66', true],
  ['client was libssh2', true],
  ['web-01 accepts SSH passwords', true],
  ['the attacker used a leaked password list', false],
  ['a 662 s session followed', true],
  ['web-01 connected back to port 4444', true],
];

export default defineScene({
  name: 'Measuring',
  duration: 44,
  header: { eyebrow: 'PART 3 · STEP 6 · EVALUATE', title: 'Two things to measure' },
  narration: [
    [0, 'Two things are measured. First: did the model choose the right technique? Compare its choice with the label on every alert. Accuracy is the share it got right.'],
    [10, 'Per technique, precision asks: when the model says brute force, how often is it really brute force? Recall asks: of all real brute-force alerts, how many did it find? F1 combines the two into one number.'],
    [22, 'Second: is the explanation faithful? Split it into single claims and check each one against the retrieved context. A second LLM can act as a judge for every claim, and the share of unsupported claims is the hallucination rate.'],
    [34.5, 'Because the judge can be wrong too, people check a random sample by hand, with a fixed rubric. The numbers here are only an example.'],
  ],

  draw(ctx, t) {
    // 1 · technique classification
    const a = seg(t, 0.3, 1);
    text(ctx, '1 · RIGHT TECHNIQUE?', 80, 196, { font: font.mono, size: 16, weight: 500, color: C.attack, tracking: 2, alpha: a });
    const cols = [110, 210, 400];
    ['#', 'true label', 'model says'].forEach((h, i) => text(ctx, h, cols[i], 236, { font: font.mono, size: 13, color: color.dim, alpha: a }));
    line(ctx, 90, 248, 700, 248, { alpha: a });
    const pr = fade(t, 10.5, 11.2, 44, 45);
    ROWS.forEach(([truth, pred], i) => {
      const al = seg(t, 1 + i * 0.35, 1.4 + i * 0.35);
      const y = 276 + i * 34;
      const ok = truth === pred;
      // precision: the rows where the model said FOCUS; recall: where the truth is FOCUS
      const said = pred === FOCUS;
      const is = truth === FOCUS;
      if (pr > 0.01 && (said || is)) {
        ctx.save();
        ctx.globalAlpha *= pr;
        ctx.fillStyle = rgba(said && is ? C.fleet : C.alert, 0.12);
        ctx.fillRect(92, y - 22, 606, 30);
        ctx.restore();
      }
      text(ctx, String(i + 1), cols[0], y, { font: font.mono, size: 15, color: color.muted, alpha: al });
      text(ctx, truth, cols[1], y, { font: font.mono, size: 15, color: color.body, alpha: al });
      text(ctx, pred, cols[2], y, { font: font.mono, size: 15, color: ok ? color.body : C.alert, alpha: al });
      icon(ctx, ok ? 'check' : 'cross', 640, y - 5, 20, ok ? C.fleet : C.alert, seg(t, 4.5 + i * 0.25, 4.9 + i * 0.25));
    });
    text(ctx, 'accuracy = 8 / 10 = 0.80', 90, 650, { font: font.mono, size: 20, color: color.ink, alpha: seg(t, 7.5, 8.3) });
    const p = seg(t, 12, 12.8);
    text(ctx, `for ${FOCUS}:`, 90, 700, { font: font.mono, size: 15, color: C.attack, alpha: p });
    text(ctx, 'precision = 4 correct / 5 said  = 0.80', 90, 734, { font: font.mono, size: 17, color: color.body, alpha: p });
    const r = seg(t, 15, 15.8);
    text(ctx, 'recall    = 4 found / 4 real    = 1.00', 90, 766, { font: font.mono, size: 17, color: color.body, alpha: r });
    const f = seg(t, 18.5, 19.3);
    text(ctx, 'F1 = 2 · P · R / (P + R)        = 0.89', 90, 798, { font: font.mono, size: 17, color: C.out, alpha: f });

    // 2 · faithfulness
    const b = seg(t, 22, 22.8);
    const X = 820;
    text(ctx, '2 · FAITHFUL EXPLANATION?', X, 196, { font: font.mono, size: 16, weight: 500, color: C.fleet, tracking: 2, alpha: b });
    panel(ctx, { x: X, y: 220, w: 470, h: 300, accent: C.out, title: 'CLAIMS IN ONE ANSWER', alpha: b });
    CLAIMS.forEach(([claim, ok], i) => {
      const y = 276 + i * 38;
      text(ctx, claim, X + 22, y, { font: font.sans, size: 17, color: color.body, alpha: seg(t, 23 + i * 0.4, 23.4 + i * 0.4) });
      const v = seg(t, 27 + i * 0.6, 27.4 + i * 0.6);
      icon(ctx, ok ? 'check' : 'cross', X + 440, y - 6, 20, ok ? C.fleet : C.alert, v);
    });
    node(ctx, { x: 1420, y: 370, w: 190, h: 120, title: 'judge LLM', sub: 'claim in context?', accent: C.llm, alpha: seg(t, 25.5, 26.3), titleSize: 19 });
    line(ctx, X + 470, 370, 1325, 370, { color: C.llm, alpha: seg(t, 26, 26.6), dash: [4, 5] });
    const h = seg(t, 31, 31.8);
    text(ctx, 'hallucination rate = 1 / 6 ≈ 17 %', X, 570, { font: font.mono, size: 20, color: color.ink, alpha: h });
    chip(ctx, 'no evidence for the password list', X, 606, { color: C.alert, size: 13, alpha: h });

    // human spot check
    const s = seg(t, 34.5, 35.3);
    panel(ctx, { x: X, y: 650, w: 700, h: 190, accent: C.human, title: 'HUMAN SPOT CHECK', alpha: s });
    icon(ctx, 'person', X + 60, 760, 60, C.human, s);
    wrap(ctx, 'a random sample of answers, scored by people with a fixed rubric:', X + 120, 718, 560, 24, { font: font.sans, size: 18, color: color.body, alpha: s });
    ['right technique?', 'claims supported?', 'steps useful?'].forEach((q, i) => chip(ctx, q, X + 120 + i * 185, 790, { color: C.human, size: 13.5, alpha: seg(t, 35.5 + i * 0.5, 36 + i * 0.5) }));
    text(ctx, 'example numbers', 1520, 196, { font: font.mono, size: 13, color: color.dim, align: 'right', alpha: a });
  },
});
