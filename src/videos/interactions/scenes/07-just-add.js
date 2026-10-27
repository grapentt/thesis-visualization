import { defineScene, seg, fade, lin, text, wrap, type, font, color, tex, camera, roundRect, polygon3, polyline3, rgba } from '../../../kit.js';
import { SCORE_W, SCORE_P, INTER, POSE, RESTRAINT, PAIR_MOL, WATER_MOL, PEROXIDE_MOL, drawMol, drawHalo, drawHBond, drawPadlock, drawRestraint, tagCard, toyStamp } from '../shared.js';
import { drawMaster, diagramCamera, PROFILE_SITES, toA, toB, toF, diagPoint } from '../diagram.js';
import { referenceDraws, jointChain, referencePictures, fibreProfiles, zPoseGrid, DOCKED, closestOH, hBond } from '../data.js';
import { buildWater, buildPeroxide, bisector, centroid } from '../toy.js';

const RIGHT = 860;
const CUE = { add: 0, sample: 9.5, chance: 20, spring: 28, picture: 42.5, real: 51, weight: 62.5, temper: 75.5 };
const TEMPER = [76, 84];
const POP_AT = 82.5, VERDICT = 80.5;

const INDEPENDENT = tex(
  String.raw`\log(\mu_{W}\otimes\mu_{P}) = \log\mu_W + \log\mu_P\ \Rightarrow\ s_W\oplus s_P = \nabla\log\big(\mu_{W,t}\otimes\mu_{P,t}\big)`,
  'log(μ_W ⊗ μ_P) = log μ_W + log μ_P ⇒ s_W ⊕ s_P = ∇log(μ_W,t ⊗ μ_P,t)',
);
const SAMPLED = tex(String.raw`\text{sampled with }\ s_W\oplus s_P`, 'sampled with s_W ⊕ s_P');
const PLUS_RHO = tex(String.raw`+\ \nabla\log\rho`, '+ ∇log ρ');
const S_W = tex('s_W', 's_W'), S_P = tex('s_P', 's_P');
const REFERENCE = tex(
  String.raw`\nu = \mu_W\otimes\mu_P\otimes\rho,\qquad \rho(r)\propto e^{-|r|^2/2s_0^2},\ s_0 = 2.5\ \text{Å}`,
  'ν = μ_W ⊗ μ_P ⊗ ρ,   ρ(r) ∝ exp(−|r|²/2s₀²), s₀ = 2.5 Å',
);
const BOLTZMANN = [
  { part: tex(String.raw`e^{-\beta(U_W+U_P+U_{\rm int})} =`, 'e^(−β(U_W + U_P + U_int)) =') },
  { part: tex(String.raw`e^{-\beta U_W}`, 'e^(−βU_W)'), colour: SCORE_W },
  { part: tex(String.raw`\cdot`, '·') },
  { part: tex(String.raw`e^{-\beta U_P}`, 'e^(−βU_P)'), colour: SCORE_P },
  { part: tex(String.raw`\cdot`, '·') },
  { part: tex(String.raw`e^{-\beta U_{\rm int}}`, 'e^(−βU_int)'), colour: INTER },
];
const TARGET = tex(String.raw`p = \nu\,w/Z_w,\qquad w = e^{-\beta U_{\rm int}},\quad Z_w = \mathbb E_\nu[w]`, 'p = ν w / Z_w,   w = e^(−βU_int),   Z_w = E_ν[w]');
const NORMALISE = tex(String.raw`Z_w\ \text{makes it integrate to one}`, 'Z_w makes it integrate to one');
const DOCKING = tex(String.raw`p(\text{pose}\mid b_A, b_B)\ \propto\ w`, 'p(pose | b_A, b_B) ∝ w');
const RELATIVE = tex('c_B - c_A', 'c_B − c_A');
const TEMPERED = tex(String.raw`w^\lambda`, 'w^λ');

