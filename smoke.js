// smoke.js — standard pre-deploy gate (target < 10 min). Fails = do not deploy.
// usage: node smoke.js <dir>   (serves http://127.0.0.1:8766/<dir>/local_dbg.html) → <dir>/smoke/sheet.png + PASS/FAIL list
// Checks: boot, Frankfurt roam (throttle, steering, 700 m GPS drive: no air/stuck), M1 NEXT pill, map open/close,
// Athens district A + B drive (no hop), quick race 30 s progress, phone portrait + landscape button layout, zero page/console errors.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const DIR=process.argv[2]||'.';const U=`http://127.0.0.1:8766/${DIR}/local_dbg.html`;const OUT=path.join(__dirname,DIR,'smoke');fs.mkdirSync(OUT,{recursive:true});
let fails=0;const T0=Date.now();const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};const shots=[];
const fastOn=p=>p.evaluate(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}});
const shot=async(p,name)=>{await p.evaluate(()=>{if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const f=path.join(OUT,name+'.jpg');await p.screenshot({path:f,type:'jpeg',quality:70,timeout:600000});shots.push(name);await fastOn(p)};
async function page(b,vp,mobile){const ctx=await b.newContext(mobile?{viewport:vp,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.errs=[];
 p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,160))});await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');return p}
const seed=(p,city,d)=>p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[city,d]).then(()=>p.reload()).then(()=>p.waitForFunction(()=>window.__mho&&__mho.state==='menu'));
async function roam(p){await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await fastOn(p);await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}});await p.evaluate(()=>__mho.roamSim(30))}
// keyboard bot along a street-graph GPS path; counts airborne frames, vertical spikes, stuck time
const drive=(p,from,len)=>p.evaluate(([from,len])=>{const M=__mho,R=M.RO,K=M.K;let q0=from?M.rsnap(from[0],from[1],400):[R.x,R.z];
 let ang=Math.random()*6.28;try{const G=(M.athGates&&M.athGates())||[];let gb=null,gd=1e9;for(const g of G){const gx=g.x??(g.p&&g.p[0]),gz=g.z??(g.p&&g.p[1]);if(gx==null)continue;const d=Math.hypot(gx-q0[0],gz-q0[1]);if(d<gd){gd=d;gb=[gx,gz]}}if(gb)ang=Math.atan2(q0[0]-gb[0],q0[1]-gb[1])}catch(e){}const q1=M.rsnap(q0[0]+Math.sin(ang)*len,q0[1]+Math.cos(ang)*len,400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<5)return{skip:1};
 M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
 let i=0,t=0,air=0,spk=0,st=0,mst=0,pvy=0,lastTO=R.takeoff,jump=0;for(t=0;t<120*60;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;
  let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(R.v)*.35)k++;let a=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));const vt=30*Math.max(.4,1-Math.abs(a)*.9);
  K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+6;M.roamSim(1);const g=M.gnd(R.x,R.z,R.y+.3);if(R.takeoff&&R.takeoff!==lastTO){lastTO=R.takeoff;jump=1}if(jump&&R.y<=g+.06)jump=0;
  const ramp=jump||(R.ramps||[]).some(q=>Math.hypot(q.x-R.x,q.z-R.z)<60);if(!ramp){if(R.y>g+.5)air++;if(Math.abs((R.vy||0)-pvy)>2.5)spk++}pvy=R.vy||0;if(Math.abs(R.v)<2)st++;else st=0;mst=Math.max(mst,st);if(i>=P.length-3)break}
 K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;return{len:Math.round(cum[cum.length-1]),t:+(t/60).toFixed(1),air,spk,stuck:+(mst/60).toFixed(1),done:i>=P.length-3}},[from,len]);
