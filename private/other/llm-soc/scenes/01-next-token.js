import { defineScene, seg, fade, lerp, text, wrap, type, color, font, C, node, chip, connector, panel, bar } from '../shared.js';

const PROMPT = ['Port', '22', 'is', 'used', 'by'];
const STEPS = [
  { at: 2.6, pick: 'SSH', options: [['SSH', 0.86], ['Telnet', 0.04], ['SFTP', 0.03], ['the', 0.02]] },
  { at: 9.4, pick: '.', options: [['.', 0.58], ['for', 0.17], [',', 0.12], ['and', 0.06]] },
];
const ROW_Y = 240;
const ROW_X = 160;
const MODEL = { x: 800, y: 420 };
const BARS = { x: 690, y: 560, w: 440, row: 38 };

export default defineScene({
  name: 'What an LLM does',
  duration: 31,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'Text in, one token out, repeat' },
  narration: [
    [0, 'Start with what a large language model actually does. It reads a piece of text, split into small pieces called tokens, and predicts which token is likely to come next.'],
    [9, 'It picks one, appends it to the text, and repeats. That is all it does: text goes in, text comes out, one token at a time.'],
    [17.5, 'Two consequences matter for everything that follows. First, an LLM is just a function you can call. Second, it only knows two things: what it learned during training, and what is written in the text you give it.'],
  ],

  draw(ctx, t) {
    // which tokens are in the row, and where each one sits
    const row = [...PROMPT];
    for (const s of STEPS) if (t > s.at + 5.4) row.push(s.pick);
    const widths = [];
    let x = ROW_X;
    const xs = row.map((tok) => {
      ctx.font = `500 22px ${font.mono}`;
      const w = ctx.measureText(tok).width + 22 * 1.3;
      widths.push(w);
      const at = x;
      x += w + 10;
      return at;
    });
    const rowEnd = x;

    text(ctx, 'the text so far, split into tokens', ROW_X, ROW_Y - 40, { font: font.mono, size: 15, color: color.muted, alpha: seg(t, 0.3, 1) });
    row.forEach((tok, i) => {
      const fresh = i >= PROMPT.length;
      const al = fresh ? 1 : seg(t, 0.4 + i * 0.22, 0.9 + i * 0.22);
      chip(ctx, tok, xs[i], ROW_Y, { color: fresh ? C.out : color.body, size: 22, alpha: al });
    });

    // the model
    connector(ctx, [[MODEL.x, ROW_Y + 30], [MODEL.x, MODEL.y - 58]], { color: color.dim, progress: seg(t, 1.6, 2.4), alpha: 1 - 0.6 * seg(t, 17, 18) });
    const thinking = STEPS.some((s) => t > s.at && t < s.at + 1.4);
    node(ctx, { x: MODEL.x, y: MODEL.y, w: 330, h: 100, title: 'Language model', sub: 'billions of learned numbers', icon: 'chip', accent: C.llm, alpha: seg(t, 1.2, 2.2), glow: thinking ? 1 : 0.15 });
    connector(ctx, [[MODEL.x, MODEL.y + 52], [MODEL.x, BARS.y - 26]], { color: color.dim, progress: seg(t, 3.6, 4.2), alpha: 1 - 0.6 * seg(t, 17, 18) });

    // probabilities for the next token, one step at a time
    const step = t < STEPS[1].at ? STEPS[0] : STEPS[1];
    const grow = seg(t, step.at + 1.2, step.at + 2.6);
    const last = step === STEPS[STEPS.length - 1];
    const shown = (last ? seg(t, step.at + 1, step.at + 1.6) : fade(t, step.at + 1, step.at + 1.6, step.at + 5.6, step.at + 6.2)) * (1 - 0.6 * seg(t, 17, 18));
    text(ctx, 'probability of each possible next token', BARS.x - 150, BARS.y - 4, { font: font.mono, size: 15, color: color.muted, alpha: shown });
    step.options.forEach(([tok, p], i) => {
      const y = BARS.y + 22 + i * BARS.row;
      const top = i === 0;
      const pick = top ? seg(t, step.at + 3, step.at + 3.6) : 0;
      text(ctx, tok, BARS.x - 18, y + 1, { font: font.mono, size: 20, color: top ? C.out : color.body, align: 'right', baseline: 'middle', alpha: shown });
      bar(ctx, BARS.x, y - 12, Math.max(6, BARS.w * p * grow), 24, top ? C.out : color.dim, shown * (top ? 0.6 + 0.4 * pick : 0.8));
      text(ctx, `${Math.round(p * 100 * grow)} %`, BARS.x + BARS.w * p * grow + 12, y + 1, { font: font.mono, size: 16, color: color.muted, baseline: 'middle', alpha: shown });
    });
    const pick = fade(t, step.at + 3, step.at + 3.6, step.at + 5.6, step.at + 6.2) * (last ? 0 : 1);
    text(ctx, 'pick the most likely one', BARS.x + 520, BARS.y + 23, { font: font.mono, size: 15, color: C.out, baseline: 'middle', alpha: pick });

    // the picked token flies up to the end of the row
    for (const s of STEPS) {
      const fly = seg(t, s.at + 4, s.at + 5.4);
      if (fly > 0 && fly < 1) {
        const fx = lerp(BARS.x - 60, rowEnd + 4, fly);
        const fy = lerp(BARS.y + 22, ROW_Y, fly) - Math.sin(Math.PI * fly) * 60;
        chip(ctx, s.pick, fx, fy, { color: C.out, size: 22 });
      }
    }
    const loop = seg(t, 9, 10) * (1 - 0.6 * seg(t, 17, 18));
    connector(ctx, [[1460, BARS.y + 22], [1505, BARS.y + 22], [1505, ROW_Y], [rowEnd + 30, ROW_Y]], { color: C.out, dash: [6, 7], progress: seg(t, 9, 10.5), alpha: loop });
    text(ctx, 'append and repeat', 1488, (BARS.y + ROW_Y) / 2, { font: font.mono, size: 15, color: C.out, align: 'right', alpha: loop });

    // the two consequences
    const cards = [
      { title: 'It is a function', body: 'text in → text out. Any program can call it, not only a chat window.', accent: C.out },
      { title: 'It knows two things', body: 'what it learned in training, and what is written in your prompt. Nothing else.', accent: C.llm },
    ];
    cards.forEach((c, i) => {
      const al = seg(t, 18 + i * 3.5, 19 + i * 3.5);
      const cx = 160 + i * 660;
      panel(ctx, { x: cx, y: 722, w: 620, h: 128, accent: c.accent, alpha: al });
      text(ctx, `${i + 1} · ${c.title}`, cx + 26, 764, { font: font.sans, size: 24, weight: 500, color: c.accent, alpha: al });
      wrap(ctx, c.body, cx + 26, 802, 570, 28, { ...type.body, size: 20, alpha: al });
    });
  },
});
