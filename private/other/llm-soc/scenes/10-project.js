import { defineScene, seg, text, wrap, type, color, font, C, node, connector, chip } from '../shared.js';

export default defineScene({
  name: 'The project',
  duration: 9,
  narration: 'Now the project. Teams of two to four students build a pipeline that explains security alerts with a locally hosted language model.',

  draw(ctx, t) {
    const a = seg(t, 0.2, 1.2);
    text(ctx, 'PART 3 · THE PROJECT', 100, 280, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'Triaging Security Alerts', 100, 370, { ...type.title, size: 70, alpha: a });
    text(ctx, 'with a Local LLM', 100, 450, { ...type.title, size: 70, italic: true, color: C.out, alpha: seg(t, 0.6, 1.6) });
    wrap(ctx, 'Take a raw intrusion-detection alert and produce a grounded, human-readable explanation of what it means, without any data leaving the institution.', 100, 520, 720, 36, {
      ...type.body,
      size: 24,
      color: color.muted,
      alpha: seg(t, 1.4, 2.4),
    });
    let cx = 100;
    ['teams of 2–4', 'local infrastructure', 'your own research question'].forEach((s, i) => {
      cx += chip(ctx, s, cx, 680, { color: color.body, size: 16, alpha: seg(t, 2.6 + i * 0.4, 3.2 + i * 0.4) }) + 14;
    });

    // the three boxes of the course slide, as a reminder
    const items = [
      ['IDS alerts', 'bell', C.alert, 380],
      ['Local LLM', 'chip', C.llm, 540],
      ['Alert triage', 'check', C.out, 700],
    ];
    items.forEach(([label, kind, c, y], i) => {
      const al = seg(t, 1.5 + i * 0.6, 2.2 + i * 0.6);
      node(ctx, { x: 1260, y, w: 300, h: 100, title: label, icon: kind, accent: c, alpha: al, titleSize: 24 });
      if (i > 0) connector(ctx, [[1260, y - 108], [1260, y - 52]], { color: color.dim, alpha: al });
    });
    text(ctx, 'in short', 1260, 300, { font: font.mono, size: 15, color: color.muted, align: 'center', alpha: seg(t, 1.5, 2.2) });
  },
});
