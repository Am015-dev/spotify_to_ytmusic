// ---------- online multiplayer (room capability). The host runs the game; everyone else sends actions. ----------
const NET={on:false,role:null,code:'',room:null,lobby:null,user:null,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,names:{},peers:[],inLobby:false,err:'',conn:false,ready:false,busy:false,ep:0,safe:null,lastRx:0,dead:[],expect:null};
const EMOTES=['😂','😱','👏','😡','🔥','💤'];
async function netInit(){try{if(!window.claude||!window.claude.use){if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('ccs');NET.p2p=true;NET.uid=NetRoom.uid();NET.myName=NetRoom.name();const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;setTimeout(()=>{const d=[...document.querySelectorAll('details')].find(x=>x.querySelector('.online'));if(d)d.open=true;const o=document.querySelector('.online');if(o){o.scrollIntoView({block:'center'});const n=document.getElementById(NET.myName?'joincode':'netname');if(n)n.focus()}},400)}}NET.ready=true;render();return}const [room,user]=await Promise.all([window.claude.use('room'),window.claude.use('user')]);NET.lobby=room;NET.user=user;if(user)NET.uid=await user.id();NET.ready=true;render()}catch(e){NET.ready=true}}
netInit();
const netAvail=()=>!!NET.lobby;
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
function newCode(){const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
async function netJoin(role,code){
  if(NET.busy)return;NET.err='';
  code=String(code||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10);if(!code){NET.err='Type the invite code first.';render();return}
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('ccs-'+code)}catch(e){NET.busy=false;NET.err='Could not join the game room ('+(e&&e.code||'error')+').';render();return}
  NET.busy=false;NET.code=code;NET.role=role;NET.on=true;NET.inLobby=true;NET.mySeat=-1;NET.hostPeer=null;NET.parts={};NET.applied=0;NET.ep=0;NET.safe=null;NET.lastRx=0;NET.dead=[];NET.expect=null;
  if(role==='client')G=null;
  NET.room.presence({role,uid:NET.uid||null,mon:UI.mon,v:1,name:NET.myName||''}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);NET.room.on('emo',onNetEmo);
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const me=ch.peers.find(p=>p.isMe&&p.sameTab);if(me)NET.peer=me.peer;
    if(isHost()&&G){ch.left.forEach(l=>{const s=G.pl.find(p=>p.peer===l.peer&&p.human);if(s){s.human=false;s.away=true;lg(s.i,`${mname(s)}'s player left: the computer takes over.`)}});
      ch.joined.forEach(j=>{if(j.isMe)return;const uid=j.by||(j.presence&&j.presence.uid);const s=uid&&G.pl.find(p=>p.away&&p.uid===uid);if(s){s.peer=j.peer;s.human=true;s.away=false;lg(s.i,`${mname(s)}'s player is back!`)}});
      if(ch.joined.length||ch.left.length){netPush(true);refresh()}}
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer)){if(G&&!G.winner&&!NET.inLobby)netMigrate(NET.hostPeer);else if(!G||NET.inLobby)NET.err='The host closed the room.'}
    netNames();render()});
  NET.room.onConnection(c=>{NET.conn=c;render()});
  UI.info=false;UI.rules=false;render()}
async function netLeave(){try{if(NET.room)await NET.room.leave()}catch(e){}Object.assign(NET,{on:false,role:null,room:null,inLobby:false,mySeat:-1,hostPeer:null,err:''});G=null;UI.info=true;render()}
async function netNames(){if(NET.p2p){let ch=false;NET.peers.forEach(p=>{const n=p.presence&&typeof p.presence.name==='string'?p.presence.name.slice(0,24):'';if(p.by&&n&&NET.names[p.by]!==n){NET.names[p.by]=n;ch=true}});if(NET.uid&&NET.myName&&NET.names[NET.uid]!==NET.myName){NET.names[NET.uid]=NET.myName;ch=true}if(ch)render();return}
  if(!NET.user)return;const ids=[...new Set([...NET.peers.map(p=>p.by||(p.presence&&p.presence.uid)),...(G?G.pl.map(p=>p.uid):[])].filter(Boolean))];if(!ids.length)return;
  try{const ps=await NET.user.profiles(ids);let ch=false;for(const id of ids){const n=ps[id]&&ps[id].name||'';if(NET.names[id]!==n){NET.names[id]=n;ch=true}}if(ch)render()}catch(e){}}
