// ---------- online play: free peer-to-peer rooms (NetRoom over WebRTC). The host's page runs the game; the other page only sends its choices. ----------
// Seats: the host flies side 0 (the first faction on the start screen), the first friend to join flies side 1, anyone later watches.
// Hidden information: every page gets its own copy of the state, with the other side's unrevealed dials (and the damage deck order) removed.
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySide:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,
  peers:[],inLobby:false,lobbyMin:false,err:'',ready:false,busy:false,lastRx:0,hostGone:false,fxN:0,fxq:[],fxSeen:-1,logSeen:-1,info:null,copied:false,
  myName:'',turnSig:'',gid:null,acc:0,rej:0,why:[],camFor:null};
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('nebula-aces');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
    const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.netOpen=true}}}catch(e){NET.lobby=null}NET.ready=true;if(typeof render==='function')render()}
netInit();
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netOn=()=>NET.on;
// the room tells us who is here; the host keeps the seats in G.players (peer id, stable uid, name)
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  if(!NET.myName){NET.myName=NetRoom.setName(role==='host'?'Host':'Pilot '+Math.floor(10+Math.random()*90))}
  NET.busy=true;netTimers();render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('na-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room. Check your connection and try again.';render();return}
  Object.assign(NET,{busy:false,joinT:Date.now(),code,role,on:true,inLobby:true,lobbyMin:false,mySide:role==='host'?0:-1,hostPeer:null,parts:{},applied:0,lastRx:0,hostGone:false,fxSeen:-1,logSeen:-1,info:null,gid:null,camFor:null});
  if(role==='client'){G=null;UI.stats=false}
  NET.room.presence({role,uid:NET.uid,name:NET.myName||'',v:1}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)NET.peer=me.peer;
    if(isHost()&&G&&!NET.inLobby){let ch2=false;
      ch.left.forEach(l=>{const k=G.players.findIndex(p=>p.peer===l.peer&&p.human&&!p.host);if(k>=0){const p=G.players[k];p.human=false;p.away=true;ch2=true;lg(k,`${p.name||'The other pilot'} left: the computer flies the ${sideName(k)} ships.`)}});
      ch.joined.forEach(j=>{const uid=j.by||(j.presence&&j.presence.uid);// same browser (uid) back: its seat returns, even before the old connection has timed out
        const k=uid?G.players.findIndex(p=>!p.host&&p.uid===uid&&(p.away||p.peer!==j.peer)):-1;if(k>=0)netReclaim(k,j.peer)})
      if(ch2)refresh()}
    if(isHost())netPush(true);
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){NET.hostGone=true;if(!G||NET.inLobby)NET.err='The host closed the room.'}
    render()});
  UI.info=true;UI.rules=false;render();netPush(true)}
// timers start with the first room (a page that never goes online runs none: the headless tests exit cleanly)
function netTimers(){if(NET.timers)return;NET.timers=true;setInterval(()=>{if(isHost())netPush(true)},3000);
  // a client that has heard nothing from the host 15 s after joining opens the room again (a fresh announcement reaches a busy host page)
  setInterval(()=>{if(isClient()&&!NET.lastRx&&!NET.busy&&NET.joinT&&Date.now()-NET.joinT>15000){NET.retries=(NET.retries||0)+1;netJoin('client',NET.code)}},2000);
  setInterval(()=>{if(isClient()&&G&&!G.winner){const late=NET.lastRx&&Date.now()-NET.lastRx>7000;if(late!==NET.late){NET.late=late;render()}if(NET.lastRx&&Date.now()-NET.lastRx>30000&&!NET.hostGone){NET.hostGone=true;render()}}},1000);}
function netReclaim(k,peer){const p=G.players[k];p.peer=peer;p.human=true;p.away=false;lg(k,`${p.name||'The other pilot'} is back and flies the ${sideName(k)} ships again.`);netPush(true);refresh()}
async function netLeave(quiet){try{if(NET.room)await NET.room.leave()}catch(e){}
  Object.assign(NET,{on:false,role:null,room:null,inLobby:false,lobbyMin:false,mySide:-1,hostPeer:null,err:'',hostGone:false,peers:[]});if(!quiet){G=null;UI.info=true;UI.stats=false;render()}}
