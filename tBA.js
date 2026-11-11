// tBA: Athens + touch play-test regressions (real touch via CDP, keyboard for the gate drive). usage: node tBA.js [port land gate]
// - phone HUD: district plate text not hidden under the minimap (BA-6); ITEM clear of AUTO in landscape (BA-5); PARKED banner clear of NEXT (BA-4)
// - phone HUD: no overlapping controls / gauge / NEXT / ITEM (bug BA-1: DRIFT button covered the speed gauge in portrait, pedal mode)
// - map: header readable and clear of ✕ (BA-2), district picker compact in portrait (BA-3), drag follows the finger, pinch zooms, own-district button warps
// - touch: GAS pedal hold drives, BRAKE double-tap parks / GO unparks, ITEM fires
// - DRIVE TO gate A→B: position + speed kept across the district reload
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');
const U='http://127.0.0.1:8766/'+(process.env.PAGE||'local_dbg.html');const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);
let fails=0,pass=0;const ok=(c,m,i)=>{c?pass++:fails++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
const seed=async(p,d,o={})=>{await p.evaluate(([d,o])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1',d);localStorage.setItem('mho_roam.ath@1','{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}');if(o.thr)localStorage.setItem('mho_set@1',JSON.stringify({thr:o.thr}))},[d,o]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await F.on(p);
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{__m1.skip()}catch(e){}__mho.roamSim(30)})};
const rect=(p,s)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}},s);
const HUD=['tB','tG','tN','tD','tF','tL','tR','tP','tW','roamGauge','m1Next','roamMini','roamArrow','roamVeh','roamHorn','roamMapBtn','roamExit','roamStuds','roamPark'];
const overlaps=p=>p.evaluate(ids=>{const L=ids.map(i=>document.getElementById(i)).filter(e=>e&&e.offsetParent!==null&&!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,r:e.getBoundingClientRect()})).filter(q=>q.r.width>4);
 const o=[],off=[];for(const q of L)if(q.r.left<0||q.r.top<0||q.r.right>innerWidth+1||q.r.bottom>innerHeight+1)off.push(q.id);
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i].r,b=L[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>4&&h>4)o.push(L[i].id+'×'+L[j].id)}return{n:L.length,o,off}},HUD);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [n,vp] of [['port',{width:390,height:844}],['land',{width:844,height:390}]]){if(!want(n))continue;
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.on('pageerror',e=>errs.push(n+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console: '+m.text().slice(0,150))});
 const cdp=await ctx.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});const tap=async s=>{const r=await rect(p,s);await T('touchStart',[[r.x,r.y]]);await T('touchEnd',[]);return r};
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,'B',{thr:'pedal'});
 if(await p.evaluate(()=>{const e=document.querySelector('#rotOk');return !!(e&&e.offsetParent)}))await tap('#rotOk');
 // ITEM button visible too (weapon unlocked + item in slot) so it is part of the layout check
 await p.evaluate(()=>{__m1.st().wpn=1;__m1.give('missile');__mho.roamSim(2)});
 const o=await overlaps(p);ok(o.n>=10&&!o.o.length&&!o.off.length,`${n}: touch HUD (pedal + ITEM) has no overlapping / off-screen controls`,o);await F.shot(p,`shots/ba_hud_${n}.jpg`,{type:'jpeg',quality:70});
 const pl=await p.evaluate(()=>{const b=document.querySelector('#roamPlate b'),m=document.querySelector('#roamMini');if(!b||!b.offsetParent)return null;const rg=document.createRange();rg.selectNodeContents(b);const t=rg.getBoundingClientRect(),q=m.getBoundingClientRect();return{txt:b.textContent,textL:Math.round(t.left),miniR:Math.round(q.right)}});
 ok(!pl||pl.textL>=pl.miniR,`${n}: district name on the plate starts right of the minimap (not clipped)`,pl);
 // GAS pedal hold
 let r=await rect(p,'#tG');await T('touchStart',[[r.x,r.y]]);const g=await p.evaluate(()=>{const R=__mho.RO,x=R.x,z=R.z;__mho.roamSim(120);return{v:+R.v.toFixed(1),d:Math.round(Math.hypot(R.x-x,R.z-z))}});await T('touchEnd',[]);ok(g.v>8&&g.d>15,`${n}: holding the GAS pedal drives the car`,g);
 await p.evaluate(()=>{const R=__mho.RO;for(let i=0;i<900&&Math.abs(R.v)>.3;i++)__mho.roamSim(1)});
 // ITEM tap fires the missile
 await tap('#tW');const it=await p.evaluate(()=>({inv:__m1.M1.inv,last:__m1.M1.lastFire}));ok(!it.inv&&it.last==='missile',`${n}: tapping ITEM fires the held item`,it);
 // BRAKE double tap → parked (two real TouchEvents 120 ms apart, dispatched in-page because CDP round-trips on this box take seconds), GO → drive
 const pk=await p.evaluate(()=>new Promise(res=>{const el=document.querySelector('#tB'),r=el.getBoundingClientRect();const fire=()=>{const t=new Touch({identifier:7,target:el,clientX:r.x+r.width/2,clientY:r.y+r.height/2});el.dispatchEvent(new TouchEvent('touchstart',{touches:[t],targetTouches:[t],changedTouches:[t],bubbles:true,cancelable:true}));el.dispatchEvent(new TouchEvent('touchend',{touches:[],targetTouches:[],changedTouches:[t],bubbles:true,cancelable:true}))};
  fire();setTimeout(()=>{fire();__mho.roamSim(30);res({park:document.body.classList.contains('parked'),btn:el.textContent,v:+__mho.RO.v.toFixed(1),banner:!document.querySelector('#roamPark').hidden})},120)}));
 ok(pk.park&&/GO/.test(pk.btn)&&pk.banner&&Math.abs(pk.v)<1,`${n}: double-tap BRAKE parks (button turns GO, banner shown)`,pk);
 const op=await overlaps(p);ok(!op.o.length&&!op.off.length,`${n}: parked banner overlaps nothing`,op);
 await tap('#tB');const up=await p.evaluate(()=>({park:document.body.classList.contains('parked'),btn:document.querySelector('#tB').textContent}));ok(!up.park&&up.btn==='BRAKE',`${n}: tapping GO unparks`,up);
 // map: open with the MAP button
 await tap('#roamMapBtn');await p.waitForTimeout(300);ok(await p.evaluate(()=>__mho.RO.mapOpen),`${n}: MAP button opens the map`);
 const mh=await rect(p,'#roamMap .mh'),mx=await rect(p,'#roamMapX'),mz=await rect(p,'#roamMapZ'),dp=await rect(p,'#athDP'),mc=await rect(p,'#roamMapC');
 const bg=await p.evaluate(()=>getComputedStyle(document.querySelector('#roamMap .mh')).backgroundColor);
 ok(mh.r<=mx.l+1&&!/rgba\(0, 0, 0, 0\)|transparent/.test(bg),`${n}: map header is clear of ✕ and sits on a solid backing`,{mh:[mh.l|0,mh.r|0],x:mx.l|0,bg});
 const dpo=Math.min(dp.r,mz.r)-Math.max(dp.l,mz.l)>2&&Math.min(dp.b,mz.b)-Math.max(dp.t,mz.t)>2;ok(!dpo&&dp.h<=mc.h*.2,`${n}: district picker compact (≤ 20 % of the map height) and clear of the zoom buttons`,{dpH:Math.round(dp.h),mapH:Math.round(mc.h),dpo});
 await F.shot(p,`shots/ba_map_${n}.jpg`,{type:'jpeg',quality:70});
 // drag: the car marker follows the finger; pinch: zoom grows
 const c0=await p.evaluate(()=>__mho.RO.mapP(__mho.RO.x,__mho.RO.z));await T('touchStart',[[mc.x,mc.y]]);for(let k=1;k<=5;k++)await T('touchMove',[[mc.x+k*12,mc.y+k*8]]);await T('touchEnd',[]);
 const c1=await p.evaluate(()=>__mho.RO.mapP(__mho.RO.x,__mho.RO.z));const dx=(c1[0]-c0[0])/2,dy=(c1[1]-c0[1])/2;ok(Math.abs(dx-60)<6&&Math.abs(dy-40)<6,`${n}: map drag moves the map with the finger (60,40 px)`,{dx:+dx.toFixed(1),dy:+dy.toFixed(1)});
 const z0=await p.evaluate(()=>__mho.RO.mapZ);await T('touchStart',[[mc.x-30,mc.y],[mc.x+30,mc.y]]);for(let k=1;k<=4;k++)await T('touchMove',[[mc.x-30-k*8,mc.y],[mc.x+30+k*8,mc.y]]);await T('touchEnd',[]);const z1=await p.evaluate(()=>__mho.RO.mapZ);ok(z1>z0*1.3,`${n}: pinch-out zooms the map in`,{z0,z1});
 // own-district button: warp to the district start, map closes
 const own=await p.evaluate(()=>{const b=[...document.querySelectorAll('#athDP button')].find(x=>x.textContent.startsWith('● '));const r=b.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});const pos0=await p.evaluate(()=>[__mho.RO.x,__mho.RO.z]);
 await T('touchStart',[own]);await T('touchEnd',[]);await p.waitForTimeout(300);const ow=await p.evaluate(()=>({open:__mho.RO.mapOpen,x:__mho.RO.x|0,z:__mho.RO.z|0,d:__mho.athd()}));ok(!ow.open&&ow.d==='B'&&Math.hypot(ow.x-pos0[0],ow.z-pos0[1])>5,`${n}: own-district button warps to its start and closes the map`,ow);
 await ctx.close()}
