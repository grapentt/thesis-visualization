// Bundle every video into one self-contained HTML file: dist/<id>.html.
// Usage: npm run build            (all videos)
//        npm run build -- part-0  (only the named ones)

import { build } from 'esbuild';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const STYLESHEET = '<link rel="stylesheet" href="./styles/player.css">';
const ENTRY = '<script type="module" src="./src/main.js"></script>';
const TITLE = /<title>.*<\/title>/;

const css = await readFile(new URL('styles/player.css', root), 'utf8');
const template = await readFile(new URL('index.html', root), 'utf8');
for (const marker of [STYLESHEET, ENTRY]) {
  if (!template.includes(marker)) throw new Error(`index.html no longer contains: ${marker}`);
}

const videoDirs = (await readdir(new URL('src/videos/', root), { withFileTypes: true }))
  .filter((d) => d.isDirectory() && d.name !== 'common')
  .map((d) => d.name);
const wanted = process.argv.slice(2);
const ids = wanted.length ? videoDirs.filter((id) => wanted.includes(id)) : videoDirs;

await mkdir(new URL('dist/', root), { recursive: true });
for (const id of ids) {
  const meta = JSON.parse(await readFile(new URL(`src/videos/${id}/meta.json`, root), 'utf8'));
  const bundle = await build({
    stdin: {
      contents: `import { mountVideo } from './src/app.js';\nimport video from './src/videos/${id}/index.js';\nmountVideo(video);\n`,
      resolveDir: fileURLToPath(root),
      loader: 'js',
    },
    bundle: true,
    format: 'iife',
    target: 'es2022',
    minify: true,
    write: false,
    legalComments: 'none',
  });
  const js = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = template
    .replace(TITLE, `<title>${meta.title}</title>`)
    .replace(STYLESHEET, `<style>\n${css}</style>`)
    .replace(ENTRY, `<script>\n${js}</script>`);
  await writeFile(new URL(`dist/${id}.html`, root), html);
  console.log(`dist/${id}.html  ${(html.length / 1024).toFixed(0)} kB`);
}
