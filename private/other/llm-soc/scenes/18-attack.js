import { defineScene, seg, fade, lerp, text, wrap, color, font, rgba, C, panel, chip, icon, roundRect, choice } from '../shared.js';

// the 14 tactics of the Enterprise ATT&CK matrix, as short two-line labels
const TACTICS = [
  ['Recon-', 'naissance'], ['Resource', 'Development'], ['Initial', 'Access'], ['Execution', ''], ['Persistence', ''], ['Privilege', 'Escalation'], ['Defense', 'Evasion'],
  ['Credential', 'Access'], ['Discovery', ''], ['Lateral', 'Movement'], ['Collection', ''], ['Command &', 'Control'], ['Exfiltration', ''], ['Impact', ''],
];
const CELLS = [6, 5, 7, 8, 9, 8, 9, 9, 9, 6, 7, 8, 6, 8]; // techniques shown per column (a sketch, not the real counts)
const MATRIX = { x: 80, y: 180, w: 1440, cell: 24, gap: 6 };
const COL_W = (MATRIX.w - 13 * MATRIX.gap) / 14;
const colX = (i) => MATRIX.x + i * (COL_W + MATRIX.gap);
const cellY = (k) => MATRIX.y + 58 + k * (MATRIX.cell + 5);

const CANDIDATES = [
  { id: 'T1110.001', name: 'Brute Force: Password Guessing', tactic: 'Credential Access', col: 7, cell: 1 },
  { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery', col: 8, cell: 2 },
  { id: 'T1021.004', name: 'Remote Services: SSH', tactic: 'Lateral Movement', col: 9, cell: 0 },
  { id: 'none', name: 'no technique fits', tactic: '', col: -1, cell: -1 },
];
// how strongly the model leans to each candidate, per context (illustrative)
const LEAN = {
  alert: [0.21, 0.62, 0.09, 0.08],
  host: [0.39, 0.44, 0.1, 0.07],
  logs: [0.71, 0.17, 0.07, 0.05],
  both: [0.86, 0.06, 0.05, 0.03],
};
const CONTEXT_KEYS = [[0, 'alert'], [24, 'logs'], [28.5, 'both']];
const SOURCES = [
  { key: 'alert', label: 'the alert', detail: 'rule name: “SSH Scan”', color: C.alert },
  { key: 'logs', label: 'Loki log lines', detail: '214 rapid logins by libssh2 [L1–L3]', color: C.loki },
  { key: 'host', label: 'FleetDM host', detail: 'password login allowed [H3]', color: C.fleet },
];
const uses = (context, key) => key === 'alert' || context === key || context === 'both';
const HANDOVER_AT = 33;

export default defineScene({
  name: 'Step 4 · Mapping to ATT&CK',
  duration: 42,
  header: { eyebrow: 'PART 3 · STEP 4 · MAP', title: 'Which attack technique is this, if any?' },
  narration: [
    [0, 'Step four: the ATT&CK mapping. MITRE ATT&CK is a public catalogue of how real attackers operate. Its columns are tactics, the attacker’s goal at that moment. Each column lists techniques, the ways to reach that goal.'],
    [13.5, 'Many alerts do not come with a technique, so the model has to choose one, or say that none fits. Seeing only the rule name, “SSH scan”, it leans towards Network Service Discovery.'],
    [22.5, 'With the context, the picture changes: hundreds of rapid login attempts from a scripting library, against a host that accepts passwords. That is Brute Force, sub-technique Password Guessing, T1110.001, under the tactic Credential Access. The context changed the answer.'],
    [HANDOVER_AT, 'Your turn: switch the context in the control below the video. Without the host, the model is less sure. Without the logs, it falls back on the rule’s name.'],
  ],
  beats: [[13.5, 'The candidates'], [22.5, 'With context'], [HANDOVER_AT, 'Your turn']],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: switch the context the model sees, and watch its choice change.' }],
  controls: {
    context: choice('Context the model sees', { alert: 'alert only', host: '+ host', logs: '+ logs', both: '+ logs + host' }, { value: CONTEXT_KEYS, lens: true }),
  },

  draw(ctx, t, { input }) {
    const context = input.context;
    // ease between authored context switches; snap when the viewer chooses
    let lean = LEAN[context];
    const k = CONTEXT_KEYS.findLastIndex(([at]) => t >= at);
    if (k > 0 && CONTEXT_KEYS[k][1] === context) {
      const u = seg(t, CONTEXT_KEYS[k][0], CONTEXT_KEYS[k][0] + 1.2);
      lean = LEAN[CONTEXT_KEYS[k - 1][1]].map((v, i) => lerp(v, LEAN[context][i], u));
    }
    const top = lean.indexOf(Math.max(...lean));
    const cand = seg(t, 13.5, 14.3);

    // the matrix
    TACTICS.forEach(([a, b], i) => {
      const al = seg(t, 0.4 + i * 0.08, 0.9 + i * 0.08);
      const x = colX(i);
      const hi = cand > 0 && CANDIDATES.some((c) => c.col === i);
      const tacticFocus = fade(t, 5, 5.6, 9, 9.6) * (i === 7 ? 1 : 0);
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.fillStyle = hi || tacticFocus > 0.01 ? rgba(C.attack, 0.22 + 0.2 * tacticFocus) : 'rgba(138,150,173,0.1)';
      roundRect(ctx, x, MATRIX.y, COL_W, 48, 5);
      ctx.fill();
      ctx.restore();
      text(ctx, a, x + COL_W / 2, MATRIX.y + (b ? 20 : 29), { font: font.sans, size: 12.5, weight: 500, color: hi ? C.attack : color.body, align: 'center', alpha: al });
      if (b) text(ctx, b, x + COL_W / 2, MATRIX.y + 37, { font: font.sans, size: 12.5, weight: 500, color: hi ? C.attack : color.body, align: 'center', alpha: al });
      for (let c = 0; c < CELLS[i]; c++) {
        const candidate = CANDIDATES.findIndex((cd) => cd.col === i && cd.cell === c);
        const isTop = candidate === top && candidate >= 0;
        const techFocus = fade(t, 9, 9.6, 13, 13.6) * (i === 7 && c === 1 ? 1 : 0);
        ctx.save();
        ctx.globalAlpha *= al * seg(t, 1 + c * 0.1, 1.5 + c * 0.1);
        ctx.fillStyle = candidate >= 0 && cand > 0 ? rgba(C.attack, isTop ? 0.9 : 0.35) : techFocus > 0.01 ? rgba(C.attack, 0.6 * techFocus) : 'rgba(138,150,173,0.16)';
        if (isTop && cand > 0) {
          ctx.shadowColor = C.attack;
          ctx.shadowBlur = 16;
        }
        roundRect(ctx, x + 3, cellY(c), COL_W - 6, MATRIX.cell, 4);
        ctx.fill();
        ctx.restore();
        if (candidate >= 0 && cand > 0) text(ctx, CANDIDATES[candidate].id.split('.')[0], x + COL_W / 2, cellY(c) + 17, { font: font.mono, size: 12, weight: 600, color: isTop ? color.bg : C.attack, align: 'center', alpha: cand });
      }
    });

    // tactic and technique, explained
    const ex1 = fade(t, 5, 5.6, 13, 13.6);
    text(ctx, 'tactic = the goal (why)', colX(4), 540, { font: font.sans, size: 24, color: C.attack, alpha: ex1 });
    text(ctx, 'e.g. Credential Access: obtain passwords', colX(4), 572, { font: font.mono, size: 15, color: color.muted, alpha: ex1 });
    const ex2 = fade(t, 9, 9.6, 13, 13.6);
    text(ctx, 'technique = the way (how)', colX(4), 630, { font: font.sans, size: 24, color: C.attack, alpha: ex2 });
    text(ctx, 'e.g. T1110 Brute Force: try many passwords', colX(4), 662, { font: font.mono, size: 15, color: color.muted, alpha: ex2 });
    text(ctx, 'about 200 techniques in all, many with sub-techniques', colX(4), 720, { font: font.mono, size: 15, color: color.muted, alpha: ex2 });

    // what the model sees
    const src = cand;
    panel(ctx, { x: 80, y: 520, w: 560, h: 320, accent: color.muted, title: 'CONTEXT THE MODEL SEES', alpha: src });
    SOURCES.forEach((s, i) => {
      const on = uses(context, s.key);
      const y = 590 + i * 82;
      icon(ctx, on ? 'check' : 'cross', 116, y, 22, on ? s.color : color.dim, src);
      text(ctx, s.label, 142, y + 2, { font: font.sans, size: 21, weight: 500, color: on ? color.ink : color.dim, alpha: src });
      text(ctx, s.detail, 142, y + 30, { font: font.mono, size: 14, color: on ? s.color : color.dim, alpha: src });
    });

    // the model's leaning
    const X = 690;
    panel(ctx, { x: X, y: 520, w: 830, h: 320, accent: C.attack, title: 'THE MODEL’S CHOICE  (ILLUSTRATIVE)', alpha: cand });
    CANDIDATES.forEach((c, i) => {
      const y = 590 + i * 58;
      const isTop = i === top;
      text(ctx, c.id, X + 26, y + 6, { font: font.mono, size: 16, weight: 600, color: isTop ? C.attack : color.body, alpha: cand });
      text(ctx, c.name, X + 140, y - 2, { font: font.sans, size: 17, color: isTop ? color.ink : color.muted, alpha: cand });
      if (c.tactic) text(ctx, c.tactic, X + 140, y + 18, { font: font.mono, size: 12.5, color: color.dim, alpha: cand });
      const w = 230 * lean[i];
      ctx.save();
      ctx.globalAlpha *= cand;
      ctx.fillStyle = isTop ? C.attack : color.dim;
      roundRect(ctx, X + 480, y - 10, Math.max(6, w), 20, 6);
      ctx.fill();
      ctx.restore();
      text(ctx, `${Math.round(lean[i] * 100)} %`, X + 492 + w, y + 6, { font: font.mono, size: 15, color: color.muted, alpha: cand });
    });
    chip(ctx, `"technique": "${CANDIDATES[top].id}"`, X + 26, 812, { color: C.attack, size: 15, alpha: cand });
    wrap(ctx, top === 0 ? 'context changed the answer' : 'the rule’s name decides', X + 520, 818, 300, 22, { font: font.mono, size: 14, color: top === 0 ? C.fleet : C.alert, alpha: cand * seg(t, 15, 16) });
  },
});
