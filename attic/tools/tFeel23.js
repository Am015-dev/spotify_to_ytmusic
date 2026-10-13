// tFeel23.js: Hot Drop start (fresh save), then (1) BOOST-held 90° left turn at the boost cap, (2) hard brake from top to 0,
// (3) a story warp mid-fade frame. Keyboard (ArrowUp/Left/Down, Shift), 60 fps stepped. Slip = angle between the car heading and its
// actual travel direction (frame-to-frame position delta); camera lag = heading gap between car travel and camera look / yaw rate.
// usage: node tools/tFeel23.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'qa23/feel';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
 await ctx.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.__auto=true;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c)try{f(t)}catch(e){}if(window.__mon)__mon()}};setInterval(()=>{if(window.__dbg&&!window.__fr&&!window.__sh){window.__fr=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)__tick(1)},16)})()`);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.click('#hcStory');await p.waitForTimeout(300);await p.click('#slotList .go');await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000,polling:1000});await p.evaluate(()=>{window.__auto=false});
 for(let i=0;i<40;i++){await p.evaluate(()=>{__tick(10);if(__m1.cs())__m1.skip();for(const s of['#storyGo','#rcGo','.m1go','#tutSkip']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}})}
 const shot=async n=>{await p.evaluate(()=>{window.__sh=1;if(window.__fr){__dbg.composer.render=window.__fr;window.__fr=null}__tick(1)});await p.screenshot({path:path.join(OUT,n+'.jpg'),type:'jpeg',quality:70});await p.evaluate(()=>{window.__sh=0})};
 const key=(k,on)=>on?p.keyboard.down(k):p.keyboard.up(k);
 // per-frame log
 await p.evaluate(()=>{const M=__mho,R=M.RO;window.__F=[];let px=R.x,pz=R.z;window.__mon=()=>{const c=__dbg.camera,d=new __dbg.THREE.Vector3();c.getWorldDirection(d);const mv=Math.hypot(R.x-px,R.z-pz);const trav=mv>.05?Math.atan2(R.x-px,R.z-pz):null;
  __F.push({x:R.x,z:R.z,h:R.h,v:R.v,trav,cam:Math.atan2(d.x,d.z)});px=R.x;pz=R.z;if(__F.length>4000)__F.shift()}});
 const ang=a=>Math.atan2(Math.sin(a),Math.cos(a));const deg=a=>+(a*180/Math.PI).toFixed(1);
 const run=async(frames,shotsAt,tag)=>{for(let f=0;f<frames;f++){await p.evaluate(()=>__tick(1));if(shotsAt.includes(f))await shot(tag+'_'+String(f).padStart(3,'0'))}};
 // 1) straight boost to the cap, then hold left with boost until heading turned 90°
 await p.evaluate(()=>{__F.length=0;const s=__dbg.pl||null;});await key('ArrowUp',true);await key('Shift',true);
 let v=0;for(let i=0;i<20;i++){await p.evaluate(()=>__tick(30));v=await p.evaluate(()=>__mho.RO.v*3.6);if(v>145)break}
 const h0=await p.evaluate(()=>__mho.RO.h);const f0=await p.evaluate(()=>__F.length);await shot('turn_000_entry');await key('ArrowLeft',true);
 let turned=0,n=0;while(Math.abs(turned)<Math.PI/2&&n<400){await p.evaluate(()=>__tick(6));n+=6;turned=ang((await p.evaluate(()=>__mho.RO.h))-h0);if(n%30===0&&n<=120)await shot('turn_'+String(n).padStart(3,'0'))}
 await key('ArrowLeft',false);await shot('turn_end');await key('Shift',false);
 const T=await p.evaluate(f0=>__F.slice(f0),f0);
 let slipMax=0,lagS=[];for(let i=1;i<T.length;i++){const q=T[i];if(q.trav==null)continue;slipMax=Math.max(slipMax,Math.abs(ang(q.h-q.trav)));const yr=ang(T[i].h-T[i-1].h)*60;if(Math.abs(yr)>.2)lagS.push(Math.abs(ang(q.trav-q.cam))/Math.abs(yr))}
 lagS.sort((a,b)=>a-b);const turn={entryKmh:Math.round(v),frames:n,secs:+(n/60).toFixed(2),turnedDeg:deg(turned),minKmh:Math.round(Math.min(...T.map(q=>q.v*3.6))),exitKmh:Math.round(T[T.length-1].v*3.6),slipMaxDeg:deg(slipMax),camLagMedS:lagS.length?+lagS[lagS.length>>1].toFixed(3):null,camLagP90S:lagS.length?+lagS[Math.floor(lagS.length*.9)].toFixed(3):null,radiusM:+((T[T.length-1].v*(n/60))/Math.max(.01,Math.abs(turned))).toFixed(0)};
 // 2) back on the start road (west), boost to the cap, then hard brake to 0
 await key('ArrowUp',false);await p.evaluate(()=>{__m1.warp(2062,0,-Math.PI/2);const P=(__mho.pl||(__dbg&&__dbg.pl));if(P)P.bm=100});await p.evaluate(()=>__tick(30));await key('ArrowUp',true);await key('Shift',true);for(let i=0;i<20;i++){await p.evaluate(()=>__tick(30));v=await p.evaluate(()=>__mho.RO.v*3.6);if(v>145)break}await key('Shift',false);await key('ArrowUp',false);
 const b0=await p.evaluate(()=>({x:__mho.RO.x,z:__mho.RO.z,v:__mho.RO.v}));await shot('brake_000');await key('ArrowDown',true);let bf=0;
 while(bf<900){await p.evaluate(()=>__tick(3));bf+=3;const vv=await p.evaluate(()=>__mho.RO.v);if([30,60,90].includes(bf))await shot('brake_'+String(bf).padStart(3,'0'));if(vv<=.3)break}
 await key('ArrowDown',false);const b1=await p.evaluate(()=>({x:__mho.RO.x,z:__mho.RO.z}));await shot('brake_stop');
 const brake={fromKmh:Math.round(b0.v*3.6),secs:+(bf/60).toFixed(2),distM:+Math.hypot(b1.x-b0.x,b1.z-b0.z).toFixed(1)};
 // 3) story warp (M1_warp → BG23_cut): frame at the cut, then at +120 ms, +300 ms, +600 ms real time (CSS fade)
 await p.evaluate(()=>{const R=__mho.RO;__m1.warp(R.x+60,R.z,R.h)});await shot('fade_0_cut');await p.waitForTimeout(160);await shot('fade_1_160ms');await p.waitForTimeout(200);await shot('fade_2_360ms');await p.waitForTimeout(400);await shot('fade_3_760ms');
 const fade=await p.evaluate(()=>({cls:document.querySelector('#warpFade').className,op:getComputedStyle(document.querySelector('#warpFade')).opacity}));
 console.log('FEEL',JSON.stringify({turn,brake,fade,errs}));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
