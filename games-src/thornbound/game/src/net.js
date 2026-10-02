// ---------- online play: free peer-to-peer rooms (net/netroom.js over WebRTC) ----------
// The HOST's page runs the game: it holds the real G (hands, decks, face-down cards, bids, the seeded RNG), runs the engine and the computer seats.
// Every other player's page only draws what ITS seat may see: after each change the host sends every peer its own copy of the state made by
// netStrip(G, seat) (src/netstrip.js, a whitelist: no rival hand, deck, face-down card or unrevealed bid, no Kingdom deck order, no seed or rng),
// compressed and cut into 3200-character chunks, throttled to 300 ms plus a 3 s heartbeat. A client sends back only {k: move key}; the host checks
// that the sender owns a human seat, that the seat is asked something and that TB.moves(G, seat) offers that key, and applies it through the same
// doMove() a local click uses. Anything else is ignored.
// Simultaneous decisions (bids, face-down cards) are the engine's own: G.q.seats lists the seats that have NOT answered yet, so everybody can see
// who is still deciding, and the answers stay in the host's G until the engine reveals them.
// Seats go to the players in join order (host = seat 0, then the next factions), empty seats go to the computer. A player who leaves is replaced
// by the computer (a pending question included) and gets the seat back when the same browser (NetRoom.uid) rejoins. Latecomers watch.
// If the HOST leaves the game is over ("The host left"): the others never hold the hidden state, so nobody can take over (no host migration).
// The host's own page also draws only its own hand (viewSeat() = my seat, no pass-the-device screen).
const NET={on:false,role:null,code:'',room:null,lobby:null,uid:null,peer:null,mySeat:-1,seq:0,last:0,timer:null,parts:{},hostPeer:null,peers:[],
  err:'',busy:false,ready:false,lastRx:0,gid:null,myName:'',copied:false,opt:null,hostGone:false,acc:0,rej:0,why:[],sent:0,rx:0,applied:0,
  seatPeer:[],seatUid:[],seatName:[],away:[],evLog:[],evId:0,evSeen:0,rk:null,recC:{},lastSent:{},lastLobby:'',lastTxt:'',pend:null,pendT:0,conn:null,lastSt:'',wasMine:false,
  retries:0,bad:0,sounds:0};
