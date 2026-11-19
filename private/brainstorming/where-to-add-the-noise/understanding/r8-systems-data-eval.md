# r8 — The setting and the data for visuals: systems, pipeline, evaluation, local data

Reader r8 of the understanding workflow, written 2026-11-19. Read-only. Sources: snapshot of
`origin/main` at 2026-11-19 (`rg-main`, cited by repository-relative path), the archive tag
`archive/pre-cleanup-2026-10-23` (`rg-archive/docs`), GitHub PRs/issues (read-only), and a
read-only inspection of local data under
`/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative` (called `LOCAL/` below).
Numbers are quoted from their source; values I computed myself from local data or by algebra are
marked **(derived here)** or **(checked here)**.

---

## 1. Narrative: how the systems, data and evaluation evolved

**July 2026, setup.** The repository starts on 2026-07-13. The first data placed by hand
(`LOCAL/data/deshawresearch/`, files dated 2026-07-27/31) are (i) `aldp.npy`, ScoreMD's bgmol
`AImplicitUnconstrained` alanine-dipeptide trajectory (AMBER99SB-ILDN, OBC implicit solvent, 300 K,
1,000,000 frames, 22 atoms, nm; `docs/DATA_STATE.md`), and (ii) `chignolin-0_ca.h5`, `bba-0_ca.h5`,
`bba-1_ca.h5`, believed at the time to be D. E. Shaw trajectories. The data pipeline
(`rg-prepare-data`, `src/riemanniangenerativemd/data/pipeline.py`) converts nm→Å, strides, centres,
shuffles with seed 42 into 80/10/10 train/val/test, Kabsch-aligns (SO(3)) to `train[0]` and stores one
pooled `input_scale = std(train)`. The registry (`data/datasets.py`) knows `aldp5` (n=5, shape
dimension 9), `aldp` (n=6, 12), `chignolin` (n=10, 24), `bba` (n=28, 78) and the derived `aldp5v`
(`docs/theory/background/12-proteins-as-point-clouds.md`). Adenylate kinase (214 Cα, the wδ paper's
showcase) is investigated but not a loader key.