const peerName=p=>{const n=p&&p.presence&&typeof p.presence.name==='string'?p.presence.name.slice(0,24):'';return n||(p&&p.isMe?(NET.myName||'You'):'Pilot')};
// the other pages in the room, in join order: the first one gets side 1
const netRemote=()=>NET.peers.filter(p=>!p.isMe);
function netWho(k){if(!G||!G.players[k])return '';const p=G.players[k];if(k===NET.mySide)return 'you';return p.human?(p.name||sideName(k)):'the computer'}
// host: start a battle with whoever is in the room (an empty seat goes to the computer)
function netStart(){if(!isHost())return;const f=netRemote()[0];
  const players=[{human:true,host:true,peer:NET.peer,uid:NET.uid,name:NET.myName||'Host'},f?{human:true,peer:f.peer,uid:f.by||(f.presence&&f.presence.uid)||null,name:peerName(f)}:{human:false,lvl:UI.lvl,name:''}];
  UI.info=false;UI.stats=false;UI.draft={};UI.pass=null;UI.sel=null;UI.sugCache=null;UI.advOpen=false;UI.mode='net';
  newGame({fac:UI.fac.slice(),players,sizeK:UI.size,squads:typeof customSquads==='function'?customSquads():null,ex:Object.assign({},UI.ex)});
  NET.inLobby=false;NET.mySide=0;resetGuide();camView('tilt');render();netPush(true)}
// host: back to the lobby for a rematch (the clients follow)
function netToLobby(){if(!isHost())return;G=null;NET.inLobby=true;NET.lobbyMin=false;UI.stats=false;UI.info=true;render();netPush(true)}
// ---- what one side may see ----
function netView(side){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,40);g.moves=(g.moves||[]).slice(-24);g.deck=g.deck.map(()=>0);g.rng=1;
  for(const s of g.ships){if(s.side===side)continue;if(s.dial!=null&&s.revR!==G.round)s.dial='set';if(s.flags)s.flags.peek=null}
  if(g.q&&g.q.side!==side)g.q={side:g.q.side,key:g.q.key,title:g.q.title,text:'',kid:g.q.kid,opts:g.q.opts.map(o=>({k:o.k,l:'',p:o.p,b:o.b}))};
  return g}
// a dial counts as revealed once its ship starts its activation this round
const _revealNet=revealAndMove;revealAndMove=function(s){s.revR=G.round;return _revealNet(s)};
// the host numbers the log lines and the board effects, so the other pages can replay the new ones (sounds, animations, notices)
const _lgNet=lg;lg=function(side,t){if(G)G.logN=(G.logN||0)+1;_lgNet(side,t)};
const _fxNet=fx;fx=function(k,d){_fxNet(k,d);if(isHost()){const f=UI.fx[UI.fx.length-1];if(f){NET.fxq.push(Object.assign(JSON.parse(JSON.stringify(f)),{n:++NET.fxN}));if(NET.fxq.length>40)NET.fxq.shift()}}};
// ---- state packets (compressed, chunked) ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function netSendPacked(body,peers,seq){return packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++){const m={s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)};
  if(!NET.room)return;if(peers)peers.forEach(p=>NET.room.sendTo(p,'st',m).catch(()=>{}));else NET.room.emit('st',m).catch(()=>{})}})}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;
  if(!G||NET.inLobby){netSendPacked({code:NET.code,lobby:true,info:netInfo()},null,seq);return}
  const by={};for(const p of netRemote()){const k=G.players.findIndex(x=>x.peer===p.peer&&!x.away);(by[k]=by[k]||[]).push(p.peer)}
  for(const k in by)netSendPacked({code:NET.code,g:netView(+k),fx:NET.fxq,ln:G.logN||0},by[k],seq)}
function netInfo(){const r=netRemote();return {fac:UI.fac.slice(),size:UI.size,ex:Object.assign({},UI.ex),lvl:UI.lvl,host:NET.myName||'Host',friend:r[0]?peerName(r[0]):'',fp:r[0]?r[0].peer:null}}
function onNetState(msg){if(!isClient())return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<60)||!(d.i>=0&&d.i<d.n))return;
  if(NET.hostPeer&&msg.peer!==NET.hostPeer)return;
  const k=msg.peer+':'+d.s;const P=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P.c[d.i]===undefined){P.c[d.i]=d.d;P.got++}
  if(P.got<P.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]});
  unpackStr(P.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;
    if(!NET.hostPeer){const hp=NET.peers.find(p=>p.peer===msg.peer);if(hp&&hp.presence&&hp.presence.role&&hp.presence.role!=='host')return;NET.hostPeer=msg.peer}
    if(d.s<=NET.applied)return;NET.applied=d.s;applyNet(o)}).catch(()=>{})}
