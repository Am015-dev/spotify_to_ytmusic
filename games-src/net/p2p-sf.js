// Real WebRTC test for Short Fuse: host + clients in separate Chromium contexts, local Nostr relay (port 17731). Pages use the kit's 2D board (?2d).
// PW=$(npm root -g)/playwright node net/p2p-sf.js bb/game/shortfuse.html SCENARIO
//   SCENARIO: full1 (host+1, 2 jobs) | full2 (host+2) | leave (host+2: bad actions, leave, rejoin) | hostleft | claim (job 10) | shots
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],SC=process.argv[3]||'full1';const html=fs.readFileSync(file);const PORT=+process.env.PORT||17731;
const SHOTS=__dirname+'/../bb/game/shots';try{fs.mkdirSync(SHOTS,{recursive:true})}catch(e){}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let b,relay;
async function page(ctx,label,hash){const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(label+' pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(label+' console: '+m.text())});
  await p.goto('https://gns.test/?2d'+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});
  await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready&&typeof UI!=='undefined'&&UI.setup,null,{timeout:120000,polling:300});return {p,ctx,label,errs}}
async function ctxNew(w,h){const c=await b.newContext({viewport:{width:w||1100,height:h||760}});
  await c.addInitScript(port=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];window.NET_TRACE=1;try{localStorage.setItem('sf_gfx','low')}catch(e){}},PORT);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});return c}
async function setup(ncl,opt){const H=await page(await ctxNew(),'host');const C=[];for(let i=0;i<ncl;i++)C.push(await page(await ctxNew(),'c'+(i+1)));
  console.log('host',JSON.stringify(await H.p.evaluate(()=>({avail:netAvail(),trystero:typeof Trystero}))));
  await H.p.evaluate(o=>{AIDELAY=150;UI.setup.job=o.job;UI.setup.np=o.np;if(o.lv)UI.setup.lv=o.lv;fixSetup();document.querySelector('#onl').open=true;document.getElementById('netname').value='Hosty';document.querySelector('[data-a=nethost]').click()},opt);
  let code='';for(let k=0;k<60&&!code;k++){await sleep(100);code=await H.p.evaluate(()=>NET.on?NET.code:'')}
  for(const [i,c] of C.entries())await c.p.evaluate(([code,i])=>{AIDELAY=150;document.querySelector('#onl').open=true;document.getElementById('netname').value='Friend'+(i+1);document.getElementById('joincode').value=code;document.querySelector('[data-a=netjoin]').click()},[code,i]);
  const t0=Date.now();while(Date.now()-t0<40000){const n=await H.p.evaluate(()=>NET.peers.length);const m=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.peers.length)));if(n>=ncl+1&&m.every(x=>x>=ncl+1))break;await sleep(250)}
  await sleep(1500);const lobby=await H.p.evaluate(()=>lobbyPlayers().map(p=>p.nm));const cl=await Promise.all(C.map(c=>c.p.evaluate(()=>({open:UI.netOpen,pl:lobbyPlayers().map(p=>p.nm),opt:!!NET.opt,hostPeer:!!NET.hostPeer}))));
  console.log('lobby after',Date.now()-t0,'ms host sees',JSON.stringify(lobby),'clients see',JSON.stringify(cl));return {H,C,code}}
