// E5.6 ★ Two loud modes (programme.md §4, E5). The design card (53 stiff channels at unit population
// spread, 25 torsion phase pairs, two 3-vectors c₀a₁, c₀a₂ at natural spread: 109 features), the two
// modes on a real held-out molecule (bead weights w_p = H V_p from collective_modes.json), the loudness
// ruler (mode-length variances against a torsion's), then the gesture in three beats: (i) the internal
// lane as measured cross-fades to its first-order version, so both ends of the morph share one
// estimator; (ii) lever `block` none → two loud modes morphs it into the ordered lane [D, dashed];
// (iii) a beat later the plane's dots move [M #1088] and land inside the registered corner on seed 3
// and just outside on seed 2. Stamp MECHANISM UNTESTED until #1137 reports. (Halos lens: later.)
import {
  defineScene, choice, text, wrap, line, dot, arrow, roundRect, rgba, font, type, seg, fade, lerp, clamp, P, BBA_MODES, CHARTS, FRAMES,
  ev, num, seeds, leverSim, clock, railX, RAIL, drawRailAxis, drawFog, glyph, chip, badge, stamp, budget, rigStamp, header,
  helmert, beadWeights, modeVector, radiusOfGyration, logSnr, tAtLogSnr, effectRule,
} from '../shared.js';
import { LANES, firstOrder } from '../lanes.js';
import { drawLane, placeGlyphs } from '../laneView.js';

// ---- data ----------------------------------------------------------------------------------------

const H = helmert(28);
const W = [0, 1].map((p) => beadWeights(BBA_MODES.V[p], H));
const FLIP = W[0].findIndex((w, i) => i > 0 && Math.sign(w) !== Math.sign(W[0][i - 1])); // 0-based bead after the flip
const LENGTH_VAR = BBA_MODES.length_variance_lib;
const TORSION_VAR = BBA_MODES.torsion_length_variance_lib;
const LOUDER = LENGTH_VAR.filter((v) => v > TORSION_VAR).length;
const ROUSE = BBA_MODES.rouse_overlap;
const C0 = BBA_MODES.c0;
const IDEAL = ev('n30.ideal').value;
const LKL = ev('n30.lengthKL').value;
const RGKL = ev('n30.rgKL').value;
const ALIGN = ev('n1057.align').value;
const C3_BOND = ev('r1088.c3.bond').value;
const C3_RG = ev('r1088.c3.rg').value;
const ORD_BOND = ev('r1088.ordered.bond').value;
const ORD_RG = ev('r1088.ordered.rg').value;
const CORNER = ev('r1071.corner').value;
const FLOOR_BOND = ev('r1088.ordered.bond').floor;
const FLOOR_RG = ev('r1088.ordered.rg').floor;

// the molecule: the held-out frame nearest the sample's median size, in its principal axes
const MOL = (() => {
  const i = FRAMES.rg_A.indexOf([...FRAMES.rg_A].sort((a, b) => a - b)[3]);
  const x = FRAMES.mol[i];
  return { x: principalFrame(x), rg: radiusOfGyration(x) };
})();

function principalFrame(x) {
  // the 3 × 3 covariance and its eigenvectors by Jacobi rotations (x is centred)
  const C = [0, 1, 2].map((a) => [0, 1, 2].map((b) => x.reduce((s, p) => s + p[a] * p[b], 0)));
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 30; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(C[p][q]) < 1e-12) continue;
      const th = 0.5 * Math.atan2(2 * C[p][q], C[q][q] - C[p][p]);
      const c = Math.cos(th);
      const s = Math.sin(th);
      for (let k = 0; k < 3; k++) {
        const ckp = C[k][p];
        const ckq = C[k][q];
        C[k][p] = c * ckp - s * ckq;
        C[k][q] = s * ckp + c * ckq;
      }
      for (let k = 0; k < 3; k++) {
        const cpk = C[p][k];
        const cqk = C[q][k];
        C[p][k] = c * cpk - s * cqk;
        C[q][k] = s * cpk + c * cqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = V[k][p];
        const vkq = V[k][q];
        V[k][p] = c * vkp - s * vkq;
        V[k][q] = s * vkp + c * vkq;
      }
    }
  }
  const order = [0, 1, 2].sort((a, b) => C[b][b] - C[a][a]);
  const axes = order.map((j) => [V[0][j], V[1][j], V[2][j]]);
  return x.map((p) => axes.map((ax) => ax[0] * p[0] + ax[1] * p[1] + ax[2] * p[2]));
}

