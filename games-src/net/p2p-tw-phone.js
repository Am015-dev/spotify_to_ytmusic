// Real WebRTC test for Tidewake: host + clients in separate Chromium contexts (NO proxy), local Nostr relay, pages on the kit's 2D board (?2d).
// PW=$(npm root -g)/playwright node net/p2p-tw.js tots/game/tidewake.html SCENARIO      (PORT=177xx, ports 17771-17779)
//   SCENARIO: full (host+2, 1 computer, all expansions, animations on; interrupts to the right client) | leave (host+2: bad actions, leave, rejoin)
//             | timeout (an interrupt nobody answers: the host's timer answers) | hostleft | ui | full3 (host+3, teams, 5 seats)
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],SC=process.argv[3]||'full';const html=fs.readFileSync(file);const PORT=+process.env.PORT||17771;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let b,relay;
async function page(ctx,label,hash){const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(label+' pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(label+' console: '+m.text())});
  await p.goto('https://gns.test/?2d&phone=1'+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready&&typeof UI!=='undefined'&&UI.setup,null,{timeout:120000,polling:300});return {p,ctx,label,errs}}
async function ctxNew(){const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await c.addInitScript(([port,CANIM_ON])=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];window.NET_TRACE=1;window.CANIM=CANIM_ON;try{localStorage.setItem('tw_set',JSON.stringify({speed:window.CANIM?30:1,anim:!!window.CANIM}))}catch(e){}},[PORT,process.env.CANIM==='1']);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});return c}
async function setup(ncl,opt){const H=await page(await ctxNew(),'host');const C=[];for(let i=0;i<ncl;i++)C.push(await page(await ctxNew(),'c'+(i+1)));
  console.log('host',JSON.stringify(await H.p.evaluate(()=>({avail:netAvail(),trystero:typeof Trystero}))));
  await H.p.evaluate(o=>{AIDELAY=150;ANIM=o.anim?1:0;if(o.anim)UI.speed=30;UI.qTime=o.qTime||25;const s=UI.setup;s.np=o.np;s.variant=o.variant||null;s.exp=Object.assign({rift:0,wave:0,maelstrom:0,cannon:0},o.exp||{});s.seats.forEach(x=>{x.lv=o.lv||'normal'});
    document.querySelector('#onl').open=true;document.getElementById('netname').value='Hosty';document.querySelector('[data-a=nethost]').click()},opt);
  let code='';for(let k=0;k<60&&!code;k++){await sleep(100);code=await H.p.evaluate(()=>NET.on?NET.code:'')}
  for(const [i,c] of C.entries())await c.p.evaluate(([code,i])=>{AIDELAY=150;document.querySelector('#onl').open=true;document.getElementById('netname').value='Friend'+(i+1);document.getElementById('joincode').value=code;document.querySelector('[data-a=netjoin]').click()},[code,i]);
  const t0=Date.now();while(Date.now()-t0<40000){const n=await H.p.evaluate(()=>NET.peers.length);const m=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.peers.length)));if(n>=ncl+1&&m.every(x=>x>=ncl+1))break;await sleep(250)}
  await sleep(1500);const lobby=await H.p.evaluate(()=>lobbyPlayers().map(p=>p.nm));const cl=await Promise.all(C.map(c=>c.p.evaluate(()=>({open:UI.netOpen,pl:lobbyPlayers().map(p=>p.nm),opt:!!NET.opt,hostPeer:!!NET.hostPeer}))));
  console.log('lobby after',Date.now()-t0,'ms host sees',JSON.stringify(lobby),'clients see',JSON.stringify(cl));return {H,C,code}}
