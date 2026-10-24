import {
  defineScene, seg, fade, lin, lerp, text, wrap, type, font, color, tex, brace, bar, card, rowVector, stiffness, sigma,
} from '../../../kit.js';

// ---- formulas. The Riemannian loss is built from parts so that pieces can be
// swapped, braced and flown around independently. All parts share a baseline.
const FLAT_LOSS = tex(
  String.raw`\mathcal{L}_{\text{flat}}(\theta) = \mathbb{E}_{t,x_t}\,\big\| s_\theta(x_t,t) - \nabla \log p_t(x_t) \big\|_2^2`,
  'L_flat(θ) = E ‖ s_θ(xₜ,t) − ∇log pₜ(xₜ) ‖²',
);
const LOSS = {
  head: tex(String.raw`\mathcal{L}_{G}(\theta) = \mathbb{E}_{t,x_t}\,\big\| s_\theta(x_t,t) -`, 'L_G(θ) = E ‖ s_θ(xₜ,t) −'),
  riemannianScore: tex(String.raw`\nabla_{\!G} \log p_t(x_t)`, '∇_G log pₜ(xₜ)'),
  inverseMetric: tex(String.raw`G^{-1}`, 'G⁻¹'),
  euclideanScore: tex(String.raw`\nabla \log p_t(x_t)`, '∇ log pₜ(xₜ)'),
  tail: tex(String.raw`\big\|_G^2`, '‖²_G'),
};
const EXPANSION = {
  lead: tex(String.raw`= \mathbb{E}\,\big\langle \delta,\; G\,\delta \big\rangle_2 = \mathbb{E}\;`, '= E ⟨δ, Gδ⟩₂ = E'),
  deltaT: tex(String.raw`\delta^{\top}`, 'δᵀ'),
  metric: tex('G', 'G'),
  delta: tex(String.raw`\delta`, 'δ'),
  where: tex(String.raw`\delta = s_\theta(x_t,t) - G^{-1}\nabla \log p_t(x_t)`, 'δ = s_θ(xₜ,t) − G⁻¹∇log pₜ(xₜ)'),
};
const MATRIX_FORM = {
  lead: tex(String.raw`= \mathbb{E}\,`, '= E'),
  row: tex(String.raw`\begin{bmatrix}\delta_1 & \delta_2 & \cdots & \delta_{15}\end{bmatrix}`, '[δ₁ δ₂ ⋯ δ₁₅]'),
  matrix: tex(
    String.raw`\begin{bmatrix} G_{1,1} & \cdots & G_{1,15}\\ \vdots & \ddots & \vdots \\ G_{15,1} & \cdots & G_{15,15}\end{bmatrix}`,
    '[G]',
  ),
  column: tex(String.raw`\begin{bmatrix}\delta_1\\ \delta_2 \\ \vdots\\ \delta_{15}\end{bmatrix}`, '[δ₁ … δ₁₅]ᵀ'),
};

const RIGHT = 900;

