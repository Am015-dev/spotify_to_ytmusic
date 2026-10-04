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
  wrap(I.AG.bidOrder?'bidOrder':'bidReveal',null,()=>{pushEv({t:'bids',round:G.round,bids:G.pl.map(p=>({seat:p.seat,id:p.bid,str:G.bstr[p.seat]})).filter(b=>b.id!=null),order:G.order.slice()})});
  wrap('clashReveal',()=>{if(EV.cur&&EV.cur.tot)flush()},()=>{const c=G.clash;if(!c)return;if(!EV.cur)EV.cur={t:'clash',r:c.r,idx:G.cord.indexOf(c.r),rounds:0,log0:G.logN-c.parts.length,inf0:snapInf()};
    EV.cur.n=c.n;EV.cur.cards={};for(const s of c.parts)EV.cur.cards[s]=(c.cards[s]||[]).slice();EV.cur.supp={};for(const s of c.parts)EV.cur.supp[s]=G.pl[s].supp.r[c.r];EV.cur.parts=c.parts.slice();EV.cur.tot=null});
  wrap('clashTally',null,()=>{const c=G.clash;if(!c||!EV.cur)return;EV.cur.tot=Object.assign({},c.tot);EV.cur.winner=c.winner;EV.cur.tied=c.tied?c.tied.slice():null;
    EV.cur.cardsF={};for(const s in EV.cur.cards)EV.cur.cardsF[s]=EV.cur.cards[s].slice();
    const ci=G.clash.cards;for(const s in ci)EV.cur.cardsF[s]=ci[s].slice();
    EV.cur.str={};for(const s in EV.cur.cardsF)EV.cur.str[s]=EV.cur.cardsF[s].map(id=>cinfo(id).strength);
    flush()});  // the result card comes right after the tally, before the winner is asked to claim a location
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
  if(mode==='guided'){cfg.mode='me';cfg.guided=true;cfg.guide='full';cfg.levels=['easy','easy'];cfg.np=2;cfg.length='short';cfg.faction=GUIDED.faction;cfg.seed=GUIDED.seed;o.seatFactions=[GUIDED.faction,GUIDED.rival];UI.aiSeed=GUIDED.ai}
  const seats=mkSeats(cfg);
  const hn=cfg.mode==='hot'?(cfg.humanSeats||seats.map((_,i)=>i)):cfg.mode==='watch'?[]:[0];
  seats.forEach((s,i)=>{s.human=hn.includes(i);s.level=cfg.levels[i]||cfg.levels[0]||'normal'});
  if(o.seatFactions)o.seatFactions.forEach((f,i)=>{if(seats[i])seats[i].faction=f});
  const cnt={};const pl=seats.map((s,i)=>{const base=DD.FSHORT[s.faction];
    return {faction:s.faction,name:s.human&&(cfg.mode==='hot'||hn.length>1)?'Player '+(i+1)+' ('+DD.FSHORT[s.faction].replace('Gilded Court','Court').replace('Heathbound Clans','Clans').replace('Lantern Rising','Lanterns').replace('Pale Choir','Choir')+')':base,ai:s.human?null:s.level}});
  cfg.seats=seats;UI.cfg=cfg;UI.mode=cfg.mode;UI.guide=cfg.guide||(UI.guide||'full');
  hookEngine();
  G=null;const g=TB.newGame({players:pl,length:cfg.length,seed:cfg.seed!=null?cfg.seed:(o.seed!=null?o.seed:undefined)});
  G=g;resetUI();UI.coachDone={};UI.started=true;UI.holder=hn[0]!=null?hn[0]:0;
  UI.rs0=snapInf();UI.rsLog=0;
  try{localStorage.setItem('tb_played','1')}catch(e){}saveGame();hideStart();afterStart();return G}
function resetUI(){UI.evq=[];UI.card=null;UI.pop=null;UI.popArg=null;UI.busy=false;UI.tip={};UI.seen={};UI.clashRes={};UI.placed=[];UI.sel={};UI.toast='';UI.lastLog=G?G.logN:0;UI.coachInfo=null;UI.nowT=null;UI.moreOpen=false;UI.watchPaused=false;UI.passed=null;UI.lastShown=null;UI.mapReset=true}
function saveGame(){try{if(NET.on||!G||G.over||!UI.cfg)return;localStorage.setItem('tb_save',JSON.stringify({v:1,G,cfg:UI.cfg,holder:UI.holder,guide:UI.guide,ai:UI.aiSeed,coach:UI.coachDone||{},tip:UI.tip,t:Date.now()}))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem('tb_save');return s?JSON.parse(s):null}catch(e){return null}}
function clearSave(){try{localStorage.removeItem('tb_save')}catch(e){}}
function resumeGame(sv){hookEngine();G=sv.G;UI.cfg=sv.cfg;UI.mode=sv.cfg.mode;UI.holder=sv.holder||0;UI.guide=sv.guide||'full';UI.aiSeed=sv.ai||1;resetUI();UI.coachDone=sv.coach||{};UI.tip=sv.tip||{};UI.started=true;UI.rs0=snapInf();UI.rsLog=G.logN;return G}
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
      f.push('<g transform="translate('+x+' '+y+')"><circle r="'+(UI.phone?11:10)+'" fill="'+fcol(s)+'" stroke="#fff3c4" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="'+TBKit.fonts.display+'">'+cnt+'</text><text class="tbx-cb" x="'+(UI.phone?15:14)+'" y="-6" font-size="14" font-weight="700" fill="#fff3c4" stroke="#000" stroke-width="3" paint-order="stroke">'+GX.mark(s)+'</text></g>')}}
  if(UI.phone&&(UI.bs||0)>=250){ // phones: the kit's banners are hidden, so every location gets a short name tag of its own
    for(let l=0;l<6;l++){const P=LOCPOS[l],name=LOCN[l],fs=36,words=name.split(' ');const lines=name.length>8&&words.length>1?[words[0],words.slice(1).join(' ')]:[name];
      const wd=Math.max(...lines.map(t=>t.length))*fs*.6+18,ht=lines.length*fs+8;const cx=Math.max(wd/2+4,Math.min(996-wd/2,P[0])),top=P[1]+52;
      f.push('<g class="locname"><rect x="'+Math.round(cx-wd/2)+'" y="'+top+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="10" fill="#1d120b" fill-opacity=".82"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+(i+1)*fs-4)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>')}}
  ov.innerHTML=f.join('')}
function setHl(ids){MAP.hl=ids||[]}
function applyHl(){const m=MAP.m;if(!m)return;const sel=UI.pop==='loc'&&UI.popArg?LOCID[UI.popArg.l]:null;m.highlight(MAP.hl.map(l=>LOCID[l]));m.select(sel);drawSelName()}
// Phones: the kit's name banners are hidden (they were clipped and overlapped the region labels and reward coins). A tapped location shows its name here instead, in a spot with nothing else: below the circle in the top row and the upper half of the side columns, above it in the lower half.
function drawSelName(){const g=MAP.sg;if(!g)return;if(UI.phone){g.innerHTML='';return}if(!UI.phone||UI.pop!=='loc'||!UI.popArg||UI.popArg.l==null){g.innerHTML='';return}
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
const KIND_NAME={bid:'Choose your bid',bidRes:'Use your bid',herald:'Place your Herald',place:'Hide your cards',clashOrder:'Order the Clashes',location:'Claim a location',tie:'A tie!'};
// ---------------------------------------------------------------- top bar status chip
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;
  const ev=UI.card&&UI.card.kind==='event'?UI.card.ev:null;const ri=ev&&ev.t==='summary'?6:ev&&ev.t==='clash'?4:roadIdx();const r=ev&&ev.round?ev.round:Math.max(1,G.round);
  el.innerHTML='<span class="chip" aria-label="Round '+r+' of '+G.rounds+', step '+(ri+1)+' of 7: '+ROAD[ri]+'"><span class="chip-t"><small>Round</small><b>'+r+'</b><small>of '+G.rounds+'</small><span class="chip-s">'+esc(ROAD[ri])+'</span></span><span class="chip-d" aria-hidden="true">'+ROAD.map((_,i)=>'<i class="'+(i<ri?'done':i===ri?'on':'')+'"></i>').join('')+'</span></span>'}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){const el=$('#road');if(!el)return;const ri=roadIdx();
  el.innerHTML='<div class="road-h"><b>Round '+Math.max(1,G.round)+' of '+G.rounds+'</b><span class="road-n">step '+(ri+1)+' of 7</span></div><ol class="road-l" aria-label="Round roadmap">'+ROAD.map((n,i)=>'<li class="'+(i<ri?'done':i===ri?'on':'')+'"'+(i===ri?' aria-current="step"':'')+'><i>'+(i+1)+'</i><span>'+n+'</span></li>').join('')+'</ol>'}
// ---------------------------------------------------------------- recommended move (+ the guided script may choose a simpler teaching move)
function getRec(s,mv){const key=G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0)+':'+(UI.cfg&&UI.cfg.guided?1:0);
  if(UI._rk===key)return UI._rec;UI._rk=key;let r=null;try{r=(typeof coachRec==='function'&&coachRec(s,mv))||suggest(s)}catch(e){}UI._rec=r;return r}
const recK=()=>UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') chooses early, but this card then sits under the Kingdom Card and cannot fight.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+') keeps your strong cards for the Clashes. You may choose late, or simply take it back.':
      'A middle bid ('+i.strength+') can still win a good Kingdom Card while your strongest cards stay free for the Clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>shortName(p.seat));
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: win here and you take 1 Influence from each.':'Win this region and claim it, and your Herald earns +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes, nobody wins this region.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    return 'Strength '+i.strength+' in '+r+(i.strength>=7?': a strong card where the prize is worth it.':i.strength<=2?': a cheap card, a bluff that saves better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Nothing on offer is worth a card: take it back and keep your hand full.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card from a rival; their card under it goes back to their hand.';const kk=TB.kingdomInfo(mv.kc);return 'It works for you every round you keep it: '+lcFirst(kk.text)+'.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'')+'.'+(G.pl[s].herald===mv.loc?' Your Herald is here: +1 more, and you take 1 from each rival Herald here.':'')}
  if(k==='clashOrder')return 'Fight first where you are strongest, so your wins come before rivals can react.';
  if(G.q.t==='menu')return menuWhy(mv);
  if(G.q.t==='sel'){if(mv.t==='seldone')return 'Nothing more here is worth it right now.';
    if(k==='siteBuy')return 'Site of Power cards are stronger than your basic cards; buying one now makes your deck better for the rest of the game.';
    if(k==='shrine')return 'Cards at the bottom of your deck come back later, after a reshuffle; weak cards there leave room for better draws.';
    if(k==='ossuary')return 'It brings a useful card back from your discard pile.';
    if(k==='rally'||k==='brine')return 'Taking strong cards back to your hand saves them from Winter\'s discard.';
    return 'Of the choices here this one gains you the most.'}
  if(k==='occupier')return 'The card under a Kingdom Card cannot fight, so tuck your weakest useful card there.';
  if(k==='slot')return 'The Kingdom Card you replace is the one that helps you least now.';
  if(k==='councilOut')return 'A card back in your hand can fight again next round.';
  if(k==='flank'||k==='journeyDest')return 'Your card does more good there.';
  if(k==='castle'||k==='wilderness')return mv.skip||/^Skip/.test(mv.label||'')?'No card here is worth giving up.':'This card is worth less in your hand than what you gain.';
  if(q.t==='pick'&&mv.yes!=null)return mv.yes?'Using it now gains more than saving it.':'Saving it for a better moment is worth more.';
  return 'Of the choices here this one gains you the most.'}
function menuWhy(m){if(m.t==='done')return 'Nothing else here helps right now, so finish this step.';const a=m.a||'';
  if(a==='supp')return 'Each Supporter adds +1 Strength in that region\'s first Clash (they are spent in Winter).';
  if(a==='govern')return 'A card in a Council gives a lasting bonus every round.';
  if(a==='journey')return 'Lore buys your faction\'s Site of Power cards: stronger cards for later rounds.';
  if(a.startsWith('t:'))return 'A Tactic is a once-only faction power; now is a good moment to spend it.';
  if(a.startsWith('fav:'))return 'Your Favour power has limited uses; this is a good one.';
  if(a.startsWith('council:'))return 'Your Council cards allow this once a round.';
  if(a==='cmd:rally')return 'Rally brings strong cards back to your hand before Winter discards them.';
  if(a==='cmd:ambush')return 'Ambush adds a hidden card from your hand to this Clash.';
  if(a==='cmd:retreat')return 'Retreat saves your cards from a Clash you cannot win.';
  if(a==='cmd:flank')return 'Flank moves this card to a region where it does more good.';
  if(a==='cmd:deploy')return 'Deploy puts a card on the map that stays through Winter.';
  return 'Worth doing before you finish this step.'}
const lcFirst=t=>t?t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,''):''
// ---------------------------------------------------------------- the main prompt: body (#main, scrolls) + the action row (#act, pinned)
function recapHTML(){const c=G.clash;if(!c)return '';const parts=c.parts;
  const rows=parts.map(s=>{const ids=(c.cards[s]||[]);const tot=c.tot&&c.tot[s]!=null?c.tot[s]:null;
    return '<span class="rc-s" style="--fc:'+fcol(s)+'"><b>'+esc(shortName(s))+'</b> '+(ids.map(id=>cinfo(id).strength).join('+')||'0')+(G.pl[s].supp.r[c.r]?' +'+G.pl[s].supp.r[c.r]+' Supporter'+(G.pl[s].supp.r[c.r]>1?'s':''):'')+(tot!=null?' = <b>'+tot+'</b>':'')+'</span>'}).join('');
  return '<div class="recap" aria-label="Current clash"><span class="rc-t">Clash in '+esc(REG[c.r])+(c.n>1?' (replay '+c.n+')':'')+'</span>'+rows+'</div>'}
