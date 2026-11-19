# r5 · Information geometry, the lag dial, the posterior covariance and information retention

Reader r5, written 2026-11-19. Read-only study of the riemannian-generative `origin/main` snapshot
(`scratchpad/rg-main`), the pre-cleanup archive (`scratchpad/rg-archive/docs`), GitHub PRs and issues
(via `gh`, read-only) and the animation export `scratchpad/anim-playable-video-prototype`
(retention video). Paths below are relative to `rg-main` unless absolute.

Conventions. "Note NN" means `docs/theory/NN-*.md`. The bracket labels **[S] [D] [N] [M] [H]** are the
repository's own (cited source, derived, derived and numerically checked, measured, hypothesis).
**(derived here)** marks small computations made for this report with Python one-liners; they are not
repository claims. Numbers are quoted as in the source, with the source; where two documents disagree
both are given with dates.

---

## 0. Orientation in five sentences

The project's thermal metrics are inverse covariances of short trajectory steps (learned warp, thermal
diffusion maps) or equilibrium widths of stiff coordinates (spring metric). Note 25 (2026-11-04) showed
that the *lag* of those steps is a dial running from flat Cartesian (τ→0) through the within-basin
thermal metric to global whitening (τ→∞), that the dial sets the *order* in which noise erases modes,
that one matrix (the whitened posterior covariance $\Lambda_t$) carries every effect of a noise metric at
every noise level, and that no metric can beat the 37-visit Cramér–Rao limit on the αL population. Note 26
(2026-11-04) replaced "does a displacement survive noise?" by "does a specified *physical distinction*
survive?", defining retained Fisher information $I_t=\mathrm{Cov}(\mathbb E[u\mid X_t])$, which separates
information *destroyed* by the channel from information a finite predictor fails to *recover*. The
experiments of 2026-11-05 (retention pilot, learned retention maps, lag sweep and its same-day correction,
torsion Gaussianization) and the BBA work of 2026-11-11 to 11-18 turned this into the current
"range and order" hypothesis: scale bonds and angles to thermal width so every feature is readable inside
the trained noise range (range), and keep a few collective modes loud so global shape is erased last
(order). The retention video in the animation repo visualises the theory side with a two-coordinate toy
but none of the measured ALDP5/BBA numbers, the lag dial as a continuous control, $\Lambda_t$, or the
range-and-order sequel.

---

## 1. Narrative (chronological)

### 1.1 The starting point: "synchronized destruction" and its first test (2026-10-23 → 2026-11-03)

- **Note 20 (2026-10-23), thermal metric foundations.** Four effects E1–E4 of a thermal metric
  $G\approx\beta H$ in a harmonic basin. **E4, synchronized noise**: "Noise with covariance $\propto G^{-1}$
  destroys the information of every mode at the same rate. Only the noise can do this." Under flat noise,
  mode $k$ is half destroyed near $\log(\alpha_t^2/\sigma_t^2)=\log\lambda_k$, so the windows spread over
  $\log\kappa(H)$, "2.6 decades for ALDP5", and stiff modes are erased "at a noise level $\sqrt\kappa$ times
  smaller, about 20 across the ALDP5 modes" (note 20 §4.6). ALDP5 stiffness: bonds 0.025–0.030 Å
  ($\beta k$ 1,100–1,660 Å⁻²), one–three distances 0.047–0.058 Å, torsional displacement about 0.2 Å in one
  basin and about 0.7 Å over all data; aligned covariance condition number about 920 (note 20 §1.4).
- **Note 21 (2026-10-24).** Proposition 4 (information per mode) and Proposition 5: at the trusted floor
  $t=0.01$ (σ = 0.045 Å) the bonds have SNR 0.30–0.46, so "bonds are never resolved in training"
  (0% of trained times); Proposition 7 (sampler stiffness), Proposition 10 (multimodal roughness is affine
  invariant).
- **Sprint 11, tracker #769 (registered 2026-10-27).** Exploratory ALDP5 pilots of metric-shaped noising:
  learned warp #753 fitted to 1 ps steps (median local condition number 184 → 3.0, floor 1.55);
  diffusion in the warp #754 ("bonds and angles reach the data floor within about 1,000 steps; no torsion
  advantage and no data-efficiency gain"); spring feature space #765 ("bonds at the data floor about 100×
  sooner than the best flat model, angles 10–20×, stiff–soft coupling about 10×. Torsions: no early
  advantage. Rare αL basin: flat learns the population faster"); forces #768; joint metrics #781 ("on
  torsions and the rare basin the reference trajectories differ as much as the models").
- **Thermal submanifold (#761, evidence 2026-10-25; `docs/design/thermal-submanifold.md`).** The local
  1 ps step metric "equals the thermal metric βH only for directions that equilibrate within 1 ps, such
  as bonds. For the slower torsions a 1 ps step is narrower than their equilibrium width, so G measures
  them as longer than βH does." Raw coordinates show a 2-D torsion sheet (local dimension 2.0 from
  0.4 Å per atom); in thermal units there is no plateau: "Whitening removes the scale separation that makes
  the sheet visible." #758: slow VAMP coordinates are "not the soft sheet: slowest is not softest".
- #769 "Learnings so far": "**Metric-shaped noise fixes the stiff modes, not the torsions.**"

The open puzzle at the start of November: every stiffness-removing metric made bonds learnable 10–100×
sooner, but none helped torsions or the rare basin. Why, and what should a metric preserve?

### 1.2 Two theory notes in one evening (2026-11-04)

Three external research memos on burst covariances and Fisher metrics were handed to the project
(note 25 scope). Two notes answered in parallel:

- **Note 25, "Information geometry of the lag metric, the noise and the posterior"** (PR #925, opened
  2026-11-04 21:25 UTC; closed unmerged 2026-11-05 and landed through the consolidation PR #950, merged
  2026-11-12). It sorts out three "Fisher metrics" (§1), derives the lag dictionary and the erasure order
  (§2), measures ALDP5 time scales from the three 250 ns mdshare trajectories (§3), introduces the
  whitened posterior covariance $\Lambda_t$ as "one diagnostic" (§4), proves a reversibility identity
  (§5), bounds what no metric can buy (§6: 37 independent αL visits per trajectory; Stein kernel
  6.391× vs 1.000×), separates equilibrium and path-measure information for force errors (§7), grades the
  memos' claims (§8) and proposes P1–P4 (§9).
- **Note 26, "Information retention for molecular noising and learning"** (PR #926, opened 2026-11-04
  22:04 UTC, merged 2026-11-05 16:33 UTC). Main conclusion: "ask how well physical observables of the clean
  molecule can still be predicted from the noisy model input. This conditional predictability is exactly
  Fisher information about specified local changes to the molecular distribution." It "recovers the
  harmonic whitening argument, applies to nonlinear observables, and separates information destroyed by
  noising from information that survives but a predictor fails to recover."

Both notes already contain the seed of the later "order" idea: note 25 Prop. 2 shows that under
lag-shaped noise "the reverse process decides the modes in order of decreasing relaxation time", and note
26 warns that "Equalizing every observable is not necessarily desirable: retaining basin identity longer
than local fluctuations can support a coarse-to-fine reverse process."

### 1.3 Retention made measurable: issue #927 and PR #929 (2026-11-04 → 11-05)

Issue #927 ("Learn and evaluate information-informed pullback metrics", opened 2026-11-04 22:12 UTC,
closed 2026-11-16) owned the work. PR #929 (merged 2026-11-05) built
`src/riemanniangenerativemd/eval/information_retention.py` with a 28-probe ALDP5 panel in seven blocks
(bond/angle means and widths, torsion cos/sin, basin indicators of the fixed partition {β/PII, αR, φ>0},
stiff–soft coupling products), 17 unit tests of the analytical controls, and ran a **frozen-channel pilot**
(no generative model trained): flat low-floor (`flat-slice`, $t_{\min}=10^{-5}$) versus `spring16`
($t_{\min}=10^{-2}$). Findings (`docs/investigations/information-retention.md`, evidence 2026-11-04):

1. Neither clean encoder loses probe information; the wide MLP recovers 1.00 of every block from clean
   inputs, but a 2×128 MLP recovers only 0.39 of bond-width information from flat coordinates against
   0.99 from spring features ("a finite-predictor accessibility difference").
2. Flat noise erases bond and angle means, widths and coupling between $t\approx0.002$ and 0.08, "roughly
   10–20 times earlier in t than spring16 does"; under uniform training times flat spends only 3–7% of
   updates where bond information is being lost, spring16 17–34%.
3. Torsion and basin information is lost at the same times in both channels.

A **time-allocation intervention** was chosen from this diagnosis before training (card
`ir-aldp5-time-allocation`): half of flat's training times log-uniform in $t\in[0.002,0.08]$. Result
(three paired seeds, greatwhite, 2026-11-05): bond error 21–45% lower at every budget (0.025 vs 0.046
thermal widths at 20,000 updates) but angles, torsions and coupling worse for the first 5,000–10,000
updates. Verdict: "not a net improvement at matched budget, and this one time weighting does not reproduce
spring16's advantage."

### 1.4 Maps learned through the physical prediction objective (PR #933, 2026-11-05)

Second package of #927. Maps starting at the whitened invariant representation `inv14-whiten` (14 invariant
numbers, exact inverse) were trained jointly with a small time-conditioned predictor of the 28 probes
after VP noise ($t\sim U[0.01,1]$), equal group weights, overall scale normalised so a map "cannot improve
by stretching everything". Generators (4×256 MLP, 20,000 updates, three paired seeds) were trained in each
frozen map. Result: the physical-prediction maps learn "much faster" (bond W1/σ at 100 updates 0.04–0.06
against 0.146 invariant and 2.74 flat), the same architecture fitted with the local-moment objective is
worse than both baselines, all good maps converge by 5,000–20,000 updates, nonlinear capacity adds
nothing over linear re-mixing, and conditional internal-coordinate normalisation equals the global one on
ALDP5 (torsions explain under 1% of bond variance). Confirmed on fresh seeds 3–5 update-matched, but
cost-matched (the 19 s fit ≈ 860 generator updates) the linear map at 1,000 updates regresses against the
unchanged representation at 2,000.

### 1.5 P1 executed: the lag sweep, and its same-day correction (2026-11-05)

- **Lag sweep (PR #936, opened 13:19 UTC; `docs/investigations/learned-warp-lag-sweep.md`).** The learned
  warp refitted on 1, 10 and 100 ps steps; low-floor diffusion in each; two seeds; 20,000 updates.
  Pre-registered: Hypothesis A ("an early basin decision helps", 1 ps fastest) vs Hypothesis B
  ("synchronized erasure helps", 100 ps fastest). Result: after **100 updates** the 100 ps warp has
  Ramachandran JS 0.027 against held-out MD (flat 0.117, 1 ps warp 0.127; floors 0.019 two halves, 0.023
  second MD), bonds and angles at floor, 97% valid (flat 10%). "Hypothesis B wins the early race
  decisively." But flat overtakes from about 2,000 updates and ends best at 20,000 (JS 0.0203 vs
  0.0227–0.0236), and the 100 ps warp keeps a surplus in the rare saddle toward αL (30 per 10,000 at
  20,000 updates vs 4–6 in MD). #769 comment (2026-11-05 14:21 UTC) drew the implication "For fast learning
  the soft scale should be the equilibrium, across-basin spread, so that all modes are erased together".
- **Correction (PR #938, opened 16:07 UTC; #769 comment 16:08 UTC;
  `docs/investigations/spring-soft-scale-sweep.md`).** Moving the spring metric's soft scale γ to the
  same point of the dial (γ = 30, 8, 2 Å⁻²) **slows** early torsion learning (JS at 100 updates 0.133,
  0.149, 0.163). "So the synchronized-erasure explanation of the lag sweep, as a matter of rescaling, is
  refuted". A direct measurement explains the 100 ps warp instead: in its coordinates the training data are
  nearly Gaussian (total KL to a Gaussian 0.14 vs 0.96 for the flat slice and the 1 ps warp; largest
  bimodality 0.37 vs 0.80); "the long-lag warp is in part a Gaussianizing flow for the slow modes". The lag
  dictionary "remains correct as a statement about what the step covariance measures; the empirical
  speed-up it motivated has a different cause than the one proposed there."
