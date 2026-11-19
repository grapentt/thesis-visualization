# a1-anim-main · The thesis pieces on `main`: what exists, how it looks, how it is built, and where new pieces can attach

Scope: the `main` working tree at `e1fd6ba` (2026-10-27) in
`/Users/I745505/private/thesis/animation/.claude/worktrees/fiber-bundles-em-video-0ada80`:
`src/videos/{part-0,part-1,atlas,common}`, `explorables/torus-flow.html`, `src/engine`, `src/draw`,
`src/model`, `src/kit.js`, `src/main.js`, `src/app.js`, `scripts/`, `tests/`, `docs/interactive-video.md`,
`README.md`, `styles/player.css`, `index.html`. Nothing in the repo was modified. To check the look, Part 0,
Part 1 and atlas were bundled and a few frames rendered into the scratchpad (`scratchpad/a1-render/`).
A few numbers marked *(computed for this report)* come from importing the DOM-free model modules in Node.

---

## 1. Inventory

| Piece | id | Scenes | Length | Kind |
|---|---|---|---|---|
| Part 0 · The geometry of shape space 1 | `part-0` | 18 | 477 s (7:57) | narrated video |
| Part 1 · Diffusion in the right geometry | `part-1` | 16 | 290 s (4:50) | narrated video |
| Atlas · Why one chart is not enough | `atlas` | 2 | 81 s (1:21) | playable-video prototype, one 74 s live scene |
| Torus flow, flattened | `explorables/torus-flow.html` | n/a | n/a | standalone explorable page (three.js, theme-aware) |

Also on `main` but outside this scope: `private/other/llm-soc` (a side video on LLMs in security work). Its
`shared.js` has generic diagram helpers (`panel`, `node`, `chip`, `connector`, `packet`, `codeBlock`, `meter`,
`badge`, `icon`) that the thesis kit lacks.

Eyebrow numbers are *section* numbers, not scene numbers: Part 1's two data scenes share "07", and "Problem 1"
is section "09".

### Part 1 · Diffusion in the right geometry (`src/videos/part-1`, posterTime 2.6 s)

