// ===================== part 1: core (state, engine adapter, events, AI adapter, turn pump) =====================
// The engine (TB: newGame/moves/apply/pending/stripView) is never edited. Everything the UI needs on top of it lives here.
var ANIM=1,AIDELAY=650;
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DD=TB.DATA;
const FK={nobility:'gilded',clans:'heath',uprising:'lantern',gathering:'choir'};
const FIDS=['nobility','clans','uprising','gathering'];
const fk=seat=>FK[G.pl[seat].fac];
const kf=seat=>TBKit.FACTIONS[fk(seat)];
const fcol=seat=>kf(seat).main;
var G=null;
const UI={started:false,mode:'me',cfg:null,holder:0,busy:false,evq:[],card:null,pop:null,popArg:null,tip:{},seen:{},speed:1,guide:'full',
  hand:null,clashRes:{},toast:'',lastLog:0,sel:{},watchPaused:false,aiSeed:0,mapQ:Promise.resolve(),pumping:false,rs0:null,placed:[],undo:null,phone:false,land:false,sound:true,music:false};
var setSeed=n=>{UI.aiSeed=n},setAiSeed=n=>{UI.aiSeed=n};
// ---------------------------------------------------------------- tiny helpers
const wait=ms=>new Promise(r=>setTimeout(r,ANIM?ms:0));
const sgn=(n)=>n>0?'+'+n:''+n;
const REG=DD.RNAMES,LOCN=DD.LOCS.map(l=>l[1]);
const LOC_TYPE=['castle','forest','village','stones','abbey','mine'];
const LOCID=DD.LOCIDS;
const regOfLoc=l=>l>>1;
const humans=()=>G?G.pl.filter(p=>!p.ai).map(p=>p.seat):[];
const isHuman=s=>!!G&&!G.pl[s].ai;
const hotSeat=()=>!NET.on&&(UI.mode==='hot'||(UI.mode==='me'&&humans().length>1));
function viewSeat(){if(!G)return -1;if(NET.on)return NET.mySeat;const hs=humans();if(!hs.length)return -1;if(hs.length===1)return hs[0];return UI.holder}
const vs=viewSeat;
const nameOf=s=>G.pl[s].name;
const tname=s=>G.pl[s].ai?(G.pl[s].name):(NET.on?(s===vs()?'You':G.pl[s].name):hotSeat()||humans().length>1?G.pl[s].name:'You');
const ordinal=n=>['first','second','third','fourth'][n]||n+'th';
// ---------------------------------------------------------------- card specs for TBKit
const ART={ruse:{nobility:'herald',clans:'ravens',uprising:'mob',gathering:'moonmoth'},trader:{_:'merchant'},
  follower:{nobility:'guard',clans:'clan_warrior',uprising:'rioter',gathering:'choir'},
  agent:{nobility:'duelist',clans:'hunter',uprising:'thief',gathering:'moonmoth'},
  cavalry:{nobility:'knight',clans:'stag',uprising:'mob',gathering:'spirit'},
  war_machine:{nobility:'ruin_tower',clans:'standing_stones',uprising:'barricade',gathering:'vigil'},
  captain:{nobility:'noble',clans:'clan_chief',uprising:'bellringer',gathering:'moon_priest'},
  champion:{nobility:'knight',clans:'boar',uprising:'lantern_bearer',gathering:'eclipse'},
  heir:{nobility:'regent',clans:'bear',uprising:'beacon',gathering:'eclipse'}};
const ARCH_TYPE={ruse:'ploy',trader:'trade',agent:'ploy',follower:'unit',cavalry:'unit',war_machine:'unit',captain:'unit',champion:'unit',heir:'unit'};
const ARCH_LBL={ruse:'Ruse',trader:'Trader',agent:'Agent',follower:'Follower',cavalry:'Cavalry',war_machine:'War machine',captain:'Captain',champion:'Champion',heir:'Heir',scheme:'Scheme'};
const TRAIT_N={inv:'Invulnerable',res:'Resilient',path:'Pathfinder'};
const TRAIT_T={inv:'cannot be Eliminated',res:'if Eliminated it goes to your Discard Pile instead of the Lost Pile',path:'if it is used to Journey it goes to your Discard Pile, not the Lost Pile'};
const CMD_N={ambush:'Ambush',retreat:'Retreat',flank:'Flank',rally:'Rally',deploy:'Deploy',deadly:'Deadly',ambret:'Ambush or Retreat'};
const SUIT_N={relics:'Coin',secrets:'Whispers',oaths:'Pledges'};
const SUIT_ART={relics:['tribute','merchant','chalice','feast'],secrets:['tome','key','oath','vigil'],oaths:['blade','banner','crown','oath']};
const SUIT_TYPE={relics:'trade',secrets:'rite',oaths:'edict'};
function cinfo(id){return TB.cardInfo(G,id)}
function cardSpec(id,opt){opt=opt||{};
  if(id<0)return {faceDown:true,faction:FK[G.pl[-id-1].fac]};
  const i=cinfo(id),P=G.pl[i.owner],f=FK[P.fac];
  const ar=i.archetype||(i.kind==='hq'?'':'ruse');const art=(ART[ar]&&(ART[ar][P.fac]||ART[ar]._))||(i.kind==='hq'?'ruin_arch':'banner');
  const tr=(i.traits||[]).map(t=>TRAIT_N[t]||t);
  const txt=((tr.length?tr.join(', ')+'. ':'')+(i.text||'')).trim();
  const bits=[];if(i.votes)bits.push(i.votes+' vote'+(i.votes>1?'s':''));if(i.lore)bits.push(i.lore+' lore');
  const spec={faction:f,title:i.name,value:i.kind==='hq'?null:i.strength,cost:i.cost>0?i.cost:null,type:i.kind==='hq'?'relic':(ARCH_TYPE[ar]||'unit'),typeLabel:i.kind==='hq'?'HQ':(ARCH_LBL[ar]||'Card'),art,text:txt||'No special ability.',tag:bits.join(' · ')||undefined};
  return spec}
function kcSpec(n){const k=TB.kingdomInfo(n),arts=SUIT_ART[k.suit]||['banner'];
  return {faction:'neutral',title:k.name,value:null,cost:null,type:SUIT_TYPE[k.suit]||'omen',typeLabel:SUIT_N[k.suit]+' · Kingdom',art:arts[n%arts.length],text:k.text,num:'No. '+n}}
function cardEl(id,w){return TBKit.card(cardSpec(id),w)}
function kcEl(n,w){return TBKit.card(kcSpec(n),w)}
// plain-words detail of a faction card (HTML), used by the enlarged card pop-up
function cardDetail(id){const i=cinfo(id);const ar=ARCH_LBL[i.archetype]||'';const out=[];
  const stat=[];if(i.kind!=='hq')stat.push('<b>Strength '+i.strength+'</b>');if(ar)stat.push(ar);if(i.votes)stat.push(i.votes+' vote'+(i.votes>1?'s':'')+' (Govern)');if(i.lore)stat.push(i.lore+' lore (Journey)');if(i.cost)stat.push('costs '+i.cost+' lore');
  out.push('<p class="cd-stat">'+stat.join(' · ')+'</p>');
  for(const t of i.traits||[])out.push('<p class="cd-tr"><b>'+(TRAIT_N[t]||t)+'.</b> '+((TRAIT_T[t]||'').replace(/^./,c=>c.toUpperCase()))+'.</p>');
  if(i.text)out.push('<p class="cd-tx">'+esc(i.text)+'</p>');
  if(i.tokens)out.push('<p class="cd-tr">Carries '+i.tokens+' Influence token'+(i.tokens>1?'s':'')+': stays on the map '+i.tokens+' more Winter'+(i.tokens>1?'s':'')+'.</p>');
  return out.join('')}
// ---------------------------------------------------------------- engine event capture (wrappers around engine agenda handlers; silent if the engine changes)
const EV={cur:null};
function snapInf(){return G.pl.map(p=>p.inf)}
function logSince(n){return G.log.filter(e=>e.i>n)}
function pushEv(e){UI.evq.push(e);if(typeof netEvent==='function')netEvent(e)}
function hookEngine(){const I=TB.internal;if(!I||!I.AG||I.__hooked)return;I.__hooked=1;const AG=I.AG,PK=I.PICKH;
  const wrap=(h,before,after)=>{const o=AG[h];if(!o)return;AG[h]=function(d){const mine=(()=>{const g=TB.internal.G;if(!G)G=g;return g===G})();try{mine&&before&&before(d)}catch(e){console.warn('hook',h,e.message)}const r=o.call(this,d);try{mine&&after&&after(d)}catch(e){console.warn('hook',h,e.message)}return r}};
  const flush=()=>{if(EV.cur&&EV.cur.t==='clash'&&EV.cur.tot){const c=EV.cur;c.logs=logSince(c.log0).map(e=>e.t);c.inf1=snapInf();pushEv(c)}EV.cur=null};
  wrap('roundStart',()=>{flush()},()=>{UI.rs0=snapInf();UI.rsLog=G.logN;UI.clashRes={};UI.placed=[]});
  wrap('bidReveal',null,()=>{pushEv({t:'bids',round:G.round,bids:G.pl.map(p=>({seat:p.seat,id:p.bid,str:G.bstr[p.seat]})).filter(b=>b.id!=null),order:G.order.slice()})});
  wrap('clashReveal',()=>{if(EV.cur&&EV.cur.tot)flush()},()=>{const c=G.clash;if(!c)return;if(!EV.cur)EV.cur={t:'clash',r:c.r,idx:G.cord.indexOf(c.r),rounds:0,log0:G.logN-c.parts.length,inf0:snapInf()};
    EV.cur.n=c.n;EV.cur.cards={};for(const s of c.parts)EV.cur.cards[s]=(c.cards[s]||[]).slice();EV.cur.supp={};for(const s of c.parts)EV.cur.supp[s]=G.pl[s].supp.r[c.r];EV.cur.parts=c.parts.slice();EV.cur.tot=null});
  wrap('clashTally',null,()=>{const c=G.clash;if(!c||!EV.cur)return;EV.cur.tot=Object.assign({},c.tot);EV.cur.winner=c.winner;EV.cur.tied=c.tied?c.tied.slice():null;
    EV.cur.cardsF={};for(const s in EV.cur.cards)EV.cur.cardsF[s]=EV.cur.cards[s].slice();
    const ci=G.clash.cards;for(const s in ci)EV.cur.cardsF[s]=ci[s].slice();
    EV.cur.str={};for(const s in EV.cur.cardsF)EV.cur.str[s]=EV.cur.cardsF[s].map(id=>cinfo(id).strength)});
  wrap('regionDone',()=>{flush()});
  wrap('cleanup',()=>{if(UI.rs0)pushEv({t:'summary',round:G.round,rounds:G.rounds,inf0:UI.rs0,inf1:snapInf(),order:G.order.slice(),warns:logSince(UI.rsLog||0).filter(e=>e.c==='warn').map(e=>e.t),big:logSince(UI.rsLog||0).filter(e=>e.c==='big').map(e=>e.t).slice(-8),last:G.round>=G.rounds})});
  if(PK&&PK.bidRes){const o=PK.bidRes;PK.bidRes=function(seat,opt,d){const r=o.call(this,seat,opt,d);try{UI.toast=G.log.length?G.log[G.log.length-1].t:''}catch(e){}return r}}}
