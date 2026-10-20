// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC). The host's page runs the game; the others only send moves. ----------
// Seats go to the players in join order (the host first); empty seats go to the computer. A player who leaves is replaced by the computer
// and gets the seat back on rejoining (matched by NetRoom.uid). If the host leaves mid-game, the lowest seated player's page takes over.
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',note:'',busy:false,ready:false,ep:0,lastRx:0,dead:[],expect:null,fxSeen:0,gid:null,myName:'',copied:false,opt:null,wasMine:false,hostGone:false,starting:false,
  remote:0,rejected:0,sent:0};
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netAvail=()=>!!NET.lobby;
const cleanName=s=>String(s||'').replace(/[<>&"'`]/g,'').trim().slice(0,24);
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('sgz');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.onl=true}}}catch(e){console.error(e)}NET.ready=true}
function netClearAi(){if(aiTimer){clearTimeout(aiTimer);aiTimer=null}}
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  NET.busy=true;render();let room;
  try{if(NET.room){try{await NET.room.leave()}catch(e){}NET.room=null}room=await NET.lobby.join('sgz-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{busy:false,code,role,on:true,room,mySeat:-1,hostPeer:null,parts:{},applied:0,ep:0,lastRx:0,dead:[],expect:null,fxSeen:0,gid:null,hostGone:false,note:'',peer:room.self,peers:[],opt:null,wasMine:false});
  G=null;netClearAi();UI.sel=null;UI.tgt=null;UI.adv=null;UI.pause=false;resetScene();
  room.presence({role,uid:NET.uid,name:NET.myName||''}).catch(()=>{});
  room.on('st',onNetState);room.on('act',onNetAct);room.on('adv',onNetAdv);
  room.onPeers(onNetPeers);room.onConnection(c=>{NET.conn=c;render()});
  if(GX.open)GX.close();UI.modal='lobby';render();if(role==='host')netPush(true)}
async function netLeave(){const r=NET.room;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',note:'',hostGone:false,peers:[],gid:null});
  try{if(r)await r.leave()}catch(e){}G=null;netClearAi();UI.sel=null;UI.tgt=null;UI.adv=null;resetScene();UI.modal='start';render()}
function onNetPeers(ch){NET.peers=ch.peers||[];
  if(isHost()&&G){let chg=false;
    (ch.left||[]).forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;chg=true;lg(`${s.nm} left the game: the computer plays for them now.`,'bad')}});
    (ch.joined||[]).forEach(j=>{if(j.isMe)return;const u=j.by;const s=u&&G.pl.find(p=>p.away&&p.uid===u);if(s){s.peer=j.peer;s.human=true;s.away=false;NET.dead=NET.dead.filter(x=>x!==j.peer);chg=true;lg(`${s.nm} is back and takes their seat again.`,'good')}});
    if(chg)refresh()}
  if(isHost()&&((ch.joined||[]).length||(ch.left||[]).length))netPush(true);
  if(isClient()&&NET.hostPeer&&(ch.left||[]).some(p=>p.peer===NET.hostPeer)){if(G&&!G.over)netMigrate(NET.hostPeer);else{NET.hostGone=true;NET.err=G?'The host left.':'The host closed the room.'}}
  render()}
// the lobby's player order is the host's join order; seat i goes to player i
function lobbyPlayers(){if(isClient()&&NET.opt&&Array.isArray(NET.opt.pl))return NET.opt.pl.slice(0,12).map(p=>({nm:cleanName(p&&p.nm),by:p&&typeof p.by==='string'?p.by:'',host:!!(p&&p.host),me:!!(p&&p.by&&p.by===NET.uid)}));
  return NET.peers.map(p=>({nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name)),by:p.isMe?NET.uid:(p.by||''),host:p.isMe?isHost():!!(p.presence&&p.presence.role==='host'),me:!!p.isMe}))}
