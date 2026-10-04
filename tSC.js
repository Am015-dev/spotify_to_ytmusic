// tSC.js — real-world scale check for free roam (module sc.js / pSC1.py).
// usage: node tSC.js [dir]   (serves http://127.0.0.1:8766/<dir>/local_dbg.html)   SHOTS=1 → also phone screenshots 2000×920 (before/after)
// Per city (Frankfurt, Athens A): measures ship / traffic / pedestrian / minifig sizes against lane width and storey height,
// then a keyboard bot drives N real 90° street corners (found on the GPS street graph, buildings at the corner) at city speed
// and counts building bounces + frames where the visible car outline overlaps a building. "before" = SC off before roam load
// (exactly the v82 sizes, collision and camera), "after" = SC on.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const DIR=process.argv[2]||'.';const U=`http://127.0.0.1:8766/${DIR}/local_dbg.html`;const OUT=path.join(__dirname,DIR,'scshots');fs.mkdirSync(OUT,{recursive:true});
const SHOTS=!!process.env.SHOTS;let fails=0,passes=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));c?passes++:fails++};
const REF={car:[4.3,1.8],ped:1.8,lane:3.75,storey:3.2};const SPEEDS=[15,20,25];const NT=8;const T0=Date.now();
async function boot(b,city,d,sc,vp){const ctx=await b.newContext(vp?{viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1000,height:460}});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.errs=[];
 p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,160))});
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[city,d]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(on=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};__sc.set(on)},sc);
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(30)});return p}
// 90° corners on the street graph: heading change 70–110° within ±8 m, ≥ 45 m before / 35 m after without another turn, a building within 18 m of the corner
const findTurns=(p,n)=>p.evaluate(n=>{const M=__mho,R=M.RO,out=[],seen=[];const x0=R.x,z0=R.z;
 for(let k=0;k<40&&out.length<n;k++){const a=k*2.399,d=350+(k%5)*90;let q0=M.rsnap(x0+Math.sin(a)*120,z0+Math.cos(a)*120,400),q1=M.rsnap(x0+Math.sin(a+2.2)*d,z0+Math.cos(a+2.2)*d,400);if(!q0||!q1)continue;
  const P=(M.qv.path(q0[0],q0[1],q1[0],q1[1])||{}).P;if(!P||P.length<12)continue;const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const at=s=>{let i=1;while(i<P.length-1&&cum[i]<s)i++;const t=(s-cum[i-1])/((cum[i]-cum[i-1])||1);return[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t]};
  const hd=(s0,s1)=>{const A=at(s0),B=at(s1);return Math.atan2(B[0]-A[0],B[1]-A[1])},dA=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  for(let s=50;s<cum[cum.length-1]-40;s+=2){const h0=hd(s-14,s-6),h1=hd(s+6,s+14),turn=dA(h1,h0);if(Math.abs(turn)<70/57.3||Math.abs(turn)>110/57.3)continue;
   if(Math.abs(dA(hd(s-45,s-20),h0))>.35||Math.abs(dA(hd(s+16,s+34),h1))>.35)continue;const c=at(s);M.__dbgT=(M.__dbgT||0)+1;if(seen.some(q=>Math.hypot(q[0]-c[0],q[1]-c[1])<60))continue;
   if(!M.CE||true){let bld=false;for(let r=6;r<=18&&!bld;r+=4)for(let j=0;j<8&&!bld;j++){const g=j*.785;{const x=c[0]+Math.sin(g)*r,z=c[1]+Math.cos(g)*r;if(__sc.hit(x,z,M.gnd(x,z,999)+.5))bld=true}}if(!bld)continue}
   const pts=[];for(let u=s-45;u<=s+35;u+=3)pts.push(at(u));out.push({c,turn:+(turn*57.3).toFixed(0),pts});seen.push(c);break}}return out.length?out:[{dbg:M.__dbgT||0}]},n);
// drive one corner at a held speed: pure-pursuit steering (same as smoke.js), throttle/brake to hold vt
const corner=(p,T,vt,w,l)=>p.evaluate(([T,vt,w,l])=>{const M=__mho,R=M.RO,K=M.K,P=T.pts;const h=Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]);M.warp(P[0][0],P[0][1],h);M.roamSim(2);R.h=R.vh=h;R.v=vt;R.yr=0;
 const nb0=__sc.nb();let clip=0,i=0,f=0,minV=99;for(f=0;f<60*12;f++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+12);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;
  const k=Math.min(P.length-1,i+Math.max(2,Math.round((5+Math.abs(R.v)*.3)/3)));let a=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));
  K.ArrowLeft=a>.03;K.ArrowRight=a<-.03;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+2;M.roamSim(1);if(__sc.clip(w,l))clip++;minV=Math.min(minV,R.v);if(i>=P.length-2)break}
 K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;return{b:__sc.nb()-nb0,clip,done:i>=P.length-2,t:+(f/60).toFixed(1),minV:+minV.toFixed(1)}},[T,vt,w,l]);
