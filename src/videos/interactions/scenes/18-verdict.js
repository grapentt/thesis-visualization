import { defineScene, seg, lerp, text, type, font, color, rgba, roundRect, splitLines, vec3 } from '../../../kit.js';
import { centroid } from '../toy.js';
import { symEig } from '../linalg.js';
import { runs11, fibreProfiles, zPoseGrid, DIMER_MIN } from '../data.js';
import { HORIZONTAL, POSE, SCORE_W, SCORE_P, INTER, VERTICAL, DIMER_MOL, ALA2_W, ALA2_W_MOL, FOLLOW_UP, moleculeThumb, ideaTag, pill, toyStamp } from '../shared.js';
import { drawMaster, diagramCamera, project, toA, toB, toF, PROFILE_SITES } from '../diagram.js';

const RIGHT = 860, WIDTH = 660;
const CUE = { force: 13.5, account: 18.5, data: 31, heldOut: 43.5, payoff: 57 };
const PILLS = { y: 200, step: 34 }; // collapsed cards, stacked from the top of the column

// ---- the final master diagram: reweighted floor, centre-line peaks, three arrows at one point ----

const CAM = diagramCamera();
const LAYERS = 0.8;
const PEAKS = fibreProfiles.map((s, k) => ({ site: PROFILE_SITES[k], profile: s.profiles.at(-1), alpha: 1, band: false }));
const { push, a: RUN, binding } = runs11;
const AT = [toA(RUN.theta[0]), toB(RUN.tau[0]), toF(RUN.u[0])];
const RELAXED = [toA(RUN.theta.at(-1)), toB(RUN.tau.at(-1)), toF(RUN.u.at(-1))]; // where the monomer scores alone lead
const ARROW_BOX = 0.3; // rose and lime drawn this long in box units: directions only (as in scene 11)
const unitScale = ({ dTheta, dTau, du }) => ARROW_BOX / Math.hypot(dTheta / 25, dTau / 360, du / 2);
// rose and lime move along the floor from X★; orange is what binding adds (scene 11's two runs), at true length
const ARROWS = [
  { a: AT[0], b: AT[1], f: AT[2], d: push.W, colour: SCORE_W, scale: unitScale(push.W) },
  { a: AT[0], b: AT[1], f: AT[2], d: push.P, colour: SCORE_P, scale: unitScale(push.P) },
  { a: RELAXED[0], b: RELAXED[1], f: RELAXED[2], d: binding, colour: INTER, scale: 1 },
];
/** Labels beside the arrow tips: [text, dx, dy, align]. */
const ARROW_LABELS = [['water', -12, -12, 'right'], ['peroxide', 10, 22, 'left'], ['binding: along the fibre, to the peak', 14, 18, 'left']];

// ---- the dipeptide with one water (shared.js's illustrative placement), turned to its best face ----

const ALA2_W_FACE = facing(ALA2_W, 10);

/**
 * Centred and turned onto the principal axes of its first `fit` atoms (largest spread across,
 * smallest into the page; a rotation, never a mirror): a thumbnail's best face.
 */
function facing(X, fit = X.length / 3) {
  const n = X.length / 3, c = centroid(X, n);
  const P = Array.from({ length: n }, (_, i) => [0, 1, 2].map((k) => X[3 * i + k] - c[k]));
  const M = [0, 1, 2].map((i) => [0, 1, 2].map((j) => P.slice(0, fit).reduce((s, p) => s + p[i] * p[j], 0)));
  const { vectors: V } = symEig(M, 3);
  const axes = [2, 1, 0].map((k) => [0, 1, 2].map((i) => V[i * 3 + k])); // descending spread
  axes[2] = vec3.cross(axes[0], axes[1]); // a proper rotation: an L molecule stays L
  return P.flatMap((p) => axes.map((e) => vec3.dot(p, e)));
}

// ---- the four cards: paragraphs revealed with the narration ----------------------------------------

const BODY = { ...type.body, size: 22 };
const BOLD = { ...type.body, size: 22, weight: 500, color: color.ink };
const MONO = { ...type.note, color: color.body };
const MUTED = { ...type.note };
const STYLES = { body: [BODY, 33], bold: [BOLD, 33], mono: [MONO, 22], muted: [MUTED, 22] };