export default defineScene({
  name: 'Problem 3',
  duration: 38,
  narration:
    'The flat loss compares the network output with the Euclidean gradient: a 5% error in the stiff component costs 400 times more than the same 5% error in the soft one. The Riemannian loss instead targets the Riemannian score G⁻¹∇log p, a vector, and measures the error in the metric G. With G = K that target is well conditioned, and equal relative errors cost the same. That is problem 3.',
  header: { eyebrow: '12 · PROBLEM 3', title: 'The flat loss weighs errors with the wrong ruler' },

  draw(ctx, t) {
    drawPredictions(ctx, t);
    const up = seg(t, 11.8, 13);
    FLAT_LOSS.draw(ctx, 100, lerp(640, 212, up), { size: 28, alpha: seg(t, 6.5, 7.5) });
    text(ctx, 'flat: the output is compared with the Euclidean gradient, a covector', 100, lerp(684, 254, up), { ...type.note, size: 14, alpha: seg(t, 7, 8) });

    const flyFrom = drawRiemannianLoss(ctx, t);
    drawMatrixForm(ctx, t, flyFrom);
    drawLossBars(ctx, t);

    wrap(ctx, 'Both predictions are 5% off in one entry, and both distort the generated samples by a similar amount. Yet the flat loss charges B 400× more than A, so the soft directions are barely trained.', RIGHT, 540, 600, 32, {
      ...type.body,
      alpha: fade(t, 9.4, 10.2, 30.6, 31.2),
    });
    card(ctx, {
      x: RIGHT,
      y: 520,
      width: 600,
      tag: 'PROBLEM 3',
      title: 'The loss must respect the geometry',
      body: 'The flat loss on the Euclidean gradient weights stiff errors κ = 400× more than equal relative errors in soft directions. The Riemannian loss targets the vector G⁻¹∇log p and measures the error in the metric, δᵀGδ. With G = K the target is well conditioned and equal relative errors cost the same.',
      accent: color.soft,
      alpha: seg(t, 31.4, 32.2),
      progress: lin(t, 31.8, 36.5),
    });
  },
});

/** Target score and two predictions, each 5% off in one entry. Fades before the loss is derived. */
function drawPredictions(ctx, t) {
  const target = [-1 / sigma.soft, -1 / sigma.stiff];
  const colors = [color.soft, color.stiff];
  const keep = 1 - seg(t, 11.4, 12.2);
  const caption = { ...type.note, size: 16 };
  const delta = { font: font.mono, size: 18, color: color.gold };

  text(ctx, 'target: Euclidean score at 1σ   [ soft , stiff ]', 100, 232, { ...caption, alpha: seg(t, 1, 1.8) * keep });
  rowVector(ctx, 100, 280, target, colors, { alpha: seg(t, 1, 2) * keep });
  text(ctx, 'prediction A · 5% off in the soft entry', 100, 360, { ...caption, alpha: seg(t, 3, 3.8) * keep });
  rowVector(ctx, 100, 408, [target[0] * 1.05, target[1]], colors, { highlight: 0, alpha: seg(t, 3, 4) * keep });
  text(ctx, 'prediction B · 5% off in the stiff entry', 100, 488, { ...caption, alpha: seg(t, 4.5, 5.3) * keep });
  rowVector(ctx, 100, 536, [target[0], target[1] * 1.05], colors, { highlight: 1, alpha: seg(t, 4.5, 5.5) * keep });
  text(ctx, 'δ = (0.07, 0)', 460, 415, { ...delta, alpha: seg(t, 3.6, 4.4) * keep });
  text(ctx, 'δ = (0, 1.39)', 460, 543, { ...delta, alpha: seg(t, 5, 5.8) * keep });
}

/**
 * 𝓛_G = 𝔼‖s_θ − ∇_G log p‖²_G; the Riemannian score blurs into G⁻¹∇log p;
 * braces explain the conditioning of each part; then the norm is expanded.
 * Returns where δᵀ, G and δ sit, so they can fly into the matrix form.
 */