const overlaps=p=>p.evaluate(()=>{const sel=['.tbtn','#m1Next','#tW','#roamPark'];const els=[];for(const s of sel)document.querySelectorAll(s).forEach(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(r.width>4&&cs.display!=='none'&&cs.visibility!=='hidden'&&!e.hidden)els.push({id:e.id||s,r})});
 const vw=innerWidth,vh=innerHeight,off=els.filter(e=>e.r.left<0||e.r.top<0||e.r.right>vw+1||e.r.bottom>vh+1).map(e=>e.id),ov=[];
 for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i].r,b=els[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>6&&h>6)ov.push(els[i].id+'×'+els[j].id)}return{n:els.length,off,ov}});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const allErr=[];
 // 1 · Frankfurt desktop
 {const p=await page(b,{width:1280,height:720});await seed(p,'fra');await roam(p);
  const r=await p.evaluate(()=>{const M=__mho,R=M.RO,K=M.K,x=R.x,z=R.z,h=R.h;K.ArrowUp=true;M.roamSim(240);const v=R.v,d=Math.hypot(R.x-x,R.z-z);K.ArrowLeft=true;M.roamSim(60);const dh=Math.abs(Math.atan2(Math.sin(R.h-h),Math.cos(R.h-h)));K.ArrowUp=K.ArrowLeft=false;M.roamSim(120);return{v:+v.toFixed(1),d:Math.round(d),dh:+dh.toFixed(2)}});
  ok(r.v>8&&r.d>30,'fra: throttle moves the car',r);ok(r.dh>.3,'fra: steering turns the car',r);
  const dr=await drive(p,null,700);ok(dr.skip||(dr.done&&dr.air===0&&dr.stuck<6),'fra: 700 m GPS drive, no air, not stuck',dr);
  const nx=await p.evaluate(()=>{const e=document.querySelector('#m1Next');return!!e&&!e.hidden&&e.getBoundingClientRect().width>20});ok(nx,'fra: NEXT objective pill visible');
  await shot(p,'1_fra_roam');await p.evaluate(()=>__mho.toggleMap(true));await p.waitForTimeout(400);await shot(p,'2_fra_map');await p.evaluate(()=>__mho.toggleMap(false));
  allErr.push(...p.errs.map(e=>'fra: '+e));await p.context().close()}
 // 2 · Athens districts A and B
 for(const d of ['A','B']){const p=await page(b,{width:1280,height:720});await seed(p,'ath',d);await roam(p);
  const c=await p.evaluate(()=>({cid:__mho.cid(),d:__mho.athd?__mho.athd():null}));ok(c.cid==='ath'&&c.d===d,`ath ${d}: boots into the district`,c);
  const dr=await drive(p,null,700);ok(dr.skip||(dr.done&&dr.air===0&&dr.spk===0&&dr.stuck<6),`ath ${d}: 700 m GPS drive, no hop, not stuck`,dr);
  await shot(p,`3_ath_${d}`);allErr.push(...p.errs.map(e=>`ath ${d}: `+e));await p.context().close()}
 // 3 · quick race
 {const p=await page(b,{width:1280,height:720});await fastOn(p);
  const r=await p.evaluate(()=>{const M=__mho;M.homeHide();M.setOpt('tab','quick');M.setOpt('traffic',false);M.startRace();M.sim(1);const d0=M.pl.dist||0;const K=M.K;for(let i=0;i<60*30;i++){if(K)K.ArrowUp=true;M.sim(1)}if(K)K.ArrowUp=false;return{st:M.state,d:Math.round((M.pl.dist||0)-d0)}});
  ok(r.d>250,'race: player covers ground in 30 s (auto/AI-free)',r);await shot(p,'4_race');allErr.push(...p.errs.map(e=>'race: '+e));await p.context().close()}
 // 4 · phone portrait + landscape layout
 for(const [n,vp] of [['port',{width:390,height:844}],['land',{width:844,height:390}]]){const p=await page(b,vp,true);await seed(p,'fra');await roam(p);await p.waitForTimeout(500);
  const o=await overlaps(p);ok(o.n>=5&&!o.off.length&&!o.ov.length,`phone ${n}: touch buttons on screen, no overlaps`,o);await shot(p,`5_phone_${n}`);allErr.push(...p.errs.map(e=>`phone ${n}: `+e));await p.context().close()}
 ok(!allErr.length,'no page / console errors',allErr.slice(0,6));
 // contact sheet
 const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage();const imgs=shots.map(s=>`<figure><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(OUT,s+'.jpg')).toString('base64')}"><figcaption>${s}</figcaption></figure>`).join('');
 await p.setContent(`<style>body{margin:0;background:#222;display:flex;flex-wrap:wrap;gap:6px;padding:6px;font:14px system-ui;color:#fff}figure{margin:0;height:480px}img{height:455px}figcaption{text-align:center}</style>${imgs}`);await p.screenshot({path:path.join(OUT,'sheet.png'),fullPage:true});
 console.log(`${fails?'SMOKE FAILED '+fails:'SMOKE PASS'} · ${Math.round((Date.now()-T0)/1000)} s · sheet ${OUT}/sheet.png`);await b.close();process.exit(fails?1:0)})();
