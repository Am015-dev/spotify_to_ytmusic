// Real WebRTC test for Hollowbough: host + clients in separate Chromium contexts (NO proxy), local Nostr relay.
// PW=$(npm root -g)/playwright PORT=17781 node net/p2p-hb.js hollowbough/game/hollowbough.html SCENARIO
//   SCENARIO: full (host + 1 client, 2 games through Play again) | full2 (host + 2 clients + 1 computer, full game, 4 seats)
//             | full3 (host + 3 clients, 4 humans) | leave (host + 2: bad actions, leave, rejoin) | ui | hostleft | shots
// PHONE=1 (or p2p-hb-phone.js): 390x844 touch contexts, ?phone=1, plus phone layout checks for the online badge and the lobby.
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],SC=process.argv[3]||'full';const html=fs.readFileSync(file);const PORT=+process.env.PORT||17781;const PHONE=process.env.PHONE==='1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let b,relay;
async function page(ctx,label,hash){const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(label+' pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(label+' console: '+m.text())});
  await p.goto('https://gns.test/'+(PHONE?'?phone=1':'')+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready&&typeof UI!=='undefined'&&document.querySelector('#start .scard'),null,{timeout:120000,polling:300});return {p,ctx,label,errs}}
async function ctxNew(){const c=await b.newContext(PHONE?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1100,height:760}});
  await c.addInitScript(port=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];window.NET_TRACE=1},PORT);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});return c}
async function setup(ncl,opt){const H=await page(await ctxNew(),'host');const C=[];for(let i=0;i<ncl;i++)C.push(await page(await ctxNew(),'c'+(i+1)));
  console.log('host',JSON.stringify(await H.p.evaluate(()=>({avail:netAvail(),trystero:typeof Trystero}))));
  await H.p.evaluate(o=>{AIDELAY=o.delay||80;UI.opt={np:o.np,level:o.level||'normal',solo:1};if(!document.querySelector('#onl').open)document.querySelector('#onl summary').click();document.getElementById('netname').value='Hosty';document.querySelector('[data-a=nethost]').click()},opt);
  let code='';for(let k=0;k<60&&!code;k++){await sleep(100);code=await H.p.evaluate(()=>NET.on?NET.code:'')}
  for(const [i,c] of C.entries())await c.p.evaluate(([code,i])=>{AIDELAY=80;if(!document.querySelector('#onl').open)document.querySelector('#onl summary').click();document.getElementById('netname').value='Friend'+(i+1);document.getElementById('joincode').value=code;document.querySelector('[data-a=netjoin]').click()},[code,i]);
  const t0=Date.now();while(Date.now()-t0<40000){const n=await H.p.evaluate(()=>NET.peers.length);const m=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.peers.length)));if(n>=ncl+1&&m.every(x=>x>=ncl+1))break;await sleep(250)}
  await sleep(1500);const lobby=await H.p.evaluate(()=>netPlayers().map(p=>p.nm));const cl=await Promise.all(C.map(c=>c.p.evaluate(()=>({open:UI.netOpen,pl:netPlayers().map(p=>p.nm),opt:!!NET.opt,hostPeer:!!NET.hostPeer}))));
  console.log('lobby after',Date.now()-t0,'ms host sees',JSON.stringify(lobby),'clients see',JSON.stringify(cl));return {H,C,code}}
