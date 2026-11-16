// Check the built video: render frames to PNGs, fail on page errors, make sure the live scene draws
// the same frame however its time is reached and renders every control at its extremes, and that
// no source file reads the clock or unseeded randomness (the same checks as the repo's smoke test).
// Usage (from the repo root, after build.mjs):
//   PLAYWRIGHT_CHANNEL=chrome node private/other/information-geometry/render.mjs [--out <dir>] [--width 1280] [--at 3,10.5,...] [--scene 4] [--every 4]
// --at:    global times in seconds
// --scene: render one scene (index) every --every seconds, plus its last frame
// Without --at or --scene: every scene at 1/3 and 2/3 and just before its end, plus the live-scene checks.
// Exit code 1 on any error.

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { values: args } = parseArgs({
  options: { out: { type: 'string' }, width: { type: 'string', default: '1280' }, at: { type: 'string' }, scene: { type: 'string' }, every: { type: 'string', default: '4' }, video: { type: 'string', default: 'dist/information-geometry.html' } },
});
const here = new URL('./', import.meta.url);
const errors = [];

// sources must be functions of time
for (const dir of ['', 'scenes/']) {
  for (const name of await readdir(new URL(dir, here))) {
    if (!name.endsWith('.js') && !name.endsWith('.mjs')) continue;
    if (['build.mjs', 'render.mjs', 'export.mjs'].includes(name)) continue;
    const source = await readFile(new URL(dir + name, here), 'utf8');
    const found = source.match(/Math\.random|Date\.now|performance\.now/);
    if (found) errors.push(`${dir}${name} uses ${found[0]}`);
  }
}

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
await page.goto(`file://${fileURLToPath(new URL(args.video, here))}`);
await page.waitForFunction(() => window.video !== undefined);
await page.evaluate(() => window.video.ready);
const scenes = await page.evaluate(() => window.video.scenes);

let times = [];
const everything = !args.at && args.scene === undefined;
if (args.at) times = args.at.split(',').map(Number);
else if (args.scene !== undefined) {
  const s = scenes[Number(args.scene)];
  for (let t = 0.8; t < s.duration; t += Number(args.every)) times.push(s.start + t);
  times.push(s.start + s.duration - 0.5);
} else for (const s of scenes) times.push(s.start + s.duration / 3, s.start + (2 * s.duration) / 3, s.start + s.duration - 0.5);

if (args.out) await mkdir(args.out, { recursive: true });
for (const T of times) {
  const url = await page.evaluate(([time, w]) => window.video.frame(time, w), [T, Number(args.width)]);
  const i = scenes.findLastIndex((s) => s.start <= T);
  const name = `s${String(i).padStart(2, '0')}-t${(T - scenes[i].start).toFixed(1).padStart(5, '0')}.png`;
  if (args.out) await writeFile(`${args.out}/${name}`, Buffer.from(url.split(',')[1], 'base64'));
}

/** Seeking must not change a live scene's frame, and every control value must render. */
if (everything) {
  for (const scene of scenes.filter((s) => s.live)) {
    const problems = await page.evaluate(({ start, duration, controls }) => {
      const out = [];
      const mid = start + 0.5 * duration;
      const shot = (T, options) => window.video.frame(T, 320, options);
      window.video.reset();
      const cold = shot(mid);
      shot(start + 0.99 * duration);
      if (shot(mid) !== cold) out.push('jumping back to the middle drew a different frame');
      window.video.reset();
      for (let T = start; T < mid; T += 0.37) shot(T);
      if (shot(mid) !== cold) out.push('playing up to the middle drew a different frame than jumping there');
      for (const c of controls) {
        const values = c.kind === 'slider' ? [c.min, c.max] : c.options ?? [];
        for (const value of values) shot(start + 1.5, { view: c.lens ? { lenses: { [c.key]: value } } : { levers: { [c.key]: value } } });
      }
      return out;
    }, scene);
    errors.push(...problems.map((p) => `${scene.name}: ${p}`));
  }
}

console.log(`${times.length} frames, ${scenes.length} scenes, ${(scenes.at(-1).start + scenes.at(-1).duration).toFixed(0)} s`);
for (const s of scenes) console.log(`  ${String(s.start.toFixed(0)).padStart(4)} s  ${s.live ? 'live  ' : '      '}${s.name}`);
await browser.close();
if (errors.length) {
  console.error('✗ errors:\n  ' + [...new Set(errors)].join('\n  '));
  process.exit(1);
}
console.log('✓ no page errors; live scenes draw the same frame however they are reached');
