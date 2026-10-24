import {
  defineScene, seg, fade, lin, text, wrap, type, font, color, line, dot, arrow, bar, card, axesL,
  symmetricTicks, formatTick, dataset, sigma,
} from '../../../kit.js';

const PX_PER_ANGSTROM = 600 / 4.5;
const SCATTER = { x: 100, y: 270, w: 600, h: 460, cx: 400, cy: 500 };
const CURVES = { x: 860, y: 270, w: 620, h: 270 };
const MODES = [
  { name: 'soft', sigma: sigma.soft, color: color.soft },
  { name: 'stiff', sigma: sigma.stiff, color: color.stiff },
];

/** Noise level σₜ (Å): 0.001 → 0.1 Å, hold, then → 1.5 Å. */
function noiseLevel(t) {
  if (t < 2) return 0;
  if (t < 8) return 0.001 * Math.pow(100, lin(t, 2, 8));
  if (t < 11) return 0.1;
  return 0.1 * Math.pow(15, lin(t, 11, 16));
}

/** Share of the signal left in a direction with spread σ at noise level σₜ. */
const informationLeft = (sig, sigmaT) => (sig * sig) / (sig * sig + sigmaT * sigmaT);

export default defineScene({
  name: 'Problem 1',
  duration: 25,
  narration:
    'Now add flat noise. A noise level that barely touches the soft direction already buries the stiff one: information along stiff modes is destroyed at a noise level about 20 times smaller. That is problem 1.',
  header: { eyebrow: '09 · PROBLEM 1', title: 'Flat noise erases the stiff directions first' },

  draw(ctx, t) {
    const sigmaT = noiseLevel(t);
    drawNoisedData(ctx, t, sigmaT);
    drawInformationCurves(ctx, t, sigmaT);
    drawMeters(ctx, fade(t, 1.6, 2.4, 15.8, 16.4), sigmaT);

    wrap(ctx, 'At σₜ = 0.1 Å the stiff direction is already buried (278% of its spread). The soft direction has hardly changed (14%).', 100, 812, 600, 30, {
      ...type.body,
      size: 21,
      color: color.ink,
      alpha: fade(t, 8.3, 9, 11, 11.6),
    });
    card(ctx, {
      x: 860,
      y: 612,
      width: 620,
      tag: 'PROBLEM 1',
      title: 'Information is destroyed unevenly',
      body: 'Flat Brownian noise erases stiff modes at a noise level about 20× smaller than soft modes. By the time soft structure starts to blur, stiff structure has long been pure noise, so no single noise schedule suits both.',
      accent: color.stiff,
      alpha: seg(t, 16.4, 17.2),
      progress: lin(t, 16.8, 21),
    });
  },
});

/** The data set in (s, q) with isotropic noise of size σₜ added to every point. */
function drawNoisedData(ctx, t, sigmaT) {
  const { x, y, w, h, cx, cy } = SCATTER;
  const X = (s) => cx + s * PX_PER_ANGSTROM;
  const Y = (q) => cy - q * PX_PER_ANGSTROM;
  const tick = { font: font.mono, size: 15, color: color.muted };

  ctx.save();
  ctx.globalAlpha = seg(t, 0.3, 1.2);
  ctx.strokeStyle = color.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  line(ctx, x, cy, x + w, cy);
  line(ctx, cx, y, cx, y + h);
  for (const v of symmetricTicks(2.25, 1)) text(ctx, formatTick(v, 1), X(v), y + h + 26, { ...tick, align: 'center' });
  text(ctx, 's (Å) · soft', x + w, y + h + 52, { ...tick, color: color.soft, align: 'right' });
  text(ctx, 'q (Å) · stiff', cx + 10, y + 20, { ...tick, color: color.stiff });
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color.gold;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, 2 * sigma.soft * PX_PER_ANGSTROM, Math.max(1.5, 2 * sigma.stiff * PX_PER_ANGSTROM), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const d of dataset) dot(ctx, X(d.s + sigmaT * d.e1), Y(d.q + sigmaT * d.e2), 3.5, color.ink, 0.65);
  ctx.restore();

  const digits = sigmaT < 0.01 ? 4 : sigmaT < 1 ? 3 : 2;
  text(ctx, `σₜ = ${sigmaT.toFixed(digits)} Å`, x + 12, y + 26, { font: font.mono, size: 18, color: color.gold, alpha: seg(t, 1.6, 2.2) });
}