/** Turn a pair about z so that water's bisector points along +x (screen right). */
function facingRight({ XA, XB }) {
  const [bx, by] = bisector(XA);
  const c = bx / Math.hypot(bx, by), s = by / Math.hypot(bx, by);
  const turn = (X) => Array.from(X, (v, i) => (i % 3 === 0 ? v * c + X[i + 1] * s : i % 3 === 1 ? -X[i - 1] * s + v * c : v));
  const A = turn(XA), B = turn(XB);
  const cA = centroid(A, 3), cB = centroid(B, 4);
  return { X: [...A, ...B], cA, cB, mid: cA.map((v, i) => (v + cB[i]) / 2), closest: closestOH(A, B).length, hbond: hBond(A, B) };
}

// the reference (first 6 flexible draws, as they come) and real pairs (9 evenly spaced chain states)
const REF_PAIRS = referenceDraws.flexible.slice(0, 6).map(facingRight);
const REAL_PAIRS = Array.from({ length: 9 }, (_, i) => facingRight(jointChain.pairAt(Math.floor(((i + 0.5) * jointChain.n) / 9))));
const OVERLAP = REF_PAIRS.reduce((best, p, i) => (p.closest < REF_PAIRS[best].closest ? i : best), 0);
const HB_REF = Math.round(100 * referencePictures.hbondFraction), HB_REAL = Math.round(100 * jointChain.hbondFraction);

const WATER_REST = buildWater(), PEROXIDE_REST = buildPeroxide();
/** The diagram camera: smaller beside the right panel, eased back to the standard one (scene 08's) at the end. */
const diagram = (t) => {
  const k = seg(t, 86, 89.5);
  return diagramCamera({ cx: 420 + 10 * k, scale: 105 * (0.85 + 0.15 * k) });
};
const HIST = referencePictures.uHistogram;
const DOCK_SITE = [104.52, 120];
const DOCK_CENTRE = centroid(DOCKED.X, 7);

export default defineScene({
  name: 'Just add?',
  duration: 90,
  header: { eyebrow: '07 · JUST ADD?', title: 'Two perfect monomers are not a pair' },
  narration: [
    [CUE.add, 'First temptation: just add the two frozen scores. Independent molecules multiply densities, so their log densities, and their scores, add.'],
    [CUE.sample, 'So that sum is exactly the score of two molecules that ignore each other. Sample it, and each molecule comes out perfect.'],
    [CUE.chance, 'But where peroxide sits relative to water is pure chance: a uniformly random orientation, a random offset.'],
    [CUE.spring, 'One thing is needed. Free molecules drift apart forever, so a gentle spring on their centres keeps them near each other. It belongs to this reference, and its effect is known exactly.'],
    [CUE.picture, 'On the picture, the reference is the two shape densities on the floor, and flat along every fibre.'],
    [CUE.real, "Real pairs look different: a hydrogen of peroxide points at water's oxygen. Why? The energy is a sum, so the Boltzmann factor is a product."],
    [CUE.weight, "Each molecule's own factor, times one factor for the interaction, w. So the real density is the reference times w, and Z-w just makes it integrate to one."],
    [CUE.temper, 'Turn the weight on gradually, and every flat fibre collapses into a peak: the docking pose. Two perfect monomers are not a pair.'],
  ],

  draw(ctx, t) {
    drawMonomers(ctx, fade(t, 0.5, 1.5, 8.8, 9.5));
    drawLeftGrid(ctx, t);
    drawPicture(ctx, t);
    drawRightGrid(ctx, t);
    drawNotes(ctx, t);
    toyStamp(ctx, fade(t, CUE.real, CUE.real + 1));
  },
});

