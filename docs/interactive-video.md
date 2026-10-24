# Interactive videos

Status: design note. Built so far: the standalone explorable `explorables/torus-flow.html`,
which the build copies to `dist/explorables/` and the smoke test loads. Everything else
described here (live scenes, levers, lenses, explore mode, snapshots) is planned.

## The question

The repository has two kinds of pieces, and they work in opposite ways.

- **Videos** are timelines of scenes. Each scene draws a frame as a pure function of its
  local time `t`. That one rule makes scrubbing, chapters and frame-exact MP4 export work:
  any moment can be drawn at any time.
- **Explorables** are live pages. The first one, *Torus flow, flattened*, shows why one flat
  chart cannot carry a flow on a torus. The atlas is this project's answer to that problem;
  the page itself does not show atlases yet.
  - Particles on the torus, in angle coordinates (θ, φ), follow the stochastic
    differential equation `dx = (D ∇log p + J/p) dt + √(2D) dW` with a constant current
    J = (j, j). Here p is the density in (θ, φ) relative to uniform: it has mean 1 on the
    coordinate square [0, 2π)². With this convention p stays fixed, the cloud circulates
    around both cycles of the torus (around the central hole and around the tube), and the
    net flux through any meridian is j/2π laps per particle per second. With p normalised
    to integral 1 instead, the same formula would give 2πj.
  - The same particles are shown on the flat coordinate square with glued edges, where
    they jump from one edge to the opposite one, and on a square with reflecting walls,
    where either the density or the circulation breaks.
  - The viewer changes the noise D, the current j and the wall rule, and watches two
    readouts: the distance to p and the lap rate.
  - The page integrates the equation frame by frame, uses unseeded randomness and draws
    the torus with WebGL. It cannot be scrubbed and cannot be exported to MP4.

All videos will be reworked. The question is whether interaction can live inside a video
without giving up what makes a video useful.

Requirements:

- A viewer can interact inside a narrated video.
- Scrubbing, chapters and narration keep working.
- Every video still exports frame-exactly to MP4, for talks and for supervisors. Where a
  viewer would interact, the MP4 shows an authored default.
- The drawing code is reused. Plain JavaScript, small, no framework, no new dependency.

## Options considered

| Option | Interaction | Scrub, chapters, MP4 | Cost |
|---|---|---|---|
| A. Keep explorables separate and link to them | yes, outside the video | only the video | none |
| B. Embed the page (iframe or WebGL) in a scene | yes | no: its state is not a function of time | small, but breaks the engine's rule |
| C. Screen-record the page into a scene | no | yes | small; loses the point of the page |
| D. Live scenes inside the timeline | yes | yes | an engine extension, plus a port of each explorable |

**Recommendation: D, the "playable video".** Until it exists, keep using A. That is what
this repository does today.

## The playable video

Left alone, a video plays as a complete narrated film. A *live scene* also declares
controls. The controls first play an authored performance: the sliders move on screen
while the narration demonstrates. The viewer can take them over at any moment.

**One rule.** A frame is a pure function of time, a fixed seed and the history of inputs
up to that time. During playback, scrubbing, export and tests that history is the authored
one, so the frame depends on time alone, as today. `window.video.frame(T)` always renders
the authored version.

**Two kinds of control.**

- A *lever* changes the simulated physics: the noise D, the current j or the wall rule.
  Touching one pauses the narration and starts explore mode (below), in which the
  simulation runs on under the viewer's settings.
- A *lens* changes only the view, such as rotating the torus or showing the target density
  instead of the particle histogram. A lens never pauses anything. A viewer's lens setting
  holds until the scene ends or the viewer presses "Reset view"; until then, authored
  keyframes for that lens are ignored.

Authored values are constants or `[time, value]` keyframes. A number eases from one
keyframe to the next like `seg()`, so a sudden change needs a holding keyframe just before
it. A choice switches at its keyframe.

**Explore mode.**

- It starts when the viewer touches a lever. Let t₀ be that moment.
- Narrative time freezes at t₀, so labels and fades stay put. Dips to dark and header fades
  are skipped while exploring.
- The simulation keeps running from the exact authored state at t₀, under the viewer's
  settings. Space pauses and resumes it. This is a new shortcut: the page has only a
  Play/Pause button.
