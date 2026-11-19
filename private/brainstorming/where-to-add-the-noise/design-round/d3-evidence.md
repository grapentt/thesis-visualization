# d3 · Evidence curator: "Readable", a measured programme

Designer d3, 2026-11-19. My angle is real molecules and real results, shown honestly. All values follow
g4's number canon.

**Paths.**
- LOCAL = `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative`: read-only data, runs and the
  leaderboard cache.
- rg-main = the ML snapshot in SP. LOCAL's `origin/main` is `c099347a` (2026-11-19, lab #1141). That commit is one
  entry newer than the reports.
- SP/d3work = the checks I ran while writing this.

**Badges.**
- **[D]** derived; **[M]** measured; **[H]** hypothesis; **[I]** illustrative.
- **[S]** marks a number cited from an external paper. Paper numbers sit at other sample counts, so they need their own
  badge.
- **†** marks a value derived by one of this workflow's readers. It is unofficial until an asset script reproduces it.
- **d3-check** marks a value I recomputed from LOCAL data today. The asset scripts must reproduce it.

---

## 1. Organizing idea

The whole project turns on one question, asked twice: **what can still be read above a floor?**

- **The model's floor.** A diffusion model can learn a property only while the noise has not yet erased it, that is,
  above its trained noise floor t_min. Cartesian bond lengths are half erased at t ≈ 0.0004, below the internal models'
  t_min = 0.01. Contacts in internal coordinates go at t ≈ 0.013.
- **Our floor.** We can believe a result only while it stands above its evidence floor:
  - the metric's sample floor (the BBA PMF floor is 0.080 at 100,000 molecules and 0.56 at 20,000);
  - the seed spread, through the effect rule;
  - the budget at which it was measured;
  - the reference MD itself (one 250 ns trajectory pins αL only to about ±50%).

The programme draws both floors in one visual grammar: a hatched band below which nothing is decided. It sits on the
diffusion-time axis for the model and on the metric axis for us.

Every scene starts from real molecules: ALDP5 from mdshare and bgmol, BBA from the DESRES set, all local. Every scene
also uses real logged results. Every number wears its label: badge, system, data set, budget, seeds, count, floor,
source and status.

This fits the project for two reasons:
- Its history is a sequence of measurements that changed belief, some of them wrong: the moving baseline, "finite is
  not correct", the Gaussianization correction, the wrong volume term.
- Its current optimism rests on effects that are large compared with their floors, and that can only be read together
  with those floors.

It fits the audience (examiners, supervisors, collaborators, and the author preparing talks) because they need visuals
they can audit. One ledger backs every number on screen. The same floors that explain the science also explain why
some comparisons are refused.

---

## 2. Programme map

| # | id (folder) | Title | Kind | Length | Era / ideas | Climax image | Data |
|---|---|---|---|---|---|---|---|
| 1 | `src/videos/real-molecules` | Two Real Molecules | narrated, 1 live lens | 6:40 | the systems; why Euclid is arbitrary; clocks; the reference's own floor; provenance | the αL barcode with its struck-through error bar | all local |
| 2 | `src/videos/wdelta-era` | The First Attempt | narrated | 6:50 | Era 1: wδ pitch, straightening, planarity, cost, the moving baseline, wδ's afterlife | the moving baseline: wδ's lead collapses when the flat bug is fixed | local + transcribed |
| 3 | `src/videos/stiffness-measured` | Stiffness, Measured | playable (3 levers, 2 lenses) | 7:20 + explore | Era 2–3 on ALDP5: nine real widths, noise ruler, pullback noise, Tweedie shrink, learning race, the blind loss, what did not improve | the race: spring bonds reach the floor at about 2k updates, flat bonds at about 200k | all local |
| 4 | `src/videos/bba-two-halves` | Twenty-Eight Beads | narrated | 7:45 | Era 3–4: learned warp, lag dial and the 5 November correction, BBA first contact, the 2×2 of failure, measured failure reasons, size is long range, prediction is not generation | the 2×2: every chart gets one half right | local + transcribed (+ A-REQ-1 thumbnails) |
| 5 | `src/videos/range-order-measured` | Noise on a Real Protein (**MVP**) | playable (4 levers, 2 lenses) | 11:45 + explore | Era 5: readability, a real protein noised in four charts, the erasure clock, anti-order, two loud arrows, the γ dial, the constraint split, decided first, what the block cannot supply | one real BBA molecule: in internal coordinates the far end flails first; in ordered internal coordinates two teal arrows hold the size while everything else dissolves | all local |
| 6 | `src/videos/results-floors` | Results, With Their Floors | narrated with lenses | 7:40 | Now: how to read a result, the registered budget, the Pareto plane, the budget clock, rebuilds, count-dependent floors, open tests | the Pareto plane: ordered internal coordinates alone near the corner, unmoved by 10× training | local cache + transcribed |
| 7 | `src/videos/forces-measured` | One Model, Two Uses | playable (2 levers, 2 lenses) | 8:50 + explore | the consistency thread: ScoreMD's seesaw, the blur dial, the ALDP5 diagonal, walkers from β, the BBA drift, the phantom spring, the wall | the drift that does not stop: each fix lowers the curve, none flattens it | local cache + traces + transcribed |
| L | `explorables/evidence-ledger.html` | The Ledger | standalone explorable | — | every number of the programme with provenance, a comparison guard, a floor dial, the κ rails and a claim timeline | — | `src/data/evidence/ledger.json` |

That makes 57 minutes of video in seven pieces, plus the explorable.

**Viewing order** is chronological (1 → 7), because the story is the evolution.

**Build order** starts with piece 5 (§7). It is the current core, entirely local, and it exercises every recurring
device.

**Connections to existing pieces.** Every piece ends with an end card that links to its neighbours and to the existing
videos.
- *Part 0* → piece 1: a shape is nine numbers once Kabsch removes Part 0's rigid motions. Piece 2: wδ is a metric on
  Part 0's shape space.
- *Part 1* → piece 3, which replaces its toy (κ = 400 [I]) with ALDP5's measured widths. Piece 3 also reconciles
  Problem 3 with "the loss does not see the bonds", and keeps Part 1's promise "next: the spring metric" with a measured
  race.
- *Atlas* → piece 5: the torsion phase pair embeds a circle, and Gaussian noise pushes it off the circle. That is the
  atlas problem in miniature.
