// Real WebRTC test for The Thornbound Throne: host + clients in separate Chromium contexts, local Nostr relay (port 17712; the phone test uses 17713).
// PW=$(npm root -g)/playwright node net/p2p-tb.js thornbound/game/thornbound.html MODE [games=1] [secondsPerGame=240]
//  MODE full    host + 1 client + computers, complete games (3 players), pages must agree on the final state
//  MODE full3   host + 2 clients (+1 computer for 4 players when ONECOMP=1), complete games
//  MODE illegal host + 1 client; the client sends malformed / out-of-turn / illegal messages (must all be ignored), then the game is finished
//  MODE leave   host + 1 client: the client leaves mid-game (the computer takes over), rejoins with the same uid and #join-CODE (gets its seat back), leaves for good, the game finishes
//  MODE ui      lobby checks: link, Esc / tap outside / X close, Copy fallback, start-screen rows, host leaves -> "The host left"
// Clients act only through DOM clicks on their own page. Every state packet the host sends is checked against the host's real G (no rival hand, deck,
// face-down card, unrevealed bid, no seed / rng / Kingdom deck order); every page checks its own DOM (no card of another seat drawn face up,
// no button for somebody else's decision). Screenshots go to thornbound/game/onl/ (or onl-ph/ for the phone test).
const {chromium}=require(process.env.PW);const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const file=process.argv[2],MODE=process.argv[3]||'full',NG=+(process.argv[4]||1),SECS=+(process.argv[5]||240);const html=fs.readFileSync(file);
const PHONE=!!process.env.PHONE,PORT=PHONE?17713:17712;
const OUT=path.join(path.dirname(file),PHONE?'onl-ph':'onl');fs.mkdirSync(OUT,{recursive:true});
const VP=PHONE?{width:390,height:844,isMobile:true,hasTouch:true}:{width:1366,height:768};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
let B;const pages=[];
async function mkPage(tag,{uid,hash,vp}={}){const c=await B.newContext({viewport:vp||VP,reducedMotion:'reduce'});
  await c.addInitScript(([port,uid])=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];try{localStorage.setItem('tb_gfx','low');localStorage.setItem('tb_snd','0');localStorage.setItem('tb_mus','0');if(uid)localStorage.setItem('gns-uid',uid)}catch(e){}},[PORT,uid||null]);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  const p=await c.newPage();const P={tag,p,c,errs:[],closed:false};p.on('pageerror',e=>P.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')P.errs.push(m.text())});
  await p.goto('https://gns.test/thornbound/'+(PHONE?'?phone=1':'')+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});await sleep(1500);
  await p.evaluate(()=>{ANIM=0;AIDELAY=0;UI.speed=40;
    window.__sent=0;window.__leak=0;window.__leakWhat=[];window.__simul=0;window.__bad=0;window.__badWhat=[];window.__rxLeak=0;window.__rx=0;
    const own=id=>(id/100)|0;
    // host side: every packet it sends is compared with the host's real G
    const o=sendPacked;sendPacked=function(room,target,js,seq){try{if(target&&G&&UI.started){const seat=NET.seatPeer.indexOf(target),p=JSON.parse(js);if(!p.lobby&&p.g){const g=p.g,why=[];window.__sent++;
        if(g.seed!==0)why.push('seed');if('rng' in g)why.push('rng');if(g.stats&&Object.keys(g.stats).length)why.push('stats');if(g.ag&&g.ag.length)why.push('agenda');if(g.kdeck.some(x=>x))why.push('kdeck order');if(/"rng"|"seed":[1-9]/.test(js))why.push('rng/stats/seed text');
        g.pl.forEach((q,i)=>{if(i===seat)return;if(q.hand.some(id=>id>=0))why.push('rival hand '+i);if(q.deck.some(id=>id>=0))why.push('rival deck '+i);if(q.hand.length!==G.pl[i].hand.length)why.push('hand count');if(q.deck.length!==G.pl[i].deck.length)why.push('deck count');if(q.bid!=null&&q.bid>=0&&!G.bidRev)why.push('unrevealed bid '+i)});
        g.reg.forEach(R=>R.down.forEach(id=>{if(id>=0&&own(id)!==seat&&!(G.peek[seat]||[]).includes(id))why.push('rival face-down card')}));
        if(g.q){if(Object.keys(g.q.got||{}).length)why.push('answers collected');for(const s in (g.q.o||{}))if(+s!==seat)why.push('rival options')}
        if(seat<0&&g.pl.some(q=>q.hand.some(id=>id>=0)))why.push('spectator sees a hand');
        if(G.q&&G.q.simul&&G.q.seats.length<G.np)window.__simul++;
        // the secret choices of seats that already answered a simultaneous question are not in the copy of the others
        if(G.q&&G.q.simul&&G.q.kind==='bid'&&!G.bidRev)G.pl.forEach((q,i)=>{if(i!==seat&&q.bid!=null&&g.pl[i].bid!=null&&g.pl[i].bid>=0)why.push('bid of seat '+i)});
        if(why.length){window.__leak+=why.length;if(window.__leakWhat.length<8)window.__leakWhat.push(why.join(',')+' phase '+G.phase+'/'+G.step)}}}}catch(e){window.__leakWhat.push('check failed '+e.message)}
      return o.apply(this,arguments)};
    // client side: whatever arrives is checked once more
    const ap=applyNet;applyNet=function(x){try{window.__rx++;const g=x&&x.g;if(g){const me=NET.mySeat;g.pl.forEach((q,i)=>{if(i===(x.seat))return;if(q.hand.some(id=>id>=0)||q.deck.some(id=>id>=0))window.__rxLeak++});if(g.seed||g.rng||(g.stats&&Object.keys(g.stats).length))window.__rxLeak++}}catch(e){}return ap(x)};
  });
  pages.push(P);return P}
