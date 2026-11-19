# j-feasibility · Feasibility and coherence judge

Judge for the lens "feasibility and coherence", 2026-11-19. I read the brief, the critic, the number canon (g4), a1 §3,
a3, r8 §6A and all five proposals in full (d1-story, d2-mechanism, d3-evidence, d4-interaction, d5-visual). I then
checked the engine on this worktree (`src/`), the PR #3 export (`SP/anim-playable-video-prototype`), the PR #2 export
(`SP/anim-claude_fiber-bundles-em-video-0ada80`) and the local data under
`LOCAL = /Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative` (read-only `ls` and JSON key
listings, no writes). SP is the scratchpad root.

## Verdict in brief

All five programmes can be built with this engine. None needs a new rendering technology, a framework or GPU work. They
differ in how much new shared machinery they need, how much of their content depends on data that is not local, and how
well they connect to the existing pieces.

- **d2 (the bench)** is the most buildable. Its total data is under 200 kB, it needs nothing from LISE, its maths comes
  first with tests, and its five pieces continue Part 1 directly. **I recommend its structure as the spine**, renumbered
  and with the Era-4 material strengthened (§6).
- **d5 (one rail)** has the best visual system for holding the programme together: one fixed erasure rail with unit-tested
  geometry, the Fog Bench and honest erasure renderings. Its devices should be grafted onto the spine.
- **d1 (the question line)** has the best narrative glue: the Journey Map, question surgery, the List of Musts and threads
  that run from a plant to its payoff. It is also the largest (about 69 minutes) and has two scenes that need generated
  molecules that are not local.
- **d3 (the evidence)** has the best number discipline: a ledger as the single source of truth, provenance strips, floors
  and a no-comparison glyph. It is thinnest on theory, and its asset scripts depend on an ephemeral scratchpad path.
- **d4 (the knob)** has the best engine ideas (an `explorable(scene)` wrapper, deep links, and the same γ handle whose
  verdict flips), but the largest interaction scope. Its fourth piece's climax depends on a LISE model run.

---

## 1. What the engine gives today (verified) and what every proposal needs

### 1.1 Engine facts checked in the code