const A = W.map((w) => modeVector(w, MOL.x));
// fit the projected molecule into the chain box (x–y plane of its principal axes)
let fitCache = null;
const fit = () => fitCache ?? (fitCache = (() => {
  const xs = MOL.x.map((p) => p[0]);
  const ys = MOL.x.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((CHAIN.w - 60) / (x1 - x0), (CHAIN.h - 60) / (y1 - y0));
  return { scale, cx: CHAIN.x + CHAIN.w / 2 - ((x0 + x1) / 2) * scale, cy: CHAIN.y + CHAIN.h / 2 + 10 + ((y0 + y1) / 2) * scale };
})());
const UNIT = A.map((a) => a.map((c) => c / Math.hypot(...a)));

// ---- the lane morph --------------------------------------------------------------------------------

const C3_MEASURED = LANES.find((l) => l.id === 'internal');
const ORDERED = LANES.find((l) => l.id === 'ordered');
const FIRST_C3 = firstOrder('internal');
const FIRST_ORD = firstOrder('+2');
const BLOCK = ORDERED.glyphs.filter((g) => g.estimator === 'block');
const WALL = ORDERED.glyphs.filter((g) => g.kind === 'wall');

/** Interpolate the first-order glyphs in log-SNR from the internal chart (u = 0) to + 2 loud (u = 1). */
const morphed = (u) => FIRST_C3.map((g, i) => ({ ...g, t: tAtLogSnr(lerp(logSnr(g.t), logSnr(FIRST_ORD[i].t), u)) }));

