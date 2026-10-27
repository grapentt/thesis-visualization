import { defineScene, seg, fade, lin, lerp, text, wrap, type, color, font, rgba, C, panel, node, connector, packet, chip, icon, meter, dot } from '../shared.js';

const MODEL = { x: 800, y: 330 };
const KNOWS = ['what SSH is', 'how brute force works', 'MITRE ATT&CK', 'Linux, Windows, networks'];
const ASKS = ['Which machine is 10.10.0.21?', 'What else did 10.10.0.66 do today?', 'Does web-01 accept SSH passwords?'];
const DESK = { x: 420, y: 510, w: 820, h: 260 };
const PAPERS = [
  { label: 'the alert', color: C.alert, at: 15 },
  { label: '6 log lines', color: C.loki, at: 16.2 },
  { label: 'host facts', color: C.fleet, at: 17.4 },
  { label: 'ATT&CK entry', color: C.attack, at: 18.6 },
];

export default defineScene({
  name: 'The context window',
  duration: 35,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'The model only sees what is on its desk' },
  narration: [
    [0, 'Next, knowledge. From training, a model knows a lot in general: what SSH is, how a brute-force attack looks, what MITRE ATT&CK is. But it knows nothing about your network.'],
    [10, 'It cannot know which machine 10.10.0.21 is, or what else 10.10.0.66 did this morning. The only way to tell it is to put that information into the prompt, its context window. Think of it as the model’s desk: it can only work with the papers lying on it.'],
    [22, 'The desk is limited, a few thousand to a hundred thousand tokens, and a cluttered desk distracts the model. So a program first retrieves the few relevant pieces from huge log stores and asset databases, and puts only those on the desk. This pattern is called retrieval-augmented generation, or RAG.'],
  ],

  draw(ctx, t) {
    node(ctx, { x: MODEL.x, y: MODEL.y, w: 280, h: 100, title: 'the model', sub: 'llama3.1:8b', icon: 'chip', accent: C.llm, alpha: seg(t, 0.2, 1) });

    // what it knows from training
    const known = seg(t, 1, 2);
    panel(ctx, { x: 80, y: 190, w: 420, h: 280, accent: C.llm, title: 'LEARNED IN TRAINING', alpha: known, dash: [6, 6] });
    KNOWS.forEach((k, i) => {
      const al = seg(t, 2 + i * 0.8, 2.6 + i * 0.8);
      icon(ctx, 'check', 118, 262 + i * 44, 22, C.llm, al);
      text(ctx, k, 142, 269 + i * 44, { font: font.sans, size: 20, color: color.body, alpha: al });
    });
    text(ctx, 'general, frozen at a cutoff date', 108, 448, { font: font.mono, size: 14, color: color.muted, alpha: seg(t, 6, 7) });
    connector(ctx, [[500, 330], [MODEL.x - 140, MODEL.y]], { color: C.llm, alpha: known, progress: seg(t, 2, 3) });

    // what it cannot know
    const ask = seg(t, 10, 11);
    panel(ctx, { x: 1100, y: 190, w: 420, h: 280, accent: C.alert, title: 'ABOUT YOUR NETWORK', alpha: ask, dash: [6, 6] });
    const answered = seg(t, 19.6, 20.4);
    ASKS.forEach((q, i) => {
      const al = seg(t, 10.6 + i * 1, 11.2 + i * 1);
      wrap(ctx, q, 1170, 262 + i * 66, 330, 24, { font: font.sans, size: 19, color: color.body, alpha: al });
      text(ctx, '?', 1130, 268 + i * 66, { font: font.display, size: 34, weight: 500, color: C.alert, align: 'center', alpha: al * (1 - answered) });
      icon(ctx, 'check', 1130, 260 + i * 66, 24, C.fleet, al * answered);
    });
    connector(ctx, [[1100, 330], [MODEL.x + 140, MODEL.y]], { color: C.alert, dash: [5, 6], alpha: ask * (1 - answered), progress: seg(t, 11, 12) });
    text(ctx, 'not in any training data', 960, 300, { font: font.mono, size: 14, color: C.alert, align: 'center', alpha: ask * (1 - answered) });

    // the desk
    const desk = seg(t, 13.4, 14.2);
    panel(ctx, { ...DESK, accent: C.out, title: 'CONTEXT WINDOW · THE MODEL’S DESK', alpha: desk, glow: 0.3 * desk });
    connector(ctx, [[MODEL.x, DESK.y], [MODEL.x, MODEL.y + 52]], { color: C.out, alpha: desk });
    text(ctx, 'everything the model reads for this one answer', DESK.x + DESK.w - 20, DESK.y + 26, { font: font.mono, size: 13, color: color.muted, align: 'right', alpha: desk });
    PAPERS.forEach((p, i) => {
      const al = seg(t, p.at, p.at + 0.6);
      const x = DESK.x + 40 + i * 192;
      const y = DESK.y + 48 + (1 - al) * -30;
      panel(ctx, { x, y, w: 170, h: 120, accent: p.color, alpha: al, fill: rgba(p.color, 0.08) });
      icon(ctx, 'doc', x + 85, y + 48, 40, p.color, al);
      text(ctx, p.label, x + 85, y + 102, { font: font.mono, size: 15, color: p.color, align: 'center', alpha: al });
    });

    // limited size
    const tokens = lerp(0, 1150, lin(t, 15, 19.4));
    meter(ctx, { x: DESK.x + 40, y: DESK.y + DESK.h - 34, w: DESK.w - 80, h: 12, value: tokens, max: 8192, color: C.out, label: 'tokens used', valueText: `${Math.round(tokens).toLocaleString('en')} / 8,192`, alpha: seg(t, 15, 15.6) });

    // retrieval from big stores
    const store = seg(t, 22.5, 23.5);
    const stores = [
      { label: 'Loki: millions of log lines', color: C.loki, x: 80, y: 560, kind: 'db' },
      { label: 'FleetDM: every host', color: C.fleet, x: 80, y: 690, kind: 'grid' },
    ];
    stores.forEach((s, i) => {
      panel(ctx, { x: s.x, y: s.y, w: 290, h: 100, accent: s.color, alpha: store });
      icon(ctx, s.kind, s.x + 46, s.y + 50, 40, s.color, store);
      wrap(ctx, s.label, s.x + 86, s.y + 44, 190, 24, { font: font.sans, size: 18, color: color.body, alpha: store });
      // many dots: the haystack
      for (let k = 0; k < 18; k++) dot(ctx, s.x + 100 + (k % 9) * 20, s.y + 82 + Math.floor(k / 9) * 8, 2, s.color, store * 0.5);
      const path = [[s.x + 290, s.y + 50], [DESK.x - 4, DESK.y + 110 + i * 70]];
      connector(ctx, path, { color: s.color, alpha: store, progress: seg(t, 23.5 + i * 0.6, 24.5 + i * 0.6), dash: [5, 6] });
      for (let k = 0; k < 3; k++) packet(ctx, path, ((t - 24.5 - k * 0.4 - i * 0.3) / 1.6) % 1, { color: s.color, r: 5, alpha: store * fade(t, 24.5, 25, 31, 32) });
    });
    chip(ctx, 'retrieve only what matters', 80, 830, { color: C.out, size: 14, alpha: seg(t, 25, 26) });

    // RAG
    const rag = seg(t, 28.5, 29.5);
    panel(ctx, { x: 1290, y: 520, w: 230, h: 300, accent: C.out, alpha: rag });
    text(ctx, 'RAG', 1405, 580, { ...type.title, size: 44, color: C.out, align: 'center', alpha: rag });
    ['retrieve', 'augment the prompt', 'generate'].forEach((s, i) => {
      text(ctx, `${i + 1}. ${s}`, 1316, 640 + i * 40, { font: font.mono, size: 16, color: color.body, alpha: seg(t, 29 + i * 0.5, 29.6 + i * 0.5) });
    });
    text(ctx, 'retrieval-augmented', 1405, 790, { font: font.mono, size: 13, color: color.muted, align: 'center', alpha: rag });
    text(ctx, 'generation', 1405, 808, { font: font.mono, size: 13, color: color.muted, align: 'center', alpha: rag });
  },
});
