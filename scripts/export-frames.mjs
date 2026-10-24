// Render the video frame by frame to PNGs (frame-exact, no dropped frames),
// then optionally encode them with ffmpeg.
//
// Usage:
//   npm run build
//   npm run export -- --video part-0 [--fps 60] [--width 1920] [--from 0] [--to <end>] [--out frames] [--mp4 video.mp4]
//
// Needs Playwright with Chromium: npm install && npx playwright install chromium

import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const { values: args } = parseArgs({
  options: {
    fps: { type: 'string', default: '60' },
    width: { type: 'string', default: '1920' },
    from: { type: 'string', default: '0' },
    to: { type: 'string' },
    out: { type: 'string', default: 'frames' },
    mp4: { type: 'string' },
    video: { type: 'string', default: 'part-0' },
  },
});

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is missing. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

const fps = Number(args.fps);
const width = Number(args.width);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (err) => console.error('page error:', err.message));
await page.goto(`file://${fileURLToPath(new URL(`../dist/${args.video}.html`, import.meta.url))}`);
await page.waitForFunction(() => window.video !== undefined);
await page.evaluate(() => window.video.ready);

const duration = await page.evaluate(() => window.video.duration);
const from = Number(args.from);
const to = Math.min(args.to === undefined ? duration : Number(args.to), duration - 1e-3);
const count = Math.floor((to - from) * fps) + 1;
await mkdir(args.out, { recursive: true });

console.log(`Rendering ${count} frames at ${width} px, ${fps} fps → ${args.out}/`);
for (let n = 0; n < count; n++) {
  const T = Math.min(from + n / fps, to);
  const dataUrl = await page.evaluate(([time, w]) => window.video.frame(time, w), [T, width]);
  await writeFile(`${args.out}/${String(n).padStart(6, '0')}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  if (n % fps === 0) process.stdout.write(`\r  ${(T - from).toFixed(0)} / ${(to - from).toFixed(0)} s`);
}
process.stdout.write('\n');
await browser.close();

const encode = ['-y', '-framerate', String(fps), '-i', `${args.out}/%06d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16'];
if (args.mp4) {
  const result = spawnSync('ffmpeg', [...encode, args.mp4], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`Wrote ${args.mp4}`);
} else {
  console.log(`Encode with:\n  ffmpeg ${encode.join(' ')} video.mp4`);
}