const shortName=s=>(hotSeat()&&!G.pl[s].ai?G.pl[s].name.replace(/ \(.*$/,'').replace('Player ','P')+' · ':'')+kf(s).short.replace('Gilded Court','Court').replace('Heathbound Clans','Clans').replace('Lantern Rising','Lanterns').replace('Pale Choir','Choir')+(!G.pl[s].ai&&(NET.on?s===vs():humans().length===1)?' (you)':'');
function waitingHTML(){const q=G.q;let who='';
  if(q){const names=q.seats.map(s=>shortName(s).replace(' (you)',''));who=NET.on?decidingLine():names.join(', ')+(q.seats.length>1?' are':' is')+' deciding'}
  const cur=G.log.slice(-4).map(e=>'<li>'+esc(plain(e.t))+'</li>').join('');
  return '<div class="wait"><p class="w-t">'+(UI.mode==='watch'?'Watching the computers play.':NET.on&&vs()<0?'You are watching.':'Waiting for the others.')+' '+esc(who)+'.</p><ul class="w-log">'+cur+'</ul></div>'}
function watchControls(){return '<button class="btn" data-a="wpause" aria-pressed="'+UI.watchPaused+'">'+(UI.watchPaused?'Resume':'Pause')+'</button><button class="btn" data-a="wstep">Step</button><button class="btn" data-a="wspeed">Speed x'+UI.speed+'</button>'}
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(m.label)+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Suggested</span>':'')+'</button>'}
function thumbFor(m){if(m.id!=null&&m.id>=0&&m.t!=='sel')return '<span class="th"'+(ownerOf(m.id)===vs()?' data-owner="'+ownerOf(m.id)+'" data-up="1"':'')+'>'+cardEl(m.id,44).outerHTML+'</span>';
  if(m.kc)return '<span class="th">'+kcEl(m.kc,44).outerHTML+'</span>';return ''}
const pbtn=(m,txt,pulse)=>'<button class="btn pri'+(pulse?' pulse':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(txt)+'</button>';
function recBtnText(m){const k=G.q.kind;if(!m)return '';
  if(k==='bid')return 'Bid '+cinfo(m.id).name+' ('+cinfo(m.id).strength+')';
  if(k==='herald')return 'Herald to '+LOCN[m.loc];
  if(k==='place')return 'Play '+cinfo(m.id).name+' ('+cinfo(m.id).strength+') at '+REG[m.r].replace('The ','');
  if(k==='tie')return m.pass?'Pass':'Play '+cinfo(m.id).name;
  if(k==='location')return 'Claim '+LOCN[m.loc];
  if(k==='bidRes')return m.t==='return'?'Take my card back':(m.t==='steal'?'Steal ':'Take ')+TB.kingdomInfo(m.kc).name;
  if(m.t==='done'||m.t==='seldone')return m.label.replace(/^End my /,'End ');
  const L=m.label.replace(/\s*\([^)]*\)\s*$/,'');return L.length>48?L.slice(0,46)+'…':L}
function renderMain(){const el=$('#main'),ft=$('#act');if(!el)return;const q=G.q;let foot='';
  const qk=(q?q.kind+'|'+q.title+'|'+G.logN:'')+'|'+(UI.coachInfo?UI.coachInfo.id:'');const set=(h,f)=>{el.innerHTML=h;if(ft)ft.innerHTML=f||'';if(UI._qk!==qk){UI._qk=qk;el.scrollTop=0}};
  if(G.over){set('<div class="step"><h3 class="st">The reign is over</h3></div>');return}
  if(UI.coachInfo){set(coachInfoHTML(UI.coachInfo),'<button class="btn pri pulse" data-a="coachok">'+esc(UI.coachInfo.btn||'Continue')+'</button>');setHl(UI.coachInfo.hlLocs||[]);return}
  const s=viewSeatForQ();
  if(!q||s==null||UI.card&&UI.card.kind==='pass'){set(waitingHTML(),UI.mode==='watch'?watchControls():'');setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const rm=rec?mv.find(m=>m.k===rec.k):null;
  const co=typeof coachFor==='function'?coachFor(s,mv,rm):null;
  let h='';
  h+='<div class="step" data-q="'+q.kind+'"><h3 class="st">'+esc(co&&co.title||KIND_NAME[q.kind]||titleOf(q))+'</h3>';
  if(co)h+='<p class="coach">'+gloss(co.text)+'</p>';
  else{h+=tipLine(q.kind==='menu'&&menuPhase(q)?'menu:'+menuPhase(q):q.kind)+'<p class="pr">'+gloss(promptText(q))+'</p>'}
  if(NET.on&&q.simul){const oth=q.seats.filter(x=>x!==s);if(oth.length)h+='<p class="hint dec">Everyone decides at the same time. Still to choose: '+esc(oth.map(seatWho).join(', '))+'.</p>'}
  if(G.clash&&['day','night','tally'].includes(G.step)||G.clash&&q.kind==='location'||G.clash&&['castle','wilderness','harvest','shrine','ossuary','tie'].includes(q.kind))h+=recapHTML();
  if(!co||!co.noRec)h+=recLine(s,rm);
  const pulse=!!(co&&co.pulse);const hl=[];
  switch(q.kind){
   case 'bid':{h+='<p class="hint">Or tap any card in your hand to read it first. <button class="lk" data-a="road4">See the Great Road</button></p>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'bidRes':{h+=bidResHTML(s,mv);if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'herald':{h+='<div class="locgrid">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="loc" data-l="'+m.loc+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' · '+esc(REG[m.loc>>1].replace('The ',''))+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';h+='<p class="hint">Tap a location to read its reward first.</p>';mv.forEach(m=>hl.push(m.loc));if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'place':{const rs=[...new Set(mv.map(m=>m.r))];rs.forEach(r=>{hl.push(2*r,2*r+1)});h+='<p class="hint">Or tap a hand card to choose it yourself'+(rs.length>1?' (then pick the region)':'')+'.</p>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'tie':{h+='<p class="hint">Or tap a hand card to play it face-down into the tied Clash.</p>';const ps=mv.find(m=>m.pass);foot=(ps&&!(rm&&rm.pass)?'<button class="btn" data-a="mv" data-k="'+esc(ps.k)+'">Pass</button>':'')+(rm?pbtn(rm,recBtnText(rm),pulse):'');break}
   case 'location':{h+='<div class="locgrid two">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' Influence'+(DD.LOCS[m.loc][3]?', '+esc(lcFirst(DD.LOCS[m.loc][3])):'')+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';mv.forEach(m=>hl.push(m.loc));if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'clashOrder':{h+='<div class="opts">'+mv.map(m=>optBtn(m,'ord',orderChips(m.order))).join('')+'</div>';if(rm)foot=pbtn(rm,'Use the suggested order',pulse);break}
   default:{
     if(q.t==='menu'){const r=menuHTML(s,mv,rm,pulse);h+=r.h;foot=r.f}
     else if(q.t==='sel'){const r=selHTML(s,mv,rm,q,pulse);h+=r.h;foot=r.f}
     else{h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse)}}}
  h+='</div>';set(h,foot);setHl(hl)}
const QNAME={flank:'Flank',castle:'Govern',wilderness:'Journey',siteBuy:'Spend Lore',ossuary:'Ossuary bonus',shrine:'Moss Altar bonus',harvest:'The Favour',rally:'Rally',retreat:'Retreat',ambushCard:'Ambush',occupier:'Choose the occupier',slot:'Choose a slot',placeRegion:'Choose a region',placeLoc:'Choose a location',journeyDest:'Journey',brine:'Brine-Hardened',edict:'A Tactic',relics:'Council of Coin',order:'Turn order'};
function titleOf(q){if(q.t==='menu'){const ph=menuPhase(q);return ph?ph+' actions':'Your actions'}if(QNAME[q.kind])return QNAME[q.kind];const t=(q.title||'').replace(/^[^:]*:\s*/,'');return t.length>28?'Your choice':t}
function tipLine(k){if(k==='bid'||k==='place'||UI.guide!=='full'||!TIPS[k]||UI.tip[k]==='x'||G.round>2)return '';UI.tip[k]=UI.tip[k]||1;return '<p class="tipl">'+ico('book')+'<span>'+gloss(TIPS[k][1])+'</span><button class="lk" data-a="tipx" data-k="'+k+'">Hide</button></p>'}
function promptText(q){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick one hand card as a secret bid. Its Strength is your bid: the highest bid chooses a Kingdom Card first.';
    case 'herald':return 'Put your Herald on a location. Everyone sees it.';
    case 'place':return t.indexOf('fewer')>=0?t:'Hide one card face-down next to each region ('+placeProgress()+'). The strongest total in a region wins its Clash.';
    case 'bidRes':return 'Your turn to use your bid: take a Kingdom Card, steal one, or take your card back.';
    case 'location':return 'You won the Clash. Claim one of the two locations of '+(G.clash?REG[G.clash.r]:'this region')+'.';
    case 'clashOrder':return 'You have the least Influence, so you choose the order of the three Clashes.';
    default:if(q.t==='menu'){const ph=menuPhase(q);return (ph?ph+': ':'')+'these actions are optional. The suggestion is below; the rest are under the list.'}return plain(t)}}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggested:</b> '+esc(shortRec(rm))+' <span class="why2">'+gloss(whyFor(s,rm))+'</span></span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' ('+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';if(m.t==='done')return 'finish this step.';return m.label.replace(/\.$/,'')+'.'}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i><b class="gx-cbm" aria-hidden="true">'+GX.mark(p.seat)+'</b>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal)){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+'<p>'+esc(k.text)+'</p>'+(m.t==='steal'?'<p class="st-n">Steal it from '+esc(nameOf(m.s2))+'.</p>':'')+(rec?'':'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+'</button>')+'</div></div>'}
  for(const m of ret){const rec=recK()===m.k;h+='<div class="offer ret'+(rec?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take your bid card back into your hand and take nothing.</p>'+(rec?'':'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Take it back</button>')+'</div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): the suggestion and "End" are always visible; everything else is folded into groups
const MGROUP=[['supp','Send Supporters','Each adds +1 Strength in a region\'s first Clash; all are spent in Winter.'],['govern','Govern','Put a hand card with votes into a Council (once a round).'],['journey','Journey','Send a hand card away for Lore (once a round).'],['cmd','Card abilities','Commands printed on your cards.'],['t','Tactics','Your faction\'s once-only powers.'],['fav','Kingdom\'s Favour','Your faction\'s Favour power.'],['council','Councils','What your Council cards allow.'],['kc','Kingdom Cards','Powers of the Kingdom Cards you hold.'],['other','Other','']];
function mgroup(a){if(a==='supp'||a==='govern'||a==='journey')return a;const p=a.split(':')[0];if(p==='cmd'||p==='t'||p==='fav'||p==='council')return p;if(/^kc\d/.test(a))return 'kc';return 'other'}
function menuHTML(s,mv,rm,pulse){let h='';const acts=mv.filter(m=>m.t==='act'),done=mv.find(m=>m.t==='done');let f='';
  const byG={};for(const m of acts){(byG[mgroup(m.a)]=byG[mgroup(m.a)]||[]).push(m)}
  if(!acts.length)h+='<p class="hint">Nothing to do in this step: finish it.</p>';
  if(acts.length){h+='<details class="more"'+(UI.moreOpen?' open':'')+' data-more="1"><summary>'+(rm&&rm.t==='act'?'Other actions':'Actions')+' ('+acts.length+')</summary>';
    for(const [g,nmG,dsc] of MGROUP){const L=byG[g];if(!L)continue;h+='<p class="grp-h">'+gloss(nmG)+'</p>'+(dsc?'<p class="grp-n">'+gloss(dsc)+'</p>':'');
      if(g==='supp'){const byR={};for(const m of L){(byR[m.p.r]=byR[m.p.r]||[]).push(m)}
        for(const r in byR){h+='<div class="sup-r"><span>'+esc(REG[r])+'</span>'+byR[r].map(m=>'<button class="nb'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'" aria-label="Send '+m.p.n+' to '+esc(REG[r])+'">'+m.p.n+'</button>').join('')+'</div>'}continue}
      h+='<div class="opts">'+L.map(m=>optBtn(m,'act','')).join('')+'</div>'}
    h+='</details>'}
  if(done)f+='<button class="btn'+(rm&&rm.k===done.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(recBtnText(done))+'</button>';
  if(rm&&rm.t==='act')f+=pbtn(rm,recBtnText(rm),pulse);
  return {h,f}}
function selHTML(s,mv,rm,q,pulse){const items=mv.filter(m=>m.t==='sel'),dn=mv.find(m=>m.t==='seldone');let h='',f='';
  const ch=(q.chosen||[]).map(v=>chipFor(v));h+=(ch.length?'<p class="chosen">Chosen: '+ch.join(' ')+'</p>':'')+(q.max!=null&&q.max<items.length+ch.length?'<p class="hint">Choose up to '+q.max+(q.min?' (at least '+q.min+')':'')+'.</p>':'');
  h+='<div class="opts">'+items.map(m=>optBtn(m,'',typeof m.v==='number'&&m.v<10000&&ownerOf(m.v)===s?'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(m.v,44).outerHTML+'</span>':'')).join('')+'</div>';
  if(dn)f+='<button class="btn'+(rm&&rm.k===dn.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(dn.k)+'">'+esc(dn.label)+'</button>';
  if(rm&&rm.t==='sel')f+=pbtn(rm,recBtnText(rm),pulse);
  return {h,f}}
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
  const W=Math.max(200,el.clientWidth||$('#dockbody').clientWidth||360)-8;const cw=UI.phone?(UI.land?42:(innerHeight<600?44:innerHeight<700?48:54)):66,ch=Math.round(cw*1.4308);
  const n=ids.length,step=n>1?Math.min(cw+6,(W-cw)/(n-1)):0;const tot=n>1?cw+step*(n-1):cw;const off=Math.max(0,(W-tot)/2);
  const hh='<div class="hand-h"><span>Hand <b>'+ids.length+'</b>/'+P.hs+'</span><span>Deck '+P.deck.length+'</span><span>Discard '+P.disc.length+'</span>'+(P.lore?'<span>Lore '+P.lore+'</span>':'')+'</div>';
  let h=UI.phone?'':hh;
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
      '<span class="rv-e">'+emb(s,26)+'<i class="gx-cbm" aria-hidden="true">'+GX.mark(s)+'</i></span><span class="rv-t"><b>'+(s===me&&(NET.on||humans().length===1)?'<u>You</u> · ':'')+esc(shortName(s).replace(' (you)',''))+'</b><small><i>'+P.inf+'</i> Influence'+(G.np<3?' · '+P.hand.length+' cards':'')+'</small>'+(s===me&&!hot?meChips(s,P):'')+'</span>'+favs+'</button>'}).join('')}
function meChips(s,P){const kc=(P.ks||[]).filter(Boolean).length,tl=(P.tac||[]).filter(t=>!t.ex&&!t.burn).length;
  return '<span class="me-chips" aria-label="Your board: '+kc+' Kingdom Cards, '+P.supp.b+' Supporters at home, '+tl+' Tactics left'+(P.lore?', '+P.lore+' Lore':'')+'">KC '+kc+' · Sup '+P.supp.b+' · Tac '+tl+'/'+(P.tac||[]).length+(P.lore?' · Lore '+P.lore:'')+'</span>'}
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
  const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];const info=h;h='';
  if(q&&q.kind==='herald'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Place my Herald here'+(rec?' (recommended)':'')+'</button></div>';h+='<p class="why">'+ico('star')+'<span><b>'+(rec?'Why this one':'Think about it')+':</b> '+esc(whyFor(s,m))+'</span></p>'}}
  else if(q&&q.kind==='location'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Claim '+esc(LOCN[l])+(rec?' (recommended)':'')+'</button></div>'}}
  else if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===l>>1)){h+='<p class="lc-h"><b>Play a face-down card in '+esc(REG[l>>1])+':</b></p>'+cardPicker(s,mv.filter(x=>x.r===l>>1||q.kind==='tie'))}
  return popShell(esc(LOCN[l]),h+info,'loc-b')}
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
const TIPS={bid:['Bids','Every round starts with a secret bid. The highest bid picks a Kingdom Card first; the card you bid then sits under it and cannot fight.'],
  herald:['Heralds','Your Herald is public. If you win a region and claim the location where your Herald stands, you gain +1 Influence and take 1 from every rival Herald there.'],
  place:['Hidden cards','You hide one card at each of the three regions. Put big cards where the prize matters and cheap ones elsewhere.'],
  menu:['Actions','These actions are optional. Open the list to see them, or finish the step.'],
  'menu:Spring':['Spring','Supporters add +1 Strength each in a region\'s first Clash; they are spent in Winter. Spring Tactics and abilities work now too.'],
  'menu:Day':['Day','The cards are face up. Ambush adds a hidden card from your hand, Retreat pulls your cards out of a Clash you cannot win, Flank moves a card to a region that has not fought yet.'],
  'menu:Autumn':['Autumn','Once a round each: Govern puts a hand card with votes into a Council, Journey sends a hand card away for Lore, and Rally takes your cards on the map back to your hand.'],
  clashOrder:['Clash order','The player with the least Influence chooses the order of the three Clashes.'],
  location:['Winning','The winner claims one of the region\'s two locations: its Influence and its bonus.'],
  bidRes:['Your bid','Take a Kingdom Card from the Great Road, steal one a rival holds (your bid must beat the card under it), or take your card back.']};
