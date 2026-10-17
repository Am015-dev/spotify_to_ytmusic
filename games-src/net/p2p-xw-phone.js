// Real WebRTC test for Nebula Aces: host + 1 client in separate Chromium contexts, local Nostr relay (port 17704).
// PW=$(npm root -g)/playwright node net/p2p-xw.js xw/nebula.html [games=3] [secondsPerGame=240]
// Game 1: a clean game (core duel). Game 2: Skirmish 60 (several ships per side) plus illegal and malformed actions from the client.
// Game 3: the client leaves mid-game (the computer takes over), rejoins with the same uid (gets its seat back), then leaves for good (the computer finishes).
// Clients act only through DOM clicks on their own page. Screenshots go to xw/onl/.
const {chromium}=require(process.env.PW);const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const file=process.argv[2],NG=+(process.argv[3]||3),SECS=+(process.argv[4]||240);const html=fs.readFileSync(file);const PORT=17704;
const OUT=path.join(path.dirname(file),'onl');fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
let B;const pages=[];
async function mkPage(tag,{uid,hash,vp}={}){const c=await B.newContext({viewport:vp||{width:390,height:844,isMobile:true,hasTouch:true},reducedMotion:'reduce'});// headless WebGL stalls CSS animations
  await c.addInitScript(([port,uid])=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];try{localStorage.setItem('na_gfx','low');localStorage.setItem('na_tour','1');localStorage.setItem('na_snd','0');localStorage.setItem('na_mus','0');if(uid)localStorage.setItem('gns-uid',uid)}catch(e){}},[PORT,uid||null]);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  const p=await c.newPage();const P={tag,p,c,errs:[],closed:false};p.on('pageerror',e=>P.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')P.errs.push(m.text())});
  await p.goto('https://gns.test/nebula/?phone='+(process.env.PHONE0?'0':'1')+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});await sleep(1200);
  await p.evaluate(()=>{ANIM=0;AIDELAY=60;
    // watch every state packet: an enemy dial that is still secret must never arrive as a number
    window.__leak=0;window.__hid=0;const o=applyNet;applyNet=function(x){try{if(x&&x.g){const me=x.g.players.findIndex(p=>p.peer===NET.peer);for(const s of x.g.ships){if(s.side===me)continue;if(typeof s.dial==='number'&&s.revR!==x.g.round)window.__leak++;if(s.dial==='set')window.__hid++}}}catch(e){}return o(x)}});
  pages.push(P);return P}
// one random click on this page's own buttons (only when it is this page's decision)
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];window.__bad=window.__bad||0;
  if(document.querySelector('#modal:not(.hidden)')&&/Pass the device/.test(document.getElementById('modal').textContent))window.__bad++;
  if(!G||G.winner||NET.inLobby)return 0;const pr=document.getElementById('prompt');if(!pr)return 0;
  const mine=humanTurn()||planSide()>=0;if(!mine&&pr.querySelector('[data-act],[data-dial],[data-a="lock"]'))window.__bad++;// someone else's decision must not be clickable
  if(isHost()&&G.phase==='plan'){// the host's own screen must never show the other side's dial
    if([...document.querySelectorAll('[data-dial][data-ship]')].some(b=>ship(b.dataset.ship).side!==NET.mySide))window.__bad++;
    if(G.ships.some(s=>s.side!==NET.mySide&&myPlanShip(s)))window.__bad++}
  if(isClient()){if(window.__lastA===NET.applied&&Date.now()-window.__lastT<2000)return 0}// wait for the host's answer before clicking again
  const q=s=>[...pr.querySelectorAll(s)].filter(b=>!b.disabled);const go=b=>{b.click();window.__lastA=NET.applied;window.__lastT=Date.now();return 1};
  const nx=q('[data-a="nextround"],[data-a="hold"]');if(nx.length)return go(nx[0]);
  const lock=q('[data-a="lock"]');if(lock.length)return go(lock[0]);
  const auto=q('[data-a="autodial"]'),dials=q('[data-dial]');if(dials.length){if(auto.length&&Math.random()<.5)return go(auto[0]);return go(rnd(dials))}
  const ap=q('[data-a="autoplace"]');if(ap.length&&Math.random()<.7)return go(ap[0]);
  const acts=q('[data-act]');if(acts.length)return go(rnd(acts));return 0};