function pname(p){if(!p||!p.uid)return '';return NET.names[p.uid]||''}
function peerName(pr){const uid=pr.by||(pr.presence&&pr.presence.uid);return (uid&&NET.names[uid])||(pr.isMe?'You':'Player')}
// host: start a game with everyone in the room
function netStart(){if(!isHost())return;const hum=NET.peers.filter(p=>p.kind==='viewer').slice(0,6).map(p=>({peer:p.peer,uid:p.by||(p.presence&&p.presence.uid)||null,mon:p.presence&&Number.isInteger(p.presence.mon)?p.presence.mon:null}));
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,mon:UI.mon});
  NET.seats=hum;NET.inLobby=false;newGame('net',Math.min(6,Math.max(UI.n,hum.length)));NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);render();netPush(true)}
// ---- state packets (compressed, chunked: a room message carries at most 4 KiB) ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s)).catch(()=>{});w.close().catch(()=>{});return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u).catch(()=>{});w.close().catch(()=>{});return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;
  let body;if(G){const g=JSON.parse(JSON.stringify(G));g.log=g.log.slice(0,14);
    const c=UI.choice;const pend=c&&c.who!==undefined&&G.pl[c.who]&&G.pl[c.who].peer&&G.pl[c.who].peer!==NET.peer?{title:c.title,text:c.text,options:c.options,who:c.who,dice:!!c.dice,cancel:!!c.cancel,why:c.why||'',cid:c.cid}:null;
    const pw=c&&c.who!==undefined?c.who:-1;
    const safe=['roll','buy'].includes(G.phase)&&!c&&!UI.busy;
    body={code:NET.code,ep:NET.ep,g,fx:UI.fx,banner:UI.banner,pend,pw,safe}}else body={code:NET.code,ep:NET.ep,lobby:true};
  packStr(JSON.stringify(body)).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)NET.room&&NET.room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
let netWon=null;setInterval(()=>{if(isHost()&&G&&G.winner&&netWon!==G.gid){netWon=G.gid;[400,1200,2500,5000,8000].forEach(t=>setTimeout(()=>netPush(true),t))}},300);
function onNetState(msg){if(!NET.on||msg.isMe)return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<40)||!(d.i>=0&&d.i<d.n))return;
  if(NET.dead.includes(msg.peer))return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(o.code!==NET.code)return;const ep=o.ep|0;
    // only a seated player may take over as host (or anyone, before we have a game)
    const seated=!G||G.pl.some(p=>p.peer===msg.peer);
    if(isHost()){if(!seated||!(ep>NET.ep||(ep===NET.ep&&msg.peer<NET.peer)))return;
      NET.role='client';UI.choice=null;UI.busy=false;NET.hostPeer=msg.peer;NET.ep=ep;NET.applied=d.s;lg(-1,'Another player is running the game now.');NET.room.presence({role:'client'}).catch(()=>{})}
    else{if(!NET.hostPeer||(ep>NET.ep&&seated)){if(NET.hostPeer&&NET.hostPeer!==msg.peer)NET.applied=0;NET.hostPeer=msg.peer;NET.ep=Math.max(NET.ep,ep);NET.expect=null}
      if(msg.peer!==NET.hostPeer||ep<NET.ep||d.s<=NET.applied)return;NET.applied=d.s}
    NET.lastRx=Date.now();if(o.safe&&o.g)NET.safe=JSON.stringify(o.g);applyNet(o)}).catch(()=>{})}
// ---- host migration: if the host leaves, the seated player with the lowest seat number takes over from the last safe state ----
function netMigrate(gone){if(!isClient()||!G||G.winner)return;if(gone&&!NET.dead.includes(gone))NET.dead.push(gone);
  const here=new Set(NET.peers.map(p=>p.peer));
  const cand=G.pl.filter(p=>p.human&&p.peer&&!NET.dead.includes(p.peer)&&(here.has(p.peer)||p.peer===NET.peer));
  const next=cand[0];NET.lastRx=Date.now();
  if(!next){NET.err='The host left and nobody can take over.';render();return}
  if(next.peer!==NET.peer){NET.expect=next.peer;UI.banner=`The host left. ${esc(pname(next)||mname(next))} is taking over…`;render();return}
  let g=null;try{g=JSON.parse(NET.safe||'null')}catch(e){}if(!g)g=G;G=g;
  G.pl.forEach(p=>{if(p.human&&p.peer!==NET.peer&&(NET.dead.includes(p.peer)||!here.has(p.peer))){p.human=false;p.away=true}});
  if(!['roll','buy'].includes(G.phase)){G.phase='roll';G.step=1}
  NET.role='host';NET.ep++;NET.hostPeer=NET.peer;NET.expect=null;NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);
  UI.choice=null;UI.busy=false;UI.pending=false;UI.fx={};UI.banner='';NET.err='';
  lg(-1,`The host left. ${pname(G.pl[NET.mySeat])||mname(G.pl[NET.mySeat])}'s page is running the game now.`);
  NET.room.presence({role:'host'}).catch(()=>{});netPush(true);refresh()}