function maybeTip(){return typeof coachGate==='function'&&coachGate()}
function renderCard(){const el=$('#pc');if(!el)return;const c=UI.card;
  if(!c){el.hidden=true;el.innerHTML='';UI._cardKey=null;return}
  const key=JSON.stringify(c.kind==='event'?[c.ev.t,c.ev.r,c.ev.n,c.ev.round]:[c.kind,c.seat,c.k]);
  if(UI._cardKey===key&&!el.hidden)return;UI._cardKey=key;
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');el.dataset.kind=c.kind==='event'?c.ev.t:c.kind;
  let h='';
  if(c.kind==='pass'){const s=c.seat;h='<div class="cd cd-pass" style="--fc:'+fcol(s)+'"><div class="cd-sc"><div class="cd-e">'+emb(s,56)+'</div><h3>Pass the device to '+esc(nameOf(s))+'</h3><p>Everyone else look away. Your hand and hidden cards appear when you tap the button.</p></div><div class="cd-ft"><button class="btn pri big" data-a="take" data-s="'+s+'">I am '+esc(shortName(s))+': show my cards</button></div></div>'}
  else if(c.kind==='over'){h=overHTML()}
  else if(c.kind==='event')h=eventHTML(c.ev);
  el.innerHTML=h;
  if(c.kind==='event'&&c.ev.t==='clash')playClash(c.ev,el);
  const b=el.querySelector('.btn.pri');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function cdWrap(cls,body,foot){return '<div class="cd '+cls+'"><div class="cd-sc">'+body+'</div><div class="cd-ft">'+foot+'</div></div>'}
function eventHTML(ev){const note=typeof coachEvent==='function'?coachEvent(ev):'';const cn=note?'<p class="coach">'+gloss(note)+'</p>':'';
  if(ev.t==='bids'){const rows=ev.bids.slice().sort((a,b)=>b.str-a.str||ev.order.indexOf(a.seat)-ev.order.indexOf(b.seat));
    return cdWrap('cd-bids','<h3>Bids revealed</h3>'+(cn?'':'<p class="sub">'+gloss('The highest bid chooses first. A tie goes to whoever is higher on the Order Track.')+'</p>')+'<div class="bidrow">'+rows.map((b,i)=>'<div class="bd" style="--fc:'+fcol(b.seat)+'"><span class="bd-n">'+(i+1)+'</span><span class="bd-c">'+TBKit.card(cardSpec(b.id),UI.phone?(UI.short?40:52):64).outerHTML+'</span><span class="bd-t"><b>'+esc(shortName(b.seat))+'</b><small>'+esc(TB.cardName(G,b.id))+'</small><i>'+b.str+(b.str!==cinfo(b.id).strength?' <small>(printed '+cinfo(b.id).strength+')</small>':'')+'</i></span></div>').join('')+'</div>'+cn,'<button class="btn pri" data-a="evok">Continue</button>')}
  if(ev.t==='clash'){const w=ev.winner,tie=w<0;const names=ev.parts.map(s=>'<b>'+esc(shortName(s))+'</b> '+ev.tot[s]).join(' · ');
    return cdWrap('cd-clash','<h3>Clash '+(ev.idx>=0?['I','II','III'][ev.idx]:'')+': '+esc(REG[ev.r])+(ev.n>1?' (replay)':'')+'</h3><div class="cl-panel" id="clp"></div><p class="cl-res" id="clres" hidden>'+(tie?'A tie: '+names+'. Nobody wins here.':'<b>'+esc(shortName(w))+'</b> wins: '+names)+'</p>'+cn+'<ul class="cl-log" id="cllog" hidden>'+ev.logs.filter(t=>!/^(.* reveals |Strength in |Clash )/.test(t)).slice(0,9).map(t=>'<li>'+esc(plain(t))+'</li>').join('')+'</ul><div class="cl-inf" id="clinf" hidden>'+infChips(ev.inf0,ev.inf1)+'</div>','<button class="btn pri" data-a="evok" id="clok" hidden>Continue</button>')}
  if(ev.t==='summary'){return cdWrap('cd-sum','<h3>End of round '+ev.round+' of '+ev.rounds+'</h3><table class="sumt"><thead><tr><th></th><th>This round</th><th>Influence</th></tr></thead><tbody>'+ev.inf1.map((v,s)=>'<tr style="--fc:'+fcol(s)+'"><td><b>'+esc(shortName(s))+'</b></td><td>'+sgn(v-ev.inf0[s])+'</td><td><b>'+v+'</b></td></tr>').join('')+'</tbody></table>'+cn+(ev.warns.length?'<ul class="cl-log warn">'+ev.warns.map(t=>'<li>'+gloss(plain(t))+'</li>').join('')+'</ul>':'')+'<p class="sub">'+(ev.last?'That was the last round: the final count follows.':gloss('Winter: Heralds go home, Supporters on the map are spent, played cards go to the discard pile. Next round the leader acts first.'))+'</p>','<button class="btn pri" data-a="evok">'+(ev.last?'See the result':'Start round '+(ev.round+1))+'</button>')}
  return ''}
function infChips(a,b){return a.map((v,s)=>b[s]!==v?'<span style="--fc:'+fcol(s)+'">'+esc(shortName(s))+' '+sgn(b[s]-v)+'</span>':'').join('')}
function playClash(ev,root){const panel=root.querySelector('#clp');if(!panel)return;const w=ev.winner;
  const items=ev.parts.map(s=>{const ids=(ev.cardsF&&ev.cardsF[s])||ev.cards[s]||[];const best=ids.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength)[0];
    const spec=best!=null?cardSpec(best):{faction:FK[G.pl[s].fac],title:'Supporters only',value:0,type:'ploy',art:'banner',text:'No cards here: only Supporters count.'};
    return {faction:FK[G.pl[s].fac],name:shortName(s)+(ids.length>1?' (+'+(ids.length-1)+')':'')+(ev.supp[s]?' +'+ev.supp[s]+' sup.':''),card:spec,strength:ev.tot[s],winner:w===s}});
  const sc=root.querySelector('.cd-sc')||root;let rest=0;for(const c of sc.children)if(c!==panel&&!c.hidden)rest+=c.offsetHeight+8;const sz=Math.max(48,Math.min(110,Math.floor((root.clientWidth-30)/Math.max(2,items.length))-14,Math.floor((sc.clientHeight-rest-30-70)/1.43/1.08)));
  const cp=TBKit.clashPanel(panel,items,{size:sz,tie:w<0});UI._cp=cp;
  const fin=()=>{['#clres','#cllog','#clinf','#clok'].forEach(q=>{const e=root.querySelector(q);if(e)e.hidden=false});UI.clashRes[ev.r]={winner:w,tot:ev.tot};
    const b=root.querySelector('#clok');if(b)try{b.focus({preventScroll:true})}catch(e){}if(typeof sfx==='function')sfx(w<0?'tie':'win')};
  if(!ANIM){cp.el.querySelectorAll('.tb-flipcard').forEach(f=>f.classList.add('tb-up'));cp.el.querySelectorAll('.tb-clash-col').forEach(c=>c.classList.add('tb-shown'));fin();return}
  mapReveal(ev);
  setTimeout(()=>{const key=UI._cardKey;cp.play().then(()=>{if(UI._cardKey===key)fin()})},350)}
function overHTML(){const o=G.over;const rk=o.ranking;const win=o.winner;const me=vs();const iWon=(NET.on||humans().length===1)&&win===me;
  const head=iWon?'You win the throne!':esc(nameOf(win).replace(/^You$/,'You'))+' takes the throne';
  const body='<h3>'+head+'</h3><p class="sub">'+esc(DD.FNAME[G.pl[win].fac])+' ends with <b>'+G.pl[win].inf+'</b> Influence'+(o.tieBreak?' (tie broken by '+(o.tieBreak==='favour'?'the Kingdom\'s Favour':'turn order')+')':'')+'.</p><ol class="rank">'+rk.map((s,i)=>'<li style="--fc:'+fcol(s)+'"><b>'+(i+1)+'. '+esc(shortName(s))+'</b><span>'+G.pl[s].inf+' Influence'+(o.bonus&&o.bonus[s]?' <small>(+'+o.bonus[s]+' from the emptied Site of Power)</small>':'')+'</span></li>').join('')+'</ol>'+(typeof overBreakdown==='function'?overBreakdown():'');
  const foot=NET.on?(isHost()?'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="netopen">Lobby</button>':'<button class="btn" data-a="netleave">Leave</button>'):'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="menu">Main menu</button>';
  const gnote=(UI.earned&&UI.earned.length?'<p class="achv">★ New achievement'+(UI.earned.length>1?'s':'')+': '+esc(UI.earned.join(', '))+'</p>':'')+(typeof isGuided==='function'&&isGuided()?'<p class="coach">'+gloss('You have played a whole game. Next time try a full game from Play: choose the faction whose story you like, 3 players, 5 rounds. The suggestions stay on if you want them.')+'</p>':'');
  return cdWrap('cd-over',body+gnote+(NET.on&&!isHost()?'<p class="sub">The host can start another game.</p>':''),foot)}