const atkKey=a=>a?[a.a,a.d,a.w,a.second?1:0,a.gun?1:0].join('|'):'';
function applyNet(o){NET.lastRx=Date.now();NET.hostGone=false;
  if(o.lobby||!o.g){NET.info=o.info||NET.info;if(G||!NET.inLobby){G=null;NET.inLobby=true;NET.lobbyMin=false;UI.info=true;UI.stats=false}render();return}
  const g=o.g;const same=G&&NET.gid===g.seed;
  if(same){const pa=G.atk;if(pa&&g.atk&&atkKey(pa)===atkKey(g.atk)){for(const k in pa)delete pa[k];Object.assign(pa,g.atk);g.atk=pa}// keep the object: the result cards follow one attack
    for(const k of Object.keys(G))delete G[k];Object.assign(G,g)}
  else{G=g;NET.gid=g.seed;NET.logSeen=-1;NET.fxSeen=-1;UI.draft={};UI.sel=null;UI.sugCache=null;UI.stats=false;UI.mode='net';if(typeof resetGuide==='function')resetGuide()}
  NET.mySide=G.players.findIndex(p=>p.peer===NET.peer);if(NET.mySide<0)NET.mySide=G.players.findIndex(p=>p.uid&&p.uid===NET.uid&&!p.away);
  NET.inLobby=false;UI.info=false;
  if(NET.camFor!==NET.gid+':'+NET.mySide&&typeof camView==='function'){NET.camFor=NET.gid+':'+NET.mySide;camView(UI.top?'top':'tilt')}
  // new board effects (moves, shots, hits) play here too
  const fq=Array.isArray(o.fx)?o.fx:[];const top=fq.reduce((a,f)=>Math.max(a,f.n|0),0);
  if(NET.fxSeen>=0)for(const f of fq)if((f.n|0)>NET.fxSeen&&typeof f.k==='string'){UI.fx.push(f);if(UI.fx.length>60)UI.fx.shift()}
  NET.fxSeen=Math.max(NET.fxSeen,top);
  // new log lines feed the notices, the radio and the round recap
  const ln=o.ln|0;if(NET.logSeen>=0&&ln>NET.logSeen){const n=Math.min(ln-NET.logSeen,G.log.length);for(let i=n-1;i>=0;i--){const l=G.log[i];try{if(typeof noteLog==='function')noteLog(l.s,l.t)}catch(e){}try{if(typeof flowLog==='function')flowLog(l.s,l.t)}catch(e){}}}
  NET.logSeen=ln;
  // a client whose seat went to the computer says hello so the host hands it back
  if(NET.mySide<0&&NET.room&&G.players.some(p=>p.away&&p.uid===NET.uid)&&Date.now()-(NET.hiT||0)>2500){NET.hiT=Date.now();netSend({act:'hi'})}
  render()}
// client -> host: a small, flat action message
function netClean(d){if(!d||typeof d!=='object'||typeof d.act!=='string')return null;const act=d.act.slice(0,12);
  if(!['ask','damod','action','fire','amod','dmod','dials','autoplace','hi'].includes(act))return null;const ds={act};
  for(const k of ['k','a2','arg','w','t']){const v=d[k];if(v==null)continue;if(typeof v!=='string'&&typeof v!=='number')return null;ds[k]=String(v).slice(0,24)}
  if(act==='dials'){const src=d.dials;if(!src||typeof src!=='object'||Array.isArray(src))return null;const ks=Object.keys(src);if(!ks.length||ks.length>12)return null;ds.dials={};
    for(const id of ks){const v=src[id];if(!/^s\d{1,3}$/.test(id)||!Number.isInteger(v)||v<0||v>40)return null;ds.dials[id]=v}}
  return ds}
