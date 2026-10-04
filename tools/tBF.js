// tBF: regression tests for the BF play-test fixes (real keys/clicks where it matters). usage: node tBF.js
const {boot}=require('./common.js');const F=require('./fast.js');
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
(async()=>{{const r=await boot({view:'desk',page:process.env.PAGE||'local_dbg.html'});const p=r.p;await F.on(p);
 for(let i=0;i<40;i++){if(await p.evaluate(()=>!!(window.__m1&&__m1.marks().length)))break;await p.evaluate(()=>__mho.roamSim(30));await p.waitForTimeout(200)}
 await p.evaluate(()=>{__m1.skip();__m1.start('hunt');for(let i=0;i<10;i++){__m1.skip();__mho.roamSim(30)}});
 const st=()=>p.evaluate(()=>({t:__mho.qv.ch()&&__mho.qv.ch().t,x:__mho.RO.x,z:__mho.RO.z,ch:!!__mho.RO.ch}));
 // BF1 garage: opened from the pause menu mid-event, holding gas must not drive the car or run the event timer
 await p.keyboard.press('Escape');await p.waitForTimeout(200);
 const g=await p.evaluate(()=>!document.querySelector('#roamPause [data-p="garage"]').hidden);
 ok(!g,'BF2 GARAGE is hidden in the pause menu while an event runs (saving would silently abort it)');
// garage is still reachable outside events (and via the menu): force the button to test the overlay freeze
 await p.evaluate(()=>{const b=document.querySelector('#roamPause [data-p="garage"]');b.hidden=false;b.click()});await p.waitForTimeout(300);
 let a,b;if(await p.evaluate(()=>{const g=document.querySelector('#gbx');return !g||g.hidden||getComputedStyle(g).display==='none'})){
  // GB (garage builder) refuses the garage during an event: the overlay must not open and the pause menu must be closed
  ok(await p.evaluate(()=>!__mho.RO.pOpen&&!!__mho.RO.ch),'BF1 garage refused mid-event (GB): no overlay, pause closed, event still running');
 }else{a=await st();await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.roamSim(120));await p.keyboard.up('ArrowUp');b=await st();
 ok(Math.hypot(b.x-a.x,b.z-a.z)<1&&Math.abs(b.t-a.t)<.05,'BF1 garage overlay open: gas held 2 s does not move the car nor run the event clock',{moved:+Math.hypot(b.x-a.x,b.z-a.z).toFixed(1),dt:+(b.t-a.t).toFixed(2)});
 await p.keyboard.press('Escape');await p.waitForTimeout(200)}
 // BF1 map: M key opens the full map; the event clock must not run behind it
 await p.keyboard.press('KeyM');await p.waitForTimeout(200);a=await st();await p.evaluate(()=>__mho.roamSim(120));b=await st();
 ok(await p.evaluate(()=>__mho.RO.mapOpen)&&Math.abs(b.t-a.t)<.05,'BF1 full map open: event clock paused',{dt:+(b.t-a.t).toFixed(2)});
 await p.keyboard.press('KeyM');await p.waitForTimeout(200);a=await st();await p.evaluate(()=>__mho.roamSim(60));b=await st();
 ok(b.t-a.t>.9,'BF1 map closed: event clock runs again',{dt:+(b.t-a.t).toFixed(2)});
 // BF3: car pinned inside a building (Römer block at 75,-5) is put back on a street after ~2 s, with gas held via real keys
 await p.evaluate(()=>{__mho.qv.abandon();__mho.warp(75,-5,0,true)});const in0=await p.evaluate(()=>__mho.qv.hit(__mho.RO.x,__mho.RO.z));
 await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.roamSim(200));await p.keyboard.up('ArrowUp');
 const o3=await p.evaluate(()=>({hit:__mho.qv.hit(__mho.RO.x,__mho.RO.z),x:Math.round(__mho.RO.x),z:Math.round(__mho.RO.z)}));
 await p.keyboard.down('ArrowUp');const a3=await p.evaluate(()=>[__mho.RO.x,__mho.RO.z]);await p.evaluate(()=>__mho.roamSim(120));await p.keyboard.up('ArrowUp');const b3=await p.evaluate(()=>[__mho.RO.x,__mho.RO.z]);
 ok(in0&&!o3.hit&&Math.hypot(b3[0]-a3[0],b3[1]-a3[1])>10,'BF3 car stuck inside a building is rescued to a street and can drive away',{in0,o3,drove:Math.round(Math.hypot(b3[0]-a3[0],b3[1]-a3[1]))});
 // BF5: real-time drive with real keys next to walls (spots where the camera used to clip), camera sampled every frame
 await p.evaluate(()=>{window.__cam={n:0,bld:0};const f=()=>{try{if(__mho.state==='roam'&&!__m1.cs()){__cam.n++;if(__m1.camInside().bld)__cam.bld++}}catch(e){}requestAnimationFrame(f)};requestAnimationFrame(f)});
 for(const [sx,sz] of [[200,354],[2060,110],[-330,-475]]){await p.evaluate(([x,z])=>{__mho.warp(x,z,0,true)},[sx,sz]);
  await p.keyboard.down('ArrowUp');for(let k=0;k<8;k++){const key=['ArrowLeft','ArrowRight',null][k%3];if(key)await p.keyboard.down(key);await p.waitForTimeout(1500);if(key)await p.keyboard.up(key);await p.waitForTimeout(1500)}await p.keyboard.up('ArrowUp')}
 const cam=await p.evaluate(()=>window.__cam);ok(cam.n>300&&cam.bld===0,'BF5 chase camera never inside a building while driving along walls (every frame)',cam);
 // BF4: rival race started from free roam; Escape on the results screen returns to free roam, not the title menu
 await p.evaluate(()=>{const M=__mho,R=M.RO,m=R.marks.find(q=>q.kind==='rival');M.warp(m.x+15,m.z+15,0,true);M.roamSim(5);M.roamOpen(m);R.cardPin=1});
 await p.click('#rcGo');for(let i=0;i<120&&await p.evaluate(()=>__mho.state==='loading');i++)await p.waitForTimeout(500);
 await p.keyboard.down('ArrowUp');for(let k=0;k<200;k++){if(await p.evaluate(()=>{__mho.sim(600);return __mho.state})!=='race')break}await p.keyboard.up('ArrowUp');
 for(let i=0;i<60&&await p.evaluate(()=>__mho.state==='finished');i++)await p.waitForTimeout(500);
 const rs=await p.evaluate(()=>__mho.state);await p.keyboard.press('Escape');
 for(let i=0;i<120&&!(await p.evaluate(()=>__mho.state==='roam'||__mho.state==='menu'));i++)await p.waitForTimeout(500);
 ok(rs==='results'&&await p.evaluate(()=>__mho.state)==='roam','BF4 Escape on a roam race results screen goes back to free roam',{rs,now:await p.evaluate(()=>__mho.state)});
 ok(!r.errs.length,'no page errors',r.errs);await r.b.close()}
