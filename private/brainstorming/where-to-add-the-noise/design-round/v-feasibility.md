# v-feasibility · Buildability check of the synthesis "Where to Add the Noise"

Feasibility verifier, 2026-11-19. Object of review: `SP/design/synthesis.md` (P0, E1–E6, X1–X3; rigs R1–R31; assets
A1–A29). I read the synthesis and the brief in full and the earlier judge `j-feasibility.md`. I then checked
the engine on main (`ANIM/src`, HEAD `e1fd6ba`), the PR #3 export (`SP/anim-playable-video-prototype/src`) and the PR #2
branch, and the local data and Python setup under `LOCAL = …/pocs/manifold-scoremd/riemannian-generative`. Everything
there was read-only: nothing was installed or synced, and no file was written except this one. Where a claim could be
settled by computation, I ran short inline numpy checks on the local data. They are listed in §3 and §6 with their
results. SP = the session scratchpad; ANIM = this animation worktree.

## 1. Verdict in brief

- **Buildable with this engine.** No piece needs new rendering technology, a framework or GPU work. All 19 levers fit
  the engine's lever rule (a lever is exactly a control a simulation `uses`) through u1-force's no-op `leverSim`. Every
  live simulation the synthesis specifies runs at well under a frame budget. No scene needs heavy computation in the
  browser once the precomputes below exist.
- **The brief's heavy example is already handled, and cheaper than feared.** The exact Cartesian posterior over all
  1,300,156 BBA training frames (with ±1 µs exclusion) takes **0.01 s per level** in numpy (a float32 GEMV, §6). The
  only constraint is page size, so A17b is right to precompute it. It could even cover all eight A14 molecules. The
  measured ESS, however, contradicts how the scene narrates it (finding F10).
