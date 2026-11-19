# v-numbers · Numbers verification of `design/synthesis.md`

Verifier (lens: numbers), 2026-11-19. Read-only except this file.
SP = `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad`;
LOCAL = `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative` (read-only);
"run files" = `LOCAL/runs/range-order-mechanisms-20261118b/{collective_modes,bba_charts,exact-uniform,signal-*,readout-uniform}.json`.

## Verdict

The synthesis is numerically sound. I checked **175 items (several hundred individual numbers, formulas and
quantitative claims; log in §3)**: 95 rows by recomputation from closed forms, the run files, the animation
repo's own model code or exact transfer matrices, and 80 rows against primary sources (theory notes,
investigations, lab READMEs, sprint docs, PR bodies via `gh pr view`). Every closed form I recomputed reproduces (VP schedule, rail anchors,
t½(λ), r(t), nine-mode windows, γ entry point and spreads, Tweedie, wδ odometer and conditioning, cone
curvature, banana KL, chain-model readabilities to three decimals, L²/(1+L²), λ²/Σλ², αL uncertainties,
budgets, PMF floors, palette contrasts, durations). No number inverts a conclusion.

There are **32 findings, none high**: 7 medium (two mixed definitions inside rigs that a scene would
show side by side, one failing rig test value, one bead-pair/bond-pair mix-up, one law mix-up in the chain
model, one force label whose definition differs from the plotted asset, one superseded estimate plus
seed/level mixing, one source/budget misattribution) and 25 low (labels, rounding, seed order, indexing,
dates). Fixes are in §2 with sources.

---

## 1. What was recomputed (scripts in `SP/vnum/`)

| Script | What it reproduces |
|---|---|
| `closed.py` | α, σ, σ/α, log-SNR at 14 levels; rail x(t) anchors; px per log-SNR unit; ln 16 bar; t½(λ) for 22 variances |
| `gamma.py` | BBA spectrum from `collective_modes.json`: 6.252-Å and library units, ratio, γ dial with and without unit-mean renormalisation |
| `aldp5.py` | ALDP5 nine-mode t½, training shares, r(0.01), inflation, γ entry, spreads, bond-length windows, Tweedie, thermal r, springs-under-water, torsion blur, lag dictionary (step vs transition metric) |
| `chain_exact.py` | Rice-quadrature r(t) for c_φ = √2 and 1.504; exact transfer-matrix readability of b·b(+m), end-to-end², Rg² (two-copy Kronecker sum) for the 28-bead, 110°, uniform-torsion chain of `chain_model.py` |
| `decision.py` | decision-window width (R 0.8 → 0.2) in log-SNR for torsion phases and width probes |
| `wdelta.py` | X_e odometer (feature chord) and horizontal condition of H = A + δB at e = 0.5 … 0.01 |
| `palette.py` | WCAG contrast vs `#0d1321` and CIE ΔE76 |
| `js/toy.mjs` | Part 1 toy with the repo's own `configuration`/`springNetwork`/`springEnergy` (node) |
| inline | budgets/LR/epochs, αL (n25, Markov, N_eff), PMF N × floor, durations, ratios, loudness ratios, λ²/Σλ², energy.js Hessian |

---

## 2. Findings and fixes

Severity: **medium** = a scene or rig would show two incompatible definitions, a test value is wrong, or a
number is attributed to the wrong run/budget; **low** = label, rounding, ordering or wording.

### Medium

**N1 · E3.8 and R14: the G_τ bars and the half-erasure levels come from two different noise metrics.**
R14 tests "G(1 ps) 1600/400/28.9/14.6" (step metric, eigenvalue λ_k/(1−e^{−τ/t_k})) next to half erasure
"1.000/1.000/1.019/2.116" (noise N = Σ_τ⁻¹, the transition covariance, 1/(1−e^{−2τ/t_k})). A viewer who reads
half erasure off the drawn G_τ bars gets 1, 1, 1.157, 3.652. *Fix:* pick one metric per panel — either step
metric: bars 1600/400/28.9/14.6 with half erasure 1/1/1.157/3.652; or transition metric (n25 Prop. 2): bars
1600/400/25.47/8.46 with half erasure 1/1/1.019/2.115 (spread 2.1 vs 400). *Source:* n25 §2 "The dial" and
Proposition 2 ("For the step metric replace 2τ by τ"); recomputed in `aldp5.py`.