const CARDS = [
  {
    tag: 'KNOWN', accent: color.muted, span: [0.5, CUE.account],
    items: [
      { at: 0.8, text: 'pₜ = refₜ · Wₜ and the exact score split: the identity as used by Lu et al., ICML 2023 (the same fact underlies exact classifier guidance: Song et al. 2021; Dhariwal & Nichol 2021)' },
      { at: CUE.force + 0.3, text: 'small-noise scores are force fields: Arts et al., JCTC 2023' },
    ],
  },
  {
    tag: 'THIS WORK', accent: POSE, span: [CUE.account, CUE.data],
    items: [
      { at: CUE.account + 0.5, text: 'the geometric account: pose / shape / affinity; which invariance each network needs; the conditions (same noise, matched centring, restraint in the reference, SO(3); alignment and any connection matched to the noise: unweighted for equal noise, mass-weighted for 1/√m noise (C5)); where reuse breaks' },
      { at: CUE.account + 7, text: 'extensions: n molecules;' },
      { at: CUE.account + 7.5, text: 'energy-only training by contrastive energy prediction (I5);', idea: true, tight: true },
      { at: CUE.account + 8, text: 'hierarchies and coarse-graining', idea: true, tight: true },
    ],
  },
  {
    tag: 'MEASURED · WATER DIMER', accent: VERTICAL, span: [CUE.data, CUE.payoff],
    items: [
      { at: CUE.data + 2.5, text: 'no data-efficiency gain for water', style: 'bold' },
      { at: CUE.data + 4.5, text: 'samples (pose W1 of O···O, H-bond fraction, …; three seeds): statistically indistinguishable at every training size, 100 to 10\u00a0000 frames' },
      { at: CUE.heldOut + 0.5, text: 'small-noise score error on held-out frames: decomposed worse below 1\u00a0000 frames, better only at 10\u00a0000 (from the frozen monomer shapes)' },
      { at: CUE.heldOut + 1, text: 'OpenMM flexible TIP3P', style: 'mono', narrow: true },
      { at: CUE.heldOut + 1, text: 'grapentt/riemannian-generative PR #762', style: 'mono', narrow: true },
    ],
    thumb: { at: CUE.heldOut + 1, X: facing(DIMER_MIN.X), mol: DIMER_MOL, size: 130, scale: 34, yaw: 0.9, pitch: -0.7, halos: [[0, 3, SCORE_W], [3, 6, SCORE_W]] },
  },
  {
    tag: 'UNDER WAY · NO RESULTS YET', accent: HORIZONTAL, span: [CUE.payoff, 999],
    items: [
      { at: CUE.payoff + 0.8, text: 'expected payoff: a hypothesis · ‘water has little shape to reuse’ is an untested explanation', style: 'muted' },
      { at: CUE.payoff + 7, text: FOLLOW_UP.replace(/(\d) (\d{3})/g, '$1\u00a0$2') },
      { at: CUE.payoff + 7.5, text: 'L-dipeptide (heavy atoms) and one water, placed by hand 3.2 Å from a backbone O: an illustration', style: 'mono', narrow: true },
    ],
    thumb: { at: CUE.payoff + 7.5, X: ALA2_W_FACE, mol: ALA2_W_MOL, size: 170, scale: 22, yaw: -0.4, pitch: -0.5, halos: [[ALA2_W_MOL.count - 3, ALA2_W_MOL.count, SCORE_W]] },
  },
];
const BARE = 76; // a card showing only its tag (tagCard with no lines)
const IDEA_W = 175; // width of the 'an idea, untested' pill

export default defineScene({
  name: 'Verdict',
  duration: 71,
  header: { eyebrow: '18 · VERDICT', title: 'What is new, and what it bought' },
  narration: [
    [0, 'Let us be honest about what is new. The exact split of the score is the identity used by Lu and colleagues; the same fact underlies exact classifier guidance.'],
    [CUE.force, 'That small-noise scores are force fields is Arts and colleagues’.'],
    [CUE.account, 'What the bundle adds is the account: why it works for molecules, what each term means, which symmetry each network needs, the conditions, and where reuse breaks.'],
    [CUE.data, 'Does it save data? For the water dimer, no. Decomposed and joint samples were statistically indistinguishable at every size, from a hundred to ten thousand training frames.'],
    [CUE.heldOut, 'On held-out frames, the decomposed model’s small-noise score was worse below a thousand frames, and better only at ten thousand: a gain that came from the frozen monomer shapes.'],
    [CUE.payoff, 'The hoped-for payoff is for flexible molecules, with plentiful monomer data and scarce pair data. A first test, alanine dipeptide with one water, is under way.'],
  ],

  draw(ctx, t) {
    drawDiagram(ctx, seg(t, 0.3, 1.3));
    drawCards(ctx, t);
    toyStamp(ctx, seg(t, 0.3, 1.3));
  },
});

function drawDiagram(ctx, alpha) {
  drawMaster(ctx, {
    camera: CAM,
    alpha: alpha * LAYERS,
    floor: { density: zPoseGrid.floor.pair, alpha: 1 },
    fibres: { alpha: 1, caption: false },
    profiles: PEAKS,
    arrows: ARROWS,
    cursor: { a: AT[0], b: AT[1], f: AT[2] },
  });
  ARROWS.forEach(({ a, b, f, d, scale, colour }, k) => {
    const tip = project(CAM, a + (scale * d.dTheta) / 25, b + (scale * d.dTau) / 360, f + (scale * d.du) / 2);
    const [label, dx, dy, align] = ARROW_LABELS[k];
    backedText(ctx, label, tip.x + dx, tip.y + dy, { ...type.note, color: colour, align, alpha });
  });
  // legend under the diagram, each part in its own colour
  let x = 60;
  for (const [label, tint] of [['floor: the frozen parts', HORIZONTAL], [' · ', color.dim], ['fibres: the pose', POSE], [' · ', color.dim], ['one orange term: the binding', INTER]]) {
    text(ctx, label, x, 866, { font: font.mono, size: 16, color: tint, alpha });
    ctx.save();
    ctx.font = `400 16px ${font.mono}`;
    x += ctx.measureText(label).width;
    ctx.restore();
  }
}

