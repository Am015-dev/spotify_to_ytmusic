// lv/pop.js <url> <outdir> [fra|ath]: v88p roadside pop-ups. For each kind: warp to a straight street, spawn the ring ahead (shot _gate),
// hold GAS (real key) through it (shot _run while the course is up), keep driving straight until it ends; logs result + errors.
const enter=require('../bc/enter.js');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3],CITY=process.argv[4]||'fra';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const dis=async()=>{for(let i=0;i<4;i++){const l=p.getByText('CONTINUE',{exact:false}).first();if(await l.count()&&await l.isVisible()){await E.tapEl(await l.elementHandle());await p.waitForTimeout(800)}else break}};await dis();
 const ev=c=>p.evaluate(c=>{try{return __g9ev(c)}catch(e){return 'ERR '+e}},c);
 // straight streets: nodes whose LVP_path() is non-null after a warp
 const kinds=(process.env.KINDS||'0,1,2,3').split(',').map(Number);let si=+(process.env.SI||0);
 for(const k of kinds){let ok=false;for(let tries=0;tries<25&&!ok;tries++){si++;
    const r=await ev(`(()=>{const N=HUB.nodes.filter(n=>n&&n.nb&&n.nb.length>=2&&!n.ab&&!n.g&&(n.w||0)>=10);const a=N[Math.floor((${si}*.137%1)*N.length)],b=HUB.nodes[a.nb[0]];const h=Math.atan2(b.x-a.x,b.z-a.z);__mho.warp(a.x,a.z,h,performance.now());RO.x=a.x;RO.z=a.z;RO.y=__mho.gnd(a.x,a.z,RO.y+60);RO.v=0;RO.h=RO.vh=h;if(LVP.c)LVP_end(LVP.c,false);return 1})()`);
    await p.waitForTimeout(1500);ok=await ev(`(()=>{LVP.k=${k};LVP.cd=999;return !!LVP_path()&&LVP_spawn()})()`)===true}
  if(!ok){console.log('kind',k,'no straight street');continue}
  await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${CITY}_pop${k}_gate.png`});console.log('gate',k,await ev(`JSON.stringify({k:LVP.c&&LVP.c.K.k,d:LVP.c&&Math.round(Math.hypot(LVP.c.gx-RO.x,LVP.c.gz-RO.z)),line:(document.querySelector('#roamArrow span')||{}).textContent||(document.querySelector('#m1Next .crD')||{}).textContent})`));
  await p.keyboard.down('ArrowUp');let shot=false;const t0=Date.now();
  while(Date.now()-t0<60000){const st=await ev(`LVP.c?LVP.c.st+':'+LVP.c.t.toFixed(1)+':'+LVP.c.v.toFixed(1):'none'`);
   if(!shot&&st.startsWith('1:')&&parseFloat(st.split(':')[1])>(k===0?0.3:0.6)){await p.screenshot({path:`${OUT}/${CITY}_pop${k}_run.png`});shot=true;console.log('run',k,st,await ev(`(document.querySelector('#roamArrow span')||{}).textContent+' | '+((document.querySelector('#m1Next .crD')||{}).textContent||'')`))}
   if(st==='none')break;await p.waitForTimeout(400)}
  await p.keyboard.up('ArrowUp');await p.waitForTimeout(600);if(k===2||k===0)await p.screenshot({path:`${OUT}/${CITY}_pop${k}_end.png`});
  console.log('end',k,await ev(`JSON.stringify({ok:LVP.ok,miss:LVP.miss,ramps:RO.ramps.length})`))}
 console.log('errors',errs.length,errs.slice(0,5).join(' | '));await E.b.close()})();
