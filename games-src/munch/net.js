// ---------- online play: free peer-to-peer rooms through NetRoom (WebRTC). The host's page runs the game; everyone else sends moves. ----------
// Seats: the host and every friend in the room, in join order; empty seats go to the computer. Each page sees only its own hand.
// Fight windows ("anyone may interfere") open for all other seats at once: the host collects a play or a pass from each seat.
const NET={on:false,role:null,code:'',room:null,lobby:null,p2p:false,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,
  peers:[],inLobby:false,stat:{win:0,multi:0,pass:0,play:0,auto:0,timeout:0,ai:0},lastErr:'',err:'',ready:false,busy:false,myName:'',hostGone:false,lastRx:0,copied:false,off:0,turnKey:'',opts:null,got:false};
const NET_WIN_MS=()=>(typeof window!=='undefined'&&+window.DKD_NETWIN)||30000;
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('dkd');NET.p2p=true;NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
    const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.mode='net'}}}catch(e){NET.lobby=null}
  NET.ready=true;if(typeof render==='function'&&!G)render()}
setTimeout(netInit,0);
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netGame=()=>!!(G&&G.mode==='net'&&NET.on);
const cleanName=s=>String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,16);
// ---- joining and leaving ----
async function netJoin(role,code,retry){if(NET.busy)return;NET.err='';if(!retry)NET.retries=0;
  if(NET.myName)NET.myName=NetRoom.setName(NET.myName);
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('dkd-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{busy:false,code,role,on:true,joinAt:Date.now(),inLobby:true,mySeat:-1,hostPeer:null,parts:{},applied:0,hostGone:false,lastRx:0,opts:null,got:false,turnKey:''});
  if(role==='client'&&!retry)G=null;
  NET.room.presence({role,uid:NET.uid,v:1,name:NET.myName||''}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);
  NET.room.onPeers(onNetPeers);
  UI.mode='net';render();if(!retry||!G)GX.show('dkNet');netRender()}
// a friend who hears nothing from the host soon after joining opens the room again (a fresh connection)
setInterval(()=>{if(!isClient()||NET.busy||NET.hostGone||(NET.hostPeer&&!(NET.lastRx&&Date.now()-NET.lastRx>15000))||!NET.room||Date.now()-NET.joinAt<12000||(NET.retries||0)>=6)return;NET.retries=(NET.retries||0)+1;const keep=G;netJoin('client',NET.code,true).then(()=>{if(keep&&!G)G=keep;render()})},2000);
function onNetPeers(ch){if(NET.room===null)return;NET.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)NET.peer=me.peer;
  if(isHost()&&G&&G.mode==='net'){let changed=false;
    ch.left.forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;changed=true;lg(s.i,`${s.nm} left the table: the computer takes over.`)}});
    ch.joined.forEach(j=>{if(j.isMe||!j.by)return;const s=G.pl.find(p=>p.uid===j.by&&p.peer!==NET.peer);if(s){s.peer=j.peer;if(s.away){s.human=true;s.away=false;lg(s.i,`${s.nm} is back at the table!`)}changed=true}});
    if(changed&&!G.winner){if(typeof aiTimer!=='undefined'&&aiTimer){clearTimeout(aiTimer);aiTimer=null}refresh()}}
  if(isHost()&&(ch.joined.length||ch.left.length))netPush(true);
  if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){NET.hostGone=true;NET.err=G&&!G.winner?'The host left. The game is over.':'The host closed the room.'}
  render();netRender()}
async function netLeave(){const r=NET.room;NET.room=null;try{if(r)await r.leave()}catch(e){}
  const wasGame=G&&G.mode==='net';Object.assign(NET,{on:false,role:null,inLobby:false,mySeat:-1,hostPeer:null,err:'',hostGone:false,peers:[],opts:null});if(wasGame||!G)G=null;UI.info=true;UI.mode='net';
  if(GX.open)GX.close();render()}