- "Back to the video" returns to the narration at t₀ and shows the authored version again;
  lens settings are kept. Esc does the same outside fullscreen; in fullscreen the browser
  uses Esc to leave fullscreen first. Scrubbing or a chapter jump also leaves explore mode.

**Hand-overs.** A *hand-over* is an authored invitation ("Your turn: …") at a fixed time.
The player shows the prompt with a "Try it" button. If the viewer does nothing, playback
continues with the authored demo, exactly as in the MP4. Narration after a hand-over must
stay true whatever the viewer tried.

**Beats.** A *beat* is a named moment inside a long live scene. Beats appear as
sub-chapters, so one continuous simulation can span several chapters with the same
particles.

## Simulations inside a video

A stochastic scene owns a simulation that the engine advances.

- **Time.** The simulation uses a fixed step `dt` and an integer step index k, never the
  display's frame time. Authored inputs are evaluated at each step's own time k·dt. Video
  time maps to a step through one rule, `k = Math.floor(t / dt + 1e-6)`, so 30 and 60 fps
  exports see the same states. Viewer changes are stored by step index.
- **Randomness.** All noise comes from one seeded mulberry32 stream, the generator in
  `src/engine/random.js`. That generator will gain a way to read and restore its 32-bit
  state, which is saved with every snapshot.
- **Statistics.** Smoothed histograms, lap rates, trails and the sparkline update on a
  fixed 1/60 s tick of simulated time, so their smoothing means the same at any frame rate.
- **Snapshots.** Every 0.5 s the whole float64 state is copied exactly. Snapshots go into
  one shared, append-only store. The player, the export API and the tests each keep their
  own cursor, so they never disturb each other.
- **Seeking in the player.** A seek restores the nearest earlier snapshot and replays at
  most 0.5 s. If the snapshot exists, the seek runs synchronously; about 0.1–0.2 s is
  acceptable while scrubbing. A far jump into a part not yet computed shows a "computing"
  note and catches up over the next frames. During playback, the clock waits for the
  simulation.
- **Seeking through the export API.** `window.video.frame(T)` never shows the note. If T
  lies beyond the computed range, it simulates synchronously up to T, which can block for
  seconds. Export and the smoke test therefore need no change.
- **Warm-up.** The authored run is computed in small background chunks, but only after the
  viewer presses Play or scrubs. A page driven only through `window.video.frame` never warms
  up.
- **Authored events.** A scene can schedule discrete events, for example "at the walls
  beat, copy the glued cloud into the walled cloud and reset its statistics".
- **Teleports.** A teleport is a particle leaving one edge of the glued square and
  re-entering at the opposite edge. Teleports are logged when they happen inside a step;
  they cannot be recovered exactly from per-frame positions.

## Drawing