- **Controlled test (PR #941, opened 17:10 UTC; `docs/investigations/torsion-gaussianization.md`).**
  Marginal Gaussianization of φ and ψ (spring distances for the stiff modes) gives JS 0.042–0.043 at 100
  updates vs 0.255 for the linearly scaled control, but learns the joint (φ, ψ) density slowly and finishes
  behind every comparator (0.029 vs control 0.022, flat 0.020). It does not smooth the αL barrier (7–11
  per 10,000 with a 0.1% uniform floor; a 1% floor produced 21–28).
- PRs #925/#936/#938/#941 were consolidated in **PR #950** (opened 2026-11-05 19:56 UTC, merged 2026-11-12)
  with a source catalog `docs/investigations/lag-slow-mode-review-evidence.json` (four source archives,
  ten figures linked at immutable commits).

### 1.6 Retention maps on other candidates and on BBA (2026-11-05 → 11-14)

- Issue #939 (2026-11-05 → 11-10) and **PR #955** (opened 2026-11-06, closed 2026-11-14 into the Sprint 11
  closeout, PR #1082): the learned bounded linear retention map with the conservative bead-energy
  transformer on ALDP5 and BBA. BBA: "map worsens every representation (e.g. springs TIC JS 0.166 →
  0.198)"; internal coordinates without a map are best (bond 0.0016 Å, angle 1.8°, TIC JS 0.069 vs flat
  14.7° / 0.151). Whitening follow-up: TIC JS 0.582 → 0.384 at 100 updates, 0.372 → 0.358 at 20k; simulated
  bond W1 0.426 → 0.032 Å; decoded fraction 0.94 → 0.89. Verdict: "Not a general add-on" (helps whitening
  early; "Early speed-ups fade").
- **Sprint 12 first chunks (snapshot 2026-11-09; `docs/sprints/sprint12/matched-results.md`).** Linear
  retention corrections are mixed (ALDP5 Cartesian bond 0.00456 → 0.00117 Å; BBA whitening loses 18.37% of
  draws). The learned warps entered as `short_lag`/`long_lag` and did poorly (ALDP5 long lag bond 0.016640 Å
  vs internal 0.000225 Å; simulation records 40/640 and 3/640 for ALDP5 short/long lag).
- Status note 2026-11-14: "BBA time labels. The BBA HDF5 time column is a frame index, so '1 ps' pairs are
  about 200 ps apart; every lag-based result on BBA must be read with that."

### 1.7 From retention to readable windows, range and order (2026-11-11 → 11-18)

- #1026 (2026-11-11), #1055 (2026-11-12): BBA diagnosis; the training-free **readability probe** (note 26's
  bounded validation path, step 2, executed for BBA with an exact empirical posterior mean over 1,300,156
  frames, ±1 µs exclusion). Cartesian "has order but not range" (bond $t_{1/2}=0.0004$ below
  $t_{\min}=0.01$); internal coordinates C3 have "range but not order" (everything lost between 0.18 and
  0.35).
- **Note 27, "Readable windows: at what noise level is a feature destroyed, and in what order?"** (PR #1064,
  2026-11-13; landed via #1079, merged 2026-11-16; dated 2026-11-12, trained tests summarised 2026-11-14).
  Defines readability $R_h(t)$, readable window, decision window, range and order; three
  training-signal identities; hypothesis that "a good process needs both range and order".
- #1057 (two-block order dial; Rg W1 0.51 → 0.08 Å as the whitening exponent goes 1 → 0), #1069 (internal
  coordinates + two loud collective modes: C3-level local geometry with Cartesian-level size on two seeds).
- **Status decision 2026-11-14**: "Stiffness removal is kept for the stiff coordinates and dropped as a goal
  for the whole molecule." Registered budget (#1071, 2026-11-15/16): the loud-mode candidate is "the only
  candidate near the best on both scales", beats native ScoreMD everywhere, narrowly behind Cartesian on
  size (0.104 vs 0.074 Å seed means).
- **Note 30 (2026-11-18)**: internal coordinates have *anti-order* (products of $j$ torsion phases keep
  $r^j$; global shape is erased before the torsions that make it), "No chart changes how much the data
  say about a structure", charts move the training signal.

### 1.8 What the arc means

The information-geometric layer started as a refinement of E4 (which metric, which lag, which matrix) and
ended by overturning E4 as a global goal. Three empirical lessons drove that: (i) equalizing erasure by
rescaling does not speed torsion learning (γ sweep), the real early torsion lever was Gaussianizing the slow
modes; (ii) information can survive noising yet be inaccessible to a finite predictor, so representation
matters beyond retention; (iii) on BBA, a process with everything erased in one band (range without order)
learns local geometry but swells the molecule, while Cartesian (order without range) gets size right and
bonds wrong. Throughout, two invariants held: no metric changes the total information (note 25 §6.2,
note 26 Prop. 3, note 30 §3), and rare-basin weights are limited by visits, not geometry (note 25 §6.1).

---

## 2. Core mathematics

### 2.1 Setting and the VP clock

**Dynamics (note 25 §1).** A reversible diffusion on centred configuration space
$$dX=-D\,\nabla U(X)\,dt+\sqrt{2D}\,dW,\qquad \pi\propto e^{-U},$$
$U$ in $k_BT$, constant mobility $D$ (Å²/ps); Cartesian Langevin has $D=D_0I$. Lag-$\tau$ kernel
$p_\tau(y\mid x)$, conditional mean $m_\tau(x)=\mathbb E[X_\tau\mid X_0=x]$, conditional covariance
$\Sigma_\tau(x)$, mean sensitivity $J_\tau(x)=D_xm_\tau(x)$.

**Ornstein–Uhlenbeck (background note 02).** For $dX=-\theta(X-\mu)dt+\sqrt D\,dW$ (note the $\sqrt D$
convention, i.e. $D_{\text{here}}=2D_{\text{note 25}}$):
$X_t\mid x_0\sim\mathcal N\big(\mu+e^{-\theta t}(x_0-\mu),\ \tfrac{D}{2\theta}(1-e^{-2\theta t})I\big)$,
invariant law $\mathcal N(\mu,\tfrac D{2\theta}I)$. The VP SDE $dX=-\tfrac12\beta(t)X\,dt+\sqrt{\beta(t)}dW$ is
OU in the clock $B(t)=\int_0^t\beta$; mean coefficient $a(t)=e^{-B(t)/2}$, variance $1-e^{-B(t)}$;
$\mathrm{Cov}(X_t)=a(t)^2\mathrm{Cov}(X_0)+(1-a(t)^2)I$ — "variance preserving" means identity covariance
is preserved when already present. Reversal is not just changing the drift sign (anti-OU is unstable).

**Noising with a noise metric $N$ (note 21 §2.3, note 25 §2).**
$x_t=\alpha_tx_0+\sigma_tN^{-1/2}\varepsilon$, $\alpha_t^2+\sigma_t^2=1$, $\alpha_t=e^{-B(t)/2}$,
$B(t)=0.1t+9.95t^2$, i.e. $\beta(t)=0.1+19.9t$ (the project schedule). Flat: $N=I$; thermal: $N=\beta H$;
lag-shaped: $N=\Sigma_\tau^{-1}$ or $G_\tau$.

Schedule values **(derived here)**:

| $t$ | $10^{-5}$ | 0.001 | 0.01 | 0.05 | 0.1 | 0.2 | 0.26 | 0.3 | 0.5 | 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| $\alpha_t^2$ | 1.0000 | 0.99989 | 0.99801 | 0.97057 | 0.89628 | 0.65836 | 0.49727 | 0.39633 | 0.079064 | 4.32×10⁻⁵ |
| $\log(\alpha_t^2/\sigma_t^2)$ | 13.82 | 9.12 | 6.22 | 3.50 | 2.16 | 0.66 | −0.01 | −0.42 | −2.46 | −10.05 |

### 2.2 Three Fisher metrics and which one the project uses (note 25 §1)

| Object | Definition | Meaning |
|---|---|---|
| $F_\tau(x)$ | $\mathbb E[\nabla_x\log p_\tau(X_\tau\mid x)\nabla_x\log p_\tau(X_\tau\mid x)^\top]$ | distinguishability of the futures of nearby starts (predictability) |
| $\Sigma_\tau(x)^{-1}$ | inverse spread of the future about its mean | cost of a displacement in units of what the dynamics does in time τ |
| $G_\tau=(\Sigma^{\rm step}_\tau)^{-1}$ | $\Sigma^{\rm step}_\tau=\tfrac12\mathbb E[(X_\tau-X_0)(X_\tau-X_0)^\top]$ over a local window | the project's step metric (learned warp, thermal diffusion maps) |

**Proposition 1 (exact decomposition) [S/D/N].** With $s_\tau=\nabla_x\log p_\tau(X_\tau\mid x)$ and
$s^{\rm lin}_\tau=J_\tau^\top\Sigma_\tau^{-1}(X_\tau-m_\tau)$,
$$F_\tau=J_\tau^\top\Sigma_\tau^{-1}J_\tau+\mathbb E\big[(s_\tau-s^{\rm lin}_\tau)(s_\tau-s^{\rm lin}_\tau)^\top\big]\succeq J_\tau^\top\Sigma_\tau^{-1}J_\tau .$$
Proof: $\mathbb E[(X_\tau-m_\tau)s_\tau^\top]=\nabla_xm_\tau^\top$, so $s^{\rm lin}$ is the orthogonal projection of
$s$ onto the span of the centred endpoint (Pythagoras). Equality for Gaussian kernels with start-independent
covariance (linear dynamics), checked to $10^{-6}$ relative against finite differences of KL. The first term
is a Cramér–Rao bound.

**Corollaries [D/N].**
1. *Zero lag is flat:* $m_\tau=x+\tau b+O(\tau^2)$, $\Sigma_\tau=2D\tau+O(\tau^2)$, so $\tau F_\tau$ and
   $\tau\Sigma_\tau^{-1}\to(2D)^{-1}$ (checked: relative error $5\times10^{-5}$ at $\tau=10^{-6}$ ps). For
   Cartesian Langevin "the short-time burst covariance says nothing about the molecule. The project's metric
   lives at finite lag by necessity."
2. *The predictive metric forgets stiff modes:* in a linear basin $J_\tau=e^{-D_0H\tau}$, per mode
   $$F_{\tau,k}=\frac{\lambda_k}{e^{2\tau/t_k}-1}\to0,\qquad \Sigma^{-1}_{\tau,k}=\frac{\lambda_k}{1-e^{-2\tau/t_k}}\to\lambda_k,\qquad t_k=\frac1{D_0\lambda_k}.$$
   The singular values of $J_\tau$ are the transfer-operator spectrum (VAMP). "Slow (kinetic) coordinates
   are not the soft sheet" *is* the factor $J_\tau\ne I$.
3. *Dual coordinates:* where equality holds, $J_\tau^{-\top}F_\tau J_\tau^{-1}=\Sigma_\tau^{-1}$: the project's metric
   is the Fisher metric of the transition family in predicted-mean coordinates $m=m_\tau(x)$; these
   degenerate as $\tau\to\infty$.

Reading: for noising the project wants the cost of a displacement, not its predictability, so dropping
$J_\tau$ is "deliberate and correct"; "which lag" replaces "which window".

### 2.3 The lag dictionary and the erasure order (note 25 §2)

Basin model: $U=\tfrac12(x-x^*)^\top H(x-x^*)$, $D=D_0I$, stiffnesses $\lambda_k$ (Å⁻²), widths
$w_k^2=1/\lambda_k$, relaxation times $t_k=1/(D_0\lambda_k)$.

**Lemma 1 (saturation) [D/N].**
$$\Sigma_\tau=H^{-1}(I-e^{-2D_0H\tau}),\qquad \Sigma^{\rm step}_\tau=H^{-1}(I-e^{-D_0H\tau})=\Sigma_{\tau/2},$$
per mode $\Sigma^{\rm step}_{\tau,k}=w_k^2(1-e^{-\tau/t_k})$. Proof per mode with $a=\tau/t_k$:
$(1-e^{-2a})+(1-e^{-a})^2=2(1-e^{-a})$ (conditional covariance plus variance of the conditional mean).
Checked to $10^{-14}$.

**The dial [D].** $G_\tau$ has eigenvalues
$$\frac{\lambda_k}{1-e^{-\tau/t_k}}\approx\max\big(\lambda_k,\ 1/(D_0\tau)\big):$$

