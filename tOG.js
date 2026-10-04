// tOG: open-world density module tests (og.js). usage: node tOG.js [D E C P S]  (default all)
// D density (300 random road points per city/district, ≤150 m to nearest unfinished thing) + no markers on gates/mission starts/NEXT path
// E every event type completed by a key bot (real K arrows/drift/boost + roamSim), every tier triggered
// C completion % updates, saved (reload), area pop-up, 100% reward · P draw calls at 6 spots (renderer.info) · S screenshots
const {boot}=require('./common.js');const F=require('./fast.js');const BOT=require('./ogbot.js');const fs=require('fs');
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);fs.mkdirSync('shots',{recursive:true});
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+(typeof i==='string'?i:JSON.stringify(i)):''))};
async function B(city,d,o={}){const r=await boot({page:'local_dbg.html',city,ls:d?{'mho_athd@1':d}:{},...o});r.cerr=[];r.p.on('console',m=>{if(m.type()==='error')r.cerr.push(m.text().slice(0,160))});await F.on(r.p);await r.p.evaluate(BOT);await r.p.evaluate(()=>__mho.roamSim(30));return r}
async function fin(r,tag){ok(!r.errs.length&&!r.cerr.length,tag+' no page/console errors',r.errs.concat(r.cerr).slice(0,3));await r.b.close()}
const density=p=>p.evaluate(()=>{const S=__og.spots().filter(s=>!s.done),smp=__og.samples(),G=__mho.athGates(),M=__mho.RO.marks.filter(m=>Number.isFinite(m.x));let worst=0,sum=0,bad=0;
  for(let q=0;q<300;q++){const s=smp[Math.floor(Math.random()*smp.length)];let b=1e9;for(const sp of S){const d=Math.hypot(sp.x-s[0],sp.z-s[1]);if(d<b)b=d}worst=Math.max(worst,b);sum+=b;if(b>150)bad++}
  let onGate=0,onMark=0;for(const sp of __og.spots()){if(G.some(g=>Math.hypot(g.x-sp.x,g.z-sp.z)<50))onGate++;if(M.some(m=>Math.hypot(m.x-sp.x,m.z-sp.z)<40))onMark++}
  const c={};for(const s of __og.spots())c[s.k]=(c[s.k]||0)+1;return{n:S.length,c,areas:__og.areas().length,worst:Math.round(worst),mean:Math.round(sum/300),bad,onGate,onMark,gates:G.length,marks:M.length,ms:__og.OG.ms}});
// warp around and check that no drawn marker sits on a gate / mission start
const visCheck=p=>p.evaluate(()=>{const G=__mho.athGates(),Mk=__mho.RO.marks.filter(m=>Number.isFinite(m.x)),smp=__og.samples();let n=0,badG=0,badM=0,maxVis=0;
  const pts=Mk.slice(0,8).map(m=>[m.x+25,m.z]).concat(G.slice(0,6).map(g=>[g.x,g.z])).concat([0,1,2,3,4,5].map(i=>smp[(i*7919)%smp.length]));
  for(const[x,z]of pts){const q=__mho.rsnap(x,z,200);__mho.warp(q[0],q[1],0);__mho.roamSim(10);__og.tick();const V=__og.vis(),S=__og.spots();maxVis=Math.max(maxVis,__og.drawn());for(const id of V){const sp=S.find(s=>s.id===id);n++;if(G.some(g=>Math.hypot(g.x-sp.x,g.z-sp.z)<50))badG++;if(Mk.some(m=>Math.hypot(m.x-sp.x,m.z-sp.z)<40))badM++}}return{checked:n,badG,badM,maxVis}});
