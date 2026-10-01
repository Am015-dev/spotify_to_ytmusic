// ---------- online play: free peer-to-peer rooms (NetRoom over WebRTC). The host's page runs the game; the other pages send moves. ----------
// Host: holds the real G, runs the engine and the computer seats, checks every move a friend sends, and broadcasts G after each change.
// Client: renders the G it receives from its own seat; a click becomes a small move message (netSend) instead of a rules move.
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',ready:false,busy:false,ep:0,lastRx:0,dead:[],expect:null,gno:0,wait:0,waitT:0,fxSeen:-1,myName:'',opt:null,copied:false,lastSide:-2,rej:0,acts:0,hiT:0,over:''};
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('soq');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.netOpen=true}}}catch(e){}NET.ready=true}
netInit();
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netName=s=>String(s||'').replace(/[<>&"'`]/g,'').trim().slice(0,16);
function peerName(p){const n=netName(p&&p.presence&&p.presence.name);return n||(p&&p.isMe?'You':'Player')}
// ---- joining and leaving a room ----
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  if(typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(NET.myName);
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('soq-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{busy:false,code,role,on:true,mySeat:-1,hostPeer:null,parts:{},applied:0,ep:0,lastRx:0,dead:[],expect:null,wait:0,fxSeen:-1,over:'',opt:null,peer:NET.room.self||null});
  if(role==='client'){G=null;NET.gno=0}
  NET.room.presence({role,uid:NET.uid,v:1,name:NET.myName||''}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const meP=ch.peers.find(p=>p.isMe);if(meP)NET.peer=meP.peer;
    if(isHost()&&G){let ch2=false;
      ch.left.forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;ch2=true;lg(`${s.nm} left the game: the computer takes over.`)}});
      ch.joined.forEach(j=>{if(j.isMe)return;const uid=j.by||(j.presence&&j.presence.uid);const s=uid&&G.pl.find(p=>p.uid===uid&&(p.away||p.peer!==j.peer));if(s){s.peer=j.peer;s.human=true;s.away=false;ch2=true;NET.dead=NET.dead.filter(x=>x!==j.peer);lg(`${s.nm} is back and takes the seat again.`)}});
      if(ch2)refresh();else netPush(true)}
    else if(isHost())netPush(true);
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){if(G&&!G.over)netMigrate(NET.hostPeer);else NET.over='The host closed the room.'}
    render()});
  UI.modal='lobby';render()}
async function netLeave(){const r=NET.room;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',over:'',wait:0});try{if(r)await r.leave()}catch(e){}G=null;UI.modal='start';render()}
function netStatus(){if(!NET.on)return '';const n=NET.peers.length;
  if(NET.over)return NET.over;
  if(isClient()&&!NET.hostPeer)return 'Looking for the host…';
  if(isClient()&&G&&!G.over&&NET.lastRx&&Date.now()-NET.lastRx>6000)return 'Reconnecting…';
  if(n<=1)return 'Looking for players…';return `${n} players online`}
// ---- the host starts a game with everyone in the room; seats go in join order, empty seats go to the computer ----
function netStart(){if(!isHost())return;const hum=NET.peers.slice(0,5).map(p=>({peer:p.peer,uid:p.by||(p.presence&&p.presence.uid)||null,name:peerName(p)}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,name:netName(NET.myName)||'You'});const o=UI.setup;
  const np=Math.min(5,Math.max(o.np,hum.length));const seats=[],names=[],used=new Set();
  for(let i=0;i<np;i++){const h=hum[i];seats.push(h?'human':'ai');let nm=h&&h.name&&h.name!=='You'&&h.name!=='Player'?h.name:PNAMES[i];if(used.has(nm.toLowerCase()))nm=nm+' ('+PNAMES[i]+')';used.add(nm.toLowerCase());names.push(nm)}
  UI.modal=null;UI.fx.length=0;UI.fxSeen=0;UI.chapterShown='';UI.moveSnap=null;UI.autoPlan=null;NET.gno++;NET.over='';NET.pushOff=1;
  newGame({np,seats,names,lv:o.lv.slice(0,np),ex:Object.assign({},o.ex,np===5?{sultan:true}:{}),mode:'x'});NET.pushOff=0;
  G.pl.forEach((p,i)=>{const h=hum[i];if(h){p.peer=h.peer;p.uid=h.uid}});NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  resetScene();refresh();netPush(true)}
// ---- state packets: JSON, deflate-compressed, cut into 3200-character chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
// what a friend's page may see: the log is trimmed, and the order of every face-down pile and the random seed are left out
function netView(){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,60);g.rng=0;for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(g[k]))g[k].sort();return g}
function netPush(force){if(!isHost()||!NET.room||NET.pushOff)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;const opt={np:UI.setup.np,ex:UI.setup.ex,lv:UI.setup.lv,ord:NET.peers.map(p=>p.by||null)};
  const body=G?{code:NET.code,ep:NET.ep,gno:NET.gno,g:netView(),fx:UI.fx.slice(-20).map(f=>({t:f.t,n:f.n})),undo:!!(UI.moveSnap&&G.move),opt}:{code:NET.code,ep:NET.ep,lobby:true,opt};
  packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)NET.room&&NET.room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