- *Retention* (PR #3) → piece 3, which shows the measured ALDP5 retention curves of the pilot. Piece 5: R_h(t) is
  retention's I_t for a single probe. Retention's toy is credited as the first picture.
- *Covariance* (PR #3) → piece 3's "same noise, two rulers" (pullback = inverse covariance) and piece 4 (whitening).
- *Interactions* (PR #3) → piece 7: the noisy point's score is not the force (its scene 12).

**Recurring devices** (specified in §4):
1. provenance strip;
2. epistemic badges and status overlays;
3. the two floors;
4. the noise ruler, one shared handle;
5. the erasure clock;
6. the budget clock;
7. seed bars and the effect gauge;
8. the ledger column, which accumulates claims and strikes superseded ones;
9. the no-comparison glyph;
10. the count dial.

---

## 3. Piece-by-piece storyboards

The format is compact. Each scene gives screen · computed · numbers · beat, plus live, guard and transition where
needed. Numbers are listed with their badges. "Guard" says how a result visual avoids misleading.

### 3.1 Two Real Molecules (`real-molecules`, 6:40)

**1.0 Cold open (8 s).**
- *Screen:* a real ALDP5 frame (mdshare trajectory 1, five beads, slow yaw) beside a real BBA frame (Cα tube, hairpin
  beads 0–12 and helix 14–25 labelled), each with its provenance strip.
- Title: "Two real molecules". Subtitle: "Everything in this programme was measured on them."

**1.1 Twenty-two atoms, five beads (40 s).**
- *Screen:* one bgmol frame with all 22 atoms (`aldp.npy`, nm→Å). Seventeen atoms fade to ghosts. The kept atoms
  [4, 6, 8, 14, 16] (ACE-C, ALA-N, ALA-Cα, ALA-C, NME-N) stay.
- Live labels show 4 bond lengths, 3 angles and φ, ψ. The torsions use the repo's `dihedral` formula.
- *Numbers:* 4 + 3 + 2 = 9 = 3·5 − 6 [D].
- *Beat:* the object is five beads, and its shape is nine numbers.
- → The beads begin to move.

**1.2 One molecule, two kinds of motion (55 s).**
- *Screen:*
  - left: 5,000 consecutive frames of mdshare trajectory 1 at 1 ps per frame (asset A1);
  - right: histograms pour in for the four bonds and the Ramachandran plane;
  - below: the nine principal widths on a log-Å ruler (A5).
- *Numbers:*
  - bond sd 0.025–0.031 Å and angle sd 2.9–3.3° [M; d3-check 0.0253/0.0301/0.0307/0.0252 Å and 3.21/3.33/2.91°];
  - principal widths 0.0252 … 0.6631 Å, a 26× span [M; `force-field-simulation/evidence.json` `mode_std_A`];
  - Part 1's toy widths 0.036/0.72 Å as ghost ticks [I].
- *Beat:* in the real molecule the stiff and soft motions differ 26× in width.

**1.3 Two rulers disagree (60 s).** This is Euclidean arbitrariness on data.
- *Screen:*
  - two pairs of real αR frames, overlaid after Kabsch alignment;
  - pair A differs by a stiff stretch, pair B by a soft rotation;
  - two parallel axes, "Cartesian RMSD (Å)" and "thermal distance (widths)", joined by threads (the device of
    information-geometry/01).
- *Computed:*
  - RMSD by Kabsch;
  - d_th = √(Δqᵀ Σ_q⁻¹ Δq) over the nine internal coordinates, with Σ_q the αR covariance (A3).
- *Numbers* [M; d3-check on mdshare trajectory 0, αR = φ < 0 and ψ < 60°, every 50th frame, 4,000 frames, 60,000
  random pairs]:
  - pair A: RMSD 0.036 Å, d_th 4.0;
  - pair B: RMSD 0.243 Å, d_th 1.46;
  - rank correlation of the two rulers over all pairs ρ = 0.50.
- *Beat:* Euclid calls A seven times closer; the thermal ruler calls B closer. Cartesian distance ranks real
  conformations against their physics.
- *Guard:* a stamp says "one basin's covariance; not defined across basins".
- → "Every width has a clock."

**1.4 A ladder of clocks (45 s).**
- *Screen:* a log time axis from 10 fs to 325 µs with rungs:
  - bonds and angles < 1 ps, φ libration ≈ 10 ps, ψ libration 20–50 ps, αR↔β 100–200 ps, αL 5–20 ns [M, note 25 §3];
  - BBA frame spacing 200 ps (documented, not measured) and total 325 µs;
  - our longest force-field runs, 300–500 ps;
  - ScoreMD's 200 ns BBA protocol [S].
- Inset: autocorrelation of bond 1 and of the φ > 0 indicator from trajectory 1 (A4), with τ_int 900–1,300 ps
  [M #779].
- *Beat:* BBA equilibrium needs microseconds. Nothing we simulate later reaches it. This plants the honesty seed for
  piece 7.

**1.5 The rare basin is a barcode (75 s) — CLIMAX.**
- *Screen:* three 250 ns strips. φ > 0 hysteresis occupancy (enter φ > 20°, leave φ < −20°) shows as dark bars, and
  counters tick to 37 / 37 / 37 visits.
- *Numbers:* populations 3.24 / 1.65 / 4.11% and mean dwell 219 / 111 / 278 ps [M; d3-check reproduces both exactly].
- *Three error bars appear in turn:*
  1. Note 25's printed "Cramér–Rao" relative sd 0.90 / 1.27 / 0.79. It is drawn, then struck through, with the stamp
     "treats each visit as one Bernoulli trial (critic 2026-11-19)".
  2. The memoryless two-state Markov value (1 − w)√(2/n) = 0.225 / 0.229 / 0.223 [D].
  3. The data-based bars: τ_int with block bootstrap, 95% intervals 0.4–7.0%, 0.0–4.6% and 1.1–7.9%, a relative sd of
     about 0.4–0.7 [M #779]. A gold bracket shows that the between-trajectory relative sd, 0.42 [D], matches the
     data-based bar.
- *Live (lens "effective samples"):* N_eff from 30 to 1,000. The bar shrinks as √(w(1−w)/N_eff).
- *Beat:* the reference has a floor too. One 250 ns trajectory pins αL to about ±50%, so no model can be ranked on αL
  against it.
- *Guard:* "37 visits" and "96–139 effective samples" are different counts, and each carries its own label.

**1.6 Meet BBA (60 s).**
- *Screen:*
  - 1,500 consecutive frames (300 ns at the documented 200 ps), rebuilt by sorting membership ids (A10). d3-check: file
    0 holds 1,275 compact→extended→compact excursions with a median of 262 frames, and the lag-1 Rg autocorrelation is
    0.965. The Cα tube folds and unfolds.
  - an Rg trace over the full-data Rg histogram: mean 10.60 Å, 5/50/95% at 8.37 / 9.89 / 15.30 Å [M; d3-check];
  - a point moving on the TIC1/TIC2 free-energy map of all 1,300,156 training frames, using the frozen 403-feature
    TICA on the fixed limits [−1.23, 2.05] × [−3.13, 3.10];
  - folded share 0.194 [M].
- *Beat:* what is hard about BBA is global (size, fold, packing). ALDP5 has no global structure and cannot test order.

**1.7 Where the frames came from (40 s).**
- *Screen:* a dated strip of ledger cards:
  - 2026-07-27: BBA and Chignolin HDF5 files placed;
  - 2026-10-19: found byte-identical to ScoreMD's `deshaw_dummy.zip`, i.e. generated by a model; withdrawn (the card is
    struck);
  - 2026-11-01: the authentic DESRES set, 1,625,195 frames; its 1,300,156 training frames are exactly the paper's split
    (PR #1138).
- The two ALDP5 sets appear as labelled stacks: bgmol implicit solvent (benchmark and Sprint 12; αL box 319 of 50,000 =
  0.638%) and mdshare explicit solvent (Sprint 11; 1.65–4.11%). A rule card reads "never on one axis".
- *Beat:* every number carries its data set, and some data were withdrawn.
- → End card (12 s), with the ledger so far.

### 3.2 The First Attempt (`wdelta-era`, 6:50)

**2.0 Title (8 s):** a real near-planar ALDP5 frame turning edge-on.

**2.1 The empty cell (40 s).**
- *Screen:* a 2×2 card:
  - ScoreMD: flat, Fokker–Planck-consistent, small-t energy that doubles as a force field, and an iid-vs-simulation
    dilemma [S];
  - Diepeveen's wδ: F(X) = ((log r_ij), √δ log det G_X), geometry without a generator [S]. The formula fades in when it
    is named.
- The thesis cell lights gold, dated "exposé 2026-07-02".
- *Beat:* the plan was geometry plus a generator.

**2.2 Straight in which space? (55 s).**
- *Screen:* bars only; the paper's figure is not reproduced.
- *Numbers:*
  - adenylate kinase, 3-point mean RMSD to the MD frames: Cartesian chord 1.76–1.78 Å against the wδ separation
    interpolation 2.03–2.05 Å [M #513, aldp-reference];
  - ALDP5, 18 points: 0.224 against 0.247 Å [M];
  - local distances favour wδ: 0.032 against 0.052 Å on ALDP5, and adjacent Cα 0.077 against 0.144 Å on AK [M];
  - a scree card: plain Cartesian PCA of the AK frames gives PC1 = 0.8934, against 0.8927 for the wδ tangent PCA [D †
    g2].
- *Guard:* a stamp says "a DIMS directed transition; the curve parameter is not time".
- *Beat:* wδ's real advantage is short distances, not path fidelity, and the baseline was missing.

**2.3 Five beads are nearly flat (55 s).**
- *Screen:*
  - λ_min/trace of the gyration tensor for n = 5 and for n = 6 (with Cβ), from 100,000 bgmol frames at stride 10, on a
    log axis (A9);
  - a real near-planar frame turning edge-on;
  - a sketch of the log det barrier: in wδ, the distance to a planar configuration diverges.
- *Numbers:* worst metric condition 1.55×10⁶ against 4.2×10³, and minimum λ_min 1.6×10⁻⁴ against 0.10, both over 800k
  frames [M, Sprint 7 / note 01]. The asset recomputes λ_min on its own subset and prints that subset.
- *Beat:* the data sat on the metric's barrier at infinite distance, where conditioning scales like ε⁻⁴ [D].

**2.4 What one noised sample cost (40 s).**
- *Screen:* the flat pipeline is one line, y = αx + σε. The wδ pipeline is an eigendecomposition, Verlet sub-steps
  with a dense horizontal solve each, times the walk steps, times 500 reverse steps.
- *Numbers:* 0.74 s against ≈253 s (≈340×) against ≈445 s (≈600×) per sample [M, Sprint 7].
- A column of nine struck bug cards follows: tensor transpose, score sign, τ = 2, eigh NaN, TF32, clamp granularity,
  clock mismatch, covector-ISM divergence, invented Jacobian factor.
- *Guard:* "a small cold benchmark; indicative".
- *Beat:* without a closed-form forward kernel, every step was expensive and fragile.

**2.5 The moving baseline (90 s) — CLIMAX.**
- *Screen:* a scoreboard over time. x is the date (Aug → Oct 2026); y is φ/ψ JS on a log axis.
- *wδ points (diamonds):*
  - 0.117 ± 0.007 (Sprint 1, six beads, 3 seeds, 500 reverse steps);
  - 0.103 ± 0.009 (Sprint 5);
  - 0.325 (Sprint 7: 99.96% finite, yet αL at 25.2% against 0.60%, with a reflection-confounded flag);
  - 0.1664 (Sprint 8, six beads).
- *Comparator points (squares):*
  - identity metric 0.479 ± 0.005 and best flat 0.167 ± 0.012 (Sprint 1);
  - flat 0.263/0.268 (Sprint 5) and 0.2405 (Sprint 8);
  - our flat after the vp_mean fix, 0.1012 (2026-10-02, N = 2,000);
  - ScoreMD-native 0.0151 against a floor of 0.0114 [all M].
- Vertical event lines mark the TF32 fix (#252) and the vp_mean fix (#259).
- Within-sprint gold brackets show wδ's lead. When the fixed baseline lands, the bracket inverts. Each sprint has its
  own floor tick (0.011, 0.0114).
- *Guard:*
  - the superseded single-seed "0.180" is shown struck, and the canonical pair is 0.117 against 0.479;
  - n, N, sampler and JS conventions differ between sprints, so cross-sprint pairs carry the no-comparison glyph;
  - stamp: "indicative".
- *Beat:* an advantage over a broken baseline is not an advantage.
- → "Sprint 10 closed on 2026-10-22: flat Cartesian stays the default."

**2.6 Did wδ remove stiffness? (40 s).**
- *Screen:* bars of residual stiffness (κ definition 3; ALDP5 bgmol ±45° windows β/C7eq, αR, αL; note 20 §5.3).
- *Numbers:* flat 192/112/97; wδ δ = 1 413/315/631; δ = 0.1 58/37/76; spring γ = 30 9.6/7.6/13.4 [M].
- A definition stamp reads "conditioning, not a learning result".
- *Beat:* judged by the question that ended the era, wδ made ALDP5 stiffer.

**2.7 The afterlife (55 s).**
- *Screen:* BBA rows at the registered budget (190,350 updates, 100,000 molecules, seeds a/b).
- *Numbers, strengths:*
  - wδ size 0.062/0.072 Å, the best of the study;
  - 0% severe clashes, and 0 per 10⁵ at the first chunk against 682–3,482 for the other maps;
  - contacts 0.0054/0.0067.
- *Numbers, weaknesses:*
  - bonds 0.027/0.034 Å, 86× those of ordered internal coordinates;
  - force-field angles 17.0/18.0°;
  - PMF 0.161/0.198, still better than native ScoreMD's 0.202/0.315 [M #1088, #1138].
- A mirror card shows first-order windows. The closest non-neighbour is readable to t½ ≈ 0.120 in wδ and 0.013 in
  internal coordinates; bonds to 0.014 and 0.26 [D † g2].
- A closing card with a dashed [H] badge: "The barrier that killed (planarity) may be the barrier that saves
  (collisions)."
- *Beat:* wδ kept what the current chart lacks, a wall. That is a hypothesis.

### 3.3 Stiffness, Measured (`stiffness-measured`, 7:20 + explore)

Levers: noise level t, the shared handle; leftover noise s; training checkpoint. Lenses: arm; re-seed.

**3.0 From the toy to the molecule (20 s).** Part 1's two-mode toy (κ = 400, widths 0.036/0.72 Å) [I] slides aside, and
real ALDP5 takes its place.

**3.1 Nine real widths (50 s).**
- *Screen:* the nine principal modes of trajectory 1, drawn as arrows on the five beads (A5 eigenvectors), with widths
  0.0252 … 0.6631 Å [M] on the log ruler.
- *Computed:* the bond/angle/torsion composition of each mode, as the fraction of the mode's squared norm in each class
  of internal-coordinate gradients. A mode is labelled only when one class exceeds 70%.
- *Beat:* the stiff end is bonds and angles; the soft end is the torsions.

**3.2 The noise ruler (60 s, live).**
- *Screen:*
  - log t from 10⁻⁵ to 1, σ(t) in Å at the production scale (×0.9418), and log-SNR above;
  - the production model's trained band [0.01, 1] shaded and the noise floor hatched, with a mark for the low-floor
    model's 10⁻⁵;
  - nine curves r_k(t) = α²λ_k/(α²λ_k + σ²), with λ_k = (w_k/0.9418)².
- *Numbers:*
  - t½ dots at 0.00483, 0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108 and 0.196 [D];
  - readouts at the handle: σ in Å; √2σ on a bond (0.060 Å at 0.01); r_k (0.26 and 0.33 for the two stiffest modes at
    0.01 [D]).
- The narrator parks t at 0.01: a bond length sees 0.060 Å of noise against widths of 0.025–0.031 Å, so SNR < 1 under
  every unit convention [D, g4 §3.6].
- *Live (lever t):* hand-over prompt "find where the bonds become readable". The viewer discovers that this happens
  below t ≈ 0.005, outside the trained range.
- *Beat:* at the production floor, the model never sees a bond.

**3.3 Same noise, two rulers (50 s, live re-seed lens).**
- *Screen:* one real frame, noised at the handle's t with the same seed in two ways:
  - flat Cartesian noise, 0.9418·σ Å per coordinate;
  - noise in thermally scaled internal coordinates (bonds and angles whitened by their trajectory-0 covariance, torsions
    as phase pairs), decoded by NeRF.
- Readouts show bond 1 (Å) and ψ (°) for both, against bars of their data widths.
- *Computed:* local whitening: isotropic feature noise s²I is configuration noise s²(JᵀJ)⁻¹ [D, note 30 §1].
- *Beat:* a chart is a pullback metric. In thermal units, every coordinate moves by its own width.
- A link card points to Covariance (PR #3), which derives "pullback = inverse covariance".

**3.4 The shrinking bond (55 s, live lever s).**
- *Screen:* the real bond-1 histogram and its Tweedie image, with spread ratio w/√(w² + s²).
- *Numbers:*
  - default s = √2 × 0.042 = 0.0594 Å, which predicts 0.39–0.46 [D];
  - measured 0.44–0.53 (#765 at 200k steps) and 0.49–0.58 (#754 at 40k) [M];
  - the stiff-coordinate classifier AUC of the production model rises from 0.655 (5k) to 0.914 (200k) [M #779].
- *Beat:* when the floor is wider than a bond, the last denoising step over-sharpens the bond, and training makes it
  worse.

**3.5 The race (95 s, live checkpoint lever, arm lens) — CLIMAX.**
- *Screen:*
  - five columns: flat low floor (t ≥ 10⁻⁵), flat production floor (t ≥ 0.01), spring, learned warp, wδ;
  - in each, a Ramachandran (36×36) and a bond-1 histogram over the data histogram, recomputed from the 20,000 stored
    molecules of seed 0 at the current checkpoint (A6);
  - below, a log–log panel of bond W1/σ against updates (250 → 200,000): seed-mean lines with seed-range ribbons from
    the protocol evidence, and the three floors (0.010/0.017/0.011) as a hatched band.
- *Numbers* [M #765; mdshare; 3 seeds; 20,000 molecules per checkpoint]:
  - spring 0.018 → 0.013;
  - learned 0.020 → 0.015;
  - wδ 0.042 → 0.018;
  - flat low floor 0.186 → 0.015;
  - production floor 0.981 → 0.173 → 0.422, rising.
- Narration: bonds reach the floor about 100× sooner (≈2k against 200k updates) and angles 10–20× sooner. A torsion row
  follows: every φ/ψ JS line sits inside the floor band (0.0185–0.0226) by 5k.
- *Live:* after the narrator sweeps once, the viewer drags the checkpoint.
- *Guard:*
  - the histograms are display recomputations, and the scores come from the pre-declared protocol;
  - a unit test checks recomputed against protocol bond W1/σ within 5%;
  - stamp: "flat catches up with long training (#886: iid bond widths 0.994–1.049 at 200k, 1.115–1.291 at 20k)".
- *Beat:* stiffness-aware coordinates learn the stiff geometry about 100× sooner. The torsions do not care.

**3.6 The loss does not see the bonds (55 s).**
- *Screen, left:* where bond-width information is lost, drawn on the noise ruler (the retention pilot's wide MLP, A7).
  Flat loses it between t = 0.0023 and 0.033, which is 3% of uniform training times. spring16 loses it between 0.050
  and 0.28, which is 24% [M #929].
- *Screen, right:* a loss trace with minibatch scatter 0.02–0.07 and a 0.001 notch. "Going from 8.5% to 5% too broad
  lowers the ideal loss by about 0.001, while the bond PMF error falls by a quarter" [M, pilot / LESSONS D18;
  reproducible only approximately].
- A reconciliation card with Part 1 Problem 3: "Part 1 priced a 5% error in score units (×κ at one noise level). The
  samples feel errors in ångström, where the flat loss barely registers bond widths. It is one wrong ruler, seen from
  both sides."
- *Beat:* the loss is blind where the noise is blind.

**3.7 What did not improve (55 s).**
- *Numbers:*
  - torsion PMF at 200k: spring 0.332 against flat 0.355 kT², about 2 SD and within panel effects [M];
  - flat learns the αL population faster (ΔF error 0.016 against 0.077 kT at 20k) [M];
  - the barcode from 1.5 returns: the three references give ΔF 3.40 / 4.09 / 3.15 kT, so every model inherits about
    0.7 kT [M].
- A "κ rails" card shows four rails with no arrows between them:
  - the Hessian toy, 400 [I];
  - residual stiffness 192 → 9.6, bgmol [M];
  - 1 ps step anisotropy 184 → 2.99, mdshare [M];
  - whole-data ≈920, bgmol [M].
- *Beat:* stiffness removal fixes only the stiff part. Populations stay limited by the reference.
- → Pointers to pieces 4 and 7.

### 3.4 Twenty-Eight Beads (`bba-two-halves`, 7:45)

**4.0 Title (8 s).**

**4.1 A lens that makes every step round (60 s).**
- *Numbers:* median local 1 ps step anisotropy (κ definition 5, mdshare): flat 184/185, constant whitening 24.6, scaled
  internal 3.88–3.95, learned warp 2.99–3.04, with a floor of 1.55; ALDP10 goes from 1,780 to 3.62 [M].
- *Screen:* ellipse glyphs with axis ratio √κ. The geometry is [I]; the numbers are [M].
- *Beat:* a map fitted only to 1 ps steps finds the bonds without any chemistry.

**4.2 The lag dial, and the correction of 5 November (75 s).**
- *Numbers* [M, 2 seeds, CPU]:
  - JS at 100 updates: flat 0.117; warps at 1 / 10 / 100 ps 0.127 / 0.049 / 0.027;
  - at 20k: 0.0203 / 0.0236 / 0.0227 / 0.0230;
  - KL to a Gaussian: 0.96 / 0.96 / 0.20 / 0.14;
  - Gaussianized torsions 0.042 against the linear-torsion control 0.255 at 100 updates.
- A ledger strike: "synchronized erasure [H]" is refuted by the γ sweep the same day. The lever is Gaussianization [M].
- The cost: the αL saddle holds 30 per 10⁴ against MD's 4–6, as Diepeveen 2025's unimodal scope warns [S].
- *Beat:* a fast start came from making the data Gaussian, not from removing stiffness, and it cost the rare barrier.

**4.3 Same maps, new molecule (55 s).**
- *Numbers* [M, 100k iid, 2 seeds; floors 0.008 / 0.07]:
  - #895: bond W1 Cartesian 0.6371 against springs 0.0122 Å (52×);
  - TIC JS 0.0529 against 0.0479;
  - whitening 0.2499, with PMF 4.832.
- The count dial appears. For the same flat models, PMF falls from 6.57 to 0.56 between 2,000 and 100,000 molecules.
- *Beat:* on BBA the benefit stayed local.

**4.4 The two halves (75 s) — CLIMAX.**
- *Screen:* a 2×2 grid, local geometry good/bad against global size good/bad. The first-chunk models sit in it (190,350
  updates, seed 0, 100k molecules) [M]:
  - internal: bond 0.000274 Å, angle 0.166°, Rg 0.521 Å (local ✓, global ✗);
  - Cartesian: 0.415 Å, 5.24°, 0.072 Å (local ✗, global ✓);
  - springs: 0.320 / 8.85 / 0.078;
  - whitening: 0.705 / 24.4 / 0.497, with 96,271 of 100,000 decoded.
- The empty ✓✓ cell glows gold: "wanted".
- One real data molecule sits beside the grid. If A-REQ-1 is delivered, three generated molecules per model join it;
  otherwise the stamp reads "generated molecules not exported; scalar results only".
- *Guard:*
  - floors at 100k (bond 0.0002 Å, Rg 0.006 Å);
  - the budget clock at 10%;
  - a single-seed stamp.
- *Beat:* on BBA every chart got one half right.

**4.5 Each map failed for a measured reason (80 s).**
- *Screen:* the #1025 heat grid of σ*/σ(t_min), where ≤ 1 means never resolved [M, first order]:
  - Cartesian: bond 6.4 at σ(t_min) = 0.0010, rising to Rg 351;
  - internal: bond 22, Rg 3.0;
  - springs: bond 0.84, angle 1.2;
  - whitening: 7.7 / 39 / 85 / 38;
  - wδ: bond 1.25.
- *Three vignettes:*
  - *Springs under water:* one global RMS divisor of 27.1 (ALDP5: 1.31) puts each channel's sd at 0.037, below
    σ(t_min) = 0.045.
  - *Noise that leaves the molecule:* 3,303 channels for 78 degrees of freedom; 3,225 normal directions; 94% of the
    low-noise loss is off the image.
  - *Cartesian could not read distances:* with pair-distance inputs, bonds go from 0.76 to 0.013 Å (50k) and from
    0.4207 to 0.0078 Å (190,350) [M].
- *Guard:* "screen, not a learning measurement".
- *Beat:* each failure had a cause that can be measured without training.

**4.6 Size is long range (60 s).**
- *Computed:* Rg² = Σ_kl W_kl b_k·b_l, with W_kl = (min(k,l)+1)(N−1−max(k,l))/N² [D]. Heat maps show W and the data's
  B_kl = E[b_k·b_l] from real frames (A11).
- *Numbers:* 92% of C3's excess ⟨Rg²⟩ comes from pairs at least 11 apart [M #1010–1015; transcribed group shares].
- *Beat:* no local fix can reach the error.

**4.7 Prediction is not generation (40 s).**
- *Numbers* [M]:
  - about thirty loss and target changes; none improved generation;
  - potential supervision worsened BBA size by 0.245/0.244 Å;
  - reruns from identical initializations differ by 0.046 Å, the seed-noise floor.
- *Beat:* the objective was not the problem; the chart was.
- → Piece 5.

### 3.5 Noise on a Real Protein (`range-order-measured`, 11:45 + explore) — MVP

Levers: t, the shared handle; γ; L²; m. Lenses: chart; molecule (8 held-out frames).

**5.0 Title (8 s).** One real held-out BBA molecule dissolves in four panels.

**5.1 Readable means decided (55 s).**
- *Screen:*
  - R_h(t) = Var(E[h|Y_t])/Var(h), its floor property (any predictor gives R² ≤ R_h) and its monotonicity;
  - "the exact reverse process has the forward joint law, so R_h(t) is the fraction already decided" [D, note 27 §1];
  - a ghost of Retention's toy curve, with the credit "see Retention".
- The glyph grammar is introduced: an outline means undecided, a fill means decided.
- *Beat:* the noising chart sets the generation order.

**5.2 Four charts, one molecule (110 s, live t lever, chart lens).**
- *Screen:* four panels.
  - Cartesian, noised in units of 6.252 Å.
  - Internal coordinates C3.
  - Ordered internal coordinates: C3 plus two loud vectors c₀a₁ and c₀a₂, drawn as teal arrows at the centroid.
  - wδ log distances, at RMS scale 0.3138.
- Each panel shows the plug-in decode of y_t/α_t. Cartesian and C3 are noised live in JS from stored clean features;
  wδ and the joint rebuild are precomputed at 31 levels and snap to the nearest one, which is labelled.
- *Readouts per panel:* bond RMSE against the clean molecule (Å), Rg (Å), the closest non-neighbour distance (rose
  below 3.5 Å), and |a₁|.
- *The narrator performs four stops:*
  - **t = 0.0004:** Cartesian beads blur by 0.040 Å per coordinate, which is 0.057 Å on a bond length, one bond sd.
  - **t = 0.01:** Cartesian beads blur by 0.28 Å and the bonds are gone. In internal coordinates the bonds are intact,
    but each torsion is blurred by 1.70°. In wδ the bonds begin to blur (0.046 Å) while contacts stay protected.
  - **t = 0.1:** each torsion is blurred by 12.96° and the internal chain's far end flails. This is anti-order, visible.
    The teal arrows barely move.
  - **t = 0.3:** the internal fold is gone and the Cartesian fold is dissolving, but the arrows still carry the size.
- *Numbers:* blur s·6.252 Å [D]; torsion blur s/κ with κ = 1.5044 [D].
- *Guard:*
  - "each frame is a correct noisy sample at its level; the sequence is one draw rescaled, not a diffusion path";
  - "a plug-in decode is not what the noisy state still knows" (5.3 shows that);
  - the ordered model's study decoder ignores the block, so the arrows are drawn as what they are.
- *Beat:* the same noise level means different things in different charts.

**5.3 The erasure clock (90 s).**
- *Screen:* first the measured t½ values meet on a number line ("measurement before picture"). Then lanes paint, one per
  chart, with glyphs for bond, angle, torsion, contacts, long range, end-to-end and Rg.
- *Lane sources:*
  - Cartesian, C3 and C1: best-estimator t½, note 27 §5 [M, lower bounds];
  - +2 loud, +2 whitened and +8 at loudness 15: first order, `bba_charts.json` [D, screen];
  - wδ: [D † g2];
  - EigenFold and Chroma (#1099) [M]. EigenFold runs on its own clock and is drawn on a broken axis, as ratios.
- The trained bands are shaded and the noise floor hatched.
- *Readouts:*
  - Cartesian has order without range: bonds at 0.0004 < 0.01, which is 0.04% of its training draws [D];
  - C3 has range without order: everything between 0.18 and 0.35;
  - C3 is anti-ordered: end-to-end 0.18 sits below its torsions at 0.35.
- A side card, "same word, four windows", gives C3's Rg window under four estimators: 0.19 (first order), 0.23 (weaker
  estimator), **0.27–0.28 (best; the canon)** and 0.30 (decoder-linearized). Each tick carries its estimator.
- *Beat:* range and order, measured.

**5.4 Why the whole goes before its parts (75 s, live lever m).**
- *Computed:* the exactly solvable chain: 28 beads, 3.8 Å bonds, 110° angles, independent uniform torsions, κ = √2
  (`exact-uniform.json`, 20,000 queries) [D, exact].
- *Numbers at t = 0.2:* one torsion 0.72; b_k·b_{k+4} 0.47; b_k·b_{k+12} 0.08; b_k·b_{k+26} 0.004; Rg² 0.44.
- The overlay r(t)^{(2/3)(m−1)} is drawn as an approximation.
- Back on the real molecule: at t = 0.05 a torsion blur of 6.63° moves beads on a 5–10 Å lever arm by 0.58–1.16 Å [D].
- *Guard:* "independent torsions; BBA's are correlated".
- *Beat:* anti-order is a theorem for chains (Prop. 1).

**5.5 Two loud arrows (80 s).**
- *Screen:* the full 27-mode spectrum from `collective_modes.json` in feature units: 15.03, 6.00, 2.90, 1.28, 0.49, …,
  0.0105 [M, fitted on 1,300,156 frames], with a t½ dot for each.
- *Numbers:*
  - size-response shares λ²/Σλ²: 83%, and 96% for the first two [D, d3-check from the JSON];
  - conformational variance of the mode lengths, 6.86 / 2.52 / 0.94 / 0.60, against a torsion loudness of 2.0. Only
    two poke above that line [D];
  - Rouse cosine overlays with overlap 0.99, 0.99, 0.91, 0.92 [M];
  - on the real molecule, mode 1 is the hairpin-versus-rest separation (88% aligned [M #1057]).
- A new ledger card, the newest result: training with Rouse directions instead of fitted ones keeps generation quality
  at 190,350 updates. The decoded Rg W1 is 0.107/0.096 against 0.097/0.098, under an effect threshold of 0.010; the
  verdict is "supports" [M, lab #1141, 2026-11-19].
- *Beat:* only two collective modes are louder than a torsion, and they follow from the chain graph.

**5.6 The order dial, trained (70 s, live lever γ).**
- *Computed:* effective variances ∝ λ^{1−γ}, renormalized. The extreme ratio runs 1,428 → 232 → 38 → 6.1 → 1, and the
  first/last t½ runs from 0.52/0.028 to 0.26/0.26 [D; computed from the JSON, where note 27 prints 1,423].
- *Trained dots* [M #1057; 50k updates; one seed except at γ = 1; 20,000 molecules; Rg floor 0.016]:
  - Rg W1 0.499/0.514, 0.187, 0.120, 0.081 Å;
  - TIC JS 0.107, 0.083, 0.081, 0.086 (floor 0.037);
  - torsion error not monotone (9.7–10.4 / 6.5 / 7.1 / 9.1°).
- *Live:* the viewer drags γ and discovers that populations do not follow.
- *Guard:* one seed per γ; the dose-response holds for size only.
- *Beat:* size follows the order; populations and torsions do not.

**5.7 Who corrects whom (70 s, live lever L²).**
- *Screen:* a 2D toy. A data graph y_B = g(y_A) with slope L; the normal n ∝ (−L, 1); bars for L²/(1+L²) and
  1/(1+L²).
- *Numbers:*
  - L² = 1 / 16 / 63 → 0.50 / 0.94 / 0.98 [D, Prop. 2];
  - measured chain-model gains: 0.43–0.55 / 0.85–1.03 / 0.90–1.09;
  - BBA constraint shares: 27/44/68%, 74/87/96% and 92/97/99% [M].
- Then the block-size strip [M #1057/#1069; seed means; one seed at K = 1, 16 and 27; K = 1–8 tie by the effect rule]:
  - Rg W1 0.477 → 0.161 → 0.105 → 0.136 → 0.152 → 0.325 → 0.399 for K = 0, 1, 2, 4, 8, 16, 27;
  - constraint directions 3K − 3 (one for K = 1);
  - derived channels 0 … 3,303.
- *Beat:* the louder block leaves the correction to the quieter one. Two vectors are enough; more cost local accuracy.

**5.8 Decided first (75 s) — CLIMAX.**
- *Screen:* a genuine forward VP path of one real molecule in the ordered chart, played backward. It uses Markov
  increments on the 1,000-step geometric grid, with every 40th step shown.
- For the exact process, a forward path played backward is a reverse-process sample [D]. The teal arrows settle first;
  the chain locks later.
- Overlaid are the trained model's reverse-path gauges (#1133, seed 2) [M]:
  - the R² of chain |a₁| on block |a₁|: 0.13 (t = 0.6), 0.29, 0.37, 0.43, 0.44, then **0.63 at t = 0.13** (predicted
    0.26–0.1), then 0.91 and 0.97;
  - mean |a₁|, block against chain: 21 against 59 Å at 0.6, 40 against 41 Å at 0.13;
  - the share of compact molecules that already have their final χ sign: 0.55 → 0.65–0.69 → 0.88.
- *Guard:*
  - "exact only for the exact reverse process";
  - "the gauges are posterior means, not samples; the chain is too extended at high noise by construction".
- *Beat:* the loud block decides the size first, and the chain follows from t ≈ 0.13, as predicted.

**5.9 What the block cannot supply (60 s).** Four panels on the real molecule:
- *The wall is a range failure:* the closest non-neighbour has t½ 0.013 (internal) and 0.025 (+2 loud) [D]; blur at the
  floor is 0.32–0.36 Å against the 3.9 → 3.5 Å margin [M]; the model overlaps 12–20% of its molecules against
  0.004–0.01% in the data [M].
- *Handedness:* |a₁|, |a₂| and a₁·a₂ are mirror-symmetric, so χ needs a third vector [D].
- *Kinematics:* the median block/chain mismatch is 0.42 Å, against a floor of 0.15 Å [M #1102].
- *Soft forces:* the information from one level scales as σ² [D].
- Each panel links to its repair: the joint rebuild (piece 6) or the fitted wall (piece 7).
- *Beat:* each remaining defect sits where the theory says a block cannot help.
- → End card (12 s): the piece's ledger.

### 3.6 Results, With Their Floors (`results-floors`, 7:40)

**6.0 Title (8 s).**

**6.1 How to read a result (50 s).** The anatomy of one number: Rg W1 = 0.117 / 0.091 Å. Its parts light in turn:
- ordered internal coordinates;
- 190,350 updates (10%, on the budget clock);
- fresh seeds 2/3;
- N = 100,000;
- held-out floor 0.006 Å;
- source `real-budget-study.md` (2026-11-15).

Then the effect rule [D, #1069]: a gap between seed means counts only if it exceeds the largest two-seed difference.
*Beat:* a number is its whole label.

**6.2 The registered budget (80 s).**
- *Screen:* dot strips per metric (bond, angle, size, contacts, population, clashes), each on a log axis with seed
  ticks joined by seed bars and a floor band. Nine models [M #1088].
- *Narrated effect checks:*
  - against ScoreMD: bonds ×119, angles ×8.5;
  - against Cartesian on size: the gap 0.030 exceeds the spread 0.026, so "narrowly behind" is an effect;
  - populations tie (0.0125/0.0130 against 0.0123/0.0126, floor 0.0087–0.0095).
- The pre-registered criterion line Rg ≤ 0.11 is met on seed 3 (0.091) and missed on seed 2 (0.117).
- *Guard:* ScoreMD's seeds differ (0.157 against 0.532), so a tie with it comes from that spread.
- *Beat:* it is the only model near the best on both scales.

**6.3 Two halves, one model (85 s) — CLIMAX.**
- *Screen:* the project's own saved plane (#1127), on log–log axes: x is angle W1 (°), y is Rg W1 (Å). Only 100k-molecule
  panels; one dot per seed, joined by seed bars.
- Families are told apart by glyph. A floor box marks the held-out values (0.05°, 0.006 Å).
- *Arrows:*
  - C3 → ordered internal: adding the block;
  - ordered → joint rebuild with hard core: 0.083 / 0.070;
  - the budget path of the ordered model: 0.117/0.091 → 0.120/0.096 → 0.111;
  - and of C3: 0.455/0.418 → 0.468/0.432 → 0.455 [M; the 1.9M point is one seed, open PR #1104].
- A lens switches the x-axis to bond W1.
- 50k results (20,000 molecules) appear only in a separate inset with its own floor (Rg 0.016 Å).
- *Beat:* ordered internal coordinates sit alone near the corner and stay there with 10× training.

**6.4 The budget clock (50 s).**
- *Screen:* the 1,903,500-update cosine with stops at 2.6, 10, 20 and 100%.
- *Numbers:* learning rate at 99.8, 97.6, 90.8 and 3.3% of its peak; epochs 39, 150, 300 and 1,499 [D]; the size error
  per stop is flat for both models [M].
- The 1.9M force field is marked "improved, 0.24–0.34 → 0.118 Å" and flagged as a point on a drift (piece 7).
- *Guard:* seeds differ between stops; one seed at 1.9M; five models were chosen after stage 1 (recorded amendment).
- *Beat:* the block changes where training ends, not only how fast it gets there.

**6.5 Using the six discarded numbers (60 s).**
- *Numbers* (same 100k panels) [M #1105/#1107]:
  - internal-only decode: overlaps 14.5/15.3%, Rg 0.117/0.091;
  - joint fit without core: 19.3/20.1%, 0.077/0.064;
  - **joint fit with core: 0.0/0.0%, 0.083/0.070**;
  - control (internal plus core): 0.0%, 0.131/0.105;
  - the late repulsion, a sampler change: clashes 0.60/0.66% → 0.02/0.02% [M].
- *Guard:* "0% by construction (3.6 Å core against the 3.5 Å test); a read-out repair, not learned".
- *Beat:* the block carries correct global information that the decoder threw away.

**6.6 The floor moves with the count (75 s, lens: count dial).**
- *Screen:* a log–log plot of floor against N, with the heuristic 2K/N [D] drawn alongside.
- *Floors:*
  - BBA paper-PMF floors 0.56 / 0.18 / 0.080 / 0.039 / 0.025 at 20k / 50k / 100k / 200k / 325,039, i.e. N × floor ≈
    8,000 [M #1138];
  - ALDP5 floors (mdshare): PMF 5.22 / 0.300 / 0.096 / 0.042 and JS 0.130 / 0.0187 / 0.0084 / 0.0047 at 2k / 20k / 50k
    / 100k [M, recomputed by r8; the A17 script reproduces them].
- *Model points at 100k:* covariance base 0.096, ordered internal 0.097, C3 0.113, Cartesian 0.116/0.113, wδ
  0.161/0.198, ScoreMD 0.202/0.315; floor 0.080 ± 0.001.
- Paper Table 1 stands on its own vertical at 1,300,156 [S]: 0.034, 0.234 and 0.254. A no-comparison glyph sits between
  the two columns. The inference "≈0.02 at the paper's count" is dashed [H].
- *Beat:* a PMF score means nothing without its sample count.

**6.7 Declared, not yet run (40 s).** Hourglass cards:
- #1137, a whitened block (predicted retained share f ≈ ½ [H]);
- #1136, the corrected 100–300 ps drift;
- #1113, 500 ps runs;
- the PMF at the paper's count;
- Chignolin (not trained; the transfer check read dummy frames, so it is excluded).

*Beat:* this is what would change our minds. → End card (10 s).

### 3.7 One Model, Two Uses (`forces-measured`, 8:50 + explore)

Levers: read-out level t; volume term (wrong/right). Lenses: arm; drift-panel set.

**7.0 Title (8 s).**

**7.1 ScoreMD's seesaw (65 s).** A beam glyph tips between two failures [S]:
- *ALDP:* Diffusion has iid PMF 0.095 but simulated PMF 1.047 ± 0.924, because it misses φ > 0. Two For One simulates at
  0.206, but its simulated C–N bond is 23.51× worse. Both reaches 0.097 / 0.091.
- *BBA:* Diffusion 0.034 / 5.387; Two For One simulates at 1.624 (read at t = 0.005); Both 0.234 / 0.254, an iid cost of
  about 7×.

*Beat:* read the force early and the landscape is wrong; read it late and the bonds blur. The thesis set out to fix
this.

**7.2 The blur dial (70 s, live lever t).**
- *Computed:* a perfect model read at level t on the nine real ALDP5 modes. The restoring strength scales by r_k(t) and
  the simulated width by 1/√r_k [D].
- *Numbers:*
  - at 0.01 the two stiffest modes widen 1.95× and 1.75× [D];
  - measured force checks of the flat production model: 0.198 and 0.252 for the two stiffest directions, and simulated
    bond spread 2.38–2.48× [M #768];
  - the spring model read at 0.03 gives Stein ratios near 1 [M];
  - in thermal units, r(0.02) = 0.994 and r(0.05) = 0.971 [D].
- *Beat:* a force read at level t is the force of the blurred molecule. In thermal units the blur is tiny.

**7.3 One model, two uses on ALDP5 (80 s).**
- *Screen:* a consistency diagonal. x is the iid bond width divided by MD's; y is the simulated bond width divided by
  MD's.
- *Numbers* [M #886: conservative transformer, 2 seeds, 200k updates, read at t = 0.05]:

  | Map | iid | simulated |
  |---|---|---|
  | aligned Cartesian | 1.006–1.090 | 2.328–2.778 |
  | fixed-units Cartesian | 1.170 | 8.750 |
  | springs | 0.966–1.022 | 0.993–1.066 |
  | wδ | 0.954–1.002 | 1.187–1.328 |
  | invariant whitening | 0.956–1.016 | 1.036–1.100 |

- Stein bars from #768: production floor 0.20–0.29, spring 0.97–1.03, learned 0.96–1.00 [M].
- *Guard:* "a common force time is not a common physical smoothing"; "not a head-to-head with ScoreMD (other data, no
  Fokker–Planck term)".
- *Beat:* metric-shaped coordinates hug y = x, and flat ones do not.

**7.4 Walkers from β (60 s, arm lens).**
- *Screen:* a replay of the real traces (sim-beta: 150 of 500 walkers, 60,000 Brownian steps, record every 300) on the
  Ramachandran plane, with small multiples for all 15 runs.
- *Numbers* [M; d3-check, last record, αR = φ < 0 and ψ < 60°]:
  - flat low floor, seed 0: 89% αR, against MD's 35%;
  - flat low floor, seed 1: 31% φ > 0;
  - one wδ seed stuck at 5%;
  - learned and spring: 17–34%.
- *Guard:*
  - the statistic is stated: #768 reports 83% for seed 0 with its own statistic;
  - "not equilibrated; Brownian steps without physical time".
- *Beat:* passing a local force check does not make the landscape right.

**7.5 BBA: the drift that does not stop (90 s) — CLIMAX.**
- *Screen:* size error against simulated time, built up in four layers:
  1. The study panels (256 + 256 paths; windows 0–10 / 40–50 / 90–100 ps; cache) for every family at both of its
     levels. The loud-mode rows are muted and badged "wrong volume term, superseded 11-16".
  2. Corrected loud seed 3 at t = 0.05: 0.24 / 0.30 Å [M #1100].
  3. 2,048-path panels at 100 / 200 / 300 ps: 0.158–0.277 / 0.229–0.492 / 0.396–0.642 Å [M #1130].
  4. The full-schedule point, 0.118 Å [M #1104, one seed].
- Floor bands: 256 + 256 paths, mean 0.167 Å (95% below 0.26); 1,024 + 1,024 paths, 0.084 Å.
- *Guard:* "a 100 ps number is a point on a drift"; "BBA folds on microseconds; no run here reaches equilibrium".
- *Beat:* every force field still compacts. Each fix lowers the curve; none has flattened it yet.

**7.6 The phantom spring (70 s, lever: volume term).**
- *Screen:* 2,000 real training frames reweighted by the difference between the rotation-invariant and immersion volume
  factors (A18).
- *Numbers:*
  - mean Rg 10.81 → 9.64 Å on #1103's frames, and 10.66 → 9.58 Å on #1100's frames. They are separate rows and are
    never merged;
  - an inward force of about 0.6 kT/Å [M];
  - a radial toy: dropping the Jacobian turns a 2D Gaussian's Rayleigh mean of 1.253 into a half-normal mean of 0.798
    [D];
  - the simulated size error falls from 0.98 to 0.24 Å [M].
- A ledger strike: "the loud block adds nothing in simulation (2026-11-15)" is marked superseded (2026-11-16, #1100).
- *Beat:* one wrong determinant looks exactly like a physical attraction.

**7.7 The wall nobody learned (75 s).**
- *Numbers:*
  - wall z ≈ 15 standard errors at every level, and unchanged after training lower (9.9 → 9.6 and 15.0 → 15.0)
    [M #1101];
  - contact blur with K = 2: 0.85 / 0.22 / 0.13 / 0.05 Å at 0.05 / 0.01 / 0.005 / 0.001 [D, linearized].
- Two errors that cancel:
  - a wall-only fit swells the mean Rg to 11.31/11.13 Å against the data's 10.60 [M #1106];
  - adding one size term (−0.161 per Å) takes overlaps from 21.3/18.4% to 0.0%, keeps size at 0.267/0.175 →
    0.263/0.173 Å, and lowers the pair error from 0.062/0.055 to 0.042/0.032 (floor 0.037) [M #1109];
  - in linear response, 0.16 × 4.8 Å² ≈ 0.8 Å [D, an estimate].
- *Beat:* the wall must be supplied, and supplying it unmasked a hidden error.

**7.8 End card (12 s): what we can claim now.** Four claim cards with badges:
- large, reproducible gain [M];
- mechanisms that predicted the block size and the takeover window [D→M];
- each defect sits where the theory says it would [D/M];
- cheap repairs that transfer [M].

A fifth card lists what we cannot claim yet: equilibrium, transfer and the paper's count.

### 3.8 The Ledger (`explorables/evidence-ledger.html`)

The explorable is a theme-aware standalone page. It loads `src/data/evidence/ledger.json`, the same file the videos
read. It has five views:
1. **Table** of every on-screen number. Each row gives the value, unit, badge, definition, system, data set, budget,
   seeds, N, floor, source and date, the status (current, superseded or open, with the superseding id), and the scenes
   it is used in.
2. **Compare:** pick two numbers. The guard checks definition, system, data set, N and budget, and shows any mismatch
   instead of a ratio.
3. **Floor dial:** floors against N for every metric family.
4. **κ rails.**
5. **Claim timeline:** dated cards with strikes.

---

## 4. Recurring visual devices and conventions

**Colour.** The house meanings stay: soft `#6cc4e8` for soft and slow coordinates (torsions), stiff `#ef8a5b` for
bonds and angles, gold `#f2cf63` for the object of attention (cursor, focal model, current claim). This programme adds:
- **loud teal `#4fd1c5`**: the collective block (a₁, a₂, the modes, Rouse cosines);
- **contact rose `#f497c0`**: excluded volume, overlaps, the wall;
- **data neutral `#d3d7e0`**: real MD frames and histograms, which are the reference and so are not coloured;
- **generated muted `#8a96ad`**, unless the model is focal.

Model identity uses **glyph shape, not colour**:
- square: Cartesian family;
- circle: internal family;
- circle with a teal ring: ordered internal;
- diamond: wδ;
- triangle: springs;
- inverted triangle: whitening;
- hexagon: ScoreMD;
- cross: warps.

So stiff orange never doubles as a model colour.

**Badges.** These are monochrome pills at the top right of a number or plot, legible in grayscale:
- [D] filled ink disk;
- [M] ink ring;
- [H] dashed ring (uncertainty is dashed everywhere);
- [I] hollow square (drawn, not measured);
- [S] ring with a serif "S" (cited);
- † a small dagger: derived by a reader, unofficial.

Status overlays:
- **superseded**: muted to 45%, a strike line drawn left to right over 0.6 s, and a date stamp ("superseded 11-16 ·
  #1100");
- **open**: an hourglass with "declared, not run · #1137".

**Provenance strip.** A Plex Mono line at 13 px sits under every result panel: `BBA · DESRES 1.30 M frames · 190,350
upd (10%) · seeds 2/3 · N = 100,000 · floor 0.006 Å · real-budget-study.md (2026-11-15)`. It always lists system, data
set, budget, seeds, N, floor and source. A missing field is written "—". It is never dropped.

**The two floors.**
- The **noise floor** is a vertical band of diagonal hatching ("\\\") below t_min on every t axis, labelled "noise
  floor t_min = 0.01 (internal) · 10⁻⁵ (Cartesian)".
- The **sample floor** is a horizontal band of "///" on metric axes, labelled "floor @ N = 100,000".
- Both are muted grey at 25% alpha. Orientation and label tell them apart.
- A number is never drawn without its floor when a floor exists. When two counts meet, each brings its own band.

**The noise ruler** is one shared handle across pieces 3, 5 and 7. It is a log-t scrubber with log-SNR above and the
active Å scale below (×0.9418 for ALDP5 production, ×6.252 for BBA Cartesian, or channel units). It is always the
same lever with the same hand-over gesture, following u1's "reuse one handle" rule.

**The erasure clock.** Lanes per chart and glyphs per feature:
- bond: a short double bar; angle: a chevron; torsion: a circular arrow;
- contact: two touching discs (rose); long range: a long dumbbell; end-to-end: a bracket;
- Rg: a disc with a radius; TIC: a wave.

A glyph is outlined while undecided and filled once decided. Lanes from different estimators carry an estimator chip.
First-order and measured values never share a lane unmarked.

**Budget clock.** A 120 px cosine bar (0 → 1,903,500) with a gold tick at the result's budget and a "% of peak LR"
readout. It sits next to every BBA trained number.

**Seed bars and effect gauge.** Two ticks per model are joined by a bar. The gauge reads "gap 0.030 vs largest seed
spread 0.026 → effect" and turns gold only when the rule is met.

**No-comparison glyph.** A "≠" chip names the mismatch ("N 100k ≠ 1.3M", "def. 3 ≠ def. 5", "bgmol ≠ mdshare"). It
replaces any arrow or ratio across a mismatch.

**Count dial.** An N slider that moves floor bands live, using the measured floors where they exist and the heuristic
elsewhere [D].

**Numbers.**
- Plex Mono with tabular figures, a real minus sign and units always.
- Seeds are shown "a / b" and never silently averaged. Averages carry the label "seed mean".
- Ranges are written "0.44–0.53".
- Digits are kept as in the source: no rounding away of differences that matter and no added digits.

**Real molecules.**
- ALDP5: the kit's `drawMolecule` with element colours, and a 22-atom ghost in 1.1.
- BBA: a Cα tube (`polyline3` with depth sorting), hairpin and helix spans labelled by brackets rather than colour.

**Narration rules** follow a2 and a3: 1.6–2.2 words/s, a formula fades in when it is named, and every narrated number
comes from the ledger (§5.3).

---

## 5. Computation and data catalogue

### 5.1 Computed objects

All of these live in DOM-free JS (`src/model/evidence/*.js`) with Node tests. Expected values come from the reports and
my checks.

| Object | Definition | Test targets |
|---|---|---|
| VP schedule | B(t) = 0.1t + 9.95t², α = e^{−B/2}, σ = √(1−α²), s = σ/α | σ(0.01) = 0.04464; s(0.05) = 0.17414; α(1) = 0.006572 |
| Linear half-erasure | r(t) = α²λ/(α²λ+σ²); t½(λ) = (−0.1+√(0.01+39.8 ln(1+λ)))/19.9 | t½(1) = 0.259; 15.5 → 0.526; 6.2 → 0.440; 3.0 → 0.368; 1.3 → 0.284; 0.011 → 0.0285; v = 1/0.3/0.1/0.03 → 0.26/0.16/0.09/0.05; loudness 4.2×10⁻⁵ → 0.00040; 0.0031 → 0.0133 |
| ALDP5 mode windows | λ_k = (w_k/0.9418)² | t½ = 0.00483, 0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196; r(0.01) = 0.264, 0.328, …; widening 1.95/1.75 |
| Tweedie shrink | w/√(w²+s²) | s = 0.0594: w = 0.025 → 0.388; 0.031 → 0.463 |
| γ spectrum | λ^{1−γ}, renormalized to mean 1 | from A12: ratio 1,428/232/38/6.1/1; first t½ 0.523/0.499/0.454/0.374/0.259; last 0.028/0.065/0.127/0.200/0.259 |
| Size response | λ_p²/Σλ²; λ_p/Σλ | 0.830, 0.962 (first two); 0.557, 0.779 |
| Constraint split | L²/(1+L²) | L² = 1/16/63 → 0.50/0.94/0.98 |
| Torsion readability | r(t) = E[(I₁(k)/I₀(k))²], k = ακ\|y\|/σ², seeded Monte Carlo or quadrature | κ = √2: 0.940 (0.1), 0.716 (0.2), 0.530 (0.26) within 0.005 |
| Lever-arm blur | s/κ in degrees, κ = 1.5044 | 1.70° (0.01), 6.63° (0.05), 12.96° (0.1) |
| Count heuristics | E[JS] ≈ K/(4N), E[PMF] ≈ 2K/N | right order of magnitude against A17 (25% low at 100k) |
| αL Markov sd | (1−w)√(2/n) | 0.225/0.229/0.223 for w = 3.24/1.65/4.11%, n = 37 |
| Effect rule | \|mean_A − mean_B\| > max(spread_A, spread_B) | Rg, ordered against Cartesian: 0.030 > 0.026 → true |
| Budget clock | lr(u) = 10⁻⁵ + (3·10⁻⁴ − 10⁻⁵)·½(1 + cos πu/1,903,500) | 99.8/97.6/90.8/3.3% of peak; epochs 39/150/300/1,499 |
| Rg² weights | W_kl = (min+1)(N−1−max)/N² | Σ W_kl b_k·b_l = Rg² on A10 frames to 10⁻⁹ |
| C3 encode/decode | log bonds, log tan(θ/2), Cholesky whitening with (μ, L) from A13, phases κ(cos, sin); decode by atan2, unwhitening and NeRF | round trip below 10⁻⁹ Å on A13 frames; agreement with Python decodes below 10⁻⁵ Å |
| Kabsch, RMSD, thermal distance | proper rotation; d_th = √(ΔqᵀΣ⁻¹Δq) | A3 pairs: 0.036/4.0 and 0.243/1.46 |
| Force-ratio table | note 29: v/(α²v+σ²); driver: α²v/(α²v+σ²) | g4 §3.11, e.g. v = 0.01, t = 0.05: 0.256/0.248 |
| Radial Jacobian toy | stationary radial mean with and without the 1/r term | 1.2533 against 0.7979 (2D) |
| Two-bead EM widening | 1/√(1−hk) | βk = 1,100–1,660 Å⁻², h = 10⁻⁴ Å² → 6–9% |

### 5.2 Data assets

**How the scripts run.** Scripts live in the animation repo under `tools/evidence/` and are not bundled. They run with
`LOCAL/.venv/bin/python -I tools/evidence/aNN_*.py --local LOCAL --rg-src SP/rg-main/src`.
- The venv's editable install points at a checkout on an unrelated branch. So each script inserts `--rg-src` into
  `sys.path` and asserts that `riemanniangenerativemd.__file__` lies under it.
- Outputs go to `src/data/evidence/<id>.json` and are imported through esbuild's JSON loader. Heavy videos use PR #3's
  lazy-load pattern.

**Common header:**
```
{"schema": "evidence-asset-v1", "id": "A13", "created": "...", "script": "tools/evidence/a13_bba_noised.py",
 "script_sha256": "...", "inputs": [{"path": "data/deshawresearch-bba-ca28/heldout.npy", "sha256": "11b1c7e8…"}],
 "rg_commit": "c099347a", "badge": "M", "notes": "...", "data": {...}}
```

Arrays are stored as `{"dtype": "int16", "scale": 0.01, "shape": [...], "b64": "..."}`.

**Assets on ALDP5:**

| id | Source | Script outline | Shape | Size |
|---|---|---|---|---|
| A1 | mdshare `arr_1` | reshape (250000,10,3)[:, [1,3,4,6,8]]·10; pick the first 5,000-frame window with ≥ 20 αR↔β hops and ≥ 1 φ>0 visit; proper Kabsch to the window mean; histograms over all 250,000 frames (bonds and angles 80 bins, φ/ψ 64×64) | frames int16 at 0.001 Å; hists uint32 | 230 kB |
| A2 | bgmol `aldp.npy` | first frame with φ in αR; 22 atoms ×10; element list from the standard ACE-ALA-NME order (atom 10 = Cβ); assert C–H ≈ 1.09 and C=O ≈ 1.23 Å | 22×3 float | 2 kB |
| A3 | mdshare `arr_0` | αR (φ < 0, ψ < 60°), every 50th frame, 4,000 frames; Σ_q of the 9 internal coordinates; 60,000 seeded pairs; A = argmin RMSD with d_th > 4; B = argmax RMSD with d_th < 1.5; 5 alternates each; Spearman ρ | 4+20 frames and numbers | 6 kB |
| A4 | mdshare, 3 trajectories | φ; hysteresis ±20° run-lengths; populations; dwell; ACF of the φ>0 indicator and of bond 1 at 60 log lags (1 ps–20 ns, trajectory 1) | runs and arrays | 12 kB |
| A5 | mdshare `arr_1` | 3 rounds of generalized Procrustes; 15×15 covariance; 9 nonzero modes; class composition per mode; assert widths within 2% of `mode_std_A` | 9×5×3 and 9 widths | 3 kB |
| A6 | `runs/feature-space-evaluation-2026-10-26/remote/full/{arm}_s0_step{k}_samples.npz`: 5 arms × k ∈ {250 … 200,000}, 50 files, `clouds` (20000,5,3) | per file: φ/ψ 36×36 uint16; bond-1 histogram of 64 bins over μ ± 6 sd of trajectory 1; our bond W1/σ. Scores (seed mean, std) and floors copied from `rg-main/docs/investigations/feature-space-evaluation/evidence.json` (`protocol_seed_mean_std`, `protocol_floors_20000`) | 50 × 2.7 kB + scores | 160 kB |
| A7 | `runs/information-retention-aldp5-20261104/attempt-2-wide/rows.csv` (predictor `mlp-wide`) | time_role = noise, trajectory 1; per channel × block × 16 times: trace_fraction, boot_std, CI; assert flat bond_width R = 0.5 near t = 0.011 and spring16 near 0.14 | table | 25 kB |
| A8 | `runs/force-field-simulation-2026-10-26/sim-beta/*_trace.npz` (φ, ψ of shape (201,500), record_every 300) | seed 0: 150 walkers per arm as int8 at 2° bins; all 15 runs: per-record shares of αR, β and φ>0 | 5×201×150×2 B plus shares | 320 kB |
| A9 | `aldp.npy` at stride 10 | gyration-tensor eigenvalues for beads [4,6,8,14,16] and [4,6,8,10,14,16]; histogram of log₁₀(λ_min/trace) with 60 bins; minimum on the subset | histograms | 4 kB |
| A20 | `rg-main/docs/investigations/force-field-simulation/evidence.json` and `supervisor-metric-comparison/final-evidence.json` | Stein ratios per direction and arm; iid and simulated width ranges (#886) | tidy rows | 15 kB |

**Assets on BBA:**

| id | Source | Script outline | Shape | Size |
|---|---|---|---|---|
| A10 | `train.npy`, `heldout.npy`, `membership.npz` | concatenate the ids and argsort; keep file 0 (ids < 1,114,545); Rg per frame; choose the 1,500-frame window with the most compact (< 9 Å) → extended (> 13 Å) → compact excursions; TIC1/2 through `experiments/stiffness/bba_metrics.py::tica_features` and `configs/benchmarks/bba-ca28-tica.json`; Q from the native-contact definition of `bba-internal-loud-modes-first-chunk.md` (fail loudly if absent) | 1500×84 int16 at 0.01 Å and per-frame series | 290 kB |
| A11 | all training frames | TIC 100×100 counts on the fixed limits; Rg histogram (0.1 Å, 6–25 Å); B_kl and W_kl (27×27); quantiles; assert mean 10.60 ± 0.01 Å | arrays | 70 kB |
| A12 | `runs/range-order-mechanisms-20261118b/{collective_modes.json, bba_charts.json}` | copy with sha256; add c₀ (0.15706), feature-unit spectrum and Rouse cosines | JSON | 30 kB |
| A13 | `heldout.npy` and A12 | pick 8 molecules: 2 folded, 2 compact non-native, 2 with Rg > 13 Å, 2 near the median. Fit the C3 declaration with `geometry/chain_coordinates.fit_chain_coordinates` on the training membership (assert κ = 1.5044 against `bba_charts.json`). For each chart (Cartesian /6.252; C3; ordered = C3 + c₀a₁, c₀a₂; wδ log r_ij for 378 pairs, centred, divided by 0.3138): one seeded ε, 31 levels (25 log-spaced on 10⁻⁵…1, plus 4·10⁻⁴, 0.01, 0.05, 0.1, 0.26, 0.5); store the clean features. Precomputed decodes for wδ (LM on bead positions from a classical-MDS start, never from the clean molecule) and for the ordered joint rebuild with core (`loud_mode_rebuild.py`). Readouts: bond RMSE, Rg, closest non-neighbour distance, pairs < 3.5 Å, \|a₁\|. One genuine forward VP path per chart for molecule 1 on `geomspace(1, t_min, 1001)` (Markov increments), every 40th step | decodes int16 and readouts | 300 kB |
| A14 | `runs/range-order-mechanisms-20261118b/{exact-uniform, signal-*, readout-uniform}.json` | copy with sha256 | JSON | 30 kB |
| A15 | `.local/leaderboard/cache/main/{runs,metrics}.parquet` (synced 2026-11-18 23:06) | experiments `s12-bba-registered-budget-study`, `-longer-training`, `-full-schedule`, `s12-internal-loud-modes-first-chunk`, `s12-first-four`, `s12-cartesian-covariance-base`, `s12-scoremd-cartesian-reference`, `floors`. iid: keys with `generation_requests:100000`, plus 1,000-draw monitors per step. Simulation (`s12-langevin-100ps-panel*`): `x_{rg,bond,angle}_*` per force_time × initialization × window (0-10, 40-50, 90-100, 50-100). Keep the full metric key as provenance; join arm, seed, protocol, step | ≈3,000 tidy rows | 150 kB |
| A16 | docs, lab READMEs, PR bodies (#1088 study, #1104, #1105/#1107, #1130, #1133, #1138, #1141, #1057/#1069 tables, note 27 §5, #1099, paper tables) | rows {id, value, unit, badge, def, system, data, budget, seeds, N, floor, source: path:line or PR+date, canon: g4 §, status}. Entered twice in independent passes and diffed by script | table | 70 kB |
| A17 | mdshare trajectory 1; A15 floors; A16 | ALDP5: disjoint seeded panels at N = 2k/20k/50k/100k × 8; ScoreMD PMF on 64 bins (62+2) and natural-log JS on 64×64 combined-range bins (functions of `eval/aldp5_benchmark.py`). BBA: population-JS floors at 1k/5k/100k from the cache; 20k (0.037) and the paper-PMF floors from A16 | table | 8 kB |
| A18 (optional) | 2,000 training frames | ½ log det inertia (numpy); the full invariant-minus-immersion log-volume difference via `geometry/immersion_volume.py` and `loud_mode_coordinates.py` (JAX CPU, float64); reweighted Rg histograms; assert mean 9.64 ± 0.1 Å (#1103) | arrays | 30 kB |
| A-REQ-1 (not local; ask the user) | `runs/s12-bba-study-20261114/` on LISE | the first 512 molecules (no selection) of each stored 100k panel: ordered s2/s3 (decoded, and joint with core), C3 s0/s1, Cartesian + distances, covariance base, ScoreMD, wδ, springs, whitening, first-chunk internal; panel sha256 | 512×84 int16 per model | ≈1.6 MB |

Total about 1.7 MB, plus 1.6 MB if A-REQ-1 arrives. No piece loads more than about 900 kB.

### 5.3 The ledger and the rule against typed numbers

`src/data/evidence/ledger.json` is generated from A1–A20.
- Each entry: `{id: "rb.ordered.rg", value: [0.117, 0.091], unit: "Å", badge: "M", def: "rg-w1", system: "BBA", data:
  "DESRES", budget: 190350, seeds: [2, 3], N: 100000, floor: {value: 0.006, N: 100000}, source: "…", date:
  "2026-11-15", status: "current"}`.
- Scenes show numbers only through `ev('id')` or through a tested model function. Each scene declares
  `numbers: [...]`.
- The smoke test extracts every numeral in the narration cues and on-canvas text, and checks each one against a
  formatted ledger value or model output.
- `tests/evidence.test.mjs` asserts that every header has input hashes and that the §5.1 targets and the canon values
  hold. Examples:
  - 0.117/0.091, 0.455/0.418 and 0.111/0.455;
  - floors 0.080, 0.56 and 0.025;
  - visits 37/37/37 and populations 3.24/1.65/4.11%;
  - mean Rg 10.60 Å.

---

## 6. Risks

1. **Plug-in decodes are not readability.** A naive decode of a noisy state can look better or worse than what the
   state still knows. Scene 5.2 labels this and puts the measured t½ beside it. No window is ever read off a picture.
2. **Rescaled single draws are not paths.** "Played backward = exact generation" is used only with genuine forward
   paths and only for the exact reverse process (5.8).
3. **Floors depend on the count and the panel.** Never compare 100k against 1.3M, or 20k against 100k panels.
   1,000-draw monitors have a floor of 0.05–0.10 Å; 512-path panels differ from 2,048-path panels. Even at the same N
   the floors differ by definition: the study's held-out Rg floor is 0.006 Å, #1141's is 0.008 Å; population JS is
   0.0087–0.0091 on training panels and 0.0095 on held-out panels. Each panel shows its own floor.
4. **Few seeds and choices made after results.**
   - Full schedule: one seed per model, and five models picked after stage 1.
   - The late-repulsion settings were picked from 50k results; the joint-rebuild and #1109 corrections were picked on
     the executed 190,350-update models.
   - The γ dial has one seed per γ; block sizes 1, 16 and 27 have one seed each.
   - Several verdicts sit within hundredths of their limits (Rg 0.117 against the 0.11 criterion).
5. **Superseded results.** Loud-mode force numbers before 2026-11-16 used the wrong volume term, and status.md is
   stale on this. They are muted and struck, never shown as current.
6. **Mixed definitions.**
   - κ has six meanings;
   - readable windows come from four estimators;
   - there are five population-metric variants;
   - force read-out conventions differ by α_t² (driver against note 29);
   - basin boxes: v1 against Sprint 11;
   - JS logarithm base: 2 against nats.

   Hence the rails, the estimator chips and the no-comparison glyph.
7. **Data.**
   - The two ALDP5 data sets must never share an axis.
   - The n = 5 αL in Sprint 7 is reflection-confounded.
   - The dummy BBA and Chignolin files are withdrawn. The Chignolin transfer check (#1129) read dummy frames, so its
     0.996/0.990 is not shown.
   - BBA's 200 ps spacing is documented, not measured.
   - The random frame split makes held-out close to in-sample.
8. **Numbers that need care.**
   - 1,428 computed against 1,423 printed (0.4%).
   - C3's Rg window: the canon is 0.27–0.28, not 0.23.
   - 153 pairs, not 136, at |i−j| ≥ 11.
   - "Bonds 50–100× too broad" is a ratio of W1 to its floor, not of widths.
   - The Cramér–Rao bound (0.79–1.27) is invalid.
   - 0.0446 Å (manifold-route model) against 0.042 Å (pilot convention).
   - The β-relaxation statistic: 89% at the last record against 83% as reported.
   - 0.6 kT/Å against 0.32 per Å measure different quantities.
   - Rg baselines of 10.66 and 10.81 Å come from different frame sets.
   - The data's mean Rg is 10.60 Å held out and 10.70 Å on the 2k panel.
9. **Hypotheses shown as hypotheses.**
   - The barrier that may save (the two walls).
   - The share-of-reducible-loss criterion.
   - "Low-order statistics are learned first."
   - Anti-order worsening for longer chains.
   - Order against redundancy (#1137, f ≈ ½ predicted).
   - "≈0.02 at the paper's count".
   - "No chart buys statistical efficiency" is derived under asymptotic efficiency.
10. **Generated BBA molecules are not local.** Never substitute perturbed data molecules for generated ones. Without
    A-REQ-1 the affected scenes show scalars only.
11. **Repairs are not learning.** "0% overlaps" holds by construction (3.6 Å core against a 3.5 Å test), and the late
    repulsion changes the sampler, not the model.
12. **Simulations are short.** A 100 ps value is a point on a drift, and equilibrium on microseconds is untested.
13. **Reader-derived values (†)** for the wδ windows and the AK PCA stay marked until an asset reproduces them.
14. **Recomputed histograms may differ from protocol binning.** The 5% agreement test (A6) guards against this, and
    scores always come from the evidence files.

---

## 7. Build order

**Prerequisites (4 days)** — done before the MVP:
- Merge or cherry-pick PR #3's `src/app.js` (narration in `window.video.scenes`, JPEG frames) and the `main.js`
  lazy-load, plus `export-narrated.mjs` and `review-frames.mjs`.
- Promote `retention/shared.js`'s plot kit (`frame`, `axes`, `drawCurve`, `drawPath`, `heatmap`, `readout`, `pill`,
  `legend`, `stamp`, `track`) and u1's `leverSim`, `clock` and `paced` into `src/draw` and `src/engine`. Thesis code
  must not import `private/other`.
- Add the evidence draw kit: badge, provenanceStrip, hatchBand, seedBar, budgetClock, ledgerCard, noGlyph, caTube,
  ramachandran, histogramPanel.
- Write `src/model/evidence/*` with the §5.1 tests, the ledger schema, `ev()` and the smoke-test numeral check, and the
  `tools/evidence` skeleton (hashing, array codec).
- **Ask the user for A-REQ-1 in week 1** (a LISE export, about an hour).

**Pieces, in build order:**
1. **MVP: `range-order-measured` (8 days).** Assets A12, A13, A14, A11 (the parts it needs) and the A16 subset
   (windows, #1057/#1069, #1133, #1141). It is first because everything it needs is local, it carries the project's
   current argument, and it exercises every device: noise ruler, erasure clock, floors, badges, ledger. Its climax is
   the image the author can use in talks now.
2. **`results-floors` and the Ledger v1 (7 days).** A15, A16, A17. These depend on the ledger schema.
3. **`forces-measured` (7 days).** A8, A20, A15 (simulation part), A16 and the optional A18. It reuses the noise-ruler
   lever.
4. **`stiffness-measured` (6 days).** A1, A5, A6, A7. It links to Part 1, Retention and Covariance.
5. **`real-molecules` (5 days).** A1–A4, A10, A11.
6. **`bba-two-halves` (5 days).** A16 and A11's B_kl, plus A-REQ-1 thumbnails if delivered.
7. **`wdelta-era` (4 days).** A9 and A16.

That is about 46 working days in total.

**Review.** Each piece goes through a four-judge review: the three u1 judges (maths, visuals, pacing at ≤ 2.2
words/s), plus an **evidence judge**. The evidence judge checks that every number resolves to the ledger, that every
badge, N, floor, budget and seed label is right, that no arrow crosses a definition, and that superseded data are
muted. After review: frame renders every 6 s, then the narrated export. After the MVP the pieces are largely
independent. All of them share the evidence kit and the ledger, so kit changes land first.
