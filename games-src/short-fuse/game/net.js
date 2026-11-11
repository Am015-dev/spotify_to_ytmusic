// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The host's page runs the game and the computer seats. Every other player's page only draws what ITS seat may see: the host sends each
// peer its own copy of the state made by netStrip(G, seat) (src/netstrip.js: other crew's wires, decks, seed ... are blanked) and the peer
// sends back small move messages that the host checks (seat owner + legal()) before it applies them. Seats go to the players in join order
// (host first), empty seats go to the computer. A player who leaves is replaced by the computer and gets the seat back on rejoining (same
// browser uid). If the host leaves, the game is over (the others never hold the hidden state, so nobody can take over).
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',busy:false,ready:false,lastRx:0,gid:null,myName:'',copied:false,opt:null,hostGone:false,starting:false,remote:0,rejected:0,sent:0,rx:0,
  seatPeer:[],seatUid:[],applied:0,pend:-1,pendT:0,conn:null,lastSt:'',trace:null};
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netAvail=()=>!!NET.lobby;
const cleanName=s=>String(s||'').replace(/[<>&"'`]/g,'').trim().slice(0,24);
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('shortfuse');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
  const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.onl=true}}}catch(e){console.error(e)}NET.ready=true}
function netIdle(){clearTimeout(UI.aiT);UI.aiT=null;G=null;UI.started=false;UI.sel=null;UI.res=null;UI.prev=null;UI.pause=false;UI.dockSig=null;kitReset();
  try{$('#dockt').textContent='Short Fuse online'}catch(e){}}
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';code=NetRoom.cleanCode(code);
  if(!code){NET.err='Type the invite code first.';netRender();return}
  NET.busy=true;netRender();let room;
  try{if(NET.room){try{await NET.room.leave()}catch(e){}NET.room=null}room=await NET.lobby.join('sf-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';netRender();return}
  Object.assign(NET,{busy:false,code,role,on:true,room,mySeat:-1,hostPeer:null,parts:{},applied:0,lastRx:0,gid:null,hostGone:false,peer:room.self,peers:[],opt:null,seatPeer:[],seatUid:[],pend:-1});
  if(G||UI.started)netIdle();
  room.presence({role,uid:NET.uid,name:NET.myName||''}).catch(()=>{});
  room.on('st',onNetState);room.on('act',onNetAct);room.on('rej',onNetRej);
  room.onPeers(onNetPeers);room.onConnection(c=>{NET.conn=c;netRender()});
  if(role==='client'){hideStart();idleDock()}
  if(GX.open)GX.close();UI.netOpen=true;netRender();if(role==='host')netPush(true)}
async function netLeave(){const r=NET.room;const was=NET.on;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',hostGone:false,peers:[],gid:null,opt:null,seatPeer:[],seatUid:[]});
  try{if(r)await r.leave()}catch(e){}if(!was)return;UI.netOpen=false;netIdle();showStart();netRender()}
function idleDock(){const m=$('#main');if(m)m.innerHTML='<div class="card wait"><h3>Waiting for the host…</h3><p class="hint">The host picks the job and starts it. Your seat and your wires appear here.</p></div>'}
function onNetPeers(ch){NET.peers=ch.peers||[];
  if(isClient()){const h=NET.peers.find(p=>!p.isMe&&p.presence&&p.presence.role==='host');if(h)NET.hostPeer=h.peer;
    if(NET.hostPeer&&(ch.left||[]).some(p=>p.peer===NET.hostPeer)){NET.hostGone=true;NET.err=G?'The host left. The game is over.':'The host closed the room.';UI.netOpen=true}}
  if(isHost()){let chg=false;
    (ch.left||[]).forEach(l=>{const i=NET.seatPeer.indexOf(l.peer);if(G&&i>=0&&G.seats[i].human){G.seats[i].human=false;G.seats[i].away=true;chg=true;lg(`${G.seats[i].nm} left the game: the computer plays for them now.`,'bad')}});
    (ch.joined||[]).forEach(j=>{if(j.isMe||!G||!j.by)return;const i=NET.seatUid.findIndex((u,k)=>u&&u===j.by&&G.seats[k]&&G.seats[k].away);if(i>=0){netRestore(i,j.peer);chg=true}});
    if((ch.joined||[]).length||(ch.left||[]).length)netPush(true);
    if(chg&&G)refresh()}
  netRender();netRestart()}