/** 0.5–9.5: the two frozen monomer models, each with its own score. */
function drawMonomers(ctx, alpha) {
  if (alpha <= 0.003) return;
  for (const [X, mol, x, tint, label, s] of [[WATER_REST, WATER_MOL, 190, SCORE_W, 'water', S_W], [PEROXIDE_REST, PEROXIDE_MOL, 400, SCORE_P, 'peroxide', S_P]]) {
    const cam = camera({ cx: x, cy: 430, scale: 62, yaw: mol === PEROXIDE_MOL ? 1.25 : 0, pitch: 0.25, focal: 40 });
    drawHalo(ctx, cam, X, mol.count, tint, { alpha });
    drawMol(ctx, X, cam, mol, { opacity: alpha });
    text(ctx, label, x, 540, { font: font.display, italic: true, size: 28, color: tint, align: 'center', alpha });
    drawPadlock(ctx, x - 26, 588, 26, { tint, alpha });
    s.draw(ctx, x + 2, 586, { size: 30, alpha });
    text(ctx, 'frozen', x, 632, { ...type.note, color: tint, align: 'center', alpha });
  }
}

/** One grid cell: a pair at its true offset, clipped to the cell, centred on the midpoint of the centroids. */
function drawCell(ctx, x, y, size, pair, { alpha, scale = 16, spring = 0, hbond = 0, tick = 0, mark = false }) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.panel;
  roundRect(ctx, x + 3, y + 3, size - 6, size - 6, 8);
  ctx.fill();
  ctx.strokeStyle = mark ? color.body : color.line;
  ctx.lineWidth = mark ? 2.5 : 1.5;
  ctx.stroke();
  ctx.clip();
  const cam = camera({ cx: x + size / 2, cy: y + size / 2, scale, yaw: 0, pitch: 0.25, focal: 40, center: pair.mid });
  drawHalo(ctx, cam, pair.X, [0, 3], SCORE_W, { alpha: 0.6 });
  drawHalo(ctx, cam, pair.X, [3, 7], SCORE_P, { alpha: 0.6 });
  if (spring > 0) drawRestraint(ctx, cam.project(pair.cA), cam.project(pair.cB), { alpha: spring, amplitude: 4, toothPx: 9, width: 2 });
  drawMol(ctx, pair.X, cam, PAIR_MOL); // the cell's alpha is already on the context
  if (tick > 0) {
    // water's bisector (turned to +x): "water faces right"
    const o = pair.X.slice(0, 3), b = [(pair.X[3] + pair.X[6]) / 2 - o[0], (pair.X[4] + pair.X[7]) / 2 - o[1], (pair.X[5] + pair.X[8]) / 2 - o[2]];
    const n = Math.hypot(...b), p = cam.project(o.map((v, i) => v + (0.35 * b[i]) / n)), q = cam.project(o.map((v, i) => v + (1.25 * b[i]) / n));
    ctx.save();
    ctx.globalAlpha *= tick;
    ctx.strokeStyle = SCORE_W;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    ctx.restore();
  }
  if (hbond > 0 && pair.hbond) {
    const { o, h } = pair.hbond;
    drawHBond(ctx, cam, pair.X.slice(3 * h, 3 * h + 3), pair.X.slice(3 * o, 3 * o + 3), { alpha: hbond, label: false });
  }
  ctx.restore();
}