// one random click on this page's own buttons (only when it is this page's decision)
const tick=()=>{const d=document,rnd=a=>a[Math.floor(Math.random()*a.length)];
  if(!G||!UI.started||G.over||!NET.on)return 0;const me=NET.mySeat;
  for(const el of d.querySelectorAll('[data-owner][data-up="1"]'))if(+el.getAttribute('data-owner')!==me){window.__bad++;if(window.__badWhat.length<5)window.__badWhat.push('face-up card of seat '+el.getAttribute('data-owner')+' on seat '+me)}
  if(UI.card&&UI.card.kind==='pass'){window.__bad++;window.__badWhat.push('pass screen')}
  if(UI.card&&UI.card.kind!=='over'){const b=d.querySelector('#pc [data-a=evok],#pc [data-a=tipok]');if(b){b.click();return 0}}
  const asked=!!(G.q&&G.q.seats.includes(me)&&!G.pl[me].ai);
  const mvb=[...d.querySelectorAll('#main [data-a=mv]')].filter(b=>!b.disabled);
  if(!asked&&mvb.length){window.__bad++;if(window.__badWhat.length<5)window.__badWhat.push('clickable move while seat '+me+' is not asked: '+(G.q&&G.q.kind))}
  if(!asked)return 0;
  if(UI.card&&UI.card.kind==='over')return 0;
  if(isClient()&&NET.pend&&Date.now()-NET.pendT<2500)return 0;
  const k=G.q.kind;const click=el=>{el.click()};
  if(['bid','place','tie'].includes(k)&&Math.random()<.7){const hc=[...d.querySelectorAll('#handw .hc')];if(hc.length){click(rnd(hc));const mv=[...d.querySelectorAll('#ppop [data-a=mv]')];if(mv.length){click(rnd(mv));return 1}return 0}}
  if(k==='herald'){const lb=rnd([...d.querySelectorAll('#main [data-a=loc]')]);if(lb){click(lb);const pm=d.querySelector('#ppop [data-a=mv]');if(pm){click(pm);return 1}}return 0}
  if(mvb.length){const pri=mvb.filter(x=>x.classList.contains('pri'));click(Math.random()<.5&&pri.length?pri[0]:rnd(mvb));return 1}return 0};