| Lag | $G_\tau$ | Project name |
|---|---|---|
| $\tau\ll$ every $t_k$ | $\approx I/(D_0\tau)$ | flat Cartesian (up to scale) |
| $t_{\rm fast}\ll\tau\ll t_{\rm slow}$ | fast modes at $\lambda_k$, slow modes at $1/(D_0\tau)$ | within-basin thermal metric with soft scale $\gamma=1/(D_0\tau)$ |
| $\tau\gg$ every $t_k$ | $H=\Sigma_\pi^{-1}$ | global whitening |

"The soft scale γ of the spring metric is the lag in disguise." Residual stiffness against the basin's own
thermal metric: $\max_k1/(1-e^{-\tau/t_k})$, set by the slowest within-basin mode relative to τ, not by
$\kappa(H)$.

**Proposition 2 (erasure order under lag-shaped noise) [D/N].** VP with $N=\Sigma_\tau^{-1}$:
$$\mathrm{SNR}_k=\frac{\alpha_t^2}{\sigma_t^2(1-e^{-2\tau/t_k})},\qquad\text{half erasure at}\quad\frac{\sigma_t^2}{\alpha_t^2}=\frac1{1-e^{-2\tau/t_k}}\ \ge1,$$
equal to 1 for $t_k\ll\tau$ and about $t_k/(2\tau)$ for $t_k\gg\tau$; for the step metric replace $2\tau$ by $\tau$.
Compare flat noise (half erasure at $\sigma_t^2/\alpha_t^2=w_k^2$, spread $\kappa(H)$) and thermal noise $N=\beta H$
(half erasure at 1 for every mode). Reading: "the slowest first, then everything faster than τ together";
the gap between basin decision and stiff structure is about $t_{\rm hop}/(2\tau)$ in $\sigma^2/\alpha^2$.
"Flat noise also decides basins first, but with an uneven middle (angles at 0.05 Å, librations at 0.2 Å)
and a gap of κ ≈ 400–900."

### 2.4 Per-mode information and signal fractions (note 20 §4.6; note 21 §5.1–5.2)

With $\theta_k$ the eigenvalues of $N^{1/2}\Sigma N^{1/2}$:
$$I(x_0;x_t)=\sum_k\tfrac12\log(1+\mathrm{SNR}_k),\qquad \mathrm{SNR}_k=\frac{\alpha_t^2\theta_k}{\sigma_t^2},\qquad r_k=\frac{\mathrm{SNR}_k}{1+\mathrm{SNR}_k},\qquad I(x_{0,k};x_{t,k})=-\tfrac12\log(1-r_k).$$
Fractions equal across modes at every $t$ iff $N\propto\beta H$ (Prop. 4). Under flat noise mode $k$ is
resolved iff $\sigma_t^2\le\alpha_t^2/\lambda_k$ (Prop. 5).

### 2.5 The whitened posterior covariance $\Lambda_t$ — "one diagnostic" (note 25 §4)

Tweedie with a noise metric:
$$\mathbb E[\alpha_tx_0\mid x_t]=x_t+\sigma_t^2N^{-1}\nabla\log p_t(x_t),\qquad \mathrm{Cov}[\alpha_tx_0\mid x_t]=\sigma_t^2N^{-1}+\sigma_t^4N^{-1}\nabla^2\log p_t(x_t)N^{-1}.$$
$$\Lambda_t(x_t)=\frac{N^{1/2}\mathrm{Cov}[\alpha_tx_0\mid x_t]N^{1/2}}{\sigma_t^2}=I+\sigma_t^2N^{-1/2}\nabla^2\log p_t(x_t)N^{-1/2}.$$

**Proposition 3 [D/N].**
1. $\Lambda_t$ is the Jacobian of the whitened denoiser $N^{1/2}x_t\mapsto N^{1/2}\mathbb E[\alpha_tx_0\mid x_t]$.
2. In the basin model $\Lambda_t\sim\alpha_t^2\Sigma(\alpha_t^2\Sigma+\sigma_t^2N^{-1})^{-1}$, eigenvalues = signal
   fractions $r_k$. **E4 holds iff $\Lambda_t\propto I$** ($N\propto\beta H$). Flat: eigenvalues
   $\alpha_t^2/(\alpha_t^2+\sigma_t^2\lambda_k)$.
3. The probability-flow Jacobian (note 21 Prop. 7) $\sim-\tfrac12I+\tfrac12(I-\Lambda_t)/\sigma_t^2$; largest eigenvalue
   $\tfrac12((1-\lambda_{\min}(\Lambda_t))/\sigma_t^2-1)$ grows as $1/(2\sigma_t^2)$ under flat noise, vanishes under
   thermal VP noise.
4. Where the posterior splits between basins, $\nabla^2\log p_t$ has a positive eigenvalue, $\Lambda_t$ an
   eigenvalue above 1, and the reverse flow expands along it.
5. The denoising posteriors form an exponential family in $x_t$ (natural parameter $\alpha_tNx_t/\sigma_t^2$,
   sufficient statistic $x_0$); Fisher–Rao metric $\alpha_t^2N\,\mathrm{Cov}[x_0\mid x_t]\,N/\sigma_t^4$, which in whitened
   coordinates is $\Lambda_t/\sigma_t^2$.

"Four of the project's separate statements, E3 for the denoiser, E4, the sampler stiffness and the
multimodal roughness, are the eigenvalue spectrum of one matrix." A trained model gives $\Lambda_t$ by one
Jacobian–vector product per direction. Relation to note 26: for linear probes in a basin the retained
fractions *are* the eigenvalues of $\Lambda_t$; retention is a global expectation in $[0,1]$, $\Lambda_t$ a local
field that exceeds 1 at a saddle.

### 2.6 The reversibility identity (note 25 §5)

**Proposition 4 [D/N].** For a reversible process, at every lag,
$$\nabla\log\pi(x)=\mathbb E\big[\nabla_1\log p_\tau(x\mid X_\tau)\ \big|\ X_0=x\big]$$
(detailed balance $\pi(x)p_\tau(y\mid x)=\pi(y)p_\tau(x\mid y)$; the middle score term averages to zero). Gaussian
kernels of fixed covariance: $\nabla\log\pi=-\Sigma_\tau^{-1}(x-m_{2\tau}(x))$, i.e. the Riemannian score of the lag
metric is the expected displacement over lag $2\tau$, $v=\Sigma_\tau\nabla\log\pi=m_{2\tau}(x)-x$ — "the dynamical
twin" of note 21 Prop. 2. Verdict: "a conceptual unification and a consistency check, not a new score
estimator."

### 2.7 Statistical efficiency: what no metric buys (note 25 §6)

- **Cramér–Rao for basin weights [D/M]:** $\mathrm{Var}(\hat w)\ge w(1-w)/n_{\rm visits}$,
  $\mathrm{sd}(\hat w)/w\ge\sqrt{(1-w)/(w\,n_{\rm visits})}$ — visits, not frames, are the independent units.
- **Efficiency of the objective [S, abstract level]:** single-level score matching can be much less efficient
  than ML when the Poincaré constant is large (Koehler, Heckett, Risteski 2022); the time-integrated DSM
  objective is asymptotically efficient (Chewi et al. 2025). Hence "the noise metric cannot change the
  asymptotic efficiency of the basin weights".
- **Loss metric efficient at one level [S/N]:** loss $\tfrac12\mathbb E_p[(s_\theta-s)^\top W(s_\theta-s)]$,
  $L_Wf=p^{-1}\nabla\cdot(pW\nabla f)$; asymptotic covariance
  $\Gamma(W)=G^{-1}\mathbb E[(L_Wu)(L_Wu)^\top]G^{-1}\succeq\mathbb E[uu^\top]^{-1}$, $u=\partial_\theta\log p_\theta$,
  $G=\mathbb E[(\nabla u)W(\nabla u)^\top]$; equality when $\mathrm{span}(u)$ is $L_W$-invariant. For tilts
  $p_\theta\propto pe^{\theta x}$ this means $W$ is a **Stein kernel**, $\nabla\cdot(pW)=-(x-\mu)p$.
- **Long-lag Fisher = basin-membership Fisher [N]:** once within-basin memory is gone,
  $p_\tau(\cdot\mid x)\approx\sum_kw_k(x)\rho_k$ with $w_k(x)=P(X_\tau\in B_k\mid x)$ and
  $F_\tau\to\sum_k\nabla w_k\nabla w_k^\top/w_k$, concentrated at the dividing surface.

### 2.8 Two information metrics for force errors (note 25 §7)

Girsanov: $\frac{d}{dT}\mathrm{KL}=\tfrac14\mathbb E_\pi[(F-\hat F)^\top D(F-\hat F)]$ (path measures, mobility units);
equilibrium density feels $\tfrac12(\delta f_k\sigma_k)^2$ per mode (thermal units). For relative error ε,
$\delta f_k=\epsilon/\sigma_k$: equilibrium cost $\tfrac12\epsilon^2$ in every mode, path cost $\tfrac14D_0\epsilon^2\lambda_k$, κ times
larger for a bond than a torsion. "Equilibrium claims need the first, kinetic claims the second."

### 2.9 Information retention (note 26)

**Probes and reference.** $u(X)=h(X)-\mathbb E_P[h(X)]$, $I_{\rm clean}=\mathbb E_P[uu^\top]$ (restricted to the
nondegenerate subspace; no ridge). Panel types: mean bond/angle; width (squared deviation from a fixed
reference mean); periodic torsion (sin/cos, declared harmonics); basin populations ($K-1$ indicators);
stiff–soft coupling (products).

**Tilts.** $\frac{dP_\theta}{dP}(x)=\exp(\theta^\top u(x)-A(\theta))$, $A(\theta)=\log\mathbb E_Pe^{\theta^\top u}$ — θ is "a physical change,
not network weights"; the Fisher matrix lives in the "space of distributional changes", not on configurations.

**Channel.** $Y_t\mid X=x\sim K_t^\eta(\cdot\mid x)$; $Y_t$ is the actual network input; the candidate is
"the representation and the noise law, not just a matrix called a metric".

**Retained information.** $m_t(y)=\mathbb E[u(X)\mid Y_t=y]$, $I_t=\mathbb E[m_t(Y_t)m_t(Y_t)^\top]$.

**Proposition 1 (conditional score and missing information).**
$$\nabla_\theta\log p_{\theta,t}(y)\big|_{\theta=0}=m_t(y),\qquad I_{\rm clean}-I_t=\mathbb E[\mathrm{Cov}(u(X)\mid Y_t)]\succeq0 ,$$
(source: Pollard, *A note on insufficiency and the preservation of Fisher information*, Thm 7), and
$D_{\rm KL}(P_{\theta,t}\Vert P_{0,t})=\tfrac12\theta^\top I_t\theta+o(\Vert\theta\Vert^2)$. Not the mutual information $I(X;Y_t)$, and
not the information in the training experiment (which sees clean labels).

**Normalization.** $R_t=I_{\rm clean}^{-1/2}I_tI_{\rm clean}^{-1/2}$, $0\preceq R_t\preceq I$; eigenvalues are the
generalized eigenvalues of $(I_t,I_{\rm clean})$, invariant under invertible linear changes of probe basis
("prevents a change of length units from masquerading as an improvement").

**Proposition 2 (Markov contraction).** For $X\to Y_s\to Y_t$, $s\le t$: $m_t(Y_t)=\mathbb E[m_s(Y_s)\mid Y_t]$ and
$I_s-I_t=\mathbb E[\mathrm{Cov}(m_s(Y_s)\mid Y_t)]\succeq0$. Re-expressing the same noisy observation preserves $I_t$;
adding isotropic noise *after* a nonlinear embedding defines a different channel.

