# Interactive videos

Status: steps 1 and 2 of the [plan](#plan) are built. The standalone explorable
`explorables/torus-flow.html` is in the build and the smoke test, and the prototype engine
(live scenes, levers, lenses, explore mode, snapshots) runs one live scene in the `atlas`
video; [Prototype results](#prototype-results) records what was measured. Session export,
talk mode and the other step-3 features are still planned.

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

- It starts when the viewer touches a lever. Let t₀ be that moment, but no earlier than the
  scene's `exploreFrom` (the time its content has faded in).
- Narrative time freezes at t₀, so labels and fades stay put. Dips to dark and header fades
  are skipped while exploring.
- The simulation keeps running from the exact authored state at t₀, under the viewer's
  settings. If the authored run has not reached t₀ yet (after a far jump), the branch starts
  once it has, with the "computing" note meanwhile; the page never blocks. Space pauses and
  resumes it. This is a new shortcut: the page has only a Play/Pause button.
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
  `src/engine/random.js`, whose 32-bit state (`getState`/`setState`) is saved with every
  snapshot.
- **Statistics.** Smoothed histograms, lap rates, trails and the sparkline update on a
  fixed 1/60 s tick of simulated time, so their smoothing means the same at any frame rate.
- **Snapshots.** Every 0.5 s the whole float64 state is copied exactly. Snapshots go into
  one shared, append-only store. The player, the export API and the tests each keep their
  own cursor, so they never disturb each other.
- **Seeking in the player.** A seek restores the nearest earlier snapshot and replays at
  most 0.5 s. If the snapshot exists, or the cursor is less than 0.5 s behind, the seek runs
  synchronously. A far jump into a part not yet computed shows a "computing" note and
  catches up within 10 ms per frame (14 ms while it is catching up). During playback, the
  clock waits for the simulation.
- **Seeking through the export API.** `window.video.frame(T)` never shows the note. If T
  lies beyond the computed range, it simulates synchronously up to T, which can block for
  seconds. Export and the smoke test therefore need no change.
- **Warm-up.** The authored run is computed in small background chunks, but only after the
  viewer presses Play or scrubs. A page driven only through `window.video.frame` never warms
  up. While the player is itself catching up, the warm-up waits, because both would compute
  the same steps from the same snapshot.
- **Authored events.** A scene can schedule discrete events, for example "at the walls
  beat, copy the glued cloud into the walled cloud and reset its statistics".
- **Teleports.** A teleport is a particle leaving one edge of the glued square and
  re-entering at the opposite edge. Teleports are logged when they happen inside a step;
  they cannot be recovered exactly from per-frame positions.

## Drawing

- Videos do not use WebGL. The atlas video draws the torus with a painter's algorithm of its
  own (`src/videos/atlas/torusViews.js`): a 96×36 mesh whose geometry and colours are
  computed once, with only rotation, projection, depth sort and shading per frame. The
  existing `drawSurface` allocates objects for every vertex on every call, which was too
  slow for this. A video still needs no new library: it stays one file that loads only
  MathJax and fonts from CDNs, with fallbacks, and it exports headless.
- Each particle is binned into its mesh cell and drawn right after that cell. Seams, trails
  and tracer heads are drawn in depth layers inside the same loop, so the near side of the
  torus hides them at any viewing angle.
- The repository's camera has its depth axis pointing away from the viewer, so the torus is
  drawn as the mirror image of the WebGL page (Part 0 uses the same convention).

## Controls on the page

- The player builds an HTML control strip (sliders and segmented buttons) from the scene's
  `controls`. Fullscreen covers a wrapper that includes the strip; the canvas height then
  leaves room for the strip's measured height.
- Enter and arrow keys go to a focused control. Space goes to a button only when it was
  focused from the keyboard, so that it presses the button. Otherwise Space keeps its player
  meaning (play/pause, or pause the explore simulation), also right after a slider or button
  was clicked with the mouse, which leaves the focus on it.
- A viewer's lens settings hold until the scene ends or "Reset view".
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

The sketch below was written before building. The built scene,
`src/videos/atlas/scenes/01-flow.js`, follows it but differs in details: the camera, the
restart at 46 s (`restartWalled`), `exploreFrom`, and the narration.

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
- **Model checks** (`tests/torus-flow.test.mjs`). The page steps with the display's frame
  time, so its readouts depend on the refresh rate. The port is checked against theory
  instead, with thresholds fixed before it was first run: seed 5, D = 0.15, j = 0.5, a 10 s
  burn-in and a 30 s window, lap rates from the net meridian crossings over the window.
  - The glued lap rate is within 10 % of j/2π ≈ 0.080.
  - The glued mean distance to p is at most TV₀ + 0.02, where TV₀ comes from the same run
    with j = 0: a reversible process with stationary law p and the same noise, particle
    count and smoothing. (An independent 3000-point sample of p would understate this
    floor, because the particles move only a little from one tick to the next.)
  - With the rule kept, the walled distance ends above 0.5 and its lap rate stays within
    ±0.005; with the current dropped from the start, its mean distance is at most
    TV₀ + 0.02 and its lap rate within ±0.005.
  - Re-runs, and seeks through snapshots across a scheduled event, are bit-identical.

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

## Prototype results

The atlas video's live scene, measured on an Apple M4 Pro with Node 24 and headless Google
Chrome 155 (driven by Playwright 1.64 through `PLAYWRIGHT_CHANNEL=chrome`; Playwright's own
pinned Chromium was not installed). Firefox, Safari, slower machines and phones were not
measured.

| Check | Result |
|---|---|
| Existing videos unchanged | all 102 checked frames of Part 0 and Part 1 (start, middle and end of every scene, offline) are byte-identical to `main` |
| Model against the page | positions, histograms, readouts, trails, sparkline and teleport markers bit-identical over 60 s with changing D, j and wall rule; only the three deliberate changes (seeded noise, fixed step, fixed tick) were applied |
| Model checks (`node --test`) | glued lap rate 0.0798 against j/2π = 0.0796; glued mean TV 0.062 against 0.067 for the reversible reference (j = 0); walled TV 0.95 after the pile-up; walled with the current dropped: mean TV 0.068 and lap rate 0.0006 |
| Seeking does not change the picture (smoke test) | the frame in the middle of the live scene is identical whether jumped to cold, jumped back to, or played up to in uneven steps |
| Playback | 60 fps, about 5 ms of JavaScript per frame (95th percentile 6 ms), at canvas widths of 1238 and 2476 pixels |
| Explore mode | about 5 ms per frame |
| Seeks once computed | worst frame 19–24 ms |
| Far jump into an uncomputed part | 4–5 s until the picture has caught up 20–30 s into the scene, with the "computing" note; the page stays responsive (a lever touch returns in under 1 ms) |
| Export | two full exports at 30 fps (3210 frames) identical frame for frame, and the two MP4 files byte-identical; the 30 fps frames equal the 60 fps frames at the same times (121 of 121) |
| Interaction | 24 scripted checks in Chrome pass: entering and leaving explore mode, Space and Esc, lens behaviour, the hand-over, dragging, beats, narration cues; fullscreen leaves room for the strip at 1280×800, 1920×1080 and 390×844 |

Decisions made while building, and known limits:

- **Teleport markers.** The ring holds 256 markers, not 64: up to 155 were measured alive at
  once (86 at the page's defaults).
- **Restarting the walled cloud** at 46 s also clears its sparkline history, which nobody
  saw.
- **Controls.** Every control is either a lever (listed in the simulation's `uses`) or a
  lens; `defineScene` rejects anything else.
- **Noise.** The two clouds keep independent noise, as on the page.
- **Snapshots** hold the full state, about 200 kB each, so about 40 MB for the 100 s scene.
- **A weak model check.** The walled lap rate with the current kept must stay below 0.005.
  It passes at seed 5 (0.0048) but would fail at 2 of 7 seeds, because on the walled square
  that number only measures the pile-up still finishing. The threshold was fixed before the
  port was run and is kept; a better check is listed under Rework.
- **Wording.** After a scientific review the narration says that a flat square keeps the
  density but never the flow, the readouts call 0.06 a noise floor rather than a sampling
  floor, and a footnote explains that the walled lap number only counts mass moving between
  the square's halves.

## Plan

1. **Now (done).** The page lives in `explorables/torus-flow.html`, unchanged apart from
   three text corrections in its readout table and argument columns. The build copies it
   to `dist/explorables/`, and the smoke test fails if it throws. Share it by sending the
   built file (the 3D view needs a network connection for three.js) or a screen recording.
2. **Prototype (done).** One live scene, in a new `atlas` video.
   - Engine: levers, one drag lens, explore mode, keyframed inputs evaluated per step,
     snapshots, a generator with saveable state, beats and a hand-over prompt.
   - The torus geometry stays local to the new video; Part 0 is not touched.
   - Deferred: session export, "copy as keyframes", crossfades, talk mode, subtitles.
   - Acceptance, all met (see [Prototype results](#prototype-results)): existing videos
     render identical frames; the new tests pass; the port passes the model checks; at least
     60 fps while playing in Chromium at the real canvas size; seeks within about 150 ms
     once warm-up is done; two MP4 exports are identical.
3. **Rework.** The deferred features; a static scene with the page's three arguments and
   its equation; an atlas payoff scene; lenses and levers on existing scenes (the Part 0
   torus scenes, the connection tilt, the holonomy twist); live scenes for flow-matching
   transport and for chart transitions. Also: lean snapshots, a faster simulation step
   (the Gaussian draws dominate its cost) to shorten the catch-up after a far jump, and a
   walled-square check that measures circulation rather than the end of the pile-up.

## Open questions

- **Shared noise.** Should both clouds use the same noise? With shared noise they move in
  lockstep until a particle meets a wall, so only the boundary rule differs. With
  independent noise, as on the page and in the prototype, they also differ by chance.
  Changing it changes the order of random draws, so every frame of the live scene.
- **Snapshot layout.** Full snapshots (about 24 MB per simulated minute in the prototype)
  or lean ones (about 14 MB)? Choose lean if a scene's snapshots would not fit a modest
  memory budget on a laptop or phone.
- **Long exploration** is limited by the random-number period. Cap explore sessions, or use
  a generator with a longer period?
- **Look of the 3D view.** Is the painter's-algorithm torus good enough next to the WebGL
  page? It is drawn as the page's mirror image (see Drawing); mirroring the world would
  change every torus in the repository.
- **Busy glued square.** A tracer hovering at an edge leaves stacks of teleport markers,
  as on the page. Thin them out?
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
