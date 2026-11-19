# Programme · "Where to Add the Noise": the visualization programme for the riemannian-generative thesis (final)

Reviser, 2026-11-19. This is `design/synthesis.md` revised against four verifiers: numbers (`v-numbers.md`, N1–N32),
honesty (`v-honesty.md`, H1–H6, M1–M11, L1–L19 and a list of missing items), completeness (`v-completeness.md`,
F1–F28) and feasibility (`v-feasibility.md`, F1–F21; cited here as Fe-F1 …). Disputed points were checked in the primary
sources (`SP/rg-main` lab entries 2026-11-16 → 11-18, `docs/sprints/sprint12/real-budget-study.md`,
`docs/investigations/bba-range-and-order.md` and `bba-c3-local-accuracy-screening.md`, theory note 27, PR #1104's body)
and in the understand reports (g1, g4, r2, r4–r7). Every high and medium finding is applied, low ones where cheap; the
change log and the unresolved list close the document. SP = the session scratchpad; LOCAL =
`/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative` (read-only); ANIM = the animation worktree.

**Tags.** [M] measured (molecules, trained models, MD) · [D] derived (closed form, exact evaluation) · [D·model] an
exact or Monte Carlo computation on a stated model (chain model, nine-mode basin, toys), never a molecule measurement ·
[H] hypothesis · [I] illustrative · [S] cited from a paper or quoted from a project document · † derived by one of this
workflow's readers, unofficial until an asset reproduces it. Each tag names its source (theory note "n27", PR "#1088",
file, or the reader report that checked it).

**Scene numbers** are the synthesis's, so the review record stays valid. Inserted scenes carry a letter (E1.8b, E4.1b);
E2.6 is now a 15 s link card and E4.5 is folded into E4.6.

The series title and spine sentence are the author's own: slide 1 of
`LOCAL/runs/talk-noe-20261118/range-and-order-talk.pptx` reads "Where to add the noise"; slide 3 reads "Each step
looked promising for a measured reason and was left for a measured reason" (checked by the synthesis; re-check before
export, §9).

---

## 0. Pitch

The programme tells the riemannian-generative project as one question that got sharper six times: from "which
geometry puts unphysical shapes far away?" to "what must the noise keep readable, in which order, and what can that
answer not supply?". A 2½-minute prologue and six playable episodes (≈ 69 min, each 9–14½ min and standalone) run from
wδ's walls through stiffness, embeddings and BBA's two halves to range and order and the open force-field frontier.
Every attempt appears first with the measured reason it looked promising, then with the measured reason it was left.
Every failure, the current design's own included, adds a requirement to a List of Musts. The finale ticks the list
with each requirement's epistemic badge, says plainly that the design was built to meet the first nine, and leaves the
present failures unticked. One instrument carries the science through every piece: a fixed log-SNR "Erasure Clock"
rail on which each chart is a lane, each feature a glyph at the level where noise half-erases it, and each glyph's
**share of training draws** is drawn beneath it, because range is that share, not a position on the axis. On the rail
the project's central reversal becomes a handle the viewer turns twice with the verdict flipped: October's goal "erase
everything together" is November's diagnosed cause of BBA's lost size order. Underneath, every derived claim runs on a
small exactly solvable rig with Node tests ("toy says / molecule says"); every logged number reaches the screen only
through one provenance ledger with budget, seed, count and floor chips; readability, never pixel crispness, shows what
a noisy picture still knows; and three explorables (the Clock, the Bench, the Ledger) hand the instruments to the
viewer.

---

## 1. Organizing idea and throughlines

### 1.1 The spine

The unit of structure is d1's episode: a question; the attempt it motivated, with the measured reason to enter ("+");
a real success the viewer can believe; the measurement that broke it ("→"); the mechanism with its badge; then
*question surgery*, which rewrites the reason for leaving into the next question, and one new Must. This spine makes
honesty load-bearing: reversals become results, hypotheses get a designated place, and the finale separates "why
optimism" from "not established". Every episode is built from d2's rigs in a rigs-first order (§9). d2's own arc
("nine clocks become one" → "one clock is not enough" → "order with range" → "reading a force") is the same reversal,
so its scenes slot in without reordering.

