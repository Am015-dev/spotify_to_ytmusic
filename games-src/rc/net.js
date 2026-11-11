// ---------- online play: free peer-to-peer rooms (NetRoom, WebRTC). The host's page runs the game; every other page shows the host's state from its own castaway's side and sends small actions ----------
// Seats: each human plays one castaway (in join order); empty seats are computer castaways.
// Shared decisions belong to the first player ★ of the day (the host when the first player is a computer): team questions, Friday/dog/helper pawns,
// starting items, discovery tokens, the signal pile, turning the story pages and starting the day. The host can always turn the pages and start the day too.
// G.chars[i].hh = a human plays this castaway (the truth the engine uses, see hum()); G.chars[i].human = "this page plays it" (the lens the UI uses).
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,applied:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],inLobby:false,err:'',conn:false,ready:false,busy:false,lastRx:0,lens:-1,lensOn:false,myName:'',p2p:false,gone:false,opts:null,copied:false,lastTxt:''};
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('swi');NET.p2p=true;NET.uid=NetRoom.uid();NET.myName=NetRoom.name();const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.netOpen=true;NET.scrollJoin=true}}}catch(e){}NET.ready=true}
netInit();
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netOn=()=>!!(NET.on&&G&&G.net);
// ---------- seats and roles ----------
function netLead(){if(!G||!G.net)return -1;const f=P(G.first);return f&&hum(f)&&!f.dead?f.i:G.net.host}
const netTurner=s=>!!(G&&G.net)&&s>=0&&(s===netLead()||s===G.net.host);
// only the first player starts the day (the host when the first player is a computer or has left); the host may also turn the story pages
const netStarter=s=>!!(G&&G.net)&&s>=0&&s===netLead();
function helperMine(){return !netOn()||NET.lens===netLead()}
function helperAI(){return !NET.lensOn||helperMine()}
function netPawnMine(p){if(!netOn())return true;return p.c!=null?p.c===NET.lens:helperMine()}
function netWho(ci){const c=P(ci);if(!c)return '';if(ci===NET.lens)return 'you';return hum(c)?`${c.pn||'a friend'} (${c.nm})`:`the computer (${c.nm})`}
function netTag(c){if(!netOn())return '';return c.i===NET.lens?' · you':hum(c)&&c.pn?' · '+esc(c.pn.split(' ')[0]):''}
function netTagLong(c){return c.i===NET.lens?' <small>(you)</small>':hum(c)?` <small>(${esc(c.pn||'a friend')})</small>`:c.away?' <small>(computer: the player left)</small>':' <small>(computer)</small>'}
function netNotMine(ci){return netOn()&&ci!==NET.lens?'another castaway: its player uses it':null}
function netShared(){if(!netOn()||helperMine())return null;return `shared: ${netWho(netLead())} uses it`}
function netLeft(ci){const placed=placedIds();return allPawns().filter(p=>p.c===ci&&!placed.has(p.id)).length}
// human seats still planning (not marked ready), except one seat
// a job with this seat's pawn that still lacks pawns (a player can't be ready with a half-staffed job)
function netMyProb(seat){for(const a of G.plan.acts){if(!a.pw.some(id=>{const q=pawnInfo(id);return q&&q.c===seat}))continue;const n=actNeed(a);if(a.pw.length<n.need)return `${actLabel(a)} needs ${n.need} pawns: add another pawn or take yours off.`}return null}
function netNotReady(except){if(!netOn())return [];return G.chars.filter(c=>hum(c)&&!c.dead&&!c.npc&&c.i!==except&&G.net.ready[c.i]!==G.round).map(c=>c.i)}
function netUnready(s){if(G&&G.net)delete G.net.ready[s]}
// run fn as seat s sees the game (the advisor and "Plan for me" work on "my" castaway through c.human)
function withLens(s,fn){const keep=NET.lens;const set=v=>{NET.lens=v;G.chars.forEach(c=>c.human=c.i===v)};set(s);NET.lensOn=true;try{return fn()}finally{NET.lensOn=false;set(keep)}}
// ---------- joining, leaving ----------
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';
  code=NetRoom.cleanCode(code);if(!code){NET.err='Type the invite code first.';render();return}
  if(!NET.myName){NET.myName=NetRoom.setName(role==='host'?'Host':'Player '+Math.floor(Math.random()*90+10))}
  NET.busy=true;render();
  try{if(NET.room){try{await NET.room.leave()}catch(e){}}NET.room=await NET.lobby.join('swi-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';render();return}
  Object.assign(NET,{busy:false,code,role,on:true,inLobby:true,mySeat:-1,lens:-1,hostPeer:null,parts:{},applied:0,lastRx:0,gone:false,err:'',opts:null,lastTxt:''});
  G=null;UI.modal=null;UI.netOpen=false;clearTimeout(UI.autoT);
  NET.room.presence({role,uid:NET.uid,name:NET.myName||'',v:1}).catch(()=>{});
  NET.room.on('st',onNetState);NET.room.on('act',onNetAct);NET.room.on('note',m=>{if(isClient()&&m.peer===NET.hostPeer&&m.data&&typeof m.data.t==='string'&&G)toast(m.data.t.slice(0,200))});
  NET.room.onPeers(ch=>{NET.peers=ch.peers;const me=ch.peers.find(p=>p.isMe);if(me)NET.peer=me.peer;
    if(isHost()&&G&&G.net){let chg=false;
      for(const l of ch.left){const c=G.chars.find(x=>x.peer===l.peer&&hum(x));if(c){netSeatLeft(c);chg=true}}
      for(const j of ch.joined){const uid=j.by||(j.presence&&j.presence.uid);const c=uid&&G.chars.find(x=>x.away&&x.uid===uid);if(c){netSeatBack(c,j.peer);chg=true}}
      if(chg)refresh()}
    if(isClient()&&NET.hostPeer&&ch.left.some(p=>p.peer===NET.hostPeer))netHostGone();
    if(isHost())netPush(true);render()});
  NET.room.onConnection(c=>{NET.conn=c;render()});
  render();if(isHost())netPush(true)}
