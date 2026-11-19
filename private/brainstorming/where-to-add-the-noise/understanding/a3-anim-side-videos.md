# a3 · The side videos as a source of technique: what exists, how it is made, what to reuse

Scope: the four videos under `private/other/` that are not about the thesis but share its engine and look:
- **From phase to force** (`u1-force`, draft PR #2);
- **The geometry of information** (`information-geometry`, draft PR #5);
- **The geometry of attention** (`attention`, draft PR #4);
- **LLMs beyond the chat window** (`llm-soc`, on `main`).

I read every README, PR description, `shared.js`, `space.js` and `math.js`, the scripts and tests, about twenty scenes in full and the headers of the rest, plus the archived sessions in which three of them were made (user feedback, review workflows). Nothing in the repo was changed. In an isolated scratchpad copy I built all four (163, 156, 149 and 132 kB self-contained pages). The maths suites pass (13, 13 and 16 tests), `render.mjs` reports no page errors, and I inspected 15 rendered frames.

## 1. Inventory

### 1.1 From phase to force (`u1-force`, PR #2): 12 scenes, 13:53, 9 live

The chain: U(1) bundle → connection → holonomy → curvature → stationary action → the phase in the action → the ribbon → m ẍ♭ = e F(·, U). All maths is in `math.js` (13 tests), the 3D pictures are in `space.js`, and the devices are in `shared.js`.

| # | scene (s) | controls | shown; computed objects |
|---|---|---|---|
| 00 | Cold open (18) | – | Charge circling in a uniform B, with a gold dial whose hand is the transported phase. A struck-through "no rope" tether; fibre rings fade in when "a circle over every point" is spoken; the title slides in. Uses `borisStep`, `cyclotron` and `transport`. |
| 01 | A circle over every point (50) | – | 3D floor; nine rings on stalks appear one by one; a point of P and its projection π; the middle row densifies into a glassy tube (a circle of circles); a dial for e^{iθ}; the "over here / over there ?" arc. Camera yaw drifts 0.4 → 0.9. |
| 02 | A rule for carrying a phase (65) | lens connection (flat / pure gauge / magnetic) | Tube over a bent road with the blue lift winding on it (hidden side dashed); plane with a dial field, a runner and the θ(s) graph; θ → θ − χ, ω → ω − dχ. |
| 03 | Two roads, one loop (75) | lever ε; drag the loop; lens pure gauge | Runners climb road 1 and road 2 = road 1 + εη with dials. At Q the dials fly right and superimpose, and the gold wedge shows Δθ = ∮ω. The narrator widens, flips and carries the loop over the hidden bump (+0.13 → −0.17). Under pure gauge the wedge stays closed. |
| 04 | Holonomy per area (95) | lever loop size; drag; lens cells | Δθ, area, Δθ/area and B(centre) meet on a number line. **The reveal**: B is painted violet/teal and the number line becomes its legend. Stokes on 1 → 24 cells: shared cuts dim in pairs, and Σ cell holonomies equals ∮ω "to every digit". Then the vertical axis is relabelled y → t. |
| 05 | Stationary action (55) | levers ε, t₀; lens straight / bent | Fan of paths and S = ∫½mẋ². The vertex of S(ε) stays at 0 wherever the nudge sits. |
| 06 | The gradient becomes the force (85) | lenses V (four potentials), ε, t₀ | dV as a stack of lines; the shot physical path; integration by parts once; the balance plot −V′η vs m ẍ η. |
| 07 | The phase joins the action (75) | lenses gauge, field | Stopwatch with two hands (½mẋ²/ħ and ω(U)); the reading depends on the gauge, the position on the fibre does not. |
| 08 | A nudge is a loop (85) | levers ε, t₀; lens gauge | Scene 03's roads become a worldline and its nudge. A sweeping element paints the ribbon with Ω(η, U) dt, and the dial disagreement equals the flux. |
| 09 | The force (90) | levers ε, t₀; lens physical / straight | Violet eF(η, U) and green m ẍ η cancel pointwise only on the physical path. The covector is drawn as a stack of lines parallel to U. |
| 10 | Tilt the velocity (95) | lens speed; levers charge, B sign (seeded Boris simulation) | Spacetime block with flux lines and a ribbon element; the lit 3×3 F_{νμ} table; the orbit with its ribbon flux computed two ways (0.175 vs 0.188, "the gap is second order in ε"); return to the cold open. |
| 11 | The whole chain (45) | – | Nine icons, each redrawn with its own scene's functions, light in order; the step being spoken is shown large; references. |

### 1.2 The geometry of information (PR #5): 15 scenes, 31:47, 1 live

Running examples: coins (n = 100), three-sided dice (the simplex) and Gaussians (the half-plane). The maths is in `math.js` (13 tests). Each scene is authored on its own clock and stretched by `PACE` (1.1–2.3).

| # | scene (s) | shown; computed objects |
|---|---|---|
| 00 | Title (23) | The three families "breathing" in the background. |
| 01 | Distributions as points (78) | Moving points with their distributions; **two axes with threads**: the same coins labelled by p and by log-odds, where Δp = 0.05 becomes Δx = 0.20 or 1.31. |
| 02 | Flipping coins (154) | Five seeded runs flip by flip; 2000 runs tallied on an exponential ramp, then the exact binomial curve on top; sd 5 vs 1.4; a sweep of p with ghost hills. |
| 03 | Distinguishability (135) | Both pairs on **one shared axis at one scale**, with labelled zooms: overlap 0.62 vs 0.21; 1.0 vs 2.5 sd; g = 4 vs 51; # sd ≈ √(n g) Δp. |
| 04 | Likelihood and score (223) | The model as a table; log-likelihood tangents (score 1/p, −1/(1−p)); three reasons for the log; mean score 0. |
| 05 | The Fisher information (239) | Three forms at p₀ = 0.3: stacked squared pushes (4.76); the expected log-likelihood built point by point (curvature −g); KL with its ½gδ² parabola. |
| 06 | A metric, not a number (122) | Axes in p, x and φ; the path length 1.34 is the same in each; flat in φ; the radius-2 circle; Wootters' count of about 31 coins. |
| 07 | The sphere in the simplex (125) | Fisher balls flatten at the triangle's edges; a **3D morph** y = (1−s)2p + s·2√p onto the octant; great circle; d_FR 1.235, chord 1.216, H 0.430. |
| 08 | Why this ruler (102) | Relabel, merge, split: dice 0.97 apart become coins 0.11 apart; Chentsov's theorem. |
| 09 | Gaussians, a hyperbolic plane (125, **live**, lenses μ₂, σ₂) | Fisher circles; the half-ellipse geodesic vs the straight segment; bells "widen · slide · narrow" (σ up to 2.18); the W₂ contrast; d_FR(N(0,1), N(100,1)) ≈ 12. |
| 10 | What the ruler buys (108) | 160 seeded estimates inside the Fisher ball of radius 1/√n; Jeffreys prior. |
| 11 | The natural gradient (125) | Three descents to N(0,1) from N(3, 0.5²): plain η = 0.3 overshoots (σ 23.9), plain η = 0.02 crawls (L = 0.87 after 60 steps), natural η = 0.3 converges; a log-loss plot. |
| 12–13 | Two kinds of straight lines (139); Pythagoras for KL (122) | m/e geodesics, Legendre duality; 0.124 + 0.240 = 0.364; EM as projections. |
| 14 | End to end (87) | Five cards, each with a small computed picture. |

### 1.3 The geometry of attention (PR #4): 14 scenes, 14:16, 1 live

Running example: d = 2, seven keys, and M = [[0.9, 0.8], [−0.2, −0.4]] = S + A with S indefinite (0.966, −0.466). 16 tests.
- 00–01 Title (9 s), Roadmap (46 s).
- 02 The score as a tensor (74 s): bilinear level lines, the hyperbolas and null lines of S, A as an oriented area.
- **03 Where the form comes from (62 s)**: covectors as stacks of level lines; a key sliding along ker W_K changes no score; w_q morphs into w_k with M, S, A, λ± and the angle **updating live**.
- 04 Position as a connection (66 s): RoPE, R_mᵀR_n = R_{n−m}.
- 05–06 Exponential family (65 s) and the Legendre map (60 s): **a θ-grid pushed through ∇ψ** into the hull of the keys.
- **07 The Fisher metric (72 s)**: Cov_a drawn as an ellipse; β swept 0.2 → 10; a **wiggle circle** of queries and its exact image; H(a) and tr Cov against β with a live marker.
- 08–11 Dually flat simplex (78 s), entmax (62 s), von Mises–Fisher (65 s), Hopfield (60 s).
- **12 Depth as a flow (85 s, live: levers β and a; drag to rotate)**: 48 seeded tokens on S², re-released by events at 40 s and 62 s; an energy trace with event markers; a cluster count; the velocity split into its S and A parts.
- 13 End to end (52 s).

### 1.4 LLMs beyond the chat window (`llm-soc`, main): 24 scenes, 13:17, 1 playable

For students new to the field:
- **Part 1**: LLM basics: next token, the JSON API, Python synced with a round trip, loops, structured output, RAG, grounding.
- **Part 2**: security uses and risks.
- **Part 3**: the triage project: lab, alert, a six-step pipeline, Loki and FleetDM context, prompt, ATT&CK mapping, metrics.

Scene 18 is playable: a `choice` lens switches the context the model sees. The vocabulary is infographic: `panel`, `node`, `chip`, `codeBlock` (syntax colours, typewriter, line focus, and `lineY(i)` for attaching connectors), `connector`, `packet`, `icon`, `badge`, `meter`. Non-factual numbers carry "(ILLUSTRATIVE)" on screen.

## 2. Visual vocabulary and style

**Ground and type** (kit `theme.js`):
- navy `#0d1321` ground with a faint dot grid;
- Spectral titles; IBM Plex Sans body at 20–22 px; IBM Plex Mono for every readout and note, 13–17 px;
- the header is drawn automatically: a mono eyebrow `NN · NAME` at (80, 74) and a 42 px title at (80, 126);
- titles are claims, not topics ("The velocity chooses the plane").

**Layout grid**, shared by the three maths videos:
- header in the top ~150 px;
- the picture left, at x ≈ 90–110 (a 620 px square or a 640 px-wide frame);
- formulas, readouts and notes in a right column at x = 850–900;
- a mono parameter footnote at y ≈ 860–872;
- a dim right-aligned **stamp** at (1572, 890) naming what is computed (for example "Δθ from the transported dials; area and centre from the loop; B from the field painted above"). Layouts are built against this baseline: moving it by 12 px broke u1-force scene 06, so the move was reverted.

**Colour: one meaning per colour, declared at the top of each `shared.js` and kept in every scene.**

| | u1-force | information geometry | attention |
|---|---|---|---|
| gold | fibre, phase, holonomy angle | p, the moving point | query, θ |
| soft blue | connection, lift | q | keys |
| lavender `#c39bf5` | curvature > 0 (teal `#4fb3a3` < 0) | Fisher metric and its products | Fisher, KL, entropy |
| orange (kit `stiff`) | the nudge εη | mixture geometry | context η |
| green | velocity, kinetic, inertia | exponential geometry | symmetric S |
| rose | force | KL | antisymmetric A |

Two cross-video conventions: lavender marks the geometry being revealed, and sign is violet/teal everywhere (heat maps, cells, ribbons). The kit's base `soft` (blue) and `stiff` (orange) come from the thesis's Part 1. Thesis visuals should keep that meaning rather than the side videos' reuse of orange.

**Formulas.** Each is declared at module level as `tex(String.raw\`…\`, 'fallback')`, so it is rendered once. It fades in (`alpha: seg(t, a, a+1)`) at the moment it is named, never typed. Formulas replace one another in the same slot (CURV → STOKES at the same y). A mono note under each says in words what it means.

**Readouts are computed every frame from `math.js`**, for example `` `${signed(dtheta, 3)} rad` ``, `readout(ctx, 'd_FR =', fisherRao(P, Q))`, or attention's live `matrix2`.
- The strongest scenes give a number a **comparison target**: Δθ/area meets B(centre); Σ cells equals ∮ω to every digit; the ribbon flux is computed two ways and the gap is reported.
- The tests pin the narrated numbers (g = 4 and 51.02; 1.0 and 2.52 sd).
- The u1-force maths review counted typed numbers in stamps as defects.

**Progressive builds** that work:
- **Named time constants** (`TUBE_AT`, `REVEAL`, `STOKES_AT`, `RELABEL`) drive both the narration cues and the fades.
- **`progress: lin(t, a, b)`** draws paths along as they are spoken.
- **Densify, then surface**: extra rings appear, then a glassy tube replaces them.
- **Fly and superimpose**: two dials merge into one dial with a wedge.
- **Sample → tally → exact curve**, with an exponential ramp `5·400^lin(t, 28, 40)` so thousands of samples arrive without tedium.
- **Ghosts** of earlier states accumulate on one axis.
- **A morph parameter** with a "morph 63 %" readout.
- **A device turns into another**: the number line becomes a legend; scene 03's roads come back as scene 08's worldline.
- **Relabelling an axis** (y → t) reinterprets the whole picture.
- **Names stay while explanations step back**; label variants cross-fade when their meaning changes.
- **Dimming waves** (shared cuts cancelling from P to Q).
- **Several acts from one initial condition** (`events` re-release the tokens).
- **A bookend**: u1-force scene 10 returns to the cold open's orbit.

**Camera and 3D.** Slow, purposeful drift:
- yaw 0.4 → 0.9 over 50 s (≈ 0.01 rad/s);
- a sinusoidal sway `0.55 + 0.3 sin(0.16 t)`;
- `0.62 + 0.012(t − 18)` on the morphing simplex.

Further rules:
- The u1-force interaction judge called drag-to-rotate a gimmick; attention still keeps one drag lens.
- Labels are placed from projected geometry: at the nearest projected floor corner, on the side away from another vector, or at an arc's true midpoint.
- Leader lines get a dark 5 px halo.
- Back sides are dashed and dimmer (normal test via `cam.rotate`).
- Every quad is depth-sorted.

**Pacing.** u1-force scenes run 45–95 s; information-geometry scenes 60–240 s.
- The timeline dips to dark between scenes (0.6 / 0.45 s) and fades headers automatically.
- Narration is `[time, text]` cues, each spoken when its object appears.
- Budget: words / 2.6 ≤ the slot (155 words per minute), and the measured `say` length ≤ slot − 1 s.
- `paced(scene, k)` re-times a scene without touching its choreography.
- Fixed vocabulary ("stationary", never "least").

**What makes the best scenes good**:
- **Measurement before picture** (u1-force/04): the field is painted only after the loops have detected it.
- **One gesture teaching three properties** in turn (u1-force/03).
- **One glance** proving "coordinates are labels" (information-geometry/01's threads).
- **The claim and the picture as one object** (information-geometry/07's morph).
- **A Jacobian shown, not named** (attention/07's wiggle circle).
- **A live simulation with a running statistic and event markers** (attention/12).
- **A summary recomputed from each scene's own functions** (u1-force/11).

## 3. Engine and APIs

**Folder anatomy.** Each video folder holds:
- `index.html`: fonts, and MathJax 3.2.2 from a CDN;
- `main.js`: `mountVideo(video)` from `../../../src/app.js`;
- `meta.json`: `id`, `title`, `heading`, `label`;
- `index.js`: scene order, `posterTime`, optional `PACE`;
- `shared.js`, which re-exports `src/kit.js`, plus `math.js`, `scenes/NN-*.js` and `tests/`;
- `build.mjs`, `render.mjs`, `export.mjs` and a README.

For development, run `npm run dev` and open `/private/other/<id>/`.

**A scene** is a pure function of local time, plus control values and simulation state:

```js
const AT = 17, HANDOVER = 60;
const HOL = tex(String.raw`\Delta\theta = \oint\omega`, 'Δθ = ∮ω');   // module level
export default defineScene({
  name: 'Two roads, one loop', duration: 75, header: header(3, 'HOLONOMY', 'Two roads to the same point'),
  narration: [[0, 'Two roads from P to Q …'], [11.5, 'Out along road two …'], [HANDOVER, 'Your turn …']],
  beats: [[20, 'Widen the loop'], [HANDOVER, 'Your turn']],
  handovers: [{ at: HANDOVER, prompt: 'Your turn: carry the loop somewhere else …' }],
  exploreFrom: AT,
  controls: {
    eps: slider('Nudge ε', { min: -1.2, max: 1.2, value: [[0, 0.25], [20, 0.25], [24, 1.0], [34, 1.0], [37, -0.8]] }),
    loop: drag('Drag the loop across the plane', { region: P.region }),                 // always a lens
    conn: choice('Connection', { magnetic: 'magnetic', gauge: 'pure gauge dχ' }, { value: [[0, 'magnetic'], [64.5, 'gauge']], lens: true }),
  },
  sim: leverSim(['eps']),                                  // eps becomes a lever: touching it pauses the narration
  draw(ctx, t, live) {
    const tt = clock(t, live, AT);                         // while exploring, show everything the controls affect
    const th1 = transport(field, L.road1, 0);              // computed every frame
    HOL.draw(ctx, COL, 500, { size: 26, alpha: seg(tt, 17.5, 18.5) });
  },
});
```

**Validation and controls.**
- `defineScene` checks that narration cues are in order and start at 0, and that beats and hand-overs lie inside the scene.
- Live scenes resolve to `{ input, state, pending, exploring }`.
- Keyframes ease like `seg()`, so a jump needs a holding key; choices switch at their key.
- **A control the simulation `uses` is a lever; every other control must be a lens.** The engine enforces this.
- A lever starts explore mode: narration freezes and the simulation forks. A lens never pauses.
- The control strip groups them as "Physics · pauses the video" and "View" (`player.js`); `docs/interactive-video.md` records the design.

**Side-video idioms to promote** (u1-force `shared.js`):

```js
export const leverSim = (uses) => simulation({ seed: 1, dt: 0.5, snapshotEvery: 0.5, uses, init: () => ({}), step: () => {} });
export const clock = (t, live, at) => (live?.exploring ? Math.max(t, at) : t);
export function paced(scene, k) {   // also in information-geometry
  return defineScene({ ...scene, duration: scene.duration * k, /* cues, beats, hand-overs, keyframes × k */
    draw: (ctx, t, live) => scene.draw(ctx, t / k, live) });
}
```

- `leverSim` gives levers to a scene whose frame is a pure function of its inputs: use it whenever the narration depends on the value.
- `track(t, keys)` moves the narrator's own objects; a drag lens adds an offset to them.

**Simulations.**
- u1-force/10: a Boris orbit (`dt = 1/120`) with a `Float64Array` ring-buffer trail and a smoothed orbit centre for framing.
- attention/12: `events: [[40, restart], [62, restart]]`.
- Snapshots every 0.5 s make seeking exact.
- All randomness comes from `createRng(seed)` (for example 2000 coin runs and 160 estimates, drawn once at module level).

**Components.**
- *Kit*: text, wrap with a typewriter, `brace`, `card`, `columnVector`, `tex`, plots, `drawMolecule`, `densityHeatmap`, `drawSurface`/`polyline3`/`polygon3`, `camera`, `springNetwork`, `stiffness`/`conditionNumber`.
- *Side-video devices*, grown from information geometry → attention → u1-force:
  - plane: `frame({x,y,w,h,u,v})` with `X, Y, point, inside, region`; `axes`, `gridLines`, `clipped`; `drawPath` (`progress`, `arrowHead`), `drawCurve`, `drawSamples`, `drawStrip`, `drawPoint` (`halo`, `ringed`), `drawVector`, `drawParallelogram`;
  - annotations: `readout`, `pill`, `panel`, `caption`, `aside`, `stamp`;
  - dials: `drawDial`, `drawDialField`, `drawRunner`, `drawAngle`;
  - heat maps: `drawCurvatureMap` (diverging, cached offscreen) and `heatmapImage` / `tintRamp` (sequential); `drawContours`, `matrix2`, `weightBars`;
  - distributions: `drawPmf`, `drawOutcomeBars`, the simplex helpers (`triangle`, `drawSimplexPath`, `drawFisherBallOnTriangle`);
  - `drawBalance` (a beam tilting by b − a);
  - from llm-soc: `codeBlock`, `connector`, `packet`, `node`, `meter`.
- *3D* (`u1-force/space.js`, kit camera, painter's algorithm, Y up; `floorPoint(x, y, h) = [x, h, y]`, `eventPoint(t, x, y) = [x, t, y]`):
  - cameras: `bundleCamera`, `spacetimeCamera`;
  - fibres: `drawFloor`, `drawRing` + `drawStalk`;
  - tubes: `tube`, `drawTube` (glassy), `drawTubeRing`, `drawLift` (hidden part dashed);
  - connections: `drawTiles` (horizontal planes);
  - spacetime: `drawBlock`, `drawWorldline`, `drawRibbon` (flux-shaded), `drawFluxLines`, `drawElement`, `drawArrow3`.

  The other two videos use the kit's `drawSurface` directly. The engine note warns it is slow for large meshes; atlas uses a typed-array painter instead.

**Workflow** (from the repo root, with `PLAYWRIGHT_CHANNEL=chrome`).
- **Build**: `build.mjs` bundles with esbuild into a single HTML file with the CSS inlined. u1-force adds `--only a,b --out dist/probe.html`, which writes a temporary entry for chosen scenes. Probe pages A–E and fix-A–E from the u1-force review remain in the main worktree's ignored `dist/`.
- **Check**: `render.mjs` rejects `Math.random`, `Date.now` and `performance.now` in the sources and fails on page errors. It renders each scene at ⅓, ⅔ and its end. For every live scene it checks that the middle frame is identical whether jumped to cold, jumped back to, or played up to, and it renders every control at its extremes. `--scene N --every 4` and `--at t1,…` write PNGs for review.
- **Export**: `export.mjs` follows the recipe of PR #3's `scripts/export-narrated.mjs`:
  1. per cue, `say -v Samantha -r 155`;
  2. ffmpeg `atempo = max(1, spoken / (slot − 1.0))`, a 550 ms delay, then trim to the slot by sample count;
  3. 15-word SRT chunks and one FFMETADATA chapter per scene;
  4. frames as JPEG (q 0.94, 24 fps, 1600 px) streamed into libx264 (crf 19), then muxed.

  llm-soc's older exporter is silent.
- **Test**: `node --test …/tests/<id>.test.mjs` checks every narrated identity on the running example and on seeded random instances.

## 4. Content coverage relevant to the thesis

None of these is about molecules or diffusion, and by the user's rule they must stay separate. But they already explain, with computed numbers, mathematics the project's story uses:

- **Coordinates are labels; distance must come from the objects** (information-geometry/01, 06). Δp = 0.05 becomes Δx = 0.20 vs 1.31. The tensor law g_x = g_p (dp/dx)² holds, while lengths are invariant (1.34). This is the template for "the Euclidean metric is arbitrary".
- **A step measured in units of the noise width** (information-geometry/02–03). sd = √(np(1−p)); 1.0 vs 2.5 sd; overlaps 0.62 vs 0.21. This is the logic of the readable window.
- **Pullback and flat embeddings.**
  - information-geometry/07: the Fisher metric is the radius-2 sphere metric pulled back along 2√p; ellipses become round caps.
  - information-geometry/06: a flat chart φ.
  - attention/03: a pullback with null directions; 3968 of 4096 directions are invisible to one head.

  Nothing yet shows a closed-form forward process in feature space.
- **Conditioning** (information-geometry/11). The plain step carries a 1/σ² factor: no single step size serves both narrow and wide fits, while the metric step does. This is the closest existing picture of stiffness, but for optimisation, not noising.
- **Sensitivity and degeneracy** (attention/07). Fisher = covariance = Jacobian, shown by the wiggle circle and its exact image. H and tr Cov fall from 1.9 / 2.6 at β = 0.2 to 0.05 / 0.02 at β = 10. This suits "the loss does not see stiff modes".
- **Samples filling a metric ball** (information-geometry/10, Cramér–Rao).
- **Gradient flows with energy traces** (attention/12). Tokens cluster within about 10 units at β = 4 and merge by depth 34 at β = 1; the A part adds a circulation.
- **Bundles, connections, holonomy, Stokes, gauge** (u1-force/01–04, attention/04). This is shared vocabulary with Part 0's shape space and the bundle framework.
- **Force as gradient and as a variational balance** (u1-force/05–06, 09). The balance plot is a template for score-versus-force consistency in force-field extraction.

**Open items, per the PRs**:
- u1-force: no MP4 yet, and the last round of fixes has not been fully reviewed.
- Information geometry: scenes 06–14 are unreviewed (for example, in scene 11 at 96 s the η formula crowds the loss plot's tick and "step" labels), and the video may be trimmed.
- Attention: narration review and MP4 still pending.

The diffusion-time side of information geometry (OU, I_t retention) lives in the thesis video `src/videos/retention` (PR #3).

## 5. Lessons and preferences

**What the user wanted.**
- **u1-force.** The brief asked for maximum intuition and a crystal-clear final point. Midway the user said the existing video on the topic was not good enough, and named Part 0 and their Manim Hopf-fibration article as the standard. The memory note records what that means: real 3D, a slow camera, computed objects, progressive builds.
- **Information geometry, first round of feedback**:
  - animate where distributions come from before comparing them;
  - never let differing scales fake a difference;
  - explain notation (p(x | θ)) before definitions, tied to the running example;
  - derive results visually (1/p as a tangent slope);
  - give intuition for choices (why the log);
  - say what depends on coordinates;
  - never show an unexplained curve or label;
  - add more explanation everywhere.

  The fix was to add scenes (02–05 became four), not patch them. The user accepted 32 minutes but flagged later scenes for cuts.
- **Separation.** Side videos live in `private/other/<id>` and never in `src/videos` or the thesis build, tests or README. Imports run side → `src`, never the reverse. Branches are cut from `main`, and each video went to its own draft PR marked work in progress, listing its checks and what remains.

**Rules from the u1-force three-judge design review** (mathematics, intuition, interaction, preceded by a research sweep on pictures, derivations and pedagogy):
- **Five levers in one arc**, one gesture each; everything else is a lens or cut. The first touch should be the reveal, not a rehearsal.
- **Hand over once per lever**, after the narrator has performed the gesture with a labelled readout.
- **Reuse one handle**: the bump (ε, t₀) is learned once and used in three scenes.
- **Readouts**: give each a comparison target, drop any number that only repeats another, and keep values in the range where picture and number agree (|Δθ| < π).
- **Camera**: replace drag-to-rotate with an authored orbit.
- **Link chapters through one object**: the y → t relabel, and "this is scene 3".
- **One memorable climax image**: "you cannot push a sail along its own length".
- **Be honest about limits**: say what a simple case cannot show (1+1 electric vs magnetic).
- **Build the comparison plot early** and swap one curve later.

**Process that worked**:
1. Write `math.js` and its tests first.
2. Smoke-test the 3D helpers.
3. Write a storyboard and a common brief with the conventions.
4. Five parallel scene writers, each with a probe page and frame folder.
5. Three reviewers: mathematics (signs, conventions, computed readouts, no claim beyond the picture); visual (render every 6 s, read every PNG, check that nothing overlaps or is cut off, and that colours, depth and labels are right); pacing (words / 2.6 per cue, cues describing what is not yet on screen, undefined jargon).
6. Fixers checking frames every 2.5 s.
7. A fresh review, then the lead's own frame inspection, then the README conventions, a memory note and the PR.

**Pitfalls recorded**:
- **Sign and orientation slips** are the most frequent maths defects: ribbon orientation, ω → ω − dχ, Weyl's clock-rate sign, a dial ignoring the charge.
- **Missing subscript glyphs** in Spectral (t₀ rendered as "to").
- **Crowding**: labels on rings, tubes or axis names; a crowded right column; a half-empty summary stage; a heat map too dim.
- **Shared layout constants are load-bearing** (the stamp baseline).
- **Source notes can be wrong**, and each video said so: rank S ≤ 2d_k; the sphere has radius 2; Wootters' distance is half of Fisher–Rao; the Bregman argument order is swapped.
- **The narrated `export.mjs` of u1-force and information geometry needs the `src/app.js` export-API change** (narration in `window.video.scenes`, a JPEG option in `frame()`) that only PRs #3 and #4 carry. On `main` it fails: `narration` is undefined, and PNG frames reach an MJPEG pipe.
- **Live dynamics can finish before the hand-over** (tokens cluster within about 10 s); re-release them with events.
- **Length**: cut repetition (gauge was explained three times, the tiling was heavier than it needed to be).

## 6. Opportunities

**First, promote the duplicated devices into `src/draw/`.** Thesis code must not import `private/other`. Candidates:
- `frame`, `axes`, the drawing helpers, `readout`, `pill`, `stamp`;
- `paced`, `track`, `clock`, `leverSim`;
- the heat maps;
- `space.js`.

Then each idea below is a port, not a rewrite.

1. **Same molecules, two charts** (information-geometry/01 threads, plus attention/07's wiggle). Draw Cartesian and internal-coordinate axes joined by threads; braces show that one Cartesian step is a tiny bond change and a large torsion change. Then push a small isotropic Cartesian ball through the exact map.
2. **The readable window** (information-geometry/02–03). Show the clean and the noised distribution of one feature on one shared axis, samples first and then the exact curve. Read out the step in noise sd and R_h(t). One scale, zooms labelled: bonds and torsions differ by orders of magnitude.
3. **The erasure clock as a reveal** (u1-force/04). Measure the half-erasure time t½ of a few features; measured and predicted t½(λ) meet on a number line. Then paint the features × t readability map, and the number line becomes its legend.
4. **Range and order as threads across charts** (information-geometry/01 on a time axis). Rows: Cartesian; internal; ordered internal + loud block. Each row has a tick at each feature's t½, with threads between rows.
   - Cartesian: order without range (bonds erased at t½ ≈ 0.0004 < t_min).
   - Internal: range without order (anti-order).
   - Ordered: both.

   Badge each value as measured, derived or illustrative.
5. **Stiffness: no single clock** (information-geometry/11 layout). Three noising processes of one molecule (Euclidean, wδ, ordered internal), with per-mode readability on a log plot and run readouts.
6. **The wδ era** (llm-soc `codeBlock` with line focus and connectors). The geodesic-ODE noising loop next to the one-line closed form α y + σ ε; beside them, computed ODE drift against an exact result.
7. **Embedding and pullback** (information-geometry/07 morph, attention/06 grid push, attention/03 live eigenvalues and null directions). Morph s from raw coordinates to features: metric ellipses become circles, with `conditionNumber` read out live.
8. **Loud modes and the constraint split** (`drawBalance`, attention/12 events). The beam pans compare L²/(1+L²) with 1/(1+L²). A live scene noises and denoises the same chain once per chart, with an Rg trace over diffusion time and event markers.
9. **Diffusion time as the vertical axis in 3D** (`space.js` block, the y → t relabel). Features on the floor, t going up, each readable band a slab, and a noised trajectory as a worldline.
10. **Whitening exponent sweep** (attention/07 curves with a live marker). Sweep γ = 0 … 1 over the measured Rg W1 and bond error. Make γ a lever via `leverSim(['gamma'])`.
11. **Force-field extraction** (u1-force/06, /09). dU as a stack of lines; a balance plot of score vs −∇U/kT; the soft-force error ∝ 1/σ as a readout pair.
12. **The evolution chain** (u1-force/11): wδ → stiffness → embeddings → ALDP5 → BBA → learned maps → range and order → ordered internal + loud modes. Each icon is recomputed from its own scene. A cold-open bookend: a molecule noised at the start, generated well at the end.
13. **Process**:
    - maths and tests first;
    - a written conventions section;
    - a three-judge design review;
    - parallel writers with probe pages;
    - maths, visual and pacing reviewers;
    - `render.mjs` plus reading frames;
    - the narrated export once PR #3/#4's export API is merged.

## 7. Sources read

**Side-video code** (PR snapshots in the scratchpad; llm-soc on `main`):
- **u1-force**: README; `index.js`, `meta.json`, `main.js`, `index.html`; `shared.js`, `space.js`; `math.js` (outline); `build.mjs`, `render.mjs`, `export.mjs`; tests. Scenes 00, 01, 03, 04 and 10 in full; 09 (head, narration, controls); headers and controls of the others.
- **information geometry**: README, `index.js`, `meta.json`, `shared.js`, scripts (diffed against u1-force), test list and head, the `.srt`. Scenes 01, 03, 07, 09 and 11 in full; the head of 02; headers of the others.
- **attention**: README, `index.js`, `meta.json`, `shared.js`, test list. Scenes 03 and 07 in full; the head of 12; headers of the others.
- **llm-soc**: README, `index.js`, `shared.js`, scene 18, scripts, `meta.json`.

**Engine** (main): `src/kit.js`, `app.js`, `main.js`; `engine/{timeline,timing,controls,live,simulation,random,recorder}.js`; player grep; `draw/{theme,tex,background,color,widgets,text,surface,plots,heatmap}.js`; `model/camera.js`; `scripts/smoke-test.mjs`, `serve.mjs`; `docs/interactive-video.md`.

**Git**: the `src/app.js` diffs between main and PRs #3/#4; branch logs and commit messages; `scripts/export-narrated.mjs` on `playable-video-prototype`.

**PRs and memory**: `gh pr view 2/4/5`; `gh pr list`; memory notes (MEMORY, u1-force-video, side-videos-stay-separate, thesis-animation-tooling, retention-video-source, thesis-ml-repo-and-compute).

**Archived sessions, read-only**:
- "Interactive video: fiber bundles to electromagnetism", with its workflow scripts (`u1-force-design-review`, `-build`, `-fix`) and the design-review journal verdicts;
- "Information geometry and Fisher metric";
- "Attention in differential and information geometry".

**Context**: `scratchpad/design-brief-draft.md`; the outline of `understand/a1-anim-main.md`.

**Checks run** (isolated copies in `scratchpad/a3-render/`): four builds; tests 13, 13 and 16 passing; render listings. Frames are in `scratchpad/a3-frames/`; I inspected u1 00/16, 01/45, 04/66, 10/55, 11/20; ig 01/56, 07/96, 11/96; at 03/44, 07/45, 12/50; llm 03/23, 14/16.