| Station | Question | Era (first document → decision) | Verdict pill |
|---|---|---|---|
| Q1 | Which geometry puts unphysical shapes far away? | Era 1, 07-02 → 10-22 (#520, closeout #742) | NEGATIVE AS A METHOD · POSITIVE AS ARCHITECTURE |
| Q2 | What should a geometry do to the noise? | Era 2, 10-23 → 11-14 (PR #745, n20–21) | GOAL: SYNCHRONIZE ? → REVISED ON BBA |
| Q3 | How can the noise follow a curved metric without solving geodesics? | Sprint 11, 10-23 → 11-16 (tracker #769 from 10-27) | STIFF MODES ≈ 100× SOONER · TORSIONS: NO GAIN |
| Q4 | Does it survive 28 beads? | Era 4, 10-24 → 11-14 | EACH MAP FAILED FOR A MEASURED REASON |
| Q5 | What must the noise keep readable, and in which order? | Era 5, 11-11 → 11-18 (n27 11-12, n30 11-18) | RANGE, AND ORDER FOR SIZE (working hypothesis) |
| Q6 | Does it hold, and what can it not supply? | 11-14 → open | OPEN |

### 1.2 Five layers, one programme

- **Narrative (d1):** Journey Map, question surgery, +/→ pairs, Musts with badges, threads, correction pills; d5's
  dated swimlane guards against hindsight linearization.
- **Mechanism (d2):** every [D] is a tested function in `src/model/thesis/`, with rig stamps and toy/molecule pairs.
- **Evidence (d3):** one `ledger.json` (`ev('id')`, drawn by `evText()`), two floors, budget chips, the effect rule,
  "≠", the every-or-none rule for extrapolations, the REPAIR · FITTED chip, an evidence judge.
- **Interaction (d4):** one gesture per lever, lever/lens discipline, symbol hygiene, the *flipped handle* (the same γ
  control is October's fix in E2 and November's diagnosis on BBA in E5); every hand-over has a control that answers it.
- **Visual (d5):** the fixed rail with training-share sparklines, the warm-to-cool ramp, the Fog Bench ("no pixel
  blur"; opacity = readability), the 3-D rules.

### 1.3 Throughlines

| | Throughline | Built | Paid off |
|---|---|---|---|
| T1 | Noise is a clock that erases; destroyed forward = decided backward | E2.2–E2.3 | E5.1–E5.3, E5.11 |
| T2 | One spectrum, two pulls: stiffness removal wants a flat spectrum (range), order a steep one; the design flattens the stiff block and keeps two modes loud | E2.3, E2.9 | E5.4, E5.12 |
| T3 | Charts move information; they do not create it (they change its profile, its share of the loss and its access) | Retention 09 (linked), E3.5 coda | E5.9 |
| T4 | Every chart has a feature it trains almost never: Cartesian its bonds (0.04% of draws), wδ its bonds (≈ 0.4%, first order †), internal coordinates the wall (sharp only below the band); "the barrier that killed, the barrier that may save" [H] | E2.3, E4.3, E5.3 | E6.6, E6.7 |
| T5 | The blur dial: a force read at level t is the force of the blurred molecule; one model, two uses | E2.7, E3.6 | E6.4–E6.6 |
| T6 | Prediction ≠ generation; conditioning ≠ generation; readable ≠ learnable; a feature is learned when it is a coordinate of its own [H] | E1.8b, E4.7 | E5.10, X1 |
| T7 | Failures are results: moving baseline, finite ≠ correct, XLA miscompile, the 5 November correction, the wrong volume term, the wall that low-noise training did not produce | E1.7, E3.5, E3.9 | E6.4, E6.6, E6.10 |

### 1.4 Threads (drawn as filaments on the Journey Map at their payoff)

| Thread | Planted → paid off | Rhyme |
|---|---|---|
| Collision barrier (rose pin) | E1.4 → E6.7 [H] | the same odometer, two beads approaching |
| Planarity barrier kills | E1.6 ★ → E6.7 | "the barrier that killed" beside "the barrier that may save" |
| HOPE stamp (straightening) | E1.3 → E3.9 | becomes REPLACED: GAUSSIANIZATION WORKED EARLY ON ALDP5, AT A LATE COST |
| Straight in feature coordinates | E1.5 → E3.2 | "embedding makes that the rule" |
| Moving-baseline scoreboard | E1.7 → E6.2 | "this time: fresh seeds, registered criteria, effect rule" |
| Conditioning ≠ generation | E1.8b → E4.3, E4.7 | Sprint 10's sentence returns under #1025's resolution grid |
| The γ handle | E2.3 → E5.4 | same control, verdict flipped on BBA |
| "Erase everything together" + "?" pin | E2.9 ★ → E3.9 (flicker), E4.6 (blink), E5.4 (REVISED ON BBA) | E2's climax recaptioned "on BBA: range without order" |
| Hypothesis A ("an early basin decision helps") | E3.9 (greyed) → E5.4 (lit) | "the order hypothesis lost on a molecule that could not test it" |
| Internal coordinates: ablation → backbone | E3.7 (zoo card) → E4.1b → E5.6 | one dated pill |
| Read-out level t*; volume-term footnote | E2.7 → E6.6; E2.7 → E6.4 | same handle; the phantom spring |
| One model, two uses | E3.6 → E6.5 | works on ALDP5; on BBA the best force fields of the study, still drifting |
| Rulers under the waterline; normal stiffness α/σ | E2.3 → E4.3a; E3.4 → E4.3b | 27 spring channels sink; noise leaves the molecule |
| Same metric, two machines | E3.3 → E6.7 | the wδ feature map has 0% severe clashes |
| "ALDP5 cannot test order" | E3.10 → E4.0 | the footnote is E4's first line |
| Two-halves plane | E4.2 ★ → E5.6 ★, E6.2 | the dot enters the registered corner on one seed of two |

### 1.5 The List of Musts

Shown on the Journey Map as it grows and ticked in E6.10. The column caption, said once: **"requirements we wrote as
we went; the design was built to meet M1–M9, so their ticks are not independent evidence. M10–M13 are the present
design's own failures and open tests."**

| Must | Requirement | Badge | Added | Produced by | Ordered internal coordinates (E6.10) |
|---|---|---|---|---|---|
| M1 | closed-form noise kernel | [D] | E1.9 | geodesic ODE per noising step | ✓ VP noise in feature space |
| M2 | an audited baseline; change one ingredient at a time | [M] method | E1.8b, E1.9 | the moving baseline; Sprint 10's confounded comparisons | ✓ by method (registered budget, fresh seeds, effect rule); the full-schedule choice was an amendment after stage 1 |
| M3 | range: every local feature readable where training draws are (≥ 1% of draws while more than half readable) | [H] n27 §7 | E2.10 | bonds erased below the pilots' floor | ✓ bonds, angles, torsions; the wall is M9 |
| M4 | noise that stays on the molecule; redundant features go in the input, not the noised state | [M] #1025 | E4.3 | whitening's 3,225 normal directions | ✓ non-redundant block + 3 constraint directions |
| M5 | prior matching, locally and collectively | [M] #1025, #1071 | E4.4 | a spring base collapses the chain | ✓ bonds at the data level from update 0; size has a near-Gaussian coordinate |
| M6 | order: size erased last | [H] n27 §7 | E5.6 | unit variance everywhere erased the order | ✓ for size and mode lengths; chain distances first order only |
| M7 | what must be accurate needs a coordinate of its own | [H] one refuted map | E5.10 | the skeleton map refuted by its own rule | ✓ |
| M8 | an exact volume term in every force read-out | [D] #1103, #1111 | E6.4 | the phantom spring | ✓ immersion term |
| M9 | excluded volume supplied, not learned | [H] n30 prediction 4 (open) | E6.6 | no trained level produced a wall (#1101) | ✓ **only by repair** |
| M10 | a force field that holds size beyond 100 ps | [M] | E6.5 | every force field still compacts | ✗ size error ×1.7–2.9 from 100 to 300 ps (#1130) |
| M11 | global handedness in every size bin | [M] | E6.9 | the 9.5–11 Å deficit | partial: compact molecules match |
| M12 | transfer to a new protein | — | E6.10 | the Chignolin check read dummy frames | ? not tested |
| M13 | equilibrium populations of a microsecond folder | — | E6.10 | ≤ 500 ps simulations; BBA folds on µs | ? not established |

### 1.6 Dramatic shape

E1 a fall, ending on a scoreboard that taught "change one ingredient at a time"; E2 a false summit with one "?" pin;
E3 a success with limits, cracked by a same-day correction; E4 the fall on 28 beads; E5 the reversal, a design that
fixed size, and a declared window that the measured crossing fell inside; E6 the test, the study's best force fields
still drifting, and the open end.

---

## 2. Programme map

### 2.1 Pieces

| # | id (folder) | Title (a claim) | Kind | Length | Purpose | Depends on / links to |
|---|---|---|---|---|---|---|
| P0 | `src/videos/where-to-add-noise` | Where to Add the Noise | narrated | 2:25 | the questions, no numbers | all episodes |
| E1 | `src/videos/far-away` | Far Away, and Too Close | playable, 3 levers | 9:42 | Q1, Era 1: wδ from hope to wall, the moving baseline, Sprint 10's lesson | Part 0; Covariance 23 |
| E2 | `src/videos/wrong-ruler` | The Noise Has the Wrong Ruler | playable, 4 levers | 10:15 | Q2, Era 2: stiffness on the real molecule; ★ the promise | **Part 1**; Retention 05–06; Covariance 13–16; Interactions 12 |
| E3 | `src/videos/lift-noise-project` | Lift, Noise, Project | playable, 4 levers | 11:42 | Q3, Sprint 11 on ALDP5: embed, don't flatten | Part 1's promise; Covariance 29/32; Atlas |
| E4 | `src/videos/both-halves` | No Map Got Both Halves | playable, 2 levers | 9:00 | Q4, Era 4 on BBA: the internal chart introduced; every failure measured | E3's plants; Retention 08 |
| E5 | `src/videos/range-and-order` | Range and Order | playable, 4 levers | 14:25 | Q5, Era 5: the clock, the reversal, two loud modes | E2's handle; Retention 05–06, 09; Interactions 02 |
| E6 | `src/videos/what-it-cannot-supply` | What the Block Cannot Supply | playable, 2 levers | 11:45 | Q6, now: results with floors, forces, the wall, the ledger | E1 pins; E2 handle; E4/E5 planes |
| X1 | `explorables/erasure-clock` | The Erasure Clock | explorable | — | build a chart, read range and order, find where readable ≠ learnable | rail, encoders, A30 grid |
| X2 | `explorables/bench` | The Bench | explorable | — | every rig, self-testing; the toys the videos cut | all rigs |
| X3 | `explorables/ledger` | The Ledger | explorable | — | claims, corrections, provenance, floors, spurs, the promise ledger | `ledger.json` |

Total ≈ 69:14 (P0 145 s, E1 582, E2 615, E3 702, E4 540, E5 865, E6 705). The four additions that carry the story
(the internal chart, Sprint 10, the first test of order, the force-field leaderboard) and the honesty fixes cost ≈ 3½
min; E2.6 became a link card, E4.5 a chip and several scenes were tightened, so the series grew ≈ 40 s over the
synthesis. The §10 cut list reaches ≈ 63 min. E5 has a pre-planned split after E5.5 (E5a "Range and Order" 7:25 with
its own verdict card; E5b "Two Loud Modes" 7:00 with a station card), recommended for talks and the committee.

### 2.2 Numbering and order

The series is "Where to Add the Noise", eyebrow "EPISODE n OF 6"; Parts 0–1 stay foundations. **Order:** P0 → (Part
0) → **E1 → Part 1 → E2** → E3 → E4 → E5 → E6. E1 ends on "what should a geometry do to the noise?", Part 1 answers
it on a toy, E2 on the real molecule. Asides (link cards with an "on PR #3" pill until merge): Covariance 13–16 and
the E2.6 card to Covariance 15; Covariance 29/32 and Atlas after E3.3; Retention 08 in E4.1b; Retention 05–06 before
E5; Interactions 02 before E5.1, 12 after E2.7. **Committee path:** P0 → E5 → E6 (≈ 28½ min) with X1 as the hand-out
(X3 once built). **Talk clips:** E5.6 (carrying its in-scene #1137 line and MECHANISM UNTESTED stamp) and E5.11.

### 2.3 If you only build three things

1. **E5**, opened by a 60 s recap of E2's "promise" built from the same nine-mode rig: the current argument and the
   reversal, all data local and small.
2. **E2**: continues Part 1, reconciles Problem 3, introduces the rail and its training-share definition of range,
   and plants the handle E5 turns back.
3. **X1**: reuses E5's rail, lanes and encoders as a hand-out examiners can play with, including the challenge that
   exposes readable ≠ learnable.

Lost: the history (E1, E3, E4) and forces (E6); the finale's Musts and "why optimism / not established" card move into
E5.12. Cost ≈ 42–52 working days (§9).

### 2.4 Contracts with existing pieces

| Piece | Contract |
|---|---|
| Part 0 | E1.1 reuses `rigidMotion` (muted ghost); E3.1 gives its six vertical tangents zero length; its "shape space 2" card is untouched |
| Part 1 | E2.0 imports scene 14 as a still, recap labelled "toy, κ_H = 400 [I]"; E2.5 reconciles Problem 3; E3.1 delivers the spring metric. **Edit, three strings in `part-1/scenes/15-next-video.js`:** "Next: Episode 2 · The noise has the wrong ruler", and under the ×400 claim "per noise level; integrated over levels ≈ 1.5× on ALDP5 (Episode 2)" |
| Atlas | E3.3 link card (the topological orange peel) |
| Retention (PR #3) | E2.2 link; E5.1 credits its toy; E5.9 links scene 09 instead of re-deriving the KL identity; E4.1b reuses scene 08's sample-travel idiom. **Fix first:** "63% of its equilibrium width" → variance 63%, width 79% [D g4 §3.9]; reconcile "Ricci flow: FALSE" with n25 §8; replace typed labels that contradict computed values (a2); scene 08's "proposed, not established" → "its constant-C special case, internal coordinates with population whitening, became the backbone (Episode 4)" |
| Covariance (PR #3) | E2.6 links ch. 15 (keeps only the ALDP5 pairing chip); E3.2 uses ch. 29's lift camera and links ch. 32; E1.3 links ch. 23 |
| Interactions (PR #3) | E5.1 uses scene 02's weighted-ghost idiom (Cartesian only); E2.7 links scene 12 |
| Bundles | not used |

---

## 3. Recurring devices and visual language

### 3.1 Palette (`src/draw/thesis/palette.js`; `theme.js` unchanged so Parts 0–1 stay byte-identical)

| Token | Hex | One meaning | Contrast vs bg |
|---|---|---|---|
| bg / panel / line / grid | `#0d1321` / `#141c2e` / `#2c3a56` / `#1c2640` | house ground, panels, rules, dot grid | — |
| ink | `#ece8de` | titles, emphasis, data outlines | 15.2 |
| body | `#d3d7e0` | body text; **MD reference data** | 12.9 |
| muted | `#8a96ad` | secondary text; **generated samples** unless focal; superseded at 45% alpha | 6.2 |
| dim | `#56627a` | floor hatches, minor ticks | 3.0 |
| bead | `#9aa7bd` | neutral bead models with ink casing | — |
| stiff | `#ef8a5b` | bonds, stiff modes (house) | 7.5 |
| angle | `#f3b58d` | bond angles (tint of stiff) | 10.4 |
| soft | `#6cc4e8` | torsions, soft modes (house) | 9.5 |
| mid | `#a3e6d4` | long-range distances, end-to-end, contact count | 13.1 |
| global | `#5fd3b0` | size (Rg), loud modes a₁ a₂, Rouse modes, slowest TIC | 10.1 |
| wall | `#f497c0` | closest approach, the wall, overlaps, excluded volume, collision barrier | 8.9 |
| info | `#c39bf5` | readability R_h, meters, posteriors, information densities, the "decided" ring | 8.2 |
| gold | `#f2cf63` | **attention only**: playhead, current station, the control being turned, the registered corner | 12.3 |
| fog | `#aab8d6` | noise haze (alpha = min(0.85, σ_t²)) and noise balls; never text or data | 9.3 |
| x/y/z | `#ef6b6b` `#86d08f` `#7ea6f2` | Cartesian emblem and axis triads only (house) | — |

The ramp stiff → angle → soft → mid → global runs warm to cool, so order reads as a gradient on a lane and anti-order
as a reversed one (ΔE76 soft–global 41.6; mid–global 19.6 is one family, separated by glyph shape). The wall is off
the ramp on purpose (local in space, non-local in sequence). Charts never get a colour; at most three ramp hues at
once. Deliberate departures: teal, not gold, for the loud block (d5); lavender kept for information (Retention); no
lavender shape or coral-plus-rose (d4); no violet ramp end (it clashed with lavender).

### 3.2 Glyphs, states, emblems

Glyphs (18 px, ramp hue): bond ●–●, angle ∠, torsion ↻, long-range ●⌒●, end-to-end ⟷, contact count ⋰, size ◎,
slowest TIC ∿, closest approach ●|● (rose), **wall** ●‖● (rose with a hard bar: the sharpness an excluded-volume wall
needs, a different feature from the closest-approach distance), handedness (tripod), loud mode ⇔ (teal). **Fill =
readability:** a moon fill equal to R_h(t) where a curve exists; where only t½ is measured, a dashed ramp across the
linear-Gaussian decision window labelled "assumed Gaussian shape", with a "≥" extension to the right because measured
t½ values are lower bounds. **Outline = estimator:** solid with "≥" best estimator [M]; dashed first order [D]; "="
closed form; dagger reader-derived; estimators never share a lane unmarked, and a lane that changes estimator does so
visibly with a chip (E5.6). **Decided** is the same state as readable; in mirror mode the fill grows right to left and
a lavender ring pulses at R_h = ½. **Training-share bar** under each glyph (§3.3). **Chart emblems** (ink): x/y/z
triad, "ln r" ruler, zigzag, unit circle, lens, hinged chain, hinged chain with two teal arrows. **Scatter markers**
(d3): square Cartesian, circle internal, teal-ringed circle ordered, diamond wδ, triangle springs, inverted triangle
whitening, hexagon ScoreMD re-run, cross warps.

### 3.3 The Erasure Clock rail (`src/draw/thesis/rail.js`; d5 geometry, anchors are tests)

x(t) = 140 + 1340·(13.8145 − ℓ(t))/18.753 for t ∈ [10⁻⁵, 0.7], ℓ = ln(α_t²/σ_t²), plus a 30 px cap "→ 1".
Anchors: 10⁻⁵ → 140, 4×10⁻⁴ → 406, 0.01 → 683, 0.05 → 877, 0.1 → 973, 0.26 → 1128, 0.5 → 1303, 0.7 → 1480
(71.46 px per log-SNR unit) [D, checked by the fidelity judge and v-numbers]. Log-SNR ticks above, t labels below; home
band y 640–760; lanes 44 px, at most six; emblems at x 40–130.

- **Waterline:** each lane hatched left of its own t_min, "never trained" (10⁻⁵ for the Cartesian family; 0.01 for
  internal, whitened, spring and wδ charts).
- **Range, one operational definition** (rail, lane labels, M3, T4 and X1 all use it): under each lane a sparkline
  of uniform-t training draws per pixel; under each glyph a bar of its **training share** (t½ − t_min)/(1 − t_min),
  the share of draws that still see the feature more than half readable [D, R30]. A feature is *in range* when its
  share is ≥ 1% (a declared design threshold; a Node test runs it on every lane and must reproduce every narrated
  verdict). A lane is labelled "range" when every local feature (bonds, angles, torsions) is in range; contacts and the
  wall are judged separately (M9). Position alone never decides range: the log-SNR axis gives 10⁻⁵ … 0.01 about 40% of
  the rail's width for 1% of the draws, so Cartesian bonds sit 266 px right of their own waterline yet hold 0.04% of
  draws [D g4 §7 item 7]. Where note 27's reference "training used t ∈ [0.01, 1]" is meant, the narration says "against
  the internal floor of 0.01" aloud.
- **Fog:** alpha σ_t² (cap 0.85), thickening rightward. Rule, said once (E5.3): at a glyph's own t½ the fog's alpha is
  λ/(1 + λ), so a quiet feature (a Cartesian bond) is erased in fog that is still invisible.
- **Mnemonic**, said once (E5.3): **"inside the training, into the fog"**: range = every local glyph carries a usable
  training share; order = the cool glyphs deepest in the fog; generation reads right to left.
- **Decision bar**, for linear-Gaussian (first-order) glyphs only: R from 0.8 to 0.2 spans ln 16 = 2.77 log-SNR units
  (198 px) [D g3 C2]. Width probes (R = r²) span 2.35 and torsion phases (von Mises, c_φ = 1.504) 2.43 [D v-numbers],
  so measured glyphs show their own curve or the dashed ramp of §3.2. Linear glyphs look ordered only if their bars do
  not overlap (loudness ratio > 16), which shows honestly that the block's order over torsions is partial
  (6.86/2.00 = 3.4).
- **Threads** join one feature across lanes. **Mirror mode** flips the reading direction (a keyframed 1.2 s beat in
  the videos, a lever-driven simulation in X1), captioned "exact only for the exact reverse process".

### 3.4 Noise and "decided", honestly

- **Four renderings, no pixel blur (d5).** (1) *Ghosts:* 12 seeded forward draws y = α_tφ(X₀) + σ_tε_k, decoded by
  the chart's own decoder, Kabsch-aligned, "12 noisings of one molecule": forward-kernel ensembles, not posteriors.
  (2) *Best linear guess:* the Wiener mean (needs the per-chart feature moments of A14b), a lower bound. (3) *Fog
  opacity:* the moon fill. (4) *Crystallization:* forward paths played backward, captioned as **exact reverse samples**
  (unconditioned) or a **bridge ensemble** ("these 12 all end at this molecule"); trained behaviour only as measured
  gauges beside them.
- **Readability carries the information, never pixels.** Wherever a decoded molecule is drawn, each stick, chain
  outline and arrow has an opacity (or moon fill) equal to its R_h(t) in that chart, from one estimator per
  comparison (A12's first-order loudness through R2; R19 for the chain model), stamped on the panel. The geometry
  still moves, but "a crisp stick is not a remembered bond" (said once, P0.1): at 17 px/Å a BBA bond decoded from the
  internal chart moves 0.057 Å (≈ 1 px) at t = 0.26, where half its information is gone, and 0.19 Å (3 px) at t = 0.5,
  where R = 0.08 [D, honesty H1]. A shared **×N thermal-width magnifier** lens (BBA bond spread 0.057 Å) applies to
  every panel of a comparison at once, and every Å readout of local geometry prints that comparison target.
- **Posterior ghosts** only in Cartesian coordinates or exactly solvable models, each level printing its own ESS, and
  none where ESS < 40: for held-out molecule 0 that means t ≥ 0.2 (ESS 1.8 / 5.4 / 44 / 1,145 at t = 0.05 / 0.1 / 0.2
  / 0.3 [M, Fe-F10 check]). Never in the 103-d internal chart (median ESS 1, n27 §4); data posteriors exclude ±1 µs
  temporal neighbours (n27 traps).
- **The Fog Bench** shows one real molecule through a chart at the playhead with these renderings. Every frame is a
  correct noisy sample; one draw rescaled is not a diffusion path; a plug-in decode is "what the network is shown",
  never "what the state still knows".
- **Noise Ruler** at the playhead: σ dimensionless first, then in the noised unit, e.g. "t = 0.010 · σ = 0.0446 ·
  log-SNR 6.22 · ×6.252 Å → 0.279 Å per BBA Cartesian coordinate"; presets ×1 Å (manifold route), ×0.9418 Å (ALDP5
  pilots), ×0.267 Å (own scale), ×6.252 Å (BBA), channel units [D g4 §3.3].

### 3.5 Evidence devices (d3, with the fidelity rules)

- **Badges** (monochrome capsules, legible in greyscale): [M] filled; [D] outline; [D·model] outline + "model"; [H]
  dashed, the only badge that may grow scene-wide; [I] dotted italic; [S] square corners; † reader-derived. The Musts
  carry the same badges.
- **Status overlays:** SUPERSEDED (45% alpha, 0.6 s strike, date); OPEN PR ("open PR #1104 · 1 seed"); DECLARED,
  NOT RUN (hourglass); NEW · UNREVIEWED (#1141); **MECHANISM UNTESTED** (E5.6, until #1137 reports); **REPAIR ·
  FITTED** with its count and fit target ("27 coefficients · fitted on seed 3 against simulations · applied to seed
  2"), on every repaired number (E5.5, E6.8, E6.10).
- **Budget chip** on every trained number, "190,350 upd (10%) · s2/s3 · 100k mol", drawn by `evText()` from the ledger
  row, so it cannot be omitted (Fe-F17); schema tests back it.
- **Provenance strip**, one per panel group: `BBA · DESRES 1.30 M frames · 190,350 upd (10%) · s2/s3 · N = 100,000 ·
  floor 0.006 Å · real-budget-study.md (2026-11-15)`; a missing field is "—".
- **Two floors:** the noise floor is the rail's waterline; the sample floor a "///" band on metric axes ("floor @
  N = 100,000"); never a number without its floor when one exists.
- **Seed dumbbells + effect gauge** ("gap 0.030 vs largest seed spread 0.026 → effect"); ties by the pre-fixed rule are
  drawn as ties. **Seed-spread yardstick** on every single-seed curve: whiskers from the nearest two-seed rows, captioned
  "one seed each" (E5.4, E5.8).
- **"≠" glyph** names the mismatch ("100k ≠ 1.3M molecules", "190k ≠ 1.9M updates", "κ_res ≠ κ_step", "bgmol ≠
  mdshare", "2k ≠ 10k campaign", "< 1 Å clash ≠ < 3.5 Å overlap") and replaces any arrow or ratio across it.
- **Every-or-none rule:** an extrapolation or inference ("a model's excess over the floor stays constant with count")
  applies to every model on a dial or to none. On screen the programme applies none (E6.3); X3 lists the inference [H]
  for every model.
- **Count dial**, **budget clock** (cosine bar, gold tick, "% of peak LR"), **κ chips** (arrows only within one chip
  and data set), **estimator chips**, the **toy/molecule pair** ("toy = 0.264 [D·model]" · "molecule 0.198 [M]") and
  the **rig stamp** at (1572, 890) ("exact · 9 Gaussian modes · widths mdshare traj 1 · unit 0.9418 Å").

### 3.6 Narrative devices (d1)

**Journey Map:** six stations (hollow future, gold ring current, filled with verdict pill when decided); dead-end
spurs in X3; threads appear only at payoff; d5's swimlane underneath, narrated "separated by logic, not by date".
**Question surgery** (≈ 8 s): words that proved insufficient are struck (captioned "not refuted: not enough" where
that is the truth), replacements typed in gold, the new question flies on. **+/→ pair** (the author's device, talk
slides 3–15). **List of Musts:** badge per row, ✓ / ✗ / partial / ?, the column caption of §1.5. **Odometer:**
Euclidean (muted, finite) against a chart's own distance (ink), running to ∞ in rose for collisions and hatched ink for
planarity (E1.4, E1.6, E6.7). **Two-halves plane:** log bond W1 (Å, with a secondary axis in BBA bond thermal widths,
0.057 Å) against log Rg W1. The "both right" corner is the region fixed in advance by #1071's registered thresholds
(bond W1 ≤ 0.001 Å, Rg W1 ≤ 0.11 Å; declared 11-14, labelled so, also on E4.2 whose data precede it), outlined gold;
floors marked, panel size printed; 20k and 100k panels never mixed; one x-axis for the whole thread (angle W1, #1127's
saved plane, only as a lens in E6.2). **Correction pill:** a dated "was → now" chip, the old reading struck for one
beat, at most one per scene, always narrated.

### 3.7 Numbers

IBM Plex Mono, tabular figures, true minus, units always, never more digits than the source; "=" live, "≈" rounded,
"≥" lower bound; seeds "0.117 / 0.091 (s2/s3)"; ranges "0.44–0.53"; ratios name numerator and denominator ("46–109×
its W1 floor"). **No number is typed in a scene file:** computed values come from rigs, logged values from `ev('id')`
drawn by `evText()` (which adds the budget chip and the tie glyph and refuses "predicted" without a `declared_before`
field), and narration cues are template strings from the same sources, spoken through one TTS formatter ("×10³" →
"times ten to the three", "≈" → "about", the true minus → "minus"). A static test checks every numeral in the cues; a
test build instruments `text()`/`tex()` (an esbuild alias plugin) with a whitelist for layout numerals.

### 3.8 Symbol hygiene (d4, extended)

| Symbol | Means only | Not |
|---|---|---|
| t, t*, t½, t_min | diffusion level; force read-out level; half erasure; trained floor | — |
| λ; r(t), R_h(t) | variance in noise units; readability (linear/exact; general) | — |
| κ_H, κ_Σ, κ_res, κ_t, κ_step, κ_train | the six κ definitions, always subscripted (κ_res of flat G = cond Σ_window = the κ_Σ of E2.0) | bare κ |
| c_φ = 1.504 | torsion phase-pair scale ("κ in the code") | κ |
| c₀ = 0.157 Å⁻¹ | library units of the loud block (mode mean squares 15.0, 6.0, …) | the 6.252 Å Cartesian unit |
| k_∥, k⊥ | spring stiffness along / across a bond (k⊥ is "γ" in n20–22) | w, γ |
| γ; v | whitening exponent only; stiff-channel variance | spring scale |
| τ, t_k, D₀; L² | lag, relaxation time, diffusion constant; loudness ratio | — |
| n_v | number of loud vectors (the project's K) | K (kept for Part 1's G = K) |
| 𝒦, 𝒦_tan | Gaussian curvature; cone tangential curvature, **per squared thermal width** | K, Å⁻² |
| Δt; ν; m | Brownian step (Å²); Gaussianize morph; chain separation | h (reserved for observables) |
| p; w_k | basin population; thermal widths | — |
| C3, C1 | project labels, shown once and small; lanes say what the chart is ("internal (unit spread)") | lane names |

### 3.9 Interaction rules

A solid-disc handle is a **lever** (pauses the video; `leverSim` or a simulation that `uses` it); a ring is a **lens**
(changes nothing narrated; a viewer-set lens persists to the scene's end). The playhead is a lever wherever narration
states what it shows (E5.2, E5.3, E5.5: one handle, handed over once, in E5.3); where only a live readout follows it
(E3.4) it stays a lens. d4's ghost hand is dropped; a faint tick marks where the narrator left a lever. 19 levers
(3/4/4/2/4/2), one gesture each, performed with a labelled readout, then one hand-over with a well-posed "Your turn: …"
that the available controls can answer (Fe-F15). Cues name levels, never "now". Every readout has a comparison
target; measure before painting. Table selectors (n_v, chart) are lenses. Ranges are clamped where picture and number
would disagree. Animated lens transitions (mirror mode) are keyframed beats, because draws are functions of scene time
(an engine "lens age" in `LiveView` is optional, Fe-F14). Shares are drawn as bars, never as pans of a balance, which
sink under the larger share and read as a winner (E5.7). Simulations are seeded, Float32, ≤ 500 walkers per mode,
snapshots every 0.5 s (a Float64 copy of 1,000 × 9 walkers costs ≈ 13 MB per 90 s scene); equilibrium statistics that
a scene narrates are computed offline and shown as targets, so a live chain never shows a wandering running mean.

### 3.10 Layout and 3-D

Eyebrow (80, 74) "EPISODE n OF 6 · NN · NAME"; claim title (80, 126) Spectral 42; picture x 90–760; right column
x 860–1500, ≤ 2 formulas; footnote y 860–872; stamp (1572, 890); one claim card at a time; no text below 13 px;
baseline constants in one module. 3-D (d5): real Å coordinates Kabsch-aligned to the clean frame (so NeRF anchoring
cannot fake a lever arm); 17 px/Å; u1 perspective camera (focal 14); Catmull–Rom tube 0.45 Å; beads 0.9 Å,
painter-sorted; authored orbits only (≤ 0.02 rad/s while narrating, 15–40° reveals, still during readouts);
secondary structure bracketed, never coloured; a mode is parallel teal arrows with Rouse-cosine lengths; a₁, a₂ are
bold teal arrows from the centroid.

---

## 4. Piece-by-piece storyboards

Each episode opens on its station (E·0, 10–20 s; the swimlane lights the era) and closes with question surgery and a
Must. Default transition: the scene ends on the question its beat raises, then the house dip (0.6 s in, 0.45 s out);
shared pictures use `continues: true`. Live scenes hand over once after the narrator's demonstration. R-numbers are
rigs (§5), A-numbers assets (§6), ★ the piece's one climax. The change log maps every verifier finding to its scene.

### P0 · Where to Add the Noise (2:25, narrated)

**P0.1 ★ Cold open · 30 s.** *Screen:* one held-out BBA molecule (28 Cα tube) twice as a gold playhead sweeps the
rail's log-SNR axis from t = 10⁻⁵ to 0.5, so the low-noise decades are visible. Left, Cartesian noise; right, ordered
internal coordinates (internal at unit spread plus two teal arrows); under each panel a faint training-draw sparkline
with its hatched "never trained" region. Every stick, the chain outline and each arrow carries an opacity equal to its
readability in that chart (§3.4: first-order loudness from A12 through R2, one estimator for both panels, stamped
"first order"). Left, the sticks fade first, near t ≈ 0.0004 where training almost never looks, and the outline
lingers to ≈ 0.45. Right, sticks and chain outline fade together near 0.25–0.3 and the arrows go last (to ≈ 0.5). The
decoded geometry keeps moving in both. Caption, once: "a crisp stick is not a remembered bond". Title fades in.
*Computed:* R25 plug-in decodes of one seeded draw rescaled per level (A13, A14, A11), captioned "one draw rescaled:
each frame a correct noisy sample, not a diffusion path"; opacities from R2 on A12. *Numbers:* none (the playhead shows
t only). *Beat:* where the noise is added decides what training ever sees: both charts erase size last, but one loses
its detail where training almost never looks. *Climax:* one protein, two clocks: in one the detail is gone before
training reaches it; in the other every feature gets its turn and size goes last.

**P0.2 Two papers, one gap · 40 s.** A 2×2 grid, "generator?" against "geometry?": ScoreMD (flat, Fokker–Planck
consistent, small-t score doubles as a force field, a sampling/simulation trade-off) and Diepeveen's wδ (shape
geometry, no generator). The "both" cell already holds a muted precedent chip, R-DM (2024: an energy metric with a
denoiser, added to related work 07-31) [S g1]; beside it the wδ version lights gold: "July 2026: a generator on the wδ
shape space" (exposé 2026-07-02). Caption: "the cell was not empty; the wδ version was". *Beat:* geometry plus a
generator, one model for sampling and forces.

**P0.3 Six questions · 55 s.** The Journey Map draws six stations and types the questions (§1.1); the swimlane
underneath (Era 1 07-02 → 10-22; Era 2 10-23 → 11-14; Sprint 11 10-23 → 11-16; Era 4 10-24 → 11-14; Era 5 11-11 →
11-18; then open), "the line orders by logic, the strip by date"; an empty List of Musts; the author's sentence [S talk
slide 3]. No numbers, no lanes, no Clock yet. *Beat:* a path of measured reasons, not a random walk.

**P0.4 How to watch · 20 s.** Episode map with durations; foundations (Parts 0/1, Covariance, Retention) as dashed
side doors; the explorables; the committee path P0 → E5 → E6.

### E1 · Far Away, and Too Close (9:42; levers `ruler`, `S`, `e`)

**E1.0 Station Q1 · 12 s.** Era 1's long bar against everything after: "the first attempt built the machinery and the
contracts".

**E1.1 One ruler for everything · 70 s · lever `ruler`.** *Screen:* Part 1's five-atom toy (stamped "TOY ·
energy.js") with axes "‖Δx‖ (Å)" and "U (k_BT)" threaded to each configuration, in three builds: rotamers and the
straight chord; a stretch against a torsion arc; a rigid rotation along Part 0's orbit (‖Δx‖ grows, U fixed). Then two
real αR pairs (mdshare traj 0, Kabsch-overlaid): A differs by a stiff stretch, B by a soft rotation, on two threaded
rulers "RMSD (Å)" and "thermal distance (widths)". *Computed:* R5; R6, d_th = √(ΔqᵀΣ_q⁻¹Δq) with the αR covariance
(A3). *Numbers:* rotamers 1.75 Å apart; the chord squeezes O–H 0.96 → 0.40 Å at U = 3.27 eV ≈ 126 k_BT against ≈ 0.10
eV at the torsion path's midpoint; a 0.1 Å stretch is 0.11 Å away for 4 k_BT, a 1.0 Å torsion arc 0.95 Å for 1.7 k_BT:
"Euclid calls the stretch 8.5× closer; the energy calls it 2.4× costlier" [D·model, a1 §6.1]. Pair A RMSD 0.036 Å,
d_th 4.0; pair B 0.243 Å, 1.46; rank correlation ρ = 0.50 over 60,000 pairs and the measured share of inverted pair
comparisons (about a third; Kendall τ ≈ 0.35) [M †, d3 check, reproduced by A3]; stamp "one basin's covariance".
*Live:* comparison target the energy bar; hand-over at 55 s: "switch the ruler: which pair is the closer one now?".
*Beat:* Cartesian distance disagrees with the physics on about a third of comparisons; A and B are one such pair,
chosen to show it.

**E1.2 A ruler in percent · 50 s · lens `units`.** F(X) = ((log r_ij)_{i<j}, √δ log det G_X) built from parts; a
1.5 Å and a 5 Å pair each pulled +0.1 Å; the scale–shape cylinder (dilation along a = (1, …, 1, 2d√δ)). *Computed:*
R7. *Numbers:* costs 0.004165 against 0.000392 (10.6×); under Å → nm Euclid scales ×0.1 while wδ stays 0.222685
[D r1 E5]; C = m + 36δ = 46 for n = 5 [D r1 E4]. *Beat:* wδ measures relative deformation; scale splits off exactly.

**E1.3 The straightening hope · 50 s.** A 3-D cartoon ("the real image is 9-d in 11-d"): shape space as a curved
sheet in feature space, a straight feature chord dropped back onto it; a dimer closing a contact 10 → 4 Å; two cited
cards; the supervisor-deck valley cartoon (ThesisDiscussionFrank2 slide 6) redrawn and stamped **HOPE** (dashed); link
Covariance 23. *Computed:* R10; "the w-geodesic is the realizable molecule nearest the straight feature chord" [D g2
M2]. *Numbers:* dimer midpoint 6.325 Å (wδ) vs 7.0 Å [D g2 E1]; AK rank-1 tangent PCA "about 85%", "about 1 Å", nsp13
rank 7 [S Diepeveen 2024]. *Beat:* the hope, shown before the attempt. *Plant:* HOPE → Q3.

**E1.4 Two barriers · 50 s.** The Odometer twice: two beads approach (Euclid finite, wδ → ∞ as log r → −∞, rose);
a flattening cloud (hatched ink, preview of E1.6); the bound |Δ log det G| ≤ d_g/√δ with Diepeveen's motivation
"collisions should be infinitely far, like Lennard-Jones" [S]. Q1's "+", in the project's words: the geometry hands
the network the forbidden volume, "the reason to expect a data-efficiency and generalisation win" (way-forward brief
09-15; deck: "unphysical configurations are pushed off to infinity → never sampled") [S g1 §1.2]. *Computed:* R7.
*Beat:* wδ puts collisions and flat clouds infinitely far, and that was expected to save data. *Plants:* the collision
dial becomes a rose pin at Q6; the data-efficiency hope is closed in E5.9.

**E1.5 Noise without a formula · 80 s · lever `S`, lens `start distance`.** *Screen:* a `codeBlock` pane in three
rows: flat noising `x_t = α x₀ + σ ε`; intrinsic wδ, which needs a frame eigendecomposition, S = clip(⌈8r²⌉, 8, 1024)
Verlet sub-steps with a horizontal solve each, T walk steps and 500 reverse steps; and the target side
(separation-gradient surrogate labels, a covector-divergence sign error in ISM until #355, label error growing past the
injectivity radius, 9.8° → 35° [M r1]). Right: a live geodesic with a side panel in feature coordinates, where it is
straight. *Computed:* R8: x ∈ (0, ∞)², g = diag(1/x₁², 1/x₂²) (pullback of F = (log x₁, log x₂)); ẍᵢ = ẋᵢ²/xᵢ, exact
xᵢ(s) = xᵢ(0)exp(sẋᵢ(0)/xᵢ(0)); fixed-step Verlet; readouts endpoint error, "crossed the barrier?", and the chord bound
with one line: "the straight feature distance cannot exceed the path length; red means the integrator broke it".
*Numbers:* on 256 real clean frames (δ = 1) the chord bound fails on 38.3% at 8 sub-steps and 2.34% at 128 [M r1 E14];
cost per sample 0.74 s flat vs ≈ 253 s (≈ 340×) vs ≈ 445 s (≈ 600×) [M Sprint 7, stamp "indicative: warm flat vs
compile-amortized cold manifold, N = 3, A100"]. *Live:* the narrator fails at S = 8 near the wall, then "start closer
to the wall: how many sub-steps keep the endpoint on the line?" *Beat:* step selection is not error control.
*Plant:* "in feature coordinates this geodesic is a straight line" → E3.2.

**E1.6 ★ The barrier sat where the molecules live · 85 s · lever `e`, lens `beads`.** *Screen:* the cloud X_e =
((±1,0,e), (0,±1,−e), (0,0,0)) in 3-D on an authored orbit, flattening as e runs 0.5 → 10⁻⁴; Euclidean and wδ
odometers and a condition gauge; then a translucent heap (log histogram of λ_min(G_X)/tr G_X over all 800k ALDP5
frames, A4) piling toward a wall that a log axis cannot draw: an off-axis arrow "∞ in wδ (at −∞ on this axis)", with
the wδ barrier term √δ|log det G_X| printed for the heap's median and worst frame; lens `beads` = {5 backbone | 6
with Cβ | 5 + phantom x_v = Cα + 1.5 Å n̂} moves the heap away. *Computed:* R7 (Jacobi on the 9×9 horizontal block);
A4 (batched eigvalsh over every frame, seconds). *Numbers:* Euclid → 1.0 while wδ reads 3.2489 / 7.8377 / 12.4378 /
17.0407 at e = 0.1 / 0.01 / 10⁻³ / 10⁻⁴; condition 42.1 → 6,437 → 6.0×10⁷ at e = 0.5 / 0.1 / 0.01, ∝ e⁻⁴ [D r1 E1];
over all 800k frames worst condition 1.55×10⁶ (n = 5) vs 4.2×10³ (n = 6) [M Sprint 7, reproduced by A4], with the
logged λ_min(G_X) 1.6×10⁻⁴ vs 0.10 as an "unnormalised" chip beside A4's normalised axis values; the phantom changes
the geometry: dilation √46 → √51, three extra noised directions [D r1 E6]. *Live:* hand-over at 65 s, "push the cloud
toward the plane: which odometer runs away?" *Beat:* the barrier that makes wδ elegant sat on the data. *Climax:* the
squashed cloud, the wδ needle past 17, the heap crowding the arrow.

**E1.7 Finite is not correct; the moving baseline · 60 s · lens `date`.** *Screen:* two bug cards with one-line
lessons: transposed 3×3 blocks ("invariants beat parity"; rigid residual 1.3×10⁻¹⁴ vs 5.97 [D r1 M5]) and the clock
("a multiplier that must stay positive crossed zero"; lens: A(t) = 1 − ½β(t)τ(t), A(1) = −0.111 vs a(1) = 0.00657 [D
r1 E3]); TF32, the score sign and the other bugs live in X3. Then a log-JS scoreboard (Aug → Oct) pairing **only within
a campaign** ("≠" between campaigns; validity beside every JS). *Numbers [M]:* Sprint 1 (n = 6, 3 seeds): wδ·GRW+OU
0.117 ± 0.007, identity 0.479 ± 0.005, **best flat 0.167 ± 0.012**; 0.180 struck. Sprint 5 (10k campaign, epoch
10,000): wδ 0.119 ± 0.012, 77% physical, vs flat 0.263/0.268 (lens: 2k campaign, epoch 1,000, 0.103 ± 0.009 vs 0.239 ±
0.007, 0.293 ± 0.020); the author's slide: "0.12 vs 0.26 … 23% unphysical, costly geodesics; tied with the strongest
flat baseline" [S]. Sprint 7: finite 0.9996 yet JS 0.325, φ > 0 box 25.2% vs 0.60% (reflection-confounded). Sprint 8:
flat 0.2846/0.2618 → 0.1012 after the vp_mean fix (10-02, N = 2,000); ScoreMD-native 0.0151 vs floor 0.0114; wδ 0.1664
vs flat 0.2405. Sprint 9: bond W1 0.239–0.558 Å, 46–109× its W1 floor [M #474]. Stamp "indicative". *Beat:* fixing
numerics moved the blocker to the law; the early win was 4× against identity, 1.4× against the best flat arm (itself
plausibly hit by the vp_mean bug [H]), and gone once the target was fixed: "fix the baseline first" [S Sprint 10].
*Plant:* scoreboard → Q6.

**E1.8 The famous figure, with its missing baseline · 40 s · lens `rank-1 check`.** AK closed → open in two rows (MD;
aligned Cartesian chord) at frames 25/50/75 as Cα tubes, with bars; the wδ separation-interpolation row has no local
coordinates (Fe-F7) and appears as its logged numbers only. *Computed:* A10. *Numbers:* mean RMSD Cartesian 1.784 vs
wδ 2.053 Å [M aldp-reference]; adjacent Cα 0.144 vs 0.077 Å [M #513]; ALDP5 0.224 vs 0.247 Å, local distances 0.052 vs
0.032 Å [M #513]; "a DIMS directed transition; the curve parameter is not time" [M #522]; lens only, †: Cartesian PCA
PC1 0.8934 vs ProteinAtlas wδ re-run 0.8927 beside the paper's "about 85%", reconciled on screen. *Beat:* wδ's
reproducible advantage is short distances; "the directed data alone may explain the rank-1 result (programme check)".
*Plant:* "keeps neighbours apart" → E6.7.

**E1.8b Better conditioned, not better · 45 s.** *Screen:* Sprint 10 (#520, 10-19 → 10-22) under one
physical-density and force contract (n17: a metric "must not silently change the physical density whose gradient
defines the force"), as a three-row scoreboard against flat: (1) **bond protection ✓**: at matched displacement the
chemical metric cut median bond variance 38% and the planar-compatible wδ 86%, which moved 2.93× flat's torsional
variance (#528): "noise that does not break bonds", the stiffness idea in its first form; (2) **force ✗**: weighting
the force loss by the planar inverse metric made held-out force MSE 5.9–8.2% worse in all three paired seeds (#529);
(3) **density ✓, force ✗**: the chemical-prior geometry improved density and basin populations in all three seeds and
worsened force MSE by 13.8–27.8% (#603); footer "every thermal tree-bond variant lost angular quality (#679, #687)" [M
r2 §1.1]. Then the closeout sentence [S #742]: "Better conditioning did not reliably improve score risk, rare-basin
populations or generation … change one of those at a time." A [D·model] chip (n19 §2; R33 in X2): "density and force
prefer different models: a 10% stiff-mode error costs KL 0.0027 but force error² 1; a 50% soft-mode error costs KL
0.097 but force error² 0.25". *Data:* A23 rows. *Beat:* the candidates changed metric, prior and noising law at once,
so no cause could be named; Era 2 restarts with one choice per problem. Must M2 extended. *Plant:* "conditioning ≠
generation" → E4.3, E4.7.

**E1.9 Verdict · 40 s.** The 10-22 closeout card: "flat Cartesian stays the default; wδ becomes a restricted-domain
reference" [M #520/#742]; stamp NEGATIVE AS A METHOD · POSITIVE AS ARCHITECTURE; seed card "the same features later
work as an embedding (E3)". *Question surgery:* "Which geometry ~~puts unphysical shapes far away~~ → *should a geometry
do to the noise?*", the struck words captioned "not refuted: not enough (they return in Episode 6)". *Musts:* M1, M2.
*→* "Part 1 asked this with a toy; Episode 2 asks the real molecule."

### E2 · The Noise Has the Wrong Ruler (10:15; levers `λ`, `γ`, `t_min`, `t*`)

**E2.0 Station Q2: where Part 1 stopped · 30 s.** PR #745 (10-23/24). Part 1 scene 14 as a still, three problem
thumbnails "toy, κ_H = 400 [I]". *Numbers:* κ_Σ 100–200 inside a basin, ≈ 920 across data [M n20 §0, §1.4, bgmol],
footnoted "within a basin κ_Σ is E2.8's κ_res of flat G"; Part 1's "×20 in noise level" is ×10–14 in one real basin,
×30 across data [D g4 §3.5]. *Beat:* stiffness is real; now the real molecule and the real schedule.

**E2.1 What the noisy state still knows at the floor (nine-mode model) · 45 s.** The ALDP5 mean backbone (mdshare
traj 1) with 24 posterior completions of one noisy observation at t = 0.01 at the pilots' production scale: torsion
ghosts coincide, bond ghosts fan out; no meters yet. *Computed:* R3, x_k | y ~ N(r_k y/α, λ_k(1 − r_k)) on A1's
eigenvectors, stamp "exact posterior of a nine-mode Gaussian model [D·model]". *Numbers:* "t = 0.01 · σ = 0.0446 ·
×0.9418 Å → 0.042 Å per coordinate (pilot floor)" [D g4 §3.3]. *Beat:* at the lowest trained level the stiffest modes
are still mostly undecided.

**E2.2 One mode, one meter · 75 s · lever `λ`.** One shared axis, never rescaled: 400 seeded samples of Z ~ N(0, λ),
then their noised images, then the exact curves; below, the **rail is introduced** with the meter r(t), half point,
decision bar, waterline and fog. *Computed:* R1, R2. *Numbers:* t½(1) = 0.259; the decision window is a factor 16 in
SNR (2.77 log-SNR) for a linear Gaussian feature [D g3 C2]; R = ½ keeps ≥ ½ ln 2 ≈ 0.35 nats [D n27 §1]; a width keeps
r² [D n26]. *Live:* hand-over at 60 s: 100× more variance moves t½ only 0.093 → 0.486 (λ 0.1 → 10) [D r4 E1]. Link:
Retention. *Beat:* for a Gaussian feature only its variance in noise units decides when it is erased.

**E2.3 Nine rulers in the fog · 80 s · lever `γ`, lens `unit`.** Nine rail rows, one per ALDP5 principal mode,
labelled by its eigenvector on a backbone thumbnail, with window bar, t½ glyph and **training-share bar**, introduced
here as the programme's definition of range (§3.3). *Computed:* R3, λ_k = (w_k/0.9418 Å)²; the noise-shape handle sets
λ_eff = λ_k^{1−γ} (γ = 0 flat, γ = 1 metric-shaped), badged **[D·model · display interpolation]**: "the project
compared γ = 0 and γ = 1 on ALDP5; the continuous dial is BBA's (#1057)". *Numbers:* widths 0.0252 … 0.6631 Å [M mdshare
traj 1]; flat t½ 0.00483, 0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196 [D g1 §3.1], two clearly below
the floor and a third at it; training share 0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9, 18.8% vs 25.2% per unit channel [D], so
five modes fall short of the 1% range threshold; the stiffest mode enters the band at γ ≈ 0.14; spread ×40.6 / ×4.8 /
×2.0 at γ = 0 / 0.5 / 0.75 [D]; caption "principal directions, not bonds; a bond length (√2σ) is half erased at
t ≈ 0.003–0.004"; lens `unit`: at the own scale 0.267 Å with floor 10⁻⁵ every mode gets a usable share (the stiffest
2.5%) [D r3 E19]. *Live:* hand-over at 65 s: "find the γ at which the stiffest mode enters the band." *Beat:* under the
trusted schedule no trained level resolves a bond (n21 Prop. 5); thermal units put all modes on one clock.

**E2.4 Below the floor · 60 s · lever `t_min`.** A bond-length histogram (width w), the floor noise s, the Tweedie
image of every sample; inset, the flat production model's bond-width ratio vs updates. *Computed:* R3, w/√(w² + s²),
s = √2 × 0.042 = 0.0594 Å. *Numbers:* bond SNR at t = 0.01 **below 1 in every convention**: 0.30–0.46 manifold route,
0.34–0.52 pilot scale, 0.16–0.18 window mode [D n21 §5.2; g4 §3.6]; Tweedie predicts 0.39–0.46, measured 0.44–0.53 at
200k (#765) and 0.49–0.58 at 40k (#754), 1.8–2.8× too broad at 1k [M]. *Live:* hand-over at 50 s: "lower the floor:
from which t_min is the bond's denoised width within 5% of the truth?" (R3; ≈ 4–6×10⁻⁴). *Beat:* a floor wider than a
bond means bonds are never trained, and the last step shrinks them. *→* "If the loss never sees bonds, why did Part 1
say it over-charges them?"

**E2.5 One wrong ruler, seen from both sides · 80 s.** Left, Part 1's Problem 3 bars ("per level a 5% stiff error
costs κ_H more", 400 [I]); right, each mode's per-level loss weight against its readable window, the product shaded
and integrated; below, a loss trace with minibatch scatter and a 0.001 notch. *Computed:* R4. *Numbers:* integrated
over-charge ≈ 1.5×: 17.5 vs 11.4 **in units of ½·0.05²** [D n21 §6, §8] (units printed so the digits are not read as
n20's κ_res 17.5/11.4/22.3); the σ ≈ w band is ~6% of training times; a bond 23% too broad costs ≈ 0.009 of a loss
≈ 1.0; 8.5% → 5% lowers the ideal loss ≈ 0.001, 20–70× below the 0.02–0.07 scatter [D, idealized, LESSONS D18]; a
constant score error δ shifts samples by Σδ at KL ½δᵀΣδ, so equal relative errors cost ½·0.05² in every mode: **the
samples feel errors in thermal widths** [D n21 Prop. 8]. *Beat:* the single reconciliation: a huge per-level weight on
a window the noise almost never opens.

**E2.6 The training valley (link) · 15 s.** A link card to Covariance 15 (balanced gradient flows) with a bowl
thumbnail and the ALDP5 pairing chip: training curvature 1.9×10⁴ (Riemannian, raw) / 146 (covector) / 8.1 (whitened,
thermal); GD from zero 24,319 / 589 / 31; Adam 3,941 vs 226 [M/D n21 §4.3; κ_train chip]; an [S] chip opens the
precedent ledger (Ahamed 2026, preconditioned score/flow matching, g3). One narrated sentence: "gradient descent feels
stiffness twice; thermal units in and out fix sizes and gains (Problem 2)."

**E2.7 The blur dial · 95 s · lever `t*`.** *Screen:* ScoreMD's seesaw, drawn **for ALDP only** (beam pivot = read-out
level): Diffusion reads early, keeps sharp simulated bonds (0.83× Both) and fails the landscape (sim PMF 1.047 ±
0.924, φ > 0 missed); Two For One reads at t = 0.02, keeps the landscape (0.206) and pays a C–N bond 23.51 ± 1.91×
worse than Both [S ScoreMD Tables 11–12 via g1]. For **BBA** there is no balance point: both pivots fail the landscape
(Diffusion iid 0.034 but simulation 5.387; Two For One read at t = 0.005, simulation 1.624), and ScoreMD's fix is a
differently trained model, drawn as a separate counterweight "FP + MoE (Both): simulation repaired (0.254), iid ×7
worse (0.234)" [S Table 15 via g1]; the reading "reading early breaks the landscape" is badged [H, our reading]. Then
the nine meters become a curve r(t*) with measured Stein ratios as toy/molecule pairs; right, seeded Brownian dynamics
of the nine-mode Gaussian under the blurred force, histograms of modes 1 and 9 against their widths. One sentence:
"the force does not depend on the metric; a chart changes only the score's vector form and the volume term" [D n17,
n20 §8, n29]. One convention on screen: driver F = Jᵀα s(αφ) + ∇ log vol; n29's form differs by α_t² on unit-variance
channels (0.994 at 0.02, 0.971 at 0.05) [D g4 §3.11]. *Computed:* R3, F_t(x) = α s_t(αx) = r(t)F₀(x), inflation 1/√r
[D g1 §2.11]; walkers du = −r_k u dt + √2 dW, 500 per mode, Float32. *Numbers:* ideal r(0.01) 0.264 … 0.996
[D·model]; measured flat production, seed 0, read at 0.01: 0.198, 0.252, 0.293, 0.485, 0.459, 0.418, 0.694, 0.727,
0.369 [M #768]; flat low floor read at 0.003: 0.91–1.04 (**seed 0 only**), yet its simulations drift to 83% αR (MD
35%); thermal r(0.03) = 0.988 for every mode [D]. *Live:* hand-over at 75 s, "find one flat level where all nine sit
near 1" (none; thermal units flatten it); the handle returns in E6.6. *Plant:* omitting the volume term shortens ALDP5
bonds by 0.30–0.36 thermal widths [M n20 §8]. Link: Interactions 12. *Beat:* a force read at level t is the blurred
molecule's force; in thermal units one level serves every mode (on ALDP5).

**E2.8 The ruler must turn with the bond · 60 s · lens `drag bond`.** A rotating bond: a constant equivariant metric
(A ⊗ I₃, Schur's lemma) is stiff along the wrong axis after 90°; an ellipse attached to the bond stays right; the
cone's silhouette as preview. *Numbers (κ_res chip; for flat G, κ_res = cond Σ within the window):* fixed global
whitening worse than flat, 273 vs 192 (β/C7eq), 477 vs 112 (αR); spring 9.6/7.6/13.4 vs flat 192/112/97 [M n20 §5.3,
bgmol, in-sample]; "judged by this question, wδ (δ = 1) made ALDP5 stiffer: 413 vs 192" [M n20 §5.3]; rotating-bond
residual 13.9/8.3/13.0 at k⊥ = 10/30/100 [M n21 §7.2]. *Beat:* a stiffness metric depends on the configuration, so it
is curved and its noise has no closed form [D n20 Lemma 2; n21 Lemma 4].

**E2.9 ★ The promise: erase everything together · 45 s.** Nine rulers fade in unison under unit noise; four rows E1
output scale, E2 balanced loss, E3 conditioned target, E4 synchronized erasure, each tagged with its owning choice;
"only the forward noise can do E4" [D n20 §4.6]; honest limits "says nothing about torsions, rare basins, long-range
correlations" [D n20 §4.7]; a small "?" pin on E4. *Climax:* nine real rulers in one column at t½ = 0.259, "the
promise".

**E2.10 Verdict · 30 s.** "What should a geometry do to the noise?" → "How can the noise follow a curved metric
*without solving geodesics*?" Must M3 [H], shown in its operational form (every local feature ≥ 1% of training draws).
Stamp GOAL: SYNCHRONIZE (E4) ?

### E3 · Lift, Noise, Project (11:42; levers `site`, `θ`, `τ`, `ν`)

**E3.0 Station Q3 · 12 s.** Sprint 11 (10-23 → 11-16; tracker #769 from 10-27); Q2 and Q3 lie within 48 hours:
"separated by logic, not by date".

**E3.1 The springs are a pullback · 65 s.** The ALDP5 backbone with springs on 4 bonds and 3 one–three pairs; Part 1's
formula flight assembles G = J_dᵀWJ_d + k⊥I, then F(x) = (W^{1/2}d(x), √k⊥ x) with G = DFᵀDF; the repo's own network
with Part 0's six vertical tangents at zero length; Part 1's "Next video" card paid off. *Computed:* R11. *Numbers:*
bond constants 1,100–1,660 Å⁻², one–three 300–460 Å⁻², k⊥ = 30 Å⁻² [M n20 §1.4, ranges]; for `energy.js` G = JᵀWJ = K
at rest, 6 zero and 9 internal eigenvalues 0.0264 … 53.99 eV/Å², κ_H = 2,048 [D·model g4 §3.2; "Part 1's 400 was a
two-mode illustration"]. *Beat:* the spring metric is the flat metric of a bigger space seen through pair distances:
Part 1's "G ≈ K", delivered.

**E3.2 ★ Lift, noise, project · 90 s · lever `site`, lens `contrast`.** 3-D in Covariance 29's camera: a planar bond
b ∈ ℝ² lifts onto the cone F(b) = (√k_∥|b|, √(k⊥/2)b), first exaggerated (k_∥/(k⊥/2) = 3, 30°), then the real 5.9°;
thermal samples on the cone; the same seeded draws added in configuration or in feature space and projected to the
nearest image point; a fog noise ball (gold outline while in focus) casts a needle-thin shadow beside the round blob of
flat noise; `y_t = α y₀ + σ ε` appears beside E1.5's pane: "the geodesic that was straight in log coordinates:
embedding makes that the rule". *Computed:* R12 (closed-form nearest point; Monte Carlo aspect tested within 3%);
Cov(δx) ≈ s²(DφᵀDφ)⁻¹ [D n23 §4.3]. *Numbers:* at k_∥ = 1,400 Å⁻², k⊥ = 30 Å⁻², r = 1.5 Å [I]: c = 0.103 (half-opening
5.9°), σ_r = 0.0266 Å, σ⊥ = 0.258 Å; aspect 1.00 (configuration noise) vs 0.103 (feature noise) [D n22 Prop. 4; r3
E1–E2]; caveat "a 2-D cone is flat; curvature needs the 3-D bond". *Live:* hand-over at 75 s, "switch where the noise
lives; watch the bond-length readout"; lens `contrast` (1 → 93.3): c and σ_r/σ⊥ agree to every digit. Links:
Covariance 32; Retention 03. *Beat:* round noise above is molecule-shaped noise below, with an exact kernel; the price
is projecting back. *Climax:* the needle-thin shadow beside the round blob.

**E3.3 You cannot flatten an orange peel · 90 s · lever `θ`.** The sphere of bond directions (radius R = r₀/σ⊥) with
G = (k⊥/2 + k_∥)dr² + (k⊥/2)r²dΩ²; the cap first exaggerated as a glossy peel pressed flat, circles of constant tilt
stretching, then **at its real size**: one thermal width of tilt is θ ≈ 0.17 rad, where the deficit is ≈ 0.5% [D R12];
the theorem card; coda "same metric, two machines". *Computed:* R12: deficit 1 − sin θ/θ; ρ = √(2ρ₀²(1 − cos cθ)),
ρ₀ = √(k⊥/2 + k_∥)r₀; bound 𝒦ρ²/12; n22's exact four-point values as points. *Numbers:* R = 5.81 thermal widths;
**𝒦_tan = 0.0293 per squared thermal width** [D n22 Props. 4/6]; flatness would need angular width to shrink 9% per 1%
of stretch [D Prop. 6]; one line: "the true one-bond Hessian curves the other way (𝒦_tan = −0.684, a saddle) and turns
indefinite beyond 0.016 Å of compression, hence the Gauss–Newton part" [D Prop. 5]; at θ = 0.5 deficit 4.1%, 𝒦ρ² =
0.25, bound 0.021, exact 0.022; exact ε 0.0008/0.0076/0.022/0.061/0.16/0.35 at θ = 0.1/0.3/0.5/0.8/1.2/1.6 vs bound
0.0008/0.0074/0.021/0.053/0.12/0.21 [D §5.2]; equivariant flat maps of one bond err ≥ 0.14–0.56 vs 0.018–0.11 for
S²×ℝ [D §5.3]; **the practical scale, narrated:** ALDP5 within a basin 0.2–1.5% at best and 1–8% achievable,
heuristically 3–20% over the torsion landscape [D/H §5.4, n23], which "may or may not matter for learning and should be
tested rather than assumed" [S n22 §6]; a higher-dimensional embedding reproduces the metric exactly [D §5.1]; coda:
wδ as an embedding trains in 318 vs 259 s [M Sprint 12]. *Live:* hand-over at 65 s, "tilt further: when does the forced
error pass 5%?" Link: Atlas. *Beat:* a flat chart cannot be exact; within a basin the cost is small; an embedding is
exact.

**E3.4 Redundancy hides stiffness in the normal directions · 30 s · lens playhead.** Feature noise scatters off the
cone, each point drops to its image along a leader line, a bar splits tangent from normal variance; a live readout
follows the playhead (the narration states no level-specific value, so the playhead stays a lens). *Computed:* R13.
*Numbers (readout):* α/σ = 22.4 at t = 0.01, 999.5 at 10⁻⁵; 1/σ² = 502 at 0.01 [D n28 §4]. *Beat:* redundancy converts
finite stiffness into a normal stiffness that diverges at low noise. *Plant:* → E4.3b.

**E3.5 The race · 95 s · lenses `checkpoint`, `time share`.** A correction pill: "#757–#763 'late-training
degradation' → #765 (10-26): XLA miscompiled the final denoising step, shifting every GPU molecule by 0.018 Å; re-run
under a pre-declared protocol, 3 seeds" [M r3 §1.5]. Five columns (flat t ≥ 10⁻⁵, flat production t ≥ 0.01, spring,
learned warp, wδ) with Ramachandran (36×36) and bond-1 histograms recomputed from 20,000 stored molecules of seed 0;
below, log–log bond W1/σ vs updates with seed ribbons and hatched sample floors (0.010/0.017/0.011), flat first,
spring swapped in. *Computed:* A5. *Numbers [M #765, mdshare, 3 seeds]:* bond W1/σ at 1k/5k/20k/200k: spring
0.018/0.013/0.012/0.013; learned 0.020/0.016/0.016/0.015; flat low floor 0.186/0.068/0.046/0.015; production
0.981/0.173/0.291/0.422 (rising); wδ 0.042 → 0.018; bonds at the floor ≈ 100× sooner, angles 10–20×; φ/ψ JS inside the
floor band by 5k, 0.0207 (flat) vs 0.0201 (spring) at 200k. *Guard:* histograms for display, scores from the protocol
(a test checks 5% agreement); "flat catches up with long training (#886: 0.994–1.049 at 200k vs 1.115–1.291 at 20k)".
*Coda (20 s, lens `time share`, dated 11-04/05):* could flat simply spend more training where bonds die? A
frozen-channel pilot finds flat noise erasing bond and angle information between t ≈ 0.002 and 0.08, where uniform
training spends 3–7% of draws (spring16: 17–34%) [M #929]; moving half of flat's draws there cut bond error 21–45% but
made angles, torsions and coupling worse for the first 5,000–10,000 updates: "not a net improvement at matched budget"
[M, card `ir-aldp5-time-allocation`]. Caption: "a schedule moves training time; a chart moves the window" (cf. Ahamed
F.3, scalar time weighting cannot fix directional stiffness [S g3]). *Beat:* stiff geometry ≈ 100× sooner; torsions do
not care; a schedule is no substitute.

**E3.6 One model, two uses · 40 s · lens `force field`.** Stein needles per direction (target 1), then the consistency
diagonal (iid vs simulated bond width over MD, line y = x). *Numbers [M]:* Stein at 200k (directions 1–3 | 4–7), each
arm's read-out level printed beside it (flat production 0.01, spring 0.03, learned as stored in A6): spring 0.97–1.03 |
0.91–0.99, learned 0.96–1.00 | 0.93–1.01, flat production 0.20–0.29 | 0.42–0.69 [#768]; diagonal (#886, conservative
transformer, 2 seeds, every map read at 0.05): aligned Cartesian 1.006–1.090 vs 2.328–2.778, springs 0.966–1.022 vs
0.993–1.066, wδ 0.954–1.002 vs 1.187–1.328, whitening 0.956–1.016 vs 1.036–1.100; flat low floor iid JS 0.021 but
simulation 0.142 [#768]. *Guards:* "a parallel to ScoreMD's dilemma, not a head-to-head"; "a common force time is not
a common smoothing"; real walkers from β in X2. *Beat:* in thermal units the same weights sample and simulate, on
ALDP5. *Plant:* → E6.5.

**E3.7 Faster, not better · 80 s · lens `effective samples`.** A map-zoo strip (trajectory and quantum springs, shared
quantum φ, invariant embedding, global whitening, graph metrics, and a muted card "internal coordinates: 'only as an
ablation (not transferable)', n20, 10-23") lighting one stiff-mode benefit, with a guard chip "architecture matters: a
rotation-equivariant Cartesian network narrowed the quantum-spring bond advantage from 32–46× to 1.7–2.4× (#793)";
then the αL barcode: three 250 ns φ > 0 hysteresis strips (±20°), counters to 37/37/37, three error bars in turn;
then a 15 s inset bridging to E3.9 [D, R32]: "no constant metric changes multimodality: two basins 2 Å apart with
width 0.2 Å have roughness 624; flat noise lowers it to 397/149/11 at σ² = 0.01/0.04/0.2 Å² (n21 Prop. 10); only a
nonlinear, density-aware map changes it". *Computed:* A8; R30; R32. *Numbers:* one GFN2-xTB calculation predicts bond
sds 0.0246–0.0336 vs measured 0.0252–0.0307 Å, but its pre-declared gate failed (95.05%/92.88% < 98%) [M #788 via r3];
global whitening of invariants gives most of the gain (iid bond widths 0.989–1.010× MD) [M #808]; αL populations
3.24/1.65/4.11%, dwell 219/111/278 ps [M n25 §6.1]; bars: n25's "Cramér–Rao" 0.90/1.27/0.79 **struck** ("one
Bernoulli trial per visit"), Markov (1 − p)√(2/n) = 0.225/0.229/0.223 [D †], data-based τ_int 900–1,300 ps, 96–139
effective samples, 95% intervals 0.4–7.0/0.0–4.6/1.1–7.9% [M #779]; canon "37 visits, about 100–140 effectively
independent samples; one trajectory pins αL only to about ±50%"; not improved: torsion PMF 0.332 vs 0.355 k_BT² (≈ 2
SD); flat learns αL faster (ΔF error 0.016 vs 0.077 k_BT at 20k); against the held-out trajectory every arm errs by
0.68–0.72 k_BT [M]. *Beat:* the stiff part became easy; the multimodal part did not, a constant metric cannot help it,
and one reference cannot rank it.

**E3.8 A lens that makes every step round, and its dial · 80 s · lever `τ`.** ALDP5 1 ps steps as ellipses (axis ratio
√κ_step) morphing into near-circles under the learned warp (a coupling flow fitted only to 1 ps steps, 10-24, #753;
morph and top-4 magnified directions from A9b, else ellipses [I] with the logged κ_step), its top-4 directions beside
the bond gradients, a κ_step ladder; then a time-scale ladder and n25's four-mode basin with **step-metric** bars and
half-erasure levels (one metric for both, matching the stamp). *Computed:* R14. *Numbers:* κ_step flat 184/185 →
constant whitening 24.6 → scaled internal 3.88–3.95 → learned 2.99–3.04 (floor 1.55); overlap with bond gradients
0.973 (chance 0.444) [M #753, mdshare]; chip "κ_step ≠ κ_res"; ladder bonds < 1 ps, φ ≈ 10 ps, ψ 20–50 ps, αR↔β 100–200
ps, αL 5–20 ns [M n25 §3]; λ = 1600, 400, 25, 4 Å⁻², D₀ = 0.08 Å²/ps: t_k = 0.0078, 0.031, 0.5, 3.1 ps; step metric at
τ = 1 ps G = 1600, 400, 28.9, 14.6 Å⁻² with half erasure at σ²/α² = 1, 1, 1.16, 3.65, a spread of 3.7 vs 400 under flat
noise [D n25 Prop. 2 in its step form, "replace 2τ by τ"]; chip: the measured 1 ps metric covers bonds 0.91–1.03, φ
0.24, ψ 0.052 of their variance ("ψ ≈ 19× too stiff"; width √0.052 = 0.23) [D g4 §3.8]; stamp "soft modes →
k⊥ = 1/(D₀τ)"; chip (plant, #761, 10-25): "raw Euclidean distance shows ALDP5's two-dimensional torsion sheet (local
dimension 2.0 from 0.4 Å per atom); in thermal step widths there is no plateau: 'use different rulers for different
jobs'". *Live:* hand-over "turn τ until ψ counts as soft". *Beat:* a flow fitted to 1 ps steps finds the bonds
without chemistry, and its lag is a dial for which modes count as stiff: the project's first order statement.

**E3.9 The plot twist of 5 November · 85 s · lever `ν`.** First a pre-registration card (15 s, #936): "A: an early
basin decision helps (1 ps warp fastest; an order hypothesis, anticipated by note 26) · B: synchronized erasure helps
(100 ps warp fastest)"; "B wins the early race decisively"; then the correction pill "11-05: because of synchronized
erasure [H] → because of Gaussianization [M], the same day (#938, #941)"; A stays greyed with the footnote "ALDP5 cannot
test order; the erasure order was never measured on trained models". Then the race at 100 updates as four Ramachandran
thumbnails with JS bars; a live 1-D toy: a bimodal ψ-like density morphed by ν from raw to Φ⁻¹(F(x)), the noised score
straightening, a 9-parameter RBF+linear score trained by seeded SGD (DSM at t = 0.1) with an update counter; then,
briefly, Diepeveen 2025's squeezed banana (a straight segment dives through improbable land; the valley is straight in
the Gaussianizing chart); E1.3's HOPE becomes **REPLACED: GAUSSIANIZATION WORKED EARLY ON ALDP5, AT A LATE COST**.
*Computed:* R15 (simulation `uses: ['ν']`); R16. *Numbers:* JS at 100 updates flat 0.117 (**computed on its 10% valid
molecules**), warps 1/10/100 ps 0.127/0.049/0.027, spring k⊥ = 30/8/2 0.133/0.149/0.163 [M lag sweep, 2 seeds, CPU];
KL to a Gaussian 0.96 (flat, 1 ps) / 0.20 / 0.14; Gaussianized torsions 0.042 vs control 0.255 [M]; banana
φ(x) = (x₁ − x₂²/9, x₂), A = diag(1/81, 4): ψ peaks at 40.5 on the line vs ≤ 1.125 on the geodesic, KL = ½ ln(1 +
2A₂₂²/(81A₁₁)) = 1.748 nats, latent score linear −(α²A + σ²I)⁻¹y, raw cubic [D g2 E2]; the price: at 20,000 updates
flat 0.0203 beats the warps (0.0227–0.0236) and the αL saddle holds 30 vs MD's 4–6 per 10⁴, as Diepeveen 2025's
unimodal scope warns [M/S]; toy counts [I]. *Live:* "un-Gaussianize; watch the counter". *Beat:* the straightening
promise came back as Gaussianization, a fast start with a late cost, not as synchronized erasure; the order hypothesis
was never tested here. E2's "?" pin flickers.

**E3.10 Verdict · 35 s.** Footnote under the ALDP5 molecule: "ALDP5 has no separation of local and global structure and
cannot test order" [S status]. "How can noise follow a metric without geodesics?" → "Does it *survive 28 beads*?" M1
ticked. Stamp: STIFF MODES ≈ 100× SOONER · TORSIONS: NO GAIN · GAUSSIANIZATION: FAST START, LATE COST.

### E4 · No Map Got Both Halves (9:00; levers `divisor`, `base`; all on BBA)

**E4.0 Station Q4 · 10 s.** First line: "ALDP5 cannot test order."

**E4.1 Meet BBA · 55 s.** A real DESRES window (sorted by membership id; "200 ps per frame, documented, not measured";
one contiguous 600-frame compact → extended → compact excursion, no stride) folds and unfolds as a Cα tube, hairpin
(beads 0–12) and helix (14–25) bracketed once; an Rg trace over the full-data histogram; a point on the frozen
403-feature TICA map (constants `configs/benchmarks/bba-ca28-tica.json` at `c099347a`, with a parity check); dated
data cards (07-27 placed; 10-19 found byte-identical to ScoreMD's generated `deshaw_dummy.zip`, struck; 11-01 the
authentic set). *Computed:* A15, A16. *Numbers:* 1,625,195 frames, 1,300,156 training (the paper split) [M r8]; mean Rg
10.60 Å, 5/50/95% 8.37/9.89/15.30 Å, folded share (≥ 60% native contacts) 0.194 [M]; "the two rulers disagree ~38×
(√1,423) between the stiffest and largest Cartesian mode" [D n27 §3; S talk slide 2]. *Beat:* what makes BBA hard is
global.

**E4.1b A chart built from the joints · 70 s · lens `channel`.** *Screen:* on the real chain the 103 internal channels
build one group at a time: 27 log bond lengths and 26 log tan(θ/2), whitened together by the training population
covariance (unit spread; for a bond about one thermal width, 0.057 Å); 25 torsions as phase pairs c_φ(cos τ, sin τ),
c_φ = 1.504; the NeRF decoder reads each torsion back with atan2, since a noisy phase pair leaves the circle. Then
Retention 08's sample-travel idiom (copied, not imported): samples move (torsion, bond) → (torsion, z) under the card
"if the stiff channels are standard normal and independent of the soft ones, VP noise keeps them standard normal and
their score is −z at every level: the network only has to learn the soft density" [D n28 §6, n19 §3; approximate on
BBA]. Then the measured consequence, an update-0 bar: bond W1 at the 1,000-molecule data level from step 0
(0.0023–0.0025 Å) against 10.3 Å for Cartesian [M #1071 monitors]. A dated pill: "only as an ablation (not
transferable), n20, 10-23 → by far the best BBA bead representation (#955, 20k updates: bond 0.0016 Å, angle 1.8°, TIC
JS 0.069 vs aligned Cartesian 1.00 Å, 14.7°, 0.151) → C3 (#1026) → the backbone (11-14)". A preview: one torsion turned
by 6.6° swings the far beads ("paid in Episode 5"). Lens `channel` highlights one group and its unit spread.
*Computed:* R25, A13, A14; logged values through A22. *Beat:* in internal coordinates the stiff part is prior-matched
from update 0; what is left to learn is the torsions. Link: Retention 08 (caption updated on PR #3).

**E4.2 ★ The two-halves plane · 80 s.** Log bond W1 (with the thermal-width secondary axis) vs log Rg W1; the registered
corner outlined gold (bond ≤ 0.001 Å, Rg ≤ 0.11 Å, labelled "#1071's thresholds, declared 11-14"); a real data molecule
beside it (generated ones only if A-REQ-1 arrives, else "scalar results only"); failed decodes fall off the plane.
*Numbers [M matched-results; 190,350 upd (10%), seed 0, 100k]:* internal 0.000274 Å / 0.166° / Rg 0.521 Å; Cartesian
0.415 / 5.24 / 0.072; springs 0.320 / 8.85 / **0.078** (size right, bond advantage lost; 97,113 decoded); whitening
0.705 / 24.4 / 0.497 (**neither**; 96,271 decoded); wδ 0.113 / 3.24 / 0.085; floors bond 0.0002 Å, Rg 0.006 Å; an arrow
from a separately labelled "#985 control" point: pair-distance inputs move Cartesian bonds 0.4207 → 0.0078 Å (54×,
190,350); chip: earlier #895 (200k updates at batch 128, 2 seeds, 100k molecules; "not comparable with Sprint 12
budgets") spring bonds 52× better (0.6371 vs 0.0122 Å) with TIC JS no better (0.0529 vs 0.0479), whitening TIC JS
0.2499 with PMF 4.832 under #895's own PMF definition (chip "≠ #1138 paper PMF"). *Beat:* no map got both halves;
whitening got neither. *Climax:* three occupied regions and the glowing empty corner (returns in E5.6, E6.2).

**E4.3 Four autopsies · 95 s · lever `divisor`.** #1025's resolution grid σ*/σ(t_min) (≤ 1 never resolved):
Cartesian bond 6.4 rising to Rg 351; internal bond 22, Rg 3.0; springs bond 0.84; whitening 7.7/39/85/38; wδ bond 1.25;
ALDP5 recipes 11–31 [M #1025]. Four panels: **(a) springs under water:** one global RMS divisor, 1.31 (ALDP5) vs 27.1
(BBA), puts channel sd at 0.037 < σ(t_min) = 0.045, half erased at t ≈ 0.0077; at 1.31 sd 0.76, t½ ≈ 0.21 [M #1025; D
r3 E22]. **(b) noise leaves the molecule:** 3,303 noised features for 78 shape directions, 3,225 normal; tangent share
of the low-noise loss 0.06; loss 911 → 904 → 759 [M #1025, n28 §4]. **(c) internal:** Rg least resolved (3.0 vs 22).
**(d) Cartesian:** bonds resolvable only below t = 4×10⁻⁴; distance inputs 0.76 → 0.013 Å (58×; 50,000 updates, 2
seeds, 20k molecules; #1025 §7 / #1026 Table 0.2, inputs from #985). *Live:* divisor authored 1.31 → 27.1; "lower it
until the bars surface: what does BBA need?"; caption "the condition number is scale-free; resolution is not", with
E1.8b's sentence as a footnote. Must M4 (with #1025's fifth condition: "redundant physical features belong in the
input, not the noised state"). *Beat:* each failure was measured without training and points to a different
requirement.

**E4.4 The chain that collapses · 65 s · lever `base`.** Three 28-bead chains with identical, perfect local geometry
(bonds, angles at BBA means) under torsion Monte Carlo with three bases (free, isotropic Gaussian, K ⊗ I₃), teal
gyration rings and Rg readouts against targets; the middle chain balls up to half size. *Computed:* R29: the chains
animate live; the equilibrium Rg values are computed offline (numpy) and shown as targets; #1025's chain construction
is recovered from its code before narration, because the free-chain value moves by up to ±0.4 Å with the angle
convention (Fe-F6). *Numbers:* data 10.59 ± 2.20 Å [M]; logged free 10.34 ± 2.26, isotropic 5.41 ± 0.51, matched
10.71 ± 1.92 Å [D·model #1025] beside the programme's own offline values [D·model, R29]; the untrained spring-base
model measured 4.9 Å [M #1025]. *Live:* hand-over: "switch the base: which chain keeps the data's size?" Must M5.
*Beat:* right locally, wrong collectively.

**E4.5 · folded into E4.6.** Its content is E4.6's opening chip; the Rg² decomposition rig (R28) moves to X2.

**E4.6 The fold dissolves with the detail · 80 s.** A 15 s opening chip: "size is a sum over distant pairs: in the
first-chunk internal-coordinate models 92% of the excess ⟨Rg²⟩ comes from bead pairs ≥ 11 apart (153 of 378 pairs) [M
#1010–#1015; earlier recipe, conclusions carried to C3]; even exact marginal matching leaves Rg W1 0.48–0.52 Å: size is
a joint error" [M r6 §1.1]. Then where C3 creates its excess size: a held-out molecule with a size gauge, logged band
contributions as bars along t, a plug-in decode badged [I] (or #1119's local `forward-readout.csv`, radius per level
for C3 vs two-mode, only after checking what #1119 measured); the Cartesian and C3 lanes draw in faintly. *Numbers [M
#1055]:* mean Rg 11.07 vs 10.60 Å; ≈ 90% of the excess is the hairpin–rest separation; molecules noised to t ≤ 0.1
keep their size, from t = 0.3 they reproduce 94 ± 25% of the excess; bands 0.5–0.3, 0.3–0.2, 0.2–0.11 add 0.27–0.43 Å
each; ≈ 70% of the gradient from t < 0.05; not accumulation (≤ 0.14 Å), pill "#1025 → #1055". *Beat:* equalizing every
motion erases the fold in the same band as the detail. The "?" pin blinks.

**E4.7 Prediction is not generation · 50 s.** A scatter: x the improvement of each line's own objective, y the change
in BBA size error, a grey ±0.046 Å band (the spread of reruns from identical initializations: execution noise, not a
seed floor); the learned-embedding trade-off line; a four-reason card; the empty rail fades in: "not how much the noise
erases, but when". *Numbers:* ~30 loss and target changes, none improving generation on both ALDP5 and BBA in
10k-update screens; sensitivity weighting cut BBA size error 15–23% but raised collisions [M r4 §5.3]; potential
supervision worsened size by 0.245/0.244 Å [M energy-head study]; rerun spread 0.046 Å [M #1059]; BBA "1 ps" pairs are
200 ps chords: linearized bond changes RMS 0.83 vs actual 0.081 Å [M #999/#1081 via r4]. *Beat:* judge by decoded
molecules, not by the objective (and not by conditioning, E1.8b).

**E4.8 Verdict · 35 s.** "Does it survive 28 beads?" → "What must the noise *keep readable*, and *in which order*?"
Stamp EACH MAP FAILED FOR A MEASURED REASON; status 11-14: "stiffness removal is a local lever, and it is real".

### E5 · Range and Order (14:25, centrepiece; levers `t`, `γ`, `block`, `L²`; split point after E5.5)

**E5.0 Station Q5 · 10 s.** 11-11 → 11-18, notes 27 (11-12) and 30 (11-18).

**E5.1 What the noisy molecule still knows · 80 s.** A noisy BBA query in **Cartesian** coordinates among training
frames drawn as ghosts with alpha ∝ posterior weight (Interactions 02), lavender bars of E[h | Y_t] for bond, torsion,
Rg; R_h(t) = Var(E[h | Y_t])/Var(h) and its three facts (any predictor gives a floor; more noise cannot restore
information; the channel is the map plus the noise law, with a chip "same metric, different difficulty: a line and a
helix with equal metric, rank and density give posterior variances 0.01 and ≈ 0.50" [D n28 §3, R34]); then the mirror
as a keyframed beat ("destroyed forward = decided backward; exact for the exact reverse process"); a ghost of
Retention's curve, credited. *Computed:* A17b: for the 8 A14 molecules and 12 levels, over all 1,300,156 frames in
float64 with ±1 µs exclusion, weights, posterior means, ESS and the 24 heaviest frames (≈ 0.01 s per level in numpy);
the playhead snaps to those labelled levels; ghosts appear only where that level's ESS ≥ 40, and every level prints its
own ESS. *Numbers:* for molecule 0, ESS 1.8 / 5.4 / 44 / 1,145 at t = 0.05 / 0.1 / 0.2 / 0.3 [M, Fe-F10 check,
reproduced by A17b]; n27: "about 700" in Cartesian features (level not stated) against a median of 1 in the 103-d
chart, so no internal ghosts [M n27 §4]; leakage: C3 Rg R² at t = 0.05 falls 0.82 → 0.34 → 0.14 → −0.03 excluding
±10 ns / ±100 ns / ±1 µs [M n27 §4]. *Beat:* readability is measurable before training and is what exact generation has
already decided.

**E5.2 Four charts, one molecule · 75 s · lever `t` (the playhead; narrated, no hand-over).** Four Fog Bench panels on
one held-out molecule: Cartesian (6.252 Å units); internal at unit spread; ordered internal (+ teal c₀a₁, c₀a₂); wδ
(the study's 379 features: 378 log distances, RMS 0.3138, plus √δ log det); plug-in decodes with opacity = first-order
readability (§3.4) and readouts bond RMSE (against the 0.057 Å thermal width), Rg, closest non-neighbour (rose below 3.5
Å), |a₁|; the ×N thermal-width magnifier shared by all four panels. *Computed:* R25 live; wδ decodes precomputed at 31
levels by LM from classical MDS (never from the clean frame), snapped and labelled (A17). *Numbers (four narrated
stops) [D]:* t = 0.0004: Cartesian beads blur 0.040 Å per coordinate, 0.057 Å on a bond length, one bond sd; t = 0.01:
Cartesian 0.28 Å, bonds gone; internal bonds intact, torsions blurred 1.70° (s/c_φ); wδ contacts protected while bonds
begin to blur (computed readout); t = 0.1: torsions 12.96°, the internal far end flails (anti-order, visible), the
arrows barely move; t = 0.3: the internal fold is gone, the Cartesian fold dissolving, the arrows still carry the
size. *Guards:* "one draw rescaled, not a path"; "a plug-in decode is what the network is shown"; "the study decoder
ignores the block"; "a crisp stick is not a remembered bond". *Beat:* the same noise level means different things in
different charts.

**E5.3 The erasure clock, measured then painted · 95 s · lens `chart`, lever `t` (hand-over).** Measured t½ values
arrive on a bare number line, each with its estimator chip, then the lanes paint (u1-force 04) with their
training-share bars: Cartesian; internal at unit spread (C3, said once); whitened two-block (C1); ordered internal
(first order, dashed) with the block-alone floor (solid, ≥); an inset with EigenFold (own clock, ratios only) and
Chroma-style; the "same word, four windows" card; the fog rule and the mnemonic "inside the training, into the fog"
(§3.3), with "against the internal floor of 0.01" said aloud wherever note 27's convention is meant. *Numbers:*
best-estimator lower bounds [M n27 §5], bond/angle/torsion/Rg/long-range/contacts/end-to-end/slowest TIC: Cartesian
0.0004/0.05/0.08/0.47/0.44/0.38/0.45/0.36; internal 0.26/0.35/0.35/**0.27–0.28**/0.24/0.23/0.18/**0.49** (the TIC
exception drawn); C1 0.26/0.33/0.29/0.35/0.33/0.31/0.31/0.46; ordered, first order [D lab 11-18]: bonds 0.26, 3 apart
0.31, 7–10 apart 0.27, ≥ 11 apart 0.29, end-to-end 0.24, torsions 0.34, Rg 0.44, closest 0.025; block alone Rg ≥ 0.42,
long-range ≥ 0.37, contacts ≥ 0.33 [M lab 2026-11-16 precedents]; the wall glyph (rose bar) of both internal lanes sits
left of the waterline, "a wall sharper than ≈ 0.1 Å needs a level near 0.001 or below" [M #1101, extrapolated]; inset
Chroma-style bonds 0.0032, matched covariance 0.0049, EigenFold five decades [M #1099]; training share Cartesian bonds
≈ 0.04% (from its 10⁻⁵ floor), C3 bonds ≈ 25% [D]; C3 Rg four windows 0.19 / 0.23 / **0.27–0.28** / 0.30 [g4 §4.2].
Labels: Cartesian "order without range (bonds in 0.04% of draws)"; internal "range without order; anti-order:
end-to-end 0.18 < torsions 0.35"; ordered "**range, and order for size**", narrated once: "the two vectors order size and
the mode lengths; chain distances stay inside the band, erased with the bonds and before the torsions at first order
(0.24–0.31; block alone, long-range ≥ 0.37); their measured windows are not yet computed (A19b)". Estimator-card line:
"windows ranked the trained models by size error but understated the differences, and did not predict how fast global
structure is learned (#1026)" [M n27 §7]. Payoff of E3.8's plant: "Euclid was arbitrary, not useless: its steep
spectrum is an order". *Hand-over (lever `t` as a probe):* "find the noise where the molecule knows its size but has
lost its bonds": Cartesian ≈ 0.0004–0.47, ordered ≈ 0.26–0.44, C3 almost none (0.26–0.28). *Beat:* range and order are
two requirements; no earlier chart had both, and the new one has order for size.

**E5.4 The handle, turned back · 95 s · lever `γ` (the E2.3 control).** BBA's 27 mode variances as log bars and their
curves fanning on the rail; the same γ control compresses the fan; a dose–response panel with dots only at the four
trained exponents ("measured at four exponents only"), seed-spread whiskers from the nearest two-seed rows and the
caption "one seed each; only the end points differ by the effect rule"; a second dot series, the reverse dose: "remove
order from Cartesian: pure modes at γ = 0.5 raised Rg W1 0.09 → 0.28 Å while bonds improved 0.013 → 0.0046 Å" [M
#1057, one seed, 50k]. Then E2's ★ image returns and is recaptioned **"on BBA: range without order; ALDP5 cannot test
order, and its stiff modes kept the gain"**; the "?" pin becomes REVISED ON BBA (10-24 goal → 11-12/14 diagnosis), and
E3.9's greyed Hypothesis A lights: "the order hypothesis lost (11-05) on a molecule that could not test it"; a 25 s coda
with the (γ, v) pad as a lens. *Computed:* R18 (λ^{1−γ}, unit-mean, library units); R1. *Numbers:* ratio 1,428 from
the file, narrated "≈ 1.4×10³" (n27: 1,423); at γ = 0/0.25/0.5/0.75/1 ratios 1,428/232/38/6.1/1, first/last t½
0.52/0.028, 0.50/0.065, 0.45/0.13, 0.37/0.20, 0.26/0.26 [D R18, unit mean, from the file; n27 §3 prints 0.53 at γ = 0];
trained [M #1057; 50k; one seed per γ except γ = 1; 20k molecules; floor 0.016 Å]: Rg W1 0.499/0.514, 0.187, 0.120,
0.081 Å at γ = 1, 0.5, 0.25, 0, while TIC JS 0.107/0.106, 0.083, 0.081, 0.086 (floor 0.037) and torsion error 9.7/10.4,
6.5, 7.1, 9.1° do not follow; whiskers 0.03–0.09 Å (two-seed spreads of the 4- and 8-vector blocks; Cartesian +
distances 0.036 Å) [M #1069]; annotation "the windows ranked these arms correctly but understated the differences:
γ 0 → 0.5 shrinks the Rg window by 10% and multiplies the error by 2.3" [M n27 §7; #1057]; "unit variance in every
direction is what erases the order; the local whitening itself does not" [S #1057]; pad: v = 1/0.3/0.1/0.03 → t½
0.26/0.16/0.09/0.05 [D #1057], corners "order, no range", "range, no order" (= C1) and "**bonds and size**" (γ = 0,
v = 1; torsion 9.1°, TIC JS 0.086 vs Cartesian + distances 0.046): "torsions have no channel here; the final design is
internal plus two loud modes". *Live:* authored 1 → 0; "turn γ back: where does the size error stop improving?"
*Beat:* on BBA, October's fix is exactly what erased the order: size follows the exponent, populations and torsions do
not, and taking order away from Cartesian breaks its size.

**E5.5 The fold dissolves before its joints · 90 s · lever `t` (the playhead; narrated), lens `m`.** A 28-bead chain
(3.8 Å, 110°): one torsion jiggles 6.6° and far beads swing; all 25 torsions noised through phase pairs at the playhead:
torsions stay readable while end-to-end smears; a 27×27 heat map of R(b_k·b_l) fades off the diagonal; a Fog Bench of
internal coordinates (12 forward ghosts) at t = 0.05 and 0.2; coda: torsion-only equilibration. Stamp "uniform
torsions (law P0), exact [D·model]". *Computed:* R19: exact transfer matrices, gated against an O(N⁴) brute-force oracle
to 10⁻⁹ (a numpy fixture written once), with `exact-uniform.json` (a 20,000-query Monte Carlo) only as a sanity check
within 0.015; r(t) = E[(I₁(k)/I₀(k))²], k = αc_φ|y|/σ², by Rice quadrature; Prop. 1 R = Σc_j r^j/Σc_j. *Numbers
[D·model, c_φ = √2]:* one torsion 0.940/0.716/0.530 at t = 0.1/0.2/0.26; b·b(+4) 0.868/0.470/0.245; b·b(+12)
0.625/0.083/0.010; b·b(+26) 0.352/0.004/0.000; end-to-end² 0.711/0.253/0.125; Rg² 0.835/0.439/0.255; effective degree
≈ ⅔(m − 1) (approximation); a 6.6° blur at t = 0.05 moves beads on a 5–10 Å arm by 0.58–1.16 Å [D r7 E8]. *Coda [M
#1073, 4,000 molecules], badged REPAIR · FITTED:* moving only the 25 torsions takes C3's Rg W1 0.48/0.46 → 0.05/0.12 Å
with bond and angle errors unchanged, "under the model plus a 34-term packing correction fitted to noised data at
t = 0.05; seed 1 misses its rule"; chip "repair at sampling, not a learned chart": #1065 (equilibrium + hard core)
reached 0.07/0.08 Å at about twice C3's local errors, #1090 (torsion-only with a stabilised size weight, fitted to data)
0.053/0.093 Å at plain-C3 local accuracy on 20,000 molecules [M r6 §4.5]; line: "global structure is carried by the
torsions, as degrees of freedom; the chart route was preferred because it learns this instead of fitting it".
*Guard:* "independent uniform torsions; BBA's are correlated". *Beat:* internal coordinates erase the fold before the
turns that build it (Prop. 1). Split point E5a/E5b.

**E5.6 ★ Two loud modes · 105 s · lever `block`, lens `halos`; stamp MECHANISM UNTESTED.** The design card (53 stiff
channels at unit population spread, 25 torsion phase pairs, two teal 3-vectors c₀a₁, c₀a₂ at natural spread: 109
features) with one [D·model] line: "an ideal chain given only the |a₁| marginal: Rg W1 0.90 → 0.066 Å; the mode lengths
are within 0.008–0.063 nats of a Gaussian, standardized Rg 0.30 nats: the block needs only a simple marginal" [n30 §5];
mode shapes on the real molecule as teal arrow fields with Rouse cosines (mode 1 changes sign between beads 15 and 16, computed from `collective_modes.json` in the MVP build; an earlier draft said 13 and 14,
hairpin vs rest; mode 2 ends vs middle); the loudness ruler against the torsion line 2.0. Then the gesture in three
beats: (i) an **estimator chip**: the C3 lane as E5.3 painted it (measured, Rg 0.27–0.28) cross-fades to its
first-order version (dashed, Rg 0.19), "the same estimator at both ends of the morph"; (ii) `block` none → +2 loud
morphs that first-order lane into the ordered lane [D, dashed]; (iii) after a held beat, the plane's dot moves [M] on
E4.2's panel type and lands inside the registered corner on seed 3 (0.091) and just outside on seed 2 (0.117). An
on-screen line that stays with the talk clip: "order or correction? #1137 separates them (declared 11-18, not run)".
Lens `halos`: chain-model ghost bundles, chart A (internal) agreeing on torsions but scattered in size vs chart B (+
natural block) inside one Rg ring, stamped "collapsed law P (Rg shrunk 0.9 Å), importance-weighted [D·model]", ESS
shown (below t = 0.05 the scene states Prop. 2's limit). *Numbers:* mean squares 15.0, 6.0 vs ≈ 1 per channel (library
units, c₀ = 0.157 Å⁻¹); length variances 6.9, 2.5, 0.9, 0.6 vs 2.0, "only two modes are louder than a torsion"; Rouse
overlaps 0.99, 0.99 (0.91, 0.92) [M lab 2026-11-18]; mode 1 88% aligned with hairpin–rest [M #1057, via r6]; lane
morph [D, dashed]: Rg 0.19 → 0.44, ≥ 11 apart 0.16 → 0.29, end-to-end 0.14 → 0.24, block-alone Rg ≥ 0.42 [M]; plane
dot (190,350 updates, 100k molecules): C3 (bond 0.00032/0.00034, Rg 0.455/0.418) → ordered (0.00038/0.00033,
0.117/0.091) [M #1088]; the 50k sweep stays in E5.8; halos: Rg² readability at t = 0.26 0.18 (A) vs 0.84 (B), at 0.35
0.07 vs 0.67 [D·model A18, law P]; chip NEW · UNREVIEWED [M #1141]: Rouse directions keep generation quality (Rg W1
seed means 0.101 vs 0.097 for #1141's own fitted rerun, not the registered 0.117/0.091; seeds and decoder stamped) but
give a somewhat more compact force field (0.35/0.32 vs 0.26/0.22 Å). *Live:* hand-over: "toggle the block: which
glyphs move, and which stay?" Must M6 [H]. *Beat:* unit spread for the detail, two loud modes for the size; which
effect does the work is #1137's question. *Climax:* one gesture moves a lane and, a beat later, the dot crosses into the
registered corner on one seed of two.

**E5.7 Who corrects whom · 60 s · lever `L²`.** The joint image y_B = g(y_A) with slope L, a noise blob, n ∝ (−L, 1)
and its two projections drawn as bars labelled "share of predictable noise this block must correct": internal
L²/(1+L²), block 1/(1+L²) (no balance: a heavier pan would read as the winner). *Computed:* R20. *Numbers:*
L²/(1+L²) = 0.50/0.94/0.98 at L² = 1/16/63 [D n30 Prop. 2]; chain-model gains [D·model] internal 0.43–0.55 / 0.85–1.03
/ 0.90–1.09, block 0.43–0.56 / 0.06–0.09 / 0.02–0.03; BBA constraint directions in the internal block 27/44/68%
(whitened), 74/87/96% (natural), 92/97/99% (twice) [M bba_charts, 1,200 frames; stored as block shares, shown as
1 − x]; per example at t = 0.01/0.1/0.2 the collapse is worth 0.0005/0.025/0.049, the constraint 0.92/0.80/0.38
[D·model]; pill [H] "#1137, declared 11-18, not run: a whitened block keeps about half the gain (supports if 0.2 ≤ f ≤
0.8 on both seeds)". *Live:* "whiten the block: who is corrected now?" *Beat:* the louder block leaves the correction
to the quieter one [D]; whether that, or order, fixes size is #1137's test [H].

**E5.8 Why two · 50 s · lens `n_v`.** A stacked bar of size-response vs mean-square shares; a block-size curve with
derived input channels and constraint counts as small annotations; narration: "one to eight vectors tie on size; two is
the smallest block that met every global threshold on two seeds; the local cost grows from four". *Numbers:* size
response 83% (mode 1), 96% (modes 1–2) vs mean-square shares 56/22/11/5% [D n30 §5]; Rg W1 at n_v =
0/1/2/4/8/16/27: 0.477/0.161/0.105/0.136/0.152/0.325/0.399 Å [M #1057/#1069 Table 3 seed means; one seed at 1, 16,
27], **n_v = 1–8 tie by the pre-fixed rule; local cost grows from 4**; derived input channels 0/1/3/14/92/696/3,303
and noised features 103 + 3n_v; constraint directions 0/1/3/9/21/45/78 [D]; two vectors are the smallest block meeting
every global threshold on two seeds (seeds differ 0.001 Å; 4 and 8 vectors by 0.03 and 0.09 Å) [M #1069]; one vector is
not force-ready (no volume term); partial order: loudness ratios 3.4 and 1.26 < 16 [D g3 C2]; "note 30 (11-18)
**explained** why two, after the sweep (11-13)". *Beat:* only two modes are louder than a torsion; more vectors add
constraints and channels, not order.

**E5.9 Information moves, it is not created · 40 s · lens `chart`.** Collapse-signal densities ½β(t)S(t)/σ_t² for the
internal chart and the natural block, equal shaded areas; link to Retention 09 (not re-derived); a three-part card: a
chart changes the **profile** of the training signal (these areas), its **share** of the reducible loss [H n27 §6] and
the **access**, which function of the noisy channels the network must compute (a 2×128 MLP reads 0.39 of bond-width
information from flat ALDP5 coordinates vs 0.99 from spring features [M #929]; pair-distance inputs move Cartesian bonds
54–58× [M #985, #1025]) [D n30 §3]. *Numbers:* collapse KL 0.0766 nats; integrated signals 0.0779 (A), 0.0784 (B),
within 3%; block channels hold 0.88 of B's area (whitened 0.48, twice 0.91), mostly at t ≈ 0.35–0.6 [D·model A18];
"no chart buys statistical efficiency" [D n30 §3], which closes E1.4's plant: wδ's expected data-efficiency win was
never tested and is answered in general here ("learning speed, not data efficiency"); chip: a 0.43 Å mean-Rg shift
costs ≈ 0.02 nats, so the loss barely sees size [D n27 §6]. *Beat:* a chart moves where the training signal sits and
how hard it is to read; it creates none.

**E5.10 Readable is not learnable · 35 s.** The skeleton-and-arrows chart, its lane, and a scatter of torsion window
vs torsion error. *Numbers:* measured CPU windows bonds 0.25, torsions 0.20, size 0.69 [M #1068]; trained (1 seed, 50k)
Rg 0.077 Å, bonds at floor, torsion error 7.9°, refuted by its own rule, 4–18% unrebuildable [M #1068]; scatter
Cartesian (0.08, 7.1°), C3 (0.35, 0.85–0.95°), ordered (0.34 first order, dashed, 0.9–1.1°), skeleton (0.20, 7.9°) [M].
Must M7 [H]. *Beat:* readability is necessary, not sufficient; a relation is learned as poorly as Cartesian local
structure.

**E5.11 Decided first · 80 s.** One held-out molecule fills the stage; 12 genuine forward VP paths in the ordered chart
(exact OU transitions generated in JS from the 109 clean features with the seeded RNG, every 40th step of a geometric
1,000-step grid) played backward, captioned "**bridge ensemble**: exact reverse paths conditioned to end at this
molecule"; the arrows are half decided by t ≈ 0.5 (mode 1 ≈ 56%, mode 2 ≈ 34% [D first order]), the chain's torsions
decide at 0.35–0.26, glyphs crystallize right to left; **the declared window 0.26–0.1 (n30 prediction 2, declared before
#1133) is drawn before the measured curve arrives**, then the whole measured R² curve, so its gradual rise is visible;
measured gauges beside the bench. *Computed:* A17 clean features; A26. *Numbers [M #1133, s2/s3]:* R² of chain |a₁| on
block |a₁| 0.13 (t = 0.6), 0.29/0.26 (0.45), 0.37/0.38 (0.35), 0.43/0.40 (0.26), 0.44/0.42 (0.2), **0.63/0.60
(0.13)**, 0.91 (0.05), 0.97 (0.01); mean |a₁| block/chain 21/59 Å at 0.6, 40/41 Å at 0.13, captioned "posterior means;
at high noise the two estimates differ by construction"; compact molecules already with their final χ sign 0.55 →
0.65–0.69 → 0.88 at t = 0.6/0.45/0.13. Caption on the reading: "the measured crossing (R² ≥ 0.5 first at t = 0.13) fell
inside the declared window; a coarse reading on 3 of 8 levels, which the lab card calls 'a declared reading, not a
test'". *Beat:* generation decides size first; the chain's size follows the block at t ≈ 0.13, inside the window the
theory declared.

**E5.12 One spectrum, two pulls · 50 s.** The card [S g3 §5.1]: stiffness removal wants a flat spectrum [S Ahamed 2026,
EDM, EqualSNR], order a steep one [S Biroli; Wang & Vastola; EigenFold]; the design flattens the stiff block and keeps
two modes loud. Precedent (Ahamed, R-DM, EigenFold, Chroma, GUD, semantic-first, latent forcing) vs new (the measured
range/order decomposition, the training-free probe on molecular observables, anti-order and the constraint split, the
immersion-volume read-out), plus a **cautions** column [S g3 §5.2–5.5]: images may not need the hierarchy (Falck's
EqualSNR); inverse amplification is a rival account of why full whitening fails (Ahamed G.9; g3 judges order the more
plausible account on BBA, where the linear whitening gain is only ≈ 4); early decisions cannot be corrected later
(Everaert); coarse-first is incomplete for hierarchical data (Sclocchi); internal-coordinate generators are known to
clash (Köhler et al. 2023: 33–36% of raw BBA samples). "No model found noising internal coordinates with redundant
collective channels: an absence of evidence, not a proof" [S n30 §8]. "What must the noise keep readable?" → "Does it
*hold*, and what can it *not supply*?" Stamp RANGE, AND ORDER FOR SIZE (working hypothesis, 11-14 → 11-18).

### E6 · What the Block Cannot Supply (11:45; levers `volume`, `t*`)

**E6.0 Station Q6 · 20 s.** 11-14 → open; the line beyond is dashed. Four open boxes from note 30 §7, "what two loud
vectors cannot supply": the wall, global handedness, the kinematics for free, sharp soft forces at the read-out level
[D n30 §7]; the episode fills them (E6.6, E6.9, E6.8, E6.6).

**E6.1 How to read a result · 45 s.** One number, Rg W1 = 0.117 / 0.091 Å, its parts lighting in turn: ordered
internal; 190,350 updates (10%) on the budget clock; fresh seeds 2/3; N = 100,000; held-out floor 0.006 Å;
`real-budget-study.md` (11-15); then the effect rule (a gap counts only if it exceeds the largest two-seed difference)
[D #1069]; then three cautions on the card: an untrained internal model already has the data's mean size, through
self-overlaps (Rg W1 ≈ 0.55 Å at update 0) [M #1071 monitors]; residual errors sit in the width of the size
distribution and in the contact map (#1128); held-out frames are near-duplicates in time (a random split), so the 0.006
Å floor is optimistic [S real-budget-study limits]. Beside E1's scoreboard, the method thread: "change one ingredient at
a time (10-22) → a pre-declared protocol (10-26) → registered budget, fresh seeds, effect rule (11-14) → lab cards
naming the single change (11-16)". *Beat:* a number is its whole label.

**E6.2 Both scales at once · 85 s · lenses `budget`, `angle`.** The two-halves plane on E4.2's axes (log bond W1 with
its thermal-width axis vs log Rg W1), 100k panels only, seed dumbbells, family markers, floor box (bond 0.0002 Å, Rg
0.006 Å), the registered corner; lens `angle` switches x to angle W1, the project's saved plane (#1127; floor 0.05°);
an arrow C3 → ordered; E1's scoreboard inset "this time: fresh seeds, registered criteria, effect rule". The ScoreMD
point is labelled "ScoreMD recipe, our re-run at 10% budget". *Numbers [M #1088; 190,350; 100k]:* bond / angle / Rg W1:
ordered 0.00038/0.00033 Å, 0.20/0.19°, 0.117/0.091 Å; C3 0.00032/0.00034, 0.21/0.18°, 0.455/0.418; Cartesian +
distances 0.0078/0.0093, 1.58/1.49°, 0.071/0.077; covariance base 0.0053/0.0065, 1.36/1.30°, 0.073/0.077; ScoreMD
re-run 0.042/0.042, 1.58/1.74°, 0.157/0.532; wδ 0.027/0.034, 1.73/2.12°, 0.062/0.072; whitening 0.56/0.62,
19.6/23.9°, 0.67/0.58. The effect-rule table, every row: against the ScoreMD re-run, bonds ×119, angles ×8.5,
populations ×2.0 better, size and contacts tie (its seeds 0.157 vs 0.532); against Cartesian + distances, bonds ×24 and
angles ×7.8 better, size (0.104 vs 0.074 Å) and contacts worse, populations tie; against the covariance base, bonds
×17 and angles ×6.8 better, size (0.104 vs 0.075 Å) and contacts worse, populations tie; against wδ, bonds ×86, angles
×9.8, populations ×1.5 better, size (0.104 vs 0.067 Å) and contacts worse; against C3, size ×4.2 and contacts ×1.8
better, the rest tied [M real-budget-study]. Registered Rg ≤ 0.11: met by seed 3 (0.091), **missed by seed 2 (0.117,
by 0.007 Å)** [M #1071]. Budget lens, every family that has stops: ordered 0.117/0.091 (10%) → 0.120/0.096 (20%) →
0.111 (100%, open PR #1104, s2); C3 0.455/0.418 → 0.468/0.432 → 0.455; Cartesian + distances 0.071/0.077 at 10%; the
ScoreMD re-run 0.157/0.532 at 10% (its 790,350 interim panel in E6.3); full-schedule Cartesian, whitening and ScoreMD
panels pending; in a separate 50k inset (20k molecules, floor 0.016 Å): ordered 0.106/0.110 (s0/s1, #1069
plain-sampler control), C3 0.493/0.462, Cartesian + distances 0.109/0.073 with bonds 0.0125/0.0133 Å, improving to
0.0078/0.0093 Å by 10%; learning rate 99.8/97.6/90.8/3.3% of peak [D g4 §3.13]; seeds differ between stops. Caption:
"the ordered model's size stopped improving after 50k updates; the Cartesian models are still improving; whether the
gap closes is open". Chip: "the five full-schedule models and the late-repulsion settings were chosen after seeing
results (an amendment recorded before any continued update)". *Beat:* the only model near the best on both scales,
behind on size by the rule; the block changes where training ends, and the baselines have not finished training.

**E6.3 A score needs its count · 45 s · lens `count dial`.** Log–log PMF floor vs N (paper definition) with the
heuristic 2K/N; model points at their counts with budget chips and "≠" between budgets; each model's **excess over the
floor at its own count** as a bar; the paper's Table 1 on its own vertical at 1,300,156 samples; the every-or-none rule
on screen: no model is moved to another count. *Numbers:* floors 0.56/0.18/0.080/0.039/0.025 at
20k/50k/100k/200k/325,039, N × floor ≈ 8,000 from 100k on [M open PR #1138]; at 100k (floor 0.080): ordered 0.097 at
1,903,500 updates (excess 0.017) and 0.109/0.109 at 380,700 (0.029); covariance base 0.096 (0.016) and C3 0.113 (0.033)
at 1,903,500, one seed each; at 190,350 Cartesian 0.116/0.113 (0.036/0.033), wδ 0.161/0.198 (0.081/0.118), ScoreMD
re-run 0.202/0.315 (0.122/0.235) [M #1138; excess D]; the ScoreMD re-run's 790,350 interim panel, 20k molecules: 0.638
against a 0.56 floor (excess 0.078, seed 0) [M #1138 via g1 §4.9]; paper: Diffusion iid 0.034, Two For One simulation
1.624, Both 0.234 iid / 0.254 simulation [S]; the paper's floor at 1.3M samples ≈ 0.006 "extrapolated from N × floor"
[D], so its Diffusion excess ≈ 0.028 [D, extrapolated]; caption "ScoreMD recipe, our re-run: the unregularised
Diffusion arm at 10% budget, read at 0.01 or 10⁻³, still improving; its full-schedule panel pending". *Beat:* a PMF
means nothing without its count and budget, and our ScoreMD baseline is not the published model.

**E6.4 The phantom spring · 85 s · lever `volume`, lens `dimension`.** A correction pill "11-15: the loud block adds
nothing in simulation → 11-16: a wrong volume term (#1100); status page stale"; E2.7's footnote flies in; a polar toy
(2,000 seeded walkers of a 2-D Gaussian under 1/r − r with the term, −r without) with histograms against Rayleigh and
half-normal; then BBA: the loud map rotates with the molecule (an immersion) but the read-out used the invariant
formula; the data's Rg histogram reweighted by the volume ratio; a spring from the centroid labelled "Stein tilt along
Rg ≈ 0.6 kT/Å inward (#1100)"; A21's scatter of the wrong-minus-right log-volume against Rg annotated "slope 0.32 per Å
(#1103; 0.18 from the inertia factor)": two measures of one spurious force, kept apart. *Computed:* R22; A21 (≥ 20k
frames). *Numbers:* mean radius 1.253 → 0.798 (−36%) in 2-D, 1.596 → 0.798 (−50%) in 3-D [D·model g1 §3.6];
reweighting predicts mean Rg 9.58 vs 10.66 Å, simulations ended at 9.6–9.7 [M #1100]; #1103's frames give 10.81 → 9.64
Å (separate row); brute-force log-volumes 17.808/16.924 vs 17.815/16.934 from ½ log det(J_cᵀJ_c), where the invariant
formula predicts +1.87 instead of −0.88 [D #1103]; with the immersion term the 100 ps size error falls 0.98 → 0.24 Å
(seed 3, 512 paths), on its drift with the 0.167 Å floor [M]; one line on the learned score itself: on noised inputs
it passes a stationarity test from level 0.05 up, and at 0.01 C3 has a learned compaction bias (Rg residual −4.6 ± 0.5
and −2.8 ± 0.5) where the loud models do not (+1.9 ± 0.8, +2.3 ± 0.7), "direct evidence that the loud block also helps
forces" [M #1100]. *Live:* right / missing / wrong-formula; "switch the term: where does the size settle?" Must M8.
*Beat:* a wrong volume term is indistinguishable from an attraction; three quarters of the 100 ps size error (seed 3)
was one formula.

**E6.5 Best in the study, still drifting · 80 s · lenses `model`, `anatomy`.** First the force-field leaderboard of the
registered study [M #1088: 256 walkers from data, Langevin 325 K, 100 ps, pooled 50–100 ps, two declared read-out
levels]: size error of the internal family 0.78–1.22 Å (C3 0.84/1.22; older distance inputs 0.78/1.13; loud 1.14/1.18,
hatched "wrong volume term, superseded 11-16"), with bonds at the panel floor (0.003–0.004 Å) and angles 1.9–2.9° at the
coarser level; covariance base 1.85/2.59 Å (angles 4.5–4.9°); Cartesian + distances 7.9/4.7 Å; the ScoreMD re-run
3.2/3.5 Å (angles 5.3–10.8°); springs 0.89/1.92 Å; wδ 1.77/1.99 Å with angles 17–18°; whitening 2.1/2.8 Å; reference
"256 data molecules: size 0.14 Å (5–95%: 0.08–0.35), not a pass mark". Then, in layers on size error vs simulated time
(0–300 ps): the corrected seed 3, the 2,048-path panels, the full-schedule point, floor bands. *Numbers [M]:* corrected
s3 at t* = 0.05 0.24/0.30 Å [#1100]; #1130 (2,048 paths) 0.158–0.277 / 0.229–0.492 / 0.396–0.642 Å at 100/200/300 ps,
mean Rg −0.21 to −0.41 Å, size error ×1.7–2.9; full schedule 0.118 Å at 100 ps (one seed, open PR #1104); floors 0.167
Å (512 paths), 0.084 Å (2,048); the same checkpoint reads 0.337 (512) vs 0.277 (2,048); open #1136, #1113. Lens
`anatomy` [M #1089]: "a compaction, not a swelling: bonds change by < 0.007 Å, the 1–4 distance by up to −0.54 Å,
long-range distances by −1.4 to −3.2 Å; half a population shift towards compact states, half shrinking within states;
overlaps appear within the first picosecond; no levelling off within 500 ps". *Guards:* "a 100 ps number is a point on
a drift; BBA folds on microseconds"; "walkers started from training frames mostly keep their start set (#895, Sprint
11)". Must M10 (✗). *Beat:* the study's best force fields are internal-coordinate ones, and they still compact; the
fixes lower the curve, none flattens it.

**E6.6 Blur versus wall · 70 s · lever `t*` (E2.7's handle).** The torsion-blur lever arm; a contact-distance histogram
convolved with the n_v-dependent blur against 3.5 Å; wall z and Rg z vs level, per seed; the soft-force information
curve ∝ σ². *Numbers:* torsion blur 1.70° at 0.01, 6.63° at 0.05 [D R27]; correction pill "first estimate: contacts
readable near t ≈ 0.005 (#1100 diagnosis; r6 §3.12) → #1101 trained down to 0.003: no wall at any level down to 0.005;
the wall error falls only slowly with blur (z 15, 13, 11.5, 9 at 0.85, 0.38, 0.22, 0.13 Å), so a wall sharper than
≈ 0.1 Å would need a level near 0.001 or below, where the size balance cannot be read" [M lab 2026-11-16 low-noise
continuation]; wall z before → after, per seed and level: at 0.005 9.9 → 9.6 (s2), 9.1 → 8.9 (s3); at 0.05 14.8 → 15.1
(s2), 15.0 → 15.0 (s3) [M #1101]; contact blur at 0.01 for n_v = 0/1/2/4/8: 0.37/0.32/0.22/0.16/0.15 Å, at 0.05 1.46 →
0.85 Å (n_v = 2) [D, first order on data, #1101's training-free follow-up]; more loud modes do not help (n_v = 27: wall z
14 at 0.05, size balance worse) [M #1101]; closest non-neighbour loudness 0.003 → t½ ≈ 0.013 (0.025 with +2) [D n30
§7]; overlaps 14.5/15.3% of generated molecules [M #1071] and 18–21% in simulation at 0.05 with the correct term [M
#1100], against 0.004–0.01% of data molecules [M #1089, #1100]; soft-force information ∝ σ², error ∝ 1/σ [D n30 §7];
chip [S g3]: "internal-coordinate generators are known to clash (Köhler et al. 2023: 33–36% on BBA)". *Live:*
t* ∈ [0.001, 0.05]: "find a level with a sharp wall and a readable size balance" (none). Must M9 [H]. *Beat:* no
trained level has produced a wall so far (#1101) [M]; note 30 predicts that more range alone will not [H, open]; for
now the wall is supplied.

**E6.7 ★ Two charts, two weak spots [H] · 80 s.** One BBA frame mirrored at t = 0.01 on the Fog Bench: left ordered
internal (forward ghosts of the closest pairs cross 3.5 Å and flash rose), right wδ (clean contacts; its bonds blur by
≈ 0.05 Å, under 1 px at 17 px/Å, so both panels share the ×N thermal-width magnifier); both carry moon fills from
first-order readability at the playhead: wδ bonds R ≈ 0.63, ordered closest contact R ≈ 0.81 (internal-only decode
0.60) [D †, first order], so the pair reads as "different weak features near the floor", not mirror images; their
ladders on the rail; E1.4's Odometer returns between them (a finite step vs an infinite feature distance); the rose
thread from Q1; a scene-wide **HYPOTHESIS** badge. *Computed:* R25 forward ghosts; A17 wδ decodes plus 12 wδ forward
ghosts at t = 0.01; A20 must reproduce g2's column before this ships. *Numbers, one metric per comparison:* ordered
first order bonds 0.26, closest 0.025 [D lab 11-18]; wδ bonds 0.014, closest 0.120, floor blur 0.049 vs 0.36 Å [D † g2
§4.8]; registered budget: wδ best size 0.062/0.072 Å, bonds 0.027/0.034 Å (86× ordered's) [M #1088]; severe clashes
(< 1 Å): wδ 0%/0% vs ordered 0.60/0.66% [M #1088]; overlaps (< 3.5 Å): ordered 14.5/15.3% [M #1071], wδ "not measured
at this budget"; first-chunk severe collisions per 10⁵: Cartesian 682 [M], wδ 0 †, internal 1,186 † (reader
dossiers); chips "wδ force fields reach 17–18° angle errors" [M #1088] and "the barrier partly lives in the decoder";
the stated test [H g2 §7]: noise real molecules at 0.01 in wδ's chart and decode, expecting ≈ 0.05 Å contact blur and
≈ 0% overlaps vs 0.32 Å and 2.3% for internal (proposed, not run). Card: "The barrier that killed (planarity, Episode
1) may be the barrier that saves (collisions)." *Climax:* the two panels with the odometer between them.

**E6.8 Use the six discarded numbers · 80 s · lenses `drag`, `core`.** First the kinematics box: generated blocks and
the chains rebuilt from the internal block disagree by 0.42/0.43 Å per bead at the median, against 0.15/0.16 Å for real
molecules noised to 0.01 and denoised by the model (its own floor), with a heavy tail (99th percentile 2.89/2.62 Å); the
10% most mismatched molecules carry 35.8/39.7% overlaps against 14.5/15.3% overall; the mismatch still shrinks at the
end of training (median ratio 0.744 at update 0 → 0.043/0.047 at 190,350) [M #1102]: "the block knows the size; use it
in the rebuild". Then a toy: an 8-bead planar chain described by its bend angles and one loud end-to-end vector;
dragging the vector, a least-squares rebuild with or without a hard core moves the chain. Then BBA bars for three
rebuilds (internal-only, joint, joint + core) of noised data vectors at t = 0.01, labelled as such (or #1119 endpoints
if they are ordered-internal completions); then the fitted wall and size term, introduced by the trap that explains why
it is fitted against simulations: "a 155-term correction fitted on data alone passes the stationarity test (rms z 7–15
→ 0.7–0.8) yet worsens size in simulation; making the data stationary is a local condition: necessary, not sufficient"
[M #1100]. *Computed:* R23, LM **cold-started from a fixed guess with fixed iterations** every frame. *Numbers [M
#1105/#1107]:* overlaps and Rg W1: internal-only 14.5/15.3%, 0.117/0.091; joint 19.3/20.1%, 0.077/0.064; joint + 3.6 Å
core 0.0/0.0%, 0.083/0.070 Å, local accuracy unchanged; core without block 0.131/0.105; full schedule 0%, 0.105 Å
[#1104]; late repulsion (a sampler change) clashes 0.60/0.66% → 0.02/0.02% [#1088]; wall alone mean Rg 11.13–11.31 Å;
wall + size term (−0.16 per Å in the log-density), badged **REPAIR · FITTED: 27 coefficients, fitted on seed 3 against
simulations, applied to seed 2**: overlaps 18.4/21.3% → 0%, size 0.175/0.267 → 0.173/0.263 Å (s2/s3) [#1109]; linear
response 0.16 × 4.8 Å² ≈ 0.8 Å [D]; "two errors that cancel" [H]; guard "0% by construction (3.6 Å core vs 3.5 Å
test)". *Beat:* cheap repairs work today, one rebuild with a hard core and one fitted correction; the model still does
not learn the wall.

**E6.9 The handedness detective · 30 s.** Three mode vectors as a frame: mirrored, |a₁|, |a₂|, a₁·a₂ stay and χ flips;
P(χ > 0) by Rg bin; the mid-size deficit as **separate bars**. *Computed:* R24. *Numbers [M #1133–#1140]:* data
0.169/0.268/0.371/0.470, ordered (library rerun s2, #1115) 0.196/0.269/0.421/0.485; note 30's prediction 3 not borne out
as stated: the torsions carry handedness, compact molecules match (0.256/0.247 vs 0.249); the 9.5–11 Å deficit
(0.04–0.06) appears in every internal-coordinate model, C3 included, and is 0.015 in Cartesian; it is reproduced
−1/+4% by local statistics, 28/32% by single long-range distances, 11/10% by arm side, 61/59% by a coarse quarter-chain
dihedral, each on its own (they overlap). Must M11 (partial). *Beat:* every internal-coordinate model, C3 included,
under-learns the relative twist of the two halves; internal coordinates carry it only at high order, and two vectors
carry no handedness at all.

**E6.10 The Ledger · 85 s.** The completed Journey Map with every thread; the List of Musts with its badges and column
caption (§1.5): M1–M9 ticked, M9 "only by repair", M10 ✗, M11 partial, M12 and M13 "?"; E6.0's four boxes filled
(wall: supplied, not learned; handedness: partial; kinematics: repaired by the joint rebuild; soft forces: open); open
tests with declared rules (#1137; #1136/#1113; the wall; Chignolin, whose transfer check read dummy frames and is
excluded); the final Clock with every lane. **Why optimism:** (1) a large, reproducible local gain on fresh seeds at a
registered budget: bonds 17–120× and angles 6.8–10× below every Cartesian-family model and the ScoreMD re-run,
populations tied with the best Cartesian models; size and contacts behind Cartesian + distances, the covariance base and
wδ by the effect rule (0.104 vs 0.067–0.075 Å) [M #1088]; (2) mechanisms: note 30 **explained** why two vectors (after
the sweep), and its declared window for when the chain follows the block contained the measured crossing (a coarse
reading, by the lab's own account), with one declared prediction not borne out as stated (handedness) and two open
(#1137; the wall); (3) the best force fields of the study are internal-coordinate ones, and three quarters of the loud
model's 100 ps size error was one formula [M #1088, #1100]; (4) every remaining defect sits where note 30 says the
block cannot help, shown after the fact and therefore paired with the declared tests; (5) repairs without retraining
hold on two seeds and at the full schedule: a joint rebuild with a 3.6 Å hard core (0% overlaps by construction) and
one fitted 27-coefficient correction [M #1105/#1107/#1109, #1104]. **Not established:** equilibrium populations of a
microsecond folder; transfer (on BBA the fitted directions coincide with Rouse modes, which were seen while drafting
#1124; the scale c₀ and the internal whitening still need target data; Rouse directions cost force-field size, #1141
unreviewed); the full schedule beyond one seed; full-schedule baselines; a converged ScoreMD comparison; the
paper-protocol simulation PMF; predicting outcomes from windows before training (the study's Q4, untested).
**Promise ledger, one line:** of the July pitch, a geometry-aware generator exists (no longer on wδ's shape space); the
Fokker–Planck regularizer was never trained and is now a reserve remedy for the drift (about four times the cost per
update). **Next, one line:** the guide programme (#1117–#1123, including a schedule-only test of timing vs information,
#1120), a third loud vector for handedness, transfer (#1124). *Beat:* "Each step looked promising for a measured reason
and was left for a measured reason. The last one has not been left yet."

### X1 · The Erasure Clock (`explorables/erasure-clock`)

**Chart builder:** Cartesian, C1, C3, ordered (+n_v at loudness L), +2 whitened, +8 at loudness 15, skeleton, wδ
(first order †, ellipsoids only), Chroma-style, matched covariance, EigenFold (own clock, ratios); sliders γ, v, n_v, L,
t_min ∈ {10⁻⁵, 10⁻³, 0.003, 0.01}. The n_v × L sliders snap to a precomputed grid (A30), because first-order loudness
needs an 84×84 pseudo-inverse per frame over ≈ 1,200 frames, about 1 Gflop per move; the (γ, v) pad stays closed form.
**Rail** with training-share bars, mirror toggle (lever-driven) and estimator lens. **Probe calculator:** λ or a width
with a unit preset → r(t), t½, decision bar, training share, information bump R(1 − R). **(γ, v) pad** with the
corrected corners. **Fog Bench pane:** 64 held-out frames plus the ALDP5 mean; Cartesian, C3, ordered, wδ ellipsoids
s²(JᵀJ)⁺ precomputed per molecule as per-bead 3×3 blocks (A14c) and scaled by s²; forward ghosts, best linear guess;
posterior ghosts in Cartesian only, for the 8 A17b molecules. **Challenges**, feature-explicit and all first order, so
every lane is judged by one estimator; a Node test asserts each verdict on every lane before X1 ships, and a challenge
whose verdicts differ from the narrated ones is reworded, not the lane: "range: bonds, angles and torsions each get ≥ 1%
of training draws"; "order for size: Rg and the mode lengths are erased after every local feature"; "find every chart
that passes both" (expected: ordered internal and skeleton-and-arrows; then "one of them trained badly, torsions 7.9°:
why?", readable ≠ learnable, E5.10); "order for chain geometry: Kendall τ ≥ 0.8 over the seven-feature list" (expected
to pass only +8 at loudness 15, which training rejected for its local cost); "the wall: which chart resolves a 0.1 Å
wall inside its training?" (none of the internal family); "why can no correlated Cartesian noise give bonds a window?";
a trap card [M n27 §5; #1069]: "C1's measured Rg window (0.35) is wider than C3's (0.27–0.28), yet their trained size
errors are alike (0.51 vs 0.48 Å at 50k): windows rank, they do not guarantee". Calibration lamps (the < 50 ms subset);
deep links.

### X2 · The Bench (`explorables/bench`)

One panel per rig with free controls, **calibration lamps** (a < 50 ms subset of each rig's §5 tests, re-run on load;
the full suites, including R19's oracle, R29's chains and R12's Nelder–Mead check, stay in Node) and a **provenance
drawer**. Beyond the video rigs it holds what the videos cut: the **force reader** (force scale c with the Stein
needle; step Δt with two-bead inflation 1/√(1 − Δt k), limit 6.0–9.1×10⁻⁴ Å², labelled "toy limit vs measured failure":
the learned arm blew up at 4×10⁻⁴ through stiffer coupled directions or a rough force [M #768]; the BBA read-out
trade-off 1.60 … 0.69 Å at t = 0.005 … 0.05 vs blur floor 0.045 … 0.117 Å [M #1089, "loud rows carry the volume-term
bug"]; the bias–variance vise: soft forces 4.4× more accurate with stretched noise, 500 frames matching 10,000 flat
frames [M r2 §3.22]); three analytic toys, n21 Prop. 10's two basins (R32), n19 §2's density vs force (R33) and n28 §3's
line vs helix (R34); the Rg² decomposition (R28) with both pair counts (153 bead pairs, 136 bond pairs ≥ 11 apart); the
lag dial with the αL barcode and both lag metrics (step and transition, R14); the chain with hinge drag; and **walkers
from β** replaying sim-beta traces with the statistic named (#768's 83% αR vs the 89% last-record share), "not
equilibrated". Unseeded play is allowed; nothing is exported.

### X3 · The Ledger (`explorables/ledger`)

A DOM page over `ledger.json` and A25. The Journey Map with the swimlane; station cards (question, +/→, verdict, dates,
PRs, a "watch" deep link `?video=<id>&t=<s>`). **+/→:** Q1 "flat clouds and collisions infinitely far; φψ-JS 0.12 vs
0.26 (Sprint 5)" → "23% unphysical, 340–600× cost, tied with the strongest flat baseline once fixed" [S talk], with the
measured within-campaign numbers beside the quote (flat 0.1012 after the vp_mean fix, wδ 0.1664, ScoreMD-native 0.0151
near its 0.0114 floor [M]); Q2 "three problems, one choice each" → "the synchronizing metric is curved"; Q3 "exact
kernel; bonds ≈ 100× sooner" → "no torsion or αL gain"; Q4 "BBA springs' bonds 52× better" → "no map got both halves";
Q5 "readability before training; size 0.51 → 0.08 Å along γ" → held; Q6 "bonds 17–120× better; size behind Cartesian
and wδ by the effect rule; populations tied" → open. **Spurs:** Riemannian flow matching (pilot JS 0.620 vs 0.199 [M
Sprint 8]), manifold FP regularizer (never trained), conservative wδ head (refuted twice), PGA atlas (out of scope),
objective search, factorized densities ("likelihood is not a structural readout"; "complete what is local, learn what
is global"), skeleton map, static population-density flow (#946; ALDP5 JS 0.15 vs 0.011), intrinsic spring retraction
(#947; 2.4× cheaper than geodesics, 10.8× the angle error), Rao–Blackwell DSM (#931; variance cut 3.5–88× at t ≥ 0.1,
none at t ≤ 0.02), learned retention maps (#933; fast early, all good maps converge), maximum-sine references (#986;
BBA size 3× better, angles 33× worse). **Promise ledger:** the July deliverables and their fates (the FP regularizer
moved from M2 to M3/M4 on 10-06 and was never trained in a generative model; Riemannian flow matching lost ≈ 3× in its
only pilot; the AK ablation and Chignolin never ran; the paper-protocol simulation PMF is unmeasured; FP consistency
kept as a reserve remedy for the drift, ranked lower on 11-15). **The mirror thread:** wδ's quotient includes
reflections; O(3) alignment reflected 19.52% of ALDP5 frames (signed JS 0.1774 with zero shape error); "sample, don't
argmax"; αL is a real basin, not a mirror artefact; the contract moved to SO(3); it rhymes with E6.9. **Claims ledger**
with statuses and Must badges; **corrections timeline** (transpose, vp_mean, TF32, XLA, Gaussianization, #1025 → #1055,
contacts near 0.005 → no wall down to 0.005 (#1101), "the loud block adds nothing in simulation" → the wrong volume
term, immersion volume, C3 Rg 0.23 → 0.27–0.28, n25's bound, Retention's 63%, the E1 bug cards cut from the video);
**hypotheses**, with the every-or-none rule applied (the inference "excess over the floor stays constant with count"
[H] shown for every model at once: ordered ≈ 0.02 and the ScoreMD re-run ≈ 0.13–0.24 at the paper's count); **open
measurements** (the 0.6 kT/Å Stein tilt vs the 0.32 per Å log-volume slope; wδ's overlap share at the registered
budget); **what next** (#1117–#1123, #1120, a third loud vector, #1124); **number table**, **compare guard** (shows the
mismatch instead of a ratio), floor dial, **κ rails**, budgets.

---

## 5. Computation catalogue

Rigs live in `src/model/thesis/` (DOM-free), tests in `tests/thesis/*.test.mjs` (the `package.json` glob becomes
`tests/**/*.test.mjs`, which recurses), thresholds fixed before the first run; costs for laptop JS at 60 fps. X2's
lamps run a < 50 ms subset of each row's tests; the full suites stay in Node.

| ID | Module | Maths | Algorithm, cost | Tests (source) |
|---|---|---|---|---|
| R1 | `vp.js` | β = 0.1 + 19.9t, B = 0.1t + 9.95t², α = e^{−B/2}, σ = √(1−α²), s = σ/α, ℓ = ln(α²/σ²), t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9 | O(1) | α(0.01) = 0.999003; σ(0.01) = 0.044643; s(0.05) = 0.17414; α(1) = 0.006572; ℓ(0.259) = 0 ± 0.01; t½(1) = 0.2590, t½(15.5) = 0.526, t½(0.011) = 0.0285, t½(0.003) = 0.0130, t½(4.2×10⁻⁵) = 0.00040 [g4 §3.3] |
| R2 | `meter.js` | r = α²λ/(α²λ+σ²); width r²; info −½ ln(1−r); window SNR ∈ [0.25/λ, 4/λ]; decision span per feature class | O(1) | t½(0.01/0.1/10/100) = 0.0270/0.0930/0.486/0.676 [r4 E1]; linear window ln 16 = 2.77; width probes 2.35; von Mises (c_φ = 1.504) 2.43 [v-numbers] |
| R3 | `aldp5.js` | λ_k = (w_k/0.9418)²; γ family λ^{1−γ}; ghosts; Tweedie; blur F_t = rF₀; training share | closed form; EM walkers 500 × 9 Float32 | the E2.1–E2.7 values (t½, r, inflation, shares, γ = 0.142, spreads, Tweedie 0.388/0.463, r(0.03) = 0.9881); simulated variance 1/r ± 3% [g1 §3.1]; 5% bond-width floor at t_min ≈ 4–6×10⁻⁴ |
| R4 | `loss.js` | GD on a quadratic with curvatures c_j m_i; loss-blindness excess; likelihood bound | GD live; integrals at load | excess 0.0093 ± 10% at 1.23; σ ≈ w share ≈ 6%; 17.5/11.4 [n21; LESSONS D18] |
| R5 | `energy.js` (existing) | `configuration`, `springEnergy` | — | 1.75 Å; 0.40 Å; 3.27 eV; 0.105/0.044 eV; torsion-path midpoint 0.098 eV [a1 §6.1; v-numbers] |
| R6 | `ruler.js` | Kabsch; d_th = √(ΔqᵀΣ⁻¹Δq); Spearman ρ and Kendall τ | O(n) | A3 pairs 0.036/4.0, 0.243/1.46; ρ = 0.50 ± 0.02; inverted share printed |
| R7 | `wdelta.js` | F(X); H = A + δB analytic; horizontal projector; X_e | Jacobi, ≈ 50k flops/frame | odometer 3.2489 … 17.0407; condition 42.14 … 6.004×10⁷; rigid residual < 10⁻¹⁰; 0.004165/0.000392; Å→nm to 10⁻¹²; C = 46/51 [r1] |
| R8 | `geodesic.js` | ẍᵢ = ẋᵢ²/xᵢ, exact xᵢ(0)e^{sẋᵢ/xᵢ}; Verlet | O(S) | error < 10⁻⁴ at S = 1024, x₁ = 0.5; monotone in x₁; straight feature line to 10⁻¹² |
| R9 | `scaleclock.js` | A(t) = 1 − ½βτ, τ = (1/9)(1 − e^{−B}) | O(1) | A(0.10/0.55/0.91/1) = 0.9880/0.4150/−0.0114/−0.1111; a(1) = 0.006572 [r1 E3] |
| R10 | `chord.js` | argmin_Z ‖F(Z) − [(1−t)F(X) + tF(Y)]‖² | Gauss–Newton, 41 t at load | dimer 6.3246 Å; chord identity to 10⁻¹² [g2] |
| R11 | `springs.js` | G = J_dᵀWJ_d + k⊥I; F = (W^{1/2}d, √k⊥x) | dense, small | `energy.js`: 6 zeros; 0.0264 … 53.99 eV/Å²; κ_H = 2,048 [g4 §3.2] |
| R12 | `cone.js` | cone F(b); c, σ_r, σ⊥, 𝒦_tan, R; deficit; ρ; bound 𝒦ρ²/12; four-point ε (n22 Thm 4); real-size cap θ = 1/R | closed form; 2,000-quad mesh (≈ 1 ms) | c = 0.102960; σ_r = 0.026584, σ⊥ = 0.258199 Å; 𝒦_tan = 0.029316 per squared width; R = 5.8095; θ = 0.5: 𝒦ρ² = 0.2473, deficit 0.0411; θ = 1/R = 0.172: deficit 0.0049; ε table to 3 digits (Nelder–Mead cross-check, Node only); aspect within 3% |
| R13 | `vp.js` | α/σ; 1/σ² | O(1) | 22.38 at 0.01; 999.5 at 10⁻⁵; 501.8 [n28; r6 §2.1] |
| R14 | `lag.js` | t_k = 1/(D₀λ_k); step metric G = λ/(1 − e^{−τ/t_k}) with half erasure 1/(1 − e^{−τ/t_k}); transition metric with 2τ (X2 toggle) | O(1) | t_k 0.0078/0.0312/0.5/3.125 ps; step G(1 ps) 1600/400/28.9/14.6, half 1.000/1.000/1.157/3.652; transition 1600/400/25.47/8.46, half 1.000/1.000/1.019/2.115 [n25 Prop. 2; v-numbers] |
| R15 | `gaussianize.js` | bimodal density; x ↦ Φ⁻¹(F(x)) by ν; noised score; 9-parameter RBF + linear SGD | simulation `uses: ['ν']` | score linear-fit R² ≥ 0.999 at ν = 1; bit-reproducible |
| R16 | `banana.js` | φ = (x₁ − x₂²/9, x₂); KL ½ ln(det C_X/det A); latent score | closed form | KL 0.4739/1.7483/1.3013; ψ 2.000/40.5/1.125 [g2 E2] |
| R17 | `bondsim.js` | δ ← (1 − 2Δtk)δ + √(4Δt)ζ | 2,000 walkers | inflation 1.060/1.095 (k 1,100/1,660, Δt 10⁻⁴); diverges for Δt > 1/k [g1 §3.9] |
| R18 | `spectrum.js` | library units c₀²λ; γ dial λ^{1−γ}/mean; size response; shares | O(27) | 15.031 … 0.0105, Σ = 27; c₀ = 0.15706; ratio 1,428 ± 1 (within 0.5% of 1,423); t½ **0.5231/0.0278 (library units)**; 0.8296/0.9615 [v-numbers N2; Fe-F11] |
| R19 | `chain.js` | Rice-quadrature r(t); transfer matrices T(r) = a⊗a + (r/2)(b⊗b + c⊗c); two-copy automaton (end-to-end², Rg²); von Mises ghosts; chart-B sampler; lever arm; O(N⁴) brute-force oracle (test only) | automaton ≈ 5 ms at load, ≈ 2 ms/frame; oracle a few s per level in Node, or a numpy fixture (≈ 20 s per level) | **automaton = oracle to 10⁻⁹ at all 14 levels**; `exact-uniform.json` only as a sanity check (≤ 0.015, or 3 SE); r(c_φ = √2) 0.9401/0.7159/0.5297 at 0.1/0.2/0.26; c_φ = 1.504 0.947/0.746/0.565; E5.5 table; R(b·b(+2)) = r [Fe-F1] |
| R20 | `split.js` | shares L²/(1+L²), 1/(1+L²), drawn as bars; counts | O(1) | 0.500/0.9412/0.9844; channels 1, 3, 14, 92, 696, 3,303; constraints 3, 9, 21, 45, 78 |
| R21 | `infoarea.js` | ½β/σ²·S, trapezoid | O(14) | 0.0779/0.0784 vs 0.0766 (3%); 0.878/0.476/0.914 |
| R22 | `radial.js` | EM for r, force (d−1)/r − r or −r | 2,000 walkers | 1.2533, 0.7979, 1.5958 within 2% [g1 §3.6] |
| R23 | `rebuild.js` | ‖w⊙(φ(x) − y)‖² + λΣ relu(r_c − d_ij)² | LM, **cold start, 40 iterations per frame** | residual → 0; min distance ≥ r_c − 0.05 at λ = 100; jumped = played frames |
| R24 | `chirality.js` | χ = a₁·(a₂×a₃)/(\|a₁\|\|a₂\|\|a₃\|) | O(1) | sign flips under mirror; P(χ > 0) = 0.353 on 1.3M frames |
| R25 | `charts.js` | Cartesian /6.252; C3 (log bonds, log tan(θ/2), L⁻¹(q − μ) at unit population spread, c_φ(cos, sin)); ordered ⊕ c₀a_p (c₀ = 0.157064; w_p = HᵀV_p built in JS); wδ with the study's 379 features; NeRF; Wiener mean (A14b); ellipsoids per molecule | ≈ 0.3 ms/molecule | **library parity < 10⁻⁵ Å**; round trip < 10⁻¹⁰ Å; C3 channel variance ≈ 1 |
| R26 | `modes.js` | w_p = HᵀV_p; Rouse √(2/N) cos(πq(i + ½)/N) | O(N²) | overlaps 0.991/0.985/0.914/0.915; mode 1 changes sign between beads 15 and 16 (1-based; corrected from 13/14 by the MVP's test) |
| R27 | `noise-ruler.js` | σ strings; torsion blur s/c_φ | O(1) | 0.279 Å at 0.01 (BBA Cartesian); 1.70°/6.63°/12.96° |
| R28 | `rg2.js` (X2) | Rg² = ΣW_kl b_k·b_l; bead-pair form N⁻²Σ_{i<j}\|x_i − x_j\|² | O(N²) | equals direct Rg² to 10⁻⁹; 153 bead pairs and 136 bond pairs ≥ 11 apart |
| R29 | `chainmc.js` | Metropolis on 25 torsions, frozen bonds and angles, #1025 bases (construction recovered from #1025's code) | live animation only; equilibrium statistics offline in numpy (256 chains × 1,200 sweeps ≈ 30 s per base) | logged 10.34/5.41/10.71 Å reproduced within ±0.3, else the programme's own values are shown [D·model] beside the logged ones [Fe-F6] |
| R30 | `evidence.js` | effect rule; budget clock lr(u); E[PMF] ≈ 2K/N; excess over the floor; training share (t½ − t_min)/(1 − t_min); Markov sd (1 − p)√(2/n); force ratios v/(α²v+σ²), α²v/(α²v+σ²) | O(1) | 0.030 > 0.026; 99.8/97.6/90.8/3.3%; epochs 39/150/300/1,499; 0.225/0.229/0.223; 0.256/0.248 at v = 0.01, t = 0.05; shares 0.04% (t½ 0.0004, t_min 10⁻⁵) and 25.2% (0.259, 0.01); excess 0.017 (0.097 − 0.080) [g4] |
| R31 | `rail.js` (draw) | x(t) = 140 + 1340(13.8145 − ℓ)/18.753 | O(1) | anchors §3.3 ± 1 px |
| R32 | `basins.js` (X2, E3.7) | two-basin roughness r² − 1 under flat noise (n21 Prop. 10) | closed form | 624; 397/149/11 at σ² = 0.01/0.04/0.2 Å² [r2 §3.15] |
| R33 | `densityforce.js` (X2, E1.8b) | KL vs squared force error of a mean error in a stiff and a soft mode (n19 §2) | closed form | KL 0.0027 vs 0.0966; force error² 1 vs 0.25 [r2 §3.3–3.4] |
| R34 | `helix.js` (X2, E5.1) | posterior variance of a line and a helix embedding with equal metric (n28 §3) | quadrature | 0.0099 vs 0.496/0.500 [r2 §3.18] |

---

## 6. Data asset catalogue

Scripts in `scripts/data/*.py`: plain numpy, `python -I`, LOCAL read-only, and never `import riemanniangenerativemd`
from LOCAL's editable install: its `.pth` puts `LOCAL/src` on `sys.path`, that checkout is on branch
`supervisor-metric-comparison` with uncommitted changes, and `-I` does not stop `.pth` processing. **Library parity**
comes from a read-only snapshot, `git -C LOCAL archive c099347a | tar -x -C ANIM/.cache/rg-c099347a` (never `git
worktree add`, which writes `LOCAL/.git`); the fixture script prepends that `src` to `sys.path`, asserts
`riemanniangenerativemd.__file__` lies inside it and runs under the ML `.venv` (jax 0.10.0). `c099347a` (origin/main
2026-11-19, includes #1141) differs from the range-order run's `2d9711e8` only by `geometry/mode_handedness.py`, and a
test confirms its encoders reproduce that run's JSON (c_φ = 1.5044, c₀ = 0.15706). The library runs there once to
write fixtures (C3/ordered features and decodes, immersion volumes, wδ features for 10 frames, the warp's directions,
the X1 loudness grid) into `scripts/data/fixtures/`, against which every port is tested. The ephemeral scratchpad
scripts (`SP/g2/checks/ak_cartesian_pca.py`'s DCD reader, `SP/g2/checks/wdelta_windows_v2.py`) are copied into
`scripts/data/` in phase 0; the open-PR bodies (#1104, #1113, #1136, #1137, #1138, #1141) are fetched once with `gh`
and archived under `scripts/data/sources/` with their fetch date. Every BBA script checks `train_sha256` and
`heldout_sha256` from `data.json`; `data/deshawresearch/bba-*.h5` and `data/processed/bba_*.npy` (the struck 07-27
placement, identical to ScoreMD's dummy) and `data/deshawresearch/chignolin*` are never read. Header `{schema, id,
created, script, script_sha256, inputs:[{path, sha256}], rg_commit, badge, notes, data}`; arrays `{dtype, scale, shape,
b64}` (int16/uint16, never float16). Shared assets in `src/data/thesis/`, per-episode in `src/videos/<id>/data/`. The
bundle is one IIFE (no code splitting, no top-level await), so "lazy" means lazy base64 decode: every byte ships in the
page, and each piece stays ≤ 700 kB.

| ID | File (where) | Source (LOCAL unless stated) | Outline → JSON `data` shape | Size | Test |
|---|---|---|---|---|---|
| A1 | `aldp5-modes.json` (shared) | `rg-main/…/force-field-simulation/evidence.json`; mdshare `…3x250ns…npz` `arr_1` | every 12th frame of traj 1 (≈ 20.8k, evenly spaced; the first 20k frames are up to 26% off), `[:, [1,3,4,6,8]]*10`, iterated Kabsch, 15×15 covariance → `{widths[9], vectors[9][15], mean[5][3], stein:{arm:{seed:[9], level}}, step:{arm:{h:ratio}}}` | 6 kB | widths within 2% of `mode_std_A` |
| A2 | `aldp5-frames.json` (E1, E2) | bgmol `aldp.npy`; mdshare traj 1 | → `{atoms22[22][3], elements[22], beads5: int16[2000][15]}` | 60 kB | C–H ≈ 1.09 Å |
| A3 | `aldp5-ruler-pairs.json` (E1) | mdshare traj 0 | αR, every 50th frame; Σ_q; 60,000 pairs → `{sigma_q[9][9], pairA[2][5][3], pairB[2][5][3], rmsd[2], dth[2], spearman, kendall, inverted_share}` | 6 kB | 0.036/4.0, 0.243/1.46, ρ 0.50 |
| A4 | `aldp5-planarity.json` (E1) | `data/processed/aldp5_train.npy`, `aldp5v_train.npy`, all 800k frames | batched 9×9 eigvalsh → `{edges[61], n5[60], n6[60], phantom[60], worst, median_logdet, worst_logdet}` | 3 kB | logged worst condition 1.55×10⁶ / 4.2×10³ reproduced |
| A5 | `aldp5-race.json` (E3) | `runs/feature-space-evaluation-2026-10-26/remote/full/*_s0_step*_samples.npz` + evidence | → `{arms[5], steps[10], rama: uint16[5][10][36×36], bond1: uint16[5][10][64], scores}` | 180 kB | W1/σ within 5% of protocol |
| A6 | `aldp5-force.json` (E2, E3) | force-field and supervisor-metric evidence JSONs | → `{stein:{arm:{seed:[9], level}}, dist200k:{…}, diagonal:{map:{iid:[2], sim:[2]}}}` | 15 kB | §7 values; read level per arm present |
| A7 | `aldp5-beta.json` (X2) | `runs/force-field-simulation-2026-10-26/sim-beta/*_trace.npz` | → `{arms, phi/psi: int8[arm][201][150], shares[15][201][3]}` | 320 kB | statistic named |
| A8 | `aldp5-barcode.json` (E3, X2) | mdshare, 3 trajectories | ±20° hysteresis with the IUPAC dihedral sign pinned by a test (the flipped sign gives "96.8%") → `{traj:[{visits:[[start,len]], pop, dwell}], acf:{lags[60], phi[60], bond[60]}}` | 12 kB | 37 visits; 3.24/1.65/4.11%; 219/111/278 ps |
| A9 | `aldp5-lag.json` (E3) | n25 §3; learned-stiffness-warp.md; learned-warp-lag-sweep.md | transcribed twice, diffed → `{saturation:[{coord, lag, var_frac}], kappa_step:[…], sweep:[{arm, js100, js20k, valid}]}` | 4 kB | diff clean |
| A9b | `aldp5-warp.json` (E3.8) | `runs/learned-stiffness-warp-2026-10-24/attempt-*/aldp5_s*_warp.npz` through `load_warp` in the snapshot | → `{dirs[4][15], cov_flat[15][15], cov_warp[15][15]}` | 4 kB | κ_step 2.99–3.04 reproduced, else E3.8 draws [I] ellipses |
| A10 | `ak-chord.json` (E1) | `…/diepeveen2024/data/molecular_dynamics/4ake/{dims0001_fit-core.dcd, adk4ake.psf}` (outside LOCAL) | numpy DCD reader (copied into the repo) → `{chord_rmsd[102], frames: int16[2][214][3], chords: int16[2][214][3], scree[10]}`; no wδ row | 15 kB | 1.784 Å; PC1 0.8934 † |
| A11 | `bba-modes.json` (shared) | `runs/range-order-mechanisms-20261118b/collective_modes.json` (+ `c0`, `rouse` from `bba_charts.json`) | → `{c0, ms_A2[27], ms_lib[27], V[27][27], rouse[4]}`; w[27][28] built in JS | 25 kB | Σ ms_lib = 27; ratio 1,428 |
| A12 | `bba-charts.json` (shared) | same run, `bba_charts.json` | copy → `{t_half:{chart:{feature}}, loudness, blur, constraint_shares, additive_R2}`; constraint shares are stored as block shares | 30 kB | 1 − x = 74/87/96% |
| A13 | `bba-chain-spec.json` (shared) | same run, `chain_spec.json` | → `{mean[53], chol_lower[1431], phase_scale}` | 14 kB | c_φ = 1.5044; parity |
| A14 | `bba-frames.json` (shared) | `data/deshawresearch-bba-ca28/heldout.npy` | 8 stratified + 64 for X1 → `{mol: int16[72][28][3], rg[72], tags[72]}` | 25 kB | Rg recomputed |
| A14b | `bba-chart-moments.json` (E5, X1) | training frames | per-chart feature means and covariances for the Wiener mean (Cartesian 84, C3 103, ordered 109) | ≈ 120 kB | Wiener mean = posterior mean on a Gaussian test set |
| A14c | `bba-ellipsoids.json` (X1) | A14 + snapshot Jacobians | per-bead 3×3 blocks of (JᵀJ)⁺ for 72 molecules × 4 charts | ≈ 100 kB | blocks match the full pseudo-inverse |
| A15 | `bba-window.json` (E4) | `train.npy`, `heldout.npy`, `membership.npz` (trajectory boundary 1,114,545) | one contiguous compact (< 9 Å) → extended (> 13 Å) → compact window, no stride; TIC by `configs/benchmarks/bba-ca28-tica.json` at `c099347a` (378 Cα distances in nm + 25 pseudo-torsions, (f − mean)·coef) → `{xyz: int16[600][28][3], rg[600], tic[600][2]}` | 110 kB | TIC parity with the study; lag-1 Rg ACF printed |
| A16 | `bba-population.json` (E4) | all training frames | → `{rg_hist[190], tic_counts[100][100], quantiles, folded, B[27][27], W[27][27]}`; folded = ≥ 60% native contacts (contact list from the study code) | 70 kB | 10.60 Å; 8.37/9.89/15.30; 0.194 |
| A17 | `bba-noised.json` (P0, E5, E6) | A11, A13, A14 | per chart (Cartesian, C3, ordered, wδ with the study's 379 features): clean features of the 8 molecules; wδ LM decodes from classical MDS at 31 levels; 12 wδ forward-ghost decodes at t = 0.01 (E6.7); no stored paths or ε (JS draws exact OU transitions with the seeded RNG) → `{levels[31], clean:{chart:[]}, wdelta: int16[8][31][28][3], wdelta_ghosts: int16[12][28][3]}` | ≈ 160 kB | encoders match fixtures |
| A17b | `bba-posterior.json` (E5, X1) | all training frames | Cartesian posterior for the 8 A14 molecules × 12 levels, float64, ±1 µs exclusion (≈ 0.01 s per level) → `{levels[12], ess[8][12], means[8][12][3], ghosts: int16[8][12][24][28][3], weights[8][12][24]}` | ≈ 100 kB | ESS printed; ghosts only where ESS ≥ 40 |
| A17c (opt.) | `bba-cart-readability.json` (X1) | all training frames | measured Cartesian R_h(t) curves from 256–1,000 queries (≈ 2 min with GEMM) | 10 kB | n27 §5 Cartesian t½ reproduced |
| A18 | `chain-model.json` (E5) | same run, `exact-uniform.json`, `signal-*.json` | copy → `{exact:{t:{obs:R}}, signal:{arm:{t:{…}}, summary}, eta, kappa, c}`, laws P0 and P labelled | 30 kB | KL 0.0766; 0.0779/0.0784; R_rg² 0.183/0.838 at 0.26 |
| A19 | `bba-windows.json` (shared) | n27 §5; lab 11-16 (#1099); lab 11-18; #1025; #1026; #1101; g2 §4.8 (†); #1068 | → `[{chart, feature, t_half, estimator, bound, share, status, source}]` | 10 kB | g4 §4.2 strings; C3 Rg "0.27–0.28"; shares from R30 |
| A19b (opt.) | `bba-ordered-windows.json` (E5.3, X1) | n27 §5's probe (PR #1055) run in the snapshot on a laptop CPU | best-estimator windows of the ordered chart for end-to-end and long-range distances | 2 kB | required before any order claim beyond size; absent, those glyphs stay first order and dashed |
| A20 | `wdelta-firstorder.json` (E6, X1) | 1,200 held-out + 50k training frames | numpy port of `bba_charts.py` (script copied into the repo; 379 features as A17) → `{feature: {t_half, blur, R01}}` | 1 kB | bonds 0.014, closest 0.120, Rg 0.689; **E6.7 waits on it** |
| A21 | `bba-volume.json` (E6) | ≥ 20,000 frames | ½ log det(J_cᵀJ_c) − invariant factor (numpy from `immersion_volume.py`, finite differences, 81×81 slogdet) → histograms of Rg and Δlog vol, slope | 40 kB | reweighted mean in [9.5, 9.7] Å; parity 17.808/16.924; slope ≈ 0.32 per Å |
| A22 | `ledger.json` (shared) | `.local/leaderboard/cache/main/{runs,metrics}.parquet` (11-18 23:06, system pyarrow); docs; lab READMEs; archived PR bodies | two passes, diffed → `[{id, value, unit, badge, def, system, data, budget, seeds, N, floor, source, canon, status, open_pr, declared_before}]` | 70 kB | §7 canon; every `ev()` resolves; ≈ 400–500 logged values curated (budgeted, §9) |
| A23 | `era1-scoreboard.json` (E1, X3) | sprint 1/5/7/8/9/10 summaries, `headtohead.md`, #513 note, #528/#529/#603/#679/#687 | → `[{sprint, campaign, epoch, arm, n, N, valid, value, sd, metric, source}]` | 5 kB | no cross-campaign pairs |
| A24 | `floors.json` (E6, X3) | #1138 body (archived); ALDP5 floors from mdshare | → `{metric:{N:[], floor:[]}}` | 8 kB | N × floor ≈ 8,000 from 100k on |
| A25 | `logbook.json` (X3, E·0) | reports; git log | → `{stations[6], spurs[], threads[], claims[], corrections[], declared[], musts[13]}` | 60 kB | dates match the log |
| A26 | `reverse-gauges.json` (E5) | #1133–#1140 | transcribed rows `{key, value, unit, badge, source}` | 3 kB | §7 |
| A27 | `forcefield.json` (E6) | #1088 simulation table; #1089; #1100; #1101; #1102; #1104; #1109; #1130 | transcribed rows | 6 kB | §7 |
| A28 | `scoremd-tables.json` (E2, E6) | ScoreMD Tables 1, 11, 12, 15 via g1; #1138 including the 790,350 interim panel | transcribed rows | 3 kB | §7 |
| A29 (opt.) | `rb1119.json` (E4, E6) | `runs/bba-reverse-completion-20261118/` | only after reading #1119's note → `{levels, radius:{arm:[]}, endpoints}` | 20 kB | meaning confirmed |
| A30 | `x1-loudness-grid.json` (X1) | `bba_charts.py` in the snapshot (≈ 22 s per 6 charts, ≈ 3 min in all) | first-order t½ per feature for every built-in chart and n_v ∈ {0, 1, 2, 4, 8, 16, 27} × a loudness grid | 30 kB | the n_v = 0 and 2 points reproduce A12 |
| A-REQ-1 (opt., LISE) | panels | `runs/s12-bba-study-20261114/` | first 512 molecules per stored panel → `int16[512][28][3]` per model; also wδ's < 3.5 Å overlap share | 1.6 MB | enrichment only |

Total ≈ 1.7 MB committed (the largest pieces, E5, X1 and X2, carry ≈ 0.6, 0.5 and 0.4 MB, decoded lazily), plus the
optional 1.6 MB.

---

## 7. The number canon used on screen

The subset of g4 the programme uses. Each row is pinned by a Node test through `ledger.json`; the storyboards (§4)
carry the full value lists with their badges.

| Quantity (definition) | Canonical values on screen | Data, budget | Source |
|---|---|---|---|
| σ_t (dimensionless) and its units | 0.0446 at t = 0.01; 0.0446 Å manifold, 0.042 Å pilot floor, 0.279 Å BBA Cartesian; t½(1) = 0.259 | — | [D g4 §2.1, §3.3, §4.5] |
| Training share and range | share = (t½ − t_min)/(1 − t_min); in range at ≥ 1%; Cartesian bonds 0.04% (t_min 10⁻⁵), C3 bonds 25%; ALDP5 flat modes 0–18.8% vs 25.2% per unit channel | — | [D g4 §7 item 7; R30] |
| ALDP5 principal widths, flat t½ | 0.0252 … 0.6631 Å; 0.00483 … 0.196 | mdshare traj 1 | [M #768; D g1 §3.1] |
| κ (always subscripted) | κ_H 400 [I], 2,048 [D·model]; κ_Σ 100–200 (= κ_res of flat G within a basin), ≈ 920; κ_res 192/112/97 → 9.6/7.6/13.4, global 273/477, wδ 413; κ_train 1.9×10⁴/146/8.1; κ_step 184 → 2.99 (floor 1.55) | bgmol; mdshare (κ_step); toys | [n20; n21 §4.3; #753] |
| BBA Cartesian variance ratio | 1,428 from file, narrated ≈ 1.4×10³ (n27: 1,423) | DESRES | [M; n27 §3] |
| Bond SNR at the floor | < 1 in every convention (0.30–0.46 / 0.34–0.52 / 0.16–0.18) | bgmol | [D n21 §5.2] |
| Readable windows, best estimator (lower bounds) | Cartesian bond 0.0004, Rg 0.47; C3 bond 0.26, torsion 0.35, **Rg 0.27–0.28**, end-to-end 0.18, slowest TIC 0.49 | BBA | [M n27 §5] |
| First-order windows; block alone | ordered bonds 0.26, chain distances 0.24–0.31, torsions 0.34, Rg 0.44, closest 0.025; internal Rg 0.19, closest 0.013; block alone Rg ≥ 0.42, long-range ≥ 0.37, contacts ≥ 0.33; ordered end-to-end and long-range best-estimator windows not measured (A19b) | BBA | [D lab 11-18; M lab 11-16] |
| The wall | no wall at any level down to 0.005 after training to 0.003; wall z 9.9 → 9.6 (s2) and 9.1 → 8.9 (s3) at 0.005, 14.8 → 15.1 and 15.0 → 15.0 at 0.05; a wall sharper than ≈ 0.1 Å needs a level ≲ 0.001 | loud model, 190,350 + 50k | [M #1101] |
| αL | 37 visits; 3.24/1.65/4.11%; 96–139 effective samples; ±50% (0.4–7.0% around 3.2%); n25's 0.79–1.27 only struck | mdshare | [M n25, #779; g4 §4.3] |
| Era 1 and Sprint 10 (within campaign) | S1 0.117 / 0.479 / best flat 0.167; S5 (10k) 0.119 (77%) / 0.263, 0.268; S8 0.2846/0.2618 → 0.1012; ScoreMD-native 0.0151, floor 0.0114; Sprint 10: bond variance −38%/−86%, force MSE +5.9–8.2% (#529), +13.8–27.8% (#603) | ALDP | [M sprint summaries; r2 §1.1] |
| BBA first chunk (bond, Rg W1) | internal 0.000274, 0.521; Cartesian 0.415, 0.072; springs 0.320, 0.078; whitening 0.705, 0.497 | 190,350, s0, 100k | [M matched-results] |
| Budgets on one cosine | 50k 2.6%, 190,350 10%, 380,700 20%, 790,350 41.5%, 1,903,500 100% (open PR #1104, 1 seed) | — | [g4 §4.6] |
| Registered budget | ordered Rg 0.117/0.091 Å (seed 2 misses ≤ 0.11 by 0.007), bonds 0.00038/0.00033 Å; C3 0.455/0.418; by the effect rule behind Cartesian + distances, the covariance base and wδ on size (0.104 vs 0.067–0.075 Å) | 190,350, 100k | [M #1088, #1071] |
| Reverse dose | pure modes at γ = 0.5 on Cartesian: Rg W1 0.09 → 0.28 Å, bonds 0.013 → 0.0046 Å | 50k, 1 seed | [M #1057] |
| Paper-definition PMF and excess | 0.097 / 0.096 / 0.113 @1.9M (excess 0.017 / 0.016 / 0.033); 0.109/0.109 @380,700; ScoreMD re-run 0.202/0.315 @190,350 (excess 0.122/0.235), 0.638 vs floor 0.56 @790,350 (20k molecules); floor 0.080 @100k | 100k molecules | [M open PR #1138; D excess] |
| Chain model | torsion 0.940/0.716/0.530; Rg² 0.835/0.439/0.255 (law P0, exact); halos Rg² 0.18/0.84 at 0.26 (law P); split 0.50/0.94/0.98 | iid torsions | [D·model n30] |
| Loud modes | 15.0, 6.0 (library units); lengths 6.86/2.52 vs 2.00 (ratios 3.4/1.26); size response 83/96%; Rouse 0.99/0.99 | BBA | [M/D n30; lab 11-18] |
| Reverse path | R² 0.63/0.60 at t = 0.13 (0.37–0.44 already at 0.35–0.2); declared window 0.26–0.1 | s2/s3 | [M #1133; D n30] |
| Volume term | Stein tilt along Rg ≈ 0.6 kT/Å (#1100); log-volume slope 0.32 per Å (#1103); predicted mean Rg 9.58 vs 10.66 Å; 100 ps size error 0.98 → 0.24 Å (s3) | loud models | [M #1100, #1103] |
| Force-field leaderboard and drift | size error at 50–100 ps: C3 0.84/1.22, loud 1.14/1.18 (wrong term), covariance base 1.85/2.59, Cartesian + distances 7.9/4.7, ScoreMD re-run 3.2/3.5 Å; wδ angles 17–18°; 256 data molecules 0.14 Å; drift 0.158–0.277 / 0.229–0.492 / 0.396–0.642 Å at 100/200/300 ps; floors 0.167/0.084 | 190,350; 256–2,048 paths | [M #1088, #1130] |
| Kinematics | block–chain mismatch 0.42/0.43 Å per bead (model floor 0.15/0.16); 10% tail 35.8/39.7% overlaps | ordered, 190,350 | [M #1102] |
| ScoreMD paper | BBA 0.034 / 5.387; Two For One 1.624 (t = 0.005); Both 0.234 / 0.254; ALDP Two For One C–N 23.51× | 1.3M samples | [S via g1] |

---

## 8. Risks and honesty notes

### 8.1 What could mislead, and the guard

| Risk | Guard (where) |
|---|---|
| κ arrows across definitions | κ chips, "≠", X3 rails (E2, E3.8) |
| Mixed estimators | outline styles, estimator chips, the visible estimator switch (E5.6), canon 0.27–0.28 (E5.3); X1 judges every lane first order |
| Budget, seed, count mixing | budget chips drawn by `evText()`; separate 20k/100k panels and insets; excess over the floor at each model's own count (E4.2, E5.4, E6.2–E6.3) |
| Pixels read as information | opacity = readability, the shared ×N thermal-width magnifier, "a crisp stick is not a remembered bond" (P0.1, E5.2, E6.7) |
| Range read off the waterline | one training-share definition for rail, lanes, M3, T4 and X1 (§3.3; E2.3, E5.3) |
| An order label wider than its evidence | "range, and order for size"; A19b before any wider claim (E5.3, E5.6) |
| One gesture binding a derived lane to a trained result | the three-beat gesture, the estimator chip, the #1137 line inside the talk clip, MECHANISM UNTESTED (E5.6) |
| A rubric written by the design and scored on it | Must badges, the column caption, M10–M13 (§1.5, E6.10) |
| Extrapolating only the winners; an under-trained baseline | every-or-none rule; "ScoreMD recipe, our re-run at 10% budget" with its 790,350 point; "a converged ScoreMD comparison" under Not established (E6.2, E6.3, E6.10) |
| Budget asymmetry | the competitors' budget stops on the lens; "the Cartesian models are still improving" (E6.2) |
| Repairs read as learning | REPAIR · FITTED with coefficient count and fit target; "0% by construction" (E5.5, E6.8, E6.10) |
| Single-seed dose–responses read as curves | whiskers from two-seed rows; "only the end points differ by the effect rule" (E5.4, E5.8) |
| Metaphors that invert the lesson | shares as bars, not a balance (E5.7); ScoreMD's seesaw drawn for ALDP only (E2.7) |
| A one-sided story | the force-field leaderboard (E6.5), the reverse dose (E5.4), the cautions column (E5.12) |
| Hindsight linearization | dated swimlane; spurs; the first test of order shown losing (E3.9); the missed pre-registration shown (P0.3, E6.2) |
| Decodes, rescaled draws or bridges read as knowledge, paths or generation | captions; genuine paths only in E5.11; gauges "differ by construction" |
| Posterior ghosts where ESS is small | Cartesian or exact models only, ±1 µs exclusion, each level's ESS printed, none below 40 (E2.1, E5.1) |
| Toys read as molecules; reader values as results | [D·model], law stamps (P0 vs P), rig stamps, toy/molecule pairs; † and conditional wording; E6.7 held on A20 |
| Superseded results as current | SUPERSEDED overlay, correction pills, status.md flagged stale (E3.5, E3.9, E6.4, E6.6) |
| Short runs as equilibrium | "a point on a drift" with floors; M13 "?" (E6.5, E6.10) |
| Unequal ScoreMD comparisons | "native = the unregularised arm at 10%"; "a parallel, not a head-to-head"; the paper on its own vertical; no BBA balance point (E2.7, E6.3) |
| Two ALDP5 data sets; σ units | data stamps, never one axis; σ dimensionless first |
| Overclaimed optimism | "predicted" only with a declared record (`evText()` refuses otherwise); the unmet prediction shown; the coarse reading called coarse; "not established" (E5.11, E6.10) |
| Data provenance | dummy BBA struck; Chignolin excluded; 200 ps "documented"; held-out ≈ in-sample (E4.1, E6.1) |

### 8.2 Hypotheses (always [H], dashed)

The wδ barrier as the missing wall, with its test (E6.7); order vs correction (#1137, f ≈ ½), which also qualifies
E5.6's gesture; "order acts through who gets corrected" (E5.7); n30 prediction 4, that more range alone will not
produce a wall (E6.6, M9); the Musts M3 (range) and M6 (order) from n27 §7 and M7 ("a coordinate of its own") from one
refuted map; the share-of-reducible-loss criterion (E5.9); "reading early breaks the landscape" as the reading of
ScoreMD's BBA trade-off (E2.7); whether a flat chart's 1–8% basin error matters for learning (E3.3; n22: "should be
tested"); "networks learn low-order statistics first", anti-order worsening with chain length, soft forces inherited
across levels, and "excess over the floor stays constant with count" (X3 only, the last applied to every model); "two
errors that cancel" (E6.8); the best Sprint 1 flat arm hit by the vp_mean bug (E1.7); synchronized erasure as the cause
of fast torsions, shown struck (E3.9); Hypothesis A, never tested on a molecule that could test it (E3.9, E5.4).

### 8.3 Round-1 judges' findings and their fixes

F = fidelity, P = pedagogy, Fe = feasibility judge (round 1); proposals in brackets. This round's verifier findings are
in the change log.

| Finding | Fix (where) |
|---|---|
| PMF budgets mixed: 0.097/0.096/0.113 are 1.9M, 1 seed (F; d1–d5) | budget chips, "≠", ordered 0.109/0.109 @380,700 (E6.3) |
| Sprint 5 paired across campaigns (F; d3 d4 d5) | within-campaign pairs, validity, 2k lens (E1.7) |
| "Predicted the optimal block size" (F, P; d1 d3 d4) | "explained after the sweep"; only the takeover window "declared"; the unmet prediction shown (E5.8, E5.11, E6.9, E6.10) |
| Chain-model values tagged [M] (F, Fe; d1 d4) | [D·model] with law stamps (E5.5–E5.9) |
| "Springs failed outright"; "every model one half" (F; d1 d2 d4 d5) | springs kept size (0.078 Å), whitening got neither; title "No Map Got Both Halves" (E4.2) |
| K_tan in Å⁻² (F; d4 d5) | per squared thermal width (E3.3, R12) |
| Problem 3 read as "vector side" or "ångström" (F, P; d5 d3) | one resolution reading plus Prop. 8 (E2.5) |
| Validity of JS 0.117 at 100 updates (F; all) | "10% valid" (E3.9) |
| Number slips: 19.4, 5.41 as the model's value, "arrows correct at 0.5", bond readable "below 0.005", SNR "in every convention", "≥ 0.42" source, Rouse cited to #1129, spring constants as single values (F) | 19.3/20.1 (E6.8); 5.41 [D·model] beside 4.9 [M] (E4.4); "half decided by 0.5" (E5.11); bond length 0.003–0.004 (E2.3); per-convention SNR (E2.4); lab 11-16 (E5.3); lab 11-18 (E5.6); ranges (E3.1) |
| Missing caveats: \|a₁\| gauges by construction; seed-0-only values; toy step limit vs measured blow-up; #1141 force cost and baseline; C3 slowest TIC (F, P, Fe) | captions (E5.11, E2.7); "toy limit vs measured failure" (X2); NEW · UNREVIEWED card with cost and stamp (E5.6); TIC 0.49 drawn (E5.3) |
| Ties not drawn: n_v = 1–8; ScoreMD size and contacts (F) | ties drawn and narrated (E5.8, E6.2) |
| Sprint 1 best flat 0.167 missing (F, P) | shown beside 0.479 (E1.7) |
| Demo posterior without ±1 µs exclusion; ghosts in the 103-d chart (F) | A17b precomputed with exclusion; Cartesian only (E5.1) |
| Non-additive handedness waterfall (F) | separate bars (E6.9) |
| AK PCA stated as fact or [M] (F, P) | lens only, †, conditional wording, 85% reconciled (E1.8) |
| "Defects sit where theory says" is after the fact (F) | paired with the declared predictions and outcomes (E6.10) |
| Mixed-data ruler; ψ hand-over out of the basin (F, P) | mdshare only; a hand-over the `ruler` lever answers (E1.1) |
| ALDP5 γ dial shown as history (F, P) | [D·model · display interpolation] (E2.3) |
| (γ, v) corner labelled "both" (F) | "bonds and size", with 9.1° and TIC 0.086 vs 0.046 (E5.4) |
| Prologue overloaded; Clock before definitions (P) | 2:25, no numbers, no lanes (P0) |
| No one-mode warm-up; meters before their definition (P) | E2.1 ghosts only, E2.2 one mode |
| ALDP5 learned maps inside the BBA piece (P) | they end E3; E4 stays on BBA |
| Two ideas in one scene (P) | E5.7–E5.10 split; lag dial in E3.8, γ alone in E5.4 |
| Heavy A(t) notation for a bug card (P) | one sentence, formula behind a lens (E1.7) |
| Hope shown after the failure; wδ 413 before its criterion (P) | E1.3 before the attempt; 413 in E2.8 |
| γ/κ notation collisions; C1/C3 jargon; 17.5/11.4 two meanings (P) | §3.8 hygiene; lanes named by construction; units printed (E2.5) |
| Hand-over "C3 has none" (P) | "almost none (0.26–0.28)" (E5.3) |
| Count dial with #895's PMF definition (P) | definition chips, one definition per dial (E4.2, E6.3) |
| Gold block; fog-white information; count floors in the forces piece (P, Fe) | teal block, lavender info (§3.1); E6.3 in the results half |
| Problem 2, embedding and hope missing (P) | E2.6 link card; E3.1–E3.4; E1.3 |
| Trained outputs not local (Fe) | [I] decodes, #1119 after checking, labelled data vectors, forward paths + gauges |
| Heavy banks, float16, Δlogvol asset missing (Fe) | A17b (≈ 100 kB); int16 codec; A21 with parity |
| Explorables not bundled; no deep links; narrated lens hand; 20 live scenes (Fe) | phase 0 engine work; playhead a lever where narrated; 19 levers, selectors as lenses |
| Re-deriving Covariance's valley and Retention's KL identity (Fe) | link cards (E2.6, E5.9) |
| LM warm start breaks determinism (Fe) | cold start (R23) |
| Prologue numbering; Gaussianization flash-forward (Fe, P) | "Episode n of 6"; E3.9 |
| Untested "exact" chain; Monte Carlo labelled exact; no encoder asset (Fe) | tests against an oracle (R19); A13 + R25 with parity |
| Ephemeral library path; pixel numeral check; crowded strips (Fe) | archive snapshot (§6); static cue check + instrumented `text()`; one strip per panel group |
| Torsion-MC bases unspecified; per-frame wδ ellipsoids; MVP too complex; A1b ratio (Fe) | #1025 code, statistics offline (E4.4); per molecule (X1); closed-form MVP; file's 1,428 |
| Retention's 63% and Ricci card (Fe) | fixed on PR #3 before linking |

---

## 9. Build plan

**Principles.** Maths and tests first (the u1-force process: brief, probe pages, parallel scene writers; maths, visual
and pacing reviewers **plus an evidence judge**). Shared machinery once. The cheapest high-value probe fixes the grammar
before seven pieces depend on it, and it carries this round's honesty fixes from day one (the training-share definition
of range, "range, and order for size", the three-beat gesture, the BBA recaption and whiskers). Risky work (the JS C3
port, the 3-D chain, wδ decodes) after the MVP; the heaviest new maths with the least current value (E1) last; LISE
never on the critical path. **Re-plan from measured rates:** the MVP records days per finished, reviewed scene, and the
later phases are re-estimated from that rate. The synthesis's plan implied that a scene after the MVP costs half of an
MVP scene, a speed-up the comparables do not support (u1-force and information geometry still carry unreviewed scenes).
First deferrals: E1, X2 and X3. The committee path P0 → E5 → E6 is protected.

| Phase | Work | Days | Cumulative | Gate |
|---|---|---|---|---|
| 0 Groundwork | PR #3 cherry-picks: `src/app.js` (narration in `window.video.scenes`, JPEG frames), `src/main.js` lazy loading, `scripts/export-narrated.mjs` (fix its hard-coded Covariance chapter title) and `scripts/review-frames.mjs` from `origin/playable-video-prototype`; on PR #3 fix Retention's 63%, Ricci card, typed labels and scene 08's caption. Promote **by copy from git** (no imports from `private/other`): u1-force `leverSim`/`clock`/`paced`/`track`, `shared.js`/`space.js` from `origin/claude/fiber-bundles-em-video-0ada80`, Retention's plot kit, llm-soc `codeBlock`/`connector`/`panel`/`chip`, Interactions `linalg.js`; resolve the clashing names (`panel`, `frame`, `axes`, `drawPath`, `pill`, `readout`) into one module. Bundled explorables in `scripts/build.mjs` (`explorables/<id>/index.js` → `dist/explorables/<id>.html`), `explorable(scene, {prompt, challenges})` with a boot flag (`view.startExplore`), deep links `?video=&t=`, `--only` probe pages, the test glob `tests/**/*.test.mjs`, a golden-frame hash script for Parts 0/1, the smoke test on wrapped explorables; the SP scripts copied into `scripts/data/`; the archive snapshot of the ML library; PR bodies archived via `gh`; the TTS spoken-form formatter | 5–6 | 5–6 | `npm test` green; Parts 0/1 frame hashes unchanged |
| 1 Rigs, rail, ledger | R1–R4, R18–R20, R26, R27, R30, R31 with tests; R19's oracle fixture; `src/draw/thesis/{palette, rail, glyphs, badges, provenance, plane, journey, odometer, ruler}.js`; ledger schema, `ev()`/`evText()` (budget chip, tie glyph and the "predicted" check by construction), cue-numeral check, instrumented `text()`/`tex()` (an esbuild alias plugin); script skeleton; fixtures; a ledger subset for the MVP | 7–9 | 12–15 | g4 §3 values; rail anchors ± 1 px; automaton = oracle |
| 2 **MVP "The flipped handle"** | a ≈ 8 min probe of five scenes from closed forms and ≈ 100 kB of JSON (A1, A11, A12, A14, A19, a subset of A22) with a static `chain3d` view: **E2.3** nine rulers with the γ handle and training-share bars; **E2.9** ★ the promise; **E5.3** the clock measured then painted, with the range definition and "range, and order for size"; **E5.4** the handle turned back with the #1057 dots, whiskers, reverse dose and BBA recaption; **E5.6** the three-beat block gesture (halos later) | 7–9 | 19–24 | four-judge review; frames read every 4–6 s; days per reviewed scene recorded |
| 3 E5 and the real-molecule layer | R25 with parity, `chain3d`, Fog Bench renderings with readability opacity, A13–A18, A14b, A17b, R19 halos; E5.0–E5.2, E5.5, E5.7–E5.12; A19b if affordable | 12–15 | 31–39 | parity tests; frame reads |
| 4 E2 rest and X1 | E2.0–E2.2, E2.4–E2.8, E2.10 (R3, R4, A1, A6, A28); X1 with A14c, A30 and the per-lane challenge test | 11–13 | 42–52 | **three-things milestone**; X1 challenge test |
| 5 E6, P0, rest of the ledger | A20 (parity, else E6.7 held), A21, A24, A26, A27, R22–R24; E6.0–E6.10; P0 (R25 decodes, A17); the remaining ledger curation (≈ 400–500 logged values × 15 fields, two passes) | 14–17 | 56–69 | **committee-path milestone** (P0 → E5 → E6, X1) |
| 6 E4 | A15, A16, R29 (construction recovered, statistics offline); E4.0–E4.8 with E4.1b; #1119 only after reading its note | 5–6 | 61–75 | — |
| 7 E3 | R11–R17, R32, cone and peel via `space.js`, A5, A8, A9, A9b, the Gaussianize simulation; E3.0–E3.10 | 8–10 | 69–85 | — |
| 8 X2, X3, exports | X2 (lamp subsets, drawer, walkers, force reader, R28, R33, R34); X3 (a DOM page over A25 and the ledger: compare guard, floors, κ rails); narrated exports (≈ 98k frames at 24 fps, 1–2 h of rendering); README; Part 1 end card | 8–11 | 77–96 | smoke test on explorables |
| 9 E1 | R5–R10, A2–A4, A10, A23; E1.0–E1.9 with E1.8b | 8–10 | 85–106 | last by design; first to defer |

Total ≈ 85–106 working-day equivalents: the feasibility verifier's 82–104 for the synthesis's scope, plus ≈ 3 days of
net additions (E4.1b, E1.8b, the force-field leaderboard, the X1 grid, three toy rigs), less the AK wδ row, E4.5 and
E2.6. The §10 cuts recover ≈ 4 days at most, so apply them early if the MVP rate is slow. Parallel writers compress the
calendar, not the reviews. The three-things path (phases 0–4) costs ≈ 42–52 days; the committee path ≈ 56–69.

**Why this MVP.** It is the round-1 feasibility judge's "flipped handle" and holds the heart of the E5 core (clock
reveal, whitening reversal, two loud modes; the lever arm follows with the tested chain rig). It carries the reversal
with the real E2 image, needs only closed forms and small JSON, exercises every device, runs the lints from day one,
and now carries the verifiers' fixes in exactly these five scenes, so the grammar locks in with them. It adds A14 and a
static chain view because E5.6's mode arrows need the real molecule; the Fog Bench and the C3 port come second.

**Tests and render checks.** Rig expectations (§5), with X2 lamp subsets; R19 against its oracle; ledger hashes,
`ev()` resolution, §7 canon and cue numerals; lints by construction (`evText()` draws budget chips and tie glyphs and
refuses "predicted" without `declared_before`) backed by schema tests and the evidence judge's checklist; "no posterior
ghosts in non-Cartesian real charts" and "none below ESS 40"; the X1 challenge test and the training-share test on every
lane (every narrated range verdict reproduced); the existing strict smoke test (jumped, jumped-back and played frames
identical; controls at extremes; no `Math.random`, `Date.now`, `performance.now` under `src/videos`) extended to
explorables; golden-frame hashes for Parts 0/1; frames every 4–6 s via `review-frames.mjs` (`PLAYWRIGHT_CHANNEL=chrome`)
read before a scene is done, with pacing ≤ 2.2 words/s (`paced()`); open-PR numbers and the talk-slide quotes
re-checked before every export.

**Dependencies.** PR #3 (until merged, link cards say "on PR #3"); the PR #2 branch for the u1-force helpers (from git,
not the SP export); LOCAL read access once; the archive snapshot at `c099347a`; open ML PRs (#1104, #1113, #1136,
#1137, #1138, #1141) through ledger flags and archived bodies; `gh` once; optional LISE A-REQ-1.

---

## 10. What was deliberately left out, and why

- **Note 25's "Cramér–Rao" αL values** as values: shown once, struck (E3.7); the formula is invalid.
- **Chignolin transfer cosines** (0.996/0.990): computed on ScoreMD's generated dummy frames.
- **The exposé's cond(H) ≈ 2.4×10⁶ on BBA**: probably pre-dates the transpose fix, on files later withdrawn.
- **n21's idealized spectrum (κ = 415), κ_t and G_t (Theorem 3)**: three more κ meanings on screen for little gain;
  on X3's κ rails only.
- **Λ_t, pull-versus-move, Müller–Brown, equal SNR in images**: too abstract for the arc; image analogies only on the
  precedent card's cautions column.
- **The PGA atlas / thesis-extension line**: out of scope (critic); the Atlas video is linked.
- **Part 0's "shape space 2"** promise: not this programme; its card is untouched.
- **Spurs as scenes** (Riemannian flow matching, manifold FP regularizer, conservative wδ head, factorized densities,
  objective search, the further spurs #931/#933/#946/#947/#986) and the mirror-image thread: X3 cards; E1 and E4 carry
  their lessons.
- **d4's ghost hand, force-scale lever and four separate explorables**: folded into X1/X2 to keep levers and pages
  down.
- **d5's gold block, violet ramp end and fog-white information; d4's lavender shape and coral beside rose**: each
  clashed with the house rules or Retention.
- **d1's 50,000-frame bank and 800k-frame scan**: replaced by precomputed levels (A17b); A4 now scans all 800k frames
  offline in seconds.
- **1,000-molecule monitor curves** (floors ≈ 0.09 Å, up to 0.15 Å): the budget clock carries "changes where training
  ends" more robustly; the update-0 bar (E4.1b) uses them once, at bond level.
- **Generated BBA thumbnails as a requirement**: without LISE panels the scenes show labelled scalars; perturbed data
  never stand in for generated molecules.
- **A continuous ALDP5 γ dial as history**: only as a labelled display interpolation.
- **Re-deriving the KL identity, the balanced gradient flows, conditional whitening, the retention toy**: linked
  (Retention 09, Covariance 15 via the E2.6 card, Retention 08, Retention 05–06).
- **Removed in this round:** the "≈ 0.02 at the paper's count" extrapolation on screen (it applied to the best models
  only; X3 shows it for every model); the AK wδ interpolation row (no local coordinates; logged bars only); E4.5 as a
  scene (now E4.6's chip, R28 in X2); the balance for the constraint split and ScoreMD's seesaw on BBA (each inverted or
  misdrew its lesson); the fixed decision bar on measured glyphs; "the loud directions need no trajectory" as a reason
  for optimism (now under Not established, transfer); "a prediction that landed" as a dramatic beat; the
  density-vs-force and line-vs-helix toys as narrated scenes (X2 rigs, one chip each).
- **Pre-planned cuts to ≈ 63 min** (≈ −6½ min, ≈ −4 build days at most): E1.8 and E6.9 become ledger entries and one
  line in E6.10 (−1:10); E3.6's needles and diagonal move to a chip in E6.5 and to X2 (−0:40); E5.9 becomes a 15 s link
  beat with the access line moved to E5.10 (−0:25); E1.2 to 35 s, E3.8 to 60 s with the four-mode basin in X2, E4.6 to
  60 s (−0:55); the other scenes trim to their lower bounds at pacing review (−3:20). The committee path P0 → E5 → E6
  survives every cut.

---

## Change log

One row per verifier finding: what changed, why, and where. Severity H/M/L as the verifier rated it. Disputed points
were checked in the primary sources before the change: H1 (recomputed bond noise on the internal chart), H2 (g4 §7 item
7; n27 §5 "training used t ∈ [0.01, 1]"), N3 (g4 §3.14 counts bead pairs), N5 (lab 2026-11-16 force-field diagnosis,
Result 1 and the Rg-residual table), N6 (lab 2026-11-16 low-noise continuation), Fe-F10 (n27 §4 gives no level for
"≈ 700"), M3 (`bba-c3-local-accuracy-screening.md` §1, §3), M4 (lab 2026-11-18 loud-mode handedness, declared reading),
M11 (same lab entry, 9.5–11 Å bin), F4 (`real-budget-study.md`, simulation table and effect table), F6
(`bba-range-and-order.md` §4), F2 (r2 §1.1), F3 (r5 §1.5), L11 (lab 2026-11-17 wall-fit size term: 27 coefficients),
L12 (`bba-range-and-order.md` §7.1 registered thresholds), H6/M1 (g1 §4.9; PR #1104 body).

### Numbers (v-numbers: 7 medium, 25 low; all applied)

| ID | Sev | Change and reason | Where |
|---|---|---|---|
| N1 | M | One lag metric per panel: the step metric for bars and half erasure (1600/400/28.9/14.6 Å⁻²; 1/1/1.16/3.65; spread 3.7 vs 400), consistent with the warp, κ_step and the stamp k⊥ = 1/(D₀τ); R14 tests both forms, X2 toggles them | E3.8, R14, X2 |
| N2 | M | R18's test in library units only: t½ 0.5231/0.0278 | R18 |
| N3 | M | The 92% and 153 are a bead-pair share of first-chunk internal models (#1015), not C3 and not a bond-pair map; E4.5 folded into an E4.6 chip that says so; R28 counts 153 bead and 136 bond pairs | E4.6, R28 |
| N4 | M | Chain-model laws stamped: E5.5 "uniform torsions (law P0), exact"; E5.6 halos "collapsed law P, importance-weighted"; canon row split | E5.5, E5.6, §7, A18 |
| N5 | M | 0.6 kT/Å labelled as #1100's Stein tilt along Rg; A21's scatter labelled with #1103's 0.32 per Å; kept apart and listed as an open measurement | E6.4, §7, X3 |
| N6 | M | The superseded "≈ 1° at t ≈ 0.005" replaced by #1101's result (no wall down to 0.005; ≲ 0.001 needed); wall z per seed and level; contact blur badged [D, first order on data] | E6.6, §7 |
| N7 | M | 0.76 → 0.013 Å attributed to #1025 §7 / #1026 T0.2 at 50,000 updates, 2 seeds, 20k molecules; ratio 58× | E4.3 |
| N8 | L | E5.4's t½ row cited to R18 (unit mean, from the file), with n27's 0.53 noted | E5.4 |
| N9 | L | Fixed ln 16 bar only on linear first-order glyphs; width probes 2.35, von Mises 2.43; measured glyphs show curves or a dashed ramp | §3.2, §3.3, R2 |
| N10 | L | Loudness ratios 3.4 and 1.26 | §3.3, E5.8, §7 |
| N11 | L | "Derived input channels" label plus noised features 103 + 3n_v | E5.8 |
| N12 | L | Both n_v = 2 panels labelled (#1069 Table 3 seed mean 0.105; plain-sampler control 0.106/0.110) | E5.8, E6.2 |
| N13 | L | Handedness bins stamped "library rerun s2 (#1115)" | E6.9 |
| N14 | L | "N × floor ≈ 8,000 from 100k on" | E6.3, A24 |
| N15 | L | "Identical-initialisation rerun spread 0.046 Å (execution noise, not a seed floor)" | E4.7 |
| N16 | L | Skeleton torsion window 0.20; #1068 windows badged [M] | E5.10 |
| N17 | L | Hand-over band "≈ 0.0004–0.47" | E5.3 |
| N18 | L | Era 5 11-11 → 11-18 (n30 is 11-18); "Sprint 11, 10-23 → 11-16 (tracker #769 from 10-27)" | §1.1, P0.3, E3.0, E5.0 |
| N19 | L | Heap axis λ_min/tr G_X with A4's normalised values; the logged unnormalised λ_min as a chip | E1.6, A4 |
| N20 | L | The arrow starts at a separately labelled "#985 control" point (0.4207) | E4.2 |
| N21 | L | #895 chip "200k updates at batch 128, 2 seeds, 100k molecules; not comparable with Sprint 12 budgets" | E4.2 |
| N22 | L | "Mode 1 changes sign between beads 13 and 14"; R26 tests it | E5.6, R26 |
| N23 | L | #1109 numbers in s2/s3 order: 18.4/21.3% → 0%; 0.175/0.267 → 0.173/0.263 Å | E6.8 |
| N24 | L | Cost stamp "warm flat vs compile-amortized cold manifold, N = 3, A100" | E1.5 |
| N25 | L | Totals recomputed for the revised durations (69:14; committee path 28:35) | §2.1, §2.2 |
| N26 | L | "Two clearly below the floor and a third at it" | E2.3 |
| N27 | L | κ_Σ within a basin footnoted as κ_res of flat G (cond Σ_window) | E2.0, E2.8, §3.8, §7 |
| N28 | L | "The chain's torsions decide at 0.35–0.26; its size follows the block at t ≈ 0.13" | E5.11 |
| N29 | L | "Internal at thermal width" → "internal at unit (population) spread" throughout | P0.1, E4.1b, E5.2, E5.3, E5.6, R25 |
| N30 | L | Monitor floors "≈ 0.09 Å, up to 0.15" | §10 |
| N31 | L | "≈ 0.10 eV at the torsion path's midpoint"; R5 tests 0.098 eV | E1.1, R5 |
| N32 | L | Read-out level printed per arm on the Stein needles; A6 stores it | E3.6, A6 |
| §4 | — | Of the items v-numbers could not verify: the 0.004% data-overlap figure is in `bba-internal-force-field-size-drift.md` (0.004%) and #1100 (0.01%), so "0.004–0.01%" stands with both sources; the folded share is "≥ 60% native contacts" (r8, first-chunk note); the rest became pre-export checks (Unresolved 9) | E6.6, A16, §9 |

### Honesty (v-honesty: 6 high, 11 medium, 19 low, 9 missing items; all applied, two partly — see Unresolved)

| ID | Sev | Change and reason | Where |
|---|---|---|---|
| H1 | H | Cold open rebuilt: the playhead sweeps the log-SNR axis; opacity = readability from one first-order estimator for both panels; caption "a crisp stick is not a remembered bond"; the beat "both charts erase size last; one loses its detail where training almost never looks" replaces "two opposite orders", which contradicted E5; Å readouts elsewhere get the 0.057 Å target | P0.1, §3.4, E5.2 |
| H2 | H | One operational definition of range, the training share (t½ − t_min)/(1 − t_min) with ≥ 1% per local feature, drawn under every glyph; mnemonic "inside the training, into the fog"; Cartesian labelled "order without range (bonds in 0.04% of draws)"; T4 rewritten ("a feature it trains almost never"); X1 challenges re-specified and tested per lane | §3.3, §1.3, §1.5, E2.3, E5.3, X1, R30 |
| H3 | H | The ordered lane is labelled "range, and order for size", narrated with its first-order chain distances (0.24–0.31, before torsions); A19b (measured windows) requested before any wider claim; X1's chain-order challenge shows it passes only +8 at loudness 15, which training rejected | E5.3, E5.6, §1.1, X1, A19b |
| H4 | H | E5.6's gesture split into three beats (estimator chip from E5.3's measured lane to first order; lane morph [D]; held beat; dot [M]); the line "order or correction? #1137 …" inside the talk clip; a MECHANISM UNTESTED stamp; the dot lands inside the registered corner on one seed of two | E5.6, §2.2, §3.5 |
| H5 | H | Every Must badged ([H] on M3, M6, M7, M9); M10–M13 added for the present design (force field beyond 100 ps ✗, handedness partial, transfer ?, equilibrium ?); column caption "requirements we wrote as we went; the design was built to meet M1–M9"; pitch reworded | §0, §1.5, E6.10 |
| H6 | H | "≈ 0.02 at the paper's count" removed from the screen; every-or-none rule; every model's excess over the floor at its own count (ScoreMD re-run 0.122/0.235 at 10%, 0.078 at the 790,350 interim); label "ScoreMD recipe, our re-run at 10% budget"; "a converged ScoreMD comparison" under Not established; X3 applies the inference to all models | E6.2, E6.3, E6.10, §3.5, X3 |
| M1 | M | The budget lens shows the Cartesian family's and ScoreMD's stops; caption "the ordered model's size stopped improving after 50k; the Cartesian models are still improving; whether the gap closes is open"; "full-schedule baselines" under Not established | E6.2, E6.10 |
| M2 | M | E6.6's beat: "no trained level has produced a wall so far [M]; note 30 predicts more range alone will not [H, open]; for now it is supplied"; M9 badged [H] | E6.6, §1.5 |
| M3 | M | The #1073 coda is badged REPAIR · FITTED and names the 34-term packing correction fitted to noised data and seed 1's miss | E5.5 |
| M4 | M | "A prediction that landed" removed from the dramatic shape; E5.11 draws the whole gradual R² curve and captions the reading as coarse ("3 of 8 levels … 'a declared reading, not a test'"); E6.10 reason 2 reworded | §1.6, E5.11, E6.10 |
| M5 | M | The strike is recaptioned "on BBA: range without order; ALDP5 cannot test order, and its stiff modes kept the gain"; "?" pin → REVISED ON BBA; seed-spread whiskers and "only the end points differ by the effect rule" | E5.4, §1.1, §1.4 |
| M6 | M | E6.7 uses one metric per comparison (< 1 Å clashes with clashes; < 3.5 Å overlaps where measured; wδ overlap "not measured"); † on reader counts; moon fills; the shared magnifier; "different weak features near the floor"; retitled "two weak spots" | E6.7 |
| M7 | M | After the exaggerated peel the cap appears at real size (θ ≈ 0.17 rad, deficit ≈ 0.5%); note 22's practical scale and "should be tested rather than assumed" are narrated; "the true Hessian curves the other way"; beat "flat cannot be exact; within a basin the cost is small; an embedding is exact" | E3.3, R12 |
| M8 | M | Reason 5 (Rouse modes) moved to Not established under transfer, with "seen while drafting", the parts that still need data and #1141's force cost | E6.10 |
| M9 | M | The balance dropped for two bars labelled "share of predictable noise this block must correct"; beat split into [D] and [H]; R20 renamed | E5.7, §3.9, R20 |
| M10 | M | ScoreMD's seesaw drawn for ALDP only; for BBA two failed pivots and "Both" as a separate counterweight (iid ×7 worse); the explanation badged [H, our reading] | E2.7 |
| M11 | M | E6.9's beat: every internal-coordinate model, C3 included, under-learns the relative twist; internal coordinates carry it only at high order; two vectors carry no handedness | E6.9 |
| L1 | L | Q3 stamp "STIFF MODES ≈ 100× SOONER · TORSIONS: NO GAIN" | §1.1, E3.10 |
| L2 | L | Every effect-table row on E6.2; "size behind Cartesian and wδ by the effect rule (0.104 vs 0.067–0.075 Å)" in E6.10 and X3 | E6.2, E6.10, X3 |
| L3 | L | E4.7's claim scoped to both systems in 10k-update screens; sensitivity weighting noted | E4.7 |
| L4 | L | "Three quarters of the 100 ps size error (seed 3)" | E6.4 |
| L5 | L | Cost basis printed (with N24) | E1.5 |
| L6 | L | Struck words captioned "not refuted: not enough" | E1.9, §3.6 |
| L7 | L | The wall drawn as an off-axis arrow; the barrier term printed for the heap's median and worst frame | E1.6, A4 |
| L8 | L | Three cautions on the "how to read a result" card (update-0 size through self-overlaps; width and contacts, #1128; optimistic floor) | E6.1 |
| L9 | L | The tie narrated ("one to eight vectors tie on size …") | E5.8 |
| L10 | L | "Half decided by 0.5 (≈ 56% / 34%)" | E5.11 |
| L11 | L | Repairs described as one hard-core rebuild and one fitted 27-coefficient correction | E6.8, E6.10 |
| L12 | L | Corner fixed by #1071's registered thresholds (bond ≤ 0.001 Å, Rg ≤ 0.11 Å); bond W1 also in thermal widths; one x-axis per thread, angle as a lens | §3.6, E4.2, E5.6, E6.2 |
| L13 | L | Fog rule narrated once; measured-only glyphs drawn as a dashed "assumed Gaussian shape" ramp with "≥" | §3.2, §3.3, E5.3 |
| L14 | L | X3's Q1 quote with the measured within-campaign numbers beside it | X3 |
| L15 | L | E1.1's beat: disagreement on about a third of comparisons; A and B chosen to show it; A3/R6 compute Kendall τ | E1.1, A3, R6 |
| L16 | L | R-DM placed inside the cell: "the cell was not empty; the wδ version was" | P0.2 |
| L17 | L | Part 1's end card gains "per noise level; integrated over levels ≈ 1.5× on ALDP5" | §2.4 |
| L18 | L | HOPE becomes "REPLACED: GAUSSIANIZATION WORKED EARLY ON ALDP5, AT A LATE COST" | E3.9, §1.4 |
| L19 | L | E2.1 retitled "What the noisy state still knows at the floor (nine-mode model)" | E2.1 |
| Missing 1–9 | — | 1 range definition (H2); 2 A19b (H3); 3 M10–M13 and badges (H5); 4 competitors' budget stops (M1); 5 every-or-none rule (H6); 6 readability fill and shared magnifier (H1, M6); 7 seed whiskers (M5, E5.8); 8 wδ overlap "not measured" (Unresolved 5); 9 REPAIR · FITTED wherever a repaired number appears (M3, L11) | as listed |

### Completeness (v-completeness: 4 high, 13 medium, 11 low; all placed, the low ones mostly in X2/X3)

| ID | Sev | Change and reason | Where |
|---|---|---|---|
| F1 | H | New E4.1b "A chart built from the joints": the 103 channels, conditional whitening through Retention 08's idiom, the update-0 bar, the dated genealogy pill, a lever-arm preview; a zoo-card plant in E3.7; a thread; Retention 08's caption updated | E4.1b, E3.7, §1.4, §2.4 |
| F2 | H | New E1.8b "Better conditioned, not better": Sprint 10's three-row scoreboard, the closeout sentence, the n19 chip; M2 extended; thread "conditioning ≠ generation" into E4.3/E4.7 | E1.8b, §1.5, E4.3, E4.7, A23 |
| F3 | H | Pre-registration card A vs B before the race in E3.9; A lit in E5.4; corrections timeline; thread | E3.9, E5.4, §1.4, X3 |
| F4 | H | E6.5 opens with the study's force-field leaderboard; E6.10 reason 3; T5 paid off on BBA | E6.5, E6.10, A27, §7 |
| F5 | M | E6.0's four open boxes from n30 §7; the kinematics measurement (#1102) opens E6.8; boxes filled in E6.10 | E6.0, E6.8, E6.10 |
| F6 | M | The reverse dose as a second dot series | E5.4, §7 |
| F7 | M | A time-share coda (#929 pilot and the time-allocation intervention) in E3.5 rather than after E2.4, because the work dates from 11-04/05 and E2 would need a flash-forward | E3.5 |
| F8 | M | Three toys as X2 rigs (R32–R34): (a) narrated in E3.7 as the bridge to E3.9, (b) a chip in E1.8b where it explains #603, (c) a chip in E5.1's third fact | E3.7, E1.8b, E5.1, X2 |
| F9 | M | "Windows rank, they understate magnitude, and did not predict learning speed" in E5.3, annotated on E5.4, a trap card in X1, Q4 under Not established | E5.3, E5.4, X1, E6.10 |
| F10 | M | #761 chip in E3.8; payoff line in E5.3 | E3.8, E5.3 |
| F11 | M | Q1's data-efficiency "+" in E1.4, closed in E5.9 | E1.4, E5.9 |
| F12 | M | Promise ledger: one line in E6.10, the full card in X3 (kept out of E1, the first deferral) | E6.10, X3 |
| F13 | M | A cautions column on E5.12; Köhler chip in E6.6 | E5.12, E6.6 |
| F14 | M | The stationarity result (and the block's force benefit) in E6.4; the data-fitted trap before the simulation-fitted wall in E6.8 | E6.4, E6.8 |
| F15 | M | "Access" as the third thing a chart changes, in E5.9; M4's sub-clause | E5.9, §1.5 |
| F16 | M | The C3 sampler route as a chip in E5.5's coda: why the chart route was preferred | E5.5 |
| F17 | M | Counterweights: E6.1's cautions, E6.2's caption and chips (tight verdict, selections after results), Not established | E6.1, E6.2, E6.10 |
| F18 | L | Mirror-image thread as an X3 card | X3 |
| F19 | L | Architecture guard chip | E3.7 |
| F20 | L | Noise-only-control guard | E6.5 |
| F21 | L | Target-side row in the code pane | E1.5 |
| F22 | L | Simple-marginal [D·model] line; nats chip | E5.6, E5.9 |
| F23 | L | Further spurs in X3 | X3, §10 |
| F24 | L | "Next" line in E6.10 and an X3 card | E6.10, X3 |
| F25 | L | Method thread on the result card | E6.1 |
| F26 | L | "The force does not depend on the metric" in E2.7; the bias–variance vise in X2 | E2.7, X2 |
| F27 | L | Lens `anatomy` (#1089) | E6.5 |
| F28 | L | "Size is a joint error" in E4.6's chip | E4.6 |
| Cost | — | Narrated additions ≈ 3½ min, offset by E2.6 → link card, E4.5 → chip, the AK wδ row and scene tightening: net +40 s (69:14) | §2.1 |

### Feasibility (v-feasibility: 2 high, 9 medium, 10 low; all applied)

| ID | Sev | Change and reason | Where |
|---|---|---|---|
| Fe-F1 | H | R19 gated against an O(N⁴) brute-force oracle to 10⁻⁹ (a wrong automaton passed the old 0.01 gate); the JSON Monte Carlo only as a sanity check | R19, E5.5, §9 |
| Fe-F2 | H | Build plan re-estimated at ≈ 85–106 days (three things ≈ 42–52, committee path ≈ 56–69); ledger curation budgeted; re-plan from the MVP's measured rate; E1, X2, X3 first deferrals; phases reordered so both milestones come early | §2.3, §9 |
| Fe-F3 | M | The MVP gains A14 and a static chain view for E5.6's mode arrows | §9 |
| Fe-F4 | M | X1 precomputes: the A30 loudness grid, A14c ellipsoid blocks; posterior ghosts only for A17b's molecules | X1, A14c, A30, A17b |
| Fe-F5 | M | Library parity from a `git archive` snapshot with a `sys.path` prepend and a `__file__` assertion; never `git worktree add` | §6 |
| Fe-F6 | M | R29: construction recovered from #1025's code; statistics offline; logged and own values side by side; chains only animate | E4.4, R29, §3.9 |
| Fe-F7 | M | Asset gaps closed or cut: the AK wδ row dropped; Wiener moments (A14b); the warp (A9b, else [I]); wδ forward ghosts (A17); TICA constants (A15); the folded-share definition (A16) | E1.8, A9b, A10, A14b, A15, A16, A17 |
| Fe-F8 | M | Open-PR bodies archived once via `gh` with a fetch date | §6, §9 |
| Fe-F9 | L–M | Ephemeral SP scripts copied into the repo in phase 0 | §6, §9 |
| Fe-F10 | M | Each level prints its own ESS; ghosts only at ESS ≥ 40; n27's "≈ 700" quoted with "level not stated"; A17b covers the 8 molecules | §3.4, E5.1, A17b |
| Fe-F11 | M | R18's units (as N2) | R18 |
| Fe-F12 | L–M | A1 evenly spaced (every 12th frame) | A1 |
| Fe-F13 | L | A8's dihedral sign pinned by a test | A8 |
| Fe-F14 | L | Mirror mode keyframed in videos, lever-driven in X1; an engine "lens age" optional | §3.3, §3.9 |
| Fe-F15 | L | Every hand-over answerable: E1.1 reworded to the `ruler` lever; E5.3 hands over the `t` lever; E5.2 and E5.5 use the playhead as a lever; E3.4's stays a lens with no level-specific narration; E2.4, E4.4 and E5.6 gained hand-overs | §3.9, E1.1, E2.4, E3.4, E4.4, E5.2–E5.6 |
| Fe-F16 | L | Engine chores: test glob, IIFE lazy decode, export title, `--only` probe pages | §5, §6, §9 |
| Fe-F17 | L–M | Lints by construction: `evText()` draws budget chips and tie glyphs and refuses "predicted" without `declared_before`; schema tests | §3.5, §3.7, §9 |
| Fe-F18 | L | A17 stores no paths or ε (exact OU transitions drawn in JS); A4 scans all 800k frames | A4, A17, E5.11 |
| Fe-F19 | L | wδ uses the study's 379 features in both A17 and A20 | A17, A20, E5.2 |
| Fe-F20 | L | A12's shares stored as block shares, shown as 1 − x | A12, E5.7 |
| Fe-F21 | L | TTS spoken-form formatter for cues | §3.7, §9 |
| §5.2 | — | A5 sized 180 kB; A21 on ≥ 20k frames; sha guard on BBA inputs; the must-not-use data list; optional A17c | §6 |

---

## Unresolved

1. **Two measures of the spurious volume force disagree (N5).** #1100's Stein tilt along Rg (≈ 0.6 kT/Å) and #1103's
   log-volume slope (0.32 per Å, 0.18 of it from the inertia factor) differ by about 2×. The sources do not reconcile
   them, so both are labelled separately (E6.4, §7) and the gap is listed in X3. Reconciling them needs a computation no
   source contains (for example the Stein test on A21's reweighted ensemble).
2. **The ordered chart's measured chain-distance windows do not exist (H3).** Until A19b runs n27's probe on the
   ordered chart, the claim stays "order for size"; whether its chain distances are ordered under the best estimator is
   unknown.
3. **Order or correction (H4) is untested.** #1137 was declared on 11-18 and has not run; E5.6 carries the line and the
   MECHANISM UNTESTED stamp, and the mechanism remains [H].
4. **Whether the ScoreMD re-run would reach the published model (H6, M1).** Only the 10% panel and a 790,350 interim
   PMF at 20k molecules exist in the sources; the full-schedule ScoreMD, Cartesian and whitening panels were due on
   11-19 and were not in anything read. The programme lists "a converged ScoreMD comparison" and "full-schedule
   baselines" under Not established; the ledger must pick the panels up before export.
5. **wδ's overlap share (< 3.5 Å) at the registered budget (honesty missing item 8, M6)** was not found in any source.
   E6.7 shows "not measured"; computing it needs the stored panels (A-REQ-1, LISE), which stay off the critical path.
6. **The 1% range threshold is a declared design rule, not a measurement (H2).** On local features it separates every
   narrated verdict by a wide margin (Cartesian bonds 0.04%, wδ ≈ 0.4%, internal and ordered ≥ 25%), but X1's expected
   challenge answers (ordered internal and skeleton-and-arrows pass "range + order for size"; only +8 passes chain
   order) are predictions until A30 is computed and the per-lane test runs. Honesty also suggested folding loss weight
   into the definition; the programme keeps training-draw share alone and shows the loss weight separately (E2.5),
   because a combined index would need a weighting the sources do not fix.
7. **Effort (Fe-F2).** The verifier's estimate is adopted; the real rate is unknown until the MVP measures it.
8. **R29's chain construction (Fe-F6).** #1025's note gives the table but not the construction, and the free-chain
   value moves by up to ±0.4 Å with conventions; it must be recovered from #1025's code before narration, else the
   programme's own [D·model] values sit beside the logged ones.
9. **Quotes and values no verifier re-ran (v-numbers §4).** The talk-slide quotes (checked by the synthesis only), the
   E1.1 thermal-ruler pairs (reader-derived; A3 must reproduce them), "mode 1 88% aligned with hairpin–rest" (only via
   r6's reading of the archived #1057 note) and E2.7's "0.91–1.04 (seed 0 only)" (evidence.json not opened) are
   pre-export checks in §9; any that fails loses its chip.
10. **How well BBA's stiff channels factor from the torsions** is not measured (on ALDP5 torsions explain under 1% of
    bond variance). E4.1b's exact statement is therefore badged "approximate on BBA", and its measured support is the
    update-0 bar.
11. **The declared-window reading (M4) stays coarse.** Whether a finer test (a continuous crossing level with a
    bootstrap) would still place the crossing inside 0.26–0.1 is not computed.
12. **The C1-versus-C3 trap card (X1)** states a fact (a wider measured Rg window, a similar trained size error) that
    the sources do not explain; the card offers no mechanism.
13. **The AK wδ interpolation row (Fe-F7)** was dropped rather than recomputed (Gauss–Newton on 214 Cα, minutes
    offline); recomputing it would restore the three-row figure if the author wants it.
