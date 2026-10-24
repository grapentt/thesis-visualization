// Model checks for the torus flow (docs/interactive-video.md, "Model checks"):
// seeking reproduces a straight run bit for bit, and at seed 5, D = 0.15 the port
// agrees with theory. Thresholds were fixed before the port was first run.
// Run from the repo root with: node --test 'tests/*.test.mjs' (Node 24 rejects a directory argument).

import test from 'node:test';
import assert from 'node:assert/strict';
import { Cursor, Track, simulation, stepAt } from '../src/engine/simulation.js';
import { N, TAU, copyCloud, flowSimulation } from '../src/videos/atlas/torusFlow.js';

const D = 0.15;
const J = 0.5;
const BURN_IN = 10; // s
const WINDOW = 30; // s
const LAP_TOLERANCE = 0.1; // relative, glued lap rate against j/2π
const MAX_WALLED_LAPS = 0.005; // laps / particle / s
const PILE_UP_TV = 0.5;
const TV_MARGIN = 0.02;

// deepStrictEqual compares typed arrays byte for byte and numbers with Object.is: a bit-exact comparison.
const assertSameState = (cursor, reference, label) => {
  assert.equal(cursor.n, reference.n, `${label}: step`);
  assert.equal(cursor.rng.getState(), reference.rng.getState(), `${label}: generator`);
  assert.deepStrictEqual(cursor.state, reference.state, `${label}: state`);
};

test('a seeking cursor reproduces straight runs bit for bit', () => {
  const spec = flowSimulation({ events: [[1, (s) => copyCloud(s.glued, s.walled)]] });
  const inputAt = (t) => ({ D: t < 1.5 ? D : 0.3, j: t < 0.6 ? J : 1, walls: t < 2.2 ? 'keep' : 'drop' });
  const straight = (t) => {
    const cursor = new Cursor(spec, inputAt);
    cursor.advanceTo(stepAt(spec, t));
    return cursor;
  };

  assertSameState(straight(3), straight(3), 'two straight runs to 3 s');
  const cursor = new Track(spec, inputAt).cursor();
  // The last seek restores the 1 s snapshot, saved just before the event, and steps through the event.
  for (const t of [2, 0.7, 3, 1.2]) {
    cursor.seek(stepAt(spec, t));
    assertSameState(cursor, straight(t), `seek to ${t} s`);
  }
});

/**
 * The shipped flow at fixed inputs. After the burn-in, adds up the net meridian crossings of
 * every tick (read before updateStats resets them) and averages the per-tick TV over the window.
 */
function measure(input) {
  const flow = flowSimulation();
  const net = { glued: 0, walled: 0 };
  let counting = false;
  const spec = simulation({
    seed: flow.seed,
    dt: flow.dt,
    tick: flow.tick,
    init: flow.init,
    step: flow.step,
    onTick(state, tick) {
      if (counting) {
        net.glued += state.glued.cross;
        net.walled += state.walled.cross;
      }
      flow.onTick(state, tick);
    },
  });
  const cursor = new Cursor(spec, () => input);
  const start = stepAt(spec, BURN_IN);
  cursor.advanceTo(start);
  counting = true;
  const ticks = Math.round(WINDOW / spec.tick);
  const tv = { glued: 0, walled: 0 };
  for (let k = 1; k <= ticks; k++) {
    cursor.advanceTo(start + k * spec.stepsPerTick);
    tv.glued += cursor.state.glued.tv;
    tv.walled += cursor.state.walled.tv;
  }
  const { glued, walled } = cursor.state;
  return {
    laps: { glued: net.glued / N / WINDOW, walled: net.walled / N / WINDOW },
    meanTv: { glued: tv.glued / ticks, walled: tv.walled / ticks },
    endTv: { glued: glued.tv, walled: walled.tv },
  };
}

const runs = {};
const runA = () => (runs.A ??= measure({ D, j: J, walls: 'keep' }));
const runB = () => (runs.B ??= measure({ D, j: 0, walls: 'keep' }));
const runC = () => (runs.C ??= measure({ D, j: J, walls: 'drop' }));
const fmt = (x) => x.toFixed(4);

test('A: the glued cloud circulates at j/2π laps per particle per second', (t) => {
  const { laps } = runA();
  const theory = J / TAU;
  t.diagnostic(`glued lap rate ${fmt(laps.glued)} vs j/2π = ${fmt(theory)} (${fmt((laps.glued / theory - 1) * 100)} %)`);
  assert.ok(Math.abs(laps.glued - theory) <= LAP_TOLERANCE * theory);
});

// On the walled square θ is an interval, so a window's net meridian crossings are exactly the change
// in the number of walled particles at θ ≥ π (at most 450 under the bound). With the current kept, the
// bound therefore checks that the pile-up against the θ = 2π wall has nearly finished by the end of the
// burn-in (seed 5: 2566 → 3000 particles), not circulation as such.
test('A: with the current kept, the walled cloud piles up and does not circulate', (t) => {
  const { laps, endTv } = runA();
  t.diagnostic(`walled lap rate ${fmt(laps.walled)}, walled TV at the end ${fmt(endTv.walled)}`);
  assert.ok(Math.abs(laps.walled) <= MAX_WALLED_LAPS);
  assert.ok(endTv.walled > PILE_UP_TV);
});

test('A, B: the current leaves p stationary on the glued torus', (t) => {
  const tv0 = runB().meanTv.glued;
  const { meanTv } = runA();
  t.diagnostic(`glued mean TV ${fmt(meanTv.glued)} with j = ${J}, TV0 ${fmt(tv0)} with j = 0`);
  assert.ok(meanTv.glued <= tv0 + TV_MARGIN);
});

test('B, C: with the current dropped, the walled cloud keeps p and does not circulate', (t) => {
  const tv0 = runB().meanTv.glued;
  const { meanTv, laps } = runC();
  t.diagnostic(`walled mean TV ${fmt(meanTv.walled)} (TV0 ${fmt(tv0)}), walled lap rate ${fmt(laps.walled)}`);
  assert.ok(meanTv.walled <= tv0 + TV_MARGIN);
  assert.ok(Math.abs(laps.walled) <= MAX_WALLED_LAPS);
});