// ---------------------------------------------------------------- AI adapter (the engine author's TB.ai when present, else a modest fallback)
function legal(seat){return TB.moves(G,seat)}  // on a client this runs on its own stripped copy (same list as the host's, net-strip-test.js)
function aiLevel(seat){return G.pl[seat].ai||'normal'}
function rndAI(){UI.aiSeed=(UI.aiSeed*1664525+1013904223)>>>0;return UI.aiSeed/4294967296}
function pickR(a){return a[Math.floor(rndAI()*a.length)]}
function fallbackPick(seat,mv){const q=G.q,k=q.kind;
  if(k==='bid'){const hs=mv.map(m=>[m,cinfo(m.id).strength]).sort((a,b)=>b[1]-a[1]);return hs[Math.min(2,hs.length-1)][0]}
  if(k==='bidRes'){const t=mv.filter(m=>m.t==='take');return t.length?pickR(t):mv.find(m=>m.t==='return')||mv[0]}
  if(k==='herald'){const w={3:3,0:2,1:2,2:2,4:1,5:1};return mv.slice().sort((a,b)=>(w[b.loc]||1)-(w[a.loc]||1)+(rndAI()-.5))[0]}
  if(k==='place'){const s=mv.map(m=>[m,cinfo(m.id).strength+rndAI()*3]).sort((a,b)=>b[1]-a[1]);return s[Math.floor(s.length/2)][0]}
  if(q.t==='menu'){const d=mv.find(m=>m.t==='done');const acts=mv.filter(m=>m.t==='act'&&m.a!=='supp');return acts.length&&rndAI()<.3?pickR(acts):(d||mv[0])}
  if(q.t==='sel'){const dn=mv.find(m=>m.t==='seldone');const its=mv.filter(m=>m.t==='sel');if(dn&&(!its.length||rndAI()<.5))return dn;return pickR(its.length?its:mv)}
  if(k==='location')return mv.slice().sort((a,b)=>DD.LOCS[b.loc][2]-DD.LOCS[a.loc][2])[0];
  const ns=mv.filter(m=>!m.skip&&!m.pass&&m.k!=='skip'&&m.k!=='pass');return pickR(ns.length&&rndAI()<.8?ns:mv)}
function aiChoose(seat,level){const mv=legal(seat);if(!mv.length)return null;if(mv.length===1)return mv[0];
  const A=TB.AI||TB.ai;level=level||aiLevel(seat);
  try{if(A){let r=null;
      if(typeof A.choose==='function')r=A.choose(G,seat,level);else if(typeof A.pick==='function')r=A.pick(G,seat,level);else if(typeof A.move==='function')r=A.move(G,seat,level);else if(typeof A.best==='function')r=A.best(G,seat,level);
      if(r&&typeof r==='object'&&r.k!=null){const m=mv.find(x=>x.k===r.k);if(m)return m}
      else if(typeof r==='string'){const m=mv.find(x=>x.k===r);if(m)return m}}}
  catch(e){console.warn('ai failed, fallback',e.message)}
  return fallbackPick(seat,mv)}
// "recommended": what the Hard computer would play for the human, from the human's own information only
function suggest(seat){if(!G||!G.q||!G.q.seats.includes(seat))return null;if(isClient()){const k=NET.rk;return k!=null?(legal(seat).find(m=>m.k===k)||null):null}try{return aiChoose(seat,ANIM?'hard':'normal')}catch(e){return null}}
// ---------------------------------------------------------------- game start / save / load
function mkSeats(cfg){const n=cfg.np,seats=[];const fac=FIDS.slice();
  const mine=cfg.faction&&fac.includes(cfg.faction)?cfg.faction:null;
  const rest=fac.filter(f=>f!==mine);
  for(let i=0;i<n;i++){const f=(i===0&&mine)?mine:(rest.shift()||fac[i%4]);seats.push({faction:f,human:false,level:'normal'})}
  return seats}
function newGame(mode,o){o=o||{};mode=mode||'me';
  const cfg={mode:mode==='ai'?'watch':mode,np:o.np||(mode==='guided'?2:3),length:o.length||(mode==='guided'?'short':'standard'),faction:o.faction||'nobility',levels:o.levels||[],seed:o.seed,humanSeats:o.humanSeats,guide:o.guide};
  if(mode==='guided'){cfg.mode='me';cfg.guided=true;cfg.guide='full';cfg.levels=['easy']}
  const seats=mkSeats(cfg);
  const hn=cfg.mode==='hot'?(cfg.humanSeats||seats.map((_,i)=>i)):cfg.mode==='watch'?[]:[0];
  seats.forEach((s,i)=>{s.human=hn.includes(i);s.level=cfg.levels[i]||cfg.levels[0]||'normal'});
  if(o.seatFactions)o.seatFactions.forEach((f,i)=>{if(seats[i])seats[i].faction=f});
  const cnt={};const pl=seats.map((s,i)=>{const base=DD.FSHORT[s.faction];
    return {faction:s.faction,name:s.human?(cfg.mode==='hot'||hn.length>1?'Player '+(i+1)+' ('+base+')':'You ('+base+')'):base,ai:s.human?null:s.level}});
  cfg.seats=seats;UI.cfg=cfg;UI.mode=cfg.mode;UI.guide=cfg.guide||(UI.guide||'full');
  hookEngine();
  G=null;const g=TB.newGame({players:pl,length:cfg.length,seed:cfg.seed!=null?cfg.seed:(o.seed!=null?o.seed:undefined)});
  G=g;resetUI();UI.started=true;UI.holder=hn[0]!=null?hn[0]:0;
  UI.rs0=snapInf();UI.rsLog=0;
  saveGame();hideStart();afterStart();return G}
function resetUI(){UI.evq=[];UI.card=null;UI.pop=null;UI.popArg=null;UI.busy=false;UI.tip={};UI.seen={};UI.clashRes={};UI.placed=[];UI.sel={};UI.toast='';UI.lastLog=G?G.logN:0;UI.watchPaused=false;UI.passed=null;UI.lastShown=null;UI.mapReset=true}
function saveGame(){try{if(NET.on||!G||G.over||!UI.cfg)return;localStorage.setItem('tb_save',JSON.stringify({v:1,G,cfg:UI.cfg,holder:UI.holder,guide:UI.guide,ai:UI.aiSeed,t:Date.now()}))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem('tb_save');return s?JSON.parse(s):null}catch(e){return null}}
function clearSave(){try{localStorage.removeItem('tb_save')}catch(e){}}
function resumeGame(sv){hookEngine();G=sv.G;UI.cfg=sv.cfg;UI.mode=sv.cfg.mode;UI.holder=sv.holder||0;UI.guide=sv.guide||'full';UI.aiSeed=sv.ai||1;resetUI();UI.started=true;UI.rs0=snapInf();UI.rsLog=G.logN;return G}
// ---------------------------------------------------------------- applying moves
function doMove(mv){if(!G||!G.q)return false;const was=G.round,l0=G.logN;
  const res=TB.apply(G,mv);
  if(!res.ok){console.warn('move rejected',res.err,mv&&mv.k);UI.err=res.err;if(res.exc)console.error('ENGINE '+res.err);return false}
  UI.lastRes=res;if(typeof snd==='function')snd(mv,res);
  saveGame();return true}
// ---------------------------------------------------------------- the pump: events -> end -> AI moves -> human decision (one thing at a time)
function pendingSeats(){return G&&G.q?G.q.seats.slice():[]}
function whoActs(){ // returns {ai:[seats], hum:[seats]}
  const ps=pendingSeats();return {ai:ps.filter(s=>G.pl[s].ai),hum:ps.filter(s=>!G.pl[s].ai)}}
var _pumpT=0;
function pump(){clearTimeout(_pumpT);_pumpT=0;if(!G||!UI.started)return;
  if(NET.on)return netPump();
  if(UI.pumping)return;UI.pumping=true;
  try{
    for(let guard=0;guard<4000;guard++){
      if(UI.card){renderAll();return}                       // a card (event, pass screen, coach) is waiting for Continue
      if(UI.evq.length&&(vs()>=0||UI.mode==='watch')){const ev=UI.evq.shift();if(shouldShowEvent(ev)){showEvent(ev);renderAll();return}continue}
      if(UI.evq.length){UI.evq.length=0}
      if(G.over){showOver();renderAll();return}
      if(!G.q){renderAll();return}
      const w=whoActs();
      if(w.ai.length){ // AI answers (simultaneous hidden decisions are collected in any order)
        if(AIDELAY>0&&ANIM){renderAll();if(UI.mode==='watch'&&UI.watchPaused)return;_pumpT=setTimeout(()=>{aiStep(w);pump()},AIDELAY*(UI.mode==='watch'?1:.6)/UI.speed);return}
        aiStep(w);continue}
      // only humans are pending
      const h=pickHumanSeat(w.hum);
      if(h==null){renderAll();return}               // pass-the-device card up
      if(typeof maybeTip==='function'&&maybeTip()){renderAll();return}
      renderAll();return}
  }finally{UI.pumping=false}}
function aiStep(w){const s=w.ai[0];const mv=aiChoose(s);if(!mv){console.warn('AI has no move',s,G.q&&G.q.kind);G.q=null;return}
  if(!doMove(mv)){const alt=legal(s);if(alt.length)doMove(alt[0])}}
function pickHumanSeat(hum){
  if(!hotSeat())return hum[0];
  if(hum.includes(UI.holder)&&UI.passed===UI.holder)return UI.holder;
  // pass the device to the next human who has a decision
  const nxt=hum.includes(UI.holder)?UI.holder:hum[0];
  UI.passDelay=null;UI.card={kind:'pass',seat:nxt};UI.passed=null;return null}
function afterHumanMove(){UI.passed=hotSeat()?UI.passed:null;pump()}
function humanMove(k){if(NET.on)return netHumanMove(k);const s=viewSeatForQ();if(s==null)return false;const mv=legal(s).find(m=>m.k===k);if(!mv)return false;
  const ok=doMove(mv);if(ok){UI.sel={};UI.hand=null;closePop(true);if(hotSeat()){ // pass on once this seat has nothing more to decide
      const still=G.q&&G.q.seats.includes(s);if(!still)UI.passed=null}
    pump()}return ok}
function viewSeatForQ(){if(!G||!G.q)return null;if(NET.on){const m=NET.mySeat;return m>=0&&G.q.seats.includes(m)&&!G.pl[m].ai?m:null}const hum=G.q.seats.filter(s=>!G.pl[s].ai);if(!hum.length)return null;if(!hotSeat())return hum[0];return hum.includes(UI.holder)&&UI.passed===UI.holder?UI.holder:null}
// ===================== part 2: the kingdom map (TBKit.map with 6 locations = 3 regions x 2, plus the throne) =====================
const MAP={m:null,sig:'',ov:null,pan:null,hl:[],busyHerald:{},shown:{}};
const LOCPOS=[[290,205],[710,205],[165,610],[165,850],[835,610],[835,850]];
// region labels sit just above the dashed panel of the two side regions: the location circle (and its highlight ring) at the top of the panel used to cover them
const REGBOX=[{x:195,y:110,w:610,h:250,lab:[500,345]},{x:92,y:520,w:280,h:420,lab:[232,504]},{x:628,y:520,w:280,h:420,lab:[768,504]}];
// slot centre of each region strip (the slots belong to the REGION, the kit stores them on the region's first location)
const STRIP=[{cx:500,cy:222,cols:4},{cx:305,cy:730,cols:2},{cx:695,cy:730,cols:2}];
function mapOpts(){const L=[0,1,2,3,4,5].map(i=>({id:LOCID[i],name:LOCN[i],type:LOC_TYPE[i],x:LOCPOS[i][0],y:LOCPOS[i][1],links:[LOCID[i^1],'throne']}));
  return {players:G.pl.map(p=>({faction:FK[p.fac],name:p.name})),locations:L,w:1000,h:1000,trackLen:40,compact:!!UI.phone,quality:(UI.lowGfx||UI.phone)?'low':undefined,seed:7,onTap:mapTap}}
function buildMap(){const wrap=$('#mapwrap');if(!wrap)return;
  if(MAP.m){try{MAP.m.destroy()}catch(e){}}
  wrap.innerHTML='';
  MAP.m=TBKit.map(Object.assign({container:wrap},mapOpts()));
  MAP.sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);MAP.ov=null;MAP.pan=null;MAP.shown={};MAP.busyHerald={};
  const svg=MAP.m.el;svg.setAttribute('aria-label','Map of the kingdom: three regions of two locations, and the throne');
  const NSS='http://www.w3.org/2000/svg';
  MAP.pan=document.createElementNS(NSS,'g');MAP.pan.setAttribute('class','tbx-pan');svg.insertBefore(MAP.pan,svg.querySelector('.tb-m-locs'));
  MAP.ov=document.createElementNS(NSS,'g');MAP.ov.setAttribute('class','tbx-ov');MAP.ov.setAttribute('pointer-events','none');svg.appendChild(MAP.ov);
  MAP.sg=document.createElementNS(NSS,'g');MAP.sg.setAttribute('class','tbx-selname');MAP.sg.setAttribute('pointer-events','none');svg.appendChild(MAP.sg);
  drawPanels();relayoutSlots();
  // heralds start "at court" (dimmed, on the throne) until placed
  for(let s=0;s<G.np;s++)MAP.m.setHerald(s,'throne');
  MAP.infl={};for(let s=0;s<G.np;s++){MAP.m.setInfluence(s,G.pl[s].inf,{immediate:true})}
  MAP.heraldAt={};MAP.slotSig={}}