const startHost=H=>H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());
// one random click through the page's own DOM, for the page's own seat only (a port of click.js's clicker)
const tick=()=>{if(typeof G==='undefined'||!G||G.phase==='over'||!UI.started)return 0;const d=document,R=Math.random,rnd=a=>a[Math.floor(R()*a.length)],q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled&&!b.closest('[hidden]')),click=el=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1};
  const nb=d.getElementById('netbox');if(nb&&!nb.hidden&&UI.netOpen&&R()<.5){UI.netOpen=false;netRender()}
  const mine=HB.actor(G)===NET.mySeat&&!G.players[NET.mySeat].ai;
  if(!mine){ // other seat's turn: look around, never find a Do button
    if(q('#ppop [data-a=do]').length&&!d.querySelector('#ppop').hidden)window.__doOnOther=(window.__doOnOther||0)+1;
    if(R()<.04){const all=q('.tile,.mc:not(.empty),#handRow .sc');if(all.length)click(rnd(all))}else if(R()<.03){const x=d.querySelector('#ppop [data-a=popx]');if(x)click(x)}return 0}
  const qs=q('#pc [data-a=q]');if(qs.length)return click(rnd(qs));
  const pop=!d.querySelector('#ppop').hidden,r=R();
  if(pop){const dd=q('#ppop [data-a=do]');if(dd.length&&r<.7)return click(rnd(dd));if(r<.85){const x=d.querySelector('#ppop [data-a=popx]');if(x)click(x);return 0}}
  if(r<.02){const c=q('#chips .chip');if(c.length){click(rnd(c));const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x)}return 0}
  const ok=q('.tile.ok,.mc.ok,#handRow .sc.ok,#cityRow .sc.ok'),pick=R();
  if(pick<.6&&ok.length)return click(rnd(ok));
  if(pick<.68){const hb=q('#acts [data-a=hint]');if(hb.length)return click(hb[0])}
  const pr=q('#acts [data-a=prep]');if(pr.length&&R()<.7)return click(pr[0]);
  const ps=q('#acts [data-a=pass]');if(ps.length&&R()<.1)return click(ps[0]);
  if(ok.length)return click(rnd(ok));return 0};
// ---- hidden-information checks. Truth = the host's real G; a page may only hold what its own seat may see ----
const hostTruth=()=>({gid:NET.gid,hands:G.players.map(p=>p.hand.slice()),deck:G.deck.slice(),rng:G.rng,seed:G.seed,lpriv:G.lpriv,q:G.q&&{who:G.q.who,kind:G.q.kind}});
const ALLOWED='v np solo deck discard meadow limbo lpriv forest bev sev grim cur first turn phase logN over nolog players q log used rng seed ag agI'.split(' ');
const PLF='name ai seat hand city res pts workers lost season passed dep'.split(' ');
const pageCheck=T=>{const out=[];const v=NET.mySeat;if(!G||NET.gid!==T.gid)return out;
  for(const el of document.querySelectorAll('[data-owner][data-up="1"]')){const o=+el.getAttribute('data-owner');if(o!==v)out.push('dom: hand of seat '+o+' drawn face up on the page of seat '+v)}
  if(NET.role==='client'){
    G.players.forEach((p,i)=>{if(i!==v&&p.hand.some(c=>c!==-1))out.push('state: hand of seat '+i+' present')});
    if(G.deck.some(c=>c!==-1))out.push('state: deck present');if(G.rng||G.seed)out.push('state: rng/seed present');if(G.ag&&G.ag.length)out.push('state: agenda present');
    for(const k of Object.keys(G))if(!ALLOWED.includes(k))out.push('state: unlisted field '+k);
    for(const t of (NET.trace||[])){const o=JSON.parse(t);if(!o.g)continue;const g=o.g,s=o.seat;
      for(const k of Object.keys(g))if(!ALLOWED.includes(k))out.push('packet: unlisted field '+k);
      g.players.forEach((p,i)=>{for(const k of Object.keys(p))if(!PLF.includes(k))out.push('packet: player field '+k);if(i!==s&&p.hand.some(c=>c!==-1))out.push('packet: hand of seat '+i+' (packet for seat '+s+')')});
      if(g.deck.some(c=>c!==-1))out.push('packet: deck');if(g.rng||g.seed)out.push('packet: rng/seed');if(g.ag&&g.ag.length)out.push('packet: agenda');
      if(g.lpriv>=0&&g.lpriv!==s&&g.limbo.some(c=>c!==-1))out.push('packet: private limbo');
      for(const e of g.sev)if(e.hid&&e.o!==s&&e.tuck.some(c=>c!==-1))out.push('packet: tucked cards');
      if(g.q&&g.q.who!==s&&(g.q.opts.length||g.q.title))out.push('packet: question data of another seat');
      if(s>=0&&g.players[s].hand.some(c=>c<0))out.push('packet: own hand hidden')}
    if(NET.trace&&NET.trace.length>30)NET.trace=NET.trace.slice(-12)}
  return out};
