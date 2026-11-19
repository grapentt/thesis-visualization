# R2 · Era 2 — "What do we actually want from the metric?": stiffness

Reader `r2-stiffness-what-we-want`, written 2026-11-19. Read-only study of the riemannian-generative
docs at origin/main (snapshot of 2026-11-19), the archive tag `archive/pre-cleanup-2026-10-23`, the
history of the theory notes on origin/main (including the long first version of note 20, commit
`dec85338`, 2026-10-23), GitHub PRs/issues, and the Part 1 video of the animation repo.

**Conventions.** Labels in brackets are the source documents' own: **[S]** cited source result,
**[D]** derived in the doc, **[N]** derived and numerically checked, **[M]** measured on molecular
data, **[H]** hypothesis. Everything I computed or derived myself is marked **(derived here)**; all
such numbers were checked with small numpy scripts. Notation: $\theta=k_BT$, $\beta=1/\theta$.
"Trusted" VP schedule (note 21 §2.3): $x_t=\alpha_tx_0+\sigma_t\varepsilon$, $\alpha_t=e^{-B(t)/2}$,
$\sigma_t^2=1-\alpha_t^2$, $B(t)=0.1\,t+9.95\,t^2$, trained $t\sim U[0.01,0.99]$, likelihood weight
$\beta(t)=0.1+19.9t$, 999 Euler–Maruyama reverse steps. ALDP5 = five backbone beads of alanine
dipeptide, shape space of dimension 9 (4 bonds, 3 one–three distances/angles, 2 torsions).
Paths are relative to the rg-main snapshot unless absolute.

---

## 0. The era in one paragraph