// host: seat everyone in the room (join order) and fill the rest with computer heroes
function netStart(){if(!isHost())return;const ps=NET.peers.filter(p=>p.kind==='viewer');const hum=[];
  for(const p of ps){if(hum.length>=6)break;hum.push({peer:p.peer,uid:p.by||null,name:cleanName(p.isMe?NET.myName:p.presence&&p.presence.name)})}
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,name:cleanName(NET.myName)});
  const n=Math.min(6,Math.max(UI.n||DEFN,hum.length,3));const names=[];const used=new Set();
  hum.forEach((h,i)=>{let nm=h.name||('Player '+(i+1));while(used.has(nm.toLowerCase()))nm=nm.slice(0,13)+' '+(i+1);used.add(nm.toLowerCase());names.push(nm)});
  for(const h of HERO_NAMES){if(names.length>=n)break;if(!used.has(h.toLowerCase()))names.push(h)}
  const keep=UI.names;UI.names=names;NET.inLobby=false;if(GX.open==='dkNet')GX.close();
  newGame('net',n);UI.names=keep;
  G.pl.forEach((p,i)=>{const h=hum[i];p.human=!!h;p.peer=h?h.peer:null;p.uid=h?h.uid:null;p.away=false});
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);refresh();netPush(true)}
// ---- what each page is allowed to see ----
function netView(seat){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,60);
  for(const p of g.pl)if(p.i!==seat){p.hand=p.hand.map(()=>-1)}
  g.door=g.door.map(()=>-1);g.tr=g.tr.map(()=>-1);g.rng=1;g.seed=0;
  const mineQ=g.q&&g.q.who===seat;
  if(g.loot&&!mineQ)g.loot.pool=g.loot.pool.map(()=>-1);
  if(g.q&&!mineQ){if(Array.isArray(g.q.opts))g.q.opts=g.q.opts.map(v=>typeof v==='number'?-1:v);if(g.q.ring!=null)g.q.ring=-1}
  return g}
// hidden cards arrive as id -1: a harmless placeholder so any read of them works
function netHidden(g){if(!DEF.__hid)DEF.__hid={k:'__hid',n:'a hidden card',t:'hidden',d:'door',x:''};if(g&&g.C)g.C[-1]='__hid'}
// ---- state packets (compressed, chunked, one per page so every hand stays private) ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function lobbyOpts(){return {n:Math.min(6,Math.max(UI.n||DEFN,3)),lvl:UI.lvl||'normal',ex:EXPS.filter(e=>DEFEX[e.k]).map(e=>e.n)}}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;const net=G&&G.mode==='net';
  for(const t of NET.peers){if(t.isMe)continue;const seat=net?G.pl.findIndex(p=>p.peer===t.peer):-1;
    const body=net?{code:NET.code,seat,g:netView(seat),fx:UI.fx,now}:{code:NET.code,lobby:true,opts:lobbyOpts(),now};
    packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)if(NET.room)NET.room.sendTo(t.peer,'st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}}
setInterval(()=>{if(isHost())netPush(true)},3000);
function onNetState(msg){if(!isClient()||msg.isMe)return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  const hp=NET.peers.find(p=>p.peer===msg.peer);if(NET.hostPeer&&msg.peer!==NET.hostPeer)return;if(!NET.hostPeer&&!(hp&&hp.presence&&hp.presence.role==='host'))return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];for(const x in NET.parts){const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]}
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code||d.s<=NET.applied)return;NET.hostPeer=msg.peer;NET.applied=d.s;NET.lastRx=Date.now();applyNet(o)}).catch(()=>{})}
function applyNet(o){if(typeof o.now==='number')NET.off=Date.now()-o.now;
  if(o.lobby||!o.g){NET.opts=o.opts||null;if(G){G=null;NET.inLobby=true;NET.mySeat=-1;UI.info=true}render();netRender();return}
  const first=!G||G.gid!==o.g.gid;G=o.g;netHidden(G);NET.mySeat=Number.isInteger(o.seat)&&G.pl[o.seat]?o.seat:-1;NET.inLobby=false;UI.info=false;NET.got=true;
  if(GX.open==='dkNet')GX.close();
  netPoint(NET.mySeat);
  UI.fx=Array.isArray(o.fx)?o.fx:[];if(first){lastFx=Math.max(0,...UI.fx.map(f=>f.at||0))}else if(typeof sounds==='function')sounds();
  const me=NET.mySeat,s=sideToAct();const key=me>=0&&s===me&&!G.winner?JSON.stringify([G.turn,G.phase,G.q&&G.q.kind,G.cb&&G.cb.stage,G.nw&&G.nw.id]):'';
  if(key&&key!==NET.turnKey&&!first&&typeof sfx==='function')sfx('turn');NET.turnKey=key;
  render()}
// ---- client -> host ----
function netSend(m){if(!NET.room)return;const d={};['act','card','tgt','opt','cards'].forEach(k=>{if(m[k]!==undefined&&m[k]!==null)d[k]=m[k]});
  NET.room.emit('act',d).catch(()=>{});if(typeof sfx==='function')sfx('click');
  // a pass in an open window shows at once (the host confirms with the next state)
  if(d.act==='pass'&&G&&G.nw&&G.nw.ord.includes(NET.mySeat)&&!G.nw.passed.includes(NET.mySeat)){G.nw.passed.push(NET.mySeat);netPoint(-1)}}
