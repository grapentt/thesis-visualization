// Bundle this video into one self-contained page: private/other/information-geometry/dist/information-geometry.html.
// Usage (from the repo root): node private/other/information-geometry/build.mjs

import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = new URL('./', import.meta.url);
const root = new URL('../../../', import.meta.url);
const STYLESHEET = '<link rel="stylesheet" href="../../../styles/player.css">';
const ENTRY = '<script type="module" src="./main.js"></script>';

const css = await readFile(new URL('styles/player.css', root), 'utf8');
const template = await readFile(new URL('index.html', here), 'utf8');
for (const marker of [STYLESHEET, ENTRY]) if (!template.includes(marker)) throw new Error(`index.html no longer contains: ${marker}`);

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('main.js', here))],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  write: false,
  legalComments: 'none',
});
const js = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = template.replace(STYLESHEET, `<style>\n${css}</style>`).replace(ENTRY, `<script>\n${js}</script>`);
await mkdir(new URL('dist/', here), { recursive: true });
await writeFile(new URL('dist/information-geometry.html', here), html);
console.log(`dist/information-geometry.html  ${(html.length / 1024).toFixed(0)} kB`);
