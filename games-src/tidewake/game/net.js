// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The host's page runs the game and the computer seats. Every other player's page only draws what ITS seat may see: the host sends each
// peer its own copy of the state made by netStrip(G, seat) (src/netstrip.js: a whitelist; other captains' hands, the pile order, the leviathan
// deck order, the seed ... are never copied) and the peer sends back small move messages that the host checks (seat owner + legal())
// before it applies them. Seats go to the players in join order (host first), empty seats go to the computer. A player who leaves is
// replaced by the computer and gets the seat back on rejoining (same browser uid). If the host leaves the game is over: the others never
// hold the hidden state, so nobody can take over.
// Interrupts (Deck Cannon / Rift Gate on someone else's turn) are an ordinary question G.q owned by the endangered seat: only that page gets
// the options, and the host's timer (qTimerSync in ui4.js) answers for a seat that does not decide in time.
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',busy:false,ready:false,lastRx:0,gid:null,myName:'',copied:false,opt:null,hostGone:false,starting:false,remote:0,rejected:0,sent:0,rx:0,
  seatPeer:[],seatUid:[],pend:-1,pendT:0,conn:null,lastSt:'',trace:null,applied:0,fromNet:0,queue:[],autoDecl:0};
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netAvail=()=>!!NET.lobby;
const cleanName=s=>String(s||'').replace(/[<>&"'`]/g,'').trim().slice(0,24);
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('tidewake');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
  const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.onl=true}}}catch(e){console.error(e)}NET.ready=true}
function netIdle(){clearTimeout(UI.tm);UI.gen++;UI.busy=false;G=null;UI.started=false;UI.sel=null;UI.res=null;UI.qKey=null;kitReset();try{TWKit.setLegal([]);TWKit.ghost(null)}catch(e){}
  try{$('#main').innerHTML='';$('#road').innerHTML='';$('#stepsw').innerHTML='';$('#res').innerHTML='';$('#coach').innerHTML=''}catch(e){}}
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';code=NetRoom.cleanCode(code);
  if(!code){NET.err='Type the invite code first.';netRender();return}
  NET.busy=true;netRender();let room;
  try{if(NET.room){try{await NET.room.leave()}catch(e){}NET.room=null}room=await NET.lobby.join('tw-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';netRender();return}
  Object.assign(NET,{busy:false,code,role,on:true,room,mySeat:-1,hostPeer:null,parts:{},applied:0,lastRx:0,gid:null,hostGone:false,peer:room.self,peers:[],opt:null,seatPeer:[],seatUid:[],pend:-1,queue:[]});
  if(G||UI.started)netIdle();
  room.presence({role,uid:NET.uid,name:NET.myName||''}).catch(()=>{});
  room.on('st',onNetState);room.on('act',onNetAct);room.on('rej',onNetRej);
  room.onPeers(onNetPeers);room.onConnection(c=>{NET.conn=c;netRender()});
  if(role==='client'){hideStart();idleDock()}
  if(GX.open)GX.close();UI.netOpen=true;netRender();if(role==='host'){if(!UI.setup)UI.setup=defaultSetup();netPush(true);renderStart()}}
async function netLeave(){const r=NET.room;const was=NET.on;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',hostGone:false,peers:[],gid:null,opt:null,seatPeer:[],seatUid:[],queue:[]});
  try{if(r)await r.leave()}catch(e){}if(!was)return;UI.netOpen=false;netIdle();showStart();netRender()}
function idleDock(){const m=$('#main');if(m)m.innerHTML='<div class="prompt"><h4>Waiting for the host...</h4><p class="tiny">The host chooses the game and sets sail. Your seat and your tiles appear here.</p></div>'}
function onNetPeers(ch){NET.peers=ch.peers||[];
  if(isClient()){const h=NET.peers.find(p=>!p.isMe&&p.presence&&p.presence.role==='host');if(h)NET.hostPeer=h.peer;
    if(NET.hostPeer&&(ch.left||[]).some(p=>p.peer===NET.hostPeer)){NET.hostGone=true;NET.err=G?'The host left. The game is over.':'The host closed the room.';UI.netOpen=true}}
  if(isHost()){let chg=false;
    (ch.left||[]).forEach(l=>{const i=NET.seatPeer.indexOf(l.peer);if(G&&i>=0&&G.seats[i].human){G.seats[i].human=false;G.seats[i].away=true;chg=true;lg(`${G.seats[i].nm} left the game: the computer plays for them now.`,'bad')}});
    (ch.joined||[]).forEach(j=>{if(j.isMe||!G||!j.by)return;const i=NET.seatUid.findIndex((u,k)=>u&&u===j.by&&G.seats[k]&&G.seats[k].away);if(i>=0){netRestore(i,j.peer);chg=true}});
    if((ch.joined||[]).length||(ch.left||[]).length)netPush(true);
    if(chg&&G){UI.qKey=null;refresh();schedule()}}
  netRender();netRestart()}
