import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, rgba, roundRect } from '../../../kit.js';
import { POSE, HORIZONTAL, SCORE_W, SCORE_P, INTER, PEROXIDE_MOL, moleculeThumb, tagCard, toyStamp, mixHex } from '../shared.js';
import { drawMaster, diagramCamera, FIBRE_SITES, PROFILE_SITES } from '../diagram.js';
import { buildPeroxide, DEG } from '../toy.js';
import { zPoseGrid, jointChain, fibreProfiles, affinity } from '../data.js';

const THETA0 = 104.52;
const RIGHT = 860;
const PANEL = { x: 935, w: 575 }; // plot area inside the right column x 880–1520
const CAM = diagramCamera();
const z = zPoseGrid, m = z.marginals;
const I0 = z.theta.indexOf(THETA0);

// beats (scene-local seconds)
const RESCALE = [0.8, 3.8];
const DRAIN = [5, 8];
const MORPH = [15, 23];
const AFFINITY = 40;

const Z_POSE = tex(String.raw`Z_{\rm pose}(b_A,b_B) = \int_{\rm fibre} w\ d(\text{Haar}\otimes\rho)`, 'Z_pose(b_A, b_B) = ∫_fibre w d(Haar ⊗ ρ)');
const SHAPES = tex(String.raw`p(b_A,b_B) = \bar p_A(b_A)\,\bar p_B(b_B)\,Z_{\rm pose}(b_A,b_B)/Z_w`, 'p(b_A, b_B) = p̄_A(b_A) p̄_B(b_B) Z_pose(b_A, b_B)/Z_w');
const TOTAL = tex(String.raw`Z_w = \mathbb E_\nu\big[e^{-\beta U_{\rm int}}\big]`, 'Z_w = E_ν[e^{−βU_int}]');

// λ = 1 centre-line profiles: own scale (as scene 07 left them) → true weight (Z_pose relative to the largest)
const PROFILES = fibreProfiles.map((s) => s.profiles.at(-1));
const OWN_MAX = PROFILES.map((p) => Math.max(...p.p));
const TRUE_RATIO = z.profileMass.map((mass, k) => (mass * OWN_MAX[k]) / OWN_MAX[z.profileMass.indexOf(1)]);
const SIDE_SHARE = Math.round(1 / Math.min(...z.profileMass));

// foot bars ∝ log Z_pose at all 18 fibres (drawMaster draws them far to near)
const BAR = 0.05; // fibre units per unit of log Z
const SITES = FIBRE_SITES.theta.flatMap((theta, i) => FIBRE_SITES.tau.map((tau, j) => ({ site: [theta, tau], logZ: z.fibreLogZ[i][j], order: i * 6 + j })));
const isProfileSite = ([a, b]) => PROFILE_SITES.some(([c, d]) => c === a && d === b);

// floor: lone → pair, interpolated in log density
const FLOOR_AT = (s) => z.floor.lone.map((row, i) => row.map((p, j) => Math.exp((1 - s) * Math.log(p) + s * Math.log(z.floor.pair[i][j]))));
const FLOORS = Array.from({ length: 41 }, (_, k) => FLOOR_AT(k / 40));

// |τ| marginals: fold the per-degree densities on −179.5 … 179.5 onto 0.5 … 179.5
const fold = (p) => p.slice(180).map((v, k) => v + p[179 - k]);
const ABS_TAU = { x: m.tau.slice(180), lone: fold(m.tauLone), pair: fold(m.tauPair) };
const deg = (v) => `${Math.round(v)}°`;
const deg1 = (v) => `${v.toFixed(1)}°`;
const minus = (v, d = 2) => v.toFixed(d).replace('-', '−');