// every click on a net game page lands here (from uiAct)
function netAct(m){if(!G)return;if(isClient()){if(NET.sent&&NET.sent.seq===NET.applied&&Date.now()-NET.sent.at<1500)return;NET.sent={seq:NET.applied,at:Date.now()};netSend(m);return}if(isHost())hostMove(NET.mySeat,m)}
const NET_ACTS=['ready','kick','resurrect','loot','trouble','end','equip','unequip','drop','play','join','give','toss','ask','opt','pick','use','fight','pass','run','skip','shoo','bribe','berserk','turn','flight','charm','backstab','steal','sell'];
function cleanMove(d){if(!d||typeof d!=='object'||typeof d.act!=='string'||!NET_ACTS.includes(d.act))return null;const m={act:d.act};
  const num=v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<100000;const tok=v=>num(v)||(typeof v==='string'&&/^[a-z]{1,8}$/.test(v));
  if(d.card!=null){if(!num(d.card))return null;m.card=d.card}
  if(d.tgt!=null){if(!tok(d.tgt))return null;m.tgt=d.tgt}
  if(d.opt!=null){if(!tok(d.opt))return null;m.opt=d.opt}
  if(d.cards!=null){if(typeof d.cards!=='string'||!/^\d{1,6}(,\d{1,6}){0,30}$/.test(d.cards))return null;m.cards=d.cards}
  return m}
function onNetAct(msg){if(!isHost()||!G||G.mode!=='net'||G.winner||msg.isMe)return;
  let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  if(seat<0){const s=msg.by&&G.pl.find(p=>p.away&&p.uid===msg.by);if(s){s.peer=msg.peer;s.human=true;s.away=false;lg(s.i,`${s.nm} is back at the table!`);refresh();netPush(true)}return}
  const m=cleanMove(msg.data);if(!m){NET.bad=(NET.bad||0)+1;return}
  try{if(!hostMove(seat,m)){NET.bad=(NET.bad||0)+1;NET.rejects=(NET.rejects||[]).concat(m.act+': '+String(NET.lastErr).slice(0,90)).slice(-12)}}catch(e){NET.bad=(NET.bad||0)+1}}
// the host applies a move for a seat: in an open window any listed seat may act; otherwise the normal turn order decides
function hostMove(seat,m){if(!G||G.winner)return false;const w=nwCtx();let ok;
  if(G.nw&&w&&G.nw.ord.includes(seat)){if(G.nw.passed.includes(seat))return false;
    if(m.act==='pass'){G.nw.passed.push(seat);NET.stat.pass++;ok=true;refresh()}
    else{w.set(w.ord.indexOf(seat));ok=gameAct(m,seat);if(ok)NET.stat.play++;else{netPoint();render()}}}
  else ok=gameAct(m,seat);
  if(!ok)NET.lastErr=UI.lastErr||'';netPush();return ok}
// ---- the interrupt window (host only) ----
// the open window, if any: the fight's "last chance to interfere", or the start-of-turn window for curses and level-ups
function nwCtx(){if(!G||G.q||G.winner)return null;
  if(G.phase==='combat'&&G.cb&&G.cb.stage==='others')return {type:'cb',ord:G.cb.ord,set:i=>{G.cb.oi=i}};
  if(G.phase==='window'&&G.win)return {type:'win',ord:G.win.ord,set:i=>{G.win.i=i}};return null}
// point the engine's "whose turn" at a seat that still has to answer (this page's own seat first), so the page shows the right buttons
function netPoint(prefer){const w=nwCtx();if(!w||!G.nw)return;const pend=G.nw.ord.filter(s=>!G.nw.passed.includes(s)&&w.ord.includes(s));if(!pend.length)return;
  const s=pend.includes(prefer)?prefer:pend.find(x=>P(x).human)!=null?pend.find(x=>P(x).human):pend[0];w.set(w.ord.indexOf(s))}
