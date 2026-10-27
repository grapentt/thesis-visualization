import { defineScene, seg, text, wrap, color, font, C, panel, chip, line, bar, roundRect } from '../shared.js';

const MODELS = [
  ['8B', 'Llama 3.1 8B', 0.12],
  ['32B', 'Qwen2.5 32B', 0.5],
  ['70B', 'Llama 3.3 70B', 0.95],
];
const MEMORY = [
  ['16-bit', 140],
  ['8-bit', 70],
  ['4-bit', 40],
];
const ABLATION = [
  ['alert only', 0.41],
  ['+ host', 0.52],
  ['+ logs', 0.68],
  ['+ logs + host', 0.79],
];
const MORE = [
  'How wide should the log window be?',
  'Do required citations reduce hallucinations?',
  'Do ATT&CK descriptions in the prompt help?',
  'Can an 8B model match a 70B one here?',
];

export default defineScene({
  name: 'Design decisions and research questions',
  duration: 41,
  header: { eyebrow: 'PART 3 · YOUR PROJECT', title: 'Decide once, then ask one clear question' },
  narration: [
    [0, 'Some choices you make once, and document. Pick one local model early, somewhere between eight and seventy billion parameters, served with Ollama or vLLM. Bigger models are usually better, but slower, and need more GPU memory. Quantization shrinks them, at some cost in quality. Write down why you chose your model, instead of trying every model.'],
    [18, 'Then each team picks its own research question, and that question shapes the evaluation. For example: which kind of context actually helps? Run the same alerts with the alert alone, with host facts, with logs, and with both, and compare the scores.'],
    [31, 'Or: how wide should the log window be? Do required citations reduce hallucinations? Do ATT&CK descriptions in the prompt improve the mapping? A clear question makes a clear evaluation.'],
  ],

  draw(ctx, t) {
    // decide once
    const a = seg(t, 0.3, 1);
    panel(ctx, { x: 80, y: 180, w: 680, h: 660, accent: C.llm, title: 'DECIDE ONCE, DOCUMENT WHY', alpha: a });
    text(ctx, 'model size', 110, 250, { font: font.mono, size: 15, color: color.muted, alpha: a });
    line(ctx, 130, 310, 710, 310, { color: color.muted, width: 2, alpha: a });
    MODELS.forEach(([size, name, u], i) => {
      const al = seg(t, 1.5 + i * 0.6, 2 + i * 0.6);
      const x = 130 + u * 580;
      const r = 8 + i * 6;
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.fillStyle = C.llm;
      ctx.beginPath();
      ctx.arc(x, 310, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      text(ctx, size, x, 286 - r, { font: font.mono, size: 16, weight: 600, color: C.llm, align: 'center', alpha: al });
      text(ctx, name, x, 350, { font: font.mono, size: 13, color: color.body, align: i === 2 ? 'right' : i === 0 ? 'left' : 'center', alpha: al });
    });
    text(ctx, 'bigger: usually better · slower · more GPU memory', 110, 400, { font: font.sans, size: 18, color: color.body, alpha: seg(t, 5, 6) });

    const q = seg(t, 8, 8.8);
    text(ctx, 'memory for the weights of a 70B model', 110, 466, { font: font.mono, size: 15, color: color.muted, alpha: q });
    MEMORY.forEach(([bits, gb], i) => {
      const al = seg(t, 8.5 + i * 0.6, 9 + i * 0.6);
      const y = 500 + i * 44;
      text(ctx, bits, 200, y + 14, { font: font.mono, size: 15, color: color.body, align: 'right', alpha: al });
      bar(ctx, 216, y, (gb / 140) * 400, 22, i === 2 ? C.llm : color.dim, al);
      text(ctx, `≈ ${gb} GB`, 226 + (gb / 140) * 400, y + 16, { font: font.mono, size: 14, color: color.muted, alpha: al });
    });
    text(ctx, 'quantization: fewer bits per weight, some quality lost', 110, 660, { font: font.sans, size: 18, color: color.body, alpha: seg(t, 11, 12) });
    chip(ctx, 'Ollama: easy to start', 110, 720, { color: C.loki, size: 14, alpha: seg(t, 13, 13.6) });
    chip(ctx, 'vLLM: fast for many requests', 330, 720, { color: C.loki, size: 14, alpha: seg(t, 13.4, 14) });
    wrap(ctx, 'One model, chosen early, justified in the report.', 110, 790, 620, 28, { font: font.display, italic: true, size: 24, color: C.out, alpha: seg(t, 15, 16) });

    // a research question
    const b = seg(t, 18, 18.8);
    const X = 820;
    panel(ctx, { x: X, y: 180, w: 700, h: 420, accent: C.out, title: 'EXAMPLE QUESTION: WHICH CONTEXT HELPS?', alpha: b });
    text(ctx, 'technique F1 on the same labelled alerts', X + 30, 240, { font: font.mono, size: 14, color: color.muted, alpha: b });
    ABLATION.forEach(([label, f1], i) => {
      const al = seg(t, 21 + i * 1.4, 21.6 + i * 1.4);
      const y = 280 + i * 64;
      text(ctx, label, X + 190, y + 22, { font: font.mono, size: 16, color: color.body, align: 'right', alpha: al });
      const w = 420 * f1 * seg(t, 21 + i * 1.4, 22.2 + i * 1.4);
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.fillStyle = i === 3 ? C.out : color.dim;
      roundRect(ctx, X + 206, y + 4, w, 30, 6);
      ctx.fill();
      ctx.restore();
      text(ctx, f1.toFixed(2), X + 216 + w, y + 25, { font: font.mono, size: 15, color: color.muted, alpha: al });
    });
    text(ctx, 'hypothetical numbers: this is what you would measure', X + 30, 572, { font: font.mono, size: 13, color: C.alert, alpha: seg(t, 26, 27) });

    // more questions
    MORE.forEach((m, i) => {
      const al = seg(t, 31 + i * 1.3, 31.6 + i * 1.3);
      chip(ctx, m, X + (i % 2) * 0, 650 + i * 46, { color: C.out, size: 15, alpha: al });
    });
  },
});
