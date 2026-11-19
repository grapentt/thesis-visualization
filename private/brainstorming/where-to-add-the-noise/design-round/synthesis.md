# Synthesis · "Where to Add the Noise": one visualization programme for the riemannian-generative thesis

Lead designer, 2026-11-19. Merged from d1 (story), d2 (mechanism), d3 (evidence), d4 (interaction) and d5 (visual)
using the fidelity, pedagogy and feasibility judgements, the critic, the number canon (g4) and r6, with spot checks
in `SP/rg-main` and `LOCAL = /Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative` (read-only).

**Tags.** [M] measured (molecules, trained models, MD) · [D] derived (closed form, exact evaluation) · [D·model]
an exact or Monte Carlo computation on a stated model (chain model, nine-mode basin, toys), never a molecule
measurement · [H] hypothesis · [I] illustrative · [S] cited from a paper or quoted from a project document ·
† derived by one of this workflow's readers, unofficial until an asset reproduces it. Each tag names its source
(theory note "n27", PR "#1088", file, or the reader report that checked it).

The series title and spine sentence are the author's own: slide 1 of
`LOCAL/runs/talk-noe-20261118/range-and-order-talk.pptx` reads "Where to add the noise"; slide 3 reads "Each step
looked promising for a measured reason and was left for a measured reason" (checked today).

---

## 0. Pitch

The programme tells the riemannian-generative project as one question that got sharper six times: from "which
geometry puts unphysical shapes far away?" to "what must the noise keep readable, in which order, and what can that
answer not supply?". A 2½-minute prologue and six playable episodes (≈ 68 min, each 9–14 min and standalone) run
from wδ's walls through stiffness, embeddings and BBA's two halves to range and order and the open force-field
frontier. Every attempt appears first with the measured reason it looked promising, then with the measured reason
it was left; every failure adds a requirement to a List of Musts that the finale ticks honestly, including the one
the current design meets only by repair. One instrument carries the science through every piece: a fixed log-SNR
"Erasure Clock" rail on which each chart is a lane and each feature a glyph at the level where noise half-erases it.
On it the project's central reversal becomes a handle the viewer turns twice with the verdict flipped: October's
goal "erase everything together" is November's diagnosed cause of lost order. Underneath, every derived claim runs
on a small exactly solvable rig with Node tests ("toy says / molecule says"), every logged number reaches the screen
only through one provenance ledger with budget, seed, count and floor chips, and three explorables (the Clock, the
Bench, the Ledger) hand the instruments to the viewer.

---

## 1. Organizing idea and throughlines

### 1.1 The spine

The unit of structure is d1's episode: a question; the attempt it motivated, with the measured reason to enter
("+"); a real success the viewer can believe; the measurement that broke it ("→"); the mechanism with its badge;
then *question surgery*, which rewrites the reason for leaving into the next question, and one new Must. Fidelity
and pedagogy chose this spine because it makes honesty load-bearing: reversals become results, hypotheses get a
designated place, and the finale separates "why optimism" from "not established". Feasibility's objection (d1's size
and data weight) is met by building every episode from d2's rigs, in d2's rigs-first order (§9); d2's own arc
("nine clocks become one" → "one clock is not enough" → "order with range" → "reading a force") is the same reversal,
so its scenes slot in without reordering.

