# r6 — Range and order: why "ordered internal coordinates" are promising

Reader r6, written 2026-11-19. Scope: theory notes 27 and 30 (with 26, 28, 29 where they
matter), the BBA range-and-order line from the first BBA diagnoses (2026-11-10) to the first
full-schedule results (2026-11-18), the lab entries of 2026-11-16 to 2026-11-19 and the open PRs
that carry the newest results. All paths are relative to the ML-repo snapshot
`.../scratchpad/rg-main` unless absolute. Labels used below: **[S]** cited source result,
**[D]** derived (in the source or "derived here"), **[M]** measured, **[H]** hypothesis — the same
labels the notes use. Numbers are quoted from the named source; anything I computed is marked
"(derived here)".

**Naming.** "C3" = internal coordinates with unit-phase distance inputs (103 features). "Loud-mode
model", "internal + 2 loud modes", map `internal_loud_modes` (109 features) = what open PR #1104
(2026-11-16) renames **"ordered internal coordinates"**; the same PR renames C3 to "internal
coordinates". "C1" = Candidate 1 of #1026, whitened bond/angle springs + whitened (Rouse-whitened
Helmert) collective vectors = the two-block map at γ = 1.

---

## 0. The idea in one paragraph

A denoising diffusion model can only learn a property from training examples whose noisy input
still carries it, and — because the exact reverse process has the same joint law as the forward
one — *a property destroyed early going forward is decided early going backward*. For any map φ
and VP schedule one can measure, from data alone and without training, the noise level
$t_{1/2}$ at which each property (bond, angle, torsion, size, long-range distance, contact) is half
erased. Two requirements follow (note 27, status 2026-11-14): **range** — every property must be
readable somewhere inside the trained levels $t\in[t_{\min},1]$; **order** — properties should be
erased at clearly different levels, large-scale shape last, so generation "decides the fold before
the detail". On BBA, Cartesian noise has order without range (bond lengths are half erased at
$t\approx0.0004$, below $t_{\min}=0.01$ of the internal models and inside only 0.04% of the
Cartesian training draws); coordinates scaled to unit spread (internal, whitened) have range
without order (everything erased between $t\approx0.18$ and $0.35$). Internal coordinates are even
*anti-ordered*: a long-range quantity is a high-degree product of torsion phases and is erased
before the torsions that build it (note 30, Prop. 1). Appending the chain's two largest collective
modes, left at their natural ("loud") spread, restores the order (mode 1 stays readable to
$t\approx0.5$), turns size into a coordinate of its own with a simple near-Gaussian marginal, and
— because the block is redundant with the internal block — adds three constraint directions whose
small-noise signal pushes the quieter internal block to follow the louder block (note 30, Prop. 2).
Result on BBA: internal-level local geometry with near-Cartesian size, robust from 50,000 to
1,903,500 updates, while C3 alone stays swollen at every budget. The block cannot supply an
excluded-volume wall, global handedness, the kinematics for free, or sharp soft forces.

---

## 1. Narrative (chronological)

### 1.0 Context: stiffness removal worked on ALDP5 (Sprints 11, to early Nov 2026)

- Sprint 11 sought coordinate maps in which all motions have similar size ("stiffness removal",
  a local whitening). On the five-bead ALDP5 such maps learned bonds and angles 10–100× sooner than
  Cartesian diffusion (status.md, "Range and order", 2026-11-14).
- Theory note 26 (information retention, PR #926, merged 2026-11-05) defined the retained fraction
  $R_t$ of a probe panel, with the harmonic special case $r=\alpha^2\lambda/(\alpha^2\lambda+\sigma^2)$.
  On ALDP5 "flat erases stiff information at 10–20 times smaller noise"; reallocating training times
  to that interval lowered bond error 21–45% but worsened angles and torsions early (status.md).
- Note 25 Prop. 2 already stated that lag-shaped (thermal-metric) noise erases modes in order of
  decreasing relaxation time — the first "order" statement in the project.
- ALDP5 "has no separation between local and global structure and cannot test order" (status.md,
  "Not established").

### 1.1 BBA splits every model into two halves (Sprint 12 first chunk, 2026-11-09 → 11-11)

- First Sprint 12 chunk (190,350 updates, seed 0, 100,000 draws; snapshot 2026-11-09):
  internal coordinates bond W1 0.000274 Å, angle 0.1664°, but Rg W1 0.5208 Å; Cartesian bond
  0.415 Å, angle 5.24°, Rg 0.072 Å (`docs/sprints/sprint12/candidates/internal.md`). Springs and
  whitening failed outright.
- #1010/#1012/#1015 (created 2026-11-10): the internal model learns angles, torsion pairings,
  contacts; bonds come from the fitted Gaussian prior ("prior matching"); exact marginal matching
  leaves Rg W1 0.48–0.52 Å (a joint-organisation error); bead pairs ≥ 11 apart carry 92% of the
  excess mean squared Rg (`docs/investigations/bba-range-and-order.md` §1).
- #1025 (2026-11-11): each map failed for its own measurable reason, via a training-free
  *resolution test* $\sigma^*(q)=\mathrm{sd}(q)/c_q$, $c_q=\sqrt{\nabla q^\top G^+\nabla q}$:
  springs put bond fluctuations below the smallest training noise (one global RMS divisor 27.1);
  whitening spends 94% of its low-noise loss on the 3,225 normal directions of its 3,303-channel
  map; internal coordinates make Rg the least-resolved observable ($\sigma^*/\sigma(t_{\min})=3.0$,
  "collective lever arm"); Cartesian bonds are resolvable only below $t=4\times10^{-4}$. Pair-distance
  inputs (#985) are the largest single Cartesian gain (bond 0.76 → 0.013 Å). A spring score base
  collapses the untrained chain (Rg 5.41 ± 0.51 Å vs data 10.59 ± 2.20 Å) because it breaks prior
  matching in the collective size direction.
- #1026 (2026-11-11): first *readable windows* (R² ≥ 0.5 of rebuilt pair distances against
  clean): Cartesian bonds to $t=1.8\times10^{-4}$ (0.02% of training), long-range shape to 0.17;
  internal with #985 inputs loses long-range shape by $t\approx0.04$ because raw noisy torsion
  phases make chain frames non-orthonormal. **C3 is defined**: normalising each noisy phase pair
  as $p/\max(|p|,0.05)$ extends the window to $t\approx0.11$. C3 cut the size error 19% (0.48 vs
  0.59 Å) and halved clashes, but stayed ~5× Cartesian; its early size advantage (0.31 Å at 1,000
  updates) was gone by 10,000 (0.55 Å). Candidates 1 (= C1) and 2 were negative — "in hindsight
  the range-without-order failure" (`bba-local-geometry-preconditioning.md` §4). Windows "did
  **not** predict how fast global structure is learned".
- #1023 (2026-11-11; theory now note 28): an analytic conditional bond score gives floor-level
  bonds from the first update but no angular-learning gain; 89–99% of the excess size sits in bond
  pairs ≥ 6 apart — local preconditioning cannot reach it.

### 1.2 Mechanism: C3 decides fold and detail in the same band (#1055, 2026-11-11/12)

CPU-only analysis of the C3 checkpoints (both seeds, 0–50,000 updates), eight probes each
re-checked by an independent verifier, a literature sweep (170 findings, 80 checked), a 21-idea
design round:
- The error is a swelling of the unfolded ensemble (mean Rg 11.07 vs 10.60 Å; non-native Rg 12.0
  vs 11.4 Å; compact non-native 0.130 vs 0.185); ~90% of the excess squared size is the distance
  between the N-terminal hairpin (beads 0–12) and the rest; long-range torsion MI only 0.29–0.32
  of the data's.
- *Not* error accumulation (C3's torsion-level noise gives at most 0.14 Å Rg W1, not 0.49 Å — this
  corrected #1025's explanation); *not* the integrator (3,000 steps etc. change mean Rg ≤ 0.01 Å).
- The learned field creates it at intermediate noise: held-out molecules noised to $t\le0.1$ and
  denoised keep their size; from $t=0.3$ they reproduce 94 ± 25% of the excess; bands 0.5–0.3,
  0.3–0.2, 0.2–0.11 each add 0.27–0.43 Å — exactly where C3's global and local windows coincide.
- The training signal there is negligible: ~70% of the expected gradient from $t<0.05$, 22% from
  0.05–0.11, above 0.11 indistinguishable from zero at 50,000 updates. Torsion correlations
  compact the real chain by 0.90 Å; C3 reproduces 0.41–0.50 Å of this by ~1,000 updates and does
  not improve over the next 49,000.
- Distance inputs barely used (substituting exact clean distances changes the prediction error by
  ≤ 0.03 out of 30–78); rebuilt distances informative only to $t\approx0.13$.
- Two opposite density errors: mid-noise transport swells, the low-noise density is slightly too
  compact and lacks a hard core (real molecules at $t=0.05$ shrink −0.41 ± 0.13 Å over 500
  Metropolis steps, overlaps 8% → 20%). A low-noise Langevin corrector works partly because the two
  cancel. Eight fixes tested on CPU: six refuted, one no-go, one inconclusive.
- The probe executed here is the readable-window measurement later written up as note 27 §4.

### 1.3 Theory note 27: readable windows, range and order (#1064 created 2026-11-13; landed via #1079, merged 2026-11-16)

#1064 noticed that #1055's probe was step 2 of note 26's "bounded validation path" and turned it
into a routine, training-free measurement with two summaries (window, order), three
training-signal identities and a stated hypothesis (range + order); trained tests summarised
2026-11-14 (§7 of the note).

### 1.4 Restoring order: local whitening, loudness and two dials (#1057, 2026-11-12/13)

- Derivation (archived note `bba-noise-order-partial-whitening.md`, head `0a6f66d0`): feature maps
  are *local* whitening (config-space noise covariance $s^2(J^\top J)^{-1}$); first-order *loudness*
  $\ell_g(O)$; **"Unit variance in every direction is what erases the order; the local whitening
  itself does not."** A two-block map (collective block with exponent γ + stiff block at channel
  variance $v_k$) has two independent dials.
- Training-free screen of partial whitening: global windows shrink by ≤ 1/10 up to γ = 0.5 while
  local windows widen; collective modes alone never give bonds a window above $t=0.005$.
- Mode 1 is 88% aligned with the hairpin-to-rest separation that C3 gets wrong.
- Three approved pilot stages, ten models, 50,000 updates each, predictions pushed before each
  stage: stage A — P1 (pure modes γ = 0.5), P2 (C1 at γ = 0.5) — approved and run 2026-11-12;
  stage 2 — D1, D2 (γ = 0.25, 0), I1 (C3 + 27 vectors), I2 (C3 + 8 vectors) — approved 2026-11-12;
  stage 3 — R (I2 seed 1), K4, K16, B (matched base) — approved 2026-11-13 (the note does not give
  the exact run dates of stages 2 and 3). Outcome: **size follows the exponent monotonically** (0.51 → 0.19 → 0.12 →
  0.08 Å); populations and torsions do not; internal + a few loud vectors removes the swelling; 27
  vectors break the model.

### 1.5 How small a block: two vectors; overlaps and the late repulsion (#1069, 2026-11-13)

- Block sizes 1, 2 (two seeds), 4 (second seed): the global gain is the same for 1–8 vectors (ties
  by the pre-fixed effect rule), the local cost grows from 4 vectors on; **two vectors are the
  smallest block meeting every global threshold on two seeds** and the most reproducible (seeds
  differ by 0.001 Å in size error).
- The overlap defect (two beads ≥ 3 apart closer than 3.5 Å) is not leftover noise (real molecules
  noised to 0.01 and rebuilt: ≤ 3.4% overlaps). The gated hard core of #1065 (2026-11-13, designed
  on C3) applied as a **late repulsion**, λ = 30 Å⁻², core 3.6 Å, $|i-j|\ge3$, from $t\le0.02$
  (last 150 of 1,000 steps): overlaps 24.4%/17.2% → 2.0%/1.3%, size +0.02–0.04 Å, local geometry
  unchanged; met every pre-registered criterion on both seeds.

### 1.6 Sampler routes for plain C3 (#1065, #1073, #1090; 2026-11-13 → 11-16)