// ===================== part 5: render loop, clicks, drawers (rules, log, board, menu), start screen =====================
function renderAll(){if(!G||!UI.started)return;
  try{UI.V=isClient()?G:TB.stripView(G,isPassing()?-1:vs())}catch(e){console.error('view '+e.message);return}  // a client's G is already its own stripped copy
  if(UI.phone&&!UI.land){const sm=!!wantSmall();if(sm!==!!UI.boardSmall){UI.boardSmall=sm;phApply()}}
  if(isPassing()){if(GX.open)GX.close();const bb=$('#boardbody');if(bb)bb.innerHTML='';if(UI.pop)closePop(true)}
  if(!(UI.card&&UI.card.kind==='event'))renderMap();else if(!MAP.m)renderMap();
  renderBar();renderRoad();renderNow();renderMain();renderHand();renderRivals();setHB();renderCard();renderPop();updateLive();
  document.documentElement.dataset.step=String(roadIdx());
  if(typeof phoneRefresh==='function')phoneRefresh();
  netAfter();
  const lb=$('#logbody');if(lb&&GX.open==='logd')renderLog()}
function setHB(){const d=$('.gx-dock'),hw=$('#handw'),rv=$('#rivals');if(!d)return;d.style.setProperty('--hb',((hw&&!hw.hidden?hw.offsetHeight:0)+(rv?rv.offsetHeight:0))+'px')}
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
   case 'tipx':UI.tip[t.dataset.k]='x';renderAll();break;
   case 'coachok':coachOk();break;
   case 'gloss':showGloss(t.dataset.t);break;
   case 'gclose':hideGloss();break;
   case 'nowlog':GX.show('logd');break;
   case 'title':UI.sv='title';renderStart();break;
   case 'play':UI.sv='setup';UI.cfgOpen=false;renderStart();break;
   case 'online':UI.sv='online';UI.onl=true;renderStart();break;
   case 'cfgopen':UI.cfgOpen=true;renderStart();break;
   case 'cfgclose':UI.cfgOpen=false;renderStart();break;
   case 'lv':sv.levels[+t.dataset.i]=t.dataset.v;renderStart();break;
   case 'again':{clearSave();const c=UI.cfg;startFromCfg(c);break}
   case 'menu':showStart();break;
   case 'wpause':UI.watchPaused=!UI.watchPaused;if(!UI.watchPaused)pump();else renderAll();break;
   case 'wstep':{if(UI.mode==='watch'&&G.q){const w=whoActs();if(w.ai.length){aiStep(w)}}pump();break}
   case 'wspeed':UI.speed=UI.speed>=4?1:UI.speed*2;renderAll();break;
   // start screen
   case 'mode':sv.mode=t.dataset.v;if(t.dataset.go){startFromSetup();break}renderStart();break;
   case 'np':sv.np=+t.dataset.v;renderStart();break;
   case 'fac':sv.faction=t.dataset.v;renderStart();break;
   case 'len':sv.length=t.dataset.v;renderStart();break;
   case 'gd':sv.guide=t.dataset.v;renderStart();break;
   case 'start':sv.mode='me';startFromSetup();break;
   case 'guided':newGame('guided');break;
   case 'cont':{const s=loadSave();if(s){hideStart();resumeGame(s);afterStart()}break}
   case 'rules':GX.show('rulesd');break;
   case 'savenow':saveGame();toast('Saved. You can continue from the start screen.');break;
   case 'newgame':GX.close();showStart();break;
   case 'logall':UI.logAll=!UI.logAll;renderLog();break;
  }});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.pop&&!GX.open){closePop();e.preventDefault()}});
function toast(t){UI.toast=t;const l=$('#live');if(l)l.textContent=t}
// start screens (title, setup, online): see part 7
function startFromCfg(c){hideStart();const o={np:c.np,length:c.length,faction:c.faction,levels:c.levels,guide:c.guide,seatFactions:c.seats.map(s=>s.faction),humanSeats:c.humanSeats};
  if(c.guided)newGame('guided',o);else newGame(c.mode==='watch'?'ai':c.mode,o)}
function afterStart(){closePop(true);GX.close();UI.mapReset=true;renderAll();pump()}
// ---------------------------------------------------------------- drawers
function renderLog(){const el=$('#logbody');if(!el||!G)return;const L=G.log.slice().reverse();let h='<p class="small"><button class="btn" data-a="logall">'+(UI.logAll?'Show key events only':'Show everything')+'</button></p><ol class="log">';
  let r=-1;for(const e of L){if(!UI.logAll&&e.c!=='big'&&e.c!=='warn')continue;h+='<li class="'+(e.c||'')+'"><i style="background:'+(e.s>=0?fcol(e.s):'#777')+'"></i>'+esc(e.t)+'</li>'}
  el.innerHTML=h+'</ol>'}
function renderBoardDrawer(){const el=$('#boardbody');if(!el||!G)return;const s=vs()>=0?vs():0;UI.V=UI.V||TB.stripView(G,vs());
  const P=UI.V.pl[s];let h=popRival(s).replace(/^<div class="pp-h">.*?<\/div><div class="pp-b[^"]*">/,'<div>');h=h.replace(/<\/div>$/,'');
  h+='<h5>Site of Power</h5><div class="piles">'+P.site.map(id=>'<div class="sitec"><button class="hc pk" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1">'+cardEl(id,64).outerHTML+'</button><small>cost '+cinfo(id).cost+'</small></div>').join('')+'</div>';
  h+='<h5>Discard pile ('+P.disc.length+')</h5><div class="piles">'+P.disc.map(id=>'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  const lost=UI.V.lost;h+='<h5>Lost Pile ('+lost.length+', shared)</h5><div class="piles">'+lost.map(id=>'<span class="th">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  el.innerHTML=h}
const RULES_HTML=()=>`<div class="rules">
<div class="quick"><h3>In two minutes</h3><p><b>Goal:</b> hold the most <b>Influence</b> (points) when the last round ends.</p><ol>
<li><b>Bid</b> a hand card in secret. The highest bid picks a <b>Kingdom Card</b>: a lasting power.</li>
<li>Put your <b>Herald</b> on one of six locations. It pays only if you win there.</li>
<li><b>Hide one card</b> at each of the three regions. Send <b>Supporters</b> (+1 each) if you like.</li>
<li><b>Clashes:</b> cards flip; the highest total Strength in a region wins and claims one of its two locations (its Influence, plus +1 and a steal if your Herald stands there).</li>
<li><b>Autumn, then Winter:</b> optional Govern and Journey, then played cards are discarded and a new round begins.</li></ol>
<p>The guided first game walks you through this once. Underlined words in the game can be tapped for their meaning. The <b>Cards</b> button lists every card, Kingdom Card, Tactic and location.</p><p class="small">Not in this version yet: the solo opponent and the optional advanced setup (a mulligan and a secret starting Kingdom Card). Everything else in the base game is here, for 2 to 4 players.</p></div>
<details><summary>The full rules</summary>
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
<h3>On this screen</h3><p>Tap a location or a region's card slots for details; tap the throne for the Great Road and Councils. Tap a card in your hand for a large view and its actions. The dots in the top bar show the seven steps of a round. The gold button at the bottom of the panel is the suggestion of a strong computer player, and the line above it says why.</p>
</details>
<details><summary>Words used in the game</summary><dl>${GLOSS.map(g=>'<dt>'+g[2]+'</dt><dd>'+g[3]+'</dd>').join('')}</dl></details>
</div>`;
function setupDrawers(){
  GX.drawer('rulesd','How to play',(()=>{const d=document.createElement('div');d.innerHTML=RULES_HTML();return d})(),true);
  GX.drawer('logd','Log',(()=>{const d=document.createElement('div');d.id='logbody';return d})());
  GX.drawer('boardd','My board and piles',(()=>{const d=document.createElement('div');d.id='boardbody';return d})());
  GX.onShow=id=>{if(id==='logd')renderLog();if(id==='boardd')renderBoardDrawer()}}
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
// The board gives up space so the dock (now-line, prompt, pinned action row, hand, rivals) always fits: portrait phones keep the square map
// at most as big as the height leaves after the dock's minimum; landscape phones put the map left at the full height.
function dockNeed(H){return H>=820?380:H>=760?396:H>=700?370:H>=640?350:H>=580?330:330}
function phApply(){const was=UI.phone;const on=phDetect();const root=document.documentElement;
  UI.phone=on;UI.land=innerWidth>innerHeight;const W=innerWidth,H=innerHeight;UI.short=on&&(UI.land?H<370:H<600);
  root.classList.toggle('ph',on);root.classList.toggle('ph-p',on&&!UI.land);root.classList.toggle('ph-l',on&&UI.land);root.classList.toggle('short',!!UI.short);
  if(on){const big=Math.max(150,Math.min(W,H-44-dockNeed(H)));const bs=UI.land?Math.min(H,Math.round(W*.52)):(UI.boardSmall?Math.max(150,Math.min(big,Math.round(big-Math.max(90,H*.15)))):big);root.style.setProperty('--bs',bs+'px');UI.bs=bs}
  else root.style.removeProperty('--bs');
  if(was!==on&&G){UI.mapReset=true;renderAll()}}
function phoneRefresh(){}
// map-centred decisions (Herald, hidden cards, claiming, ties, the map lesson) get the big map; lists, menus and result cards get the room instead
function wantSmall(){if(!G)return false;const c=UI.card;if(c&&c.kind==='pass')return false;if(c&&(c.kind==='event'||c.kind==='over'))return true;
  if(UI.coachInfo)return UI.coachInfo.id!=='map';const s=viewSeatForQ();if(s==null||!G.q)return UI.boardSmall;
  return !['herald','place','location','tie','clashOrder'].includes(G.q.kind)}
let _rz=0;addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{const l=UI.land,p=UI.phone;phApply();if(G&&UI.started)renderAll()},120)});
addEventListener('orientationchange',()=>setTimeout(()=>{phApply();if(G)renderAll()},200));
// ---------------------------------------------------------------- boot
function boot(){
  try{UI.sound=localStorage.getItem('tb_snd')!=='0';UI.music=localStorage.getItem('tb_mus')==='1';UI.lowGfx=localStorage.getItem('tb_gfx')==='low'}catch(e){}
  try{if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tbt'});GA.setSfx(UI.sound);GA.setMusic(UI.music);GX.applyPrefs()}}catch(e){}
  try{if(window.PerfHUD)PerfHUD.register({game:'Thornbound Throne',levels:['high','low'],names:{high:'High',low:'Low'},getLevel:()=>UI.lowGfx?'low':'high',isAuto:()=>false,setLevel:(l,why)=>{if(why==='apply'){UI.lowGfx=l==='low';UI.mapReset=true;G&&renderAll()}},isAnimating:()=>UI.busy,anchor:'.gx-board',corner:'tl'})}catch(e){}
  GX.init({key:'tb'});setupDrawers();kitBoot();phApply();netInit();
  TBKit.ready.then(()=>{document.documentElement.classList.add('tb-ready');if(!UI.started)showStart()});
  document.addEventListener('pointerdown',()=>{try{if(window.GA)GA.unlock();if(UI.music)musicFor()}catch(e){}},{once:true})}
function startUiReady(){return TBKit.ready}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
// ===================== part 7: plain words (log lines, glossary), the guided first game, title + setup screens =====================
// ---------------------------------------------------------------- plain log lines: "Heathbound Clans gains 2" -> "You gain 2" for the local player
function myName(){if(!G)return null;if(NET.on){const m=NET.mySeat;return m>=0?G.pl[m].name:null}if(hotSeat()||UI.mode==='watch')return null;const h=humans();return h.length===1?G.pl[h[0]].name:null}
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function verbYou(w){const l=w.toLowerCase();if(l==='has')return 'have';if(l==='is')return 'are';if(l==='was')return 'were';if(l==='does')return 'do';
  if(/[^aeiou]ies$/i.test(w))return w.slice(0,-3)+'y';if(/(ss|sh|ch|x|z)es$/i.test(w))return w.slice(0,-2);if(/[^s]s$/i.test(w)&&w.length>3)return w.slice(0,-1);return w}
function plain(t){const n=myName();if(!n||!t)return t;let subj=false;
  let out=t.replace(new RegExp(escRe(n)+"('s)?(?=\\W|$)( [A-Za-z]+)?",'g'),(m,poss,w,off,str)=>{const start=off===0||/[.:!?]\s*$/.test(str.slice(0,off));if(off===0)subj=true;
    const you=start?(poss?'Your':'You'):(poss?'your':'you');if(poss)return you+(w||'');if(!w)return you;if(!start&&off>0)return you+w;return you+' '+verbYou(w.trim())});
  if(subj)out=out.replace(/\btheir\b/,'your');return out}
// ---------------------------------------------------------------- "what's happening": the newest public event, in plain words
const PHASEN={spring:'Spring',summer:'Day',autumn:'Autumn'};
function aiFallback(s,q,mv){const N=G.pl[s].name;const k=q.kind;
  if(k==='bid')return N+' chooses a secret bid.';if(k==='place'&&mv.r!=null)return N+' hides a card next to '+REG[mv.r]+'.';
  if(q.t==='menu'&&mv.t==='done'){const ph=(q.title.match(/(Spring|Day|Autumn)/)||[])[1];return N+' is done with '+(ph?ph+' ':'')+'actions.'}
  if(k==='edict'||k==='statue'||k==='harvest')return N+' decides about '+(k==='edict'?'a Tactic':'a card')+'.';
  return N+' makes a choice.'}
function renderNow(){const el=$('#now');if(!el||!G)return;if(UI.coachInfo){el.innerHTML='';return}
  let t=null,s=-1;const f=UI.nowT;const last=G.log[G.log.length-1];
  if(f&&f.at===G.logN){t=f.t;s=f.s}else if(last){t=last.t;s=last.s}
  if(!t){el.innerHTML='';return}
  // an Influence change that touches you since your last decision is never lost behind later lines
  const n=myName();let mine=null;if(n){const from=UI.nowMark||0;for(let i=G.log.length-1;i>=0&&G.log[i].i>from;i--){const e=G.log[i];if(/Influence/.test(e.t)&&e.t.indexOf(n)>=0&&/steals|loses|gains/.test(e.t)){mine=e;break}}}
  const row=(tx,ss,cls)=>'<span class="nr'+(cls?' '+cls:'')+'"><i style="background:'+(ss>=0&&G.pl[ss]?fcol(ss):'#777')+'" aria-hidden="true"></i>'+esc(plain(tx))+'</span>';
  el.innerHTML=(mine&&mine.t!==t?row(mine.t,mine.s,'me'):'')+row(t,s)}
// wrap the computer step: a move that writes no log line still gets a line
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],q=G.q,l0=G.logN;let mv=null;const oc=aiChoose;
  aiChoose=function(a,b){mv=oc(a,b);return mv};try{o(w)}finally{aiChoose=oc}
  if(G.logN===l0&&q&&mv)UI.nowT={at:G.logN,s,t:aiFallback(s,q,mv)}}})();