**Harmonic special case.** $X\sim\mathcal N(0,\Sigma)$, $Y_t=\alpha_tX+\sigma_tN^{-1/2}Z$, probes $u=\Sigma^{-1/2}X$,
$S_t=\alpha_t^2\Sigma+\sigma_t^2N^{-1}$:
$$m_t(y)=\alpha_t\Sigma^{1/2}S_t^{-1}y,\qquad R_t=\alpha_t^2\Sigma^{1/2}S_t^{-1}\Sigma^{1/2},\qquad r_j(t)=\frac{\alpha_t^2\lambda_j}{\alpha_t^2\lambda_j+\sigma_t^2},$$
$\lambda_j$ eigenvalues of $N^{1/2}\Sigma N^{1/2}$; all equal iff $N\propto\Sigma^{-1}$ ("thermal whitening as equal
retention of harmonic linear distinctions"; the constant still sets *when*).

**Width.** $u_2=(X^2/v-1)/\sqrt2$, $T=Y/\sqrt{\mathrm{Var}Y}$: $\mathbb E[u_2\mid Y]=\frac r{\sqrt2}(T^2-1)$,
$R_{\rm width}=r^2$ ("When a mean distinction retains one half of its information, its width distinction
retains one quarter"). **Products** $X_iX_j/\sqrt{v_iv_j}$ retain $r_ir_j$.

**Basin.** $q_t(y)=P(X\in B\mid Y_t=y)$, $u=\mathbf 1_B-w$:
$$R_{B,t}=\frac{\mathrm{Var}(q_t(Y_t))}{w(1-w)}=1-\frac{\mathbb E[q_t(Y_t)(1-q_t(Y_t))]}{w(1-w)},$$
exact, no Gaussian approximation; "Normalization does not create observations of a rare basin."

**Proposition 3 (information dissipation).** For $dY_t=b_t\,dt+\sigma_t\,dB_t$, variance rate
$a_t=\sigma_t\sigma_t^\top$, generator $L_tf=b_t\cdot\nabla f+\tfrac12a_t:\nabla^2f$:
$$-\frac{dI_t}{dt}=D_t=\mathbb E[(D_ym_t)\,a_t\,(D_ym_t)^\top]\succeq0,\qquad \partial_\theta s_{\theta,t}\big|_0=(D_ym_t)^\top,\qquad \tfrac12\mathbb E\Vert s_{\theta,t}-s_{0,t}\Vert_{a_t}^2=\tfrac12\theta^\top D_t\theta+o,$$
$$\int_\varepsilon^TD_t\,dt=I_\varepsilon-I_T .$$
"The noisy score is most sensitive to a specified physical perturbation at times when information about
it is being lost." "Geometry redistributes this local score signal across time and directions; it does not
create additional total information."

**Proposition 4 (prediction-based lower bound).** For any predictor $f_t$,
$$B_t(f)=I_{\rm clean}-\mathbb E[(u-f_t)(u-f_t)^\top]=I_t-\mathbb E[(f_t-m_t)(f_t-m_t)^\top]\preceq I_t .$$
For a standardized scalar probe: one minus held-out MSE; can be negative; never clip;
$\mathrm{Cov}(f_t(Y_t))$ alone is invalid. Nonlinear probes: $h(\mathbb E[X\mid Y])\ne\mathbb E[h(X)\mid Y]$.

**Task objective.** $\widetilde u=I_{\rm clean}^{-1/2}u$, task weight $H\succeq0$, time law $q$:
$$\mathcal J_{\rm task}(\eta,f)=\mathbb E_{t\sim q}\mathbb E\Vert\widetilde u(X)-f(Y_t,t)\Vert_H^2=\mathbb E_{t\sim q}\Big[\mathrm{tr}\big(H(I-R_t)\big)+\mathbb E\Vert f(Y_t,t)-\widetilde m_t(Y_t)\Vert_H^2\Big]$$
(destroyed information + predictor gap). Needs constraints (terminal prior, coverage, decodability),
"Otherwise it favors weak noising".

**Time allocation.** Times drawn with density $q$ need the weight $\ell(t)/q(t)$ to keep the objective; "A
change of clock can move a retention transition on a plot without changing the underlying path".

**Conditional whitening hypothesis.** $(s,r)\mapsto\big(s,\ C(s)^{-1/2}(r-\mu(s))\big)$; full Jacobian includes
$\mu'$ and $C'$ (note 28 §6 states the exact version: if $p_q(s,r)=p_s(s)\mathcal N(r;\mu(s),LL^\top)$ then
$z=L^{-1}(r-\mu)$ is exactly $\mathcal N(0,I)$ at every noise level).

### 2.10 Readability, windows, order and where the training signal lives (note 27 §1–3, §6)

**Readability** of a scalar observable for $Y_t=\alpha_t\phi(X)+\sigma_t\varepsilon$:
$$R_h(t)=\frac{\mathrm{Var}(\mathbb E[h(X)\mid Y_t])}{\mathrm{Var}(h(X))}=1-\frac{\mathbb E[(h-\mathbb E[h\mid Y_t])^2]}{\mathrm{Var}(h)}\in[0,1]$$
(note 26's $R_t$ for one probe; pooled: $1-\sum_k\mathrm{MSE}_k/\sum_k\mathrm{Var}_k$). Three facts: any predictor gives
a floor; $R_h$ is non-increasing in $t$ (VP is Markov); the channel is map + noise law. **Destroyed forward
means decided backward [D]:** the exact reverse process has the same joint law of clean sample and state at
$t$, so $R_h(t)$ is also the fraction of the final value's variance already fixed at time $t$ in generation.
**MI bound:** $I(h;Y_t)\ge\mathsf h(h)-\tfrac12\log(2\pi e(1-R_h)\mathrm{Var}(h))$; Gaussian: $-\tfrac12\log(1-R_h)$, so
$R_h=\tfrac12$ means at least $\tfrac12\log2\approx0.35$ nats.

**Summaries.** Half-erasure level $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; readable window $[t_{\min},t_{1/2}]$;
decision window $R_h\in[0.2,0.8]$; report log-SNR $\log(\alpha_t^2/\sigma_t^2)$ (schedule independent).
**Range**: every required feature has $t_{1/2}$ well above $t_{\min}$ and $R_h(t_{\min})\approx1$. **Order**: classes
erased at clearly different levels, coarse above fine.

**Linear closed form.** $r(t)=\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)$; half erasure when $\alpha_t^2\lambda=\sigma_t^2$; for the
project schedule
$$t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\log(1+\lambda)}}{19.9},\qquad t_{1/2}(1)=0.259 .$$
Rescaling mode $k$ by $\lambda_k^{\gamma/2}$ (renormalised) leaves variances $\propto\lambda_k^{1-\gamma}$: γ = 1 (whitening)
"erases the order by construction"; partial γ "keeps the order and compresses the range". "The lag of a
thermal metric is a physically motivated version of the same dial."

**Where the training signal lives.** (a) Fisher form = note 26 Prop. 3. (b) I-MMSE (Guo, Shamai, Verdú):
$X_\gamma=\sqrt\gamma X+N$, $\frac{d}{d\gamma}I(X;X_\gamma)=\tfrac12\mathrm{mmse}(\gamma)$, hence for a feature $Y$
$$\frac{d}{d\gamma}I(Y;X_\gamma)=\tfrac12\big[\mathrm{mmse}(\gamma)-\mathrm{mmse}(\gamma\mid Y)\big],\qquad \gamma=\alpha_t^2/\sigma_t^2 .$$
(c) Ablation form [D]: for a law $Q$ lacking one structure,
$$D_{\rm KL}(P\Vert Q)-D_{\rm KL}(P_T\Vert Q_T)=\tfrac12\int_0^T\frac{\beta(t)}{\sigma_t^2}S_Q(t)\,dt,\qquad S_Q(t)=\mathbb E_{P_t}\Vert\hat\varepsilon_P-\hat\varepsilon_Q\Vert^2,$$
the excess denoising loss at $t$ of a model that learned everything but that structure. The total is
chart-invariant; the *profile* is not. **[H]** "A structure is learned within a finite budget only if, at
some noise levels, its signal is a non-negligible share of the loss that can still be reduced there."

### 2.11 Degree attenuation and loudness (note 30 §1–3, 2026-11-18)

**Proposition 1.** Independent uniform torsions observed through their own noisy phase pairs, single-phase
readability $r(t)=\mathbb E|\mathbb E[e^{i\tau}\mid Y]|^2$, $h=\sum_jh_j$ multilinear with degree-$j$ components:
$$R_h(t)=\frac{\sum_jc_j\,r(t)^j}{\sum_jc_j},\qquad c_j=\mathrm{Var}(h_j).$$
(This generalizes note 26's width $r^2$ and products $r_ir_j$.) **Loudness:**
$\ell_h=\mathrm{Var}(h)/\mathbb E[\nabla h^\top G^+\nabla h]$, $G=J^\top J$: the $s^2=\sigma_t^2/\alpha_t^2$ at which $h$ is
half-erased under the linear-Gaussian rule (a screen, not a measurement). "Information is conserved;
charts move it": profile, share and access change; the total does not.

---

## 3. Worked analytical examples (exact, animatable)

### E1. One harmonic coordinate, two parametrizations

- **Note 25 form:** $dX=-D_0\lambda X\,dt+\sqrt{2D_0}\,dW$, $t=1/(D_0\lambda)$, $w^2=1/\lambda$:
  $m_\tau=e^{-\tau/t}x_0$, $J_\tau=e^{-\tau/t}$, $\Sigma_\tau=w^2(1-e^{-2\tau/t})$, $\Sigma^{\rm step}_\tau=w^2(1-e^{-\tau/t})$,
  $F_\tau=J_\tau^2/\Sigma_\tau=\lambda/(e^{2\tau/t}-1)$. Limits: $\tau F_\tau,\tau\Sigma_\tau^{-1}\to1/(2D_0)$ as $\tau\to0$;
  $\Sigma_\tau^{-1}\to\lambda$, $F_\tau\to0$ as $\tau\to\infty$.
- **Retention-video form (`src/videos/retention/math.js`):** $dX=-kX\,d\tau+\sqrt{2D}\,dB$, $v=D/k$,
  $C_\tau=v(1-e^{-2k\tau})$, $F_\tau=1/(v(e^{2k\tau}-1))$, increment $\tfrac12\mathbb E[(X_\tau-X_0)^2]=v(1-e^{-k\tau})$; bond
  $k=400$/ps, torsion $k=1$/ps, $D=1$ Å²/ps (widths 0.05 Å and 1 Å, κ = 400; illustrative). At the warp's
  1 ps lag the increment statistic is 100% of the bond's equilibrium **variance** and $1-e^{-1}=63\%$ of the
  torsion's (the video labels this "% of its equilibrium width"; it is a variance ratio, width ratio
  $\sqrt{0.632}=0.80$ — derived here).
- **Note 28 §5 variant:** $dx_i=-\kappa_ix_i\,dt+\sqrt2\,dW_i$, $\mathrm{Var}=1/\kappa_i$,
  $\tfrac12\mathbb E[(\Delta x)^2]=(1-e^{-\kappa_i\Delta})/\kappa_i\to\Delta$. For κ = 1 and 100 at lag $10^{-4}$, increment
  covariance condition 1.005 while the equilibrium variance condition (in increment-whitened units) stays
  99.5: "whitening a short-lag increment covariance whitens diffusion, not thermal widths".

### E2. The four-mode linear basin (note 25 §2, Prop. 2 numbers)

$\lambda=(1600,400,25,4)$ Å⁻², $D_0=0.08$ Å²/ps ⇒ $t_k=(0.008,0.03,0.5,3.1)$ ps. At $\tau=1$ ps the
half-erasure levels $1/(1-e^{-2\tau/t_k})=(1,1,1.02,2.12)$: "a spread of 2.1 against 400 under flat noise".
**(derived here)** With the step metric ($\tau$ instead of $2\tau$): $(1,1,1.157,3.652)$. Dial eigenvalues of
$G_\tau=\lambda_k/(1-e^{-\tau/t_k})$ vs $\max(\lambda_k,1/(D_0\tau))$:

| τ (ps) | $G_\tau$ (Å⁻²) | approximation |
|---|---|---|
| 0.001 | 13317, 12701, 12513, 12502 | 12500 ×4 (flat) |
| 0.01 | 2216, 1461, 1263, 1252 | 1600, 1250, 1250, 1250 |
| 0.1 | 1600, 417, 138, 127 | 1600, 400, 125, 125 |
| 1 | 1600, 400, 28.9, 14.6 | 1600, 400, 25, 12.5 |
| 10 | 1600, 400, 25.0, 4.17 | 1600, 400, 25, 4 (global) |

Predictive vs inverse-covariance metric at τ = 1 ps **(derived here)**: $\tau F_\tau=(\approx0,\approx0,0.466,4.46)$,
$\tau\Sigma_\tau^{-1}=(1600,400,25.5,8.46)$. Caveat: note 25 reports ranges $[0,6.4]$ and $[10,1600]$ "in the
ALDP5-like check" — that check is evidently a different (non-commuting) system; do not mix it with this
four-mode example.

### E3. $\Lambda_t$ spectra at $\alpha_t^2=0.6$ (note 25 §4)

