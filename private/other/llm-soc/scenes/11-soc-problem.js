import { defineScene, seg, lin, lerp, text, wrap, type, color, font, rgba, C, panel, icon, chip, brace, roundRect } from '../shared.js';

const STEPS = [
  { label: 'search Loki for related traffic', minutes: 6, color: C.loki, icon: 'db' },
  { label: 'look up the host in FleetDM', minutes: 3, color: C.fleet, icon: 'grid' },
  { label: 'find the ATT&CK technique', minutes: 4, color: C.attack, icon: 'search' },
  { label: 'decide and write it up', minutes: 3, color: C.out, icon: 'person' },
];
const TOTAL = STEPS.reduce((s, x) => s + x.minutes, 0);
const BAR = { x: 760, y: 690, w: 760, h: 44 };
const QUEUE = { x: 80, y: 190, w: 300, h: 640 };

/** Deterministic pseudo-random in [0, 1) for alert i. */
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default defineScene({
  name: 'The SOC problem',
  duration: 33,
  header: { eyebrow: 'PART 3 · THE PROJECT', title: 'Too many alerts, too little time' },
  narration: [
    [0, 'A Security Operations Center, or SOC, is the team that watches an organisation’s networks. Intrusion detection systems raise alerts all day, far more than people can examine carefully.'],
    [10.5, 'For every alert, an analyst does the same detective work: search the logs for what else happened around that time, look up the affected machine, find out which attack technique this could be, and then decide whether it matters.'],
    [23, 'Most of that time goes into collecting context, not into the decision itself. That collection, and a first draft of the explanation, is what this project automates.'],
  ],

  draw(ctx, t) {
    // the queue of unread alerts
    const q = seg(t, 0.3, 1);
    panel(ctx, { ...QUEUE, accent: C.alert, title: 'UNREAD ALERTS', alpha: q });
    const arrived = Math.floor(lerp(0, 1734, lin(t, 0.5, 33)));
    text(ctx, arrived.toLocaleString('en'), QUEUE.x + QUEUE.w - 22, QUEUE.y + 27, { font: font.mono, size: 16, weight: 600, color: C.alert, align: 'right', alpha: q });
    ctx.save();
    ctx.beginPath();
    ctx.rect(QUEUE.x, QUEUE.y + 44, QUEUE.w, QUEUE.h - 50);
    ctx.clip();
    // rows drop in from the top and pile up
    const rows = Math.min(30, Math.floor(t * 2.2));
    for (let i = 0; i < rows; i++) {
      const born = i / 2.2;
      const y = QUEUE.y + QUEUE.h - 40 - Math.min(i, 17) * 33 - (1 - seg(t, born, born + 0.4)) * 300;
      if (i > 17) continue;
      ctx.globalAlpha = q * seg(t, born, born + 0.3);
      ctx.fillStyle = rgba(C.alert, 0.1 + 0.08 * rand(i));
      roundRect(ctx, QUEUE.x + 16, y - 13, QUEUE.w - 32, 26, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      icon(ctx, 'bell', QUEUE.x + 34, y, 16, C.alert, q * 0.9);
      ctx.fillStyle = rgba(color.muted, 0.5 * q);
      ctx.fillRect(QUEUE.x + 52, y - 3, 80 + rand(i + 7) * 120, 6);
    }
    ctx.restore();

    // the analyst
    const an = seg(t, 2, 3);
    icon(ctx, 'person', 560, 320, 90, C.human, an);
    text(ctx, 'analyst', 560, 400, { font: font.mono, size: 16, color: C.human, align: 'center', alpha: an });
    chip(ctx, 'one alert at a time', 560, 440, { color: C.human, size: 14, align: 'center', alpha: an });

    // the manual steps for one alert
    const list = seg(t, 10.5, 11.3);
    text(ctx, 'FOR EVERY SINGLE ALERT', 760, 214, { ...type.eyebrow, size: 15, color: color.muted, alpha: list });
    let start = 0;
    STEPS.forEach((s, i) => {
      const at = 11.3 + i * 2.4;
      const al = seg(t, at, at + 0.6);
      const y = 270 + i * 82;
      panel(ctx, { x: 760, y: y - 32, w: 760, h: 64, accent: s.color, alpha: al });
      icon(ctx, s.icon, 800, y, 28, s.color, al);
      text(ctx, s.label, 836, y + 7, { font: font.sans, size: 21, color: color.ink, alpha: al });
      text(ctx, `≈ ${s.minutes} min`, 1496, y + 7, { font: font.mono, size: 17, color: s.color, align: 'right', alpha: al });
      // its share of the time bar
      const x0 = BAR.x + (start / TOTAL) * BAR.w;
      const w = (s.minutes / TOTAL) * BAR.w * seg(t, at + 0.3, at + 1.2);
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.fillStyle = s.color;
      ctx.fillRect(x0, BAR.y, Math.max(0, w - 3), BAR.h);
      ctx.restore();
      start += s.minutes;
    });
    text(ctx, `≈ ${TOTAL} minutes per alert (illustrative)`, BAR.x, BAR.y + BAR.h + 32, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 20, 21) });

    // collecting context dominates
    const ctxShare = (STEPS[0].minutes + STEPS[1].minutes + STEPS[2].minutes) / TOTAL;
    const br = seg(t, 23, 24);
    brace(ctx, BAR.x, BAR.x + ctxShare * BAR.w - 3, BAR.y - 10, -1, C.out, br, br);
    text(ctx, 'collecting context', BAR.x + (ctxShare * BAR.w) / 2, BAR.y - 44, { font: font.mono, size: 16, color: C.out, align: 'center', alpha: br });
    // the automation
    const auto = seg(t, 27, 28);
    wrap(ctx, 'This project automates the collection and drafts the explanation. The analyst keeps the decision.', 450, 560, 270, 30, { ...type.body, size: 21, color: C.out, alpha: auto });
  },
});
