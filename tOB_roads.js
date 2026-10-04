// tOB_roads: road-network audit before (localStorage.ob_nofix='1') / after (repair on) for Frankfurt and Athens A–D.
// Asserts after the repair: dangling stubs < 40 m = 0, unjoined endpoint pairs within 12 m = 0, >= 99 % of drawn road length in the
// main connected component, no unplated crossings left, GPS (__mho.qv.path) routes across the map, zero page errors.
// Shots: 5 fixed spots, roam map (2D, the drawn street network) before/after -> shots/ob_road_N_before|after.jpg
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');
const U='http://127.0.0.1:8766/'+(process.env.PAGE||'local_dbg.html');
// spots = the biggest repairs logged in __ob.RA.log: 1 grid street extended 40 m to the next crossing, 2 Frankfurt street end snapped 37 m,
// 3 Athens A dead end snapped 40 m, 4 Athens B orphan linked 60 m, 5 Athens D orphan linked 49 m
const SPOTS={fra:[[1,812,-480],[2,462,128]],A:[[3,1268,-2391]],B:[[4,1812,-304]],D:[[5,-3254,1858]],C:[]};
const GPS={fra:[-1500,-800,1500,900],A:[-900,300,600,-300],B:[800,-1200,2600,1000],C:[2800,0,5000,4300],D:[5400,4000,7700,8300]};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};const rows=[];
for(const cd of (process.env.C||'fra,A,B,C,D').split(',')){const res={};
 for(const nf of['1','0']){const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.setDefaultTimeout(900000);
  await p.goto(U);await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');
  await p.evaluate(([cd,nf])=>{localStorage.clear();localStorage.setItem('mho_slot','1');const c=cd==='fra'?'fra':'ath';localStorage.setItem('mho_city@1',c);if(c==='ath')localStorage.setItem('mho_athd@1',cd);localStorage.setItem('mho_roam'+(c==='ath'?'.ath':'')+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}');if(nf==='1')localStorage.setItem('ob_nofix','1')},[cd,nf]);
  await p.reload();await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');await F.on(p);
  await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}});
  const a=await p.evaluate(g=>{const M=__mho,A=__ob.roadAudit();let gps=null;try{const[x0,z0]=M.W(g[0],g[1]),[x1,z1]=M.W(g[2],g[3]),q0=M.rsnap(x0,z0,300),q1=M.rsnap(x1,z1,300),P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);gps={n:P.length,L:Math.round(L),direct:Math.round(Math.hypot(q1[0]-q0[0],q1[1]-q0[1]))}}catch(e){gps={err:String(e)}}return{A,gps,RA:{ops:__ob.RA.ops,ms:__ob.RA.ms}}},GPS[cd]);
  res[nf]=a;console.log('INFO',cd,nf==='1'?'BEFORE':'AFTER ',JSON.stringify({...a.A,spots:undefined}),'gps',JSON.stringify(a.gps),nf==='0'?'ops '+JSON.stringify(a.RA):'');
  for(const[n,x,z]of SPOTS[cd]){await p.evaluate(([x,z])=>{const M=__mho;M.warp(x,z,0);M.roamSim(2);M.RO.mapC={x,z};M.RO.mapZ=10;M.toggleMap(true)},[x,z]);await p.waitForTimeout(400);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.evaluate(([x,z])=>{const M=__mho;M.RO.mapC={x,z};M.RO.mapZ=10},[x,z]);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await p.evaluate(([x,z])=>{const c=document.querySelector('#roamMapC'),R=c.getBoundingClientRect(),[px,py]=__mho.RO.mapP(x,z),k=R.width/c.width,d=document.createElement('div');d.id='obRing';d.style.cssText=`position:fixed;left:${R.left+px*k-34}px;top:${R.top+py*k-34}px;width:68px;height:68px;border:3px solid #ff2d55;border-radius:50%;z-index:99999;pointer-events:none`;document.body.appendChild(d)},[x,z]);
   await p.locator('#roamMapC').screenshot({path:`shots/ob_road_${n}_${nf==='1'?'before':'after'}.jpg`,type:'jpeg',quality:70,timeout:600000});await p.evaluate(()=>{document.getElementById('obRing').remove();__mho.toggleMap(false)})}
  ok(!errs.length,`${cd} ${nf==='1'?'before':'after'}: no page errors ${JSON.stringify(errs.slice(0,2))}`);await p.context().close()}
 const B=res['1'].A,A=res['0'].A,g=res['0'].gps;rows.push([cd,B,A]);
 ok(A.stubs40===0,`${cd}: dangling stubs < 40 m ${B.stubs40} -> ${A.stubs40}`);
 ok(A.gaps12===0,`${cd}: unjoined endpoint gaps <= 12 m ${B.gaps12} -> ${A.gaps12}`);
 ok(A.mainFrac>=.99,`${cd}: drawn length in main component ${(B.mainFrac*100).toFixed(1)}% -> ${(A.mainFrac*100).toFixed(1)}% (orphans ${B.orphans} -> ${A.orphans})`);
 ok(A.noPlate===0,`${cd}: crossings without a junction plate ${B.noPlate} -> ${A.noPlate}`);
 ok(A.qvCov>=.99,`${cd}: drawn streets covered by the GPS graph ${B.qvCov} -> ${A.qvCov}`);
 ok(g&&g.n>20&&g.L>g.direct*.8,`${cd}: GPS route across the map ${JSON.stringify(g)}`)}
console.log('\n| city | segs | km | dead ends | stubs<40 | gaps<=12 | no-plate crossings | orphans | main % |');console.log('|---|---|---|---|---|---|---|---|---|');
for(const[cd,B,A]of rows)console.log(`| ${cd} | ${B.segs+(B.fillSegs||0)} -> ${A.segs+(A.fillSegs||0)} | ${B.km} -> ${A.km} | ${B.deadEnds} -> ${A.deadEnds} | ${B.stubs40} -> ${A.stubs40} | ${B.gaps12} -> ${A.gaps12} | ${B.noPlate} -> ${A.noPlate} | ${B.orphans} -> ${A.orphans} | ${(B.mainFrac*100).toFixed(2)} -> ${(A.mainFrac*100).toFixed(2)} |`);
console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();