const final=()=>G&&{w:G.winner,r:G.round,text:G.winText,ships:G.ships.map(s=>[s.id,s.alive,s.alive?s.hull-hullDmg(s):0,s.sh,Math.round(s.x),Math.round(s.y)].join(':')).join(' '),players:G.players.map(p=>(p.human?'H':'C')+(p.name||''))};
// a DOM click on the page's own button (Playwright's actionability wait starves on rAF under a busy SwiftShader WebGL loop)
async function clk(P,sel){const ok=await P.p.evaluate(s=>{const b=document.querySelector(s);if(!b||b.disabled)return false;b.click();return true},sel);if(!ok)throw new Error('no button '+sel+' on '+P.tag)}
async function shot(P,name,vp){if(vp)await P.p.setViewportSize(vp);await sleep(700);await P.p.screenshot({path:path.join(OUT,name+'.png')});log('shot',name)}
async function waitFor(P,fn,ms,arg){const t0=Date.now();while(Date.now()-t0<ms){if(await P.p.evaluate(fn,arg).catch(()=>false))return true;await sleep(200)}return false}
(async()=>{const relay=spawn('node',['/home/user/spotify_to_ytmusic/games-src/net/relay.js',''+PORT]);await sleep(600);
// FLAT=1: no WebGL (2D map). Under software WebGL a busy page answers WebRTC offers too late for a peer that joins mid-game, so the rejoin game runs flat
B=await chromium.launch({args:process.env.FLAT?['--no-proxy-server','--disable-3d-apis']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-proxy-server']});
const H=await mkPage('host');let C=await mkPage('client');
const av=await H.p.evaluate(()=>({avail:netAvail(),tr:typeof Trystero}));log('available',JSON.stringify(av));
// host: name + Host through the start screen
await H.p.fill('#netname','Hosty');await clk(H,'[data-a="nethost"]');await waitFor(H,()=>NET.on&&NET.code,10000);const code=await H.p.evaluate(()=>NET.code);log('code',code);
const lookTxt=await H.p.evaluate(()=>document.querySelector('.lobby .netst').textContent);
await C.p.fill('#netname','Friendo');await C.p.fill('#joincode',code);await clk(C,'[data-a="netjoin"]');
let t0=Date.now();await waitFor(H,()=>NET.peers.length>=2&&document.querySelector('.lobby'),30000);log('lobby formed in',Date.now()-t0,'ms; before:',lookTxt.trim());
await waitFor(C,()=>NET.info&&document.querySelector('.lobby'),15000);
await shot(H,'lobby-host-1366');await shot(C,'lobby-client-1366');await shot(C,'lobby-client-390',{width:390,height:844});await C.p.setViewportSize({width:1366,height:768});
// lobby closes with Esc / tap outside and reopens
const esc=await C.p.evaluate(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await new Promise(r=>setTimeout(r,100));const a=!document.querySelector('.lobby');document.querySelector('[data-a="netopen"]').click();await new Promise(r=>setTimeout(r,100));const b=!!document.querySelector('.lobby');document.getElementById('modal').click();await new Promise(r=>setTimeout(r,100));const c=!document.querySelector('.lobby');document.querySelector('[data-a="netopen"]').click();return {escCloses:a,reopens:b,outsideCloses:c}});log('lobby popup',JSON.stringify(esc));
const results=[];let remoteClicks=0;
for(let g=+(process.env.G0||1);g<=NG;g++){
  await H.p.evaluate(g=>{if(g===2)UI.size='sk60';else UI.size='core';render()},g);await sleep(400);
  await clk(H,'[data-a="netstart"]');
  const ok=await waitFor(C,()=>G&&!NET.inLobby&&NET.mySide===1,20000);log(`game ${g} started; client seated:`,ok);
  let illegalDone=g!==2,leaveStage=g===3?0:9,clicks=0,rem=0,shotDone=g!==1,illegal=null,leaveInfo={};t0=Date.now();
  while(Date.now()-t0<SECS*1000){
    const hs=await H.p.evaluate(()=>G&&{w:G.winner,r:G.round,ph:G.phase,d0:planDone(0),d1:planDone(1),h1:G.players[1].human});if(!hs||hs.w)break;
    // game 2: while the host still plans and the client has locked, the client sends junk
    if(!illegalDone&&hs.r>=2&&hs.ph==='plan'){if(hs.d1&&!hs.d0){
        const before=await H.p.evaluate(()=>({sig:JSON.stringify([G.round,G.phase,G.ships.map(s=>[s.id,s.dial,s.x,s.y,s.focus])]),rej:NET.rej,acc:NET.acc}));
        const sent=await C.p.evaluate(()=>{const H=NET.hostPeer;const s=d=>NET.room.sendTo(H,'act',d);const my=G.ships.filter(x=>x.side===NET.mySide).map(x=>x.id),foe=G.ships.filter(x=>x.side!==NET.mySide).map(x=>x.id);
          const junk=[null,'x',42,[1,2],{act:{}},{act:'x'.repeat(5000)},{act:'dials',dials:{[foe[0]]:0}},{act:'dials',dials:{[my[0]]:999}},{act:'dials',dials:[1,2]},{act:'dials',dials:{__proto__:1}},
            {act:'fire',w:'P',t:foe[0]},{act:'action',a2:'F'},{act:'amod',k:'focus'},{act:'dmod',k:'done'},{act:'ask',k:'r00'},{act:'autoplace'},{act:'ask',k:{toString:1}},{act:'eval',k:'alert(1)'}];junk.forEach(s);return junk.length});
        await sleep(2000);const after=await H.p.evaluate(()=>({sig:JSON.stringify([G.round,G.phase,G.ships.map(s=>[s.id,s.dial,s.x,s.y,s.focus])]),rej:NET.rej,acc:NET.acc}));
        illegal={sent,rejected:after.rej-before.rej,accepted:after.acc-before.acc,stateUnchanged:before.sig===after.sig};log('illegal test',JSON.stringify(illegal));illegalDone=true}
      else{const k=await C.p.evaluate(tick).catch(e=>{C.errs.push('tick '+e.message);return 0});clicks+=k;rem+=k;await sleep(60);continue}}
    // game 3: leave, rejoin with the same uid, leave again
    if(leaveStage===0&&hs.r>=2){const uid=await C.p.evaluate(()=>NET.uid);leaveInfo.uid=uid;await C.c.close();C.closed=true;leaveStage=1;leaveInfo.leftAt=hs.r;log('client tab closed at round',hs.r);
      const took=await waitFor(H,()=>G.players[1].human===false&&G.players[1].away,20000);leaveInfo.aiTookOver=took;leaveInfo.rAtLeave=hs.r}
    if(leaveStage===1&&hs.r>=leaveInfo.leftAt+2){C=await mkPage('rejoin',{uid:leaveInfo.uid,hash:'#join-'+code});const pre=await C.p.evaluate(()=>({code:(document.getElementById('joincode')||{}).value,hl:!!document.querySelector('.online.hl')}));leaveInfo.linkPrefill=pre;
      const diag=await C.p.evaluate(()=>({ready:NET.ready,lobby:!!NET.lobby,avail:typeof NetRoom!=='undefined'&&NetRoom.available(),tr:typeof Trystero,info:UI.info,on:NET.on,box:(document.querySelector('.online')||{}).outerHTML||(document.getElementById('modal').innerHTML.slice(0,300))}));log('rejoin page',JSON.stringify(diag).slice(0,700));
      await C.p.evaluate(()=>{const i=document.getElementById('netname');if(i){i.value='Friendo';i.dispatchEvent(new Event('input',{bubbles:true}))}});try{await clk(C,'[data-a="netjoin"]')}catch(e){log('join click failed',await C.p.evaluate(()=>[NET.on,NET.inLobby,UI.info,document.getElementById('modal').className,document.getElementById('modal').innerHTML.slice(0,600)]));throw e}const tj=Date.now();const back=await waitFor(C,()=>G&&NET.mySide===1&&!NET.inLobby,120000);leaveInfo.rejoinMs=Date.now()-tj;leaveInfo.roomRetries=await C.p.evaluate(()=>NET.retries||0);if(!back)log('rejoin diag',JSON.stringify(await C.p.evaluate(()=>({on:NET.on,peers:NET.peers.length,hp:NET.hostPeer,applied:NET.applied,inLobby:NET.inLobby,g:!!G}))),JSON.stringify(await H.p.evaluate(()=>({peers:NET.peers.map(p=>[p.peer,p.by]),pl:G.players}))));
      leaveInfo.seatBack=back&&await H.p.evaluate(()=>G.players[1].human&&!G.players[1].away);leaveInfo.backAt=await H.p.evaluate(()=>G.round);leaveStage=2;log('rejoined',JSON.stringify(leaveInfo))}
    if(leaveStage===2&&hs.r>=leaveInfo.backAt+2){await sleep(500);const cl=await C.p.evaluate(()=>({mine:NET.mySide,humanNow:!!G&&G.players[1].human}));leaveInfo.afterRejoin=cl;await C.c.close();C.closed=true;leaveStage=3;log('client left for good at round',hs.r)}
    for(const P of [H,C]){if(P.closed)continue;const k=await P.p.evaluate(tick).catch(e=>{P.errs.push('tick '+e.message);return 0});clicks+=k;if(P!==H)rem+=k}
    if(!shotDone&&hs.r>=2&&hs.ph!=='plan'&&!C.closed){shotDone=true;await shot(C,'client-game-1366');await shot(C,'client-game-390',{width:390,height:844});await shot(H,'host-game-1366');await C.p.setViewportSize({width:1366,height:768})}
    if(g===1&&hs.r===2&&hs.ph==='plan'&&!H.planShot&&!hs.d1){H.planShot=1;await shot(C,'client-plan-390',{width:390,height:844});await C.p.setViewportSize({width:1366,height:768})}
    await sleep(60)}
  await sleep(3800);// the heartbeat carries the final state
  const hf=await H.p.evaluate(final);const cf=C.closed?null:await C.p.evaluate(final);
  const net=await H.p.evaluate(()=>({acc:NET.acc,rej:NET.rej,why:NET.why.slice()}));
  const leaks=C.closed?null:await C.p.evaluate(()=>({leak:window.__leak,hidden:window.__hid,bad:window.__bad||0}));const hbad=await H.p.evaluate(()=>window.__bad||0);
  const r={game:g,secs:Math.round((Date.now()-t0)/1000),winner:hf.w,rounds:hf.r,text:hf.text,agree:cf?JSON.stringify(cf)===JSON.stringify(hf):'client closed',clicks,remoteClicks:rem,hostAccepted:net.acc,hostRejected:net.rej,rejectReasons:net.why,clientLeaks:leaks,hostUiViolations:hbad,illegal,leave:g===3?leaveInfo:undefined,players:hf.players};
  remoteClicks+=rem;results.push(r);log(JSON.stringify(r));
  if(!hf.w)break;
  if(g<NG){if(C.closed){C=await mkPage('client'+g);await C.p.fill('#netname','Friendo');await C.p.fill('#joincode',code);await clk(C,'[data-a="netjoin"]')}
    await clk(H,'[data-a="netlobby"]');await waitFor(C,()=>NET.inLobby&&document.querySelector('.lobby'),20000);await waitFor(H,()=>NET.peers.length>=2,20000)}}
// ERR_FAILED lines are the test route aborting outside requests (web fonts), not page errors
const errors=pages.flatMap(x=>x.errs.filter(e=>!/net::ERR_FAILED/.test(e)&&!(process.env.FLAT&&/WebGL/.test(e))).map(e=>x.tag+': '+e.slice(0,200)));const aborted=pages.reduce((a,x)=>a+x.errs.filter(e=>/net::ERR_FAILED/.test(e)).length,0);
console.log(JSON.stringify({results,remoteClicks,errors,abortedOutsideRequests:aborted},null,1));
await B.close();relay.kill();process.exit(0)})();