const isClient=()=>NET.on&&NET.role==='client';
const isHost=()=>NET.on&&NET.role==='host';
const netAvail=()=>!!NET.lobby;
const cleanName=s=>String(s==null?'':s).replace(/[<>&"'`]/g,'').trim().slice(0,24);
function netInit(){try{if(typeof NetRoom!=='undefined'&&NetRoom.available()){NET.lobby=NetRoom.lobby('thornbound');NET.uid=NetRoom.uid();NET.myName=NetRoom.name();
  const lc=NetRoom.linkCode();if(lc){UI.joinCode=lc;UI.onl=true}}}catch(e){console.error(e)}NET.ready=true}
// ---- joining and leaving a room ----
async function netJoin(role,code){if(NET.busy||!NET.lobby)return;NET.err='';code=NetRoom.cleanCode(code);
  if(!code){NET.err='Type the invite code first.';netRender();return}
  NET.busy=true;netRender();let room;
  try{if(NET.room){try{await NET.room.leave()}catch(e){}NET.room=null}room=await NET.lobby.join('tb-'+code)}catch(e){NET.busy=false;NET.err='Could not open the game room.';netRender();return}
  Object.assign(NET,{busy:false,code,role,on:true,room,mySeat:-1,hostPeer:null,parts:{},applied:0,lastRx:0,gid:null,hostGone:false,peer:room.self,peers:[],opt:null,
    seatPeer:[],seatUid:[],seatName:[],away:[],evLog:[],evId:0,evSeen:0,rk:null,recC:{},lastSent:{},lastLobby:'',lastTxt:'',pend:null,wasMine:false});
  if(G||UI.started)netIdle();
  room.presence({role,uid:NET.uid,name:NET.myName||''}).catch(()=>{});
  room.on('st',onNetState);room.on('act',onNetAct);room.on('rej',onNetRej);
  room.onPeers(onNetPeers);room.onConnection(c=>{NET.conn=c;netRender()});
  if(role==='client')hideStart();
  if(GX.open)GX.close();UI.netOpen=true;netRender();if(role==='host'){netPush(true);if(!$('#start').hidden)renderStart()}}
async function netLeave(){const r=NET.room;const was=NET.on;Object.assign(NET,{on:false,role:null,room:null,mySeat:-1,hostPeer:null,err:'',hostGone:false,peers:[],gid:null,opt:null,seatPeer:[],seatUid:[],seatName:[],away:[],lastSent:{},lastTxt:''});
  try{if(r)await r.leave()}catch(e){}if(!was)return;UI.netOpen=false;netIdle();showStart();netRender()}
// back to an empty page (no game): used when a client leaves or the host starts over
function netIdle(){clearTimeout(_pumpT);_pumpT=0;G=null;UI.started=false;UI.card=null;UI._cardKey=null;UI.evq=[];UI.pop=null;UI.popArg=null;UI.pumping=false;UI.mapReset=true;
  try{if(MAP.m){MAP.m.destroy();MAP.m=null}const w=$('#mapwrap');if(w)w.innerHTML=''}catch(e){}
  for(const id of ['#main','#road','#rivals','#handw','#ppop','#pc']){const e=$(id);if(e){e.innerHTML='';if(id==='#handw'||id==='#ppop'||id==='#pc')e.hidden=true}}
  const b=$('#barstat');if(b)b.innerHTML='';netDock()}
function onNetPeers(ch){NET.peers=ch.peers||[];
  if(isClient()){const h=NET.peers.find(p=>!p.isMe&&p.presence&&p.presence.role==='host');if(h)NET.hostPeer=h.peer;
    if(NET.hostPeer&&(ch.left||[]).some(p=>p.peer===NET.hostPeer)){NET.hostGone=true;NET.err=G?'The host left. The game is over.':'The host closed the room.';UI.netOpen=true}}
  if(isHost()){let chg=false;
    (ch.left||[]).forEach(l=>{const i=NET.seatPeer.indexOf(l.peer);if(G&&i>=0&&!G.pl[i].ai){netAway(i);chg=true}});
    (ch.joined||[]).forEach(j=>{if(j.isMe||!G||!j.by)return;const i=NET.seatUid.findIndex((u,k)=>u&&u===j.by&&G.pl[k]&&k<G.np);if(i>=0){netBack(i,j.peer);chg=true}});
    NET.peers.forEach(p=>{if(!NET.lastSent[p.peer]&&!p.isMe)NET.lastSent[p.peer]=''});
    for(const k of Object.keys(NET.lastSent))if(!NET.peers.some(p=>p.peer===k))delete NET.lastSent[k];
    netPush(true);if(chg&&G){UI.mapReset=false;pump()}}
  netRender();netRestart()}
// the start screen's seat rows follow the lobby (but never steal the focus from a text field)
function netRestart(){const st=$('#start');if(!st||st.hidden||!isHost())return;const a=document.activeElement;if(a&&st.contains(a)&&a.tagName==='INPUT')return;const top=st.scrollTop;renderStart();st.scrollTop=top}
// a human seat goes to the computer (its pending question too); the same browser gets it back
function netAway(i){const P=G.pl[i];if(!P||P.ai)return;P.ai=sv.levels[i]||'normal';NET.away[i]=true;netLog(i,P.name+' left the game: the computer plays for them now.')}
function netBack(i,peer){NET.seatPeer[i]=peer;if(G.pl[i].ai&&NET.away[i]){G.pl[i].ai=null;NET.away[i]=false;netLog(i,G.pl[i].name+' is back and takes their seat again.')}}
function netLog(seat,t){G.logN++;G.log.push({i:G.logN,r:G.round,t,s:seat,c:'warn'})}
// ---- the lobby: players in join order (the host first); seat i goes to player i ----
function netPlan(){const hum=[];
  for(const p of NET.peers){if(hum.length>=4)break;hum.push({peer:p.peer,uid:p.isMe?NET.uid:(p.by||null),nm:cleanName(p.isMe?NET.myName:(p.presence&&p.presence.name))||'Player'})}
  if(!hum.some(h=>h.peer===NET.peer))hum.unshift({peer:NET.peer,uid:NET.uid,nm:cleanName(NET.myName)||'Host'});
  hum.sort((a,b)=>(b.peer===NET.peer)-(a.peer===NET.peer));
  const np=Math.max(2,Math.min(4,Math.max(sv.np,hum.length)));const rest=FIDS.filter(f=>f!==sv.faction);const facs=[];for(let i=0;i<np;i++)facs.push(i===0?sv.faction:(rest.shift()||FIDS[i%4]));
  const lv=[];for(let i=0;i<np;i++)lv.push(sv.levels[i]||'normal');
  return {np,hum:hum.slice(0,4),facs,lv}}
// a list the lobby can draw: [{nm, by, host, me, seat, fac, ai, away}]
function lobbyPlayers(){
  if(isClient()){const o=NET.opt;if(!o||!Array.isArray(o.pl))return [];return o.pl.slice(0,12).map(p=>({nm:cleanName(p&&p.nm),by:p&&typeof p.by==='string'?p.by:'',host:!!(p&&p.host),me:!!(p&&p.by&&p.by===NET.uid),seat:p&&Number.isInteger(p.seat)?p.seat:-1,fac:p&&FIDS.includes(p.fac)?p.fac:'',ai:p&&typeof p.ai==='string'?p.ai.slice(0,8):'',away:!!(p&&p.away)}))}
  if(G&&UI.started){const out=[];for(let i=0;i<G.np;i++){const P=G.pl[i];if(!P.ai||NET.away[i])out.push({nm:NET.seatName[i]||'Player',by:NET.seatUid[i]||'',host:i===NET.mySeat,me:i===NET.mySeat,seat:i,fac:P.fac,ai:P.ai||'',away:!!NET.away[i]})}
    NET.peers.forEach(p=>{const by=p.isMe?NET.uid:(p.by||'');if(!NET.seatUid.includes(by)||!by)out.push({nm:cleanName(p.presence&&p.presence.name)||'Player',by,host:false,me:false,seat:-1,fac:'',ai:'',away:false})});return out}
  const pl=netPlan();return pl.hum.map((h,i)=>({nm:h.nm,by:h.uid||'',host:h.peer===NET.peer,me:h.peer===NET.peer,seat:i,fac:pl.facs[i],ai:'',away:false}))}
function lobbyOpt(){const pl=netPlan();return {np:G&&UI.started?G.np:pl.np,len:G&&UI.started?G.len:sv.length,run:!!(G&&UI.started&&!G.over),lv:pl.lv[Math.min(pl.hum.length,pl.np-1)]||'normal',pl:lobbyPlayers().map(x=>({nm:x.nm,by:x.by,host:x.host,seat:x.seat,fac:x.fac,ai:x.ai,away:x.away}))}}
// ---- start (host): bind the humans to seats and make the game ----
function netStart(){if(!isHost())return;const plan=netPlan();
  NET.seatPeer=plan.hum.map(h=>h.peer);NET.seatUid=plan.hum.map(h=>h.uid);NET.seatName=plan.hum.map(h=>h.nm);NET.away=[];NET.mySeat=0;NET.gid=NetRoom.newCode()+Date.now().toString(36);NET.evLog=[];NET.evId=0;NET.lastSent={};NET.recC={};NET.lastLobby='';
  const lv=plan.lv;const pl=plan.facs.map((f,i)=>{const h=plan.hum[i];return {faction:f,name:h?h.nm+' ('+DD.FSHORT[f]+')':DD.FSHORT[f],ai:h?null:(lv[i]||'normal')}});
  hookEngine();G=null;const g=TB.newGame({players:pl,length:sv.length});G=g;
  UI.cfg={mode:'me',np:plan.np,length:sv.length,faction:sv.faction,levels:lv,guide:sv.guide,online:true,seats:plan.facs.map(f=>({faction:f,human:false,level:'normal'}))};UI.mode='me';UI.guide=sv.guide||'full';
  resetUI();UI.started=true;UI.holder=0;UI.rs0=snapInf();UI.rsLog=0;UI.netOpen=false;hideStart();afterStart();netRender();netPush(true)}
// ---- state packets: JSON, deflate-compressed, cut into chunks ----
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function packStr(s){if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'z'+b64(new Uint8Array(await new Response(cs.readable).arrayBuffer()))}catch(e){}}return 'j'+b64(new TextEncoder().encode(s))}
async function unpackStr(s){const u=unb64(s.slice(1));if(s[0]==='z'){const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u).catch(()=>{});w.close().catch(()=>{});return await new Response(ds.readable).text()}return new TextDecoder().decode(u)}
function sendPacked(room,target,js,seq){packStr(js).then(z=>{const CH=3200,n=Math.ceil(z.length/CH);for(let i=0;i<n;i++){const d={s:seq,i,n,d:z.slice(i*CH,(i+1)*CH)};(target?room.sendTo(target,'st',d):room.emit('st',d)).catch(()=>{})}})}
// the computer's suggestion for a human seat (the page of that seat shows it as "Recommended"); a client cannot run the computer on its own copy
function netRec(seat){if(!G||!G.q||!G.q.seats.includes(seat)||G.pl[seat].ai)return null;const mv=TB.moves(G,seat);if(mv.length<2)return null;
  const key=G.logN+':'+G.q.kind+':'+(G.q.chosen?G.q.chosen.length:'')+':'+mv.length;const c=NET.recC[seat];if(c&&c.key===key)return c.k;
  let k=null;try{const r=aiChoose(seat,ANIM?'hard':'normal');if(r&&r.k!=null)k=String(r.k)}catch(e){}NET.recC[seat]={key,k};return k}