// the start screen's seat rows follow the lobby (keeps the scroll position)
function netRestart(){const st=$('#start');if(!st||st.hidden||!isHost()||!UI.setup)return;const ps=[...st.querySelectorAll('.pane')].map(x=>x.scrollTop);renderStart();st.querySelectorAll('.pane').forEach((x,i)=>{x.scrollTop=ps[i]||0})}
function netRestore(i,peer){NET.seatPeer[i]=peer;G.seats[i].human=true;G.seats[i].away=false;lg(`${G.seats[i].nm} is back and takes their seat again.`,'good');UI.dockSig=null}
// ---- the lobby: players in join order (the host first); seat i goes to player i ----
function lobbyPlayers(){if(isClient()&&NET.opt&&Array.isArray(NET.opt.pl))return NET.opt.pl.slice(0,12).map(p=>({nm:cleanName(p&&p.nm),by:p&&typeof p.by==='string'?p.by:'',host:!!(p&&p.host),me:!!(p&&p.by&&p.by===NET.uid),seat:p&&Number.isInteger(p.seat)?p.seat:-1}));
  return NET.peers.map(p=>{const by=p.isMe?NET.uid:(p.by||'');const i=NET.seatUid.indexOf(by);
    return {nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))||'Player',by,host:p.isMe?isHost():!!(p.presence&&p.presence.role==='host'),me:!!p.isMe,seat:G&&by&&i>=0?i:-1}})}
// who gets which seat for the job on the start screen: null + a reason when the job cannot take that many players
function netPlan(s){const hum=NET.peers.slice(0,5).map(p=>({peer:p.peer,uid:p.isMe?NET.uid:(p.by||null),nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,nm:cleanName(NET.myName)});
  const M=MISSIONS[s.job];const np=M.pl.find(x=>x>=Math.max(s.np,hum.length));
  if(!np)return {err:`Job ${s.job} takes ${M.pl[0]}-${M.pl[M.pl.length-1]} players and ${hum.length} are here. Pick another job.`};
  const seats=[],names=[],used=new Set();
  for(let i=0;i<np;i++){const h=hum[i];let n=h?(h.nm||DEFNAMES[i]):(s.names[i]||DEFNAMES[i]);if(used.has(n.toLowerCase()))n=n.slice(0,20)+' '+(i+1);used.add(n.toLowerCase());seats.push(h?'human':'ai');names.push(n)}
  return {np,seats,names,hum}}
function lobbyOpt(){const s=UI.setup||defaultSetup();const p=netPlan(s);const j=MISSIONS[s.job];
  return {job:s.job,jn:j.nm,np:p.np||s.np,err:p.err||'',lv:s.lv,pl:lobbyPlayers().map(x=>({nm:x.nm,by:x.by,host:x.host,seat:x.seat}))}}
// host: called by startJob after newGame; binds the humans to the seats
function netBound(plan){NET.seatPeer=plan.hum.map(h=>h.peer);NET.seatUid=plan.hum.map(h=>h.uid);G.gid=NetRoom.newCode()+Date.now().toString(36);NET.gid=G.gid;NET.mySeat=NET.seatPeer.indexOf(NET.peer);G.seats.forEach(q=>{q.away=false});NET.pend=-1}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u).catch(()=>{});w.close().catch(()=>{});return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function sendPacked(room,target,body,seq){packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++){const d={s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)};(target?room.sendTo(target,'st',d):room.emit('st',d)).catch(()=>{})}})}
function netPush(force){if(!isHost()||!NET.room||NET.starting)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;const room=NET.room;const opt=lobbyOpt();
  if(!G){sendPacked(room,null,{code:NET.code,lobby:true,opt},seq);return}
  // every peer gets ITS OWN stripped copy: nobody receives another seat's hidden wires, the decks or the seed
  for(const p of NET.peers){if(p.isMe)continue;const seat=NET.seatPeer.indexOf(p.peer);
    sendPacked(room,p.peer,{code:NET.code,gid:G.gid,seat,pz:UI.pause?1:0,opt,g:netStrip(G,seat)},seq)}}
setInterval(()=>{if(isHost())netPush(true)},3000);
// the end of every refresh(): the host pushes the new state
function netAfter(){if(!NET.on)return;netDock();if(isHost())netPush()}
function onNetState(msg){NET.rx++;if(!NET.on||msg.isMe||!isClient())return;const d=msg.data;
  if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<80)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  if(!NET.hostPeer||msg.peer!==NET.hostPeer)return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const i=x.lastIndexOf(':');if(x.slice(0,i)===msg.peer&&+x.slice(i+1)<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code||!NET.on)return;if(d.s<=NET.applied)return;NET.applied=d.s;NET.lastRx=Date.now();
    if(window.NET_TRACE){(NET.trace=NET.trace||[]).push(txt)}applyNet(o)}).catch(e=>{NET.bad=(NET.bad||0)+1;NET.badE=String(e)})}
