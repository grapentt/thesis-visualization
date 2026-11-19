# Verifier: honesty · synthesis.md ("Where to Add the Noise")

Reviewer: honesty verifier, 2026-11-19. Scope: the visual metaphors, beats, verdict stamps, Musts, captions and
comparisons of `design/synthesis.md`. I checked them against the brief, the understand reports (critic, g1, g2,
g3, g4, r6, r7, r8) and the primary sources in `SP/rg-main`. Read-only except for this file.

## Verdict

The synthesis is unusually careful. It already fixes every error the fidelity judge listed (§8.3): budget chips,
no κ arrows across definitions, struck Cramér–Rao bars, the seed-2 miss of the registered criterion, ties drawn as
ties, [D·model] for toys, the 10% validity at 100 updates, and the "explained, not predicted" wording for why two
vectors. What remains is subtler. Five things could still mislead a careful viewer, and an examiner most of all.

1. **The cold open.** P0.1 is the committee path's first image, and it is a scale artifact. It shows no numbers.
   In internal coordinates a bond is erased at t ≈ 0.26 yet still looks crisp at 0.5. So "two opposite orders"
   tells the viewer the opposite of the programme's thesis.
2. **The Erasure Clock.** Applied consistently, its own rules do not give its verdicts. The mnemonic says range
   means "right of the waterline". With Cartesian's real waterline at t = 10⁻⁵, Cartesian bonds count as in range.
   Meanwhile the ordered lane's own first-order glyphs put end-to-end and long-range distances before the
   torsions. Run literally, X1's challenges would crown Cartesian and the eight-vector chart, not the chosen design.
3. **The List of Musts is a self-made rubric.** Four of its nine requirements are hypotheses (range, order,
   "a coordinate of its own", "the wall must be supplied"). The current design's own failures never become Musts,
   which breaks the programme's own rule that "every failure adds a requirement".
