// Render the built video to an MP4, streaming frames straight into ffmpeg
// (no folder of PNGs on disk). Needs ffmpeg and Playwright.
// Usage (from the repo root, after build.mjs):
//   PLAYWRIGHT_CHANNEL=chrome node private/other/llm-soc/export.mjs [--fps 30] [--width 1920] [--out private/other/llm-soc/llm-soc.mp4] [--from 0] [--to <end>]

import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const { values: args } = parseArgs({
  options: {
    fps: { type: 'string', default: '30' },
    width: { type: 'string', default: '1920' },
    out: { type: 'string', default: fileURLToPath(new URL('llm-soc.mp4', import.meta.url)) },
    from: { type: 'string', default: '0' },
    to: { type: 'string' },
  },
});
const fps = Number(args.fps);
const width = Number(args.width);

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (err) => console.error('page error:', err.message));
await page.goto(`file://${fileURLToPath(new URL('dist/llm-soc.html', import.meta.url))}`);
await page.waitForFunction(() => window.video !== undefined);
await page.evaluate(() => window.video.ready);

const duration = await page.evaluate(() => window.video.duration);
const from = Number(args.from);
const to = Math.min(args.to === undefined ? duration : Number(args.to), duration - 1e-3);
const count = Math.floor((to - from) * fps) + 1;

const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', args.out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((resolve, reject) => ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))));

console.log(`Rendering ${count} frames at ${width} px, ${fps} fps → ${args.out}`);
const started = Date.now();
for (let n = 0; n < count; n++) {
  const T = Math.min(from + n / fps, to);
  const dataUrl = await page.evaluate(([time, w]) => window.video.frame(time, w), [T, width]);
  if (!ffmpeg.stdin.write(Buffer.from(dataUrl.split(',')[1], 'base64'))) await new Promise((r) => ffmpeg.stdin.once('drain', r));
  if (n % (fps * 10) === 0) console.log(`  ${(T - from).toFixed(0)} / ${(to - from).toFixed(0)} s  (${((Date.now() - started) / 1000).toFixed(0)} s elapsed)`);
}
ffmpeg.stdin.end();
await done;
await browser.close();
console.log(`Wrote ${args.out} in ${((Date.now() - started) / 60000).toFixed(1)} min`);