function drawRiemannianLoss(ctx, t) {
  const size = 30;
  const baseline = 432;
  const gap = size * 0.28;
  const appear = seg(t, 13, 14);
  if (appear > 0) {
    let x = 100;
    x += LOSS.head.drawOnBaseline(ctx, x, baseline, { size, alpha: appear }).width + gap;

    const mA = LOSS.riemannianScore.metrics(size);
    const m1 = LOSS.inverseMetric.metrics(size);
    const m2 = LOSS.euclideanScore.metrics(size);
    const thin = size * 0.14;
    const swappedWidth = m1.width + thin + m2.width;
    const slotWidth = lerp(mA.width, swappedWidth, seg(t, 15.4, 16.8));

    // blur out ∇_G log p, blur in G⁻¹ ∇ log p
    LOSS.riemannianScore.drawOnBaseline(ctx, x + (slotWidth - mA.width) / 2, baseline, {
      size,
      alpha: appear * (1 - seg(t, 15.8, 16.6)),
      blur: 8 * seg(t, 15.0, 15.9),
    });
    const xb = x + (slotWidth - swappedWidth) / 2;
    const x2 = xb + m1.width + thin;
    const swapIn = { size, alpha: seg(t, 16.0, 16.9), blur: 8 * (1 - seg(t, 16.1, 16.9)) };
    LOSS.inverseMetric.drawOnBaseline(ctx, xb, baseline, swapIn);
    LOSS.euclideanScore.drawOnBaseline(ctx, x2, baseline, swapIn);
    LOSS.tail.drawOnBaseline(ctx, x + slotWidth + gap, baseline, { size, alpha: appear });

    text(ctx, 'Riemannian score: the gradient written as a vector', x + mA.width / 2, baseline + 50, {
      font: font.mono,
      size: 15,
      color: color.gold,
      align: 'center',
      alpha: fade(t, 13.6, 14.4, 15.0, 15.6),
    });

    const under = fade(t, 17.2, 17.8, 21.8, 22.6);
    if (under > 0) {
      const y = baseline + m2.depth + 8;
      const cx = x2 + m2.width / 2;
      brace(ctx, x2, x2 + m2.width, y, 1, color.stiff, under, seg(t, 17.2, 17.9));
      text(ctx, 'Euclidean gradient (covector)', cx, y + 48, { font: font.mono, size: 16, color: color.stiff, align: 'center', alpha: under });
      text(ctx, 'Jacobian −K / k_BT  ·  κ = 400  ·  badly conditioned', cx, y + 72, { ...type.note, color: color.stiff, align: 'center', alpha: under });
    }
    const over = fade(t, 18.8, 19.4, 21.8, 22.6);
    if (over > 0) {
      const y = baseline - Math.max(m1.height - m1.depth, m2.height - m2.depth) - 8;
      const cx = xb + swappedWidth / 2;
      brace(ctx, xb, xb + swappedWidth, y, -1, color.soft, over, seg(t, 18.8, 19.5));
      text(ctx, 'Riemannian score (vector), with G = K', cx, y - 56, { font: font.mono, size: 16, color: color.soft, align: 'center', alpha: over });
      text(ctx, 'Jacobian −G⁻¹K / k_BT = −I / k_BT  ·  κ = 1  ·  well conditioned', cx, y - 32, { ...type.note, color: color.soft, align: 'center', alpha: over });
    }
  }

  // = 𝔼⟨δ, Gδ⟩₂ = 𝔼 δᵀ G δ
  const positions = new Map();
  const lineSize = 30;
  const lineBaseline = 598;
  const a = seg(t, 23, 24);
  if (a > 0) {
    let x = 100;
    x += EXPANSION.lead.drawOnBaseline(ctx, x, lineBaseline, { size: lineSize, alpha: a }).width + lineSize * 0.1;
    for (const part of [EXPANSION.deltaT, EXPANSION.metric, EXPANSION.delta]) {
      positions.set(part, part.center(x, lineBaseline, lineSize));
      x += part.drawOnBaseline(ctx, x, lineBaseline, { size: lineSize, alpha: seg(t, 23.8, 24.8) }).width + lineSize * 0.12;
    }
    const where = seg(t, 24.2, 25);
    text(ctx, 'where', 100, 654, { ...type.note, alpha: where });
    EXPANSION.where.drawOnBaseline(ctx, 164, 654, { size: 24, alpha: where });
  }
  return { positions, size: lineSize };
}

