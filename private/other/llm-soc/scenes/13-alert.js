import { defineScene, seg, lin, text, wrap, type, color, font, C, panel, connector, codeBlock, chip, ALERT_JSON } from '../shared.js';

const BOX = { x: 80, y: 175, w: 690 };
const CALLOUTS = [
  { lines: [1, 1], at: 2, tag: 'WHEN', body: '12 Nov, 14:03:27 local time', color: color.ink },
  { lines: [3, 6], at: 5.5, tag: 'WHO → WHOM', body: '10.10.0.66 → 10.10.0.21, port 22: SSH, the remote-login service', color: C.alert },
  { lines: [9, 10], at: 11, tag: 'WHAT MATCHED', body: 'rule 2001219 of the public Emerging Threats rule set', color: C.out },
  { lines: [11, 12], at: 14.5, tag: 'CATEGORY, SEVERITY', body: 'set by the rule’s author; 1 is the most severe', color: C.attack },
];
const MISSING = ['Did the attacker get in?', 'What happened before and after?', 'What is 10.10.0.21?', 'Which ATT&CK technique?'];

export default defineScene({
  name: 'Anatomy of an alert',
  duration: 33,
  header: { eyebrow: 'PART 3 · THE PROJECT', title: 'One alert, as Suricata writes it' },
  narration: [
    [0, 'Here is the alert that runs through the rest of this video, in Suricata’s JSON format. It says when it happened, which machine talked to which, and on which port: 22, which is SSH, remote login.'],
    [11, 'It also names the rule that matched, ET SCAN Potential SSH Scan from a public rule set, with a category and a severity.'],
    [18.5, 'What it does not say is just as important. Did the attacker get in? What else happened before and after? What is this machine? And which ATT&CK technique is this? The rule name says scan. Is it really just a scan?'],
  ],

  draw(ctx, t) {
    const active = CALLOUTS.filter((c) => t >= c.at).at(-1);
    const code = codeBlock(ctx, ALERT_JSON, {
      ...BOX,
      lang: 'json',
      size: 17,
      title: 'eve.json · event_type: alert',
      accent: C.alert,
      alpha: seg(t, 0.2, 0.8),
      chars: Math.floor(lin(t, 0.4, 2) * ALERT_JSON.length),
      active: active && t < 18 ? { from: active.lines[0], to: active.lines[1] } : null,
      activeColor: active?.color ?? C.out,
      focus: seg(t, 2, 2.4) * (1 - seg(t, 17.5, 18)),
    });

    CALLOUTS.forEach((c, i) => {
      const al = seg(t, c.at, c.at + 0.6);
      const y = 210 + i * 108;
      const ly = (code.lineY(c.lines[0]) + code.lineY(c.lines[1])) / 2;
      connector(ctx, [[BOX.x + BOX.w + 4, ly], [BOX.x + BOX.w + 40, ly], [BOX.x + BOX.w + 40, y + 40], [850, y + 40]], { color: c.color, alpha: al * 0.8, progress: seg(t, c.at, c.at + 0.6), head: false, width: 1.5 });
      panel(ctx, { x: 850, y, w: 670, h: 86, accent: c.color, alpha: al });
      text(ctx, c.tag, 874, y + 30, { font: font.mono, size: 13, weight: 500, color: c.color, tracking: 1.6, alpha: al });
      text(ctx, c.body, 874, y + 62, { font: font.sans, size: 20, color: color.ink, alpha: al });
    });

    // what is missing
    const m = seg(t, 18.5, 19.3);
    panel(ctx, { x: 80, y: 650, w: 1440, h: 200, accent: color.muted, title: 'NOT IN THE ALERT', alpha: m, dash: [6, 6] });
    let qx = 110;
    MISSING.forEach((q, i) => {
      const al = seg(t, 19.5 + i * 1.6, 20.1 + i * 1.6);
      qx += chip(ctx, q, qx, 720, { color: color.body, size: 16, alpha: al }) + 20;
    });
    wrap(ctx, 'The rule says “scan”. Is it really just a scan?', 110, 795, 1000, 34, { ...type.title, size: 30, italic: true, color: C.out, alpha: seg(t, 27, 28) });
  },
});
