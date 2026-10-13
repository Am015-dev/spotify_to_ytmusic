// tDmgGo: the dmg: checklist tests (src/99c_checklist.js v90n/dmg-go-*), state asserts only (coordinator: no driving, < 3 s each). Each runs the item's
// 📍 GO (DMG_go: your car on a street + the scripted hits through DMG_impact, the function the collisions call) and checks the pass line.
//   node tools/tDmgGo.js <url …/index.html> [light,medium,wreck,graze,perf]   env SHOTS=1 (one shot after the medium crash), ALL=1 (PASS lines too)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const U=process.argv[2],ONLY=(process.argv[3]||'light,medium,wreck,graze,perf').split(','),OUT='qa_dmg';fs.mkdirSync(OUT,{recursive:true});let nOk=0,nAll=0;
const ok=(t,c,m,i)=>{nAll++;if(c)nOk++;if(!c||process.env.ALL==='1')console.log((c?'PASS ':'FAIL ')+t+' · '+m+(i!==undefined?' · '+JSON.stringify(i):''))};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});const t0=Date.now();
 await p.goto(U+(U.includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__dmg,null,{polling:250,timeout:120000});
 const W=ms=>p.waitForTimeout(ms),st=()=>p.evaluate(()=>__dmg.st()),go=k=>p.evaluate(k=>__chk.go('v90n/dmg-go-'+k),k);
 try{
 if(ONLY.includes('light')){await go('light');await W(300);const s=await st();ok('light',s.hp===100&&s.deb===0,'20 km/h bump: health 100 %, 0 bricks',s);ok('light',s.hull==='hidden','health bar hidden at 100 %',{hull:s.hull})}
 if(ONLY.includes('medium')){await go('medium');await W(400);const s=await st();ok('medium',s.hp>=70&&s.hp<=90,'50 km/h crash: health 70-90 %',{hp:s.hp});ok('medium',s.deb>=2&&s.deb<=6,'2-6 bricks fly off',{deb:s.deb});
  ok('medium',s.hid>0,'outer bricks missing from the car',{hid:s.hid});ok('medium',!s.wk&&s.n.boom===0,'no explosion',{wk:s.wk});ok('medium',s.hull==='visible','health bar shows',{hull:s.hull});
  if(process.env.SHOTS==='1'){await p.evaluate(()=>__tq.draw()).catch(()=>{});await W(200);await p.screenshot({path:OUT+'/dmg_medium.jpg',type:'jpeg',quality:75})}}
 if(ONLY.includes('wreck')){const s0=await st();await go('wreck');await p.waitForFunction(b=>__dmg.st().n.boom>b,s0.n.boom,{polling:50,timeout:3000}).catch(()=>{});const s1=await st();ok('wreck',s1.n.boom>s0.n.boom,'8 crashes at 60 km/h: exploded',{boom:s1.n.boom,hits:s1.n.hits-s0.n.hits});
  await p.waitForFunction(r=>__dmg.st().n.rebuilt>r,s1.n.rebuilt,{polling:50,timeout:4000}).catch(()=>{});const s2=await st();const dt=(s2.tReb-s2.tBoom)/1000;ok('wreck',s2.n.rebuilt>s1.n.rebuilt&&dt<=2.5,'rebuilt on the road ≤ 2.5 s, full health',{s:+dt.toFixed(2),hp:s2.hp,hid:s2.hid})}
 if(ONLY.includes('graze')){await go('graze');await W(200);const s=await st();ok('graze',s.hp===100&&s.deb===0,'15° graze at 80 km/h: no damage',s)}
 if(ONLY.includes('perf')){await go('medium');const r=await p.evaluate(async()=>{for(let i=0;i<20;i++){__dmg.S.lastHit=-1e9;window.__dmg.impact(40)}const t=performance.now();const L=[];await new Promise(res=>{let n=0;const f=()=>{const a=performance.now();if(++n<30)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});return{deb:__dmg.st().deb}});
  ok('perf',r.deb<=60,'≤ 60 live debris after 20 crashes',r);const B=await p.evaluate(()=>__dmg.bench());ok('perf',B.ms<=1,'60 live debris cost ≤ 1 ms per frame',B)}
 }catch(e){console.log('ERROR '+String(e).slice(0,300))}
 ok('all',errs.length===0,'no console errors',errs.slice(0,3));console.log(`GO ${nOk}/${nAll} · ${((Date.now()-t0)/1000).toFixed(0)} s`);await b.close()})();