/** Rows that stay fixed through the whole morph, so no glyph jumps between sub-rows. */
const ROWS = (() => {
  const xs = FIRST_C3.map((_, i) => [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((u) => railX(morphed(u)[i].t)));
  const rows = [];
  const order = xs.map((_, i) => i).sort((a, b) => xs[a][0] - xs[b][0]);
  for (const i of order) {
    let r = 0;
    while (rows.some((rr, j) => rr === r && xs[i].some((x, s) => Math.abs(x - xs[j][s]) < 24))) r++;
    rows[i] = r;
  }
  return rows;
})();
const positioned = (glyphs) => glyphs.map((g, i) => ({ ...g, x: railX(Math.max(RAIL.tLo, g.t)), row: ROWS[i] }));
const MEASURED_POS = placeGlyphs(C3_MEASURED.glyphs);
const EXTRA_POS = (() => {
  const top = Math.max(...ROWS) + 1;
  return [...BLOCK.map((g, i) => ({ ...g, x: railX(g.t), row: top - (i % 2) })), ...WALL.map((g) => ({ ...g, x: railX(g.t), row: 0 }))];
})();

// ---- layout ---------------------------------------------------------------------------------------

const LANE_TOP = 168;
const AXIS_Y = 316;
const CARD = { x: 80, y: 350, w: 700, h: 124 };
const CHAIN = { x: 80, y: 490, w: 500, h: 262 };
const RULER = { x: 120, y: 818, w: 600, max: 7.5 };
const PLANE = { x: 930, y: 380, w: 540, h: 330, bx: [1e-4, 1e-2], ry: [0.05, 1] };
const px = (b) => PLANE.x + (PLANE.w * Math.log(b / PLANE.bx[0])) / Math.log(PLANE.bx[1] / PLANE.bx[0]);
const py = (r) => PLANE.y + PLANE.h - (PLANE.h * Math.log(r / PLANE.ry[0])) / Math.log(PLANE.ry[1] / PLANE.ry[0]);

const SWITCH = 60;
const HANDOVER = 97;
const EXPLORE = 88;

export default defineScene({
  name: 'Two loud modes',
  duration: 106,
  header: header(5, 6, 'TWO LOUD MODES', 'Unit spread for the detail, two loud modes for the size'),
  narration: [
    [0, 'The design: internal coordinates at unit spread for the detail, plus two loud collective modes for the size.'],
    [8, 'Fifty-three stiff channels at unit population spread, 25 torsion phase pairs, and two 3-vectors at their natural spread: 109 features.'],
    [17, `On a real held-out molecule, mode 1 separates the hairpin from the rest; it changes sign between beads ${FLIP} and ${FLIP + 1}.`],
    [24, 'Mode 2 moves the ends against the middle. Both are almost exactly Rouse modes.'],
    [31, `Measured as lengths, only ${LOUDER === 2 ? 'two' : LOUDER} modes are louder than a torsion.`],
    [39, `A model check: an ideal chain given only the first mode's length gets size right to ${IDEAL[1]} Å. The block needs only a simple marginal.`],
    [48, 'Now the gesture. First the internal lane as measured; then the same lane at first order, dashed, so both ends of the morph share one estimator.'],
    [SWITCH - 1, `Add the block. Size moves from ${FIRST_C3[6].t.toFixed(2)} to ${FIRST_ORD[6].t.toFixed(2)}; long-range distances and end-to-end follow; bonds and torsions stay.`],
    [71, 'A beat later, the trained models.'],
    [75, `At the registered budget the size error falls from ${seeds(C3_RG)} to ${seeds(ORD_RG)} Å: inside the registered corner on seed 3, just outside on seed 2.`],
    [87, 'Order or correction? Test 1137 separates the two. It was declared on 11-18 and has not run.'],
    [HANDOVER, 'Your turn: toggle the block. Which glyphs move, and which stay?'],
  ],
  beats: [[0, 'The design'], [17, 'The modes'], [48, 'The gesture'], [71, 'The plane'], [87, 'Untested']],
  controls: {
    block: choice('loud collective modes', { none: 'none (internal only)', two: 'two loud modes' }, { value: [[0, 'none'], [SWITCH, 'two']] }),
  },
  sim: leverSim(['block']),
  handovers: [{ at: HANDOVER, prompt: 'Toggle the block: which glyphs move, and which stay?' }],
  exploreFrom: EXPLORE,

  draw(ctx, t, live) {
    const c = clock(t, live, EXPLORE);
    const two = live.input.block === 'two';
    // morph progress: eased after the authored switch, immediate while exploring
    const u = live.exploring ? (two ? 1 : 0) : two ? seg(t, SWITCH, SWITCH + 6) : 0;

    // ---- the lane: measured → first order → + 2 loud ----
    const laneA = seg(c, 0.6, 1.6);
    drawFog(ctx, LANE_TOP + 22, AXIS_Y, { alpha: laneA });
    drawRailAxis(ctx, AXIS_Y, { alpha: laneA, logSnr: false });
    const toFirst = live.exploring ? 1 : seg(c, 50, 54);
    const lane = { ...C3_MEASURED, name: u > 0.5 ? 'ordered' : 'internal', sub: u > 0.5 ? 'internal + 2 loud' : 'unit spread (C3)' };
    if (toFirst < 1) {
      drawLane(ctx, lane, LANE_TOP, { alpha: laneA * (1 - toFirst), positions: MEASURED_POS, verdict: 'as painted: best estimator, size 0.27–0.28', shares: false });
    }
    if (toFirst > 0) {
      const glyphs = positioned(morphed(u));
      drawLane(ctx, lane, LANE_TOP, {
        alpha: laneA * toFirst,
        positions: [...glyphs, ...EXTRA_POS.map((g) => ({ ...g }))],
        appear: (i, g) => (g.estimator === 'block' ? (live.exploring ? (two ? 1 : 0) : two ? seg(t, SWITCH + 6, SWITCH + 8) : 0) : 1),
        chipText: 'first order · the same estimator at both ends of the morph · lab 11-18',
        chipDash: [4, 3],
        verdict: u > 0.98 ? 'range, and order for size' : u < 0.02 ? 'range without order' : '',
        verdictColour: u > 0.98 ? P.global : P.wall,
        shares: false,
      });
      const rgT = morphed(u)[6].t;
      text(ctx, `size ${rgT.toFixed(2)}`, railX(rgT), LANE_TOP + 30, { font: font.mono, size: 11, color: P.global, align: 'center', alpha: laneA * toFirst });
    }
    chip(ctx, two ? 'block: two loud modes' : 'block: none', RAIL.x1, AXIS_Y + 34, { colour: live.exploring || (t > SWITCH - 1 && t < SWITCH + 7) ? P.gold : P.muted, align: 'right', size: 12, alpha: seg(c, 56, 57) });

    // ---- the design card ----
    const cardA = seg(c, 1, 2.2);
    if (cardA > 0.003) {
      ctx.save();
      ctx.globalAlpha *= cardA;
      roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 12);
      ctx.fillStyle = 'rgba(20,28,46,0.9)';
      ctx.fill();
      ctx.strokeStyle = P.line;
      ctx.stroke();
      ctx.restore();
      const row = (i, n, what, colour, a) => {
        text(ctx, n, CARD.x + 60, CARD.y + 34 + 26 * i, { font: font.mono, size: 18, weight: 600, color: colour, align: 'right', alpha: a });
        text(ctx, what, CARD.x + 74, CARD.y + 34 + 26 * i, { font: font.mono, size: 14, color: P.body, alpha: a });
      };
      row(0, '53', 'stiff channels: log bond lengths and angles, unit population spread', P.stiff, seg(c, 8, 9));
      row(1, '50', 'torsion phase pairs (cos, sin) × 25, scale c_φ = 1.504', P.soft, seg(c, 10, 11));
      row(2, '6', `two 3-vectors c₀a₁, c₀a₂ at natural spread (c₀ = ${C0.toFixed(3)} Å⁻¹)`, P.global, seg(c, 12, 13));
      text(ctx, '= 109', CARD.x + CARD.w - 20, CARD.y + 34 + 26 * 3, { font: font.mono, size: 18, weight: 600, color: P.ink, align: 'right', alpha: seg(c, 14, 15) });
    }

    // ---- the molecule and its two modes ----
    const chainA = seg(c, 16, 17.5);
    if (chainA > 0.003) {
      const FIT = fit();
      const S = FIT.scale;
      const P2 = MOL.x.map(([x, y, z]) => [FIT.cx + x * S, FIT.cy - y * S, z]);
      ctx.save();
      ctx.globalAlpha *= chainA;
      ctx.strokeStyle = P.bead;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      P2.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.restore();
      const zr = MOL.x.map((p) => p[2]);
      const zmin = Math.min(...zr);
      const zmax = Math.max(...zr);
      P2.map((p, i) => [p, i]).sort((a, b) => a[0][2] - b[0][2]).forEach(([[x, y, z], i]) => {
        const d = (z - zmin) / (zmax - zmin || 1);
        dot(ctx, x, y, 4.2 + 2 * d, i === 0 ? P.ink : P.bead, chainA * (0.55 + 0.45 * d));
      });
      text(ctx, '1', P2[0][0] - 10, P2[0][1] - 8, { font: font.mono, size: 11, color: P.muted, alpha: chainA });
      text(ctx, '28', P2[27][0] + 8, P2[27][1] - 8, { font: font.mono, size: 11, color: P.muted, alpha: chainA });
      // mode arrows: parallel to the molecule's a_p, length ∝ the bead weight
      const m1 = fade(c, 17, 18.5, 23.5, 24.5);
      const m2 = seg(c, 24.5, 26);
      [[0, m1], [1, m2]].forEach(([p, a]) => {
        if (a <= 0.003) return;
        const [ux, uy] = UNIT[p];
        P2.forEach(([x, y], i) => {
          const L = W[p][i] * 120;
          if (Math.abs(L) < 3) return;
          arrow(ctx, x, y, x + ux * L, y - uy * L, { color: P.global, width: 2, head: 7, alpha: a * chainA });
        });
      });
      line(ctx, CHAIN.x, CHAIN.y + CHAIN.h - 2, CHAIN.x + 5 * S, CHAIN.y + CHAIN.h - 2, { color: P.muted, width: 2, alpha: chainA });
      text(ctx, '5 Å', CHAIN.x + 5 * S + 8, CHAIN.y + CHAIN.h + 2, { font: font.mono, size: 11, color: P.muted, alpha: chainA });
      text(ctx, `held-out frame ${FRAMES.heldout_index[FRAMES.rg_A.indexOf([...FRAMES.rg_A].sort((a, b) => a - b)[3])]} · Rg ${MOL.rg.toFixed(1)} Å`, CHAIN.x, CHAIN.y + 8, { font: font.mono, size: 11, color: P.dim, alpha: chainA });
      const tx = CHAIN.x + CHAIN.w + 10;
      text(ctx, 'mode 1', tx, CHAIN.y + 70, { font: font.mono, size: 14, weight: 600, color: P.global, alpha: chainA * Math.max(m1, 0.4) });
      wrap(ctx, `hairpin vs rest (${Math.round(ALIGN * 100)}% aligned); sign change between beads ${FLIP} and ${FLIP + 1}; Rouse overlap ${ROUSE[0].toFixed(2)}`, tx, CHAIN.y + 92, 180, 18, { font: font.mono, size: 12, color: P.body, alpha: chainA * Math.max(m1, 0.4) });
      text(ctx, 'mode 2', tx, CHAIN.y + 190, { font: font.mono, size: 14, weight: 600, color: P.global, alpha: chainA * Math.max(m2, 0.25) });
      wrap(ctx, `ends vs middle; Rouse overlap ${ROUSE[1].toFixed(2)}`, tx, CHAIN.y + 212, 180, 18, { font: font.mono, size: 12, color: P.body, alpha: chainA * Math.max(m2, 0.25) });
    }

    // ---- the loudness ruler ----
    const rA = seg(c, 31, 32.5);
    if (rA > 0.003) {
      const X = (v) => RULER.x + (RULER.w * v) / RULER.max;
      text(ctx, 'length variance (library units)', RULER.x, RULER.y - 46, { font: font.mono, size: 12, color: P.muted, alpha: rA });
      line(ctx, RULER.x, RULER.y, RULER.x + RULER.w, RULER.y, { color: P.line, width: 1.5, alpha: rA });
      LENGTH_VAR.slice(0, 4).forEach((v, i) => {
        const a = rA * seg(c, 31.5 + 0.4 * i, 32.5 + 0.4 * i);
        line(ctx, X(v), RULER.y - 12, X(v), RULER.y + 4, { color: i < 2 ? P.global : P.muted, width: 3, alpha: a });
        text(ctx, `a${'₁₂₃₄'[i]} ${v.toFixed(1)}`, i === 3 ? X(v) + 3 : i === 2 ? X(v) - 3 : X(v), RULER.y + (i < 2 ? -18 : 22), { font: font.mono, size: 11, color: i < 2 ? P.global : P.muted, align: i === 3 ? 'right' : i === 2 ? 'left' : 'center', alpha: a });
      });
      line(ctx, X(TORSION_VAR), RULER.y - 20, X(TORSION_VAR), RULER.y + 10, { color: P.soft, width: 2, dash: [3, 3], alpha: rA });
      text(ctx, `a torsion ${TORSION_VAR.toFixed(1)}`, X(TORSION_VAR) + 6, RULER.y + 22, { font: font.mono, size: 11, color: P.soft, alpha: rA });
      text(ctx, `only ${LOUDER === 2 ? 'two' : LOUDER} modes are louder than a torsion`, RULER.x + RULER.w, RULER.y - 46, { font: font.mono, size: 12, color: P.ink, align: 'right', alpha: seg(c, 34, 35) });
    }

    // ---- the model check ----
    const iA = seg(c, 39, 40.5);
    if (iA > 0.003) {
      const bw = badge(ctx, 'D·model', CARD.x, 862, { alpha: iA, size: 11 });
      text(ctx, `ideal chain, only |a₁| given: size W1 ${IDEAL[0]} → ${IDEAL[1]} Å · lengths ${LKL[0]}–${LKL[1]} nats from Gaussian, size ${RGKL} (n30 §5)`, CARD.x + bw + 8, 866, { font: font.mono, size: 11, color: P.body, alpha: iA });
    }

    // ---- the plane ----
    const plA = seg(c, 48, 49.5);
    if (plA > 0.003) {
      ctx.save();
      ctx.globalAlpha *= plA;
      ctx.strokeStyle = P.line;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(PLANE.x, PLANE.y, PLANE.w, PLANE.h);
      ctx.restore();
      for (const b of [1e-4, 1e-3, 1e-2]) text(ctx, b === 1e-4 ? '10⁻⁴' : b === 1e-3 ? '10⁻³' : '10⁻²', px(b), PLANE.y + PLANE.h + 18, { font: font.mono, size: 12, color: P.muted, align: 'center', alpha: plA });
      for (const r of [0.05, 0.1, 0.2, 0.5, 1]) {
        text(ctx, String(r), PLANE.x - 8, py(r) + 4, { font: font.mono, size: 11, color: P.muted, align: 'right', alpha: plA });
        line(ctx, PLANE.x, py(r), PLANE.x + PLANE.w, py(r), { color: P.grid, width: 1, alpha: plA });
      }
      text(ctx, 'bond W1 (Å, log)', PLANE.x + PLANE.w, PLANE.y + PLANE.h + 38, { font: font.mono, size: 12, color: P.muted, align: 'right', alpha: plA });
      text(ctx, 'size error, Rg W1 (Å, log)', PLANE.x, PLANE.y - 12, { font: font.mono, size: 12, color: P.muted, alpha: plA });
      // floors and the registered corner
      line(ctx, px(FLOOR_BOND), PLANE.y, px(FLOOR_BOND), PLANE.y + PLANE.h, { color: P.dim, width: 1, dash: [3, 4], alpha: plA });
      text(ctx, `bond floor ${FLOOR_BOND}`, px(FLOOR_BOND) + 4, PLANE.y + 14, { font: font.mono, size: 10, color: P.dim, alpha: plA });
      text(ctx, `size floor ${FLOOR_RG} Å, below the plot`, PLANE.x + PLANE.w - 6, PLANE.y + PLANE.h - 8, { font: font.mono, size: 10, color: P.dim, align: 'right', alpha: plA });
      const cA = seg(c, 72, 73.5);
      ctx.save();
      ctx.globalAlpha *= cA;
      ctx.strokeStyle = P.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(PLANE.x, py(CORNER.rg), px(CORNER.bond) - PLANE.x, PLANE.y + PLANE.h - py(CORNER.rg));
      ctx.restore();
      text(ctx, 'registered corner · #1071, declared 11-14', PLANE.x + 6, PLANE.y + PLANE.h - 22, { font: font.mono, size: 10, color: P.gold, alpha: cA });
      text(ctx, `bond ≤ ${CORNER.bond} Å · size ≤ ${CORNER.rg} Å`, PLANE.x + 6, PLANE.y + PLANE.h - 8, { font: font.mono, size: 10, color: P.gold, alpha: cA });
      // the dots move from internal (C3) to ordered, seed by seed
      const mv = two ? (live.exploring ? 1 : seg(t, 76, 82)) : 0;
      [0, 1].forEach((s) => {
        const b = Math.exp(lerp(Math.log(C3_BOND[s]), Math.log(ORD_BOND[s]), mv));
        const r = Math.exp(lerp(Math.log(C3_RG[s]), Math.log(ORD_RG[s]), mv));
        const x = px(b);
        const y = py(r);
        dot(ctx, x, y, 6.5, mv > 0.5 ? P.global : P.body, plA);
        if (mv > 0.5) {
          ctx.save();
          ctx.globalAlpha *= plA;
          ctx.strokeStyle = P.global;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();
        }
        const inside = ORD_RG[s] <= CORNER.rg && ORD_BOND[s] <= CORNER.bond;
        const lab = mv < 0.05 ? `internal s${s + 2} ${num(C3_RG[s])}` : mv > 0.95 ? `ordered s${s + 2} ${num(ORD_RG[s])} ${inside ? 'inside' : `outside by ${num(ORD_RG[s] - CORNER.rg, 3)} Å`}` : '';
        if (lab) text(ctx, lab, x + 16, y + (s ? 16 : -8), { font: font.mono, size: 11, color: mv > 0.95 ? (inside ? P.ink : P.wall) : P.body, alpha: plA });
      });
      // the tie with the best Cartesian-family models is not hidden: size is still behind them
      budget(ctx, 'r1088.ordered.rg', PLANE.x, PLANE.y + PLANE.h + 58, { alpha: plA, size: 10 });
      badge(ctx, 'M', PLANE.x + 196, PLANE.y - 16, { alpha: plA, size: 11 });
    }

    // ---- the open question ----
    const qA = seg(c, 87, 88.5);
    stamp(ctx, 'MECHANISM UNTESTED', PLANE.x + PLANE.w, 150 + 0 * qA, { colour: P.wall, alpha: qA, size: 13, align: 'right' });
    text(ctx, 'order or correction? #1137 separates them (declared 11-18, not run)', PLANE.x, PLANE.y + PLANE.h + 78, { font: font.mono, size: 12, color: P.ink, alpha: qA });
    const mustA = seg(c, 90, 91.5);
    const bw = badge(ctx, 'H', PLANE.x, PLANE.y + PLANE.h + 104, { alpha: mustA, size: 11 });
    text(ctx, 'Must M6 · order: size erased last · ✓ size and mode lengths; chain distances first order only', PLANE.x + bw + 8, PLANE.y + PLANE.h + 108, { font: font.mono, size: 10, color: P.body, alpha: mustA });

    rigStamp(ctx, 'lane: first order (lab 11-18) · modes: collective_modes.json · plane: #1088', laneA);
  },
});