4. **The E5.6 climax.** It is also a talk clip. One gesture moves a first-order lane and the trained dot together,
   which implies that order is the mechanism. The test that separates order from the constraint effect (#1137)
   has not run. The morph also starts ≈ 65–70 px further left than the lane the viewer just saw.
5. **The ScoreMD comparison.** The "≈ 0.02 at the paper's count" [H] extrapolation is applied only to the best
   models and is placed beside the paper's 0.034. Applied the same way to "native ScoreMD" (a 10%-budget re-run),
   it gives ≈ 0.13–0.24: the baseline is far weaker than the published model.

Most of the other issues are scoping fixes. Each is one caption or one badge: a fitted correction behind "carried
by the torsions", one seed behind a dose–response curve, < 1 Å clashes set against < 3.5 Å overlaps, an orange
peel shown without its own note's caveat, and a seesaw whose tilt inverts the lesson.

The MVP (E2.3, E2.9, E5.3, E5.4, E5.6) contains H2, H3, H4 and M5. Fix those before phase 2, or the flipped-handle
probe will lock the grammar in with them.

## Method

- I read synthesis.md in full, plus the brief, the critic, j-fidelity, g4 and r6 in full, and the relevant parts
  of r7, g1, g2 and g3.
- Primary sources opened:
  - theory notes 22 (summary, §5.4, §6), 27 (§1, §5, §7) and 30 (§9, §10);
  - lab entries `2026-11-18-range-order-mechanisms`, `2026-11-18-loud-mode-handedness` and
    `2026-11-18-loud-mode-transfer-checks`;
  - `docs/investigations/bba-range-and-order.md` (Tables 2–3, §5, driver §5), `bba-c3-local-accuracy-screening.md`
    (§1, §3, §4), `docs/sprints/sprint12/real-budget-study.md` (results and effect table) and
    `docs/sprints/sprint7/summary.md` (cost benchmark).
- I recomputed (inline Python, no files) the following on the house VP schedule, the rail map and 17 px/Å:
  - bond noise and readability on the decoded internal chart;
  - Cartesian bond noise at t = 0.01;
  - rail positions and morph distances;
  - readability at t = 0.01 for three first-order windows;
  - the loud-mode readability at t = 0.5;
  - the share of training draws in each low-noise band.

## Findings (most severe first)

### High

**H1 · P0.1 cold open: "sticks stay crisp" is a pixel-scale artifact, and "two opposite orders" contradicts the
thesis.**
- *Issue.* The right panel uses plug-in decodes in Å at 17 px/Å.
  - A BBA Cα bond's thermal spread is 0.057 Å. In the internal chart the noise is scaled to that spread, so a bond
    decodes with noise of about 0.057·σ/α Å: 0.057 Å (≈ 1 px) at t = 0.26, where R = 0.50, and 0.19 Å (3 px) at
    t = 0.5, where R = 0.08.
  - The sticks therefore look crisp while 50–92% of the bond's information is gone. Crispness here is guaranteed by
    the chart's units, not by retained information.
  - In information terms the ordered chart erases bonds (0.26) together with the chain's shape (0.24–0.29). Only the
    two arrows outlast them (a₁ to 0.52, a₂ to 0.44).
  - The contrast with Cartesian is therefore "the same coarse-last order, with the fine detail given a window inside
    training", not "opposite orders". The right panel's decoded chain is C3's (the decoder ignores the block), and
    its visible flailing is C3's anti-order. A viewer takes away "the ordered chart erases the chain first and keeps
    bonds last", the opposite of E5.
  - The scene has no numbers by design and sits on the committee path, so nothing corrects the impression. The
    Cartesian panel is directionally right but also lags: its bonds are half erased at t = 0.0004 (1 px of noise)
    and only visibly fray near 0.01 (0.40 Å, 7 px).
- *Fix.* Drop "two opposite orders". Climax caption: "the same order, different range". Encode readability, not
  pixels: give each stick and arrow an opacity or moon fill equal to its R_h(t), from R2, R19 and A12. Add the
  caption once: "a crisp stick is not a remembered bond". Apply the same rule to E5.2's Å readouts: bond RMSE needs
  its comparison target, the 0.057 Å thermal width.
- *Source.* synthesis l.332–338, §3.10; r6 §2.8 (bond spread 0.057 Å); lab 2026-11-18-range-order-mechanisms
  first-order table; recomputed.

**H2 · The rail's range rule makes Cartesian bonds "in range", contradicting "order without range" (§3.3 mnemonic,
E5.3 label, T4, Must M3, X1 challenge).**
- *Issue.* §3.3 sets each lane's waterline at its own t_min: 10⁻⁵ for the Cartesian family, x = 140. The mnemonic
  says "range = every glyph right of the waterline". The Cartesian bond glyph sits at t = 4×10⁻⁴ (x = 406), 266 px
  to the right, so by the rail's own rule Cartesian has range. E5.3 labels it "order without range".
  - Note 27 reaches "no range" only because it assumes "Training used t ∈ [0.01, 1]" for every chart. The Sprint 12
    Cartesian models actually train from 10⁻⁵ (r6 §2.1; g4 §7 item 7).
  - What Cartesian really lacks is training share. Its bond window holds 0.039% of uniform draws, while the log-SNR
    axis gives 10⁻⁵ to 0.01 40% of the rail width for 1% of the draws.
  - The same slip breaks T4 ("every chart has a blind spot at its trained floor"): Cartesian's bonds are not blind
    at 10⁻⁵.
  - X1's challenge "range: every window ≥ 10 t_min" is passed by Cartesian at its own floor (0.0004 ≥ 10⁻⁴). On the
    lab's first-order table Cartesian also passes "order: Kendall τ ≥ 0.8" (τ ≈ 0.9, one swap). "Find the only
    chart that passes both" therefore returns Cartesian.
- *Fix.* Define range operationally, once, and use it everywhere (rail, lanes, M3, X1): "a window that holds a
  usable share of training draws (and loss weight)". Draw the share on the sparkline under the waterline, and
  change the mnemonic to "inside the band and inside the training". Say the alternative aloud, "against the
  internal floor of 0.01", whenever 0.01 is the reference. Rewrite T4 as "every chart has a feature it trains
  almost never". Re-test X1's challenges against every lane before shipping.
- *Source.* synthesis l.214–225, l.732–745, l.76, l.106, l.951–958; note 27 §5 header and §7 table; recomputed
  rail positions and shares.

**H3 · The ordered lane is labelled "range and order", but its own first-order glyphs still erase chain geometry
before the torsions.**
- *Issue.* The E5.3 label uses "anti-order: end-to-end 0.18 < torsions 0.35" to condemn C3. The ordered lane
  carries first-order values from the same lab table: end-to-end 0.24, distances ≥ 11 apart 0.29, 7–10 apart 0.27
  and 3 apart 0.31, all before torsions at 0.34. Only Rg (0.44) and the mode lengths are erased last.
  - The same criterion therefore marks the ordered lane anti-ordered for every chain distance. On the warm-to-cool
    ramp the lane will not show a gradient, against its own label.
  - The measured block-alone lower bounds soften this (long-range ≥ 0.37 against torsions 0.35; contacts ≥ 0.33).
    No measured end-to-end window exists for the ordered chart.
  - X1's Kendall-τ order challenge fails the chosen two-vector chart (τ ≈ 0 over the lab table's seven features
    ranked fine → coarse). It passes "+8 at loudness 15" (τ ≈ 0.9), the block size the training sweep rejected for
    its local cost.
