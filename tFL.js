// tFL: FL feature tests — auto vehicle switch (real keys), smash→boost + combo + takedown, day/night shots both cities, setting persistence, perf
// usage: node tFL.js [V B D P]   (default all)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);const SH='shots/';fs.mkdirSync(SH,{recursive:true});
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
async function boot(b,city,ls={}){const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(900000);p.errs=[];
 p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,160))});
 await p.goto('http://127.0.0.1:8766/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 if(!ls.keep)await p.evaluate(([c,ls])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}');for(const q in ls)localStorage.setItem(q,ls[q])},[city,ls]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.on(p);
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}});await p.evaluate(()=>__mho.roamSim(30));return p}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
// ---------- V: road → grass bank → river with keyboard; auto switch car → 4x4 → boat, no flicker, never mid-air; manual override; dirt speed/grip
if(want('V')){const p=await boot(b,'fra');
 const prof=await p.evaluate(()=>{const g=__fl.geo(),M=__mho;const cl=(x,z)=>M.gnd(x,z,5)<-1.5?'w':__fl.road(x,z)?'r':(M.roamHitAt(x,z,2.5,0)?'B':'d');let best=null;
  for(const S of g.riv)for(let i=1;i<S.length-1;i++){const a=S[i-1],c=S[i+1],tx=c[0]-a[0],tz=c[1]-a[1],L=Math.hypot(tx,tz),nx=tz/L,nz=-tx/L;for(const sd of[-1,1]){let seq='';for(let d=0;d<220;d+=4)seq+=cl(S[i][0]+nx*sd*d,S[i][1]+nz*sd*d);const m=seq.match(/^(w+)(d{12,})(r{4,})/);if(m&&(!best||m[2].length>best.dl))best={p:S[i],n:[nx*sd,nz*sd],w:m[1].length*4,dl:m[2].length*4,r:(m[1].length+m[2].length+2)*4,seq}}}return best});
 ok(!!prof,'V0 found a road → grass bank → river profile on the Main',prof&&{p:prof.p,dirt:prof.dl});
 const r=await p.evaluate(pr=>{const M=__mho,R=M.RO,K=M.K;R.vsel='auto';const sx=pr.p[0]+pr.n[0]*pr.r,sz=pr.p[1]+pr.n[1]*pr.r,h=Math.atan2(-pr.n[0],-pr.n[1]);M.warp(sx,sz,h);M.roamSim(40);__fl.clr();
  const tg=[pr.p[0]-pr.n[0]*20,pr.p[1]-pr.n[1]*20];const seq=[],vs=[];let raw=null,rawN=0,air=0,airSw=0,lastV=__fl.surf().v;
  for(let t=0;t<60*40;t++){let a=Math.atan2(tg[0]-R.x,tg[1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));K.ArrowLeft=a>.04;K.ArrowRight=a<-.04;K.ArrowUp=R.v<26;M.roamSim(1);const s=__fl.surf();
   if(s.raw!==raw){raw=s.raw;rawN++}if(!seq.length||seq[seq.length-1]!==s.s)seq.push(s.s);if(s.v!==lastV){vs.push(s.v);if(__mho.RO.y>M.gnd(R.x,R.z,R.y+.3)+.6)airSw++;lastV=s.v}
   if(Math.hypot(tg[0]-R.x,tg[1]-R.z)<8||(s.s==='water'&&t>60&&seq.length>=3&&vs.length>=2&&++air>120))break}
  K.ArrowLeft=K.ArrowRight=K.ArrowUp=false;return{seq,vs,rawN,airSw,log:__fl.log(),boat:M.RO.veh}},prof);
 ok(r.seq.join('>')==='road>dirt>water','V1 bot crossed road → grass → water (stable surface sequence)',r.seq);
 ok(r.vs.join('>')==='offroad>boat'&&r.log.length===2,'V2 vehicle switched automatically to 4×4 then boat, exactly 1 switch per surface change',{vs:r.vs,rawTransitions:r.rawN});
 ok(r.airSw===0,'V3 no switch happened mid-air',r.airSw);
 await F.shot(p,SH+'fl_boat.png');
 // manual override: the vehicle button forces a vehicle; AUTO returns to surface choice
 const o=await p.evaluate(()=>{const R=__mho.RO;document.querySelector('#roamVeh').click();const a=R.vsel;__mho.roamSim(30);const v1=__fl.surf().v;while(R.vsel!=='auto')document.querySelector('#roamVeh').click();__mho.roamSim(30);return{a,v1,v2:__fl.surf().v}});
 ok(o.a!=='auto'&&o.v1===({ship:'ship',boat:'boat',offroad:'offroad'}[o.a])&&o.v2==='boat','V4 manual button overrides, AUTO restores boat on water',o);
 // street car vs 4x4 on the grass bank: top speed after 6 s full throttle
 const sp=await p.evaluate(pr=>{const M=__mho,R=M.RO,K=M.K,out={};const x=pr.p[0]+pr.n[0]*(pr.w+pr.dl/2),z=pr.p[1]+pr.n[1]*(pr.w+pr.dl/2),h=Math.atan2(pr.n[1],-pr.n[0]);
  for(const v of['ship','offroad']){R.vsel=v;M.warp(x,z,h);M.roamSim(20);K.ArrowUp=true;let mx=0;for(let i=0;i<360;i++){M.roamSim(1);if(__fl.surf().raw==='dirt')mx=Math.max(mx,R.v)}K.ArrowUp=false;out[v]=+mx.toFixed(1)}R.vsel='auto';return out},prof);
 ok(sp.offroad>sp.ship*1.15,'V5 off-roader is faster than the street car on grass/dirt',sp);
 errs.push(...p.errs.map(e=>'V: '+e));await p.close()}