export default defineScene({
  name: 'Induced fit',
  duration: 56,
  narration: [
    [0, 'Now weigh each fibre. Add up the weight over all its poses, and you get one number for each floor point: Z-pose, how well these two own shapes can bind.'],
    [14, 'The floor is reweighted by it. In this toy, peroxide binds more strongly near cis, so inside the pair its torsion shifts by about ten degrees.'],
    [26, 'Simulating the pair directly gives the same answer. Water\'s stiff angle barely moves: about a degree.'],
    [33.5, 'Binding invents no new shapes; it amplifies shapes the lone molecules already visit.'],
    [40, 'Finally, the total weight is the affinity. Only a tiny fraction of random poses bind, so this average is noisy, and its value depends on the spring: a standard state.'],
  ],
  header: { eyebrow: '08 · INDUCED FIT', title: 'Binding reweights the shapes' },

  draw(ctx, t) {
    drawDiagram(ctx, t);
    drawNotes(ctx, t);
    drawLogZPanel(ctx, t, fade(t, 14.6, 15.4, 29.2, 29.8));
    drawThetaPanel(ctx, t, fade(t, 29.8, 30.6, 39.6, 40.2));
    drawTauPanel(ctx, t, fade(t, 26.2, 27, 39.6, 40.2));
    drawRunningMean(ctx, t, seg(t, 40.6, 41.4));
    tagCard(ctx, {
      x: 880, y: 640, width: 640, tag: 'AFFINITY', accent: INTER,
      body: 'Z_w = Z/Z_ν: a ratio of partition functions, up to the standard state fixed by the restraint.',
      alpha: seg(t, 49.5, 50.3), progress: lin(t, 49.8, 52.5),
    });
    toyStamp(ctx, seg(t, 0.5, 1.3));
  },
});

/** The master diagram: profiles rescaled to their true weight, drained into foot bars, the floor reweighted. */
function drawDiagram(ctx, t) {
  const show = seg(t, 0, 0.8);
  const rescale = seg(t, ...RESCALE);
  const drain = seg(t, ...DRAIN);
  const morph = seg(t, ...MORPH);
  const profiles = PROFILES.map((profile, k) => {
    const ratio = 1 + (TRUE_RATIO[k] - 1) * rescale;
    // draining: the profile sinks into the floor as its bar grows
    const u = profile.u.map((v) => (v + 1) * (1 - drain) - 1);
    return { site: PROFILE_SITES[k], profile: { ...profile, u }, pMax: OWN_MAX[k], mass: ratio, alpha: 1 - seg(t, DRAIN[1] - 0.6, DRAIN[1]) };
  });
  const footBars = SITES.map(({ site, logZ, order: k }) => {
    const grow = isProfileSite(site) ? drain : seg(t, 8.4 + 0.06 * k, 9.4 + 0.06 * k);
    return { site, height: BAR * logZ * grow, alpha: 1 - 0.55 * seg(t, MORPH[0] - 1, MORPH[0]) + 0.35 * seg(t, AFFINITY, AFFINITY + 1) };
  });
  drawMaster(ctx, {
    camera: CAM,
    alpha: show,
    floor: { density: FLOORS[Math.round(40 * morph)], alpha: 1 },
    fibres: { alpha: 1, highlight: PROFILE_SITES.map((s) => [...s, 1 - seg(t, DRAIN[1] - 0.6, DRAIN[1])]) }, // fades with the profiles
    profiles: t < DRAIN[1] ? profiles : [],
    footBars,
  });

  // one caption line over the diagram, above the fibres' own caption
  const first = 'drawn with their true weight';
  const lead = show * fade(t, RESCALE[0], RESCALE[0] + 0.6, DRAIN[0], DRAIN[0] + 0.5);
  text(ctx, first, 60, 182, { ...type.note, color: POSE, alpha: lead });
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const indent = ctx.measureText(first).width;
  ctx.restore();
  text(ctx, `: the side fibres hold 1/${SIDE_SHARE} of the cis fibre's weight`, 60 + indent, 182, { ...type.note, color: POSE, alpha: show * fade(t, RESCALE[1] - 0.6, RESCALE[1], DRAIN[0], DRAIN[0] + 0.5) });
  text(ctx, "orange foot bars: log Z_pose, where Z_pose = the fibre's total weight", 60, 182, { ...type.note, color: INTER, alpha: show * seg(t, DRAIN[0] + 0.4, DRAIN[0] + 1.2) });

  // legend under the diagram
  const chips = [['pose → on the fibres', POSE], ['shapes → on the floor', HORIZONTAL], ['affinity → the total', INTER]];
  const a = seg(t, 53, 53.8);
  let x = 60;
  for (const [label, tint] of chips) x += chip(ctx, label, x, 866, tint, a) + 14;
}

