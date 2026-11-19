# Pedagogy judgement: explanatory power

Judge: pedagogy. Lens: would thesis supervisors, examiners, and ML and physics peers understand each idea and the project's evolution? That means why each step was taken, why it worked or failed, and why the current approach is promising. 2026-11-19.

Inputs: the brief, the critic, the g4 number canon, all five proposals in full, and spot checks against r1, r2, r4, r6 and r7, notes 20–21 in `rg-main`, and the user-feedback section of a3.

## 1. Verdict in brief

- **Spine: d1 (story).** It is the only structure that makes the evolution itself explain things:
  - each episode poses one question, shows why the attempt looked promising and the measurement that broke it, then rewrites the question;
  - a List of Musts grows with each failure;
  - planted threads pay off later.

  The user asked for "why the approaches looked promising or did not work out, why we are optimistic". d1 answers that structurally; the others mostly answer it in transitions.
- **Fill d1's episodes with d2's rigs.** d2 is the best at "derive results visually" and "some analytical examples worked out". Its exact small worlds give each idea a derivation the viewer can test.
- **Draw it in d5's visual language:**
  - the log-SNR rail with a waterline and fog;
  - the warm-to-cool scale ramp, so order and anti-order are visible as a colour gradient;
  - the Fog Bench;
  - the exaggerated-then-real cone;
  - the collapsing chain.
- **Hand over with d4's discipline:**
  - well-posed "your turn" questions;
  - the γ handle that is October's fix and November's diagnosis;
  - above all, d4's symbol hygiene, the only proposal that removes the γ and κ notation collisions.
- **Audit it with d3's conventions:**
  - provenance strip, two floors, the no-comparison glyph, "how to read a result" and the count dial;
  - the real-data scenes: the ruler disagreement on ALDP5 frames, and four charts noising one real BBA molecule.

| Proposal | Fidelity | Explanatory | Craft | Feasibility | Coherence | Overall |
|---|---:|---:|---:|---:|---:|---:|
| d1 story | 8 | **9** | 8 | 7 | 9 | **8.5** |
| d2 mechanism | 9 | 8 | 8 | 8 | 7 | 8 |
| d3 evidence | 9 | 6 | 7 | 7 | 7 | 7 |
| d4 interaction | 8 | 8 | 8 | 7 | 8 | 8 |
| d5 visual | 8 | 8 | 9 | 7 | 9 | 8 |

## 2. How I judged

The questions I asked of every scene:
1. Is there an unexplained jump, in time, between molecules or in logic?
2. Is the scene overloaded: two ideas, or more numbers than ~2 words/s of narration can carry?
3. Is the intuition missing: a number without a picture, a claim without a derivation?
4. Is notation used before it is explained?
5. Is there a moment the audience will remember?

I applied the user's recorded feedback on the information-geometry video (a3 §5):
- animate where distributions come from before comparing them;
- never let differing scales fake a difference;
- explain notation before definitions, tied to the running example;
- derive results visually;
- give intuition for choices;
- say what depends on coordinates;
- never show an unexplained curve or label;
- add more explanation everywhere.

Two procedural lessons from that round also count:
- "the fix was to add scenes, not patch them", so an overloaded scene should be split rather than trimmed;
- "cut repetition".

The u1-force rules apply too: five levers per piece, the first touch is the reveal, every readout has a comparison target, and one climax image per piece.

## 3. Coverage of what the user explicitly asked for

