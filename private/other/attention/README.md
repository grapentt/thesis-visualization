# The geometry of attention

A narrated video (14 min 16 s, 14 scenes, one of them live) that reads one attention head of a
transformer in differential-geometric and information-geometric terms. It is a side piece, not one of
the thesis videos: it reuses the repo's video engine (`src/`: same player, same scene format, same
look), but `npm run build` and `npm test` do not pick it up; it has its own build, check and export
scripts below. The thesis is about generative models on shape space; the same vocabulary (bilinear
forms, bundles and connections, Legendre transforms, Fisher metrics, gradient flows) describes attention
exactly, and the video exists to make that reading concrete.

Everything on screen is computed from one running example: a residual stream of dimension d = 2, so
the whole space fits on a chart, with seven keys

    x₁ = (1.5, 0.6)   x₂ = (0.9, 1.45)   x₃ = (−0.65, 1.5)   x₄ = (−1.55, 0.35)
    x₅ = (−1.1, −1.15)   x₆ = (0.25, −1.55)   x₇ = (1.3, −0.9)

and one bilinear form

    M = [[0.9, 0.8], [−0.2, −0.4]] = S + A,   S = [[0.9, 0.3], [0.3, −0.4]],   A = [[0, 0.5], [−0.5, 0]].

S has eigenvalues 0.966 and −0.466, so it is indefinite. The mathematics lives in `math.js` (no DOM,
tested by `tests/attention.test.mjs`); the drawing devices and the example in `shared.js`, the triangle of
scenes 08 and 09 in `simplex.js`; one scene per file in `scenes/`.

## The argument, scene by scene

| start | length | scene |
| --- | --- | --- |
| 00:00 | 9 s | Title |
| 00:09 | 46 s | Roadmap |
| 00:55 | 74 s | The score as a tensor |
| 02:09 | 62 s | Where the form comes from |
| 03:11 | 66 s | Position as a connection |
| 04:17 | 65 s | Softmax as an exponential family |
| 05:22 | 60 s | The Legendre map |
| 06:22 | 72 s | The Fisher metric |
| 07:34 | 78 s | A dually flat simplex |
| 08:52 | 62 s | Entropy-regularised argmax |
| 09:54 | 65 s | On the sphere: von Mises–Fisher |
| 10:59 | 60 s | The Hopfield energy |
| 11:59 | 85 s | Depth as a flow (live: β, a, drag to rotate) |
| 13:24 | 52 s | End to end |


1. **Title.**
2. **Roadmap.** The head as a composition: `o_i = W_V ∇ψ(Mᵀ x_i)`, linear – Legendre – linear, with
   `ψ(θ) = log Σ_j e^{⟨θ, x_j⟩}`. Two layers of geometry: the residual stream (scenes 02–04) and the
   softmax (05–09); then the sphere and depth (10–12).
3. **The score as a tensor.** `s_ij = x_iᵀ M x_j` with `M = W_Qᵀ W_K / √d_k` is a constant (0, 2)-tensor
   on the flat residual stream. Bilinear: holding either slot fixed gives parallel level lines. The
   split `M = S + A`: S is a symmetric form (here indefinite: hyperbolic level sets, two null lines, keys
   with negative squared length), A is a 2-form, which in d = 2 is `a` times the oriented area spanned by
   the two vectors; it drops out of `xᵀ M x` and makes attention directed, `s_ij − s_ji = 2 ω(x_i, x_j)`.
4. **Where the form comes from.** `s_ij = ⟨W_Q x_i, W_K x_j⟩` is the Euclidean pairing of ℝ^{d_k}
   pulled back along two different maps. With d_k = 1 each map is a covector (`w_q = (1, 0.4)`,
   `w_k = (0.5, 1)`), `M = w_q w_kᵀ` has rank one, and keys moving along `ker W_K` change no score. In
   general `rank M ≤ d_k` and `rank S ≤ 2 d_k` (the notes said `≤ d_k` for S; the symmetric part of a
   rank-r matrix can have rank 2r). With `W_Q = W_K = W` the form is `Wᵀ W ⪰ 0`, a degenerate pullback
   metric; the eigenvalues of S for the rank-one case are `½(w_q·w_k ± ‖w_q‖‖w_k‖)`, so the negative
   direction and the 2-form appear exactly when the two covectors are not parallel.
