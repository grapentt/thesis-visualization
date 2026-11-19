# d5 · Visual director's programme — "Every chart is a clock"

Designer d5, 2026-11-19. Angle: one visual language and one signature image per piece. Read: the brief, the
critic, the idea index, r1–r8, g1–g4 and a1–a3, plus primary files read-only (house `theme.js`, u1-force
`space.js`, retention `shared.js`, and in `LOCAL = /Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative`
the assets `runs/range-order-mechanisms-20261118b/*.json`, BBA/mdshare data and the #765/#768 evidence).

Tags: **[D]** derived (algebra, or a computation on a stated model), **[M]** measured, **[H]** hypothesis,
**[I]** illustrative, and **[S]** for a result cited from another paper (the repo's own convention, which the
brief's four tags do not cover). Each tag names its source: report § and primary file or PR.

---

## 1. Organizing idea

The project is the search for the right clock. Noise in a diffusion model is a clock that erases a
molecule's features one at a time, and each chart (Cartesian, wδ log distances, springs, whitened, internal,
ordered internal) sets it differently. What is destroyed going forward is decided going backward (r6 §2.2).
So every era can be drawn as one more lane on one picture, the **Erasure Clock**: a fixed rail in log-SNR,
labelled in t and identical in every piece. Each chart is a lane, and each feature is a glyph of fixed
colour at its half-erasure time. The trained band is clear water above a waterline at t_min; fog rises with
the noise. Its 3-D companion, the **Fog Bench**, shows one real molecule through a chart at the playhead's
noise: Cartesian noise frays the bonds while the outline survives, internal noise keeps the bonds crisp while
the chain end swings, and two gold arrows hold a protein's size before the chain settles. This fits the
project because its best-supported findings are claims about *when* things are erased: bonds below the
floor, synchronized erasure, anti-order, range and order, the wall as a range failure, and the blur dial for
forces. A fixed rail makes them comparable across five pieces without re-teaching the axis. It fits the
audience (the author, his supervisors, thesis readers) because each failure becomes a visible misplacement on
the clock, and the current approach becomes a correction you can see: warm local glyphs above the water, cool
global glyphs deepest in the fog.

---

## 2. Programme map

| # | Piece (`src/videos/<id>`) | Kind | Length | Eras | Purpose | Climax image |
|---|---|---|---|---|---|---|
| P2 | `part-2-ruler` · **The wrong ruler** | video, 2 live scenes | 11 min | pitch, Era 1, Sprint 10 | Euclidean arbitrariness; what wδ promised; why intrinsic wδ diffusion failed; what survived | **The odometer at the wall** |
| P3 | `part-3-lift` · **Lift, noise, project** | playable, 4 levers | 12 min | Eras 2–3 (ALDP5) | Part 1's promised spring metric: real stiffness under the real schedule; the ruler must turn with the bond; embedding; ALDP5 wins, limits and forces | **Round up there, molecular down here** |
| P4 | `part-4-halves` · **Two halves of a protein** | video, 2 live scenes | 11 min | Era 4 (BBA) | Learned warp; the 5 November correction; BBA splits local from global; autopsies; prediction ≠ generation | **The chain that collapses** |
| P5 | `part-5-order` · **Range and order** | playable, 5 levers | 15 min | Era 5 | Readability; order vs range; anti-order; one spectrum, two pulls; loud arrows; constraint split; size decided first; both halves | **Two arrows decide the fold** (programme climax) |
| P6 | `part-6-forces` · **One model, two uses** | playable, 3 levers | 12.5 min | now | Forces, the phantom spring, drift, the wall, two blind spots, handedness, count floors, what is open | **Two charts, two blind spots** |
| X1 | `explorables/erasure-clock.html` | explorable | — | all | Every lane; estimator lens; probe calculator; (γ, v) pad | — |
| X2 | `explorables/fog-bench.html` | explorable | — | P3–P6 | Frame × chart × t: ghosts, best linear guess, ellipsoids | — |

**Order and viewing paths.** The main path is Part 0 → Part 1 → *(Covariance, interlude)* → **P2 → P3** →
*(Retention, interlude)* → **P4 → P5 → P6**. Short path for a committee: P5 → P6 (15 + 12.5 min), with X1 as
the hand-out. P2 can be watched first for the history.

**Connections to existing pieces.**
- **Part 0:** P2 reuses its rigid-motion orbit collapse (`rigidMotion`), with rigid copies as muted ghosts
  (gold now means attention).
- **Part 1:** P3 opens on Part 1's last frame (its scene module imported as a still) and adds two correction
  ribbons. Part 1's log-σ axis *is* the rail: for variance-exploding noise, log-SNR = −2 log σ, so the morph
  in P3.1 is a relabelling.
- **Covariance** (PR #3): P3.4 uses Covariance 29's lift-into-3D camera; P3.3 links its holonomy scene (27).
- **Retention** (PR #3): P5.0 morphs Retention 06's three channels into three rail lanes; P5.1 rebuilds
  Retention 05's posterior cloud on BBA. Lavender hands over to fog-white by a morph.
- **Atlas** is linked from P3.3. **Interactions'** weighted ghost molecules (scene 02) are the template for
  P5.1. **Bundles** is not used.

**Recurring devices** (§4): the rail (waterline, fog, decision bars); the warm-to-cool scale ramp; glyphs with
moon fill; chart emblems; the Fog Bench and its four honest erasure renderings; one noise dial; the noise
ruler; badges and correction ribbons; κ and estimator chips; the 3-D BBA chain with gold mode arrow fields and
authored orbits; the swimlane map; data and budget stamps.

---

## 3. Piece-by-piece storyboards

Per scene: *Screen* · *Computed* (IDs in §5) · *Numbers* · *Beat* · *Live* · *Transition*; ★ = climax.
Durations assume 1.6–2.2 words/s of narration.

### P2 · The wrong ruler (≈11 min; levers: flatness e, sub-steps S)

**2.0 Two papers, one gap · 40 s.**
- *Screen:* two cards. Left, **ScoreMD**: a flat ℝ³ᴺ cloud with an isotropic noise ball; chips "generator",
  "forces", "Fokker–Planck". Right, **Diepeveen 2024**: a curved sheet with a curve between two AK frames;
  chips "geometry", "no generator". Between them a gold-outlined empty cell, "a generator on the curved space".
  The swimlane map flashes with Era 1 lit.
- *Numbers:* ScoreMD on BBA: the regulariser that makes simulation consistent raises iid PMF error 0.034 →
  0.234 [S ScoreMD Table 1/15; g1 §4.1].
- *Beat:* the thesis set out to fill the empty cell and to make one model serve as sampler and force field.
- *Transition:* the empty cell zooms into Part 1's five-atom molecule.

**2.1 One ruler for everything · 75 s.**
- *Screen:* the toy molecule left (element colours; stamp "TOY · energy.js, illustrative constants"); right,
  two axes "‖Δx‖ (Å)" and "U (k_BT)" threaded to each configuration (information-geometry 01 idiom). Three
  short builds: (a) rotamers; (b) stretch vs torsion; (c) a rigid motion, where ‖Δx‖ grows and U stays fixed.
- *Computed:* C19.
- *Numbers:* (a) rotamers 1.75 Å apart; the straight midpoint shrinks O–H 0.96 → 0.40 Å at U = 3.27 eV
  ≈ 126 k_BT, while the torsion path keeps 0.96 Å at ≈ 0.10 eV. (b) A 0.1 Å stretch is 0.11 Å away and costs
  4 k_BT; a 1.0 Å torsion arc is 0.95 Å away and costs 1.7 k_BT. Euclid calls the stretch 8.5× closer; the
  energy calls it 2.4× costlier [D a1 §6.1].
- *Beat:* Euclidean distance ranks configurations against the physics.
- *Transition:* the "‖Δx‖" axis label dissolves to "?".

**2.2 A ruler that measures percentages · 70 s.**
- *Screen:* a 1.5 Å bond and a 5 Å pair, each pulled by +0.1 Å, with Euclid and wδ cost bars and an Å ↔ nm
  toggle. The wδ formula builds from parts (underbraces: "pair distances, in percent"; "overall spread"). Then
  five-bead ALDP5's F(X) as 10 teal log-distance bars and 1 log-det bar.
- *Computed:* C11, C10a.
- *Numbers:* wδ cost 0.004165 vs 0.000392 (10.6×) for the same 0.1 Å [D r1 E5]. Euclid's numbers scale ×0.1
  under Å → nm; wδ stays 0.222685 [D r1 E5].
- *Beat:* wδ measures relative deformation and does not care about units.
- *Transition:* the bars stand up as the axes of a flat feature space.

**2.3 The straightening hope · 70 s.**
- *Screen:* 3-D cartoon (stamped "the real image is 9-d in 11-d"): the image of shape space as a curved sheet
  in feature space; a chord between two image points, dropped back onto the sheet: "the w-geodesic is the
  realizable molecule nearest the straight feature chord." Then two cited cards and the "curved valley →
  straightened valley" slide (ThesisDiscussionFrank2, slide 6), redrawn and stamped ◌.
- *Computed:* C10b (projected chord on a three-bead toy).
- *Numbers:* AK rank-1 tangent PCA "about 85%", "about 1 Å"; nsp13 rank 7 [S Diepeveen 2024; g2 §4.1].
- *Beat:* the hope was that geometry makes molecular motion straight and the score simple.
- *Transition:* "to diffuse on that sheet you must add noise on it."

**2.4 A machine to add noise · 80 s (live).**
- *Screen:* Split. Left: flat noising as one line, `x_t = α_t x_0 + σ_t ε`. Right: the intrinsic route as a
  machine (llm-soc `codeBlock` with connectors): frame E = Q_h Λ_h^{−1/2} → Verlet sub-steps → a dense solve
  per sub-step → × T walk steps → × 500–1,000 reverse steps, with a climbing solve counter and log cost bars.
  Then the live toy: one geodesic shot on the five-point family of 2.5 at e = 0.05.
- *Computed:* C10c (wδ metric H = A + δB and geodesic ODE on 5 points).
- *Numbers:* 0.74 s (flat) vs ≈253 s (exp-split, ≈340×) vs ≈445 s (float64, ≈600×) per sample [M r1 §4.3,
  Sprint 7]. Chord-bound violations 38.3% at 8 sub-steps vs 2.34% at 128 [M r1 E14]. Live readouts: the
  chord-bound residual and the scale error [D], computed from the toy.
- *Beat:* on a curved space even adding noise is a numerical problem, and choosing a step is not error
  control.
- *Live:* lever "sub-steps S" (8 → 128). The narrator moves it once, then hands over.
- *Transition:* the direction where the solver struggles is the near-planar one.

**2.5 ★ The odometer at the wall · 95 s (live).**
- *Screen:* the five-point cloud X_e = ((1,0,e),(−1,0,e),(0,1,−e),(0,−1,−e),(0,0,0)) in 3-D, centre
  stage, on an authored orbit (yaw 0.4 → 0.9). It flattens as e runs log-uniformly from 0.5 to 10⁻⁴. Below it,
  an ink Euclidean odometer, a teal wδ odometer, and a condition-number gauge; the bound
  |Δ log det G| ≤ d_g/√δ fades in. The reveal: a translucent heap of 800,000 real ALDP5 frames (a log
  histogram of λ_min(G_X)/tr G_X) piles against a glowing wall labelled "∞ in wδ". A phantom bead
  (x_v = Cα + 1.5 Å n̂) appears, and the heap leaves the wall.
- *Computed:* C10a, C10d; asset A10b.
- *Numbers:* Euclidean distance creeps to 1.0. wδ distance runs 3.2489 (e = 0.1) → 7.8377 (0.01) → 12.4378
  (0.001) → 17.0407 (10⁻⁴) [D r1 E1]. Condition 42.1 (e = 0.5) → 6.0 × 10⁷ (0.01), growing as e⁻⁴ [D r1 E1].
  Real worst condition: five beads 1.55 × 10⁶ vs six beads 4.2 × 10³ [M Sprint 7 summary]. Phantom bead:
  dilation constant √46 → √51, plus 3 extra noised directions [D r1 E6, M21].
- *Beat:* wδ puts infinity exactly where the dipeptide's data live.
- *Live:* lever "flatness e" (a log slider). The narrator flattens the cloud first, then hands over once.
- *Climax image:* the squashed five-bead cloud, the teal needle past 17, and 800,000 faint frames heaped
  against the wall.
- *Transition:* "the phantom bead made sampling finite — finite is not correct."

**2.6 Finite is not correct; the moving baseline · 90 s.**
- *Screen:* a scoreboard timeline, August → October (φ/ψ JS, log y), wδ in teal and flat in ink, chipped
  "indicative: N, n and conventions differ". At 2026-10-02 an event marker, "vp_mean target fix", and the flat
  points drop. A correction ribbon over the S1 card: "the comparator was defective."
- *Numbers:*
  - S1 (ALDP n = 6): wδ·GRW+OU 0.117 ± 0.007 vs identity·GRW+OU 0.479 ± 0.005 [M r1 §4.1].
  - S5: wδ 0.103 ± 0.009 vs flat 0.263/0.268 [M].
  - S7: finite fraction 0.9996 but JS 0.325 [M].
  - After the fix: flat 0.1012, ScoreMD-native 0.0151 vs floor 0.0114 [M Sprint 8 head-to-head].
  - Sprint 9 bonds: mean bond W1 0.239–0.558 Å against a W1 floor ≈ 0.005 Å [M #474]. This is shown as W1
    against its floor, never as "too broad" (critic).
- *Beat:* the early win was measured against a broken baseline.
- *Transition:* the scoreboard freezes on 2026-10-19: "then we re-examined the founding evidence."

**2.7 The famous figure, with its missing baseline · 80 s.**
- *Screen:* AK closed → open in three rows (MD frame, wδ interpolation, Cartesian chord) at t = 0.25 / 0.5 /
  0.75, as Cα tubes. An RMSD bar pair; an adjacent-Cα bar pair (wδ wins); Cartesian PCA and wδ tangent-PCA
  scree curves, which lie on top of each other.
- *Computed:* asset A11; C10b.
- *Numbers:*
  - Mean RMSD over frames 25/50/75: Cartesian chord 1.784 vs wδ 2.053 Å [M aldp-reference-metric-evaluation].
  - Adjacent-Cα RMSE 0.144 vs 0.077 Å [M #513].
  - PC1 variance share: Cartesian 0.8934 [M, recomputed by A11] vs wδ tangent PCA 0.8927 [M ProteinAtlas
    report, earlier run, chip "not re-verified"].
  - The AK input is a DIMS directed transition [M #513].
- *Beat:* the compression came from the directed data, not the metric. wδ's real advantage is local: it keeps
  neighbours apart.
- *Transition:* a foreshadow chip, "keeps neighbours apart → Part 6".

**2.8 What survived · 50 s.**
- *Screen:* the 2026-10-22 closeout card; the reframing question in gold, "What should a metric do to the
  noise?" (note 20, 10-23); two seed cards, "the features work as a cheap embedding (Sprint 12)" and "log
  distances keep neighbours apart"; the Era 1 lane closes.
- *Numbers:* "flat Cartesian stays the default; wδ becomes a restricted-domain reference" [M #520].
- *Beat:* the failure re-posed the question.
- *Transition:* the gold question card becomes P3's title.

### P3 · Lift, noise, project (≈12 min; levers: noise dial t, stiffness ratio, region ρ, read-out level t*)

**3.0 Where Part 1 stopped · 55 s.**
- *Screen:* Part 1 scene 14's table and gold "G = K" box (imported scene). Two correction ribbons: (1) "one
  wrong ruler, two sides": per level the covector side over-charges stiff errors ×κ, and the vector side means
  the loss barely sees bonds, but integrated over levels the over-charge is about 1.5×; (2) "κ = 400 was a
  toy", with κ_Σ chips for one basin and for all data.
- *Numbers:* 17.5 vs 11.4 (≈1.5×) [D note 21 §6; r2 §3.9]. κ_Σ = 100–200 in a basin, ≈920 across data [M
  note 20, bgmol]. Part 1's 400 carries the tag [I].
- *Beat:* stiffness is real, but the fix must start from the noise.
- *Transition:* the two toy modes multiply into nine.

**3.1 Nine rulers in the fog · 110 s (live).**
- *Screen:* Part 1 Problem 1's layout, reused on purpose. Left: five-bead ALDP5 (stamp "ALDP5 · mdshare
  traj. 1"), its nine principal directions drawn one by one as arrow fields, and nine rulers (bars of width w_k
  on a log Å scale). Right: Part 1's log-σ axis morphs into the rail, now holding nine curves r_k(t), nine moon
  glyphs and the waterline at t_min = 0.01. Bottom: training-share bars. Lens "metric-shaped noise": all nine
  curves slide onto t½ = 0.259.
- *Computed:* C1, C2, C21 (training share); asset A7.
- *Numbers:*
  - Widths 0.0252 … 0.6631 Å [M force-field evidence `mode_std_A`]. Noise unit 0.9418 Å [M DATA_STATE].
  - t½ = 0.0048, 0.0061, 0.0099, 0.014, 0.018, 0.037, 0.057, 0.108, 0.196 [D g1 §3.1]. The three stiffest
    are below the waterline.
  - r(0.01) = 0.26 … 1.00 [D].
  - Training share 0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9, 18.8% vs 25.2% under metric-shaped noise [D, C21 on
    the same nine modes].
- *Beat:* under the trusted schedule, flat noise erases ALDP5's bonds before training begins.
- *Live:* lever "noise dial t", the universal handle introduced here. Lens "metric-shaped noise". A ◌ chip
  stays on screen: "all together — is that what we want? → Part 5".
- *Transition:* "metric-shaped — by which metric?"

**3.2 Why the ruler must turn with the bond · 75 s.**
- *Screen:* a tumbling diatomic with a fixed ellipse ruler beside one glued to the bond. Lemma 2 as a
  sentence: "a constant equivariant metric is A ⊗ I₃: it cannot be stiff along a bond and soft across it."
  κ_res bars; then the glued ruler sweeps a cone, with a curvature readout.
- *Computed:* C12.
- *Numbers:* κ_res for β/C7eq and αR: flat 192/112; fixed global Σ⁻¹ 273/477 (worse than flat); spring metric
  9.6/7.6 [M note 20 §5.3, bgmol windows]. Cone curvature K_tan = 4w/(γ(γ+2w)r²) = 0.0293 Å⁻² at w = 1400,
  γ = 30, r = 1.5 Å [D note 22].
- *Beat:* a stiffness ruler must rotate with the molecule, so it is curved.
- *Transition:* "curved — can we flatten it?"

**3.3 You cannot flatten an orange peel · 70 s (live).**
- *Screen:* the bond-direction sphere as a thin shell; four points at distance ρ are laid flat, and the
  distortion readout tracks Kρ²/12 and Kρ²/3. Link: "Atlas: the topological version".
- *Computed:* C13.
- *Numbers:*
  - Sphere radius r₀/σ_⊥ = 5.81 thermal widths [D r3 E1].
  - Exact four-point ε = 0.0076 at θ = 0.3 rad and 0.16 at 1.2 rad [D note 22 table].
  - Equivariant flat maps of one bond err by 14–56%, against 2–11% for S² × ℝ [D note 22 §5.3].
  - On ALDP5 within a basin, the error is a few percent [D note 22 §5.4].
- *Beat:* an equal-dimension flat chart must distort a curved ruler, and equivariance makes the region global.
- *Live:* lever "region ρ".
- *Transition:* "so add a dimension."

**3.4 ★ Lift, noise, project · 110 s (live).**
- *Screen:* 3-D, Covariance 29's camera style. A planar bond vector b ∈ ℝ² on the floor grid; the floor
  lifts onto the cone F(b) = (√w |b|, √(γ/2) b), first exaggerated (w/(γ/2) = 3, half-angle 30°), then at the
  real 5.9°. Thermal samples lie on the cone. A gold isotropic noise ball at one point projects onto the cone
  and drops to the floor as a needle-thin ellipse. Beside it, flat noise makes a round blob that wrecks the
  bond length. One authored 40° orbit, then a hold. Then a card: "the spring metric is the Hessian at rest,
  G = Jᵀ W J", assembled with Part 1's formula flight on the repo's own network. Closing line: "noise in feature
  space is one line, y_t = α y_0 + σ ε" (a callback to 2.4's machine).
- *Computed:* C12, C14.
- *Numbers:* radial/tangential std ratio c = √(γ/(γ+2w)) = 0.103 [D r3 E2]. Toy network: internal Hessian
  eigenvalues 0.0264 … 53.99 eV/Å², κ_H ≈ 2,050, stamped "TOY", never compared with ALDP5 κs [D g4 §3.2]. A
  caveat note: "a 2-D cone is flat; curvature needs the 3-D bond direction" [D r3 E2].
- *Beat:* round noise up there is molecule-shaped noise down here, with an exact Gaussian kernel. This is
  Part 1's promise, G ≈ K, delivered.
- *Live:* lever "stiffness ratio w/(γ/2)" (1 → 93.3; c from 0.71 to 0.103).
- *Climax image:* a gold sphere on a steep cone casting a needle-thin shadow on the bond plane, next to the
  round blob of flat noise.
- *Transition:* "one bond is a cone; ALDP5 has many springs: the same lift, all at once."

**3.5 The race · 90 s.**
- *Screen:* four ALDP5 bond histograms per arm (flat low floor vs spring) stepped through ten saved
  checkpoints (250 → 200,000). A log–log bond-W1 curve is built with flat first, spring swapped in later;
  grey floor bands; the production-floor curve rises, with a Tweedie inset w/√(w² + s²).
- *Computed:* asset A8; C9.
- *Numbers:*
  - Bond W1/width at 1k/5k/20k/200k: flat low floor 0.186/0.068/0.046/0.015; spring
    0.018/0.013/0.012/0.013 [M #765].
  - Production floor 0.981 → 0.422 [M].
  - Torsion JS at 200k: 0.0207 vs 0.0201 [M].
  - Tweedie narrowing predicted 0.39–0.46, observed 0.44–0.53 [D/M feature-space-evaluation §4].
- *Beat:* stiff modes are learned about 100× sooner; torsions are not.
- *Transition:* "the same weights are also a force field."

**3.6 One model, two uses: the blur dial · 110 s (live simulation).**
- *Screen:* nine Gaussian histograms and a read-out dial t* (marks at 10⁻⁵ … 0.05). A seeded overdamped
  Langevin run of the nine modes under F_t = r_k(t*) F_0: stiff histograms balloon to w/√r, soft ones stay.
  Then measured panels: per-direction Stein ratios, and the consistency diagonal (iid vs simulation error, with
  points animating off or onto y = x).
- *Computed:* C8 (simulation); asset A9.
- *Numbers:*
  - Inflation at t* = 0.01: 1.95, 1.75, 1.42 … 1.00 [D g1 §3.1].
  - Thermal units: r(0.03) = 0.988, inflation 1.006 [D].
  - Stein ratios, stiffest three directions: flat production floor 0.198/0.252/0.293 vs spring
    0.991/1.000/1.013 (seed 0) [M #768].
  - Simulated bond W1/width: flat production 1.105 vs spring 0.064 (floor 0.017). Flat low floor drifts to 83%
    αR (MD 35%) [M #768].
- *Beat:* a model is both sampler and force field only if every mode is readable at one noise level. On
  ALDP5, metric-shaped coordinates achieve that.
- *Live:* lever "read-out level t*" (the simulation uses it). Lens "units".
- *Transition:* "what it did not fix."

**3.7 Faster, not better · 80 s.**
- *Screen:* three honest cards: the αL barcode (three 250 ns mdshare strips, visits as ticks); "flat catches
  up with long training"; "much of the gain is simple global whitening". A κ sidebar keeps two before → after
  pairs apart.
- *Computed:* asset A10.
- *Numbers:*
  - 37 visits per trajectory; about 100–140 effectively independent samples; populations 3.24/1.65/4.11%;
    "one trajectory pins αL to about ±50%: 95% interval 0.4–7.0% around 3.2%" [M #779, g4 §4.3 canon].
  - Invariant whitening iid bond widths 0.989–1.010 [M #808/#810].
  - κ_res 192 → 9.6 (bgmol window) vs κ_step 184 → 2.99 (mdshare 1 ps steps, floor 1.55) [M; g4 §4.1].
- *Beat:* on ALDP5 the win was speed in the stiff modes, not the hard part.
- *Transition:* "a dipeptide has no separation between local and global; a protein does."

### P4 · Two halves of a protein (≈11 min; levers: lag τ, score base)

**4.0 Meet BBA · 55 s.**
- *Screen:* a 400-frame window of real DESRES BBA (28 Cα) folding and unfolding in 3-D on a slow authored
  orbit; hairpin (beads 0–12) and helix (14–25) bracketed once; an Rg trace with the data mean and deciles.
- *Computed:* asset A5b (trajectory rebuilt by membership id).
- *Numbers:* mean Rg 10.60 Å; deciles 8.60/9.89/13.74 Å [M r7 §0]. 1,300,156 training frames, 200 ps per
  frame (documented, not measured) [M r8 §6A].
- *Beat:* a protein has two scales, the local chain and the fold.

**4.1 A lens that makes every step round · 70 s.**
- *Screen:* ALDP5 1 ps step ellipses morph into near-circles under the learned warp; a κ_step ladder; the
  warp's top-4 magnified directions drawn beside the bond-stretch gradients.
- *Numbers:* κ_step 184 (flat) → 24.6 (constant whitening) → 3.9 (scaled internal) → 2.99 (learned), floor
  1.55 [M learned-stiffness-warp.md, mdshare]. Overlap with bonds 0.973 (chance 0.444) [M].
- *Beat:* a flow fitted only to 1 ps steps rediscovers the stiff chemistry.

**4.2 The plot twist of 5 November · 110 s (live).**
- *Screen:* a lag dial τ ∈ {1, 10, 100} ps with step-width bars, then Ramachandran maps after 100 updates.
  The first explanation card, "synchronized erasure", is struck by a same-day correction ribbon,
  "Gaussianization". 1-D demo: a bimodal ψ marginal pressed through its CDF and Φ⁻¹ into a bell; its score turns
  into a straight line. Then Diepeveen 2025's squeezed banana: the straight line between two likely points dives
  through improbable land, while in the Gaussianizing chart the valley is straight. P2.3's cartoon returns with
  its ◌ badge turned ◆. Limits close the scene.
- *Computed:* C17; C22 (banana); asset A12a (lag-sweep table).
- *Numbers:*
  - ψ step 17.9° → 31.7° → 63.4°; bonds 0.024–0.031 Å at every lag [M lag sweep].
  - Lag dictionary at τ = 1 ps: (1, 1, 1.02, 2.12), a spread of 2.1 against 400 under flat noise [D note 25].
  - Torsion JS at 100 updates: flat 0.117, 1/10/100 ps warp 0.127/0.049/0.027; spring γ = 30/8/2
    0.133/0.149/0.163 [M #936].
  - KL to Gaussian 0.96 → 0.14 and bimodality 0.80 → 0.37 [M].
  - Gaussianized torsions 0.042 vs control 0.255 [M].
  - Banana: the straight line peaks at ψ = 40.5 vs ≤ 1.125 along the geodesic [D g2 E2].
  - Limits: at 20,000 updates flat 0.0203 beats warp 0.0230; αL saddle 30 vs 4–6 per 10⁴ [M].
- *Beat:* the straightening dream came true as Gaussianization: faster early, not better late.
- *Live:* lever "lag τ" (`leverSim` over the table).

**4.3 Two halves · 80 s.**
- *Screen:* a log–log plane of bond W1 vs Rg W1. ALDP5 points cluster near the floor; BBA points separate into
  quadrants. Glyph markers per chart family (§4.2). The "+ distances" arrow moves Cartesian down.
- *Computed:* asset A13.
- *Numbers:* Sprint 12 first chunk, 190,350 updates, seed 0 [M internal.md, matched-results 2026-11-09]:
  internal bond 0.000274 Å, Rg 0.521 Å; Cartesian bond 0.415 Å, Rg 0.072 Å; springs and whitening failed
  outright. Distance inputs: Cartesian bond 0.42 → 0.0078 Å (54×, 190,350 updates) [M #985].
- *Beat:* every map got one half of the protein right.

**4.4 Four autopsies · 120 s.**
- *Screen:* three small panels, one gesture each. (a) **Springs under water:** channel bars sink below a
  waterline when divided by one global RMS. (b) **Noise that leaves the molecule:** a 1-D wire (the molecular
  image) in 3-D with noise balls, tangent part gold, normal part grey, normal arrows growing as σ → 0. (c) **A
  turning bond looks compressed:** the chord's radial part L(cos θ − 1) grows as a bond sweeps.
- *Computed:* C1, C23.
- *Numbers:*
  - (a) Divisor 27.1 (BBA) vs 1.31 (ALDP5); channel sd 0.037 < σ(t_min) 0.045, half erased at t ≈ 0.0077
    [M #1025; D r3 E22].
  - (b) 3,303 features for 78 shape directions; tangent share of the low-noise loss 0.06; loss
    911 → 904 → 759; α/σ = 22 at t = 0.01 [M #1025; D note 28].
  - (c) BBA "1 ps" pairs are 200 ps chords: linearized 0.83 vs actual 0.081 Å [M r4 V21].
- *Beat:* each map failed for a measurable reason.

**4.5 ★ The chain that collapses · 90 s (live Monte Carlo).**
- *Screen:* three 28-bead chains side by side, bonds (3.8 Å) and angles fixed at their means, so the local
  geometry is identical and perfect. Torsion Monte Carlo under three bases: free; an isotropic Gaussian pull;
  the covariance-matched Gaussian (K ⊗ I₃). The middle chain balls up to half size. Each chain has a violet
  gyration sphere and a live Rg readout beside its #1025 target.
- *Computed:* C24.
- *Numbers:* data Rg 10.59 ± 2.20 Å [M]; torsion-MC targets free 10.34 ± 2.26, isotropic 5.41 ± 0.51,
  matched 10.71 ± 1.92 Å [D #1025]. Live values are computed [D].
- *Beat:* right locally, wrong collectively. Size must be prior-matched in its own direction.
- *Live:* lever "score base" (a choice that the simulation `uses`; restart events per choice).
- *Climax image:* three chains with identical perfect sticks; one collapsed to half the size.

**4.6 Size is a sum over distant pairs · 75 s.**
- *Screen:* the identity Rg² = Σ_{a,b} min(a,b)(N − max(a,b))/N² b_a·b_b is built. A 27 × 27 weight heat map
  (violet ramp) is shown, then the generated-minus-data band map, accumulating outward from the diagonal.
- *Computed:* C15; asset A14.
- *Numbers:* C3's excess squared size lives 92% in pairs at least 11 apart [M #1010–#1015 via r6 §1.1]. There
  are 153 such pairs (|i − j| ≥ 11), not 136 [D g4 §3.14].
- *Beat:* local marginals cannot fix a global sum.

**4.7 Prediction is not generation · 60 s.**
- *Screen:* a scatter. x = improvement of each line's own objective; y = change in BBA size error. A grey band
  shows the ±0.046 Å spread of identical initializations. Then the empty rail fades in: "it is not how much the
  noise erases, but when."
- *Numbers:* about 30 objective changes; none at 10,000 updates improved size by more than 0.18 Å [M
  learned-embedding-objectives].
- *Beat:* a better target is not a better molecule.
- *Transition:* the empty rail becomes P5's cold open.

### P5 · Range and order (≈15 min; levers: noise dial t, (γ, v) pad, block size K, loudness L²; lens: chart)

**5.0 Every chart is a clock · 45 s.**
- *Screen:* Retention 06's three channel curves (re-rendered from PR #3's `toy.js`); their σ½ dots slide onto
  three lanes of the empty rail while lavender morphs into the feature hues.
- *Numbers:* flat bond 0.056 before torsion 0.335 before basin 1.06 (multipliers, toy) [D g4 §3.12,
  stamped TOY].
- *Beat:* what matters is when each feature is erased.

**5.1 What a noisy molecule still knows · 100 s.**
- *Screen:* a held-out BBA frame noised at t, and the formula R_h(t) = Var(E[h | Y_t])/Var(h). The estimator
  opens: training frames as ghost molecules with alpha ∝ exp(−‖y − α y₀⁽ⁱ⁾‖²/2σ²), plus an ESS counter. A
  leakage panel, then a mirror: the rail reflects into a reverse rail, "destroyed forward = decided backward".
- *Computed:* C25 (empirical posterior on a 20,000-frame bank for the display); C2.
- *Numbers:*
  - ESS ≈ 700 in Cartesian vs ≈ 1 in the 103-d chart [M note 27 §4].
  - C3 Rg R² at t = 0.05: 0.82 → 0.34 → 0.14 → −0.03 at exclusion ±10 ns / ±100 ns / ±1 µs [M note 27 §4].
  - R = ½ guarantees at least ½ log 2 ≈ 0.35 nats [D note 27].
- *Beat:* readability is measurable without training, and it equals what exact generation has decided.

**5.2 Order without range · 80 s (live).**
- *Screen:* the Cartesian lane fills: glyphs run warm → cool, the waterline sits at 10⁻⁵, and the training
  sparkline is nearly dark at the bond glyph. On the Fog Bench, 12 ghosts at t = 0.005 fray the sticks into
  orange spindles while the outline holds; "best linear guess" shows the outline first.
- *Computed:* C1, C2, C21, C26 (ghosts), C27 (best linear guess); asset A2 (lanes).
- *Numbers:*
  - Measured envelope: bond 0.0004, angle 0.05, torsion 0.08, contact count 0.38, long-range 0.44,
    end-to-end 0.45, Rg 0.47 [M note 27 §5].
  - The bond window holds 0.04% of uniform training draws [D r6 §2.3].
  - Noise ruler at t = 0.005: σ/α · 6.252 Å = 0.17 Å per coordinate, against bond thermal width 0.057 Å [D].
- *Beat:* Cartesian noise erases in the right order, but it erases bonds where training cannot see them.
- *Live:* lever "noise dial t"; lens "chart" (Cartesian is preselected).

**5.3 Range without order, and anti-order · 110 s (live).**
- *Screen:* the C3 lane fills: everything bunches inside 0.18–0.35, colours running backwards (cool left of
  warm). On the Fog Bench at t = 0.05 and 0.2 the sticks stay crisp while the chain ends fan out; a lever-arm
  inset shows a 6.6° torsion swinging a distant bead about 1 Å. Then anti-order made exact: a readability heat
  map of b_k·b_{k+m} (m on x, t on y) from the exact chain model, fading as r^j, with R = Σ c_j r^j / Σ c_j.
- *Computed:* C5; assets A2, A3.
- *Numbers:*
  - C3 measured: bond 0.26, angle 0.35, torsion 0.35, Rg 0.27–0.28, long-range 0.24, contact count 0.23,
    end-to-end 0.18 [M note 27 §5].
  - Chain model at t = 0.2: one torsion 0.716, m = 4: 0.469, m = 12: 0.082, m = 26: 0.004, Rg² 0.436 [D note 30
    Prop. 1; `exact-uniform.json`].
  - Lever arm: 6.6° at t = 0.05 → 0.58–1.16 Å over 5–10 Å [D r7 E8].
- *Beat:* internal coordinates erase the fold before the joints that build it.

**5.4 One spectrum, two pulls · 100 s (live).**
- *Screen:* BBA's 27 collective-mode variances as log bars under a rising noise floor σ²/α², each bar's t½
  tick landing on the rail. Captions: "stiffness removal says flatten" [S Ahamed 2026, EDM] and "noise order
  says keep it steep" [S Biroli; Wang & Vastola]. Then the **(γ, v) pad**, with corners "order, no range"
  (γ = 0, small v), "range, no order" (γ = 1, v = 1, = C1) and "both" (γ = 0, v = 1). Dragging the dot moves
  the glyphs live: collective glyphs follow γ, stiff glyphs follow v. Note: "torsions have no channel of their
  own here." The four trained points (v = 1) appear with their Rg W1.
- *Computed:* C2, C3, C4; asset A1.
- *Numbers:*
  - Variance ratio 1,423 → 232 → 38 → 6.1 → 1. First/last t½ 0.53/0.028 → 0.50/0.065 → 0.45/0.13 →
    0.37/0.20 → 0.26/0.26 [D note 27 §3].
  - v = 1/0.3/0.1/0.03 → t½ 0.26/0.16/0.09/0.05 [D #1057 note §2.6].
  - Trained at 50,000 updates (one seed per γ except γ = 1): Rg W1 0.51/0.19/0.12/0.08 Å for
    γ = 1/0.5/0.25/0; bonds 0.0005–0.0008 Å throughout [M #1057].
- *Beat:* unit variance in every direction is what erases the order. Local whitening is not the problem.
- *Live:* lever "(γ, v) pad", one drag gesture (`leverSim(['gamma','v'])`).

**5.5 Two loud arrows · 110 s (live).**
- *Screen:* the 3-D BBA frame. Mode 1 as a smooth gold arrow field: parallel arrows whose lengths follow a
  cosine along the chain and change sign after bead 14 ("the two halves separate"). Then mode 2 ("ends against
  middle"), then the block: a₁ and a₂ as bold gold arrows from the centroid. Insets: bead weights against the
  Rouse cosines √(2/N) cos(πp(i + ½)/N); a loudness ruler with mode-length bars poking above the torsion line
  (2.0); the block-size curve.
- *Computed:* C28 (bead weights), C7; assets A1, A2.
- *Numbers:*
  - Rouse overlaps 0.991/0.985/0.914/0.915 [M `bba_charts.json`].
  - Mode-length conformational variances 6.86/2.52/0.94/0.60 vs torsion loudness 2.0 [M].
  - Shares of mean squared size 56/22/11/5% [M]; size-response shares 83%, 96% for modes 1–2 [D note 30 §5].
  - Block size K = 0/1/2/4/8/16/27: Rg W1 0.477/0.161/0.105/0.136/0.152/0.325/0.399 Å [M #1057/#1069; one
    seed at 1, 16, 27]; derived input channels 0/1/3/14/92/696/3,303 and constraint directions
    0/1/3/9/21/45/78 [D r6 §2.9, §2.12].
- *Beat:* two arrows carry the size, and they are the chain's own Rouse modes.
- *Live:* lever "block size K" (a table lookup via `leverSim`). Hand-over after the narrator steps K from 0
  to 27.

**5.6 Who corrects whom · 90 s (live).**
- *Screen:* the joint image y_B = g(y_A) as a line of slope L in the (A, B) plane, a noise blob, and the
  normal n ∝ (−L, 1), whose projections become two bars on a tilting seesaw. Then "same area, different
  profile": the collapse-signal density over t for the internal chart and for the natural block, both shaded
  violet, with an equal-area readout.
- *Computed:* C6; assets A2, A4.
- *Numbers:*
  - |P_A n|² = L²/(1 + L²): 0.50/0.94/0.98 at L² = 1/16/63 [D note 30 Prop. 2].
  - Chain-model gains: internal 0.43–0.55 / 0.85–1.03 / 0.90–1.09; block 0.43–0.56 / 0.06–0.09 / 0.02–0.03
    [D lab 11-18].
  - BBA constraint directions lying in the internal block: 74/87/96% natural, 27/44/68% whitened, 92/97/99%
    twice as loud [M].
  - KL 0.0766 nats in both charts (within 3%); per example at t = 0.01, collapse 0.0005 vs constraint 0.92
    [D `signal-*.json`].
  - ◌ the pending test: "a whitened block keeps about half the gain" [H #1137, declared].
- *Beat:* the louder block leaves the correction to the quieter one: a whisper becomes a shout.
- *Live:* lever "loudness L²" (1 → 63).

**5.7 ★ Two arrows decide the fold · 120 s.**
- *Screen:* the 3-D BBA frame fills the stage, the ordered lane on the rail below. The playhead runs right to
  left from t = 0.8 to 0.01 over 60 s as the camera orbits (yaw 0.3 → 1.0), holding 1.5 s at each
  crystallization.
  - Twelve **reverse paths that all end at this molecule**: the exact forward paths (12 seeds) in the ordered
    chart, played backward. The chain is decoded internal-only and aligned; the gold arrows come from the 6
    block channels (best linear guess).
  - At t ≈ 0.5 the twelve arrow pairs agree while the chains still writhe. At 0.35–0.26 the chains settle and
    the torsion, angle and bond glyphs crystallize.
  - Gauges show ghost scatter against each feature's natural spread, with each crossing marked on the rail.
  - Beside the bench, measured trained-model gauges: the R² of chain |a₁| on block |a₁|, the mean |a₁| of block
    and chain, and the share of compact molecules already showing their final χ. The predicted takeover window
    0.26–0.1 is marked on the rail; the measured 0.13 lands inside it.
- *Computed:* C26, C27, C28, C29; assets A1, A6, A5a, A17.
- *Numbers:*
  - Mode-1 t½ = 0.52 and torsions 0.34 (first order); bonds 0.26 [D `bba_charts.json`]; block-alone Rg window
    ≥ 0.42 [M note 27].
  - Trained gauges, seed 2 [M #1133]: R² 0.13 (t = 0.6) → 0.63 (0.13) → 0.97 (0.01); mean |a₁| block/chain
    21/59 Å at 0.6 and 40/41 Å at 0.13; final-χ share 0.55 → 0.88.
- *Beat:* generation decides the size first; the chain then falls in line.
- *Climax image:* twelve writhing grey chains around two steady gold arrows, collapsing onto the arrows'
  frame as the glyphs fill right to left.

**5.8 Two halves, one model · 90 s.**
- *Screen:* a log–log Pareto plane (angle W1 vs Rg W1; seed pairs as dumbbells; the floor dot), an arrow
  C3 → ordered ("add two arrows"), budget paths along a budget-clock bar (2.6/10/20/100%), bonds and PMF
  sidebars.
- *Computed:* assets A13, A15.
- *Numbers:*
  - Registered budget, 190,350 updates, 100,000 molecules [M real-budget-study]: ordered 0.20/0.19°,
    0.117/0.091 Å; C3 0.21/0.18°, 0.455/0.418; Cartesian + distances 1.58/1.49°, 0.071/0.077; covariance base
    1.36/1.30°, 0.073/0.077; native ScoreMD 1.58/1.74°, 0.157/0.532; wδ 1.73/2.12°, 0.062/0.072; floor
    0.05°, 0.006 Å.
  - Ordered size error 0.106/0.110 → 0.117/0.091 → 0.120/0.096 → 0.111 Å (the last on one seed, open PR
    #1104); C3 ≈ 0.45 Å at every stop [M g4 §4.6].
  - Bonds 0.00038/0.00033 Å, 17–120× better than the Cartesian family [M r7 §5.6].
  - Paper-metric PMF: 0.097 vs covariance base 0.096 vs floor 0.080 [M open PR #1138].
- *Beat:* one model gets both halves right, and more training does not move where it ends.

**5.9 Readable is not learnable · 60 s.**
- *Screen:* the skeleton-and-arrows chart: even beads form a loud skeleton, odd beads carry log bonds and an
  arrow. Its lane on the rail. A scatter of torsion window against torsion error.
- *Numbers:*
  - Skeleton windows: bonds 0.25, torsions 0.20, size 0.69 [D #1068, CPU].
  - Trained: Rg 0.077 Å, bonds at the floor, torsion error 7.9° [M #1068, one seed].
  - Scatter: Cartesian (0.08, 7.1°); C3 (0.35, 0.85–0.95°); ordered (0.35, 0.9–1.1°) [M].
- *Beat:* a feature is learned accurately when it is a coordinate of its own.
- *Transition:* "what two arrows cannot supply → Part 6".

### P6 · One model, two uses (≈12.5 min; levers: read-out level t*, volume term, size coefficient)

**6.0 The seesaw, again · 45 s.**
- *Screen:* P2.0's card returns as a beam pivoting on read-out time.
- *Numbers:* BBA: Diffusion simulation PMF 5.387 (read at 10⁻⁵); Two For One 1.624 (read at t = 0.005); Both
  iid 0.234 / simulation 0.254. ALDP Two For One simulated C–N bond 23.51× Both [S ScoreMD Tables 12/15].
- *Beat:* the second promise: a generator that is also a force field.

**6.1 The blur dial on a protein · 90 s (live).**
- *Screen:* the noise ruler at t*; two curves that cross nowhere useful (soft-force information ∝ σ² vs
  contact blur); a K-indexed blur table; P5.3's lever-arm inset.
- *Computed:* C1, C8.
- *Numbers:*
  - At t* = 0.05: 1.09 Å per Cartesian BBA coordinate vs ≈ 0.01 Å along an internal bond [M
    bba-local-geometry §6].
  - Perfect-model read-out bias in the ordered chart with the immersion term ≤ 0.01 Å up to t = 0.1 [D lab
    11-18].
  - Contact blur at t = 0.01: 0.37 Å (K = 0) and 0.22 Å (K = 2); at t = 0.05: 1.46 and 0.85 Å [M #1101].
- *Beat:* one read-out level cannot be both sharp for walls and informed for soft forces.
- *Live:* lever "read-out level t*".

**6.2 The phantom spring · 110 s (live simulation).**
- *Screen:* a seeded overdamped Langevin run of a 2-D Gaussian in polar coordinates, with and without the
  1/r volume term: the radius histogram drifts from Rayleigh to half-normal and the cloud contracts; then a
  3-D variant. Then BBA: the loud map rotates with the molecule, so its volume term is the immersion
  ½ log det(J_cᵀ J_c), but the code had used the rotation-invariant formula. Data reweighted by the volume
  ratio slide the Rg histogram; size-error bars follow. A correction ribbon over the 2026-11-15 card "loud block
  adds nothing in simulation" reads "corrected 11-16: it helps forces".
- *Computed:* C16; asset A16.
- *Numbers:*
  - Mean radius 1.253 → 0.798 (−36%) in 2-D; 1.596 → 0.798 (−50%) in 3-D [D g1 §3.6].
  - Spurious inward force ≈ 0.6 k_BT/Å; predicted mean Rg 9.58 vs 10.66 Å; simulations ended at 9.6–9.7 Å
    [M #1100].
  - 100 ps size error 0.98 → 0.24 Å (seed 3, 512 paths) [M #1100].
- *Beat:* one wrong determinant compacted the protein; a missing volume term looks like an attraction.
- *Live:* lever "volume term: right / missing" (the simulation `uses` it).

**6.3 The drift that does not stop · 70 s.**
- *Screen:* size error against simulated time with floor bands; a stamp, "a 100 ps number is a point on a
  drift".
- *Numbers:* 2,048 paths with the correct term: 0.158–0.277 / 0.229–0.492 / 0.396–0.642 Å at 100 / 200 /
  300 ps; floor 0.084 Å [M #1130]. Full schedule 0.118 Å at 100 ps [M open PR #1104]. Open tests #1136 and
  #1113 [◌].
- *Beat:* honest: every force field still compacts.

**6.4 Where is the wall? · 100 s (live).**
- *Screen:* the rose closest-approach glyph just above the waterline; the closest non-neighbour histogram with
  its 3.5 Å test line, convolved with the floor blur; three repair cards; a wall-plus-size panel.
- *Computed:* C2, C30 (linear response).
- *Numbers:*
  - First-order loudness 0.003 → t½ ≈ 0.013 [D note 30 §7].
  - Floor blur 0.32–0.36 Å against a ≈ 0.4 Å margin (data 1% point 3.9 Å vs the 3.5 Å test) [M lab 11-18].
  - Model overlaps 12–20% vs data 0.005–0.01% [M]; training lower does not create the wall [M #1101].
  - Repairs: late repulsion 24.4%/17.2% → 2.0%/1.3% [M #1069]; joint rebuild with a 3.6 Å core 0% overlaps
    (by construction), Rg W1 0.083/0.070 Å [M #1107]; a fitted wall swells (mean Rg 11.13–11.31 Å) until a
    size term of −0.16 k_BT per Å is added [M #1106/#1109].
  - Linear response 0.16 × 4.8 Å² ≈ 0.8 Å [D].
- *Beat:* excluded volume is to internal coordinates what bonds are to Cartesian ones.
- *Live:* lever "size coefficient" (an analytic `leverSim`).

**6.5 ★ Two charts, two blind spots · 110 s.**
- *Screen:* one BBA frame mirrored left and right on the Fog Bench at the floor, t = 0.01. Left, ordered
  internal: crisp orange sticks, while 12 ghosts of the closest pairs cross the 3.5 Å test and flash rose.
  Right, wδ (log distances): frayed sticks, clean contacts. Their erasure ladders on the rail are mirror
  images. Then P2.5's teal odometer returns at the collision wall (log r → −∞ as two beads touch), with the
  card "the barrier that killed (planarity, Part 2) — the barrier that may save (collisions)" stamped ◌.
- *Computed:* C26 (ordered); C10e (wδ first-order blur, ellipsoids only, no ghosts); asset A2 plus the wδ
  column recomputed in A2b.
- *Numbers:*
  - Ordered first-order: bonds 0.26, closest approach 0.025 [D `bba_charts.json`]. wδ: bonds 0.014, closest
    approach 0.120; floor blur 0.049 vs 0.36 Å [D g2 §4.8, unofficial until A2b].
  - Overlap margin in wδ units: 7.7 floor widths [D g2 E4].
  - Outcomes: wδ size 0.062/0.072 Å, clashes 0%/0%, bonds 86× worse (0.027/0.034 vs 0.00038/0.00033 Å) [M
    real-budget-study]; severe collisions per 10⁵ at the first chunk: wδ 0, Cartesian 682, internal 1,186 [M
    matched-results]. Caveat chip: wδ force fields reach 17–18° angle errors [M].
  - The hypothesis badge: [H g2 §5].
- *Beat:* every chart has a blind spot at the trained floor; one chart's missing wall is the other's built-in
  barrier.
- *Climax image:* the mirrored pair, rose flashes on one side and frayed orange sticks on the other, with the
  teal odometer between them.

**6.6 What two arrows cannot say · 80 s.**
- *Screen:* three mode vectors as a frame; mirrored, |a₁|, |a₂| and a₁·a₂ stay while χ flips. P(χ > 0) bars by
  Rg bin; a detective waterfall.
- *Computed:* C31; asset A15b.
- *Numbers:*
  - Data 0.169/0.268/0.371/0.470; ordered (library s2) 0.196/0.269/0.421/0.485 [M #1133].
  - Waterfall: local −1/+4%, single long-range distances 28/32%, arm side 11/10%, coarse quarter-chain
    dihedral 61/59% → "the relative twist of the chain's two halves" [M #1134/#1139/#1140].
- *Beat:* two vectors carry no handedness; the residual deficit is a high-order twist.

**6.7 A score means nothing without its count · 60 s.**
- *Screen:* PMF floor against count (log–log), model points at 100k, the paper's values on their own
  vertical.
- *Numbers:*
  - Floors 0.56/0.18/0.080/0.039/0.025 at 20k/50k/100k/200k/325,039 (count × floor ≈ 8,000) [M PR #1138].
  - At 100k: ordered 0.097, covariance base 0.096, C3 0.113, wδ 0.161/0.198, native ScoreMD 0.202/0.315 [M].
  - Paper BBA iid 0.034 at 1.3M [S], chip "not comparable"; extrapolated floor ≈ 0.006 [D, "extrapolated,
    not measured"].
- *Beat:* compare scores only at equal counts.

**6.8 The whole chain · 75 s.**
- *Screen:* the swimlane map, each node redrawn by its own scene's functions (u1-force 11): odometer, cone,
  collapsing chain, arrows, mirror pair. Then the **full erasure clock** with every lane (Cartesian, wδ, C1,
  C3, ordered, skeleton, Chroma-style; EigenFold as an inset on its own clock) and status pills: delivered /
  changed / open (#1137 [H], drift #1136/#1113, transfer, equilibrium).
- *Numbers:* the reasons for optimism, as listed in r7 §5.6.
- *Beat:* the thesis is the search for the right clock. The current one has range and order, and its
  remaining blind spots are known and located.

### X1 · The Erasure Clock and X2 · Fog Bench (explorables)

- **X1** (the same rail module): the lane library (first-order screen from `bba_charts.json` + A2b;
  best-estimator envelope from note 27 and lab #1099) behind an estimator lens; a probe calculator (λ, or a
  width with a unit preset of 0.9418 Å, 6.252 Å or thermal → r(t), t½, decision bar, training share,
  information bump R(1 − R)); the (γ, v) pad; the noise ruler. Tests C1–C4.
- **X2:** 64 held-out BBA frames (A5a) and ALDP5. Charts: Cartesian, C3, ordered (with the γ family), and wδ
  as ellipsoids only. Modes: ghosts, best linear guess, per-bead ellipsoids s²(JᵀJ)⁺. Readouts: the ghost
  scatter of bond, Rg and closest approach against their natural spreads.

---

## 4. Recurring visual devices and conventions

### 4.1 Palette with meaning (extends `src/draw/theme.js`)

| Meaning | Colour | Notes |
|---|---|---|
| Ground, panel, line, grid, ink, body, muted, dim | house `#0d1321 #141c2e #2c3a56 #1c2640 #ece8de #d3d7e0 #8a96ad #56627a` | unchanged |
| **Scale ramp (what is erased), local → global** | bond `#ef8a5b` (house stiff) · angle `#f3b58d` · torsion `#6cc4e8` (house soft) · long-range, contact count, end-to-end `#8f9ff5` · size, handedness `#b58cf6` | Monotone warm → cool, so the erasure order reads as a colour gradient: warm → cool is order, cool → warm is anti-order. |
| **Closest approach (the wall)** | rose `#f497c0` | Off the ramp on purpose (local in space, nonlocal in sequence). Retention's rose (KL) is not used here. |
| **Attention; the loud block** | gold `#f2cf63` | playhead, current sample, "what this requires" boxes, mode arrows a₁, a₂ |
| **The log ruler (wδ)** | teal `#4fb3a3` | wδ emblem, odometer, wδ points (P2, P6) |
| **Fog / posterior haze** | `#c9d3e6` at alpha ≤ 0.85 | Replaces Retention's lavender (handed over by a morph in P5.0). Information about a feature wears that feature's hue. |
| Coordinates | x/y/z `#ef6b6b #86d08f #7ea6f2` | Cartesian emblem and axis triads only |
| Data, references, floors | ink outline / grey band | never coloured |

Rules:
- **Colour on a molecule always means a feature being discussed.** Bead models (ALDP5, BBA) are neutral
  slate `#9aa7bd` with an ink casing. Element colours appear only on the all-atom toy and on all-atom ALDP.
- At most three ramp hues are active on screen at once.
- Charts are never coded by ramp hues: use emblems and lanes (§4.2). In scatter plots, at most one chart is
  highlighted (gold or teal); the rest are ink/muted with distinct marker shapes.

### 4.2 Glyphs, emblems, chips

- **Feature glyphs** (18 px, ramp hue): bond ●–●; angle ∠; torsion ↻; long-range distance ●⌒●; contact count
  ⋰; end-to-end ↔; size ⊙; handedness ⟲; closest approach ●|● (rose).
- **Moon fill:** a glyph's interior fills by R_h(t) at the playhead (filled = readable/decided, hollow =
  erased/undecided). A feature with only a measured t½ snaps at t½ and carries a "≥" chevron; full curves only
  where a closed form or logged curve exists.
- **Decision bar:** for linear features, R falls from 0.8 to 0.2 over a fixed log-SNR width ln 16 = 2.77
  (198 px) [D g3 C2]. Two features look ordered when their bars do not overlap (a loudness ratio above 16).
  This shows honestly that the block's order over torsions is partial (6.9/2.0 = 3.5).
- **Chart emblems** (20 px, ink unless highlighted): Cartesian, a mini x/y/z triad; wδ, an "ln r" ruler (teal);
  spring, a zigzag; whitened, a unit circle; learned warp, a lens; C3, a hinged chain; ordered, a hinged chain
  with two gold arrows; literature, a muted chain.
- **κ chips** (g4 §2.2): κ_H Hessian ratio · κ_Σ covariance condition · κ_res residual stiffness ·
  κ_t noisy covariance · κ_step 1 ps step anisotropy · κ_train training curvature. Arrows join κ values only
  within one chip and one data set.
- **Estimator chips** on every window: "1st-order screen" (hollow glyph), "best estimator ≥" (solid, with
  chevron), "network-input R²" (#1026), "resolution σ*" (#1025).
- **Data stamps:** TOY · ALDP5 bgmol · ALDP5 mdshare · BBA DESRES · CHAIN MODEL. **Budget chips:** "190,350
  upd (10%) · s2/s3 · 100k mol".

### 4.3 The Erasure Clock rail (one geometry for the whole programme)

- **Axis:** linear in log-SNR ℓ(t) = ln(α_t²/σ_t²), labelled in t:
  x(t) = 140 + 1340 · (13.8145 − ℓ(t))/18.753 for t ∈ [10⁻⁵, 0.7], with a 30 px cap "→ 1". Anchors
  (unit-test values): 10⁻⁵ → 140, 0.0004 → 406, 0.01 → 683, 0.05 → 877, 0.1 → 973, 0.26 → 1128, 0.5 → 1303,
  0.7 → 1480.
- **Home position:** y 640–760, lanes stacking upward at 44 px (six at most), emblem labels at x 40–130.
- **Waterline:** hatching left of each lane's t_min ("never trained"): 10⁻⁵ for Cartesian, 0.01 for
  internal-family lanes. **Fog:** a shared clear-to-white gradient with alpha σ_t² (capped at 0.85). A
  training-density sparkline under each lane (uniform-t draws per pixel) shows the Cartesian bond glyph
  sitting where almost no training happens.
- **Mnemonic** (said once, P5.2): "above the water, into the fog". Range: every glyph above the waterline.
  Order: the cool glyphs deepest in the fog. Generation reads the clock from right to left.
- **Threads** join one feature's glyphs across lanes (information-geometry 01 idiom); the bond's journey
  0.0004 → 0.26 is a long thread over the waterline.

### 4.4 Making erasure visible: four honest renderings

1. **Ghosts (blur by ensemble).** K = 12 seeded draws y_t = α_t φ(X₀) + σ_t ε_k, decoded by the chart's own
   decoder, Kabsch-aligned, alpha 0.12–0.2. *Rule: no pixel blur anywhere; every blur is an ensemble of real
   noise draws.* Use for t ≤ 0.2. Caption: "12 noisings of one molecule".
2. **Best linear guess (fade toward the average).** The Wiener mean: α_t y per unit-variance channel,
   α_t λ_p y/(α_t² λ_p + σ_t²) per mode. The molecule fades toward the population average; in Cartesian the
   outline shows first. Caption: "what a linear observer can still see" [D] (a lower bound).
3. **Fog opacity (what is knowable).** Opacity and moon fill = R_h(t), on the rail and on overlays, with an
   estimator chip.
4. **Crystallization (reverse).** Forward paths played backward. On screen: "a forward path read backward is
   a path of the exact reverse process; these 12 all end at this molecule" [D, a bridge ensemble]. A feature
   crystallizes when its ghost scatter falls below its natural spread (exactly t½ for linear features, since
   r = ½ ⇔ σ²/α² = λ): the halo collapses, a ring pulses, the glyph fills. Trained-model behaviour is shown
   only by measured gauges beside it (#1133).

### 4.5 Noise level, the universal handle and the noise ruler

- **One handle.** The noise dial is the rail's playhead, the same gold control and keyboard binding in every
  live scene, introduced in P3.1 (u1-force: "reuse one handle").
- **Noise ruler.** At the playhead, s = σ/α in each chart's units: Cartesian BBA 6.252 s Å per coordinate;
  ALDP5 flat 0.9418 s Å (0.042 Å at t = 0.01); manifold route s Å (0.0446 Å); internal channel s thermal
  widths; loud mode 1 s/√15 of its spread. This fixes "same t, different blur" (g4 §2.1).

### 4.6 Epistemic badges and correction ribbons

- **Badges** (mono 11 px, after every number): ◆ D derived · ● M measured · □ S cited · ◌ H hypothesis (and
  anything drawn under a hypothesis gets a dashed outline) · ≈ I illustrative. The scene stamp names the
  computed objects and the primary source.
- **Correction ribbon:** a band slides over a superseded claim, strikes it and shows the dated correction
  ("2026-11-15 → corrected 2026-11-16"). Used in P2.6, P4.2 and P6.2, at most once per piece, always
  narrated.
- **Pending stamp:** "declared, not run" (#1137, #1136, #1113).

### 4.7 Number typography and layout

- IBM Plex Mono with tabular figures, 15–17 px. Units muted after a thin space. Seed pairs "0.117 / 0.091"
  with an "s2/s3" subscript. Never more digits than the source. "≥" marks lower bounds; "≈" and italics mark
  illustrative values. Live-computed values show "="; values from data JSON carry ● and a tested key.
- Every readout has a comparison target: "Stein 0.25 · ideal 1", "t½ 0.0004 · floor 0.01".
- Header: eyebrow `NN · NAME` at (80, 74) and a Spectral 42 claim title at (80, 126).
- Grid: picture x 90–760 (or a centred stage for 3-D climaxes); right column x 860–1500 with at most two
  formulas; footnote y 860–872; stamp at (1572, 890). The baseline constants live in one module, because
  moving them broke u1-force scene 06.
- One claim card at a time; formulas fade in when named, with a mono gloss; no text below 13 px; 5 px halos
  on leader lines.
- Narration runs 1.6–2.2 words/s; named time constants drive both cues and fades.

### 4.9 3-D rules: BBA and ALDP5

- **Geometry and rendering:** real DESRES Cα positions (Å), centred and aligned; 17 px/Å (Rg 10.6 Å ≈ 180
  px); u1 perspective camera (focal 14). A Catmull–Rom tube (radius 0.45 Å) and shaded beads (0.9 Å),
  painter-sorted; far segments dimmer and thinner. Secondary structure is bracketed once, never coloured.
- **Overlays:** orange stick highlights (bonds), sky dihedral fans (torsions), a violet gyration sphere
  (size), rose dashed links for contacts (|i − j| ≥ 3, d < 6 Å) with overlaps (< 3.5 Å) flashing.
- **Modes as smooth arrow fields:** mode p moves bead i by w_{p,i} â_p, so all arrows are parallel and their
  lengths follow a Rouse cosine (C28). Gold, width 1.5–3 px, dark halo. The block is a₁ and a₂ as bold gold
  arrows from the centroid, length ∝ |a_p| in Å.
- **Authored orbits only** (no drag-rotate): at most one orbit per scene, ≤ 0.02 rad/s while narration runs,
  holding still during readouts; a 15–40° reveal sweep when a 3-D object first appears; pitch 0.2–0.45.
- **Alignment:** every ghost is Kabsch-aligned to the clean frame, so NeRF's end anchoring cannot fake a lever
  arm.

### 4.10 The evolution swimlane map

- A dated x-axis (2026-07-02 → 11-19) with overlapping era lanes, each running from its first dated document to
  its decision record: Era 1 07-02 → 10-22 (#520); Era 2 10-23 → 11-14; Era 3 10-23 → 11-16 (#769 closed);
  Era 4 10-24 → 11-14; Era 5 11-11 → now.
- Nodes are claim cards with status pills (TRIED · DERIVED · MEASURED · CORRECTED · OPEN). Each piece opens on
  the map with its lane lit for 6 s; P6.8 redraws every node with its own scene's functions.

### 4.11 Interaction rules (from u1-force)

At most five levers per playable, in one arc, one gesture each. The narrator performs each gesture with a
labelled readout before the single hand-over. Anything that does not change what the narration claims is a
lens, and analytic levers use `leverSim`. Build the comparison plot early and swap one curve later. Measure
before painting: the rail appears only after the t½ values are "measured" on screen (u1-force 04).

---

## 5. Computation and data catalogue

### 5.1 Computed objects (DOM-free `src/model/*`, each with Node tests)

| ID | Object | Exact maths / algorithm | Test values (source) |
|---|---|---|---|
| C1 | VP schedule | β = 0.1 + 19.9t; B = 0.1t + 9.95t²; α = e^{−B/2}; σ² = 1 − α²; ℓ = ln(α²/σ²) | α(0.01) = 0.999003, σ(0.01) = 0.04464, σ/α(0.05) = 0.17414, ℓ(0.01) = 6.22, α(1) = 0.006572 (g4 §3.3); rail anchors §4.3 |
| C2 | Linear readability | r = α²λ/(α²λ + σ²); t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9 | t½(1) = 0.2590; t½(15.5) = 0.526; t½(0.011) = 0.0285; t½(0.003) = 0.0130; t½(0.168) = 0.120; t½(4.2×10⁻⁵) = 0.00040 (r6 §3, g2 E3) |
| C3 | Channel variance dial | t½(v) | v = 1/0.3/0.1/0.03 → 0.26/0.16/0.09/0.05 |
| C4 | Partial whitening | λ_k → c λ_k^{1−γ} with mean 1 | ratio 1,423/232/38/6.1/1; first/last t½ as in r6 §3 item 2 (note-27 spectrum) |
| C5 | Degree attenuation | R = Σ c_j r^j / Σ c_j; one torsion r(t) = E[(I₁(k)/I₀(k))²], k = ακ\|y\|/σ² (Monte Carlo, 400k draws) | κ = √2: 0.940/0.716/0.530 at t = 0.1/0.2/0.26; κ = 1.504: 0.947/0.746/0.565 (r6 §2.8) |
| C6 | Constraint split | \|P_A n\|² = L²/(1+L²) | L² = 1/16/63 → 0.500/0.941/0.984 |
| C7 | Size response | λ_p²/Σλ² | 0.830 (mode 1), 0.962 (1–2) from `collective_modes.json` (checked here) |
| C8 | Blur dial | F_t = r(t) F₀; stationary width w/√r; overdamped EM u ← u + h F + √(2h) ξ | ALDP5 nine modes with unit 0.9418 Å: t½ 0.00483 … 0.196; r(0.01) 0.264 … 0.996 (g1 §3.1); thermal r(0.03) = 0.988 |
| C9 | Tweedie shrinkage | w/√(w² + s²) | s = 0.0594, w = 0.025/0.031 → 0.388/0.463 |
| C10 | wδ maths | (a) F(X) = (log r_ij, √δ log det G), w = ‖ΔF‖; (b) projected chord argmin_Z ‖F(Z) − [(1−t)F(X) + tF(Y)]‖; (c) H = A + δB (r1 M5) and the geodesic ODE q̈ = P_h(P_h H P_h + ηI)⁻¹P_h f, η = 10⁻⁶, S sub-steps; (d) horizontal spectrum; (e) first-order loudness | odometer 3.2489/7.8377/12.4378/17.0407; cond 42.14 (e = 0.5) … 6.004 × 10⁷ (0.01) (r1 E1); finite-difference JᵀJ = H to 10⁻⁹ |
| C11 | Relative deformation | (log((r + 0.1)/r))² | 0.004165 (1.5 Å), 0.000392 (5 Å); Å/nm invariance 0.222685 |
| C12 | Spring cone | F(b) = (√w\|b\|, √(γ/2) b); c = √(γ/(γ+2w)); σ_r = √(2/(γ+2w)); σ_⊥ = √(2/γ); K_tan = 4w/(γ(γ+2w)r²) | w = 1400, γ = 30: c = 0.10296, σ_r = 0.02658, σ_⊥ = 0.2582, K_tan(1.5) = 0.029316 (r3 E1) |
| C13 | Four-point distortion | best planar placement of 4 points on a cap of curvature K (Nelder–Mead) | ε(θ = 0.3) = 0.0076, ε(1.2) = 0.16 (note 22 table) |
| C14 | Spring metric at rest | G = J_dᵀ W J_d for `energy.js` (bonds 20, others 0.4 eV/Å²) | 6 zero eigenvalues and 9 internal: 0.0264 … 53.99; κ_H = 2,048 (g4 §3.2) |
| C15 | Rg² identity | Rg² = Σ_{a,b} min(a,b)(N − max(a,b))/N² b_a·b_b (1-based) | equals the direct Rg² on random chains to 10⁻¹² |
| C16 | Volume toy | polar Langevin with/without the 1/r term | mean radius 1.2533 vs 0.7979 (2-D); 1.5958 vs 0.7979 (3-D) |
| C17 | Lag dictionary | half erasure at σ²/α² = 1/(1 − e^{−2τ/t_k}) | t_k = (0.008, 0.03, 0.5, 3.1) ps, τ = 1 → (1.000, 1.000, 1.019, 2.116) |
| C19 | Arbitrariness toy | `configuration(s, q)`, `springEnergy` (a1) | 1.75 Å; O–H 0.40 Å; 3.27 eV; 0.105 vs 0.044 eV (a1 §6.1) |
| C21 | Training share | (t½ − t_min)/(1 − t_min), clipped at 0 | Cartesian bonds 0.04%; C3 bonds ≈ 25% |
| C22 | Banana / river | φ(x) = (x₁ − x₂²/9, x₂), A = diag(1/81, 4); ψ along line and geodesic | max ψ 40.5 (line) vs 1.125 (geodesic) (g2 E2) |
| C23 | Redundant normal stiffness | ε* = σ y_T + y_N/σ (note 28) | 1/σ² = 502 at t = 0.01 |
| C24 | Torsion MC chain | 28 beads, mean BBA bonds/angles (A6 means), Metropolis on 25 torsions; weights exp(−\|x − μ\|²/2s²) or K⊗I₃ Gaussian | targets 10.34/5.41/10.71 Å (#1025); tolerance ±0.3 Å at 20k sweeps |
| C25 | Empirical posterior | w_i ∝ exp(−‖y − α y₀⁽ⁱ⁾‖²/2σ²), ESS = (Σw)²/Σw² | ESS > 100 for Cartesian at t = 0.1 on a 20k bank (display only) |
| C26 | Chart encoders/decoders | Cartesian φ = X_c/6.252. C3: 27 log bonds + 26 log tan(θ/2) whitened by L⁻¹(r − μ), plus κ(cos τ, sin τ) with κ = 1.5044; decode by atan2 + NeRF. Ordered: C3 ⊕ c₀ a_p, a_p = Σ_i V_{pi} u_i (Helmert), c₀ = 0.157064 | round trip < 10⁻¹⁰ Å; per-channel variance of C3 on frames ≈ 1 |
| C27 | Best linear guess | per channel E = α y (unit variance); per mode E = α λ_p y /(α²λ_p + σ²) | at t = 0.26 the plug-in value y/α is shrunk by α² = 0.497 |
| C28 | Mode bead weights | w_p = Hᵀ V_p (28-vector); Rouse u_q(i) = √(2/N) cos(πq(i + ½)/N) | overlaps 0.991, 0.985, 0.914, 0.915 (`bba_charts.json`) |
| C29 | Per-bead noise ellipsoids | Cov(δx) = s² (JᵀJ)⁺ on centred coordinates (first order), J by finite differences, Jacobi eigendecomposition | Cartesian: per-bead variance (6.252 s)² · 27/28 · I₃ exactly; C3 bond loudness on the frame bank ≈ 1.00 (0.9996) |
| C30 | Size-term response | Δ⟨Rg⟩ ≈ coefficient × Var(Rg) | 0.16 × 4.8 = 0.77 Å |
| C31 | Handedness | χ = a₁·(a₂ × a₃)/(\|a₁\|\|a₂\|\|a₃\|) | flips sign under reflection; P(χ > 0) on 1.3M frames = 0.353 (`bba_charts.json`) |

### 5.2 Data assets (precompute scripts under `scripts/thesis-data/`, Python run with `-I`, read-only on LOCAL; outputs in `src/videos/<id>/data/`)

| ID | Asset → JSON | Source | Script outline | Shape · size |
|---|---|---|---|---|
| A1 | `bba-modes.json` | `runs/range-order-mechanisms-20261118b/collective_modes.json` | copy the mean squares (Å²) and V; compute c₀, library units, w_p = HᵀV_p, Rouse overlaps | {c0, ms_A2[27], ms_lib[27], V[27][27], w[27][28]} · ≈ 25 kB. Note: max/min = 1,428 here vs canon 1,423 (§6) |
| A1b | `bba-cart-spectrum.json` | `data/deshawresearch-bba-ca28/train.npy` | aligned Cartesian PCA in Å/6.252 (note 27 convention) | {var[27]} · 1 kB. Test: 15.5/6.2/3.0/1.3 … 0.011, ratio 1,423 ± 5 |
| A2 | `bba-lanes.json` | `bba_charts.json` + note 27 §5 + lab #1099 table (transcribed with line references) | merge into {estimator: {chart: {feature: t½}}} with chips | ≈ 6 kB |
| A2b | `wdelta-firstorder.json` | BBA frames (1,200 held-out, 50k training), `prepared_coordinates.py` normalisation c = 0.3138 | recompute g2's first-order wδ column with `bba_charts.py` definitions | {feature: t½, blur} · 1 kB. Test: bonds 0.014, closest 0.120, Rg 0.689 |
| A3 | `chain-exact.json` | `exact-uniform.json` | copy the levels × observables | 14 × 9 · 5 kB |
| A4 | `collapse-signal.json` | `signal-uniform-{unit,natural,x2}.json`, `signal-basins-natural.json` | copy per-level collapse/constraint plus the summary | 4 × 14 × 10 · 25 kB. Test: ∫ ½β/σ² S dt = KL ± 3% |
| A5a | `bba-frames.json` | `heldout.npy` | 64 frames stratified by Rg decile and TIC; int16 at 0.01 Å | 64 × 28 × 3 · 11 kB (base64) |
| A5b | `bba-window.json` | `train.npy`/`heldout.npy` ordered by `membership.npz` | scan for a 400-frame window that contains a fold/unfold (Rg crossing 9 → 13 Å) | 400 × 28 × 3 int16 · 67 kB |
| A6 | `bba-chain-spec.json` | `chain_spec.json` | means (53), Cholesky lower triangle (1,431), κ | ≈ 14 kB |
| A7 | `aldp5-modes.json` | evidence `mode_std_A`; mdshare traj 1 | stds; mean structure; 9 principal directions after Kabsch alignment | 9 + 15 + 9 × 15 · 3 kB |
| A8 | `aldp5-race.json` | `runs/feature-space-evaluation-2026-10-26/remote/full/{flat-lowfloor,spring,flat-trusted}_s0_step{250…200000}_samples.npz` | per checkpoint: 4 bond histograms (60 bins), bond W1/width, φ/ψ 36 × 36 | 3 × 10 × (240 + 1296) uint16 · ≈ 95 kB. Test: W1/width at 200k = 0.015/0.013/0.422 ± 0.003 |
| A9 | `aldp5-force.json` | `force-field-simulation/evidence.json` | Stein ratios per direction and seed; `distribution_200k_by_seed`; floors | ≈ 8 kB |
| A10 | `aldp5-barcode.json` | `data/mdshare/...npz` | φ with hysteresis ±20°; run-length visit list per trajectory | ≈ 10 kB. Test: 37 visits; 3.24/1.65/4.11% |
| A10b | `aldp5-planarity.json` | `data/processed/aldp5_train.npy`, `aldp5v_train.npy` | log₁₀ λ_min(G)/tr G histograms (60 bins) for 5 and 6 beads | 2 kB |
| A11 | `ak-interp.json` | `/Users/I745505/private/thesis/pocs/manifold-scoremd/diepeveen2024` (`dims0001_fit-core.dcd`, `adk4ake.psf`) | Cα, Kabsch; Cartesian chord RMSD by frame; frames 25/50/75 and their chords; PCA scree | 102 + 3 × 214 × 3 · 20 kB. Test: mean 1.784; PC1 0.8934 |
| A12a | `lag-sweep.json` | lag-sweep / Gaussianization tables (transcribed) | | 2 kB |
| A13 | `bba-results.json` | `.local/leaderboard/cache/main/{runs,metrics}.parquet` (or real-budget-study.md l.270–299) | per model × seed × budget: bond, angle, Rg W1, contacts, JS, clashes, overlap; floors by panel size | ≈ 12 kB. Test: ordered s2 Rg 0.117 |
| A14 | `bba-pair-excess.json` | BBA frames; local generated clouds `runs/s12-linear-final-results-20261109/…` (Cartesian) | 27 × 27 weights and ⟨b_a·b_b⟩ data − model | 6 kB. C3 bands need the LISE panels (§7) or a stated schematic |
| A15 | `pmf-floor.json`, A15b `handedness.json` | PR #1138 body; #1133/#1134/#1139/#1140 | transcribed | 2 kB |
| A16 | `force-drift.json` | #1100, #1109, #1130, #1104 | transcribed | 2 kB |
| A17 | `reverse-gauges.json` | #1133 | R², mean \|a₁\|, χ share vs t | 1 kB |
| A18 | `timeline.json` | git log dates, PR/issue dates in r1–r8 | swimlane nodes | 6 kB |

Every transcribed number carries {value, tag, source, line/PR} so that the stamp prints its provenance. A
Node test asserts each canon value.

---

## 6. Risks

- **Ghosts are the forward kernel, not the posterior.** P5.7's bridge ensemble ends at the clean molecule by
  construction and must not be read as the model's generation. Mitigation: the on-screen sentence (§4.4.4)
  and measured gauges beside it.
- **The internal-only decode hides the constraint split.** In P5.7 only the measured gauge shows the chain
  following the block. Never use the joint rebuild at high t: it is a small-noise posterior mode.
- **The colour ramp idealizes the order.** C3's slowest TIC (0.49) is an exception, and contacts sit off the
  ramp. Label exceptions where they appear.
- **First-order vs measured windows.** C3 Rg has four printed values: 0.19 (first order), 0.23 (weaker
  estimator), 0.27–0.28 (canon) and 0.30 (decoder-Jacobian linearization). Use chips, and mark every measured
  window as a lower bound ("≥").
- **The wδ column is unofficial** (g2's own first-order screen). A2b must reproduce it before P6.5 ships.
- **The spectrum asset disagrees with the canon:** max/min is 1,428 in `collective_modes.json` against 1,423
  in note 27 (different fits). Use A1b for Cartesian readouts and A1 for the block. If A1b fails its test,
  print "1,428 (this fit)".
- **Units:** loud-mode mean squares are 15.0/6.0 in library units and 15.5/6.2 in Å/6.252; compare torsions
  with the mode-length variances 6.9/2.5. σ(0.01) is dimensionless (see the noise ruler).
- **κ** has six definitions; Part 1's 400 is [I]. Arrows join κ values only within one chip.
- **αL:** show only the canon (±50%, 95% interval 0.4–7.0%). Note 25's 0.79–1.27 "bound" is invalid.
- **ScoreMD comparisons:** "native ScoreMD" is the no-FP Diffusion arm at 10% of the budget. The paper's
  1.3M-sample values are not comparable to 100k floors.
- **Open-PR numbers** (0.111, 0.118, PMF 0.097/0.096; one seed) carry an "open PR" stamp and must be
  re-checked at build time. Loud-mode force numbers from before 2026-11-16 carry the wrong volume term, and
  status.md is stale on this.
- **Hypotheses** (wδ wall, which partly lives in the decoder; #1137; anti-order worsening with length; share
  of reducible loss) are always drawn dashed.
- **Era-1 numbers** mix N, n and conventions ("indicative"); the n = 5 αL box is reflection-confounded and not
  shown. AK's curve parameter is not time. Chignolin transfer data are ScoreMD's dummy set, not MD.
- **3-D:** NeRF anchoring can fake a lever arm, so always Kabsch-align. The joint rebuild's 0% overlaps hold
  by construction (3.6 Å core vs 3.5 Å test).
- **Inherited:** Retention's "63%" is a variance ratio and its Ricci-flow verdict differs from note 25; P5.0
  reuses only the channel half-points.
- **Length:** ≈ 62 min; first cuts P2.4's toy, P4.6, P6.7.

---

## 7. Build order

0. **Groundwork (4–5 days).**
   - Cherry-pick or merge PR #3's `src/app.js`/`main.js` changes (narration in `window.video.scenes`, JPEG
     frames, lazy loading); the narrated export needs them.
   - Promote the side-video devices into `src/draw/` (`frame`, `axes`, `readout`, `pill`, `stamp`, `track`,
     `paced`, `clock`, `leverSim`, u1's `space.js`).
   - Add `rail.js`, `glyphs.js`, `chain3d.js` and `src/model/{vp,readability,chain,linalg}.js` (port
     `interactions/linalg.js`), with tests C1–C7 and C26–C29.
1. **Data (3–4 days):** A1–A18 and their tests.
2. **MVP: P5 core (7 days).** Scenes 5.0, 5.2, 5.3, 5.5, 5.7, 5.8 as an 8-minute probe page. It exercises every
   device (rail, glyphs, Fog Bench, gold arrows, crystallization, badges), and all its inputs are local.
   Three-judge review.
3. **P5 complete (4 days):** 5.1, 5.4, 5.6, 5.9; narrated export.
4. **X1 (2–3 days):** reuses the rail and lanes.
5. **P3 (8 days):** A7–A10, the 3-D cone, the blur-dial simulation.
6. **P2 (8 days):** C10, the geodesic toy, A10b, A11.
7. **P6 (7 days):** needs A2b.
8. **P4 (6 days):** C24 and the lag table.
9. **X2 (3 days):** reuses `chain3d`.

Total ≈ 55 working days.

Dependencies: PR #3 lands first, so the draw kit does not fork. Optional: generated BBA panels (2,000 molecules
each for C3, ordered, Cartesian + distances, wδ and ScoreMD) from LISE `runs/s12-bba-study-20261114/`. They
would let P4.3 and P4.6 show real generated molecules; until then those scenes use plots and data frames. Every
scene ships only after `npm test` (identities, canon values) and a rendered-frame review every 6 s.