function drawPanels(){const f=[];
  REGBOX.forEach((b,r)=>{f.push('<g data-reg="'+r+'"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="34" fill="#f4e6b8" fill-opacity=".13" stroke="#e8c867" stroke-opacity=".55" stroke-width="3" stroke-dasharray="4 10" stroke-linecap="round"/>'+
    '<text x="'+b.lab[0]+'" y="'+b.lab[1]+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="22" letter-spacing="3" fill="#f6e6b4" fill-opacity=".85" stroke="#000" stroke-opacity=".6" stroke-width="3" paint-order="stroke">'+esc(REG[r].toUpperCase())+'</text></g>')});
  MAP.pan.innerHTML=f.join('')}
function relayoutSlots(){const m=MAP.m;if(!m)return;const CP=!!UI.phone,sw=CP?44:38,sh=CP?62:54,gap=CP?6:6,n=G.np;
  for(let r=0;r<3;r++){const a=LOCID[2*r],b=LOCID[2*r+1],pa=m.locPos(a),S=STRIP[r];
    const cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols);const tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const el=m.slotEl(a,s),el2=m.slotEl(b,s);if(el2)el2.style.display='none';if(!el)continue;
      const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap),y=S.cy-th/2+rw*(sh+gap);
      el.setAttribute('transform','translate('+Math.round(x-pa.x)+' '+Math.round(y-pa.y)+')');
      el.setAttribute('data-reg',r);el.style.cursor='pointer'}
    const lf=m.locEl(a)&&m.locEl(a).querySelector('.tb-lfx');if(lf)lf.setAttribute('transform','translate('+Math.round(S.cx-pa.x)+' '+Math.round(S.cy-pa.y+ (rows*sh)/2+22)+')')}}
function mapTap(id,info){if(!G||!UI.started)return;
  if(UI.card&&UI.card.kind!=='pass'){return}
  if(id==='throne'){openPop('kingdom');return}
  const l=LOCID.indexOf(id);if(l<0)return;
  if(info&&info.seat!=null){openPop('region',{r:regOfLoc(l)});return}
  openPop('loc',{l})}
// ---------------------------------------------------------------- slot content from the (stripped) view
const ownerOf=id=>id<0?-id-1:(id/100)|0;
function slotState(V,r,s){const R=V.reg[r];const up=R.up.filter(id=>ownerOf(id)===s),down=R.down.filter(id=>ownerOf(id)===s);
  const rs=UI.clashRes[r];
  if(up.length){let tot=0;for(const id of up)tot+=TB.cardInfo(G,id).strength;const st={count:up.length,value:tot,faceDown:false};
    if(rs&&rs.winner!=null){if(rs.winner===s)st.winner=true;else if(rs.winner>=0)st.loser=true}return st}
  if(down.length){const st={count:down.length,faceDown:true};const mine=down.find(id=>id>=0);if(mine!=null&&s===vs()){st.card=cardSpec(mine);st.mineId=mine}return st}
  return null}
function renderMap(){if(!G||!UI.started)return;const wrap=$('#mapwrap');if(!wrap)return;
  const sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);
  if(!MAP.m||MAP.sig!==sig||UI.mapReset){buildMap();UI.mapReset=false}
  const m=MAP.m,V=UI.V;
  m.setRound(Math.max(1,G.round),G.rounds);
  // influence
  for(let s=0;s<G.np;s++){const v=G.pl[s].inf;if(m.influence(s)!==v){const p=ANIM&&!UI.noAnim?m.setInfluence(s,v):m.setInfluence(s,v,{immediate:true});if(ANIM&&p&&p.then){UI.busy=true;p.then(()=>{UI.busy=false})}}}
  // heralds (public). unplaced = at court (dimmed)
  for(let s=0;s<G.np;s++){const l=G.pl[s].herald,id=l>=0?LOCID[l]:'throne';const el=m.el.querySelector('.tb-herald[data-seat="'+s+'"]');
    if(MAP.heraldAt[s]!==id){const from=MAP.heraldAt[s];MAP.heraldAt[s]=id;
      if(ANIM&&from&&id!=='throne'&&from!==id&&!UI.noAnim){m.moveHerald(s,id,{hop:260})}else m.setHerald(s,id)}
    if(el)el.style.opacity=l>=0?'1':'.5'}
  // card slots
  let sig2='';const ss=[];for(let r=0;r<3;r++)for(let s=0;s<G.np;s++){const st=slotState(V,r,s);ss.push([r,s,st]);sig2+=JSON.stringify(st)+'|'}
  sig2+=JSON.stringify(UI.clashRes);
  if(sig2!==MAP.slotSig||MAP.slotDirty){MAP.slotSig=sig2;MAP.slotDirty=false;
    for(const [r,s,st] of ss){const a=LOCID[2*r];m.setSlot(a,s,st);const el=m.slotEl(a,s);if(el){if(st&&st.mineId!=null){el.setAttribute('data-owner',s);el.setAttribute('data-up','1')}else{el.removeAttribute('data-owner');el.removeAttribute('data-up')}}}}
  drawOverlay();applyHl()}
function drawOverlay(){const ov=MAP.ov,m=MAP.m;if(!ov||!m)return;const V=UI.V,f=[];
  // location reward coins (+1 / +2) and a favour disc marker
  for(let l=0;l<6;l++){const p=m.locPos(LOCID[l]),inf=DD.LOCS[l][2],k=UI.phone?1.2:1;
    f.push('<g transform="translate('+(p.x+40*k)+' '+(p.y-40*k)+')"><circle r="'+(UI.phone?19:17)+'" fill="#1b0b10" stroke="#e8c867" stroke-width="2.6"/><text y="8" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+(UI.phone?24:22)+'" fill="#fff0b8">+'+inf+'</text></g>');
    // council marker / favour
    if(l===2){const h=V.fav.h;const col=h>=0?fcol(h):'#e8c867';f.push('<g transform="translate('+(p.x-40*k)+' '+(p.y-40*k)+')"><circle r="'+(UI.phone?18:16)+'" fill="'+col+'" stroke="#fff3c4" stroke-width="2.6"/><path d="M0 -9 L2.6 -2.6 9 -2.6 3.8 1.6 5.8 8 0 4 -5.8 8 -3.8 1.6 -9 -2.6 -2.6 -2.6Z" fill="#fff6d0" stroke="#4a3208" stroke-width="1"/></g>')}
    // Kingdom Cards that sit on a Location
    const kl=V.loc[l].kc.length;if(kl)f.push('<g transform="translate('+(p.x)+' '+(p.y+52)+')"><rect x="-17" y="-12" width="34" height="24" rx="5" fill="#2a1c10" stroke="#e8c867" stroke-width="2"/><text y="7" text-anchor="middle" font-size="18" font-weight="700" fill="#f6e6b4" font-family="'+TBKit.fonts.display+'">K</text></g>')}
  // clash order markers, supporters
  for(let r=0;r<3;r++){const S=STRIP[r],B=REGBOX[r];const ci=V.cord?V.cord.indexOf(r):-1;
    if(ci>=0){const done=V.reg[r].done,cur=V.clash&&V.clash.r===r;const x=r===0?B.x+34:(r===1?B.x+34:B.x+B.w-34),y=r===0?B.y+34:B.y+34;
      f.push('<g transform="translate('+x+' '+y+')"><circle r="22" fill="'+(cur?'#e8c867':done?'#3a3a3a':'#7c1b2c')+'" stroke="#fff3c4" stroke-width="2.6"/><text y="8.5" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="24" fill="'+(cur?'#2b1808':'#fff3c4')+'">'+['I','II','III'][ci]+'</text></g>')}
    // supporters: little discs in the faction colour under each slot
    const n=G.np,cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols),sw=UI.phone?44:38,sh=UI.phone?62:54,gap=6,tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const sp=V.pl[s].supp,cnt=sp.r[r]+sp.x[r];if(!cnt)continue;const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap)+sw/2,y=S.cy-th/2+rw*(sh+gap)+sh+(UI.phone?10:9);
      f.push('<g transform="translate('+x+' '+y+')"><circle r="'+(UI.phone?11:10)+'" fill="'+fcol(s)+'" stroke="#fff3c4" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="'+TBKit.fonts.display+'">'+cnt+'</text></g>')}}
  ov.innerHTML=f.join('')}
function setHl(ids){MAP.hl=ids||[]}
function applyHl(){const m=MAP.m;if(!m)return;const sel=UI.pop==='loc'&&UI.popArg?LOCID[UI.popArg.l]:null;m.highlight(MAP.hl.map(l=>LOCID[l]));m.select(sel);drawSelName()}
// Phones: the kit's name banners are hidden (they were clipped and overlapped the region labels and reward coins). A tapped location shows its name here instead, in a spot with nothing else: below the circle in the top row and the upper half of the side columns, above it in the lower half.
function drawSelName(){const g=MAP.sg;if(!g)return;if(!UI.phone||UI.pop!=='loc'||!UI.popArg||UI.popArg.l==null){g.innerHTML='';return}
  const l=UI.popArg.l,P=LOCPOS[l],name=LOCN[l],fs=34,words=name.split(' ');let lines=[name];if(name.length>9&&words.length>1){const h=Math.ceil(words.length/2);lines=[words.slice(0,h).join(' '),words.slice(h).join(' ')]}
  const wd=Math.max(...lines.map(t=>t.length))*fs*.66+30,ht=lines.length*(fs+8)+14,below=l<2||l===2||l===4;let cx=P[0];cx=Math.max(wd/2+8,Math.min(1000-wd/2-8,cx));const top=below?P[1]+60:P[1]-60-ht;
  g.innerHTML='<g><rect x="'+Math.round(cx-wd/2)+'" y="'+Math.round(top)+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="14" fill="#1d120b" fill-opacity=".92" stroke="#e8c867" stroke-width="3"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+7+(i+1)*(fs+8)-6)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>'}
// brief flourish when the region's cards are flipped (kit reveal on the region's slots)
function mapReveal(ev){if(!MAP.m||!ANIM)return Promise.resolve();const a=LOCID[2*ev.r];const ents=ev.parts.filter(s=>ev.cardsF&&ev.cardsF[s]&&ev.cardsF[s].length).map(s=>{const ids=ev.cardsF[s];let tot=0;for(const id of ids)tot+=TB.cardInfo(G,id).strength;return {seat:s,value:tot,winner:ev.winner===s}});
  if(!ents.length)return Promise.resolve();try{return MAP.m.revealSlots(a,ents,{stagger:140}).catch(()=>{})}catch(e){return Promise.resolve()}}
function mapResetReveal(r){try{MAP.m&&MAP.m.resetReveal(LOCID[2*r])}catch(e){}MAP.slotDirty=true}
// ===================== part 3: the dock (round roadmap, the one decision to make now) =====================
const ROAD=['Bids','Heralds','Cards','Spring','Clashes','Autumn','Winter'];
function roadIdx(){const st=G.step,ph=G.phase;if(ph==='over')return 6;if(ph==='winter')return 6;
  if(ph==='autumn'||st==='autumnActions')return 5;
  if(ph==='summer'||['clashorder','reveal','day','night','tally'].includes(st))return 4;
  if(st==='springActions')return 3;if(st==='place')return 2;if(st==='herald')return 1;return 0}
const STEP_HELP=[
 'Spring, Bids. Everyone secretly picks one card from their hand as a bid. Highest bid chooses first: take a Kingdom Card, steal a rival\'s, or take your card back. A card you bid under a Kingdom Card stays there while you keep it.',
 'Spring, Heralds. In turn, put your Herald on one of the six locations. Everyone sees it. If you win a clash and claim that location you gain 1 Influence and steal 1 from every rival Herald on it.',
 'Spring, Cards. Secretly play one face-down card next to each of the three regions. The strongest total in a region wins its clash, so decide where your big cards go.',
 'Spring, Actions. In turn order you may use Spring abilities, such as sending Supporters (+1 Strength each) to a region. Skip it if you have nothing to do.',
 'Summer, Clashes. Regions are resolved one by one. Cards are revealed, Day and Night abilities fire, the strongest total wins and claims one of the region\'s two locations.',
 'Autumn. Once each you may Govern (move a hand card with votes into a Council) and Journey (spend a hand card for Lore to buy Site of Power cards), plus any Autumn abilities.',
 'Winter. Heralds go home, Supporters are lost, played cards go to the discard pile, and the next round starts. Running out of deck shrinks your hand size (Attrition).'];