const startHost=H=>H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());
// one random click through the page's own buttons / board tiles (a port of click.js's clicker for a single seat)
const tick=()=>{if(!G||G.over||!UI.started)return 0;const d=document,rnd=a=>a[Math.floor(Math.random()*a.length)],R=Math.random,q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled);const click=el=>{el.click();return 1};
  const qs=q('#main [data-a=q]');if(qs.length){const tiles=[...d.querySelectorAll('#fb .sf2d-hl')];if(tiles.length&&R()<.5)return click(rnd(tiles));return click(rnd(qs))}
  const main=d.getElementById('main');const has=s=>q('#main '+s);
  const off=has('[data-a=off]');if(off.length&&R()<.6)return click(rnd(off));
  const par=has('[data-a=param],[data-a=pickmove]');if(par.length)return click(rnd(par));
  const ch=has('[data-a=choose]');if(ch.length)return click(ch[0]);
  const dm=main.querySelector('[data-a=domulti]');const tiles=[...d.querySelectorAll('#fb .sf2d-hl')];
  if(dm&&!dm.disabled)return click(dm);if(main.textContent.includes('Tap ')&&dm){if(R()<.08){const c=main.querySelector('[data-a=cancel]');if(c)return click(c)}if(tiles.length)return click(rnd(tiles))}
  if(main.querySelector('[data-a=dual],.vb')||main.querySelector('.steps')){
    const sg0=q('#tip [data-a=sugg]');if(sg0.length&&!main.querySelector('.vb.sel')&&R()<.92)return click(sg0[0]);
    const go=has('[data-a=dual]');if(go.length&&R()<.85)return click(go[0]);
    const vb=has('[data-a=v],[data-a=v2]');if(vb.length&&R()<.7)return click(rnd(vb));
    const sg=has('[data-a=sugg]').concat(q('#tip [data-a=sugg]'));if(sg.length&&R()<.45)return click(sg[0]);
    const solo=has('[data-a=solo]');if(solo.length&&R()<.5)return click(rnd(solo));
    const oth=has('[data-a=grp],[data-a=multi],[data-a=tool],[data-a=two],[data-a=flipmode],[data-a=fu]');if(oth.length&&R()<.25)return click(rnd(oth));
    if(tiles.length)return click(rnd(tiles));const can=has('[data-a=cancel]');if(can.length&&R()<.3)return click(can[0])}
  else{const can=has('[data-a=cancel]');if(can.length&&R()<.2)return click(can[0])}return 0};
// hidden-information check of ONE page against the host's real state: returns a list of violations
const hostTruth=()=>({st:G.st.map(s=>({pos:s.pos,w:s.w.map(x=>({id:x.id,cut:x.cut,flip:x.flip}))})),pos:G.pos,box:G.box.slice(),pile:G.pile.slice(),aside:G.aside.slice(),robot:G.robot?G.robot.w.slice():[],rng:G.rng,seed:G.seed,mission:G.mission,gid:G.gid});
const pageCheck=T=>{const v=NET.role==='host'?NET.mySeat:NET.mySeat;const out=[];if(!G||G.mission!==T.mission||G.st.length!==T.st.length||G.gid!==T.gid)return out;
  const vis=(si,k)=>{const sl=T.st[si].w[k];if(sl.cut||G.st[si].w[k].cut)return true;if(v<0)return false;const own=T.pos[v]===T.st[si].pos;return (own&&!sl.flip)||(!own&&sl.flip)};
  if(NET.role==='client'){for(const [si,s] of T.st.entries())for(const [k,sl] of s.w.entries())if(!vis(si,k)&&G.st[si].w[k].id!==0)out.push('state: hidden wire '+si+'/'+k+' present');
    if(G.pile.some(x=>x)||G.box.some(x=>x)||G.aside.some(x=>x)||(G.robot&&G.robot.w.some(x=>x)))out.push('state: pile/box/aside/robot present');
    if(G.rng!==undefined||G.seed!==0)out.push('state: rng/seed present');
    for(const t of (NET.trace||[])){const o=JSON.parse(t);if(!o.g)continue;const g=o.g;if('rng' in g||g.seed!==0)out.push('trace: rng/seed');
      for(const [si,s] of T.st.entries())if(g.st[si]&&g.st[si].w.length===s.w.length)for(const [k,sl] of s.w.entries()){const seat=o.seat;const own=seat>=0&&g.pos[seat]===g.st[si].pos;const seen=g.st[si].w[k].cut||(seat>=0&&((own&&!g.st[si].w[k].flip)||(!own&&g.st[si].w[k].flip)));if(!seen&&g.st[si].w[k].id!==0)out.push('trace: hidden id in a packet')}
      if(g.q&&g.q.who!==o.seat&&g.q.opts&&g.q.opts.length)out.push('trace: other seat question options');if(o.seat>=0&&g.ag&&g.ag.length)out.push('trace: agenda queue')}}
  // the DOM board: no uncut wire the viewer may not see is drawn face up (host and clients)
  for(const el of document.querySelectorAll('#fb .sf2d-t')){const p=JSON.parse(el.getAttribute('data-sf'));const u=+String(p.id).replace(/^.*u/,'');const f=findU(u);if(!f||f.sl.cut)continue;const own=ownerOf(f.s);const may=v>=0&&((own===v&&!f.sl.flip)||(own!==v&&f.sl.flip));if(!may&&(!el.classList.contains('back')||p.value!=null))out.push('dom: wire of seat '+own+' shown')}
  if(NET.role==='client'&&NET.trace&&NET.trace.length>40)NET.trace=NET.trace.slice(-20);return out};
