import { defineScene, seg, lin, text, wrap, type, color, font, C, panel, node, bubble, connector, chip, stamp, codeBlock } from '../shared.js';

const INVENTED = 'The attacker exploited a known OpenSSH vulnerability on web-01 and gained root access. Data was probably stolen.';

const RULES = `Use ONLY the context below.
Cite the line behind every claim, e.g. [L5].
If the context is not enough, say "unknown".`;

const EVIDENCE = [
  ['L1', 'flow 10.10.0.66 → web-01:22  1.2 s  closed'],
  ['L2', 'ssh client libssh2_1.10.0'],
  ['L5', 'flow 10.10.0.66 → web-01:22  662 s  2.3 MB'],
];
const CLAIMS = [
  ['Many short SSH sessions from 10.10.0.66', 'L1'],
  ['The client library is common in attack tools', 'L2'],
  ['A long session followed', 'L5'],
  ['Root access: unknown, no evidence', null],
];

const LEFT = 80;
const RIGHT = 830;

export default defineScene({
  name: 'Hallucination and grounding',
  duration: 35,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'Plausible is not the same as true' },
  narration: [
    [0, 'When the model lacks information, it does not stay silent. It produces the most plausible-sounding continuation, which can be confidently wrong. This is called hallucination.'],
    [9, 'Given only an SSH alert, it might claim that the attacker exploited a famous OpenSSH vulnerability and gained root. Nothing in the data says so.'],
    [17, 'The remedy is grounding. Give the model the evidence, tell it to use only that evidence, to cite the line behind every claim, and to say unknown when the evidence is not enough.'],
    [27, 'Then every statement can be checked against its source, by a person or by a program.'],
  ],

  draw(ctx, t) {
    // without evidence
    const left = seg(t, 0.3, 1.1);
    text(ctx, 'WITHOUT EVIDENCE', LEFT, 200, { ...type.eyebrow, color: C.alert, alpha: left });
    chip(ctx, 'input: only the alert “ET SCAN Potential SSH Scan”', LEFT, 250, { color: C.alert, size: 15, alpha: left });
    node(ctx, { x: LEFT + 150, y: 350, w: 300, h: 84, title: 'the model', icon: 'chip', accent: C.llm, alpha: seg(t, 1.2, 2), glow: t > 3 && t < 5 ? 1 : 0.1 });
    connector(ctx, [[LEFT + 150, 270], [LEFT + 150, 306]], { color: color.dim, alpha: seg(t, 1.2, 2) });
    connector(ctx, [[LEFT + 150, 394], [LEFT + 150, 430]], { color: color.dim, alpha: seg(t, 4.5, 5) });
    bubble(ctx, INVENTED, LEFT, 440, 640, { accent: C.llm, size: 21, alpha: seg(t, 4.8, 5.4), chars: Math.floor(lin(t, 5, 9) * INVENTED.length) });
    text(ctx, 'fluent, specific, confident …', LEFT, 600, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 9.5, 10.3) });
    stamp(ctx, 'NOT IN THE DATA', LEFT + 470, 610, { alpha: seg(t, 11.5, 12), size: 22 });
    wrap(ctx, 'A language model continues text plausibly. Without facts, plausible gets filled in.', LEFT, 680, 640, 30, { ...type.body, size: 21, alpha: seg(t, 13, 14) });

    // grounded
    const right = seg(t, 17, 17.8);
    ctx.save();
    ctx.globalAlpha *= right;
    text(ctx, 'GROUNDED', RIGHT, 200, { ...type.eyebrow, color: C.fleet });
    ctx.restore();
    codeBlock(ctx, RULES, { x: RIGHT, y: 222, w: 690, lang: 'plain', size: 16, title: 'RULES IN THE PROMPT', accent: C.llm, alpha: right, lineColors: [color.ink, color.ink, color.ink] });
    const evTop = 400;
    panel(ctx, { x: RIGHT, y: evTop, w: 690, h: 150, accent: C.loki, title: 'EVIDENCE', alpha: seg(t, 19, 19.8) });
    const evY = (i) => evTop + 62 + i * 32;
    EVIDENCE.forEach(([id, line], i) => {
      text(ctx, `[${id}]`, RIGHT + 22, evY(i), { font: font.mono, size: 15, color: C.loki, baseline: 'middle', alpha: seg(t, 19.4 + i * 0.3, 19.8 + i * 0.3) });
      text(ctx, line, RIGHT + 76, evY(i), { font: font.mono, size: 15, color: color.body, baseline: 'middle', alpha: seg(t, 19.4 + i * 0.3, 19.8 + i * 0.3) });
    });

    const outTop = 580;
    panel(ctx, { x: RIGHT, y: outTop, w: 690, h: 210, accent: C.out, title: 'ANSWER', alpha: seg(t, 21.5, 22.2) });
    CLAIMS.forEach(([claim, cite], i) => {
      const at = 22.4 + i * 1.3;
      const al = seg(t, at, at + 0.5);
      const y = outTop + 66 + i * 36;
      text(ctx, '•', RIGHT + 24, y, { font: font.sans, size: 19, color: color.muted, baseline: 'middle', alpha: al });
      text(ctx, claim, RIGHT + 44, y, { font: font.sans, size: 19, color: cite ? color.ink : C.out, baseline: 'middle', alpha: al });
      if (cite) {
        chip(ctx, `[${cite}]`, RIGHT + 600, y, { color: C.loki, size: 13, alpha: al });
        const k = EVIDENCE.findIndex(([id]) => id === cite);
        connector(ctx, [[RIGHT + 670, y], [RIGHT + 700, y], [RIGHT + 700, evY(k)], [RIGHT + 676, evY(k)]], { color: C.loki, width: 1.5, alpha: seg(t, at + 0.3, at + 0.7) * 0.9, progress: seg(t, at + 0.3, at + 1) });
      }
    });
    wrap(ctx, 'Every claim points to its source, so it can be checked.', RIGHT, 830, 690, 28, { ...type.body, size: 21, color: C.fleet, alpha: seg(t, 28, 29) });
  },
});