async function netLeave(){try{if(NET.room)await NET.room.leave()}catch(e){}
  Object.assign(NET,{on:false,role:null,room:null,inLobby:false,mySeat:-1,lens:-1,hostPeer:null,err:'',gone:false,peers:[]});G=null;clearTimeout(UI.autoT);UI.beats.length=0;UI.shown=-1;netResetView();openStart()}
function netHostGone(){if(G&&!G.over){NET.gone=true;clearTimeout(UI.autoT)}else if(!G){NET.err='The host closed the room.'}render()}
function netResetView(){try{V3.layout=null;for(const k in V3.tiles){V3.scene&&V3.scene.remove(V3.tiles[k].g)}V3.tiles={}}catch(e){}}
function netSeatLeft(c){c.hh=false;c.away=true;netUnready(c.i);
  // mid-plan: take the leaver's pawns back so the computer plans them from scratch (a half-staffed job would block the day)
  if(planOpen())for(const p of allPawns())if(p.c===c.i)unplace(p.id);
  lg(`${c.pn||'A player'} left: the computer plays the ${c.nm} now.`,'step');
  if(G.q&&G.q.who===c.i&&!G.over){const q=G.q;let ix=0;try{ix=aiChoose(q.title,q.opts,c,q)}catch(e){}answer(ix>=0&&ix<q.opts.length?ix:0)}}
