import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out=new URL('../frames/covariance-review/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))errors.push(m.text());});
await page.goto(new URL('../dist/covariance.html',import.meta.url).href);await page.waitForFunction(()=>window.video);await page.evaluate(()=>window.video.ready);
const scenes=await page.evaluate(()=>window.video.scenes);await writeFile(new URL('timeline.json',out),JSON.stringify(scenes,null,2));
let framesChecked=0;
for(let i=0;i<scenes.length;i++){
 const s=scenes[i];const times=[.1,8,18,33,s.duration-.8,...s.narration.map(([t])=>t+3)];
 for(const t of times){await page.evaluate(T=>window.video.frame(T,800),s.start+t);framesChecked++;}
 const img=await page.evaluate(T=>window.video.frame(T,1600),s.start+(s.duration>45?50:33));
 await writeFile(new URL(`${String(i).padStart(2,'0')}.png`,out),Buffer.from(img.split(',')[1],'base64'));
}
// Every authored cue must leave enough reading / speaking time.
for(const s of scenes)for(let i=0;i<s.narration.length;i++){
 const [t,words]=s.narration[i],length=(s.narration[i+1]?.[0]??s.duration)-t;
 console.log(`${s.name} cue ${i}: ${words.split(/\s+/).length} words / ${length}s`);
}
await browser.close();if(errors.length)throw new Error(errors.join('\n'));console.log(`Checked ${scenes.length} chapters, ${framesChecked} frames.`);