async function shot(p,name,T){await p.evaluate(T=>{const M=__mho,R=M.RO,K=M.K,P=T.pts;const h=Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]);M.warp(P[0][0],P[0][1],h);M.roamSim(2);R.h=R.vh=h;R.v=14;K.ArrowUp=true;M.roamSim(40);K.ArrowUp=false;__sc.cam(90)},T);
 await p.evaluate(()=>{__dbg.composer.render=window.__fastR;window.__fastR=null});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await p.screenshot({path:path.join(OUT,name+'.jpg'),type:'jpeg',quality:80,timeout:900000});await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}})}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const allErr=[];const table={};
 for(const [city,d] of [['fra'],['ath','A']]){const tag=city+(d||'');let turns=null;
  for(const sc of [false,true]){const mode=sc?'after':'before';const p=await boot(b,city,d,sc);const m=await p.evaluate(()=>__sc.m());
   const v82=!sc;const ship=m.ship,lane=city==='fra'?3.6:m.roadW.res/2;// Frankfurt: traffic lane spacing .18 × 20 m street; Athens: 7.5 m two-lane residential street
   const sedan=m.cars.find(c=>c[0]==='sedan');const W=ship[0],L=ship[2];// SC off: the v82 ship (wings never fold with SC off)
   const row={ship:`${L.toFixed(2)} × ${W.toFixed(2)} × ${ship[1].toFixed(2)}`,shipL:+(L/REF.car[0]).toFixed(2),shipW:+(W/REF.car[1]).toFixed(2),shipLane:+(W/lane).toFixed(2),
    sedan:`${sedan[3]} × ${sedan[1]}`,sedanL:+(sedan[3]/REF.car[0]).toFixed(2),sedanW:+(sedan[1]/REF.car[1]).toFixed(2),ped:+(m.ped/REF.ped).toFixed(2),fig:+(m.fig/REF.ped).toFixed(2),L,hull:m.hull,cam:{b:m.cam.b,h:m.cam.h},boat:m.boat,x4:m.wheels4x4};
   console.log(`${tag} ${mode}: `+JSON.stringify(row));
   if(sc){ok(row.shipL>=.95&&row.shipL<=1.25,`${tag}: ship length ${L} m = ${row.shipL}× car (0.95–1.25)`);ok(row.shipW<=1.3,`${tag}: ship width ${W} m = ${row.shipW}× car (≤1.3)`);
    ok(row.sedanL>=.95&&row.sedanL<=1.2&&row.sedanW<=1.2,`${tag}: traffic sedan ${row.sedan} m = ${row.sedanL}× / ${row.sedanW}× car`);
    ok(m.cars.every(c=>c[0][0]==='#'||c[1]<=2.5),`${tag}: every traffic car ≤ 2.5 m wide`,m.cars.map(c=>c[1]));
    ok(row.ped>=.95&&row.ped<=1.2,`${tag}: pedestrian ${m.ped} m = ${row.ped}× person`);ok(row.fig>=.95&&row.fig<=1.3,`${tag}: quest minifig ${m.fig} m = ${row.fig}× person`);
    ok(W<lane*.7,`${tag}: ship width ${W} m < 70% of a ${lane} m lane`);ok(m.hull.w<=W+.4&&m.hull.l<=L+.4&&m.hull.w>=W-.4,`${tag}: collision hull ${m.hull.w}×${m.hull.l} m matches the mesh`)}
   if(!turns){turns=await findTurns(p,NT);ok(turns.filter(t=>t.pts).length>=Math.min(5,NT),`${tag}: found ${turns.length} real 90° corners with buildings`,turns.map(t=>t.turn))}
   const res={};for(const v of SPEEDS){let bb=0,cl=0,dn=0,tt=0;for(const T of turns){const r=await corner(p,T,v,W,L);bb+=r.b;cl+=r.clip?1:0;dn+=r.done?1:0;tt+=r.t}res[v]={bounce:bb,clipTurns:cl,done:dn,n:turns.length,t:+(tt/turns.length).toFixed(2)}}
   console.log(`${tag} ${mode} corners: `+JSON.stringify(res));row.corners=res;table[tag+' '+mode]=row;
   if(sc){ok(res[15].n>0&&res[15].bounce===0&&res[15].clipTurns===0&&res[15].done===res[15].n,`${tag}: 90° corners at 15 m/s (54 km/h): no building hit, no visual clip`,res[15]);
    ok(res[20].n>0&&res[20].bounce===0&&res[20].clipTurns===0,`${tag}: 90° corners at 20 m/s (72 km/h): no building hit, no visual clip`,res[20]);
    const bf=table[tag+' before'].corners;ok(res[25].bounce+res[25].clipTurns<=bf[25].bounce+bf[25].clipTurns,`${tag}: at 25 m/s no worse than before`,{before:bf[25],after:res[25]})}
   const cam=await p.evaluate(()=>{const R=__mho.RO,K=__mho.K;K.ArrowUp=true;__mho.roamSim(240);const f=__sc.cam(90);K.ArrowUp=false;R.v=0;__mho.roamSim(10);return{fast:f,stop:__sc.cam(240)}});row.camLive=cam;console.log(`${tag} ${mode} camera: `+JSON.stringify(cam));
   if(sc){const bf=table[tag+' before'];// framing: car length / camera distance stays within ±25% of before; the camera never sits lower than 3 m over the road
    const fr0=bf.L/bf.camLive.stop.back,fr1=L/cam.stop.back;ok(Math.abs(fr1/fr0-1)<.25&&cam.stop.h>=2.8&&cam.fast.h>=2.6,`${tag}: chase camera follows the scale (framing ${fr0.toFixed(2)} → ${fr1.toFixed(2)})`,cam)}
   if(SHOTS){await p.context().close();const q=await boot(b,city,d,sc,{width:1000,height:460});await shot(q,`${tag}_${mode}`,turns[0]);allErr.push(...q.errs);await q.context().close()}else await p.context().close();
   allErr.push(...p.errs.map(e=>tag+' '+mode+': '+e))}}
 ok(!allErr.length,'no page / console errors',allErr.slice(0,5));fs.writeFileSync(path.join(OUT,'table.json'),JSON.stringify(table,null,1));
 console.log(`${fails?'TSC FAILED '+fails:'TSC PASS'} · ${passes} pass / ${fails} fail · ${Math.round((Date.now()-T0)/1000)} s`);await b.close();process.exit(fails?1:0)})();
