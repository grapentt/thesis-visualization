// Bundle this video into one self-contained page: private/other/u1-force/dist/u1-force.html.
// Usage (from the repo root): node private/other/u1-force/build.mjs [--only 03-holonomy,04-curvature] [--out dist/probe.html]
//   --only: build a page with just these scene files (names in scenes/, without .js), for working on them
//   --out:  where to write the page, relative to this folder (default dist/u1-force.html)

import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({ options: { only: { type: 'string' }, out: { type: 'string', default: 'dist/u1-force.html' } } });

const here = new URL('./', import.meta.url);
const root = new URL('../../../', import.meta.url);
const STYLESHEET = '<link rel="stylesheet" href="../../../styles/player.css">';
const ENTRY = '<script type="module" src="./main.js"></script>';

const css = await readFile(new URL('styles/player.css', root), 'utf8');
const template = await readFile(new URL('index.html', here), 'utf8');
for (const marker of [STYLESHEET, ENTRY]) if (!template.includes(marker)) throw new Error(`index.html no longer contains: ${marker}`);

let entry = fileURLToPath(new URL('main.js', here));
if (args.only) {
  // a temporary entry that mounts only the named scenes, in the given order
  const names = args.only.split(',').map((s) => s.trim()).filter(Boolean);
  await mkdir(new URL('dist/', here), { recursive: true });
  const source = [
    "import { mountVideo } from '../../../../src/app.js';",
    "import meta from '../meta.json' with { type: 'json' };",
    ...names.map((n, i) => `import s${i} from '../scenes/${n}.js';`),
    `mountVideo({ ...meta, scenes: [${names.map((_, i) => `s${i}`).join(', ')}], posterTime: 0 });`,
  ].join('\n');
  entry = fileURLToPath(new URL(`dist/entry-${names.join('+').replace(/[^\w+-]/g, '')}.js`, here));
  await writeFile(entry, source);
}

const bundle = await build({
  entryPoints: [entry],
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
await writeFile(new URL(args.out, here), html);
console.log(`${args.out}  ${(html.length / 1024).toFixed(0)} kB`);
