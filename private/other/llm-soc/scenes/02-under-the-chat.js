import { defineScene, seg, fade, lin, lerp, text, wrap, type, color, font, C, panel, node, bubble, connector, packet, codeBlock, icon } from '../shared.js';

const QUESTION = 'What does the alert “ET SCAN Potential SSH Scan” mean?';
const ANSWER = 'Someone is probing port 22 to find machines that run SSH, the remote-login service …';

const REQUEST = `{
  "model": "llama3.1:8b",
  "messages": [
    {"role": "user",
     "content": "What does the alert …"}
  ]
}`;
const RESPONSE = `{
  "message": {
    "role": "assistant",
    "content": "Someone is probing port 22 …"
  }
}`;

const CHAT = { x: 90, y: 190, w: 520, h: 470 };
const REQ = { x: 680, y: 190, w: 470 };
const RES = { x: 680, y: 470, w: 470 };
const SERVER = { x: 1370, y: 420 };

const LAYERS = [
  { key: 'APP', title: 'the app around it', sub: 'a chat window … or your own program', accent: C.human },
  { key: 'API', title: 'a server with an HTTP API', sub: 'Ollama, vLLM, or a cloud API · JSON in, JSON out', accent: C.loki },
  { key: 'MODEL', title: 'the model itself', sub: 'the learned weights: Llama, Qwen, Mistral, GPT, Claude, …', accent: C.llm },
];

export default defineScene({
  name: 'Under the chat window',
  duration: 30,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'The chat window is only a thin app' },
  narration: [
    [0, 'Most people meet LLMs through a chat window. But the chat window is only a thin app on top.'],
    [6, 'When you press enter, the app packs the conversation into a request: a small JSON document with a list of messages. It sends it to a server that runs the model, and the answer comes back as JSON too.'],
    [16.5, 'So there are three layers: the model itself, a server that runs it and offers an API, and an app on top. Swap the app for your own program, and the same model works for you inside any workflow.'],
  ],

  draw(ctx, t) {
    const first = 1 - seg(t, 15.8, 16.8);

    // the chat app
    if (first > 0.003) {
      panel(ctx, { ...CHAT, accent: C.human, title: 'CHAT APP', alpha: seg(t, 0.2, 1) * first });
      const q = bubble(ctx, QUESTION, CHAT.x + 120, CHAT.y + 60, 380, { accent: C.human, alpha: seg(t, 0.6, 1.2) * first, chars: Math.floor(lin(t, 0.8, 2.6) * QUESTION.length) });
      bubble(ctx, ANSWER, CHAT.x + 20, CHAT.y + 80 + q, 400, { accent: C.llm, alpha: seg(t, 12.6, 13.2) * first, chars: Math.floor(lin(t, 12.8, 15) * ANSWER.length) });
      // the request and the response, as the app sends and receives them
      codeBlock(ctx, REQUEST, { ...REQ, lang: 'json', size: 16, title: 'HTTP REQUEST · POST /api/chat', accent: C.human, alpha: seg(t, 6.6, 7.4) * first });
      codeBlock(ctx, RESPONSE, { ...RES, lang: 'json', size: 16, title: 'HTTP RESPONSE', accent: C.llm, alpha: seg(t, 10.2, 11) * first });
      node(ctx, { x: SERVER.x, y: SERVER.y, w: 300, h: 110, title: 'Model server', sub: 'runs the LLM', icon: 'server', accent: C.llm, alpha: seg(t, 5.8, 6.6) * first, glow: t > 8.8 && t < 10.4 ? 1 : 0.1 });

      const toServer = [[REQ.x + REQ.w, 300], [SERVER.x - 150, 400]];
      const fromServer = [[SERVER.x - 150, 440], [RES.x + RES.w, 540]];
      const back = [[RES.x, 560], [CHAT.x + CHAT.w, 560]];
      connector(ctx, [[CHAT.x + CHAT.w, 300], [REQ.x, 300]], { color: C.human, progress: seg(t, 6.2, 6.8), alpha: first });
      connector(ctx, toServer, { color: C.human, progress: seg(t, 7.6, 8.4), alpha: first });
      connector(ctx, fromServer, { color: C.llm, progress: seg(t, 10, 10.6), alpha: first });
      connector(ctx, back, { color: C.llm, progress: seg(t, 11.6, 12.4), alpha: first });
      packet(ctx, toServer, lin(t, 7.8, 8.9), { color: C.human, label: 'request' });
      packet(ctx, back, lin(t, 11.8, 12.8), { color: C.llm, label: 'answer' });
      text(ctx, 'every chat app does this behind the scenes', REQ.x + REQ.w / 2, 760, { font: font.mono, size: 16, color: color.muted, align: 'center', alpha: fade(t, 8, 9, 15, 15.8) });
    }

    // three layers
    const second = seg(t, 16.5, 17.5);
    if (second > 0.003) {
      const swap = seg(t, 23, 24.5);
      LAYERS.forEach((L, i) => {
        const y = 210 + i * 150;
        const al = seg(t, 17 + i * 1.3, 18 + i * 1.3);
        panel(ctx, { x: 360, y, w: 880, h: 120, accent: L.accent, alpha: al, glow: i === 0 ? swap : 0 });
        text(ctx, L.key, 390, y + 36, { font: font.mono, size: 14, weight: 500, color: L.accent, tracking: 2, alpha: al });
        text(ctx, L.title, 390, y + 76, { font: font.sans, size: 26, weight: 500, color: color.ink, alpha: al });
        if (i > 0) text(ctx, L.sub, 1210, y + 76, { font: font.mono, size: 15, color: color.muted, align: 'right', alpha: al });
      });
      // the app layer: a chat window slides out, a script slides in
      const app = seg(t, 17, 18);
      const chatX = lerp(980, 700, swap);
      icon(ctx, 'person', chatX, 264, 36, C.human, app * (1 - swap));
      text(ctx, 'chat window', chatX + 32, 271, { font: font.mono, size: 17, color: C.human, alpha: app * (1 - swap) });
      const scriptX = lerp(1260, 930, swap);
      icon(ctx, 'terminal', scriptX, 264, 36, C.out, swap);
      text(ctx, 'your Python script', scriptX + 32, 271, { font: font.mono, size: 17, color: C.out, alpha: swap });
      for (let i = 0; i < 2; i++) connector(ctx, [[800, 332 + i * 150], [800, 358 + i * 150]], { color: color.dim, alpha: seg(t, 18.5 + i * 1.3, 19.5 + i * 1.3) });
      wrap(ctx, 'Same model, same API. A program sends the requests instead of a person typing.', 800, 720, 820, 34, {
        ...type.body,
        size: 24,
        align: 'center',
        color: color.ink,
        alpha: seg(t, 24.5, 25.5),
      });
    }
  },
});