5. **Position as a connection.** Tokens live in the fibres of the trivial bundle ℝ^d × {1, …, n} over
   the sequence; comparing fibres needs a transport, which positional encoding supplies. RoPE makes it a
   block rotation, and since the blocks commute, `q_mᵀ R_mᵀ R_n k_n = q_mᵀ R_{n−m} k_n`: a constant
   connection form, translation invariant, so only relative position enters; the form is twisted,
   `M_mn = R_mᵀ M R_n`.
6. **Softmax as an exponential family.** Fix a query; `θ = Mᵀ x_i`; `a_j ∝ e^{⟨θ, x_j⟩}` is an
   exponential family supported on the keys with sufficient statistic `T(j) = x_j`, natural parameter θ
   and log-partition ψ. The attended context is the mean parameter `η = Σ a_j x_j = ∇ψ(θ)`.
7. **The Legendre map.** `θ ↦ η = ∇ψ(θ)` maps the θ-plane onto the interior of the convex hull of the
   keys (a bijection, because the keys span the plane so ψ is strictly convex); along a ray `β θ₀` it
   runs from the centroid to the vertex extreme in direction θ₀. The inverse is `∇ψ*` with
   `ψ*(η) = sup_θ ⟨θ, η⟩ − ψ(θ)`.
8. **The Fisher metric.** `∇²ψ(θ) = Cov_a[x_j]`, the covariance of the keys under the attention
   weights, drawn as an ellipse at η; it is also the Jacobian of the head in its query,
   `∂o_i/∂x_i = W_V Cov_a[x_j] Mᵀ`. Spread-out attention is sensitive; collapsed attention (a vertex of
   the simplex) has zero Fisher information: the geometric content of attention entropy collapse.
9. **A dually flat simplex.** With three keys the patterns form a triangle. Scores are e-affine
   coordinates, weights m-affine; m-geodesics are straight mixtures, e-geodesics are log-linear; the
   temperature path `β ↦ softmax(β s)` is an e-geodesic from the barycentre to a vertex and `1/√d_k` is
   such a β. The Bregman divergence of ψ is the KL divergence, `B_ψ(θ₁, θ₂) = KL(a₂ ‖ a₁)`, and the dual
   potential is `ψ*(a) = Σ a log a = −H(a)`.
10. **Entropy-regularised argmax.** `a = argmax_{a∈Δ} ⟨a, s⟩ + H(a)`. Replacing Shannon by the Tsallis
    entropy `H_α` gives α-entmax (α = 1 softmax, α = 2 sparsemax): the same simplex with a different
    divergence, and exact zeros at finite β.
11. **On the sphere.** With normalised embeddings and `M = κ I` the kernel `e^{κ⟨x̂_i, x̂_j⟩}` is the von
    Mises–Fisher density; the weights are the responsibilities of a vMF mixture with components at the
    keys (the E-step), the output its responsibility-weighted mean. In flat space the same reading holds
    for a Gaussian mixture with equal covariances once key norms are constant.
12. **The Hopfield view.** `E(ξ) = −β⁻¹ log Σ_j e^{β⟨x_j, ξ⟩} + ½‖ξ‖²`; the update
    `ξ ↦ X softmax(β Xᵀ ξ)` is `∇ψ(βξ)` again, never increases E, and is one attention step with the
    keys as values. Low β merges patterns into one metastable minimum; high β retrieves each key.
13. **Depth as a flow** (live scene). Tokens on S² with `ẋ_i = P⊥_{x_i} Σ_j a_ij x_j`,
    `a_ij = softmax_j(β x_iᵀ M x_j)`, `M = I + a [ẑ]ₓ`. With a = 0 the dynamics is a gradient flow of
    the interaction energy `E_β = (1/2βn²) Σ e^{β x_i·x_j}` (for a modified metric on the sphere), so E
    is non-decreasing and tokens cluster with depth. The antisymmetric part adds a circulation that is
    not a gradient. The viewer can change β and a.
14. **End to end.** The chain in one sentence, with references.

## Mathematical contract

Every identity the narration states is checked in `tests/attention.test.mjs`:

- `M = S + A`, `xᵀ A x = 0`, `s_ij − s_ji = 2 x_iᵀ A x_j`, the 2-form as `a` times the oriented area.
- Rank-one pullback: eigenvalues `½(w_q·w_k ± ‖w_q‖‖w_k‖)`; the null direction of the key map changes
  no score; `W_Q = W_K` gives a positive semidefinite form.
