import { defineScene, seg, fade, lin, text, wrap, color, font, rgba, C, panel, connector, codeBlock, icon, OUTPUT_JSON, LOG_LINES, HOST_LINES } from '../shared.js';

const BOX = { x: 80, y: 175, w: 760 };
const EVIDENCE = [
  ...LOG_LINES.filter((l) => ['L1', 'L2', 'L3', 'L5', 'L6'].includes(l.id)).map((l) => ({ id: l.id, text: l.text, color: C.loki })),
  { id: 'H3', text: HOST_LINES[2].text, color: C.fleet },
];
// claim line in the JSON → evidence ids
const CLAIMS = [
  [4, ['L1', 'L3']],
  [5, ['L2']],
  [6, ['H3']],
  [7, ['L5']],
  [8, ['L6']],
];
const EV = { x: 900, y: 175, w: 620 };
const evY = (i) => EV.y + 70 + i * 66;

export default defineScene({
  name: 'Step 5 · The explanation',
  duration: 37,
  header: { eyebrow: 'PART 3 · STEP 5 · EXPLAIN', title: 'An answer an analyst can check' },
  narration: [
    [0, 'Step five: the answer. Because we asked for a schema, it arrives as JSON: the technique, a short account of what likely happened, whether a reaction is needed, how severe it is, and concrete next steps.'],
    [12, 'Every statement carries the labels of the evidence behind it. The burst of connections, the attack library, the failing password policy, the long session, and the connection back to port 4444: each one traces back to a retrieved line.'],
    [25, 'So the verdict changes from “probably a scan” to “probably a successful break-in: isolate the server now”. And because each claim is cited, an analyst can verify it in seconds instead of redoing the whole search.'],
  ],

  draw(ctx, t) {
    const claimAt = (i) => 12.6 + i * 2.2;
    const current = CLAIMS.findIndex((_, i) => t >= claimAt(i) && t < claimAt(i) + 2.2);
    const code = codeBlock(ctx, OUTPUT_JSON, {
      ...BOX,
      lang: 'json',
      size: 15,
      title: 'THE MODEL’S ANSWER',
      accent: C.out,
      alpha: seg(t, 0.3, 0.9),
      chars: Math.floor(lin(t, 0.6, 7) * OUTPUT_JSON.length),
      active: current >= 0 ? CLAIMS[current][0] : t > 7.5 && t < 11.8 ? [1, 10, 11] : null,
      focus: current >= 0 ? 1 : fade(t, 7.5, 8, 11.3, 11.8),
    });

    // the evidence
    const ev = seg(t, 11.6, 12.3);
    panel(ctx, { x: EV.x, y: EV.y, w: EV.w, h: 470, accent: C.loki, title: 'RETRIEVED EVIDENCE', alpha: ev });
    const cited = new Set();
    CLAIMS.forEach(([, ids], i) => {
      if (t >= claimAt(i) + 0.4) ids.forEach((id) => cited.add(id));
    });
    EVIDENCE.forEach((e, i) => {
      const y = evY(i);
      const on = cited.has(e.id);
      if (on) {
        ctx.save();
        ctx.globalAlpha *= ev;
        ctx.fillStyle = rgba(e.color, 0.1);
        ctx.fillRect(EV.x + 8, y - 26, EV.w - 16, 52);
        ctx.restore();
      }
      text(ctx, `[${e.id}]`, EV.x + 22, y - 2, { font: font.mono, size: 15, weight: 600, color: e.color, alpha: ev });
      wrap(ctx, e.text, EV.x + 76, y - 2, EV.w - 130, 20, { font: font.mono, size: 13.5, color: on ? color.ink : color.muted, alpha: ev });
      icon(ctx, 'check', EV.x + EV.w - 32, y - 6, 20, C.fleet, ev * (on ? 1 : 0));
    });
    // claims point at their evidence
    CLAIMS.forEach(([lineIndex, ids], i) => {
      const at = claimAt(i);
      for (const id of ids) {
        const k = EVIDENCE.findIndex((e) => e.id === id);
        connector(ctx, [[BOX.x + BOX.w + 2, code.lineY(lineIndex)], [EV.x - 6, evY(k) - 6]], { color: EVIDENCE[k].color, width: 1.5, alpha: seg(t, at, at + 0.5) * 0.85, progress: seg(t, at, at + 0.6) });
      }
    });

    // the verdict, before and after
    const v = seg(t, 25, 25.8);
    panel(ctx, { x: 80, y: 720, w: 640, h: 120, accent: color.muted, alpha: v });
    text(ctx, 'ALERT ALONE', 106, 756, { font: font.mono, size: 13, weight: 500, color: color.muted, tracking: 1.6, alpha: v });
    text(ctx, '“SSH scan”, severity 2: probably ignored', 106, 798, { font: font.sans, size: 21, color: color.body, alpha: v });
    connector(ctx, [[730, 780], [870, 780]], { color: C.out, width: 3, alpha: seg(t, 26, 26.6), progress: seg(t, 26, 26.8) });
    const w = seg(t, 26.6, 27.4);
    panel(ctx, { x: 880, y: 720, w: 640, h: 120, accent: C.alert, alpha: w, glow: 0.6 });
    text(ctx, 'WITH CONTEXT', 906, 756, { font: font.mono, size: 13, weight: 500, color: C.alert, tracking: 1.6, alpha: w });
    text(ctx, 'likely break-in: isolate web-01 now', 906, 798, { font: font.sans, size: 21, weight: 500, color: color.ink, alpha: w });
  },
});
