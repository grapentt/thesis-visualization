import { defineScene, seg, fade, lin, text, color, font, rgba, C, panel, codeBlock, chip, dot, line, roundRect, LOG_LINES } from '../shared.js';

const AXIS = { x: 120, y: 320, w: 1360 };
const T0 = 13 * 3600 + 57 * 60; // 13:57
const T1 = 14 * 3600 + 10 * 60; // 14:10
const ALERT_T = 14 * 3600 + 3 * 60 + 27;
const WINDOW = 300;
const tx = (s) => AXIS.x + ((s - T0) / (T1 - T0)) * AXIS.w;
const hms = (h, m, s = 0) => h * 3600 + m * 60 + s;

/** Deterministic pseudo-random in [0, 1). */
const rand = (i) => {
  const x = Math.sin(i * 91.7 + 17.3) * 24634.6345;
  return x - Math.floor(x);
};
// background traffic of other hosts, and the attacker's burst
const NOISE = Array.from({ length: 70 }, (_, i) => ({ s: T0 + rand(i) * (T1 - T0), lane: rand(i + 100) }));
const BURST = Array.from({ length: 46 }, (_, i) => hms(14, 0, 51) + i * ((hms(14, 3, 58) - hms(14, 0, 51)) / 45));

const CODE = `def loki_context(alert, window=300):
    t  = to_ns(alert["timestamp"])           # Loki counts nanoseconds
    ip = alert["src_ip"]
    query = '{source="suricata"} |= "' + ip + '"'
    r = requests.get(f"{LOKI}/loki/api/v1/query_range", params={
        "query": query,
        "start": t - window * 10**9,
        "end":   t + window * 10**9,
        "limit": 1000,
    })
    streams = r.json()["data"]["result"]
    return condense(streams)                 # 214 similar flows → 1 line`;

const CODE_FOCUS = [
  [11.5, 15, { from: 1, to: 2 }],
  [15, 19, 3],
  [19, 22, { from: 6, to: 7 }],
  [22, 25.5, { from: 10, to: 11 }],
];
const LOG_FOCUS = [
  [26, 29.5, [0, 1, 2]],
  [29.5, 32.5, [4]],
  [32.5, 36, [5]],
];

