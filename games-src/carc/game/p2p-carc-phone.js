// PHONE variant (390x844 touch pages, ?phone=1, humans act only through the strip / pop-ups / cards / board taps). Based on net/p2p-carc.js.
// Real WebRTC test for Rampart & Vine: host + N clients in separate Chromium contexts, local Nostr relay on port 17707.
// PW=$(npm root -g)/playwright node net/p2p-carc.js carc/game/rampart.html [scenario: all|a|b|c] [shots dir]
//  a: host + 1 client, 2 seats, base game
//  b: host + 1 client, 3 seats (1 computer), river + merchants; bad actions, client leaves (computer takes over) and rejoins (seat back)
//  c: host + 2 clients, 4 seats, all expansions; one client leaves for good mid-game; screenshots
// Every client acts only through clicks on its own page (DOM buttons and real mouse taps on the 3D map).
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],WHICH=(process.argv[3]||'all'),SHOTS=process.argv[4]||'';const html=fs.readFileSync(file);
const PORT=+process.env.PORT||17717,URL='https://gns.test/rampart/?phone=1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let b,relay;const results=[];let totalBad=0,benign=0;
async function page(vp){const c=await b.newContext({viewport:vp||{width:390,height:844},isMobile:true,hasTouch:true});
  await c.addInitScript(port=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];try{localStorage.setItem('rv_gfx','low');localStorage.setItem('rv_mus','0')}catch(e){}},PORT);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  const p=await c.newPage();const x={c,p,errs:[]};p.on('pageerror',e=>x.errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()!=='error'||/^Failed to load resource/.test(m.text()))return;
    // Trystero logs this on the other pages whenever a peer closes its connection normally (see the netroom.js note in ONLINE-REPORT.md)
    if(/peer error: OperationError: User-Initiated Abort, reason=Close called/.test(m.text())){benign++;return}x.errs.push(m.text())});
  p.on('requestfailed',r=>{const u=r.url();if(!/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u))x.errs.push('request failed '+u.slice(0,80))});
  await p.goto(URL,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready,null,{timeout:120000});await p.evaluate(()=>{ANIM=0;AIDELAY=60});return x}
async function reload(x,hash){await x.p.goto(URL+(hash||''),{waitUntil:'domcontentloaded',timeout:120000});await x.p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready,null,{timeout:120000});await x.p.evaluate(()=>{ANIM=0;AIDELAY=60})}
const click=async(x,sel)=>{await x.p.waitForSelector(sel,{state:'attached',timeout:60000});await x.p.evaluate(s=>document.querySelector(s).click(),sel)};
async function openOnline(x,name){if(await x.p.$('[data-net=open]'))await click(x,'[data-net=open]');await x.p.fill('#netname',name)}
async function setup(H,o){// host picks seats and expansions on the start screen
  await click(H,`[data-np="${o.np}"]`);for(let i=1;i<o.np;i++){if(await H.p.evaluate(i=>UI.setup.seats[i],i)!=='ai')await click(H,`[data-seat="${i}"]`)}
  for(const k of ['river','ic','tb']){const on=await H.p.evaluate(k=>UI.setup.ex[k],k);if(on!==!!o.ex[k])await click(H,`[data-ex=${k}]`)}}
async function lobby(H,C,o){await setup(H,o);await openOnline(H,'Hosty');await click(H,'[data-net=host]');await H.p.waitForFunction(()=>NET.on&&NET.code,null,{timeout:20000});const code=await H.p.evaluate(()=>NET.code);
  for(const [i,c] of C.entries()){await openOnline(c,'Friend'+(i+1));await c.p.fill('#joincode',code);await click(c,'[data-net=join]')}
  const t0=Date.now();while(Date.now()-t0<45000){const n=await H.p.evaluate(()=>NET.peers.length);const cn=await Promise.all(C.map(c=>c.p.evaluate(()=>NET.opts?1:0)));if(n>=C.length+1&&cn.every(Boolean))break;await sleep(250)}
  const names=await H.p.evaluate(()=>NET.peers.map(p=>netNameOf(p)));const lobbyText=await C[0]?.p.evaluate(()=>document.querySelector('#modal').innerText);
  return {code,ms:Date.now()-t0,names,lobbyText}}