const startHost=H=>H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());
// one random click through the page's own buttons / board squares (a port of click.js's clicker, for the page's own seat only)
const tick=()=>{if(!G||G.over||!UI.started||UI.busy)return 0;const d=document,R=Math.random,rnd=a=>a[Math.floor(R()*a.length)],q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled),click=el=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1};
  const qs=q(':is(#ps,#ppop,#pc) [data-a=q]');if(qs.length){const lg=G.q&&G.q.opts&&G.q.opts.find(o=>o.d&&o.d.x!=null&&(o.h==='dGateAt'||o.h==='dReloc'));if(lg&&R()<.3){const t=d.querySelector(`#fb [data-c="${lg.d.x}"][data-r="${lg.d.y}"]`);if(t)return click(t)}return click(rnd(qs))}
  const sm=q(':is(#ps,#ppop,#pc) [data-a=startmark]');if(sm.length)return click(rnd(sm));
  const main=d.getElementById('main');
  if(q(':is(#ps,#ppop,#pc) [data-a=place],:is(#ps,#ppop,#pc) [data-a=cannon],:is(#ps,#ppop,#pc) [data-a=gate],:is(#ps,#ppop,#pc) [data-a=pass],:is(#ps,#ppop,#pc) [data-a=card]').length){
    const sg=q(':is(#ps,#ppop,#pc) [data-a=sugg]');if(sg.length&&R()<.5)return click(sg[0]);
    const tg=q(':is(#ps,#ppop,#pc) [data-a=target]');if(tg.length&&R()<.3)return click(rnd(tg));
    const cs=q(':is(#ps,#ppop,#pc) [data-a=cannon]');if(cs.length&&R()<.6)return click(rnd(cs));
    const gt=q(':is(#ps,#ppop,#pc) [data-a=gate]');if(gt.length&&R()<.4)return click(rnd(gt));
    const ps=q(':is(#ps,#ppop,#pc) [data-a=pass]');if(ps.length)return click(ps[0]);
    if(R()<.25){const cd=q(':is(#ps,#ppop,#pc) [data-a=card]');if(cd.length)return click(rnd(cd))}
    if(R()<.25){const rb=q(':is(#ps,#ppop,#pc) [data-a=rot]');if(rb.length)return click(rnd(rb))}
    const pb=q(':is(#ps,#ppop,#pc) [data-a=place]');if(pb.length){if(R()<.15){const f=UI.fronts&&UI.fronts[0];if(f!=null){const S=G.ships[f];const t=d.querySelector(`#fb [data-c="${S.x}"][data-r="${S.y}"]`);if(t)return click(t)}}return click(pb[0])}}
  return 0};
