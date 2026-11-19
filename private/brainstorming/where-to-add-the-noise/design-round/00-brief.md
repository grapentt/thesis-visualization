# Design brief: visualizing the riemannian-generative project — its ideas and its evolution

Today: 2026-11-19. Scratchpad root: SP = /private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad

## Mission

The author (a master's student; the thesis is the riemannian-generative project) asked:
"think deeply about nice and thoughtful visualizations we can create that explain the project's evolution and
ideas. E.g. why the Euclidean metric is super arbitrary for molecular configurations, the initial idea of
straightening with wδ, the embedding and pullback approach, stiffness, some analytical examples worked out, how
noise destroys certain modes at different times and how new coordinates (or more generally a new metric) change
that and why this can be helpful, etc. Think about what else we have done, why the approaches looked promising or
did not work out, why we are optimistic about the current approach. Understand it all in detail and think about
what all to visualize (everything if possible!) and how to do it nicely and thoughtfully. Feel inspired by
existing visualizations in this repo (also on open PRs)."

The output of this design round is a **visualization programme**: a set of narrated/playable videos and
explorables (in the thesis animation repo, thesis pieces live in `src/videos/<id>`), each scene specified well
enough that it can be built: what is on screen, what is computed and how, which numbers appear (with provenance),
the beat it lands, transitions, and how it builds on existing pieces.

## The understanding (read these; they are long and accurate)

All in `SP/understand/`:
- `00-critic.md` — completeness critic: contradictions, 26 number checks, and every report's headline. READ FIRST.
- `00-visual-idea-index.txt` — 216 visual ideas from the readers (titles + one-line insight). READ.
- `r6-range-and-order.md` — the core: why ordered internal coordinates are promising (notes 27, 30; BBA). READ FULLY.
- `g4-number-canon.md` — one definition and value per recurring quantity (κ ladder, windows, αL, σ units, budgets).
  Every number you put on screen must be consistent with it. READ.
- `r1-wdelta-era.md` (Era 1, wδ intrinsic diffusion, Sprints 0–10), `g2-straightening-and-wdelta-arc.md` (what
  Diepeveen's "straightening" really shows; wδ's afterlife as a feature map on BBA; the two walls),
  `g1-origins-and-consistency.md` (the thesis pitch; ScoreMD's iid–simulation dilemma; the blur dial; forces),
  `r2-stiffness-what-we-want.md` (Era 2: the three problems, E1–E4, pairing theorem, note 28),
  `r3-embeddings-pullbacks-aldp5.md` (Era 3: pullbacks, obstruction, springs, invariant embeddings, ALDP5 wins),
  `r4-bba-scaling-learned-maps.md` (Era 4: BBA, learned warps, lag dial, Gaussianization, prediction ≠ generation,
  Sprint 12 first chunk, #1025 diagnosis), `r5-information-geometry-retention.md` (notes 25–26, lag dial,
  retention), `r7-current-frontier.md` (2026-11-14 → 19: registered budget, full schedule, force-field drift and the
  volume-term fix, walls, handedness, PMF floors), `r8-systems-data-eval.md` (ALDP5/BBA, metrics, local data
  inventory), `g3-literature-positioning.md` (literature: "one spectrum, two pulls").
- Existing visuals: `a1-anim-main.md` (Part 0, Part 1, Atlas, engine, style), `a2-anim-pr3-videos.md` (Retention,
  Covariance, Interactions, Bundles on open PR #3), `a3-anim-side-videos.md` (u1-force, information geometry,
  attention, llm-soc: craft and the three-judge review rules).
- Primary sources if you need to check: `SP/rg-main` (ML repo snapshot: docs/theory/*.md notes 00–30, docs/status.md,
  docs/investigations, lab/), `SP/rg-archive/docs` (history), the animation repo at
  /Users/I745505/private/thesis/animation/.claude/worktrees/fiber-bundles-em-video-0ada80 (main) and exports
  `SP/anim-playable-video-prototype`, `SP/anim-information-geometry-video`, `SP/anim-attention-geometry`,
  `SP/anim-claude_fiber-bundles-em-video-0ada80`.

## The story in one page (orientation only — the reports are authoritative)

- **Pitch (June–July 2026).** Fill the empty cell between ScoreMD (flat, Fokker–Planck-consistent diffusion whose
  small-t energy doubles as a force field, but with an iid-vs-simulation dilemma) and Diepeveen's wδ shape
  geometry (features F(X) = ((log r_ij), √δ log det G_X); geometry, but no generator).
- **Era 1 — wδ intrinsic diffusion (Sprints 0–10, July → 2026-10-22).** No closed-form forward kernel: every
  noising step a stiff geodesic ODE solve; many real bugs (tensor transpose, score sign, τ=2, eigh NaN, TF32,
  clock mismatch…); the planar five-bead ALDP backbone sits on wδ's infinite-distance rank barrier (phantom bead
  needed); finite ≠ correct; 340–600× flat cost; the early "win" vanished once the flat baseline's own bug was
  fixed (the moving baseline). Sprint 10 closed: flat Cartesian stays the default.
- **Era 2 — "what do we want from the metric?" (2026-10-23 →, PR #745, notes 20–21).** Stiffness: flat noise
  erases stiff modes first (ALDP5 bonds below the noise floor), score targets badly scaled, the loss misweights;
  a thermal metric G ≈ βH = Σ⁻¹ fixes each problem via separately provable effects; pairing theorem; a constant
  equivariant metric cannot be stiff along a bond and soft across it → configuration-dependent → curved.
- **Era 3 — embed, don't integrate (Sprint 11, ~2026-10-23 → 11-16).** Map φ into a flat feature space; noise is
  closed-form VP there; pullback G = DφᵀDφ; equal-dimension flat maps cannot reproduce a curved metric (note 22:
  error ≥ Kρ²/12; "you cannot flatten an orange peel"); higher-dimensional maps can (springs, wδ are pullbacks).
  Candidates: trajectory springs, quantum-chemistry springs, shared/transferable chemical model, invariant
  embeddings, global whitening, graph metrics, learned warp. ALDP5: bonds/angles learned 10–100× sooner; forces
  pass a Stein check; Brownian dynamics near-MD bonds; one model for both uses (iid and simulation). Not solved:
  torsions, rare αL, transfer; much gain from simple global whitening; flat catches up with long training.
- **Era 4 — BBA and learned maps (~10-24 → 11-14).** Learned warp (coupling flow on 1 ps steps; local condition
  184 → 2.99), lag dial (100 ps warp learns torsions in 100 updates — via Gaussianization, corrected 11-05),
  BBA: bonds great, global structure poor; Sprint 12 first chunk: internal coordinates local-good/global-bad
  (Rg W1 0.52 Å), Cartesian global-good/local-bad, springs/whitening failed outright; #1025: each map failed for a
  measurable reason (springs under the noise floor; whitening's noise leaves the molecule; …); ~30 loss/target
  changes: "prediction is not generation".
- **Era 5 — range and order (2026-11-11 → 14, notes 27/30).** Readability R_h(t); destroyed forward = decided
  backward; Cartesian: order without range; internal/whitened: range without order (internal: anti-order, r^j);
  the γ dial (Rg W1 0.51 → 0.08); internal + 2 loud collective (Rouse-like) modes: range and order; constraint
  split L²/(1+L²); why two; late repulsion; torsion-only equilibration ("global structure is carried by the
  torsions"); skeleton-and-arrows ("a feature is learned accurately when it is a coordinate of its own").
- **Now (11-14 → 11-19).** Registered budget: ordered internal beats native ScoreMD everywhere, bonds 17–120×
  better than Cartesian family, size near Cartesian; full schedule (1.9M updates) holds (Rg W1 0.111; PMF 0.097 vs
  floor 0.080, tied with Cartesian covariance base 0.096); force fields: compaction drift, 3/4 of loud-mode
  compaction was a wrong volume term (0.98 → 0.24 Å), wall missing (excluded volume is a range failure in internal
  coordinates), joint rebuild with hard core: 0% overlaps; handedness detective story; open tests (#1137 whitened
  block, #1136/#1113 drift).

## Throughlines worth building the programme around (proposals, not mandates)

1. **Noise is a clock that erases.** Each feature has a readable window; destroyed going forward = decided going
   backward. The whole project is about *which* clock: what is erased when.
2. **One spectrum, two pulls.** Stiffness removal wants a flat variance spectrum (range); noise order wants a steep
   one (order). The final design flattens the stiff block and keeps two global modes loud.
3. **Charts move information; they do not create it** (KL identity: same area, different profile).
4. **Every chart has a blind spot** at the trained floor: Cartesian loses bonds; internal coordinates lose contacts
   (the wall); wδ sees contacts but not bonds. "The barrier that killed (planarity), the barrier that may save
   (collisions)" — a hypothesis, label it.
5. **The blur dial for forces:** a force read at level t is the force of the blurred density; mode stiffness scales
   by r(t); ScoreMD's iid-vs-simulation dilemma; "one model, two uses"; the consistency diagonal.
6. **Prediction ≠ generation; readable ≠ learnable; a feature is learned when it is a coordinate of its own.**
7. **Honest evolution:** failures are explained, not hidden (the moving baseline; finite ≠ correct; the GPU
   compiler bug; the Gaussianization correction; the wrong volume term). Epistemic labels: the repo marks claims
   [S] cited, [D] derived, [M] measured, [H] hypothesis — consider a visual badge convention.

## House style and constraints (from a1/a3 — read them for details)

- Plain JavaScript, 2D canvas, 1600×900 stage, dark navy ground with dot grid; MathJax formulas via `tex()`;
  Spectral (titles), IBM Plex Sans (body), IBM Plex Mono (eyebrows, readouts). Colour carries meaning: soft
  `#6cc4e8` sky blue, stiff `#ef8a5b` orange, gold `#f2cf63` = object of attention; neutrals ink/body/muted.
- Readouts are computed live, never typed. Progressive builds; slow purposeful camera; scenes 6–40 s; sparse
  on-screen narration (~2 words/s); every element its own fade; holds are deliberate.
- Playable videos: live scenes with controls that move on their own while the narration demonstrates; the viewer can
  take over (engine: src/engine/live.js, controls.js, simulation.js). Explorables are standalone pages.
- 3D: the side videos built their own projection helpers (space.js) — real 3D geometry, authored orbits.
- u1-force review rules: five levers in one arc, one gesture each; hand over once per lever after the narrator
  performed it with a labelled readout; reuse one handle; each readout gets a comparison target; one memorable
  climax image per video; be honest about limits; build the comparison plot early and swap one curve later.
- User feedback (information-geometry video): animate where distributions come from before comparing them; never
  let differing scales fake a difference; explain notation before definitions, tied to the running example;
  derive results visually; give intuition for choices; say what depends on coordinates; never show an unexplained
  curve or label; add more explanation everywhere. The user accepted long videos (32 min) but flagged cuts.
- Thesis pieces go in `src/videos/<id>`; side (non-thesis) videos in `private/other/<id>`. This programme is thesis.
- Existing coverage — build on it, link to it, do not repeat it: Part 0 (shape space, bundles, curvature), Part 1
  (stiffness, three problems of flat diffusion, G = K, "next: the spring metric"), Atlas, and on open PR #3:
  Retention (I_t, retention curves, Fisher vs stiffness, conditional whitening, KL flow identity), Covariance
  (covariance/precision, whitening, curvature, pullbacks of covariance), Interactions, Bundles. Note the
  consistency facts in a1 §4 (Part 1's κ = 400 is illustrative; the repo's own spring network gives ≈ 2,050;
  Part 1 Problem 3 vs "the loss does not see stiff modes" must be reconciled as one wrong ruler seen from both sides).
- Numbers: use g4's canon. Mark illustrative vs derived vs measured vs hypothesis. Never invent numbers; if a
  visual needs a number that does not exist (e.g. the full 27-value BBA spectrum), say it must be computed from data
  (data/deshawresearch-bba-ca28 and data/mdshare exist locally; see r8 §6A).
