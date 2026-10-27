import { defineScene, seg, fade, lin, text, wrap, color, font, C, node, bubble, connector, packet, codeBlock, chip, icon } from '../shared.js';

const PROSE =
  'Hmm, this looks like it could be an SSH scan. It is probably not too serious, but you might want to keep an eye on the server and maybe check the logs if you have time.';

const JSON_OUT = `{
  "summary": "many SSH connection attempts on web-01",
  "severity": "medium",
  "requires_reaction": true,
  "next_steps": ["check auth.log on web-01", "block 10.10.0.66"]
}`;

const CODE = `reply  = ask_llm(SYSTEM, prompt, format=SCHEMA)
result = json.loads(reply)                # text → Python dict
if result["requires_reaction"]:
    open_ticket(alert, result["next_steps"])`;

const JSON_BOX = { x: 800, y: 190, w: 720 };
const CODE_BOX = { x: 800, y: 470, w: 720 };
const PROGRAM = { x: 400, y: 600 };
const QUESTIONS = [['severity?', 260, 700], ['react or not?', 400, 735], ['which steps?', 545, 700]];
const FIELDS = [
  [2, 'severity', 260],
  [3, 'requires_reaction', 400],
  [4, 'next_steps', 545],
];

export default defineScene({
  name: 'Structured output',
  duration: 31,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'Ask for data, not for prose' },
  narration: [
    [0, 'There is a catch. Models like to answer in friendly prose. A person can read that, but a program cannot reliably find the severity in a paragraph.'],
    [9, 'So we ask for structured output: a JSON object with fixed fields. Local servers such as Ollama and vLLM can even force the output to match a JSON schema, so every answer has the same shape.'],
    [19.5, 'Now the answer is data. The program parses it, checks that every required field is there, stores it, and acts on it, for example by opening a ticket only when a reaction is needed.'],
  ],

  draw(ctx, t) {
    const later = 1 - 0.6 * seg(t, 9, 10);
    bubble(ctx, PROSE, 90, 190, 620, { accent: C.llm, size: 20, alpha: seg(t, 0.3, 0.9) * later, chars: Math.floor(lin(t, 0.6, 4) * PROSE.length) });
    text(ctx, 'the model, answering in prose', 100, 178, { font: font.mono, size: 14, color: color.muted, alpha: seg(t, 0.3, 0.9) * later });

    node(ctx, { x: PROGRAM.x, y: PROGRAM.y, w: 280, h: 90, title: 'your program', icon: 'gear', accent: C.out, alpha: seg(t, 3.6, 4.4) });
    // what the program cannot find in prose
    const lost = fade(t, 4.6, 5.4, 9.8, 10.6);
    QUESTIONS.forEach(([q, x, y], i) => {
      const al = lost * seg(t, 4.8 + i * 0.6, 5.4 + i * 0.6);
      chip(ctx, q, x, y, { color: C.alert, size: 15, align: 'center', alpha: al });
      icon(ctx, 'cross', x, y + 34, 20, C.alert, al);
    });
    text(ctx, 'a paragraph has no fields to read', PROGRAM.x, 820, { font: font.mono, size: 15, color: C.alert, align: 'center', alpha: lost });

    // the same answer as JSON
    const json = codeBlock(ctx, JSON_OUT, { ...JSON_BOX, lang: 'json', size: 16, title: 'THE SAME ANSWER AS JSON', accent: C.out, alpha: seg(t, 10, 10.6), chars: Math.floor(lin(t, 10.4, 13) * JSON_OUT.length), active: t > 21 ? [2, 3, 4] : null, focus: seg(t, 21, 21.6) });
    wrap(ctx, 'Ollama and vLLM can force the output to match a JSON schema: same fields, every time.', JSON_BOX.x, JSON_BOX.y + json.height + 34, 700, 26, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 14, 15) });

    codeBlock(ctx, CODE, { ...CODE_BOX, y: CODE_BOX.y + 40, size: 16, title: 'USING IT', accent: C.out, alpha: seg(t, 19.6, 20.4), chars: Math.floor(lin(t, 20, 22.5) * CODE.length), active: t > 27 ? { from: 2, to: 3 } : null, focus: seg(t, 27, 27.5) });

    // fields flow into the program
    FIELDS.forEach(([lineIndex, name, x], i) => {
      const at = 22.6 + i * 0.9;
      const path = [[JSON_BOX.x, json.lineY(lineIndex)], [x + 120, json.lineY(lineIndex)], [x, 660]];
      connector(ctx, path, { color: C.out, dash: [4, 6], alpha: fade(t, at, at + 0.4, 29.4, 30), progress: seg(t, at, at + 0.8) });
      packet(ctx, path, lin(t, at, at + 0.9), { color: C.out, r: 6 });
      const al = seg(t, at + 0.8, at + 1.2);
      chip(ctx, name, x, 700 + (i === 1 ? 35 : 0), { color: C.fleet, size: 14, align: 'center', alpha: al });
      icon(ctx, 'check', x, 734 + (i === 1 ? 35 : 0), 20, C.fleet, al);
    });
    text(ctx, 'every field where the program expects it', PROGRAM.x, 820, { font: font.mono, size: 15, color: C.fleet, align: 'center', alpha: seg(t, 25.4, 26.2) });
  },
});