// ---- hidden-information checks. Truth = the host's real G; a page may only hold what its own seat may see ----
const hostTruth=()=>({hands:G.hands.map(h=>h.slice()),deck:G.deck.slice(),mdeck:G.mdeck.slice(),rng:G.rng,seed:G.seed,pool:G.pool.slice(),limbo:G.limbo,gid:G.gid,q:G.q&&{who:G.q.who,kind:G.q.kind}});
const ALLOWED='v np variant exp opts phase step turn cur first order sp team ships seats hands deck gone limbo mdeck mons mgone wave gates bd dice refill arr mq placeElim batch pool bq over q log logN stats gid ag agI'.split(' ');
const pageCheck=T=>{const out=[];const v=NET.mySeat;if(!G||G.gid!==T.gid)return out;
  // the DOM: no hand drawn face up unless it is my seat's (host included: it holds every hand but may only draw its own)
  for(const el of document.querySelectorAll('[data-owner][data-up="1"],[data-hand]')){const o=+(el.getAttribute('data-owner')||el.getAttribute('data-hand'));if(o!==v)out.push('dom: hand of seat '+o+' drawn on the page of seat '+v)}
  if(NET.role==='client'){
    G.hands.forEach((h,i)=>{if(i!==v&&h.some(c=>c!==-1))out.push('state: hand of seat '+i+' present')});
    if(G.deck.some(c=>c!==-1))out.push('state: pile present');if(G.pool.length&&G.cur!==v&&G.pool.some(c=>c!==-1))out.push('state: pool present');
    if(G.rng!==undefined||G.seed!==undefined)out.push('state: rng/seed present');if(G.ag&&G.ag.length)out.push('state: agenda present');
    if(G.mdeck.some((c,i)=>i&&c<G.mdeck[i-1]))out.push('state: leviathan deck order present');
    if(G.q&&G.q.who!==v&&(G.q.opts.length||Object.keys(G.q.ctx).length))out.push('state: other seat question data');
    if(G.limbo!=null&&G.limbo!==-1&&!(G.q&&G.q.who===v))out.push('state: limbo card present');
    for(const k of Object.keys(G))if(!ALLOWED.includes(k))out.push('state: unlisted field '+k);
    for(const t of (NET.trace||[])){const o=JSON.parse(t);if(!o.g)continue;const g=o.g,s=o.seat;
      for(const k of Object.keys(g))if(!ALLOWED.includes(k))out.push('packet: unlisted field '+k);
      if('rng' in g||'seed' in g)out.push('packet: rng/seed');if(g.ag&&g.ag.length)out.push('packet: agenda');
      g.hands.forEach((h,i)=>{if(i!==s&&h.some(c=>c!==-1))out.push('packet: hand of seat '+i+' (packet for seat '+s+')')});if(g.deck.some(c=>c!==-1))out.push('packet: pile');
      if(g.mdeck.some((c,i)=>i&&c<g.mdeck[i-1]))out.push('packet: leviathan deck order');
      if(g.pool.length&&g.cur!==s&&g.pool.some(c=>c!==-1))out.push('packet: pool');
      if(g.q&&g.q.who!==s&&(g.q.opts.length||Object.keys(g.q.ctx).length))out.push('packet: question data of another seat');
      if(g.limbo!=null&&g.limbo!==-1&&!(g.q&&g.q.who===s))out.push('packet: limbo');
      if(s>=0&&g.hands[s].length&&JSON.stringify(g.hands[s]).length>200)out.push('packet: own hand odd')}
    if(NET.trace&&NET.trace.length>30)NET.trace=NET.trace.slice(-12)}
  return out};
const dbg={game:0,interrupts:0,remoteInterrupts:0,ownerSawDoom:0,leak:0,qWho:{}};
async function play(P,H,secs,hook){let clicks=0,remoteClicks=0,checks=0;const viol=[];const t0=Date.now();let n=0,lastK='',lastT=Date.now();
  while(Date.now()-t0<secs*1000){const g=await H.p.evaluate(()=>G&&{over:!!G.over,turn:G.turn,k:G.logN+'/'+G.phase+'/'+sideToAct(),q:G.q&&{who:G.q.who,kind:G.q.kind,cur:G.cur,seat:NET.mySeat,human:!!G.seats[G.q.who].human}}).catch(()=>null);if(!g||g.over)break;
    if(g.k!==lastK){lastK=g.k;lastT=Date.now()}else if(Date.now()-lastT>40000){lastT=Date.now();const v=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({seat:NET.mySeat,k:G&&G.logN+'/'+sideToAct(),main:document.getElementById('main').textContent.slice(0,80),rx:NET.rx,bad:NET.bad,badE:NET.badE,rej:NET.rejected,peers:NET.peers.length,busy:UI.busy,q:NET.queue&&NET.queue.length})).catch(e=>String(e))));console.log('STALL?',JSON.stringify(g),JSON.stringify(v))}
    // interrupts: the endangered seat's own page (and only that page) is asked
    if(g.q&&g.q.kind==='doom'){const key=dbg.game+'/'+g.k;if(!dbg.qWho[key]){dbg.qWho[key]=1;dbg.interrupts++;if(g.q.who!==g.q.cur&&g.q.human){dbg.remoteInterrupts++;if(g.q.who===g.q.seat)dbg.hostInterrupts=(dbg.hostInterrupts||0)+1;
        await sleep(900);const owner=P.find(x=>!x.dead&&x!==H&&x.seat===g.q.who);const seen=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({seat:NET.mySeat,doom:!!document.querySelector(':is(#ps,#ppop,#pc) [data-qkind=doom]'),btn:document.querySelectorAll(':is(#ps,#ppop,#pc) [data-a=q]').length,q:G.q&&G.q.kind})).catch(()=>null)));
        for(const s of seen)if(s&&s.q==='doom'){if(s.seat===g.q.who){if(s.doom&&s.btn)dbg.ownerSawDoom++}else if(s.btn)dbg.leak++}}}}
    if(hook&&global.HOOK_FIRST)await hook(g,n);
    for(const x of P){if(x.dead||global.FREEZE===x||global.FREEZE===1)continue;const k=await x.p.evaluate(tick).catch(e=>{x.errs.push(x.label+' tick '+e.message);return 0});clicks+=k;if(x!==H)remoteClicks+=k}
    if(++n%6===0){const T=await H.p.evaluate(hostTruth).catch(()=>null);if(T)for(const x of P){if(x.dead)continue;const o=await x.p.evaluate(pageCheck,T).catch(()=>[]);checks++;if(o.length&&viol.length<8)viol.push(x.label+': '+o.slice(0,3).join('; '))}}
    if(hook&&!global.HOOK_FIRST)await hook(g,n);await sleep(global.DELAY||40)}
  return {clicks,remoteClicks,checks,viol,secs:Math.round((Date.now()-t0)/1000)}}
