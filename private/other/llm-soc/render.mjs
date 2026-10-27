// Render frames of the built video to PNGs and report page errors.
// Usage (from the repo root, after build.mjs):
//   node private/other/llm-soc/render.mjs --out <dir> [--width 1280] [--at 3,10.5,...] [--scene 4] [--every 4]
// --at:    global times in seconds
// --scene: render one scene (index) every --every seconds, plus its last frame
// Without --at or --scene, renders every scene at 1/3 and 2/3 and just before its end.
// Exit code 1 if the page logged any error.

import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, width: { type: 'string', default: '1280' }, at: { type: 'string' }, scene: { type: 'string' }, every: { type: 'string', default: '4' }, video: { type: 'string', default: 'dist/llm-soc.html' } } });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`file://${fileURLToPath(new URL(args.video, import.meta.url))}`);
await page.waitForFunction(() => window.video !== undefined);
await page.evaluate(() => window.video.ready);
const scenes = await page.evaluate(() => window.video.scenes);

let times = [];
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
console.log(`${times.length} frames, ${scenes.length} scenes, ${(scenes.at(-1).start + scenes.at(-1).duration).toFixed(0)} s`);
for (const s of scenes) console.log(`  ${String(s.start.toFixed(0)).padStart(4)} s  ${s.name}`);
await browser.close();
if (errors.length) {
  console.error('page errors:\n' + [...new Set(errors)].join('\n'));
  process.exit(1);
}
