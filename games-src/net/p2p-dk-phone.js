// Real WebRTC test for Doorkick Dungeon: host + N clients in separate Chromium contexts, local Nostr relay (port 17705).
// PW=$(npm root -g)/playwright node net/p2p-dk.js munch/doorkick.html [clients=1] [seats=3] [seconds=420] [scenario=plain|churn] [shotdir]
//  plain: play one full game; every page must agree on the end state.
//  churn: also a client leaves mid-game (the computer takes over), comes back with the same uid (gets the seat back),
//         and a client sends malformed and illegal actions (the host ignores them).
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],NCL=+(process.argv[3]||1),SEATS=+(process.argv[4]||3),SECS=+(process.argv[5]||420),SCEN=process.argv[6]||'plain',SHOTS=process.argv[7]||'';
const html=fs.readFileSync(file);const PORT=17705;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VIEW={width:390,height:844},PHONE={width:844,height:390};
(async()=>{const relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(500);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const P=[];
async function openPage(ctx,label,hash){const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(label+' pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+' console '+m.text())});
  await p.goto('https://gns.test/doorkick/'+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready,null,{timeout:60000});
  await p.evaluate(()=>{ANIM=0;AIDELAY=40;window.DKD_NETWIN=12000});return {p,errs,ctx,label}}
for(let i=0;i<=NCL;i++){const c=await b.newContext({viewport:i===2?PHONE:VIEW,isMobile:true,hasTouch:true});
  await c.addInitScript(()=>{window.NETROOM_RELAYS=['ws://127.0.0.1:17705'];window.NETROOM_ICE=[];try{localStorage.setItem('dkd_gfx','low');localStorage.setItem('dkd_tour1','1')}catch(e){}});
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  P.push(await openPage(c,i?'C'+i:'H'))}
const [H,...C]=P;const allErrs=()=>P.flatMap(x=>x.errs).filter(e=>!/Failed to load resource/.test(e));// the test blocks every outside request (the Google Fonts stylesheet)
console.log('host',await H.p.evaluate(()=>({avail:netAvail(),p2p:NET.p2p})));
await H.p.evaluate(n=>{UI.n=n;UI.lvl='normal';NET.myName='Hosty';netJoin('host',NetRoom.newCode())},SEATS);await sleep(400);const code=await H.p.evaluate(()=>NET.code);
// the first client joins through the invite link (#join-code), the others type the code
for(const [i,c] of C.entries()){if(i===0){await c.p.close();Object.assign(c,await openPage(c.ctx,c.label,'#join-'+code));
    const pre=await c.p.evaluate(()=>({mode:UI.mode,code:(document.getElementById('joincode')||{}).value||''}));console.log('invite link prefill',JSON.stringify(pre));
    await c.p.fill('#netname','Friend'+i);await c.p.click('[data-a="netjoin"]')}
  else await c.p.evaluate(([code,i])=>{NET.myName='Friend'+i;netJoin('client',code)},[code,i])}
let t0=Date.now();while(Date.now()-t0<40000){const n=await H.p.evaluate(()=>NET.peers.length);const cn=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.peers.length)));if(n>=NCL+1&&cn.every(x=>x>=NCL+1))break;await sleep(250)}
console.log('lobby after',Date.now()-t0,'ms',await H.p.evaluate(()=>NET.peers.map(p=>peerLabel(p))));await sleep(3500);
if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await H.p.screenshot({path:SHOTS+'/lobby-host-1366.png'});await C[0].p.screenshot({path:SHOTS+'/lobby-client-1366.png'});
  await C[0].p.setViewportSize(PHONE);await sleep(400);await C[0].p.screenshot({path:SHOTS+'/lobby-client-390.png'});await C[0].p.setViewportSize(VIEW)}