/** Formulas and readouts in the notes area (x 860–1520, y 200–360). */
function drawNotes(ctx, t) {
  const first = fade(t, 2, 2.8, AFFINITY - 0.4, AFFINITY + 0.2);
  Z_POSE.draw(ctx, RIGHT, 228, { size: 26, alpha: first });
  text(ctx, 'Haar = uniformly random orientation', RIGHT, 270, { ...type.note, alpha: first });
  SHAPES.draw(ctx, RIGHT, 308, { size: 26, alpha: fade(t, 14.4, 15.2, AFFINITY - 0.4, AFFINITY + 0.2) });
  text(ctx, 'binding selects states of the lone ensembles, amplified by Z_pose', RIGHT, 356, { ...type.body, size: 20, color: color.ink, alpha: fade(t, 33.8, 34.6, AFFINITY - 0.4, AFFINITY + 0.2) });
  wrap(ctx, 'stiff bonds at rest; with truly rigid bonds a τ-dependent volume factor would appear (R4d)', 880, 832, 640, 21, { ...type.note, alpha: fade(t, 34.4, 35.2, AFFINITY - 0.4, AFFINITY + 0.2) });

  // affinity
  TOTAL.draw(ctx, RIGHT, 228, { size: 28, alpha: seg(t, AFFINITY + 0.6, AFFINITY + 1.4) });
  const mono = { font: font.mono, size: 17, color: color.ink };
  // in narration order: rare binding, then the settled affinity, then its dependence on the spring
  text(ctx, `effective sample size: ${(100 * affinity.essFraction).toPrecision(2)} % of reference draws`, RIGHT, 284, { ...mono, size: 16, color: color.body, alpha: seg(t, 43.5, 44.3) });
  text(ctx, `ΔG = −kT log Z_w = ${minus(affinity.dG[2.5])} kcal/mol (s₀ = 2.5 Å)`, RIGHT, 314, { ...mono, alpha: seg(t, 48.3, 49.1) });
  text(ctx, `s₀ = 2.0 Å: ${minus(affinity.dG[2])} · s₀ = 3.0 Å: ${minus(affinity.dG[3])}`, RIGHT, 342, { ...mono, size: 15, color: color.muted, alpha: seg(t, 49.3, 50.1) });
}

// ---- right-column panels -------------------------------------------------------------

/** Panel frame: title, optional readout line, L axes and x ticks. Returns the plot box. */
function panel(ctx, y0, height, { title, readout = null, ticks, alpha }) {
  const box = { x: PANEL.x, y: y0 + (readout ? 56 : 34), w: PANEL.w, h: height - (readout ? 56 : 34) - 34 };
  text(ctx, title, 880, y0 + 16, { font: font.mono, size: 16, color: color.ink, alpha });
  if (readout) text(ctx, readout, 880, y0 + 42, { font: font.mono, size: 16, color: color.body, alpha });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(box.x, box.y);
  ctx.lineTo(box.x, box.y + box.h);
  ctx.lineTo(box.x + box.w, box.y + box.h);
  ctx.stroke();
  ctx.restore();
  for (const [x, label] of ticks) text(ctx, label, box.x + x * box.w, box.y + box.h + 22, { font: font.mono, size: 15, color: color.muted, align: 'center', alpha });
  return box;
}

const curve = (ctx, xs, ys, toX, toY) => {
  ctx.beginPath();
  xs.forEach((x, i) => (i ? ctx.lineTo(toX(x), toY(ys[i])) : ctx.moveTo(toX(x), toY(ys[i]))));
};

/** Lone density (outline), in the pair (orange fill) and the chain's histogram (muted bars). */
function marginalPlot(ctx, box, { xs, lone, pair, hist, lo, hi, tint, alpha }) {
  const top = 1.12 * Math.max(...lone, ...pair, ...hist.density);
  const toX = (v) => box.x + ((v - lo) / (hi - lo)) * box.w;
  const toY = (p) => box.y + box.h - (p / top) * box.h;
  const bw = (hist.hi - hist.lo) / hist.density.length;
  ctx.save();
  ctx.globalAlpha *= alpha;
  curve(ctx, xs, pair, toX, toY);
  ctx.lineTo(toX(xs.at(-1)), box.y + box.h);
  ctx.lineTo(toX(xs[0]), box.y + box.h);
  ctx.closePath();
  ctx.fillStyle = rgba(INTER, 0.45);
  ctx.fill();
  // the joint chain's histogram over the fill: muted outlines only, so the orange fill stays orange
  ctx.strokeStyle = color.muted;
  ctx.lineWidth = 1.2;
  hist.density.forEach((p, k) => {
    const x0 = toX(hist.lo + k * bw), x1 = toX(hist.lo + (k + 1) * bw);
    ctx.strokeRect(x0 + 1, toY(p), x1 - x0 - 2, box.y + box.h - toY(p));
  });
  curve(ctx, xs, pair, toX, toY);
  ctx.strokeStyle = INTER;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  curve(ctx, xs, lone, toX, toY);
  ctx.strokeStyle = tint;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  return toX;
}