function lobbyOpt(){const o=UI.setup;return {np:o.np,ex:{gray:!!o.ex.gray,prism:!!o.ex.prism},lv:o.lv.slice(0,4),pl:lobbyPlayers()}}
function netStart(){if(!isHost())return;const o=UI.setup;
  const hum=NET.peers.slice(0,4).map(p=>({peer:p.peer,uid:p.isMe?NET.uid:(p.by||null),nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,nm:cleanName(NET.myName)});
  const np=Math.min(4,Math.max(o.np,hum.length));const seats=[],names=[],lv=[];
  for(let i=0;i<np;i++){const h=hum[i];seats.push(h?'human':'ai');names.push(h&&h.nm?h.nm:PNAMES[i]);lv.push(o.lv[i]||'normal')}
  netClearAi();UI.guideNote=null;UI.fx.length=0;UI.fxSeen=0;UI.fxN=0;UI.recap=[];UI.sel=null;UI.tgt=null;UI.adv=null;UI.lastHuman=null;UI.modal=null;UI.pause=false;
  NET.starting=true;try{newGame({np,seats,names,lv,ex:Object.assign({},o.ex),mode:'x'})}finally{NET.starting=false}
  G.gid=NetRoom.newCode()+Date.now().toString(36);G.pl.forEach((p,i)=>{const h=hum[i];p.peer=h?h.peer:null;p.uid=h?h.uid:null;p.away=false});
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);NET.gid=G.gid;NET.wasMine=false;resetScene();refresh();netPush(true)}
// ---- state packets: JSON of G (log trimmed), deflate-compressed, cut into chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u).catch(()=>{});w.close().catch(()=>{});return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function netPush(force){if(!isHost()||!NET.room||NET.starting)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;let body;
  if(G){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,60);body={code:NET.code,ep:NET.ep,g,fx:UI.fx.slice(-30).filter(f=>f.n)}}
  else body={code:NET.code,ep:NET.ep,lobby:true,opt:lobbyOpt()};
  const room=NET.room;packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
// called at the end of every refresh(): the host pushes the new state; everyone gets a chime when a decision becomes theirs
function netAfter(){if(!NET.on)return;const mine=!!me();if(mine&&!NET.wasMine)sfx('turn');NET.wasMine=mine;if(isHost())netPush()}
function onNetState(msg){NET.rx=(NET.rx||0)+1;if(!NET.on||msg.isMe)return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  if(NET.dead.includes(msg.peer))return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const i=x.lastIndexOf(':');if(x.slice(0,i)===msg.peer&&+x.slice(i+1)<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;const ep=o.ep|0;
    // only a seated player may take over as host (anyone, before there is a game)
    const seated=!G||G.pl.some(p=>p.peer===msg.peer);
    if(isHost()){if(!seated||!(ep>NET.ep||(ep===NET.ep&&msg.peer<NET.peer)))return;
      NET.role='client';netClearAi();NET.hostPeer=msg.peer;NET.ep=ep;NET.applied=d.s;NET.room.presence({role:'client'}).catch(()=>{})}
    else{if(!NET.hostPeer||(ep>NET.ep&&seated)){if(NET.hostPeer&&NET.hostPeer!==msg.peer)NET.applied=0;NET.hostPeer=msg.peer;NET.ep=Math.max(NET.ep,ep);NET.expect=null;NET.note=''}
      if(msg.peer!==NET.hostPeer||ep<NET.ep||d.s<=NET.applied)return;NET.applied=d.s}
    NET.lastRx=Date.now();applyNet(o)}).catch(e=>{NET.bad=(NET.bad||0)+1;NET.badE=String(e)})}
function validState(g){return g&&typeof g==='object'&&Array.isArray(g.pl)&&g.pl.length>=2&&g.pl.length<=4&&Array.isArray(g.fac)&&Array.isArray(g.ctr)&&Array.isArray(g.log)&&Array.isArray(g.bag)&&Array.isArray(g.lid)}
function applyNet(o){
  if(o.lobby||!o.g){NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;if(G){G=null;UI.modal='lobby';resetScene()}render();return}
  if(!validState(o.g))return;const g=o.g;const fresh=g.gid!==NET.gid;
  if(fresh){NET.gid=g.gid;NET.fxSeen=0;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.sel=null;UI.tgt=null;UI.adv=null;UI.lastHuman=null;UI.guideNote=null;if(UI.modal)UI.modal=null;if(GX.open)GX.close()}
  const prevLog=G?G.logN:-1;G=g;NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  const fx=Array.isArray(o.fx)?o.fx.filter(f=>f&&typeof f.t==='string'&&Number.isInteger(f.n)):[];
  if(fresh&&G.turn>0){for(const f of fx)NET.fxSeen=Math.max(NET.fxSeen,f.n)}// joined mid-game: don't replay old sounds
  for(const f of fx)if(f.n>NET.fxSeen){UI.fx.push(f);NET.fxSeen=f.n}
  const mine=!!me();if(!mine||G.logN!==prevLog){UI.adv=null;UI.advWait=false;NET.pend=null}
  if(!mine){UI.sel=null;UI.tgt=null;UI.hover=null}else if(UI.sel&&(G.phase!=='offer'||!movesFor(UI.sel).length)){UI.sel=null;UI.tgt=null}
  // the host thinks my seat is empty (I reconnected): say hello so it gives the seat back
  const mySeatAway=NET.mySeat>=0?G.pl[NET.mySeat].away:G.pl.some(p=>p.away&&p.uid&&p.uid===NET.uid);
  if(mySeatAway&&NET.room&&Date.now()-(NET.hiT||0)>2500){NET.hiT=Date.now();netSend({act:'hi'})}
  if(fresh)resetScene();refresh()}