- #1065: corrector + hard core, and "equilibrium + hard core" (fitted 34-number low-noise packing
  correction, 1,000 MALA steps at $t=0.05$, hard core at $t\le0.0125$) give C3 data-level global
  structure (Rg W1 0.07/0.08 Å) at about twice plain C3's angle and bond errors.
- #1073 (2026-11-13): moving **only the 25 torsions** (50 phase features) in the equilibration,
  2,000 steps: Rg W1 0.48/0.46 → 0.05/0.12 Å with bond and angle errors *exactly* those of plain C3
  — "global structure is carried by the torsions"; the local cost of the full recipe came from
  moving bonds/angles at low noise. Local-moment correction refuted.
- #1090 (2026-11-15/16): with a stabilised, gated one-number Rg² weight fitted from generated
  states, confirmed at 20,000 molecules on both seeds: Rg W1 0.053/0.093 Å, angle 0.226/0.233°,
  bond 0.0006/0.0007 Å (`bba-c3-local-accuracy-screening.md` §5f). Caveat: the size weight is
  fitted against data.

### 1.7 One invertible chart with range and order: skeleton and arrows (#1068, 2026-11-13/14)

Even beads as a loud Cartesian "skeleton" (13 centred shape vectors, loudness L), odd beads by
their two log bond lengths and an "arrow" (unit vector perpendicular to the line through the
neighbours, ×κ = 1.5); 108 features for 81 DOF. CPU tests: exact rebuild (1e-13 Å), noise does not
travel along the chain, range and order together ($t_{1/2}$ bonds 0.25, angles 0.13, torsions 0.20,
size 0.69, long-range 0.65, closest non-neighbour 0.089 at L = 30). Trained pilot (four fits,
50,000 updates): size right (Rg W1 0.077 Å, right after ~5,000 updates), bonds at the floor,
long-range overlaps mostly gone, but torsion error 7.9–10.6° → **refuted** by its own rule; 4–18%
of molecules not rebuildable (unclosed triangles). Lesson: "a feature is learned accurately when it
is a coordinate of its own"; an arrow is a *relation* and is learned as poorly as Cartesian local
structure even though torsions are readable 3× longer than in Cartesian. Control I8-low (8-vector
internal model trained to $t_{\min}=0.001$) still had 21% overlaps.

### 1.8 Decision and consolidation (2026-11-14)

status.md "Range and order" entry: *"Stiffness removal is kept for the stiff coordinates and
dropped as a goal for the whole molecule. The working hypothesis is now: scale bonds and angles to
their thermal width so that they are readable, and leave a small set of collective coordinates loud
so that they are erased last."* Twelve research PRs consolidated into
`docs/investigations/bba-range-and-order.md` (#1079, merged 2026-11-16) with a driver specification
(Stage 0 of the real-budget study).

### 1.9 The registered budget (#1071 launched 2026-11-14; #1088 study 2026-11-15)

- Candidate on two *fresh* seeds (2, 3) at 190,350 updates, 100,000 molecules: bond 0.0004/0.0003
  Å, angle 0.20/0.19°, torsion 0.76/0.79°, Rg W1 0.117/0.091 Å; C3 0.455 Å; Cartesian + distances
  0.077 Å (seed 1) / 0.071 Å (stored seed 0). "The mode block changes where training ends, not
  only how fast it gets there." One pre-fixed criterion missed (Rg ≤ 0.11 Å on seed 2: 0.117).
- Study (22 models): the candidate is the only one near the best on both scales; beats native
  ScoreMD on both seeds on every measure; narrowly behind Cartesian models on size (seed means
  0.104 vs 0.074 Å) and contacts; populations tied.
- Force fields (256 + 256 walkers, 100 ps): internal-coordinate families drift least (size error
  0.84 Å C3, 1.14 Å loud) and "the loud block gives no further gain in simulation" — **later
  revised** (§1.10).

### 1.10 Force fields: compaction, then a corrected volume term (2026-11-15 → 11-18)

- #1089 (2026-11-15): the drift is a *compaction* (half population shift, half within-state);
  reading at $t=0.05$ with the repulsion as an energy halves it (1.06 → 0.56 Å).
- #1091 (2026-11-16): doubling training to 380,700 updates changes neither drift nor generation.
- **#1100 (lab 2026-11-16-bba-force-field-diagnosis):** for the loud-mode map the code had used the
  rotation-invariant volume formula; the map's vectors rotate with the molecule, so the correct term
  is the immersion volume $\tfrac12\log\det(J_c^\top J_c)$. The wrong term was a spurious inward force
  ≈ 0.6 kT/Å on Rg (predicted stationary mean Rg 9.58 vs 10.66 Å). With the correct term the 100 ps
  size error fell 0.98 → 0.24 Å (seed 3). On noised inputs the learned score is accurate from level
  0.05 upward; at 0.01 C3 has a compaction bias (Rg residual −4.6 ± 0.5, −2.8 ± 0.5) while the
  loud-mode models do not (+1.9 ± 0.8, +2.3 ± 0.7) — "direct evidence that the loud block also helps
  forces". No model has an excluded-volume wall.
- #1101 (2026-11-16/17): continuing training with $t_{\min}=0.003$ does not create the wall
  (wall z unchanged); more loud modes do not help either.
- #1106/#1109 (2026-11-17): a 26-term short-range correction fitted against simulations removes
  overlaps but swells; adding one Rg term (27 coefficients) removes overlaps without swelling.
- #1115, #1130 (2026-11-17/18): library rerun reproduces generation; all loud-mode force fields
  keep compacting between 100 and 300 ps.

### 1.11 Using the block at read-out (2026-11-16/17)

#1102: generated block and rebuilt chain agree in bulk (median mismatch 0.42 Å per bead vs a
floor of 0.15) with a heavy tail; #1105: a least-squares rebuild from all 109 numbers brings Rg W1
0.117/0.091 → 0.077/0.064 Å but raises overlaps to ~20%; #1107: adding the hard core to that fit
gives **0% overlaps, Rg W1 0.083/0.070 Å, unchanged local accuracy** — "the first rebuild of
generated BBA molecules that reaches Cartesian-level size, internal-level local accuracy and no
overlaps at the same time". Promoted to the library (#1108, #1110).

### 1.12 Mechanisms without training: note 30 and its tests (2026-11-18/19)