async function games(P,H,tag,max,secs,done,hook){const out=[];for(let g=0;g<max;g++){dbg.game=g;const pr=await play(P,H,secs,hook);const r=await finish(P,H,tag+' #'+(g+1),pr);out.push(r);if(done()||!r.agree)break;
    await H.p.evaluate(()=>document.querySelector('[data-a=again]').click());
    for(let k=0;k<80;k++){await sleep(250);const ok=await Promise.all(P.filter(x=>!x.dead&&x!==H).map(x=>x.p.evaluate(()=>G&&!G.over&&G.turn<=1&&UI.started).catch(()=>false)));if(ok.every(Boolean))break}}return out}
const seatOf=async x=>{x.seat=await x.p.evaluate(()=>NET.mySeat).catch(()=>-2);return x.seat};
async function finish(P,H,tag,extra){await sleep(800);const alive=P.filter(x=>!x.dead);
  for(let k=0;k<60;k++){const hs=await H.p.evaluate(()=>G.logN);const ok=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(l=>G&&G.over&&G.logN===l,hs).catch(()=>false)));if(ok.every(Boolean))break;await sleep(400)}
  const KN=()=>{const k=knowledge(NET.mySeat);return JSON.stringify(k)};
  const sum=()=>({over:!!G.over,win:G.over&&G.over.win.join(),turn:G.turn,logN:G.logN,seat:NET.mySeat,role:NET.role,why:G.over&&G.over.why,know:JSON.stringify(knowledge(NET.mySeat)),names:G.seats.map(q=>q.nm+(q.human?'':'(cpu)')),bd:JSON.stringify(G.bd),ships:JSON.stringify(G.ships)});
  const hs=await H.p.evaluate(sum);const cs=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(sum).catch(()=>null)));
  const hk=await Promise.all(cs.map(c=>c?H.p.evaluate(s=>JSON.stringify(knowledge(s)),c.seat):null));
  const agree=cs.every((c,i)=>c&&c.over&&c.win===hs.win&&c.turn===hs.turn&&c.logN===hs.logN&&c.bd===hs.bd&&c.ships===hs.ships&&c.know===hk[i]);
  const stats=await H.p.evaluate(()=>({remote:NET.remote,rejected:NET.rejected,autoDecl:NET.autoDecl,rejLog:NET.rejLog,inv:checkInvariants().length}));const errors=P.flatMap(x=>x.errs);
  const r=Object.assign({tag,host:{over:hs.over,win:hs.win,why:hs.why,turns:hs.turn,names:hs.names},clients:cs.map(c=>c&&{seat:c.seat,over:c.over}),agree,hostStats:stats,dbg},extra||{},{errors:errors.slice(0,10),nErrors:errors.length});
  console.log(JSON.stringify(r));return r}