- **Data: everything the programme needs is local**, except the bodies of open ML PRs (#1104, #1137, #1138, #1136, #1113)
  and the optional LISE panels. I reproduced several test targets from the raw files: Rg 10.60 Å and quantiles
  8.37/9.89/15.31, ratio 1,428.25, 37/37/37 αL visits at 3.24/1.65/4.11%, ALDP5 widths within 1.3%. Six asset gaps and
  three recipe ambiguities remain (§5).
- **Two correctness gates do not work as written.** (1) R19's "within 0.01 of `exact-uniform.json`" cannot certify
  "exact". The synthesis's chain values are exact (I re-derived them by brute force), but a subtly wrong automaton that I
  wrote first also passes the gate at all 14 levels. (2) R18's test mixes two unit systems. There are also smaller test
  and recipe slips (§3, §5).
- **Effort is underestimated by about 1.4–1.5×.** The plan implies that each scene after the MVP costs half of what an
  MVP scene costs (rigs, assets and reviews included), and it budgets 8–10 days for P0 plus three explorables. My
  estimate is **≈ 82–104 working-day equivalents** for the full programme (synthesis: 56–67) and **≈ 42–53** for the
  "three things" path (synthesis: ≈ 32). See §8.

---

## 2. What the engine supports (verified in code)

| Programme need | Status | Evidence / what is missing |
|---|---|---|
| Seekable seeded simulations, levers vs lenses, explore mode, hand-overs, beats | **main** | `engine/{simulation,live,controls,player}.js`. `checkControls` fails a lever that no simulation uses, so pure-function scenes need `leverSim` (u1-force `shared.js:61`, PR #2 branch only) |
| `leverSim`, `clock`, `paced`, `track`, `frame/axes/drawPath/drawCurve`, `drawBalance` | **PR #2 branch** | `origin/claude/fiber-bundles-em-video-0ada80:private/other/u1-force/shared.js` (local ref). Copy it from git, not from the SP export |
| 3-D helpers (`camera` with focal, `tube`, `drawTube`, `drawArrow3`) | main `camera.js`; PR #2 `space.js` | A 28-bead chain renderer (`chain3d`: Catmull–Rom tube, painter-sorted beads, mode arrow fields, Kabsch) is **new** but adapts `space.js:tube` |
| Plot kit (`frame`, `decades`, `heatmap`, `readout`, `pill`, `legend`, `stamp`), erf/quantile/Gaussianize, Cholesky | **PR #3** | `retention/{shared,math}.js` |
| `symEig`, `pinv`, `solve`, `cholesky`, `leastSquares` | **PR #3** | `interactions/linalg.js`. Kabsch/Horn (4×4 symEig) and NeRF are new but small |
| `codeBlock`, `connector`, `panel`, `chip` | **main** | `private/other/llm-soc/shared.js` |
| Narration in `window.video.scenes`, JPEG frames | **PR #3 only** | `src/app.js` differs from main only there. `main.js` lazy loading is also PR #3 only |
| `export-narrated.mjs`, `review-frames.mjs` | **PR #3 branch** | Present in `origin/playable-video-prototype` (local ref), absent from the SP export. `export-narrated.mjs` hard-codes `title=Covariance — The geometry of fluctuations` in the chapter metadata: fix it on cherry-pick |
| JSON assets in a self-contained page | **main** | esbuild JSON loader on the stdin entry. The IIFE format means no code splitting and **no top-level await**, so "lazy-load" can only mean lazy base64 decode: the bytes are always in the page |
| Bundled explorables, `explorable(scene)` wrapper, deep links `?t=` | **absent** | `build.mjs` copies `explorables/*.html` verbatim. `main.js` reads only `?video=`. `Player.explore()` exists, so the boot flag is small |
| Probe pages (`--only scenes`) for the MVP review loop | **absent on main** | Only u1-force's private `build.mjs` has it |
| Rig tests in `tests/thesis/*.test.mjs` | **not picked up** | `package.json` runs `node --test 'tests/*.test.mjs'`, which does not recurse. Change the glob to `tests/**/*.test.mjs` |
| "Parts 0/1 byte-identical" gate | **no tool** | The smoke test does not compare against reference frames. Add a small golden-hash script (render N frames before and after promotion) |
| Animated lens transitions (mirror mode "1.2 s") while paused | **not supported** | Draws are functions of scene time, and `performance.now` is banned under `src/videos`. Add an engine-side "lens age" in `LiveView`, or author mirror mode as a keyframed beat. In explorables a lever-driven simulation can animate it |
| Fonts, MathJax | main, from CDN | Offline fallback exists. Formulas must be declared at module level (`tex.js`) |
| Determinism guard | main, strict | Jumped, jumped-back and played frames must be identical; levers are rendered at their extremes; no clock or `Math.random` under `src/videos`. Every rig must therefore be seeded and Float32/Float64-stable. It is: V8 in Node and in Chrome uses the same `Math` |

Installed toolchain: Node 24.11.1, esbuild 0.28.2, Playwright 1.64.1. JSON import attributes work in Node, esbuild and the
dev server, which serves `.json` as `application/json`.

---

## 3. Computed objects (rigs): buildability and test gates

Every rig R1–R31 is closed form, a small dense linear-algebra problem or a seeded simulation of at most a few thousand
walkers, so all are buildable in DOM-free JS. I recomputed the expected values of R1, R2, R12, R13 and R27 by hand
and they are consistent (for example σ(0.01) = 0.044643, t½(0.003) = 0.01304, c = √(15/1415) = 0.102960,
𝒦_tan = (1−c²)/R² = 0.029316, torsion blur 1.702°/6.632°/12.956°). The exceptions follow.

### 3.1 R19 (exact chain readability): the acceptance gate cannot tell exact from wrong · HIGH

I implemented the orientation transfer matrices and an O(N⁴) brute-force sum over pairs of bond intervals with
`E[M⊗M] = a⊗a + (r/2)(b⊗b + c⊗c)` and Rice-quadrature r(t) (κ = √2, 110°). The brute-force result is the exact value
for independent uniform torsions. I compared it with `runs/range-order-mechanisms-20261118b/exact-uniform.json`, a
20,000-query Monte Carlo:

| t | end-to-end², exact | JSON MC | gap | Rg², exact | JSON MC |
|---|---|---|---|---|---|
| 0.035 | 0.9540 | 0.9611 | −0.0071 | 0.9760 | 0.9785 |
| 0.05 | 0.9138 | 0.9224 | −0.0086 | 0.9544 | 0.9574 |
| 0.075 | 0.8237 | 0.8329 | **−0.0092** | 0.9036 | 0.9067 |
| 0.1 | 0.7111 | 0.7190 | −0.0079 | 0.8346 | 0.8371 |
| 0.2 | 0.2530 | 0.2527 | +0.0003 | 0.4385 | 0.4361 |
| 0.26 | 0.1251 | 0.1243 | +0.0008 | 0.2551 | 0.2532 |

- The synthesis's E5.5 numbers are the **exact** values: end-to-end² 0.711/0.253/0.125, Rg² 0.835/0.439/0.255, and
  b·b(+4/+12/+26) and torsion r equal to the transfer-matrix result. Orientation gaps to the MC are ≤ 0.0069 and the
  torsion gap ≤ 0.0004.
- The 0.01 gate passes with a margin of 0.0008. My own 200,000-query Monte Carlo gives 0.7149 / 0.4603 / 0.2555 / 0.1265
  at t = 0.1/0.15/0.2/0.26 (SE ≈ 0.002), so the JSON values sit inside their noise.
- **The gate does not detect a wrong implementation.** My first two-copy automaton had a subtle state-machine error. It
  gave 0.720/0.468/0.262/0.131, and it still passed "within 0.01 of the JSON" at all 14 levels (worst gap 0.0096).

**Fix:**
1. Write a numpy brute-force fixture once (≈ 20 s per level), or port the O(N⁴) oracle into the Node test (a few
   seconds per level in JS).
2. Gate the JS automaton against that oracle to 1e-9.
3. Keep the JSON comparison only as a sanity check at ≤ 0.015, or at 3 SE.
4. Ship the automaton, not the brute force, in the browser: the oracle is too slow for per-frame use.

### 3.2 R18 test mixes two unit systems · MEDIUM (it breaks the build, but the fix is trivial)

"t½ 0.523/0.0284" combines two scales:
- In library units (c₀²·λ, Σ = 27), the first and last modes give **0.5231 / 0.0278**.
- In the Sprint 12 Cartesian channel (λ/6.252²), they give **0.5263 / 0.0284**.

Whichever scale the rig uses, one half of the test fails. Pick library units, the rest of R18 (15.031 … 0.0105) uses
them, and test 0.5231/0.0278. Print the unit beside every t½ that comes from a mode spectrum.

### 3.3 R29 (torsion Monte Carlo under three bases) · MEDIUM

I reconstructed the chain in numpy (NeRF, 27 bonds, 26 angles, 25 torsions) and ran it:
- **Free torsions:** 10.72 ± 2.34 Å with `chain_spec.json` means (log tan(θ/2)); 10.58 ± 2.32 with per-position data
  means; 10.63 with scalar means; 10.51 with the angle taken from the mean cosine. #1025's 10.34 ± 2.26 is within ±0.3
  only for some of these conventions.
- **Isotropic Gaussian base at s = 6.252 Å:** 5.50 ± 0.51 Å (256 chains × 1,200 sweeps, acceptance 0.50, 31 s in numpy),
  close to #1025's 5.41.

So the "±0.3 at 20k sweeps" gate is convention-sensitive. #1025's note
(`docs/investigations/bba-local-geometry-preconditioning.md`) gives the table but not the chain construction.

**Fix:** recover the construction from #1025's code before narrating, or badge the programme's own values as
[D·model] beside the logged 10.34/5.41/10.71. Compute the equilibrium statistics offline, and let the live chains only
animate, so that readouts never show a wandering running mean.

### 3.4 Other rig notes · LOW

- **R25:** the C3/ordered port is straightforward. `chain_spec.json` holds mean[53], a lower Cholesky factor, phase
  scale 1.50444 and an identity bead order. Collective modes are 27×27 in bond space, so w_p = HᵀV_p must be built in JS
  (it is not in the file). The **Wiener mean** needs per-chart feature means and covariances, which no asset provides
  (F-asset gap).
- **R23** (LM, cold start, 40 iterations) is cheap for the 8-bead toy. All BBA rebuilds are logged.
- **X2 calibration lamps:** "each rig re-runs its §5 tests on load" is too heavy for R29 (≈ 10–30 s), the R19 oracle and
  R12's Nelder–Mead check. Define a lamp subset of under 50 ms per rig, and keep the full suites in Node.

---

## 4. New components needed

**Engine (phase 0).**
- Promote u1-force `leverSim/clock/paced/track`. Resolve name clashes into one module: `panel`, `frame`, `axes`,
  `drawPath`, `pill` and `readout` exist with different signatures in the u1-force, retention, llm-soc and covariance
  kits.
- Bundled explorables plus an `explorable(scene, {prompt, challenges})` boot path; `?t=` deep links; `--only` probe
  pages; the test glob; a golden-frame script for Parts 0/1.
- Optionally an engine "lens age" for animated lens transitions, and a lever tick on the DOM sliders. The latter needs a
  `player.js` change; it does not touch canvas frames.
- A speech formatter for cues: `say` will not read "×10³", the true minus or "≈", so cue templates built from `ev()`
  need spoken forms.

**Draw (`src/draw/thesis/`):**
- palette, rail (R31), glyphs (moon fill, outline-as-estimator);
- badges and status overlays, provenance strip, budget chip, seed dumbbell and effect gauge, the "≠" glyph, count dial,
  budget clock, κ chips, rig stamp;
- Journey Map with swimlane, question surgery, Musts, odometer, correction pill, two-halves plane, noise ruler;
- Fog Bench (ghosts, best linear guess, fog, crystallization), `chain3d`;
- cone, sphere and peel meshes (via `space.js`); histogram, stacked bar, sparkline, log–log axes; seesaw
  (`drawBalance`).

**Model (`src/model/thesis/`):** R1–R30, plus Kabsch, NeRF, a base64 typed-array codec, `ev()` and the ledger loader.

**Scripts (`scripts/data/*.py`):**
- about 29 asset scripts with provenance headers;
- a fixture generator that runs the library once (§5.1);
- a TICA projection;
- the DCD reader (copy it now from `SP/g2/checks`);
- wδ LM decodes;
- the posterior precompute;
- an archive of PR bodies (§5.3).

**Tooling:**
- static cue-numeral check;
- an instrumented `text()`/`tex()` test build (an esbuild alias plugin), feasible in about 1.5 days;
- lints "by construction" (§7 F17).

---

## 5. Data extraction feasibility (local, read-only)

### 5.1 Python environment

- **System `python3 -I`** (pyenv 3.11.14) has numpy 2.4.0, scipy 1.16.3, pyarrow 23.0.1 and pandas 2.3.3. It can run every
  plain-numpy asset script and read the leaderboard parquet. h5py is absent but not needed: the BBA data are `.npy`.
- **ML `.venv`** (3.11.14, uv 0.9.17, synced around 10-30) has jax 0.10.0, flax 0.10.4, numpy 2.4.6, scipy 1.17.1 and
  pyarrow 24. At `c099347a` the dependencies add only scipy (already installed) and an optional openmm extra, so it can
  run the library for fixtures.
- **Trap:** its editable `.pth` puts `LOCAL/src` on `sys.path`. That checkout is on branch `supervisor-metric-comparison`
  (`0e65678c`) with uncommitted changes, so `import riemanniangenerativemd` resolves to the wrong code. `-I` does not stop
  `.pth` processing.
- **Pin:** `c099347a` and `2d9711e8` both exist locally. Between them only `geometry/mode_handedness.py` was added, so
  fixtures at `c099347a` will match the range-order run's JSON.
- **Do not `git worktree add`:** it writes to `LOCAL/.git`. Use `git -C LOCAL archive c099347a | tar -x -C ANIM/.cache/rg-c099347a`,
  prepend that `src` to `sys.path` in the fixture script, and assert `riemanniangenerativemd.__file__`.

### 5.2 Assets

| Asset | Source present? | Feasibility / caveat |
|---|---|---|
| A1 ALDP5 modes | ✓ mdshare `arr_1`; `mode_std_A` in `force-field-simulation/evidence.json` @c099347a | **Recipe must say "evenly spaced":** the first 20k frames give widths up to 26% off; every 12th frame (20.8k) is within 1.3% of `mode_std_A` (checked) |
| A2 | ✓ bgmol `aldp.npy` (1,000,000×22×3) | trivial |
| A3 | ✓ mdshare traj 0 | trivial (60k pairs) |
| A4 | ✓ `aldp5_train.npy` (800k×5×3), `aldp5v_train.npy` (800k×6×3) | Batched 9×9 eigvalsh over **all** 800k frames takes seconds, so the logged worst condition can be reproduced instead of a strided subset |
| A5 | ✓ 5 arms × 66 files, `clouds (20000,5,3)` + `decoded` | trivial. Size ≈ 180 kB base64, not 160 |
| A6, A9, A19, A23 | ✓ docs and lab @c099347a | transcription |
| A7 | ✓ `sim-beta/*_trace.npz` | trivial |
| A8 | ✓ mdshare | **Pin the dihedral sign with a test:** with atoms [1,3,4,6,8] and the IUPAC sign I get 37/37/37 visits, 3.24/1.65/4.11% and 219/111/278 ps exactly. The flipped sign gives "96.8%" |
| A10 AK | ✓ DCD/PSF in `…/manifold-scoremd/diepeveen2024/data/molecular_dynamics/4ake/` (outside LOCAL) | **Gap:** E1.8's middle row (wδ separation interpolation) has no local coordinates; `diepeveen2024/experiments/results/4ake` holds only PNGs. Compute it (Gauss–Newton, 642 unknowns, 22,791 log-distance residuals, 3 frames, minutes) and check it against mean RMSD 2.053 Å, or drop that row (bars only) |
| A11 | ✓ `collective_modes.json` (Å², Σ 1,094.49; ratio **1,428.25**) | `c0` and `rouse` live in `bba_charts.json`; build w[27][28] in JS |
| A12 | ✓ `bba_charts.json` | The constraint shares are stored as **block** shares. E5.7's 74/87/96% are 1 − x, so the test and label must invert them |
| A13 | ✓ `chain_spec.json` | ✓ |
| A14 | ✓ `heldout.npy` (325,039×28×3, float32, centred, Kabsch to the first training cloud) | Add per-molecule ellipsoids for X1 (precomputed offline), and per-chart feature means and covariances for the Wiener mean (≈ 30–45 kB each) |
| A15 | ✓ train, heldout, membership (global indices; trajectory boundary 1,114,545) | Compact (< 9 Å) → extended (> 13 Å) → compact excursions are frequent: 1,276 + 560, median ≈ 255 frames ≈ 51 ns. A contiguous 600-frame window works without a stride. **TIC:** `bba_tica.pic` is not local. Use `configs/benchmarks/bba-ca28-tica.json` @c099347a (378 Cα distances in nm + 25 pseudo-torsions, `(f − mean) @ coef`, source sha matches) with a parity check |
| A16 | ✓ | Full pass in 1 s: mean 10.60 Å, q5/50/95 8.37/9.89/15.31 (checked). **"Folded share 0.194" needs its definition** (Rg < 8.5 Å gives 0.078) |
| A17 | ✓ | wδ LM decodes from MDS are feasible offline. **Add 12 wδ forward-ghost decodes at t = 0.01 for E6.7** (A17 has one decode per level). **Simplify:** drop stored `paths` and `ε`. VP forward paths are exact OU transitions, so JS can generate them from the 109 clean features with the seeded RNG at any resolution. That saves ≈ 150 kB and avoids interpolating between stored steps |
| A17b | ✓ | 0.01 s per level per query (§6). Could cover all 8 molecules (8 × 6 levels × 12 ghosts ≈ 100 kB raw). Optional A17c: measured Cartesian R_h(t) curves from Q = 256–1,000 queries in about 2 min with GEMM |
| A18 | ✓ `signal-*.json`, `exact-uniform.json` | Values confirmed: KL 0.0766, info 0.0779/0.0784, block share 0.878/0.476/0.914, R_rg² at 0.26 0.183/0.838 |
| A20 | ✓ data; script is `SP/g2/checks/wdelta_windows_v2.py` (**ephemeral**) | Copy it into the repo now. It uses 379 features (with √δ log det) while A17 says 378. Use one definition, the study's, for both |
| A21 | ✓ `geometry/immersion_volume.py` @c099347a | A numpy port with finite differences and 81×81 slogdet is fine. **Use ≥ 20k frames** (cheap) for the reweighted-mean-Rg test: importance weights from Δlog vol over 2,000 frames are noisy against a [9.5, 9.7] window |
| A22 | ✓ parquet (11,886 runs, 1,265,002 metric rows; readable with system pyarrow) | **Curation is the cost:** the storyboards hold about 720 distinct numerals, roughly 400–500 of them logged, each needing 15 fields and two passes. This is not explicitly budgeted (§8) |
| A24, A26–A28 | partly | Merged lab results are local @c099347a. **Open PRs (#1104, #1137, #1138, #1136, #1113) are not local**, except branches such as `origin/scoremd-paper-readout`. The PR-number → branch mapping and the PR bodies need `gh` once. Archive them under `scripts/data/sources/` with a fetch date. SP copies (`prs_lib2.txt`) are ephemeral and incomplete |
| A29 | ✓ `bba-reverse-completion-20261118/` | read #1119's note first (as planned) |
| A-REQ-1 | ✗ (LISE) | optional, correctly off the critical path |
| E3.8 warp (no asset) | ✓ `runs/learned-stiffness-warp-2026-10-24/attempt-*/aldp5_s*_warp.npz` | **Gap:** the morph of 1 ps steps and the "top-4 magnified directions" need one library run (`load_warp`) in the pinned snapshot, writing about 4×15 floats plus step covariances. Otherwise badge the ellipses [I] with the logged κ_step numbers |

**Must not be used:**
- `data/deshawresearch/bba-*.h5` (14 and 5.7 MB) and `data/processed/bba_*.npy`: the struck 07-27 placement, identical to
  ScoreMD's dummy.
- `data/deshawresearch/chignolin*`.

Add a guard to the asset scripts that checks `train_sha256` and `heldout_sha256` from `data.json`.

---

## 6. Heavy scenes and the precompute or simplification for each

| Scene | Load as specified | Verdict and proposal |
|---|---|---|
| E5.1 / X1 exact posterior over 1.3M frames | Measured: GEMV over 1,300,156×84 float32 takes 0.01 s per level; 8,049 frames fall inside ±1 µs of held-out frame 0 | Never in the browser (437 MB), and A17b already precomputes it. **The narration is the problem:** ESS for that molecule is **1.8 / 5.4 / 44 / 1,145 at t = 0.05 / 0.1 / 0.2 / 0.3**, so "ESS ≈ 700" holds only near t ≈ 0.25–0.3, and ghosts at t ≤ 0.1 are 2–5 frames. Show ghosts only at t ≥ 0.2, print each level's own ESS, and quote n27's ≈ 700 with its level |
| E5.2, E6.7 Fog Bench, E5.11 bridge ensemble, P0.1 | ms per frame (NeRF + Kabsch + 12 ghosts × 4 charts) | Fine. wδ decodes stay precomputed (A17 + 12 ghosts). Generate the paths in JS (§5) |
| E4.4 live torsion Monte Carlo | ≈ 0.1–0.4 Mflop per sweep for 3 chains; 20k-sweep Node test ≈ 10–30 s | Fine to animate. Compute the readouts offline (§3.3) |
| E5.5 / E5.6 chain rigs | automaton ≈ ms; chart-B importance sampler with 4,000 draws ≈ 2–5 ms | Fine with the **automaton**. The O(N⁴) oracle is test-only |
| E2.7 walkers (500 × 9, Float32) | 3.2 MB of snapshots per scene | Fine (the synthesis's own budget) |
| X1 chart builder (n_v, L sliders) | First-order loudness needs G⁺ (84×84) per frame over ~1,200 frames per slider move, ≈ 1 Gflop, which is seconds | **Too heavy live.** Precompute a grid with `bba_charts.py` in the pinned library (22 s for 6 charts, so ≈ 3 min for a 42-point grid of n_v ∈ {0,1,2,4,8,16,27} × L) and snap the sliders. The (γ, v) pad stays closed form |
| X1 ellipsoids s²(JᵀJ)⁺ for 72 molecules × 3 charts | ≈ 1.3 Gflop of Jacobi at load | Precompute offline: per-bead 3×3 blocks ≈ 36k floats ≈ 100 kB |
| X1 posterior ghosts for 64 frames | Only one molecule exists in A17b | Restrict to the A17b molecules, or extend A17b to the 8 A14 molecules |
| E1.8 AK wδ row | 214-Cα separation objective | Offline (minutes) or drop (§5) |
| E6.4 BBA reweighting | needs Δlog vol per frame (a 109×81 Jacobian) | Precompute (A21) with ≥ 20k frames and ship histograms |
| X2 lamps | full suites take seconds to minutes | Lamp subset (§3.4) |
| Narrated export | ≈ 98k frames at 24 fps for 68 min | Fine (about 1–2 h of rendering), and only after PR #3's `app.js` |

---

## 7. Findings (also returned in the structured result)

F1 (high) R19 gate. F2 (high) effort. F3 (medium) the MVP needs A14 and a chain view. F4 (medium) X1 precomputes.
F5 (medium) library parity path. F6 (medium) R29 convention. F7 (medium) asset gaps: AK wδ row, Wiener covariances, warp
asset, wδ ghosts, TICA source, "folded" definition. F8 (medium) open-PR sources. F9 (low–medium) ephemeral SP
dependencies. F10 (medium) ESS narration. F11 (medium) R18 units. F12 (low–medium) A1 selection. F13 (low) A8 sign.
F14 (low) animated lenses. F15 (low) hand-overs without a control: E5.3 asks the viewer to find a noise level but offers
only a `chart` lens; E1.1 asks for a ψ swing but offers only the `ruler` lever. Either add a `t` probe (a lever, since the
narration reads it) and a ψ-swing drag, or reword. E5.5's `t` is a lens while its narration states values at t =
0.1/0.2/0.26, contrary to §3.9; a viewer-set lens persists to the scene's end. F16 (low) engine chores: test glob, IIFE
without top-level await, the export title, `--only`. F17 (low–medium) the three fidelity lints ("budget chip on every
trained number", "ties drawn as ties", "predicted only with a declared record") cannot be read off canvas output. Make
them true by construction: `ev()` metadata drives `evText()`, which draws the chip and the tie glyph itself and refuses
"predicted" without `declared_before`. Back that with schema tests and the evidence judge's checklist. F18 (low) A17
simplification and A4 over all frames. F19 (low) wδ 378 vs 379 features. F20 (low) A12 shares inverted. F21 (low) TTS
formatter.

---

## 8. Effort: are the estimates realistic?

**The plan's own rates are inconsistent.**
- The MVP builds 5 scenes in 6–7 days, about **1.2–1.4 days per scene**, with phase 0/1 machinery already in place.
- Phases 3–6 build 60 scenes (E1 10, E2 9, E3 11, E4 9, E5 10, E6 11) in 33–39 days, about **0.55–0.65 days per scene**.
- That second rate has to absorb roughly 20 rigs, about 25 assets, the riskiest ports (R25 parity, `chain3d`, wδ decodes,
  the R19 automaton, A21) and the per-episode reviews.

A 2–2.5× speed-up after the MVP is optimistic. The existing comparables also show review lag: u1-force (12 scenes,
13:53) is not fully reviewed, and information geometry has scenes 06–14 unreviewed.

| Phase | Synthesis (days) | Mine | Why the difference |
|---|---|---|---|
| 0 Groundwork | 4–5 | 5–6 | name clashes across four helper kits, golden-frame tool, explorable wrapper + challenges + deep links + smoke extension, export fix, probe build |
| 1 Rigs, rail, ledger | 5–6 | 7–9 | 11 rigs + tests, 9+ draw modules, `ev()` / cue check / instrumented `text()`, fixtures from an archive snapshot, lints by construction |
| Ledger curation (not budgeted) | — | 4–6 | ≈ 400–500 logged values × 15 fields, two passes, open-PR bodies |
| 2 MVP | 6–7 | 7–9 | + A14 and a static chain view for E5.6; A19 curation; four-judge review and fixes |
| 3 Real-molecule layer, E5, E4 | 11–13 | 16–20 | R25 parity, `chain3d`, Fog Bench, R19 + oracle, halos, A13–A18/A17b, 10 E5 + 9 E4 scenes, R28/R29 + #1025 construction, TICA parity |
| 4 E6 | 6–7 | 8–10 | 11 scenes, A20/A21 parity, A22 results, A24/A26/A27 via `gh`, R22–R24 |
| 5 E2 rest, E3 | 10–12 | 13–16 | 19 scenes, R3/R4/R11–R16, cone/peel in 3-D, A5/A6/A8/A9 + warp asset, SGD simulation |
| 6 E1 | 6–7 | 8–10 | 10 scenes, R5–R10, A2–A4, A10 (+ AK wδ row or cut), A23 |
| 7 P0, explorables, exports | 8–10 | 14–18 | P0 2; X1 5–6 (grids, Fog Bench pane, challenges); X2 4–5 (lamps, drawer, walkers, force reader); X3 3–4 (DOM page, not canvas); exports + README 1–2 |
| **Total** | **56–67** | **≈ 82–104** | about 1.4–1.5× |

**The "three things" path** (phases 0–2, E5, E2, X1):
- phases 0–2 with a ledger subset: 19–24 days;
- the rest of E5 with the real-molecule layer: 12–15;
- the rest of E2: 6–7;
- X1: 5–6.

That totals **≈ 42–53 days**, against the synthesis's ≈ 32.

**Recommendations:**
- Record days per finished, reviewed scene during the MVP and re-plan from that rate.
- Treat X2/X3 and E1 as the first deferrals, and keep the committee path (P0 → E5 → E6) protected.
- Apply the §10 cuts early: −4 days at most.

---

## 9. What I checked (for reproducibility)

- **Engine.** I read `src/engine/*`, `src/app.js`, `src/main.js`, `scripts/{build,smoke-test,serve}.mjs`, `package.json`
  and `src/draw/{tex,moleculeView}.js`, `src/model/camera.js`. I diffed the PR #3 export's engine and draw files against
  main: only `app.js` and `main.js` differ. I listed the exports of the u1-force (PR #2 branch), retention, interactions
  and covariance helpers, and the scripts on `origin/playable-video-prototype`.
- **Data.** I listed and read the headers of `data/*`, `data.json`, `membership.npz`, the range-order run directory and
  its MANIFEST, the race samples, the sim-beta traces, the warps, the TICA constants, the leaderboard parquet schemas,
  the `.venv` packages and `.pth` file, and the git refs and diffs between `2d9711e8` and `c099347a`.
- **Computations** (all inline, nothing saved):
  - R19 exact vs MC, plus a 200k-query MC and the buggy-automaton counter-example;
  - R18 t½ in both unit systems;
  - an R29 reconstruction;
  - A1 widths in two selections;
  - A8 visits and dwell times;
  - A16 Rg statistics;
  - A15 excursion lengths;
  - A17b posterior timing and ESS.
