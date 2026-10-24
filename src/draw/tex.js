// LaTeX on the canvas. MathJax turns each formula into an SVG once; we keep it
// as an image and draw that. Until MathJax has loaded (or if it never does),
// formulas fall back to a plain-text version drawn in the display italic.
//
//   const sde = tex(String.raw`dx_t = g(t)\,dW_t`, 'dxₜ = g(t) dWₜ');
//   sde.draw(ctx, x, y, { size: 36, alpha });           // vertically centred on y
//   sde.drawOnBaseline(ctx, x, baseline, { size: 30 });  // for assembling formulas from parts
//
// Declare formulas at module level, so all of them are rendered at start-up.

import { color, font } from './theme.js';

const EX_PER_EM = 0.442; // MathJax TeX font x-height
const SVG_SCALE = 24; // rasterise large, draw scaled down: stays crisp
const MEASURE = document.createElement('canvas').getContext('2d');

const formulas = [];
const listeners = new Set();
let started = false;
let finished = false; // after the start-up pass, new formulas render on their own
let settle;
/** Resolves once every formula declared so far has been rendered (or failed). */
export const texSettled = new Promise((resolve) => (settle = resolve));

export class Tex {
  constructor(source, fallback = source) {
    this.source = source;
    this.fallback = fallback;
    this.image = null;
    this.box = null; // width, height, depth below the baseline, in ex
    formulas.push(this);
    if (finished) renderFormula(this);
  }

  get ready() {
    return this.image !== null;
  }

  /** Size in stage pixels at the given font size: { width, height, depth }. */
  metrics(size) {
    if (this.image) {
      const ex = size * EX_PER_EM;
      return { width: this.box.width * ex, height: this.box.height * ex, depth: this.box.depth * ex };
    }
    MEASURE.font = fallbackFont(size);
    return { width: MEASURE.measureText(this.fallback).width, height: size * 1.1, depth: size * 0.25 };
  }

  /** Draw vertically centred on y. Options: size, align ('left' | 'center' | 'right'), alpha. */
  draw(ctx, x, y, { size = 32, align = 'left', alpha = 1 } = {}) {
    if (alpha <= 0.003) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (this.image) {
      const { width, height } = this.metrics(size);
      const x0 = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
      ctx.drawImage(this.image, x0, y - height / 2, width, height);
    } else {
      ctx.font = fallbackFont(size);
      ctx.fillStyle = color.ink;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(this.fallback, x, y);
    }
    ctx.restore();
  }

  /**
   * Draw with the formula's baseline at `baseline`, starting at x, so that
   * separately rendered parts line up. Options: size, alpha, blur (px), scale.
   * Returns the metrics, so callers can advance x by `width`.
   */
  drawOnBaseline(ctx, x, baseline, { size = 30, alpha = 1, blur = 0, scale = 1 } = {}) {
    const m = this.metrics(size);
    if (alpha <= 0.003) return m;
    const [cx, cy] = this.center(x, baseline, size);
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    if (this.image) {
      ctx.drawImage(this.image, -m.width / 2, -m.height / 2, m.width, m.height);
    } else {
      ctx.font = fallbackFont(size);
      ctx.fillStyle = color.ink;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(this.fallback, -m.width / 2, baseline - cy);
    }
    ctx.restore();
    return m;
  }

  /** Draw centred on (cx, cy); used when a formula part flies across the stage. */
  drawCentered(ctx, cx, cy, { size = 30, alpha = 1, scale = 1 } = {}) {
    const m = this.metrics(size);
    this.drawOnBaseline(ctx, cx - m.width / 2, cy - m.height / 2 + (m.height - m.depth), { size, alpha, scale });
  }

  /** Centre of the formula's box when drawn on `baseline` starting at x. */
  center(x, baseline, size) {
    const m = this.metrics(size);
    return [x + m.width / 2, baseline - (m.height - m.depth) + m.height / 2];
  }
}

export const tex = (source, fallback) => new Tex(source, fallback);

/** Called whenever a formula finishes rendering; returns an unsubscribe function. */
export function onTexReady(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function fallbackFont(size) {
  return `italic 400 ${size * 0.86}px ${font.display}`;
}

async function renderFormula(item) {
  try {
    const node = await window.MathJax.tex2svgPromise(item.source, { display: false });
    const svg = node.querySelector('svg');
    if (!svg || node.querySelector('[data-mml-node="merror"]')) {
      console.warn('TeX error, using the plain-text fallback:', item.source);
      return;
    }
    const width = parseFloat(svg.getAttribute('width'));
    const height = parseFloat(svg.getAttribute('height'));
    const valign = (svg.getAttribute('style') || '').match(/vertical-align:\s*(-?[\d.]+)ex/);
    const depth = valign ? -parseFloat(valign[1]) : 0;

    svg.setAttribute('width', (width * SVG_SCALE).toFixed(1));
    svg.setAttribute('height', (height * SVG_SCALE).toFixed(1));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.removeAttribute('style');
    const markup = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, color.ink);

    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await image.decode();
    item.image = image;
    item.box = { width, height, depth };
    listeners.forEach((fn) => fn());
  } catch (err) {
    console.warn('Could not render TeX, using the plain-text fallback:', item.source, err);
  }
}

async function start() {
  if (started) return;
  started = true;
  await new Promise((resolve) => setTimeout(resolve, 0)); // let every scene module declare its formulas first
  for (const item of formulas) await renderFormula(item); // also picks up formulas added meanwhile
  finished = true;
  settle();
}

// index.html sets window.__mathjaxReady and fires 'mathjax-ready' once MathJax has started.
if (window.__mathjaxReady) start();
else window.addEventListener('mathjax-ready', start, { once: true });