(async()=>{relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(600);
b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const res=[];
try{
if(SC==='full'){const {H,C}=await setup(2,{np:5,exp:{rift:1,cannon:1,wave:1,maelstrom:1},anim:1});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);
  res.push(...await games(P,H,'host+2 +2 computers, all expansions, host animations on, Play again',40,400,()=>dbg.remoteInterrupts>=4&&dbg.ownerSawDoom>=4))}
else if(SC==='full3'){const {H,C}=await setup(3,{np:5,variant:'teams',exp:{rift:1,cannon:1}});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);const pr=await play(P,H,420);res.push(await finish(P,H,'host+3 teams (4 seats)',pr))}
else if(SC==='timeout'){const {H,C}=await setup(1,{np:4,exp:{rift:1,cannon:1,wave:1},qTime:3});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);let silenced=0,seen=null;global.HOOK_FIRST=1;
  res.push(...await games(P,H,'interrupt timeout',40,300,()=>seen&&seen.timeout,async g=>{if(g.q&&g.q.kind==='doom'&&g.q.who===P[1].seat&&!seen){seen={at:g.k};global.FREEZE=P[1];const a0=await H.p.evaluate(()=>NET.autoDecl);let k=0,a1=a0;for(;k<60&&a1===a0;k++){await sleep(300);a1=await H.p.evaluate(()=>NET.autoDecl)}
      const moved=await H.p.evaluate(()=>!(G.q&&G.q.kind==='doom'));seen.timeout={autoDeclined:a1>a0,waitedMs:k*300,doomCleared:moved};global.FREEZE=0}}));res[res.length-1].timeoutTest=seen;if(!seen||!seen.timeout||!seen.timeout.autoDeclined)res[res.length-1].agree=false}
else if(SC==='ui'){const {H,C}=await setup(1,{np:3});const vis=x=>x.p.evaluate(()=>!document.getElementById('netbox').hidden);const out={};
  out.openAtStart=await vis(H);await H.p.keyboard.press('Escape');out.afterEsc=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());out.reopened=await vis(H);await H.p.mouse.click(5,5);out.afterBackdrop=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netclose]').click());out.afterX=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netcopy]').click());await sleep(300);out.copy=await H.p.evaluate(()=>({copied:NET.copied,active:document.activeElement&&document.activeElement.className}));
  out.link=await H.p.evaluate(()=>document.querySelector('.invlink').value);out.clientEsc=await (async()=>{await C[0].p.keyboard.press('Escape');return vis(C[0])})();
  out.seatRows=await H.p.evaluate(()=>[...document.querySelectorAll('#start .seat')].map(e=>(e.querySelector('.tag')||{textContent:'-'}).textContent.replace(/\s+/g,' ').trim()));
  const ok=out.openAtStart&&!out.afterEsc&&out.reopened&&!out.afterBackdrop&&!out.afterX&&/#join-/.test(out.link)&&!out.clientEsc&&out.seatRows.some(t=>/Online: Hosty/.test(t))&&out.seatRows.some(t=>/Online: Friend1/.test(t));console.log('UI',JSON.stringify(out));res.push({tag:'ui',agree:ok,errors:[...H.errs,...C[0].errs],nErrors:H.errs.length+C[0].errs.length})}