- *Fix.* Label the lane "range, and order for size". Narrate once that the two vectors give order to size and the
  mode lengths only, and that chain distances stay in the band (first order 0.24–0.31; measured long-range
  ≥ 0.37). Compute the ordered chart's measured end-to-end and long-range windows with the A17b estimator before
  claiming more. Make the X1 challenge criterion feature-explicit, and let it show honestly that the chart with the
  best clock is not the chart that trains best ("readable ≠ learnable").
- *Source.* synthesis E5.3 numbers and labels; lab 2026-11-18-range-order-mechanisms table (l.66–75); r6 §4.3
  block-alone floors.

**H4 · E5.6 ★ (also a talk clip): one gesture binds a first-order lane morph to a trained result, implying order is
the cause, and the morph starts from a different estimator.**
- *Issue.* "The gesture block none → +2 loud: the internal lane morphs into the ordered lane and the plane's dot
  enters the empty corner."
  - The viewer reads cause and effect: the order was restored, so size was fixed. Which mechanism does the work is
    untested. Order (size decided early) and the constraint split (the internal block corrected towards the block)
    are confounded. #1137 exists to separate them ("declared 11-18, not run"; note 30 §9 prediction 1 open; r6 §5).
  - The morph uses C3's first-order Rg window (0.19). E5.3 has just painted C3's Rg glyph at the measured
    0.27–0.28. The lane must jump left before it morphs, and the morph spans 186 px instead of the 118 px that the
    measured start (0.275 → 0.44) gives: 58% more visual change.
  - E5.6 is a designated talk clip, so it will be seen without E5.7's [H] pill.
- *Fix.* Start the morph from the lane as E5.3 painted it, or switch estimators visibly with a chip. Split the
  gesture: the lane morphs [D], then a beat, then the dot moves [M]. Add an on-screen line in the clip itself:
  "order or correction? #1137 separates them (declared, not run)". Give the clip its own NEW · UNTESTED MECHANISM
  stamp.
- *Source.* synthesis l.776–790 and §2.2 (talk clips); note 30 §9; r6 §5 "Which of (i) and (ii) dominates is exactly
  what #1137 is designed to separate"; recomputed rail distances.

**H5 · The List of Musts presents hypotheses as requirements and leaves out the current design's failures.**
- *Issue.* The pitch says "every failure adds a requirement to a List of Musts that the finale ticks honestly".
  - Four Musts are working hypotheses, not established requirements:
    - M3 (range) and M6 (order) come from note 27 §7, "Design reading: range and order [H]";
    - M7 ("needs a coordinate of its own") is a lesson from one refuted map;
    - M9 ("excluded volume supplied, not learned") is note 30's prediction 4, open and [H] in the synthesis's own
      §8.2.
  - The rule is applied only to past approaches. The current design's failures never become Musts: compaction
    drift (E6.5), the mid-size handedness deficit (E6.9), no learned wall, untested transfer, and unestablished
    equilibrium populations. They go to a separate "Not established" card.
  - The finale then shows nine ticks, one qualified. A checklist written as the design was formed and scored on that
    design is not independent evidence, and the tick column reads as if it were.
- *Fix.* Badge each Must ([H] for M3, M6, M7 and M9). Apply the rule to the present: add M10 "a force field that
  holds size beyond 100 ps" (✗, #1130), M11 "global handedness in every size bin" (partial), M12 "transfer" (?) and
  M13 "equilibrium populations" (?). Caption the column once: "requirements we wrote as we went; the design was
  built to meet them".
- *Source.* synthesis l.25–27, l.99–111, l.936–947, §8.2; note 27 §7; note 30 §9.

**H6 · E6.3, E6.2 and E6.10: the "≈ 0.02 at the paper's count" [H] is applied only to the best models, beside the
paper's 0.034. The same inference exposes "native ScoreMD" as a much weaker baseline than the published model.**
- *Issue.* #1138's inference is that a model's excess over the floor stays constant with count.
  - Applied to ordered (0.097 − 0.080) and the covariance base, it gives ≈ 0.022–0.023. Shown beside the paper's
    0.034, that invites "we beat the ScoreMD paper", a cross-protocol ranking nobody measured.
  - The same arithmetic on native ScoreMD at 190,350 updates (0.202/0.315) gives ≈ 0.13/0.24 at the paper's count,
    4–7× worse than the paper's own Diffusion arm. The baseline labelled "native ScoreMD" is a 10%-budget re-run
    that is still improving: the 790,350 interim panel has excess 0.078 at 20k molecules (g1 l.371).
  - Headline ratios against it ("bonds ×119, angles ×8.5, populations ×2.0") are measured against an under-trained
    baseline. The thesis was pitched against ScoreMD.
