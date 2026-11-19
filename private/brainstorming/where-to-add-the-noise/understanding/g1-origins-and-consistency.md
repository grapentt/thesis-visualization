# g1 — Origins of the thesis, and the iid–simulation consistency / force-field thread

Reader g1, written 2026-11-19. Read-only reconstruction from: the June 2026 exposé (`docs/expose.pdf`, PDF built 2026-07-02), `overview_ml.tex` (2026-07-01), the three supervisor decks, the ScoreMD paper (Plainer et al., NeurIPS 2025, arXiv:2506.17139v3), the ML repository snapshot of `origin/main` on 2026-11-19 (`rg-main`), the pre-cleanup archive (tag `archive/pre-cleanup-2026-10-23`), GitHub issues/PRs/milestone events. Paths are relative to `rg-main` unless stated.

Conventions. Numbers are quoted as written in the cited source. Anything I computed is marked **(derived here)**. "[D]/[H]/[M]" labels inside quotes are the project's own (derived / hypothesis / measured). "ScoreMD" means the paper; "native ScoreMD" means the project's re-run of the paper's unregularised *Diffusion* arm (zero Fokker–Planck coefficient) inside the Sprint 12 study.

Deck provenance (checked by unzipping): `ThesisDiscussion1.pptx` (saved 2026-07-31, 45 slides, no notes) = **TD1**; `ThesisDiscussionFrank2.pptx` (saved 2026-11-17, 80 slides with 15 speaker notes) has text identical to `ThesisDiscussion1 copy.pptx` (saved 2026-08-03) except that the title slide says "Thesis Discussion 2", so its *content* dates from ~2026-08-03 = **TDF2**; `ThesisDiscussion2.pptx` (saved 2026-10-19, 23 slides) = **TD2**.

---

## 1. Narrative

### 1.1 The pitch (June–early July 2026)

The exposé ("Generative Modeling on Protein Shape Space with Energy-Informed Riemannian Geometry", June 2026) frames a gap between two papers:

- **ScoreMD** (Plainer et al. 2025) "trains a Fokker-Planck-consistent generative model in flat $\mathbb R^{3N}$, treating protein conformations as unstructured point clouds and forcing the model to discover both rigid-body invariance and the intrinsic geometry of shape space from data alone."
- **Diepeveen et al. 2024** construct $\mathcal M=\mathbb R^{N\times3}/E(3)$ with the metric $g_{w^\delta}$ "whose geodesics closely approximate real MD transition paths, but trains no generative model."

The promise: "train generative models with generalized Fokker-Planck regularizer as in [2] directly on the riemannian manifold $(\mathcal M,g_{w^\delta})$" — a Riemannian diffusion model *and* a Riemannian flow-matching model, both FP-regularised (exposé §1 "Deliverables"). The two Diepeveen results cited as "the empirical justification" (exposé §3.4):

1. **Geodesics ≈ MD transition paths.** Adenylate kinase (N = 214, δ = 1, 102 MD frames): the begin-to-end $w^\delta$-geodesic recovers the open→closed path "with per-residue deviations below the 3.85 Å Cα–Cα bond-length threshold for the vast majority of residues."
2. **Tangent-space PCA gives dramatic dimension reduction.** AK's 636-dimensional shape space is captured by a rank-1 approximation at the $w^\delta$-barycentre; SARS-CoV-2 helicase nsp13 (N = 590, 1764 dimensions) by rank 7.

