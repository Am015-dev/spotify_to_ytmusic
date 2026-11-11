// ===================== part 1: core (state, engine adapter, events, AI adapter, turn pump) =====================
// The engine (TB: newGame/moves/apply/pending/stripView) is never edited. Everything the UI needs on top of it lives here.
var ANIM=1,AIDELAY=420;
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
function cardDetail(id){const i=cinfo(id);const ar=ARCH_LBL[i.archetype]||'';const out=[];const g=t=>typeof gloss==='function'?gloss(t):esc(t);
  const stat=[];if(i.kind!=='hq')stat.push('<b>Strength '+i.strength+'</b>');if(ar)stat.push(g(ar));if(i.kind==='hq')stat.push(g('HQ: a permanent power'));if(i.cost)stat.push('costs '+i.cost+' '+g('Lore'));
  out.push('<p class="cd-stat">'+stat.join(' · ')+'</p>');
  out.push('<p class="cd-tx">'+(i.text?g(i.text):'No special power: it fights with its Strength.')+'</p>');   // the plain effect first
  const kw=[];for(const t of i.traits||[])kw.push('<b>'+g(TRAIT_N[t]||t)+'</b>: '+esc(TRAIT_T[t]||''));
  if(i.votes)kw.push('<b>'+i.votes+' '+g(i.votes>1?'votes':'vote')+'</b>: counts in a '+g('Council')+' when you Govern with it');
  if(i.lore)kw.push('<b>'+i.lore+' '+g('Lore')+'</b>: what a '+g('Journey')+' with it gives you');
  if(kw.length)out.push('<ul class="cd-kw">'+kw.map(x=>'<li>'+x+'</li>').join('')+'</ul>');
  if(i.tokens)out.push('<p class="cd-tr">Carries '+i.tokens+' Influence token'+(i.tokens>1?'s':'')+': stays on the map '+i.tokens+' more Winter'+(i.tokens>1?'s':'')+'.</p>');
  return out.join('')}
// ---------------------------------------------------------------- engine event capture (wrappers around engine agenda handlers; silent if the engine changes)
const EV={cur:null};
function snapInf(){return G.pl.map(p=>p.inf)}
function logSince(n){return G.log.filter(e=>e.i>n)}
function pushEv(e){e.at=G?G.logN+.5:0;UI.evq.push(e);if(typeof netEvent==='function')netEvent(e)}
function hookEngine(){const I=TB.internal;if(!I||!I.AG||I.__hooked)return;I.__hooked=1;const AG=I.AG,PK=I.PICKH;
  const wrap=(h,before,after)=>{const o=AG[h];if(!o)return;AG[h]=function(d){const mine=(()=>{const g=TB.internal.G;if(!G)G=g;return g===G})();try{mine&&before&&before(d)}catch(e){console.warn('hook',h,e.message)}const r=o.call(this,d);try{mine&&after&&after(d)}catch(e){console.warn('hook',h,e.message)}return r}};
  const flush=()=>{if(EV.cur&&EV.cur.t==='clash'&&EV.cur.tot){const c=EV.cur;c.logs=logSince(c.log0).map(e=>e.t);c.inf1=snapInf();pushEv(c)}EV.cur=null};
  wrap('roundStart',()=>{flush()},()=>{UI.rs0=snapInf();UI.rsInfl=JSON.parse(JSON.stringify(G.infl||[]));UI.rsLog=G.logN;UI.clashRes={};UI.placed=[]});
  wrap(I.AG.bidOrder?'bidOrder':'bidReveal',null,()=>{pushEv({t:'bids',round:G.round,bids:G.pl.map(p=>({seat:p.seat,id:p.bid,str:G.bstr[p.seat]})).filter(b=>b.id!=null),order:G.order.slice()})});
  wrap('clashReveal',()=>{if(EV.cur&&EV.cur.tot)flush()},()=>{const c=G.clash;if(!c)return;if(!EV.cur)EV.cur={t:'clash',r:c.r,idx:G.cord.indexOf(c.r),rounds:0,log0:G.logN-c.parts.length,inf0:snapInf()};
    EV.cur.n=c.n;EV.cur.cards={};for(const s of c.parts)EV.cur.cards[s]=(c.cards[s]||[]).slice();EV.cur.supp={};for(const s of c.parts)EV.cur.supp[s]=G.pl[s].supp.r[c.r];EV.cur.parts=c.parts.slice();EV.cur.tot=null});
  wrap('clashTally',null,()=>{const c=G.clash;if(!c||!EV.cur)return;EV.cur.tot=Object.assign({},c.tot);EV.cur.winner=c.winner;EV.cur.tied=c.tied?c.tied.slice():null;
    EV.cur.cardsF={};for(const s in EV.cur.cards)EV.cur.cardsF[s]=EV.cur.cards[s].slice();
    const ci=G.clash.cards;for(const s in ci)EV.cur.cardsF[s]=ci[s].slice();
    EV.cur.str={};for(const s in EV.cur.cardsF)EV.cur.str[s]=EV.cur.cardsF[s].map(id=>cinfo(id).strength);
    EV.cur.brk=c.brk?JSON.parse(JSON.stringify(c.brk)):null;EV.cur.elims=logSince(EV.cur.log0).filter(e=>e.m&&(e.m.k==='elim'||e.m.k==='inv')).map(e=>({t:e.t,k:e.m.k,ids:e.m.ids.slice(),by:(e.m.by||[]).slice()}));
    EV.cur.dead={};for(const e of EV.cur.elims)if(e.k==='elim')for(const id of e.ids){const o=(id/100)|0;(EV.cur.dead[o]=EV.cur.dead[o]||[]).push(id)}
    flush()});  // the result card comes right after the tally, before the winner is asked to claim a location
  wrap('regionDone',()=>{flush()});
  wrap('cleanup',null,()=>{if(UI.rs0){const why=G.pl.map((p,s)=>{const a=(UI.rsInfl||[])[s]||{},b=(G.infl||[])[s]||{},o=[];for(const k in b){const d=b[k]-(a[k]||0);if(d)o.push([k,d])}for(const k in a)if(!(k in b)&&a[k])o.push([k,-a[k]]);return o.sort((x,y)=>y[1]-x[1])});
    pushEv({t:'summary',round:G.round,rounds:G.rounds,inf0:UI.rs0,inf1:snapInf(),why,order:G.order.slice(),warns:logSince(UI.rsLog||0).filter(e=>e.c==='warn'&&!(e.m&&e.m.k==='elim')).map(e=>e.t),winter:logSince(UI.rsLog||0).filter(e=>e.m&&(e.m.k==='supp'||e.m.k==='rm'&&e.m.why==='Winter')).map(e=>e.t),big:[],last:G.round>=G.rounds})}});
  if(PK&&PK.bidRes){const o=PK.bidRes;PK.bidRes=function(seat,opt,d){const r=o.call(this,seat,opt,d);try{UI.toast=G.log.length?G.log[G.log.length-1].t:''}catch(e){}return r}}}
