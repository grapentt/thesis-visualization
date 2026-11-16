// Export any authored video with a macOS system voice, captions, and MP4 chapters.
// npm run build -- covariance
// PLAYWRIGHT_CHANNEL=chrome node scripts/export-narrated.mjs --video covariance
// Frames stream directly to ffmpeg; temporary audio lives in frames/<id>-export/.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
const {values:args}=parseArgs({options:{video:{type:'string',default:'covariance'},width:{type:'string',default:'1600'},fps:{type:'string',default:'24'},voice:{type:'string',default:'Samantha'},'audio-only':{type:'boolean',default:false}}});
if(!/^[a-z0-9-]+$/.test(args.video))throw new Error('Invalid video ID');
const width=Number(args.width),fps=Number(args.fps);
if(!Number.isInteger(width)||width<320||width%32||!Number.isInteger(fps)||fps<1)throw new Error('Width must be a multiple of 32; fps must be a positive integer');
const work=resolve(`frames/${args.video}-export`),dest=resolve(`dist/${args.video}.mp4`);
await mkdir(work,{recursive:true});
function run(command,argv){const r=spawnSync(command,argv,{encoding:'utf8',maxBuffer:8e6});if(r.error||r.status!==0)throw new Error(`${command}: ${r.error??r.stderr}`);return r.stdout;}
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))errors.push(m.text());});
 await page.goto(`file://${resolve(`dist/${args.video}.html`)}`);await page.waitForFunction(()=>window.video);await page.evaluate(()=>window.video.ready);
 const {scenes,duration}=await page.evaluate(()=>({scenes:window.video.scenes,duration:window.video.duration}));
 await writeFile(`${work}/timeline.json`,JSON.stringify(scenes,null,2));
 const cues=scenes.flatMap(s=>{const lines=Array.isArray(s.narration)?s.narration:[[0,s.narration]];return lines.map(([t,text],i)=>({start:s.start+t,duration:(lines[i+1]?.[0]??s.duration)-t,text}));});
 const audioPaths=[],subtitles=[];let subtitleNumber=1;
 const timestamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
 for(let i=0;i<cues.length;i++){
  const c=cues[i],base=`${work}/cue-${String(i).padStart(3,'0')}`;
  await writeFile(`${base}.txt`,c.text);
  run('say',['-v',args.voice,'-r','155','-f',`${base}.txt`,'-o',`${base}.aiff`]);
  const seconds=Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',`${base}.aiff`]).trim());
  if(!(seconds>0))throw new Error(`System voice did not synthesize cue ${i}`);
  const speed=Math.max(1,seconds/(c.duration-1.2));const speechDuration=seconds/speed;
  // Tempo filtering can preserve an input timestamp offset. Trim by sample
  // count after resampling and reset timestamps so short cue offsets cannot
  // accumulate into narration/chapter drift across the complete video.
  const cueSamples=Math.round(c.duration*48000);
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`${base}.aiff`,'-af',`aresample=48000,atempo=${speed.toFixed(8)},asetpts=N/SR/TB,adelay=550:all=1,apad,atrim=end_sample=${cueSamples},asetpts=N/SR/TB`,'-ar','48000','-ac','1',`${base}.wav`]);
  const actualDuration=Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',`${base}.wav`]).trim());
  if(Math.abs(actualDuration-c.duration)>1/48000)throw new Error(`Narration cue ${i} duration ${actualDuration} differs from slot ${c.duration}`);
  audioPaths.push(`${base}.wav`);
  const words=c.text.split(/\s+/);for(let j=0;j<words.length;j+=15){
   const chunk=words.slice(j,j+15).join(' '),start=c.start+.55+speechDuration*j/words.length,end=c.start+.55+speechDuration*Math.min(j+15,words.length)/words.length;
   subtitles.push(`${subtitleNumber++}\n${timestamp(start)} --> ${timestamp(end)}\n${chunk}\n`);
  }
  if(i%5===0)console.log(`Narration ${i+1}/${cues.length} · ${seconds.toFixed(1)}s in ${c.duration}s slot`);
 }
 const escapeConcat=p=>p.replaceAll("'","'\\''");
 await writeFile(`${work}/audio.txt`,audioPaths.map(p=>`file '${escapeConcat(p)}'`).join('\n'));
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',`${work}/audio.txt`,'-c:a','aac','-b:a','128k',`${work}/narration.m4a`]);
 await writeFile(resolve(`dist/${args.video}.srt`),subtitles.join('\n'));
 await writeFile(`${work}/chapters.txt`,';FFMETADATA1\ntitle=Covariance — The geometry of fluctuations\n'+scenes.map(s=>`[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(s.start*1000)}\nEND=${Math.round((s.start+s.duration)*1000)}\ntitle=${s.name.replace(/[=;#\\]/g,'')}\n`).join(''));
 if(args['audio-only']){console.log('Narration and captions complete.');process.exitCode=0;}
 else {
  const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',`${work}/picture.mp4`],{stdio:['pipe','ignore','pipe']});
  let encoderErrors='';encoder.stderr.on('data',b=>encoderErrors+=b.toString());const completion=once(encoder,'close');
  const count=Math.round(duration*fps);console.log(`Rendering ${count} frames at ${width} × ${width*9/16}, ${fps} fps`);
  for(let n=0;n<count;n+=8){
   const frames=await page.evaluate(({n,count,fps,width})=>Array.from({length:Math.min(8,count-n)},(_,i)=>window.video.frame((n+i)/fps,width,{mimeType:'image/jpeg',quality:.94}).split(',')[1]),{n,count,fps,width});
   for(const data of frames)if(!encoder.stdin.write(Buffer.from(data,'base64')))await once(encoder.stdin,'drain');
   if(n%(fps*15)===0)console.log(`Picture ${Math.floor(n/fps)}/${duration}s`);
  }
  encoder.stdin.end();const [exitCode]=await completion;if(exitCode!==0)throw new Error(encoderErrors);
  if(errors.length)throw new Error(errors.join('\n'));
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`${work}/picture.mp4`,'-i',`${work}/narration.m4a`,'-i',resolve(`dist/${args.video}.srt`),'-i',`${work}/chapters.txt`,'-map','0:v','-map','1:a','-map','2:s','-map_metadata','3','-map_chapters','3','-c:v','copy','-c:a','copy','-c:s','mov_text','-metadata:s:a:0','language=eng','-metadata:s:s:0','language=eng','-movflags','+faststart','-t',String(duration),dest]);
  console.log(`Wrote ${dest} with narration, subtitles, and ${scenes.length} chapters.`);
 }
} finally {await browser.close();}