// ---------------------------------------------------------------- glossary: every game word can be tapped for its meaning
const GLOSS=[
 ['influence',/\bInfluence\b/,'Influence','The score. Whoever holds the most Influence when the last round ends wins the throne. You gain it by winning Clashes and claiming locations.'],
 ['kingdom card',/\bKingdom Cards?\b/,'Kingdom Card','A shared power card. Win one with your bid: it sits on your board with your bid card tucked under it, and its power works for you as long as you keep it (at most two).'],
 ['great road',/\bGreat Road\b/,'Great Road','The row of four face-up Kingdom Cards you can bid for. Cards nobody takes slide along, and the oldest is thrown away each round.'],
 ['herald',/\bHeralds?\b/,'Herald','Your one public envoy. Put it on a location in Spring. If you then win that region and claim that location, you gain +1 Influence and take 1 from every rival Herald standing there.'],
 ['supporter',/\bSupporters?\b/,'Supporter','Small followers waiting on your board. Each one you send to a region adds +1 Strength there for its first Clash. All Supporters on the map are spent in Winter.'],
 ['clash',/\bClash(es)?\b/,'Clash','The fight in one region. Everyone\'s hidden cards there are flipped, abilities are used, and the highest total Strength (cards + Supporters) wins the region.'],
 ['strength',/\bStrength\b/,'Strength','The big number at the top left of a card. In a Clash you add up the Strength of your cards there, +1 per Supporter.'],
 ['region',/\bregions?\b/i,'Region','One of the three areas of the map: the Uplands, the Tablelands and the Sinks. Each has two locations and one Clash per round.'],
 ['location',/\blocations?\b/i,'Location','One of the six places on the map. The winner of a region\'s Clash claims one of its two locations: its Influence plus its bonus.'],
 ['bid',/\bbids?\b/i,'Bid','A card you choose secretly at the start of a round. Its Strength is the bid: the highest bid picks a Kingdom Card first.'],
 ['tactic',/\bTactics?\b/,'Tactic','Four special powers of your faction. Each can be used once; then it is Exhausted (some cards can refresh them).'],
 ['lore',/\bLore\b/,'Lore','A second currency. You gain it by a Journey and spend it on your faction\'s Site of Power cards.'],
 ['site of power',/\bSite of Power\b/,'Site of Power','Your faction\'s five extra cards, bought with Lore. If you buy them all, your leftover Lore turns into Influence at the end.'],
 ['govern',/\bGovern\b/,'Govern','An Autumn action, once a round: move a hand card that shows votes into one of the three Councils.'],
 ['journey',/\bJourney\b/,'Journey','An Autumn action, once a round: send away a hand card that shows Lore, and gain that much Lore.'],
 ['council',/\bCouncils?\b/,'Council','Three Councils (Coin, Whispers, Pledges). Cards with votes placed there give you a lasting benefit every round.'],
 ['attrition',/\bAttrition\b/,'Attrition','When you must draw and your deck is empty, your discard pile becomes a new deck and your hand size drops by one (never below 3).'],
 ['favour',/\b(Kingdom's )?Favour\b/,'Kingdom\'s Favour','A disc you claim at the Gleaning Meadow. While you hold it you may use your faction\'s Favour power (three uses), and it breaks ties at the end.'],
 ['order track',/\bOrder Track\b/,'Order Track','The turn order. At the start of each round the player with the most Influence goes first.'],
 ['winter',/\bWinter\b/,'Winter','The end of a round: Heralds go home, Supporters on the map are spent, and played cards go to the discard pile.'],
 ['autumn',/\bAutumn\b/,'Autumn','After the Clashes: once each you may Govern and Journey, and use Autumn abilities.'],
 ['ambush',/\bAmbush\b/,'Ambush','A Day ability: add a hidden card from your hand to this Clash.'],
 ['retreat',/\bRetreat\b/,'Retreat','A Day ability: pull your cards, Herald or Supporters out of this region.'],
 ['flank',/\bFlank\b/,'Flank','A Day ability: move this card to a region that has not fought yet.'],
 ['deadly',/\bDeadly\b/,'Deadly','A Night effect: every opposing card in the Clash is Eliminated (sent to the Lost Pile) unless it is protected.'],
 ['rally',/\bRally\b/,'Rally','An Autumn ability: take your cards on the map back into your hand before Winter discards them.'],
 ['deploy',/\bDeploy\b/,'Deploy','An Autumn ability: put a card face up next to a region; it stays through the next Winter(s).'],
 ['lost pile',/\bLost Pile\b/,'Lost Pile','Where Eliminated cards and spent Supporters go. They do not come back when your deck is reshuffled.'],
 ['hand size',/\bhand size\b/i,'Hand size','How many cards you draw up to each round (6 at the start). Attrition lowers it.'],
 ['occupier',/\boccup(ier|ying)\b/i,'Occupier','The faction card tucked under a Kingdom Card. A rival can steal the Kingdom Card with a bid stronger than its occupier.'],
 ['exhausted',/\bExhausted\b/,'Exhausted','A used Tactic. It cannot be used again unless something refreshes it.'],
];
const GL={};GLOSS.forEach(g=>GL[g[0]]=g);
// escape + wrap the first appearance of each term in this text with a tappable chip
function gloss(text){if(text==null)return '';text=String(text);const hits=[];
  for(const [k,re] of GLOSS){const m=re.exec(text);if(m)hits.push({i:m.index,n:m[0].length,k})}
  hits.sort((a,b)=>a.i-b.i||b.n-a.n);let out='',p=0;
  for(const h of hits){if(h.i<p)continue;out+=esc(text.slice(p,h.i));const nw=!(UI.glSeen&&UI.glSeen[h.k]);out+='<button type="button" class="gl'+(nw?' new':'')+'" data-a="gloss" data-t="'+esc(h.k)+'" aria-label="'+esc(text.substr(h.i,h.n))+': what does it mean?">'+esc(text.substr(h.i,h.n))+'</button>';p=h.i+h.n}
  return out+esc(text.slice(p))}
function showGloss(k){const g=GL[k];const el=$('#gdef');if(!g||!el)return;UI.glSeen=UI.glSeen||{};UI.glSeen[k]=1;
  el.innerHTML='<p><b>'+esc(g[2])+'</b>: '+esc(g[3])+'</p><button class="pp-x" data-a="gclose" aria-label="Close">'+ico('x')+'</button>';el.hidden=false;if(typeof sfx==='function')sfx('tap')}
function hideGloss(){const el=$('#gdef');if(el){el.hidden=true;el.innerHTML=''}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.more)UI.moreOpen=d.open},true);
// ---------------------------------------------------------------- the guided first game: fixed deal, one thing per step
// Deal: you lead the Heathbound Clans against the Gilded Court (easy), 4 rounds, seed 98 (found by a node search over seeds with the in-game names). With the suggested moves you meet the Court's Herald on
// Cairn Field and win there with your Heir and two Supporters: the +2, the Herald's +1 and the steal all happen in round 1.
const GUIDED={seed:98,ai:9,faction:'clans',rival:'nobility'};
const isGuided=()=>!!(UI.cfg&&UI.cfg.guided&&!NET.on);
const COACH_INFO=[
 {id:'goal',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'Your goal',text:()=>'Hold the most Influence when round '+G.rounds+' ends. Influence is the score: you and the Gilded Court both start at 0 (the chips at the bottom).',hl:'#rivals'},
 {id:'map',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'The kingdom',text:()=>'The map has three regions with two locations each. Every round each region has one Clash: the strongest side wins it and claims one of its two locations, which pays Influence. The numbers round the edge are the Influence track.',locs:[0,1,2,3,4,5]},
 {id:'round',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'One round, five steps',text:()=>'Bid for a Kingdom Card, place your Herald, hide one card at each region, fight the three Clashes, then count Influence. Let\'s play round 1 together: tap the glowing button each time.',btn:'Let\'s start'},
 {id:'own',when:()=>G.round===2&&G.q,title:'Now you lead',text:()=>'You have seen a whole round. From now on the ★ suggestion shows a good move and why, but every choice is yours. Tap any underlined word to read what it means.',btn:'Play on'}];
function coachGate(){if(!G||!G.q||UI.coachInfo)return !!UI.coachInfo;if(!isGuided())return false;UI.coachDone=UI.coachDone||{};
  const st=COACH_INFO.find(c=>!UI.coachDone[c.id]&&c.when());if(!st)return false;UI.coachInfo={id:st.id,title:st.title,text:st.text(),btn:st.btn,hl:st.hl,hlLocs:st.locs};return true}
function coachOk(){const c=UI.coachInfo;if(!c)return;UI.coachDone=UI.coachDone||{};UI.coachDone[c.id]=1;UI.coachInfo=null;$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));saveGame();pump()}
function coachInfoHTML(c){setTimeout(()=>{$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));if(c.hl){const e=$(c.hl);if(e)e.classList.add('coachhl')}},0);
  const n=COACH_INFO.findIndex(x=>x.id===c.id);return '<div class="step"><h3 class="st">'+esc(c.title)+'</h3><p class="coach info">'+gloss(c.text)+'</p>'+(n>=0&&n<3?'<p class="hint">'+(n+1)+' of 3 before you play</p>':'')+'</div>'}
const menuPhase=q=>((q.title||'').match(/(Spring|Day|Autumn)/)||[])[1]||'';
const byLabel=(mv,txt)=>mv.find(m=>(m.label||'').indexOf(txt)>=0);
// teaching moves for round 1 (falls back to the normal suggestion when the scripted card is not there)
function coachRec(s,mv){if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind;
  if(G.round===1){
    if(k==='bid')return byLabel(mv,'Sailing Hall');
    if(k==='bidRes')return byLabel(mv,'Knives\' Fellowship')||null;
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return riv?mv.find(m=>m.loc===riv.herald):byLabel(mv,'Cairn Field')}
    if(k==='place'){const P=G.pl[s];const heir=P.hand.find(id=>cinfo(id).archetype==='heir');if(heir!=null)return mv.find(m=>m.id===heir&&m.r===1);const big=P.hand.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength);
      if(big.length)return mv.find(m=>m.id===big[0]&&m.r===0)||mv.find(m=>m.id===big[0]);return null}
    if(k==='clashOrder')return mv.find(m=>m.order&&m.order.join()==='2,1,0')||null;
    if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'&&G.pl[s].supp.r[1]===0){const m=mv.find(x=>x.a==='supp'&&x.p.r===1&&x.p.n===2);if(m)return m}return mv.find(m=>m.t==='done')}}
  if(G.round===2&&q.t==='menu'&&menuPhase(q)==='Autumn'&&!UI.coachDone.au2){return mv.find(m=>m.a==='journey')||null}
  return null}
// guided round 1: the easy Court keeps its Tactics and skips optional actions, so the newcomer's first bid and Herald work as taught
(function(){const o=aiChoose;aiChoose=function(seat,level){if(isGuided()&&G&&G.round===1&&G.q&&G.pl[seat].ai){const mv=legal(seat);
  if(G.q.kind==='edict'){const k=mv.find(m=>m.k==='no'||m.yes===0);if(k)return k}
  if(G.q.t==='menu'){const d=mv.find(m=>m.t==='done');if(d)return d}}return o(seat,level)}})();