| # | Scene (start, length) | What is shown · key computed objects |
|---|---|---|
| 00 | Title (0:00, 6 s) | The 5-atom molecule slowly yawing on the right. "MASTER'S THESIS · PART 1", "Diffusion in the / *right geometry*" (gold italic), subtitle "Why flat Brownian noise struggles with stiff molecules, and how a Riemannian metric fixes it." |
| 01 | Molecule (0:06, 11 s) · *01 · THE OBJECT* | Atoms fade in one by one, bonds draw, spheres grow (per-atom `atomAlpha`, per-bond `bondProgress`, `atomScale` staggered); camera yaw settles from 1.3 to 0.5 over the scene. "N = 5 atoms · each one is a point in 3D space". |
| 02 | Atom 1 (0:17, 17 s, continues) · *02 · ONE ATOM, THREE NUMBERS* | Molecule slides left, other atoms dim to 18%; axis triad on atom 1; the atom wiggles along x, y, z in turn (`oscillate`) with a gold arrow on the active axis, and the live column vector r₁ highlights the row that changes. Then a general motion δr₁ = (0.34, 0.26, −0.34) Å built from three dashed axis components; second column δr₁. |
| 03 | Every atom (0:34, 14 s, continues) · *03 · EVERY ATOM* | Focus hands over atom 2 → 3 → 4 and 5; triads and wiggles; five live column vectors r₁…r₅ at `COLUMN_SLOTS`; "5 atoms × 3 coordinates = 15 numbers". |
| 04 | Configuration space (0:48, 17 s, continues) · *04 · CONFIGURATION SPACE* | The five 3-vectors fly row by row into one 15-vector (`drawStackedConfiguration` in `common/configuration.js`, also used by Part 0), molecule shrinks to the corner. A 3D sketch of "3 of the 15 axes" (x₁, y₃, z₅) with the configuration as a point x (dashed drop lines) and the molecule moving along `randomDirection` drawn as a gold vector v. "One configuration of 5 atoms = one point x ∈ ℝ¹⁵", "One motion of all atoms = one direction v ∈ ℝ¹⁵". |
| 05 | Stiffness (1:05, 25 s) · *05 · STIFFNESS* | Soft mode: H5 twists about bond 2–3 by ±1 Å (arrows `v_soft`); stiff mode: bond 1–2 stretches ±0.05 Å with a glowing bond (`v_stiff`). Two `energyPlot`s E = ½ks² with a dashed k_BT (300 K) line: soft "k = 0.05 eV/Å², ±1.02 Å per kT"; stiff "k = 20 eV/Å², ±0.05 Å per kT", x-axis zoomed ×20 with `lerpLog`. Card *THE STIFFNESS PROBLEM · Every direction has its own ruler* (curvatures differ 400-fold). |
| 06 | Forward noise (1:30, 13 s) · *06 · DIFFUSION* | Thermal vibration (`vibration(j,t)`), then from 3.2 s Brownian noise on all 15 coordinates (`brownian(j,t)`, `BROWNIAN_D = 0.0104 Å²/s`) with the clean x₀ as a grey ghost. TeX `dx_t = g(t) dW_t`, `x_t | x_0 ~ N(x_0, σ_t² I₁₅)`; a gold "noise ball" growing with live σₜ = √(D t) (to ≈ 0.32 Å); "A stiff bond and a soft torsion receive exactly the same kick." |
| 07 | Data · soft (1:43, 15 s) · *07 · THE DATA* | Six samples stepped one by one (molecule shows each, gold ring on its strip dot, dashed thread from the dot to H5, "s = +0.45 Å"), then 394 more pour in at an accelerating rate with ghost outlines of the last 36; a Gaussian curve, "2σ_soft ≈ 1.44 Å", "Wide spread: σ_soft ≈ 0.72 Å". |
| 08 | Data · stiff (1:58, 18 s, continues) | The strip lifts into an (s, q) scatter on the same Å ruler; four samples stepped with "q = +0.040 Å" and a live "bond 1–2: 1.48x Å"; a thin sliver; the vertical axis zooms ×20 and back: "Stretched ×20 it has the same shape: σ_stiff ≈ 0.036 Å." |
| 09 | Conditioning (2:16, 15 s, continues) · *08 · CONDITIONING* | Scatter with 1σ/2σ ellipses and unit eigen-directions e_soft, e_stiff; TeX `Σ = Cov[x]`, `K = ∇²E(x₀) ≈ k_BT Σ⁻¹` (harmonic approximation), `K eᵢ = λᵢ eᵢ`, `λ_soft = 0.05, λ_stiff = 20 eV/Å²`, `κ(K) = 20/0.05 = 400`; both eigenvalues on a log axis 10⁻²…10² with a "× 400" bracket; "κ is taken over the internal modes." |
| 10 | Problem 1 (2:31, 25 s) · *09 · PROBLEM 1* | Three synchronized views of one noise level σₜ (schedule 0.001 → 0.1 Å over 2–8 s, hold to 11 s, → 1.5 Å by 16 s): the dataset with isotropic noise `σₜ·(e1, e2)`; *information left* σᵢ²/(σᵢ²+σₜ²) against log σₜ for soft and stiff with a moving cursor and % readouts and a gold "×20 in noise level" gap arrow; bars of σₜ/σᵢ. Caption at the hold: stiff "buried (278% of its spread)", soft "14%". Card *Information is destroyed unevenly* (stiff modes erased at a ~20× smaller noise level, "no single noise schedule suits both"). |
| 11 | The score (2:56, 22 s) · *10 · THE SCORE* | Pre-rendered `densityHeatmap` of a 3-component 2D Gaussian mixture with level lines; at (0.6, 0.9) the partials ∂log p/∂x = −0.29, ∂log p/∂y = −1.47; TeX ∇ₓ log p as a row; the pairing ⟨∇log p, v⟩; the covector drawn as a stack of gold parallel lines one unit of log p apart, and a direction v sweeping round with a live ⟨∇log p, v⟩. |
| 12 | Problem 2 (3:18, 21 s) · *11 · PROBLEM 2* | Two `logDensityPlot`s, stiff x-axis zoomed ×20: same shape. Slopes at 1σ: −1.39 Å⁻¹ vs −27.8 Å⁻¹; a 5% step gives Δlog p = −0.35 in both. Bars of \|∂ log p\| at 1σ: 1.39 vs 27.8, "×20 (and κ = 400 in curvature)". Card: score components scale like 1/σᵢ, the gap grows like √κ. |
| 13 | Problem 3 (3:39, 38 s) · *12 · PROBLEM 3* | Target score row [−1/σ_soft, −1/σ_stiff]; predictions A and B each 5% off in one entry (δ = (0.07, 0) and (0, 1.39)). Flat loss bars 0.0048 vs 1.9305, "B costs ×400 more". The flat loss flies up; the Riemannian loss is assembled from parts: ∇_G log p blurs out and G⁻¹∇log p blurs in; an under-brace "Euclidean gradient (covector) · Jacobian −K/k_BT · κ = 400" and an over-brace "Riemannian score (vector), with G = K · Jacobian −I/k_BT · κ = 1"; expansion 𝔼⟨δ, Gδ⟩₂ = 𝔼 δᵀGδ; δᵀ, G, δ fly down into an explicit row [δ₁ … δ₁₅], a 15×15 [G] and a column. Bars morph to 0.097 and 0.097: "equal relative errors, equal cost". Card *The loss must respect the geometry*. |
| 14 | One fix: G = K (4:17, 19 s) · *13 · ONE FIX FOR ALL THREE* | Three-row table, flat vs Riemannian: noise `dx = g dW` → `dx = g G^{−1/2} dW` (noise covariance G⁻¹ ∝ Σ, all modes lose information at the same rate); score ∇log p (covector, κ = 400) → G⁻¹∇log p (vector, κ = 1); loss ‖·‖₂² → ‖·‖²_G = δᵀGδ. Gold box "What this requires: G = K ⇔ G⁻¹ = K⁻¹ ∝ Σ". |
| 15 | Next video (4:36, 14 s) | Bonds morph into zigzag springs (`drawMolecule(..., { spring })`), "bonds as springs"; "NEXT VIDEO · The spring metric: treat every bond as a spring and build the metric from the spring constants. It satisfies G ≈ K approximately"; "Behind this clip: rigorous proofs of all three problems"; "Next: why the spring metric works." |

### Part 0 · The geometry of shape space 1 (`src/videos/part-0`, posterTime 3 s)