if(want('gate')){const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage();p.setDefaultTimeout(900000);p.on('pageerror',e=>errs.push('gate: '+e.message));
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,'A');
 const g=await p.evaluate(()=>{const M=__mho,R=M.RO,G=M.athGates().find(g=>g.to==='B');const dx=R.x-G.x,dz=R.z-G.z,l=Math.hypot(dx,dz),q0=M.rsnap(G.x+dx/l*150,G.z+dz/l*150,300),P=M.qv.path(q0[0],q0[1],G.x,G.z).P;
  M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);window.__P=P;window.__G=G;return{x:G.x|0,z:G.z|0}});
 let last=null;for(let k=0;k<30&&!(last&&last.out);k++)last=await p.evaluate(()=>{const M=__mho,R=M.RO,K=M.K,P=__P,G=__G;for(let t=0;t<60;t++){let bi=0,bd=1e9;for(let i=0;i<P.length;i++){const d=Math.hypot(P[i][0]-R.x,P[i][1]-R.z);if(d<bd){bd=d;bi=i}}
   const tg=bi>=P.length-2?[G.x+(G.x-P[P.length-3][0])*3,G.z+(G.z-P[P.length-3][1])*3]:P[Math.min(P.length-1,bi+2)];let a=Math.atan2(tg[0]-R.x,tg[1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));K.ArrowLeft=a>.04;K.ArrowRight=a<-.04;K.ArrowUp=R.v<20;M.roamSim(1);
   if(!R.on){K.ArrowLeft=K.ArrowRight=K.ArrowUp=false;return{x:R.x,z:R.z,h:R.h,v:R.v,out:1}}}return{x:R.x,z:R.z,v:R.v}});
 ok(last&&last.out,'gate: keyboard drive through the DRIVE TO gate A→B triggers the district switch',g);
 await p.waitForFunction(()=>window.__mho&&__mho.state==='roam'&&__mho.RO.on&&__mho.athd()==='B',null,{timeout:600000,polling:1000});await F.on(p);
 const a=await p.evaluate(()=>{const M=__mho,R=M.RO;return{x:R.x,z:R.z,h:R.h,v:R.v,d:M.athd(),air:+(R.y-M.gnd(R.x,R.z,R.y+.3)).toFixed(2)}});
 const dp=Math.hypot(a.x-last.x,a.z-last.z);ok(a.d==='B'&&dp<5&&Math.abs(a.h-last.h)<.1&&a.v>last.v*.8&&a.air<.5,'gate: arrives in district B at the same spot, heading and speed, on the ground',{dp:+dp.toFixed(1),v:[+last.v.toFixed(1),+a.v.toFixed(1)],air:a.air});
 const mv=await p.evaluate(()=>{const M=__mho,R=M.RO,K=M.K,x=R.x,z=R.z;K.ArrowUp=true;M.roamSim(120);K.ArrowUp=false;return Math.round(Math.hypot(R.x-x,R.z-z))});ok(mv>20,'gate: car drives on after the switch',mv);await p.context().close()}
ok(!errs.length,'no page / console errors',errs.slice(0,4));console.log(`${fails?'FAILED '+fails:'ALL PASS'} · ${pass} passed`);await b.close();process.exit(fails?1:0)})();
