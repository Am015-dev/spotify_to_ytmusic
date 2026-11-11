// ---------- online play (peer-to-peer rooms through NetRoom). The host's page runs the game; the others only draw it and send moves. ----------
// Seats go to the players in join order; empty seats are computer settlers. The tile bag's order never leaves the host:
// clients get only how many tiles are left (and the drawn tile once it is drawn).
const NET={on:false,p2p:false,ready:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,myName:'',mySeat:-1,seq:0,applied:0,last:0,timer:null,
  parts:{},hostPeer:null,peers:[],inLobby:false,err:'',busy:false,lastRx:0,gid:'',fxl:[],fxn:0,fxSeen:0,rc:null,rcSeen:0,opts:null,hostGone:false,sent:null,copied:false,remote:0};
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('rv');NET.p2p=true;NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
    const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.netOpen=true;setTimeout(()=>{const o=document.querySelector('#modal .online');if(o&&o.scrollIntoView)o.scrollIntoView({block:'nearest'})},200)}}}catch(e){}NET.ready=true;if(typeof render==='function')render()}
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netGame=()=>NET.on&&!!G&&!NET.inLobby;
// ---- joining and leaving ----
async function netJoin(role,code){if(NET.busy||!netAvail())return;NET.err='';
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('rv-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{hostLeftAt:0,busy:false,code,role,on:true,inLobby:true,mySeat:-1,hostPeer:null,parts:{},applied:0,lastRx:0,gid:'',fxSeen:0,rcSeen:0,opts:null,hostGone:false,sent:null});
  if(role==='client'){G=null;if(typeof resetScene==='function')resetScene()}
  NET.room.presence({role,uid:NET.uid,name:NET.myName,v:1}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)NET.peer=me.peer;
    if(isHost()&&G&&!NET.inLobby){let changed=false;
      ch.left.forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;changed=true;lg(`${s.nm} left the game: the computer takes over.`,'bad')}});
      ch.joined.forEach(j=>{if(j.isMe)return;const uid=j.by||(j.presence&&j.presence.uid);const s=uid&&G.pl.find(p=>p.uid===uid&&(p.peer!==j.peer||p.away));if(s){s.peer=j.peer;s.human=true;s.away=false;changed=true;lg(`${s.nm} is back and takes over the seat again.`,'good')}});
      if(changed&&!G.over){refresh()}}
    if(isHost()&&(ch.joined.length||ch.left.length))netPush(true);
    // a dropped connection can come back a moment later: only call the host gone if its packets stop too
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){if(!G||NET.inLobby)netHostGone();else NET.hostLeftAt=Date.now()}
    render()});
  UI.modal='lobby';render()}
function netHostGone(){NET.hostGone=true;if(!G||NET.inLobby){NET.err='The host closed the room.'}render()}
async function netLeave(keepModal){const r=NET.room;Object.assign(NET,{on:false,role:null,room:null,inLobby:false,mySeat:-1,hostPeer:null,err:'',hostGone:false,sent:null,peers:[],code:''});
  try{if(r)await r.leave()}catch(e){}if(!keepModal){G=null;if(typeof resetScene==='function')resetScene();openStart()}}