function netSeatBack(c,peer){c.peer=peer;c.hh=true;c.away=false;lg(`${c.pn||'A player'} is back and plays the ${c.nm} again.`,'step')}
function peerName(p){const n=p&&p.presence&&typeof p.presence.name==='string'?p.presence.name.replace(/[<>&"]/g,'').trim().slice(0,24):'';return n||(p&&p.isMe?'You':'Player')}
// ---------- the lobby: who is here, the options the host chose, the seats ----------
const NCH=()=>Object.keys(CHARS).filter(k=>!CHARS[k].npc);
function netSeatPlan(){const s=UI.setup;const hum=NET.peers.slice(0,4);const chars=s.chars.slice(0,4);for(const k of NCH())if(chars.length<Math.max(1,hum.length)&&!chars.includes(k))chars.push(k);
  const grew=chars.length!==s.chars.length;return {chars,hum,fri:grew?chars.length<=2:!!s.friday,dog:grew?(chars.length===1||s.diff==='easy'):!!s.dog}}
function netOpts(){const s=UI.setup;const sp=netSeatPlan();return {scen:SCENARIOS[s.scen].n,diff:s.diff,fri:sp.fri,dog:sp.dog,seats:sp.chars.map((k,i)=>({c:CHARS[k].n,p:sp.hum[i]?peerName(sp.hum[i]):null})),extra:Math.max(0,NET.peers.length-4)}}
function netStatus(){if(NET.gone)return 'The host left';if(!NET.on)return '';if(NET.conn===false)return 'Connecting to the room…';if(isClient()&&G&&NET.lastRx&&Date.now()-NET.lastRx>8000)return 'Reconnecting…';
  const n=NET.peers.length;return n<=1?(isHost()?'Looking for players…':'Looking for the host…'):`${n} players here`}
function lobbyHTML(){const host=isHost();const ps=NET.peers;const o=host?netOpts():NET.opts;
  const rows=ps.map(p=>`<li><b>${esc(peerName(p))}</b>${p.isMe?' (you)':''}${p.presence&&p.presence.role==='host'?' · host':''}</li>`).join('')||'<li class="muted">Connecting…</li>';
  const seats=o&&Array.isArray(o.seats)?o.seats.slice(0,4).map((x,i)=>`<li><b>${esc(String(x&&x.c||'?'))}</b> · ${x&&x.p?esc(String(x.p)):'<span class="muted">computer</span>'}</li>`).join(''):'';
  const opt=o?`<p class="small">Scenario: <b>${esc(String(o.scen||''))}</b> · ${esc({easy:'Easier',standard:'Standard',hard:'Harder'}[o.diff]||'Standard')} · Friday ${o.fri?'helps':'stays away'} · the dog ${o.dog?'helps':'stays home'}</p><ol class="netseats">${seats}</ol>${o.extra?`<p class="small muted">${o.extra|0} more ${o.extra>1?'people watch':'person watches'}: a game has 4 castaways at most.</p>`:''}`:'<p class="small muted">Waiting for the host’s options…</p>';
  const link=NetRoom.inviteLink(NET.code);
  return `<div class="mbox lobby" role="dialog" aria-modal="true" aria-labelledby="lobbyh"><button class="x" data-a="netclose" aria-label="Close">×</button><h2 id="lobbyh">🌐 Online game</h2>
   <p class="netst2">${esc(netStatus())}</p>
   <p>Invite code: <b class="code">${esc(NET.code)}</b> <span class="small muted">Friends open this game, choose <b>Play online</b> and type the code, or open the link.</span></p>
   <div class="invrow"><input class="invlink" readonly value="${esc(link)}" aria-label="Invite link"><button class="btn" data-a="netcopy">Copy link</button>${NET.copied?'<span class="muted small">Copied.</span>':''}</div>
   ${NET.err?`<p class="warn">${esc(NET.err)}</p>`:''}
   <h3>Players here (${ps.length})</h3><ul class="netpl">${rows}</ul>
   <h3>The game</h3>${opt}
   <p class="small muted">Everyone plans their own castaway. Empty seats are computer castaways. The first player ★ of each day turns the story pages, answers the team’s questions, plans Friday and the dog, and starts the day once everyone is ready.</p>
   ${host?`<p class="small muted">To change the scenario or castaways, close this window, change them on the start screen, then open the lobby again.</p><div class="mb"><button class="btn go" data-a="netstart">Start with ${Math.min(4,ps.length)} player${Math.min(4,ps.length)===1?'':'s'}</button><button class="btn" data-a="netleave">Close the room</button></div>`
   :`<p class="tip">Waiting for the host to start the game…</p><div class="mb"><button class="btn" data-a="netleave">Leave</button></div>`}</div>`}
function goneHTML(){return `<div class="mbox" role="dialog" aria-modal="true"><h2>The host left</h2><p>The host’s page ran the game, so the game is over.</p><div class="mb"><button class="btn go" data-a="netleave">Back to the start</button></div></div>`}
function onlineBlock(){if(!NET.ready)return '';if(!NET.p2p)return '<p class="small muted netna">🌐 Online play needs a recent browser (Chrome, Edge, Firefox or Safari).</p>';
  if(NET.on)return `<div class="online"><b>🌐 Online room <span class="code">${esc(NET.code)}</span></b> <span class="small muted">${esc(netStatus())}</span><div class="netrow"><button class="btn go" data-a="netlobby">Open the lobby</button><button class="btn" data-a="netleave">Leave the room</button></div>${NET.err?`<p class="warn">${esc(NET.err)}</p>`:''}</div>`;
  return `<details class="online" id="netdet" ${UI.netOpen?'open':''}><summary>🌐 Play online with friends</summary><p class="small muted">Free and direct: your browsers connect to each other. Each friend plays their own castaway; empty seats go to the computer. Choose the scenario and castaways below, press Host, then send friends the code or link.</p>
   <div class="netrow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="${esc(NET.myName||'')}" aria-label="Your name"><button class="btn go" data-a="nethost">Host a game</button></div>
   <div class="netrow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" value="${esc(UI.joinCode||'')}" aria-label="Invite code"><button class="btn" data-a="netjoin">Join a game</button></div>${NET.err?`<p class="warn">${esc(NET.err)}</p>`:''}</details>`}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};const done=()=>{NET.copied=true;render();setTimeout(()=>{NET.copied=false;render()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netPill(){if(NET.scrollJoin){const d=document.getElementById('netdet');if(d){NET.scrollJoin=false;setTimeout(()=>{try{d.scrollIntoView({block:'center'})}catch(e){}},50)}}const el=document.getElementById('netst');if(!el)return;const t=NET.on?`🌐 ${NET.code} · ${netStatus()}`:'';el.hidden=!t;if(el.textContent!==t)el.textContent=t;el.classList.toggle('bad',/Reconnecting|left/.test(t))}
setInterval(()=>{if(NET.on){netPill();if(isClient()&&NET.inLobby&&UI.modal!=='start'){const s=document.querySelector('.netst2');if(s&&s.textContent!==netStatus())render()}}},1000);
// ---------- host: start ----------
function netStart(){if(!isHost())return;const sp=netSeatPlan();if(!sp.hum.length)return;const s=UI.setup;const keep=JSON.stringify(s);
  s.chars=sp.chars;s.ai={};sp.chars.forEach((k,i)=>{if(!sp.hum[i])s.ai[k]=true});s.friday=sp.fri;s.dog=sp.dog;
  NET.inLobby=false;UI.modal=null;UI.auto=false;
  try{beginGame()}finally{Object.assign(UI.setup,JSON.parse(keep))}
  G.mode='net';G.net={gid:NetRoom.newCode()+(Date.now()%100000),host:0,ready:{}};
  G.chars.forEach((c,i)=>{const h=sp.hum[i];c.hh=!!h;if(h){c.uid=h.by||(h.presence&&h.presence.uid)||null;c.peer=h.peer;c.pn=peerName(h)}c.human=i===0});
  NET.mySeat=0;NET.lens=0;G.chars[0].pn=NET.myName||'Host';refresh();netPush(true)}
function netToLobby(){if(!isHost())return;G=null;NET.inLobby=true;UI.modal=null;clearTimeout(UI.autoT);UI.beats.length=0;UI.shown=-1;netPush(true);render()}
// ---------- state packets (compressed, chunked: a room message carries at most a few KiB) ----------
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u);w.close();return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
// the story scenes the other pages need: from the last scene of the day before the one on screen to now, with the snapshots those scenes show
function netBeats(){const B=UI.beats;const i=storyIdx();const ref=i>=0?B[i].round:G.round;let w=B.length;while(w>0&&B[w-1].round>=ref)w--;w=Math.max(0,w-1);if(B.length-w>160)w=B.length-160;
  const sel=new Set([i]);if(i>=0&&B[i].kind==='daysum'){for(let k=i-1;k>=w;k--){const x=B[k];if(x.round!==B[i].round)break;if(x.kind==='plan'||x.kind==='go'){sel.add(k);if(x.kind==='plan')break}}}
  for(let k=w;k<B.length;k++)if(B[k].kind==='go')sel.add(k);
  return {w,beats:B.slice(w).map((b,j)=>({kind:b.kind,data:b.data,n0:b.n0,round:b.round,phase:b.phase,id:b.id,snap:sel.has(w+j)&&b.snap?b.snap:undefined}))}}
function netBody(){if(!G||!G.net)return {code:NET.code,lobby:true,opts:netOpts()};
  const g=JSON.parse(JSON.stringify(G));const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}};
  // face-down piles travel shuffled: their order is hidden information
  sh(g.ev.deck);sh(g.mys.deck);sh(g.discs);sh(g.beast);for(const d in g.adv)sh(g.adv[d]);
  const bt=netBeats();const n0=UI.beats[bt.w]?UI.beats[bt.w].n0:G.logN;g.log=G.log.slice(0,Math.max(40,Math.min(320,(G.logN-n0)+6)));
  return {code:NET.code,g,beats:bt.beats,shown:UI.shown-bt.w,quick:!!UI.quick,mate:UI.mate||null,auto:!!UI.auto}}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(true)},310);return}
  NET.last=now;const seq=++NET.seq;let body;try{body=JSON.stringify(netBody())}catch(e){return}
  packStr(body).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++)NET.room&&NET.room.emit('st',{s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)}).catch(()=>{})})}
