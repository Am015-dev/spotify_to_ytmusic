// Real WebRTC test for Sands of Qamar: host + N clients in separate Chromium contexts, local Nostr relay on port 17702.
// PW=$(npm root -g)/playwright node net/p2p-ft.js ft/sands.html [clients] [seats] [ex,ex] [seconds]
// env: LEAVE=s (client 1 closes its tab at s seconds, REJOIN=s reopens it from the invite link), BAD=1 (a client sends illegal and malformed moves),
//      HOSTKILL=s (the host's tab closes at s seconds: host migration), SHOTS=dir (lobby and mid-game screenshots at 1366x768 and 390x844)
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],NCL=+(process.argv[3]||1),SEATS=+(process.argv[4]||NCL+1),EXL=(process.argv[5]||'').split(',').filter(x=>x&&x!=='-'),SECS=+(process.argv[6]||600);
const html=fs.readFileSync(file);const PORT=+(process.env.PORT||17742);const LEAVE=+(process.env.LEAVE||0),REJOIN=+(process.env.REJOIN||0),BAD=!!process.env.BAD,HOSTKILL=+(process.env.HOSTKILL||0),SHOTS=process.env.SHOTS||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let relayP=null;const extraB=[];(async()=>{const relay=relayP=spawn('node',['/home/user/spotify_to_ytmusic/games-src/net/relay.js',String(PORT)]);await sleep(600);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const P=[];
async function openPage(c,url,tag){const p=await c.newPage();p.setDefaultTimeout(150000);const x={p,errs:[],tag};p.on('pageerror',e=>x.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))x.errs.push(m.text())});
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:+(process.env.LOADT||120000)});await p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready&&document.querySelector('#modal:not([hidden])'),null,{timeout:+(process.env.LOADT||120000)});
  await p.evaluate(()=>{ANIM=0;AIDELAY=60});return x}
async function newCtx(){const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  await c.addInitScript(p=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+p];window.NETROOM_ICE=[];try{localStorage.setItem('soq_gfx','low')}catch(e){}},PORT);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});return c}
for(let i=0;i<=NCL;i++){const c=await newCtx();P.push(Object.assign(await openPage(c,'https://gns.test/sands/','p'+i),{c}))}
const [H,...C]=P;
// the host: opening scene -> start screen -> Play online -> name -> Host (all by clicks)
await H.p.click('[data-ui=play]');await H.p.click('.online summary');await H.p.fill('#netname','Hosty');
await H.p.click('[data-net=host]');await H.p.waitForFunction(()=>NET.on&&NET.code,null,{timeout:30000});const code=await H.p.evaluate(()=>NET.code);
await H.p.evaluate(([n,ex])=>{UI.setup.np=n;for(const k of ex)UI.setup.ex[k]=true;render();netPush(true)},[SEATS,EXL]);
console.log('code',code,'avail',await H.p.evaluate(()=>netAvail()));
// client 0 types the code; the others open the invite link (#join-code pre-fills it and opens the online panel)
for(const [i,x] of C.entries()){if(i===0){await x.p.click('[data-ui=play]');await x.p.click('.online summary');await x.p.fill('#joincode',code)}
  else{await x.p.goto('https://gns.test/sands/#join-'+code,{waitUntil:'domcontentloaded',timeout:+(process.env.LOADT||120000)});await x.p.waitForFunction(()=>typeof NET!=='undefined'&&NET.ready&&document.querySelector('#joincode'),null,{timeout:+(process.env.LOADT||120000)});await x.p.evaluate(()=>{ANIM=0;AIDELAY=60});
    const pre=await x.p.evaluate(()=>({v:document.querySelector('#joincode').value,open:document.querySelector('.online').open}));console.log('invite link pre-fill',JSON.stringify(pre))}
  await x.p.fill('#netname','Friend'+i);await x.p.click('[data-net=join]')}
