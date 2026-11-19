# ERA 1 — the wδ metric used directly on configuration space (Sprints 0–10, July–October 2026)

Reader key: r1-wdelta-era. Sources are the ML repo snapshot `rg-main` (origin/main, 2026-11-19), the archive tag `archive/pre-cleanup-2026-10-23` (`rg-archive/docs`), read-only git history of the live checkout, and `gh` metadata. Paths below are relative to `rg-main/` unless marked `archive:` (= `rg-archive/docs/`) or `git:<rev>`. Numbers are quoted as written in the source. Anything I computed myself is marked **(derived here)**; I ran small numpy checks (scripts in `scratchpad/understand/checks/`). Note: GitHub-style math in the sources uses backtick delimiters; I convert to `$...$`.

---

## 0. Headline in one paragraph

From July to October 2026 the project tried to build "the first diffusion model that operates directly on the quotient shape manifold" $\mathcal M=\mathrm P(d,n)/\mathrm E(d)$ with Diepeveen et al.'s training-free wδ metric (archive: `sprints/SPRINT_1-6_REFLECTION.md` §1). The metric is the pullback of a flat feature space $F(X)=((\log r_{ij})_{i<j},\sqrt\delta\log\det G_X)$; it measures *relative* deformation, makes collisions and loss of affine rank infinitely far away, and splits exactly into a flat log-scale coordinate times a curved shape factor. Using the tensor intrinsically meant: no closed-form forward kernel, so every noising step is a numerical geodesic ODE solve on a stiff metric; labels became separation-gradient surrogates; the reverse sampler needed the same stiff exponential hundreds of times per sample. A sequence of real bugs (tensor transpose, score sign, τ=2 factor, eigh-derivative NaN, TF32 matmuls, clamp granularity, forward/reverse clock mismatch, covector-ISM divergence, a removed Jacobian factor) was found and fixed, and an apparently large early win (Sprint 1, ALDP n=6, JS 0.117 vs 0.479) was measured. But the five-bead ALDP backbone is nearly planar, which is exactly the metric's infinite-distance rank barrier (worst horizontal condition ≈1.55×10⁶ over 800k ALDP5 frames vs 4.2×10³ with the real Cβ; numerical loss of positive definiteness on flattened frames); finiteness was only restored with an exact scale/shape split plus a virtual "phantom" bead, and then the *distribution* was still wrong (α_L over-populated 20–50×, bonds 50–100× too broad), sampling cost ≈340–600× flat, and the apparent wδ advantage vanished once the flat baseline's own bug was fixed (flat 0.26 → 0.10; ScoreMD-native flat 0.0151 at a 0.0114 floor). Sprint 10 (closed 2026-10-22) kept flat Cartesian as the default and demoted original wδ to a "restricted-domain reference". The durable outputs were the contracts (geometry → forward law → learned score → reverse dynamics), exact validation identities, and the realization — formalized after 2026-10-23 — that the question is *what the metric should do to the noise*; by that criterion wδ at δ=1 is *stiffer* than flat on ALDP5 (κ 413 vs 192), and the same wδ features later worked reasonably as a cheap Euclidean *embedding* (Sprint 12).

---

## 1. Narrative (chronological)

### 1.1 Prehistory and the original pitch (before and around 2026-07-13)

- **The source geometry.** Diepeveen et al., *Riemannian geometry for efficient analysis of protein dynamics data* (arXiv 2308.07818). It is not a generative model: it constructs $\mathrm P(d,n)/\mathrm E(d)$ (labelled, collision-free, full-affine-rank clouds modulo translations, rotations **and reflections**) with the wδ separation and metric, and uses separation-based interpolation, barycentres and low-rank tangent PCA. Its MD evidence: adenylate kinase (AK, 214 Cα, 102 frames) and helicase nsp13 (590 Cα, 200 frames), δ=1; good recovery of the ordered AK transition, substantial deficiencies for a single helicase path (`docs/investigations/wdelta-qualification-522.md` "What made the original transition look good"; `metric-numerics-scaling-assessment.md` "What the MD comparison in Diepeveen actually establishes"). The AK input is "a **DIMS directed transition**, not an unbiased equilibrium path" (522).
- **Upstream code never integrates geodesics.** Diepeveen's `s_exp` is "iterative geodesic *doubling*", i.e. repeated separation extrapolation to $t=2$ with $K=\lfloor\|X\|_g/4\rfloor+1$ steps; `s_log` is a truncated eigen-pseudo-inverse; there are no guards at $\det G\to0$; the upstream notebook only uses short forward tangents between real frames (archive: `investigations/exp-geodesic-solve-strategies-232.md` Q1–Q2).
- **The project pitch** (repo initial commit 2026-07-13; `docs/Related_Work.md`, written 2026-07-31; `README.md` "Original positioning"): a "compound" novelty — training-free energy-aware shape metric × full E(3) reflection quotient × ensemble sampling from a samplable confining-OU wδ-Gibbs prior × "log-free training valid past the injectivity radius" via a geodesic random walk (GRW) forward plus implicit score matching (ISM). Closest prior art named: R-DM (Woo et al. 2024, pull-back Fukui-like metric, single-minimum optimization). The thesis claim: "the metric $H=A+\delta B$ makes physically implausible deformations (bond-length violations, clashes) metrically expensive, so noise and score both flow along energetically sensible directions" (archive: `SPRINT_1-6_REFLECTION.md` §1).
- **The metric-tensor transpose bug** (post-mortem in `git:8298d51f8:docs/theory/07-metric-tensor-bug.md` §12, 2026-07-28; current lesson in `docs/theory/07-metric-tensor-bug.md`). `metric_tensor(asmatrix=True)` used permutation `(0,1,2,5,3,4)` instead of `(0,1,2,4,3,5)`, swapping spatial indices inside each atom block. The July doc states "The same bug was present in both the JAX port and the original PyTorch reference (`diepeveen2024/src/manifolds/pointcloud.py`)", so parity tests passed while both were wrong. Measured on BBA (n=28, δ=1, float64): rotation residual $\|Hv_{\rm rot}\|/\|v_{\rm rot}\|$ ~1e-2 → ~4e-9; negative eigenvalues per frame 3–5 (min ~−0.011) → ~0.4 at ~−1.6e-10; `s_log` vertical leakage 4.5% → 4.3e-8; quadratic-form consistency rel. err. 1.8e-3 → 3.2e-16. An early BBA DSM run on the corrupted targets reached loss 105.5 (below the zero-output baseline 177) with cosine ≈ 0 to the true score: "loss descent was misleading". The fix predates or coincides with the first commit (the `-S` search finds the correct permutation already in the initial commit).

### 1.2 Sprint 0 — building the machinery (2026-07-27 → ~08-05)

Dated commits on `origin/main` (git log):
- 2026-07-28 **#28** "Replace doubling s_exp with Verlet geodesic-ODE exp": the project's `exp` integrates the kinetic Euler–Lagrange equation by velocity Verlet to geodesic parameter **2** (the "τ=2 convention"); **#30/#15** fix the factor of two in the forward ("Passing the raw $\sigma v_h$ placed samples at twice the intended distance and made the label 4× too large (measured ratio 4.0000)", `docs/APPROXIMATIONS.md` §E); **#33** metric-white noise ($\mathrm{Cov}_E=\sigma_{\rm eff}^2H^\dagger$, verified to relative ~1e-7).
- 2026-07-28/29 **#34, #52** curvature machinery and a curvature-magnitude fix; "measured" injectivity radii ≈1.0 (chignolin, k=24) and ≈4.5 (BBA, k=78) in g-arc units; scalar curvature $R\in[-16,+269]$ (chignolin) and $[-34,+32]$ (BBA), positive sup-sectional curvature on every sampled frame (`git:f1d5be05c:docs/theory/02-log-exp-maps.md` §9a). **#54** label error of `s_log` past those radii (APPROXIMATIONS §F). **#55** wrote theory §21 "Injectivity limit of the DSM target and the GRW+ISM escape". (Both interpretations were later qualified; see §7.)
- 2026-07-29 **#56** GRW forward + ISM; **#62** confining OU drift on the GRW; **#64** stationary law corrected to Gibbs.
- 2026-07-30/31 **#63/#67/#76** cold Gibbs-prior geodesic-walk Metropolis sampler wired into generation; **#65/#69** $R_{\rm scale}$ as a mixing/cost knob; **#72/#85** cold-prior mixing ("BBA scale did not equilibrate"); **#71/#81** fusing the GRW walk into one `lax.scan` (stall fixed; reported 19× to 1085×); **#77/#90** O(k) Jacobi ISM connection trace; **#96/#97** (08-05) dense $(nd)^3$ solves kept (matrix-free CG slower up to AK).
- Also in Sprint 0 per the reflection: "the eigh-VJP NaN fix (reverse-mode `eigh(G)` overflows on exploded gyration → `solve(G,·)` at 3 sites)".

The motivating theory (2026-07, `git:f1d5be05c:docs/theory/10-...` §21): on flat space the Gaussian heat kernel gives both a sampler and a score for free; on $(\mathcal M,g)$ "the heat kernel has no closed form", so "both problems come back". The plan: forward axis fixed by the GRW ("provably samples the heat kernel"), target axis fixed by ISM ("reaches the true score without the log map"), cut locus sidestepped because `exp` is total and ISM is log-free.

### 1.3 Sprint 1 — proof of concept (≈2026-08-05 → 08-22; marked POC 08-22, #146)

`archive: sprints/sprint1/summary.md`.
- **S² stage** (72 runs: 3 arms × DSM/ISM × 2 densities × 2 base points × 3 replicates): after a DSM sign bug was fixed, both objectives align with the exact score on VMFMixture (ISM intrinsic cosine +0.999; DSM +0.82…+0.96). Key structural finding: on the round sphere "the specific curved-space correction term that ISM needs (a 'connection trace') is provably **exactly zero**" — "the sphere is too gentle a curve to exercise the hardest part of the machinery".
- **The DSM sign flip** (fixed 2026-08-11, commit 298c8c5; `docs/LESSONS_LEARNED.md` §2): target was $-s_{\log}(x_t,x_0)/\sigma_{\rm eff}^2$, "exactly minus the true score on the flat arm (measured cosine −1)"; DDIM had a compensating negation so its test passed.
- **ALDP (n=6, 800,000 frames, 50 epochs, 3 seeds, 5,000 samples/seed, DSM)**, a quotient × metric × forward factorial. Headline: **wδ · GRW+OU = 0.117 ± 0.007** vs identity (flat metric on the same quotient) · GRW+OU **0.479 ± 0.005**; raw-ℝ¹⁸ flat WG 0.167 ± 0.012; **wδ · WG 0.469 ± 0.016** ("the metric and the forward process are not separable"). Reference floor 0.011. wδ arms needed 500 reverse steps: at 100 steps the winner scored 0.968 with 0.4% finite; at 500, 0.117 with 99.6% finite. wδ DSM was the only arm with α_L mass (0.40% vs reference 0.556%). Bond W1 (C–N): identity DSM best (0.0038 ± 0.0002 Å), wδ DSM 0.0227 ± 0.0109 Å. Costs: wδ DSM ~44 min/seed training plus ~2.1 h one-time precompute; 10 samples took ~3.2 min (flat ~1–8 s).
- **The ISM collapse**: plain ISM on wδ inflated the score's g-norm to ~700 (DSM ≈15), 0 of 20,000 samples finite at 100 steps; a nine-link diagnosis chain (LESSONS_LEARNED §1): root cause of the NaN was the reverse-mode derivative of `eigh(G)` in the horizontal projector ($1/(L_i-L_j)$ factors), fixed by a Gram-solve projector; a moving-chart divergence bug (~100× on wδ) was a genuine secondary fix; "ISM is unbounded below" was walked back; ill-conditioning was "refuted" (horizontal condition number median ~250–570). A DSM-anchored ISM sampled 92% finite but scored JS 0.440. The Sprint-1 interpretation "ISM is target-free / scale-free" was **later corrected** (§7).

