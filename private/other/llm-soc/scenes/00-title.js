import { defineScene, seg, fade, text, wrap, type, color, font, C, node, bubble, connector, packet, badge } from '../shared.js';

const PATH = [[930, 560], [1460, 560]];
const LINKS = [[[1040, 560], [1105, 560]], [[1285, 560], [1350, 560]]];

export default defineScene({
  name: 'Title',
  duration: 11,
  narration:
    'Most people know large language models as chatbots. This video shows how they become working parts of real security tools, and explains the student project “Triaging Security Alerts with a Local LLM”.',

  draw(ctx, t) {
    const a = seg(t, 0.2, 1.4);
    text(ctx, 'AN INTRODUCTION FOR BEGINNERS', 100, 250, { ...type.eyebrow, size: 18, tracking: 3, alpha: a });
    text(ctx, 'LLMs beyond', 100, 340, { ...type.title, size: 78, alpha: a });
    text(ctx, 'the chat window', 100, 428, { ...type.title, size: 78, italic: true, color: C.out, alpha: seg(t, 0.6, 1.8) });
    wrap(ctx, 'How language models become working parts of security tools, and what the project “Triaging Security Alerts with a Local LLM” is about.', 100, 492, 660, 36, {
      ...type.body,
      size: 24,
      color: color.muted,
      alpha: seg(t, 1.2, 2.4),
    });

    const parts = ['LLMs as building blocks', 'LLMs in security operations', 'The project: alert triage with a local LLM'];
    parts.forEach((p, i) => {
      const al = seg(t, 3 + i * 0.5, 3.8 + i * 0.5);
      badge(ctx, i + 1, 118, 642 + i * 52, { alpha: al, color: i === 2 ? C.out : color.muted, r: 15 });
      text(ctx, p, 150, 649 + i * 52, { font: font.sans, size: 22, color: i === 2 ? color.ink : color.body, alpha: al });
    });

    // a chat bubble that turns into a pipeline
    const chat = fade(t, 0.5, 1.3, 3.6, 4.4);
    bubble(ctx, 'What does this alert mean?', 1040, 280, 400, { accent: C.human, alpha: chat, chars: Math.floor(seg(t, 0.8, 2) * 30), size: 22 });
    bubble(ctx, 'It looks like someone is trying to log in over SSH …', 960, 370, 440, { accent: C.llm, alpha: fade(t, 2, 2.6, 3.6, 4.4), size: 22 });

    const pipe = seg(t, 3.9, 5);
    connector(ctx, PATH, { color: color.dim, progress: seg(t, 4.2, 5.2), alpha: pipe });
    node(ctx, { x: 960, y: 560, w: 150, h: 120, title: 'alert', accent: C.alert, alpha: pipe });
    node(ctx, { x: 1195, y: 560, w: 170, h: 120, title: 'local LLM', accent: C.llm, alpha: seg(t, 4.2, 5.2), glow: 0.4 });
    node(ctx, { x: 1430, y: 560, w: 150, h: 120, title: 'answer', accent: C.out, alpha: seg(t, 4.5, 5.5) });
    for (const link of LINKS) packet(ctx, link, ((t - 5.2) * 0.6) % 1, { color: C.out, alpha: seg(t, 5.2, 5.8), r: 6 });
    text(ctx, 'evidence in, checkable answers out', 1195, 680, { font: font.mono, size: 15, color: color.muted, align: 'center', alpha: seg(t, 5.5, 6.5) });
  },
});
