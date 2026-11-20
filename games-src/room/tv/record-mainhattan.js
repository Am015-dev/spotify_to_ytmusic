// Records portrait 375x667 touch trailers of Mainhattan Nightrun + Overdrive (both portrait-capable).
// Usage: node record-mainhattan.js [outDir=/tmp/mh-rec] [slug]; expects games/ served on http://localhost:8765/
// (python3 -m http.server 8765 --directory games). Frames come from a page.screenshot loop (the built-in screencast
// shrinks the page once Nightrun starts) and only while cap.on is true, so loading screens are cut out automatically.
// Overdrive is too heavy for screenshots (~2 fps) so it uses recordVideo (<slug>.raw.webm + marks, trim with ffmpeg -ss/-to).
// Output: <outDir>/<slug>/list.txt (ffconcat with real durations) -> `ffmpeg -f concat -safe 0 -i list.txt -vf fps=20 ...`
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2]||'/tmp/mh-rec';fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.BASE||'http://localhost:8765/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(slug,play,video){
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle']});
  const c=await b.newContext({viewport:{width:375,height:667},hasTouch:true,isMobile:true,...(video?{recordVideo:{dir:OUT+'/'+slug+'-vid',size:{width:375,height:667}}}:{})});
  const p=await c.newPage();const cdp=await c.newCDPSession(p);const t0=Date.now();const marks={};fs.mkdirSync(OUT+'/'+slug,{recursive:true});const cap={on:!video,n:0,t:[]};const loop=(async()=>{while(!cap.stop){if(video||!cap.on){await sleep(50);continue}const t=Date.now();const b=await p.screenshot({type:'jpeg',quality:85}).catch(()=>null);if(b){fs.writeFileSync(OUT+'/'+slug+'/f'+String(cap.n).padStart(5,'0')+'.jpg',b);cap.t.push(t);cap.n++}}})();
  const now=()=>Date.now()-t0;
  const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
  await p.goto(BASE+slug+'/index.html');
  await play({p,touch,sleep,marks,now,cap});cap.stop=true;await loop;
  marks.end=now();const v=video&&p.video();await c.close();await b.close();if(v)fs.renameSync(await v.path(),OUT+'/'+slug+'.raw.webm');
  let l='ffconcat version 1.0\n';for(let i=0;i<cap.n;i++){const d=i+1<cap.n?Math.min((cap.t[i+1]-cap.t[i])/1000,0.4):0.1;l+=`file f${String(i).padStart(5,'0')}.jpg\nduration ${d.toFixed(3)}\n`}
  fs.writeFileSync(OUT+'/'+slug+'/list.txt',l);fs.writeFileSync(OUT+'/'+slug+'.marks.json',JSON.stringify(marks));
  console.log(slug,JSON.stringify(marks));
}
const games={
 'mainhattan-nightrun':async({p,touch,sleep,marks,now,cap})=>{
  cap.on=false;await p.waitForSelector('#focFlight',{state:'visible'});await sleep(1500);cap.on=true;await sleep(1000);marks.title=now();await sleep(2500);
  await p.tap('#focFlight');await sleep(2500);marks.start=now();
  // drag finger side to side to weave and shoot; dash once
  let x=187,y=480;await touch('touchStart',[{id:1,x,y}]);
  const path=[120,250,140,300,110,260,200];
  for(const tx of path){for(let i=0;i<8;i++){x+=(tx-x)/4;await touch('touchMove',[{id:1,x,y}]);await sleep(120);}}
  await touch('touchEnd',[]);await p.tap('#bDash').catch(()=>{});
  x=187;await touch('touchStart',[{id:1,x,y}]);
  for(const tx of [260,150,230,120,200]){for(let i=0;i<8;i++){x+=(tx-x)/4;await touch('touchMove',[{id:1,x,y}]);await sleep(120);}}
  await touch('touchEnd',[]);
 },
 'mainhattan-overdrive':async({p,touch,sleep,marks,now,cap})=>{
  await p.waitForSelector('#ob2Play',{state:'visible'});await sleep(2500);marks.title=now();await sleep(1200);
  await p.tap('#ob2Play');cap.on=false;
  await p.waitForSelector('#tG',{state:'visible',timeout:90000});cap.on=true;await sleep(3500);marks.start=now();
  const r=s=>p.evaluate(s=>{const e=document.querySelector(s).getBoundingClientRect();return[e.x+e.width/2,e.y+e.height/2]},s);
  const [gx,gy]=await r('#tG'),[lx,ly]=await r('#tL'),[rx,ry]=await r('#tR'),[nx,ny]=await r('#tN');
  await touch('touchStart',[{id:1,x:gx,y:gy}]);await sleep(5000);
  for(const [d,ms] of [[1,350],[0,2500],[-1,450],[0,2200],[1,300],[0,1800],[-1,300]]){
    const pts=[{id:1,x:gx,y:gy}];
    if(d)pts.push({id:2,x:d>0?rx:lx,y:d>0?ry:ly});
    await touch('touchStart',pts);await sleep(ms);await touch('touchStart',[{id:1,x:gx,y:gy}]);
  }
  await touch('touchStart',[{id:1,x:gx,y:gy},{id:3,x:nx,y:ny}]);await sleep(3500);
  await touch('touchEnd',[]);
 }};
(async()=>{for(const s of (process.argv[3]?[process.argv[3]]:Object.keys(games)))await run(s,games[s],s==='mainhattan-overdrive');})();