function netPush(force){if(!isHost()||!NET.room)return;const now=Date.now();
  if(!force&&now-NET.last<300){if(!NET.timer)NET.timer=setTimeout(()=>{NET.timer=null;netPush(false)},310);return}
  NET.last=now;const room=NET.room;let opt;try{opt=lobbyOpt()}catch(e){console.error(e);return}
  if(!G||!UI.started){const js=JSON.stringify({code:NET.code,lobby:true,opt});if(force||js!==NET.lastLobby){NET.lastLobby=js;sendPacked(room,null,js,++NET.seq)}return}
  const ev=NET.evLog.filter(b=>now-b.ts<60000).map(b=>({id:b.id,e:b.e}));
  // every peer gets ITS OWN stripped copy: nobody receives another seat's hand, face-down cards, bid, deck order or the seed
  for(const p of NET.peers){if(p.isMe)continue;const seat=NET.seatPeer.indexOf(p.peer);
    let js;try{js=JSON.stringify({code:NET.code,gid:NET.gid,seat,opt,evid:NET.evId,ev,rk:seat>=0?netRec(seat):null,g:netStrip(G,seat)})}catch(e){console.error(e);continue}
    if(!force&&NET.lastSent[p.peer]===js)continue;NET.lastSent[p.peer]=js;sendPacked(room,p.peer,js,++NET.seq)}}
