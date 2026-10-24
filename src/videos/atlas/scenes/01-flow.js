import { defineScene, seg, fade, wrap, text, type, color, tex, slider, choice, drag } from '../../../kit.js';
import { flowSimulation, restartWalled } from '../torusFlow.js';
import { flowCamera, drawFlowTorus, drawChart, drawReadouts } from '../torusViews.js';

// The stage regions this scene draws into (stage units).
const TORUS_BOX = [40, 150, 700, 640];
const GLUED = { x: 760, y: 170, side: 360 };
const WALLED = { x: 1180, y: 170, side: 360 };
const WALLS_AT = 46; // the walled square appears, restarted from the glued cloud
const DROP_AT = 70; // the current is dropped and the noise raised

const SDE = tex(String.raw`dx = \big(D\,\nabla\log p + J/p\big)\,dt + \sqrt{2D}\,dW`, 'dx = (D ∇log p + J/p) dt + √(2D) dW');

export const flow = flowSimulation({
  seed: 5,
  events: [[WALLS_AT, restartWalled]],
});

export default defineScene({
  name: 'A flow that will not flatten',
  duration: 100,
  header: { eyebrow: '01 · WHY AN ATLAS', title: 'A flat square holds the density, not the flow' },
  narration: [
    [0, 'The data live on a torus. Each particle drifts and diffuses so that the cloud keeps one fixed density p, shown as colour, while a constant current makes it circulate around both cycles of the torus.'],
    [8, 'The orange tracers follow single particles: the cloud streams around forever, yet its density never changes.'],
    [16, 'Cut the torus open along the two coloured circles and it unrolls into a flat square with coordinates (θ, φ). Same particles, same rule.'],
    [26, 'The flow survives on the square only because opposite edges are glued. Every dashed line is a particle that moved smoothly on the torus but has to jump across the square.'],
    [36, 'The readouts confirm it: on the glued square the distance to p stays at its noise floor, and the particles lap the torus at the theoretical rate j/2π.'],
    [WALLS_AT, 'Now make the square an ordinary region of the plane: reflecting walls instead of glued edges. The walled cloud restarts from the glued one.'],
    [54, 'With the same rule, mass slides into the walls and piles up there, far from p. The walled lap number only counts that mass moving between the two halves of the square, and it dies away: nothing circulates.'],
    [66, 'Your turn: can you make the walled square match p and still circulate?'],
    [DROP_AT, 'Dropping the current lets the walled cloud relax back towards p, here helped by stronger noise; its lap number turns briefly negative as mass flows back. But it never circulates. On a flat square you can keep the density, never the flow: keeping the rule lost both.'],
    [86, 'No single chart, a flat piece of the plane without glued edges, can hold this flow. An atlas covers the torus with overlapping charts and re-expresses each particle in the next chart while it is inside the overlap.'],
  ],
  beats: [
    [16, 'Cut open'],
    [WALLS_AT, 'Walls'],
    [66, 'Your turn'],
    [DROP_AT, 'Drop the current'],
  ],
  handovers: [{ at: 66, prompt: 'Your turn: make the walled square match p and still circulate.' }],
  exploreFrom: 1.5, // the torus has faded in
  controls: {
    D: slider('Noise D', { min: 0, max: 0.6, step: 0.01, value: [[0, 0.15], [DROP_AT - 0.5, 0.15], [DROP_AT, 0.4]] }),
    j: slider('Current j', { min: 0, max: 1.2, step: 0.05, value: 0.5 }),
    walls: choice('Walls', { keep: 'keep the rule', drop: 'drop the current' }, { value: [[0, 'keep'], [DROP_AT, 'drop']] }),
    show: choice('Squares show', { target: 'target p', hist: 'histogram' }, { value: [[0, 'target'], [52, 'hist']], lens: true }),
    view: drag('Drag the torus to rotate it', { region: TORUS_BOX }),
  },
  sim: flow,

  draw(ctx, t, { input, state }) {
    const [dx, dy] = input.view;
    // seen from above, like the page; dragging down tilts the near side further towards the viewer
    const cam = flowCamera({ yaw: 0.6 + 0.15 * t + 0.006 * dx, pitch: -0.8 - 0.004 * dy });
    drawFlowTorus(ctx, state.glued, cam, { alpha: seg(t, 0, 1) });

    // before the charts appear: the rule the particles follow
    const intro = fade(t, 1, 2, 14.5, 15.5);
    SDE.draw(ctx, 820, 300, { size: 32, alpha: intro });
    wrap(ctx, 'Drift and noise of strength D together keep the density p fixed. A constant current J = (j, j), whose velocity J/p also leaves p fixed, makes the cloud circulate.', 820, 380, 660, 32, { ...type.body, alpha: intro });
    text(ctx, 'colour: density p    orange: tracer particles', 820, 500, { ...type.note, alpha: fade(t, 4, 5, 14.5, 15.5) });

    drawChart(ctx, state, 'glued', { ...GLUED, glued: true, show: input.show, alpha: seg(t, 16, 17.5) });
    drawChart(ctx, state, 'walled', { ...WALLED, glued: false, show: input.show, alpha: seg(t, WALLS_AT, WALLS_AT + 1.5) });
    text(ctx, 'square, edges glued', GLUED.x + GLUED.side / 2, GLUED.y - 14, { ...type.note, align: 'center', alpha: seg(t, 16.5, 18) });
    text(ctx, 'square in ℝ², with walls', WALLED.x + WALLED.side / 2, WALLED.y - 14, { ...type.note, align: 'center', alpha: seg(t, WALLS_AT + 0.5, WALLS_AT + 2) });

    drawReadouts(ctx, state, input, { x: 760, y: 600, width: 780, alpha: seg(t, 30, 31.5), walled: seg(t, WALLS_AT, WALLS_AT + 1.5) });
    text(ctx, `D = ${input.D.toFixed(2)}   j = ${input.j.toFixed(2)}   walls: ${input.walls === 'keep' ? 'keep the rule' : 'current dropped'}`, 80, 690, {
      ...type.note,
      color: color.body,
      alpha: seg(t, 1, 2),
    });
  },
});
