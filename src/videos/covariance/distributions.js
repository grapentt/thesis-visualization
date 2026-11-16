import { defineScene, seg } from '../../kit.js';
import { color, line, arrow, dot, label, formula, panel, path, footer, seq, progress, purple, mint } from './draw.js';

function scene(name, title, narration, draw) {
  return defineScene({ name, duration: 60, narration,
    header: { eyebrow: 'COVARIANCE / DISTRIBUTIONS AND MOMENTS', title },
    draw(ctx, t) { draw(ctx, t); progress(ctx, t, 60); },
  });
}

// These are exact population probabilities on three possible outcomes,
// not counts or estimates from a finite scatter plot.
const outcomes = [[-1, -1], [1, -1], [0, 1]];
const tints = [color.soft, purple, mint];
function law(t) {
  const s = Math.sin(t * Math.PI / 28);
  const p = [.2 + .12 * s, .3 - .08 * s, .5 - .04 * s];
  const mean = [p[1] - p[0], 2 * p[2] - 1];
  const second = [[p[0] + p[1], p[0] - p[1]], [p[0] - p[1], 1]];
  const covariance = second.map((r, i) => r.map((v, j) => v - mean[i] * mean[j]));
  return { p, mean, covariance };
}

export const distributionScenes = [
  scene('From a distribution to covariance', 'The distribution is the full law; covariance is one summary', [
    [0, 'A probability distribution tells us which outcomes can occur and with what probabilities. Here there are three possible two-dimensional vectors. Their probabilities are weights, not numbers of samples. Changing the weights changes the distribution, even when the possible vectors stay fixed.'],
    [15, 'The mean is the probability-weighted average of those vectors. Covariance is the probability-weighted average of their centered outer products. The moving mean and matrix are calculated exactly from these three outcomes and their current probabilities.'],
    [30, 'For a continuous law, replace the weighted sum by an integral against the density. Probability comes from integrating density over a region; a density value is not itself a point probability. A sample covariance instead uses the empirical distribution, placing weight one over n on each observation.'],
    [45, 'This construction requires finite second moments. Some distributions, such as a Cauchy law, have no finite variance or covariance matrix. When covariance exists, the distribution determines it uniquely. Translating the entire distribution changes its mean but leaves its centered covariance unchanged.'],
  ], (ctx, t) => {
    const { p, mean, covariance } = law(t);
    panel(ctx, 80, 195, 700, 510, 'One exact discrete law · three possible vectors');
    panel(ctx, 820, 195, 700, 510, 'Compute two summaries from the probability weights', color.gold);
    const map = ([x, y]) => [430 + 180 * x, 407 - 100 * y];
    line(ctx, 180, 407, 680, 407, { color: color.line });
    line(ctx, 430, 270, 430, 540, { color: color.line });
    const m = map(mean);
    outcomes.forEach((x, i) => {
      const q = map(x);
      line(ctx, m[0], m[1], q[0], q[1], { color: tints[i], alpha: .65, dash: [5, 5] });
      dot(ctx, ...q, 6 + 14 * Math.sqrt(p[i]), tints[i], .85);
      label(ctx, `x${i + 1} = (${x.join(', ')})`, q[0], q[1] + (i === 2 ? -27 : 39), tints[i], 22, 'center');
    });
    dot(ctx, ...m, 8, color.gold);
    label(ctx, 'mean μ', m[0] + 16, m[1] - 17, color.gold, 23);
    label(ctx, 'Probability of each outcome', 115, 590, color.muted, 20);
    let bx = 115;
    p.forEach((weight, i) => {
      const w = 630 * weight;
      ctx.fillStyle = tints[i]; ctx.fillRect(bx, 610, w - 2, 28);
      label(ctx, `p${i + 1} = ${weight.toFixed(2)}`, bx + w / 2, 668, tints[i], 21, 'center');
      bx += w;
    });
    formula(ctx, 'μ = ∑ₐ pₐxₐ', 855, 283, color.gold, 29);
    formula(ctx, `μ = (${mean[0].toFixed(2)}, ${mean[1].toFixed(2)})`, 855, 334, color.body, 26);
    formula(ctx, 'Σ = ∑ₐ pₐ(xₐ−μ)(xₐ−μ)ᵀ', 855, 414, color.gold, 25);
    formula(ctx, `[ ${covariance[0][0].toFixed(3)}  ${covariance[0][1].toFixed(3).padStart(6)} ]`, 990, 491, color.gold, 31);
    formula(ctx, `[ ${covariance[1][0].toFixed(3).padStart(6)}  ${covariance[1][1].toFixed(3)} ]`, 990, 545, color.gold, 31);
    label(ctx, 'Each pₐ ≥ 0, and ∑ₐ pₐ = 1.', 855, 618, color.body, 24);
    label(ctx, 'These are population moments, not sample estimates.', 855, 665, color.muted, 21);
    if (t < 30) footer(ctx, 'A law determines a mean vector and a covariance matrix.', 'Changing probabilities changes their weighted averages. Moving every outcome by the same vector changes μ, but leaves Σ unchanged.');
    else if (t < 45) footer(ctx, 'Continuous law:  Σ = ∫ (x−μ)(x−μ)ᵀ f(x) dx.', 'For a finite dataset, its empirical law assigns weight 1/n to each observation; this gives the 1/n sample-covariance convention.');
    else footer(ctx, 'A finite covariance requires finite second moments: E[‖X‖²] < ∞.', 'Not every probability distribution has a covariance matrix. When it exists, covariance summarizes centered second moments only.');
  }),

  scene('Does covariance determine a distribution?', 'Same mean. Same variance. Different probabilities.', [
    [0, 'These are three exact one-dimensional probability laws. The Gaussian is smooth. The uniform law has a flat density between minus square root three and plus square root three. The two-point law assigns probability one half to each of minus one and plus one.'],
    [15, 'All three have mean zero and variance one. Yet their probabilities of falling between minus one half and plus one half are different. Add the same independent standard-normal second coordinate: all three resulting two-dimensional laws have identity covariance, and still different distributions.'],
    [30, 'If we assume a multivariate Gaussian family, its mean and covariance together determine its entire law. Outside that family, they generally do not. Even a Gaussian needs its mean as well as its covariance, because covariance alone does not record location.'],
    [45, 'Which matrices can be covariances? Exactly the symmetric positive-semidefinite matrices. Given any such matrix, apply its square root to a standard-normal vector to realize it. Zero eigenvalues are allowed: the resulting distribution lies in a lower-dimensional affine subspace.'],
  ], (ctx, t) => {
    const centers = [310, 800, 1290], scale = 62, base = 515;
    const titles = ['Gaussian · N(0, 1)', 'Uniform · [−√3, √3]', 'Two point masses · −1 and +1'];
    const colors = [color.soft, mint, purple];
    const gaussian = z => Math.exp(-.5 * z * z) / Math.sqrt(2 * Math.PI);
    const density = [gaussian, () => 1 / (2 * Math.sqrt(3))];
    const fractions = ['0.383', '0.289', '0'];
    for (let i = 0; i < 3; i++) {
      const left = 80 + i * 490, cx = centers[i], tint = colors[i];
      panel(ctx, left, 195, 460, 440, titles[i], tint);
      label(ctx, i === 2 ? 'Probability mass P(Z = z)' : 'Probability density f(z)', left + 24, 279, color.muted, 20);
      line(ctx, cx - 205, base, cx + 205, base, { color: color.line });
      const shade = seg(t, 3, 12);
      ctx.save(); ctx.fillStyle = '#f2cf6319'; ctx.fillRect(cx - scale * .5, 301, scale, base - 301);
      ctx.restore();
      if (i < 2) {
        const lo = i === 0 ? -3.25 : -Math.sqrt(3), hi = -lo;
        const pts = seq(151, f => { const z = lo + (hi - lo) * f; return [cx + scale * z, base - 450 * density[i](z)]; });
        if (i === 1) { pts.unshift([cx + scale * lo, base]); pts.push([cx + scale * hi, base]); }
        path(ctx, pts, tint, 3);
        const fill = seq(61, f => { const z = -.5 + f; return [cx + scale * z, base - 450 * density[i](z)]; });
        ctx.save(); ctx.globalAlpha = .55 * shade; ctx.fillStyle = color.gold;
        ctx.beginPath(); ctx.moveTo(cx - scale * .5, base); fill.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(cx + scale * .5, base); ctx.closePath(); ctx.fill(); ctx.restore();
        label(ctx, i === 0 ? 'smooth tails continue' : 'density = 1/(2√3)', cx, 321, tint, 19, 'center');
      } else {
        for (const z of [-1, 1]) {
          const x = cx + scale * z;
          arrow(ctx, x, base, x, base - 150, { color: tint, width: 3 });
          dot(ctx, x, base - 150, 7, tint);
          label(ctx, '½', x, base - 176, tint, 29, 'center');
        }
        label(ctx, 'Each spike carries mass ½.', cx, 303, tint, 18, 'center');
      }
      for (const z of [-2, -1, 0, 1, 2]) {
        line(ctx, cx + scale * z, base, cx + scale * z, base + 7, { color: color.muted });
        label(ctx, String(z), cx + scale * z, base + 28, color.muted, 18, 'center');
      }
      label(ctx, 'z', cx + 212, base + 7, color.muted, 20);
      label(ctx, `P(|Z| < ½) ${i === 2 ? '=' : '≈'} ${fractions[i]}`, cx, 601, color.gold, 23, 'center');
    }
    formula(ctx, 'All three:  E[Z] = 0,   Var(Z) = 1,   Cov(Z) = [1].', 265, 691, color.gold, 27);
    if (t < 15) footer(ctx, 'Equal second moments do not imply equal distributions.', 'The first two plots show densities; the third shows point probabilities. Its spike heights are masses, not density values.');
    else if (t < 30) footer(ctx, 'Add independent Y ∼ N(0,1): each vector (Z,Y) has covariance I₂.', 'The probability of the highlighted interval remains different. Covariance determines every directional variance, but not every event probability.');
    else if (t < 45) footer(ctx, 'Within the Gaussian family, μ and Σ determine the entire law.', 'The Gaussian assumption supplies the information missing from second moments. Covariance alone never determines the mean.');
    else footer(ctx, 'Exactly the symmetric positive-semidefinite matrices can be covariances.', 'If Σ = QΛQᵀ, then X = μ + Q√Λ Z, with Z ∼ N(0,I), realizes Σ. Zero eigenvalues restrict the support to an affine subspace.');
  }),
];