setInterval(()=>{if(isHost())netPush(true)},3000);
// the end of every renderAll(): the host pushes the new state
function netAfter(){if(!NET.on)return;netDock();if(isHost())netPush();
  try{const mine=!!(G&&!G.over&&G.q&&vs()>=0&&G.q.seats.includes(vs())&&!G.pl[vs()].ai);if(mine&&!NET.wasMine&&isClient()&&typeof sfx==='function')sfx('bell');NET.wasMine=mine}catch(e){}}
function onNetState(msg){NET.rx++;if(!NET.on||msg.isMe||!isClient())return;const d=msg.data;
  if(!d||typeof d.d!=='string'||!(d.n>0&&d.n<120)||!(d.i>=0&&d.i<d.n)||!Number.isInteger(d.s))return;
  if(!NET.hostPeer||msg.peer!==NET.hostPeer)return;
  const k=msg.peer+':'+d.s;const P2=NET.parts[k]=NET.parts[k]||{n:d.n,got:0,c:[]};if(P2.c[d.i]===undefined){P2.c[d.i]=d.d;P2.got++}
  if(P2.got<P2.n)return;delete NET.parts[k];Object.keys(NET.parts).forEach(x=>{const i=x.lastIndexOf(':');if(x.slice(0,i)===msg.peer&&+x.slice(i+1)<d.s)delete NET.parts[x]});
  unpackStr(P2.c.join('')).then(txt=>{const o=JSON.parse(txt);if(!o||o.code!==NET.code||!NET.on)return;if(d.s<=NET.applied)return;NET.applied=d.s;NET.lastRx=Date.now();
    if(txt===NET.lastTxt)return;NET.lastTxt=txt;
    if(window.NET_TRACE){(NET.trace=NET.trace||[]).push(txt)}applyNet(o)}).catch(e=>{NET.bad++;NET.badE=String(e)})}
