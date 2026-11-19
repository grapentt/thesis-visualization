# Completeness check of `synthesis.md` ("Where to Add the Noise")

Verifier: completeness lens, 2026-11-19. I checked the synthesis against r1–r8, g1–g4, the critic, the
216-idea index, `rg-main/docs/theory/README.md`, `docs/status.md` and `lab/`. I also grepped all of
d1–d5 and the three judgements, to separate ideas the synthesis dropped from ideas no designer ever
proposed. Each finding cites the report section that carries the numbers. Numbers are quoted from those
reports with their tags; I added none.

## 1. Verdict

The synthesis is thorough on the main arc. It covers wδ's barriers and costs, stiffness and the
reconciliation of Part 1, pullbacks and the orange peel, the two halves of BBA, range and order, the
volume-term correction and the wall. All nine of the user's asks are addressed somewhere. Four things
are missing or under-explained, and they matter for the story the user asked for:

1. **The chart the current approach rests on is never introduced.** Internal coordinates first appear as
   a dot on E4.2's plane and as a design card in E5.6. The programme never shows what they are, why
   thermal-width channels make the stiff part free, or how they went from "only an ablation" (10-23) to
   the best BBA map (#955) to the backbone (11-14).
2. **Sprint 10's "which metric?" phase is skipped.** It produced the lesson "better conditioning did not
   reliably improve generation; change one ingredient at a time", which is the reason Era 2 restarted
   from first principles.
3. **The first test of order is omitted.** The lag sweep of 11-05 was pre-registered as *order*
   ("an early basin decision helps") against *synchronized erasure*, and order appeared to lose, on a
   molecule that cannot test order. Without this, the central reversal reads as hindsight-linear.
4. **E6 shows only the force field's defects.** It never shows that the internal-coordinate force
   fields were the best in the study. For comparison, native ScoreMD drifted to 3.2–3.5 Å and the best
   Cartesian base to 1.9–2.6 Å.

About a dozen medium additions would close the remaining gaps. They include:

- the four things the block cannot supply, kinematics among them;
- the reverse dose of the order dial;
- the time-reallocation alternative to a new chart;
- three missing analytic toys;
- the predictive limits of readable windows;
- Euclid's "accidental order";
- wδ's data-efficiency rationale;
- the fate of the FP and flow-matching promises;
- counter-evidence from the literature;
- the BBA stationarity test and its trap;
- "access" as the third thing a chart changes;
- the C3 sampler route;
- evidential counterweights to optimism.

Narrating everything adds about 6–7 minutes. Narrating only the high items and F5–F7, and moving the
rest into chips, X2 and X3, adds about 3½ minutes.

## 2. Coverage of the user's explicit asks

| Ask | Where the synthesis covers it | Quality | What is missing (finding) |
|---|---|---|---|
| Euclidean metric is arbitrary | E1.1 (toy, real αR pairs, ρ = 0.50), E1.2 (units, scale cylinder), E1.4 (barriers), E4.1 (≈38× rulers) | good | The honest counterpoint: Euclid keeps the hierarchy (F10). Mirror images (F18). Augmentation vs equivariance (F19). |
| Straightening with wδ | E1.3 HOPE, E1.5 straight in feature coordinates, E1.8 famous figure + rank-1 check, E3.2, E3.9 CAME TRUE DIFFERENTLY | very good | The stated reason it should help: the geometry removes the forbidden volume, so a data-efficiency win was expected (F11). |
| Embedding and pullback | E3.1–E3.4, coda "same metric, two machines" | very good | — |
| Stiffness | E2.0–E2.10 | very good | The Sprint 10 prehistory, where noise that does not break bonds was the first form of the idea (F2). The schedule-only alternative (F7). |
| Analytical examples worked out | 31 rigs (R1–R31), X2 | good | Curved valley / factorization (F1). Two basins (Prop. 10), density vs force, line vs helix (F8). The simple-marginal numbers (F22). |
| Noise destroys modes at different times | E2.2–E2.3, E5.2–E5.5, P0.1 | very good | — |
| How new coordinates / a new metric change that | E2.3 γ, E3.2 cone, E3.8 lag dial, E5.4 γ on BBA, E5.6 block gesture | good, but the central chart is missing | Internal coordinates never introduced (F1). The reverse dose (F6). |
| Why that helps | E2.4 Tweedie, E2.5 loss, E2.6 valley, E2.7 blur dial, E5.1, E5.7–E5.9 | good | The counterfactual "spend more training where bonds die" (F7). Access (F15). What windows can and cannot predict (F9). |
| What else was done | X3 spurs, E3.7 map zoo, E4.7 scatter | partial | Sprint 10 (F2). Retention pilot and maps (F7, F23). C3 sampler route (F16). Further spurs (F23). Promise ledger (F12). |
| Why approaches looked promising or failed | +/→ pairs at every station | good | wδ's rationale (F11). Sprint 10's conditioning rationale (F2). Internal coordinates from "ablation" to backbone (F1). Order's first loss (F3). |
| Why optimism now | E6.10 (five reasons + not established), E6.2, E6.3 | partial | Force-field ranking (F4). Stationarity test (F14). Evidential counterweights (F17). Literature cautions (F13). What next (F24). The four "cannot supply" boxes (F5). |

## 3. Additions, ranked, with where each fits

### High

**F1 · Internal coordinates are never introduced or derived** → new **E4.1b "A chart built from the joints"**
(≈70 s, lens `channel`), before E4.2. Add a plant in E3.7's map zoo, link Retention 08 and put a reversal
pill in E4.2 or E5.6.
- *Missing: what they are.* 27 log bond lengths and 26 log tan(θ/2), Cholesky-whitened by the training
  population covariance. 25 torsions as phase pairs κ(cos τ, sin τ) with κ = 1.504. That gives 103
  SE(3)-invariant, non-redundant channels with signed torsions. The NeRF decoder reads each torsion with
  atan2, because a noisy phase pair leaves the circle. C3's unit-phase hint p/max(|p|, 0.05) extends
  the window of the rebuilt-distance inputs from t ≈ 0.04 to 0.11 [r6 §2.8; r4 §1.11].
- *Missing: why thermal-width channels help.* Note 28 §6 and note 19 §3 make the argument exact. If
  p(s, r) = p_s(s) N(r; μ(s), L(s)L(s)ᵀ), then z = L(s)⁻¹(r − μ(s)) stays standard normal under VP noise
  and its score is −z at every level, so the network only has to learn the soft density. The curved
  thermal valley A = V(s) + ½k[r − a cos s]² has this exact all-time score, provided the curvature drift
  −κa cos s is kept [r2 §3.4; r4 §2.13].
- *Missing: prior matching.* With the zero-initialized Gaussian-residual energy, the untrained model
  already outputs the bond distribution. Internal bond W1 is at the data level at update 0
  (0.0023–0.0025 Å, against 10.3 Å for Cartesian; 1,000-molecule monitors, #1071) [r6 §2.1, §4.6].
- *Missing: the genealogy.*
  - Sprint 10's internal-chain OU design (#529) [r4 §2.12].
  - Note 20 keeps internal coordinates "only as an ablation (not transferable)" (2026-10-23)
    [r2 §5.4; r3 §7.13].
  - #955 finds them "by far the best BBA representation": bond 0.0016 Å, angle 1.8°, TIC JS 0.069,
    against flat 1.00 Å, 14.7° and 0.151 at 20k updates [r4 §1.6].
  - C3 (#1026), then ordered internal coordinates (11-14).
- *Show:*
  - the 103 channels built on the BBA chain;
  - the valley toy as a new rig (`valley.js`, closed form plus Node test), with samples travelling
    (s, r) → (s, z) as in Retention 08. Update that scene's caption from "proposed, not established" to
    "the current backbone";
  - an update-0 bar;
  - a preview of the lever-arm cost, which E5.5 pays off;
  - a dated pill: "ablation (10-23) → best BBA map (#955) → backbone (11-14)".
- Without this scene, M5 (prior matching) and the "range" half of the final design are asserted, never
  explained.

**F2 · Sprint 10's "which metric?" phase is skipped** → expand **E1.9** to ≈70 s, or add **E2.0a
"Better conditioned, not better"** (≈45 s). Add a Must.
- E1 uses #513/#522 but none of the rest of #520. Under one physical-density and force contract
  (note 17) the sprint compared these candidates against flat:
  - planar-compatible wδ (#523);
  - chemical-feature metrics;
  - transferable noising.
- Its findings:
  - **#528, bond protection.** The chemical metric cut median bond variance by 38% and the planar
    metric by 86%. Planar wδ moved 2.93× flat's torsional variance. This is "the stiffness intuition in
    its first form: noise that does not break bonds".
  - **#529.** Metric-weighted force learning was 5.9–8.2% worse in all three seeds.
  - **#603.** Density and populations improved, but force MSE was 13.8–27.8% worse.
  - **#679/#687.** Every thermal tree-bond variant lost angular quality.
  - **#607.** Note 19's analytical collection [r2 §1.1].
- The closeout lesson recurs on BBA (#808's best κ failed; E4.3's caption; E4.7):
  > "Better conditioning did not reliably improve score risk, rare-basin populations or generation.
  > Some constructions changed the metric, prior and noising law together, so the cause … was not
  > identifiable … Change one of those at a time."
- *Show:* a three-row scoreboard (bond protection ✓, force ✗, density ✓ / force ✗) and the quote. Add
  the Must "change one ingredient at a time", which Era 2's "each problem belongs to one choice"
  satisfies. Plant "conditioning ≠ generation" for E4.

**F3 · The first test of order (11-05) is omitted** → **E3.9** (one card before the race), with a callback
in **E5.4** and an entry in X3's corrections timeline.
- The lag sweep was pre-registered as two hypotheses:
  - **A**, "an early basin decision helps": the 1 ps warp should be fastest. This is an order
    hypothesis, anticipated by note 26: "retaining basin identity longer … can support a
    coarse-to-fine reverse process".
  - **B**, "synchronized erasure helps": the 100 ps warp should be fastest.
- B "wins the early race decisively" (JS 0.027 against 0.127 at 100 updates). The #769 comment then
  recommended that "all modes are erased together".
- The same-day correction traced the win to Gaussianization, not synchronization. A was never revived,
  and ALDP5 cannot test order. A week later, on BBA, order became the design [r5 §1.2, §1.5; g2 §1.4].
- *Show:* the A-versus-B card, "B wins", "because of synchronization" struck, "because of
  Gaussianization" typed. Leave A greyed with the footnote "ALDP5 cannot test order". When E5.4 turns
  the "?" pin to REVISED, light A: "the order hypothesis lost on a molecule that could not test it".
  This directly guards the hindsight-linearization risk that §8.1 lists.

**F4 · E6 never shows that internal-coordinate force fields were the best of the study** → first layer of
**E6.5**, or an **E6.4a "Who simulates best"** (≈40 s). Add a line to E6.10.
- Registered budget, #1088 (256 data starts, pooled 50–100 ps, two read-out levels):
  - internal-coordinate families: bonds at the panel floor, angles 1.9–2.9°, size error 0.84/1.22 Å
    (C3) and 1.14/1.18 Å (loud rows, which carry the wrong volume term);
  - covariance-matched Cartesian base: 1.85/2.59 Å;
  - Cartesian + distances: 7.9/4.7 Å;
  - native ScoreMD: 3.2/3.5 Å;
  - wδ: angle errors 17–18°;
  - data panel: 0.14 Å [g1 §1.9, §4.7; r7 §1.2; r6 §4.8; g2 §4.7].
- This is the original "one model, two uses" promise (T5) carried to BBA, and a main pillar of the case
  for optimism.
- *Show:* a leaderboard panel with the loud rows hatched "wrong volume term, superseded 11-16", then the
  corrected and full-schedule points (0.24/0.30 → 0.118 Å) and the drift. Add to E6.10: "best force
  fields of the study; the learned score passes a stationarity test from t = 0.05 up" (F14).

### Medium

**F5 · The four things the block cannot supply are never listed, and "kinematics" is absent**
→ **E6.0** (four open boxes), **E6.8**, ticks in E6.10.
- E6's title promises the list from note 30 §7: wall, handedness, kinematics for free, sharp soft forces.
- The kinematics measurement (#1102):
  - generated blocks and rebuilt chains disagree by 0.42/0.43 Å per bead at the median, against a model
    floor of 0.15/0.16 Å;
  - the tail is heavy (99th percentile 2.89/2.62 Å);
  - the 10% most mismatched molecules carry 35.8/39.7% overlaps, against 14.5/15.3% overall;
  - the mismatch is still shrinking at the end of training (median ratio 0.744 → 0.043/0.047)
    [r7 §1.7, V12, V23; r6 §6 item 28].
- d2 and d3 proposed this card and the synthesis dropped it with no §10 entry. In E6.8 it is the measured
  reason the joint rebuild helps.

**F6 · The order dial is never run backwards** → **E5.4** dose–response, as a second series.
- Half-whitening Cartesian (pure modes at γ = 0.5, P1) raised its size error from ≈0.09 to 0.277 Å while
  its bonds improved (0.0125/0.0133 → 0.0046 Å) [#1057; 50k updates, one seed, 20,000 molecules;
  r6 §4.4; g3 §5.3].
- This is the cleanest causal evidence for order: add order to internal coordinates and size is fixed;
  remove it from Cartesian and size breaks. Caption: "remove order from Cartesian: size breaks, bonds
  improve".

**F7 · The schedule-only alternative to a new chart is missing** → a ≈25 s lens `time share` after **E2.4**
(or in E3.5).
- *Retention pilot (#929, training-free).*
  - Flat noise erases bond and angle information between t ≈ 0.002 and 0.08, 10–20× earlier than
    spring16.
  - Only 3–7% of uniform training draws land there (spring16: 17–34%).
  - A 2×128 MLP reads 0.39 of bond-width information from flat coordinates, against 0.99 from spring
    features [r5 §1.3, §4.2; critic number check].
- *Time-allocation intervention.* Half of flat's draws were placed log-uniform in [0.002, 0.08]. Bond
  error fell 21–45%, but angles, torsions and coupling were worse for 5,000–10,000 updates: "not a net
  improvement" and short of spring16 [r5 §1.3, §4.3].
- This matches Ahamed F.3 ("scalar time weighting cannot fix directional stiffness") and #780 [g3 §5.2].
  It is the direct answer to "why change coordinates rather than the schedule": a schedule moves training
  time; a chart moves the window. d3 used #929; the synthesis dropped it.

**F8 · Three high-value analytic toys are missing** → new X2 rigs. Narrate (a) in **E3.7** as the bridge to
E3.9, (b) in **E6.5**, and (c) as E5.1's third fact.
- **(a) No constant metric changes multimodality** (note 21 Prop. 10). Take two basins 2 Å apart with
  width 0.2 Å: roughness is 624, and flat noise lowers it to 397/149/11 at σ² = 0.01/0.04/0.2 Å². This
  is the derived reason stiffness removal gave no torsion or αL gain. Only a nonlinear, density-aware
  map, the Gaussianization of E3.9, can change it [r2 §3.15; r5 E9; r3 §5.3].
- **(b) Density and force prefer different models** (note 19 §2).
  - A 10% stiff-mode error has KL 0.0027 but force error² 1.
  - A 50% soft-mode error has KL 0.097 but force error² 0.25.
  - Narrow conditionals demand accurate means: the KL is kδ²/2θ, the squared force error k²δ² [r2 §3.3–3.4].
  - This explains why a force field is harder than a sampler, and why #603 saw better density with
    worse forces.
- **(c) Same metric, different denoising difficulty** (note 28 §3). A line and a helix carry equal
  metric, rank and density, yet the posterior variance is 0.01 against ≈0.50 [r2 §3.18; r5 E14]. The
  channel, not the metric, sets readability.

**F9 · What windows can and cannot predict is never stated** → **E5.3** estimator card, **E5.4** annotation,
**E6.10** "not established".
- Windows "ranked the models correctly by size error but understated the differences": from γ 0 to 0.5
  the window shrinks 10% while the error doubles.
- #1026: windows "did not predict how fast global structure is learned".
- Q4 of the study (predict outcomes before training) was not tested.
- wδ's angle window is above Cartesian's, yet its angles are worse [g3 §5.3, §5.6; r6 §1.1, §7; g2 §5; g4 §5].

**F10 · The honest counterpoint to "Euclidean arbitrariness"** → a plant in **E3.8**, paid off in **E5.3/E5.4**
(optional coda to E1.1).
- #761 (10-25): raw Euclidean shape distance reveals ALDP5's 2-D torsion sheet (local dimension 2.0 from
  0.4 Å per atom). In thermal step widths there is no plateau: "whitening removes the scale separation
  that makes the sheet visible; use different rulers for different jobs" [r4 §1.2; r5 §1.1].
- This is the first sign that equalizing erases hierarchy, and it makes "Cartesian: order without range"
  intelligible. Payoff line: "Euclid was arbitrary, not useless: its steep spectrum is an order".

**F11 · Era 1's stated reason to expect a win is absent** → one line in **E1.4** as Q1's "+", closed in
**E5.9**.
- The way-forward brief (09-15):
  > "On flat coordinates the score field must … learn the shape of the accessible basin and learn to
  > avoid the vast forbidden volume … On (M, g_wδ), (b) is substantially handed to it by the geometry.
  > That is the reason to expect a data-efficiency and generalisation win."
- The deck: "Unphysical configurations are pushed off to infinity → never sampled".
- The hope was never tested: #266 closed on 10-24 without M1. It was later answered in general: "they
  do not save data" (10-25 pilot) and "learning speed, not data efficiency" (note 30)
  [r1 §5; g1 §1.2, §1.11 G8–G9].
- Close it next to E5.9's "no chart buys statistical efficiency".

**F12 · The original deliverables' fates are not narrated** → **P0.2/P0.3**, a ≈20 s "promise ledger" in
**E1.9**, one line in **E6.10**.
- The Laplace–Beltrami Fokker–Planck regularizer, the pitch's core novelty, moved from M2 to M3/M4 on
  10-06 and was never trained in a generative model.
- Riemannian flow matching lost ≈3× in its only pilot and never started as M5.
- The AK ablation and Chignolin never ran. The paper-protocol simulation PMF is unmeasured.
- FP consistency survives as a reserve remedy for the BBA drift ("about four times the cost per update";
  ranked lower on 11-15) [g1 §1.3–1.6, §1.10–1.11; r7 §1.3].
- X3 lists the spurs, but no scene says what happened to the promise.

**F13 · No counter-evidence or rival mechanisms on the positioning card** → add a "cautions" column to
**E5.12**, and a chip in **E6.6**.
- Falck's EqualSNR: images do not need the hierarchy, and FID tolerates losing it.
- Ahamed G.9's inverse amplification is a rival account of why full whitening is bad. g3 argues order is
  more plausible on BBA, where the linear whitening gain is only ≈4.
- Everaert, "order costs correction": early decisions cannot be fixed later. The constraint split cuts
  both ways.
- Sclocchi: coarse-first is incomplete for hierarchical data.
- Internal-coordinate generators are known to clash: Köhler et al. 2023 report 33–36% on BBA
  [g3 §5.2, §5.3, §5.5].
- This is consistent with §10's rule "image analogies only on the precedent card".

**F14 · The BBA stationarity test and its trap are missing** → ≈30 s in **E6.4** (after the phantom spring)
or **E6.8** (before the simulation-fitted wall). Reuse E3.6's Stein needles.
- #1100's test is simulation-free. On noised inputs the learned score passes it at levels 0.05–0.4.
- At 0.01, C3 has a learned compaction bias (Rg residual −4.6 ± 0.5 and −2.8 ± 0.5) and the loud
  models do not (+1.9 ± 0.8 and +2.3 ± 0.7): "direct evidence that the loud block also helps forces".
- The trap: a 155-term correction fitted on data alone passes the test (rms z 7–15 → 0.7–0.8) yet
  worsens size in simulation, because "making the data stationary is a local condition"
  [r7 §1.5 items 2 and 4, §5.4, V15].
- This is why E6.8's wall is fitted against simulations. Caption: "necessary, not sufficient".

**F15 · "Access", the third thing a chart changes, is missing** → **E5.9 → E5.10**. Add a Must or a
sub-tick of M4.
- Note 30 §3: a chart changes the *profile* of the training signal, its *share* of the reducible loss,
  and the *access* (which function of the noisy channels the network must compute). The synthesis shows
  only the first two.
- Access is measured:
  - the 0.39 vs 0.99 readout of F7 (#929);
  - pair-distance inputs, which improve Cartesian bonds 54–60× (#985).
- #1025's fifth condition reads: "redundant physical features belong in the input, not the noised state".
  This is how C3 uses rebuilt distances, and why whitening's redundancy, placed in the noised state,
  failed [r6 §2.11; r4 §2.14, §5.4].

**F16 · The C3 sampler route is reduced to one coda** → extend the **E5.5** coda by ≈15 s, as a +/→ chip
"repair at sampling vs learned chart".
- #1065, equilibrium + hard core: Rg 0.07/0.08 Å at about twice C3's local errors.
- #1090, torsion-only equilibration with a stabilized size weight: 0.053/0.093 Å at plain-C3 local
  accuracy on 20,000 molecules. That is as good as the chart route, but the weight is fitted against data
  [r6 §1.6, §4.5; status 11-15].
- This is the reason the chart route was preferred.

**F17 · Evidential counterweights to optimism are missing** → chips on **E6.2**, two lines under **E6.10**
"not established".
- The ordered model's size stays ≈0.11 Å from 50k to 1.9M updates, while the Cartesian model "keeps
  improving with training" (seed means 0.104 vs 0.074 Å; "whether the gap closes is open").
- Pooled Rg W1 is a weak readout: the untrained internal model already has the data's mean size, through
  self-overlaps.
- Tight verdicts:
  - #1071 missed its criterion by 0.007 Å;
  - #1107's contact condition passed by less than 0.0001;
  - #1109's seed-3 size error sits at the floor's 95th percentile.
- The late-repulsion settings and the five full-schedule models were chosen after seeing results
  [r6 §7; r7 §7 items 9–10].

### Low (chips, X2/X3 entries, single lines)

- **F18 · Mirror-image thread** → one card in E1.7 and a filament to E6.9.
  - wδ's quotient includes reflections (w(X, RX) = 0).
  - O(3) alignment reflected 19.52% of ALDP5 frames (signed JS 0.1774 with zero shape error).
  - The chirality lift: "sample, don't argmax"; "a reflection-symmetric metric can support a
    reflection-asymmetric density".
  - αL is a real basin, not a mirror artefact. The physical contract later moved to SO(3).
  - It rhymes with E6.9: two vectors carry no handedness, torsions do [r1 M20, E12, §1.4; g1 G2; r8 §1].
- **F19 · Architecture confound** → E3.7 guard and a line in E1.1. A rotation-equivariant Cartesian
  network narrowed the quantum-spring advantage from 32–46× to 1.7–2.4× (#793). Exact equivariance gave
  ≈2.65× lower flat bond error than augmentation (#823) [r3 §5.3, §7.6].
- **F20 · Noise-only controls** → E3.6 and E6.5 guards. Simulations started from training frames mostly
  preserve the start set (#895). Whitening's learned force lost to its own noise-only control (TIC JS
  0.330 vs 0.290, #944) [r3 §5.4; r4 §1.4].
- **F21 · The target side of intrinsic diffusion** → a third row in E1.5's code pane. Labels were
  separation-gradient surrogates (s_log). ISM carried a covector-divergence sign error until #355. Label
  error grew past the "injectivity radius" (9.8° → 35°). Then there is the cut locus
  [r1 headline, M10, M16, E16].
- **F22 · The simple-marginal mechanism, quantified** → E5.6 design card and E5.9 ([D·model]).
  - An ideal chain given only the |a₁| marginal: Rg W1 0.90 → 0.066 Å (93% of the size error removed).
  - Mode lengths are within 0.008–0.063 nats of a Gaussian, against 0.30 nats for standardized Rg.
  - A 0.43 Å mean-Rg shift costs ≈0.02 nats, which is why the loss barely sees size [r6 §3 items 8–9].
- **F23 · Further spurs for X3:**
  - static population-density flow (#946; ALDP5 JS 0.15 vs 0.011);
  - intrinsic spring retraction (#947; 2.4× cheaper than geodesics, 10.8× the angle error);
  - Rao–Blackwell DSM (#931; variance cut 3.5–88× at t ≥ 0.1, none at t ≤ 0.02);
  - learned retention maps (#933; fast early, all good maps converge);
  - maximum-sine references (#986; BBA size 3× better, angles 33× worse, hence chemical-local
    references);
  - factorized densities' lessons, "likelihood is not a structural readout" and "complete what is local,
    learn what is global" [r4 §1.3, §1.7, §1.10, §5.4; r5 §1.4].
- **F24 · What next** → one line in E6.10 and an X3 card [r7 §1.12, §7].
  - The guide programme (#1117–#1123), including a schedule-only test of timing vs information (#1120).
  - A third loud vector for handedness.
  - Transfer (#1124): Rouse directions transfer, but c₀ and the internal whitening still need target data.
- **F25 · The method thread** → E6.1, beside "this time: fresh seeds, registered criteria, effect rule".
  - "Change one ingredient at a time" (10-22).
  - The pre-declared protocol (10-26).
  - The registered budget with fresh seeds and the effect rule (11-14).
  - Lab result cards that name "the single change", and the rule "a refuted idea is a successful lab
    entry" (#1097, 11-16, after ≈150 PRs in 12 days) [r2 §1.1; r8 §1; r7 §1.4; lab/README.md].
- **F26 · Two force principles** → one sentence each, in E2.7 and E6.4.
  - "The force does not depend on the metric": the metric changes only the vector form of the score and
    the volume term (notes 17, 20 §8, 29).
  - The bias–variance vise, measured: soft forces 4.4× more accurate with stretched noise; 500 frames
    match 10,000 flat frames (≈19×) [r2 §3.22, §5.1; g1 §2.7, §3.3].
- **F27 · Anatomy of the drift** → a lens in E6.5 (#1089).
  - A compaction, not a swelling: bonds change by < 0.007 Å, the 1–4 distance by up to −0.54 Å,
    long-range distances by −1.4 to −3.2 Å.
  - Half is a population shift toward compact states, half shrinking within states.
  - Overlaps appear within the first picosecond, and the drift does not level off within 500 ps
    [r7 §1.3, V14].
- **F28 · Size is a joint error** → one bar in E4.5. Exact marginal matching still leaves Rg W1
  0.48–0.52 Å (#1010–#1015) [r6 §1.1].

## 4. Proposed by a designer but dropped without a §10 entry

- The four-box "what two loud vectors cannot supply" card, including the kinematics measurement
  (d2 Part 5 end card; d3 with #1102) → F5.
- The retention pilot's window shares (#929, in d3) → F7, F15.

All other gaps above appear in no designer document. They are systemic: the understanding reports
contain them, but the brief's one-page story did not surface them. Examples are Sprint 10, the
genealogy of internal coordinates, Hypothesis A, the force-field leaderboard and the reverse dose.

## 5. Checked and adequately covered (no action)

- The critic's four gaps (origins, straightening, literature, number canon).
- Moving baseline, XLA miscompile, Gaussianization correction, volume-term correction, the #1025 → #1055
  correction, the struck αL bound, the dummy BBA data, the Chignolin exclusion.
- Readability's three facts, "decided backward", anti-order, constraint split, why two vectors, KL area,
  skeleton-and-arrows.
- The ScoreMD dilemma and the blur dial, the count-dependent PMF floor, budget stops, the effect rule.
- wδ's afterlife as a feature map, and the barrier that killed vs the barrier that may save.
- Rouse modes, the handedness detective, the joint rebuild with hard core, the simulation-fitted wall
  with its size term.
- Deliberate exclusions in §10 (G_t, Λ_t, pull vs move, Müller–Brown, PGA atlas) are reasoned. None of
  the findings above reverses them.

## 6. Cost and placement

If all high and medium items are narrated, the additions are roughly:

| Items | Added time |
|---|---|
| F1 | ≈70 s |
| F2 | ≈45 s |
| F3 | ≈15 s |
| F4 | ≈40 s |
| F5 | ≈30 s |
| F6 | ≈10 s |
| F7 | ≈25 s |
| F8 | ≈45 s |
| F9–F11 | ≈35 s together |
| F12 | ≈20 s |
| F13 | ≈15 s |
| F14 | ≈30 s |
| F15–F17 | ≈35 s together |
| **Total** | **≈7 min** |

To hold the series near 68 min:

- Narrate F1–F7 (≈4 min).
- Put F8 mostly into X2 (≈15 s narrated).
- Make F9–F17 chips or single lines.
- Move the low items to X2/X3.
- Use the existing §10 cuts (E2.6, E3.6, E4.5, E5.9 as link cards) as the offset. If E5.9 becomes a link
  card, move F15's three-effect line to E5.10.

Three items are cheap and high-yield: F3 (one card), F6 (one dot series) and F4 (one panel from logged
values). They need no new assets beyond `ledger.json` rows.