setInterval(()=>{if(isHost())netPush(true)},3000);
function onNetState(msg){if(!isClient())return;const d=msg.data;if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<200)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  if(NET.hostPeer&&msg.peer!==NET.hostPeer)return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];for(const x in NET.parts){const [pp,ss]=x.split(':');if(pp===msg.peer&&+ss<d.s)delete NET.parts[x]}
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code)return;if(!NET.hostPeer)NET.hostPeer=msg.peer;if(msg.peer!==NET.hostPeer||d.s<=NET.applied)return;NET.applied=d.s;NET.lastRx=Date.now();
    if(txt===NET.lastTxt)return;NET.lastTxt=txt;applyNet(o)}).catch(()=>{})}
function applyNet(o){if(o.lobby||!o.g){NET.opts=o.opts&&typeof o.opts==='object'?o.opts:null;if(G||!NET.inLobby){G=null;NET.inLobby=true;UI.modal=null;UI.beats.length=0;UI.shown=-1;clearTimeout(UI.autoT)}render();return}
  const fresh=!G||!G.net||G.net.gid!==o.g.net.gid;const myQ0=fresh?false:humanQ(),plan0=fresh?false:planOpen()&&netLeft(NET.mySeat)>0;
  G=o.g;NET.mySeat=G.chars.findIndex(c=>c.uid&&c.uid===NET.uid);if(NET.mySeat<0)NET.mySeat=G.chars.findIndex(c=>c.peer&&c.peer===NET.peer);
  NET.lens=NET.mySeat;G.chars.forEach(c=>c.human=c.i===NET.mySeat);
  UI.beats=Array.isArray(o.beats)?o.beats:[];UI.shown=Number.isInteger(o.shown)?o.shown:UI.beats.length-1;UI.quick=!!o.quick;UI.mate=o.mate||null;UI.auto=false;
  if(fresh){resetPlanSteps();UI.overSeen=false;UI.sel=null;UI.tileSel=null;UI.fx.length=0;UI.fxSeen=0;UI.seenBeat=null;UI.lastNeed=null;netResetView()}
  NET.inLobby=false;if(UI.modal==='start')UI.modal=null;
  if(UI.netPlaced){UI.netPlaced=false;try{wizPlaced()}catch(e){}}
  // a "your turn" chime when a decision becomes yours
  if((humanQ()&&!myQ0)||(planOpen()&&netLeft(NET.mySeat)>0&&!plan0&&!storyActive()))sfx('round');
  refresh()}