function validState(g){return g&&typeof g==='object'&&Array.isArray(g.pl)&&g.pl.length>=2&&g.pl.length<=4&&g.pl.length===g.np&&Array.isArray(g.reg)&&g.reg.length===3&&Array.isArray(g.log)&&Array.isArray(g.order)&&Array.isArray(g.road)&&Array.isArray(g.loc)&&g.loc.length===6&&g.fav&&typeof g.fav==='object'&&Number.isInteger(g.round)&&Number.isInteger(g.rounds)&&g.pl.every(p=>p&&Array.isArray(p.hand)&&Array.isArray(p.deck)&&Array.isArray(p.disc)&&Array.isArray(p.ks)&&FIDS.includes(p.fac)&&p.supp&&Array.isArray(p.supp.r))}
function applyNet(o){
  if(o.lobby||!o.g){NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;if(G||UI.started){netIdle();hideStart()}NET.gid=null;if(!NET.hostGone)UI.netOpen=true;netRender();return}
  if(!validState(o.g))return;const g=o.g;const fresh=o.gid!==NET.gid;NET.opt=o.opt&&typeof o.opt==='object'?o.opt:NET.opt;
  const prev=G&&!fresh?{inf:G.pl.reduce((a,p)=>a+p.inf,0),over:!!G.over}:null;
  G=g;NET.mySeat=Number.isInteger(o.seat)&&o.seat>=0&&o.seat<g.np?o.seat:-1;NET.rk=typeof o.rk==='string'?o.rk.slice(0,80):null;if(NET.pend&&NET.pendSig!==netSig())NET.pend=null;
  if(fresh){NET.gid=typeof o.gid==='string'?o.gid.slice(0,40):'x';NET.evSeen=Number.isInteger(o.evid)?o.evid:0;resetUI();UI.cfg={mode:'me',np:g.np,length:g.len,online:true};UI.mode='me';UI.started=true;UI.holder=Math.max(0,NET.mySeat);UI.rs0=snapInf();UI.rsLog=g.logN;
    hideStart();GX.close();UI.netOpen=false;UI.mapReset=true;closePop(true);NET.wasMine=false}
  else if(Array.isArray(o.ev)){const bs=o.ev.filter(b=>b&&Number.isInteger(b.id)&&b.id>NET.evSeen&&b.e).sort((a,b)=>a.id-b.id).slice(0,12);
    for(const b of bs){const c=cleanEv(b.e);if(c){UI.evq.push(c);if(c.t==='bids')sfx('bid')}NET.evSeen=b.id}}
  if(prev){const inf=G.pl.reduce((a,p)=>a+p.inf,0);if(inf>prev.inf)setTimeout(()=>sfx('inf'),150);if(G.over&&!prev.over)setTimeout(()=>sfx(NET.mySeat===G.over.winner?'fanfare':'lose'),300)}
  netRender();renderAll();pump()}
// ---- events: the host remembers its bids / clash / round summaries for the clients (they only get state snapshots otherwise) ----
// only these fields, only plain values; the clients copy them again with the same function
function cleanEv(e){if(!e||typeof e!=='object')return null;const I=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b?v:null,Sx=v=>String(v==null?'':v).slice(0,300);
  const seat=v=>I(v,0,3),card=v=>I(v,0,499),arr=(a,f,n)=>Array.isArray(a)?a.slice(0,n).map(f):null;
  const ints=a=>arr(a,v=>I(v,-99,999)==null?0:v,4),seats=a=>arr(a,v=>seat(v)==null?0:v,4);
  const bySeat=(o,f)=>{const r={};if(o&&typeof o==='object')for(const s of [0,1,2,3])if(Array.isArray(o[s]))r[s]=o[s].slice(0,40).map(f);return r};
  const num=(o)=>{const r={};if(o&&typeof o==='object')for(const s of [0,1,2,3])if(Number.isInteger(o[s]))r[s]=Math.max(-999,Math.min(999,o[s]));return r};
  switch(e.t){
   case 'bids':{if(!Array.isArray(e.bids))return null;const bids=e.bids.slice(0,4).map(b=>b&&seat(b.seat)!=null&&card(b.id)!=null?{seat:b.seat,id:b.id,str:I(b.str,-99,99)==null?0:b.str}:null);if(bids.some(x=>!x))return null;return {t:'bids',round:I(e.round,0,99)||0,bids,order:seats(e.order)||[]}}
   case 'clash':{const parts=seats(e.parts);if(!parts||!parts.length)return null;const w=e.winner==null?-1:I(e.winner,-1,3);if(w==null)return null;
     return {t:'clash',r:I(e.r,0,2)==null?0:e.r,idx:I(e.idx,-1,2)==null?-1:e.idx,n:I(e.n,1,99)||1,parts,cards:bySeat(e.cards,v=>card(v)==null?0:v),cardsF:bySeat(e.cardsF,v=>card(v)==null?0:v),supp:num(e.supp),tot:num(e.tot),winner:w,tied:Array.isArray(e.tied)?seats(e.tied):null,
       logs:Array.isArray(e.logs)?e.logs.slice(0,40).map(Sx):[],inf0:ints(e.inf0)||[],inf1:ints(e.inf1)||[]}}
   case 'summary':return {t:'summary',round:I(e.round,0,99)||0,rounds:I(e.rounds,0,99)||0,inf0:ints(e.inf0)||[],inf1:ints(e.inf1)||[],order:seats(e.order)||[],warns:Array.isArray(e.warns)?e.warns.slice(0,12).map(Sx):[],big:[],last:!!e.last}}
  return null}