// ---- host migration: if the host leaves, the seated player with the lowest seat number takes over from the last state ----
function netMigrate(gone,why){if(!isClient()||!G||G.over)return;NET.dbg=(NET.dbg||[]).concat([(why||'left')+'@'+G.turn]).slice(-10);if(gone&&!NET.dead.includes(gone))NET.dead.push(gone);
  const here=new Set(NET.peers.map(p=>p.peer));
  const cand=G.pl.filter(p=>p.human&&p.peer&&!NET.dead.includes(p.peer)&&(here.has(p.peer)||p.peer===NET.peer));
  const next=cand[0];NET.lastRx=Date.now();
  if(!next){NET.hostGone=true;NET.err='The host left. The game is over.';render();return}
  if(next.peer!==NET.peer){NET.expect=next.peer;NET.note=`The host left. ${next.nm}'s page is taking over…`;render();return}
  G.pl.forEach(p=>{if(p.human&&p.peer!==NET.peer&&(NET.dead.includes(p.peer)||!here.has(p.peer))){p.human=false;p.away=true}});
  NET.role='host';NET.ep++;NET.hostPeer=NET.peer;NET.expect=null;NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);UI.fxN=NET.fxSeen;NET.note='';NET.err='';
  lg(`The host left. ${G.pl[NET.mySeat].nm}'s page runs the game now.`,'big');
  NET.room.presence({role:'host'}).catch(()=>{});refresh();netPush(true)}
// silence alone is usually a busy or backgrounded host tab (browsers slow its timers): wait. Take over after 60 s, or at once when the host's
// connection is reported gone (onPeers 'left'); the peer we expected to take over gets 20 s before the next in line steps in.
setInterval(()=>{if(!isClient()||!G||G.over||!NET.lastRx)return;const q=Date.now()-NET.lastRx;const here=NET.peers.some(p=>p.peer===NET.hostPeer);
  if(NET.expect?q>20000:(q>60000||(!here&&q>8000)))netMigrate(NET.expect||NET.hostPeer,'silent')},1000);
// ---- client -> host ----
function netSend(d){if(!NET.room)return;NET.sent++;const p=NET.hostPeer?NET.room.sendTo(NET.hostPeer,'act',d):NET.room.emit('act',d);p.catch(()=>{})}
// a client's move: rebuilt only from the legal moves of that seat, so nothing a client sends can reach the rules unchecked
function matchMove(d,seat){if(!d||(d.act!=='take'&&d.act!=='wall'))return null;
  return validMoves(seat).find(v=>Object.keys(v).every(k=>k==='act'?v.act===d.act:Number.isInteger(d[k])&&v[k]===d[k]))||null}
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;const d=msg.data;if(!d||typeof d!=='object'||Array.isArray(d))return;
  let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  if(seat<0){const s=G.pl.find(p=>p.away&&(p.peer===msg.peer||(msg.by&&p.uid===msg.by)));
    if(s){s.peer=msg.peer;s.human=true;s.away=false;NET.dead=NET.dead.filter(x=>x!==msg.peer);lg(`${s.nm} is back and takes their seat again.`,'good');refresh()}return}
  if(d.act==='hi')return;
  if(G.over||seat!==sideToAct()){if(d.act!=='advise')NET.rejected++;return}
  if(d.act==='advise'){const a=adviceFor(seat);if(a)NET.room.sendTo(msg.peer,'adv',{m:a.m,why:a.why,k:G.logN}).catch(()=>{});return}
  const m=matchMove(d,seat);if(!m){NET.rejected++;return}
  const r=performMove(m,seat);if(r.success)NET.remote++;else NET.rejected++}
function onNetAdv(msg){if(!isClient()||msg.peer!==NET.hostPeer||!G)return;const d=msg.data;const p=me();UI.advWait=false;if(!p||!d||d.k!==G.logN)return;
  const m=matchMove(d.m,p.i);if(!m)return;showAdvice({m,why:String(d.why||'').slice(0,400)})}
// ---- panels ----
function netStatus(){const n=NET.peers.length;
  if(NET.hostGone||NET.err)return `<span class="warn">${esc(NET.err||'The host left.')}</span>`;
  if(NET.note)return esc(NET.note);
  if(NET.conn===false)return 'Connecting…';
  if(isClient()&&NET.lastRx&&Date.now()-NET.lastRx>7000)return 'Reconnecting…';
  if(isClient()&&!NET.lastRx)return 'Looking for the host…';
  if(n<=1)return 'Looking for players…';return `${n} players connected`}