// ---------- actions: a page turns a click into an action; the host checks it and applies it for that seat ----------
function netSend(m){if(!NET.room)return;let s='';try{s=JSON.stringify(m)}catch(e){return}if(s.length>1500)return;NET.room.emit('act',JSON.parse(s)).catch(()=>{})}
function netDo(m){if(isClient()){netSend(m);if(m.t==='place'||m.t==='job')UI.netPlaced=true;return}const r=netAct(m,NET.mySeat);if(r)toast(r);else if(m.t==='place'||m.t==='job'){try{wizPlaced()}catch(e){}refresh()}}
function onNetAct(msg){if(!isHost()||!G||!G.net)return;const d=msg.data;if(!d||typeof d!=='object'||typeof d.t!=='string'||d.t.length>12)return;
  let c=G.chars.find(x=>x.peer===msg.peer&&hum(x));
  if(!c){const s=G.chars.find(x=>x.away&&(x.peer===msg.peer||(msg.by&&x.uid===msg.by)));if(!s)return;netSeatBack(s,msg.peer);refresh();return}
  const sig=()=>G?G.logN+'|'+planSig()+'|'+UI.shown+'|'+JSON.stringify(G.net.ready)+'|'+G.moveAsk:'';const s0=sig();
  const r=netAct(d,c.i);if(sig()!==s0){NET.stats=NET.stats||{};NET.stats[d.t]=(NET.stats[d.t]||0)+1}if(r&&NET.room)NET.room.sendTo(msg.peer,'note',{t:String(r).slice(0,200)}).catch(()=>{})}
const NT={threat:1,hunt:1,build:1,gather:1,explore:1,camp:1,rest:1,special:1,tmap:1};
function netTgt(type,t){const I=v=>Number.isInteger(v),nm=MAP.length;
  switch(type){case 'threat':return I(t)&&t>=0&&t<2?{v:t}:null;case 'hunt':case 'camp':case 'rest':case 'tmap':return {v:null};
  case 'explore':return I(t)&&t>=0&&t<nm?{v:t}:null;
  case 'gather':return t&&typeof t==='object'&&I(t.pos)&&t.pos>=0&&t.pos<nm&&I(t.i)&&t.i>=0&&t.i<10?{v:{pos:t.pos,i:t.i}}:null;
  case 'build':{if(!t||typeof t!=='object'||typeof t.k!=='string'||t.k.length>24)return null;const k=t.k;if(k==='cross')return I(t.cross)&&t.cross>=0&&t.cross<nm&&G.scen==='hexed'?{v:{k,cross:t.cross}}:null;
    if(['shelter','roof','pal','weapon'].includes(k)||Object.prototype.hasOwnProperty.call(INVENTIONS,k)||Object.prototype.hasOwnProperty.call(SCENARIOS[G.scen].invs||{},k))return {v:{k}};return null}
  case 'special':return typeof t==='string'&&Object.prototype.hasOwnProperty.call(SC().specials||{},t)?{v:t}:null}return null}
