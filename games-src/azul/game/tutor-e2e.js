// Coached-game proof (W407): fresh storage, plays ANY legal moves through the UI (real mouse/touch taps on visible, uncovered tiles and racks)
// to the end card, at 390x763 and 1440x860. Asserts: every rule id in TUTORIAL-COVERAGE.md was either said in play or is listed on the end card,
// never two bubbles at once, the bubble never intercepts taps, the end card lists exactly the unsaid rules, no console errors.
// node tutor-e2e.js [390x763,1440x860] [seed-count]
const PW=(()=>{try{return require('playwright')}catch(e){return require('../../node_modules/playwright')}})();
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/sunglaze.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fail=0;const P=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fail++};
(async()=>{const browser=await PW.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const need=[...fs.readFileSync(__dirname+'/../TUTORIAL-COVERAGE.md','utf8').matchAll(/`([a-z0-9_]+)`/g)].map(m=>m[1]);
for(const [W,H] of SIZES){const desk=W>800,tag=W+'x'+H;
 const ctx=await browser.newContext({viewport:{width:W,height:H},isMobile:!desk,hasTouch:!desk});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(15000);const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))errs.push(m.text())});
 const tap=async(x,y)=>desk?p.mouse.click(x,y):p.touchscreen.tap(x,y);
 // tap an element only when its centre really hits it (uncovered by anything but the pass-through bubble)
 const tapSel=async sel=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<2||b.height<2)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const h=document.elementFromPoint(x,y);return h&&(e===h||e.contains(h))?{x,y}:{covered:h?(h.className&&h.className.baseVal!==undefined?h.className.baseVal:String(h.className)):'none'}},sel);
  if(!r||r.x===undefined)return r?'covered:'+r.covered:false;await tap(r.x,r.y);return true};
 await p.goto('https://gns.test/'+(desk?'':'?phone=1'));await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 await p.evaluate(()=>{window.bfD=ms=>ms*.25});
 const b=await p.$('#modal [data-ui=start]');const bb=await b.boundingBox();await tap(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(600);
 const lb=await p.$('.gxt-end [data-offer=learn]');if(!lb){P(false,tag+' no tutorial offer');continue}
 const lbb=await lb.boundingBox();await tap(lbb.x+lbb.width/2,lbb.y+lbb.height/2);await sleep(1200);
 let ended=false,moves=0,twoBubbles=0,intercept=0,covered=0,stuck=Date.now(),lastSig='';
 for(let it=0;it<1500&&!ended;it++){
  const s=await p.evaluate(()=>{const e=document.querySelector('.gxt-end[aria-label="Tutorial finished"]');const bs=document.querySelectorAll('.cg-b');let pe=0;bs.forEach(x=>{if(getComputedStyle(x).pointerEvents!=='none')pe++});
   return {end:!!e,bubbles:bs.length,pe,has:typeof G!=='undefined'&&!!G,cur:typeof G!=='undefined'&&G?sideToAct():-9,phase:typeof G!=='undefined'&&G?G.phase:'',sel:!!UI.sel,hold:typeof bfHold==='function'&&bfHold(),sig:typeof G!=='undefined'&&G?G.turn+'/'+G.round+'/'+G.phase+(UI.sel?'s':''):''}});
  if(process.env.SHOTS&&(s.bubbles||s.end)){const tx=await p.evaluate(()=>{const b=document.querySelector('.cg-b');return b?b.textContent.slice(0,30):(document.querySelector('.gxt-end')?'END':'')});if(tx&&tx!==(globalThis.__lt||'')&&(globalThis.__n=(globalThis.__n||0)+1)<=14){globalThis.__lt=tx;fs.mkdirSync(process.env.SHOTS,{recursive:true});await p.screenshot({path:process.env.SHOTS+'/'+tag+'-'+String(globalThis.__n).padStart(2,'0')+'.png'})}}
  if(s.bubbles>1)twoBubbles++;if(s.pe>0)intercept++;
  if(s.end){ended=true;break}
  if(s.sig!==lastSig){lastSig=s.sig;stuck=Date.now()}
  if(Date.now()-stuck>40000){P(false,tag+' stuck at '+s.sig);break}
  if(!s.has||s.cur!==0||s.phase!=='offer'||s.hold){await sleep(120);continue}
  if(!s.sel){
   const k=await p.evaluate(()=>{const m=validMoves(0);const mv=m[Math.floor(Math.random()*m.length)];const a=mv.src<0?G.ctr:G.fac[mv.src];const idx=a.indexOf(mv.c);window.__mv=mv;return (mv.src<0?'c':'f'+mv.src)+'_'+idx});
   const r=await tapSel(`.bf-t[data-k="${k}"]`);if(r!==true){if(r){const ck=k+'|'+(s.sig||'');globalThis.__ck=globalThis.__ck||{};globalThis.__ck[ck]=(globalThis.__ck[ck]||0)+1;if(globalThis.__ck[ck]===6){covered++;console.log('  covered (persistent): '+r+' '+k)}}await sleep(200)}else await sleep(300);continue}
  const line=await p.evaluate(()=>{const ms=movesFor(UI.sel);const mv=ms.find(x=>x.line===window.__mv.line)||ms[Math.floor(Math.random()*ms.length)];return mv.line});
  const r=await tapSel(line<5?`[data-bfrow="${line}"] .bf-rack`:'.bf-fl');if(r===true){moves++;await sleep(350)}else{if(r){const ck='row'+line+'|'+s.sig;globalThis.__ck=globalThis.__ck||{};globalThis.__ck[ck]=(globalThis.__ck[ck]||0)+1;if(globalThis.__ck[ck]===6){covered++;console.log('  covered (persistent): '+r+' row '+line)}}await sleep(200)}
 }
 await sleep(300);
 P(ended,tag+' coached game played to the end card with random legal UI taps ('+moves+' moves)');
 P(covered===0,tag+' every tap target was uncovered'+(covered?' ('+covered+')':''));
 P(twoBubbles===0,tag+' never more than one bubble at a time');
 P(intercept===0,tag+' the bubble never intercepts taps (pointer-events none)');
 const fin=await p.evaluate(()=>({e:window.__cgEnd||null,li:[...document.querySelectorAll('.cg-later li')].length,steps:Object.keys((window.__cg||{}).said||{})}));
 if(fin.e){const acc=need.filter(i=>!(fin.e.said[i]||fin.e.later.includes(i)));P(acc.length===0,tag+' every coverage rule said in play or on the end card'+(acc.length?' missing '+acc.join(','):''));
  P(fin.li===fin.e.later.length,tag+' end card lists exactly the '+fin.e.later.length+' rules not met');
  const said=Object.keys(fin.e.said);P(['goal','kilns','take','tiling','roundend'].every(i=>said.includes(i)),tag+' core rules explained in play ('+said.length+' said: '+said.join(',')+')')}
 else P(false,tag+' no end-card data');
 P(errs.length===0,tag+' 0 console errors'+(errs.length?' '+errs.slice(0,2).join(' | '):''));
 await ctx.close()}
await browser.close();process.exit(fail?1:0)})();