// ---------------------------------------------------------------- AI adapter (the engine author's TB.ai when present, else a modest fallback)
function legal(seat){return TB.moves(G,seat)}  // on a client this runs on its own stripped copy (same list as the host's, net-strip-test.js)
function aiLevel(seat){const l=G.pl[seat].ai||'normal';return UI.cfg&&UI.cfg.guided&&!NET.on&&GUIDED.lastNormal&&G.round>=G.rounds&&l==='easy'?'normal':l}  // the guided Court plays Easy while you learn, then Normal in the last round
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
function suggest(seat){if(!G||!G.q||!G.q.seats.includes(seat))return null;if(isClient()){const k=NET.rk;return k!=null?(legal(seat).find(m=>m.k===k)||null):null}try{return aiChoose(seat,ANIM&&!(UI.cfg&&UI.cfg.guided)?'hard':'normal')}catch(e){return null}}
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
function resumeGame(sv){hookEngine();G=sv.G;UI.cfg=sv.cfg;UI.mode=sv.cfg.mode;UI.holder=sv.holder||0;UI.guide=sv.guide||'full';UI.aiSeed=sv.ai||1;resetUI();UI.coachDone=sv.coach||{};UI.tip=sv.tip||{};UI.started=true;UI.rs0=snapInf();UI.rsInfl=JSON.parse(JSON.stringify(G.infl||[]));UI.rsLog=G.logN;return G}
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
function humanMove(k){if(typeof hideGloss==='function')hideGloss();if(NET.on)return netHumanMove(k);const s=viewSeatForQ();if(s==null)return false;const mv=legal(s).find(m=>m.k===k);if(!mv)return false;
  const ok=doMove(mv);if(ok){UI.sel={};UI.hand=null;closePop(true);if(hotSeat()){ // pass on once this seat has nothing more to decide
      const still=G.q&&G.q.seats.includes(s);if(!still)UI.passed=null}
    pump()}return ok}
function viewSeatForQ(){if(!G||!G.q)return null;if(NET.on){const m=NET.mySeat;return m>=0&&G.q.seats.includes(m)&&!G.pl[m].ai?m:null}const hum=G.q.seats.filter(s=>!G.pl[s].ai);if(!hum.length)return null;if(!hotSeat())return hum[0];return hum.includes(UI.holder)&&UI.passed===UI.holder?UI.holder:null}