// the start screen's seat rows follow the lobby (keeps the scroll position)
function netRestart(){const st=$('#start');if(!st||st.hidden||!isHost()||!UI.setup)return;const ps=[...st.querySelectorAll('.stin,.pane')].map(x=>x.scrollTop);const top=st.scrollTop;renderStart();st.scrollTop=top}
function netRestore(i,peer){NET.seatPeer[i]=peer;G.seats[i].human=true;G.seats[i].away=false;lg(`${G.seats[i].nm} is back and takes their seat again.`,'good');UI.qKey=null}
// ---- the lobby: players in join order (the host first); seat i goes to player i ----
const seatSail=i=>{try{if(G&&UI.cols[i]!=null)return colOf(i).sail;if(isHost()&&UI.setup&&UI.setup.seats[i])return COL[UI.setup.seats[i].col].sail;return COL[i%8].sail}catch(e){return '#888'}};
function lobbyPlayers(){if(isClient()&&NET.opt&&Array.isArray(NET.opt.pl))return NET.opt.pl.slice(0,12).map(p=>({nm:cleanName(p&&p.nm),by:p&&typeof p.by==='string'?p.by:'',host:!!(p&&p.host),me:!!(p&&p.by&&p.by===NET.uid),seat:p&&Number.isInteger(p.seat)?p.seat:-1,idx:p&&Number.isInteger(p.idx)?p.idx:0}));
  return NET.peers.map((p,k)=>{const by=p.isMe?NET.uid:(p.by||'');const i=NET.seatUid.indexOf(by);
    return {nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))||'Player',by,host:p.isMe?isHost():!!(p.presence&&p.presence.role==='host'),me:!!p.isMe,seat:G&&by&&i>=0?i:-1,idx:k}})}
// who gets which seat: null + a reason when this setup cannot be played online
function netPlan(s){const hum=NET.peers.slice(0,8).map(p=>({peer:p.peer,uid:p.isMe?NET.uid:(p.by||null),nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,nm:cleanName(NET.myName)});
  if(s.variant==='solo'||s.variant==='easysolo')return {err:'Solo games are for one captain. Pick Standard or Teams for online play.'};
  const np=Math.min(8,Math.max(s.np,hum.length,s.variant==='teams'?4:2));
  if(hum.length>np)return {err:'This setup has room for '+np+' captains.'};
  return {np,hum}}
function lobbyOpt(){const s=UI.setup||defaultSetup();const p=netPlan(s);
  return {np:p.np||s.np,vr:s.variant||'',lv:(s.seats.find((x,i)=>i>=(p.hum?p.hum.length:1))||{}).lv||'normal',err:p.err||'',nh:p.hum?p.hum.length:1,pl:lobbyPlayers().map(x=>({nm:x.nm,by:x.by,host:x.host,seat:x.seat,idx:x.idx}))}}
// host: called by startGame right after newGame; binds the humans to the seats
function netBound(plan){NET.seatPeer=plan.hum.map(h=>h.peer);NET.seatUid=plan.hum.map(h=>h.uid);G.gid=NetRoom.newCode()+Date.now().toString(36);NET.gid=G.gid;NET.mySeat=NET.seatPeer.indexOf(NET.peer);G.seats.forEach(q=>{q.away=false});NET.pend=-1;NET.queue=[]}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u).catch(()=>{});w.close().catch(()=>{});return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function sendPacked(room,target,body,seq){packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++){const d={s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)};(target?room.sendTo(target,'st',d):room.emit('st',d)).catch(()=>{})}})}
function netPush(force){if(!isHost()||!NET.room||NET.starting)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;const room=NET.room;const opt=lobbyOpt();
  if(!G||!UI.started){sendPacked(room,null,{code:NET.code,lobby:true,opt},seq);return}
  // every peer gets ITS OWN stripped copy: nobody receives another seat's hand, the pile, the leviathan deck order or the seed
  for(const p of NET.peers){if(p.isMe)continue;const seat=NET.seatPeer.indexOf(p.peer);
    sendPacked(room,p.peer,{code:NET.code,gid:G.gid,seat,cols:UI.cols.slice(0,8),opt,g:netStrip(G,seat)},seq)}}