const STEPN=(n,t)=>'Step '+n+' of 6 · '+t;
// the coach line that replaces the prompt in round 1 (and the first time a few things appear later)
function coachFor(s,mv,rm){if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind,R=G.round;UI.coachDone=UI.coachDone||{};
  const nm=id=>cinfo(id).name+' ('+cinfo(id).strength+')';
  if(R===1){
    if(k==='bid')return {title:STEPN(1,'Bid'),pulse:1,noRec:1,text:'Pick a hand card as a secret bid: the higher bid picks a Kingdom Card first.'+(rm?' '+nm(rm.id)+' is fair and keeps your big cards for the Clashes.':'')};
    if(k==='bidRes')return {title:STEPN(2,'Take a Kingdom Card'),pulse:1,noRec:1,text:'You bid higher, so you choose first. A Kingdom Card is a lasting power.'+(rm&&rm.kc?(/Knives/.test(TB.kingdomInfo(rm.kc).name)?' Take '+TB.kingdomInfo(rm.kc).name+': your Heir becomes Deadly. Its price: keep your Heir away from rival Followers.':' Take '+TB.kingdomInfo(rm.kc).name+' (tap it to read it).'):'')};
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return {title:STEPN(3,'Place your Herald'),pulse:1,noRec:1,text:'Win the region where your Herald stands and claim its location: +1 Influence, and you take 1 from each rival Herald there.'+(riv&&rm?' The Court is on '+LOCN[riv.herald]+': join it.':'')}}
    if(k==='place'){const n=UI.V.reg.reduce((a,R2)=>a+R2.down.filter(id=>id>=0&&ownerOf(id)===s).length,0);
      return {title:STEPN(4,'Hide a card at each region'),pulse:1,noRec:1,text:'Card '+Math.min(3,n+1)+' of 3, hidden until the Clash. '+(rm?nm(rm.id)+' to '+REG[rm.r]+(cinfo(rm.id).archetype==='heir'?': your strongest card where both Heralds wait.':'.'):'Choose a card for each region.')}}
    if(q.t==='menu'&&menuPhase(q)==='Spring'){const sent=G.pl[s].supp.r[1]>0;return {title:STEPN(5,'Send Supporters'),pulse:1,noRec:1,text:sent?'Two Supporters stand with your Heir. Now finish Spring.':'Each Supporter you send adds +1 Strength in a region\'s first Clash. Send 2 to the Tablelands to back your Heir.'}}
    if(k==='clashOrder')return {title:'Choose the Clash order',pulse:1,noRec:1,text:'The player with the least Influence decides which region fights first. Any order works: take the suggested one.'};
    if(q.t==='menu'&&menuPhase(q)==='Day')return {title:'Day actions',pulse:1,noRec:1,text:'Cards are face up. Some have Day abilities like Ambush or Flank; you need none now.'};
    if(k==='location')return {title:STEPN(6,'Claim a location'),pulse:1,noRec:1,text:'You won this Clash! Pick one of the region\'s two locations.'+(rm?' '+whyFor(s,rm):'')};
    if(k==='tie')return {title:'A tie!',pulse:1,text:'Both sides have the same total. Each of you may add one more hidden card, or pass. If nobody adds one, nobody wins here.'};
    if(q.t==='menu'&&menuPhase(q)==='Autumn')return {title:'Autumn',pulse:1,noRec:1,text:'In Autumn you may Govern and Journey. We try that next round; finish Autumn for now.'};
    if(q.t==='sel'||q.t==='pick')return {title:'A location bonus',pulse:1,text:'The location you claimed gives a bonus. '+(rm?'The suggestion is fine: '+recBtnText(rm)+'.':'Choose one.')}}
  if(R===2&&q.t==='menu'&&menuPhase(q)==='Autumn'&&!UI.coachDone.au2){if(rm&&rm.a==='journey')return {title:'Autumn: Journey and Govern',pulse:1,text:'Journey sends a hand card away for Lore, which buys your faction\'s Site of Power cards. Govern puts a card with votes into a Council for a lasting bonus. Try a Journey now.'};UI.coachDone.au2=1}
  if(R===2&&k==='siteBuy'&&!UI.coachDone.sb){return {title:'Spend Lore?',pulse:1,text:'Lore buys your Site of Power cards: strong extra cards for your deck. Keep it if nothing is affordable yet.'}}
  return null}
function coachEvent(ev){if(!isGuided())return '';UI.coachDone=UI.coachDone||{};const k='ev_'+ev.t;
  if(ev.t==='bids'&&G.round===1){const me=humans()[0];const b=ev.bids.find(x=>x.seat===me);const tac=G.log.filter(e=>e.r===1&&e.s!==me&&/ plays /.test(e.t)).map(e=>e.t)[0];
    if(b&&tac&&b.str<cinfo(b.id).strength)return 'The Court played a Tactic (a once-only power): '+tac.replace(/^.*? plays /,'').replace(/\.$/,'')+'. So your bid counts as '+b.str+' and the Court chooses first. Tactics come back later; for now just watch.';
    return 'Both bids are revealed. The higher bid chooses first; a tie goes to whoever is higher on the Order Track.'}
  if(ev.t==='clash'&&G.round===1&&!UI.coachDone[k+ev.r]){return ev.idx===0?'The hidden cards are flipped. Each side adds the Strength of its cards, +1 per Supporter. The higher total wins the region.':''}
  if(ev.t==='summary'&&ev.round===1){const me=humans()[0];const a=ev.inf1[me],b=Math.max(...ev.inf1.filter((_,i)=>i!==me));return 'Scoring: you have '+a+' Influence, the Court has '+b+'. '+(a>b?'You lead!':'Keep going.')+' The leader acts first next round. '+(G.rounds-1)+' rounds to go.'}
  return ''}
// guided: mark the Autumn coach as done once the player acts in round 2 Autumn
(function(){const o=humanMove;humanMove=function(k){if(G)UI.nowMark=G.logN;const was=G&&G.q&&G.q.t==='menu'&&menuPhase(G.q)==='Autumn'&&G.round===2;if(G&&G.q&&G.q.kind==='siteBuy'&&UI.coachDone)UI.coachDone.sb=1;const r=o(k);if(was&&r&&UI.coachDone)UI.coachDone.au2=1;return r}})();
// end screen: where the Influence came from (from the engine's own counters; a client without them shows nothing)
function overBreakdown(){const st=G.stats&&Object.keys(G.stats).some(k=>/^src:/.test(k))?G.stats:(G.over&&G.over.src)||null;if(!st)return '';
  const rows=G.pl.map(p=>{const parts=[];let sum=0;for(const k in st){const m=k.match(/^src:([a-z]+):(.*)$/);if(m&&m[1]===p.fac){parts.push([m[2],st[k]]);sum+=st[k]}}
    parts.sort((a,b)=>b[1]-a[1]);const bonus=G.over.bonus&&G.over.bonus[p.seat]||0,rest=p.inf-sum-bonus;
    if(bonus)parts.push(['Leftover Lore (Site of Power emptied)',bonus]);if(rest)parts.push([rest>0?'Taken by your Herald from rivals':'Taken by rival Heralds',rest]);
    return '<li style="--fc:'+fcol(p.seat)+'"><b>'+esc(shortName(p.seat))+'</b><span class="bd-t">'+p.inf+' Influence</span><span class="bd-l">'+(parts.length?parts.map(x=>'<i>'+esc(x[0])+' <b>'+sgn(x[1])+'</b></i>').join(''):'none')+'</span></li>'}).join('');
  return '<h4 class="bdh">Where the Influence came from</h4><ul class="rank bd2">'+rows+'</ul>'+histHTML()}
// Influence after each round (recorded from the end-of-round summaries, kept in the save)
function histHTML(){const H=UI.hist;if(!H||!H.length)return '';const mx=Math.max(1,...H.flat(),...G.pl.map(p=>p.inf));const n=H.length;
  const W=280,Ht=96,x=i=>Math.round(14+(W-28)*(n>1?i/(n-1):.5)),y=v=>Math.round(Ht-10-(Ht-22)*v/mx);
  let svg='<svg class="hist" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Influence after each round">';
  for(let i=0;i<n;i++)svg+='<text x="'+x(i)+'" y="'+(Ht-1)+'" text-anchor="middle" font-size="9" fill="#d8c69a">R'+(i+1)+'</text>';
  G.pl.forEach((p,s)=>{const pts=H.map((r,i)=>x(i)+','+y(r[s]||0)).join(' ');svg+='<polyline points="'+pts+'" fill="none" stroke="'+fcol(s)+'" stroke-width="2.5"/>'+H.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(r[s]||0)+'" r="3" fill="'+fcol(s)+'"/>').join('')+'<text class="tbx-cb" x="'+(x(n-1)+6)+'" y="'+(y(H[n-1][s]||0)+4)+'" font-size="10" fill="#fff">'+GX.mark(s)+'</text>'});
  return '<h4 class="bdh">Influence round by round</h4>'+svg+'</svg>'}
// ---------------------------------------------------------------- title + setup
const STORY={
 nobility:{story:'The old court still dresses for dinner in a palace with no king. Its stewards count every coin and every vote, and they mean to crown one of their own before the frost.',enjoy:'Choose the Gilded Court if you enjoy steady income, sturdy cards and winning the Councils.',tag:'Defence and votes · easy to learn'},
 clans:{story:'From the cold coasts the clans ride in with the tide. They move fast, bring many hands, and strike where the valley folk least expect them.',enjoy:'Choose the Heathbound Clans if you enjoy big swings, riders that switch regions and crowds of Supporters.',tag:'Speed and numbers · easy to learn'},
 uprising:{story:'In the dockside alleys, printers and ferrymen pass notes by lantern-light. They cannot win a fair fight, so they never fight fair.',enjoy:'Choose the Lantern Rising if you enjoy bluffs, ambushes and knocking your rivals\' cards out of the game.',tag:'Tricks and ambushes · medium'},
 gathering:{story:'Under the moon the Choir sings to what others threw away. Lost cards return to them, small cards win their fights, and patience is their weapon.',enjoy:'Choose the Pale Choir if you enjoy clever combinations and playing the long game.',tag:'Combos and patience · harder'}};
const sv={mode:'me',np:3,faction:'clans',length:'standard',guide:'full',levels:['normal','normal','normal','normal']};
function titleArt(){return '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+
 '<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a1c"/><stop offset=".45" stop-color="#3a1a30"/><stop offset=".72" stop-color="#8a3c3a"/><stop offset=".86" stop-color="#d98a52"/><stop offset="1" stop-color="#f2c27a"/></linearGradient>'+
 '<radialGradient id="tmoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6"/><stop offset=".55" stop-color="#f6e2a8" stop-opacity=".9"/><stop offset="1" stop-color="#f6e2a8" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>'+
 '<filter id="tblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>'+
 '<filter id="tpaint"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>'+
 '<rect width="1200" height="800" fill="url(#tsky)"/>'+
 [[120,80],[260,150],[410,60],[530,120],[700,40],[860,110],[1010,70],[1120,160],[330,230],[960,220],[620,190],[80,260]].map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="'+(i%3?1.6:2.4)+'" fill="#fff3d0" opacity="'+(.5+(i%4)*.12)+'"/>').join('')+
 '<circle cx="860" cy="210" r="170" fill="url(#tmoon)" opacity=".55"/><circle cx="860" cy="210" r="62" fill="#fbecc0"/><circle cx="842" cy="196" r="12" fill="#e9d29a" opacity=".6"/><circle cx="880" cy="228" r="8" fill="#e9d29a" opacity=".5"/>'+
 '<path d="M0 470 L120 400 L210 430 L320 360 L430 420 L520 380 L640 440 L760 370 L880 430 L1000 380 L1110 420 L1200 390 L1200 800 L0 800Z" fill="#4a2338" opacity=".85"/>'+
 '<path d="M0 520 C150 470 260 500 380 480 C520 455 600 520 760 500 C900 482 1020 450 1200 490 L1200 800 L0 800Z" fill="#2c1424"/>'+
 '<g fill="#1d0d18"><path d="M930 470 L930 400 L945 385 L960 400 L960 430 L985 430 L985 380 L1003 360 L1021 380 L1021 430 L1045 430 L1045 405 L1060 390 L1075 405 L1075 470Z"/><rect x="999" y="395" width="8" height="12" fill="#ffcf7a" opacity=".8"/><rect x="941" y="412" width="7" height="10" fill="#ffcf7a" opacity=".6"/></g>'+
 '<ellipse cx="600" cy="560" rx="700" ry="60" fill="#f2c27a" opacity=".16" filter="url(#tblur)"/>'+
 '<path d="M0 620 C200 570 380 600 600 585 C820 570 1000 600 1200 575 L1200 800 L0 800Z" fill="#170a12"/>'+
 // the throne, wrapped in thorns
 '<g transform="translate(600 640)"><path d="M-110 0 L-110 -210 L-128 -240 L-92 -265 L-70 -330 L-40 -300 L0 -380 L40 -300 L70 -330 L92 -265 L128 -240 L110 -210 L110 0Z" fill="#120810" stroke="url(#tgold)" stroke-width="5" stroke-linejoin="round"/>'+
 '<path d="M-150 0 L-150 -80 L-118 -96 L118 -96 L150 -80 L150 0Z" fill="#1a0c14" stroke="url(#tgold)" stroke-width="5"/><path d="M-118 -96 L-110 -130 L110 -130 L118 -96Z" fill="#2a1420" stroke="url(#tgold)" stroke-width="4"/>'+
 '<circle cx="0" cy="-300" r="14" fill="#c23a48" stroke="#ffe7a0" stroke-width="3"/>'+
 '<g fill="none" stroke="#3d7a3a" stroke-width="7" stroke-linecap="round"><path d="M-160 -10 C-60 -60 -170 -140 -90 -190 C-20 -235 -120 -290 -40 -330"/><path d="M160 -20 C70 -70 175 -150 95 -200 C30 -240 120 -300 30 -350"/><path d="M-140 -60 C-40 -120 60 -40 140 -110"/></g>'+
 '<g fill="#5aa04f">'+[[-150,-28],[-102,-70],[-128,-140],[-82,-200],[-74,-262],[-44,-318],[150,-40],[110,-90],[128,-160],[88,-215],[86,-276],[44,-336],[-80,-96],[20,-78],[110,-104]].map(([x,y],i)=>'<path d="M'+x+' '+y+' l'+(i%2?9:-9)+' -7 l2 11Z"/>').join('')+'</g>'+
 '<g fill="#c23a48"><circle cx="-96" cy="-192" r="9"/><circle cx="98" cy="-202" r="8"/><circle cx="-40" cy="-108" r="7"/></g></g>'+
 '<g fill="#2a1a10" opacity=".9"><path d="M0 800 L0 700 C60 690 120 720 180 705 L240 800Z"/><path d="M1200 800 L1200 690 C1140 684 1080 716 1010 700 L960 800Z"/></g>'+
 '<rect width="1200" height="800" filter="url(#tpaint)" fill="#fff" opacity="'+(UI.lowGfx?0:1)+'"/></svg>'}