setInterval(()=>{if(!isClient()||!G||G.winner||NET.inLobby||!NET.lastRx)return;if(Date.now()-NET.lastRx>15000)netMigrate(NET.expect||NET.hostPeer)},1000);
function applyNet(o){if(o.lobby||!o.g){if(G){G=null;NET.inLobby=true;render()}return}
  const prevFx=UI.fx||{},prevRoll=G?G.rollId:-1,prevWin=G&&G.winner;G=o.g;if(!Array.isArray(G.deck))G.deck=[];
  NET.mySeat=G.pl.findIndex(p=>p.peer===NET.peer);NET.inLobby=false;UI.info=false;
  const fxn=o.fx||{};for(const k in fxn){const a=fxn[k]||[],b=prevFx[k]||[];const from=a.length<b.length?0:b.length;if(a.length<b.length&&typeof V3!=='undefined')V3.fxSeen[k]=0;
    for(let j=from;j<a.length;j++){if(typeof SND!=='undefined'&&G.pl[k])SND.pitch=[1,.8,1.15,.7,1.3,.9,1.05,.85,1.2][G.pl[k].m]||1;fxSound(a[j].t,a[j].c)}}
  if(G.rollId!==prevRoll)snd('dice');
  if(G.pl[G.active]&&G.active===NET.mySeat&&G.phase==='roll'&&G.rollId!==prevRoll&&G.rolls===rerollsOf(G.pl[G.active]))snd('turn');
  if(NET.mySeat>=0&&G.pl[NET.mySeat].away&&NET.room&&Date.now()-(NET.hiT||0)>2500){NET.hiT=Date.now();NET.room.emit('act',{act:'hi'}).catch(()=>{})}
  UI.fx=fxn;UI.banner=o.banner||'';NET.pw=o.pw;UI.choice=o.pend&&o.pend.who===NET.mySeat?Object.assign({},o.pend,{net:true}):null;
  netNames();render()}
// client -> host
function netSend(ds){if(!NET.room)return;const d={};['act','die','card','opt','cid'].forEach(k=>{if(ds[k]!==undefined)d[k]=String(ds[k]).slice(0,24)});NET.room.emit('act',d).catch(()=>{});snd('click')}
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;let seat=G.pl.findIndex(p=>p.peer===msg.peer&&p.human);
  if(seat<0){const s=G.pl.find(p=>p.away&&(p.peer===msg.peer||(msg.by&&p.uid===msg.by)));if(!s)return;s.peer=msg.peer;s.human=true;s.away=false;NET.dead=NET.dead.filter(x=>x!==msg.peer);lg(s.i,`${mname(s)}'s player is back!`);netPush(true);refresh();return}
  if(msg.data&&msg.data.act==='hi')return;const d=msg.data||{};const ds={};
  if(typeof d.act==='string')ds.act=d.act.slice(0,24);if(d.die!==undefined)ds.die=String(parseInt(d.die,10)||0);if(d.card!==undefined)ds.card=String(parseInt(d.card,10)||0);if(d.opt!==undefined)ds.opt=String(d.opt).slice(0,24);if(d.cid!==undefined)ds.cid=String(d.cid).slice(0,12);
  gameAct(ds,seat);netPush()}
// emotes
function sendEmote(e){if(!NET.room||!EMOTES.includes(e))return;NET.room.emit('emo',{e}).catch(()=>{})}
function onNetEmo(msg){const e=msg.data&&msg.data.e;if(!EMOTES.includes(e)||!G)return;const seat=G.pl.findIndex(p=>p.peer===msg.peer);if(seat<0)return;
  if(typeof V3!=='undefined'&&V3.on&&V3.mons[seat])popLabel(V3.mons[seat].g.position.clone().add(new THREE.Vector3(0,6.2,0)),e,'emote');
  else{UI.banner=`${esc(mname(G.pl[seat]))} ${e}`;renderPanel()}}
