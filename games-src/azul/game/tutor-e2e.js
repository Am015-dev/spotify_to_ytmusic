// Tutorial-to-end proof: fresh storage, taps the centre of each spotlit hole with real touch/mouse input, asserts the target is not covered,
// asserts every coverage step id was shown, reaches the end card. node tutor-e2e.js [390x763,1440x860]
const PW=(()=>{try{return require('playwright')}catch(e){return require('../../node_modules/playwright')}})();
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/sunglaze.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fail=0;const P=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fail++};
(async()=>{const browser=await PW.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const [W,H] of SIZES){const desk=W>800,tag=W+'x'+H;
 const ctx=await browser.newContext({viewport:{width:W,height:H},isMobile:!desk,hasTouch:!desk});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(15000);const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))errs.push(m.text())});
 const tap=async(x,y)=>desk?p.mouse.click(x,y):p.touchscreen.tap(x,y);
 await p.goto('https://gns.test/'+(desk?'':'?phone=1'));await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 await p.evaluate(()=>{window.bfD=ms=>ms*.25});
 const b=await p.$('#modal [data-ui=start]');const bb=await b.boundingBox();await tap(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(600);
 const lb=await p.$('.gxt-end [data-offer=learn]');if(!lb){P(false,tag+' no tutorial offer');continue}
 const lbb=await lb.boundingBox();await tap(lbb.x+lbb.width/2,lbb.y+lbb.height/2);await sleep(1200);
 let parts=0;const seen=[];let lastId='',stuck=Date.now(),ended=false,covered=0;
 for(let it=0;it<400&&!ended;it++){
  const s=await p.evaluate(()=>{const e=document.querySelector('.gxt-end');if(e&&/finished/i.test(e.getAttribute('aria-label')||''))return{end:true,part:!!e.querySelector('[data-gxt-end=partB]')};return typeof GXT!=='undefined'?GXT.state():null});
  if(!s||!s.active&&!s.end){await sleep(150);continue}
  if(s.end){if(s.part){parts++;const nb=await p.$('[data-gxt-end=partB]');const r=await nb.boundingBox();await tap(r.x+r.width/2,r.y+r.height/2);await sleep(900);lastId='';continue}ended=true;break}
  if(s.phase!=='show'||!s.hole){await sleep(120);if(Date.now()-stuck>25000){P(false,tag+' stuck pending at '+s.id);break}continue}
  if(s.id!==lastId){seen.push(s.id);lastId=s.id;stuck=Date.now();await sleep(350);continue}
  const hit=await p.evaluate(h=>{const e=document.elementFromPoint(h.cx,h.cy);return e?{cls:e.className&&e.className.baseVal!==undefined?e.className.baseVal:String(e.className),help:!!e.closest('.gxt-cell,.gxt-bub,.gxt-top'),tag:e.tagName}:null},s.hole);
  if(!s.wait){const nb=await p.$('.gxt-next');if(nb){const r=await nb.boundingBox();await tap(r.x+r.width/2,r.y+r.height/2)}await sleep(250);continue}
  if(hit&&hit.help){covered++;console.log('  covered target at '+s.id+' '+JSON.stringify(hit))}
  await tap(s.hole.cx,s.hole.cy);await sleep(400);
  if(Date.now()-stuck>20000){P(false,tag+' stuck waiting at '+s.id);break}
 }
 P(ended&&parts===1,tag+' tutorial reached the end card through both parts ('+seen.length+' steps)');
 P(covered===0,tag+' every target uncovered at its centre');
 const need=(fs.existsSync(__dirname+'/../TUTORIAL-COVERAGE.md')?[...fs.readFileSync(__dirname+'/../TUTORIAL-COVERAGE.md','utf8').matchAll(/`([a-z0-9_]+)`/g)].map(m=>m[1]):[]);
 const miss=need.filter(i=>!seen.includes(i));P(miss.length===0,tag+' every coverage step shown'+(miss.length?' missing '+miss.join(','):''));
 P(errs.length===0,tag+' 0 console errors'+(errs.length?' '+errs.slice(0,2).join(' | '):''));
 console.log('  steps: '+seen.join(','));
 await ctx.close()}
await browser.close();process.exit(fail?1:0)})();
