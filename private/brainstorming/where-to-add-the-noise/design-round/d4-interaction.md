# d4 · Interaction designer: "Hand over the knob"

Designer d4, written 2026-11-19. My angle is what the viewer can *do*. I read the brief, `00-critic.md`, the visual-idea index, r6 in full, g4 in full and a1–a3 in full, and the relevant parts of r1–r5, r7, r8 and g1–g3. I checked note 22 §5.1–5.2 in `rg-main` and inspected these local assets read-only: `collective_modes.json`, `bba_charts.json`, `chain_spec.json`, `exact-uniform.json` and `signal-*.json` in `LOCAL/runs/range-order-mechanisms-20261118b/`, plus `docs/investigations/force-field-simulation/evidence.json`. Here `LOCAL` is `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative`. Values marked "(checked here)" were recomputed by `SP/d4work/checks.py` and `checks2.py`, where SP is the scratchpad.

Tags: [M] measured, [D] derived (closed form or algebra), [H] hypothesis, [I] illustrative, [S] cited from a paper. Every number keeps g4's definition, unit, data set and budget.

---

## 1. Organizing idea

Each turn in the project changed one knob and read the result on one instrument. wδ changed the ruler and ran into the planar wall; the thermal metric changed what the noise does; embeddings moved where the noise lives; the lag dial turned out to be a Gaussianization lever; the whitening exponent and the loud block brought back the order; the read-out level settles how blurred a force is. The programme hands each knob to the viewer, one per live scene, and every effect is read on one shared instrument: the **erasure clock**, a log-t axis with the trained band shaded, on which each feature (bond, angle, torsion, contact, long-range shape, size) sits as a glyph at the noise level where it is half erased, with a gold hand that always belongs to the viewer (a lens; it never pauses the video). This fits the project because its claims are mechanisms: a mechanism is easiest to trust when you move the cause yourself and the closed-form response lands on the measured point, or visibly misses it. "Coordinates are arbitrary" becomes tangible only when you can switch charts and see what changes (when each feature is erased) and what cannot (the total information; charts only move it). The project's failures become the extremes of the levers: sink the spring divisor to BBA's 27.1 and the bonds drown below the noise floor; set the exponent to γ = 1 and the protein swells. A viewer who reaches those extremes has replayed the diagnosis, not just heard it. The u1-force review rules hold throughout: five levers per video, one gesture each, one hand-over per lever after a labelled demonstration, a comparison target for every readout, one climax image per video. One handle is reused across videos on purpose: the exponent dial is October's fix in Part 2 (erase everything together) and November's diagnosis in Part 4 (exactly what erases the order). The handle stays the same; only the verdict flips.

---

## 2. Programme map

### 2.1 Pieces