function netSend(ds){if(!NET.room)return;const d=netClean(ds);if(!d)return;const p=NET.hostPeer;(p?NET.room.sendTo(p,'act',d):NET.room.emit('act',d)).catch(()=>{})}
function onNetAct(msg){if(!isHost()||!G||NET.inLobby)return;let seat=G.players.findIndex(p=>p.peer===msg.peer&&p.human&&!p.host);
  if(seat<0){const k=G.players.findIndex(p=>p.away&&!p.host&&(p.peer===msg.peer||(msg.by&&p.uid===msg.by)));if(k>=0)netReclaim(k,msg.peer);else NET.rej++;return}
  const ds=netClean(msg.data);if(!ds){NET.rej++;return}if(ds.act==='hi')return;let r=null;
  if(ds.act==='autoplace'){let guard=0;while(G&&G.phase==='ask'&&G.q&&G.q.side===seat&&['rock','deploy'].includes(G.q.key)&&guard++<40){const kid=G.q.kid;r=performMove({act:'ask',k:recOpt(G.q).o.k},seat);if(!r.success||(G.q&&G.q.kid===kid))break}}
  else r=gameAct(ds,seat);
  if(r&&r.success)NET.acc++;else{NET.rej++;NET.why.push([ds.act,G.phase,r&&r.error?r.error.slice(0,90):'no move'].join(' | '));if(NET.why.length>20)NET.why.shift()}render();netPush()}
// ---- every render: push the state (host), play "your turn", draw the connection line ----
function netTick(){if(!NET.on)return;if(isHost())netPush();
  const mine=G&&!G.winner&&!NET.inLobby&&(humanTurn()||planSide()>=0);const sig=mine?[G.round,G.phase,G.cur,G.q&&G.q.kid,G.atk&&G.atk.step].join('|'):'';
  if(sig&&sig!==NET.turnSig&&typeof sfx==='function')sfx('turn');NET.turnSig=sig||'';
  renderNetBar()}
function renderNetBar(){const el=document.getElementById('netbar');if(!el)return;if(!NET.on||NET.inLobby||!G){el.innerHTML='';el.classList.add('hidden');return}el.classList.remove('hidden');
  const n=NET.peers.length,me=NET.mySide;let st='';
  if(isClient()&&NET.hostGone)st='<b class="bad">Host left</b>';else if(isClient()&&NET.lastRx&&Date.now()-NET.lastRx>7000)st='<b class="warn">Reconnecting…</b>';
  else if(isHost()&&G.players.some(p=>p.away))st='<span class="warn">Your friend left: the computer flies their ships</span>';
  else st=`${n} connected`;
  const who=me>=0?`you: <b>${esc(sideName(me))}</b>`:'watching';
  el.innerHTML=`${isHost()&&G.winner?'<button class="btn sm" data-a="netlobby">🌐 Rematch lobby</button> ':''}<span class="nb-dot ${st.includes('bad')||st.includes('warn')?'off':''}"></span>Online · ${who} · ${st}`;el.title=el.textContent}
// the planning line: who is still setting dials; otherwise whose decision it is
function netWaitHTML(){if(!NET.on||!G||G.winner||NET.inLobby||G.round<1&&G.phase!=='ask')return '';
  if(G.phase==='plan'){const chips=[0,1].map(k=>{const done=planDone(k);return `<span class="nw ${done?'ok':''}">${esc(netWho(k)==='you'?'You':netWho(k))}: ${done?'✓ dials locked':'setting dials…'}</span>`}).join('');return `<p class="netwait small">${chips}</p>`}
  const k=sideToAct();if(k<0||k===NET.mySide||G.phase==='ask')return '';return `<p class="netwait small">Waiting for ${esc(netWho(k))}…</p>`}