function netAct(m,seat){if(!G||!G.net||!m||typeof m.t!=='string')return null;const c=P(seat);if(!c||!hum(c))return null;
  const lead=netLead(),turner=netTurner(seat);const I=Number.isInteger;
  const own=pid=>{if(typeof pid!=='string'||pid.length>12)return false;const p=pawnInfo(pid);if(!p)return false;return p.c!=null?p.c===seat:seat===lead};
  const plan=planOpen();const snap=plan?JSON.stringify(G.plan):null;const notPlan='The castaways are not planning now.';
  const leadOnly=()=>`Shared: ${netWho(lead)} ${lead===G.net.host&&!hum(P(G.first))?'(the host) ':''}decides that today.`;
  const alt=I(m.alt)&&m.alt>=0&&m.alt<4?m.alt:0;
  try{switch(m.t){
  case 'next':{if(!turner)return `${netWho(lead)} turns the pages.`;const i=storyIdx();if(i>=0&&UI.beats[i].id===m.id)storyNext();return null}
  case 'skip':{if(!turner)return `${netWho(lead)} turns the pages.`;if(storyIdx()<0)return null;UI.shown=Math.max(UI.shown,G.q?UI.beats.length-2:UI.beats.length-1);UI.seenBeat=null;refresh();return null}
  case 'ans':{const q=G.q;if(!q||q.who!==seat)return null;if(m.q!==G.logN||!I(m.i)||m.i<0||m.i>=q.opts.length)return null;answer(m.i);return null}
  case 'place':{if(!plan)return notPlan;if(!own(m.pid))return 'That pawn is not yours.';if(!NT[m.type])return null;const tg=netTgt(m.type,m.tgt);if(!tg)return null;
    const e=place(m.pid,m.type,tg.v,alt);if(!e)netUnready(seat);refresh();return e}
  case 'rm':{if(!plan)return notPlan;if(!own(m.pid))return 'That pawn is not yours.';unplace(m.pid);netUnready(seat);refresh();return null}
  case 'pay':{if(!plan)return notPlan;const a=G.plan.acts.find(x=>x.id===m.id);if(!a)return null;if(!a.pw.some(own))return 'Only the castaways on that job choose how to pay.';setPay(a.id,m.pay==='fur'?'fur':'wood');refresh();return null}
  case 'job':{if(!plan)return notPlan;if(!NT[m.type])return null;const tg=netTgt(m.type,m.tgt);if(!tg)return null;if(m.lead!=null&&m.lead!==seat)return 'That castaway is not yours.';if(m.mv!=null&&!own(m.mv))return 'That pawn is not yours.';
    const r=withLens(seat,()=>{if(m.mv!=null)unplace(m.mv);return doJob(m.type,tg.v,alt,m.lead==null?null:seat)});netUnready(seat);refresh();return r}
  case 'suggest':{if(!plan)return notPlan;withLens(seat,()=>suggestCore(false));netUnready(seat);refresh();return null}
  case 'clear':{if(!plan)return notPlan;withLens(seat,()=>clearPlan([seat]));netUnready(seat);refresh();return null}
  case 'skill':{if(m.ci!==seat)return 'Only its player can use that skill.';if(typeof m.k!=='string')return null;const r=useSkill(seat,m.k.slice(0,16));if(!r)netUnready(seat);return r}
  case 'item':{if(seat!==lead)return leadOnly();if(typeof m.k!=='string')return null;return useItem(m.k.slice(0,16))}
  case 'disc':{if(seat!==lead)return leadOnly();if(!I(m.i))return null;return discUse(m.i)}
  case 'pile':{if(seat!==lead)return leadOnly();if(!I(m.n)||m.n<1||m.n>15)return null;return pileAdd(m.n)}
  case 'moveask':{if(seat!==lead)return leadOnly();G.moveAsk=m.v?1:0;refresh();return null}
  case 'ready':{if(!plan)return notPlan;if(m.v){if(netLeft(seat))return `Give all of the ${c.nm}’s pawns a job first.`;const pr=netMyProb(seat);if(pr)return pr;G.net.ready[seat]=G.round}else netUnready(seat);refresh();return null}
  case 'start':{if(!plan)return notPlan;if(!netStarter(seat))return `${netWho(lead)} starts the day.`;const w=netNotReady(seat);if(w.length)return `Still planning: ${w.map(netWho).join(', ')}.`;
    for(const x of G.chars)if(x.npc&&!x.dead){const pid='c'+x.i+'_0';if(pawnInfo(pid)&&!placedIds().has(pid))place(pid,'rest',null)}
    const r=startActions();if(!r)G.net.ready={};return r}
  }}catch(err){if(snap&&planOpen())G.plan=JSON.parse(snap);return 'That did not work.'}return null}
// ---------- the page's buttons in an online game ----------
function netTryStart(force){if(!planOpen())return;const seat=NET.lens;if(!netStarter(seat)){netDo({t:'ready',v:1});return}
  const w=netNotReady(seat);if(w.length){toast(`Still planning: ${w.map(netWho).join(', ')}.`);return}
  if(!force){const red=uncoveredRed();if(red.length){UI.confirm=red.map(p=>p.confirm||('⚠ '+p.title+' is not covered.')).join(' ');UI.confirmSig=planSig();renderStep();GX.showDock();return}}
  UI.confirm=null;sfx('click');netDo({t:'start'})}