const KIND_NAME={bid:'Choose your bid',bidRes:'Resolve your bid',herald:'Place your Herald',place:'Play a face-down card',menu:'Your actions',clashOrder:'Order the clashes',location:'Claim a location',tie:'Break the tie?'};
// ---------------------------------------------------------------- top bar status chip
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;
  const ri=roadIdx();const r=Math.max(1,G.round);
  el.innerHTML='<span class="chip" aria-label="Round '+r+' of '+G.rounds+', step '+ROAD[ri]+'"><span class="chip-r">'+ico('round')+'<b>'+r+'</b><small>/'+G.rounds+'</small></span><span class="chip-s">'+esc(ROAD[ri])+'</span></span>'}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){const el=$('#road');if(!el)return;const ri=roadIdx();
  el.innerHTML='<div class="road-h"><b>Round '+Math.max(1,G.round)+' of '+G.rounds+'</b><span class="road-n">step '+(ri+1)+' of 7</span></div><ol class="road-l" aria-label="Round roadmap">'+ROAD.map((n,i)=>'<li class="'+(i<ri?'done':i===ri?'on':'')+'"'+(i===ri?' aria-current="step"':'')+'><i>'+(i+1)+'</i><span>'+n+'</span></li>').join('')+'</ol>'}
// ---------------------------------------------------------------- recommended move
function getRec(s,mv){const key=G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0);
  if(UI._rk===key)return UI._rec;UI._rk=key;let r=null;try{r=suggest(s)}catch(e){}UI._rec=r;return r}
const recK=()=>UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') should be among the first to choose from the Great Road, but the card will sit under whatever you take.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+'): it keeps your strong cards for the clashes. You may be late to choose, or just take the card back.':
      'A middle bid ('+i.strength+'): good enough to pick a Kingdom Card, while your strongest cards stay free for the clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>p.name);
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: if you win here you take 1 Influence from each.':'No rival Herald is here yet, so your swing is a clean +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes the tie ends with no winner.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    return 'Strength '+i.strength+' in '+r+(i.strength>=7?': a strong card for a region you want to win.':i.strength<=2?': a cheap card, useful as a bluff or to save better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Taking the card back keeps your hand full if nothing on offer helps.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card away from a rival and returns their occupying card to their hand.';return 'This Kingdom Card fits your hand: it takes effect while your bid card sits under it.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'.')+(G.pl.some(p=>p.seat!==s&&p.herald===mv.loc)?' Rival Heralds there lose 1 each if yours is there too.':'')}
  if(G.q.t==='menu'){return mv.t==='done'?'Nothing else is worth doing right now.':'Worth doing before you finish.'}
  return 'The computer at its strongest would pick this.'}
const lcFirst=t=>t?t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,''):''
// ---------------------------------------------------------------- the main prompt
function recapHTML(){const c=G.clash;if(!c)return '';const parts=c.parts,V=UI.V;
  const rows=parts.map(s=>{const ids=(c.cards[s]||[]);const tot=c.tot&&c.tot[s]!=null?c.tot[s]:null;
    return '<span class="rc-s" style="--fc:'+fcol(s)+'"><b>'+esc(shortName(s))+'</b> '+ids.map(id=>cinfo(id).strength).join('+')+(G.pl[s].supp.r[c.r]?' +'+G.pl[s].supp.r[c.r]+' supporter'+(G.pl[s].supp.r[c.r]>1?'s':''):'')+(tot!=null?' = <b>'+tot+'</b>':'')+'</span>'}).join('');
  return '<div class="recap" aria-label="Current clash"><span class="rc-t">Clash in '+esc(REG[c.r])+(c.n>1?' (round '+c.n+')':'')+'</span>'+rows+'</div>'}
const shortName=s=>kf(s).short.replace('Gilded Court','Gilded').replace('Heathbound Clans','Heath').replace('Lantern Rising','Lantern').replace('Pale Choir','Choir')+(!G.pl[s].ai&&(NET.on?s===vs():humans().length===1)?' (you)':'');
function waitingHTML(){const q=G.q;let who='';
  if(q){const names=q.seats.map(s=>shortName(s));who=NET.on?decidingLine():names.join(', ')+(q.seats.length>1?' are':' is')+' deciding'}
  const cur=G.log.slice(-3).map(e=>'<li>'+esc(e.t)+'</li>').join('');
  return '<div class="wait"><p class="w-t">'+(UI.mode==='watch'?'Watching the computers play.':NET.on&&vs()<0?'You are watching.':'Waiting for the others.')+' '+esc(who)+'.</p><ul class="w-log">'+cur+'</ul>'+(UI.mode==='watch'?watchControls():'')+'</div>'}
function watchControls(){return '<div class="btnrow"><button class="btn" data-a="wpause" aria-pressed="'+UI.watchPaused+'">'+(UI.watchPaused?'Resume':'Pause')+'</button><button class="btn" data-a="wstep">Step</button><button class="btn" data-a="wspeed">Speed x'+UI.speed+'</button></div>'}
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(m.label)+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Recommended</span>':'')+'</button>'}
function thumbFor(m){if(m.id!=null&&m.id>=0&&m.t!=='sel')return '<span class="th"'+(ownerOf(m.id)===vs()?' data-owner="'+ownerOf(m.id)+'" data-up="1"':'')+'>'+cardEl(m.id,44).outerHTML+'</span>';
  if(m.kc)return '<span class="th">'+kcEl(m.kc,44).outerHTML+'</span>';return ''}
