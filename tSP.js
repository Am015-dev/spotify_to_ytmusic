// tSP: 2-player split-screen. Real keyboard input (page.keyboard) + 1/60 s sim steps; gamepads mocked via navigator.getGamepads.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
const U='http://127.0.0.1:8766/local_dbg.html';let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
async function page(b,vp){const p=await (await b.newContext({viewport:vp})).newPage();p.setDefaultTimeout(900000);p.errs=[];p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,160))});
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1','{"tut":1,"otg":{}}')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');return p}
const D=p=>p.evaluate(()=>[__SP.pl.dist,__SP.p2.dist,__SP.pl.x,__SP.p2.x]);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // 0 · phone: the entry is hidden below 700 px
 {const p=await page(b,{width:390,height:844});const r=await p.evaluate(()=>{__mho.homeHide();__mho.setOpt('tab','quick');const e=document.querySelector('#SP_btn');return{exists:!!e,display:e&&getComputedStyle(e).display}});ok(r.exists&&r.display==='none','phone 390 px: 2 PLAYERS hidden',r);await p.context().close()}
 const p=await page(b,{width:1280,height:720});await F.on(p);
 // 1 · menu entry + setup screen with key cards
 {await p.evaluate(()=>{__mho.homeHide();__mho.setOpt('tab','quick')});const v=await p.evaluate(()=>{const e=document.querySelector('#SP_btn');return!!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>20});ok(v,'desktop: 2 PLAYERS entry in Quick Play');
  await p.click('#SP_btn');const s=await p.evaluate(()=>{const t=document.querySelector('#SP_set').innerText;return{vis:!document.querySelector('#SP_set').hidden,cards:document.querySelectorAll('.SP_kc').length,keys:['W','Space','L-Shift','Q','↑','Enter','R-Shift',','].every(k=>t.includes(k)),modes:t.includes('RACE')&&t.includes('SMASH BATTLE'),trk:document.querySelectorAll('#SP_trk option').length}});
  ok(s.vis&&s.cards===2&&s.keys&&s.modes&&s.trk>=6,'setup screen: 2 key cards, both modes, circuit list',s);await F.shot(p,'shots/sp_setup.jpg',{type:'jpeg',quality:70});await p.click('#SP_back')}
 // 2 · race, head to head: both drive with their own keys at the same time, neither affects the other
 {await p.evaluate(()=>__SP.start({mode:'race',ai:false,trk:'grand'}));await p.evaluate(()=>__mho.sim(1));const n=await p.evaluate(()=>({ships:__mho.ships?0:0,n:__SP.p2&&__SP.S.on,cls:document.body.classList.contains('SP_on')}));ok(n.n&&n.cls,'race starts in split mode with P2',n);
  const a0=await D(p);await p.keyboard.down('KeyW');await p.evaluate(()=>__mho.sim(300));const a1=await D(p);await p.keyboard.up('KeyW');
  ok(a1[0]-a0[0]>40&&Math.abs(a1[1]-a0[1])<1,'W only: P1 moves, P2 stays',{p1:Math.round(a1[0]-a0[0]),p2:+(a1[1]-a0[1]).toFixed(2)});
  await p.evaluate(()=>{__SP.pl.v=0});const b0=await D(p);await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.sim(300));const b1=await D(p);await p.keyboard.up('ArrowUp');
  ok(b1[1]-b0[1]>40&&b1[0]-b0[0]<12,'↑ only: P2 moves, P1 just coasts out',{p1:Math.round(b1[0]-b0[0]),p2:Math.round(b1[1]-b0[1])});
  await p.keyboard.down('KeyW');await p.keyboard.down('ArrowUp');await p.keyboard.down('ArrowLeft');const c=await p.evaluate(()=>[__SP.ctl(1),__SP.ctl(2)]);const c0=await D(p);await p.evaluate(()=>__mho.sim(240));const c1=await D(p);await p.keyboard.up('ArrowLeft');
  ok(c[0].thr===1&&c[0].steer===0&&c[1].thr===1&&c[1].steer===-1&&c1[0]-c0[0]>30&&c1[1]-c0[1]>30,'W + ↑ + ← together: both drive, only P2 steers',{p1:c[0],p2:c[1],d:[Math.round(c1[0]-c0[0]),Math.round(c1[1]-c0[1])]});
  await p.keyboard.down('ShiftRight');const sh=await p.evaluate(()=>[__SP.ctl(1).boost,__SP.ctl(2).boost]);await p.keyboard.up('ShiftRight');await p.keyboard.down('ShiftLeft');const sh2=await p.evaluate(()=>[__SP.ctl(1).boost,__SP.ctl(2).boost]);await p.keyboard.up('ShiftLeft');
  ok(sh[0]===0&&sh[1]===1&&sh2[0]===1&&sh2[1]===0,'boost keys: R-Shift = P2 only, L-Shift = P1 only',{rs:sh,ls:sh2});
  await p.keyboard.up('KeyW');await p.keyboard.up('ArrowUp');
  // perf: draw calls of one frame, split vs single (same scene)
  await F.off(p);const m=await p.evaluate(()=>__SP.measure());ok(m.k<=1.9,'perf: split draw calls ≤ 1.9× single',m);
  const r=await p.evaluate(()=>{const r=__SP.S;return{dres:__dbg&&1,comp:[__dbg.composer.renderTarget1.width,__dbg.renderer.domElement.width]}});console.log('INFO render targets (per view, canvas)',JSON.stringify(r.comp));
  await p.evaluate(()=>{__SP.pl.v=60;__SP.p2.v=62;__mho.sim(240)});await p.keyboard.down('KeyW');await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.sim(60));await F.shot(p,'shots/sp_race.jpg',{type:'jpeg',quality:72});await F.on(p);
  await p.keyboard.up('KeyW');await p.keyboard.up('ArrowUp')}
 // 3 · gamepad (mocked): 1 pad -> P2, 2 pads -> P1 + P2
 {await p.evaluate(()=>{const pad=(thr,ax)=>({connected:true,axes:[ax,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===7&&thr>0,value:i===7?thr:0}))});window.__pads=[pad(1,-.8)];navigator.getGamepads=()=>window.__pads;__SP.pl.v=0;__SP.p2.v=0;window.__pad=pad});
  const g0=await D(p);await p.evaluate(()=>__mho.sim(300));const g1=await D(p);const cc=await p.evaluate(()=>[__SP.ctl(1),__SP.ctl(2)]);
  ok(g1[1]-g0[1]>25&&g1[0]-g0[0]<5&&cc[1].steer<-.5&&cc[0].thr===0,'1 gamepad: RT + stick drive P2 only',{p1:Math.round(g1[0]-g0[0]),p2:Math.round(g1[1]-g0[1]),steer2:+cc[1].steer.toFixed(2)});
  await p.evaluate(()=>{window.__pads=[__pad(1,0),__pad(0,0)];__SP.pl.v=0;__SP.p2.v=0});const h0=await D(p);await p.evaluate(()=>__mho.sim(300));const h1=await D(p);const hc=await p.evaluate(()=>[__SP.ctl(1).thr,__SP.ctl(2).thr,__SP.ctl(2).steer]);
  ok(h1[0]-h0[0]>30&&hc[0]===1&&hc[1]===0&&hc[2]===0&&h1[1]-h0[1]<15,'2 gamepads: pad 1 drives P1, idle pad 2 gives P2 no input (P2 only nudged by contact)',{p1:Math.round(h1[0]-h0[0]),p2:Math.round(h1[1]-h0[1]),thr:hc});await p.evaluate(()=>{window.__pads=[]})}
 // 4 · full race with AI fill: both finish and are placed, results for both, rematch
 {await p.evaluate(()=>__SP.start({mode:'race',ai:true,trk:'grand'}));await p.keyboard.down('KeyW');await p.keyboard.down('ArrowUp');
  const r=await p.evaluate(()=>{const M=__mho;let i=0;for(;i<60*60*12;i+=60){M.sim(60);if(__SP.pl.finished&&__SP.p2.finished)break}return{t:+(i/60).toFixed(0),n:M.ships?0:0,f:[__SP.pl.finished,__SP.p2.finished],pl:[__SP.pl.place,__SP.p2.place],laps:[__SP.pl.laps.length,__SP.p2.laps.length]}});
  await p.keyboard.up('KeyW');await p.keyboard.up('ArrowUp');ok(r.f[0]&&r.f[1]&&r.pl[0]!==r.pl[1]&&r.pl[0]>=1&&r.pl[1]>=1,'full race (AI fill): both players finish with a place',r);
  await p.waitForFunction(()=>!document.querySelector('#SP_res').hidden,null,{timeout:120000,polling:200});const rs=await p.evaluate(()=>({t:document.querySelector('#SP_rt').textContent,cards:document.querySelectorAll('.SP_card').length,txt:document.querySelector('#SP_rc').innerText.replace(/\n/g,' ').slice(0,160),st:__mho.state}));
  ok(rs.cards===2&&/WINS|DRAW/.test(rs.t)&&rs.st==='results','results screen for both players',rs);await F.shot(p,'shots/sp_race_results.jpg',{type:'jpeg',quality:70});
  await p.click('#SP_again');const re=await p.evaluate(()=>({st:__mho.state,p2:!!__SP.p2&&!__SP.p2.finished,res:document.querySelector('#SP_res').hidden}));ok(re.st==='countdown'&&re.p2&&re.res,'rematch restarts the split race',re)}
 // 5 · Smash Battle in Frankfurt free roam
 {await p.evaluate(()=>__SP.menu());await p.waitForFunction(()=>__mho.state==='menu');await p.evaluate(()=>__SP.start({mode:'battle'}));await p.waitForFunction(()=>__mho.state==='roam'&&__SP.bt,null,{timeout:600000,polling:500});await F.on(p);
  const P=()=>p.evaluate(()=>[__mho.RO.x,__mho.RO.z,__SP.bt.r2.x,__SP.bt.r2.z]);const mv=(a,b,i)=>Math.hypot(b[i]-a[i],b[i+1]-a[i+1]);
  await p.evaluate(()=>{__mho.roamSim(30)});const q0=await P();await p.keyboard.down('KeyW');await p.evaluate(()=>__mho.roamSim(120));const q1=await P();await p.keyboard.up('KeyW');
  ok(mv(q0,q1,0)>15&&mv(q0,q1,2)<1,'battle: W moves P1 only',{p1:Math.round(mv(q0,q1,0)),p2:+mv(q0,q1,2).toFixed(2)});
  await p.evaluate(()=>{__mho.RO.v=0});const w0=await P();await p.keyboard.down('ArrowUp');await p.evaluate(()=>__mho.roamSim(120));const w1=await P();await p.keyboard.up('ArrowUp');
  ok(mv(w0,w1,2)>15&&mv(w0,w1,0)<3,'battle: ↑ moves P2 only',{p1:+mv(w0,w1,0).toFixed(1),p2:Math.round(mv(w0,w1,2))});
  // scores per player: P2 drives into a prop and a traffic car, P1 into another prop, P1 boost-rams P2
  const sc=await p.evaluate(()=>{const H=__SP.hub(),B=__SP.bt,M=__mho,RO=M.RO,res={};const snap=()=>JSON.stringify(B.sc);
    const props=H.props.filter(q=>q.alive&&Math.abs(q.y-M.gnd(q.x,q.z,q.y+2))<2).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z));const pa=props[0],pb=props.find(q=>Math.hypot(q.x-pa.x,q.z-pa.z)>60);
    const s0=snap();Object.assign(B.r2,{x:pa.x-1,z:pa.z,y:pa.y,v:15,vy:0,h:Math.PI/2,vh:Math.PI/2});M.roamSim(4);res.p2prop=[s0,snap()];
    const s1=snap();M.warp(pb.x-1.5,pb.z,Math.PI/2);RO.v=15;M.roamSim(4);res.p1prop=[s1,snap()];
    const car=H.cars.find(c=>!(c.dead>0)&&c.x!=null);const s2=snap();Object.assign(B.r2,{x:car.x,z:car.z,y:car.y||0,v:25,vy:0});M.roamSim(1);res.p2car=[s2,snap()];
    M.roamSim(100);const s3=snap();Object.assign(B.r2,{x:RO.x+3,z:RO.z,y:RO.y,v:0,vy:0});RO.v=45;__SP.pl.nitro=true;RO.turbo=1;B.tdCd=0;M.roamSim(1);res.td=[s3,snap(),__SP.S.st2];return res});
  const J=s=>JSON.parse(s);const d=(k,i,f)=>J(sc[k][1])[i][f]-J(sc[k][0])[i][f];
  ok(d('p2prop',1,'pr')>=1&&d('p2prop',0,'pr')===0,'battle: P2 smashing a prop scores for P2 only',[sc.p2prop[0],sc.p2prop[1]]);
  ok(d('p1prop',0,'pr')>=1&&d('p1prop',1,'pr')===0,'battle: P1 smashing a prop scores for P1 only',[sc.p1prop[0],sc.p1prop[1]]);
  ok(d('p2car',1,'tr')===1&&d('p2car',0,'tr')===0,'battle: P2 wrecking a traffic car scores for P2 only',[sc.p2car[0],sc.p2car[1]]);
  ok(d('td',0,'td')===1&&d('td',1,'td')===0&&sc.td[2]>0,'battle: P1 boost-ram on P2 = P1 takedown, P2 spins out',[sc.td[0],sc.td[1]]);
  const hud=await p.evaluate(()=>[...document.querySelectorAll('.SP_v .a')].map(e=>e.textContent));console.log('INFO battle hud',JSON.stringify(hud));
  await F.off(p);const m=await p.evaluate(()=>__SP.measure());console.log('INFO battle draw calls',JSON.stringify(m));
  await p.evaluate(()=>{__mho.roamSim(60)});await F.shot(p,'shots/sp_battle.jpg',{type:'jpeg',quality:72});await F.on(p);
  await p.evaluate(()=>__mho.roamSim(60*180));await p.waitForFunction(()=>!document.querySelector('#SP_res').hidden,null,{timeout:60000,polling:200});
  const br=await p.evaluate(()=>({t:document.querySelector('#SP_rt').textContent,sub:document.querySelector('#SP_rs').textContent,timer:__SP.bt.t,cards:document.querySelectorAll('.SP_card').length}));ok(br.timer===0&&br.cards===2&&/WINS|DRAW/.test(br.t),'battle: 3:00 timer ends in results for both',br);
  await F.shot(p,'shots/sp_battle_results.jpg',{type:'jpeg',quality:70});
  await p.click('#SP_again');const rb=await p.evaluate(()=>({t:__SP.bt.t,sc:JSON.stringify(__SP.bt.sc),fr:__mho.RO.frozen}));ok(rb.t>179.5&&rb.sc==='[{"pr":0,"tr":0,"td":0},{"pr":0,"tr":0,"td":0}]'&&!rb.fr,'battle rematch resets timer + scores',rb);
  await p.evaluate(()=>__SP.menu());await p.waitForFunction(()=>__mho.state==='menu');}
 // 6 · back to single player: nothing of split-screen left
 {const r=await p.evaluate(()=>{const M=__mho;M.homeHide();M.setOpt('tab','quick');M.setOpt('traffic',false);M.startRace();M.sim(1);const d0=M.pl.dist;M.K.ArrowUp=true;M.sim(600);M.K.ArrowUp=false;return{on:__SP.S.on,cls:document.body.className,p2:M.ships?0:0,hasP2:!!__SP.p2,d:Math.round(M.pl.dist-d0),hud:!document.querySelector('#hud').hidden,sph:document.querySelector('#SP_h').hidden}});
  ok(!r.on&&!/SP_/.test(r.cls)&&!r.hasP2&&r.d>100&&r.hud&&r.sph,'after MENU: single-player race is plain (arrows drive P1, stock HUD)',r)}
 ok(!p.errs.length,'no page / console errors',p.errs.slice(0,5));
 console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();
