# a2 · The thesis videos on open PR #3 (retention, covariance, interactions, bundles)

Scope: draft PR #3 "WIP: Add the 'What the noise should keep' video" (branch `playable-video-prototype`, 3 commits, 112 files, +21 806 lines, opened 2026-11-16, unreviewed). Paths are relative to the export root
`EXPORT = /private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/anim-playable-video-prototype`.
The export lacks `scripts/` and `tests/`; I fetched the PR's six missing files read-only via `gh api` into `…/scratchpad/pr3-missing/`, built the four videos in a scratch copy (`…/scratchpad/build-pr3/`), ran the 39 PR tests (all pass) and rendered review frames with `PLAYWRIGHT_CHANNEL=chrome` (no page errors). Nothing in the repo was modified.

Commit history: 13b4519f (2026-10-27) Parts and Poses + One Space, Many Bundles + `docs/` notes; 2495230d (2026-11-16) Covariance + narrated export; 9967ab40 (2026-11-16) What the noise should keep (WIP). No PR comments.

---

## 1. Inventory

### 1.0 Engine and draw changes relative to main

`src/engine/` and `src/draw/` are **byte-identical** to main (`diff -r` clean), as are `src/kit.js`, `src/model/`, `docs/interactive-video.md`, `package.json` and the main scripts (`build`, `export-frames`, `smoke-test`). The only shared-code changes:

- `src/app.js`: `window.video.scenes[*]` now also carries `narration`; `window.video.frame(T, width, { mimeType, quality })` accepts a MIME type, so the narrated exporter can stream JPEGs.
- `src/main.js`: registers the four videos and adds a **lazy-load pattern** for heavy ones (`{ ...meta, load: () => import('./videos/interactions/index.js') }`), because interactions computes ~3 s of data at import.
- `src/videos/common/configuration.js`: `drawStackedConfiguration(ctx, t, X, colorOf = atomColor)` (bundles colours beads its own way).
- New scripts `export-narrated.mjs`, `review-frames.mjs`, `check-covariance.mjs`; tests: 15 retention, 14 covariance, 10 interactions (+5 torus on main = the PR's "44 model tests"); smoke test over 7 videos, 122 scenes.

### 1.1 Retention · "What the Noise Should Keep" (`src/videos/retention`, 12 scenes, 17:00)

Models: `math.js` (erf/Φ⁻¹, OU coordinate, two-basin line, Gaussianising map, operator closure, KL flow identity, circle heat kernel, small linear algebra) and `toy.js` (bond–torsion toy on an 80×56 grid, four observables, three noising channels, separable retention engine, posterior, tilts, conditional whitening). All curves precomputed at module level.

| # | start · dur | scene | what is shown / key computed objects |
|---|---|---|---|
| 0 | 0:00 · 20 s | Title | Faint flat-channel retention curves as backdrop; "builds on Part 1 and Covariance". |
| 1 | 0:20 · 75 s | Where Part 1 stopped | Part 1's noise/score/loss rows (flat vs metric G), gold "G = K" box; share-of-signal curves σᵢ²/(σᵢ²+σₜ²) with the stiff curve sliding onto the soft one under whitening ("×20 in noise level"); two question panels, RETENTION and REPRESENTATION. |
| 2 | 1:35 · 120 s | Two geometries, not one | Exact OU paths for bond (k = 400/ps) and torsion (k = 1/ps) with mean ± 2√C_τ envelopes; one log–log plot in three phases (C_τ; F_τ with guide 1/2Dτ and dashed thermal metric 1/v; the step statistic) with a lag cursor; 1 ps marker: bond 100 %, torsion 63 % of equilibrium width. |
| 3 | 3:35 · 80 s | Same word, three experiments | Columns: dynamics at lag τ; Gaussian denoising of the two-basin line at σ = 0.5 (posterior-mean band, moving tangent, slope = C^post/σ² read out twice); Euclidean pullback (unit balls of DφᵀDφ). |
| 4 | 4:55 · 85 s | Information about what? | Heatmap of p(r, φ); four observable cards u₁…u₄; the density tilted live along each uₖ; I₀ = Cov(u) with computed sd(uₖ). |
| 5 | 6:20 · 95 s | What the noisy molecule still knows | A wandering noisy point y, its σ ellipse and lavender posterior cloud (`posterior()` per frame); live bars of E[u \| y]; identities for I_t and its split; retained/erased bars with live R as σ follows keyframes; Gaussian case = Part 1's curve. |
| 6 | 7:55 · 115 s | Retention curves | R_t of four observables vs log noise; crossfade flat → local thermal widths → global covariance; computed σ½ dots and legend; channel cards with noise-ellipse glyphs. |
| 7 | 9:50 · 120 s | What the model must learn | Operator L_W, residual r ⊥ u, Γ_SM; curves u, L_W u, −G I⁻¹u, r for two cases; computed 2×2 variance-ratio table; Gaussianising map φ; log mobility with barrier marker. |
| 8 | 11:50 · 75 s | Whitening the stiff conditional | 600 samples travel from (s, r) to (s, ξ); ξ sample moments; Jacobian with the coupling entry boxed. |
| 9 | 13:05 · 70 s | Why the loss norm is the noise covariance | Data and wrong model flowing under one heat flow; KL(p_t‖q_t) and KL₀ − ∫ score error coincide; shaded running integral; readouts. |
| 10 | 14:15 · 85 s | What this does not say | Six claim cards with verdict pills (EXACT … FALSE); circle heat kernel spreading; τF_τ → 0 against the Ricci-flow prediction. |
| 11 | 15:40 · 80 s | Three changes, in order | Three typewriter cards and a gold "contract" box: "Keep the thermal objective. Make its lag explicit. Decide what the noise should keep." |

### 1.2 Covariance · "The Geometry of Fluctuations" (`src/videos/covariance`, 38 chapters, 30:30)

Models: `math.js` (seeded samples, bent ribbon, metric widths, gradient flows, signal fraction, hyperbolic transport, arc covariance, local estimator, ellipsoidal cap, categorical embedding). Scenes live in six modules (`basics`, `foundations`, `clarity`, `distributions`, `local-global`, `embedding`) plus 15 `chapter(...)` calls in `index.js`, re-sequenced by an `ordered` list. **Two authored chapters are not in the cut**: "A cloud, three geometries" (one cloud under G = I, Σ⁻¹, Σ) and "What a covariance measures" (`index.js` `scenes[0]`, `scenes[1]`). Chapters (start, seconds):

1. 0:00, 60 · Start with variance: observations 1, 2, 4, 5; squared deviations as squares; Var 2.5, sd 1.58.
2. 1:00, 45 · One observation is one vector: 12-D sample table; d = 3N; 3N − 6 shape directions.
3. 1:45, 45 · Sample count is not dimension: n = 4 → 8 → 12, the 2×2 estimate recomputed.
4. 2:30, 45 · Vectors, matrices, and eigenvalues: 3-vector, 3×3 Σ, λ = (3, 1, 0.25).
5. 3:15, 60 · Calculate covariance from samples: centring animation, outer products, Σ̂ = [[2.5, 1.5], [1.5, 1]].
6. 4:15, 45 · Read the matrix entries: tilting standardised cloud, live correlation.
7. 5:00, 45 · What every column means: highlighted column as signed bars.
8. 5:45, 60 · Covariance in many dimensions: 12×12 heatmap; projected histogram, vᵀΣv readout.
9. 6:45, 45 · What an eigenvector actually is: v vs Σv until aligned; eigenvalues 3 and 1.
10. 7:30, 45 · Principal directions and ellipsoids: rotating 3D ellipsoid wireframe.
11. 8:15, 60 · From a distribution to covariance: three-outcome law, exact μ and Σ.
12. 9:15, 60 · Does covariance determine a distribution?: N(0,1), uniform, ±1; P(\|Z\| < ½) = 0.383, 0.289, 0.
13. 10:15, 45 · Why covariance knows stiffness: wells k = 1 and 25; Σ = k_BT K⁻¹, G = Σ⁻¹.
14. 11:00, 45 · Whitening is a change of units: z = Σ^{−1/2}(x − μ), grid stretches, Cov(z) = I.
15. 11:45, 45 · Undoing numerical stiffness: ẋ = −Kx (rates 1, 25) vs ẋ = −G⁻¹Kx = −x.
16. 12:30, 45 · Noise, scores, and loss: signal-fraction bars, tI (29 % vs 2 %) vs tΣ (29 %, 29 %) at t = 2.5.
17. 13:15, 45 · What covariance cannot tell you: filled cloud vs ring, both Σ = I.
18. 14:00, 45 · Zoom from global to local: shrinking arc window on a ring, exact arc covariance.
19. 14:45, 45 · Why local and global covariance differ: 2.1322 I = 0.1322 I + 2 I.
20. 15:30, 45 · Build the local covariance field: kernel estimator (h = 0.38) at a moving query, live entries.
21. 16:15, 45 · Local, not global: moving local ellipse vs fixed global ellipse in a bent valley.
22. 17:00, 45 · Long distances from local rulers: chord L = 17.93 vs valley 3.40.
23. 17:45, 45 · A bent cloud that is flat: grid unbends, z₂ = (y − b(x))/σ, curvature 0.
24. 18:30, 45 · Three meanings of curvature: bending, changing ellipses, intrinsic.
25. 19:15, 45 · What metric curvature means: G = diag(1, e^{2u}), K = −1.
26. 20:00, 45 · From local units to global coordinates: non-closing coframe, gap h(e^b − e^a).
27. 20:45, 45 · Curvature you can see: parallel transport, −0.752 rad = −43.1°.
28. 21:30, 45 · Zoom into curvature itself: angle/area = −1 as the loop shrinks.
29. 22:15, 60 · A 2D distribution lifted into 3D: ellipsoidal cap, 20 000 area-uniform samples.
30. 23:15, 60 · The full projected histogram: 3D bars clipped to the ellipse, 1/A ≈ 0.244.
31. 24:15, 45 · A histogram of the projection: count ÷ projected vs ÷ surface area.
32. 25:00, 45 · The pullback equals inverse covariance: C = PPᵀ, G = C⁻¹ = I + wwᵀ, curvature readout.
33. 25:45, 60 · A distribution family with the same property: categorical Fisher sphere, K = 1/4.
34. 26:45, 45 · What the correction removes: geodesic separation sin r, r, sinh r.
35. 27:30, 45 · Covariance itself as the metric: lens slider ratio 5 → 8; r : 1 : r²; κ(G⁻¹K) = r⁴.
36. 28:15, 45 · Does the manifold become visible?: ribbon normal offsets × 0.16.
37. 29:00, 45 · Avoiding the wrong conclusion: EΣE, ½Δ_G drift, ρ_G = ρ dx/√det G.
38. 29:45, 45 · The three takeaways.

### 1.3 Interactions · "Parts and Poses" (`src/videos/interactions`, 20 scenes, 22:16)

Water + hydrogen peroxide in a toy force field (300 K), each with a frozen monomer diffusion model, plus one learned interaction energy φ. Models: `toy.js` (force field with analytic gradients, pose coordinates, Kabsch, samplers), `springs.js` (exact spring molecules: Laplacians, noised score (L⁺ + σ²P)⁺P, exact posteriors), `lines.js` (point molecules on a line), `linalg.js` (Jacobi eigen, pinv, Cholesky, least squares), `data.js` (everything computed at import, with throwing `guard()`s), `diagram.js` (the master diagram). Scenes (start · duration):

0 Title (0:00 · 12 s). 1 Question (0:12 · 41): reuse the parts, learn the meeting. 2 Noise and scores (0:53 · 73): clean water → noisy z with σ rings; σ²×target arrows (to x₀) morph into σ²×score arrows (to the weighted mean of ghost clean waters, 20 000 importance-weighted proposals, N_eff ≥ 30); Tweedie; small-noise score = force/kT. 3 One molecule (2:06 · 74): 9 = 6 rigid + 3 shape, orbit/torsor carousel, base and fibres, computed zero net force/torque. 4 Two molecules (3:20 · 55): coordinate bar 21 = 6 + 3 + 6 + 6, quotients of 15 and 9 dimensions. 5 Fibre (4:15 · 82): 6-D relative pose, gauge flags, associated bundle. 6 The picture (5:37 · 74): master diagram (floor = water angle × peroxide torsion, fibres = pose u), pop-out pair, U_W and U_P flat along a fibre, U_int not. 7 Just add? (6:51 · 90): summed frozen scores = independent molecules; w = e^{−βU_int}; flat fibres collapse into docking peaks. 8 Induced fit (8:21 · 56): torsion shifts ≈ 10°, water angle ≈ 1°, checked by direct simulation. 9 Noise (9:17 · 66): matched centring, W_t, peaks melt. 10 The identity (10:23 · 80): two points on a line, heatmaps of reference, clean bands and W_t. 11 Who moves what (11:43 · 72): monomer vs interaction arrows, third law. 12 Not the force (12:55 · 78): exact spring toy, plug-in force off by 74 %, 365 %, 2255 % at σ = 0.3, 1, 3. 13 One energy (14:13 · 84): invariant φ; swaps yes, mirrors no. 14 Recipe (15:37 · 76). 15 Clusters (16:53 · 62). 16 Many-body (17:55 · 60): three-body share 3 % (σ = 0.02) up to 85 % (σ = 0.3), error bars. 17 Connection (18:55 · 99): a zero-momentum loop turns water ≈ 6° (equal noise) vs ≈ 12° (mass-weighted). 18 Verdict (20:34 · 71): KNOWN / THIS WORK / MEASURED (water dimer: no data gain at 100–10 000 frames) / UNDER WAY (alanine dipeptide + water). 19 Summary (21:45 · 31).

### 1.4 Bundles · "One Space, Many Bundles" (`src/videos/bundles`, 16 scenes, 11:08; one narration paragraph per scene)

Nitroethane as five beads with SO(3) and a rotor U(1); reuses Part 0's plane bundle (`part-0/bundleBox.js`) and adds `beads.js` (teal beads, reused by interactions). Scenes: 0 Title (7 s); 1 Configuration (21, beads stacked into ℝ³ᴺ); 2 Orientation (37, centre-of-mass section, SO(3) fibre); 3 The rotor (39); 4 Many bundles (40, commuting actions, three quotients); 5 Is it a bundle? (50); 6 Sections (56, hairy ball, no global body frame for N ≥ 4); 7 The rotor in shape space (40, a full rotor turn at L = 0 turns the molecule ≈ 80°: lips +79°, rest −281°); 8 Associated bundle (46); 9 Coupling (46); 10 One bead is not a frame (52); 11 The rotor's plane (50, TS², solid angle, Chern number 2); 12 Brownian holonomy (54, histogram of 1 000 loop holonomies vs the sech² law, E θ² = λ²t²/12); 13 Which curvature? (50, O'Neill ¾\|Ω\|²); 14 Noise turns the molecule (50); 15 Summary (30).

---

## 2. Visual vocabulary and style

**Shared identity (`draw/theme.js`).** Dark navy stage `#0d1321` with a dot grid, panels `#141c2e`, lines `#2c3a56`, ink `#ece8de`. Meaning-carrying colours: soft blue `#6cc4e8`, stiff orange `#ef8a5b`, gold `#f2cf63`. Typefaces: Spectral (display serif) for titles (42 px) and statements; IBM Plex Sans for body (22 px); IBM Plex Mono for eyebrows (`NN · NAME`, tracking 2.5), ticks, notes and readouts (13–17 px). The timeline draws the header (eyebrow at top-left, title below), fades it in over 0.1–0.9 s, and dips to dark between scenes. Stage is 1600×900.

**Per-video palettes** ("one meaning per colour" within a video, not across videos):
- retention (`retention/shared.js`): BOND stiff orange, WIDTH pale orange `#f3b58d`, TORSION soft blue, BASIN gold (also the moving point), INFO lavender `#c39bf5` for everything Fisher information produces (retained fractions, posterior clouds, the operator), MODEL green `#86d08f`, KL rose `#f497c0`, DATA grey.
- covariance (`covariance/draw.js`): soft blue Euclidean/physical, gold thermal/inverse covariance, purple `#bd9af7` covariance-weighted and curvature, mint `#8ed8b0` "curvature = 0", orange stiff signal.
- interactions: gold symmetry/vertical, soft blue shapes, teal `#5fd3b0` pose, rose water's model, lime `#b5e655` peroxide's, orange `#ff8a3d` interaction, muted dashed plug-in, khaki restraint. Bundles: gold vertical, soft horizontal, violet `#c58af9` rotor, teal beads.
- Clashes a cross-video programme would inherit: rose is KL in retention but water's model in interactions; three different violets.

**Layout.** Retention: one or two `frame()` plots on the left (x ≈ 100, w 540–930), a formula column at x ≈ 860–880, mono readouts and short wrapped notes underneath; gold statement banners at the bottom. Covariance: titled rounded panels (one, two or three across) plus a **footer** (rule at y 732, Spectral gold headline, a detail line) and a gold progress bar at y 880 — closer to slides. Interactions: 3D molecules or the perspective master diagram on the left, a mono notes column on the right (`RIGHT = 860`), stamps such as "toy force field · 300 K".

**How formulas enter.** Retention, interactions and bundles declare MathJax formulas at module level with `tex(source, fallback)` and fade each in with `seg()` at the second the narration speaks it (e.g. retention 05: DERIVATIVE at 5 s, RETAINED at 15 s, SPLIT at 51 s, FRACTION at 64 s, matching cues 0/24/50). Covariance writes formulas as mono text (`formula(ctx, 'Σ = kBT K⁻¹', …)`), so they are not typeset.

**Live, computed readouts (the user's stated preference).** Retention: τ cursor with dots on both curves (02); the denoiser slope shown twice, as "slope of m" and as "C^post/σ²", proving the identity numerically (03); per-frame posterior and R bars at the current σ (05); σ½ legend interpolated from the curves (06); the closure table (07); ξ sample moments (08); KL drop vs integrated score error (09); τF_τ (10). Covariance: matrix entries as n grows, the local covariance at the moving query, the transport angle, κ readouts driven by the slider. Interactions: net force/torque, N_eff, error percentages against the note's Monte-Carlo values.

**Progressive builds and motion idioms.** Staggered reveals `seg(t, a + 2.2i, …)`; curves drawn with `progress` (retention 06 reveals the four curves over 2–14 s); morphs (`lerpLog` for the whitening slide in 01; `lerp` per sample with staggered easing in 08); crossfaded states (`blend(t)` in 06 mixes the three channel curves pointwise rather than cutting); eased parameter keyframes `track(t, [[t, v], …])` drive σ in 05; covariance's 3D views drift slowly (`yaw: .35 + t*.012`).

**What makes the best scenes good.**
- Retention 05 (`scenes/05-what-survives.js`): an abstract identity (I_t = Cov(E[u \| X_t])) made physical by one wandering point whose posterior cloud grows and swallows the basins; every bar is the identity evaluated now; it ends by recovering Part 1's curve. Abstraction → picture → numbers → link back.
- Retention 06: one plot, three channels crossfaded, half-points marked, legend computed, one claim per channel, each checked by a test.
- Retention 02: sample paths with exact envelopes beside a log–log plot whose meaning changes in phases (C_τ, F_τ, increment) on the same axes, with a sweeping cursor and dashed thermal lines.
- Covariance 23 ("A bent cloud that is flat") and 27 (holonomy): the coordinate grid itself unbends; then a case where it cannot, with an exact angle. Covariance 32: projection and tangent plane side by side make "pullback = inverse covariance" literal.
- Interactions 02: ghost molecules weighted by posterior probability, the target arrow sliding to the score arrow; interactions 06: one master diagram reused for 13 scenes; interactions 12/16: exact toys with error bars instead of claims.

**Weak spots.** Covariance's panels are dense and its narration too fast (§5); text overflows in retention 01 (past the gold box) and 11 (first card title); retention 03's pullback ellipses clip at the frame edge.

---

## 3. Engine and APIs

**A scene** (`engine/timeline.js` `defineScene`) is `{ name, duration, narration, header, draw(ctx, t, live) }`, with `draw` a pure function of local time in stage units; narration is a string or validated `[[0, '…'], [18, '…']]` cues; optional `continues`, `controls`, `sim`, `beats`, `handovers`. Timing helpers: `seg`, `lin`, `fade`, `oscillate`, `lerp`, `lerpLog`. Randomness only from `createRng(seed)`; the smoke test fails on clock reads or unseeded randomness.

The retention idiom (precompute at module level, draw from t only):

```js
const PLOT = frame({ x: 100, y: 240, w: 930, h: 500, u: [-2.5, 1.5], v: [0, 1] }); // plane → stage, once
export default defineScene({
  name: 'Retention curves', duration: 115,
  narration: [[0, 'Now sweep the noise …'], [26, 'Whiten with the local thermal covariance …']],
  header: header(6, 'RETENTION CURVES', 'Which information goes first depends on the channel'),
  draw(ctx, t) {
    const a = seg(t, 0.4, 1.6);
    axes(ctx, PLOT, { xTicks: decades(-2, 1), grid: true, alpha: a });
    drawPath(ctx, PLOT, points, { colour: BOND, alpha: a, progress: lin(t, 2, 14) });
  },
});
```

`track(t, [[0, 0.08], [30, 0.08], [48, 1.2], …])` (retention/shared.js) gives eased keyframes for any scene parameter, the scripted analogue of a slider.

**Live scenes.** PR #3 has one: covariance 35, `controls: { ratio: slider('Original width ratio', { min: 1, max: 10, value: [[0, 5], [32, 5], [41, 8]], lens: true }) }` with `beats`; `draw(ctx, t, live)` reads `live.input.ratio`; a lens never pauses the video. No PR #3 scene uses `simulation()` (seeded fixed-step sims; see `atlas/scenes/01-flow.js` on main).

**Reusable components.**
- Kit (main, unchanged): `drawMolecule`/`moleculeCamera`/`arrow3`/`drawAxisTriad`, `camera`, `drawSurface`, `polyline3`, `polygon3`, `densityHeatmap` (pre-rendered density with level lines), `card` (typewriter callout), `columnVector`/`rowVector`, `energyPlot`, `logDensityPlot`, `brace`, `curvedText`, `springNetwork`, `zeroMomentumRotations`, `model/physics.js` (`kT`, `stiffness`, `sigma`, `conditionNumber`).
- `retention/shared.js`: the cleanest 2-D plotting kit in the repo: `frame()` (plane → stage with `X`, `Y`, `point`, `inside`), `axes()` (ticks, log `decades()`, grid, box, labels), `drawCurve()` (function graph with fill/dash/progress/clip), `drawPath()`, `drawPoint()`, `drawSamples()`, `heatmap()` (same ramp as `draw/heatmap.js`, or single-colour `tint` for posterior clouds), `panel`, `pill`, `readout` (mono label + coloured value), `legend`, `caption`, `aside`, `track`, `stamp`, `PHI_TICKS`.
- `retention/math.js`, `toy.js`: `ou` (moments, Fisher, increment), `ouPaths`, mixtures, `gaussianize`, `closureTable`, `flowIdentity`, `circleFisher`, `retainedFractions` (eigenvalues of I₀^{−1/2} I_t I₀^{−1/2}), `linePosterior`; the toy's `grid`, `OBSERVABLES`, `CHANNELS`, `retention(scale, σ)` (separable two-pass channel), `retentionDirect`, `curves`, `retainedAt`, `posterior`, `tilted`, `whiten`, `whitenJacobian`.
- `covariance/math.js`: `signalFraction`, `flow`, `metricWidths`, `bend`/`warp`/`ribbonSamples`/`ribbonCovariance`, `loopState`/`hyperbolicArea`, `arcCovariance`, `localEstimate`, ellipsoid and categorical embeddings, `sqrt2`. `covariance/draw.js`: `panel(…, title, tint)`, `footer`, `cloud` (clips marks, not data), `ellipse`, `formula`, `progress`.
- `interactions/`: `drawMol`, `moleculeThumb`, `drawHalo`, `scoreArrow`/`drawScoreArrows`, `tagCard`, `ideaTag`, `toyStamp`, `scatterPanel`, `view2d`, `drawSpringMolecule`, `coordinateBar`; `diagram.js` (`drawFloor`, `drawFibres`, `popOut`, `drawMaster`); `linalg.js` (`symEig`, `pinv`, `cholesky`, `leastSquares`); `springs.js` (`laplacian`, noised score matrices, exact posteriors, reverse SDE). Idioms: `guard(ok, 'what')` throws at import if a narrated number stops being true; named cue times `const CUE = { force: 13.5, … }` keep narration and visuals in sync.
- `bundles/beads.js`, `part-0/bundleBox.js` (plane bundle with fibres and tiles).

**Export pipeline.**
- `npm run export -- --video id --fps 60 --width 1920 [--from --to] --mp4 out.mp4` (main): frame-exact PNGs via `window.video.frame()`, ffmpeg encode, no audio.
- `scripts/export-narrated.mjs --video id [--width 1600 --fps 24 --voice Samantha]` (PR): synthesises each cue with macOS `say` at 155 wpm, speeds a cue with `atempo` if it does not fit its slot minus 1.2 s, adds 0.55 s lead, trims every slot to an exact 48 kHz sample count and verifies durations (no drift), writes SRT subtitles in 15-word chunks, FFMETADATA chapters per scene, streams JPEG frames (q 0.94) to ffmpeg, muxes `dist/<id>.mp4` with subtitles and chapters. Retention's 17-minute MP4 was exported (not committed).
- `scripts/review-frames.mjs --video id [--scene N --every 4 | --at t1,t2]` (PR): PNG stills plus a words-per-second report per cue (threshold 2.45 words/s, the voice's budget).
- `scripts/check-covariance.mjs`: covariance-specific frame checks.

**Tests and workflow.** `npm run build` (one self-contained `dist/<id>.html` per video; `npm run build -- retention` for one), `npm test` = `node --test 'tests/*.test.mjs'` + smoke test (renders start/middle/end of every scene, checks live-scene determinism and control extremes); `PLAYWRIGHT_CHANNEL=chrome` on this machine. Models live in DOM-free modules so Node tests import them. `tests/retention.test.mjs` checks every identity the narration states (§4); `tests/covariance.test.mjs` checks pullback = inverse covariance by finite differences, holonomy by independent integration, arc covariance by quadrature, path lengths and normalisation; `tests/interactions.test.mjs` checks gradients, zero net force/torque, the third law, invariance, pose uniformity (χ²) and three-body convergence.

---

## 4. Content coverage

### 4.1 What Retention already explains (claims and numbers on screen)

*Noise erasing modes.*
- Part 1's per-direction share of signal σᵢ²/(σᵢ² + σₜ²); under flat noise the stiff curve sits ×20 earlier in σ (σ_soft/σ_stiff = √κ, κ = 400); whitening slides it onto the soft one: "one curve for every direction" (01).
- The general measure: ∂θ log p_{θ,t}(y) = E[u(X₀) \| X_t = y]; I_t = Cov(E[u \| X_t]); I₀ − I_t = E[Cov(u \| X_t)]; R_t = I₀^{−1/2} I_t I₀^{−1/2} with 0 ≼ R_t ≼ I; Gaussian case R_t = v/(v + σ_t²) = Part 1's curve (05). All tested (separable pass = brute force; split exact to 10⁻¹²; eigenvalues in [0, 1], invariant under recombining observables).
- Retention curves for four observables (bond stretch, bond width, torsion within its basin, basin population) in three channels, with computed half-information points (σ½):

| channel (σ_r : σ_φ) | bond | width | torsion in basin | basin |
|---|---|---|---|---|
| flat (1 : 1, Å and rad) | 0.056 | 0.035 | 0.33 | 1.1 |
| local thermal widths (0.052 Å : 0.35 rad) | 1.1 | 0.67 | 0.96 | 3.1 |
| global covariance (0.054 Å : 1.43 rad) | 1.0 | 0.63 | 0.24 | 0.76 |

  Narrated claims: flat → bond first, within-basin torsion next, basin last; local widths → bond and within-basin torsion together, basin survives about three widths longer; global covariance → basin joins the bond and the within-basin torsion is erased first; "no linear rescaling of the torsion can align both of its curves: two scales of one coordinate"; "good bond whitening need not improve information about basin populations, consistent with Sprint 11 evidence (much faster stiff-coordinate learning, no torsion advantage)"; R_t is "a diagnostic, not a loss" (maximising it chooses no noise); "keeping basin identity longer may be what coarse-to-fine generation wants" (06). This is the seed of "range and order", on a two-coordinate toy.

*Stiffness vs Fisher information.* One OU coordinate, D = 1 Å²/ps, k = 400 (bond) and 1 (torsion) /ps, widths 0.05 Å and 1 Å; C_τ = v(1 − e^{−2kτ}); F_τ = 1/(v(e^{2kτ} − 1)) starts at 1/2Dτ for every coordinate and collapses fastest for the bond; thermal metric 1/v magnifies the bond (400 vs 1) while finite-lag Fisher information suppresses it at every τ; the repository's learned warp fits ½E[(X_τ − X₀)²] = v(1 − e^{−kτ}) at 1 ps (bond 100 %, torsion 63 % of equilibrium width): "a finite-lag thermal construction, not an estimate of mobility; keep the thermal objective, make the lag explicit" (02).

*What "Fisher" means.* Dynamics (F_τ = JᵀC⁻¹J + E[rrᵀ], exact projection), Gaussian denoising (F^post = α²/σ⁴ C^post, D_y m = α/σ² C^post; Tweedie's slope tested), Euclidean pullback (every pullback DφᵀDφ is the Fisher metric of z = φ(x) + unit noise); "a meaning is not yet a benefit for learning" (03). Tilt family p_θ ∝ p e^{θ·u}, I₀ = Cov(u) (04).

*Representation.* Γ_SM = Γ_MLE ⇔ L_W u ∈ span(u). Two-basin line: u = x, W = 1 → 16.6; u = φ, W = 1 → 2.68; u = x, W = 1/φ′² → 5×10⁵; u = φ, W = 1/φ′² → 1.00 (L_W φ = −φ). The matched mobility is huge in the barrier, so "adding a large basin-distinguishing metric to the noise would do the opposite"; equal rates are not required (07).

*Conditional whitening* ξ = C(s)^{−1/2}(r − m(s)), coupling −(m′ + ξc′)/c kept in the Jacobian; "proposed, not established; compare against the existing spring and invariant maps" (08). *Flow identity* KL(p₀‖q₀) − KL(p_T‖q_T) = ∫ E‖∇log p − ∇log q‖²_W dt (README: 0.3446 against 0.3455 with the on-screen trapezoid rule; Simpson gives 0.3446): the loss norm should match the noise covariance; the terminal mismatch matters (09). *Boundaries*: circle counterexample to the Ricci-flow claim (F_τ ~ 2e^{−τ}, τF_τ → 0) (10). *Programme*: retention curves in the assessment; maps jointly with the model on manufactured distributions; conditional stiff whitening from a strong spring/invariant map; fixed physical density and force contract (11).

### 4.2 What Covariance already explains

- Covariance/precision from first principles (1–12): variance, n vs d vs N, empirical vs population, entries, columns, vᵀΣv, eigenvectors, ellipsoids, covariance does not determine a law, PSD characterisation.
- Stiffness = inverse thermal variance, exact for a harmonic Gaussian (K = diag(1, 25), σ = 1 and 0.2, Σ = k_BT K⁻¹, G = Σ⁻¹), not across barriers (13); whitening is a change of units, Cov(z) = I (14); metric gradient flow balances relaxation rates (1, 25 → 1, 1) without softening the potential (15).
- Noise erasing modes (16): λ/(λ + noise variance); tI erases the stiff signal first (29 % vs 2 % at t = 2.5), tΣ synchronises (29 %, 29 %); the noise, the score representation (v = G⁻¹s) and the error norm (‖δv‖²_G) are three separate choices; "merely changing the loss cannot repair information that the forward noise has already erased"; constant example v_t = −x_t/(1 + t) in every mode; varying metrics need drift and volume terms.
- Local vs global (17–22): equal covariance, different clouds; local covariance is scale-dependent; total covariance = within + between (2.1322 I = 0.1322 I + 2 I); a local field estimator; global distance as inf of path lengths (17.93 vs 3.40).
- Curvature (23–28, 34): bent but flat (global whitening map exists); a curved metric (K = −1) with holonomy −43.1° that local whitening cannot remove; geodesic separation sin/r/sinh; "a learned invertible Euclidean warp must distort a genuinely curved target metric somewhere".
- Embeddings and pullbacks (29–33): explicit maps whose JᵀJ equals the inverse covariance (ellipsoidal cap: G = I + wwᵀ, p₂D = √det G/A; categorical Fisher sphere, K = 1/4).
- Metric choices (35–38): G = Σ sharpens the silhouette but squares the condition number (κ(G⁻¹K) = r⁴); covariance-as-metric needs a declared background E (EΣE); Brownian motion of a varying metric has generator ½Δ_G with an Itô drift; densities pick up √det G.
- Fisher information appears only as the categorical example; dynamics/denoising Fisher is retention's.

### 4.3 Relevant pieces of Interactions and Bundles

"A noisy point stands for a cloud of clean configurations" (interactions 02, molecular, with Tweedie); small-noise score = force/kT; the noisy interaction term is not the force at the noisy point (74 %/365 %/2255 % at σ = 0.3/1/3, exact spring toy); noise turns pair terms into many-body terms (3 % → 85 %); honest verdict format (water dimer: no data-efficiency gain). Bundles: Brownian holonomy (E θ² = λ²t²/12), O'Neill curvature of shape space, a rotor turn at L = 0 rotating the molecule.

### 4.4 Explicitly deferred or absent

- Not mentioned anywhere in the PR #3 videos: Diepeveen's wδ metric, geodesic ODE noising and its numerical/sensitivity/performance problems, spring-like metrics from trajectories/QM/transferable models (Part 1 on main only promises "Next: the spring metric, G ≈ K approximately"), invariant embeddings, ALDP5 or BBA results, simulation and iid–simulation consistency, learned embeddings beyond retention 02's "learned warp" remark, readable windows, loud collective modes, ordered internal coordinates.
- Retention marks itself WIP: narration and pacing not reviewed against the Sprint 11 review (issue 769); its rates, basins and widths are illustrative; conditional whitening is "proposed, not established".
- Covariance: all numbers are manufactured and dimensionless, "not measured molecular results".
- Interactions: the alanine dipeptide (+ water) test is running, no results.

---

## 5. Lessons and preferences

- **Computed, not typed.** README and PR: "Everything on screen is computed from math.js and toy.js; tests check every identity the narration states"; interactions' import-time `guard()`s; the user's u1-force notes: "readouts are computed, not typed". Two typed labels in retention already contradict computed values: scene 01's legend says "soft (torsion), σ = 1.02 Å" while the curve uses `sigma.soft` = √(kT/k) = 0.72 Å (1.02 Å is √(2kT/k), the kT-crossing half-width from Part 1 scene 05; Part 1 scene 07 itself says 0.72 Å); scene 07's "mobility ≈ 10⁶ × the basins" while the computed peak W ≈ 3.3×10⁶ and the ratio to the basin centres is ≈ 0.7–1.3×10⁷.
- **State the contract.** Covariance's README section is the model: which numbers are exact vs estimated, what each display assumes, what is not claimed. Retention's boundary scene, interactions' verdict (prior work cited, results with their source PR) and status stamps ("toy force field · 300 K", "schematic", "proposed, not established") carry that honesty on screen.
- **Pacing.** `review-frames.mjs` reports words per second against the 155-wpm voice. Retention: 0 of 45 cues above 2.45 words/s (max 2.24); covariance: 105 of 122 (the narrated MP4 speeds them up); interactions: 21 of 119; bundles: 10 of 16 (single long paragraphs). Write cues of 1.6–2.2 words/s and split long scenes into timed cues.
- **House conventions** (README): one scene per file, literal times next to what they animate, no state between frames, DOM-free models with Node tests, `npm test` green. Covariance breaks them (several scenes per module, two dead chapters, one-line code, mono-text formulas, its own `panel()` with a different signature from retention's): reuse its maths, not its scene code.
- **Separation**: thesis videos in `src/videos`, side videos in `private/other/<id>` (memory). Use `PLAYWRIGHT_CHANNEL=chrome`; look at rendered frames before calling a scene done.
- **Pitfalls found**: `export-narrated.mjs` hard-codes the MP4 metadata title "Covariance — The geometry of fluctuations" for every video; text overflow in retention 01 and 11; `stamp()` defined in retention but unused; colour meanings differ between videos; interactions takes ~3 s at import (needs the lazy-load pattern).
- **Design aspiration** (memory, u1-force): "real 3D geometry, slow purposeful camera, computed objects, progressive builds". Retention and covariance are mostly 2-D plots; molecular 3D lives in interactions (`drawMol`) and Part 0.

---

## 6. Opportunities for the new programme

1. **Readable windows: extend retention 06.** Add channels to `toy.js` (`CHANNELS` is a pair of scales, so an "ordered internal + loud" channel is one more entry) and draw a Gantt-style chart: one bar per observable spanning σ where 0.9 > R_t > 0.1, with the σ½ dot. Bar length = range, left-to-right sequence = order. Computed by `retention(scale, σ)`; reuse `frame`, `axes`, `decades`, `legend`; link to retention 06 as the toy proof.
2. **A many-mode molecule for "noise eats the spectrum".** Retention's engine is 2-D; for dozens of modes use an exact linear-Gaussian toy: a spring network (`interactions/springs.js` `laplacian`, `linalg.js` `symEig`/`pinv`) gives normal modes λᵢ; for any linear feature a, I_t = aᵀΣ(Σ + σ²N)⁻¹Σa in closed form. Animate a σ cursor sweeping while mode bars fall (covariance 16's bars generalised) under flat noise, a thermal/spring metric, and ordered internal coordinates + loud collective modes.
3. **Euclidean arbitrariness.** Revive covariance's dropped chapters "A cloud, three geometries" and "What a covariance measures" (`index.js` `scenes[0..1]`, `metricWidths`) and redo them on molecules: two configuration pairs whose Cartesian RMSD ranks opposite to their thermal-unit distance; add 37's EΣE point (a covariance-as-metric needs a reference).
4. **Why wδ noising needed geodesic ODEs.** Covariance 22 (chord vs geodesic), 37 (½Δ_G drift, √det G volume) and 34 (sinh separation = sensitivity) are the visual arguments; contrast with retention 03's third column (a Euclidean pullback is the Fisher metric of z = φ(x) + unit noise), so noising in feature space is exact Gaussian with known transitions.
5. **Straightening.** Covariance 23 (`bend`, `warp`, `ribbonSamples`, global whitening map) shows wδ's intent; 25–28 show where straightening must fail (holonomy −43.1°), with the line "a learned invertible Euclidean warp must distort a curved target metric somewhere", an honest caption for learned embeddings.
6. **Spring metric as a pullback.** Covariance 32's P/C/G picture plus retention 03's unit-ball field, drawn on a molecule: φ(x) = (√k_ij (d_ij − d⁰_ij)) gives DφᵀDφ ≈ K (Part 1's promised "G ≈ K"); compute with `model/energy.js` `springNetwork` and finite differences; ellipse glyphs per atom pair.
7. **Ordered internal coordinates as conditional whitening.** Retention 08's sample-travel animation (s, r) → (s, ξ) generalises to internal coordinates scaled to thermal width, with the loud block left loud; keep the boxed Jacobian coupling entry.
8. **What a noisy BBA still knows.** Interactions 02's ghost cloud (posterior weights as alpha) at three σ: first the ghosts differ in bonds but share the fold, later the fold dissolves; add retention 05-style bars for bond, angle, torsion, contact and radius-of-gyration observables.
9. **Loss sees what noise keeps.** Retention 09 (flow identity) + covariance 16 ("a loss cannot repair erased information") as one scene: per-feature loss weight across σ against its readable window; flat noise misweights, matched noise aligns.
10. **Evolution verdicts.** Retention 10's claim cards with status pills and interactions 18's columns (KNOWN / THIS WORK / MEASURED / UNDER WAY, with sources) as the template for the project's history: wδ (tried; numerical, sensitivity and performance problems), stiffness rationale (derived), embeddings on ALDP5 (good), BBA (bonds better, global worse), learned embeddings (not successful), range and order (current). Interactions 16's error-bar charts suit the BBA metrics.
11. **Housekeeping before reuse**: lift `retention/shared.js` into a shared plot kit; fix the two typed labels; parametrise the narrated exporter's title; keep cues at ≤ 2.2 words/s.

---

## 7. Sources read

- `gh pr view 3` (body, files, commits); PR #3 commit messages (no PR comments).
- `EXPORT/README.md` (video sections and the Covariance and Retention mathematical contracts); `src/app.js`, `src/main.js`, `src/videos/common/configuration.js` diffed against main; `diff -r` of `src/engine`, `src/draw`, `src/model`, `src/kit.js`.
- Retention: every file. Covariance: every file. Interactions: `index.js`, helper module headers and exports, `springs.js` posterior code, scenes 02 and 18, full narration of all 20 scenes. Bundles: `index.js`, helper exports, scene 12, full narration.
- PR scripts and tests fetched to `…/scratchpad/pr3-missing/`; main's engine (`timing`, `timeline`, `controls`, `simulation`, `recorder`, `random`), `kit.js`, `draw/theme.js`, `draw/tex.js`, scripts; Part 1 scene list and labels.
- Memory notes in `/Users/I745505/.claude/projects/-Users-I745505-private-thesis-animation/memory/`.
- Rendered frames of all four videos in `…/scratchpad/build-pr3/frames/`, pacing reports from `review-frames.mjs`, on-screen numbers recomputed with `…/scratchpad/tools/numbers.mjs`, PR tests run (39/39 pass).