| Station | Question | Era (first document → decision) | Verdict pill |
|---|---|---|---|
| Q1 | Which geometry puts unphysical shapes far away? | Era 1, 07-02 → 10-22 (#520) | NEGATIVE AS A METHOD · POSITIVE AS ARCHITECTURE |
| Q2 | What should a geometry do to the noise? | Era 2, 10-23 → 11-14 (PR #745, n20–21) | GOAL: SYNCHRONIZE ? → REVISED |
| Q3 | How can the noise follow a curved metric without solving geodesics? | Era 3, 10-23 → 11-16 (#769) | STIFF MODES FIXED · TORSIONS: NO GAIN |
| Q4 | Does it survive 28 beads? | Era 4, 10-24 → 11-14 | EACH MAP FAILED FOR A MEASURED REASON |
| Q5 | What must the noise keep readable, and in which order? | Era 5, 11-11 → 11-14 (n27, n30) | RANGE AND ORDER (working hypothesis) |
| Q6 | Does it hold, and what can it not supply? | 11-14 → open | OPEN |

### 1.2 Five layers, one programme

- **Narrative (d1):** Journey Map, question surgery, +/→ pairs, Musts, threads, correction pills; d5's dated
  swimlane guards against hindsight linearization.
- **Mechanism (d2):** every [D] is a tested function in `src/model/thesis/`, with rig stamps and toy/molecule pairs.
- **Evidence (d3):** one `ledger.json` (`ev('id')`), two floors, budget chips, the effect rule, "≠", an evidence judge.
- **Interaction (d4):** one gesture per lever, lever/lens discipline, symbol hygiene, the *flipped handle* (the same
  γ control is October's fix in E2 and November's diagnosis in E5).
- **Visual (d5):** the fixed rail, the warm-to-cool ramp, the Fog Bench ("no pixel blur"), the 3-D rules.

### 1.3 Throughlines

| | Throughline | Built | Paid off |
|---|---|---|---|
| T1 | Noise is a clock that erases; destroyed forward = decided backward | E2.2–E2.3 | E5.1–E5.3, E5.11 |
| T2 | One spectrum, two pulls: stiffness removal wants a flat spectrum (range), order a steep one; the design flattens the stiff block and keeps two modes loud | E2.3, E2.9 | E5.4, E5.12 |
| T3 | Charts move information; they do not create it | Retention 09 (linked) | E5.9 |
| T4 | Every chart has a blind spot at its trained floor; "the barrier that killed, the barrier that may save" [H] | E2.3, E4.3, E5.3 | E6.6, E6.7 |
| T5 | The blur dial: a force read at level t is the force of the blurred molecule; one model, two uses | E2.7 | E3.6, E6.4–E6.6 |
| T6 | Prediction ≠ generation; readable ≠ learnable; a feature is learned when it is a coordinate of its own | E4.7 | E5.10 |
| T7 | Failures are results: moving baseline, finite ≠ correct, XLA miscompile, the 5 November correction, the wrong volume term | E1.7, E3.5, E3.9 | E6.4, E6.10 |

### 1.4 Threads (drawn as filaments on the Journey Map at their payoff)

| Thread | Planted → paid off | Rhyme |
|---|---|---|
| Collision barrier (rose pin) | E1.4 → E6.7 [H] | the same odometer, two beads approaching |
| Planarity barrier kills | E1.6 ★ → E6.7 | "the barrier that killed" beside "the barrier that may save" |
| HOPE stamp (straightening) | E1.3 → E3.9 | flips to CAME TRUE, DIFFERENTLY |
| Straight in feature coordinates | E1.5 → E3.2 | "embedding makes that the rule" |
| Moving-baseline scoreboard | E1.7 → E6.2 | "this time: fresh seeds, registered criteria, effect rule" |
| The γ handle | E2.3 → E5.4 | same control, verdict flipped |
| "Erase everything together" + "?" pin | E2.9 ★ → E3.9 (flicker), E4.6/E4.8 (blink), E5.4 (struck, REVISED) | E2's climax recaptioned "range without order" |
| Read-out level t*; volume-term footnote | E2.7 → E6.6; E2.7 → E6.4 | same handle; the phantom spring |
| One model, two uses | E3.6 → E6.4–E6.6 | works on ALDP5, drifts on BBA |
| Rulers under the waterline; normal stiffness α/σ | E2.3 → E4.3a; E3.4 → E4.3b | 27 spring channels sink; noise leaves the molecule |
| Same metric, two machines | E3.3 → E6.7 | the wδ feature map has 0% clashes |
| "ALDP5 cannot test order" | E3.10 → E4.0 | the footnote is E4's first line |
| Two-halves plane | E4.2 ★ → E5.6 ★, E6.2 | the dot enters the empty corner |

### 1.5 The List of Musts

| Must | Requirement | Added | Produced by | Ordered internal coordinates (E6.10) |
|---|---|---|---|---|
| M1 | closed-form noise kernel | E1.9 | geodesic ODE per noising step | ✓ VP noise in feature space |
| M2 | an audited baseline before comparing | E1.9 | the moving baseline | ✓ by method (registered budget, fresh seeds, effect rule) |
| M3 | every property readable inside the trained band (range) | E2.10 | bonds erased below t_min | ✓ except contacts (→ M9) |
| M4 | noise that stays on the molecule | E4.3 | whitening's 3,225 normal directions | ✓ non-redundant block + 3 constraint directions |
| M5 | prior matching, locally and collectively | E4.4 | a spring base collapses the chain | ✓ size gets a near-Gaussian coordinate |
| M6 | large-scale shape erased last (order) | E5.6 | unit variance everywhere erased the order | ✓ two loud modes |
| M7 | what must be accurate needs a coordinate of its own | E5.10 | skeleton map refuted by its own rule | ✓ |
| M8 | an exact volume term in every force read-out | E6.4 | the phantom spring | ✓ immersion term (#1111) |
| M9 | excluded volume supplied, not learned | E6.6 | contacts are a range failure | ✓ **only by repair** |

### 1.6 Dramatic shape

E1 a fall; E2 a false summit with one "?" pin; E3 a success with limits, cracked by a same-day correction; E4 the fall
on 28 beads; E5 the reversal and a prediction that landed; E6 the test and the open end.

---

## 2. Programme map

### 2.1 Pieces

| # | id (folder) | Title (a claim) | Kind | Length | Purpose | Depends on / links to |
|---|---|---|---|---|---|---|
| P0 | `src/videos/where-to-add-noise` | Where to Add the Noise | narrated | 2:25 | the questions, no numbers | all episodes |
| E1 | `src/videos/far-away` | Far Away, and Too Close | playable, 3 levers | 9:42 | Q1, Era 1: wδ, from hope to wall to moving baseline | Part 0; Covariance 23 |
| E2 | `src/videos/wrong-ruler` | The Noise Has the Wrong Ruler | playable, 4 levers | 10:45 | Q2, Era 2: stiffness on the real molecule; ★ the promise | **Part 1**; Retention 05–06; Covariance 13–16; Interactions 12 |
| E3 | `src/videos/lift-noise-project` | Lift, Noise, Project | playable, 4 levers | 11:37 | Q3, Era 3 + ALDP5 learned maps: embed, don't flatten | Part 1's promise; Covariance 29/32; Atlas |
| E4 | `src/videos/both-halves` | No Map Got Both Halves | playable, 2 levers | 9:05 | Q4, Era 4 on BBA: every failure measured | E3's plants |
| E5 | `src/videos/range-and-order` | Range and Order | playable, 4 levers | 13:55 | Q5, Era 5: the clock, the reversal, two loud modes | E2's handle; Retention 05–06, 09; Interactions 02 |
| E6 | `src/videos/what-it-cannot-supply` | What the Block Cannot Supply | playable, 2 levers | 11:05 | Q6, now: results with floors, forces, the wall, the ledger | E1 pins; E2 handle; E4/E5 planes |
| X1 | `explorables/erasure-clock` | The Erasure Clock | explorable | — | build a chart, read range and order | rail, encoders |
| X2 | `explorables/bench` | The Bench | explorable | — | every rig, self-testing | all rigs |
| X3 | `explorables/ledger` | The Ledger | explorable | — | claims, corrections, provenance, floors | `ledger.json` |

Total ≈ 68:30 (P0 145 s, E1 582, E2 645, E3 697, E4 545, E5 835, E6 665): slightly under d1's 69 min although it
absorbs d2–d5's warm-ups, real-molecule and results scenes. The §10 cut list reaches ≈ 62 min. E5 has a pre-planned
split after E5.5 (E5a "Range and Order" ≈ 7:30 with its own verdict card; E5b "Two Loud Modes" ≈ 7:05 with a station card).

### 2.2 Numbering and order

The series is "Where to Add the Noise", eyebrow "EPISODE n OF 6"; Parts 0–1 stay foundations (this removes d2's
"Prologue after Part 1" muddle). **Order:** P0 → (Part 0) → **E1 → Part 1 → E2** → E3 → E4 → E5 → E6. E1 ends on
"what should a geometry do to the noise?", Part 1 answers it on a toy, E2 on the real molecule. Asides (link cards
with an "on PR #3" pill until merge): Covariance 13–16 before E2.6; Covariance 29/32 and Atlas after E3.3;
Retention 05–06 before E5; Interactions 02 before E5.1, 12 after E2.7. **Committee path** (d5): P0 → E5 → E6
(≈ 27½ min) with X1/X3 as hand-outs. **Talk clips:** E5.6 and E5.11.

### 2.3 If you only build three things

1. **E5**, opened by a 60 s recap of E2's "promise" built from the same nine-mode rig: the current argument and the
   reversal, all data local and small.
2. **E2**: continues Part 1, reconciles Problem 3, introduces the rail and plants the handle E5 turns back.
3. **X1**: reuses E5's rail, lanes and encoders as a hand-out examiners can play with.

Lost: the history (E1, E3, E4) and forces (E6); the finale's "why optimism / not established" card moves into E5.12.
Cost ≈ 32 working days (§9).

### 2.4 Contracts with existing pieces

| Piece | Contract |
|---|---|
| Part 0 | E1.1 reuses `rigidMotion` (muted ghost); E3.1 gives its six vertical tangents zero length; its "shape space 2" card is untouched |
| Part 1 | E2.0 imports scene 14 as a still, recap labelled "toy, κ_H = 400 [I]"; E2.5 reconciles Problem 3; E3.1 delivers the spring metric. **Edit:** two strings in `part-1/scenes/15-next-video.js` → "Next: Episode 2 · The noise has the wrong ruler" |
| Atlas | E3.3 link card (the topological orange peel) |
| Retention (PR #3) | E2.2 link; E5.1 credits its toy; E5.9 links scene 09 instead of re-deriving the KL identity. **Fix first:** "63% of its equilibrium width" → variance 63%, width 79% [D g4 §3.9]; reconcile "Ricci flow: FALSE" with n25 §8; replace typed labels that contradict computed values (a2) |
| Covariance (PR #3) | E2.6 links ch. 15 (keeps only the ALDP5 pairing table); E3.2 uses ch. 29's lift camera and links ch. 32; E1.3 links ch. 23 |
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
| wall | `#f497c0` | closest approach, overlaps, excluded volume, collision barrier | 8.9 |
| info | `#c39bf5` | readability R_h, meters, posteriors, information densities, the "decided" ring | 8.2 |
| gold | `#f2cf63` | **attention only**: playhead, current station, the control being turned, the "wanted" corner | 12.3 |
| fog | `#aab8d6` | noise haze (alpha = min(0.85, σ_t²)) and noise balls; never text or data | 9.3 |
| x/y/z | `#ef6b6b` `#86d08f` `#7ea6f2` | Cartesian emblem and axis triads only (house) | — |

The ramp stiff → angle → soft → mid → global runs warm to cool, so order reads as a gradient on a lane and anti-order
as a reversed one (ΔE76 soft–global 41.6; mid–global 19.6 is one family, separated by glyph shape). The wall is off
the ramp on purpose (local in space, non-local in sequence). Charts never get a colour; at most three ramp hues at
once. Deliberate departures: teal, not gold, for the loud block (d5); lavender kept for information (Retention); no
lavender shape or coral-plus-rose (d4); no violet ramp end (it clashed with lavender).

### 3.2 Glyphs, states, emblems

Glyphs (18 px, ramp hue): bond ●–●, angle ∠, torsion ↻, long-range ●⌒●, end-to-end ⟷, contact count ⋰, size ◎,
slowest TIC ∿, closest approach ●|● (rose), handedness (tripod), loud mode ⇔ (teal). **Fill = readability** (a moon
fill equal to R_h(t) where a curve exists; a snap at t½ where only t½ is measured). **Outline = estimator** (solid
with "≥" best estimator [M]; dashed first-order [D]; "=" closed form; dagger reader-derived); estimators never share a
lane unmarked. **Decided** is the same state as readable; in mirror mode the fill grows right to left and a lavender
ring pulses at R_h = ½. **Chart emblems** (ink): x/y/z triad, "ln r" ruler, zigzag, unit circle, lens, hinged chain,
hinged chain with two teal arrows. **Scatter markers** (d3): square Cartesian, circle internal, teal-ringed circle
ordered, diamond wδ, triangle springs, inverted triangle whitening, hexagon ScoreMD, cross warps.

### 3.3 The Erasure Clock rail (`src/draw/thesis/rail.js`; d5 geometry, anchors are tests)

x(t) = 140 + 1340·(13.8145 − ℓ(t))/18.753 for t ∈ [10⁻⁵, 0.7], ℓ = ln(α_t²/σ_t²), plus a 30 px cap "→ 1".
Anchors: 10⁻⁵ → 140, 4×10⁻⁴ → 406, 0.01 → 683, 0.05 → 877, 0.1 → 973, 0.26 → 1128, 0.5 → 1303, 0.7 → 1480
(71.46 px per log-SNR unit) [D, checked by the fidelity judge]. Log-SNR ticks above, t labels below; home band
y 640–760; lanes 44 px, at most six; emblems at x 40–130. **Waterline:** each lane hatched left of its own t_min,
"never trained" (10⁻⁵ Cartesian family; 0.01 internal, whitened, spring, wδ). **Fog:** alpha σ_t² (cap 0.85),
thickening rightward. Mnemonic, said once (E5.3): "inside the band, into the fog": range = every glyph right of the
waterline, order = the cool glyphs deepest in the fog; generation reads right to left. **Decision bar:** R from 0.8
to 0.2 spans a fixed ln 16 = 2.77 log-SNR units (198 px) [D g3 C2]; features look ordered only if bars do not
overlap (loudness ratio > 16), which shows honestly that the block's order over torsions is partial (6.9/2.0 = 3.5).
**Training sparkline** under each lane (uniform-t draws per pixel). **Threads** join one feature across lanes.
**Mirror mode** flips the reading direction (1.2 s), captioned "exact only for the exact reverse process".

### 3.4 Noise and "decided", honestly

- **Four renderings, no pixel blur (d5).** (1) *Ghosts:* 12 seeded forward draws y = α_tφ(X₀) + σ_tε_k, decoded by
  the chart's own decoder, Kabsch-aligned, "12 noisings of one molecule": forward-kernel ensembles, not posteriors.
  (2) *Best linear guess:* the Wiener mean, a lower bound. (3) *Fog opacity:* the moon fill. (4) *Crystallization:*
  forward paths played backward, captioned as **exact reverse samples** (unconditioned) or a **bridge ensemble**
  ("these 12 all end at this molecule"); trained behaviour only as measured gauges beside them.
- **Posterior ghosts** only in Cartesian coordinates or exactly solvable models, always with the ESS printed; never
  in the 103-d internal chart (median ESS 1, d4); data posteriors exclude ±1 µs temporal neighbours (n27 traps).
- **The Fog Bench** shows one real molecule through a chart at the playhead with these renderings. Every frame is a
  correct noisy sample; one draw rescaled is not a diffusion path; a plug-in decode is "what the network is shown",
  never "what the state still knows".
- **Noise Ruler** at the playhead: σ dimensionless first, then in the noised unit, e.g. "t = 0.010 · σ = 0.0446 ·
  log-SNR 6.22 · ×6.252 Å → 0.279 Å per BBA Cartesian coordinate"; presets ×1 Å (manifold route), ×0.9418 Å (ALDP5
  pilots), ×0.267 Å (own scale), ×6.252 Å (BBA), channel units [D g4 §3.3].

### 3.5 Evidence devices (d3, with the fidelity rules)

- **Badges** (monochrome capsules, legible in greyscale): [M] filled; [D] outline; [D·model] outline + "model";
  [H] dashed, the only badge that may grow scene-wide; [I] dotted italic; [S] square corners; † reader-derived.
- **Status overlays:** SUPERSEDED (45% alpha, 0.6 s strike, date); OPEN PR ("open PR #1104 · 1 seed"); DECLARED,
  NOT RUN (hourglass); NEW · UNREVIEWED (#1141).
- **Budget chip** on every trained number, "190,350 upd (10%) · s2/s3 · 100k mol", enforced by a lint test.
- **Provenance strip**, one per panel group: `BBA · DESRES 1.30 M frames · 190,350 upd (10%) · s2/s3 · N = 100,000 ·
  floor 0.006 Å · real-budget-study.md (2026-11-15)`; a missing field is "—".
- **Two floors:** the noise floor is the rail's waterline; the sample floor a "///" band on metric axes ("floor @
  N = 100,000"); never a number without its floor when one exists.
- **Seed dumbbells + effect gauge** ("gap 0.030 vs largest seed spread 0.026 → effect"); ties by the pre-fixed rule
  are drawn as ties.
- **"≠" glyph** names the mismatch ("100k ≠ 1.3M molecules", "190k ≠ 1.9M updates", "κ_res ≠ κ_step", "bgmol ≠
  mdshare", "2k ≠ 10k campaign") and replaces any arrow or ratio across it.
- **Count dial**, **budget clock** (cosine bar, gold tick, "% of peak LR"), **κ chips** (arrows only within one chip
  and data set), **estimator chips**, the **toy/molecule pair** ("toy = 0.264 [D·model]" · "molecule 0.198 [M]") and
  the **rig stamp** at (1572, 890) ("exact · 9 Gaussian modes · widths mdshare traj 1 · unit 0.9418 Å").

### 3.6 Narrative devices (d1)

**Journey Map:** six stations (hollow future, gold ring current, filled with verdict pill when decided); dead-end
spurs in X3; threads appear only at payoff; d5's swimlane underneath, narrated "separated by logic, not by date".
**Question surgery** (≈ 8 s): refuted words struck, replacements typed in gold, the new question flies on.
**+/→ pair** (the author's device, talk slides 3–15). **List of Musts** (ink ticks). **Odometer:** Euclidean
(muted, finite) against a chart's own distance (ink), running to ∞ in rose for collisions and hatched ink for
planarity (E1.4, E1.6, E6.7). **Two-halves plane:** log local error against log Rg W1, the "both right" corner
outlined gold, floors marked, panel size printed; 20k and 100k panels never mixed. **Correction pill:** a dated
"was → now" chip, the old reading struck for one beat, at most one per scene, always narrated.

### 3.7 Numbers

IBM Plex Mono, tabular figures, true minus, units always, never more digits than the source; "=" live, "≈"
rounded, "≥" lower bound; seeds "0.117 / 0.091 (s2/s3)"; ranges "0.44–0.53"; ratios name numerator and denominator
("46–109× its W1 floor"). **No number is typed in a scene file:** computed values come from rigs, logged values from
`ev('id')`, narration cues are template strings from the same sources. A static test checks every numeral in the
cues; a test build instruments `text()`/`tex()` with a whitelist for layout numerals (replacing d3's unworkable
pixel check).

### 3.8 Symbol hygiene (d4, extended)

| Symbol | Means only | Not |
|---|---|---|
| t, t*, t½, t_min | diffusion level; force read-out level; half erasure; trained floor | — |
| λ; r(t), R_h(t) | variance in noise units; readability (linear/exact; general) | — |
| κ_H, κ_Σ, κ_res, κ_t, κ_step, κ_train | the six κ definitions, always subscripted | bare κ |
| c_φ = 1.504 | torsion phase-pair scale ("κ in the code") | κ |
| k_∥, k⊥ | spring stiffness along / across a bond (k⊥ is "γ" in n20–22) | w, γ |
| γ; v | whitening exponent only; stiff-channel variance | spring scale |
| τ, t_k, D₀; L² | lag, relaxation time, diffusion constant; loudness ratio | — |
| n_v | number of loud vectors (the project's K) | K (kept for Part 1's G = K) |
| 𝒦, 𝒦_tan | Gaussian curvature; cone tangential curvature, **per squared thermal width** | K, Å⁻² |
| Δt; ν; m | Brownian step (Å²); Gaussianize morph; chain separation | h (reserved for observables) |
| p; w_k | basin population; thermal widths | — |
| C3, C1 | project labels, shown once and small; lanes say what the chart is | lane names |

### 3.9 Interaction rules

A solid-disc handle is a **lever** (pauses the video; `leverSim` or a simulation that `uses` it); a ring is a
**lens** (changes nothing narrated). The playhead is a lever wherever narration states what it shows; d4's ghost hand
is dropped, a faint tick marks where the narrator left a lever. 19 levers (3/4/4/2/4/2), one gesture each, performed
with a labelled readout, then one hand-over with a well-posed "Your turn: …". Cues name levels, never "now". Every
readout has a comparison target; measure before painting. Table selectors (n_v, chart) are lenses. Ranges are
clamped where picture and number would disagree. Simulations are seeded, Float32, ≤ 500 walkers per mode, snapshots
every 0.5 s (a Float64 copy of 1,000 × 9 walkers costs ≈ 13 MB per 90 s scene).

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

Each episode opens on its station (E·0, 10–12 s; the swimlane lights the era) and closes with question surgery and
a Must. Default transition: the scene ends on the question its beat raises, then the house dip (0.6 s in, 0.45 s
out); shared pictures use `continues: true`. Live scenes hand over once after the narrator's demonstration.
R-numbers are rigs (§5), A-numbers assets (§6), ★ the piece's one climax. Fixes the judges asked for are mapped to
scenes in §8.3.

### P0 · Where to Add the Noise (2:25, narrated)

**P0.1 ★ Cold open · 30 s.** *Screen:* one held-out BBA molecule (28 Cα tube) twice as a gold playhead sweeps t
0 → 0.5. Left, Cartesian noise: sticks fray first, the outline lingers. Right, ordered internal coordinates
(internal at thermal width plus two teal arrows): sticks stay crisp, the chain dissolves near t ≈ 0.3, the arrows
stay readable until about 0.5. Title fades in. *Computed:* R25 plug-in decodes of one seeded draw rescaled per
level (A13, A14, A11), caption "one draw rescaled: each frame a correct noisy sample, not a diffusion path".
*Numbers:* none (the playhead shows t only). *Beat:* where the noise is added decides what survives. *Climax:* one
protein dissolving in two opposite orders.

**P0.2 Two papers, one gap · 40 s.** A 2×2 grid, "generator?" against "geometry?": ScoreMD (flat, Fokker–Planck
consistent, small-t score doubles as a force field, a sampling/simulation trade-off) and Diepeveen's wδ (shape
geometry, no generator). The empty cell lights gold: "July 2026: a generator on the wδ shape space" (exposé
2026-07-02). Muted chip: "R-DM (2024) already pairs an energy metric with a denoiser, added to related work 07-31"
[S g1]. *Beat:* geometry plus a generator, one model for sampling and forces.

**P0.3 Six questions · 55 s.** The Journey Map draws six stations and types the questions (§1.1); the swimlane
underneath (Era 1 07-02 → 10-22; Era 2 10-23 → 11-14; Era 3 10-23 → 11-16; Era 4 10-24 → 11-14; Era 5 11-11 → now),
"the line orders by logic, the strip by date"; an empty List of Musts; the author's sentence [S talk slide 3]. No
numbers, no lanes, no Clock yet. *Beat:* a path of measured reasons, not a random walk.

**P0.4 How to watch · 20 s.** Episode map with durations; foundations (Parts 0/1, Covariance, Retention) as
dashed side doors; the explorables; the committee path P0 → E5 → E6.

### E1 · Far Away, and Too Close (9:42; levers `ruler`, `S`, `e`)

**E1.0 Station Q1 · 12 s.** Era 1's long bar against everything after: "the first attempt built the machinery and
the contracts".

**E1.1 One ruler for everything · 75 s · lever `ruler`.** *Screen:* Part 1's five-atom toy (stamped "TOY ·
energy.js") with axes "‖Δx‖ (Å)" and "U (k_BT)" threaded to each configuration, in three builds: rotamers and the
straight chord; a stretch against a torsion arc; a rigid rotation along Part 0's orbit (‖Δx‖ grows, U fixed). Then
two real αR pairs (mdshare traj 0, Kabsch-overlaid): A differs by a stiff stretch, B by a soft rotation, on two
threaded rulers "RMSD (Å)" and "thermal distance (widths)". *Computed:* R5; R6, d_th = √(ΔqᵀΣ_q⁻¹Δq) with the αR
covariance (A3). *Numbers:* rotamers 1.75 Å apart; the chord squeezes O–H 0.96 → 0.40 Å at U = 3.27 eV ≈ 126 k_BT
against ≈ 0.10 eV along the torsion path; a 0.1 Å stretch is 0.11 Å away for 4 k_BT, a 1.0 Å torsion arc 0.95 Å for
1.7 k_BT: "Euclid calls the stretch 8.5× closer; the energy calls it 2.4× costlier" [D·model, a1 §6.1]. Pair A RMSD
0.036 Å, d_th 4.0; pair B 0.243 Å, 1.46; rank correlation ρ = 0.50 over 60,000 pairs [M †, d3 check, reproduced by
A3]; stamp "one basin's covariance". *Live:* comparison target the energy bar; hand-over at 60 s: "under the thermal
ruler, how many ångström of ψ swing make one bond width?" (computed from A3, inside the harmonic basin).
*Beat:* Cartesian distance ranks configurations against their physics, on a toy and on real frames.

**E1.2 A ruler in percent · 55 s · lens `units`.** F(X) = ((log r_ij)_{i<j}, √δ log det G_X) built from parts; a
1.5 Å and a 5 Å pair each pulled +0.1 Å; the scale–shape cylinder (dilation along a = (1, …, 1, 2d√δ)). *Computed:*
R7. *Numbers:* costs 0.004165 against 0.000392 (10.6×); under Å → nm Euclid scales ×0.1 while wδ stays 0.222685
[D r1 E5]; C = m + 36δ = 46 for n = 5 [D r1 E4]. *Beat:* wδ measures relative deformation; scale splits off exactly.

**E1.3 The straightening hope · 55 s.** A 3-D cartoon ("the real image is 9-d in 11-d"): shape space as a curved
sheet in feature space, a straight feature chord dropped back onto it; a dimer closing a contact 10 → 4 Å; two cited
cards; the supervisor-deck valley cartoon (ThesisDiscussionFrank2 slide 6) redrawn and stamped **HOPE** (dashed);
link Covariance 23. *Computed:* R10; "the w-geodesic is the realizable molecule nearest the straight feature chord"
[D g2 M2]. *Numbers:* dimer midpoint 6.325 Å (wδ) vs 7.0 Å [D g2 E1]; AK rank-1 tangent PCA "about 85%", "about
1 Å", nsp13 rank 7 [S Diepeveen 2024]. *Beat:* the hope, shown before the attempt. *Plant:* HOPE → Q3.

**E1.4 Two barriers · 45 s.** The Odometer twice: two beads approach (Euclid finite, wδ → ∞ as log r → −∞, rose);
a flattening cloud (hatched ink, preview of E1.6); the bound |Δ log det G| ≤ d_g/√δ with Diepeveen's motivation
"collisions should be infinitely far, like Lennard-Jones" [S]. *Computed:* R7. *Beat:* wδ puts collisions and flat
clouds infinitely far. *Plant:* the collision dial becomes a rose pin at Q6.

**E1.5 Noise without a formula · 75 s · lever `S`, lens `start distance`.** *Screen:* a `codeBlock` pane: flat
noising is `x_t = α x₀ + σ ε`; intrinsic wδ needs a frame eigendecomposition, S = clip(⌈8r²⌉, 8, 1024) Verlet
sub-steps with a horizontal solve each, T walk steps and 500 reverse steps. Right: a live geodesic with a side panel
in feature coordinates, where it is straight. *Computed:* R8: x ∈ (0, ∞)², g = diag(1/x₁², 1/x₂²) (pullback of
F = (log x₁, log x₂)); ẍᵢ = ẋᵢ²/xᵢ, exact xᵢ(s) = xᵢ(0)exp(sẋᵢ(0)/xᵢ(0)); fixed-step Verlet; readouts endpoint
error, "crossed the barrier?", and the chord bound with one line: "the straight feature distance cannot exceed the
path length; red means the integrator broke it". *Numbers:* on 256 real clean frames (δ = 1) the chord bound fails
on 38.3% at 8 sub-steps and 2.34% at 128 [M r1 E14]; cost per sample 0.74 s flat vs ≈ 253 s (≈ 340×) vs ≈ 445 s
(≈ 600×) [M Sprint 7, "indicative: small cold benchmark"]. *Live:* the narrator fails at S = 8 near the wall, then
"start closer to the wall: how many sub-steps keep the endpoint on the line?" *Beat:* step selection is not error
control. *Plant:* "in feature coordinates this geodesic is a straight line" → E3.2.

**E1.6 ★ The barrier sat where the molecules live · 90 s · lever `e`, lens `beads`.** *Screen:* the cloud X_e =
((±1,0,e), (0,±1,−e), (0,0,0)) in 3-D on an authored orbit, flattening as e runs 0.5 → 10⁻⁴; Euclidean and wδ
odometers and a condition gauge; then a translucent heap (log histogram of λ_min(G_X)/tr G_X over real ALDP5
frames) piling against a wall "∞ in wδ"; lens `beads` = {5 backbone | 6 with Cβ | 5 + phantom x_v = Cα + 1.5 Å n̂}
moves the heap off the wall. *Computed:* R7 (Jacobi on the 9×9 horizontal block); A4 (strided subset, own minimum
printed). *Numbers:* Euclid → 1.0 while wδ reads 3.2489 / 7.8377 / 12.4378 / 17.0407 at e = 0.1 / 0.01 / 10⁻³ /
10⁻⁴; condition 42.1 → 6,437 → 6.0×10⁷ at e = 0.5 / 0.1 / 0.01, ∝ e⁻⁴ [D r1 E1]; over all 800k frames worst
condition 1.55×10⁶ (n = 5) vs 4.2×10³ (n = 6), λ_min 1.6×10⁻⁴ vs 0.10 [M Sprint 7]; the phantom changes the
geometry: dilation √46 → √51, three extra noised directions [D r1 E6]. *Live:* hand-over at 70 s, "push the cloud
toward the plane: which odometer runs away?" *Beat:* the barrier that makes wδ elegant sat on the data. *Climax:*
the squashed cloud, the wδ needle past 17, the heap against the wall.

**E1.7 Finite is not correct; the moving baseline · 80 s · lens `date`.** *Screen:* a bug onion of four cards with
one-line lessons: transposed 3×3 blocks ("invariants beat parity"; rigid residual 1.3×10⁻¹⁴ vs 5.97 [D r1 M5]);
TF32 (≈ 11% of GRW paths ran to ~10⁵ [M #252]); the clock ("a multiplier that must stay positive crossed zero"; lens:
A(t) = 1 − ½β(t)τ(t), A(1) = −0.111 vs a(1) = 0.00657 [D r1 E3]); the score sign. The other five bugs live in X3.
Then a log-JS scoreboard (Aug → Oct) pairing **only within a campaign** ("≠" between campaigns; validity beside
every JS). *Numbers [M]:* Sprint 1 (n = 6, 3 seeds): wδ·GRW+OU 0.117 ± 0.007, identity 0.479 ± 0.005, **best flat
0.167 ± 0.012**; 0.180 struck. Sprint 5 (10k campaign, epoch 10,000): wδ 0.119 ± 0.012, 77% physical, vs flat
0.263/0.268 (lens: 2k campaign, epoch 1,000, 0.103 ± 0.009 vs 0.239 ± 0.007, 0.293 ± 0.020); the author's slide:
"0.12 vs 0.26 … 23% unphysical, costly geodesics; tied with the strongest flat baseline" [S]. Sprint 7: finite 0.9996
yet JS 0.325, φ > 0 box 25.2% vs 0.60% (reflection-confounded). Sprint 8: flat 0.2846/0.2618 → 0.1012 after the
vp_mean fix (10-02, N = 2,000); ScoreMD-native 0.0151 vs floor 0.0114; wδ 0.1664 vs flat 0.2405. Sprint 9: bond W1
0.239–0.558 Å, 46–109× its W1 floor [M #474]. Stamp "indicative". *Beat:* fixing numerics moved the blocker to the
law; the early win was 4× against identity, 1.4× against the best flat arm (itself plausibly hit by the vp_mean bug,
[H]), and gone once the target was fixed: "fix the baseline first" [S Sprint 10]. *Plant:* scoreboard → Q6.

**E1.8 The famous figure, with its missing baseline · 55 s · lens `rank-1 check`.** AK closed → open in three rows
(MD, wδ separation interpolation, aligned Cartesian chord) at frames 25/50/75 as Cα tubes, with bars. *Computed:*
A10. *Numbers:* mean RMSD Cartesian 1.784 vs wδ 2.053 Å [M aldp-reference]; adjacent Cα 0.144 vs 0.077 Å [M #513];
ALDP5 0.224 vs 0.247 Å, local distances 0.052 vs 0.032 Å [M #513]; "a DIMS directed transition; the curve parameter
is not time" [M #522]; lens only, †: Cartesian PCA PC1 0.8934 vs ProteinAtlas wδ re-run 0.8927 beside the paper's
"about 85%", reconciled on screen. *Beat:* wδ's reproducible advantage is short distances; "the directed data alone
may explain the rank-1 result (programme check)". *Plant:* "keeps neighbours apart" → E6.7.

**E1.9 Verdict · 40 s.** The 10-22 closeout card: "flat Cartesian stays the default; wδ becomes a restricted-domain
reference" [M #520]; stamp NEGATIVE AS A METHOD · POSITIVE AS ARCHITECTURE; seed card "the same features later work
as an embedding (E3)". *Question surgery:* "Which geometry ~~puts unphysical shapes far away~~ → *should a geometry
do to the noise?*" *Musts:* M1, M2. *→* "Part 1 asked this with a toy; Episode 2 asks the real molecule."

### E2 · The Noise Has the Wrong Ruler (10:45; levers `λ`, `γ`, `t_min`, `t*`)

**E2.0 Station Q2: where Part 1 stopped · 30 s.** PR #745 (10-23/24). Part 1 scene 14 as a still, three problem
thumbnails "toy, κ_H = 400 [I]". *Numbers:* κ_Σ 100–200 inside a basin, ≈ 920 across data [M n20 §0, §1.4,
bgmol]; Part 1's "×20 in noise level" is ×10–14 in one real basin, ×30 across data [D g4 §3.5]. *Beat:* stiffness is
real; now the real molecule and the real schedule.

**E2.1 What the network sees at the floor · 45 s.** The ALDP5 mean backbone (mdshare traj 1) with 24 posterior
completions of one noisy observation at t = 0.01 at the pilots' production scale: torsion ghosts coincide, bond
ghosts fan out; no meters yet. *Computed:* R3, x_k | y ~ N(r_k y/α, λ_k(1 − r_k)) on A1's eigenvectors, stamp
"exact posterior of a nine-mode Gaussian model [D·model]". *Numbers:* "t = 0.01 · σ = 0.0446 · ×0.9418 Å → 0.042 Å
per coordinate (pilot floor)" [D g4 §3.3]. *Beat:* at the lowest trained level the stiffest modes are still
mostly undecided.

**E2.2 One mode, one meter · 75 s · lever `λ`.** One shared axis, never rescaled: 400 seeded samples of
Z ~ N(0, λ), then their noised images, then the exact curves; below, the **rail is introduced** with the meter
r(t), half point, decision bar, waterline and fog. *Computed:* R1, R2. *Numbers:* t½(1) = 0.259; the decision
window is a factor 16 in SNR (2.77 log-SNR) [D g3 C2]; R = ½ keeps ≥ ½ ln 2 ≈ 0.35 nats [D n27 §1]; a width keeps
r² [D n26]. *Live:* hand-over at 60 s: 100× more variance moves t½ only 0.093 → 0.486 (λ 0.1 → 10) [D r4 E1].
Link: Retention. *Beat:* for a Gaussian feature only its variance in noise units decides when it is erased.

**E2.3 Nine rulers in the fog · 85 s · lever `γ`, lens `unit`.** Nine rail rows, one per ALDP5 principal mode,
labelled by its eigenvector on a backbone thumbnail, with window bar, t½ glyph and training-share bar. *Computed:* R3,
λ_k = (w_k/0.9418 Å)²; the noise-shape handle sets λ_eff = λ_k^{1−γ} (γ = 0 flat, γ = 1 metric-shaped), badged
**[D·model · display interpolation]**: "the project compared γ = 0 and γ = 1 on ALDP5; the continuous dial is BBA's
(#1057)". *Numbers:* widths 0.0252 … 0.6631 Å [M mdshare traj 1]; flat t½ 0.00483, 0.00607, 0.00994, 0.0139, 0.0175,
0.0366, 0.0569, 0.108, 0.196 [D g1 §3.1], three below the floor; training share 0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9,
18.8% vs 25.2% per unit channel [D]; the stiffest mode enters the band at γ ≈ 0.14; spread ×40.6 / ×4.8 / ×2.0 at
γ = 0 / 0.5 / 0.75 [D]; caption "principal directions, not bonds; a bond length (√2σ) is half erased at
t ≈ 0.003–0.004"; lens `unit`: at the own scale 0.267 Å with floor 10⁻⁵ every mode clears its floor [D r3 E19].
*Live:* hand-over at 70 s: "find the γ at which the stiffest mode enters the band." *Beat:* under the trusted schedule
no trained level resolves a bond (n21 Prop. 5); thermal units put all modes on one clock.

**E2.4 Below the floor · 65 s · lever `t_min`.** A bond-length histogram (width w), the floor noise s, the Tweedie
image of every sample; inset, the flat production model's bond-width ratio vs updates. *Computed:* R3,
w/√(w² + s²), s = √2 × 0.042 = 0.0594 Å. *Numbers:* bond SNR at t = 0.01 **below 1 in every convention**: 0.30–0.46
manifold route, 0.34–0.52 pilot scale, 0.16–0.18 window mode [D n21 §5.2; g4 §3.6]; Tweedie predicts 0.39–0.46,
measured 0.44–0.53 at 200k (#765) and 0.49–0.58 at 40k (#754), 1.8–2.8× too broad at 1k [M]. *Beat:* a floor wider
than a bond means bonds are never trained, and the last step shrinks them. *→* "If the loss never sees bonds, why
did Part 1 say it over-charges them?"

**E2.5 One wrong ruler, seen from both sides · 85 s.** Left, Part 1's Problem 3 bars ("per level a 5% stiff error
costs κ_H more", 400 [I]); right, each mode's per-level loss weight against its readable window, the product shaded
and integrated; below, a loss trace with minibatch scatter and a 0.001 notch. *Computed:* R4. *Numbers:* integrated
over-charge ≈ 1.5×: 17.5 vs 11.4 **in units of ½·0.05²** [D n21 §6, §8] (units printed so the digits are not read as
n20's κ_res 17.5/11.4/22.3); the σ ≈ w band is ~6% of training times; a bond 23% too broad costs ≈ 0.009 of a loss
≈ 1.0; 8.5% → 5% lowers the ideal loss ≈ 0.001, 20–70× below the 0.02–0.07 scatter [D, idealized, LESSONS D18];
a constant score error δ shifts samples by Σδ at KL ½δᵀΣδ, so equal relative errors cost ½·0.05² in every mode:
**the samples feel errors in thermal widths** [D n21 Prop. 8]. *Beat:* the single reconciliation: a huge per-level
weight on a window the noise almost never opens.

**E2.6 The training valley · 35 s · lens `pairing`.** A link card to Covariance 15 (balanced gradient flows) with a
bowl thumbnail, then the ALDP5 pairing table; an [S] chip opens the precedent ledger (Ahamed 2026, preconditioned
score/flow matching, g3). *Numbers:* training curvature 1.9×10⁴ (Riemannian, raw) / 146 (covector) / 8.1
(whitened, thermal); GD from zero 24,319 / 589 / 31; Adam 3,941 vs 226 [M/D n21 §4.3; κ_train chip]. *Beat:*
gradient descent feels stiffness twice (input variance × loss weight); thermal units in and out fix sizes and gains
(Problem 2).

**E2.7 The blur dial · 90 s · lever `t*`.** ScoreMD's seesaw (beam pivot = read-out level); then the nine meters
become a curve r(t*) with measured Stein ratios as toy/molecule pairs; right, seeded Brownian dynamics of the
nine-mode Gaussian under the blurred force, histograms of modes 1 and 9 against their widths. One convention on
screen: driver F = Jᵀα s(αφ) + ∇ log vol; n29's form differs by α_t² on unit-variance channels (0.994 at 0.02, 0.971
at 0.05) [D g4 §3.11]. *Computed:* R3, F_t(x) = α s_t(αx) = r(t)F₀(x), inflation 1/√r [D g1 §2.11]; walkers
du = −r_k u dt + √2 dW, 500 per mode, Float32. *Numbers:* [S ScoreMD via g1] ALDP Two For One's simulated C–N bond
23.51 ± 1.91× worse than Both; BBA Diffusion iid 0.034 but simulation 5.387, Two For One 1.624 (read at t = 0.005),
Both 0.234/0.254. Ideal r(0.01) 0.264 … 0.996 [D·model]; measured flat production, seed 0: 0.198, 0.252, 0.293,
0.485, 0.459, 0.418, 0.694, 0.727, 0.369 [M #768]; flat low floor at 0.003: 0.91–1.04 (**seed 0 only**), yet its
simulations drift to 83% αR (MD 35%); thermal r(0.03) = 0.988 for every mode [D]. *Live:* hand-over at 75 s, "find one
flat level where all nine sit near 1" (none; thermal units flatten it); the handle returns in E6.6. *Plant:* omitting
the volume term shortens ALDP5 bonds by 0.30–0.36 thermal widths [M n20 §8]. Link: Interactions 12. *Beat:* a force
read at level t is the blurred molecule's force; in thermal units one level serves every mode.

**E2.8 The ruler must turn with the bond · 60 s · lens `drag bond`.** A rotating bond: a constant equivariant metric
(A ⊗ I₃, Schur's lemma) is stiff along the wrong axis after 90°; an ellipse attached to the bond stays right; the
cone's silhouette as preview. *Numbers (κ_res chip):* fixed global whitening worse than flat, 273 vs 192 (β/C7eq),
477 vs 112 (αR); spring 9.6/7.6/13.4 vs flat 192/112/97 [M n20 §5.3, bgmol, in-sample]; moved here from E1:
"judged by this question, wδ (δ = 1) made ALDP5 stiffer: 413 vs 192" [M n20 §5.3]; rotating-bond residual
13.9/8.3/13.0 at k⊥ = 10/30/100 [M n21 §7.2]. *Beat:* a stiffness metric depends on the configuration, so it is
curved and its noise has no closed form [D n20 Lemma 2; n21 Lemma 4].

**E2.9 ★ The promise: erase everything together · 45 s.** Nine rulers fade in unison under unit noise; four rows
E1 output scale, E2 balanced loss, E3 conditioned target, E4 synchronized erasure, each tagged with its owning
choice; "only the forward noise can do E4" [D n20 §4.6]; honest limits "says nothing about torsions, rare basins,
long-range correlations" [D n20 §4.7]; a small "?" pin on E4. *Climax:* nine real rulers in one column at
t½ = 0.259, "the promise".

**E2.10 Verdict · 30 s.** "What should a geometry do to the noise?" → "How can the noise follow a curved metric
*without solving geodesics*?" Must M3. Stamp GOAL: SYNCHRONIZE (E4) ?

### E3 · Lift, Noise, Project (11:37; levers `site`, `θ`, `τ`, `ν`)

**E3.0 Station Q3 · 12 s.** Tracker #769 (10-23 → 11-16); Q2 and Q3 lie within 48 hours: "separated by logic, not by
date".

**E3.1 The springs are a pullback · 70 s.** The ALDP5 backbone with springs on 4 bonds and 3 one–three pairs;
Part 1's formula flight assembles G = J_dᵀWJ_d + k⊥I, then F(x) = (W^{1/2}d(x), √k⊥ x) with G = DFᵀDF; the repo's
own network with Part 0's six vertical tangents at zero length; Part 1's "Next video" card paid off. *Computed:*
R11. *Numbers:* bond constants 1,100–1,660 Å⁻², one–three 300–460 Å⁻², k⊥ = 30 Å⁻² [M n20 §1.4, ranges]; for
`energy.js` G = JᵀWJ = K at rest, 6 zero and 9 internal eigenvalues 0.0264 … 53.99 eV/Å², κ_H = 2,048 [D·model g4
§3.2; "Part 1's 400 was a two-mode illustration"]. *Beat:* the spring metric is the flat metric of a bigger space
seen through pair distances: Part 1's "G ≈ K", delivered.

**E3.2 ★ Lift, noise, project · 95 s · lever `site`, lens `contrast`.** 3-D in Covariance 29's camera: a planar bond
b ∈ ℝ² lifts onto the cone F(b) = (√k_∥|b|, √(k⊥/2)b), first exaggerated (k_∥/(k⊥/2) = 3, 30°), then the real 5.9°;
thermal samples on the cone; the same seeded draws added in configuration or in feature space and projected to the
nearest image point; a fog noise ball (gold outline while in focus) casts a needle-thin shadow beside the round blob
of flat noise; `y_t = α y₀ + σ ε` appears beside E1.5's pane: "the geodesic that was straight in log coordinates:
embedding makes that the rule". *Computed:* R12 (closed-form nearest point; Monte Carlo aspect tested within 3%);
Cov(δx) ≈ s²(DφᵀDφ)⁻¹ [D n23 §4.3]. *Numbers:* at k_∥ = 1,400 Å⁻², k⊥ = 30 Å⁻², r = 1.5 Å [I]: c = 0.103
(half-opening 5.9°), σ_r = 0.0266 Å, σ⊥ = 0.258 Å; aspect 1.00 (configuration noise) vs 0.103 (feature noise)
[D n22 Prop. 4; r3 E1–E2]; caveat "a 2-D cone is flat; curvature needs the 3-D bond". *Live:* hand-over at 80 s,
"switch where the noise lives; watch the bond-length readout"; lens `contrast` (1 → 93.3): c and σ_r/σ⊥ agree to
every digit. Links: Covariance 32; Retention 03. *Beat:* round noise above is molecule-shaped noise below, with an
exact kernel; the price is projecting back. *Climax:* the needle-thin shadow beside the round blob.

**E3.3 You cannot flatten an orange peel · 85 s · lever `θ`.** The sphere of bond directions (radius R = r₀/σ⊥) with
G = (k⊥/2 + k_∥)dr² + (k⊥/2)r²dΩ²; the cap as a glossy peel pressed flat, circles of constant tilt stretching; the
theorem card; coda "same metric, two machines". *Computed:* R12: deficit 1 − sin θ/θ; ρ = √(2ρ₀²(1 − cos cθ)),
ρ₀ = √(k⊥/2 + k_∥)r₀; bound 𝒦ρ²/12; n22's exact four-point values as points. *Numbers:* R = 5.81 thermal widths;
**𝒦_tan = 0.0293 per squared thermal width** [D n22 Props. 4/6]; flatness would need angular width to shrink 9% per
1% of stretch [D Prop. 6]; the true one-bond Hessian has 𝒦_tan = −0.684 and turns indefinite beyond 0.016 Å of
compression, hence the Gauss–Newton part [D Prop. 5]; at θ = 0.5 deficit 4.1%, 𝒦ρ² = 0.25, bound 0.021, exact 0.022;
exact ε 0.0008/0.0076/0.022/0.061/0.16/0.35 at θ = 0.1/0.3/0.5/0.8/1.2/1.6 vs bound 0.0008/0.0074/0.021/0.053/0.12/0.21
[D §5.2]; equivariant flat maps of one bond err ≥ 0.14–0.56 vs 0.018–0.11 for S²×ℝ [D §5.3]; ALDP5 in a basin
0.2–1.5% (1–8% achievable), heuristically 3–20% over the torsion landscape [D/H §5.4, n23]; a higher-dimensional
embedding reproduces the metric exactly [D §5.1]; coda: wδ as an embedding trains in 318 vs 259 s [M Sprint 12].
*Live:* hand-over at 65 s, "tilt further: when does the forced error pass 5%?" Link: Atlas. *Beat:* don't flatten,
embed.

**E3.4 Redundancy hides stiffness in the normal directions · 40 s · lens playhead.** Feature noise scatters off the
cone, each point drops to its image along a leader line, a bar splits tangent from normal variance. *Computed:* R13.
*Numbers:* α/σ = 22.4 at t = 0.01, 999.5 at 10⁻⁵; 1/σ² = 502 at 0.01 [D n28 §4]. *Beat:* redundancy converts finite
stiffness into a normal stiffness that diverges at low noise. *Plant:* → E4.3b.

**E3.5 The race · 80 s · lens `checkpoint`.** A correction pill: "#757–#763 'late-training degradation' → #765
(10-26): XLA miscompiled the final denoising step, shifting every GPU molecule by 0.018 Å; re-run under a
pre-declared protocol, 3 seeds" [M r3 §1.5]. Five columns (flat t ≥ 10⁻⁵, flat production t ≥ 0.01, spring, learned
warp, wδ) with Ramachandran (36×36) and bond-1 histograms recomputed from 20,000 stored molecules of seed 0; below,
log–log bond W1/σ vs updates with seed ribbons and hatched sample floors (0.010/0.017/0.011), flat first, spring
swapped in. *Computed:* A5. *Numbers [M #765, mdshare, 3 seeds]:* bond W1/σ at 1k/5k/20k/200k: spring
0.018/0.013/0.012/0.013; learned 0.020/0.016/0.016/0.015; flat low floor 0.186/0.068/0.046/0.015; production
0.981/0.173/0.291/0.422 (rising); wδ 0.042 → 0.018; bonds at the floor ≈ 100× sooner, angles 10–20×; φ/ψ JS inside
the floor band by 5k, 0.0207 (flat) vs 0.0201 (spring) at 200k. *Guard:* histograms for display, scores from the
protocol (a test checks 5% agreement); "flat catches up with long training (#886: 0.994–1.049 at 200k vs
1.115–1.291 at 20k)". *Beat:* stiff geometry ≈ 100× sooner; torsions do not care.

**E3.6 One model, two uses · 40 s · lens `force field`.** Stein needles per direction (target 1), then the
consistency diagonal (iid vs simulated bond width over MD, line y = x). *Numbers [M]:* Stein at 200k (directions
1–3 | 4–7): spring 0.97–1.03 | 0.91–0.99, learned 0.96–1.00 | 0.93–1.01, flat production 0.20–0.29 | 0.42–0.69
[#768]; diagonal (#886, conservative transformer, 2 seeds, read at 0.05): aligned Cartesian 1.006–1.090 vs
2.328–2.778, springs 0.966–1.022 vs 0.993–1.066, wδ 0.954–1.002 vs 1.187–1.328, whitening 0.956–1.016 vs
1.036–1.100; flat low floor iid JS 0.021 but simulation 0.142 [#768]. *Guards:* "a parallel to ScoreMD's dilemma,
not a head-to-head"; "a common force time is not a common smoothing"; real walkers from β in X2. *Beat:* in thermal
units the same weights sample and simulate, on ALDP5.

**E3.7 Faster, not better · 65 s · lens `effective samples`.** A map-zoo strip (trajectory and quantum springs,
shared quantum φ, invariant embedding, global whitening, graph metrics) lighting one stiff-mode benefit; then the αL
barcode: three 250 ns φ > 0 hysteresis strips (±20°), counters to 37/37/37, three error bars in turn. *Computed:* A8;
R30. *Numbers:* one GFN2-xTB calculation predicts bond sds 0.0246–0.0336 vs measured 0.0252–0.0307 Å, but its
pre-declared gate failed (95.05%/92.88% < 98%) [M #788 via r3]; global whitening of invariants gives most of the gain
(iid bond widths 0.989–1.010× MD) [M #808]; αL populations 3.24/1.65/4.11%, dwell 219/111/278 ps [M n25 §6.1]; bars:
n25's "Cramér–Rao" 0.90/1.27/0.79 **struck** ("one Bernoulli trial per visit"), Markov (1 − p)√(2/n) =
0.225/0.229/0.223 [D †], data-based τ_int 900–1,300 ps, 96–139 effective samples, 95% intervals
0.4–7.0/0.0–4.6/1.1–7.9% [M #779]; canon "37 visits, about 100–140 effectively independent samples; one trajectory
pins αL only to about ±50%"; not improved: torsion PMF 0.332 vs 0.355 k_BT² (≈ 2 SD); flat learns αL faster (ΔF error
0.016 vs 0.077 k_BT at 20k); against the held-out trajectory every arm errs by 0.68–0.72 k_BT [M]. *Beat:* the stiff
part became easy; the multimodal part did not, and one reference cannot rank it.

**E3.8 A lens that makes every step round, and its dial · 90 s · lever `τ`.** ALDP5 1 ps steps as ellipses (axis
ratio √κ_step) morphing into near-circles under the learned warp (a coupling flow fitted only to 1 ps steps, 10-24,
#753), its top-4 magnified directions beside the bond gradients, a κ_step ladder; then a time-scale ladder and n25's
four-mode basin with G_τ bars and half-erasure levels, and the measured 1 ps table as variance and width fractions.
*Computed:* R14. *Numbers:* κ_step flat 184/185 → constant whitening 24.6 → scaled internal 3.88–3.95 → learned
2.99–3.04 (floor 1.55); overlap with bond gradients 0.973 (chance 0.444) [M #753, mdshare]; chip "κ_step ≠ κ_res";
ladder bonds < 1 ps, φ ≈ 10 ps, ψ 20–50 ps, αR↔β 100–200 ps, αL 5–20 ns [M n25 §3]; λ = 1600, 400, 25, 4 Å⁻²,
D₀ = 0.08 Å²/ps: t_k = 0.0078, 0.031, 0.5, 3.1 ps, and at τ = 1 ps half erasure at σ²/α² = 1, 1, 1.02, 2.12, a spread
of 2.1 vs 400 under flat noise [D n25 Prop. 2]; measured 1 ps coverage bonds 0.91–1.03, φ 0.24, ψ 0.052 ("the 1 ps
metric weighs ψ ≈ 19× too stiff"; width fraction √0.052 = 0.23) [D g4 §3.8]; stamp "k⊥ = 1/(D₀τ)". *Live:* hand-over
"turn τ until ψ counts as soft". *Beat:* a flow fitted to 1 ps steps finds the bonds without chemistry, and its lag
is a dial for which modes count as stiff: the project's first order statement.

**E3.9 The plot twist of 5 November · 85 s · lever `ν`.** The race at 100 updates as four Ramachandran thumbnails
with JS bars; a correction pill "11-05: synchronized erasure [H] → Gaussianization [M], same day"; a live 1-D toy:
a bimodal ψ-like density morphed by ν from raw to Φ⁻¹(F(x)), the noised score straightening, a 9-parameter
RBF+linear score trained by seeded SGD (DSM at t = 0.1) with an update counter; then Diepeveen 2025's squeezed banana
(a straight segment dives through improbable land; the valley is straight in the Gaussianizing chart); E1.3's HOPE
flips to **CAME TRUE, DIFFERENTLY**. *Computed:* R15 (simulation `uses: ['ν']`); R16. *Numbers:* JS at 100 updates
flat 0.117 (**computed on its 10% valid molecules**), warps 1/10/100 ps 0.127/0.049/0.027, spring k⊥ = 30/8/2
0.133/0.149/0.163 [M lag sweep, 2 seeds, CPU]; KL to a Gaussian 0.96 (flat, 1 ps) / 0.20 / 0.14; Gaussianized
torsions 0.042 vs control 0.255 [M]; banana φ(x) = (x₁ − x₂²/9, x₂), A = diag(1/81, 4): ψ peaks at 40.5 on the line
vs ≤ 1.125 on the geodesic, KL = ½ ln(1 + 2A₂₂²/(81A₁₁)) = 1.748 nats, latent score linear −(α²A + σ²I)⁻¹y, raw
cubic [D g2 E2]; the price: at 20,000 updates flat 0.0203 beats the warps (0.0227–0.0236) and the αL saddle holds 30
vs MD's 4–6 per 10⁴, as Diepeveen 2025's unimodal scope warns [M/S]; toy counts [I]. *Live:* "un-Gaussianize; watch
the counter". *Beat:* straightening came true as Gaussianization: a fast start with a late cost, not synchronized
erasure. E2's "?" pin flickers.

**E3.10 Verdict · 35 s.** Footnote under the ALDP5 molecule: "ALDP5 has no separation of local and global structure
and cannot test order" [S status]. "How can noise follow a metric without geodesics?" → "Does it *survive 28
beads*?" M1 ticked. Stamp: STIFF MODES FIXED · TORSIONS: NO GAIN · GAUSSIANIZATION: FAST START, LATE COST.

### E4 · No Map Got Both Halves (9:05; levers `divisor`, `base`; all on BBA)

**E4.0 Station Q4 · 10 s.** First line: "ALDP5 cannot test order."

**E4.1 Meet BBA · 60 s.** A real DESRES window (sorted by membership id; "200 ps per frame, documented, not
measured") folds and unfolds as a Cα tube, hairpin (0–12) and helix (14–25) bracketed once; an Rg trace over the
full-data histogram; a point on the frozen 403-feature TICA map; dated data cards (07-27 placed; 10-19 found
byte-identical to ScoreMD's generated `deshaw_dummy.zip`, struck; 11-01 the authentic set). *Computed:* A15, A16.
*Numbers:* 1,625,195 frames, 1,300,156 training (the paper split) [M r8]; mean Rg 10.60 Å, 5/50/95% 8.37/9.89/15.30
Å, folded share 0.194 [M]; "the two rulers disagree ~38× (√1,423) between the stiffest and largest Cartesian mode"
[D n27 §3; S talk slide 2]. *Beat:* what makes BBA hard is global.

**E4.2 ★ The two-halves plane · 80 s.** Log bond W1 vs log Rg W1, the "both right" corner outlined gold
("wanted"); a real data molecule beside it (generated ones only if A-REQ-1 arrives, else "scalar results only");
failed decodes fall off the plane. *Numbers [M matched-results; 190,350 upd (10%), seed 0, 100k]:* internal 0.000274
Å / 0.166° / Rg 0.521 Å; Cartesian 0.415 / 5.24 / 0.072; springs 0.320 / 8.85 / **0.078** (size right, bond advantage
lost; 97,113 decoded); whitening 0.705 / 24.4 / 0.497 (**neither**; 96,271 decoded); wδ 0.113 / 3.24 / 0.085;
floors bond 0.0002 Å, Rg 0.006 Å; arrow: pair-distance inputs move Cartesian bonds 0.4207 → 0.0078 Å (54×, 190,350,
#985); chip: earlier #895 (100k, 2 seeds) spring bonds 52× better (0.6371 vs 0.0122 Å) with TIC JS no better
(0.0529 vs 0.0479), whitening TIC JS 0.2499 with PMF 4.832 under #895's own PMF definition (chip "≠ #1138 paper PMF"). *Beat:* no map got both halves; whitening got neither.
*Climax:* three occupied corners and the glowing empty fourth (returns in E5.6, E6.2).

**E4.3 Four autopsies · 105 s · lever `divisor`.** #1025's resolution grid σ*/σ(t_min) (≤ 1 never resolved):
Cartesian bond 6.4 rising to Rg 351; internal bond 22, Rg 3.0; springs bond 0.84; whitening 7.7/39/85/38; wδ bond
1.25; ALDP5 recipes 11–31 [M #1025]. Four panels: **(a) springs under water:** one global RMS divisor, 1.31 (ALDP5) vs
27.1 (BBA), puts channel sd at 0.037 < σ(t_min) = 0.045, half erased at t ≈ 0.0077; at 1.31 sd 0.76, t½ ≈ 0.21
[M #1025; D r3 E22]. **(b) noise leaves the molecule:** 3,303 features for 78 shape directions, 3,225 normal; tangent
share of the low-noise loss 0.06; loss 911 → 904 → 759 [M #1025, n28 §4]. **(c) internal:** Rg least resolved (3.0
vs 22). **(d) Cartesian:** bonds resolvable only below t = 4×10⁻⁴; distance inputs 0.76 → 0.013 Å (60×, 50k, #985).
*Live:* divisor authored 1.31 → 27.1; "lower it until the bars surface: what does BBA need?"; caption "the condition
number is scale-free; resolution is not". Must M4. *Beat:* each failure was measured without training and points to
a different requirement.

**E4.4 The chain that collapses · 75 s · lever `base`.** Three 28-bead chains with identical, perfect local geometry
(bonds, angles at BBA means) under torsion Monte Carlo with three bases (free, isotropic Gaussian, K ⊗ I₃), teal
gyration rings and live Rg readouts against targets; the middle chain balls up to half size. *Computed:* R29 with
bases from #1025's code, tested to ±0.3 Å at 20k sweeps before narration (else logged values beside an [I] Monte
Carlo). *Numbers:* data 10.59 ± 2.20 Å [M]; free 10.34 ± 2.26, isotropic 5.41 ± 0.51, matched 10.71 ± 1.92 Å
[D·model #1025]; the untrained spring-base model measured 4.9 Å [M #1025]. Must M5. *Beat:* right locally, wrong
collectively.

**E4.5 Size is a sum over distant pairs · 60 s.** Rg² = Σ W_kl b_k·b_l, W_kl = (min+1)(N−1−max)/N², built visually;
heat maps of W and the data's B_kl; bars of where C3's excess lives (a band map only with LISE panels). *Computed:*
R28, A16. *Numbers:* 92% of C3's excess ⟨Rg²⟩ from pairs ≥ 11 apart [M #1010–#1015]; **153** such pairs, not 136
[D g4 §3.14]. *Beat:* no local fix reaches a global sum.

**E4.6 The fold dissolves with the detail · 70 s.** Where C3 creates excess size: a held-out molecule with a size
gauge, logged band contributions as bars along t, a plug-in decode badged [I] (or #1119's local `forward-readout.csv`,
radius per level for C3 vs two-mode, after checking what #1119 measured); the Cartesian and C3 lanes draw in faintly.
*Numbers [M #1055]:* mean Rg 11.07 vs 10.60 Å; ≈ 90% of the excess is the hairpin–rest separation; molecules noised
to t ≤ 0.1 keep their size, from t = 0.3 they reproduce 94 ± 25% of the excess; bands 0.5–0.3, 0.3–0.2, 0.2–0.11 add
0.27–0.43 Å each; ≈ 70% of the gradient from t < 0.05; not accumulation (≤ 0.14 Å), pill "#1025 → #1055". *Beat:*
equalizing every motion erases the fold in the same band as the detail. The "?" pin blinks.

**E4.7 Prediction is not generation · 50 s.** A scatter: x the improvement of each line's own objective, y the change
in BBA size error, a grey ±0.046 Å band (reruns from identical initializations); the learned-embedding trade-off
line; a four-reason card; the empty rail fades in: "not how much the noise erases, but when". *Numbers:* ~30 loss
and target changes, none improving generation [M r4 §5.3]; potential supervision worsened size by 0.245/0.244 Å
[M energy-head study]; seed floor 0.046 Å [M #1059]; BBA "1 ps" pairs are 200 ps chords: linearized bond changes RMS
0.83 vs actual 0.081 Å [M #999/#1081 via r4]. *Beat:* judge by decoded molecules, not the objective.

**E4.8 Verdict · 35 s.** "Does it survive 28 beads?" → "What must the noise *keep readable*, and *in which order*?"
Stamp EACH MAP FAILED FOR A MEASURED REASON; status 11-14: "stiffness removal is a local lever, and it is real".

### E5 · Range and Order (13:55, centrepiece; levers `t`, `γ`, `block`, `L²`)

**E5.0 Station Q5 · 10 s.** 11-11 → 11-14, notes 27 and 30.

**E5.1 What the noisy molecule still knows · 80 s.** A noisy BBA query in **Cartesian** coordinates among training
frames drawn as ghosts with alpha ∝ posterior weight (Interactions 02), lavender bars of E[h | Y_t] for bond,
torsion, Rg; R_h(t) = Var(E[h | Y_t])/Var(h) and its three facts (any predictor gives a floor; more noise cannot
restore information; the channel is the map plus the noise law); then the mirror ("destroyed forward = decided
backward; exact for the exact reverse process"); a ghost of Retention's curve, credited. *Computed:* A17b: for 12
levels, over all 1,300,156 frames in float64 with ±1 µs exclusion, weights, posterior means, ESS and the 24 heaviest
frames; the playhead snaps to those labelled levels. *Numbers:* ESS ≈ 700 in Cartesian vs median 1 in the 103-d
chart, so no internal ghosts [M n27 §4]; leakage: C3 Rg R² at t = 0.05 falls 0.82 → 0.34 → 0.14 → −0.03 excluding
±10 ns / ±100 ns / ±1 µs [M n27 §4]. *Beat:* readability is measurable before training and is what exact
generation has already decided.

**E5.2 Four charts, one molecule · 80 s · lever `t`.** Four Fog Bench panels on one held-out molecule: Cartesian
(6.252 Å units); internal at thermal width; ordered internal (+ teal c₀a₁, c₀a₂); wδ log distances (RMS 0.3138);
plug-in decodes with readouts bond RMSE, Rg, closest non-neighbour (rose below 3.5 Å), |a₁|. *Computed:* R25 live;
wδ decodes precomputed at 31 levels by LM from classical MDS (never from the clean frame), snapped and labelled
(A17). *Numbers (four narrated stops) [D]:* t = 0.0004: Cartesian beads blur 0.040 Å per coordinate, 0.057 Å on a
bond length, one bond sd; t = 0.01: Cartesian 0.28 Å, bonds gone; internal bonds intact, torsions blurred 1.70°
(s/c_φ); wδ contacts protected while bonds begin to blur (computed readout); t = 0.1: torsions 12.96°, the internal
far end flails (anti-order, visible), the arrows barely move; t = 0.3: the internal fold is gone, the Cartesian fold
dissolving, the arrows still carry the size. *Live:* `leverSim` (narration states the readouts). *Guards:* "one draw
rescaled, not a path"; "a plug-in decode is what the network is shown"; "the study decoder ignores the block".
*Beat:* the same noise level means different things in different charts.

**E5.3 The erasure clock, measured then painted · 85 s · lens `chart`.** Measured t½ values arrive on a bare number
line, each with its estimator chip, then the lanes paint (u1-force 04): Cartesian; internal at thermal width (C3,
said once); whitened two-block (C1); ordered internal (first order, dashed) with the block-alone floor (solid, ≥);
an inset with EigenFold (own clock, ratios only) and Chroma-style; the "same word, four windows" card; the mnemonic.
*Numbers:* best-estimator lower bounds [M n27 §5], bond/angle/torsion/Rg/long-range/contacts/end-to-end/slowest
TIC: Cartesian 0.0004/0.05/0.08/0.47/0.44/0.38/0.45/0.36; internal 0.26/0.35/0.35/**0.27–0.28**/0.24/0.23/0.18/
**0.49** (the TIC exception drawn); C1 0.26/0.33/0.29/0.35/0.33/0.31/0.31/0.46; ordered, first order [D lab 11-18]:
bonds 0.26, torsions 0.34, ≥ 11 apart 0.29, end-to-end 0.24, Rg 0.44, closest 0.025; block alone Rg ≥ 0.42,
long-range ≥ 0.37, contacts ≥ 0.33 [M lab 2026-11-16 precedents]; inset Chroma-style bonds 0.0032, matched covariance
0.0049, EigenFold five decades [M #1099]; training share Cartesian bonds ≈ 0.04%, C3 ≈ 25% [D]; C3 Rg four windows
0.19 / 0.23 / **0.27–0.28** / 0.30 [g4 §4.2]. Labels "order without range", "range without order; anti-order:
end-to-end 0.18 < torsions 0.35", "range and order". *Hand-over:* "find the noise where the molecule knows its size
but has lost its bonds": Cartesian t ≈ 0.001–0.4, ordered ≈ 0.26–0.44, C3 **almost none (0.26–0.28)**. *Beat:* range
and order are two requirements; no earlier chart had both.

**E5.4 The handle, turned back · 85 s · lever `γ` (the E2.3 control).** BBA's 27 mode variances as log bars and
their curves fanning on the rail; the same γ control compresses the fan; a dose–response panel with dots only at the
four trained exponents ("measured at four exponents only"); E2's ★ image returns, "the promise" struck and
recaptioned "**range without order**", the "?" pin becomes REVISED (10-24 goal → 11-12/14 diagnosis); a 25 s coda
with the (γ, v) pad as a lens. *Computed:* R18 (λ^{1−γ}, unit-mean, library units); R1. *Numbers:* ratio 1,428
from the file, narrated "≈ 1.4×10³" (n27: 1,423); at γ = 0/0.25/0.5/0.75/1 ratios 1,428/232/38/6.1/1, first/last t½
0.52/0.028, 0.50/0.065, 0.45/0.13, 0.37/0.20, 0.26/0.26 [D n27 §3]; trained [M #1057; 50k; one seed per γ except
γ = 1; 20k molecules; floor 0.016 Å]: Rg W1 0.499/0.514, 0.187, 0.120, 0.081 Å at γ = 1, 0.5, 0.25, 0, while TIC JS
0.107/0.106, 0.083, 0.081, 0.086 (floor 0.037) and torsion error 9.7/10.4, 6.5, 7.1, 9.1° do not follow; "unit
variance in every direction is what erases the order; the local whitening itself does not" [S #1057]; pad: v =
1/0.3/0.1/0.03 → t½ 0.26/0.16/0.09/0.05 [D #1057], corners "order, no range", "range, no order" (= C1) and "**bonds
and size**" (γ = 0, v = 1; torsion 9.1°, TIC JS 0.086 vs Cartesian + distances 0.046): "torsions have no channel
here; the final design is internal plus two loud modes". *Live:* authored 1 → 0; "turn γ back: where does the size
error stop improving?" *Beat:* October's fix is exactly what erased the order; size follows the exponent,
populations and torsions do not.

**E5.5 The fold dissolves before its joints · 80 s · lenses `t`, `m`.** A 28-bead chain (3.8 Å, 110°): one torsion
jiggles 6.6° and far beads swing; all 25 torsions noised through phase pairs at the playhead: torsions stay readable
while end-to-end smears; a 27×27 heat map of R(b_k·b_l) fades off the diagonal; a Fog Bench of internal coordinates
(12 forward ghosts) at t = 0.05 and 0.2; coda: torsion-only equilibration. *Computed:* R19: exact transfer matrices
tested against `exact-uniform.json` (a 20,000-query Monte Carlo) within 0.01, three decimals with a footnote;
r(t) = E[(I₁(k)/I₀(k))²], k = αc_φ|y|/σ², by Rice quadrature; Prop. 1 R = Σc_j r^j/Σc_j. *Numbers [D·model,
c_φ = √2]:* one torsion 0.940/0.716/0.530 at t = 0.1/0.2/0.26; b·b(+4) 0.868/0.470/0.245; b·b(+12) 0.625/0.083/0.010;
b·b(+26) 0.352/0.004/0.000; end-to-end² 0.711/0.253/0.125; Rg² 0.835/0.439/0.255; effective degree ≈ ⅔(m − 1)
(approximation); a 6.6° blur at t = 0.05 moves beads on a 5–10 Å arm by 0.58–1.16 Å [D r7 E8]; coda: moving only the
25 torsions takes C3's Rg W1 0.48/0.46 → 0.05/0.12 Å with bond and angle errors unchanged [M #1073, 4,000 molecules]:
"global structure is carried by the torsions". *Guard:* "independent uniform torsions; BBA's are correlated".
*Beat:* internal coordinates erase the fold before the turns that build it (Prop. 1). Split point E5a/E5b.

**E5.6 ★ Two loud modes · 100 s · lever `block`, lens `halos`.** The design card (53 stiff channels at thermal width,
25 torsion phase pairs, two teal 3-vectors c₀a₁, c₀a₂ at natural spread: 109 features); mode shapes on the real
molecule as teal arrow fields with Rouse cosines (mode 1 changes sign after bead 14, hairpin vs rest; mode 2 ends vs
middle); the loudness ruler against the torsion line 2.0; then the gesture `block` none → +2 loud: the internal lane
morphs into the ordered lane and the plane's dot enters the empty corner. Lens `halos`: chain-model ghost bundles,
chart A (internal) agreeing on torsions but scattered in size vs chart B (+ natural block) inside one Rg ring, ESS
shown (below t = 0.05 the scene states Prop. 2's limit). *Numbers:* mean squares 15.0, 6.0 vs ≈ 1 per channel; length
variances 6.9, 2.5, 0.9, 0.6 vs 2.0, "only two modes are louder than a torsion"; Rouse overlaps 0.99, 0.99 (0.91,
0.92) [M lab 2026-11-18]; mode 1 88% aligned with hairpin–rest [M #1057]; lane morph [D, dashed]: Rg 0.19 → 0.44,
≥ 11 apart 0.16 → 0.29, end-to-end 0.14 → 0.24, block-alone Rg ≥ 0.42 [M]; plane dot on E4.2's panel type (190,350 updates, 100k molecules): C3 (bond 0.00032/0.00034, Rg 0.455/0.418) →
ordered (0.00038/0.00033, 0.117/0.091) [M #1088]; the 50k sweep stays in E5.8's inset; halos: Rg² readability at t = 0.26 0.18 (A) vs 0.84 (B), at
0.35 0.07 vs 0.67 [D·model A18]; chip NEW · UNREVIEWED [M #1141]: Rouse directions keep generation quality (Rg W1 seed
means 0.101 vs 0.097 for #1141's own fitted rerun, not the registered 0.117/0.091; seeds and decoder stamped) but give
a somewhat more compact force field (0.35/0.32 vs 0.26/0.22 Å). Must M6. *Beat:* thermal width for the detail, two
loud modes for the fold. *Climax:* one gesture moves a lane and fills E4's empty corner.

**E5.7 Who corrects whom · 60 s · lever `L²`.** The joint image y_B = g(y_A) with slope L, a noise blob, n ∝ (−L, 1)
and its projections on a seesaw (`drawBalance`, promoted). *Computed:* R20. *Numbers:* L²/(1+L²) = 0.50/0.94/0.98 at
L² = 1/16/63 [D n30 Prop. 2]; chain-model gains [D·model] internal 0.43–0.55/0.85–1.03/0.90–1.09, block
0.43–0.56/0.06–0.09/0.02–0.03; BBA constraint directions in the internal block 27/44/68% (whitened), 74/87/96%
(natural), 92/97/99% (twice) [M bba_charts, 1,200 frames]; per example at t = 0.01/0.1/0.2 the collapse is worth
0.0005/0.025/0.049, the constraint 0.92/0.80/0.38 [D·model]; pill [H] "#1137, declared 11-18, not run: a whitened
block keeps about half the gain (supports if 0.2 ≤ f ≤ 0.8 on both seeds)". *Live:* "whiten the block: who is
corrected now?" *Beat:* the louder block leaves the correction to the quieter one; order acts through who gets
corrected.

**E5.8 Why two · 55 s · lens `n_v`.** A stacked bar of size-response vs mean-square shares; a block-size curve with
channel and constraint counts as small annotations; narration names only n_v = 0, 2, 27. *Numbers:* size response
83% (mode 1), 96% (modes 1–2) vs mean-square shares 56/22/11/5% [D n30 §5]; Rg W1 at n_v = 0/1/2/4/8/16/27:
0.477/0.161/0.105/0.136/0.152/0.325/0.399 Å [M #1057/#1069; one seed at 1, 16, 27], **n_v = 1–8 tie by the pre-fixed
rule; local cost grows from 4**; channels 0/1/3/14/92/696/3,303, constraint directions 0/1/3/9/21/45/78 [D]; two
vectors are the smallest block meeting every global threshold on two seeds (seeds differ 0.001 Å) [M #1069]; one
vector is not force-ready (no volume term); partial order: loudness ratios 3.5 and 1.25 < 16 [D g3 C2]; "note 30
(11-18) **explained** why two, after the sweep (11-13)". *Beat:* only two modes are louder than a torsion; more
vectors add constraints and channels, not order.

**E5.9 Information moves, it is not created · 35 s · lens `chart`.** Collapse-signal densities ½β(t)S(t)/σ_t² for
the internal chart and the natural block, equal shaded areas; link to Retention 09 (not re-derived). *Numbers:*
collapse KL 0.0766 nats; integrated signals 0.0779 (A), 0.0784 (B), within 3%; block channels hold 0.88 of B's area
(whitened 0.48, twice 0.91), mostly at t ≈ 0.35–0.6 [D·model A18]; "no chart buys statistical efficiency" [D n30
§3]; share-of-reducible-loss criterion [H n27 §6]. *Beat:* a chart moves where the training signal sits.

**E5.10 Readable is not learnable · 35 s.** The skeleton-and-arrows chart, its lane, and a scatter of torsion window
vs torsion error. *Numbers:* CPU windows bonds 0.25, torsions 0.20, size 0.69 [D #1068]; trained (1 seed, 50k)
Rg 0.077 Å, bonds at floor, torsion error 7.9°, refuted by its own rule, 4–18% unrebuildable [M #1068]; scatter
Cartesian (0.08, 7.1°), C3 (0.35, 0.85–0.95°), ordered (0.35, 0.9–1.1°), skeleton (0.20–0.26, 7.9°) [M]. Must M7.
*Beat:* readability is necessary, not sufficient; a relation is learned as poorly as Cartesian local structure.

**E5.11 Decided first · 80 s.** One held-out molecule fills the stage; 12 genuine forward VP paths in the ordered
chart (geometric 1,000-step grid, every 40th step) played backward, captioned "**bridge ensemble**: exact reverse
paths conditioned to end at this molecule"; the arrows agree by t ≈ 0.5, chains settle at 0.35–0.26, glyphs
crystallize right to left; **the predicted window 0.26–0.1 is drawn before the measured curve arrives** (n30
prediction 2, declared before #1133); measured gauges beside the bench. *Computed:* A17 paths; A26. *Numbers
[M #1133, s2/s3]:* R² of chain |a₁| on block |a₁| 0.13 (t = 0.6), 0.29/0.26 (0.45), 0.37/0.38 (0.35), 0.43/0.40
(0.26), 0.44/0.42 (0.2), **0.63/0.60 (0.13)**, 0.91 (0.05), 0.97 (0.01); mean |a₁| block/chain 21/59 Å at 0.6,
40/41 Å at 0.13, captioned "posterior means; at high noise the two estimates differ by construction"; compact
molecules already with their final χ sign 0.55 → 0.65–0.69 → 0.88 at t = 0.6/0.45/0.13. *Beat:* generation decides
size first, and the chain falls in line where the theory said.

**E5.12 One spectrum, two pulls · 50 s.** The card [S g3 §5.1]: stiffness removal wants a flat spectrum [S Ahamed
2026, EDM, EqualSNR], order a steep one [S Biroli; Wang & Vastola; EigenFold]; the design flattens the stiff block
and keeps two modes loud. Precedent (Ahamed, R-DM, EigenFold, Chroma, GUD, semantic-first, latent forcing) vs new
(the measured range/order decomposition, the training-free probe on molecular observables, anti-order and the
constraint split, the immersion-volume read-out); "no model found noising internal coordinates with redundant
collective channels: an absence of evidence, not a proof" [S n30 §8]. "What must the noise keep readable?" → "Does it
*hold*, and what can it *not supply*?" Stamp RANGE AND ORDER (working hypothesis, 11-14).

### E6 · What the Block Cannot Supply (11:05; levers `volume`, `t*`)

**E6.0 Station Q6 · 10 s.** 11-14 → open; the line beyond is dashed.

**E6.1 How to read a result · 45 s.** One number, Rg W1 = 0.117 / 0.091 Å, its parts lighting in turn: ordered
internal; 190,350 updates (10%) on the budget clock; fresh seeds 2/3; N = 100,000; held-out floor 0.006 Å;
`real-budget-study.md` (11-15); then the effect rule (a gap counts only if it exceeds the largest two-seed difference)
[D #1069]. *Beat:* a number is its whole label.

**E6.2 Both scales at once · 85 s · lens `budget`.** The project's saved plane (#1127): log angle W1 vs log Rg W1,
100k panels only, seed dumbbells, family markers, floor box (0.05°, 0.006 Å), lens to bond W1; an arrow C3 → ordered;
the budget lens, with 50k points (20k molecules) in a separate inset with floor 0.016 Å; E1's scoreboard inset "this
time: fresh seeds, registered criteria, effect rule". *Numbers [M #1088; 190,350; 100k]:* angle / Rg W1: ordered
0.20/0.19°, 0.117/0.091 Å; C3 0.21/0.18°, 0.455/0.418; Cartesian + distances 1.58/1.49°, 0.071/0.077; covariance base
1.36/1.30°, 0.073/0.077; native ScoreMD 1.58/1.74°, 0.157/0.532; wδ 1.73/2.12°, 0.062/0.072; whitening 19.6/23.9°,
0.67/0.58. Against ScoreMD: bonds ×119, angles ×8.5, populations ×2.0, **size and contacts tie** (its seeds 0.157 vs
0.532); against Cartesian on size, gap 0.030 > spread 0.026 (seed means 0.104 vs 0.074), an effect; populations tie.
Registered Rg ≤ 0.11: met by seed 3 (0.091), **missed by seed 2 (0.117)** [M #1071]. Budget lens: ordered 0.106/0.110
(50k, s0/s1) → 0.117/0.091 (10%) → 0.120/0.096 (20%) → 0.111 (100%, open PR #1104, s2); C3 ≈ 0.45 throughout;
learning rate 99.8/97.6/90.8/3.3% of peak [D g4 §3.13]; seeds differ between stops; five models chosen after stage 1.
*Beat:* the only model near the best on both scales; the block changes where training ends.

**E6.3 A score needs its count · 50 s · lens `count dial`.** Log–log PMF floor vs N (paper definition) with the
heuristic 2K/N; model points at 100k with budget chips and "≠" between budgets; the paper's Table 1 on its own
vertical at 1,300,156 samples. *Numbers:* floors 0.56/0.18/0.080/0.039/0.025 at 20k/50k/100k/200k/325,039, N × floor
≈ 8,000 [M open PR #1138]; at 1,903,500 updates (one seed each) ordered 0.097, covariance base 0.096, C3 0.113; at
380,700 ordered 0.109/0.109 (nearest budget match); at 190,350 Cartesian 0.116/0.113, wδ 0.161/0.198, native ScoreMD
0.202/0.315 [M #1138]; paper 0.034/0.234/0.254 [S]; "≈ 0.02 at the paper's count" [H]; floor ≈ 0.006 "extrapolated"
[D]; "native ScoreMD = the unregularised Diffusion arm at 10% budget, read at 0.01 or 10⁻³; its full-schedule panel
pending". *Beat:* a PMF means nothing without its count and budget.

**E6.4 The phantom spring · 85 s · lever `volume`, lens `dimension`.** A correction pill "11-15: the loud block adds
nothing in simulation → 11-16: a wrong volume term (#1100); status page stale"; E2.7's footnote flies in; a polar toy
(2,000 seeded walkers of a 2-D Gaussian under 1/r − r with the term, −r without) with histograms against Rayleigh and
half-normal; then BBA: the loud map rotates with the molecule (an immersion) but the read-out used the invariant
formula; the data's Rg histogram reweighted by the volume ratio; a spring from the centroid labelled "≈ 0.6 kT/Å
inward". *Computed:* R22; A21. *Numbers:* mean radius 1.253 → 0.798 (−36%) in 2-D, 1.596 → 0.798 (−50%) in 3-D
[D·model g1 §3.6]; ≈ 0.6 kT/Å inward; reweighting predicts mean Rg 9.58 vs 10.66 Å, simulations ended at 9.6–9.7
[M #1100]; #1103's frames give 10.81 → 9.64 Å (separate row); brute-force log-volumes 17.808/16.924 vs 17.815/16.934
from ½ log det(J_cᵀJ_c), where the invariant formula predicts +1.87 instead of −0.88 [D #1103]; with the immersion
term the 100 ps size error falls 0.98 → 0.24 Å (seed 3, 512 paths), on its drift with the 0.167 Å floor [M]. *Live:* right / missing / wrong-formula; "switch the term: where does the size settle?" Must M8.
*Beat:* a wrong volume term is indistinguishable from an attraction; three quarters of the compaction was one formula.

**E6.5 The drift that does not stop · 55 s · lens `model`.** Size error vs simulated time (0–300 ps) in layers: study
panels (loud rows muted, "wrong volume term, superseded 11-16"), corrected seed 3, 2,048-path panels, the full-schedule
point, floor bands. *Numbers [M]:* corrected s3 at t* = 0.05 0.24/0.30 Å [#1100]; #1130 (2,048 paths) 0.158–0.277 /
0.229–0.492 / 0.396–0.642 Å at 100/200/300 ps, mean Rg −0.21 to −0.41 Å, size error ×1.7–2.9; full schedule 0.118 Å
at 100 ps (one seed, open PR #1104); floors 0.167 Å (512 paths), 0.084 Å (2,048); the same checkpoint reads 0.337
(512) vs 0.277 (2,048); open #1136, #1113. *Guard:* "a 100 ps number is a point on a drift; BBA folds on
microseconds". *Beat:* every force field still compacts; the fixes lower the curve, none flattens it.

**E6.6 Blur versus wall · 75 s · lever `t*` (E2.7's handle).** The torsion-blur lever arm; a contact-distance
histogram convolved with the n_v-dependent blur against 3.5 Å; wall z and Rg z vs level; the soft-force information
curve ∝ σ². *Numbers:* torsion blur 1.70° at 0.01, 6.63° at 0.05; contacts would need ≈ 1° (t ≈ 0.005) [D r6 §3.12];
contact blur at 0.01 for n_v = 0/1/2/4/8: 0.37/0.32/0.22/0.16/0.15 Å, at 0.05 1.46 → 0.85 Å (n_v = 2) [M #1101];
closest non-neighbour loudness 0.003 → t½ ≈ 0.013 (0.025 with +2) [D n30 §7]; floor blur 0.32–0.36 Å vs the 3.9 → 3.5
Å margin; the model overlaps 12–20% of molecules vs 0.004–0.01% in data [M]; training lower (t_min 0.003) leaves wall
z unchanged (9.9 → 9.6; 15.0 → 15.0) [M #1101]; soft-force information ∝ σ², error ∝ 1/σ [D n30 §7]. *Live:* t*
∈ [0.001, 0.05]: "find a level with a sharp wall and a readable size balance" (none). Must M9. *Beat:* excluded volume
is to internal coordinates what bonds are to Cartesian ones: a range failure; the wall must be supplied.

**E6.7 ★ Two charts, two blind spots [H] · 85 s.** One BBA frame mirrored at t = 0.01 on the Fog Bench: left ordered
internal (crisp sticks; forward ghosts of the closest pairs cross 3.5 Å and flash rose), right wδ (frayed sticks,
clean contacts); their ladders on the rail are mirror images; E1.4's Odometer returns between them (a finite step vs
an infinite feature distance); the rose thread from Q1; a scene-wide **HYPOTHESIS** badge. *Computed:* R25 forward
ghosts; A17 wδ decodes; A20 must reproduce g2's column before this ships. *Numbers:* ordered first order bonds 0.26,
closest 0.025 [D lab 11-18]; wδ bonds 0.014, closest 0.120, floor blur 0.049 vs 0.36 Å [D † g2 §4.8]; registered
budget: wδ best size 0.062/0.072 Å, 0% clashes, bonds 0.027/0.034 Å (86× ordered's) [M #1088]; severe collisions per
10⁵ at the first chunk wδ 0, Cartesian 682, internal 1,186 [M]; chips "wδ force fields reach 17–18° angle errors" and
"the barrier partly lives in the decoder"; the stated test [H g2 §7]: noise real molecules at 0.01 in wδ's chart and
decode, expecting ≈ 0.05 Å contact blur and ≈ 0% overlaps vs 0.32 Å and 2.3% for internal (proposed, not run). Card: "The barrier that killed (planarity, Episode 1) may be the barrier that
saves (collisions)." *Climax:* the mirrored pair with the odometer between them.

**E6.8 Use the six discarded numbers · 65 s · lenses `drag`, `core`.** A toy: an 8-bead planar chain described by its
bend angles and one loud end-to-end vector; dragging the vector, a least-squares rebuild with or without a hard core
moves the chain. Then BBA bars for three rebuilds (internal-only, joint, joint + core) of noised data vectors at
t = 0.01, labelled as such (or #1119 endpoints if they are ordered-internal completions), then the fitted wall and
size term. *Computed:* R23, LM **cold-started from a fixed guess with fixed iterations** every frame. *Numbers [M
#1105/#1107]:* overlaps and Rg W1: internal-only 14.5/15.3%, 0.117/0.091; joint 19.3/20.1%, 0.077/0.064; joint + 3.6
Å core 0.0/0.0%, 0.083/0.070 Å, local accuracy unchanged; core without block 0.131/0.105; full schedule 0%, 0.105 Å
[#1104]; late repulsion (a sampler change) clashes 0.60/0.66% → 0.02/0.02% [#1088]; wall alone mean Rg 11.13–11.31 Å;
wall + −0.16 kT/Å size term: overlaps 21.3/18.4% → 0%, size 0.267/0.175 → 0.263/0.173 Å [#1109]; linear response
0.16 × 4.8 Å² ≈ 0.8 Å [D]; "two errors that cancel" [H]; guard "0% by construction (3.6 Å core vs 3.5 Å test)".
*Beat:* cheap repairs work today; the model still does not learn the wall.

**E6.9 The handedness detective · 35 s.** Three mode vectors as a frame: mirrored, |a₁|, |a₂|, a₁·a₂ stay and χ flips;
P(χ > 0) by Rg bin; the mid-size deficit as **separate bars**. *Computed:* R24. *Numbers [M #1133–#1140]:* data
0.169/0.268/0.371/0.470, ordered (s2) 0.196/0.269/0.421/0.485; note 30's prediction 3 not borne out as stated: the
torsions carry handedness, compact molecules match (0.256/0.247 vs 0.249); the 0.04–0.06 deficit is reproduced
−1/+4% by local statistics, 28/32% by single long-range distances, 11/10% by arm side, 61/59% by a coarse
quarter-chain dihedral, each on its own (they overlap). *Beat:* the residual is the relative twist of the two halves,
which two vectors cannot carry.

**E6.10 The Ledger · 75 s.** The completed Journey Map with every thread; the Musts ticked (§1.5; M9 "only by
repair"); open tests with declared rules (#1137; #1136/#1113; the wall; Chignolin, whose transfer check read dummy
frames and is excluded); the final Clock with every lane. **Why optimism:** (1) a large, reproducible gain on fresh
seeds at a registered budget: bonds 17–120× better than every Cartesian-family model, size near Cartesian,
populations tied [M #1088, r7]; (2) mechanisms that **explained** why two (after the sweep) and **predicted** when the
chain follows the block (declared before #1133, matched at t = 0.13), with one declared prediction not borne out as
stated and two open; (3) every remaining defect sits where note 30 says the block cannot help, shown after the fact
and therefore paired with the open declared tests; (4) training-free repairs transfer across seeds and to the full
schedule [M]; (5) the loud directions are Rouse modes and need no trajectory [M #1129; #1141 unreviewed]. **Not
established:** equilibrium populations of a microsecond folder; transfer; the full schedule beyond one seed; the
paper-protocol simulation PMF; native ScoreMD at full schedule. *Beat:* "Each step looked promising for a measured
reason and was left for a measured reason. The last one has not been left yet."

### X1 · The Erasure Clock (`explorables/erasure-clock`)

**Chart builder:** Cartesian, C1, C3, ordered (+n_v at loudness L), +2 whitened, +8 at loudness 15, skeleton, wδ
(first order †, ellipsoids only), Chroma-style, matched covariance, EigenFold (own clock, ratios); sliders γ, v, n_v,
L, t_min ∈ {10⁻⁵, 10⁻³, 0.003, 0.01}. **Rail** with mirror toggle and estimator lens. **Probe calculator:** λ or a
width with a unit preset → r(t), t½, decision bar, training share, information bump R(1 − R). **(γ, v) pad** with the
corrected corners. **Fog Bench pane:** 64 held-out frames plus the ALDP5 mean; Cartesian, C3, ordered, wδ ellipsoids
s²(JᵀJ)⁺ precomputed per molecule and scaled by s²; forward ghosts, best linear guess; posterior ghosts in Cartesian
only from A17b. **Challenges** (d4): "range: every window ≥ 10 t_min"; "order: Kendall τ with coarse-to-fine ≥ 0.8";
"find the only chart that passes both"; "why can no correlated Cartesian noise give bonds a window?". Calibration
lamps; deep links.

### X2 · The Bench (`explorables/bench`)

One panel per rig with free controls, **calibration lamps** (each rig re-runs its §5 tests on load) and a
**provenance drawer**. Beyond the video rigs it holds what the videos cut: the **force reader** (force scale c with
the Stein needle; step Δt with two-bead inflation 1/√(1 − Δt k), limit 6.0–9.1×10⁻⁴ Å², labelled "toy limit vs
measured failure": the learned arm blew up at 4×10⁻⁴ through stiffer coupled directions or a rough force [M #768];
the BBA read-out trade-off 1.60 … 0.69 Å at t = 0.005 … 0.05 vs blur floor 0.045 … 0.117 Å [M #1089, "loud rows
carry the volume-term bug"]); the lag dial with the αL barcode; the chain with hinge drag; and **walkers from β**
replaying sim-beta traces with the statistic named (#768's 83% αR vs the 89% last-record share), "not
equilibrated". Unseeded play is allowed; nothing is exported.

### X3 · The Ledger (`explorables/ledger`)

The Journey Map with the swimlane; station cards (question, +/→, verdict, dates, PRs, a "watch" deep link
`?video=<id>&t=<s>`). **+/→:** Q1 "flat clouds and collisions infinitely far; φψ-JS 0.12 vs 0.26 (Sprint 5)" → "23%
unphysical, 340–600× cost, tied with the strongest flat baseline once fixed" [S talk; M]; Q2 "three problems, one
choice each" → "the synchronizing metric is curved"; Q3 "exact kernel; bonds ≈ 100× sooner" → "no torsion or αL
gain"; Q4 "BBA springs' bonds 52× better" → "no map got both halves"; Q5 "readability before training; size
0.51 → 0.08 Å along γ" → held; Q6 "bonds 17–120× better, size near Cartesian" → open. **Spurs:** Riemannian flow
matching (pilot JS 0.620 vs 0.199 [M Sprint 8]), manifold FP regularizer (never trained), conservative wδ head
(refuted twice), PGA atlas (out of scope), objective search, factorized densities, skeleton map. **Claims ledger**
with statuses; **corrections timeline** (transpose, vp_mean, TF32, XLA, Gaussianization, #1025 → #1055, immersion
volume, C3 Rg 0.23 → 0.27–0.28, n25's bound, Retention's 63%, the five E1 bug cards cut from the video); **number
table**, **compare guard** (shows the mismatch instead of a ratio), floor dial, **κ rails**, budgets.

---

## 5. Computation catalogue

Rigs live in `src/model/thesis/` (DOM-free), tests in `tests/thesis/*.test.mjs`, thresholds fixed before the first
run; costs for laptop JS at 60 fps.

| ID | Module | Maths | Algorithm, cost | Tests (source) |
|---|---|---|---|---|
| R1 | `vp.js` | β = 0.1 + 19.9t, B = 0.1t + 9.95t², α = e^{−B/2}, σ = √(1−α²), s = σ/α, ℓ = ln(α²/σ²), t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9 | O(1) | α(0.01) = 0.999003; σ(0.01) = 0.044643; s(0.05) = 0.17414; α(1) = 0.006572; ℓ(0.259) = 0 ± 0.01; t½(1) = 0.2590, t½(15.5) = 0.526, t½(0.011) = 0.0285, t½(0.003) = 0.0130, t½(4.2×10⁻⁵) = 0.00040 [g4 §3.3] |
| R2 | `meter.js` | r = α²λ/(α²λ+σ²); width r²; info −½ ln(1−r); window SNR ∈ [0.25/λ, 4/λ] | O(1) | t½(0.01/0.1/10/100) = 0.0270/0.0930/0.486/0.676 [r4 E1]; window = ln 16 |
| R3 | `aldp5.js` | λ_k = (w_k/0.9418)²; γ family λ^{1−γ}; ghosts; Tweedie; blur F_t = rF₀; training share | closed form; EM walkers 500 × 9 Float32 | the E2.1–E2.7 values (t½, r, inflation, shares, γ = 0.142, spreads, Tweedie 0.388/0.463, r(0.03) = 0.9881); simulated variance 1/r ± 3% [g1 §3.1] |
| R4 | `loss.js` | GD on a quadratic with curvatures c_j m_i; loss-blindness excess; likelihood bound | GD live; integrals at load | excess 0.0093 ± 10% at 1.23; σ ≈ w share ≈ 6%; 17.5/11.4 [n21; LESSONS D18] |
| R5 | `energy.js` (existing) | `configuration`, `springEnergy` | — | 1.75 Å; 0.40 Å; 3.27 eV; 0.105/0.044 eV [a1 §6.1] |
| R6 | `ruler.js` | Kabsch; d_th = √(ΔqᵀΣ⁻¹Δq) | O(n) | A3 pairs 0.036/4.0, 0.243/1.46; ρ = 0.50 ± 0.02 |
| R7 | `wdelta.js` | F(X); H = A + δB analytic; horizontal projector; X_e | Jacobi, ≈ 50k flops/frame | odometer 3.2489 … 17.0407; condition 42.14 … 6.004×10⁷; rigid residual < 10⁻¹⁰; 0.004165/0.000392; Å→nm to 10⁻¹²; C = 46/51 [r1] |
| R8 | `geodesic.js` | ẍᵢ = ẋᵢ²/xᵢ, exact xᵢ(0)e^{sẋᵢ/xᵢ}; Verlet | O(S) | error < 10⁻⁴ at S = 1024, x₁ = 0.5; monotone in x₁; straight feature line to 10⁻¹² |
| R9 | `scaleclock.js` | A(t) = 1 − ½βτ, τ = (1/9)(1 − e^{−B}) | O(1) | A(0.10/0.55/0.91/1) = 0.9880/0.4150/−0.0114/−0.1111; a(1) = 0.006572 [r1 E3] |
| R10 | `chord.js` | argmin_Z ‖F(Z) − [(1−t)F(X) + tF(Y)]‖² | Gauss–Newton, 41 t at load | dimer 6.3246 Å; chord identity to 10⁻¹² [g2] |
| R11 | `springs.js` | G = J_dᵀWJ_d + k⊥I; F = (W^{1/2}d, √k⊥x) | dense, small | `energy.js`: 6 zeros; 0.0264 … 53.99 eV/Å²; κ_H = 2,048 [g4 §3.2] |
| R12 | `cone.js` | cone F(b); c, σ_r, σ⊥, 𝒦_tan, R; deficit; ρ; bound 𝒦ρ²/12; four-point ε (n22 Thm 4) | closed form; 2,000-quad mesh (≈ 1 ms) | c = 0.102960; σ_r = 0.026584, σ⊥ = 0.258199 Å; 𝒦_tan = 0.029316 per squared width; R = 5.8095; θ = 0.5: 𝒦ρ² = 0.2473, deficit 0.0411; ε table to 3 digits (Nelder–Mead cross-check); aspect within 3% |
| R13 | `vp.js` | α/σ; 1/σ² | O(1) | 22.38 at 0.01; 999.5 at 10⁻⁵; 501.8 [n28; r6 §2.1] |
| R14 | `lag.js` | t_k = 1/(D₀λ_k); G_τ; half erasure 1/(1 − e^{−2τ/t_k}) | O(1) | t_k 0.0078/0.0312/0.5/3.125 ps; G(1 ps) 1600/400/28.9/14.6; 1.000/1.000/1.019/2.116 [n25; critic] |
| R15 | `gaussianize.js` | bimodal density; x ↦ Φ⁻¹(F(x)) by ν; noised score; 9-parameter RBF + linear SGD | simulation `uses: ['ν']` | score linear-fit R² ≥ 0.999 at ν = 1; bit-reproducible |
| R16 | `banana.js` | φ = (x₁ − x₂²/9, x₂); KL ½ ln(det C_X/det A); latent score | closed form | KL 0.4739/1.7483/1.3013; ψ 2.000/40.5/1.125 [g2 E2] |
| R17 | `bondsim.js` | δ ← (1 − 2Δtk)δ + √(4Δt)ζ | 2,000 walkers | inflation 1.060/1.095 (k 1,100/1,660, Δt 10⁻⁴); diverges for Δt > 1/k [g1 §3.9] |
| R18 | `spectrum.js` | library units c₀²λ; γ dial λ^{1−γ}/mean; size response; shares | O(27) | 15.031 … 0.0105, Σ = 27; c₀ = 0.15706; ratio 1,428 ± 1 (within 0.5% of 1,423); t½ 0.523/0.0284; 0.8296/0.9615 |
| R19 | `chain.js` | Rice-quadrature r(t); transfer matrices T(r) = a⊗a + (r/2)(b⊗b + c⊗c); two-copy automaton (end-to-end², Rg²); von Mises ghosts; chart-B sampler; lever arm | ≈ 5 ms at load; ≈ 0.2 Mflop per t; ≈ 2 ms/frame | r(c_φ = √2) 0.9401/0.7159/0.5297 at 0.1/0.2/0.26; c_φ = 1.504 0.947/0.746/0.565; E5.5 table, **all within 0.01 of `exact-uniform.json` before narration says "exact"**; R(b·b(+2)) = r |
| R20 | `seesaw.js` | shares L²/(1+L²), 1/(1+L²); counts | O(1) | 0.500/0.9412/0.9844; 1, 3, 14, 92, 696, 3,303; 3, 9, 21, 45, 78 |
| R21 | `infoarea.js` | ½β/σ²·S, trapezoid | O(14) | 0.0779/0.0784 vs 0.0766 (3%); 0.878/0.476/0.914 |
| R22 | `radial.js` | EM for r, force (d−1)/r − r or −r | 2,000 walkers | 1.2533, 0.7979, 1.5958 within 2% [g1 §3.6] |
| R23 | `rebuild.js` | ‖w⊙(φ(x) − y)‖² + λΣ relu(r_c − d_ij)² | LM, **cold start, 40 iterations per frame** | residual → 0; min distance ≥ r_c − 0.05 at λ = 100; jumped = played frames |
| R24 | `chirality.js` | χ = a₁·(a₂×a₃)/(\|a₁\|\|a₂\|\|a₃\|) | O(1) | sign flips under mirror; P(χ > 0) = 0.353 on 1.3M frames |
| R25 | `charts.js` | Cartesian /6.252; C3 (log bonds, log tan(θ/2), L⁻¹(r − μ), c_φ(cos, sin)); ordered ⊕ c₀a_p (c₀ = 0.157064); NeRF; Wiener mean; ellipsoids per molecule | ≈ 0.3 ms/molecule | **library parity < 10⁻⁵ Å**; round trip < 10⁻¹⁰ Å; C3 channel variance ≈ 1 |
| R26 | `modes.js` | w_p = HᵀV_p; Rouse √(2/N) cos(πq(i + ½)/N) | O(N²) | overlaps 0.991/0.985/0.914/0.915 |
| R27 | `noise-ruler.js` | σ strings; torsion blur s/c_φ | O(1) | 0.279 Å at 0.01 (BBA Cartesian); 1.70°/6.63°/12.96° |
| R28 | `rg2.js` | Rg² = ΣW_kl b_k·b_l | O(N²) | equals direct Rg² to 10⁻⁹; 153 pairs (\|i−j\| ≥ 11) |
| R29 | `chainmc.js` | Metropolis on 25 torsions, frozen bonds and angles, #1025 bases | seeded simulation | 10.34/5.41/10.71 Å within ±0.3 at 20k sweeps, else fallback |
| R30 | `evidence.js` | effect rule; budget clock lr(u); E[PMF] ≈ 2K/N; Markov sd (1 − p)√(2/n); force ratios v/(α²v+σ²), α²v/(α²v+σ²) | O(1) | 0.030 > 0.026; 99.8/97.6/90.8/3.3%; epochs 39/150/300/1,499; 0.225/0.229/0.223; 0.256/0.248 at v = 0.01, t = 0.05 [g4] |
| R31 | `rail.js` (draw) | x(t) = 140 + 1340(13.8145 − ℓ)/18.753 | O(1) | anchors §3.3 ± 1 px |

---

## 6. Data asset catalogue

Scripts in `scripts/data/*.py`: plain numpy, `python -I`, LOCAL read-only, never `import riemanniangenerativemd`
(its editable install points at an unrelated branch, r8 §6A). **Library parity** comes from a durable read-only ML
worktree pinned at `c099347a` (origin/main 2026-11-19, includes #1141); a test confirms its encoders reproduce the
range-order run's JSON from `2d9711e8` (c_φ = 1.5044, c₀ = 0.15706); the library runs there once to write fixtures
(C3/ordered features and decodes, immersion volumes, wδ features for 10 frames) into `scripts/data/fixtures/`, against
which every port is tested. Header `{schema, id, created, script, script_sha256, inputs:[{path, sha256}], rg_commit,
badge, notes, data}`; arrays `{dtype, scale, shape, b64}` (int16/uint16, never float16). Shared assets in
`src/data/thesis/`, per-episode in `src/videos/<id>/data/`; heavy episodes lazy-load (≤ 700 kB per piece).

| ID | File (where) | Source (LOCAL unless stated) | Outline → JSON `data` shape | Size | Test |
|---|---|---|---|---|---|
| A1 | `aldp5-modes.json` (shared) | `rg-main/…/force-field-simulation/evidence.json`; mdshare `…3x250ns…npz` `arr_1` | 20k frames of traj 1, `[:, [1,3,4,6,8]]*10`, iterated Kabsch, 15×15 covariance → `{widths[9], vectors[9][15], mean[5][3], stein:{arm:{seed:[9]}}, step:{arm:{h:ratio}}}` | 6 kB | widths within 2% of `mode_std_A` |
| A2 | `aldp5-frames.json` (E1, E2) | bgmol `aldp.npy`; mdshare traj 1 | → `{atoms22[22][3], elements[22], beads5: int16[2000][15]}` | 60 kB | C–H ≈ 1.09 Å |
| A3 | `aldp5-ruler-pairs.json` (E1) | mdshare traj 0 | αR, every 50th frame; Σ_q; 60,000 pairs → `{sigma_q[9][9], pairA[2][5][3], pairB[2][5][3], rmsd[2], dth[2], spearman}` | 6 kB | 0.036/4.0, 0.243/1.46, ρ 0.50 |
| A4 | `aldp5-planarity.json` (E1) | `data/processed/aldp5_train.npy`, `aldp5v_train.npy`, strided | λ_min/tr → `{edges[61], n5[60], n6[60], phantom[60], subset:{n, min}}` | 3 kB | subset printed; 800k values logged |
| A5 | `aldp5-race.json` (E3) | `runs/feature-space-evaluation-2026-10-26/remote/full/*_s0_step*_samples.npz` + evidence | → `{arms[5], steps[10], rama: uint16[5][10][36×36], bond1: uint16[5][10][64], scores}` | 160 kB | W1/σ within 5% of protocol |
| A6 | `aldp5-force.json` (E2, E3) | force-field and supervisor-metric evidence JSONs | → `{stein:{arm:{seed:[9]}}, dist200k:{…}, diagonal:{map:{iid:[2], sim:[2]}}}` | 15 kB | §7 values |
| A7 | `aldp5-beta.json` (X2) | `runs/force-field-simulation-2026-10-26/sim-beta/*_trace.npz` | → `{arms, phi/psi: int8[arm][201][150], shares[15][201][3]}` | 320 kB | statistic named |
| A8 | `aldp5-barcode.json` (E3, X2) | mdshare, 3 trajectories | ±20° hysteresis → `{traj:[{visits:[[start,len]], pop, dwell}], acf:{lags[60], phi[60], bond[60]}}` | 12 kB | 37 visits; 3.24/1.65/4.11%; 219/111/278 ps |
| A9 | `aldp5-lag.json` (E3) | n25 §3; learned-stiffness-warp.md; learned-warp-lag-sweep.md | transcribed twice, diffed → `{saturation:[{coord, lag, var_frac}], kappa_step:[…], sweep:[{arm, js100, js20k, valid}]}` | 4 kB | diff clean |
| A10 | `ak-chord.json` (E1) | `…/diepeveen2024/data/molecular_dynamics/4ake/{dims0001_fit-core.dcd, adk4ake.psf}` | numpy DCD reader (copied from `SP/g2/checks/ak_cartesian_pca.py`) → `{chord_rmsd[102], frames: int16[3][214][3], chords: int16[3][214][3], scree[10]}` | 20 kB | 1.784 Å; PC1 0.8934 † |
| A11 | `bba-modes.json` (shared) | `runs/range-order-mechanisms-20261118b/collective_modes.json` | → `{c0, ms_A2[27], ms_lib[27], V[27][27], w[27][28], rouse[4]}` | 25 kB | Σ ms_lib = 27; ratio 1,428 |
| A12 | `bba-charts.json` (shared) | same run, `bba_charts.json` | copy → `{t_half:{chart:{feature}}, loudness, blur, constraint_shares, additive_R2}` | 30 kB | 74/87/96% |
| A13 | `bba-chain-spec.json` (shared) | same run, `chain_spec.json` | → `{mean[53], chol_lower[1431], phase_scale}` | 14 kB | c_φ = 1.5044; parity |
| A14 | `bba-frames.json` (shared) | `data/deshawresearch-bba-ca28/heldout.npy` | 8 stratified + 64 for X1 → `{mol: int16[72][28][3], rg[72], tags[72]}` | 25 kB | Rg recomputed |
| A15 | `bba-window.json` (E4) | `train.npy`, `heldout.npy`, `membership.npz` | sorted by id; one compact → extended → compact window → `{xyz: int16[600][28][3], rg[600], tic[600][2]}` | 110 kB | lag-1 Rg ACF printed |
| A16 | `bba-population.json` (E4) | all training frames | → `{rg_hist[190], tic_counts[100][100], quantiles, folded, B[27][27], W[27][27]}` | 70 kB | 10.60 Å; 8.37/9.89/15.30; 0.194 |
| A17 | `bba-noised.json` (P0, E5, E6) | A11, A13, A14 | per chart (Cartesian, C3, ordered, wδ 378 log r_ij /0.3138): seeded ε, clean features; wδ LM decodes from classical MDS; 12 forward VP paths of molecule 1 → `{levels[31], clean:{chart:[]}, wdelta: int16[8][31][28][3], paths: int16[12][26][109]}` | 300 kB | encoders match fixtures |
| A17b | `bba-posterior.json` (E5, X1) | all training frames | Cartesian posterior, float64, ±1 µs exclusion → `{levels[12], ess[12], means[12][3], ghosts: int16[12][24][28][3], weights[12][24]}` | 60 kB | ESS printed |
| A18 | `chain-model.json` (E5) | same run, `exact-uniform.json`, `signal-*.json` | copy → `{exact:{t:{obs:R}}, signal:{arm:{t:{…}}, summary}, eta, kappa, c}` | 30 kB | KL 0.0766; 0.0779/0.0784 |
| A19 | `bba-windows.json` (shared) | n27 §5; lab 11-16 (#1099); lab 11-18; #1025; #1026; g2 §4.8 (†); #1068 | → `[{chart, feature, t_half, estimator, bound, status, source}]` | 10 kB | g4 §4.2 strings; C3 Rg "0.27–0.28" |
| A20 | `wdelta-firstorder.json` (E6, X1) | 1,200 held-out + 50k training frames | numpy port of `bba_charts.py` → `{feature: {t_half, blur}}` | 1 kB | bonds 0.014, closest 0.120, Rg 0.689; **E6.7 waits on it** |
| A21 | `bba-volume.json` (E6) | 2,000 frames | ½ log det(J_cᵀJ_c) − invariant factor (numpy from `immersion_volume.py`) → `{rg[2000], dlogvol[2000]}` | 40 kB | mean in [9.5, 9.7] Å; parity 17.808/16.924 |
| A22 | `ledger.json` (shared) | `.local/leaderboard/cache/main/{runs,metrics}.parquet` (11-18 23:06); docs; lab READMEs; PR bodies | two passes, diffed → `[{id, value, unit, badge, def, system, data, budget, seeds, N, floor, source, canon, status, open_pr}]` | 70 kB | §7 canon; every `ev()` resolves |
| A23 | `era1-scoreboard.json` (E1, X3) | sprint 1/5/7/8/9 summaries, `headtohead.md`, #513 note | → `[{sprint, campaign, epoch, arm, n, N, valid, js, sd, source}]` | 4 kB | no cross-campaign pairs |
| A24 | `floors.json` (E6, X3) | #1138 body; ALDP5 floors from mdshare | → `{metric:{N:[], floor:[]}}` | 8 kB | N × floor ≈ 8,000 |
| A25 | `logbook.json` (X3, E·0) | reports; git log | → `{stations[6], spurs[], threads[], claims[], corrections[], declared[]}` | 60 kB | dates match the log |
| A26–A28 | `reverse-gauges.json`, `drift.json`, `scoremd-tables.json` (E2, E5, E6) | #1133–#1140; #1088/#1100/#1104/#1109/#1130; ScoreMD tables via g1 | transcribed rows `{key, value, unit, badge, source}` | 2–3 kB each | §7 |
| A29 (opt.) | `rb1119.json` (E4, E6) | `runs/bba-reverse-completion-20261118/` | only after reading #1119's note → `{levels, radius:{arm:[]}, endpoints}` | 20 kB | meaning confirmed |
| A-REQ-1 (opt., LISE) | panels | `runs/s12-bba-study-20261114/` | first 512 molecules per stored panel → `int16[512][28][3]` per model | 1.6 MB | enrichment only |

Total ≈ 1.5 MB committed (the largest pieces, E5 and X2, load ≈ 0.6 and ≈ 0.4 MB lazily), plus the optional 1.6 MB.

---

## 7. The number canon used on screen

The subset of g4 the programme uses. Each row is pinned by a Node test through `ledger.json`; the storyboards (§4)
carry the full value lists with their badges.

| Quantity (definition) | Canonical values on screen | Data, budget | Source |
|---|---|---|---|
| σ_t (dimensionless) and its units | 0.0446 at t = 0.01; 0.0446 Å manifold, 0.042 Å pilot floor, 0.279 Å BBA Cartesian; t½(1) = 0.259 | — | [D g4 §2.1, §3.3, §4.5] |
| ALDP5 principal widths, flat t½ | 0.0252 … 0.6631 Å; 0.00483 … 0.196 | mdshare traj 1 | [M #768; D g1 §3.1] |
| κ (always subscripted) | κ_H 400 [I], 2,048 [D·model]; κ_Σ 100–200, ≈ 920; κ_res 192/112/97 → 9.6/7.6/13.4, global 273/477, wδ 413; κ_train 1.9×10⁴/146/8.1; κ_step 184 → 2.99 (floor 1.55) | bgmol; mdshare (κ_step); toys | [n20; n21 §4.3; #753] |
| BBA Cartesian variance ratio | 1,428 from file, narrated ≈ 1.4×10³ (n27: 1,423) | DESRES | [M; n27 §3] |
| Bond SNR at the floor | < 1 in every convention (0.30–0.46 / 0.34–0.52 / 0.16–0.18) | bgmol | [D n21 §5.2] |
| Readable windows, best estimator (lower bounds) | Cartesian bond 0.0004, Rg 0.47; C3 bond 0.26, torsion 0.35, **Rg 0.27–0.28**, end-to-end 0.18, slowest TIC 0.49 | BBA | [M n27 §5] |
| First-order windows; block-alone floor | ordered Rg 0.44, closest 0.025; internal Rg 0.19, closest 0.013; block alone Rg ≥ 0.42 | BBA | [D lab 11-18; M lab 11-16] |
| αL | 37 visits; 3.24/1.65/4.11%; 96–139 effective samples; ±50% (0.4–7.0% around 3.2%); n25's 0.79–1.27 only struck | mdshare | [M n25, #779; g4 §4.3] |
| Era 1 scoreboard (within campaign) | S1 0.117 / 0.479 / best flat 0.167; S5 (10k) 0.119 (77%) / 0.263, 0.268; S8 0.2846/0.2618 → 0.1012; ScoreMD-native 0.0151, floor 0.0114 | ALDP | [M sprint summaries] |
| BBA first chunk (bond, Rg W1) | internal 0.000274, 0.521; Cartesian 0.415, 0.072; springs 0.320, 0.078; whitening 0.705, 0.497 | 190,350, s0, 100k | [M matched-results] |
| Budgets on one cosine | 50k 2.6%, 190,350 10%, 380,700 20%, 1,903,500 100% (open PR #1104, 1 seed) | — | [g4 §4.6] |
| Registered budget | ordered Rg 0.117/0.091 Å, bonds 0.00038/0.00033 Å; C3 0.455/0.418 | 190,350, 100k | [M #1088] |
| Paper-definition PMF (with budget chips) | 0.097 / 0.096 / 0.113 @1.9M; 0.109/0.109 @380,700; ScoreMD 0.202/0.315 @190,350; floor 0.080 @100k | 100k molecules | [M open PR #1138] |
| Chain model | torsion 0.940/0.716/0.530; Rg² 0.835/0.439/0.255; split 0.50/0.94/0.98 | iid torsions | [D·model n30] |
| Loud modes | 15.0, 6.0; lengths 6.9/2.5 vs 2.0; size response 83/96%; Rouse 0.99/0.99 | BBA | [M/D n30; lab 11-18] |
| Reverse path | R² 0.63/0.60 at t = 0.13; predicted 0.26–0.1 | s2/s3 | [M #1133; D n30] |
| Volume term, drift | ≈ 0.6 kT/Å; 9.58 vs 10.66 Å; 0.98 → 0.24 Å; 100/200/300 ps 0.158–0.277/0.229–0.492/0.396–0.642 Å; floors 0.167/0.084 | loud models | [M #1100, #1130] |
| ScoreMD paper | BBA 0.034 / 5.387; Two For One 1.624 (t = 0.005); Both 0.234 / 0.254 | 1.3M samples | [S via g1] |

---

## 8. Risks and honesty notes

### 8.1 What could mislead, and the guard

| Risk | Guard (where) |
|---|---|
| κ arrows across definitions | κ chips, "≠", X3 rails (E2, E3.8) |
| Mixed estimators | outline styles, estimator chips, canon 0.27–0.28 (E5.3) |
| Budget, seed, count mixing | budget-chip lint; separate 20k/100k panels; count dial (E4.2, E5.4, E6.2–E6.3) |
| Hindsight linearization | dated swimlane; spurs; the missed pre-registration shown (P0.3, E6.2) |
| Decodes, rescaled draws or bridges read as knowledge, paths or generation | captions; genuine paths only in E5.11; gauges "differ by construction" |
| Posterior ghosts where ESS ≈ 1 | Cartesian or exact models only, ±1 µs exclusion, ESS printed (E2.1, E5.1) |
| Toys read as molecules; reader values as results | [D·model], rig stamps, toy/molecule pairs; † and conditional wording; E6.7 held on A20 |
| Superseded results as current | SUPERSEDED overlay, correction pills, status.md flagged stale (E3.5, E3.9, E6.4) |
| Repairs as learning; short runs as equilibrium | "0% by construction"; "a point on a drift" with floors (E6.4–E6.8) |
| Unequal ScoreMD comparisons | "native = unregularised arm at 10%"; "a parallel, not a head-to-head"; paper on its own vertical |
| Two ALDP5 data sets; σ units | data stamps, never one axis; σ dimensionless first |
| Overclaimed optimism | "predicted" only if declared; the unmet prediction shown; "not established" (E6.10) |
| Data provenance | dummy BBA struck; Chignolin excluded; 200 ps "documented"; held-out ≈ in-sample (E4.1) |

### 8.2 Hypotheses (always [H], dashed)

The wδ barrier as the missing wall, with its test (E6.7); order vs redundancy (#1137, f ≈ ½) (E5.7); n30 prediction 4
(contacts need a supplied wall); the share-of-reducible-loss criterion (E5.9); "networks learn low-order statistics
first", anti-order worsening with chain length, soft forces inherited across levels (X3 only); "two errors that
cancel" (E6.8); "≈ 0.02 at the paper's count" (E6.3); the best Sprint 1 flat arm hit by the vp_mean bug (E1.7);
synchronized erasure as the cause of fast torsions, shown struck (E3.9).

### 8.3 Every error the judges found, and its fix

F = fidelity, P = pedagogy, Fe = feasibility; proposals in brackets.

| Finding | Fix (where) |
|---|---|
| PMF budgets mixed: 0.097/0.096/0.113 are 1.9M, 1 seed (F; d1–d5) | budget chips, "≠", ordered 0.109/0.109 @380,700 (E6.3) |
| Sprint 5 paired across campaigns (F; d3 d4 d5) | within-campaign pairs, validity, 2k lens (E1.7) |
| "Predicted the optimal block size" (F, P; d1 d3 d4) | "explained after the sweep"; only the takeover window "predicted"; the unmet prediction shown (E5.8, E5.11, E6.9, E6.10) |
| Chain-model values tagged [M] (F, Fe; d1 d4) | [D·model] (E5.5–E5.9) |
| "Springs failed outright"; "every model one half" (F; d1 d2 d4 d5) | springs kept size (0.078 Å), whitening got neither; title "No Map Got Both Halves" (E4.2) |
| K_tan in Å⁻² (F; d4 d5) | per squared thermal width (E3.3, R12) |
| Problem 3 read as "vector side" or "ångström" (F, P; d5 d3) | one resolution reading plus Prop. 8 (E2.5) |
| Validity of JS 0.117 at 100 updates (F; all) | "10% valid" (E3.9) |
| Number slips: 19.4 (d1), 5.41 as the model's value (d1), "arrows correct at 0.5" (d1), bond readable "below 0.005" (d3), SNR range "in every convention" (d4), "≥ 0.42" source (d5), Rouse cited to #1129 (d2), spring constants as single values (d2) (F) | 19.3/20.1 (E6.8); 5.41 [D·model] beside 4.9 [M] (E4.4); "readable until about 0.5" (P0.1); bond length 0.003–0.004 (E2.3); per-convention SNR (E2.4); lab 11-16 (E5.3); lab 11-18 (E5.6); ranges (E3.1) |
| Missing caveats: \|a₁\| gauges by construction (d1 d5); seed-0-only values (d2); toy step limit vs measured blow-up (d2); #1141 force cost and baseline (d3); C3 slowest TIC (d3) (F, P, Fe) | captions (E5.11, E2.7); "toy limit vs measured failure" (X2); NEW · UNREVIEWED card with cost and stamp (E5.6); TIC 0.49 drawn (E5.3) |
| Ties not drawn: n_v = 1–8; ScoreMD size and contacts (F) | ties drawn (E5.8, E6.2) |
| Sprint 1 best flat 0.167 missing (F, P; d1 d2 d4 d5) | shown beside 0.479 (E1.7) |
| Demo posterior without ±1 µs exclusion; ghosts in the 103-d chart (F; d1 d5) | A17b precomputed with exclusion; Cartesian only (E5.1) |
| Non-additive handedness waterfall (F; d1 d5) | separate bars (E6.9) |
| AK PCA stated as fact or [M] (F, P; d2 d4 d5) | lens only, †, conditional wording, 85% reconciled (E1.8) |
| "Defects sit where theory says" is after the fact (F; d2) | paired with the declared predictions and outcomes (E6.10) |
| Mixed-data ruler; ψ hand-over out of the basin (F, P; d4) | mdshare only; in-basin hand-over (E1.1) |
| ALDP5 γ dial shown as history (F, P; d4) | [D·model · display interpolation] (E2.3) |
| (γ, v) corner labelled "both" (F; d5) | "bonds and size", with 9.1° and TIC 0.086 vs 0.046 (E5.4) |
| Prologue overloaded; Clock before definitions (P; d1) | 2:25, no numbers, no lanes (P0) |
| No one-mode warm-up; meters before their definition (P; d1 d2) | E2.1 ghosts only, E2.2 one mode |
| ALDP5 learned maps inside the BBA piece (P; d1 d2 d3 d5) | they end E3; E4 stays on BBA |
| Two ideas in one scene (P; d1 E5.8, d2 4.2/4.4, d5 P5.6) | E5.7–E5.10 split; lag dial in E3.8, γ alone in E5.4 |
| Heavy A(t) notation for a bug card (P; d1) | one sentence, formula behind a lens (E1.7) |
| Hope shown after the failure; wδ 413 before its criterion (P; d1 d3) | E1.3 before the attempt; 413 moved to E2.8 |
| γ/κ notation collisions; C1/C3 jargon; 17.5/11.4 two meanings (P) | §3.8 hygiene; lanes named by construction; units printed (E2.5) |
| Hand-over "C3 has none" (P; d4) | "almost none (0.26–0.28)" (E5.3) |
| Count dial with #895's PMF definition (P; d3) | definition chips, one definition per dial (E4.2, E6.3) |
| Gold block; fog-white information; count floors in the forces piece (P, Fe; d5) | teal block, lavender info (§3.1); E6.3 in the results half |
| Problem 2, embedding and hope missing (P; d3 d5) | E2.6; E3.1–E3.4; E1.3 |
| Trained outputs not local (Fe; d1 E4.7/E6.6, d4 P4-S09) | [I] decodes, #1119 after checking, labelled data vectors, forward paths + gauges |
| Heavy banks, float16, Δlogvol asset missing (Fe; d1 d5) | A17b (≈ 60 kB); int16 codec; A21 with parity |
| Explorables not bundled; no deep links; narrated lens hand; 20 live scenes (Fe; all, d4) | phase 0 engine work; playhead a lever where narrated; 19 levers, selectors as lenses |
| Re-deriving Covariance's valley and Retention's KL identity (Fe) | link cards (E2.6, E5.9) |
| LM warm start breaks determinism (Fe; d2) | cold start (R23) |
| Prologue numbering; Gaussianization flash-forward (Fe, P; d2) | "Episode n of 6"; E3.9 |
| Untested "exact" chain; Monte Carlo labelled exact; no encoder asset (Fe; d2 d3) | tests against the JSON (R19); A13 + R25 with parity |
| Ephemeral library path; pixel numeral check; crowded strips (Fe; d3) | pinned worktree (§6); static cue check + instrumented `text()`; one strip per panel group |
| Torsion-MC bases unspecified; per-frame wδ ellipsoids; MVP too complex; A1b ratio (Fe; d5) | #1025 code with fallback (E4.4); per molecule (X1); closed-form MVP; file's 1,428 |
| Retention's 63% and Ricci card (Fe; d1 d4 g4) | fixed on PR #3 before linking |

---

## 9. Build plan

**Principles.** Maths and tests first (the u1-force process: brief, probe pages, parallel scene writers; maths, visual
and pacing reviewers **plus an evidence judge**). Shared machinery once. The cheapest high-value probe fixes the
grammar before seven pieces depend on it. Risky work (the JS C3 port, the 3-D chain, wδ decodes) after the MVP; the
heaviest new maths with the least current value (Era 1) last; LISE never on the critical path.

| Phase | Work | Days | Gate |
|---|---|---|---|
| 0 Groundwork | Merge PR #3 or cherry-pick `src/app.js` (narration in `window.video.scenes`, JPEG frames), `src/main.js` lazy loading, `scripts/export-narrated.mjs`, `scripts/review-frames.mjs`; fix Retention's 63%, Ricci card and typed labels on PR #3. Promote **by copy** (no imports from `private/other`): u1-force `shared.js`/`space.js` from the PR #2 export (`SP/anim-claude_fiber-bundles-em-video-0ada80`), Retention's plot kit, llm-soc `codeBlock`/`connector`/`panel`/`chip`, Interactions `linalg.js`. Bundled explorables in `scripts/build.mjs` (`explorables/<id>/index.js` → `dist/explorables/<id>.html`), `explorable(scene, {prompt, challenges})` with a boot flag (`view.startExplore`), deep links `?video=&t=`, smoke test on wrapped explorables | 4–5 | `npm test` green; Parts 0/1 byte-identical |
| 1 Rigs, rail, ledger | R1–R4, R18–R20, R26, R27, R30, R31 with tests; `src/draw/thesis/{palette, rail, glyphs, badges, provenance, plane, journey, odometer, ruler}.js`; ledger schema, `ev()`, cue check, instrumented `text()`; script skeleton; pinned worktree and fixtures; **fidelity lints:** budget chip on every trained number, [D·model] on model rigs, ties drawn as ties, "predicted" only with a declared-before-run record | 5–6 | g4 §3 values; rail anchors ± 1 px |
| 2 **MVP "The flipped handle"** | a ≈ 7 min probe of five scenes from closed forms and ≈ 70 kB of JSON (A1, A11, A12, A19, A22 subset): **E2.3** nine rulers with the γ handle; **E2.9** ★ the promise; **E5.3** the clock measured then painted; **E5.4** the handle turned back with the #1057 dots and struck caption; **E5.6** the two-loud-modes gesture (halos later) | 6–7 | four-judge review; frames read every 4–6 s |
| 3 Real-molecule layer, E5, E4 | R25 with parity, `chain3d`, Fog Bench renderings; A13–A18, A17b; R19 tested against `exact-uniform.json`, halos; E5.11; rest of E5; E4 (A15, A16, R28, R29 tested against #1025, divisor lever, #1055 bars, #1119 only after reading its note) | 11–13 | parity tests; frame reads |
| 4 E6 | A21 (parity), A22 results, A24, A26, A27; R22; R23 cold start; R24; E6.6 reuses the E2.7 handle; E6.7 waits for A20 | 6–7 | A20 reproduces g2, else E6.7 held |
| 5 E2 rest, E3 | E2.1, E2.2, E2.4–E2.8; E3 (R11–R16, cone and peel via `space.js`, A5, A6, A8, A9, the Gaussianize simulation) | 10–12 | — |
| 6 E1 | R5–R10, A2–A4, A10 (numpy DCD reader), A23 | 6–7 | last by design |
| 7 P0, explorables, exports | P0; X1; X2 (lamps, drawer, walkers, force reader); X3 (A25, compare guard, floors, κ rails); narrated exports; README; Part 1 end card (two strings) | 8–10 | smoke test on explorables |

Total ≈ 56–67 working-day equivalents, slightly above the feasibility judge's 51–62 because E4 and E6 absorbed more
scenes; the §10 cuts recover ≈ 4 days. Parallel writers compress the calendar, not the reviews. The three-things path
(phases 0–2, E5, E2, X1) ≈ 32 days.

**Why this MVP.** It is feasibility's "flipped handle" and holds the heart of fidelity's E5 core (clock reveal,
whitening reversal, two loud modes; the lever arm follows with the tested chain rig). It carries the reversal with the
real E2 image, needs only closed forms and small JSON, exercises every device and runs the fidelity lints from day
one; the Fog Bench and C3 port come second (feasibility's fix to d5).

**Tests and render checks.** Rig expectations (§5), re-run in X2's lamps; ledger hashes, `ev()` resolution, §7 canon
and cue numerals; fidelity lints (plus "no posterior ghosts in non-Cartesian real charts"); the existing strict smoke
test (jumped, jumped-back and played frames identical; controls at extremes; no `Math.random`, `Date.now`,
`performance.now` under `src/videos`) extended to explorables; frames every 4–6 s via `review-frames.mjs`
(`PLAYWRIGHT_CHANNEL=chrome`) read before a scene is done, with pacing ≤ 2.2 words/s (`paced()`); open-PR numbers
re-checked before every export.

**Dependencies.** PR #3 (until merged, link cards say "on PR #3"); the PR #2 export; LOCAL read access once; the
pinned ML worktree; open ML PRs (#1104, #1137, #1138, #1136, #1113, #1141) through ledger flags; optional LISE A-REQ-1.

---

## 10. What was deliberately left out, and why

- **Note 25's "Cramér–Rao" αL values** as values: shown once, struck (E3.7); the formula is invalid.
- **Chignolin transfer cosines** (0.996/0.990): computed on ScoreMD's generated dummy frames.
- **The exposé's cond(H) ≈ 2.4×10⁶ on BBA**: probably pre-dates the transpose fix, on files later withdrawn.
- **n21's idealized spectrum (κ = 415), κ_t and G_t (Theorem 3)**: three more κ meanings on screen for little gain;
  on X3's κ rails only.
- **Λ_t, pull-versus-move, Müller–Brown, equal SNR in images**: too abstract for the arc; image analogies only on the
  precedent card.
- **The PGA atlas / thesis-extension line**: out of scope (critic); the Atlas video is linked.
- **Part 0's "shape space 2"** promise: not this programme; its card is untouched.
- **Spurs as scenes** (Riemannian flow matching, manifold FP regularizer, conservative wδ head, factorized densities,
  objective search): X3 cards; E1 and E4 carry their lessons.
- **d4's ghost hand, force-scale lever and four separate explorables**: folded into X1/X2 to keep levers and pages
  down.
- **d5's gold block, violet ramp end and fog-white information; d4's lavender shape and coral beside rose**: each
  clashed with the house rules or Retention.
- **d1's 50,000-frame bank and 800k-frame scan**: replaced by precomputed levels (A17b) and a strided subset (A4) with
  the logged 800k values.
- **1,000-molecule monitor curves** (floors 0.05–0.10 Å): the budget clock carries "changes where training ends" more
  robustly.
- **Generated BBA thumbnails as a requirement**: without LISE panels the scenes show labelled scalars; perturbed data
  never stand in for generated molecules.
- **A continuous ALDP5 γ dial as history**: only as a labelled display interpolation.
- **Re-deriving the KL identity, the balanced gradient flows, the retention toy**: linked (Retention 09, Covariance 15,
  Retention 05–06).
- **Pre-planned cuts to ≈ 62 min** (≈ −6 min, ≈ −4 build days): E2.6, E3.6, E4.5, E5.9 and E6.9 become link cards or
  one-line ledger entries (−2:40); E1.7 keeps two bug cards and E1.8 drops to 40 s (−0:30); the other scenes trim to
  their lower bounds at pacing review (−3:00). The committee path P0 → E5 → E6 survives every cut.