const final=()=>G&&{w:G.over&&G.over.winner,scores:G.over&&G.over.scores,rank:G.over&&G.over.ranking,r:G.round,inf:G.pl.map(p=>p.inf),lore:G.pl.map(p=>p.lore),hand:G.pl.map(p=>p.hand.length),ai:G.pl.map(p=>!!p.ai),herald:G.pl.map(p=>p.herald),council:G.council&&Object.values(G.council).map(c=>c.length),last:G.log.slice(-2).map(e=>e.t),card:UI.card&&UI.card.kind};
async function clk(P,sel){const ok=await P.p.evaluate(s=>{const b=document.querySelector(s);if(!b||b.disabled)return false;b.click();return true},sel);if(!ok)throw new Error('no button '+sel+' on '+P.tag)}
async function shot(P,name,vp){if(vp)await P.p.setViewportSize(vp);await sleep(600);await P.p.screenshot({path:path.join(OUT,name+'.png')});log('shot',name)}
async function waitFor(P,fn,ms,arg){const t0=Date.now();while(Date.now()-t0<ms){if(await P.p.evaluate(fn,arg).catch(()=>false))return true;await sleep(150)}return false}
async function openOnl(P){await P.p.evaluate(()=>{const d=document.getElementById('onl');if(d&&!d.open)d.querySelector('summary').click()});await sleep(200)}
async function hostRoom(H,name){await openOnl(H);await H.p.fill('#netname',name);await clk(H,'[data-a="nethost"]');await waitFor(H,()=>NET.on&&NET.code,10000);return await H.p.evaluate(()=>NET.code)}
async function joinRoom(C,name,code){await openOnl(C);await C.p.fill('#netname',name);await C.p.fill('#joincode',code);await clk(C,'[data-a="netjoin"]')}
(async()=>{const relay=spawn('node',[__dirname+'/relay.js',''+PORT]);await sleep(600);
B=await chromium.launch({args:['--no-proxy-server']});
const results=[];const report=o=>{const errors=pages.flatMap(x=>x.errs.filter(e=>!/net::ERR_FAILED/.test(e)).map(e=>x.tag+': '+e.slice(0,200)));const aborted=pages.reduce((a,x)=>a+x.errs.filter(e=>/net::ERR_FAILED/.test(e)).length,0);
  console.log(JSON.stringify(Object.assign({mode:MODE,phone:PHONE,results},o||{},{errors,abortedOutsideRequests:aborted}),null,1))};
const H=await mkPage('host');
const av=await H.p.evaluate(()=>({avail:netAvail(),tr:typeof Trystero}));log('available',JSON.stringify(av));
const nClients=MODE==='full3'?2:1;
const code=await hostRoom(H,'Hosty');log('code',code);
const lookTxt=await H.p.evaluate(()=>document.querySelector('#netblock').textContent+' | popup: '+((document.querySelector('#netbox .nst')||{}).textContent||''));log('before anyone joins:',lookTxt.trim().slice(0,120));
const C=[];for(let i=0;i<nClients;i++){const c=await mkPage('client'+(i+1));await joinRoom(c,'Friend'+(i+1),code);C.push(c)}
let t0=Date.now();const formed=await waitFor(H,n=>NET.peers.length>=n+1,60000,nClients);log('lobby formed',formed,'in',Date.now()-t0,'ms');
for(const c of C)await waitFor(c,()=>NET.opt&&document.querySelector('#netbox .nbox'),20000);
await shot(H,'lobby-host');await shot(C[0],'lobby-client');
if(PHONE){const lay=await H.p.evaluate(()=>{const b=document.querySelector('#netbox .nbox').getBoundingClientRect();return {w:Math.round(b.width),h:Math.round(b.height),inView:b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight,hscroll:document.documentElement.scrollWidth>innerWidth}});log('phone lobby box',JSON.stringify(lay))}
// ------------------------------------------------------------------ ui mode
if(MODE==='ui'){
  const res={};
  const link=await H.p.evaluate(()=>(document.querySelector('.invlink')||{}).value);res.link=link;res.linkHasJoin=/#join-/.test(link||'')&&link.endsWith('#join-'+code);
  res.popup=await C[0].p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const k=()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const open=()=>!!document.querySelector('#netbox:not([hidden]) .nbox');const o={};o.startsOpen=open();k();await w(100);o.escCloses=!open();NET.on&&(UI.netOpen=true,netRender());await w(100);
    o.reopens=open();document.getElementById('netbox').click();await w(100);o.outsideCloses=!open();UI.netOpen=true;netRender();await w(100);document.querySelector('#netbox [data-a=netclose]').click();await w(100);o.xCloses=!open();return o});
  // copy: clipboard denied -> the link is selected
  await H.p.evaluate(()=>{UI.netOpen=true;netRender();Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true})});
  await clk(H,'[data-a="netcopy"]');await sleep(400);res.copyFallbackSelects=await H.p.evaluate(()=>{const i=document.querySelector('.invlink');return !!i&&document.activeElement===i&&i.selectionStart===0&&i.selectionEnd>8});
  await H.p.evaluate(()=>{UI.netOpen=false;netRender()});await H.p.evaluate(()=>showStart());await sleep(300);
  res.hostRows=await H.p.evaluate(()=>[...document.querySelectorAll('#start .seat small')].map(x=>x.textContent));await shot(H,'start-in-room');
  // lobby popup start button
  await H.p.evaluate(()=>{sv.np=3;sv.length='short';UI.netOpen=true;netRender()});await clk(H,'[data-a="netstart"]');
  res.started=await waitFor(C[0],()=>G&&UI.started&&NET.mySeat===1,30000);await sleep(1500);
  res.statusLine=await C[0].p.evaluate(()=>{const e=document.querySelector('#netst');const b=document.querySelector('#board').getBoundingClientRect(),r=e.getBoundingClientRect();return {text:e.textContent.trim().slice(0,90),hidden:e.hidden,belowBoard:r.top>=b.bottom-1||r.left>=b.right-1,overBoard:!(r.bottom<=b.top||r.top>=b.bottom||r.right<=b.left||r.left>=b.right)}});
  await shot(C[0],'client-start');await shot(H,'host-start');
  // host closes the tab: the client says so
  await H.c.close();H.closed=true;res.hostLeftMsg=await waitFor(C[0],()=>NET.hostGone&&/host left/i.test((document.querySelector('#netbox')||{}).textContent||''),30000);
  await shot(C[0],'client-host-left');const dm=await C[0].p.evaluate(()=>(document.querySelector('#netst')||{}).textContent);res.dock=dm.trim().slice(0,100);
  await clk(C[0],'#netbox [data-a="netleave"]');await sleep(500);res.backToStart=await C[0].p.evaluate(()=>!document.getElementById('start').hidden&&!NET.on);
  results.push(res);report();await B.close();relay.kill();process.exit(0)}