else if(SC==='leave'){global.DELAY=300;const {H,C,code}=await setup(2,{np:4,exp:{rift:1,cannon:1}});const P=[H,...C];await H.p.evaluate(()=>{AIDELAY=500});await startHost(H);for(const x of P)await seatOf(x);const ev={};
  const hook=async(g,n)=>{
    if(!ev.bad&&g.turn>=2){ev.bad=true;const before=await H.p.evaluate(()=>({t:G.turn,n:G.logN,rej:NET.rejected}));
      await C[1].p.evaluate(()=>{const R=NET.room,h=NET.hostPeer;const junk=[null,5,'x',[1,2],{m:null},{m:'x'},{m:{}},{m:{a:5}},{m:{a:'place'}},{m:{a:'place',t:99,r:9,s:0}},{m:{a:'place',t:0,r:0,s:77}},{m:{a:'start',x:-1,y:99,e:3}},{m:{a:'start',x:'a',y:0,e:0}},{m:{a:'q',i:99}},{m:{a:'q',i:-1}},{m:{a:'gate',t:0,s:0}},{m:{a:'cannon',t:0,m:3,s:0}},{m:{a:'pass'}},
          {m:JSON.parse('{"__proto__":{"x":1},"a":"pass"}')},{m:{a:'place',t:0,r:0,s:0,pad:'x'.repeat(5000)}},{hi:1},{m:{a:'reveal'}}];
        for(const j of junk){R.sendTo(h,'act',j);R.emit('act',j)}R.emit('st',{s:1e9,i:0,n:1,d:'zzzz'});R.emit('st',{junk:1});R.sendTo(h,'st',{s:1e9,i:0,n:1,d:'zzzz'})});
      await sleep(1500);const after=await H.p.evaluate(()=>({t:G.turn,n:G.logN,rej:NET.rejected,inv:checkInvariants()}));ev.badResult={rejectedDelta:after.rej-before.rej,invariants:after.inv.length,protoPolluted:await H.p.evaluate(()=>({}).x!==undefined)}}
    if(!ev.left&&g.turn>=4){ev.left=true;ev.seat=await C[0].p.evaluate(()=>NET.mySeat);ev.uid=await C[0].p.evaluate(()=>NetRoom.uid());await C[0].ctx.close();C[0].dead=true;
      let away=false;for(let k=0;k<80&&!away;k++){await sleep(250);away=await H.p.evaluate(s=>!G.seats[s].human&&!!G.seats[s].away,ev.seat)}ev.leave={seat:ev.seat,aiTookOver:away};ev.leftAt=Date.now()}
    if(ev.left&&!ev.rejoin&&Date.now()-ev.leftAt>3000){ev.rejoin=true;const cx=await ctxNew();await cx.addInitScript(u=>{try{localStorage.setItem('gns-uid',u);localStorage.setItem('gns-name','Friend1')}catch(e){}},ev.uid);const x=await page(cx,'c1-again','#join-'+code);
      const pre=await x.p.evaluate(()=>({code:UI.joinCode,onl:UI.onl,open:document.querySelector('#onl').open}));await x.p.evaluate(()=>{AIDELAY=150;document.querySelector('[data-a=netjoin]').click()});
      let back=false;for(let k=0;k<200&&!back;k++){await sleep(250);back=await H.p.evaluate(s=>G.seats[s].human&&!G.seats[s].away,ev.seat)}
      const mine=await x.p.evaluate(()=>({seat:NET.mySeat,g:!!G,started:UI.started}));ev.rejoinRes={prefilled:pre,back,mine};P.push(x);x.seat=mine.seat;ev.remoteBefore=await H.p.evaluate(()=>NET.remote)}};
  const pr=await play(P,H,420,hook);const remAfter=await H.p.evaluate(()=>NET.remote);
  res.push(await finish(P,H,'host+2: bad actions, leave, rejoin',Object.assign(pr,{bad:ev.badResult,leave:ev.leave,rejoin:ev.rejoinRes,remoteMovesAfterRejoin:remAfter-(ev.remoteBefore||0)})))}