/** 9.5–42.5: six reference pairs (2 × 3 cells of 200 px), then the restraint between their centres. */
function drawLeftGrid(ctx, t) {
  const out = 1 - seg(t, CUE.picture, CUE.picture + 0.7);
  if (out <= 0.003) return;
  const dx = -40 * (1 - out);
  const spring = seg(t, CUE.spring, CUE.spring + 1.5);
  const tag = out * seg(t, CUE.sample + 3, CUE.sample + 3.8);
  REF_PAIRS.forEach((pair, k) => {
    const alpha = out * seg(t, CUE.sample + 0.3 * k, CUE.sample + 0.5 + 0.3 * k);
    drawCell(ctx, 60 + 200 * (k % 3) + dx, 228 + 200 * Math.floor(k / 3), 200, pair, { alpha, spring, scale: 30, tick: seg(t, CUE.sample + 2, CUE.sample + 2.8), mark: k === OVERLAP && tag > 0.5 });
  });
  const a = out * seg(t, CUE.sample, CUE.sample + 0.8);
  const m = SAMPLED.drawOnBaseline(ctx, 60 + dx, 208, { size: 26, alpha: a });
  const r = out * seg(t, CUE.spring, CUE.spring + 1);
  if (r > 0.003) {
    const n = PLUS_RHO.drawOnBaseline(ctx, 60 + dx + m.width + 10, 208, { size: 26, alpha: r });
    ctx.save();
    ctx.globalAlpha *= r;
    ctx.fillStyle = RESTRAINT;
    ctx.fillRect(60 + dx + m.width + 10, 208 + n.depth + 6, n.width, 4);
    ctx.restore();
  }
  text(ctx, 'outlined: overlapping, the reference does not care', 60 + dx, 656, { ...type.note, color: color.body, alpha: tag });
  wrap(ctx, 'each pair turned so water faces right (rose tick): a global rotation changes nothing', 60 + dx, 690, 600, 21, { ...type.note, alpha: a });
  text(ctx, 'random orientation: Haar = uniformly random orientation', 60 + dx, 746, { ...type.note, color: color.body, alpha: out * seg(t, CUE.chance, CUE.chance + 0.8) });
}

/** 42.5–90: the master diagram, profiles flat and then tempered, and the docked pop-out. */
function drawPicture(ctx, t) {
  const alpha = seg(t, CUE.picture + 0.4, CUE.picture + 1.7);
  if (alpha <= 0.003) return;
  const x = 4 * lin(t, ...TEMPER), k = Math.min(3, Math.floor(x)), s = x - k;
  // each conditional density p(u | θ, τ) drawn to its own maximum
  const top = (q) => Math.max(...q.p);
  const blend = (key, site) => site.profiles[k][key].map((v, i) => (1 - s) * (v / top(site.profiles[k])) + s * (site.profiles[k + 1][key][i] / top(site.profiles[k + 1])));
  const hist = alpha * fade(t, CUE.picture + 1.5, CUE.picture + 2.5, CUE.temper, CUE.temper + 1);
  const profiles = PROFILE_SITES.map((site, i) => ({
    site,
    profile: { u: fibreProfiles[i].profiles[0].u, p: blend('p', fibreProfiles[i]), se: blend('se', fibreProfiles[i]) },
    pMax: 1,
    alpha: 1,
    under: () => drawHistogram(ctx, cam, site, hist), // thin bars behind the profile
  }));
  const pop = fade(t, POP_AT, POP_AT + 1);
  const cam = diagram(t);
  drawMaster(ctx, {
    camera: cam,
    alpha,
    floor: { density: zPoseGrid.floor.lone, alpha: 1 },
    fibres: { alpha: 1 },
    profiles,
    popOut: pop > 0.003 ? {
      a: toA(DOCK_SITE[0]), b: toB(DOCK_SITE[1]), f: toF(DOCKED.u), cx: 1180, cy: 430, r: 150, pxPerA: 45, center: DOCK_CENTRE, alpha: pop,
      content: (c, cam) => {
        drawHalo(c, cam, DOCKED.X, [0, 3], SCORE_W, { alpha: 1.6 });
        drawHalo(c, cam, DOCKED.X, [3, 7], SCORE_P, { alpha: 1.6 });
        drawMol(c, DOCKED.X, cam, PAIR_MOL); // the pop-out's alpha is already on the context
        const { o, h } = DOCKED.hbond;
        drawHBond(c, cam, DOCKED.X.slice(3 * h, 3 * h + 3), DOCKED.X.slice(3 * o, 3 * o + 3));
      },
    } : null,
  });
  const capY = 205;
  text(ctx, 'width of the teal shape = how much density sits at that height', 40, capY, { ...type.note, color: POSE, alpha: alpha * fade(t, CUE.picture + 2, CUE.picture + 2.5, CUE.picture + 5.5, CUE.picture + 6) });
  text(ctx, 'density of u, the other five pose numbers summed over', 40, capY, { ...type.note, color: POSE, alpha: alpha * fade(t, CUE.picture + 6, CUE.picture + 6.5, CUE.temper, CUE.temper + 0.6) });
  // tempering: λ from 0 to 1
  const lam = lin(t, ...TEMPER);
  const la = alpha * fade(t, CUE.temper + 0.3, CUE.temper + 1);
  if (la > 0.003) {
    TEMPERED.draw(ctx, 40, capY - 6, { size: 26, alpha: la });
    text(ctx, `λ = ${lam.toFixed(2)}   ·   λ = 0 ignore each other, λ = 1 interact`, 84, capY, { font: font.mono, size: 16, color: INTER, alpha: la });
  }
  text(ctx, 'each teal shape drawn to its own peak height', 152, 806, { ...type.note, color: POSE, alpha: la });
  if (pop > 0.003) text(ctx, 'one of many pairs at this height: the other five pose numbers chosen', 1180, 612, { ...type.note, color: POSE, align: 'center', alpha: pop });
}