function netNameOf(p,fb){const pr=p.presence||{};const n=typeof pr.name==='string'?pr.name.replace(/[<>&"]/g,'').trim().slice(0,24):'';return n||fb||(p.isMe?'You':'Player')}
function netHumans(){return NET.peers.slice(0,6)}
function netSeatCount(){return Math.min(6,Math.max(UI.setup.np,netHumans().length))}
function netOpts(){const o=UI.setup;const n=netSeatCount();const ex=Object.assign({},o.ex);if(n===6)ex.ic=true;return {n,ex,lv:o.lv.slice(0,n)}}
// host: start a game with everyone in the room (join order), computer settlers in the empty seats
function netStart(){if(!isHost())return;const hum=netHumans();const o=netOpts();
  const seats=[],names=[];for(let i=0;i<o.n;i++){const h=hum[i];seats.push(h?'human':'ai');names.push(h?netNameOf(h,PNAMES[i]):PNAMES[i])}
  // two players with the same name: add the colour
  names.forEach((n,i)=>{if(names.indexOf(n)!==i||names.lastIndexOf(n)!==i)names[i]=n+' ('+PNAMES[i]+')'});
  UI.fx.length=0;UI.fxSeen=0;UI.recap=null;UI.mine=null;UI.advice=null;UI.ghost=null;NET.fxl=[];NET.rc=null;
  NET.gid=NetRoom.newCode();NET.inLobby=false;UI.modal=null;
  newGame({np:o.n,seats,names,lv:o.lv,ex:o.ex});
  G.pl.forEach((p,i)=>{const h=hum[i];p.peer=h?h.peer:null;p.uid=h?(h.by||(h.presence&&h.presence.uid)||null):null;p.away=false});
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);resetScene();refresh();fitAll(true);netPush(true)}
// ---- engine hooks on the host: remember sound/animation cues and turn recaps so the clients can replay them ----
const _fxLocal=fx;
fx=function(t,x){_fxLocal(t,x);if(isHost()&&!UI.sim){NET.fxl.push({i:++NET.fxn,t,x:x===undefined?null:x});if(NET.fxl.length>30)NET.fxl.shift()}};
function netMoveDone(before,R){if(isHost())NET.rc={id:++NET.fxn,p:before.p,mine:R.mine,recap:R.recap}}
// ---- state packets (deflate, base64, 3200-character chunks) ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
// what a client may see: everything on the table, but not the order of the bags or the random seed
function netView(){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,60);g.stackN=g.stack.length;g.rstackN=g.rstack.length;g.stack=[];g.rstack=[];delete g.rng;delete g.seed;return g}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;let body;
  if(G&&!NET.inLobby)body={code:NET.code,gid:NET.gid,g:netView(),fx:NET.fxl,rc:NET.rc};
  else{const o=netOpts();body={code:NET.code,lobby:true,opts:{n:o.n,ex:o.ex,lv:o.lv,order:netHumans().map(p=>p.peer)}}}
  packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);NET.lastSize=z.length;for(let i=0;i<n;i++)NET.room&&NET.room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
function onNetState(msg){if(!isClient())return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  // the host is the first page that sends us the game (and says it is the host)
  const pr=(NET.peers.find(p=>p.peer===msg.peer)||{}).presence||{};if(NET.hostPeer&&msg.peer!==NET.hostPeer)return;if(!NET.hostPeer&&pr.role&&pr.role!=='host')return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]});
  if(d.s<=NET.applied&&NET.hostPeer===msg.peer)return;
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;if(d.s<=NET.applied&&NET.hostPeer===msg.peer)return;
    NET.hostPeer=msg.peer;NET.applied=d.s;NET.lastRx=Date.now();NET.hostLeftAt=0;if(NET.hostGone){NET.hostGone=false;NET.err=''}applyNet(o)}).catch(()=>{})}
function applyNet(o){if(o.lobby||!o.g){NET.opts=o.opts||null;if(G&&!NET.inLobby){G=null;resetScene();UI.modal='lobby'}NET.inLobby=true;render();return}
  const g=o.g;if(!g||!Array.isArray(g.pl)||!g.tiles)return;
  const fresh=o.gid!==NET.gid;const prevLen=G?G.order.length:0;
  g.stack=new Array(Math.max(0,g.stackN|0)).fill(-1);g.rstack=new Array(Math.max(0,g.rstackN|0)).fill(-1);G=g;
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);NET.inLobby=false;
  if(fresh){NET.gid=o.gid;UI.fx.length=0;UI.fxSeen=0;UI.recap=null;UI.mine=null;UI.advice=null;UI.ghost=null;NET.fxSeen=0;NET.rcSeen=0;UI.fitTurn=-1;if(UI.modal==='lobby'||UI.modal==='start')UI.modal=null;resetScene();
    const fl=Array.isArray(o.fx)?o.fx:[];NET.fxSeen=fl.length?fl[fl.length-1].i:0;if(o.rc)NET.rcSeen=o.rc.id}
  // replay the host's sound/animation cues we have not seen yet
  if(Array.isArray(o.fx))for(const f of o.fx){if(!f||!(f.i>NET.fxSeen))continue;NET.fxSeen=f.i;if(typeof f.t==='string')UI.fx.push({t:f.t,x:f.x})}
  const rc=o.rc;if(rc&&rc.id>NET.rcSeen){NET.rcSeen=rc.id;if(rc.p===NET.mySeat){if(rc.mine)UI.mine=rc.mine}else if(rc.recap)UI.recap=rc.recap}
  if(NET.sent&&NET.sent.ts!==G.turn+':'+G.step)NET.sent=null;
  // the host thinks we left (a dropped connection): say hello so it gives the seat back
  if(NET.mySeat>=0&&G.pl[NET.mySeat].away&&!G.over&&Date.now()-(NET.hiT||0)>2500){NET.hiT=Date.now();NET.room.emit('act',{act:'hi'}).catch(()=>{})}
  refresh();if(fresh)fitAll(true);
  // someone else's tile landed off screen: look at it
  else if(G.order.length>prevLen&&V3.on&&!me()){const k=G.order[G.order.length-1];const sp=screenOf(cellWorld(...unkey(k)));const R=V3.r.domElement;if(!sp.in||sp.x<R.clientWidth*.12||sp.x>R.clientWidth*.88||sp.y<R.clientHeight*.12||sp.y>R.clientHeight*.88)focusCell(k)}}