function netEvent(e){if(!isHost())return;try{const c=cleanEv(JSON.parse(JSON.stringify(e)));if(c){NET.evLog.push({id:++NET.evId,ts:Date.now(),e:c});if(NET.evLog.length>10)NET.evLog.shift()}}catch(x){}}
// ---- client -> host ----
function netSend(k){if(!NET.room||!NET.hostPeer)return false;NET.sent++;NET.room.sendTo(NET.hostPeer,'act',{k}).catch(()=>{});return true}
function onNetRej(msg){if(!isClient()||msg.peer!==NET.hostPeer)return;const e=msg.data&&typeof msg.data.e==='string'?msg.data.e.slice(0,160):'';NET.pend=null;if(e&&G){toast(e);NET.lastRej=e}}
function netRej(peer,why){NET.rej++;NET.why.push(String(why).slice(0,60));if(NET.why.length>60)NET.why.shift();try{if(peer)NET.room.sendTo(peer,'rej',{e:'That move was not accepted.'}).catch(()=>{})}catch(x){}}
// the host's check of a client's move: the sender owns a human seat, the seat is asked, and TB.moves offers exactly that key
function onNetAct(msg){if(!isHost()||!G||msg.isMe)return;const d=msg.data;
  if(!d||typeof d!=='object'||Array.isArray(d)){netRej(null,'shape');return}
  let seat=NET.seatPeer.indexOf(msg.peer);
  if(seat<0&&msg.by){const i=NET.seatUid.findIndex((u,k)=>u&&u===msg.by&&G.pl[k]);if(i>=0){netBack(i,msg.peer);seat=i}}
  if(seat<0||seat>=G.np||G.pl[seat].ai||G.over){netRej(null,'not a human seat');return}
  const k=Object.prototype.hasOwnProperty.call(d,'k')?d.k:undefined;if(typeof k!=='string'||k.length>80){netRej(msg.peer,'key');return}
  if(!G.q||!G.q.seats.includes(seat)){netRej(msg.peer,'not asked');return}
  let mv=null;try{mv=TB.moves(G,seat).find(m=>m.k===k)}catch(e){}
  if(!mv){netRej(msg.peer,'illegal '+k+' '+G.q.kind+' '+G.logN+' seats '+G.q.seats.join('')+' t '+(Date.now()%100000));return}
  let ok=false;try{ok=doMove(mv)}catch(e){console.error(e)}
  if(ok){NET.acc++;pump()}else netRej(msg.peer,'refused')}
// ---- the pump for online games: cards are per page, the game itself never waits for a Continue button ----
function netPump(){if(UI.pumping)return;UI.pumping=true;
  try{
    for(let g=0;g<50&&!UI.card&&UI.evq.length;g++){const ev=UI.evq.shift();if(shouldShowEvent(ev)){showEvent(ev);break}}
    if(!UI.card&&G.over)showOver();
    if(isHost()&&!G.over&&G.q){const w=whoActs();
      if(w.ai.length){
        if(AIDELAY>0&&ANIM){_pumpT=setTimeout(()=>{_pumpT=0;if(!isHost()||!G||!G.q)return;const w2=whoActs();if(w2.ai.length)aiStep(w2);pump()},AIDELAY*.6/UI.speed)}
        else{for(let n=0;n<4000&&G.q&&!G.over;n++){const w2=whoActs();if(!w2.ai.length)break;aiStep(w2)}
          if(UI.evq.length&&!UI.card){const ev=UI.evq.shift();if(shouldShowEvent(ev))showEvent(ev)}if(G.over&&!UI.card)showOver()}}}
    if(!UI.card&&G&&G.q&&!G.over&&vs()>=0&&G.q.seats.includes(vs())&&!G.pl[vs()].ai&&typeof maybeTip==='function')maybeTip();
    renderAll()}
  finally{UI.pumping=false}}
// the host's click for its own seat / a client's click: same entry
function netSig(){return G.logN+':'+(G.q?G.q.kind+':'+(G.q.chosen?G.q.chosen.length:'')+':'+G.q.seats.join():'')}
function netHumanMove(k){const s=NET.mySeat;if(!G||!G.q||s<0||!G.q.seats.includes(s)||G.pl[s].ai)return false;
  const mv=legal(s).find(m=>m.k===k);if(!mv)return false;
  if(isClient()){const key=G.logN+':'+G.q.kind+':'+(G.q.chosen?G.q.chosen.length:'')+':'+k;if(NET.pend===key&&Date.now()-NET.pendT<2500)return false;NET.pend=key;NET.pendSig=netSig();NET.pendT=Date.now();(NET.sends=NET.sends||[]).push([Date.now()%100000,k,netSig(),NET.applied,NET.lastRx&&Date.now()-NET.lastRx,legal(s).length]);if(NET.sends.length>400)NET.sends.shift();UI.sel={};UI.hand=null;closePop(true);netSend(k);return true}
  const ok=doMove(mv);if(ok){UI.sel={};UI.hand=null;closePop(true);pump()}return ok}