let nwTimer=null;
function netWindow(){if(!isHost()||!G||G.mode!=='net')return;
  for(let k=0;k<20;k++){if(G.winner){G.nw=null;return}const w=nwCtx();
    if(!w){if(!G.q)G.nw=null;return}
    if(!G.nw||G.nw.type!==w.type||G.nw.turn!==G.turn){NET.nwId=(NET.nwId||0)+1;G.nw={id:NET.nwId,type:w.type,turn:G.turn,ord:w.ord.slice(),passed:[],until:Date.now()+NET_WIN_MS()};NET.stat.win++;if(w.ord.filter(s=>P(s).human).length>1)NET.stat.multi++}
    const nw=G.nw;nw.ord=w.ord.slice();
    // a person with nothing but "pass" passes automatically (as in a local game), unless the fight would win someone the game
    for(const s of nw.ord){if(nw.passed.includes(s)||!P(s).human)continue;w.set(w.ord.indexOf(s));const vm=validMoves(s);if(vm.length===1&&vm[0].act==='pass'&&!(G.cb&&typeof winThreat==='function'&&winThreat(G.cb))){nw.passed.push(s);NET.stat.auto++}}
    const pend=nw.ord.filter(s=>!nw.passed.includes(s));
    if(pend.length){netPoint(NET.mySeat);if(pend.some(s=>!P(s).human))nwAiSoon();return}
    // everyone passed: the engine's own "pass" by the last seat closes the window
    G.nw=null;w.set(w.ord.length-1);performMove({act:'pass'},w.ord[w.ord.length-1])}}
function nwAiSoon(){if(nwTimer)return;const d=ANIM?AIDELAY/(UI.speed||1):0;nwTimer=setTimeout(()=>{nwTimer=null;nwAi()},Math.max(d,ANIM?250:0))}
function nwAi(){if(!isHost()||!G||!G.nw||G.winner||UI.pause)return;const w=nwCtx();if(!w)return;const nw=G.nw;
  const s=nw.ord.find(x=>!nw.passed.includes(x)&&!P(x).human);if(s==null)return;w.set(w.ord.indexOf(s));
  let m=null;try{m=aiMove(s)}catch(e){m=null}
  NET.stat.ai++;if(!m||m.act==='pass')nw.passed.push(s);else{const r=performMove(m,s);if(!r.success)nw.passed.push(s)}
  refresh()}
// people who don't answer in time pass
setInterval(()=>{if(!isHost()||!G||!G.nw||G.q||G.winner||Date.now()<G.nw.until)return;const nw=G.nw;let ch=false;for(const s of nw.ord)if(!nw.passed.includes(s)&&P(s).human){nw.passed.push(s);ch=true;NET.stat.timeout++}if(ch)refresh()},500);
// host: a client that went quiet mid-fight still gets its seat back; the host just keeps running
// ---- what the page shows ----
function nwHTML(me){if(!G||!G.nw||G.q)return '';const nw=G.nw;const left=Math.max(0,Math.round((nw.until-(Date.now()-(isClient()?NET.off:0)))/1000));
  const chips=nw.ord.map(s=>{const ok=nw.passed.includes(s);return `<span class="nwc ${ok?'ok':''}" style="--c:${PCOL[s]}">${esc(P(s).nm)}${s===me?' (you)':''}: ${ok?'✓ passed':'deciding…'}</span>`}).join('');
  const pend=nw.ord.filter(s=>!nw.passed.includes(s));
  return `<div class="nw" role="status"><b>${nw.type==='cb'?'Last chance to interfere':'Before the door is kicked'}</b> <span class="small muted">Everyone may play a card now${pend.some(s=>P(s).human)?` (${left}s left)`:''}.</span><div class="nwl">${chips}</div></div>`}
function netStatusHTML(){if(!NET.on||!G||G.mode!=='net')return '';const n=NET.peers.length;const stale=isClient()&&NET.lastRx&&Date.now()-NET.lastRx>8000&&!NET.hostGone;
  const aw=G.pl.filter(p=>p.away).map(p=>esc(p.nm));
  return `<div class="netst small"><span class="dot ${NET.hostGone?'bad':stale?'warn':''}"></span>🌐 Online · room <b>${esc(NET.code)}</b> · ${n} connected${isHost()?' · you host':''}${NET.hostGone?' · <b class="warn">Host left</b>':stale?' · <b class="warn">Reconnecting…</b>':''}${aw.length?` · 🤖 playing for ${aw.join(', ')}`:''}</div>`}
function netModalHTML(){if(!NET.hostGone||!G||G.mode!=='net')return '';
  return `<div class="dlg paper" style="text-align:center"><h2>The host left</h2><p>${G.winner?'The game had already ended.':'The host’s page was running this game, so the game is over.'}</p><div class="acts" style="justify-content:center"><button class="btn primary" data-a="netleave">Back to the start screen</button></div></div>`}
