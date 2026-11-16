// Render frames of one built video to look at, and report how fast each narration cue has to be read.
// Usage (after npm run build):
//   PLAYWRIGHT_CHANNEL=chrome node scripts/review-frames.mjs --video retention [--out frames/retention-review] [--width 1280] [--scene 4] [--every 4] [--at 12,80.5]
// Without --scene or --at: every scene at 1/3, 2/3 and just before its end. Exit code 1 on any page error.

import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const { values: args } = parseArgs({
  options: { video: { type: 'string', default: 'retention' }, out: { type: 'string' }, width: { type: 'string', default: '1280' }, scene: { type: 'string' }, every: { type: 'string', default: '4' }, at: { type: 'string' } },
});
if (!/^[a-z0-9-]+$/.test(args.video)) throw new Error('Invalid video id');
const out = args.out ?? `frames/${args.video}-review`;
const errors = [];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
await page.goto(`file://${resolve(`dist/${args.video}.html`)}`);
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

await mkdir(out, { recursive: true });
for (const T of times) {
  const url = await page.evaluate(([time, w]) => window.video.frame(time, w), [T, Number(args.width)]);
  const i = scenes.findLastIndex((s) => s.start <= T);
  await writeFile(`${out}/s${String(i).padStart(2, '0')}-t${(T - scenes[i].start).toFixed(1).padStart(6, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();

// every cue must leave the exporter's voice (155 words per minute, ≈ 2.6 words/s, after a 0.55 s lead) room to read it
console.log(`${times.length} frames → ${out}/; ${scenes.length} scenes, ${(scenes.at(-1).start + scenes.at(-1).duration).toFixed(0)} s`);
let rushed = 0;
for (const s of scenes) {
  const lines = Array.isArray(s.narration) ? s.narration : [[0, s.narration]];
  const rates = lines.map(([t, words], i) => {
    const slot = (lines[i + 1]?.[0] ?? s.duration) - t;
    const rate = words.split(/\s+/).length / (slot - 1.2);
    if (rate > 2.45) rushed++;
    return `${rate.toFixed(2)}${rate > 2.45 ? '!' : ''}`;
  });
  console.log(`  ${String(s.start.toFixed(0)).padStart(4)} s  ${s.name.padEnd(42)} ${s.duration} s   words/s per cue: ${rates.join(' ')}`);
}
if (rushed) console.log(`${rushed} cue(s) above 2.45 words/s would be sped up by the exporter`);
if (errors.length) {
  console.error('✗ errors:\n  ' + [...new Set(errors)].join('\n  '));
  process.exit(1);
}
console.log('✓ no page errors');