function validState(g){return g&&typeof g==='object'&&Array.isArray(g.st)&&Array.isArray(g.seats)&&g.seats.length>=2&&g.seats.length<=5&&Array.isArray(g.log)&&Array.isArray(g.pos)&&g.ms&&typeof g.ms==='object'&&MISSIONS[g.mission]&&typeof g.gid==='string'}
function applyNet(o){
  if(o.lobby||!o.g){NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;if(G||UI.started){netIdle();hideStart();idleDock()}NET.gid=null;netRender();return}
  if(!validState(o.g))return;const g=o.g;const fresh=g.gid!==NET.gid;NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;
  G=g;NET.mySeat=Number.isInteger(o.seat)&&o.seat>=0&&o.seat<g.seats.length?o.seat:-1;UI.pause=!!o.pz;
  if(fresh){NET.gid=g.gid;clearTimeout(UI.aiT);UI.aiT=null;UI.rt=realtimeJob(g.mission);UI.help=g.mission<=3;UI.tut=null;UI.sel=null;UI.res=null;UI.holdUntil=0;UI.wwk=null;UI.lastPrompt=null;UI.dockSig=null;UI.campDone=0;UI.lastNeed=null;
    kitReset();UI.started=true;hideStart();UI.netOpen=false;UI.prev=snap();if(SND.gesture)musicStart();else SND.wantMusic=1}
  NET.pend=-1;netRender();refresh()}
// ---- client -> host ----
function netSend(m){if(!NET.room||!NET.hostPeer)return false;NET.sent++;NET.room.sendTo(NET.hostPeer,'act',{m}).catch(()=>{});return true}
function onNetRej(msg){if(!isClient()||msg.peer!==NET.hostPeer)return;const e=msg.data&&typeof msg.data.e==='string'?msg.data.e.slice(0,200):'';NET.pend=-1;if(e&&G)toast(e)}
function netRej(peer,e){NET.rejected++;try{NET.room.sendTo(peer,'rej',{e}).catch(()=>{})}catch(x){}}
// the host's check of a client's move: the sender must own a human seat, and the engine's own legal() must accept the move
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;const d=msg.data;if(!d||typeof d!=='object'||Array.isArray(d))return;
  let seat=NET.seatPeer.indexOf(msg.peer);
  if(seat<0){const i=msg.by?NET.seatUid.findIndex((u,k)=>u&&u===msg.by&&G.seats[k]&&G.seats[k].away):-1;if(i>=0){netRestore(i,msg.peer);refresh();seat=i}else{NET.rejected++;return}}
  if(d.hi)return;
  const q=G.seats[seat];if(!q||!q.human||G.over){NET.rejected++;return}
  let js;try{js=JSON.stringify(d.m)}catch(e){}if(typeof js!=='string'||js.length>800||js[0]!=='{'){NET.rejected++;return}
  const m=JSON.parse(js);if(typeof m.a!=='string'){NET.rejected++;return}
  let err;try{err=legal(m,seat)}catch(e){err='That move is not valid.'}
  if(err){netRej(msg.peer,String(err));return}
  UI.lastActor=seat;let r;try{r=applyMove(m,seat)}catch(e){console.error(e);r={success:false}}
  if(r&&r.success)NET.remote++;else netRej(msg.peer,'That move did not work.')}
// ---- status, dock strip, lobby, start-screen panel ----
function netStatus(){const n=NET.peers.length;
  if(NET.hostGone||NET.err)return `<span class="warn">${esc(NET.err||'The host left.')}</span>`;
  if(NET.conn===false)return 'Connecting…';
  if(isClient()&&!NET.hostPeer)return 'Looking for the host…';
  if(isClient()&&NET.lastRx&&Date.now()-NET.lastRx>12000)return 'Reconnecting…';
  if(n<=1)return 'Looking for players…';return `${n} players connected`}
function netDock(){const el=$('#netst');if(!el)return;if(!NET.on||!G){el.hidden=true;return}el.hidden=false;
  const q=NET.mySeat>=0?G.seats[NET.mySeat]:null;
  el.innerHTML=`<span>🌐 Room <b>${esc(NET.code)}</b>${q?` · you are <b>${esc(q.nm)}</b>`:' · watching'}${isHost()?' · you host':''} · <span class="nst">${netStatus()}</span></span><button class="btn small" data-a="netopen">Lobby</button><button class="btn small" data-a="netleave">Leave</button>`}