### 1.4 Sprint 2 — ScoreMD parity and the obstacle hunt (2026-08-22 → 09-15)

`archive: sprints/sprint2/{summary,sprint-2-obstacles,wdelta-reverse-collapse,wdelta-way-forward}.md`.
- Reference ingest (#141): the "DE Shaw" data was byte-identical to bgmol `AImplicitUnconstrained` (no reference gap). ScoreMD's author pointed out ScoreMD uses **5 beads** `[4,6,8,14,16]` (no Cβ); n=5 arms were wired for parity — the representation that later proved near-planar.
- A 24-run wδ-vs-flat **data-efficiency campaign** hit a wall: "the wδ arm trained cleanly … yet its reverse sampler produced almost no physical frames". Three stacked defects:
  - **A. `exp` clamp granularity.** An *uncommitted* per-sample "de-batch" of the overshoot clamp (#135) was the regression; a no-retraining A/B on one full-budget n=6 checkpoint (LISE job 9473652): batch-max clamp 99.15% (1983/2000) vs de-batch 91.15% (1823/2000) finite, the de-batch "finite" tail "diverging to million-Ångström coordinates"; counted as *physical* frames the split is 99.15% vs 82.5% (sprint-2-obstacles). Sampler-only levers (de-batch, PF-ODE, $t_{\min}$, trust-region subdivision) were "exhausted at ~23.5% finite" on the campaign recipe. Mechanism: the score's g-norm is median-faithful, but "a small-t tail carries g-norms 5–20× the analytic maximum", asking `exp` for steps beyond $R_{\rm MAX}=8$.
  - **B. Conservative head** (PR #166, merged 2026-09-11): the energy was not E(d)-invariant (vertical leakage 0.94 → 0.0001 after fix) and emitted a Euclidean covector that was never raised by $H^\dagger$; gate 3 still failed (~25.9% finite, p99 ≈ 10⁶ Å).
  - **C. Generator coherence** (#168, 2026-09-12/13): proven "on an exact 1-D Euclidean scale coordinate $z$": the reverse used variance rate $\beta$ instead of $c^2\beta$ ($1/c^2$ too much variance); the configured `ou` forward collapsed to a single Euler kick whose mean multiplier goes negative; the DSM label omitted a mean correction $\tfrac12\beta(t)(z_0-z_{\rm ref})$. Fix: the coherent intrinsic-VP forward `drift="vp_ou"`, a `reverse_diffusion_rate(t)` contract, one persisted $x_{\rm ref}$, and a CPU scale oracle.
- The way-forward audit also found **three trust-region defects** in the reverse sampler's subdivision branch (outer time not advanced across substeps; loop-advanced PRNG key dropped; subdivision decided from a realized noise draw that is then discarded — "a non-measure-preserving refinement"), so no `trust_radius>0` run was a clean measurement (archive: way-forward §3 fact 5; fixed 2026-09-16, "Wire vp_ou confining drift and fix trust region").
- Verdict: CNCE gave an objective-side partial win (certified val loss 0.584 vs the $\log 2=0.6931$ null) but the campaign "did not clear the bar". The **way-forward brief** (2026-09-15) states the thesis most clearly (quoted in §5) and notes that at δ=1 the log-det term is **78.3%** of the dilation cost at n=5 and ~0.16% at n=214, and that ~19.52% of five-bead frames come back mirror-reflected after the O(3) alignment.

### 1.5 Sprints 3–6 — decompositions, δ, "wins" against flat, conservative head (2026-09-16 → 09-25)

`archive: sprints/README.md` registry rows; `sprints/sprint3/summary.md`.
- **Sprint 3**: gap decomposition (~85% field shape, ~15% reflection representative; de-confounded ~78% / ~19% / ~3% divergent mass). **δ calibration** δ ∈ {1, 0.1, 0.01} × 4 data sizes × 3 seeds = 36 runs: "δ is not a quality lever at five beads … should not be swept again". LR + drift probe: "the residual gap is field-limited".
- **Sprint 4** (non-conservative n=5 pilot, one seed): after the learned reflection-odd chirality lift, all three wδ arms beat both flat controls (flat_vp_mlp JS 0.256, flat_vp_gt 0.272); best wδ·ou·mlp JS 0.108 (PMF 1.59, FES 4.18, bond 0.018).
- **Sprint 5** (18 arms × 3 seeds): wδ·ou·mlp **0.103 ± 0.009** at ep1000; full-parity relaunch **0.100 ± 0.006** (ep5000) / 0.119 ± 0.012 (ep10000) vs flat 0.263/0.268. "Matching ScoreMD's full budget … does NOT open the rare left-handed-α pocket."
- **Sprint 6**: conservative-head repair "refuted twice" (support-mismatch premise; magnitude smoothing made the sampler collapse harder: lifted JS 0.97, finite 0.03 vs reference 0.75/0.44). α_L was reachable for conservative-flat at sampling parity (N=100k, 1000 steps).
- **Reflection** (2026-09-25, #214): "the $w^\delta$ metric under a GRW+OU forward beats a flat metric ~2.7× (JS 0.180 vs 0.479 on aldp)". These flat comparators were later shown to be defective (§1.7).

### 1.6 Sprint 7 — the reverse-walk wall, the scale split and the phantom bead (2026-09-25 → 09-30)

`archive: sprints/sprint7/summary.md`; `docs/investigations/phantom-bead-virtual-cbeta-236.md`.
- O(3)-equivariant backbones (e3nn, GATr) trained fine, but sampling at parity hit "`exp received a non-finite tangent g-norm (degenerate metric)`": e3nn 0.1% finite (2/2000). The #222 diagnostic showed the reverse walk enters the degenerate band "**even in the `zero` regime — with no score field at all**" (zero-score reversal is anti-confining; theory/06).
- **#229/#232** (2026-09-27/28): the fixed-step Verlet with length-only step count under-resolves a "stiff-but-well-posed" direction; independent adaptive x64 solvers recover the exact scale advance; $\lambda_{\min}(P_hHP_h)\approx6.5\times10^{-4}\gg\eta=10^{-6}$ (232-strategies Q4). Fixes merged 2026-09-28: **#234** float64 + diffrax adaptive `exp`; **#235** closed-form **scale/shape split** (advance $z$ exactly, integrate only the shape remainder). Also levers #223 (cold-barycentre prior + arc cap), #225 (eigenvalue floor), #224 (consistent VP, $D=c^2\beta$).
- Result: "finiteness is solved robustly" ($\approx1.0$) but "the distribution is wrong": pooled 80k MLP samples JS 0.325, **α_L 25.2% vs reference 0.60%** (≈42×). Cost per sample (A100, cold N=3): flat 0.74 s warm; exp-split ≈253 s (≈340× flat); x64 ≈445 s (≈600×); an x64 draw of 2,000 samples ran ~8 h without finishing.
- **"The wall is an n=5 artifact"**: over 800k reference frames, min $\lambda_{\min}(G_X)$ = 0.10 at n=6 vs 1.6×10⁻⁴ at n=5; frames below 10⁻²: 0.0000% vs 0.0126%; worst horizontal condition 4.2×10³ vs 1.55×10⁶ (≈370×). Two causes: (i) equilibrium near-planarity at n=5 only; (ii) a representation-independent forward-prior collapse (#224).
- **Phantom bead** (#236/#240 on 09-29; dataset `aldp5v`, PR #250 merged 09-30): append $x_v=C_\alpha+1.5\,\text{Å}\,\hat n$, $\hat n\propto(N-C_\alpha)\times(C-C_\alpha)$. An isotropic Tikhonov floor $G+\varepsilon I$ "cannot lift the soft bending eigenvalues, because those directions satisfy $Bv=0$". Bakeoff: finite 1.0 everywhere; `ou` best JS 0.176 (ep5000 → 0.227 at ep10000) but α_L 0.25×/0.58× reference; `vpou` JS 0.210 → 0.199 with α_L 4.58× → 5.5×; `ou` sampling ≈1.8× costlier. "The forward schedule, not the representation, is what moves the rare basin."

### 1.7 Sprint 8 — n=6 reproduction, TF32, and the flat baseline (2026-09-29 → 10-02)

`archive: sprints/sprint8/{summary,headtohead,issue252-tf32-precompute}.md`.
- **aldp6_repro** (real n=6, dense pools): A wδ·ou·GT **0.1664** (α_L 4.958%), B wδ·vp_ou·GT 0.2201 (α_L 7.835%), C flat·ou·GT **0.2405** (α_L 0.184%), D Sprint-1 replay 0.2762; floor 0.0114. D's non-reproduction was root-caused (#252) to "GPU-default TF32 matmul corrupting the wδ GRW forward-noise precompute"; regenerated at full mantissa it gave ≈0.09–0.10.
- **Flat head-to-head** (2026-10-01): ScoreMD-native flat **0.0151** (floor 0.0114) vs our flat arms 0.2846 / 0.2618 — "the gap is the framework, not a knob". **#259/#263 (merged 2026-10-02)**: the `vp_mean` DSM target was built toward $x_0$ instead of $a(t)x_0$; fixing it "cut φ/ψ-JS 0.26→0.10 (~2.6×)" (N=2000). The flat arms that wδ "beat" in Sprints 4–5 (0.256–0.272) were this defective baseline. (Sprint 1's flat WG config also had `vp_mean: true` — `git:ae3bb0a67:configs/replicates/flat_wg_dsm_seed0.yaml` — so it was plausibly affected too; **inference, not measured**.)

### 1.8 Sprint 9 — M1 benchmark and numerical qualification (2026-10-02 → 10-22)

`docs/sprints/sprint9/*`; archive `sprints/sprint9/*`; `docs/investigations/{ism-covector-repair-355,prior-intrinsic-reversibility-356,scale-calibrated-dsm-357,aldp5-target-calibration-154,aldp5-construction-section,aldp5-section-generator}.md`.
- M1 = "superior non-conservative iid generation on ALDP5, five physical beads"; wδ uses `aldp5v` (5 physical + 1 virtual; free 12-D model state vs 9-D section).
- Contract repairs, each with exact controls: #154 (2026-10-07) DSM label is a surrogate; ideal VP scale bias $(z_0-z_{\rm ref})/(c^2(1+a(t)))$. #355 (merged 2026-10-09, PR #376) covector ISM omitted $-Dg[\epsilon]c(0)$ (warped-line divergence sign was wrong). #356 removed the `exact_jacobian` Metropolis rule (it changed the target). #357 (PR #373) opt-in scale-calibrated DSM.
- Constrained-section designs (2026-10-07): the fixed-length virtual bead is not scale covariant and the image is not closed (finite-length path to defining-triple collinearity); a homogeneous section $x_v=x_2+\kappa(a\times b)/\sqrt{\|a\|^2+\|b\|^2}$ restores both, but its induced conditioning was worse than fixed length on every sampled row.
- Mixture prior (#270, 2026-10-05): cold wδ priors put 11–12% in the α_L box vs 0.0060 reference; generated α_L 0.036 (arm3, ≈6× over) vs 0.001/0.0015 (under).
- Corrected forward stationarity study (2026-10-17): all 1,216 trajectories; supports "late finite-kernel relaxation", not the joint stationary law.
- #474: 960 generation paths, 942 completed, 18 hit the 1,024-step inner cap; "Generated bond distributions remain much broader than the target" (mean bond W1 0.239–0.558 Å vs a matched-count floor ~0.0051–0.0052 Å). Finer outer reverse grids did not consistently help.
- Numerical assessments (#265/#289/#361; `metric-numerics-scaling-assessment.md`, 2026-10-18/19): "no single unresolved precision bug"; first-order Verlet; amplification over paths; 100-digit arithmetic failed to complete a difficult saved deformation; a GPU stress batch completed 3/4 deformations at up to 12,000 trials (20.66 min).
- **Closeout (2026-10-22)**: "a documented blocked/inconclusive comparison"; no matched-cost winner; M1 not complete.

### 1.9 Sprint 10 — metric qualification (#520, 2026-10-19 → 10-22)

`docs/sprints/sprint10/closeout-520.md`; `docs/investigations/{metric-qualification-513,wdelta-qualification-522,planarity-compatible-metric,aldp-reference-metric-evaluation}.md`.
- #513 (2026-10-19, authenticated bgmol ALDP, 1,000,000 × 22 × 3 coordinates verified): "**neither curved metric beats Cartesian interpolation on average trajectory RMSD**" (ALDP5 18 points: Cartesian 0.22398 Å vs wδ 0.24721 Å), but wδ preserves local distances better (0.05168 vs 0.03244 Å). Original wδ is undefined at exact planes; among 63 positive-thickness flattened states, 24 (float32) and 9 (float64) lose numerical positive definiteness.
- #522 verdict: "retain original wδ as a geometric reference and a restricted-domain candidate … Rule it out as an unchanged metric for a physical state space that must include noncollinear planar configurations. Its planar exclusion is mathematical, not just a solver defect."
- #523: a localized planar-compatible metric (δ=1, τ=.01, η=.1) is smooth and positive at noncollinear planes, keeps the exact scale product, and improved conditioning on all 2,048 source frames.
- **Closeout**: "keep **flat geometry as the default and required comparator**"; "treat the original physical-bead wδ metric as a restricted-domain reference, not as a suitable default for near-planar molecules"; phantom bead retained "for compatibility with the existing ALDP5 benchmark, not as evidence that wδ is physically optimal". Methodological correction: "Change one of those [metric, forward noising, reference distribution, force target, learning objective] at a time".

### 1.10 Epilogue and bridge to Era 2 (2026-10-23 → November)

- 2026-10-23: cleanup; archive tag `archive/pre-cleanup-2026-10-23`. `README.md` "How we got here" item 1: "Noising with the metric tensor directly on configuration space needs a geodesic differential equation for every noising step. This brought numerical, sensitivity and cost problems, and near-planar molecules approach the metric's rank barrier. The result was negative as a method and positive as architecture".
- 2026-10-23 `docs/theory/20-thermal-metric-foundations.md` reframes the question ("What should a metric do so that a score-based model learns such molecules easily?"). Its residual-stiffness table (§5.3, ALDP5, 9 internal directions, β/C7eq | αR | αL): flat 192/112/97; **wδ δ=1: 413/315/631; δ=0.1: 58/37/76**; planar-compatible wδ 230/181/359; spring-force metric 9.6/7.6/13.4. On this criterion wδ (δ=1) is *worse* than flat.
- Sprint 11 notes 22–23: "the spring-force and $w^\delta$ metrics are exact pullbacks of flat feature spaces of higher dimension, at the cost of projecting back onto valid molecules" (`docs/status.md`).
- Sprint 12 (2026-11-09/10, feature-space recipe, no geodesic integration): wδ on ALDP5 (with virtual bead) bond error 0.000434 Å vs Cartesian 0.004558 Å (48,000 updates, one seed), cost comparable to Cartesian (318 vs 259 s to checkpoint); BBA bond 0.113 vs Cartesian 0.415 (internal coordinates 0.000274) (`docs/sprints/sprint12/matched-results.md`; `physical-wdelta.md`).

---

## 2. Core mathematics

Notation (`docs/theory/README.md`): $X\in\mathbb R^{n\times d}$ rows are labelled points; $X_c$ centered; $G_X=X_c^\top X_c$ (a sum, not divided by $n$); $\delta>0$ (code name `alpha`); $\varphi=\log\det G_X$; $k=dn-d(d+1)/2$; $m=n(n-1)/2$.

**M0. Why the Euclidean metric on $\mathbb R^{3N}$ is arbitrary — the arguments as the sources make them.**
1. *Representatives, not shapes.* "A manifold point is a **labelled shape**, not one particular placement of its atoms" (00). Six rigid directions change only pose; any ambient metric that charges them is measuring the gauge. Centering removes translation globally; rotation can only be fixed by alignment, which "is a gauge choice": Kabsch minimizers can jump when the cross-covariance loses rank, and for $n\ge5$ no continuous global orientation choice exists (00 §topology). ScoreMD-style Euclidean diffusion "handles rotation by augmentation" (Related_Work §E); the quotient makes invariance exact by construction.
2. *Units and scale.* Euclidean costs scale with the length unit; wδ features are logarithms, so "changing units adds constants to features and leaves feature differences and the ideal metric unchanged" (theory README). The same 0.1 Å displacement is a 6.7% change of a bond but a 2% change of a 5 Å contact (E5).
3. *Relative deformation / stiffness.* wδ charges "relative deformation" ("moving a short pairwise distance by a fixed percentage has the same feature cost as moving a long distance by that percentage", 01). (The later quantitative stiffness picture — "bond lengths fluctuate by about 0.03 Å, torsional motion by about 0.5 Å", stiff-to-soft variance ratio 100–200 within a basin and ~900 across ALDP5 data — is Era 2, theory/20 §0.)
4. *Boundaries at the wrong distance.* A collision or a flat cloud is a finite Euclidean step away but infinitely far under wδ (M7, E1/V3).
5. *Even the "horizontal" lift is a choice.* The quotient metric's ambient form is degenerate, so the code needs the Euclidean complement as an extra gauge (M2).
The sources are equally careful about the limits: wδ "is not a molecular potential and does not exclude every implausible conformation" (01), and its geometric energy "is a proxy deformation cost" (522).

**M1. Regular domain and quotient** (`theory/00-manifold.md`). $\mathcal P_*=\{X:\ x_i\ne x_j,\ \operatorname{rank}X_c=d\}$; action $(O,t)\cdot X=XO^\top+\mathbf 1t^\top$, $O\in O(d)$. Free and proper ⇒ $\mathcal M=\mathcal P_*/E(d)$ smooth, $\dim\mathcal M=dn-d-\tfrac{d(d-1)}2$ (=3n−6 in 3D). Intuition: a point is a labelled shape including size; coordinates are representatives. Both conditions matter: "a planar cloud in three dimensions can have no collisions, yet its gyration determinant is zero". Dataset dimensions: aldp5 9, aldp 12, chignolin 24, BBA 78 (`theory/background/12-proteins-as-point-clouds.md`).

**M2. Vertical/horizontal.** $\mathcal V_X=\{X_c\Omega+\mathbf 1t^\top:\Omega^\top=-\Omega\}$; the code's horizontal space is the Euclidean complement $\mathcal H_X=\{V:\mathbf 1^\top V=0,\ X_c^\top V=V^\top X_c\}$. Because $\ker H_X=\mathcal V_X$, the degenerate form "does **not** select a horizontal space". Projector $P_v=R_X(R_X^\top R_X)^{-1}R_X^\top$, $P_h=I-P_v$ (implemented with a ridge). Alignment (Kabsch over $O(d)$) is a gauge choice; Procrustes distance $\min_O\|X_c-Y_cO\|_F$ is continuous even when the minimizer jumps.

**M3. Topology facts** (00). For $d=3,n\ge5$ no continuous global section of the $O(3)$ bundle exists (connected total space, disconnected fiber); for $n=4$ the positive square root of the Gram matrix is a global section. The regular base is *not* claimed simply connected (its SO(3) quotient is a nontrivial double cover of the O(3) quotient).

**M4. Features, separation, intrinsic distance** (`theory/01-metric.md`).
$$F(X)=\big((\log r_{ij})_{i<j},\ \sqrt\delta\,\varphi(X)\big),\qquad w^\delta(X,Y)^2=\sum_{i<j}\Big(\log\tfrac{r_{ij}(X)}{r_{ij}(Y)}\Big)^2+\delta\Big(\log\tfrac{\det G_X}{\det G_Y}\Big)^2 .$$
$w^\delta$ is a feature *chord* (`s_distance`), not the intrinsic distance $d_g$; $w^\delta\le d_g\le L_g(\gamma)$. Unit changes add constants to each feature and cancel. $w^\delta(X,RX)=0$ for a whole-cloud reflection.

**M5. Pullback metric, explicit matrix.** $g_X(V,W)=\langle J_XV,J_XW\rangle$, $H_X=J_X^\top J_X$, with
$$\|V\|_g^2=\sum_{i<j}\frac{((x_i-x_j)\cdot(v_i-v_j))^2}{r_{ij}^4}+\delta\,(d\varphi_X[V])^2,\qquad d\varphi_X[V]=2\sum_i(G_X^{-1}x_{c,i})\cdot v_i,$$
$H=A+\delta B$, $A_{ij}=-\frac{(x_i-x_j)(x_i-x_j)^\top}{r_{ij}^4}$ ($i\ne j$), $A_{ii}=-\sum_{j\ne i}A_{ij}$, $B_{ij}=4y_iy_j^\top$, $y_i=G_X^{-1}x_{c,i}$; **$B$ has rank one**. $\ker H_X=\mathcal V_X$, $H|_{\mathcal H}>0$ (infinitesimal rigidity of the complete distance framework). Also $g_X=\operatorname{Hess}_Y[\tfrac12w^\delta(X,Y)^2]|_{Y=X}$. Tensor-to-matrix contract: $H_{id+a,\,jd+b}=(A+\delta B)_{ij,ab}$ (`theory/07`). Checks: $H=DF^\top DF$; $HV=0$ for rigid generators built from the group action; $v^\top Hv=\|DF[v]\|^2$. (Derived here: on a random 5-point cloud my finite-difference $J^\top J$ matches the analytic $H$ to 5.6e-10; correct assembly gives rigid residual 1.3e-14, the historical swap gives 5.97 and min eigenvalue −7.24.)

**M6. Chord vs geodesic.** $L_g(\gamma)=L_E(F\circ\gamma)$; for a unit-speed geodesic $w^\delta(x,\operatorname{Exp}_x(ru))^2=r^2-\tfrac1{12}\|\mathrm{II}_x(u,u)\|^2r^4+O(r^5)$ (II = second fundamental form of the embedding).

**M7. Infinite-distance boundaries and completeness.** $|d\varphi_X[V]|\le\|V\|_g/\sqrt\delta$, $|d\log r_{ij}[V]|\le\|V\|_g$, hence $|\varphi(Y)-\varphi(X)|\le d_g(X,Y)/\sqrt\delta$ and $|\log(r_{ij}(Y)/r_{ij}(X))|\le d_g$. Collisions, rank loss and unbounded separation need infinite length. Exact geodesics satisfy $\|F(\operatorname{Exp}_XV)-F(X)\|\le\|V\|_g$ at every length, beyond the cut locus too. Properness of $F$ ⇒ complete metric ⇒ Hopf–Rinow geodesic completeness (not stochastic completeness). 522: $L_g(\gamma)\ge\sqrt\delta\,|\log\det G_{\rm end}-\log\det G_{\rm start}|$ so a noncolliding plane is infinitely far for every fixed δ>0; δ=0 removes the barrier but leaves unobserved out-of-plane bending.

**M8. Scale–shape cylinder** (`theory/16-scale-shape-cylinder.md`, `01` §scale). With $a=(1,\dots,1,2d\sqrt\delta)$, $C=\|a\|^2=m+4d^2\delta$: $F(e^\ell X)=F(X)+\ell a$, so the image is a Euclidean cylinder and
$$z(X)=\frac{\sum_{i<j}\log r_{ij}+2d\delta\varphi}{\sqrt C},\quad \operatorname{grad}_gz=\frac{X_c}{\sqrt C},\ \|\operatorname{grad}_gz\|_g=1,\ \operatorname{Hess}_gz=0,\ \Delta_gz=0,\quad g=dz^2+g_{\rm shape}$$
— a Riemannian *product* (warping ≡ 1), via de Rham splitting. Consequences: $d_g([X],[cX])=\sqrt C|\log c|$; $z(\operatorname{Exp}_XV)-z(X)=dz_X[V]$ (closed-form scale advance); $H_{cX}=c^{-2}H_X$. Constants: n=5: C=46; n=6: 51; n=10: 81; n=28: 414. Dilation self-cost $g_X(X_c,X_c)=n(n-1)/2+36\delta$ (522). The potential splits too: $U=\tfrac12w^\delta(x,x_{\rm ref})^2=\tfrac12(z-z_{\rm ref})^2+U_{\rm shape}$ with $dz[s_{\log}(x,x_{\rm ref})]=z_{\rm ref}-z$ exactly.

**M9. Thin clouds** (01 §thin clouds). For $X_\varepsilon=(Y,\varepsilon h)$: the determinant-sensitive eigenvalue ~$\varepsilon^{-2}$; for $n\ge5$ generically $n-4$ soft bending directions ~$\varepsilon^2$; horizontal condition ~$\varepsilon^{-4}$ ($n=4$ has no such soft directions). "Motion around a narrow cross-section of an infinitely long end, not a finite-length shortcut." Correction (2026-10-19): the dominant Cartesian eigenvector is generally *not* the scale tangent.

**M10. Log surrogates** (`theory/02-log-exp-maps.md`). $U_y(x)=\tfrac12w^\delta(x,y)^2$; `s_prelog`$=-\nabla^E_xU_y$ (a covector),
$$\texttt{s\_prelog}_i(X,Y)=-\sum_{j\ne i}\log\frac{r_{ij}(X)}{r_{ij}(Y)}\frac{x_i-x_j}{r_{ij}(X)^2}-2\delta\log\frac{\det G_X}{\det G_Y}y^X_i,$$
`s_log`$=H^\dagger\,$`s_prelog`$=-\operatorname{grad}_gU_y$ (flat limit $y-x$, so a Gaussian's restoring score is $+s_{\log}/\sigma^2$). True log: $\operatorname{Log}_x(y)=-\operatorname{grad}_x[\tfrac12d_g^2]$ off the cut locus. Local: $s_{\log}(x,\operatorname{Exp}_xv)=v+O(\|v\|^3)$; global: $\|s_{\log}(x,y)\|_g=\|P_T(F(y)-F(x))\|\le w^\delta(x,y)$.

**M11. The numerical exponential.** `exp(x,v)`≈$\operatorname{Exp}_x(2v)$ (pass $V/2$). Geodesic equation in centered coordinates: $H(q)\ddot q=\tfrac12\nabla_q(\dot q^\top H\dot q)-(dH_q[\dot q])\dot q$; implemented $\ddot q_\eta=P_h(P_hHP_h+\eta I)^{-1}P_hf$, $\eta=10^{-6}$ (relative change $\eta/(\lambda+\eta)$). Step count $S=\operatorname{clip}(\lceil8r^2\rceil,8,1024)$, $r=2\max\|v\|_g$ over the batch; batch-wide rescale if $r>$ `_EXP_R_MAX`=8. "Step selection is not error control." First-order defect (`metric-numerics-scaling-assessment.md`): one kick-drift-kick step produces velocity coefficient $h^2a_va/4$ where the ODE needs $h^2a_va/2$. Scale split: $dz_{\rm target}=2\langle v,u\rangle_g$, $v_{\rm shape}=v-\langle v,\hat u\rangle_g\hat u$, integrate $v_{\rm shape}$, then dilate by $\ell=[(z(x)+dz_{\rm target})-z(q_{\rm shape})]/\sqrt C$.

**M12. Brownian motion, GRW, metric-white noise** (`theory/03`, `04`). Generator $\mathcal L_th=dh[f_t]+\tfrac{D(t)}2\Delta_gh$. GRW step $V=f_th+\sqrt{D h}\sum_jZ_jE_j$, $X'=\operatorname{Exp}_x(V)$; covariant Taylor: $\mathbb E[\psi(X')]=\psi+h\,d\psi[f]+\tfrac{Dh}2\sum_j\operatorname{Hess}\psi(E_j,E_j)+o(h)$. Frame $E=Q_h\Lambda_h^{-1/2}$: $E^\top HE=I_k$, $EE^\top=H^\dagger$, $\mathbb E\|EZ\|_g^2=k$; projected Cartesian noise has covariance $P_h$ instead (different leading generator). Itô chart: $dY^a=(f^a-\tfrac D2g^{bc}\Gamma^a_{bc})dt+\sqrt D e^a_jdW^j$; an arbitrary orthonormal Stratonovich frame needs the drift $-\tfrac D2\sum_j\nabla_{E_j}E_j$. Fokker–Planck: $\partial_tp=-\operatorname{div}_g(fp)+\tfrac D2\Delta_gp$; log-density: $\partial_t\ell=-\operatorname{div}f-g(f,s)+\tfrac D2(\operatorname{div}s+\|s\|^2)$. Determinant observable: $\frac{d[\varphi]_{\rm mart}}{dt}\le D/\delta$.

**M13. Wrapped Gaussian vs heat kernel.** $q_{\rm wrap}(y|x_0)=(2\pi\sigma^2)^{-k/2}e^{-d_g^2/2\sigma^2}J^{-1}$ (branch), $p^{\rm heat}_t=(2\pi t)^{-k/2}e^{-d_g^2/2t}J^{-1/2}(1+ta_1+O(t^2))$, $a_1(x,x)=\mathrm{Scal}/12$, $J(v)=1-\tfrac16\mathrm{Ric}(v,v)+O(\|v\|^3)$. Gauss's lemma: leading score $+\operatorname{Log}_y(x_0)/\sigma^2$. The positive-time heat kernel score is smooth across the cut locus; only single-geodesic short-time formulas fail.

**M14. Forward modes** (`theory/11`). $B(t)=\int\beta$, $a(t)=e^{-B/2}$, $\sigma^2=1-e^{-B}$, $c^2=R_{\rm scale}^2/k$, $\sigma_{\rm eff}=c\sigma$, $\beta(t)=0.1+19.9t$. Wrapped Gaussian: $V=\sigma_{\rm eff}EZ$. Rho-budget GRW: $T=\operatorname{clip}(\lceil4\rho^2/r_{\rm cap}^2\rceil,1,T_{\max})$, $s_{\rm step}=\rho/\sqrt{kT}$, `ou` drift $\tfrac{\gamma\beta(t)}2s_{\rm step}^2\,s_{\log}(x,x_{\rm ref})$ with $\beta(t)$ frozen at the endpoint. `vp_ou`: $V=(1-e^{-\Delta u/2})s_{\log}(x,x_{\rm ref})+c\sqrt{1-e^{-\Delta u}}EZ$, $\Delta u=B(t)/T$, targeting $\mathcal L_tu=-\tfrac{\beta}2g(\operatorname{grad}U,\operatorname{grad}u)+\tfrac{c^2\beta}2\Delta_gu$; exact on $z$, approximate on shape.

**M15. Exact scale-coordinate consistency test** (03). Rho-budget `ou`, $T=1,\gamma=1$: $z_t-z_{\rm ref}=A(t)(z_0-z_{\rm ref})+\sqrt{\tau}\epsilon$, $A(t)=1-\tfrac12\beta(t)\tau(t)$, $\tau=c^2(1-e^{-B})$. Label scale component $(z_0-z_t)/\tau$ vs true conditional score $(z_{\rm ref}+A(z_0-z_{\rm ref})-z_t)/\tau$; difference $\tfrac12\beta(t)(z_0-z_{\rm ref})$. VP-OU scale law (357): $z_t|z_0\sim N(z_r+a(z_0-z_r),v)$, $v=c^2[-\mathrm{expm1}(-B)]$, mean-correction coefficient $(a-1)/v=-1/(c^2(1+a))\to-1/(2c^2)$ as $t\to0$.

**M16. Score matching.** DSM identity $\mathbb E[\operatorname{grad}\log q_t(X_t|X_0)|X_t=x]=\operatorname{grad}\log p_t(x)$; shipped label $Y=s_{\log}(x_t,x_0)/\sigma_{\rm eff}^2$ is "a separation-gradient surrogate". ISM: $\mathbb E[\tfrac12\|s\|^2+\operatorname{div}s]=\tfrac12\mathbb E\|s-\nabla\log p\|^2-\tfrac12\mathbb E\|\nabla\log p\|^2$ — "correct magnitude as well as direction". Covector ISM (355): $a=g^{-1}c$ ⇒ $Da(0)[\epsilon]=Dc(0)[\epsilon]-Dg(0)[\epsilon]c(0)$; divergence $\operatorname{div}_ga(0)=\operatorname{tr}Da(0)+a(0)^\top\Gamma$, $\Gamma_a=\tfrac12\partial_a\log\det g(0)$. Feature-DSM identity $\|{-H^\dagger J^\top a}\|_g^2=\|U^\top a\|^2$. CNCE optimum $E_\theta=-\log p_t+C(t)$ for volume-reversible proposals.

**M17. Reverse dynamics** (`theory/06`). $b_{\rm rev}=-f_t+D(t)s_t$; PF-ODE $b_{\rm PF}=-f_t+\tfrac D2s_t$ ("dropping noise while keeping the full reverse-SDE score coefficient is not the probability-flow ODE"). For $f=-a\operatorname{grad}U$, zero-score reversal climbs the well: on the scale factor $dz=a_t(z-z_{\rm ref})ds+\sqrt D\,dW_s$ (linear anti-confinement).

**M18. Gibbs priors** (`theory/13`, algorithm note). $\pi\propto e^{-\kappa U}$ w.r.t. $dV_g$, $\kappa=2a/D$: rho-budget `ou` gives $\kappa=\gamma\beta(t)$; `vp_ou` gives $\kappa=1/c^2=k/R^2$. $z$-marginal $N(z_{\rm ref},1/\kappa)$. Mixture: $U_{\rm mix}=-\tfrac1\kappa\log\sum_j\pi_je^{-\frac\kappa2w^\delta(x,c_j)^2}$, gradient a softmax-weighted blend of $s_{\log}(x,c_j)$; implemented density $\pi_{\rm code}\propto(\sum_j\pi_je^{-w^2/2})^\kappa$. **Reversibility of the exact isotropic geodesic proposal**: $d\mu=dV_g\,N_g(v;0,s^2I)\,dv_g$ is preserved by geodesic flow (Liouville, $p=gv$); $T=R\Phi_1$ is a measure-preserving involution ⇒ $dV_g(x)K(x,dy)=dV_g(y)K(y,dx)$, no Hastings/Jacobian correction, no minimizing log needed.

**M19. Graph Laplacian estimator** (`theory/09`). $K_{ij}=e^{-w^\delta(x_i,x_j)^2/2\varepsilon}$, α-normalization, $L_\varepsilon=\tfrac2\varepsilon(P-I)$, limit $\Delta_gf+2(1-\alpha_{\rm CL})g(\operatorname{grad}\log q,\operatorname{grad}f)$.

**M20. Reflections** (way-forward §5; chirality review). $(\varphi,\psi)(Rx)=(-\varphi,-\psi)(x)$; conditional lift $\Pr(x\,|\,[x])=p_0(x)/(p_0(x)+p_0(Rx))$ — sample, don't argmax. O(3)-equivariant polar fields vanish normal to a plane; "a reflection-symmetric metric **can** support a reflection-asymmetric density".

**M21. Virtual bead geometry** (numerics assessment; 236; construction/section notes). Augmented separation keeps all physical pair terms, adds $n$ pair terms $\log(s_i(X)/s_i(Y))$ and **replaces** the determinant term; $G_{L(X)}=G_X+\tfrac n{n+1}p\,p^\top$. Induced metric of a deterministic lift $h=DL^\top H_{n+1}DL$; the free virtual bead adds 3 noised directions (9 vs 12). Fixed-length lift: $C_L(sx)\ne sC_L(x)$; centered dilation-tangent mismatch norm $L\sqrt{5/6}$. Homogeneous section: $x_v=x_2+\kappa c/s$, $c=a\times b$, $s=\sqrt{\|a\|^2+\|b\|^2}$, radius $\kappa\|c\|/s$; exact scale with $C=15+36\delta$ but process dimension 9.

**M22. Planar-compatible metric** (`planarity-compatible-metric.md`). On SE(3) (mirrors kept): $S=\operatorname{tr}G$, $e_2$ second elementary symmetric polynomial, $D_\tau=\det G+\tau Se_2(G)$, $F_\tau=((\log r_{ij}),\sqrt\delta\log D_\tau)$, localized amplitude $a=\tau Se_2/D_\tau\in[\tfrac{9\tau}{1+9\tau},1]$ (Cauchy–Schwarz: $\det G/(Se_2)\le1/9$), metric
$$\widetilde g(V,V)=\sum_{i<j}(d\log r_{ij}[V])^2+\delta(d\log D_\tau[V])^2+\eta m\Big(\tfrac{a^2}{S}\|V_{\rm shape}\|^2+(da[V])^2\Big),$$
scale product kept with $C=m+36\delta$, $z=(\sum\log r_{ij}+6\delta\log D_\tau)/\sqrt C$. Transition-region bound: $\liminf_{\tau\downarrow0}\tau\,\kappa(g_{X_{\sqrt\tau}})\ge1+\tfrac{4\delta}{\eta m}$.

**M23. Size dependence of corruption** (numerics assessment). Coherent VP law with amplitude $R\sqrt{\beta/k}$ gives stationary $z$-variance $R^2/k$ and log-dilation s.d. $R/\sqrt{kC}$; relative size noise shrinks ≈ $n^{-3/2}$.

---

## 3. Worked analytical examples

**E1. The flattening five-point family** (01, numerics assessment, planarity note). $X_e=((1,0,e),(-1,0,e),(0,1,-e),(0,-1,-e),(0,0,0))$: centered, $G=\operatorname{diag}(2,2,4e^2)$, $\det G=16e^2$, $S=4(1+e^2)$, $e_2=4+16e^2$. Pair distances stay bounded ($r_{12}=r_{34}=2$, $r_{13}=\sqrt{2+4e^2}$, $r_{i5}=\sqrt{1+e^2}$). **(Derived here, δ=1)** horizontal spectrum of $H$:

| e | λ_min,h | λ_max,h | cond_h | det G |
|---|---:|---:|---:|---:|
| 0.5 | 2.3454e-01 | 9.8840e+00 | 4.214e+01 | 4.0 |
| 0.2 | 5.9656e-02 | 2.9872e+01 | 5.007e+02 | 0.64 |
| 0.1 | 1.6197e-02 | 1.0426e+02 | 6.437e+03 | 0.16 |
| 0.05 | 4.1368e-03 | 4.0407e+02 | 9.768e+04 | 0.04 |
| 0.02 | 6.6590e-04 | 2.5040e+03 | 3.760e+06 | 6.4e-3 |
| 0.01 | 1.6662e-04 | 1.0004e+04 | 6.004e+07 | 1.6e-3 |

λ_min ∝ e², λ_max ∝ e⁻², cond ∝ e⁻⁴ exactly as M9 predicts. **(Derived here)** "Odometer": from $e_0=0.5$, Euclidean $\|X_e-X_{e_0}\|_F=2(e_0-e)\to1$ while $w^\delta(X_e,X_{e_0})\approx2\log(e_0/e)$: e=0.1 → 3.2489, 0.01 → 7.8377, 0.001 → 12.4378, 10⁻⁴ → 17.0407 (pair part saturates at 0.4628). A generic random 5-point cloud flattened along its smallest axis: cond 1.161e2 (ε=1) → 7.505e2 (0.3) → 1.750e4 (0.1) → 2.029e6 (0.03) → 1.635e8 (0.01) (derived here).

**E2. Scale is not the dominant eigenvector** (numerics assessment "Correction"). Same family: $\langle X,y\rangle=3$, $\|X\|\to2$, $\|y\|\sim1/(2e)$, so the cosine between dilation $X$ and the determinant direction $y$ tends to 0 (≈3e, derived here).

**E3. Exact scale OU test** (03; registry #168). n=5, k=9, $R_{\rm scale}=1$, $r_{\rm cap}=4$ ⇒ T=1; $\beta=0.1+19.9t$. $A(1)\approx-0.11106$ vs VP $a(1)\approx0.00657$. **(Derived here)** $A(t)$/$a(t)$: t=0.10: +0.9880/0.9467; 0.37: +0.6877/0.4968; 0.55: +0.4150/0.2160; 0.73: +0.1912/0.0680; 0.91: −0.0114/0.0155; 1.00: −0.1111/0.0066 — the one-kick multiplier crosses zero near t≈0.9, which no OU transition can do. Label/true-score difference $\tfrac12\beta(t)(z_0-z_{\rm ref})$.

**E4. Scale constants and δ share** (01, 16, way-forward §3 fact 7). C = 46 / 51 / 81 / 414 for n = 5/6/10/28; log-det share of dilation cost $36\delta/(m+36\delta)$ = 78.3% (n=5), 70.6% (n=6), 44.4% (n=10), 8.7% (n=28), 0.16% (n=214) (n=6/10/28 values derived here; 78.3% and ~0.16% are quoted in the source). Dilation by c=1.1: $\sqrt{46}\log1.1=0.6464$ (n=5) vs $\sqrt{51}\log1.1=0.6807$ (n=6) (derived; checked $w(X,1.1X)$ numerically). Log-size s.d. at R=1: ALDP5v 0.0404, chignolin 0.0227, BBA 0.00556; at historical budgets 1/3.7/8.7: 0.0404/0.0839/0.0484.

**E5. Relative deformation toy (derived here).** Cost of +0.1 Å on a pair of length r, $(\log((r+0.1)/r))^2$: r=1.5 Å: 0.004165; 3.8 Å: 0.000675; 5 Å: 0.000392; 10 Å: 0.000099. Unit change Å→nm leaves $w^\delta$ identical (0.222685 both).

**E6. Virtual-bead lift on the flattening family** (numerics assessment). Global lift $x_v=\text{centroid}+R_g v_{\min}$, $R_g^2=4(1+e^2)/5$: $\det G_{L(X_e)}=\tfrac83+\tfrac{56}3e^2\to\tfrac83>0$ — the augmented cloud stays full-rank, so "infinite distance to rank loss is preserved for the full augmented cloud, not for the physical subcloud". Uniform dilation: $w_5(X,cX)=\sqrt{46}|\log c|$ vs $w_6(L(X),L(cX))=\sqrt{51}|\log c|$.

**E7. Fixed-length section boundary** (`aldp5-construction-section.md`). $x(\epsilon)=((-1,-1,0),(1,0,0),(0,0,0),(2,\epsilon,0),(3,1,0))$: normal stays (0,0,1), virtual bead stays (0,0,L), metric speed bounded, yet the defining triple becomes collinear at finite length — the image is not closed. In the homogeneous section the radius is $\kappa\epsilon/\sqrt{5+\epsilon^2}$, log-derivative ~$1/\epsilon$ ⇒ infinite distance.

**E8. Planar-compatible metric on the same family** (planarity note). $D_\tau=16h$, $h=e^2+\tau(1+e^2)(1+4e^2)\to16\tau>0$ at e=0; $a=\tau(1+e^2)(1+4e^2)/h$, $a'=2\tau e(4e^4-1)/h^2$. Tangents $U=(1,1,-1,-1,0)$ (z-components) and $V=(1,1,1,1,-4)$: $g(U,U)=\frac{16e^2}{(1+2e^2)^2}+\frac{4e^2}{(1+e^2)^2}+\delta(h'/h)^2+\eta m[\frac{a^2}{(1+e^2)^2}+(a')^2]$, $g(V,V)=\frac{100e^2}{(1+e^2)^2}+\frac{5\eta ma^2}{1+e^2}$. At $e=\sqrt\tau$: Rayleigh quotients $(4\delta+\eta m)/(16\tau)+O(1)$ and $\eta m/16+O(\tau)$ ⇒ $\liminf\tau\kappa\ge1+4\delta/(\eta m)=5$ for δ=1, η=0.1, m=10.

**E9. Warped line — removed Jacobian factor and covector ISM** (13, 356, 355). $r=\sinh u$, $g=\cosh^2u$, $dV_g=dr$, $E=\operatorname{sech}u\,\partial_u$; exact proposal $\operatorname{Exp}_u(sz\operatorname{sech}u)=\operatorname{arsinh}(\sinh u+sz)$ is a symmetric Gaussian walk in r. The removed frame factor preserves $e^{-\beta U}\cosh u\,dV_g$; with $U=\tfrac12\sinh^2u$, β=1, u=0, v=0.7 the flux ratio is $\cosh0.7=1.255169005630943$ instead of 1 — on a flat (zero-curvature) manifold. Covector ISM: constant $du$ raised is $\operatorname{sech}^2u\,\partial_u$ with divergence $-\tanh u\operatorname{sech}^2u$; at u=0.7 baseline code gave **+0.383616155045958**, oracle/repair **−0.383616155045958** (verified numerically here).

**E10. Partial-trace ISM bias** (355). On $N(0,I_2)$ with score $(-\theta_1x_1,-\theta_2x_2)$ and only the second trace term: objective $\tfrac12(\theta_1^2+\theta_2^2)-\theta_2$, minimum (0,1) not (1,1).

**E11. Round sphere**: ISM connection trace identically zero (Sprint 1) — benign toys hide metric-derivative bugs (LESSONS P17).

**E12. Mirror round trip** (way-forward §5, n=1). O(3) alignment reflects 19.52% of real frames; signed JS vs original 0.1774 with zero shape error; data vs its reflection 0.9717; vs 50/50 mixture 0.3012. Probabilistic lift on held-out data (20 replicates): 0.0943 ± 0.0041 → randomly reflected 0.4044 ± 0.0072 → lifted 0.0948 ± 0.0041; α_L box 0.610% vs 0.615%.

**E13. Linear anti-confinement under zero score** (06): $dz=a(z-z_{\rm ref})ds+\sqrt DdW$ — deviations grow like $e^{as}$ but stay finite; the frozen-diffusion equilibrium $p_\infty\propto e^{-(2a/D)U}$ restores confinement only through the score.

**E14. Clean-frame stress probe** (way-forward §6.2, n=1, 256 frames): δ=1, 8 substeps: median scale error/η 0.449, 38.3% frames violate the chord bound by >1%; δ=1, 128: 0.0323, 2.34%; δ=0.01, 8: 0.0690, 9.38%; δ=0.01, 128: 0.00519, 0%.

**E15. Flat vs geodesic noising** (APPROXIMATIONS §C; BBA 64 frames): $w^\delta(x_t^{\rm flat},x_t^{\rm geod})$/σ: t=0.10: 1.56 (4.8×); 0.50: 23.5 (24.5×); 0.90: 38.4 (38.4×).

**E16. Label quality vs radius** (§F, float64 synthetic): chignolin-size k=24 at g-arc r=0.5/1.0/2.0: angle 9.8°/31.3°/35.1°, rel. magnitude error 0.15/0.26/0.27; BBA-size k=78 at r=2.0/4.5/5.75: 8.9°/26.8°/36.1°. `s_prelog` vs `s_log` on BBA pairs: cos 0.81 ± 0.05 (~35°), norm ratio 0.18.

**E17. Size of the outer Euler bias**: "approximately 13.3% [excess scale variance] at terminal time" in the original 64-update Euler process (numerics assessment table).

**E18. Floors silently change the law** (`scale-calibrated-dsm-357.md`, synthetic regular six-cloud, S=8). Uniform dilation of the cloud by 1 / 1000 / 100000 activates 0 / 6 / 12 frame-eigenvalue floors; the scale-noise variance relative to the ideal becomes 1.00000024 / 0.99827468 / 0.00082186 and the corrected scale-score absolute error 9.54e−6 / 5.02771 / 989.56543, while the split `exp` keeps the recomposed scale error small (3.20e−7 / 3.28e−6 / 3.63e−6; unsplit 1.28e−4 / 2.26e−4 / 9.96e−4). Exact theory says $H_{cX}=c^{-2}H_X$ (pure rescaling); an *absolute* floor breaks that symmetry (01: "Absolute numerical floors can break this scale symmetry"). Ridge rule of thumb: $1/\lambda\to1/(\lambda+\eta)$ matters through $\eta/\lambda$ (07).

**E19. Cold-chain mixing** (§I; N=32, β_eff=20; target $\mathbb E[\beta_{\rm eff}d_g^2]=k$): chignolin step 0.05: 24.4 at sweep 200, 25.5 at 600 (equilibrates); BBA step 0.05: 60.7 → 79.1 (target 78, "still climbing"); BBA step 0.10: 1.1 → 8.3, acceptance 0.003 ("frozen"); ~0.5–0.7 s per sweep.

---

## 4. Key empirical results

**4.1 Generation quality (φ/ψ JS unless noted; lower is better)**

| Date / sprint | System, budget | Result | Source |
|---|---|---|---|
| Aug 2026, S1 | ALDP n=6, 800k frames, 50 epochs, 3 seeds, 5k samples, 500 rev. steps | wδ·GRW+OU 0.117±0.007; identity·GRW+OU 0.479±0.005; flat WG 0.167±0.012; identity WG 0.234±0.005; flat GRW 0.403±0.072; wδ WG 0.469±0.016; floor 0.011 | archive sprint1/summary §4 |
| S1 | same, ISM | plain ISM g-norm ~700 (DSM ~15), 1% finite; anchored ISM 92% finite, JS 0.440 | sprint1 §6 |
| Sep, S4 | ALDP5 n=5, 1 seed, 20k dense | best wδ·ou·mlp 0.108; flat_vp_mlp 0.256, flat_vp_gt 0.272 | registry |
| Sep, S5 | 3 seeds | wδ·ou·mlp 0.103±0.009 (ep1000); parity 0.100±0.006 (ep5000) vs flat 0.263/0.268 | registry |
| 09-26..30, S7 | ALDP5, vp_ou, cold prior, split exp | MLP 80k pooled: finite 0.9996, JS 0.325, α_L 25.2% (ref 0.60%); e3nn 0/2000 finite | sprint7 |
| S7 | aldp5v, GT, 1000 steps | ou JS 0.176→0.227 (α_L 0.25×/0.58× ref); vpou 0.210→0.199 (4.58×→5.5×); finite 1.0 | sprint7 |
| 09-30, S8 | real n=6, GT, batch 1024, 10k ep, 52–100k samples | A wδ·ou 0.1664 (α_L 4.958%); B wδ·vp_ou 0.2201 (7.835%); C flat 0.2405 (0.184%); D S1 replay 0.2762 → ≈0.09–0.10 after TF32 fix | sprint8 |
| 10-01/02, S8 | ALDP5 flat parity | ScoreMD-native 0.0151 (floor 0.0114); our flat 0.2846/0.2618; after vp_mean fix 0.1012 (N=2000) | headtohead |
| 10-21, S9 | aldp5v wδ, 3 seeds, 6,400 updates, 128 starts | 942/960 completed; mean bond W1 0.239–0.558 Å vs ~0.0051 floor | molecular-larger-training-generation-474 |

Caveats: matched-N is essential ("the error floor swings ~1500× with sample size N" for PMF; reflection); n=5 vs n=6 and chirality conventions differ across rows; several arms single-seed; α_L counts are rare-event readouts.

**4.2 Numerical/conditioning**

- Source conditioning, 512 fresh frames, δ=1, float64 (2026-10-19): ALDP5 p50/p99/max 607.1/51,585.4/554,855.3; ALDP5v (global rule) 117.1/587.4/1,029.4; real ALDP6 223.4/1,882.7/3,915.0; chignolin 83.3/1,285.4/31,790.9; BBA 79.3/847.7/1,371.4 (numerics assessment). Localized planar metric: ALDP5 307.96/690.51/853.44; constant penalty 105.43/234.62/246.08 (planarity note). Caveat: local chignolin/BBA files are ScoreMD's model-generated dummy release (2026-10-19 correction).
- 800k frames n=5 vs n=6: worst condition 1.55×10⁶ vs 4.2×10³ (sprint7).
- #513: 194 tensor states; original undefined at 3 exact planes; PD lost in 24/63 (float32), 9/63 (float64) flattened states.
- Integration: eight-step float32 vs reference feature differences at displacement 1: ALDP5v 1.76834, chignolin 1.08184, BBA 0.088026; pair-distance differences up to 90.2%/68.6%/2.96%; precision change on the same grid only .0000897/.0001219/.0000103 (numerics assessment). 64-update paths: fixed f32 vs adaptive f64 terminal feature separation 1.1853/4.3374/8.9151.
- Scale split: |dz|/arc ≈ 8×10⁻⁵ vs ≈219× overshoot pre-split (16; APPROX §J). TF32: ~11% of GRW paths ran to ~10⁵; max ‖x_t‖ ~6.7×10⁴ vs ~1.5 at highest precision.

**4.3 Cost**: S7 per-sample flat 0.74 s (warm) vs exp-split ~253 s (≈340×) vs x64 ~445 s (≈600×); S1 precompute ~2.1–5.4 h for curved arms; §H ms/sample for forward walks chignolin ~6,100, BBA ~2,300, AK ~55,000 (extrapolated); ISM connection trace on AK 1536 ms dense vs ~25 ms Jacobi.

**4.4 Interpolation (#513, authenticated)**: ALDP5 mean RMSD Cartesian 0.22398 / wδ 0.24721 / localized 0.24318 Å; local-distance RMSE 0.05168 / 0.03244 / 0.03525 Å; torsion error 27.414° / 31.056° / 30.650°; AK RMSD 1.76319 / 2.02770 / 2.02481 Å, local 0.14412 / 0.07676 / 0.07674 Å. Earlier "authentic MD" continuation: Cartesian can collapse adjacent Cα spacing to 0.294 Å (chignolin) and 0.087 Å (BBA) (522).

**4.5 Later reinterpretation**: residual stiffness κ (theory/20 §5.3): flat 192/112/97 vs wδ δ=1 413/315/631, δ=0.1 58/37/76; Sprint 12 feature-space wδ: ALDP5 bond 0.000434 Å (Cartesian 0.004558), BBA 0.113073 (Cartesian 0.415335).

---

## 5. Why it was promising, why it failed, what was learned

**Why it looked promising (stated rationale).**
- Physical-prior thesis (way-forward §2): "the $w^\delta$ geodesics **align with the physically accessible transitions** — a real MD move is a short, nearly-straight path, an energetically forbidden move is long … On flat coordinates the score field must simultaneously (a) learn the *shape* of the accessible basin and (b) learn to *avoid* the vast forbidden volume … On $(\mathcal M,g_{w^\delta})$, (b) is substantially handed to it by the geometry. **That is the reason to expect a data-efficiency and generalisation win**".
- Exact, elegant structure: symmetry quotient by construction, infinite-distance barriers, completeness, exact scale cylinder (16 calls it "the reason the wδ metric is *energy-aware*").
- External evidence: Diepeveen's AK interpolation and rank-1 tangent PCA (README "What makes the manifold trustworthy").
- Early measurements: Sprint 1's 0.117 vs 0.479, α_L only in the wδ arm; Sprints 4–5 wins over flat.

**Derived facts that explain the failure.**
1. *Domain mismatch.* The log-det barrier makes every noncollinear plane infinitely far ($L_g\ge\sqrt\delta|\Delta\log\det G|$). Five ALDP backbone beads are nearly coplanar, so real data sit near the boundary; conditioning scales like ε⁻⁴ and numerical positive definiteness is lost (522, 513). Reducing δ only delays it; a uniform floor cannot lift $Bv=0$ bending modes.
2. *No closed-form forward kernel.* Every noising step is a stiff geodesic IVP; the shipped integrator is first-order and uses a length-only step count ("step selection is not error control"); labels are separation-gradient surrogates that omit Jacobian and mean terms; finite GRW chains are not exact diffusions; floors, clamps and ridges change the laws (03, 11, 15).
3. *Coherence is fragile.* Forward clock, reverse rate, label and prior had to be matched by hand; each mismatch was provable on $z$ (E3) and each caused divergence.
4. *Reverse dynamics amplify.* Zero-score reversal is anti-confining; small-t score tails exceed the exp budget; tiny rounding grows across 64 updates (finite one-update amplification ratios 2.04/2.27/1.49); historical difficult endpoints had min pair/RMS radius 1.38–1.72×10⁻⁴.
5. *Cost.* ≈340–600× flat per sample; dense $O((nd)^3)$ per step; host-bound.

**Hypotheses (never confirmed).** wδ improves data efficiency or low-data generation (#266, closed 2026-10-24 without M1); geodesics ≈ MD paths ("an *interpretive thesis*, not a theorem", 16; #513 found Cartesian lower RMSD); metric × forward coupling is a genuine geometric effect (Sprint 1).

**Later corrections that removed the early evidence.** The flat comparators were defective (vp_mean target, 2026-10-02); with the fix flat reached ~0.10 and ScoreMD-native flat 0.0151; Sprint-1 replays were corrupted by TF32 until #252; S8 "α_L recovery" of 4.958% is ~9× the reference (~0.56%; my reading); the wδ α_L "win" became gross over-population after finiteness was fixed. Sprint 10: "neither curved metric beats Cartesian interpolation on average trajectory RMSD".

**What was learned (rules and reframing).** LESSONS_LEARNED rules: N1 (no eigenvector derivatives), G7 (projector from raw generators), G9 (log map ≠ separation surrogate), G10/P20 (pin signs three ways), P17 (flat/sphere gates hide metric-derivative bugs), P21 (one dtype per traced path), D13–D17, D18 ("A flat training loss is not convergence" — stiff modes are invisible in the loss). The theory pages now separate exact mathematics, local approximation, implementation and empirical evidence (theory README). The decisive reframing (theory/20, 2026-10-23): a metric matters for diffusion through *what it does to the noise* (four effects E1–E4); wδ's log-det channel dominates small molecules (78.3% of dilation cost at n=5) and its residual thermal stiffness at δ=1 is worse than flat; the useful part of wδ — a pullback of a flat feature space — can be used directly as an embedding with closed-form noising (Sprints 11–12).

---

## 6. Visualization opportunities

Existing videos in this repo: Part 0 (bundles, connections, curvature, shape bundle, molecule holonomy, falling cat) and Part 1 (stiffness, flat noise erases stiff directions first, covector score, "put the stiffness into the metric"). Era-1 visuals should complement them: they are the story of the *first* attempt to "put geometry in", and why it went wrong.

**V1 "One shape, many arrays" (Euclidean arbitrariness I).** Same 5-bead ALDP backbone rotated/translated/reflected; a Euclidean ruler between arrays reads nonzero; the wδ chord reads 0. Computed: exact $w^\delta$ and Procrustes distances. Reuse Part 0's fiber picture. Pitfall: reflection identification is a modelling choice, not chemistry (α_L is still L-alanine).

**V2 "A ruler that measures percentages" (arbitrariness II: units/scale).** Two springs (1.5 Å bond, 5 Å non-bonded pair); drag each by 0.1 Å; Euclidean cost equal, wδ cost 0.004165 vs 0.000392 (E5). Toggle Å↔nm: Euclidean numbers ×0.1, wδ unchanged (0.222685). Pitfall: relative deformation ≠ energy; the metric "is not a molecular potential".

**V3 "Collisions and flat clouds are infinitely far."** Animate E1: the cloud flattens; Euclidean odometer creeps to 1.0; wδ odometer races 3.25 → 7.84 → 12.44 → 17.04 (log). Side panel: $\log r_{ij}\to-\infty$ as two beads touch. Show the bound $|\Delta\varphi|\le d_g/\sqrt\delta$.

**V4 "The feature embedding": shape space as a surface in a flat feature space.** 3D sketch: a curved sheet extruded along axis $a=(1,\dots,1,2d\sqrt\delta)$; dilation = sliding along the straight axis; $z$ = arc length; show $F(e^\ell X)=F(X)+\ell a$ with real ALDP5 features projected (PCA of $F$ over frames minus axis). Computed: features from data. Pitfall: the true image is k-dimensional in $\mathbb R^{m+1}$; a 2D sheet is a cartoon.

**V5 "Chord vs geodesic."** On the embedded sheet, a straight feature chord vs the curved geodesic; $w\le d_g$; local fourth-order agreement (M6). Pitfall: `s_distance` is the chord.

**V6 "Expensive thickness, cheap bending" (thin-cloud metric ellipses).** For E1, draw the horizontal metric's unit ball as an ellipsoid stretching like e⁻² in thickness and flattening like e² in bending; log-log plot of λ_min, λ_max, cond vs e using the derived table (slopes +2, −2, −4). Add real-data markers: n=5 worst cond 1.55×10⁶ vs n=6 4.2×10³. Pitfall: condition numbers are coordinate-dependent and not error measures.

**V7 "ALDP5 is nearly planar."** Rotate five backbone beads to show near-coplanarity; histogram of $\lambda_{\min}(G)$/tr G for n=5 vs n=6 vs ALDP5v (from data). Then append Cβ / phantom bead; distribution shifts. Numbers: min λ_min 1.6×10⁻⁴ vs 0.10.

**V8 "What noising costs: one sample's journey."** Flat: one line $x_t=a x_0+\sigma\varepsilon$. wδ: frame eigendecomposition, Verlet sub-steps (S=clip(⌈8r²⌉,8,1024)), horizontal solve per sub-step, ×T walk steps, ×500 reverse steps. End with the log bar chart 0.74 s vs 253 s vs 445 s per sample. Pitfall: different hardware/batch regimes; numbers from a small cold benchmark (N=3).

**V9 "Wrapped Gaussian vs geodesic random walk vs heat kernel."** On a 2D curved surface (e.g. a warped plane with an analytic metric), sample one long exp jump vs many short geodesic steps; histogram vs numerically solved heat kernel; overlay $J^{-1}$ vs $J^{-1/2}$ amplitudes. Analytic toy, exact. Pitfall: the molecular heat kernel is unknown; this is a toy.

**V10 "The log map breaks, the surrogate bends."** Sphere/cut-locus cartoon, then the measured label-angle curve (9.8°→31.3°→35.1° vs radius, E16). Pitfall: "operational radius" is a solver diagnostic, not a certified injectivity radius.

**V11 "Step selection is not error control."** Fixed-step Verlet on a near-planar soft mode: the endpoint overshoots scale (|dz|/arc ≈ 219×; ‖v‖_g 0.1 → 119.8); adaptive solve lands correctly; chord-bound violations 38.3% (8 substeps) vs 2.34% (128). Then the **scale/shape split** animation: decompose $v$ into the $z$ component (placed exactly by a dilation) and the shape remainder. Pitfall: the split fixes scale, not shape (shape differences up to 90.2% in a pair distance at 8 steps).

**V12 "Two wrongs make a right" (sign bug).** Target arrows $-s_{\log}$ pointing away from data; DDIM's extra minus flips them back; Euler–Maruyama sampler explodes. Cosine −1. Short, memorable.

**V13 "The transpose bug."** Block matrix $H$ with 3×3 blocks; swap a↔b inside blocks; rotation generator test: correct residual 1.3×10⁻¹⁴ vs 5.97 (derived), negative eigenvalues; "both implementations agreed". Moral: test invariants, not parity.

**V14 "The clock that ran the wrong way" (generator coherence on z).** Plot $A(t)$ (one-kick multiplier) vs $a(t)=e^{-B/2}$ from E3; A crosses zero at t≈0.9 and ends at −0.111. Add the reverse variance-rate mismatch ($\beta$ vs $c^2\beta$, factor $1/c^2=9$ at k=9). Exact 1-D.

**V15 "Running uphill" (zero-score reversal).** A particle in a 1-D well; forward drift pulls in; reversed drift without score pushes out; $dz=a(z-z_{\rm ref})ds$; with the correct score the balance returns. Then the #222 finding: the molecular reverse walk enters the degenerate band with no score at all.

**V16 "Three stacked defects" (Sprint 2 onion).** Peel: clamp granularity (99.15% vs 91.15%) → conservative head invariance (leakage 0.94→0.0001) → coherence (#168). Narrative device for "fixing one bug reveals the next".

**V17 "Mirror images."** Ramachandran plot with points mapped $(\varphi,\psi)\to(-\varphi,-\psi)$ by reflection; 19.52% of frames reflected; JS 0.1774 with zero shape error; probabilistic lift restores 0.0948 while keeping α_L. Pitfall: φ>0 is not "wrong-handed"; never fold by sign(φ).

**V18 "The phantom bead."** Build $x_v=C_\alpha+1.5\,\text{Å}\,\hat n$; flip test: rebuilding from a mirrored backbone ≠ reflecting the six-bead cloud (marker sign); condition-number distributions before/after (512-frame table); then the catch: physical planarity becomes reachable at finite augmented distance (E6), distances change ($\sqrt{46}\to\sqrt{51}$), free virtual coordinate adds 3 noised directions.

**V19 "Finite is not correct."** Sprint 7 Ramachandran: reference vs generated with the α_L box at 25.2% vs 0.60%; finite fraction 1.0 badge. Pitfall: raw n=5 α_L box is reflection-confounded.

**V20 "The moving baseline" (scoreboard over time).** Timeline (Aug → Oct) of JS: wδ 0.117 (S1, n=6), 0.103/0.100 (S5), 0.325 (S7, finite but wrong), 0.1664 (S8 n=6); flat: 0.479/0.167 (S1), 0.26 (S4–S5), 0.2405 (S8), 0.10 after vp_mean fix, ScoreMD-native 0.0151; data floor 0.0114 band. Annotate bug fixes as vertical events. Pitfall: different N, n, conventions; label as "indicative".

**V21 "Bonds too broad."** Bond-length histograms: data (W1 floor ~0.005 Å) vs Era-1 generated (0.239–0.558 Å), and, as a forward link, Sprint 12 feature-space wδ (0.000434 Å on ALDP5). Pitfall: different representations, budgets and time points (t=0.01 targets in #474).

**V22 "Same metric, two machines."** Split screen: intrinsic route (geodesic ODEs, surrogate labels, 340× cost) vs embedding route (noise $F(x)$ in flat feature space with closed-form VP, project back; cost ≈ Cartesian 318 vs 259 s). The bridge to Era 2.

**V23 "Did wδ remove stiffness?"** Bar chart of residual stiffness κ (theory/20): flat 192, wδ δ=1 413, δ=0.1 58, planar 230, spring 9.6 (β/C7eq). Plus the δ-share curve $36\delta/(m+36\delta)$ vs n. Pitfall: κ is conditioning, "not a learning result".

**V24 "Cold-prior Metropolis on the manifold."** Chains doing geodesic proposals with energy $U=\tfrac12w^2$; reversibility as an involution (flow then flip velocity); warped-line counterexample with flux 1.255 when a Jacobian is wrongly added. Mixing curves from E19.

**V25 "Path sensitivity."** Two forward paths from the same start and noise, integrated at slightly different tolerances, drifting apart over 64 updates (terminal separations up to 8.9 for BBA); coupling noise through feature space removes scale separation (1e-13) but not shape.

**V26 "Planar-compatible fix and its price."** Animate a planar crossing with $D_\tau$ finite; slider τ: the plane stays regular but a thin transition region with condition ~1/τ appears (E8).

**V27 "Geodesic ≈ MD path?"** Interpolation overlay on ALDP5 windows: Cartesian chord vs wδ separation interpolation vs MD frame; RMSD bars (Cartesian wins) vs local-distance bars (wδ wins). Pitfall: separation interpolation ≠ geodesic shooting; panel is 18 dependent points.

**V28 "First-order integrator."** Error vs step count (halving per doubling: 4096-vs-8192 differences .001140/.000790/.0000814) and the missing $h^2a_va/4$ term.

**V29 "Size makes noise smaller."** log-size s.d. $R/\sqrt{kC}$ for ALDP5v/chignolin/BBA (0.0404/0.0227/0.00556): same "radius" means different physical perturbations across molecules — motivates transferability concerns.

**V30 "Map of contracts."** The four linked contracts "geometry → forward law → learned marginal score → initialized reverse dynamics" (theory/10) as a pipeline diagram, each box lit red where an Era-1 bug lived.

---

## 7. Open questions, caveats, contradictions, superseded interpretations

- **"wδ beats flat ~4×/2.7×"** (S1 summary 2026-08; reflection 2026-09-25 uses 0.180 vs 0.479). S1 itself says the single-seed 0.180 "is superseded by the 3-seed 0.117 ± 0.007"; the reflection calls 0.180 "(converged, 500-step)". Both compare to identity·GRW+OU, not the best flat (0.167). After 2026-10-02 the flat baselines of S4–S5 are known defective; S1 flat WG also had `vp_mean: true` (inference only).
- **ISM "target-free/scale-free"** (S1, reflection) → superseded: full ISM identifies magnitude (LESSONS §1 current text); and covector ISM had a sign-wrong divergence until #355 (2026-10-09). The "ill-conditioned metric" explanation was refuted in Aug 2026.
- **Injectivity radius ≈1.0/≈4.5 and "a genuine conjugate point"** (July 2026, theory/02 §9a) → later: "operational radius estimates should be treated as diagnostics of the tested numerical procedure, not certified geometric bounds"; negative log-Jacobian ≠ conjugate point (current 02, background 08). Curvature magnitudes partly untrustworthy (AK R≈−107; LESSONS §7).
- **π₁=0 / simple connectivity** (July theory/02) → current 00: must not be claimed for the regular base.
- **"GRW provably samples the heat kernel"; "past the cut locus there is no target"** (July §21) → current theory: a finite walk is a Markov chain approximation; `s_log` is single-valued; the heat-kernel score is smooth across the cut locus; rho-budget `ou` is not a consistent OU.
- **"Warped-product cylinder"** (code/comments) vs metric product (theory/16).
- **Scale = dominant eigenvector** → corrected 2026-10-19 (counterexample E2).
- **Phantom bead "descends to the quotient"/"zero handedness information"** → corrected (#273): SO(3)-equivariant, reflection-odd lift; orientation marker.
- **#232 title "the overshoot is numerical, not geometric"** vs the #232 strategies note: exp fidelity "necessary but not sufficient"; the forward's anti-confining drift is "the load-bearing defect".
- **Sprint 7 conflicting finding (#211)**: retrained e3nn 0.1% finite vs Sprint-5 checkpoints 83–95% finite at the same null trust radius — "not yet isolated".
- **Sprint 1 finite fraction**: 99.6% (sprint1 summary) vs 98.8% (TF32 analysis) for the same recipe.
- **Data provenance**: local chignolin/BBA HDF5 were ScoreMD's model-generated dummy release (2026-10-19); conditioning numbers stand for those inputs, MD-ordering interpretations withdrawn. APPROXIMATIONS "real BBA" numbers may share this provenance (not stated).
- **Upstream transpose bug** claim (July 2026 doc) not re-stated in current docs; not independently verified here.
- **S8 "α_L recovered 5.0%"**: ~9× the ~0.56% reference (my reading); "recovery" framing is generous.
- **Unresolved at closeout**: joint stationarity/terminal-prior agreement (#129 closed 2026-10-24 without acceptance), corrected-law learned reverse, matched-cost winner, data-efficiency hypothesis (#266), shape-factor normalizability of the Gibbs prior (an "eikonal measurement", not a proof).
- **Tension**: theory/20 says wδ (δ=1) is stiffer than flat, yet Sprint 12 feature-space wδ produced 10× better ALDP5 bonds than Cartesian — different representation (ALDP5v), different machinery and outcome measure; conditioning ≠ learning outcome.

---

## 8. Sources read

rg-main theory: `docs/theory/README.md`, `00-manifold.md`, `01-metric.md`, `02-log-exp-maps.md`, `03-diffusion-dsm.md`, `04-fokker-planck.md`, `05-equivariance.md`, `06-integrators.md`, `07-metric-tensor-bug.md`, `08-faq.md`, `09-graph-laplacian.md`, `10-sampling-and-scoring-an-unknown-heat-kernel.md`, `11`–`15` component notes, `16-scale-shape-cylinder.md`, `algorithms/cold-prior-geodesic-walk.md`, `background/06`, `07`, `08`, `12`; skimmed `20-thermal-metric-foundations.md` (§0, §5.3, §6.4), grep of `22`, `23`.
rg-main other: `docs/LESSONS_LEARNED.md`, `docs/APPROXIMATIONS.md`, `docs/Related_Work.md`, `README.md`, `docs/status.md` (current), `docs/investigations/{wdelta-qualification-522, metric-qualification-513, metric-numerics-scaling-assessment, planarity-compatible-metric, phantom-bead-virtual-cbeta-236, aldp5-section-generator, aldp5-construction-section, prior-intrinsic-reversibility-356, ism-covector-repair-355, scale-calibrated-dsm-357, aldp-reference-metric-evaluation (head), aldp5-target-calibration-154 (head), chirality-review-and-recommendation (summary)}.md`, `docs/sprints/sprint9/{closeout-267, molecular-larger-training-generation-474, molecular-reverse-grid-474 (head), stationarity-runtime-129 (head)}.md`, `docs/sprints/sprint10/closeout-520.md`, `docs/sprints/sprint12/{matched-results, physical-wdelta}.md`.
Archive (`rg-archive/docs`): `status.md` (head and final sections), `sprints/README.md` (registry rows sprint0–8), `sprints/SPRINT_1-6_REFLECTION.md`, `sprints/sprint1/summary.md`, `sprints/sprint2/{summary, sprint-2-obstacles, wdelta-way-forward, wdelta-reverse-collapse}.md`, `sprints/sprint3/summary.md` (δ sections), `sprints/sprint7/summary.md` (verdict → bakeoff), `sprints/sprint8/{summary, headtohead}.md`, `sprints/sprint9/{cold-priors-explained, mid-sprint-9-analysis (head)}.md`, `APPROXIMATIONS.md` (§A, transpose status), `investigations/{exp-geodesic-solve-strategies-232.md, grw-exp-tf32-blowup/analysis.md}`.
Git: `git:8298d51f8:docs/theory/07-metric-tensor-bug.md` (transpose post-mortem), `git:f1d5be05c:docs/theory/02-log-exp-maps.md` §9a and `.../10-...` §21, `git:ae3bb0a67:configs/replicates/flat_wg_dsm_seed0.yaml`, commit log 2026-07-13 → 2026-10-24.
GitHub (`gh`): PRs #166, #228, #230, #231, #234, #235, #250, #263, #373, #376; issues #129, #135, #168, #224, #229, #232, #236, #266, #267, #361, #520, #522, #523, #524.
Own checks: `scratchpad/understand/checks/wdelta_checks.py`, `toys2.py`.