const lobbyTxt=await C[0].p.evaluate(()=>document.getElementById('dkNetBody').textContent);console.log('client lobby shows host options:',/Seats:/.test(lobbyTxt),/Hosty/.test(lobbyTxt));
// start by clicking the host's button
await H.p.click('#dkNet [data-a="netstart"]');await sleep(500);
const seatInfo=await H.p.evaluate(()=>G.pl.map(p=>({nm:p.nm,human:p.human})));console.log('seats',JSON.stringify(seatInfo));
// the random clicker: only this page's own DOM, only when this page's seat has a decision
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];if(!G||G.winner)return 0;const me=NET.mySeat;if(me<0)return 0;
  const cardPop=document.querySelector('#dkCard.on');if(cardPop){const bs=[...cardPop.querySelectorAll('[data-mv]')];if(bs.length&&Math.random()<.85){rnd(bs).click();return 1}cardPop.querySelector('[data-gx="close"]').click();return 0}
  if(document.querySelector('.gx-drawer.on')){GX.close();return 0}
  if(sideToAct()!==me||!P(me).human)return 0;
  const rec=document.querySelector('#prompt .btn.rec[data-mv]');const acts=[...document.querySelectorAll('#prompt [data-mv]:not(:disabled)')];const ask=document.querySelector('#prompt [data-a="askmenu"]');
  const cards=[...document.querySelectorAll('.mine [data-card].play, .mine .gchip.play')];
  if(rec&&Math.random()<.85){rec.click();return 1}
  if(cards.length&&Math.random()<.3){rnd(cards).click();return 1}
  if(ask&&Math.random()<.1){ask.click();return 1}
  if(acts.length){rnd(acts).click();return 1}return 0};
let clicks=0,remote=0,shot=false,left=null,back=null,badSent=false,peek=null;t0=Date.now();
const alive=()=>P.filter(x=>!x.closed);
while(Date.now()-t0<SECS*1000){const g=await H.p.evaluate(()=>G&&{w:G.winner,t:G.turn});if(!g||g.w)break;
  for(const [i,x] of alive().entries()){const k=await x.p.evaluate(tick).catch(e=>{x.errs.push(x.label+' tick '+e.message);return 0});clicks+=k;if(x!==H)remote+=k}
  // hidden information: a client sees only its own hand
  if(!peek&&g.t>=3){peek=await C[0].p.evaluate(()=>({mine:G.pl[NET.mySeat].hand.every(id=>id>=0),others:G.pl.filter(p=>p.i!==NET.mySeat).every(p=>p.hand.every(id=>id===-1)),deck:G.door.every(id=>id===-1),rng:G.rng,myCards:document.querySelectorAll('.mine .hand [data-card]').length,myHand:G.pl[NET.mySeat].hand.length,oppLabels:[...document.querySelectorAll('.opps .opp')].map(e=>e.getAttribute('aria-label').match(/(\d+) cards in hand/)[1]).join(','),oppState:G.pl.filter(p=>p.i!==NET.mySeat).map(p=>p.hand.length).join(',')}));
    const hostCounts=await H.p.evaluate(s=>G.pl.filter(p=>p.i!==s).map(p=>p.hand.length).join(','),await C[0].p.evaluate(()=>NET.mySeat));console.log('client 1 view',JSON.stringify(peek),'host hand counts',hostCounts)}
  if(SHOTS&&!shot&&g.t>=4){const fight=await C[0].p.evaluate(()=>!!G.cb);if(fight||g.t>=7){shot=true;await C[0].p.screenshot({path:SHOTS+'/client-game-1366.png'});await C[0].p.setViewportSize(PHONE);await sleep(500);await C[0].p.screenshot({path:SHOTS+'/client-game-390.png'});await C[0].p.setViewportSize(VIEW)}}
  if(SCEN==='churn'){const el=(Date.now()-t0)/1000;
    if(!badSent&&g.t>=3){badSent=true;const before=await H.p.evaluate(()=>({bad:NET.bad||0,ln:G.ln,rej:UI.rej||0}));
      await C[0].p.evaluate(()=>{const R=NET.room;[null,5,'x',{act:'kick'},{act:'hack'},{act:'play',card:'1;alert(1)'},{act:'sell',cards:'1,2,99999999'},{act:'pick',opt:999},{act:'give',card:-5,tgt:0},{act:'end'},{act:'fight'},{act:'opt',opt:'yes'},{act:'pass'},{act:'play',card:0,tgt:'m'}].forEach(d=>R.emit('act',d))});await sleep(1500);
      const after=await H.p.evaluate(()=>({bad:NET.bad||0,ln:G.ln,rej:UI.rej||0}));console.log('bad actions: host counted',after.bad-before.bad,'ignored of 14 sent; log lines added',after.ln-before.ln)}
    if(!left&&g.t>=6){const x=C[C.length-1];const seat=await x.p.evaluate(()=>NET.mySeat);const uid=await x.p.evaluate(()=>NET.uid);await x.p.close();x.closed=true;left={seat,uid,t:g.t,at:Date.now()};console.log('client',x.label,'closed its page at turn',g.t,'seat',seat)}
    if(left&&!left.seen){const s=await H.p.evaluate(s=>({human:G.pl[s].human,away:!!G.pl[s].away}),left.seat);if(s.away&&!s.human){left.seen=Date.now();console.log('host: computer took over seat',left.seat,'after',left.seen-left.at,'ms')}}
    if(left&&left.seen&&!back&&Date.now()-left.seen>8000){const x=C[C.length-1];const np=await openPage(x.ctx,x.label+'b');P.push(np);np.back=true;
      const uid2=await np.p.evaluate(()=>NET.uid);await np.p.evaluate(c=>{NET.myName='Friend again';netJoin('client',c)},code);back={t:Date.now(),sameUid:uid2===left.uid,page:np}}
    if(back&&!back.ok){const r=await back.page.p.evaluate(()=>({seat:NET.mySeat,g:!!G}));const h=await H.p.evaluate(s=>({human:G.pl[s].human,away:!!G.pl[s].away}),left.seat);
      if(!back.dbg&&Date.now()-back.t>15000){back.dbg=1;console.log('rejoin pending',JSON.stringify(await back.page.p.evaluate(()=>({on:NET.on,peers:NET.peers.map(p=>p.peer+':'+(p.presence&&p.presence.role)),host:NET.hostPeer,applied:NET.applied,err:NET.err}))),JSON.stringify(await H.p.evaluate(()=>NET.peers.map(p=>p.peer+':'+p.by))))}
      if(r.seat===left.seat&&h.human&&!h.away){back.ok=true;console.log('rejoined with same uid',back.sameUid,'got seat',r.seat,'back after',Date.now()-back.t,'ms')}}}
  await sleep(30)}