function peerLabel(p){const n=cleanName(p.isMe?NET.myName:p.presence&&p.presence.name);return n||(p.isMe?'You':'Player')}
function lobbyHTML(){const host=isHost();const ps=NET.peers.filter(p=>p.kind==='viewer');const alone=ps.length<=1;
  const rows=ps.map(p=>`<li><b>${esc(peerLabel(p))}</b>${p.isMe?' (you)':''}${p.presence&&p.presence.role==='host'?' · host':''}</li>`).join('')||'<li class="muted">Connecting…</li>';
  const o=host?lobbyOpts():NET.opts;const seats=o?Math.min(6,Math.max(o.n,ps.length)):null;
  const link=NET.p2p?NetRoom.inviteLink(NET.code):'';
  return `<div class="lobby">${NET.hostGone?`<p class="warn">${esc(NET.err||'The host closed the room.')}</p>`:''}
   <p class="lcode">Invite code <b class="code">${esc(NET.code)}</b></p>
   <p class="small">Friends open this page, choose <b>🌐 Play online</b> and type the code, or open this link:</p>
   <div class="lrow"><input class="invlink" readonly value="${esc(link)}" aria-label="Invite link"><button class="btn" data-a="netcopy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   <p class="small ${alone?'muted':''}">${isClient()&&!NET.hostPeer&&NET.retries?'<span class="dot warn"></span> Reconnecting…':alone?'<span class="dot warn"></span> Looking for players…':`<span class="dot"></span> ${ps.length} players in the room`}</p>
   <ul class="plist">${rows}</ul>
   ${o?`<p class="small">Seats: <b>${seats}</b> (empty seats go to <b>${esc(o.lvl)}</b> computer heroes) · Expansions: <b>${esc(o.ex.length?o.ex.join(', '):'none')}</b>${host?'. Change these on the start screen.':''}</p>`:''}
   ${host?`<div class="acts"><button class="btn primary" data-a="netstart">Start with ${ps.length} player${ps.length===1?'':'s'}</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tip">Waiting for the host to start the game…</p><div class="acts"><button class="btn" data-a="netleave">Leave</button></div>`}</div>`}
function onlineBlock(){if(!NET.ready)return '<p class="small muted">Checking online play…</p>';
  if(!netAvail())return '<p class="small muted">🌐 Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online"><p>You are in room <b class="code">${esc(NET.code)}</b> · ${NET.peers.length} connected.</p><div class="acts"><button class="btn primary" data-a="netlobby">Open the lobby</button><button class="btn" data-a="netleave">Leave the room</button></div></div>`;
  return `<div class="online"><p class="small muted">Free and direct: your browsers connect to each other. Host a game and send friends the code or link.</p>
    <div class="orow"><input id="netname" placeholder="your name" maxlength="16" autocomplete="off" value="${esc(NET.myName||'')}" aria-label="Your name"></div>
    <div class="orow"><button class="btn primary" data-a="nethost">Host a game</button></div>
    <div class="orow"><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}" aria-label="Invite code"><button class="btn" data-a="netjoin">Join</button></div>${NET.err&&!NET.on?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`}
// the lobby popup: keep it in step with the room
function netRender(){const b=document.getElementById('dkNetBody');if(!b)return;if(!NET.on){if(GX.open==='dkNet')GX.close();return}
  const h=emo(lobbyHTML());if(b._h!==h){const ae=document.activeElement;b._h=h;b.innerHTML=h;if(ae&&ae.classList&&ae.classList.contains('invlink')){const i=b.querySelector('.invlink');if(i)i.focus()}}}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('#dkNet .invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;netRender();setTimeout(()=>{NET.copied=false;netRender()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netClick(a){if(a==='nethost'){netJoin('host',NetRoom.newCode());return}
  if(a==='netjoin'){const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return}
  if(a==='netstart'){netStart();return}if(a==='netleave'){netLeave();return}if(a==='netcopy'){netCopy();return}
  if(a==='netlobby'){netRender();GX.show('dkNet');return}
  // "New game" / "Play again": the host takes everyone back to the lobby; a friend goes back to the lobby after the end, or leaves mid-game
  if(a==='netnew'){if(isHost()){G=null;NET.inLobby=true;NET.mySeat=-1;UI.info=true;render();netPush(true);netRender();GX.show('dkNet');return}
    if(G&&G.winner&&!NET.hostGone){G=null;NET.inLobby=true;NET.mySeat=-1;render();netRender();GX.show('dkNet');return}netLeave()}}
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(cleanName(t.value))});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netJoin('client',t.value)}});