const dbg={game:0,qFor:{},qSeen:0,qLeak:0,doOnOther:0};
async function play(P,H,secs,hook){let clicks=0,remoteClicks=0,checks=0;const viol=[];const t0=Date.now();let n=0,lastK='',lastT=Date.now();
  while(Date.now()-t0<secs*1000){const g=await H.p.evaluate(()=>G&&{over:G.phase==='over',turn:G.turn,k:G.logN+'/'+G.phase+'/'+HB.actor(G),q:G.q&&{who:G.q.who,kind:G.q.kind,human:!G.players[G.q.who].ai}}).catch(()=>null);if(!g||g.over)break;
    if(g.k!==lastK){lastK=g.k;lastT=Date.now()}else if(Date.now()-lastT>40000){lastT=Date.now();const v=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({seat:NET.mySeat,k:G&&G.logN+'/'+HB.actor(G),rx:NET.rx,bad:NET.bad,badE:NET.badE,rej:NET.rejected,peers:NET.peers.length,pop:UI.pop&&UI.pop.kind,cards:UI.cards.length})).catch(e=>String(e))));console.log('STALL?',JSON.stringify(g),JSON.stringify(v))}
    // a pending question of a human seat: only that seat's page has the options
    if(g.q&&g.q.human){const key=dbg.game+'/'+g.k;if(!dbg.qFor[key]){dbg.qFor[key]=1;await sleep(500);const seen=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({role:NET.role,seat:NET.mySeat,btn:document.querySelectorAll('#pc:not([hidden]) [data-a=q]').length,opts:G.q?G.q.opts.length:-1,who:G.q&&G.q.who,txt:document.getElementById('prompt').textContent})).catch(()=>null)));
        for(const s of seen)if(s&&s.who!=null&&s.who===g.q.who){if(s.seat===s.who){if(s.btn&&s.opts)dbg.qSeen++}else if(s.btn||(s.opts>0&&s.role==='client')){dbg.qLeak++;if(!dbg.leakInfo)dbg.leakInfo=JSON.stringify({s,q:g.q})}}}}
    if(hook&&global.HOOK_FIRST)await hook(g,n);
    for(const x of P){if(x.dead||global.FREEZE===x||global.FREEZE===1)continue;const k=await x.p.evaluate(tick).catch(e=>{x.errs.push(x.label+' tick '+e.message);return 0});clicks+=k;if(x!==H)remoteClicks+=k}
    if(++n%6===0){const T=await H.p.evaluate(hostTruth).catch(()=>null);if(T)for(const x of P){if(x.dead)continue;const o=await x.p.evaluate(pageCheck,T).catch(()=>[]);checks++;if(o.length&&viol.length<8)viol.push(x.label+': '+o.slice(0,3).join('; '))}}
    if(hook&&!global.HOOK_FIRST)await hook(g,n);await sleep(global.DELAY||40)}
  return {clicks,remoteClicks,checks,viol,secs:Math.round((Date.now()-t0)/1000)}}
async function again(P,H){// the host dismisses the final cards, presses Play again; clients must show a fresh game
  for(let k=0;k<30;k++){const a=await H.p.evaluate(()=>{const b=document.querySelector('#pc:not([hidden]) [data-a=again]');if(b){b.click();return 1}const c=document.querySelector('#pc:not([hidden]) [data-a=cont]');if(c)c.click();return 0});if(a)break;await sleep(150)}
  for(let k=0;k<80;k++){await sleep(250);const ok=await Promise.all(P.filter(x=>!x.dead&&x!==H).map(x=>x.p.evaluate(()=>G&&G.phase!=='over'&&G.turn<=1&&UI.started).catch(()=>false)));if(ok.every(Boolean))break}}