// ---------- B: smashing fills boost (size-scaled, chain multiplier), passive recharge slower, goon takedown refill
if(want('B')){const p=await boot(b,'fra');
 const r=await p.evaluate(()=>{const M=__mho,R=M.RO,H=M.HUB,pl=M.pl;const used=new Set();
  const iso=q=>!H.props.some(o=>o!==q&&Math.hypot(o.x-q.x,o.z-q.z)<12);const pick=n=>{const P=H.props.filter(q=>q.alive&&!used.has(q)&&Math.abs(q.y)<1&&!M.roamHitAt(q.x,q.z,2.5,0)&&iso(q)).sort((a,b)=>Math.hypot(a.x-R.x,a.z-R.z)-Math.hypot(b.x-R.x,b.z-R.z)),o=[];for(const q of P){if(o.length>=n)break;if(o.some(s=>Math.hypot(s.x-q.x,s.z-q.z)<10))continue;o.push(q);used.add(q)}return o};
  const types=q=>H.ptypes[q.t];
  const run=(L,gapF)=>{M.roamSim(120);pl.bm=0;__fl.clr();const bases=L.map(q=>__fl.base(types(q)));const n0=H.smashed;let exp=0,ch=0,frames=0;for(const q of L){R.x=q.x;R.z=q.z;R.y=q.y;R.v=1;R.vy=0;M.roamSim(1);frames++;R.v=0;ch++;exp+=__fl.base(types(q))*__fl.mult(gapF?1:ch);if(gapF){M.roamSim(gapF);frames+=gapF}else{M.roamSim(10);frames+=10}}
   return{n:H.smashed-n0,bm:+pl.bm.toFixed(2),exp:+exp.toFixed(2),rech:+(frames/60*__fl.RECH).toFixed(2),gains:__fl.gainLog(),bases,mult:L.map((q,i)=>gapF?1:__fl.mult(i+1)),t:L.map(q=>q.t)}};
  const chain=run(pick(5),0),solo=run(pick(5),120);
  // passive recharge rate: 10 s idle from 0
  pl.bm=0;R.v=0;M.roamSim(600);const rech=+pl.bm.toFixed(2);
  // goon takedown
  __m1.spawn('rammer',1);const g=__m1.M1.goons.find(q=>!q.dead);pl.bm=10;__fl.takedown(g);const td=+pl.bm.toFixed(1);
  return{chain,solo,rech,td}});
 const inR=(x)=>x.n===5&&x.bm>=x.exp-.01&&x.bm<=x.exp+x.rech+.5;
 ok(inR(r.chain),'B1 5 chained smashes raise boost by the size-scaled, combo-multiplied amount',r.chain);
 const exact=x=>x.gains.length===5&&x.gains.every((g,i)=>Math.abs(g-x.bases[i]*x.mult[i])<.01);ok(exact(r.solo)&&exact(r.chain),'B2 combo: chained smashes get ×1.25…×2, spaced-out smashes get ×1 (per-smash gains exact)',{chain:r.chain.gains,chainBase:r.chain.bases,solo:r.solo.gains,soloBase:r.solo.bases});
 ok(r.rech>30&&r.rech<50,'B3 passive recharge slowed (≈4.5/s instead of 7/s; 10 s idle)',r.rech);
 ok(r.td>=54,'B4 goon takedown gives a big refill (+45)',r.td);
 await p.evaluate(()=>{__mho.pl.bm=40;const q=__mho.HUB.props.find(q=>q.alive&&Math.hypot(q.x-__mho.RO.x,q.z-__mho.RO.z)<200&&!__mho.roamHitAt(q.x,q.z,2.5,0));if(q){__mho.RO.x=q.x;__mho.RO.z=q.z;__mho.RO.v=10;__mho.roamSim(1)}const e=document.getElementById('flPop');if(e){e.style.animation='none';e.style.opacity=1}});await F.shot(p,SH+'fl_boostpop.png',{clip:{x:420,y:520,width:440,height:200}});
 errs.push(...p.errs.map(e=>'B: '+e));await p.close()}