| id | folder | kind | length | covers | five levers (gesture) | climax image |
|---|---|---|---|---|---|---|
| **P2 · Rulers** | `src/videos/part-2-rulers` | playable video, 11 scenes, 5 live | ≈12.5 min | pitch (June–July), Era 1 wδ (Sprints 0–10), Era 2 stiffness (notes 20–21) | ruler (toggle) · flatten e (slide) · substeps S (slide) · exponent γ (slide) · bond direction θ (turn) | "Nine rulers in the fog" |
| **P3 · Charts** | `src/videos/part-3-charts` | playable video, 11 scenes, 5 live | ≈14 min | Era 3 embeddings and pullbacks on ALDP5, Era 4 learned maps and the move to BBA | noise site (toggle) · cone tilt θ (slide) · lag τ (slide) · Gaussianize m (slide) · divisor d (slide) | "Under water" |
| **P4 · Order** | `src/videos/part-4-order` | playable video, 12 scenes, 5 live | ≈16 min | Era 5 range and order (notes 27, 30); registered budget; full schedule | chart (choose) · hinge jiggle Δτ (slide) · exponent γ (slide, P2's dial) · loudness L² (slide) · block size K (choose) | "Generation decides size first" |
| **P5 · Forces** | `src/videos/part-5-forces` | playable video, 9 scenes, 5 live | ≈12 min | ScoreMD's iid–simulation dilemma, ALDP5 force fields (#768), BBA force-field frontier (11-15 → 11-19) | read-out level t* (slide) · units (toggle) · force scale c (slide) · volume term (toggle) · size term (slide) | "The phantom spring" |
| **E1 · Erasure lab** | `explorables/erasure-lab` | explorable (MVP) | — | the instrument on a real BBA molecule | chart, molecule, estimator, clock hand, rebuild | — |
| **E2 · Lag dial** | `explorables/lag-dial` | explorable | — | ALDP5 time scales, αL barcode | τ, mode set, trajectory | — |
| **E3 · Force reader** | `explorables/force-reader` | explorable | — | read-out physics | t*, units, step h, scale c | — |
| **E4 · Lever-arm chain** | `explorables/lever-arm` | explorable | — | anti-order | hinge k, Δτ, clock hand, separation m | — |
| **E0 · Lever atlas** | `explorables/lever-atlas` | index page | — | dated evolution map; every node shows its verdict and links to its lever | — | — |

Total video length is about 55 min in four parts, about the length of Covariance plus Retention.

**Viewing order.** Part 0 → Part 1 → P2 → P3 → P4 → P5.
- The Atlas video is an aside after P3-S03: one chart is not enough, the topological version of the orange peel.
- Covariance chapters 14, 23 and 32 (whitening, a bent cloud that is flat, pullback equals inverse covariance) are optional foundations before P3.
- Retention 05–06 (PR #3) is the toy prequel to P4.
- Interactions 02 and 12 (a noisy point is a cloud; the noisy term is not the force) are an aside before P5.
- E0 is the home page. E1–E4 are linked from the matching hand-overs ("go deeper").
- Part 0's "Shape space 2" card stays outside this programme. P2 is not that video.

### 2.2 How the pieces hand on to each other

- P2 opens with Part 1's two-mode Problem 1 curves, replayed through its scene functions, and asks what happens with nine measured modes and the real schedule. P2-S08 reconciles Part 1's Problem 3 with "the loss doesn't see bonds".
- P2 ends by turning a bond: a stiffness ruler has to rotate with the bond, so it is curved, so we embed. P3-S01 starts from that cone.
- P3 ends under water and with the verdict board ("equalizing every motion erases the fold together with the detail"). P4-S01 picks up there with readability.
- P4 ends with what two vectors cannot supply: the wall is a range failure. P5-S06 is where the wall becomes a force-field problem.
- P5 ends at E0.
- **Comparison plots built early and swapped later.**
  - The erasure clock is built in P2-S07 and returns in P4-S02 with BBA lanes, in P4-S04 as the fan, and in P4-S09 run backwards.
  - The ALDP5 nine-mode panel of P2-S07 returns in P5-S02 as the blur dial: same modes, same colours, now forces.

### 2.3 How the engine carries the levers

These are the engine's existing APIs (a1 §3; `src/engine/{controls,simulation,live,timeline}.js`) and what each lever needs:

| lever type | control | `sim` | state, snapshot size | used in |
|---|---|---|---|---|
| analytic: the frame is a pure function of the inputs | `slider` / `choice`, authored keyframes | `leverSim([...])`, the stateless simulation from u1-force `shared.js`, promoted to `src/engine/helpers.js` | none | P2-S01/04/05/07/09, P3-S01/03/06/09, P4-S02/03/04/06/08, P5-S04/06 |
| stochastic | `slider` / `choice` | `simulation({ seed, dt, tick, snapshotEvery: 0.5, uses, init, step, onTick, events })` | Langevin with 1,000 walkers × 9 modes, 72 kB per snapshot (≈10 MB per 70 s scene); SGD toy < 1 kB; radial toy 16 kB | P3-S07, P5-S02/03/05 |
| lens | `slider(…, { lens: true, value: keyframes })`, `choice(…, { lens: true })` | none | — | clock hand (every clock scene), history (P2-S06), training updates (P3-S04), warp morph (P3-S05), budget (P4-S10), simulated time (P5-S07) |

Rules applied everywhere:
- A control is a lever exactly when the simulation `uses` it (`checkControls` enforces this); `exploreFrom` is set once the content has faded in, and `clock(t, live, at)` shows everything the lever affects while exploring. Keyframes ease like `seg()`, so a jump needs a holding key.
- Narration cues name levels ("at t = 0.01"), never "now", so they stay true whatever the viewer does with a lens. While a viewer holds the clock hand, the authored hand keeps moving as a dotted ghost (`valueAt(control, t)` is exported by `controls.js`); in explore mode a faint tick marks where the narrator left each lever.

Small engine additions are listed in §7.

---

## 3. Piece-by-piece storyboards

The format follows the brief: **title · duration · kind**; Screen; Computed; Numbers (with tags and sources); Beat; Live; Next. Durations are authored times. Each piece is wrapped with `paced(scene, k)` when narration is fitted to the 155 wpm voice (cues at ≤ 2.2 words/s).

### P2 · Rulers: what is the metric for? (≈12.5 min)

Lever arc: switch rulers (Euclid is arbitrary) → flatten the cloud (wδ's wall is where ALDP5 lives) → add substeps (intrinsic noising was an ODE; finite is not correct) → raise γ (what we actually want the metric to do to the noise) → turn the bond (that metric must rotate, so it is curved; embed).

**P2-S00 · Cold open** · 18 s · static.
- Screen: a real ALDP5 frame (bgmol, beads C N Cα C N) vibrating at its measured widths. A Euclidean ruler in Å and a thermal ruler in widths slide in under it. Title "Rulers", with "what is the metric for?" in gold italic. A strip of five dim lever icons lights up later, one per hand-over.
- Next: dip to S01.

**P2-S01 · Two rulers, two rankings** · 60 s · live, lever 1.
- Screen:
  - Left: the molecule with two ghosted moves from the same frame. A moves bead 1 outward along bond 1–2 by 0.10 Å. B rotates bead 5 about bond 3–4 (ψ) until bead 5 has moved 0.20 Å.
  - Right: one number line, "distance from the start", with A and B dots under the active ruler.
  - Below: a harmonic energy bar ½Σ(Δq_k/w_k)² k_BT over the nine internal coordinates.
- Computed: the RMS displacement in ℝ¹⁵, and the thermal distance √Σ(Δq_k/w_k)² using measured widths.
- Numbers:
  - Bond 1–2 width 0.025 Å [M, bgmol, note 20 §1.4].
  - In-basin ψ width 50–52° [M, mdshare, note 25 §3].
  - Euclid reads A 0.10 Å and B 0.20 Å. The thermal ruler reads A 4.0 widths and B ≈ 0.2 widths; B depends on the frame's ψ lever arm, is computed by the scene and pinned by the test on the asset frame [D].
  - Energy: A ≈ 8 k_BT, B ≈ 0.02 k_BT [D].
- Beat: Cartesian distance ranks configurations against physics.
- Live:
  - Lever `ruler = choice('Ruler', { euclid, thermal }, { value: [[0,'euclid'],[26,'thermal']] })`, `sim: leverSim(['ruler'])`.
  - Readout: the ratio d_A/d_B. Comparison target: the energy bar, which does not depend on the ruler.
  - Hand-over at 44 s: "Your turn: under the thermal ruler, how far must the torsion move to match the 0.1 Å stretch?" The viewer finds about 20 times more Å.
- Next: the two dots fly into a 2×2 grid.

**P2-S02 · The empty cell** · 45 s · static.
- Screen: a grid with "geometry: flat / curved" against "generator: yes / no".
  - ScoreMD sits at flat with a generator; its small-t score doubles as a force field.
  - Diepeveen's wδ sits at curved with no generator. Its formula is F(X) = ((log r_ij), √δ log det G_X).
  - The empty cell is "Riemannian diffusion on (M, g_wδ)", the thesis pitch (exposé, 2026-07-02).
  - A promise-ledger strip lists the milestones: M3–M4 conservative modelling, manifold FP and forces; M5 Riemannian flow matching. Pills read "re-ordered 10-06; never ran as specified".
- Numbers: ScoreMD BBA iid/sim PMF. Diffusion 0.034/5.387, Two For One 0.034/1.624, Both 0.234/0.254 [S, ScoreMD Table 15, via g1 §4.1].
- Beat: the thesis set out to fill the empty cell and to remove ScoreMD's trade-off. P5 comes back to the trade-off.
- Next: zoom into the wδ cell.

**P2-S03 · Straight in log-distance** · 60 s · static, with two lenses.
- Screen, three panels:
  - (a) Two beads forming a contact from 10 to 4 Å. The linear midpoint is 7.0 Å; the log-linear midpoint is 6.325 Å [D].
  - (b) A triangle whose three log-linear targets conflict. The realizable shape nearest to the straight log-distance line resolves them. This is what a "wδ-geodesic" is: a separation interpolation, not a geodesic [D, g2 §2].
  - (c) Bars from the re-examination.
- Numbers:
  - ALDP5 interpolation RMSD: Cartesian 0.224 Å vs wδ 0.247 Å; local-distance RMSE 0.0517 vs 0.0324 Å [M, #513].
  - AK closed→open: Cartesian chord 1.78 Å vs wδ 2.03–2.05 Å; adjacent-Cα RMSE 0.144 vs 0.077 Å [M, #513/#522].
  - Rank-1 variance: Cartesian PCA 0.8934 vs wδ tangent 0.8927 [D, unofficial check in g2 §4.3, labelled].
- Beat: the straightening came from the directed (DIMS) data, not from the metric. wδ's robust gift is local: it keeps near neighbours apart.
- Live: lenses `path` (chord / log-linear / both) and `s` along the path. The narration describes both paths, so lenses are enough.
- Next: "and it puts walls where the data live."

**P2-S04 · Walls at infinity** · 70 s · live, lever 2.
- Screen:
  - Left: the flattening five-point family X_e (r1 E1) in 3D with its plane, and the unit ball of the horizontal metric as an ellipsoid.
  - Right: two odometers counting the distance from X_0.5.
  - Below: a strip with the ALDP5 planarity histogram λ_min(G)/tr G for n = 5 against n = 6 (bgmol).
- Computed live: F(X); the wδ chord; H = JᵀJ + δ-term (r1 M5); its horizontal spectrum.
- Numbers:
  - The Euclidean odometer creeps to 1.0. The wδ odometer reads 3.2489 / 7.8377 / 12.4378 / 17.0407 at e = 0.1 / 0.01 / 0.001 / 10⁻⁴ [D, r1 E1].
  - cond_h is 42.14 / 6.437×10³ / 6.004×10⁷ at e = 0.5 / 0.1 / 0.01, i.e. ∝ e⁻⁴ [D].
  - Worst condition n = 5 vs n = 6: 1.55×10⁶ vs 4.2×10³ [M, Sprint 7].
  - Phantom bead: dilation constant √46 becomes √51 [D, r1 E6]. Physical planarity becomes reachable at finite augmented distance [D].
- Beat: a flat cloud is infinitely far away, and ALDP5's backbone sits next to that wall.
- Live:
  - Lever `e`, a log slider from 0.5 to 10⁻⁴, authored to sweep down by 40 s; `leverSim(['e'])`.
  - Lens `units` (Å / nm). The Euclidean value scales by ×0.1 while the wδ value does not move: wδ measures relative deformation.
  - Comparison target: the bound |Δ log det G| ≤ d_g/√δ drawn as a line under the wδ odometer.
  - Hand-over: "Your turn: flatten further; which odometer runs away?"
- Next: "every noising step has to travel this metric."

**P2-S05 · Noising by solving an ODE** · 75 s · live, lever 3.
- Screen:
  - Left: a code panel (llm-soc `codeBlock` idiom, promoted to `src/draw`). The flat forward step is one line, `x_t = a·x_0 + σ·ε`. The wδ step needs a frame eigendecomposition, S = clip(⌈8r²⌉, 8, 1024) Verlet substeps, a horizontal solve per substep, T walk steps and 500 reverse steps.
  - Right: a thin triangle in 2D, n = 3 points with height e, so the collinear limit is the 2D rank barrier. It takes one geodesic noising kick.
- Computed live: the pullback geodesic q̈ = −J⁺(dJ[q̇]q̇) integrated with S fixed velocity-Verlet steps, against a 4,096-step reference. Readouts: the endpoint feature error, the chord bound ‖F(end) − F(start)‖ ≤ ‖V‖_g (turns red when violated), and log det G.
- Numbers:
  - The toy's values are computed and labelled "toy" [D].
  - Comparison targets on ALDP5: at δ = 1, 8 substeps leave 38.3% of frames violating the chord bound by more than 1%; 128 substeps leave 2.34% [M, r1 E14, 256 frames].
  - Cost per sample: flat 0.74 s, exp-split ≈253 s (≈340×), float64 ≈445 s (≈600×) [M, Sprint 7, small cold benchmark].
- Beat: intrinsic noising had no closed form, step selection is not error control, and finite is not correct.
- Live: lever `S`, a log slider from 2 to 1024, `leverSim(['S'])`. Hand-over: "Your turn: start the kick closer to the wall; how many substeps keep the chord bound?"
- Next: "and the wins of that period…"

**P2-S06 · The moving baseline** · 60 s · static, with a history lens.
- Screen: a scoreboard of φ/ψ JS bars from August to October. Bug fixes appear as vertical events with one-line lesson pills: transpose ("invariants beat parity": rigid residual 1.3×10⁻¹⁴ vs 5.97 [D]); TF32 (≈11% of GRW paths ran to ~10⁵ [M]); the clock mismatch (one-kick multiplier A(1) = −0.111 against VP a(1) = 0.00657 [D, r1 E3]); vp_mean (2026-10-02), where the flat bar drops.
- Numbers [M]: S1 (ALDP n = 6) wδ·GRW+OU 0.117 ± 0.007 vs identity 0.479 ± 0.005; S5 wδ 0.103 ± 0.009 vs flat 0.263/0.268; S7 finite 0.9996 yet JS 0.325; S9 bond W1 46–109× its floor (a W1-to-floor ratio, not a width ratio); flat after the vp_mean fix 0.1012; ScoreMD-native 0.0151 against a floor of 0.0114. Pill: "Sprint 10 closed 2026-10-22: flat Cartesian stays the default." Stamp: "indicative: n, N and conventions differ".
- Beat: finite is not correct, and a win against a broken baseline is not a win.
- Live: lens `date`, keyframed from Aug 5 to Oct 22.
- Next: "so: what should a metric do?"

**P2-S07 · Nine rulers in the fog** · 90 s · live, lever 4 · **CLIMAX of P2**.
- Screen: left, the ALDP5 molecule with the active mode's measured eigenvector as atom arrows and a noisy sample (common random numbers). Right, the first erasure clock: nine lanes labelled by mode width (0.025 … 0.66 Å), each a window bar from t_min to t½ in the stiff→soft gradient with a glyph at t½; the trained band [0.01, 1] shaded, a hatched fog below it labelled "never trained", the gold hand sweeping t.
- Computed: λ_eff,k = λ_k^{1−γ} with λ_k = (w_k/0.9418 Å)² in the pilots' production units, so γ = 0 is flat noise and γ = 1 is metric-shaped noise (every λ_eff = 1); t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9.
- Numbers:
  - Mode widths 0.0252, 0.0294, 0.0419, 0.0543, 0.0654, 0.1234, 0.1851, 0.3452, 0.6631 Å [M, mdshare trajectory 1, `force-field-simulation/evidence.json` `mode_std_A`].
  - Flat t½: 0.0048, 0.0061, 0.0099, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196 [D, g1 §3.1, checked here]. The three stiffest modes fall into the fog.
  - Share of trained draws readable: 0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9, 18.8% [D, checked here].
  - At γ = 1 every mode sits at t½ = 0.259 and is readable in 25% of draws [D].
  - The stiffest mode enters the band at γ ≈ 0.14; the lane spread is ×40.6 at γ = 0, ×4.8 at 0.5 and ×2.0 at 0.75 [D, checked here].
  - Side card "Did wδ remove stiffness?": residual stiffness κ_res (β/C7eq window) flat 192, wδ (δ = 1) 413, spring 9.6 [M, note 20 §5.3, bgmol].
- Beat: under flat noise the bonds are erased before training begins. October's answer (notes 20–21) was to put the stiffness into the noise and erase everything together.
- Live:
  - Lever `gamma = slider('Metric exponent γ', { min: 0, max: 1, value: [[0,0],[48,0],[60,1],[72,1]] })`, `leverSim(['gamma'])`.
  - Lens `hand`, the clock hand (log₁₀ t from −5 to 0, keyframed sweeps).
  - Hand-over at 74 s: "Your turn: find the γ at which the stiffest mode first enters the trained band." The answer appears in the readout.
- Climax image: three orange glyphs sunk in the hatched fog, then all nine lanes snapping into one column at 0.259.
- Next: "but which loss reads this?"

**P2-S08 · One wrong ruler, seen from both sides** · 60 s · static.
- Screen, two panels:
  - Left, the covector side: Part 1's 5% example. Per noise level the flat loss charges a stiff error ×κ (κ = 400, Part 1's toy) [I].
  - Right: integrated with likelihood weighting the over-charge is only ≈1.5× on ALDP5 (17.5 vs 11.4) [D, note 21 §8].
  - The resolution side: bond SNR at t = 0.01 is 0.30–0.46 under every unit convention [D, g4 §3.6].
  - Pairing strip: training curvature 1.9×10⁴ (Riemannian, raw) vs 8.1 (whitened, thermal); gradient descent 24,319 vs 31 steps; Adam 3,941 vs 226 [M/D, note 21 §4.3, ALDP5 window].
  - A κ disclaimer pill: "κ here = training curvature (κ_train)".
- Beat: the loss does not see bonds because no trained level resolves them (LESSONS D18), not because it over-weights them. Sizes and gains are a separate problem that units fix.
- Next: "and a metric that puts stiffness in the noise must…"

**P2-S09 · The ruler must turn with the bond** · 70 s · live, lever 5.
- Screen:
  - One bond (1.5 Å) in 3D. Two noise ellipsoids sit on it: a constant equivariant metric (c·I₃, a sphere) and the spring metric (thin along the bond, wide across).
  - Then the bond-orientation sphere appears, with radius r₀/σ⊥ in thermal widths.
- Computed: σ_r = √(2/(k⊥+2w)), σ⊥ = √(2/k⊥), c = σ_r/σ⊥, K_tan = 4w/(k⊥(k⊥+2w)r²).
- Numbers:
  - w = 1,400 Å⁻² and k⊥ = 30 Å⁻² give σ_r = 0.0266 Å, σ⊥ = 0.258 Å, c = 0.103, sphere radius 5.81 widths and K_tan = 0.0293 Å⁻² [D, note 22 Prop. 4, checked here].
  - Rotating-bond residual stiffness 13.9 / 8.3 / 13.0 at k⊥ = 10 / 30 / 100 [M, note 21 §7.2].
  - Stamp: "k⊥ is γ in notes 20–22".
- Beat: a constant metric cannot be stiff along a bond and soft across it at every orientation (note 20 Lemma 2). A metric that turns is curved, so metric-shaped noise is only approximate. Embed instead.
- Live: lever `theta`, bond direction 0–180°, `leverSim(['theta'])`. Readouts: the aspect of each ellipsoid measured along the bond. Comparison target: c = 0.103. Hand-over: "Your turn: turn the bond; can one fixed ellipsoid stay thin along it?"
- Next: S10.

**P2-S10 · Next** · 15 s. Five lever icons, each redrawn by its own scene's functions (the u1-force S11 idiom), and the line "Next: put the noise where the ruler is flat."

### P3 · Charts: embed, don't integrate (≈14 min)

Lever arc: move the noise into feature space (exact and shaped like the molecule) → tilt four bonds (equal-dimension flat charts must distort; bigger maps do not) → turn the lag (which modes count as stiff) → Gaussianize (the real lever behind fast torsions) → sink the divisor (why BBA broke).

**P3-S00 · Cold open** · 15 s. P2's cone rotating in a 3D feature space, the title "Charts", and the line "embed, don't integrate".

**P3-S01 · Lift, noise, project** · 75 s · live, lever 1.
- Screen: the planar bond analogue b ∈ ℝ² ↦ F(b) = (√w|b|, √(k⊥/2) b) ∈ ℝ³, an ice-cream cone with half-angle arcsin c = 5.9° (r3 E2).
  - A data cloud sits on it: lengths 1.5 ± 0.027 Å, orientations spread.
  - The same Gaussian draws (common random numbers) are added either in configuration space or in feature space and then projected back to the nearest image point.
  - A one-line kernel `y_t = α z + σ ε` sits beside P2-S05's code panel.
- Computed: the projection, and the radial and tangential spread of the projected noise.
- Numbers: aspect 1.00 (configuration space) vs 0.103 (feature space), equal to σ_r/σ⊥ [D, checked by Monte Carlo in the test within 3%].
- Beat: noise shaped like the molecule, with an exact Gaussian kernel and no geodesic ODE.
- Live:
  - Lever `site = choice('Noise added in', { config, feature }, { value: [[0,'config'],[30,'feature']] })`.
  - Readouts: the bond-length sd and the angular sd of the noisy samples. Comparison target: the thermal aspect 0.103.
  - Hand-over: "Your turn: switch where the noise lives and watch the bond-length readout."
  - Links: Covariance ch. 32; Retention 03 ("every pullback DφᵀDφ is the Fisher metric of φ(x) + noise").
  - Caption: "a 2-D cone is intrinsically flat; curvature needs the 3-D bond (P2-S09)".
- Next: "which spring?"

**P3-S02 · The springs are a pullback** · 45 s · static.
- Screen: G = JᵀWJ assembled with Part 1's Problem 3 flight idiom: J is the 10×15 pair-distance Jacobian, W = diag(k_ij). Then the spectrum on the lifted `drawEigenvalueScale`.
- Numbers: the repo's toy network (`energy.js`) has 6 zero modes and nine internal modes 0.0264 … 53.99 eV/Å², κ_H ≈ 2,050 [D, g4 §3.2]. Stamp: "Part 1's κ = 400 was a two-mode illustration". The zero modes are Part 0's vertical directions.
- Beat: Part 1's promised G ≈ K holds exactly at rest for a harmonic spring network.

**P3-S03 · You cannot flatten an orange peel** · 70 s · live, lever 2.
- Screen: P2's bond-direction sphere (the cone in thermal units) with four bond directions tilted by θ from a centre direction, in a square. A flat chart tries to keep all six distances.
- Computed: the exact intrinsic cone distances d = 2ρ₀ sin(cα/2), with ρ₀ = √(k⊥/2 + w)·r₀. The quadrilateral identity gives the exact four-point bound ε ≥ (D − S)/(D + S), where D and S are the summed squared diagonals and sides (note 22 Theorem 4).
- Numbers:
  - At θ = 0.1 / 0.3 / 0.5 / 0.8 / 1.2 / 1.6 rad, exact ε is 0.0008 / 0.0076 / 0.022 / 0.061 / 0.16 / 0.35, against Kρ²/12 of 0.0008 / 0.0074 / 0.021 / 0.053 / 0.12 / 0.21 [D, note 22 §5.2, reproduced here].
  - Comparison targets: on ALDP5 the forced error is 0.2–1.5% within a basin (K = 0.02, ρ = 1–3) and 1–8% achievable per basin [D, note 22 §5.4]. Over the populated torsion landscape it is 3–20% [D, heuristic, note 23].
  - Then the escape: a higher-dimensional flat map (the cone itself) has zero metric error. Springs and wδ are such pullbacks [D, note 23].
- Beat: an equal-dimension flat chart must distort a curved metric. On ALDP5 it does so only mildly, and a bigger map escapes it.
- Live: lever `theta` (tilt, 0–1.6 rad; the same bond-turning handle as P2-S09). Hand-over: "Your turn: tilt further; when does the forced error pass 5%?" Link to the Atlas video.
- Next: "so do the maps help?"

**P3-S04 · Ten to a hundred times sooner** · 70 s · static, with a training lens.
- Screen: learning curves of ALDP5 bond W1/width against updates (log) for five arms, plus generated bond-1–2 histograms for the current checkpoint.
- Numbers, at 1k / 5k / 20k / 200k updates [M, #765, 3 seeds, 20,000 molecules, mdshare]:
  - flat low floor 0.186 / 0.068 / 0.046 / 0.015;
  - flat production floor 0.981 / 0.173 / 0.291 / 0.422 (it gets worse);
  - learned 0.020 / 0.016 / 0.016 / 0.015;
  - spring 0.018 / 0.013 / 0.012 / 0.013.
- More numbers:
  - φ/ψ JS shows no torsion gain: flat 0.0207, spring 0.0201, floor 0.0185 [M].
  - Tweedie narrowing at the production floor: w/√(w² + s²) predicts 0.39–0.46, observed 0.44–0.53 [D/M].
  - αL card: 37 visits per 250 ns but 96–139 effectively independent samples. One trajectory pins αL only to about ±50% (95% interval 0.4–7.0% around 3.2%) [M/D, g4 §4.3]. No metric can fix a basin weight the data barely sample.
  - Pill: "much of the gain is simple global scaling" [M, r3].
- Beat: stiffness-aware maps learn bonds and angles 10–100× sooner. Torsions and αL do not improve.
- Live: lens `updates` (keyframed 250 → 200,000).

**P3-S05 · A lens that makes every step round** · 50 s · static, with a morph lens.
- Screen: ALDP5 1 ps steps projected to 2D as ellipses, needle-thin along the bonds, morphing to near-circles. Then a κ ladder on a vertical log axis: markers by definition, colour by data set, no arrows across definitions.
- Numbers:
  - κ_step from 184 to 2.99, against an isotropic floor of 1.55; constant whitening 24.6; scaled internal 3.88–3.95 [M, mdshare, #753].
  - Ladder: 1.55, 2.99, 7.6–13.4 (κ_res spring, bgmol), 97–192 (κ_res flat), 184 (κ_step flat), 400 (Part 1 toy), ≈920 (κ_Σ whole data), ≈1,400 (BBA mode-variance ratio) [g4 §4.1].
  - Stamp: "κ_step ≠ κ_res".
- Beat: a coupling flow fitted only to 1 ps steps rediscovers the bonds without chemistry.

**P3-S06 · Turn the lag** · 80 s · live, lever 3.
- Screen:
  - Left: the four-mode basin of note 25 with λ = 1600, 400, 25, 4 Å⁻² and D₀ = 0.08 Å²/ps. Bars show the eigenvalues of G_τ = λ_k/(1 − e^{−τ/t_k}) on a log axis, with a waterline at 1/(D₀τ).
  - Right: the measured ALDP5 saturation table as bars against τ, drawn both as variance and as width fractions.
- Computed: t_k = 1/(D₀λ_k); the half erasure under lag-shaped noise σ²/α² = 1/(1 − e^{−2τ/t_k}).
- Numbers:
  - t_k = 0.0078, 0.031, 0.5, 3.1 ps.
  - At τ = 1 ps, G_τ = 1600, 400, 28.9, 14.6 and the half-erasure levels are 1.00, 1.00, 1.02, 2.12, a spread of 2.1 against 400 under flat noise [D, note 25 Prop. 2, checked here].
  - ALDP5 at 1 ps: bonds 0.91–1.03, φ 0.24 (0.43 within the basin), ψ 0.052 [M, mdshare, note 25 §3]. So the 1 ps metric weighs ψ about 19× stiffer than its equilibrium spread; the width fraction is √0.052 = 0.23 [D].
  - Stamp: "k⊥ = 1/(D₀τ): the spring soft scale is the lag in disguise".
- Beat: the lag decides which modes count as stiff, and in what order noise erases them.
- Live: lever `tau`, a log slider from 0.01 ps to 10 ns, `leverSim(['tau'])`. Comparison target: the global-whitening limit (every mode at 1). Hand-over: "Your turn: turn τ until ψ counts as soft." Go deeper: E2.

**P3-S07 · Rescaling is not the trick: Gaussianize** · 80 s · live, lever 4.
- Screen:
  - Left: the measured race after 100 updates as four small Ramachandran thumbnails (from the commit-2eb1e5cb figures) with JS bars.
  - Right: a live 1-D toy. A bimodal ψ-like density is morphed by m from the raw coordinate (m = 0) to Φ⁻¹(F(x)) (m = 1). The noised score is drawn as it straightens. A 9-parameter RBF+linear score model trains by seeded SGD (denoising score matching at t = 0.1), with an update counter.
- Computed: the toy density, the CDF map, the exact noised score, and the SGD state, a real `simulation` with `uses: ['m']`, dt = 0.05 s per update.
- Numbers:
  - JS@100: flat 0.117; warp at 1 / 10 / 100 ps 0.127 / 0.049 / 0.027; spring k⊥ = 30 / 8 / 2 0.133 / 0.149 / 0.163; torsions Gaussianized 0.042; linear torsion control 0.255 [M, 2026-11-05, 2 seeds, 20,000 molecules, CPU].
  - KL to a Gaussian over the nine axes: 0.96 (1 ps), 0.20 (10 ps), 0.14 (100 ps) [M].
  - Honest caveats: at 20,000 updates flat is best (0.0203) and the Gaussianized arms worst (0.029) [M]. Molecules in the rare αL saddle per 10,000: MD 4–6; flat 184 → 11; 100 ps warp 77 → 30 [M].
  - The toy's update counts are [I].
- Beat:
  - 2026-11-05, corrected the same day: the speed-up came from Gaussianizing the slow modes, not from synchronized erasure. Lowering k⊥ made early torsions worse.
  - The straightening intuition came true through Gaussianization, which is Diepeveen 2025's construction, including its unimodal limit at the rare barrier [S/M, g2 §4.4–4.5].
- Live: lever `m`, 0–100%. Readout: updates until the score is within 5%, against the measured JS@100 bars. Hand-over: "Your turn: un-Gaussianize; watch the update counter."
- Next: "now a real protein."

**P3-S08 · Same maps, new molecule** · 60 s · static.
- Screen: BBA as a 28-bead 3D chain (hairpin beads 0–12, helix 14–25; 1,300,156 DESRES frames) and a log–log scatter of bond W1 against Rg W1.
- Numbers:
  - First chunk (190,350 updates, seed 0, 100,000 draws): internal 0.000274 Å / 0.521 Å; Cartesian 0.415 Å / 0.072 Å; springs and whitening failed outright [M, Sprint 12].
  - Earlier (#895): springs bonds 52× better (0.6371 vs 0.0122 Å) with global structure no better [M].
- Beat: on BBA every chart got exactly one half right.

**P3-S09 · Under water** · 80 s · live, lever 5 · **CLIMAX of P3**.
- Screen: bars of BBA spring-channel spreads in channel units, with a waterline at σ(t_min) = 0.045. Bars below the line turn desaturated with a wave texture. A second, authored phase ("noise that leaves the molecule") shows a 1-D curve in 3D with noise spheres and a tangent/normal pie.
- Computed: channel sd ≈ 1/d, since spring channels √k_ij(d_ij − d⁰_ij) have unit thermal spread before the global RMS division; t½(sd²) is taken from the clock formula.
- Numbers:
  - Divisor 1.31 (ALDP5) vs 27.1 (BBA). At 27.1 the channel sd is 0.037 < 0.045 and t½ ≈ 0.0077 < t_min = 0.01, so bonds are never readable in training. At 1.31 the sd is 0.76 and t½ ≈ 0.21 [M #1025; D, checked here].
  - Comparison target: ALDP5 recipes resolve every observable at 11–31 σ(t_min) [M].
  - Second phase: invariant whitening has 3,303 features for 78 shape directions, hence 3,225 normal directions. The tangent share of the untrained low-noise loss is 0.06, and the loss goes 911 → 904 → 759 [M, #1025, note 28 §4].
- Beat: each map failed for a measurable reason. Springs sat under the floor (range), whitening put its noise off the molecule, and the maps with range lost the fold anyway.
- Live: lever `d`, divisor 1–40 (log), authored 1.31 → 27.1, `leverSim(['d'])`. Hand-over: "Your turn: lower the divisor until the bars surface; what does BBA need?"
- Climax image: the whole row of orange spring bars sliding under the waterline as one number changes.

**P3-S10 · Prediction is not generation** · 40 s · static.
- Screen: a verdict board of Era 3–4.
  - Stiff modes on ALDP5: WORKED, measured.
  - Torsions, αL, transfer: NO GAIN.
  - BBA global structure: FAILED, with the measured reason (#1025).
  - Learned embeddings: NOT SUCCESSFUL, with four reasons: biased local targets (BBA "1 ps" pairs are 200 ps chords), first-order fits against the nonlinear response, one RMS normalization, and redundant dimensions [M, r4 §5.3].
  - About 30 loss and target changes, each with "no generation gain".
- Next: "what we want is not equal erasure: range and order."

### P4 · Order: range and order (≈16 min; the MVP's home)

Lever arc: choose the chart (Cartesian has order without range, internal range without order) → jiggle a hinge (why internal is anti-ordered) → turn γ back (order returns with the exponent) → tilt the seesaw (why the loud block wins) → add vectors (why two).

**P4-S00 · Cold open** · 20 s. A BBA molecule condensing out of noise: two lavender loud arrows settle first, then the chain's local detail sharpens. Title "Order".

**P4-S01 · Readable means decided** · 70 s · static, with the clock-hand lens.
- Screen: one Gaussian feature of variance λ, as clean and noisy distributions on one shared axis (samples first, then the exact curve; the user's feedback on the information-geometry video). The readability curve R(t) = α²λ/(α²λ + σ²) is then read right-to-left as generation, "fraction already decided". Glyph semantics are introduced: filled means readable or decided, hollow means erased or open.
- Numbers:
  - t½(1) = 0.259 [D].
  - R = ½ guarantees at least ½ log 2 ≈ 0.35 nats [D, note 27 §1].
  - Fisher form: the score feels a feature where it is being erased [D, note 26 Prop. 3].
- Beat: destroyed going forward means decided going backward (exact for the exact reverse process). Link to Retention 05–06.

**P4-S02 · The erasure lab** · 110 s · live, lever 1.
- Screen: left, a real BBA frame (compact hairpin + helix) as a 3D bead chain with a tube on an authored slow orbit, overlaid by the plug-in decode of its noisy features at the hand (common random numbers); in the ordered chart the two noisy loud vectors a₁, a₂ appear as lavender arrows from the centroid. Right, the erasure clock with three lanes, each with its own trained band, and gauges for bond error, Rg and closest non-neighbour distance. Caption: "what the network is shown; the glyphs are what it can infer".
- Computed live: Cartesian x/6.252 + VP noise, decoded ×6.252; C3 log bonds, log tan(θ/2) and phase pairs × c_φ (1.504), Cholesky-whitened with `chain_spec.json`, noised, decoded by atan2 and NeRF; ordered = C3 plus c₀a_p with c₀ = 0.157 Å⁻¹ (`collective_modes.json`).
- Numbers:
  - Measured t½ lower bounds [M, note 27 §5]:
    - Cartesian: bond 0.0004, angle 0.05, torsion 0.08, Rg 0.47, long-range 0.44, contacts 0.38.
    - C3: bond 0.26, angle 0.35, torsion 0.35, Rg 0.27–0.28, long-range 0.24, contacts 0.23, end-to-end 0.18.
  - The ordered lane uses the first-order screen, dashed, from `bba_charts.json` [D-screen]: bonds 0.26, torsions 0.34, ≥ 11 apart 0.29, Rg 0.44, closest non-neighbour 0.025. Rg also carries the measured block-alone floor ≥ 0.42 [M].
  - Share of trained draws in the window: Cartesian bonds 0.04%, C3 bonds 25% [D].
  - Gauge targets: bond thermal spread 0.057 Å, data Rg spread 2.2 Å, the 3.5 Å overlap line.
- Beat:
  - Cartesian has order without range.
  - C3 has range without order, in fact anti-order: end-to-end goes at 0.18, before the torsions at 0.35.
  - Ordered internal coordinates keep local features inside the band and erase size last, carried by the arrows after the chain has dissolved.
- Live:
  - Lever `chart = choice('Chart', { cart: 'Cartesian', int: 'internal', ord: 'ordered internal' }, { value: [[0,'cart'],[40,'int'],[72,'ord']] })`, `leverSim(['chart'])`.
  - Lens `hand`, keyframed to sweep once per beat. Beats: Cartesian / Internal / Ordered / Your turn.
  - Hand-over at 96 s: "Your turn: pick a chart and find the noise where the molecule still knows its size but has lost its bonds." Cartesian has such a band (t ≈ 0.001–0.4) and so does ordered internal (t ≈ 0.26–0.44); C3 has none. Only ordered internal also keeps the bonds readable in a quarter of training draws, i.e. range and order together.
  - `exploreFrom: 4`. Go deeper: E1.

**P4-S03 · The fold dissolves before its joints** · 90 s · live, lever 2.
- Screen:
  - The 28-bead chain-model chain (3.8 Å bonds, 110°). Hinge 13 is jiggled by Δτ and the far end swings, with a displacement readout.
  - Then the clock hand: phase-pair noise on all 25 torsions, and a heat map of readability of b_k·b_l against separation. The diagonal stays bright while the off-diagonal fades as r^{⅔(m−1)}.
- Computed: NeRF chain; single-torsion readability r(t) = E[(I₁(k)/I₀(k))²] with k = αc_φ|y|/σ², by Rice quadrature. Prop. 1: R_h = Σc_j r^j / Σc_j.
- Numbers:
  - One torsion (c_φ = √2): 0.940 / 0.716 / 0.530 at t = 0.1 / 0.2 / 0.26 [D, checked here]. BBA's c_φ = 1.504 gives 0.947 / 0.746 / 0.565.
  - Chain-model exact table [D, note 30 §2, `exact-uniform.json`]:

    | t | b_k·b_{k+4} | b_k·b_{k+12} | b_k·b_{k+26} | end-to-end² | R_g² |
    |---|---|---|---|---|---|
    | 0.1 | 0.87 | 0.62 | 0.36 | 0.72 | 0.84 |
    | 0.2 | 0.47 | 0.08 | 0.004 | 0.25 | 0.44 |
    | 0.26 | 0.25 | 0.01 | 0.000 | 0.12 | 0.25 |

  - At t = 0.05 a torsion blurs by 6.6°, which moves distant beads by ≈1 Å through a 5–10 Å lever arm. Contacts would need ≈1°, i.e. level ≈ 0.005 [D, #1100, checked here].
- Beat: chain geometry is a product of many torsion phases, so noise erases the fold before the torsions that build it.
- Live: lever `dtau`, −10° to +10° on hinge 13, `leverSim(['dtau'])`. Readout: far-end displacement. Comparison target: the 0.4 Å margin between the data's 1% point (3.9 Å) and the 3.5 Å overlap test. Hand-over: "Your turn: how large a jiggle moves the far end across the overlap margin?" Stamp: "independent uniform torsions; BBA's are correlated". Go deeper: E4.

**P4-S04 · The order dial** · 90 s · live, lever 3 (P2's dial reused).
- Screen:
  - Left: BBA's 27 mode-variance bars (note-27 units) with their 27 readability curves fanning out on the clock.
  - Right: a dose–response panel of trained Rg W1 against γ. Measured dots light up only at measured exponents; the closed form is continuous.
  - A callout card: "24 Oct: equal erasure, the goal (note 21) → 12 Nov: the diagnosed cause of lost order (note 27)".
- Computed: λ^{1−γ} renormalized to unit mean, as in note 27 §3; the t½ of each mode.
- Numbers:
  - Spectrum from `collective_modes.json`: 15.59, 6.22, 3.01, 1.33 … 0.0109; the top four carry 93% of mean squared Rg [M, checked here].
  - Largest/smallest ratio ≈1.4×10³ → 230 → 38 → 6.1 → 1 at γ = 0 / 0.25 / 0.5 / 0.75 / 1. First and last t½: 0.53/0.028, 0.50/0.065, 0.45/0.13, 0.37/0.20, 0.26/0.26 [D].
  - Trained Rg W1: 0.51 (γ = 1; seeds 0.499/0.514), 0.187, 0.120, 0.081 Å, beside the screened Rg windows 0.20, 0.43, 0.46, 0.48 [M #1057; 50k updates; one seed per γ except γ = 1].
  - Bonds stay at 0.0005–0.0008 Å. TIC JS (0.081–0.107) and torsion error (6.5–10.4°) do not follow [M].
  - Order criterion: two linear decision windows are disjoint only if their loudnesses differ by more than ×16 [D, g3 C2].
- Beat: P2's fix is exactly what erased the order. Size follows the exponent monotonically; populations do not.
- Live: lever `gamma`, the same slider glyph as P2-S07, authored 1 → 0. Hand-over: "Your turn: turn γ back from 1; where does the size error stop improving?"

**P4-S05 · Make size a coordinate** · 60 s · static.
- Screen: the BBA chain moving along mode 1 (a smooth end-to-end gradient with a sign change after bead 14) and mode 2 (ends against the middle), with Rouse cosines overlaid. Then the loudness ruler: a vertical log axis with a second t½ scale.
- Numbers:
  - Rouse overlaps 0.99, 0.99, 0.91, 0.92 [M].
  - Mode 1 is 88% aligned with the hairpin-to-rest separation [M].
  - Shares of squared size: 56% and 22% [M].
  - Library mean squares 15.0, 6.0, 2.9, 1.3, 0.49 at c₀ = 0.157 Å⁻¹ [M].
  - 103 internal channels + 6 = 109 features [D].
  - Loudness markers [D-screen]: closest contact 0.003 → t½ 0.013; end-to-end 0.2; ≥ 11 apart 0.3; unit 1; torsion 2.0 → 0.33; helix order parameter 8.8 → 0.47; mode 2 6.0; mode 1 15.0 → 0.52.
- Beat: two vectors are louder than any torsion, so size gets a band of its own.

**P4-S06 · Who corrects whom: the constraint seesaw** · 80 s · live, lever 4.
- Screen: a 2D toy with x along the internal image and y the block channel. The joint image is y = g(x) with slope L. A noisy point, its normal n ∝ (−L, 1), and the projections of n drawn as a seesaw (the u1-force `drawBalance` port).
- Computed: internal share L²/(1+L²), block share 1/(1+L²); 3K − 3 constraint directions.
- Numbers:
  - At L² = 1 / 16 / 63 the internal share is 0.50 / 0.94 / 0.98 [D, checked here].
  - Chain-model gains (internal/block), each lighting up at its L²: whitened 0.43–0.55 / 0.43–0.56; natural 0.85–1.03 / 0.06–0.09; twice natural 0.90–1.09 / 0.02–0.03 [M, chain model].
  - BBA constraint shares in the internal block: 74/87/96% (natural), 27/44/68% (whitened), 92/97/99% (twice) [M, 1,200 frames].
  - K = 2 gives 3 constraint directions [D].
  - Pill [H]: "#1137 (declared 2026-11-18, not run): a whitened block keeps about half the gain."
- Beat: the louder block leaves the correction to the quieter one, so the chain is pulled to the size the block decided early.
- Live: lever `L2`, 1–63 (log), authored 1 → 16 → 63, `leverSim(['L2'])`. Hand-over: "Your turn: whiten the block; who is corrected now?"

**P4-S07 · Information moves, it is not created** · 50 s · static, with a chart lens.
- Screen: collapse-signal densities ½β(t)S_Q(t)/σ_t² against t for internal only, whitened block and natural block, with equal shaded areas.
- Numbers [M/D, chain model, `signal-*.json`]:
  - KL 0.0766 nats, recovered within 3% in every arm.
  - Block share 0.48 (whitened) vs 0.88 (natural), mostly at t ≈ 0.35–0.6.
  - Per example: collapse 0.0005 at t = 0.01 against constraint 0.92.
- Beat: no chart changes the total signal; it moves where it sits and how large its share is.

**P4-S08 · Why two** · 70 s · live, lever 5.
- Screen: the chain with K vectors drawn as arrows, and a table row that updates with K.
- Numbers [M, #1057/#1069; seed means; one seed for K = 1, 16, 27]:

  | K | 0 | 1 | 2 | 4 | 8 | 16 | 27 |
  |---|---|---|---|---|---|---|---|
  | angle W1 (°) | 0.23 | 0.26 | 0.27 | 0.36 | 0.42 | 0.57 | 1.25 |
  | torsion error (°) | 0.90 | 0.86 | 0.94 | 1.18 | 1.54 | 4.15 | 11.0 |
  | Rg W1 (Å) | 0.477 | 0.161 | 0.105 | 0.136 | 0.152 | 0.325 | 0.399 |
  | derived input channels [D] | 0 | 1 | 3 | 14 | 92 | 696 | 3,303 |
  | constraint directions [D] | 0 | 1 | 3 | 9 | 21 | 45 | 78 |

  - Size-response shares λ²/Σλ²: 83% for mode 1, 96% for modes 1–2 [D, checked here].
  - Mode-length variances 6.9, 2.5, 0.9, 0.6, against torsion loudness 2.0 [M].
  - K = 1 is "not force-ready" (no volume term).
- Beat: only two modes are louder than a torsion. More vectors add constraints and channels, not order.
- Live: lever `K = choice('Block vectors', {0,1,2,4,8,16,27})`, `leverSim(['K'])`. Hand-over: "Your turn: add vectors; watch the channel count."

**P4-S09 · Generation decides size first** · 75 s · static · **CLIMAX of P4**.
- Screen: the erasure clock runs right-to-left and the glyphs lock in, size first. A generated molecule condenses. Two gauge needles show mean |a₁| of the denoised block and of the chain rebuilt from the denoised internal block, with an R² trace below.
- Numbers [M, #1133, s2/s3]:
  - Mean |a₁| block/chain: 21/59 Å at t = 0.6, 40/41 at 0.13, 40/40 at 0.01.
  - R² of chain on block: 0.13 (0.6), 0.29/0.26 (0.45), 0.37/0.38 (0.35), 0.43/0.40 (0.26), 0.44/0.42 (0.2), **0.63/0.60 (0.13)**, 0.91 (0.05), 0.97 (0.01).
  - Predicted takeover 0.26–0.1 [D, note 30].
  - Share of compact molecules already carrying their final handedness sign: 0.55, 0.65–0.69, 0.88 at t = 0.6, 0.45, 0.13 [M].
  - Caption: "denoised estimates are posterior means, not samples".
- Beat: erased last going forward, decided first going backward. The block fixes the size, and the chain falls in line at t ≈ 0.13, as predicted.
- Climax image: the two needles converging while the molecule condenses.
- Data: `reverse_path_s2.json` (§5.2, from LISE). Without it, show the logged gauges with a molecule badged [I].

**P4-S10 · Two halves, one model** · 80 s · static, with a budget lens.
- Screen: a log–log Pareto plot of angle W1 against Rg W1 at 190,350 updates and 100,000 molecules, seeds as paired dots. The budget clock shows the 1,903,500-update cosine with stops at 2.6 / 10 / 20 / 100%.
- Numbers [M, #1088] (angle / Rg):
  - ordered internal 0.20/0.19° and 0.117/0.091 Å;
  - C3 0.21/0.18° and 0.455/0.418 Å;
  - Cartesian + distances 1.58/1.49° and 0.071/0.077 Å;
  - covariance-matched Cartesian 1.36/1.30° and 0.073/0.077 Å;
  - native ScoreMD 1.58/1.74° and 0.157/0.532 Å;
  - wδ 1.73/2.12° and 0.062/0.072 Å;
  - invariant whitening 19.6/23.9° and 0.67/0.58 Å.
- Budget lens [M]: ordered internal 0.106/0.110 → 0.117/0.091 → 0.120/0.096 → 0.111; C3 0.493/0.462 → 0.455/0.418 → 0.468/0.432 → 0.455. The 1.9M stop is one seed, from open PR #1104.
- Paper PMF at 100k [M, #1138 open]: covariance-matched Cartesian 0.096, ordered internal 0.097, C3 0.113, ScoreMD (190k) 0.202/0.315; floor 0.080.
- Beat: every earlier chart got one half. Ordered internal coordinates get both, and the C3 swelling never trains away. Bonds are 17–120× better than the Cartesian family [M, r7].

**P4-S11 · What two vectors cannot say** · 60 s · static.
- Screen: four panels with verdict pills.
  - Wall. Excluded volume is a range failure: closest non-neighbour t½ is 0.013 in the internal chart, and blur at the floor is 0.32–0.36 Å against the 3.9 → 3.5 Å margin [D/M]. The mirror case: wδ reads contacts to t½ ≈ 0.12 but bonds only to 0.014 [D, first-order, unofficial, g2]. Pill "the barrier that killed, the barrier that may save" [H].
  - Handedness. Two vectors are mirror-symmetric. The 0.04–0.06 mid-size deficit traces to the relative twist of the two halves (coarse dihedral 61%/59%) [M].
  - Kinematics. The joint rebuild with a 3.6 Å core gives 0% overlaps and Rg W1 0.083/0.070 Å [M]. Stamp: "0% by construction".
  - Readable is not learnable. The skeleton map's torsion window is 0.20, yet its torsion error is 7.9–10.6°: "a feature is learned when it is a coordinate of its own" [M, #1068].
- Next: "the wall is also what the force field is missing" → P5.

### P5 · Forces: one model, two uses (≈12 min)

Lever arc: raise t* (blur softens stiff forces) → switch to thermal units (one level serves all) → scale the force (check it without reference forces) → switch the volume term (a wrong Jacobian is a phantom force) → dial the size term (a wall unmasks a swelling).

Force convention, stated once on screen: driver F_t(x) = Jᵀα s(αφ(x), t) + ∇ log vol. Note 29's form differs from it by α_t² on prior-matched channels (0.971 at t = 0.05) [D, g4 §3.11].

**P5-S00 · Cold open** · 15 s. A BBA chain simulated under a learned force, slowly compacting. Title "Forces".

**P5-S01 · ScoreMD's seesaw** · 60 s · static.
- Screen: s(x, 0) ≈ −∇U/k_BT [S], and a seesaw with iid on one side and simulation on the other.
- Numbers [S, ScoreMD Tables 1, 12, 15]:
  - BBA Diffusion: iid 0.034, sim 5.387.
  - Two For One: sim 1.624 (read at t = 0.005); ALDP C–N bond 23.51× worse in simulation.
  - Both: 0.234/0.254.
- Beat: "one model, two uses" came with a trade-off.

**P5-S02 · The blur dial** · 90 s · live, lever 1.
- Screen: P2-S07's nine ALDP5 lanes become nine width histograms, simulated against MD, each with a Stein needle. A rose pin sits on the clock at t*.
- Computed:
  - A seeded `simulation` of 1,000 walkers per mode in reduced coordinates u_k = x_k/w_k, with du = −r_k(t*) u dt + √2 dW. Here r = α²λ/(α²λ + σ²) and λ_k = (w_k/0.9418)².
  - Stationary width inflation 1/√r [D, g1 §2.11].
  - A second readout: soft-force noise from one level ∝ 1/σ [D, note 30 §7].
- Numbers:
  - At t* = 0.01, r = 0.264, 0.328, 0.498, 0.625, 0.707, 0.896, 0.951, 0.985, 0.996 and inflation = 1.95, 1.75, 1.42, 1.27, 1.19, 1.06, 1.03, 1.01, 1.00 [D, checked here].
  - Measured flat-production force checks at 0.01: 0.198, 0.252, 0.293, 0.485, 0.459, 0.418, 0.694, 0.727, 0.369 [M, #768 seed 0]. These sit below the ideal: blur explains most of the softness, not all of it.
  - Simulated bond spread 2.38–2.48× [M].
  - Vise: a 5% bias on the stiffest mode needs σ ≤ 0.0058 Å, giving a target variance ≈3.0×10⁴ Å⁻², against 19 in thermal units [D, g1 §3.3].
- Beat: a force read at noise level t is the force of the blurred molecule. Stiff modes go soft and their spread inflates. That explains Two For One's broad bonds.
- Live: lever `tstar`, a log slider from 10⁻⁴ to 0.1, authored 10⁻⁴ → 0.05 → 0.01. `sim` `uses: ['tstar']`, dt = 0.01, tick 1/60, snapshots every 0.5 s. Comparison target: needle = 1. Hand-over: "Your turn: lower t* until the bonds stop inflating; now watch the soft-force noise."

**P5-S03 · One level for every mode** · 60 s · live, lever 2.
- Screen: the same panel and simulation with the rose pin held at t* = 0.03. The Cartesian curves are swapped for the thermal ones, so the plot built in S02 is reused.
- Numbers:
  - Cartesian at 0.03: inflation 4.22 for the stiffest mode down to 1.01 for the softest [D, checked here].
  - Thermal (every λ = 1): r(0.03) = 0.988, inflation 1.006 [D].
  - Comparison targets, ALDP5 #768 [M]: simulated bonds 0.064–0.072 σ (spring/learned) against 1.105 σ (flat production floor); sim JS 0.021–0.024 against 0.142 (flat low floor, with 83% αR in seed 0, MD 35%). Stability: walkers blow up at h = 4·10⁻⁴ Å²; Euler–Maruyama bond limit 6.0–9.1×10⁻⁴ Å² [D/M].
  - Stamp: "a parallel, not a head-to-head (no FP term)".
- Beat: in metric-shaped coordinates one read-out level serves stiff and soft modes.
- Live: lever `units` (Cartesian / thermal). Hand-over: "Your turn: switch units at the same t*."

**P5-S04 · A force check without reference forces** · 60 s · live, lever 3.
- Screen: one Gaussian mode (2,000 fixed seeded draws) and the Stein needle −E[(g·e)(e·(u − ū))], which reads c when g = −c·u. Then ALDP5 needles per direction.
- Numbers [M, #768]:
  - Flat production floor 0.20–0.29 on directions 1–3 (bonds 3–5× too soft).
  - Spring 0.97–1.03; learned 0.96–1.00.
  - Trap: on BBA a correction that zeroes the needles (z 7–15 → 0.7–0.8) still swells in simulation [M, #1100].
- Beat: each direction's restoring strength can be tested without reference forces. The test is necessary, not sufficient.
- Live: lever `c`, 0–2. Comparison target 1. Hand-over: "Your turn: make the needle read 1, then guess which ALDP5 model passes."

**P5-S05 · The phantom spring** · 90 s · live, lever 4 · **CLIMAX of P5**.
- Screen, first beat: a 2D Gaussian in polar coordinates. The radial force 1/r − r becomes −r when the Jacobian is dropped. Walkers are live and the mean radius is read out.
- Screen, second beat: BBA. The data's Rg histogram is reweighted by the ratio of the two volume factors. A spring drawn from the centroid to every bead is labelled "≈0.6 kT/Å inward on Rg".
- Computed: the radial Langevin `simulation` with `uses: ['volume']`; weights w_i ∝ exp(Δlogvol_i) from the precomputed asset.
- Numbers:
  - Radial mean 0.798 (missing term) against 1.253 (correct), −36%. In 3D: 0.798 against 1.596, −50% [D, g1 §3.6].
  - BBA: the predicted stationary mean Rg is 9.58 Å against 10.66 Å; the study's simulations ended at 9.6–9.7 Å. The 100 ps size error falls from 0.98 to 0.24 Å with the immersion term ½ log det(J_cᵀJ_c) [M, #1100, seed 3, 512 paths].
  - The asset recomputation gives 10.81 → 9.64 Å on its 2,000 frames [D, r7 E10].
  - Perfect-model read-out in the chain model: −1.7 to −1.8 Å without any volume term, ≤ 0.01 Å with the immersion term up to t = 0.1 [M].
  - Pill: "CORRECTED 2026-11-16: three quarters of the loud-mode compaction; status page stale".
- Beat: a missing or wrong volume term cannot be told apart from an attractive physical force.
- Live: lever `volume = choice({ wrong, right })`. In the toy, "wrong" means no Jacobian; on BBA it means the rotation-invariant formula. Hand-over: "Your turn: switch the term; where does the size settle?"
- Climax image: the phantom spring tightening and the histogram sliding to 9.6 Å, then releasing.

**P5-S06 · Blur versus wall** · 80 s · live, lever 5.
- Screen: first the read-out squeeze. Torsion blur in degrees against t, the lever-arm displacement, and contact blur by K against the 3.5 Å line. Then a number line of mean Rg with the data, a wall-only point and a wall + size point.
- Computed: the linear-response shift c·Var(Rg).
- Numbers:
  - Torsion blur 1.70° at 0.01 and 6.63° at 0.05 [D, checked here].
  - Contact blur at t = 0.01 for K = 0/1/2/4/8: 0.37/0.32/0.22/0.16/0.15 Å [M, #1101].
  - Training lower (t_min = 0.003) leaves the wall z unchanged [M].
  - Wall only: mean Rg 11.13–11.31 Å against 10.60, size error 0.55–0.72 Å [M]. With a −0.16 kT/Å size term: 0.263/0.173 Å with 0% overlaps [M].
  - Linear response 0.16 × 4.8 Å² ≈ 0.77 Å [D, checked here].
- Beat: two errors that cancel. Forbidding overlaps unmasked a swelling that the overlaps had been holding back.
- Live: lever `cRg`, from 0 to −0.3 kT/Å. Comparison target: the data mean. Hand-over: "Your turn: dial the size term until the mean size meets the data."

**P5-S07 · The drift that does not stop** · 60 s · static, with a simulated-time lens.
- Screen: size error against simulated time, with the panel floor as a band.
- Numbers [M]:
  - #1130 (2,048 paths, t = 0.05, correct term): s2 0.268/0.408/0.562, s3 0.277/0.369/0.476, s4 0.221/0.483/0.631 at 100/200/300 ps.
  - Full-schedule force field 0.118 Å at 100 ps (open #1104).
  - 500 ps at 0.05: 0.82/0.85 (C3), 1.10/1.44 (loud).
  - Floor 0.084 Å.
  - Small-panel trap: the same checkpoint reads 0.337 with 512 paths and 0.277 with 2,048.
- Beat: every force field still compacts between 100 and 300 ps. Open: #1136, #1113.

**P5-S08 · Where we stand** · 70 s · static.
- Screen, two consistency panels. Left: the ScoreMD paper. Right: this project on ALDP5 (#768) and BBA. Labelled "a parallel, not a head-to-head".
- The case for optimism: a large gain reproduced across seeds and budgets; mechanisms that predicted the block size and the takeover time (0.13 against 0.26–0.1); each remaining defect sits where a two-vector block cannot help.
- Open pills: #1137; paper-protocol simulation PMF (#1138) not measured; drift. Chignolin transfer is not shown (generated dummy data).
- The video ends on E0.

### E1 · Erasure lab (explorable; the MVP's other half)

- Levers:
  - chart: Cartesian, C1 (whitened two-block), C3, ordered internal, +2 whitened, +8 at loudness 15, wδ (first-order only), Chroma-style, fully matched covariance, EigenFold (own clock: ratios only);
  - molecule: three frames nearest the Rg quantiles 8.37 / 9.89 / 15.30 Å;
  - rebuild: internal-only or joint, precomputed on a 24-level grid.
- Lenses:
  - the clock hand;
  - estimator, "same word, four windows": best-estimator envelope [M], first-order loudness [D], network-input R² ≥ 0.5 [M], resolution σ*/σ(t_min) [M];
  - glyph set (local / global).
- Challenges, drawn by the scene and checked from the window table:
  1. Range: every window bar reaches t½ ≥ 10 t_min.
  2. Order: Kendall τ between the erasure order and the coarse-to-fine order ≥ 0.8.
  3. "Find the only chart that passes both" (ordered internal).
- Readouts: training share per glyph; a σ ruler in Å per chart (× 6.252 for Cartesian).
- Stamps: "lower bounds"; "first-order is dashed".

### E2 · Lag dial (explorable)

- Lever: τ from 0.01 ps to 50 ns.
- Panels:
  - G_τ bars for the four-mode basin;
  - the ALDP5 saturation table as variance and width fractions, which also fixes Retention 02's "63%": 63% of variance is 79% of width [D, g4 §3.9];
  - the three measured warps (κ_step 2.99/3.59/3.75 against flat 184/354/762; KL 0.96/0.20/0.14; JS@100 0.127/0.049/0.027) [M];
  - the αL barcode: three φ timelines with 37 visits each, populations 3.24/1.65/4.11%, dwell 219/111/278 ps [M]. Error bars: note 25's 0.90/1.27/0.79 struck through; Markov 0.225/0.229/0.223 [D]; data-based ≈ 0.4–0.7 [D].
- Challenge: "choose a lag at which ψ and the bonds are erased together, then explain why αL's weight is still unknown."

### E3 · Force reader (explorable)

- Levers: t*, units, Euler–Maruyama step h (two-bead inflation 1/√(1 − hk), limit h < 1/k) [D, g1 §3.9], force scale c.
- Plus the BBA read-out trade-off: size error at 90–100 ps of 1.60/1.26/1.12/1.06/0.90/0.69 Å at t = 0.005…0.05, against the blur floor 0.045…0.117 Å [M, #1089]. Badge: "loud rows carry the volume-term bug".
- Challenge: "find one t* with all nine ALDP5 widths within 5%". It is impossible in Cartesian units and possible in thermal units.

### E4 · Lever-arm chain (explorable)

- Levers: hinge k (drag), Δτ, the clock hand, separation m.
- Readouts: effective degree log R / log r ≈ ⅔(m − 1); far-bead displacement.
- Target: "contacts need about 1°".

### E0 · Lever atlas (index)

- A dated timeline (exposé 07-02; Sprints 0–10, 07-27 → 10-22; notes 20–21, 10-23/24; tracker #769, 10-27 → 11-16; notes 25–26, 11-04; Gaussianization correction 11-05; first chunk 11-09; #1025, 11-11; range-and-order decision 11-14; registered budget 11-15; volume fix 11-16; note 30 and the full schedule, 11-18). Each node shows a claim, a verdict pill and the icon of the lever that demonstrates it, linked to `?video=part-4-order&t=…`. Era boundaries follow the tracker convention (critic).

---

## 4. Recurring visual devices and conventions

**Colour.** One programme palette, declared in `src/videos/common/palette.js` and used by P2–P5 and E1–E4.
- Feature hues: the stiff and soft meanings from Part 1 are kept and extended.
  - bonds: orange `#ef8a5b` (house stiff);
  - angles: apricot `#f3b58d`;
  - torsions: sky `#6cc4e8` (house soft);
  - contacts / the wall: coral `#ff7a7a`;
  - global shape (Rg, long-range, end-to-end, loud modes and their arrows): lavender `#c39bf5`;
  - basins and populations: mint `#8ed8b0`.
- Roles:
  - gold `#f2cf63`: the hand, i.e. the clock hand, the current sample and the object of attention;
  - rose `#f497c0`: force (the t* pin, force arrows), matching u1-force's "rose force";
  - green `#86d08f`: model or generated;
  - ink: data and MD;
  - muted: ghosts and superseded values.
- When P4 replays Retention's toy, it redraws it in these colours. Retention's lavender (INFO) and gold (BASIN) are not imported.

**The erasure clock** (`src/draw/clock.js`).
- x axis: log₁₀ t from −5 to 0. A top scale shows log-SNR: 13.81 at 10⁻⁵, 6.22 at 0.01, 0 at 0.259, −10.05 at 1 [D].
- Each lane has its own trained band ([0.01, 1] for internal and map charts, [10⁻⁵, 1] for Cartesian), shaded, with a hatched "never trained" fog below.
- Window bars run from t_min to t½ in feature hue.
- Glyph shapes: bond stick, angle wedge, torsion circular arrow, contact pair of touching beads, global shape ring, basin dot.
- Line style:
  - measured values: solid, with a ≥ caret because they are lower bounds;
  - first-order screens: dashed outline;
  - closed forms: thin solid with a D pill.
- The hand: a gold needle with a ring handle (lens). It carries a readout box, e.g. "t = 0.050 · σ = 0.172 · log-SNR 3.50 · ×6.252 Å → 1.07 Å".
- Reverse mode: a "generation ←" arrow; glyphs fill when the hand passes their t½ going down. "Decided" and "readable" are the same glyph state because they are the same number.

**Handles.**
- A solid disc is a lever (pauses the video); a ring is a lens. This matches the strip's groups "Physics · pauses the video" and "View".
- A faint tick marks where the narrator left a lever.
- A dotted gold ghost hand keeps the authored motion while the viewer holds the lens.

**The waterline** (`src/draw/waterline.js`). The noise floor drawn as a horizontal line over bars of channel spreads in noise units; bars below it are desaturated with a wave texture. Used in P2-S07, P3-S09 and P5-S06 (contact blur against the margin).

**Seesaw** (`balance.js`, ported from u1-force `drawBalance`) for the constraint split.

**Verdict pills.**
- WORKED (green outline);
- NO GAIN (muted);
- FAILED · MEASURED REASON (orange outline);
- CORRECTED dd-mm (gold outline);
- OPEN (ink outline);
- SUPERSEDED (struck through, muted);
- HYPOTHESIS (dotted outline).

**Provenance badges** (`src/draw/badges.js`).
- A small mono letter in a shape after every number: M filled square, D triangle, H dotted circle, I hollow square, S bracket.
- The bottom-right stamp (the a3 device at y = 890) names the file or PR the number comes from.

**Number typography.**
- IBM Plex Mono with tabular figures, a real minus sign and units always shown.
- σ(t) is dimensionless. Whenever it appears in Å the factor is shown (× 0.9418 Å pilot, × 6.252 Å BBA Cartesian, × 1 Å manifold route).
- Lower bounds carry ≥.
- BBA model numbers carry a budget tag ("190k upd · 100k mol · s2/s3").
- ALDP5 numbers carry their data set ("bgmol" or "mdshare"), because the two sets must not be mixed [g4 §4.4].
- Significant digits follow the canon. The BBA mode-variance ratio is shown as "≈1.4×10³" (§6).

**Symbol hygiene** (g4 §2.2):
- κ always carries its definition subscript: κ_H, κ_Σ, κ_res, κ_t, κ_step, κ_train.
- The torsion phase scale appears as c_φ = 1.504 ("κ in the code").
- The spring soft scale appears as k⊥ ("γ in notes 20–22").
- γ is reserved for the whitening exponent, τ for the lag, t for the diffusion level, t* for the read-out level, m for the Gaussianize morph.

**Noise.** Noisy molecules use common random numbers across t, so turning the hand morphs the molecule continuously. A muted halo marks "noisy input". Posterior ghosts appear only where the posterior is computed honestly; Cartesian ESS ≈ 700, while the 103-d internal chart collapses to ESS ≈ 1, so internal posteriors are never drawn as ghost clouds.

---

## 5. Computation and data catalogue

### 5.1 Models (DOM-free, `src/model/*.js`) and test targets (`tests/*.test.mjs`)

| module | computes | test targets (tolerance) |
|---|---|---|
| `vp.js` | B(t) = 0.1t + 9.95t², α, σ, s = σ/α, log-SNR, r(t, λ), t½(λ) | t½(1) = 0.259; σ(0.01) = 0.04464; s(0.05) = 0.1741; s(0.259) = 1.000; α(1) = 0.006572; log-SNR(0.01) = 6.22 (±1e-3) |
| `modes9.js` | ALDP5 nine modes, λ^{1−γ} without renormalization, shares, inflation | flat t½ 0.00483, 0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196; γ where the stiffest mode enters the band = 0.142; spreads 40.6 / 12.8 / 4.8 / 2.0 / 1.0 at γ = 0 / 0.25 / 0.5 / 0.75 / 1; r(0.01) and inflation as in P5-S02; inflation at t = 0.03: 4.22 for mode 1 |
| `wdelta.js` | F(X), chord, H = JᵀJ (analytic + finite differences), horizontal spectrum, flattening family | rigid-generator residual < 1e-12; cond_h(e = 0.5, 0.1, 0.01) = 42.14, 6.437×10³, 6.004×10⁷ (0.5%); odometer 3.2489 / 7.8377 / 12.4378 / 17.0407; unit change leaves the chord fixed (1e-12) |
| `geodesic2d.js` | thin-triangle pullback geodesic, fixed-step Verlet vs 4,096-step reference | error falls ~1st order in S; the reference satisfies the chord bound; the bound is violated for small S near the wall (qualitative, thresholds fixed before the first run) |
| `cone.js` | spring cone, projected-noise aspect, four-point ε | c = 0.10296, σ_r = 0.02658, σ⊥ = 0.2582, K_tan = 0.02932, radius 5.81; four-point ε 0.0008 / 0.0076 / 0.0218 / 0.0607 / 0.1618 / 0.3471 (θ = 0.1 … 1.6); Monte Carlo aspect within 3% of c |
| `lag.js` | t_k, G_τ, half-erasure | t_k = 0.0078 / 0.0312 / 0.5 / 3.125; G at τ = 1: 1600 / 400 / 28.9 / 14.6; half-erasure 1.000 / 1.000 / 1.019 / 2.115 |
| `gaussianize.js` | bimodal density, CDF map, noised score, SGD toy | linear-fit R² of the score ≥ 0.999 at m = 1; seeded SGD is bit-reproducible from snapshots |
| `chain.js` | NeRF chain, jiggle, von Mises r(t, c_φ), Prop. 1 | r(c_φ = √2) = 0.985 / 0.940 / 0.716 / 0.530 / 0.415 at t = 0.05 / 0.1 / 0.2 / 0.26 / 0.3; c_φ = 1.504 gives 0.987 / 0.947 / 0.747 / 0.565 / 0.449 (±0.003); exact-table cells as in P4-S03; torsion blur 1.70° (0.01), 6.63° (0.05) |
| `seesaw.js` | split, counts | 0.500 / 0.941 / 0.984; 3K − 3; K(K+1)/2 + C(K,3) = 0, 1, 3, 14, 92, 696, 3,303 |
| `spectrum.js` | BBA modes from the asset, γ-dial with unit-mean renormalization | note-27 units 15.588, 6.217, 3.010, 1.328 … 0.0109; ratio 1,428 ± 1 (asset) and within 0.5% of the canon's 1,423; t½ first/last 0.526 / 0.0284; size response 0.830, cumulative 0.962; mean-square share 0.557, cumulative 0.779 |
| `forces.js` | read-out ratio, Langevin in reduced units, Stein ratio, radial toy, Euler–Maruyama two-bead | thermal r(0.02, 0.03, 0.05) = 0.994 / 0.988 / 0.971; radial means 0.798 / 1.253 / 1.596; stationary simulated variance 1/r within 3% (seed 7, 60 s); Stein ratio equals c within 2σ |
| `volume.js` | reweighting, linear-response size term | 0.16 × 4.8 = 0.768; the reweighted mean from the asset in [9.5, 9.7] Å and within 0.1 Å of the asset script's printout |
| `windows.js` | the tables of every lane (asset) | each cell equals g4 §4.2 / r6 §4.1–4.3 (exact strings); C3 Rg window = "0.27–0.28" |
| `markov.js` | αL uncertainty | (1 − w)√(2/n) = 0.225 / 0.229 / 0.223 |

A `guard()` at import, the interactions idiom, throws if a narrated number stops being true.

### 5.2 Data assets

Scripts go in `scripts/data/*.py`. Run them read-only against `LOCAL` with `python -I` and plain numpy, never `import riemanniangenerativemd`, because the editable install points at an unrelated branch (r8 §6A). They write JSON into `src/videos/<id>/data/` or `explorables/<id>/data/`, which esbuild bundles through its JSON loader.

| asset | source | script outline | JSON shape | size |
|---|---|---|---|---|
| `aldp5_frames.json` | `data/deshawresearch/aldp.npy` (bgmol, atoms [4,6,8,14,16] × 10 Å) | pick 1 reference frame + 400 frames; compute the 9 internal coordinates | `{ ref: [5][3], frames: [400][5][3], widths: {bonds, angles} }` | 50 kB |
| `aldp5_modes.json` | `data/mdshare/…npz` arr_1, beads [1,3,4,6,8] × 10 Å | Kabsch align, PCA → 9 internal eigenvectors and widths; assert widths equal `evidence.json` `mode_std_A` within 3% | `{ widths: [9], vectors: [9][5][3], unit: 0.9418 }` | 5 kB |
| `aldp5_planarity.json` | bgmol, 20,000 frames, n = 5 and n = 6 (+ atom 10) | λ_min(G)/tr G histograms (40 bins); worst-condition check against 1.55×10⁶ / 4.2×10³ | `{ edges: [41], n5: [40], n6: [40] }` | 3 kB |
| `aldp5_race.json` | `runs/feature-space-evaluation-2026-10-26/remote/full/*_samples.npz` + `evidence.json` | bond 1–2 histograms (64 bins), 5 arms × 10 checkpoints, seed 0; curve table | `{ arms, checkpoints, hist[arm][ck][64], curves }` | 30 kB |
| `aldp5_lag.json` | note 25 §3 table (hand-entered, source keys) + mdshare φ series | φ via dihedral; αL hysteresis (enter > 20°, leave < −20°) → visit intervals; 1 ns downsampling | `{ saturation: […], barcode: [3][{start,end}] }` | 20 kB |
| `bba_frames.json` | `data/deshawresearch-bba-ca28/train.npy` | three frames nearest Rg quantiles 8.37 / 9.89 / 15.30 Å; their C3 features; copy `chain_spec.json` mean/Cholesky (53×53) and c_φ | `{ frames: [3][28][3], c3: [3][103], mean: [53], chol: [53][53], cphi }` | 45 kB |
| `bba_modes.json` | `runs/range-order-mechanisms-20261118b/collective_modes.json` | copy; add c₀ and note-27 units | `{ meanSquaresA2: [27], vectors: [27][27], c0 }` | 16 kB |
| `bba_windows.json` | note 27 §5, `bba_charts.json`, lab 11-16 (#1099), #1026, #1025, g2 §4.8 (wδ, unofficial) | hand-entered with source keys + JSON copy of `bba_charts.json` (t_half, loudness, blur) | `{ lanes: { chart: { feature: { t, kind: 'M'|'D'|'screen', src } } } }` | 12 kB |
| `bba_chain.json` | `exact-uniform.json`, `signal-uniform-{unit,natural,x2}.json` | copy the level tables and summaries | `{ exact: {level: {obs: R}}, signal: {arm: {level: {…}}, summary} }` | 25 kB |
| `bba_results.json` | real-budget-study, #1057/#1069 tables, #1133, #1138, #1088–#1130 force tables | hand-entered, each value with a `src` key; tests assert against g4/r6/r7 | `{ table: [...], gamma: [...], K: [...], reverse: [...], forces: [...] }` | 20 kB |
| `bba_volume.json` | 2,000 held-out frames | per frame Rg and Δlogvol = ½ log det(J_cᵀJ_c) − (invariant-map factor) for the 2-vector loud map, re-implemented in numpy from `geometry/immersion_volume.py`; print the reweighted mean (expected ≈ 9.6 Å) | `{ rg: [2000], dlogvol: [2000] }` | 40 kB |
| `bba_rebuilds.json` (E1 only) | `bba_frames` + VP noise (seed fixed) | joint least squares (Levenberg–Marquardt, 160 iterations, 3.6 Å core) and wδ projection at 24 levels × 3 molecules × 5 charts | `{ chart: { mol: [24][28][3] } }` | 120 kB |
| `reverse_path_s2.json` (optional, LISE) | ordered-internal checkpoint s2, `runs/s12-bba-study-20261114/` | run one reverse path; store the block a₁, a₂ and the rebuilt chain at the 12 #1133 levels | `{ levels: [12], block: [12][2][3], chain: [12][28][3] }` | 30 kB |
| `scoremd_tables.json` | ScoreMD paper Tables 1, 11, 12, 15 via g1 §4.1 | hand-entered [S] | `{ table: {...} }` | 2 kB |

The total bundled data is under 450 kB. P4 uses PR #3's lazy-load entry in `src/main.js`. Note that the full 27-value spectrum the brief worried about already exists locally, in `collective_modes.json`, fitted on 1,300,156 frames.

---

## 6. Risks

1. **The lens/lever boundary.** The clock hand is a lens, so narration never asserts its current value (cues name levels; the ghost hand keeps the authored sweep visible). Any value the narration depends on is a lever (`leverSim`).
2. **Plug-in decodes are not posteriors.** The noisy molecule in E1 and P4-S02 is what the network is shown; the glyphs (measured lower bounds) are what it can infer. Both are captioned; posterior ghosts appear only in Cartesian.
3. **Window estimators.** Four estimators can differ by up to 2.5× (g4 §4.2). The C3 Rg window is 0.27–0.28 (canon); 0.19 is first order, 0.23 the weak estimator, 0.30 linearised. Never put first-order values and measured values on one lane without the dashed style. EigenFold gets ratios only.
4. **Dose–response points are not interpolated.** The γ panel shows four measured points (one seed per γ except γ = 1). Only the closed-form spectrum moves continuously.
5. **κ has six meanings.** Subscripts are everywhere; there is no before/after arrow across definitions or data sets (192 → 9.6 is bgmol κ_res; 184 → 2.99 is mdshare κ_step).
6. **The BBA variance ratio.** The canon gives 1,423 (note 27 §3); the library asset gives 1,428. Display "≈1.4×10³"; the test pins both.
7. **Units of σ.** 0.0446 is dimensionless. It is 0.042 Å in the pilots' production floor, 0.0446 Å on the manifold route and 0.279 Å per BBA Cartesian coordinate. Every Å value shows its factor.
8. **αL.** Note 25's Cramér–Rao figures (0.90/1.27/0.79) are invalid. Show "37 visits, about 100–140 effective samples, about ±50%". E2 strikes the old numbers through.
9. **Counting long-range pairs.** There are 153 pairs with |i − j| ≥ 11, not 136.
10. **Superseded force readings.** status.md is stale on loud-mode forces. Pre-11-16 loud-mode simulations (#1088, #1089, #1091) carry the wrong volume term and get a badge. The full-schedule numbers come from open PR #1104 (one seed) and the PMF numbers from open PR #1138.
11. **Hypotheses that must stay labelled [H].** The #1137 prediction; the "share of reducible loss" criterion; "the barrier that may save"; anti-order worsening for longer chains; the soft force being inherited from higher levels.
12. **Unofficial derivations.** g2's Cartesian PCA of AK and the first-order wδ windows are the reader's own checks. Badge them "unofficial", or drop them if the user prefers.
13. **Toys must be labelled.** The thin-triangle geodesic, the SGD update counts and the chain model with uniform torsions are [I]/[D] toys, not BBA or ALDP5 measurements.
14. **Inherited defects.** Retention's "63% of width" is a variance fraction (79% of width). Retention 10's "Ricci flow: FALSE" pill disagrees with note 25 §8's grades. Neither is reused here.
15. **Excluded material.** Chignolin transfer cosines (0.996/0.990) come from ScoreMD's generated dummy data; they are excluded.
16. **Interaction overload and performance.** Five levers per video is a ceiling; extra freedom belongs in E1–E4. Ranges where picture and number would disagree are clamped (e ≥ 10⁻⁴, d ≤ 40, γ ∈ [0, 1]). Langevin snapshots (72 kB) stay well below the atlas's ~200 kB; E1's joint rebuild and wδ projection are precomputed, not solved per frame.

---

## 7. Build order

**G0 · Engine and kit groundwork** (≈4 days; prerequisite for everything).
1. Promote `leverSim`, `clock`, `track` and `paced` from u1-force `shared.js` into `src/engine/helpers.js`, copying rather than importing, because thesis code must not import `private/other`.
2. Promote `frame`, `axes`, `drawCurve`, `drawPath`, `readout`, `pill`, `stamp` and `legend` from `retention/shared.js` (PR #3) and u1-force into `src/draw/plot2d.js`.
3. New `src/draw/{clock,chain3d,badges,waterline,balance}.js`; `chain3d` uses a typed-array painter in the style of the atlas.
4. `explorable(scene, { prompt })`, plus a player boot flag that calls `view.startExplore(scene, scene.exploreFrom)` and shows the prompt and challenges instead of narration; the build emits `dist/explorables/<id>.html`.
5. Deep links `?video=<id>&t=<s>` in `main.js` and the player.
6. Adopt PR #3's `app.js` export change (narration in `window.video.scenes`, JPEG frames) and its lazy-load pattern. This is a hard dependency for narrated MP4.

**D0 · Data pipeline** (≈3 days). The scripts in §5.2 except LISE, plus the model tests of §5.1, written first, with thresholds fixed before the first run.

**MVP · E1 Erasure lab + P4-S00…S02 (+S04)** (≈5 days). It builds the instrument the whole programme reuses (clock, glyphs, hand lens, ghost hand), the BBA chain renderer, the chart encoders and decoders, the badges and the `explorable()` wrapper, and needs only `leverSim`, so the risk is low. Done means frames rendered and read every 4 s, `npm test` green (including the smoke test's live-scene determinism and control extremes), and a maths, visual and pacing review.

**Then**, each piece with its own maths, visual and pacing review (≈2 days per video):
- **P4 rest** (≈6 days). The reverse-path asset is requested from LISE in parallel.
- **P2** (≈7 days). The wδ and thin-triangle models are the heaviest new maths.
- **P3** (≈7 days). The SGD simulation and the cone.
- **P5** (≈6 days). The Langevin and radial simulations and the volume asset.
- **E2–E4** (≈2 days each). They reuse the models and scenes.
- **E0** (≈2 days).
- Narrated exports and README sections (≈3 days).

Total ≈ 60 working days. Parallel scene writers following the u1-force process (common brief, probe pages, three reviewers) compress the calendar but not the review.

**Dependencies.**
- PR #3 merged, or its `app.js`/`main.js` changes cherry-picked.
- LISE access for `reverse_path_s2.json` (the fallback is badged [I]).
- AK frames only if P2-S03's panel (c) gets a live chain (otherwise bars).
- If #1137 or #1136/#1113 report before P4/P5 lock, update the pills. The design leaves those slots as OPEN/H.