async function games(P,H,tag,max,secs,done,hook){const out=[];for(let g=0;g<max;g++){dbg.game=g;const pr=await play(P,H,secs,hook);const r=await finish(P,H,tag+' #'+(g+1),pr);out.push(r);if(done()||!r.agree)break;await again(P,H)}return out}
const seatOf=async x=>{x.seat=await x.p.evaluate(()=>NET.mySeat).catch(()=>-2);return x.seat};
async function finish(P,H,tag,extra){await sleep(800);const alive=P.filter(x=>!x.dead);for(const x of alive)await seatOf(x);
  for(let k=0;k<60;k++){const hs=await H.p.evaluate(()=>G.logN);const ok=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(l=>G&&G.phase==='over'&&G.logN===l,hs).catch(()=>false)));if(ok.every(Boolean))break;await sleep(400)}
  const sum=()=>({over:G.phase==='over',win:G.over&&G.over.winner,tie:G.over&&G.over.tie,scores:G.over&&G.over.scores.map(s=>s.total).join(','),turn:G.turn,logN:G.logN,seat:NET.mySeat,role:NET.role,names:G.players.map(p=>p.name+(p.ai?'(cpu)':'')),view:JSON.stringify(G.players.map(p=>[p.res,p.pts,p.city.map(e=>e.id),p.dep,p.season,p.hand.length]))+JSON.stringify([G.meadow,G.bev,G.sev.map(e=>[e.k,e.o]),G.deck.length,G.discard.length]),doOnOther:window.__doOnOther||0});
  const hs=await H.p.evaluate(sum);const cs=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(sum).catch(()=>null)));
  const agree=cs.every(c=>c&&c.over&&c.win===hs.win&&c.scores===hs.scores&&c.turn===hs.turn&&c.logN===hs.logN&&c.view===hs.view);
  // each client's whole state equals what the host's netStrip gives for that seat
  const exact=await Promise.all(alive.filter(x=>x!==H).map(async x=>{const j=await x.p.evaluate(()=>JSON.stringify(G));const eq=await H.p.evaluate(([j,s])=>{const a=JSON.stringify(netStrip(G,s));if(a===j)return true;let i=0;while(i<a.length&&a[i]===j[i])i++;return 'diff@'+i+' host:'+a.slice(Math.max(0,i-60),i+80)+' | client:'+j.slice(Math.max(0,i-60),i+80)},[j,x.seat]).catch(()=>false);if(eq!==true)dbg.exactInfo=String(eq);return eq===true}));
  const stats=await H.p.evaluate(()=>({remote:NET.remote,rejected:NET.rejected,rejLog:NET.rejLog.slice(-6),inv:HB.checkInvariants(G).length}));const errors=P.flatMap(x=>x.errs);
  const doOn=hs.doOnOther+cs.reduce((n,c)=>n+(c?c.doOnOther:0),0);
  const r=Object.assign({tag,host:{win:hs.win,tie:hs.tie,scores:hs.scores,turn:hs.turn,names:hs.names},clients:cs.map(c=>c&&{seat:c.seat,over:c.over}),agree,exactStrip:exact.every(Boolean),exactInfo:dbg.exactInfo,hostStats:stats,doOnOther:doOn,dbg:{qSeen:dbg.qSeen,qLeak:dbg.qLeak,leak:dbg.leakInfo}},extra||{},{errors:errors.slice(0,10),nErrors:errors.length});
  console.log(JSON.stringify(r));return r}
