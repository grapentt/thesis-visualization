import { defineScene, seg, lin, lerp, text, type, color, font, C, panel, node, connector, packet, codeBlock, icon, line, chip } from '../shared.js';

const CODE = `for alert in fetch_new_alerts():                    # e.g. every alert of the last hour
    summary = ask_llm(SYSTEM, format_alert(alert))
    save(alert["id"], summary)                      # database, ticket, dashboard`;

const ROWS = [
  ['ET SCAN Nmap Scripting Engine', 'port scan from 10.10.0.66', 'low', color.muted],
  ['ET POLICY curl User-Agent', 'routine update check', 'low', color.muted],
  ['ET SCAN Potential SSH Scan', 'many SSH logins on web-01', 'high', C.alert],
  ['ET WEB_SERVER SQL Injection', 'SQL probe on /login, 404', 'medium', C.out],
  ['ET DNS Query to .top domain', 'lookup of a rare domain', 'medium', C.out],
  ['ET INFO Python-urllib UA', 'internal script, known', 'low', color.muted],
];
const START = 8.2; // the first alert enters the loop
const EVERY = 1.35;
const LANE = { x: 70, y: 505, w: 660, h: 330 };
const MODEL = { x: 560, y: 670 };
const TABLE = { x: 790, y: 335, w: 520 };
const SINKS = [
  ['ticket', 'doc', 430],
  ['dashboard', 'grid', 590],
  ['next LLM call', 'chip', 750],
];

export default defineScene({
  name: 'From one question to a workflow',
  duration: 29,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'Put the call in a loop' },
  narration: [
    [0, 'Why does this matter? In a chat, a person asks one question, reads the answer and copies it somewhere else. That does not scale.'],
    [7.5, 'In a script, the same call sits inside a loop. Every new alert is formatted the same way, sent to the model, and the answer is stored next to the alert, thousands of times a night, without anyone copying and pasting.'],
    [18, 'And the result can feed the next step automatically: a ticket, a dashboard, another model call. This is what it means to embed an LLM in a workflow. It becomes one step of a pipeline.'],
  ],

  draw(ctx, t) {
    const looping = t > START - 0.4 && t < 18;
    codeBlock(ctx, CODE, { x: 70, y: 168, w: 1450, size: 17, accent: C.out, alpha: seg(t, 0.3, 1), active: looping ? (Math.floor((t - START) / (EVERY / 3)) % 3 + 3) % 3 : null, focus: seg(t, START - 0.4, START) });

    // by hand
    const hand = seg(t, 0.8, 1.6);
    panel(ctx, { x: 70, y: 335, w: 660, h: 140, accent: C.human, title: 'BY HAND, IN A CHAT', alpha: hand });
    icon(ctx, 'person', 130, 420, 48, C.human, hand);
    const handPath = [[180, 420], [520, 420]];
    connector(ctx, handPath, { color: color.dim, dash: [5, 6], alpha: hand });
    icon(ctx, 'mail', 560, 420, 38, C.llm, hand);
    packet(ctx, handPath, (Math.max(0, t - 1.5) / 6) % 1, { color: C.alert, alpha: hand, label: 'copy, paste' });
    text(ctx, '≈ 10 alerts / hour', 712, 455, { font: font.mono, size: 15, color: color.muted, align: 'right', alpha: hand });

    // in a script
    const lane = seg(t, 7.2, 8);
    panel(ctx, { ...LANE, accent: C.out, title: 'IN A SCRIPT', alpha: lane });
    for (let k = 0; k < 7; k++) {
      // a stack of waiting alerts
      panel(ctx, { x: 110 + k * 3, y: 620 - k * 6, w: 120, h: 70, accent: C.alert, alpha: lane, fill: 'rgba(30,22,34,0.97)' });
    }
    icon(ctx, 'bell', 173, 618 - 18, 30, C.alert, lane);
    text(ctx, 'new alerts', 170, 740, { font: font.mono, size: 14, color: color.muted, align: 'center', alpha: lane });
    node(ctx, { x: MODEL.x, y: MODEL.y, w: 200, h: 92, title: 'ask_llm', icon: 'chip', accent: C.llm, alpha: lane, glow: looping ? 0.6 : 0.1 });
    const feed = [[250, MODEL.y], [MODEL.x - 100, MODEL.y]];
    connector(ctx, feed, { color: color.dim, alpha: lane });
    const processed = Math.floor(lerp(0, 2840, lin(t, START, 28)));
    text(ctx, `processed: ${processed.toLocaleString('en')}`, LANE.x + LANE.w - 24, LANE.y + 30, { font: font.mono, size: 16, color: C.out, align: 'right', alpha: lane });

    // the results table
    const table = seg(t, 7.6, 8.4);
    panel(ctx, { x: TABLE.x, y: TABLE.y, w: TABLE.w, h: 500, accent: color.muted, title: 'RESULTS', alpha: table });
    const head = { font: font.mono, size: 13, color: color.dim, alpha: table };
    text(ctx, 'alert', TABLE.x + 20, TABLE.y + 62, head);
    text(ctx, 'severity', TABLE.x + TABLE.w - 20, TABLE.y + 62, { ...head, align: 'right' });
    line(ctx, TABLE.x + 16, TABLE.y + 74, TABLE.x + TABLE.w - 16, TABLE.y + 74, { alpha: table });
    ROWS.forEach(([sig, summary, sev, col], i) => {
      const at = START + i * EVERY;
      // the alert slides into the model, the answer drops into its row
      const into = lin(t, at, at + 0.6);
      packet(ctx, feed, into, { color: C.alert, r: 7 });
      const y = TABLE.y + 110 + i * 64;
      const out = [[MODEL.x + 100, MODEL.y], [TABLE.x - 20, y]];
      packet(ctx, out, lin(t, at + 0.65, at + 1.25), { color: C.out, r: 7 });
      const al = seg(t, at + 1.15, at + 1.5) * table;
      text(ctx, sig, TABLE.x + 20, y - 4, { font: font.mono, size: 14, color: color.body, alpha: al });
      text(ctx, summary, TABLE.x + 20, y + 19, { font: font.sans, size: 16, color: color.muted, alpha: al });
      chip(ctx, sev, TABLE.x + TABLE.w - 20, y + 4, { color: col, size: 13, align: 'right', alpha: al });
    });

    // where the results go next
    SINKS.forEach(([label, kind, y], i) => {
      const al = seg(t, 18.5 + i * 1.2, 19.3 + i * 1.2);
      connector(ctx, [[TABLE.x + TABLE.w + 6, y], [1380, y]], { color: C.out, alpha: al, progress: seg(t, 18.5 + i * 1.2, 19.5 + i * 1.2) });
      icon(ctx, kind, 1420, y, 36, C.out, al);
      text(ctx, label, 1420, y + 46, { font: font.mono, size: 14, color: color.body, align: 'center', alpha: al });
    });
    text(ctx, 'one step of a pipeline', 1420, 840, { ...type.note, color: C.out, align: 'center', alpha: seg(t, 22.5, 23.5) });
  },
});