function onNetState(msg){if(!NET.on||msg.isMe)return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n)||typeof d.s!=='number')return;
  if(NET.dead.includes(msg.peer))return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;const ep=o.ep|0;
    // only a seated player may take over as host (or anyone, before there is a game)
    const seated=!G||G.pl.some(p=>p.peer===msg.peer);
    if(isHost()){if(!seated||!(ep>NET.ep||(ep===NET.ep&&msg.peer<NET.peer)))return;
      NET.role='client';UI.moveSnap=null;NET.hostPeer=msg.peer;NET.ep=ep;NET.applied=d.s;NET.room.presence({role:'client'}).catch(()=>{})}
    else{if(!NET.hostPeer||(ep>NET.ep&&seated)){if(NET.hostPeer&&NET.hostPeer!==msg.peer)NET.applied=0;NET.hostPeer=msg.peer;NET.ep=Math.max(NET.ep,ep);NET.expect=null}
      if(msg.peer!==NET.hostPeer||ep<NET.ep||d.s<=NET.applied)return;NET.applied=d.s}
    NET.lastRx=Date.now();applyNet(o)}).catch(()=>{})}
function validG(g){return g&&typeof g==='object'&&Array.isArray(g.pl)&&g.pl.length>=2&&g.pl.length<=5&&Array.isArray(g.board)&&Array.isArray(g.log)&&Array.isArray(g.market)}
const FXSND={pick:'pick',drop:'drop',take:'take',camel:'camel',coins:'coins',res:'take',kill:'kill',djinn:'djinn',build:'build',bid:'bid',round:'round',win:'win',thief:'kill',item:'djinn'};
function applyNet(o){if(o.opt&&typeof o.opt==='object')NET.opt=o.opt;
  if(o.lobby||!o.g){if(G){G=null;UI.modal='lobby'}render();return}
  if(!validG(o.g))return;
  const prev=G,mine0=prev&&NET.mySeat>=0&&prev.pl[NET.mySeat]?scoreOf(prev.pl[NET.mySeat]):null,sent=NET.wait;
  const newGameHere=o.gno!==NET.gno||!prev;G=o.g;
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  if(newGameHere){NET.gno=o.gno;NET.fxSeen=-1;UI.chapterShown='';UI.plans=null;UI.planKey='';UI.autoPlan=null;UI.adv=null;UI.pendDj=null;UI.sellSel=[];if(UI.modal)UI.modal=null;resetScene()}
  // my seat shows as left (a page reload, a dropped connection): say hello so the host gives it back
  const mineByUid=G.pl.find(p=>p.uid&&p.uid===NET.uid);if(mineByUid&&(mineByUid.away||mineByUid.peer!==NET.peer)&&Date.now()-NET.hiT>2500){NET.hiT=Date.now();NET.room.emit('act',{m:{act:'hi'}}).catch(()=>{})}
  // sounds from the host's event list
  const fxl=Array.isArray(o.fx)?o.fx:[];let top=NET.fxSeen;for(const f of fxl){if(!f||typeof f.n!=='number')continue;if(NET.fxSeen>=0&&f.n>NET.fxSeen&&FXSND[f.t]&&typeof sfx==='function')sfx(FXSND[f.t]);if(f.n>top)top=f.n}NET.fxSeen=Math.max(top,0);
  UI.moveSnap=o.undo&&G.cur===NET.mySeat?'net':null;NET.wait=0;
  if(sent&&mine0&&G.pl[NET.mySeat]&&!G.over)try{scoreNote(G.pl[NET.mySeat],mine0)}catch(e){}
  refresh()}