Sprint 10 (#520, 2026-10-19 → 2026-10-22) compared candidate metrics (original $w^\delta$, a
planar-compatible $w^\delta$, chemical-feature metrics, flat) under a common physical-density and
force contract and found no metric or noising process that reproducibly beat flat diffusion. Its
closeout recorded that "better conditioning did not reliably improve score risk, rare-basin
populations or generation" and asked future work to change one ingredient at a time. On 2026-10-23
the project restarted from first principles in PR #745 (theory notes 20 and 21, merged 2026-10-24):
*what exactly does a stiffness-aware metric change for learning?* The answer: molecules are stiff
(ALDP5 bond widths 0.025–0.030 Å versus torsional motion 0.2–0.7 Å), and flat diffusion has three
separable problems — **uneven information loss** (isotropic noise erases stiff modes at a noise
level about $\sqrt\kappa\approx20$ times smaller), a **badly scaled target** (score components and
gains spread by $\sqrt\kappa$ and $\kappa$), and a **misweighted loss** (equal relative errors cost up
to $\kappa$ times more in stiff directions) — which a *thermal metric* $G\approx\beta H=\Sigma^{-1}$
fixes through four separately provable effects E1–E4, each tied to a different modelling choice
(noise, target, loss, input units). The spring-force metric $G=J_d^\top WJ_d+\gamma I$ cut ALDP5's
residual stiffness from 97–192 to 8–13. Note 21 sharpened this into a pairing theorem (covector /
Riemannian / whitened score, each with exactly one natural loss and input pairing), a noise-level
metric $G_t$, and the finding that the trusted flat schedule never resolves a bond. Sprint 11 (#769)
then implemented "metric-shaped noise" mainly through flat noise in pullback/feature coordinates:
on ALDP5 bonds reached the data floor about 100× sooner and angles 10–20× sooner, forces passed a
stiff-direction check, but torsions and the rare αL basin gained nothing. On the 28-bead BBA,
stiffness removal for the whole molecule failed for measurable reasons (scale versus noise floor,
redundant normal directions, collective lever arms), explained in note 28. On 2026-11-14 the
project kept stiffness removal **for the stiff coordinates only** and moved to "range and order"
(next era).

---

## 1. Narrative (chronological)

### 1.1 Entering the era: Sprint 10 asks "which metric?" (2026-10-19 → 2026-10-22)

Sprint 10, tracker **#520** (opened 2026-10-19, closed 2026-10-22), "Metric qualification and
interchangeable geometry", compared the original $w^\delta$, a localized planar-compatible
modification, a transferable chemical-feature construction and flat Cartesian geometry
(archive `docs/sprints/sprint10/closeout-520.md`). Several of its pieces are the direct prehistory of
the stiffness view:

- **A common physical contract (#521 → theory note 17, 2026-10-19).** Fix the physical measure
  (centred Cartesian Lebesgue measure pushed to the proper-rotation quotient) *before* choosing a
  metric; every candidate must recover the same clean physical force; a metric changes lengths,
  gradients and noising, "it must not silently change the physical density whose gradient defines
  the force". This is what later lets note 20 say "the force does not depend on the metric".
- **"Structural bias": metrics as bond protection (#528, 2026-10-19).** At matched Cartesian
  displacement, the chemical metric reduced the median infinitesimal bond variance by 38 % and the
  planar metric by 86 %, with median condition numbers 3.4 and 293; planar $w^\delta$
  redistributed displacement toward torsions (median 2.93× flat combined torsional variance;
  chemical 1.23×) (archive status, 2026-10-19 entries). At matched local expected bond disturbance,
  planar permitted 3.70× flat torsional RMS, chemical 1.49× (#529 "physically calibrated metric
  comparison"). This is the stiffness intuition in its first form: noise that does not break
  bonds.
- **Force learning with a metric (#529 → note 18, 2026-10-19).** Using the planar inverse metric to
  *weight the clean force loss* made held-out physical force MSE **5.9–8.2 % worse** than flat in
  all three paired seeds (flat 5537.41 / 5574.86 / 5506.88 vs planar 5918.92 / 5905.14 / 5958.37
  (kJ mol⁻¹ Å⁻¹)², mean difference 387.76, block-bootstrap interval [305.06, 488.26];
  `docs/investigations/endpoint-force-learning-529.md`). Chemical-metric *noising* of force labels
  was 4.3–4.8 % better than flat noising but 66–68 % worse than clean-endpoint fitting; curved
  torsion noising was 37.3–38.3 % better than matched flat noising but only 0.066–0.094 % below the
  clean endpoint, failing its gate (archive status). Note 18 then derived the *correct* finite-noise
  force target for configuration-dependent noise (§2.12 below): attaching a clean force label to a
  perturbed configuration is wrong when the noise covariance depends on the clean state.
- **Density versus force tension (#603, 2026-10-20).** Learning one periodic chemical energy from
  configuration pairs under five geometries: the chemical-prior geometry improved density and basin
  populations in all three seeds but **worsened physical Cartesian force MSE by 13.8–27.8 %** versus
  flat, with worse bond/bending and better torsion errors
  (`docs/investigations/reference-metric-pairs-603.md`). #606 (2026-10-20): a reversible kernel
  mixture reduced force MSE 0.13–3.24 % and density risk 10–24 % while basin populations worsened.
- **The analytical collection (#607 → note 19, 2026-10-20).** "When geometry helps molecular
  sampling and physical forces": exact toy laws (harmonic $K=\mathrm{diag}(100,1)$, misaligned
  mobility, a density-versus-force counterexample, a curved thermal valley with an exact all-time
  score, coupled torsions, entropic forces, mixtures, failing "physical" metrics, kinetics) plus a
  transferable-noising design. Its updated recommendation: "keep flat as the practical baseline";
  graph-OU noising showed no held-out torsion benefit in the six-fit minipeptide transfer pilot.
- **Further Sprint 10 negatives.** Smooth global-density corrections (#612/#613) cut the mixture's
  basin TV from .407–.441 to .022–.035 while keeping its force gain, but flat received much of the
  same repair under matched calibration (#614/#615: mixture 1.36–1.40 % lower mean force MSE, flat
  wins one seed). A harmonic prior consistently improved held-out bond distributions, but no prior/mobility alternative consistently improved torsion populations over flat; exact equalization of graph-mode rates gave no learning advantage (#617, eighteen fits). The
  thermal tree-bond radial transport (#673, `docs/design/thermal-bond-transport.md`) was qualified
  as an exact construction, but every thermal variant lost angular quality after learning
  (#679: thirty fits, 307,200 outputs; #687: 184,320 outputs), so "stop promoting this tested
  construction for generation" (`docs/design/transferable-noising.md`).
- **Closeout (PR #742, 2026-10-22).** Flat stays the default and required comparator; original
  physical-bead $w^\delta$ is a restricted-domain reference (its log-determinant barrier makes
  planarity infinitely distant); chemical/internal geometry is the "most plausible transferable
  research family, still unqualified". Key sentence: "Better conditioning did not reliably improve
  score risk, rare-basin populations or generation. Some constructions changed the metric, prior and
  noising law together, so the cause of an improvement was not identifiable." Methodological
  correction: "choose whether the scientific hypothesis is about the **metric**, **forward
  noising**, **reference distribution**, **force target** or **learning objective**. Change one of
  those at a time."

### 1.2 The turn: restart from first principles (2026-10-23 → 2026-10-24, PR #745)

PR **#745** "Thermal-metric theory: score targets, losses, input units and noise for stiff
molecules" (branch `theory-thermal-metric-foundations`, created 2026-10-23 00:18 UTC, merged
2026-10-24 19:46 UTC, no issue assigned) states the motivation: "Sprint 10 compared several metrics.
Some improved numerical conditioning, but none gave a reliable advantage in generated molecules ...
These notes restart from first principles. What exactly does a stiffness-aware metric change for
learning, which choices belong together, and which claims can be proven?"

- **Note 20, "Thermal metrics on the molecular quotient" (2026-10-23).** First commit `8cecf901f`;
  the long first version (`dec85338`, 1,936 lines) contained the full harmonic tables, "magnifier"
  constructions, design C target check and a linear force study; the merged note is condensed
  (879 lines). Contents: ALDP5 stiffness measured on 200,000 training frames; the covector/vector
  distinction ("sensitivity" vs "motion"); likelihood weighting (Girsanov); three problems of flat
  diffusion and four effects E1–E4 of $G\approx\beta H$ in a harmonic basin; the spring-force metric
  as primary candidate (residual stiffness 97–192 → 8–13); its curvature; exact pullback processes
  and their converse; designs A/B/C; network outputs (bond-attached coefficients); force fields
  (soft forces 4.4× more accurate in a linear test); transferability requirements.
- **Note 21, "Prediction target, loss, inputs and noise for stiff molecules" (2026-10-24).**
  Theorems with proofs: one minimizer for every target/weighting; three forms of one score; the
  Kronecker training-curvature theorem; the **pairing theorem**; the **noise-level metric**
  $G_t$; the schedule-floor proposition (bonds never resolved in training); Prop 8 ("samples feel
  errors in the data covariance norm"); rotating bonds; bond-attached outputs; multimodality. It
  **corrected note 20 in six places** (§8 of note 21; see §7 below). An independent reviewer
  "re-derived the proofs and recomputed the numbers" and found fifteen problems, all missing
  hypotheses, lagging corrections or unlabelled number sources (PR #745 body).
- **Experiment direction.** The long first version recommended *design A first* (flat noise,
  Riemannian target, metric loss) because it keeps every target exact. In the final PR "a
  flat-noise comparison of the targets alone was drafted and then **withdrawn**. Under the trusted
  flat schedule it would never train the bond regime, and it would exclude by construction the
  metric's effect on information loss." The plan became: controlled experiments in which **each
  metric also shapes its own forward process**, with flat diffusion as reference (note 20 §10).

### 1.3 Sprint 11 tests "metric-shaped noise" on ALDP5 (2026-10-27 → 2026-11-16, #769)

Tracker **#769** (opened 2026-10-27, closed 2026-11-16), "Verify and derisk metric-shaped noising
that approximates the thermal stiffness metric", opens with the era's thesis verbatim: "Molecules are
stiff: bonds fluctuate by about 0.03 Å, backbone torsions by about 0.5 Å. Flat (Cartesian) diffusion
therefore destroys bond information long before torsion information, and its score is badly
conditioned. Theory note 20 proposed a *thermal metric*, approximately the inverse local thermal
covariance (Σ⁻¹ ≈ βH), and noise shaped by that metric." The practical route was note 20's design B:
flat VP noise in the coordinates of a map whose pullback metric removes the stiffness.

- **Learned warp (#753, #754, 2026-10-27).** An invertible coupling flow fitted to 1 ps steps cut
  the median local condition number 184 → 3.0 (floor 1.55) on ALDP5 and 1780 → 3.6 on ALDP10.
  Flat diffusion in its coordinates reached the bond/angle data floor within about 1,000 steps;
  no torsion advantage, no data-efficiency gain. At the production floor ($t\ge0.01$,
  $\sigma_{\min}=0.042$ Å) flat diffusion's bond PMF error was 1.2 $k_BT$ against 0.06 for the learned
  coordinates (`docs/status.md`).
- **Notes 22–23 (#755, 2026-10-27).** An equal-dimension flat pullback cannot reproduce the
  (curved) spring metric; the spring-force and $w^\delta$ metrics *are* exact pullbacks of
  higher-dimensional flat feature spaces, at the cost of projecting noisy points back onto
  molecules. This is the hinge to the embedding era.
- **Feature-space evaluation (#765, evidence 2026-10-26/27; supersedes GPU numbers of #757/#760/#763
  after an XLA miscompilation of the final denoising step was found).** Spring features: bonds at the
  data floor about **100× sooner** than the best flat model (≈2k vs 200k steps), angles **10–20×**
  (5k vs 50k–100k), stiff–soft coupling ≈10×; torsions: no early advantage; rare αL basin: flat learns
  the population faster (`docs/investigations/feature-space-evaluation.md`).
- **Force fields (#768).** Forces from the learned-warp and spring models pass a reference-free
  stiff-direction check (0.91–1.03; exact = 1); flat at the production floor is 3–5× too soft on
  bonds (0.20–0.29); flat with the low floor gets bonds right but drifts to wrong torsion landscapes
  in all three seeds (JS 0.08–0.19). "Flat cannot get bonds and torsions right at one noise floor"
  (`docs/investigations/force-field-simulation.md`) — the empirical face of note 20 §8's
  bias–variance argument.
- **Measuring the metric correctly (#778, evidence 2026-10-28).** Exact positive controls showed
  that two qualification readouts were wrong: short-lag step covariances measure mobility, not
  thermal covariance, and finite feature chords lose tangent-projection energy even for an exact
  metric. A periodic quantum-spring map had residual condition 4.12 at its input structure (flat
  1030.4) but 3.99–45.84 (median 14.28) across eight automatically generated conformations, failing
  the prospective thresholds (median ≤ 10, worst ≤ 20); a later combined-reference map passed with
  6.75 / 12.58 against Cartesian 159.27 / 1030.50 (`docs/investigations/data-free-spring-features.md`).
- **Note 24 (PR #883, 2026-10-30).** Explains the loss $\mathrm{tr}(g\Sigma)-\log\det g$ used to fit
  transferable graph metrics (#865/#873/#877): its unique optimum is $g=\Sigma^{-1}$ (local
  whitening), a statement about the map, not about learning.
- **Objective search (#780, 2026-10-27 → 2026-11-13).** About thirty matched comparisons of loss,
  analytic reference and noise-level sampling (the target/loss half of the stiffness program)
  improved what they targeted (prediction risk, gradient variance) but never generated molecules on
  both ALDP5 and BBA (`docs/investigations/objective-search-synthesis.md`). Covariance-aware input
  normalization with an affine skip (a global-covariance version of note 21's thermal-input pairing)
  lowered noise loss 0.38–3.98 % in six geometries while torsion JS worsened in five
  (`docs/investigations/covariance-aware-prediction.md`).
- **Sprint 11's provisional learning (#769):** "Metric-shaped noise fixes the stiff modes, not the
  torsions."

### 1.4 BBA and the reinterpretation (2026-11-10 → 2026-11-18)

- **Six maps on BBA (#895, Sprint 11 closeout):** springs kept a 52× bond advantage (bond W1 0.0122 vs
  0.637 Å) but no map won populations and free energies together; whitening (3,303 features) was
  worst globally (`docs/investigations/sprint11-pullback-campaign-closeout.md`).
- **Diagnosis (#1023 2026-11-11, #1025, #1026; consolidated in #1078):** each map failed for a
  measurable reason. Springs: "right balance, wrong scale" — one global RMS divisor of 27.1 on BBA
  (1.31 on ALDP5) left each spring channel with population std 0.037, below the smallest trained
  noise 0.045. Whitening: 3,303 redundant invariants for 78 shape degrees of freedom, so 3,225 normal
  directions; the tangent share of the untrained loss below $t=0.1$ was 0.06; training loss 911 →
  904 → 759. Internal coordinates: exact local geometry but size the least-resolved observable.
  Cartesian: bonds resolvable only for $t<4\times10^{-4}$ (`docs/investigations/bba-local-geometry-preconditioning.md`).
  **Theory note 28** (first written as note 27 in #1023; consolidated in a commit of 2026-11-14, merged with #1078 on 2026-11-16) explains why "a
  locally well-scaled map need not give a simple noisy marginal density"; **note 29** (from draft
  #949, consolidated in #1082) fixes how forces are read from a score learned in redundant feature
  coordinates.
- **Decision (docs/status.md, 2026-11-14):** "Stiffness removal is kept for the stiff coordinates and
  dropped as a goal for the whole molecule." New working hypothesis: scale bonds and angles to their
  thermal width so they are readable, and leave a small set of collective coordinates loud so that
  they are erased last ("range and order"; next era; notes 27 and 30).
- **Registered budget (2026-11-15/16):** internal coordinates with two loud modes were the only
  candidate near the best on both scales (bond errors 17–120× and angle errors 7–10× below every
  Cartesian-family model and native ScoreMD), but force fields of every model still drift in size.

**Timeline at a glance**

| Date | What | Outcome |
|---|---|---|
| 2026-10-19 | #521 → note 17; #528 bond-protection panel; #529 endpoint weighting and note 18 | One physical force for all metrics; planar weighting +5.9–8.2 % force MSE; finite-noise targets derived |
| 2026-10-20 | #603 configuration-only comparison; #607 → note 19 | Density/populations better but force MSE +13.8–27.8 %; analytical examples; flat stays baseline |
| 2026-10-22 | Sprint 10 closeout (#742) | No metric beats flat; "change one ingredient at a time" |
| 2026-10-23/24 | PR #745: notes 20, 21 | Stiffness framing; three problems / four effects; spring metric; pairing theorem; $G_t$; schedule floor |
| 2026-10-27 | Sprint 11 #769; #753/#754/#755/#765/#768/#781 | Stiff modes learned 10–100× sooner; no torsion/αL gain; forces pass stiff check |
| 2026-10-28 | #778 readout controls | Short-lag/chord readouts invalid; single-reference quantum map fails across conformations |
| 2026-10-30 | Note 24 (#883) | Local moment loss → $g=\Sigma^{-1}$ |
| 2026-11-10…13 | BBA Sprint 12 chunks; #780 objective search | Springs/whitening fail on BBA; ~30 objective changes, no two-system gain |
| 2026-11-14 (merged 11-16) | Note 28 (#1078), note 29 (#1082), status decision | Stiffness removal only for stiff coordinates → range and order |

---

## 2. Core mathematics

### 2.1 Space, symmetry and the physical measure (note 17; note 20 §1)

- **Configuration space.** $V=\{x\in(\mathbb R^3)^N:\sum_ix_i=0\}\cong\mathbb R^{3N-3}$,
  $\mathcal M=V_{\rm reg}/SO(3)$, $\dim\mathcal M=3N-6$ ($V_{\rm reg}$ excludes collinear clouds;
  reflections are *not* quotiented, so chirality is kept). Vertical space
  $\mathcal V_x=\{(\omega\times x_i)_i\}$, horizontal space
  $\mathcal H_x=\{v:\sum_ix_i\times v_i=0\}$ (zero angular momentum), projector $P_x$.
- **Orbit volume.** With $S_x=\sum_ix_ix_i^\top$ (or $G=X_c^\top X_c$), inertia
  $I_x=\mathrm{tr}(S_x)I_3-S_x$, $v(x)=\sqrt{\det I_x}$, the physical measure pushed to the quotient
  is $d\mu\propto v\,dV_h$ ($h$ = Euclidean quotient metric). Derivation: the Euclidean volume Gram
  matrix in section/rotation coordinates has Schur complement $h=E^\top(1-R_XI_X^{-1}R_X^\top)E$,
  determinant $\det I_X\det h$. At a plane the eigenvalues of $I_X$ are
  $\lambda_2,\lambda_1,\lambda_1+\lambda_2>0$: *collinearity, not planarity*, is singular (note 17).
- **Density relative to a metric's volume.** For a candidate metric $g$:
  $J_g=dV_g/d\mu\propto\sqrt{\det(h^{-1}g)}/v$, $p_g=\rho/J_g$; in a chart with $d\mu=m(q)dq$,
  $J_g=\sqrt{\det g}/m$.
- **One physical force for every metric (note 17).** With $\alpha=d\log\rho$ (physical score
  covector),
  $$s_g=\mathrm{grad}_g\log p_g=g^{-1}(\alpha-d\log J_g),\qquad \alpha=g\,s_g+d\log J_g,\qquad F=-dA=\theta\alpha .$$
  The Cartesian force vector is the Euclidean horizontal lift of $h^{-1}F$, **never** $g^{-1}F$.
  A positive-time score is the force of the *noised* density, not the clean force; a vector-output
  network need not be conservative.
- **Fixed-measure diffusion (note 17).** $L_tf=df[b_t]+\tfrac{a(t)}2\mathrm{div}_\mu(D\,df)$,
  $D=g^{-1}$, $\mathrm{div}_\mu V=m^{-1}\partial_i(mV^i)$; Itô drift
  $B^j=b^j+\tfrac a2m^{-1}\partial_i(mD^{ij})$, covariance $\sigma\sigma^\top=aD$. Relation to
  Laplace–Beltrami: $\mathrm{div}_\mu(D\,df)=\Delta_gf-d\log J_g[D\,df]$. Reverse drift
  $-b_t+aD\alpha_t$; probability-flow velocity $b_t-\tfrac a2D\alpha_t$. Flat controls differ: projected
  Cartesian Brownian motion has generator $\tfrac12(\Delta_h+\langle\mathrm{grad}_h\log v,\mathrm{grad}_h\cdot\rangle)$,
  intrinsic quotient Brownian motion $\tfrac12\Delta_h$.
- **Reversible generator with a declared density (note 19).**
  $Lf=\rho_*^{-1}\mathrm{div}_\mu(\rho_*D\,df)$, Itô drift
  $B^j=D^{ji}\partial_i\log\rho_*+m^{-1}\partial_i(mD^{ij})$, noise $\sqrt{2D}\,dW$; Dirichlet form
  $\int uLv\,\rho_*d\mu=-\int du^\top D\,dv\,\rho_*d\mu$. *The same $D$ can be used with many priors.*

### 2.2 Covector versus vector: sensitivity versus motion (note 20 §2; note 21 §0)

- **Covector score** $s=\nabla\log p_t$ (units Å⁻¹): how fast $\log p_t$ changes per Å; at $t=0$,
  $\theta s$ is the force. Dominated by stiff coordinates.
- **Riemannian score** $v=G^{-1}s$ (units Å): the best move when moving costs $\tfrac12\delta^\top G\delta$,
  $$v=\arg\max_\delta\big(s\cdot\delta-\tfrac12\delta^\top G\delta\big)$$
  [D]. Read $G$ as a spring network: $v$ is the static (Hooke) displacement produced by forces $s$
  (elastic response; $G^{-1}$ is the network's Green's function, *dense*). Equivalently the drift of an
  overdamped dynamics with mobility $G^{-1}$, or (with frozen noise covariance $\sigma_t^2G^{-1}$) the
  Tweedie step $v=(\alpha_t\mathbb E[x_0\mid x_t]-x_t)/\sigma_t^2$ (dec85338 §5.5).
- **Whitened score** $w=G^{-1/2}s$ (dimensionless): the same in thermal units, where "sensitivity
  and motion coincide". Relations: $s=Gv=G^{1/2}w$,
  $\|s\|_{G^{-1}}=\|v\|_G=\|w\|_2$ (note 21 Lemma 2).
- **Large force goes with small motion.** In a harmonic basin, per mode,
  $\mathrm{Var}(x_k)=\lambda_k^{-1}$, $\mathrm{Var}(\beta F_k)=\lambda_k$: about 40 $k_BT$/Å and
  0.025 Å for a bond versus 2 $k_BT$/Å and 0.5 Å for a torsion. With $G=\beta H$, thermal units
  $\tilde x_k=\sqrt{\lambda_k}x_k$, $\tilde s_k=s_k/\sqrt{\lambda_k}$ give $\tilde s=-\tilde x$ at $t=0$.
  The Riemannian move $v=-(x-x^*)$ is "where the fast relaxations end, a Newton step, not the
  instantaneous velocity".
- **Transformation rules** (note 21 Lemma 2). Under $x=Ly$: $s\mapsto L^\top s$ (covector),
  $v\mapsto L^{-1}v$ (vector), $G\mapsto L^\top GL$, $w\mapsto Ow$ with $O$ orthogonal. The force
  $F=\theta s_0=\theta Gv_0$ is metric-independent.

### 2.3 The thermal metric and residual stiffness (notes 20, 21)

- **Target.** $G\approx\beta H$ where $H$ is the (horizontal) Hessian of the energy at a basin
  minimum; locally $\mathrm{Cov}(x_0)\approx(\beta H)^{-1}=\Sigma$, i.e. **$G\approx\Sigma^{-1}$**
  (Laplace approximation; fails at saddles, across basins, for nonharmonic coordinates). Part 1
  writes $G=K$ with $K=\nabla^2E\approx k_BT\Sigma^{-1}$; the notes use the dimension-Å⁻² form
  $G=\beta H$ so that $v$ is a displacement in Å.
- **Equipartition.** For a harmonic coordinate $\mathrm{Var}(q)=1/(\beta k)$: "Every direction has
  its own ruler" — a coordinate's thermal width is its natural length scale.
- **Residual stiffness** (the figure of merit used throughout):
  $$\kappa=\mathrm{cond}\big(G^{1/2}\Sigma G^{1/2}\big)\quad\text{on the 9 internal directions},$$
  with $\Sigma$ the thermal covariance in a ±45° torsional window and $G$ at the window mean;
  $\kappa=1$ is ideal; scale-free (note 20 §5.3). For flat $G$ it is $\kappa(\Sigma)$. Equivalent
  "relative stiffness" $\tilde H=\hat G^{-1/2}(\beta H)\hat G^{-1/2}$ (dec85338 §5).
- **Lemma 1 (note 20).** If $GP=PG$ (G maps rotations to rotations), the induced quotient metric is
  $PGP$ on $\mathcal H_x$, and noise with covariance $G^{-1}$ followed by $P$ samples the horizontal
  covariance exactly.
- **Lemma 2 (note 20; Schur).** A constant matrix commuting with all rotations is $A\otimes I_3$: it
  weights every direction of a bond vector equally, so **it cannot make stretching stiff while keeping
  bond rotation soft**. Consequence: a stiffness-following metric must depend on the configuration;
  a fixed whitening matrix in an aligned frame is *worse* than no metric on ALDP5 (273 vs 192 in
  β/C7eq, 477 vs 112 in αR).

### 2.4 The one-basin model and the four effects E1–E4 (note 20 §4; note 21 §3)

Model: $x_0\sim\mathcal N(0,(\beta H)^{-1})$ on internal directions, metric $G=\beta H$ with
eigenvalues $\lambda_k$ (stiffnesses), VP schedule. Noise $x_t=\alpha_tx_0+\sigma_tN^{-1/2}\varepsilon$,
flat $N=I$ or metric-shaped $N=G$. Per-mode variance
$$S_k^{\rm flat}=\frac{\alpha_t^2}{\lambda_k}+\sigma_t^2,\qquad S_k^{\rm metric}=\frac{\alpha_t^2+\sigma_t^2}{\lambda_k}=\frac1{\lambda_k}\ (\text{VP}),$$
$s_k=-x_k/S_k$, $v_k=-x_k/(\lambda_kS_k)$. Exact per-mode quantities [D]:

| Mode $k$ | Covector, Euclidean loss, flat noise | Riemannian, metric loss, flat noise | Riemannian, metric loss, metric noise |
|---|---|---|---|
| E1 Cartesian output std | $S_k^{-1/2}$ | $\lambda_k^{-1}S_k^{-1/2}$ | $\lambda_k^{-1}S_k^{-1/2}$ |
| E1 std in metric units | — | $(\alpha_t^2+\sigma_t^2\lambda_k)^{-1/2}$ | $(\alpha_t^2+\sigma_t^2)^{-1/2}$ |
| E2 learnable loss | $1/S_k$ | $(\alpha_t^2+\sigma_t^2\lambda_k)^{-1}$ | $(\alpha_t^2+\sigma_t^2)^{-1}$ |
| E2 DSM target 2nd moment | $1/\sigma_t^2$ | $1/(\lambda_k\sigma_t^2)$ | $1/\sigma_t^2$ |
| E3 Jacobian eigenvalue | $1/S_k$ | $(\alpha_t^2+\sigma_t^2\lambda_k)^{-1}$ | $(\alpha_t^2+\sigma_t^2)^{-1}$ |
| E4 $I(x_{0,k};x_{t,k})$ | $\tfrac12\log(1+\frac{\alpha_t^2}{\sigma_t^2\lambda_k})$ | same | $\tfrac12\log(1+\frac{\alpha_t^2}{\sigma_t^2})$ |

- **E1 output scale.** The Riemannian score is a displacement, $v\approx-x/\alpha_t^2$ at low noise. In
  raw Cartesian components neither score is even: the covector scales as $\sqrt{\lambda_k}$, the
  Riemannian score as $1/\sqrt{\lambda_k}$ — a spread of about $\sqrt\kappa\approx20$ *either way*.
  Only in metric units ($\sqrt{\lambda_k}v_k$) is every mode the same.
- **E2 balanced loss (criterion A).** Proof: $\mathbb E[\lambda_kv_k^2]=\lambda_kS_k/(\lambda_kS_k)^2=1/(\lambda_kS_k)$.
  Covector + Euclidean: weight $1/S_k\approx\lambda_k/\alpha_t^2$ ("bonds dominate").
  Riemannian + Euclidean: weight $\propto1/\lambda_k$ ("bonds are ignored").
  Riemannian + metric loss: equal at low noise (flat) or at all noise (metric noise).
- **E3 well-conditioned target.** Jacobian of the Riemannian target from raw to raw:
  $-(\alpha_t^2I+\sigma_t^2\beta H)^{-1}$, eigenvalues in $(0,\alpha_t^{-2}]$ — Lipschitz constant
  independent of stiffness; the covector target's Jacobian $-S_t^{-1}$ has Lipschitz constant
  $\approx\lambda_{\max}/\alpha_t^2$ (the bond stiffness). *Holds for a frozen metric only* (§2.10).
- **E4 synchronized information destruction.** With noise covariance $\sigma_t^2N^{-1}$,
  $$I(x_{0,k};x_{t,k})=\tfrac12\log(1+\mathrm{SNR}_k),\qquad \mathrm{SNR}_k=\frac{\alpha_t^2}{\sigma_t^2\tilde\lambda_k},$$
  $\tilde\lambda_k$ = eigenvalues of $N^{-1/2}\beta HN^{-1/2}$. All modes lose information at the same
  rate iff $N\propto\beta H$. Simpler form (flat): the signal fraction
  $$r_k=\frac{\alpha_t^2\sigma_k^2}{\alpha_t^2\sigma_k^2+\sigma_t^2}=\frac{\mathrm{SNR}_k}{1+\mathrm{SNR}_k},\qquad I=-\tfrac12\log(1-r_k),$$
  a mode is half-erased at $\sigma_t=\alpha_t\sigma_k$ (≈0.025 Å for a bond, 0.5 Å for a torsion), so
  flat noise erases stiff modes at a noise level $\sqrt\kappa$ times smaller (≈20 across ALDP5). The
  half-destruction windows spread over $\log\kappa(H)$: 2.6 decades for ALDP5. **Only the forward
  noise can produce E4**; no target or loss changes the information content of $x_t$. (Part 1's
  Problem 1 plots exactly $r_k=\sigma_i^2/(\sigma_i^2+\sigma_t^2)$.)
- **Noise softens stiffness** (note 20 §3): per mode the effective stiffness of $p_t$ is
  $(\alpha_t^2/\lambda_k+\sigma_t^2)^{-1}$; at $\sigma_t=0.1$ Å an ALDP5 bond drops from about 1,600 to
  94 Å⁻² while torsions barely change (25 → 20, derived here).

### 2.5 One minimizer, likelihood weighting and what the samples feel

- **Prop 1 (note 21; Vincent's identity).** For invertible linear target maps $T_t$ and positive loss
  metrics $M_t(x)$ depending on $x_t$ only,
  $\mathcal J[f]=\int\lambda\,\mathbb E\|f(x_t,t)-T_t\nabla\log q_t(x_t\mid x_0)\|^2_{M_t}dt
  =\mathcal J[f^*]+\int\lambda\,\mathbb E\|f-f^*\|^2_{M_t}dt$ with $f^*=T_t\nabla\log p_t$. Every target
  and every positive weighting has **the same population minimizer**; the choices differ only for a
  finite network. A weight depending on the *clean* $x_0$ moves the optimum (to
  $\mathbb E[W|y]^{-1}\mathbb E[W\varepsilon|y]$; objective-search synthesis).
- **Prop 1 of note 20 (likelihood weighting) [S/D].** For two diffusions with the same diffusion matrix
  $\beta a$:
  $$\mathrm{KL}(\mu_0\|\hat\mu_0)\le\mathrm{KL}(\mu_T\|\text{prior})+\tfrac12\int_0^T\beta(t)\,\mathbb E(\hat s-s)^\top a(\hat s-s)\,dt .$$
  With $a=G^{-1}$ the integrand is the metric norm of the Riemannian-score error; only horizontal
  errors matter (project before the loss).
- **Prop 8 (note 21): the samples feel errors in the data covariance norm.** For
  $s=-\Sigma^{-1}(x-x^*)$, any $D\succ0$ and constant error $\delta$,
  $dX=\tfrac12D(s+\delta)dt+D^{1/2}dW$ has stationary law $\mathcal N(x^*+\Sigma\delta,\Sigma)$ at
  $$\mathrm{KL}=\tfrac12\delta^\top\Sigma\delta$$
  from $p_0$ — *whatever the preconditioner $D$*. With $G=\Sigma^{-1}$ this is
  $\tfrac12\|\delta\|_{G^{-1}}^2$. Equivalent force form (note 20 §8): a constant force error $\delta f$
  (in $k_BT$) on a coordinate of width $\sigma$ gives $\mathrm{KL}=\tfrac12(\delta f\,\sigma)^2$:
  errors matter in thermal units, and Cartesian force MSE over-weights stiff relative errors by about
  $\kappa$.
- **Norm bound (note 19 §11).** If $D(q)\succeq c\,h(q)^{-1}$ pointwise,
  $\mathbb E\|\hat F-F\|^2_{\rm Cart}\le\frac{\theta^2}{c}\mathbb E[e^\top De]$ ($e=\hat\alpha-\alpha$); for
  $D_\eta=(1-\eta)D_{\rm chem}+\eta c_0h^{-1}$, $c=\eta c_0$. **Decoupling:** for a correct
  conditional target $T$ and any $W(y,t)\succ0$,
  $\mathbb E[(f-T)^\top W(f-T)]=\mathbb E[(f-\alpha_t)^\top W(f-\alpha_t)]+\mathbb E[(T-\alpha_t)^\top W(T-\alpha_t)]$:
  the noising tensor can stay chemical while the supervision norm is Cartesian ($W=h^{-1}$).

### 2.6 Sizes, gains, training curvature and the pairing theorem (note 21 §3–4)

- **Lemma 1 (note 21).** $p_t=\mathcal N(\alpha_tx^*,S_t)$, $S_t=\alpha_t^2\Sigma+\sigma_t^2N^{-1}$;
  if $G=\beta H$ then the noise-level metric equals $S_t^{-1}$. Every target is affine in $x$.
- **Prop 2 (sizes and gains), $G=\beta H$, flat noise, $\kappa_t=\mathrm{cond}(S_t)$:**

| Output, input | Std (mode $k$) | Gain | Spread of std | Spread of gain |
|---|---|---|---|---|
| $s$, raw $x$ | $S_k^{-1/2}$ | $1/S_k$ | $\kappa_t^{1/2}$ | $\kappa_t$ |
| $v_t$, raw $x$ | $S_k^{1/2}$ | 1 | $\kappa_t^{1/2}$ | 1 |
| $w_t$, raw $x$ | 1 | $S_k^{-1/2}$ | 1 | $\kappa_t^{1/2}$ |
| $w_t$, thermal $z=S_t^{-1/2}x$ | 1 | 1 | 1 | 1 |

  Idealized spectrum: $\kappa_t$ = 356 at $\sigma_t^2=10^{-4}$ Å², 97 at the trusted floor
  ($\sigma_t^2=0.002$), 1.25 at 0.5; ALDP5 window statistics 146, 27, 1.1. **"Problem 2 is two
  problems, sizes and gain; raising the index fixes only the gain"** (note 21 §8). With $G_t$,
  $v_t=-(x-\alpha_tx^*)$ exactly: gain 1, but sizes still spread because displacements do.
- **Theorem 1 (training curvature of a linear layer).** Input $z$ centred with covariance $C$, target
  $y=W^*z$, loss metric $M$: $L(W)=\mathrm{vec}(W-W^*)^\top(C\otimes M)\mathrm{vec}(W-W^*)$; Hessian
  eigenvalues $2c_jm_i$; condition number $\mathrm{cond}(C)\,\mathrm{cond}(M)$; GD stable iff
  $\eta<1/(c_{\max}m_{\max})$. "The weight that maps input direction $j$ to output direction $i$ has
  curvature equal to the input variance along $j$ times the loss weight along $i$." Finite-difference
  check $1.7\times10^{-10}$.
- **Criteria.** A: even error weighting ($m_k\mathrm{Var}(y_k)$ equal); B: even gain
  ($|\partial y_k/\partial z_k|$ equal); C: even inputs ($\mathrm{Var}(z_k)$ equal).
- **Theorem 2 (pairing).** In the commuting model with $G=\beta H$: (1) for given input units $\tau$, A
  and B hold iff $\omega_k=\tau_kS_k$ and $m_k=1/(\tau_k^2S_k)$; (2) every such pairing has loss value
  $\|\hat s-s\|^2_{G_t^{-1}}$, target map $y=-z$ and curvature $\mathrm{cond}(C)^2$; (3) the three targets
  are the family $\tau=G_t^{1-a}$, $y=G_t^{-a}s$, $M=G_t^{2a-1}$:
  - $a=1$: raw inputs, **Riemannian** score, metric loss $G_t$;
  - $a=\tfrac12$: thermal inputs, **whitened** score, Euclidean loss (= metric loss);
  - $a=0$: precision-weighted inputs $G_tx$, **covector**, dual metric loss $G_t^{-1}$;

  with curvature $\kappa_t^{2|1-2a|}$; (4) C also holds iff $a=\tfrac12$. Proof: $y_k=-\omega_kz_k/(\tau_kS_k)$,
  so B ⇔ $\omega_k\propto\tau_kS_k$; then $\mathrm{Var}(y_k)=\omega_k^2/S_k$ and A ⇔
  $m_k\propto1/(\tau_k^2S_k)$; input variances $c_k=\tau_k^2S_k=1/m_k$, so
  $\mathrm{cond}(M)=\mathrm{cond}(C)$; apply Theorem 1. "Gradient descent sees that spread twice, once at
  the input and once in the loss metric. Only the whitened pairing removes it."
- **Prop 3 (thermal units are built-in Newton steps).** $W'=G^{1/2}WG^{-1/2}$ maps the Riemannian to
  the whitened pairing; a whitened gradient step is $W\leftarrow W-\eta G^{-1}(\nabla_WL)G$ in
  Riemannian coordinates, which is Newton's step at $\eta=\tfrac12$ when $C^{-1}=M=G$.

### 2.7 The noise-level metric (note 21 §2.4, §5.1)

$$G_t=\big(\alpha_t^2G^{-1}+\sigma_t^2N^{-1}\big)^{-1}.$$
$G_t^{-1}$ is the covariance of the noised data predicted by $G$. Under flat noise
$G_t=G(\alpha_t^2I+\sigma_t^2G)^{-1}$ with eigenvalues $\lambda/(\alpha_t^2+\sigma_t^2\lambda)$: $G$ at low
noise, $I/\sigma_t^2$ at high noise. Under metric noise ($N=G$, VP) $G_t=G$.

**Theorem 3.** $\rho(t)=\mathrm{cond}(G_t^{1/2}S_tG_t^{1/2})\ge1$, with equality iff the metric is
$\propto S_t^{-1}$; a fixed $G$ attains $\rho=1$ at two noise levels iff $G\propto\beta H$ and
$N\propto G$; and if $c_{\min}G^{-1}\preceq\Sigma\preceq c_{\max}G^{-1}$ then for every $t$
$$\mathrm{cond}\big(G_t^{1/2}S_tG_t^{1/2}\big)\le\frac{\max(c_{\max},1)}{\min(c_{\min},1)}.$$
"Under flat noise, a fixed metric helps at low noise and hurts at high noise, where the flat ruler is
right." (Numbers in §4.3.)

### 2.8 What only the noise decides (note 21 §5)

- **Prop 4 (information).** $I(x_0;x_t)=\sum_k\tfrac12\log(1+\mathrm{SNR}_k)$,
  $\mathrm{SNR}_k=\alpha_t^2\theta_k/\sigma_t^2$ with $\theta_k$ the eigenvalues of $N^{1/2}\Sigma N^{1/2}$;
  signal fractions equal across modes at every $t$ iff $N\propto\beta H$. Proof:
  $I=\tfrac12\log\det(I+\alpha_t^2\sigma_t^{-2}N\Sigma)$.
- **Prop 5 (smallest trained noise level).** Under flat noise mode $k$ is resolved
  ($\mathrm{SNR}_k\ge1$) iff $\sigma_t^2\le\alpha_t^2/\lambda_k$; under metric noise with $G=\beta H$,
  $\mathrm{SNR}_k=\alpha_t^2/\sigma_t^2$ for every mode. With the trusted schedule, **no trained level
  resolves a bond** (0 % of trained times and of likelihood weight); the sampler's last nine steps
  query the network below its training range, "and that is where bonds are formed"; the trusted flat
  model's bond W1 0.019–0.030 Å (about one bond width) "is consistent with it [H]".
- **Prop 6 (irreducible part).** For the DSM target $y=-N^{1/2}\varepsilon/\sigma_t$ and constant loss
  metric $M$: $\mathbb E\|y-\mathbb E[y|x_t]\|_M^2=\mathrm{tr}(M(\sigma_t^{-2}N-S_t^{-1}))$,
  $\mathbb E\|\mathbb E[y|x_t]\|_M^2=\mathrm{tr}(MS_t^{-1})$; per mode, **irreducible = SNR$_k$ × learnable**,
  whatever target and loss (correcting note 20's "1+SNR", which is the total second moment). At low
  noise, under flat noise with the metric loss, the noise term ≈ $1/(\lambda_k\sigma_t^2)$ per mode: soft
  modes carry about $\kappa$ times more gradient noise than stiff modes.
- **Prop 7 (sampler stiffness).** In the clock $u=\int\beta$, the probability-flow ODE
  $dx/du=-\tfrac12x-\tfrac12N^{-1}\nabla\log p_u$ has Jacobian $-\tfrac12I+\tfrac12N^{-1}S_u^{-1}$; its
  largest eigenvalue tends to $\lambda_{\max}$ as $u\to0$ under flat noise and is 1 under metric noise
  with $G=\beta H$. Explicit steps need $\Delta u\lesssim c/\mu(u)$.
- **Lemma 3 (noise from a factor).** If $FF^\top=G^{-1}$ then $F\varepsilon\sim\mathcal N(0,G^{-1})$; with
  the bond-attached factor $F=G^{-1}A^\top$ ($\varepsilon\in\mathbb R^m$) one sparse solve, no matrix root,
  equivariant draw by draw. Checked: covariance within 0.5 % over 400,000 draws, equivariance to
  $1.5\times10^{-15}$.
- **Lemma 4 (Brownian motion of a configuration-dependent metric).** Generator $\tfrac12\Delta_g$ is
  $dX=b\,dt+G^{-1/2}dW$ with
  $b^j=\tfrac12|G|^{-1/2}\partial_i(|G|^{1/2}(G^{-1})^{ij})$, invariant measure $|G|^{1/2}dx$. A
  frozen-metric kernel drops $b$ and the variation of $G$: **metric-shaped noise with the spring
  metric is approximate** (no closed-form kernel, no closed-form terminal law).

### 2.9 The spring-force metric and its curvature (note 20 §5)

$$G(x)=J_d(x)^\top WJ_d(x)+\gamma I,\qquad \|u\|_G^2=\sum_{(i,j)}w_{ij}\big(\hat r_{ij}\cdot(u_i-u_j)\big)^2+\gamma\|u\|^2 .$$
$J_d$ = rigidity matrix of selected pair distances (bonds, one–three pairs, optional switched
contacts), $w_{ij}=\beta k_{ij}$ typed thermal stiffness, $\gamma\approx1/\sigma_{\rm soft}^2$ (≈25–40
Å⁻² for within-basin ALDP5 torsions). $J_d^\top WJ_d$ is the Gauss–Newton approximation of a pair
potential's Hessian (exact at a minimum only if every pair is unstrained). Properties: positive
definite with eigenvalues in $[\gamma,\gamma+\lambda_{\max}(J_d^\top WJ_d)]$; no planar barrier;
$J_d$ annihilates rigid motions (Lemma 1 holds); any graph including rings; cost ∝ number of pairs.
Factorized form $G=A^\top A$, $A=\begin{pmatrix}W^{1/2}J_d\\ \sqrt\gamma I\end{pmatrix}$ — i.e. **the
spring metric is the exact pullback of the flat feature map $x\mapsto(W^{1/2}d(x),\sqrt\gamma x)$**
(the "spring features" of Sprint 11; notes 22–23).

**Prop 2 (curvature).** Two beads, bond vector $b$, length $r$: the metric is
$$(\tfrac\gamma2+w)\,dr^2+\tfrac\gamma2r^2d\Omega^2,$$
a cone with tangential sectional curvature $4w/(\gamma(\gamma+2w)r^2)$. A rotation-invariant metric
$A(r)dr^2+B(r)d\Omega^2$ is flat iff $(d\sqrt B/dr)^2=A$: **flatness ties radial stiffness to how fast
the angular scale grows with $r$**. Autodiff Riemann tensors of chains and triangles are nonzero; a
pullback control gives at most $5\times10^{-17}$. "Curvature matters only if the metric shapes the
noise. As target and loss metric it is irrelevant."

### 2.10 Beyond one frozen basin (note 21 §7)

- **Lemma 5 (Lipschitz constants).** For constant $G$, the Lipschitz constants of $s$, $v$ and
  $\varphi\mapsto w$ in paired norms all equal
  $L_G(t)=\sup_x\|G^{-1/2}\nabla^2\log p_tG^{-1/2}\|_2$; scale-free version
  $L_G\lambda_{\max}(G^{1/2}\mathrm{Cov}(p_t)G^{1/2})=\rho(t)$ for a Gaussian.
- **Lemma 6–7 (rotating bonds).** For $v=G(x)^{-1}s(x)$:
  $Dv[\delta]=G^{-1}(\nabla^2\log p\,\delta-DG[\delta]v)$, an extra term $R$ with
  $\|R\|\le c_G\|v\|_G$. One bond, $G(b)=\lambda_wI+(\lambda_s-\lambda_w)\hat b\hat b^\top$: along a unit
  thermal direction across the bond, the relative metric change is
  $(1-\sigma_s^2/\sigma_w^2)\varepsilon_{\rm rot}$ with
  $$\varepsilon_{\rm rot}=\frac{\sigma_w^2}{d\,\sigma_s}$$
  (soft width $\sigma_w$, stiff width $\sigma_s$, bond length $d$). "A soft displacement of one width
  rotates the bond, and its stiff direction, by $\sigma_w/d$." It grows with stiffness as $1/\sigma_s$.
- **Bond-attached outputs (§7.3; note 20 Prop 4).** Rows of $A$ give a Parseval frame of $(V,G)$;
  outputs $\hat u$ with $\hat s=PA^\top\hat u$ satisfy
  $\|PA^\top(\hat u-u)\|^2_{G^{-1}}=\|Q(\hat u-u)\|_2^2$ with $Q=AG^{-1/2}PG^{-1/2}A^\top$ an orthogonal
  projector (checked to $10^{-14}$): the metric loss becomes a Euclidean loss on local coefficients.
  **Prop 9 (pair springs):** if $\beta U=\tfrac12\sum_ew_e(d_e-d_e^0)^2$ then
  $\nabla\log p_0=A(x)^\top(-\varphi,0)$ with $\varphi_e=\sqrt{w_e}(d_e-d_e^0)$ at every configuration
  (checked to $2\times10^{-8}$): the clean target in coefficients is the fixed map
  $u_e^*=-(d_e-d_e^0)/\sigma_e$, "the deviation in thermal widths, the same function for every
  molecule"; the rotation is carried analytically by $A(x)^\top$.
- **Prop 10 (multimodality).** For $p=\tfrac12\mathcal N(-m,S)+\tfrac12\mathcal N(m,S)$, $r=m^\top S^{-1}m$:
  the generalized eigenvalues of $(-\nabla^2\log p(0),S^{-1})$ are $1$ and $1-r$, invariant under every
  linear change of variables; for $k=1$, $r\ge2$: $\sup_x|(\log p)''|\,\mathrm{Var}(p)=r^2-1$, invariant
  under affine maps. Proof uses
  $\nabla^2\log p=-S^{-1}+S^{-1}mm^\top S^{-1}\mathrm{sech}^2(m^\top S^{-1}x)$. **No constant metric reduces
  the barrier-to-basin curvature ratio**; only noise or a nonlinear reparametrization does (note 28
  §8: in 1-D $T=\Phi_N^{-1}\circ F$ maps any smooth positive density to a normal one, but needs global
  density knowledge).

### 2.11 Pullbacks and force read-out (note 20 §6, §8; note 29)

- **Prop 3 (exact pullback process).** For an equivariant diffeomorphism $\Phi$ with $y=\Phi(x)$
  following OU: kernel
  $p_t(x|x_0)=\mathcal N(\Phi(x);\alpha_t\Phi(x_0),\sigma_t^2I)\,|\det D\Phi(x)|$; score conversion
  $\nabla_x\log p_t=D\Phi^\top s_y+\nabla_x\log|\det D\Phi|$; $x_t$ is reversible preconditioned
  Langevin with diffusion matrix $G_\Phi^{-1}$, $G_\Phi=D\Phi^\top D\Phi$ (checked to $10^{-10}$); the
  Euclidean score of $y$ is the Riemannian score of $G_\Phi$ in an orthonormal frame (design B learns
  the whitened target, up to an orthogonal change of frame). **Converse [S/D]:** a metric is locally a Euclidean pullback iff it is
  flat (Wendl Thm 27.3); by Varadhan, kernels Gaussian in some coordinates force a flat metric. Exact
  Gaussian targets with metric-shaped noise therefore need a flat pullback (or a higher-dimensional
  embedding, notes 22–23).
- **Designs** (note 20 §6.4): **A** flat noise + spring-metric target/loss (exact, no E4); **B**
  pullback noise (exact, E4, needs a map — internal coordinates "kept as an ablation" on 2026-10-23
  because they need a spanning tree); **C** noise shaped by the spring metric (E4, approximate
  targets). Design A's loss with the metric evaluated at the *noisy* state:
  $\mathcal L=\int\lambda\,\mathbb E(\hat s+\varepsilon/\sigma_t)^\top G_t(x_t)^{-1}(\hat s+\varepsilon/\sigma_t)\,dt$;
  evaluating $G$ at the clean state would bias it.
- **Force independent of the metric.** $F=k_BT\nabla\log p_0=k_BT\,Gv$ as $t\to0$.
- **Bias–variance of reading forces at small noise (note 20 §8).** In one basin with mode variances
  $c_k$ in the noised representation, the score at noise $\sigma_t$ has relative bias
  $\sigma_t^2/(c_k+\sigma_t^2)$. Bias ≤ $\delta$ in every mode needs $\sigma_t^2\le\delta c_{\min}$; the DSM
  target then has variance $1/(\delta c_{\min})$; relative to mode $k$'s squared thermal force ($1/c_k$) that is
  $c_k/(\delta c_{\min})$ (dec85338, where these variances are called $\lambda_k$): under flat noise $c_{\min}$ is the
  bond variance, so soft forces pay a noise factor up to $\kappa(H)$; metric-shaped noise equalizes $c_k$ (E4).
- **Volume term (note 29).** For $\varphi:X\to\mathbb R^m$, $G=D\varphi^\top D\varphi$, surface
  $S=\varphi(X)$ with area $dA=\sqrt{\det G}\,dx$, density $q=p_0/\sqrt{\det G}$:
  $$\nabla_x\log p_0=D\varphi^\top\nabla^S\log q+\tfrac12\nabla_x\log\det G,$$
  read-out $\hat F(x)=k_BT[D\varphi^\top s_{t_*}(\varphi(x))+\tfrac12\nabla_x\log\det G]$, evaluated at
  $y=\varphi(x)$ (never at an off-surface sample). Near $S$ the score has a normal part of order
  $\sigma_t^{-2}$ that carries no force ($D\varphi^\top n=0$). For rotation-invariant features add the
  orbit factor and use the horizontal determinant $\det G_Q$. If an energy's first layer is linear,
  $E=h(Ay)$, then $\nabla_yE=A^\top\nabla h$: directions in $\ker A$ receive no correction.

### 2.12 Finite-noise force targets (note 18)

Clean density $p$ on the centred space $\mathbb R^{3N-3}$, $\alpha=\nabla\log p$, normalized smooth
kernel $k(y|x)$, $q(y)=\int p(x)k(y|x)dx$. Two unbiased targets for the same marginal score:
$$T_N=\nabla_y\log k(y|x),\qquad T_F=\alpha(x)+\nabla_x\log k(y|x)+\nabla_y\log k(y|x),$$
since $0=\int\nabla_x[p(x)k(y|x)]dx$. Any $T_c=T_N+c[\alpha(X)+\nabla_x\log k(Y|X)]$ with $c$ fixed (or
depending on $y$ and noise level only) is unbiased; $c$ depending on clean $X$ biases. Gaussian
$k=\mathcal N(m(x),tC(x))$, $r=y-m(x)$, $a=C^{-1}r$:
$$T_N=-a/t,\qquad [T_F]_j=\alpha_j+\frac{[((Dm)^\top-I)a]_j}{t}-\tfrac12\mathrm{tr}(C^{-1}\partial_jC)+\frac{a^\top(\partial_jC)a}{2t}.$$
For $m(x)=x$ and constant $C$, $T_F=\alpha(x)$ (translation-kernel identity of Durumeric et al.). For
state-dependent $C$ the covariance terms are necessary and **do not vanish as $t\to0$**: $r\sim\sqrt t$
makes the quadratic term order one. Candidate covariance on noncollinear clouds:
$\bar D_H=(3N-6)D_H/\mathrm{tr}D_H$, $C=\bar D_H+P_R$ (trace $3N-3$; flat gives $I$). For a desired
generator $\tfrac12\mathrm{div}(C\nabla f)$ use the mean $m(x)=x+\tfrac t2\mathrm{div}C(x)$; with mean $x$ the
generator is $\tfrac12C:\mathrm{Hess}f$ (a different process).

### 2.13 The local second-moment metric loss (note 24)

At a fixed anchor, displacement $u\in\mathbb R^d$ ($d=3N-6$), $\Sigma=\mathbb E[uu^\top]$ (uncentred),
metric $g\succ0$, $S=g^{1/2}$:
$$\ell(g;\Sigma)=\frac{\mathrm{tr}(g\Sigma)-\log\det g}{d},\qquad \mathrm{tr}(g\Sigma)=\mathbb E[u^\top gu]=\mathbb E\|g^{1/2}u\|^2$$
(trace chain via symmetry of the square root; no Gaussian or zero-mean assumption; a Cholesky
$g=LL^\top$ gives $\|L^\top u\|^2$, not $\|Lu\|^2$). The trace alone favours $g\to0$, the $-\log\det$
alone favours infinite volume; together, per eigen-direction,
$\ell=\frac1d\sum_i(s_i\lambda_i-\log s_i)$, minimum $s_i=1/\lambda_i$ (here $\lambda_i$ are eigenvalues of the second moment $\Sigma$ and $s_i$ those of $g$ in a common eigenbasis, not stiffnesses). Unrestricted optimum: with
$H=\Sigma^{1/2}g\Sigma^{1/2}$, eigenvalues $\mu_i$,
$$\ell(g;\Sigma)-\ell(\Sigma^{-1};\Sigma)=\frac1d\sum_i(\mu_i-\log\mu_i-1)\ge0,\qquad g_*=\Sigma^{-1},\ \mathrm{tr}(g_*\Sigma)=d,\ \ell(g_*)=1+\frac{\log\det\Sigma}d .$$
Gaussian reading: $\mathbb E[-\log p_g(u)]=\frac d2\log2\pi+\frac d2\ell(g;\Sigma)$ (fits a zero-mean Gaussian
surrogate; a nonzero local mean is absorbed into $\Sigma$). PD $g$ cannot be Frobenius-orthogonal to a
nonzero $\Sigma$: $\mathrm{tr}(g\Sigma)\ge\lambda_{\min}(g)\mathrm{tr}\Sigma>0$; singular $\Sigma$ has no finite
optimum. Under $u'=Au$: $\ell'=\ell+2\log|\det A|/d$. Implementation (graph metrics, #877): 16 source
anchors per molecule, 128 nearest aligned conformations projected to the horizontal frame,
$\Phi_\theta(x)=[\epsilon I(x),a_\theta(G,c)\odot b_G(x)]$, $g_\theta=J_x^\top J_x$ — "restricted local
second-moment balancing", not a guarantee of learning, populations or forces.

### 2.14 Why a well-scaled metric can still give a hard target (note 28)

- **Ambient DSM.** $Y=\alpha_tZ+\sigma_t\epsilon$ in the full feature space $\mathbb R^M$ (noise also
  transverse to the image; not intrinsic Brownian motion). Optimum
  $\epsilon^*=\mathbb E[\epsilon|y]=(y-\alpha_t\mathbb E[Z|y])/\sigma_t$, $s_t=-\epsilon^*/\sigma_t$; conservative
  residual form $\epsilon_\theta=\sigma_ty+\alpha_t\nabla_yH_\theta$ (zero head = "prior matching").
- **Posterior covariance sets difficulty and floor.**
  $\nabla_y\mathbb E[Z|y]=\frac{\alpha_t}{\sigma_t^2}\mathrm{Cov}(Z|y)$,
  $\nabla_ys_t=-\frac I{\sigma_t^2}+\frac{\alpha_t^2}{\sigma_t^4}\mathrm{Cov}(Z|y)$,
  $\mathbb E\|\epsilon_\theta-\epsilon\|^2=\mathbb E\|\epsilon_\theta-\epsilon^*\|^2+\frac{\alpha_t^2}{\sigma_t^2}\mathbb E\,\mathrm{tr}\,\mathrm{Cov}(Z|Y)$:
  maps with different dimensions/clocks/laws cannot be ranked by raw epsilon loss.
- **Small-noise trap.** One Gaussian feature of variance $\lambda$, $\tau=\sigma/\alpha$: predictable fraction
  $\mathrm{Var}(\epsilon^*)=\tau^2/(\lambda+\tau^2)\to0$ while the clean score stays $-z/\lambda$; required
  residual slope $\nabla H^*=\tau(1-\lambda)y/(\lambda+\tau^2)$ peaks at $\tau=\sqrt\lambda$ with coefficient
  $(1-\lambda)/(2\sqrt\lambda)$.
- **A metric does not determine ambient denoising** (line vs helix; §3.18).
- **Redundant coordinates convert tangent stiffness into normal stiffness.** Clean law standard Gaussian
  on a flat $d$-subspace of $\mathbb R^M$: $\epsilon^*=\sigma_ty_T+y_N/\sigma_t$, $\nabla H^*=\frac{\alpha_t}{\sigma_t}y_N$;
  normal score Hessian $-I_N/\sigma_t^2$; Gaussian skip alone has excess loss $\alpha_t^4(M-d)$. "Redundancy
  does not remove stiffness, it converts finite tangent stiffness into diverging normal stiffness."
- **Three covariances not to interchange:** global (mixes conformations), local equilibrium
  (within one conditional ensemble), time-increment (depends on mobility and lag). For
  $dx_i=-\kappa_ix_idt+\sqrt2dW$: $\mathrm{Var}=1/\kappa_i$ but
  $\tfrac12\mathbb E[(x_i(t+\Delta)-x_i(t))^2]=(1-e^{-\kappa_i\Delta})/\kappa_i\to\Delta$, independent of
  stiffness: "whitening a short-lag increment covariance whitens diffusion, not thermal widths".
- **Sufficient condition: factor out conditional fast fluctuations.** If
  $p_q(s,r)=p_s(s)\,\mathcal N(r;\mu(s),L(s)L(s)^\top)$, then $z=L(s)^{-1}(r-\mu(s))$ gives exactly
  $p_s(s)\mathcal N(z;0,I)$; independent VP noise of $z$ keeps its score $-z$ at every time: "This
  removes a regression task rather than rescaling it." Score transport under smooth invertible $T$:
  $s_T(T(q))=DT^{-\top}[s_q(q)-\nabla_q\log|\det DT(q)|]$ — substituting only an inverse conditional
  covariance omits moving-mean and width derivatives.
- **What a useful map must satisfy (§7):** (1) resolve intended fluctuations after every normalization —
  local noise scale of an observable $q$ is $(\sigma/\alpha)\sqrt{\nabla q^\top g^+\nabla q}$; "the
  condition number of $g$ alone is the wrong target, and a scalar rescaling changes resolution without
  changing the condition number"; (2) keep an accessible representation (redundant physical quantities
  belong in the network input, not the noised state); (3) control finite-noise ambiguity and extrinsic
  work; (4) make the remaining conditional score simple (factorization > equal eigenvalues; the base must
  match the data in local *and* collective directions); (5) allocate learning to useful noise levels;
  (6) assess downstream quantities (score errors reach forces multiplied by $\alpha D\Phi^\top/\sigma$).

---

## 3. Worked analytical examples (precise enough to compute a visualization)

### 3.1 The idealized nine-mode ALDP5 basin and when each mode dies

**Spectrum.** The note-20 tables use $\beta k$ = 1650, 1160, 1110, 1650 (bonds), 460, 300, 410
(one–three distances), 25 (torsion within one basin), 4 (softest direction, width 0.5 Å) Å⁻²
(explicit list in `dec85338` §5.2), $\kappa=412.5$; note 21 uses 1,659 for the stiffest bond,
$\kappa=415$. Measured basis (note 20 §1.4 / dec85338 §6.1, 200,000 frames): bonds 1–2, 2–3, 3–4, 4–5 have
means 1.336, 1.472, 1.551, 1.344 Å, stds 0.025, 0.029, 0.030, 0.025 Å, $\beta k$ = 1650, 1159, 1108, 1659;
one–three distances 1–3, 2–4, 3–5 means 2.487, 2.524, 2.472 Å, stds 0.047, 0.058, 0.049 Å, $\beta k$ = 459,
302, 411; torsional displacement ≈0.2 Å in one basin ($\beta k\approx25$), ≈0.7 Å across the data
($\approx2$); whole-data aligned covariance eigenvalues 0.54 … 0.00058 Å², condition ≈920.

**Spreads over the nine modes (note 20 §4.2, reproduced exactly with this spectrum, derived here):**

| Quantity | $\sigma_t^2$ (Å²) | Covector, Euclidean, flat | Riemannian, metric, flat | Riemannian, metric, metric noise |
|---|---|---|---|---|
| E1 Cartesian output range (max/min) | $10^{-4}$ | 19 (18.8) | 22 (21.9) | 20 (20.3) |
| E2 learnable loss spread | $10^{-4}$ / $10^{-2}$ / 0.5 | 354 / 24 / 1.2 | 1.2 / 17 / 330 | 1 / 1 / 1 |
| E2 target second-moment spread | any | 1 | 412 | 1 |
| E3 Jacobian condition | $10^{-4}$ / $10^{-2}$ / 0.5 | 354 / 24 / 1.2 | 1.2 / 17 / 330 | 1 / 1 / 1 |
| E3 Lipschitz constant | $10^{-4}$ | 1,420 (1,416) | 1.0 | 1.0 |
| E4 information spread (nats) | $10^{-4}$ / $10^{-2}$ / 0.5 | 2.9 / 1.6 / 0.1 | same | 0 |

**Half-destruction under the trusted schedule (derived here).** Flat noise: $\mathrm{SNR}_k=1$ ⇔
$e^{B(t)}-1=1/\lambda_k$ ⇔ $B=\log(1+1/\lambda_k)$, $t_{1/2}=\big(-0.1+\sqrt{0.01+39.8B}\big)/19.9$.
Metric-shaped VP noise: $\mathrm{SNR}=\alpha_t^2/\sigma_t^2$ for every mode, $B=\log2$.

| Mode | $\beta k$ (Å⁻²) | width (Å) | $t_{1/2}$ flat | $\sigma_{t_{1/2}}$ (Å) | share of trained $t\in[0.01,0.99]$ with SNR ≥ 1 | share of likelihood weight |
|---|---:|---:|---:|---:|---:|---:|
| bond 1–2 / 4–5 | 1650 | 0.0246 | 0.0043 | 0.0246 | 0 % | 0 % |
| bond 2–3 | 1160 | 0.0294 | 0.0056 | 0.0293 | 0 % | 0 % |
| bond 3–4 | 1110 | 0.0300 | 0.0057 | 0.0300 | 0 % | 0 % |
| one–three 1–3 | 460 | 0.0466 | 0.0106 | 0.0466 | 0.06 % | 0.002 % |
| one–three 3–5 | 410 | 0.0494 | 0.0114 | 0.0493 | 0.14 % | 0.004 % |
| one–three 2–4 | 300 | 0.0577 | 0.0139 | 0.0576 | 0.40 % | 0.014 % |
| torsion (basin) | 25 | 0.200 | 0.0580 | 0.196 | 4.9 % | 0.38 % |
| softest | 4 | 0.500 | 0.1448 | 0.447 | 13.8 % | 2.2 % |
| **any mode, metric noise** | — | — | **0.259** | — | **25.4 %** | **7.0 %** |

The 0.40 % / 0.014 % row reproduces note 21 §5.2 ("the softest one–three distance is resolved in 0.4 %
of times and 0.014 % of the weight"). At $t=1$, $\alpha_1=0.0066$.

**Note 21 Prop 5 table (as published):**

| $t$ | σ (Å) | SNR bonds | SNR one–three | SNR softest modes | SNR metric noise |
|---|---|---|---|---|---|
| 0.01 (trusted floor) | 0.045 | 0.30–0.46 | 1.1–1.7 | 20–125 | 501 |
| 0.003 | 0.020 | 1.6–2.4 | 5.6–8.6 | 103–642 | 2,567 |
| 0.001 | 0.0105 | 5.5–8.4 | 20–30 | 364–2,274 | 9,095 |

(My recomputation with the 1110–1650 bond range gives 1.56–2.31 and 5.51–8.19 for the bond entries at
$t=0.003$ and 0.001; the published upper ends correspond to a slightly softer bond, immaterial.)

### 3.2 Two-mode harmonic molecule and mobility (note 19 §1)

$A=\tfrac12x^\top Kx$, $C=\theta K^{-1}$, $\alpha=-Kx/\theta$; with mobility $M$:
$dX=-MKX\,dt+\sqrt{2\theta M}\,dW$, $E_t=e^{-MKt}$,
$\mathrm{Cov}(X_t)=C+E_t(C_0-C)E_t^\top$ (uses $MKC+CKM=2\theta M$); conditional covariance from a fixed start
$Q_t=C-E_tCE_t^\top$, conditional score $-Q_t^{-1}(x-E_tx_0)$.
- $K=\mathrm{diag}(100,1)$, $\theta=1$, $M=I$: relaxation rates 100 and 1; explicit Euler needs $\Delta t<2/100$.
  $M=K^{-1}/\tau$: every rate $1/\tau$, same covariance; in $y=C^{-1/2}x$ independent OU processes.
- **Correlated modes.** $K=R\,\mathrm{diag}(100,1)R^\top$, $R=\tfrac1{\sqrt2}\begin{pmatrix}1&-1\\1&1\end{pmatrix}$: both
  diagonal stiffnesses are 50.5; diagonal scaling leaves the ratio 100; full whitening removes it.
- **Misaligned mobility is worse than none.** $K=\mathrm{diag}(100,1)$, $M=R\,\mathrm{diag}(0.01,1)R^\top$
  ($M=\begin{pmatrix}0.505&-0.495\\-0.495&0.505\end{pmatrix}$, derived here): eigenvalues of $MK$ have sum 51.005 and
  product 1, i.e. ≈50.985 and ≈0.0196 (derived here), ratio ≈2600 — versus 100 for flat mobility and 1 for
  aligned $K^{-1}$. Same-trace rescaling changes clocks, not ratios. "Knowledge of stiffness without correct
  mode alignment can be counterproductive." ($MK$ is not symmetric but is similar to $K^{1/2}MK^{1/2}$, so its
  rates are positive.)

### 3.3 Good density and good force prefer different models (note 19 §2)

$K=\mathrm{diag}(100,1)$, $\theta=1$, model precisions $\widehat K$, expectations under the truth:
$\mathrm{KL}(p\|\hat p)=\tfrac12\{\mathrm{tr}(\widehat KK^{-1})-d-\log\det(\widehat KK^{-1})\}$,
$\mathbb E\|\hat F-F\|^2=\mathrm{tr}[(\widehat K-K)^2K^{-1}]$, $D$-weighted score error $\mathrm{tr}[(\widehat K-K)K^{-1}(\widehat K-K)K^{-1}]$ (derived here, reproduces the table).

| Model | $\widehat K$ | KL | Cartesian force error² | score error weighted by $D=K^{-1}$ |
|---|---|---:|---:|---:|
| A: 10 % stiff-mode error | diag(90, 1) | 0.0026803 | 1 | 0.01 |
| B: 50 % soft-mode error | diag(100, 0.5) | 0.0965736 | 0.25 | 0.25 |

A has the better density and the smaller covariance-weighted score error but four times the force error.
**Circle:** uniform truth, $\hat p_n(s)=e^{\varepsilon\cos ns}/[2\pi I_0(\varepsilon)]$:
$\mathrm{KL}=\log I_0(\varepsilon)$ (independent of $n$), $\mathbb E|\hat F_n-F|^2=\theta^2\varepsilon^2n^2/2$; with
$\varepsilon_n=n^{-1/2}$, KL → 0 while force error diverges.

### 3.4 A curved thermal valley with an exact all-time score (note 19 §3)

$s\in S^1$, signed fast $r\in\mathbb R$, $A(r,s)=V(s)+\tfrac k2[r-a\cos s]^2$, $\sigma^2=\theta/k$,
$z=(r-a\cos s)/\sigma$; then $p_0(z,s)=\varphi(z)\nu_0(s)$, $\nu_0\propto e^{-V/\theta}$. Noising
$dZ=-\lambda Z\,dt+\sqrt{2\lambda}\,dW_z$, $dS=\sqrt{2\kappa}\,dW_s$ keeps $p_t=\varphi(z)\nu_t(s)$,
$\partial_t\nu_t=\kappa\partial_s^2\nu_t$; score $(-z,\partial_s\log\nu_t)$ exactly. Pulled-back metric
$$g=\frac{(dr+a\sin s\,ds)^2}{\lambda\sigma^2}+\frac{ds^2}\kappa,\qquad D=g^{-1}=\begin{pmatrix}\lambda\sigma^2+\kappa a^2\sin^2s&-\kappa a\sin s\\-\kappa a\sin s&\kappa\end{pmatrix},\qquad\det D=\kappa\lambda\sigma^2 .$$
Itô for $r=a\cos S+\sigma Z$: $dr=[-\lambda(r-a\cos s)-\kappa a\cos s]dt+\sigma\sqrt{2\lambda}dW_z-a\sin s\sqrt{2\kappa}dW_s$
(the **curvature drift** $-\kappa a\cos s$ is required). $a=0$ recovers independent OU and circle
diffusion; $\lambda\sigma^2=\kappa=1$ gives $g=I$. Physical covector:
$\alpha_r=-(r-a\cos s)/\sigma^2$, $\alpha_s=\partial_s\log\nu_t-\frac{a\sin s}{\sigma^2}(r-a\cos s)$; at $t=0$
$F_r=-k(r-a\cos s)$, $F_s=-V'(s)-ka\sin s(r-a\cos s)$ — the fast restoring force leaks into the slow
force through the curved mean. A mean error $\delta(s)$: KL $=k\delta^2/(2\theta)$ but squared fast-force
error $k^2\delta^2$, i.e. $2\theta k$ times larger: narrow conditionals demand accurate means.

### 3.5 Periodicity, coupled torsions, entropy, mixtures (note 19 §4–7)

- **One torsion:** $\nu_0=(1+\epsilon\cos ns)/2\pi$ → $\nu_t=(1+\epsilon e^{-\kappa n^2t}\cos ns)/2\pi$, score
  $-n\epsilon e^{-\kappa n^2t}\sin(ns)/[1+\epsilon e^{-\kappa n^2t}\cos(ns)]$, TV to uniform
  $|\epsilon|e^{-\kappa n^2t}/\pi$ (verified: $\int_0^{2\pi}|\cos ns|ds=4$, derived here). With $n=2$ the
  valley stays narrow while basin information is erased.
- **Two torsions:** $\nu_0=[1+\epsilon\cos(s_1-s_2)]/(2\pi)^2$, uniform marginals, nontrivial joint;
  $\nu_t$ decays at rate $\kappa_1+\kappa_2$. No sum of one-angle energies identifies the coupling.
  **A smooth positive metric cannot supply a missing phase preference**: $V_\pm=\pm b\cos s$ share the
  thermal-valley metric and have opposite forces.
- **State-dependent conditional (Example 5):** $z=L(s)^{-1}[r-a(s)]$,
  $A/\theta=\tfrac12z^\top z-\log\nu_0(s)+\log\det L(s)+\log m+$const;
  $\alpha_s=\partial_s\log\nu_t+(a'+L'z)^\top L^{-\top}z-\mathrm{tr}(L^{-1}L')$; replacing $L$ by $L(s)O(s)$ leaves
  the density but changes the process: conditional covariance does not fix a noising law.
- **Entropic force on a flat floor (Example 6):** $A=V(s)+\tfrac12r^\top K(s)r$ gives
  $A_{\rm slow}=V+\tfrac\theta2\log\det K(s)$, $F_{\rm slow}=-V'-\tfrac\theta2\mathrm{tr}(K^{-1}K')$. With
  $k(s)=k_0e^{2b\cos s}$, constant $V$: $A_{\rm slow}=\theta b\cos s$, $F_{\rm slow}=\theta b\sin s$ — wider
  regions hold more microstates; whitening removes the varying width but not this entropy.
- **Mixture (Example 7):** equal mixture of $\mathcal N(\pm a,\sigma^2)$:
  $\partial_r^2[-\log p](0)=\sigma^{-2}-a^2\sigma^{-4}<0$ for $a>\sigma$: the negative log-density Hessian is
  not a metric. Hard wall $r>b(s)$: $Z_{\rm wall}=1-\Phi((b-a)/\sigma)$, PMF term $-\theta\log Z_{\rm wall}$.
  Hidden contact $b=\pm1$: $A=U_{\rm local}-\theta\log(2\cosh\frac{Jf(r)+h(s)}\theta)$, local force depends on
  $s$ through tanh.

### 3.6 "Physical-looking" metrics that fail (note 19 §8)

$g=dA\otimes dA$ (rank ≤ 1, sign-blind); $g=\mathrm{Hess}A$ (indefinite at saddles, Example 7); $(\mathrm{Hess}A)^2$
(PSD but singular, sign lost); pair-distance-only (mirror-blind, out-of-plane derivatives vanish at planes);
huge planarity penalties (barrier at valid planar states — the original $w^\delta$ problem); projection to a
zero-width valley; kinetic mass metric used as thermal covariance. **Projection example:**
$r\sim\mathcal N(0,\theta/k)$: $\mathbb Er^2=\theta/k$ but $\mathbb EF_r^2=k\theta$ — as $k\to\infty$ the positional
error of dropping $r$ vanishes while the omitted force variance diverges.

### 3.7 Equilibrium cannot identify kinetics (note 19 §9)

$dx=-(k/\gamma)x\,dt+\sqrt{2\theta/\gamma}\,dW$: $\mathrm{Var}=\theta/k$, $\mathrm{Corr}(x_t,x_0)=e^{-kt/\gamma}$;
friction ×100 keeps the histogram and slows relaxation ×100. Two-state rates $a$:
$P_\tau=\tfrac12\begin{pmatrix}1+e^{-2a\tau}&1-e^{-2a\tau}\\1-e^{-2a\tau}&1+e^{-2a\tau}\end{pmatrix}$,
$\pi=(\tfrac12,\tfrac12)$ for every $a$, kinetic distance $d_\tau^2(0,1)=4e^{-4a\tau}$.

### 3.8 Hidden noising parameters break transfer (note 19 §10)

$X_0\sim\mathcal N(0,\tau^2)$, $X_t=X_0+\sigma\sqrt t\,\varepsilon$: $\alpha_t(x;\sigma)=-x/(\tau^2+\sigma^2t)$; two
hidden noise scales demand different answers at the same visible $(x,t)$; unweighted regression learns
the mixture score. Hidden centre $b$ in $dX=-\kappa(X-b)dt+\sqrt{2\kappa v}dW$ (mean $(1-a)b$, variance
$a^2\tau^2+(1-a^2)v$, $a=e^{-\kappa t}$) changes the score with the metric unchanged.

### 3.9 The 5 % error example and what the samples feel (note 20 §4.4; note 21 §6)

Two predictions 5 % off at one thermal width, one soft and one stiff: $\delta s_k=0.05/\sigma_k$.
Euclidean loss charges $\delta s_k^2=0.0025\lambda_k$ (stiff costs κ times more); both change the generated
distribution by $\mathrm{KL}=\tfrac12(\delta s_k\sigma_k)^2=\tfrac12(0.05)^2$; the metric loss charges
$\delta s_k^2/\lambda_k=0.0025$ in either mode. **Reverse diffusion [N]:** injecting a score error of 5 % of
the score's std in every mode at every $t$ gives endpoint KL (units of $\tfrac12(0.05)^2$) of 3.97–4.00
under flat noise for every stiffness and 3.95 under metric noise; the likelihood bound is 11.4–17.5 flat
versus 10.1 metric. Summed over noise levels with likelihood weighting the stiff over-charge of the
Euclidean loss is additive, about $\log\kappa$: **a factor of 1.5 on ALDP5 (17.5 vs 11.4)**, not κ.

### 3.10 Pull versus move: the planar four-atom chain (note 20 §2 [N])

Sticks 1.5 Å, angles 112°, springs on sticks 1,500 Å⁻² and on angles 280 rad⁻², $\gamma=25$ Å⁻²; widths
0.026 Å (sticks), 3.3° (angle), 16.5° (twist). Start with stick 3–4, the angle at atom 3 and the twist
each one width off; compare a Euclidean step along $s$ and the Riemannian move at equal length 0.21 Å;
first-order changes in thermal widths:

| Coordinate | Euclidean step | Riemannian move |
|---|---|---|
| Stick 3–4 | −10.3 | −1.0 |
| Other sticks | +1.5, +3.7 | 0.0 |
| Angle at 3 | −0.8 | −1.0 |
| Twist | −0.1 | −1.0 |

Pulling the end atoms apart: Euclidean step stretches end sticks by 1.1 widths and opens angles by 0.1;
the move gives 0.35 and 0.5. Second-order leakage along a straight step ≈ half a width on neighbouring
sticks, independent of the metric. *Earlier variant (dec85338 §5.5)*: weights 1500 on sticks and 400 on the
pairs two apart, $\gamma=25$; a 0.05 Å stretch of stick 3–4 pulls with 75 $k_BT$/Å on atoms 3–4 only
(pull shares 0/0/50/50) but the move (shares 17/12/38/33) shortens the stick by 0.049 Å, atoms 1–2
follow, and the hinge at atom 3 opens by 2.7°; end-pull: move opens both hinges by 10.8° with sticks
changed ≤ 0.03 Å, while moving along the pull would stretch end sticks by 0.10 Å (four widths) and
open hinges by only 1.4°; a twist is a pure twist with $v=s/\gamma$.

### 3.11 Training curvature in numbers (note 20 §4.5; note 21 §4.3)

Idealized one-basin model at low noise: Cartesian inputs + Riemannian target + metric loss have curvature
$\mathrm{cond}(S_t)\kappa(G)\approx1.5\times10^5$ (= 356 × 415) versus 356 for the flat model; from a
random start GD needs > 20,000 steps versus 1,504; thermal inputs/outputs: curvature 1.2 and 3 steps.
ALDP5 β/C7eq window, fixed spring metric, $\sigma_t^2=10^{-4}$ Å² (modes rotated against the weights,
trained to $10^{-4}$ of the initial excess loss; $\kappa(G)=132$):

| Configuration | A spread | B (singular-value cond.) | Curvature | GD from 0 | GD random | Adam |
|---|---:|---:|---:|---:|---:|---:|
| covector, Euclidean, raw | 146 | 146 | 146 | 589 | 606 | 795 |
| Riemannian, metric, raw | 3.1 | 14.2 | $1.9\times10^4$ | 24,319 | 28,130 | 3,941 |
| whitened, Euclidean, raw | 3.1 | 18.1 | 146 | 504 | 530 | 1,023 |
| whitened, Euclidean, thermal | 3.1 | **8.1** | **8.1** | **31** | **32** | **226** |

"A zero start does not protect the Riemannian pairing" when the metric's eigenvectors differ from the
data's; Adam narrows the gap to about 17× but does not close it.

### 3.12 The noise-level metric on ALDP5 (note 21 Theorem 3)

Window with the spring metric: $c\in[0.398,3.290]$, bound $3.290/0.398=8.27$.

| $\sigma_t^2$ (Å²) | $10^{-4}$ | 0.002 | 0.01 | 0.1 | 0.5 |
|---|---|---|---|---|---|
| Noise-level metric $G_t$ | 6.7 | 3.0 | 2.2 | 1.3 | 1.0 |
| Fixed $G$ | 8.1 | 13.5 | 40.5 | 109 | 129 |
| No metric | 146 | 27.4 | 6.9 | 1.6 | 1.1 |

### 3.13 Sampler stiffness (note 21 Prop 7)

Clock range 10, $c=1$: a graded grid needs 17.4 steps under flat noise (excess $\log\lambda_{\max}=\log1659=7.4$)
versus 10 under metric noise; a uniform grid needs 16,590 (= 10 × 1659) versus 10.

### 3.14 Rotating bonds and the spring-metric cone (note 21 §7.2; note 20 §5.2)

ALDP5 β/C7eq window, window-Gaussian score as proxy [M]:

| γ (Å⁻²) | $\varepsilon_{\rm rot}$ | ‖R‖/‖frozen part‖ median / 95 % | Lipschitz ratio median / 95 % | Residual stiffness |
|---|---:|---:|---:|---:|
| 10 | 2.7 | 1.28 / 3.07 | 1.70 / 3.41 | 13.9 |
| 30 | 0.90 | 0.70 / 1.66 | 1.27 / 2.23 | 8.3 |
| 100 | 0.27 | 0.26 / 0.73 | 1.06 / 1.45 | 13.0 |

Check (derived here): $\sigma_w=30^{-1/2}=0.183$ Å, $\sigma_s\approx0.025$ Å, $d\approx1.48$ Å give
$\varepsilon_{\rm rot}=0.0333/(1.48\times0.025)\approx0.90$. Cone curvature for one bond:
$K_{\rm tan}=4w/(\gamma(\gamma+2w)r^2)$; e.g. $w=1500$, $\gamma=30$, $r=1.5$ Å gives
$6000/(30\cdot3030\cdot2.25)\approx0.029$ Å⁻² (derived here, illustrative). The internal-coordinate stretch
pays for flatness by coupling the angular scale to bond stretch, "about ±35 % at ±3σ" (note 20 §6.3).

### 3.15 Two basins: what no constant metric fixes (note 21 Prop 10)

Torsion-like basins 2 Å apart ($m=1$ Å), width 0.2 Å ($S=0.04$ Å²): $r=25$, roughness $r^2-1=624$. Flat VP
noise reduces it to 397, 149 and 11 at $\sigma_t^2$ = 0.01, 0.04, 0.2 Å² (reproduced with
$r'=\alpha_t^2m^2/(\alpha_t^2S+\sigma_t^2)$, derived here).

### 3.16 Manufactured checks of the physical-density contract (note 17)

- One chart, $m(x)=e^{0.2\sin x}$, $g(x)=1+0.4x^2$, $\rho\propto e^{-x^2/2}$, $k_BT=1$:
  $d\log J_g=\frac{0.4x}{1+0.4x^2}-0.2\cos x$ and $g\,s_g+d\log J_g=-x=F$ for every such metric;
  $b=\tfrac a2D(-x)$ makes the physical flux zero. Omitting the volume correction or the chart drift fails.
- $dY=-Y\,dt+\sqrt2\,dW$, $X=\sinh Y$: $D(x)=1+x^2$, $B(x)=-\mathrm{asinh}(x)\sqrt{1+x^2}+x$, density Jacobian
  $(1+x^2)^{-1/2}$; tests with $m=1$ and $m=e^{0.2\sin x}$ compare fixed-measure reverse drift and flow with
  the exact OU reversal.
- Note 18's check: standard-normal clean density, variable positive covariance, quadrature orders 192 and
  256; the first 128-node check missed the unchanged $2\times10^{-8}$ tolerance (max difference
  $8.77\times10^{-7}$), resolved by refining quadrature, not loosening.

### 3.17 Second moments → metric weights (note 24)

Second moments 0.01 and 1 give optimal weights 100 and 1 (both weighted moments become 1); per mode the
excess loss is the bowl $f(\mu)=\mu-\log\mu-1$ with unique minimum 0 at $\mu=1$.

### 3.18 Same metric, different denoising difficulty: line versus helix (note 28 §3)

$x\sim\mathcal N(0,1)$; line $\Phi_0(x)=(x,0,0)$; helices
$\Phi_\omega(x)=(\frac{\sqrt{1-b^2}}\omega\cos\omega x,\frac{\sqrt{1-b^2}}\omega\sin\omega x,bx)$ with
$\|\Phi'\|^2=1$ (same metric, density, rank). With $b=0.1$, $\omega\in\{4,16\}$, $\sigma=0.1$: posterior
variance of $x$ is 0.01 for the line and about 0.50 for either helix. **Explanation (derived here, checked
by quadrature: 0.0099, 0.496, 0.500):** the line gives $\sigma^2/(1+\sigma^2)=0.0099$; for the helix, noise
of 0.1 is comparable to the pitch spacing $2\pi b/\omega$ (0.157 for ω = 4) and the angular position is
aliased across turns, so effectively only $z=bx$ informs $x$: posterior variance
$1/(1+b^2/\sigma^2)=0.5$.

### 3.19 Redundancy, three covariances, small-noise trap (note 28 §2, §4, §5)

- Normal stiffness $\alpha_t/\sigma_t$; $1/\sigma_t^2$ rises from about 502 at $t=0.01$ to 332,342 at
  $t=3\times10^{-5}$ (reproduced, derived here). BBA Gram/triple whitening: $M=3303$ features, 78 shape degrees
  of freedom, 3,225 normal directions.
- OU coordinates with stiffness 1 and 100 at lag $10^{-4}$: increment covariance condition 1.005, while the
  equilibrium variance condition **after whitening by that increment covariance** stays 99.5 (my reading of
  the note's numbers: whitened equilibrium variances 10000.5 and 100.5, derived here).
- Predictable fraction $\tau^2/(\lambda+\tau^2)$; peak residual slope $(1-\lambda)/(2\sqrt\lambda)$; for BBA's
  Sprint 12 spring channels $\lambda=1/27.12^2$ and the peak is about 13.5 (13.54, derived here).

### 3.20 Readout controls: how not to measure a thermal metric (#778 historical report)

- $dX=-HX\,dt+\sqrt2\,dW$ ($k_BT=1$), stationary covariance $H^{-1}$,
  $\tfrac12\mathbb E[(X_{t+\tau}-X_t)(X_{t+\tau}-X_t)^\top]=H^{-1}(I-e^{-H\tau})$. $H=\mathrm{diag}(1,1000)$,
  $\tau=10^{-4}$: the *correct* metric $G=H$ whitens equilibrium perfectly, yet its whitened step second
  moment $I-e^{-H\tau}$ has condition > 900 (951.7, derived here), while the unwhitened step readout is
  < 1.1 (1.051): a short-lag ranking prefers flat although the thermal variance ratio is 1000.
- Cylinder $F(\theta,z)=(\cos\theta,\sin\theta,z)$, pullback metric $I$: isotropic intrinsic steps of std σ,
  projected onto the source tangent, retain $\frac{(1-e^{-2\sigma^2})/2+\sigma^2}{2(1-e^{-\sigma^2/2})+\sigma^2}$ —
  below 93 % at σ = 0.5 (0.921, derived here); anchor variation with source std $a$ retains
  $3/4+e^{-2a^2}/4$ (90.2 % at $a=0.5$).

### 3.21 Design C: frozen Gaussian targets for spring-metric noise (dec85338 §6.9)

Process $dx=\tfrac12(-a\nabla E+\nabla\!\cdot a)du+a^{1/2}dW$, $a=(J_d^\top WJ_d+\gamma I)^{-1}$; stiff-to-soft
noise ratio $s=\sqrt{\bar w_{\rm bond}/\gamma}\approx37$ (γ = 1) or ≈7 (γ = 30). Relative error ρ of a
frozen local-linearization target over window $w$ at $u=0.1$ (64 starts × 256 continuations):

| $w$ | γ=1: ρ | $c_{\max}$ | γ=30: ρ | $c_{\max}$ |
|---|---:|---:|---:|---:|
| $10^{-4}$ (exact control) | 0.00 | 1.41 (floor) | 0.00 | 1.41 |
| $4\times10^{-4}$ | 0.03 | 1.68 | 0.00 | 1.40 |
| $1.6\times10^{-3}$ | 0.34 | 3.96 | 0.00 | 1.40 |
| $6.4\times10^{-3}$ | 1.88 | 12.7 | 0.00 | 1.40 |
| $2.56\times10^{-2}$ | 7.70 | 44.3 | 0.00 | 1.43 |
| 0.1 (full window) | 22.3 | 125 | 0.015 | 1.55 |

Mechanism: a bond that keeps its length while turning moves its atom along the old axis by
$\approx\delta^2/(2r)$; ρ ≈ 0.1–0.5 × $(s\delta/r)^2$. Keeping ρ ≲ 0.1 requires soft displacement per window
$\lesssim0.8/s$ Å (≈0.1 Å for $s\approx7$, ≈0.02 Å for $s\approx37$), raising target variance by $10^2$
($s\approx7$) to $2\times10^3$ ($s\approx37$). ISM/sliced matching removes the bias but not the step limit.

### 3.22 Linear DSM force study (dec85338 §6.10 = note 20 §8)

ALDP5 basin windows, 9 internal directions; linear least squares on DSM pairs; noise
$\sigma_t=\sqrt{0.05\lambda_{\min}}$ in each representation (bias ≤ 5 %); errors per $x$-mode in thermal units,
20 seeds; β/C7eq (αR in parentheses):

| Frames | Flat stiff | Flat soft | Magnified stiff | Magnified soft | Cartesian MSE magnified ÷ flat |
|---|---:|---:|---:|---:|---:|
| 500 | 1.16 | 7.11 | 1.19 | 1.52 | 1.27 |
| 2,000 | 0.58 (0.59) | 3.32 (2.76) | 0.58 (0.59) | 0.75 (0.64) | 1.23 (1.29) |
| 10,000 | 0.26 | 1.49 | 0.27 | 0.34 | 1.23 |

Noise sweep at 2,000 frames (β, stiff / soft): 0.004 Å: flat 0.56 / 3.41, magnified 2.46 / 3.40;
0.016 Å: 0.30 / 0.79 vs 0.61 / 0.84; 0.064 Å: 0.80 / 0.18 vs 0.29 / 0.24. **Flat cannot make both accurate
at one noise level; the magnified representation reaches 0.29 / 0.24 at the largest level.** Soft forces
≈4.4× more accurate (prediction $\sqrt{\kappa_x/\kappa_y}$ = 3.3 β, 3.1 αR); 500 magnified frames match 10,000
flat frames on soft forces (≈19×). Per-coordinate map (2,000 frames): bond stretch slopes 6.1–7.4, angle
2.6–2.9, torsion 1; Cartesian-MSE weight ÷ $y$-loss weight 37–55 (bonds), 6.5–8.4 (angles), 0.9–1.0
(torsions). Jacobian term: each power-stretched bond contributes $3(s_b-1)\log(r/r_b^0)$ to
$\log|\det D\Phi|$, a radial force $3(s_b-1)k_BT/r$ ≈ 14 $k_BT$/Å per ALDP5 bond; omitting it shifts bonds by
−0.30 to −0.36 widths and angles by +0.08 to +0.13 (estimate $-3(s_b-1)\sigma_b/r_b^0=-0.355$ for the first bond).

---

## 4. Key empirical results (with system, budget, seeds, source and caveats)

### 4.1 Residual stiffness of candidate metrics on ALDP5 (note 20 §5.3, [M], 2026-10-23)

$\kappa=\mathrm{cond}(G^{1/2}\Sigma G^{1/2})$, 9 internal directions, ±45° windows, 200,000-frame subsample in a
common frame; windows hold 63,770 / 61,018 / 1,065 frames. **Spring weights and stretch factors come from the
same data (in-sample). "Conditioning is not a learning result."**

| Metric | β / C7eq | αR | αL |
|---|---:|---:|---:|
| Flat (Euclidean) | 192 | 112 | 97 |
| Fixed global $\Sigma^{-1}$, aligned frame | 273 | 477 | — |
| $w^\delta$, δ = 1 / δ = 0.1 | 413 / 58 | 315 / 37 | 631 / 76 |
| Planar-compatible $w^\delta$ | 230 | 181 | 359 |
| Graph Laplacian $(I+L)\otimes I_3$ | 114 | 76 | 80 |
| Convex chemical pullback (#624) | 53 | 42 | 58 |
| `local_chemical_v1` | 65 | 38 | 41 |
| **Spring-force metric, γ = 30** | **9.6** | **7.6** | **13.4** |
| Internal-coordinate pullback, γ = 30 | 17.5 | 11.4 | 22.3 |

Long version (dec85338 §6.2): springs γ = 10 give 15.6 / 14.9 / 38.0 and γ = 100 give 12.6 / 7.6 / 7.7;
after the spring metric the whitened eigenvalues still range 0.4–3.9 (untested causes: one isotropic γ for
two torsions of different width; stretch–bend coupling). Flow magnifier (equivariant time-1 flow) at
strength ×0.6: 42.9 / 22.0 / 21.6 versus tree magnifier 17.6 / 12.5. Note 21's window statistics (all 254,328
β/C7eq frames of 800,000, window frame) give 8.3 (spring) and 191 (flat) at zero noise — slightly different
from 9.6/192 because of the subsample and frame.

### 4.2 Sprint 10 measurements that framed the question (archive status, investigations)

| Package (date) | System, budget, seeds | Result |
|---|---|---|
| #528 local metric panel (2026-10-19) | ALDP, 128 anchors, frozen defaults | Bond-variance reduction at matched displacement: chemical −38 %, planar −86 %; median condition numbers 3.4 / 293 |
| #529 calibrated comparison (2026-10-19) | 128 anchors, 49,152 perturbations | At matched bond disturbance planar allows 3.70× flat torsional RMS, chemical 1.49× |
| #529 endpoint weighting (2026-10-19) | ALDP 5 beads, 4,096 train / 1,024 eval frames, 3 paired seeds, 1,000 Adam updates | Planar inverse-metric loss weighting: force MSE +5.92 % / +6.89 % / +8.20 % (worse) |
| #529 noisy force fitting (2026-10-19) | 6 fits | Chemical noising 4.3–4.8 % better than flat noising, 66–68 % worse than clean endpoint |
| #529 curved torsion noising (2026-10-19) | 6 fits | 37.3–38.3 % better than flat noising, only 0.066–0.094 % below endpoint; gate fails |
| #603 configuration-only pairs (2026-10-20) | 15 fits, 3 seeds, 16,384 pairs per metric | Chemical prior: better density and populations in all seeds, force MSE +13.8–27.8 % vs flat; worse bond/bend, better torsion errors |
| #606 force coverage (2026-10-20) | 6 fits | Mixture: force MSE −0.13–3.24 %, density risk −10–24 %, populations worse |
| #612 smooth corrections (2026-10-20) | 9 fits | Global density correction: basin TV .407–.441 → .022–.035, force gain kept |
| #615 matched calibration (2026-10-20) | 6 fits | Mixture 1.36–1.40 % lower force MSE; flat wins one seed; joint criteria fail |

### 4.3 What the theory notes measured (CPU, no training)

- ALDP5 thermal widths and stiffnesses (§3.1); residual stiffness (§4.1); pairing GD steps (§3.11);
  noise-level metric (§3.12); rotating-bond term (§3.14); design C frozen targets (§3.21); linear DSM
  force fits (§3.22); prior mismatch $\mathrm{KL}(p_1\|\mathcal N(0,I))=1.5\times10^{-8}$ nats for the
  rotation-augmented law and $2.7\times10^{-4}$ nats for one fixed orientation ("the prior is not a
  concern"); Lemma 3 noise covariance within 0.5 % over 400,000 draws.
- Note 19's 22 manufactured cases all passed (11 float32 + 11 float64; 30.34 s, 1.233 GiB peak RSS).

### 4.4 Sprint 11 on ALDP5 (exploratory pilots outside the benchmark pipeline)

| Line | Budget, seeds | Result | Source |
|---|---|---|---|
| Learned warp (#753) | one held-out mdshare trajectory | Median local condition 184 → 3.0 (floor 1.55) ALDP5; 1780 → 3.6 ALDP10 | #769 table |
| Learned coordinates (#754, CPU MLP) | up to 200k steps | Bonds/angles at floor within ~1,000 steps; production-floor flat bond PMF error 1.2 $k_BT$ vs 0.06; no torsion or data-efficiency gain; low-floor flat needs 100k–200k steps for bonds | status.md, learned-stiffness-diffusion-pilot |
| Feature-space evaluation (#765) | 3 seeds/arm, ALDP5 traj 0 (250,000 frames), up to 200k steps | Spring features: bond W1 10× better than best flat at 1k steps, 5× at 5k, 3.7× at 20k; bonds at floor ~100× sooner, angles 10–20×, coupling ~10×; torsion JS at 200k 0.0201 (spring), 0.0199 (wδ) vs 0.0207 (flat) — "suggestive, not established"; αL ΔF error 0.016 (flat) vs 0.077 (spring) at 20k | feature-space-evaluation.md |
| Force fields (#768) | same models, Brownian dynamics, 40,000–60,000 steps | Stiff-direction force check 0.91–1.03 (learned, spring); flat production floor 0.20–0.29 (3–5× too soft); spring/learned bond W1 0.064/0.072 widths, angles 0.042/0.044; flat low floor wrong torsion landscapes (JS 0.08–0.19, e.g. 83 % αR vs 35 %) | force-field-simulation.md |
| Information retention (#927/#926) | ALDP5 | Flat erases stiff information at 10–20× smaller noise; reallocating flat training times there lowers bond error 21–45 % but worsens angles/torsions early | status.md |
| Covariance-aware prediction (#890) | 6 geometries, 2 seeds, 20k updates | Noise loss −0.38–3.98 %; torsion JS worse in 5 of 6 | covariance-aware-prediction.md |
| Quantum springs (#778) | 16 quantum starts | Residual condition 4.12 at input (flat 1030.4); 3.99–45.84 across conformations (median 14.28): fails; combined-reference map later 6.75 / 12.58 vs Cartesian 159.27 / 1030.50 | data-free-spring-features.md |

### 4.5 BBA: where whole-molecule stiffness removal broke (Sprint 11 closeout; #1025)

- **#895** (BBA, 200k updates × batch 128, 2 seeds, 100,000 iid per model): bond W1 flat 0.6371 Å, springs
  0.0122 Å (52×), wδ 0.1688, whitening 0.1170; TIC JS flat 0.0529, springs 0.0479, wδ 0.0889, whitening 0.2499;
  PMF flat 0.560, springs 0.582, whitening 4.832 (kBT)². Capacity caveat: the first layer limits the energy to
  1,792 linear combinations, so 1,511–1,993 feature directions of whitening/graph maps receive no correction.
- **Resolution test (#1025)**: median thermal resolution noise relative to each map's smallest training noise
  (≤ 1 = never resolved): springs bond 0.84, angle 1.2; wδ bond 1.25; internal Rg 3.0; Cartesian bond 6.4 (but
  Cartesian σ(t_min) = 0.0010); on ALDP5 the same recipes resolve every observable at 11–31 σ(t_min).
- **Mechanisms**: springs — one global RMS divisor 27.1 (1.31 on ALDP5) puts spring-channel std 0.037 below
  σ(t_min) = 0.045; whitening — tangent share of untrained loss below t = 0.1 is 0.06 (Cartesian 1.00,
  internal 0.75), bonds still 11× stiffer than torsions, loss 911 → 904 → 759; internal coordinates — size
  the least-resolved quantity (collective lever arm); BBA "placement law" headroom $\langle R^2\rangle$ = 10.6
  vs 2.8 for ALDP5.
- **Analytic conditional bond score** (note 28 §6 construction, #1023, 100,000 updates, 2 seeds): bonds
  accurate from the first update, angles improve 19–23 % 20k → 100k, but size W1 stays 0.667–0.715 Å (matched
  reference range 0.0307–0.0732 Å); bond pairs ≥ 6 positions apart carry 89–99 % of the excess squared size.

### 4.6 Objective-side tests of E1–E3 (#780 line; denoising-targets-and-sensitivity-weighting.md)

About thirty comparisons (ALDP5 + BBA, 2 seeds, 10,000 updates, 1,024 molecules per panel unless stated):
no consistent two-system generation gain. Posterior-averaged targets reduce gradient variance (3.5×, 9.1×,
88× at t = 0.1, 0.2, 0.4 on an ALDP5 spring model; no gain at t ≤ 0.02) but held-out prediction risk changes only by −0.16 / −0.09 % (ALDP5) and +0.12 / −0.88 % (BBA) (#1056); BBA flat vs spring
(20k updates, 3 seeds, 100k requests) gains 4–6 % on global errors for *both* maps (below the 10 % margin),
spring keeps a ~34× bond advantage in generation and ~2.7× in short simulations. Physical-sensitivity
weighting improved BBA size W1 0.780 → 0.661 and 0.785 → 0.608 Å but raised collisions (12 → 16, 23 → 34 per
1,024). "Same objective, same Hessian": averaging or $(y,t)$-only weighting changes neither the optimum nor the
expected Hessian.

**Caveats that apply throughout:** spring constants are fitted in-sample on ALDP5; most theory numbers are
one Gaussian basin, commuting matrices or window statistics with a Gaussian score proxy; the linear force
study is a linear learner on window Gaussians (no network, no MD); Sprint 11 pilots are ALDP5-only, outside
the benchmark, with three seeds and correlated reference trajectories (each 250 ns trajectory holds only
about 100–140 independent αL samples, so torsion/rare-basin rankings beyond a few thousand steps are not
resolvable); BBA results stop at 50,000 updates (26 % of the registered budget) unless stated; the BBA
time column is a frame index ("1 ps" pairs are about 200 ps apart).

---

## 5. Why it was promising, why it failed, what was learned

### 5.1 Derived facts (hold under their stated hypotheses)

1. **Stiffness is real and large.** ALDP5 bonds 0.025–0.030 Å vs torsions 0.2–0.7 Å; residual stiffness
   97–192 in a basin, ≈920 across the data.
2. **Each flat-diffusion problem belongs to one choice.** Uneven information loss ↔ forward noise (E4,
   only the noise can fix it); badly scaled target ↔ target representation and input/output units (E1,
   E3); misweighted loss ↔ loss norm (E2). One minimizer for all (Prop 1), so all differences are about
   finite networks, optimization and noise.
3. **Under the trusted flat schedule no trained level resolves a bond** (Prop 5): the bond regime is
   learned by extrapolation in the sampler's last steps. Flat noise also makes the right ruler
   noise-dependent ($G_t$).
4. **Samples feel score errors in the data-covariance norm whatever the sampler** (Prop 8), so a metric
   loss with $G\approx\Sigma^{-1}$ weights errors by their effect on generated molecules.
5. **In its natural pairing every target learns the same map with the same loss value**; training
   curvature is $\kappa^2$ except for the whitened target with thermal inputs (curvature ≈ residual
   stiffness). This is why "thermal units in *and* out" matter, and why a flat VP model trained in
   pullback coordinates learns the whitened score of the pullback metric, up to an orthogonal frame
   (note 20 Prop 3; dec85338 Prop 5).
6. **A stiffness-following metric must depend on the configuration** (Lemma 2), so it is curved (spring
   cone), metric-shaped noise with it is approximate (Lemma 4, design C window limit), and its targets
   carry a rotating-bond term unless outputs are bond-attached.
7. **No constant metric changes multimodality** (Prop 10); a metric cannot supply phase preferences,
   basin weights or force signs (note 19 §4); equilibrium geometry cannot identify kinetics (note 19 §9).
8. **The clean force is metric-independent** (notes 17, 29); volume/Jacobian terms are exact and
   mandatory; a finite-noise score is the force of the noised density only.
9. **Force read-out has a bias–variance dilemma under flat noise** (stiff vs soft optimal noise levels
   differ by κ); metric-shaped (synchronized) noise removes it.

### 5.2 Hypotheses that motivated Sprint 11 [H]

- "Every noise level teaches every mode, instead of bonds only at the smallest noise, where the denoising
  target is noisiest"; the terminal law keeps bonds near typical values; forces can be read at a larger
  noise level (note 20 §4.6).
- Transfer: thermal-unit targets are "the same function for every molecule" for typed bonds (dec85338
  §6.8, Prop 6); spring constants are typed like force-field tables (note 20 §9).
- Deep-network heuristics: spectral bias in input coordinates favours thermal inputs; criterion C is the
  matrix form of EDM input scaling (note 21 §4 remarks, sources not checked).

### 5.3 What happened and why (the causal explanations given in the docs)

- **Confirmed for stiff modes.** Metric-shaped noise (pullback coordinates) made bonds and angles easy:
  100× / 10–20× sooner on ALDP5, BBA bonds 52× better, forces pass stiff checks; flat cannot get stiff and
  soft forces right at one noise floor — exactly E4 and the force dilemma.
- **No gain on torsions or rare basins.** Predicted in advance as a limit ("They make the stiff part easy;
  they say nothing about the multimodal torsional part, rare basins or long-range correlations", note 20
  §4.7; Prop 10). Measured: no early torsion advantage, flat learns the αL population faster; later the
  lag-100 ps warp learned torsions ~10× sooner because its coordinates Gaussianize the slow modes, a
  different lever (status.md).
- **Loss/target-only changes do not reach generation.** About thirty objective comparisons improved
  prediction but not molecules: "Each theorem behind these interventions concerns an estimator, a starting
  predictor or the ideal optimum of an objective. None of them says what a finite nonlinear network learns
  in 10,000 noisy, clipped AdamW updates" (objective-search synthesis). "Four different meanings of 'better
  conditioning'" (local moment $C(x)$, pullback metric $G$, noisy-input covariance, parameter Hessian) do
  not order one another.
- **Whole-molecule stiffness removal fails on BBA.** (i) *Scale vs floor*: the condition number is
  scale-free; a global normalization pushed spring channels below the smallest trained noise ("right
  balance, wrong scale"). (ii) *Redundancy*: high-dimensional whitening converts tangent stiffness into
  diverging normal stiffness, and 94 % of the low-noise loss lives off the molecule. (iii) *Collective
  lever arms*: whitening every local coordinate leaves size/fold as the least-resolved quantity and erases
  everything in one band (no order). (iv) *Readability*: what the network can read (pair-distance inputs)
  mattered more than noise shape for Cartesian BBA.
- **Measurement pitfalls**: short-lag step covariances measure mobility, not thermal covariance; finite
  chords lose projection energy; single-reference quantum Hessians do not cover conformations.

### 5.4 Later corrections and superseded interpretations

- **Note 21 corrected note 20 (2026-10-24):** irreducible ratio is SNR (not 1+SNR); the optimisation argument
  covers only needed weights from zero (full curvature: Theorem 2); E3 holds for a frozen metric only;
  under flat noise use $G_t$, not $G$; Problem 2 is two problems (sizes, gain), raising the index fixes only
  the gain; Problem 3 holds per noise level but only ≈1.5× when summed with likelihood weighting.
- **Design A (flat noise + Riemannian target) was first recommended, then withdrawn** before any training
  (PR #745).
- **"Internal coordinates are an ablation" (note 20 §6.2, 2026-10-23)** was overtaken: on BBA "internal
  coordinates are the best BBA map in this cohort" (#955) and internal + loud modes became the working
  hypothesis (2026-11-14).
- **"Synchronized destruction for every mode" (E4) as a whole-molecule goal** was superseded by range and
  order (2026-11-14): synchronization is right for stiff coordinates (range), wrong for collective shape
  (which should be erased last).
- **The single-reference quantum metric's favourable conditioning** (4.12) did not hold across conformations
  (up to 45.84); earlier projection/finite-step readouts that ranked it worse were invalid measurements, not
  evidence against it (#778).

---

## 6. Visualization opportunities

### 6.0 What the existing Part 1 video already shows (so new pieces go deeper)

`src/videos/part-1` ("Diffusion in the right geometry", about 5 min, 16 scenes; constants in
`src/model/physics.js`, documented as illustrative): configuration space ℝ¹⁵ (scenes 01–04); **stiffness**
— soft twist ±1.02 Å per kT ($k$ = 0.05 eV/Å²) vs stiff stretch ±0.05 Å per kT ($k$ = 20 eV/Å²), "every
direction has its own ruler", κ = 400 (05, 09); isotropic forward noise $dx=g\,dW$ with a noise ball (06);
the data as a thin sliver, σ_soft ≈ 0.72 Å vs σ_stiff ≈ 0.036 Å, ×20 (07–08); $\Sigma$, $K=\nabla^2E\approx k_BT\Sigma^{-1}$,
eigenvalues and κ (09); **Problem 1** — information-left curves $\sigma_i^2/(\sigma_i^2+\sigma_t^2)$ with a σ_t
cursor 0.001 → 1.5 Å, "×20 in noise level", at σ_t = 0.1 Å noise is 278 % of the stiff spread and 14 % of the
soft (10); the score as a covector (level lines, pairing with a direction) (11); **Problem 2** — score
magnitudes 1.39 vs 27.8 Å⁻¹, ×20 and κ = 400 in curvature (12); **Problem 3** — 5 % errors A/B cost ×400 under
the flat loss and equally under $\delta^\top G\delta$ with $\delta=s_\theta-G^{-1}\nabla\log p$ (13); **one fix**
— noise $g\,G^{-1/2}dW$, target $G^{-1}\nabla\log p$ (Jacobian $-I/k_BT$, κ = 1), loss $\|\cdot\|_G$, requirement
$G=K\Leftrightarrow G^{-1}\propto\Sigma$ (14); next: the spring metric (15).

What Part 1 does **not** show, or simplifies (relevant for new pieces; see also §7):
- the actual VP schedule and its floor (bonds never resolved, Prop 5); the noise-level metric $G_t$;
- the whitened score and the pairing theorem (input units, training curvature $\kappa^2$ vs 1);
- that the Riemannian score fixes the *gain*, not the *sizes* (its components still spread ×20, reversed);
- that per-level ×400 shrinks to ≈1.5× when summed over noise levels with likelihood weighting;
- that a stiffness-following metric must vary with the configuration (Lemma 2), making it curved and
  metric-shaped noise approximate;
- the force side (metric-independent force, volume terms, force bias–variance dilemma);
- every limit (multimodality, rare basins, kinetics) and every later correction (BBA, range and order).
Part 1's illustrative constants correspond to $\beta k$ ≈ 772 Å⁻² (stiff) and ≈1.93 Å⁻² (soft) (derived
here), i.e. a soft bond and an across-basin torsion; real ALDP5 bonds are 1,100–1,660 Å⁻² and a within-basin
torsion ≈25 Å⁻². Part 1 writes $G=K$ in eV/Å²; the notes use $G=\beta H$ in Å⁻² (so that $v=-x$ and the
Jacobian is $-I$, dimensionless).

### 6.1 Ideas (each: insight · on screen · computation · numbers · pitfalls)

**V1. Nine rulers in the fog (the real ALDP5 basin under the real schedule).**
*Insight:* flat noise kills ALDP5's bonds before training even starts; metric-shaped noise kills all nine
modes together. *On screen:* nine horizontal "rulers" (springs) drawn to scale with widths 0.025 → 0.5 Å
(log axis), each with a gauge showing $r_k=\alpha_t^2\sigma_k^2/(\alpha_t^2\sigma_k^2+\sigma_t^2)$; a time slider $t$
with the trusted schedule; a shaded band "trained range $t\ge0.01$"; each ruler greys out at its $t_{1/2}$
(bonds at 0.004–0.006, one–three 0.011–0.014, torsion 0.058, softest 0.145); toggle "metric-shaped noise":
all rulers fade together at $t=0.259$. *Computation:* exact analytic (§3.1 spectrum, $B(t)$). *Pitfalls:*
idealized one-basin spectrum (the across-basin torsion is ≈0.7 Å); the spring metric is not exactly βH
(residual 8–13, so "together" is approximate); the low-floor flat baseline ($t\ge10^{-5}$) does resolve
bonds — the point is the *trusted* schedule; later evidence (range and order) says synchronizing *global*
modes is not desirable.

**V2. "The loss never sees the bonds": share of training that can read each mode.**
*Insight:* the user's phrase made literal. *On screen:* a bar chart per mode of (a) share of trained times
with SNR ≥ 1 and (b) share of likelihood weight: bonds 0 % / 0 %, one–three 0.06–0.40 % / 0.002–0.014 %, torsion
4.9 % / 0.38 %, softest 13.8 % / 2.2 %; metric noise 25.4 % / 7.0 % for every mode (§3.1, derived here; 0.4 % /
0.014 % reproduces note 21). Then the sampler timeline: the last 9 of 999 steps are below the trained range —
"that is where bonds are formed". *Computation:* exact. *Pitfall:* SNR = 1 is a convention; the trusted flat
model still produced bond W1 0.019–0.030 Å (≈one width), attributed to this [H].

**V3. One score, three faces (covector · Riemannian · whitened).**
*Insight:* the same information, three scalings; sizes and gains are different problems.
*On screen:* a 2-mode Gaussian (stiff × soft); at a sample point draw $s$ (pull, long along stiff), $v=G^{-1}s$
(move, long along soft), $w=G^{-1/2}s$ (equal); side bars: std spread $\kappa_t^{1/2}$ / $\kappa_t^{1/2}$ reversed / 1, gain
spread $\kappa_t$ / 1 / 1 (Prop 2); a σ_t slider shows $\kappa_t$ = 356 → 97 (trusted floor) → 1.25. Close with
$\|s\|_{G^{-1}}=\|v\|_G=\|w\|_2$. *Computation:* analytic. *Pitfall:* this corrects Part 1's implicit claim that
raising the index fixes magnitudes.

**V4. The pairing dial a ∈ {0, ½, 1} and the training valley.**
*Insight:* gradient descent feels the stiffness spread twice (input variance × loss weight); only thermal
units in and out remove it. *On screen:* a slider $a$ morphing input units $\tau=G_t^{1-a}$, target
$G_t^{-a}s$, loss $G_t^{2a-1}$; a 2-D loss landscape (Kronecker product $C\otimes M$) from a long thin valley
(κ² ≈ 1.27×10⁵ at $a$ = 0 or 1) to a round bowl ($a=½$); GD trajectories zig-zagging vs converging; step
counters with the ALDP5 window numbers 24,319 (Riemannian, raw) vs 589 (covector) vs 31 (whitened, thermal),
Adam 3,941 vs 226. *Computation:* toy GD on a 2×2 or 9×9 quadratic is exact; ALDP5 numbers logged.
*Pitfall:* linear layer, commuting idealization; the Riemannian pairing's real-window gain condition
degrades to 14.2 because metric and data eigenvectors differ ($\kappa(G)=132$); deep-network claims are
heuristics.

**V5. Pull versus move on a four-atom chain.**
*Insight:* the covector is a local pull, the Riemannian score a collective move (Newton step / Hooke
response); $G^{-1}$ is dense (Green's function), so the move is nonlocal. *On screen:* butane-like chain;
red force arrows on atoms 3–4 only; morph into the move (atoms 1–2 follow); bar readouts in thermal widths:
Euclidean step stick 3–4 −10.3, twist −0.1 vs move −1.0 everywhere (§3.10). *Computation:* exact small linear
algebra from the stated geometry and weights. *Pitfall:* first-order changes; second-order leakage ≈0.5
width; result depends on whether angles are springs on angles or on one–three distances.

**V6. The right ruler changes with the noise level ($G_t$).**
*Insight:* under flat noise the data ellipse rounds out as σ grows; the ruler should follow
($G_t=(\alpha_t^2G^{-1}+\sigma_t^2I)^{-1}$); a fixed $G$ helps at low noise and hurts at high noise. *On screen:*
the noised-data ellipse $S_t$ with three overlaid unit balls (flat, fixed $G$, $G_t$); a readout of
$\mathrm{cond}(\cdot^{1/2}S_t\cdot^{1/2})$ with the ALDP5 window values: $G_t$ 6.7 → 3.0 → 2.2 → 1.3 → 1.0,
fixed $G$ 8.1 → 13.5 → 40.5 → 109 → 129, none 146 → 27.4 → 6.9 → 1.6 → 1.1 at σ² = 10⁻⁴ … 0.5 Å². *Computation:*
2-mode toy exact; numbers logged. *Pitfall:* only for flat noise; metric-shaped noise has $G_t=G$.

**V7. Loss weights across noise levels (beyond Part 1's ×400).**
*Insight:* per noise level the flat loss over-charges stiff errors by up to κ, but integrated with
likelihood weighting the over-charge is ≈ log κ (×1.5 on ALDP5); with metric loss + flat noise balance
inverts at high noise (1.2 / 17 / 330). *On screen:* a heat strip (mode × noise level) of learnable-loss
weight for the three configurations; integrated bars 17.5 vs 11.4 vs 10.1. *Computation:* analytic + logged
note-21 numbers. *Pitfall:* do not present "400×" as the total training imbalance.

**V8. What the samples feel (Prop 8).**
*Insight:* whatever the sampler's preconditioner, a constant score error δ shifts the generated cloud by
Σδ with KL ½δᵀΣδ; 5 % errors in soft and stiff modes distort samples equally. *On screen:* 2-D Gaussian;
two runs of preconditioned Langevin with different $D$ (flat, metric) converging to the same shifted
Gaussian; loss meters (Euclidean ×κ apart, metric equal) next to an equal KL meter; then the reverse-diffusion
numbers 3.97–4.00 (flat) vs 3.95 (metric) in units of ½(0.05)². *Computation:* exact.

**V9. The flat force dilemma (and how synchronized noise escapes it).**
*Insight:* reading forces at small noise trades bias against variance per mode; flat noise puts the stiff
and soft optima κ apart. *On screen:* two error curves (stiff, soft) vs extraction noise for flat
(0.56/3.41 at 0.004 Å, 0.30/0.79 at 0.016, 0.80/0.18 at 0.064) and magnified (2.46/3.40, 0.61/0.84, 0.29/0.24);
a frames slider showing magnified 500 ≈ flat 10,000 on soft forces; then Brownian-dynamics snapshots: flat
low-floor walkers drifting to 83 % αR vs 35 % (#768). Analytic overlay: relative bias $\sigma^2/(c_k+\sigma^2)$ and
target variance $1/(\delta c_{\min})$. *Computation:* logged (dec85338 table, #768) + analytic curves.
*Pitfalls:* linear learner on Gaussian windows; Cartesian force MSE is 1.2–1.3× *worse* in the magnified fit
(it weights bonds) — show per-mode relative errors; BBA forces still drift (size compaction) in every model.

**V10. Why the ruler must turn with the bond (Lemma 2 + rotating bonds).**
*Insight:* any constant rotation-equivariant metric is $A\otimes I_3$ and cannot be stiff along a bond but
soft across it; a stiffness-following metric must rotate with the bond, which adds a Jacobian term.
*On screen:* a diatomic rotating; an ellipse "ruler" glued to the bond vs a fixed ellipse (fixed global
whitening in an aligned frame: 273 vs 192 (β), 477 vs 112 (αR) — worse than flat); readout
$\varepsilon_{\rm rot}=\sigma_w^2/(d\sigma_s)$ = 2.7 / 0.90 / 0.27 for γ = 10 / 30 / 100 and measured term ratio 0.70
(median, γ = 30); then bond-attached coefficients ($u=-\varphi$, "deviation in thermal widths, the same
function for every molecule"). *Computation:* analytic + logged.

**V11. The spring metric is a cone (curvature) → why embeddings.**
*Insight:* $(\tfrac\gamma2+w)dr^2+\tfrac\gamma2r^2d\Omega^2$ is flat only if $(d\sqrt B/dr)^2=A$; a stiff radial
ruler with a soft angular ruler is curved, so no equal-dimension flat chart reproduces it; adding dimensions
(spring features $(W^{1/2}d(x),\sqrt\gamma x)$) makes it an exact pullback. *On screen:* unroll a cone from a
plane; show the angular deficit growing with $w/\gamma$; then lift into 3-D feature space. *Computation:* exact
(curvature $4w/(\gamma(\gamma+2w)r^2)$, e.g. 0.029 Å⁻² for $w$ = 1500, γ = 30, $r$ = 1.5 Å, derived here).
*Pitfall:* curvature matters only when the metric shapes the noise; embedding noise leaves the surface
(normal directions; see V19).

**V12. What no constant metric can fix: two basins (Prop 10).**
*Insight:* a linear change of variables never changes the barrier-to-basin curvature ratio (1 vs 1−r);
noise does. *On screen:* a double well; apply random linear maps (shear, scale) — the ratio readout stays
624; turn up flat noise: 397, 149, 11 at σ² = 0.01, 0.04, 0.2 Å². End with "stiff part: metric; multimodal part:
noise order or a nonlinear transport (note 28 §8)". *Computation:* exact.

**V13. Density and force disagree (note 19 §2).**
*Insight:* a model can be better in density and worse in force; Cartesian force MSE weights bonds.
*On screen:* two candidate models (A: 10 % off in the stiff mode; B: 50 % off in the soft mode) as ellipses
over the truth; bars KL 0.0027 vs 0.0966, force error² 1 vs 0.25, $D$-weighted 0.01 vs 0.25; then the circle
family with frequency $n$ (KL constant, force ∝ $n^2$). Link to #603 (+13.8–27.8 % force MSE with better
populations). *Computation:* exact. *Pitfall:* the toy does not prove the cause of #603.

**V14. Misaligned mobility is worse than none (note 19 §1).**
*Insight:* knowing stiffness without the right modes can hurt. *On screen:* OU relaxation in a tilted
2-D well with $M=I$ (rates 100, 1), $M=K^{-1}$ (1, 1) and the 45° misaligned $M$ (≈51 and ≈0.02, ratio ≈2600),
trajectories and decay curves. *Computation:* exact matrix exponentials.

**V15. A curved valley straightened exactly (note 19 §3).**
*Insight:* the right coordinates plus the right noise keep the fast valley narrow and Gaussian at every
time while the slow basins blur; only a 1-D periodic function is left to learn. *On screen:* density in
$(s,r)$ along $r=a\cos s$; noising in $(z,s)$ keeps $\varphi(z)$ fixed while $\nu_t(s)$ flattens (TV
$|\epsilon|e^{-\kappa n^2t}/\pi$); vector field of $D=g^{-1}$ (sheared ellipses); the chain-rule force term
$-ka\sin s(r-a\cos s)$ on the slow coordinate. *Computation:* exact (choose e.g. θ = 1, k = 100, a = 1, n = 2).
*Pitfall:* the factorization is manufactured; sterics and non-constant measures break it (Examples 5–7).

**V16. Entropy pushes on a flat floor (note 19 §6).**
*On screen:* a valley whose floor is flat but whose width breathes with $s$ ($k=k_0e^{2b\cos s}$); particles
accumulate where it is wide; the slow force $\theta b\sin s$ appears though $V'=0$; after whitening the width
is constant but the slow density still carries the entropy. *Computation:* exact.

**V17. Equilibrium does not know time (note 19 §9; #778; note 28 §5).**
*Insight:* thermal metrics come from equilibrium widths; short-lag steps measure mobility. *On screen:* same
histogram, friction ×1 vs ×100; then increment clouds at lag 10⁻⁴ for stiffness 1 vs 1000: the correct
thermal metric makes the increments condition > 900 while raw increments look isotropic (< 1.1); two-state
kinetic distance $4e^{-4a\tau}$ with identical populations. *Computation:* exact.

**V18. Same metric, different difficulty: line vs helix (note 28 §3).**
*Insight:* equal metric, rank and dimension do not imply equal denoising difficulty; the noisy image's
global geometry matters (aliasing between turns). *On screen:* a line and a helix embedding of the same 1-D
Gaussian; add σ = 0.1 noise; posterior over $x$: sharp (var 0.0099) vs comb-like and broad (0.496–0.500,
≈1/(1+b²/σ²)). *Computation:* 1-D quadrature (done here). *Pitfall:* toy; ties to "range" not to stiffness.

**V19. Redundant features: stiffness moves into the normal directions (note 28 §4).**
*On screen:* a 1-D line in 2-D (then a curve); noise kicks the point off; the needed restoring score
$y_N/\sigma_t^2$ explodes as noise falls (1/σ² 502 → 332,342 between t = 0.01 and 3×10⁻⁵); BBA counter: 3,303
features, 78 degrees of freedom, 94 % of low-noise loss off the molecule, loss 911 → 759 after 190,350
updates. *Computation:* exact toy + logged numbers.

**V20. Right balance, wrong scale (BBA springs; note 28 §7).**
*Insight:* condition number is scale-free, resolution is not. *On screen:* the nine (or 27) rulers of V1
again, globally rescaled by 1/27.1 until the spring channels' std 0.037 sinks below the trained floor
0.045: κ unchanged, readability gone; compare ALDP5 (divisor 1.31; resolved at 11–31 σ(t_min)). Bridge to range.

**V21. One force for every metric (notes 17, 29).**
*Insight:* metrics change the score's vector form and the volume, never the clean force. *On screen:* a 1-D
chart with varying measure $m$ and metric $g$ ($m=e^{0.2\sin x}$, $g=1+0.4x^2$): $s_g$ wiggles, the volume
term wiggles opposite, their sum $g s_g+d\log J_g=-x$ stays a straight line. Then "drop the volume term" in
a molecule: bonds shrink by 0.30–0.36 thermal widths; and the #955 failure (log-det of the full $G$ with three
zero rotation directions → gradients of order 10¹³, every walker lost). *Computation:* exact + logged.

**V22. The local-moment loss as a bowl (note 24).**
*On screen:* an anchor's displacement cloud (ellipse); a candidate metric's unit ball; the loss
$\mathrm{tr}(g\Sigma)-\log\det g$ decomposed per eigen-direction into $\mu-\log\mu-1$ bowls; optimization turns the
ellipse into a unit circle (weights 100 and 1 for moments 0.01 and 1). *Pitfall:* the optimum is a statement
about the map, not about learning (objective-search synthesis).

**V23. Finite-noise force labels (note 18).**
*Insight:* with state-dependent noise covariance, "clean force at the noisy point" is the wrong label; the
covariance correction does not vanish as noise shrinks. *On screen:* 1-D with $C(x)$ varying; samples from
$k(y|x)$; three label clouds ($T_N$, naive clean force, $T_F$) and their conditional means vs the true
marginal score; a zoom as $t\to0$ showing the $a^\top(\partial C)a/2t$ term staying $O(1)$. *Computation:*
quadrature (as in the repository's test).

**V24. The era's scoreboard (narrative close).**
*On screen:* a ledger animating in: fixed — bonds 100× sooner, angles 10–20×, stiff forces within a few
percent, BBA bonds 52×; not fixed — torsions, αL population, BBA size/populations, force-field drift; and
the 2026-11-14 decision "stiffness removal for stiff coordinates only" opening onto range and order.
*Pitfall:* keep caveats (ALDP5 pilots, in-sample constants, budgets) on screen.

---

## 7. Open questions, caveats, contradictions and superseded interpretations

1. **"Which κ?"** The documents use several stiffness numbers that a script must not mix: 412.5/415
   (idealized nine-mode spectrum), 356 ($\kappa_t$ at σ² = 10⁻⁴ Å², idealized), 146 ($\kappa_t$ on the β/C7eq window),
   97–192 (flat residual stiffness in ±45° windows, note 20 §5.3), ≈920 (whole-data aligned covariance), 400
   (Part 1, illustrative). "√κ ≈ 19–20" (destruction-noise ratio, size spread) and "2.6 decades" refer to
   the idealized spectrum.
2. **Two true but different statements about stiff modes and the loss.** (a) Per noise level, the flat
   covector loss over-charges stiff relative errors by up to κ (note 20 §4.4; Part 1 Problem 3: "the soft
   directions are barely trained"). (b) Under the trusted flat schedule no trained level resolves a bond at
   all, so the training signal for bonds is essentially absent (note 21 Prop 5), and at low noise the target
   is dominated by irreducible noise (Prop 6). The user's phrasing ("the loss does not really see stiff modes")
   matches (b). Note 21 §6/§8 adds (c): integrated over levels with likelihood weighting the stiff over-charge
   is only ≈1.5× on ALDP5. Any narration should say which of (a)–(c) it means.
3. **Part 1 simplifications versus the notes (dates: Part 1 is undated here; notes 2026-10-23/24).** Part 1's
   "one fix for all three" uses the Riemannian score; per note 21 §8 that fixes the *gain* (Jacobian) but
   not the *sizes* of Problem 2 (still ×20, reversed); sizes need the whitened score / thermal units. Part 1's
   fix also implicitly uses a constant $G=K$; Lemma 2 says a constant equivariant metric cannot separate stretch
   from bend, so a real stiffness metric is configuration-dependent (curved; metric-shaped noise approximate).
   Under flat noise the conditioning claim holds only at low noise unless $G_t$ is used. Part 1 states its
   numbers are illustrative.
4. **Design A recommended (dec85338, 2026-10-23) → withdrawn (PR #745, 2026-10-24).** Consequence: the
   "Riemannian target + metric loss + raw inputs" and "whitened target + thermal inputs" pairings were never
   trained as such under flat noise; Sprint 11 trained design-B-like pullback/feature diffusion (whose flat
   model in feature space learns the whitened score of the pullback metric). The closest flat-noise tests of
   E1–E3 alone are the covariance-aware predictor (global covariance, #890) and the #780 objective search;
   both negative for generation. A clean isolation of E1–E3 versus E4 is therefore open.
5. **E4 as a goal (2026-10-23) versus range and order (2026-11-14).** Synchronized destruction of every mode
   was the "only the noise can do this" benefit; on BBA, coordinates with every motion at unit spread have
   "range without order" and lose the fold. The current reading: synchronize (whiten) the stiff coordinates,
   keep collective modes loud.
6. **"Internal coordinates are an ablation" (note 20 §6.2, 2026-10-23)** because they need a spanning tree and
   do not exist for every molecule — overtaken on BBA, where internal coordinates were the best map (#955) and
   are the backbone of the current hypothesis (status 2026-11-14). Their generality limits (branches, rings)
   remain an open issue.
7. **Thermal versus lag metrics.** Note 20 defines the target as the equilibrium thermal precision
   $\Sigma^{-1}\approx\beta H$; the learned warp was fitted to 1 ps steps; #778 and note 28 §5 show that
   short-lag increment covariances measure mobility, not thermal width; note 25 (2026-11-04) places the lag as
   a dial from flat (τ → 0) through the within-basin thermal metric to global whitening and notes that the
   1 ps metric weighs ψ about 19× stiffer than its equilibrium spread. Which object a visualization calls
   "the thermal metric" must be stated.
8. **Number discrepancies, all explained by different data slices:** residual stiffness 9.6 / 192 (note 20,
   200,000-frame subsample, global frame) vs 8.3 / 191 (note 21, all 254,328 window frames, window frame);
   the note-21 Prop 5 bond SNR upper ends (2.4, 8.4) vs my recomputation (2.31, 8.19) with the note-20
   spectrum; the four-atom example has two versions (angle springs 280 rad⁻² in the merged note; one–three
   springs 400 in dec85338).
9. **Force fields.** Note 20 §8's linear test predicted large soft-force gains (4.4×; 19× data efficiency);
   ALDP5 force fields confirmed stiff-direction accuracy; but on BBA no map gave an accurate force in the
   bead campaign and every BBA force field still drifts (compacts) over 100–500 ps; "the remedy must change
   what is learned at small noise levels" (status). The volume term remains a live failure mode: lab PR
   #1100 (2026-11-16) "BBA loud-mode force field compacted because of a wrong volume term".
10. **Transfer** (typed constants; "the same function for every molecule") is derived under Assumption T but
    untested beyond small panels: graph metrics (#877) transfer competitively to ALDP5, unseen AC generation is
    poor; quantum springs qualify only a bounded ALDP5 panel.
11. **Design C (noise shaped by a configuration-dependent metric)** was never trained; its frozen Gaussian
    targets are accurate only for soft displacement per window ≲ 0.8/s Å, and ISM removes bias but not the
    step limit.
12. **Unproven or heuristic steps:** note 29 §3's small-noise expansion of the tangential score ("stated, not
    proven"); deep-network statements in note 21 §4 (sources Martens–Grosse, Rahaman, Karras not checked in the
    local library); Prop 8 assumes a constant error in a Gaussian basin.
13. **Superseded measurements:** all GPU-sampled feature-space pilot numbers (#757/#760/#763) were distorted by
    an XLA miscompilation of the final denoising step and are superseded by #765; the "late-training
    degradation" was this bug. Any visual must use #765/#768 numbers.
14. **Open (as of the docs):** a controlled metric comparison through shared interfaces (note 20 §10 item 1);
    whether E4 changes forces at scale; source-only typed constants; whether stiffness-whitened local
    coordinates plus loud collective modes generalize beyond BBA (ALDP5 "has no separation between local and
    global structure and cannot test order").

---

## 8. Sources read

**Theory (rg-main/docs/theory):** 17-physical-density-metric-contract.md (full); 18-finite-noise-force-targets.md
(full); 19-analytical-molecular-geometry.md (full); 20-thermal-metric-foundations.md (full) and its first long
version `git show dec85338:docs/theory/20-thermal-metric-foundations.md` (§§0, 5, 6.1–6.10 read);
21-target-loss-noise.md (full); 24-local-moment-metric-loss.md (full); 28-score-ease-and-thermal-preconditioning.md
(full); 29-score-to-force-pullback.md (full); background/02-langevin-and-ornstein-uhlenbeck.md (full);
background/09-score-based-diffusion.md (full); README.md (index); 25-information-geometry-lag-noise-posterior.md
(summary §0); 27-readable-windows-and-noise-order.md (intro, §1).

**Design (rg-main/docs/design):** thermal-bond-transport.md, transferable-noising.md, smooth-energy-corrections.md,
chemical-periodic-energy.md (all full); reference-metric-pairs.md (first part).

**Investigations (rg-main/docs/investigations):** denoising-targets-and-sensitivity-weighting.md (full);
thermal-metric-readout-controls.md (pointer) and its historical version
`git show 92aecbd655d1be68f6b1de41ef665817a51aabc6:docs/investigations/thermal-metric-readout-controls.md` (full);
data-free-spring-features.md; endpoint-force-learning-529.md; reference-metric-pairs-603.md;
feature-space-evaluation.md (summary); force-field-simulation.md (summary); covariance-aware-prediction.md;
objective-search-synthesis.md; sprint11-pullback-campaign-closeout.md (first half);
bba-local-geometry-preconditioning.md (§§0–3); bba-range-and-order.md (intro).

**Status and history:** rg-main/docs/status.md, rg-main/docs/LESSONS_LEARNED.md (first sections);
archive `rg-archive/docs/sprints/sprint10/closeout-520.md`; archive `rg-archive/docs/status.md` (2026-10-19 → 10-22
entries); archive `rg-archive/docs/investigations/molecular-local-comparison-528.md` (intro);
`git log origin/main` of each theory note.

**GitHub (read-only):** PR #745 (notes 20–21, body), PR #883 (note 24), PR #1023 (BBA preconditioning, original
note 27 = note 28); issues #520, #521, #529, #603, #604, #606, #607, #769 (full body), #778, #780; merged-PR list
(#675–#1140) for dates and titles (#742, #753–#768, #781, #812, #865–#877, #895, #899, #955, #1078, #1082, #1100,
#1132).

**Animation repo:** `/Users/I745505/private/thesis/animation/.claude/worktrees/fiber-bundles-em-video-0ada80/src/videos/part-1`
(index.js, meta.json, all 16 scene files and shared.js), `src/model/physics.js`, README.md (sections "What is
here" and "The videos").

**Numerical checks (derived here):** `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/r2-checks/modes.py`,
`.../r2-checks/fractions.py`, `.../r2-checks/helix.py` (per-mode spreads, half-destruction times, resolved shares,
Prop 5/7 numbers, Part 1 constants, helix posterior variances).
