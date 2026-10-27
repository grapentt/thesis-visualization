import { defineScene, seg, fade, lin, text, wrap, type, color, font, C, node, connector, packet, codeBlock, chip, panel } from '../shared.js';

const CODE = `import requests

OLLAMA = "http://localhost:11434"

def ask_llm(system, user):
    r = requests.post(f"{OLLAMA}/api/chat", json={
        "model": "llama3.1:8b",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {"temperature": 0},
    })
    return r.json()["message"]["content"]

print(ask_llm("You are a SOC analyst. Be brief.",
              "What is TCP port 22 used for?"))`;

const BOX = { x: 70, y: 175, w: 740 };
const SCRIPT = { x: 1270, y: 250 };
const SERVER = { x: 1270, y: 450 };
const OUTPUT = 'Port 22 is the default port of SSH, which is used for encrypted remote logins.';

// [from, to, active lines, note on the side]
const FOCUS = [
  [5.5, 8, 2, 'where the model server listens'],
  [8, 10.5, { from: 5, to: 6 }, 'which model to run'],
  [10.5, 13.2, 8, 'the role and the rules'],
  [13.2, 15.4, 9, 'the actual question'],
  [15.4, 19.6, 12, '0: always the most likely token'],
  [19.8, 23.6, 5, 'send the request'],
  [23.6, 26.4, 14, 'take the text out of the JSON'],
  [26.4, 30, { from: 16, to: 17 }, 'call it like any function'],
];

export default defineScene({
  name: 'Calling an LLM from Python',
  duration: 37,
  header: { eyebrow: 'PART 1 · LLMs AS BUILDING BLOCKS', title: 'An LLM call is a few lines of Python' },
  narration: [
    [0, 'Here is the whole idea in a few lines of Python. We run the model locally with Ollama, a program that serves open models and offers an HTTP API on port 11434.'],
    [8, 'A helper function builds the request: which model to use, a system message that sets the role and the rules, the user message with the actual question, and temperature zero, so the model always takes its most likely token and the output is as repeatable as possible.'],
    [19.8, 'The request travels to the server, the model generates the answer token by token, and it comes back as JSON. We take out the text and return it.'],
    [29, 'Once ask_llm is a normal function, an LLM is a building block like any other: you can call it in a loop, feed it data, and process what it returns.'],
  ],

  draw(ctx, t) {
    const focus = FOCUS.find(([a, b]) => t >= a && t < b);
    const strength = focus ? fade(t, focus[0], focus[0] + 0.4, focus[1] - 0.4, focus[1]) : 0;
    const code = codeBlock(ctx, CODE, {
      ...BOX,
      size: 17,
      title: 'triage.py',
      accent: C.out,
      alpha: seg(t, 0.2, 0.8),
      chars: Math.floor(lin(t, 0.6, 5) * CODE.length),
      active: focus ? focus[2] : null,
      focus: strength,
    });
    if (focus) {
      const lines = typeof focus[2] === 'number' ? [focus[2]] : [focus[2].from, focus[2].to];
      const y = (code.lineY(lines[0]) + code.lineY(lines[lines.length - 1])) / 2;
      connector(ctx, [[BOX.x + BOX.w + 4, y], [BOX.x + BOX.w + 30, y]], { color: C.out, head: false, alpha: strength });
      chip(ctx, focus[3], BOX.x + BOX.w + 34, y, { color: C.out, size: 15, alpha: strength });
    }

    // the round trip
    const diagram = seg(t, 2, 3);
    node(ctx, { x: SCRIPT.x, y: SCRIPT.y, w: 300, h: 96, title: 'triage.py', sub: 'your script', icon: 'terminal', accent: C.out, alpha: diagram });
    node(ctx, { x: SERVER.x, y: SERVER.y, w: 300, h: 96, title: 'Ollama', sub: 'localhost:11434 · llama3.1:8b', icon: 'server', accent: C.llm, alpha: diagram, glow: t > 21.6 && t < 23.6 ? 1 : 0.1 });
    const down = [[SCRIPT.x - 40, SCRIPT.y + 50], [SERVER.x - 40, SERVER.y - 50]];
    const up = [[SERVER.x + 40, SERVER.y - 50], [SCRIPT.x + 40, SCRIPT.y + 50]];
    connector(ctx, down, { color: C.out, alpha: diagram });
    connector(ctx, up, { color: C.llm, alpha: diagram });
    text(ctx, 'POST /api/chat', SCRIPT.x - 60, (SCRIPT.y + SERVER.y) / 2 + 5, { font: font.mono, size: 14, color: C.out, align: 'right', alpha: diagram });
    text(ctx, 'JSON answer', SCRIPT.x + 60, (SCRIPT.y + SERVER.y) / 2 + 5, { font: font.mono, size: 14, color: C.llm, alpha: diagram });
    packet(ctx, down, lin(t, 20.2, 21.8), { color: C.out, label: 'request' });
    packet(ctx, up, lin(t, 23.4, 25), { color: C.llm, label: 'response' });
    // tokens being generated inside the server
    const gen = fade(t, 21.8, 22, 23.4, 23.6);
    for (let k = 0; k < 5; k++) chip(ctx, ['Port', '22', 'is', 'the', '…'][k], SERVER.x - 130 + k * 56, SERVER.y + 76, { color: C.llm, size: 13, alpha: gen * seg(t, 21.8 + k * 0.25, 22 + k * 0.25) });

    // the terminal
    const term = seg(t, 26.6, 27.2);
    panel(ctx, { x: 960, y: 590, w: 560, h: 150, accent: color.line, title: 'TERMINAL', alpha: term, fill: 'rgba(10,15,26,0.96)' });
    text(ctx, '$ python triage.py', 984, 650, { font: font.mono, size: 16, color: color.muted, alpha: term });
    wrap(ctx, OUTPUT, 984, 682, 510, 24, { font: font.mono, size: 16, color: color.ink, alpha: term, chars: Math.floor(lin(t, 27.2, 28.8) * OUTPUT.length) });

    wrap(ctx, 'ask_llm(…) is now an ordinary function you can use anywhere in your code.', 960, 800, 560, 30, { ...type.body, size: 21, color: C.out, alpha: seg(t, 30, 31) });
  },
});
