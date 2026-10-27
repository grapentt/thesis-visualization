import { defineScene, seg, text, wrap, type, color, font, C, panel, icon, connector } from '../shared.js';

const USES = [
  { icon: 'bell', title: 'Alert triage', ask: 'What does this alert mean, and does it matter?', color: C.alert },
  { icon: 'doc', title: 'Log summaries', ask: 'Summarise 5,000 lines of auth.log for web-01.', color: C.loki },
  { icon: 'mail', title: 'Phishing analysis', ask: 'Is this email suspicious? Point to the signs.', color: C.human },
  { icon: 'search', title: 'Threat intelligence', ask: 'List the IPs, hashes and techniques in this report.', color: C.fleet },
  { icon: 'grid', title: 'ATT&CK mapping', ask: 'Which technique does this detection rule catch?', color: C.attack },
  { icon: 'terminal', title: 'Report drafting', ask: 'Write the incident timeline for the ticket.', color: C.out },
];

export default defineScene({
  name: 'Where LLMs help in security',
  duration: 32,
  header: { eyebrow: 'PART 2 · LLMs IN SECURITY OPERATIONS', title: 'Security teams drown in text' },
  narration: [
    [0, 'Where does this help in cybersecurity? Security teams drown in text: alerts, logs, emails, threat reports, tickets. Reading, connecting and summarising text is exactly what LLMs are good at.'],
    [10, 'Typical uses are explaining and triaging alerts, summarising logs, analysing phishing emails, extracting indicators from threat reports, mapping detections to MITRE ATT&CK, and drafting incident reports.'],
    [21.5, 'In each case the LLM is an assistant inside a pipeline, not the decision maker. The analyst stays in the loop, and the pipeline is built so that every answer can be checked.'],
  ],

  draw(ctx, t) {
    USES.forEach((u, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 80 + col * 490;
      const y = 185 + row * 205;
      const al = seg(t, 10.5 + i * 1.5, 11.3 + i * 1.5);
      panel(ctx, { x, y, w: 460, h: 180, accent: u.color, alpha: al });
      icon(ctx, u.icon, x + 50, y + 56, 40, u.color, al);
      text(ctx, u.title, x + 90, y + 66, { font: font.sans, size: 25, weight: 500, color: color.ink, alpha: al });
      wrap(ctx, `“${u.ask}”`, x + 30, y + 118, 400, 28, { font: font.display, italic: true, size: 22, color: color.body, alpha: al });
    });

    // the stream of text at the start
    const intro = 1 - seg(t, 9.5, 10.5);
    const kinds = [['alerts', C.alert], ['logs', C.loki], ['emails', C.human], ['threat reports', C.fleet], ['tickets', C.out]];
    kinds.forEach(([k, c], i) => {
      const al = seg(t, 1 + i * 0.7, 1.6 + i * 0.7) * intro;
      icon(ctx, 'doc', 240 + i * 280, 420, 70, c, al);
      text(ctx, k, 240 + i * 280, 500, { font: font.mono, size: 18, color: c, align: 'center', alpha: al });
    });
    text(ctx, 'reading, connecting, summarising: what LLMs are good at', 800, 600, { font: font.mono, size: 18, color: C.llm, align: 'center', alpha: seg(t, 5.5, 6.5) * intro });

    // human in the loop
    const loop = seg(t, 22, 23);
    const y = 625;
    panel(ctx, { x: 80, y, w: 1440, h: 200, accent: C.human, alpha: loop });
    const steps = [
      ['doc', 'data', C.loki],
      ['chip', 'LLM drafts', C.llm],
      ['check', 'checks', C.fleet],
      ['person', 'analyst decides', C.human],
    ];
    steps.forEach(([k, label, c], i) => {
      const x = 200 + i * 300;
      const al = seg(t, 22.5 + i * 0.8, 23.2 + i * 0.8);
      icon(ctx, k, x, y + 80, 46, c, al);
      text(ctx, label, x, y + 145, { font: font.mono, size: 16, color: c, align: 'center', alpha: al });
      if (i > 0) connector(ctx, [[x - 240, y + 80], [x - 60, y + 80]], { color: color.dim, alpha: al, progress: seg(t, 22.5 + i * 0.8, 23.2 + i * 0.8) });
    });
    wrap(ctx, 'An assistant inside a pipeline, not the decision maker.', 1130, y + 80, 360, 32, { ...type.title, size: 27, italic: true, color: color.ink, alpha: seg(t, 26, 27) });
  },
});