// ---- lobby and start-screen block ----
function lobbyHTML(){const host=isHost();const ps=NET.peers;const r=netRemote();const I=host?netInfo():NET.info;
  const seat=p=>(p.presence&&p.presence.role==='host')||(host&&p.isMe)?0:I&&I.fp&&p.peer===I.fp?1:-1;
  const rows=ps.map(p=>{const k=seat(p);return `<li><b>${esc(peerName(p))}</b>${p.isMe?' (you)':''}${p.presence&&p.presence.role==='host'?' · host':''} · ${k>=0&&I?`flies the ${esc(FACTIONS[I.fac[k]].n)}`:'watches'}</li>`}).join('');
  const status=ps.length<2?'<span class="nb-dot off"></span> Looking for players…':`<span class="nb-dot"></span> ${ps.length} players here`;
  const size=I&&SIZES.find(z=>z.k===I.size);const exs=I?EXPS.filter(e=>I.ex[e.k]).map(e=>e.n).join(', ')||'none':'';
  return `<div class="dlg lobby" role="dialog" aria-modal="true" aria-label="Online battle"><div class="launchbar"><h2>🌐 Online battle</h2><button class="btn ghost x" data-a="netmin" aria-label="Close">✕</button></div>
   <p>Invite code: <b class="code">${esc(NET.code)}</b> <span class="small muted">Your friend opens this game, presses <b>Join</b> and types the code, or opens the link.</span></p>
   <div class="row invrow"><input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" aria-label="Invite link"><button class="btn" data-a="netcopy">Copy link</button>${NET.copied?'<span class="muted small">Copied.</span>':''}</div>
   ${NET.err?`<p class="warn">${esc(NET.err)}</p>`:''}<p class="small netst">${status}</p>
   <h3>Pilots</h3><ul class="plist">${rows||'<li class="muted">Connecting…</li>'}</ul>
   <h3>Battle</h3>${I?`<p class="small">${esc(I.host)} flies the <b>${esc(FACTIONS[I.fac[0]].n)}</b> · ${I.friend?esc(I.friend):`an empty seat (the <b>${esc(I.lvl)}</b> computer)`} flies the <b>${esc(FACTIONS[I.fac[1]].n)}</b> · size <b>${esc(size?size.n:I.size)}</b> · expansions: <b>${esc(exs)}</b></p><p class="small muted">Squads come from the battle size${I.size==='custom'?' (the host’s squad builder)':''}. Everyone sets dials at the same time and in secret; each pilot flies and shoots with their own ships.</p>`:'<p class="small muted">Waiting for the host’s settings…</p>'}
   ${host?`<p class="small muted">To change factions, size or expansions, close this box (✕), change them on the start screen, then come back.</p><div class="acts"><button class="btn primary" data-a="netstart">Start the battle${r.length?'':'<small>against the computer until a friend joins</small>'}</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tip">Waiting for the host to start the battle…</p><div class="acts"><button class="btn" data-a="netleave">Leave</button></div>`}</div>`}
function onlineBlock(){if(!NET.ready)return '<p class="small muted">Checking online play…</p>';
  if(!netAvail())return '<p class="small muted">🌐 Online play needs a recent browser with WebRTC (any current Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online on"><p class="small">You are in online room <b class="code">${esc(NET.code)}</b>.</p><div class="row"><button class="btn primary" data-a="netopen">🌐 Back to the lobby</button><button class="btn" data-a="netleave">Leave the room</button></div></div>`;
  return `<div class="online ${UI.netOpen?'hl':''}" id="onlinebox"><p class="small muted">Free and direct: your browsers connect to each other. Host a battle and send a friend the code or link. You fly the first faction below, your friend the second.</p>
    <div class="row"><input id="netname" placeholder="your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}" aria-label="Your name"><button class="btn" data-a="nethost">Host</button><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}" aria-label="Invite code"><button class="btn ${UI.joinCode?'primary':''}" data-a="netjoin">Join</button></div>${NET.err&&!NET.on?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
// the modal: the lobby, or "the host left"
function netModalHTML(){if(!NET.on)return '';if(NET.inLobby&&!NET.lobbyMin)return lobbyHTML();
  if(isClient()&&NET.hostGone&&G&&!G.winner)return `<div class="dlg" role="dialog" aria-modal="true"><h2>The host left. The game is over.</h2><p class="small muted">The host’s page was running the battle, so it can’t go on without it.</p><div class="acts"><button class="btn primary" data-a="netleave">Back to the menu</button></div></div>`;return ''}
function netClick(a){if(a==='nethost'){netJoin('host',NetRoom.newCode());return true}if(a==='netjoin'){const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return true}
  if(a==='netstart'){netStart();return true}if(a==='netleave'){netLeave();return true}if(a==='netcopy'){netCopy();return true}if(a==='netmin'){NET.lobbyMin=true;render();return true}
  if(a==='netopen'){NET.lobbyMin=false;if(!NET.inLobby)UI.info=false;render();return true}if(a==='netlobby'){netToLobby();return true}return false}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='joincode')UI.joinCode=e.target.value;if(e.target&&e.target.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(e.target.value)});
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='joincode'&&e.key==='Enter'){e.preventDefault();netJoin('client',e.target.value)}});
// tap outside the lobby box closes it (the room stays open)
document.addEventListener('click',e=>{if(e.target&&e.target.id==='modal'&&NET.on&&NET.inLobby&&!NET.lobbyMin){NET.lobbyMin=true;render()}});