| # | Scene (start, length) | What is shown · key computed objects |
|---|---|---|
| 00 | Title (0:00, 7 s) | Energy-coloured torus (`drawSurface` + `energyColor(torusEnergy)`), "The geometry of / *shape space 1*". |
| 01 | Overview (0:07, 16 s) | Six numbered roadmap items next to a faint torus. |
| 02 | Configuration (0:23, 22 s) · *01* | Molecule assembles; triads and live columns per atom; stacking into x ∈ ℝ¹⁵; TeX x = (x₁, y₁, z₁, …) ∈ ℝ³ᴺ. |
| 03 | Potential energy (0:45, 26 s) | 70 seeded samples (`energySamples`: `configuration(s,q)` at 1.3σ plus 0.03 Å jitter, energy from the all-pairs spring network) flash faster and faster; each sample's 15-vector is joined by a dashed Bézier to its dot on a vertical U (eV) axis with a pulse ring; counter "N configurations sampled"; U: ℝ³ᴺ → ℝ. |
| 04 | Symmetry (1:11, 30 s) | Translate, then rotate a sample (`rigidMotion`); live "U = 0.xxxx eV" never changes; TeX invariances; six rotated copies on the orbit collapse into one point [x] of a blob M = ℝ³ᴺ/SE(3). |
| 05 | Tangent space (1:41, 40 s) · *02* | Six tangent vectors as per-atom arrows (`tangent.js`): four vertical generators (translations x, y; rotations z, y) in gold, two horizontal shape changes (torsion, bend) in blue, each wiggled; a parallelogram sketch of T_xℝ³ᴺ with the orbit curve; V_x ≅ 𝔰𝔢(3), T_xℝ³ᴺ = V_x ⊕ H_x, 3N = 6 + (3N − 6). |
| 06 | A torus bundle (2:21, 34 s) · *03* | Sampling an energy on a torus; gold fibres with hidden-segment culling; a point runs around a fibre (U constant) then along the big circle; projection π onto an energy-coloured base circle; card *Yes, the U(1) of Maxwell*. |
| 07 | Vertical and horizontal (2:55, 24 s) · *04* | Tangent plane at p, fibre flow vs base flow, T_pT² = V_p ⊕ H_p. |
| 08 | Connections (3:19, 36 s) | The torus cut open into a rectangle (`flatTorus.js`): gold fibres, a 14×10 field of horizontal dashes that tilt with λ; horizontal lifts (parallel transport); v = v^H + v^V; points slide along dashes onto one fibre: A_p: T_pP → V_p, ker A_p = H_p. |
| 09 | Metric connection (3:55, 26 s, continues) | Dashes untilt to orthogonal, right-angle marks; H_p = V_p^⊥; card *The mechanical connection* (zero linear and angular momentum). |
| 10 | Horizontal distribution (4:21, 26 s) · *05* | Horizontal spaces revealed in random order over the torus; integral curves; flat because the base is 1D. |
| 11 | Holonomy (4:47, 36 s) | 3D bundle box (`bundleBox.js`): floor grid, gold fibres, blue tiles; flat sheets; tiles twist (λ = 0.5); the horizontal lift of a loop climbs; a gold brace "holonomy"; readouts "A = 3.14, Δz = 1.57, Δz/A = 0.50 = λ"; the loop wobbles and the ratio holds. |
| 12 | Curvature (5:23, 32 s, continues) | Shrinking circles, then square/triangle/circle loops; a chart of Δz/A collecting markers on λ = 0.5; hol(εu, εv) = ε²Ω(u, v) + O(ε³); card Ω = DA = dA + ½[A ∧ A]. |
| 13 | Shape-space bundle (5:55, 22 s) · *06* | Molecule tangents again; SE(3) ↪ ℝ³ᴺ → M; the word "curvature" bends along an arc (`curvedText`). |
| 14 | Molecule holonomy (6:17, 34 s) | A loop in (torsion a, bend b) integrated at L = 0 (`zeroMomentumRotations`, masses C 12, C 12, O 16, N 14, H 1): after 2 loops the same shape is turned by 25.0°; shrink table ×1 12.50°, ×0.5 3.09°, ×0.25 0.778°, ×0.125 0.195°, ratio settling at ≈ 5.3 °/rad². |
| 15 | The falling cat, explained (6:51, 32 s) · *07* | A 2D toy cat (`cat.js`, inertia tucked 1 vs extended 4, 150° relative twist); the shape-space loop inset; L = I_f θ̇_f + I_b θ̇_b = 0; Δθ = 3/5 · 150° = 90° per loop. |
| 16 | The falling cat (7:23, 19 s) | Free fall (height ∝ t²), two loops on the way down, lands feet first with a squash. |
| 17 | Next video (7:42, 15 s) | "The geometry of shape space 2": T*M, changing the metric g on M, the musical isomorphism ♯_g. |

### Atlas · Why one chart is not enough (`src/videos/atlas`)

- **00 Title (7 s):** a still sample of the torus cloud (`createFlow(createRng(1))`) on the painter's torus.
- **01 A flow that will not flatten (0:07, 74 s, live):** header *01 · WHY AN ATLAS · A circulating flow does
  not fit in a flat square*. 3000 particles per cloud follow dx = (D∇log p + J/p)dt + √(2D)dW with
  p ∝ exp[1.25 cos(φ − θ − π/3) + 0.6 cos(θ − 2)]. Glued square from 14 s (teleports drawn as dashed lines),
  readouts from 22 s (TV distance on a smoothed 24×24 histogram; laps per particle per second against j/2π),
  current off/up at 30–44 s, histogram lens at 42 s, walled square restarted from the glued cloud at 46 s
  (pile-up, TV 0.708 at 64 s in the rendered frame), hand-over at 61 s. Controls: lever D
  (0.15 → 0.45 → 0.15), lever j (0.5 → 0 → 1 → 0.5), lens "Squares show", drag lens. Beats: Cut open, The
  current, Histogram, Walls, Your turn.

### Explorable · Torus flow, flattened (`explorables/torus-flow.html`, 436 lines)

Three figures (torus in ℝ³ via three.js; glued chart with teleports; square in ℝ² with walls, "keep the rule" or
"drop the current"), a readout table and sparkline, and three argument columns (invariance of domain: a torus
does not fit in ℝ²; the current is a topological object; what a flat target can and cannot keep). Light/dark
theme, unseeded and live, so it cannot be scrubbed or exported.

---

## 2. Visual vocabulary and style

**Stage and ground.** Everything is drawn in 1600×900 stage units on a dark navy ground (`color.bg #0d1321`)
with a faint dot grid (40 px spacing, alpha 0.07; `draw/background.js`). The videos are always dark; only the
explorable follows the system theme.

**Colour carries meaning** (`draw/theme.js`):
- Neutrals: ink `#ece8de` (formulas, primary marks), body `#d3d7e0`, muted `#8a96ad` (notes, ghosts), dim,
  line `#2c3a56` (axes), grid `#1c2640`, panel `#141c2e` (bar tracks).
- **soft `#6cc4e8`** (sky blue) and **stiff `#ef8a5b`** (orange): Part 1's two modes, in plots, arrows, highlight
  rings, ticks, axis labels and bars. Part 1 reuses them for verdicts: stiff for the flat-column notes and the
  Problem 1/2 cards, soft for the Riemannian notes and the Problem 3 card.
- **gold `#f2cf63`**: the object of attention (current sample ring, cursor, k_BT line, "×20" and "×400"
  brackets, the noise ball, the "What this requires" box, title second lines in italic).
- Axes x/y/z red/green/blue (`axisColor`), used for coordinates and per-axis rows of column vectors.
- Part 0 overrides: `VERTICAL = gold` (fibres, symmetry generators), `HORIZONTAL = soft` (connection, shape
  changes); an energy ramp deep blue → teal → green → gold (`energyColor`).
