// Export the built video to an MP4 with a macOS system voice reading the narration, English
// subtitles and chapter markers (the same recipe as the repo's scripts/export-narrated.mjs).
// Frames stream straight into ffmpeg; the voice clips live in dist/export-work/.
// Usage (from the repo root, after build.mjs):
//   PLAYWRIGHT_CHANNEL=chrome node private/other/information-geometry/export.mjs [--fps 24] [--width 1600] [--voice Samantha] [--audio-only]
// Writes private/other/information-geometry/information-geometry.mp4 and information-geometry.srt. Needs ffmpeg, ffprobe and `say`.

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const { values: args } = parseArgs({
  options: { width: { type: 'string', default: '1600' }, fps: { type: 'string', default: '24' }, voice: { type: 'string', default: 'Samantha' }, 'audio-only': { type: 'boolean', default: false } },
});
const width = Number(args.width);
const fps = Number(args.fps);
if (!Number.isInteger(width) || width < 320 || width % 32 || !Number.isInteger(fps) || fps < 1) throw new Error('Width must be a multiple of 32; fps must be a positive integer');
const here = new URL('./', import.meta.url);
const path = (p) => fileURLToPath(new URL(p, here));
const work = path('dist/export-work');
const dest = path('information-geometry.mp4');
const srt = path('information-geometry.srt');
await mkdir(work, { recursive: true });

function run(command, argv) {
  const r = spawnSync(command, argv, { encoding: 'utf8', maxBuffer: 8e6 });
  if (r.error || r.status !== 0) throw new Error(`${command}: ${r.error ?? r.stderr}`);
  return r.stdout;
}
const seconds = (file) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]).trim());
const timestamp = (t) => {
  const ms = Math.round(t * 1000);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  await page.goto(`file://${path('dist/information-geometry.html')}`);
  await page.waitForFunction(() => window.video);
  await page.evaluate(() => window.video.ready);
  const { scenes, duration } = await page.evaluate(() => ({ scenes: window.video.scenes, duration: window.video.duration }));

  // one voice clip per narration cue, fitted into its slot
  const cues = scenes.flatMap((s) => {
    const lines = Array.isArray(s.narration) ? s.narration : [[0, s.narration]];
    return lines.map(([t, text], i) => ({ start: s.start + t, duration: (lines[i + 1]?.[0] ?? s.duration) - t, text }));
  });
  const audio = [];
  const subtitles = [];
  let number = 1;
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    const base = `${work}/cue-${String(i).padStart(3, '0')}`;
    await writeFile(`${base}.txt`, c.text);
    run('say', ['-v', args.voice, '-r', '155', '-f', `${base}.txt`, '-o', `${base}.aiff`]);
    const spoken = seconds(`${base}.aiff`);
    if (!(spoken > 0)) throw new Error(`The system voice did not synthesise cue ${i}`);
    const speed = Math.max(1, spoken / (c.duration - 1.2));
    const speech = spoken / speed;
    const samples = Math.round(c.duration * 48000);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `${base}.aiff`, '-af', `aresample=48000,atempo=${speed.toFixed(8)},asetpts=N/SR/TB,adelay=550:all=1,apad,atrim=end_sample=${samples},asetpts=N/SR/TB`, '-ar', '48000', '-ac', '1', `${base}.wav`]);
    if (Math.abs(seconds(`${base}.wav`) - c.duration) > 1 / 48000) throw new Error(`Cue ${i} does not fit its slot of ${c.duration} s`);
    audio.push(`${base}.wav`);
    const words = c.text.split(/\s+/);
    for (let j = 0; j < words.length; j += 15) {
      const chunk = words.slice(j, j + 15).join(' ');
      const a = c.start + 0.55 + (speech * j) / words.length;
      const b = c.start + 0.55 + (speech * Math.min(j + 15, words.length)) / words.length;
      subtitles.push(`${number++}\n${timestamp(a)} --> ${timestamp(b)}\n${chunk}\n`);
    }
    if (i % 5 === 0) console.log(`Narration ${i + 1}/${cues.length} · ${spoken.toFixed(1)} s spoken in a ${c.duration} s slot`);
  }
  await writeFile(`${work}/audio.txt`, audio.map((p) => `file '${p.replaceAll("'", "'\\''")}'`).join('\n'));
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${work}/audio.txt`, '-c:a', 'aac', '-b:a', '128k', `${work}/narration.m4a`]);
  await writeFile(srt, subtitles.join('\n'));
  await writeFile(`${work}/chapters.txt`, ';FFMETADATA1\ntitle=Information geometry\n' + scenes.map((s) => `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(s.start * 1000)}\nEND=${Math.round((s.start + s.duration) * 1000)}\ntitle=${s.name.replace(/[=;#\\]/g, '')}\n`).join(''));
  if (args['audio-only']) {
    console.log('Narration and subtitles written.');
  } else {
    const encoder = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', `${work}/picture.mp4`], { stdio: ['pipe', 'ignore', 'pipe'] });
    let encoderErrors = '';
    encoder.stderr.on('data', (b) => (encoderErrors += b.toString()));
    const closed = once(encoder, 'close');
    const count = Math.round(duration * fps);
    console.log(`Rendering ${count} frames at ${width} × ${(width * 9) / 16}, ${fps} fps`);
    for (let n = 0; n < count; n += 8) {
      const frames = await page.evaluate(({ n, count, fps, width }) => Array.from({ length: Math.min(8, count - n) }, (_, i) => window.video.frame((n + i) / fps, width, { mimeType: 'image/jpeg', quality: 0.94 }).split(',')[1]), { n, count, fps, width });
      for (const data of frames) if (!encoder.stdin.write(Buffer.from(data, 'base64'))) await once(encoder.stdin, 'drain');
      if (n % (fps * 15) === 0) console.log(`Picture ${Math.floor(n / fps)}/${Math.round(duration)} s`);
    }
    encoder.stdin.end();
    const [code] = await closed;
    if (code !== 0) throw new Error(encoderErrors);
    if (errors.length) throw new Error(errors.join('\n'));
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `${work}/picture.mp4`, '-i', `${work}/narration.m4a`, '-i', srt, '-i', `${work}/chapters.txt`, '-map', '0:v', '-map', '1:a', '-map', '2:s', '-map_metadata', '3', '-map_chapters', '3', '-c:v', 'copy', '-c:a', 'copy', '-c:s', 'mov_text', '-metadata:s:a:0', 'language=eng', '-metadata:s:s:0', 'language=eng', '-movflags', '+faststart', '-t', String(duration), dest]);
    console.log(`Wrote ${dest} with narration, subtitles and ${scenes.length} chapters.`);
  }
} finally {
  await browser.close();
}