async function play(P,H,secs,hook){let clicks=0,remoteClicks=0,checks=0;const viol=[];const t0=Date.now();let n=0,lastK='',lastT=Date.now();
  while(Date.now()-t0<secs*1000){const g=await H.p.evaluate(()=>G&&{over:!!G.over,turn:G.turn,k:G.logN+'/'+G.phase+'/'+sideToAct()+'/'+G.clock}).catch(()=>null);if(!g||g.over)break;
    if(g.k!==lastK){lastK=g.k;lastT=Date.now()}else if(Date.now()-lastT>40000){lastT=Date.now();const v=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({seat:NET.mySeat,k:G&&G.logN+'/'+sideToAct(),main:document.getElementById('main').textContent.slice(0,80),rx:NET.rx,bad:NET.bad,badE:NET.badE,rej:NET.rejected,hp:NET.hostPeer,peers:NET.peers.length})).catch(e=>String(e))));console.log('STALL?',JSON.stringify(g),JSON.stringify(v))}
    for(const x of P){if(x.dead||global.FREEZE)continue;const k=await x.p.evaluate(tick).catch(e=>{x.errs.push(x.label+' tick '+e.message);return 0});clicks+=k;if(x!==H)remoteClicks+=k}
    if(++n%6===0){const T=await H.p.evaluate(hostTruth).catch(()=>null);if(T)for(const x of P){if(x.dead)continue;const o=await x.p.evaluate(pageCheck,T).catch(()=>[]);checks++;if(o.length&&viol.length<8)viol.push(x.label+': '+o.slice(0,3).join('; '))}}
    if(hook)await hook(g,n);await sleep(global.DELAY||40)}
  return {clicks,remoteClicks,checks,viol,secs:Math.round((Date.now()-t0)/1000)}}
async function finish(P,H,tag,extra){await sleep(800);const alive=P.filter(x=>!x.dead);
  for(let k=0;k<60;k++){const hs=await H.p.evaluate(()=>G.logN);const ok=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(l=>G&&G.over&&G.logN===l,hs).catch(()=>false)));if(ok.every(Boolean))break;await sleep(400)}
  const sum=()=>({over:!!G.over,win:G.winText,turn:G.turn,dial:G.dial,logN:G.logN,seat:NET.mySeat,role:NET.role,why:G.over&&G.over.why,know:JSON.stringify(knowledge(NET.mySeat)),names:G.seats.map(q=>q.nm+(q.human?'':'(cpu)'))});
  const hs=await H.p.evaluate(sum);const cs=await Promise.all(alive.filter(x=>x!==H).map(x=>x.p.evaluate(sum).catch(()=>null)));
  // the host's own knowledge(seat) for each client's seat equals what that client computed from its stripped copy
  const hk=await Promise.all(cs.map(c=>c?H.p.evaluate(s=>JSON.stringify(knowledge(s)),c.seat):null));
  const agree=cs.every((c,i)=>c&&c.over&&c.win===hs.win&&c.turn===hs.turn&&c.dial===hs.dial&&c.logN===hs.logN&&c.know===hk[i]);
  const stats=await H.p.evaluate(()=>({remote:NET.remote,rejected:NET.rejected}));const errors=P.flatMap(x=>x.errs);
  const r=Object.assign({tag,host:{over:hs.over,win:hs.win,why:hs.why,turns:hs.turn,dial:hs.dial,names:hs.names},clients:cs.map(c=>c&&{seat:c.seat,over:c.over}),agree,hostStats:stats},extra||{},{errors:errors.slice(0,10),nErrors:errors.length});
  console.log(JSON.stringify(r));return r}
