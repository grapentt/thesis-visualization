// Render frames of a built video to PNGs for review, and fail on page errors.
// Usage (after npm run build):
//   PLAYWRIGHT_CHANNEL=chrome node scripts/review-frames.mjs --video flipped-handle --out <dir> [--scene 4] [--every 5] [--at 12,30.5] [--width 1600]
//   --scene: one scene (index) every --every seconds plus its last frame; without it, every scene.
//   --view '{"levers":{"gamma":0.4}}': render live scenes with fixed control values.

import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { values: args } = parseArgs({
  options: {
    video: { type: 'string' }, out: { type: 'string' }, width: { type: 'string', default: '1600' },
    at: { type: 'string' }, scene: { type: 'string' }, every: { type: 'string', default: '5' }, view: { type: 'string' },
  },
});
if (!args.video || !args.out) throw new Error('needs --video <id> and --out <dir>');
const errors = [];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
await page.goto(`file://${fileURLToPath(new URL(`../dist/${args.video}.html`, import.meta.url))}`);
await page.waitForFunction(() => window.video !== undefined);
await page.evaluate(() => window.video.ready);
const scenes = await page.evaluate(() => window.video.scenes);
const every = Number(args.every);
const times = [];
if (args.at) times.push(...args.at.split(',').map(Number));
else {
  const list = args.scene !== undefined ? args.scene.split(',').map(Number) : scenes.map((_, i) => i);
  for (const i of list) {
    const s = scenes[i];
    for (let t = Math.min(2, s.duration / 2); t < s.duration - 0.6; t += every) times.push(s.start + t);
    times.push(s.start + s.duration - 0.6);
  }
}
await mkdir(args.out, { recursive: true });
const view = args.view ? JSON.parse(args.view) : undefined;
for (const T of times) {
  const url = await page.evaluate(([time, w, v]) => window.video.frame(time, w, v ? { view: v } : {}), [T, Number(args.width), view]);
  const i = scenes.findLastIndex((s) => s.start <= T);
  const name = `s${String(i).padStart(2, '0')}-t${(T - scenes[i].start).toFixed(1).padStart(5, '0')}.png`;
  await writeFile(`${args.out}/${name}`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
console.log(`${times.length} frames → ${args.out}${errors.length ? `\nERRORS:\n${errors.join('\n')}` : ''}`);
process.exit(errors.length ? 1 : 0);