function renderMain(){const el=$('#main');if(!el)return;const q=G.q;
  if(G.over){el.innerHTML='<div class="step"><h3>The reign is over</h3></div>';return}
  const s=viewSeatForQ();
  if(!q||s==null||UI.card&&UI.card.kind==='pass'){el.innerHTML=waitingHTML();setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const rm=rec?mv.find(m=>m.k===rec.k):null;
  let h='';const help=tipLine(q.kind);
  h+='<div class="step"><h3 class="st">'+esc(KIND_NAME[q.kind]||q.title.replace(/^[^:]*:\s*/,''))+'</h3>';
  h+='<p class="pr">'+esc(promptText(q))+'</p>';
  if(NET.on&&q.simul){const oth=q.seats.filter(x=>x!==s);if(oth.length)h+='<p class="hint dec">Everyone decides at the same time. Still to choose: '+esc(oth.map(seatWho).join(', '))+'.</p>'}
  if(G.clash&&['day','night','tally'].includes(G.step)||G.clash&&q.kind==='location'||G.clash&&['castle','wilderness','harvest','shrine','ossuary','tie'].includes(q.kind))h+=recapHTML();
  const hl=[];
  switch(q.kind){
   case 'bid':{h+=recLine(s,rm);h+='<div class="btnrow">'+(rm?'<button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Bid '+esc(cinfo(rm.id).name)+' ('+cinfo(rm.id).strength+')</button>':'')+'<button class="btn" data-a="road4">Great Road</button></div>';h+='<p class="hint">Or tap any card in your hand.</p>';break}
   case 'bidRes':{h+=recLine(s,rm);h+=bidResHTML(s,mv);break}
   case 'herald':{h+=recLine(s,rm);h+='<div class="locgrid">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="loc" data-l="'+m.loc+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' '+esc(REG[m.loc>>1])+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';h+='<p class="hint">Tap a location on the map, or here, to see its reward and place your Herald.</p>';mv.forEach(m=>hl.push(m.loc));break}
   case 'place':{h+=placeInfo(s,mv);const rs=[...new Set(mv.map(m=>m.r))];rs.forEach(r=>{hl.push(2*r,2*r+1)});h+=recLine(s,rm);if(rm)h+='<div class="btnrow"><button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Play '+esc(cinfo(rm.id).name)+' ('+cinfo(rm.id).strength+') at '+esc(REG[rm.r])+'</button></div>';h+='<p class="hint">Tap a card in your hand to play it face-down'+(rs.length>1?' (choose the region)':' next to '+esc(REG[rs[0]]))+'.</p>';break}
   case 'tie':{h+=recLine(s,rm);h+='<div class="btnrow">'+mv.filter(m=>m.pass).map(m=>'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Pass</button>').join('')+(rm&&!rm.pass?'<button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Play '+esc(cinfo(rm.id).name)+'</button>':'')+'</div><p class="hint">Or tap a hand card to play it face-down into the tied clash.</p>';break}
   case 'location':{h+=recLine(s,rm);h+='<div class="locgrid two">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+(DD.LOCS[m.loc][3]?' and '+esc(lcFirst(DD.LOCS[m.loc][3])):'')+'</small>'+heraldDots(m.loc)+(recK()===m.k?'<span class="rtag">'+ico('star')+'Recommended</span>':'')+'</button>').join('')+'</div>';mv.forEach(m=>hl.push(m.loc));break}
   case 'clashOrder':{h+=recLine(s,rm);h+='<div class="opts">'+mv.map(m=>optBtn(m,'ord',orderChips(m.order))).join('')+'</div>';break}
   default:{ // generic pick / sel / menu
     if(q.t==='menu')h+=menuHTML(s,mv,rm);
     else if(q.t==='sel')h+=selHTML(s,mv,rm,q);
     else{h+=recLine(s,rm);h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>'}}}
  h+='</div>';el.innerHTML=h;setHl(hl)}
function tipLine(k){return ''}
function promptText(q){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick one card from your hand as a secret bid. Its Strength is your bid.';
    case 'herald':return 'Choose the location where your Herald waits. Everyone sees it.';
    case 'place':return t.indexOf('fewer')>=0?t:'Place one face-down card next to each region: '+placeProgress();
    case 'location':return t;case 'clashOrder':return 'You place the Clash Markers. Choose which region is resolved first.';
    default:return t}}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggestion:</b> '+esc(shortRec(rm))+'</span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' (strength '+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';return m.label}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
function placeInfo(s,mv){return ''}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal)){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em><p>'+esc(k.text)+'</p>'+(m.t==='steal'?'<p class="st-n">Steal it from '+esc(nameOf(m.s2))+'.</p>':'')+'<button class="btn'+(rec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+(rec?' (recommended)':'')+'</button></div></div>'}
  for(const m of ret){h+='<div class="offer ret'+(recK()===m.k?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take your bidding card back into your hand and take nothing.</p><button class="btn'+(recK()===m.k?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">Take it back'+(recK()===m.k?' (recommended)':'')+'</button></div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): grouped; "done" always last
function menuHTML(s,mv,rm){let h=recLine(s,rm);const acts=mv.filter(m=>m.t==='act'),done=mv.find(m=>m.t==='done');
  const groups={};const order=[];for(const m of acts){const g=m.a;if(!groups[g]){groups[g]=[];order.push(g)}groups[g].push(m)}
  h+='<div class="opts">';
  for(const g of order){const L=groups[g];
    if(g==='supp'){const byR={};for(const m of L){(byR[m.p.r]=byR[m.p.r]||[]).push(m)}
      h+='<div class="grp"><b>Send Supporters</b> <small>(+1 Strength each in a region; lost in Winter)</small>';
      for(const r in byR){h+='<div class="sup-r"><span>'+esc(REG[r])+'</span>'+byR[r].map(m=>'<button class="nb" data-a="mv" data-k="'+esc(m.k)+'" aria-label="Place '+m.p.n+' in '+esc(REG[r])+'">'+m.p.n+'</button>').join('')+'</div>'}
      h+='</div>';continue}
    for(const m of L)h+=optBtn(m,'act',actIcon(m))}
  h+='</div>';
  if(done)h+='<div class="btnrow"><button class="btn'+(acts.length?'':' pri')+(recK()===done.k?' rec':'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(done.label)+'</button></div>';
  return h}
const actIcon=m=>''
function selHTML(s,mv,rm,q){const items=mv.filter(m=>m.t==='sel'),dn=mv.find(m=>m.t==='seldone');let h='';
  const ch=(q.chosen||[]).map(v=>chipFor(v));h+=(ch.length?'<p class="chosen">Chosen: '+ch.join(' ')+'</p>':'')+(q.max!=null&&q.max<items.length+ch.length?'<p class="hint">Choose up to '+q.max+(q.min?' (at least '+q.min+')':'')+'.</p>':'');
  h+='<div class="opts">'+items.map(m=>optBtn(m,'',typeof m.v==='number'&&m.v<10000&&ownerOf(m.v)===s?'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(m.v,44).outerHTML+'</span>':'')).join('')+'</div>';
  if(dn)h+='<div class="btnrow"><button class="btn pri" data-a="mv" data-k="'+esc(dn.k)+'">'+esc(dn.label)+'</button></div>';return h}
function cardOwnerOK(id){const o=ownerOf(id);return o===vs()||G.pl[o]&&(G.reg.some(R=>R.up.includes(id)))}
function chipFor(v){try{if(typeof v==='number'&&v<10000)return '<span class="chp">'+esc(TB.cardName(G,v))+'</span>'}catch(e){}return '<span class="chp">'+esc(v)+'</span>'}
// ===================== part 4: hand, rivals, pop-ups, one-at-a-time cards =====================
const emb=(s,w)=>TBKit.token('influence',{faction:fk(s)},w||26).outerHTML;
function isPassing(){return !!(UI.card&&UI.card.kind==='pass')}
// ---------------------------------------------------------------- hand strip (compact fan; tap a card -> enlarged pop-up)
function renderHand(){const el=$('#handw');if(!el)return;const s=vs();
  if(!G||s<0||isPassing()||G.over){el.innerHTML='';el.hidden=true;return}
  el.hidden=false;const V=UI.V,P=V.pl[s];const ids=P.hand.filter(id=>id>=0).sort((a,b)=>cinfo(b).strength-cinfo(a).strength||a-b);
  const mv=G.q&&G.q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];const use=new Set();for(const m of mv){if(m.id!=null)use.add(m.id);if(m.v!=null&&typeof m.v==='number')use.add(m.v)}
  const W=Math.max(200,el.clientWidth||$('#dockbody').clientWidth||360)-8;const cw=UI.phone?(UI.land?50:(innerHeight<600?46:56)):66,ch=Math.round(cw*1.4308);
  const n=ids.length,step=n>1?Math.min(cw+6,(W-cw)/(n-1)):0;const tot=n>1?cw+step*(n-1):cw;const off=Math.max(0,(W-tot)/2);
  let h='<div class="hand-h"><span>Hand <b>'+ids.length+'</b>/'+P.hs+'</span><span>Deck '+P.deck.length+'</span><span>Discard '+P.disc.length+'</span>'+(P.lore?'<span>Lore '+P.lore+'</span>':'')+'</div>';
  h+='<div class="hand" role="list" aria-label="Your hand" style="height:'+(ch+14)+'px">';
  ids.forEach((id,i)=>{const on=UI.hand===id,pl=use.has(id);
    h+='<button class="hc'+(on?' on':'')+(pl?' pl':'')+(use.size&&!pl?' dim':'')+'" role="listitem" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" style="left:'+Math.round(off+i*step)+'px;width:'+cw+'px;height:'+ch+'px;z-index:'+(on?50:i+1)+'" aria-label="'+esc(cinfo(id).name)+', strength '+cinfo(id).strength+'">'+cardEl(id,cw).outerHTML+'</button>'});
  el.innerHTML=h+'</div>'}
// ---------------------------------------------------------------- rival chips
function renderRivals(){const el=$('#rivals');if(!el)return;const V=UI.V;const hot=UI.card&&UI.card.kind==='pass';
  const act=G.q?new Set(G.q.seats):new Set();const me=vs();
  const ordSeats=G.pl.map(p=>p.seat);
  el.innerHTML=ordSeats.map(s=>{const P=V.pl[s];const kfac=TBKit.FACTIONS[FK[P.fac]];const turn=act.has(s);
    const favs=V.fav.h===s?'<span class="rv-f" title="Holds the Kingdom\'s Favour ('+V.fav.u+' uses left)">'+ico('star')+'</span>':'';
    return '<button class="rv'+(s===me?' me':'')+(turn?' turn':'')+'" data-a="rival" data-s="'+s+'" style="--fc:'+kfac.main+'" aria-label="'+esc(P.name)+': '+P.inf+' influence, '+P.hand.length+' cards in hand. Tap for details">'+
      '<span class="rv-e">'+emb(s,26)+'</span><span class="rv-t"><b>'+esc(shortName(s).replace(' (you)',''))+(s===me&&(NET.on||humans().length===1)?' <u>you</u>':'')+'</b><small><i>'+P.inf+'</i> inf · '+P.hand.length+' cards</small></span>'+favs+'</button>'}).join('')}
// ---------------------------------------------------------------- pop-ups (live in the dock zone, never over the board)
function openPop(kind,arg){if(!G)return;UI.pop=kind;UI.popArg=arg||{};renderPop();applyHl();if(typeof sfx==='function')sfx('tap')}
function closePop(quiet){if(!UI.pop)return;UI.pop=null;UI.popArg=null;UI.hand=null;const p=$('#ppop');if(p){p.hidden=true;p.innerHTML=''}applyHl();if(!quiet)renderAll()}
function optsFor(s,id){if(s==null||s<0||!G.q||!G.q.seats.includes(s))return [];return legal(s).filter(m=>m.id===id||(typeof m.v==='number'&&m.v===id))}
function actLabel(m){if(m.t==='bid')return 'Bid with this card';if(m.t==='place')return 'Play face-down at '+REG[m.r];if(G.q.kind==='tie'&&m.id!=null)return 'Play face-down into the tied clash';if(m.t==='sel')return 'Choose this card';return m.label}
function popShell(title,body,cls){return '<div class="pp-h"><b>'+title+'</b><button class="pp-x" data-a="pclose" aria-label="Close">'+ico('x')+'</button></div><div class="pp-b '+(cls||'')+'">'+body+'</div>'}
function renderPop(){const el=$('#ppop');if(!el)return;
  if(!UI.pop||!G||(UI.card&&UI.card.kind!=='tip')){el.hidden=true;el.innerHTML='';return}
  const a=UI.popArg||{};let html='';
  try{switch(UI.pop){case 'card':html=popCard(a.id);break;case 'loc':html=popLoc(a.l);break;case 'region':html=popRegion(a.r);break;case 'rival':html=popRival(a.s);break;case 'kingdom':html=popKingdom();break;case 'kc':html=popKC(a.n);break;default:html=''}}catch(e){console.warn('pop',e.message);html=''}
  if(!html){el.hidden=true;return}
  const first=el.hidden;el.hidden=false;el.innerHTML=html;if(first)el.classList.add('in');else el.classList.remove('in');
  el.dataset.kind=UI.pop;
  sizePopCard()}
function sizePopCard(){const el=$('#ppop');const c=el&&el.querySelector('.pp-card');if(!c)return;const W=el.clientWidth,H=el.clientHeight;
  const w=Math.max(96,Math.min(260,W*.42,(H-150)/1.4308));c.innerHTML='';c.appendChild(c.dataset.kc!=null?kcEl(+c.dataset.kc,w):cardEl(+c.dataset.cid,w))}
function popCard(id){const s=vs();const i=cinfo(id);const mine=ownerOf(id)===s;const acts=mine?optsFor(s,id):[];const rec=mine&&UI._rec&&G.q?UI._rec:null;let h='';
  if(acts.length){h+='<div class="pp-act">';for(const m of acts.slice(0,10)){const isRec=rec&&rec.k===m.k;h+='<button class="btn'+(isRec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(actLabel(m))+(isRec?' (recommended)':'')+'</button>'}
    h+='</div>';if(rec&&acts.some(m=>m.k===rec.k))h+='<p class="why">'+ico('star')+'<span><b>Why:</b> '+esc(whyFor(s,rec))+'</span></p>';else if(rec&&G.q.kind==='bid')h+='<p class="why">'+ico('star')+'<span><b>Suggested instead:</b> '+esc(cinfo(rec.id).name)+'.</span></p>'}
  else if(mine)h+='<p class="hint">Nothing to do with this card right now.</p>';
  h+='<div class="pp-row"><div class="pp-card" data-cid="'+id+'" data-owner="'+ownerOf(id)+'"'+(mine?' data-up="1"':'')+'></div><div class="pp-info"><h4>'+esc(i.name)+'</h4>'+cardDetail(id)+'</div></div>';
  return popShell(esc(i.name),h,'pc-b')}
function popKC(n){const k=TB.kingdomInfo(n);let who='';for(const P of G.pl){P.ks.forEach((T,j)=>{if(T&&T.kc===n)who='Held by '+P.name+(T.occ!=null&&UI.V.pl[P.seat].ks[j].occ>=0&&false?'':'')+'.'});if(P.sup.includes(n))who='In '+P.name+'\'s Supply.'}
  if(G.road.includes(n))who='On the Great Road.';
  return popShell(esc(k.name),'<div class="pp-row"><div class="pp-card" data-kc="'+n+'"></div><div class="pp-info"><h4>'+esc(k.name)+'</h4><p class="cd-stat"><b>'+SUIT_N[k.suit]+' suit</b> · '+({board:'sits on your board',supply:'goes to your Supply',region:'placed on a region',loc:'placed on a location','none':'one-shot'}[k.place]||k.place)+'</p><p class="cd-tx">'+esc(k.text)+'</p><p class="hint">'+who+'</p></div></div>')}
function heraldChips(l){const o=G.pl.filter(p=>p.herald===l);return o.length?o.map(p=>'<span class="hchip" style="--fc:'+fcol(p.seat)+'">'+esc(shortName(p.seat))+'</span>').join(' '):'<em>none yet</em>'}
function popLoc(l){const s=vs();const L=DD.LOCS[l],V=UI.V;const q=G.q;let h='';
  h+='<p class="lc-r">'+esc(REG[l>>1])+' · reward <b>+'+L[2]+' Influence</b></p>';
  h+='<p class="lc-x">'+(L[3]?esc(L[3]):'Nothing else: this is the best plain Influence on the map.')+'</p>';
  h+='<p class="lc-h"><b>Heralds here:</b> '+heraldChips(l)+'</p>';
  const mk=V.pl.map((p,i)=>p.mk[l]?esc(shortName(i))+' '+p.mk[l]:'').filter(Boolean);if(mk.length)h+='<p class="lc-h"><b>Whisper markers:</b> '+mk.join(', ')+'</p>';
  if(V.loc[l].kc.length)h+='<p class="lc-h"><b>Kingdom Cards here:</b> '+V.loc[l].kc.map(k=>esc(TB.kingdomInfo(k.n).name)+' ('+esc(nameOf(k.o))+')').join(', ')+'</p>';
  if(l===2)h+='<p class="lc-h"><b>Favour:</b> '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' holds it ('+V.fav.u+' uses left)':'on the board')+'</p>';
  const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];
  if(q&&q.kind==='herald'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Place my Herald here'+(rec?' (recommended)':'')+'</button></div>';h+='<p class="why">'+ico('star')+'<span><b>'+(rec?'Why this one':'Think about it')+':</b> '+esc(whyFor(s,m))+'</span></p>'}}
  else if(q&&q.kind==='location'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Claim '+esc(LOCN[l])+(rec?' (recommended)':'')+'</button></div>'}}
  else if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===l>>1)){h+='<p class="lc-h"><b>Play a face-down card in '+esc(REG[l>>1])+':</b></p>'+cardPicker(s,mv.filter(x=>x.r===l>>1||q.kind==='tie'))}
  return popShell(esc(LOCN[l]),h,'loc-b')}
function cardPicker(s,mv){const ids=[...new Set(mv.filter(m=>m.id!=null).map(m=>m.id))];return '<div class="picker">'+ids.map(id=>'<button class="hc pk" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" aria-label="'+esc(cinfo(id).name)+'">'+cardEl(id,52).outerHTML+'</button>').join('')+'</div>'}
function popRegion(r){const s=vs(),V=UI.V,q=G.q;let h='';
  h+='<p class="lc-r">Locations: <button class="lk" data-a="loc" data-l="'+2*r+'">'+esc(LOCN[2*r])+'</button> and <button class="lk" data-a="loc" data-l="'+(2*r+1)+'">'+esc(LOCN[2*r+1])+'</button></p>';
  const ci=V.cord.indexOf(r);h+='<p class="lc-h">'+(ci>=0?'Clash marker '+['I','II','III'][ci]+(V.reg[r].done?' (resolved)':''):'Clash order not set yet')+'</p>';
  h+='<div class="rg">';for(const p of V.pl){const t=p.seat;const up=V.reg[r].up.filter(id=>ownerOf(id)===t),dn=V.reg[r].down.filter(id=>ownerOf(id)===t);const sp=p.supp.r[r]+p.supp.x[r];
    h+='<div class="rg-r" style="--fc:'+fcol(t)+'"><b>'+esc(shortName(t))+'</b><span class="rg-c">'+up.map(id=>'<span class="th">'+cardEl(id,40).outerHTML+'</span>').join('')+
      dn.map(id=>id>=0?'<span class="th dn"'+(t===s?' data-owner="'+t+'" data-up="1"':'')+' title="A face-down card you may see">'+cardEl(id,40).outerHTML+'</span>':'<span class="th dn" title="Face-down card">'+TBKit.cardBack(FK[p.fac],40).outerHTML+'</span>').join('')+(!up.length&&!dn.length?'<em>no cards</em>':'')+'</span>'+(sp?'<span class="rg-s">'+sp+' supporter'+(sp>1?'s':'')+'</span>':'')+'</div>'}
  h+='</div>';const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];
  if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===r||q.kind==='tie'))h+='<p class="lc-h"><b>Play a face-down card here:</b></p>'+cardPicker(s,mv.filter(x=>x.r===r||q.kind==='tie'));
  return popShell(esc(REG[r]),h,'reg-b')}
function popRival(s){const V=UI.V,P=V.pl[s],f=TBKit.FACTIONS[FK[P.fac]];let h='';
  h+='<div class="rv-top" style="--fc:'+f.main+'"><span>'+emb(s,40)+'</span><div><b>'+esc(f.name)+'</b><br><small>'+esc(DD.FBLURB[P.fac])+'</small></div></div>';
  h+='<ul class="kv"><li><b>Influence</b> '+P.inf+'</li><li><b>Cards in hand</b> '+P.hand.length+' (limit '+P.hs+')</li><li><b>Deck / Discard / Lost</b> '+P.deck.length+' / '+P.disc.length+' / '+V.lost.filter(id=>ownerOf(id)===s).length+'</li><li><b>Lore</b> '+P.lore+'</li><li><b>Supporters</b> '+P.supp.b+' at home, '+(P.supp.r.reduce((a,b)=>a+b,0)+P.supp.x.reduce((a,b)=>a+b,0))+' on the map, '+P.supp.l+' lost</li>'+(V.fav.h===s?'<li><b>Kingdom\'s Favour</b> '+V.fav.u+' uses left</li>':'')+'</ul>';
  const ks=P.ks.map((T,j)=>T?'<button class="lk" data-a="kc" data-n="'+T.kc+'">'+esc(TB.kingdomInfo(T.kc).name)+'</button>':'').filter(Boolean).concat(P.sup.map(n=>'<button class="lk" data-a="kc" data-n="'+n+'">'+esc(TB.kingdomInfo(n).name)+' (Supply)</button>'));
  h+='<p class="lc-h"><b>Kingdom Cards:</b> '+(ks.join(', ')||'<em>none</em>')+'</p>';
  h+='<p class="lc-h"><b>Councils (votes):</b> '+DD.COUNCILS.map(c=>SUIT_N[c]+' '+TB.votes(G,s,c)).join(' · ')+'</p>';
  h+='<p class="lc-h"><b>Tactics:</b> '+DD.TACTICS[P.fac].map((t,i)=>'<span class="tac'+(P.tac[i].burn?' burn':P.tac[i].ex?' ex':'')+'" title="'+esc(t.txt)+'">'+esc(t.nm)+(P.tac[i].burn?' (burned)':P.tac[i].ex?' (used)':'')+'</span>').join(' ')+'</p>';
  h+='<p class="lc-h"><b>Site of Power:</b> '+(P.site.length?P.site.map(id=>esc(TB.cardName(G,id))+' ('+cinfo(id).cost+')').join(', '):'<em>empty</em>')+(P.hq.length?'. HQ: '+P.hq.map(id=>esc(TB.cardName(G,id))).join(', '):'')+'</p>';
  h+='<p class="lc-h"><b>Favour action:</b> '+esc(DD.FAVOUR[P.fac].nm)+': '+esc(DD.FAVOUR[P.fac].txt)+'</p>';
  return popShell(esc(P.name),h,'rv-b')}
function popKingdom(){const V=UI.V;let h='';
  h+='<h5>The Great Road</h5><div class="road4">'+V.road.map(n=>n?'<button class="kcth" data-a="kc" data-n="'+n+'" aria-label="'+esc(TB.kingdomInfo(n).name)+'">'+kcEl(n,52).outerHTML+'</button>':'<span class="kcth empty"></span>').join('')+'</div><p class="hint">Kingdom Card deck: '+V.kdeck.length+' left. Tap a card to read it.</p>';
  h+='<h5>Councils</h5>';for(const c of DD.COUNCILS){const ids=V.council[c];h+='<p class="lc-h"><b>'+esc(DD.COUNCIL_NAMES[c])+'</b>: '+(ids.length?ids.map(id=>esc(TB.cardName(G,id))+' ('+esc(shortName(ownerOf(id)))+', '+cinfo(id).votes+')').join(', '):'<em>empty</em>')+'</p><p class="small">'+esc(DD.COUNCIL_TXT[c])+'</p>'}
  h+='<h5>Favour and order</h5><p class="lc-h">Favour: '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' ('+V.fav.u+' uses left)':'on the Gleaning Meadow')+'</p><p class="lc-h">Order this round: '+V.order.map((s,i)=>(i+1)+'. '+esc(shortName(s))).join(', ')+'</p><p class="lc-h">Lost Pile: '+V.lost.length+' card'+(V.lost.length===1?'':'s')+'.</p>';
  return popShell('The Kingdom',h,'kg-b')}
// ---------------------------------------------------------------- the one card (events, pass the device, coach tips, game over)
function shouldShowEvent(ev){if(ev.t==='clash')return true;if(ev.t==='bids')return true;if(ev.t==='summary')return true;return false}
function showEvent(ev){UI.card={kind:'event',ev};if(ev.t==='clash'){UI.noAnim=true}}
function showOver(){if(UI.card&&UI.card.kind==='over')return;UI.card={kind:'over'};clearSave()}
const TIPS={bid:['Bids','Each round starts with a secret bid. Tap a hand card for its details, or use the suggested button. The strongest bid chooses first. Whatever Kingdom Card you take sits on your board with your bid card tucked under it.'],
  herald:['Heralds','Your Herald is public. Tap a location on the map to read its reward. Winning there pays you and steals from every rival Herald standing on it. A bluff is fine: place it where you do NOT plan to win, or where you do.'],
  place:['Face-down cards','Place one card next to each of the three regions. Nobody sees them until the clash. Put big cards where the prize matters and spare cards elsewhere.'],
  menu:['Actions','This list shows what your cards and Kingdom Cards allow right now. Sending Supporters adds +1 Strength each in a region (only the first clash there). Finish with the last button.'],
  clashOrder:['Clash order','The player furthest behind sets the order of the three clashes. Think about which region your rivals are weakest in.'],
  location:['Winning','The winner claims one of the region\'s two locations: its Influence plus a bonus effect. A Herald there is a swing of +1 for you and -1 for each rival Herald.'],
  bidRes:['Your bid','Take a Kingdom Card from the Great Road, steal one a rival holds (you need a strictly higher bid than their occupying card) or take your card back.']};
function maybeTip(){if(UI.guide!=='full'||!G.q)return false;const k=G.q.kind;if(UI.tip[k]||!TIPS[k])return false;UI.tip[k]=1;UI.card={kind:'tip',k};return true}
function renderCard(){const el=$('#pc');if(!el)return;const c=UI.card;
  if(!c){el.hidden=true;el.innerHTML='';UI._cardKey=null;return}
  const key=JSON.stringify(c.kind==='event'?[c.ev.t,c.ev.r,c.ev.n,c.ev.round]:[c.kind,c.seat,c.k]);
  if(UI._cardKey===key&&!el.hidden)return;UI._cardKey=key;
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');el.dataset.kind=c.kind==='event'?c.ev.t:c.kind;
  let h='';
  if(c.kind==='pass'){const s=c.seat;h='<div class="cd cd-pass" style="--fc:'+fcol(s)+'"><div class="cd-e">'+emb(s,56)+'</div><h3>Pass the device to '+esc(nameOf(s))+'</h3><p>Everyone else look away. Your hand and face-down cards appear when you tap the button.</p><button class="btn pri big" data-a="take" data-s="'+s+'">I am '+esc(shortName(s))+'. Show my cards</button></div>'}
  else if(c.kind==='tip'){const t=TIPS[c.k];h='<div class="cd cd-tip"><h3>'+esc(t[0])+'</h3><p>'+esc(t[1])+'</p><div class="btnrow"><button class="btn pri" data-a="tipok">Got it</button><button class="btn" data-a="tipoff">Hide tips</button></div></div>'}
  else if(c.kind==='over'){h=overHTML()}
  else if(c.kind==='event')h=eventHTML(c.ev);
  el.innerHTML=h;
  if(c.kind==='event'&&c.ev.t==='clash')playClash(c.ev,el);
  const b=el.querySelector('.btn.pri');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function eventHTML(ev){
  if(ev.t==='bids'){const rows=ev.bids.slice().sort((a,b)=>b.str-a.str||ev.order.indexOf(a.seat)-ev.order.indexOf(b.seat));
    return '<div class="cd cd-bids"><h3>Bids revealed</h3><p class="sub">Highest bid chooses first.</p><div class="bidrow">'+rows.map((b,i)=>'<div class="bd" style="--fc:'+fcol(b.seat)+'"><span class="bd-n">'+(i+1)+'</span><span class="bd-c">'+TBKit.card(cardSpec(b.id),UI.phone?52:64).outerHTML+'</span><span class="bd-t"><b>'+esc(shortName(b.seat))+'</b><small>'+esc(TB.cardName(G,b.id))+'</small><i>'+b.str+'</i></span></div>').join('')+'</div><button class="btn pri" data-a="evok">Continue</button></div>'}
  if(ev.t==='clash'){const w=ev.winner,tie=w<0;const names=ev.parts.map(s=>'<b>'+esc(shortName(s))+'</b> '+ev.tot[s]).join(' · ');
    return '<div class="cd cd-clash"><h3>Clash '+(ev.idx>=0?['I','II','III'][ev.idx]:'')+': '+esc(REG[ev.r])+(ev.n>1?' (new clash)':'')+'</h3><div class="cl-panel" id="clp"></div><p class="cl-res" id="clres" hidden>'+(tie?'Tied: '+names:'<b>'+esc(shortName(w))+'</b> wins, '+names)+'</p><ul class="cl-log" id="cllog" hidden>'+ev.logs.filter(t=>!/^(.* reveals |Strength in |Clash )/.test(t)).slice(0,9).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><div class="cl-inf" id="clinf" hidden>'+infChips(ev.inf0,ev.inf1)+'</div><button class="btn pri" data-a="evok" id="clok" hidden>Continue</button></div>'}
  if(ev.t==='summary'){return '<div class="cd cd-sum"><h3>End of round '+ev.round+(ev.last?' (the last)':'')+'</h3><table class="sumt"><thead><tr><th></th><th>This round</th><th>Total</th></tr></thead><tbody>'+ev.inf1.map((v,s)=>'<tr style="--fc:'+fcol(s)+'"><td><b>'+esc(shortName(s))+'</b></td><td>'+sgn(v-ev.inf0[s])+'</td><td><b>'+v+'</b></td></tr>').join('')+'</tbody></table>'+(ev.warns.length?'<ul class="cl-log warn">'+ev.warns.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+'<p class="sub">'+(ev.last?'The final count follows.':'Next round the player with the most Influence picks first; Heralds go home and Supporters are lost.')+'</p><button class="btn pri" data-a="evok">'+(ev.last?'See the result':'Next round')+'</button></div>'}
  return ''}
function infChips(a,b){return a.map((v,s)=>b[s]!==v?'<span style="--fc:'+fcol(s)+'">'+esc(shortName(s))+' '+sgn(b[s]-v)+'</span>':'').join('')}
function playClash(ev,root){const panel=root.querySelector('#clp');if(!panel)return;const w=ev.winner;
  const items=ev.parts.map(s=>{const ids=(ev.cardsF&&ev.cardsF[s])||ev.cards[s]||[];const best=ids.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength)[0];
    const spec=best!=null?cardSpec(best):{faction:FK[G.pl[s].fac],title:'Supporters only',value:0,type:'ploy',art:'banner',text:'No cards here: only Supporters count.'};
    return {faction:FK[G.pl[s].fac],name:shortName(s)+(ids.length>1?' (+'+(ids.length-1)+')':'')+(ev.supp[s]?' +'+ev.supp[s]+' sup.':''),card:spec,strength:ev.tot[s],winner:w===s}});
  const sz=Math.max(70,Math.min(110,Math.floor((root.clientWidth-30)/Math.max(2,items.length))-14,UI.land?84:110));
  const cp=TBKit.clashPanel(panel,items,{size:sz,tie:w<0});UI._cp=cp;
  const fin=()=>{['#clres','#cllog','#clinf','#clok'].forEach(q=>{const e=root.querySelector(q);if(e)e.hidden=false});UI.clashRes[ev.r]={winner:w,tot:ev.tot};
    const b=root.querySelector('#clok');if(b)try{b.focus({preventScroll:true})}catch(e){}if(typeof sfx==='function')sfx(w<0?'tie':'win')};
  if(!ANIM){cp.el.querySelectorAll('.tb-flipcard').forEach(f=>f.classList.add('tb-up'));cp.el.querySelectorAll('.tb-clash-col').forEach(c=>c.classList.add('tb-shown'));fin();return}
  mapReveal(ev);
  setTimeout(()=>{const key=UI._cardKey;cp.play().then(()=>{if(UI._cardKey===key)fin()})},350)}
function overHTML(){const o=G.over,sc=TB.scores(G);const rk=o.ranking;const win=o.winner;
  return '<div class="cd cd-over"><h3>'+(NET.on?(win===vs()?'You win the throne!':esc(nameOf(win))+' takes the throne'):humans().length&&!G.pl[win].ai&&humans().length===1?'You win the throne!':esc(nameOf(win))+' takes the throne')+'</h3><p class="sub">'+esc(DD.FNAME[G.pl[win].fac])+' ends with <b>'+G.pl[win].inf+'</b> Influence'+(o.tieBreak?' (tie broken by '+(o.tieBreak==='favour'?'the Kingdom\'s Favour':'turn order')+')':'')+'.</p><ol class="rank">'+rk.map((s,i)=>'<li style="--fc:'+fcol(s)+'"><b>'+esc(nameOf(s))+'</b><span>'+G.pl[s].inf+(o.bonus&&o.bonus[s]?' <small>(includes +'+o.bonus[s]+' from emptying the Site of Power)</small>':'')+'</span></li>').join('')+'</ol>'+(NET.on?(isHost()?'<div class="btnrow"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="netopen">Lobby</button></div>':'<p class="sub">The host can start another game.</p><div class="btnrow"><button class="btn" data-a="netleave">Leave</button></div>'):'<div class="btnrow"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="menu">Main menu</button></div>')+'</div>'}
// ===================== part 5: render loop, clicks, drawers (rules, log, board, menu), start screen =====================
function renderAll(){if(!G||!UI.started)return;
  try{UI.V=isClient()?G:TB.stripView(G,isPassing()?-1:vs())}catch(e){console.error('view '+e.message);return}  // a client's G is already its own stripped copy
  if(isPassing()){if(GX.open)GX.close();const bb=$('#boardbody');if(bb)bb.innerHTML='';if(UI.pop)closePop(true)}
  if(!(UI.card&&UI.card.kind==='event'))renderMap();else if(!MAP.m)renderMap();
  renderBar();renderRoad();renderMain();renderHand();renderRivals();renderCard();renderPop();updateLive();
  document.documentElement.dataset.step=String(roadIdx());
  if(typeof phoneRefresh==='function')phoneRefresh();
  netAfter();
  const lb=$('#logbody');if(lb&&GX.open==='logd')renderLog()}
function updateLive(){const l=$('#live');if(!l)return;const last=G.log[G.log.length-1];if(last&&UI._liveN!==last.i){UI._liveN=last.i;l.textContent=last.t}}
// ---------------------------------------------------------------- clicks
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a]');
  if(!t){ // tap on the empty board closes a pop-up
    if(UI.pop&&e.target.closest&&e.target.closest('#mapwrap')&&!e.target.closest('.tb-loc')){closePop();e.stopPropagation()}return}
  const a=t.dataset.a;
  if(netClick(a,t))return;
  switch(a){
   case 'mv':{if(!humanMove(t.dataset.k)){renderAll()}break}
   case 'hand':{const id=+t.dataset.id;if(UI.pop==='card'&&UI.popArg.id===id&&!t.closest('#ppop')){closePop();break}UI.hand=id;openPop('card',{id});renderHand();break}
   case 'loc':openPop('loc',{l:+t.dataset.l});break;
   case 'rival':openPop('rival',{s:+t.dataset.s});break;
   case 'kc':openPop('kc',{n:+t.dataset.n});break;
   case 'road4':openPop('kingdom');break;
   case 'pclose':closePop();break;
   case 'take':{const s=+t.dataset.s;UI.holder=s;UI.passed=s;UI.card=null;UI._cardKey=null;UI.pop=null;pump();break}
   case 'evok':{UI.card=null;UI._cardKey=null;UI.noAnim=false;if(UI._cp)UI._cp=null;UI.mapReset=false;MAP.slotDirty=true;pump();break}
   case 'tipok':UI.card=null;UI._cardKey=null;pump();break;
   case 'tipoff':UI.guide='light';UI.card=null;UI._cardKey=null;pump();break;
   case 'again':{clearSave();const c=UI.cfg;startFromCfg(c);break}
   case 'menu':showStart();break;
   case 'wpause':UI.watchPaused=!UI.watchPaused;if(!UI.watchPaused)pump();else renderAll();break;
   case 'wstep':{if(UI.mode==='watch'&&G.q){const w=whoActs();if(w.ai.length){aiStep(w)}}pump();break}
   case 'wspeed':UI.speed=UI.speed>=4?1:UI.speed*2;renderAll();break;
   // start screen
   case 'mode':sv.mode=t.dataset.v;renderStart();break;
   case 'np':sv.np=+t.dataset.v;renderStart();break;
   case 'fac':sv.faction=t.dataset.v;renderStart();break;
   case 'len':sv.length=t.dataset.v;renderStart();break;
   case 'gd':sv.guide=t.dataset.v;renderStart();break;
   case 'start':startFromSetup();break;
   case 'guided':newGame('guided');break;
   case 'cont':{const s=loadSave();if(s){hideStart();resumeGame(s);afterStart()}break}
   case 'rules':GX.show('rulesd');break;
   case 'gdset':UI.guide=t.dataset.v;renderMenu();break;
   case 'snd':UI.sound=!UI.sound;try{localStorage.setItem('tb_snd',UI.sound?'1':'0')}catch(x){}if(window.GA)GA.setSfx(UI.sound);renderMenu();break;
   case 'mus':UI.music=!UI.music;try{localStorage.setItem('tb_mus',UI.music?'1':'0')}catch(x){}if(window.GA)GA.setMusic(UI.music);renderMenu();break;
   case 'gfx':UI.lowGfx=!UI.lowGfx;try{localStorage.setItem('tb_gfx',UI.lowGfx?'low':'high')}catch(x){}UI.mapReset=true;renderAll();renderMenu();break;
   case 'savenow':saveGame();toast('Saved. You can continue from the start screen.');break;
   case 'newgame':GX.close();showStart();break;
   case 'spd':UI.speed=+t.dataset.v;renderMenu();break;
   case 'logall':UI.logAll=!UI.logAll;renderLog();break;
  }});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.pop&&!GX.open){closePop();e.preventDefault()}});