export default defineScene({
  name: 'Step 2a · Logs from Loki',
  duration: 39,
  header: { eyebrow: 'PART 3 · STEP 2 · RETRIEVE', title: 'What else happened on the network?' },
  narration: [
    [0, 'Step two, part one: what else was happening on the network? The alert has a timestamp and an attacker address. We ask Loki for every Suricata record that mentions this address, from five minutes before the alert to five minutes after.'],
    [15, 'Loki’s query language, LogQL, selects a log stream and filters it. Here: the Suricata stream, only lines containing 10.10.0.66, in a time window around the alert.'],
    [22, 'The raw answer has hundreds of lines, so the code condenses them: two hundred fourteen near-identical SSH connections become one line.'],
    [26, 'What remains is telling. A burst of short connections from a scripting library. Then one connection that stays open for eleven minutes. Then the server connecting back to the attacker, on port 4444.'],
  ],

  draw(ctx, t) {
    // the timeline
    const a = seg(t, 0.3, 1);
    line(ctx, AXIS.x, AXIS.y, AXIS.x + AXIS.w, AXIS.y, { color: color.muted, width: 1.5, alpha: a });
    for (let m = 57; m <= 70; m++) {
      const s = hms(13, 0) + m * 60;
      const x = tx(s);
      line(ctx, x, AXIS.y, x, AXIS.y + 6, { color: color.muted, alpha: a });
      if (m % 2 === 0) text(ctx, `${Math.floor(m / 60) + 13}:${String(m % 60).padStart(2, '0')}`, x, AXIS.y + 26, { font: font.mono, size: 13, color: color.muted, align: 'center', alpha: a });
    }
    // the query window
    const w = seg(t, 4, 5.5);
    const wx0 = tx(ALERT_T - WINDOW * w);
    const wx1 = tx(ALERT_T + WINDOW * w);
    ctx.save();
    ctx.globalAlpha *= w;
    ctx.fillStyle = rgba(C.loki, 0.08);
    ctx.fillRect(wx0, 186, wx1 - wx0, AXIS.y - 186);
    ctx.restore();
    line(ctx, wx0, 186, wx0, AXIS.y, { color: C.loki, dash: [4, 4], alpha: w });
    line(ctx, wx1, 186, wx1, AXIS.y, { color: C.loki, dash: [4, 4], alpha: w });
    text(ctx, '± 5 minutes', wx0 + 10, 204, { font: font.mono, size: 14, color: C.loki, alpha: seg(t, 5, 6) });

    // events; the filter keeps only the attacker's
    const filter = seg(t, 16, 18);
    for (const n of NOISE) dot(ctx, tx(n.s), AXIS.y - 20 - n.lane * 70, 3, color.muted, a * 0.6 * (1 - 0.85 * filter));
    for (const s of BURST) dot(ctx, tx(s), AXIS.y - 30 - rand(s) * 40, 3.5, C.loki, seg(t, 1, 2));
    // the long session and the call back
    const long = seg(t, 1.5, 2.5);
    ctx.save();
    ctx.globalAlpha *= long;
    ctx.fillStyle = C.loki;
    roundRect(ctx, tx(hms(14, 4, 1)), AXIS.y - 96, AXIS.x + AXIS.w - tx(hms(14, 4, 1)), 8, 4);
    ctx.fill();
    ctx.restore();
    text(ctx, 'L5 · one SSH session, 11 min', tx(hms(14, 4, 1)) + 6, AXIS.y - 70, { font: font.mono, size: 12.5, color: C.loki, alpha: long });
    dot(ctx, tx(hms(14, 5, 12)), AXIS.y - 120, 5, C.alert, long);
    text(ctx, 'L6 · web-01 → attacker :4444', tx(hms(14, 5, 12)) + 12, AXIS.y - 115, { font: font.mono, size: 12.5, color: C.alert, alpha: long });
    text(ctx, 'L1–L3 · 214 short SSH logins', tx(hms(14, 0, 51)), AXIS.y - 96, { font: font.mono, size: 12.5, color: C.loki, alpha: long });
    // the alert
    line(ctx, tx(ALERT_T), AXIS.y - 80, tx(ALERT_T), AXIS.y + 36, { color: C.alert, width: 2.5, alpha: a });
    chip(ctx, 'alert 14:03:27', tx(ALERT_T), AXIS.y + 52, { color: C.alert, size: 13, align: 'center', alpha: a });

    // the code
    const cf = CODE_FOCUS.find(([s, e]) => t >= s && t < e);
    codeBlock(ctx, CODE, {
      x: 80,
      y: 400,
      w: 760,
      size: 15.5,
      title: 'retrieve.py',
      accent: C.loki,
      activeColor: C.loki,
      alpha: seg(t, 9.5, 10.2),
      chars: Math.floor(lin(t, 9.8, 12) * CODE.length),
      active: cf ? cf[2] : null,
      focus: cf ? fade(t, cf[0], cf[0] + 0.3, cf[1] - 0.3, cf[1]) : 0,
    });

    // what comes back
    const raw = fade(t, 22, 22.6, 25, 25.6);
    text(ctx, 'raw: 431 lines', 1180, 450, { font: font.mono, size: 20, color: color.muted, align: 'center', alpha: raw });
    text(ctx, '↓ condense', 1180, 500, { font: font.mono, size: 20, color: C.loki, align: 'center', alpha: raw });
    text(ctx, '6 lines', 1180, 550, { font: font.mono, size: 20, color: C.loki, align: 'center', alpha: raw });

    const lf = LOG_FOCUS.find(([s, e]) => t >= s && t < e);
    const shown = seg(t, 25.4, 26);
    panel(ctx, { x: 880, y: 400, w: 640, h: 262, accent: C.loki, title: 'RETRIEVED, CONDENSED', alpha: shown });
    LOG_LINES.forEach((l, i) => {
      const y = 450 + i * 34;
      const on = lf?.[2].includes(i);
      const focus = lf ? fade(t, lf[0], lf[0] + 0.3, lf[1] - 0.3, lf[1]) : 0;
      if (on) {
        ctx.save();
        ctx.globalAlpha *= shown * focus;
        ctx.fillStyle = rgba(C.loki, 0.14);
        ctx.fillRect(886, y - 15, 628, 30);
        ctx.restore();
      }
      const dim = lf && !on ? 1 - 0.5 * focus : 1;
      text(ctx, `[${l.id}]`, 900, y + 5, { font: font.mono, size: 13.5, color: i === 3 ? C.alert : C.loki, alpha: shown * dim });
      text(ctx, l.time, 945, y + 5, { font: font.mono, size: 13.5, color: color.muted, alpha: shown * dim });
      text(ctx, l.text, 1020, y + 5, { font: font.mono, size: 13.5, color: i === 3 ? C.alert : color.body, alpha: shown * dim });
    });
    const notes = [
      [26.2, 'a burst of short logins by a library: a script, not a person'],
      [29.8, '11 minutes on SSH: someone is working on web-01'],
      [32.8, 'web-01 calls back to the attacker on port 4444'],
    ];
    notes.forEach(([at, s], i) => {
      text(ctx, s, 880, 712 + i * 40, { font: font.sans, size: 20, color: [C.loki, C.out, C.alert][i], alpha: seg(t, at, at + 0.6) });
    });
  },
});