// one random step through the page, like a person: returns a mouse tap for the 3D map, or clicks a DOM button itself
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];const q=s=>document.querySelector(s);if(!G||G.over||UI.modal)return 0;
  const hp=me();if(!hp)return 0;const r=Math.random();
  const cc=q('#pc:not([hidden]) [data-ph=cont]');if(cc){cc.click();return 1}
  if(r<.03){const a=q('#advbtn');if(a&&!a.disabled){a.click();const ap=q('#dockbody [data-ui=apply]');if(ap&&Math.random()<.6)ap.click();return 1}}
  if(r<.05){q('#phmenu').click();const m=rnd([...document.querySelectorAll('#ppop .ph-menu [data-gx]')]);if(m&&Math.random()<.5){m.click();const x=q('.gx-drawer.on .gx-x');if(x)x.click()}else{const x=q('#ppop [data-ph=pclose]');if(x)x.click()}return 1}
  if(G.step==='place'){const conf=q('#ppop [data-ui=confirm]');
    if(conf&&Math.random()<.6){if(Math.random()<.4){const rr=q('#ppop [data-ui=rotr]:not([disabled])');if(rr)rr.click()}conf.click();return 1}
    if(conf)return 0;
    if(Math.random()<.2){const rb=q('#ps [data-ph=rot]');if(rb)rb.click()}
    const cv=V3.r.domElement.getBoundingClientRect();const pts=[];
    for(const k of UI.cells){const [x,y]=unkey(k);const s=screenOf(cellWorld(x,y));const X=cv.left+s.x,Y=cv.top+s.y;const el=document.elementFromPoint(X,Y);if(s.in&&el&&el.id==='c3')pts.push([X,Y])}
    if(pts.length){const [X,Y]=rnd(pts);if(Math.random()<.5)return {tap:[X,Y]};
      const o={bubbles:true,clientX:X,clientY:Y,pointerId:7,isPrimary:true,button:0};const c3=V3.r.domElement;if(!c3.__stub){c3.__stub=1;const sc=c3.setPointerCapture.bind(c3);c3.setPointerCapture=id=>{try{sc(id)}catch(e){}}}c3.dispatchEvent(new PointerEvent('pointerdown',o));c3.dispatchEvent(new PointerEvent('pointerup',o));return 1}
    const sp=q('#ps [data-ph=spots]');if(sp){sp.click();return 1}return 0}
  if(G.step==='fig'){const sh=q('#ps [data-ph=figshow]');if(sh&&!q('#ppop [data-mv]')){sh.click();return 1}
    const kinds=[...document.querySelectorAll('#ppop [data-kind]')];if(kinds.length&&Math.random()<.15){rnd(kinds).click();return 1}
    const bs=[...document.querySelectorAll('#ppop [data-mv],#ps [data-mv]')];if(bs.length){rnd(bs).click();return 1}}return 0};
async function step(x){const k=await x.p.evaluate(tick).catch(e=>{x.errs.push('tick '+e.message);return 0});if(k&&k.tap){await x.p.mouse.click(k.tap[0],k.tap[1]);return 1}return k||0}
const state=x=>x.p.evaluate(()=>G&&{over:!!G.over,win:G.winText,sc:G.pl.map(p=>p.score),turn:G.turn,placed:G.order.length,logN:G.logN,step:G.step,cur:G.cur&&G.cur.p,seat:NET.mySeat,
  humans:G.pl.map(p=>p.human?1:0).join(''),away:G.pl.map(p=>p.away?1:0).join(''),stackN:G.stack.length,
  hidden:G.stack.every(t=>t===-1)&&G.rstack.every(t=>t===-1)&&G.rng===undefined&&G.seed===undefined});
async function play(P,secs,hooks){if(process.env.SECS)secs=+process.env.SECS;let clicks=0,remote=0;const t0=Date.now();
  while(Date.now()-t0<secs*1000){const g=await state(P[0]);if(!g||g.over)break;
    for(const [i,x] of P.entries()){if(x.gone)continue;if(x.seat===undefined||x.seatG!==g.turn>>4){x.seat=await x.p.evaluate(()=>NET.mySeat);x.seatG=g.turn>>4}if(x.seat!==g.cur)continue;const t1=Date.now();const k=await step(x);x.ms=(x.ms||0)+Date.now()-t1;x.n=(x.n||0)+1;clicks+=k;if(i)remote+=k}
    if(Date.now()-(P.hb||0)>60000){P.hb=Date.now();const d=await Promise.all(P.map(x=>x.p.evaluate(()=>({me:!!me(),seat:NET.mySeat,step:G&&G.step,cells:UI.cells.length,ghost:!!UI.ghost,modal:UI.modal,pause:UI.pause,sent:!!NET.sent,gone:NET.hostGone,hl:NET.hostLeftAt})).catch(e=>e.message)));console.log('hb',Math.round((Date.now()-t0)/1000)+'s',JSON.stringify(g),JSON.stringify(d))}
    if(hooks)await hooks(g);await sleep(30)}
  return {clicks,remote,secs:Math.round((Date.now()-t0)/1000),msPerStep:P.map(x=>Math.round((x.ms||0)/(x.n||1)))}}