// BF6: phone landscape layout during a story mission: HP bar must not overlap the stage/timer panel, plate not hidden under the minimap
{const r=await boot({view:'land',page:process.env.PAGE||'local_dbg.html'});const p=r.p;await F.on(p);
 for(let i=0;i<40;i++){if(await p.evaluate(()=>!!(window.__m1&&__m1.marks().length)))break;await p.evaluate(()=>__mho.roamSim(30));await p.waitForTimeout(200)}
 await p.evaluate(()=>{__m1.skip();__m1.start('hunt');for(let i=0;i<8;i++){__m1.skip();__mho.roamSim(30)}});await p.waitForTimeout(800);
 const o=await p.evaluate(()=>{const R=s=>document.querySelector(s).getBoundingClientRect(),X=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return{hpRace:Math.round(X(R('#m1Hp'),R('#raceW'))),hpVis:!document.querySelector('#m1Hp').hidden,plateMini:Math.round(X(R('#roamPlate'),R('#roamMini')))}});
 ok(o.hpVis&&o.hpRace===0&&o.plateMini<150,'BF6 landscape phone: mission HP bar clear of the timer panel, district plate clear of the minimap',o);
 await F.shot(p,'shots/bf_land_hunt.jpg',{type:'jpeg',quality:70});ok(!r.errs.length,'no page errors (landscape)',r.errs);await r.b.close()}
 console.log(`tBF: ${pass} pass, ${fail} fail`);process.exit(fail?1:0)})();
