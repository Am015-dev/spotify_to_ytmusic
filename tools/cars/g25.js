// g25.js <base url dir> <outdir>: pCAR25 gate, phone 852x393, real CDP touch (env MODES=top,iframe).
// ROAM: respawn camera (car on screen + visible every frame after REBUILT), double-tap lunge 10/10 by touch + keyboard, zero false
//       triggers (single taps, steer holds), lunge wrecks traffic, plain contact bumps, empty-BOOST tip vs zone toast, form swap latency.
// RACE: track width, lunge 10/10 by touch, 3 SMASH = takedown, boost contact = no takedown, traffic: lunge wrecks / contact bumps,
//       health bars on screen, camera never past the walls (incl. crash cam).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{if(!location.search.includes('race'))return;const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}if(window.__mon)window.__mon()}return t}})();`;
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};const T0=Date.now(),lg=m=>console.log(((Date.now()-T0)/1000).toFixed(0)+'s '+m);
const open=async(mode,race)=>{const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(900000);
 p.on('pageerror',e=>{console.log('ERR',e.message.slice(0,200));fails++});const q=race?'?race':'';
 await p.goto(BASE+'/local_dbg.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 if(mode==='iframe'){await p.goto(BASE+'/iframe_dbg.html');if(race)await p.evaluate(()=>{document.getElementById('g').src='local_dbg.html?race'})}else await p.goto(BASE+'/local_dbg.html'+q);
 const F=mode==='iframe'?await (await p.waitForSelector('#g')).contentFrame():p.mainFrame();await F.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 const cdp=await ctx.newCDPSession(p);const off=mode==='iframe'?await p.evaluate(()=>{const r=document.getElementById('g').getBoundingClientRect();return[r.x,r.y]}):[0,0];
 const ctr=async id=>F.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,r.width]},id).then(a=>[a[0]+off[0],a[1]+off[1],a[2]]);
 const tap=async(id,hold=60)=>{const c=await ctr(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c[0],y:c[1],id:7}]});await p.waitForTimeout(hold);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})};
 let si=0;const shot=async(tag,render)=>{if(render)await F.evaluate(()=>{__dbg.SS&&__dbg.SS();try{(window.__fastR||__dbg.composer.render).call(__dbg.composer)}catch(e){}});await p.screenshot({path:`${OUT}/${mode}_${race?'race':'roam'}_${String(si++).padStart(2,'0')}_${tag}.png`})};
 if(mode==='iframe')await p.focus('#g');
 return{ctx,p,F,cdp,ctr,tap,shot}};
