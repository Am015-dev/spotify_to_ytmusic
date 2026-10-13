// qa_p0/repro.js: P0 "city not loading" repro at PC 1910x895. Fresh story load → shot; then logbook ALL(TEST) GO to marks → shot each.
// usage: node qa_p0/repro.js <url> <outdir> [w] [h]
const fs=require('fs');const{chromium,INIT}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa_p0/shots',W=+process.argv[4]||1910,H=+process.argv[5]||895;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT(60));await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 const skip=()=>p.evaluate(()=>{for(let i=0;i<20;i++){__tick(5);if(window.__m1&&__m1.cs&&__m1.cs())__m1.skip&&__m1.skip();for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}}});
 const shot=async(name)=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:OUT+'/'+name+'.jpg',type:'jpeg',quality:70});await p.evaluate(()=>{window.__shooting=0});
  const info=await p.evaluate(()=>__g9ev(`(()=>{let vis=0,hid=0,near=0,nearHid=0;const cx=camera.position.x,cz=camera.position.z;for(const c of HUB.cull||[]){const d=Math.hypot(c.x-cx,c.z-cz)-c.r;if(c.o.visible)vis++;else hid++;if(d<200){near++;if(!c.o.visible)nearHid++}}
    return JSON.stringify({x:Math.round(RO.x),z:Math.round(RO.z),y:+RO.y.toFixed(2),cam:[Math.round(cx),Math.round(camera.position.y),Math.round(cz)],cpos:HUB.cpos&&HUB.cpos.map(Math.round),cull:(HUB.cull||[]).length,vis,hid,near,nearHid,ch:!!RO.ch,dist:typeof districtAt=='function'?districtAt(RO.x,RO.z):''})})()`));console.log(name,info)};
 for(let k=0;k<4;k++)await skip();
 await shot('a0_fresh');
 for(let k=0;k<5;k++)await p.evaluate(()=>__tick(60));await shot('a1_fresh_5s');
 // logbook GO
 const marks=await p.evaluate(()=>__g9ev(`JSON.stringify(RO.marks.map((m,i)=>[i,m.kind,(()=>{try{return markTitle(m)}catch(e){return ''}})(),Math.round(m.x),Math.round(m.z)]))`));
 const M=JSON.parse(marks);console.log('marks',M.length,JSON.stringify(M.filter(m=>/Hot Drop|Hilde/i.test(m[2]))));
 const pick=[...M.filter(m=>/Hot Drop/i.test(m[2])).slice(0,1),...M.filter(m=>m[1]==='rival').slice(0,1),...M.filter(m=>m[1]==='quest').slice(0,1),...M.filter(m=>m[1]==='challenge').slice(0,1)];
 for(const [i,k,t] of pick){
  await p.evaluate(()=>__g9ev(`try{if(RO.ch)chEnd(false)}catch(e){}`));
  await p.evaluate(()=>__g9ev(`try{journalOpen()}catch(e){}RO.jTab='tm';journalRender()`));
  const ok=await p.evaluate(i=>{const b=document.querySelector(`[data-tmi="${i}"]`);if(!b)return false;b.click();return true},i);
  for(let w=0;w<60;w++){await p.evaluate(()=>__tick(10));await p.waitForTimeout(200)}
  await shot('b_go_'+k+'_'+i+(ok?'':'_noBtn'));}
 console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));await b.close()})();