async function layout(x,tag){// phone/desktop: the online badge fits, nothing covers the board
  const r=await x.p.evaluate(()=>{const R=s=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]};
    const ov=(A,B)=>A&&B&&A[0]<B[2]-.5&&A[2]>B[0]+.5&&A[1]<B[3]-.5&&A[3]>B[1]+.5;const board=R('#board'),st=R('#netst'),bar=R('.gx-bar');const bad=[];
    if(!st)bad.push('no badge');else{if(ov(st,board))bad.push('badge over board');if(st[0]<-.5||st[2]>innerWidth+.5)bad.push('badge off screen');if(st[3]-st[1]<(document.documentElement.classList.contains('ph')?43.9:28))bad.push('badge too small '+(st[3]-st[1]));
      for(const b of document.querySelectorAll('.gx-bar button:not(#netst)')){const r=b.getBoundingClientRect();if(r.width&&ov(st,[r.left,r.top,r.right,r.bottom]))bad.push('badge overlaps '+(b.dataset.gx||b.id))}}
    let n=0;for(const e of document.querySelectorAll('.tile,.mc:not(.empty)')){n++;const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);if(!hit||!e.contains(hit))bad.push('covered '+(e.dataset.k||'mc')+e.dataset.i+' by '+(hit&&(hit.id||hit.className)))}
    const pr=document.querySelector('#prompt');const prr=pr&&pr.getBoundingClientRect();if(!prr||prr.width<40)bad.push('prompt too narrow '+(prr&&prr.width));
    return {bad:bad.slice(0,6),w:document.documentElement.scrollWidth,vw:innerWidth,h:document.documentElement.scrollHeight,vh:innerHeight,st,pw:prr&&Math.round(prr.width),txt:(document.querySelector('#netst')||{}).textContent}});
  const probs=[...r.bad];if(r.w>r.vw+1||r.h>r.vh+1)probs.push('page scroll '+r.w+'x'+r.h);console.log('layout',tag,x.label,JSON.stringify(r),probs.length?'PROBLEMS '+probs:'ok');return probs}
(async()=>{relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(600);
b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const res=[];
try{
if(SC==='full'){const {H,C}=await setup(1,{np:2});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);
  const lp=[];await sleep(1500);for(const x of P)lp.push(...await layout(x,'mid-start'));
  res.push(...await games(P,H,'host+1, 2 seats, Play again',2,260,()=>false));res.forEach(r=>{if(lp.length)r.nErrors+=lp.length})}
else if(SC==='full2'){const {H,C}=await setup(2,{np:4});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);
  const lp=[];await sleep(1500);for(const x of P)lp.push(...await layout(x,'mid-start'));
  const pr=await play(P,H,270);const r=await finish(P,H,'host+2 +1 computer (4 seats)',pr);r.nErrors+=lp.length;res.push(r)}
else if(SC==='full3'){const {H,C}=await setup(3,{np:4});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);const pr=await play(P,H,270);res.push(await finish(P,H,'host+3 (4 humans)',pr))}
else if(SC==='ui'){const {H,C}=await setup(1,{np:3});const vis=x=>x.p.evaluate(()=>!document.getElementById('netbox').hidden);const out={};
  out.openAtStart=await vis(H);await H.p.keyboard.press('Escape');out.afterEsc=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());out.reopened=await vis(H);await H.p.mouse.click(3,3);out.afterBackdrop=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netclose]').click());out.afterX=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netcopy]').click());await sleep(300);out.copy=await H.p.evaluate(()=>({copied:NET.copied,active:document.activeElement&&document.activeElement.className}));
  out.link=await H.p.evaluate(()=>document.querySelector('.invlink').value);out.code=await H.p.evaluate(()=>NET.code);out.clientEsc=await (async()=>{await C[0].p.keyboard.press('Escape');return vis(C[0])})();
  out.players=await H.p.evaluate(()=>[...document.querySelectorAll('#netbox .plist li')].map(e=>e.textContent));out.startCard=await C[0].p.evaluate(()=>document.querySelector('#start .scard').textContent.slice(0,120));
  out.noDevOnline=await H.p.evaluate(()=>!document.querySelector('[data-start=hot]'));
  const ok=out.openAtStart&&!out.afterEsc&&out.reopened&&!out.afterBackdrop&&!out.afterX&&new RegExp('#join-'+out.code+'$').test(out.link)&&/^[a-z0-9]{5}$/.test(out.code)&&!out.clientEsc&&out.players.some(t=>/Hosty.*host/.test(t))&&out.players.some(t=>/Friend1/.test(t))&&out.noDevOnline;
  console.log('UI',JSON.stringify(out));res.push({tag:'ui',agree:ok,errors:[...H.errs,...C[0].errs],nErrors:H.errs.length+C[0].errs.length})}