await sleep(3500);
const hs=await H.p.evaluate(()=>({w:G.winner,text:G.winText,t:G.turn,lv:G.pl.map(p=>p.lvl).join(','),humans:G.pl.filter(p=>p.human).length,rej:UI.rej||0,bad:NET.bad||0,stat:NET.stat,rejects:NET.rejects||[]}));
const cs=await Promise.all(alive().filter(x=>x!==H).map(x=>x.p.evaluate(()=>({seat:NET.mySeat,w:G&&G.winner,t:G&&G.turn,lv:G&&G.pl.map(p=>p.lvl).join(','),end:!!document.querySelector('#modal .end')}))));
const res={scen:SCEN,clients:NCL,seats:SEATS,host:hs,pages:cs,clicks,remote,agree:cs.every(c=>c.w===hs.w&&c.t===hs.t&&c.lv===hs.lv&&c.end),peek,left:left&&{seat:left.seat,turn:left.t,aiTook:!!left.seen},rejoin:back?{sameUid:back.sameUid,ok:!!back.ok}:null,secs:Math.round((Date.now()-t0)/1000),errors:allErrs().map(e=>e.slice(0,240))};
if(SHOTS){await C[0].p.screenshot({path:SHOTS+'/client-end-1366.png'}).catch(()=>{})}
console.log(JSON.stringify(res,null,1));console.log('host log:',await H.p.evaluate(()=>G.log.slice(0,25).map(l=>l.t).join('\n')));
await b.close();relay.kill();process.exit(0)})().catch(e=>{console.error('FAIL',e);process.exit(1)});