- Atoms by element (C `#9aa7bd`, O `#e2655f`, N `#5f8ff0`, H `#e9e6dd`), shaded spheres with radial gradients,
  split-colour bonds with a dark casing, white mono atom numbers.
- Densities: `heatmap.js` ramp navy → teal → sea green → gold with thin level lines of log p; the atlas uses
  viridis and its own accents (glued teal, walled orange, tracers `#ff6a3d`, seams magenta and white).

**Typography.** Spectral for titles (42 px; 78 px on title cards, second line gold italic) and display text;
IBM Plex Sans for body (22 px); IBM Plex Mono for eyebrows (17 px, tracked 2.5, uppercase "05 · STIFFNESS"),
notes (15 px muted), ticks, readouts and units. Inline maths in running text is Unicode (σₜ, ℝ¹⁵, Å⁻¹, κ);
real formulas are MathJax (below).

**Layout.** Header top-left (eyebrow at y 74, title at y 126), drawn and faded by the timeline. Content between
y ≈ 200 and 870. The recurring split: the physical object on the left (molecule at cx 400–540 or a torus),
plots and formulas on the right (x 860–1500, plot boxes ≈ 600 wide), captions near the bottom (y 760–870) in
a slot that several captions share in turn. Title cards: text block at x 100, picture at the right. "Next video"
cards: picture left, text from x 820.

**Pacing.** Scenes run 6–40 s. Narration is sparse text under the stage (Part 1: 535 words in 290 s, 1.8
words/s; Part 0: 2.1 words/s), not voiced; the pictures carry the timing. Every element gets its own
`seg()` fade-in, staggered by 0.3–1.5 s; a caption slot is reused with `fade(t, a, b, c, d)`; scenes dip to
dark (0.6 s in, 0.45 s out) unless `continues: true` (used for the Part 1 build-ups 02–04 and 08–09, and Part 0
scenes 09 and 12). Holds are deliberate: Problem 1 parks σₜ at 0.1 Å for 3 s while the caption states 278% vs
14%.

**Camera.** Slow and purposeful, never cut within a scene: the molecule camera settles while the molecule
assembles; `lerp` moves it aside (cx 800 → 480) or into a corner (scale 160 → 118) when plots arrive; title
molecules and tori drift in yaw at 0.02–0.1 rad/s; the atlas torus yaws 0.15 rad/s and can be dragged.

**Formulas.** Declared once at module level with `tex(source, fallback)`, rendered by MathJax to SVG images,
drawn with an alpha ramp. The best formula work (Part 1 scene 13) assembles a formula from parts on a shared
baseline (`drawOnBaseline`), swaps a part by blurring it out and the replacement in, grows braces from their
centre (`brace(..., progress)`), and flies symbols into explicit arrays (`drawCentered` with lerped position
and size).

**Readouts are computed live, never typed:** bond length (`molecule.bondLength`), U(x) (`energyOf`), σₜ,
information-left percentages, σₜ/σᵢ bars, holonomy Δz from `horizontalLift`, rotation angles from
`zeroMomentumRotations`, TV distance and lap rates from the simulation state. They are mono, coloured by
meaning, formatted with a real minus sign (`formatNumber`).

**Progressive builds** are the house style: atoms → bonds → spheres; one sample at a time, then a pour at an
accelerating rate (exponent 1.6) with ghost outlines of recent samples; per-atom 3-vectors flying row by row
(0.08 s apart) into one 15-vector; a strip plot lifting into a scatter; zooms by `lerpLog` with an explicit
"x-axis zoomed ×20" note; cards whose body types itself out (`progress`).

**What makes the best scenes good** (specific):
- *Problem 1* (`part-1/scenes/10-problem-one.js`): one scalar σₜ(t) drives three coupled, computed views
  (noised scatter, retention curves with a cursor, ratio bars), so the claim "stiff erased ×20 earlier" is seen
  three ways at once; the hold makes the numbers readable.
- *Problem 3* (`13-problem-three.js`): formula surgery that keeps the eye on one object; the bars animate
  from "×400" to "equal" by lerping widths while the numbers cross-fade.
- *Data · stiff* (`08-data-stiff.js`): the same 400 points re-drawn under a ×20 zoom and back, so "same shape,
  different ruler" is shown, not asserted; the molecule cycles samples with a live bond length.
- *Holonomy / Curvature / Molecule holonomy* (Part 0, scenes 11, 12, 14): real 3D geometry, computed lifts and
  integrated rotations, readouts that land exactly on λ = 0.5 or converge to ≈ 5.3 °/rad², and a wobbling loop
  as a visual proof of area dependence.
- *The score* (`11-score-covector.js`): a covector drawn as a stack of level lines with a sweeping direction and a
  live pairing; the one place where vectors vs covectors become pictures.
- *Atlas live scene*: the video plays its own controls before handing over, and every number an MP4 viewer needs
  is on the canvas.

---

## 3. Engine and APIs

**Layers.** `videos → kit → draw / model → engine`, downwards only. `src/kit.js` re-exports everything a scene
needs (timing, controls, theme, text, shapes, widgets, TeX, plots, molecule view, heatmap, surfaces, camera,
vec3, rotation, rigid body, energy, molecule, physics constants, seeded data).

**A scene is a pure function of time** (`engine/timeline.js`, `defineScene`): `draw(ctx, t, live)` with local
time t; the timeline draws background, header and dips. Timing helpers (`engine/timing.js`): `seg` (eased
0→1), `fade(t, a, b, c, d)`, `lin`, `oscillate`, `lerp`, `lerpLog`, `clamp`, `easeInOut`.

```js
export default defineScene({
  name: 'Problem 1', duration: 25,
  narration: 'Now add flat noise. …',
  header: { eyebrow: '09 · PROBLEM 1', title: 'Flat noise erases the stiff directions first' },
  draw(ctx, t) {
    const sigmaT = noiseLevel(t);                       // everything derives from t
    drawNoisedData(ctx, t, sigmaT);
    drawInformationCurves(ctx, t, sigmaT);
    drawMeters(ctx, fade(t, 1.6, 2.4, 15.8, 16.4), sigmaT);
  },
});
```

