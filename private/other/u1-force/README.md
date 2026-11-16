# From phase to force

A playable narrated video (about 14 minutes, 12 scenes, nine of them live) on why the curvature of a
U(1) bundle, with the particle's velocity plugged into one slot, is the electromagnetic force. It is a
side piece, not one of the thesis videos: it reuses the repo's video engine (`src/`: same player, same
scene format, same look), but `npm run build` and `npm test` do not pick it up; it has its own build,
check and export scripts below.

The chain it builds, with pictures the viewer can touch:

fibre bundle (a circle over every point) → connection (a rule for carrying a dial's hand along a path)
→ holonomy (two roads to the same point disagree) → curvature (holonomy per oriented area; Stokes:
the big holonomy is the integral of the curvature) → stationary action (the free particle; a potential,
whose gradient is a 1-form, the force) → the charge: the transported phase *is* the interaction action
→ a sideways nudge of the worldline encloses a thin loop, the ribbon → its holonomy is the curvature
flux, ∫ Ω(η, U) dt → the field's answer and the mass's answer to the same nudge cancel for every nudge
→ m ẍ♭ = e F(·, U).

Everything on screen is computed from `math.js` (no DOM; tested by `tests/u1-force.test.mjs`):
the connection of the plane and its holonomies, fluxes and tilings; the action of a particle on a line,
its first variation, the physical trajectories; the two gauges of the uniform electric field; the
ribbon fluxes; the Boris orbit of a charge in a magnetic field. The 3D pictures (rings, tubes, lifts,
the spacetime block with flux lines) are in `space.js`; the palette and the drawing devices (dials,
frames, heat maps, readouts) in `shared.js`; one scene per file in `scenes/`.

## Conventions

- Phase-normalised: the dial angle θ, the connection ω = (e/ħ) A, the curvature Ω = dω = (e/ħ) F.
  Transport dθ/ds = ω(γ̇); holonomy angle ∮ω = ∬Ω with counter-clockwise loops positive.
- The plane of scenes 1–4 carries B(x, y) = 0.5 − 1.6 exp(−|p − (0.5, −0.3)|²/0.6²) in units of ħ/e
  (violet where positive, teal where negative), with the symmetric gauge for the background and the
  closed-form radial gauge field for the bump.
- Two roads are a worldline and its nudge: road 1 straight up from P to Q, road 2 = road 1 + ε η; the
  dials' disagreement Δθ = ∫_{road 2} ω − ∫_{road 1} ω is the flux through the strip oriented by the
  ordered pair (η across, U along); ε > 0 nudges to the right and the loop runs counter-clockwise.
- Electromagnetism in the (−, +, +, +) forms convention: A = −φ dt + A_i dx^i, F = dA, F_{ti} = −E_i,
  F_{ij} = ε_{ijk} B_k, S_int = e ∫ A(U) dt, F(η, U) = η·(E + ẋ × B), f♭ = e F(·, U). In 1 + 1
  dimensions F = E dx∧dt with the two gauges ω = E x dt and ω = −E t dx (E = 2 in scenes 7, 8 and 9, so
  the physical worldline is the same picture in all three); in the plane F = B dx∧dy with f = e B (ẏ, −ẋ).
- Colour of curvature by sign everywhere: violet for positive flux or holonomy, teal for negative.
- Mechanics is said with "stationary", never "least".

## The argument, scene by scene

| # | scene | length | live |
| --- | --- | --- | --- |
| 00 | Cold open: a charge circling with no rope, and the title | 18 s | |
| 01 | A circle over every point (the bundle, in 3D: rings, the tube over a curve) | 50 s | |
| 02 | A rule for carrying a phase (three connections; the lift winding on the tube) | 65 s | lens: connection |
| 03 | Two roads, one loop (holonomy; the invisible field detected by loops) | 75 s | lever: nudge ε; drag the loop; lens: pure gauge |
| 04 | Holonomy per area (curvature; the reveal; Stokes along the strip; y becomes t) | 95 s | lever: loop size; drag; lens: cells |
| 05 | Which worldline does a free particle take? (stationary action, the S(ε) parabola) | 55 s | levers: nudge ε, where; lens: base path |
| 06 | The gradient of the potential is a force (dV as a stack of lines; by parts; the balance plot) | 85 s | lenses: potential, nudge |
| 07 | The transported phase is the interaction action (two turnings, one hand; the gauge toggle) | 75 s | lenses: gauge, field |
| 08 | A nudge is a loop (the ribbon; Δθ = ∬Ω = ∫Ω(η, U) dt; three names, one angle) | 85 s | levers: nudge ε, where |
| 09 | The force (the balance for every nudge; the covector as a stack of lines parallel to U) | 90 s | levers: nudge ε, where; lens: worldline |
| 10 | Tilt the velocity (the spacetime block with flux lines; the component table; the orbit) | 95 s | lens: speed; levers: charge, B (a real orbit simulation) |
| 11 | The whole chain (the nine steps, each drawn large as it is named) | 45 s | |

## Run, build, check, export

From the repo root (Playwright's own Chromium is not installed here, hence the Chrome channel):

```bash
npm run dev                                   # then open http://localhost:5173/private/other/u1-force/
node private/other/u1-force/build.mjs         # → private/other/u1-force/dist/u1-force.html (self-contained)
node --test private/other/u1-force/tests/u1-force.test.mjs   # the mathematical contract
```

Check the build (page errors, the live scenes drawing the same frame however they are reached, every
control at its extremes, no clock or unseeded randomness in the sources) and render frames to look at:

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/u1-force/render.mjs                                   # the checks, 3 frames per scene
PLAYWRIGHT_CHANNEL=chrome node private/other/u1-force/render.mjs --out /tmp/frames --scene 8 --every 4   # one scene, every 4 s
node private/other/u1-force/build.mjs --only 03-holonomy,04-curvature --out dist/probe.html         # a page with two scenes
```

Export the MP4 with the macOS voice reading the narration, English subtitles and chapter markers
(needs `ffmpeg`, `ffprobe` and `say`):

```bash
PLAYWRIGHT_CHANNEL=chrome node private/other/u1-force/export.mjs   # → u1-force.mp4 and u1-force.srt
```

## Files

- `index.js` the edit (scene order, pacing), `meta.json` the title, `main.js` the dev entry, `index.html` the page.
- `math.js` the mathematics; `tests/u1-force.test.mjs` its contract.
- `shared.js` palette and drawing devices; `space.js` the 3D pictures.
- `scenes/NN-name.js` one scene each.
- `build.mjs`, `render.mjs`, `export.mjs` as above.
