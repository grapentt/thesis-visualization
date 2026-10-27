import { defineScene, seg, fade, lin, text, color, font, C, panel, connector, packet, codeBlock, icon, badge, brace } from '../shared.js';

const STEPS = [
  { title: 'Alert arrives', sub: 'from Suricata', icon: 'bell', color: C.alert },
  { title: 'Retrieve', sub: 'Loki + FleetDM', icon: 'search', color: C.loki },
  { title: 'Assemble', sub: 'one prompt', icon: 'doc', color: C.out },
  { title: 'Map', sub: 'ATT&CK, or none', icon: 'grid', color: C.attack },
  { title: 'Explain', sub: 'structured JSON', icon: 'chip', color: C.llm },
  { title: 'Evaluate', sub: 'vs ground truth', icon: 'check', color: C.human },
];
const X0 = 180;
const DX = 248;
const Y = 300;
const W = 210;
const H = 150;

const CODE = `def triage(alert):
    logs   = loki_context(alert, window=300)          # 2: ±5 min of traffic
    host   = fleet_host(alert["dest_ip"])             # 2: the machine that was hit
    prompt = build_prompt(alert, logs, host)          # 3
    reply  = ask_llm(SYSTEM, prompt, format=SCHEMA)   # 4 + 5
    return json.loads(reply)`;

// which code line lights up which step
const WALK = [
  [21.5, 23, 1, 1],
  [23, 24.5, 2, 1],
  [24.5, 26, 3, 2],
  [26, 28.5, 4, [3, 4]],
];

export default defineScene({
  name: 'The pipeline',
  duration: 31,
  header: { eyebrow: 'PART 3 · THE PROJECT', title: 'Six steps from alert to answer' },
  narration: [
    [0, 'The pipeline you build has six steps. An alert arrives. Your code retrieves its context from Loki and FleetDM, and assembles everything into a prompt.'],
    [10.5, 'The local LLM decides which ATT&CK technique fits, if any, and writes a structured explanation: what likely happened, whether it needs a reaction, and what to do next.'],
    [19.5, 'Finally you evaluate the answers against known ground truth. In code, the core is one short function. The next scenes walk through each step with our SSH alert.'],
  ],

  draw(ctx, t) {
    const walk = WALK.find(([a, b]) => t >= a && t < b);
    const lit = walk ? [walk[3]].flat() : [];

    STEPS.forEach((s, i) => {
      const x = X0 + i * DX;
      const at = [0.5, 3, 6.5, 10.8, 13.5, 19.5][i];
      const al = seg(t, at, at + 0.7);
      const glow = lit.includes(i) ? 1 : 0;
      panel(ctx, { x: x - W / 2, y: Y - H / 2, w: W, h: H, accent: s.color, alpha: al, glow });
      badge(ctx, i + 1, x - W / 2 + 26, Y - H / 2 + 26, { color: s.color, alpha: al, r: 14 });
      icon(ctx, s.icon, x, Y - 14, 40, s.color, al);
      text(ctx, s.title, x, Y + 36, { font: font.sans, size: 21, weight: 500, color: color.ink, align: 'center', alpha: al });
      text(ctx, s.sub, x, Y + 60, { font: font.mono, size: 13.5, color: color.muted, align: 'center', alpha: al });
      if (i > 0) connector(ctx, [[x - DX + W / 2 + 4, Y], [x - W / 2 - 4, Y]], { color: color.dim, alpha: al, progress: seg(t, at, at + 0.5) });
    });

    // the alert travels through
    const path = [[X0 - W / 2 - 40, Y - H / 2 - 22], [X0 + 5 * DX + W / 2, Y - H / 2 - 22]];
    packet(ctx, path, lin(t, 1, 17), { color: C.alert, label: 'our SSH alert', alpha: fade(t, 1, 1.5, 16.5, 17) });

    // who does what
    const groups = [
      [0, 2, 'your code', C.out, 7.5],
      [3, 4, 'the local LLM', C.llm, 14.5],
      [5, 5, 'your evaluation', C.human, 20],
    ];
    groups.forEach(([a, b, label, c, at]) => {
      const al = seg(t, at, at + 0.8);
      const x0 = X0 + a * DX - W / 2;
      const x1 = X0 + b * DX + W / 2;
      brace(ctx, x0, x1, Y + H / 2 + 14, 1, c, al, al);
      text(ctx, label, (x0 + x1) / 2, Y + H / 2 + 64, { font: font.mono, size: 16, color: c, align: 'center', alpha: al });
    });

    codeBlock(ctx, CODE, {
      x: 180,
      y: 520,
      w: 1240,
      size: 18,
      title: 'THE CORE, IN CODE',
      accent: C.out,
      alpha: seg(t, 20.5, 21.3),
      chars: Math.floor(lin(t, 20.8, 22.5) * CODE.length),
      active: walk ? walk[2] : null,
      focus: walk ? fade(t, walk[0], walk[0] + 0.3, walk[1] - 0.3, walk[1]) : 0,
    });
  },
});
