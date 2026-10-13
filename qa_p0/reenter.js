// qa_p0/reenter.js: P0 repro: roam → leave roam (menu) → enterRoam again (2nd hubEnter) → warp >2 km away → is the city there?
// usage: node qa_p0/reenter.js <url> <out>
const fs=require('fs');const{chromium,INIT}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1910,height:895},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT(60));await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 const waitRoam=async()=>{for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(1000)}};
 await waitRoam();await p.evaluate(()=>{window.__auto=false});
 const skip=()=>p.evaluate(()=>{for(let i=0;i<20;i++){__tick(5);for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}}});await skip();
 const shot=async n=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(2)});await p.screenshot({path:OUT+'/'+n+'.jpg',type:'jpeg',quality:60});await p.evaluate(()=>{window.__shooting=0})};
 const probe=()=>p.evaluate(()=>__g9ev(`(()=>{const rc=new THREE.Raycaster();rc.camera=camera;const wv=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};rc.set(new THREE.Vector3(RO.x,RO.y+60,RO.z),new THREE.Vector3(0,-1,0));const H=rc.intersectObject(HUB.grp,true).filter(h=>wv(h.object));const g=H.find(h=>Math.abs(h.point.y-RO.y)<2.5);
   let hidTop=0,lost=0;const inL=new Set((HUB.cull||[]).map(c=>c.o));for(const o of HUB.grp.children){if(o.visible===false){hidTop++;if((o.isMesh||o.isInstancedMesh)&&!inL.has(o))lost++}}
   return JSON.stringify({x:Math.round(RO.x),z:Math.round(RO.z),gnd:!!g,cull:(HUB.cull||[]).length,hidTop,lostHidden:lost,state})})()`));
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chEnd(false)}catch(e){}`));
 console.log('start',await probe());
 // leave roam to the menu and come back: the real "menu → continue" path (enterRoam with RO.built → 2nd hubEnter)
 await p.evaluate(()=>{window.__auto=true;__g9ev(`toMenu()`)});await p.waitForTimeout(1500);
 await p.evaluate(()=>__g9ev(`enterRoam()`));await waitRoam();await p.evaluate(()=>{window.__auto=false});await skip();
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chEnd(false)}catch(e){}`));
 console.log('re-entered',await probe());
 // warp far away (other end of the city) via the normal warp
 const tgt=await p.evaluate(()=>__g9ev(`(()=>{const G=qvGraph();let bi=0,bd=0;for(let i=0;i<G.n;i+=7){const d=Math.hypot(G.X[i]-RO.x,G.Z[i]-RO.z);if(d>bd&&d<3200&&!lzNeed(G.X[i],G.Z[i]).length){bd=d;bi=i}}RO.ftT=0;RO.ch=null;roamWarp(G.X[bi],G.Z[bi],0);__tick(30);return Math.round(bd)})()`));
 console.log('warped',tgt,await probe());await shot('r1_far_after_reenter');
 // garage → SAVE & DRIVE (real button), then warp far again
 await p.evaluate(()=>{window.__auto=true;__g9ev(`gbOpen()`)});await p.waitForTimeout(4000);
 await p.evaluate(()=>{const b=document.querySelector('#gbSave');if(b)b.click()});await waitRoam();await p.waitForTimeout(3000);await p.evaluate(()=>{window.__auto=false});await skip();
 console.log('after garage',await probe());
 const t2=await p.evaluate(()=>__g9ev(`(()=>{const G=qvGraph();let bi=0,bd=0;for(let i=3;i<G.n;i+=7){const d=Math.hypot(G.X[i]-RO.x,G.Z[i]-RO.z);if(d>bd&&d<3200&&!lzNeed(G.X[i],G.Z[i]).length){bd=d;bi=i}}RO.ftT=0;RO.ch=null;roamWarp(G.X[bi],G.Z[bi],0);__tick(30);return Math.round(bd)})()`));
 console.log('warped2',t2,await probe());await shot('r2_far_after_garage');
 // logbook ALL (TEST) → GO ⚡ Hot Drop (real button)
 await p.evaluate(()=>__g9ev(`try{journalOpen()}catch(e){}RO.jTab='tm';journalRender()`));
 const ok=await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-tmi]')].find(b=>/Hot Drop/.test(b.textContent));if(!b)return false;b.click();return true});
 for(let w=0;w<40;w++){await p.evaluate(()=>{window.__auto=true});await p.waitForTimeout(250)}await p.evaluate(()=>{window.__auto=false;__tick(30)});
 console.log('go hotdrop',ok,await probe());await shot('r3_go_hotdrop');
 console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));await b.close()})();