Lab entry `2026-11-18-range-order-mechanisms` (#1131) + theory note 30 (#1132): anti-order of
internal coordinates (Prop. 1), conservation of information across charts, constraint directions
and their split (Prop. 2), where the size information goes, why two vectors, and what a loud block
cannot provide, with four predictions. #1133 tested two: the chain follows the block along the
reverse path first at $t=0.13$ (predicted 0.26–0.1, matched); generated molecules reproduce global
handedness via the torsions (compact bin within 0.03). #1134/#1139/#1140 localise a residual
mid-size handedness deficit to long-range assembly. #1129: Rouse modes give the block directions
without a trajectory. #1099 places EigenFold and Chroma in the range/order picture.

### 1.13 The full schedule (#1104, open; first results 2026-11-18)

Five models continued to 1,903,500 updates (owner's selection, recorded as an amendment):
ordered internal coordinates (seed 2) reaches Rg W1 0.111 Å (0.117 at 190,350; 0.120 at 380,700),
C3 (seed 0) 0.455 Å; bonds, angles, contacts at the floor; joint rebuild with hard core 0%
overlaps, 0.105 Å; force field at $t=0.05$ with the immersion volume term 0.118 Å after 100 ps
(0.24–0.34 Å for the 190,350 models). Cartesian base, whitening and ScoreMD were due 2026-11-19.
Declared but not yet run: the whitened-block test of note 30's prediction 1 (#1137).

---

## 2. Core mathematics

### 2.1 Forward process and schedule [S/D]

Features $Z=\phi(X)\in\mathbb R^M$; VP noising $Y_t=\alpha_tZ+\sigma_t\varepsilon$, $\varepsilon\sim\mathcal N(0,I)$,
$\alpha_t^2+\sigma_t^2=1$, with $\beta(t)=0.1+19.9\,t$ and
$-\log\alpha_t^2=B(t)=0.1\,t+9.95\,t^2$ (note 27 §3; note 28 §1). Noise size $s=\sigma_t/\alpha_t$;
log-SNR $\log(\alpha_t^2/\sigma_t^2)$ is the schedule-independent axis (note 27 §2).
- Training: $t\sim\mathcal U[t_{\min},1]$, summed squared noise-prediction loss
  $L=\mathbb E\|\epsilon_\theta(Y,t)-\epsilon\|^2$. $t_{\min}=0.01$ for internal, stiff-channel,
  whitened, two-block and loud-mode maps; $t_{\min}=10^{-5}$ for Cartesian-family, pure-mode and
  warp maps (real-budget study "Held fixed"; first-chunk dossier). Low-noise continuation pilot used
  0.003 (#1101).
- Conservative Gaussian-residual model: $\epsilon_\theta=\sigma_t y+\alpha_t\nabla_yH_\theta(y,t)$,
  $H_\theta=0$ at initialisation ⇒ the untrained model says "features are standard normal"
  ("prior matching", note 28 §1).
- Sampler: 1,000 reverse Euler–Maruyama steps on the geometric grid `np.geomspace(1, t_min, 1001)`
  (`samplers/low_noise.py:198`, `samplers/late_repulsion.py:89`), final denoising at $t_{\min}$.
- Useful values (derived here): $t=0.01$: $\alpha=0.99900$, $\sigma=0.04464$, $s=0.0447$,
  $1/\sigma^2=501.8$, log-SNR 6.22; $t=0.05$: $s=0.1741$ (note 28/#1025 quote 0.174); $t=0.26$:
  $s\approx1.005$ (log-SNR ≈ 0, i.e. $t_{1/2}$ of a unit-variance channel); $t=1$: $\alpha^2=4.3\times10^{-5}$
  (note 30 §3 quotes ≈ 5×10⁻⁵). On the geometric grid, step $k$ has $t=0.01^{k/1000}$: $t=0.05$ is
  step 650 (last 350 steps), $t=0.02$ step 850 (last 150), $t=0.0125$ step 952 (last 48) — exactly
  the counts quoted for the corrector and the two repulsion presets.

### 2.2 Readability and the three facts (note 27 §1)

$$R_h(t)=\frac{\operatorname{Var}(\mathbb E[h(X)\mid Y_t])}{\operatorname{Var}(h(X))}=1-\frac{\mathbb E[(h-\mathbb E[h\mid Y_t])^2]}{\operatorname{Var}(h)}\in[0,1].$$
Pooled over observables: $1-\sum_k\mathrm{MSE}_k/\sum_k\operatorname{Var}_k$. It is note 26's retained
fraction for a one-probe panel ($I_{\rm clean}-I_t=\mathbb E[\operatorname{Cov}(u\mid Y_t)]$, note 26 Prop. 1).
1. *Any predictor gives a floor* (note 26 Prop. 4): $R^2_f(t)=1-\mathbb E[(h-f(Y_t))^2]/\operatorname{Var}h\le R_h(t)$. Do not clip negative values.
2. *More noise cannot restore information* (note 26 Prop. 2): VP noising is Markov in $t$, so
   $R_h$ is non-increasing; hence the running max over higher noise of any floor is still a floor.
3. *The channel is the representation together with the noise law*: re-expressing the same noisy
   input does not change $R_h$; isotropic noise *after* a different map is a different channel.
- **Destroyed forward = decided backward [D]**: the exact reverse process has the forward joint law
  of $(X,Y_t)$, so $R_h(t)$ is also the fraction of the final value's variance already fixed by the
  state at time $t$ during exact generation.
- **MI relation [D]**: $I(h;Y_t)\ge\mathsf h(h)-\tfrac12\log(2\pi e(1-R_h)\operatorname{Var}h)$; for a
  Gaussian observable the right side is $-\tfrac12\log(1-R_h)$, so $R_h=\tfrac12$ ⇒ at least
  $\tfrac12\log2\approx0.35$ nats survive.

### 2.3 Summaries (note 27 §2)

- Half-erasure level $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; **readable window** $[t_{\min},t_{1/2}]$;
  decision window: levels between $R_h=0.8$ and $0.2$. Measured values are lower bounds.
- **Range**: every required feature has $t_{1/2}\gg t_{\min}$ and $R_h(t_{\min})\approx1$.
  **Order**: feature classes erased at clearly different levels, coarse above fine.
- Share of training draws inside a window (derived here): $(t_{1/2}-t_{\min})/(1-t_{\min})$;
  Cartesian bonds $(0.0004-10^{-5})/(1-10^{-5})\approx0.04\%$ (matches #1057's "0.04%"); C3 bonds
  ≈ 25%.

### 2.4 Linear closed form (note 27 §3; note 26 harmonic case)

For a direction of data variance λ in the coordinates where unit isotropic noise is added:
$$r(t)=\frac{\alpha_t^2\lambda}{\alpha_t^2\lambda+\sigma_t^2},\qquad r=\tfrac12\iff\alpha_t^2\lambda=\sigma_t^2\iff s^2=\lambda,$$
$$t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\,\log(1+\lambda)}}{19.9},\qquad t_{1/2}(1)=0.259.$$
Exact for Gaussian data, a floor (best linear predictor) otherwise. Width probe retains $r^2$; a
product of independent modes retains $r_ir_j$ (note 26). Partial whitening by exponent γ (divide
mode $k$ by $\lambda_k^{\gamma/2}$, renormalise to unit mean variance) leaves effective variances
$\propto\lambda_k^{1-\gamma}$; γ = 1 makes every linear feature half-erased at the same level.

### 2.5 Training-signal identities (note 27 §6)

(a) **Fisher form** (note 26 Prop. 3): $-\frac{dI_t}{dt}=D_t=\mathbb E[(D_ym_t)a_t(D_ym_t)^\top]$; the
score objective feels a feature at the levels where it is being erased; $\int_\varepsilon^TD_t\,dt=I_\varepsilon-I_T$.
(b) **I-MMSE form** [S] (Guo–Shamai–Verdú Thm 2; Pan et al. Eq. 11), with $\gamma=\alpha_t^2/\sigma_t^2$:
$$\frac{d}{d\gamma}I(Y;X_\gamma)=\tfrac12\big[\mathrm{mmse}(\gamma)-\mathrm{mmse}(\gamma\mid Y)\big],$$
the bracket = the part of the denoising loss at that level that knowing the feature would remove.
(c) **Ablation / KL form** [D]: for laws $P$ and $Q$ ($Q$ lacking one structure) pushed through the
same VP process,
$$D_{\rm KL}(P\Vert Q)-D_{\rm KL}(P_T\Vert Q_T)=\tfrac12\int_0^T\frac{\beta(t)}{\sigma_t^2}\,S_Q(t)\,dt,\qquad S_Q(t)=\mathbb E_{P_t}\|\hat\varepsilon_P-\hat\varepsilon_Q\|^2,$$
$S_Q(t)$ = excess denoising loss at level $t$ of a model that learned everything except that
structure = the training signal available for it. The left side is chart-independent; the
**profile** $S_Q(t)$ is not.
- **Hypothesis [H]**: a structure is learned within a finite budget only if at some levels its
  signal is a non-negligible share of the loss still reducible there; an ordered process gives
  global structure a band of its own ("coarse, then fine given coarse").

### 2.6 Local whitening and first-order loudness (#1057 note §2; note 30 §1)

To first order a feature perturbation moves the configuration by $\delta x=(J^\top J)^{-1}J^\top\delta y$,
so isotropic feature noise of size $s$ gives $\operatorname{Cov}(\delta x)=s^2g^{-1}$, $g=J^\top J$ (the
pullback metric) — stiff directions are suppressed *wherever they point* (local whitening).
$$\ell_h=\frac{\operatorname{Var}(h)}{\mathbb E[\nabla h^\top G^+\nabla h]},\qquad G=J^\top J\ \text{on centred displacements};$$
$h$ is half erased (linear-Gaussian rule) when $s^2=\ell_h$, i.e. $t_{1/2}=t_{1/2}(\ell_h)$. A screen,
not a measurement: a posterior exploiting non-Gaussian structure can read more. Prior matching
(every feature at unit variance) makes all loudnesses ≈ 1 — "Unit variance in every direction is
what erases the order; the local whitening itself does not."

### 2.7 Two-block map and the two dials (#1057 note §2.4; range-and-order §4)

$$\phi(x)=\big(c_\gamma\,(C_H^{-\gamma/2}\otimes I_3)\,u(x),\ D\,(q(x)-\mu)\big),$$
$u$ = the 27 Helmert vectors, $C_H$ their rotation-averaged second moment, $c_\gamma$ keeps the mean
mode variance 1, $q$ = 27 bond lengths + 26 bond angles whitened by $D$ to channel variance $v_k$.
With $g=A^2+M^\top M$, $A=c_\gamma C_H^{-\gamma/2}\otimes I_3$:
$$\ell_g(a_p)\ \ge\ c_\gamma^2\lambda_p^{1-\gamma},\qquad \ell_g(\tilde q_k)\ \ge\ v_k .$$
γ sets when collective features are erased; $v_k$ sets when stiff features are erased,
independently. Channel variance → half-erasure: $v=1,0.3,0.1,0.03\Rightarrow t_{1/2}=0.26,0.16,0.09,0.05$
(#1057 note §2.6; reproduced here). Physical picture: configuration noise is tiny across the surface
of fixed bonds/angles and mode-shaped along it — "Cartesian noise on a chain with fixed bonds" in
closed form. Torsions have no channel of their own in this family (their window follows γ).

### 2.8 The internal block (C3) — exact definition (`bba-local-geometry-preconditioning.md` §4; `geometry/chain_coordinates.py`)

- 25 torsions as phase pairs $\kappa(\cos\tau,\sin\tau)$ (50 channels), one shared scale
  $\kappa=1/\sqrt{\text{mean per-channel phase variance}}$ fitted on the training membership
  ($\kappa=1.504$ for BBA; a uniform torsion would give $\sqrt2=1.414$).
- 53 stiff coordinates: 27 log bond lengths and 26 $\log\tan(\theta/2)$, centred and
  Cholesky-whitened by their **training population covariance** $C=LL^\top$ (no ridge):
  $w=L^{-1}(r-\mu)$. "Thermal-width scaling" in the status wording is this population whitening; for
  bonds (one basin) population spread ≈ thermal spread (bond spread 0.057 Å); angles are partly
  multi-basin (40–51% of pseudo-angle variance between basins, lab 2026-11-18-loud-mode-transfer-checks).
- $4N-9=103$ channels, SE(3)-invariant, signed torsions (reflection information kept).
- **Torsion periodicity**: the phase pair embeds the circle; Gaussian noise leaves the circle (the
  radius changes). Decoder: `atan2` of each noisy pair (fails if the radius ≤ 1e-8), stiff block
  unwhitened, NeRF rebuild. Network distance inputs: unit-phase hint $p/\max(|p|,0.05)$ (raw phases
  make chain frames non-orthonormal and lose long-range shape by $t\approx0.04$); rebuilt pair
  distances fed to attention edges ($\operatorname{asinh}(d^2)$ + 16 Gaussian RBFs = 17 channels); the energy
  is differentiated through the rebuild ("conservative torques on the torsions").
- Network/recipe: `SymmetryFeatureTransformer` energy, width 128, 3 layers, 8 heads of 64; AdamW
  3·10⁻⁴, cosine over 1,903,500 updates; batch 1,024; EMA 0.995; clip 1; all 1,300,156 frames.
- Readability of one uniform torsion through its noisy phase pair (derived here from
  `chain_model.py`): the posterior is von Mises with concentration $k=\alpha\kappa|y|/\sigma^2$, so
  $r(t)=\mathbb E\big[(I_1(k)/I_0(k))^2\big]$. Monte Carlo with κ = √2 gives 0.940 (t = 0.1), 0.716
  (0.2), 0.530 (0.26) — the note-30 table's 0.94/0.72/0.53; with κ = 1.504: 0.947, 0.746, 0.565.

### 2.9 Collective modes and the loud block — exact definition (`geometry/loud_mode_coordinates.py`; note 30 §1)

- Helmert vectors $u_1..u_{n-1}$ of the centred cloud; $C_{ij}=\mathbb E[u_i\cdot u_j]/3$ (rotation
  averaged; equivalently the 28 × 28 matrix of mean bead-position dot products); eigenvectors $V$ by
  decreasing eigenvalue $\lambda_p$, sign fixed so the largest entry is positive.
- Mode vector $a_p=\sum_iV_{pi}u_i\in\mathbb R^3$ (rotates with the molecule). Feature $c_0a_p$ with
  the **collective scale** $c_0=\sqrt{(n-1)/\operatorname{tr}C}$ (Helmert coordinates get unit mean square);
  $c_0=0.157$ Å⁻¹ for BBA ($1/c_0=6.37$ Å; the Cartesian arm uses 6.252 Å). Not whitened (γ = 0).
  Equivalently $c_0=\sqrt{3(n-1)/(n\langle R_g^2\rangle)}$ (derived here; with RMS Rg 10.83 Å this gives
  0.1570).
- **Loudness**: a component of mode $p$ has mean square $c_0^2\lambda_p$: **15.0, 6.0**, 2.9, 1.3,
  0.49, … (feature units; sum over all 27 modes = 27). In note 27's Å/6.252 units the same spectrum
  reads 15.5, 6.2, 3.0, 1.3 (smallest 0.011) — a pure unit difference, $(6.37/6.252)^2=1.038$.
  RMS $|a_1|$ ≈ 42.7 Å; RMS length of the two-vector block ≈ 50.6 Å (derived here; #1102 measures
  50.49 Å on held-out data). Conformational variances of the mode *lengths* (what matters for size):
  6.9, 2.5, 0.9, 0.6 for modes 1–4, against a first-order torsion loudness of 2.0.
- Shape: mode 1 is a smooth end-to-end gradient with a sign change after bead 14 (56% of the squared
  size), mode 2 ends-against-middle (22%), mode 3 11%, mode 4 5% (#1057 note §4). Overlap with Rouse
  cosine modes $\sqrt{2/N}\cos(\pi q(i+\tfrac12)/N)$: 0.99, 0.99, 0.91, 0.92; Rouse modes 1–2 capture
  99.6% of the fitted two-mode variance on BBA, 98.7% on Chignolin (order swapped there).
- Map: $y=[\text{internal block (103)},c_0a_1,\dots,c_0a_K]$, $103+3K$ features (109 for K = 2).
  Decoder ignores the block (internal-only rebuild); joint rebuild optional. Network reads vectors via
  invariant pairwise dot products and, from three vectors, signed triple products: $K(K+1)/2+\binom K3$
  derived channels = 1, 3, 14, 92, 696, 3,303 for K = 1, 2, 4, 8, 16, 27 (derived here; matches the
  documented 103 + … = 117, 195, 799, 3,406 inputs).
- Volume term: with K ≥ 2 the map immerses all $3N-3$ centred coordinates: $\log(dV_g/dv)=\tfrac12\log\det(J_c^\top J_c)$
  (`immersion_volume.py`); with K = 1 the rotation about $a_1$ is unresolved (rank $3N-4$), no volume
  term, "not force-ready".

### 2.10 Proposition 1 — degree attenuation, "anti-order" (note 30 §2)

Torsions independent and uniform, each observed through its noisy phase pair; $r(t)=\mathbb E|\mathbb E[e^{i\tau}\mid Y]|^2$.
For $h$ multilinear in the phases, $h=\sum_jh_j$ ($h_j$ = sum of products of $j$ distinct phases):
$$R_h(t)=\frac{\sum_jc_j\,r(t)^j}{\sum_jc_j},\qquad c_j=\operatorname{Var}(h_j).$$
Proof: the posterior factorises; a product of $|S|$ phases has conditional second moment $r^{|S|}$;
different products stay orthogonal (rotate a torsion and its observation jointly). The frame transfer
across a torsion is linear in its phase, so $b_k\cdot b_{k+m}$ is multilinear in the $m-1$ torsions
between; $|x_j-x_i|^2$ and $R_g^2=N^{-2}\sum_{i<j}|x_i-x_j|^2$ are sums of such products ⇒ chain
geometry is erased *before* the torsions that build it. Effective degree $\log R/\log r\approx\tfrac23(m-1)$.

### 2.11 Information is conserved; charts move it (note 30 §3)

$D_{\rm KL}(P\Vert Q)$ is the same in every injective chart; terminal term negligible
($\alpha_1^2\approx5\times10^{-5}$); the time-integrated objective is asymptotically efficient (note 25
§6.2) ⇒ "no chart buys statistical efficiency; the gains to expect are in optimisation and capacity at
a fixed budget". A chart changes only the **profile** $S_Q(t)$, its **share** of the reducible loss,
and the **access** (which function of the noisy channels the network must compute).

### 2.12 Proposition 2 — constraint directions and their split (note 30 §4)

Blocks of ranks $d_A$, $d_B$, joint rank $d$: the joint normal space contains
$\mathcal N_A\oplus\mathcal N_B$ plus **constraint directions** $\mathcal C$, $\dim\mathcal C=d_A+d_B-d$.
BBA: $d_A=78$, $d_B=3K$, $d=81$ ⇒ $3K-3$ = 3, 9, 21, 78 for K = 2, 4, 8, 27 (K = 1: $d$ drops by one;
one constraint, the length). As $\sigma\to0$ (smooth positive density on the image), the excess loss in
block A of the optimal predictor reading A only, over reading both, tends to $\sum_c|P_An_c|^2$; same
for B; the two add to $\dim\mathcal C$ ("one unit of predictable noise per example and direction").
For one constraint $g$ (block channel as a graph over A's image), $n\propto(-\nabla g,1)$:
$$|P_An|^2=\frac{L^2}{1+L^2},\qquad |P_Bn|^2=\frac{1}{1+L^2},\qquad L=|\nabla g|.$$
**"The louder block leaves the correction to the quieter one."** $L^2$ scales with the square of the
block scale: ≈ 1 whitened, ≈ 16 natural, ≈ 63 at twice natural amplitude ⇒ predicted internal share
0.50 / 0.94 / 0.98 (derived here).

### 2.13 Where the size information goes; size response per mode (note 30 §5)

Gaussian chain with independent isotropic modes $X_p$ of variance $\lambda_p$ per component, tilt
$e^{-\eta R_g^2}$, $R_g^2=\sum_p|X_p|^2/N$: to first order $\delta\langle|X_p|^2\rangle=-6\eta\lambda_p^2/N$,
so mode $p$ carries the share $\lambda_p^2/\sum_q\lambda_q^2$ of the response of $\langle R_g^2\rangle$.
BBA spectrum (15.0, 6.0, 2.9, 1.3, 0.49, …) ⇒ 83% mode 1, 96% modes 1–2 (I reproduce 0.829 and 0.962
from the first five eigenvalues). Contrast: share of *mean squared size* $\lambda_p/\sum\lambda$ =
56% (mode 1), 78% (modes 1–2), 93% (modes 1–4).

### 2.14 What a loud block cannot supply — formulas (note 30 §7)

- Missing smooth energy $U$: excess noise-prediction loss $\sigma^2\,\mathbb E|\nabla U|^2$ to leading order
  — small at the floor ($\sigma^2\approx0.002$).
- Handedness: the invariants of two vectors $|a_1|,|a_2|,a_1\cdot a_2$ are reflection-symmetric; a
  signed triple product needs three: $\chi=a_1\cdot(a_2\times a_3)/(|a_1||a_2||a_3|)\in[-1,1]$.
- Soft forces at read-out: a tilt $\theta h$ changes the optimal noise prediction by $-\sigma\theta\nabla h$
  along the image ⇒ per-example information about θ ∝ σ², error of a soft force from one level ∝ $1/\sigma$.
- Joint rebuild = small-noise posterior mode = projection onto the image in the chart's metric [D].

### 2.15 Notes 28 and 29 (supporting)

- Note 28: $\epsilon^*(y,t)=(y-\alpha_t\mathbb E[Z\mid y])/\sigma_t$; $\nabla_y\mathbb E[Z\mid y]=\frac{\alpha_t}{\sigma_t^2}\operatorname{Cov}(Z\mid y)$;
  loss = approximation error + $\frac{\alpha_t^2}{\sigma_t^2}\mathbb E\operatorname{tr}\operatorname{Cov}(Z\mid Y)$ ⇒ raw ε-loss is not
  comparable across maps. Redundant flat subspace: $\epsilon^*=\sigma_ty_T+y_N/\sigma_t$,
  $\nabla H^*=\frac{\alpha_t}{\sigma_t}y_N$ — "redundancy does not remove stiffness, it converts finite tangent
  stiffness into diverging normal stiffness"; $1/\sigma_t^2$ ≈ 502 at $t=0.01$, 332,342 at $3\times10^{-5}$.
  Sufficient condition: factor out conditional fast fluctuations, $p(s,r)=p_s(s)N(r;\mu(s),LL^\top)$ ⇒
  $z=L(s)^{-1}(r-\mu(s))$ has score $-z$ at every time. Checklist §7 item 1: resolve intended fluctuations
  (`observable_resolution`); the condition number of $g$ is the wrong target.
- Note 29: $\hat F(x)=k_BT\big[D\varphi^\top s_{t_*}(\varphi(x))+\tfrac12\nabla_x\log\det G\big]$, normal score
  component $O(\sigma^{-2})$ discarded by $D\varphi^\top$; volume term mandatory (omitting it shortened ALDP5
  bonds by 0.30–0.36 thermal widths); rotation-invariant maps use $\det G_Q$ plus the orbit factor; maps
  with rotating channels use the immersion volume (the distinction behind the #1100 correction).

### 2.16 The readable-window estimator (note 27 §4) — the recipe

2,000 held-out frames encoded with the runs' encoders, one noise draw per query reused at all levels
(common random numbers), 12 levels from 0.01 to 0.7 plus lower ones. Observables: each bond, angle,
torsion (cos, sin); Rg, end-to-end, distances between beads far apart (pooled and mean), contact count
(< 10 Å), two slowest TICs. Estimators (all functions of $Y_t$ ⇒ floors): (i) **exact empirical
posterior mean** with weights $w_i\propto\exp(-\|y_t-\alpha_ty_0^{(i)}\|^2/2\sigma_t^2)$ over all
1,300,156 training frames in float64, also after orthonormal projection on top 4/8/16 principal axes;
(ii) plug-in decode of $y_t/\alpha_t$ or the linear Wiener estimate, raw and cross-fitted affine-calibrated;
(iii) ridge read-out with quadratic terms (fitted on 30,000 fresh noised frames); a small neural
read-out in verification. Envelope = best held-out $R^2$, then running max over higher levels; 300
bootstraps; ~0.01 selection optimism; $t_{1/2}$ interpolated. Traps: temporal-neighbour leakage
(C3 Rg $R^2$ at $t=0.05$: 0.82 with no exclusion, 0.34 / 0.14 / −0.03 excluding ±10 ns / ±100 ns /
±1 µs; ±1 µs used); weight collapse in 103-d (median ESS 1) vs ≈ 700 in Cartesian; estimator-dependent
floors (a stronger read-out raised C3's Rg window 0.23 → 0.27–0.28); never clip.

### 2.17 Sampler and read-out formulas

- **Late repulsion** (`samplers/late_repulsion.py`): for $t\le t_{\rm on}$ and in the final step,
  $\epsilon\to\epsilon+\sigma_t\lambda\nabla_y\Phi(y_0)$, $y_0=(y-\sigma_t\epsilon)/\alpha_t$ (Tweedie),
  $\Phi=\sum_{|i-j|\ge3}\mathrm{relu}(r-d_{ij})^2$ on the unit-phase chain rebuilt from the internal block;
  presets λ = 30 Å⁻², r = 3.6 Å, $t_{\rm on}=0.02$ (study) and λ = 10, $t_{\rm on}=0.0125$ (#1065 C3). A
  sampler setting, never part of a model's force.
- **Corrector**: one unadjusted Langevin step after every reverse step below $t_c=0.05$, snr 0.16
  (Song et al. rule), "gentle" = half step.
- **Equilibration**: plain to $t_{\rm eq}=0.05$, $K_{\rm eq}$ MALA steps under the model density (+ fitted
  correction), move = all | torsions; then production tail.
- **Joint rebuild**: minimise $|w\odot(\phi(x)-y)|^2+\text{strength}\sum_{|c_i-c_j|\ge3}\mathrm{relu}(\text{core}-d_{ij})^2$
  over bead positions (Levenberg–Marquardt, 160 iterations, core 3.6 Å, strength 100 Å⁻²).
- **Force read-out** (range-and-order §7.2): $F_t(x)=J^\top\alpha s(\alpha\phi(x),t)+\nabla\log\mathrm{vol}(x)$.

### 2.18 Measures and the effect rule

W1 = 1-D Wasserstein; torsion error = circular W1 averaged over 25 torsions; contact error = mean
absolute error of $P(d<10$ Å$)$ over pairs ≥ 3 apart; population JS on the plane of the two slowest TICs
(floor 0.037 at 20,000 molecules, 0.0087–0.0095 at 100,000); overlap = share with a pair ≥ 3 apart
closer than 3.5 Å; severe = closer than 1 Å. **Effect rule** (#1069, adopted by the study): a
difference counts only if the difference of seed means exceeds the largest two-seed difference of the
same candidate.

---

## 3. Worked analytical examples

1. **Linear modes of BBA (note 27 §3).** Cartesian modes (Å/6.252): variances 15.5, 6.2, 3.0, 1.3 →
   $t_{1/2}$ 0.53, 0.44, 0.37, 0.29; smallest 0.011 → 0.028. (My evaluation of the formula gives
   0.526, 0.440, 0.368, 0.284, 0.0285 — the last-but-one differs in rounding because the quoted 1.3 is
   rounded.) The largest four carry 93% of mean squared Rg.
2. **Partial-whitening table (note 27 §3; #1057 screen, closed form).**
   | γ | largest/smallest variance | first mode $t_{1/2}$ | last mode $t_{1/2}$ |
   |---|---|---|---|
   | 0 | 1,423 | 0.53 | 0.028 |
   | 0.25 | 232 | 0.50 | 0.065 |
   | 0.5 | 38 | 0.45 | 0.13 |
   | 0.75 | 6.1 | 0.37 | 0.20 |
   | 1 | 1 | 0.26 | 0.26 |
3. **Bond and Rg loudness in Cartesian (derived here; matches #1057 §2.2).** Bond spread 0.057 Å,
   $|\nabla b|^2\approx2$, features $x/6.252$: $\ell=0.057^2/(2\cdot6.252^2)=4.2\times10^{-5}$ →
   $t_{1/2}=0.00040$ (#1057: predicted 0.00040, measured 0.00042). Rg spread 2.2 Å, $|\nabla R_g|^2=1/N$:
   $\ell=2.2^2N/6.252^2=3.47$ → $t_{1/2}=0.383$ (#1057: 0.39 predicted vs 0.47 measured — first order
   underestimates global windows in Cartesian).
4. **Channel variance dial (#1057 §2.6).** $v$ = 1, 0.3, 0.1, 0.03 ⇒ $t_{1/2}$ = 0.26, 0.16, 0.09, 0.05.
5. **Single torsion under phase noise (note 30 table; derivation §2.8 here).** κ = √2: $r$ = 0.94,
   0.72, 0.53 at $t$ = 0.1, 0.2, 0.26 (also 0.985 at 0.05, 0.852 at 0.15, 0.415 at 0.3, 0.128 at 0.45;
   derived here).
6. **Chain model, degree attenuation (note 30 §2; lab 2026-11-18).** 28 beads, 3.8 Å bonds, fixed bond
   angle (110° for uniform torsions), 25 iid uniform torsions, exact posterior means, 20,000 queries:
   | $t$ | one torsion | $b_k\cdot b_{k+4}$ | $b_k\cdot b_{k+12}$ | $b_k\cdot b_{k+26}$ | end-to-end² | $R_g^2$ |
   |---|---:|---:|---:|---:|---:|---:|
   | 0.1 | 0.94 | 0.87 | 0.62 | 0.36 | 0.72 | 0.84 |
   | 0.2 | 0.72 | 0.47 | 0.08 | 0.004 | 0.25 | 0.44 |
   | 0.26 | 0.53 | 0.25 | 0.01 | 0.000 | 0.12 | 0.25 |
   Check: $b_k\cdot b_{k+2}$ (one torsion) matches single-torsion readability within 0.001. With the
   effective degree $\tfrac23(m-1)$, $0.716^{7.3}\approx0.087$ for $m=12$ at $t=0.2$ (derived here; table
   0.08). Construction details for exact recomputation are in `lab/2026-11-18-range-order-mechanisms/chain_model.py`
   (frame-transfer matrices $a+\cos\tau\,b+\sin\tau\,c$; $E[b_k\cdot b_l\mid Y]=\ell^2[(a+b)\prod E[M(\tau_j)\mid Y]]_{00}$
   by independence).
7. **Chain model, collapse vs constraint signals (note 30 §§4–5).** Collapsed law $P\propto P_0e^{-\eta R_g^2}$,
   η bisected so mean Rg falls 0.9 Å (relative entropy 0.0766 nats uniform, 0.0883 two basins).
   Block = first Rouse mode vector at library scale. Per-example signals: learning the collapse in the
   internal chart is worth 0.0005 noise-prediction units at $t=0.01$ (0.25σ² for $t\le0.035$), at most
   0.049 near $t=0.2$; learning the constraint is worth 0.92 at $t=0.01$, 0.80 at 0.1, 0.38 at 0.2
   (8–1,800× more, lab). Integrated signals recover the KL within 3% in every arm.
   | chain model | whitened block | natural | 2× amplitude |
   |---|---:|---:|---:|
   | internal block's gain from reading the block, $t\le0.05$ | 0.43–0.55 | 0.85–1.03 | 0.90–1.09 |
   | block's gain from reading the internal block | 0.43–0.56 | 0.06–0.09 | 0.02–0.03 |
   | share of collapse information learned in block channels | 0.48 | 0.88 | 0.91 |
   | $R_g^2$ half readable up to $t$ (internal alone: 0.17) | 0.22 | 0.41 | 0.53 |
   Prediction from Prop. 2: 0.50/0.50, 0.94/0.06, 0.98/0.016 (derived here). Natural-block collapse
   information sits mostly at $t\approx0.35$–0.6, where torsions are already erased.
8. **Ideal chain given only the $|a_1|$ marginal (note 30 §5).** Rg W1 0.90 → 0.066 Å (93% removed);
   that marginal carries 93% of the relative entropy. Mode lengths follow a Gaussian 3-vector law within
   0.063 and 0.008 nats; standardised Rg is 0.30 nats from Gaussian — the block's marginal is *simpler*
   than Rg itself.
9. **Size cost in nats (note 27 §6).** A 0.43 Å shift of mean Rg at spread 2.2 Å costs
   $0.43^2/(2\cdot2.2^2)\approx0.02$ nats.
10. **Constraint-direction count and channel count (§2.9, §2.12).** $3K-3$ and $K(K+1)/2+\binom K3$.
11. **Excluded volume as a range failure (note 30 §7; lab table).** Closest non-neighbour distance:
    first-order loudness 0.003 in the internal chart → $t_{1/2}\approx0.013$ (derived check: 0.0130),
    just above $t_{\min}=0.01$; blur at the floor 0.32–0.36 Å vs the margin between the data's 1% point
    (3.9 Å) and the 3.5 Å test. Two loud vectors: blur 0.22 Å; eight at loudness 15: 0.09 Å. Contact blur
    by K (median, contact pairs ≥ 5 apart, < 6 Å; #1101): at $t=0.01$ 0.37 Å (K = 0), 0.32 (1), 0.22 (2),
    0.16 (4), 0.15 (8, 27); at 0.05: 1.46, 1.24, 0.85, 0.62, 0.58, 0.57 Å.
12. **Torsion lever arm (#1100).** At $t=0.05$ each torsion is blurred by 6.6°, moving distant beads by
    ≈ 1 Å through a 5–10 Å lever arm; contacts would need ≈ 1° (level ≈ 0.005).
13. **Note 28 scalar examples.** Predictable label fraction $\tau^2/(\lambda+\tau^2)$, $\tau=\sigma/\alpha$; required
    residual slope peaks at $\tau=\sqrt\lambda$ with coefficient $(1-\lambda)/(2\sqrt\lambda)$ ≈ 13.5 for BBA
    spring channels $\lambda=1/27.12^2$ (reproduced 13.54). Line vs helices with equal metric
    ($b=0.1$, frequencies 4, 16, σ = 0.1): posterior variance 0.01 vs ≈ 0.50. OU increments (stiffness 1
    and 100, lag 10⁻⁴): increment covariance condition 1.005 vs equilibrium 99.5.
14. **Lag-shaped noise (note 25 Prop. 2).** Half erasure at $\sigma^2/\alpha^2=1/(1-e^{-2\tau/t_k})$; for
    $t_k=(0.008,0.03,0.5,3.1)$ ps at τ = 1 ps: (1, 1, 1.02, 2.12), a spread of 2.1 against 400 under flat
    noise — a physically motivated order dial (slowest first, everything faster than τ together).
15. **Spring base collapses the chain (#1025).** Torsion MC, fixed mean bonds/angles: data 10.59 ± 2.20
    Å; free torsions 10.34 ± 2.26; isotropic Gaussian base 5.41 ± 0.51; rotation-averaged covariance
    $K\otimes I_3$ 10.71 ± 1.92.
16. **Loud block magnitudes (derived here).** RMS $|a_1|=\sqrt{3\cdot15.0}/c_0\approx42.7$ Å; mode 1 in
    feature units readable to $t_{1/2}(15.0)=0.52$, mode 8 (0.13) to 0.106 (#1057: "about 0.5 for mode 1
    and 0.1 for mode 8").

---

## 4. Key empirical results (BBA unless stated)

### 4.1 Measured readable windows (note 27 §5; #1055 verified; training $t\in[0.01,1]$)

| Observable | Cartesian | C3 internal | C1 |
|---|---|---|---|
| bond lengths | 0.0004 | 0.26 | 0.26 |
| bond angles | 0.05 | 0.35 | 0.33 |
| torsions | 0.08 | 0.35 | 0.29 |
| radius of gyration | 0.47 | 0.27–0.28 | 0.35 |
| long-range pair distances, pooled | 0.44 | 0.24 | 0.33 |
| long-range contact count | 0.38 | 0.23 | 0.31 |
| end-to-end distance | 0.45 | 0.18 | 0.31 |
| slowest TIC | 0.36 | 0.49 | 0.46 |

C3's slowest TIC is the exception (a sum over many torsions and short-range distances).

### 4.2 First-order windows of the loud-mode chart (lab 2026-11-18-range-order-mechanisms)

| observable | Cartesian | Internal | +2 loud | +2 whitened | +8 at loudness 15 |
|---|---:|---:|---:|---:|---:|
| bond lengths | 0.000 | 0.26 | 0.26 | 0.26 | 0.26 |
| torsions | 0.06 | 0.33 | 0.34 | 0.33 | 0.39 |
| distances 3 apart | 0.05 | 0.30 | 0.31 | 0.31 | 0.37 |
| distances 7–10 apart | 0.14 | 0.22 | 0.27 | 0.24 | 0.41 |
| distances ≥ 11 apart | 0.22 | 0.16 | 0.29 | 0.21 | 0.46 |
| end-to-end | 0.29 | 0.14 | 0.24 | 0.18 | 0.47 |
| radius of gyration | 0.38 | 0.19 | 0.44 | 0.27 | 0.48 |
| closest non-neighbour | 0.012 | 0.013 | 0.025 | 0.019 | 0.068 |

First-order loudness in the internal chart falls with sequence separation: torsions 2.0, distances 3
apart 1.5, 7–10 apart 0.6, ≥ 11 apart 0.3, end-to-end 0.2. Helix-like order parameter
$\sum_k\cos(\tau_k-50^\circ)$: loudness 8.8 ($t_{1/2}$ 0.47), corr. with Rg −0.41 (why measured C3 Rg window
exceeds first order). Additive read-out of the noise-free internal block explains 38% of Rg variance,
23% of long-range distances, 9% of end-to-end; adding the block's three invariants: 98%, 82%, 72%; at
$t=0.3$: 23% vs 83% for Rg. Constraint directions of the 2-vector block lie 74%, 87%, 96% in the internal
block (median of 1,200 frames); whitened 27/44/68%; twice as loud 92/97/99%.

### 4.3 Published correlated noise is ordered but lacks range (lab 2026-11-16, #1099)

| $t_{1/2}$ | Bond | Angle | Torsion | Rg | Long-range | Contacts |
|---|---:|---:|---:|---:|---:|---:|
| Cartesian VP | 0.0004 | 0.022 | 0.048 | 0.47 | 0.42 | 0.35 |
| Chroma-style, ideal chain | 0.0032 | 0.077 | 0.16 | 0.24 | 0.23 | 0.090 |
| Chroma-style, globular | 0.0029 | 0.073 | 0.16 | 0.24 | 0.22 | 0.095 |
| fully data-matched covariance | 0.0049 | 0.11 | 0.23 | 0.21 | 0.23 | 0.092 |
| C3 internal | 0.26 | 0.35 | 0.35 | 0.27–0.28 | 0.24 | 0.23 |
| internal + 2 loud (block alone floor) | 0.26* | 0.35* | 0.35* | ≥ 0.42 | ≥ 0.37 | ≥ 0.33 |
| EigenFold (own clock) | 0.0016 | 0.27 | 0.84 | 215 | 142 | 79 |

EigenFold has five decades of order (Cartesian three); no correlated Cartesian noise gives bonds a usable
window. Block alone at $t=10^{-3}$ explains 96% of Rg's spread.

### 4.4 Trained tests at 50,000 updates (20,000 molecules/seed)

**Two-block γ family (#1057; one seed per row unless stated)**

| map | bond (Å) | angle (°) | torsion (°) | Rg W1 (Å) | TIC JS | overlap | screen Rg $t_{1/2}$ |
|---|---:|---:|---:|---:|---:|---:|---:|
| γ = 1 (C1, s0/s1) | 0.0008 | 1.63/1.64 | 9.7/10.4 | 0.499/0.514 | 0.107/0.106 | 48%/46% | 0.20 |
| γ = 0.5 (P2) | 0.0007 | 1.66 | 6.5 | 0.187 | 0.083 | 21% | 0.43 |
| γ = 0.25 (D1) | 0.0006 | 1.68 | 7.1 | 0.120 | 0.081 | 18% | 0.46 |
| γ = 0 (D2) | 0.0005 | 1.76 | 9.1 | 0.081 | 0.086 | 23% | 0.48 |
| Cartesian + distances (s0/s1) | 0.0125/0.0133 | 2.38/2.19 | 7.1/6.9 | 0.109/0.073 | 0.046/0.045 | 4.3%/4.5% | (0.47 meas.) |
| pure modes γ = 0.5 (P1) | 0.0046 | 1.99 | 5.4 | 0.277 | 0.049 | 3.6% | 0.42 |

Size falls at every step; populations, torsions, contacts do not follow; removing order from Cartesian
(P1) raises its size error 0.09 → 0.28 Å while bonds improve. Monitors: from 5,000 updates each arm's
size error sits in a band set by γ (C1 0.43–0.46, P2 0.20–0.24, D1 0.16–0.19, D2 0.09–0.12 Å).

**Block size (#1057, #1069; seed means; one seed for 1, 16, 27)**

| vectors appended to C3 | 0 | 1 | 2 | 4 | 8 | 16 | 27 |
|---|---:|---:|---:|---:|---:|---:|---:|
| angle W1 (°) | 0.23 | 0.26 | 0.27 | 0.36 | 0.42 | 0.57 | 1.25 |
| torsion error (°) | 0.90 | 0.86 | 0.94 | 1.18 | 1.54 | 4.15 | 11.0 |
| Rg W1 (Å) | 0.477 | 0.161 | 0.105 | 0.136 | 0.152 | 0.325 | 0.399 |
| overlap | 14% | 19% | 21% | 27% | 23% | 28% | 29% |
| derived input channels (derived here) | 0 | 1 | 3 | 14 | 92 | 696 | 3,303 |
| constraint directions | 0 | 1 | 3 | 9 | 21 | 45 | 78 |

27 vectors: folded share 0.038, mean Rg 10.41 Å (too compact), block not a valid chain (bond error 1.1 Å).
Block agreement for 2 vectors: $R^2$ 0.93/0.95, slope 0.97/0.98 (I8: $R^2$ 0.79). Matched Gaussian base for
an 8-vector block: Rg W1 0.338 Å (no gain; unexplained).

**Main table (range-and-order Table 1, #1069; seeds 0/1)**

| model | bond (Å) | angle (°) | torsion (°) | Rg W1 (Å) | contact | pop. JS | overlap |
|---|---:|---:|---:|---:|---:|---:|---:|
| held-out floor | 0.0005 | 0.12 | 0.57 | 0.016 | 0.0018 | 0.037 | 0% |
| Cartesian + distances | 0.0125/0.0133 | 2.38/2.19 | 7.1/6.9 | 0.109/0.073 | 0.0081/0.0070 | 0.046/0.045 | 4.3%/4.5% |
| C3 | 0.0007/0.0006 | 0.23/0.23 | 0.85/0.95 | 0.493/0.462 | 0.0130/0.0135 | 0.046/0.044 | 14.8%/12.5% |
| internal + 2 loud | 0.0006/0.0007 | 0.26/0.27 | 0.94/1.09 | 0.106/0.110 | 0.0094/0.0085 | 0.045/0.044 | 24.4%/17.2% |
| … late repulsion | same | same | same | 0.135/0.126 | 0.0105/0.0098 | 0.045/0.044 | 2.0%/1.3% |
| … + gentle corrector | 0.0010/0.0011 | 0.32/0.35 | 1.31/1.60 | 0.043/0.064 | 0.0097/0.0098 | 0.045/0.044 | 1.1%/0.4% |

**Skeleton-and-arrows (#1068, seed 0)**: A30m completed 16,794/20,000; bond 0.0008 Å, angle 2.03°,
torsion 7.90°, Rg W1 0.077 Å, contact 0.0088, TIC JS 0.060, overlap 7.1%. I8-low ($t_{\min}=0.001$) overlap
21.0% (vs 27.0%/18.2% at 0.01).

### 4.5 C3 with sampler fixes (no retraining)

| C3, seeds 0/1 | Rg W1 (Å) | long-range bias (Å) | overlap | angle (°) | bond (Å) |
|---|---|---|---|---|---|
| plain (20k, #1065) | 0.51/0.47 | +1.26/+1.18 | 14.6%/12.5% | 0.24/0.24 | 0.0006/0.0007 |
| full equilibrium + hard core (#1065) | 0.07/0.08 | −0.09/+0.14 | 2.1%/1.3% | 0.41/0.43 | 0.0012/0.0013 |
| torsion-only 2,000 steps (4k, #1073) | 0.05/0.12 | +0.09/+0.29 | 1.8%/1.2% | 0.38/0.37 | 0.0011/0.0011 |
| torsion-only + stabilised size weight (20k, #1090) | 0.053/0.093 | +0.06/+0.21 | 1.9%/1.4% | 0.226/0.233 | 0.0006/0.0007 |

(The 4,000-molecule rows have a higher angle floor; compare within a source.)

### 4.6 Registered budget, 190,350 updates, 100,000 molecules (#1071, #1088)

| model | bond (Å) | angle (°) | size W1 (Å) | contacts | population | clashes (< 1 Å) |
|---|---|---|---|---|---|---|
| internal + 2 loud modes (s2/s3) | 0.00038/0.00033 | 0.20/0.19 | 0.117/0.091 | 0.0081/0.0071 | 0.0125/0.0130 | 0.60%/0.66% |
| … late repulsion | 0.0004/0.0003 | 0.21/0.22 | 0.117/0.094 | 0.0091/0.0082 | 0.0126/0.0126 | 0.02%/0.02% |
| native ScoreMD | 0.042/0.042 | 1.58/1.74 | 0.157/0.532 | 0.0116/0.0221 | 0.0209/0.0290 | 0.06%/0.04% |
| Cartesian + distances | 0.0078/0.0093 | 1.58/1.49 | 0.071/0.077 | 0.0061/0.0067 | 0.0129/0.0127 | 0.30%/0.23% |
| Cartesian, covariance-matched base | 0.0053/0.0065 | 1.36/1.30 | 0.073/0.077 | 0.0060/0.0064 | 0.0123/0.0126 | 0.35%/0.18% |
| C3 | 0.00032/0.00034 | 0.21/0.18 | 0.455/0.418 | 0.0135/0.0136 | 0.0138/0.0126 | 0.54%/0.66% |
| wδ | 0.027/0.034 | 1.73/2.12 | 0.062/0.072 | 0.0054/0.0067 | 0.0171/0.0206 | 0%/0% |
| invariant whitening | 0.56/0.62 | 19.6/23.9 | 0.67/0.58 | 0.087/0.067 | 0.157/0.238 | 10.9%/6.9% |

Held-out row (100,000): bond 0.0002, angle 0.05°, torsion 0.26°, Rg 0.006 Å, contacts 0.0008, JS 0.0095.
Extended (#1071 §5.1): mean Rg 10.70/10.66 (data 10.60, C3 11.04, Cartesian 10.68); compact non-native
0.160 (data 0.187, C3 0.127, Cartesian 0.179); long-range bias +0.31/+0.21 Å (C3 +1.16, Cartesian +0.14);
overlap 14.5%/15.3%. Block agreement $R^2$ 0.98, slope 0.99.

**Monitor learning curves (1,000 molecules; Rg W1 Å; #1071 §5.4)**

| model | 0 | 100 | 1,000 | 5,000 | 10,000 | 50,000 | 190,350 |
|---|---|---|---|---|---|---|---|
| loud s2 | 0.546 | 0.823 | 0.304 | 0.245 | 0.265 | 0.107 | 0.073 |
| loud s3 | 0.559 | 0.771 | 0.220 | 0.283 | 0.233 | 0.146 | 0.136 |
| C3 s0 | 0.553 | 0.582 | 0.429 | 0.547 | 0.563 | 0.539 | 0.467 |
| Cartesian s1 | 1.059 | 0.710 | 0.139 | 0.111 | 0.118 | 0.133 | 0.134 |

(1,000-molecule floor: 0.07–0.08 Å.) Bond W1 of internal models is at the 1,000-molecule data level
from step 0 (0.0023–0.0025 Å; Cartesian 10.3 Å at step 0).

### 4.7 Longer training and the full schedule

- 380,700 updates (#1091): loud s2/s3 size 0.117 → 0.120, 0.091 → 0.096; C3 0.455 → 0.468, 0.418 →
  0.432 — no change beyond noise.
- **1,903,500 updates (open PR #1104, 2026-11-18; one seed each):** ordered internal coordinates s2 Rg W1
  0.111 Å; internal coordinates (C3) s0 0.455 Å; bond, angle, contact at floor; joint rebuild + hard
  core: overlaps 11.8% → 0%, Rg W1 0.105 Å; force field at $t=0.05$ with immersion volume term (100 ps,
  512 paths): size error 0.118 Å (190,350-update models 0.24–0.34 Å), 19% overlaps; with the #1109
  correction 0% overlaps, 0.152 Å, pair error 0.033. Paper-style PMF metric (#1138, open): covariance-
  matched Cartesian 0.096, ordered internal 0.097, C3 0.113 kT² (floor 0.080 at 100,000).

### 4.8 Force fields (selected)

- Study panel, pooled 50–100 ps (#1088): loud 0.0038/0.0084 Å bond, 2.8/4.5° angle, 1.14/1.18 Å size at
  levels 0.02/0.01; C3 0.84/1.22 Å; covariance base 1.85/2.59 Å; ScoreMD 3.2/3.5 Å.
- Drift note (#1089, mean of four models, 90–100 ps): 1.26 Å at 0.01, 1.06 at 0.02, 0.69 at 0.05, 0.56 at
  0.05 + repulsion; blur floor at 0.05 only 0.117 Å.
- Corrected volume term (#1100, loud s3, 512 paths, 100 ps): 0.98/0.94 → 0.24/0.30 Å (data/generated
  starts); loud s2 (128 paths, 50 ps) 0.74/0.79 → 0.10/0.31.
- Wall + size correction (#1109, 512 paths, 100 ps): overlaps 21.3% → 0.0% and 18.4% → 0.0%, size error
  0.267 → 0.263 and 0.175 → 0.173 Å, pair error 0.062 → 0.042 and 0.055 → 0.032 (floor 0.037).
- Larger panels (#1130, 2,048 paths): uncorrected mean Rg falls 0.21–0.41 Å between 100 and 300 ps for
  every loud-mode model; size error grows 1.7–2.9×.

### 4.9 Handedness and reverse-path tracking (#1133)

P(χ > 0) by Rg bin (< 8.5 / 8.5–9.5 / 9.5–11 / ≥ 11 Å): training 0.169/0.268/0.371/0.470 (all 0.353);
library loud decode s2 0.196/0.269/0.421/0.485, s3 0.183/0.261/0.416/0.489; C3 s0 0.247/0.251/0.417/0.490;
Cartesian s0 0.162/0.271/0.386/0.473. Verdict on Rg < 9.5 Å: 0.256/0.247 vs 0.249 (rule ±0.03) —
reproduced. Monitors: ≈ 0.5 (no handedness) at 0–1,000 updates, learned by 50,000.

Reverse-path $R^2$ of chain $|a_1|$ on block $|a_1|$ (s2/s3): $t$ = 0.6: 0.13/0.13; 0.45: 0.29/0.26; 0.35:
0.37/0.38; 0.26: 0.43/0.40; 0.2: 0.44/0.42; **0.13: 0.63/0.60**; 0.05: 0.91/0.91; 0.01: 0.97/0.97. Mean
$|a_1|$ block/chain (s2): 21/59 Å at 0.6, 40/41 at 0.13, 40/40 at 0.01. Share of compact molecules already
with final χ sign: 0.55 at 0.6, 0.65–0.69 at 0.45, 0.88 at 0.13. Mid-size deficit (9.5–11 Å, +0.04–0.06):
not local (reweighting to local statistics reproduces −1%/+4%, #1134), single long-range distances
≈ 1/3 (28%/32%, #1139), not the arm's side (11%/10%), coarse quarter-chain dihedral 61%/59% (#1140) — "the
relative orientation of the two halves of the chain".

---

## 5. Why it was promising / why things failed / what was learned

### Derived facts (hold under stated assumptions)
- Readability is a lower-boundable, training-free, non-increasing function of noise; in exact generation
  it is also the fraction already decided (note 27 §1).
- Unit-variance channels put every linear feature at $t_{1/2}=0.26$: prior matching is exactly what erases
  order (note 27 §3; #1057 §2.3).
- In a two-block chart, collective and stiff windows are set by independent dials (two inequalities).
- Products of torsion phases are attenuated as $r^j$: internal coordinates erase chain geometry before the
  torsions (Prop. 1).
- No chart changes the total KL signal for a structure; it moves its profile/share/access (note 30 §3).
- A redundant block creates $3K-3$ constraint directions whose small-noise signal is split
  $L^2/(1+L^2)$ : $1/(1+L^2)$, the quieter block being corrected (Prop. 2).
- For a Gaussian chain, mode $p$ carries $\lambda_p^2/\sum\lambda_q^2$ of the size response (83%/96%).
- Two vectors carry no handedness; excluded volume in the internal chart is half erased at 0.013.

### Measured causal story for BBA
1. **Why springs/whitening failed (#1025/#1026):** springs below the noise floor (range), whitening's
   diverging normal stiffness on 3,225 off-molecule directions (note 28 §4), and — in hindsight —
   unit spread erasing order (C1 has range without order).
2. **Why C3 swells (#1055):** its global and local features are decided in one band (0.18–0.35) where the
   gradient for long-range coupling is negligible; the coupling plateaus after ~1,000 updates; the error is
   made by the learned field at $t\approx0.11$–0.5, not by accumulation along the chain.
3. **Why the loud block works** (note 30; supported by #1057, #1069, #1071, #1104): (i) *order* — size gets a
   band of its own (mode 1 readable to 0.5) and is decided first; (ii) *redundancy/constraint* — at low noise
   the internal block is pushed to follow the louder block (measured on the reverse path: from $t\approx0.13$),
   exchanging a weakly rewarded, high-degree collapse function (0.0005–0.049 per example) for a strongly
   rewarded kinematic relation (0.38–0.92) plus a near-Gaussian marginal; (iii) *simple marginal* — the block's
   lengths are nearly Gaussian, the size marginal alone removes 93% of the size error in the chain model.
   Which of (i) and (ii) dominates is exactly what #1137 is designed to separate (prediction: whitened block
   keeps about half the gain).
4. **Why two vectors** (note 30 §6; Table 3): only two mode lengths are louder than a torsion (6.9, 2.5 vs
   2.0); each further vector adds three constraints without order; input channels balloon; local cost grows
   from four vectors; one vector is not force-ready (no volume term).
5. **Why order alone is not enough** (two-block family): populations and torsions need explicit torsion
   channels; Cartesian has order and still fails locally ("order without range is not enough").
6. **Why range alone is not enough** (C3, C1; skeleton map): range without order loses size; and even with
   both, features that are only *relations* (arrows) are learned poorly ("a feature is learned accurately when
   it is a coordinate of its own").
7. **Why "global structure is carried by the torsions"** (#1073/#1090): moving only torsions at low noise fixes
   ~3/4 of C3's size error at zero local cost; the anti-order of Prop. 1 is why the network struggles to learn
   that coupling by denoising alone.

### Hypotheses (not established)
- The "share of reducible loss" criterion for learning within a budget (note 27 §6, [H]); networks learn
  low-order statistics first, so high-degree torsion products are slowest to learn (note 30 §2, [H]).
- Anti-order should worsen for longer chains (lever arms grow); more loud modes may then be needed (note 30 §7).
- In a redundant chart, order acts through which block is corrected, not only when the block is erased.
- The soft part of a small-noise force is inherited from higher levels through continuity in $t$.

### Later corrections and refinements
- #1055 corrected #1025: C3's swelling is not error accumulation.
- #1026 corrected its own first draft (unscaled Cartesian map; overfitted-probe claim; GPU budget ~10× low).
- #1100 (2026-11-16) corrected the force-field reading of 2026-11-15: most of the loud-mode compaction was a
  wrong volume term; with the immersion volume the loud block helps forces too (see §7).
- #1101 refuted "train lower to get the wall"; #1068's hypothesis that internal models never see contacts
  sharply was only partly supported.

---

## 6. Visualization opportunities

Each item: insight · on screen · computation · data · pitfalls.

1. **The erasure clock (centrepiece).** *Insight:* range and order at a glance. *Screen:* a horizontal log-t axis
   from 10⁻⁵ to 1 (with a log-SNR scale above), the trained band $[0.01,1]$ shaded (and $[10^{-5},1]$ for
   Cartesian); one lane per process (Cartesian, C1, C3, internal + 2 loud, skeleton map, EigenFold, Chroma),
   glyphs for bond/angle/torsion/contacts/long-range/Rg at their $t_{1/2}$; a "floor" line at 0.01 with the
   bond glyph of Cartesian falling off the trained band. *Computation:* none (logged). *Data:* §4.1, §4.3,
   #1068 CPU windows, first-order table §4.2 for the loud chart. *Pitfalls:* all measured values are lower
   bounds; first-order and measured values must not share a lane without marking; EigenFold has its own clock
   (show ratios only); C3's measured Rg window rose 0.23 → 0.27–0.28 with a stronger read-out.

2. **Readability curves $R_h(t)$ as a "fade-out".** *Screen:* curves for each feature class in three panels
   (Cartesian, C3, ordered internal), noisy molecule renderings above at a few $t$ showing which property is
   still visible. *Computation:* analytic for linear modes ($r=\alpha^2\lambda/(\alpha^2\lambda+\sigma^2)$),
   logged envelopes otherwise. *Pitfall:* do not draw full curves where only $t_{1/2}$ is logged; mark
   interpolated segments.

3. **"Forward destroyed = backward decided" mirror.** *Screen:* the same erasure clock run right-to-left as
   generation; features "freeze" in at their $t_{1/2}$; Cartesian freezes size at ~0.47 and never freezes
   bonds inside the band; C3 freezes everything at once around 0.3; ordered internal freezes size first
   (≥ 0.42) then local (0.26–0.35). *Pitfall:* this is exact only for the exact reverse process.

4. **Spectrum fan and the whitening slider.** *Insight:* why whitening kills order. *Screen:* 27 mode curves
   $r_k(t)$ fanning out (Cartesian) and collapsing to one curve as γ → 1; readout of first/last $t_{1/2}$ and
   variance ratio (1,423 → 1). *Computation:* closed form from the BBA mode spectrum. *Data:* only the top
   values are documented (15.5, 6.2, 3.0, 1.3 … smallest 0.011 in Å/6.252; or 15.0, 6.0, 2.9, 1.3, 0.49 in
   library units, mode 8 ≈ 0.13); the full 27-value spectrum must be recomputed from BBA frames with
   `fit_collective_modes` — do not invent intermediate eigenvalues (an ideal Rouse $1/p^2$ law does not
   match: 15 : 3.75 : 1.67 vs 15 : 6.0 : 2.9).

5. **Two dials (two-block map).** *Screen:* a chain sliding on the "surface of correct bonds and angles" while
   mode-shaped noise moves it; two sliders γ and $v$; a mini erasure clock where collective glyphs move with γ
   and bond/angle glyphs move with $v$ (1 → 0.26, 0.3 → 0.16, 0.1 → 0.09, 0.03 → 0.05). *Computation:*
   inequalities $\ell\ge c_\gamma^2\lambda^{1-\gamma}$, $\ell\ge v$. *Pitfall:* torsions have no channel here
   (their window follows γ) — say so.

6. **Dose–response of the order dial.** *Screen:* γ on the x-axis (1, 0.5, 0.25, 0); bars for Rg W1 (0.51,
   0.19, 0.12, 0.08) beside the screened Rg window (0.20, 0.43, 0.46, 0.48), with TIC JS and torsion error
   flat or worsening; an annotation "window shrinks by a tenth, error doubles (γ 0 → 0.5)". *Data:* §4.4.
   *Pitfall:* one seed per γ except γ = 1; populations measured at 20,000 molecules (floor 0.037).

7. **Lever arm.** *Insight:* why internal coordinates erase the whole before the parts. *Screen:* a 28-bead
   chain; jiggle one torsion by a few degrees; distant beads swing (≈ 1 Å for 6.6° at a 5–10 Å arm); then
   jiggle all 25 torsions with phase-pair noise at a chosen $t$ and watch end-to-end distance smear while each
   torsion is still "readable". *Computation:* exact NeRF chain (3.8 Å bonds, 110° angle) — cheap.
   *Pitfall:* the chain model has iid uniform torsions; BBA's torsions are correlated and multi-basin.

8. **Degree attenuation ladder.** *Screen:* curves $r(t)^j$ for j = 1…25, with the chain-model points for
   $b_k\cdot b_{k+m}$ ($m$ = 4, 12, 26), end-to-end², $R_g^2$ overlaid (table §3 item 6); slider $m$ showing
   effective degree ≈ 2(m−1)/3. *Computation:* von Mises closed form for $r$ (Monte Carlo or quadrature),
   `chain_model.py exact` for the overlays (CPU minutes). *Pitfall:* exact only under independence.

9. **Loudness bars.** *Screen:* bars of first-order loudness in the internal chart by sequence separation
   (torsion 2.0, 3-apart 1.5, 7–10 apart 0.6, ≥ 11 apart 0.3, end-to-end 0.2) versus mode-length loudness of
   the loud block (6.9, 2.5, 0.9, 0.6) with a horizontal "torsion line" at 2.0 — two modes poke above it.
   *Pitfall:* mode mean squares (15.0, 6.0) include orientation; size-relevant loudness is the length variance.

10. **The constraint split, as geometry.** *Insight:* the louder block wins and the quieter one is corrected.
    *Screen:* a 1-D data manifold drawn as the graph $y_B=g(y_A)$ in a 2-D (A, B) plane; isotropic noise
    blob; the normal $n\propto(-L,1)$ and its projections onto the A- and B-axes, with bar readouts
    $L^2/(1+L^2)$ and $1/(1+L^2)$; a loudness slider from whitened (L² ≈ 1) to natural (≈ 16) to twice (≈ 63).
    Overlay measured chain-model gains (0.43–0.55/0.43–0.56; 0.85–1.03/0.06–0.09; 0.90–1.09/0.02–0.03) and
    BBA shares (74/87/96%, 27/44/68%, 92/97/99%). *Computation:* exact. *Pitfall:* a small-noise statement.

11. **Same area, different profile (information conservation).** *Screen:* the collapse information density
    $\tfrac12\beta(t)S_Q(t)/\sigma_t^2$ vs $t$ for internal-only, whitened block, natural block; all enclose
    0.0766 nats; the natural block's area sits at $t\approx0.35$–0.6 in block channels (88%), whitened 48%.
    *Computation:* `chain_model.py signal` (CPU, heavier: 1,200 queries × 4,000 draws × 14 levels per arm).
    *Pitfall:* chain model, smooth size potential, no contacts — mechanism, not BBA numbers.

12. **Signal per example: collapse vs constraint.** *Screen:* log-scale bars at $t$ = 0.01, 0.1, 0.2: collapse
    0.0005 → ≤ 0.049; constraint 0.92, 0.80, 0.38. *Pitfall:* per-example loss units, not learning speed.

13. **Where size lives in the spectrum.** *Screen:* stacked bars of $\lambda_p/\sum\lambda$ (56%, 22%, 11%, 5%)
    versus $\lambda_p^2/\sum\lambda^2$ (83%, 13%, 3%, …) — "two modes carry 96% of the size response"; overlay
    trained "share of C3's size error removed" (one vector 66%, two 78% at 50,000 updates). *Pitfall:*
    different measures; agreement qualitative (note 30 says so).

14. **Mode shapes on the protein.** *Screen:* BBA (hairpin beads 0–12, helix 14–25) with mode 1 as a smooth
    arrow field (sign change after bead 14, 88% aligned with hairpin–rest separation), mode 2 ends-vs-middle;
    Rouse cosines overlaid (overlaps 0.99, 0.99). *Computation:* from BBA frames or Rouse cosines (the latter
    need no data). *Pitfall:* on Chignolin the order of the two modes swaps.

15. **Block size sweet spot.** *Screen:* x = number of vectors (0, 1, 2, 4, 8, 16, 27); curves for Rg W1
    (U-shape with minimum at 2), torsion and angle error (rising), and annotations for derived input channels
    (0 … 3,303) and constraint directions (0 … 78); "breaks" at 27 (folded 0.038). *Data:* §4.4 table.
    *Pitfall:* one seed at 1, 16, 27; global gain is a tie for 1–8 by the effect rule.

16. **Reverse-path tracking ("the chain follows the block").** *Screen:* generation movie of a molecule:
    the loud block's $|a_1|$ (a "skeleton bar") settles early; the rebuilt chain wobbles until $t\approx0.2$
    and locks on by 0.13; side plot of $R^2$ (0.13 → 0.97) and mean $|a_1|$ (block 21 vs chain 59 Å at 0.6,
    meeting at 0.13). *Data:* #1133 table. *Pitfall:* denoised estimates are posterior means (not samples);
    at high noise their difference is by construction.

17. **Handedness is decided early and carried by torsions.** *Screen:* χ as the signed volume of the frame
    $(a_1,a_2,a_3)$; P(χ > 0) by size bin for data vs models; reverse-path P(χ > 0) already ≈ final at
    $t=0.45$; mid-size gap localised to the relative orientation of the two halves (coarse dihedral 61%).
    *Pitfall:* χ is near zero for coplanar frames; the deficit is 0.04–0.06 in one bin.

18. **Excluded volume is a range failure.** *Screen:* the erasure clock for the closest non-neighbour distance:
    0.013 (internal), 0.025 (+2 loud), 0.068 (+8 at loudness 15) vs floor 0.01; blur 0.32–0.36 Å against the
    3.9 → 3.5 Å margin; contact blur vs K at 0.01 and 0.05 (§3 item 11); "training lower doesn't create the
    wall" (wall z 15 → 15 at 0.05). *Pitfall:* overlaps depend on the 3.5 Å threshold.

19. **Late repulsion and joint rebuild.** *Screen:* the final 150 of 1,000 steps highlighted on the geometric
    grid; overlap share 24.4% → 2.0% (repulsion) and 14.5% → 0.0% (joint rebuild + hard core) with Rg W1
    0.117 → 0.083 Å. *Pitfall:* the repulsion changes the sampler, not the model; zero overlaps are enforced by
    construction in the joint rebuild (3.6 Å core vs 3.5 Å test).

20. **Global structure lives in the torsions.** *Screen:* a chain with bonds/angles as rigid sticks and
    torsions as swivels; torsion-only MALA at $t=0.05$ compacts a swollen C3 molecule; scoreboard Rg W1 0.48 →
    0.05, angle 0.38 → 0.38 (vs full equilibration 0.03 with angle 0.50). *Pitfall:* the size weight of the
    final recipe is fitted against data.

21. **Coordinate vs relation (skeleton and arrows).** *Screen:* even beads as loud skeleton, odd beads as
    arrows; scorecard: what is a coordinate of its own (bonds 0.0008 Å, size 0.077 Å) vs what is a relation
    (torsion 7.9° despite a window of 0.20–0.26). *Pitfall:* one seed; failed molecules (4–18%) counted.

22. **Two halves, one model (Pareto plot).** *Screen:* log-log scatter of local error (angle W1) vs global
    error (Rg W1) for all candidates at 190,350 updates (§4.6), with the ordered model in the lower-left
    corner, C3 high on global, Cartesian/ScoreMD high on local; animated arrows for the 50k → 190k → 1.9M path
    of ordered internal (0.106/0.110 → 0.117/0.091 → 0.111) and C3 (0.48 → 0.455 → 0.455). *Pitfall:* do not
    mix 20,000- and 100,000-molecule panels (different floors); one seed at 1.9M.

23. **"Changes where training ends" learning curves.** *Screen:* monitor Rg W1 vs updates (log x) for loud
    s2/s3, C3, Cartesian (§4.6) with the 1,000-molecule floor band 0.07–0.08 Å. *Pitfall:* 1,000-molecule
    monitors are noisy (seeds swap order at 100,000 molecules).

24. **Prediction ≠ learning (windows as a screen).** *Screen:* scatter of torsion window vs torsion error: C3
    (0.35, 0.9°), skeleton (0.20–0.26, 7.9°), Cartesian (0.08, 7.1°), two-block family; caption "readable is
    necessary, not sufficient". *Data:* note 27, range-and-order insight 10.

25. **The readability estimator, opened up.** *Screen:* a noisy query in feature space with nearby training
    frames weighted by $\exp(-\|y-\alpha y_0\|^2/2\sigma^2)$; ESS counter (≈ 700 Cartesian vs 1 in 103-d);
    leakage demo: Rg $R^2$ 0.82 → 0.34 → 0.14 → −0.03 as ±10 ns/100 ns/1 µs neighbours are excluded.
    *Pitfall:* this is the trap section — show why exclusion is needed.

26. **Order from a physical lag (note 25).** *Screen:* half-erasure levels vs relaxation time for flat noise
    (spread 400) vs lag-shaped noise (1, 1, 1.02, 2.12). Connects the Sprint 11 "thermal metric" story to
    range/order.

27. **Force read-out and the volume term.** *Screen:* stationary mean Rg predicted by reweighting with the
    wrong vs right volume factor (9.58 vs 10.66 Å) and simulated size error 0.98 → 0.24 Å; then 100 → 300 ps
    drift (all models compact). *Pitfall:* the status page (2026-11-14/15) still says the loud block gives no
    gain in simulation — superseded (§7).

28. **What the block cannot supply (four panels).** Wall (range), handedness (two vectors are mirror
    symmetric), kinematics (generated block/chain mismatch 2.8× floor, still shrinking 0.744 → 0.043 over
    training), soft forces (information ∝ σ²). Each with its number from §2.14/§4.

---

## 7. Open questions, caveats, contradictions and superseded readings

- **Loud block in simulation (2026-11-15 vs 2026-11-16/18).** status.md and the study (#1088) say "the loud
  block gives no further gain in simulation" (1.14 vs 0.84 Å), and #1089/#1091 analyse a compaction of all four
  internal-family force fields. Lab 2026-11-16-bba-force-field-diagnosis (#1100) found that three quarters of
  the *loud-mode* compaction came from using the rotation-invariant volume formula on a map that keeps
  orientation; with the immersion volume its 100 ps size error falls 0.98 → 0.24 Å, and the loud models'
  learned score at $t=0.01$ lacks C3's compaction bias. Note 30 (2026-11-18) and the full-schedule panel
  (0.118 Å, #1104) follow the corrected reading. The status page in the 2026-11-19 snapshot does not mention
  the correction. Even corrected, all loud-mode force fields keep compacting between 100 and 300 ps (#1130).
- **Linearised Rg window of C3: 0.30 vs 0.19.** Note 27 §3 (2026-11-12/14): "a linearised estimate through
  the decoder Jacobian … overestimates global windows in internal coordinates: 0.30 predicted against 0.23
  measured for the radius of gyration". Note 30 §2 and the lab (2026-11-18): first-order loudness gives 0.19,
  which *underestimates* the measured 0.27–0.28 (explained by loud secondary-structure content). The two
  linearisations differ (decoder Jacobian vs averaged $G^+$); visualizations should not mix them.
- **Long-range pair count.** Note 27 §4 says "the 136 distances between beads at least 11 apart"; for 28 beads
  there are 153 pairs with $|i-j|\ge11$ (136 is $|i-j|\ge12$) (derived here); the EigenFold lab entry uses 153.
- **Unit conventions.** Note 27 mode variances (15.5, 6.2, …) are in Å/6.252; note 30 and PR #1137 (15.0,
  6.0, …) in library units $c_0=0.157$ Å⁻¹ (1/c0 = 6.37 Å).
- **Status table's "Internal + two loud modes" overlap 21%** is the seed mean of 24.4%/17.2% at 50,000
  updates; at 190,350 it is 14.5%/15.3% (#1071).
- **50k "matches Cartesian on every global measure" (#1069) vs 190k "narrowly behind on size and contacts"
  (#1071/#1088):** the Cartesian model keeps improving with training; the candidate's size does not
  (0.106–0.110 → 0.091–0.117 → 0.111). Whether the gap closes is open; one seed at 1.9M.
- **Readable windows predict ranking, not magnitude**, and failed for torsions of the skeleton map
  (insight 10). Q4 of the study (pre-training prediction for all candidates) was not tested.
- **Order vs redundancy not separated.** The chain model predicts a whitened two-vector block keeps ≈ half the
  gain (block share 0.48 vs 0.88; split 0.5 vs 0.94); #1137 is declared (rule: retained share
  $f=(R_{C3}-R_{\rm whitened})/(R_{C3}-R_{\rm natural})$, supports if 0.2 ≤ f ≤ 0.8 on both seeds) but not
  run as of 2026-11-18.
- **Why larger blocks cost local accuracy** (input channels vs redundancy) and **why the matched base did not
  help** are not isolated.
- **Excluded volume** cannot be read from any trained level of this family (#1101); it must be supplied
  (joint rebuild hard core, late repulsion, fitted wall). Whether the 3.6 Å core distorts near-contacts was not
  checked.
- **Mid-size handedness deficit** (0.04–0.06 in 9.5–11 Å) lives in the relative orientation of the two
  chain halves; a third loud vector would carry handedness but needs training and is "not motivated by a 0.05
  deficit alone".
- **Statistical caveats.** Two seeds for most claims (seed spreads in pilots up to 0.085 Å in size error);
  frame-level random split (held-out ≈ in-sample); populations at 20,000 molecules sit near the floor 0.037;
  pooled Rg W1 is a weak readout (the untrained internal model has the data's mean size through self-overlaps);
  the late-repulsion setting (λ = 30, $t\le0.02$) was preferred after seeing results, then confirmed on fresh
  seeds; C3's equilibration size weight is fitted against data; 100 ps simulations are far from BBA's µs
  folding.
- **Transfer.** Block directions transfer via Rouse modes; the size scale $c_0$ (needs ⟨Rg²⟩) and the internal
  whitening still need target data (#1129). Only BBA has been tested; Chignolin is next; ALDP5 cannot test order.
- **Novelty.** Ordered noising of molecules exists (EigenFold, Chroma, inverse-RG diffusion, NeuralPLexer,
  La-Proteina); a literature search on 2026-11-18 found no model noising internal coordinates together with
  redundant collective channels — "an absence of evidence, not a proof" (note 30 §8).

---

## 8. Sources read

**Theory (read in full):** `docs/theory/27-readable-windows-and-noise-order.md`,
`docs/theory/30-loud-blocks-in-redundant-charts.md`, `docs/theory/28-score-ease-and-thermal-preconditioning.md`,
`docs/theory/29-score-to-force-pullback.md`; parts of `docs/theory/26-information-retention.md` (Props. 1–4,
harmonic case, width probe) and `docs/theory/25-information-geometry-lag-noise-posterior.md` (Prop. 2).

**Status and plans:** `docs/status.md` (full); `docs/sprints/sprint12/real-budget-study.md` (full, incl.
results); `docs/sprints/sprint12/candidates/internal.md`, `candidates/theory-and-evidence.md`,
`docs/sprints/sprint12/linear-retention.md`.

**Investigations (read in full):** `docs/investigations/bba-range-and-order.md`,
`bba-local-geometry-preconditioning.md`, `bba-internal-loud-modes-first-chunk.md`,
`bba-c3-local-accuracy-screening.md`, `bba-internal-force-field-size-drift.md`,
`bba-internal-force-field-longer-training.md`; `sprint12-network-inputs-and-baselines.md` (main parts).

**Lab entries (`lab/…/README.md`):** 2026-11-16-readable-windows-noise-precedents,
2026-11-18-range-order-mechanisms (+ `chain_model.py`, `bba_charts.py`), 2026-11-16-loud-mode-block-consistency,
2026-11-16-loud-mode-joint-rebuild, 2026-11-17-loud-mode-joint-rebuild-excluded-volume,
2026-11-17-bba-loud-mode-library-rerun, 2026-11-16-bba-force-field-diagnosis, 2026-11-16-bba-low-noise-continuation,
2026-11-17-bba-simulation-fitted-wall, 2026-11-17-bba-wall-fit-size-term, 2026-11-18-bba-loud-mode-equilibration,
2026-11-18-bba-loud-mode-force-size-followup, 2026-11-18-loud-mode-handedness, 2026-11-18-loud-mode-transfer-checks,
2026-11-18-handedness-gap-torsions, 2026-11-18-handedness-gap-long-range, 2026-11-19-handedness-gap-arm.

**Library code:** `src/riemanniangenerativemd/geometry/loud_mode_coordinates.py`, `chain_coordinates.py`,
`internal_chain.py`, `loud_mode_rebuild.py`, `mode_handedness.py`, `immersion_volume.py`;
`samplers/late_repulsion.py`; grep of `samplers/low_noise.py` (geometric grid) and `config/feature_space.py`.

**Archived note via git (read-only):** `docs/investigations/bba-noise-order-partial-whitening.md` at commit
`0a6f66d0` (#1057 head), Sections 1–5.

**GitHub PRs (gh pr view):** #1025, #1026, #1055, #1057, #1064, #1068, #1069, #1073, #1079 (bodies); #1104
(open; full-schedule results and docs diff), #1137 (open; whitened-block test, declared), #1136, #1113 (open,
planned), #1138 (open; ScoreMD PMF read-out), #1092 (open); dates of #926, #985, #1010, #1012, #1015, #1023,
#1033, #1065, #1071, #1088–#1091, #1099–#1102, #1105, #1107, #1109, #1115, #1128–#1133.

**Checks run (scratchpad, CPU, seconds):** `.../scratchpad/checks/r6_checks.py` — schedule values,
$t_{1/2}(\lambda)$ for the BBA spectrum, channel-variance table, loudness → $t_{1/2}$, size-response shares,
constraint-split shares, geometric-grid step indices, note-28 peak slope, single-torsion readability under
phase noise (κ = √2 and 1.504), derived channel and constraint counts, Cartesian bond/Rg loudness, $c_0$.