else if(SC==='leave'){global.DELAY=250;const {H,C,code}=await setup(2,{np:4});const P=[H,...C];await H.p.evaluate(()=>{AIDELAY=300});await startHost(H);for(const x of P)await seatOf(x);const ev={};
  const hook=async(g,n)=>{
    if(!ev.bad&&g.turn>=2&&g.k.split('/')[2]===String(C[1].seat)&&!g.q){ev.bad=true;global.FREEZE=1;await sleep(600);
      const act=await H.p.evaluate(()=>{const a=HB.actor(G);return {a,mv:HB.moves(G,a).find(m=>m.type==='pass')||HB.moves(G,a)[0]||null}});
      const before=await H.p.evaluate(()=>({n:G.logN,rej:NET.rejected,remote:NET.remote,turn:G.turn,cur:G.cur}));
      // 1) malformed / illegal actions from the seat whose turn it is
      await C[1].p.evaluate(()=>{const R=NET.room,h=NET.hostPeer;const junk=[null,5,'x',[1,2],{m:null},{m:'x'},{m:[]},{m:{}},{m:{type:5}},{m:{type:'worker'}},{m:{type:'worker',k:'basic',i:99}},{m:{type:'worker',k:'basic',i:{a:1}}},{m:{type:'play',card:-1,from:'hand',how:'pay'}},{m:{type:'play',card:9999,from:'meadow',how:'pay'}},{m:{type:'choose',i:99}},{m:{type:'choose',i:-1}},{m:{type:'pass',extra:[1]}},
          {m:JSON.parse('{"__proto__":{"x":1},"type":"pass"}')},{m:{type:'pass',pad:'x'.repeat(5000)}},{hi:1},{m:{type:'prepare'},n:-5},{m:{type:'pass'},n:'x'}];
        for(const j of junk){R.sendTo(h,'act',j);R.emit('act',j)}R.emit('st',{s:1e9,i:0,n:1,d:'zzzz'});R.emit('st',{junk:1});R.sendTo(h,'st',{s:1e9,i:0,n:1,d:'zzzz'})});
      await sleep(1200);const mid=await H.p.evaluate(()=>({n:G.logN,rej:NET.rejected,remote:NET.remote,inv:HB.checkInvariants(G).length,pol:({}).x!==undefined}));
      // 2) a perfectly legal move of that seat, sent by ANOTHER client (out of turn / not the owner)
      await C[0].p.evaluate(mv=>{NET.room.sendTo(NET.hostPeer,'act',{m:mv,n:0});NET.room.sendTo(NET.hostPeer,'act',{m:mv})},act.mv);
      await sleep(1200);const after=await H.p.evaluate(()=>({n:G.logN,rej:NET.rejected,remote:NET.remote,inv:HB.checkInvariants(G).length,pol:({}).x!==undefined,turn:G.turn}));
      ev.badResult={junkRejected:mid.rej-before.rej,impostorRejected:after.rej-mid.rej,stateUnchanged:after.n===before.n&&after.remote===before.remote,invariants:after.inv,protoPolluted:after.pol};global.FREEZE=0}
    if(!ev.left&&g.turn>=4){ev.left=true;ev.seat=await C[0].p.evaluate(()=>NET.mySeat);ev.uid=await C[0].p.evaluate(()=>NetRoom.uid());await C[0].ctx.close();C[0].dead=true;
      let away=false;for(let k=0;k<80&&!away;k++){await sleep(250);away=await H.p.evaluate(s=>!!G.players[s].ai&&NET.away[s],ev.seat)}ev.leave={seat:ev.seat,aiTookOver:away};ev.leftAt=Date.now()}
    if(ev.left&&!ev.rejoin&&Date.now()-ev.leftAt>3000){ev.rejoin=true;const cx=await ctxNew();await cx.addInitScript(u=>{try{localStorage.setItem('gns-uid',u);localStorage.setItem('gns-name','Friend1')}catch(e){}},ev.uid);const x=await page(cx,'c1-again','#join-'+code);
      const pre=await x.p.evaluate(()=>({code:UI.joinCode,onl:UI.onl,open:document.querySelector('#onl').open,field:document.getElementById('joincode').value}));await x.p.evaluate(()=>{AIDELAY=80;document.querySelector('[data-a=netjoin]').click()});
      let back=false;for(let k=0;k<200&&!back;k++){await sleep(250);back=await H.p.evaluate(s=>!G.players[s].ai&&!NET.away[s],ev.seat)}
      const mine=await x.p.evaluate(()=>({seat:NET.mySeat,g:!!G,started:UI.started}));ev.rejoinRes={prefilled:pre,back,mine};P.push(x);x.seat=mine.seat;ev.remoteBefore=await H.p.evaluate(()=>NET.remote);ev.xBefore=0}};
  const pr=await play(P,H,270,hook);const remAfter=await H.p.evaluate(()=>NET.remote);const rj=P[P.length-1];
  const rjMoves=ev.rejoin?await rj.p.evaluate(()=>NET.sent):0;
  const r=await finish(P,H,'host+2: bad actions, leave, rejoin',Object.assign(pr,{bad:ev.badResult,leave:ev.leave,rejoin:ev.rejoinRes,remoteMovesAfterRejoin:remAfter-(ev.remoteBefore||0),rejoinedClientSent:rjMoves}));
  const ok=ev.badResult&&ev.badResult.junkRejected>=15&&ev.badResult.impostorRejected>=1&&ev.badResult.stateUnchanged&&!ev.badResult.invariants&&!ev.badResult.protoPolluted&&ev.leave&&ev.leave.aiTookOver&&ev.rejoinRes&&ev.rejoinRes.back&&ev.rejoinRes.prefilled.field===code&&rjMoves>0;if(!ok)r.agree=false;res.push(r)}