A video is `src/videos/<id>/{meta.json, index.js, scenes/NN-*.js}`; `index.js` exports
`{ ...meta, scenes, posterTime }` and is the edit (reorder or reuse scenes here). Scenes are plain frozen
objects, so a new video can import and replay scenes of Part 1 as a recap. Shared layout lives in
`videos/common/configuration.js` (column slots, the stacked 15-vector) and per-video `shared.js`.

**Formulas from parts** (the Problem 3 idiom):

```js
const LOSS = { head: tex(String.raw`\mathcal{L}_{G}(\theta) = …`, 'L_G(θ) = …'), inverseMetric: tex(String.raw`G^{-1}`, 'G⁻¹'), … };
let x = 100;
x += LOSS.head.drawOnBaseline(ctx, x, baseline, { size, alpha }).width + gap;
LOSS.riemannianScore.drawOnBaseline(ctx, x, baseline, { size, alpha: 1 - seg(t, 15.8, 16.6), blur: 8 * seg(t, 15, 15.9) });
```

**Live scenes** (`engine/controls.js`, `simulation.js`, `live.js`): controls are `slider`, `choice`, `drag`, each
with a constant or `[time, value]` keyframes (numbers ease like `seg`, so a sudden change needs a holding
keyframe). A *lever* is exactly a control listed in the simulation's `uses`; anything else must be a *lens*
(`checkControls` enforces this). `simulation({ seed, dt, tick, snapshotEvery, uses, init, step, onTick, events })`
is a seeded fixed-step model with exact snapshots every 0.5 s; `Track`/`Cursor` seek by restoring the nearest
snapshot; `LiveView` holds a viewer's cursors, lenses and explore mode; `warmUp` precomputes in background
slices. The scene receives `draw(ctx, t, { input, state })`. Optional `beats`, `handovers`, `exploreFrom`, and
narration as `[time, text]` cues. Model files must be DOM-free so `tests/` can run them in Node.

```js
controls: {
  D: slider('Noise D', { min: 0, max: 0.6, step: 0.01, value: [[0, 0.15], [7.5, 0.15], [8.5, 0.45], [12, 0.45], [13, 0.15]] }),
  show: choice('Squares show', { target: 'target p', hist: 'histogram' }, { value: [[0, 'target'], [42.5, 'hist']], lens: true }),
  view: drag('Drag the torus to rotate it', { region: [40, 150, 700, 640] }),
},
sim: flowSimulation({ seed: 5, uses: ['D', 'j'], events: [[46, restartWalled]] }),
```

Engine nuance worth knowing: an *analytic* scene with sliders but no simulation can only have lenses (they never
pause the narration). If a slider changes what the narration claims (a gain, a metric), wrap the analytic model
in a trivial simulation whose `step` stores the input, so the slider becomes a lever with explore mode.

**Player and export** (`engine/player.js`, `src/app.js`): chapters (one per scene, beats as sub-chapters),
scrubbing, speed, fullscreen, keyboard shortcuts, the control strip in two groups ("Physics · pauses the video",
"View"), highlighting a control while the video moves it, hand-over prompts, "Record WebM" (`recorder.js`). The
export API `window.video = { id, duration, scenes, ready, frame(T, width, { height, view }), reset() }` renders
any frame fully computed. On `main`, `scenes` does not yet carry `narration` and `frame()` only returns PNG;
PR #3 and #4 add both (needed by their narrated MP4 export with subtitles).

**Reusable drawing components** (`src/draw`):
- `moleculeView.js`: `drawMolecule(ctx, X, cam, { opacity, atomAlpha[], atomScale[], bondProgress[], labels,
  highlight, highlightColor, glowBond, ghost, spring, molecule })` returns projected atoms (for threads to plots);
  `arrow3`, `drawAxisTriad`, `moleculeCamera`.
- `plots.js`: `energyPlot` (E = ½ks² with k_BT), `logDensityPlot` (slope point, step), `axesL`, `ticksBelow`,
  `ticksLeft`, `niceStep`, `symmetricTicks`, `formatTick`. There is no generic line chart, histogram or
  time-series; Part 1 scene 10 draws its retention curves inline, and the atlas sparkline is private to
  `torusViews.js`.
- `heatmap.js`: `densityHeatmap({ size, extent, density, gradLog })`, a 2D density image with level lines. There
  is no matrix heatmap.
- `widgets.js`: `card` (tag pill, title, typed body), `columnVector`, `columnFrame`, `vectorRow`, `rowVector`,
  `kBT`, `sceneHeader`.
- `shapes.js`: `arrow`, `line`, `dashedLine`, `dot`, `ring`, `brace` (with progress), `bar`, `roundRect`.
- `text.js`: `text`, `wrap` (with typewriter `chars`), `curvedText`, `formatNumber`, `SUBSCRIPT`.
- `surface.js`: `drawSurface` (shaded parametric surface, painter's algorithm; allocates per vertex, too slow
  for live scenes per the design note), `polyline3` (with `visible(i)` culling and `progress`), `polygon3`.
- `tex.js`: `tex()`, `draw`, `drawOnBaseline`, `drawCentered`, `metrics`, `center`.

**Models** (`src/model`, all DOM-free): `molecule.js` (a `Molecule` class for any element list with C/O/N/H, the
5-atom C–C–O–N–H molecule, `modes.twistTangent`, `modes.stretchAxis`, `configuration(s, q)` with s the arc length
of H5's twist about bond 2–3 and q the stretch of bond 1–2); `energy.js` (`springNetwork`: harmonic springs
between all atom pairs, bonds k = 20, others 0.4 eV/Å²; `springEnergy`); `physics.js` (illustrative kT = 0.0259 eV,
k_soft = 0.05, k_stiff = 20, σ_soft = 0.720 Å, σ_stiff = 0.0360 Å, κ = 400); `data.js` (400 seeded samples with
noise draws e1, e2; 15 seeded Brownian paths of 11 s; `vibration`; `randomDirection`); `mixture.js` (2D
Gaussian mixture and its score); `camera.js`; `vec3.js`; `rotation.js`; `rigidBody.js` (`zeroMomentumRotations`).
Part 0's `shared.js` adds `energyOf`, `rigidMotion`, `generators` (translation, rotation and shape tangent
vectors), `shapeAB`, `loopHolonomy`, torus and bundle geometry and `horizontalLift`; `tangent.js`, `bundleBox.js`,
`flatTorus.js` and `cat.js` hold the drawing of those. The atlas adds `torusFlow.js` (the seekable flow model) and
`torusViews.js` (a typed-array painter's torus with particles binned per mesh cell, charts, readout table and
sparkline).