(async()=>{const T0=Date.now();
if(want('D')){for(const[city,d]of[['fra'],['ath','A'],['ath','B'],['ath','C'],['ath','D']]){const r=await B(city,d);const tag=city==='fra'?'Frankfurt':'Athens '+d;
  await r.p.evaluate(()=>{__mho.roamSim(240);__og.tick()});const o=await density(r.p);ok(o.bad===0&&o.worst<=150,`${tag}: 300 random road points, nearest unfinished activity ≤ 150 m`,o);ok(o.onGate===0&&o.onMark===0,`${tag}: no spot within 50 m of a district gate / 40 m of a mission start`,{onGate:o.onGate,onMark:o.onMark,gates:o.gates,marks:o.marks});
  const v=await visCheck(r.p);ok(v.badG===0&&v.badM===0&&v.maxVis<=10,`${tag}: drawn markers never on gates/mission starts, ≤ 10 visible`,v);
  if(city==='fra'){const s=await r.p.evaluate(()=>{const smp=__og.samples(),a=smp[100],b=smp[9000];__mho.warp(a[0],a[1],0);__mho.roamSim(5);__mho.pinSet(b[0],b[1]);__mho.roamSim(30);const N=__mho.qv.nav();__og.tick();const V=__og.vis(),S=__og.spots();let on=0;
      if(N)for(const id of V){const sp=S.find(s=>s.id===id);let dm=1e9;for(let k=1;k<N.P.length;k++){const p=N.P[k-1],q=N.P[k],ex=q[0]-p[0],ez=q[1]-p[1],l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((sp.x-p[0])*ex+(sp.z-p[1])*ez)/l2));dm=Math.min(dm,Math.hypot(p[0]+ex*u-sp.x,p[1]+ez*u-sp.z))}if(dm<15)on++}
      const res={nav:!!N,pts:N?N.P.length:0,vis:V.length,onPath:on};__mho.pinClear();return res});ok(s.nav&&s.onPath===0,'Frankfurt: no marker on the NEXT/GPS story path',s)}
  await fin(r,tag)}}
if(want('E')){const r=await B('fra');const plan={gate:[40,20,16,8],ring:[40,20,16,8],ghost:[40,26,23,22,16,12],rush:[20,40,12,8],smash:[40,16,12,8],drift:[24,40,[24,{dlim:9}],[24,{dlim:5}]],stunt:[28,23,20,35,38],ljump:[40,34,33,28,21]};const all={};
  for(const T in plan){const ids=await r.p.evaluate(T=>__og.spots().filter(s=>s.k==='ev'&&s.t===T&&!__og.blocked(s.id)).map(s=>s.id),T);const got=new Set();let si=0,keyStart=0,runs=[];
    for(const v of plan[T]){let res;for(let k=0;k<5;k++){const id=ids[(si++*37)%ids.length];const[vv,oo]=Array.isArray(v)?v:[v,{}];res=await r.p.evaluate(([id,v,o])=>__ogRun(id,v,o),[id,vv,oo]);if(!res.err)break}if(!res.err){keyStart++;got.add(res.md);runs.push(JSON.stringify(v)+'→'+res.md+'('+res.v+')')}}
    all[T]=[...got];ok(keyStart>=3&&got.has(1)&&got.has(2)&&got.has(3),`${T}: started by driving through the ring (no menu) and finished by key bot; bronze+silver+gold all triggered`,runs.join(' '))}
  const rt=await r.p.evaluate(()=>{const L=__og.spots().filter(s=>s.k==='ev'&&s.t==='gate'&&!__og.blocked(s.id));let id;for(const s of L){id=s.id;if(!__ogRun(id,8).err)break}const a=__og.OG.log.retry;window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyY'}));const ev=__og.ev();const b=__og.OG.log.retry;__og.end();
    __ogRun(id,40);const btn=document.querySelector('#ogRetryR');btn&&btn.click();const ev2=__og.ev();__og.end();return{key:b-a===1&&!!ev&&ev.t==='gate',btn:!!btn&&!!ev2}});
  ok(rt.key&&rt.btn,'instant retry via Y key and via result-banner button restarts the event at its start',rt);
  const lg=await r.p.evaluate(()=>__og.OG.log);ok(lg.fin>=25,'event log',lg);await fin(r,'events')}
