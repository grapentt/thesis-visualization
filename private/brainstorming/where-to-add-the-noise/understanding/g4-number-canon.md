# g4 · Number canon: one definition and one value for every recurring quantity

Reader g4, 2026-11-19. Scope: before any number goes on screen, fix what it measures, its value, its data set, its budget and its source. Paths are relative to the ML snapshot `rg-main/` unless absolute; "anim main" is the animation worktree `/Users/I745505/private/thesis/animation/.claude/worktrees/fiber-bundles-em-video-0ada80`, "anim PR #3" is the scratchpad checkout `build-pr3/` (branch `playable-video-prototype`, draft PR #3).

Labels: **[S]** quoted from the named source; **[D]** derived here (small algebra); **[C]** checked here (recomputed numerically or read in the code). Nothing was trained or simulated for this report; the only computations are listed in §8.

**One-paragraph canon.** κ is at least six different objects in this project (Hessian ratio, whole-data covariance condition number, in-window residual stiffness, noisy-covariance condition number κ_t, local 1 ps step anisotropy, training curvature), measured on two different ALDP5 data sets, and its values (1.55 … 1.5×10⁵) are only comparable within one definition. "Readable window" has four estimators (first-order resolution noise, plug-in R² of the network's rebuilt distances, best-estimator readability envelope, first-order loudness) whose values for the same feature differ by up to a factor of ~2.5 in t; all are lower bounds or first-order screens of note 26's retained fraction. The αL basin is visited 37 times per 250 ns trajectory, but the effective sample size of its indicator is 96–139, and note 25's "Cramér–Rao" relative error (0.79–1.27) is not a valid bound (a Markov model gives ≈0.23, the autocorrelation- and bootstrap-based estimates ≈0.4–0.7). The VP noise σ(0.01) = 0.0446 is dimensionless; it is 0.0446 Å in the manifold-route flat model (note 21's "0.045 Å" is right for it), 0.042 Å in the Sprint 11 pilots' "production floor", and 0.279 Å per coordinate in Sprint 12 BBA Cartesian units. Every BBA model number belongs to one of four budgets on one 1,903,500-update cosine schedule (50,000 = 2.6%, 190,350 = 10%, 380,700 = 20%, 1,903,500 = 100%), and the full-schedule numbers exist only in open PR #1104. Two force read-out conventions coexist (driver $J^\top\alpha s(\alpha\phi(x))$, note 29 $J^\top s(\phi(x))$); they differ by a factor $\alpha_t^2$ in prior-matched directions, which is small next to the volume-term bug that caused three quarters of the loud-mode force-field compaction.

---

## 1. Narrative: how the recurring numbers were introduced, reused and corrected

**Before Sprint 11 (wδ era, archive).** The first "condition number" of the project was that of the wδ metric itself: a claimed cond(H) ≈ 2.4×10⁶ that "spans the exact 6-dimensional vertical kernel"; horizontally it was median ≈88, p99 ≈2.5×10³ on BBA (docs/APPROXIMATIONS.md, "No numerical blocker"). That κ is a property of a metric, not of the data, and does not recur later.

**2026-10-23, note 20 (thermal metric foundations).** The data-side κ enters: on 200,000 training frames of `data/processed/aldp5_train.npy` (the bgmol implicit-solvent ALDP5 set), bonds have thermal widths 0.025–0.030 Å and βk = 1,100–1,660 Å⁻², torsional displacement ≈0.2 Å in one basin and ≈0.7 Å across all data, and "the aligned covariance of the whole data set has condition number about 920" (§1.4). §0 summarises: stiff/soft variance ratio 100–200 inside a basin, about 900 across the data. §5.3 defines *residual stiffness* in ±45° torsional windows and tabulates flat 192/112/97 (β/C7eq, αR, αL) against 9.6/7.6/13.4 for the spring-force metric (γ = 30), in-sample.

**2026-10-24 (revised 10-28, 11-14), note 21 (target, loss, noise).** Two number sources are introduced side by side: an *idealized nine-mode spectrum* built from note 20's constants (κ = 415) and *window statistics* (all 254,328 β/C7eq-window frames of the 800,000, own frame). Proposition 2 gives κ_t = cond(S_t) = 356 / 97 / 1.25 (idealized) and 146 / 27 / 1.1 (window) at σ_t² = 10⁻⁴ / 0.002 / 0.5 Å². §5.2 states that "with the trusted schedule … σ = 0.045 Å at t = 0.01", so no trained level resolves a bond (SNR 0.30–0.46).

**2026-10-24 → 10-27, Sprint 11 ALDP5 pilots on mdshare.** The learned stiffness-removing warp (#753, fits 2026-10-24) introduces a third κ: the median condition number of the covariance of 512 nearest real 1 ps steps, on the mdshare *explicit-solvent* trajectories: 184 for flat Cartesian, 2.99 for the learned coordinates, estimation floor 1.55 (docs/design/learned-stiffness-warp.md, Results). The document explicitly warns that this "is not the residual stiffness of note 20 §5.3 … not directly comparable". The flat-vs-learned pilot (#754, 2026-10-25) defines the "production floor" σ_min = 0.042 Å by dividing coordinates by the bgmol input scale 0.9418 Å, and asserts that note 21's 0.045 is "σ_t in normalized units". The feature-space evaluation (#765, 2026-10-26) and the joint-distribution metrics (#779, 2026-10-27) reuse 0.042 Å; #779 measures the φ > 0 indicator's integrated autocorrelation time (900–1,300 ps), hence "96–139 independent samples" per 250 ns trajectory and block-bootstrap 95% intervals (3.2%: 0.4–7.0%; 1.6%: 0.0–4.6%; 4.1%: 1.1–7.9%).

**2026-10-24, animation repo Part 1** (commit fa796ff, on main). An illustrative two-mode toy fixes κ = 20/0.05 = 400 (eV/Å²), σ ratio 20 (`src/model/physics.js`). The same repo's all-pairs spring network (`src/model/energy.js`, bond 20, other 0.4 eV/Å²) has an internal Hessian κ ≈ 2,050 [C], a second, unadvertised toy κ.

**2026-11-04/05, notes 25 and 26.** Note 25 (information geometry; PR #925, closed, content on main via commit b385758c) measures the mdshare time scales and counts αL visits with a hysteresis rule: 37 per trajectory, populations 3.24 / 1.65 / 4.11%, and a "Cramér–Rao relative sd" of 0.90 / 1.27 / 0.79 from $\sqrt{(1-w)/(w\,n_{\rm visits})}$ (§6.1). The status page repeats "37 independent αL visits … no model can fix that basin's weight … to better than a factor of order one". Note 26 (PR #926, merged 2026-11-05) defines the retained Fisher information $I_t=\mathrm{Cov}(\mathbb E[u\mid Y_t])$ and its normalized fractions; it contains no measurements.

**2026-11-04 → 11-18, the feature-space driver.** Starting from the PR892 pilot, the maintained driver reads forces as $J_F^\top\alpha(t)\,s_\theta(\alpha(t)F(x),t)+\nabla\log\sqrt{\det J_F^\top J_F}$ (docs/design/feature-space-driver.md; `samplers/feature_space.py::physical_force`). Note 29 (from draft PR #949, consolidated 2026-11-14) writes the read-out as $D\varphi^\top s_{t_*}(\varphi(x))+\tfrac12\nabla\log\det G$, without the α.

**2026-11-08/09, Sprint 12 protocol and first chunks.** Budgets are fixed from ScoreMD's recipes: BBA horizon 1,903,500 updates, first stop 190,350; ALDP5 480,000 and 48,000 (docs/sprints/sprint12/protocol.md). ALDP5 is the bgmol-derived 50,000-row membership; BBA is the authentic DESRES 28-Cα set (1,300,156 training frames).

**2026-11-11 → 11-14, #1025 and #1026 (BBA, 50,000-update pilots).** #1025 defines the *resolution noise* σ*(q) = sd(q)/c_q and reports σ*/σ(t_min); #1026 defines *readable windows* as R² ≥ 0.5 of the pair distances the network rebuilds from noisy features, and defines C3. All trained comparisons stop at 50,000 updates of the 1,903,500 schedule.

**2026-11-12 → 11-14, #1055 and note 27 (#1064).** The best-estimator readability envelope gives `t_half` per observable for Cartesian / C3 / C1; a stronger read-out raises C3's radius-of-gyration window from 0.23 to 0.27–0.28 (note 27 §4), but §3 still compares the linearised 0.30 with "0.23 measured". #1057 and #1069 add loud collective modes (50,000 updates).

**2026-11-13 → 11-16, the registered budget.** #1071 and the Sprint 12 study (#1088, results 2026-11-15) run everything at 190,350 updates (100,000 molecules per model, 100 ps force panels); #1091 continues four internal models to 380,700 updates. The study reads the loud-mode force fields with the invariant-map volume term.

**2026-11-16 → 11-18, corrections and extensions.** A lab entry (#1100, 2026-11-16) finds that the loud-mode map was read out with the wrong volume formula: three quarters of its compaction disappears with the immersion volume (100 ps size error 0.98 → 0.24 Å); #1111 (2026-11-17) fixes the driver. A lab entry on EigenFold/Chroma noising (2026-11-16) recalibrates Cartesian windows and counts 153 long-range pairs (note 27 says 136). Note 30 and the 2026-11-18 lab entry give first-order windows (C3 Rg 0.19). Open PR #1104 (2026-11-18) reports the first full-schedule results: ordered internal coordinates (internal + 2 loud modes) Rg W1 0.111 Å at 1,903,500 updates, C3 0.455 Å.

**2026-11-16, animation PR #3 (retention video).** Visualises note 26's $I_t$ on an exact grid toy; its harmonic side model reuses κ = 400 "as in Part 1" with widths 0.05 Å and 1 Å.

**2026-11-19 (this report).** The critic's two-state Markov check (`critic/cr_check.py`) shows that note 25's formula overstates the αL uncertainty about fourfold relative to a memoryless model; code reading shows that note 21's 0.045 Å is correct for the manifold-route flat model and that the "production floor" is the pilots' own convention.

---

## 2. Core mathematics: the defining formulas

### 2.1 Schedule and physical noise

VP schedule (note 21 §2.3; note 27 §3; `forward/vp_schedule.py`): $\beta(t)=0.1+19.9\,t$, $B(t)=\int_0^t\beta=0.1\,t+9.95\,t^2$, $\alpha_t=e^{-B(t)/2}$, $\sigma_t^2=1-\alpha_t^2$, $x_t=\alpha_t x_0+\sigma_t\varepsilon$. $\sigma_t$ is **dimensionless**; its physical size is $\sigma_t$ times the unit of the coordinates being noised:
- manifold route (for example the flat VP recipe `configs/recipes/flat_vp_gt_s0_fixtarget_online.yaml`, whose t ∈ [0.01, 0.99], likelihood weighting and input scale 0.9418 match note 21's "trusted recipe"): coordinates in Å; `input_scale` = 0.9418 divides only the network input (docs/DATA_STATE.md "input_scale … geometry-neutral"); the wrapped-Gaussian amplitude is $\sigma_{\rm eff}=R_{\rm scale}\,\sigma_t/\sqrt k$ with $R_{\rm scale}=\sqrt{15}$ and $k=15$ for the flat five-bead cloud, so $\sigma_{\rm eff}=\sigma_t$ Å per coordinate [C: `forward/wrapped_gaussian.py`, `geometry/euclidean.py`];
- Sprint 11 pilots, "production floor": coordinates divided by 0.9418 Å before noising (learned-stiffness-diffusion-pilot §"Units matter");
- pilots, "own scale": divided by the spread about the mean shape, 0.267 Å;
- Sprint 12 feature route, Cartesian map: divided by the scalar std of the selected training coordinates (protocol.md), 6.252 Å for BBA (note 27 §3);
- internal, spring, whitened maps: dimensionless channels.

A distance between two noised atoms receives variance $2\sigma^2$ to first order (note 21 §2.5), so a bond length sees $\sqrt2\,\sigma$.

Half erasure of a linear mode with data variance λ in noise units (note 27 §3, exact for Gaussians): $r(t)=\frac{\alpha_t^2\lambda}{\alpha_t^2\lambda+\sigma_t^2}$, half erased at $\alpha_t^2\lambda=\sigma_t^2$, i.e. $t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\log(1+\lambda)}}{19.9}$, $t_{1/2}(1)=0.259$. Log-SNR $\log(\alpha_t^2/\sigma_t^2)$ is the schedule-free axis (note 27 §2).

### 2.2 Six meanings of κ

1. **Stiffness ratio of a Hessian**, $\kappa(K)=\lambda_{\max}/\lambda_{\min}$ over internal modes (Part 1 scene 09; `physics.js::conditionNumber`). With $K\approx k_BT\,\Sigma^{-1}$ (harmonic) it equals the ratio of thermal variances.
2. **Condition number of an equilibrium covariance**: of the whole aligned data set (note 20 §1.4, ≈920), or of the $27$ BBA Cartesian principal modes as a variance ratio (note 27 §3, 1,423).
3. **Residual stiffness** of a metric $G$ in a window: $\kappa=\mathrm{cond}(G^{1/2}\Sigma G^{1/2})$ on the 9 internal directions, $\Sigma$ the thermal covariance in a ±45° torsional window, $G$ at the window's mean structure; κ = 1 is ideal; for flat $G=I$ it is $\mathrm{cond}(\Sigma)$ (note 20 §5.3). It equals the eigenvalue spread of the Riemannian target's Jacobian at low noise.
4. **Noisy-data condition number**, $\kappa_t=\mathrm{cond}(S_t)$, $S_t=\alpha_t^2\Sigma+\sigma_t^2N^{-1}$ (note 21 §3, Lemma 1 and Proposition 2; flat $N=I$). In a metric's units: $\rho(t)=\mathrm{cond}(G^{1/2}S_tG^{1/2})$ for fixed $G$, $\mathrm{cond}(G_t^{1/2}S_tG_t^{1/2})$ for the noise-level metric $G_t=(\alpha_t^2G^{-1}+\sigma_t^2N^{-1})^{-1}$; Theorem 3 bounds the latter by $\max(c_{\max},1)/\min(c_{\min},1)$ when $c_{\min}G^{-1}\preceq\Sigma\preceq c_{\max}G^{-1}$.
5. **Local step anisotropy**: for each of 2,000 held-out anchors, the condition number of the covariance of the 512 nearest actual 1 ps steps mapped into the coordinates under test; the median is reported; isotropic steps give the estimation floor 1.55 in 9-D (learned-stiffness-warp.md, Evaluation).
6. **Training curvature** of a linear layer: $\mathrm{cond}(C)\,\mathrm{cond}(M)$, input covariance times loss metric (note 21 Theorem 1); $\kappa^2$ for the Riemannian and covector pairings, 1 for the whitened pairing (Theorem 2).

Related but not a κ: the BBA *placement law* ratio $R_k$ = population-to-thermal width of mode k, $\langle R^2\rangle$ = 2.8 (ALDP5) vs 10.6 (BBA) (bba-local-geometry-preconditioning.md §2). The symbol κ is also used for the torsion phase radius (κ = 1.504 in C3/loud-mode features) and the arrow length of the skeleton map (κ = 1.5) (bba-range-and-order.md §6 and "Implications"; note 30 §1): a notational collision a video must avoid.

### 2.3 The readability family

- **Retained Fisher information** (note 26, Prop. 1): $u=h(X)-\mathbb E h$, $m_t(y)=\mathbb E[u\mid Y_t=y]$, $I_t=\mathbb E[m_tm_t^\top]$, $I_{\rm clean}=\mathbb E[uu^\top]$, $I_{\rm clean}-I_t=\mathbb E[\mathrm{Cov}(u\mid Y_t)]\succeq0$; normalized $R_t=I_{\rm clean}^{-1/2}I_tI_{\rm clean}^{-1/2}$ with eigenvalues in [0,1]. It is Fisher information about tilts $dP_\theta/dP\propto e^{\theta^\top u}$, not mutual information. Non-increasing in $t$ (Prop. 2). Harmonic case: $r_j=\alpha_t^2\lambda_j/(\alpha_t^2\lambda_j+\sigma_t^2)$; width probe retains $r^2$; product probe $r_ir_j$; basin indicator $R_B=\mathrm{Var}(q_t)/(w(1-w))$.
- **Readability of one observable** (note 27 §1): $R_h(t)=\mathrm{Var}(\mathbb E[h\mid Y_t])/\mathrm{Var}(h)$, the single-probe case of $R_t$. Any predictor $f$ gives $R^2_f\le R_h$. $t_{1/2}(h)=\sup\{t:R_h\ge\tfrac12\}$; readable window $[t_{\min},t_{1/2}]$; decision window between $R_h=0.8$ and $0.2$. $R_h=\tfrac12$ guarantees at least $\tfrac12\log2\approx0.35$ nats.
- **Best-estimator envelope** (note 27 §4): per level, the best held-out $R^2$ over ≈15 estimators (exact empirical posterior mean over all 1,300,156 training frames with ±1 µs exclusion, projected posteriors, plug-in decodes, ridge and quadratic read-outs, a small neural read-out), then the running maximum over higher noise. A lower bound on $R_h$.
- **Resolution noise** (#1025; bba-local-geometry-preconditioning.md §1): $c_q=\sqrt{\nabla q^\top G^+\nabla q}$, $G=J^\top J$; $\sigma^*(q)=\mathrm{sd}(q)/c_q$ with sd the *thermal* spread (from 1 ps trajectory steps) or the population spread; reported as $\sigma^*/\sigma(t_{\min})$ (≤ 1: never resolved in training). First order, training-free.
- **First-order loudness** (note 30 §1; range-and-order §4): $\ell_h=\mathrm{Var}(h)/\mathbb E[\nabla h^\top G^+\nabla h]$; $h$ half erased when $\sigma_t^2/\alpha_t^2$ reaches $\ell_h$ (linear-Gaussian rule; a screen, not a measurement). With population sd, $\sigma^{*2}\approx\ell_h$ [D].
- **Network-input window** (#1026 Table 0.1): R² ≥ 0.5 of the pair distances rebuilt from noisy features by the network's own distance-input construction against the clean distances, on 500 held-out molecules. It measures what the attention edges can see, not the information in the noisy state.
- **Degree attenuation** (note 30 Prop. 1): for independent uniform torsions noised through phase pairs, a multilinear observable $h=\sum_jh_j$ has $R_h=\sum_jc_jr^j/\sum_jc_j$, $c_j=\mathrm{Var}(h_j)$; chain geometry over $m$ bonds behaves like degree ≈ $\tfrac23(m-1)$ ("anti-order").

Gaussian dictionary: the same number $r_k=\mathrm{SNR}_k/(1+\mathrm{SNR}_k)$ is note 20's "signal fraction" (§4.6), note 25's eigenvalue of the whitened posterior covariance $\Lambda_t$ (Prop. 3, flat noise $\alpha_t^2/(\alpha_t^2+\sigma_t^2\lambda_k)$ with stiffness λ), note 26's harmonic retained fraction and note 27's $R_h$ of a linear probe; the mode's mutual information is $-\tfrac12\log(1-r_k)$ nats.

### 2.4 Basin-weight uncertainty

- Note 25 §6.1 [S]: "a Bernoulli reading per visit" gives $\mathrm{Var}(\hat w)\ge w(1-w)/n_{\rm visits}$, relative sd $\ge\sqrt{(1-w)/(w\,n_{\rm visits})}$, "and dwell-time variability only loosens it".
- Two-state Markov (telegraph) model [D]: rates $k_{\rm out}=1/\bar t_{\rm dwell}$, $k_{\rm in}=k_{\rm out}w/(1-w)$, indicator correlation time $\tau_c=1/(k_{\rm in}+k_{\rm out})=(1-w)\bar t_{\rm dwell}$; for $T\gg\tau_c$, $\mathrm{Var}(\hat w)\approx2w(1-w)\tau_c/T$; with $n=wT/\bar t_{\rm dwell}$ visits this is $2w^2(1-w)^2/n$, relative sd $(1-w)\sqrt{2/n}$. The note's formula is larger by $1/\sqrt{2w(1-w)}\approx4$ for $w\approx3\%$, so it is not a lower bound.
- Effective sample size (#779; joint-distribution-metrics.md, "MD uncertainty"): $N_{\rm eff}=N/(2\tau_{\rm int})$ with $\tau_{\rm int}$ the integrated autocorrelation time of the indicator; $\mathrm{sd}(\hat w)\approx\sqrt{w(1-w)/N_{\rm eff}}$ [D]; plus block bootstrap (10 ns blocks, 500 draws).

### 2.5 Force read-out conventions

- ScoreMD and note 20 §8: $\hat F=k_BT\,s_{t_{\min}}$; the force does not depend on the metric, $F=k_BT\nabla\log p_0=k_BT\,Gv$; pullback: $F_x=D\Phi^\top F_y+k_BT\nabla\log|\det D\Phi|$ (omitting the Jacobian term shortens ALDP5 bonds by 0.30–0.36 thermal widths).
- Note 29 §3: $\hat F(x)=k_BT\big[D\varphi(x)^\top s_{t_*}(\varphi(x))+\tfrac12\nabla_x\log\det G(x)\big]$, evaluated on the image $S=\varphi(X)$; the normal part of $s_t$ (order $\sigma_t^{-2}$) is discarded by $D\varphi^\top$. For rotation-invariant maps (§4): $\nabla\log p_0=D\varphi^\top\nabla^S\log q+\tfrac12\nabla\log\det G_Q+\nabla\log\rho$ with the orbit factor ρ.
- Driver (feature-space-driver.md "Generation, forces and evidence"; `physical_force`): $f_t(x)=J_F(x)^\top\alpha(t)\,s_\theta(\alpha(t)F(x),t)+\nabla_x\log\sqrt{\det(J_F^\top J_F)}$ in units of $k_BT$/Å (no $k_BT$ factor; Brownian update $x+hf+\sqrt{2h}\,\xi$), "a finite-noise surrogate, not a proven clean equilibrium force". This is the exact gradient of $x\mapsto\log q_t(\alpha_tF(x))$, i.e. the pull-back of the variance-exploding form $F(x_0)+(\sigma_t/\alpha_t)\varepsilon$ [D]. Note 29's form is the gradient of $x\mapsto\log q_t(F(x))$, the equal-dimension pullback-OU marginal of note 20 Prop. 3 [D]. They agree as $t\to0$.
- Volume term (`geometry/immersion_volume.py`, since #1111, 2026-11-17): maps with at least two non-parallel rotating channels immerse all $3N-3$ centred coordinates and use $\tfrac12\log\det(J_c^\top J_c)$; rotation-invariant maps use the quotient formula with $\sqrt{\det(\text{inertia})}$. "The two formulas are not interchangeable"; on the loud-mode map the invariant formula adds about $-\tfrac12\log\det(\text{inertia})$, a spurious inward force of ≈0.6 $k_BT$/Å on Rg (lab/2026-11-16-bba-force-field-diagnosis).

---

## 3. Worked analytical examples (exactly computable)

**3.1 Part 1's two-mode toy** (anim main `src/model/physics.js`, scenes 05–14) [S/C]. $k_BT=0.0259$ eV; $k_{\rm soft}=0.05$, $k_{\rm stiff}=20$ eV/Å²; $\sigma=\sqrt{k_BT/k}$: 0.7197 Å and 0.03599 Å; κ = 400; width ratio 20. Energy plots mark the $E=k_BT$ crossing $\sqrt{2k_BT/k}$: 1.018 Å and 0.0509 Å ("±1.02 Å per kT", "±0.05 Å per kT") — a different width from σ by √2 (a1 report notes the same). Scene 10: at σ_t = 0.1 Å the stiff direction is at 278% of its spread, the soft at 14% (0.1/0.036, 0.1/0.72). Scene 13: a 5% error costs 400× more on the stiff component under the Euclidean loss.

**3.2 The repository's own spring network** (anim main `src/model/energy.js` on the five-atom molecule of `src/model/molecule.js`) [C]. All pairs connected; bonds (0–1, 1–2, 1–3, 2–4) at 20 eV/Å², other pairs 0.4 eV/Å², at rest. Hessian $\sum_{ij}k_{ij}(\hat r\hat r^\top)$ blocks: 6 zero eigenvalues and 9 internal ones, 0.0264, 0.0414, 0.4847, 0.7673, 1.0269, 20.48, 38.18, 49.79, 53.99 eV/Å²; κ_internal = 2,048 ≈ 2,050. Any scene that derives a spectrum from `springNetwork` gets κ ≈ 2,050, not Part 1's 400.

**3.3 The noise ruler** [C] (σ normalized; ×0.9418 Å = pilot production scale; ×0.267 Å = pilot own scale; ×6.252 Å = Sprint 12 BBA Cartesian; the manifold route uses ×1 Å):

| t | α | σ | σ/α | log-SNR | ×0.9418 Å | ×0.267 Å | ×6.252 Å |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10⁻⁵ | 0.999999 | 0.00100 | 0.00100 | 13.82 | 0.00094 | 0.00027 | 0.0063 |
| 1.8·10⁻⁴ | 0.999991 | 0.00428 | 0.00428 | 10.91 | 0.0040 | 0.0011 | 0.027 |
| 4·10⁻⁴ | 0.999979 | 0.00645 | 0.00645 | 10.09 | 0.0061 | 0.0017 | 0.040 |
| 0.001 | 0.999945 | 0.01049 | 0.01049 | 9.12 | 0.0099 | 0.0028 | 0.066 |
| 0.01 | 0.999003 | 0.04464 | 0.04469 | 6.22 | 0.0420 | 0.0119 | 0.279 |
| 0.02 | 0.997014 | 0.07721 | 0.07745 | 5.12 | 0.0727 | 0.0206 | 0.483 |
| 0.05 | 0.985174 | 0.17156 | 0.17414 | 3.50 | 0.162 | 0.046 | 1.07 |
| 0.1 | 0.946722 | 0.32205 | 0.34018 | 2.16 | 0.303 | 0.086 | 2.01 |
| 0.259 | 0.707033 | 0.70718 | 1.0002 | 0.00 | 0.666 | 0.189 | 4.42 |
| 0.5 | 0.281183 | 0.95965 | 3.413 | −2.46 | 0.904 | 0.256 | 6.00 |
| 1 | 0.006572 | 0.99998 | 152.2 | −10.05 | 0.942 | 0.267 | 6.25 |

Checks against sources: σ(0.01)×0.9418 = 0.042 Å (feature-space-evaluation §2); σ(10⁻⁵)×0.267 = 0.00027 Å (same); σ/α at 0.05 = 0.174 "feature units: 0.16 Å per coordinate for ALDP5 Cartesian, 1.09 Å for BBA Cartesian" (bba-local-geometry §6); α_1 = 0.0066 (note 21 §2.3). A bond length at t = 0.01 sees √2σ: 0.063 Å (manifold route) or 0.060 Å (pilot), against bond widths 0.025–0.031 Å.

**3.4 Closed-form windows for BBA Cartesian modes** (note 27 §3) [S/C]. Variances 15.5, 6.2, 3.0, 1.3 (units of 6.252 Å, 93% of mean squared Rg) → $t_{1/2}$ = 0.526, 0.440, 0.368, 0.284–0.29; smallest 0.011 → 0.0285; ratio 1,423. Rescaling by $\lambda_k^{-\gamma/2}$: γ = 0/0.25/0.5/0.75/1 gives largest/smallest 1,423/232/38/6.1/1, first window 0.53/0.50/0.45/0.37/0.26, last 0.028/0.065/0.13/0.20/0.26. Any unit-variance whitened channel (C3's bonds, angles) has $t_{1/2}=0.259$ by construction, which is why bonds read 0.26 in C3 and C1.

**3.5 Idealized spectrum vs window statistics** (note 21 §3, Prop. 2; Theorem 3 table) [S/D]. Idealized: four bonds 1,110–1,659 Å⁻², three one–three distances 300–460, a torsion 25, the softest direction 4 (width 0.5 Å); κ = 415 (note 20 uses 1,650, κ = 412). $\kappa_t=(\alpha_t^2/4+\sigma_t^2)/(\alpha_t^2/1659+\sigma_t^2)$: 355.8 at σ² = 10⁻⁴, 96.9 at 0.002, 1.249 at 0.5 Å² [C]. Window: zero-noise 191; κ_t 146 / 27.4 / 6.9 / 1.6 / 1.1 at σ² = 10⁻⁴ / 0.002 / 0.01 / 0.1 / 0.5. Solving the two-parameter model $(\alpha^2\lambda_{\max}+\sigma^2)/(\alpha^2\lambda_{\min}+\sigma^2)$ with $\lambda_{\max}=191\lambda_{\min}$ against 146 gives $\lambda_{\min}=3.22\times10^{-4}$ Å² (sd 0.018 Å) and $\lambda_{\max}=0.0616$ Å² (sd 0.248 Å), which reproduces the other four printed window values (printed 27.4, 6.9, 1.6, 1.1; computed 27.4, 6.87, 1.55, 1.06) [D]. So the window's stiffest Cartesian mode has variance ≈ Var(d)/2 for a 0.025 Å bond (two atoms share the stretch), while the idealized spectrum uses Var(q) of the internal coordinate itself; and its softest variance is 4× smaller than the idealized 0.25 Å². In noise level: √κ = 20 (idealized, Part 1's "×20"), √191 = 14 (β window), √97 = 10 (αL window), √920 = 30 (whole data).

**3.6 Bond SNR at the floor, two unit conventions** (note 21 §5.2 table) [S/D]. Note 21 uses $\mathrm{SNR}_k=\alpha_t^2/(\sigma_t^2\lambda_k)$ with σ in Å (manifold route, σ² = 0.001993 Å² at t = 0.01): bonds 0.30–0.46 (reproduced with λ = 1,659 and 1,087, the 50,000-frame constant; λ = 1,110 gives 0.45), one–three 1.1–1.7, softest 20–125, metric noise 501 [C]. At the pilot scale (σ² = 0.001768 Å²) bonds would be 0.34–0.52. Using the window's stiffest-mode variance 3.22×10⁻⁴ Å² gives 0.16 (manifold) / 0.18 (pilot) [D]. Every convention gives SNR < 1: the conclusion "no trained level resolves a bond" holds. Corresponding retained fractions $r=\mathrm{SNR}/(1+\mathrm{SNR})$: 0.23–0.32 for means and $r^2$ = 0.05–0.10 for widths (note 25 §6.2, which inherits note 21's SNR).

**3.7 Tweedie shrinkage of bonds at the production floor** (feature-space-evaluation §4) [S/C]. The final denoising step shrinks a Gaussian coordinate of width w under leftover noise s to $w/\sqrt{w^2+s^2}$ of its spread. s = 0.0594 Å (0.042 Å × √2), w = 0.025–0.031 Å: 0.388–0.463, observed 0.44–0.53 at 200,000 steps (mdshare). With the manifold-route s = 0.0631 Å: 0.368–0.441 [D].

**3.8 The lag dictionary** (note 25 §2, Prop. 2) [S/C]. $G_\tau$ has eigenvalues $\lambda_k/(1-e^{-\tau/t_k})$, $t_k=1/(D_0\lambda_k)$. λ = (1600, 400, 25, 4) Å⁻², $D_0$ = 0.08 Å²/ps: $t_k$ = (0.008, 0.03, 0.5, 3.1) ps; at τ = 1 ps half erasure under lag-shaped noise at $\sigma^2/\alpha^2=1/(1-e^{-2\tau/t_k})$ = (1, 1, 1.02, 2.12), spread 2.1 against 400 under flat noise. Measured on mdshare (note 25 §3), the 1 ps step covers variance fractions: bonds 0.91–1.03, angles 0.89–0.98, φ 0.24 global / 0.43 for starts with φ < 0, ψ 0.052 global / 0.14 (αR) / 0.11 (β); hence "ψ about 19× and φ about 2.3× stiffer". As *width* fractions these are √0.43 = 0.66 and √0.052 = 0.23 [D].

**3.9 The 63% on screen in anim PR #3** [C]. Retention scene 02 computes `ou.increment(c,1)/ou.variance(c)` = $1-e^{-k\tau}$ (a variance ratio) and labels it "% of its equilibrium width": bond (k = 400/ps) 100%, torsion (k = 1/ps) 63%. The width ratio is $\sqrt{1-e^{-1}}=0.795$, i.e. 79% [D].

**3.10 αL: three uncertainty estimates for one trajectory** [S/C/D]. Inputs from note 25 §6.1 (w, visits, dwell): (3.24%, 37, 219 ps), (1.65%, 37, 111 ps), (4.11%, 37, 278 ps); T = 250,000 ps.

| Trajectory | note 25 "bound" $\sqrt{(1-w)/(wn)}$ | Markov $(1-w)\sqrt{2/n}$ | Markov simulation (cr_check.py, 4,000 reps) | $N_{\rm eff}$ = 96–139 (#779) | block bootstrap 95% CI → rel. sd (#779) |
|---|---:|---:|---:|---:|---:|
| 0 | 0.90 | 0.225 | 0.227 | 0.56–0.46 | 0.4–7.0% around 3.2% → 0.53 |
| 1 | 1.27 | 0.229 | 0.229 | 0.79–0.65 | 0.0–4.6% around 1.6% → 0.73 |
| 2 | 0.79 | 0.223 | 0.223 | 0.49–0.41 | 1.1–7.9% around 4.1% → 0.42 |

Between-trajectory relative sd of (3.24, 1.65, 4.11)% is 0.42 (n − 1) [C]. The Markov correlation time $(1-w)\bar t_{\rm dwell}$ = 212 / 109 / 267 ps, against the measured $\tau_{\rm int}$ = 900–1,300 ps: visits are clustered, and the dwell means differ 2.5× between trajectories at identical visit counts (a memoryless model predicts about ±16% per trajectory, $1/\sqrt{37}$) [D]. Identity check: $n\approx wT/\bar t_{\rm dwell}$ = 37.0, 37.2, 37.0 [C].

**3.11 Force read-out conventions on a Gaussian feature** [D/C]. One feature with clean variance v, VP noise, $q_t=\mathcal N(0,\alpha_t^2v+\sigma_t^2)$; true force $-x/v$. Ratio of read-out to true force: note 29 $v/(\alpha_t^2v+\sigma_t^2)$; driver $\alpha_t^2v/(\alpha_t^2v+\sigma_t^2)$.

| t | v = 0.01 | v = 0.1 | v = 1 (prior-matched channel) | v = 6.2 | v = 15 (loud mode 1) |
|---:|---|---|---|---|---|
| 0.01 | 0.835 / 0.834 | 0.982 / 0.980 | 1.000 / 0.998 | 1.002 / 1.000 | 1.002 / 1.000 |
| 0.02 | 0.629 / 0.625 | 0.949 / 0.943 | 1.000 / 0.994 | 1.005 / 0.999 | 1.006 / 1.000 |
| 0.05 | 0.256 / 0.248 | 0.791 / 0.767 | 1.000 / 0.971 | 1.025 / 0.995 | 1.028 / 0.998 |
| 0.1 | 0.089 / 0.080 | 0.517 / 0.464 | 1.000 / 0.896 | 1.095 / 0.982 | 1.107 / 0.992 |

(note 29 / driver). Note 29's form is exact on prior-matched (unit-variance) channels because the VP law preserves $\mathcal N(0,1)$; the driver's form is exact for loud directions; both are dominated by the blur bias in stiff directions. Variances 15 and 6.2 are the loud-mode mean squares quoted in the lab entries (15.0/6.0 in note 30 §5; 15.6 and 6.2 in lab/2026-11-16-readable-windows-noise-precedents).

**3.12 The retention toy's half-erasure points** (anim PR #3 `src/videos/retention/toy.js`) [C]. Bond r (Å) with mean 0.015 sin φ and sd 0.05(1 + 0.2 cos φ); torsion φ on the circle, basins at −1.0 rad (65%) and 1.9 rad (35%), sd 0.35 rad; 80 × 56 grid; noise added as σ × scale per coordinate (no α shrinkage, a variance-exploding channel, equivalent to VP with σ_t/α_t = σ; the torsion kernel is wrapped). Retained fraction per observable = $I_t[k][k]/I_0[k][k]$ (note 26's single-probe $R$). Channel scales: flat [1, 1] (Å and rad alike), local [0.0522 Å, 0.35 rad], global [0.0539 Å, 1.427 rad]. Half-erasure multipliers (interpolated on the 29-point sweep 10^−2.5…10^1.5):

| Channel | bond | bond width | torsion within basin | basin population |
|---|---:|---:|---:|---:|
| flat | 0.056 | 0.035 | 0.335 | 1.06 |
| local thermal widths | 1.07 | 0.667 | 0.956 | 3.06 |
| global covariance | 1.01 | 0.631 | 0.236 | 0.756 |

The width-to-mean ratio ≈ 0.62–0.63 is close to the Gaussian $\sqrt{\sqrt2-1}=0.644$ predicted by $R_{\rm width}=r^2$ [D].

**3.13 Budgets on one cosine** [D, assuming the protocol's 3·10⁻⁴ → 10⁻⁵ cosine over 1,903,500 updates with no warm-up]. Learning rate at 50,000 / 190,350 / 380,700 / 790,350 / 1,903,500 updates: 99.8% / 97.6% / 90.8% / 64.4% / 3.3% of the peak (the longer-training doc states "90% of its peak at 380,700"). Epochs at batch 1,024 over 1,300,156 frames: 39 / 150 / 300 / 622 / 1,499. ALDP5: 48,000 updates on 50,000 frames = 983 epochs; 480,000 = 9,830.

**3.14 Counting long-range pairs** [C]. For 28 beads, pairs with $|i-j|\ge11$: $\sum_{s=11}^{27}(28-s)=153$; with $|i-j|\ge12$: 136. Note 27 §4 says "the 136 distances between beads at least 11 apart"; the 2026-11-16 lab entry says 153.

---

## 4. Key empirical results: the canon tables

### 4.1 κ

| Value | Definition (§2.2) | System, data, sample | Source (date) | On-screen wording |
|---|---|---|---|---|
| 400 | Hessian ratio 20/0.05 eV/Å² | toy, illustrative | anim main Part 1, `physics.js` | "κ = 400 in this toy" |
| ≈2,050 (2,048) | internal Hessian ratio | `energy.js` all-pairs spring network | computed here | do not show unless the scene uses `springNetwork` |
| 100–200 | stiff/soft thermal variance ratio inside a torsional basin | ALDP5, bgmol, 200,000 frames | note 20 §0 (2026-10-23) | "100–200 inside a basin" |
| ≈920 ("about 900") | cond of whole-data aligned covariance | ALDP5, bgmol, 200,000 frames | note 20 §1.4, §0 | "≈900 across all data" |
| 192 / 112 / 97 | residual stiffness, flat, windows β/C7eq, αR, αL (63,770 / 61,018 / 1,065 frames) | ALDP5, bgmol, 200,000-frame subsample, global frame | note 20 §5.3 | "97–192 with no metric" |
| 9.6 / 7.6 / 13.4 | same, spring metric γ = 30 (in-sample constants) | same | note 20 §5.3 | "8–13 with the spring metric" |
| 17.5 / 11.4 / 22.3 | same, internal-coordinate pullback γ = 30 | same | note 20 §5.3 | "11–22" |
| 413/58, 315/37, 631/76; 114/76/80; 53/42/58 | same, wδ (δ = 1 / 0.1), graph Laplacian, convex chemical pullback | same | note 20 §5.3 | wδ-era comparisons |
| 191 and 8.3 | zero-noise residual stiffness, flat and spring, β/C7eq | ALDP5, bgmol, all 254,328 window frames of 800,000, own frame | note 21 §3 (2026-10-24) | do not mix with 192/9.6 in one chart |
| 356 / 97 / 1.25 | κ_t = cond(S_t), flat noise, σ² = 10⁻⁴ / 0.002 / 0.5 Å² | idealized nine-mode spectrum (κ = 415) | note 21 §3 Prop. 2 (no §3.2 exists) | model numbers, label "idealized" |
| 146 / 27 / 1.1 | the same, measured window covariance | ALDP5, bgmol window | note 21 §3 Prop. 2; Theorem 3 table (146/27.4/6.9/1.6/1.1) | "measured, one basin" |
| 6.7 → 1.0; 8.1 → 129 | ρ(t) with $G_t$; with fixed G (σ² 10⁻⁴…0.5) | same | note 21 Theorem 3; bound 8.27 from c ∈ [0.398, 3.290] | |
| 132 | κ(G) of the spring metric itself | same | note 21 §4.3 | |
| 1.9×10⁴ / 146 / 8.1 | training curvature, Riemannian-raw / covector-raw / whitened-thermal (GD 24,319 or 28,130 / 589 or 606 / 31 or 32 steps from zero or random start) | same | note 21 §4.3 table; note 20 §4.5 | state the start |
| 1.5×10⁵ / 356 / 1.2 | same, idealized | idealized | note 20 §4.5 | |
| 184 → 2.99 | median local 1 ps step anisotropy, flat Cartesian → learned warp (seeds 0/1: 184/185 → 2.99/3.04); floor 1.55; constant whitening 24.6; scaled internal 3.88–3.95 | ALDP5, mdshare explicit solvent, held-out trajectory 1, 2,000 anchors | learned-stiffness-warp.md (fits 2026-10-24; #753) | "not the same κ as 192 → 9.6" |
| 184 / 354 / 762 | flat slice step anisotropy at 1 / 10 / 100 ps lags (learned 2.99 / 3.59 / 3.75) | mdshare | learned-warp-lag-sweep.md | |
| 1,780 → 3.62 | same, ALDP10 (floor 2.24) | mdshare | learned-stiffness-warp.md | |
| 1,423 | variance ratio of the 27 BBA Cartesian principal modes | BBA DESRES, units 6.252 Å | note 27 §3 | "BBA spans 1,423 in variance" |

### 4.2 Readable windows (BBA unless stated)

| Estimator | What it answers | Bonds | Angles | Torsions | Rg | Long-range | Source |
|---|---|---|---|---|---|---|---|
| σ*/σ(t_min), thermal, first order (≤ 1 never resolved) | can a thermal-scale change be resolved at the floor | Cart 6.4 · Int 22 · Springs 0.84 · Whitening 7.7 · wδ 1.25 | 32 · 9.2 · 1.2 · 39 · 4.1 | 68 · 9.0 · 2.1 · 85 · 7.2 | 351 · 3.0 · 11 · 38 · 52 | TIC 47 · 5.2 · 1.9 · 44 · 5.8 | #1025 (bba-local-geometry §1); σ(t_min) Cartesian 0.0010, others 0.045; ALDP5 11–31 |
| R² ≥ 0.5 of rebuilt pair distances (training share) | what the network's distance edges can see | Cart (t_min 10⁻⁵) 1.8·10⁻⁴ (0.02%); Int #985 3.4·10⁻⁴ (0%); C3 0.11 (10%); Cand 1 2.4·10⁻³ (0%)*; Cand 2 0.14 (13%) | — | — | — | ≥11 apart: 0.17 (17%); 0.038 (2.9%); 0.11 (9.7%); 0.13 (12%); 0.12 (11%) | #1026 Table 0.1 (bba-local-geometry §2) |
| best-estimator envelope `t_half` (lower bound) | information in the noisy state | Cart 0.0004 · C3 0.26 · C1 0.26 | 0.05 · 0.35 · 0.33 | 0.08 · 0.35 · 0.29 | 0.47 · **0.27–0.28** · 0.35 | pooled 0.44 · 0.24 · 0.33; contacts 0.38 · 0.23 · 0.31; end-to-end 0.45 · 0.18 · 0.31; slowest TIC 0.36 · 0.49 · 0.46 | note 27 §5 (PR #1055, 2026-11-12) |
| weaker recalibration (posterior mean + plug-ins only) | same | Cart 0.0004 | 0.022 | 0.048 | 0.47 | 0.42; contacts 0.35 | lab/2026-11-16-readable-windows-noise-precedents |
| first-order linear rule | screen | Cart 0.000 · Int 0.26 · +2 loud 0.26 | — | 0.06 · 0.33 · 0.34 | 0.38 · **0.19** · 0.44 | ≥11 apart 0.22 · 0.16 · 0.29; end-to-end 0.29 · 0.14 · 0.24 | lab/2026-11-18-range-order-mechanisms; note 30 §2 |
| note 26 $I_t$ on a toy | per-observable retained fraction, exact | see §3.12 | | | | | anim PR #3 retention video |

*Candidate 1's bonds reach the network through whitened bond channels readable to t ≈ 0.1 (#1026).

The C3 radius-of-gyration window has four printed values: 0.19 (first order, 2026-11-18), 0.23 (note 27 §3 "measured", the weaker estimator), 0.27–0.28 (note 27 §4–§5 and range-and-order Table 4, the stronger read-out), 0.30 (note 27 §3, "linearised estimate through the decoder Jacobian"). Canon: **0.27–0.28 (lower bound, best estimator)**; note 27 §3's comparison "0.30 predicted against 0.23 measured" uses the superseded estimator and should read 0.30 against 0.27–0.28.

### 4.3 αL statistics (ALDP5, mdshare explicit solvent, three 250 ns trajectories, 1 ps frames)

| Quantity | Value | Definition | Source |
|---|---|---|---|
| visits per trajectory | 37 (36–37 for every threshold 10–60°) | hysteresis: enter φ > 20°, leave φ < −20° | note 25 §6.1 (2026-11-04) |
| populations | 3.24 / 1.65 / 4.11% (traj 0/1/2) | hysteresis occupancy | note 25 §6.1 |
| | 3.2 / 1.6 / 4.1% | φ > 0 indicator (2-state MSM gives the rare state 3.24% in traj 0) | #779 (2026-10-27) |
| | 3.2% train, 1.7% held-out | φ > 0 rectangle | evaluation-metrics.md |
| mean dwell | 219 / 111 / 278 ps | hysteresis | note 25 §6.1 |
| τ_int of φ > 0 | 900–1,300 ps; TIC1 825–1,122 ps; bonds ≈ 0.5 frames | integrated autocorrelation | #779 |
| independent samples | 96–139 per trajectory ("about 100–140") | N/(2τ_int) | #779; evaluation-metrics.md |
| 95% intervals | 0.4–7.0% (traj 0), 0.0–4.6% (traj 1), 1.1–7.9% (traj 2) | block bootstrap, 10 ns blocks, 500 draws | #779 |
| "Cramér–Rao relative sd" | 0.90 / 1.27 / 0.79 | $\sqrt{(1-w)/(wn)}$, n = 37 | note 25 §6.1 — **not a valid bound** (§2.4, §3.10) |
| relative sd, two-state Markov | 0.225 / 0.229 / 0.223 | $(1-w)\sqrt{2/n}$; simulation 0.227/0.229/0.223 | critic/cr_check.py (2026-11-19) |
| relative sd, data-based | ≈0.4–0.7 | $N_{\rm eff}$ or bootstrap; between-trajectory 0.42 | derived here from #779 |
| time scales | αR↔β hop 100–200 ps (≈9,200 visits each per trajectory, dwell 6–7 ps αR, 20 ps β); αL hop 5–20 ns; MSM gap 1,419 → 69 ps at 50 ps lag | | note 25 §3; #779 |
| models | every arm at 200,000 steps: 3.17–3.33% (training traj 3.24%) | 2-state MSM | #779 |

Canon for the screen: "37 visits, about 100–140 effectively independent samples; one 250 ns trajectory pins αL only to about ±50% (95% interval 0.4–7.0% around 3.2%)." The qualitative conclusion of note 25 and the status page (references cannot rank models on αL) stands; its numbers do not.

### 4.4 Which ALDP5 data set each number comes from

**bgmol implicit solvent** (ScoreMD's `AImplicitUnconstrained`, AMBER99SB-ILDN, OBC, 300 K, 1,000,000 frames at 1 ps; shuffled 80/10/10 split → `aldp5_train.npy` 800,000 frames; benchmark membership = first 50,000 training rows; input scale 0.9418317675590515 Å; docs/DATA_STATE.md, benchmarks/aldp5.md):
- note 20 §1.4 widths/stiffness, ≈920, 100–200, §3's "1,600 → 94 Å⁻² at σ_t = 0.1 Å", §4.2 tables (idealized from §1.4), §5.3 residual stiffness, §6.3 internal-coordinate pullback, §8 linear force study (windows of the same file);
- note 21 window statistics, Theorem 3 table, §4.3 GD table, §7.2 rotating-bond table (γ = 10/30/100: ε_rot 2.7/0.90/0.27, residual 13.9/8.3/13.0), prior KL, §2.2 constants (50,000-frame variant 1,087–1,651 and 300–462);
- the ALDP5 benchmark and head-to-head (ScoreMD-native φ/ψ JS 0.0151 vs floor 0.0114), trusted flat5, the input scale 0.9418 itself;
- Sprint 12 ALDP5 (first chunks at 48,000 updates; #985; #1025 "11–31 σ(t_min)"; #1025 Round 2 springs + distances bond 0.0015 Å, angle 0.074°, φ/ψ JS 0.0082; #1033).

**mdshare explicit solvent** (three 250 ns trajectories, 250,000 frames each at 1 ps; trajectory 0 trains, 1 is the held-out reference, 2 a second reference):
- learned warp (184 → 2.99; noise spread 8.61/8.70 → 1.00/1.13; 1 ps step widths), lag sweep, soft-scale sweep, torsion Gaussianization, bead-energy campaign (ALDP5 part), force-field simulation reports;
- flat-vs-learned pilot (#754; production floor 0.042 Å, which applies the *bgmol* input scale to *mdshare* frames), feature-space evaluation (#765; "spring bonds at the floor ≈100× sooner", production-floor bonds narrowed to 0.44–0.53), joint metrics (#779), evaluation-metrics.md;
- note 25 §3 and §6.1 (time scales, saturation fractions, 37 visits, populations); the status page's "10 to 100 times sooner" and "37 independent αL visits".

Known differences between the two: bond step widths agree within ≈6–10% (force field), but the φ/ψ 1 ps step widths are 26–35% larger in implicit solvent (0.45 and 0.42 rad vs 0.36 and 0.31 rad) (learned-stiffness-warp.md, Evaluation). Equilibrium widths: bonds 0.025–0.030 Å (bgmol, note 20) vs 0.025–0.031 Å (mdshare, note 25).

### 4.5 Noise floors

| Model or route | t_min | Unit of the noised coordinate | σ at the floor | Source |
|---|---|---|---|---|
| Manifold-route flat VP (note 21's "trusted schedule"; head-to-head recipe `flat_vp_gt_s0_fixtarget_online.yaml`) | 0.01 | Å (r_scale √15, k = 15) | 0.0446 Å per coordinate (note 21: "0.045 Å") | note 21 §2.3, §5.2; DATA_STATE; checked in code |
| Sprint 11 pilots, production floor | 0.01 | Å / 0.9418 | 0.042 Å (0.060 Å on a bond length) | #754, #765, #779 |
| Sprint 11 pilots, low floor | 10⁻⁵ | Å / 0.267 | 0.00027 Å ("0.0003 Å") | #765, #754 |
| Sprint 11 pilots, own scale at t ≥ 0.01 | 0.01 | Å / 0.267 | 0.012 Å | #754 |
| Sprint 12 Cartesian, ALDP5 | 10⁻⁵ | Å / scalar std of selected frames | ≈0.00094 Å at 0.9418 | protocol.md |
| Sprint 12 Cartesian, BBA | 10⁻⁵ | Å / 6.252 | 0.0063 Å; at t = 0.01 it would be 0.279 Å | note 27 §3; computed |
| internal, springs, whitening, wδ (BBA, ALDP5) | 0.01 | dimensionless channels | 0.045 (channel units) | #1025 §1 table |

The pilot document's statement that "the repository divides centred clouds by input_scale … note 21 quotes σ = 0.045 … in normalized units" (learned-stiffness-diffusion-pilot.md, 2026-10-25) is contradicted by DATA_STATE ("the wδ metric, forward kernel and denoising target are computed at true Å scale") and by the code: `input_scale` occurs only in `fields/*` (network input) and `data/*`, never in `forward/`, `objectives/` or `geometry/` [C]. For any figure: σ(0.01) = 0.0446 (dimensionless) ≈ 0.04 Å for ALDP5 flat models, above a bond's 0.025–0.031 Å in either convention.

### 4.6 BBA budgets (all on one 1,903,500-update cosine; 1,300,156 DESRES frames; batch 1,024)

| Budget | Share | Representative numbers | Seeds, molecules | Source |
|---|---|---|---|---|
| 10,000 | 0.5% | #1025 Round 1 (e.g. prior-matched springs bond 0.0024 Å, Rg 0.877 Å); #1003/#1013 input screens | seed 0 (1,000-molecule monitors); 2 seeds, 5,000 | bba-local-geometry §3; sprint12-network-inputs |
| 50,000 | 2.6% | Main outcomes (Cartesian bond 0.760 Å, + distances 0.013 Å, C3 0.0007 Å / Rg 0.477 Å); range-and-order Tables 1–3, 5; note 27 §5 and §7; status table of 2026-11-14; γ dial 0.51 → 0.08 Å; loud 0.106/0.110 Å; covariance base bond 0.0091 Å | mostly 2 seeds (γ dial 1 seed), 20,000 | bba-local-geometry; bba-range-and-order; note 27 |
| 100,000 | 5.3% | intrinsic cylinder prototype (size error 0.67–0.71 Å, fixed and joint recipes) | 2 seeds, 5,000; different network | bba-local-geometry §5 |
| 190,350 | 10% | first chunks (Cartesian bond 0.42 Å, internal Rg 0.521 Å); #985 (Cartesian 0.42 → 0.008 Å; wδ size 0.062 Å); ScoreMD #998; Sprint 12 study: loud bond 0.00038/0.00033 Å, Rg 0.117/0.091 Å; C3 0.455/0.418; Cartesian + distances 0.071/0.077; covariance base 0.073/0.077; ScoreMD 0.157/0.532; simulation panel | 1–2 seeds (loud: seeds 2/3), 100,000; 256+256 walkers × 100 ps | real-budget-study.md (2026-11-15) |
| 380,700 | 20% | loud Rg 0.120/0.096; C3 0.468/0.432; force panels | seeds C3 0/1, loud 2/3; 100,000 | bba-internal-force-field-longer-training.md (2026-11-16) |
| 790,350 | 41.5% | native ScoreMD interim panel (values not quoted) | seed 0 | open PR #1104 |
| 1,903,500 | 100% | ordered internal (seed 2) Rg 0.111 Å, joint rebuild 0.105 Å, overlaps 11.8% → 0%; C3 (seed 0) 0.455 Å; force at t = 0.05 with immersion volume 0.118 Å | 1 seed each, 100,000 | **open PR #1104** (2026-11-18), not on main |
| Sprint 11 bead campaign | — | 200,000 updates at batch 128, width-64 network | not comparable with Sprint 12 | status.md |
| training-free | — | all readable windows, resolution tests, closed forms | — | notes 27, 30; #1025/#1026 |

The size-error trajectory of the ordered (loud-mode) model is flat across a 38× budget range: 0.106/0.110 (50,000, seeds 0/1) → 0.117/0.091 (190,350, seeds 2/3) → 0.120/0.096 (380,700) → 0.111 (1,903,500, seed 2); C3: 0.493/0.462 → 0.455/0.418 → 0.468/0.432 → 0.455. Caveats: seeds differ between 50,000 and later stops; the 20,000- and 100,000-molecule panels have different floors (population floor 0.037 at 20,000, about 0.009 at 100,000; real-budget-study "What we know going in").

### 4.7 Force read-out

| Item | Value or formula | Source |
|---|---|---|
| Score term, driver | $J_F^\top\alpha_t\,s_\theta(\alpha_tF(x),t)$ | feature-space-driver.md; `samplers/feature_space.py` |
| Score term, contract | $D\varphi^\top s_{t_*}(\varphi(x))$ | note 29 §3 |
| Difference | factor $\alpha_t^2$ on prior-matched channels (0.994 at t = 0.02, 0.971 at 0.05) | §3.11 [D] |
| Volume term, immersions (≥ 2 rotating channels; loud modes) | $\tfrac12\nabla\log\det J_c^\top J_c$ | `geometry/immersion_volume.py` (#1111, 2026-11-17) |
| Volume term, invariant maps | $\tfrac12\nabla\log\det G_Q+\nabla\log\rho$ | note 29 §4 |
| Wrong-term effect, loud seed 3, 512 paths, 100 ps, t = 0.05 | size error 0.98/0.94 → 0.24/0.30 Å (data/generated starts); predicted stationary mean Rg 9.58 vs 10.66 Å | lab/2026-11-16-bba-force-field-diagnosis (#1100) |
| Force levels used | internal family 0.02/0.01 (study), 0.05 (best read-out since 2026-11-16); Cartesian 10⁻⁴/10⁻³; ScoreMD 0.01/10⁻³; none below 10⁻⁴ | real-budget-study.md; lab entry |
| Blur at force time 0.05 | σ/α = 0.174 units: 0.16 Å (ALDP5 Cartesian), 1.09 Å (BBA Cartesian), ≈0.01 Å along a BBA bond in internal coordinates | bba-local-geometry §6 |

---

## 5. Why it was promising, why it failed, what was learned (as seen through the numbers)

**Derived facts that survive every correction.**
- *ALDP5 is stiff by two to three decades, and local metrics remove most of it.* Inside a basin the stiff/soft variance ratio is 100–200 (bgmol); the spring metric leaves 8–13 (in-sample); a learned warp leaves 2.99 against 184 on held-out mdshare 1 ps steps. Two independent definitions and data sets agree qualitatively: local stiffness removal works on ALDP5. The quantitative pair "192 → 9.6" and "184 → 2.99" must not be merged into one arrow; the warp document says so explicitly.
- *Flat noise at the 0.01 floor never resolves a bond.* σ(0.01) is 0.042–0.045 Å per coordinate and 0.060–0.063 Å on a bond length in either convention; every SNR convention gives < 1 (§3.6). The production-floor flat model's bonds narrow to 0.44–0.53 of the data's spread, close to the Tweedie prediction 0.39–0.46 (§3.7). This is the cleanest number-backed mechanism in Sprint 11.
- *Half-erasure is a function of variance in noise units only* (note 27 §3), so the BBA Cartesian spectrum (1,423) fixes Cartesian "order" (windows 0.028–0.53) and any whitening collapses it to 0.26.
- *Mixture weights are learned from visits.* No metric changes that; the αL population cannot be fixed by one 250 ns trajectory (95% interval 0.4–7.0%).

**Hypotheses and how the numbers bear on them.**
- *Removing κ makes learning easier* (notes 20–21): supported for stiff modes on ALDP5 (bonds near the floor ≈100× sooner, #765, mdshare), not for torsions or rare basins; and on BBA the same maps failed (#1025: springs' bond resolution 0.84 σ(t_min) because one global RMS divisor of 27.1 put the channels at sd 0.037, below σ(t_min) = 0.045).
- *Range and order predict learning* (note 27 §6–7, [H]): the windows ranked the 50,000-update models by size error but understated differences (note 27 §7); Q4 of the registered-budget study was not tested (real-budget-study, Answers). The size error of the ordered model is unchanged from 50,000 to 1,903,500 updates (§4.6), which argues against "order is an early-training effect" (Q3), on one seed at the full schedule.

**Corrections that change what a number means.**
- Note 25's αL "bound" is a formula error (§2.4); the data-based uncertainty is about half of what the note prints.
- The C3 Rg window is 0.27–0.28 (stronger estimator), not 0.23; the first-order screen (0.19) underestimates it because the helix-like order parameter is loud (loudness 8.8, correlation −0.41 with Rg; note 30 §2).
- The loud-mode force-field numbers of the Sprint 12 study (190,350) and of the longer-training continuation (380,700) used the invariant-map volume term; three quarters of the loud-mode compaction was this read-out error (lab 2026-11-16). The study's reading "the loud block adds nothing in simulation" and the longer-training conclusion "the error sits in the learned density at small noise levels" are superseded for the loud-mode map; for C3 the read-out had no such error and the low-noise compaction bias is learned (Rg residuals −4.6 ± 0.5 and −2.8 ± 0.5 at t = 0.01).
- The pilots' claim that note 21 confused units is itself contradicted by the code; the 6% difference (0.042 vs 0.0446 Å) changes no conclusion.

---

## 6. Visualization opportunities

1. **The κ ladder.** *Insight:* κ is not one number; it is "condition number of what, where, in which data". *On screen:* one vertical log axis 1–10⁵ with labelled ticks: 1 (ideal), 1.55 (step-estimation floor), 2.99 (learned warp, mdshare 1 ps steps), 7.6–13.4 (spring, bgmol windows), 8.27 (Theorem 3 bound), 24.6 (constant whitening), 97–192 (flat windows), 132 (κ of the spring metric), 184 (flat 1 ps steps), 356/415 (idealized), 400 (Part 1 toy), ≈920 (whole data), 1,423 (BBA modes), 1,780 (ALDP10 steps), ≈2,050 (energy.js), 1.9×10⁴ and 1.5×10⁵ (training curvature). Marker shape = definition (Hessian, window covariance, whole-data covariance, step covariance, curvature), colour = data (bgmol, mdshare, BBA, toy). *Computed from:* §4.1 values. *Pitfall:* draw "before → after" arrows only within one definition and one data set.
2. **Noise ruler with a t scrubber.** *Insight:* σ(t) is dimensionless; its Å size depends on the coordinates. *On screen:* a log-t slider; σ, log-SNR and three Å rulers (manifold 1 Å, pilot 0.9418 Å, BBA 6.252 Å) against bands for ALDP5 bond widths 0.025–0.031 Å, the bond-length noise √2σ, the BBA Cα bond, Rg spread 2.2 Å; markers at t_min = 10⁻⁵ and 0.01. *Computed:* §3.3 analytically. *Pitfall:* label which model's floor (0.0446 Å manifold vs 0.042 Å pilot).
3. **Same word, four windows.** *Insight:* readable windows are estimator-dependent lower bounds. *On screen:* for C3 Rg, a horizontal t-axis with four ticks (0.19 first order, 0.23 weaker estimator, 0.27–0.28 best envelope, 0.30 linearised through the decoder) and for Cartesian bonds 1.8·10⁻⁴ (rebuilt distances, R² ≥ 0.5) vs 4·10⁻⁴ (best envelope). *Computed from:* §4.2. *Pitfall:* never plot #1026 network-input windows and note 27 information windows on one curve.
4. **Exact readability curves.** *Insight:* only the spectrum matters for linear features. *On screen:* $r(t)$ for BBA's 27 Cartesian modes and a γ slider that re-spreads them (1,423 → 1), with $t_{1/2}$ dots moving from 0.028–0.53 to 0.26. *Computed:* closed form §3.4. *Pitfall:* bond lengths are nonlinear in Cartesian modes; their measured window is 0.0004, not the smallest mode's 0.028.
5. **Idealized vs measured spectrum.** *Insight:* the textbook "×20" is a model; one real basin gives ×14. *On screen:* nine idealized mode widths (0.0245–0.5 Å) beside the window's recovered extremes (0.018 and 0.248 Å), then κ_t curves 356 vs 146 at σ² = 10⁻⁴. *Computed:* §3.5. *Pitfall:* the idealized bond mode ignores the two-atom factor.
6. **The noise-level metric in one table.** *Insight:* a fixed metric helps at low noise and hurts at high noise; $G_t$ is near-optimal throughout. *On screen:* three curves of ρ(t) over σ² = 10⁻⁴…0.5 (no metric 146 → 1.1; fixed G 8.1 → 129; $G_t$ 6.7 → 1.0) with the 8.27 bound as a band. *Computed from:* note 21 Theorem 3 table. *Pitfall:* σ² there is in Å² of the manifold route.
7. **Three trajectories, 37 visits.** *Insight:* equal visit counts, unequal dwell times, populations 1.65–4.11%. *On screen:* three φ timelines (precomputable from the mdshare data if available, otherwise schematic) with αL visits as ticks; three error bars per trajectory: note 25's (struck through, 0.79–1.27), Markov 0.22–0.23, data-based ≈0.4–0.7, with the bootstrap intervals 0.4–7.0 / 0.0–4.6 / 1.1–7.9%. *Computed:* §3.10 (cr_check.py reproduces the Markov column in under a second). *Pitfall:* "37 independent visits" and "96–139 independent samples" are different counts.
8. **Budget clock.** *Insight:* the BBA conclusions are not an early-training effect, and three of four stops were at nearly full learning rate. *On screen:* the 1,903,500-update bar with stops at 2.6%, 10%, 20%, 100%, the cosine learning-rate curve (99.8%, 97.6%, 90.8%, 3.3% of peak), and size error per stop for the ordered model (≈0.11 throughout) and C3 (≈0.45 throughout). *Computed from:* §3.13, §4.6. *Pitfall:* seeds and panel sizes change between stops; the 1,903,500 point is from open PR #1104 (one seed).
9. **Where to read the force.** *Insight:* the two read-out conventions differ by α²; both share the blur bias; the volume term matters far more. *On screen:* 1-D Gaussian feature with a variance slider and a t slider, true force line and two read-outs (§3.11); then a BBA chain whose Rg drifts inward under the wrong volume term (0.6 $k_BT$/Å inward force; size error 0.98 Å) and stops drifting with the immersion term (0.24 Å). *Computed:* analytic, plus logged lab numbers. *Pitfall:* driver forces are in $k_BT$/Å without the $k_BT$ factor; do not mix units with note 29's.
10. **Two ALDP5 data sets.** *Insight:* implicit-solvent torsions move faster (1 ps φ/ψ steps 0.45/0.42 vs 0.36/0.31 rad); αL populations differ. *On screen:* two Ramachandran panels side by side with a label strip "bgmol: notes 20–21, benchmark, Sprint 12" / "mdshare: warp, #765, #779, note 25". *Computed from:* data (precomputable), plus §4.4. *Pitfall:* no cross-data before/after arrows.
11. **SNR at the floor.** *Insight:* bonds are below SNR 1 at t = 0.01 under every convention. *On screen:* bars for bonds, one–three, soft modes and metric noise at t = 0.01/0.003/0.001 (note 21 table), a dashed line at SNR = 1, and a toggle that swaps in the pilot-scale and window-mode values (0.34–0.52; 0.16–0.18). *Computed:* §3.6. *Pitfall:* bar heights depend on the convention; the conclusion does not.
12. **The shrinking bond.** *Insight:* a floor wider than a bond makes the last denoising step over-shrink bonds. *On screen:* a Gaussian of width w and its Tweedie image under s = 0.06 Å, ratio 0.39–0.46, against the measured 0.44–0.53. *Computed:* §3.7. *Pitfall:* early in training the same model's bonds are too broad (1.8–2.8× at 1k steps; r8 report cites feature-space-evaluation §4).
13. **The lag dial with real ALDP5 time scales.** *On screen:* a lag slider over 1 ps…50 ns with variance saturation bars for bonds, angles, φ, ψ (note 25 §3 table) and the half-erasure points (1, 1, 1.02, 2.12) of the four-mode toy at 1 ps. *Pitfall:* the table entries are variance fractions; widths are their square roots.
14. **Fix for the retention video's "63%".** *On screen:* the same readout as a variance (63%) and a width (79%). *Computed:* §3.9.
15. **Retention toy half-points as labels.** *On screen:* the three channels' curves with σ½ dots (§3.12): flat bond 0.056 before torsion 0.335 before basin 1.06; local widths bring bond and torsion together near 1. *Pitfall:* the toy's flat channel equates 1 Å with 1 rad; ratios between bond and torsion half-points are a convention there.
16. **Leakage trap.** *Insight:* temporal neighbours inflate readability. *On screen:* C3 Rg R² at t = 0.05 falling 0.82 → 0.34 → 0.14 → −0.03 as ±10 ns, ±100 ns, ±1 µs are excluded (note 27 §4 Traps). *Pitfall:* BBA "1 ps" frames are 200 ps apart (status, "BBA time labels").
17. **Training share of windows.** *On screen:* a uniform-t bar per map with coloured slivers: Cartesian bonds 0.02% (rebuilt distances) or 0.04% (#1025), C3 bonds 10%, long-range 17% (Cartesian) vs 9.7% (C3) (#1026). *Pitfall:* shares are for uniform t sampling on [t_min, 1].

---

## 7. Open questions, caveats, contradictions, superseded interpretations

1. **Note 21's 0.045 Å vs the pilots' 0.042 Å** (2026-10-24 vs 2026-10-25). Note 21 is right for the manifold-route flat model (noise in Å; checked in code); 0.042 Å is the pilots' own "production floor". The pilot document's correction of note 21 is itself unsupported. Either way the floor exceeds a bond width.
2. **Note 25 §6.1** (2026-11-04): $\sqrt{(1-w)/(wn)}$ is not a lower bound; the companion claim "for αR and β (about 9,200 visits each) the bound is 1.9%" uses the same formula and could not be reproduced from stated inputs (w ≈ 0.33 gives ≈1.5%). The status page's "37 independent αL visits … factor of order one" inherits the wording.
3. **37 visits vs 96–139 independent samples** (2026-11-04 vs 2026-10-27): different quantities, both measured; τ_int (900–1,300 ps) is 4–8× the Markov value, so visits are clustered. Neither count alone gives the uncertainty.
4. **Note 27's Rg windows for C3** (2026-11-12): §3 compares 0.30 with "0.23 measured", §4–§5 report 0.27–0.28; note 30 (2026-11-18) gives first-order 0.19 and treats 0.27–0.28 as the measured value. The two "linearised" numbers (0.30 via decoder Jacobian, 0.19 via loudness) disagree; how the decoder-Jacobian estimate was formed is not stated in note 27.
5. **Long-range pair count**: note 27 §4 "136 distances … at least 11 apart" vs 153 (lab 2026-11-16, and the arithmetic). 136 corresponds to separation ≥ 12.
6. **Cartesian angle/torsion windows**: note 27 0.05/0.08 vs lab recalibration 0.022/0.048 (2026-11-16, fewer estimators). As lower bounds, note 27's larger values stand.
7. **"Bond lengths are erased below the lowest trained level"** (note 27, status 2026-11-14, range-and-order): true at t_min = 0.01; the Sprint 12 Cartesian models train from 10⁻⁵, so their bond window exists but holds 0.02–0.04% of uniform training times.
8. **Force read-out results at 190,350 and 380,700 for the loud-mode map** (2026-11-15/16) were computed with the wrong volume term; superseded by the 2026-11-16 lab entry and the #1111 fix (2026-11-17). Status.md still frames the drift as "an error of the learned force at small noise levels" without this caveat (lab entries cannot edit status).
9. **Driver vs note 29 score evaluation point**: unreconciled in the documents; the loud-mode force contract in range-and-order ("F_t = Jᵀ α s + ∇ log vol") follows the driver. A force-contract test (note 29 §6) for the α convention is not recorded.
10. **Idealized-spectrum convention** (note 21 §3): treats 1/Var(q) of each internal coordinate as a Cartesian-mode stiffness; the window data imply the bond mode has half that variance (§3.5). Model-level numbers (356, 415, 1.5×10⁵, √κ ≈ 20) should be labelled idealized.
11. **Task labels vs document structure**: note 21 has no §3.2; the κ_t values are in §3, Proposition 2.
12. **BBA lag semantics**: the HDF5 time column is a frame index; "1 ps" steps are ≈200 ps (status.md "BBA time labels"; bead-matched-campaign: 1,625,195 frames, 325 µs). This affects #1025's thermal resolution noise, the one-frame and 100-frame BBA warps and lag-whitened internal coordinates.
13. **Retention video (anim PR #3)**: "63% of its equilibrium width" is a variance ratio; the flat channel mixes Å and rad; its harmonic widths (0.05 Å, 1 Å) match Part 1's E = k_BT crossings, not Part 1's σ (0.036 Å, 0.72 Å).
14. **Part 1 κ = 400 vs real ALDP5**: between the in-basin 100–200 and the whole-data ≈920; defensible as illustrative, but "×20 in noise level" is ×10–14 within one real basin and ×≈30 across all data.
15. **Full-schedule numbers** exist only in open PR #1104 (2026-11-18; one seed per model; five models chosen after stage 1 results, an amendment to the registered rule of at most three); native ScoreMD's full-schedule panel was due 2026-11-19 evening.
16. **BBA data provenance**: the early BBA files (DATA_STATE: byte matches of ScoreMD's `deshaw_dummy.zip`, model-generated samples) differ from the authentic DESRES set used in Sprints 11–12 (1,300,156 / 325,039 frames). Numbers from before Sprint 11 (e.g. Sprint 1's BBA input scale 6.26) are on the other data.
17. **Splits**: BBA held-out frames are random by frame and close to in-sample (real-budget-study, Limits; note 27 Traps); ALDP5 benchmark scores are against training data by design (benchmarks/aldp5.md).

---

## 8. Sources read

ML snapshot (`rg-main/`, origin/main 2026-11-19):
- docs/theory/20-thermal-metric-foundations.md (all; §1.4, §3, §4.2–4.7, §5.3, §8, §11 in detail)
- docs/theory/21-target-loss-noise.md (all; §2–§3, §4.3, §5, §6, §8, §10)
- docs/theory/25-information-geometry-lag-noise-posterior.md (§0–§7 in full)
- docs/theory/26-information-retention.md (all)
- docs/theory/27-readable-windows-and-noise-order.md (all)
- docs/theory/29-score-to-force-pullback.md (all)
- docs/theory/30-loud-blocks-in-redundant-charts.md (§0–§3); docs/theory/28-score-ease-and-thermal-preconditioning.md (§1–§2)
- docs/investigations/joint-distribution-metrics.md (all), evaluation-metrics.md (all), bba-local-geometry-preconditioning.md (all), bba-range-and-order.md (summary, §1–§6, implications), bba-internal-force-field-longer-training.md (all), feature-space-evaluation.md (summary, §2, §4), learned-stiffness-diffusion-pilot.md (summary, setup, "Units matter"), learned-warp-lag-sweep.md (warp-fit section), sprint12-network-inputs-and-baselines.md (claims table), bead-matched-campaign.md (BBA data paragraph), aldp-temporal-coverage.md (opening)
- docs/design/learned-stiffness-warp.md (purpose, construction, evaluation, results), docs/design/feature-space-driver.md (all)
- docs/DATA_STATE.md, docs/benchmarks/aldp5.md, docs/status.md (range-and-order, metric research, Sprint 11 sections), docs/APPROXIMATIONS.md (wδ conditioning), docs/sprints/sprint12/real-budget-study.md (all), protocol.md (data, budgets), matched-results.md (header)
- lab/README.md; lab/2026-11-16-bba-force-field-diagnosis, lab/2026-11-16-readable-windows-noise-precedents, lab/2026-11-18-range-order-mechanisms (READMEs)
- code: src/riemanniangenerativemd/samplers/feature_space.py (`physical_force`), geometry/feature_coordinates.py, geometry/immersion_volume.py, geometry/loud_mode_coordinates.py, forward/vp_schedule.py, forward/wrapped_gaussian.py, geometry/euclidean.py, data/datasets.py; configs/recipes/flat_vp_gt_s0_fixtarget_online.yaml; configs/feature-space/aldp5.yaml; grep for `input_scale` across `src/`.

GitHub (read-only): PR metadata for #753, #754, #765, #925, #926, #949, #985, #1025, #1026, #1055, #1057, #1064, #1069, #1071, #1088, #1089, #1091, #1100, #1107, #1109, #1111; open-PR list; body of open PR #1104. Live checkout: `git log origin/main` dates for notes 20, 21, 25, 26, 27, 29, feature-space-driver, bba-local-geometry, joint-distribution-metrics, real-budget-study.

Animation repo: anim main `src/model/physics.js`, `src/model/energy.js`, `src/model/molecule.js`, `src/videos/part-1/scenes/*` (κ and σ statements); anim PR #3 (`build-pr3/`, identical `toy.js` in `anim-playable-video-prototype/`): `src/videos/retention/toy.js`, `math.js` (OU helpers), `scenes/02-two-geometries.js`, README "Retention" section.

Workflow scratchpad: `critic/cr_check.py` (run, output in §3.10); understand/a1-anim-main.md, a2-anim-pr3-videos.md and r8-systems-data-eval.md (cross-checked only).

Computations done here (all CPU, seconds): spring-network Hessian spectrum (§3.2); schedule ruler (§3.3); t½ checks (§3.4); κ_t idealized/window inversion (§3.5); SNR conventions (§3.6); Tweedie ratios (§3.7); αL uncertainty columns and `cr_check.py` (§3.10); Gaussian force-ratio table (§3.11); retention-toy half points via `node` on `toy.js` (§3.12); learning-rate and epoch fractions (§3.13); pair counts (§3.14). Scripts: `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/g4work/ret_halves.mjs` (the others were inline one-liners).
