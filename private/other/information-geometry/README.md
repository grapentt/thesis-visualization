# The geometry of information

A narrated video (31 min 47 s, 15 scenes, one of them live) on the fundamentals of information
geometry: distributions as points, distinguishability as distance, the Fisher metric and where it
leads. It is a side piece, not one of the thesis videos: it reuses the repo's video engine (`src/`:
same player, same scene format, same look), but `npm run build` and `npm test` do not pick it up; it
has its own build, check and export scripts below.

Everything on screen is computed from three running examples:

- **coins** with bias p, flipped n = 100 times (the pairs p = 0.50 / 0.55 and p = 0.02 / 0.07, and 2000 seeded runs of a fair coin);
- **three-sided dice**, the simplex drawn as a triangle and as the octant of the sphere of radius 2;
- **Gaussians** N(μ, σ²), the upper half-plane.

The mathematics lives in `math.js` (no DOM, tested by `tests/information-geometry.test.mjs`); the
drawing devices and the palette in `shared.js`; one scene per file in `scenes/`.

## The argument, scene by scene

| start | length | scene |
| --- | --- | --- |
| 00:00 | 23 s | Title |
| 00:23 | 78 s | Distributions as points |
| 01:40 | 154 s | Flipping coins |
| 04:14 | 135 s | Distinguishability |
| 06:29 | 223 s | Likelihood and score |
| 10:13 | 239 s | The Fisher information |
| 14:12 | 122 s | A metric, not a number |
| 16:14 | 125 s | The sphere in the simplex |
| 18:19 | 102 s | Why this ruler (Chentsov) |
| 20:01 | 125 s | Gaussians: a hyperbolic plane (live: two sliders) |
| 22:06 | 108 s | What the ruler buys (Cramér–Rao, Jeffreys) |
| 23:54 | 125 s | The natural gradient |
| 25:59 | 139 s | Two kinds of straight lines |
| 28:18 | 122 s | Pythagoras for KL |
| 30:20 | 87 s | End to end |

1. **Title.**
2. **Distributions as points.** A family of distributions is a space and its parameters are
   coordinates: coins fill an interval, three-sided dice a triangle, Gaussians a half-plane. The same
   two coins are Δp = 0.05 apart and either Δx = 0.20 or 1.31 apart in log-odds: coordinate
   differences are not distances.
3. **Flipping coins.** Where the count distributions come from: a coin with p = ½ flipped 100 times
   (seeded), five runs flip by flip, then 2000 runs tallied into the binomial hill with the exact
   curve on top. What sets the width: one flip has variance p(1 − p), independent flips add
   variances, sd(K) = √(n p (1 − p)), 5 heads at p = ½ and 1.4 at p = 0.02. The whole family on one
   axis as p sweeps from 0 to 1: narrow at the ends, widest in the middle.
4. **Distinguishability.** Both pairs of hills on one shared axis at one scale, with zooms: for
   p = 0.50 / 0.55 the hills overlap (overlap coefficient 0.62, the step is 1.0 standard
   deviations); for p = 0.02 / 0.07 they barely overlap (0.21, 2.5 standard deviations). Dividing
   the step in heads by the width gives √n Δp/√(p(1 − p)); the coin-dependent factor squared is the
   Fisher information g(p) = 1/(p(1 − p)), 4 in the middle and 51 near the edge:
   # standard deviations ≈ √(n g) Δp.
5. **Likelihood and score.** What p(x | θ) means: a table with one distribution over outcomes for
   each θ (one flip: p(H | θ) = θ; a hundred flips: the binomial hill). Fix the data and vary θ: the
   likelihood; take its logarithm; its slope at the coin p is the score, 1/p for heads and
   −1/(1 − p) for tails. Why the logarithm: relative change, additivity over independent flips
   (sₙ = k/p − (n − k)/(1 − p)), and the Gaussian parabola (s_μ = (x − μ)/σ²). At the true coin the
   mean score is zero because the probabilities sum to one for every θ.
6. **The Fisher information.** Three forms for the coin p₀ = 0.3: the variance of the score, with
   the two squared pushes stacked (1/p + 1/(1 − p) = 4.76) and n flips carrying n g; the expected
   log-likelihood ℓ̄(θ) = Σ_x p(x | p₀) log p(x | θ), constructed point by point as a weighted average
   of the two curves, peaking at the truth with curvature −g (derived by differentiating E[s] = 0);
   and KL(p₀ ‖ θ) = ℓ̄(p₀) − ℓ̄(θ) as the flipped curve with its parabola ½ g δ², the same for every
   f-divergence up to f″(1). Score and g both depend on the coordinates; lengths do not.
7. **A metric, not a number.** g transforms as a (0, 2)-tensor (g_x = g_p (dp/dx)²); the length
   ∫√g |dθ| of the path from p = 0.1 to 0.7 is 1.34 whether integrated in p or in log-odds. In the
   angle φ = 2 arcsin √p the metric is flat and the family has length π; the coin sits on the quarter
   circle 2(√p, √(1 − p)) and the Fisher–Rao distance 2 arccos(√(pq) + √((1 − p)(1 − q))) is an arc.
   Wootters' count: after n flips, coins one standard deviation apart are 1/√n apart in φ, so
   100 flips tell about √n·π ≈ 31 coins apart, crowded towards p = 0 and 1.
