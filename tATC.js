// tATC: Athens campaign bot test. Plays all 12 campaign entries (3 chapters × 3 missions + rival race) with the m1 bot,
// across the 4-district split: missions that cross a DRIVE TO gate really reload into the next district and must resume there.
// usage: node tATC.js [startStep]     (fast.js: drawing skipped except for the few screenshots)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const BOT=require('./m1bot.js');const fs=require('fs');
const START=+(process.argv[2]||0);const SH='shots/';fs.mkdirSync(SH,{recursive:true});
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const T0=Date.now();
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
 const ev=(f,a)=>p.evaluate(f,a);
 // wait for (re)boot into roam in Athens, then fast mode + bot + graph/marks ready
 async function ready(){for(let i=0;i<600;i++){try{const s=await ev(()=>window.__mho&&window.__atc&&__mho.state);if(s==='menu')await ev(()=>__mho.enterRoam());if(s==='roam')break}catch(e){}await sleep(1000)}
  await F.on(p);await ev(BOT);for(let i=0;i<80;i++){const r=await ev(()=>{__mho.roamSim(10);return __mho.RO.on&&(__atc.marks().length>0||!!__atc.st().pend||!!__mho.RO.ch||__atc.st().step>=12||__atc.next()&&__atc.next().act==='dist')});if(r)break;await sleep(200)}}
 async function reloadWait(){for(let i=0;i<120;i++){try{const g=await ev(()=>!window.__m1bot);if(g)break}catch(e){}await sleep(1000)}await ready()}
 const shot=async n=>{try{await F.shot(p,SH+n+'.jpg',{type:'jpeg',quality:70})}catch(e){console.log('shot fail',n)}};
 await p.goto('http://127.0.0.1:8766/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});
 await ev(([st])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}');
  if(st)localStorage.setItem('mho_atc.ath@1',JSON.stringify({v:1,step:st,done:{},rw:st>=4?{ghost:1}:{},pend:null}))},[START]);
 await p.reload();await ready();
 const order=await ev(()=>__atc.order);ok(order.length===12,'12 campaign entries (3 chapters × 3 missions + rival race)',order);
 if(START===0){const n=await ev(()=>{const n=__atc.next();return n&&{t:n.t,act:n.act}});ok(n&&/Koulouri/.test(n.t),'fresh Athens save: NEXT points at Ch1 Koulouri Rush',n);}
 let xfers=0,shots=0;const times={};
 for(let step=START;step<12;step++){const id=order[step];const D=await ev(id=>__atc.def(id),id);
  // reach the start district through the real NEXT pill (click)
  for(let k=0;k<2;k++){const cur=await ev(()=>__mho.athd());if(cur===D.d)break;await ev(()=>{__m1.M1.pT=0;__mho.roamSim(2)});const box=await ev(()=>{const e=document.querySelector('#m1Next');if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,e.innerText]});
   if(box){await p.mouse.click(box[0],box[1])}else await ev(()=>__m1.nextGo());await reloadWait()}
  ok(await ev(()=>__mho.athd())===D.d,`${id}: in its start district ${D.d} via the NEXT pill`);
  await ev(id=>{window.__m1log=null;window.__m1b={};__atc.start(id)},id);
  const st0=await ev(()=>__atc.stages());let cross=0;
  for(let k=0;k<300;k++){let r;try{r=await ev(()=>__m1bot(50,40,{}))}catch(e){r={on:false,nav:1}}
   if(!r.on){let pend=null;try{pend=await ev(()=>__atc.st().pend)}catch(e){pend={nav:1}}
    if(pend){cross++;xfers++;await reloadWait();const q=await ev(()=>({d:__mho.athd(),on:!!__mho.RO.ch,si:__atc.si(),st:__atc.stages(),res:__atc.resumed(),pend:__atc.st().pend}));
     const S=q.st&&q.st[q.si];ok(q.on&&q.res>=1&&S&&S.dd===q.d&&q.si>0&&q.st[q.si-1].t==='atcGate'&&!q.pend,`${id}: crossed the DRIVE TO gate, reloaded into ${q.d} and resumed at stage ${q.si}`,{d:q.d,si:q.si,t:S&&S.t});
     if(shots<3){shots++;await ev(()=>__mho.roamSim(30));await shot(`atc_${id}_arrive_${q.d}`)}continue}break}
   }
  const E=await ev(()=>({le:__m1.M1.lastEnd,st:__atc.st(),skips:(window.__m1log||{}).skips,ph:[...new Set((window.__m1log||{ph:[]}).ph)]}));
  const gates=st0?st0.filter(S=>S.t==='atcGate').length:0;times[id]=E.le&&+E.le.t.toFixed(0);
  ok(E.le&&E.le.ok&&E.le.mid===id&&E.st.step===step+1,`${id} (Ch${D.ch}${D.race?' rival race':''}) completed by bot · ${E.le&&E.le.t.toFixed(0)} s game time`,{why:E.le&&E.le.why,phases:E.ph.length,gates,cross});
  if(gates)ok(cross===gates,`${id}: every DRIVE TO gate in the mission was crossed (${gates})`);
  const dists=st0?[...new Set(st0.map(S=>S.dd))]:[];ok(gates?dists.length===gates+1:dists.length===1,`${id}: districts ${dists.join('→')}, ${gates?'routed through gates':'stays inside one district'}`);
  if(!(E.le&&E.le.ok))break;
  // results card off → queued reward scene (after each rival race) plays; skip it with the real SKIP button
  await ev(()=>{const e=document.querySelector('#chRes');if(e){e.hidden=true;e.classList.remove('qbtn')}});for(let i=0;i<5;i++)await ev(()=>__mho.roamSim(20));
  if(D.race){let cs=null;for(let i=0;i<20&&!cs;i++){cs=await ev(()=>__m1.cs());if(!cs){await ev(()=>__mho.roamSim(20));await sleep(150)}}
   ok(!!cs,`${id}: reward scene plays after the rival race`,cs);if(cs){await shot(`atc_reward_ch${D.ch}`);const bx=await ev(()=>{const r=document.querySelector('#m1Skip').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(bx[0],bx[1]);await sleep(200)}
   const rw=await ev(()=>__atc.st().rw);ok(rw[['ghost','magnet','cup'][D.ch-1]]===1,`Ch${D.ch} reward granted`,rw)}
 }
 const fin=await ev(()=>({st:__atc.st(),flag:JSON.parse(localStorage.getItem('mho_flags.ath@1')||localStorage.getItem('mho_flags@1')||'{}').DRAKOS}));
 if(START<12)ok(fin.st.step===12,'campaign complete: all 12 steps done',{step:fin.st.step,rw:fin.st.rw});
 ok(xfers>=3,'district transfers during missions (amphora A→B, metro B→A, Kifisias C→D)',xfers);
 ok(errs.length===0,'zero page/console errors',errs.slice(0,5));
 console.log('game seconds per mission',JSON.stringify(times));
 console.log(`tATC ${fail?'FAILED':'PASS'} · ${pass} pass / ${fail} fail · ${Math.round((Date.now()-T0)/1000)} s`);await b.close();process.exit(fail?1:0)})();