**Build, render, check.** `npm run build` bundles each `src/videos/<id>` (except `common`) with esbuild into one
self-contained `dist/<id>.html` (about 59–105 kB; MathJax and fonts from CDNs with fallbacks) and copies
explorables. `npm run export -- --video part-1 --from 219 --to 257 --mp4 out.mp4` renders frames through
`window.video.frame` and encodes with ffmpeg. `npm test` runs `node --test tests/*.test.mjs` (5 model checks of
the torus flow, thresholds fixed before the first run) and `scripts/smoke-test.mjs`: start, middle and end of
every scene; for live scenes, identical frames whether jumped to, jumped back to or played up to, and every
control at its extremes; a grep that fails on `Math.random`, `Date.now` or `performance.now` under
`src/videos`; every explorable runs 1 s. On this machine Playwright needs `PLAYWRIGHT_CHANNEL=chrome`.

---

## 4. Content coverage

**Already explained, with the claims on screen:**
- *Configuration space* (Part 0 scene 02; Part 1 scenes 01–04): N atoms = one point of ℝ³ᴺ (here ℝ¹⁵); a motion =
  a direction v; coordinates in Å; built from per-atom 3-vectors.
- *Energy and symmetry* (Part 0 scenes 03–04): U: ℝ³ᴺ → ℝ is invariant under SE(3) (live U unchanged under
  translation and rotation), so it lives on M = ℝ³ᴺ/SE(3); "M is a smooth manifold away from degenerate
  configurations".
- *Vertical/horizontal split* (Part 0 scenes 05, 07–09, 13): V_x ≅ 𝔰𝔢(3) (6 directions), H_x its complement;
  a metric picks H_p = V_p^⊥; the mechanical connection = zero linear and angular momentum.
- *Curvature and holonomy* (Part 0 scenes 10–16): holonomy = λ × area (λ = 0.5), curvature = holonomy per area,
  Ω = DA; the shape-space bundle is curved: a loop of shapes at L = 0 turns the molecule (25.0° after two loops;
  ≈ 5.3 °/rad²); the falling cat turns 90° per loop.
- *Stiffness* (Part 1 scenes 05, 07–09): soft torsion vs stiff bond; force constants 0.05 vs 20 eV/Å²; thermal
  spreads ±1.02 vs ±0.05 Å "per kT" (the E = kT crossing, √2σ) and σ = 0.72 vs 0.036 Å in the data; K = ∇²E ≈
  k_BT Σ⁻¹; κ = 400 "over the internal modes".
- *Flat forward noise* (Part 1 scene 06): dx = g dW, x_t | x₀ ~ N(x₀, σₜ² I), the same kick for bond and torsion.
- *Problem 1, uneven information loss* (scene 10): information left σᵢ²/(σᵢ²+σₜ²); stiff erased at a ×20
  (= √κ) smaller σₜ; at σₜ = 0.1 Å stiff 278% of its spread, soft 14%; "no single noise schedule suits both".
- *The score is a covector* (scene 11) and *Problem 2* (scene 12): components scale as 1/σᵢ (1.39 vs 27.8 Å⁻¹,
  ×20, gap ∝ √κ).
- *Problem 3* (scene 13): the flat loss on the Euclidean score charges a 5% stiff error ×400 more than a 5% soft
  error ("the soft directions are barely trained"); the Riemannian loss targets G⁻¹∇log p and measures δᵀGδ;
  with G = K the target's Jacobian is −I/k_BT (κ = 1) and equal relative errors cost the same (0.097 each).
- *One fix* (scene 14): noise covariance G⁻¹, raised index, G-norm; requires G = K ⇔ G⁻¹ ∝ Σ.
- *Atlases* (atlas video, explorable): a winding current on a torus cannot be carried by one flat chart; a walled
  square piles up mass (TV → 0.7–0.95) and cannot circulate; glued edges work only by jumps.

**Explicitly deferred:** the spring metric and "why it works" (Part 1 scene 15: "satisfies G ≈ K
approximately"); rigorous proofs ("part of the thesis"); shape space part 2 (T*M, changing the metric on M,
♯_g; Part 0 scene 17); an atlas payoff scene, flow matching and the atlas method itself (README, design note
step 3); controls on Part 0/1 scenes; session export, talk mode, subtitles.

**Not on `main` at all:** the wδ metric and geodesic-ODE noising; why it failed numerically; embeddings and
pullback metrics with closed-form forward processes; spring metrics from trajectories, quantum chemistry or a
transferable model; invariant embeddings; ALDP5 and BBA results; force-field extraction, simulation and
iid–simulation consistency; learned embeddings; readable windows, range and order, loud collective modes,
ordered internal coordinates; any real molecule beyond the 5-atom toy or any measured number. Open PR #3 covers
parts nearby: the covariance video ("the pullback equals inverse covariance", "covariance itself as the metric")
and the retention video (I_t = Cov(E[u | X_t]) curves for bond/width/torsion/basin, conditional stiff whitening).

**Consistency facts a continuation must respect** *(computed for this report)*:
- Part 1's constants are illustrative and *not* derived from `energy.js`. The Hessian of the repo's own
  all-pairs spring network at rest has 6 zero eigenvalues (rigid motions) and 9 internal ones: 0.026, 0.041,
  0.48, 0.77, 1.03, 20.5, 38.2, 49.8, 54.0 eV/Å², so κ_internal ≈ 2050, not 400. Along Part 1's own coordinates
  the curvature is 0.019 eV/Å² (twist s; Part 1 says 0.05) and 20.9 eV/Å² (stretch q; Part 1 says 20).