function netClick(b,d,e){
  switch(d.a){case 'nethost':NET.myName=NetRoom.setName((document.getElementById('netname')||{}).value||NET.myName);netJoin('host',NetRoom.newCode());return true;
    case 'netjoin':NET.myName=NetRoom.setName((document.getElementById('netname')||{}).value||NET.myName);netJoin('client',(document.getElementById('joincode')||{}).value||UI.joinCode);return true;
    case 'netleave':netLeave();return true;case 'netstart':netStart();return true;case 'netcopy':netCopy();return true;
    case 'netclose':UI.modal='start';render();return true;case 'netlobby':UI.modal=null;render();return true;
    case 'start':case 'continue':if(NET.on){NET.err='Leave the online room first to play on this device alone.';render();return true}return false}
  if(!netOn())return false;const act=m=>{netDo(m);return true};
  if(d.ans!=null){sfx('click');return act({t:'ans',i:+d.ans,q:G.logN})}
  if(d.do!=null){const p=priorities()[+d.do];if(!p||!p.act)return true;if(!(p.can||p.move)){toast(p.cant||'Not possible now.');return true}sfx('place');
    return act({t:'job',type:p.act.type,tgt:p.act.tgt,alt:p.act.alt||0,lead:p.lead==null?null:p.lead,mv:p.move?p.move.id:null})}
  if(d.pq!=null){const p=priorities()[+d.pq];const cur=curPawn();if(p&&p.act&&cur){UI.sugWhy[JSON.stringify([p.act.type,p.act.tgt])]=p.title;UI.sel=null;sfx('place');act({t:'place',pid:cur.id,type:p.act.type,tgt:p.act.tgt,alt:p.act.alt||0})}return true}
  if(d.place){const o=JSON.parse(decodeURIComponent(d.place));let pid=UI.sel;if(!pid){const p=autoPawn(o.type,o.tgt,o.alt);if(!p){toast('None of your pawns can do that.');return true}pid=p.id}
    const w=placeWhy(pid,o.type,o.tgt,o.alt);if(w){toast(w);return true}UI.sel=null;sfx('place');tutAdvance(2);return act({t:'place',pid,type:o.type,tgt:o.tgt,alt:o.alt||0})}
  if(d.rm){UI.sel=null;return act({t:'rm',pid:d.rm})}
  if(d.pawn&&b.closest('.pawnrow')&&placedIds().has(d.pawn)&&planOpen()){UI.sel=d.pawn;UI.ps.pick=true;return act({t:'rm',pid:d.pawn})}
  if(d.pay){const a=G.plan.acts.find(x=>x.id===+d.pay);if(a)act({t:'pay',id:a.id,pay:a.pay==='wood'?'fur':'wood'});return true}
  if(d.skill){const [ci,k]=d.skill.split(':');return act({t:'skill',ci:+ci,k})}
  if(d.item)return act({t:'item',k:d.item});
  if(d.disc!=null)return act({t:'disc',i:+d.disc});
  switch(d.a){
  case 'go':netTryStart(!!d.force);return true;
  case 'netready':return act({t:'ready',v:1});case 'netunready':return act({t:'ready',v:0});
  case 'next':{const i=storyIdx();if(i>=0)act({t:'next',id:UI.beats[i].id});sfx('click');return true}
  case 'skip':return act({t:'skip'});
  case 'auto':return isClient();
  case 'quick':if(isClient()){e.preventDefault();toast('The host chooses whether to skip the automatic steps.');return true}setQuick(b.checked);render();netPush(true);return true;
  case 'suggest':act({t:'suggest'});setPStep(3);toast('💡 Your castaway’s pawns have jobs now. Check them below and change anything you like.',5000);render();return true;
  case 'rec':{const c=curPawn();const r=c&&recPlan().map[c.id];if(!r){toast('No job to recommend: choose one below.');UI.ps.pick=true;render();return true}if(r.why)UI.sugWhy[JSON.stringify([r.type,r.tgt])]=r.why;UI.sel=null;sfx('place');return act({t:'place',pid:c.id,type:r.type,tgt:r.tgt,alt:r.alt||0})}
  case 'clear':return act({t:'clear'});
  case 'pile':return act({t:'pile',n:1});case 'pilemax':return act({t:'pile',n:SCEN.marooned.pileRoom()});
  case 'moveask':return act({t:'moveask',v:b.checked?1:0});
  case 'retry':case 'new':if(isHost())netToLobby();else netLeave();return true}
  return false}
function netKey(e){if(e.key==='Enter'&&e.target&&e.target.id==='joincode'){e.preventDefault();netClick(null,{a:'netjoin'},e);return true}
  if(e.key==='Escape'&&NET.on&&(NET.inLobby||NET.gone)&&UI.modal!=='start'&&!NET.gone){UI.modal='start';render();return true}
  if(!netOn()||e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return false;if(UI.modal)return false;
  if(storyActive()){if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){if(e.target.closest&&e.target.closest('button'))return false;e.preventDefault();if(!humanQ()&&netTurner(NET.lens)){const i=storyIdx();netDo({t:'next',id:UI.beats[i].id})}}return true}
  if(e.key==='Enter'&&planOpen()&&pstep()>=4){if(e.target.closest&&e.target.closest('button'))return true;netTryStart(!!UI.confirm||uncoveredRed().length>0);return true}
  if((e.key==='h'||e.key==='H')&&planOpen()){netClick(null,{a:'suggest'},e);return true}
  return false}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='joincode')UI.joinCode=t.value;if(t&&t.id==='netname'&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(t.value)});
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='netdet')UI.netOpen=e.target.open},true);
// a tap on the dim area outside the lobby closes it (like the other popups)
document.addEventListener('click',e=>{if(e.target&&e.target.id==='modal'&&NET.on&&NET.inLobby&&UI.modal!=='start'){UI.modal='start';render()}});
// ---------- what the page shows while others decide ----------
function netWaitText(){if(!netOn()||!G.q||humanQ())return '';return `Waiting for ${netWho(G.q.who)} to decide: ${G.q.title}`}
function netWaitHtml(){const t=netWaitText();return t?`<p class="netwait">⏳ ${esc(t)}</p>`:''}
function netSig(){return netOn()?netLead()+':'+(G.q?G.q.who:'')+':'+NET.lens+':'+netTurner(NET.lens):''}
// the story's Continue: the first player (or the host) turns the pages for everyone; the others see who they wait for
function netStoryCtl(i,nextL,jn){if(!netOn())return '';const last=i>=UI.beats.length-1;const prog=jn?`<span class="prog">Job ${jn.k} of ${jn.n}</span>`:'';
  if(G.q&&last&&!humanQ())return `<div class="sctl"><p class="netwait">⏳ Waiting for <b>${esc(netWho(G.q.who))}</b> to decide: ${esc(G.q.title)}</p></div>`;
  const lead=netLead();
  if(netTurner(NET.lens))return `<div class="sctl"><button class="btn go" data-a="next" autofocus>${nextL}</button>${isHost()?`<button class="btn ghost ${UI.auto?'on':''}" data-a="auto" title="Play the scenes by themselves, one after another (for everyone)">▶▶ Play by itself: ${UI.auto?'on':'off'}</button>`:''}${i<UI.beats.length-2?`<button class="btn ghost" data-a="skip" title="Jump to the next decision (everything is still in the Log)">Skip to the next choice</button>`:''}${prog}<p class="small muted netturn">${lead===NET.lens?'★ You are the first player: you turn the pages for everyone.':'You are the host: you can turn the pages too.'}</p></div>`;
  return `<div class="sctl"><p class="netwait">⏳ Waiting for <b>${esc(netWho(lead))}</b> to continue${lead===G.net.host&&!hum(P(G.first))?' (the host turns the pages today)':' (the first player ★ turns the pages)'}.</p>${prog}</div>`}
