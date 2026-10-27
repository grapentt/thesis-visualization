import { defineScene, seg, fade, text, color, font, C, panel, node, connector, packet, chip, icon, line, dot } from '../shared.js';

const VMS = { x: 80, y: 190, w: 620, h: 470 };
const K8S = { x: 820, y: 190, w: 700, h: 470 };
const WIRE_Y = 520;
const MACHINES = [
  { name: 'attacker', sub: '10.10.0.66', x: 162, y: 300, color: C.alert, kind: 'laptop' },
  { name: 'web-01', sub: '10.10.0.21', x: 314, y: 300, color: color.body, kind: 'server', agent: true },
  { name: 'db-01', sub: '10.10.0.22', x: 466, y: 300, color: color.body, kind: 'server', agent: true },
  { name: 'ws-01', sub: '10.10.0.40', x: 618, y: 300, color: color.body, kind: 'laptop', agent: true },
];
const SURICATA = { x: 300, y: 600 };
const LOKI = { x: 990, y: 300 };
const FLEET = { x: 990, y: 520 };
const LLM = { x: 1360, y: 410 };
const PIPE = { x: 1170, y: 770 };

export default defineScene({
  name: 'The lab',
  duration: 39,
  header: { eyebrow: 'PART 3 · THE PROJECT', title: 'The infrastructure you get' },
  narration: [
    [0, 'You get a small lab to work with. A network of virtual machines plays the organisation: a web server, a database, a workstation, and an attacker machine that runs demo attacks, or attacks you add yourselves.'],
    [10.5, 'Suricata, a network intrusion detection system, watches the traffic. It raises alerts when traffic matches one of its rules, and it records metadata about every connection. Both are shipped to Loki, a log store you can query.'],
    [21.5, 'Every machine also runs the agent of FleetDM, a device inventory. It knows each host’s operating system, installed software and patch state.'],
    [28.5, 'Loki and FleetDM run on a local Kubernetes cluster, next to a locally hosted LLM. Your pipeline sits in the middle and talks to all three, and nothing leaves the institution.'],
  ],

  draw(ctx, t) {
    // the VM network
    const v = seg(t, 0.3, 1.1);
    panel(ctx, { ...VMS, accent: color.muted, title: 'DEMO VM NETWORK', alpha: v, dash: [6, 6], fill: 'rgba(17,24,40,0.5)' });
    line(ctx, VMS.x + 40, WIRE_Y, VMS.x + VMS.w - 40, WIRE_Y, { color: color.muted, width: 2, alpha: v });
    text(ctx, 'network', VMS.x + VMS.w - 40, WIRE_Y - 10, { font: font.mono, size: 13, color: color.dim, align: 'right', alpha: v });
    MACHINES.forEach((m, i) => {
      const al = seg(t, 1 + i * 0.6, 1.6 + i * 0.6);
      line(ctx, m.x, m.y + 36, m.x, WIRE_Y, { color: color.muted, width: 2, alpha: al });
      node(ctx, { x: m.x, y: m.y, w: 136, h: 72, title: m.name, sub: m.sub, accent: m.color, alpha: al, titleSize: 18 });
      if (m.agent) {
        const ag = seg(t, 22, 22.8);
        dot(ctx, m.x + 60, m.y - 30, 7, C.fleet, ag);
      }
    });
    // demo attacks
    const attack = [[162, 336], [162, WIRE_Y], [314, WIRE_Y], [314, 336]];
    for (let k = 0; k < 3; k++) packet(ctx, attack, ((t - 4 - k * 0.6) / 2) % 1, { color: C.alert, r: 6, alpha: fade(t, 4, 4.5, 30, 31) });
    chip(ctx, 'demo attacks', 238, 470, { color: C.alert, size: 13, align: 'center', alpha: fade(t, 5, 5.6, 30, 31) });

    // Suricata on the wire
    const s = seg(t, 10.5, 11.3);
    line(ctx, SURICATA.x, WIRE_Y, SURICATA.x, SURICATA.y - 36, { color: C.alert, width: 2, alpha: s, dash: [4, 4] });
    node(ctx, { x: SURICATA.x, y: SURICATA.y, w: 250, h: 72, title: 'Suricata', sub: 'network IDS: alerts + flows', icon: 'eye', accent: C.alert, alpha: s, titleSize: 19 });

    // the cluster
    const k = seg(t, 13.5, 14.3);
    panel(ctx, { ...K8S, accent: C.loki, title: 'LOCAL KUBERNETES CLUSTER', alpha: k, dash: [6, 6], fill: 'rgba(17,24,40,0.5)' });
    node(ctx, { x: LOKI.x, y: LOKI.y, w: 260, h: 90, title: 'Loki', sub: 'logs: alerts + traffic', icon: 'db', accent: C.loki, alpha: k });
    const toLoki = [[SURICATA.x + 125, SURICATA.y], [760, SURICATA.y], [760, LOKI.y], [LOKI.x - 130, LOKI.y]];
    connector(ctx, toLoki, { color: C.loki, alpha: k, progress: seg(t, 14.3, 15.5) });
    for (let i = 0; i < 3; i++) packet(ctx, toLoki, ((t - 15.5 - i * 0.7) / 2.1) % 1, { color: C.loki, r: 6, alpha: seg(t, 15.5, 16) });
    chip(ctx, 'eve.json', 760, 360, { color: C.loki, size: 13, align: 'center', alpha: seg(t, 15.5, 16.2) });

    const f = seg(t, 22, 22.8);
    node(ctx, { x: FLEET.x, y: FLEET.y, w: 260, h: 90, title: 'FleetDM', sub: 'hosts, software, patches', icon: 'grid', accent: C.fleet, alpha: f });
    const toFleet = [[VMS.x + VMS.w - 20, 410], [FLEET.x - 130, FLEET.y]];
    connector(ctx, toFleet, { color: C.fleet, alpha: f, progress: seg(t, 22.4, 23.4), dash: [5, 6] });
    packet(ctx, toFleet, ((t - 23.4) / 1.8) % 1, { color: C.fleet, r: 6, alpha: seg(t, 23.4, 24) });
    chip(ctx, 'fleet agents', 830, 535, { color: C.fleet, size: 13, align: 'center', alpha: f });

    const l = seg(t, 28.5, 29.3);
    node(ctx, { x: LLM.x, y: LLM.y, w: 260, h: 100, title: 'Local LLM', sub: 'Ollama or vLLM, on GPU', icon: 'chip', accent: C.llm, alpha: l, glow: 0.4 });

    // the pipeline in the middle
    const p = seg(t, 30, 30.8);
    node(ctx, { x: PIPE.x, y: PIPE.y, w: 300, h: 86, title: 'your pipeline', sub: 'Python', icon: 'terminal', accent: C.out, alpha: p, glow: 0.5 });
    // up the gap between FleetDM and the LLM to Loki, straight up to FleetDM, and over to the LLM
    const links = [
      [[PIPE.x, PIPE.y - 43], [PIPE.x, LOKI.y], [LOKI.x + 134, LOKI.y]],
      [[PIPE.x - 90, PIPE.y - 43], [PIPE.x - 90, FLEET.y + 47]],
      [[PIPE.x + 100, PIPE.y - 43], [PIPE.x + 100, 690], [LLM.x, 690], [LLM.x, LLM.y + 52]],
    ];
    const cols = [C.loki, C.fleet, C.llm];
    links.forEach((pts, i) => {
      connector(ctx, pts, { color: cols[i], alpha: p, progress: seg(t, 30.5 + i * 0.5, 31.5 + i * 0.5) });
      packet(ctx, pts, ((t - 32 - i * 0.5) / 1.8) % 1, { color: cols[i], r: 5, alpha: seg(t, 32, 32.6) });
    });

    // the boundary
    const b = seg(t, 33, 34);
    panel(ctx, { x: 50, y: 165, w: 1500, h: 710, accent: C.fleet, alpha: b, dash: [10, 8], fill: 'rgba(0,0,0,0)' });
    icon(ctx, 'lock', 90, 812, 26, C.fleet, b);
    text(ctx, 'institution network: no data leaves', 116, 820, { font: font.mono, size: 16, color: C.fleet, alpha: b });
  },
});