// ---- host migration: if the host leaves, the seated player with the lowest seat takes over from the latest state ----
function netMigrate(gone){if(!isClient()||!G||G.over)return;if(gone&&!NET.dead.includes(gone))NET.dead.push(gone);
  const here=new Set(NET.peers.map(p=>p.peer));
  const cand=G.pl.filter(p=>p.human&&p.peer&&!NET.dead.includes(p.peer)&&(here.has(p.peer)||p.peer===NET.peer));
  const next=cand[0];NET.lastRx=Date.now();
  if(!next){NET.over='The host left. The game is over.';render();return}
  if(next.peer!==NET.peer){NET.expect=next.peer;NET.over='';toast(`The host left. ${next.nm} is taking over…`);render();return}
  G.pl.forEach(p=>{if(p.human&&p.peer!==NET.peer&&(NET.dead.includes(p.peer)||!here.has(p.peer))){p.human=false;p.away=true}});
  // the face-down piles arrived sorted and without the seed: shuffle them afresh
  G.rng=Math.floor(Math.random()*2**31);for(const k of ['rdeck','bag','items','djDeck','thDeck'])if(Array.isArray(G[k]))shuffle(G[k]);
  NET.role='host';NET.ep++;NET.migr=(NET.migr||0)+1;NET.hostPeer=NET.peer;NET.expect=null;NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);NET.over='';UI.moveSnap=null;UI.autoPlan=null;NET.wait=0;
  lg(`The host left. ${G.pl[NET.mySeat].nm}'s page is running the game now.`);
  NET.room.presence({role:'host'}).catch(()=>{});netPush(true);refresh()}
setInterval(()=>{if(!isClient()||!G||G.over||!NET.lastRx)return;// only a host whose connection is gone is replaced: a host that is merely slow (a busy page) shows "Reconnecting…" and keeps the game
  const gone=NET.hostPeer&&!NET.peers.some(p=>p.peer===NET.hostPeer);if(gone&&Date.now()-NET.lastRx>8000)netMigrate(NET.expect||NET.hostPeer)},1000);
// ---- client -> host: one move at a time ----
function netSend(m){if(!NET.room)return false;if(NET.wait&&Date.now()-NET.waitT<2500)return false;let s='';try{s=JSON.stringify(m)}catch(e){return false}if(s.length>900)return false;
  NET.wait=1;NET.waitT=Date.now();NET.room.emit('act',{m:JSON.parse(s)}).catch(()=>{});return true}
