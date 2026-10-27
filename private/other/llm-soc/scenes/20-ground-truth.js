import { defineScene, seg, text, color, font, rgba, C, panel, chip, line, roundRect, icon, connector } from '../shared.js';

const AXIS = { x: 140, y: 380, w: 1320 };
const tx = (min) => AXIS.x + (min / 60) * AXIS.w; // minutes after 10:00
const RUNS = [
  { from: 5, to: 10, id: 'T1046', what: 'network scan', color: '#d9a35b' },
  { from: 20, to: 27, id: 'T1110.001', what: 'password guessing on web-01', color: C.attack },
  { from: 40, to: 43, id: 'T1059.004', what: 'Unix shell commands', color: '#e07a9a' },
];
const ALERTS = [6, 8, 14, 21, 23, 26, 33, 41, 52];
const runOf = (m) => RUNS.find((r) => m >= r.from && m <= r.to);
const ROWS = [
  ['#1', 'ET SCAN Nmap Scripting Engine', '10:06', 'T1046'],
  ['#4', 'ET SCAN Potential SSH Scan', '10:21', 'T1110.001'],
  ['#6', 'ET SCAN Potential SSH Scan', '10:26', 'T1110.001'],
  ['#7', 'ET POLICY curl User-Agent', '10:33', 'none'],
  ['#8', 'ET ATTACK_RESPONSE shell output', '10:41', 'T1059.004'],
];

export default defineScene({
  name: 'Step 6 · Ground truth',
  duration: 35,
  header: { eyebrow: 'PART 3 · STEP 6 · EVALUATE', title: 'You need alerts whose answer you know' },
  narration: [
    [0, 'Step six: evaluation. To measure whether the model is right, you need alerts whose right answer you already know. That is ground truth, and generating it takes real effort.'],
    [9.5, 'You script attacks with tools like Atomic Red Team or Caldera. Each run executes one known ATT&CK technique, from a known machine, at a known time.'],
    [18, 'Every alert that Suricata raises during a run, between the same machines, gets that run’s technique as its label. Alerts from normal background traffic get the label none. The result is a labelled dataset you can test the pipeline on, again and again.'],
  ],

  draw(ctx, t) {
    // why: a pipeline answer with no reference
    const why = 1 - seg(t, 8.8, 9.6);
    if (why > 0.003) {
      panel(ctx, { x: 440, y: 300, w: 720, h: 200, accent: C.out, alpha: seg(t, 0.4, 1) * why });
      text(ctx, '"technique": "T1110.001"', 800, 380, { font: font.mono, size: 26, color: C.out, align: 'center', alpha: seg(t, 0.6, 1.2) * why });
      text(ctx, 'right or wrong? compared with what?', 800, 450, { font: font.sans, size: 24, color: color.muted, align: 'center', alpha: seg(t, 2.5, 3.3) * why });
    }

    const a = seg(t, 9.5, 10.3);
    // the scripted runs
    text(ctx, 'SCRIPTED ATTACKS  ·  Atomic Red Team or Caldera', AXIS.x, 200, { font: font.mono, size: 15, weight: 500, color: color.muted, tracking: 1.5, alpha: a });
    RUNS.forEach((r, i) => {
      const al = seg(t, 10.5 + i * 1.2, 11.1 + i * 1.2);
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.fillStyle = rgba(r.color, 0.85);
      roundRect(ctx, tx(r.from), 254, tx(r.to) - tx(r.from), 40, 6);
      ctx.fill();
      ctx.fillStyle = rgba(r.color, 0.08);
      ctx.fillRect(tx(r.from), 294, tx(r.to) - tx(r.from), AXIS.y - 294);
      ctx.restore();
      text(ctx, r.id, tx(r.from), 244, { font: font.mono, size: 14, weight: 600, color: r.color, alpha: al });
      text(ctx, r.what, tx(r.from), 320, { font: font.sans, size: 15, color: r.color, alpha: al });
    });
    // the clock
    line(ctx, AXIS.x, AXIS.y, AXIS.x + AXIS.w, AXIS.y, { color: color.muted, width: 1.5, alpha: a });
    for (let m = 0; m <= 60; m += 10) {
      line(ctx, tx(m), AXIS.y, tx(m), AXIS.y + 6, { color: color.muted, alpha: a });
      text(ctx, `10:${String(m).padStart(2, '0')}`.replace('10:60', '11:00'), tx(m), AXIS.y + 26, { font: font.mono, size: 13, color: color.muted, align: 'center', alpha: a });
    }
    // alerts
    const al = seg(t, 15, 15.6);
    text(ctx, 'SURICATA ALERTS', AXIS.x, 450, { font: font.mono, size: 13, color: C.alert, tracking: 1.5, alpha: al });
    ALERTS.forEach((m, i) => {
      const at = 15 + i * 0.25;
      icon(ctx, 'bell', tx(m), 470, 24, C.alert, seg(t, at, at + 0.3));
      const run = runOf(m);
      const lab = seg(t, 19 + i * 0.4, 19.5 + i * 0.4);
      if (run) connector(ctx, [[tx(m), 300], [tx(m), 450]], { color: run.color, dash: [3, 4], width: 1.5, alpha: lab, progress: lab, head: false });
      chip(ctx, run ? run.id : 'none', tx(m), 508 + (i % 2) * 28, { color: run ? run.color : color.muted, size: 11.5, align: 'center', alpha: lab });
    });
    chip(ctx, 'label = the run whose time window and machines match', AXIS.x + AXIS.w, 562, { color: color.body, size: 13, align: 'right', alpha: seg(t, 22, 22.8) });

    // the dataset
    const d = seg(t, 25.5, 26.3);
    panel(ctx, { x: 240, y: 585, w: 1120, h: 262, accent: C.human, title: 'LABELLED DATASET', alpha: d });
    const cols = [270, 350, 830, 950];
    ['alert', 'rule', 'time', 'true technique'].forEach((h, i) => text(ctx, h, cols[i], 640, { font: font.mono, size: 13, color: color.dim, alpha: d }));
    line(ctx, 260, 652, 1340, 652, { alpha: d });
    ROWS.forEach((r, i) => {
      const al2 = seg(t, 26.3 + i * 0.4, 26.8 + i * 0.4);
      const y = 682 + i * 33;
      r.forEach((cell, j) => text(ctx, cell, cols[j], y, { font: font.mono, size: 15, color: j === 3 ? (cell === 'none' ? color.muted : C.attack) : color.body, alpha: al2 }));
    });
  },
});
