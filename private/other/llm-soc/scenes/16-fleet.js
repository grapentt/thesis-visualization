import { defineScene, seg, fade, lin, text, color, font, rgba, C, panel, codeBlock, icon, line } from '../shared.js';

const CODE = `def fleet_host(ip):
    found = fleet.get("/api/v1/fleet/hosts", params={"query": ip})
    host_id = found.json()["hosts"][0]["id"]
    d = fleet.get(f"/api/v1/fleet/hosts/{host_id}").json()["host"]
    return {
        "hostname": d["hostname"],
        "os": d["os_version"],
        "software": [s["name"] + " " + s["version"] for s in d["software"]],
        "policies": {p["name"]: p["response"] for p in d["policies"]},
    }`;

const CODE_FOCUS = [
  [3, 5.5, 1],
  [5.5, 8.5, { from: 2, to: 3 }],
];

const CARD = { x: 900, y: 175, w: 620 };
const ROWS = [
  { key: 'OS', value: 'Ubuntu 22.04.3 LTS', at: 9.5 },
  { key: 'label', value: 'public web server', at: 10.3 },
  { key: 'software', value: 'openssh-server 8.9p1-3ubuntu0.10', at: 11.1, hi: C.out },
  { key: '', value: 'apache2 2.4.52 · mysql-server 8.0.35', at: 11.5 },
  { key: '', value: '… 1,211 more packages', at: 11.8, dim: true },
  { key: 'policy', value: '✓  automatic security updates', at: 13, color: C.fleet },
  { key: '', value: '✗  SSH password login disabled', at: 13.8, color: C.alert, hi: C.alert },
];
const COMPARE = [
  ['no SSH server installed', 'the alert is noise', color.muted],
  ['SSH, password login off', 'guessing cannot succeed', C.out],
  ['SSH, password login on', 'a real risk: web-01', C.alert],
];

export default defineScene({
  name: 'Step 2b · The host from FleetDM',
  duration: 29,
  header: { eyebrow: 'PART 3 · STEP 2 · RETRIEVE', title: 'Which machine was hit?' },
  narration: [
    [0, 'Step two, part two: which machine was hit? We look up the destination address in FleetDM through its REST API, then fetch that host’s details.'],
    [9.2, 'Now the model can learn that 10.10.0.21 is web-01, an Ubuntu web server with OpenSSH installed, and that one of Fleet’s policy checks, “SSH password login disabled”, is failing on it. Password guessing could actually work on this machine.'],
    [20.5, 'The same alert against a machine without SSH, or with password login switched off, would mean much less. The asset turns a generic alert into a specific risk.'],
  ],

  draw(ctx, t) {
    const cf = CODE_FOCUS.find(([s, e]) => t >= s && t < e);
    codeBlock(ctx, CODE, {
      x: 80,
      y: 175,
      w: 780,
      size: 15,
      title: 'retrieve.py',
      accent: C.fleet,
      activeColor: C.fleet,
      alpha: seg(t, 0.3, 0.9),
      chars: Math.floor(lin(t, 0.6, 3) * CODE.length),
      active: cf ? cf[2] : t > 15 && t < 19 ? { from: 5, to: 8 } : null,
      focus: cf ? fade(t, cf[0], cf[0] + 0.3, cf[1] - 0.3, cf[1]) : fade(t, 15, 15.3, 18.7, 19),
    });

    // the host card
    const c = seg(t, 8.6, 9.3);
    const h = 90 + ROWS.length * 40;
    panel(ctx, { x: CARD.x, y: CARD.y, w: CARD.w, h, accent: C.fleet, alpha: c });
    icon(ctx, 'server', CARD.x + 44, CARD.y + 46, 40, C.fleet, c);
    text(ctx, 'web-01', CARD.x + 84, CARD.y + 46, { font: font.sans, size: 26, weight: 500, color: color.ink, alpha: c });
    text(ctx, '10.10.0.21', CARD.x + 84, CARD.y + 70, { font: font.mono, size: 14, color: color.muted, alpha: c });
    line(ctx, CARD.x + 20, CARD.y + 88, CARD.x + CARD.w - 20, CARD.y + 88, { alpha: c });
    ROWS.forEach((r, i) => {
      const al = seg(t, r.at, r.at + 0.5);
      const y = CARD.y + 120 + i * 40;
      if (r.hi) {
        ctx.save();
        ctx.globalAlpha *= seg(t, r.at + 1.5, r.at + 2.2);
        ctx.fillStyle = rgba(r.hi, 0.14);
        ctx.fillRect(CARD.x + 120, y - 20, CARD.w - 136, 32);
        ctx.restore();
      }
      text(ctx, r.key, CARD.x + 24, y, { font: font.mono, size: 14, color: color.muted, alpha: al });
      text(ctx, r.value, CARD.x + 130, y, { font: font.mono, size: 15.5, color: r.color ?? (r.dim ? color.muted : color.body), alpha: al });
    });

    // same alert, different host
    const m = seg(t, 20.5, 21.3);
    text(ctx, 'THE SAME ALERT ON …', 80, 630, { ...{ font: font.mono, size: 15, weight: 500, tracking: 2 }, color: color.muted, alpha: m });
    COMPARE.forEach(([host, meaning, col], i) => {
      const al = seg(t, 21 + i * 1.2, 21.6 + i * 1.2);
      const x = 80 + i * 490;
      panel(ctx, { x, y: 655, w: 460, h: 150, accent: col, alpha: al, glow: i === 2 ? 0.5 : 0 });
      text(ctx, host, x + 26, 710, { font: font.sans, size: 21, color: color.ink, alpha: al });
      text(ctx, `→ ${meaning}`, x + 26, 760, { font: font.sans, size: 21, weight: 500, color: col, alpha: al });
    });
  },
});