- Problem 3 argues in the *score* (covector) parametrization, where stiff errors are over-weighted ×κ and soft
  modes are "barely trained". The project's later framing ("the loss does not really see stiff modes") is the
  *vector* side of the same wrong ruler: stiff structure is readable only in a narrow window at tiny σₜ (Problem
  1), and Å-sized errors in x₀ or ε barely register. A new piece should present these as one statement seen from
  both sides, or a Part 1 viewer will perceive a contradiction.
- Part 1's "±1.02 Å per kT" (E = kT crossing) and "σ_soft ≈ 0.72 Å" (data spread) are different widths; the
  narration says "about an ångström".

---

## 5. Lessons and preferences

From the README, the design note, PR descriptions, commit history and saved notes:
- **Determinism is non-negotiable.** Frames are functions of time (and seeded inputs); the smoke test greps
  for clocks and unseeded randomness; engine changes were verified against 102 byte-identical frames of Parts 0
  and 1; two MP4 exports must be byte-identical.
- **Readouts computed, not typed; illustrative numbers labelled as such** (Part 1 README note; retention:
  "numbers illustrative, identities derived" with tests for every identity the narration states). Model-check
  thresholds are fixed before the first run.
- **Narration must stay true.** Levers pause the narration; a review removed two overclaiming lines; wording was
  tightened after a scientific review (the glued square is not called a chart; "noise floor", not "sampling
  floor"; a footnote on what the walled lap number counts). Prefer modest, precise claims.
- **Focus and length.** The atlas scene was cut from 100 s to 74 s after a first viewing and refocused on one
  point (topology); the video plays its own controls before handing over; controls are grouped by whether they
  pause the video. The information-geometry side video (32 min) was flagged as too long.
- **Quality bar** (u1-force notes): "in the spirit of Part 0 and the Manim Hopf-fibration article: real 3D
  geometry, slow purposeful camera, computed objects, progressive builds"; a colour code fixed after a design
  review and kept in every scene; bottom readouts laid out against one shared baseline.
- **Separation.** Thesis videos live in `src/videos`; non-thesis side videos stay in `private/other/<id>` with
  their own scripts, never in the thesis build, tests or README. A thesis video should therefore not import from
  `private/other`; promote helpers into `src/draw` instead.
- **Process.** Look at rendered frames before calling a scene done; keep `npm test` green; gitmoji commit
  messages; PR descriptions with purpose, what changed, results and checks, limits.
- **Pitfalls seen in rendered frames:** label collisions ("q (Å) · stiff (bond 1–2 stretch)" overlaps "vertical
  axis ×20" in Data · stiff; the step label crosses the curve in Problem 2); a footnote clipped at the right edge
  (Molecule holonomy); illustrative constants (`physics.js`) mixed with a computed network (`energy.js`).
- **Performance.** `drawSurface` is too slow for live scenes; Gaussian draws dominate simulation cost; full
  snapshots cost about 200 kB each.

---

## 6. Opportunities

Each item names the existing scene or component it builds on. Numbers marked *(computed)* come from the repo's
own models and can be recomputed in the scene.

1. **"One ruler for everything" (Euclidean arbitrariness), three computed comparisons.** Layout of Part 1's data
   scenes (molecule left via `drawMolecule` with a ghost of x₀; readouts right).
   - Rotamers: a 180° twist of H5 about bond 2–3. The Euclidean distance between the rotamers is 1.75 Å; the
     straight Cartesian interpolation shrinks O–H from 0.96 to 0.40 Å at its midpoint, U = 3.27 eV ≈ 126 kT; the
     torsion path keeps 0.96 Å, U ≈ 0.10 eV *(computed, `configuration(s, 0)` and `springEnergy`)*.
   - Ranking: a 0.1 Å stretch of bond 1–2 is 0.11 Å away and costs 0.105 eV (4 kT); a 1.0 Å torsion arc is 0.95 Å
     away and costs 0.044 eV (1.7 kT). Euclid calls the stretch 8.5× closer; the energy calls it 2.4× costlier
     *(computed)*.
   - Rigid motions: Part 0 scene 04's `rigidMotion` with a live Euclidean distance next to the unchanged U.
   The thread idiom (`drawMolecule` returns projected atoms; a dashed gold line to a plot point) ties each
   molecule to its point on a distance axis.

2. **Straightening and the wδ idea.** Reuse Part 1 scene 04's "3 of the 15 axes" view (`AXES_CAM`, `SHOWN`):
   draw the torsion orbit {`configuration(s, 0)`} as a curved 1D manifold in ℝ¹⁵, the Euclidean chord cutting
   through high energy, and its image under a feature map where it is a straight line. Then a first *molecular
   live scene* (`simulation()`): a noising walk that solves a geodesic ODE per step, with levers for the solver
   step and a sensitivity parameter, and readouts for constraint drift, energy and ODE steps per noising step.
   That turns "numerical, sensitivity and performance problems" into something the viewer can break.

3. **The noise clock per mode (generalising Problem 1).** Replace Part 1's two modes by all 9 internal modes of
   the `energy.js` network (0.026…54 eV/Å², κ ≈ 2050, computed): retention curves σᵢ²/(σᵢ²+σₜ²) on the same
   log-σ axis with a moving cursor, and a *destruction raster* with one row per mode, each a bar for its readable
   window (say 90% → 10% retained, σₜ ∈ [σᵢ/3, 3σᵢ]). Draw each mode's eigenvector on the molecule with
   `drawAtomArrows` (Part 0 `tangent.js`) as its row label. Then apply G = K: the bars align (Part 1 scene 14's
   promise, now visible). This needs a small symmetric eigen-solver in a DOM-free model file plus a test.

4. **Same noise, two rulers.** Part 1 scene 06's Brownian paths (`brownian(j, t)`, 15 seeded paths) mapped
   through I and through K^{−1/2} (pseudo-inverse on the 9 internal modes): two molecules side by side driven by
   the *identical* random draws, with live bond 1–2 length and torsion readouts and the noise ball replaced by
   two ellipsoid projections. Under flat noise the bond is shredded while the torsion barely moves; under the
   metric both move in proportion to their thermal widths.

5. **Range and order, readable windows, loud modes.** Continue item 3: with G = K all windows sit on top of one
   another, so the coarse-to-fine order is lost; BBA's "bonds better, global worse" is the visible symptom. Show
   *ordered internal coordinates* as two moves on the raster: (a) internal coordinates scaled to thermal width
   line up the local windows (range), (b) a small block of collective modes multiplied by a gain slides right,
   destroyed last and therefore generated first (order). Make the gain a lever via the trivial-simulation trick
   (Section 3), so the viewer can drag the loud block and see the windows move.

6. **Embeddings and pullbacks, with an exact example.** For a harmonic pair network at rest, the Hessian equals
   the pullback G = Jᵀ W J of the diagonal metric W = diag(k_ij) on pair distances, where J (10×15) is the
   Jacobian of the 10 distances (the term with ∇²d is multiplied by d − d⁰ = 0). So the spring metric *is* K at
   rest; the numerical Hessian in Section 4 is exactly this matrix. Build it with the Problem 3 flight idiom (J, W, Jᵀ fly into a product), show
   the spectrum on Part 1 scene 09's log eigenvalue axis (`drawEigenvalueScale` is local to that scene; lift it to
   `plots.js`), then move away from rest to show where G ≈ K holds only approximately. The six zero eigenvalues
   are Part 0's vertical directions: draw `MOLECULE_TANGENTS` with zero length under the pullback. This is the
   natural payoff of Part 1's "Next video" card and a bridge from Part 0 to Part 1. Coordinate with PR #3's
   covariance video, which already has "the pullback equals inverse covariance".

7. **Where the springs come from.** Three k_ij matrices (trajectory data, quantum chemistry, transferable model)
   for ALDP as matrix heatmaps, plus the molecule drawn with springs whose width follows k_ij. `Molecule` already
   supports a 22-atom C/O/N/H molecule and `drawMolecule({ molecule })`; it needs a matrix heatmap component,
   spring drawing for non-bonded pairs (today `spring` only morphs bonds), and measured data exported from the ML
   repo into the video folder, labelled as measured.

8. **Results as computed report cards.** ALDP5 and BBA bars per feature class (bonds, angles, torsions,
   contacts, global fold), flat vs metric vs ordered internal coordinates, animated with Problem 3's bar morph;
   BBA's backbone as a 3D tube with `polyline3` under the molecule camera, local geometry good, fold off.
   Simulation and iid–simulation consistency as a live `simulation()` of Langevin dynamics under the learned
   force vs the true force, with histograms and a TV readout reusing the atlas readout table and sparkline
   pattern (lift `drawSparkline`/`drawReadouts` into a generic `draw/` module).

9. **An evolution map as the spine.** An opening or chapter card that draws the project as a path of nodes
   (wδ → geodesic ODEs → "what do we want from the metric?" → embeddings and pullbacks → spring metrics and
   invariant embeddings → ALDP → BBA → learned embeddings → range and order → ordered internal coordinates), each
   node lighting up as its chapter plays. `llm-soc/shared.js` has `panel`, `node`, `chip`, `connector` and
   `packet`; promote them into `src/draw` rather than importing from a side video.

10. **Engine and kit groundwork** these ideas need: a generic line chart, histogram, matrix heatmap and sparkline
    in `src/draw`; narration in `window.video.scenes` and JPEG frames (already on PR #3/#4's `app.js`); a
    `paced()` wrapper for narration-fitted timing (in the information-geometry side video); one source of truth
    for physical constants (either derive Part 1's values from `energy.js` in new pieces or label them as
    illustrative); a symmetric eigen-solver plus Node tests for every identity a narration line states.

---

## 7. Sources read

- `README.md`, `docs/interactive-video.md`, `package.json`, `index.html`, `.gitignore`, `styles/player.css` (skim)
- `src/kit.js`, `src/main.js`, `src/app.js`
- `src/engine/`: `timeline.js`, `timing.js`, `random.js`, `controls.js`, `simulation.js`, `live.js`, `recorder.js`, `player.js`
- `src/draw/`: `theme.js`, `color.js`, `background.js`, `text.js`, `shapes.js`, `widgets.js`, `tex.js`, `plots.js`, `heatmap.js`, `moleculeView.js`, `surface.js`
- `src/model/`: `molecule.js`, `energy.js`, `physics.js`, `data.js`, `mixture.js`, `camera.js`, `vec3.js`, `rotation.js`, `rigidBody.js`
- `src/videos/part-1/`: `meta.json`, `index.js`, every scene `00`–`15`, `scenes/shared.js`
- `src/videos/part-0/`: `meta.json`, `index.js`, `shared.js`, `tangent.js`, `bundleBox.js`, `flatTorus.js`, `cat.js` (part); scenes `00`–`06`, `08`, `09`, `11`–`17` in full, `07` and `10` in part, narration of all
- `src/videos/common/configuration.js`; `src/videos/atlas/`: `meta.json`, `index.js`, both scenes, `torusFlow.js`, `torusViews.js` (exports, readouts)
- `explorables/torus-flow.html` (styles, prose, model constants)
- `scripts/build.mjs`, `export-frames.mjs`, `serve.mjs`, `smoke-test.mjs`; `tests/torus-flow.test.mjs`
- `private/other/llm-soc/README.md`, `shared.js` (exports), `render.mjs`, `export.mjs` (for reusable helpers only)
- `gh pr view 1…5` descriptions; `git log` with dates; diffs of `src/app.js`, `src/main.js`, `common/configuration.js` against the PR #3 snapshot
- Saved notes in `~/.claude/projects/-Users-I745505-private-thesis-animation/memory/` (side-video separation, tooling, retention source, u1-force conventions)
- Rendered frames (scratchpad only): Part 1 at 88, 113, 131, 148, 166, 187, 210, 250, 272 s; Part 0 at 165, 222, 310, 396, 400, 409, 430 s; atlas at 37 and 64 s. Computations: spring-network Hessian spectrum, curvature along Part 1's coordinates, rotamer interpolation, stretch-vs-torsion ranking, score at the Part 1 scene 11 point.