// ---- text helpers for the waiting line ----
function seatWho(s){const P=G.pl[s];const nm=P.ai?'':(NET.on&&P.name?P.name.replace(/\s*\(.*\)$/,''):'');return shortName(s).replace(' (you)','')+(nm?' ('+nm+')':'')}
function decidingLine(){if(!G||!G.q)return '';const names=G.q.seats.map(seatWho);return names.length?names.join(', ')+(names.length>1?' are still deciding':' is deciding'):''}
// ---- status, dock strip, lobby, start-screen panel ----
function netStatus(){const n=NET.peers.length;
  if(NET.hostGone||NET.err)return '<span class="warn">'+esc(NET.err||'The host left.')+'</span>';
  if(NET.conn===false)return 'Connecting...';
  if(isClient()&&!NET.hostPeer)return 'Looking for the host...';
  if(isClient()&&G&&NET.lastRx&&Date.now()-NET.lastRx>12000)return 'Reconnecting...';
  if(n<=1)return 'Looking for players...';return n+' players connected'}
function netDock(){const el=$('#netst');if(!el)return;if(!NET.on||!G||!UI.started){el.hidden=true;el.innerHTML='';el._h='';return}el.hidden=false;
  const me=NET.mySeat>=0&&G.pl[NET.mySeat]?shortName(NET.mySeat).replace(' (you)',''):'';
  const h='<span class="nsl">Room <b>'+esc(NET.code)+'</b>'+(me?' · you are <b>'+esc(me)+'</b>':' · watching')+(isHost()?' · you host':'')+' · <span class="nst">'+netStatus()+'</span></span><button class="btn small" data-a="netopen">Lobby</button><button class="btn small" data-a="netleave">Leave</button>';
  if(el._h!==h){el._h=h;el.innerHTML=h}}
function lobbyHTML(){const host=isHost();const ps=lobbyPlayers();const o=host?lobbyOpt():(NET.opt||null);
  const dot=f=>f?'<i style="background:'+TBKit.FACTIONS[FK[f]].main+'"></i>':'<i class="nodot"></i>';
  const rows=ps.map(p=>'<li>'+dot(p.fac)+'<b>'+esc(p.nm||'Player')+'</b>'+(p.me?' (you)':'')+(p.host?' · host':'')+(p.fac?' · '+esc(TBKit.FACTIONS[FK[p.fac]].short):'')+(p.away?' · away (computer plays)':'')+(p.seat<0&&G?' · watching':'')+'</li>').join('')||'<li class="muted">Connecting...</li>';
  let opts='';if(o&&o.np){const nh=ps.filter(p=>p.seat>=0&&!p.ai).length||ps.length;const ai=Math.max(0,o.np-Math.min(nh,o.np));
    opts='<p class="small">'+o.np+' players · '+({short:4,standard:5,extended:6}[o.len]||o.len)+' rounds'+(ai>0?' · '+ai+' computer seat'+(ai>1?'s':'')+(o.run?'':' ('+esc(o.lv||'normal')+')'):'')+'.'+(host&&!o.run?' Change players, length, your side and the computer levels on the start screen (Change setup).':'')+'</p>'}
  return '<div class="nbox" role="dialog" aria-modal="true" aria-label="Online game"><button class="gx-x lbx" data-a="netclose" aria-label="Close">&times;</button><h2>Online game</h2>'+
   '<p>Invite code: <b class="code" id="netcode">'+esc(NET.code)+'</b></p>'+
   '<div class="invrow"><input class="invlink" readonly value="'+esc(NetRoom.inviteLink(NET.code))+'" aria-label="Invite link"><button class="btn small" data-a="netcopy">'+(NET.copied?'Copied':'Copy link')+'</button></div>'+
   '<p class="tiny">Friends open the link, or choose Play online and type the code. Nobody can see another player\'s hand, bid or face-down cards.</p>'+
   '<p class="small nst">'+netStatus()+'</p><h3>Players ('+ps.length+')</h3><ul class="plist">'+rows+'</ul>'+opts+
   (host?'<div class="acts"><button class="btn pri" data-a="netstart">'+(G&&!G.over?'Start a new game':'Start game')+'</button><button class="btn" data-a="netchange">Change setup</button><button class="btn" data-a="netleave">Close the room</button></div>'
   :'<p class="tiny">'+(NET.hostGone?'':G&&!G.over?'The host can start a new game from here.':'Waiting for the host to start the game...')+'</p><div class="acts"><button class="btn" data-a="netleave">'+(NET.hostGone?'Back to the start':'Leave')+'</button></div>')+'</div>'}