/** The reference's u histogram (4 000 draws) as thin bins behind the flat centre-line profiles. */
function drawHistogram(ctx, cam, site, alpha) {
  if (alpha <= 0.003) return;
  const step = (HIST.hi - HIST.lo) / HIST.density.length;
  const a = toA(site[0]), b = toB(site[1]);
  HIST.density.forEach((dens, j) => {
    const f0 = toF(HIST.lo + (j + 0.12) * step), f1 = toF(HIST.lo + (j + 0.88) * step), w = (0.08 * dens) / 0.5;
    polygon3(ctx, cam, [diagPoint(a, b, f0), diagPoint(a + w, b, f0), diagPoint(a + w, b, f1), diagPoint(a, b, f1)], { fill: rgba(color.ink, 0.22), alpha });
    polyline3(ctx, cam, [diagPoint(a + w, b, f0), diagPoint(a + w, b, f1)], { color: color.ink, width: 1.5, alpha: 0.7 * alpha });
  });
}

/** 51–75.5: nine real pairs from the joint chain, hydrogen bonds dashed. */
function drawRightGrid(ctx, t) {
  const out = 1 - seg(t, CUE.temper, CUE.temper + 1);
  if (t < CUE.real || out <= 0.003) return;
  REAL_PAIRS.forEach((pair, k) => {
    const alpha = out * seg(t, CUE.real + 0.2 * k, CUE.real + 0.5 + 0.2 * k);
    drawCell(ctx, 900 + 110 * (k % 3), 300 + 110 * Math.floor(k / 3), 110, pair, { alpha, scale: 16, hbond: seg(t, CUE.real + 2, CUE.real + 3) });
  });
  const a = out * seg(t, CUE.real, CUE.real + 0.8);
  text(ctx, 'real pairs: the interaction switched on', 900, 282, { ...type.note, color: color.body, alpha: a });
  const r = out * seg(t, CUE.real + 2.5, CUE.real + 3.3);
  text(ctx, 'H-bonded:', 1262, 322, { ...type.note, alpha: r });
  text(ctx, 'O···H 1.5–2.4 Å,', 1262, 344, { ...type.note, color: color.body, alpha: r });
  text(ctx, 'O–H···O > 120°,', 1262, 366, { ...type.note, color: color.body, alpha: r });
  text(ctx, 'no O···O clash', 1262, 388, { ...type.note, color: color.body, alpha: r });
  text(ctx, `${HB_REF} %  reference`, 1262, 422, { font: font.mono, size: 17, color: color.body, alpha: r });
  text(ctx, `${HB_REAL} %  real`, 1262, 450, { font: font.mono, size: 17, color: INTER, alpha: r });
}