**N2 · R18 test value "t½ 0.523/0.0284" mixes two unit systems.** In library units (c₀²λ, Σ = 27, as R18
states) the spectrum is 15.031 … 0.010524 and t½ = 0.5231 / **0.0278**. 0.0284 is t½(0.010914), the smallest
mode in 6.252-Å units (n27's "0.028"). *Fix:* "t½ 0.523/0.0278 (library units)"; or "0.526/0.0284" if the rig
works in 6.252-Å units. *Source:* `collective_modes.json`, `bba_charts.json` (`mode_mean_squares`), closed form.

**N3 · E4.5 "92% of C3's excess ⟨Rg²⟩ from pairs ≥ 11 apart; 153 such pairs, not 136".** (a) The 92% is a
**bead-pair** share from Rg² = N⁻²Σ_{i<j}|x_i−x_j|² (#1015); 153 is the bead-pair count. The scene's visual is
the **bond-pair** decomposition Rg² = Σ W_kl b_k·b_l with 27 × 27 heat maps; there, pairs with |k−l| ≥ 11
number **136** (Σ_{m=1}^{16} m), and the 92% does not apply to that partition. (b) #1015 analysed the
first-chunk internal-coordinate models ("earlier internal-coordinate recipe without the corrected distance
inputs of #1026; the conclusions carried over to C3"), not C3. *Fix:* show the 92%/153 on a 28 × 28 bead-pair
map labelled "internal coordinates, first chunk (#1015)"; if the bond-pair map is used, compute its own
≥ 11 share from data (A16) and count 136 bond pairs. *Source:* bba-range-and-order.md §1 ("Bead pairs at least
11 positions apart carry 92%…"; "These models use the earlier internal-coordinate recipe…"); r4 E11; R28 count.

**N4 · E5.5 vs E5.6: two chain-model laws give two Rg² readabilities at the same t for "chart A".** E5.5
prints Rg² 0.835/0.439/**0.255** at t = 0.1/0.2/0.26 (uniform torsions P0, exact, c_φ = √2; I reproduce
0.8346/0.4385/0.2551). E5.6's halos print **0.18** (A) at t = 0.26 and 0.07 at 0.35 — these are `R_rg2_A` of
the **collapsed law** P = P0·e^{−ηRg²} (importance-weighted, 1,200 queries × 4,000 draws, κ = 1.4148;
`signal-uniform-natural.json`: 0.1835, 0.0722). Both are tagged only [D·model]. *Fix:* stamp E5.5 "uniform
torsions (P0), exact" and E5.6 "collapsed law P (Rg shrunk 0.9 Å), importance-weighted"; or use the P values in
both scenes. *Source:* `chain_model.py` docstring and tasks `exact` vs `signal`; run files.

**N5 · E6.4 "a spring from the centroid labelled ≈ 0.6 kT/Å inward" next to A21's Rg-vs-Δlogvol data.**
0.6 kT/Å is #1100's Stein-test tilt: the Rg residual tilt with the driver term minus the correct term is
0.86−0.24 (t = 0.02), 0.69−0.08 (0.05), 0.58+0.04 (0.1) ≈ 0.6 kT/Å (torsion-form test). #1103 measured the slope
of the wrong-minus-right log-volume against Rg on 2,000 frames as **0.32 per Å** (0.18 from ½ logdet(inertia));
a pure dilation gives 3/Rg ≈ 0.28 per Å. A21 (`{rg[2000], dlogvol[2000]}`) will show ≈ 0.32, not 0.6. The canon
(g4 §2.5, §4.7, §6.9) carries the unlabelled 0.6 too. *Fix:* label the spring "Stein tilt along Rg ≈ 0.6 kT/Å
(#1100)" and annotate A21's scatter "slope 0.32 per Å (#1103; 0.18 from the inertia factor)"; or use one of
the two consistently. *Source:* lab/2026-11-16-bba-force-field-diagnosis README (Rg residual table); PR #1103
body ("grows by 0.32 per Å of radius of gyration, of which 0.18 comes from ½ logdet(inertia)").

**N6 · E6.6 states a superseded estimate and mixes seeds and levels.** (a) "contacts would need ≈ 1°
(t ≈ 0.005) [D r6 §3.12]": #1101 trained down to 0.003 and found the wall missing at every level down to 0.005;
its blur-vs-wall-z trend implies a wall sharper than ≈ 0.1 Å, "a level near 0.001 or below". (b) "(9.9 → 9.6;
15.0 → 15.0)" pairs seed 2 at level 0.005 with seed 3 at level 0.05. (c) The contact-blur numbers
(0.37/0.32/0.22/0.16/0.15 Å; 1.46 → 0.85) are the entry's training-free first-order follow-up √(v gᵀ(JᵀJ)⁺g),
i.e. [D on data], not [M]. *Fix:* "estimate ≈ 0.005 (r6) → #1101: no wall down to 0.005; ≲ 0.001 needed";
print wall z per seed and level (0.005: 9.9 → 9.6 s2, 9.1 → 8.9 s3; 0.05: 14.8 → 15.1 s2, 15.0 → 15.0 s3);
badge the blur [D]. *Source:* lab/2026-11-16-bba-low-noise-continuation README (Result, "Why", tables).

**N7 · E4.3(d) "distance inputs 0.76 → 0.013 Å (60×, 50k, #985)": wrong source run.** At 50,000 updates the
numbers are #1025 §7 / #1026 Table 0.2 (bba-local-geometry Main outcomes: two seeds, 20,000 molecules), ratio
0.760/0.013 = **58×**; #985 is the 190,350-update screen (0.4207 → 0.0078, 54×), which E4.2 already shows.
*Fix:* "0.76 → 0.013 Å (58×; 50,000 upd, 2 seeds, 20k mol; #1025 §7/#1026 T0.2; inputs from #985)".
*Source:* bba-local-geometry-preconditioning.md "Main outcomes"; 00-critic contradiction on this pair.

### Low

**N8 · E5.4 "first/last t½ 0.52/0.028, … [D n27 §3]".** The row values are correct for R18's unit-mean dial
(0.523/0.0278, 0.499/0.0649, 0.454/0.127, 0.374/0.200, 0.259), but n27 prints **0.53**/0.028 at γ = 0 (its γ = 0
row is in 6.252-Å units, not renormalised despite its text; 0.526/0.0284). *Fix:* cite "R18, unit mean, from
file (n27 prints 0.53)". *Source:* `gamma.py`; n27 §3 table.

**N9 · §3.3 "Decision bar: R from 0.8 to 0.2 spans a fixed ln 16 = 2.77 log-SNR units".** True for linear
Gaussian probes only. Width probes (R = r²) span 2.35; torsion phases (von Mises, c_φ = 1.504) span 2.43. The
"ratio > 16" order test is likewise linear-first-order. *Fix:* draw the fixed bar only on first-order/linear
glyphs ("linear-Gaussian bar"); use measured R_h curves elsewhere. *Source:* `decision.py`; n26 (width r²).

**N10 · E5.8 and §3.3 "loudness ratios 3.5 and 1.25".** From `bba_charts.json`: 6.862/2.001 = **3.43**,
2.516/2.001 = **1.26** (3.5 and 1.25 come from the rounded 6.9/2.0 and 2.5/2.0). *Fix:* 3.4 and 1.26.

**N11 · E5.8 "channels 0/1/3/14/92/696/3,303".** These are derived **network-input** channels (pairwise dot
and signed triple products, n(n+1)/2 + C(n,3)); the noised block itself adds 3n_v features (103 + 3n_v: 106,
109, 115, 127, 151, 184). E4.3(b) uses 3,303 for whitening's **noised** features. *Fix:* label "derived input
channels"; optionally add the feature count. *Source:* bba-range-and-order "Implications" ("Feature count
103 + 3K"; "1, 3, 14, 92 derived channels"); n30 §4 (d_B = 3K); #1103 (106, 109, 127).

**N12 · n_v = 2 at 50k appears from two panels.** E5.8 uses #1069 Table 3 (0.105, "seeds differ 0.001 Å";
training-run endpoint panel 0.106/0.104); E6.2's budget lens and the canon use the plain-sampler control
0.106/0.110. *Fix:* label the panel in both places. *Source:* bba-range-and-order Table 1 note and Table 3.

**N13 · E6.9 "ordered (s2) 0.196/0.269/0.421/0.485"** is the library rerun (#1115) decode; the registered
executed s2 (#1071) is 0.189/0.259/0.416/0.483. *Fix:* stamp "library rerun s2/s3 (#1115)". *Source:*
lab/2026-11-18-loud-mode-handedness table; PR #1133 body.

**N14 · E6.3 "N × floor ≈ 8,000".** #1138: "From 100,000 on"; 20k gives 11,200 and 50k 9,000. *Fix:* add
"from 100k on". *Source:* PR #1138 body.

**N15 · E4.7 "seed floor 0.046 Å [M #1059]".** It is an identical-initialisation rerun spread (execution
noise), not a seed floor. *Fix:* "identical-initialisation rerun spread 0.046 Å". *Source:*
energy-head-and-auxiliary-objectives.md (l. 56, 227); objective-search-synthesis.md l. 318.

**N16 · E5.10.** "skeleton (0.20–0.26, 7.9°)": #1068 gives the skeleton torsion window **0.20** (0.25 is its
bond window); 0.26 is unsourced. #1068's CPU windows (C3 0.26/0.35/0.27, Cartesian 0.0004/0.07/0.46) are
estimator measurements, so [M], not "[D #1068]". *Fix:* x = 0.20; badge [M]. *Source:* PR #1068 body.

**N17 · E5.3 hand-over "Cartesian t ≈ 0.001–0.4".** From the same lanes the band is 0.0004 (bonds) to 0.47
(Rg). *Fix:* "≈ 0.0004–0.47". *Source:* n27 §5 table.

**N18 · Dates.** §1.1 and P0.3 list Era 5 as "11-11 → 11-14 (n27, n30)" but note 30 is from 11-18 (E5.8 says
so). "#769 (10-23 → 11-16)": tracker issue #769 opened 10-27 (critic contradiction on the Sprint 11 boundary).
*Fix:* "11-11 → 11-18" or footnote n30; "Sprint 11 10-23 → 11-16 (tracker #769 from 10-27)". *Source:*
`gh issue view 769`; g4 §1.

**N19 · E1.6 "λ_min 1.6×10⁻⁴ vs 0.10"** are λ_min(G_X) (unnormalised; r1/Sprint 7), but the heap's axis is
λ_min(G_X)/tr G_X. *Fix:* print the normalised values from A4 or relabel the axis. *Source:* r1 §1.6.

**N20 · E4.2:** the Cartesian dot (0.415, matched-results) and the arrow start (0.4207, #985's control run)
are different seed-0 runs at 190,350. *Fix:* start the arrow at a labelled 0.4207 point or say "#985 control".
*Source:* matched-results.md l. 77; sprint12-network-inputs-and-baselines.md l. 41.

**N21 · E4.2 chip "#895 (100k, 2 seeds)".** #895 trained 200k updates at batch 128 (Sprint 11 recipe), 2 seeds,
scored on 100k molecules; "100k" reads as a budget next to Sprint 12's chips. *Fix:* "200k upd × 128, 2 seeds,
100k mol; not comparable with Sprint 12 budgets". *Source:* g2 l. 376 (#895 row).

**N22 · E5.6 "mode 1 changes sign after bead 14".** Rouse mode 1, √(2/N)cos(π(i+½)/N), changes sign between
beads 13 and 14 in the 0-based numbering E4.1 uses (hairpin 0–12, helix 14–25). *Fix:* "between beads 13 and
14". *Source:* `chain_model.py` ROUSE1; lab handedness-gap-arm (helix 14–25).

**N23 · E6.8 "overlaps 21.3/18.4% → 0%, size 0.267/0.175 → 0.263/0.173"** is s3/s2 order (#1109 table);
§3.7 fixes s2/s3. *Fix:* 18.4/21.3%; 0.175/0.267 → 0.173/0.263 (s2/s3). *Source:*
lab/2026-11-17-bba-wall-fit-size-term table.

**N24 · E1.5 cost "0.74 s flat vs ≈ 253 s (≈ 340×) vs ≈ 445 s (≈ 600×)"** compares warm flat with cold
curved runs (A100, cold N = 3). *Fix:* add "warm vs cold" to the "indicative" stamp. *Source:* r1 §1.6.

**N25 · §2.1 "Total ≈ 68:30".** The parts sum to 4,114 s = **68:34**. *Fix:* 68:34 (or "≈ 68½ min").

**N26 · E2.3 "three below the floor".** The third (0.00994) is 0.6% under 0.01; g1 reads "the two stiffest".
*Fix:* "two clearly below, a third at the floor". *Source:* g1 §3.1; `aldp5.py`.

**N27 · κ subscripts:** E2.0's κ_Σ "100–200 inside a basin" (n20 §0) and E2.8's κ_res(flat) 192/112/97 are the
same object (condition number of the in-window thermal covariance; canon §2.2 item 3: "for flat G = I it is
cond(Σ)"). *Fix:* call both κ_res(flat) = cond Σ_window, or footnote the identity.

**N28 · E5.11 "chains settle at 0.35–0.26".** Measured chain–block agreement reaches R² ≥ 0.5 only at t = 0.13
(0.37–0.44 between 0.35 and 0.2). *Fix:* "the chain's torsions decide at 0.35–0.26; its size follows the block
at t ≈ 0.13". *Source:* lab/2026-11-18-loud-mode-handedness l. 118–129.

**N29 · "internal at thermal width" (P0.1, E5.2, E5.3, E5.6 "53 stiff channels at thermal width").** C3's
stiff block is whitened by the **training population covariance**, L_stiff⁻¹(q − μ) (unit population spread).
*Fix:* "at unit population spread" (for bonds ≈ thermal). *Source:* bba-local-geometry-preconditioning §4.

**N30 · §10 "1,000-molecule monitor curves (floors 0.05–0.10 Å)".** #1137 states 0.086 Å, up to 0.146 Å.
*Fix:* "≈ 0.09 Å (up to 0.15)". *Source:* PR #1137 body.

**N31 · E1.1 "≈ 0.10 eV along the torsion path".** In the repo toy this is the path **midpoint** (0.098 eV);
U rises to 0.22 eV along the path, and the 180° rotamer itself sits at 0.20 eV (≈ 7.8 k_BT) because every
spring is at rest in X0. *Fix:* "≈ 0.10 eV at the torsion path's midpoint". *Source:* `js/toy.mjs` on
`src/model/{molecule,energy}.js`.

**N32 · E3.6 Stein ranges** compare arms read at different levels (flat production at 0.01; spring at 0.03 in
g1 §3.1) without saying so — the very effect E2.7 teaches. *Fix:* print the read level per arm. *Source:* g1
§3.1 table; force-field-simulation.md.

---

## 3. Check log (✓ reproduces / matches source; ~ correct but needs the label in §2; ✗ wrong)

### 3.1 Closed forms recomputed

| # | Where | Claim | Recomputed / checked | |
|---|---|---|---|---|
| 1 | R1, §3.4 | α(0.01) 0.999003, σ 0.044643, s(0.05) 0.17414, α(1) 0.006572 | 0.999003, 0.044643, 0.17414, 0.006572 | ✓ |
| 2 | §3.3 | ℓ(10⁻⁵) 13.8145; span to 0.7 = 18.753; 71.46 px/unit | 13.8145; 18.7529; 71.455 | ✓ |
| 3 | §3.3 | anchors 140/406/683/877/973/1128/1303/1480 | 140.0/406.3/682.9/877.3/973.0/1127.9/1302.6/1480.0 | ✓ |
| 4 | §3.3 | decision bar ln 16 = 2.77 (198 px) | 2.7726, 198.1 px (linear only) | ~ N9 |
| 5 | R1 | t½(1) 0.2590, t½(15.5) 0.526, t½(0.011) 0.0285, t½(0.003) 0.0130, t½(4.2e-5) 0.00040 | 0.25896, 0.5258, 0.02851, 0.01304, 0.00040 | ✓ |
| 6 | E2.2, R2 | t½(0.01/0.1/10/100) 0.0270/0.0930/0.486/0.676 | 0.02699/0.09298/0.48591/0.67604 | ✓ |
| 7 | E5.4 | pad v 1/0.3/0.1/0.03 → 0.26/0.16/0.09/0.05 | 0.259/0.157/0.093/0.050 | ✓ |
| 8 | E2.3 | flat t½ 0.00483 … 0.196 | 0.00483, 0.00607, 0.00994, 0.01392, 0.01753, 0.03664, 0.0569, 0.10764, 0.19619 | ✓ (N26) |
| 9 | E2.3 | shares 0/0/0/0.4/0.8/2.7/4.7/9.9/18.8% vs 25.2% | 0/0/0/0.40/0.76/2.69/4.74/9.86/18.81; 25.15 | ✓ |
| 10 | E2.3, R3 | stiffest mode enters band at γ ≈ 0.14 (0.142) | 0.1416 | ✓ |
| 11 | E2.3 | spreads ×40.6/×4.8/×2.0 at γ 0/0.5/0.75 | 40.6/4.85/2.05 | ✓ |
| 12 | E2.3 | bond length (√2σ) half erased at t ≈ 0.003–0.004 | 0.0028–0.0039 (0.9418 Å unit) | ✓ |
| 13 | E2.7, §3.5 | ideal r(0.01) 0.264 … 0.996; toy 0.264 | 0.264, 0.328, 0.498, 0.625, 0.707, 0.896, 0.951, 0.985, 0.996 | ✓ |
| 14 | E2.7 | inflation 1/√r | 1.95/1.75/1.42/1.27/1.19/1.06/1.03/1.01/1.00 | ✓ |
| 15 | E2.7, R3 | thermal r(0.03) = 0.988 (0.9881) | α²(0.03) = 0.9881 | ✓ |
| 16 | E2.7 | n29 vs driver differ by α²: 0.994 (0.02), 0.971 (0.05) | 0.9940, 0.9706 (ratio α² for any Gaussian v) | ✓ |
| 17 | E2.4, R3 | Tweedie 0.388/0.463 with s = √2·0.042 = 0.0594 | 0.388/0.463; s 0.05940 | ✓ |
| 18 | R30 | force ratios 0.256/0.248 at v 0.01, t 0.05 | 0.2555/0.2480 | ✓ |
| 19 | E4.3(a) | sd 0.037 → t½ 0.0077; at divisor 1.31 sd 0.76, t½ 0.21 | 0.00773; 0.765; 0.210 | ✓ |
| 20 | E5.2 | t 0.0004: 0.040 Å/coord, 0.057 Å bond; t 0.01: 0.28 Å | 0.0403, 0.0570; 0.279 | ✓ |
| 21 | E5.2, E6.6, R27 | torsion blur 1.70°/6.63°/12.96° (s/c_φ) | 1.702°/6.632°/12.955° | ✓ |
| 22 | E6.6 | 1° blur ↔ t ≈ 0.005 | 0.0047 (but superseded, N6) | ~ N6 |
| 23 | E5.5 | 6.6° on 5–10 Å arm → 0.58–1.16 Å | 0.579–1.158 | ✓ |
| 24 | E3.4, R13 | α/σ 22.4 (0.01), 999.5 (10⁻⁵); 1/σ² 502 | 22.38, 999.5, 501.8 | ✓ |
| 25 | E6.6 | loudness 0.003 → t½ 0.013 (0.025 with +2) | 0.0130; file 0.01330 / 0.02486 | ✓ |
| 26 | R18, E5.4 | ratio 1,428 from file; Σ lib 27; top 15.031; c₀ 0.15706 | 1,428.25; 27.000; 15.0309; 0.157064 | ✓ |
| 27 | R18 | t½ 0.523/0.0284 | 0.5231/**0.0278** in library units | ✗ N2 |
| 28 | E5.4 | γ dial first/last 0.52/0.028, 0.50/0.065, 0.45/0.13, 0.37/0.20, 0.26/0.26 | 0.523/0.0278, 0.499/0.0649, 0.454/0.127, 0.374/0.200, 0.259 | ✓ (~ N8) |
| 29 | E5.4 | ratios 1,428/232/38/6.1/1 | 1428.3/232.3/37.8/6.1/1.0 | ✓ |
| 30 | E5.8, R18 | size response 83/96% (0.8296/0.9615) = λ²/Σλ² | 0.8296; cum 0.9615 | ✓ |
| 31 | E5.8 | mean-square shares 56/22/11/5% | 55.7/22.2/10.8/4.7 | ✓ |
| 32 | n27 via E4.1 | top four modes 93% of ⟨Rg²⟩ | 93.4% | ✓ |
| 33 | E4.1 | √1,423 ≈ 38× | 37.7 | ✓ |
| 34 | E5.7, R20 | L²/(1+L²) 0.50/0.94/0.98 (0.9412/0.9844) | 0.5000/0.9412/0.9844 | ✓ |
| 35 | E5.8, §3.3 | loudness ratios 3.5 and 1.25 | 3.43 and 1.26 | ~ N10 |
| 36 | E5.5, R19 | torsion r(√2) 0.940/0.716/0.530 at 0.1/0.2/0.26 | 0.9401/0.7159/0.5297 (Rice quadrature) | ✓ |
| 37 | R19 | c_φ 1.504: 0.947/0.746/0.565 | 0.9473/0.7465/0.5655 | ✓ |
| 38 | E5.5 | b·b(+4) 0.868/0.470/0.245 | 0.8676/0.4701/0.2452 (transfer matrices) | ✓ |
| 39 | E5.5 | b·b(+12) 0.625/0.083/0.010 | 0.6246/0.0828/0.0098 | ✓ |
| 40 | E5.5 | b·b(+26) 0.352/0.004/0.000 | 0.3520/0.0040/0.0000 | ✓ |
| 41 | E5.5 | end-to-end² 0.711/0.253/0.125 | 0.7111/0.2530/0.1251 | ✓ |
| 42 | E5.5 | Rg² 0.835/0.439/0.255 | 0.8346/0.4385/0.2551 | ✓ |
| 43 | R19 | all within 0.01 of exact-uniform.json | max gap 0.008 (end-to-end² at 0.1: 0.711 vs MC 0.719) | ✓ |
| 44 | E5.5 | effective degree ≈ ⅔(m−1) | ln R/ln r at t 0.1: 2.3/7.6/16.9 vs 2.0/7.3/16.7 | ✓ |
| 45 | E5.9, R21 | KL 0.0766; signals 0.0779/0.0784; shares 0.88/0.48/0.91 | 0.07657; 0.07792/0.07843; 0.878/0.476/0.914 | ✓ |
| 46 | E5.7 | collapse 0.0005/0.025/0.049; constraint 0.92/0.80/0.38 | 0.0005/0.0247/0.0486; 0.921/0.802/0.384 | ✓ |
| 47 | E5.7 | chain gains internal/block per block scale | unit 0.43–0.55/0.43–0.56; natural 0.85–1.03/0.06–0.09; ×2 0.90–1.09/0.02–0.03 (t ≤ 0.05) | ✓ |
| 48 | E5.6 | halos Rg² 0.18 vs 0.84 (0.26), 0.07 vs 0.67 (0.35) | 0.1835/0.8376; 0.0722/0.6715 (law P) | ~ N4 |
| 49 | E5.7, A12 | constraint shares 27/44/68, 74/87/96, 92/97/99% | 1 − constraint_block_share: 27/44/68, 74/87/96, 92/97/99 | ✓ |
| 50 | E5.3, E5.6, §7 | first-order: internal Rg 0.19, ≥11 0.16, e2e 0.14, closest 0.013; +2: Rg 0.44, ≥11 0.29, e2e 0.24, torsion 0.34, closest 0.025 | 0.194/0.162/0.135/0.0133; 0.444/0.290/0.237/0.336/0.0249 | ✓ |
| 51 | E5.6 | lengths 6.9/2.5/0.9/0.6 vs 2.0; Rouse 0.99/0.99 (0.91/0.92) | 6.862/2.516/0.939/0.602 vs 2.0007; 0.9906/0.9854/0.9142/0.9152 | ✓ |
| 52 | E6.9, R24 | data P(χ>0) 0.169/0.268/0.371/0.470; overall 0.353 | 0.1685/0.2681/0.3713/0.4702; 0.3526 | ✓ |
| 53 | E6.6/E6.7 | internal floor blur 0.36 first order; 0.32 Å rms, 2.3% overlaps | 0.3613; 0.3166, 2.33% | ✓ |
| 54 | E1.6, R7 | wδ odometer 3.2489/7.8377/12.4378/17.0407; Euclid → 1.0 | 3.2489/7.8377/12.4378/17.0407; 0.80/0.98/0.998/0.9998; pair part 0.4628 | ✓ |
| 55 | E1.6, R7 | condition 42.1 → 6,437 → 6.0×10⁷ (e 0.5/0.1/0.01), ∝ e⁻⁴ | 42.14/500.7/6,437/9.768e4/3.760e6/6.004e7 | ✓ |
| 56 | E1.2 | costs 0.004165 vs 0.000392 (10.6×) | 0.0041653/0.0003921 (10.62×) | ✓ |
| 57 | E1.2, E1.6 | C = m + 36δ = 46 (n 5); √46 → √51 | 10+36; 15+36 | ✓ |
| 58 | E1.3, R10 | dimer midpoint 6.325 Å vs 7.0 | √40 = 6.3246 | ✓ |
| 59 | E1.7, R9 | A(0.10/0.55/0.91/1) 0.9880/0.4150/−0.0114/−0.1111; a(1) 0.006572 | 0.98796/0.41501/−0.01138/−0.11106; 0.006571 | ✓ |
| 60 | E3.2, R12 | c 0.103 (5.9°), σ_r 0.0266, σ⊥ 0.258; aspect 0.103; contrast 93.3; 30° at ratio 3 | 0.102960 (5.91°), 0.026584, 0.258199; 93.33; 30.0° | ✓ |
| 61 | E3.3, R12 | R 5.81; 𝒦_tan 0.0293 per sq. width; θ 0.5: deficit 4.1%, 𝒦ρ² 0.25, bound 0.021 | 5.8095; 0.029316 = (1−c²)/R²; 0.04115; 0.2473; 0.0206 | ✓ |
| 62 | E3.1, R11 | energy.js 6 zeros; 0.0264 … 53.99; κ_H 2,048 | 0.0264/0.0414/0.4847/0.7673/1.0269/20.48/38.18/49.79/53.99; 2,047.95 | ✓ |
| 63 | E1.1, R5 | rotamers 1.75 Å; O–H 0.96 → 0.40; 3.27 eV ≈ 126 k_BT | 1.751; 0.395; 3.267 eV = 126.1 k_BT | ✓ |
| 64 | E1.1 | stretch 0.11 Å for 4 k_BT; arc 0.95 Å for 1.7 k_BT; 8.5×, 2.4× | 0.112 Å, 0.105 eV (4.04); 0.947 Å, 0.044 eV (1.70); 8.47×, 2.38× | ✓ |
| 65 | E1.1 | ≈ 0.10 eV along the torsion path | midpoint 0.098 eV; max 0.220; rotamer 0.203 | ~ N31 |
| 66 | E3.9, R16 | banana KL ½ ln 33 = 1.748; single 0.4739; ψ 40.5 vs ≤ 1.125; midpoint 2.000 | 1.7483; 0.4739; 40.5; 1.125; 2.000 | ✓ |
| 67 | E6.4, R22 | radius 1.253 → 0.798 (−36%) 2-D; 1.596 → 0.798 (−50%) 3-D | √(π/2) 1.2533 → √(2/π) 0.7979 (−36.3%); 1.5958 → 0.7979 | ✓ |
| 68 | X2, R17 | inflation 1/√(1−Δt k) 1.060/1.095; limit 6.0–9.1×10⁻⁴ Å² | 1.0600/1.0950; 1/k = 6.02e-4–9.09e-4 (measured 1.08–1.09 at h 10⁻⁴) | ✓ |
| 69 | E3.8, R14 | t_k 0.0078/0.031/0.5/3.1 ps; G 1600/400/28.9/14.6; half erasure 1/1/1.02/2.12 | 0.0078/0.0313/0.5/3.125; step G 28.91/14.61; transition half 1.019/2.115; step half 1.157/3.652 | ~ N1 |
| 70 | E3.8 | ψ ≈ 19× too stiff; width √0.052 = 0.23 | 19.2; 0.228 | ✓ |
| 71 | E3.7, R30 | n25 0.90/1.27/0.79; Markov 0.225/0.229/0.223 | 0.898/1.269/0.794; 0.2250/0.2287/0.2229 | ✓ |
| 72 | E3.7 | 96–139 effective samples | 250,000/(2·1,300) = 96.2; /(2·900) = 138.9 | ✓ |
| 73 | E6.2, R30 | LR 99.8/97.6/90.8/3.3%; epochs 39/150/300/1,499 | 99.84/97.63/90.77/3.33; 39.4/149.9/299.8/1,499.2 (790,350: 64.4%, 622.5) | ✓ |
| 74 | E6.3 | floors × N ≈ 8,000; floor ≈ 0.006 at 1,300,156 | 11,200/9,000/8,000/7,800/8,126; 0.0062 | ~ N14 |
| 75 | E6.2, R30 | effect: gap 0.030 > spread 0.026 (0.104 vs 0.074) | 0.104 − 0.074 = 0.030; max(0.026, 0.006) | ✓ |
| 76 | E1.7 | 4× vs identity, 1.4× vs best flat | 0.479/0.117 = 4.09; 0.167/0.117 = 1.43 | ✓ |
| 77 | E4.2, E4.3 | 54× (0.4207 → 0.0078); 60× (0.76 → 0.013); 52× (#895) | 53.9×; **58.5×**; 52.2× | ~ N7 |
| 78 | E6.7 | wδ bonds 86× ordered's | (0.0305)/(0.000355) = 85.9 | ✓ |
| 79 | E1.5 | ≈ 340× and ≈ 600× | 341.9×, 601.4× (warm vs cold) | ~ N24 |
| 80 | E6.8 | 0.16 × 4.8 Å² ≈ 0.8 Å | 0.768 Å (4.84 = 2.20²) | ✓ |
| 81 | E4.5, R28 | W_kl = (min+1)(N−1−max)/N²; 153 pairs ≥ 11 | identity derived; 153 bead pairs; 136 bond pairs | ~ N3 |
| 82 | E5.8, R20 | channels 1/3/14/92/696/3,303; constraints 1/3/9/21/45/78 | n(n+1)/2 + C(n,3); 3n−3 (n ≥ 2), 1 for n = 1 | ✓ (~ N11) |
| 83 | E5.6 | 53 + 50 + 6 = 109 features; C3 103-d | 27+26 + 25·2 + 2·3 | ✓ |
| 84 | E4.3(b), M4 | 3,303 − 78 = 3,225; 78 = 3·28 − 6 | ✓ | ✓ |
| 85 | E5.11, A17 | 1,000-step grid every 40th → 26 frames | 1000/40 + 1 = 26 | ✓ |
| 86 | A17, E4.1 | 378 log r_ij; 403 TICA features | C(28,2) = 378; 378 + 25 | ✓ |
| 87 | §3.9 | Float64 1,000 × 9 walkers, 0.5 s, 90 s ≈ 13 MB | 72 kB × 180 = 12.96 MB | ✓ |
| 88 | §2.1 | durations per piece | 145/582/645/697/545/835/665 s, scenes sum exactly | ✓ |
| 89 | §2.1 | total ≈ 68:30 | 4,114 s = 68:34 | ~ N25 |
| 90 | §2.2 | committee path ≈ 27½ min; E5a ≈ 7:30, E5b ≈ 7:05 | 27:25; 7:00 + card; 6:55 + card | ✓ |
| 91 | §10 | cuts −6:10 → ≈ 62 min | 62:24 | ✓ |
| 92 | §9 | 56–67 days | 56 / 67 | ✓ |
| 93 | §6 | ≈ 1.5 MB committed | ≈ 1.47 MB | ✓ |
| 94 | §3.9 | 19 levers (3/4/4/2/4/2) | 19; per-episode lever lists match | ✓ |
| 95 | §3.1 | contrasts 15.2/12.9/6.2/3.0/7.5/10.4/9.5/13.1/10.1/8.9/8.2/12.3/9.3; ΔE 41.6, 19.6 | 15.16/12.87/6.22/3.02/7.47/10.43/9.45/13.10/10.10/8.86/8.24/12.26/9.31; 41.6, 19.6 | ✓ |

### 3.2 Logged numbers against primary sources

| # | Where | Claim | Source | |
|---|---|---|---|---|
| 96 | E2.0, E2.8 | κ_Σ 100–200, ≈ 920; κ_res 192/112/97 → 9.6/7.6/13.4; whitening 273/477; wδ 413 | n20 §0, §1.4, §5.3 (l. 23, 156, 552–559) | ✓ (~ N27) |
| 97 | E2.6 | 1.9×10⁴/146/8.1; GD 24,319/589/31; Adam 3,941 vs 226 | n21 §4.3 table | ✓ |
| 98 | E2.3, E2.4 | Prop. 5; bonds SNR 0.30–0.46 at σ 0.045 Å | n21 §5.2 | ✓ |
| 99 | E2.5 | 17.5 vs 11.4 ≈ 1.5× in ½(0.05)²; Prop. 8 KL ½δᵀΣδ | n21 §6 | ✓ |
| 100 | E2.8 | rotating-bond residual 13.9/8.3/13.0 at k⊥ 10/30/100 | n21 §7.2 l. 641–643 | ✓ |
| 101 | E2.7 | volume-term omission 0.30–0.36 thermal widths | n20 §8 l. 777 | ✓ |
| 102 | E2.5, R4 | 0.0093 at 1.23; ~6% of times; 0.001 vs 0.02–0.07 | learned-stiffness-diffusion-pilot "Why the training loss hides…" (LESSONS D18) | ✓ |
| 103 | E2.4 | 0.44–0.53 at 200k (#765); 0.49–0.58 at 40k (#754); 1.8–2.8× at 1k | feature-space-evaluation l. 290, 312–316; pilot l. 22, 222–223 | ✓ |
| 104 | E2.3, A1 | widths 0.0252 … 0.6631 Å (mdshare traj 1) | g1 §3.1 (evidence.json mode_std_A) | ✓ |
| 105 | E2.7, §3.5 | flat production seed 0 Stein 0.198 … 0.369 | g1 §3.1 | ✓ |
| 106 | E3.6 | Stein spring 0.97–1.03/0.91–0.99, learned 0.96–1.00/0.93–1.01, flat 0.20–0.29/0.42–0.69 | j-fidelity row 11; force-field-simulation | ✓ (~ N32) |
| 107 | E2.7, E3.6 | low floor iid JS 0.021 vs sim 0.142; 83% αR (MD 35%) | force-field-simulation l. 62–64, 330 | ✓ |
| 108 | E3.6 | #886 diagonal (1.006–1.090 vs 2.328–2.778, …) | supervisor-metric-comparison l. 65–69 | ✓ |
| 109 | E3.5 | flat catches up 0.994–1.049 vs 1.115–1.291 | supervisor-metric-comparison l. 73–74 | ✓ |
| 110 | E3.5 | W1/σ table; floors 0.010/0.017/0.011; JS 0.0207/0.0201; 100×/10–20×; XLA 0.018 Å | feature-space-evaluation l. 32–89, 244–260 | ✓ |
| 111 | E3.7 | PMF 0.332 vs 0.355 k_BT²; ΔF 0.016 vs 0.077; 0.68–0.72 k_BT | feature-space-evaluation l. 60–66, 275 | ✓ |
| 112 | E3.7 | GFN2-xTB 0.0246–0.0336 vs 0.0252–0.0307; 95.05/92.88%; whitening 0.989–1.010 | r3 l. 159–160, 813 (#788, #808) | ✓ |
| 113 | E3.8 | κ_step 184/185 → 24.6 → 3.88–3.95 → 2.99–3.04; floor 1.55; overlap 0.973 (0.444) | learned-stiffness-warp.md l. 216, 253; evidence.json | ✓ |
| 114 | E3.8 | ladder < 1 ps, ≈ 10 ps, 20–50 ps, 100–200 ps, 5–20 ns; 19× and 2.3× | n25 l. 68–72, 298–304 | ✓ |
| 115 | E3.9 | JS at 100 upd 0.117 (10% valid)/0.127/0.049/0.027; springs 0.133/0.149/0.163; KL 0.96/0.20/0.14; 0.0203 vs 0.0227–0.0236 | learned-warp-lag-sweep l. 16–35, 176–200 | ✓ |
| 116 | E3.9 | Gaussianized 0.042 vs 0.255; saddle 30 vs 4–6 per 10⁴ | r4 l. 205, 913–916; r5 | ✓ |
| 117 | E3.3 | n22 ε table; 0.14–0.56 vs 0.018–0.11; 9%; −0.684; 0.016 Å; 0.2–1.5% / 1–8%; 3–20% | n22 l. 118, 323, 345, 507–512, 530–531, §5.4; n23 l. 37–38 | ✓ |
| 118 | E3.4 | 1/σ² ≈ 502 | n28 §4 l. 119 | ✓ |
| 119 | E3.3 | wδ trains in 318 vs 259 s | matched-results l. 174, 182 (ALDP5 elapsed to checkpoint) | ✓ |
| 120 | E1.7 | S1 0.117 ± 0.007 / 0.479 ± 0.005 / 0.167 ± 0.012 | r1 l. 234; critic (sprint1 summary l. 78–113) | ✓ |
| 121 | E1.7 | S5 within campaign: 0.119 ± 0.012 (77%) vs 0.263/0.268; 2k: 0.103 ± 0.009 vs 0.239 ± 0.007, 0.293 ± 0.020 | sprint5 summary l. 111–159; j-fidelity row 5 | ✓ |
| 122 | E1.7 | S7 0.9996, JS 0.325, 25.2% vs 0.60%; S8 0.2846/0.2618 → 0.1012, 0.0151 vs 0.0114, 0.1664 vs 0.2405; S9 0.239–0.558 (46–109×) | r1 l. 66, 73–84, 238–242 | ✓ |
| 123 | E1.5 | 38.3% / 2.34%; 0.74 / 253 / 445 s | r1 E14, l. 66, 254 | ✓ (~ N24) |
| 124 | E1.6 | 800k: 1.55×10⁶ vs 4.2×10³; λ_min 1.6×10⁻⁴ vs 0.10 | r1 l. 67 (λ_min of G_X) | ✓ (~ N19) |
| 125 | E1.7 | rigid residual 1.3×10⁻¹⁴ vs 5.97; TF32 ≈ 11% to ~10⁵ | r1 V13, l. 252 | ✓ |
| 126 | E1.8 | 1.784 vs 2.053; 0.144 vs 0.077; 0.224 vs 0.247; 0.052 vs 0.032 | g2 l. 305–311, 327; critic (#513) | ✓ |
| 127 | E1.8, E1.3 | PC1 0.8934 vs 0.8927; "about 85%", "about 1 Å", rank 7 | g2 l. 18, 29, 72–73, 324 | ✓ |
| 128 | X3 | RFM pilot 0.620 vs 0.199 | g1 l. 51 | ✓ |
| 129 | E4.1 | 1,625,195 / 1,300,156; Rg 10.60, 8.37/9.89/15.30; folded 0.194; 200 ps per frame | r8 l. 90, 384–387; g4 §7.12 | ✓ |
| 130 | E4.2, §7 | internal 0.000274/0.166°/0.521; Cartesian 0.415/5.24/0.072; springs 0.320/8.85/0.078 (97,113); whitening 0.705/24.4/0.497 (96,271); wδ 0.113/3.24/0.085 | matched-results l. 77–84 | ✓ |
| 131 | E4.2 | 0.4207 → 0.0078 (#985) | sprint12-network-inputs l. 41 | ✓ (~ N20) |
| 132 | E4.2 | #895 52× (0.6371 vs 0.0122), TIC 0.0529/0.0479, whitening 0.2499, PMF 4.832 | critic (sprint11 closeout l. 32, 67–70); r4 | ✓ (~ N21) |
| 133 | E4.3 | σ*/σ(t_min) grid (6.4…351; 22, 3.0; 0.84; 7.7/39/85/38; 1.25; ALDP5 11–31) | bba-local-geometry §1 table | ✓ |
| 134 | E4.3 | divisor 27.1 vs 1.31; sd 0.037 < 0.045; 3,303/78/3,225; tangent share 0.06; 911 → 904 → 759; t < 4×10⁻⁴ (0.04%) | bba-local-geometry §1 | ✓ |
| 135 | E4.3(d) | 0.76 → 0.013 Å at 50k | bba-local-geometry Main outcomes (#1025 §7/#1026 T0.2), not #985 | ~ N7 |
| 136 | E4.4 | 10.59 ± 2.20; 10.34 ± 2.26; 5.41 ± 0.51; 10.71 ± 1.92; untrained 4.9 Å | bba-local-geometry §3 | ✓ |
| 137 | E4.5 | 92% from pairs ≥ 11 apart | bba-range-and-order §1 (#1015, bead pairs, internal model) | ~ N3 |
| 138 | E4.6 | 11.07 vs 10.60; ≈ 90%; 94 ± 25%; 0.27–0.43 Å; ≈ 70%; ≤ 0.14 Å | bba-range-and-order §2 | ✓ |
| 139 | E4.7 | ~30 changes; 0.245/0.244 Å; 0.046 Å; 0.83 vs 0.081 Å | r4 §1.8–1.9; energy-head l. 56, 167, 227 | ✓ (~ N15) |
| 140 | E5.1 | ESS ≈ 700 vs median 1; leakage 0.82 → 0.34 → 0.14 → −0.03 | n27 §4 Traps | ✓ |
| 141 | E5.3, §7 | best-estimator windows, 8 features × Cartesian/C3/C1 | n27 §5; bba-range-and-order Table 4; g4 §4.2 | ✓ (~ N17) |
| 142 | E5.3 | block alone ≥ 0.42/0.37/0.33; Chroma 0.0032; matched cov. 0.0049; EigenFold five decades | lab 2026-11-16 readable-windows-noise-precedents l. 31–48 | ✓ |
| 143 | E5.4 | Rg 0.499/0.514, 0.187, 0.120, 0.081; TIC 0.107/0.106, 0.083, 0.081, 0.086 (floor 0.037); torsion 9.7/10.4, 6.5, 7.1, 9.1°; Rg floor 0.016 | bba-range-and-order Tables 1–2 | ✓ |
| 144 | E5.8 | Rg 0.477/0.161/0.105/0.136/0.152/0.325/0.399; ties 1–8; seeds differ 0.001 | bba-range-and-order Table 3 | ✓ (~ N12) |
| 145 | E5.5 | #1073 0.48/0.46 → 0.05/0.12 Å, 4,000 molecules | bba-range-and-order (after Table 5) | ✓ |
| 146 | E5.10 | #1068 windows 0.25/0.20/0.69; Rg 0.077; 7.9°; 4–18%; scatter C3 0.85–0.95°, ordered 0.9–1.1°, Cartesian 7.1° | PR #1068 body; bba-range-and-order Table 1 | ✓ (~ N16) |
| 147 | E5.11 | R² 0.13 … 0.97; |a₁| 21/59, 40/41; final sign 0.55 → 0.65–0.69 → 0.88 | lab 2026-11-18-loud-mode-handedness l. 118–125; PR #1133 | ✓ (~ N28) |
| 148 | E5.6 | #1141: 0.101 vs 0.097; 0.35/0.32 vs 0.26/0.22 Å | PR #1141 body | ✓ |
| 149 | E5.7 | #1137 rule 0.2 ≤ f ≤ 0.8 on both seeds | PR #1137 body | ✓ |
| 150 | E5.6, E6.1–E6.2, §7 | #1088 table: bonds, angles, sizes for 7 models; ×119/×8.5/×2.0; size and contacts tie; 0.104 vs 0.074; 17–120× | real-budget-study l. 270–301 | ✓ |
| 151 | E6.2 | Rg ≤ 0.11: s3 0.091 met, s2 0.117 missed | PR #1071 body l. 43–45, 123 | ✓ |
| 152 | E6.2 | budget lens 0.106/0.110 → 0.117/0.091 → 0.120/0.096 → 0.111; C3 ≈ 0.45 | g4 §4.6; PR #1104 body l. 61 | ✓ |
| 153 | E6.3, §7 | PMF 0.097/0.096/0.113 (1.9M), 0.109/0.109, 0.116/0.113, 0.161/0.198, 0.202/0.315; floors; paper 0.034/0.234/0.254; ≈ 0.02 [H]; ≈ 0.006 | PR #1138 body | ✓ |
| 154 | E2.7, §7 | ScoreMD paper: 23.51 ± 1.91×; Diffusion 0.034/5.387; Two For One 1.624 (t 0.005); Both 0.234/0.254 | g1 l. 301–307, 377–378 | ✓ |
| 155 | E6.3 | native ScoreMD = zero-FP arm | scoremd-cartesian-baseline l. 71–72 | ✓ |
| 156 | E6.4 | 0.98 → 0.24 Å (s3, 512 paths); 9.58 vs 10.66; 9.6–9.7; three quarters | lab 2026-11-16-bba-force-field-diagnosis l. 33–48, 139–141 | ✓ |
| 157 | E6.4 | ≈ 0.6 kT/Å inward | same lab (Stein tilt) vs PR #1103 (0.32 per Å) | ~ N5 |
| 158 | E6.4 | 17.808/16.924 vs 17.815/16.934; +1.87 vs −0.88; 10.81 → 9.64 | PR #1103 body | ✓ |
| 159 | E6.5 | 0.158–0.277/0.229–0.492/0.396–0.642; −0.21 to −0.41; ×1.7–2.9; floor 0.084 (0.167 at 512); 0.337 vs 0.277 | lab 2026-11-18-bba-loud-mode-force-size-followup (#1130) | ✓ |
| 160 | E6.5, E6.8 | full schedule 0.111; joint 0.105; 11.8% → 0%; force 0.118 Å | PR #1104 body l. 61–63 | ✓ |
| 161 | E6.6 | blur 0.37/0.32/0.22/0.16/0.15; 1.46 → 0.85; wall z | lab 2026-11-16-bba-low-noise-continuation | ~ N6 |
| 162 | E6.8 | 14.5/15.3 → 19.3/20.1 → 0.0%; 0.117/0.091 → 0.077/0.064 → 0.083/0.070; control 0.131/0.105; 3.6 Å core | labs 2026-11-16 joint rebuild (19.4/20.1), 2026-11-17 excluded volume | ✓ |
| 163 | E6.8 | #1109 21.3/18.4 → 0; 0.267/0.175 → 0.263/0.173; −0.16; 11.1–11.3 Å | lab 2026-11-17-bba-wall-fit-size-term | ✓ (~ N23) |
| 164 | E6.8 | late repulsion clashes 0.60/0.66 → 0.02/0.02% | real-budget-study l. 270–271 | ✓ |
| 165 | E6.9 | bins 0.196/0.269/0.421/0.485; 0.256/0.247 vs 0.249; −1/+4, 28/32, 11/10, 61/59% | lab loud-mode-handedness; handedness-gap-torsions/-long-range/-arm | ✓ (~ N13) |
| 166 | E6.7 | wδ 0.014/0.120/0.049 vs 0.36; test 0.05 Å, 0% vs 0.32 Å, 2.3%; wδ 0.062/0.072, 0.027/0.034, 0% clashes; 0/682/1,186; 17–18° | g2 l. 35–37, 131, 259–268, 549; real-budget-study l. 277 | ✓ |
| 167 | X2 | 1.60 … 0.69 Å vs blur floor 0.045 … 0.117 Å (#1089) | bba-internal-force-field-size-drift l. 324, 345 | ✓ |
| 168 | X2 | learned arm blew up at 4×10⁻⁴ (74% of walkers); 89% last record | force-field-simulation l. 82, 416 | ✓ |
| 169 | E6.1, E6.2 | 100k floors bond 0.0002, angle 0.05°, Rg 0.006 Å | r6 l. 728 | ✓ |
| 170 | E4.1 | data cards 07-27 / 10-19 / 11-01 | r8 l. 16, 61, 89 | ✓ |
| 171 | E2.0, E3.5, E3.8 | PR #745 10-23/24; #765 10-26; #753 10-24 | `gh pr view` | ✓ |
| 172 | §1.1, E3.0 | Era 5 ends 11-14 incl. n30; #769 from 10-23 | n30 11-18; issue #769 opened 10-27 | ~ N18 |
| 173 | P0.2 | exposé 07-02; R-DM added 07-31 | g1 l. 420 | ✓ |
| 174 | §10 | Chignolin 0.996/0.990 on dummy frames | lab 2026-11-18-loud-mode-transfer-checks; critic | ✓ |
| 175 | §10 | monitor floors 0.05–0.10 Å | #1137: 0.086 (up to 0.146) | ~ N30 |

Counted: 175 rows (several rows bundle a group of numbers); 32 carry a §2 finding.

---

## 4. Not verified here (and why)

- Talk-slide quotes ("Where to add the noise", slide 3's sentence, slide 2's ~38×): the pptx was not opened.
- E1.1 thermal-ruler pairs (RMSD 0.036/0.243 Å, d_th 4.0/1.46, ρ = 0.50): reader-derived (d3), not re-run.
- "Mode 1 88% aligned with hairpin–rest": available only through r6's reading of the archived #1057 note.
- E2.7 "flat low floor at 0.003: 0.91–1.04 (seed 0 only)": via d2/j-fidelity, evidence.json not opened.
- E6.6 "0.004–0.01% data overlaps": found 0.01% (#1100) and 0.007% (#1141 floor), not 0.004%.
- Rig tolerances still to be met by construction (Monte Carlo aspect within 3%; torsion MC ±0.3 Å at 20k
  sweeps; ε table "to 3 digits"), asset sizes, and #1119's `forward-readout.csv` (the synthesis itself defers it).