async function finish(name,P,extra){await sleep(3500);const hs=await state(P[0]);const seatLog=await P[0].p.evaluate(()=>G.log.filter(l=>/left the game|is back/.test(l.t)).map(l=>l.n+': '+l.t).reverse());extra=Object.assign({seatLog},extra||{});const hostRemote=await P[0].p.evaluate(()=>NET.remote);
  const cs=[];for(const x of P.slice(1))if(!x.gone)cs.push(await state(x));
  const agree=cs.every(c=>c&&c.win===hs.win&&JSON.stringify(c.sc)===JSON.stringify(hs.sc)&&c.placed===hs.placed&&c.turn===hs.turn);
  const errors=P.flatMap((x,i)=>x.errs.map(e=>i+': '+e.slice(0,200)));
  const r=Object.assign({name,over:hs&&hs.over,win:hs&&hs.win,scores:hs&&hs.sc,turns:hs&&hs.turn,movesFromClients:hostRemote,agree,clientsHidden:cs.every(c=>c.hidden),clients:cs.map(c=>({seat:c.seat,win:c.win})),errors},extra||{});
  const ok=r.over&&agree&&!errors.length&&hostRemote>0&&r.clientsHidden&&(!extra||extra.ok!==false);if(!ok)totalBad++;r.PASS=ok;results.push(r);console.log(JSON.stringify(r,null,1));
  for(const x of P)await x.c.close()}
async function shot(x,name){if(!SHOTS)return;await x.p.screenshot({path:SHOTS+'/'+name+'.png'})}
async function scenarioA(){const H=await page(),C=[await page()];const L=await lobby(H,C,{np:2,ex:{}});console.log('A lobby',L.code,L.ms+'ms',L.names);
  if(SHOTS){await H.p.setViewportSize({width:1366,height:768});await C[0].p.setViewportSize({width:1366,height:768});await sleep(500);await shot(H,'lobby_host_1366');await shot(C[0],'lobby_client_1366');await H.p.setViewportSize({width:800,height:560});await C[0].p.setViewportSize({width:390,height:844});await sleep(400);await shot(C[0],'lobby_client_390');await C[0].p.setViewportSize({width:800,height:560})}
  await click(H,'[data-net=start]');await C[0].p.waitForFunction(()=>G&&!NET.inLobby,null,{timeout:30000});
  let shotTaken=false;const r=await play([H,...C],1800,async g=>{if(!shotTaken&&SHOTS&&g.turn>=14){shotTaken=true;
    await C[0].p.waitForFunction(()=>G.step==='place',null,{timeout:10000}).catch(()=>{});await C[0].p.setViewportSize({width:1366,height:768});await sleep(700);await shot(C[0],'client_mid_1366');
    await C[0].p.setViewportSize({width:390,height:844});await sleep(700);await shot(C[0],'client_mid_390');await C[0].p.setViewportSize({width:800,height:560});await sleep(300)}});
  await finish('A: host + 1 client, 2 seats, base',[H,...C],r)}
