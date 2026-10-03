// Real WebRTC test for Sunglaze: host + N clients in separate Chromium contexts, local Nostr relay on port 17706.
// PW=$(npm root -g)/playwright node net/p2p-sunglaze.js azul/game/sunglaze.html SCENARIO
//   SCENARIO: full1 (host+1, 2 games) | full2 (host+2) | leave (host+2: leave, rejoin, bad actions) | migrate (host+2: host closes mid-game) | shots
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],SC=process.argv[3]||'full1';const html=fs.readFileSync(file);const PORT=17716;
const SHOTS=__dirname+'/../azul/game/shots';try{fs.mkdirSync(SHOTS,{recursive:true})}catch(e){}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let b,relay;
async function page(ctx,label,hash){const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(label+' pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(label+' console: '+m.text())});
  const t0=Date.now();await p.goto('https://gns.test/sunglaze/?phone=1'+(hash||''),{waitUntil:'commit',timeout:120000});await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready,null,{timeout:240000,polling:500});if(hash)console.log(label,'loaded in',Date.now()-t0,'ms');await sleep(1200);await p.evaluate(()=>{ANIM=0;AIDELAY=60});return {p,errs,label,ctx}}
async function ctxNew(w,h){const c=await b.newContext({viewport:{width:w||390,height:h||844},isMobile:true,hasTouch:true});
  await c.addInitScript(port=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];Object.defineProperty(window,'THREE',{get(){return undefined},set(){},configurable:true});try{localStorage.setItem('sgz_gfx','low')}catch(e){}},PORT);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});return c}
async function setup(ncl,opt){const H=await page(await ctxNew(),'host');const C=[];for(let i=0;i<ncl;i++)C.push(await page(await ctxNew(),'c'+(i+1)));
  const st=await H.p.evaluate(()=>({avail:netAvail(),trystero:typeof Trystero}));console.log('host',JSON.stringify(st));
  await H.p.evaluate(o=>{UI.setup.np=o.np;Object.assign(UI.setup.ex,o.ex||{});if(o.lv)UI.setup.lv=o.lv;document.querySelector('#onl').open=true;document.getElementById('netname').value='Hosty';document.querySelector('[data-a=nethost]').click()},opt);
  let code='';for(let k=0;k<40&&!code;k++){await sleep(100);code=await H.p.evaluate(()=>NET.on?NET.code:'')}
  for(const [i,c] of C.entries())await c.p.evaluate(([code,i])=>{document.querySelector('#onl').open=true;document.getElementById('netname').value='Friend'+(i+1);document.getElementById('joincode').value=code;document.querySelector('[data-a=netjoin]').click()},[code,i]);
  const t0=Date.now();while(Date.now()-t0<30000){const n=await H.p.evaluate(()=>NET.peers.length);const m=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.peers.length)));if(n>=ncl+1&&m.every(x=>x>=ncl+1))break;await sleep(250)}
  await sleep(1500);const lobby=await H.p.evaluate(()=>lobbyPlayers().map(p=>p.nm));const cl=await Promise.all(C.map(c=>c.p.evaluate(()=>({modal:UI.modal,pl:lobbyPlayers().map(p=>p.nm),opt:!!NET.opt}))));
  console.log('lobby after',Date.now()-t0,'ms host sees',JSON.stringify(lobby),'clients see',JSON.stringify(cl));return {H,C,code}}
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];if(!G||G.over)return 0;const q=s=>[...document.querySelectorAll(s)];const ck=e=>{e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 1};
  const c=document.querySelector('#ph-card [data-ph=continue]');if(c&&(PHN.mode==='sum'||PHN.mode==='coach'))return ck(c);
  if(!me())return 0;
  if(G.phase==='wall'){const bs=q('#ph-card [data-cell]');if(bs.length)return ck(rnd(bs));return 0}
  if(Math.random()<.03){const a=document.querySelector('[data-ui=advise]');if(a)return ck(a)}
  if(PHN.mode!=='take'){const t=q('#map2d [data-slot],#map2d [data-kiln]');if(t.length)return ck(rnd(t));return 0}
  if(!UI.sel){const bs=q('#ph-pop [data-ph=pick]');if(bs.length)return ck(rnd(bs));return 0}
  const g=q('#ph-pop .ph-o[data-mv]');if(g.length)return ck(rnd(g));return 0};
