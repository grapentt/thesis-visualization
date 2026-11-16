# Thesis visualization

Animated and interactive explainers built to help me visualise my master's thesis.

The thesis is about generative models for molecular configurations that respect
the geometry of the problem. A molecule's shape does not change when it is moved
or rotated, some of its motions are far stiffer than others, and realistic
configurations concentrate near lower-dimensional submanifolds. The thesis
follows three threads:

- **Diffusion in the right geometry.** Score-based diffusion models that add
  noise, predict scores and measure errors with a Riemannian metric that knows
  how stiff each direction of a molecule is, instead of in flat coordinates.
- **Flow matching.** Learning a velocity field that carries a simple
  distribution to the data, on the same geometric footing.
- **Atlases of local charts.** A new method, in development, meant to discover
  the lower-dimensional submanifold the data lie on, cover it with overlapping
  local charts joined by transition maps, and run learning directly on it.

Equations make these arguments precise; the pieces here are meant to make them
intuitive.

## What is here

| Piece | Kind | Thread |
| --- | --- | --- |
| Part 0 · The geometry of shape space 1 | video, about 8 min | shape space: bundles, connections, curvature |
| Part 1 · Diffusion in the right geometry | video, about 5 min | diffusion: stiffness and the metric |
| Atlas · Why one chart is not enough | playable video (prototype), about 1.5 min | atlases: why one flat chart is not enough |
| Bundles · One space, many bundles | video (draft), about 11 min | shape space: global and local symmetries, sections, associated bundles, noise and curvature |
| Interactions · Parts and poses | video (draft), about 22 min | generative models of several molecules: frozen monomer models, one learned interaction |
| Covariance · The geometry of fluctuations | video, 30 min 30 s | covariance from first principles, local spread, stiffness, intrinsic curvature |
| Retention · What the noise should keep | video, 17 min | diffusion: what information geometry adds to the noising process and the model, and what it does not |
| Torus flow, flattened | explorable | atlases: the same argument as a standalone page |