/** Right-hand notes and formulas. */
function drawNotes(ctx, t) {
  const fit = (formula, size, width) => Math.min(size, (size * width) / formula.metrics(size).width);
  // 0–42.5: independence
  const ind = fade(t, 0.5, 1.5, CUE.picture, CUE.picture + 0.8);
  INDEPENDENT.draw(ctx, RIGHT, 260, { size: fit(INDEPENDENT, 30, 680), alpha: ind });
  text(ctx, 'independent: densities multiply, scores add', RIGHT, 306, { ...type.note, alpha: ind });
  // 28–42.5: the reference and its restraint
  REFERENCE.draw(ctx, RIGHT, 352, { size: fit(REFERENCE, 28, 680), alpha: fade(t, CUE.spring + 0.5, CUE.spring + 1.5, CUE.picture, CUE.picture + 0.8) });
  tagCard(ctx, {
    x: RIGHT, y: 400, width: 640, tag: 'NORMALISABLE', accent: RESTRAINT,
    body: 'two free molecules have infinite translational room; an isotropic spring on the centres fixes it, keeps SO(3), and is part of the reference (I6)',
    alpha: fade(t, CUE.spring + 1.5, CUE.spring + 2.3, 40, 41), progress: lin(t, CUE.spring + 1.8, CUE.spring + 6),
  });
  // 42.5–51: u is uniform
  const uni = fade(t, CUE.picture + 1.5, CUE.picture + 2.5, CUE.real - 0.6, CUE.real);
  const lead = 'u is exactly uniform: the direction of ';
  text(ctx, lead, RIGHT, 230, { ...type.body, size: 21, alpha: uni });
  ctx.save();
  ctx.font = `400 21px ${font.sans}`;
  const leadWidth = ctx.measureText(lead).width;
  ctx.restore();
  RELATIVE.drawOnBaseline(ctx, RIGHT + leadWidth, 230, { size: 24, alpha: uni });
  text(ctx, 'is isotropic and independent of water', RIGHT, 262, { ...type.body, size: 21, alpha: uni });
  // 56–75.5: the Boltzmann factor of a sum is a product
  const prod = fade(t, 56, 57, CUE.temper, CUE.temper + 1);
  if (prod > 0.003) {
    let x = RIGHT;
    for (const { part, colour } of BOLTZMANN) {
      const m = part.drawOnBaseline(ctx, x, 712, { size: 28, alpha: prod });
      if (colour) {
        ctx.save();
        ctx.globalAlpha *= prod;
        ctx.fillStyle = colour;
        ctx.fillRect(x, 712 + m.depth + 7, m.width, 4);
        ctx.restore();
      }
      x += m.width + 9;
    }
  }
  // 62.5–75.5: the target
  const tgt = fade(t, CUE.weight + 0.5, CUE.weight + 1.5, CUE.temper, CUE.temper + 1);
  TARGET.draw(ctx, RIGHT, 782, { size: fit(TARGET, 28, 680), alpha: tgt });
  NORMALISE.draw(ctx, RIGHT, 824, { size: 20, alpha: 0.75 * tgt * seg(t, CUE.weight + 6, CUE.weight + 7) });
  // 75.5–90: docking, and the verdict on attempt 1
  const dock = fade(t, CUE.temper + 1, CUE.temper + 2);
  DOCKING.draw(ctx, RIGHT, 228, { size: 30, alpha: dock });
  const dx = DOCKING.metrics(30).width + 18;
  text(ctx, 'on Haar ⊗ ρ: docking', RIGHT + dx, 236, { ...type.body, size: 21, alpha: dock });
  text(ctx, 'Haar = uniformly random orientation', RIGHT, 268, { ...type.note, alpha: dock });
  tagCard(ctx, {
    x: RIGHT, y: 645, width: 640, tag: 'ATTEMPT 1 · NO', accent: color.muted,
    body: 'Nothing in the sum orients one molecule relative to the other; the known spring only pulls the centres together.',
    alpha: fade(t, VERDICT, VERDICT + 0.8), progress: lin(t, VERDICT + 0.3, VERDICT + 2.5),
  });
}