let t0=Date.now();while(Date.now()-t0<60000){const n=await H.p.evaluate(()=>NET.peers.length);if(n>=NCL+1)break;await sleep(250)}
const lobby=await H.p.evaluate(()=>NET.peers.map(p=>p.presence&&p.presence.name||'?'));console.log('lobby after',Date.now()-t0,'ms',JSON.stringify(lobby));
await sleep(800);
if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});for(const [w,h] of [[1366,768],[390,844]]){for(const [x,t] of [[H,'host'],[C[0],'client']]){await x.p.setViewportSize({width:w,height:h});await sleep(700);await x.p.screenshot({path:`${SHOTS}/lobby_${t}_${w}x${h}.png`})}}
  for(const x of [H,C[0]])await x.p.setViewportSize({width:1366,height:768});
  // the lobby closes with Esc and with a tap outside; it reopens from the start screen
  const esc=await C[0].p.evaluate(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));const a=UI.modal;document.querySelector('[data-net=lobby]').click();const b2=UI.modal;document.getElementById('modal').click();const c2=UI.modal;document.querySelector('[data-net=lobby]').click();return [a,b2,c2,UI.modal]});
  console.log('lobby close/reopen',JSON.stringify(esc))}
const tS=Date.now();await H.p.evaluate(()=>setTimeout(()=>document.querySelector('[data-net=start]').click(),0));
await H.p.waitForFunction(()=>!!G&&NET.gno>0,null,{timeout:600000});for(const x of C)await x.p.waitForFunction(()=>!!G,null,{timeout:600000});console.log('game on every page after',Date.now()-tS,'ms');
const tick=()=>{if(!G||G.over||UI.modal||!me()||NET.wait)return {k:0};const q=s=>[...document.querySelectorAll(s)].filter(e=>!e.closest('[hidden]')&&!e.disabled&&e.getBoundingClientRect().width>3);const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const ch=q('#chz button');const gl=ch.length?ch:[...q('.glow'),...q('#acts button:not(.ghost)'),...q('#mine button')];if(!gl.length)return {k:0};const r=rnd(gl).getBoundingClientRect();return {k:0,tile:{x:r.left+r.width/2,y:r.top+r.height/2}}};
let clicks=0,remote=0,tiles=0,live=P.slice(),left=null,rejoined=null,badDone=false,shotMid=false,hostKilled=false;const why={};t0=Date.now();
const hostOf=async()=>{for(const x of live){if(await x.p.evaluate(()=>isHost()).catch(()=>false))return x}return null};
while(Date.now()-t0<SECS*1000){const el=(Date.now()-t0)/1000;
  if(LEAVE&&!left&&el>LEAVE){const x=C[C.length-1];left={seat:await x.p.evaluate(()=>NET.mySeat),uid:await x.p.evaluate(()=>NET.uid)};await x.p.close();live=live.filter(y=>y!==x);console.log('client left at',Math.round(el),'s, seat',left.seat)}
  if(left&&!left.checked){const a=await H.p.evaluate(s=>({human:G.pl[s].human,away:!!G.pl[s].away,turn:G.turn,log:G.log.slice(0,8).map(l=>l.t).filter(t=>/left the game/.test(t))}),left.seat).catch(()=>null);if(a&&(a.away||el>LEAVE+40)){left.checked=1;a.secs=Math.round(el-LEAVE);left.after=a;console.log('after leave',JSON.stringify(a))}}
  if(left&&left.checked&&REJOIN&&!rejoined&&el>REJOIN){const x=C[C.length-1];let rc=x.c;
    // REJOIN_BROWSER=1: reopen in a separate Chromium process with the same stored uid (like the same person on a restarted browser)
    if(process.env.REJOIN_BROWSER){const b2=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});extraB.push(b2);rc=await b2.newContext({viewport:{width:1366,height:768}});
      await rc.addInitScript(([p,u])=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+p];window.NETROOM_ICE=[];try{localStorage.setItem('soq_gfx','low');localStorage.setItem('gns-uid',u)}catch(e){}},[PORT,left.uid]);
      await rc.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()})}
    const y=await openPage(rc,'https://gns.test/sands/#join-'+code,'rejoin');await y.p.click('[data-net=join]');y.errs.unshift(...x.errs);Object.assign(x,y);live.push(x);rejoined={t:Date.now()};console.log('client reopened the invite link at',Math.round(el),'s')}
  if(rejoined&&!rejoined.ok&&Date.now()-rejoined.t>1000){const s=await C[C.length-1].p.evaluate(()=>({seat:NET.mySeat,uid:NET.uid}));if(s.seat===left.seat){rejoined.ok=1;rejoined.after=await H.p.evaluate(s=>({human:G.pl[s].human,away:!!G.pl[s].away}),left.seat);console.log('rejoined: seat',s.seat,'uid same',s.uid===left.uid,JSON.stringify(rejoined.after),'in',Date.now()-rejoined.t,'ms')}}
  if(HOSTKILL&&!hostKilled&&el>HOSTKILL){hostKilled=true;const t=await H.p.evaluate(()=>G.turn);await H.p.close();live=live.filter(y=>y!==H);console.log('host tab closed at turn',t)}
  if(BAD&&!badDone&&el>20){badDone=true;const x=C[0];const before=await H.p.evaluate(()=>({n:G.logN,rej:NET.rej,s:JSON.stringify(G)}));
    await x.p.evaluate(()=>{const e=(m)=>NET.room.emit('act',m);e({m:{act:'bid',spot:99}});e({m:'garbage'});e(null);e({m:[1,2]});e({m:{act:'sell',kinds:'abc'}});e({m:{act:'sell',kinds:[{}]}});e({m:{act:'end'}});e({m:{act:'q',i:5}});e({m:{act:'step',tile:-1,c:'x'}});e({m:{act:'x'.repeat(5000)}});e({m:{act:'djinn',k:'__proto__'}});e({m:{act:'undodrop'}})});
    await sleep(1500);const after=await H.p.evaluate(()=>({n:G.logN,rej:NET.rej,cur:G.cur}));console.log('bad moves: rejected',after.rej-before.rej,'of 12 · log advanced by',after.n-before.n,'(other seats may have moved meanwhile)')}
  const HH=await hostOf();if(!HH){await sleep(300);continue}
  const g=await HH.p.evaluate(()=>G&&{over:!!G.over,t:G.turn}).catch(()=>null);if(!g){await sleep(200);continue}if(g.over)break;
  if(SHOTS&&!shotMid&&g.t>=6){const x=live.find(y=>y!==HH);if(x&&await x.p.evaluate(()=>!!G)){shotMid=true;for(const [w,h] of [[1366,768],[390,844]]){await x.p.setViewportSize({width:w,height:h});await sleep(900);await x.p.screenshot({path:`${SHOTS}/game_client_${w}x${h}.png`})}await x.p.setViewportSize({width:1366,height:768})}}
  for(const x of live){const k=await x.p.evaluate(tick).catch(e=>{x.errs.push('tick '+e.message);return {k:0}});
    if(k.tile){await x.p.touchscreen.tap(k.tile.x,k.tile.y).catch(()=>{});k.k=1;tiles++;k.w='tile'}if(k.k){clicks++;why[k.w]=(why[k.w]||0)+1;if(x!==HH)remote++}}await sleep(40)}