// ---- client -> host moves ----
function netSend(m){if(!NET.room||!G)return;const ts=G.turn+':'+G.step;const d={act:String(m.act).slice(0,8),ts};
  if(m.act==='place'){d.x=m.x;d.y=m.y;d.r=m.r}else if(m.act==='fig'){d.k=m.k;d.l=m.l}
  NET.sent={ts,t:Date.now()};NET.room.emit('act',d).catch(()=>{});refreshUI()}
// a move has been sent and the host has not answered yet: don't let the player act twice
function netWaiting(){return isClient()&&NET.sent&&G&&NET.sent.ts===G.turn+':'+G.step&&Date.now()-NET.sent.t<5000}
const NETFIG=['f','big','bld','pig'];
function onNetAct(msg){if(!isHost()||!G||NET.inLobby||G.over)return;const d=msg.data;if(!d||typeof d!=='object'||Array.isArray(d))return;
  let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  // a seat that was handed to the computer: its player is talking to us again (same page, or the same browser after a reload)
  if(seat<0){const s=G.pl.find(p=>p.away&&(p.peer===msg.peer||(msg.by&&p.uid===msg.by)));if(s){s.peer=msg.peer;s.human=true;s.away=false;lg(`${s.nm} is back and takes over the seat again.`,'good');refresh();netPush(true)}return}
  if(d.act==='hi'||seat!==sideToAct())return;
  if(d.ts!==G.turn+':'+G.step)return;
  const I=v=>Number.isInteger(v)&&Math.abs(v)<400;let m=null;
  if(d.act==='place'&&I(d.x)&&I(d.y)&&[0,1,2,3].includes(d.r))m={act:'place',x:d.x,y:d.y,r:d.r};
  else if(d.act==='fig'&&NETFIG.includes(d.k)&&Number.isInteger(d.l)&&d.l>=0&&d.l<16)m={act:'fig',k:d.k,l:d.l};
  else if(d.act==='skip')m={act:'skip'};
  if(!m)return;const r=performMove(m,seat);if(r.success){NET.remote++;netPush()}}
// ---- your-turn cue (online only) ----
function netTurnCue(){if(!NET.on||!G)return;const mine=!!me();if(mine&&!NET.wasMine&&typeof sfx==='function')sfx('myturn');NET.wasMine=mine}
// ---- words for the panels ----
function netStatus(){if(!NET.on)return '';if(NET.hostGone)return 'Host left';
  if(isClient()&&(NET.hostLeftAt||(NET.lastRx&&Date.now()-NET.lastRx>8000)))return 'Reconnecting…';
  const n=NET.peers.length;return n<=1?'Looking for players…':`${n} players online`}
setInterval(()=>{if(isClient()&&G&&!NET.inLobby&&!G.over&&!NET.hostGone&&NET.lastRx&&(Date.now()-NET.lastRx>25000||(NET.hostLeftAt&&Date.now()-NET.lastRx>8000&&Date.now()-NET.hostLeftAt>8000)))netHostGone();
  if(NET.on&&G&&!NET.inLobby&&typeof renderBar==='function'){const s=netStatus();if(s!==NET.lastStat){NET.lastStat=s;renderBar()}}},1000);
function netOptsWords(o){if(!o)return 'The host is choosing the game…';const ex=Object.keys(SETN).filter(k=>k!=='base'&&o.ex&&o.ex[k]).map(k=>SETN[k]);
  const hum=Math.min(o.n,netHumans().length);const ai=o.n-hum;const lv=[...new Set((o.lv||[]).slice(hum))];
  return `<b>${o.n} seats</b> · expansions: <b>${ex.length?esc(ex.join(', ')):'none'}</b>${ai>0?` · ${ai} computer settler${ai>1?'s':''}${lv.length?' ('+esc(lv.join('/'))+')':''}`:''}`}
