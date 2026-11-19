# r7 · The current frontier (2026-11-14 → 2026-11-19): ordered internal coordinates, their force fields, and what is still missing

Reader report for the visualization project. Sources: the riemannian-generative snapshot of `origin/main` up to #1140 (2026-11-19), all 17 lab entries in `lab/`, theory notes 27, 29 and 30, the investigation and study documents of the BBA line, the open PRs #1092, #1104, #1113, #1127, #1136, #1137 and #1138 (full bodies, comments and relevant diffs), the merged PRs #1071–#1140 and the issues #283, #1094–#1096 and #1117–#1124. Numbers are quoted exactly from the sources named next to them. Anything I computed myself is marked **(derived here)** or **(checked here)**; the small numeric checks are in `scratchpad/checks.py` and `checks2.py`.

---

## 0. Names, units and conventions used throughout

- **BBA**: the 28-residue fast-folding mini-protein from the DESRES set, one bead per C-alpha (28 beads). 1,300,156 training frames and 325,039 held-out frames, split at random by frame from the same trajectories (so held-out is "close to in-sample"). Data mean radius of gyration (Rg) 10.60 Å, 90th percentile 13.7 Å, deciles 8.60 / 9.89 / 13.74 Å; 0.004–0.01% of frames have an "overlap". BBA folds on microsecond time scales.
- **C3 = "internal coordinates"** (renamed on 2026-11-16 in open PR #1104; main's documents still say C3): 103 features, namely 25 torsions as phase pairs $\kappa(\cos\tau,\sin\tau)$ with $\kappa=1.504$, plus 27 log bond lengths and 26 $\log\tan(\theta/2)$, with fitted mean and full covariance, Cholesky-whitened; "unit-phase" distance inputs; NeRF decoder (`bba-range-and-order.md`, Implications §1).
- **Loud-mode model = "internal + 2 loud collective modes" = "ordered internal coordinates"** (map `internal_loud_modes`): C3's 103 features plus two 3-vectors $c\,a_1, c\,a_2$ (109 features). "Loud" means the mode vectors are left at their natural, large spread instead of being whitened.
- **Executed vs library models.** "Executed" = the PR #1071 runs (seeds 2 and 3) from run-evidence scripts on source snapshot `9e04aba5`. "Library" = the same recipe trained by the maintained driver (seeds 2 and 3 in PR #1115, seed 4 in PR #1130). The sign of mode 1 differs between them (an eigenvector sign set by the host's linear algebra in the executed class).
- **Budgets**: 50,000 updates (pilots), 190,350 (the registered Sprint 12 budget, 10% of the schedule), 380,700 (PR #1091), 1,903,500 (the full cosine schedule). Batch 1,024, AdamW 3·10⁻⁴ cosine to 10⁻⁵, EMA 0.995, symmetry transformer 128 × 3 layers.
- **Noise**: variance-preserving (VP) schedule $\beta(t)=0.1+19.9t$, trained on $t\in[0.01,1]$ for internal-family maps, $[10^{-5},1]$ for Cartesian-family maps.
- **Metrics**: W1 = Wasserstein-1 distance between generated and reference distributions. Bond W1 (Å), angle W1 (°), torsion error (circular W1 averaged over the 25 torsions, °), **size error** = Rg W1 (Å), contact error (mean absolute error of $P(d<10\,\text{Å})$ over pairs at least 3 apart), population JS (Jensen–Shannon divergence on the plane of the two slowest TICA coordinates, nats), **overlap share** (molecules with two beads at least three positions apart closer than 3.5 Å), severe collision (closer than 1 Å).
- **Effect rule** (fixed in PR #1069): a difference between two recipes counts only if the gap between their seed means exceeds the largest two-seed difference of either recipe.
- **Force field**: the model's learned score at a small noise level $t$, converted to a force on the beads; Langevin dynamics at 325 K, 2 fs steps, friction 1/ps, 12.011 Da per bead. A "panel" is N walkers from data frames plus N from the model's own generated molecules; "size error at 100 ps" is Rg W1 over the last 10 ps window.

---

## 1. Narrative

### 1.1 Where things stood on 2026-11-14: the range-and-order decision

The status page's entry of 2026-11-14 ("Range and order: what the noising coordinates must provide", `docs/status.md`) changed the working hypothesis of Sprints 11–12. Sprint 11's goal had been *stiffness removal*: maps in which every motion of the molecule has similar size, so that Gaussian noise treats them alike. On the 5-bead dipeptide ALDP5 that worked (bonds and angles learned 10 to 100 times sooner than Cartesian diffusion). On the 28-bead BBA it split the molecule in two halves:

| BBA, 50,000 updates, 20,000 molecules, two seeds (status, 2026-11-14) | Bond (Å) | Angle (°) | Size, Rg W1 (Å) | Overlap |
|---|---:|---:|---:|---:|
| Held-out data (the floor) | 0.0005 | 0.12 | 0.016 | 0% |
| Cartesian with pair-distance inputs | 0.013 | 2.3 | 0.09 | 4% |
| Cartesian, covariance-matched base | 0.009 | 1.9 | 0.08 | not scored |
| Internal coordinates (C3) | 0.0007 | 0.23 | 0.48 | 14% |
| Internal + two loud collective modes | 0.0007 | 0.27 | 0.11 | 21% |
| … sampled with a late repulsion | 0.0007 | 0.27 | 0.13 | 1.7% |

The diagnosis chain behind it (PRs #1010–#1015, #1025, #1026, #1055, #1057, #1064, #1069; consolidated as `docs/investigations/bba-range-and-order.md`, PR #1079, merged 2026-11-16) produced two requirements:

- **Range**: every property must stay readable (not yet erased by noise) somewhere inside the trained noise levels. Cartesian noise fails this for bond lengths, which are half-erased at $t=0.0004$.
- **Order**: properties should be erased at different noise levels, large-scale shape last, so that generation decides the fold before the detail. Internal or whitened coordinates fail this: everything is erased between $t\approx0.18$ and $0.35$.

The test was to leave the chain's two largest collective modes loud. In a two-block family whose whitening exponent $\gamma$ interpolates between whitened and Cartesian collective modes, the size error fell monotonically, 0.51 → 0.19 → 0.12 → 0.08 Å for $\gamma$ = 1, 0.5, 0.25, 0 (#1057). Appending two loud mode vectors to C3 kept C3's local geometry and fixed the size on two seeds (#1069). Larger blocks cost local accuracy (8 vectors: torsion error 1.4–1.7°; 16: 4.2°; 27: 11°). **Decision**: keep stiffness removal for the stiff coordinates (bonds and angles scaled to their thermal width, so they are readable), and leave a small set of collective coordinates loud so that they are erased last. It was stated as a hypothesis to be tested at the registered budget.

Two companion threads were already in flight: **sampler repairs** for C3 (#1065: a gated late hard core and a fitted low-noise equilibration; #1073/#1090: torsion-only equilibration) and the **skeleton-and-arrows map** (#1068), a single invertible map with range and order that was refuted on 2026-11-14/15 by its own rule (torsion error 7.9° against a limit of 6.5°, although size 0.077 Å and bonds were right).

### 1.2 2026-11-14 → 11-15: the registered-budget test (#1071, #1088)

PR #1071 (launched 2026-11-14, about 30 H200 GPU-hours) trained the loud-mode model on two *fresh* seeds (2 and 3, never used to choose anything), C3 seed 0 and a second Cartesian seed, to 190,350 updates. The full Sprint 12 study (PR #1088, plan merged as #1072 on 2026-11-14, results in `docs/sprints/sprint12/real-budget-study.md` revision 5, 2026-11-15) then scored all 22 models at 190,350 updates on 100,000 molecules each, and used every model as a force field in a new 512-walker, 100 ps panel.

**Generation** (100,000 molecules, two seeds "a / b"):

| Candidate | Bond (Å) | Angle (°) | Size (Å) | Contacts | Population | Clashes |
|---|---|---|---|---|---|---|
| **Internal + 2 loud modes** | **0.00038 / 0.00033** | **0.20 / 0.19** | 0.117 / 0.091 | 0.0081 / 0.0071 | **0.0125 / 0.0130** | 0.60% / 0.66% |
| … with the late repulsion | 0.0004 / 0.0003 | 0.21 / 0.22 | 0.117 / 0.094 | 0.0091 / 0.0082 | 0.0126 / 0.0126 | **0.02% / 0.02%** |
| Native ScoreMD (reference) | 0.042 / 0.042 | 1.58 / 1.74 | 0.157 / 0.532 | 0.0116 / 0.0221 | 0.0209 / 0.0290 | 0.06% / 0.04% |
| Cartesian + distance inputs | 0.0078 / 0.0093 | 1.58 / 1.49 | 0.071 / 0.077 | 0.0061 / 0.0067 | 0.0129 / 0.0127 | 0.30% / 0.23% |
| Cartesian, covariance-matched base | 0.0053 / 0.0065 | 1.36 / 1.30 | 0.073 / 0.077 | 0.0060 / 0.0064 | 0.0123 / 0.0126 | 0.35% / 0.18% |
| Internal coordinates (C3) | 0.00032 / 0.00034 | 0.21 / 0.18 | 0.455 / 0.418 | 0.0135 / 0.0136 | 0.0138 / 0.0126 | 0.54% / 0.66% |
| wδ | 0.027 / 0.034 | 1.73 / 2.12 | 0.062 / 0.072 | 0.0054 / 0.0067 | 0.0171 / 0.0206 | 0% / 0% |
| Trajectory springs | 0.40 / 0.35 | 7.9 / 6.9 | 0.130 / 0.065 | 0.0142 / 0.0104 | 0.047 / 0.034 | 0.14% / 0.18% |
| Invariant whitening | 0.56 / 0.62 | 19.6 / 23.9 | 0.67 / 0.58 | 0.087 / 0.067 | 0.157 / 0.238 | 10.9% / 6.9% |

(One-seed rows without distance inputs: learned warp, one-frame lag 0.48 / 7.1 / 0.249; 100-frame lag 0.64 / 8.6 / 0.249; Cartesian + linear correction 0.40 / 5.7 / 0.129; springs + correction 0.25 / 7.1 / 0.206; whitening + correction 0.75 / 14.2 / 1.90, with 18% of requested molecules lost.)

The loud-mode candidate was the only one near the best on both scales: bond errors 17 to 120 times and angle errors 6.8 to 10 times below every Cartesian-family model and ScoreMD, 76% of C3's size error removed, populations tied with the best Cartesian models. Against the Cartesian models it was narrowly behind on size (seed means 0.104 against 0.074 Å) and contacts. Its pre-registered "Cartesian-level global structure" criterion (Rg W1 ≤ 0.11 Å) was met on seed 3 (0.091) and missed on seed 2 (0.117). Doubling to 380,700 updates later (PR #1091) changed none of this; C3's size error stayed at 0.42–0.47 Å, so "the mode block changes where training ends, not only how fast it gets there" (`bba-internal-loud-modes-first-chunk.md`).

**Simulation** (256 walkers from data, pooled 50–100 ps, two force levels per family): internal-coordinate force fields were the best of the study, keeping bonds at the panel floor (0.003–0.004 Å) and angles at 1.9–2.9°, but every model drifted in size: loud modes 1.14 / 1.18 Å (levels 0.02 / 0.01), C3 0.84 / 1.22 Å, covariance base 1.85 / 2.59 Å (10⁻⁴ / 10⁻³), ScoreMD 3.2 / 3.5 Å, Cartesian + distance inputs 7.9 / 4.7 Å. The study's reading on 2026-11-15 was "**the loud block adds nothing in simulation**". (That reading was overturned on 2026-11-16, see 1.5.)

### 1.3 2026-11-15 → 11-16: the drift is a compaction, and more training does not fix it (#1089, #1091)

PR #1089 (`bba-internal-force-field-size-drift.md`, 2026-11-15, criteria committed before the runs) localized the drift in the stored trajectories and scanned force levels:

- **It is a compaction, not a swelling.** In 15 of 16 rows the mean Rg ends 0.6–1.7 Å below the data's. Bonds change by less than 0.007 Å and the 1–3 distance by at most 0.1 Å, the 1–4 distance (set by one torsion) shrinks by up to 0.54 Å and long-range distances by 1.4–3.2 Å: a chain-wide tightening of turns. About half of it is a population shift from open (Q < 0.2) to folded and compact states (folded share 0.21–0.46 against the data's 0.19), half is shrinking within states.
- **Overlaps appear within the first picosecond** (9–18%) and stay flat; they are not the trigger.
- **A higher read-out level helps on every measure up to 0.05**: mean size error at 90–100 ps 1.60, 1.26, 1.12, 1.06, 0.90, 0.69 Å at $t$ = 0.005, 0.01, 0.015, 0.02, 0.03, 0.05, while the blur floor (real molecules noised to $t$ and rebuilt) is only 0.045, 0.048, 0.052, 0.057, 0.073, 0.117 Å. Adding the late repulsion as an energy term at 0.05 gave 0.56 Å with 2–3% overlaps; both C3 models came within 0.3 Å of the data, the loud-mode models stayed about 0.85 Å too compact.
- **It does not level off within 500 ps** (size error still growing by 0.23–0.55 Å between 100 and 500 ps; folded share 1.7 to 3.3 times the data's).
- The interpretation then was: "an error of the learned force at small noise levels."

PR #1091 (2026-11-16) continued the four models to 380,700 updates: at $t=0.02$ the size error changed by −0.11, +0.15, −0.23 and +0.03 Å — **no under-training effect**; only local angles sharpened. Its conclusion: "the error sits in the learned density at small noise levels and is not closed by the same objective trained longer"; remedies would need Fokker–Planck consistency, more weight at small noise, or a fitted correction.

### 1.4 2026-11-16: consolidation, a new lab workflow, new names, and the full-schedule decision

On 2026-11-16 the twelve consolidated research-line PRs (#1075–#1086) and the study PRs (#1071, #1088–#1091) merged. Sprint trackers were retired and work moved to issue steering (#1093). PR #1097 created the `lab/` area: one folder per experiment with a YAML-headed result card (question, hypothesis, baseline, the single change, evaluation level smoke/pilot/matched, verdict supports/refutes/inconclusive/dead-end, evidence), merged by its author if it touches only its folder ("tier A"); the PR's motivation was about 150 PRs in 12 days, 74 still open. Three issues framed the frontier: #1094 (why do BBA internal force fields drift compact?), #1095 (excluded volume and size without sampling-time repairs?), #1096 (which candidates go to the full schedule; does the account hold on Chignolin?).

The owner chose five models for the full 1,903,500-update schedule after seeing stage 1 (an amendment, the plan allowed three by the effect rule): ordered internal coordinates (seed 2, from 380,700), internal coordinates (seed 0, from 380,700), invariant whitening, the covariance-matched Cartesian base and native ScoreMD (seed 0, from 190,350), on one H200 node plus an A100, chained 24-hour jobs (open PR #1104, card `s12-bba-full-schedule`). PR #1104 also introduced the names "internal coordinates" and "ordered internal coordinates".

### 1.5 2026-11-16: three quarters of the loud-mode compaction was a wrong volume term (#1100)

Lab entry `2026-11-16-bba-force-field-diagnosis` (PR #1100, verdict **supports**) asked whether the compaction is in the learned score or in the conversion from score to force. It found both kinds of error and separated them:

1. **Wrong volume term (loud-mode model only).** Converting a feature-space score to a bead force needs $\tfrac12\nabla\log\det G$ (theory note 29). The executed code used the formula valid for *rotation-invariant* maps, $\tfrac12[\log\det(J^\top J+P_{rot}+P_{trans})-\log\det(\text{inertia})]$. The loud-mode map has channels that rotate with the molecule, so it embeds all 81 centred degrees of freedom and the correct factor is $\tfrac12\log\det(J_c^\top J_c)$. The difference is about $-\tfrac12\log\det(\text{inertia})$, a spurious log-density that grows as the molecule shrinks: an inward force of about 0.6 kT/Å on Rg. Reweighting data frames by the ratio of the two factors predicts the ensemble the wrong term makes stationary — mean Rg 9.58 Å instead of 10.66 Å — without any simulation; the study's simulations ended at 9.6 to 9.7 Å. **With the correct term the 100 ps size error of loud seed 3 fell from 0.98 to 0.24 Å (512 paths), and seed 2 no longer compacts.**
2. **The learned score is accurate from level 0.05 upward** by a simulation-free stationarity (Stein) test: on noised inputs no observable of the four models deviates by more than about three standard errors at levels 0.05–0.4. At 0.01–0.02 C3 has a learned compaction bias on both seeds (Rg residual −4.6 ± 0.5 and −2.8 ± 0.5 at 0.01), the loud-mode models do not (+1.9 ± 0.8, +2.3 ± 0.7): "direct evidence that the loud block also helps forces."
3. **No excluded-volume wall in any model at any level.** The wall observable fails the Cartesian test at about 15 standard errors for all four models. At level 0.05 each torsion is blurred by 6.6°, which moves distant beads by about 1 Å through their lever arm.
4. **A correction fitted on data alone passes the test and fails in simulation** (negative result). A 155-term pair-distance and torsion energy, fitted in closed form so that the data become stationary, brought the test's root-mean-square z from 7–15 to 0.7–0.8 on held-out molecules, removed all overlaps in simulation, but worsened size and pair distances for every model (e.g. loud s3 size error 0.47/0.32 Å, C3 s0 1.17/1.26 Å). "Making the data stationary is a local condition": it cannot stop a too-stable compact state that the data never visit.
5. **Best read-out on that day**: level 0.05 with the correct volume term, nothing else (size error 0.10–0.31 Å at 50 ps on both loud-mode seeds; C3 0.17–0.42 Å) but 18–21% overlaps; a repulsion-only wall of 23 kT/Å² below 4 Å removed the overlaps and made the molecule slightly too large.

It also stated the core dilemma of the force read-out: one noise level cannot give the whole force. Higher levels learn the size balance but blur each torsion (and contacts) in proportion to $\sigma$; lower levels see contacts but carry learned errors and only weak collective signal.

### 1.6 2026-11-16/17: can the wall be learned at lower noise? No (#1101)

Lab entry `2026-11-16-bba-low-noise-continuation` (PR #1101, verdict **refutes**) continued both loud-mode checkpoints for 50,000 updates with the lowest training level lowered from 0.01 to 0.003 and half of each batch below 0.05 (11.2 GPU-hours). The network did learn the low levels (wall z on *noised* inputs at 0.005 fell from 5.4 to 1.3 and 6.3 to 2.3), but the **wall error at clean molecules did not move** (z before → after at 0.005: 9.9 → 9.6 and 9.1 → 8.9; at 0.05: 14.8 → 15.1 and 15.0 → 15.0), and at low levels the size balance was unreadable (Rg z at 0.005: +9.7 / +15.1). Generation was unchanged except worse angles. A training-free blur calculation explains why: features with noise variance $v$ fix the molecule only up to a Gaussian with covariance $v(J^\top J)^+$, so a contact distance is smeared by $\sqrt{v\,g^\top(J^\top J)^+g}$; for K = 2 loud modes this is 0.85, 0.22, 0.13 and 0.05 Å at levels 0.05, 0.01, 0.005 and 0.001. The wall error falls only slowly with the blur (15, 13, 11.5, 9 standard errors at 0.85, 0.38, 0.22, 0.13 Å), suggesting the wall is sharper than about 0.1 Å, which needs a level near 0.001 where the size balance cannot be read. More loud modes do not help (with 27 modes the wall z at 0.05 is still 14 and Rg z −32.7). **Conclusion: stop trying to obtain the wall from the score; supply it separately.**

### 1.7 2026-11-16/17: the generated block knows the size — use it in the rebuild (#1102, #1105, #1107) and promote everything into the library (#1103, #1108, #1110, #1111)

The loud-mode model generates 109 numbers but the molecule was rebuilt from the 103 internal numbers only; the two mode vectors were thrown away.

- **#1102 (`loud-mode-block-consistency`, refutes)**: generated blocks and rebuilt molecules disagree by 0.42 / 0.43 Å RMS per bead at the median, against 0.15 / 0.16 Å for real molecules noised to $t=0.01$ and denoised by the model (the model's own floor) and 4.54 Å with no agreement; 2.8 times the floor at the median and 4.5–4.9 times at the 95th percentile, with a heavy tail (99%: 2.89 / 2.62 Å). The 10% most mismatched molecules contain 2.5 times the panel's share of overlaps (35.8% / 39.7% against 14.5% / 15.3%). The mismatch was still shrinking at the end of training (median ratio 0.744 at update 0, 0.085 / 0.113 at 50,000, 0.043 / 0.047 at 190,350).
- **#1105 (`loud-mode-joint-rebuild`, refutes on its overlap condition)**: fitting the 28 bead positions to all 109 numbers by Levenberg–Marquardt brought size and contacts to the Cartesian level (Rg W1 0.117 / 0.091 → 0.077 / 0.064 Å; contact error 0.0081 / 0.0071 → 0.0070 / 0.0064; Cartesian 0.071 / 0.077 Å and 0.0061 / 0.0067), kept local accuracy, and rebuilt real molecules more accurately (median distance to truth 0.32 → 0.25 Å per bead). But overlaps rose from 14.5% / 15.3% to 19.4% / 20.1%: "the fit knows nothing about excluded volume."
- **#1107 (`loud-mode-joint-rebuild-excluded-volume`, supports)**: adding the hard core $100\,\text{Å}^{-2}\sum\text{relu}(3.6\,\text{Å}-d_{ij})^2$ to the fit removes every overlap (0.0% / 0.0%) and keeps 78–85% of the size gain (Rg W1 0.083 / 0.070 Å), contact error 0.0075 / 0.0068, unchanged bond/angle/torsion errors. The control without the block (internal + core) removes overlaps but worsens size (0.131 / 0.105 Å), so the block is what helps. "**This is the first rebuild of generated BBA molecules that reaches Cartesian-level size, internal-level local accuracy and no overlaps at the same time, without retraining or regenerating.**"
- **Library promotions on 2026-11-17**: #1103 (loud-mode map and `log_immersion_volume`, with a brute-force pushforward check; finding that a single mode vector is not an immersion), #1108 (`JointRebuild`, rotation-equivariant damping), #1110 (driver map `internal_loud_modes`, `sampling.rebuild: joint_hard_core`), #1111 (unit-phase distance inputs, one shared immersion-volume formula). On 2026-11-18: #1114 (late repulsion), #1116 (Langevin corrector, MALA equilibration), #1125 (`rg-sample --fit-correction`), #1135 (mode-frame handedness χ and raking).

### 1.8 2026-11-17: a wall fitted against simulations — first it swells, then a size term fixes it (#1106, #1109)

Following #1101's advice, the wall was fitted against *simulations* (relative-entropy minimization: adjust coefficients until simulated averages of the basis functions equal the data averages), with the diffusion force as a fixed base.

- **#1106 (`bba-simulation-fitted-wall`, refutes)**: 26 coefficients (a wall $\sum\max(0,4\,\text{Å}-d)^2$ and Gaussian bumps at 3.5–7.5 Å in five classes of sequence separation), fitted on seed 3 with 128 persistent paths over 31 rounds of 10 ps (iterations 0–30; final coefficients = mean over iterations 21–30). The fit converged (mismatch 35.3 → 0.04; overlaps in fitting frames 27.3% → 0.0%; wall coefficient 34.3 kT/Å² against 18.2 in the data-only fit), but fresh 100 ps simulations **swelled**: mean Rg 11.31 Å (seed 3) and 11.13 Å (seed 2, using seed 3's coefficients), data 10.60 Å, with the excess in the extended tail (upper decile 14.7–15.4 Å against 13.7). Reading (marked as interpretation): "the roughly right mean size of the uncorrected read-out came from two errors that offset each other. Overlapping contacts hold the molecule together; once the wall forbids them, the remaining force lets extended molecules expand."
- **#1109 (`bba-wall-fit-size-term`, supports)**: one added Rg term (27 coefficients) and a fit protocol whose state resembles fresh simulations (the oldest tenth of 260 paths restarted from data every round, a start-frame regression correction, then 10 frozen rounds). On full panels (256 + 256 paths, 100 ps): overlaps 21.3% / 18.4% → **0.0%**, size error 0.267 / 0.175 → **0.263 / 0.173 Å** (unchanged), pair-distance error 0.062 / 0.055 → **0.042 / 0.032** (sampling floor 0.037), bond-angle error 1.6 / 1.4° → 0.3 / 0.5°. The size coefficient is weak: −0.161 per Å, an inward pull of 0.16 kT per Å of Rg; in linear response $0.16\times4.8\,\text{Å}^2\approx0.8$ Å, about the swelling it cancels. The wall rose to 39.7 kT/Å². Open: mean Rg still falls during the 100 ps (e.g. corrected, data starts: 10.55 → 10.45 → 10.27 Å in the first, fifth and last 10 ps, seed 3).

### 1.9 2026-11-17/18: library rerun, a third seed, larger panels, equilibration (#1115, #1130, #1128)

- **#1115 (`bba-loud-mode-library-rerun`, matched, inconclusive)**: trained, sampled, rebuilt and simulated the candidate with library code only (seeds 2, 3; 26.3 billed GPU-hours). Generation reproduced the executed runs (no measure worse by an effect; population JS better, 0.0118 vs 0.0127): bond 0.00038 / 0.00030 Å, angle 0.213 / 0.180°, Rg W1 0.097 / 0.096 Å, overlaps 18.4% / 14.2%; joint hard core 0.086 / 0.071 Å with 0% overlaps. The uncorrected force field ended at size error 0.272 / 0.337 Å, so seed 3 missed the pre-fixed 0.30 Å limit; with the #1109 correction (fitted on the *executed* seed-3 model and transferred unchanged): 0% overlaps, 0.258 / 0.162 Å, pair error 0.029 / 0.025.
- **#1130 (`bba-loud-mode-force-size-followup`, matched, inconclusive)**: 2,048-path panels run for 300 ps on five checkpoints (library seeds 2, 3, 4; executed seeds 2, 3; 32.4 billed GPU-hours). At 100 ps there is **no recipe effect** (library mean Rg lower by 0.058 Å against a within-recipe spread of 0.071 Å); library seed 3's earlier miss was chance (0.337 Å with 512 paths, 0.277 Å with 2,048). But **all five force fields drift compact**: mean Rg falls 0.21–0.41 Å between 100 and 300 ps and the size error grows 1.7–2.9 times (e.g. library seed 4: 10.38 / 0.221 → 10.12 / 0.483 → 9.97 / 0.631 Å for mean Rg / size error at 100 / 200 / 300 ps). Third seed: generation and joint rebuild reproduce (Rg W1 0.095 decode, 0.077 joint), its 512-path panel misses the limit (0.312 Å) while its 2,048-path panel gives 0.221 Å; the #1109 correction transfers to it.
- **#1128 (`bba-loud-mode-equilibration`, inconclusive)**: the C3-era equilibration samplers on the loud-mode model (20,000 molecules per arm and seed): torsion-only MALA improved Rg W1 over the repulsion-only control (0.123 → 0.087 Å) but cost torsion (+0.53°) and contact accuracy; full equilibration swelled the molecule by 0.28 Å and was worse on every measure; the size fit "has nothing to fit". Since the joint hard-core rebuild reaches the same size accuracy with no overlaps or local cost, equilibration is not carried further for this model. The remaining global errors "are not in the mean size … but in the width of the size distribution and the contact map".

### 1.10 2026-11-18: why the block works (#1131, theory note 30 #1132), where its directions come from (#1129), and how published ordered noising compares (#1099)

- **Readable windows of EigenFold and Chroma (#1099, 2026-11-16, supports)**: no correlated Gaussian noise on Cartesian coordinates gives BBA's bond lengths a usable window (best case, a fully data-matched covariance, half-erases bonds at $t=0.0049$). EigenFold's harmonic diffusion has *more* order than Cartesian noise (five decades between bond and size erasure, against three); Chroma-style chain covariances trade most of the order for 3–8 times wider local windows. Only internal coordinates plus two loud modes have both: local windows 0.26–0.35 and global windows at least 0.33–0.42.
- **Range-order mechanisms (#1131, 2026-11-18, descriptive) and theory note 30 (#1132)**: an exactly solvable 28-bead chain plus first-order geometry of BBA's charts. Three findings: (1) internal coordinates have **anti-order** — chain geometry over many bonds is a product of torsion phases and is erased before the torsions it is built from (Proposition 1); (2) a redundant loud block adds **constraint directions** ($3K-3$ for $K\ge2$ vectors) whose predictable noise is split between the blocks by loudness, so "the louder block leaves the correction to the quieter one" (Proposition 2) — at low noise, learning this kinematic relation is worth about one unit of denoising loss per example and direction, 8 to 1,800 times more than learning the collapse itself in internal coordinates; (3) the block needs only a simple, near-Gaussian marginal, and two modes carry 96% of a Gaussian chain's size response. The block **cannot** supply an excluded-volume wall (the closest non-neighbour distance is half-erased at $t\approx0.013$ in the internal chart), global handedness (two vectors have none), the kinematics for free, or sharp soft forces at the read-out level.
- **Transfer checks (#1129, supports)**: the first two Rouse modes of the chain graph (fixed cosine patterns) span the fitted two-mode subspace almost exactly (principal cosines 0.999 and 0.994 on BBA, 0.996 and 0.990 on Chignolin; 99.6% and 98.7% of the fitted two-mode variance), so **the loud directions need no trajectory**. Size (the mode scale needs $\mathbb E[R_g^2]$) and the internal-block whitening still need data; one-basin quantum curvature could supply bond channels but not pseudo-angles.

### 1.11 2026-11-18/19: the handedness detective story (#1133, #1134, #1139, #1140)

Two mode vectors carry no handedness (their invariants $|a_1|,|a_2|,a_1\cdot a_2$ are mirror-symmetric), but BBA's compact frames are strongly handed: with $\chi=a_1\cdot(a_2\times a_3)/(|a_1||a_2||a_3|)$ from the first three modes, $P(\chi>0)$ is 0.169, 0.268, 0.371, 0.470 in the Rg bins < 8.5, 8.5–9.5, 9.5–11, ≥ 11 Å.

- **#1133 (`loud-mode-handedness`, supports)**: generated molecules reproduce it where it matters most: $P(\chi>0\mid R_g<9.5\,\text{Å})$ = 0.256 / 0.247 against 0.249 — the torsions carry it (C3 does as well: 0.250 / 0.234). The learning curve starts at ~0.5 (no handedness) and reaches the data value by 50,000 updates. A **deficit remains in the 9.5–11 Å bin** for every internal-coordinate model (0.04–0.06; Cartesian 0.015). Secondary, matching theory note 30's prediction: along the reverse path, the chain rebuilt from the denoised internal block first follows the block's $|a_1|$ with $R^2\ge0.5$ at $t=0.13$ (predicted window 0.26–0.1), while population handedness is settled already by $t=0.45$.
- **#1134 (`handedness-gap-torsions`, supports)**: the deficit is not in local shape. Reweighting the 389,263 training frames of the bin to the generated molecules' histograms of size, every torsion, consecutive torsion pairs and bond angles reproduces −1% / +4% of the gap. Cartesian models show the reverse: their small gap is mostly local.
- **#1139 (`handedness-gap-long-range`, inconclusive)**: single long-range statistics reproduce about a third (28% / 32%), located in distances between the hairpin and the helix (beads 6–7 to 18–20); matching only the 181 between-halves distances gives 31% / 38%.
- **#1140 (`handedness-gap-arm`, refutes)**: the side of the helix on which the N-terminal arm lies explains only 11% / 10%. A coarse dihedral of the four quarter-chain centroids (a segment-level counterpart of χ) reproduces 61% / 59%. Conclusion: what the models get less handed is the **relative twist of the two halves of the chain**, "a global degree of freedom of the kind internal coordinates carry only at high order." Recommendation: stop localizing and decide on a remedy (a third loud vector, whose triple product carries handedness), which "a 0.05 deficit in one size bin does not justify" by itself.

### 1.12 2026-11-18/19: full-schedule results, the ScoreMD paper's metric, and the open plans

- **Full schedule (PR #1104, first results logged 2026-11-18)**: ordered internal coordinates (seed 2) and internal coordinates (seed 0) reached 1,903,500 updates. **Generation does not improve with ten times more training**: size error 0.111 Å (0.117 at 190,350; 0.120 at 380,700); internal 0.455 Å. The joint hard-core rebuild takes overlaps 11.8% → 0% and size error 0.111 → 0.105 Å. **The force field does improve**: at $t=0.05$ with the immersion volume term, size error 0.118 Å over 90–100 ps against 0.24–0.34 Å for the 190,350-update models, but 19% overlaps; with the #1109 correction unchanged, 0% overlaps, 0.152 Å, pair error 0.033 ("supports" by #1109's rule, one model). A 300 ps exploratory panel of this checkpoint was declared on 2026-11-18.
- **ScoreMD paper read-out (open PR #1138, 2026-11-18)**: a validated port of the paper's Table 1 metric (PMF error on the TIC plane). At 100,000 molecules: covariance-matched Cartesian base at full schedule 0.096 kT², **ordered internal coordinates at full schedule 0.097**, at 380,700 0.109 / 0.109, internal coordinates (full) 0.113, Cartesian (190,350) 0.116 / 0.113, wδ 0.161 / 0.198, native ScoreMD (190,350) 0.202 / 0.315, springs 0.54 / 0.36, whitening 2.27 / 4.40; **data-vs-data floor 0.080 ± 0.001**. The floor depends strongly on the count (0.56, 0.18, 0.080, 0.039, 0.025 at 20,000 to 325,039; count × floor ≈ 8,000), so these values must not be compared with the paper's 0.034 (conservative diffusion, iid) and 0.234 (ScoreMD iid) at 1,300,156 samples.
- **Declared, not yet run**: #1113 (500 ps with the #1109 correction), #1136 (does the #1109 correction stop the 100 → 300 ps compaction on the five checkpoints? supports if the mean corrected drift is within ±0.08 Å, no model beyond 0.20 Å, overlaps < 2%), #1137 (a *whitened* loud block at 50,000 updates — theory note 30's prediction 1 says it keeps about half the size gain; supports if the retained share $f$ is between 0.2 and 0.8 on both seeds).
- **Other open work**: #1092 (chain-topology attention edges: overlaps fall 5–40%, no drift fix — "the remaining problem lies in how accurately the model learns the small-noise score, not in missing information"); #1127 (a slide-ready leaderboard view of the eight BBA models). Issues opened 2026-11-18 (#1117–#1124) sketch the next generation of ideas: a size-adjusted hairpin "guide" channel, a Fisher-information criterion for choosing guides, a schedule-only intervention on the guide (a clean test of *timing* versus *information*), calibrated commitment along frozen reverse trajectories, a stochastic physical-reference decoder and its conservative force, a soft global guide with a two-stage generator, and transferability (#1124).

### 1.13 The present state, synthesized

**Generation (iid).** Ordered internal coordinates are the only BBA model near the best on both scales: internal-level local geometry (bond W1 ≈ 0.0003–0.0004 Å, angle ≈ 0.18–0.23°, torsion ≈ 0.8°), size 0.09–0.12 Å with the plain decoder (0.070–0.086 Å with the joint hard-core rebuild at 190,350 updates and 0.105 Å at the full schedule; Cartesian models 0.07–0.08 Å), contacts slightly behind Cartesian, populations tied with the best (TIC JS 0.0116–0.0130 at 100,000 against a data floor of 0.0087–0.0091; PMF 0.097 vs floor 0.080). It is reproduced by library code on three seeds and by the full-schedule run. More training changes nothing in generation.

**What remains wrong, by item.**
- *Overlaps*: the model itself overlaps beads in 12–20% of molecules (data 0.005–0.01%). This is a range failure (contacts are erased at $t\approx0.013$) and is fixed only by repairs outside the learned density: the late repulsion (≈1%), the joint hard-core rebuild (0%), or the fitted wall in simulation (0%). Issue #1095 (no repairs) is open.
- *Force-field compaction drift*: after the volume fix and with the #1109 correction, the 100 ps size error is at the panel floor, but **every loud-mode force field keeps shrinking the molecule between 100 and 300 ps** (uncorrected; corrected test #1136 pending). C3's drift (no volume error) is unexplained beyond its low-level bias and the missing wall.
- *Mid-size handedness*: a 0.04–0.06 deficit of $P(\chi>0)$ in the 9.5–11 Å bin, located in the relative twist of the chain's two halves.
- *Populations / equilibrium*: populations are at the level of the best Cartesian models and near the floor in iid generation, but no simulation (≤ 500 ps) can establish equilibrium populations of a microsecond folder.
- *Size distribution width and contact map*: the residual global errors after the rebuild (#1128).
- *Transfer*: directions transfer (Rouse modes), size and internal whitening do not yet; only BBA has been trained.

**Reasons to be optimistic** (detailed in Section 5): the gain is large, reproducible and mechanistically explained; each remaining defect has been localized to something the block was predicted *not* to supply, rather than to a failure of the idea; the repairs are cheap read-out steps that need no retraining; the theory made predictions that were then confirmed on stored models; the directions are the Rouse modes; and a literature search found no generative model that noises internal coordinates together with redundant collective channels.

### 1.14 Dated timeline (2026-11-05 → 2026-11-19)

| Date | What | Outcome |
|---|---|---|
| 11-05 | Status: bead-based conservative energy preferred as backbone (#892) | Architecture preference; map choice left open |
| 11-06/08 | Bead-energy force fields (#957) and candidate re-evaluation (#971) | On BBA no map gives an accurate force; all drift to the same TIC JS |
| 11-09/10 | Sprint 12 study design #979 opened; #985 distance-input screen; #998 native ScoreMD first chunks; #983 matched coordinate results | Pair-distance inputs: Cartesian bond error 0.42 → 0.008 Å; wδ improves |
| 11-10/11 | #1010/#1012/#1015 (what C3 learns), #1025/#1026 (why stiffness removal failed) | C3 swelling = long-range packing error; springs/whitening fail for measurable reasons |
| 11-12 | #1055 C3 mechanism; #1057 loud-mode partial whitening; theory note 27 drafted | Readable windows; size error 0.51 → 0.08 Å along the order dial |
| 11-13 | #1064 (note 27), #1065 (late hard core), #1068 (skeleton map), #1069 (2 loud modes), #1073 (torsion-only equilibration), #1074 (force-field plan) | Two loud modes give both halves at 50,000 updates |
| **11-14** | **Status: "range and order" decision**; roadmap gates; #1072 study plan merged; #1071 launched; ~95 PRs consolidated into #1075–#1086; #1068 refuted | Working hypothesis: thermally scaled stiff channels + small loud block |
| 11-15 | Stage 1 results (#1088); drift diagnosis (#1089); C3 size weight passes at 20,000 (#1090) | Loud mode best of both scales; all force fields compact; t = 0.05 + repulsion halves drift |
| 11-16 | #1091 (380,700 updates: no change); merges of #1071, #1075–#1091; #1093 issue steering; #1097 lab area; full-schedule amendment (#1104); issues #1094–#1096 | Drift is not under-training |
| 11-16 | #1099 EigenFold/Chroma windows; **#1100 volume-term bug**; #1102 block mismatch tail | Loud s3 force size error 0.98 → 0.24 Å with the correct term |
| 11-16/17 | #1101 low-noise continuation; #1105 joint rebuild; #1103 library map + immersion volume | Wall cannot be learned; joint rebuild fixes size, adds overlaps |
| 11-17 | #1107 joint rebuild + hard core; #1108, #1110, #1111 library/driver; #1106 simulation-fitted wall; #1109 wall + size term; #1113 (500 ps) declared | 0% overlaps at Cartesian-level size; fitted wall + size term keeps size, removes overlaps |
| 11-18 | #1115 library rerun; #1114, #1116, #1125, #1126 driver/leaderboard; #1128 equilibration; #1129 transfer; #1130 large panels; #1131 mechanisms; #1132 theory note 30; #1133 handedness; #1134 handedness local; #1135 library χ/rake; issues #1117–#1124; first full-schedule results (#1104); #1136, #1137, #1138 opened | Library reproduces; all models drift past 100 ps; Rouse modes = loud directions; handedness reproduced when compact; full schedule: generation unchanged, force 0.118 Å |
| 11-19 (UTC 11-18 late) | #1139 handedness long range; #1140 handedness arm | Deficit = relative twist of the chain's halves; return to planning on #283 |
| 11-19 (due) | Full-schedule read-outs of the Cartesian base and whitening; native ScoreMD in the evening (#1104) | Pending |

---

## 2. Core mathematics

Each item: formula, symbols, intuition, source.

**M1. The forward process.** $Y_t=\alpha_t\,\phi(X)+\sigma_t\,\varepsilon$, $\varepsilon\sim\mathcal N(0,I)$, $\alpha_t^2+\sigma_t^2=1$, $\beta(t)=0.1+19.9\,t$, $-\log\alpha_t^2=0.1\,t+9.95\,t^2$; $s=\sigma_t/\alpha_t$ is the noise size in units of the clean signal. $\phi$ is the feature map (Cartesian, internal, loud-mode…). *Intuition*: the same isotropic noise applied after different maps is a different "channel" — it erases different properties at different times. Source: theory note 27 §1, §3; note 30 §1. (Checked here: $s^2\approx0.0020$ at $t=0.01$, $0.0303$ at $0.05$, $1.01$ at $0.26$.)

**M2. Readability.** $R_h(t)=\operatorname{Var}(\mathbb E[h(X)\mid Y_t])/\operatorname{Var}(h(X))\in[0,1]$, the fraction of a clean observable's variance still predictable from the noisy input. Any predictor gives a lower bound ($R^2_f\le R_h$); $R_h$ is non-increasing in $t$ (VP noising is Markov); it depends on map and noise law together. **"Destroyed going forward means decided going backward"**: $R_h(t)$ is also the fraction of the final value's variance already fixed by the state at time $t$ during exact generation. Source: note 27 §1.

**M3. Half-erasure level and order.** $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; the readable window is $[t_{\min},t_{1/2}]$. *Range*: every required feature has $t_{1/2}\gg t_{\min}$. *Order*: coarse features erased clearly above fine ones. Source: note 27 §2.

**M4. Closed form for a linear Gaussian direction.** For a direction with data variance $\lambda$ (in units where unit isotropic noise is added): $r(t)=\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)$, half-erased when $\alpha_t^2\lambda=\sigma_t^2$, i.e.
$$t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\,\log(1+\lambda)}}{19.9},\qquad t_{1/2}(1)=0.259 .$$
Only the covariance spectrum is needed. Equivalently **(derived here)**: on the log-SNR axis the half-erasure point is $\log(\alpha^2/\sigma^2)=-\log\lambda$. Source: note 27 §3.

**M5. Feature noise is local whitening; first-order loudness.** Isotropic noise $s^2I$ on features with Jacobian $J$ is, to first order, configuration noise with covariance $s^2(J^\top J)^{-1}$; $G=J^\top J$ is the pullback metric. The first-order *loudness* of an observable $h$ is
$$\ell_h=\frac{\operatorname{Var}(h)}{\mathbb E\big[\nabla h^\top G^{+}\nabla h\big]},$$
and $h$ is half-erased when $s^2=\ell_h$ (so $t_{1/2}=t_{1/2}(\lambda{=}\ell_h)$ from M4). All maps tested before the loud-mode work (#1057, 2026-11-12) scaled every feature to unit variance, giving every feature loudness ≈ 1: "**Unit variance in every direction is what erases the order; the local whitening itself does not.**" Source: `bba-range-and-order.md` §4; note 30 §1.

**M6. The order dial (two-block map).** $\phi(x)=\big(c_\gamma(C_H^{-\gamma/2}\otimes I_3)\,u(x),\;D(q(x)-\mu)\big)$, with $u$ the 27 Helmert vectors of the centred chain, $C_H$ their rotation-averaged second moment, $q$ the stiff coordinates (bonds, angles) whitened by $D$ to channel variance $v_k$. Collective features have loudness $\ge c_\gamma^2\lambda_p^{1-\gamma}$ and stiff features $\ge v_k$: two independent dials. Rescaling modes by $\lambda_k^{-\gamma/2}$ leaves effective variances $\propto\lambda_k^{1-\gamma}$. Source: `bba-range-and-order.md` §4; note 27 §3.

**M7. The loud-mode map.** $\Phi=(\Phi_A,\Phi_B)$. $\Phi_A$: 25 torsion phase pairs $\kappa(\cos\tau,\sin\tau)$, $\kappa=1.504$, and whitened bond/angle channels (103 numbers, invariant under rigid motions). $\Phi_B=c\,(a_1,\dots,a_K)$ with $a_p=\sum_iV_{pi}u_i$ the collective-mode vectors (they rotate with the molecule). The common scale is $c_0=\sqrt{3(n-1)/(n\,\mathbb E[R_g^2])}$, which gives centred Cartesian components unit mean square (checked here: $c_0=0.157\,\text{Å}^{-1}$ for $n=28$, RMS $R_g$ 10.83 Å). Natural mean squares of the first two vectors: 15.0 and 6.0 feature units. Sources: note 30 §1; issue #1124; PR #1137; `range-order-mechanisms` README.

**M8. The modes are Rouse modes.** The mode fit sees the frames only through mean squared bead distances: with the Helmert basis $h$, $C=-h^\top\mathbb E[D^2]\,h/6$, $D^2_{ij}=|x_i-x_j|^2$ (the classical multidimensional-scaling identity). For an ideal Gaussian chain the modes are exactly the Rouse modes $\cos\!\big(\pi k(i+\tfrac12)/n\big)$. Source: issue #1124 (preliminary check); lab `loud-mode-transfer-checks`.

**M9. Proposition 1 (degree attenuation; "anti-order").** Torsions independent and uniform, each observed through its own noisy phase pair; $r(t)=\mathbb E|\mathbb E[e^{i\tau}\mid Y]|^2$. If $h=\sum_jh_j$ is multilinear in the phases with degree-$j$ components $h_j$ (products of phases of $j$ distinct torsions), then
$$R_h(t)=\frac{\sum_jc_j\,r(t)^j}{\sum_jc_j},\qquad c_j=\operatorname{Var}(h_j).$$
Proof: the posterior factorizes; a product of $j$ phases has conditional mean equal to the product of single-torsion means, so its second moment is $r^{j}$; different products stay orthogonal by rotation symmetry. Since $b_k\cdot b_{k+m}$ is multilinear in the $m-1$ intervening torsions and $R_g^2$ and squared distances are sums of such products, **long-range geometry is erased before the torsions that build it.** Source: note 30 §2.

**M10. The one-torsion posterior (used by M9).** Uniform prior, observation $y=\alpha\kappa e^{i\tau}+\sigma\varepsilon$: the posterior of $\tau$ is von Mises with concentration $k=\alpha\kappa|y|/\sigma^2$ centred at $\arg y$, so $\mathbb E[e^{i\tau}\mid y]=\frac{I_1(k)}{I_0(k)}e^{i\arg y}$ and $r(t)=\mathbb E\big[(I_1(k)/I_0(k))^2\big]$. Source: `chain_model.py` (`Chain.posterior`, `exact`, with $\kappa=\sqrt2$ in the chain model).

**M11. Information is conserved; charts move it (ablation identity).** For a law $Q$ that lacks one structure of $P$, both pushed through the same VP process,
$$D_{\mathrm{KL}}(P\Vert Q)-D_{\mathrm{KL}}(P_T\Vert Q_T)=\tfrac12\int_0^T\frac{\beta(t)}{\sigma_t^2}\,S_Q(t)\,dt,\qquad S_Q(t)=\mathbb E_{P_t}\big\|\hat\varepsilon_P(Y_t,t)-\hat\varepsilon_Q(Y_t,t)\big\|^2 .$$
$S_Q(t)$ is exactly the excess denoising loss at level $t$ of a model that has learned everything except that structure — the training signal for it. The left side is the same in every injective chart; a chart changes only the *profile* of $S_Q(t)$, its *share* of the reducible loss, and the *access* (which function of the noisy channels the network must compute). The time-integrated objective is asymptotically efficient, so gains are in optimization at fixed budget, not data efficiency. Sources: note 27 §6(c); note 30 §3. Related I-MMSE form (note 27 §6(b), Guo–Shamai–Verdú): $\frac{d}{d\gamma}I(Y;X_\gamma)=\tfrac12[\mathrm{mmse}(\gamma)-\mathrm{mmse}(\gamma\mid Y)]$ with $\gamma=\alpha_t^2/\sigma_t^2$.

**M12. Constraint directions.** For $\Phi=(\Phi_A,\Phi_B)$ of rank $d$ with block ranks $d_A,d_B$, the normal space of the joint image contains, besides each block's own normals, a complement $\mathcal C$ with $\dim\mathcal C=d_A+d_B-d$: directions that say "both blocks describe the same molecule". BBA with $K\ge2$ vectors: $d_A=78$, $d_B=3K$, $d=81$, so $3K-3$ = 3, 9, 21, 78 for K = 2, 4, 8, 27. A single vector leaves the rotation about itself unresolved ($d$ drops by one; one constraint, its length). Source: note 30 §4.

**M13. Proposition 2 (constraint split).** As $\sigma\to0$, the excess loss (in block A's channels) of the optimal predictor that reads block A only, over the one that reads both, tends to $\sum_c|P_An_c|^2$ ($n_c$ an orthonormal basis of $\mathcal C$, $P_A$ the restriction to A's coordinates); the A and B limits add up to $\dim\mathcal C$. For one constraint $y_B=g(\cdot)$ on A's image: $n\propto(-\nabla g,1)$, so
$$|P_An|^2=\frac{L^2}{1+L^2},\qquad |P_Bn|^2=\frac{1}{1+L^2},\qquad L=|\nabla g| .$$
"**The louder block leaves the correction to the quieter one**": at small noise the network is pushed to correct the internal block towards the block, so a size decided early in the block is imposed on the chain. Source: note 30 §4.

**M14. Which modes carry a size response.** Gaussian chain with independent isotropic modes $X_p$ of variance $\lambda_p$ per component, $R_g^2=\sum_p|X_p|^2/N$; a tilt $e^{-\eta R_g^2}$ changes $\langle|X_p|^2\rangle$ by $-6\eta\lambda_p^2/N$ to first order, so mode $p$ carries the share $\lambda_p^2/\sum_q\lambda_q^2$ of the size response. Source: note 30 §5.

**M15. Soft forces at one level, and missing smooth terms.** A smooth tilt $\theta h$ of the log-density changes the optimal noise prediction by $-\sigma\theta\nabla h$ along the image to leading order: one level carries information about $\theta$ proportional to $\sigma^2$ per example, so a soft force estimated from that level alone has error growing as $1/\sigma$. For a smooth energy term $U$ missing from the model, the excess noise-prediction loss is $\sigma^2\,\mathbb E|\nabla U|^2$ to leading order — small at the floor ($\sigma^2\approx0.002$). Source: note 30 §7; diagnosis entry ("per-example signal shrinks in proportion to σ", an estimate).

**M16. Contact blur.** Features with noise variance $v$ fix the molecule up to a Gaussian with covariance $v\,(J^\top J)^{+}$; a pair distance with gradient $g$ is smeared by $\sqrt{v\,g^\top(J^\top J)^{+}g}$ (linearized). Source: lab `bba-low-noise-continuation`.

**M17. Score to force on a redundant (immersed) feature space.** With $q(y)=p_0(x)/\sqrt{\det G(x)}$ the push-forward density on the image $S=\varphi(X)$,
$$\nabla_x\log p_0=D\varphi^\top\nabla^S\log q+\tfrac12\nabla_x\log\det G,\qquad \hat F(x)=k_BT\Big[D\varphi^\top s_{t_*}(\varphi(x))+\tfrac12\nabla_x\log\det G(x)\Big].$$
The normal part of the learned score ($O(\sigma_t^{-2})$) carries no force information and is discarded by $D\varphi^\top$. For rotation-invariant maps the volume uses the horizontal determinant $\det G_Q$ plus the orbit factor $\nabla\log\rho$. For the loud-mode map (orientation kept) the volume is the **immersion term** $\tfrac12\log\det(J_c^\top J_c)$ on the $3N-3$ centred coordinates. The difference of the wrong (rotation-invariant) and right formulas changes between shapes exactly as $\tfrac12\log\det(\text{inertia})-\tfrac12\log\det(1+Q^\top G^{-1}Q)$ (PR #1103; $Q$ is not defined further in the PR text). With one mode vector the map is not an immersion (rank $3N-4$); its volume would be $\tfrac12\log\operatorname{pdet}(J_c^\top J_c)-\tfrac12\log(\hat a^\top\mathcal I\,\hat a)$ (not implemented). Adding one scalar channel $a\,d(x)$ to a pullback with metric $G$ changes the log volume by $\tfrac12\log(1+a^2\nabla d^\top G^{-1}\nabla d)$ (issue #1122; it is the `volume` line of `chain_model.py`'s `readout`). Sources: note 29 §§2–5; lab diagnosis; PR #1103.

**M18. Stationarity (Stein) test.** For a force $F=\nabla\log p$ (in kT units), $\mathbb E_p[F\cdot\nabla g+\Delta g]=0$ for every smooth observable $g$; evaluated on data it is the initial drift of $\langle g\rangle$ under overdamped dynamics started from the data, without simulating ($D=k_BT/(m\gamma)=22.5\,\text{Å}^2/\text{ps}$ for 12.011 Da, 325 K, $\gamma=1/\text{ps}$; checked here). Torsion form: $\mathbb E[\sum_kg_k\partial_kb+\partial_k^2b]=0$ with $g_k$ the force along torsion $k$. Reported as $z$ = mean drift / standard error. Ten observables: Rg, Rg², end-to-end, mean distance at four separation ranges, smooth pair counts within 6 and 8 Å, wall $\sum\max(0,4\,\text{Å}-d)^2$. Passing it is necessary, not sufficient (finding 4 of the diagnosis). Sources: lab diagnosis; drift note Part B.

**M19. Correction energies fitted against simulations.** $\log p\leftarrow\log p+\sum_jc_jb_j(x)$; for this exponential family the maximum-likelihood condition is $\mathbb E_{\text{sim}}[b_j]=\mathbb E_{\text{data}}[b_j]$ (relative-entropy minimization with the diffusion force as fixed base), solved by damped Newton steps (rate 0.3, ridge 0.1). Basis: wall $\sum\max(0,4\,\text{Å}-d)^2$, Gaussian bumps at 3.5–7.5 Å in five separation classes, and $R_g$. Source: labs `bba-simulation-fitted-wall`, `bba-wall-fit-size-term`.

**M20. Joint rebuild with hard core.** $\min_x\ \|w\odot(\phi(x)-y)\|^2+\lambda\sum_{|i-j|\ge3}\operatorname{relu}(r_c-d_{ij})^2$ over the 28 bead positions, weight 1 on all 109 features, $r_c=3.6$ Å, $\lambda=100\,\text{Å}^{-2}$, Levenberg–Marquardt from the internal decode rotated onto the generated mode vectors. Without the core it is the small-noise posterior mode — the projection onto the image in the chart's metric — which is why it recovers size. Sources: labs `loud-mode-joint-rebuild(-excluded-volume)`; note 30 §7.

**M21. Late repulsion (sampler).** $\hat\varepsilon'(y,t)=\hat\varepsilon(y,t)+\sigma_t\,\lambda\,\nabla_y\Phi$, $\Phi=\sum_{|i-j|\ge3}\operatorname{relu}(3.6\,\text{Å}-d_{ij})^2$ on the chain rebuilt from the Tweedie estimate $(y-\sigma\hat\varepsilon)/\alpha$, $\lambda=30$, active for $t\le0.02$ (last 150 of 1,000 steps). It changes the sampler, never the model's force. Source: PR #1114; `bba-range-and-order.md` §5.

**M22. Global handedness.** $\chi=a_1\cdot(a_2\times a_3)/(|a_1||a_2||a_3|)$, a pseudo-scalar (flips under mirroring, invariant under rotation and scaling); the invariants of two vectors are mirror-symmetric, so two loud vectors carry none. Source: note 30 §7; PR #1135.

**M23. Raking counterfactual.** Iterative proportional fitting gives reference (training) frames minimum-divergence weights whose margin histograms match a target (generated) panel; explained fraction $f_S=(P_S-p_{\text{data}})/(p_{\text{gen}}-p_{\text{data}})$; Kish's effective sample size $(\sum w)^2/\sum w^2$. It keeps the reference's associations between margins, so it can show that *one-statistic-at-a-time* differences do or do not account for a gap. Source: lab handedness-gap entries; PR #1135.

**M24. ScoreMD paper metric.** On the first two TICs of the published transform, 100 bins per axis including two outlier bins, proportions with a $10^{-6}$ baseline for empty bins,
$$\text{PMF error}=\sum_k\bar w_k\big(\log p_k-\log q_k\big)^2,\qquad \bar w_k=\frac{(p_k+q_k)/2}{\sum_j(p_j+q_j)/2},$$
over bins occupied by either set (units kT²). Source: PR #1138 (`eval/scoremd_paper.py`).

**M25. Information bound for readability.** $I(h;Y_t)\ge\mathsf h(h)-\tfrac12\log\big(2\pi e(1-R_h(t))\operatorname{Var}h\big)$; for a Gaussian observable at $R_h=\tfrac12$ at least $\tfrac12\log2\approx0.35$ nats survive. Source: note 27 §1.

---

## 3. Worked analytical examples

**E1. Linear modes of BBA (note 27 §3).** Cartesian principal modes in units of Å/6.252: variances 15.5, 6.2, 3.0, 1.3 (93% of the mean squared Rg) are half-erased at $t$ = 0.53, 0.44, 0.37, 0.29; the smallest (0.011) at 0.028. Ratio largest/smallest 1,423. Whitening exponent $\gamma$ (effective variance $\propto\lambda^{1-\gamma}$, renormalized to unit mean):

| $\gamma$ | largest/smallest | first mode $t_{1/2}$ | last mode $t_{1/2}$ |
|---|---|---|---|
| 0 (Cartesian) | 1,423 | 0.53 | 0.028 |
| 0.25 | 232 | 0.50 | 0.065 |
| 0.5 | 38 | 0.45 | 0.13 |
| 0.75 | 6.1 | 0.37 | 0.20 |
| 1 (whitened) | 1 | 0.26 | 0.26 |

(Checked here with M4: 15.5 → 0.526, 6.2 → 0.440, 3.0 → 0.368, 1.3 → 0.284, 0.011 → 0.0285.)

**E2. Loudness ruler for BBA features (derived here from M4 + loudness values in note 30 and the mechanisms entry).** Loudness → $t_{1/2}$: closest non-neighbour distance 0.003 → 0.013; end-to-end 0.2 → 0.13 (source states 0.14); distances ≥ 11 apart 0.3 → 0.16; 7–10 apart 0.6 → 0.21 (source 0.22); unit (whitened) 1 → 0.26; 3 apart 1.5 → 0.30; torsions 2.0 → 0.33; helix order parameter $\sum_k\cos(\tau_k-50^\circ)$ 8.8 → 0.47; loud mode 1 (mean square 15.0) → 0.52. This is the whole range-and-order story on one axis: the stiff internal channels sit at loudness ≈ 1–2, long-range internal geometry at 0.2–0.6 (anti-order), the loud block at 6–15 (erased last).

**E3. One torsion (M10), checked here by Monte Carlo (400,000 draws, κ = √2).** $r(t)$ = 0.985 (t = 0.05), 0.940 (0.1), 0.894 (0.13), 0.716 (0.2), 0.530 (0.26), 0.293 (0.35). The source table gives 0.94, 0.72, 0.53 at 0.1, 0.2, 0.26.

**E4. The exactly solvable chain (note 30 §2; lab `range-order-mechanisms`).** 28 beads, 3.8 Å bonds, fixed bond angle (110° for the uniform prior), 25 independent uniform torsions, noised through phase pairs with the project schedule; exact posterior means. Readable fraction:

| $t$ | one torsion | $b_k\cdot b_{k+4}$ | $b_k\cdot b_{k+12}$ | $b_k\cdot b_{k+26}$ | end-to-end² | $R_g^2$ |
|---|---:|---:|---:|---:|---:|---:|
| 0.1 | 0.94 | 0.87 | 0.62 | 0.36 | 0.72 | 0.84 |
| 0.2 | 0.72 | 0.47 | 0.08 | 0.004 | 0.25 | 0.44 |
| 0.26 | 0.53 | 0.25 | 0.01 | 0.000 | 0.12 | 0.25 |

Effective degree $\log R/\log r$ of $b_k\cdot b_{k+m}$ ≈ two thirds of its $m-1$ torsions (e.g. at $t=0.2$: $\log0.47/\log0.716=2.26$ for 3 torsions; derived here). Check case: $b_k\cdot b_{k+2}$ depends on one torsion and matches $r$ to within 0.001. A visualization can reproduce every cell exactly with `chain_model.py exact` (20,000 queries).

**E5. Constraint split (M13).** Chain model with one mode vector, the block's length the constrained channel: $L^2\approx1$ for the whitened block, $\approx16$ at natural loudness, $\approx63$ at twice the amplitude ($L^2$ scales with the square of the block scale). Predicted shares (derived here): 0.50/0.50, 0.94/0.06, 0.98/0.02. Measured gains at $t\le0.05$: internal 0.43–0.55 / block 0.43–0.56 (whitened); 0.85–1.03 / 0.06–0.09 (natural); 0.90–1.09 / 0.02–0.03 (twice). On BBA the three constraint directions of the two-vector block lie 74%, 87%, 96% in the internal block (median over 1,200 held-out frames); whitened 27%, 44%, 68%; twice as loud 92%, 97%, 99%.

**E6. Collapse law and where its signal sits (lab `range-order-mechanisms`).** Data law $P=P_0\,e^{-\eta R_g^2}/Z$ with $\eta$ set so that mean Rg falls by 0.9 Å (the compaction torsion correlations give BBA). Relative entropy of the collapse 0.0766 nats (0.0883 with two von Mises basins at 50° and −165°, concentrations 8 and 4, bond angle 100°); the integrated signals of M11 recover it to within 3% in every arm. Per-example signals: learning the collapse in the internal chart is worth 0.0005 at $t=0.01$ (0.25 σ² for $t\le0.035$), at most 0.049 near $t=0.2$; learning the constraint is worth 0.92 at $t=0.01$, 0.80 at 0.1, 0.38 at 0.2 (8 to 1,800 times more). Share of the collapse information learned in the block's own channels: 0.48 (whitened), 0.88 (natural), 0.91 (twice), mostly at $t\approx0.35$–0.6. $R_g^2$ half readable up to $t$ = 0.17 (no block), 0.22 (whitened), 0.41 (natural), 0.53 (twice). An ideal chain given only the right $|a_1|$ marginal removes 93% of the size error (Rg W1 0.90 → 0.066 Å); that marginal carries 93% of the relative entropy.

**E7. Size response per mode (M14).** BBA mean squares 15.0, 6.0, 2.9, 1.3, 0.49 → first mode carries 83%, first two 96% (checked here: 0.829, 0.962). Conformational variances of the first four mode lengths 6.9, 2.5, 0.9, 0.6 against a torsion loudness of 2.0: only two modes are louder than a torsion — the theoretical reason for K = 2. Trained models (50,000 updates): one vector removed 66% of C3's size error, two removed 78% (Table 3 of the range-and-order record: Rg W1 0.477 → 0.161 → 0.105 Å for 0, 1, 2 vectors; 0.136, 0.152, 0.325, 0.399 for 4, 8, 16, 27).

**E8. Torsion blur through the lever arm (derived here; quoted values from the diagnosis).** Angular blur of a torsion ≈ $s/\kappa$ with $\kappa=1.504$: 0.40° ($t=0.001$), 1.04° (0.005), 1.70° (0.01), 2.95° (0.02), 6.63° (0.05), 12.96° (0.1). Through a 5–10 Å lever arm a distant bead moves by 0.58–1.16 Å at 0.05 ("about 1 Å") and 0.09–0.18 Å at 0.005 (the level where "the torsion blur is about 1°"). Linearized contact blur from the low-noise continuation entry (median over contact pairs ≥ 5 apart and < 6 Å):

| level | K = 0 (C3) | 1 | 2 | 4 | 8 | 27 |
|---:|---:|---:|---:|---:|---:|---:|
| 0.001 | 0.09 Å | 0.07 | 0.05 | 0.04 | 0.03 | 0.03 |
| 0.005 | 0.23 Å | 0.19 | 0.13 | 0.10 | 0.09 | 0.09 |
| 0.01 | 0.37 Å | 0.32 | 0.22 | 0.16 | 0.15 | 0.15 |
| 0.05 | 1.46 Å | 1.24 | 0.85 | 0.62 | 0.58 | 0.57 |

The margin that matters: data's 1% point of the closest non-neighbour distance is 3.9 Å against the 3.5 Å overlap test (≈ 0.4 Å), and the floor blur in the internal chart is 0.32–0.36 Å.

**E9. Perfect-model read-out bias (lab `range-order-mechanisms`, `readout`).** A perfect model read at level $t$ samples $P\,e^{b_t}$; with the immersion volume term the stationary mean Rg shifts by at most 0.01 Å up to $t=0.1$ in the loud chart; without any volume term the chain shrinks by 1.7–1.8 Å. In the internal chart the shift is +0.02 Å at $t=0.05$ and +0.07 Å at 0.1.

**E10. Brute-force pushforward check of the volume term (PR #1103).** 5-bead chain, 2 mode vectors, an extended and a compact shape, 400,000 uniform draws in a small ellipsoid: log-volume 17.808 and 16.924 against 17.815 and 16.934 from $\tfrac12\log\det(J_c^\top J_c)$ (SE 0.006). The rotation-invariant formula predicts a change of +1.87 between the shapes instead of −0.88. On 2,000 BBA frames the two formulas differ by a term growing 0.32 per Å of Rg (0.18 from $\tfrac12\log\det$ inertia); reweighting by it moves mean Rg 10.81 → 9.64 Å (diagnosis: 9.58 Å).

**E11. The size term in linear response (lab `bba-wall-fit-size-term`).** Coefficient −0.16 per Å, Var(Rg) ≈ 4.8 Å²: mean Rg shift ≈ 0.16 × 4.8 ≈ 0.8 Å, about the swelling the wall introduced (estimate in the source; 0.768 checked here).

**E12. What a 0.43 Å size bias costs in nats (note 27 §6).** $0.43^2/(2\cdot2.2^2)\approx0.02$ nats in the Rg marginal — a tiny share of the loss, which is why it is learned slowly.

**E13. EigenFold and Chroma as linear-Gaussian channels (lab `readable-windows-noise-precedents`).** EigenFold: $dx=-\tfrac12Hx\,dt+dw$, $H=\alpha L$ with $L$ the path-graph Laplacian and $\alpha=3/3.8^2\,\text{Å}^{-2}$. (Derived here, standard: the path Laplacian's eigenvalues $2-2\cos(\pi k/N)$ grow with mode frequency, so local modes relax and are erased first — order from relaxation rates.) Chroma-style: ideal-chain covariance, and a "globular" chain $x_i=b\,x_{i-1}+a\,e_i$ with $b=0.992$ set for $R_g=2.2N^{0.38}$ Å at 3.8 Å neighbour distance. Fully matched: the data's rotation-averaged Helmert covariance. $t_{1/2}$ results are in Section 4.

**E14. The circle with a global guide (issue #1123).** Density $(1+d\sin\theta)/(2\pi)$, $|d|<1$, guide $\cos\theta$: opposite branches $\theta$ and $\pi-\theta$ have the same guide but generally unequal probabilities. A coarse global coordinate cannot tell mirror-like branches apart — the same logic as "two vectors carry no handedness".

**E15. Why the PMF floor scales with count (derived here, heuristic).** With $n$ samples, each occupied bin's log-proportion has variance ≈ $1/(n\,p_k)$, so the weighted sum of squared log-ratios scales as (number of occupied bins)/$n$. The measured floor gives count × floor = 11,200, 9,000, 8,000, 7,800, 8,126 at 20,000 to 325,039 frames; a fit floor $=A/n+C$ through the 100,000 and 325,039 points gives $A\approx7{,}944$, $C\approx0.0006$, and ≈ 0.0067 at 1,300,156 (the PR's extrapolation: ≈ 0.006).

**E16. Linear-response cost of a level (drift note).** Blur floor (real molecules noised in internal coordinates and rebuilt, no model): size error 0.045, 0.048, 0.052, 0.057, 0.073, 0.117 Å at $t$ = 0.005, 0.01, 0.015, 0.02, 0.03, 0.05; angle 0.18–0.40°; it makes molecules slightly larger (mean Rg 10.64–10.66 Å).

---

## 4. Key empirical results (system BBA unless stated)

**R1. Readable windows ($t_{1/2}$; lab #1099 and note 27; lower bounds).**

| Process | Bond | Angle | Torsion | Rg | Long-range | Contacts |
|---|---:|---:|---:|---:|---:|---:|
| Cartesian VP (calibration) | 0.0004 | 0.022 | 0.048 | 0.47 | 0.42 | 0.35 |
| Published Cartesian (note 27) | 0.0004 | 0.05 | 0.08 | 0.47 | 0.44 | 0.38 |
| Chroma-style, ideal chain | 0.0032 | 0.077 | 0.16 | 0.24 | 0.23 | 0.090 |
| Chroma-style, globular chain | 0.0029 | 0.073 | 0.16 | 0.24 | 0.22 | 0.095 |
| Fully data-matched covariance | 0.0049 | 0.11 | 0.23 | 0.21 | 0.23 | 0.092 |
| C3 internal (note 27) | 0.26 | 0.35 | 0.35 | 0.27–0.28 | 0.24 | 0.23 |
| Internal + 2 loud modes (block alone, floor) | 0.26* | 0.35* | 0.35* | ≥ 0.42 | ≥ 0.37 | ≥ 0.33 |
| EigenFold, own clock | 0.0016 | 0.27 | 0.84 | 215 | 142 | 79 |

\* internal block = C3's. Training range: [0.01, 1] internal, [10⁻⁵, 1] Cartesian. First-order windows for the loud chart (range-order mechanisms): Rg 0.19 (internal) → 0.44 (+2 loud) → 0.27 (+2 whitened) → 0.48 (+8 at loudness 15); distances ≥ 11 apart 0.16 → 0.29 → 0.21 → 0.46; closest non-neighbour 0.013 → 0.025 → 0.019 → 0.068 (Cartesian 0.012). An additive read-out of the noise-free internal block explains only 38% of Rg's variance (98% with the block's three invariants).

**R2. Generation at 190,350 updates** — see Section 1.2 (two seeds, 100,000 molecules). Library rerun (#1115): seeds 2/3 bond 0.00038/0.00030 Å, angle 0.213/0.180°, torsion 0.80/0.79°, Rg W1 0.097/0.096 Å, contact 0.0074/0.0074, population JS 0.0121/0.0116, overlaps 18.4%/14.2%; seed 4 (#1130): 0.00040, 0.229°, 0.86°, 0.095 Å, 0.0070, 0.0120, 15.6%. Leaderboard at 380,700 (#1126): 0.108 ± 0.017 Å (n = 2); C3 0.45 ± 0.026 Å.

**R3. Rebuilds** (stored 100,000-molecule panels, executed seeds 2/3):

| Rebuild | Overlap | Rg W1 (Å) | Contact | Angle (°) | Torsion (°) |
|---|---|---|---|---|---|
| internal-only | 14.5% / 15.3% | 0.117 / 0.091 | 0.0081 / 0.0071 | 0.202 / 0.191 | 0.76 / 0.79 |
| joint, no core (#1105/#1107) | 19.3% / 20.1% | 0.077 / 0.064 | 0.0070 / 0.0064 | 0.207 / 0.200 | 0.80 / 0.83 |
| **joint + core** | **0.0% / 0.0%** | **0.083 / 0.070** | 0.0075 / 0.0068 | 0.207 / 0.200 | 0.80 / 0.83 |
| internal + core (control) | 0.0% / 0.0% | 0.131 / 0.105 | 0.0092 / 0.0080 | 0.201 / 0.192 | 0.77 / 0.80 |
| Cartesian + distances (seeds 0/1, for comparison) | 2.9% (190,350 updates, #1071 note) | 0.071 / 0.077 | 0.0061 / 0.0067 | 1.58 / 1.49 | 4.1 (#1071 note) |

Library joint rebuild: 0.086 / 0.071 (seeds 2/3), 0.077 (seed 4); full schedule 0.105 Å with 0% overlaps.

**R4. Force fields (100 ps unless stated; size error Å).**

| Model, read-out | Size error | Overlap | Source |
|---|---|---|---|
| Loud s3, driver (wrong) volume, 512 paths | 0.98 / 0.94 (data / gen starts) | 33.7% | #1100 |
| Loud s3, correct volume | 0.24 / 0.30 | 21.3% | #1100 |
| Loud s3, correct volume + 23 kT/Å² wall (128 paths, 50 ps) | 0.20 / 0.65 | 0.0% | #1100 |
| C3 s0 / s1, study read-out (128 paths, 50 ps) | 0.23/0.42, 0.27/0.17 | 24.9%, 24.7% | #1100 |
| Loud s3 / s2 uncorrected (full panel 256+256) | 0.267 / 0.175 | 21.3% / 18.4% | #1109 |
| Loud s3 / s2 + 27-term wall & size correction | 0.263 / 0.173 | 0.0% / 0.0% | #1109 |
| Library s2 / s3 uncorrected | 0.272 / 0.337 | 20.4% / 20.5% | #1115 |
| Library s2 / s3 corrected | 0.258 / 0.162 | 0.0% / 0.0% | #1115 |
| Five models, 2,048 paths, uncorrected at 100 / 200 / 300 ps | 0.158–0.277 / 0.229–0.492 / 0.396–0.642 | 21–24% at 100 ps | #1130 |
| Full schedule (ordered, seed 2), uncorrected / corrected | 0.118 / 0.152 | 19% / 0% | #1104 |

Sampling floors: 256 + 256 paths size error 0.167 Å on average (95% below 0.26, 99% below 0.30), pair error 0.037 (95% below 0.046); 1,024 + 1,024 paths 0.084 Å (99% point 0.144).

**R5. Drift diagnostics** (#1089, executed models; note: loud-mode rows use the *wrong* volume term): mean size error over four models 1.60 / 1.26 / 1.12 / 1.06 / 0.90 / 0.69 Å at $t$ = 0.005 … 0.05; 0.56 Å with repulsion at 0.05; 500 ps end values 0.82–1.85 Å. Doubling training (#1091): changes −0.11/+0.15/−0.23/+0.03 Å at $t=0.02$.

**R6. Wall learnability** (#1101): see Section 1.6; and with K = 2, 4, 8, 16, 27 at 50,000 updates the wall z at 0.05 is 15.3/15.3, 15.3/15.5, 15.0/14.5, 14.7, 14.0.

**R7. Simulation-fitted corrections.** Fit history (#1106): mismatch 35.3, 24.4, 3.72, 0.34, 0.10, 0.04 at iterations 0, 1, 5, 10, 20, 30; overlap frames 27.3% → 0.0%; fresh panels swell to 11.31/11.13 Å. With size term (#1109): frozen-phase mean Rg 10.42 Å; coefficient table (log-density, this fit / previous): wall −39.7 / −34.3 per Å², 3-apart bump at 3.5 Å −6.62 / −6.07, size −0.161 per Å.

**R8. Equilibration** (#1128, 20,000 per arm, seed mean): Rg W1 plain 0.101, tail 0.123, full 0.286, torsion 0.087, torsion_size 0.087 Å; torsion error 1.02 / 1.02 / 1.80 / 1.55 / 1.57°; overlaps 16.3% / 4.3% / 0.94% / 1.38% / 1.19%; sampling time 14 / 16 / 69 / 123 / 123 min.

**R9. Handedness.** $P(\chi>0)$ by Rg bin (< 8.5, 8.5–9.5, 9.5–11, ≥ 11; all): data 0.169, 0.268, 0.371, 0.470; 0.353. Library decode s2: 0.196, 0.269, 0.421, 0.485; 0.381. Joint hard core s2: 0.173, 0.275, 0.421, 0.483. C3 s0: 0.247, 0.251, 0.417, 0.490. Cartesian s0: 0.162, 0.271, 0.386, 0.473. Floor SD 0.002–0.004. Learning curve (seed 2): 0.527, 0.495, 0.537, 0.384, 0.319, 0.258, 0.221 at 0 … 190,350 updates. Block tracking: $R^2$ of chain $|a_1|$ on block $|a_1|$ 0.13, 0.29, 0.37, 0.43, 0.44, **0.63**, 0.91, 0.97 at $t$ = 0.6, 0.45, 0.35, 0.26, 0.2, 0.13, 0.05, 0.01 (seed 2); mean $|a_1|$ block / chain 21 / 59 Å at 0.6, meeting at 40 / 41 Å at 0.13.

**R10. Handedness gap decomposition** (9.5–11 Å bin, gap +0.049 / +0.045, library decode s2 / s3): size 3% / 3%; + each torsion −4% / −3%; + pairs and angles **−1% / +4%**; flatness −2% / −3%; + frame shape 9% / 12%; + 253 long-range distances **28% / 32%** (ESS 46–48%); between-halves block 31% / 38%; arm azimuth **11% / 10%**; coarse quarter-chain dihedral 61% / 59%; within-helix control 0% / 1%.

**R11. Transfer geometry** (#1129): Rouse cosines 0.999, 0.994 (BBA) and 0.996, 0.990 (Chignolin), captured 99.6% / 98.7%; contact-network modes ≤ 86%. RMS Rg sources: ideal chain 8.20 Å (−24.2%), PDB 10.27 Å (−5.2%), other protein with $n^{0.588}$ 9.87 Å (−8.9%) for BBA (data 10.83 Å). Bonds one-basin (mixture share 0.078), pseudo-angles multi-basin (0.507).

**R12. Paper metric** — see Section 1.12; floor 0.080 ± 0.001 at 100,000.

**R13. Chain-topology inputs** (#1092, open, 50,000 updates, 20,000 molecules): overlaps C3 14.8% → 8.9%, 12.5% → 10.2%; loud 23.9% → 19.6%, 17.1% → 16.2%; size error loud 0.106 → 0.087, 0.104 → 0.098 Å; simulated drift not fixed.

**Caveats that apply to almost everything above**: two seeds (three for the library loud-mode recipe; one at the full schedule); a single protein; a random frame split; floors depend on the molecule count and panel size; the 100 ps size error is a point on a drift; the joint rebuild, repulsion and fitted wall are read-out repairs, not learned; several verdicts sit within a few hundredths of an ångström of their limits.

---

## 5. Why it was promising, why parts failed, what was learned

### 5.1 Derived facts (proved or verified, under stated assumptions)
1. **Anti-order of internal coordinates** (Prop. 1, exact for independent torsions): long-range geometry is a high-degree function of torsion phases and is erased first ($r^j$). With chain geometry decided in the same band as the local detail, C3's global error is created at intermediate noise where its training gradient is negligible (#1055: ~70% of the expected gradient from $t<0.05$, none distinguishable above 0.11).
2. **The constraint split** (Prop. 2, exact as $\sigma\to0$): a redundant block makes the quieter block the one that is corrected; at natural loudness ~94% of the constraint's predictable noise lands in the internal block.
3. **Information conservation** (M11): no chart buys statistical efficiency; it changes where the signal sits and how hard it is to use. So the gains are optimization gains at fixed budget, and the readable-window screen ranks processes without training.
4. **The volume term** (note 29; PR #1103 brute-force check): for a map that keeps orientation, only the immersion formula is right; the rotation-invariant formula adds a spurious compaction. This is a mathematical error, verified three ways (pushforward Monte Carlo, classical $r^2\sin\theta$ measure, exact small-noise score).
5. **Two vectors carry no handedness** (their invariants are mirror-symmetric).
6. **The joint least-squares rebuild is the small-noise posterior mode** (projection onto the image), so it uses information the internal-only decoder discards.
7. **A single noise level carries soft-force information ∝ σ²** (M15) — a structural reason the force read-out is a trade-off between blur and accuracy.

### 5.2 Measurements that support the mechanism (not proofs)
- The order dial works monotonically (Rg W1 0.51 → 0.08 Å).
- Two vectors are optimal (Table 3), as the spectrum predicts (only two modes louder than a torsion; 96% of the size response).
- The block's predicted takeover window (0.26–0.1) was matched on trained models ($R^2\ge0.5$ first at $t=0.13$).
- The loud-mode model has no low-noise compaction bias in the stationarity test where C3 has one; with the correct volume its force size error at 100 ps is at the panel floor, and at the full schedule 0.118 Å.
- The directions are the Rouse modes; the trained library recipe reproduces on three seeds.

### 5.3 Hypotheses (stated as such in the sources)
- Networks learn low-order statistics first, so high-degree collapse functions are the slowest kind of structure to learn [H, note 30 §2, §8].
- In a redundant chart "order acts not only through when the block is erased but through which block is corrected" [H] — to be tested by the whitened block (#1137; predicted retained share ≈ ½).
- The mid-size handedness deficit is "the split that the anti-order predicts" [H].
- The swelling under a fitted wall came from two offsetting errors [interpretation, #1106].
- Anti-order should worsen for longer chains, possibly needing more loud modes [H].
- The soft part of a low-noise force is inherited from higher levels through the network's continuity in $t$ [H], consistent with "longer training does not fix the drift".

### 5.4 What failed and why (as explained in the sources)
- **Learning the wall from the score** (#1101): a range failure; contacts are readable only below $t\approx0.005$–0.001, where the size balance is unreadable.
- **Data-only correction energies** (#1100 finding 4): stationarity of the data is local; it cannot rule out spurious compact states — a dead end for attractive data-fitted terms.
- **Wall fitted against simulations without a size term** (#1106): fixes overlaps, releases a swelling previously held back by the overlaps.
- **Joint rebuild without core** (#1105): pushes beads into each other to agree with the block.
- **Low-noise equilibration on the loud-mode model** (#1128): no size error left to fix; costs local accuracy and time.
- **Topology inputs** (#1092): the network already "knows" enough; the defect is the small-noise accuracy of a hard constraint.
- **More training** (#1091; generation also at the full schedule): the objective is satisfied; what is wrong is not under-training.

### 5.5 Later corrections (what changed the reading)
- **2026-11-16 (#1100)** overturned two readings of 2026-11-15/16: "the loud block adds nothing in simulation" (#1088) and "the drift is an error of the learned force at small noise levels" (#1089, #1091), *for the loud-mode models*: ~¾ of their compaction was the conversion bug, and their learned score is accurate from 0.05 upward. C3's drift keeps the old reading (a learned low-level bias plus the missing wall).
- **2026-11-18 (#1130)** overturned "the library force field is more compact than the executed one" (#1115): chance in 512-path panels; and replaced "size error at 100 ps" by "a point on a drift" for every model.
- **2026-11-17 (#1109)** superseded the #1089/#1091 recommendation "t = 0.05 with the late repulsion" as best force read-out for the loud-mode model: a fitted wall plus a weak size term keeps size and removes overlaps, and the repulsion-only wall is "not neutral for the size".

### 5.6 Why optimism is reasonable (the case as it stands on 2026-11-19)
1. The headline gain is large and robust: 17–120× better bonds than any Cartesian-family model, ~75–80% of C3's size error removed, reproduced on three library seeds, two executed seeds, and the full schedule.
2. It is explained by derived mechanisms (Props. 1–2, M14) that predicted the optimum block size and the reverse-path takeover window.
3. Each remaining defect sits exactly where theory note 30 says the block cannot help (wall, handedness, kinematics, soft forces); none contradicts the account.
4. Cheap, training-free repairs exist and transfer across seeds and to the full schedule: the joint hard-core rebuild (0% overlaps, Cartesian-level size) and the simulation-fitted wall + size term (0% overlaps, size at the panel floor at 100 ps).
5. After the volume fix the loud-mode force field is the best read-out of the line, the learned score passes the stationarity test from 0.05 up, and the full-schedule force field reaches 0.118 Å at 100 ps.
6. The construction is less tied to the target than feared: the loud directions are the Rouse modes.
7. On the paper's own population metric the ordered model (0.097) is level with the best Cartesian model (0.096) and close to the 100,000-count floor (0.080), and native ScoreMD at the same budget is clearly worse (0.202 / 0.315).

---

## 6. Visualization opportunities

Each idea: insight → on screen → computed from → numbers/figures → pitfalls.

**V1. "Both scales at once" — the map of 22 models.** Insight: every earlier construction got one half of BBA right; ordered internal coordinates sit alone in the corner where both are right. On screen: log–log scatter, x = bond W1, y = Rg W1, one dot per seed, colour by family (Cartesian, internal, springs, whitening, wδ, warps, ScoreMD), with arrows C3 → ordered (adding the block) and ordered → joint rebuild (0.083/0.070). Computed from logged results (Section 1.2 table; PR #1088). Pitfalls: different panels (100,000 vs 20,000) have different floors; warps/corrections have one seed and no distance inputs; ScoreMD's two seeds differ 0.16 vs 0.53 Å.

**V2. The erasure timeline (readable windows).** Insight: Cartesian has order without range, internal has range without order, the loud block has both. On screen: one horizontal lane per process; each feature (bond, angle, torsion, contacts, long-range, Rg) a bar ending at its $t_{1/2}$ on a log-$t$ axis, the trained range shaded ([0.01,1] vs [10⁻⁵,1]); a playhead sweeps $t$ and features fade as they are erased. Computed from R1 (and note 27's table). Pitfalls: lower bounds; EigenFold has its own clock (show ratios); first-order vs measured windows differ (Rg 0.19 first-order vs 0.27–0.28 measured for C3).

**V3. The loudness ruler.** Insight: a feature's erasure time is a function of one number, its loudness; the block is the only thing louder than torsions. On screen: a vertical log-loudness axis with the closed-form $t_{1/2}(\ell)$ (M4) as a second scale (and log-SNR = −ln ℓ); markers: closest contact 0.003, end-to-end 0.2, long-range 0.3, 7–10 apart 0.6, whitened 1, 3-apart 1.5, torsion 2.0, helix order parameter 8.8, mode 2 (6.0), mode 1 (15.0). Analytic. Pitfall: first-order loudness is a screen, not a measurement.

**V4. Anti-order in a chain (Prop. 1).** Insight: internal-coordinate noise destroys the fold before the turns that build it. On screen: a 28-bead chain; a heat map of the readable fraction of $b_k\cdot b_l$ versus separation as $t$ rises (diagonal stays bright, off-diagonal fades as $r^{j}$); a side panel shows one torsion's posterior (von Mises) sharpening/blurring. Computed exactly with `chain_model.py exact` (E4) or the closed form $r(t)^{(2/3)(m-1)}$ as an approximation. Pitfalls: independent uniform torsions; no contacts; numbers illustrate mechanisms, not BBA.

**V5. Who corrects whom (constraint split).** Insight: "the louder block leaves the correction to the quieter one." On screen: 2D toy — x = internal coordinate along its image, y = block channel; the joint image is the curve $y=g(x)$ with slope $L$; a noisy point and its normal projection; the normal's x-component bar shows $L^2/(1+L^2)$. Slider $L^2$ = 1 (whitened), 16 (natural), 63 (twice) → shares 0.50, 0.94, 0.98; overlay measured BBA shares 74/87/96% vs 27/44/68% vs 92/97/99%. Analytic + logged. Pitfall: small-noise limit, one constraint.

**V6. Information moves, it is not created.** Insight: the area under the collapse signal is the same in both charts (0.0766 nats); the block moves it to high noise where nothing else competes. On screen: two curves $\tfrac12\beta/\sigma^2\,S_Q(t)$ (internal chart: tiny and spread; loud chart: a bump at $t\approx0.35$–0.6 in the block's channels), equal shaded areas. Computed by running `chain_model.py signal` (CPU; 1,200 queries × 4,000 draws per arm). Pitfall: one Monte Carlo seed; per-level gains scatter by ~0.1.

**V7. Generation decides size first (reverse-path movie).** Insight: in the ordered model the block's size is settled early and the chain falls in line at $t\approx0.13$. On screen: two gauges, mean $|a_1|$ of the denoised block and of the chain rebuilt from the denoised internal block (21/59 Å at $t=0.6$, 32/50, 36/46, 38/44, 39/43, 40/41, 40/40, 40/40), plus the $R^2$ curve (0.13 → 0.97) and the share of molecules with their final handedness (0.55 → 1). Logged (R9). Pitfall: denoised estimates are posterior means, not samples (the chain is "too extended" at high noise by construction).

**V8. The phantom spring (volume-term bug).** Insight: a single wrong determinant made a force field compact the protein. On screen: the Rg distribution of data frames reweighted by the wrong/right volume ratio sliding from mean 10.66 to 9.58 Å; then simulated size error bars 0.98 → 0.24 Å; a 5-bead mini-demo of the pushforward check (17.808 vs 17.815). Logged + small analytic. Pitfalls: the reported slopes differ by measure (0.6 kT/Å as a measured tilt in the stationarity test vs 0.32 per Å as a regression of the log-volume difference on Rg); all pre-11-16 loud-mode simulations carry this bug.

**V9. Blur versus wall (the read-out squeeze).** Insight: no single noise level gives both a sharp wall and a readable size balance. On screen: left, torsion blur angle and lever-arm displacement vs $t$ (E8); centre, a contact-distance histogram convolved with the K-dependent blur (0.13/0.22/0.85 Å at 0.005/0.01/0.05) against the 3.5 Å test line; right, wall z and Rg z vs level (wall 9–15; Rg z swinging at low levels). Analytic + logged (#1101). Pitfall: the blur is linearized; wall z depends on a 4 Å cutoff that 3.9% of data molecules cross.

**V10. Two errors that cancel.** Insight: removing overlaps unmasked a swelling; a weak size term (0.16 kT/Å) cancels it. On screen: three Rg distributions (deciles) over data: uncorrected (compact-ish, overlapping), wall-only (fresh paths 8.64/10.46/15.04 Å), wall + size; animated fit history (mismatch 35.3 → 0.04, overlaps 27% → 0%, wall 0 → 34 kT/Å²). Logged (#1106, #1109). Pitfalls: 100 ps is not stationary; one fit; the fitting paths did not show the swelling.

**V11. Using the block in the rebuild.** Insight: the 6 discarded numbers carry the correct global information. On screen: a generated feature vector → three rebuilds of the same molecule (internal-only, joint, joint + core) with the block arrows drawn; bar chart of overlaps (15% → 20% → 0%) and Rg W1 (0.117 → 0.077 → 0.083 vs Cartesian 0.071). Logged; molecules would need the stored panels (storage server) or a re-generation. Pitfall: 0% overlaps is by construction (3.6 Å core vs 3.5 Å test); it is a read-out, not learned.

**V12. The block and the molecule disagree (learning curve).** On screen: median mismatch ratio vs updates (0.744 → 0.043), with the model floor and the null (0.48); histogram tail with overlap share by decile. Logged (#1102). Pitfall: correlation, not causation, between mismatch and overlaps.

**V13. The drift that does not stop.** Insight: every force field compacts; fixes move the curve down but not its slope (so far). On screen: size error vs simulated time (0–500 ps) for C3/loud at 0.02 and 0.05 (#1089 Part D), the 380,700 continuation (#1091), the 2,048-path panels at 100/200/300 ps (#1130), the full-schedule point (0.118 Å), with panel floors as bands. Logged. Pitfalls: the executed loud-mode curves before 11-16 use the wrong volume term; different panel sizes; folded share is not equilibrium.

**V14. Where the compaction lives.** On screen: excess distance vs sequence separation (bonds ≈ 0, 1–4 up to −0.54 Å, long-range −1.4 to −3.2 Å) and a stacked bar splitting mean Rg loss into population shift and within-state shrinkage. Logged (#1089 Part A). Pitfall: those runs are the study read-outs at 0.01/0.02 (loud ones with the bug).

**V15. The Stein test as a picture.** Insight: a correct force leaves the data still on average. On screen: a cloud of molecules with force arrows; the average drift of Rg and of the wall observable shown as a needle with its standard error; z-scores at level 0.05 (wall +14.8/+15.0) and the trap: a correction that makes all needles zero (z 7–15 → 0.7–0.8) still swells in simulation. Logged (#1100). Pitfall: necessary, not sufficient.

**V16. Handedness: what two arrows cannot say.** On screen: three mode vectors forming a right/left-handed frame; mirror the molecule — $|a_1|,|a_2|,a_1\cdot a_2$ stay, χ flips. Then $P(\chi>0)$ by size bin, data vs models (R9), and the learning curve 0.5 → 0.25. Optional toy: the circle with guide cos θ (E14). Logged + analytic. Pitfall: χ is near zero for coplanar frames (median |χ| 0.05 among the 1.9% that flip in the rebuild), so small changes flip it.

**V17. The handedness detective (waterfall).** Insight: the deficit is neither local nor in any single distance or side; it is a relative twist of the chain halves. On screen: a waterfall of explained fractions (local −1/+4%, single long-range 28/32%, between-halves 31/38%, arm 11/10%, coarse dihedral 61/59%), each with a small cartoon of what was matched and its ESS. Logged (R10). Pitfalls: raking matches margins only; the coarse dihedral is close to χ by construction; the gap is 0.05 in one size bin.

**V18. Rouse modes are the loud directions.** On screen: the two cosine patterns $\cos(\pi k(i+\tfrac12)/28)$ over the beads overlaid on the fitted modes (overlaps 0.99, 0.99, 0.91, 0.92 for modes 1–4); animate the chain along mode 1 ("the two halves separate") and mode 2; Chignolin's swapped order. Analytic + fit from frames (library `fit_collective_modes`). Pitfall: size (the scale) still needs data.

**V19. Why two modes.** On screen: bars of mode mean squares (15.0, 6.0, 2.9, 1.3, 0.49), their size-response shares (83%, 13%, …), conformational variance vs the torsion line (2.0); beside them the trained Table 3 (Rg W1 and torsion error vs K). Analytic + logged. Pitfall: measures differ (linear response vs trained Rg W1), agreement is qualitative.

**V20. The count-dependent floor.** On screen: log–log PMF floor vs count with slope −1 (count × floor ≈ 8,000), model points at 100,000, the paper's numbers at 1,300,156 placed on their own vertical. Logged (#1138). Pitfall: never compare values across counts; one inference seed.

**V21. Ten times more training, same molecules.** On screen: Rg W1 of ordered vs internal at 190,350 / 380,700 / 1,903,500 (0.117 → 0.120 → 0.111; 0.455 → 0.468 → 0.455) beside the force-field size error that did improve (0.24–0.34 → 0.118). Logged (#1104). Pitfall: one seed at the full schedule; selection after results.

**V22. Small panels lie.** On screen: the same checkpoint's size error with 512 vs 2,048 paths (0.337 vs 0.277; 0.312 vs 0.221) against the floor distributions (mean 0.167 vs 0.084). Logged (#1115, #1130). Teaches why the project's effect rule exists.

**V23. What the block cannot supply (summary card).** Four icons — wall (range failure at $t\approx0.013$), handedness (two vectors), kinematics (mismatch tail), soft forces (∝ σ²) — each linked to its repair or open problem (rebuild/fitted wall; third vector?; joint rebuild; correction/consistency loss).

**V24. Ordered noising in the literature.** On screen: EigenFold's harmonic erasure (five decades), Chroma's compressed band, the data-matched covariance, and the loud-mode chart, side by side on one axis (R1). Pitfall: EigenFold's own clock; Chroma's exact covariance not reproduced.

**V25. The read-out level trade-off.** Insight: reading the force at a higher noise level trades learned error for blur, and up to 0.05 the trade is favourable. On screen: two curves over $t$ = 0.005 … 0.05 — model size error at 90–100 ps (1.60, 1.26, 1.12, 1.06, 0.90, 0.69 Å) falling, blur floor (0.045 … 0.117 Å) rising, overlaps rising (26–32% at 0.05) — with the repulsion point (0.56 Å). Logged (#1089). Pitfall: loud-mode rows carry the volume bug; mean over four models.

**V26. The order dial.** Insight: with bonds held at the floor, size error follows the exponent of the collective block monotonically. On screen: a γ slider morphs the linear erasure spectrum of E1 (largest/smallest variance 1,423 → 1) and moves a dot on the trained result (Rg W1 0.51, 0.19, 0.12, 0.08 Å for γ = 1, 0.5, 0.25, 0). Analytic + logged (#1057 via the range-and-order record). Pitfall: one seed per exponent; populations and torsions did not follow.

**V27. Two descriptions of one molecule (interactive).** Insight: the 109 numbers over-determine the molecule; agreement between them is a constraint the network must learn and the rebuild can enforce. On screen: a short 2D chain whose shape is given both by its bend angles and by one "loud" end-to-end vector; the user drags the vector and the least-squares rebuild (with and without a hard core) moves the chain; a counter shows the constraint residual. Computed live (a few-bead Levenberg–Marquardt in JS). Pitfall: 2D toy; BBA has 3 constraint directions and 103 + 6 channels.

**V28. A storyboard for a narrated chapter "From range and order to a usable force field".** (1) The two halves of BBA (V1). (2) When noise erases what (V2/V3). (3) Anti-order and the loud block (V4, V5, V7). (4) The block in the rebuild (V11). (5) The force field: phantom spring, blur squeeze, fitted wall, cancelling errors (V8, V9, V10). (6) What is still missing: drift, handedness twist, equilibrium (V13, V17). Each beat uses only logged numbers or exact toys.

---

## 7. Open questions, caveats, contradictions and superseded interpretations

1. **"The loud block adds nothing in simulation"** (study, 2026-11-15) → superseded on 2026-11-16 (#1100): the executed loud-mode force read-out used the rotation-invariant volume term; with the immersion term its 100 ps size error is 0.24 Å (s3) and seed 2 does not compact; the stationarity test shows C3 has a low-level compaction bias and the loud models do not. Any figure built from #1088/#1089/#1091 loud-mode simulations must be labelled "wrong volume term".
2. **"The drift is an error of the learned force at small noise levels"** (#1089, 11-15; #1091, 11-16) → for the loud-mode models mostly superseded (#1100); for C3 still the working reading. But even with the correct term every loud-mode force field keeps compacting between 100 and 300 ps (#1130, 11-18). Whether the #1109 correction stops this is open (#1136, #1113).
3. **"Longer training does not fix the drift"** (#1091, 2× training, wrong volume for loud models) versus **full schedule: 0.118 Å at 100 ps vs 0.24–0.34 Å at 190,350** (#1104, 10× training, correct volume, one seed). Not necessarily contradictory (different volume term, budget, panel), but the 100 ps value is a point on a drift; the declared 300 ps panel of this checkpoint is the test.
4. **"Library force field more compact than executed"** (#1115, 11-17/18) → chance (#1130, 11-18).
5. **Volume-term magnitude**: "an inward force of about 0.6 kT/Å on Rg" (#1100) vs "differ by a term that grows by 0.32 per Å of Rg, of which 0.18 from ½ logdet(inertia)" (#1103). Different quantities (a measured tilt in the stationarity test vs a regression of the log-volume difference on Rg over frames); both predict the same reweighted mean (9.58 / 9.64 Å).
6. **Rouse overlap numbers**: issue #1124 (preliminary, 11-18) gives |cos| 0.991, 0.985 with the individual fitted modes and 0.898, 0.695 for the 7.3 Å contact network; lab #1129 gives principal cosines between subspaces 0.999, 0.994 and 0.993, 0.736. Different measures, consistent conclusion.
7. **Data overlap rate** is quoted as 0.01% (#1100, #1106, #1109), 0.005% (#1092, #1115) and 0.004% (#1089); different reference sets.
8. **The C3 hint**: the C3 note said the executed hint used the NeRF rebuild; #1111 found it used the transfer-frame `chain_hint` (identical whenever every phase pair is ≥ 0.05 long); the note was corrected.
9. **Selection after results**: five models went to the full schedule by the owner's choice (amendment), one seed each; the late-repulsion settings were chosen on seeds 0/1 at 50,000 updates; the joint-rebuild and #1109 corrections were chosen on the 190,350-update executed models.
10. **Tight verdicts**: the #1071 Cartesian-level criterion missed by 0.007 Å; #1107's contact condition passed by less than 0.0001; #1109's seed-3 size error sits at the floor's 95% point; #1139's 30% limit falls between the two seeds' 28% and 32%.
11. **Equilibrium is untested**: BBA folds on microseconds; all simulations are ≤ 500 ps; folded shares after 500 ps "show the direction of the drift only".
12. **Readable windows do not yet predict learning** (Q4 of the study untested; #1068 a documented counter-case for torsions).
13. **The paper metric at the paper's count** (1,300,156 samples, ~14–23 H200 GPU-hours per model) and the paper's 200 ns simulation protocol have not been run (#1138 proposal).
14. **Open predictions of note 30**: P1 (whitened block keeps ~½ the size gain; #1137 declared) and P4 (more range for contacts alone will not remove overlaps without a supplied wall).
15. **Is a third loud vector worth training?** It would carry handedness through triple products; a 0.05 deficit in one bin does not justify it alone (#1134, #1140); more vectors also add constraint directions and local cost.
16. **Can overlaps be removed without repairs?** (#1095) — topology inputs no (#1092), lower floor no (#1101), skeleton map only at Cartesian local accuracy (#1068).
17. **Transfer** (#1124): Rouse directions transfer; size needs an estimate (only other-protein scaling within 10%, one comparison); internal whitening needs a per-channel predictor (#991); step 2 (train with Rouse modes) needs GPU approval.
18. **Beyond BBA**: Chignolin not trained; ALDP5 cannot test order; anti-order is predicted to worsen for longer chains [H].
19. **The guide programme** (#1117–#1123, opened 11-18) re-frames the block as a "guide" and asks whether timing or information drives the gain (#1120) — not started.
20. **C3's own drift** (no volume error) is not explained beyond its low-level bias and the missing wall.

---

## 8. Sources read

**Lab (all read in full)**: `lab/README.md`, `lab/TEMPLATE.md`; `2026-11-16-bba-force-field-diagnosis` (#1100), `2026-11-16-bba-low-noise-continuation` (#1101), `2026-11-16-loud-mode-block-consistency` (#1102), `2026-11-16-loud-mode-joint-rebuild` (#1105), `2026-11-16-readable-windows-noise-precedents` (#1099), `2026-11-17-bba-loud-mode-library-rerun` (#1115, incl. `card.yaml`), `2026-11-17-bba-simulation-fitted-wall` (#1106), `2026-11-17-bba-wall-fit-size-term` (#1109), `2026-11-17-loud-mode-joint-rebuild-excluded-volume` (#1107), `2026-11-18-bba-loud-mode-equilibration` (#1128), `2026-11-18-bba-loud-mode-force-size-followup` (#1130), `2026-11-18-handedness-gap-long-range` (#1139), `2026-11-18-handedness-gap-torsions` (#1134), `2026-11-18-loud-mode-handedness` (#1133), `2026-11-18-loud-mode-transfer-checks` (#1129), `2026-11-18-range-order-mechanisms` (#1131, plus `chain_model.py`), `2026-11-19-handedness-gap-arm` (#1140).

**Docs**: `docs/status.md` (full), `docs/roadmap.md` (gates), `docs/README.md`, `docs/sprints/sprint12/real-budget-study.md` (full), `docs/investigations/bba-range-and-order.md` (full), `bba-internal-force-field-size-drift.md` (full), `bba-internal-force-field-longer-training.md` (full), `bba-internal-loud-modes-first-chunk.md` (summary, §§1–3), `bba-c3-local-accuracy-screening.md` (summary), `docs/design/driver-recommendations.md` (§§1–2), theory notes `27-readable-windows-and-noise-order.md` (full), `29-score-to-force-pullback.md` (full), `30-loud-blocks-in-redundant-charts.md` (full).

**Open PRs (bodies, comments, relevant diffs)**: #1138 (ScoreMD paper read-out; `eval/scoremd_paper.py`), #1137 (whitened loud block), #1136 (corrected drift), #1127 (leaderboard endpoints), #1113 (wall/size 500 ps), #1104 (candidate study, full-schedule card and doc diffs, first full-schedule results), #1092 (chain-topology attention). None had review comments.

**Merged PRs (bodies)**: #1088, #1097 (with its comment), #1103, #1108, #1110, #1111, #1114, #1116, #1125, #1126, #1135; titles and dates of all merged PRs #1071–#1140 from `gh pr list`; dates of the closed source PRs #985–#1074.

**Issues**: #283 (last 14 comments), #1094 (with comments), #1095, #1096, #1117, #1118, #1119, #1120, #1121, #1122, #1123, #1124 (with comment), #17 (comment of 11-16).

**Numeric checks (mine)**: `scratchpad/checks.py`, `scratchpad/checks2.py` (schedule, $t_{1/2}$ formula, one-torsion readability, constraint shares, $c_0$, torsion blur, loudness conversion, PMF floor fit).