async function scenarioB(){const H=await page(),C=[await page()];const L=await lobby(H,C,{np:3,ex:{river:1,tb:1}});console.log('B lobby',L.code,L.ms+'ms',L.names);
  await click(H,'[data-net=start]');await C[0].p.waitForFunction(()=>G&&!NET.inLobby,null,{timeout:30000});const X={ok:true};let phase=0,awayMoves=0,awayT0=0;
  const r=await play([H,...C],2400,async g=>{
    if(phase===0&&g.turn>=6){await H.p.evaluate(()=>{UI.pause=true});phase=0.2}// the computer waits at its next turn
    else if(phase===0.2&&g.cur===2){// bad actions from the client page while the computer seat is to play (host paused)
      await sleep(300);const before=await state(H);
      await C[0].p.evaluate(()=>{const e=d=>NET.room.emit('act',d);const ts=G.turn+':'+G.step;e({act:'place',x:0,y:1,r:0,ts});e({act:'skip',ts});e(null);e('junk');e([1,2]);e({act:'place',x:'a',y:{},r:9,ts});e({act:'fig',k:'dragon',l:-1,ts});e({act:'__proto__'});e({act:'skip',ts:'0:place'});e({act:'x'.repeat(5000)})});
      await sleep(2000);const after=await state(H);await H.p.evaluate(()=>{UI.pause=false;schedule()});
      X.badOtherTurnIgnored=JSON.stringify(before)===JSON.stringify(after);if(!X.badOtherTurnIgnored)X.ok=false;console.log('bad actions (not its turn) ignored:',X.badOtherTurnIgnored);phase=0.5}
    else if(phase===0.5&&g.cur===1&&g.step==='place'){// illegal moves on its own turn
      const before=await state(H);if(before.cur===1&&before.step==='place'){
      await C[0].p.evaluate(()=>{const e=d=>NET.room.emit('act',d);const ts=G.turn+':'+G.step;e({act:'place',x:0,y:0,r:0,ts});e({act:'place',x:99,y:99,r:0,ts});e({act:'place',x:0,y:1,r:5,ts});e({act:'fig',k:'f',l:0,ts});e({act:'skip',ts});e({act:'place',x:1.5,y:0,r:0,ts})});
      await sleep(2000);const after=await state(H);X.badOwnTurnIgnored=JSON.stringify(before)===JSON.stringify(after);if(!X.badOwnTurnIgnored)X.ok=false;console.log('bad actions (own turn) ignored:',X.badOwnTurnIgnored);phase=1}}
    else if(phase===1&&g.turn>=16){// the client leaves through its own page: New game -> Leave the room
      await click(C[0],'.gx-bar [data-a=new]');await click(C[0],'[data-net=leave]');C[0].gone=true;awayT0=g.turn;
      await H.p.waitForFunction(()=>G.pl[1].away&&!G.pl[1].human,null,{timeout:30000}).then(()=>X.leftToComputer=true,()=>{X.leftToComputer=false;X.ok=false});phase=2}
    else if(phase===2){const n=await H.p.evaluate(()=>G.log.filter(l=>/^— /.test(l.t)&&l.t.includes(G.pl[1].nm)).length);if(!X.awayStart)X.awayStart=n;
      if(g.turn>=awayT0+6){awayMoves=n-X.awayStart;X.computerPlayedAwaySeat=awayMoves;
        // rejoin through the invite link, same browser (same uid)
        await reload(C[0],'#join-'+(await H.p.evaluate(()=>NET.code)));const pre=await C[0].p.evaluate(()=>({code:document.querySelector('#joincode')&&document.querySelector('#joincode').value,open:!!document.querySelector('#netname')}));X.linkPrefill=pre;
        await C[0].p.evaluate(()=>ANIM=0);await click(C[0],'[data-net=join]');C[0].gone=false;C[0].seat=undefined;
        await C[0].p.waitForFunction(()=>G&&NET.mySeat===1,null,{timeout:45000}).then(()=>X.rejoinedSeat=1,()=>{X.rejoinedSeat=-1;X.ok=false});
        const hs=await state(H);X.rejoinHumans=hs.humans;if(hs.humans!=='110'){X.ok=false}phase=3}}});
  const after=await H.p.evaluate(()=>G.log.filter(l=>/^— /.test(l.t)&&l.t.includes(G.pl[1].nm)).length);
  await finish('B: host + 1 client, 3 seats, river+merchants; bad actions, leave, rejoin',[H,...C],Object.assign(r,X))}
async function scenarioC(){const H=await page(),C=[await page(),await page({width:390,height:844})];const L=await lobby(H,C,{np:4,ex:{river:1,ic:1,tb:1}});console.log('C lobby',L.code,L.ms+'ms',L.names);
  if(SHOTS){await shot(H,'lobby3_host_1366');await shot(C[1],'lobby3_client_390')}
  await click(H,'[data-net=start]');for(const c of C)await c.p.waitForFunction(()=>G&&!NET.inLobby,null,{timeout:30000});const X={ok:true};let done=false,shotTaken=false;
  const r=await play([H,...C],3000,async g=>{
    if(!shotTaken&&SHOTS&&g.turn>=20){shotTaken=true;await shot(C[1],'client3_mid_390');await shot(C[0],'client3_mid_800')}
    if(!done&&g.turn>=40){done=true;await C[1].p.evaluate(()=>netLeave());C[1].gone=true;
      await H.p.waitForFunction(()=>G.pl[2].away&&!G.pl[2].human,null,{timeout:30000}).then(()=>X.leftToComputer=true,()=>{X.leftToComputer=false;X.ok=false})}});
  X.hostSeat=0;await finish('C: host + 2 clients, 4 seats, all expansions; one leaves for good',[H,...C.filter(c=>!c.gone),...C.filter(c=>c.gone)],Object.assign(r,X))}
(async()=>{relay=spawn('node',[(process.env.RELAY||'/home/user/spotify_to_ytmusic/games-src/net/relay.js'),String(PORT)]);await sleep(600);
  b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{if(WHICH==='all'||WHICH.includes('a'))await scenarioA();if(WHICH==='all'||WHICH.includes('b'))await scenarioB();if(WHICH==='all'||WHICH.includes('c'))await scenarioC()}
  catch(e){console.log('FAILED',e.stack);totalBad++}
  console.log('benign Trystero close logs',benign);console.log('SUMMARY',results.map(r=>r.name+': '+(r.PASS?'PASS':'FAIL')).join(' | '),'bad',totalBad);
  await b.close();relay.kill();process.exit(totalBad?1:0)})();