function toast(t){UI.toast=t;const l=$('#live');if(l)l.textContent=t}
// ---------------------------------------------------------------- start screen
const sv={mode:'me',np:3,faction:'nobility',length:'standard',guide:'full',levels:['normal','normal','normal','normal']};
function showStart(){$('#start').hidden=false;document.body.classList.add('in-start');renderStart();const f=$('#start [data-a=guided]');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function hideStart(){$('#start').hidden=true;document.body.classList.remove('in-start')}
function renderStart(){const el=$('#start');if(!el||el.hidden)return;const sav=loadSave();
  const lvl=(i)=>'<select class="sel" data-a="lv" data-i="'+i+'" aria-label="Computer level, seat '+(i+1)+'">'+['easy','normal','hard'].map(l=>'<option value="'+l+'"'+(sv.levels[i]===l?' selected':'')+'>'+l[0].toUpperCase()+l.slice(1)+'</option>').join('')+'</select>';
  const ONL=NET.on&&isHost(),plan=ONL?netPlan():null;const nSeats=ONL?plan.np:sv.np;let seats='';
  const fac=FIDS.slice();const mine=sv.faction;const rest=fac.filter(f=>f!==mine);
  for(let i=0;i<nSeats;i++){const pm=ONL?'me':sv.mode;const f=pm==='me'?(i===0?mine:rest[i-1]):FIDS[i];const k=TBKit.FACTIONS[FK[f]];const human=ONL?i<plan.hum.length:(sv.mode==='hot'||(sv.mode==='me'&&i===0));
    seats+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(ONL?'Online: '+esc(plan.hum[i].nm)+(i===0?' (you)':''):sv.mode==='hot'?'Player '+(i+1):'You'):'Computer')+'</small></span>'+(human?'':lvl(i))+'</div>'}
  el.innerHTML='<div class="st-box"><h1 class="st-t">The Thornbound Throne</h1><p class="st-s">An area-control card game for 2 to 4. Win clashes in three regions, place your Herald where you will be, and hold the most Influence when the last round ends.</p>'+
   (ONL?'':'<div class="st-bt"><button class="btn pri big" data-a="guided">Guided first game</button>'+(sav?'<button class="btn big" data-a="cont">Continue saved game (round '+sav.G.round+')</button>':'')+'</div>')+onlineBlock()+
   '<h2>'+(ONL?'Game setup':'Or set up a game')+'</h2>'+(ONL?'':'<div class="seg" role="radiogroup" aria-label="Mode">'+[['me','Play the computer'],['hot','Hot-seat (pass the device)'],['watch','Watch computers']].map(([v,l])=>'<button role="radio" aria-checked="'+(sv.mode===v)+'" class="'+(sv.mode===v?'on':'')+'" data-a="mode" data-v="'+v+'" data-start="'+v+'">'+l+'</button>').join('')+'</div>')+
   '<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
   ((sv.mode==='me'||ONL)?'<div class="row"><span>Your side</span><div class="seg fseg">'+FIDS.map(f=>{const k=TBKit.FACTIONS[FK[f]];return '<button class="'+(sv.faction===f?'on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'">'+esc(k.short)+'</button>'}).join('')+'</div></div>':'')+
   '<div class="seats">'+seats+'</div><div class="row"><span>Guide</span><div class="seg">'+[['full','Full tips'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
   '<div class="st-bt"><button class="btn pri big" data-a="start" data-start="go">'+(ONL?'Start online game':'Start game')+'</button>'+(NET.on&&G&&UI.started?'<button class="btn big" data-a="netback">Back to the game</button>':'')+'<button class="btn big" data-a="rules">How to play</button></div><p class="st-c">Original art drawn in code. Fonts: Cinzel and EB Garamond (SIL OFL). Based on the mechanics of a published game; names and text are our own.</p></div>';
  $$('#start [data-a=lv]').forEach(s=>s.addEventListener('change',()=>{sv.levels[+s.dataset.i]=s.value}))}
function startFromSetup(){hideStart();const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv,guide:sv.guide};
  // seat i (i>0) uses level[i]; the human seat 0 ignores its slot
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
function startFromCfg(c){hideStart();const o={np:c.np,length:c.length,faction:c.faction,levels:c.levels,guide:c.guide,seatFactions:c.seats.map(s=>s.faction),humanSeats:c.humanSeats};
  if(c.guided)newGame('guided',o);else newGame(c.mode==='watch'?'ai':c.mode,o)}
function afterStart(){closePop(true);GX.close();UI.mapReset=true;renderAll();pump()}
// ---------------------------------------------------------------- drawers
function renderLog(){const el=$('#logbody');if(!el||!G)return;const L=G.log.slice().reverse();let h='<p class="small"><button class="btn" data-a="logall">'+(UI.logAll?'Show key events only':'Show everything')+'</button></p><ol class="log">';
  let r=-1;for(const e of L){if(!UI.logAll&&e.c!=='big'&&e.c!=='warn')continue;h+='<li class="'+(e.c||'')+'"><i style="background:'+(e.s>=0?fcol(e.s):'#777')+'"></i>'+esc(e.t)+'</li>'}
  el.innerHTML=h+'</ol>'}
function renderMenu(){const el=$('#setbody');if(!el)return;
  const seg=(a,cur,opts)=>'<div class="seg">'+opts.map(([v,l])=>'<button class="'+(String(cur)===String(v)?'on':'')+'" data-a="'+a+'" data-v="'+v+'">'+l+'</button>').join('')+'</div>';
  el.innerHTML=(NET.on?'<div class="mrow"><button class="btn pri" data-a="netopen">Online lobby</button>'+(isHost()?'<button class="btn" data-a="newgame">Change setup</button>':'')+'<button class="btn" data-a="netleave">Leave the room</button></div>':'<div class="mrow"><button class="btn pri" data-a="newgame">New game / main menu</button><button class="btn" data-a="savenow">Save now</button></div>')+
   '<div class="mrow"><span>Guide</span>'+seg('gdset',UI.guide,[['full','Full tips'],['light','Light'],['off','Off']])+'</div>'+
   '<div class="mrow"><span>Computer speed</span>'+seg('spd',UI.speed,[[1,'x1'],[2,'x2'],[4,'x4']])+'</div>'+
   '<div class="mrow"><span>Sound</span><button class="btn" data-a="snd" aria-pressed="'+UI.sound+'">'+(UI.sound?'On':'Off')+'</button><span>Music</span><button class="btn" data-a="mus" aria-pressed="'+UI.music+'">'+(UI.music?'On':'Off')+'</button></div>'+
   '<div class="mrow"><span>Graphics</span><button class="btn" data-a="gfx" aria-pressed="'+!!UI.lowGfx+'">'+(UI.lowGfx?'Low (fast)':'High')+'</button>'+(window.PerfHUD?PerfHUD.buttonsHTML('btn'):'')+'</div>'+
   '<h4>Credits</h4><p class="small">Art, map, cards and icons are original and drawn procedurally. Fonts: Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1. The game rules follow a published game family; every name and text here is our own wording. Sound: placeholder synthesised tones.</p>'}
function renderBoardDrawer(){const el=$('#boardbody');if(!el||!G)return;const s=vs()>=0?vs():0;UI.V=UI.V||TB.stripView(G,vs());
  const P=UI.V.pl[s];let h=popRival(s).replace(/^<div class="pp-h">.*?<\/div><div class="pp-b[^"]*">/,'<div>');h=h.replace(/<\/div>$/,'');
  h+='<h5>Site of Power</h5><div class="piles">'+P.site.map(id=>'<div class="sitec"><button class="hc pk" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1">'+cardEl(id,64).outerHTML+'</button><small>cost '+cinfo(id).cost+'</small></div>').join('')+'</div>';
  h+='<h5>Discard pile ('+P.disc.length+')</h5><div class="piles">'+P.disc.map(id=>'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  const lost=UI.V.lost;h+='<h5>Lost Pile ('+lost.length+', shared)</h5><div class="piles">'+lost.map(id=>'<span class="th">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  el.innerHTML=h}
const RULES_HTML=`<div class="rules">
<h3>The goal</h3><p>You lead one of four factions competing for the throne. The game lasts a fixed number of rounds (4, 5 or 6). When the last round ends, the player with the most <b>Influence</b> wins. Ties go to whoever holds the Kingdom's Favour, then to the better place on the Order Track.</p>
<h3>How a round goes</h3><ol class="rl">
<li><b>Start of the year.</b> Everyone refills their hand to their hand size. Players are ranked by Influence: the leader acts first.</li>
<li><b>Bids.</b> Everyone secretly picks one card as a bid. Its printed Strength is the bid. Highest first, each player may take a Kingdom Card from the Great Road, steal one from a rival whose occupying card is strictly weaker than their bid, or take their bid card back. A Kingdom Card you take sits on your board (at most two) with your bid card tucked under it.</li>
<li><b>Heralds.</b> In turn order each player puts their one Herald on any location. It is public, so it can be a bluff.</li>
<li><b>Face-down cards.</b> Everyone secretly plays one card next to each of the three regions. With fewer than three cards you place them all before the others.</li>
<li><b>Spring actions.</b> In turn order you may use Spring abilities. The universal one is sending Supporters from your board to a region: each adds 1 Strength in the first clash you fight there.</li>
<li><b>Summer: the clashes.</b> The player in last place sets the order of the three regions. For each region: flip the cards, use Day abilities in turn order (Ambush adds a face-down card from your hand, Retreat pulls cards back, Flank moves a card to another unresolved region), then Night effects (Deadly eliminates every opposing active card; an eliminated card goes to the shared Lost Pile unless it is Resilient or Invulnerable). Add up Strength: cards plus Supporters plus bonuses. Highest total wins. A tie lets the tied players each play one more card face-down or pass; if nobody plays, nobody wins.</li>
<li><b>Winning a clash.</b> The winner picks one of the region's two locations and gains its Influence and its bonus effect. If their Herald is on that location they also gain 1 Influence and steal 1 from every rival Herald standing there.</li>
<li><b>Autumn.</b> Once each you may <b>Govern</b> (move a hand card that has votes into one of three Councils) and <b>Journey</b> (send a hand card that shows Lore away, gain that much Lore, and spend Lore on your faction's Site of Power cards). Other Autumn abilities such as Rally and Deploy also work now.</li>
<li><b>Winter.</b> Heralds go home. Supporters on the map go to the Lost Pile. Every active card goes to its owner's discard pile, except cards that carry Influence tokens, which lose one token and stay.</li>
</ol>
<h3>Locations</h3><ul><li><b>Spire Court</b> +1 and Govern with a card from hand or the table (every other card in that Council is discarded).</li><li><b>Thornwild</b> +1 and Journey.</li><li><b>Gleaning Meadow</b> +1 and claim the Kingdom's Favour.</li><li><b>Cairn Field</b> +2, nothing else.</li><li><b>Moss Altar</b> +1 and put up to three cards at the bottom of your deck.</li><li><b>Ossuary</b> +1, reshuffle your discard pile and draw up to three from it.</li></ul>
<h3>Councils</h3><p>Cards with votes go into Councils. <b>Coin</b>: when you claim a Herald reward you may remove your cards there for extra Influence equal to their votes. <b>Whispers</b>: in Autumn spread markers on locations; four on one location claims its bonus effect. <b>Pledges</b>: in Autumn bring Supporters back from the map or the Lost Pile, one per vote, and one more for the strictly largest voter.</p>
<h3>Attrition</h3><p>If you must draw and your deck is empty, your discard pile becomes your new deck and your hand size drops by one (never below 3, never above 8). A short game of 4 or 5 rounds usually hits this around round 3.</p>
<h3>The Kingdom's Favour</h3><p>A disc with three uses. Claim it at the Gleaning Meadow. While you hold it you may use your faction's Favour action; each use spends one of three charges.</p>
<h3>Reading your cards</h3><p>Top left: Strength. Top right: the Lore cost (Site of Power cards only). Bottom line: votes and lore. Invulnerable cards cannot be eliminated, Resilient cards go to the discard instead of the Lost Pile, Pathfinder cards go to the discard when used for a Journey.</p>
<h3>On this screen</h3><p>The map is the game. Tap a location or a region's card slots for details; tap the throne for the Great Road and Councils. Tap a card in your hand for a large view and its actions. The step list under the map always shows where you are in the round, and the highlighted button is the recommendation of a strong computer player.</p>
</div>`;
function setupDrawers(){
  GX.drawer('rulesd','How to play',(()=>{const d=document.createElement('div');d.innerHTML=RULES_HTML;return d})(),true);
  GX.drawer('logd','Log',(()=>{const d=document.createElement('div');d.id='logbody';return d})());
  GX.drawer('boardd','My board and piles',(()=>{const d=document.createElement('div');d.id='boardbody';return d})());
  GX.drawer('setd','Menu',(()=>{const d=document.createElement('div');d.id='setbody';return d})());
  GX.onShow=id=>{if(id==='logd')renderLog();if(id==='setd')renderMenu();if(id==='boardd')renderBoardDrawer()}}
// ===================== part 6: sound, phone layout, boot, test hooks =====================
const SFXMAP={tap:'click',place:'place',flip:'flip',clash:'clash',win:'win',tie:'clash',inf:'influence',herald:'herald',bid:'bid',bell:'bell',fanfare:'fanfare',lose:'lose',err:'error'};
let _ac=null;
function synth(name){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;_ac=_ac||new AC();const c=_ac,o=c.createOscillator(),g=c.createGain();const f={tap:520,place:180,flip:400,clash:120,win:660,tie:300,inf:880,herald:260,bid:440,bell:330,fanfare:550,lose:150,err:100}[name]||400;
  o.frequency.value=f;o.type=name==='clash'?'sawtooth':'triangle';g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.18);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.2)}catch(e){}}
function sfx(name){if(!UI.sound)return;const n=SFXMAP[name]||name;try{if(window.GA&&GA.has(n)){GA.play(n,{duck:['win','fanfare','clash','bell'].includes(n)});return}}catch(e){}synth(name)}
let _lastInf=null;
function snd(mv,res){if(!mv)return;const t=mv.t,k=G&&G.q?G.q.kind:'';
  if(t==='bid')sfx('bid');else if(t==='place')sfx('place');else if(t==='pick'&&mv.loc!=null&&k==='herald')sfx('herald');else if(t==='take'||t==='steal')sfx('bid');else sfx('tap');
  try{const inf=G.pl.reduce((a,p)=>a+p.inf,0);if(_lastInf!=null&&inf>_lastInf)setTimeout(()=>sfx('inf'),200);_lastInf=inf;if(G.over)setTimeout(()=>sfx(G.pl[G.over.winner].ai?'lose':'fanfare'),300)}catch(e){}}
function musicFor(){try{if(!window.GA||!UI.music)return;GA.music(G&&G.round>=G.rounds?'tense':'main',{fade:1.5})}catch(e){}}
// ---------------------------------------------------------------- phone mode
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phApply(){const was=UI.phone;const on=phDetect();const root=document.documentElement;
  UI.phone=on;UI.land=innerWidth>innerHeight;root.classList.toggle('ph',on);root.classList.toggle('ph-p',on&&!UI.land);root.classList.toggle('ph-l',on&&UI.land);
  if(on){const W=innerWidth,H=innerHeight,bar=44;const bs=UI.land?H:Math.min(W,Math.max(Math.round(W*.75),H-bar-270));root.style.setProperty('--bs',bs+'px');root.style.setProperty('--bar','44px')}
  else root.style.removeProperty('--bs');
  if(was!==on&&G){UI.mapReset=true;renderAll()}}
function phoneRefresh(){}
let _rz=0;addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{const l=UI.land,p=UI.phone;phApply();if(G&&UI.started)renderAll()},120)});
addEventListener('orientationchange',()=>setTimeout(()=>{phApply();if(G)renderAll()},200));
// ---------------------------------------------------------------- boot
function boot(){
  try{UI.sound=localStorage.getItem('tb_snd')!=='0';UI.music=localStorage.getItem('tb_mus')==='1';UI.lowGfx=localStorage.getItem('tb_gfx')==='low'}catch(e){}
  try{if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tbt'});GA.setSfx(UI.sound);GA.setMusic(UI.music)}}catch(e){}
  try{if(window.PerfHUD)PerfHUD.register({game:'Thornbound Throne',levels:['high','low'],names:{high:'High',low:'Low'},getLevel:()=>UI.lowGfx?'low':'high',isAuto:()=>false,setLevel:(l,why)=>{if(why==='apply'){UI.lowGfx=l==='low';UI.mapReset=true;G&&renderAll()}},isAnimating:()=>UI.busy,anchor:'.gx-board',corner:'tl'})}catch(e){}
  GX.init({key:'tb'});setupDrawers();phApply();netInit();
  TBKit.ready.then(()=>{document.documentElement.classList.add('tb-ready');if(!UI.started)showStart()});
  document.addEventListener('pointerdown',()=>{try{if(window.GA)GA.unlock();if(UI.music)musicFor()}catch(e){}},{once:true})}
function startUiReady(){return TBKit.ready}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
