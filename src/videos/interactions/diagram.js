// The master diagram: a perspective box whose floor holds the two own shapes (water's angle θ
// across, peroxide's torsion τ into the page) and whose vertical fibres carry one pose
// coordinate, u = cos∠(b̂_A, c_B − c_A). Points are given in box coordinates a, b, f ∈ [0, 1].

import { color, type, font, camera, rgba, hexToRgb, text, splitLines, polyline3, polygon3 } from '../../kit.js';
import { buildWater, buildPeroxide, WATER, DEG } from './toy.js';
import { POSE, VERTICAL, HORIZONTAL, SCORE_W, SCORE_P, INTER, WATER_MOL, PEROXIDE_MOL, moleculeThumb, scoreArrow, mixHex } from './shared.js';

export const RANGE = { theta: [92, 117], tau: [-180, 180], u: [-1, 1] };
export const RANGE_17 = { theta: [100, 150], delta: [-0.45, 0.45], u: [-1, 1] };
export const FIBRE_SITES = { theta: [97, 104.52, 112], tau: [-120, -60, 0, 60, 120, 180] };
export const PROFILE_SITES = [[104.52, -120], [104.52, 0], [104.52, 120]];
const THETA0 = 104.52;

/**
 * Eye above the floor: with the kit camera a negative pitch looks down (checked: near floor edge lowest
 * on screen). Molecule cameras with a positive pitch (e.g. the title's +0.32) put the eye below the
 * molecule: a ring drawn under a molecule is then seen nearly edge-on and from below.
 */
export const diagramCamera = (options = {}) => camera({ cx: 430, cy: 450, scale: 105, yaw: -0.6, pitch: -0.38, focal: 12, ...options });

/** Box coordinates → world: a across, b into the page, f up. */
export const diagPoint = (a, b, f) => [4 * (a - 0.5), -1.4 + 2.8 * f, 4 * (b - 0.5)];

const SPANS = { theta: RANGE.theta, thetaWide: RANGE_17.theta, tau: RANGE.tau, delta: RANGE_17.delta };
const kind = (mapping, axis, fallback) => (typeof mapping === 'string' ? mapping : mapping?.[axis] ?? fallback);
const unit = (v, [lo, hi]) => (v - lo) / (hi - lo);
/** θ in degrees → a. mapping: 'theta' | 'thetaWide', or a floor mapping { a, b }. */
export const toA = (deg, mapping = 'theta') => unit(deg, SPANS[kind(mapping, 'a', 'theta')]);
/** τ in degrees (or δ in Å) → b. mapping: 'tau' | 'delta', or a floor mapping { a, b }. */
export const toB = (value, mapping = 'tau') => unit(value, SPANS[kind(mapping, 'b', 'tau')]);
export const toF = (u) => (u + 1) / 2;
const site = ([theta, tau]) => [toA(theta), toB(tau)];