if(want('C')){const r=await B('fra');const p=r.p;
  const c=await p.evaluate(()=>{const S=__og.spots();const ev=S.find(s=>s.k==='ev'&&s.t==='ring'&&!__og.blocked(s.id));const A=ev.a,s0=__og.stats(A);
    const res=__ogRun(ev.id,40);const s1=__og.stats(A);const reach=s=>s.k==='col'&&!s.done&&!!__og.appr(s.id,40);const g=S.find(s=>reach(s)&&s.a===A)||S.find(reach);
    const P=__og.appr(g.id,40).P;__mho.warp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]));__mho.roamSim(2);__og.tick();const col0=__og.OG.log.col;__ogDrive(P,14,{maxT:15,until:()=>__og.OG.log.col>col0});
    const sv=JSON.parse(localStorage.getItem('mho_og@1')||'{}');return{p2:__og.stats(A).pct,A,d0:s0.D,p0:s0.pct,md:res.md,d1:s1.D,p1:s1.pct,ev:ev.id,savedEv:sv.e&&sv.e[ev.id],g:g.id,ga:g.a,savedG:!!(sv.c&&sv.c[g.id]),sum:sv.sum&&sv.sum[A]}});
  ok(c.md>=1&&c.d1===c.d0+1&&c.savedEv>=1&&c.sum===c.p2,'completing an event raises the area count/% and is saved to mho_og@1',c);ok(c.savedG,'collectible picked up by driving through it (keys) and saved',{g:c.g,area:c.ga});
  const pop=await p.evaluate(()=>{const S=__og.spots(),here=__og.areaAt(__mho.RO.x,__mho.RO.z),o=S.find(s=>s.a!==here&&s.k==='ev');const q=__mho.rsnap(o.x,o.z,80);__mho.warp(q[0],q[1],0);__mho.K.ArrowUp=true;__mho.roamSim(70);__mho.K.ArrowUp=false;const el=document.getElementById('ogArea');return{to:o.a,shown:!!el&&!el.hidden,txt:el&&el.textContent.slice(0,120)}});
  ok(pop.shown&&/% COMPLETE/.test(pop.txt),'crossing into another district shows the completion pop-up',pop);await F.shot(p,'shots/og_area_popup.jpg',{type:'jpeg',quality:70});
  await p.evaluate(()=>{__mho.toggleMap(true)});await p.waitForTimeout(500);const mp=await p.evaluate(()=>{const el=document.getElementById('ogMapP');return el&&el.textContent.slice(0,200)});ok(mp&&/AREA COMPLETION/.test(mp)&&/%/.test(mp),'map shows per-area completion panel',mp&&mp.slice(0,90));
  await F.shot(p,'shots/og_map.jpg',{type:'jpeg',quality:70});await p.evaluate(()=>{__mho.toggleMap(false);__og.col(true)});const cl=await p.evaluate(()=>document.getElementById('ogCol').textContent.slice(0,160));ok(/UNIQUE COLLECTIBLES/.test(cl)&&/Bembel|Pretzels|glasses|herbs|Skyline/.test(cl),'collection screen lists themed district sets',cl.slice(0,80));
  await F.shot(p,'shots/og_collection.jpg',{type:'jpeg',quality:70});await p.evaluate(()=>__og.col(false));
  await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:240000});await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:240000});await F.on(p);await p.evaluate(BOT);await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}__mho.roamSim(30)});
  const after=await p.evaluate(([A,ev,g])=>({pct:__og.stats(A).pct,evDone:__og.spots().find(s=>s.id===ev).done,gDone:__og.spots().find(s=>s.id===g).done}),[c.A,c.ev,c.g]);ok(after.pct===c.p2&&after.evDone>=1&&after.gDone,'completion % and finished spots survive a page reload',after);
  // 100% reward: mark everything in a story-free area done except one collectible, then drive through it
  const rw=await p.evaluate(()=>{const S=__og.spots(),sv=__og.sv();let A=null,last=null;for(const a of __og.areas()){const st=__og.stats(a);if(st.st[1])continue;const L=S.filter(s=>s.a===a&&s.k==='col'&&!s.done&&!!__og.appr(s.id,40));if(L.length){A=a;last=L[0];break}}if(!A)return{err:'no area'};
    for(const s of S){if(s.a!==A||s.id===last.id)continue;if(s.k==='ev')sv.e[s.id]=3;else if(s.k==='gold')sv.g[s.id]=1;else sv.c[s.id]=1}for(const g of __mho.RO.gbs||[])if(__og.areaAt(g.x,g.z)===A&&g.m)g.m.visible=false;
    const pre=__og.stats(A).pct,cr0=JSON.parse(localStorage.getItem('mho_season@1')||'{}').cr||0;const P=__og.appr(last.id,40).P;__mho.warp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]));__mho.roamSim(2);__og.tick();const c0=__og.OG.log.col;__ogDrive(P,14,{maxT:15,until:()=>__og.OG.log.col>c0});
    const cr1=JSON.parse(localStorage.getItem('mho_season@1')||'{}').cr||0;return{A,pre,post:__og.stats(A).pct,rw:!!__og.sv().rw[A],rewards:__og.OG.log.reward||0,studs:cr1-cr0}});
  ok(rw.pre<100&&rw.post===100&&rw.rw&&rw.rewards===1&&rw.studs>=5000,'reaching 100% in an area grants the reward (livery + 5.000 studs) once',rw);await F.shot(p,'shots/og_reward.jpg',{type:'jpeg',quality:70});
  await fin(r,'completion')}