// ------------------------------------------------------------------ game modes
for(let g=1;g<=NG;g++){
  await H.p.evaluate(([g,np])=>{sv.np=np;sv.length='short';sv.faction=['nobility','clans','uprising','gathering'][(g-1)%4]},[g,+(process.env.NP||3)]);
  if(g===1)await clk(H,'[data-a="netstart"]');else {await H.p.evaluate(()=>showStart());await sleep(200);await clk(H,'[data-a="start"]')}
  const ok=await Promise.all(C.map((c,i)=>waitFor(c,s=>G&&UI.started&&NET.mySeat===s&&!G.over,30000,i+1)));
  log(`game ${g} started; clients seated:`,JSON.stringify(ok));const np=await H.p.evaluate(()=>G.np);log('players',np);
  let clicks=0,rem0=await H.p.evaluate(()=>NET.acc),leaveStage=MODE==='leave'?0:9,leaveInfo={},illegalDone=MODE!=='illegal',illegal=null,shotDone=false,shotMid=false,lastR=0;t0=Date.now();
  const stall={};
  while(Date.now()-t0<SECS*1000){
    if(Date.now()-(stall.t||0)>1000){stall.t=Date.now();const sg=await H.p.evaluate(()=>G&&G.logN+':'+(G.q&&G.q.kind)+':'+(G.q&&G.q.seats.join()));if(sg!==stall.sig){stall.sig=sg;stall.at=Date.now()}
      else if(Date.now()-stall.at>40000){const dump=[];for(const P of [H,...C]){if(P.closed)continue;dump.push(P.tag+' '+JSON.stringify(await P.p.evaluate(()=>({q:G.q&&{kind:G.q.kind,seats:G.q.seats,t:G.q.t,title:G.q.title},mySeat:NET.mySeat,card:UI.card&&UI.card.kind,pop:UI.pop,pend:!!NET.pend,main:document.querySelector('#main').innerText.slice(0,200),logN:G.logN,ai:G.pl.map(p=>p.ai),away:NET.away,peers:NET.peers.length,bad:NET.bad,badE:NET.badE,lastRx:NET.lastRx&&Date.now()-NET.lastRx,applied:NET.applied,seq:NET.seq,nmv:(()=>{try{return TB.moves(G,Math.max(0,NET.mySeat)).length}catch(e){return 'ERR '+e.message}})()})).catch(e=>'ERR '+e.message)))}
        log('STALL',dump.join('\n'));results.push({stall:dump});break}}
    const hs=await H.p.evaluate(()=>G&&{o:!!G.over,r:G.round,ph:G.phase,q:G.q&&G.q.kind,seats:G.q&&G.q.seats.slice(),simul:G.q&&G.q.simul});if(!hs||hs.o)break;
    // illegal / malformed messages while it is the host's decision (and the client is not asked, or at least cannot do anything with these)
    if(!illegalDone&&hs.r>=2&&hs.seats&&hs.seats.includes(0)){
      const before=await H.p.evaluate(()=>({sig:JSON.stringify([G.logN,G.round,G.phase,G.step,G.q&&G.q.kind,G.pl.map(p=>[p.hand,p.inf,p.herald])]),rej:NET.rej,acc:NET.acc}));
      const hostKeys=await H.p.evaluate(()=>TB.moves(G,0).map(m=>m.k).slice(0,4));
      const sent=await C[0].p.evaluate(hk=>{const H=NET.hostPeer;const s=d=>NET.room.sendTo(H,'act',d);const junk=[null,'x',42,[1,2],{},{k:5},{k:null},{k:{toString:1}},{k:'x'.repeat(5000)},{k:'__proto__'},{k:'constructor'},JSON.parse('{"__proto__":{"k":"done"}}'),JSON.parse('{"k":"done","__proto__":{"seat":0}}'),{k:'b:999'},{k:'b:0'},{k:'b:1'},{k:'p:1:0'},{k:'eval("alert(1)")'},{act:'done'},{k:['done']},{seat:0,k:'done'},{k:'done '},{k:'DONE'},{t:'bid',k:'b:2'}];
        hk.forEach(k=>junk.push({k}));  // the host's own legal keys, sent by a seat that is not asked / does not own them
        junk.forEach(s);return junk.length},hostKeys);
      await sleep(2500);const after=await H.p.evaluate(()=>({sig:JSON.stringify([G.logN,G.round,G.phase,G.step,G.q&&G.q.kind,G.pl.map(p=>[p.hand,p.inf,p.herald])]),rej:NET.rej,acc:NET.acc,proto:({}).k===undefined&&Object.prototype.hasOwnProperty.call(Object.prototype,'k')===false,inv:TB.invariants(G).length}));
      illegal={sent,rejected:after.rej-before.rej,accepted:after.acc-before.acc,stateUnchanged:before.sig===after.sig,protoClean:after.proto,invariantFailures:after.inv};log('illegal test',JSON.stringify(illegal));illegalDone=true}
    // leave / rejoin
    if(leaveStage===0&&hs.r>=2){const uid=await C[0].p.evaluate(()=>NET.uid);leaveInfo.uid=uid;await C[0].c.close();C[0].closed=true;leaveStage=1;leaveInfo.leftAtRound=hs.r;log('client tab closed at round',hs.r);
      leaveInfo.aiTookOver=await waitFor(H,()=>G.pl[1].ai&&NET.away[1],25000);leaveInfo.gameContinuedWithoutClient=true}
    if(leaveStage===1&&(hs.r>=leaveInfo.leftAtRound+1||Date.now()-t0>SECS*500)){
      const nc=await mkPage('rejoin',{uid:leaveInfo.uid,hash:'#join-'+code});C[0]=nc;
      leaveInfo.linkPrefill=await nc.p.evaluate(()=>({code:(document.getElementById('joincode')||{}).value,panelOpen:!!document.querySelector('.online[open]')}));
      await nc.p.evaluate(()=>{const i=document.getElementById('netname');if(i){i.value='Friend1';i.dispatchEvent(new Event('input',{bubbles:true}))}});await clk(nc,'[data-a="netjoin"]');const tj=Date.now();
      const back=await waitFor(nc,()=>G&&UI.started&&NET.mySeat===1,90000);leaveInfo.rejoinMs=Date.now()-tj;leaveInfo.seatBack=back&&await H.p.evaluate(()=>!G.pl[1].ai&&!NET.away[1]);
      leaveInfo.accAtBack=await H.p.evaluate(()=>NET.acc);leaveInfo.t2=Date.now();leaveInfo.r2=await H.p.evaluate(()=>G.round);leaveStage=2;log('rejoined',JSON.stringify(leaveInfo))}
    if(leaveStage===2&&(hs.r>=leaveInfo.r2+1||Date.now()-leaveInfo.t2>SECS*400)){const acc=await H.p.evaluate(()=>NET.acc);leaveInfo.movesAfterRejoin=acc-leaveInfo.accAtBack;await C[0].c.close();C[0].closed=true;leaveStage=3;log('client left for good at round',hs.r,'moves made after rejoin:',leaveInfo.movesAfterRejoin);
      leaveInfo.finalAI=await waitFor(H,()=>G.pl[1].ai&&NET.away[1],25000)}
    for(const P of [H,...C]){if(P.closed)continue;const k=await P.p.evaluate(tick).catch(e=>{P.errs.push('tick '+e.message);return 0});clicks+=k}
    if(!shotMid&&hs.r>=2&&hs.q==='place'&&!C[0].closed&&!process.env.NOSHOT){shotMid=true;await shot(C[0],'client-mid-game');await shot(H,'host-mid-game')}
    await sleep(40)}
  // the final state reaches everybody with the next heartbeat
  const over=await H.p.evaluate(()=>!!G.over);await sleep(4200);
  const hf=await H.p.evaluate(final);const cfs=[];for(const c of C){cfs.push(c.closed?null:await c.p.evaluate(final).catch(()=>null))}
  const net=await H.p.evaluate(()=>({acc:NET.acc,rej:NET.rej,why:NET.why.slice(-6),sent:__sent,leak:__leak,leakWhat:__leakWhat,simul:__simul,bad:__bad,badWhat:__badWhat,inv:TB.invariants(G).length}));
  const cl=[];for(const c of C){cl.push(c.closed?null:await c.p.evaluate(()=>({bad:__bad,badWhat:__badWhat,rxLeak:__rxLeak,rx:__rx,sent:NET.sent,mySeat:NET.mySeat,card:UI.card&&UI.card.kind,badPackets:NET.bad,applied:NET.applied})))}
  if(net.rej>(MODE==='illegal'?28:0)&&!C[0].closed)log('REJECT DIAG host',JSON.stringify(net.why),'client sends',JSON.stringify(await C[0].p.evaluate(()=>NET.sends&&NET.sends.filter(x=>/^b:/.test(x[1])).slice(-24))));
  const agree=cfs.map(c=>c?JSON.stringify(c)===JSON.stringify(hf):'closed');
  const r={game:g,players:np,secs:Math.round((Date.now()-t0)/1000),over,winner:hf&&hf.w,scores:hf&&hf.scores,rounds:hf&&hf.r,agreeWithHost:agree,remoteMovesApplied:net.acc-rem0,hostRejected:net.rej,rejectReasons:net.why,
    hiddenInfo:{packetsChecked:net.sent,hostPacketLeaks:net.leak,what:net.leakWhat,simultaneousPackets:net.simul,hostDomViolations:net.bad,hostBad:net.badWhat,clients:cl},invariantFailures:net.inv,illegal,leave:MODE==='leave'?leaveInfo:undefined,clicks};
  if(!r.agreeWithHost.every(x=>x===true||x==='closed'))r.finalStates={host:hf,clients:cfs};
  results.push(r);log(JSON.stringify(r).slice(0,900));
  if(!over)break;
  if(g<NG){for(let i=0;i<C.length;i++)if(C[i].closed){const c=await mkPage('client'+g+'_'+i);await joinRoom(c,'Friend'+(i+1),code);C[i]=c}}}
report();await B.close();relay.kill();process.exit(0)})();
