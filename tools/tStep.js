// tStep.js (qa-1, TK slice 1): same seed + same inputs → same car position after 600 fixed steps, twice in one page load.
// usage: node tools/tStep.js [url] [outdir]   (default http://127.0.0.1:8766/local_dbg.html?seed=7, qa_tk)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html?seed=7',OUT=process.argv[3]||'qa_tk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T0=Date.now(),b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500,timeout:120000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500,timeout:120000});
 await p.click('#hcStory');await p.waitForTimeout(300);await p.click('#slotList .go');
 await p.waitForFunction(()=>window.__mho&&__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:1000,timeout:240000});
 console.log('roam after',((Date.now()-T0)/1000).toFixed(1),'s');
 const SP=await p.evaluate(()=>{const R=__mho.RO,q=__mho.rsnap(R.x,R.z,200);return q?[q[0],q[1],q[2]??R.h]:[R.x,R.z,R.h]});console.log('spot',SP);
 const trial=async k=>{const t=Date.now();const r0=await p.evaluate(SP=>{__odHold(1);const R=__mho.RO;for(const s of['#storyGo','#m1Cs','#tutSkip'])document.querySelector(s)?.click();
   R.card=null;R.frozen=false;const ok=__mho.warp(SP[0],SP[1],SP[2]);__odSeed(7);return{ok,x:R.x,z:R.z}},SP);
  await p.keyboard.down('ArrowUp');const r=await p.evaluate(()=>{__odStep(300);return 1});await p.keyboard.down('ArrowLeft');await p.evaluate(()=>__odStep(120));await p.keyboard.up('ArrowLeft');
  const o=await p.evaluate(()=>{__odStep(180);const R=__mho.RO;return{x:+R.x.toFixed(4),z:+R.z.toFixed(4),h:+R.h.toFixed(4),v:+R.v.toFixed(4),clk:__odClock()}});await p.keyboard.up('ArrowUp');
  await p.screenshot({path:`${OUT}/step_run${k}.png`});console.log('run',k,JSON.stringify(r0),JSON.stringify(o),((Date.now()-t)/1000).toFixed(1)+'s');return o};
 const a=await trial(1),c=await trial(2);const same=a.x===c.x&&a.z===c.z&&a.h===c.h&&a.v===c.v,moved=Math.hypot(a.x-SP[0],a.z-SP[1])>20;
 console.log((same&&moved?'PASS':'FAIL')+' same seed + inputs → same pose after 600 steps · moved '+Math.hypot(a.x-SP[0],a.z-SP[1]).toFixed(1)+' m · errors '+errs.length);
 if(errs.length)console.log(errs.slice(0,5).join('\n'));fs.writeFileSync(`${OUT}/step.json`,JSON.stringify({a,c,same,moved,errs},null,1));await b.close()})();
