// Proof video: the first 3 minutes of a first-timer at 375x667 (fresh storage, default page), touch taps only:
// title -> "New here?" guided game (taps what glows) -> "Play a real game" -> a real game vs the computer (gold mark, then a ticked tile + Place).
//   node tools/proof-video.js [out=../proof/first-3min-375x667.webm] [secs=180]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../../scripts/gx-serve.js');const fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]||path.join(__dirname,'..','..','proof','first-3min-375x667.webm')),SECS=+(process.argv[3]||180);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'..','tidewake.html')});
  const b=await PW.chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const vdir=fs.mkdtempSync('/tmp/twvid-');
  const c=await b.newContext({viewport:{width:375,height:667},hasTouch:true,isMobile:true,recordVideo:{dir:vdir,size:{width:375,height:667}}});const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);await sleep(800);await p.evaluate(()=>localStorage.clear());await p.reload();const T0=Date.now();await sleep(2500);
  const left=()=>SECS*1000-(Date.now()-T0);const tapC=async sel=>{const r=await p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(e=>{if(!e.offsetWidth||e.closest('[hidden]'))return false;const q=e.getBoundingClientRect(),h=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return h&&(h===e||e.contains(h))});if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await p.touchscreen.tap(r[0],r[1]);return true};
  const log=[];
  if(await tapC('#start [data-gxt-open]'))log.push('tutorial');await sleep(1200);
  // guided game: tap the ring of each step, or the button between steps
  while(left()>0){const s=await p.evaluate(()=>{if(document.querySelector('[data-gxt-end]'))return {end:1};const st=GXT.state();if(!st.active||!st.shown)return {wait:1};const r=document.querySelector('.gxt-ring');if(!r)return {wait:1};const q=r.getBoundingClientRect();return {id:st.id,x:q.left+q.width/2,y:q.top+q.height/2}});
    if(s.end)break;if(s.wait){if(!(await tapC('#pc [data-ph=dismiss]')))await sleep(300);else await sleep(900);continue}
    await sleep(1400);await p.touchscreen.tap(s.x,s.y);log.push(s.id);await sleep(500)}
  await sleep(1500);if(await tapC('[data-gxt-end=play]'))log.push('play real game');else log.push('NO play button');await sleep(2000);
  // real games until time is up
  let games=1;while(left()>0){if(!(await p.evaluate(()=>!!(G&&UI.started)))){log.push('not in a game');break}const st=await p.evaluate(()=>({over:!!G.over,phase:G.phase,busy:!!UI.busy,d:sideToAct(),me:G.seats.findIndex(s=>s.human),q:G.q&&G.q.who===G.seats.findIndex(s=>s.human),pc:PH.cur&&PH.cur.kind,pop:PH.pop}));
    if(st.pc==='sunk'){await sleep(1500);await tapC('#pc [data-a=sunkok]');continue}
    if(st.over||st.pc==='over'){await sleep(3000);if(await tapC('[data-a=again],#res [data-a=again],button.btn.pri[data-a=again]')){games++;log.push('play again');await sleep(2000)}else await sleep(500);continue}
    if(st.busy||st.d!==st.me){await sleep(300);continue}
    if(st.q){await sleep(1200);await tapC('#pc [data-a=q]');await sleep(600);continue}
    if(st.phase==='setup'){await sleep(1500);if(st.pop!=='start'){const z=await p.evaluate(()=>{const l=[...document.querySelectorAll('.ozone')].filter(e=>getComputedStyle(e).pointerEvents!=='none');const e=l[Math.floor(l.length/2)];if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]});if(z)await p.touchscreen.tap(z[0],z[1]);else await tapC('.gxh-ok');await sleep(1200)}
      await tapC('#ppop [data-a=startmark]');await sleep(800);continue}
    // my turn: pick a ticked tile (first one), then Place
    await sleep(1500);const ok=await p.evaluate(()=>{const l=[...document.querySelectorAll('#ps .pt:not(.sp),#ppop .ph-t:not(.sp)')].filter(e=>e.offsetWidth);return l.length});
    if(await tapC('.gxh-ok'))await sleep(500);
    if(ok){await tapC('#ps .pt:not(.sp),#ppop .ph-t:not(.sp)');await sleep(1000)}
    if(!(await tapC('#ppop [data-a=place]:not([disabled]),#ps [data-a=place]:not([disabled])'))){await tapC('#ps [data-a=pass]');}
    await sleep(1500)}
  const v=p.video();await c.close();await v.saveAs(OUT);await b.close();
  console.log(log.slice(-6).join(','));console.log('saved',OUT,Math.round(fs.statSync(OUT).size/1024)+' KB; steps',log.length,'games',games,'page errors',errs.length,errs.slice(0,3).join(' | '));process.exit(0)})();