// the same check performMove makes, done first so a bad message never reaches the rules
function netLegal(m,s){if(validMoves(s).some(x=>same(x,m)))return true;
  if(m.act==='sell'&&G.step==='sell'&&s===G.cur){const k=m.kinds;return Array.isArray(k)&&k.length>0&&k.every(x=>typeof x==='string')&&new Set(k).size===k.length&&k.every(x=>P(s).res.includes(x))}return false}
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  if(seat<0){const s=msg.by&&G.pl.find(p=>p.uid===msg.by&&(p.away||p.peer!==msg.peer));if(!s)return;s.peer=msg.peer;s.human=true;s.away=false;NET.dead=NET.dead.filter(x=>x!==msg.peer);lg(`${s.nm} is back and takes the seat again.`);refresh();return}
  const m=msg.data&&msg.data.m;
  if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.act!=='string'){NET.rej++;return}
  if(m.act==='hi')return;
  if(m.act==='undodrop'){if(seat===G.cur&&sideToAct()===seat&&G.move&&UI.moveSnap&&UI.moveSteps){NET.acts++;uiAct('undodrop')}else{NET.rej++;netPush()}return}
  let ok=false;try{ok=sideToAct()===seat&&netLegal(m,seat)}catch(e){ok=false}
  if(!ok){NET.rej++;netPush();return}
  NET.acts++;go(JSON.parse(JSON.stringify(m)));netPush()}
// ---- the "your turn" chime, on every page ----
function netTurnCheck(){if(!NET.on||!G||G.over){NET.lastSide=-2;return}const s=sideToAct();const mine=s>=0&&s===NET.mySeat;if(mine&&NET.lastSide!==s&&NET.lastSide!==-2&&typeof sfx==='function')sfx('bid');NET.lastSide=s}
// ---- the start-screen block and the lobby popup ----
function optText(o){if(!o)return '';const ex=[['artisans','the Crafters'],['sultan','Wonder Cities'],['thieves','Cutpurses'],['promos','promo djinns']].filter(([k])=>o.ex&&(o.ex[k]||(k==='sultan'&&o.np===5))).map(x=>x[1]);
  return `${o.np} seats${ex.length?' · with '+ex.join(', '):' · base game'}`}
function onlineBlock(){if(!NET.ready)return '';
  if(!netAvail())return '<p class="small muted">🌐 Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online"><b>🌐 Online room <span class="code">${esc(NET.code)}</span></b> <span class="small muted">${esc(netStatus())}</span><div class="acts"><button class="btn go" data-net="lobby">Open the lobby</button><button class="btn" data-net="leave">Leave the room</button></div></div>`;
  return `<details class="exd online" ${UI.netOpen?'open':''}><summary><b>🌐 Play online</b> <small>free: your browsers connect to each other</small></summary>
   <p class="small muted">Host a game and send friends the code or link. Empty seats go to the computer.</p>
   <div class="netrow"><input id="netname" placeholder="your name" maxlength="16" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn" data-net="host">Host</button></div>
   <div class="netrow"><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="${esc(UI.joinCode||'')}"><button class="btn" data-net="join">Join</button></div>${NET.err?`<p class="small warnt">${esc(NET.err)}</p>`:''}${NET.busy?'<p class="small muted">Opening the room…</p>':''}</details>`}