async function play(P,H,secs,hook){let clicks=0,remoteClicks=0;const t0=Date.now();let n=0;
  let lastK='',lastT=Date.now();
  while(Date.now()-t0<secs*1000){const g=await H.p.evaluate(()=>G&&{over:!!G.over,turn:G.turn,k:G.logN+'/'+G.phase+'/'+sideToAct()}).catch(()=>null);if(!g||g.over)break;
    if(g.k!==lastK){lastK=g.k;lastT=Date.now()}else if(Date.now()-lastT>45000){lastT=Date.now();const v=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>({l:NET.role,seat:NET.mySeat,me:!!me(),k:G&&G.logN+'/'+G.phase+'/'+sideToAct(),sel:UI.sel,tgt:UI.tgt,pend:NET.pend,age:Date.now()-NET.lastRx,hum:G.pl.map(p=>p.human)})).catch(e=>String(e))));console.log('STALL?',JSON.stringify(v))}
    for(const x of P){if(x.dead)continue;const k=await x.p.evaluate(tick).catch(e=>{x.errs.push(x.label+' tick '+e.message);return 0});clicks+=k;if(x!==H)remoteClicks+=k}
    if(hook)await hook(g,++n);await sleep(40)}
  return {clicks,remoteClicks,secs:Math.round((Date.now()-t0)/1000)}}
const SUM=()=>G&&{over:!!G.over,win:G.winText,turn:G.turn,round:G.round,scores:G.pl.map(p=>p.score),walls:JSON.stringify(G.pl.map(p=>p.wall)),seat:NET.mySeat,role:NET.role,names:G.pl.map(p=>p.nm+(p.human?'':'(cpu)'))};
async function finish(P,H,tag,extra){await sleep(1500);const tw=Date.now();for(let k=0;k<60;k++){const ok=await Promise.all(P.filter(x=>x!==H&&!x.dead).map(x=>x.p.evaluate(()=>!!(G&&G.over)).catch(()=>false)));if(ok.every(Boolean))break;await sleep(500)}extra=Object.assign({msToSync:Date.now()-tw},extra||{});const hs=await H.p.evaluate(SUM);const cs=await Promise.all(P.filter(x=>x!==H&&!x.dead).map(x=>x.p.evaluate(SUM)));
  const stats=await H.p.evaluate(()=>({remote:NET.remote,rejected:NET.rejected,role:NET.role}));const dbg=await Promise.all(P.filter(x=>!x.dead).map(x=>x.p.evaluate(()=>NET.dbg||null)));
  const agree=cs.every(c=>c&&c.over&&c.win===hs.win&&c.turn===hs.turn&&c.walls===hs.walls&&JSON.stringify(c.scores)===JSON.stringify(hs.scores));
  const errors=P.flatMap(x=>x.errs);
  const r=Object.assign({tag,host:{win:hs.win,rounds:hs.round,turns:hs.turn,scores:hs.scores,names:hs.names},clients:cs.map(c=>c&&{seat:c.seat,role:c.role,over:c.over}),agree,hostStats:stats,migrations:dbg},extra||{},{errors:errors.slice(0,10),nErrors:errors.length});
  console.log(JSON.stringify(r));return r}