| Claim made by the proposals | Status | Evidence |
|---|---|---|
| `valueAt(control, t)` exists, so d4's "ghost hand" can show the authored value | **true** | `src/engine/controls.js` exports `valueAt`, `inputsAt`, `checkControls` |
| explore mode can start programmatically, as d4's explorable wrapper needs | **true** | `LiveView.startExplore(scene, t0)` in `src/engine/live.js`; called from `player.js:139` |
| snapshots are cheap | **partly** | `cloneState` deep-copies the whole state every `snapshotEvery` (0.5 s). With 1,000 walkers × 9 modes in Float64 that is 72 kB per snapshot, ≈ 13 MB for a 90 s scene (d4's estimate is right). Use Float32 and ≤ 500 walkers |
| explorables can reuse engine and scene modules | **false today** | `scripts/build.mjs` copies `explorables/*.html` verbatim. Only d4 lists the build change (bundled explorable entries). Every other proposal's explorable (X1, X2, the bench, the ledger) silently needs it too |
| deep links `?video=…&t=…` | **absent** | `src/main.js` reads only `?video=`; `app.js` and `player.js` have no time parameter. Needed by d4 E0 and d1 X2 ("watch" links) |
| narrated MP4 export and review frames | **on PR #3 only** | `src/app.js` differs from PR #3 by two lines (narration in `window.video.scenes`, JPEG `mimeType`). `export-narrated.mjs` and `review-frames.mjs` live in `SP/pr3-missing/scripts/`. All five proposals correctly make this a prerequisite |
| lazy loading of heavy videos | **on PR #3 only** | PR #3 `main.js` (`interactions` with `load: () => import(...)`) |
| determinism is enforced | **true, and strict** | `scripts/smoke-test.mjs` compares a jumped-to frame, a jumped-back frame and a played-up-to frame of every live scene, renders every control at its extremes, and fails on `Math.random`, `Date.now` and `performance.now` anywhere under `src/videos` |
| helpers to promote exist | **true** | u1-force `shared.js` (PR #2 export): `track clock leverSim paced frame axes drawPath drawCurve drawSamples panel pill readout stamp caption aside drawVector drawBalance drawCurvatureMap …`; u1-force `space.js`: cameras, `tube`, `drawTube`, `drawArrow3`, `drawRibbon` …; retention `shared.js` (PR #3): `frame axes drawPath drawCurve heatmap readout pill legend stamp track`; llm-soc `shared.js` (on main): `panel node chip connector packet codeBlock badge meter`; interactions `linalg.js` (PR #3): `symEig pinv solve cholesky leastSquares` |
| u1-force's `space.js` is available | **only in the PR #2 branch** | On this worktree `private/other/u1-force` holds only `dist/`. The source is in `SP/anim-claude_fiber-bundles-em-video-0ada80/private/other/u1-force`, so promotion must copy from the PR #2 branch, not from main |
| JSON assets can be bundled | **true** | esbuild's default `.json` loader works with the stdin entry in `build.mjs`. But JSON number arrays become JS text of about 4–6 bytes per value, so large arrays should use d3's `{dtype, scale, shape, b64}` codec |

### 1.2 Local data checked (r8 §6A holds)

Every asset the MVP scenes need is local and small:
- `runs/range-order-mechanisms-20261118b/` holds `collective_modes.json` (27 mean squares in Å², 27×27 vectors, fitted on
  1,300,156 frames; max/min ratio **1,428.3**, against note 27's 1,423); `bba_charts.json` (c₀ = 0.15706, library units
  15.031/5.995/2.903/1.281/0.486, summing to 27; first-order `t_half` and `blur_t0.01_A` tables for cartesian / internal /
  +2 / +2 whitened / +2 twice as loud / +8); `chain_spec.json` (mean[53], cholesky[53], phase_scale); `exact-uniform.json`
  (a 20,000-query Monte Carlo, `queries` key); `signal-*.json`; `chain_model.py` and `bba_charts.py`; and EXECUTED_COMMIT
  2d9711e8. The two unit systems the proposals quote are both right: d2/d1 use library units, d4/d5 use Å/6.252
  (15.588/6.217/3.010/1.328).
- Also present: BBA DESRES `train.npy` (437 MB), `heldout.npy` and `membership.npz`; mdshare `…3x250ns…npz` (90 MB);
  bgmol `aldp.npy` (264 MB); `data/processed/aldp5_train.npy` and `aldp5v_train.npy`; 330 files of #765 samples; 15 sim-beta
  trace files; `information-retention-aldp5-20261104/rows.csv` and `attempt-2-wide`; the leaderboard parquet (synced
  11-18 23:06); and the AK DIMS data `diepeveen2024/data/molecular_dynamics/4ake/{dims0001_fit-core.dcd, adk4ake.psf}`.
  A numpy DCD reader already exists in `SP/g2/checks/ak_cartesian_pca.py`. mdtraj is not needed.
- **A lead none of the proposals uses:** `runs/bba-reverse-completion-20261118/` (#1119) is local. It holds
  `forward-readout.csv` (per-noise-level `radius_A`, `bond_width_A2`, packing and torsion dependence for C3, two_mode
  and their paired difference, 512 sources, block 95% CIs) and small `s{0,2,3}-g650-at0.npz` files. Those files contain
  `noisy` (4×109) features and trained-model `endpoint_features` (4×2×109) and `clouds` (4×2×28×3). These are real
  completions by the trained models: few, but real. Check what #1119 measured before use. It may rescue d1 E4.7, d1 E6.6
  and d4 P4-S09, which otherwise need LISE.
- Not local: the 100k-molecule panels and checkpoints of the main study models (C3, ordered, ScoreMD, covariance base,
  wδ) in `runs/s12-bba-study-20261114/` on LISE. d3 (A-REQ-1), d4 (`reverse_path_s2.json`) and d5 (optional panels) know
  this. d1 does not, in two scenes (§5).

### 1.3 Shared new components (the real cost centre)

These are needed, in some form, by at least three proposals. Building them once is most of the programme's engineering.

| Component | Needed by | Effort (working days) | Risk |
|---|---|---|---|
| Promotion into `src/draw` and `src/engine` (plot kit, `leverSim/clock/paced/track`, `space.js`, `codeBlock`, `linalg`) as copies, never imports from `private/other` | all | 2–3 | low; keep side videos untouched |
| Erasure clock / rail with glyphs, estimator styles, waterline, playhead, log-SNR scale, layout anchors as unit tests | all | 2 | low |
| DOM-free rigs with Node tests: VP schedule, t½(λ), r(t), γ dial, lag dictionary, Tweedie, blur dial, torsion readability (von Mises/Rice quadrature), constraint split, size response, radial volume toy, cone, wδ flattening family | all (d2 specifies them best) | 4–6 | low; values fixed by g4 and the proposals' checks |
| Badges, provenance strip and the number ledger (`ev('id')`) | all; d3 strictest | 2 | low |
| Plots missing from `src/draw`: line chart, histogram, matrix heat map, sparkline, log–log plane with seed bars | all | 2 | low |
| BBA 3-D chain renderer (tube, beads, mode arrow fields; typed-array painter as in atlas `torusViews.js`) | d1, d3, d4, d5 | 2 | low–medium (depth sort, NeRF anchoring needs Kabsch alignment, as d5 notes) |
| C3 and ordered-internal encode/decode in JS (log bonds, log tan(θ/2), Cholesky whitening from `chain_spec.json`, phase pairs at κ = 1.504, Helmert loud block with c₀, NeRF), with parity fixtures | d3, d4, d5 (and d1 A11 in numpy) | 2–3 | **medium**: conventions (NeRF anchors, torsion sign, Helmert basis) must match the library exactly |
| Bundled explorables plus `explorable(scene)` wrapper and deep links | d4 explicitly; implicitly d1, d2, d3, d5 | 1.5–2 | low |
| Data scripts (`scripts/data/*.py`, numpy, `python -I`, provenance header) | all | 3–6 | low–medium; heavy only for precomputed decodes (LM rebuilds, wδ projections), AK and the volume reweighting |

**A parity rule the merge must adopt.** d1 and d4 forbid importing `riemanniangenerativemd`; d3 imports it through
`--rg-src SP/rg-main/src`. The second is unsafe, because SP is this session's scratchpad and will vanish. The robust
middle way:
1. Make a durable read-only git worktree of the ML repo at one named commit (for example the run's 2d9711e8, or c099347a).
2. Run the library once there to write small parity fixtures (features, decodes and volume terms of about 10 frames).
3. Write the build-time scripts and the JS ports in plain numpy and JS, and test them against the fixtures.

---

## 2. Per-proposal assessment

### d1 · "Where to Add the Noise" (story architect)

- **Scope:** P0 plus six episodes (E1–E6) plus two explorables, about 69 minutes, about 60 scenes, 13 live.
- **New components:** all of §1.3 except the explorable wrapper. Its own devices are cheap 2-D text and diagram work:
  Journey Map, question surgery, List of Musts, Odometer, correction pills.
- **Data:** A1–A14, all local. But **E4.7** ("noised and denoised by the trained C3 model") and **E6.6** ("one generated
  feature vector rebuilt three ways") need trained-model outputs. d1 does not list them as non-local. The #1119 bundle
  may cover both partly.
- **Engine and bundle problems:**
  - E5.1's 50,000-frame posterior bank is about 8 MB as int16 (about 11 MB as base64) inside a self-contained page.
  - A6 stores float16, which JS cannot read portably.
  - X1 assumes bundled explorables.
- **Coherence with existing pieces:** excellent. Its ordering puts Part 1 between E1 and E2. E3.1 pays off Part 1's
  "Next video" card. It reconciles Problem 3. It lists fixes for Retention's "63%" and its Ricci card. One overlap:
  E2.3's training valley repeats Covariance's balanced gradient flows, so link instead.
- **Effort:** d1 claims 50–60 days; I estimate 55–65, the largest. P0 can only be built last, because its postcards are
  re-rendered from every episode.

### d2 · "The Bench" (mechanism engineer)

- **Scope:** an Era-1 prologue plus Parts 2–5 plus the bench explorable, about 50 minutes, 33 scenes, most of them live
  but analytic.
- **New components:** 17 rigs in `src/model/bench/`, plus the clock, curtain, meter, raster, ghost bundles and badges.
  The new maths is an exact chain readability (9×9 transfer matrices plus a two-copy automaton), which d2 says it checked
  against `exact-uniform.json` within 0.01. It is the most valuable new derivation in the panel, and it needs its own
  tests before the narration calls it "exact".
- **Data:** under 200 kB, all local, no LISE dependency. Everything else is computed at load or per frame.
- **Engine risk:** the **5.4 rebuild uses Levenberg–Marquardt "warm-started each frame"**. That makes a frame depend on its
  seek history, so it fails the smoke test's jumped-versus-played check. Fixes are in §5.
- **Gaps:**
  - 4.1 "a real BBA frame noised along the clock" has no C3 encoder asset (no `chain_spec.json` in A1–A7).
  - Era 4 is compressed: the learned warp is a number in 3.6, the lag dial an inset in 4.2, the autopsy is 3.4 and 3.7,
    and Gaussianization is a flash-forward in the prologue.
- **Coherence:** it continues Part 1 directly (Part 2 MVP, a one-string retarget of Part 1's card) and has one handle
  (the playhead). Its arc runs "nine clocks become one" → "one clock is not enough" → "order with range". It has link
  cards to Retention 05–06, Covariance 14–16 and 32, and Interactions 02/12. The "Prologue" naming after Part 1 is
  awkward.
- **Effort:** d2 claims about 42 days plus reviews; I estimate 40–48, the smallest.

### d3 · "Readable" (evidence curator)

- **Scope:** seven pieces (about 57 minutes, mostly narrated, about 11 live scenes) plus the Ledger explorable.
- **New components:** the evidence draw kit (badge, provenance strip, hatch bands, seed bar, budget clock, ledger card,
  no-comparison glyph, count dial); the C3/ordered/wδ noising of real molecules (5.2: live Cartesian and C3, wδ and joint
  rebuild precomputed at 31 levels and snapped to the nearest, which is a sound choice); genuine forward VP paths (5.8).
- **Data:** A1–A20, all local except the optional A-REQ-1. Heavy curation: A16 is "entered twice and diffed".
- **Engine risk:** the proposed smoke-test check of "every numeral … on-canvas" cannot read numbers off canvas pixels. It
  would need instrumentation of `text()` and `tex()`, and it would flag tick labels, times and dates. The asset scripts'
  `--rg-src SP/rg-main/src` points into the ephemeral scratchpad.
- **Coherence:** chronological order 1 → 7, end cards link the neighbours, and "two floors" unifies the model's floor
  with the evidence floor. It is weak on the brief's "analytical examples worked out": there is no cone or orange peel,
  no pairing theorem, and the lag dial is a table.
- **Effort:** d3 claims about 46 days; I estimate 48–55, because curation and the ledger tooling are the cost.

### d4 · "Hand over the knob" (interaction designer)

- **Scope:** four playable videos (about 55 minutes, 20 live scenes with five levers each) plus explorables E0–E4.
- **New components:**
  - engine additions: an `explorable()` wrapper with a boot flag, bundled explorables, deep links, a ghost hand and a lever
    icon strip;
  - rigs: a thin-triangle pullback geodesic against a 4,096-step reference, a seeded SGD toy, and Langevin simulations;
  - assets: the C3 port, `bba_volume.json` (the immersion volume re-implemented in numpy), and precomputed rebuilds for E1.
- **Data:** local, except **`reverse_path_s2.json` (a LISE model run) for the P4 climax**. Its fallback is an [I] molecule.
- **Design risk:** the clock hand is a lens even where the narration describes the state under the hand. That bends
  `docs/interactive-video.md` ("a lens … changes nothing the narration claims"). d4 mitigates this with level-naming cues
  and a ghost hand, but that is extra UI and review work.
- **Coherence:** the same γ handle flips its verdict between P2 and P4, which is a superb device. Each part follows an era.
  The links are explicit (Part 1 Problem 1 replayed, Covariance 14/23/32, Retention 05–06). Its palette makes global shape
  lavender, which clashes with Retention's lavender for information, and it uses coral for contacts and rose for force,
  two reds.
- **Effort:** d4 claims about 60 days; I estimate 60–65.

### d5 · "Every chart is a clock" (visual director)

- **Scope:** five pieces (about 62 minutes, 18 live scenes) plus X1 (the rail) and X2 (the Fog Bench).
- **New components:**
  - the rail with unit-tested pixel anchors (I checked: 10⁻⁵ → 140, 0.01 → 683, 0.7 → 1480 all follow from
    ℓ = ln(α²/σ²));
  - glyphs with moon fill and the warm-to-cool ramp;
  - the Fog Bench with four honest renderings (ghosts, best linear guess, fog opacity, crystallization);
  - `chain3d` with mode arrow fields;
  - a live torsion Monte Carlo chain under three bases (P4.5).
- **Data:** local. Two risks:
  - P4.5's live Monte Carlo must reproduce #1025's 10.34 / 5.41 / 10.71 Å with bases that d5 does not specify exactly.
  - A1b's re-fit of the BBA Cartesian PCA may not give note 27's 1,423 (d5 has a fallback).
- **Engine and performance:** X2's wδ per-bead ellipsoids need (JᵀJ)⁺ of an 84×84 matrix. That is t-independent, so
  compute it once per molecule at load, not per frame. P5.1's 20,000-frame bank is about 4.5 MB of base64. The MVP
  (the P5 core) is the most complex piece, so it is a risky first build.
- **Coherence:**
  - Strongest visually: one rail in every piece, a swimlane map with overlapping eras.
  - It imports Part 1's scene module as a still (scenes are frozen objects, so this works) and morphs Retention 06's
    channels onto the rail.
  - But gold becomes the loud block's colour, against the house rule that gold marks attention only.
  - It recolours information from lavender to fog-white, which departs from Retention.
- **Effort:** d5 claims about 55 days; I estimate 52–60.

---

## 3. Scores (1–10; feasibility and coherence weighted most in "overall")

| Proposal | Fidelity | Explanatory | Craft | Feasibility | Coherence | Overall | One-line reason |
|---|---|---|---|---|---|---|---|
| d1 story | 8 | 8 | 8 | 6 | 9 | 7.5 | Best narrative glue; largest scope; two scenes need non-local generated data |
| d2 mechanism | 9 | 9 | 7.5 | 9 | 8 | 8.5 | Exact rigs, tests first, <200 kB data, continues Part 1; Era 4 compressed |
| d3 evidence | 9 | 6.5 | 7 | 7 | 7.5 | 7 | Best number discipline; thin theory; curation-heavy; ephemeral library path |
| d4 interaction | 8 | 8 | 8 | 6 | 8 | 7 | Best engine ideas and the flipped-handle device; 20 live scenes; LISE-dependent climax |
| d5 visual | 8 | 8 | 9 | 7 | 9 | 8 | One rail across all pieces and honest erasure renderings; risky MVP; gold misused |

---

## 4. Grafts for the merged programme (best elements, their source, and why)

1. **d2's rig library** (`src/model/bench/`, 17 rigs with Node tests, "toy says / molecule says" badge pairs, calibration
   lamps in the bench): every piece needs these closed forms. Writing the maths and tests first is the process proven in
   u1-force, and the bench explorable falls out almost free.
2. **d5's rail** (fixed log-SNR geometry labelled in t, anchors as unit tests, waterline and fog, moon-fill glyphs, a
   training-share sparkline under each lane) as the one instrument in every piece. A single layout module stops the
   axis drifting between pieces (u1-force's stamp-baseline lesson).
3. **The flipped handle** (d4 P2-S07 → P4-S04, d1 E2.6 → E5.4, d2's raster): one γ-dial component drives nine ALDP5
   modes ("the promise") and the 27 BBA modes ("range without order"), with the trained #1057 dots. This is the
   programme's central reversal. It is built from closed forms plus a 4-row logged table, so it is the ideal MVP.
4. **d1's narrative devices**: the Journey Map, question surgery, the List of Musts (M1–M9) and plant-to-payoff threads
   (the rose collision pin, the HOPE stamp flipping to CAME TRUE, DIFFERENTLY). They are cheap 2-D work, and they do what
   the brief asks most: why each approach looked promising and why it was left.
5. **d3's evidence layer**: `ledger.json` as the single source of numbers through `ev('id')`, the provenance strip, both
   floors, the budget clock, seed bars with the effect gauge, the no-comparison "≠" glyph, and an evidence judge in
   review. This is how g4's canon stays true on screen across pieces.
6. **d5's Fog Bench rule** "no pixel blur; every blur is an ensemble of real noise draws", with its four renderings, and
   **d3 5.2 "four charts, one molecule"**. Cartesian and C3 are noised live in JS; wδ and joint decodes are precomputed and
   snap to labelled levels. Together they give real-molecule erasure that is honest and cheap per frame.
7. **The "decided first" climax built from local data** (d3 5.8 / d5 5.7 / d1 E5.9): genuine forward VP paths of one
   held-out molecule in the ordered chart, played backward, plus the logged #1133 gauges (R² 0.63 at t = 0.13 inside the
   predicted 0.26–0.1). Use this instead of d4's LISE reverse path. #1119's local completions can add a few real model
   endpoints.
8. **d2's exact "two halos"** (4.5: chart A against chart B ghost bundles in the chain model, importance-weighted, with the
   ESS shown) and the **exact transfer-matrix anti-order heat map** (4.3). Both are computed live, fast and exact once
   tested.
9. **The phantom spring** (d2 5.3 / d4 P5-S05 / d5 6.2): a radial Langevin toy plus BBA Rg reweighting by the difference
   between the invariant and immersion volume terms. It is a small simulation, a local asset (d4's `bba_volume.json` or
   d3's A18) and a memorable climax for an honest correction.
10. **d4's engine additions**: bundled explorables, `explorable(scene, {prompt})` reusing a live scene's code path, and
    deep links `?video=&t=`. Every proposal's explorables and d1's Logbook need them, and they are 1.5–2 days once.
11. **d4 P3-S09 "under water"** (the global RMS divisor lever, 1.31 against 27.1, with bars sinking below σ(t_min) = 0.045):
    one number replays the #1025 diagnosis, in closed form.
12. **The odometer at the wall** (d5 2.5 / d1 E1.5 / d2 P.3): the flattening family, the wδ and Euclidean odometers, the
    real ALDP5 planarity histogram and a phantom-bead lever. It is the Era-1 climax, computed from the local
    `aldp.npy`/`aldp5_train.npy` (d5 A10b is the lightest version).
13. **d2 3.2–3.4 cone, orange peel, and lift-noise-project** through the promoted `space.js`. This is the delivery of
    Part 1's "Next video: the spring metric", with exact readouts (c = 0.103, K_tan = 0.0293, Kρ²/12).
14. **The moving baseline and the αL barcode** (d3 2.5 and 1.5, d1 E1.7). These are the two honesty beats. Note 25's
    0.79–1.27 is drawn and struck through, and the data are local (37 visits is a test target).
15. **"Two charts, two blind spots"** (d5 6.5 / d1 E6.5) under a large [H] badge. It ties Era 1 to the open problem, but
    only after d5's A2b reproduces g2's first-order wδ column from local frames.
16. **The count dial** (d3 6.6 / d5 6.7): floor against N. It explains in one cheap scene why the paper's 0.034 is not
    comparable with 0.097 at 100k.

---

## 5. Errors and risky claims, with fixes

### d1
1. **E4.7** shows a held-out molecule "denoised by the trained C3 model", but trained-model outputs of the main study are
   not local. *Fix:* draw the #1055 band contributions as logged bars over a data molecule with a plug-in decode badged
   [I]; or use #1119's local `forward-readout.csv` (radius per noise level, C3 against two-mode) and its few completions;
   or request a LISE export.
2. **E6.6** rebuilds "one generated feature vector", which is not local. *Fix:* use a #1119 `endpoint_features` vector (if
   it is an ordered-internal completion), or a noised data vector at t = 0.01 labelled as such.
3. **E5.1**'s 50,000-frame posterior bank is about 8 MB as int16 inside a single-file HTML, and its ESS is not note 27's
   (which used 1,300,156 frames). *Fix:* a 10–20k int16 bank lazily loaded, or weights precomputed at a few levels;
   print the bank's own ESS, labelled "demo bank", and quote ≈ 700 only as note 27's value.
4. **A6 is float16.** JS has no portable Float16Array. *Fix:* int16 at 0.01 Å with d3's base64 codec.
5. Chain-model values are badged **[M chain model]** (E5.5, E5.7, E5.8), but they are computations on an exact model.
   *Fix:* badge them [D], with "Monte Carlo of an exact model".
6. **X1 "reuses the Clock component"**, but explorables are copied verbatim. *Fix:* add bundled explorable entries
   (d4 G0.4).
7. **E6.3** reweights Rg histograms by volume factors, but no asset produces Δlogvol. *Fix:* add d4's `bba_volume.json`
   or d3's A18, with a test against #1100/#1103's 9.58/9.64 Å.
8. **Scope:** 69 minutes over seven episodes plus P0, and P0 can only be built last. *Fix:* fold P0's line into the
   finale, or make it a 2-minute trailer; cut the overlap between E1.6 and E1.7.
9. **E2.3** re-derives the training valley that Covariance's balanced gradient flows already show. *Fix:* link to
   Covariance and keep only the pairing table with the ALDP5 window numbers.
10. **A11 ports `chain_coordinates.py` to numpy**, but `chain_spec.json` already holds the fitted mean, Cholesky factor and
    phase scale. *Fix:* port only the encode and decode, and check them against a library-generated parity fixture.

### d2
1. **5.4 warm-starts Levenberg–Marquardt "each frame"**, so the frame depends on seek history and the smoke test fails.
   *Fix:* cold-start from a fixed guess with fixed iterations; or keep the warm start inside a seeded `simulation` state
   (snapshotted); or precompute on a grid of drag offsets.
2. A **"Prologue" watched after Part 1** and before "Part 2" muddles the numbering, and Part 0 promises a different
   "Shape space 2". *Fix:* number every piece (Part 2 … Part 6), or label the Era-1 piece an optional history episode.
3. **P.6 puts the 2026-11-05 Gaussianization result inside the Era-1 prologue.** *Fix:* stamp it as a flash-forward ("a
   month later"), or move it into the Era-4 cluster where d1 E4.3 and d5 4.2 place it.
4. **The exact transfer-matrix chain is "new in d2"** and agrees with note 30's Monte Carlo only to about 0.01.
   *Fix:* test it against `exact-uniform.json` before any narration says "exact"; show three decimals with a footnote,
   as d2 already proposes.
5. **4.1 "a real BBA frame noised along the clock"** has no encoder asset. *Fix:* add `chain_spec.json` and the C3 port
   (shared with the grafts), or restrict 4.1 to glyphs.
6. **2.5's bowl overlaps Covariance's balanced gradient flows.** *Fix:* link to it and keep only the ALDP5 curvature
   numbers (1.9×10⁴ against 8.1).
7. **Era 4 is under-told** (warp, lag dial, autopsy, prediction ≠ generation are spread across 3.4, 3.6, 3.7 and 4.2).
   *Fix:* graft one Era-4 cluster (§6).

### d3
1. **The asset scripts import the library from `SP/rg-main/src`**, the ephemeral scratchpad. *Fix:* use a durable read-only
   worktree at a named commit recorded in every asset header, or numpy ports with parity fixtures.
2. **The smoke-test check of "every numeral … on-canvas text"** cannot read canvas pixels and would flag ticks, times and
   dates. *Fix:* check narration cues statically against `ev()` and model outputs; in a test build, instrument `text()`
   with a whitelist for layout numerals.
3. **`exact-uniform.json` is labelled "[D, exact]"**, but it is a 20,000-query Monte Carlo. *Fix:* "Monte Carlo of the
   exact chain model", or d2's transfer matrices.
4. **#1141 (2026-11-19) is newer than the reports and the canon.** *Fix:* badge it "new, unreviewed" and verify it against
   the lab entry at build time.
5. **There are almost no analytic mechanisms** (no cone or peel, no pairing theorem, the lag dial is a table), although the
   brief asks for analytical examples. *Fix:* graft d2's cone and peel and its lag rig into piece 3 and piece 4.
6. **Provenance strips "never dropped"** on every panel can crowd the frame at 13 px. *Fix:* one strip per panel group,
   with details in the ledger explorable.

### d4
1. **The clock hand is a lens while the narration describes its state**, against the documented lens rule, and a viewer's
   lens setting overrides the authored keyframes until the scene ends. *Fix:* make it a lever through `leverSim` wherever
   the narration depends on it. If the ghost hand stays, budget and test it.
2. **P4-S09's climax needs `reverse_path_s2.json`** from a LISE model run. *Fix:* forward paths played backward (local)
   plus the logged #1133 gauges, and #1119's completions for a few real endpoints.
3. **About 3–4 days of engine work sit on the MVP's critical path** (wrapper, boot flag, deep links, ghost hand, lever
   strip). *Fix:* move them into the groundwork and extend the smoke test to wrapped explorables (today explorables only
   run for 1 s).
4. **Twenty live scenes plus four explorables** is the costliest build and review. Several levers only select a table row
   (K, chart, γ at four trained points). *Fix:* keep levers where the narration's claim changes; turn table selectors into
   lenses or authored steps; aim for 3–4 levers per video.
5. **Palette clashes:** lavender for global shape (Retention uses lavender for information), and coral contacts beside rose
   force. *Fix:* the programme palette in §6.3.
6. **`bba_volume.json` is validated only against r7's printout.** *Fix:* also check it against a library-generated parity
   fixture at a pinned commit.

### d5
1. **Gold is the loud block's colour**, against the house rule that gold marks attention only. *Fix:* teal for the
   collective block (as d1 and d3 do) and gold for the playhead; give wδ another hue.
2. **P4.5's live torsion Monte Carlo must hit #1025's 5.41 ± 0.51 Å**, but the bases are not specified (#1025's base lives
   in a map's feature space). *Fix:* take the base from #1025's code and test it before narrating; otherwise show the
   logged values beside an illustrative Monte Carlo.
3. **X2 computes the wδ ellipsoids (JᵀJ)⁺ (84×84) per frame.** *Fix:* they do not depend on t (only s² scales them), so
   precompute them per molecule at load.
4. **P5.1's 20,000-frame bank** costs megabytes and gives a different ESS from note 27's. *Fix:* as for d1 item 3.
5. **The MVP is the P5 core**, which needs chain3d, the Fog Bench decoders, the C3 port and crystallization at once.
   *Fix:* first the closed-form rail, the γ/v pad and the two loud arrows; the Fog Bench second.
6. **Fog-white replaces lavender for information**, against Retention, d1 and d2. *Fix:* keep lavender for information,
   programme-wide.
7. **A1b's re-fit may not give 1,423.** *Fix:* use the local file's computed ratio everywhere ("≈ 1.4×10³", source
   printed), as d1, d2 and d4 do.

### Cross-cutting (all five)
- **"Same area, different profile"** (d1 E5.8, d2 4.6, d4 P4-S07, d5 5.6): Retention already derives the KL flow identity
  on its toy. Link to Retention and show only the chain-model areas (0.0778/0.0784 against KL 0.0766), without
  re-deriving.
- **Retention's "63%" and its Ricci-flow card** must be fixed on PR #3 before any piece links to Retention (d1, d4 and g4
  note this).
- **Export:** every narrated MP4 and every pacing review depends on PR #3's `app.js`/`main.js` and the two scripts. Merge
  PR #3, or cherry-pick those four files, before the first narrated review.

---

## 6. Recommended spine and build order

### 6.1 The spine: d2's structure, amended

**Why d2.**
1. It is the most buildable decomposition. Five pieces of 8–11 minutes (≈ 50 min) fit the user's flagged-cuts feedback.
   Each piece is a set of tested rigs plus a few logged numbers, under 200 kB of data in total and with no LISE
   dependency.
2. It attaches best to what exists. Part 2 picks up where Part 1 stops (its "×20" becomes ×10–14 in a real basin and
   ×30 across all data, and Problem 3 is reconciled). Part 1's "Next video" card needs a one-string retarget. Part 3
   delivers the promised spring metric. Link cards go to Retention, Covariance, Interactions and Atlas, and nothing is
   rebuilt.
3. Its arc is the same reversal the other four dramatize ("nine clocks become one" → "one clock is not enough" →
   "order with range" → "reading a force"). So their best scenes graft into it without restructuring.
4. Its rigs are exactly the shared model layer that every other proposal's scenes also need.

**Amendments.**
- (a) Number the pieces continuously after Part 1, or keep the Era-1 piece as an optional history episode (d1 puts it
  before Part 1).
- (b) Add one Era-4 cluster of about 6–8 minutes: Meet BBA, the 1 ps lens (184 → 2.99, kept off the κ_res rail), the
  lag dial, the 5 November correction with its pill, the 2×2 of failure, the autopsies with d4's divisor lever, "size is
  long range", and "prediction ≠ generation". It can open Part 4 (range and order) or stand alone as d5's P4. Take the
  scenes from d1 E4 and d5 P4.
- (c) Move the Gaussianization flash-forward out of the prologue into that cluster.
- (d) Put d1's Journey Map, question surgery and Musts on every title and end card.
- (e) Make d5's rail the one instrument, and d3's ledger the one number source.

### 6.2 Build order (merged)

| Phase | Work | Days (equivalent) | Gate |
|---|---|---|---|
| 0 | Merge PR #3, or cherry-pick `app.js`, `main.js` (lazy load), `export-narrated.mjs` and `review-frames.mjs`; fix Retention's 63% and Ricci card there. Promote the helpers by copying: u1-force `shared.js`/`space.js` from the PR #2 branch, retention's plot kit, llm-soc's `codeBlock`/`connector`, interactions' `linalg.js`. Bundle explorables; add `explorable()` and deep links | 4–5 | `npm test` green; Parts 0/1 frames byte-identical |
| 1 | `src/model/bench` rigs C1–C14 (d2) with Node tests; rail, glyphs, badges and noise ruler (d5 geometry, d1/d3 conventions); ledger schema and `ev()`; data-script skeleton with provenance header and a durable pinned ML worktree for parity fixtures | 5–6 | tests reproduce g4 §3 values; rail anchors |
| 2 | **MVP "the flipped handle"** (8–10 min probe): nine ALDP5 rulers, flat → thermal ("the promise"); the BBA clock reveal (measurement before picture); the 27-mode γ fan with the four trained dots ("range without order"); the two-loud-modes gesture moving the C3 lane and the plane dot. Data: A1 widths (4 kB), `bba_charts`/`collective_modes`, #1057/#1069 tables | 6–7 | three-judge review plus an evidence check |
| 3 | The real-molecule layer: C3 and ordered encoders in JS with parity fixtures; `chain3d`; four charts on one molecule (d3 5.2) and the Fog Bench; exact anti-order and two halos (d2 C12); seesaw; "decided first" (forward paths plus #1133); then the rest of the range-and-order piece and the Era-4 cluster | 9–11 | frame reads every 4–6 s |
| 4 | Forces piece: blur dial (reusing phase 2's nine modes), the phantom spring (radial toy plus Δlogvol asset), wall and blur, the joint rebuild (cold-start LM), drift panels, count dial | 6–7 | |
| 5 | Noise clock completed (Tweedie, bowl linked to Covariance, blur dial) and the embedding piece (cone, peel and lift through `space.js`; the race from #765 samples; walkers from β; αL barcode) | 9–11 | |
| 6 | Era-1 piece: wδ rigs (odometer, flattening condition, scale clock), the geodesic toy, AK chord (reusing g2's DCD reader), the moving baseline | 6–7 | the heaviest new maths, the least current value, so it goes last |
| 7 | Explorables (the rail clock first, then the bench with calibration lamps, then the ledger merged with d1's Logbook); narrated exports; README sections | 6–8 | |

Total: about 51–62 working-day equivalents. That is within the proposals' own range, with the riskiest work (the JS C3
port, the 3-D chain) placed after a cheap, high-value MVP has fixed the visual grammar.

### 6.3 Decisions the merge must make once

- **Palette** (the majority across proposals, compatible with the house palette and Retention): stiff orange for
  bonds/angles; soft blue for torsions; **teal for the collective/loud block and global shape**; **rose for
  contacts/excluded volume/the wall**; **lavender for readability/information**; gold for attention only (playhead,
  cursor). Charts are identified by emblem or glyph shape, never by colour.
- **Axis:** d5's rail is linear in log-SNR and labelled in t, with log t ticks. It is schedule-free (note 27 §2), and its
  fixed geometry is tested.
- **The playhead:** a lever (`leverSim`) wherever the narration states what it shows. A lens only where nothing narrated
  depends on it.
- **Numbers:** one `ledger.json` (d3 schema) built from the assets. Scenes read numbers through `ev()` or tested model
  functions, never as typed literals. g4's canon is the test oracle: 1,428 from the file (narrated "≈ 1.4×10³"), C3 Rg
  window 0.27–0.28, αL "±50%", σ always dimensionless first.
- **Data:** numpy scripts with `python -I`, reading LOCAL read-only; assets in d3's header and array codec; library
  parity through fixtures from a pinned durable worktree; LISE only as optional enrichment, with local fallbacks (#1119
  first).