/** Information left per direction against the noise level, with a cursor at σₜ. */
function drawInformationCurves(ctx, t, sigmaT) {
  const alpha = seg(t, 0.8, 2);
  if (alpha <= 0) return;
  const { x, y, w, h } = CURVES;
  const X = (log10Sigma) => x + ((log10Sigma + 3) / 3.5) * w;
  const Y = (r) => y + h - r * h;

  ctx.save();
  ctx.globalAlpha = alpha;
  axesL(ctx, CURVES);
  for (const [l, label] of [[-3, '0.001'], [-2, '0.01'], [-1, '0.1'], [0, '1']]) {
    line(ctx, X(l), y, X(l), y + h, { color: color.grid });
    text(ctx, label, X(l), y + h + 24, { ...type.note, align: 'center' });
  }
  for (const [r, label] of [[0, '0'], [0.5, '50%'], [1, '100%']]) {
    text(ctx, label, x - 10, Y(r), { ...type.note, align: 'right', baseline: 'middle' });
  }
  text(ctx, 'noise level σₜ (Å, log scale)', x + w, y + h + 50, { ...type.note, size: 14, align: 'right' });
  text(ctx, 'information left per direction:  σᵢ² / (σᵢ² + σₜ²)', x, y - 18, { size: 20, weight: 500 });

  for (const mode of MODES) {
    ctx.strokeStyle = mode.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const l = -3 + (3.5 * i) / 300;
      const py = Y(informationLeft(mode.sigma, Math.pow(10, l)));
      i ? ctx.lineTo(X(l), py) : ctx.moveTo(X(l), py);
    }
    ctx.stroke();
    text(ctx, mode.name, X(Math.log10(mode.sigma)) + 10, Y(0.5) - 12, { font: font.mono, size: 16, color: mode.color });
  }

  const gap = seg(t, 13, 14);
  if (gap > 0) {
    const yy = Y(0.5) + 34;
    arrow(ctx, X(Math.log10(sigma.stiff)), yy, X(Math.log10(sigma.soft)), yy, { color: color.gold, width: 2, head: 10, alpha: gap });
    text(ctx, '×20 in noise level', (X(Math.log10(sigma.stiff)) + X(Math.log10(sigma.soft))) / 2, Y(0.5) + 60, {
      ...type.note,
      color: color.gold,
      align: 'center',
      alpha: gap,
    });
  }

  if (sigmaT > 0) {
    const cursor = X(Math.log10(sigmaT));
    line(ctx, cursor, y, cursor, y + h, { color: color.gold, width: 2 });
    for (const mode of MODES) {
      const r = informationLeft(mode.sigma, sigmaT);
      const isSoft = mode.name === 'soft';
      dot(ctx, cursor, Y(r), 7, mode.color);
      text(ctx, `${Math.round(r * 100)}%`, cursor + (isSoft ? 12 : -12), Y(r) - 12, {
        font: font.mono,
        size: 16,
        color: mode.color,
        align: isSoft ? 'left' : 'right',
      });
    }
  }
  ctx.restore();
}

/** Noise as a share of each direction's natural spread, σₜ / σᵢ. */
function drawMeters(ctx, alpha, sigmaT) {
  if (alpha <= 0) return;
  const x = 944;
  const width = 440;
  ctx.save();
  ctx.globalAlpha = alpha;
  text(ctx, 'noise as a share of each direction’s natural spread  σₜ / σᵢ', 860, 640, { size: 20, weight: 500 });
  MODES.forEach((mode, i) => {
    const y = 690 + 50 * i;
    const ratio = sigmaT / mode.sigma;
    text(ctx, mode.name, 930, y, { font: font.mono, size: 17, color: mode.color, align: 'right', baseline: 'middle' });
    bar(ctx, x, y - 12, width, 24, color.panel);
    if (ratio > 0) bar(ctx, x, y - 12, Math.max(3, (Math.min(ratio, 3) / 3) * width), 24, mode.color);
    text(ctx, ratio > 9.99 ? '>999%' : `${Math.round(ratio * 100)}%`, 1396, y, { font: font.mono, size: 18, color: mode.color, baseline: 'middle' });
  });
  line(ctx, x + width / 3, 676, x + width / 3, 756, { color: color.muted, alpha: 0.8, width: 1, dash: [3, 4] });
  text(ctx, '100%', x + width / 3, 792, { font: font.mono, size: 13, color: color.muted, align: 'center' });
  ctx.restore();
}
