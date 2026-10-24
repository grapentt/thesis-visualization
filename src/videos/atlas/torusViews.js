// Drawing for the torus flow of torusFlow.js, in the look of explorables/torus-flow.html:
// the shaded torus coloured by the density p with its particles, the flat (θ, φ) chart
// with glued edges or walls, and the readouts with their sparkline.
// Geometry, colours and the target image are computed once, at load. A frame only rotates,
// projects, sorts and fills, into reused typed arrays, so drawing allocates nothing per
// particle, cell or trail point.

import { camera } from '../../model/camera.js';
import { color, type } from '../../draw/theme.js';
import { rgba } from '../../draw/color.js';
import { text, formatNumber } from '../../draw/text.js';
import { TAU, N, NT, TRAIL, B, SPARK, EVENTS, EVENT_LIFE, ptil, PMAX } from './torusFlow.js';

// ---------- colours ----------

const PARTICLE = '#ffffff';
const TRACER = '#ff6a3d';
const SEAM_THETA = '#ff4fd8'; // meridian θ = 0: the chart's left and right edges
const SEAM_PHI = '#f2f2f2'; // outer equator φ = 0: the chart's bottom and top edges
const GLUED_ACCENT = '#3fd0b8';
const WALLED_ACCENT = '#ff8a5c';
const WALL = '#9aa0b3';
const CHART_PARTICLE = rgba(PARTICLE, 0.55);
const CHART_TRAIL = rgba(TRACER, 0.9);
const HATCH_LINE = rgba(WALL, 0.45);