function lobbyHTML(){const host=isHost();const ps=NET.peers.filter(p=>p.kind==='viewer');
  const rows=ps.map(p=>{const pr=p.presence||{};const m=Number.isInteger(pr.mon)?MONS[pr.mon]:null;return `<li><b>${esc(peerName(p))}</b>${p.isMe&&p.sameTab?' (you)':''}${pr.role==='host'?' · host':''}${p.guest?' · guest':''}${m?` · wants ${esc(m.n)}`:''}</li>`}).join('')||'<li class="muted">Connecting…</li>';
  const exs=EXPS.filter(e=>e.k==='evo'?UI.evo:UI.ex[e.k]).map(e=>e.n).join(', ')||'none';
  return `<div class="dlg start" role="dialog" aria-modal="true"><h2>🌐 Online game</h2>
   <p>Invite code: <b class="code">${esc(NET.code)}</b> <span class="small muted">Friends open this same page, press <b>Join a game</b> and type the code.</span></p>${NET.p2p?`<p class="small">Or send them this link: <input class="invlink" readonly value="${esc(NetRoom.inviteLink(NET.code))}" onclick="this.select()"> <button class="btn" data-a="netcopy">Copy link</button>${NET.copied?' <span class="muted">Copied.</span>':''}</p>`:''}
   ${NET.err?`<p class="warn">${esc(NET.err)}</p>`:''}${NET.conn===false&&NET.on?'<p class="small muted">Connecting to the room…</p>':''}
   <h3 style="margin:.4rem 0 .2rem">Players here (${ps.length})</h3><ul class="plist">${rows}</ul>${NET.p2p&&ps.length<2?'<p class="small muted">⏳ Waiting for friends to join… Send them the code or link.</p>':''}
   <p style="margin:.4rem 0 .2rem"><b>Your monster</b> (if two players pick the same one, one gets a random monster):</p>
   <div class="monpick">${MONS.map((M,k)=>k).filter(k=>UI.xp!=='base'||k<6).map(k=>`<button class="${UI.mon===k?'on':''}" data-mon="${k}"><svg viewBox="-66 -70 132 136">${monArt(k)}</svg><span>${esc(MONS[k].n)}</span></button>`).join('')}</div>
   ${host?`<p class="small">Game: <b>${UI.xp==='base'?'Base game':UI.xp==='trial'?'Mindbug Trial':'Mindbug Experience'}</b> · Expansions: <b>${esc(exs)}</b> · Seats: <b>${Math.min(6,Math.max(UI.n,ps.length))}</b> (empty seats go to <b>${UI.lvl}</b> computer monsters). Change these on the start screen before hosting.</p>
     <div class="acts"><button class="btn primary" data-a="netstart" ${ps.length<1?'disabled':''}>Start the game with ${ps.length} player${ps.length===1?'':'s'}</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tip">Waiting for the host to start the game…</p><div class="acts"><button class="btn" data-a="netleave">Leave</button></div>`}</div>`}
function onlineBlock(){if(!NET.ready)return '<p class="small muted">Checking online play…</p>';
  if(!netAvail())return '<p class="small muted">🌐 Online play needs a browser with WebRTC (any recent Chrome, Edge, Firefox or Safari).</p>';
  if(NET.p2p)return `<div class="online"><b>🌐 Play online with friends</b><span class="small muted"> Free and direct: your browsers connect to each other. Host a game and send friends the code or link.</span>
    <div class="row"><input id="netname" placeholder="your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}"><button class="btn" data-a="nethost">Host a game</button><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}"><button class="btn" data-a="netjoin">Join a game</button></div>${NET.err&&!NET.on?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`;
  return `<div class="online"><b>🌐 Play online with friends</b><span class="small muted"> Share this page with them first (as Contributors or Editors).</span>
    <div class="row"><button class="btn" data-a="nethost">Host a game</button><input id="joincode" placeholder="invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}"><button class="btn" data-a="netjoin">Join a game</button></div>${NET.err&&!NET.on?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`}

document.addEventListener('input',e=>{if(e.target&&e.target.id==='joincode')UI.joinCode=e.target.value;if(e.target&&e.target.id==='netname'&&typeof NetRoom!=='undefined'){NET.myName=NetRoom.setName(e.target.value)}});
function netCopy(){const t=NetRoom.inviteLink(NET.code);const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};try{navigator.clipboard.writeText(t).then(done,()=>{const i=document.querySelector('.invlink');if(i)i.select()})}catch(e){const i=document.querySelector('.invlink');if(i)i.select()}}
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='joincode'&&e.key==='Enter'){e.preventDefault();netJoin('client',e.target.value)}});