(async()=>{relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(600);
b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const res=[];
try{
if(SC==='full1'){const {H,C}=await setup(1,{job:3,np:3});const P=[H,...C];await startHost(H);
  let pr=await play(P,H,300);res.push(await finish(P,H,'host+1 job 3',pr));
  // second job through the host's "Play again" button
  await H.p.evaluate(()=>document.querySelector('[data-a=again]').click());await sleep(1500);
  const st=await C[0].p.evaluate(()=>({over:!!G.over,seat:NET.mySeat,turn:G.turn}));console.log('client after replay',JSON.stringify(st));
  pr=await play(P,H,300);res.push(await finish(P,H,'host+1 job 3 again',pr))}
else if(SC==='full2'){const {H,C}=await setup(2,{job:4,np:3});const P=[H,...C];await startHost(H);const pr=await play(P,H,420);res.push(await finish(P,H,'host+2 job 4 (3 humans)',pr))}
else if(SC==='full3'){const {H,C}=await setup(2,{job:9,np:4});const P=[H,...C];await startHost(H);const pr=await play(P,H,420);res.push(await finish(P,H,'host+2 job 9 (4 seats, 1 computer)',pr))}
else if(SC==='timed'){const {H,C}=await setup(2,{job:19,np:3});const P=[H,...C];await startHost(H);const pr=await play(P,H,420);const clk=await C[0].p.evaluate(()=>({rt:UI.rt,clock:G.clock,pill:(document.getElementById('timerpill')||{}).textContent}));res.push(await finish(P,H,'host+2 job 19 (timed)',Object.assign(pr,{clientClock:clk})))}
else if(SC==='clock'){const {H,C}=await setup(1,{job:19,np:2});const P=[H,...C];await startHost(H);let done=null;
  await play(P,H,120,async g=>{if(done)throw 'stop';const ph=await H.p.evaluate(()=>G.phase+'/'+!!G.q+'/'+G.clock);if(/^turn\/false/.test(ph)&&g.turn>=1){global.FREEZE=true;const c0=await H.p.evaluate(()=>G.clock);await sleep(7000);
      const h=await H.p.evaluate(()=>({clock:G.clock,pill:(document.getElementById('timerpill')||{}).textContent,paused:UI.pause}));const c=await C[0].p.evaluate(()=>({clock:G.clock,pill:(document.getElementById('timerpill')||{}).textContent}));done={c0,h,c};global.FREEZE=false}}).catch(e=>{if(e!=='stop')throw e});
  console.log('CLOCK',JSON.stringify(done));res.push({tag:'clock',agree:!!(done&&done.h.clock>done.c0&&Math.abs(done.h.clock-done.c.clock)<=2),errors:[...H.errs,...C[0].errs],nErrors:H.errs.length+C[0].errs.length,done})}
else if(SC==='ui'){const {H,C}=await setup(1,{job:4,np:3});const vis=x=>x.p.evaluate(()=>!document.getElementById('netbox').hidden);const out={};
  out.openAtStart=await vis(H);await H.p.keyboard.press('Escape');out.afterEsc=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());out.reopened=await vis(H);await H.p.mouse.click(5,5);out.afterBackdrop=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netclose]').click());out.afterX=await vis(H);
  await H.p.evaluate(()=>document.querySelector('[data-a=netopen]').click());await H.p.evaluate(()=>document.querySelector('[data-a=netcopy]').click());await sleep(300);out.copy=await H.p.evaluate(()=>({copied:NET.copied,active:document.activeElement&&document.activeElement.className}));
  out.link=await H.p.evaluate(()=>document.querySelector('.invlink').value);out.clientEsc=await (async()=>{await C[0].p.keyboard.press('Escape');return vis(C[0])})();
  const ok=out.openAtStart&&!out.afterEsc&&out.reopened&&!out.afterBackdrop&&!out.afterX&&/#join-/.test(out.link)&&!out.clientEsc;console.log('UI',JSON.stringify(out));res.push({tag:'ui',agree:ok,errors:[...H.errs,...C[0].errs],nErrors:H.errs.length+C[0].errs.length})}
else if(SC==='claim'){const {H,C}=await setup(2,{job:10,np:3});const P=[H,...C];await startHost(H);const pr=await play(P,H,420);res.push(await finish(P,H,'host+2 job 10 (racing claims)',pr))}
else if(SC==='leave'){global.DELAY=400;const {H,C,code}=await setup(2,{job:3,np:4});const P=[H,...C];await H.p.evaluate(()=>{AIDELAY=700});await startHost(H);const ev={};
  const hook=async(g,n)=>{
    if(!ev.bad&&g.turn>=2){ev.bad=true;const before=await H.p.evaluate(()=>({t:G.turn,n:G.logN,rej:NET.rejected}));
      await C[1].p.evaluate(()=>{const R=NET.room,h=NET.hostPeer;const junk=[null,5,'x',[1,2],{m:null},{m:'x'},{m:{}},{m:{a:5}},{m:{a:'dual'}},{m:{a:'dual',st:99,ks:[0],v:1}},{m:{a:'dual',st:0,ks:[0],v:99}},{m:{a:'dual',st:'0',ks:'x',v:1}},{m:{a:'solo',v:1}},{m:{a:'q',i:99}},{m:{a:'q',i:-1}},{m:{a:'eq',id:'eq3'}},{m:{a:'multi',kind:'lever',tg:[]}},
          {m:JSON.parse('{"__proto__":{"x":1},"a":"pass"}')},{m:{a:'dual',st:0,ks:[0],v:1,pad:'x'.repeat(5000)}},{hi:1},{m:{a:'reveal'}}];
        for(const j of junk){R.sendTo(h,'act',j);R.emit('act',j)}R.emit('st',{s:1e9,i:0,n:1,d:'zzzz'});R.emit('st',{junk:1});R.sendTo(h,'st',{s:1e9,i:0,n:1,d:'zzzz'})});
      await sleep(1500);const after=await H.p.evaluate(()=>({t:G.turn,n:G.logN,rej:NET.rejected,inv:checkInvariants()}));ev.badResult={logChanged:after.n-before.n,rejectedDelta:after.rej-before.rej,invariants:after.inv.length}}
    if(!ev.left&&g.turn>=3){ev.left=true;ev.seat=await C[0].p.evaluate(()=>NET.mySeat);ev.uid=await C[0].p.evaluate(()=>NetRoom.uid());await C[0].ctx.close();C[0].dead=true;
      let away=false;for(let k=0;k<80&&!away;k++){await sleep(250);away=await H.p.evaluate(s=>!G.seats[s].human&&!!G.seats[s].away,ev.seat)}ev.leave={seat:ev.seat,aiTookOver:away};ev.leftAt=Date.now()}
    if(ev.left&&!ev.rejoin&&Date.now()-ev.leftAt>3000){ev.rejoin=true;const cx=await ctxNew();await cx.addInitScript(u=>{try{localStorage.setItem('gns-uid',u);localStorage.setItem('gns-name','Friend1')}catch(e){}},ev.uid);const x=await page(cx,'c1-again','#join-'+code);
      const pre=await x.p.evaluate(()=>({code:UI.joinCode,onl:UI.onl,open:document.querySelector('#onl').open}));await x.p.evaluate(()=>{AIDELAY=150;document.querySelector('[data-a=netjoin]').click()});
      let back=false;for(let k=0;k<200&&!back;k++){await sleep(250);back=await H.p.evaluate(s=>G.seats[s].human&&!G.seats[s].away,ev.seat)}
      const mine=await x.p.evaluate(()=>({seat:NET.mySeat,g:!!G,started:UI.started}));ev.rejoinRes={prefilled:pre,back,mine};P.push(x);ev.x=x;ev.remoteBefore=await H.p.evaluate(()=>NET.remote)}};
  const pr=await play(P,H,420,hook);const remAfter=await H.p.evaluate(()=>NET.remote);
  res.push(await finish(P,H,'host+2: bad actions, leave, rejoin',Object.assign(pr,{bad:ev.badResult,leave:ev.leave,rejoin:ev.rejoinRes,remoteMovesAfterRejoin:remAfter-(ev.remoteBefore||0)})))}
else if(SC==='hostleft'){const {H,C}=await setup(1,{job:4,np:3});const P=[H,...C];await startHost(H);
  await play(P,H,200,async g=>{if(g.turn>=3)throw 'stop'}).catch(e=>{if(e!=='stop')throw e});
  await H.p.close();H.dead=true;let msg='';for(let k=0;k<120&&!msg;k++){await sleep(300);msg=await C[0].p.evaluate(()=>NET.hostGone?NET.err:'')}
  const vis=await C[0].p.evaluate(()=>({modal:!document.getElementById('netbox').hidden,text:document.getElementById('netbox').textContent.slice(0,200)}));
  res.push({tag:'host leaves',msg,vis,agree:!!msg,errors:C[0].errs,nErrors:C[0].errs.length});console.log(JSON.stringify(res[res.length-1]));
  await C[0].p.evaluate(()=>document.querySelector('[data-a=netleave]').click());await sleep(800);console.log('after leave',JSON.stringify(await C[0].p.evaluate(()=>({on:NET.on,start:!document.getElementById('start').hidden}))))}
else if(SC==='shots'){const {H,C}=await setup(2,{job:4,np:3});
  for(const [w,h] of [[1366,768],[390,844]]){await H.p.setViewportSize({width:w,height:h});await C[0].p.setViewportSize({width:w,height:h});await sleep(800);
    await H.p.screenshot({path:`${SHOTS}/net_lobby_host_${w}x${h}.png`});await C[0].p.screenshot({path:`${SHOTS}/net_lobby_client_${w}x${h}.png`})}
  await H.p.evaluate(()=>netClose());await sleep(500);for(const [w,h] of [[1366,768],[390,844]]){await H.p.setViewportSize({width:w,height:h});await sleep(500);await H.p.screenshot({path:`${SHOTS}/net_start_inroom_${w}x${h}.png`})}
  await H.p.evaluate(()=>{UI.netOpen=true;netRender()});const P=[H,...C];await startHost(H);let shot=0;
  await play(P,H,200,async(g,n)=>{if(shot<2&&g.turn>=3&&n%10===0){for(const [w,h] of [[1366,768],[390,844]]){await C[0].p.setViewportSize({width:w,height:h});await sleep(1200);
        const lay=await C[0].p.evaluate(()=>({sh:document.documentElement.scrollHeight,vh:innerHeight,sw:document.documentElement.scrollWidth,vw:innerWidth,seat:NET.mySeat,cur:sideToAct(),dockt:document.getElementById('dockt').textContent}));console.log('client layout',w,JSON.stringify(lay));
        await C[0].p.screenshot({path:`${SHOTS}/net_client_${w}x${h}_${shot}.png`})}shot++}});
  console.log('errors',JSON.stringify([H,...C].flatMap(x=>x.errs).slice(0,10)))}
}catch(e){console.log('HARNESS ERROR',e&&e.stack||e)}
await b.close();relay.kill();
const bad=res.filter(r=>r.fail||!r.agree||r.nErrors||(r.viol&&r.viol.length));console.log('SUMMARY',SC,res.length,'runs,',bad.length,'bad');process.exit(0)})();