function onlineInner(){let h='';
  if(!NET.ready)h='<p class="small muted">Checking online play...</p>';
  else if(!netAvail())h='<p class="small muted">Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).</p>';
  else if(NET.on)h='<p class="small">Room <b>'+esc(NET.code)+'</b> · <span class="nst">'+netStatus()+'</span></p><div class="btnrow"><button class="btn small pri" data-a="netopen">Open the lobby</button><button class="btn small" data-a="netleave">'+(isHost()?'Close the room':'Leave the room')+'</button></div>';
  else h='<p class="small muted">Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link.</p>'+
    '<div class="nrow"><input id="netname" placeholder="Your name" maxlength="24" autocomplete="off" value="'+esc(NET.myName||'')+'"><button class="btn small pri" data-a="nethost">Host</button></div>'+
    '<div class="nrow"><input id="joincode" placeholder="Invite code" maxlength="10" autocomplete="off" autocapitalize="off" value="'+esc(UI.joinCode||'')+'"><button class="btn small" data-a="netjoin">Join</button></div>'+(NET.busy?'<p class="small muted">Opening the room...</p>':'')+(NET.err?'<p class="small warn">'+esc(NET.err)+'</p>':'');
  return h}
function onlineBlock(){return '<details class="online" id="onl"'+(UI.onl||NET.on?' open':'')+'><summary>Play online (free, peer to peer)</summary><div id="netblock">'+onlineInner()+'</div></details>'}
function netRender(){netDock();const box=$('#netbox');
  if(box){if(UI.netOpen&&NET.on){box.hidden=false;const keep=document.activeElement&&box.contains(document.activeElement)&&document.activeElement.tagName==='INPUT';if(!keep||!box.firstChild)box.innerHTML=lobbyHTML()}else{box.hidden=true;box.innerHTML=''}}
  const nb=$('#netblock');if(nb&&!(document.activeElement&&nb.contains(document.activeElement)&&document.activeElement.tagName==='INPUT'))nb.innerHTML=onlineInner()}
function netCopy(){const t=NetRoom.inviteLink(NET.code);const sel=()=>{const i=document.querySelector('.invlink');if(i){i.focus();i.select()}};
  const done=()=>{NET.copied=true;netRender();setTimeout(()=>{NET.copied=false;netRender()},2500)};
  try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}}
function netClose(){UI.netOpen=false;netRender()}
// returns true when the click was an online-play button (or one a client may not use)
function netClick(a,t){switch(a){
  case 'nethost':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('host',NetRoom.newCode());return true}
  case 'netjoin':{const i=document.getElementById('netname');if(i&&typeof NetRoom!=='undefined')NET.myName=NetRoom.setName(i.value);netJoin('client',(document.getElementById('joincode')||{}).value);return true}
  case 'netstart':case 'again':if(a==='again'&&!NET.on)return false;if(isHost())netStart();return true;
  case 'netchange':{UI.netOpen=false;netRender();showStart();return true}
  case 'netback':hideStart();return true;
  case 'netleave':netLeave();return true;case 'netcopy':netCopy();return true;case 'netclose':netClose();return true;
  case 'netopen':if(GX.open)GX.close();UI.netOpen=true;netRender();return true;
  case 'menu':if(NET.on){if(isHost()){UI.netOpen=true;netRender()}else netLeave();return true}return false;
  case 'newgame':case 'wpause':case 'wstep':case 'wspeed':case 'cont':case 'guided':case 'start':case 'savenow':if(isClient())return true;if(NET.on&&(a==='newgame')){GX.close();showStart();return true}if(NET.on&&a==='start'){netStart();return true}if(NET.on&&(a==='cont'||a==='guided'||a==='savenow'))return true;return false}return false}
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='joincode')UI.joinCode=t.value;if(t.id==='netname'&&typeof NetRoom!=='undefined'){NET.myName=NetRoom.setName(t.value)}});
document.addEventListener('keydown',e=>{const t=e.target;if(t&&t.id==='joincode'&&e.key==='Enter'){e.preventDefault();netClick('netjoin');return}
  if(t&&t.id==='netname'&&e.key==='Enter'){e.preventDefault();netClick('nethost');return}
  if(e.key==='Escape'&&UI.netOpen){e.preventDefault();netClose()}});
document.addEventListener('click',e=>{if(UI.netOpen&&e.target&&e.target.id==='netbox')netClose()});
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='onl')UI.onl=e.target.open},true);
// the lobby and the status line keep showing the live player count
setInterval(()=>{if(!NET.on)return;const st=netStatus()+'|'+NET.peers.length;if(st!==NET.lastSt){NET.lastSt=st;netRender()}},1000);