// planning: every castaway's jobs, live, and who is still planning
function netPlanBar(){if(!netOn())return '';const lead=netLead();const placed=placedIds();
  const rows=G.chars.filter(c=>!c.npc&&!c.dead).map(c=>{const left=allPawns().filter(p=>p.c===c.i&&!placed.has(p.id)).length;const rd=hum(c)&&G.net.ready[c.i]===G.round;
    const jobs=G.plan.acts.filter(a=>a.pw.some(id=>{const q=pawnInfo(id);return q&&q.c===c.i})).map(a=>actLabel(a).replace(/^Threat: /,'⚠ '));
    const st=!hum(c)?(left?'🤖 planning…':'🤖 done'):rd?'✓ ready':left?`planning · ${left} to place`:'planning';
    return `<li class="${c.i===NET.lens?'me':''} ${rd||(!hum(c)&&!left)?'ok':''}" style="--pc:${PCOL[c.i%6]}"><b>${esc(c.nm.split(' ')[0])}${c.i===G.first?' ★':''}</b><span>${c.i===NET.lens?'you':hum(c)?esc((c.pn||'friend').split(' ')[0]):'computer'}</span><em>${st}</em>${jobs.length?`<small>${esc(jobs.join(' · '))}</small>`:''}</li>`}).join('');
  const help=[...new Set(allPawns().filter(p=>p.c==null).map(pawnLabel))];const hp=help.length?help.join(' and '):'';
  const who=lead===NET.lens?'★ You start the day once everyone is ready'+(hp?`, and you plan ${esc(hp)}`:'')+'.':`★ ${esc(netWho(lead))} starts the day once everyone is ready${hp?` and plans ${esc(hp)}`:''}.`;
  const wait=netNotReady(-1).filter(i=>i!==lead);
  return `<div class="netbar" aria-label="The team's plan"><ul>${rows}</ul><p class="small">${who}${wait.length?` Still planning: ${wait.map(i=>esc(netWho(i))).join(', ')}.`:''}</p></div>`}
function netStepText(red){const lead=netLead();if(netStarter(NET.lens)){const w=netNotReady(NET.lens);return w.length?`Step 4 of 4: waiting for ${w.map(netWho).join(', ')} to finish planning.`:red.length?'Step 4 of 4: everyone is ready, but something urgent is not covered.':'Step 4 of 4: everyone is ready. Start the day!'}
  return G.net.ready[NET.lens]===G.round?`Step 4 of 4: you are ready. ${netWho(lead).replace(/^./,x=>x.toUpperCase())} starts the day when everyone is.`:'Step 4 of 4: press I’m ready when your plan is done.'}
function netStepBtn(pb,red){if(netStarter(NET.lens)){const w=netNotReady(NET.lens);if(w.length)return `<button class="btn go dim" data-a="go" title="Still planning: ${esc(w.map(netWho).join(', '))}">⏳ Waiting (${w.length})</button>`;
    return `<button class="btn go ${pb.length?'dim':''}" data-a="go" ${red.length?'data-force="1"':''} title="Start the day for everyone (Enter)">${red.length?'Start anyway ▶':'Start day ▶'}</button>`}
  return G.net.ready[NET.lens]===G.round?`<button class="btn go dim" data-a="netunready" title="Change your plan">✓ Ready · undo</button>`:`<button class="btn go ${netLeft(NET.lens)||netMyProb(NET.lens)?'dim':''}" data-a="netready" title="Tell the others your plan is done">✔ I’m ready</button>`}
function netOverBtns(){return isHost()?`<button class="btn go" data-a="new">New game (back to the lobby)</button><button class="btn" data-a="overok">Look at the island</button><button class="btn" data-a="netleave">Close the room</button>`
  :`<button class="btn" data-a="overok">Look at the island</button><button class="btn" data-a="netleave">Leave the room</button><p class="small muted">The host can start a new game from the lobby.</p>`}