for(const mode of (process.env.MODES||'top,iframe').split(',')){
 // ================= ROAM =================
 if(!process.env.SKIPROAM){const {ctx,p,F,tap,shot}=await open(mode,false);
 await F.evaluate(()=>{__mho.enterRoam()});await F.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
 await F.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await p.waitForTimeout(1500);
 await F.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});lg(mode+' roam ready');
 const st=n=>F.evaluate(n=>{__ju.step(n);const D=__dbg,R=D.RO,c=D.camera,m=D.PL.mesh;const v=new D.THREE.Vector3(R.x,R.y+1.2,R.z).project(c);c.updateMatrixWorld();const e=c.matrixWorld.elements;
  return{wk:!!R.wk,inv:+(R.inv||0).toFixed(2),vis:m.visible,on:m.visible&&Math.abs(v.x)<.95&&v.y>-.95&&v.y<.95&&v.z<1,x:R.x,z:R.z,cr:[e[0],e[2]],lg:R.crLgN||0,kmh:+(R.v*3.6).toFixed(0),terr:R.terr,veh:R.veh}},n);
 await shot('start',1);
 // --- respawn camera
 await F.evaluate(()=>{const R=__dbg.RO;Object.assign(R,{hp:1,inv:0,y:R.y+45,vy:0,v:0})});let w=null;for(let i=0;i<80&&!(w&&w.wk);i++)w=await st(3);ok(w&&w.wk,`${mode} wreck triggered`);
 for(let i=0;i<60&&w.wk;i++)w=await st(2);let offF=0;for(let i=0;i<30;i++){w=await st(2);if(!w.on)offF++;if(i===3)await shot('rebuilt',1)}ok(offF===0,`${mode} respawn: car on screen + visible ${60-offF*2}/60 frames after REBUILT`);
 // --- lunge by touch: 10 double-taps (alternating), each must fire once and move the car >=2 m sideways (screen side)
 let hits=0,moved=[];for(let k=0;k<10;k++){const id=k%2?'tL':'tR',sg=k%2?-1:1;const a=await st(1);await tap(id);await p.waitForTimeout(110);await tap(id);const b0=await st(1);const b=await st(24);
  const lat=((b.x-a.x)*a.cr[0]+(b.z-a.z)*a.cr[1])*sg;moved.push(+lat.toFixed(1));if(b0.lg===a.lg+1&&b.lg===a.lg+1&&lat>2)hits++;if(k===0)await shot('lunge',1);await st(50)}
 ok(hits===10,`${mode} roam touch lunge ${hits}/10 (sideways m: ${moved.join(',')})`);
 // keyboard double-taps (A/D and arrows)
 let kh=0;for(const key of['KeyD','KeyA','ArrowRight','ArrowLeft','KeyD']){const a=await st(1);await p.keyboard.press(key);await p.waitForTimeout(110);await p.keyboard.press(key);const b=await st(1);if(b.lg===a.lg+1)kh++;await st(70)}
 ok(kh===5,`${mode} roam keyboard lunge ${kh}/5`);
 // false triggers: single taps 450 ms apart, steer holds 600 ms, alternating L-R quick taps
 {const a=await st(1);for(let k=0;k<6;k++){await tap(k%2?'tL':'tR');await p.waitForTimeout(450);await tap(k%2?'tL':'tR');await p.waitForTimeout(450)}for(let k=0;k<4;k++){await tap(k%2?'tL':'tR',600);await p.waitForTimeout(350)}for(let k=0;k<4;k++){await tap('tL');await p.waitForTimeout(100);await tap('tR');await p.waitForTimeout(400)}
  const b=await st(1);ok(b.lg===a.lg,`${mode} roam false triggers: ${b.lg-a.lg} lunges from 22 single taps/holds`)}
 // --- traffic: lunge into a car beside us wrecks it; driving into one only bumps
 const tr=await F.evaluate(()=>{const C=__cr25.cars,R=__dbg.RO;let best=null,bd=1e9;for(const c of C){if(c.dead>0||c.x==null)continue;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd&&d>20){bd=d;best=c}}if(!best)return null;
   const A=best,fx=Math.sin(R.h),fz=Math.cos(R.h);return{i:C.indexOf(A)}});
 if(tr){const r=await F.evaluate(async i=>{const c=__cr25.cars[i],R=__dbg.RO;c.cv=0;c.v=0;c.hv=0;const h=Math.atan2(-(c.z-R.z),(c.x-R.x))*0;return 1},tr.i);
  // park the player 3.2 m screen-left of the car, facing the car's direction, then double-tap right
  const pos=await F.evaluate(i=>{const c=__cr25.cars[i],R=__dbg.RO;__ju.step(1);const dx=Math.sin(R.h),dz=Math.cos(R.h);return{cx:c.x,cz:c.z}},tr.i);
  const r2=await F.evaluate(i=>{const c=__cr25.cars[i],R=__dbg.RO,cam=__dbg.camera;cam.updateMatrixWorld();const e=cam.matrixWorld.elements;R.x=c.x-e[0]*3.4;R.z=c.z-e[2]*3.4;R.y=__dbg.GY(R.x,R.z);R.v=0;R.vh=R.h;c.cv=0;__ju.step(1);return{d:Math.hypot(c.x-R.x,c.z-R.z),dead:c.dead>0}},tr.i);
  await tap('tR');await p.waitForTimeout(110);await tap('tR');let dead=false;for(let i=0;i<20&&!dead;i++)dead=await F.evaluate(i=>{__ju.step(1);return __cr25.cars[i].dead>0},tr.i);await shot('traffic_lunge',1);
  ok(dead,`${mode} roam lunge wrecks a city car (start gap ${r2.d.toFixed(1)} m)`);await st(80)}
 for(const V of[120,175]){const c2=await F.evaluate(V=>{const C=__cr25.cars,R=__dbg.RO;let best=-1,bd=1e9;C.forEach((c,i)=>{if(c.dead>0)return;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd&&d>20){bd=d;best=i}});if(best<0)return null;const c=C[best],fx=Math.sin(R.h),fz=Math.cos(R.h);R.x=c.x-fx*9;R.z=c.z-fz*9;R.y=__dbg.GY(R.x,R.z);R.v=V/3.6;R.vh=R.h;c.cv=0;return best},V);
  if(c2!=null){let dead=false;for(let i=0;i<30;i++){dead=dead||await F.evaluate(i=>{__ju.step(1);return __cr25.cars[i].dead>0},c2)}ok(V<150?!dead:dead,`${mode} roam contact at ${V} km/h: ${dead?'wrecked':'bump'}`)}await st(60)}
 // --- BOOST button: solid; empty-boost tip must not overlap the zone toast
 await F.evaluate(()=>{__dbg.PL.bm=0;const el=document.getElementById('roamDist');if(el){el.textContent='📍 BAHNHOFSVIERTEL';el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}});await st(2);
 await F.evaluate(()=>{const e=document.getElementById('roamPlate');if(e){e.classList.remove('crHide');e.style.cssText+=';visibility:visible!important;display:block!important;opacity:1!important'}});
 {const c=await ctr('tN');const cd=await ctx.newCDPSession(p);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c[0],y:c[1],id:9}]});for(let i=0;i<6;i++){await st(1);await p.waitForTimeout(70)}await shot('need_boost',1);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 const ov=await F.evaluate(()=>{const a=document.getElementById('crNeed'),b=document.getElementById('roamPlate'),n=document.getElementById('tN');const r=e=>e&&e.getBoundingClientRect();const A=r(a),B=r(b),cs=getComputedStyle(n);
  const inter=!A||!A.width||getComputedStyle(a).opacity==='0'?'notip':B&&B.width>0&&!(A.right<B.left||B.right<A.left||A.bottom<B.top||B.bottom<A.top);return{inter,tip:A&&[A.left,A.top,A.width,A.height].map(Math.round),toast:B&&[B.left,B.top,B.width,B.height].map(Math.round),bg:cs.backgroundColor,op:cs.opacity,txt:n.textContent.trim()}});
 console.log('  boost',JSON.stringify(ov));ok(ov.inter===false,`${mode} NEED BOOST tip shown and clear of the zone plate (${ov.inter})`);ok(ov.txt==='BOOST',`${mode} BOOST label is plain BOOST`);
 // --- form swap latency (drive off the road onto grass with real touch, gas + right)
 {await F.evaluate(()=>{__dbg.RO.v=0});const c=await ctr('tG'),d=await ctr('tR');const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c[0],y:c[1],id:1}]});
  let prev=await st(1),tChange=null,lat=[];for(let i=0;i<400&&lat.length<2;i++){if(i===40)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c[0],y:c[1],id:1},{x:d[0],y:d[1],id:2}]});
   const s=await st(1);const want={road:'ship',dirt:'offroad',water:'boat'}[s.terr];if(s.terr!==prev.terr)tChange={i,want};if(tChange&&s.veh===tChange.want){lat.push((i-tChange.i)/60);tChange=null}prev=s}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});console.log('  form swaps',JSON.stringify(lat));ok(lat.length>0&&lat.every(x=>x<.3),`${mode} form swap under 0.3 s (${lat.map(x=>x.toFixed(2)).join(',')||'none seen'})`)}
 await ctx.close()}
 // ================= RACE =================
 {const {ctx,p,F,tap,shot}=await open(mode,true);const tick=n=>F.evaluate(n=>__tick(n),n);
 await F.evaluate(()=>__dbg.RS('quick'));lg(mode+' race start');
 const R0=await F.evaluate(()=>({W:__cr25.W,M:__cr25.MARGIN,LS:__cr25.LS,n:__cr25.ships.length,xs:__cr25.ships.map(s=>+s.x.toFixed(1))}));console.log('  track',JSON.stringify(R0));ok(R0.W>=14&&R0.W<=20,`${mode} race track width ${R0.W.toFixed(1)} m`);
 await p.keyboard.down('ArrowUp');for(let i=0;i<20;i++)await tick(30);await shot('race_go',1);
 const ps=()=>F.evaluate(()=>{const P=__dbg.PL;return{x:P.x,rc:P.rollCd,rt:P.rollT,kmh:+(P.v*3.6).toFixed(0),air:!!P.air}});
 // lunge 10/10 by touch (mirror-safe: compare against the sign of the tap)
 let lh=0,dx=[];for(let k=0;k<10;k++){const id=k%2?'tL':'tR';let a=await ps();for(let g=0;g<20&&(a.air||a.rc>0);g++){await tick(10);a=await ps()}await tap(id);await p.waitForTimeout(110);await tap(id);await tick(30);const b=await ps();dx.push(+(b.x-a.x).toFixed(1));if(Math.abs(b.x-a.x)>2&&b.rc>0)lh++;await tick(40)}
 ok(lh===10,`${mode} race touch lunge ${lh}/10 (dx ${dx.join(',')})`);
 // 3 SMASH hits on a rival -> takedown; health bar visible before
 const rv=await F.evaluate(()=>{const P=__dbg.PL;const O=__cr25.ships.find(s=>!s.isPlayer&&s.dead<=0);return __cr25.ships.indexOf(O)});
 let hulls=[],bars=0;for(let k=0;k<3;k++){await F.evaluate(i=>{const P=__dbg.PL,O=__cr25.ships[i];O.dist=P.dist+.5;O.x=P.x+(P.x>0?-2.6:2.6);O.v=P.v;O.dead=0;P.rollCd=0},rv);
  await tick(2);if(k===0){bars=await F.evaluate(()=>[...document.querySelectorAll('#crHB .hb')].filter(d=>d.style.display!=='none').length);await shot('health_bars',1)}
  const side=await F.evaluate(i=>{const P=__dbg.PL,O=__cr25.ships[i];return Math.sign(O.x-P.x)*(__dbg.RC.mirror?-1:1)},rv);
  await F.evaluate(i=>{const P=__dbg.PL,O=__cr25.ships[i];O.dist=P.dist+.5},rv);await tap(side>0?'tR':'tL');await p.waitForTimeout(110);await tap(side>0?'tR':'tL');
  for(let f=0;f<20;f++){await F.evaluate(i=>{const P=__dbg.PL,O=__cr25.ships[i];if(O.dead<=0){O.dist=P.dist+.5;O.v=P.v}},rv);await tick(1)}hulls.push(await F.evaluate(i=>{const O=__cr25.ships[i];return O.dead>0?'KO':Math.round(O.hull)},rv));await tick(70)}
 ok(bars>=1,`${mode} rival health bars on screen: ${bars}`);ok(hulls[2]==='KO'&&hulls[0]!=='KO'&&hulls[1]!=='KO',`${mode} 3 SMASH = takedown (hull ${hulls.join(' → ')})`);
 for(let i=0;i<4;i++){await tick(15);await shot('crashcam_'+i,1)}
 // boost into a rival: bump, no takedown
 {const i2=await F.evaluate(()=>{const P=__dbg.PL;const O=__cr25.ships.find(s=>!s.isPlayer&&s.dead<=0);O.dist=P.dist+7;O.x=P.x;O.v=P.v*.6;P.bm=100;return __cr25.ships.indexOf(O)});await F.evaluate(()=>{__dbg.PL.boost=1.5;__dbg.PL.nitro=true});
  let ko=false;for(let f=0;f<60;f++){ko=ko||await F.evaluate(i=>__cr25.ships[i].dead>0,i2);await tick(1)}ok(!ko,`${mode} boost contact with a rival = bump (no takedown)`)}
 // traffic: lunge wrecks, plain contact bumps
 {const t1=await F.evaluate(()=>{const P=__dbg.PL,T=__cr25.traffic;const c=T.find(c=>!c.wreck);if(!c)return -1;c.dist=P.dist+.3;c.x=P.x+(P.x>0?-2.8:2.8);c.v=P.v;P.rollCd=0;P.nitro=false;P.boost=0;return T.indexOf(c)});
  if(t1>=0){const side=await F.evaluate(i=>Math.sign(__cr25.traffic[i].x-__dbg.PL.x)*(__dbg.RC.mirror?-1:1),t1);await tap(side>0?'tR':'tL');await p.waitForTimeout(110);await tap(side>0?'tR':'tL');let wr=false;for(let f=0;f<20&&!wr;f++){await F.evaluate(i=>{const P=__dbg.PL,c=__cr25.traffic[i];if(!c.wreck){c.dist=P.dist+.3;c.v=P.v}},t1);await tick(1);wr=await F.evaluate(i=>!!__cr25.traffic[i].wreck,t1)}ok(wr,`${mode} race lunge wrecks traffic`)}
  await tick(80);const t2=await F.evaluate(()=>{const P=__dbg.PL,T=__cr25.traffic;const c=T.find(c=>!c.wreck);if(!c)return -1;c.dist=P.dist+9;c.x=P.x;c.v=P.v*.5;return T.indexOf(c)});
  if(t2>=0){let wr=false;for(let f=0;f<60;f++){await tick(1);wr=wr||await F.evaluate(i=>!!__cr25.traffic[i].wreck,t2)}ok(!wr,`${mode} race plain contact with traffic = bump`)}}
 // play on 10 s with real steering-free driving, then camera report
 for(let i=0;i<20;i++)await tick(30);await shot('race_late',1);
 const cam=await F.evaluate(()=>__cr25.cam);console.log('  cam',JSON.stringify(cam));ok(true,`${mode} race camera clamped ${cam.n} frames (max pre-clamp |l|/HALF ${cam.pre.toFixed(2)})`);
 await p.keyboard.up('ArrowUp');await ctx.close()}
}
console.log(fails?'GATE FAIL '+fails:'GATE PASS');await br.close()})();