Printed: flat 0.0009, 0.0037, 0.057, 0.27; thermal 0.6 four times; 1 ps lag 0.6, 0.6, 0.61, 0.79. The flat
values follow from $\alpha_t^2/(\alpha_t^2+\sigma_t^2\lambda_k)$ with the E2 stiffnesses and $\sigma_t^2=0.4$ (reproduced here:
0.000937, 0.00374, 0.0566, 0.273). **(derived here)** The lag values are reproduced with
$r_k=\alpha_t^2\theta_k/(\alpha_t^2\theta_k+\sigma_t^2)$, $\theta_k=1/(1-e^{-2\tau/t_k})$ only if $D_0\tau\approx0.064$ Å² (0.610, 0.790);
with $D_0=0.08$, τ = 1 ps they would be 0.604 and 0.760. Pick one parameter set and state it.

### E4. Bonds at the trusted floor (note 21 Prop. 5; note 25 §6.2)

$t=0.01$, σ = 0.045 Å (flat, Å units): SNR bonds 0.30–0.46, one–three 1.1–1.7, softest 20–125, metric
noise 501. Note 25 §6.2 combines this with note 26: mean retention $r=0.23$–0.32, width $r^2=0.05$–0.10:
"Ninety to ninety-five percent of the bond-width information lies below the trained floor."

### E5. Gaussian retention under the project clock, and where its signal sits (derived here)

For variance λ in noise units: $r(t)=\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)$, $t_{1/2}$ from §2.10. Along VP
($a_t=\beta(t)$) Prop. 3 gives the closed form $D_t=-\dot r=\beta(t)\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)^2$ (checked
analytically: $\dot r=\dot{(\alpha^2)}\lambda/S_t^2$ with $\dot{(\alpha^2)}=-\beta\alpha^2$). In log-SNR $\ell=\log(\alpha^2/\sigma^2)$,
$dr/d\ell=r(1-r)$: a logistic bump centred at $\ell=-\log\lambda$. Degree-$j$ probes ($r^j$: width $j=2$,
products, note 30) have $d(r^j)/d\ell=j\,r^j(1-r)$, peaking at $r=j/(j+1)$, i.e. shifted to lower noise by
$\log j$ in log-SNR (0.69 for widths, 1.10 for $j=3$): fine, high-order structure carries its training
signal at lower noise.

### E6. Width and product laws (note 26)

Derivation above; numbers: $r=\tfrac12\Rightarrow R_{\rm width}=\tfrac14$. **Check on ALDP5 data (derived here):**
treating each stiff block as one Gaussian mode and fitting λ from the measured mean half-erasure level,
the $r^2$ law predicts the width half-erasure levels of the retention pilot: flat bond 0.0115 (measured
0.011), flat angle 0.0275 (0.025), spring16 bond 0.150 (0.14), spring16 angle 0.098 (0.10). The same
one-parameter curve predicts the 0.9 and 0.1 levels of the bond mean to within about 10–15% (flat:
0.0046/0.068 vs 0.0042/0.074; spring16: 0.079/0.436 vs 0.070/0.40).

### E7. Linear rule vs the ALDP5 pilot channels (derived here)

Flat channel scale 0.266933 Å per unit; a bond length sees the projection of two independent atomic noises,
variance $2\sigma^2c^2$, so $\lambda_{\rm eff}=w^2/(2c^2)$ with $w=0.025$–0.031 Å: predicted bond-mean
$t_{1/2}=0.0165$–0.0214 against the measured 0.020. Spring16 noise per bond at $t=1$ is 0.032–0.039 Å, so
$\lambda\approx0.61$–0.64 and $t_{1/2}\approx0.214$–0.218 against the measured 0.22.

### E8. Basin retention on the two-basin line (derived here)

Retention-video line: weights 0.65/0.35, means −1.0/1.9, sd 0.35 (Var x = 2.036), unit VP noise in this
coordinate. $R_B(t)=\mathrm{Var}(q_t)/(w(1-w))$ vs the linear probe $r(t)$ and $r^2$:

| t | 0.05 | 0.1 | 0.2 | 0.26 | 0.3 | 0.4 | 0.5 | 0.7 |
|---|---|---|---|---|---|---|---|---|
| $R_B$ | 1.000 | 0.995 | 0.891 | 0.738 | 0.618 | 0.335 | 0.144 | 0.014 |
| $r$ (linear) | 0.985 | 0.946 | 0.797 | 0.668 | 0.572 | 0.331 | 0.149 | 0.014 |
| $r^2$ | 0.971 | 0.895 | 0.635 | 0.446 | 0.327 | 0.110 | 0.022 | 0.000 |

Basin identity outlives the position probe at moderate noise and merges with it at large noise.

### E9. Posterior split at a saddle (note 21 Prop. 10; note 25 Prop. 3.4)

$p=\tfrac12\mathcal N(-m,S)+\tfrac12\mathcal N(m,S)$: $\nabla^2\log p=-S^{-1}+S^{-1}mm^\top S^{-1}\mathrm{sech}^2(m^\top S^{-1}x)$; generalized
eigenvalues of $(-\nabla^2\log p(0),S^{-1})$ are 1 and $1-r$, $r=m^\top S^{-1}m$; 1-D roughness
$\sup|(\log p)''|\cdot\mathrm{Var}(p)=r^2-1$. Basins 2 Å apart, width 0.2 Å: roughness 624, reduced by flat
noise to 397, 149 and 11 at $\sigma_t^2=0.01$, 0.04, 0.2 Å². **(derived here)** Noised under VP (flat, m = 1,
S = 0.04): $\Lambda_t(0)=1+\sigma_t^2(\alpha_t^2m^2-S_t)/S_t^2$, $S_t=\alpha_t^2S+\sigma_t^2$: 2.09 (t = 0.01), 6.70 (0.05),
5.03 (0.1), 1.73 (0.2), 0.65 (0.3), 0.09 (0.5); the split ($\Lambda>1$) ends when $\alpha_t^2m^2<S_t$.

### E10. Double well (note 25 §5, §6.4)

$U=4(x^2-1)^2$ (barrier 4 $k_BT$, $t_w=1/U''(\pm1)=1/32=0.031$, hopping time 8.4). Reversibility identity at
the shoulder: 6.1432–6.1430 vs 6.1440 for lags 0.002–50; residuals ≤ $1.6\times10^{-3}$. Gaussian-kernel score
estimator: relative error at $x=0.6$ of 2%, 9%, 29%, 58%, 92% at $\tau/t_w=$ 0.064, 0.32, 1.6, 6.4, 32;
absolute bias at the minimum 0.18, 0.70, 1.5, 1.6, 1.2 (score width 5.7). Long-lag Fisher at τ = 1: 7.44 at the
barrier vs 7.40 from $\sum\nabla w\nabla w^\top/w$; 0.0026 vs 0.0023 in the well; τ = 5: 2.87 vs 2.85; "3,000 times
larger" at the dividing surface than in the well.

### E11. Stein kernel and score-matching efficiency (note 25 §6.3; retention video scene 07)

$\tfrac12\mathcal N(-2.5,1)+\tfrac12\mathcal N(2.5,1)$: plain score matching (W = 1) 6.391× the ML variance, Stein kernel
1.0000×; control $\mathcal N(0,1)$ 1.0000×. Stein kernel 71.4 at the barrier, 4.1 in the wells (17×). **(verified
here)**: Var = 7.25, location Fisher information 0.8816, product 6.3912; $pW(x)=\int_x^\infty yp(y)dy$ gives 71.43
and 4.13. Retention video's line (0.65/0.35, −1.0/1.9, 0.35): u = x, W = 1 ratio 16.6 (verified: 16.604);
Gaussianizing map $z=\Phi^{-1}(F(x))$ with $W=1/\varphi'^2$ gives $L_W\varphi=-\varphi$ and ratio 1.00. **(derived here)**
$W$ at the density minimum ($x\approx0.48$) is about $3.3\times10^6$ vs 0.24 and 0.42 at the basin centres (the
video says "about 10⁶ times larger in the barrier than in the basins"; relative to the basins it is
closer to $10^7$).

### E12. Cramér–Rao for the αL population (note 25 §6.1)

| Trajectory | αL population | independent visits | mean dwell (ps) | CR relative sd |
|---|---|---|---|---|
| 0 | 3.24% | 37 | 219 | 0.90 |
| 1 | 1.65% | 37 | 111 | 1.27 |
| 2 | 4.11% | 37 | 278 | 0.79 |

(reproduced here from $\sqrt{(1-w)/(wn)}$). Hysteresis: enter φ > 20°, leave φ < −20°; 36–37 visits for
every threshold 10°–60°. **(derived here)** For 10% relative sd at w ≈ 0.033 one would need
$n\approx(1-w)/(0.01w)\approx2,900$ independent visits. The note's "1.9%" bound for αR/β (about 9,200 visits)
is not reproduced by $\sqrt{(1-w)/(wn)}$ with w ≈ 0.36/0.61 (1.4%/0.8%) — minor, unexplained.

### E13. Force-error metrics (note 25 §7)

Relative error ε: equilibrium cost $\tfrac12\epsilon^2$ per mode; path cost $\tfrac14D_0\epsilon^2\lambda_k$. With E2's
stiffnesses the bond's path cost is 400× the softest mode's (derived here).

### E14. Equal metric, unequal retention (note 28 §3)

$x\sim\mathcal N(0,1)$; line $\Phi_0(x)=(x,0,0)$ vs helices
$\Phi_\omega(x)=\big(\tfrac{\sqrt{1-b^2}}{\omega}\cos\omega x,\tfrac{\sqrt{1-b^2}}{\omega}\sin\omega x,bx\big)$ with $\Vert\Phi'\Vert=1$: b = 0.1,
ω = 4 and 16, σ = 0.1: posterior variance of x 0.01 (line) vs about 0.50 (either helix). "Equal metric,
rank and ambient dimension therefore do not imply equal information retention or equal score complexity."

### E15. BBA linear modes and the γ dial (note 27 §3)

27 principal modes (units Å/6.252): largest variances 15.5, 6.2, 3.0, 1.3 (93% of mean squared Rg),
half-erased at t = 0.53, 0.44, 0.37, 0.29 (reproduced here: 0.526, 0.440, 0.368, 0.284); smallest 0.011
at 0.028. Exponent table: γ = 0 / 0.25 / 0.5 / 0.75 / 1 → variance ratio 1,423 / 232 / 38 / 6.1 / 1,
first mode at 0.53 / 0.50 / 0.45 / 0.37 / 0.26, last at 0.028 / 0.065 / 0.13 / 0.20 / 0.26. Scale: a 0.43 Å
shift of mean Rg at spread 2.2 Å costs $0.43^2/(2\cdot2.2^2)\approx0.02$ nats.

### E16. Degree attenuation in a chain (note 30 §2; lab `2026-11-18-range-order-mechanisms`)

28 beads, 3.8 Å bonds, fixed angle, independent uniform torsions, exact posterior means:

| t | one torsion | $b_k\cdot b_{k+4}$ | $b_k\cdot b_{k+12}$ | $b_k\cdot b_{k+26}$ | end-to-end² | $R_g^2$ |
|---|---|---|---|---|---|---|
| 0.1 | 0.94 | 0.87 | 0.62 | 0.36 | 0.72 | 0.84 |
| 0.2 | 0.72 | 0.47 | 0.08 | 0.004 | 0.25 | 0.44 |
| 0.26 | 0.53 | 0.25 | 0.01 | 0.000 | 0.12 | 0.25 |

Effective degree $\log R/\log r$ of $b_k\cdot b_{k+m}$ ≈ two thirds of its $m-1$ torsions. BBA first-order loudness
in the internal chart: torsions 2.0, distances 3 apart 1.5, 7–10 apart 0.6, ≥ 11 apart 0.3, end-to-end 0.2
(linear half-erasure 0.33, 0.30, 0.22, 0.16, 0.14).

### E17. The retention video's toy molecule (`toy.js`) and line examples (`math.js`)