**Sprints 1–7 (from 2026-08-21 to late September): the wδ era on alanine dipeptide.** Sprint 1
(first added 2026-08-21) was a proof of concept on *real six-bead* ALDP (`aldp`, beads
`[4,6,8,10,14,16]`, keeps the alanine Cβ): wδ DSM φ/ψ-JS 0.117 ± 0.007 against the best flat
configuration 0.167 ± 0.012 (archive `docs/sprints/README.md`). The project then moved to **ALDP5**,
the ScoreMD/Plainer parity level, atoms `[4,6,8,14,16]` = ACE-C, ALA-N, ALA-Cα, ALA-C, NME-N
(`docs/benchmarks/aldp5.md`). Those five backbone beads are nearly coplanar: over 800k frames the
reported minimum gyration eigenvalue is 1.6×10⁻⁴ (≈0.013% of frames below 10⁻²) with worst
condition number ≈1.5×10⁶, against ≈0.10 and ≈4×10³ for the six-bead cloud with Cβ
(`docs/theory/01-metric.md`, "Thin clouds"). Because wδ inverts the gyration tensor this made the
metric stiff; Sprint 7 (2026-09-25) introduced `aldp5v`, a deterministic virtual Cβ at
Cα + 1.5 Å·n̂ (`docs/DATA_STATE.md`). Chirality matters for evaluation: at n=5 no robust backbone
tetrad exists (≈29% sign flips), so ALDP5 φ/ψ are read raw under SO(3) only, and αL (φ>0) is a real
basin, not a mirror artifact (`src/riemanniangenerativemd/eval/ramachandran.py`, issue #133).

**Sprint 8 (2026-09-29 to 10-02): calibrating against ScoreMD.** Trained from scratch through
ScoreMD's own repo and 1,000-step sampler, ScoreMD-native reaches φ/ψ-JS 0.0151 against a data floor
0.0114, while the project's own flat arms sat at 0.26–0.28; a DSM-target fix (#259) brought one arm
to 0.1012 (`docs/sprints/sprint8/headtohead.md`).

**Sprint 9 (2026-10-05 to ~10-18): a measurement contract.** The ALDP5 benchmark v1 was ratified on
2026-10-08 under #9 (`docs/benchmarks/aldp5*.md`): ScoreMD's *training-reference* protocol, a frozen
50,000-row membership (`numpy.random.default_rng(42).permutation(1000000)[:50000]`, i.e. the first
50,000 stored processed training rows), PMF error as the comparison metric with Ramachandran plots and
both JS conventions always shown, bond W1 in Å, basin boxes, all-requested accounting, same-N
reference floors and exact binomial αL intervals. The reference holds **319 αL rows out of 50,000
(p_ref = 0.00638)**, with αR 18,076, β 28,008, other 3,597 (`docs/benchmarks/aldp5-b3-proposal.md`;
reproduced exactly from `LOCAL/data/processed/aldp5_train.npy[:50000]`, **checked here**). The first
fresh flat pilots at N = 2,000 scored PMF 7.12 against an eight-repeat floor of 4.65 [4.40, 5.08]
(archive `sprints/sprint9/flat-pilot-v1-execution-10.md`); the two later fresh flat seeds had PMF
means 7.66269 and 6.43843 and αL 34/8000 = 0.425% and 16/8000 = 0.200% (against 0.638%)
(`docs/benchmarks/aldp5-joint-power-budget.md`). Curved wδ reverse generation remained numerically
fragile: the #488 diagnostic attempted 432 reverse paths, 235 complete and 197 failed
(`docs/benchmarks/aldp5-spending-ledger.md`). M1 stayed open.

**2026-10-19: a provenance correction.** All three chignolin/BBA HDF5 files were found to be exact
byte matches of ScoreMD's public `deshaw_dummy.zip`, i.e. **model-generated samples, not MD**
(archive `investigations/metric-path-fidelity.md`; `docs/DATA_STATE.md`). Separately, authenticated
torchmd-protein-thermodynamics trajectories (CHARMM22*, 350 K, 100 ps frames) were used only for a
512-frame metric qualification (archive `investigations/authentic-md-metric-evaluation.md`).

**Sprint 10 closed 2026-10-22**: flat Cartesian remains the default and required baseline; physical
wδ is a restricted-domain reference (`docs/sprints/sprint10/closeout-520.md`).

**Sprint 11 (from 2026-10-23, tracker #769): metric-shaped noising through feature maps, a new ALDP
data source and a pre-declared protocol.** The Sprint 11 ALDP5 pilots switched to the **mdshare
alanine-dipeptide heavy-atom file**: three explicit-solvent trajectories of 250 ns each, 1 ps frames,
250,000 frames each, 10 heavy atoms; ALDP5 = atoms `[1,3,4,6,8]` (C N CA C N), ALDP10 = all ten
(`experiments/stiffness/learned_stiffness_aldp.py`; local file dated 2026-10-25). Trajectory 0
trains, trajectory 1 is the held-out reference, trajectory 2 a second reference. A GPU compiler bug
(XLA miscompiled the final denoising step, adding a constant offset to every molecule) was found and
fixed; it had caused the "late-training degradation" of #757/#760/#763
(`docs/investigations/feature-space-evaluation.md` §1). The **feature-space evaluation (#765,
2026-10-26/27)** fixed primary (P1–P5) and secondary (S1–S5) metrics before any result
(`docs/investigations/evaluation-metrics.md`), scored 20,000 molecules per checkpoint against a
20,000-frame panel of trajectory 1 with three floors, and found that spring features reach the bond
floor ~100× sooner than the best flat model. The **joint-distribution re-scoring (#779,
2026-10-27)** added C2ST, MMD, a handedness gap, a data-derived TICA plane and an MSM, and found that
torsion/rare-state metrics mostly measure which simulation is the reference
(`docs/investigations/joint-distribution-metrics.md`). The leaderboard was decided on 2026-10-29
(#825) and the logging format `rg-log/1` written on 2026-10-30 (#854)
(`docs/design/leaderboard-architecture.md`, `docs/design/experiment-logging-format.md`).

**2026-11-01: real BBA.** The authentic DESRES BBA Cα data ("DESRES-Science2011-FastProteinFolding/
bgmol", two files with 1,114,545 + 510,650 = 1,625,195 frames) were prepared as
`LOCAL/data/deshawresearch-bba-ca28/` with membership seed 0: **1,300,156 training and 325,039
held-out frames**, Å, per-cloud centred, proper-Kabsch-aligned to the first selected training cloud
(`data.json`, **checked here**). PR #895 compared conservative pullback models on this data with the
"PR895 readout" (`experiments/stiffness/bba_metrics.py`): TIC JS/PMF on the two leading TICA
coordinates of the published bgmol model, bond/angle W1 against a fixed 2,000-frame training panel,
Rg, contacts. It also taught the sample-count lesson: for the same flat models, TIC JS 0.225 → 0.053
and PMF 6.57 → 0.56 between 2,000 and 100,000 molecules
(`docs/investigations/sprint11-pullback-campaign-closeout.md`). PR #1138 later confirmed that this
1,300,156-frame pool is exactly the ScoreMD paper's training split
(`jax.random.permutation(PRNGKey(0))` over the two DESRES files).

**Sprint 12 (from 2026-11-08, tracker #855).** The comparison protocol (revision 2,
`docs/sprints/sprint12/protocol.md`) fixes: ALDP5 uses the bgmol 50,000-row membership — **not** the
mdshare pilots — and BBA the 1,300,156 DESRES frames; a shared conservative invariant transformer;
VP noising; 1,000-step reverse sampling; a new **physical readout** (bond/angle/Rg W1, contact MAE,
population JS with an outside cell, severe collisions, all requests retained;
`src/riemanniangenerativemd/eval/campaign.py`). The first chunks (48,000 ALDP5 / 190,350 BBA
updates, 2026-11-09) showed the split that drives the rest of the story: on BBA internal coordinates
had near-floor local geometry but Rg W1 0.52 Å against 0.072 Å for Cartesian
(`docs/sprints/sprint12/matched-results.md`). The required native ScoreMD reference (#997/#998,
contract `docs/sprints/sprint12/scoremd-cartesian-baseline.md`), pair-distance inputs (#985) and a
covariance-matched Cartesian score base (#1033) followed. Between 2026-11-11 and 11-13 the BBA
diagnosis (#1025, #1026, #1055, #1064, #1057, #1069, #1065, #1073) produced the readable-window and
range-and-order picture (`docs/investigations/bba-range-and-order.md`, theory note 27). The status
page changed the working hypothesis on 2026-11-14. The **registered-budget study** (stage 1 run
2026-11-14/15; `docs/sprints/sprint12/real-budget-study.md`) scored 22 models on 100,000 molecules
each and introduced a new force-field panel (256 data starts + 256 generated starts, 100 ps
Langevin at 325 K). Force-field drift diagnoses, a doubled-length run and full-schedule
continuations (1,903,500 updates) followed on 11-16 to 11-18 (#1089, #1091, #1104). On 2026-11-18
the leaderboard gained one-row-per-model endpoints (#1126, merged) and saved BBA slide views
(#1127, open), and PR #1138 (open) scored the BBA models with **the ScoreMD paper's PMF definition**,
measuring how strongly its floor depends on sample count. Lab entries on BBA global handedness ran
on 11-18/19 (`lab/2026-11-18-*handedness*`, `lab/2026-11-19-handedness-gap-arm`).

---

## 2. Core mathematics in scope

### 2.1 Molecular state, degrees of freedom, internal coordinates

- A conformation is a labelled cloud $X\in\mathbb R^{n\times 3}$, rows = beads; row order carries
  chemistry. On the full-rank domain the shape dimension is $k = 3n - \tfrac{3\cdot 4}{2} = 3n-6$
  (3 translations, 3 rotations removed; reflection is discrete)
  (`docs/theory/background/12-proteins-as-point-clouds.md`). ALDP5: $k=9$ = 4 bonds + 3 angles +
  2 torsions. BBA: $k=78$ = 27 bonds + 26 angles + 25 torsions **(derived here)**.
- Torsion of four points $p_0,p_1,p_2,p_3$ (the code's `dihedral`): with
  $b_0=p_0-p_1$, $b_1=p_2-p_1$, $b_2=p_3-p_2$, $\hat b_1=b_1/|b_1|$,
  $v=b_0-(b_0\cdot\hat b_1)\hat b_1$, $w=b_2-(b_2\cdot\hat b_1)\hat b_1$:
  $\tau=\operatorname{atan2}\big((\hat b_1\times v)\cdot w,\;v\cdot w\big)$
  (`eval/ramachandran.py`). ALDP5: $\phi=\tau(x_0,x_1,x_2,x_3)$, $\psi=\tau(x_1,x_2,x_3,x_4)$.
- Bond angle of consecutive bonds $b_i=x_{i+1}-x_i$: $\theta_i=\arccos\big(-b_i\cdot b_{i+1}/(|b_i||b_{i+1}|)\big)$
  (`eval/campaign.py::chain_observables` uses the equivalent atan2 form).
- **Internal-coordinate features** of the Sprint 12 internal map (C3): log lengths $a_i=\log|b_i|$,
  log half-angle tangents $\beta_i=\log\tan(\theta_i/2)$ (so $\cos\theta=-\tanh\beta$,
  $\sin\theta=\operatorname{sech}\beta$), and torsion phase pairs $(\cos\tau,\sin\tau)$, whitened
  on training frames. BBA: $27+26+2\cdot 25=103$ features; with two loud mode vectors appended,
  $103+6=109$ numbers (`docs/sprints/sprint12/global-geometry-study.md`;
  `lab/2026-11-18-range-order-mechanisms`).
- Chain rebuild used for the network's "distance hint" from noisy internal features: start frame
  columns $(-C,S,0),(-S,-C,0),(0,0,1)$ and per bead right-multiply
  $M(C,S,c,s)=\begin{pmatrix}-C&-S&0\\ Sc&-Cc&-s\\ Ss&-Cs&c\end{pmatrix}$, advancing by the next
  length along the first frame axis; on clean unit phase pairs this is ordinary NeRF-type
  reconstruction, off image an algebraic continuation (`global-geometry-study.md`).

### 2.2 Forward noising (VP) and schedule

- Linear rate $\beta(t)=\beta_{\min}+t(\beta_{\max}-\beta_{\min})$ with
  $\beta_{\min}=0.1,\ \beta_{\max}=20$; $\log\alpha(t)=-0.05\,t-4.975\,t^2$, i.e.
  $-\log\alpha_t^2=0.1t+9.95t^2$; $\sigma(t)=\sqrt{1-\alpha(t)^2}$
  (`src/riemanniangenerativemd/forward/vp_schedule.py`).
- Corruption in feature coordinates $y=F(x)$: $y_t=\alpha(t)F(x)+\sigma(t)\varepsilon$,
  $\varepsilon\sim\mathcal N(0,I)$ (`forward/feature_vp.py`). Training times
  $t\sim\mathcal U[t_{\min},1]$ with $t_{\min}=10^{-5}$ for Cartesian-family and warp maps and
  $t_{\min}=0.01$ for the other maps (Sprint 12 `global-geometry-study.md`).
- Loss: batch mean of the **sum** over feature channels of
  $|\hat\varepsilon_\theta(y_t,t)-\varepsilon|^2$ (`feature_vp.py::loss`).

### 2.3 Score parameterisation, sampler, final denoising

- Conservative Gaussian-residual field: $\hat\varepsilon_\theta(y,t)=\sigma(t)\,y+\alpha(t)\nabla_y H_\theta(y,t)$,
  $s_\theta=-\hat\varepsilon_\theta/\sigma(t)=-y-\tfrac{\alpha}{\sigma}\nabla_yH_\theta$ with $H_\theta$
  a scalar (sum of per-bead) residual energy (`docs/design/feature-space-driver.md`).
- Reverse Euler–Maruyama on a geometric grid $t_k$ from 1 to $t_{\min}$ (1,000 steps):
  $y\leftarrow y+\big(\tfrac12\beta y-\beta\hat\varepsilon/\sigma\big)\Delta t+\sqrt{\beta\Delta t}\,z$, from
  $y_1\sim\mathcal N(0,I)$; final Tweedie step $\hat y_0=(y-\sigma\hat\varepsilon)/\alpha$ as a
  separate compiled call with runtime $t$ (the GPU-bug repair); then the map's decoder
  (Levenberg–Marquardt projection for redundant maps, ≤200 iterations) (`feature_vp.py`).
- Late repulsion (sampler only): from the first grid time $t\le0.02$,
  $\hat\varepsilon\leftarrow\hat\varepsilon+\sigma(t)\,\kappa\,\nabla\Phi$,
  $\Phi=\sum_{|i-j|\ge3}\operatorname{relu}(r_c-d_{ij})^2$, $\kappa=30\ \text{Å}^{-2}$, $r_c=3.6$ Å,
  $d_{ij}$ from the chain rebuilt from the denoised internal block (`feature-space-driver.md`;
  protocol `s12-physical-readout-fixed-late-repulsion-v1`).

### 2.4 Force read-out from the learned score

- Feature-space driver: $f_t(x)=J_F(x)^\top\alpha(t)\,s_\theta\big(\alpha(t)F(x),t\big)+\nabla_x\log\sqrt{\det(J_F^\top J_F)}$
  (`docs/design/feature-space-driver.md`). The second, **volume term** follows from
  $\nabla_x\log p_0=D\varphi^\top\nabla^S\log q(\varphi(x))+\tfrac12\nabla_x\log\det G$,
  $G=D\varphi^\top D\varphi$; omitting it shortened ALDP5 bonds by 0.30–0.36 thermal widths
  (`docs/theory/29-score-to-force-pullback.md` §2).
- Sprint 11 form: $g=DF^\top s_y+\tfrac12\nabla\log\det(DF^\top DF)$ for 16-dimensional spring/wδ
  features, $g=D\phi^\top s_y+\nabla\log|\det D\phi|$ for an invertible warp, $s_y=\alpha(-\hat\varepsilon/\sigma)/\text{scale}$
  (`docs/investigations/force-field-simulation.md` §1).

### 2.5 Simulation

- Sprint 11 Brownian dynamics: $u\leftarrow u+h\,g(u)+\sqrt{2h}\,\xi$, $h$ in Å² (no physical time).
- Sprint 12 Langevin: released ScoreMD velocity-first update, friction 1 ps⁻¹, 300 K (ALDP5),
  325 K (BBA), masses C/N/C/C/N 12.01078/14.00672/12.01078/12.01078/14.00672 Da for ALDP5 and
  12.01078 Da per BBA Cα; 2 fs and 1 fs panels (`global-geometry-study.md`).

### 2.6 Evaluation metrics (definitions)

- **W1 (1-D Wasserstein-1)**: $W_1(P,Q)=\int|F_P(z)-F_Q(z)|\,dz$; reported per bond (Å), per angle
  (°), for Rg (Å). Sprint 12 "Bond"/"Angle" = mean over the 27 bonds / 26 angles; "Size" = W1 of
  the Rg distribution (`eval/campaign.py`).
- **Radius of gyration**: $R_g^2=\tfrac1N\sum_i|x_i-\bar x|^2=\tfrac1{N^2}\sum_{i<j}|x_i-x_j|^2$.
- **Contact error**: $\tfrac{1}{|P|}\sum_{(i,j)\in P}|\Pr_{\text{gen}}(d_{ij}<10\,\text{Å})-\Pr_{\text{ref}}(d_{ij}<10\,\text{Å})|$
  over pairs with $|i-j|\ge3$ (325 pairs for BBA).
- **Severe collision ("clash")**: some pair with $|i-j|\ge3$ and $d_{ij}<1$ Å; **overlap**: $d_{ij}<3.5$ Å
  (`real-budget-study.md`, `bba-range-and-order.md`).
- **JS divergence**: $\mathrm{JS}(p,q)=\tfrac12\mathrm{KL}(p\|m)+\tfrac12\mathrm{KL}(q\|m)$, $m=\tfrac{p+q}2$.
  Conventions in use: fixed periodic $[-\pi,\pi)$, 64×64, base 2 (ALDP5 benchmark); ScoreMD
  natural-log with combined-data bounds; Sprint 12 "population JS" = squared SciPy JS distance in
  nats on a fixed grid **plus one outside cell** (ALDP5 torsions 64×64; BBA TIC 100×100 over the
  reference range); the paper read-out JS on 100×100 density histograms inside fixed limits.
- **ScoreMD PMF error**: bins on a grid with $n_b-2$ interior bins and two outlier bins per axis;
  proportions $p_b,q_b$; over bins occupied by either set, empty proportions set to $10^{-6}$;
  $w_b=\tfrac{p_b+q_b}{2}\big/\sum_{b'}\tfrac{p_{b'}+q_{b'}}{2}$;
  $\mathrm{PMF}=\sum_b w_b(\ln p_b-\ln q_b)^2$ (units $k_BT^2$; no square root). ALDP: 64 bins
  (62+2); BBA paper read-out: 100 bins per axis on fixed TIC limits $[-1.23,2.05]\times[-3.13,3.10]$
  (`eval/aldp5_benchmark.py`, PR #1138 `eval/scoremd_paper.py`).
- **BBA TIC projection** (frozen, evaluation only): features = 378 Cα pair distances in **nm**
  (upper-triangular order) + 25 consecutive signed pseudo-torsions (rad); $\mathrm{TIC}=(f-\mu)\,C$
  with $C\in\mathbb R^{403\times2}$, $\mu\in\mathbb R^{403}$ exported from bgmol `bba_tica.pic`
  (deeptime CovarianceKoopmanModel), zero parity error on 1,000 frames
  (`configs/benchmarks/bba-ca28-tica.json`).
- **Thermal-width metrics (Sprint 11)**: W1/σ per coordinate (σ = sd in held-out MD), spread ratio
  sd_model/sd_ref, |mean shift|/σ; stiff–soft coupling = reference-weighted RMS over 30°×30° cells
  (≥50 ref, ≥20 model) of per-cell mean errors in σ; validity = share of all requested molecules
  with every bond and angle in the reference 0.1–99.9% range (`evaluation-metrics.md`).
- **Rare-basin free energy**: $\Delta F=-\ln[P(\phi\ge0)/P(\phi<0)]$ ($k_BT$); error = absolute difference.
- **Quasi-harmonic strain**: $E=\sum_{k=1}^{7}\tfrac12((q_k-\mu_k)/\sigma_k)^2$ over 4 bonds + 3 angles;
  outlier = $E>10\,k_BT$ (threshold fixed before scoring).
- **Stein/equipartition force check**: for the exact $g=\nabla\log p$ and fixed unit $e$:
  $-\mathbb E[(g\cdot e)(e\cdot(u-\bar u))]=1$ (evaluated along principal directions; <1 = too soft).
- **C2ST AUC** (20-NN classifier, 10,000 + 10,000), **MMD** (Gaussian kernel, median heuristic,
  2,000 per side, 200 permutations), **handedness gap** = AUC on signed $(\cos\phi,\sin\phi,\cos\psi,\sin\psi)$
  minus AUC on mirror-invariant $(\cos\phi,\cos\psi,\sin\phi\sin\psi)$.
- **BBA global handedness**: $\chi=a_1\cdot(a_2\times a_3)/(|a_1||a_2||a_3|)$ of the first three
  collective-mode vectors (flips under mirroring) (`lab/2026-11-18-range-order-mechanisms`).
- **Readability / readable window**: $R_h(t)=\mathrm{Var}(\mathbb E[h(X)\mid Y_t])/\mathrm{Var}(h(X))$;
  $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; any predictor gives a lower bound; $R_h$ is
  non-increasing in $t$ (`docs/theory/27-readable-windows-and-noise-order.md` §1–2).
- **Floors**: the same metric computed for reference-vs-reference panels of the same requested count
  (8 resamples in Sprint 12; split-half / training / third trajectory in Sprint 11). Floors are
  descriptive, never subtracted (`aldp5-evaluator.md`, `experiment-logging-format.md` §7).
- **Rare-basin interval**: per-basin exact (Clopper–Pearson) binomial limits; with $c$ hits and $u$
  unknown slots of $N$ requested, identification bounds $[c/N,(c+u)/N]$ (`aldp5-b3-proposal.md`).
- **MD dependence**: integrated autocorrelation time $\tau$, effective sample size $N/2\tau$
  (`joint-distribution-metrics.md`).

### 2.7 Two identities useful for visuals

- **Rg² as weighted bond-vector correlations** (**verified here**): with $B_{kl}=\mathbb E[b_k\cdot b_l]$,
  $R_g^2=\sum_{k,l}W_{kl}\,b_k\cdot b_l$, $W_{kl}=(\min(k,l)+1)(N-1-\max(k,l))/N^2$, because
  $x_j-x_i=\sum_{k=i}^{j-1}b_k$ and the pair $(i,j)$ contains $(k,l)$ iff
  $i\le\min(k,l)$, $j\ge\max(k,l)+1$. The Sprint 12 diagnostic sums $W_{kl}(B^{\rm gen}-B^{\rm ref})_{kl}$
  by separation group so the groups add up exactly to $\Delta\langle R_g^2\rangle$
  (`global-geometry-study.md`).
- **Linear-mode half-erasure**: retained fraction $r(t)=\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)$,
  half erased when $\alpha_t^2\lambda=\sigma_t^2$, so
  $t_{1/2}(\lambda)=\big(-0.1+\sqrt{0.01+39.8\log(1+\lambda)}\big)/19.9$, $t_{1/2}(1)=0.259$
  (theory note 27 §3).

---

## 3. Worked analytical examples (all exactly computable)

**3.1 The noise ruler (derived here from §2.2).** σ(t) in model units, and per coordinate in Å for
the ALDP5 flat scale 0.9418 Å and the BBA Cartesian scale 6.252 Å (note 27 uses "Å / 6.252"):

| t | α | σ | log-SNR $\log(\alpha^2/\sigma^2)$ | σ·0.9418 Å | σ·6.252 Å |
|---:|---:|---:|---:|---:|---:|
| 1e-5 | 0.999999 | 0.00100 | 13.81 | 0.00094 | 0.0063 |
| 4e-4 | 0.999979 | 0.00645 | 10.09 | 0.0061 | 0.040 |
| 0.01 | 0.999003 | 0.04464 | 6.22 | 0.0420 | 0.279 |
| 0.02 | 0.997014 | 0.07721 | 5.12 | 0.0727 | 0.483 |
| 0.05 | 0.985174 | 0.17156 | 3.50 | 0.162 | 1.073 |
| 0.1 | 0.946722 | 0.32205 | 2.16 | 0.303 | 2.01 |
| 0.259 | 0.707033 | 0.70718 | 0.00 | 0.666 | 4.42 |
| 0.5 | 0.281183 | 0.95965 | −2.46 | 0.904 | 6.00 |
| 1 | 0.006572 | 0.99998 | −10.05 | 0.942 | 6.25 |

Consistency checks: the "production floor" σ_min = 0.042 Å at t = 0.01 for ALDP5 flat
(`feature-space-evaluation.md`); the ≈1 Å blur of Cartesian BBA at force time 0.05
(`bba-local-geometry-preconditioning.md` §6, `global-geometry-study.md`). On the 1,000-step geometric
grid with $t_{\min}=0.01$ the switch $t\le0.02$ is the last 150 steps and $t\le0.05$ starts at step
650; with $t_{\min}=10^{-5}$, 600 of the 1,000 steps lie below $t=0.01$ (**derived here**). Bonds in
Cartesian BBA are resolvable only for $t<4\times10^{-4}$, i.e. $(4\cdot10^{-4}-10^{-5})/(1-10^{-5})\approx0.04\%$
of uniformly drawn training times (`bba-local-geometry-preconditioning.md` §1).

**3.2 Half-erasure of linear modes.** BBA's 27 Cartesian principal modes (feature units Å/6.252): the
largest four have variances 15.5, 6.2, 3.0, 1.3 (93% of mean squared Rg), half-erased at
t = 0.53, 0.44, 0.37, 0.29; the smallest has 0.011, half-erased at 0.028; ratio 1,423. Rescaling mode
$k$ by $\lambda_k^{-\gamma/2}$: γ = 0 → largest/smallest 1,423, windows 0.53/0.028; 0.25 → 232,
0.50/0.065; 0.5 → 38, 0.45/0.13; 0.75 → 6.1, 0.37/0.20; 1 (whitened) → 1, 0.26/0.26 (note 27 §3).
Recomputed: $t_{1/2}(15.5)=0.526$, $t_{1/2}(0.011)=0.0285$, $t_{1/2}(1)=0.2590$ (**checked here**).

**3.3 Why the production-floor flat model narrows bonds.** The Tweedie step returns
$\mathbb E[x_0\mid x_t]$, which shrinks a Gaussian coordinate of thermal width $w$ under leftover
noise $s$ to a spread $w/\sqrt{w^2+s^2}$ of the truth. ALDP5 flat at $t_{\min}=0.01$: 0.042 Å per
slice coordinate, so $s=0.060$ Å on a bond (two atoms); $w=0.025$–0.031 Å gives predicted ratios
0.39–0.46, observed 0.44–0.53 at 200k steps; angles predicted 0.53–0.66, observed 0.69–0.78
(`feature-space-evaluation.md` §4). Recomputed 0.388 and 0.463 (**checked here**). Early in training
the denoiser leaves noise in (bonds 1.8–2.8× too broad at 1k steps); converged, it over-shrinks.

**3.4 Equal Cartesian noise, unequal physics.** In Cartesian coordinates bonds deviate by one 1 ps
step width at 7.8–9.0 times less noise than φ/ψ; local condition numbers κ of the thermal step
covariance: ALDP5 flat 184/185, constant whitening 24.6, scaled internal 3.88–3.95, learned warp
2.99–3.04 (estimation floor 1.55); ALDP10 1,780 / 34.9–35.4 / 6.46–6.54 / 3.62–3.68
(`docs/design/learned-stiffness-warp.md`). BBA (1 frame = 200 ps lag): flat slice 770, constant
whitening 27, scaled internal 19, learned warp 7.6 (`docs/investigations/bead-matched-campaign.md`).

**3.5 Floors scale with 1/N (derived here, approximate).** For two independent N-samples of the same
distribution with $K$ well-occupied bins: $\mathrm{JS}\approx\sum_b(\hat p_b-\hat q_b)^2/(8m_b)$ and
$\mathbb E(\hat p_b-\hat q_b)^2\approx2p_b/N$, so $\mathbb E[\mathrm{JS}]\approx K/(4N)$ nats; for the
PMF, $\mathrm{Var}(\ln\hat p_b-\ln\hat q_b)\approx2/(Np_b)$ weighted by $p_b$, so
$\mathbb E[\mathrm{PMF}]\approx2K/N$, plus a large extra term from bins seen by one set only
(baseline $10^{-6}$). Real-data check on mdshare trajectory 1 (disjoint random panels, ScoreMD PMF
on 64 bins, natural-log JS on 64×64 combined-range bins): N = 2,000 / 20,000 / 50,000 / 100,000 give
PMF 5.22 / 0.300 / 0.096 / 0.042 and JS 0.130 / 0.0187 / 0.0084 / 0.0047 with 729 / 1,219 / 1,416 /
1,555 occupied bins (**checked here**), matching the documented 0.31/0.094/0.043 and
0.019/0.008/0.005 (`evaluation-metrics.md`). At 100k, $2K/N=0.031$ vs 0.042 measured and
$K/4N=0.0039$ vs 0.0047: right order, ~25% low. BBA paper-PMF floors (PR #1138): 0.56 (20,000),
0.18 (50,000), 0.080 (100,000), 0.039 (200,000), 0.025 (325,039); N × floor ≈ 8,000 from 100k on, so
≈0.006 at 1,300,156 (extrapolated, not measured).

**3.6 Rare-basin arithmetic (ALDP5 v1).** p_ref = 319/50,000 = 0.00638 → 12.76 expected αL hits at
N = 2,000; 13 hits give the exact 95% interval 0.3465%–1.1090%; zero hits have upper limit 0.1843%
(`aldp5-b3-proposal.md`; all three **checked here**). Power to detect a deficit (0.025 tail):
N = 2,000 → 38.64% (50% deficit) / 5.92% (20%); 20,000 → >99.99% / 63.83%; 50,000 → >99.99% / 96.53%;
100,000 → >99.99% / 99.97%. Equivalence power within ±20% at true q: 0% at n = 2,000 and 8,000,
20.8% at 20,000 (`aldp5-superiority-design.md`). With zero failures the one-sided upper failure rate
is $1-0.05^{1/n}$: 0.1497% / 0.0374% / 0.0150% at n = 2,000 / 8,000 / 20,000.

**3.7 A bound that shows why seeds, not samples, cost.** Bounded PMF scores lie in $[0,B]$,
$B=(\ln10^6)^2=190.8684$; Hoeffding needs $S\ge2\ln(40)B^2/0.5^2$ = 1,075,109 seed pairs for a ±0.5
95% half-width (`aldp5-superiority-design.md`; **checked here**). Normal-model sizing: primary-only
80% power needs 128, 34, 10, 5 pairs at standardised slack 0.25, 0.5, 1, 2.

**3.8 Strain-energy reference (checked here).** For 7 independent Gaussian coordinates
$E=\chi^2_7/2$: median 3.17 $k_BT$ and $P(E>10)=P(\chi^2_7>20)=0.56\%$, the documented "3.2 and
0.56%"; MD panels give 3.2 $k_BT$ and 0.70% (held-out) / 0.55% (training) (`evaluation-metrics.md`).

**3.9 Integrator widening (derived here).** For $du=-ku\,dt+\sqrt2\,dW$, Euler–Maruyama has
stationary variance $\tfrac1k(1-kh/2)^{-1}$, so the spread ratio is $\approx1+kh/4$ — the
diagnostic used in the step-size test (`evaluation-metrics.md`).

**3.10 Stein check on a Gaussian (derived here).** If $u\sim\mathcal N(\bar u,s^2)$ along $e$ and the
model force is $g=-k'(u-\bar u)$, the check gives $k's^2=k'/k$ with $k=1/s^2$: a ratio 0.25 means a
force four times too soft (production-floor flat ALDP5 bonds: 0.20–0.29).

**3.11 Budget arithmetic of the ScoreMD reference (checked here).** Batch 1,024 with incomplete
batches dropped: ALDP5 50,000 rows → 48 updates/epoch, 1,000 epochs = 48,000 (first stop), 10,000
epochs = 480,000; cosine horizon floor(10,000·50,000/1,024) = 488,281. BBA 1,300,156 rows →
1,269 updates/epoch, 150 epochs = 190,350, 1,500 epochs = 1,903,500; cosine horizon 1,904,525
(`scoremd-cartesian-baseline.md`).

---

## 4. Key empirical results (system, budget, metric, seeds, source)

**4.1 The data themselves (checked here from local files).**

| Dataset | φ>0 / αL | αR | β/PII | Other facts |
|---|---|---|---|---|
| mdshare traj 0 (train), 250,000 frames | φ>0 3.24% | 35.9% | 60.8% | bond sd 0.025–0.031 Å, angle sd 2.9–3.3° |
| mdshare traj 1 (held-out) | 1.65% | 34.8% | 63.5% | docs: 64% / 35% / 1.7% |
| mdshare traj 2 | 4.11% | 33.9% | 62.0% | |
| bgmol v1 50,000 rows (benchmark boxes) | αL 319 | 18,076 | 28,008 | other 3,597 |

Bond means (mdshare): C–N 1.332, N–Cα 1.468, Cα–C 1.546, C–N′ 1.339 Å; angles 124.6°, 113.1°,
117.3°. The bgmol 1 µs source has 5,983 αL frames (0.5983%) in five groups, 1.78% in its final
200 ns versus 0.20% in its first 400 ns (`docs/investigations/aldp-temporal-coverage.md`).
mdshare time scales: bonds/angles < 1 ps; φ libration ≈10 ps; ψ libration 20–50 ps; αR↔β hop
100–200 ps (≈9,200 visits per trajectory, dwell 6–7 ps αR / 20 ps β); αL hop 5–20 ns (37 visits per
trajectory, dwell 110–280 ps); equilibrium widths φ 41° globally (32° for φ<0), ψ 78° globally and
50–52° within αR or β (`docs/theory/25-information-geometry-lag-noise-posterior.md`). The φ>0
indicator has τ = 900–1,300 ps, i.e. 96–139 independent samples per trajectory; populations 3.2%
(95% 0.4–7.0%), 1.6% (0.0–4.6%), 4.1% (1.1–7.9%); MSM implied time scales 1,419 ps then 69 ps; ALDP
TIC1/TIC2 time scales 105 and 65 ps at lag 10 ps (`joint-distribution-metrics.md`).

BBA held-out (325,039 frames): mean Rg 10.602 Å; 5/50/95% 8.37 / 9.89 / 15.30 Å; Rg shares
<8.5 / 8.5–9.5 / 9.5–11 / ≥11 Å = 0.078 / 0.319 / 0.299 / 0.304 (**checked here**; docs give 10.60 Å,
8.37/9.89/15.30, and 0.08/0.32/0.30/0.30 on training frames). Folded share (≥60% native contacts)
0.194, compact non-native 0.187 (`bba-internal-loud-modes-first-chunk.md`). Bond mean 3.833 Å,
sd 0.057 Å; mean contact probability (<10 Å, |i−j|≥3) 0.227; TIC1 range −1.15…1.99, TIC2 −2.93…2.97
inside the fixed limits; corr(TIC1, Rg) = −0.44, corr(TIC2, Rg) = −0.03 (20,000-frame subsample,
**derived here**). P(χ>0) = 0.17 / 0.27 / 0.37 / 0.47 by the same Rg bins, 0.35 overall. Fitted
collective modes overlap the Rouse cosine modes by 0.99, 0.99, 0.91, 0.92; mode mean squares
15.0, 6.0, 2.9, 1.3, 0.49 (feature units); first mode 83%, first two 96% of the size response
(`lab/2026-11-18-range-order-mechanisms`). Sequence of the 28 Cα (local `bba.pdb`):
EQYTAKYKGRTFRNEKELRDFIEKFKGR. "Hairpin" beads 0–12, helix beads 14–25 (lab handedness entries).

**4.2 ALDP5, Sprint 11 feature-space evaluation (#765; mdshare traj 0 training, 20,000 molecules vs
traj 1; 3 seeds; seed means; floors split-half/train/traj2)** (`feature-space-evaluation.md` §4):

| Metric (floors) | Arm | 1k | 5k | 20k | 200k |
|---|---|---|---|---|---|
| φ/ψ JS (0.0185/0.0214/0.0226) | flat low floor | 0.0256 | 0.0210 | 0.0206 | 0.0207 |
| | spring | 0.0312 | 0.0214 | 0.0205 | 0.0201 |
| φ/ψ PMF k_BT² (0.318/0.394/0.404) | flat low floor | 0.492 | 0.349 | 0.349 | 0.355 |
| | spring | 0.588 | 0.379 | 0.356 | 0.332 |
| Bond W1/σ (0.010/0.017/0.011) | flat low floor | 0.186 | 0.068 | 0.046 | 0.015 |
| | flat production floor | 0.981 | 0.173 | 0.291 | 0.422 |
| | spring | 0.018 | 0.013 | 0.012 | 0.013 |
| | learned | 0.020 | 0.016 | 0.016 | 0.015 |
| | wδ | 0.042 | 0.018 | 0.014 | 0.018 |
| Validity (0.9870/0.9856/0.9862) | flat production floor | 0.4731 | 0.9640 | 0.9964 | 0.9996 |

Joint stiff C2ST AUC (floors 0.501/0.501/0.506): spring 0.521/0.502/0.500/0.500/0.500 at
250/1k/5k/20k/200k; flat low floor 0.866/0.620/0.529/0.512/0.500; production floor
0.995/0.907/0.655/0.795/0.914 (worse with training) (`joint-distribution-metrics.md`). Handedness gap
0.002–0.004 for every arm, floors 0.000–0.006. Rare-basin ΔF of trajectories: 3.40 (train), 4.09
(held-out), 3.15 (traj 2) $k_BT$, so every model inherits ≈0.7 $k_BT$ P3 error against traj 1.

**4.3 ALDP5 force fields (Sprint 11, Brownian dynamics, 200k steps, 3 seeds)**
(`force-field-simulation.md`): Stein ratios in stiff directions 1–3 / 4–7: flat low floor 0.91–1.00 /
0.60–1.04; production floor 0.20–0.29 / 0.42–0.69; learned 0.96–1.00 / 0.93–1.01; spring
0.97–1.03 / 0.91–0.99; wδ 0.85–0.99 / 0.60–1.04. Simulated bond W1: spring 0.064, learned 0.072
thermal widths; production floor >1.1. Flat low floor drifts to wrong populations (JS 0.08–0.19; one
seed 83% αR vs 35%). The "flat dilemma": ScoreMD reports the same split between its "Diffusion"
(t = 10⁻⁵; samples well, simulates poorly) and "Two For One" (t = 0.02; stable, simulated C–N bond 23×
further from MD, Table 12) baselines.

**4.4 Sprint 12 first chunks (seed 0, full data; ALDP5 48,000 updates/50,000 molecules; BBA
190,350/100,000)** (`matched-results.md`): ALDP5 Cartesian bond 0.004558 Å, angle 0.7242°, pop JS
0.01408; internal 0.000225 / 0.0215 / 0.00799; floors pop JS 0.00326–0.00375 (ALDP5),
0.00868–0.00910 (BBA). BBA Cartesian bond 0.415335 Å, angle 5.2430°, Rg 0.071874 Å, pop JS 0.02670;
internal 0.000274 / 0.1664 / **0.520774** / 0.01236; whitening 0.704777 / 24.4406 / 0.497316 / 0.34350
(96,271/100,000 decoded).

**4.5 BBA range and order (50,000 updates, 20,000 molecules, seeds 0/1)** (`bba-range-and-order.md`
Table 1): floor bond 0.0005 Å, angle 0.12°, torsion 0.57°, Rg 0.016 Å, contacts 0.0018, pop JS
0.037, overlap 0%. Cartesian+distances 0.0125/0.0133 Å, 2.38/2.19°, Rg 0.109/0.073; C3
0.0007/0.0006, 0.23/0.23°, Rg 0.493/0.462, overlaps 14.8%/12.5%; internal+2 loud modes
0.0006/0.0007, 0.26/0.27°, Rg 0.106/0.110, overlaps 24.4%/17.2%; with late repulsion overlaps
2.0%/1.3%. Readable windows $t_{1/2}$ (Cartesian / C3 / whitened): bonds 0.0004 / 0.26 / 0.26; angles
0.05 / 0.35 / 0.33; torsions 0.08 / 0.35 / 0.29; Rg 0.47 / 0.27–0.28 / 0.35; long-range distances
0.44 / 0.24 / 0.33 (Table 4).

**4.6 Registered budget (190,350 updates, 100,000 molecules, two seeds "a / b")**
(`real-budget-study.md`, 2026-11-15): ordered internal (loud modes): bond 0.00038/0.00033 Å, angle
0.20/0.19°, size 0.117/0.091 Å, contacts 0.0081/0.0071, population 0.0125/0.0130, clashes
0.60%/0.66% (late repulsion: 0.02%/0.02%). Native ScoreMD 0.042/0.042, 1.58/1.74, 0.157/0.532,
0.0116/0.0221, 0.0209/0.0290. Cartesian+distances 0.0078/0.0093, 1.58/1.49, 0.071/0.077. Covariance
base 0.0053/0.0065, 1.36/1.30, 0.073/0.077. C3 0.00032/0.00034, 0.21/0.18, 0.455/0.418. wδ
0.027/0.034, 1.73/2.12, 0.062/0.072. Springs 0.40/0.35, 7.9/6.9. Whitening 0.56/0.62, 19.6/23.9,
0.67/0.58 (clashes 10.9%/6.9%). Simulation (256 data starts, 100 ps, 325 K, pooled 50–100 ps):
ordered internal at force level 0.02: bond 0.0038 Å, angle 2.8°, size 1.14 Å; C3 0.0033 / 2.9 / 0.84;
covariance base at 10⁻⁴: 0.0053 / 4.5 / 1.85; native ScoreMD at 0.01: 0.28 / 5.3 / 3.2. Panel
reference (256 data molecules, no dynamics): bond 0.0046 Å, angle 1.0°, size 0.14 Å (32-set 5–95%
range 0.08–0.35 Å), contacts 0.016. No model is stable over 100 ps; size error grows from 0.2–0.5 Å
(first 10 ps) to 0.7–1.4 Å (last 10 ps) for the internal models.

**4.7 Full schedule (1,903,500 updates, one seed each; PR #1104, 2026-11-18; leaderboard cache)**:
ordered internal seed 2: Rg W1 0.111 Å (0.117 at 190,350, 0.120 at 380,700), bond 0.00027 Å, angle
0.227°, contacts 0.00903, pop JS 0.01129; C3 seed 0: Rg 0.455 Å, bond 0.00028, angle 0.1955°, contacts
0.01497, pop JS 0.01227. Joint hard-core rebuild: overlaps 11.8% → 0%, Rg 0.111 → 0.105 Å. Force at
t = 0.05 with the immersion volume term: size 0.118 Å over 90–100 ps (0.24–0.34 Å for the
190,350-update models), 19% overlap; with the #1109 correction 0% overlaps, size 0.152 Å.

**4.8 Paper-definition PMF on BBA (PR #1138, open, 2026-11-18; 100,000 molecules against the
1,300,156-frame training split)**: covariance base (1,903,500) 0.096 (JS 0.011); ordered internal
(1,903,500) 0.097; ordered (380,700) 0.109/0.109; internal (1,903,500) 0.113; Cartesian (190,350)
0.116/0.113; wδ 0.161/0.198; native ScoreMD 0.202/0.315; springs 0.54/0.36; whitening 2.27/4.40;
floor 0.080 ± 0.001 (JS 0.0095). Paper Table 1 (1,300,156 samples): conservative diffusion iid
0.034 ± 0.000, ScoreMD iid 0.234 ± 0.001, ScoreMD simulation 0.254 ± 0.005, Two For One simulation
1.624. Caveat in the PR: the 100k floor exceeds the paper's best value; no direct comparison.

**4.9 Count dependence across systems.** Sprint 12 floors (leaderboard cache, 8 resamples,
**checked here**): BBA pop JS 0.246–0.267 at 1,000, 0.103–0.109 at 5,000, 0.00868–0.00910 at
100,000; BBA pop PMF (project variant) 8.02–9.14 / 2.28–2.51 / 0.074–0.080; ALDP5 pop JS
0.103–0.118 at 1,000 and 0.00326–0.00375 at 50,000. The 1,000-molecule training monitors of the
C3 full-schedule run (400,000 → 1,903,500 updates) sit at pop JS 0.252–0.265, i.e. on the
1,000-sample floor, while its 100,000-molecule endpoint scores 0.01227.

---

## 5. Why it was promising, why it failed, what was learned (evaluation/data view)

**Derived facts.**
- In Cartesian coordinates the smallest trained noise (t = 0.01) is wider than a bond, so a flat model
  trained there can never see bonds resolved; the Tweedie step then shrinks them (3.3). Training to
  10⁻⁵ fixes bonds but leaves a noisy low-noise torsion force (3.1; force-field report).
- Torsion and rare-basin metrics on ALDP5 are limited by the reference MD: the training trajectory is
  itself distinguishable from the held-out one (C2ST 0.512, MMD p = 0.025), the three 250 ns
  trajectories disagree on φ>0 by 1.6–4.1%, and ΔF errors ≈0.7 $k_BT$ are inherited
  (`joint-distribution-metrics.md`). This is why ALDP5 could rank stiff geometry but not populations,
  and why ALDP5 "has no separation between local and global structure" and cannot test order
  (`docs/roadmap.md`).
- JS and PMF floors grow roughly like 1/N (3.5); comparisons across counts are invalid; 2,000
  molecules cannot rank BBA populations (PR #895: 2k PMF advantage reverses at 100k).
- On BBA, pooled metrics can hide compensating errors: an untrained internal model has the data's
  mean size through self-overlapping chains; matching every marginal leaves Rg W1 0.48–0.52 Å; 92% of
  C3's excess $\langle R_g^2\rangle$ sits in pairs ≥11 apart (`bba-range-and-order.md` §1).

**Measured failure mechanisms (Sprint 12, from the eval side).** Springs put each channel's
population sd (0.037) below σ(t_min) = 0.045 after one global RMS divisor of 27.1; whitening spends
94% of its low-noise loss on 3,225 directions normal to the molecule (3,303 invariants for 78
degrees of freedom); internal coordinates leave Rg the least resolved observable; the Cartesian
network could not read distances until distance inputs were added (bond 0.76 → 0.013 Å)
(`bba-local-geometry-preconditioning.md`).

**Hypotheses and their status.** Range and order (status 2026-11-14) is a hypothesis "to test, not a
filter"; Q2/Q3/Q5 confirmed for generation at the registered budget, order "not seen in simulation";
Q4 (readable windows predict ranking) not tested (`real-budget-study.md`).

**Corrections recorded along the way.** GPU-sampled feature-space numbers superseded (2026-10-26);
BBA/Chignolin "MD" withdrawn (2026-10-19); the joint-metrics evaluation caught two of its own defects
(combined-range histogram edges hid shifts; a "random" panel was a contiguous block, frames 0–21,748);
"error accumulation along the chain" as the explanation of C3's swelling was corrected by #1055 (at
most 0.14 Å of the 0.49 Å); the Sprint 11 learned-warp "too coarse bgmol" claim was a misreading;
the BBA "1 ps" lag pairs are actually ≈200 ps apart (frame index, documented 200 ps interval matching
the published 325 µs total).

---

## 6. Data for visuals and visualization opportunities

### 6A. Local data inventory (read-only inspection, 2026-11-19)

| Asset | Path (under `LOCAL/`) | Format, shape, size | Provenance / caveat | Extraction |
|---|---|---|---|---|
| bgmol ALDP, time-ordered, all 22 atoms | `data/deshawresearch/aldp.npy` | float32 (1,000,000, 22, 3), nm, 264 MB | implicit solvent, 300 K, 1 ps; benchmark source | `np.load(..., mmap_mode='r')[:, [4,6,8,14,16]]*10` → ALDP5 Å in time order; full 22 atoms for rendering (atom 10 = Cβ) |
| ALDP5/5v processed splits | `data/processed/aldp5_{train,val,test}.npy`, `aldp5v_*` | (800,000/100,000/100,000, 5 or 6, 3) Å | shuffled (seed 42); first 50,000 train rows = v1 membership; `input_scale` 0.94181 | slice `[:50000]` |
| mdshare ALDP | `data/mdshare/alanine-dipeptide-3x250ns-heavy-atom-positions.npz` | `arr_0..2`, each (250,000, 30) float32 nm, 90 MB | explicit solvent, 1 ps, 3 trajectories | `.reshape(250000,10,3)[:, [1,3,4,6,8]]*10` |
| authentic BBA | `data/deshawresearch-bba-ca28/{train,heldout}.npy`, `membership.npz`, `data.json` | (1,300,156, 28, 3) and (325,039, 28, 3) float32 Å; ids int32; 437 + 109 MB | DESRES 2011, centred, proper-Kabsch aligned | sort rows by `membership` id to rebuild **continuous trajectories** (ids < 1,114,545 → file 0); lag-1 RMSD median 1.69 Å vs 5.21 Å random, Rg lag-1 autocorrelation 0.924 (**checked here**); 200 ps per frame documented, not measured |
| dummy chignolin/BBA | `data/deshawresearch/*.h5`, `data/processed/bba_*`, `chignolin_*` | HDF5 / npy (56,000 BBA train) | **model-generated**, not MD | do not use as MD |
| BBA TICA | `configs/benchmarks/bba-ca28-tica.json` (snapshot) | 403×2 coefficients + mean | frozen paper transform | numpy port in `experiments/stiffness/bba_metrics.py::tica_features` |
| BBA collective modes, chart tables | `runs/range-order-mechanisms-20261118b/collective_modes.json`, `bba_charts.json`, `signal-*.json` | 27 mode vectors (27×27), mean squares; t_half, handedness tables | fitted on 1,300,156 frames | JSON as is |
| ALDP5 generated, along training | `runs/feature-space-evaluation-2026-10-26/remote/full/<arm>_s<seed>_step<k>_samples.npz` | `clouds` (20,000, 5, 3) float32 Å + `decoded`; 5 arms × 3 seeds × 10 checkpoints (250…200,000) | #765 fixed sampler; arms flat-lowfloor, flat-trusted, learned, spring, wdelta | per file ≈1.2 MB |
| ALDP5 simulated | `runs/force-field-simulation-2026-10-26/sim-*/…_samples.npz`, `sim-beta/*_trace.npz` | frames (20,000 or 15,000, 5, 3); β-relaxation φ/ψ traces (201 records × 500 walkers) per arm/seed | Brownian dynamics, Sprint 11 | traces are ideal for animation |
| ALDP5 readable-window data | `runs/information-retention-aldp5-20261104/rows.csv` (+ `results.json`) | 3,264 rows: channel × 16 times (1e-5…1) × seed × predictor × block | flat-lowfloor vs spring16, held-out traj 1–2 | retained fraction per block |
| BBA generated (local subset) | `runs/s12-linear-final-results-20261109/.../physical-endpoint-00190350-n100000.npz`; `.../endpoint-00190350/samples.npz`; `runs/bba-score-preconditioning-20261111/pilot-analysis-input-v1/*/endpoint/samples.npz` | 100k: observed bonds (100000,27), angles (100000,26), Rg, contact probs (325), TIC coords (100000,2); clouds (100000,28,3) float64; pilot clouds (5,000, 28, 3) | linear-correction models (Cartesian/springs/whitening) and Cartesian/spring pilots only | main study models (C3, loud modes, ScoreMD, covariance base, wδ) are **not local** (`runs/s12-bba-study-20261114/` on LISE + storage server) |
| Logged results | `.local/leaderboard/cache/main/{runs,metrics}.parquet` | 11,886 runs, 1,265,002 metric rows, synced 2026-11-18 23:06 | includes `s12-bba-registered-budget-study`, `s12-bba-full-schedule`, `s12-bba-longer-training`, `s12-physical-distance-edges`, `s12-scoremd-cartesian-reference`, `floors`, Sprint 11 experiments | pandas; metric keys carry axes, e.g. `x_rg_w1_A/initialization:md/simulation_step_fs:2/force_time:0.02/window:90-100/...` |
| Histograms | `.local/leaderboard/cache-production/production/artifacts/<run>/hist/phi_psi/step_*.npz` | 441 φ/ψ 64×64 count matrices + edges | `s11-supervisor-conservative` (40 runs) and one floor | direct |
| Evidence JSON in repo | `docs/investigations/{feature-space-evaluation,force-field-simulation,joint-distribution-metrics}/evidence.json`, `docs/sprints/sprint12/matched-results-evidence.json`, ... | compact seed means/std per checkpoint, floors | authoritative compact summaries | JSON |
| Existing figures/decks | `runs/talk-noe-20261118/` (range-and-order talk, `figs.py`, `mol.py`), `runs/range-and-order-analysis-20261118/range-and-order.pdf`, `runs/presentations/supervisor-meeting-2026-10/` (thermal-metrics deck), PNGs under `docs/investigations/*/` | | | style references |

**Python environment.** `LOCAL/.venv` (Python 3.11.14) imports numpy 2.4.6, scipy 1.17.1, pandas
2.3.3, pyarrow 24.0.0, jax 0.10.0, flax 0.10.4, matplotlib 3.11.0, mlflow 3.14.0, scikit-learn 1.9.0;
not h5py, mdtraj or deeptime. Its editable install points at `LOCAL/src`, which is checked out on the
unrelated branch `supervisor-metric-comparison`, so "import riemanniangenerativemd" would load branch
code. Standalone numpy scripts run with `-I` worked for every check above (all under a second or two);
`uv.lock` exists in the snapshot. Nothing was installed or synced.

### 6B. Visualization ideas

1. **"Five beads out of twenty-two."** All-atom ALDP from `aldp.npy` fades to the five kept beads
   (C, N, Cα, C, N), bonds/angles/φ/ψ labelled; the trajectory plays at 1 ps/frame while a point traces
   the Ramachandran plane with basin boxes and live populations. Data: a 5,000–20,000-frame window
   (5 beads × 3 × 2 bytes per frame ≈ 30 B → ≈0.6 MB at 20k frames). Pitfall: do not mix the bgmol
   (implicit, φ>0 ≈0.6–0.8%) and mdshare (explicit, φ>0 1.7–4.1%) maps under one title.
2. **"Stiff and soft in the same molecule."** Side-by-side histograms in physical units: bonds
   ±0.025–0.031 Å, angles ±2.9–3.3°, φ/ψ spanning hundreds of degrees; then the same in Cartesian
   displacement (bond ≈0.03 Å vs torsion ≈0.5 Å). Overlay κ = 184 (ALDP5), 1,780 (ALDP10) vs 3.0
   for the learned warp. Computed from mdshare; κ quoted.
3. **"A ladder of time scales."** Log time axis 1 fs → 325 µs: bond/angle (<1 ps), φ libration
   (≈10 ps), ψ libration (20–50 ps), αR↔β (100–200 ps), αL (5–20 ns), BBA frame spacing (200 ps), BBA
   total (325 µs), simulations run here (2 ps, 100 ps, 1 ns planned). Autocorrelation curves computed
   from mdshare (bond length vs φ>0 indicator).
4. **"The rare basin is a barcode."** φ>0 occupancy over each 250 ns mdshare trajectory as a strip;
   37 visits, τ ≈ 900–1,300 ps, ESS 96–139; populations 3.2/1.6/4.1% with intervals. Insight: no model
   can be ranked on αL with this data. Same for the bgmol 1 µs (5 groups, 1.78% in the last 200 ns).
5. **"Meet BBA."** A real folding/unfolding movie reconstructed from `train.npy`+`heldout.npy` sorted by
   membership id (frames 200 ps apart), with Rg trace, TIC1/TIC2 point, contact map and folded-share
   indicator; hairpin (beads 0–12) and helix (14–25) coloured. Pitfall: frames are aligned and centred
   per cloud (global rotation removed), 200 ps is documented not measured, and folding events are rare
   on a short window — choose the window by scanning Rg/TIC first.
6. **"The BBA landscape."** 2-D free energy on TIC1/TIC2 from the frozen 403-feature transform
   (exactly reproducible), with Rg as colour; histogram of Rg with quantiles 8.37/9.89/15.30 Å and the
   size-bin handedness P(χ>0) = 0.17/0.27/0.37/0.47.
7. **"The noise ruler."** An animated slider in t showing σ(t) (table 3.1) against physical widths:
   ALDP5 bond width 0.025 Å, BBA bond 0.057 Å, BBA collective modes; the t_min marks 10⁻⁵ and 0.01, the
   force times 0.01/0.02/0.05, the SNR = 1 point t = 0.259. Insight: the same t is not the same
   physical blur in different coordinates.
8. **"Readable windows as erasure curves."** For ALDP5 plot $R_h(t)$ per probe block from `rows.csv`
   (flat-lowfloor vs spring16); for BBA draw Table 4 and the analytic $t_{1/2}(\lambda)$ ladder for the
   27 Cartesian modes (1,423 spread) vs whitened (all at 0.26) with the γ dial. Pitfall: measured values
   are lower bounds; quote the axis (t vs log-SNR).
9. **"Why the production-floor flat model over-sharpens."** Interactive Gaussian toy (3.3): slider for
   leftover noise $s$; the denoised bond histogram narrows to $w/\sqrt{w^2+s^2}$; overlay the observed
   0.44–0.53 and the C2ST rising from 0.655 (5k) to 0.914 (200k). Real bond histograms from mdshare.
10. **"Learning curves you can watch."** Ramachandran map and bond histogram per arm, animated over
    the 10 checkpoints (250 → 200,000) from the #765 samples, with floors as fixed reference panels;
    the saved view `sprint11-stiff-vs-torsion-plane` (x = PMF held-out, y = bond W1/σ) drawn as a path
    per arm. Pitfall: the figure panel and protocol panels differ (PMF shifts up to 0.05 $k_BT^2$).
11. **"Relaxation from β."** 500 walkers per arm from `sim-beta/*_trace.npz`: dots on the Ramachandran
    plane flowing from β; flat low floor overshoots to 61%/91% αR, one wδ seed stuck near 6%, learned/
    spring rise toward 35% (16–29% at 60,000 steps).
12. **"Floors depend on how many molecules you draw."** Log–log plot of measured floors vs N: ALDP5 JS
    and PMF (2k…100k, table 3.5), BBA paper-PMF (0.56 → 0.025, N × floor ≈ 8,000), BBA population JS
    (0.26 at 1k, 0.106 at 5k, 0.037 at 20k, 0.0089 at 100k); markers for the paper's 1,300,156 and the
    project's 100,000; the paper's best 0.034. Interactive two-histograms-of-one-distribution toy shows
    sparse bins at small N. Pitfall: different metric definitions (outside cell, limits, density vs
    counts) give different floors — keep one definition per panel.
13. **"What each metric looks at."** One BBA sample set exploded into its readouts: 27 bond and 26
    angle histograms (W1), Rg histogram (W1), the 325-pair contact-difference map (red/blue), TIC
    difference map (JS), clashes (<1 Å) and overlaps (<3.5 Å). Data: the local 100k physical-endpoint
    npz files (linear-correction models) contain exactly these arrays; for the main study models only
    scalar results are local (leaderboard cache).
14. **"Local against global."** The saved leaderboard plane (PR #1127 `s12-bba-final-plane`): angle W1
    vs Rg W1, log axes, 100k molecules, one point per model; animate budgets (50k → 190,350 → 380,700 →
    1,903,500) for the ordered and plain internal models from the cache. Internal family sits at
    angle ≈0.2° / Rg ≈0.45 Å, Cartesian family at ≈1.3–1.6° / ≈0.07 Å, the loud-mode model moves to
    ≈0.2° / ≈0.1 Å; floor at 0.048–0.057° / 0.0076–0.012 Å.
15. **"Size is long range."** Heat map of $W_{kl}$ and of $\Delta B_{kl}$ for BBA (identity 2.7): show
    that bond-vector correlations ≥11 apart carry 92% of C3's excess $\langle R_g^2\rangle$, invisible in
    pooled Rg W1. Computable exactly from local BBA frames; generated $B_{kl}$ from local samples
    (Cartesian/springs/whitening) or a schematic for C3.
16. **"Forces drift."** Size error vs simulated time (windows 0–10, 40–50, 90–100 ps) per model, data vs
    generated starts, force times, from the cache; panel reference band 0.08–0.35 Å. Insight: all models
    compact; internal models drift least. Pitfall: post-hoc choice of the better force level.
17. **"Checking a force without forces."** Stein toy (3.10) and the per-direction bar chart for ALDP5
    (0.20–0.29 vs ≈1); then Euler–Maruyama widening 1 + kh/4 (3.9).
18. **"Mirror images."** ALDP: (φ, ψ) → (−φ, −ψ), the handedness-gap test (0.002–0.004 ≈ floor); BBA:
    χ from three collective modes, compact frames strongly handed (P(χ>0) = 0.17). Generated loud-mode
    molecules 25.6%/24.7% vs 24.9% (Rg < 9.5 Å).
19. **"The pipeline as a flow diagram."** Frames → map F → VP noise → network (bead tokens, distance
    edges) → reverse 1,000 steps → Tweedie → decoder → physical observables → floors → MLflow run
    (arm × seed × task × protocol) → leaderboard views. Include the force read-out branch
    $J_F^\top\alpha s+\nabla\log\sqrt{\det G}$ and the late-repulsion switch at t ≤ 0.02.
20. **"Cartesian vs internal noise on a real BBA molecule."** Noise one held-out frame at the same t in
    Cartesian coordinates and in internal coordinates (standardised log lengths, log half-angle
    tangents, phase pairs), rebuild with the transfer matrix of 2.1, and show what survives. Pitfall:
    C3 uses full-covariance whitening fitted on training frames; a diagonal standardisation is an
    approximation to be labelled.
21. **"Eleven weeks of rulers."** A timeline of the evaluation protocol itself: Sprint 1 JS (base 2),
    Sprint 8 ScoreMD calibration (0.0151 vs 0.0114), v1 benchmark (2026-10-08), the dummy-data
    discovery (10-19), #765 pre-declared protocol (10-26), joint metrics (10-27), real BBA (11-01),
    Sprint 12 physical readout (11-08), registered budget (11-15), paper PMF (11-18).

---

## 7. Open questions, caveats, contradictions, superseded interpretations

- **`docs/DATA_STATE.md` is stale on data sources** (written at the 2026-10-23 cleanup): it lists only the
  dummy HDF5 files and bgmol ALDP; neither `data/deshawresearch-bba-ca28` (real BBA, prepared
  2026-11-01) nor the mdshare file is documented there.
- **Two ALDP5 datasets.** Sprint 11 used mdshare (explicit solvent; held-out φ>0 1.7%); Sprint 12 and
  the v1 benchmark use bgmol (implicit; αL box 0.638% in the 50,000 membership; 0.5983% over 1 µs;
  `REF_ALPHA_L_FRAC = 0.0060` in `ramachandran.py`). Their 1 ps φ/ψ steps differ by 26–35%
  (`learned-stiffness-warp.md`). Results across the two must not share an axis.
- **Basin definitions differ:** v1 boxes (αL [0,120)×[−20,120), αR [−120,0)×[−100,50), β
  [−180,0)×[50,180)) vs Sprint 11 (β/PII φ<0, ψ≥60°; αR φ<0, ψ<60°; φ>0).
- **ScoreMD Table numbering.** `aldp5-evaluator.md` (2026-10-08) says Table 11 is a six-bead
  force/simulation comparison, not the five-bead iid benchmark; `force-field-simulation.md`
  (2026-10-26) cites "Table 11" for five-bead iid JS 0.008 and PMF 0.095–0.098; `ramachandran.py` calls
  PMF "their Table 11". Possibly different arXiv versions; unresolved in the docs.
- **BBA mean size:** 10.70 Å (2k training panel, `reference-targets.yaml`) vs 10.60 Å (held-out; local
  geometry and first-chunk docs; 10.602 checked here) — panel effect, but both appear as "the data".
- **Rare-basin counts:** "37 visits per trajectory" (note 25; status says "37 independent αL visits")
  vs "96–139 independent samples" (N/2τ, joint metrics) — different quantities.
- **Population metric variants** (project pop JS with outside cell; PR895 TIC JS on fixed limits;
  paper JS inside limits; project pop PMF; paper PMF; Sprint 11 ALDP TIC PMF as RMS of −ln p on
  40×40) give different values for the same data, and so does the choice of floor panel: the project
  pop JS floor at 100k is 0.0087–0.0091 with training-frame panels but 0.0095 with held-out frames
  (`bba-internal-loud-modes-first-chunk.md`); the paper-definition JS floor in PR #1138 is also 0.0095.
- **Held-out ≈ in-sample on BBA:** training and held-out frames are random frames of the same
  trajectories with near-copies 200 ps apart (`real-budget-study.md` limits; note 27).
- **The loud-mode candidate and its sampler settings were chosen after 50,000-update results**; its
  pre-registered "Cartesian-level global structure" criterion was missed on one seed (0.117 vs 0.11 Å).
  Five full-schedule models were chosen after stage 1 (amendment recorded in #1104).
- **Native ScoreMD seed spread** is large (Rg W1 0.157 vs 0.532 Å); ties with it come from that spread.
- **Paper-PMF comparison** (PR #1138, open): scored at 100,000 vs the paper's 1,300,156; one inference
  seed; the ≈0.02 "would land near" figure is an inference.
- **Simulation length:** BBA folds on microsecond scales; no simulation here reaches equilibrium
  populations; records are correlated; MD starts favour the reference.
- **Chignolin provenance risk:** the 2026-11-18 loud-mode transfer check used "all 10,000 processed
  Chignolin frames"; per `DATA_STATE.md` the processed chignolin arrays come from the dummy
  (generated) file. The lab card does not state which source it read.
- **`docs/compute.md`** (listed in the assignment) does not exist on `origin/main`; compute facts are in
  `real-budget-study.md` (LISE H200: 13 nodes × 4 GPUs, 24 h limit) and run reports (TITAN RTX, A100).
- **Open PRs at the snapshot:** #1138 (paper PMF), #1127 (saved slide views), #1104 (study card,
  full-schedule results), #1137, #1136, #1113 (loud-mode force-field follow-ups), #1092 (topology
  attention).

---

## 8. Sources read

Read in full: `docs/theory/background/12-proteins-as-point-clouds.md`; `docs/DATA_STATE.md`;
`docs/benchmarks/aldp5.md`, `aldp5-evaluator.md`, `aldp5-v1-decisions.md`, `aldp5-b3-proposal.md`,
`aldp5-joint-power-budget.md`, `aldp5-spending-ledger.md`, `aldp5-superiority-design.md`;
`docs/investigations/evaluation-metrics.md`, `joint-distribution-metrics.md`;
`docs/sprints/sprint12/scoremd-cartesian-baseline.md`, `protocol.md`, `README.md`;
`docs/design/leaderboard-architecture.md`; `docs/design/experiment-logging-format.md` (§1–8);
`docs/design/feature-space-driver.md`; `configs/datasets/*.yaml`, `configs/feature-space/aldp5.yaml`;
`configs/leaderboard/views/*.yaml`, `reference-targets.yaml`, `evaluation-parameters.yaml`;
`configs/benchmarks/bba-ca28-tica.json`; `README.md`; `docs/architecture.md`;
`src/riemanniangenerativemd/data/datasets.py`, `eval/campaign.py`, `eval/ramachandran.py` (header and
layouts), `forward/feature_vp.py`, `forward/vp_schedule.py`; `experiments/stiffness/bba_metrics.py`
(header and readout functions). Read in part: `docs/status.md`, `docs/roadmap.md`,
`docs/sprints/sprint12/real-budget-study.md`, `global-geometry-study.md`, `matched-results.md`;
`docs/investigations/feature-space-evaluation.md`, `force-field-simulation.md`,
`bba-range-and-order.md`, `bba-local-geometry-preconditioning.md`,
`bba-internal-loud-modes-first-chunk.md`, `bba-leaderboard-study.md`, `bead-matched-campaign.md`,
`bead-candidates-comparable.md`, `bead-force-field-simulation.md`, `sprint11-pullback-campaign-closeout.md`,
`information-retention.md`, `aldp-temporal-coverage.md`, `aldp-reference-metric-evaluation.md`,
`minipeptide-transfer-607.md`, `phantom-bead-virtual-cbeta-236.md`; `docs/design/learned-stiffness-warp.md`,
`graph-metric-generation.md`; `docs/theory/01-metric.md`, `25-...`, `27-...`, `29-...`;
`docs/sprints/sprint8/headtohead.md`; `lab/README.md`, `lab/2026-11-18-range-order-mechanisms`,
`lab/2026-11-18-loud-mode-handedness`, `lab/2026-11-18-handedness-gap-torsions`,
`lab/2026-11-19-handedness-gap-arm`, `lab/2026-11-18-loud-mode-transfer-checks`. Archive:
`docs/sprints/README.md` (sprint table), `investigations/metric-path-fidelity.md`,
`investigations/authentic-md-metric-evaluation.md`, `sprints/sprint9/flat-pilot-v1-execution-10.md`.
GitHub: PR #1138 (body and source diff), #1127 (body and view YAMLs), #1104, plus dates/titles of
#765, #895, #985, #998, #1033, #1057, #1069, #1071, #1126 and the 60 most recent PRs. Local data
headers and the small checks marked above (scripts in the scratchpad folder `r8tools/`).