setInterval(()=>{if(isHost())netPush(true)},3000);
// the end of every render(): the host pushes the new state
function netAfter(){if(!NET.on)return;netDock();if(isHost())netPush()}
function onNetState(msg){NET.rx++;if(!NET.on||msg.isMe||!isClient())return;const d=msg.data;
  if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<80)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  if(!NET.hostPeer||msg.peer!==NET.hostPeer)return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const i=x.lastIndexOf(':');if(x.slice(0,i)===msg.peer&&+x.slice(i+1)<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code||!NET.on)return;if(d.s<=NET.applied)return;NET.applied=d.s;NET.lastRx=Date.now();
    if(window.NET_TRACE){(NET.trace=NET.trace||[]).push(txt)}applyNet(o)}).catch(e=>{NET.bad=(NET.bad||0)+1;NET.badE=String(e)})}
function validState(g){return g&&typeof g==='object'&&Array.isArray(g.ships)&&Array.isArray(g.seats)&&g.seats.length>=2&&g.seats.length<=8&&Array.isArray(g.log)&&Array.isArray(g.bd)&&g.bd.length===BW*BW&&Array.isArray(g.hands)&&g.hands.length===g.seats.length&&g.ships.length===g.seats.length&&Array.isArray(g.order)&&Array.isArray(g.mons)&&Array.isArray(g.deck)&&typeof g.gid==='string'}
function applyNet(o){
  if(o.lobby||!o.g){NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;if(G||UI.started){netIdle();hideStart();idleDock()}NET.gid=null;netRender();return}
  if(!validState(o.g))return;const g=o.g;const fresh=g.gid!==NET.gid;const prevN=G&&!fresh?G.logN:g.logN;NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;
  G=g;NET.mySeat=Number.isInteger(o.seat)&&o.seat>=0&&o.seat<g.seats.length?o.seat:-1;
  if(fresh){NET.gid=g.gid;clearTimeout(UI.tm);UI.gen++;UI.busy=false;UI.cols=Array.isArray(o.cols)?o.cols.slice(0,8).map(x=>Number.isInteger(x)&&x>=0&&x<8?x:0):g.seats.map((_,i)=>i);
    G.seats.forEach((x,i)=>{SHIP_NAMES[i]=cleanName(x.nm)||SHIP_NAMES[i]});UI.sel=null;UI.res=null;UI.hint=false;UI.confirm=null;UI.lastKey='';UI.qKey=null;UI.overSeen=0;UI.holder=-1;UI.pause=false;UI.guided=false;UI.trig={};
    kitReset();UI.started=true;hideStart();GX.close();UI.netOpen=false;SND.mood='calm';try{sndLoop('sea_loop',true)}catch(e){}if(SND.gesture)musicStart();else SND.wantMusic=1}
  if(NET.pend>=0&&G.logN!==NET.pend)NET.pend=-1;netRender();kitSync();render();overCheck();
  if(!fresh&&G.logN>prevN){const nw=G.log.filter(e=>e.i>prevN).reverse();if(nw.length){const e=nw[nw.length-1];say(String(e.t).slice(0,200),e.c==='bad'?'bad':'')}}}
// ---- client -> host ----
function netSend(m){if(!NET.room||!NET.hostPeer)return false;NET.sent++;NET.room.sendTo(NET.hostPeer,'act',{m}).catch(()=>{});return true}
function onNetRej(msg){if(!isClient()||msg.peer!==NET.hostPeer)return;const e=msg.data&&typeof msg.data.e==='string'?msg.data.e.slice(0,200):'';NET.pend=-1;if(e&&G)say(e,'bad')}
function netRej(peer,e){NET.rejected++;(NET.rejLog=NET.rejLog||[]).push(String(e).slice(0,60));if(NET.rejLog.length>30)NET.rejLog.shift();try{NET.room.sendTo(peer,'rej',{e}).catch(()=>{})}catch(x){}}
// act() hook (ui4.js): a client sends its move to the host instead of playing it; the host refuses a click for a seat it does not own.
// returns undefined = carry on locally.
function netAct(m,seat){
  if(isClient()){if(!G||G.over||seat!==NET.mySeat||sideToAct()!==seat)return false;if(NET.pend===G.logN&&Date.now()-NET.pendT<2500)return false;
    const err=legal(m,seat);if(err){say(err,'bad');return false}NET.pend=G.logN;NET.pendT=Date.now();UI.sel=null;netSend(m);return true}
  if(isHost()&&!NET.fromNet){const s=G&&G.seats[seat];if(s&&s.human&&seat!==NET.mySeat)return false}}