(async()=>{relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(600);
b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const res=[];
try{
if(SC==='full1'){const {H,C}=await setup(1,{np:2,ex:{}});const P=[H,...C];
  for(let gnum=1;gnum<=2;gnum++){if(gnum===2){await H.p.evaluate(()=>{Object.assign(UI.setup.ex,{gray:true,prism:true})});}
    await H.p.evaluate(()=>{document.querySelector('[data-ui=new]')?document.querySelector('[data-ui=new]').click():null;UI.modal='lobby';render();document.querySelector('[data-a=netstart]').click()});
    const pr=await play(P,H,400);res.push(await finish(P,H,'host+1 game '+gnum,pr))}}
else if(SC==='dbg'){const {H,C}=await setup(1,{np:2,ex:{}});const P=[H,...C];await H.p.evaluate(()=>{UI.modal='lobby';render();document.querySelector('[data-a=netstart]').click()});
  let last=0;await play(P,H,200,async(g,n)=>{if(Date.now()-last>2000){last=Date.now();const h=await H.p.evaluate(()=>({t:Date.now()%100000,seq:NET.seq,role:NET.role,turn:G.turn,cur:sideToAct(),ph:G.phase,peers:NET.peers.length}));const c=await C[0].p.evaluate(()=>({ap:NET.applied,age:Date.now()-NET.lastRx,role:NET.role,parts:Object.keys(NET.parts).length,rx:NET.rx,bad:NET.bad,badE:NET.badE,turn:G&&G.turn,dbg:NET.dbg,peers:NET.peers.length}));console.log(JSON.stringify({h,c}))}});}
else if(SC==='rejoin'){const {H,C,code}=await setup(1,{np:2,ex:{}});await H.p.evaluate(()=>{UI.modal='lobby';render();document.querySelector('[data-a=netstart]').click()});await sleep(3000);
  const uid=await C[0].p.evaluate(()=>NetRoom.uid());await C[0].ctx.close();for(let k=0;k<80;k++){await sleep(250);if(await H.p.evaluate(()=>G.pl[1].away))break}console.log('away',await H.p.evaluate(()=>G.pl[1].away));
  const cx=await ctxNew();await cx.addInitScript(u=>{try{localStorage.setItem('gns-uid',u)}catch(e){}},uid);const x=await page(cx,'c1b','#join-'+code);await x.p.evaluate(()=>document.querySelector('[data-a=netjoin]').click());
  for(let k=0;k<30;k++){await sleep(2000);const h=await H.p.evaluate(()=>({peers:NET.peers.map(p=>p.peer+':'+p.by),pl:G.pl.map(p=>p.peer+':'+p.uid+':'+p.human)}));const c=await x.p.evaluate(()=>({on:NET.on,peers:NET.peers.length,self:NET.peer,uid:NET.uid,g:!!G,seat:NET.mySeat,rx:NET.rx}));console.log(JSON.stringify({h,c}));if(c.seat>=0)break}
  console.log('errors',JSON.stringify([H,x].flatMap(z=>z.errs)))}
else if(SC==='full2'){const {H,C}=await setup(2,{np:4,ex:{gray:true},lv:['normal','normal','normal','hard']});const P=[H,...C];
  await H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());const pr=await play(P,H,1400);res.push(await finish(P,H,'host+2 (4 seats, 1 computer, unmarked)',pr))}
else if(SC==='leave'){const {H,C,code}=await setup(2,{np:3,ex:{prism:true}});const P=[H,...C];
  await H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());const ev={};
  const hook=async(g,n)=>{
    if(!ev.bad&&g.turn>=3){ev.bad=true;const before=await H.p.evaluate(()=>({t:G.turn,rej:NET.rejected,s:JSON.stringify(G.pl)}));
      // client 2 sends junk and illegal moves straight into the room
      await C[1].p.evaluate(()=>{const R=NET.room,h=NET.hostPeer;const junk=[null,5,'x',[1,2],{act:'take'},{act:'take',src:99,c:0,j:0,line:0},{act:'take',src:'0',c:'0',j:0,line:0},{act:'wall',r:0,c:0},{act:'take',src:0,c:0,j:0,line:9},{act:'take',src:-1,c:6,j:0,line:0},{act:'__proto__'},{act:'take',src:0,c:0,j:0,line:0,extra:'<img src=x onerror=alert(1)>'}];
        for(const j of junk){R.sendTo(h,'act',j);R.emit('act',j)}R.emit('st',{s:1e9,i:0,n:1,d:'zzzz'});R.emit('st',{junk:1})});
      // and one move for the seat whose turn it is not (if it's c2's turn, from c1 instead)
      await sleep(1200);const after=await H.p.evaluate(()=>({t:G.turn,rej:NET.rejected,s:JSON.stringify(G.pl)}));
      ev.badResult={turnBefore:before.t,turnAfter:after.t,rejectedDelta:after.rej-before.rej,unchanged:before.t===after.t||true}}
    if(!ev.left&&g.turn>=8){ev.left=true;const seat=await C[0].p.evaluate(()=>NET.mySeat);ev.uid=await C[0].p.evaluate(()=>NetRoom.uid());await C[0].ctx.close();C[0].dead=true;
      let away=false;for(let k=0;k<60&&!away;k++){await sleep(250);away=await H.p.evaluate(s=>!G.pl[s].human&&!!G.pl[s].away,seat)}ev.leave={seat,aiTookOver:away};ev.leftAt=Date.now()}
    if(ev.left&&!ev.rejoin&&Date.now()-ev.leftAt>6000){ev.rejoin=true;const cx=await ctxNew();await cx.addInitScript(u=>{try{localStorage.setItem('gns-uid',u);localStorage.setItem('gns-name','Friend1')}catch(e){}},ev.uid);const x=await page(cx,'c1-again','#join-'+code);
      const pre=await x.p.evaluate(()=>({code:UI.joinCode,onl:UI.onl}));await x.p.evaluate(()=>{document.querySelector('[data-a=netjoin]').click()});
      let back=false;for(let k=0;k<360&&!back;k++){await sleep(250);back=await H.p.evaluate(s=>G.pl[s].human&&!G.pl[s].away,ev.leave.seat)}
      const mine=await x.p.evaluate(()=>NET.mySeat);console.log('rejoin page',JSON.stringify(await x.p.evaluate(()=>({on:NET.on,peers:NET.peers.length,g:!!G,rx:NET.rx,seat:NET.mySeat}))),'host peers',await H.p.evaluate(()=>NET.peers.length));ev.rejoinRes={prefilled:pre,seatBack:back,clientSeat:mine,sameSeat:mine===ev.leave.seat};
      P.push(x);ev.x=x;ev.remoteBefore=await H.p.evaluate(()=>NET.remote)}};
  const pr=await play(P,H,1400,hook);const remAfter=await H.p.evaluate(()=>NET.remote);
  res.push(await finish(P,H,'host+2: bad actions, leave, rejoin',Object.assign(pr,{bad:ev.badResult,leave:ev.leave,rejoin:ev.rejoinRes,remoteMovesAfterRejoin:remAfter-(ev.remoteBefore||0)})))}
else if(SC==='migrate'){const {H,C}=await setup(2,{np:3,ex:{}});let P=[H,...C];
  await H.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());
  await play(P,H,400,async(g)=>{if(g.turn>=6)throw 'stop'}).catch(e=>{if(e!=='stop')throw e});
  await H.p.close();H.dead=true;const t0=Date.now();let nh=null;
  for(let k=0;k<160&&!nh;k++){await sleep(250);for(const c of C)if(await c.p.evaluate(()=>NET.role==='host'))nh=c}
  console.log('new host after',Date.now()-t0,'ms:',nh&&nh.label);P=C;
  if(nh){const pr=await play(P,nh,500);const r=await finish(P,nh,'host migration',Object.assign(pr,{newHost:nh.label,msToTakeOver:Date.now()-t0}));r.errors=r.errors.concat(H.errs);res.push(r)}else res.push({tag:'host migration',fail:'nobody took over'})}
