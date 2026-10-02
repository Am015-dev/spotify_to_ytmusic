// Desktop / tablet regression: node lay-desk.js <file> [WxH,...]  (no phone class must be set; prints canvas board size + overflow + errors)
const PW=require('/opt/node22/lib/node_modules/playwright');const path=require('path');
const file=process.argv[2]||'nebula.html';const SIZES=(process.argv[3]||'1366x768,1920x1080,768x1024').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [W,H] of SIZES){const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(60000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|ERR_/.test(m.text()))errs.push(m.text())});
 await p.goto('file://'+path.resolve(file));await p.waitForTimeout(1500);await p.evaluate(()=>{ANIM=0;AIDELAY=60;try{localStorage.setItem('na_tour','1')}catch(e){}});
 const m0=await p.evaluate(()=>({ph:document.documentElement.classList.contains('ph'),sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}));
 await p.evaluate(()=>document.querySelector('[data-start]').click());await p.waitForTimeout(1500);
 for(let i=0;i<3;i++){await p.evaluate(()=>{const a=document.querySelector('[data-a=autoplace]');if(a)a.click()});await p.waitForTimeout(300)}await p.waitForTimeout(1000);
 const m=await p.evaluate(()=>{const R=document.querySelector('.gx-board').getBoundingClientRect(),D=document.querySelector('.gx-dock').getBoundingClientRect(),cv=V3.r.domElement.getBoundingClientRect();
   V3.camera.updateMatrixWorld();const P=(x,y)=>{const v=W(x,y,0).project(V3.camera);return [cv.left+(v.x+1)/2*cv.width,cv.top+(1-v.y)/2*cv.height]};const cs=[P(0,0),P(MAT,0),P(MAT,MAT),P(0,MAT)];const xs=cs.map(a=>a[0]),ys=cs.map(a=>a[1]);
   const bad=[];for(const e of document.querySelectorAll('button,select')){const r=e.getBoundingClientRect();if(!r.width)continue;if(r.right>innerWidth+1||r.bottom>innerHeight+1)bad.push((e.className||e.tagName).toString().slice(0,20))}
   return {board:[Math.round(R.width),Math.round(R.height)],dock:[Math.round(D.width),Math.round(D.height)],mat:[Math.round(Math.max(...xs)-Math.min(...xs)),Math.round(Math.max(...ys)-Math.min(...ys))],ph:document.documentElement.classList.contains('ph'),sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,offscreen:bad.slice(0,4),tags:document.querySelectorAll('#tags .tag').length,tagsVisible:[...document.querySelectorAll('#tags .tag')].filter(e=>getComputedStyle(e).display!=='none').length,view:document.querySelector('.viewbar')&&getComputedStyle(document.querySelector('.viewbar')).display}});
 const over=m.sw>W+1||m.sh>H+1;if(m.ph||over||errs.length||m0.ph){bad++}
 console.log(W+'x'+H,JSON.stringify(m),over?'SCROLL':'',m.ph?'PH CLASS SET':'',errs.length?errs:'');await p.screenshot({path:`shots/desk_${path.basename(file,'.html')}_${W}x${H}.png`});await ctx.close()}
await b.close();console.log('PROBLEMS',bad)})();