function netDockHtml(){if(!NET.on)return '';const s=NET.mySeat>=0&&G?G.pl[NET.mySeat]:null;
  return `<div class="netst small"><span>🌐 Room <b>${esc(NET.code)}</b>${s?` · you are <b style="color:${PCOL[s.i]}">${esc(s.nm)}</b>`:G?' · watching':''}${isHost()?' · you host':''} · <span class="nst">${netStatus()}</span></span><button class="btn sm ghost" data-a="netopen">Lobby</button><button class="btn sm ghost" data-a="netleave">Leave</button></div>`}
function lobbyHTML(){const host=isHost();const ps=lobbyPlayers();const o=host?lobbyOpt():(NET.opt||null);
  const rows=ps.map((p,i)=>`<li>${i<4?`<i style="background:${PCOL[i]}"></i>`:'<i class="w"></i>'}<b>${esc(p.nm||'Player')}</b>${p.me?' (you)':''}${p.host?' · host':''}${i>=4?' · watching':''}</li>`).join('')||'<li class="muted">Connecting…</li>';
  let opts='';if(o){const np=Math.min(4,Math.max(o.np|0,ps.length));const vs=[o.ex&&o.ex.gray?'unmarked mosaic':'',o.ex&&o.ex.prism?'prism tiles':''].filter(Boolean).join(', ')||'none';
    const ai=np-Math.min(4,ps.length);const lvs=(o.lv||[]).slice(Math.min(4,ps.length),np).map(x=>esc(String(x))).join(', ');
    opts=`<p class="small">Game: <b>${np} glaziers</b> · variants: <b>${vs}</b>${ai>0?` · ${ai} computer seat${ai>1?'s':''} (<b>${lvs}</b>)`:''}.${host?' To change this, close this panel and use the start screen.':''}</p>`}
  const inGame=!!G;
  return `<div class="mbox lobby" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lbx" data-a="netclose" aria-label="Close">×</button><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code">${esc(NET.code)}</b></p>
   <div class="invrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn sm" data-a="netcopy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   <p class="small muted">Send friends the link, or they open Sunglaze, choose 🌐 Play online and type the code.</p>
   <p class="small nst">${netStatus()}</p>
   <h3>Players (${ps.length})</h3><ul class="plist">${rows}</ul>${opts}
   ${host?`<div class="acts"><button class="btn go" data-a="netstart">${inGame?'Start a new game':'Start the game'} with ${Math.min(4,ps.length)} player${ps.length===1?'':'s'}</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tip small">${inGame?'The host can start a new game from here.':'Waiting for the host to start the game…'}</p><div class="acts"><button class="btn" data-a="netleave">Leave</button></div>`}</div>`}
function onlineBlock(){let h='';
  if(!NET.ready)h='<p class="small muted">Checking online play…</p>';
  else if(!netAvail())h='<p class="small muted">Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  else if(NET.on)h=`<p class="small">You are in online room <b>${esc(NET.code)}</b> · ${netStatus()}</p><div class="acts"><button class="btn sm go" data-a="netopen">Open the lobby</button><button class="btn sm" data-a="netleave">Leave the room</button></div>`;
  else h=`<p class="small muted">Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link.</p>
    <div class="nrow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn sm go" data-a="nethost">Host a game</button></div>
    <div class="nrow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="${esc(UI.joinCode||'')}"><button class="btn sm" data-a="netjoin">Join</button></div>${NET.busy?'<p class="small muted">Opening the room…</p>':''}${NET.err?`<p class="small warn">${esc(NET.err)}</p>`:''}`;
  return `<details class="online" id="onl"${UI.onl||NET.on?' open':''}><summary>🌐 Play online</summary>${h}</details>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netClose(){UI.modal=G?null:'start';render();if(G)refresh()}
// returns true when the click was an online-play button
function netClick(a){switch(a){
  case 'nethost':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('host',NetRoom.newCode());return true}
  case 'netjoin':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return true}
  case 'netstart':netStart();return true;case 'netleave':netLeave();return true;case 'netcopy':netCopy();return true;
  case 'netclose':netClose();return true;case 'netopen':if(GX.open)GX.close();UI.modal='lobby';render();return true}return false}
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined'){NET.myName=NetRoom.setName(t.value)}});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netClick('netjoin');return}
  if(t&&t.id==='netname'&&e.key==='Enter'){e.preventDefault();netClick('nethost');return}
  if(e.key==='Escape'&&UI.modal==='lobby'){e.preventDefault();netClose()}});
document.addEventListener('click',e=>{if(UI.modal==='lobby'&&e.target&&e.target.id==='modal')netClose()});
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='onl')UI.onl=e.target.open},true);
// the lobby keeps showing the live player count
setInterval(()=>{if(!NET.on)return;const st=netStatus()+'|'+NET.peers.length;if(st!==NET.lastSt){NET.lastSt=st;render()}},1000);