await sleep(3000);
const HX=await hostOf();const hs=await HX.p.evaluate(()=>({over:!!G.over,win:G.winText,t:G.turn,scores:G.over&&G.over.scores.map(s=>s.s.total),humans:G.pl.map(p=>p.human?'H':p.away?'left':'cpu').join(','),seat:NET.mySeat,acts:NET.acts,rej:NET.rej,names:G.pl.map(p=>p.nm)}));
const cs=await Promise.all(live.filter(x=>x!==HX).map(x=>x.p.evaluate(()=>({win:G&&G.winText,t:G&&G.turn,scores:G&&G.over&&G.over.scores.map(s=>s.s.total),seat:NET.mySeat,role:NET.role}))));const migr=await Promise.all(live.map(x=>x.p.evaluate(()=>NET.migr||0)));
const agree=cs.every(c=>c.win===hs.win&&c.t===hs.t&&JSON.stringify(c.scores)===JSON.stringify(hs.scores));
console.log(JSON.stringify({host:hs,clients:cs,clicks,remote,tiles,why,agree,migrations:migr,newHost:hostKilled?P.indexOf(HX):null,leave:left,rejoin:rejoined&&!!rejoined.ok,secs:Math.round((Date.now()-t0)/1000),errors:P.flatMap(x=>x.errs.map(e=>x.tag+': '+e.slice(0,240)))},null,1));
for(const x of extraB)await x.close();await b.close();relay.kill();process.exit(0)})().catch(e=>{console.log('FAIL',e.stack);try{relayP.kill()}catch(x){}process.exit(1)});