Bond r (Å) and torsion φ on the circle; two wrapped Gaussian basins A (65%, centre −1.0 rad) and B (35%,
centre 1.9 rad), sd 0.35 rad; bond mean $0.015\sin\varphi$ Å and sd $0.05(1+0.2\cos\varphi)$ Å; observables
$u_1=r$, $u_2=(r-m(\varphi))^2$, $u_3=\sum_bw_b(\varphi)\sin(\varphi-\varphi_b)$, $u_4=w_B(\varphi)$; channels: flat (scale 1 Å :
1 rad), local thermal widths (mean bond sd : 0.35 rad), global covariance (global sd of r : of φ); additive
noise σ·scale, 29 log-spaced σ from $10^{-2.5}$ to $10^{1.5}$; exact grid (80 × 56) retention with
$I_0-I_t=\mathbb E[\mathrm{Cov}(u\mid X_t)]$ to $10^{-12}$. Flow identity on the line: KL drop 0.3446 vs integrated
score error 0.3455. Circle heat kernel $k_\tau(\theta)=\frac1{2\pi}(1+2\sum_ne^{-n^2\tau/2}\cos n\theta)$: $F_\tau\approx1/\tau$ at small τ,
$F_\tau\sim2e^{-\tau}$, $\tau F_\tau\to0$.

---

## 4. Key empirical results

### 4.1 ALDP5 time scales (note 25 §3; mdshare explicit solvent, 3 × 250,000 frames at 1 ps; five backbone atoms; per-coordinate, diagonal view)

Saturation fraction $f_k(\tau)=\tfrac12\mathrm{Var}(q_{t+\tau}-q_t)/\mathrm{Var}_{\rm eq}$, trajectory 0 (trajectory 1 in brackets where different):

| τ (ps) | bonds | angles | φ global | φ, start φ<0 | ψ global | ψ, start αR | ψ, start β |
|---|---|---|---|---|---|---|---|
| 1 | 0.91–1.03 | 0.89–0.98 | 0.24 (0.31) | 0.43 | 0.052 | 0.14 | 0.11 |
| 10 | 1.00 | 0.93–0.99 | 0.55 (0.71) | 0.97 | 0.16 | 0.54 | 0.33 |
| 20 | 1.00 | 0.94–0.99 | 0.58 (0.73) | 1.00 | 0.25 | 0.90 | 0.51 (0.55) |
| 50 | 1.00 | 0.95–0.99 | 0.58 (0.73) | 1.01 | 0.46 (0.49) | 1.70 | 0.90 (0.98) |
| 100 | 1.00 | 0.97–0.99 | 0.60 (0.74) | 1.03 | 0.66 (0.70) | 2.5 | 1.3 |
| 1000 | 1.00 | 0.99–1.00 | 0.78 (0.83) | 1.17 (1.07) | 0.88 | 3.2 | 1.7 |
| 10000 | 1.00 | 1.00 | 0.96 (0.97) | — | 0.89 | — | — |

Widths: bonds 0.025–0.031 Å, angles 2.9–3.3°, φ 41° (37°) global and 32° for φ<0, ψ 78° global and 50–52°
inside αR or β; 1 ps half-step widths: bonds 0.024–0.031 Å, angles 2.8–3.2°, φ 20°, ψ 18°. Time scales:
bonds/angles below 1 ps (angles keep a 5–10% slow component saturating only by 200–500 ps); φ libration
≈ 10 ps; ψ libration 20–50 ps (faster in αR); αR↔β hop 100–200 ps (≈ 9,200 visits of each state per
trajectory; mean dwell 6–7 ps in αR, 20 ps in β); αL hop 5–20 ns (37 visits; dwell 110–280 ps). Consequences:
the 1 ps metric weighs ψ ≈ 19× (global; 7–9× against sub-basin libration) and φ ≈ 2.3× stiffer than their
equilibrium spreads; ψ basin decision deferred to $\sigma^2/\alpha^2\approx19$ (4.4 in σ). Within-basin thermal lag 10–20 ps;
from 100 ps within 1.5× of the global covariance; from 5 ns 1.0–1.15. αL (1.7–4.1% of frames) raises φ's
variance only from 32² to 41² deg² (×1.7): "Rare basins are invisible to variances." (Status.md summarises
these as "bonds/angles < 1 ps, φ libration ≈ 10 ps, ψ hop ≈ 100 ps, αL hop ≈ 10 ns"; the note's ranges
are the primary numbers. Note 25 §0 says the 1 ps step covers "42%" of φ's within-basin variance; its own
table and the lag sweep say 0.43.)

### 4.2 Retention pilot (PR #929; `docs/investigations/information-retention.md`, evidence 2026-11-04)

Clean input, held-out trajectory 1, block trace fractions (mean of 3 seeds):

| Channel | Predictor | Bond mean | Angle mean | Bond width | Angle width | Torsion | Basin | Coupling |
|---|---|---|---|---|---|---|---|---|
| flat | linear | 0.38 | 0.47 | −0.01 | 0.01 | 0.95 | 0.87 | 0.15 |
| flat | MLP 2×128 | 0.99 | 0.99 | 0.39 | 0.78 | 1.00 | 0.98 | 0.97 |
| flat | MLP 3×256 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| spring16 | linear | 1.00 | 1.00 | −0.01 | 0.03 | 0.97 | 0.91 | 0.21 |
| spring16 | MLP 2×128 | 1.00 | 1.00 | 0.99 | 0.99 | 1.00 | 0.98 | 0.99 |
| spring16 | MLP 3×256 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |

Where information is lost (wide MLP; t at R = 0.9 / 0.5 / 0.1; share of uniform training times inside the
0.9–0.1 interval):

| Block | Flat | share | Spring16 | share |
|---|---|---|---|---|
| Bond mean | 0.0042 / 0.020 / 0.074 | 7% | 0.070 / 0.22 / 0.40 | 34% |
| Angle mean | 0.010 / 0.045 / 0.18 | 17% | 0.049 / 0.15 / 0.36 | 31% |
| Bond width | 0.0023 / 0.011 / 0.033 | 3% | 0.050 / 0.14 / 0.28 | 24% |
| Angle width | 0.0056 / 0.025 / 0.077 | 7% | 0.030 / 0.10 / 0.20 | 17% |
| Coupling | 0.0071 / 0.040 / 0.18 | 17% | 0.056 / 0.17 / 0.36 | 31% |
| Torsion | 0.12 / 0.32 / 0.79 | 68% | 0.13 / 0.32 / 0.70 | 57% |
| Basin | 0.20 / 0.38 / >1 | 80% | 0.22 / 0.37 / >1 | 79% |

At floors: flat ≥ 0.996 at $t=10^{-5}$, spring16 ≥ 0.985 at $t=10^{-2}$. Design: 16 times $10^{-5}$–1 plus clean;
3 seeds; 204 + 102 rows, none failed; calibration on trajectory 0 (250,000 frames), predictor fit on 100,000
frames of trajectory 0, evaluation on trajectories 1 and 2 at 5 ps stride (50,000 frames each), 10 ns bootstrap
blocks. Uncertainty: seed spread ≤ 0.005 (0.014 spring16 basins); bootstrap half-widths ≤ 0.04 for stiff
blocks, up to 0.2 (coupling) and 0.5 (basins at t > 0.1); the two held-out trajectories disagree by up to 0.35
on basin retention at t ≥ 0.2 (φ>0 holds 3.2%, 1.7%, 4.1% of frames) — basin and torsion values above t ≈ 0.2
uncertain by about ±0.2.

### 4.3 Time-allocation intervention (2026-11-05; three paired seeds, 20,000 updates, 20,000 molecules per checkpoint, 840,000 total)

Band share 7.8% → 53.9%; torsion-loss interval 68% → 34%. Paired means (control → intervention):
bond W1/σ 0.186 → 0.147 (1k), 0.046 → 0.025 (20k); angle 0.089 → 0.151 (1k), 0.024 → 0.029 (20k); φ/ψ PMF
0.49 → 0.78 (1k); stiff–soft 0.142 → 0.209 (1k); validity 0.922 → 0.941 (1k). Floors: bond 0.010, angle
0.013, JS 0.019, PMF 0.32. Rare-basin free energy not rankable (reference trajectories differ by 0.98).

### 4.4 Learned retention maps (PR #933; three seeds; 20,000 updates)

Retention averaged over the generator's time law (mean of 3 fits): bond width 0.07 (unchanged invariant) →
0.16 (linear re-mixing) / 0.18 (nonlinear physical) / 0.08 (nonlinear local-moment) / 0.16–0.17 (internal
coordinates); torsion 0.36–0.42; basin 0.48–0.57. Generators (bond W1/σ at 1,000 → 20,000 updates):
flat 0.186 → 0.046; unchanged 0.025 → 0.014; linear 0.017 → 0.013; nonlinear local-moment 0.092 → 0.020;
nonlinear physical 0.022 → 0.013; IC conditional 0.016 → 0.013; IC global 0.016 → 0.013; floor 0.010. At
100 updates bond error 0.04–0.06 (learned) vs 0.146 (invariant) vs 2.74 (flat). Map fits 14–35 s.

### 4.5 Lag sweep, soft-scale sweep, torsion Gaussianization (2026-11-05; CPU; two seeds; 20,000 updates; 20,000 molecules per checkpoint)

| Arm | JS @100 | @1k | @2k | @20k | bond PMF @100 | valid @100 | saddle /10,000 @100 → @20k |
|---|---|---|---|---|---|---|---|
| flat low floor | 0.117 | 0.0254 | 0.0226 | 0.0203 | 0.587 | 10% | 184 → 11 |
| warp 1 ps | 0.127 | 0.0336 | 0.0278 | 0.0236 | 0.080 | 96% | 163 → 6 |
| warp 10 ps | 0.049 | 0.0354 | 0.0283 | 0.0227 | 0.072 | 96% | 89 → 10 |
| warp 100 ps | 0.027 | 0.0245 | 0.0240 | 0.0230 | 0.064 | 97% | 77 → 30 |
| spring γ = 30 | 0.133 | 0.0337 | 0.0250 | 0.0212 | — | 97–98% | 153 → 10 |
| spring γ = 8 | 0.149 | 0.0430 | 0.0266 | 0.0216 | — | — | 169 → 10 |
| spring γ = 2 | 0.163 | 0.0569 | 0.0325 | 0.0212 | — | — | 194 → 8 |
| torsion Gaussianized | 0.042–0.043 | — | — | 0.029 | — | — | 7–11 (0.1% floor) |
| linear torsion control | 0.255 | — | — | 0.022 | — | — | — |

Floors: JS 0.0185 (two halves), 0.0226 (second MD); saddle MD 4.0/5.2/6.1. Warp fits: c = 0.249/0.361/0.578 Å;
κ learned 2.99/3.59/3.75, flat slice 184/354/762; step widths φ 20.3/30.7/31.8°, ψ 17.9/31.7/63.4°. Gaussianity:
total KL to a Gaussian over the nine principal axes 0.96 (flat slice), 0.96 (1 ps), 0.20 (10 ps), 0.14 (100 ps),
1.41 (spring γ = 30), 0.98 (γ = 2); largest bimodality 0.80, 0.73, 0.44, 0.37, 0.81, 0.55. Torsion swing ≈ 0.7 Å
= $0.7\sqrt\gamma$ bond widths: 3.8, 2.0, 1.0 at γ = 30, 8, 2.

### 4.6 Retention maps with the bead model and Sprint 12 (2026-11-06 → 11-14)

#955 BBA (20k updates, 3 seeds, 20,000 molecules): aligned Cartesian bond 1.00 Å, angle 14.7°, TIC JS 0.151
(+ map 1.08, 15.5, 0.154); springs 0.029, 15.5, 0.166 (+ map 0.078, 17.3, 0.198); internal 0.0016, 1.8, 0.069
(+ map 0.0019, 1.9, 0.083). ALDP5: map halves whitening's angle error at 1,000 updates (0.063 → 0.031) and
improves its force field (φ/ψ PMF 1.15 → 0.93). Sprint 12 first chunk (seed 0): see §1.6.

### 4.7 BBA readable windows and range/order (note 27 §5, #1055; `bba-range-and-order.md`; lab 2026-11-16)

| $t_{1/2}$ (training $t\in[0.01,1]$) | Cartesian | C3 internal | C1 whitened |
|---|---|---|---|
| bond lengths | 0.0004 | 0.26 | 0.26 |
| bond angles | 0.05 | 0.35 | 0.33 |
| torsions | 0.08 | 0.35 | 0.29 |
| radius of gyration | 0.47 | 0.27–0.28 | 0.35 |
| long-range distances, pooled | 0.44 | 0.24 | 0.33 |
| long-range contacts | 0.38 | 0.23 | 0.31 |
| end-to-end | 0.45 | 0.18 | 0.31 |
| slowest TIC | 0.36 | 0.49 | 0.46 |