Further promises in the exposé: the full $E(3)=O(3)\ltimes\mathbb R^3$ quotient *including reflections* (contrasted with Xu et al.'s $SE(3)$ quotient, §1 "Novelty", §4.2); geodesic noising with an $\varepsilon$-parameterisation (§4.3); a manifold FP regulariser derived from the Kolmogorov forward equation with the Laplace–Beltrami operator (§4.4); Riemannian flow matching as "planned" (§4.5); datasets Chignolin (smoke test), BBA (primary target, "directly comparable to ScoreMD's published results"), AK (ablation of the gyration term) (§6); metrics iid-PMF error, simulation PMF error, score-recovery cosine, Langevin stability / clash-free rate (§6.2). Novelty sentence: "No prior work has combined a custom, energy-inspired Riemannian metric with a generative model." Implementation status (§7): all 20 geometric primitives ported to JAX with parity $10^{-4}$, the metric-tensor transpose bug fixed, ManifoldVP forward + Riemannian DSM with $\varepsilon$-parameterisation + GPU precompute built, ScoreMD's graph transformer adopted, "Full BBA training is the immediate next step". Remaining: the manifold FP loss, the sampling/evaluation pipeline, "Full Riemannian flow matching infrastructure (!)", thesis writing.

The exposé also reports ScoreMD's headline (its §4.1): FP regularisation reduces simulation PMF error 1.438 → 0.038 on Chignolin (~97%) and 1.624 → 0.254 on BBA (~84%) relative to Two For One, while iid PMF goes 0.027 → 0.035 (Chignolin) and 0.034 → 0.234 (BBA): "simulation consistency is bought at a measurable cost to iid fidelity on the larger system." And the conditioning worry: "cond$(H_X)\sim2.4\times10^6$ on BBA (scale-invariant) causes NaN gradients with the exact Riemannian norm", so the loss used the Euclidean norm on the horizontal residual.

`overview_ml.tex` (2026-07-01, ML audience) is the same pitch in plain words: "a warped distance on shape space that makes physically-easy motion look short"; the physics regulariser "is the piece with the most math work left, and it's the current critical path"; risks: per-step cost of warped-space ops, and "the warp is a hand-designed proxy for energetics, not the real MD potential, so the regulariser's theoretical guarantees are aspirational. Fallback — diffusion on the warped space without the regulariser — is already a novel setup and a natural ablation of ScoreMD." It calls Xu et al. (SE(3) quotient, flat metric) "an almost-perfect ablation".

### 1.2 What the supervisor decks promised (TD1 2026-07-31; TDF2 content 2026-08-03)

- **"Diepeveen's Insight"** (TD1 s3, TDF2 s4/37): "Real MD trajectories are well approximated by geodesics; All MD happens in low dimensional submanifold 'spanned' by geodesics."
- **"Idea: Train diffusion model on this manifold"** (TD1 s5, TDF2 s5/38): "The geometry/metric encodes physical information → model should be able to leverage that; Invariance baked in → never sees rigid-body copies; Diffusion process favors real trajectories; Realistic configuration closer together; Unphysical configurations are pushed off to infinity → never sampled; In normal coordinates: Most of the distribution in linear subspace."
- **"What we hope to improve"** (TDF2 s10; TD1 s9 is a stub "Sample/Force/"): "Baseline goal (ScoreMD, Plainer 2025): draw i.i.d. samples from the Boltzmann distribution; Force extraction 'Two for One'; Faster training convergence; Sample efficiency. Metrics (BBA is the primary target): i.i.d.-PMF error; Simulation PMF error — JS after running Langevin dynamics with the learned score; Score recovery — cosine similarity." The speaker note adds: "the head-to-head deliverable is the Riemannian DSM model (Milestone 1), where the g-norm loss ships now; the manifold Fokker–Planck consistency term is derived and drafted but planned (Milestone 2), not yet trained."
- **"ScoreMD – Fokker Planck Regularization"** (TDF2 s45): the ScoreMD numbers above and "Our goal: lift the FP regularizer to Laplace–Beltrami form on $(\mathcal M,g_{w^\delta})$ — $\Delta\to\Delta_{\mathcal M}$, residual in $\Delta_{\mathcal M}u$ and $\|\mathrm{grad}_{\mathcal M}u\|_g^2$." Note: "This must be re-derived from scratch on $(\mathcal M,g)$, NOT obtained by substituting a div_M into the flat residual." TDF2 s77 note: the derived residual is "the literal Riemannian analogue of ScoreMD's flat Eq. 8"; it would use "our conservative energy head (potential $u_\theta=-E_\theta$)", normalised by $D^{-2}$, $D=\dim\mathcal M=3N-6$; Hutchinson + JVP divergence with $K=2$ probes "around three to five times the plain denoising-score-matching forward pass, which matches the roughly 4× ScoreMD reports"; the naive $\sqrt{\det g}$ patch "has a sign error. The correct identity is the Voss–Weyl formula".
- **Conditioning, reinterpreted** (TDF2 s51/s53 notes): rank of $H_X$ "exactly 78 = dn − 6" on all 100 BBA frames, kernel = analytic vertical basis to 2.26×10⁻⁶°; "the alarming ≈2.4×10⁶ people cite is the E(3)-KERNEL ratio across the bottom-6 eigenvalues (≈10⁻¹¹)"; horizontal cond "benign (median ≈88, p99 ≈2.5×10³, max <10⁴)". Injectivity radius chignolin ≈1.0, BBA ≈4.5 g-arc units. ISM connection trace: dense Christoffel O(k⁴) FLOPs/O(k³) memory (~1.5 s/sample, 0.958 GiB at AK) → Jacobi formula O(k³)/O(k²), ~25 ms, ~60× (TD1 s35: "61x at AK scale").
- **Plan** (TDF2 s28/78): "M0 Theory; M1 Conservative Riemannian: first conservative score-based diffusion model on the $w^\delta$ shape manifold; M2 Fokker–Planck consistency: Laplace–Beltrami-lifted FP regularizer…, augmenting the M1 model; M3 Riemannian flow matching… Status: M1 in flight (half its issues closed); M0 running alongside; M2 / M3 planned and sequenced." Note: "M1 is pure DSM — no Fokker–Planck term yet — so the comparison isolates the effect of the geometry itself."
- **Future / Extension ideas** (TD1 s44–45, TDF2 s30–31, s79–80): "Use the dimensionality reduction from Diepeveen and run diffusion on it. Risk: Is this too restrictive? Maybe some 'buffer' or clever solutions"; "Backbone: Clifford Algebra Networks for scalable equivariance"; "Flow Matching"; "Our principal bundle can be lifted to a principal spin bundle → could we use spinor fields"; "Can we find better Riemannian metric and still be efficient? (follow up work from diepeeven; metric learning)"; "Use Jacobi Metric?"

### 1.3 The plan as GitHub milestones (2026-07-23, 2026-08-04)

From issue/milestone events (`gh api …/issues/N/events`): on **2026-07-23** epic #2 was "Milestone 1 — Conservative Riemannian DSM model vs ScoreMD flat baseline" (milestone "M1 — Conservative Riemannian DSM"); epic #3 "Milestone 2 — Fokker–Planck consistency regularisation" (milestone "M2 — Fokker–Planck consistency"); epic #18 "Milestone 3 — Flow matching on the manifold"; #11 "First end-to-end conservative Riemannian training run on A100 (BBA)" (renamed 07-26 to "chignolin → BBA"); M0 theory epic #17. Milestone M4 "Train model with Atlas of totally geodesic submanifold" was created **2026-08-04**. M1 children #4 (E(3)-invariant conservative energy head), #5 (Riemannian DSM g-norm loss), #7 (reverse SDE) closed 2026-08-22.

### 1.4 Why conservative modelling and FP slipped (Aug–Sep 2026)

Forces and FP both require a *conservative* (energy-gradient) score. That failed on $w^\delta$:

- **Sprint 2 (2026-08-22 → 09-15).** `docs/sprints/sprint2/wdelta-conservative-head-analysis.md`: the ScoreMD-parity graph transformer with a conservative energy head "trains (cosine similarity to the analytic score climbs to 0.82) yet produces **no physical reverse samples** (`bond_w1_C-N = nan`…)". Causes: a covariant/contravariant mismatch (the head emits a Euclidean gradient that is never raised by $H^{-1}$), an energy that was only translation-invariant, and a shared clipping/target pathology. (A cosine of 0.82 with no physical samples is an instance of the later lesson D16 "Static field metrics can lie about samplability", which LESSONS_LEARNED files under a different episode, the ISM collapse of §1.)
- **Sprint 6 (summary last edited 2026-09-21; reflection "State as of 2026-09-25").** Archive `sprints/SPRINT_1-6_REFLECTION.md`: "Conservative-head repair — refuted along two independent mechanisms… Conclusion: the non-conservative field is the right primary vehicle; a conservative/FP head needs a genuinely different construction, not a repair." Same document: "The FP consistency residual — the eventual physics anchor — is unbuilt. The Laplace–Beltrami lift is a DRAFT derivation." (It lists `objectives/fp.py` as "built but not yet a scientific lever"; no such file ever appears in `origin/main` history — checked with `git log --name-only`.)
- **Sprint 8 (≈ 2026-09-29 → 10-01), flow matching.** Archive `sprints/sprint8/fm_failure_diagnosis.md`: a local Riemannian FM pilot on aldp5v "genuinely loses by ~3×": N = 2000 φ/ψ-JS 0.620 vs DSM 0.199; root causes "Train/sample BASE MISMATCH", a premetric conditional path that "is not endpoint-correct", and "Low cached loss hides a 4× generalization gap" (in-cache loss 0.114 vs 0.65 on fresh pairings). The tracked `FlowMatchingObjective` "raises NotImplementedError".

### 1.5 The re-ordering of 2026-10-06

On **2026-10-06** (archive `roadmap.md`, "Priority decision and evidence date: 2026-10-06"; GitHub events) the milestones were redefined, labels kept stable:
- M1 → "Superior non-conservative iid generation on ALDP5" (epic #2 renamed);
- M2 → "Scale iid generation to Chignolin and BBA" (#283);
- **M3 → "Conservative ALDP, manifold FP, and molecular forces"** (epic #3 moved from M2; #11 moved from M1 and renamed "Train and validate a conservative ALDP baseline");
- **M4 → "Conservative modelling and FP on Chignolin/BBA"** (#284, new; "Atlas construction is an optional hypothesis");
- **M5 → "Riemannian flow matching"** (#18 moved from M3; "A bounded pilot may run early once evaluation is trustworthy").

The current roadmap (`docs/roadmap.md`, milestone definitions "last revised 2026-10-06") requires for M3 "Conservative baseline; derived and validated generator/volume residual with a flat limit; explicit score-to-force/measure contract; with/without-FP comparison of iid and simulated equilibrium distributions, stability, and cost." The October decision gates were "trust the ruler" and "trust the pipeline" before any comparison. TD2 (2026-10-19) shows the new roadmap ("Milestone 3: Conservative ALDP5 + fokker planck → force extraction … Milestone 5: Riemannian flow matching; Transferability?") and a "History (of issues)" slide (s6): "ALDP6 → first good results on CPU; Switch to ALDP5 (naively thinking it has no impact); Try different targets: ISM, DSM approximation, mixtures; Many training issues + divergence of reverse generation; DSM gave best results but divergence issue severe; Various attempts to fix reverse integration (time consuming); Tried various other backbones; Chirality issue; Speed issue; Even ALDP6 bad/not reproducible (on GPU)". Slides 7–10: "Major issue 1: Metric conditioning" and "Major blocker 2: Precision" (figures inventoried in §6.0).

### 1.6 Sprint 10's M3-labelled force pilots and the closeout (2026-10-19 → 10-22)

Sprint 10 ran force-*learning* pilots with **atomistic force labels** on ALDP5 (not score-derived forces) under the M3 label: #529 (endpoint weighting: "planar inverse-metric weighting makes held-out physical force error 5.9–8.2% higher than flat weighting in all three paired fits", `investigations/endpoint-force-learning-529.md`, 2026-10-19), then a chain #571 → #573 → #575 → **#577** → #579 → #581 → #583 (archive `status.md`, 2026-10-20). #577 introduced the only FP regulariser the project ever trained (#579 re-scored its checkpoints at unseen times; #583 reused the penalty with a shared chemical head): an FP sample-variance penalty `.1 * var(R,ddof=1)/9²` on a feature-space generator (archive `design/feature-fp-regularization.md`); "held-out FP variation falls 73–81%" (RMS 5.1232 → 1.0805, 4.6226 → .8734, 3.9741 → 1.0671 over three seeds) while "the additional force improvement over unregularized decaying fitting is small: mean −5.24, descriptive interval [−14.24, 4.49]. It is not resolved"; fit-stage time ≈1.85× (archive `investigations/feature-fp-force-learning-577.md`). #579: unseen-time FP variation −74–81%. #583: FP reduces unseen-time variation 60–76% "but the frozen clean-force improvement over typed endpoint fails". None of these generated molecules or ran MD.

**Sprint 10 closeout (assessed 2026-10-22, `docs/sprints/sprint10/closeout-520.md`)**: the sprint "did not identify a metric or noising process that reproducibly beats a strong flat baseline in generation, physical-force extraction, density or basin populations, and transfer"; flat Cartesian becomes "Default and mandatory baseline"; original $w^\delta$ "Restricted-domain reference. Do not use as the near-planar default." Physical-force gains were "a force-target and fitted-correction result, not a result about the underlying metric." The intrinsic-manifold route — and with it the specific "Laplace–Beltrami FP on $(\mathcal M,g_{w^\delta})$" — effectively ended here.

### 1.7 "What is the metric for?" and the ALDP5 force fields (2026-10-23 → 11-03)

Theory notes 20 (2026-10-23) and 21 (2026-10-24) recast the question as stiffness: bond ≈0.025 Å vs torsion ≈0.2–0.7 Å; flat noise erases stiff modes first and the loss barely sees them. Note 20 §8 states what this means for forces (bias–variance at the read-out level; force independent of the metric; pullback Jacobian term). Note 21 Prop 5: at the trusted flat floor no trained noise level resolves a bond.

**PR #768 (created and merged 2026-10-27), `investigations/force-field-simulation.md`.** Forces were extracted from the five ALDP5 models of the feature-space evaluation (non-conservative 4×256 noise-prediction MLPs, 3 seeds, 200k steps) and used in overdamped Brownian dynamics. The headline is a two-horned **flat dilemma** that mirrors ScoreMD's two baselines:

| Flat model | Direct sampling at 200k | As a force field |
|---|---|---|
| low floor ($t\ge10^{-5}$, read at 0.001–0.003) | good: bonds 0.015σ, JS 0.021 | poor: wrong torsion landscape in every seed (JS 0.08–0.19, PMF error 1.2–2.7 $k_BT^2$) |
| production floor ($t\ge0.01$, read at 0.01) | poor stiff geometry (bonds 0.42σ) | usable torsions (JS 0.026), but bonds 2.4× too wide and only 37% valid frames |

"Spring and learned are good at both, from one model and one noise level." The note's explanation: "In flat coordinates, the noise level at which the torsion landscape is learned smoothly is far too coarse for bonds. A low enough noise level for bonds leaves the torsion force noisy. In metric-shaped coordinates every direction has a similar thermal width, so one noise level serves both." And the explicit link to ScoreMD: "'Diffusion' (t = 10⁻⁵) samples well but simulates poorly. 'Two For One' (t = 0.02) simulates stably, but its simulated C–N bond is 23× further from MD (Table 12) than the regularized model's. ScoreMD resolves the split with a Fokker–Planck regularizer and a mixture of experts. Here, for this molecule and this integrator, the change of coordinates resolves it without a regularizer. ScoreMD's models are conservative and trained on other data, so this is a parallel, not a head-to-head comparison." This sentence is the origin of the "change the coordinates instead of adding an FP regulariser" idea.

**Invariant embeddings (#784 merged 10-29; full training 2026-10-28, `investigations/invariant-full-training.md`)**: "force consistency improves over flat, but rare-basin mixing remains insufficient for an equilibrium force-field claim." **PR #886 (2026-10-30 → merged 11-03)**: seven maps × {MLP, conservative transformer} × 2 seeds; simulated bond widths for Cartesian maps 2.3–2.9× MD, for metric-shaped maps 0.99–1.17× MD (numbers §4.4). Its methods note adds a "Comparison with the ScoreMD paper" section and an explicit "Consistency" readout ("The diagonal means equal error, not equal laws").

### 1.8 BBA: the force field gets harder (2026-11-01 → 11-12)

- **#944 (created 11-05, merged 11-10), `investigations/bba-simulation-diagnosis.md`**: "whitening's learned force has a real adverse effect on global conformations relative to matched force-free trajectories. Its good bonds do not establish a useful molecular force field. Cartesian has large bond errors, but its force improves some global scores over noise alone. Neither method is established as an equilibrium sampler." It notes "There is **no Fokker–Planck residual regularizer**" and that at t = 0.05 the Cartesian read-out smooths each coordinate by ≈0.7205 Å (relative bond component ≈1.019 Å vs MD bond std 0.05759 Å).
- **#952 (merged 11-10), `investigations/bba-force-learning-assessment.md`**: remedies ordered by evidence; "Small-time consistency. ScoreMD … provides the closest empirical precedent: FP regularization and specialized low-time experts"; it derives the appropriate ambient VP log-density residual and proposes an unexecuted "low-time DSM with low-time DSM plus FP" comparison. #953: a finite-bank kernel teacher "is nearly a nearest-frame force and does not qualify as a population-force oracle."
- **#1033 (closed 11-11, consolidated in #1086)**: a covariance-matched analytic Cartesian score base gives "the first Cartesian BBA forces that are sharp at low noise: simulated bond errors of 0.009 Å against 0.065 Å" (status.md).
- **Range and order (11-12 → 11-14; #1055, #1057, #1064, #1069, consolidated #1079)**: internal coordinates + two loud collective modes. Status 2026-11-14 makes this the working hypothesis and lists as "Not established": "Stable force fields. Every BBA model, including the internal-coordinate ones, still drifts in size over 100–500 ps of simulation; the remedy must change what is learned at small noise levels."

### 1.9 The registered-budget study and the compaction saga (2026-11-14 → 11-19)

- **Roadmap gate 3 (2026-11-14)**: "Read out forces… This is the bridge to M3 and M4; it does not replace their Fokker–Planck and equilibrium evidence." The study plan makes forces co-equal: Q5 "has equal weight with Q1: a model that generates well and simulates badly has not learned the energy."
- **Stage 1 results (2026-11-15, PR #1088 merged 11-16)**: "The three internal-coordinate models are the best force fields in the study" (bonds 0.003–0.004 Å at the panel floor, angles 1.9–2.9°, size 0.8–1.1 Å after 50–100 ps); best Cartesian (covariance base) drifts to 1.9 Å; native ScoreMD to 3.2–3.5 Å; "The loud block adds nothing in simulation"; "No model is a stable force field over 100 ps."
- **Size drift (PR #1089, 11-15/16)**: "a compaction, not a swelling"; "an error of the learned force at small noise levels"; read-out 0.05 instead of 0.02 halves the late size error (1.06 → 0.69 Å), plus repulsion 0.56 Å; in the 500 ps runs the drift "does not level off". Its training proposal ranks FP lower: "Fokker–Planck consistency regularisation. It targets the level dependence of the field directly but needs a derivation on the internal-coordinate manifold, an implementation and tests before a first run."
- **Longer training (PR #1091, 11-16)**: 190,350 → 380,700 updates; size error at t = 0.02 changes by −0.11, +0.15, −0.23 and +0.03 Å — "No under-training effect".
- **Lab 2026-11-16 (PR #1100), `lab/2026-11-16-bba-force-field-diagnosis/README.md`**: "three quarters of [the loud-mode] compaction was a wrong volume term in the score-to-force conversion, not a learned error. With the correct term its 100 ps size error falls from 0.98 Å to 0.24 Å". The learned score is accurate from level 0.05 upward; there is "No excluded-volume wall, in any model at any level"; a data-fitted 155-term correction "passes the test and fails in simulation". Section "Why a single noise level cannot give the whole force" ends: "A complete force field therefore needs the levels tied together, or the sharp short-range part supplied separately. This is why Arts et al. (2023) treat the read-out level as a tuned parameter and why ScoreMD (Plainer et al. 2025) adds a Fokker-Planck consistency loss." Next steps list "More expensive: a Fokker-Planck consistency loss as in ScoreMD (about four times the cost per update)."
- **Low-noise continuation (PR #1101, 11-16)**: "Refuted: the wall does not appear… The missing wall is a property of the blurred density, not of under-training."
- **Walls (11-17)**: a simulation-fitted wall removes overlaps but swells the molecules (PR #1106, "refuted"); adding one size term (PR #1109, "supports") keeps the uncorrected size error (0.263/0.173 Å) with 0% overlaps.
- **Library port and larger panels (PR #1103 immersion volume term in the library, 11-17; PR #1130, 11-18)**: "every force field, executed ones included, keeps shrinking the molecule after 100 ps: mean Rg falls by another 0.21–0.41 Å by 300 ps; the size error grows 1.7–2.9 times. So the 100 ps size error is a point on a drift, not an equilibrium value."
- **Theory note 30 (PR #1132, 11-18)**: a loud block "cannot itself provide an excluded-volume wall…, global handedness…, the kinematics for free, or sharp soft forces at the read-out level"; soft-force error from a single level grows as $1/\sigma$ [D].
- **Open on 2026-11-19**: PR #1113 (500 ps confirmation of the wall+size correction, "Not yet run"), PR #1136 (does the #1109 correction stop the drift, "Planned"), **PR #1138** (ScoreMD paper read-out on the paper's PMF metric; open since 11-18), issue #1094 "Why do BBA internal-coordinate force fields drift toward compact states?".

### 1.10 What became of each "future/extension" idea

| Deck idea (TD1/TDF2) | What happened | Status 2026-11-19 |
|---|---|---|
| Better metric, still efficient | Sprint 10 (planar-compatible, chemical), Sprint 11 (spring-force, quantum springs, whitening), Sprint 12 (internal coordinates + loud modes) | Became the project |
| Metric learning | Learned warps (#753), invariant embeddings (#784), endpoint φ (#882), transferred graph φ (#877), learned-map objectives (consolidated #1081: "local conditioning does not improve generation") | Not successful for generation |
| Diepeveen dimensionality reduction | PGA "ProteinAtlas" (historical M4, created 08-04; TD2 s12–23, e.g. chart-switching error "around 0.027 Angstrom"); ALDP5 atlas PR #1046 closed unmerged 11-14, "not selected" (status) | Not selected |
| Flow matching | Sprint 8 local pilot lost ~3×; M5 not started | Open (#243, #255–#257) |
| Clifford algebra networks | Sprint 7 trained JAX GATr and e3nn backbones; "all four are blocked at sampling by the same reverse-walk instability" | Explored, not a lever |
| Spin bundle / spinor fields; Jacobi metric | No mention anywhere in `docs/` or the archive (grep: 0 hits) | Not pursued |

### 1.11 Dated goals-vs-delivered table

| # | Goal as promised (source, date) | What was delivered (date, PR/issue) | Status 2026-11-19 |
|---|---|---|---|
| G1 | Riemannian diffusion on $(\mathcal M,g_{w^\delta})$ with geodesic noising beats flat ScoreMD (exposé §1, §4.3, Jul 2; M1 "Conservative Riemannian DSM", Jul 23) | Sprints 1–9 machinery; early "wins" invalidated (defective flat baseline fixed 2026-10-02; TF32); Sprint 10 closeout 10-22: no metric beats flat | Abandoned as method; $w^\delta$ kept as reference and as a Euclidean feature map in Sprint 12 |
| G2 | E(3) quotient incl. reflections, invariance "baked in" (exposé §3.1, §4.2; decks) | Implemented on the $w^\delta$ path; chirality artifact (LESSONS §3; TD2 "Chirality issue"); the physical-density/force contract (note 17, Sprint 10) uses $Q=C/SO(3)$ "Proper rotations preserve chirality" | Superseded for density/force work |
| G3 | Manifold FP regulariser, Laplace–Beltrami lift (exposé §4.4; overview "critical path"; TDF2 s45/s77; epic #3 as M2 Jul 23 → M3 Oct 6) | Theory: note 04 residual + gauge; note 17 fixed-measure residual with manufactured checks; Sprint 10 #577/#579/#583 FP penalty in labelled-force pilots (10-20). Never trained in a generative model | Not run. M3 #3 / M4 #284 open; FP is a lower-ranked (11-15) / "more expensive" (11-16) remedy for BBA drift |
| G4 | Riemannian flow matching (exposé §4.5 "planned"; M3 Jul 23 → M5 Oct 6) | Sprint 8 local pilot lost ~3× (0.620 vs 0.199); objective stub | Not started as tracked work |
| G5 | iid-PMF on BBA vs ScoreMD (exposé §6; TDF2 s10) | Sprint 12 (11-15): loud-mode population error 0.0125/0.0130 vs native ScoreMD 0.0209/0.0290; PR #1138 (11-18): paper metric at 100,000 molecules 0.096–0.097 (full schedule) vs floor 0.080 | Partly; not on the paper's 1,300,156-sample scale |
| G6 | Simulation PMF after Langevin (exposé §6.2; decks) | ALDP5 Brownian dynamics (#768, #886); BBA 100–500 ps Langevin panels; paper's 200 ns protocol not run | Open (proposed in #1138) |
| G7 | Force extraction "Two for One" (TDF2 s10) | ALDP5: spring/learned force fields pass the force check within a few % and keep bonds/angles/torsions near MD for 40,000 steps (#768); BBA: internal coordinates best in the study, all drift compact; volume-term bug fixed 11-16; wall+size correction 11-17 | Delivered on ALDP5; unstable on BBA (#1094) |
| G8 | Faster training convergence (TDF2 s10) | ALDP5 stiff modes learned 10–100× sooner (README); strain outliers "200–400 times" fewer steps; force check "10–20 times sooner"; no early torsion advantage | Delivered for stiff modes |
| G9 | Sample efficiency (TDF2 s10) | "They do not save *data*" for the torsional FES (learned-stiffness pilot, 10-25); note 30: "Learning speed, not data efficiency"; only linear DSM soft-force fits gain 19× (note 20 §8) | Not delivered for generation |
| G10 | Score-recovery cosine; Langevin stability (exposé §6.2) | Sprint 2 cosine 0.82 with no physical samples; replaced by sample/simulation metrics | Deprecated as evidence |
| G11 | AK ablation of the gyration term (exposé §6; decks) | DATA_STATE: AK "is not wired into this pipeline" | Never run |
| G12 | Chignolin (exposé; M2/M4) | Roadmap gate 4: "Then the full schedule and a second protein… add Chignolin" | Not run |

---

## 2. Core mathematics

### 2.1 The original geometry (exposé §3)

- **Shape space.** $X\in\mathbb R^{N\times3}$; $Y=XO^\top+\mathbf 1_Nt^\top$, $O\in O(3)$, $t\in\mathbb R^3$; $\mathcal M:=\mathbb R^{N\times3}/E(3)$, $\dim\mathcal M=3N-6$ on non-degenerate clouds. Tangent space splits into vertical $V_X$ (rigid motions) and horizontal $H_X$ (shape changes).
- **$w^\delta$ distance** (Def. 3.1 = Eq. 17 of Diepeveen): $w^\delta([X],[Y])^2=\sum_{i<j}\Big[\log\frac{r_{ij}(X)}{r_{ij}(Y)}\Big]^2+\delta\Big[\log\frac{\det G_X}{\det G_Y}\Big]^2$, $r_{ij}=\|x_i-x_j\|$, $G_X=\sum_i(x_i-\bar x)(x_i-\bar x)^\top$. Intuition: a Hookean spring network on log-distances plus a global "spread" term; collisions are infinitely far.
- **Feature (pullback) form** (TD2 s3; theory notes 22–23): $F_\delta(X)=\big((\log r_{ij})_{i<j},\sqrt\delta\log\det G_X\big)$, $w^\delta([X],[Y])=\|F_\delta(X)-F_\delta(Y)\|$, $g_X(V,W)=\langle DF_\delta(X)V,DF_\delta(X)W\rangle$.
- **Metric tensor**: $H_X=\mathrm{Hess}_X\big(\tfrac12w^\delta([X],[Y])^2\big)\big|_{X=Y}=A_X+\delta B_X$ ($A_X$ graph-Laplacian structure, $B_X$ rank ≤ d); $g([\Xi],[\Psi])=\langle\Xi,H_X\Psi\rangle_F$ on horizontal representatives; PSD with $\ker H_X=V_X$ (Thm 5.3 of Diepeveen).
- **Separation**: $w^\delta([X],[Y])^2=d_{\mathcal M}([X],[Y])^2+O(d_{\mathcal M}^3)$ (Thm 3.2).
- **Log map surrogate**: $\log(X,Y)\approx-H_X^\dagger\nabla_X\tfrac12(w^\delta(X,Y))^2$ (Cor. 3.2.1); the Euclidean gradient is the code's `prelog`/`s_prelog`, `s_log` $=H^{-1}\cdot$`s_prelog` restricted to horizontal (TD1 s17).

### 2.2 The exposé's forward process, target and $\varepsilon$-parameterisation (§4.3, as written)

1. $v\sim\mathcal N(0,I_{nd})$, $v_h=\Pi_H(x_0,v)$; 2. $v_{h,\rm unit}=v_h/\|v_h\|_g$; 3. $x_t=\exp\big(x_0,\tfrac12\alpha(t)\sigma(t)v_{h,\rm unit}\big)$.
Target $s_{\rm true}(x_t,x_0,t)=-\frac{\log(x_t,x_0)}{\sigma(t)^2}\approx\frac{H^\dagger\nabla_{x_t}\frac12w^\delta(x_t,x_0)^2}{\sigma(t)^2}$; loss $L_{\rm DSM}=\mathbb E\big[\beta(t)\|\Pi_H(x_t,s_\theta)-s_{\rm true}\|^2\big]$ with the *Euclidean* norm "because cond$(H_X)\sim2.4\times10^6$ on BBA"; $\varepsilon$-target $v_{h,\rm unit}=s_{\rm true}\sigma(t)/\alpha(t)$, Euclidean norm "≈ 2.81 on BBA". (The "½" is the project's τ = 2 exponential-map convention.) My reading: as written the step has a fixed g-length $\alpha\sigma$ in a random direction — not a Gaussian VP kernel; later code used geodesic random walks, wrapped Gaussians and a coherent `vp_ou` forward (Sprint 2). Flagged in §7.

### 2.3 The VP schedule shared by ScoreMD and the project

$f(x,t)=-\tfrac12\beta(t)x$, $g(t)=\sqrt{\beta(t)}$, $\beta(t)=0.1+19.9t$; $p_t(x_t\mid x_0)=\mathcal N\big(e^{-\frac12\int_0^t\beta}x_0,\,(1-e^{-\int_0^t\beta})I\big)$ (ScoreMD Eqs. 17–20; data normalised to unit variance). Equivalently $-\log\alpha_t^2=0.1t+9.95t^2$ (note 27 §3), $\sigma_t^2=1-\alpha_t^2$. Useful values (derived here from these formulas; τ = σ/α is the "blur" at the clean point):

| t | 10⁻⁵ | 10⁻³ | 0.003 | 0.005 | 0.01 | 0.02 | 0.03 | 0.05 | 0.1 |
|---|---|---|---|---|---|---|---|---|---|
| α | 1.00000 | 0.99995 | 0.99981 | 0.99963 | 0.99900 | 0.99701 | 0.99404 | 0.98517 | 0.94672 |
| σ | 0.00100 | 0.01049 | 0.01974 | 0.02736 | 0.04464 | 0.07721 | 0.10901 | 0.17156 | 0.32205 |
| τ = σ/α | 0.00100 | 0.01049 | 0.01974 | 0.02737 | 0.04469 | 0.07745 | 0.10967 | 0.17414 | 0.34018 |

Checks against sources: #944 quotes "At t=0.05, alpha=0.98517 and sigma/alpha=0.17414" ✓; the flat ALDP5 production floor "σ_min = 0.042 Å" at t = 0.01 equals 0.04464 × the ALDP5 `input_scale` 0.9418 Å = 0.0420 Å ✓.

### 2.4 Score–force relation and the two densities (ScoreMD §2.2, §3)

Langevin: $dx=v\,dt$, $M\,dv=-\nabla_xU\,dt-\gamma Mv\,dt+\sqrt{2\gamma k_BT}\,dw_t$ (Eq. 5). For Boltzmann data $p(x)=e^{-U(x)/k_BT}/Z$: $s_\theta(x,t=0)\approx\nabla_x\log p_0(x)=-\nabla_xU(x)/k_BT$ (Eq. 6). Consistency means the two densities agree: $p(x)\sim\mathrm{Denoising}[s_\theta](x,t)$ and $p_0(x)\sim\exp(-U(x)/k_BT)$ with $s_\theta(x,0)=-\nabla_x U/k_BT$ (Eq. 7); "In practice, however, diffusion models often display inconsistencies." DSM (Eqs. 3–4) has target $-\epsilon/\sigma(t)$ whose scale explodes as $t\to0$: "This instability makes training difficult at small timescales… typically mitigated by truncating the training interval to $(\varepsilon,1)$".

### 2.5 ScoreMD's Fokker–Planck regulariser (§3.1, Appendix A)

- Log-density FP (Eq. 8): $\partial_t\log p_t=F_p(x,t)\triangleq\tfrac12g^2(t)\big[\mathrm{div}_x(\nabla_x\log p_t)+\|\nabla_x\log p_t\|_2^2\big]-\langle f,\nabla_x\log p_t\rangle-\mathrm{div}_x(f)$. For VP, $\mathrm{div}(f)=-\frac{nd}2\beta(t)$ (exposé §4.1).
- Residual and loss (Eqs. 9–10): $\|R\|_2^2=\|F_{p^\theta}-\partial_t\log p_t^\theta\|_2^2$, $L_{FP}=\lambda_{FP}(t)D^{-2}\|R\|_2^2$, objective $\mathbb E[L_{DSM}+\alpha L_{FP}]$ (α = regularisation strength; BBA: α = 10⁻² for FP, 2·10⁻² for the low-time expert of Both, Table 5).
- Weak residual (Eqs. 11–13, 22–30): $\tilde R(x,t)=\mathbb E_v[R(x+v,t)]$, $v\sim\mathcal N(0,\sigma^2I)$, $\sigma=10^{-4}$; the divergence is replaced by the Stein/Hutchinson-type identity $\mathbb E_v[\mathrm{div}\,s(x+v)]=\mathbb E_v\big[\tfrac{v^\top}{\sigma}\tfrac{s(x+v)-s(x-v)}{2\sigma}\big]$; unbiased squared residual by the product of two independent estimates $\tilde R(x,t;v)\cdot\tilde R(x,t;v')$.
- Time derivative by finite differences (Eq. 14), $(h_s,h_d)=(0.001,0.0005)$.
- Conservative parameterisation (§3.2): energy summed over nodes, score $=\nabla_x\sum_i\psi(n_i^{(L)})$; random rotations; "avoids issues caused by mirror symmetries". Appendix C.1: "for simulation, we were unable to train stable score-based models without a conservative parameterization".
- Mixture of experts (§3.3): experts on $(0,0.1),[0.1,0.6),[0.6,1.0)$; only the small-t expert is conservative and FP-regularised in "Both" (= "Ours" of Table 1).
- The same residual written for the project's ambient feature-space VP models (#952, `bba-force-learning-assessment.md`): $R=\partial_t\ell-\frac{\beta(t)}2\big[M+z\cdot s+\nabla_z\cdot s+\|s\|^2\big]$, $s=\nabla_z\ell$, $M$ = number of features (it is Eq. 8 with $f=-\tfrac12\beta z$, so $-\mathrm{div}f=\tfrac12\beta M$ and $-\langle f,s\rangle=\tfrac12\beta\,z\cdot s$ (checked here)). "Applying flat Cartesian VP coefficients directly to `ell(alpha*y(x),t)+log J_phi` would use the wrong forward law." Never trained.

### 2.6 The manifold FP the thesis promised (exposé §4.4; note 04)

Exposé: $\partial_tp_t=-\mathrm{div}_{\mathcal M}(fp_t)+\frac{g(t)^2}2\Delta_{\mathcal M}p_t$, $\Delta_{\mathcal M}=\mathrm{div}_{\mathcal M}\circ\mathrm{grad}_{\mathcal M}$. Note 04 (current) in a genuine chart: $(\mathrm{grad}_gu)^a=g^{ab}\partial_bu$, $\mathrm{div}_gV=\frac1{\sqrt{|g|}}\partial_a(\sqrt{|g|}V^a)=\partial_aV^a+\Gamma^b_{ba}V^a$ ("The volume correction has a **plus** sign"), $\Delta_gu=g^{ab}(\partial_a\partial_bu-\Gamma^c_{ab}\partial_cu)$; density evolution $\partial_tp_t=-\mathrm{div}_g(f_tp_t)+\frac{D(t)}2\Delta_gp_t$; with $\ell_t=\log p_t$, $s_t=\mathrm{grad}_g\ell_t$:
$$\partial_t\ell_t=-\mathrm{div}_gf_t-g(f_t,s_t)+\tfrac{D(t)}2\big(\mathrm{div}_gs_t+\|s_t\|_g^2\big),$$
residual $R_\theta=\partial_tu_\theta+\mathrm{div}_gf_t+g(f_t,s_\theta)-\frac{D(t)}2(\mathrm{div}_gs_\theta+\|s_\theta\|_g^2)$. Two traps stated there: **gauge** — "If $u_\theta=\ell_t+C(t)$, this residual changes by $C'(t)$", so spatial score accuracy cannot certify it; **estimator** — $\mathbb E[\hat R_1\hat R_2]=R^2$ vs $\mathbb E[\hat R^2]=R^2+\mathrm{Var}\hat R$. The redundant Cartesian $H_X$ "is singular and is not $g_{ab}$"; a local quotient chart is required. "Status: the equation is standard; an FP-residual objective is not registered in the current factory."

### 2.7 Physical density and force contract (note 17; note 20 §8)

- Physical measure on $Q=C/SO(3)$: $d\mu\propto v(X)\,dV_h$, $v(X)=\sqrt{\det I_X}$, $I_X=\mathrm{tr}(G)\mathbf1-G$, $G=X_c^\top X_c$ (from a Schur-complement derivation; collinearity, not planarity, is singular).
- For any metric $g$: $J_g=dV_g/d\mu$, $dP=\rho\,d\mu=p_g\,dV_g$, $p_g=\rho/J_g$; scores $s_g=\mathrm{grad}_g\log p_g=g^{-1}(\alpha-d\log J_g)$ with $\alpha=d\log\rho$; mean force $F=-dA=k_BT\alpha$ — "Its Cartesian vector is the Euclidean horizontal lift of $h^{-1}F$, not $g^{-1}F$."
- Fixed-measure diffusion: $L_tf=df[b_t]+\frac{a(t)}2\mathrm{div}_\mu(D\,df)$, $D=g^{-1}$; $\partial_t\ell=-\mathrm{div}_\mu b-d\ell[b]+\frac a2(\mathrm{div}_\mu(Dd\ell)+d\ell[Dd\ell])$; relation to Laplace–Beltrami noising $\mathrm{div}_\mu(Ddf)=\Delta_gf-d\log J_g[Ddf]$. "FP consistency alone does not identify the initial distribution or certify force accuracy."
- Note 20 §8 "**The force does not depend on the metric** [D]": $F=k_BT\nabla\log p_0=k_BT\,G\,v$ ($v$ = Riemannian score); "A covector needs no metric to exist". Bias–variance [D]: relative bias of the score at noise $\sigma_t$ in a mode of variance $c_k$ is $\sigma_t^2/(c_k+\sigma_t^2)$; bias ≤ δ in every mode needs $\sigma_t^2\le\delta c_{\min}$, and then the DSM target has variance $1/(\delta c_{\min})$; "Under flat noise $c_{\min}$ is the bond variance, so soft forces pay a noise factor up to $\kappa(H)$. Metric-shaped noise equalizes the $c_k$: this is E4." Which error matters [D]: a constant force error $\delta f$ (in $k_BT$) on a coordinate of width σ changes the density by $\mathrm{KL}=\tfrac12(\delta f\,\sigma)^2$.

### 2.8 Reading a force out of coordinates: the volume term (note 20 §8; note 29; #768; lab 11-16)

- Diffeomorphism $y=\Phi(x)$: $F_x=D\Phi^\top F_y+k_BT\nabla\log|\det D\Phi|$; "omitting it shortens ALDP5 bonds by 0.30–0.36 thermal widths" (note 20 §8).
- Immersion $\varphi:X\to\mathbb R^m$, $G=D\varphi^\top D\varphi$ (note 29 §2): $\nabla_x\log p_0=D\varphi^\top\nabla^S\log q(\varphi(x))+\tfrac12\nabla_x\log\det G$; read-out $\hat F(x)=k_BT\big[D\varphi(x)^\top s_{t_*}(\varphi(x))+\tfrac12\nabla_x\log\det G(x)\big]$; the normal part of $s_t$ ($O(\sigma_t^{-2})$) is annihilated by $D\varphi^\top$.
- Feature-space VP model (#952): $E_\theta(z,t)=\tfrac12\|z\|^2+\frac{\alpha_t}{\sigma_t}H_\theta(z,t)$, $\epsilon_\theta=\sigma_t\nabla_zE_\theta$, $F_{\theta,t}=-\frac{\alpha_t}{\sigma_t}B^\top\epsilon_\theta(\alpha_ty,t)+\nabla_x\log J_\phi$, $B=Dy$.
- #768's three conversions: flat $g=s_y$; learned $g=D\varphi^\top s_y+\nabla\log|\det D\varphi|$; spring/$w^\delta$ $g=DF^\top s_y+\tfrac12\nabla\log\det(DF^\top DF)$ — "tested against direct gradients to 10⁻¹²".
- The BBA loud-mode bug (lab 11-16): the code used the rotation-invariant-map factor $\tfrac12[\log\det(J^\top J+P_{\rm rot}+P_{\rm trans})-\log\det(\mathrm{inertia})]$; the loud-mode map rotates with the molecule and "embeds all 81 centred degrees of freedom", so the factor is $\tfrac12\log\det(J_c^\top J_c)$; difference ≈ $-\tfrac12\log\det(\mathrm{inertia})$, "a spurious log-density that grows as the molecule shrinks: an inward force of about 0.6 kT/Å on the radius of gyration".

### 2.9 Force checks that need no reference forces

- **Stein / equipartition check** (#768 §2): for the exact force $g=\nabla\log p$ and fixed direction $e$, $-\mathbb E[(g\cdot e)(e\cdot(u-\bar u))]=1$; below 1 = too weak along $e$. "Necessary, not sufficient."
- **Generator (stationarity) identity** (drift note Part B; lab 11-16): $\mathbb E_p[F\cdot\nabla g+\Delta g]=0$ for every smooth $g$; torsion form $\mathbb E[\sum_kg_k\partial_kb+\partial_k^2b]=0$, Cartesian form $\mathbb E[f\cdot\nabla b+\Delta b]=0$. Sign conventions differ between documents (Part B: "Positive means the force pushes the data outward"; lab tilt: "positive means an outward force is missing").
- **Integrator**: overdamped Euler–Maruyama $u\leftarrow u+h\,g(u)+\sqrt{2h}\,\xi$, $h$ in Å²; #768 states "For a harmonic bond, Euler–Maruyama inflates the spread by about 1 + kh/4" (see §3.9 for a two-bead derivation).

### 2.10 Stiffness theory that explains the dilemma

- **Information per mode** (note 21 Prop 4 [D]): $I(x_0;x_t)=\sum_k\tfrac12\log(1+\mathrm{SNR}_k)$, $\mathrm{SNR}_k=\alpha_t^2\theta_k/\sigma_t^2$, $\theta_k$ eigenvalues of $N^{1/2}\Sigma N^{1/2}$ (noise covariance $\sigma_t^2N^{-1}$); signal fractions equal across modes at every $t$ iff $N\propto\beta H$.
- **E4** (note 20 §4.6): $r_k=\frac{\alpha_t^2\sigma_k^2}{\alpha_t^2\sigma_k^2+\sigma_t^2}=\frac{\mathrm{SNR}_k}{1+\mathrm{SNR}_k}$; half-erased when $\sigma_t=\alpha_t\sigma_k$ — "about 0.025 Å for a bond, 0.5 Å for a torsion"; windows "spread over $\log\kappa(H)$, 2.6 decades for ALDP5". Possible consequence [H]: "forces can be read at a larger noise level (§8)".
- **Smallest trained level** (note 21 Prop 5 [D/N]): under flat noise mode $k$ is resolved ($\mathrm{SNR}_k\ge1$) iff $\sigma_t^2\le\alpha_t^2/\lambda_k$. With the trusted schedule: t = 0.01 → σ = 0.045 Å, bond SNR 0.30–0.46; t = 0.003 → 0.020 Å, 1.6–2.4; t = 0.001 → 0.0105 Å, 5.5–8.4. "Bonds are never resolved in training… 0% of trained times and 0% of the likelihood weight… The sampler extrapolates for bonds… No prediction target can repair this."
- **Readable window** (note 27 §2–3): $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; for a linear direction of variance λ (in noise units) $r(t)=\frac{\alpha_t^2\lambda}{\alpha_t^2\lambda+\sigma_t^2}$ and $t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\log(1+\lambda)}}{19.9}$, $t_{1/2}(1)=0.259$.
- **Loss blindness** (LESSONS D18; learned-stiffness pilot): for one stiff Gaussian direction of width $w$, the irreducible error is $\alpha^2w^2/(\alpha^2w^2+\sigma^2)$ and a model with width $rw$ pays only $\sigma^2(\alpha^2w^2+\sigma^2)\big(\frac1{\alpha^2r^2w^2+\sigma^2}-\frac1{\alpha^2w^2+\sigma^2}\big)^2$, which "matters only when σ is close to w, which holds for about 6% of training times".
- **Soft forces at the read-out level** (note 30 §7 [D]): a smooth tilt $\theta h$ of the log-density changes the optimal noise prediction by $-\sigma\theta\nabla h$, so "One level therefore carries information about θ proportional to $\sigma^2$ per example, and the error of a soft force estimated from that level alone grows as $1/\sigma$"; the soft part read at small noise "is inherited from higher levels through the network's continuity in t [H]". Missing energy $U$: excess loss $\sigma^2\mathbb E|\nabla U|^2$ to leading order [D].

### 2.11 A bridge between readability and force accuracy (derived here)

For a Gaussian mode $x\sim\mathcal N(0,\lambda)$ in noise units, the noised score is $s_t(y)=-y/(\alpha_t^2\lambda+\sigma_t^2)$. The force read at the clean point is $F_t(x)=\alpha_t s_t(\alpha_tx)=-\frac{\alpha_t^2}{\alpha_t^2\lambda+\sigma_t^2}x=r(t)\,F_0(x)$. Hence:
- the ideal (perfect-model) Stein ratio at read-out level $t$ **equals the readable fraction** $r(t)$ of note 27;
- overdamped dynamics with $F_t$ has stationary variance $\lambda/r(t)=\lambda+\tau^2$ — **simulated width inflation $1/\sqrt{r(t)}=\sqrt{1+\tau^2/\lambda}$**.
So "Two For One" (read at $t\gg0$) inflates exactly the modes that are poorly readable at that level, while reading at $t\to0$ makes $r\to1$ but sends the soft-force estimation error $\propto1/\sigma$ (2.10) up. In thermal units ($\lambda\approx1$ for every coordinate) $r(0.03)=0.988$, inflation 1.006 — one read-out level serves all modes.

### 2.12 The comparison metrics

- **PMF error** (ScoreMD B.2): histogram the 2-D projection (TICA for proteins, φ/ψ for dipeptides), 100 bins (proteins) or 64 (dipeptides), baseline proportion 10⁻⁶, squared difference of log occupancies. The released code (ported exactly in #1138's `eval.scoremd_paper`, agreement to 10⁻¹²) uses "mixture weights" — schematically $\mathrm{PMF}=\sum_bm_b(\log p_b-\log q_b)^2$ with mixture probabilities $m_b$; units "squared $k_BT$". JS = squared SciPy JS distance; the released code is unsmoothed although B.2 prose describes adding one count (methods note).
- **Sample-count floor** (#1138): held-out vs training split, 0.56 (20,000), 0.18 (50,000), 0.080 (100,000), 0.039 (200,000), 0.025 (325,039); "count × floor is about 8,000, so at the paper's 1,300,156 the floor would be about 0.006 (extrapolated, not measured)".

---

## 3. Worked analytical examples

### 3.1 Reading a force at noise level t: ALDP5's nine modes (derived here)

Inputs: nine principal standard deviations of ALDP5 held-out trajectory 1 (`force-field-simulation/evidence.json`, `mode_std_A`): 0.0252, 0.0294, 0.0419, 0.0543, 0.0654, 0.1234, 0.1851, 0.3452, 0.6631 Å; noise unit 0.9418 Å (`DATA_STATE.md` input_scale; reproduces σ_min = 0.042 Å). With $\lambda_k=(w_k/0.9418)^2$ and §2.11:

| mode $w_k$ (Å) | 0.0252 | 0.0294 | 0.0419 | 0.0543 | 0.0654 | 0.1234 | 0.1851 | 0.3452 | 0.6631 |
|---|---|---|---|---|---|---|---|---|---|
| $t_{1/2}$ | 0.00483 | 0.00607 | 0.00994 | 0.0139 | 0.0175 | 0.0366 | 0.0569 | 0.108 | 0.196 |
| ideal ratio $r$ at t = 0.01 | 0.264 | 0.328 | 0.498 | 0.625 | 0.707 | 0.896 | 0.951 | 0.985 | 0.996 |
| ideal width inflation at 0.01 | 1.95 | 1.75 | 1.42 | 1.27 | 1.19 | 1.06 | 1.03 | 1.01 | 1.00 |
| measured force check, flat production floor (seed 0, read at 0.01) | 0.198 | 0.252 | 0.293 | 0.485 | 0.459 | 0.418 | 0.694 | 0.727 | 0.369 |
| measured, spring (seed 0, read at 0.03) | 0.991 | 1.000 | 1.013 | 0.954 | 0.988 | 0.966 | 0.952 | 1.013 | 0.516 |

Readings: (i) the two stiffest directions are half-erased below the trained floor 0.01 — Prop 5 in readable-window form; (ii) the flat production model's measured restoring strength is *below* the perfect-model bound, i.e. blur explains most but not all of its softness; (iii) its measured simulated bond spread 2.38–2.48× (step-size table) vs the ideal 1.75–1.95× for the two stiffest modes. Caveats: principal directions are not bonds; torsion directions are periodic and multimodal; the ideal is a Gaussian bound.

Same formula, other settings (derived here): #886's fixed-unit Cartesian control read at t = 0.05 has τ = 0.174 Å → ideal inflation 6.98 / 6.01 for the two stiffest modes vs measured simulated bond width/MD 8.750; #886's normalised aligned Cartesian (scalar $c=\sqrt{\mathrm{tr}\Sigma/9}=0.262$ Å from the nine stds) has τ = 0.0457 Å → 2.07 / 1.85 vs measured 2.33–2.78; BBA Cartesian in Sprint 11 (#944: smoothing 0.7205 Å per coordinate, relative bond component 1.019 Å, MD bond std 0.05759 Å) → ideal bond inflation ≈ 17.7×. Thermal units: $r(0.02)=0.994$, $r(0.03)=0.988$, $r(0.05)=0.971$ (inflation 1.003 / 1.006 / 1.015).

### 3.2 Half-erasure levels on BBA (formula check)

Note 27: BBA Cartesian modes (units Å/6.252) with variances 15.5, 6.2, 3.0, 1.3 are "half-erased at t = 0.53, 0.44, 0.37…"; the formula above gives 0.526, 0.440, 0.368, 0.284 ✓. (Derived here:) a BBA Cα–Cα bond (std 0.05759 Å, #944) as a two-bead difference in those units has λ ≈ 4.24×10⁻⁵ → $t_{1/2}\approx4.1\times10^{-4}$, ~25× below the floor 0.01 ($r(0.01)=0.021$) — matching "Bond lengths are erased below the lowest trained noise level." The mirror case in internal coordinates (note 30 §7 [M]): "The closest distance between non-neighbouring beads has first-order loudness 0.003 in the internal chart, half erased at t ≈ 0.013, below every bond and angle… it is to internal coordinates what bond lengths are to Cartesian ones."

### 3.3 The bias–variance vise (note 20 §8; numbers derived here)

Require relative bias ≤ δ = 5% on the stiffest ALDP5 mode (w = 0.0252 Å): $\sigma^2\le\delta w^2/(1-\delta)$ → σ ≤ 0.0058 Å, and the DSM target then has variance ≈ $(1-\delta)/(\delta w^2)$ ≈ 3.0×10⁴ Å⁻² per coordinate, while the soft torsion force (w = 0.6631 Å) has magnitude ~1/w ≈ 1.5 Å⁻¹. In thermal units every $c_k=1$ and the same δ costs target variance 19. Ratio = κ: note 20 §1.4 gives "condition number about 920" for the aligned covariance; (derived here) the nine evidence stds give (0.6631/0.0252)² ≈ 692; note 21 uses κ ≈ 356 for an idealised spectrum. Measurement [M] (note 20 §8): linear least-squares DSM fits in two ALDP5 windows, bias ≤ 5%, 20 seeds — "soft forces about 4.4× more accurate with stretched (pullback) noise; 500 frames match flat fits on 10,000, a 19× gain"; stiff forces equally accurate; Cartesian force MSE 1.2–1.3× worse.

### 3.4 Why the loss does not see the bonds (LESSONS D18; pilot)

Excess loss for a wrong bond width ratio $r$ (§2.10), averaged over $t\sim U[10^{-5},1]$ and summed over seven stiff directions of widths 0.07–0.24 (normalised units): 1.23 (1,000 steps) → 0.0093; 1.085 (5,000) → 0.0014; 1.05 (50,000) → 0.0005; 1.01 (~200,000) → 0.00002, against a total loss ≈ 1.0 and minibatch scatter 0.02–0.07. "Going from 8.5% to 5% too broad lowers the ideal loss by about 0.001… 20–70 times less than the minibatch scatter, while the bond PMF error falls by a quarter." (The individual seven widths are not listed, so the averages can be reproduced only approximately.)

### 3.5 A single noise level carries little soft-force information (note 30 §7; derivation)

With $\log p_\sigma\approx\log p+\theta h+O(\sigma^2)$ and target $\epsilon\sim\mathcal N(0,I)$, the regression signal for θ is $\sigma\theta\nabla h$ per example against unit noise: Fisher information $\propto\sigma^2|\nabla h|^2$, so $\mathrm{sd}(\hat\theta)\propto1/(\sigma\sqrt n|\nabla h|)$ — the soft force error grows as $1/\sigma$. Meanwhile contacts blur with σ. Lab 11-16 (low-noise continuation) measures the contact-distance blur $\sqrt{v\,g^\top(J^\top J)^+g}$ (median over contact pairs, 1,024 molecules) vs number K of loud modes:

| level | K = 0 (C3) | 1 | 2 | 4 | 8 | 27 |
|---|---|---|---|---|---|---|
| 0.001 | 0.09 Å | 0.07 | 0.05 | 0.04 | 0.03 | 0.03 |
| 0.005 | 0.23 Å | 0.19 | 0.13 | 0.10 | 0.09 | 0.09 |
| 0.01 | 0.37 Å | 0.32 | 0.22 | 0.16 | 0.15 | 0.15 |
| 0.05 | 1.46 Å | 1.24 | 0.85 | 0.62 | 0.58 | 0.57 |

Torsion lever arm: "At level 0.05 each torsion is blurred by 6.6°, which moves distant beads by about 1 Å through their lever arm" ((derived here) 0.115 rad × 5–10 Å = 0.58–1.15 Å).

### 3.6 What a missing volume term does: radial toys (derived here)

2-D standard Gaussian in polar coordinates: $p(r)\propto r\,e^{-r^2/2}$, so the radial force is $1/r-r$. Dropping the Jacobian (force $-r$) makes the stationary radial law half-normal: mean $\sqrt{2/\pi}=0.798$ instead of the Rayleigh mean $\sqrt{\pi/2}=1.253$ (−36%). In 3-D ($p\propto r^2e^{-r^2/2}$): Maxwell mean $2\sqrt{2/\pi}=1.596$ → 0.798 (−50%). A missing or wrong volume term looks like a physical attraction. BBA analogue (lab 11-16): reweighting the data by the ratio of the two volume factors "predicts the ensemble the wrong term makes stationary, mean Rg 9.58 Å instead of 10.66 Å, without any simulation. The study's simulations ended at 9.6 to 9.7 Å." Note 30 §7 [M]: for a perfect model in the loud chart, the read-out "is unbiased in size… only with the volume term of note 29; without any volume term the chain shrinks by 1.7–1.8 Å."

### 3.7 Manufactured checks of the force contract (note 17)

- One chart: $m(x)=e^{0.2\sin x}$, $g(x)=1+0.4x^2$, $\rho\propto e^{-x^2/2}$, $k_BT=1$: $d\log J_g=\frac{0.4x}{1+0.4x^2}-0.2\cos x$ and $g\,s_g+d\log J_g=-x=F$ — the same physical force for every metric; $b=(a/2)D(-x)$ gives zero probability flux.
- Nonstationary: OU $dY=-Y\,dt+\sqrt2\,dW$, $X=\sinh Y$ → $D(x)=1+x^2$, $B(x)=-\mathrm{asinh}(x)\sqrt{1+x^2}+x$ (checked by Itô: $dX=(\sinh Y-Y\cosh Y)dt+\sqrt2\cosh Y\,dW$ (derived here)); Jacobian $(1+x^2)^{-1/2}$; "Omitting the chart correction fails this control."

### 3.8 A large cancellation that is still correct (#952)

$X\sim\mathcal N(0,1)$, $y=aX$, α = 0.99, a = 100, x = 0.7: exact smoothed force $-\alpha^2a^2x/(\alpha^2a^2+\sigma^2)$; fixed Gaussian term −6860.7, residual +6860.0000014, total −0.6999986 ✓ (σ² = 0.0199). Also: for standard-normal X the perfect predictor has per-coordinate MSE α² = 0.9801, "close to the zero-prediction loss 1" — a denoising loss near 1 does not by itself show underfitting.

### 3.9 Euler–Maruyama on a two-bead bond (derived here)

Bond length δ between beads i, j with $\beta U=\tfrac k2\delta^2$, each bead stepped with $h$: $\delta\leftarrow(1-2hk)\delta+\sqrt{4h}\,\zeta$ → stationary variance $\frac1{k(1-hk)}$, spread inflation $1/\sqrt{1-hk}\approx1+hk/2$, linear stability $h<1/k$. With note 20's ALDP5 bond stiffness $\beta k$ = 1,100–1,660 Å⁻²: 6–9% at h = 10⁻⁴ Å² (measured 8–11%), 12–20% at 2·10⁻⁴ (measured 1.18–1.20), stability limit 6.0–9.1×10⁻⁴ Å² (walkers of the metric models blew up at 4·10⁻⁴). #768's "about 1 + kh/4" is the single-coordinate version; the two-bead factor 2 matches the measured step-size table better.

### 3.10 Linear response for a fitted size term (lab 11-17)

Size coefficient −0.16 per Å in the log-density (inward 0.16 kT/Å): "shifts mean Rg by the coefficient times the variance of Rg, 0.16 × 4.8 Å² ≈ 0.8 Å, about the swelling it has to cancel (an estimate, not a measurement)."

### 3.11 ScoreMD's toy (Appendix C.4)

Müller–Brown potential $U(x,y)=-200e^{-(x-1)^2-10y^2}-100e^{-x^2-10(y-0.5)^2}-170e^{-6.5(0.5+x)^2+11(x+0.5)(y-1.5)-6.5(y-1.5)^2}+15e^{0.7(1+x)^2+0.6(x+1)(y-1)+0.7(y-1)^2}$, Langevin with $k_BT=23$, dt = 0.005, M = 0.5·I, 100k samples. Table 10 (iid PMF / sim PMF): Reference 0.087; Diffusion 0.111 / 0.504; Mixture 0.097 / 0.247; Fokker–Planck 0.122 / 0.163; Both 0.098 / 0.099 — the cleanest small-scale picture of the consistency gap.

---

## 4. Key empirical results

### 4.1 ScoreMD (paper)

Table 1 (PMF, mean ± sd): ALDP — Diffusion iid 0.098 ± 0.006, Ours iid 0.097 ± 0.008, Two For One sim 0.206 ± 0.004, Ours sim 0.091 ± 0.004; Chignolin — 0.027 ± 0.000, 0.035 ± 0.001, 1.438 ± 0.019, 0.038 ± 0.006; BBA — 0.034 ± 0.000, 0.234 ± 0.001, 1.624 ± 0.107, 0.254 ± 0.005. "Ours" = Both (FP on the small-t expert + MoE).

Table 11 (ALDP; iid JS / sim JS / iid PMF / sim PMF): Diffusion 0.0081 / 0.0695 / 0.095 / 1.047 ± 0.924; Two For One 0.0081 / 0.0158 / 0.098 / 0.206; Mixture 0.0080 / 0.0353 / 0.092 / 0.388; Fokker–Planck 0.0082 / 0.0090 / 0.098 / 0.104; Both 0.0082 / 0.0080 / 0.097 / 0.091. "Standard Diffusion fails to recover the low-probability mode (i.e., φ > 0) completely".

Table 12 (ALDP C–N bond W1, relative to Both; iid / sim): Diffusion 0.88 / 0.83; **Two For One 0.88 / 23.51 ± 1.91**; Mixture 1.13 / 0.47; Fokker–Planck 1.65 / 1.23; Both 1.00 / 1.00. (Unregularised Diffusion has *sharp* simulated bonds; its failure is the landscape.)

Table 15 (BBA; iid PMF / sim PMF / iid PWD-JS / sim PWD-JS): Diffusion 0.034 / 5.387 / 0.0006 / 0.1003; Two For One 0.034 / 1.624 / 0.0006 / 0.0240; Mixture 0.081 / 5.970; Fokker–Planck 0.117 / 0.275 / 0.0018 / 0.0078; Both 0.234 / 0.254 / 0.0023 / 0.0042. "for the larger and more complex BBA system, it becomes evident that achieving a consistent energy-based model requires trade-offs in iid sampling quality." Chignolin Diffusion sim PMF 63.804.

Read-out times (B.3–B.4): t = 10⁻⁵ for all but Two For One: t = 0.02 (ALDP, Chignolin), **t = 0.005 (BBA)**. Simulation: 100 parallel runs from random training conformations, 2 fs, total 1.2 µs (ALDP), 855.6 ns (Chignolin), 200 ns (BBA; "100 parallel runs of 1M steps each"). Training cost (Table 8): ALDP Diffusion 50 min vs FP 4 h 39 min (one A100); BBA 1 d 20 h* (two GPUs) vs 7 d 2 h (four GPUs).

### 4.2 ALDP5 force fields from feature-space models (#768, evidence 2026-10-26/27)

Five models × 3 seeds, non-conservative noise-prediction MLPs, 200k steps; overdamped EM, h = 10⁻⁴ Å², 40,000 steps (10,000 burn-in), 1,000 walkers, 20,000 of 100,000 frames scored; read-out t chosen per seed on training frames (flat low floor 0.001–0.003; production floor 0.01; learned and spring 0.03; $w^\delta$ 0.01/0.03/0.03).

| Model | Rama JS sim / diffusion | PMF error sim / diff ($k_BT^2$) | Bond W1/σ sim / diff | Angle W1/σ sim / diff | Valid (sim) |
|---|---|---|---|---|---|
| flat, low floor | 0.142 / 0.021 | 2.14 / 0.36 | 0.109 / 0.015 | 0.180 / 0.016 | 0.961 |
| flat, production floor | 0.026 / 0.021 | 0.46 / 0.37 | 1.105 / 0.422 | 0.443 / 0.231 | 0.372 |
| learned coordinates | 0.021 / 0.021 | 0.37 / 0.34 | 0.072 / 0.015 | 0.044 / 0.017 | 0.970 |
| spring | 0.024 / 0.020 | 0.42 / 0.33 | 0.064 / 0.013 | 0.042 / 0.018 | 0.973 |
| $w^\delta$ | 0.049 / 0.020 | 0.93 / 0.35 | 0.117 / 0.018 | 0.126 / 0.032 | 0.947 |
| floors: training MD / held-out half | 0.021 / 0.019 | 0.39 / 0.32 | 0.017 / 0.010 | 0.015 / 0.013 | 0.986 / 0.987 |

Force check at 200k (directions 1–3 / 4–7 / torsions 8–9): flat low floor 0.91–1.00 / 0.60–1.04 / 0.76–2.65; production floor 0.20–0.29 / 0.42–0.69 / 0.37–0.79; learned 0.96–1.00 / 0.93–1.01 / 0.76–1.04; spring 0.97–1.03 / 0.91–0.99 / 0.52–1.19; $w^\delta$ 0.85–0.99 / 0.60–1.04 / 0.21–1.59. Mean |log ratio| over the 7 stiff directions (seed 0) at 0 / 100 / 1,000 / 20,000 / 200,000 steps: flat low 5.7 / 0.94 / 0.61 / 0.14 / 0.054; production 6.6 / 2.0 / 1.07 / 0.99 / 1.00; learned 5.3 / 1.46 / 0.12 / 0.070 / 0.027; spring 4.2 / 0.98 / 0.13 / 0.048 / 0.024; $w^\delta$ 6.9 / 0.91 / 0.49 / 0.11 / 0.035. Torsions: flat low floor seed 0 ends with 83% αR (MD 35%); one $w^\delta$ seed 87% β/PII. Stability: at h = 4·10⁻⁴ Å² 74% of learned, 99% of spring and all $w^\delta$ walkers blow up; none at h ≤ 2·10⁻⁴. β-relaxation: learned/spring/production reach 16–29% αR (second-half mean), "still rising toward the MD value of 35%". Strain outliers (>10 $k_BT$), direct sampling at 100 / 1,000 / 200,000 steps: flat low floor 92% / 6.5% / 0.6%; spring 2.1% / 0.6% / 0.5% (MD panels 0.70% / 0.55%). Caveats in the note: one molecule, one integrator, no equilibrium proof, extraction time is a choice, check is necessary only.

### 4.3 Invariant embedding, full budget (2026-10-28)

Held-out RMS mean Stein residual over eleven identities (seed 0 / 1): strong flat 0.206 / 0.192; saved warp 0.072 / 0.029; spring 0.070 / 0.074; **invariant 0.038 / 0.049**. Short matched simulations (invariant vs strong flat): bond W1/width 0.0415–0.0595 vs 0.0926–0.1519; angle 0.0716–0.0760 vs 0.0796–0.1284; validity 97.40–98.02% vs 95.16–96.51%; torsion JS 0.153–0.191 vs 0.179–0.290 (overlap). Long invariant runs: "The final counts equal their initial values in every long run" (positive-φ walkers) — "insufficient exchange for an equilibrium population claim". iid at 200k: no torsion advantage (JS 0.0343 invariant vs 0.0349 strong flat).

### 4.4 Seven-map comparison (#886; evidence 2026-10-30, review 2026-11-03)

Conservative transformer (scalar-feature nodes), 250,000 training frames, 200k updates, 2 seeds; force read at t = 0.05 for every map; 64 walkers, h = 10⁻⁵ Å², 10,000 updates. Bond width / MD at 200k (iid; simulation): aligned Cartesian 1.006–1.090; **2.328–2.778** — centred Cartesian 1.033–1.095; **2.422–2.863** — trajectory spring 0.966–1.022; 0.993–1.066 — $w^\delta$ 0.954–1.002; 1.187–1.328 — invariant whitening 0.956–1.016; 1.036–1.100 — endpoint φ 0.963–1.027; 1.017–1.069 — transferred graph φ 0.962–1.020; 1.024–1.169. Quantum extension (means): Cartesian fixed units 1.170 / **8.750**, quantum springs 0.995 / 1.023, shared quantum φ 0.996 / 1.032 (iid JS 0.07862 / 0.07957 / 0.07832; sim JS 0.18808 / 0.11659 / 0.11427). From `final-200k.csv` (conservative rows, derived ratios): simulated C–N W1 relative to the same-family Cartesian is 0.0362 (spring), 0.0430 (whitening), 0.0356 (endpoint), 0.0416 (graph), 0.1686 ($w^\delta$) — i.e. the Cartesian model's simulated C–N bond is ≈23–28× further from MD than the invariant/spring maps', the same order as ScoreMD's Two For One vs Both (23.51), though not a head-to-head. Torsions do not separate the maps: paper-style JS against the fixed 50k reference is ≈0.076–0.079 (iid; the 2k-against-50k MD floor is 0.07821) and ≈0.113–0.118 (sim) for all; direct iid-vs-sim JS ≈0.16–0.18 at N = 2,000 (matched-2k MD floor 0.139).

### 4.5 Sprint 10 FP pilots (labelled-force learning, ALDP5, 2026-10-20)

#577: held-out FP RMS 5.1232 → 1.0805, 4.6226 → .8734, 3.9741 → 1.0671 (−73–81%); force MSE vs reference endpoint −10.06, −41.05, −13.18 (kJ mol⁻¹ Å⁻¹)², mean −21.43; extra gain over unregularised decaying fitting −5.24 [−14.24, 4.49] (unresolved); fit-stage time ≈1.85×. #579: unseen-time FP variation −74–81%. #583: −60–76%, frozen clean-force criterion fails.

### 4.6 BBA in Sprint 11 (#944, 2026-11-05)

Width-160, mean of two seeds, fine step, 2,560 post-burn slots (TIC JS / bond W1 Å / angle W1°): MD starts — Cartesian force 0.258 / 0.643 / 7.75; whitening force 0.330 / 0.116 / 20.34; shared noise only 0.290 / 0.827 / 9.83; generated starts — Cartesian 0.286 / 0.735 / 11.66; whitening 0.452 / 0.085 / 21.02. Start memory: TIC1 initial–final correlations 0.977–0.996.

### 4.7 BBA registered-budget study (190,350 updates = 10% of the 1,903,500-update schedule; 2026-11-15)

Generation (100,000 molecules; two seeds "a / b"): internal + 2 loud modes bond 0.00038 / 0.00033 Å, angle 0.20 / 0.19°, size 0.117 / 0.091 Å, population 0.0125 / 0.0130; native ScoreMD 0.042 / 0.042, 1.58 / 1.74, 0.157 / 0.532, 0.0209 / 0.0290; covariance-matched Cartesian 0.0053 / 0.0065, 1.36 / 1.30, 0.073 / 0.077, 0.0123 / 0.0126; C3 size 0.455 / 0.418; $w^\delta$ 0.027 / 0.034 Å, 1.73 / 2.12°, 0.062 / 0.072 Å. Loud vs native ScoreMD: bond ×119, angle ×8.5, population ×2.0.

Force panel (256 walkers from training molecules for 100 ps, Langevin 325 K, records pooled 50–100 ps; two declared force levels):

| Candidate | levels | Bond (Å) | Angle (°) | Size (Å) |
|---|---|---|---|---|
| Internal + 2 loud modes | 0.02 / 0.01 | 0.0038 / 0.0084 | 2.8 / 4.5 | 1.14 / 1.18 |
| Internal (C3) | 0.02 / 0.01 | 0.0033 / 0.0109 | 2.9 / 5.4 | 0.84 / 1.22 |
| Internal, older distance inputs | 0.02 / 0.01 | 0.0031 / 0.0080 | 1.9 / 3.3 | 0.78 / 1.13 |
| Covariance-matched Cartesian | 10⁻⁴ / 10⁻³ | 0.0053 / 0.046 | 4.5 / 4.9 | 1.85 / 2.59 |
| Cartesian + distance inputs | 10⁻⁴ / 10⁻³ | 0.017 / 0.050 | 17.8 / 10.8 | 7.9 / 4.7 |
| Native ScoreMD | 0.01 / 10⁻³ | 0.28 / 0.064 | 5.3 / 10.8 | 3.2 / 3.5 |
| Trajectory springs | 0.02 / 0.01 | 0.18 / 0.11 | 4.3 / 4.3 | 0.89 / 1.92 |
| $w^\delta$ | 0.02 / 0.01 | 0.21 / 0.72 | 17.0 / 18.0 | 1.77 / 1.99 |
| Invariant whitening | 0.02 / 0.01 | 1.34 / 1.78 | 28.6 / 31.1 | 2.1 / 2.8 |

Panel references (256 data molecules, no simulation): bond 0.0046 Å, angle 1.0°, size 0.14 Å (5–95%: 0.08–0.35 Å). "For every model, size error grows with simulated time, for the internal models from about 0.2–0.5 Å in the first 10 ps to 0.7–1.4 Å in the last 10 ps."

### 4.8 Drift, volume term, walls (2026-11-15 → 11-18)

- Size error at 90–100 ps (training starts; mean of four models) vs read-out level: 0.005 → 1.60; 0.01 → 1.26; 0.015 → 1.12; 0.02 → 1.06; 0.03 → 0.90; 0.05 → 0.69 Å; blur floor of the level alone 0.05 / 0.06 / 0.12 Å at 0.01 / 0.02 / 0.05. 500 ps at 0.05 (C3 s0, C3 s1, loud s2, loud s3): 0.82, 0.85, 1.10, 1.44 Å; folded share at the end 0.33–0.60 vs data 0.19. Compaction "grows with separation": bonds change < 0.007 Å, 1–4 distance up to −0.54 Å, long-range −1.4 to −3.2 Å; overlaps 9–18% within the first ps, flat afterwards.
- Volume term (loud s3, 512 paths, 100 ps; size error data / generated starts, overlap %, pair-distance error): driver term 0.98 / 0.94, 33.7%, 0.176; driver + wall 0.87 / 0.71, 2.4%, 0.155; **correct term 0.24 / 0.30**, 21.3%, 0.062. Rg Stein tilt at 0.05: driver term +0.69 kT/Å, correct +0.08. Wall: 0.01% of data molecules vs 16–36% in simulation have a non-neighbouring pair < 3.5 Å.
- Wall fits (100 ps): wall only → overlaps 0% but mean Rg 11.13–11.31 Å vs data 10.60 (size error 0.55–0.72 Å); wall + size term → size error 0.263 / 0.173 Å (uncorrected 0.267 / 0.175), pair-distance error 0.042 / 0.032 (uncorrected 0.062 / 0.055).
- #1130 (2,048 paths, level 0.05, correct immersion volume term): size error at 100 / 200 / 300 ps — library s2 0.268 / 0.408 / 0.562; s3 0.277 / 0.369 / 0.476; s4 0.221 / 0.483 / 0.631; executed s2 0.158 / 0.229 / 0.396; s3 0.242 / 0.492 / 0.642 Å; panel floor 0.084 Å.

### 4.9 The paper's own metric (PR #1138, open, 2026-11-18)

100,000 plain-sampler molecules vs the paper's training split (PMF $kT^2$ / JS nats): Cartesian covariance-matched s0 at 1,903,500 updates 0.096 / 0.011; ordered internal coordinates s2 at 1,903,500 0.097 / 0.011; ordered internal s2/s3 at 380,700 0.109 / 0.109; internal s0 at 1,903,500 0.113; Cartesian s0/s1 at 190,350 0.116 / 0.113; $w^\delta$ 0.161 / 0.198; native ScoreMD at 190,350 0.202 / 0.315; native ScoreMD at 790,350 (20,000 molecules) 0.638 (floor at 20,000: 0.56); springs 0.54 / 0.36; invariant whitening 2.27 / 4.40; floor 0.080 ± 0.001. Projection = the paper's TICA (`bba_tica.pic`, zero difference; 378 Cα distances + 25 pseudo-torsions); reference = the paper's 1,300,156-frame split. "Inferred, not measured: if each model's excess over the floor stayed constant with count, the best models would land near 0.02 at the paper's count." No simulation under the paper's recipe.

### 4.10 The consistency story in one table

| Setting | "Diffusion"-like read-out (small t) | "Two For One"-like read-out (larger t) | Resolution |
|---|---|---|---|
| ScoreMD ALDP (paper) | iid PMF 0.095; sim PMF 1.047 ± 0.924 (missing φ > 0); sim bonds 0.83× Both | sim PMF 0.206; sim C–N bond 23.51× Both | FP + MoE: iid 0.097, sim 0.091 |
| ScoreMD BBA (paper) | iid 0.034; sim 5.387 | sim 1.624 (t = 0.005) | Both: iid 0.234, sim 0.254 (iid cost ≈ 7×) |
| Our ALDP5, flat (#768) | low floor: sim JS 0.142 (83% αR in seed 0), bonds fine (0.109σ) | production floor: JS 0.026, bonds 1.105σ, 37% valid | spring/learned, no FP: JS 0.021–0.024, bonds 0.064–0.072σ |
| Our ALDP5, 7 maps (#886) | — | Cartesian at t = 0.05: bonds 2.3–2.9× (8.75× in Å units) | invariant/spring maps: 0.99–1.17× |
| Our BBA (study) | Cartesian family at 10⁻⁴: sharp bonds, size 1.9–7.9 Å | — | internal coords: bonds at floor, size 0.8–1.2 Å at 50–100 ps, but every model keeps compacting |

---

## 5. Why it was promising, why it failed, what was learned

### 5.1 Derived facts (hold under stated assumptions)

1. The $t=0$ score is the force (ScoreMD Eq. 6) and the force covector does not depend on which metric/coordinates trained the model (note 20 §8; note 29 §1). Coordinates change *only* the noise that shaped training and the bias at positive noise.
2. Reading the force at level t returns the score of the blurred density; for a Gaussian mode it scales the restoring force by the readable fraction $r(t)$ and widens the simulated mode by $1/\sqrt{r(t)}$ (§2.11). Two For One's broad bonds are this effect.
3. Under flat noise, readability differs by mode over $\log\kappa$ (2.6 decades on ALDP5); at the trusted floor bonds have SNR 0.30–0.46 (Prop 5). Only the forward noise can synchronise erasure (E4).
4. Making every mode readable at one moderate level requires metric-shaped coordinates; then one read-out serves all (§3.1: $r(0.03)=0.988$ in thermal units).
5. Soft-force information from one level scales as $\sigma^2$ per example (note 30 §7), so small-t read-outs are noisy for the soft, global part of the force — the other horn.
6. Any change of coordinates requires the exact volume term in the read-out; a wrong one is a spurious force (§3.6; lab 11-16).
7. An FP residual on an energy learned only from spatial scores has an unidentified gauge $C'(t)$ (note 04); FP consistency alone does not certify force accuracy (note 17).

### 5.2 Hypotheses (stated as such)

- "forces can be read at a larger noise level" with metric-shaped noise (note 20 E4 [H]) — supported on ALDP5 (#768, #886), on BBA for local geometry.
- "The soft part of a force read at small noise is inherited from higher levels through the network's continuity in t" (note 30 [H]); consistent with doubled training not reducing the drift (#1091).
- "A complete force field therefore needs the levels tied together, or the sharp short-range part supplied separately" (lab 11-16) — the stated rationale for keeping FP as a candidate remedy.
- "The wall has to be supplied: by the hard-core joint rebuild, by an analytic base energy, or by a channel whose own window covers contacts" (note 30 §7 [H]).
- The exposé's hope that geometry "pushes unphysical configurations to infinity → never sampled" and that the FP regulariser "interacts more usefully with the warped geometry" (overview) — never tested; $w^\delta$'s barrier turned out to sit on physically occupied near-planar ALDP5 frames (Sprint 7/10).

### 5.3 Why the original promise failed in this thread

- Forces need a conservative field; the conservative $w^\delta$ head did not sample (Sprint 2) and its repair was refuted twice (Sprint 6), so M1 became non-conservative and FP/forces moved to M3 (2026-10-06).
- Trust in the ruler and the baseline had to be built first (defective flat baseline until 2026-10-02; TF32; benchmark ratification #9 closed 10-07).
- Sprint 10 closed the intrinsic route (2026-10-22). A Laplace–Beltrami FP on $(\mathcal M,g_{w^\delta})$ lost its object; the manifold derivation was never the bottleneck.
- Flow matching's only pilot lost ~3× for wiring reasons (base-law mismatch) and was not resumed.

### 5.4 Why the coordinate route looked promising, and where it stands

- ALDP5 (Oct 27 → Nov 3): metric-shaped coordinates pass the force check within a few percent from one read-out level and keep bonds, angles and the Ramachandran distribution near MD in simulation; flat models fail on one horn each. The documents frame this as resolving ScoreMD's split "without a regularizer" — explicitly "a parallel, not a head-to-head comparison".
- BBA (Nov 15–18): internal coordinates (with or without the loud block) are the best force fields measured (bonds at the panel floor), far ahead of native ScoreMD's unregularised Diffusion arm. But: contacts are a range failure in internal coordinates (no wall), the loud-mode read-out had a volume-term bug (fixed), and *every* model still compacts for 300–500 ps. The blind spot moved from bonds (Cartesian) to contacts and soft global forces (internal).
- Is "change the coordinates instead of an FP regulariser" now the force-field claim? For ALDP5 the documents make that claim, restricted to "this molecule and this integrator". For BBA the roadmap says force read-outs are "the bridge to M3 and M4; it does not replace their Fokker–Planck and equilibrium evidence"; the drift note ranks FP below more training because it "needs a derivation on the internal-coordinate manifold"; the lab calls it "More expensive… about four times the cost per update". De facto: coordinates first, FP held in reserve; the formal M3/M4 claim is open.

### 5.5 Later corrections (dated)

- 2026-07-02 exposé "No prior work has combined a custom, energy-inspired Riemannian metric with a generative model" → 2026-07-31 R-DM added and the novelty claim qualified (commit c972f9ca9); the 08-03 deck notes still say "the first work to combine…".
- cond$(H)\approx2.4\times10^6$ (exposé) → "the E(3)-KERNEL ratio", horizontal median ≈88 (08-03 notes) → ALDP5 near-planar worst horizontal ≈1.5×10⁶ vs ≈4,000 for six beads (TD2, 10-19).
- 2026-11-15 "The loud block adds nothing in simulation" → 11-16 "three quarters of its compaction was a wrong volume term… This is direct evidence that the loud block also helps forces" (no compaction bias at levels 0.01/0.02, C3 has one) → 11-18 even with the correct term all models keep compacting past 100 ps (#1130).
- 2026-11-15 drift note: "an error of the learned force at small noise levels" → 11-16 lab: "The learned score is accurate from level 0.05 upward" on noised inputs; for the loud model the main error was the read-out; the remainder is a missing wall plus a slow drift.

---

## 6. Visualization opportunities

### 6.0 Inventory of figures already in the decks (and in-scope doc figures)

**TD1 (2026-07-31)**: s3 image6 = Diepeveen et al. title page + abstract; s7 image7 = four-row panel "Euclidean coordinates (curved valley) vs Geometry-aligned coordinates (straightened valley)": trajectories, score field ("highly non-linear" vs "nearly linear"), $\|\nabla_\gamma s\|$ along the trajectory, linearisation; s8 image8 = 3-D vector field converging onto a plane S (z = 0) with spiral flow ("Trajectory stays in S"); s15 formula images (wδ with underbraces "how different are the pairwise distances / how different is the overall 'spread'", separation, $H_X=A_X+\delta B_X$); s16 image12 = table "$w^\delta$ separation (cheap) / metric tensor H (medium, eigh) / geodesic distance (expensive, ODE)"; s17 image13 = `s_distance`, `s_prelog`, `s_log`; s19–24 diffusion formula snippets (forward/reverse SDE, Gaussian kernel, DSM); s25–27 image26 = sphere with Exp/Log and tangent plane; s28 image35 = wrapped Gaussian (tangent Gaussian pushed by Exp); s29–30 wrapped-Gaussian score, Varadhan; s31 image39 = De Bortoli et al. Fig. 1 (geodesic random walk); s32 image40 = algorithm box "driftless GRW step" (metric-white noise $v=s\sum z_jE_j$, $E_j=Q_j/\sqrt{L_j}$, $x\leftarrow\exp_x(\tfrac12v)$); s33–35 ISM formulas + "61x at AK scale"; s38–39 manifold forward/backward SDE and stationary law; s41 image51 = algorithm box "cold draw of $p_\infty$ (geodesic-walk Metropolis)"; s42 FP (text), s43 plan, s44–45 future ideas.
**TDF2 (content 2026-08-03)**: all of TD1 plus s3/35 Exp/Log images, s36 parallel transport (image40), s29 MLflow screenshot dated 07/29–07/31 (image39), s49 Hopf fibration art (image42), s51 $H_X$ table with the cond-number note, data slides (Chignolin N = 10 dim 24; BBA N = 28 dim 78; AK N = 214 dim 636), bundle-topology slides (Kabsch "44% wall-crossings on BBA"), and 15 speaker notes.
**TD2 (2026-10-19)**: s3 image1/2 = $w^\delta=\|F_\delta(X)-F_\delta(Y)\|$, $F_\delta(X)=((\log r_{ij}),\sqrt\delta\log\det G_X)$; s4 image3 = Sprint-1 ALDP6 Ramachandran grid (reference, wδ DSM, flat WG, flat GRW, identity, identity WG, wδ WG); s7 image4 = Ramachandran "Reference 800,000 / ALDP5 historical 100,000 (smeared) / ALDP5v historical 20,000" + image5 phantom-bead formula ($\hat n=\frac{(N-C_\alpha)\times(C-C_\alpha)}{\|\cdot\|}$, $x_v=C_\alpha+\ell\hat n$, ℓ = 1.5 Å); s8 image6 = bar chart "Near-planar five-bead configurations are numerically harder": ~1,500,000 vs ~4,000 largest horizontal condition number (800,000 frames); s9 image7 = "Issue 252" TF32 precompute JS 0.211 vs clean CPU retrain JS 0.101; s10 image8 = "aldp5v phantom-bead bakeoff" (flat JS 0.266/0.261; wδ ou 0.098/0.151; wδ vpou 0.113/0.110); s12 image9 = flat tangent charts on a sphere (6/10/14); s15–17 atlas reconstructions vs chart count (image19 Ramachandran grids 4–512 charts; image20 table, e.g. rank-3 median error 0.056 → 0.025 Å from 4 → 512 charts); s19 image23 = short-noise training table (JS 0.114899 / 0.106889 / 0.072171); s20–22 chart switching (≈1e-16 learned), shared-atlas reconstruction.
**In-scope doc figures**: `docs/investigations/force-field-simulation/` — `iid_vs_simulation.png` (the 4-panel diagonal), `equipartition.png`, `advantage_sim_profiles.png` (C–N bond "flat (floor 0.01) is 2.4× too wide"; ψ profile "flat (floor 1e-5) overfills αR"), `advantage_error_plane.png`, `ramachandran.png`, `step_size.png`, `beta_relaxation.png`, `strain_curves.png`, `strain_distributions.png`, `distribution_metrics.png`, `metrics_*_all.png`; `learned-stiffness-diffusion-pilot/` (17 PNGs incl. `bond_histograms_over_training.png`, `datasize.png`); `sprints/sprint6/figures/ramachandran_100k_*_turbo.png`; `sprints/sprint8/figures/rama_*.png`. **No BBA force-field figure exists in docs**; BBA force visuals must be built from the tables (§4.7–4.8).

### 6.1 Ideas (insight → on screen → computed from → pitfalls)

**V1. "Two papers, one gap" (opening).** Insight: the thesis began as the empty cell between ScoreMD (generative, FP-consistent, flat) and Diepeveen (geometry, no generator). Screen: 2×2 grid (rigid invariance × energy-aware geometry × generator), checkmarks filled from the README table; the thesis cell lights up; later a stamp "R-DM (2024) already pairs energy metric + denoiser" and "Sprint 10: flat stays default". Computed: logged facts (README table, exposé §1, Related_Work). Pitfall: the README labels this "historical positioning, not a completed novelty"; show the qualification.

**V2. "Promise ledger" timeline.** Insight: the goals were renamed and re-ordered, not silently dropped. Screen: horizontal timeline 07-02 → 11-19 with milestone cards that physically move on 10-06 (M1 conservative → non-conservative; M2 FP → M3; M3 FM → M5), then status chips (delivered / changed / never ran) from §1.11. Computed: GitHub event dates (exact). Pitfall: GitHub milestone numbers ≠ research labels (roadmap warning).

**V3. ScoreMD's seesaw.** Insight: one model, two uses; reading the force early breaks the landscape, late breaks the bonds; FP + MoE balances at an iid price. Screen: a seesaw whose pivot is the read-out time t; left pan "landscape" (sim PMF), right pan "bonds" (sim C–N W1); bars for Diffusion / Two For One / Mixture / FP / Both on ALDP and BBA. Computed: Tables 1, 11, 12, 15 (logged). Pitfalls: Two For One is t = 0.02 on ALDP/Chignolin but **0.005 on BBA**; "Ours" = Both; Table 1 ALDP Diffusion iid (0.098) ≠ Table 11 (0.095); PMF error ≠ JS.

**V4. The blur dial (analytic, interactive).** Insight: a force read at level t is the force of the blurred molecule: each mode's spring is softened to $r_k(t)$ and its simulated width grows to $w_k/\sqrt{r_k(t)}$. Screen: nine springs (ALDP5 widths 0.0252–0.6631 Å) as Gaussians; a t-slider with marks 10⁻⁵, 0.003, 0.01, 0.02, 0.05; bonds balloon, torsions don't; overlay the measured force checks (flat production 0.198–0.293 on the stiff directions; spring ≈1) and measured simulated bond spread 2.38–2.48. Computed: exact VP formulas (§2.3, §3.1) + evidence.json. Pitfalls: ideal = Gaussian perfect-model bound; principal directions ≠ bonds; noise unit 0.9418 Å is model-specific.

**V5. Same dial in thermal units.** Insight: when every coordinate is scaled to its thermal width, one dial position serves all modes ($r(0.03)=0.988$). Screen: split screen Cartesian vs thermal; same slider; in thermal units all springs move together. Add BBA: "Cartesian bond half-erased at $t_{1/2}\approx4\times10^{-4}$, 25× below the floor" vs "internal coordinates: closest contact half-erased at t ≈ 0.013 (note 30)". Computed: §3.1–3.2. Pitfall: thermal scaling of *coordinates* does not make *long-range* distances readable — the lever-arm blur (V11).

**V6. Two horns of the flat dilemma (ALDP5 #768).** Insight: flat models fail as force fields in opposite ways; coordinate change fixes both from one level. Screen: three columns (flat low floor / flat production floor / spring) × two rows (C–N bond density; ψ free energy or Ramachandran); numbers 83% αR vs 35%; bonds 2.4× too wide; spring on MD. Computed: reuse `advantage_sim_profiles.png`, `ramachandran.png`; per-seed values in `evidence.json`. Pitfalls: non-conservative MLPs, Brownian EM (8–11% integrator inflation at h = 10⁻⁴ Å²), not equilibrium (β relaxation still rising), different data than ScoreMD.

**V7. The diagonal (interactive replica of `iid_vs_simulation.png`).** Insight: consistency = same error in both uses. Screen: 4 panels, x = direct sampling, y = simulation, y = x line, MD floors; points animate from iid to sim positions; hover shows seed values (e.g. flat low floor sim JS 0.1933 / 0.1493 / 0.0834). Computed: `distribution_200k_by_seed` in `evidence.json` (exact). Pitfall: "The diagonal means equal error, not equal laws."

**V8. The force check explained.** Insight: an exact force pulls back exactly as hard as the data spread demands; $-\mathbb E[(g\cdot e)(e\cdot(u-\bar u))]=1$. Screen: a 1-D cloud with a spring; a too-soft spring lets the cloud widen; then the nine-direction bar chart for five models (reuse `equipartition.png`), with the ideal-blur curve for the flat production model. Computed: evidence.json + §3.1. Pitfall: necessary not sufficient; weak for torsions.

**V9. The bias–variance vise.** Insight: in Cartesian units, bonds force tiny noise; tiny noise makes the soft-force target ~κ times noisier. Screen: two jaws (bias ≤ δ needs σ² ≤ δc_min; variance 1/(δc_min)) closing on the soft-force signal; κ ≈ 920 (note 20) annotated; then thermal units open the vise. Add the measured "4.4× more accurate; 500 frames ≈ 10,000 (19×)". Computed: analytic (§3.3) + logged. Pitfall: the measurement is linear least-squares in two windows, not a neural diffusion model; the sample-efficiency claim does not extend to generation (pilot: "They do not save data").

**V10. The loss cannot see the bonds (D18).** Insight: a 23%-too-broad bond costs ~0.009 of a loss ≈1.0 with scatter 0.02–0.07; only ~6% of training times can see it. Screen: training-loss curve flat; beneath it a bond histogram sharpening; a magnifier shows the excess-loss formula and a thin band of t where σ ≈ w. Computed: D18 formula (exact for one Gaussian mode) + table. Pitfall: idealised; the seven widths are only given as a range.

**V11. No sweet spot for one read-out level.** Insight: soft forces need large σ (information ∝ σ²), contacts and bonds need small σ (blur ∝ σ); FP-style consistency "ties the levels together". Screen: two curves vs t crossing nowhere useful; contact-blur table by K loud modes (0.37 Å at 0.01 for C3 → 0.22 Å with K = 2); a lever-arm animation (6.6° torsion blur → ~1 Å at distant beads). Computed: note 30 §7 derivation + lab tables. Pitfall: the 1/σ law is leading order [D]; inheritance across t is [H].

**V12. What a missing volume term does.** Insight: forgetting the Jacobian is indistinguishable from an attractive force. Screen: 2-D Gaussian sampled in polar coordinates with and without the $1/r$ term (mean radius 1.253 → 0.798); 3-D (1.596 → 0.798); then BBA: wrong factor predicts mean Rg 9.58 Å vs 10.66 Å, simulations end 9.6–9.7 Å; fix → 100 ps size error 0.98 → 0.24 Å. ALDP5 aside: omitting the term shortens bonds by 0.30–0.36 thermal widths. Computed: analytic toy + logged. Pitfall: the BBA bug was a specific wrong formula (invariant-map factor on an immersion), not a missing term.

**V13. The compaction movie (BBA).** Insight: a 100 ps size error is a point on a drift. Screen: Rg histogram vs time (0–500 ps) for C3 and loud models at t = 0.02 and 0.05, with the data band (mean 10.60 Å) and folded share rising from 0.19 to 0.33–0.60; then #1130's 100/200/300 ps points with the correct volume term (size error 0.16–0.28 → 0.40–0.64 Å). Computed: tables in the drift note and lab README (logged). Pitfalls: 0.1–0.5 ns ≪ µs folding; starts are equilibrium frames, so drift measures stationarity violation; panel floors 0.084 Å (2,048 paths) and 0.14 Å (256).

**V14. BBA force-field leaderboard.** Insight: internal coordinates keep bonds at the floor and stay closest in size; Cartesian keeps size better in generation but not in dynamics. Screen: dot plot (bond, angle, size) per candidate, the two force levels as a dumbbell. Computed: §4.7 table. Pitfalls: native ScoreMD here is the **no-FP Diffusion arm at 10% budget**, read at 0.01/10⁻³; best-of-two levels is post hoc; no FP model in the panel.

**V15. Where is the wall?** Insight: no model learned excluded volume; a fitted wall removes overlaps but needs a size term to avoid swelling. Screen: overlap fraction 0.01% (data) vs 16–36% (simulation); wall-strength slider with the linear-response size shift (coefficient × 4.8 Å²); three panels: none / wall (Rg 11.1–11.3 Å) / wall + size (size error 0.263 / 0.173 Å). Computed: lab tables + §3.10. Pitfall: fitted against simulations, not shown stationary (#1113, #1136 pending).

**V16. Paper metric vs sample count (#1138).** Insight: the paper's PMF has a count-dependent floor; at 100,000 molecules it (0.080) exceeds the paper's best value (0.034). Screen: log-log floor curve (0.56, 0.18, 0.080, 0.039, 0.025 at 20k…325k; dashed extrapolation ~0.006 at 1.3M), model dots at 100k (0.096–4.40), the paper's Table 1 dots at 1.3M. Computed: logged. Pitfalls: never compare across counts; extrapolation not measured; one inference seed.

**V17. Milestones that moved (Sankey).** Screen: July set → Oct 6 set → Nov status. Computed: GitHub events. Pitfall: historical memberships "do not establish the revised outcome".

**V18. Conditioning, three readings.** Screen: eigenvalue bars of the 84 × 84 BBA $H_X$ with six near-zero kernel bars (ratio ≈2.4×10⁶), horizontal block (median ≈88), then ALDP5 near-planar collapse (~1.5×10⁶ vs ~4,000). Computed: deck notes / TD2 image6 (logged). Pitfall: different molecules and quantities; do not present as one contradicting series.

**V19. FP regulariser in one picture.** Insight: FP links how a density changes in diffusion time to its spatial shape; violations concentrate near t = 0. Screen: a 1-D OU density evolving; LHS $\partial_t\log p$ vs RHS heat-map over (x, t) for a model with a small injected error (illustrative); then ScoreMD's statement "Across all methods, the error is largest near t = 0" and Sprint 10's −73–81% FP variation. Computed: analytic OU toy (illustrative error model must be labelled invented). Pitfalls: time-gauge $C'(t)$; #577 is a labelled-force feature-space pilot, not generation.

**V20. Two densities from one model (ScoreMD Eq. 7) on Müller–Brown.** Screen: exact Müller–Brown landscape ($k_BT$ = 23); left "denoising density p(x)", right "Boltzmann density of the t ≈ 0 energy p₀(x)"; a small energy bump changes p₀ but not p; Table 10 numbers. Computed: exact potential + illustrative perturbation. Pitfall: the perturbation is didactic, not the paper's learned error.

**V21. Future ideas, cashed out.** Screen: six cards from TD1 s44–45 flipping to outcomes (§1.10). Computed: logged.

**V22. Re-animate the deck's "curved valley vs straightened valley".** Insight: the original intuition (straightening makes the score field simple) became "scale stiff coordinates to their thermal width" — straightening in the stiffness sense, not along trajectories. Screen: TD1 image7 rebuilt with a real 2-mode Gaussian whose stiff direction is rescaled; show the score field before/after. Computed: analytic. Pitfall: the deck image is a cartoon; do not attribute measured claims to it.

---

## 7. Open questions, caveats, contradictions

1. **PMF error described as JS.** The exposé §6.2 ("iid PMF error: JS divergence…") and TDF2 s10/s45 ("Simulation-PMF error (JS after Langevin)") conflate two different metrics; ScoreMD reports both separately (Tables 14–15).
2. **Simulation starts.** Exposé: "Langevin dynamics initialized from model samples"; ScoreMD §5.1: "we initialize 100 parallel simulations from random training conformations". The project's BBA panels use both start types.
3. **BBA trajectory length.** Exposé/decks: 325 µs; ScoreMD B.4: "106 µs and 223 µs were simulated for Chignolin and BBA"; the project's BBA data have 1,625,195 frames at ~200 ps (status: "'1 ps' pairs are about 200 ps apart"), ≈325 µs (derived here).
4. **Two For One read-out time.** Project docs quote t = 0.02 (correct for ALDP/Chignolin); the paper uses t = 0.005 for BBA.
5. **Within the paper.** Table 1 ALDP "Diffusion iid 0.098 ± 0.006" vs Table 11 Diffusion 0.095 ± 0.003 (0.098 ± 0.006 is Two For One's iid in Table 11). Prose vs released code: iid count ("same number of samples as in the training set" vs 100,000 in `evaluate.py`, plainer-parity-axes), JS smoothing, PMF averaging vs mixture weights.
6. **Novelty.** Exposé (07-02) "No prior work…"; qualified 07-31 (R-DM); deck notes 08-03 still "the first work to combine…".
7. **cond(H).** Three readings in three settings (§5.5).
8. **FP cost.** Lab 11-16 "about four times the cost per update"; deck note "three to five times"; ScoreMD Table 8: ALDP 50 min → 4 h 39 min on one A100 (5.6×); BBA 1 d 20 h on two GPUs → 7 d 2 h on four (≈7.7× GPU-hours, derived here).
9. **Exposé forward process as written** has a fixed g-length step (§2.2) — not a Gaussian VP kernel (my reading).
10. **Deck slips.** TD1 s6 "AK 226" (TDF2 note: "N=214, not 226"); TD1 s6 "Chi 6" (Chignolin N = 10); TD1 s34 "O(k⁴) memory and O(k³) time" contradicts s35 and the notes (O(k⁴) FLOPs, O(k³) memory).
11. **Integrator factor.** #768 "1 + kh/4" vs a two-bead derivation $1/\sqrt{1-hk}\approx1+hk/2$ (§3.9), which matches the measured 8–11% better; linear stability $h<1/k$ = 6–9×10⁻⁴ Å², yet metric-model walkers blew up at 4×10⁻⁴ — anharmonic stiffening? (open).
12. **Sign conventions** of the stationarity tests differ between the drift note (Part B: positive = pushes outward) and the lab (tilt: positive = outward force missing); Part B's Cartesian residual is dominated by stiff bond terms and "does not predict the drift".
13. **Data mean Rg** 10.60 Å in tables vs "10.66 Å" in the lab's reweighting sentence.
14. **0.6 kT/Å** inward force from the wrong volume term is a measured Stein tilt difference (0.69 − 0.08 at level 0.05); a pure-dilation estimate of $-\tfrac12\log\det I$ gives $3/R_g\approx0.28$ kT/Å (derived here) — not contradictory (the term is not a function of Rg alone), but do not quote one as the other.
15. **"Beats ScoreMD"** in Sprint 12 means beating the project's re-run of ScoreMD's *unregularised* Diffusion arm at 10% of the schedule, read at 0.01/10⁻³ — not the paper's FP model; and #1138's numbers are not yet on the paper's sample count.
16. **Sample efficiency** has two different meanings: note 20 §8's linear soft-force fits (19× fewer frames) vs the generation pilot ("They do not save data"; note 30 "Learning speed, not data efficiency").
17. **Invariant "force consistency"** rests on Stein residuals over eleven identities and short runs; long runs showed no basin exchange.
18. **Open scientific questions**: Will the wall + size correction hold at 500 ps (#1113) and stop the drift (#1136)? Is the slow compaction a learned small-noise error, a read-out issue, or a missing wall (#1094)? Would an FP/consistency loss on the ambient feature density help, given that "Ambient Fokker-Planck consistency does not remove" the difference between decoded pushforward and image-restricted density (#952)? What does the paper's 200 ns simulation protocol give for the ordered model vs native ScoreMD at t = 10⁻⁵ (#1138 "Next")? M3's conservative ALDP baseline (#11) and score-to-force module (#859) are still open; AK and Chignolin never ran.

---

## 8. Sources read

- Exposé: `docs/expose.pdf` (pdftotext -layout, full); `/Users/I745505/private/thesis/pocs/manifold-scoremd/overview_ml.tex` (full).
- Decks (unzipped slide XML, notes and media; read-only): `/Users/I745505/private/thesis/ThesisDiscussion1.pptx`, `ThesisDiscussionFrank2.pptx`, `ThesisDiscussion2.pptx`; text compared with `ThesisDiscussion1 copy.pptx` and `ThesisDiscussionFrank.pptx` for dating. Images viewed: TD1 image6–8, 12, 13, 26, 29, 35, 39, 40, 51; TD2 image1–9, 19, 20, 23–26; TDF2 image10–13, 39, 42.
- ScoreMD paper: `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative/papers/2025/molecular_dynamics_with_energy_based_diffusion_models.pdf` (§1–6, A.1–A.4, B.2–B.5, C.1–C.6; Tables 1–15).
- rg-main: `README.md`; `docs/roadmap.md`; `docs/status.md`; `docs/Related_Work.md` (§E, Where we sit, master comparison); `docs/LESSONS_LEARNED.md` (D13–D18); `docs/DATA_STATE.md`; `docs/theory/04-fokker-planck.md`, `09-graph-laplacian.md` (header), `17-physical-density-metric-contract.md`, `18-finite-noise-force-targets.md` (start), `20-thermal-metric-foundations.md` (§0, §1.4, §4.6, §8–10), `21-target-loss-noise.md` (§0–1, §5), `27-readable-windows-and-noise-order.md` (§0–3), `29-score-to-force-pullback.md` (§1–3), `30-loud-blocks-in-redundant-charts.md` (summary, §7); `docs/sprints/sprint6/plainer-parity-axes.md`; `docs/sprints/sprint10/closeout-520.md`; `docs/sprints/sprint2/wdelta-conservative-head-analysis.md` (§0); `docs/sprints/sprint12/real-budget-study.md` (summary, questions, results), `scoremd-cartesian-baseline.md`; `docs/investigations/force-field-simulation.md` (+ `evidence.json`, figures), `supervisor-metric-comparison.md`, `supervisor-metric-comparison-methods.md` (+ `final-200k.csv`), `conservative-leaderboard.md`, `invariant-full-training.md`, `bba-force-learning-assessment.md`, `bba-simulation-diagnosis.md`, `bba-internal-force-field-size-drift.md`, `bba-internal-force-field-longer-training.md`, `feature-space-evaluation.md` (summary), `learned-stiffness-diffusion-pilot.md` (summary, data size, loss section), `endpoint-force-learning-529.md` (start); `lab/2026-11-16-bba-force-field-diagnosis/README.md`, `lab/2026-11-16-bba-low-noise-continuation`, `lab/2026-11-17-bba-simulation-fitted-wall`, `lab/2026-11-17-bba-wall-fit-size-term`, `lab/2026-11-18-bba-loud-mode-force-size-followup`, `lab/2026-11-18-bba-loud-mode-equilibration` (results); `src/riemanniangenerativemd/forward/internal_chain.py` (FP residual functions).
- Archive (`rg-archive/docs`): `roadmap.md` (2026-10-06), `status.md` (2026-10-06 reconciliation; 2026-10-20 FP entries), `sprints/SPRINT_1-6_REFLECTION.md`, `sprints/sprint8/fm_failure_diagnosis.md`, `design/feature-fp-regularization.md`, `investigations/feature-fp-force-learning-577.md`.
- GitHub (read-only): PR #1138 (body); issues #3, #284, #18, #11, #859, #1094, #243, #255; issue events for #2, #3, #11, #18; milestones list; PR metadata for #753, #754, #768, #784, #808, #810, #823, #880, #886, #893, #895, #899, #944, #951–#953, #957, #985, #1025, #1033, #1046, #1055, #1057, #1064, #1069, #1071, #1074, #1088, #1089, #1091, #1100, #1101, #1103, #1106, #1109, #1111, #1113, #1130, #1132, #1136; issues #4, #5, #7, #9, #10, #12, #17, #19.
- Git (live checkout, read-only): first commit 2026-07-13; Related_Work/R-DM commits 2026-07-31; objective-file history (no `objectives/fp.py` on `origin/main`).
