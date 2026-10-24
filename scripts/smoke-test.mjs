// Render the start, middle and end of every scene of every built video in a
// headless browser and fail if any scene throws or a page logs an error.
// Built explorables are loaded and run for a second; they fail only on uncaught errors.
// Usage: npm run build && npm test
//        PLAYWRIGHT_CHANNEL=chrome npm test   (use the installed Google Chrome instead of Playwright's Chromium)

import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is missing. Run: npm install && npx playwright install chromium');
  process.exit(1);
}

const dist = new URL('../dist/', import.meta.url);
const pages = (await readdir(dist)).filter((f) => f.endsWith('.html'));
if (!pages.length) {
  console.error('No built videos in dist/. Run npm run build first.');
  process.exit(1);
}
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
const errors = [];
let sceneCount = 0;
for (const file of pages) {
  const tab = await browser.newPage();
  tab.on('pageerror', (err) => errors.push(`${file}: ${err.message}`));
  tab.on('console', (msg) => {
    // network errors for fonts / MathJax are expected offline; the page falls back
    if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) errors.push(`${file}: ${msg.text()}`);
  });
  await tab.goto(`file://${fileURLToPath(new URL(file, dist))}`);
  await tab.waitForFunction(() => window.video !== undefined);
  const scenes = await tab.evaluate(() => window.video.scenes);
  for (const scene of scenes) {
    for (const f of [0.01, 0.5, 0.99]) {
      await tab.evaluate((T) => window.video.frame(T, 640), scene.start + f * scene.duration);
    }
  }
  sceneCount += scenes.length;
  await tab.close();
}

// console errors are not counted here: offline, three.js and fonts fail to load and the page falls back
const explorableDir = new URL('explorables/', dist);
const explorables = (await readdir(explorableDir).catch(() => [])).filter((f) => f.endsWith('.html'));
for (const file of explorables) {
  const tab = await browser.newPage();
  tab.on('pageerror', (err) => errors.push(`explorables/${file}: ${err.message}`));
  try {
    await tab.goto(`file://${fileURLToPath(new URL(file, explorableDir))}`, { timeout: 15_000 });
    await tab.waitForTimeout(1000);
  } catch (err) {
    errors.push(`explorables/${file}: ${err.message}`);
  }
  await tab.close();
}
await browser.close();

if (errors.length) {
  console.error(`✗ ${errors.length} error(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
const explorableCount = `${explorables.length} explorable${explorables.length === 1 ? '' : 's'}`;
console.log(`✓ ${pages.length} videos (${sceneCount} scenes) and ${explorableCount} ran without errors`);