function actAs(m,seat){NET.fromNet=1;try{return act(m,seat)}finally{NET.fromNet=0}}
// the host's check of a client's move: the sender must own a human seat, and the engine's own legal() must accept the move
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;const d=msg.data;if(!d||typeof d!=='object'||Array.isArray(d))return;
  let seat=NET.seatPeer.indexOf(msg.peer);
  if(seat<0){const i=msg.by?NET.seatUid.findIndex((u,k)=>u&&u===msg.by&&G.seats[k]&&G.seats[k].away):-1;if(i>=0){netRestore(i,msg.peer);refresh();seat=i}else{NET.rejected++;return}}
  if(d.hi)return;
  const q=G.seats[seat];if(!q||!q.human||G.over){NET.rejected++;return}
  let js;try{js=JSON.stringify(d.m)}catch(e){}if(typeof js!=='string'||js.length>400||js[0]!=='{'){NET.rejected++;return}
  const m=JSON.parse(js);if(typeof m.a!=='string'){NET.rejected++;return}
  if(NET.queue.length>=6){NET.rejected++;return}
  NET.queue.push({m,seat,peer:msg.peer,t:Date.now()});netDrain()}
// moves wait while the host plays an animation; each one is checked again when its turn comes
function netDrain(){if(!isHost()||!NET.queue.length)return;
  if(UI.busy||!G){clearTimeout(NET.dt);NET.dt=setTimeout(netDrain,120);return}
  const x=NET.queue.shift();if(Date.now()-x.t>20000){netDrain();return}
  const q=G.seats[x.seat];if(!q||!q.human||G.over||NET.seatPeer[x.seat]!==x.peer){NET.rejected++;netDrain();return}
  let err;try{err=legal(x.m,x.seat)}catch(e){err='That move is not valid.'}
  if(err){netRej(x.peer,String(err))}else{let ok=false;try{ok=actAs(x.m,x.seat)}catch(e){console.error(e)}if(ok)NET.remote++;else netRej(x.peer,'That move did not work.')}
  if(NET.queue.length){clearTimeout(NET.dt);NET.dt=setTimeout(netDrain,120)}}
// ---- status, dock strip, lobby, start-screen panel ----
function netStatus(){const n=NET.peers.length;
  if(NET.hostGone||NET.err)return `<span class="warn">${esc(NET.err||'The host left.')}</span>`;
  if(NET.conn===false)return 'Connecting...';
  if(isClient()&&!NET.hostPeer)return 'Looking for the host...';
  if(isClient()&&NET.lastRx&&Date.now()-NET.lastRx>12000)return 'Reconnecting...';
  if(n<=1)return 'Looking for players...';return `${n} players connected`}
function netDock(){const el=$('#netst');if(!el)return;if(!NET.on||!G){el.hidden=true;return}el.hidden=false;
  const q=NET.mySeat>=0&&G.seats[NET.mySeat]?G.seats[NET.mySeat]:null;
  el.innerHTML=`<span>Room <b>${esc(NET.code)}</b>${q?` · you are <b>${esc(q.nm)}</b>`:' · watching'}${isHost()?' · you host':''} · <span class="nst">${netStatus()}</span></span><button class="btn small" data-a="netopen">Lobby</button><button class="btn small" data-a="netleave">Leave</button>`}