function lobbyHtml(){const host=isHost();let ps=NET.peers;
  // clients list the players in the host's seat order (the host knows who joined first)
  const ord=!host&&NET.opts&&Array.isArray(NET.opts.order)?NET.opts.order:null;if(ord){const ix=p=>{const i=ord.indexOf(p.peer);return i<0?99:i};ps=ps.slice().sort((a,b)=>ix(a)-ix(b))}const link=NetRoom.inviteLink(NET.code);
  const rows=ps.map((p,i)=>`<li><i style="--pc:${PCOL[i]||'#999'}"></i><b>${esc(netNameOf(p,PNAMES[i]))}</b>${p.isMe?' <small>(you)</small>':''}${(p.presence||{}).role==='host'?' <small>· host</small>':''}</li>`).join('');
  const st=NET.err?`<p class="warn">${esc(NET.err)}</p>`:`<p class="nstat small">${ps.length<=1?'<span class="dotp"></span> Looking for players…':`${ps.length} players here`}</p>`;
  const opts=host?netOpts():NET.opts;
  return `<div class="mbox lobby" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x mx" data-net="close" aria-label="Close">×</button><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code">${esc(NET.code)}</b></p>
   <div class="small">Friends open this page, press <b>Join</b> and type the code, or open this link:
     <div class="invrow"><input class="invlink" readonly value="${esc(link)}" aria-label="Invite link"><button class="btn sm" data-net="copy">${NET.copied?'Copied':'Copy link'}</button></div></div>
   ${st}<h3>Players (${ps.length})</h3><ul class="plist">${rows}</ul>
   <p class="small">${netOptsWords(opts)}${host?'<br><span class="hint">To change the seats or expansions, close this and change them on the start screen.</span>':''}</p>
   ${host?`<div class="acts"><button class="btn go" data-net="start">Start the game with ${ps.length} player${ps.length===1?'':'s'}</button><button class="btn" data-net="leave">Close the room</button></div>`
     :`<p class="tip">${NET.hostGone?'The host closed the room.':'Waiting for the host to start the game…'}</p><div class="acts"><button class="btn" data-net="leave">Leave</button></div>`}</div>`}
function onlineBlock(){if(!NET.ready)return '';
  if(!netAvail())return '<p class="small netna">🌐 Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online"><h3>🌐 Online game</h3><p class="small">You are in room <b class="code">${esc(NET.code)}</b> · ${esc(netStatus())}</p>
    <div class="acts"><button class="btn" data-net="lobby">Open the lobby</button><button class="btn ghost" data-net="leave">Leave the room</button></div></div>`;
  if(!UI.netOpen)return `<div class="acts"><button class="btn" data-net="open">🌐 Play online</button></div>`;
  return `<div class="online"><h3>🌐 Play online with friends</h3><p class="small">Free and direct: your browsers connect to each other. One player hosts and sends the others the code or the link. The seats and expansions above are the host’s.</p>
    <div class="orow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}" aria-label="Your name"><button class="btn" data-net="host">Host a game</button></div>
    <div class="orow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}" aria-label="Invite code"><button class="btn" data-net="join">Join</button></div>
    ${NET.err&&!NET.on?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netUi(a){switch(a){
  case 'open':UI.netOpen=true;render();setTimeout(()=>{const i=document.getElementById('netname');if(i&&!i.value)i.focus()},0);return;
  case 'host':netJoin('host',NetRoom.newCode());return;
  case 'join':{const i=document.getElementById('joincode');netJoin('client',i?i.value:UI.joinCode);return}
  case 'lobby':UI.modal='lobby';render();return;
  case 'close':UI.modal=netGame()?null:'start';render();return;
  case 'start':netStart();return;case 'copy':netCopy();return;
  case 'leave':netLeave();return}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-net]');if(b){e.stopPropagation();netUi(b.dataset.net);return}
  if(e.target&&e.target.id==='modal'&&UI.modal==='lobby')netUi('close')});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(t.value)});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netUi('join')}else if(t&&t.id==='netname'&&e.key==='Enter'){e.preventDefault();netUi('host')}
  else if(e.key==='Escape'&&UI.modal==='lobby'){e.preventDefault();netUi('close')}});