Lab entry (2026-11-16): Chroma-style ideal chain bond 0.0032 / Rg 0.24; fully data-matched covariance bond
0.0049 / Rg 0.21; internal + 2 loud modes Rg ≥ 0.42; EigenFold (own clock) bond 0.0016 vs Rg 215 ("even more
order than Cartesian noise (five decades … against three)"). Trained (50k updates): Cartesian with distance
inputs bond 0.013 Å, angle 2.2–2.4°, Rg 0.07–0.11 Å; C3 0.0007 Å, 0.23°, 0.46–0.49 Å; floor 0.0005, 0.11–0.14,
0.01–0.04. Order dial Rg W1: γ = 1 0.51, 0.5 0.19, 0.25 0.12, 0 0.08 (one seed each). Loud block size: Rg W1
0.477 (C3), 0.161 (1), 0.105 (2), 0.136 (4), 0.152 (8), 0.325 (16), 0.399 (27); torsion error 0.90 → 11.0°.
Traps: Rg $R^2$ at t = 0.05 falls 0.82 → 0.34 → 0.14 → −0.03 with ±10 ns/±100 ns/±1 µs exclusion; 103-d
posterior has median effective sample size 1.

**Caveats overall.** ALDP5 pilots are exploratory, CPU, 2–3 seeds, 20k updates, one molecule; torsion and αL
readouts are floor-limited (two MD trajectories differ by as much as the models); retention values are lower
bounds tied to predictor capacity; BBA tests are 50k updates (26% of the registered budget), one or two seeds.

---

## 5. Why promising / why it failed / what was learned

**Derived facts (stand).**
- The project's step metric is a Fisher metric (of the transition family in predicted-mean coordinates);
  zero lag is flat; the predictive metric $F_\tau$ forgets stiff modes, so it cannot be a noise metric.
- The lag (or γ) is a one-parameter family from flat to within-basin thermal to global; under lag-shaped
  noise modes are erased in order of relaxation time (exact in a linear basin).
- One matrix $\Lambda_t$ contains denoiser conditioning, E4, sampler stiffness and basin splitting.
- Retention is Fisher information about physical tilts; it contracts along the Markov noising; its loss rate
  equals the noisy score's sensitivity; its total over noise is chart-invariant; any predictor gives a lower
  bound; widths decay as $r^2$, degree-$j$ products as $r^j$.
- No metric, noise or objective beats the visit-count Cramér–Rao bound on αL (relative sd ≥ 0.79–1.27).

**Why it looked promising.** The lag dial explained a real anomaly quantitatively (the 1 ps warp weighs ψ 19×
too stiff; no torsion advantage); the 100 ps warp then learned the whole Ramachandran map in 100 updates.
The retention pilot showed flat noise spends 3–7% of updates where stiff information is lost vs 17–34% for
springs, and learned retention maps learned several-fold faster early.

**Why parts failed (with the documents' causal explanations).**
- *Synchronized erasure by rescaling* did not explain the 100 ps result: lowering γ slowed torsions; the
  warp's coordinates were nearly Gaussian (KL 0.14), so the score was nearly linear — a Gaussianization lever,
  "a different lever from stiffness removal" (spring-soft-scale-sweep, 2026-11-05). Marginal Gaussianization
  reproduces the fast start but leaves a joint-density deficit (torsion-gaussianization).
- *Time allocation* bought bonds at the cost of angles/torsions because the band takes training away from
  t > 0.08 where angle means and all torsion/basin information are still being lost.
- *Retention maps* help early and on whitening; on BBA with a bead-token model they hurt every
  representation; hypothesis: "a dense mixing of many coordinates suits a bead-token model badly" (untested).
- *Whitening everything* (E4 for all modes) removes order: C3/C1 erase global and local features in one band,
  where the global signal is a tiny share of the reducible loss (C3's gradient from t > 0.11 indistinguishable
  from zero at 50k) [H for the causal link].
- Status 2026-11-14: "Prediction is not generation": optimized proxies (conditioning, noise-prediction risk,
  gradient variance, update-0 quality, retention) improved without two-system generation gains; only
  changes of the noising coordinates moved BBA's global structure.

**Hypotheses still open.** Early basin decisions vs synchronized erasure (P1's A/B) as a mechanism; whether the
100 ps plateau is warp-specific (soft-scale sweep says yes) or intrinsic; the barrier-stretching loss weight
(P4); the "range and order" hypothesis itself (supported for size at 50k and 190k updates on BBA, untested
beyond BBA; ALDP5 has no local/global separation).

**Later corrections and superseded readings.** E4 as a whole-molecule goal (note 20, 2026-10-23) →
kept only for stiff coordinates (status, 2026-11-14). The #769 "soft scale should be the across-basin spread"
implication (2026-11-05 14:21 UTC) → corrected 1 h 47 min later. "Higher retained physical information
predicts faster learning" (ALDP5, 2026-11-05) → not general on BBA (#955) and windows "ranked the models
correctly by size error but understated the differences" (#1057).

---

## 6. Visualization opportunities

Each item: insight · on screen · computed from · numbers · pitfalls.

**V1. Three rulers from one trajectory.** Insight: thermal stiffness, inverse lag covariance and predictive
Fisher information are different geometries; only a finite lag gives a non-flat metric. On screen: log-log
plot vs τ for a bond and a torsion: $\tau\Sigma_\tau^{-1}$ and $\tau F_\tau$ both start at $1/(2D)$; $\Sigma_\tau^{-1}$ saturates at λ,
$F_\tau$ collapses (bond first); dashed thermal levels 1/v; step metric $\Sigma_{\tau/2}$ as a third curve; inset
sample paths. Analytic (E1). Pitfall: the retention video's scene 02 already does most of this; extend
rather than duplicate (add $\Sigma^{\rm step}=\Sigma_{\tau/2}$, the "dual coordinates" map $x\mapsto e^{-\tau/t}x$, and the
"variance not width" fix).

**V2. The lag dial (centrepiece).** Insight: one slider τ turns the step metric from flat to within-basin
thermal to global whitening, and the soft scale γ = 1/(D₀τ) is the same dial. On screen: bars of
$\lambda_k/(1-e^{-\tau/t_k})$ on a log axis with a descending "floor line" $1/(D_0\tau)$ that clips every mode slower than
τ; regime labels; markers for the 1 ps warp, 10 ps, 100 ps warp, γ = 30 and γ ≈ 2 Å⁻² (#769 comment); below,
the half-erasure levels $1/(1-e^{-\tau/t_k})$ on a $\sigma^2/\alpha^2$ axis sliding into order. Analytic (E2 table) or the
measured ALDP5 fractions (4.1) in "data mode". Pitfalls: ALDP5 fractions are per-coordinate,
explicit-solvent, can exceed 1 for conditioned starts (hops), are anharmonic; D₀ for ALDP5 is not measured
(0.08 Å²/ps is the example value); in the commuting closed forms only.

**V3. The clocks of a dipeptide.** Insight: four time scales spanning five decades decide what a lag sees.
On screen: log time axis 0.1 ps–250 ns with bands (bonds/angles < 1 ps; φ libration ≈ 10 ps; ψ libration
20–50 ps; αR↔β hop 100–200 ps with ≈ 9,200 visits; αL hop 5–20 ns with 37 visits), the 1 ps frame spacing, a
Ramachandran replay with a moving "lag window" and the saturation-fraction curves of 4.1 filling up.
Precomputable from the mdshare trajectories (data hash in thermal-submanifold.md) or the logged table.
Pitfall: explicit solvent ≠ benchmark frames; status.md's rounded "ψ hop ≈ 100 ps" mixes libration and hop.

**V4. What a 1 ps step sees.** Insight: a 1 ps step covers 5% of ψ's variance and 43% of φ's within-basin
variance, so the 1 ps metric overweights ψ ≈ 19×. On screen: Ramachandran plane with the equilibrium
spreads (φ 32°/41°, ψ 50–52°/78°) and the step ellipse growing with lag (φ 20.3 → 30.7 → 31.8°, ψ 17.9 →
31.7 → 63.4° at 1/10/100 ps); bonds unchanged at every lag. Logged numbers. Pitfall: widths vs variances.

**V5. Erasure order under flat, thermal and lag noise.** Insight: flat noise spreads half-erasure over
κ ≈ 400 (2.6 decades), thermal synchronizes everything, lag noise decides slow modes first. On screen: three
lanes of SNR curves vs $\sigma^2/\alpha^2$; a reverse-time playback where modes "freeze in" in that order ("destroyed
forward = decided backward"). Analytic (E2, Prop. 2). Pitfall: synchronized erasure was *not* what made the
100 ps warp fast (V10).

**V6. $\Lambda_t$: one matrix for four problems.** Insight: denoiser conditioning (E3), equal erasure (E4), sampler
stiffness and basin splitting are eigenvalues of the whitened posterior covariance. On screen: a noisy point,
its posterior cloud and the $\Lambda_t$ ellipse in whitened units; eigenvalue bars with markers at ½ (erasure),
1 (split threshold); dial between flat (0.0009…0.27), thermal (0.6×4) and lag noise at $\alpha_t^2=0.6$; for the
symmetric mixture the saddle eigenvalue rising above 1 (2.09 → 6.70 → 5.03 → 1.73 → 0.65 at t = 0.01 → 0.3,
E9). Analytic. Pitfalls: state $D_0\tau$ (E3 discrepancy); the P3 checkpoint readout was never run — any
"measured" spectrum would be new work.

**V7. Information about what? (retention of four distinctions).** Insight: different physical distinctions
die at different noise levels, and which goes first depends on the channel. The retention video's scenes
04–06 do this on the toy. Extensions: overlay the $r^2$ law (width curve = square of the mean curve) with a
live readout "mean keeps ½ → width keeps ¼"; add the degree-$j$ family $r^j$; show the ALDP5 check that the
$r^2$ law predicts the measured width half-erasure levels (0.0115 vs 0.011, 0.150 vs 0.14; E6). Analytic +
logged. Pitfall: the $r^2$ law is Gaussian; molecular agreement is a consistency check, not a theorem.

**V8. Basin membership as a histogram.** Insight: $R_B=\mathrm{Var}(q_t)/(w(1-w))$ — retained basin information is the
spread of posterior membership probabilities. On screen: histogram of $q_t(Y_t)$ morphing from two spikes at
0 and 1 to one spike at w as t grows; numeric readout of $R_B$ next to the linear-probe $r$ (E8 table).
Analytic on the two-basin line. Pitfall: normalization hides rarity; pair with V11.

**V9. Where the training signal lives.** Insight: the score feels a distinction exactly where its information
is being destroyed (Prop. 3); total signal is fixed, its placement is the design choice. On screen: bumps
$-dI/dt$ (or $dR/d\log\mathrm{SNR}=r(1-r)$) per probe for flat vs spring16; shaded training-time density; the share
numbers (bond width 3% vs 24%; torsion 68% vs 57%); then the time-allocation move (7.8% → 53.9%, torsion 68% →
34%) and its outcome (bond 0.046 → 0.025 at 20k; angles/torsions worse early). Analytic bumps + logged
results. Pitfalls: t-clock dependence (show log-SNR too); uniform-t share is a property of the training
law; the intervention was "not a net improvement".

**V10. The plot twist of 5 November.** Insight: the 100 ps warp's speed came from Gaussianizing the slow
modes, not synchronized erasure. On screen, four acts: (1) predictions A vs B; (2) Ramachandran maps at 100
updates (JS 0.027 vs flat 0.117, 1 ps 0.127) and learning curves; (3) γ sweep slowing (0.133/0.149/0.163) and
histograms of the leading principal axis in each coordinate system (KL 0.96 → 0.14, bimodality 0.80 → 0.37);
(4) the torsion-Gaussianization test (0.042 vs 0.255 at 100 updates; 0.029 vs 0.022 final) and the αL saddle
surplus (30 vs 4–6 per 10,000). Live toy: the Gaussianizing map $\Phi^{-1}\circ F$ of the two-basin line (already in
`math.js`), diffusion on z with linear score $-z$. Logged results + figures at commit `2eb1e5cb`. Pitfalls:
early vs final ranking reverses; two seeds; CPU pilot; Sprint 12 `long_lag` later did poorly.

**V11. Rare basins: invisible to variances, limited by visits.** Insight: αL raises φ's variance only 1.7×, and
37 visits cap any estimator at order-one relative error. On screen: φ histograms with/without αL; three
trajectories' populations (3.24%, 1.65%, 4.11%) with Cramér–Rao bars (0.90, 1.27, 0.79); a slider for visits
showing ≈ 2,900 visits for 10% relative error at w ≈ 0.033 (derived). Logged + analytic. Pitfall: a lower
bound with a Bernoulli-per-visit model.

**V12. Efficient loss metrics stretch barriers.** Insight: the metric that makes score matching efficient for
basin weights lives at barriers, so it cannot be a noise metric. On screen: mixture density, Stein kernel
(71.4 at the barrier vs 4.1 in wells) and the variance ratio 6.391 → 1.000; beside it the long-lag Fisher
metric (3,000× at the dividing surface) and the Gaussianizing mobility (≈ 3.3×10⁶ in the barrier). Analytic.
Pitfalls: derivation not re-proved in note 25; three different objects (Stein kernel, long-lag Fisher,
closure mobility) must be labelled distinctly.

**V13. Two prices of a force error.** Insight: equilibrium populations feel errors in thermal units; kinetics
in mobility units. On screen: per-mode bars $\tfrac12\epsilon^2$ (flat) vs $\tfrac14D_0\epsilon^2\lambda_k$ (bond 400× torsion). Analytic.

**V14. Destroyed forward, decided backward: range and order.** Insight: a good process keeps every feature
readable inside the trained range and erases global shape last. On screen: forward noising of a BBA chain
with per-class readability bars draining; reverse playback filling them; a hatched "untrained below
t = 0.01" zone; three processes: Cartesian (bonds die at 0.0004 inside the hatch), C3 (all in 0.18–0.35), IC +
2 loud modes (Rg ≥ 0.42, local 0.26–0.35). Logged windows (4.7). Pitfalls: lower bounds; estimator-dependent
(C3 Rg 0.23 → 0.27–0.28 with a stronger read-out); use log-SNR when mixing schedules; windows understate
differences in trained error.

**V15. A design-space map of processes.** Insight: range and order are two axes. On screen: x = bond $t_{1/2}$
(log, with $t_{\min}$ line), y = Rg $t_{1/2}$ / local $t_{1/2}$; points: Cartesian (0.0004, 0.47), C1 (0.26, 0.35), C3
(0.26, 0.27–0.28), IC + 2 loud (0.26, ≥ 0.42), Chroma-style (0.0032, 0.24), data-matched covariance (0.0049,
0.21); EigenFold as an inset (own clock: 0.0016 vs 215). Logged. Pitfall: EigenFold's clock differs; values
are floors.

**V16. The order dial (whitening exponent) and its kinship with the lag dial.** Insight: $\lambda^{1-\gamma}$ rescaling
compresses the spread of erasure levels; the trained size error follows. On screen: γ slider; variance ratio
1,423 → 232 → 38 → 6.1 → 1; first/last half-erasure (0.53/0.028 … 0.26/0.26); Rg W1 0.08, 0.12, 0.19, —,
0.51; side panel with the lag dial (V2) showing the same compression via $\max(\lambda,1/(D_0\tau))$. Analytic given the
BBA spectrum (needs the 27 eigenvalues from data) + logged. Pitfall: one seed per exponent; modes only — bonds
need explicit stiff channels.

**V17. Anti-order in internal coordinates.** Insight: products of many torsion phases are erased first, so
internal coordinates erase global shape before local torsions. On screen: chain model; curves $r^j$ for
growing separation; table values (E16); the loud block lifting the Rg window. Analytic (lab script) + logged.
Pitfall: independent uniform torsions are a toy; BBA loudness is first-order.

**V18. Same metric, different retention (line vs helix).** Insight: the channel, not the metric, sets retention.
On screen: a noise ball around a point on a helix touching several turns; posterior of x multimodal; variance
0.01 (line) vs ≈ 0.50 (helix). Analytic (1-D grid posterior). Pitfall: ambient noise on an embedding is not
intrinsic diffusion.

**V19. Present but not usable.** Insight: information can survive yet be inaccessible to a finite predictor;
learned maps fix accessibility. On screen: bars of clean-input bond-width retention (flat 2×128: 0.39; spring
0.99; 3×256: 1.00/1.00); then generator learning curves for learned maps (bond W1/σ at 1k: flat 0.186, unchanged
0.025, linear 0.017, local-moment 0.092; converging by 20k). Logged. Pitfalls: lower bounds, never clip
negatives; early gains fade; BBA (#955) reverses; cost-matched view.

**V20. The score from the future (reversibility identity).** Insight: the score is the expected displacement over
lag 2τ in lag-metric units. On screen: from x, a fan of 2τ trajectories; average displacement arrow equals
$\Sigma_\tau\nabla\log\pi$; double-well error growth (2% → 92% at τ/t_w 0.064 → 32). Analytic (grid matrix exponential).
Pitfall: "not a better score estimator".

**V21. A probe calculator (explorable).** Insight: under the project clock, any variance λ in noise units has a
predictable window. On screen: input λ (or a width and a channel scale), outputs $r(t)$, $t_{1/2}(\lambda)$, decision
window, the $r^2$ width curve and the signal bump; presets: ALDP5 flat bond (two-atom factor: 0.0165–0.0214
vs measured 0.020), spring16 bond (0.214–0.218 vs 0.22), BBA modes (0.53 … 0.028). Analytic. Pitfall: linear
rule only; nonlinear features (bond length in Cartesian) need the two-atom factor or a measurement.

**V22. From E4 to range and order (timeline).** Insight: the desideratum changed from "erase everything
together" to "everything readable, coarse erased last". On screen: dated milestones (2026-10-23 E4; 11-04
notes 25/26; 11-05 experiments and correction; 11-12/14 range & order; 11-16 registered budget; 11-18 note 30)
with one exemplar plot each. Logged.

**Natural extensions of the existing retention video.** (a) Replace the three discrete channels (flat /
local / global) by a continuous lag or exponent slider (V2/V16) — they are three points of one dial, but in
the toy's mixed units (Å and rad) "flat" is not literally τ → 0 unless the mobility per coordinate is set
explicitly. (b) Add $\Lambda_t$ (V6) after scene 05's posterior cloud. (c) Add measured ALDP5 numbers (V3, V4,
V11). (d) Add the $r^2$/$r^j$ laws (V7, V17). (e) Add the 5 November experiments (V9, V10, V19) and the BBA
sequel (V14, V15). Fixes: scene 02's "% of its equilibrium width" is a variance ratio; scene 06's
"no corresponding torsion advantage" predates the Gaussianization and retention-map results; scene 07's
"≈ 10⁶" barrier mobility is ≈ 10⁷ relative to the basin centres; scene 11's programme items 1 and 3 have since
been executed (retention curves in #929; conditional normalisation in #933 equal to global on ALDP5; the BBA
analytic conditional bond score of #1023 gave accurate bonds but not easier angles, note 28 §6). The side video
"The geometry of information" (`private/other/information-geometry`, coins/dice/Gaussians) already teaches
Fisher-metric basics and can be referenced rather than repeated.

---

## 7. Open questions, caveats, contradictions, superseded interpretations

1. **P3 never executed.** The $\Lambda_t$ readout on saved checkpoints is proposed in note 25 §9 and as "next
   evidence" in the lag-sweep, soft-scale, torsion-Gaussianization and bead-matched reports; no execution found.
   The erasure order was therefore never measured on trained models (lag sweep verdict item 2).
2. **P4 (barrier-stretching loss weight)** untested; bounded by 37 visits.
3. **Hypothesis A vs B** (early basin decision vs synchronized erasure) remains mechanistically unresolved; B's
   early win was re-attributed to Gaussianization (2026-11-05).
4. **Numerical detail:** note 25's $\Lambda_t$ lag eigenvalues (0.61, 0.79) and the ranges $\tau F_\tau\in[0,6.4]$,
   $\tau\Sigma_\tau^{-1}\in[10,1600]$ do not follow from the stated four-mode example with $D_0=0.08$ (they match
   $D_0\tau\approx0.064$; derived here). The αR/β "1.9%" Cramér–Rao figure is not reproduced. "42%" (note 25 §0) vs
   0.43 (its table; lag sweep).
5. **Video vs note 25 on the memos' conjectures.** The retention video (based on a Sprint 11 review given in
   chat, not in the repo) labels "$g_\tau=\tau F_\tau$ follows a modified Ricci flow" **false** via the circle
   ($\tau F_\tau\to0$ although Ric = 0 and π uniform); note 25 §8 grades the short-time expansion (conjecture 1)
   "consistent with the linear case … scaling not resolved" and the Ricci-flow time (conjecture 3) "not
   assessed". Different scopes (global flow vs short-time expansion); do not present them as one verdict.
6. **Superseded:** E4 as a global goal (note 20, 2026-10-23) → stiff-only (status 2026-11-14); "soft scale should
   be the across-basin spread" (#769, 2026-11-05 14:21 UTC) → corrected 16:08 UTC; "Higher retained physical
   information predicts faster learning" (ALDP5, 2026-11-05) → not general (#955; #1026 windows did not predict
   learning speed; #1057 understated differences).
7. **Lag on BBA:** "1 ps" BBA pairs are ≈ 200 ps apart (status 2026-11-14); historical BBA lag results must be
   re-read. Sprint 12 `short_lag`/`long_lag` were poor and unstable in ALDP5 simulation (40/640, 3/640 records).
8. **Reference-data floors:** torsion and αL readouts cannot rank arms (trajectories differ by 0.98 kT on the
   rare-basin free energy); retention of basins above t ≈ 0.2 uncertain by ±0.2.
9. **Scope limits:** note 25's propositions exact only in linear basins; the time-scale measurement is diagonal,
   explicit solvent; efficiency claims checked at abstract level; note 26 is a derivation with no fitted model;
   readability is a floor and depends on the estimator; leakage through temporal neighbours is a real trap.
10. **Open science:** whether range and order generalize beyond BBA; whether retention-guided maps help at the
    registered budgets; whether a joint (not marginal) Gaussianization keeps the fast start without the late
    deficit; whether the force-field size drift (status 2026-11-15/16) is a small-noise information problem in
    the sense of note 26 (bond width information below the floor).

---

## 8. Sources read

**Theory (rg-main):** `docs/theory/25-information-geometry-lag-noise-posterior.md` (full),
`docs/theory/26-information-retention.md` (full), `docs/theory/27-readable-windows-and-noise-order.md` (full),
`docs/theory/background/02-langevin-and-ornstein-uhlenbeck.md` (full), `docs/theory/20-thermal-metric-foundations.md`
(§0, §1.4, §4, §5), `docs/theory/21-target-loss-noise.md` (§0, §2.3–2.4, §5, §7.4, §8),
`docs/theory/28-score-ease-and-thermal-preconditioning.md` (§1–3, §5–8), `docs/theory/30-loud-blocks-in-redundant-charts.md`
(§0–3), `docs/theory/README.md`.
**Investigations/design:** `docs/investigations/information-retention.md` (full), `docs/investigations/learned-warp-lag-sweep.md`
(full), `docs/investigations/spring-soft-scale-sweep.md` (full), `docs/investigations/torsion-gaussianization.md` (start),
`docs/investigations/lag-slow-mode-review-evidence.json`, `docs/investigations/sprint11-pullback-campaign-closeout.md`
(summary, #955, insights), `docs/investigations/bba-range-and-order.md` (§0–4), `docs/design/thermal-submanifold.md` (full),
`docs/status.md` (range and order; Sprint 11), `docs/sprints/README.md`, `docs/sprints/sprint12/matched-results.md`,
`docs/sprints/sprint12/linear-retention.md`, `docs/sprints/sprint12/candidates/historical-candidates.md`,
`lab/2026-11-16-readable-windows-noise-precedents/README.md`, `lab/2026-11-18-range-order-mechanisms/README.md`.
**Archive:** `rg-archive/docs` searched for Fisher/retention (no earlier retention work).
**GitHub:** issue #769 (body and comment timeline), #927, #939, #989; PRs #925, #926, #929, #933, #936, #938, #941,
#950, #955, #1026, #1055, #1057, #1064, #1069, #1071, #1079 (metadata; #950 body).
**Animation:** `anim-playable-video-prototype/src/videos/retention/` (index.js, meta.json, math.js, toy.js,
shared.js, all scenes 00–11) and the README "Retention · What the noise should keep" section;
`anim-information-geometry-video/private/other/information-geometry/README.md` (side video, for overlap).
