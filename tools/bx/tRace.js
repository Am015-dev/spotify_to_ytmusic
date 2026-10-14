// builder RACE MVP checks (trk-2), phone profile (touch, GAS automatic), FAIL lines only. node tools/bx/tRace.js  (~40 s)
// 1) GO -> countdown 3,2,1,GO shown and the car moves <= 0.5 m before GO
// 2) 10 s after GO: 5 rivals, each >= 100 m along the course, position HUD = the computed ranking (the checklist check)
// 3) finish: the player's lap count is set to 2 (test state) -> the results card lists 6 cars with times, your place highlighted
const L=require('./lib.js');
(async()=>{const {b,p,E}=await L.launch();const F=[];await p.evaluate(()=>__chk.go('bxT/bx-race'));await L.sleep(150);
 await p.waitForFunction(()=>__bx.race()&&__bx.race().cd>0,null,{timeout:60000});const seen=new Set();let p0=null,moved=0;
 while(true){const q=await p.evaluate(()=>{const r=__bx.race(),V=__bx.BX.v;return{cd:r.cd,txt:(document.querySelector('#bxCd')||{}).textContent,p:[V.p.x,V.p.y,V.p.z]}});
  if(!p0)p0=q.p;if(q.cd>0)moved=Math.max(moved,Math.hypot(q.p[0]-p0[0],q.p[2]-p0[2]));if(q.txt)seen.add(q.txt);if(q.cd<=0&&seen.has('GO!'))break;if(q.cd<=0&&seen.size>4)break;await L.sleep(100)}
 for(const t of['3','2','1','GO!'])if(!seen.has(t))F.push(`✘ countdown never showed ${t} (saw ${[...seen].join(',')})`);if(moved>.5)F.push(`✘ car moved ${moved.toFixed(2)} m before GO`);
 if(process.env.SHOT){await p.waitForFunction(()=>__bx.race().t>2.5,null,{timeout:30000});await L.shot(p,process.env.SHOT)}
 await p.waitForFunction(()=>__bx.race().t>10,null,{timeout:60000});
 const r2=await p.evaluate(()=>{const r=__bx.race();return{d:r.rv.map(q=>q.s-r.s0),chk:__bx.check('bx-race')}});
 if(r2.d.length<5)F.push(`✘ rivals ${r2.d.length}`);if(r2.d.some(x=>x<100))F.push(`✘ rival progress ${r2.d.map(x=>x.toFixed(0)).join('/')} m in 10 s`);if(!r2.chk.ok)F.push('✘ '+r2.chk.msg);
 await p.evaluate(()=>{__bx.BX.m.laps=2});await p.waitForFunction(()=>document.querySelector('#bxRes'),null,{timeout:5000}).catch(()=>{});
 const r3=await p.evaluate(()=>{const t=document.querySelectorAll('#bxResT tr');return{n:t.length,me:[...t].findIndex(x=>/YOU/.test(x.textContent))+1,times:[...t].every(x=>/\d:\d\d\.\d\d/.test(x.textContent)),place:(__bx.race()||{}).place}});
 if(r3.n!==6||!r3.times||r3.me!==r3.place)F.push(`✘ results rows ${r3.n}, times ${r3.times}, YOU row ${r3.me} vs place ${r3.place}`);
 console.log('bx-race',F.length?'FAIL':'PASS',F.join(', '),process.env.V?`| countdown ${[...seen].join(',')}, moved ${moved.toFixed(2)} m, rivals ${r2.d.map(x=>x.toFixed(0)).join('/')} m, ${r2.chk.msg}, results ${r3.n} rows, place ${r3.place}`:'');
 console.log('errors',E.length?E.slice(0,3).join(' / '):'none');await b.close()})();
