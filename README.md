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
npm run dev                      # http://localhost:5173/?video=part-0 (or part-1, atlas), /explorables/torus-flow.html
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