const RAMP = [[0, '#0d1321'], [0.3, '#163050'], [0.6, '#1f6b7e'], [0.85, '#6db0a6'], [1, '#f0d27a']].map(([s, hex]) => [s, hexToRgb(hex)]);
/** Density colour for x ∈ [0, 1], the stops of draw/heatmap.js. */
export function rampColour(x) {
  const v = Math.min(1, Math.max(0, x));
  let k = 1;
  while (k < RAMP.length - 1 && v > RAMP[k][0]) k++;
  const u = (v - RAMP[k - 1][0]) / (RAMP[k][0] - RAMP[k - 1][0]);
  const c = RAMP[k - 1][1].map((c0, i) => Math.round(c0 + (RAMP[k][1][i] - c0) * u));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ---- floor -----------------------------------------------------------------------

/**
 * The floor: optional density (rows over a, columns over b; any size, 24 × 48 by default in the
 * scenes; drawn like a heatmap as (density / max)^gamma, max by default its own maximum: pass a fixed
 * max to show blurring as dimming), a faint 5 × 12 grid, the outline and the permanent caption (true,
 * another string, e.g. for scene 17's floor, or [[string, alpha], …] to crossfade captions).
 * densityAlpha fades the density alone.
 */
export function drawFloor(ctx, cam, { density = null, alpha = 1, grid = true, caption = true, max = null, gamma = 0.75, densityAlpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  if (density && densityAlpha > 0.003) {
    const na = density.length, nb = density[0].length;
    const top = max ?? (Math.max(...density.map((row) => Math.max(...row))) || 1);
    const P = Array.from({ length: na + 1 }, (_, i) => Array.from({ length: nb + 1 }, (_, j) => cam.project(diagPoint(i / na, j / nb, 0))));
    ctx.save();
    ctx.globalAlpha *= alpha * densityAlpha;
    ctx.lineWidth = 0.8;
    ctx.lineJoin = 'round';
    for (let i = 0; i < na; i++) {
      for (let j = 0; j < nb; j++) {
        const fill = rampColour(Math.pow(Math.max(0, density[i][j]) / top, gamma));
        ctx.fillStyle = fill;
        ctx.strokeStyle = fill;
        ctx.beginPath();
        ctx.moveTo(P[i][j].x, P[i][j].y);
        ctx.lineTo(P[i + 1][j].x, P[i + 1][j].y);
        ctx.lineTo(P[i + 1][j + 1].x, P[i + 1][j + 1].y);
        ctx.lineTo(P[i][j + 1].x, P[i][j + 1].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  if (grid) {
    for (let i = 1; i < 5; i++) polyline3(ctx, cam, [diagPoint(i / 5, 0, 0), diagPoint(i / 5, 1, 0)], { color: HORIZONTAL, width: 1, alpha: 0.22 * alpha });
    for (let j = 1; j < 12; j++) polyline3(ctx, cam, [diagPoint(0, j / 12, 0), diagPoint(1, j / 12, 0)], { color: HORIZONTAL, width: 1, alpha: 0.22 * alpha });
  }
  const corners = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].map(([a, b]) => diagPoint(a, b, 0));
  polyline3(ctx, cam, corners, { color: HORIZONTAL, width: 2, alpha: 0.75 * alpha });
  if (caption) {
    const near = cam.project(diagPoint(0, 0, 0));
    const captions = Array.isArray(caption) ? caption : [[caption === true ? FLOOR_CAPTION : caption, 1]];
    for (const [str, a] of captions) text(ctx, str, near.x, near.y + 84, { ...type.note, color: HORIZONTAL, align: 'center', alpha: alpha * a });
  }
}
export const FLOOR_CAPTION = 'floor: the two own shapes (stiff bonds at rest)';

const AXES = {
  theta: { ticks: [92, THETA0, 117], label: (v) => `${v === THETA0 ? '104.5' : v}°`, title: 'A · water angle θ', tint: SCORE_W, thumb: (v) => buildWater(WATER.r0, WATER.r0, v * DEG) },
  thetaWide: { ticks: [100, 125, 150], label: (v) => `${v}°`, title: 'A · water angle θ', tint: SCORE_W, thumb: (v) => buildWater(WATER.r0, WATER.r0, v * DEG) },
  // ±112° are peroxide's two minima (τ₀ = 111.8°), not fibre sites; ±180° are labelled by the wrap glyph
  tau: { ticks: [-180, -112, 0, 112, 180], label: (v) => (Math.abs(v) === 180 ? '' : `${v < 0 ? '−' : ''}${Math.abs(v)}°`), title: 'B · peroxide torsion τ', tint: SCORE_P, thumb: (v) => buildPeroxide({ tau: v * DEG }) },
  delta: { ticks: [-0.4, 0, 0.4], label: (v) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v)} Å`, title: 'A · bonds δ = r₁ − r₂', tint: SCORE_W, thumb: (v) => buildWater(WATER.r0 + v / 2, WATER.r0 - v / 2) },
};
const STANDARD = { a: 'theta', b: 'tau' };

/**
 * Axis ticks, labels, titles and molecule thumbnails at the ticks: across along the front-right
 * edge (b = 0), into the page along the front-left edge (a = 0). mapping: { a, b }. morph:
 * 0 shows the standard axes (θ, τ), 1 shows `mapping`'s; in between the old labels fade out over the
 * first half and the new ones fade in over the second, so they never overlap (scene 17). The label
 * layout is clean for camera yaw in about [−0.75, −0.45].
 */
export function drawFloorAxes(ctx, cam, { alpha = 1, thumbnails = true, mapping = STANDARD, morph = 1 } = {}) {
  if (alpha <= 0.003) return;
  const target = { a: kind(mapping, 'a', 'theta'), b: kind(mapping, 'b', 'tau') };
  for (const axis of ['a', 'b']) {
    if (target[axis] === STANDARD[axis]) drawAxis(ctx, cam, axis, STANDARD[axis], alpha, thumbnails);
    else {
      drawAxis(ctx, cam, axis, STANDARD[axis], alpha * Math.max(0, 1 - 2 * morph), thumbnails);
      drawAxis(ctx, cam, axis, target[axis], alpha * Math.max(0, 2 * morph - 1), thumbnails);
    }
  }
}

function drawAxis(ctx, cam, axis, name, alpha, thumbnails) {
  if (alpha <= 0.003) return;
  const spec = AXES[name];
  const along = axis === 'a';
  const at = (s, out) => (along ? diagPoint(s, -out, 0) : diagPoint(-out, s, 0));
  // screen direction pointing away from the floor across this edge
  const outward = (s, px) => {
    const p = cam.project(at(s, 0)), q = cam.project(at(s, 0.1));
    const L = Math.hypot(q.x - p.x, q.y - p.y);
    return { x: p.x + ((q.x - p.x) / L) * px, y: p.y + ((q.y - p.y) / L) * px };
  };
  const span = SPANS[name];
  const k = cam.scale / 105; // thumbnails and their offsets scale with the diagram
  // screen direction along the edge, to pull the end labels inwards, away from the corner
  const e0 = cam.project(at(0, 0)), e1 = cam.project(at(1, 0));
  const eL = Math.hypot(e1.x - e0.x, e1.y - e0.y) || 1, ex = (e1.x - e0.x) / eL, ey = (e1.y - e0.y) / eL;
  for (const v of spec.ticks) {
    const s = unit(v, span);
    polyline3(ctx, cam, [at(s, 0), at(s, 0.035)], { color: spec.tint, width: 2, alpha });
    const p = outward(s, 28);
    const inward = s < 0.01 ? 10 : s > 0.99 ? -10 : 0;
    text(ctx, spec.label(v), p.x + ex * inward, p.y + ey * inward, { font: font.mono, size: 15, color: color.body, align: 'center', baseline: 'middle', alpha });
    // peroxide at ±112° and 0° only: a 180° thumbnail would crowd the 112° one
    if (thumbnails && !(name === 'tau' && Math.abs(v) === 180)) {
      const q = outward(s, (along ? 68 : 86) * k);
      if (name === 'tau') moleculeThumb(ctx, q.x, q.y, spec.thumb(v), PEROXIDE_MOL, { scale: 26 * k, yaw: 1.25, pitch: 0.25, alpha });
      else moleculeThumb(ctx, q.x, q.y, spec.thumb(v), WATER_MOL, { scale: 30 * k, alpha });
    }
  }
  // the title runs along the edge, outside the thumbnails
  const mid = outward(0.5, thumbnails ? (along ? 112 : 160) * k : 60);
  let angle = Math.atan2(e1.y - e0.y, e1.x - e0.x);
  if (Math.abs(angle) > Math.PI / 2) angle += Math.PI;
  ctx.save();
  ctx.translate(mid.x, mid.y);
  ctx.rotate(angle);
  text(ctx, spec.title, 0, 0, { ...type.label, color: spec.tint, align: 'center', baseline: 'middle', alpha });
  ctx.restore();
  if (name === 'tau') {
    // the far end's label: 180° and the wrap in one, above the corner (clear of the thumbnails)
    const end = cam.project(at(1, 0));
    text(ctx, '−180° ≡ 180°', end.x - 8, end.y - 22, { ...type.note, align: 'center', alpha });
  }
}

// ---- fibres ----------------------------------------------------------------------

export const ALL_SITES = FIBRE_SITES.theta.flatMap((theta) => FIBRE_SITES.tau.map((tau) => [theta, tau]));
const same = ([t1, s1], [t2, s2]) => Math.abs(t1 - t2) < 1e-6 && Math.abs(s1 - s2) < 1e-6;
/** How strongly a site is highlighted: highlight entries are [θ, τ] (fully) or [θ, τ, amount]. */
const highlightOf = (highlight, s) => highlight.reduce((m, h) => (same(h, s) ? Math.max(m, h[2] ?? 1) : m), 0);
const isCentre = (s, mapping) => kind(mapping, 'a', 'theta') === 'theta' && Math.abs(s[0] - THETA0) < 1e-6;

/** One fibre line at a site, rising to height `rise` (0 … 1); on: highlight amount 0 … 1 (thick and bright). */
function fibreLine(ctx, cam, s, { alpha = 1, on = 0, rise = 1, mapping = STANDARD } = {}) {
  if (alpha <= 0.003 || rise <= 0.002) return;
  const a = toA(s[0], mapping), b = toB(s[1], mapping);
  const [w, o] = isCentre(s, mapping) ? [2.2, 0.85] : [1.5, 0.5];
  polyline3(ctx, cam, [diagPoint(a, b, 0), diagPoint(a, b, rise)], { color: POSE, width: w + (3.5 - w) * on, alpha: alpha * (o + (1 - o) * on) });
}

/**
 * Teal fibres at the 3 × 6 sites ([θ, τ] in degrees), the centre line θ₀ brighter, each topped by
 * a gold ring (an orientation torsor) next to a teal three-arm cross (ℝ³). highlight: [θ, τ] sites
 * drawn thick, or [θ, τ, amount] to fade a highlight in and out. sites: a subset (the silhouette
 * uses PROFILE_SITES), in `mapping`'s units (scene 17: [θ, δ] with MAPPING_17). rise: 0 … 1, a
 * number or a function of the site's index, for fibres growing from the floor (glyphs ride the
 * tops). lines: false draws glyphs and caption only (drawMaster draws the lines in depth order).
 * The caption sits 30 px above the highest fibre top: scene captions over the diagram avoid it.
 */
export function drawFibres(ctx, cam, { alpha = 1, highlight = [], glyphs = true, caption = true, sites = ALL_SITES, mapping = STANDARD, rise = 1, lines = true } = {}) {
  if (alpha <= 0.003) return;
  const riseOf = (k) => (typeof rise === 'function' ? rise(k) : rise);
  sites.forEach((s, k) => {
    const on = highlightOf(highlight, s), h = riseOf(k);
    if (lines) fibreLine(ctx, cam, s, { alpha, on, rise: h, mapping });
    if (glyphs && h > 0.002) {
      const top = cam.project(diagPoint(toA(s[0], mapping), toB(s[1], mapping), h));
      fibreGlyph(ctx, top.x, top.y - 9, alpha * Math.min(1, 1.5 * h) * (isCentre(s, mapping) ? 1 : 0.6 + 0.4 * on));
    }
  });
  if (caption) {
    const tops = sites.map((s) => cam.project(diagPoint(toA(s[0], mapping), toB(s[1], mapping), 1)));
    const first = tops.reduce((m, p) => (p.x < m.x ? p : m));
    const highest = Math.min(...tops.map((p) => p.y));
    text(ctx, 'one of six pose coordinates drawn', first.x - 10, highest - 30, { ...type.note, color: POSE, alpha });
  }
}

/** A fibre's top glyph at (x, y): a gold ring (an orientation torsor) next to a teal three-arm cross (ℝ³). */
export function fibreGlyph(ctx, x, y, alpha = 1) {
  if (alpha <= 0.003) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = VERTICAL;
  ctx.beginPath();
  ctx.arc(x - 6, y, 4.5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = POSE;
  ctx.beginPath();
  for (const phi of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
    ctx.moveTo(x + 7, y);
    ctx.lineTo(x + 7 + 5.5 * Math.cos(phi), y + 5.5 * Math.sin(phi));
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * The u axis on one fibre: ticks −1, 0, +1 with their labels left of the fibre (profiles grow to its
 * right) on dark backings, so neighbouring glyphs and fibres do not cross them and a cursor on the
 * fibre (radius 10) does not touch them; and the letter u.
 */
export function drawUAxis(ctx, cam, { site: s = [THETA0, 120], alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  const [a, b] = site(s);
  ctx.save();
  ctx.font = `400 15px ${font.mono}`;
  for (const u of [-1, 0, 1]) {
    const p = cam.project(diagPoint(a, b, toF(u)));
    const label = u > 0 ? '+1' : u < 0 ? '−1' : '0';
    const w = ctx.measureText(label).width;
    const x = p.x - 14 - w, y = p.y;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = rgba(color.bg, 0.78);
    ctx.fillRect(x - 3, y - 10, w + 6, 20);
    ctx.strokeStyle = POSE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - 6, p.y);
    ctx.lineTo(p.x + 6, p.y);
    ctx.stroke();
    ctx.restore();
    text(ctx, label, x, y, { font: font.mono, size: 15, color: POSE, baseline: 'middle', alpha });
  }
  ctx.restore();
  const top = cam.project(diagPoint(a, b, 1));
  text(ctx, 'u', top.x - 42, top.y + 8, { font: font.display, italic: true, size: 26, color: POSE, align: 'right', alpha });
}

/**
 * A density profile in the fibre's own vertical plane: points (a + width·mass·p/pMax, b, f(u)),
 * filled, with a ±1 s.e. band. pMax defaults to the profile's own maximum; pass a common one to
 * compare profiles. steps: p is a histogram of equal bins on [−1, 1] (u not needed), drawn as
 * steps. dashed: an unfilled dashed outline (e.g. a reference beside a filled target).
 */
export function drawFibreProfile(ctx, cam, a, b, { u = null, p, se = null }, { colour = POSE, alpha = 1, width = 0.08, mass = 1, band = true, pMax = null, steps = false, dashed = false } = {}) {
  if (alpha <= 0.003) return;
  const top = pMax ?? Math.max(...p);
  const k = (width * mass) / top;
  if (steps) {
    const n = p.length, edge = (j) => -1 + (2 * j) / n;
    const pts = [diagPoint(a, b, 0)];
    p.forEach((v, j) => pts.push(diagPoint(a + k * Math.max(0, v), b, toF(edge(j))), diagPoint(a + k * Math.max(0, v), b, toF(edge(j + 1)))));
    pts.push(diagPoint(a, b, 1));
    if (!dashed) polygon3(ctx, cam, pts, { fill: rgba(mixHex(colour, '#ffffff', 0.25), 0.32), alpha });
    polyline3(ctx, cam, pts, { color: colour, width: 2.2, alpha, dash: dashed ? [6, 5] : [] });
    return;
  }
  const point = (i, v) => diagPoint(a + k * Math.max(0, v), b, toF(u[i]));
  const curve = u.map((_, i) => point(i, p[i]));
  if (dashed) {
    polyline3(ctx, cam, curve, { color: colour, width: 2.2, alpha, dash: [6, 5] });
    return;
  }
  if (band && se) {
    const upper = u.map((_, i) => point(i, p[i] + se[i]));
    const lower = u.map((_, i) => point(i, p[i] - se[i])).reverse();
    polygon3(ctx, cam, [...upper, ...lower], { fill: rgba(mixHex(colour, '#ffffff', 0.35), 0.22), alpha });
  }
  polygon3(ctx, cam, [diagPoint(a, b, toF(u[0])), ...curve, diagPoint(a, b, toF(u[u.length - 1]))], { fill: rgba(mixHex(colour, '#ffffff', 0.25), 0.32), alpha });
  polyline3(ctx, cam, curve, { color: colour, width: 2.2, alpha });
}

/** Orange bar at a fibre's foot, height in fibre units (f), e.g. ∝ log Z_pose; negative goes down. */
export function drawFootBar(ctx, cam, a, b, height, { colour = INTER, alpha = 1, width = 9 } = {}) {
  if (alpha <= 0.003 || Math.abs(height) < 1e-4) return;
  const pts = [diagPoint(a, b, 0), diagPoint(a, b, height)];
  polyline3(ctx, cam, pts, { color: '#05080f', width: width + 4, alpha });
  polyline3(ctx, cam, pts, { color: colour, width, alpha });
}

/**
 * Arrow at box point (a, b, f) for a push-forward { dTheta, dTau (degrees), du } (toy.js
 * pushforward), mapped to box units and multiplied by scale. dashed: the plug-in style.
 * Returns the projected tip.
 */
export function drawDiagramArrow(ctx, cam, a, b, f, { dTheta = 0, dTau = 0, du = 0 }, { colour, scale = 1, label = null, alpha = 1, dashed = false, mapping = STANDARD } = {}) {
  const da = dTheta / (SPANS[kind(mapping, 'a', 'theta')][1] - SPANS[kind(mapping, 'a', 'theta')][0]);
  const db = dTau / (SPANS[kind(mapping, 'b', 'tau')][1] - SPANS[kind(mapping, 'b', 'tau')][0]);
  const p = cam.project(diagPoint(a, b, f));
  const q = cam.project(diagPoint(a + scale * da, b + scale * db, f + (scale * du) / 2));
  scoreArrow(ctx, p.x, p.y, q.x, q.y, { colour, alpha, dashed, hollow: dashed });
  if (label) text(ctx, label, q.x + 10, q.y - 8, { ...type.note, color: colour, alpha });
  return q;
}

/** White cursor at a box point, with a faint drop line to the floor. */
export function drawCursor(ctx, cam, a, b, f, { alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  polyline3(ctx, cam, [diagPoint(a, b, 0), diagPoint(a, b, f)], { color: color.ink, width: 1.2, alpha: 0.45 * alpha, dash: [3, 5] });
  const s = cam.project(diagPoint(a, b, f));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color.ink;
  ctx.strokeStyle = '#05080f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 7, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

const POP_CAPTION = 'one of many pairs at this height: the other five pose numbers chosen';

/**
 * Pop-out: a dashed teal leader from a box point to a circular window that shows the
 * configuration the point stands for. drawContent(ctx, windowCam) runs inside the clip; the
 * window camera looks at `center` (default the origin) at pxPerA (default 55 px/Å for r 190).
 * caption: true for the standard sentence, or a string.
 */
export function popOut(ctx, cam, a, b, f, { cx, cy, r, pxPerA = (55 / 190) * r, yaw = 0.35, pitch = 0.3, center = [0, 0, 0] }, drawContent, { alpha = 1, caption = false } = {}) {
  if (alpha <= 0.003) return;
  const s = cam.project(diagPoint(a, b, f));
  const d = Math.hypot(cx - s.x, cy - s.y) || 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = POSE;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(cx - ((cx - s.x) / d) * r, cy - ((cy - s.y) / d) * r);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = color.panel;
  ctx.fill();
  ctx.save();
  ctx.clip();
  drawContent(ctx, camera({ cx, cy, scale: pxPerA, yaw, pitch, focal: 30, center }));
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = POSE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  drawCursor(ctx, cam, a, b, f, { alpha });
  if (caption) {
    const lines = splitLines(ctx, caption === true ? POP_CAPTION : caption, Math.max(2 * r + 80, 640), type.note); // one line at any r
    lines.forEach((line, k) => text(ctx, line, cx, cy + r + 30 + 21 * k, { ...type.note, color: POSE, align: 'center', alpha }));
  }
}

/** Small soft-blue horizontal tiles: tilt = df/da and df/db in box units; size large enough for tilts of order 0.4 to read. */
export function drawTiles(ctx, cam, tiles, { alpha = 1, size = 0.055 } = {}) {
  if (alpha <= 0.003) return;
  const quads = tiles.map(({ a, b, f, tiltA = 0, tiltB = 0 }) => {
    const corner = (i, j) => diagPoint(a + i * size, b + j * size, f + size * (i * tiltA + j * tiltB));
    return { pts: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], depth: cam.project(diagPoint(a, b, f)).z };
  });
  quads.sort((p, q) => q.depth - p.depth);
  for (const { pts } of quads) polygon3(ctx, cam, pts, { fill: rgba(HORIZONTAL, 0.2), stroke: rgba(HORIZONTAL, 0.85), width: 1.5, alpha });
}

/** Scene 17's floor mapping (θ wide, δ = r₁ − r₂). */
export const MAPPING_17 = { a: 'thetaWide', b: 'delta' };

/** data.holonomy.tiles ({ theta, delta, u, duDTheta per degree, duDDelta per Å }) → drawTiles input in box units. */
export const holonomyTiles = (tiles, mapping = MAPPING_17) => tiles.map(({ theta, delta, u, duDTheta, duDDelta }) => ({
  a: toA(theta, mapping), b: toB(delta, mapping), f: toF(u),
  tiltA: (duDTheta / 2) * (SPANS[kind(mapping, 'a', 'theta')][1] - SPANS[kind(mapping, 'a', 'theta')][0]),
  tiltB: (duDDelta / 2) * (SPANS[kind(mapping, 'b', 'tau')][1] - SPANS[kind(mapping, 'b', 'tau')][0]),
}));

/**
 * @typedef {{
 *   floor?:    { density?: number[][] | null, alpha: number, mapping?: { a: 'theta' | 'thetaWide', b: 'tau' | 'delta' },
 *                morph?: number, axes?: number, caption?: boolean | string | [string, number][], thumbnails?: boolean,
 *                max?: number, gamma?: number, densityAlpha?: number },
 *   fibres?:   { alpha: number, highlight?: ([number, number] | [number, number, number])[], glyphs?: boolean, caption?: boolean,
 *                sites?: [number, number][], rise?: number | ((k) => number) },
 *   uAxis?:    { alpha: number, site?: [number, number] } | null,
 *   profiles?: { site: [number, number], profile: {u, p, se}, mass?: number, alpha: number, pMax?: number, band?: boolean,
 *                width?: number, steps?: boolean, dashed?: boolean, colour?: string, under?: (ctx, cam) => void }[],
 *   footBars?: { site: [number, number], height: number, alpha: number }[],
 *   arrows?:   { a: number, b: number, f: number, d: {dTheta, dTau, du}, colour: string, scale: number, dashed?: boolean, label?: string, alpha?: number }[],
 *   paths?:    { points: [number, number, number][], colour: string, alpha: number, dashed?: boolean, width?: number }[],
 *   tiles?:    { a, b, f, tiltA, tiltB }[] | null, tileAlpha?: number, tileSize?: number,
 *   cursor?:   { a: number, b: number, f: number, alpha?: number } | null,
 *   popOut?:   { a, b, f, cx, cy, r, pxPerA?, yaw?, pitch?, center?, content: (ctx, cam) => void, caption?: boolean | string, alpha?: number } | null,
 *   camera?:   object,
 *   alpha?:    number
 * }} MasterState
 * Sites are [θ, τ] in degrees; a, b, f are box coordinates (toA, toB, toF). A profile's `under`
 * draws just before that profile (e.g. a histogram behind it).
 */

/**
 * The whole diagram: floor and axes; then site by site from far to near the fibre line, its
 * profiles and its foot bar (so near ones cover far ones); the fibre glyphs and caption, the u axis,
 * arrows, paths, tiles, cursor and pop-out.
 */
export function drawMaster(ctx, state) {
  const cam = state.camera ?? diagramCamera();
  const g = state.alpha ?? 1;
  const { floor, fibres, uAxis, profiles = [], footBars = [], arrows = [], paths = [], tiles, cursor, popOut: pop } = state;
  if (floor) {
    const { density = null, alpha, caption = true, max = null, gamma, densityAlpha } = floor;
    drawFloor(ctx, cam, { density, alpha: g * alpha, caption, max, gamma, densityAlpha });
    drawFloorAxes(ctx, cam, { alpha: g * (floor.axes ?? floor.alpha), mapping: floor.mapping ?? STANDARD, morph: floor.morph ?? 1, thumbnails: floor.thumbnails ?? true });
  }
  // depth-ordered columns: fibre line, profiles, foot bar
  const mapping = fibres?.mapping ?? STANDARD;
  const fibreSites = fibres ? fibres.sites ?? ALL_SITES : [];
  const keys = new Map();
  const column = (s, m) => {
    const key = `${s[0]}|${s[1]}|${m === STANDARD ? '' : 'm'}`;
    if (!keys.has(key)) keys.set(key, { s, m, depth: cam.project(diagPoint(toA(s[0], m), toB(s[1], m), 0.5)).z, fibre: null, profiles: [], bars: [] });
    return keys.get(key);
  };
  fibreSites.forEach((s, k) => { column(s, mapping).fibre = k; });
  for (const p of profiles) column(p.site, STANDARD).profiles.push(p);
  for (const bar of footBars) column(bar.site, STANDARD).bars.push(bar);
  const riseOf = (k) => (typeof fibres?.rise === 'function' ? fibres.rise(k) : fibres?.rise ?? 1);
  for (const c of [...keys.values()].sort((p, q) => q.depth - p.depth)) {
    if (c.fibre !== null) fibreLine(ctx, cam, c.s, { alpha: g * fibres.alpha, on: highlightOf(fibres.highlight ?? [], c.s), rise: riseOf(c.fibre), mapping });
    for (const { site: s, profile, alpha, under, ...o } of c.profiles) {
      if (under) under(ctx, cam);
      drawFibreProfile(ctx, cam, ...site(s), profile, { ...o, alpha: g * alpha });
    }
    for (const { site: s, height, alpha } of c.bars) drawFootBar(ctx, cam, ...site(s), height, { alpha: g * alpha });
  }
  if (fibres) drawFibres(ctx, cam, { ...fibres, alpha: g * fibres.alpha, lines: false });
  if (uAxis) drawUAxis(ctx, cam, { ...uAxis, alpha: g * uAxis.alpha });
  for (const { a, b, f, d, alpha = 1, ...o } of arrows) drawDiagramArrow(ctx, cam, a, b, f, d, { ...o, alpha: g * alpha });
  for (const { points, colour, alpha, dashed, width = 3 } of paths) {
    polyline3(ctx, cam, points.map((p) => diagPoint(...p)), { color: colour, width, alpha: g * alpha, dash: dashed ? [7, 6] : [] });
  }
  if (tiles) drawTiles(ctx, cam, tiles, { alpha: g * (state.tileAlpha ?? 1), size: state.tileSize });
  if (cursor) drawCursor(ctx, cam, cursor.a, cursor.b, cursor.f, { alpha: g * (cursor.alpha ?? 1) });
  if (pop) {
    const { a, b, f, content, caption = false, alpha = 1, ...window } = pop;
    popOut(ctx, cam, a, b, f, window, content, { alpha: g * alpha, caption });
  }
}

/** Screen position of a box point (for labels placed by scenes). */
export const project = (cam, a, b, f) => cam.project(diagPoint(a, b, f));