| User's ask | d1 | d2 | d3 | d4 | d5 |
|---|---|---|---|---|---|
| Why the Euclidean metric is arbitrary | strong (E1.1 toy: 8.5× closer, 2.4× costlier) | strong (P.1 toy, plus a rigid rotation along Part 0's orbit) | **strong, on real data** (1.3: two αR pairs, 0.036 Å and 4.0 widths against 0.243 Å and 1.46 widths, ρ = 0.50) | strong (P2-S01 real frame, live ruler toggle, energy bar as the comparison target) | strong (2.1 toy in three builds incl. rigid motion; 2.2 units) |
| The straightening idea with wδ | ok, but the hope comes **after** the failure (E1.8); payoff E4.3 | ok (P.2), but P.6 mixes three eras | **thin**: debunk bars only, the hope never shown | ok (P2-S03, then P3-S07) | **best ordering**: hope (2.3), then debunk (2.7), then afterlife (4.2, ◌ → ◆) |
| Embedding and pullback | strong (E3.1–3.3) | **best depth** (Part 3: pullback, cone, orange peel, normal stiffness α/σ) | **missing**: one line in 3.3, no cone, no orange peel, no lift and project | strong (P3-S01–S03) | strong; ★ 3.4 exaggerated cone then the real 5.9° |
| Stiffness (the three problems) | complete (E2.1–2.6) | **complete, best derived** (2.1–2.7) | problem 2 (target scaling, training curvature) missing | complete (P2-S07–S09, pairing strip) | problem 2 missing; Part 1 reconciliation squeezed into a ribbon (3.0) |
| Analytical examples worked out | many | **every scene** | few | many | many |
| Noise erases modes at different times; coordinates change that | Erasure Clock, E5 | **best derivation** (one mode → nine rows → 27 rows; exact chain; two halos) | best real-data view (5.2: four charts, one molecule) | best active learning (P4-S02 hand-over) | **best visual grammar** (rail, ramp, Fog Bench) |
| Why approaches looked promising or failed | **best** (+/→ pairs, verdicts, Musts, dead-end spurs in X2) | thin (Era 4 fragmented) | good, evidence-led | good (verdict board, E0) | good (transitions, swimlane, correction ribbons) |
| Why we are optimistic | **best** (E6.9: Musts ticked, 5 reasons, what is not established) | brief (5.6) | good (7.8 claim cards) | brief (P5-S08) | brief (6.8 reuses r7 §5.6) |

## 4. Per-proposal assessment

### d1 · Story ("Where to Add the Noise")

**Great moments**
- **The false summit and its reversal.** E2.6 ★ states "erase everything together" with full derivational confidence and a tiny "?" pin. E4.8 makes the pin blink. E5.4 brings E2's climax image back, strikes "the promise" and recaptions it "range without order".

  This is the project's pivotal correction (g3: note 21's goal became note 27's diagnosed cause). Letting the audience believe it first, the way the project did, is the right way to teach it.
- **Question surgery and the List of Musts** (M1 closed-form kernel … M9 wall supplied). Every failure leaves a requirement. The finale shows which Musts the design meets and which it meets only by repair. That is the clearest answer to "why the current approach is promising" in any proposal.
- **Threads.** The collision-barrier rose pin is planted in E1.3 and paid off in E6.5 [H]. The HOPE stamp becomes CAME TRUE, DIFFERENTLY. The E2.4 read-out handle returns in E6.4. "ALDP5 cannot test order" is a footnote that becomes E4's first line. Examiners judge whether the path was rational, and threads show that it was.
- **E2.2 "One wrong ruler, seen from both sides"**, which resolves the Part 1 contradiction the critic flagged.
- **E5.10 "what is precedent / what is new"** (Ahamed, EigenFold, Chroma, R-DM, latent forcing against the measured decomposition, the probe, anti-order, the constraint split and the immersion volume). It is the only explicit novelty card in the five proposals, and examiners will ask that question.

**Weaknesses (explanatory)**
- **The prologue is a trailer full of unexplained labels.**
  - P0.2 shows six postcards in 150 s with about fifteen numbers (0.117 ± 0.007, 1.55×10⁶, 340–600×, 0.0151, 0.0114, 184 → 2.99 …).
  - P0.3 shows the full Clock, with lanes labelled "order without range" and "range without order (anti-order)", before any of those terms exists.

  This violates "never show an unexplained curve or label" and "cut repetition" (E5–E6 show it again).
- **E2.1 jumps straight to nine rulers and the t½ formula**, with no single-mode warm-up and no samples before curves.
- **E4.2–E4.3 are overloaded and out of place.** They pack the warp lens, a time-scale ladder, the lag slider, a race, a timestamped correction pill, γ-sweep bars, the banana toy and the HOPE flip into 150 s. They also go back to ALDP5 right after "Meet BBA".
- **E1 ordering.** The straightening hope (the deck's valley cartoon) first appears in E1.8 as a debunk, so the viewer never feels why wδ was attractive beyond its barriers.

  E1.9 also shows residual-stiffness bars ("by the criterion that ended the era") before E2 defines residual stiffness. That criterion is note 20's, from 10-23, the day after the era closed.
- **E5.8 holds two ideas**: the KL "same area, different profile" identity and the skeleton map's "readable is not learnable". Split them.
- **On-screen jargon**: "C3", "C1"; γ used for both the spring soft scale (E2.5) and the whitening exponent (E5.4); κ = 1.504 for the torsion phase scale (P0.0).

### d2 · Mechanism ("The Bench")

**Great moments**
- **2.2 "One mode, one meter".** 400 seeded samples pour in on one axis that is never rescaled, then their noised images, then the exact curve. The λ lever shows that 100× more variance moves t½ only from 0.093 to 0.486. It is the user's feedback implemented literally, and the warm-up every other proposal lacks.
- **2.1 ghost bundles at the floor.** Torsion ghosts coincide while bond ghosts fan out: "the stiffest modes are still mostly undecided" becomes visible.
- **2.5 the Part 1 reconciliation**: "a huge weight on a window that the noise almost never opens". Per-level weight × readable window, integrated, gives ≈1.5× (note 21: stiff 17.5 against soft 11.4). The equal-relative-error KL result (½·0.05² in every mode) completes it. It is clearer than d1's split screen.
- **3.3 orange peel via the circle deficit 1 − sin θ/θ.** The circles of constant tilt must stretch when the cap is pressed flat. The distortion is derived visually, not asserted.
- **3.4 normal stiffness α/σ.** "Redundancy turns finite stiffness into a normal stiffness that diverges at low noise" plants the BBA whitening failure on a toy before it happens.
- **4.5b "two halos".** At the same t, chart A's completions have their torsions half decided and sizes everywhere, while chart B's disagree on torsions yet sit in one Rg ring. It is the most direct intuition for what the loud block buys.
- **The toy / molecule badge pair and the rig stamp.** Every readout gets a comparison target, and every exact world states its assumption.

**Weaknesses**
- **The prologue mixes eras.** P.6 combines Diepeveen 2025's banana, the 11-05 Gaussianization result (a 100 ps warp no one has seen yet) and wδ's BBA afterlife ("86× worse than ordered internal coordinates") in the first video. Those numbers are notation before explanation.
- **The Era 4 story is fragmented.** There is no "prediction ≠ generation" (about 30 objective changes) and no #1055 "the fold dissolves with the detail". The 2×2 of the first chunk is squeezed into 3.7 (60 s), the learned warp is a single number (3.6), and the lag dial is an inset of 4.2. The viewer does not see why the project moved to range and order.
- **4.2 holds two dials on two molecules**: γ on BBA's 27 modes and τ on ALDP5's four-mode basin, plus literature and the trained dose-response, in 95 s. **4.4 carries about 25 numbers in 90 s.**
- The evolution's "why" is mostly implicit (ledger strip, end cards). There is the same γ collision (P3 "w and γ", Part 4 "lever γ") and κ = √2 / 1.504 for the torsion phase.

### d3 · Evidence ("Readable")

**Great moments**
- **1.3 the two rulers disagree on real ALDP5 frames**: Euclid calls pair A seven times closer, while the thermal ruler calls B closer, with ρ = 0.50 over 60,000 pairs. Examiners trust real-data demonstrations over toys.
- **2.5 the moving baseline is the most honest version.** It shows best flat 0.167 ± 0.012 beside identity 0.479. r1 §"Superseded": the 4× claim compared wδ with identity·GRW+OU, not with the best flat. It also strikes the superseded 0.180 and puts no-comparison glyphs on cross-sprint pairs.
- **5.2 four charts, one molecule.** One real held-out BBA frame is noised in Cartesian, internal, ordered and wδ coordinates, with four narrated stops:
  - t = 0.0004: a bond length sees one bond sd;
  - t = 0.01: the torsion blur is 1.70°;
  - t = 0.1: 12.96°, and the far end flails;
  - t = 0.3: the arrows still carry the size.

  This is the best scene for "say what depends on coordinates". Its guard, "one draw rescaled, not a diffusion path", is right.
- **3.5 the race, with real histograms** recomputed from the stored 20,000 molecules per checkpoint.
- **6.1 "how to read a result"**, **6.6 the floor moves with the count**, and the provenance strip, effect gauge and no-comparison glyph. This teaches the audience how to audit, which is exactly what examiners do.

**Weaknesses**
- **Major gaps in user-requested topics**:
  - embedding and pullback (no cone, no orange peel, no spring pullback, no lift and project);
  - the straightening hope;
  - training curvature and the pairing theorem (problem 2).
- **Number-dense scenes without derivation.** 4.1 (the warp lens) and 4.2 (the lag dial) are lists of measured values with no picture of the mechanism. This conflicts with "derive results visually" and "add more explanation".
- **Odd emphasis.** Piece 1's climax is the αL uncertainty barcode, an evidence-floor lesson that is peripheral to the noise-order arc and comes before the viewer knows why αL matters.
- **Forward references.** 2.7 (wδ's BBA afterlife: 86× ordered internal, first-order windows, "the barrier that may save" [H]) runs in piece 2, before BBA, ordered internal coordinates, windows and the wall are introduced.
- Piece 6 is a methods piece. It is valuable, but it is mostly dot strips and tables.

### d4 · Interaction ("Hand over the knob")

**Great moments**
- **One handle, two verdicts.** The γ dial is the October fix in P2-S07 (erase everything together) and the November diagnosis in P4-S04 (exactly what erases the order). "The handle stays the same; only the verdict flips." The viewer has physically performed the gesture before it is refuted, which makes this the strongest version of the pivotal correction.
- **Hand-overs that are well-posed questions.** "Find the γ at which the stiffest mode first enters the trained band." "Find the noise where the molecule still knows its size but has lost its bonds" (P4-S02): the viewer discovers the definition of range and order by doing. "Lower the divisor until the bars surface; what does BBA need?" (P3-S09).
- **P3-S09 "Under water".** One number (the divisor, 1.31 → 27.1) sinks the whole row of spring bars below the floor: the diagnosis replayed.
- **P3-S07 the Gaussianization toy.** A live one-dimensional SGD toy where un-Gaussianizing visibly slows learning, plus the honest late cost (flat best at 20k; αL saddle 30 against 4–6 per 10⁴).
- **Symbol hygiene** (§4): κ_H, κ_Σ, κ_res, κ_t, κ_step and κ_train; c_φ = 1.504 for the torsion phase scale; k⊥ for the spring soft scale; γ reserved for the whitening exponent. It is the only proposal that fixes the γ collision present in d1, d2, d3 and d5, and the κ collision g4 §2.2 warns about.
- **Narration names levels ("at t = 0.01"), never "now"**, and the authored hand stays as a dotted ghost while the viewer holds the lens.

**Weaknesses**
- **P2 is dense.** Pitch, the whole wδ era and the whole stiffness theory share 11 scenes and 12.5 min. **P4 is 16 min**, the longest single piece, against the user's "flagged cuts".
- **The ALDP5 γ dial is a display interpolation** (λ^{1−γ} on the nine modes). The October programme compared flat against metric-shaped noise; the continuous γ dial is #1057's, on BBA. It is fine as [D], but it must be labelled, or the "same handle" payoff misstates history.
- The evolution is carried by a verdict board (P3-S10) and the E0 index rather than by the narrative.
- With twenty levers in four videos, each must earn its place; some, such as P5-S04's force-scale c, are better as explorable-only.

### d5 · Visual ("Every chart is a clock")

**Great moments**
- **The warm-to-cool scale ramp on a fixed log-SNR rail**: warm local glyphs to cool global ones, so order reads as a colour gradient and anti-order as reversed colours. With "above the water, into the fog", it gives the programme's core claim a visual grammar the audience can read without narration.
- **"Four honest erasure renderings"** (ghost ensemble, best linear guess, fog opacity, crystallization), with the rule "no pixel blur; every blur is an ensemble of real noise draws". This is exactly "never let differing scales fake a difference".
- **2.3, then 2.7, then 4.2.** The straightening hope (a redrawn deck cartoon, the chord dropped onto the image sheet) comes before the attempt, the debunk after it, and the Gaussianization afterlife later, with ◌ → ◆. It is the right order for motivation.
- **2.5 ★** the odometer at the wall, with 800,000 real ALDP5 frames heaped against it and a phantom bead moving the heap.
- **3.4 ★** an exaggerated cone (30°) shows the mechanism, then the real 5.9°, next to the round blob flat noise makes.
- **4.5 ★ "The chain that collapses".** Three chains have identical, perfect local geometry; under an isotropic base the middle one balls up to half size. "Right locally, wrong collectively" becomes one image, the best in the programme for prior matching.
- **5.4 the (γ, v) pad**, whose corners are "order, no range", "range, no order" and "both". The two-dimensional design space behind "one spectrum, two pulls" becomes a thing you drag.
- **5.7 ★** twelve bridge paths that all end at one molecule, played backward: arrows agree first and the chain settles later. The measured #1133 gauges and the predicted window sit beside them, honestly separated.
- **6.5 ★** mirrored blind spots at the floor: ordered internal coordinates flash rose at contacts, while wδ frays the bonds and keeps the contacts.
- **Continuity.** P3.0 imports Part 1's last frame, and P5.0 morphs Retention 06's curves into lanes. A "short path for a committee" (P5 → P6) is offered.

**Weaknesses**
- **Problem 2 (target scaling and training curvature, the pairing theorem) is absent**, and the Part 1 reconciliation is a ribbon (3.0, 55 s) rather than a derivation.
- **Gold means both attention and the loud block.** That breaks the house rule of one colour, one meaning just where it matters most (P5, where the arrows are the subject and the playhead is the attention).
- **P4 moves between molecules**: BBA (4.0), back to ALDP5 for the warp and lag/Gaussianization (4.1–4.2, 180 s; 4.2 is overloaded), then BBA again.
- **P6 is a grab-bag.** The count-floor lesson (6.7) does not belong in a forces piece.
- The same γ and κ collisions as d1, d2 and d3.

## 5. Grafts for the merged programme (ranked by explanatory value)

1. **d1: the question-led episode frame.** Plus/arrow pairs, question surgery, the List of Musts (M1–M9) and plant-and-payoff threads. This is the spine; see §7.
2. **d4: the γ handle reused**, with **d1's strike-through caption.** Introduce the dial in E2 (October's goal, labelled "display interpolation; the project compared γ = 0 and γ = 1 on ALDP5"). Reuse the same control in E5 on BBA's 27 modes, where it is the diagnosis, and strike E2's caption "the promise" into "range without order".
3. **d2 2.2 and 2.1: one mode, one meter, plus ghosts at the floor**, as the opening of E2, before any multi-mode picture.
4. **d2 2.5: the Part 1 reconciliation** (weight × window, integrated ≈1.5×; equal relative errors cost ½·0.05² in every mode) as E2.2.
5. **d4 §4: symbol hygiene, programme-wide.** κ subscripts, c_φ for the torsion phase scale, k⊥ for the spring soft scale, γ only for the whitening exponent. Charts are named on screen by what they are ("internal coordinates at thermal width", "+ two loud modes"), with "C3" said once as the project's label.
6. **d5: the rail geometry and visual grammar** (log-SNR axis labelled in t, waterline, fog, warm-to-cool ramp, fixed-width ln 16 decision bar, moon-fill glyphs) as the implementation of d1's Erasure Clock. The decision bar shows honestly that the block's order over torsions is partial: their loudness ratio is 3.5, below the 16 needed for separate windows.
7. **d5 2.3: the straightening hope before the attempt**, then d1 E1.8's debunk, then d4 P3-S07 / d5 4.2's Gaussianization payoff, with d1's HOPE → CAME TRUE, DIFFERENTLY stamp.
8. **d3 1.3: the ruler disagreement on real αR frames**, right after the toy in E1.1. The toy gives the intuition; the data show it is not a toy effect.
9. **d5 2.5 ★: the odometer at the wall with the real-frame heap**, as E1's climax (d1's E1.5 ★ is the same idea; d5's rendering is stronger).
10. **d5 3.4 ★: the exaggerated-then-real cone**, plus **d4 P3-S01's noise-site toggle**, as E3's climax.
11. **d2 3.3: the orange peel via the circle deficit**, and **d2 3.4: normal stiffness α/σ** (planted in E3, paid off in E4's "noise leaves the molecule").
12. **d4 P3-S09: the "Under water" divisor lever**, as autopsy (a) in E4.
13. **d5 4.5 ★: the chain that collapses**, as E4's prior-matching scene (Must M5).
14. **d5 4.6 / d3 4.6: Rg² as a sum over distant pairs** (weight heat map; 92% from |i − j| ≥ 11; 153 pairs). It explains why no local fix reaches the size error.
15. **d3 5.2: four charts, one molecule, four narrated stops**, placed in E5 before the Clock lanes are painted. Measurement and picture then come before abstraction.
16. **d4 P4-S02: the hand-over "find the noise where the molecule still knows its size but has lost its bonds"**, with the fix in §6.
17. **d2 4.3 + d5 5.3: exact chain transfer matrices plus the Fog Bench on internal coordinates**, for anti-order: derived exactly, then seen on the molecule.
18. **d2 4.5b: two halos**, as the companion of d1's E5.6 ★ "two loud modes".
19. **d5 5.4: the (γ, v) pad**, after the γ reversal; it shows that range and order are separate dials.
20. **d5 5.7 ★: bridge paths played backward**, with **d1 E5.9's predicted window drawn before the measured R² arrives**.
21. **d2 5.3: the radial volume toy with a dimension lever** (2-D −36%, 3-D −50%) plus #1103's brute-force check, as E6's phantom spring.
22. **d5 6.5 ★: mirrored blind spots**, with **d1's odometer callback** and its stated test, as E6's [H] climax.
23. **d3 6.1 and 6.6: "how to read a result" and the count dial**, opening E6; plus d3's provenance strip and no-comparison glyph programme-wide.
24. **d3 2.5: the moving baseline with best flat 0.167 ± 0.012** and the cross-sprint no-comparison glyphs, as E1.7.
25. **d1 E5.10: "precedent / new"**, extended with an [S] Ahamed 2026 chip on the training-curvature scene and the learned-warp scene, where g3 says it is direct prior art.
26. **d2: calibration lamps and the provenance drawer**, in the explorables. **d4 E1: challenges** ("range: every window ≥ 10 t_min; order: Kendall τ ≥ 0.8; find the only chart that passes both"). **d5: the "short path for a committee"** in the viewing guide.

## 6. Errors and risky claims, with fixes

### 6.1 Cross-cutting (several proposals)

- **Sprint 1's early win is overstated** (d1 P0.2 and E1.7, d2 P.5, d4 P2-S06, d5 2.6). "0.117 ± 0.007 vs 0.479 ± 0.005" is wδ against the identity metric with the same forward process. In the same sprint the best flat arm scored 0.167 ± 0.012, so the lead over the best flat was about 1.4×, not 4× (r1 l. 353; archive sprint1/summary §4). That flat arm also had `vp_mean: true`, so it was plausibly affected by the later bug (inference).

  Fix: show all three, labelled "identity metric, same forward" and "best flat (raw ℝ¹⁸ WG)", as d3 2.5 does.
- **"Mechanisms that predicted the optimal block size"** (d1 E6.9, d3 7.8, d4 P5-S08; d5 6.8 inherits r7 §5.6). The block size was found empirically by the #1069 sweep on 2026-11-13 ("two vectors are the smallest block meeting every global threshold on two seeds"). Note 30 (2026-11-18) explained it afterwards. Only the reverse-path takeover window (0.26–0.1, measured 0.13 in #1133) was predicted before it was measured.

  Fix: "explained why two (after the sweep); predicted when the chain follows the block (before #1133)". Examiners will ask exactly this.
- **Notation collisions** (d1, d2, d3, d5):
  - γ is both the spring soft scale (γ = 30 Å⁻²) and the whitening exponent (γ ∈ [0, 1]);
  - κ is both a stiffness ratio and the torsion phase scale (√2, 1.504).

  Fix: adopt d4's k⊥ / c_φ / subscripted κ everywhere.
- **The same digits with two meanings.** "17.5 vs 11.4" (note 21 §6: likelihood bound of the stiff against the soft mode under flat noise, which gives the ≈1.5×) uses the same digits as note 20's residual stiffness of the internal-coordinate pullback (17.5 / 11.4 / 22.3).

  Fix: state the unit ("in units of ½·0.05²") on screen, and never show the residual-stiffness row in the same piece without its κ_res chip.
- **The criterion before its definition** (d1 E1.9, d3 2.6). The wδ residual-stiffness bars (413 against 192) close the wδ episode, "by the criterion that ended the era". That criterion is note 20's (10-23), the day after Sprint 10 closed, and it is defined only in the next piece.

  Fix: move the card to E2 after "the ruler must turn", phrased "judged by the next question, wδ made ALDP5 stiffer", as d4 P2-S07 does.
- **The ALDP5 learned warp, lag dial and Gaussianization placed inside the BBA piece** (d1 E4.2–4.3, d5 4.1–4.2, d3 4.1–4.2, d2 4.2). This creates a molecule jump.

  Fix: end the ALDP5 episode (E3) with them, as d4 P3-S05–S07 does, so E4 starts and stays on BBA.
- **The AK PCA result stated as fact** (d2 P.2 beat, d4 P2-S03 beat, d5 2.7 badged [M]). "The compression came from the directed data, not the metric" rests on g2's unofficial reader check; the project never ran it.

  Fix: d1's treatment, behind a lens with a "programme check" badge, until an asset script reproduces it and the author accepts it.
- **On-screen jargon** "C1", "C3", "+2 loud", "+8 at loudness 15" (all five). Fix: name lanes by construction; show the project's label once, small.

### 6.2 d1

- **P0.2–P0.3 overload** (about fifteen numbers in 150 s; the full Clock with undefined lane labels). Fix: cut P0 to about 2.5 min: cold open, two papers and one gap, the six questions as text with no numbers, how to watch. The full Clock appears first in E5 and again in the finale.
- **E2.1 has no single-mode warm-up.** Fix: insert d2 2.1 and 2.2 before it.
- **E4.2–4.3 are overloaded and on the wrong molecule.** Fix: move them to the end of E3 as two scenes: (a) the warp lens and lag dial; (b) the 5 November correction with the Gaussianization toy (d4 P3-S07) and the banana.
- **E5.8 holds two ideas.** Fix: split into "information moves, it is not created" and "readable is not learnable".
- **E1.6's one-kick multiplier A(t)** (τ = c²(1 − e^{−B}), n = 5, k = 9, R = 1) is heavy notation for one bug card. Fix: say "the forward and reverse clocks disagreed: a multiplier that must stay positive crossed zero" and put the formula behind a lens.
- **E1.8 shows the hope only after the failure.** Fix: show the deck's valley cartoon as motivation in E1.2 (d5 2.3) and keep E1.8 as the debunk.

### 6.3 d2

- **P.6 era mixing**: the 11-05 Gaussianization result and wδ's BBA afterlife ("86× worse than ordered internal coordinates") in the prologue. Fix: keep the banana as the hope's exact world; move the Gaussianization result to Part 3, after the warp, and wδ's afterlife to Part 5.2.
- **The Era 4 narrative is missing.** Fix: add d1 E4.4–4.7 (the 2×2, the autopsy, prediction ≠ generation, where the swelling is created) and d5 4.5, or adopt the d1 spine where this is E4.
- **4.2 holds two dials on two molecules.** Fix: put the lag dial in Part 3 and leave 4.2 with γ only.
- **4.4 has about 25 numbers in 90 s.** Fix: split into "why two" (mode-length variances against the torsion line; size response) and "the block-size sweep" (K table with channels and constraints).
- **2.1 shows nine meters before 2.2 defines a meter.** Fix: keep 2.1's meters unlabelled, ghosts only, or swap the order.

### 6.4 d3

- **The embedding and pullback approach is missing**, though the user asked for it. Fix: graft d2 3.1–3.4 and d5 3.4.
- **The straightening hope is never shown.** Fix: graft d5 2.3.
- **Training curvature (problem 2) is missing.** Fix: graft d2 2.5a or d1 E2.3.
- **2.7 (wδ's BBA afterlife, first-order windows, the [H] wall card) in piece 2** relies on concepts introduced in pieces 4–7. Fix: move it to piece 7 after "the wall nobody learned".
- **4.3 count dial: "PMF falls from 6.57 to 0.56 between 2,000 and 100,000 molecules".** This is the old #895 PMF definition. The paper-PMF floor of #1138, used in 6.6, is 0.56 at 20,000 and 0.080 at 100,000. Fix: give it a definition chip, and never place both PMF definitions on one count dial.
- **5.5: #1141's "fitted-direction" baseline Rg W1 0.097 / 0.098** differs from the canon 0.117 / 0.091 for ordered internal coordinates at the same 190,350 budget. Fix: state the seeds and decoder (or the joint rebuild) on the stamp, or hold the card until it is reconciled.
- **1.5 climax.** The αL barcode is an evidence-floor lesson. Fix: keep it as a supporting scene in the ALDP5 limits scene (where d1 E3.6 and d5 3.7 put it), and give piece 1 a climax on the main arc.

### 6.5 d4

- **P4-S02 hand-over answer "C3 has none".** With the canon's best-estimator windows (C3 bonds 0.26, Rg 0.27–0.28) there is a 0.26–0.28 sliver. Fix: "C3 has almost none (0.26–0.28)", or define "has a band" as a factor ≥ 2 in t.
- **P2-S08: "bond SNR at t = 0.01 is 0.30–0.46 under every unit convention".** The range is 0.30–0.46 on the manifold route, 0.34–0.52 at the pilot scale and 0.16–0.18 in window mode (g4 §3.6). Fix: "below 1 under every convention (0.16–0.52)".
- **P2-S07: the γ dial on ALDP5 is a display interpolation.** Fix: label it [D] "interpolation for display; the October goal was γ = 1". The P4-S04 payoff then stays historically true.
- **P2-S01 hand-over.** Matching a 4-width stretch with a torsion means moving ψ by about 200°, out of the basin where the harmonic thermal ruler holds. Fix: caveat on screen, or a target of 1–2 widths.
- **P4 is 16 min.** Fix: split "Order" into the range/order instrument (S00–S04) and the loud block (S05–S11), or cut S07, which reappears in other pieces.

### 6.6 d5

- **Problem 2 is absent; the Part 1 reconciliation is a ribbon.** Fix: graft d2 2.5 as a full scene in P3.
- **Gold means both attention and the loud block.** Fix: give the block its own hue (teal, as in d1 and d3) and keep gold for the playhead and the object of attention.
- **P4 molecule jumps.** Fix: move 4.1–4.2 to the end of P3.
- **P6.7 (count floors) sits in the forces piece.** Fix: move it to P5.8 (results) or to a results opener.
- **2.4: the "chord bound" readout** and the geodesic ODE q̈ = P_h(P_h H P_h + ηI)⁻¹P_h f appear unexplained. Fix: one line on screen, "the straight feature-space distance cannot exceed the path length; red means the integrator broke it". Keep the ODE behind a lens.
- **P5.6 holds two ideas** (the seesaw and the KL identity). Fix: split.

## 7. Recommended spine: d1, restructured

**Why d1.**
- The audience's central question is the project's rationality: why each step, why it was left, why the current step is promising. d1 is the only proposal whose unit of structure (a question with an attempt, a measured reason to enter, a measured reason to leave, a Must and the next question) answers that question in every episode.
- Its pieces map one-to-one onto d5's pieces and absorb d2's rigs and d3's results material without reordering the story.
- It keeps the stiffness theory (E2) separate from the embedding era (E3). That gives problem 2 and the Part 1 reconciliation the room that d5's merged piece lacks, and it respects the user's "add scenes, not patch".

**Merged outline** (sources in brackets; ★ = the piece's climax; each piece ≤ 14 min):

- **P0 · Prologue (about 2.5 min).** Cold open: two charts noising one BBA molecule [d1 P0.0 / d3 5.0]. Two papers, one gap [d1 P0.1]. Six questions as text, no numbers [d1 P0.2 pruned]. How to watch, plus a committee path [d5].
- **E1 · Far away, and too close (about 11 min).**
  - toy Euclid with a rigid motion [d5 2.1 / d2 P.1], then real-frame rulers, ρ = 0.50 [d3 1.3];
  - a ruler in percent, Å ↔ nm [d1 E1.2];
  - the straightening hope [d5 2.3];
  - two barriers on the odometer [d1 E1.3];
  - noise without a formula: the log-chart geodesic toy is a straight line in feature space, a plant for E3 [d1 E1.4];
  - ★ the odometer at the wall with the real heap and the phantom bead [d5 2.5];
  - finite is not correct, as bug cards [d1 E1.6 simplified];
  - the moving baseline, including best flat 0.167 [d3 2.5];
  - the famous figure debunk, PCA behind a lens [d1 E1.8];
  - verdict, question surgery, M1–M2 [d1].
- **E2 · The noise has the wrong ruler (about 11 min).**
  - ghosts at the floor [d2 2.1];
  - one mode, one meter [d2 2.2];
  - nine rulers on the rail, with the γ handle introduced as a display interpolation [d1 E2.1 / d2 2.3 / d4 P2-S07 / d5 rail];
  - below the floor (Tweedie) [d2 2.4];
  - one wrong ruler, seen from both sides [d2 2.5 + d1 E2.2];
  - the training valley, with an Ahamed [S] chip [d1 E2.3];
  - the blur dial; its handle returns in E6 [d2 2.6];
  - the ruler must turn, with the wδ 413 card placed here [d2 2.7 / d4 P2-S09];
  - ★ the promise, with its "?" pin [d1 E2.6].
- **E3 · Lift, noise, project (about 12 min).**
  - springs are a pullback [d2 3.1];
  - ★ the cone, exaggerated then real, with the noise-site toggle [d5 3.4 + d4 P3-S01];
  - normal stiffness α/σ (a plant) [d2 3.4];
  - the orange peel deficit [d2 3.3];
  - the race with real histograms [d3 3.5];
  - one model, two uses [d1 E3.5 / d2 3.5];
  - honest limits, with the αL barcode and canon error bars [d1 E3.6 + d3 1.5];
  - the warp lens and lag dial [d1 E4.2 / d4 P3-S05–S06];
  - the 5 November correction: the Gaussianization toy and the banana, HOPE → CAME TRUE, DIFFERENTLY [d4 P3-S07 + d5 4.2 + d1 E4.3];
  - verdict, with the footnote "ALDP5 cannot test order".
- **E4 · Every map got one half right (about 10 min).**
  - meet BBA [d3 1.6 / d5 4.0];
  - ★ the 2×2 [d1 E4.4];
  - autopsy: under water (lever) [d4 P3-S09], noise leaves the molecule (payoff of α/σ), the chain that collapses [d5 4.5], Cartesian cannot read distances;
  - size is a sum over distant pairs [d5 4.6 / d3 4.6];
  - the fold dissolves with the detail [d1 E4.7];
  - prediction ≠ generation [d5 4.7 / d1 E4.6];
  - verdict, as the "?" pin blinks.
- **E5 · Range and order (about 14 min; split in two if review says so).**
  - what the noisy molecule still knows, then destroyed forward = decided backward [d1 E5.1–5.2];
  - four charts, one molecule [d3 5.2];
  - the Clock painted after its numbers [d1 E5.3 on d5's rail, with d3's "same word, four windows" card];
  - the hand-over "size known, bonds lost" [d4 P4-S02];
  - the γ handle reversed, with the struck caption [d4 P4-S04 + d1 E5.4], then the (γ, v) pad [d5 5.4];
  - anti-order: the lever arm, exact chain and Fog Bench [d1 E5.5 + d2 4.3 + d5 5.3];
  - ★ two loud modes plus two halos [d1 E5.6 + d2 4.5b];
  - who corrects whom [d2 4.5a / d4 P4-S06];
  - why two, phrased as explained after the sweep [d4 P4-S08];
  - information moves [d2 4.6];
  - readable is not learnable [d5 5.9];
  - two arrows decide the fold, with the prediction landing [d5 5.7 + d1 E5.9];
  - one spectrum, two pulls, then precedent / new [d1 E5.10].
- **E6 · What the block cannot supply (about 12 min).**
  - how to read a result [d3 6.1];
  - both scales at once [d1 E6.1 / d3 6.3];
  - ten times more training [d1 E6.2];
  - a score needs its count [d3 6.6];
  - the phantom spring [d2 5.3];
  - blur versus wall, on the same handle as E2 [d1 E6.4];
  - ★ two charts, two blind spots [H] [d5 6.5 + d1 E6.5];
  - use the six discarded numbers [d2 5.4 + d1 E6.6];
  - the drift [d3 7.5];
  - the handedness detective [d1 E6.8];
  - the Ledger, with Musts ticked and the corrected optimism wording [d1 E6.9].
- **Explorables.** The Erasure Clock with challenges [d1 X1 + d4 E1 + d5 X1]. The Bench with calibration lamps [d2]. The Logbook / Ledger with a compare guard [d1 X2 + d3 L].

**Cut candidates if the total (about 72 min) feels long:**
- E1's bug cards (keep one);
- E3's one-model-two-uses (E6 returns to forces);
- E6's handedness detective (keep the one-line conclusion in the Ledger).
