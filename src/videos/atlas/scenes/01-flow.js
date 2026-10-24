import { defineScene, seg, fade, wrap, text, type, color, tex, slider, choice, drag } from '../../../kit.js';
import { flowSimulation, restartWalled } from '../torusFlow.js';
import { flowCamera, drawFlowTorus, drawChart, drawReadouts } from '../torusViews.js';

// The stage regions this scene draws into (stage units).
const TORUS_BOX = [40, 150, 700, 640];
const GLUED = { x: 760, y: 170, side: 360 };
const WALLED = { x: 1180, y: 170, side: 360 };
const CUT_AT = 14; // the glued square appears
const READOUTS_AT = 22;
const WALLS_AT = 46; // the walled square appears, restarted from the glued cloud
const HANDOVER_AT = 61;

const SDE = tex(String.raw`dx = \big(D\,\nabla\log p + J/p\big)\,dt + \sqrt{2D}\,dW`, 'dx = (D ∇log p + J/p) dt + √(2D) dW');

export const flow = flowSimulation({
  seed: 5,
  uses: ['D', 'j'],
  events: [[WALLS_AT, restartWalled]],
});

export default defineScene({
  name: 'A flow that will not flatten',
  duration: 74,
  header: { eyebrow: '01 · WHY AN ATLAS', title: 'A circulating flow does not fit in a flat square' },
  narration: [
    [0, 'The data live on a torus. Each particle drifts and diffuses so that the cloud keeps one fixed density p, shown as colour, while a constant current makes it circulate around the torus.'],
    [7, 'The noise D only sets how jittery the particles are. Watch the slider: with more noise the density is still p.'],
    [CUT_AT, 'Cut the torus open along the two coloured circles and it unrolls into a flat square with coordinates (θ, φ). Same particles, same rule.'],
    [READOUTS_AT, 'The flow survives on the square only because opposite edges are glued: every dashed line is a particle that moved smoothly on the torus but has to jump across the square. The readouts show that the density still matches p, and the particles lap the torus at the rate j/2π.'],
    [30, 'The current is what makes the cloud go round. Switch it off: the density is still p, but the laps drop to zero.'],
    [36, 'Turn it up, and the cloud laps faster, always at j/2π.'],
    [42, 'The squares can also show the particles’ own histogram instead of the target p. On the glued square the two agree.'],
    [WALLS_AT, 'Now make the square an ordinary region of the plane: reflecting walls instead of glued edges. The walled cloud restarts from the glued one, with the same rule.'],
    [53, 'Mass slides into the walls and piles up there, far from p. It cannot go round: a flat square has no hole to go around, so the net flow through every cut across it must vanish.'],
    [HANDOVER_AT, 'Your turn: change the current or the noise. Can you make the walled square circulate?'],
    [65, 'The flow winds around the torus; a flat square cannot. No single chart can hold it. An atlas covers the torus with overlapping charts and passes each particle from one chart to the next inside the overlap.'],
  ],
  beats: [
    [CUT_AT, 'Cut open'],
    [30, 'The current'],
    [42, 'Histogram'],
    [WALLS_AT, 'Walls'],
    [HANDOVER_AT, 'Your turn'],
  ],
  handovers: [{ at: HANDOVER_AT, prompt: 'Your turn: change the current or the noise. Can the walled square circulate?' }],
  exploreFrom: 1.5, // the torus has faded in
  // the video plays the controls itself, so viewers see what each one does
  controls: {
    D: slider('Noise D', { min: 0, max: 0.6, step: 0.01, value: [[0, 0.15], [7.5, 0.15], [8.5, 0.45], [12, 0.45], [13, 0.15]] }),
    j: slider('Current j', { min: 0, max: 1.2, step: 0.05, value: [[0, 0.5], [30.5, 0.5], [31.5, 0], [36.5, 0], [37.5, 1], [43, 1], [44, 0.5]] }),
    show: choice('Squares show', { target: 'target p', hist: 'histogram' }, { value: [[0, 'target'], [42.5, 'hist']], lens: true }),
    view: drag('Drag the torus to rotate it', { region: TORUS_BOX }),
  },
  sim: flow,

  draw(ctx, t, { input, state }) {
    const [dx, dy] = input.view;
    // seen from above, like the page; dragging down tilts the near side further towards the viewer
    const cam = flowCamera({ yaw: 0.6 + 0.15 * t + 0.006 * dx, pitch: -0.8 - 0.004 * dy });
    drawFlowTorus(ctx, state.glued, cam, { alpha: seg(t, 0, 1) });

    // before the squares appear: the rule the particles follow
    const intro = fade(t, 1, 2, CUT_AT - 0.5, CUT_AT + 0.5);
    SDE.draw(ctx, 820, 300, { size: 32, alpha: intro });
    wrap(ctx, 'Drift and noise of strength D together keep the density p fixed. A constant current J = (j, j), whose velocity J/p also leaves p fixed, makes the cloud circulate.', 820, 380, 660, 32, { ...type.body, alpha: intro });
    text(ctx, 'colour: density p    orange: tracer particles', 820, 500, { ...type.note, alpha: fade(t, 4, 5, CUT_AT - 0.5, CUT_AT + 0.5) });

    drawChart(ctx, state, 'glued', { ...GLUED, glued: true, show: input.show, alpha: seg(t, CUT_AT, CUT_AT + 1.5) });
    drawChart(ctx, state, 'walled', { ...WALLED, glued: false, show: input.show, alpha: seg(t, WALLS_AT, WALLS_AT + 1.5) });
    text(ctx, 'square, edges glued', GLUED.x + GLUED.side / 2, GLUED.y - 14, { ...type.note, align: 'center', alpha: seg(t, CUT_AT + 0.5, CUT_AT + 2) });
    text(ctx, 'square in ℝ², with walls', WALLED.x + WALLED.side / 2, WALLED.y - 14, { ...type.note, align: 'center', alpha: seg(t, WALLS_AT + 0.5, WALLS_AT + 2) });

    drawReadouts(ctx, state, input, { x: 760, y: 600, width: 780, alpha: seg(t, READOUTS_AT, READOUTS_AT + 1.5), walled: seg(t, WALLS_AT, WALLS_AT + 1.5) });
    text(ctx, `D = ${input.D.toFixed(2)}   j = ${input.j.toFixed(2)}`, 80, 690, { ...type.note, color: color.body, alpha: seg(t, 1, 2) });
  },
});