if(want('P')){const r=await B('fra');await F.off(r.p);const pr=await r.p.evaluate(()=>{const D=__dbg,ri=D.renderer.info,smp=__og.samples(),out=[];ri.autoReset=false;
    const meas=()=>{ri.reset();D.composer.render();return ri.render.calls};const og=()=>D.scene.getObjectByName('OG');
    for(let i=0;i<6;i++){const s=smp[(i*4001+77)%smp.length];__mho.warp(s[0],s[1],i);__mho.roamSim(20);__og.tick();__mho.roamSim(2);const g=og();const rr=__og.OG.ramps.flatMap(q=>q.meshes);const vis=rr.map(m=>m.visible);
      const on=meas();g.visible=false;rr.forEach(m=>m.visible=false);const off=meas();g.visible=true;rr.forEach((m,k)=>m.visible=vis[k]);out.push({on,off,drawn:__og.drawn()})}ri.autoReset=true;return out});
  const worst=Math.max(...pr.map(q=>(q.on-q.off)/q.off));ok(worst<=.05,'draw calls with OG markers vs without at 6 spots: regression ≤ 5%',{worstPct:+(worst*100).toFixed(2),spots:pr});await fin(r,'perf')}
if(want('S')){const r=await B('fra');
  const go=(T,v,cut)=>r.p.evaluate(([T,v,cut])=>{for(const sp of __og.spots().filter(s=>s.t===T&&!s.done&&!__og.blocked(s.id))){const A=__og.appr(sp.id,45),P=A.P;__mho.warp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]));__mho.roamSim(3);__og.tick();
      if(cut==='pre'){__ogDrive(P,10,{maxT:2.5});return 1}__ogDrive(P,22,{maxT:12,until:()=>!!__og.OG.ev});if(!__og.OG.ev)continue;if(__og.OG.ev.sp.id!==sp.id){__og.end();continue}const E=__og.ev();__ogDrive(E.P,v,{maxT:cut,until:()=>!__og.OG.ev});return 1}return 0},[T,v,cut]);
  await go('ring',0,'pre');await F.shot(r.p,'shots/og_markers.jpg',{type:'jpeg',quality:70});
  await go('gate',30,4);await F.shot(r.p,'shots/og_event.jpg',{type:'jpeg',quality:70});
  await r.p.evaluate(()=>{const E=__og.ev();if(E)__ogDrive(E.P,40,{maxT:40,until:()=>!__og.OG.ev})});await F.shot(r.p,'shots/og_result.jpg',{type:'jpeg',quality:70});
  await go('stunt',28,2.1);await F.shot(r.p,'shots/og_stunt.jpg',{type:'jpeg',quality:70});
  await fin(r,'shots')}
console.log(`\ntOG: ${pass} pass, ${fail} fail · ${Math.round((Date.now()-T0)/1000)} s`);process.exit(fail?1:0)})().catch(e=>{console.log('FAIL tOG crashed: '+(e&&e.stack||e));console.log(`\ntOG: ${pass} pass, ${fail+1} fail`);process.exit(1)});
