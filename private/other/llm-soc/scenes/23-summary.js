import { defineScene, seg, text, wrap, color, font, C, panel, icon, connector, badge } from '../shared.js';

const PIPE = [
  ['bell', C.alert, 'alert'],
  ['search', C.loki, 'retrieve'],
  ['doc', C.out, 'assemble'],
  ['grid', C.attack, 'map'],
  ['chip', C.llm, 'explain'],
  ['check', C.human, 'evaluate'],
];
const START = [
  'Call the local model from Python with one alert, by hand.',
  'Fetch its Loki lines and its FleetDM host automatically.',
  'Ask for JSON with citations; validate every answer.',
  'Script your first attack to get labelled alerts.',
  'Measure first, then change one thing at a time.',
];
const READ = [
  ['Habibzadeh et al. 2026', 'LLMs for Security Operations Centers: a survey'],
  ['Schärmer et al. 2026', 'LLM-based IDS alert interpretation for SOC triage'],
  ['Daniel et al. 2025', 'Labeling NIDS rules with ATT&CK: ML vs LLMs'],
  ['Cadet et al. 2026', 'Retrieval-augmented LLMs for incident analysis'],
  ['Sahay et al. 2026', 'Policy-guided threat hunting with SOC triage'],
];

export default defineScene({
  name: 'Summary',
  duration: 38,
  header: { eyebrow: 'SUMMARY', title: 'A component, not an oracle' },
  narration: [
    [0, 'To sum up. Outside the chat window, an LLM is a function you call from code. Embedded in a pipeline, it reads the evidence your code retrieves, and returns structured answers that your code can check and act on.'],
    [12.5, 'A good way to start: get one alert through end to end, by hand. Then automate the retrieval, ask for JSON, script your first attack for ground truth, and measure before you improve anything.'],
    [24, 'The references in the task description show how others have approached this: surveys of LLMs in SOCs, alert interpretation, ATT&CK labelling of IDS rules, and retrieval-augmented incident analysis. Give the model the right evidence, ask for answers you can check, and measure.'],
  ],

  draw(ctx, t) {
    PIPE.forEach(([kind, c, label], i) => {
      const x = 260 + i * 216;
      const al = seg(t, 0.5 + i * 0.4, 1 + i * 0.4);
      icon(ctx, kind, x, 220, 40, c, al);
      text(ctx, label, x, 272, { font: font.mono, size: 14, color: c, align: 'center', alpha: al });
      if (i > 0) connector(ctx, [[x - 186, 220], [x - 34, 220]], { color: color.dim, alpha: al });
    });

    const s = seg(t, 12.5, 13.3);
    panel(ctx, { x: 80, y: 320, w: 760, h: 410, accent: C.out, title: 'WHERE TO START', alpha: s });
    START.forEach((line, i) => {
      const al = seg(t, 13.3 + i * 1.6, 13.9 + i * 1.6);
      badge(ctx, i + 1, 120, 390 + i * 68, { color: C.out, alpha: al, r: 15 });
      wrap(ctx, line, 152, 397 + i * 68, 660, 26, { font: font.sans, size: 20, color: color.ink, alpha: al });
    });

    const r = seg(t, 24, 24.8);
    panel(ctx, { x: 880, y: 320, w: 640, h: 410, accent: color.muted, title: 'READ', alpha: r });
    READ.forEach(([who, what], i) => {
      const al = seg(t, 24.6 + i * 0.6, 25.2 + i * 0.6);
      text(ctx, who, 906, 382 + i * 68, { font: font.mono, size: 14, color: color.muted, alpha: al });
      text(ctx, what, 906, 408 + i * 68, { font: font.sans, size: 19, color: color.body, alpha: al });
    });

    wrap(ctx, 'Give the model the right evidence, ask for answers you can check, and measure.', 800, 800, 1300, 40, {
      font: font.display,
      italic: true,
      size: 32,
      color: C.out,
      align: 'center',
      alpha: seg(t, 31, 32.5),
    });
  },
});