// what the dock shows when another online captain has to decide (their tiles are never drawn)
function netWaitHTML(d,vs){const q=G.q&&G.q.who===d;return `<div class="prompt"><h4>${dot(d)} ${esc(nm(d))} ${q?'must decide quickly':'is deciding'}...</h4><p class="tiny">${q?'An interrupt: they have a few seconds, then the computer answers for them.':'Waiting for their move.'}</p></div>`+handStrip(vs,false)}
function lobbyHTML(){const host=isHost();const ps=lobbyPlayers();const o=host?lobbyOpt():(NET.opt||null);
  const rows=ps.map((p,i)=>`<li><i style="background:${seatSail(p.seat>=0?p.seat:p.idx)}"></i><b>${esc(p.nm||'Player')}</b>${p.me?' (you)':''}${p.host?' · host':''}${G&&p.seat<0?' · watching':''}</li>`).join('')||'<li class="muted">Connecting...</li>';
  let opts='';if(o&&o.np){const hum=Math.min(ps.length,o.np);const ai=Math.max(0,o.np-hum);
    opts=`<p class="small">${o.vr==='teams'?'Teams game':'Standard game'} · <b>${o.np}</b> captains${ai>0?` · ${ai} computer seat${ai>1?'s':''} (${esc(o.lv||'normal')})`:''}.${host?' To change the rules or the computer level, use Change setup.':''}</p>${o.err?`<p class="small warn">${esc(o.err)}</p>`:''}`}
  const ok=host&&!(o&&o.err);
  return `<div class="nbox" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lbx" data-a="netclose" aria-label="Close">×</button><h2>Online game</h2>
   <p>Invite code: <b class="code" id="netcode">${esc(NET.code)}</b></p>
   <div class="invrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn small" data-a="netcopy">${NET.copied?'Copied ✓':'Copy link'}</button></div>
   <p class="tiny">Friends open the link, or choose Play online and type the code. Nobody can see another captain's tiles.</p>
   <p class="small nst">${netStatus()}</p>
   <h3>Captains (${ps.length})</h3><ul class="plist">${rows}</ul>${opts}
   ${host?`<div class="acts"><button class="btn pri" data-a="netstart"${ok?'':' disabled'}>${G&&!G.over?'Start a new game':'Set sail'}</button><button class="btn" data-a="netchange">Change setup</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tiny">${NET.hostGone?'':G&&!G.over?'The host can start a new game from here.':'Waiting for the host to set sail...'}</p><div class="acts"><button class="btn" data-a="netleave">${NET.hostGone?'Back to the start':'Leave'}</button></div>`}</div>`}
function onlineInner(){let h='';
  if(!NET.ready)h='<p class="small muted">Checking online play...</p>';
  else if(!netAvail())h='<p class="small muted">Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  else if(NET.on)h=`<p class="small">You are in online room <b>${esc(NET.code)}</b> · ${netStatus()}</p><div class="acts"><button class="btn small pri" data-a="netopen">Open the lobby</button><button class="btn small" data-a="netleave">Leave the room</button></div>`;
  else h=`<p class="small muted">Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link.</p>
    <div class="nrow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn small pri" data-a="nethost">Host</button></div>
    <div class="nrow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="${esc(UI.joinCode||'')}"><button class="btn small" data-a="netjoin">Join</button></div>${NET.busy?'<p class="small muted">Opening the room...</p>':''}${NET.err?`<p class="small warn">${esc(NET.err)}</p>`:''}`;
  return h}
function onlineBlock(){return `<details class="online" id="onl"${UI.onl||NET.on?' open':''}><summary>Play online (free, peer to peer)</summary><div id="netblock">${onlineInner()}</div></details>`}
function netRender(){netDock();const box=$('#netbox');
  if(box){if(UI.netOpen&&NET.on){box.hidden=false;const keep=document.activeElement&&box.contains(document.activeElement)&&document.activeElement.tagName==='INPUT';if(!keep||!box.firstChild)box.innerHTML=lobbyHTML()}else{box.hidden=true;box.innerHTML=''}}
  const nb=$('#netblock');if(nb&&!(document.activeElement&&nb.contains(document.activeElement)&&document.activeElement.tagName==='INPUT'))nb.innerHTML=onlineInner()}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;netRender();setTimeout(()=>{NET.copied=false;netRender()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netClose(){UI.netOpen=false;netRender()}
// returns true when the click was an online-play button (or one a client may not use)
function netClick(a){switch(a){
  case 'nethost':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('host',NetRoom.newCode());return true}
  case 'netjoin':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('client',(document.getElementById('joincode')||{}).value);return true}
  case 'netstart':{if(!isHost())return true;UI.netOpen=false;UI.setup=UI.setup||defaultSetup();netRender();const s=JSON.parse(JSON.stringify(UI.setup));lsSet('tw_setup',UI.setup);startGame(s);return true}
  case 'netchange':{UI.netOpen=false;if(G&&UI.started)showStart();netRender();return true}
  case 'netleave':netLeave();return true;case 'netcopy':netCopy();return true;
  case 'netclose':netClose();return true;case 'netopen':if(GX.open)GX.close();UI.netOpen=true;netRender();return true;
  case 'again':case 'newgame':case 'restart':case 'tonew':case 'pause':case 'guided':case 'cont':if(isClient()){return true}return false}return false}
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined'){NET.myName=NetRoom.setName(t.value)}});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netClick('netjoin');return}
  if(t&&t.id==='netname'&&e.key==='Enter'){e.preventDefault();netClick('nethost');return}
  if(e.key==='Escape'&&UI.netOpen){e.preventDefault();netClose()}});
document.addEventListener('click',e=>{if(UI.netOpen&&e.target&&e.target.id==='netbox')netClose()});
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='onl')UI.onl=e.target.open},true);
// the lobby keeps showing the live player count
setInterval(()=>{if(!NET.on)return;const st=netStatus()+'|'+NET.peers.length;if(st!==NET.lastSt){NET.lastSt=st;netRender()}},1000);