// ---------- D: day/night — 4 times of day in both cities, cycle advances, setting + time persist; P: perf night ≤ day
const info=p=>p.evaluate(()=>{const r=__dbg.renderer,ar=r.info.autoReset;r.info.autoReset=false;r.info.reset();(window.__fastR||__dbg.composer.render).call(__dbg.composer);const o={calls:r.info.render.calls,tri:r.info.render.triangles};r.info.autoReset=ar;return o});
if(want('D')||want('P'))for(const city of['fra','ath']){const p=await boot(b,city);
 if(want('D')){for(const [t,n] of [[.27,'sunrise'],[.5,'noon'],[.745,'golden'],[.93,'night']]){await p.evaluate(t=>{__fl.setT(t);__mho.roamSim(8)},t);await F.shot(p,`${SH}fl_${city}_${n}.jpg`,{type:'jpeg',quality:70})}
  const q=await p.evaluate(()=>{__fl.setT(.5);__mho.roamSim(2);const a=__fl.t();__mho.roamSim(3600);const b2=__fl.t();__fl.setT(.93);__mho.roamSim(8);const nt=__fl.night();__fl.setT(.5);__mho.roamSim(8);return{a,b:b2,dh:+((b2-a)*24).toFixed(3),nt,dn:__fl.night()}});
  ok(Math.abs(q.dh-1)<.02,`D1 ${city}: 60 s of play = 1 hour of game time (24 min cycle)`,q);ok(q.nt>.95&&q.dn<.05,`D2 ${city}: night factor lights lamps/windows/headlights at night, off at noon`,q)}
 if(want('P')){const at=async x=>{await p.evaluate(x=>{__fl.setT(x);__fl.apply()},x);return info(p)};await p.evaluate(()=>{__fl.setT(.5);__mho.roamSim(8);__mho.RO.frozen=true});await F.shot(p,SH+'tmp.png');await at(.93);await at(.5);const d1=await at(.5),n=await at(.93),d2=await at(.5);await p.evaluate(()=>{__mho.RO.frozen=false});
  const vo=await p.evaluate(()=>{const c=()=>{let k=0;__dbg.scene.traverseVisible(m=>{if(m.isMesh||m.isPoints)k++});return k};__fl.setT(.5);__fl.apply();const d=c();__fl.setT(.93);__fl.apply();const n=c();return{d,n}});
  ok(n.calls<=Math.max(d1.calls,d2.calls)&&n.tri<=Math.max(d1.tri,d2.tri)&&vo.n<=vo.d,`P1 ${city}: night draw calls/triangles ≤ day (same frozen frame, day→night→day) and no extra visible meshes`,{day:[d1,d2],night:n,visibleMeshes:vo})}
 errs.push(...p.errs.map(e=>city+': '+e));await p.close()}
if(want('D')){const p=await boot(b,'fra');
 await p.evaluate(()=>{__mho.roamSim(10);__fl.setT(.6);__fl.mode('night')});const m0=await p.evaluate(()=>__fl.t());
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.on(p);
 const r=await p.evaluate(()=>({mode:__fl.mode(),t:__fl.t(),n:(__mho.roamSim(8),__fl.night())}));
 await p.evaluate(()=>__fl.mode('cycle'));const t2=await p.evaluate(()=>__fl.t());
 ok(r.mode==='night'&&r.n>.95&&m0===.02,'D3 "Always night" setting persists across reload',r);ok(Math.abs(t2-.6)<.01,'D4 cycle time of day is saved across reload (back to Cycle → 14:24)',t2);
 await p.click('#roamSetBtn');await p.waitForTimeout(500);
 const seg=await p.evaluate(()=>{const el=[...document.querySelectorAll('.seg')].find(e=>/Time of day/.test(e.textContent));return el?[...el.querySelectorAll('button')].map(x=>x.textContent):null});ok(seg&&seg.join('|')==='Cycle|Always day|Always night','D5 settings has Cycle / Always day / Always night',seg);
 errs.push(...p.errs);await p.close()}
ok(errs.length===0,'no page/console errors',errs.slice(0,5));try{fs.unlinkSync(SH+'tmp.png')}catch(e){}
console.log(`tFL: ${pass} pass, ${fail} fail`);await b.close();process.exit(fail?1:0)})();