else if(SC==='touch'){const {H,C}=await setup(1,{np:2});const P=[H,...C];await startHost(H);for(const x of P)await seatOf(x);const c=C[0];const out={};
  const wait=async f=>{for(let k=0;k<200;k++){if(await c.p.evaluate(f).catch(()=>false))return true;await sleep(150)}return false};
  await wait(()=>NET.mySeat===1&&UI.started);
  // badge -> lobby -> X, all by touch
  const r0=await c.p.evaluate(()=>{const r=document.querySelector('#netst').getBoundingClientRect();return [r.width,r.height]});out.badge=r0;await c.p.tap('#netst');await sleep(300);out.lobbyOpen=await c.p.evaluate(()=>!document.getElementById('netbox').hidden);
  const xr=await c.p.evaluate(()=>{const r=document.querySelector('#netbox .lbx').getBoundingClientRect();return [r.width,r.height]});out.xSize=xr;await c.p.tap('#netbox .lbx');await sleep(300);out.lobbyClosed=await c.p.evaluate(()=>document.getElementById('netbox').hidden);
  // wait for the client's turn, then play by touch: a legal tile, its Place worker button
  let moves=0;const n0=await H.p.evaluate(()=>NET.remote);
  for(let k=0;k<600&&moves<6;k++){await H.p.evaluate(tick).catch(()=>0);const st=await c.p.evaluate(()=>G&&G.phase!=='over'&&HB.actor(G)===NET.mySeat&&!G.q);if(!st){await sleep(60);continue}
    await c.p.evaluate(()=>{UI.noRec=true});const t=await c.p.$('.tile.ok');if(!t){const pr=await c.p.$('#acts [data-a=prep]:not([disabled])');if(pr){await pr.tap();await sleep(250);const d=await c.p.$('#ppop [data-a=do]');if(d){await d.tap();moves++}}else{const ps=await c.p.$('#acts [data-a=pass]:not([disabled])');if(ps){await ps.tap();await sleep(250);const d=await c.p.$('#ppop [data-a=do]');if(d){await d.tap();moves++}}}await sleep(400);continue}
    await t.tap();await sleep(250);const d=await c.p.$('#ppop [data-a=do]');if(d){const before=await H.p.evaluate(()=>G.logN);await d.tap();moves++;for(let j=0;j<60;j++){await sleep(150);if(await H.p.evaluate(b=>G.logN>b,before))break}}await sleep(300)}
  out.touchMoves=moves;out.hostRemote=(await H.p.evaluate(()=>NET.remote))-n0;
  out.probs=await layout(c,'touch');res.push({tag:'touch',agree:moves>=4&&out.hostRemote>=moves-1&&out.lobbyOpen&&out.lobbyClosed&&out.badge[0]>=43.9&&out.badge[1]>=43.9&&out.xSize[0]>=43.9&&!out.probs.length,out,errors:[...H.errs,...c.errs],nErrors:H.errs.length+c.errs.length});console.log(JSON.stringify(res[res.length-1]))}