/** The page's viridis stops, sampled into LEVELS colours. */
const VIRIDIS = [[68, 1, 84], [72, 40, 120], [62, 73, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [110, 206, 88], [253, 231, 37]];
const LEVELS = 256;
const PALETTE = new Uint8Array(LEVELS * 3);
for (let l = 0; l < LEVELS; l++) {
  const x = (l / (LEVELS - 1)) * (VIRIDIS.length - 1);
  const i = Math.min(VIRIDIS.length - 2, Math.floor(x));
  for (let c = 0; c < 3; c++) PALETTE[3 * l + c] = Math.round(VIRIDIS[i][c] + (VIRIDIS[i + 1][c] - VIRIDIS[i][c]) * (x - i));
}

/** Palette level of density p (relative to uniform), as the page's cval = (p / PMAX)^0.75. */
const level = (p) => Math.round(Math.min(1, Math.pow(Math.max(0, p) / PMAX, 0.75)) * (LEVELS - 1));

// ---------- camera ----------

const R = 1;
const r = 0.42;

/**
 * Camera for the torus, by default filling the stage box [40, 150, 700, 640] (660 × 490).
 * Perspective as on the page (camera 4.6 radii away). With this camera a negative pitch looks
 * at the torus from above, as the page does, and a positive one from below. Perspective
 * enlarges the near side, so the default cy sits 0.18 · scale above the box centre, which
 * centres the outline at pitch −0.8; with the default cx and cy the outline stays inside the
 * box for pitch −1.0 … −0.5 at any yaw. The torus is drawn correctly at every pitch.
 * The repo camera's view z points away from the viewer, so with the page's parametrisation the
 * torus is the mirror image of the page's: seen from above, θ runs counter-clockwise instead of
 * clockwise, and the density band winds the other way. Part 0's torus has the same handedness.
 */
export const flowCamera = (options = {}) => camera({ yaw: 0.6, pitch: -0.8, scale: 185, cx: 370, cy: 361, focal: 4.6, ...options });

/** The current frame's camera terms (setView). */
const view = { cyaw: 1, syaw: 0, cpitch: 1, spitch: 0, scale: 1, focal: 10, cx: 0, cy: 0, ox: 0, oy: 0, oz: 0 };
/** The last point projected (projectPoint). */
const point = { x: 0, y: 0, depth: 0, facing: 0, nx: 0, ny: 0, nz: 0 };

function setView(cam) {
  view.cyaw = Math.cos(cam.yaw);
  view.syaw = Math.sin(cam.yaw);
  view.cpitch = Math.cos(cam.pitch);
  view.spitch = Math.sin(cam.pitch);
  view.scale = cam.scale;
  view.focal = cam.focal;
  view.cx = cam.cx;
  view.cy = cam.cy;
  const { center } = cam;
  const z = -center[0] * view.syaw + center[2] * view.cyaw;
  view.ox = center[0] * view.cyaw + center[2] * view.syaw;
  view.oy = center[1] * view.cpitch - z * view.spitch;
  view.oz = center[1] * view.spitch + z * view.cpitch;
}

/**
 * Project the world point (x, y, z) with outward normal (nx, ny, nz), as camera.project does.
 * Sets point.x, point.y; point.depth (rotation only, larger = farther); the rotated normal
 * point.nx, ny, nz; and point.facing, the cosine between the normal and the line of sight from
 * the eye (negative where the surface faces the camera).
 */
function projectPoint(x, y, z, nx, ny, nz) {
  const { cyaw, syaw, cpitch, spitch, focal } = view;
  const z1 = -x * syaw + z * cyaw;
  const px = x * cyaw + z * syaw - view.ox;
  const py = y * cpitch - z1 * spitch - view.oy;
  const pz = y * spitch + z1 * cpitch - view.oz;
  const k = (focal / (focal + pz)) * view.scale;
  point.x = view.cx + px * k;
  point.y = view.cy - py * k;
  point.depth = pz + view.oz;
  const n1 = -nx * syaw + nz * cyaw;
  point.nx = nx * cyaw + nz * syaw;
  point.ny = ny * cpitch - n1 * spitch;
  point.nz = ny * spitch + n1 * cpitch;
  const ez = pz + focal; // the eye sits at (0, 0, −focal) in view coordinates
  point.facing = (point.nx * px + point.ny * py + point.nz * ez) / Math.sqrt(px * px + py * py + ez * ez);
}

/** World point and outward normal [x, y, z, nx, ny, nz] of (θ, φ) on a tube of radius rho; for geometry made at load. */
function surfacePoint(theta, phi, rho) {
  const w = R + rho * Math.cos(phi);
  return [w * Math.cos(theta), rho * Math.sin(phi), w * Math.sin(theta), Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
}

/** Project the torus point (θ, φ) on a tube of radius rho (r plus a lift off the surface), allocating nothing. */
function project(theta, phi, rho) {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const cf = Math.cos(phi);
  const sf = Math.sin(phi);
  const w = R + rho * cf;
  projectPoint(w * ct, rho * sf, w * st, cf * ct, sf, cf * st);
}

// ---------- the torus mesh ----------

const NU = 96; // cells around the central hole (θ)
const NV = 36; // cells around the tube (φ)
const CELLS = NU * NV;
/** Heights above the surface of what is drawn on it (world units), as on the page. */
const LIFT = { particle: 0.012, trail: 0.016, tracer: 0.02, seam: 0.004 };
const AMBIENT = 0.62; // the page's light: colour × (0.62 + 0.55 · cos), clipped
const DIFFUSE = 0.55;
const SHADES = 48;
/** Towards the light, in view coordinates: the upper left front, as in src/draw/surface.js. */
const TO_LIGHT = (() => {
  const l = [-0.4, 0.6, -0.7];
  const n = Math.hypot(...l);
  return l.map((c) => c / n);
})();
/** Cells turned this far away are wholly hidden behind the front of the closed surface. */
const CULL = 0.15;
const HIDDEN = 0xffff;

// Vertex (i, j) at θ = 2πi/NU, φ = 2πj/NV has index i·NV + j; cell (i, j) spans to vertex (i + 1, j + 1).
const VX = new Float64Array(CELLS);
const VY = new Float64Array(CELLS);
const VZ = new Float64Array(CELLS);
const CORNERS = new Uint16Array(CELLS * 4);
const CENTRE = new Float64Array(CELLS * 3); // the surface point at each cell's centre
const NORMAL = new Float64Array(CELLS * 3); // and its outward normal
const CELL_LEVEL = new Uint8Array(CELLS);
for (let i = 0; i < NU; i++) {
  for (let j = 0; j < NV; j++) {
    const q = i * NV + j;
    [VX[q], VY[q], VZ[q]] = surfacePoint((i / NU) * TAU, (j / NV) * TAU, r);
    const i1 = ((i + 1) % NU) * NV;
    const j1 = (j + 1) % NV;
    CORNERS.set([i * NV + j, i1 + j, i1 + j1, i * NV + j1], 4 * q);
    const tc = ((i + 0.5) / NU) * TAU;
    const fc = ((j + 0.5) / NV) * TAU;
    const centre = surfacePoint(tc, fc, r);
    CENTRE.set(centre.slice(0, 3), 3 * q);
    NORMAL.set(centre.slice(3), 3 * q);
    CELL_LEVEL[q] = level(ptil(tc, fc));
  }
}

/** Fill style of every palette level under every shade. */
const STYLES = [];
for (let l = 0; l < LEVELS; l++) {
  for (let s = 0; s < SHADES; s++) {
    const shade = AMBIENT + (DIFFUSE * s) / (SHADES - 1);
    const [cr, cg, cb] = [0, 1, 2].map((c) => Math.min(255, Math.round(PALETTE[3 * l + c] * shade)));
    STYLES.push(`rgb(${cr},${cg},${cb})`);
  }
}

// Per-frame buffers.
const SX = new Float64Array(CELLS);
const SY = new Float64Array(CELLS);
const CELL_STYLE = new Uint16Array(CELLS); // index into STYLES, or HIDDEN
/** Visible cells, far to near: depth and cell index packed in one number, so the typed array sorts natively. */
const ORDER = new Float64Array(CELLS);
const DEPTH_RES = 2 ** 20;
const DEPTH_OFFSET = 2; // > every depth: the torus's outer radius 1.42 plus the largest lift
const CELL_SPAN = 4096; // > CELLS
const PX = new Float64Array(N);
const PY = new Float64Array(N);
const FIRST = new Int32Array(CELLS); // particles bucketed per cell: linked lists through NEXT
const NEXT = new Int32Array(N);

/** Project the vertices, cull and shade the cells, and sort the visible ones far to near. Returns their count. */
function prepareMesh() {
  const { cyaw, syaw, cpitch, spitch, scale, focal, cx, cy, ox, oy, oz } = view;
  for (let v = 0; v < CELLS; v++) {
    const z1 = -VX[v] * syaw + VZ[v] * cyaw;
    const pz = VY[v] * spitch + z1 * cpitch - oz;
    const k = (focal / (focal + pz)) * scale;
    SX[v] = cx + (VX[v] * cyaw + VZ[v] * syaw - ox) * k;
    SY[v] = cy - (VY[v] * cpitch - z1 * spitch - oy) * k;
  }
  ORDER.fill(Infinity);
  let visible = 0;
  for (let q = 0; q < CELLS; q++) {
    const o = 3 * q;
    projectPoint(CENTRE[o], CENTRE[o + 1], CENTRE[o + 2], NORMAL[o], NORMAL[o + 1], NORMAL[o + 2]);
    if (point.facing > CULL) {
      CELL_STYLE[q] = HIDDEN;
      continue;
    }
    // light both sides: a cell seen from behind is lit like its front
    const lit = (point.nx * TO_LIGHT[0] + point.ny * TO_LIGHT[1] + point.nz * TO_LIGHT[2]) * (point.facing > 0 ? -1 : 1);
    CELL_STYLE[q] = CELL_LEVEL[q] * SHADES + Math.round(Math.max(0, lit) * (SHADES - 1));
    ORDER[visible++] = Math.round((DEPTH_OFFSET - point.depth) * DEPTH_RES) * CELL_SPAN + q;
  }
  ORDER.sort();
  return visible;
}

/** Index of the mesh cell holding (θ, φ). */
const cellOf = (theta, phi) => Math.min(NU - 1, Math.floor((theta / TAU) * NU)) * NV + Math.min(NV - 1, Math.floor((phi / TAU) * NV));

/** Project the cloud's particles (not the tracers) that face the camera and bucket them per cell. */
function bucketParticles(cloud) {
  FIRST.fill(-1);
  const { x, y } = cloud;
  for (let i = NT; i < N; i++) {
    const q = cellOf(x[i], y[i]);
    if (CELL_STYLE[q] === HIDDEN) continue;
    project(x[i], y[i], r + LIFT.particle);
    if (point.facing >= 0) continue; // on the far side of the outline
    PX[i] = point.x;
    PY[i] = point.y;
    NEXT[i] = FIRST[q];
    FIRST[q] = i;
  }
}

// ---------- seams, trails and tracer heads ----------

// These lines and dots are filed under depth layers and drawn among the cells: each layer right
// before the first cell nearer than the layer's near edge. Counting every item OFFSET nearer than
// it is keeps the surface around it, nearly edge-on close to the outline, from covering it, while
// the other parts of the torus that pass in front of it, much nearer than that, still hide it.
const SEAM_MERIDIAN = 0; // item kinds, drawn in this order within a layer
const SEAM_EQUATOR = 1;
const TRAIL_LINE = 2;
const HEAD = 3;
const KINDS = 4;
const LINE_STYLE = [SEAM_THETA, SEAM_PHI, TRACER];
const LINE_WIDTH = [3, 3, 1.5];
const TRAIL_ALPHA = 0.85;
const HEAD_RADIUS = 4;
const LAYER = 0.06; // depth width of a layer (world units)
const OFFSET = 0.12;
const LAYERS = Math.ceil((2 * DEPTH_OFFSET + OFFSET) / LAYER);
const LAYER_KEY = CELL_SPAN * DEPTH_RES * LAYER; // ORDER key → layer of the cell
const SEAM_POINTS = 96;
/**
 * The seams as world points with normals, [x, y, z, nx, ny, nz] each, in kind order: SEAM_POINTS + 1
 * around the meridian θ = 0, then as many around the outer equator φ = 0.
 */
const SEAM = new Float64Array(2 * (SEAM_POINTS + 1) * 6);
for (let k = 0; k <= SEAM_POINTS; k++) {
  const s = (k / SEAM_POINTS) * TAU;
  SEAM.set(surfacePoint(0, s, r + LIFT.seam), 6 * (SEAM_MERIDIAN * (SEAM_POINTS + 1) + k));
  SEAM.set(surfacePoint(s, 0, r + LIFT.seam), 6 * (SEAM_EQUATOR * (SEAM_POINTS + 1) + k));
}
const ITEMS = 2 * SEAM_POINTS + NT * TRAIL + NT; // seam segments, trail segments, heads
const ITEM = new Float64Array(ITEMS * 4); // a segment's x0, y0, x1, y1; a head's x, y (twice)
const ITEM_NEXT = new Int32Array(ITEMS);
const LAYER_FIRST = new Int32Array(KINDS * LAYERS); // items per kind and layer: linked lists through ITEM_NEXT
let items = 0;
/** The previous point of the line being filed (an object: its number fields are updated in place). */
const last = { x: 0, y: 0, depth: 0 };

/**
 * File an item of `kind` under its depth layer: for a line, the segment from `last` to `point`;
 * for a HEAD, the dot at `point`. (Positions are read from those objects, not passed as
 * arguments, so filing allocates nothing.)
 */
function fileItem(kind) {
  const n = items++;
  const head = kind === HEAD;
  ITEM[4 * n] = head ? point.x : last.x;
  ITEM[4 * n + 1] = head ? point.y : last.y;
  ITEM[4 * n + 2] = point.x;
  ITEM[4 * n + 3] = point.y;
  const depth = head ? point.depth : (last.depth + point.depth) / 2;
  const list = kind * LAYERS + Math.floor((DEPTH_OFFSET - depth + OFFSET) / LAYER);
  ITEM_NEXT[n] = LAYER_FIRST[list];
  LAYER_FIRST[list] = n;
}

/**
 * Continue a line of `kind` to the point just projected. When it and the previous point (pen
 * down) face the camera, file the segment between them. Returns whether the pen is down at it.
 */
function continueLine(kind, pen) {
  if (point.facing >= 0) return false;
  if (pen) fileItem(kind);
  last.x = point.x;
  last.y = point.y;
  last.depth = point.depth;
  return true;
}

/** File the parts of the seams that face the camera. */
function fileSeams() {
  for (let kind = SEAM_MERIDIAN; kind <= SEAM_EQUATOR; kind++) {
    let pen = false;
    for (let k = 0; k <= SEAM_POINTS; k++) {
      const o = 6 * (kind * (SEAM_POINTS + 1) + k);
      projectPoint(SEAM[o], SEAM[o + 1], SEAM[o + 2], SEAM[o + 3], SEAM[o + 4], SEAM[o + 5]);
      pen = continueLine(kind, pen);
    }
  }
}

/** File the parts of the tracers' trails and their heads that face the camera. */
function fileTracers(cloud) {
  const { x, y, trail, trailHead, trailCount } = cloud;
  const oldest = (trailHead - trailCount + TRAIL) % TRAIL;
  for (let i = 0; i < NT; i++) {
    let pen = false;
    for (let k = 0; k <= trailCount; k++) {
      const o = (((oldest + k) % TRAIL) * NT + i) * 2;
      if (k < trailCount) project(trail[o], trail[o + 1], r + LIFT.trail);
      else project(x[i], y[i], r + LIFT.trail); // the trail ends at the tracer
      pen = continueLine(TRAIL_LINE, pen);
    }
    project(x[i], y[i], r + LIFT.tracer);
    if (point.facing < 0) fileItem(HEAD);
  }
}

/** File this frame's seams and tracers (each when shown) under their layers. */
function fileOverlays(cloud, seams, tracers) {
  items = 0;
  LAYER_FIRST.fill(-1);
  if (seams) fileSeams();
  if (tracers) fileTracers(cloud);
}

/** Draw the items filed under `layer`; `seams` and `tracers` are their opacities. Returns whether it drew any. */
function drawLayer(ctx, layer, base, seams, tracers) {
  let drew = false;
  for (let kind = SEAM_MERIDIAN; kind <= TRAIL_LINE; kind++) {
    let n = LAYER_FIRST[kind * LAYERS + layer];
    if (n < 0) continue;
    ctx.globalAlpha = base * (kind === TRAIL_LINE ? TRAIL_ALPHA * tracers : seams);
    ctx.strokeStyle = LINE_STYLE[kind];
    ctx.lineWidth = LINE_WIDTH[kind];
    ctx.beginPath();
    for (; n >= 0; n = ITEM_NEXT[n]) {
      ctx.moveTo(ITEM[4 * n], ITEM[4 * n + 1]);
      ctx.lineTo(ITEM[4 * n + 2], ITEM[4 * n + 3]);
    }
    ctx.stroke();
    drew = true;
  }
  let n = LAYER_FIRST[HEAD * LAYERS + layer];
  if (n < 0) return drew;
  ctx.globalAlpha = base * tracers;
  ctx.fillStyle = TRACER;
  ctx.strokeStyle = color.bg;
  ctx.lineWidth = 1.2;
  for (; n >= 0; n = ITEM_NEXT[n]) {
    ctx.beginPath();
    ctx.arc(ITEM[4 * n], ITEM[4 * n + 1], HEAD_RADIUS, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  return true;
}

// ---------- the torus ----------

const PARTICLE_SIZE = 2.2;
const CELL_LINE = 0.8; // each cell is also stroked in its colour, to close the seams between cells

let offscreen = null;

/**
 * Draw paint(g) fully opaque into an offscreen canvas the size of ctx's canvas, then composite it
 * at `alpha`: a translucent torus then fades as one object, without its cells' outlines and
 * hidden parts showing through.
 */
function fadeAsLayer(ctx, alpha, paint) {
  offscreen ??= document.createElement('canvas');
  if (offscreen.width !== ctx.canvas.width || offscreen.height !== ctx.canvas.height) {
    offscreen.width = ctx.canvas.width;
    offscreen.height = ctx.canvas.height;
  }
  const g = offscreen.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, offscreen.width, offscreen.height);
  g.setTransform(ctx.getTransform());
  paint(g);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

/**
 * The torus coloured by p, with the cloud's particles, tracer trails and heads, and the two seams
 * along which it is cut open into the chart. Everything is drawn in one far-to-near pass:
 * particles right after their mesh cell, seams, trails and heads with their depth layer, so the
 * parts of the torus in front hide them as they hide the surface.
 * @param {object} cloud  state.glued (or state.walled) of torusFlow.js
 * @param {object} cam    from flowCamera
 * @param {{ alpha?: number, particles?: number, tracers?: number, seams?: number }} options  opacities 0 … 1
 */
export function drawFlowTorus(ctx, cloud, cam, { alpha = 1, particles = 1, tracers = 1, seams = 1 } = {}) {
  if (alpha <= 0.003) return;
  if (alpha < 1) {
    fadeAsLayer(ctx, alpha, (g) => drawFlowTorus(g, cloud, cam, { particles, tracers, seams }));
    return;
  }
  setView(cam);
  const visible = prepareMesh();
  const showParticles = particles > 0.003;
  if (showParticles) bucketParticles(cloud);
  fileOverlays(cloud, seams > 0.003, tracers > 0.003);

  ctx.save();
  const base = ctx.globalAlpha;
  ctx.lineWidth = CELL_LINE;
  ctx.lineJoin = 'bevel';
  ctx.lineCap = 'round'; // for the overlays' segments; the cells are closed paths
  const dot = rgba(PARTICLE, 0.6 * particles);
  const half = PARTICLE_SIZE / 2;
  let layer = 0; // the next overlay layer to draw
  for (let k = 0; k < visible; k++) {
    const key = ORDER[k];
    const cellLayer = Math.floor(key / LAYER_KEY);
    for (; layer < cellLayer; layer++) {
      if (!drawLayer(ctx, layer, base, seams, tracers)) continue;
      ctx.globalAlpha = base;
      ctx.lineWidth = CELL_LINE;
    }
    const q = key % CELL_SPAN;
    const style = STYLES[CELL_STYLE[q]];
    const a = CORNERS[4 * q];
    const b = CORNERS[4 * q + 1];
    const c = CORNERS[4 * q + 2];
    const d = CORNERS[4 * q + 3];
    ctx.fillStyle = style;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(SX[a], SY[a]);
    ctx.lineTo(SX[b], SY[b]);
    ctx.lineTo(SX[c], SY[c]);
    ctx.lineTo(SX[d], SY[d]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (showParticles && FIRST[q] >= 0) {
      ctx.fillStyle = dot;
      for (let i = FIRST[q]; i >= 0; i = NEXT[i]) ctx.fillRect(PX[i] - half, PY[i] - half, PARTICLE_SIZE, PARTICLE_SIZE);
    }
  }
  for (; layer < LAYERS; layer++) drawLayer(ctx, layer, base, seams, tracers);
  ctx.restore();
}

// ---------- the flat chart ----------

const TARGET_SIZE = 256;
/** The target density p as RGBA pixels, θ to the right and φ upward (computed at load, without the DOM). */
const TARGET_PIXELS = new Uint8ClampedArray(TARGET_SIZE * TARGET_SIZE * 4);
for (let i = 0; i < TARGET_SIZE; i++) {
  for (let k = 0; k < TARGET_SIZE; k++) {
    const l = 3 * level(ptil(((i + 0.5) / TARGET_SIZE) * TAU, ((k + 0.5) / TARGET_SIZE) * TAU));
    const o = ((TARGET_SIZE - 1 - k) * TARGET_SIZE + i) * 4;
    TARGET_PIXELS[o] = PALETTE[l];
    TARGET_PIXELS[o + 1] = PALETTE[l + 1];
    TARGET_PIXELS[o + 2] = PALETTE[l + 2];
    TARGET_PIXELS[o + 3] = 255;
  }
}

let target = null;
const histograms = new Map(); // cloud name → { canvas, g, image }

/** The target density image as a canvas, made on first use. */
function targetImage() {
  if (!target) {
    target = document.createElement('canvas');
    target.width = target.height = TARGET_SIZE;
    target.getContext('2d').putImageData(new ImageData(TARGET_PIXELS, TARGET_SIZE), 0, 0);
  }
  return target;
}

/** The cloud's smoothed histogram as a B × B image (one reused canvas per cloud). */
function histogramImage(name, hist) {
  let h = histograms.get(name);
  if (!h) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = B;
    const g = canvas.getContext('2d');
    h = { canvas, g, image: g.createImageData(B, B) };
    histograms.set(name, h);
  }
  const { data } = h.image;
  for (let i = 0; i < B; i++) {
    for (let k = 0; k < B; k++) {
      const l = 3 * level(hist[i * B + k] * B * B); // bin fraction → density relative to uniform
      const o = ((B - 1 - k) * B + i) * 4;
      data[o] = PALETTE[l];
      data[o + 1] = PALETTE[l + 1];
      data[o + 2] = PALETTE[l + 2];
      data[o + 3] = 255;
    }
  }
  h.g.putImageData(h.image, 0, 0);
  return h.canvas;
}

/** Filled triangle pointing along `angle` (radians, screen coordinates), centred on (x, y). */
function arrowHead(ctx, x, y, angle, size) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(x + size * c, y + size * s);
  ctx.lineTo(x - 0.7 * size * c - 0.75 * size * s, y - 0.7 * size * s + 0.75 * size * c);
  ctx.lineTo(x - 0.7 * size * c + 0.75 * size * s, y - 0.7 * size * s - 0.75 * size * c);
  ctx.closePath();
  ctx.fill();
}

const WALL_BAND = 12; // width of the hatched band outside the walls
const HATCH = 8; // spacing of its lines
const TICKS = ['0', 'π', '2π'];
const TICK_BELOW = { ...type.note, align: 'center' };
const TICK_LEFT = { ...type.note, align: 'right', baseline: 'middle' };
const AXIS_BELOW = { ...type.math, size: 22, align: 'center' };
const AXIS_LEFT = { ...type.math, size: 22, align: 'right', baseline: 'middle' };
const DASH = [5, 6];
const SOLID = [];

/**
 * The flat chart (θ, φ) of one cloud: θ to the right and φ upward across the square at (x, y).
 * Background: the target density (show 'target') or the cloud's smoothed histogram ('hist').
 * Glued: teleports younger than EVENT_LIFE as dashed lines with expanding rings, and arrows
 * identifying opposite edges, coloured like the seams. Walled: a hatched wall all around.
 * The tick labels and axis names stay within the chart's width and to its left.
 * @param {'glued' | 'walled'} cloudName
 */
export function drawChart(ctx, state, cloudName, { x, y, side, glued = cloudName === 'glued', show = 'target', alpha = 1 }) {
  if (alpha <= 0.003) return;
  const cloud = state[cloudName];
  const k = side / TAU;
  const X = (theta) => x + theta * k;
  const Y = (phi) => y + side - phi * k;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(show === 'hist' ? histogramImage(cloudName, cloud.hist) : targetImage(), x, y, side, side);

  ctx.fillStyle = CHART_PARTICLE;
  for (let i = NT; i < N; i++) ctx.fillRect(X(cloud.x[i]) - 0.75, Y(cloud.y[i]) - 0.75, 1.5, 1.5);

  // trails, broken where a tracer jumps across the chart
  const { trail, trailHead, trailCount } = cloud;
  const oldest = (trailHead - trailCount + TRAIL) % TRAIL;
  ctx.strokeStyle = CHART_TRAIL;
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < NT; i++) {
    let t0 = NaN; // no previous point: the first one starts the line
    let f0 = NaN;
    for (let s = 0; s <= trailCount; s++) {
      const o = (((oldest + s) % TRAIL) * NT + i) * 2;
      const t = s < trailCount ? trail[o] : cloud.x[i];
      const f = s < trailCount ? trail[o + 1] : cloud.y[i];
      if (Math.abs(t - t0) < Math.PI && Math.abs(f - f0) < Math.PI) ctx.lineTo(X(t), Y(f));
      else ctx.moveTo(X(t), Y(f));
      t0 = t;
      f0 = f;
    }
  }
  ctx.stroke();

  if (glued) drawTeleports(ctx, state.time, cloud, X, Y);

  ctx.fillStyle = TRACER;
  ctx.strokeStyle = color.bg;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < NT; i++) {
    ctx.beginPath();
    ctx.arc(X(cloud.x[i]), Y(cloud.y[i]), 3.6, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  if (glued) drawGluedEdges(ctx, x, y, side);
  else drawWalls(ctx, x, y, side);

  const gap = glued ? 10 : 10 + WALL_BAND;
  for (let n = 0; n < 3; n++) {
    text(ctx, TICKS[n], X(n * Math.PI), y + side + gap + 13, TICK_BELOW);
    text(ctx, TICKS[n], x - gap, Y(n * Math.PI), TICK_LEFT);
  }
  // the axis names between the π and 2π ticks
  text(ctx, 'θ', X(1.5 * Math.PI), y + side + gap + 14, AXIS_BELOW);
  text(ctx, 'φ', x - gap, Y(1.5 * Math.PI), AXIS_LEFT);
  ctx.restore();
}

/** An unwrapped angle just outside [0, 2π] put on the chart's edge. */
const toEdge = (v) => Math.min(TAU, Math.max(0, v));

/**
 * Teleports of the tracers: unwrapped point → wrapped point, fading out over EVENT_LIFE.
 * Events are kept in time order, so the live ones are the newest.
 */
function drawTeleports(ctx, time, cloud, X, Y) {
  const { events, eventHead, eventCount } = cloud;
  const size = events.length / EVENTS; // per event: x0, y0, x1, y1, time
  const newest = eventHead - 1 + EVENTS;
  let live = 0;
  while (live < eventCount && time - events[((newest - live) % EVENTS) * size + 4] < EVENT_LIFE) live++;
  if (live === 0) return;

  const base = ctx.globalAlpha;
  ctx.strokeStyle = TRACER;
  ctx.lineWidth = 1.4;
  ctx.setLineDash(DASH);
  for (let n = 0; n < live; n++) {
    const o = ((newest - n) % EVENTS) * size;
    ctx.globalAlpha = base * 0.9 * (1 - (time - events[o + 4]) / EVENT_LIFE);
    ctx.beginPath();
    ctx.moveTo(X(toEdge(events[o])), Y(toEdge(events[o + 1])));
    ctx.lineTo(X(events[o + 2]), Y(events[o + 3]));
    ctx.stroke();
  }
  ctx.setLineDash(SOLID);
  for (let n = 0; n < live; n++) {
    const o = ((newest - n) % EVENTS) * size;
    const age = (time - events[o + 4]) / EVENT_LIFE; // 0 … 1
    const radius = 3.5 + 8 * age;
    const x1 = X(events[o + 2]);
    const y1 = Y(events[o + 3]);
    ctx.globalAlpha = base * 0.9 * (1 - age);
    ctx.beginPath();
    ctx.arc(X(toEdge(events[o])), Y(toEdge(events[o + 1])), radius, 0, TAU);
    ctx.moveTo(x1 + radius, y1);
    ctx.arc(x1, y1, radius, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = base;
}

/** Opposite edges identified: single arrows on θ = 0 ≡ 2π, double arrows on φ = 0 ≡ 2π. */
function drawGluedEdges(ctx, x, y, side) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = ctx.fillStyle = SEAM_THETA;
  for (const ex of [x, x + side]) {
    ctx.beginPath();
    ctx.moveTo(ex, y);
    ctx.lineTo(ex, y + side);
    ctx.stroke();
    arrowHead(ctx, ex, y + side / 2, -Math.PI / 2, 8);
  }
  ctx.strokeStyle = ctx.fillStyle = SEAM_PHI;
  for (const ey of [y, y + side]) {
    ctx.beginPath();
    ctx.moveTo(x, ey);
    ctx.lineTo(x + side, ey);
    ctx.stroke();
    arrowHead(ctx, x + side / 2 - 7, ey, 0, 8);
    arrowHead(ctx, x + side / 2 + 9, ey, 0, 8);
  }
}

/** A thick wall all around, hatched on the outside. */
function drawWalls(ctx, x, y, side) {
  ctx.strokeStyle = WALL;
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 2, y - 2, side + 4, side + 4);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 2 - WALL_BAND, y - 2 - WALL_BAND, side + 4 + 2 * WALL_BAND, side + 4 + 2 * WALL_BAND);
  ctx.rect(x - 2, y - 2, side + 4, side + 4);
  ctx.clip('evenodd');
  ctx.strokeStyle = HATCH_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const span = side + 4 + 2 * WALL_BAND;
  for (let s = -span; s < span; s += HATCH) {
    ctx.moveTo(x - 2 - WALL_BAND + s, y - 2 - WALL_BAND);
    ctx.lineTo(x - 2 - WALL_BAND + s + span, y - 2 - WALL_BAND + span);
  }
  ctx.stroke();
  ctx.restore();
}

// ---------- readouts ----------

const ROW = 30;
const SPARK_HEIGHT = 88;
const HEADER = { ...type.note, align: 'right' };
const ROW_LABEL = { ...type.body, size: 17 };
const NUMBER = { ...type.label, align: 'right' };
const THEORY_LABEL = { ...ROW_LABEL, color: color.muted };
const THEORY_NUMBER = { ...NUMBER, color: color.muted };
const SCALE_LABEL = { ...type.note, size: 13, align: 'right', baseline: 'middle' };
const TIME_LABEL = { ...type.note, size: 13 };
const NOW_LABEL = { ...TIME_LABEL, align: 'right' };
/** The two rows and sparkline series, in the sparkline's slot order [glued TV, walled TV]. */
const SERIES = [
  { name: 'glued square = torus', cloud: 'glued', accent: GLUED_ACCENT },
  { name: 'walled square', cloud: 'walled', accent: WALLED_ACCENT },
];
const FOOTNOTE = { ...type.note, size: 13 };

/**
 * Table of the distance to p (TV) and the lap rate for the glued square (= the torus) and the
 * walled square, with the torus theory j/2π, above the last 30 s of both distances and a note on
 * what the walled lap number measures. `walled` (0 … 1) fades the walled row, line and note in.
 */
export function drawReadouts(ctx, state, input, { x, y, width = 780, alpha = 1, walled = 1 }) {
  if (alpha <= 0.003) return;
  const tvRight = x + Math.round(width * 0.62); // right edges of the two number columns
  const lapsRight = x + width;
  const baseline = (row) => y + 16 + row * ROW; // row 0 is the header

  ctx.save();
  ctx.globalAlpha *= alpha;
  const base = ctx.globalAlpha;
  ctx.fillStyle = color.line;
  for (let row = 0; row < 4; row++) ctx.fillRect(x, baseline(row) + 10, width, 1);
  text(ctx, 'distance to p (TV)', tvRight, baseline(0), HEADER);
  text(ctx, 'laps / particle / s', lapsRight, baseline(0), HEADER);
  for (let n = 0; n < 2; n++) {
    const rowAlpha = n === 0 ? 1 : walled;
    if (rowAlpha <= 0.003) continue;
    const { name, cloud, accent } = SERIES[n];
    const at = baseline(n + 1);
    ctx.globalAlpha = base * rowAlpha;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + 6, at - 6, 5, 0, TAU);
    ctx.fill();
    text(ctx, name, x + 22, at, ROW_LABEL);
    text(ctx, formatNumber(state[cloud].tv, 3), tvRight, at, NUMBER);
    text(ctx, formatNumber(state[cloud].rate, 3), lapsRight, at, NUMBER);
  }
  ctx.globalAlpha = base;
  text(ctx, 'theory (torus)', x + 22, baseline(3), THEORY_LABEL);
  text(ctx, '0 + noise floor', tvRight, baseline(3), THEORY_NUMBER);
  text(ctx, `j / 2π = ${formatNumber(input.j / TAU, 3)}`, lapsRight, baseline(3), THEORY_NUMBER);

  drawSparkline(ctx, state, x, baseline(3) + 32, width, walled);
  ctx.globalAlpha = base * walled;
  text(ctx, 'laps: net crossings of θ = π. On the walled square they only count mass moving between its halves.', x, baseline(3) + 32 + SPARK_HEIGHT + 44, FOOTNOTE);
  ctx.restore();
}

/** Top of the sparkline's scale for a series maximum: at least 0.3, rounded up to 0.1 as on the page. */
const scaleTop = (max) => Math.ceil(Math.max(0.3, max) * 10) / 10;

/** Both TV series over the last 30 s, newest at the right edge. */
function drawSparkline(ctx, state, x, y, width, walled) {
  const left = x + 46;
  const right = x + width;
  const bottom = y + SPARK_HEIGHT;
  const { spark, sparkHead, sparkCount } = state;
  const oldest = (sparkHead - sparkCount + SPARK) % SPARK;
  let maxGlued = 0;
  let maxWalled = 0;
  for (let s = 0; s < sparkCount; s++) {
    const o = 2 * ((oldest + s) % SPARK);
    if (spark[o] > maxGlued) maxGlued = spark[o];
    if (spark[o + 1] > maxWalled) maxWalled = spark[o + 1];
  }
  // the scale eases to include the walled series as it fades in; meanwhile that line is clipped to the top
  const top = scaleTop(maxGlued) + (scaleTop(Math.max(maxGlued, maxWalled)) - scaleTop(maxGlued)) * walled;
  const perUnit = SPARK_HEIGHT / top;

  ctx.fillStyle = color.line;
  for (let n = 0; n <= 2; n++) {
    const v = (n * top) / 2;
    ctx.fillRect(left, Math.round(bottom - v * perUnit), right - left, 1);
    text(ctx, formatNumber(v, 2), left - 8, bottom - v * perUnit, SCALE_LABEL);
  }
  text(ctx, '−30 s', left, bottom + 18, TIME_LABEL);
  text(ctx, 'now', right, bottom + 18, NOW_LABEL);
  if (sparkCount === 0) return;

  const step = (right - left) / (SPARK - 1);
  const first = right - (sparkCount - 1) * step;
  const base = ctx.globalAlpha;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  for (let series = 0; series < 2; series++) {
    const seriesAlpha = series === 0 ? 1 : walled;
    if (seriesAlpha <= 0.003) continue;
    ctx.globalAlpha = base * seriesAlpha;
    ctx.strokeStyle = ctx.fillStyle = SERIES[series].accent;
    ctx.beginPath(); // the first lineTo starts the line
    for (let s = 0; s < sparkCount; s++) ctx.lineTo(first + s * step, bottom - Math.min(spark[2 * ((oldest + s) % SPARK) + series], top) * perUnit);
    ctx.stroke();
    const last = spark[2 * ((oldest + sparkCount - 1) % SPARK) + series];
    ctx.beginPath();
    ctx.arc(right, bottom - Math.min(last, top) * perUnit, 3, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = base;
}