- RoPE: the absolute computation equals the relative one; shifting both positions changes nothing;
  `R_mᵀ R_n = R_{n−m}`.
- `∇ψ = Σ a_j x_j` and `∇²ψ = Cov_a[x_j]` against central differences; η inside the hull; η at a
  vertex and Fisher → 0 as β → ∞; entropy decreasing in β.
- `B_ψ(θ₁, θ₂) = KL(a₂ ‖ a₁)`; `⟨s, a⟩ − ψ(s) = Σ a log a` at `a = softmax(s)`; softmax maximises
  `⟨a, s⟩ + H(a)`; the temperature path is log-affine in β.
- sparsemax and α-entmax are distributions that maximise `⟨a, s⟩ + H_α(a)`, with exact zeros;
  `entmax(·, 1) = softmax`, `entmax(·, 2) = sparsemax`.
- vMF responsibilities equal the attention weights; the Gaussian-mixture identity for equal key norms.
- The Hopfield update is `∇ψ(βξ)` and never increases E.
- The sphere flow keeps tokens on the sphere, reduces the cluster count, and its energy is
  non-decreasing while a = 0; a ≠ 0 changes the velocities.

## References

- Vaswani et al., *Attention is all you need*, NeurIPS 2017.
- Su, Lu, Pan, Murtadha, Wen, Liu, *RoFormer: enhanced transformer with rotary position embedding*,
  arXiv:2104.09864 (2021); Neurocomputing 568 (2024).
- Amari, *Information geometry and its applications*, Springer 2016 (dually flat structures, Bregman
  divergences of exponential families).
- Martins & Astudillo, *From softmax to sparsemax*, ICML 2016.
- Peters, Niculae & Martins, *Sparse sequence-to-sequence models*, ACL 2019 (α-entmax).
- Ramsauer et al., *Hopfield networks is all you need*, ICLR 2021 (arXiv:2008.02217).
- Zhai et al., *Stabilizing transformer training by preventing attention entropy collapse*, ICML 2023.
- Geshkovski, Letrouit, Polyanskiy & Rigollet, *A mathematical perspective on transformers*,
  arXiv:2312.10794 (2023); Bull. AMS 62 (2025); and *The emergence of clusters in self-attention
  dynamics*, NeurIPS 2023.
- Sander, Ablin, Blondel & Peyré, *Sinkformers: transformers with doubly stochastic attention*,
  AISTATS 2022 (symmetric attention as a Wasserstein gradient flow).

## Run, build, check, export

From the repo root (Playwright's own Chromium is not installed here, hence the Chrome channel):

```bash
npm run dev                                      # then open http://localhost:5173/private/other/attention/
node private/other/attention/build.mjs           # → private/other/attention/dist/attention.html (self-contained)
node --test private/other/attention/tests/attention.test.mjs   # the mathematical contract
```

Check the build (page errors, the live scene drawing the same frame however it is reached, every
control at its extremes, no clock or unseeded randomness in the sources) and render frames to look at:

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/attention/render.mjs                               # the checks, 3 frames per scene
PLAYWRIGHT_CHANNEL=chrome node private/other/attention/render.mjs --out /tmp/frames --scene 12  # one scene, every 4 s
```

Export the MP4 with the macOS voice reading the narration, English subtitles and chapter markers
(needs `ffmpeg`, `ffprobe` and `say`):

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/attention/export.mjs      # → private/other/attention/attention.mp4 and .srt
```

## Files

- `index.js` lists the scenes in playing order; `meta.json` names the video.
- `math.js` is the mathematics (softmax as an exponential family, its Legendre map and Fisher
  information, sparsemax and entmax, RoPE, von Mises mixtures, the Hopfield energy, the sphere flow
  as a seeded simulation); `tests/attention.test.mjs` checks it.
- `shared.js` holds the palette, the running example and the drawing devices (charts, tokens, hulls,
  contours, heatmaps, matrices, weight bars); `simplex.js` the triangle of attention patterns.
- `scenes/NN-*.js`, one scene per file.
- `index.html` and `main.js` are the development page; `build.mjs`, `render.mjs` and `export.mjs`
  build, check and export it.