function lobbyHTML(){const host=isHost();const ps=lobbyPlayers();const o=host?lobbyOpt():(NET.opt||null);
  const rows=ps.map((p,i)=>`<li><i style="background:${SEATC[(p.seat>=0?p.seat:i)%5]}"></i><b>${esc(p.nm||'Player')}</b>${p.me?' (you)':''}${p.host?' · host':''}${G&&p.seat<0?' · watching':''}</li>`).join('')||'<li class="muted">Connecting…</li>';
  let opts='';if(o&&o.job){const hum=Math.min(ps.length,o.np||ps.length);const ai=Math.max(0,(o.np||0)-hum);
    opts=`<p class="small">Job <b>${o.job}: ${esc(o.jn||'')}</b> · crew of <b>${o.np}</b>${ai>0?` · ${ai} computer seat${ai>1?'s':''} (${esc(LV_NAME[o.lv]||'Normal')})`:''}.${host?' To change the job or the computer level, use Change job.':''}</p>${o.err?`<p class="small warn">${esc(o.err)}</p>`:''}`}
  const ok=host&&!(o&&o.err);
  return `<div class="nbox" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lbx" data-a="netclose" aria-label="Close">×</button><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code" id="netcode">${esc(NET.code)}</b></p>
   <div class="invrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn small" data-a="netcopy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   <p class="tiny">Friends open the link, or choose 🌐 Play online and type the code. Nobody can see another player's wires.</p>
   <p class="small nst">${netStatus()}</p>
   <h3>Players (${ps.length})</h3><ul class="plist">${rows}</ul>${opts}
   ${host?`<div class="acts"><button class="btn go" data-a="netstart"${ok?'':' disabled'}>${G&&!G.over?'Start a new job':'Start the job'}</button><button class="btn" data-a="netchange">Change job</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tiny">${NET.hostGone?'':G&&!G.over?'The host can start a new job from here.':'Waiting for the host to start the job…'}</p><div class="acts"><button class="btn" data-a="netleave">${NET.hostGone?'Back to the start':'Leave'}</button></div>`}</div>`}
function onlineInner(){let h='';
  if(!NET.ready)h='<p class="small muted">Checking online play…</p>';
  else if(!netAvail())h='<p class="small muted">Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  else if(NET.on)h=`<p class="small">You are in online room <b>${esc(NET.code)}</b> · ${netStatus()}</p><div class="acts"><button class="btn small go" data-a="netopen">Open the lobby</button><button class="btn small" data-a="netleave">Leave the room</button></div>`;
  else h=`<p class="small muted">Free and direct: your browsers connect to each other. Host a job, then send friends the code or the link.</p>
    <div class="nrow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn small go" data-a="nethost">Host</button></div>
    <div class="nrow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="${esc(UI.joinCode||'')}"><button class="btn small" data-a="netjoin">Join</button></div>${NET.busy?'<p class="small muted">Opening the room…</p>':''}${NET.err?`<p class="small warn">${esc(NET.err)}</p>`:''}`;
  return h}
function onlineBlock(){return `<details class="online" id="onl"${UI.onl||NET.on?' open':''}><summary>🌐 Play online</summary><div id="netblock">${onlineInner()}</div></details>`}
function netRender(){netDock();const box=$('#netbox');
  if(box){if(UI.netOpen&&NET.on){box.hidden=false;const keep=document.activeElement&&box.contains(document.activeElement)&&document.activeElement.tagName==='INPUT';if(!keep||!box.firstChild)box.innerHTML=lobbyHTML()}else{box.hidden=true;box.innerHTML=''}}
  const nb=$('#netblock');if(nb&&!(document.activeElement&&nb.contains(document.activeElement)&&document.activeElement.tagName==='INPUT'))nb.innerHTML=onlineInner()}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;netRender();setTimeout(()=>{NET.copied=false;netRender()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netClose(){UI.netOpen=false;netRender()}
// returns true when the click was an online-play button
function netClick(a){switch(a){
  case 'nethost':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('host',NetRoom.newCode());return true}
  case 'netjoin':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('client',(document.getElementById('joincode')||{}).value);return true}
  case 'netstart':{if(!isHost())return true;UI.netOpen=false;UI.setup=UI.setup||defaultSetup();netRender();startJob(UI.setup);return true}
  case 'netchange':{UI.netOpen=false;if(G&&!G.over)showStart();netRender();return true}
  case 'netleave':netLeave();return true;case 'netcopy':netCopy();return true;
  case 'netclose':netClose();return true;case 'netopen':if(GX.open)GX.close();UI.netOpen=true;netRender();return true}return false}
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined'){NET.myName=NetRoom.setName(t.value)}});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netClick('netjoin');return}
  if(t&&t.id==='netname'&&e.key==='Enter'){e.preventDefault();netClick('nethost');return}
  if(e.key==='Escape'&&UI.netOpen){e.preventDefault();netClose()}});
document.addEventListener('click',e=>{if(UI.netOpen&&e.target&&e.target.id==='netbox')netClose()});
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='onl')UI.onl=e.target.open},true);
// the lobby keeps showing the live player count
setInterval(()=>{if(!NET.on)return;const st=netStatus()+'|'+NET.peers.length;if(st!==NET.lastSt){NET.lastSt=st;netRender()}},1000);