/** = 𝔼 [row] [G] [column]: δᵀ, G and δ fly down and become explicit arrays. */
function drawMatrixForm(ctx, t, from) {
  const size = 26;
  const baseline = 772;
  const a = seg(t, 25.4, 26.2);
  if (a <= 0) return;
  let x = 100;
  x += MATRIX_FORM.lead.drawOnBaseline(ctx, x, baseline, { size, alpha: a }).width + size * 0.2;

  const flights = [
    { source: EXPANSION.deltaT, target: MATRIX_FORM.row, start: 25.8, label: 'row δᵀ' },
    { source: EXPANSION.metric, target: MATRIX_FORM.matrix, start: 26.4, label: 'metric G (15×15)' },
    { source: EXPANSION.delta, target: MATRIX_FORM.column, start: 27.0, label: 'column δ' },
  ];
  for (const { source, target, start, label } of flights) {
    const m = target.metrics(size);
    const [tx, ty] = target.center(x, baseline, size);
    const u = seg(t, start, start + 1.4);
    const origin = from.positions.get(source);
    if (u > 0 && u < 1 && origin) {
      source.drawCentered(ctx, lerp(origin[0], tx, u), lerp(origin[1], ty, u), {
        size: lerp(from.size, size * 1.3, u),
        alpha: 1 - seg(u, 0.55, 1),
      });
    }
    const arrive = seg(u, 0.45, 1);
    target.drawOnBaseline(ctx, x, baseline, { size, alpha: arrive, scale: lerp(0.6, 1, arrive) });
    text(ctx, label, tx, baseline + Math.max(m.depth, 20) + 30, { ...type.note, size: 14, align: 'center', alpha: seg(t, start + 1.4, start + 2) });
    x += m.width + size * 0.35;
  }
}

/** Loss contributions of errors A and B: flat (×400 apart) → Riemannian (equal). */
function drawLossBars(ctx, t) {
  const alpha = seg(t, 6.8, 7.6);
  if (alpha <= 0) return;
  const m = seg(t, 29.4, 31);
  const softError = 0.05 / sigma.soft; // 5% of the soft score component
  const stiffError = 0.05 / sigma.stiff;
  const flat = { A: softError ** 2, B: stiffError ** 2 };
  const metric = { A: flat.A / stiffness.soft, B: flat.B / stiffness.stiff };

  ctx.save();
  ctx.globalAlpha = alpha;
  text(ctx, 'loss contribution of each error', RIGHT, 240, { size: 21, weight: 500 });
  text(ctx, 'flat:  δᵀδ,   δ = s_θ − ∇log p', RIGHT, 272, { font: font.mono, size: 16, color: color.muted, alpha: 1 - m });
  text(ctx, 'Riemannian:  δᵀGδ,   δ = s_θ − G⁻¹∇log p,   G = K', RIGHT, 272, { font: font.mono, size: 16, color: color.gold, alpha: m });
  for (const [name, y, tint] of [['A', 320, color.soft], ['B', 390, color.stiff]]) {
    const width = Math.max(3, lerp((flat[name] / flat.B) * 520, (metric[name] / metric.B) * 300, m));
    const value = { font: font.mono, size: 17, baseline: 'middle' };
    text(ctx, name, RIGHT + 10, y, { font: font.mono, size: 18, baseline: 'middle' });
    bar(ctx, RIGHT + 40, y - 15, width, 30, tint);
    text(ctx, flat[name].toFixed(4), RIGHT + 52 + width, y, { ...value, alpha: 1 - m });
    text(ctx, metric[name].toFixed(3), RIGHT + 52 + width, y, { ...value, alpha: m });
  }
  text(ctx, 'A · 5% error in the soft entry     B · 5% error in the stiff entry', RIGHT + 10, 446, { ...type.note, size: 14 });
  text(ctx, 'B costs ×400 more', RIGHT + 10, 478, { font: font.mono, size: 17, color: color.stiff, alpha: (1 - m) * seg(t, 8, 9) });
  text(ctx, 'equal relative errors, equal cost', RIGHT + 10, 478, { font: font.mono, size: 17, color: color.gold, alpha: m });
  ctx.restore();
}