8. **The sphere in the simplex.** Balls of one Fisher radius flatten against the triangle's edges;
   y = 2√p bends the triangle (drawn morphing in 3-D) onto the octant of the sphere of radius 2 where
   the Fisher metric is the round one; geodesics are great circles, d_FR = 2 arccos Σ √(p_i q_i) ≤ π,
   the chord is 2√2 × the Hellinger distance. Back on the triangle the geodesic bows away from the
   straight mixture segment.
9. **Why this ruler.** Relabelling faces changes nothing; merging outcomes 2 and 3 turns the dice
   (0.35, 0.5, 0.15) and (0.3, 0.15, 0.55), 0.97 apart, into coins 0.11 apart (a statistic can only
   shrink Fisher–Rao distances, equality for sufficient ones); splitting face 3 in fixed proportions
   keeps 0.97. Chentsov 1972: a metric on all simplices invariant under Markov embeddings is c·g_Fisher;
   extensions by Campbell 1986, Ay–Jost–Lê–Schwachhöfer 2015, Bauer–Bruveris–Michor 2016.
10. **Gaussians** (live scene). g = diag(1/σ², 2/σ²); (μ/√2, σ) is the Poincaré half-plane up to a
    factor 2, curvature −½ (Hotelling 1929, Rao 1945); geodesics are half-ellipses standing on the μ
    axis, with the closed-form distance √2 arcosh(1 + ((Δμ)² + 2(Δσ)²)/(4σ₁σ₂)). The geodesic between
    N(−3, 0.5²) and N(3, 0.5²) widens to σ = 2.18 on its way. Two sliders (view lenses, never pausing
    the video) move the second Gaussian; the video plays them itself at 50–67 s of scene time.
    Contrast with Wasserstein-2 (flat, straight segments) and the unbounded, logarithmic growth of the
    distance (d_FR(N(0, 1), N(100, 1)) ≈ 12).
11. **What the ruler buys.** 160 seeded estimates of three dice from 100 rolls each scatter inside
    the Fisher ball of radius 1/√n: Cramér–Rao, Cov[θ̂] ⪰ g⁻¹/n, attained by the sample frequencies,
    a tensor inequality. Jeffreys' prior √det g is Beta(½, ½) for the coin, flat in φ, uniform on the
    octant for the die; its volume in balls of radius 1/√n is the MDL complexity term.
12. **The natural gradient.** Fitting N(μ, σ²) to N(0, 1) from N(3, 0.5²) by minimising KL: plain
    gradient steps at η = 0.3 overshoot (σ jumps to 23.9) and at η = 0.02 crawl (loss 0.87 after 60
    steps); natural-gradient steps −g⁻¹∇L at η = 0.3 widen, slide and narrow onto the target in about
    15 steps. In the small-step limit the natural-gradient flow is a straight line in the expectation
    coordinates (μ, μ² + σ²): a mixture geodesic.
13. **Two kinds of straight lines.** Mixtures (straight in p), exponential arcs (straight in log p)
    and the Fisher–Rao geodesic between them, drawn in the η chart (the triangle) and the θ chart
    (log-odds against face 3), Legendre dual: η = ∇ψ, θ = ∇φ with φ = −H, g = ∇²ψ = Cov[T]. Amari's
    dual flat connections, X g(Y, Z) = g(∇ᵉ_X Y, Z) + g(Y, ∇ᵐ_X Z), the α-family between them, and the
    curved Levi-Civita average.
14. **Pythagoras for KL.** B_ψ(θ_a, θ_b) = KL(p_b ‖ p_a); when the mixture segment p → q meets the
    exponential arc q → r at a right angle in the Fisher metric, KL(p ‖ r) = KL(p ‖ q) + KL(q ‖ r)
    (0.124 + 0.240 = 0.364 on the example); KL(p ‖ ·) along the e-line is minimised at the foot q
    (the m-projection; maximum likelihood is the m-projection of the empirical distribution); EM as
    alternating e- and m-projections.
15. **End to end.** Five cards and the references.

## Mathematical contract

Every identity the narration states is checked in `tests/information-geometry.test.mjs`:

- the three faces of the Fisher information agree (score variance, expected curvature, Hessian of KL
  in either argument, the generic finite-family definition); KL/(½ g δ²) → 1;
- the coin numbers: g(0.5) = 4, g(0.02) = 51, the steps are 1.0 and 2.5 standard deviations;
- the tensor law g_x = g_p (dp/dx)², dφ² = g dp², the numerical length equals the angle difference,
  the family has length π, 32 coins one standard deviation apart after 100 flips;