function lobbyHtml(){const host=isHost();const ord=!host&&NET.opt&&Array.isArray(NET.opt.ord)?NET.opt.ord:null;const at=p=>{const k=ord?ord.indexOf(p.by):-1;return k<0?99:k};const ps=ord?NET.peers.slice().sort((a,b)=>at(a)-at(b)):NET.peers;const o=host?{np:UI.setup.np,ex:UI.setup.ex}:NET.opt;
  const rows=ps.map((p,i)=>`<li><i style="--pc:${PCOL[i]||'#999'}"></i><b>${esc(peerName(p))}</b>${p.isMe?' <small>(you)</small>':''}${p.presence&&p.presence.role==='host'?' <small>· host</small>':''}</li>`).join('');
  const seats=o?Math.min(5,Math.max(o.np,ps.length)):ps.length;const inGame=!!G&&!G.over;
  return `<div class="mbox lobby" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lobx" data-net="close" aria-label="Close">×</button><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code">${esc(NET.code)}</b> <span class="small muted">Friends open this page, choose <b>Play online</b> and type the code.</span></p>
   <div class="netrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn sm" data-net="copy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   ${NET.over?`<p class="small warnt">${esc(NET.over)}</p>`:''}<p class="small muted netst">${esc(netStatus())}</p>
   <h3>Players here (${ps.length})</h3><ul class="plist">${rows||'<li class="muted">Connecting…</li>'}</ul>
   ${host?`<h3>Game</h3><div class="seg">${[2,3,4,5].map(n=>`<button class="${UI.setup.np===n?'on':''}" data-np="${n}" ${n<ps.length?'disabled':''}>${n}</button>`).join('')}</div>
     <div class="exs">${[['artisans','The Crafters'],['sultan','Wonder Cities'],['thieves','Cutpurses'],['promos','Promo djinns']].map(([k,n])=>`<label class="chk"><input type="checkbox" data-ex="${k}" ${UI.setup.ex[k]||(k==='sultan'&&seats===5)?'checked':''} ${k==='sultan'&&seats===5?'disabled':''}> <b>${n}</b></label>`).join('')}</div>
     <p class="small">${seats} seats: ${Math.min(ps.length,5)} player${ps.length===1?'':'s'}${seats>ps.length?` and ${seats-ps.length} computer${seats-ps.length>1?'s':''}`:''}. Seats go in the order people joined.</p>
     <div class="acts"><button class="btn go" data-net="start">${inGame?'Start a new game (ends this one)':'Start the game ▶'}</button>${inGame?'<button class="btn" data-net="close">Back to the game</button>':''}<button class="btn ghost" data-net="leave">Close the room</button></div>`
   :`<p class="small">Game: <b>${esc(optText(o))||'…'}</b></p><p class="tip">${inGame?'The game is on.':'Waiting for the host to start the game…'}</p><div class="acts">${inGame?'<button class="btn go" data-net="close">Back to the game</button>':''}<button class="btn ghost" data-net="leave">Leave</button></div>`}</div>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netCloseLobby(){if(UI.modal!=='lobby')return;UI.modal=G?null:'start';render()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-net]');
  if(!b){if(UI.modal==='lobby'&&e.target&&e.target.id==='modal')netCloseLobby();
    else if(isHost()&&UI.modal==='lobby'&&e.target.closest&&e.target.closest('[data-np],[data-ex]'))setTimeout(()=>{render();netPush(true)},0);return}
  switch(b.dataset.net){
  case 'host':UI.netOpen=true;netJoin('host',NetRoom.newCode());return;
  case 'join':{UI.netOpen=true;const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return}
  case 'start':netStart();return;case 'leave':netLeave();return;case 'copy':netCopy();return;case 'lobby':UI.modal='lobby';render();return;case 'close':netCloseLobby();return}});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(t.value)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.modal==='lobby'){e.preventDefault();netCloseLobby()}if(e.target&&e.target.id==='joincode'&&e.key==='Enter'){e.preventDefault();netJoin('client',e.target.value)}});
// keep the lobby's status line fresh
setInterval(()=>{if(!NET.on)return;if(UI.modal==='lobby'||UI.modal==='start')renderModal();if(G)renderChip()},2000);
// an invite link pasted into a tab that already has the game open only changes the #hash
window.addEventListener('hashchange',()=>{const lc=typeof NetRoom!=='undefined'&&NET.lobby?NetRoom.linkCode():'';if(!lc||NET.on)return;UI.joinCode=lc;UI.netOpen=true;if(!G||G.over||UI.modal)UI.modal='start';else toast('Invite link received: open New game → Play online to join.');render()});
// closing or reloading the tab tells the others at once (otherwise WebRTC notices only after its own timeout)
window.addEventListener('pagehide',()=>{if(NET.room)try{NET.room.leave()}catch(e){}});