/** Note on a dark backing, so that fibres do not run through it. */
function backedText(ctx, str, x, y, o) {
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  const w = ctx.measureText(str).width;
  ctx.globalAlpha *= 0.85 * o.alpha;
  ctx.fillStyle = color.bg;
  roundRect(ctx, (o.align === 'right' ? x - w : x) - 5, y - 15, w + 10, 21, 4);
  ctx.fill();
  ctx.restore();
  text(ctx, str, x, y, o);
}

// ---- cards ---------------------------------------------------------------------------------------

/**
 * Lines of a card: [{ str, style, at, y }] and idea pills [{ idea, at, x, y }], baselines relative
 * to the card's top (first at 88, as tagCard). 'narrow' items leave room for the thumbnail.
 * stops: the card's height once each item is shown (items are revealed in order, so it grows).
 */
function layout(ctx, card) {
  const lines = [];
  const inner = WIDTH - 56;
  const stops = [];
  let y = 88 - 33, prev = null, narrowTop = null;
  for (const item of card.items) {
    const style = item.style ?? 'body';
    const [face, step] = STYLES[style];
    y += prev === null ? 33 : item.tight ? step : style === 'body' || prev === 'body' ? Math.max(step, 33) + 10 : step;
    if (item.narrow && narrowTop === null) narrowTop = y - 26;
    const parts = splitLines(ctx, item.text, inner - (item.narrow && card.thumb ? card.thumb.size : 0), face);
    parts.forEach((str, k) => lines.push({ str, style, at: item.at, y: y + k * step }));
    y += (parts.length - 1) * step;
    if (item.idea) {
      ctx.save();
      ctx.font = `400 22px ${font.sans}`;
      const end = ctx.measureText(parts.at(-1)).width + 14;
      ctx.restore();
      // no room on the line: the pill hangs under the line's end, and the next item keeps clear of it
      const wrap = end + IDEA_W > inner;
      if (wrap) y += step - 2;
      lines.push({ idea: true, at: item.at, x: wrap ? end - 14 - IDEA_W : end, y });
      if (wrap) y += 8;
    }
    prev = style;
    stops.push({ at: item.at, height: narrowTop === null ? y + 30 : Math.max(y + 30, narrowTop + card.thumb.size + 24) });
  }
  return { lines, stops, thumbTop: narrowTop ?? y };
}

/** Height of a card at time t: tag only at first, growing half a second before each item appears. */
const heightAt = (stops, t) => stops.reduce((h, { at, height }) => lerp(h, height, seg(t, at - 0.5, at)), BARE);

function drawCards(ctx, t) {
  CARDS.forEach((card, k) => {
    const show = seg(t, card.span[0], card.span[0] + 0.6);
    if (show <= 0.003) return;
    const done = seg(t, card.span[1] - 0.6, card.span[1]); // collapses into its pill
    const y = Math.max(250, PILLS.y + PILLS.step * k + 16);
    const { lines, stops, thumbTop } = layout(ctx, card);
    if (done < 0.997) drawCard(ctx, t, card, lines, y, heightAt(stops, t), thumbTop, show * (1 - done));
    // the pill: in the card's corner, then sliding into its slot in the stack
    pill(ctx, card.tag, lerp(RIGHT + 28, RIGHT, done), lerp(y + 38, PILLS.y + 14 + PILLS.step * k, done), card.accent, show);
  });
}

function drawCard(ctx, t, card, lines, y, height, thumbTop, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(17,24,40,0.97)';
  roundRect(ctx, RIGHT, y, WIDTH, height, 14);
  ctx.fill();
  ctx.strokeStyle = rgba(card.accent, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  for (const line of lines) {
    const a = alpha * seg(t, line.at, line.at + 0.6);
    if (line.idea) ideaTag(ctx, RIGHT + 28 + line.x, y + line.y - 7, a);
    else text(ctx, line.str, RIGHT + 28, y + line.y, { ...STYLES[line.style][0], alpha: a });
  }
  if (card.thumb) {
    const { X, mol, size, scale, yaw, pitch, at, halos } = card.thumb;
    moleculeThumb(ctx, RIGHT + WIDTH - 28 - size / 2, y + thumbTop + size / 2, X, mol, { scale, yaw, pitch, halos, alpha: alpha * seg(t, at, at + 0.6) });
  }
}