- *Fix.* Either drop "≈ 0.02", or apply the inference to every model on the dial, native ScoreMD included, as
  dashed [H] points. On screen call the baseline "ScoreMD recipe, our re-run at 10% budget". Add its budget
  trajectory (190,350, then 790,350 interim) to E6.2's lens. Add "comparison with a converged ScoreMD" to Not
  established.
- *Source.* synthesis l.865–872, l.852–863, l.936–947; g1 l.301, 307 and 371 (#1138 wording, 790,350 interim); r7
  §1.12.

### Medium

**M1 · E6.2 budget lens shows only the ordered model and C3. The 10% registered budget favours the model that
learns fast.**
- *Issue.* The lens shows ordered ≈ 0.11 Å and C3 ≈ 0.45 at every stop, the "block changes where training ends"
  story. It omits the competitors' trajectories.
  - From 50k to 190k updates, Cartesian + distances improved bonds 0.0125/0.0133 → 0.0078/0.0093 Å and angles
    2.38/2.19 → 1.58/1.49°.
  - On size it moved from "matches Cartesian on every global measure" (#1069) to "narrowly behind on size and
    contacts" (#1088). r6 §7: "the Cartesian model keeps improving with training; the candidate's size does not."
  - ScoreMD improves too (H6). Full-schedule Cartesian, whitening and ScoreMD panels are pending (#1104), and the
    learning rate is at 97.6% of peak at 10%.
- *Fix.* Put the Cartesian family's and ScoreMD's budget points on the same lens. Caption: "the ordered model has
  converged; the Cartesian models are still improving; full-schedule baselines pending". Add "full-schedule
  baselines" to Not established.
- *Source.* r6 §4.4 main table, §4.6, §7 ("50k matches … 190k narrowly behind"); g4 §3.13, §4.6.

**M2 · E6.6 beat and Must M9: "the wall must be supplied" is stated as fact, though the programme itself lists it as
[H].**
- *Issue.* What is shown is that a 50k-update continuation at t_min = 0.003 did not create a wall (#1101), together
  with a first-order blur argument. Note 30 §9 lists "more range for contacts alone will not remove overlaps without
  a supplied wall" as open prediction 4. The synthesis's §8.2 tags it [H], yet E6.6's beat and M9 state it as a
  requirement.
- *Fix.* Beat: "no trained level has produced a wall so far (#1101) [M]; theory predicts more range alone will not
  [H, open]; for now we supply it". Badge M9 [H].
- *Source.* synthesis l.894–902, l.111, §8.2; note 30 §9; r7 §1.6.

**M3 · E5.5 coda: "moving only the 25 torsions takes C3's Rg W1 0.48/0.46 → 0.05/0.12 Å" omits that the size is
enforced by a correction fitted to data.**
- *Issue.* #1073's torsion-only arm differs from #1065's recipe "only in the equilibration step". It runs MALA
  "under the model's density plus a fitted 34-number packing correction". That correction is fitted by iterative
  Boltzmann inversion against noised data at t = 0.05.
  - The model's own density does not fix size: plain Metropolis equilibration at t ≈ 0.05 is "refuted as a fix"
    (real molecules drift −0.41 Å).
  - Seed 1 also fails its rule and does not improve from 2,000 to 3,000 steps.
  - "Global structure is carried by the torsions" stays true as a statement about degrees of freedom. As shown,
    though, it reads as the learned model's achievement.
- *Fix.* Caption: "torsions only, under the model plus a 34-term correction fitted to noised data; seed 1 misses
  its rule". Badge "repair, fitted".
- *Source.* bba-c3-local-accuracy-screening.md §1 (l.67–70), §3 (l.94–104); bba-range-and-order.md l.262–270 and
  l.788–799.

**M4 · "A prediction that landed" (§1.6, E5.11, E6.10 reason 2) overstates a coarse, descriptive reading.**
- *Issue.* The rule was fixed in advance: "matched" if R² ≥ 0.5 is first reached at t = 0.26, 0.2 or 0.13, that
  is, three of the eight listed levels.
  - The lab card itself calls the test "secondary, descriptive" and says "The 0.5 threshold is a declared reading,
    not a test". It also says R² at high noise "partly reflects" the posterior-mean construction.
  - The agreement builds gradually (0.37–0.44 between t = 0.35 and 0.2), so there is no sharp takeover to predict.
  - The programme leans on this as its one landed prediction.
- *Fix.* Say "a declared window (0.26–0.1) that the measured crossing (0.13) fell inside; coarse, 3 of 8 levels; the
  lab calls it a reading, not a test". Draw the whole gradual R² curve, not only the crossing. Remove "a prediction
  that landed" from the dramatic-shape line, or qualify it.
- *Source.* lab/2026-11-18-loud-mode-handedness README l.8–11, l.127–129, l.165, l.226–229.

**M5 · E5.4: the ALDP5 "promise" is struck with a BBA diagnosis, and the γ dose–response rests on one seed per γ.**
- *Issue.*
  - (a) E2.9's ★ image is ALDP5's nine principal modes. E5.4 strikes it and recaptions it "range without order".
    But E3.10 says "ALDP5 … cannot test order", and on ALDP5 the stiff-mode promise held: bonds ≈ 100× sooner and
    one force level serving all modes. The strike reads as "synchronizing was wrong on ALDP5".
  - (b) The trained dots are single seeds (except γ = 1). The intermediate steps (0.187 → 0.120 → 0.081 Å, gaps
    0.067 and 0.039) are smaller than seed differences seen in these pilots: 0.09 Å for 8 vectors, 0.03 Å for 4
    vectors (Table 3), 0.036 Å for Cartesian + distances. Only the end points are an effect by the project's own
    rule. Note 27 §7 adds that the windows "understated the differences".
- *Fix.* (a) Recaption "on BBA: range without order; ALDP5 cannot test order, and its stiff modes kept the gain".
  (b) Add a seed-spread yardstick (whiskers from the two-seed rows) to the dose–response panel, with the caption
  "one seed each; end points differ by the effect rule".
- *Source.* synthesis l.521–528, l.637–639, l.747–761; bba-range-and-order.md Tables 2–3 (l.93–120); note 27 §7.

**M6 · E6.7 [H]: the evidence mixes thresholds, uses reader-derived counts, and draws a symmetric "mirror" at a
level where both blind spots are partial.**
- *Issue.*
  - wδ's "0% clashes" is the severe-clash metric (< 1 Å; real-budget-study l.265–266). The ordered model's
    "12–20%" in E6.6 is the overlap metric (< 3.5 Å). Its own clash rate is 0.60/0.66%. No wδ overlap share is
    reported at the registered budget.
  - Of the "severe collisions per 10⁵" (wδ 0, internal 1,186), only Cartesian's 682 is primary. The rest come from
    reader dossiers (j-fidelity #41) and need †.
  - At t = 0.01 the first-order readability of the two "blind" features is comparable: wδ bonds R ≈ 0.63, ordered
    closest contact R ≈ 0.81 (internal-only decode 0.60). "Mirror images" overstates the symmetry.
  - wδ's bond noise at t = 0.01 is ≈ 0.05 Å, under 1 px at 17 px/Å. "Frayed sticks" needs a magnifier, applied to
    both panels and labelled.
- *Fix.* Use one metric per comparison (clash with clash; overlaps only where measured). Add † to the reader
  counts. Give both panels moon fills from R at the playhead. Add a "×N thermal width" lens shared by both panels.
  Replace "mirror images" with "different weak features near the floor".
- *Source.* synthesis l.904–914, l.894–902; real-budget-study.md l.265–310; j-fidelity check 41; recomputed R.

**M7 · E3.3 "You cannot flatten an orange peel": the image overstates the practical obstruction and drops note 22's
own caveat.**
- *Issue.* Note 22 says a flat chart is accurate to 1–8% within a basin, with a smallest possible error of
  0.2–1.5%, and 3–20% over the torsion landscape [H]. Of that it says "may or may not matter for learning and should
  be tested rather than assumed".
  - The beat "don't flatten, embed" turns a theorem with a small measured consequence into a design imperative.
  - A peel pressed flat, the classic tearing image, shows order-one distortion. That regime is only "covering every
    bond orientation".
  - The peel's positive curvature is the Gauss–Newton spring cone only. The true one-bond Hessian has
    𝒦_tan = −0.684 (a saddle, 23× larger), and the spring shape-space curvature is negative in some planes.
  - E3.2 shows "exaggerated, then the real 5.9°". E3.3 has no such step.
- *Fix.* Show the cap at its real size, θ ≈ 0.17 rad per thermal width with a deficit of about 0.5%, after the
  exaggerated peel. Narrate the 1–8% / 0.2–1.5% scale and note 22's "should be tested rather than assumed". Keep the
  beat as a principle: "flat can't be exact; within a basin the cost is small; embeddings are exact". Add one line:
  "the true Hessian curves the other way".
- *Source.* note 22 l.20–50, §5.4 (l.544–567), §6 item 1 (l.645–651), Prop. 5 (−0.684).

**M8 · E6.10 reason 5: "the loud directions are Rouse modes and need no trajectory" is not evidence of transfer.**
- *Issue.* #1129's own card says "BBA was seen while drafting #1124", so BBA is description, not test. The only
  out-of-sample protein, Chignolin, used ScoreMD's generated dummy frames, which the synthesis excludes elsewhere.
  - The same card adds: "the other fitted parts still need data": the scale c₀ (⟨Rg²⟩) and the internal whitening.
  - #1141 (unreviewed) finds Rouse directions give a more compact force field (0.35/0.32 vs 0.26/0.22 Å).
- *Fix.* Reword reason 5 as: "on BBA the fitted directions coincide with Rouse modes (seen while drafting); scale
  and whitening still need target data; Rouse directions cost force-field size (#1141, unreviewed)". Or move it to
  Not established, under transfer.
- *Source.* lab/2026-11-18-loud-mode-transfer-checks README (hypothesis field; "The other fitted parts still need
  data"); r8/critic on the Chignolin dummy data; synthesis E5.6 #1141 chip.

**M9 · E5.7: the seesaw tilts towards the wrong block, and half the beat is a hypothesis.**
- *Issue.*
  - `drawBalance` is "a beam tilting by b − a" (a3). With pans carrying the correction shares L²/(1+L²) = 0.94 and
    1/(1+L²) = 0.06, the internal block's pan is heavy and goes down. The image says the quiet block dominates, or
    "wins". d4 even scripts the lever as "tilt the seesaw (why the loud block wins)".
  - Shares of correction are not weights. The right mechanical analogue is a lever balanced at its centre of mass
    (masses 1 and L²), where the light end swings further.
  - "Order acts through who gets corrected" is listed under Hypotheses in r6 §5, but the beat states it as fact.
- *Fix.* Drop the balance and draw the two projections of n as bars labelled "share of predictable noise this block
  must correct". If a mechanical image is kept, use the centre-of-mass lever. Beat: "the louder block leaves the
  correction to the quieter one [D]; whether that, or order, fixes size is #1137 [H]".
- *Source.* synthesis l.792–800; a3 §drawBalance; d4 l.324; r6 §5 Hypotheses.

**M10 · E2.7: ScoreMD's seesaw (pivot = read-out level) misrepresents ScoreMD on BBA.**
- *Issue.*
  - On ALDP the seesaw holds: Diffusion has sharp bonds and fails the landscape (sim 1.047), while Two For One is
    stable but has a C–N bond 23.5× worse.
  - On BBA both pivot positions fail the landscape: Diffusion's sim PMF is 5.387 and Two For One at t = 0.005 gives
    1.624. ScoreMD's resolution there is not a read-out level. It is a differently trained model (FP + MoE "Both":
    sim 0.254 at an iid cost, 0.034 → 0.234).
  - A pivot dial that also carries "Both" implies a balance point that BBA's data deny, and it hides ScoreMD's own
    fix.
  - "Read early breaks the landscape" is the project's reading of the paper, not the paper's.
- *Fix.* Draw the seesaw for ALDP only. For BBA show the two failed pivots and Both as a separate counterweight
  ("FP + MoE: simulation repaired, iid ×7 worse"). Badge the explanation [H, our reading]. Recall that the
  single-level answer works on ALDP5 and drifts on BBA.
- *Source.* g1 l.301–309 (Tables 1, 11, 12, 15), l.375–378.

**M11 · E6.9 beat: "the residual is the relative twist of the two halves, which two vectors cannot carry"
misattributes the deficit.**
- *Issue.* The 9.5–11 Å deficit (0.04–0.06) appears in every internal-coordinate model, C3 included, which has no
  vectors at all. Cartesian shows only 0.015. So it is a property of the internal block (internal coordinates carry
  that twist "only at high order", #1140), not of the two-vector limit. The torsions do carry handedness for compact
  molecules. "Is the relative twist" is also 61%/59% reproduced by one overlapping matching, not the whole residual.
- *Fix.* Beat: "every internal-coordinate model, C3 included, under-learns the relative twist of the two halves
  (61%/59% reproduced by a quarter-chain dihedral); internal coordinates carry it only at high order, and two
  vectors carry no handedness at all".
- *Source.* lab/2026-11-18-loud-mode-handedness Result; r7 §1.11 (#1140).

### Low

**L1 · Verdict stamp "STIFF MODES FIXED" (§1.1 Q3, E3.10).** It contradicts E3.7's "Faster, not better" and E3.5's
guard "flat catches up with long training". *Fix:* "STIFF MODES: ≈ 100× SOONER; ONE FORCE LEVEL SERVES ALL (ALDP5)".

**L2 · "Size near Cartesian" (E6.10 reason 1, X3 Q6); E6.2 omits effect-rule losses.**
- *Issue.* By the effect rule the ordered model loses on size and contacts to Cartesian + distances (0.104 vs
  0.074), to the covariance base, and to wδ (0.104 vs 0.067, wδ the best of 22). E6.2 states only the Cartesian
  size loss.
- *Fix.* "Behind Cartesian and wδ on size and contacts by the rule (0.104 vs 0.067–0.075 Å)"; list every
  effect-table row.
- *Source.* real-budget-study effect table.

**L3 · E4.7 "~30 loss and target changes, none improving generation".**
- *Issue.* The source says "none … on both ALDP5 and BBA", screened at 10k updates. Sensitivity weighting cut BBA
  size error 15–23% but raised collisions.
- *Fix.* Scope the claim to "on both systems, 10k-update screens".

**L4 · E6.4 "three quarters of the compaction was one formula".** It is 0.98 → 0.24 Å of the 100 ps size error on
one seed with 512 paths, and the corrected fields keep compacting to 300 ps. *Fix:* "three quarters of the 100 ps
size error (seed 3)".

**L5 · E1.5 cost "≈ 340× / ≈ 600×".**
- *Issue.* The ratio compares flat's warm steady state (0.74 s) with the manifold arms' cold per-sample cost at
  N = 3 (flat cold: 3.9 s/sample).
- *Fix.* Print the basis, "warm flat vs compile-amortized cold manifold, N = 3".
- *Source.* sprint7/summary l.130–138.

**L6 · E1.9 question surgery strikes "puts unphysical shapes far away" as "refuted".** The property was not refuted
(E6.7 revives it); its sufficiency as a diffusion geometry was. *Fix:* render it as "not the question", not as
refuted.

**L7 · E1.6: the heap "piles against a wall" on a log axis.** The wall (λ_min → 0) lies at −∞, so any drawn wall
position is arbitrary. *Fix:* draw the wall as an off-axis arrow, and print the wδ odometer value of the heap's
median and worst frame.

**L8 · E6.1 "how to read a result": Rg W1 alone is a weak size readout.**
- *Issue.*
  - The untrained internal model already scores ≈ 0.55 Å through self-overlaps.
  - Residual errors sit in the width of the size distribution and in the contact map (#1128).
  - Errors are measured against the training pool, and held-out frames are near-duplicates in time (r6 §7), so the
    0.006 Å floor is optimistic.
- *Fix.* Add these three facts to the card.

**L9 · E5.8: the narration names only n_v = 0, 2, 27.** The bars show 1–8 tied, but sparse narration makes 2 sound
like a sharp optimum. *Fix:* narrate the tie ("one to eight tie on size; two is the smallest meeting every
threshold on two seeds; local cost grows from four").

**L10 · E5.11 "the arrows agree by t ≈ 0.5".** At t = 0.5 mode 1 is ≈ 56% decided and mode 2 ≈ 34%. *Fix:* "half
decided by 0.5".

**L11 · E6.10 reason 4: "training-free repairs".** The wall + size term is a 27-coefficient fit against simulations,
and the size term exists to cancel a swelling ("two errors that cancel" [H]). *Fix:* "no retraining; one
parameter-light rebuild (core 3.6 Å) and one fitted correction (27 coefficients)".

**L12 · Two-halves plane (E4.2 → E5.6 → E6.2).**
- *Issue.* The gold "both right" corner has no stated boundary, so "the dot enters the corner" depends on where it
  is drawn. Log axes compress the ordered model's 40% size deficit while stretching the bond ratio. The thread also
  switches x from bond W1 (E4.2, E5.6) to angle W1 (E6.2).
- *Fix.* Fix the boundary in advance: the registered Rg ≤ 0.11 Å, so seed 2 visibly misses. Add bond W1 in thermal
  widths (Cartesian + distances ≈ 0.15 widths, ordered ≈ 0.006). Keep one x-axis per thread, or announce the
  switch.

**L13 · Rail rendering details.**
- *Issue.*
  - At a glyph's own t½ the fog alpha equals λ/(1+λ), so Cartesian bonds are erased in invisible fog. "Into the
    fog" misleads unless this is said once.
  - Glyphs with only a measured t½ "snap" from full to empty. That hides the gradual factor-16 decision window and
    the fact that measured t½ values are lower bounds.
- *Fix.* Narrate the fog rule once. For snap glyphs, draw the decision-window ramp (labelled "assumed Gaussian
  shape") with a "≥" extension to the right.

**L14 · X3 Q1 "→ tied with the strongest flat baseline once fixed" [S talk] is generous to wδ.** After the vp_mean
fix, flat reached 0.1012 (head-to-head), the summary table gives wδ 0.1664, and ScoreMD-native reached 0.0151 near
the 0.0114 floor. *Fix:* keep the quote [S], and put the measured within-campaign numbers beside it.

**L15 · E1.1 beat "Cartesian distance ranks configurations against their physics".**
- *Issue.* The measured rank correlation is ρ = 0.50, which is positive. With Kendall τ ≈ 0.35, about a third of
  pair comparisons invert. Pairs A and B are a chosen inversion.
- *Fix.* "disagrees with the thermal ruler on about a third of comparisons (ρ = 0.50); A and B are one such pair,
  chosen to show it".

**L16 · P0.2: the "empty cell" lights gold while R-DM (2024), an energy metric with a denoiser, sits outside as a
muted chip.** *Fix:* place R-DM inside the cell as a precedent: "the cell was not empty; the wδ version was".

**L17 · Part 1 on main keeps "a 5% stiff error costs ×400 more" with no qualifier, although the programme edits its
end card anyway.** *Fix:* add one end-card line: "per noise level; integrated over levels ≈ 1.5× on ALDP5 (Episode
2)".

**L18 · E3.9 HOPE → "CAME TRUE, DIFFERENTLY".**
- *Issue.* The wδ straightening evidence itself was refuted (E1.8). What worked is a learned Gaussianizing flow,
  on ALDP5 only, with a late cost (flat best at 20k updates; αL surplus).
- *Fix.* "REPLACED: GAUSSIANIZATION WORKED EARLY ON ALDP5, AT A LATE COST".

**L19 · E2.1 is titled "What the network sees at the floor" over the exact posterior of a nine-mode Gaussian
model.** *Fix:* "What the noisy state still knows at the floor (nine-mode model)".

## Missing from the programme (needed for honesty, not yet specified)

1. One operational definition of range (share of training draws inside the window, optionally loss weight), used by
   the rail, the lanes, M3 and X1.
2. Measured (A17b-style) end-to-end and long-range windows for the ordered chart, before any order claim beyond size.
3. Musts for the current design's failures (stable force field beyond 100 ps, handedness, a learned wall, transfer,
   equilibrium), with ✗ or ?, and an epistemic badge on every Must row.
4. Budget trajectories of the Cartesian family and ScoreMD in E6.2's lens; "full-schedule baselines" and "a
   converged ScoreMD" in Not established.
5. A rule that an [H] extrapolation is applied to every model or to none.
6. A readability fill for sub-pixel features, and a labelled "×N thermal width" magnifier lens shared by every
   panel of a comparison ("crisp ≠ remembered").
7. A seed-spread yardstick on every single-seed curve (γ dial, n_v = 1/16/27).
8. A wδ overlap share (< 3.5 Å) at the registered budget, or an explicit "not measured", before E6.7.
9. The fitted-correction disclosure wherever a repaired number appears (E5.5 coda, E6.8, E6.10).

## What the synthesis already does well (keep)

- **Number hygiene.** Budget chips, the "≠" glyph, two floors, ties drawn as ties, the seed-2 miss shown, and the
  invalid αL bound struck.
- **Labels on toys and reader values.** [D·model] on toys and the dagger on reader-derived values. E6.7 is held until
  A20 reproduces its column.
- **Honest renderings.** Bridge versus unconditioned captions; no posterior ghosts in the 103-d chart; the ±1 µs
  exclusion; the decision bar showing partial order (3.5 < 16).
- **Correction pills.** Pills for XLA, Gaussianization, the volume term and #1025 → #1055, and status.md flagged as
  stale.
- **Fair framing of comparisons.** "A parallel, not a head-to-head" for ScoreMD, and "native = unregularised arm at
  10%" stated in E6.3. The best flat Sprint 1 arm appears beside identity. Within-campaign Era 1 pairs only.