function hasSave(){const s=loadSave();return s&&s.G&&!s.G.over?s:null}
function showStart(){try{GX.close()}catch(e){}closePop(true);hideGloss();const el=$('#start');el.hidden=false;document.body.classList.add('in-start');if(!NET.on){if(UI.joinCode&&!UI.linkShown){UI.linkShown=1;UI.sv='online'}else UI.sv=UI.onl&&UI.sv==='online'?'online':'title'}UI.cfgOpen=false;renderStart();
  const f=$('#start .tbtn.go,#start .sbtn.big');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function hideStart(){$('#start').hidden=true;document.body.classList.remove('in-start')}
function renderStart(){const el=$('#start');if(!el||el.hidden)return;const top=el.scrollTop;
  const view=NET.on?'online':(UI.sv||'title');el.dataset.v=view;
  if(view==='title'){const sav=hasSave();
    el.innerHTML='<div class="ttl"><div class="ttl-art">'+titleArt()+'</div><div class="ttl-in"><h1 class="logo"><small>THE</small>Thornbound Throne</h1><p class="tag">The king is dead. Four factions reach for his crown.</p><div class="tmid"></div><div class="tbtns">'+
      '<button class="tbtn go" data-a="play"><b>Play</b><span>'+(firstTime()?'new here? a guided first game is ready':'against the computer')+'</span></button>'+
      '<button class="tbtn" data-a="online"><b>Online</b><span>with friends, free, no sign-up</span></button>'+
      (sav?'<button class="tbtn" data-a="cont"><b>Resume</b><span>your game, round '+Math.max(1,sav.G.round)+' of '+sav.G.rounds+'</span></button>':'')+
      '</div><div class="tlinks"><button class="tlink" data-a="rules">How to play</button><button class="tlink" data-a="refopen">Cards</button><button class="tlink" data-a="setopen">Settings</button></div></div><p class="st-c">Original art and words. Fonts: Cinzel and EB Garamond (SIL OFL).</p></div>';return}
  const ONL=view==='online';
  el.innerHTML='<div class="setup"><div class="bgart">'+titleArt()+'</div>'+(ONL?onlineSetupHTML():setupHTML())+'</div>'+(UI.phone&&UI.cfgOpen&&!ONL?cfgDialogHTML():'');
  el.scrollTop=top}
function firstTime(){try{return !localStorage.getItem('tb_played')}catch(e){return true}}
function facCard(f,on){const k=TBKit.FACTIONS[FK[f]],S=STORY[f];return '<button class="fcard'+(on?' on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'" aria-pressed="'+on+'"><span class="ft"><span class="fe">'+TBKit.token('influence',{faction:FK[f]},44).outerHTML+'</span><span><b>'+esc(DD.FNAME[f])+'</b><small>'+esc(S.tag)+'</small></span></span><p>'+esc(S.story)+'</p><p class="enj">'+esc(S.enjoy)+'</p>'+(sv.np===2&&BAL2[f]?'<p class="bal">'+esc(BAL2[f])+'</p>':'')+(on?'<span class="fpick">Your faction ✓</span>':'')+'</button>'}
// honest 2-player balance, from 500 computer games per pairing (ENGINE-REPORT.md)
const BAL2={nobility:'Strongest at 2 players: wins about 6 games in 10.',clans:'Hardest at 2 players: wins about 4 games in 10.'};
function seatRows(ONL,plan){const n=ONL?plan.np:sv.np;const rest=FIDS.filter(f=>f!==sv.faction);let h='';
  for(let i=0;i<n;i++){const f=i===0?sv.faction:rest[i-1];const k=TBKit.FACTIONS[FK[f]];const human=ONL?i<plan.hum.length:i===0;
    h+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(ONL?'Online: '+esc(plan.hum[i].nm)+(i===0?' (you)':''):'You'):'Computer')+'</small></span>'+(human?'':levelSeg(i))+'</div>'}
  return '<div class="seats">'+h+'</div>'}
function levelSeg(i){return '<div class="seg" role="radiogroup" aria-label="Computer level">'+['easy','normal','hard'].map(l=>'<button class="'+(sv.levels[i]===l?'on':'')+'" data-a="lv" data-i="'+i+'" data-v="'+l+'" aria-pressed="'+(sv.levels[i]===l)+'">'+l[0].toUpperCase()+l.slice(1)+'</button>').join('')+'</div>'}
function optionsHTML(ONL,plan){return '<div class="opts2">'+(ONL?'':'<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div></div>')+
  '<div class="row"><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="row"><span>Tips</span><div class="seg">'+[['full','Full'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+seatRows(ONL,plan)+'</div>'}
function sumLine(){const n=sv.np-1;return 'You lead <b>'+esc(DD.FSHORT[sv.faction])+'</b> against '+n+' computer'+(n>1?'s':'')+' · '+({short:4,standard:5,extended:6}[sv.length])+' rounds'}
function setupHTML(){const ph=UI.phone;const k=TBKit.FACTIONS[FK[sv.faction]];
  const guide='<div class="guidebox"><p><b>First time?</b> The guided game teaches one step at a time: you lead the Heathbound Clans against an easy Gilded Court for 4 rounds (about 15 minutes).</p></div>';
  const ft=firstTime();const gbtn='<button class="sbtn'+(ft?' big':'')+'" data-a="guided" data-start="guided"><b>'+(ft?'Guided first game':'Guided game')+'</b><span>'+(ft?'recommended: learn one step at a time':'learn step by step')+'</span></button>';
  const go='<div class="sgo">'+(ft?gbtn:'')+'<button class="sbtn'+(ft?'':' big')+'" data-a="start" data-start="go"><b>Start the game</b><span>'+sumLine().replace(/<[^>]+>/g,'')+'</span></button><div class="sgrid3">'+(ft?'<button class="sbtn" data-a="rules"><b>How to play</b><span>the rules in short</span></button>':gbtn)+
    '<button class="sbtn" data-a="mode" data-v="hot" data-go="1" data-start="hot"><b>Hot-seat</b><span>'+sv.np+' people, one device</span></button>'+
    '<button class="sbtn" data-a="mode" data-v="watch" data-go="1" data-start="watch"><b>Watch</b><span>the computers play</span></button></div></div>';
  const head='<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Choose your faction</h2></div>';
  if(ph)return head+(firstTime()?guide:'')+'<div class="ssum" style="--fc:'+k.main+'"><span class="fe">'+TBKit.token('influence',{faction:FK[sv.faction]},40).outerHTML+'</span><span class="sline">'+sumLine()+'</span><button class="btn" data-a="cfgopen">Configure</button></div><p class="ssub">'+esc(STORY[sv.faction].enjoy)+'</p>'+go;
  return head+'<p class="ssub">Each faction plays the same rules with its own cards and powers. Pick the story you like.</p>'+(firstTime()?guide:'')+'<div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+go}
function cfgDialogHTML(){return '<div class="cfgdlg" role="dialog" aria-label="Configure the game"><div class="cfghead"><b>Configure</b><button class="btn" data-a="cfgclose">Done</button></div><div class="cfgbody"><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+'</div><div class="cfgfoot"><button class="btn pri big" data-a="cfgclose">Done</button></div></div>'}
function onlineSetupHTML(){const host=NET.on&&isHost(),plan=host?netPlan():null;
  return '<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Play online</h2></div><p class="ssub">Host a room and send friends the code or link. Every browser connects directly, nobody sees another hand, and empty seats go to the computer.</p>'+onlineBlock()+
   (host?'<h2 class="sh2">Your faction</h2><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(true,plan)+'<div class="sgo"><button class="sbtn big" data-a="start" data-start="go"><b>Start online game</b></button>'+(G&&UI.started?'<button class="sbtn" data-a="netback"><b>Back to the game</b></button>':'')+'</div>':'')}
function startFromSetup(){hideStart();try{localStorage.setItem('tb_played','1')}catch(e){}const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv.map((l,i)=>i===0?l:sv.levels[i]),guide:sv.guide};
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
// ===================== part 8: shared GX kit (settings, reference, undo + bid confirm, recap, results, offline) =====================
const GAME_ID='thornbound';
// ---------------------------------------------------------------- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH=[
 {id:'first',name:'A seat at court',how:'Finish a game.',test:r=>true},
 {id:'guide',name:'Taught by the Herald',how:'Finish the guided first game.',test:r=>r.mode==='guided'},
 {id:'win',name:'The thorns part',how:'Win the throne against the computer.',test:r=>r.won&&(r.mode==='vs'||r.mode==='guided')},
 {id:'hard',name:'Crowned in iron',how:'Win a 3- or 4-player game against hard computers.',test:r=>r.won&&r.mode==='vs'&&r.level==='hard'&&r.np>=3},
 {id:'twenty',name:'The realm listens',how:'End a game with 20 Influence or more.',test:r=>r.score>=20},
 {id:'sweep',name:'Three banners',how:'Win all three Clashes in one round.',test:(r,s,x)=>x.extra&&x.extra.sweep},
 {id:'site',name:'Every stone laid',how:'Buy all five of your Site of Power cards in one game.',test:(r,s,x)=>x.extra&&x.extra.site},
 {id:'four',name:'Four crowns',how:'Win with each of the four factions.',test:(r,s,x)=>x.extra&&x.extra.facWins>=4},
 {id:'hot',name:'Pass the crown',how:'Finish a hot-seat game.',test:r=>r.mode==='hot'},
 {id:'online',name:'Envoys abroad',how:'Finish an online game.',test:r=>r.mode==='online'}];
// ---------------------------------------------------------------- settings: the same sections as every game; Thornbound adds its own rows
const sbtn=(a,txt,dis,extra)=>{const b=document.createElement('button');b.type='button';b.className='gx-sb';b.dataset.a=a;b.textContent=txt;if(dis)b.disabled=true;if(extra)for(const k in extra)b.dataset[k]=extra[k];return b};
function kitSettings(){
  GX.settings({id:'setd',title:'Menu',
    game:S=>{
      if(NET.on)S.appendChild(GX.row('Online',[sbtn('netopen','Lobby'),isHost()?sbtn('newgame','Change setup'):null,sbtn('netleave','Leave the room')]));
      else S.appendChild(GX.row('This game',[sbtn('newgame','New game'),sbtn('savenow','Save now',!G||!UI.started||!!G.over)]));
      S.appendChild(GX.row('Undo',sbtn('undo','Undo my last step',!GX.undo.can()),'Hidden cards and Supporters, until the turn passes or a card is revealed'));
    },
    sound:S=>{S.appendChild(GX.row('Sound effects',GX.onoff(UI.sound,v=>{UI.sound=v;try{localStorage.setItem('tb_snd',v?'1':'0')}catch(x){}if(window.GA)GA.setSfx(v)},'Sound effects')));
      S.appendChild(GX.row('Music',GX.onoff(UI.music,v=>{UI.music=v;try{localStorage.setItem('tb_mus',v?'1':'0')}catch(x){}if(window.GA)GA.setMusic(v);if(v)musicFor()},'Music')))},
    help:S=>{S.appendChild(GX.row('Read',[sbtn('rules','How to play'),sbtn('refopen','Cards & map')]));
      S.appendChild(GX.row('Guide',GX.seg([['full','Full tips'],['light','Light'],['off','Off']],UI.guide,v=>{UI.guide=v;if(G&&UI.started)renderAll()},'Guide level'),'Step tips and the suggested move'))},
    graphics:S=>S.appendChild(GX.row('Graphics',GX.seg([['high','High'],['low','Low (fast)']],UI.lowGfx?'low':'high',v=>{UI.lowGfx=v==='low';try{localStorage.setItem('tb_gfx',v)}catch(x){}UI.mapReset=true;if(G&&UI.started)renderAll()},'Graphics'))),
    about:{name:'The Thornbound Throne',version:'preview',text:'An original game of four factions reaching for an empty throne. Names, card texts and pictures are our own; the pictures are drawn in code. Fonts: Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1. Music: "Dark Forest Theme" by cynicmusic and "Dungeon Ambience" by yd (OpenGameArt, CC0). Sound effects by Kenney (CC0).'}})}
// ---------------------------------------------------------------- component reference
function refCardSpec(f,k){const D=DD,c=k<14?D.BASIC[k]:D.SITE[f][k-14],nm=k<14?(D.BASICNAMES[f]||[])[k]:c.nm;const ar=c.ar||(c.kind==='hq'?'':'ruse');
  const art=(ART[ar]&&(ART[ar][f]||ART[ar]._))||(c.kind==='hq'?'ruin_arch':'banner');const tr=(c.tr||[]).map(t=>TRAIT_N[t]||t);
  const bits=[];if(c.v)bits.push(c.v+' vote'+(c.v>1?'s':''));if(c.l)bits.push(c.l+' lore');
  return {faction:FK[f],title:nm,value:c.kind==='hq'?null:c.s,cost:c.lc>0?c.lc:null,type:c.kind==='hq'?'relic':(ARCH_TYPE[ar]||'unit'),typeLabel:c.kind==='hq'?'HQ':(ARCH_LBL[ar]||'Card'),art,text:(((tr.length?tr.join(', ')+'. ':'')+(c.txt||'')).trim())||'No special ability.',tag:bits.join(' · ')||undefined}}
function refPic(it,big){const p=it.pic||{},w=big?200:52;
  if(p.fac)return TBKit.card(refCardSpec(p.fac,p.k),w);
  if(p.kc)return TBKit.card(kcSpec(p.kc),w);
  const sz=big?72:36;
  if(p.tac)return TBKit.token('influence',{faction:FK[p.tac]},sz);
  if(p.loc!=null){const l=DD.LOCS[p.loc];return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="21" fill="#2a1c10" stroke="#e8c867" stroke-width="2.5"/><text y="7" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="19" fill="#fff0b8">+'+l[2]+'</text></svg>'}
  if(p.council)return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><rect x="-19" y="-19" width="38" height="38" rx="8" fill="#3a2414" stroke="#e8c867" stroke-width="2.5"/><text y="7" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="17" fill="#fff0b8">'+SUIT_N[p.council][0]+'</text></svg>';
  if(p.piece==='herald')return TBKit.token('herald',{faction:'gilded'},sz);
  if(p.piece==='supp')return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="15" fill="#2a9d8f" stroke="#fff3c4" stroke-width="3"/><text y="6" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">1</text></svg>';
  if(p.piece==='fav')return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="18" fill="#e8c867" stroke="#fff3c4" stroke-width="3"/><path d="M0 -11 L3.2 -3.2 11 -3.2 4.6 2 7 10 0 5 -7 10 -4.6 2 -11 -3.2 -3.2 -3.2Z" fill="#fff6d0" stroke="#4a3208"/></svg>';
  if(p.piece==='inf')return TBKit.token('influence',{faction:'lantern'},sz);
  return null}
function refInGame(it){if(!G)return true;const p=it.pic||{};
  if(p.fac||p.tac)return G.pl.some(P=>P.fac===(p.fac||p.tac));
  if(p.kc){const V=UI.V||G;return (V.road||[]).includes(p.kc)||V.pl.some(P=>(P.ks||[]).some(T=>T&&T.kc===p.kc)||(P.sup||[]).includes(p.kc))||V.loc.some(L=>L.kc.some(k=>k.n===p.kc))}
  return true}
function refIdOfCard(id){const s=ownerOf(id);return 'f-'+G.pl[s].fac+'-'+(id%100)}
function kitReference(){GX.reference(TB.refSections(DD),{title:'Cards & map',label:'Cards',picture:refPic,inGame:refInGame,before:'[data-gx="boardd"]'})}
// "Read it big" on the card, Kingdom Card and location pop-ups
(function(){const o=renderPop;renderPop=function(){o();const el=$('#ppop');if(!el||el.hidden||!UI.pop)return;const a=UI.popArg||{};let rid=null;
  if(UI.pop==='card'&&a.id!=null&&a.id>=0)rid=refIdOfCard(a.id);else if(UI.pop==='kc')rid='kc'+a.n;else if(UI.pop==='loc')rid='loc'+a.l;
  const b=el.querySelector('.pp-b');if(rid&&b&&!b.querySelector('[data-a=refcard]')){const x=document.createElement('p');x.className='pp-ref';x.innerHTML='<button class="lk" data-a="refcard" data-r="'+esc(rid)+'">Read it in the card list</button>';b.appendChild(x)}}})();
// ---------------------------------------------------------------- undo: snapshot before a local human step. Sealed when the decision passes to another
// seat (hot-seat included), or when a card, the Kingdom deck, the dice of the shuffle, a clash or a round moved on. Off online.
const humansPending=g=>g&&g.q&&!g.over?g.q.seats.filter(s=>!g.pl[s].ai).join(','):null;
function revealed(a,b){if(!a)return true;if(a.rng!==b.rng||a.round!==b.round||a.phase!==b.phase||!!a.over!==!!b.over||a.bidRev!==b.bidRev)return true;
  if(JSON.stringify(a.clash)!==JSON.stringify(b.clash)||JSON.stringify(a.road)!==JSON.stringify(b.road)||a.kdeck.length!==b.kdeck.length)return true;
  for(let r=0;r<a.reg.length;r++)if(a.reg[r].up.length!==b.reg[r].up.length||a.reg[r].done!==b.reg[r].done)return true;
  for(let s=0;s<a.pl.length;s++){const p=a.pl[s],q=b.pl[s];if(p.deck.length!==q.deck.length||p.disc.length!==q.disc.length)return true}
  return a.lost.length!==b.lost.length}
function kitUndo(){GX.undo.config({get:()=>G,owner:humansPending,online:()=>NET.on,
  set:s=>{G=s;UI.evq=[];UI.sel={};UI.hand=null;UI.pendBid=null;UI._rk=null;closePop(true);hideGloss();MAP.slotDirty=true;saveGame();toast('Step undone.');renderAll();pump()},
  onChange:can=>{if(can!==UI.undoCan){UI.undoCan=can;if(G&&UI.started)renderMain()}}})}
function doUndo(){if(GX.undo.undo())sfx('tap')}
// ---------------------------------------------------------------- the bid is confirmed before it is locked in (one tap used to commit it)
(function(){const o=humanMove;humanMove=function(k){
  if(G&&G.q&&G.q.kind==='bid'&&UI.pendBid!==k){const s=NET.on?NET.mySeat:viewSeatForQ();const m=s!=null&&s>=0?legal(s).find(x=>x.k===k):null;if(m&&m.t==='bid'){UI.pendBid=k;closePop(true);UI.hand=m.id;renderAll();sfx('tap');return true}}
  UI.pendBid=null;const s0=NET.on?NET.mySeat:viewSeatForQ(),l0=G?G.logN:0,local=!NET.on&&s0!=null;
  if(local)GX.undo.snap(k);
  const r=o(k);
  if(local){if(!r)GX.undo.drop();else{GX.undo.check(revealed);GX.recap.mark(s0);GX.recap.push(logSince(l0).map(e=>plain(e.t)),s0)}}
  return r}})();
function bidConfirmHTML(){const m=legal(viewSeatForQ()).find(x=>x.k===UI.pendBid);if(!m)return null;const i=cinfo(m.id);
  return {h:'<div class="step" data-q="bidok"><h3 class="st">Confirm your bid</h3><div class="bidok"><span class="th" data-owner="'+ownerOf(m.id)+'" data-up="1">'+cardEl(m.id,UI.phone?52:64).outerHTML+'</span><p>'+gloss('You bid '+i.name+' (Strength '+i.strength+'). Once everyone has bid, the bids are revealed and the highest bid picks a Kingdom Card first.')+'</p></div><p class="hint">Changed your mind? Choose another card first.</p></div>',
    f:'<button class="btn" data-a="bidx">Choose another</button><button class="btn pri pulse" data-a="mv" data-k="'+esc(m.k)+'">Confirm bid</button>'}}
(function(){const o=renderMain;renderMain=function(){
  if(UI.pendBid&&!(G&&G.q&&G.q.kind==='bid'&&viewSeatForQ()!=null&&!UI.coachInfo&&!(UI.card&&UI.card.kind==='pass')))UI.pendBid=null;
  if(UI.pendBid){const r=bidConfirmHTML();if(r){const el=$('#main'),ft=$('#act');el.innerHTML=r.h;ft.innerHTML=r.f;setHl([]);return}UI.pendBid=null}
  o();const ft=$('#act');
  if(ft&&GX.undo.can()&&!G.over&&viewSeatForQ()!=null&&!UI.coachInfo&&!(UI.card&&UI.card.kind==='pass')){const b=document.createElement('button');b.className='btn undo';b.dataset.a='undo';b.setAttribute('aria-label','Undo my last step');b.textContent='↶ Undo';ft.insertBefore(b,ft.firstChild)}}})();
// ---------------------------------------------------------------- "since your last turn" strip in the dock
function kitRecap(){GX.recap.attach('#dockbody',{before:true,title:'Since your turn'})}
function recapSeats(){GX.recap.clear();const hs=G?humans():[];GX.recap.seats(hs.length?hs:[0])}
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],l0=G.logN;o(w);if(G&&!NET.on)GX.recap.push(logSince(l0).map(e=>plain(e.t)),s)}})();
// ---------------------------------------------------------------- results, statistics, achievements
function kitTrackClash(ev){if(G&&ev.t==='summary'&&ev.inf1){UI.hist=UI.hist||[];UI.hist[ev.round-1]=ev.inf1.slice()}
  if(!G||ev.t!=='clash'||ev.winner==null||ev.winner<0)return;UI.cw=UI.cw||{};const k=ev.round||G.round;const a=UI.cw[k]=UI.cw[k]||{};a[ev.r]=ev.winner}
function swept(seat){const W=UI.cw||{};for(const k in W){const a=W[k];if([0,1,2].every(r=>a[r]===seat))return true}return false}
function kitResult(){
  if(!G||!G.over||UI.resultDone)return;UI.resultDone=true;GX.undo.clear();GX.recap.clear();
  const hs=humans();if(!hs.length||(NET.on&&NET.mySeat<0))return;  // watching computers: not your game
  const me=NET.on?NET.mySeat:hs.length===1?hs[0]:-1;
  const mode=NET.on?'online':isGuided()?'guided':UI.mode==='hot'||hs.length>1?'hot':'vs';
  const seats=G.pl.map((p,i)=>({name:p.name,ai:p.ai||null,me:i===me}));
  let extra=null;
  if(me>=0){const P=G.pl[me];let fw={};try{fw=JSON.parse(localStorage.getItem('tb_facwins')||'{}')||{}}catch(e){}
    if(G.over.winner===me&&mode!=='hot'){fw[P.fac]=1;try{localStorage.setItem('tb_facwins',JSON.stringify(fw))}catch(e){}}
    extra={fac:P.fac,sweep:swept(me),site:!!(P.site&&P.site.length===0),facWins:Object.keys(fw).length}}
  const lv=G.pl.filter(p=>p.ai).map(p=>p.ai);const level=lv.length&&lv.every(l=>l===lv[0])?lv[0]:(lv.includes('hard')?'mixed':null);
  try{const r=GNS.result({game:GAME_ID,mode,seats,winner:G.over.winner,scores:G.pl.map(p=>p.inf),turns:G.round,ms:UI.t0?Date.now()-UI.t0:0,level,extra});
    if(r&&r.earned.length){UI.earned=r.earned.map(a=>a.name);GX.buzz([30,60,30])}}catch(e){}}
(function(){const o=showOver;showOver=function(){kitResult();return o()}})();
(function(){const o=pushEv;pushEv=function(e){try{kitTrackClash(e)}catch(x){}return o(e)}})();
function kitNewGame(){GX.undo.clear();recapSeats();UI.t0=Date.now();UI.resultDone=false;UI.earned=null;UI.pendBid=null;UI.cw={};}
(function(){const o=newGame;newGame=function(m,op){UI.cw={};UI.hist=null;const r=o(m,op);kitNewGame();renderAll();return r}})();
(function(){const o=resumeGame;resumeGame=function(sv){const r=o(sv);kitNewGame();UI.cw=sv.cw||{};UI.hist=sv.hist||null;return r}})();
// save: report to the shelf's Continue row; keep the round-by-round history and clash wins in the save
(function(){const o=saveGame;saveGame=function(){o();try{if(NET.on||!G||G.over||!UI.cfg)return;const raw=localStorage.getItem('tb_save');if(raw&&(UI.cw||UI.hist)){const s=JSON.parse(raw);s.cw=UI.cw||{};s.hist=UI.hist||null;localStorage.setItem('tb_save',JSON.stringify(s))}if(!UI.savedFlag){UI.savedFlag=1;GNS.saved(GAME_ID,true)}}catch(e){}}})();
(function(){const o=clearSave;clearSave=function(){o();UI.savedFlag=0;try{GNS.saved(GAME_ID,false)}catch(e){}}})();
// a save from an older or broken build is not resumed (it would crash): the title offers a new game instead
const SAVE_V=1;
function saveOk(s){try{const g=s&&s.G;return !!(g&&(s.v||1)===SAVE_V&&(g.v||1)===1&&Array.isArray(g.pl)&&g.pl.length>=2&&Array.isArray(g.reg)&&g.reg.length===3&&s.cfg&&Array.isArray(g.log))}catch(e){return false}}
(function(){const o=loadSave;loadSave=function(){const s=o();if(s&&!saveOk(s)){UI.badSave=true;return null}return s}})();
// ---------------------------------------------------------------- boot (called at the end of boot() in part 6)
function kitBoot(){
  kitSettings();kitReference();kitUndo();kitRecap();
  GNS.achievements(GAME_ID,ACH);
  AIDELAY=GX.aiDelay(650);applyAnim();
  GX.onPref(k=>{if(k==='ai'||typeof k==='object')AIDELAY=GX.aiDelay(650);if(k==='anim'||k==='reduce'||typeof k==='object')applyAnim();if((k==='cb'||k==='text')&&G&&UI.started){MAP.slotSig='';renderAll()}});
  GX.offline({sw:'../sw.js',scope:'../'})}
function applyAnim(){ANIM=GX.animMs(1000)>0?1:0}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-a]');if(!t)return;const a=t.dataset.a;
  if(a==='undo')doUndo();
  else if(a==='bidx'){UI.pendBid=null;UI.hand=null;renderAll()}
  else if(a==='refopen'){GX.close();GX.show('gx-refd')}
  else if(a==='setopen'){GX.close();GX.show('setd')}
  else if(a==='refcard'){closePop(true);GX.refOpen(t.dataset.r)}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!GX.open&&GX.undo.can()){e.preventDefault();doUndo()}});
