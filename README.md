# Thesis visualization: the geometry of molecular diffusion

Animated explainer videos built to help me visualise my master's thesis.

I built this project to help me visualise the ideas behind my master's thesis on
diffusion models for generating molecular configurations. The thesis argues
that these models should not add noise, predict scores and measure errors in
flat Euclidean coordinates, but in a geometry that knows how stiff each
direction of a molecule is. Equations make that argument precise; these
animations are meant to make it intuitive.

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

Each video runs in the browser as an interactive player with chapters, scrubbing
and narration, and can be exported frame by frame to MP4. Everything is plain
JavaScript on a 2D canvas, with MathJax for the formulas and no framework.

## Quick start

```bash
npm install                      # esbuild (build) and Playwright (tests, export)
npm run dev                      # http://localhost:5173/?video=part-0 (or part-1)
npm run build                    # dist/part-0.html, dist/part-1.html: one self-contained file per video
npm test                         # renders every scene of every video headless, fails on errors
```

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
  engine/               timeline, player, recorder, timing helpers, seeded RNG
  draw/                 theme, text, shapes, TeX, widgets, plots, molecule view, 3D surfaces
  model/                molecule, camera, rotations, energy, zero-momentum dynamics, data
  videos/
    common/             pieces shared by several videos
    part-0/             meta.json, index.js (the scene list), scenes/, and helpers
    part-1/             the same for Part 1
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
- No state between frames; derive everything from `t`.
- Keep `npm test` green before committing.

## Recording in the browser

The **Record WebM** button plays the video once at 1× and downloads a WebM
(when the page is served locally). Pausing stops the recording early. For final
output prefer `npm run export`, which never drops frames.