else if(SC==='shots'){const SH=__dirname+'/../tots/game/shots';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}const {H,C}=await setup(2,{np:4,exp:{rift:1,cannon:1}});
  for(const [w,h] of [[1366,768],[390,844]]){await H.p.setViewportSize({width:w,height:h});await C[0].p.setViewportSize({width:w,height:h});await sleep(700);await H.p.screenshot({path:`${SH}/net_lobby_host_${w}x${h}.png`});await C[0].p.screenshot({path:`${SH}/net_lobby_client_${w}x${h}.png`})}
  await H.p.evaluate(()=>netClose());await sleep(400);await H.p.screenshot({path:`${SH}/net_start_inroom.png`,fullPage:false});await H.p.evaluate(()=>{UI.netOpen=true;netRender()});const P=[H,...C];await startHost(H);let shot=0;
  await play(P,H,150,async(g,n)=>{if(shot<2&&g.turn>=2&&n%12===0){for(const [w,h] of [[1366,768],[390,844]]){await C[0].p.setViewportSize({width:w,height:h});await H.p.setViewportSize({width:w,height:h});await sleep(900);
        const lay=await C[0].p.evaluate(()=>({sw:document.documentElement.scrollWidth,vw:innerWidth,seat:NET.mySeat,cur:sideToAct()}));console.log('client layout',w,JSON.stringify(lay));
        await C[0].p.screenshot({path:`${SH}/net_client_${w}x${h}_${shot}.png`});await H.p.screenshot({path:`${SH}/net_host_${w}x${h}_${shot}.png`})}shot++}});
  console.log('errors',JSON.stringify([H,...C].flatMap(x=>x.errs).slice(0,10)))}
else if(SC==='idle'){const {H,C}=await setup(1,{np:3,exp:{wave:1},anim:1});const P=[H,...C];await H.p.evaluate(()=>{NET.ttLimit=3});await startHost(H);for(const x of P)await seatOf(x);
  const hasBtn=await H.p.evaluate(()=>{UI.netOpen=true;netRender();return document.querySelectorAll('#netbox [data-a=nettt]').length});
  let info={},shot=false;for(let k=0;k<100;k++){await sleep(700);info=await H.p.evaluate(()=>({auto:NET.autoTurn,turn:G.turn,over:!!G.over}));
    if(!shot){const b=await C[0].p.evaluate(()=>UI.busy&&UI.mph&&UI.mph.shown>0).catch(()=>false);if(b){shot=true;await C[0].p.screenshot({path:__dirname+'/../tots/game/shots/nc/net_client_anim.png'})}}if((info.auto>=4&&shot)||info.over)break}
  const cl=await C[0].p.evaluate(()=>({played:NET.played||0,ev:NET.playedEv||0,strip:document.getElementById('netst').textContent,turn:G.turn,tt:NET.ttSec}));
  await C[0].p.screenshot({path:__dirname+'/../tots/game/shots/nc/net_client_idle.png'});
  const errs=P.reduce((n,x)=>n+x.errs.length,0);res.push({tag:'idle timer + client replay',agree:info.auto>=2&&cl.played>0&&cl.tt===3&&hasBtn===4&&/s left|timer/.test(cl.strip),nErrors:errs,errs:P.flatMap(x=>x.errs).slice(0,3),info,cl,hasBtn,shot})}
else if(SC==='hostleft'){const {H,C}=await setup(1,{np:3});const P=[H,...C];await startHost(H);
  await play(P,H,200,async g=>{if(g.turn>=3)throw 'stop'}).catch(e=>{if(e!=='stop')throw e});
  await H.p.close();H.dead=true;let msg='';for(let k=0;k<120&&!msg;k++){await sleep(300);msg=await C[0].p.evaluate(()=>NET.hostGone?NET.err:'')}
  const vis=await C[0].p.evaluate(()=>({modal:!document.getElementById('netbox').hidden,text:document.getElementById('netbox').textContent.slice(0,200)}));
  res.push({tag:'host leaves',msg,vis,agree:!!msg&&vis.modal,errors:C[0].errs,nErrors:C[0].errs.length});console.log(JSON.stringify(res[res.length-1]));
  await C[0].p.evaluate(()=>document.querySelector('[data-a=netleave]').click());await sleep(800);console.log('after leave',JSON.stringify(await C[0].p.evaluate(()=>({on:NET.on,start:!document.getElementById('start').hidden}))))}
}catch(e){console.log('HARNESS ERROR',e&&e.stack||e);res.push({tag:'harness',agree:false,nErrors:1})}
await b.close();relay.kill();
const bad=res.filter(r=>!r.agree||r.nErrors||(r.viol&&r.viol.length)||dbg.leak);console.log('SUMMARY',SC,res.length,'runs,',bad.length,'bad');process.exit(0)})();