else if(SC==='hostleft'){const {H,C}=await setup(1,{np:3});const P=[H,...C];await startHost(H);
  await play(P,H,200,async g=>{if(g.turn>=3)throw 'stop'}).catch(e=>{if(e!=='stop')throw e});
  await H.p.close();H.dead=true;let msg='';for(let k=0;k<120&&!msg;k++){await sleep(300);msg=await C[0].p.evaluate(()=>NET.hostGone?NET.err:'')}
  const vis=await C[0].p.evaluate(()=>({modal:!document.getElementById('netbox').hidden,text:document.getElementById('netbox').textContent.slice(0,200)}));
  res.push({tag:'host leaves',msg,vis,agree:!!msg&&vis.modal&&/host left/i.test(vis.text),errors:C[0].errs,nErrors:C[0].errs.length});console.log(JSON.stringify(res[res.length-1]));
  await C[0].p.evaluate(()=>document.querySelector('[data-a=netleave]').click());await sleep(800);console.log('after leave',JSON.stringify(await C[0].p.evaluate(()=>({on:NET.on,start:!document.getElementById('start').hidden}))))}
else if(SC==='shots'){const SH=__dirname+'/../hollowbough/game/shots';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}const {H,C}=await setup(1,{np:3});const tag=PHONE?'ph':'desk';
  const P=[H,...C];await sleep(500);await H.p.screenshot({path:`${SH}/net_${tag}_lobby_host.png`});await C[0].p.screenshot({path:`${SH}/net_${tag}_lobby_client.png`});
  await H.p.evaluate(()=>netClose());await sleep(300);await H.p.screenshot({path:`${SH}/net_${tag}_start_inroom.png`});await H.p.evaluate(()=>{UI.netOpen=true;netRender()});await startHost(H);
  let shot=0;await play(P,H,120,async(g,n)=>{if(shot<2&&g.turn>=3&&n%10===0){await sleep(500);await C[0].p.screenshot({path:`${SH}/net_${tag}_client_${shot}.png`});await H.p.screenshot({path:`${SH}/net_${tag}_host_${shot}.png`});for(const x of P)await layout(x,'shot'+shot);shot++}});
  console.log('errors',JSON.stringify([H,...C].flatMap(x=>x.errs).slice(0,10)))}
}catch(e){console.log('HARNESS ERROR',e&&e.stack||e);res.push({tag:'harness',agree:false,nErrors:1})}
await b.close();relay.kill();
const bad=res.filter(r=>!r.agree||r.nErrors||(r.viol&&r.viol.length)||r.exactStrip===false||r.doOnOther||(r.dbg&&r.dbg.qLeak));console.log('SUMMARY',SC,PHONE?'phone':'desktop',res.length,'runs,',bad.length,'bad');process.exit(0)})();