**Videos** are narrated timelines with chapters, scrubbing and frame-by-frame
export to MP4. **Explorables** are interactive pages to play with directly.
**Playable videos** combine the two: a narrated video whose live scenes the
viewer can take over; see [Playable videos](#playable-videos). The atlas
prototype and the torus page only motivate atlases; flow matching and the atlas
method itself will get their own pieces.

## The videos

**Part 0 · The geometry of shape space 1** (about 8 minutes)

1. **The space we work on.** A configuration of N atoms is a point of ℝ³ᴺ. Its
   potential energy does not change under translations and rotations, so the
   energy really lives on the quotient M = ℝ³ᴺ / SE(3), the shape space.
2. **The tangent space splits** into vertical directions, which generate the
   symmetries (the Lie algebra 𝔰𝔢(3)), and horizontal ones, which change the
   shape: T_xℝ³ᴺ = V_x ⊕ H_x.
3. **Bundles, on a torus.** A torus as a circle of circles: total space T², fibres
   S¹, base M = T²/S¹, a principal U(1)-bundle.
4. **Connections** choose the horizontal spaces. Equivalently they project onto
   the vertical. A metric gives a natural one; in mechanics it is the
   zero-angular-momentum (mechanical) connection.
5. **Curvature.** Walking around a loop horizontally can end at a different point
   of the fibre (holonomy). Curvature is holonomy around infinitesimal loops,
   which is why it is a 2-form.
6. **Back to molecules.** The shape-space bundle is curved: a loop of shapes with
   zero angular momentum rotates a molecule (computed exactly from L = 0), and a
   falling cat lands on its feet.

**Part 1 · Diffusion in the right geometry** (about 5 minutes)

1. **Configuration space.** A molecule of N atoms is one point in ℝ³ᴺ, and a
   motion of the molecule is one direction in that space.
2. **Stiffness.** Some directions (a torsion) are soft, others (a bond stretch)
   are stiff. Their natural length scales differ by orders of magnitude, and the
   condition number κ of the stiffness matrix K measures by how much.
3. **Three problems with flat diffusion.**
   - *Uneven information loss:* isotropic Brownian noise erases stiff modes long
     before soft ones.
   - *Badly scaled targets:* the score (a covector) has components that differ by
     orders of magnitude between directions.
   - *A misweighted loss:* the flat loss charges equal relative errors very
     differently in stiff and soft directions.
4. **One fix.** Give configuration space a metric G: noise with covariance G⁻¹,
   the Riemannian score G⁻¹∇log p, and errors measured in G. All three problems
   are solved when G = K.
5. **Next.** The spring metric, which satisfies G ≈ K approximately.

The numbers on screen (force constants, κ = 400) are illustrative. Rigorous
proofs are part of the thesis.

**Atlas · Why one chart is not enough** (prototype, about 1.5 minutes)

1. **Title.**
2. **A flow that will not flatten**, one live scene of 74 s. Particles on a
   torus follow the same dynamics as the torus explorable below: their density p
   stays fixed while a current makes the cloud circulate. The video plays its own
   controls to show what they do: more noise leaves the density at p (8 s); the
   torus is cut open into a square with glued edges (14 s); switching the current
   off stops the laps and turning it up speeds them up (30–44 s); the squares
   switch to the particle histogram (42 s). Then the square gets reflecting walls
   instead of glued edges (46 s): mass piles against the walls and cannot go
   round, because a flat square has no hole to go around. At 61 s the viewer is
   invited to try it themselves.

**Bundles · One space, many bundles** (draft, about 11 minutes)

The molecule is nitroethane with its CH₃ and CH₂ groups as single beads. It
has two symmetries: SO(3) rotates the whole molecule, and a rotor U(1) turns the
two O of its NO₂ group (a '<' shape) about the C–N bond.

1. **Configurations and the orientation fibre.** Every bead is a point of ℝ³.
   The centre of mass is a canonical global section for translations. Vertical
   directions walk along the fibre SO(3).
2. **The rotor.** Turning the two lips is a U(1) action that only moves beads
   4 and 5. It commutes with rotations, so one space carries the bundles
   X → M, X → X/U(1) and M → M/U(1) at once.
3. **Questions.** Is the rotor a bundle (yes, where a lip is off the axis)? Is
   its base a coarse-grained molecule (no: 3N − 1 dimensions)? Sections: the
   torsion angle works on reasonable shapes, but no continuous zero exists on
   all of them (hairy ball, Hopf). There is no global body frame for N ≥ 4.
4. **The rotor in shape space.** Turning it once with zero angular momentum
   rotates the molecule by 81° (the bicycle wheel on a swivel chair).
5. **Associated bundles.** X ×_SO(3) ℝ³ is space as the molecule sees it. The
   beads are its sections, and the shape space of a whole molecule is a bundle
   over the shape space of a part. Parallel transport leaves a second molecule
   at rest in the lab, so seen from the first it turns by the inverse holonomy.
   One bead fixes an orientation only up to its stabiliser. The rotor's line
   bundle is the plane perpendicular to the bond (TS² over bond directions),
   and swinging the bond around a cone turns the lips by the solid angle.
6. **Noise.** Brownian loops of shapes rotate by zero on average and by
   (t²/12)|Ω|² in mean square. Through O'Neill's formula this measures the
   curvature of shape space. Shape noise with zero angular momentum makes a
   molecule with a free rotor diffuse in orientation.

The rigorous statements, proofs and references are in
[docs/many-bundles.md](docs/many-bundles.md). A research note on using the
coupling (associated bundles) to build generative models of several molecules,
or of one molecule from reusable parts, is in
[docs/bundle-generative-models.md](docs/bundle-generative-models.md).

**Interactions · Parts and poses** (draft, about 22 minutes)

Water and hydrogen peroxide in a toy force field (300 K), each with a frozen
diffusion model of its own. Everything drawn is computed when the page loads
(about 3 s); the spring molecules and the one-dimensional toys are exact.

1. **Background.** A noisy point stands for a cloud of clean configurations; at
   small noise a score is a force divided by kT. One molecule's score has no net
   force and no net torque; the shapes are the base of a bundle whose fibres are
   orbits of turns.
2. **The picture.** Two molecules leave a six-dimensional relative pose, the
   fibre of the associated bundle. One diagram carries it from here on: the two
   own shapes on the floor (water's angle, peroxide's torsion), one pose number
   u up the fibres, any point popping out as a real pair.
3. **Just add?** Adding the frozen scores gives molecules that ignore each other
   (flat fibres). Binding is one extra factor w = e^{−βU_int}: docking peaks on
   the fibres, induced fit on the floor (checked against a direct simulation),
   the affinity in total.
4. **Noise.** The noisy weight W_t is the clean weight averaged over the
   reference's cloud. The score splits exactly into two frozen monomer arrows, a
   known spring and one learned interaction arrow with Newton's third law. That
   arrow is not the force at the noisy point (74 %, 365 % and 2255 % off in the
   spring toy), so it is learned as one invariant energy: rigid motions and
   swaps, not mirrors.
5. **Reuse.** One frozen water model serves every partner; a third molecule shows
   why no molecule should be the root, and noise turns pair terms into
   many-body terms. The connection matters only for samplers in bundle
   coordinates.
6. **Verdict.** The identity and the small-noise force field are known; the
   geometry is the contribution; the water dimer showed no data gain, and the
   alanine dipeptide test (alone and with one water, 400 K MD on the LISE
   cluster) is running, with no results yet.

The statements and their sources are in
[docs/bundle-generative-models.md](docs/bundle-generative-models.md); the
expensive checks of the computed numbers are in `tests/interactions.test.mjs`.

Each video runs in the browser as an interactive player with chapters, scrubbing
and narration, and can be exported frame by frame to MP4. Everything is plain
JavaScript on a 2D canvas, with MathJax for the formulas and no framework.

## Explorables

**Torus flow, flattened** (`explorables/torus-flow.html`) shows why one flat
chart is not enough. Particles move on a torus, in angle coordinates (θ, φ),
under a stochastic dynamics that keeps their density p(θ, φ) fixed while a
current j makes the cloud circulate in both directions around the torus:
around the central hole and around the tube. The page shows the same particles
three ways:

1. **On the torus in ℝ³** (drag to rotate). The cloud streams around forever and
   keeps the shape of p. The colour shows p per unit of θ and φ; the dots look
   denser on the inner side because the embedding compresses area there.
2. **On the flat coordinate square with glued edges.** The flow survives only
   because opposite edges are identified, so particles jump from one edge to the
   other.
3. **On the square as an ordinary region of the plane, with reflecting walls
   instead of glued edges.** Keeping the same equation of motion, current
   included, piles mass against the walls, so the density drifts away from p.
   Dropping the current brings the density back to p, but nothing circulates any
   more.

The readouts give the total-variation distance between the particle histogram
and p (0 means identical; with 3000 particles the floor is about 0.06), and the
laps per particle per second. On the torus the lap rate is j/2π, because the
page normalises p to mean 1 over the coordinate square.

The walled square is simply connected and its walls let no mass through, so it
cannot carry the winding current; the glued square carries it only through the
jumps. An atlas replaces the single glued square with overlapping charts. A
particle is re-expressed in the next chart while it is inside the overlap, where
both charts are valid, so no step ever runs into an edge or a wall.

Open it with `npm run dev` at http://localhost:5173/explorables/torus-flow.html,
or open the file directly. It loads three.js and fonts from CDNs, so the 3D view
needs a network connection and WebGL. Without either, the 3D panel shows
"3D view needs WebGL" (also when only the network is missing); the flat squares
and readouts still run. The page follows the system's light or dark theme, while
the videos are always dark. The simulation runs live with unseeded randomness,
so it cannot be scrubbed or exported to MP4 yet. The page is kept as it was
made, apart from three text corrections in its readout table and argument
columns.

## Playable videos

A playable video plays as a complete narrated film, but some scenes are live:
their controls move on their own while the narration demonstrates, and the
viewer can take over at any moment. The atlas video is the first prototype; the
other videos and the explorable will be reworked into this format.

- **Physics controls** (the noise D, the current j) appear in the strip under
  the stage, in a group labelled "Physics · pauses the video". Touching one
  pauses the narration and starts *explore mode*: the simulation runs on from
  that exact moment under the viewer's settings, so the narration never talks
  over physics the viewer has changed. Space pauses and resumes the simulation;
  "Resume the video", Play or Esc plays the narration on from where it stopped.
- **View controls** (rotating the torus by dragging it, showing the target
  density or the particle histogram), in the "View" group, change nothing the
  narration claims, so they never pause anything. They survive scrubbing within
  the scene, until "Reset view".
- While the video itself moves a control, that control is highlighted, so the
  viewer sees what each one does.
- **Hand-overs** invite the viewer to try something ("Your turn: …"). If the
  viewer does nothing, the video plays on with the authored demonstration.
- **Beats** are named moments inside a long live scene, listed as sub-chapters.
- **MP4 export** always shows the authored performance.

A live simulation uses a fixed time step and a seeded random-number generator,
so the same moment always gives the same picture in the same browser build.
Snapshots every 0.5 s of simulated time make jumps fast once that part has been
computed; after a far jump into a part not yet computed, the video waits and
shows "computing the simulation …" until it has caught up. The design, its
measurements and the plan are in [docs/interactive-video.md](docs/interactive-video.md).

## Quick start

```bash
npm install                      # esbuild (build) and Playwright (tests, export)
npm run dev                      # http://localhost:5173/?video=part-0 (or part-1, atlas, bundles, interactions, covariance, retention), /explorables/torus-flow.html
npm run build                    # dist/<id>.html: one self-contained file per video; dist/explorables/
npm test                         # Node tests of the models, then the smoke test (below)
```

The smoke test renders every scene of every video and fails on any error. For
live scenes it also checks that a frame looks the same however it is reached
(jumping there, jumping back, or playing up to it) and that every control
renders at its extremes. It fails if anything under `src/videos` reads the clock
or unseeded randomness, and it runs every explorable for 1 s (failing on
uncaught exceptions).

`npm test` needs Playwright's Chromium (`npx playwright install chromium`). For
a quick smoke run in an installed Google Chrome instead, use
`PLAYWRIGHT_CHANNEL=chrome npm test`.

Export a high-quality video (needs `ffmpeg` and `npx playwright install chromium`):

```bash
npm run build
npm run export -- --video part-0 --fps 60 --width 1920 --mp4 part-0.mp4
npm run export -- --video part-1 --from 219 --to 257 --mp4 problem-3.mp4   # just one part
```

`--from` and `--to` are in seconds; the start time of each scene is shown in the
chapter list and available as `window.video.scenes` in the browser console.

To look at a video before exporting it, `scripts/review-frames.mjs` renders frames of
a built video to PNGs and reports how fast each narration cue has to be read:

```bash
PLAYWRIGHT_CHANNEL=chrome node scripts/review-frames.mjs --video retention --scene 6 --every 5
```

## How it is organised

```
index.html              player page (stage, controls, MathJax and font loading)
styles/player.css       player page styles
src/
  app.js                mountVideo(video): timeline, player, heading, export hooks
  main.js               development entry: picks a video from ?video=
  kit.js                everything a scene needs, in one import
  engine/               timeline, player, recorder, timing helpers, seeded RNG;
                        live scenes: controls, seekable simulations, LiveView (what one viewer sees)
  draw/                 theme, text, shapes, TeX, widgets, plots, molecule view, 3D surfaces
  model/                molecule, camera, rotations, energy, zero-momentum dynamics, data
  videos/
    common/             pieces shared by several videos
    part-0/             meta.json, index.js (the scene list), scenes/, and helpers
    part-1/             the same for Part 1
    atlas/              the same, plus torusFlow.js (the simulation) and torusViews.js (its drawing)
    bundles/            the same, plus beads.js (extra beads of associated bundles); reuses Part 0's plane bundle
    interactions/       the same, plus toy.js, data.js (everything computed at load), diagram.js (the master diagram)
    retention/          the same, plus math.js (the harmonic coordinate, the two-basin line, the flow identity, the circle)
                        and toy.js (the bond–torsion toy and its information-retention engine)
explorables/            standalone interactive pages, copied to dist/explorables/ by the build
tests/                  Node tests of models (node --test)
docs/                   design notes
scripts/                dev server, build, smoke test, frame export
```

The layers depend downwards only: `videos → kit → draw / model → engine`.

## Core ideas

**A scene is a pure function of time.** `draw(ctx, t)` gets the scene's local
time in seconds and draws that frame. Nothing is stored between frames, so any
moment can be rendered at any time. That is what makes scrubbing and frame-exact
export work. Random quantities are drawn once from fixed seeds.

**Everything is drawn in stage units, 1600 × 900.** The player scales the canvas
to the screen; the exporter renders at any resolution.

**Timing is written with four helpers** from `engine/timing.js`:

| helper | meaning |
| --- | --- |
| `seg(t, a, b)` | eased 0 → 1 between `a` and `b` (fades, moves) |
| `fade(t, a, b, c, d)` | fade in over `[a, b]`, out over `[c, d]` |
| `lin(t, a, b)` | linear 0 → 1 (typewriter text, sweeps) |
| `oscillate(t, a, b, cycles)` | out-and-back sine motion between `a` and `b` |

**The timeline handles what every scene shares:** the background, the header
(eyebrow and title, faded in and out), and the dip to dark between scenes.
Set `continues: true` on a scene to flow straight on from the previous one.

**A live scene is a pure function of time and its inputs.** Its controls have
authored values over time, and its simulation advances in fixed steps from a
fixed seed. The engine computes the simulation state for time `t` and passes it
to `draw(ctx, t, { input, state })`, so the frame still depends only on `t`
unless the viewer takes over.

## Adding a scene

1. Create `src/videos/part-0/scenes/18-my-scene.js`:

   ```js
   import { defineScene, seg, fade, text, type, color, tex, drawMolecule, moleculeCamera, molecule } from '../../../kit.js';

   const EQUATION = tex(String.raw`G = K`, 'G = K'); // TeX, plus a plain-text fallback

   export default defineScene({
     name: 'My scene',                // chapter label
     duration: 12,                    // seconds
     narration: 'What the presenter says over this scene.',
     header: { eyebrow: '08 · NEXT STEP', title: 'A title for the scene' },

     draw(ctx, t) {
       drawMolecule(ctx, molecule.positions, moleculeCamera({ cx: 450 }), { opacity: seg(t, 0, 1) });
       EQUATION.draw(ctx, 900, 400, { size: 40, alpha: seg(t, 1, 2) });
       text(ctx, 'A note', 900, 480, { ...type.body, color: color.soft, alpha: fade(t, 2, 3, 10, 11) });
     },
   });
   ```

2. Add it to the scene list in `src/videos/part-0/index.js`.

## Adding a live scene

A live scene adds `controls`, a `sim` and optionally `beats`, `handovers` and
timed narration. `src/videos/atlas/scenes/01-flow.js` is the full example:

```js
import { defineScene, seg, slider, choice, drag } from '../../../kit.js';
import { simulation } from '../../../engine/simulation.js';

const sim = simulation({
  seed: 5, dt: 1 / 300, tick: 1 / 60,      // fixed step; statistics on a fixed tick
  uses: ['D'],                             // the controls the physics reads (levers)
  init: (rng) => ({ /* typed arrays */ }),
  step: (state, input, rng, dt) => { /* advance one step, using only rng for noise */ },
  onTick: (state, tick) => { /* smoothed statistics, trails */ },
  events: [[20, (state) => { /* a discrete change at 20 s */ }]],
});

export default defineScene({
  name: 'My live scene',
  duration: 40,
  narration: [[0, 'First line.'], [20, 'Second line, from 20 s.']],
  beats: [[20, 'Halfway']],
  handovers: [{ at: 30, prompt: 'Your turn: …' }],
  controls: {
    D: slider('Noise D', { min: 0, max: 1, value: [[0, 0.2], [19.5, 0.2], [20, 0.6]] }), // keyframes
    show: choice('Show', { a: 'one view', b: 'another' }, { value: 'a', lens: true }),     // a view control
    view: drag('Drag to rotate', { region: [40, 150, 700, 640] }),                          // stage units
  },
  sim,
  draw(ctx, t, { input, state }) {
    /* draw from t, input (control values) and state (the simulation at t) */
  },
});
```

Numbers ease from one keyframe to the next like `seg()`, so a sudden change
needs a holding keyframe just before it. Put the model in its own DOM-free
module so `tests/` can run it in Node.

## Adding a video

Create `src/videos/<id>/` with a `meta.json` (`id`, `title`, `heading`, `label`)
and an `index.js` that exports `{ ...meta, scenes, posterTime }`. Register it in
`src/main.js` for development; `npm run build` picks up every folder in
`src/videos/` automatically.

## Reusing styles and pieces

- **Colours, fonts and text styles** live in `draw/theme.js`. Spread a style and
  override what you need: `{ ...type.note, color: color.gold, align: 'center' }`.
  Colours carry meaning: soft / stiff in Part 1, vertical (gold) / horizontal
  (cyan) in Part 0. Keep them consistent.
- **Widgets** (`draw/widgets.js`): `card` (callout with typewriter body),
  `columnVector`, `rowVector`, `columnFrame`, `vectorRow`, `kBT`.
- **Plots** (`draw/plots.js`): `energyPlot`, `logDensityPlot`, and the tick and
  axis helpers they are built from.
- **Molecule** (`draw/moleculeView.js`): `drawMolecule` (opacity, per-atom alpha
  and size, bond progress, highlights, ghost outlines, springs), `arrow3`,
  `drawAxisTriad`, `moleculeCamera`.
- **3D** (`draw/surface.js`): shaded parametric surfaces (`drawSurface`, the
  torus), `polyline3` with hidden-segment culling, `polygon3` for tangent planes
  and tiles.
- **Formulas** (`draw/tex.js`): declare with `tex(source, fallback)` at module
  level. Use `draw` for a centred formula and `drawOnBaseline` to assemble a formula
  from parts that can be swapped, blurred, braced or moved independently (Part 1,
  scene 13). `curvedText` in `draw/text.js` bends a word along an arc.
- **Dynamics** (`model/rigidBody.js`): `zeroMomentumRotations` integrates the
  rotation of a body whose shape follows a path with L = 0: the holonomy of the
  mechanical connection. `model/rotation.js` has the matrix helpers.
- **Energy** (`model/energy.js`): a pairwise-spring potential that is exactly
  invariant under rigid motions.
- **Shared layout** (`videos/common`, `scenes/shared.js` in each video) keeps
  elements in place across cuts and across videos.

## Conventions

- One scene per file, numbered in playing order; the file's default export is the scene.
- Times inside a scene are literal seconds, written next to what they animate.
  Named constants are for values used more than once.
- No state between frames; derive everything from `t` (in a live scene, from `t`,
  `input` and the `state` the engine passes in).
- Keep `npm test` green before committing.

## Recording in the browser

The **Record WebM** button plays the video once at 1× and downloads a WebM
(when the page is served locally). Pausing, or touching a physics control,
stops the recording early. For final output prefer `npm run export`, which
never drops frames.

## Covariance · The geometry of fluctuations

A **30 min 30 s** animation, built on the same canvas timeline and player.
It starts from the statistical definition before introducing metrics, and
builds the local-to-global geometric argument explicitly. Open
`dist/covariance.html` after building, or choose **Covariance** in the local
player. `dist/covariance.mp4` is the narrated export, with English subtitles
and chapter markers; `dist/covariance.srt` also works as a separate subtitle
track. The MP4 uses the installed macOS Samantha voice. The HTML contains the
written narration, scrubbing, chapter navigation, and a width-ratio slider;
it does not embed the voice.

The 38 chapters follow this sequence:

1. **00:00** · Start with variance
2. **01:00** · One observation is one vector
3. **01:45** · Sample count is not dimension
4. **02:30** · Vectors, matrices, and eigenvalues
5. **03:15** · Calculate covariance from samples
6. **04:15** · Read the matrix entries
7. **05:00** · What every column means
8. **05:45** · Covariance in many dimensions
9. **06:45** · What an eigenvector actually is
10. **07:30** · Principal directions and ellipsoids
11. **08:15** · From a distribution to covariance
12. **09:15** · Does covariance determine a distribution?
13. **10:15** · Why covariance knows stiffness
14. **11:00** · Whitening is a change of units
15. **11:45** · Undoing numerical stiffness
16. **12:30** · Noise, scores, and loss
17. **13:15** · What covariance cannot tell you
18. **14:00** · Zoom from global to local
19. **14:45** · Why local and global covariance differ
20. **15:30** · Build the local covariance field
21. **16:15** · Local, not global
22. **17:00** · Long distances from local rulers
23. **17:45** · A bent cloud that is flat
24. **18:30** · Three meanings of curvature
25. **19:15** · What metric curvature means
26. **20:00** · From local units to global coordinates
27. **20:45** · Curvature you can see
28. **21:30** · Zoom into curvature itself
29. **22:15** · A 2D distribution lifted into 3D
30. **23:15** · The full projected histogram
31. **24:15** · A histogram of the projection
32. **25:00** · The pullback equals inverse covariance
33. **25:45** · A distribution family with the same property
34. **26:45** · What the correction removes
35. **27:30** · Covariance itself as the metric
36. **28:15** · Does the manifold become visible?
37. **29:00** · Avoiding the wrong conclusion
38. **29:45** · The three takeaways

### Mathematical contract of the new animation

The opening defines variance before covariance. The observations 1, 2, 4, 5
have mean 3, centered deviations −2, −1, 1, 2, empirical variance 2.5, and
standard deviation √2.5 ≈ 1.58. Square areas make the squared deviations
visible. The empirical law assigns mass 1/n to each observation; the usual
1/(n−1) correction estimates population variance without bias for independent,
identically distributed observations with finite variance.

Separate notation distinguishes n observations, d coordinates per observation,
and N atoms when discussing molecules. The data table has shape n×d; an
observation and an eigenvector each have d components but different roles;
covariance has shape d×d; an eigenvalue is one scalar variance. There are d
eigenvalues counted with multiplicity, regardless of n. The sample-count
animation recomputes the empirical 2×2 matrix as four observations become
eight and then twelve. Its size stays fixed while its entries change.

The distribution chapters compute exact population moments from a three-outcome
law with changing probabilities, then show that three distinct scalar laws have
the same mean 0 and variance 1: N(0,1), Uniform[−√3,√3], and equal masses at ±1.
Their probabilities of |Z|<1/2 are approximately 0.383, 0.289, and 0. Adding
the same independent standard-normal coordinate gives three distinct 2D laws
with covariance I₂. A finite-second-moment law determines covariance uniquely,
but the inverse map is many-to-one. Within the Gaussian family, mean and
covariance determine the law. Exactly the symmetric positive-semidefinite
matrices can occur as finite covariance matrices; zero eigenvalues are allowed.

All numerical examples are manufactured, dimensionless examples, **not measured
molecular results**. The harmonic example sets kBT = 1 and uses
Σ = diag(1, 1/25), so K = Σ⁻¹ = diag(1, 25). In physical units,
Σ = kBT K⁻¹ and G = Σ⁻¹ = K/(kBT). This is exact in a stable harmonic Gaussian
basin. It is not an identity for an arbitrary multimodal ensemble, an arbitrary
neighborhood covariance, or short-time trajectory increments.


The column chapter reads column j as the vector of all Cov(Xᵢ,Xⱼ), and
shows that multiplying Σ by the coordinate vector eⱼ selects this column.
It distinguishes these columns from principal eigenvectors. The eigenvector
chapter uses Σ = [[2,1],[1,2]], whose eigenvectors are (1,1)/√2 and
(−1,1)/√2, with eigenvalues 3 and 1. It explicitly animates an arbitrary input
v and its output Σv until they align. Covariance in the eigenvector basis is
diagonal; uncorrelated components need not be independent for non-Gaussian data.

The local-field chapter actually recomputes a weighted sample covariance at
every query point q. Weights are exp(−|xₐ−q|²/(2h²)), h=0.38. Centering uses
the weighted local mean μ(q), **not q itself**. The orange ellipse is the
computed covariance; the gold ring marks a neighborhood scale; blue ellipses
show estimates at three other query locations. This empirical estimator is
distinct from the later manufactured covariance field with an exact known
pullback metric. Translation invariance and positive definiteness of the
estimator are checked on a nondegenerate example.

The opening calculation uses four observations (1,1), (2,1), (4,3), (5,3),
with mean (3,2) and empirical 1/n covariance [[2.5,1.5],[1.5,1]]. The 12D
heatmap and projected histogram are computed from the same fixed 320 samples;
the reported projection variance is vᵀΣv. The filled-cloud versus ring
comparison standardizes the finite samples to exactly equal empirical
covariances. Equal covariance does not imply equal distributions.

For the neighborhood animation, angle is uniform on [−h,h] around a unit
circle, with isotropic independent noise variance ε², ε = 0.035. Writing
sinc(h) = sin(h)/h, the exact local mean radius is sinc(h), tangential variance
is (1−sinc(2h))/2 + ε², and normal variance is
(1+sinc(2h))/2 − sinc(h)² + ε². Thus the changing aspect ratio includes finite
window bending and the measurement noise floor. The global h=π covariance
is (1/2+ε²)I. Direct numerical quadrature independently checks these formulas.

The total-covariance example chooses twelve equally weighted component means
on a radius-two circle. Each component has radial standard deviation 0.12
and tangent standard deviation 0.5. The average within-component covariance
is 0.1322 I, the covariance of the means is 2 I, and the global covariance is
2.1322 I. These displayed matrices are population values, not estimates from
the finite illustrative scatter.

The path-length comparison uses the flat ribbon metric defined below, on the
entire domain. Between u=−1.7 and u=1.7 at v=0 in latent coordinates, the
valley path has metric length 3.4. The straight physical chord has length
1.7√(1+36·1.7²)+asinh(6·1.7)/6 ≈ 17.93. Numerical integration of the
quadratic metric along the chord independently checks this expression.
The global metric distance is an infimum of such path integrals, not a
single quadratic form using a global covariance.

The square-root integrability scene deliberately distinguishes the
nonclosing integral of one chosen coframe from an intrinsic curvature proof.
For the hyperbolic example, ω=(du,eᵘdv) gives a second-component loop gap
h(eᵇ−eᵃ). Nonintegrability of this particular frame alone would not exclude a
rotated integrable frame. The subsequent Levi-Civita holonomy supplies the
intrinsic obstruction. In the shrinking-loop scene the base u=−0.55 stays
fixed; width and height shrink together, and holonomy divided by metric area
remains exactly −1 while both numerator and denominator tend to zero.

For a constant metric, the display map is z = G¹ᐟ²(x−μ). Hence:

| Ruler | Display covariance | Displayed standard-deviation ratio |
| --- | --- | --- |
| G = I | Σ | r |
| G = Σ⁻¹ | I | 1 |
| G = Σ | Σ² | r² |

The last row uses fixed dimensionless Euclidean coordinates. In general,
covariance is contravariant: given background metric E, the corresponding
covariance-weighted length metric is **EΣE**. Writing G = Σ without declaring
that reference is not invariant under general coordinate changes. With K = Σ⁻¹,
the harmonic preconditioned rate matrix for this choice is Σ⁻², so the rate
condition number is the square of the original stiffness condition number.

The flat ribbon is F(u,v) = (u,v+b(u)), with b(u) = 0.48(u²−1.5) and latent
covariance C₀ = diag(1,σ²), σ = 0.16. Its **infinitesimal** local covariance field
is C = J C₀ Jᵀ, so

    ds² = dx² + (dy − b′(x)dx)² / σ².

The map z = (x,(y−b(x))/σ) is an exact global whitening map for this example.
This manufactured covariance field is not claimed to equal a finite-neighborhood
empirical covariance. Finite neighborhoods introduce curvature and sampling effects.

The genuinely curved example is G = diag(1,e²ᵘ), with C = G⁻¹.
For ds² = du² + f(u)²dv², Gaussian curvature is −f″/f, so here it is −1.
In the orthonormal frame (∂u,e⁻ᵘ∂v), parallel transport obeys dθ = −eᵘdv.
The loop runs from (a,0) to (b,0) to (b,h) to (a,h) and back, where
(a,b,h) = (−0.55,0.55,0.65). Its holonomy is exactly
−h(eᵇ−eᵃ) = −0.7516 radians, approximately −43.1°. The numerical integration
in the tests checks this against the analytic expression. Local whitening does
not remove that holonomy. The geodesic-separation curves show the exact Jacobi
fields sin(r), r, and sinh(r) for curvature +1, 0, and −1 with J(0)=0, J′(0)=1;
they describe infinitesimally neighboring geodesics, not arbitrary finite pairs.

The thin-ribbon comparison uses **local tangent views**, assembled along a
fixed centerline for explanation. It assumes local tangent/normal directions
are known and normalizes the tangential eigenvalue to one. The normal variance
is σ², so covariance weighting multiplies normal offsets by σ and reduces
their standard deviation to σ². It is not a global isometric embedding or an
algorithm that has recovered the manifold. Positive-definite metric changes
preserve local dimension; a zero-variance limit becomes degenerate and needs
restriction or regularization.

For the noising comparison xₜ = x₀ + √t N¹ᐟ²ε, the displayed signal fraction
is λ/(λ+tNᵢ). N = I erases stiff information first; N = Σ synchronizes it.
This is a constant-metric additive Gaussian toy. For varying G, intrinsic
Brownian motion has generator ½ΔG, not simply a drift-free coordinate SDE
with covariance G⁻¹. Its coordinate Itô drift is
bʲ = (1/(2√det G)) ∂ᵢ(√det G Gⁱʲ). A fixed probability law has volume density
ρG = ρdx/√det G. Physical Gibbs sampling and changing a target/loss alone require
their own explicit process and measure choices.

The interpretation follows the project's newer thermal-metric foundation in
`../pocs/manifold-scoremd/riemannian-generative/docs/theory/20-thermal-metric-foundations.md`
and the local learned-warp design note. External mathematical references:

- [Singer and Coifman, *Non Linear Independent Component Analysis with Diffusion Maps*](https://web.math.princeton.edu/~amits/publications/NLICA.pdf):
  inverse local covariance can undo a pushed-forward latent metric under the
  stated observation and latent-process assumptions.
- [Wendl, *Curvature in Riemannian Geometry*, Theorem 6.2](https://www.math.hu-berlin.de/~wendl/pub/connections_chapter6_2.pdf):
  vanishing Riemann curvature is equivalent to local Euclidean flatness. Local
  flatness alone does not provide a single global chart.

### Exact 2D-to-3D embeddings

For a **single constant positive-definite global covariance** C, the answer is
immediate: F(x) = (C⁻¹ᐟ²(x−μ), 0) embeds the 2D coordinates into a plane in
3D, with JᵀJ = C⁻¹. Its intrinsic curvature is zero. The following examples
are more informative because their covariance fields vary with position.

**1. A continuous elliptical distribution from a uniformly sampled ellipsoidal cap.**
Use semi-axes a=1.5, b=0.75, c=2, with

    h(x,y) = c√q,     q = 1 − x²/a² − y²/b²,
    F(x,y) = (x,y,h(x,y)),     x²/a² + y²/b² ≤ 0.8².

Let w=∇h. The exact local graph metric and projected covariance rate are

    G = JᵀJ = I + wwᵀ,
    C = G⁻¹ = I − wwᵀ/(1+|w|²).

The local surface-area factor is s(x,y)=√(1+|w|²). The normalized projected
density for uniform actual surface-area sampling is p(x,y)=s(x,y)/A, with
A=∫s dxdy ≈ 4.0912526392. The animation draws 20,000 accepted samples by
rejection sampling from uniform projected area, accepting in proportion to s.
It does **not** stretch a uniform spherical sample and assume that remains
uniform on the ellipsoid. Surface-area quadrature is checked against a refined
grid. The scatter displays a fixed subset of the same samples used in the
histograms.

The full projected histogram raises columns over all occupied cells of the
elliptical footprint. Their heights are count/(20,000 × projected bin area),
with a density axis and the constant surface density 1/A shown as a reference.
Boundary cells are clipped against a 1024-vertex polygon approximating the
ellipse; all 20,000 samples contribute. Using these same polygon areas, bar
volumes sum to 1 within floating-point precision. The largest density is about
1.023, below the displayed axis limit 1.2. Histogram height represents density,
not the cap's physical elevation. The following heatmaps retain the comparison
between projected-area and surface-area normalization.

The two histograms use identical 0.1×0.1 projected cells, counts, and color
scale. One divides by the cell's area inside the 2D support; the other divides
by the corresponding Euclidean surface area. Boundary-cell intersections are
integrated numerically, tiny slivers are omitted, and the image is clipped to
the elliptical support. Thus the latter estimates the constant 1/A, while the
former estimates the visibly varying s/A. Remaining irregularity is sampling
and quadrature error.

For the covariance identity, start with isotropic infinitesimal motion in an
orthonormal basis B of the 3D tangent plane. Orthogonal projection gives the
2×2 map P=dπ B. Projected increment covariance per unit time is C=PPᵀ.
Recovering a tangent vector from a projected displacement gives

    |δY|² = |P⁻¹δx|² = δxᵀP⁻ᵀP⁻¹δx = δxᵀC⁻¹δx.

This is exactly the pullback metric G. The display chooses P=C¹ᐟ², so
B=J C¹ᐟ² has orthonormal columns. It magnifies infinitesimal tangent increments,
not finite Brownian trajectories. Reflected intrinsic Brownian motion on the
cap has uniform surface-area equilibrium; the covariance-rate identity is an
interior statement. Its coordinate drift is the general ½ΔG drift, not the
sphere's special −x drift. A sample density by itself does not identify C:
the local fluctuation process is explicitly part of this example.

The ellipsoid's Gaussian curvature is positive and varies:

    K(x,y) = c² / {a²b² [q+c²(x²/a⁴+y²/b⁴)]²}.

The animation reports its value at the moving point rather than calling it
constant +1. Tests compare the embedding's finite-difference Jacobian Gram
matrix with C⁻¹, verify BᵀB=I, and check density normalization and distortion.
The earlier unit-sphere formulas remain as separate analytic regression tests;
they are not the stretched-cap formulas used in the final animation.

The graph pullback formula is explained in
[Brian Conrad's *Metric tensor on hypersurfaces*](https://math.stanford.edu/~conrad/diffgeomPage/handouts/graphmetric.pdf).
The ellipsoid density, inverse identity, and projection argument above are
derived directly from that graph geometry and isotropic tangent fluctuations.

**2. A distribution family with its own exact covariance field.**
Let X take values (1,0), (0,1), (0,0) with probabilities u, v, w=1−u−v,
where u,v,w>0. These are genuinely 2D observations. Their mean is (u,v), and

    C(u,v) = [[u(1−u), −uv], [−uv, v(1−v)]].

The explicit embedding of the **mean-parameter domain** is

    F(u,v) = 2(√u, √v, √w).

Its image is the positive octant of a sphere of radius 2, and

    JᵀJ = [[1/u + 1/w, 1/w], [1/w, 1/v + 1/w]] = C(u,v)⁻¹.

This is the categorical Fisher metric in mean coordinates. Its Gaussian
curvature is 1/4. The 3D surface represents a family of distributions, not an
embedding that turns the three possible observations of one fixed distribution
into a continuous surface. For means of n independent observations the exact
covariance is C/n, and the embedding √n F has pullback nC⁻¹ and curvature
1/(4n). Boundaries are excluded because the covariance becomes singular.

The square-root sphere construction is described in the primary implementation
and references in [Geomstats' categorical information geometry](https://geomstats.github.io/_modules/geomstats/information_geometry/categorical.html).
The tests independently compare a finite-difference Jacobian Gram matrix with
the inverse observation covariance at several interior parameter values.

### Reproduce and check

```sh
npm run build -- covariance
node --test tests/covariance.test.mjs
PLAYWRIGHT_CHANNEL=chrome node scripts/check-covariance.mjs
PLAYWRIGHT_CHANNEL=chrome node scripts/export-narrated.mjs --video covariance
```

The review script samples every narration cue and several additional moments
in every chapter, and saves full-size review stills. The narrated exporter streams frames to ffmpeg, writes a voice
track with a small pause around each narration cue, and adds subtitles and
chapters to the final MP4. Cue audio is resampled to 48 kHz, timestamps are
reset after tempo adjustment, and each slot is trimmed to an exact sample
count. The exporter verifies every slot's duration to prevent cumulative
narration drift. It requires macOS `say`, ffmpeg, and a Playwright
browser; omit `PLAYWRIGHT_CHANNEL=chrome` to use Playwright's Chromium. Export
options include `--width 1600`, `--fps 24`, and `--voice Samantha`.

## Retention · What the noise should keep

A **17-minute** video (12 scenes) that extends Part 1. Part 1 chose a metric G = K so that
noise, score and loss respect stiffness. This video asks what information geometry adds to
that choice and what it does not: a correction (thermal stiffness and the Fisher information
of the dynamics are different geometries), two criteria beyond covariance whitening
(*retention*: how information about bonds, widths, torsions and basin populations disappears
across noise levels; *representation*: whether the diffusion operator acts simply on the
functions the score model has to represent), the identities behind them, the bolder
conjectures that should stay separate, and three changes to the research programme. Open
`dist/retention.html` after building, or choose **Retention** in the local player; export
the narrated MP4 with `scripts/export-narrated.mjs --video retention`.

Everything on screen is computed from two small models, with no DOM, in
`src/videos/retention/math.js` and `toy.js`:

- **one harmonic coordinate** dX = −kX dτ + √(2D) dB, with the same diffusivity
  D = 1 Å²/ps and k = 400 /ps (bond) or 1 /ps (torsion), so the equilibrium widths are
  0.05 Å and 1 Å and κ = 400 as in Part 1;
- **a toy molecule** with a stiff bond r (Å) and a torsion φ on a circle with two basins
  (65 % at −1.0 rad, 35 % at 1.9 rad, width 0.35 rad), the bond's mean 0.015 sin φ Å and
  width 0.05 (1 + 0.2 cos φ) Å following the torsion; four observables (bond stretch, bond
  width, torsion within its basin, basin membership) and three noising channels (flat;
  local thermal widths; global covariance), passed through on an 80 × 56 grid;
- **the torsion cut open on a line** (two Gaussian basins) for the Gaussianising map
  φ = Φ⁻¹∘F, the operator L_W and the flow identity; and Brownian motion on the circle.

The scenes:

1. **00:00 · Title.**
2. **00:20 · Where Part 1 stopped** (75 s). Three problems, one fix G = K; the
   share-of-signal curves of the bond and the torsion slide onto one curve under whitening;
   the two open questions.
3. **01:35 · Two geometries, not one** (120 s). Exact paths of the two coordinates from
   one start; C_τ = v(1 − e^{−2kτ}), F_τ = 1/(v(e^{2kτ} − 1)) on a log–log plot against
   the thermal metric 1/v: thermal stiffness magnifies the bond, finite-lag Fisher
   information suppresses it. The stationary step statistic v(1 − e^{−kτ}) at 1 ps
   (bond: 100 % of its equilibrium width, torsion: 63 %) is what the learned warp fits: a
   finite-lag thermal construction, not an estimate of mobility.
4. **03:35 · Same word, three experiments** (80 s). F_τ = JᵀC⁻¹J + E[rrᵀ] for the
   dynamics; the posterior Fisher information α²/σ⁴ C^post and the slope of the posterior
   mean (drawn for the two-basin line at σ = 0.5); every Euclidean pullback as the Fisher
   metric of z = φ(x) + unit noise.
5. **04:55 · Information about what?** (85 s). The toy's density, the four observables,
   and the tilt p_θ ∝ p e^{θ·u} animated along each of them: a shift of the bond, a change
   of its width, a turn of the torsion inside its basin, a move of population between
   basins. I₀ = Cov(u).
6. **06:20 · What the noisy molecule still knows** (95 s). ∂_θ log p_{θ,t}(y) = E[u(X₀) | X_t = y],
   I_t = Cov(E[u | X_t]) and I₀ − I_t = E[Cov(u | X_t)]: a noisy point, its posterior
   cloud of clean configurations, the conditional means, and the split of I₀ into retained
   and erased as the noise grows. The Gaussian case v/(v + σ_t²) is Part 1's curve.
7. **07:55 · Retention curves** (115 s). R_t of the four observables against the noise
   multiplier under flat noise (bond first, torsion within its basin next, basin population
   last), local thermal widths (bond and within-basin torsion together, the basin at about
   three widths), and the global covariance (the within-basin torsion erased first). No
   linear rescaling aligns both torsion curves. A diagnostic, not a loss.
8. **09:50 · What the model must learn** (120 s). r = L_W u + G I⁻¹ u ⊥ u,
   Γ_SM = I⁻¹ + G⁻¹E[rrᵀ]G⁻¹, efficiency iff L_W u ∈ span(u). On the two-basin line: u = x
   under W = 1 (ratio 16.6), the Gaussianising map with W = 1/φ′² and u = φ (ratio 1.00,
   L_W φ = −φ exactly), and the other two cells of the table; the mobility is about 10⁶
   times larger in the barrier than in the basins.
9. **11:50 · Whitening the stiff conditional** (75 s). ξ = C(s)^{−1/2}(r − m(s)) carries the
   samples from the curved band to a straight one; m′ and c′ stay in the Jacobian's
   off-diagonal entry. Proposed, not established.
10. **13:05 · Why the loss norm is the noise covariance** (70 s). The data and a wrong
    model flow under the same diffusion; the drop in KL equals the integrated score error
    in the mobility norm (0.3446 against 0.3455 on the grid), and the terminal mismatch
    is what is left.
11. **14:15 · What this does not say** (85 s). Six claims with their status, and the
    counterexample: Brownian motion on the circle has zero Ricci curvature and a uniform
    stationary density, yet F_τ ~ 2e^{−τ} and τF_τ → 0.
12. **15:40 · Three changes, in order** (80 s). Retention curves in the assessment; maps
    evaluated jointly with the model; conditional stiff whitening with an explicit soft
    model; the physical density and force contract fixed throughout.

### Mathematical contract

`tests/retention.test.mjs` checks:

- erf, Φ and Φ⁻¹ against reference values; the harmonic coordinate's F_τ = J_τ²/C_τ with the
  short- and long-lag limits, the opposite rankings of 1/v and F_τ, the 1 ps step widths,
  and the exact sample paths' moments;
- the Gaussianising map sends the two-basin density to N(0, 1); L_W φ = −φ with W = 1/φ′²;
  the residual is orthogonal to u, E[(L_W u) u] = −G, the residual identity equals the
  sandwich formula in all four cells, only the matched pair has ratio 1, a single Gaussian
  with u = x is exactly efficient, and the mobility peaks in the barrier;
- the flow identity to 2 × 10⁻⁴; the circle's F_τ ≈ 1/τ and 2e^{−τ} with τF_τ decreasing
  to zero; Tweedie's slope dm/dy = C^post/σ² on the line;
- the toy grid is a distribution with the designed moments; the separable retention pass
  equals brute force and I₀ − I_t = E[Cov(u | X_t)] to 10⁻¹²; every curve runs from 1 to 0
  monotonically with the orderings the narration states; the eigenvalues of R_t lie in
  [0, 1] and do not change under a linear recombination of the observables; tilting along
  u_k moves E[u_l] by θ I₀[l][k] to first order; the posterior collapses to the point at
  tiny noise and to the whole distribution at huge noise; conditional whitening makes ξ
  standard normal with the coupling in its Jacobian.

The numbers on screen (k, D, the toy's basins and widths) are illustrative; the identities
are derived in the thesis's theory notes and the Sprint 11 review this video visualises.