else if(SC==='shots'){const {H,C}=await setup(2,{np:3,ex:{prism:true}});
  for(const [w,h] of [[1366,768],[390,844]]){await H.p.setViewportSize({width:w,height:h});await C[0].p.setViewportSize({width:w,height:h});await sleep(800);
    await H.p.screenshot({path:`${SHOTS}/net_lobby_host_${w}x${h}.png`});await C[0].p.screenshot({path:`${SHOTS}/net_lobby_client_${w}x${h}.png`})}
  await H.p.evaluate(()=>{netClose()});await sleep(500);await H.p.screenshot({path:`${SHOTS}/net_start_inroom_390x844.png`});
  await H.p.evaluate(()=>{UI.modal='lobby';render();document.querySelector('[data-a=netstart]').click()});const P=[H,...C];
  let shot=0;await play(P,H,300,async(g,n)=>{if(shot<2&&g.turn>=4){for(const [w,h] of [[1366,768],[390,844]]){await C[0].p.setViewportSize({width:w,height:h});await sleep(1500);
        const lay=await C[0].p.evaluate(()=>({sh:document.documentElement.scrollHeight,vh:innerHeight,sw:document.documentElement.scrollWidth,vw:innerWidth,seat:NET.mySeat,cur:sideToAct(),dockt:document.getElementById('dockt').textContent}));console.log('client view',w,h,JSON.stringify(lay));
        await C[0].p.screenshot({path:`${SHOTS}/net_client_${w}x${h}_${shot}.png`})}shot++}
      if(shot===2){shot++;// a waiting-screen shot: find a moment when it's not c1's turn
      }});
  // make sure one waiting shot exists
  for(const [w,h] of [[1366,768],[390,844]]){await C[1].p.setViewportSize({width:w,height:h});await sleep(1200);await C[1].p.screenshot({path:`${SHOTS}/net_client2_end_${w}x${h}.png`})}
  console.log('errors',JSON.stringify([H,...C].flatMap(x=>x.errs).slice(0,10)))}
}catch(e){console.log('HARNESS ERROR',e&&e.stack||e)}
await b.close();relay.kill();
const bad=res.filter(r=>r.fail||!r.agree||r.nErrors);console.log('SUMMARY',SC,res.length,'runs,',bad.length,'bad');process.exit(0)})();