- Videos will not use WebGL. The torus is drawn by the existing painter's-algorithm
  approach in `src/draw/surface.js`, on a coarser mesh (64×24 to 96×36 cells instead of the
  page's 200×72). A video then needs no new library: it stays one file that loads only
  MathJax and fonts from CDNs, with fallbacks, and it exports headless.
- Each particle is binned into its mesh cell and drawn right after that cell. This is
  consistent with the painter's order, not an exact depth test; judge it by eye.
- The frame rates measured below used a typed-array painter written for the measurement,
  not the current `drawSurface`, which allocates objects for every vertex on every call.
  The prototype must measure the code path it ships, at the real canvas size (the player
  uses up to 2× device pixels). If it is too slow, either adopt the typed-array painter in
  `src/draw/`, or cap the canvas resolution during live scenes.

## Controls on the page

- The player builds an HTML control strip (sliders and segmented buttons) from the scene's
  `controls`. Fullscreen covers a wrapper that includes the strip; the canvas height then
  leaves room for the strip.
- Keys go to a focused control. Space on a slider or button must not toggle playback, so
  shortcuts check whether focus is inside the strip.
- Dragging on the canvas is mapped to stage units (1600×900) and feeds `drag` lenses. Live
  scenes set `touch-action` on the canvas so that dragging does not scroll the page on a
  phone.
- Everything an MP4 viewer needs is drawn on the canvas by the scene: the values of D and j,
  the wall rule, the readouts and the sparkline.
- The export API changes from `frame(T, width, height)` to `frame(T, width, { height, view })`.
  No caller in the repository passes a height today. Without `view` it renders the
  authored version.
- Entering explore mode stops an in-browser WebM recording, as pausing does today.

## Scene sketch

```js
export default defineScene({
  name: 'A flow that will not flatten',
  duration: 100,
  header: { eyebrow: '01 · WHY AN ATLAS', title: 'A flat square holds the density, not the flow' },
  narration: [[0, 'The cloud circulates, yet its density stays p.'], [16, 'Cut the torus open …'], [46, 'Now real walls …']],
  beats: [[16, 'Cut open'], [46, 'Walls'], [66, 'Your turn']],
  controls: {
    D: slider('Noise D', { min: 0, max: 0.6, step: 0.01, value: [[0, 0.15], [69.5, 0.15], [70, 0.4]] }),
    j: slider('Current j', { min: 0, max: 1.2, step: 0.05, value: 0.5 }),
    walls: choice('Without gluing', { keep: 'keep the rule', drop: 'drop the current' }, { value: [[0, 'keep'], [70, 'drop']] }),
    show: choice('Square shows', { target: 'target p', hist: 'histogram' }, { value: 'target', lens: true }),
    view: drag('Drag to rotate', { region: [40, 150, 700, 640], lens: true }),
  },
  handovers: [{ at: 66, prompt: 'Your turn: make the walled square match p and still circulate.' }],
  sim: torusFlow,
  draw(ctx, t, { input, state }) {               // t: choreography; state: supplied by the engine
    const cam = { yaw: 0.25 + 0.15 * t + 0.006 * input.view[0], pitch: 0.95 + 0.004 * input.view[1] };
    drawFlowTorus(ctx, state.glued, cam, { x: 40, y: 150, w: 660 });
    drawChart(ctx, state.glued, { x: 760, y: 170, side: 360, glued: true, show: input.show, alpha: seg(t, 16, 17) });
    drawChart(ctx, state.walled, { x: 1180, y: 170, side: 360, glued: false, show: input.show, alpha: seg(t, 46, 47) });
    drawReadouts(ctx, state, input, { x: 760, y: 590, alpha: seg(t, 18, 19) });
  },
});

export const torusFlow = simulation({
  seed: 5, dt: 1 / 300, tick: 1 / 60, snapshotEvery: 0.5,
  uses: ['D', 'j', 'walls'],                       // lens changes never re-simulate
  init: (rng) => createFlow(rng, 3000),           // both clouds from one sample of p, as on the page
  step: (s, input, rng, dt) => stepFlow(s, input, rng, dt),
  onTick: (s) => updateStats(s),                  // smoothed histogram, TV, lap rate, trails, sparkline
  events: [[46, (s) => copyCloud(s.glued, s.walled)]],
});
```

Existing scenes need no change. The timeline already passes a third argument to `draw` that
no scene reads. It becomes `{ input, state }`, and scenes without controls receive
`{ input: {}, state: null }`.

## From the torus page to a live scene

| Page | Live scene |
|---|---|
| Play / Pause button | the player's transport; Space in explore mode |
| Noise D and current j sliders | levers |
| Walls: keep the rule / drop the current | lever (choice) |
| Square shows target p / histogram | lens (choice) |
| Drag to rotate; slow auto-rotation | `drag` lens; yaw grows by 0.15 rad/s |
| Resample from p | later: an explore-only action that reseeds |
| Lede and captions | narration cues |
| The three argument columns and the equation | a static scene with formulas |
| Readout table and 30 s sparkline | drawn on the canvas from the simulation's statistics |
| three.js torus | painter's-algorithm torus with binned particles |

Port specification:

- **Constants.** K = 1.25, L = 0.6, phase π/3, θ₀ = 2, N = 3000 particles, 14 tracers,
  24×24 histogram bins, torus radii R = 1 and r = 0.42.
- **Normalisation.** p = exp(log p)/A, where A ≈ 1.5621367 is the mean of exp(log p) over
  the square. The drift uses J/p with this p.
- **Per-frame values become per-time values at 60 fps.** 5 substeps per frame become
  dt = 1/300. The smoothing factors 0.04 (histogram) and 0.985 (lap rate) apply per 1/60 s
  tick. Trails keep 2.5 s. The sparkline samples every 3 ticks and keeps 30 s. A teleport
  marker lives 1.1 s. The rotation of 0.0025 rad per frame becomes 0.15 rad/s.
- **Model checks.** The page steps with the display's frame time, so its readouts depend on
  the refresh rate. The port is checked against theory instead, at a fixed seed with
  D = 0.15 and j = 0.5:
  - the glued lap rate, averaged over a stated window after a stated burn-in, is close to
    j/2π ≈ 0.080;
  - the glued distance to p stays near the sampling floor, defined as the distance of an
    independent 3000-point sample of p smoothed the same way (about 0.06);
  - in drop mode, the walled distance relaxes to the same floor and the lap rate to 0.
  The window, burn-in and tolerances are fixed from the floor measurement before the port
  is run.

Distance to p is the total-variation distance between the smoothed 24×24 particle
histogram and p on the same bins: 0 means identical, 1 means no overlap. What a storyboard
has to account for, measured with a faithful port of the page (seed 5, D = 0.15; j eased
from 0.5 to 1.0 over 32–35 s; walls kept until 70 s, then dropped):

- With the rule kept, the walled cloud piles up against the walls within about 15 s
  (distance 0.41 at 5 s, 0.85 at 16 s). Restart it from the glued cloud at the beat where
  its panel appears, so the viewer sees the pile-up.
- After the drop at 70 s, the walled cloud relaxes slowly: the distance falls from 0.98 to
  0.32 by 100 s. With D raised to 0.4 at the drop, it reaches 0.07 by 100 s, close to the
  floor. The lap rate briefly goes negative during the relaxation.
- Meanwhile the glued cloud stays at the floor (0.05–0.06), with a lap rate of 0.160
  against j/2π = 0.159 at j = 1.0.

## Scrubbing, chapters, narration, export, tests

- **Scrubbing** works everywhere; inside a live scene it is limited by the seek time above.
- **Chapters** stay one per scene, plus beats as sub-chapters.
- **Narration** is one string per scene, as now, or `[time, text]` cues for long live
  scenes. While exploring, the panel shows the prompt and how to return.
- **MP4.** `scripts/export-frames.mjs` stays unchanged. Export renders frames in order, so
  the simulation only advances, and hand-overs play their authored demo. Later additions:
  exporting a viewer's recorded session, subtitles from the narration cues, and a talk mode
  for the defence that stops at each scene end like slides.
- **Determinism** is bit-exact within one browser engine. Playwright's Chromium, pinned
  through `package-lock.json`, is the reference for export and frame comparisons.
  `PLAYWRIGHT_CHANNEL=chrome` runs the smoke test in an installed Google Chrome, which is
  fine for smoke runs but not for frame comparisons. Between Node and Chromium (both use the
  V8 engine), runs differed only below the displayed precision over 60 s; over minutes the
  walled cloud drifted by up to about half a pixel. Other browser engines have not been
  measured.
- **Tests.** Items 1–4 go into the smoke test, item 5 is a Node test:
  1. Jumping straight to a frame gives the same picture as playing up to it.
  2. Rendering the middle, then the end, then the middle again gives identical frames.
  3. Every lever renders at its extremes.
  4. No `Math.random`, `Date.now` or `performance.now` under `src/videos`.
  5. The model checks above. Model files import only DOM-free modules (`engine/random.js`,
     `engine/timing.js`), and `npm test` also runs `node --test`.

  Comparing frames before and after an engine change needs fonts and formulas settled
  (`await window.video.ready`), a controlled network and the same browser build.

## Measured feasibility

A faithful port of the page's simulation was written outside this repository and measured
on an Apple M4 Pro with Node 24 and headless Chromium 148. Firefox, Safari, slower laptops
and phones were not measured. The prototype must re-measure on its own code and on the
pinned Chromium. A *frame* below means 1/60 s of simulated time: 5 steps of both clouds.

- **Reproducibility.** Re-runs and resumes from snapshots were bit-identical, including the
  smoothed statistics, trails and sparkline. A step-stamped log of parameter changes also
  replayed bit for bit.
- **Cost.** 2.3 ms per frame in Chromium and 3.5 ms in Node: about 7× and 5× faster than
  real time. The first pass over a 60 s scene takes 8–13 s.
- **Seeking** (Node). With snapshots every 1 s, the worst-case seek was about 210 ms.
  Spacing them every 0.5 s should halve that to about 100 ms (derived, not measured).
- **Memory.** A full snapshot is about 184 kB, so about 22 MB per simulated minute at 0.5 s
  spacing. Snapshots of particles and histograms only (105 kB), plus a small per-tick
  record of tracers and readouts, need about 14 MB.
- **Precision.** float32 copies of a float64 state break exact continuation.
- **Drawing at 1080p** with the typed-array painter, on the GPU: 200×72 cells about 50 fps
  (drawing only; 35 fps in software); 96×36 cells about 100 fps including one frame of
  simulation (64 fps in software).
- **Across engines.** Node and Chromium differ in the last bit of sin, cos and log for
  1.6–3.2% of inputs; see Determinism above for the effect on the picture.
- **Random-number period.** mulberry32 repeats after 2³² draws: about 10 minutes of
  simulated time at this draw rate.

## Plan

1. **Now (done).** The page lives in `explorables/torus-flow.html`, unchanged apart from
   three text corrections in its readout table and argument columns. The build copies it
   to `dist/explorables/`, and the smoke test fails if it throws. Share it by sending the
   built file (the 3D view needs a network connection for three.js) or a screen recording.
2. **Prototype.** One live scene, in a new `atlas` video.
   - Engine: levers, one drag lens, explore mode, keyframed inputs evaluated per step,
     snapshots, a generator with saveable state, beats and a hand-over prompt.
   - The torus geometry stays local to the new video; Part 0 is not touched.
   - Deferred: session export, "copy as keyframes", crossfades, talk mode, subtitles.
   - Acceptance: existing videos render identical frames; the new tests pass; the port
     passes the model checks; at least 60 fps while playing in Chromium at the real canvas
     size; seeks within about 150 ms once warm-up is done; two MP4 exports are identical.
3. **Rework.** The deferred features; a static scene with the page's three arguments and
   its equation; an atlas payoff scene; lenses and levers on existing scenes (the Part 0
   torus scenes, the connection tilt, the holonomy twist); live scenes for flow-matching
   transport and for chart transitions.

## Open questions

- **Shared noise.** Should both clouds use the same noise? With shared noise they move in
  lockstep until a particle meets a wall, so only the boundary rule differs. With
  independent noise, as on the page, they also differ by chance. Decide before the
  prototype, because it fixes the order of random draws.
- **Snapshot layout.** Full snapshots (about 22 MB per simulated minute) or lean ones
  (about 14 MB)? Choose lean if a scene's snapshots would not fit a modest memory budget on
  a laptop.
- **Long exploration** is limited by the random-number period. Cap explore sessions, or use
  a generator with a longer period?
- **Look of the 3D view.** Is the painter's-algorithm torus good enough next to the WebGL
  page?
- **Atlas payoff scene.** The walled square is a simply connected piece of ℝ² with no-flux
  walls, so it cannot carry the winding current. In an atlas, overlapping charts replace
  the single glued square: a particle is re-expressed in the next chart while it is inside
  the overlap, where both charts are valid, so no step ever runs into an edge or a wall.
  - Two annular charts already cover the torus, for example two overlapping θ-intervals
    times the φ-circle. Both necessarily go around the same cycle, so each carries
    circulation around that cycle only. The winding around the other cycle, which the lap
    rate measures, passes from chart to chart through the transition maps; on one overlap
    the transition map is the same shift θ ↦ θ + 2π that the glued square draws as a jump.
  - Disk-shaped charts need at least three. The cup product of the two circle classes is
    non-zero, and a cover by two contractible open sets would force it to vanish. This is
    the cup-length bound on the Lusternik–Schnirelmann category, counted as the number of
    sets. The argument has not been checked against a written source.
  - The scene should say which chart layout it shows and use the terms of the thesis's
    atlas library (atlasgeo).
- **Keeping settings.** Should a viewer's lever settings survive "Back to the video"? Not in
  the first version, because the narration could then contradict the screen.