/** Legend row at the right of a panel title: lone outline, pair fill, simulated bars. */
function legend(ctx, y, tint, alpha) {
  const items = [['lone', tint, 'line'], ['pair', INTER, 'fill'], ['simulated', color.muted, 'bar']];
  let x = 1520;
  for (const [label, c, kind] of items.reverse()) {
    ctx.save();
    ctx.font = `400 15px ${font.mono}`;
    const w = ctx.measureText(label).width;
    ctx.restore();
    x -= w;
    text(ctx, label, x, y, { ...type.note, color: color.body, alpha });
    x -= 24;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (kind === 'line') {
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 18, y - 5);
      ctx.stroke();
    } else {
      if (kind === 'fill') {
        ctx.fillStyle = rgba(c, 0.5);
        ctx.fillRect(x, y - 12, 18, 12);
      }
      ctx.strokeStyle = c;
      ctx.lineWidth = kind === 'fill' ? 2 : 1.2;
      ctx.strokeRect(x, y - 12, 18, 12);
    }
    ctx.restore();
    x -= 16;
  }
}

/** Panel 1 (14–29.8 s): log Z_pose against τ at θ₀, estimates ± 1 s.e. and the fit. */
function drawLogZPanel(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const ticks = [0, 60, 120, 180].map((v) => [v / 180, `${v}°`]);
  const box = panel(ctx, 380, 200, { title: 'log Z_pose at θ₀ against peroxide\'s torsion τ', ticks, alpha });
  text(ctx, 'in this toy model', 1520, 396, { ...type.note, align: 'right', alpha });
  text(ctx, 'dots: grid estimates ± 1 s.e. · line: fit', 1520, 428, { ...type.note, color: color.muted, align: 'right', alpha });
  const lo = 2, hi = 9;
  const toX = (v) => box.x + (v / 180) * box.w;
  const toY = (v) => box.y + box.h - ((v - lo) / (hi - lo)) * box.h;
  for (const v of [2, 4, 6, 8]) text(ctx, String(v), box.x - 10, toY(v) + 5, { font: font.mono, size: 15, color: color.muted, align: 'right', alpha });
  ctx.save();
  ctx.globalAlpha *= alpha;
  const xs = Array.from({ length: 181 }, (_, k) => k);
  curve(ctx, xs, xs.map((s) => z.fit(THETA0, s)), toX, toY);
  ctx.strokeStyle = INTER;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = color.ink;
  ctx.fillStyle = color.ink;
  ctx.lineWidth = 1.5;
  z.tau.forEach((s, j) => {
    const v = z.logZ[I0][j], e = z.se[I0][j];
    ctx.beginPath();
    ctx.moveTo(toX(s), toY(v - e));
    ctx.lineTo(toX(s), toY(v + e));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(toX(s), toY(v), 3.5, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.restore();
  // peroxide at cis (below the curve), at its lone minimum and at trans (above it): label over each
  for (const [s, label, dy] of [[0, '0° cis', 60], [112, '112°', -40], [180, '180° trans', -40]]) {
    const x = Math.min(Math.max(toX(s), box.x + 40), 1470), y = toY(z.fit(THETA0, s)) + dy;
    moleculeThumb(ctx, x, y, buildPeroxide({ tau: s * DEG }), PEROXIDE_MOL, { scale: 20, yaw: 1.25, pitch: 0.25, alpha });
    text(ctx, label, x, y - 24, { ...type.note, align: 'center', alpha });
  }
}

/** Panel 2 (26–40 s): peroxide's |τ| marginal, lone vs in the pair, with the joint chain. */
function drawTauPanel(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const ticks = [0, 60, 112, 180].map((v) => [v / 180, `${v}°`]);
  const readout = `mean |τ|: lone ${deg(m.meanAbsTau.lone)} → pair ${deg(m.meanAbsTau.pair)} (formula) · ${deg(jointChain.meanAbsTau)} (simulated)`;
  const box = panel(ctx, 600, 200, { title: 'peroxide torsion |τ|', readout, ticks, alpha });
  legend(ctx, 616, SCORE_P, alpha);
  marginalPlot(ctx, box, { xs: ABS_TAU.x, lone: ABS_TAU.lone, pair: ABS_TAU.pair, hist: jointChain.absTauHistogram, lo: 0, hi: 180, tint: SCORE_P, alpha });
}

/** Panel 1 again (29.8–40 s): water's θ marginal, lone vs in the pair, with the joint chain. */
function drawThetaPanel(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const ticks = [92, 97, THETA0, 112, 117].map((v) => [(v - 92) / 25, v === THETA0 ? '104.5°' : `${v}°`]);
  const readout = `mean θ: ${deg1(m.meanTheta.lone)} → ${deg1(m.meanTheta.pair)} (formula) · ${deg1(jointChain.meanTheta)} (simulated)`;
  const box = panel(ctx, 380, 200, { title: 'water angle θ', readout, ticks, alpha });
  legend(ctx, 396, SCORE_W, alpha);
  marginalPlot(ctx, box, { xs: m.theta, lone: m.thetaLone, pair: m.thetaPair, hist: jointChain.thetaHistogram, lo: 92, hi: 117, tint: SCORE_W, alpha });
}

/** Panel 1 last (40–56 s): running mean of w over the plain reference draws, ± 1 s.e. */
function drawRunningMean(ctx, t, alpha) {
  if (alpha <= 0.003) return;
  const { counts, runningMean, se, Zw, seZw } = affinity;
  const lo = 2, hi = Math.log10(counts.at(-1)), top = 200;
  const ticks = [2, 3, 4, 5].map((e) => [(e - lo) / (hi - lo), `10${'²³⁴⁵'[e - 2]}`]);
  const box = panel(ctx, 380, 220, { title: 'Z_w: running mean over plain reference draws', ticks, alpha });
  text(ctx, 'number of draws', 1520, 396, { ...type.note, align: 'right', alpha });
  const toX = (n) => box.x + ((Math.log10(n) - lo) / (hi - lo)) * box.w;
  const toY = (v) => box.y + box.h - (Math.min(v, top) / top) * box.h;
  for (const v of [0, 100, 200]) text(ctx, String(v), box.x - 10, toY(v) + 5, { font: font.mono, size: 15, color: color.muted, align: 'right', alpha });
  const shown = Math.max(2, Math.round(lin(t, 41.5, 48) * counts.length));
  const n = counts.slice(0, shown);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.rect(box.x, box.y - 4, box.w + 4, box.h + 4);
  ctx.clip();
  // final value, dashed: shown once the running mean has reached it
  const settled = seg(t, 47.5, 48.3);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = rgba(INTER, 0.6 * settled);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(box.x, toY(Zw));
  ctx.lineTo(box.x + box.w, toY(Zw));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  n.forEach((c, i) => (i ? ctx.lineTo(toX(c), toY(runningMean[i] + se[i])) : ctx.moveTo(toX(c), toY(runningMean[i] + se[i]))));
  for (let i = n.length - 1; i >= 0; i--) ctx.lineTo(toX(n[i]), toY(Math.max(0, runningMean[i] - se[i])));
  ctx.closePath();
  ctx.fillStyle = rgba(mixHex(INTER, '#ffffff', 0.3), 0.25);
  ctx.fill();
  curve(ctx, n, runningMean, toX, toY);
  ctx.strokeStyle = INTER;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  text(ctx, `${Zw.toFixed(1)} ± ${seZw.toFixed(1)}`, box.x + box.w - 4, toY(Zw) - 10, { font: font.mono, size: 15, color: INTER, align: 'right', alpha: alpha * seg(t, 47.5, 48.3) });
}

/** A pill with a coloured border. Returns its width. */
function chip(ctx, label, x, y, tint, alpha) {
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const w = ctx.measureText(label).width + 24;
  if (alpha > 0.003) {
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = rgba(tint, 0.12);
    roundRect(ctx, x, y - 14, w, 28, 14);
    ctx.fill();
    ctx.stroke();
    text(ctx, label, x + 12, y + 1, { font: font.mono, size: 15, color: tint, baseline: 'middle' });
  }
  ctx.restore();
  return w;
}