- Cramér–Rao attained by the sample proportion; Jeffreys = √g/π, normalised, flat in φ;
- the pulled-back round metric of the radius-2 sphere is the simplex Fisher metric; chord = 4 sin(ϑ/2)
  = 2√2 H; the great circle has length d_FR; m- and e-geodesics stay on the simplex and e-geodesics
  are log-affine; Fisher balls have Fisher radius r;
- coarse-graining shrinks d_FR, relabelling and Markov embeddings keep it, with the scene's numbers;
- η = ∇ψ, ∇²ψ = Cov = g⁻¹ of the η chart, B_ψ(θ_p, θ_q) = KL(q ‖ p), ψ + φ = ⟨θ, η⟩;
- the Pythagorean triple is orthogonal at q and KL(p ‖ r) = KL(p ‖ q) + KL(q ‖ r);
- the Gaussian Fisher matrix by quadrature and as the Hessian of KL; the geodesic's length equals the
  closed-form distance and beats the straight segment; σ = √(μ²/2 + σ²) at the midpoint;
- the natural gradient is g⁻¹∇L, coordinate-free; the three descents behave as narrated; small
  natural steps stay on the straight line in η.

## Pacing

Each scene is choreographed on its own clock and then stretched by a factor (`PACE` in `index.js`,
through `paced()` in `shared.js`) so that its wordiest narration cue fits the exporter's system voice
at 155 words per minute. Change a factor to re-time a scene without touching its choreography.

## References

- Rao, *Information and the accuracy attainable in the estimation of statistical parameters*, Bull.
  Calcutta Math. Soc. 37 (1945).
- Jeffreys, *An invariant form for the prior probability in estimation problems*, Proc. R. Soc. A 186 (1946).
- Chentsov, *Statistical decision rules and optimal inference*, Nauka 1972 (AMS translation 1982);
  Fujiwara, *Hommage to Chentsov's theorem*, Information Geometry (2022).
- Campbell, *An extended Čencov characterization of the information metric*, Proc. AMS 98 (1986).
- Ay, Jost, Lê & Schwachhöfer, *Information geometry and sufficient statistics*, PTRF 162 (2015);
  *Information Geometry*, Springer 2017.
- Bauer, Bruveris & Michor, *Uniqueness of the Fisher–Rao metric on the space of smooth densities*,
  Bull. LMS 48 (2016).
- Wootters, *Statistical distance and Hilbert space*, Phys. Rev. D 23 (1981); Braunstein & Caves,
  *Statistical distance and the geometry of quantum states*, PRL 72 (1994).
- Costa, Santos & Strapasson, *Fisher information distance: a geometrical reading*, Discrete Appl.
  Math. 197 (2015).
- Amari, *Natural gradient works efficiently in learning*, Neural Computation 10 (1998); Amari &
  Nagaoka, *Methods of information geometry*, AMS 2000; Amari, *Information geometry and its
  applications*, Springer 2016.
- Csiszár & Tusnády, *Information geometry and alternating minimization procedures*, Statistics &
  Decisions (1984); Amari, *Information geometry of the EM and em algorithms*, Neural Networks 8 (1995).
- Martens, *New insights and perspectives on the natural gradient method*, JMLR 21 (2020);
  Raskutti & Mukherjee, *The information geometry of mirror descent*, IEEE Trans. Inf. Theory 61 (2015).
- Nielsen, *An elementary introduction to information geometry*, Entropy 22 (2020).

## Run, build, check, export

From the repo root (Playwright's own Chromium is not installed here, hence the Chrome channel):

```bash
npm run dev                                      # then open http://localhost:5173/private/other/information-geometry/
node private/other/information-geometry/build.mjs           # → dist/information-geometry.html (self-contained)
node --test private/other/information-geometry/tests/information-geometry.test.mjs   # the mathematical contract
```

Check the build (page errors, the live scene drawing the same frame however it is reached, every
control at its extremes, no clock or unseeded randomness in the sources) and render frames to look at:

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/information-geometry/render.mjs                              # the checks, 3 frames per scene
PLAYWRIGHT_CHANNEL=chrome node private/other/information-geometry/render.mjs --out /tmp/frames --scene 7  # one scene, every 4 s
```

Export the MP4 with the macOS voice reading the narration, English subtitles and chapter markers
(needs `ffmpeg`, `ffprobe` and `say`):

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/information-geometry/export.mjs   # → information-geometry.mp4 and .srt
```

## Files

- `index.js` lists the scenes in playing order with their pacing factors; `meta.json` names the video.
- `math.js` is the mathematics (Bernoulli, simplex and Gaussian families, Fisher metrics, Fisher–Rao
  distances and geodesics, KL and Bregman divergences, the e- and m-geodesics, plain and natural
  gradient descent); `tests/information-geometry.test.mjs` checks it.
- `shared.js` holds the palette, the frames, triangles, bars, curves and small widgets, and `paced()`.
- `scenes/NN-*.js`, one scene per file.
- `index.html` and `main.js` are the development page; `build.mjs`, `render.mjs` and `export.mjs`
  build, check and export it.
