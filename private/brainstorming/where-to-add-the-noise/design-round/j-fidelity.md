# Judge: fidelity (science and honesty)

Judge on the fidelity lens, 2026-11-19. I read the brief, the critic, the g4 number canon and all five proposals
in full: d1 story, d2 mechanism, d3 evidence, d4 interaction and d5 visual.

**What I checked, and against what.** I checked 50 groups of numbers and formulas (about 180 individual values).
- Most were checked against primary sources: the theory notes, sprint summaries, investigations and lab READMEs in
  `SP/rg-main`, the evidence JSON files, and PR bodies via `gh pr view` (#1071, #1103, #1104, #1138 and #1141).
- About 30 derived values were recomputed inline, without writing any files.
- §1 lists every check. Two kinds of source are only secondary: the ScoreMD paper tables (quoted by g1; the paper
  itself was not reopened) and the collision counts (taken from r4/g2 dossiers, except Cartesian's 682).

## 0. Verdict in brief

All five proposals are unusually careful. Each one respects the g4 canon on the points the critic found most
dangerous:
- none shows note 25's invalid "Cramér–Rao" αL bars;
- all use 0.27–0.28 as the C3 radius-of-gyration (Rg) window;
- none draws a κ arrow across definitions;
- σ is shown dimensionless, then in its unit;
- the "two walls" idea is always badged as a hypothesis;
- loud-mode force numbers from before 2026-11-16 are marked as superseded;
- the Chignolin transfer result (computed on generated dummy frames) is excluded;
- open-PR numbers are flagged.

The differences lie in a few systematic slips that the merged programme must fix (§3). The most important:
1. **Budget mixing on the paper-metric PMF.** 0.097/0.096 are full-schedule values (one seed each). They are placed
   next to ScoreMD's 0.202/0.315, which are at 10% of the budget. Seen in d2, d3 and d5; d1 and d4 label it only
   partly.
2. **Sprint 5 pairing across campaigns.** wδ's 0.103 ± 0.009 (2k campaign) is paired with flat 0.263/0.268 (10k
   relaunch). Seen in d3, d4 and d5.
3. **"Predicted the optimal block size."** Note 30's "why two vectors" was written after the block-size sweep. Only
   the takeover window was declared before its run. Seen in d1, d3 and d4, echoing r7.
4. **Chain-model numbers tagged as measured [M].** They are exact or Monte Carlo evaluations of a stated model, so
   they should be derived [D]. Seen in d1 and d4.
5. **"Springs failed outright" on the first BBA chunk.** Springs got the size right (Rg W1 0.078 Å) and lost only
   their bond advantage (0.320 Å). Seen in d2, d4 and d5.
6. **K_tan given in Å⁻².** It is "per squared thermal width". Seen in d4 and d5.
7. **The reconciliation with Part 1 Problem 3.** d5 adopts the a1 "vector side" reading that the critic flags. d3's
   card says the samples "feel errors in ångström", but note 21 Prop 8 says they feel them in the metric norm.
8. **Missing caveat at 100 updates.** The flat arm's JS of 0.117 there is computed on 10% valid molecules. No
   proposal says so.

**Ranking on my lens:**
- d3 is the most faithful: a ledger behind every number, its own checks against local data, and every floor drawn.
- d1 and d2 follow closely. d1 has the most complete honesty apparatus for the history; d2 makes every derived claim
  exact and testable.
- d4 and d5 have more small errors, but each brings a valuable honesty rule (d4: lens/lever discipline and "no
  ghost posteriors in the 103-dimensional chart"; d5: "no pixel blur, every blur is an ensemble of real draws").

**Recommended spine: d1.** Its question-led structure makes the honest history load-bearing. Graft in:
- d2's rigs, as the computational core of each mechanism scene;
- d3's evidence ledger and its two floors, as the number system;
- d5's rail and its rendering rules;
- d4's lever/lens rules.

## 1. Number and formula checks

✓ = matches the primary source. ✗ = error or risky reading (with the proposals affected). "Recomputed" = computed
here.

| # | Claim (where) | Primary source | Verdict |
|---|---|---|---|
| 1 | Integrated stiff over-charge ≈1.5× "(17.5 vs 11.4)" (d2 2.5, d4 P2-S08, d5 3.0) | note 21 §6 l.597–603, §8 l.697 | ✓ These are the likelihood-bound costs of a 5% score error, stiffest vs softest mode, in units of ½(0.05)². |
| 2 | Note 21 labels: Prop 5 (no trained level resolves a bond), Lemma 4 (configuration-dependent metric, so no closed form), Prop 8 (a constant score error shifts the samples by Σδ at KL ½δᵀΣδ) (d1, d2) | note 21 l.92, 206, 499, 571, 583 | ✓ |
| 3 | "Bond SNR at t = 0.01 is 0.30–0.46 under every unit convention" (d4 P2-S08) | g4 §3.6 (note 21 §5.2) | ✗ 0.30–0.46 is the manifold-route convention. The pilot scale gives 0.34–0.52 and the window mode 0.16–0.18. Only "SNR < 1" holds in every convention. |
| 4 | Joint rebuild overlaps 14.5/15.3 → 19.3/20.1 → 0.0%; Rg W1 0.117/0.091 → 0.077/0.064 → 0.083/0.070; control 0.131/0.105 | lab 2026-11-17-loud-mode-joint-rebuild-excluded-volume | ✓ d2, d3. ✗ d1 E6.6 writes 19.4/20.1. |
| 5 | Sprint 5: wδ 0.103 ± 0.009 against flat 0.263/0.268 (d3 2.5, d4 P2-S06, d5 2.6) | sprint5/summary.md l.110–153 | ✗ Different campaigns. 0.103 is ep1000 of the 2k campaign, whose flat controls are 0.239 ± 0.007 and 0.293 ± 0.020. The 10k relaunch has wδ 0.100 ± 0.006 (ep5000) and 0.119 ± 0.012 (ep10000, only 77% physical) against flat 0.263/0.268. d1 pairs within the 10k campaign and states the 77%. |
| 6 | Sprint 1: 0.117 ± 0.007 vs identity 0.479 ± 0.005; the single-seed 0.180 is superseded | sprint1/summary.md l.78–113 | ✓ The same table has the best flat arm (flat WG) at **0.167 ± 0.012**. Only d3 shows it. Without it, "4×" overstates the early win against flat diffusion in general. |
| 7 | Sprint 7: finite fraction 0.9996, JS 0.325, αL 25.2% vs 0.60% (reflection-confounded); worst condition 1.55×10⁶ vs 4.2×10³ and λ_min 1.6×10⁻⁴ vs 0.10 "over all 800k reference frames" | sprint7/summary.md l.99, 115, 124 | ✓ (d1–d5) |
| 8 | Sprint 8: flat 0.2846/0.2618 → 0.1012 after the vp_mean fix (on 2,000 samples); ScoreMD-native 0.0151 vs floor 0.0114; the summary table gives wδ 0.1664 vs flat 0.2405 | sprint8/headtohead.md l.62–66; sprint8/summary.md l.96–98 | ✓ d1 pairs wδ 0.1664 from one table with the flat values of the other (minor). d3 states N = 2,000. |
| 9 | Cost 0.74 s / ≈253 s (≈340×) / ≈445 s (≈600×) per sample; chord bound violated on 38.3% (8 sub-steps) vs 2.34% (128) | sprint7/summary.md l.134–138; sprint2/wdelta-way-forward.md l.131–132 | ✓ The flat figure is warm steady state, the manifold figures are cold per-sample cost. "Indicative" is the right label (d2, d3, d4). |
| 10 | 512-frame condition percentiles p50/p99/max 607/51,585/554,855 (d1 E1.5) | metric-numerics-scaling-assessment.md l.426 | ✓ |
| 11 | Nine ALDP5 widths 0.0252…0.6631 Å. Stein ratios: flat production seed 0 0.198/0.252/0.293/0.485/0.459/0.418/0.694/0.727/0.369; spring 0.97–1.03 (directions 1–3) and 0.91–0.99 (4–7); learned 0.96–1.00 and 0.93–1.01 (d2, d4, d5) | force-field-simulation/evidence.json | ✓ d2's "softest direction gives 0.52" holds for seed 0 only (seeds give 0.52/0.59/1.18). d2's "low floor at 0.003: 0.91–1.04" is also seed 0 only (seed 1 was read at 0.001). |
| 12 | ALDP5 simulations: flat low floor JS 0.142; flat production JS 0.026 but bonds 1.105σ and 37% valid; spring 0.024, 0.064σ, 97% valid; 83% αR vs MD 35%; 16% φ>0 vs 1.65% (d1, d2, d4, d5) | evidence.json `distribution_200k_by_seed`, `basin_populations` | ✓ d3's 89% αR and 31% φ>0 are last-record β-relaxation statistics, and d3 labels them as such. |
| 13 | Two-bead Euler–Maruyama limit h < 1/k (6.0–9.1×10⁻⁴ Å²); "walkers blew up at 4×10⁻⁴" (d2, d4) | evidence.json `step_size_seed0` (learned arm: 73.8% failed at 4×10⁻⁴) | ✓ The measured blow-up happens below the toy's limit. Say so: stiffer coupled directions or a rough learned force. |
| 14 | ψ width 78° globally and 50–52° inside αR or β (d4 P2-S01) | note 25 l.287–288 | ✓ But d4 combines it with a bond width from bgmol (note 20) in one ruler, against its own rule of one data set per figure. |
| 15 | Tweedie prediction 0.39–0.46; observed 0.44–0.53 (#765, 200k) and 0.49–0.58 (#754, 40k); classifier AUC 0.66 → 0.91 | feature-space-evaluation.md l.290–313; learned-stiffness-diffusion-pilot.md l.22; joint-distribution-metrics.md l.38 | ✓ (d1, d2, d3) |
| 16 | Loss blindness: excess 0.0093 at 23% too broad; going from 8.5% to 5% lowers the loss by ~0.001, 20–70× below the 0.02–0.07 minibatch scatter; the σ ≈ w band is ~6% of training times | learned-stiffness-diffusion-pilot.md l.889–930 ("an idealized calculation, not a measurement of the network") | ✓ d1, d2 (whose recomputation is labelled), d3 |
| 17 | Retention pilot: flat erases bond-width information between t = 0.0023 and 0.033 (3% of training times); spring16 between 0.050 and 0.28 (24%) (d3) | information-retention.md l.202 | ✓ This is the bond-width row. The critic's 3–7% vs 17–34% covers all stiff blocks. |
| 18 | Learned warp step anisotropy κ_step 184/185 → 2.99/3.04 (floor 1.55); constant whitening 24.6; scaled internal 3.88/3.95; ALDP10 1,780 → 3.62; top-4 overlap with bond gradients 0.973 (chance 0.444) | learned-stiffness-warp.md l.215–253 | ✓ (d3, d4, d5) |
| 19 | Lag sweep: JS at 100 updates flat 0.117, warps 0.127/0.049/0.027, spring γ 30/8/2 0.133/0.149/0.163; at 20k 0.0203 vs 0.0227–0.0236; KL 0.14 vs 0.96; ψ step 17.9/31.7/63.4°; αL saddle 30 vs 4–6 per 10⁴ at 20,000 updates | learned-warp-lag-sweep.md l.16–35, 140–201 | ✓ But the flat arm at 100 updates has **10% valid molecules** (l.178), so its 0.117 is computed on a tenth of its samples. No proposal says this. |
| 20 | Note 22. Cone K_tan = 0.0293. True-Hessian K_tan −0.684 (23× larger); indefinite beyond 0.016 Å of compression; 9% angular shrink per 1% stretch. Four-point table; equivariant shells 0.14–0.56 vs 0.018–0.11. ALDP5 bound 0.2–1.5%, achievable 1–8% | note 22 l.110–122, 315–350, 495–560 | ✓ K_tan is **per squared thermal width** (note 22 Prop 6). ✗ d4 P2-S09 and d5 3.2 write Å⁻². |
| 21 | Note 27 §5 best-estimator windows (Cartesian / C3 / C1) | note 27 l.257–281 | ✓ The exception is C3's slowest TIC at 0.49, later than its other features. Only d5 shows it; d3 says "everything between 0.18 and 0.35". |
| 22 | Loud block alone: Rg window ≥ 0.42. Best correlated Cartesian noise erases bonds at 0.0049. EigenFold spans five decades of order. The pair count is 153, not 136 | lab 2026-11-16-readable-windows-noise-precedents l.25–60; note 27 l.211 | ✓ d5 5.7 attributes "≥ 0.42" to note 27; it comes from this lab entry. |
| 23 | Range–order mechanisms. First-order windows (internal / +2 loud): Rg 0.19/0.44, pairs ≥11 apart 0.16/0.29, end-to-end 0.14/0.24, closest contact 0.013/0.025. Chain table; constraint gains and shares 74/87/96%; KL 0.0766 (0.0883 for two basins). Mode statistics 15.0/6.0/2.9/1.3/0.49; 83/96%; length variances 6.9/2.5/0.9/0.6 vs a torsion's 2.0; Rouse overlaps 0.99/0.99/0.91/0.92. Floor blur 0.36 Å (0.32 Å and 2.3% overlaps decoded). A perfect read-out without the volume term shrinks Rg by 1.7–1.8 Å | lab 2026-11-18-range-order-mechanisms l.40–140 | ✓ (all) |
| 24 | γ dial: Rg W1 0.499/0.514, 0.187, 0.120, 0.081 Å; torsion error 9.7/10.4, 6.5, 7.1, 9.1°; population error 0.107/0.106 … 0.086; screened Rg windows 0.48/0.46/0.43/0.20 | bba-range-and-order.md l.92–104, 336–350 | ✓ (d3, d4) |
| 25 | Block-size sweep K = 0…27: Rg W1, torsion error and angle rows | bba-range-and-order.md l.105–120 | ✓ But the source says "the global gain is the same for 1 to 8 vectors (ties by the rule fixed in advance)". Only d3 shows the tie; d1, d2, d4 and d5 draw K = 2 as a minimum. |
| 26 | Why C3 swells (#1055): mean Rg 11.07 vs 10.60 Å; ~90% from the hairpin–rest separation; 94 ± 25% of the excess reproduced from t = 0.3; bands of 0.27–0.43 Å; ~70% of the gradient from t < 0.05; accumulation ≤ 0.14 Å (this corrects #1025) | bba-range-and-order.md l.210–240 | ✓ (d1) |
| 27 | 92% of C3's excess Rg² comes from pairs ≥ 11 apart (#1015) | bba-range-and-order.md l.196, 866 | ✓ (d3, d5) |
| 28 | Registered-budget table (22 models) and its effect table: ×119 bonds, ×8.5 angles, ×2.0 populations vs ScoreMD; size and contacts are **ties** because of ScoreMD's seed spread; wδ bonds ×86 | real-budget-study.md l.255–310 | ✓ (all; d3 shows the ties) |
| 29 | Pre-registered size limit 0.11 Å: met by seed 3 (0.091), missed by seed 2 (0.117) | PR #1071 body | ✓ d1 and d3 show the miss. |
| 30 | Paper PMF. At 1,903,500 updates (one seed each): ordered internal 0.097, covariance-matched base 0.096, C3 0.113. At 380,700: ordered 0.109/0.109. At 190,350: Cartesian 0.116/0.113, wδ 0.161/0.198, ScoreMD 0.202/0.315. Floors 0.56/0.18/0.080/0.039/0.025. The paper uses 1,300,156 samples; "≈0.02 at the paper's count" is inferred and the floor ≈0.006 extrapolated | PR #1138 body | ✓ numbers. ✗ Budgets mixed without labels in d2 4.7, d3 6.6 and d5 5.8/6.7; d5 places 0.097/0.096 in a scene headed "190,350 updates". d1 E6.2 and d4 P4-S10 label only ScoreMD's budget. |
| 31 | Full schedule (#1104): ordered internal 0.111 (seed 2), C3 0.455 (seed 0); joint rebuild 0.105 with overlaps 11.8% → 0%; force field 0.118 Å vs 0.24–0.34 Å; five models chosen after stage 1 | PR #1104 body | ✓ (all) |
| 32 | Wrong volume term (#1100): size error 0.98 → 0.24 Å (seed 3, 512 paths); ≈0.6 kT/Å inward; 9.58 vs 10.66 Å predicted, simulations ended at 9.6–9.7; Rg residuals C3 −4.6/−2.8 vs loud +1.9/+2.3; a correction that zeroes the test (z 7–15 → 0.7–0.8) still fails in simulation | lab 2026-11-16-bba-force-field-diagnosis l.25–75 | ✓ (all) |
| 33 | Immersion volume (#1103): log-volumes 17.808/16.924 vs 17.815/16.934; the invariant formula gives +1.87 instead of −0.88; 10.81 → 9.64 Å on 2,000 frames; 0.32 per Å; K = 1 is not force-ready | PR #1103 body | ✓ (d2, d3, d4; d3 keeps the two frame sets apart) |
| 34 | Drift (#1130): 0.158–0.277 / 0.229–0.492 / 0.396–0.642 Å at 100/200/300 ps; per-seed rows; panel floor 0.084 Å; the same checkpoint reads 0.337 (512 paths) vs 0.277 (2,048); mean Rg −0.21 to −0.41 Å; size error ×1.7–2.9 | lab 2026-11-18-bba-loud-mode-force-size-followup l.38–70 | ✓ (d1, d3, d4, d5) |
| 35 | Wall plus size term (#1109): overlaps 21.3/18.4% → 0%; size error 0.267/0.175 → 0.263/0.173 Å; pair error 0.062/0.055 → 0.042/0.032 (floor 0.037); −0.16 per Å; 0.16 × 4.8 Å² ≈ 0.8 Å "an estimate"; wall alone swells mean Rg to 11.1–11.3 Å | lab 2026-11-17-bba-wall-fit-size-term l.25–75 | ✓ (all) |
| 36 | Contact blur at t = 0.01 by number of loud vectors K: 0.37/0.32/0.22/0.16/0.15 Å; at 0.05: 1.46/…/0.85 Å; wall z 9.9 → 9.6 and 15.0 → 15.0 after training lower | lab 2026-11-16-bba-low-noise-continuation l.36–95 | ✓ (all) |
| 37 | Reverse path (#1133): R² 0.13 → 0.63/0.60 at t = 0.13 → 0.97; mean \|a₁\| block/chain 21/59 → 40/41 Å; share already with final sign 0.55 → 0.65–0.69 → 0.88; handedness bins 0.169/0.268/0.371/0.470; generated (Rg < 9.5 Å) 0.256/0.247 vs 0.249 | lab 2026-11-18-loud-mode-handedness l.60–140 | ✓ The source says the two \|a₁\| estimates "differ by construction" at high noise. Only d3 and d4 carry that caveat; d1 and d5 show the gauges without it. |
| 38 | Handedness gap: arm side 11/10%, coarse quarter-chain dihedral 61/59% | lab 2026-11-19-handedness-gap-arm l.65–88 | ✓ But each share comes from a separate matching ("reproduces 61% of the gap"). The shares overlap and sum to more than 100%, so d1's and d5's "waterfall" would add non-additive numbers. |
| 39 | #1141, Rouse mode directions: decoded Rg W1 seed means 0.101 vs 0.097; joint rebuild 0.075 vs 0.077; force field 0.35/0.32 vs 0.26/0.22 Å | PR #1141 body | ✓ d3's per-seed values match these means. d3 omits the descriptive force-field cost. |
| 40 | First BBA chunk (190,350 updates, seed 0): internal 0.000274 Å / 0.166° / 0.521 Å; Cartesian 0.415 / 5.24 / 0.072; springs 0.320 / 8.85 / **0.078** (97,113 decoded); whitening 0.705 / 24.4 / 0.497 (96,271 decoded); wδ 0.113 / 3.24 / 0.085; ALDP5 training time wδ 318 s vs Cartesian 259 s | sprint12/matched-results.md l.60–186 | ✓ numbers. ✗ "Springs and whitening failed outright" (d2 3.7, d4 P3-S08, d5 4.3) and "every model gets only one scale right" (d1 E4.4): springs had Cartesian-level size, and whitening got neither scale right. |
| 41 | Severe collisions per 10⁵: Cartesian 682, internal 1,186, springs 995, whitening 3,482, wδ 0 | molecular-density-method-assessment.md l.88 (682); r4/g2 from the candidate dossiers | ✓ The 682 is primary; the rest come from readers. |
| 42 | BBA pullback campaign (#895): bond W1 0.6371 vs 0.0122 Å (52×); TIC JS 0.0529 vs 0.0479; whitening TIC JS 0.2499 and PMF 4.832; PMF 6.57 → 0.56 from 2k to 100k molecules | sprint11-pullback-campaign-closeout.md l.32–113 | ✓ (d3) |
| 43 | Spring score base collapses the chain: torsion Monte Carlo with the isotropic Gaussian base gives Rg 5.41 ± 0.51 Å vs data 10.59 ± 2.20 Å; the untrained model itself gave 4.9 Å | bba-local-geometry-preconditioning.md l.205–235 | ✓ d5 calls it a torsion Monte Carlo. ✗ d1 E4.5 presents 5.41 as the model's own value (minor). |
| 44 | Flat catches up: iid bond widths 0.994–1.049 at 200k vs 1.115–1.291 at 20k | supervisor-metric-comparison.md l.73 | ✓ (d1, d3) |
| 45 | αL box in the bgmol benchmark: 319 of 50,000 = 0.638% | benchmarks/aldp5-b3-proposal.md l.82 | ✓ (d3) |
| 46 | BBA Rg mean 10.60 Å; 5/50/95% at 8.37/9.89/15.30 Å; deciles 8.60/9.89/13.74 Å | r8 l.384; lab wall-fit l.82 | ✓ (d3, d5) |
| 47 | TF32 sends ≈11% of geodesic-random-walk paths to ~10⁵ (d4) | sprint8/issue252-tf32-precompute.md l.37 | ✓ |
| 48 | ScoreMD paper. ALDP: Diffusion 0.095 iid / 1.047 ± 0.924 simulated; Two For One 0.206 and C–N bond 23.51 ± 1.91; Both 0.097/0.091. BBA: Diffusion 0.034/5.387; Two For One 1.624, read at **t = 0.005**; Both 0.234/0.254 | g1 l.301–309, 377–378 (quoting the paper) | ✓ (secondary source) |
| 49 | "Mechanisms that predicted the optimal block size and the takeover time" (d1 E6.9, d3 7.8, d4 P5-S08; r7) | note 30 §6 l.220–247 and the predictions list l.318–335 | ✗ Note 30 is dated 2026-11-18, after the block-size sweep (#1057/#1069). "Why two vectors" is an explanation. Of its four declared predictions: the takeover window (0.26–0.1) **matched**; weaker handedness in compact molecules was **not borne out** (the torsions carry it); two are open. |
| 50 | Values recomputed here: nine-mode t½ and readable shares; γ at which the stiffest mode enters the band 0.142; spreads ×40.6/4.8/2.0; t½(0.2/0.3/2/6/15) = 0.130/0.157/0.327/0.437/0.523; decision window ×16 = 2.77 nats; rail anchors 140/406/683/877/973/1128/1303/1480; banana KL ½ln(1 + 2A₂₂²/(81A₁₁)) = 0.474/1.748 and ψ 2.0/40.5/1.125; A(0.1) = 0.988, A(1) = −0.111; cone c = 0.10296, σ_r = 0.0266 Å, σ⊥ = 0.258 Å, 5.91°, R = 5.81; deficit 0.0411, ρ = 2.904, Kρ² = 0.247; torsion readability κ = √2 0.940/0.716/0.530 and κ = 1.504 0.947/0.747/0.565; vise σ ≤ 0.0058 Å; Cartesian inflation at t = 0.03 4.22; ΔF 3.40/4.09/3.15 kT; contacts need ≈1° of blur, reached at t ≈ 0.005; torsion blur 1.70°/6.63°/12.96° | recomputed | ✓ (all) |

## 2. Scores

Each criterion is scored from 1 to 10; my lens (fidelity) is weighted most in the overall score.

| Proposal | Fidelity | Explanatory | Craft | Feasibility | Coherence | Overall |
|---|---:|---:|---:|---:|---:|---:|
| d1 story | 9.0 | 9.0 | 8.5 | 6.5 | 9.5 | **9.0** |
| d2 mechanism | 9.0 | 9.5 | 8.5 | 8.5 | 8.5 | **9.0** |
| d3 evidence | 9.5 | 7.5 | 7.5 | 7.5 | 8.0 | **8.5** |
| d4 interaction | 7.5 | 8.5 | 8.5 | 7.0 | 8.5 | **8.0** |
| d5 visual | 7.5 | 8.5 | 9.5 | 7.0 | 9.0 | **8.0** |

### d1 story
Strengths:
- The most complete honesty apparatus for a history: dated correction pills, the List of Musts, a claims ledger
  with superseded claims, and a "Not established" list in the finale.
- It shows the pre-registered size miss on seed 2.
- The hypothesis scene (E6.5) is a model: a large H badge, a stated test with a prediction, and the decoder and
  force-field caveats.
- Its risks section addresses hindsight linearization: a date ribbon shows that questions Q2–Q4 overlapped in time.
- It reconciles Part 1 Problem 3 with the reading that matches the user's own narrative.

Slips:
- 19.4 for 19.3.
- Chain-model numbers tagged [M].
- "Predicted the block size".
- No by-construction caveat on the reverse-path gauges.
- PMF budgets labelled only for ScoreMD.
- "Every model gets one scale right" (whitening gets neither).
- The non-additive handedness "waterfall".

At 69 minutes and with the heaviest data assets (an 800k-frame planarity scan, adenylate kinase trajectories), it
is the least feasible.

### d2 mechanism
Strengths:
- Every idea gets an exact rig with Node tests. Many values are recomputed and agree with the canon.
- The "toy says / molecule says" badge pair, and the rule that the toy must land near the measurement or the scene
  says why not, are the most falsifiable presentation on the panel.
- New exact transfer-matrix values for the chain model reproduce note 30's Monte Carlo.
- The Problem 3 reconciliation is correct ("a huge weight on a window that the noise almost never opens").

Slips:
- The adenylate kinase beat states a reader's unofficial PCA check as fact.
- PMF budgets are mixed.
- "Springs failed outright".
- The flat arm's validity at 100 updates is missing.
- A few citations are imprecise: Rouse overlaps cited to #1129; individual spring constants cited to note 20 §1.4,
  which prints only ranges.

### d3 evidence
Strengths:
- The most faithful proposal. One ledger with full provenance, a check that every on-screen numeral resolves to
  it, and an "evidence judge" in review.
- Its own checks against local data reproduce note 25's visit counts and dwell times exactly.
- Fair comparisons: the best flat Sprint 1 arm (0.167); the tie with ScoreMD on size; K = 1–8 as a tie; the
  #1100 and #1103 frame sets kept separate; held-out floors that differ by definition; the ScoreMD seed spread.
- The αL barcode with three error bars (the invalid bound struck through, a Markov value, data-based bars) is the
  panel's best honest scene.

Slips:
- Sprint 5 paired across campaigns.
- PMF budgets mixed in the count-dial scene.
- The Problem 3 card says "samples feel errors in ångström".
- The #1141 force-field cost is omitted.
- "Predicted the block size".

Explanatory power and craft are lower: many scenes are tables or strips, and few mechanisms are derived on screen.

### d4 interaction
Strengths:
- Strong honesty rules. Narration never asserts a lens value. Internal-chart posteriors are never drawn as ghost
  clouds, because their effective sample size is 1. κ always carries a subscript; the torsion phase scale is
  renamed c_φ and the spring soft scale k⊥. Toys are clamped where picture and number would disagree.

Errors:
- K_tan in Å⁻².
- The SNR "under every convention" statement.
- Sprint 5 pairing across campaigns.
- One ruler built from bgmol and mdshare widths; its hand-over pushes ψ by about 200°, outside the harmonic basin
  in which the thermal ruler is defined.
- Chain-model gains tagged [M].
- The adenylate kinase beat stated as fact.
- "Springs failed outright".
- PMF budgets mixed.
- "Predicted the block size".

### d5 visual
Strengths:
- The best visual honesty rules: no pixel blur; four honest renderings; forward paths played backward captioned as
  a bridge ensemble that ends at one molecule; a decision bar that shows the order is only partial (3.5 < 16).
- It shows C3's slowest-TIC exception.
- Rail anchors and the encoders are specified exactly.

Errors:
- K_tan in Å⁻².
- Sprint 5 pairing across campaigns.
- Full-schedule PMF values inside a scene headed "190,350 updates".
- The a1 "vector side" reading of Problem 3, which conflicts with r2/LESSONS D18 and the README.
- The (γ, v) pad corner labelled "both": the trained γ = 0 model had a 9.1° torsion error and populations worse than
  Cartesian.
- The unofficial adenylate kinase PCA value tagged [M].
- The "≥ 0.42" window attributed to note 27.
- "Springs failed outright".
- The handedness waterfall.

## 3. Errors and risky claims, with fixes

### d1
1. **E6.6.** The joint rebuild without core has 19.3/20.1% overlaps, not 19.4/20.1% (lab 2026-11-17 excluded volume).
2. **E5.5, E5.7, E5.8.** Chain-model values are tagged [M chain model]. Tag them [D, exact or Monte Carlo on the
   stated model] so they are not read as BBA measurements.
3. **E4.4.** "Every model gets only one scale right". Say "at most one": whitening got neither (0.705 Å, 0.497 Å,
   3.7% failed decodes). Draw the springs at their Cartesian-like size (Rg 0.078 Å).
4. **E4.5, Must M5.** 5.41 ± 0.51 Å is a torsion Monte Carlo with the isotropic base; the untrained spring-base
   model measured 4.9 Å. Show both, tagged [D] and [M].
5. **E5.9.** The gauges "block/chain 21/59 Å at t = 0.6" differ by construction (posterior means). Add #1133's
   caption.
6. **E6.9.** "Mechanisms that predicted the optimal block size". Say "explained why two vectors (after the sweep)
   and predicted the takeover window (declared before the run)". Mention that the compact-handedness prediction
   was not borne out.
7. **E6.2.** State budgets on every PMF value: 0.097, 0.096 and 0.113 at 1,903,500 updates (one seed each);
   ScoreMD at 190,350; and the nearest budget-matched value, ordered 0.109/0.109 at 380,700.
8. **E5.6.** Add the pre-fixed tie: "K = 1–8 tie on size; the local cost grows from K = 4".
9. **P0.0.** "Arrows keep pointing correctly to t ≈ 0.5". Mode 1 is half erased there (first-order t½ 0.52); say
   "readable until about 0.5".
10. **P0.2 Q1 and E1.7.** Show Sprint 1's best flat arm (0.167 ± 0.012) beside 0.479, so the "+" line is fair.
11. **E5.1.** The demo posterior must exclude temporal neighbours (±1 µs, note 27 traps). Draw ghosts only in
    Cartesian coordinates; the effective sample size is 1 in the 103-dimensional chart.
12. **E6.8.** The handedness shares are separate matchings that overlap and sum to more than 100%. Use separate
    bars, not a waterfall.
13. **E4.3.** The flat JS of 0.117 at 100 updates is on 10% valid molecules; show the validity.

### d2
1. **P.2 beat.** "The straightness came from the data, not from the metric" rests on g2's unofficial PCA. Badge the
   beat as unofficial, or say "the directed data alone reproduce it (programme check)".
2. **4.7.** PMF 0.097/0.096 (1,903,500 updates, one seed) sits beside ScoreMD 0.202/0.315 (190,350) with no budgets.
   Add budget chips and ordered 0.109/0.109 at 380,700.
3. **3.7.** "Springs and whitening failed outright". Say: springs lost their bond advantage (0.320 Å) but kept
   Cartesian-level size (0.078 Å); whitening failed on both scales.
4. **P.6.** Add the 10% validity to JS 0.117 at 100 updates.
5. **4.4.** Cite the BBA Rouse overlaps 0.99/0.99/0.91/0.92 to the 2026-11-18 range-order lab entry, not to #1129,
   so they are not associated with the excluded Chignolin check.
6. **3.1.** The spring constants 1,650/1,159/1,108/1,659 and 459/302/411 are cited to note 20 §1.4, which prints only
   ranges (1,100–1,660 and 300–460). Cite the asset or code, or show the ranges.
7. **2.6.** The low-floor ratios at t = 0.003 (0.91–1.04) and the spring softest value (0.52) are seed 0 only. Say
   so, or show all three seeds.
8. **3.5.** The two-bead stability limit (6.0–9.1×10⁻⁴) is above the measured blow-up (4×10⁻⁴). Label it "toy
   limit vs measured failure" and give the reason.
9. **4.4.** Show the K = 1–8 tie in the block-size sweep.
10. **5.6.** "Each remaining defect sits exactly where the theory says this chart cannot help" is consistency
    shown after the fact, not a test. Pair it with the declared predictions and their outcomes.

### d3
1. **2.5.** Do not bracket 0.103 ± 0.009 against 0.263/0.268. Pair ep1000 with ep1000 (0.103 vs 0.239/0.293), or
   ep10000 with ep10000 (0.119, 77% physical, vs 0.263/0.268, 100%).
2. **6.6.** The "model points at 100k" list mixes 1,903,500-update values (ordered, covariance base, C3) with
   190,350-update values (Cartesian, wδ, ScoreMD). Add budget chips and use the no-comparison glyph across budgets.
3. **3.6.** The reconciliation card's "the samples feel errors in ångström" is wrong. Note 21 Prop 8: the samples
   feel errors in thermal widths, so equal relative errors cost ½(0.05)² in every mode. The flat loss misses bonds
   because σ ≈ w for only ~6% of training times.
4. **5.5.** Add #1141's descriptive force-field cost: the Rouse force field is somewhat more compact (0.35/0.32 vs
   0.26/0.22 Å).
5. **3.2.** "The bonds become readable below t ≈ 0.005" describes the stiffest principal mode. A bond length (a
   difference of two beads, √2σ) is half erased at t ≈ 0.003–0.004.
6. **5.3.** "C3: everything between 0.18 and 0.35". Draw the slowest-TIC exception (0.49).
7. **7.8.** "Mechanisms that predicted the block size". Same fix as d1 item 6.
8. **4.2.** Show the validity of the flat arm at 100 updates.

### d4
1. **P2-S09.** K_tan is 0.0293 per squared thermal width (dimensionless), not Å⁻².
2. **P2-S08.** Write "SNR < 1 in every convention (0.30–0.46 manifold route, 0.34–0.52 pilot scale, 0.16–0.18
   window mode)".
3. **P2-S06.** Sprint 5 campaign pairing; same fix as d3 item 1.
4. **P2-S01.**
   - Take all widths from one data set (mdshare trajectory 1 has bonds of 0.025–0.031 Å and ψ of 50–52°).
   - Reword the hand-over. Four ψ widths is about 200° of rotation, outside the harmonic basin where the thermal
     ruler holds. Ask instead how many Å of ψ swing equal one bond width.
5. **P4-S06.** Tag the chain-model gains [D], not [M].
6. **P2-S03 beat.** The adenylate kinase claim needs an "unofficial" badge in the beat, not only on the number.
7. **P3-S08.** Reword "springs and whitening failed outright" (see d2 item 3).
8. **P4-S08.** Mark K = 1–8 as tied on Rg (the pre-fixed rule).
9. **P4-S10 and P5-S08.**
   - Add budget chips to the PMF values.
   - Change "predicted the block size" to "explained".
10. **P2-S07.** The ALDP5 γ family (λ^{1−γ} on nine constant Gaussian modes) is an idealization the project never
    trained. Badge it [D, idealized], so the P4 reuse ("same handle, verdict flipped") does not imply that an ALDP5
    measurement exists.

### d5
1. **3.2.** K_tan is per squared thermal width, not Å⁻².
2. **2.6.** Sprint 5 campaign pairing; same fix as d3 item 1.
3. **5.8 and 6.7.** The PMF 0.097/0.096 values are 1,903,500-update, one-seed values, inside a scene headed
   "registered budget, 190,350 updates". Move them to the budget-clock panel with chips; at 380,700 the ordered
   model has 0.109/0.109.
4. **3.0.** Replace "the vector side means the loss barely sees bonds" with the resolution reading the critic
   recommends: no trained level resolves a bond, the σ ≈ w band is ~6% of training times, the integrated
   over-charge is ≈1.5×, and the samples feel errors in the metric norm.
5. **5.4.** Relabel the (γ = 0, v = 1) corner from "both" to "bonds and size". Show its torsion error (9.1°) and
   population error (0.086 vs Cartesian 0.046), and say that the final design is internal coordinates plus two
   loud modes, not this family.
6. **2.7.** The Cartesian PC1 of 0.8934 is tagged [M] before asset A11 exists; it is g2's unofficial check. Tag it
   † until reproduced, soften the beat, and reconcile on screen Diepeveen's "about 85%" with the ProteinAtlas
   re-run's 0.8927.
7. **5.7.**
   - Attribute "block alone ≥ 0.42" to lab 2026-11-16-readable-windows-noise-precedents.
   - Add the by-construction caption to the |a₁| gauges.
8. **4.3.** Reword "springs and whitening failed outright".
9. **5.1.** The 20,000-frame display posterior must exclude ±1 µs neighbours; otherwise it shows the very leakage
   its own panel warns about.
10. **6.6.** Use separate bars for the handedness shares, not a waterfall.

## 4. Fidelity rules for the merged programme (cross-cutting)

1. **Every trained number carries chips for budget, seeds and molecule count.** PR #1138 mixes 190,350, 380,700 and
   1,903,500 updates in one table, and the merged programme must not.
2. **"Native ScoreMD" means the unregularised Diffusion arm at 10% of the budget**, read at t = 0.01 or 10⁻³. Its
   full-schedule panel is still pending (due 2026-11-19 evening).
3. **Model computations are [D].** This covers the chain model, the nine-mode Gaussian basin, ALDP5's γ family, the
   banana and the radial toy, even when they are evaluated by Monte Carlo. [M] is reserved for molecules, trained
   models and MD.
4. **Values derived by this workflow's readers carry † until an asset reproduces them.** This covers the AK PCA, the
   first-order wδ windows and the Markov αL value. Beats that rest on them are worded as conditional.
5. **"Predicted" only for statements declared before the run.** That means note 30's prediction 2 and the stated
   #1137 rule. Everything else is "explained". Show the prediction that was not borne out (compact handedness).
6. **Ties by the pre-fixed effect rule are drawn as ties.** Examples: block sizes K = 1–8 on size; the loud-mode
   model vs ScoreMD on size and contacts.
7. **Pair the Era-1 scoreboard only within one campaign.** Show the validity or physical fraction next to every JS.
   Show Sprint 1's best flat arm (0.167) next to the "4×".
8. **Use one Problem 3 reconciliation**, the resolution reading (r2, LESSONS D18, note 21 §6/§8). The metric-norm
   statement (Prop 8) explains why "relative errors cost the same".
9. **Units.** K_tan is per squared thermal width. σ is shown dimensionless first, then in the unit of the noised
   coordinates. κ is always subscripted.
10. **Displayed posteriors.**
    - Draw them only in Cartesian coordinates or in exactly solvable models; in the 103-dimensional chart the
      effective sample size is 1.
    - Always exclude ±1 µs temporal neighbours.
    - Label forward paths played backward as exact reverse samples (unconditioned) or as a bridge ensemble
      (conditioned on the end molecule).
11. **Do not stack non-additive "reproduces X% of the gap" shares.**
12. **Every "100 ps" force number is drawn as a point on a drift** (#1130), with its panel floor (0.167 Å for 512
    paths, 0.084 Å for 2,048).

## 5. Elements to graft

See the structured result for the list with reasons.
- **From d3:** the ledger and numeral check; the two floors and count dial; the αL barcode; the fair Era-1
  scoreboard; "same word, four windows"; the #1133 gauge captions; the tie in the block-size strip.
- **From d2:** rigs with calibration lamps; toy/molecule badge pairs; exact chain transfer matrices; Part 2 as E2's
  content (Problem 3 reconciliation, the floor scene, the blur dial); the bench explorable.
- **From d1:** correction pills, question surgery, the List of Musts, the E6.5 hypothesis scene, the E6.1 shown
  miss, "Not established".
- **From d4:** lens/lever discipline, no internal ghost posteriors, κ symbol hygiene, the partial-order criterion.
- **From d5:** no pixel blur and the four renderings; the rail; the decision bar showing partial order; C3's TIC
  exception.

## 6. Recommended spine: d1, with d2's rigs inside and d3's ledger underneath

**Why d1.** Its structure makes honesty load-bearing:
- Each episode states the question, shows why the attempt looked promising for a measured reason and lets the
  viewer believe it with a real success. It then shows the measurement that broke it, names the mechanism with an
  epistemic badge, and rewrites the reason for leaving into the next question.
- Failures therefore become results (the moving baseline, finite is not correct, Gaussianization, the wrong volume
  term). Hypotheses have a designated place (E6.5, with a stated test). The finale separates "why optimism" from
  "not established".
- It covers every era with explicit decision records, including Era 4's autopsy and "prediction is not generation".
  d2 is thinner there.
- It already guards against the main fidelity risk of a narrative spine, hindsight linearization: a date ribbon
  shows that Q2–Q4 overlapped, refuted pre-registrations stay visible, and the risks section is the most complete
  on the panel.

**What to graft.**
- **d2's rigs as the computational core of each mechanism scene.** E1's odometer and scale clock, E2 taken from
  d2's Part 2, E3's cone and orange peel, E5's exact chain transfer matrices and seesaw, E6's radial volume toy.
  This turns every [D] on screen into a tested function and keeps the "toy says / molecule says" pairing.
- **d3's ledger, floors and provenance strip** as the only route by which a number reaches the screen, plus d3's
  evidence judge in review. d3's real-molecule scenes (αL barcode, BBA folding window, four charts on one molecule)
  replace the corresponding illustrative scenes.
- **d5's rail geometry and rendering rules**, and d4's lever/lens rules for the playable scenes.

**Trim d1's 69 minutes.** E1 shrinks by using d2's P.3/P.4 rigs instead of the 800k-frame scan where possible;
P0's postcards stay.

**Keep d1's MVP (the E5 core), with two additions:**
- the ledger and budget chips from day one;
- the fidelity rules of §4 written as tests (budget chip present, [D] for model computations, effect-rule ties).
