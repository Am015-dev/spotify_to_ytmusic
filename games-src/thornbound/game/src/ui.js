// ===================== part 1: core (state, engine adapter, events, AI adapter, turn pump) =====================
// painted art: TB_ART (data URIs made by build.py) -> blob URLs, so the many card <svg>s only carry a short link. Without blob URLs (old browsers, jsdom) the kit keeps its vector art.
const PA={};(function(){try{if(typeof TB_ART==='undefined'||/jsdom/i.test(navigator.userAgent||'')||!window.URL||!URL.createObjectURL||!window.Blob||!window.atob)return;
  for(const k in TB_ART){const p=TB_ART[k].split(','),bin=atob(p[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);PA[k]=URL.createObjectURL(new Blob([u],{type:'image/webp'}))}
  TBKit.setArt(PA)}catch(e){}})();
// The engine (TB: newGame/moves/apply/pending/stripView) is never edited. Everything the UI needs on top of it lives here.
var ANIM=1,AIDELAY=1000;
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
  if(i.kind==='basic'||i.kind==='heir')spec.img='basic-'+f;
  return spec}
function kcSpec(n){const k=TB.kingdomInfo(n),arts=SUIT_ART[k.suit]||['banner'];
  return {faction:'neutral',title:k.name,value:null,cost:null,type:SUIT_TYPE[k.suit]||'omen',typeLabel:SUIT_N[k.suit]+' · Kingdom',art:arts[n%arts.length],img:'kc'+String(n).padStart(2,'0'),text:k.text,num:'No. '+n}}
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
      if(typeof A.choose==='function'){const tw=UI.camp&&UI.camp.twist;r=(tw&&tw.id==='sharp-mind'&&seat===1&&level==='hard')?A.choose(G,seat,level,{budget:(A.budgetMs||200)*(tw.param||2)}):A.choose(G,seat,level)}else if(typeof A.pick==='function')r=A.pick(G,seat,level);else if(typeof A.move==='function')r=A.move(G,seat,level);else if(typeof A.best==='function')r=A.best(G,seat,level);
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
function newGame(mode,o){o=o||{};mode=mode||'me';UI.camp=o.camp||null;UI.campDone=false;
  const cfg={mode:mode==='ai'?'watch':mode,np:o.np||(mode==='guided'?2:3),length:o.length||(mode==='guided'?'short':'standard'),faction:o.faction||'nobility',levels:o.levels||[],seed:o.seed,humanSeats:o.humanSeats,guide:o.guide};
  if(mode==='tutorial'){cfg.mode='me';cfg.guided=true;cfg.tutorial=true;cfg.guide='off';cfg.levels=['easy','easy'];cfg.np=2;cfg.length='tutorial';cfg.faction=GUIDED.faction;cfg.seed=GUIDED.seed;o.seatFactions=[GUIDED.faction,GUIDED.rival];UI.aiSeed=GUIDED.ai}
  if(mode==='guided'){cfg.mode='me';cfg.guided=true;cfg.guide='full';cfg.levels=['easy','easy'];cfg.np=2;cfg.length='short';cfg.faction=GUIDED.faction;cfg.seed=GUIDED.seed;o.seatFactions=[GUIDED.faction,GUIDED.rival];UI.aiSeed=GUIDED.ai}
  const seats=mkSeats(cfg);
  const hn=cfg.mode==='hot'?(cfg.humanSeats||seats.map((_,i)=>i)):cfg.mode==='watch'?[]:[0];
  seats.forEach((s,i)=>{s.human=hn.includes(i);s.level=cfg.levels[i]||cfg.levels[0]||'normal'});
  if(o.seatFactions)o.seatFactions.forEach((f,i)=>{if(seats[i])seats[i].faction=f});
  const cnt={};const pl=seats.map((s,i)=>{const base=DD.FSHORT[s.faction];
    return {faction:s.faction,name:s.human&&(cfg.mode==='hot'||hn.length>1)?'Player '+(i+1)+' ('+DD.FSHORT[s.faction].replace('Gilded Court','Court').replace('Heathbound Clans','Clans').replace('Lantern Rising','Lanterns').replace('Pale Choir','Choir')+')':base,ai:s.human?null:s.level}});
  cfg.seats=seats;UI.cfg=cfg;UI.mode=cfg.mode;UI.guide=cfg.guide||(UI.guide||'full');
  hookEngine();
  G=null;const g=TB.newGame({players:pl,length:cfg.length,seed:cfg.seed!=null?cfg.seed:(o.seed!=null?o.seed:undefined),order:o.order});
  G=g;if(UI.camp&&typeof campApply==='function')campApply(UI.camp);resetUI();UI.coachDone={};UI.started=true;UI.holder=hn[0]!=null?hn[0]:0;
  UI.rs0=snapInf();UI.rsLog=0;
  try{localStorage.setItem('tb_played','1')}catch(e){}saveGame();hideStart();afterStart();return G}
function resetUI(){UI.evq=[];UI.card=null;UI.pop=null;UI.popArg=null;UI.busy=false;UI.tip={};UI.seen={};UI.clashRes={};UI.placed=[];UI.sel={};UI.toast='';UI.lastLog=G?G.logN:0;UI.nowT=null;UI.moreOpen=false;UI.watchPaused=false;UI.passed=null;UI.lastShown=null;UI.mapReset=true}
function saveGame(){try{if(NET.on||!G||G.over||!UI.cfg||UI.camp||UI.cfg.tutorial)return;localStorage.setItem('tb_save',JSON.stringify({v:1,G,cfg:UI.cfg,holder:UI.holder,guide:UI.guide,ai:UI.aiSeed,coach:UI.coachDone||{},tip:UI.tip,t:Date.now()}))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem('tb_save');return s?JSON.parse(s):null}catch(e){return null}}
function clearSave(){try{localStorage.removeItem('tb_save')}catch(e){}}
function resumeGame(sv){hookEngine();G=sv.G;UI.cfg=sv.cfg;UI.mode=sv.cfg.mode;UI.holder=sv.holder||0;UI.guide=sv.guide||'full';UI.aiSeed=sv.ai||1;resetUI();UI.coachDone=sv.coach||{};UI.tip=sv.tip||{};UI.started=true;UI.rs0=snapInf();UI.rsInfl=JSON.parse(JSON.stringify(G.infl||[]));UI.rsLog=G.logN;return G}
// ---------------------------------------------------------------- applying moves
function doMove(mv){if(!G||!G.q)return false;const was=G.round,l0=G.logN;
  const res=TB.apply(G,mv);
  if(!res.ok){console.warn('move rejected',res.err,mv&&mv.k);UI.err=res.err;if(res.exc)console.error('ENGINE '+res.err);return false}
  UI.lastRes=res;UI.nMoves=(UI.nMoves||0)+1;if(typeof snd==='function')snd(mv,res);
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
      if(typeof autoSkip==='function'&&autoSkip(h))continue;                 // a season with nothing to use is skipped for you
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
  const ok=doMove(mv);if(ok){UI.sel={};UI.hand=null;UI.sheetOpen=false;UI.ord=[];closePop(true);if(hotSeat()){ // pass on once this seat has nothing more to decide
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
  let box=$('#mapbox');if(!box){box=document.createElement('div');box.id='mapbox';wrap.appendChild(box)}
  if(!$('#spots')){const sp=document.createElement('div');sp.id='spots';box.appendChild(sp)}
  if(MAP.m){try{MAP.m.destroy()}catch(e){}}
  box.querySelectorAll('svg.tb-map').forEach(e=>e.remove());
  MAP.m=TBKit.map(Object.assign({container:box},mapOpts()));
  box.insertBefore(MAP.m.el,box.firstChild);
  MAP.sig=G.pl.map(p=>p.fac).join()+'|'+(UI.phone?1:0);MAP.ov=null;MAP.pan=null;MAP.shown={};MAP.busyHerald={};
  const svg=MAP.m.el;svg.setAttribute('aria-label','Map of the kingdom: three regions of two locations, and the throne');
  const NSS='http://www.w3.org/2000/svg';
  MAP.pan=document.createElementNS(NSS,'g');MAP.pan.setAttribute('class','tbx-pan');svg.insertBefore(MAP.pan,svg.querySelector('.tb-m-locs'));
  MAP.ov=document.createElementNS(NSS,'g');MAP.ov.setAttribute('class','tbx-ov');MAP.ov.setAttribute('pointer-events','none');svg.appendChild(MAP.ov);
  MAP.sg=document.createElementNS(NSS,'g');MAP.sg.setAttribute('class','tbx-selname');MAP.sg.setAttribute('pointer-events','none');svg.appendChild(MAP.sg);
  svg.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||t.closest('.tb-loc'))return;const g=t.closest('[data-reg]');if(g&&G&&UI.started)regionTap(+g.getAttribute('data-reg'))});
  drawPanels();relayoutSlots();
  // heralds start "at court" (dimmed, on the throne) until placed
  for(let s=0;s<G.np;s++)MAP.m.setHerald(s,'throne');
  MAP.infl={};for(let s=0;s<G.np;s++){MAP.m.setInfluence(s,G.pl[s].inf,{immediate:true})}
  MAP.heraldAt={};MAP.slotSig={};MAP.slotPrev=null}
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
  if(UI.card&&UI.card.kind!=='pass'&&UI.card.kind!=='tip'){bfSkip();return}
  if(UI.pop){closePop(true)}
  if(id==='throne'){openPop('kingdom');return}
  const l=LOCID.indexOf(id);if(l<0)return;
  if(info&&info.seat!=null){regionTap(regOfLoc(l));return}
  locTap(l)}
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
    const first=!MAP.slotPrev;MAP.slotPrev=MAP.slotPrev||{};
    for(const [r,s,st] of ss){const a=LOCID[2*r];const key=r+'|'+s,js=JSON.stringify(st);if(!first&&MAP.slotPrev[key]!==js&&typeof bfSlot==='function'){try{bfSlot(r,s,MAP.slotPrev[key]?JSON.parse(MAP.slotPrev[key]):null,st)}catch(e){}}MAP.slotPrev[key]=js;m.setSlot(a,s,st);const el=m.slotEl(a,s);if(el){if(st&&st.mineId!=null){el.setAttribute('data-owner',s);el.setAttribute('data-up','1')}else{el.removeAttribute('data-owner');el.removeAttribute('data-up')}}}}
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
  for(let r=0;r<3;r++){const S=STRIP[r],B=REGBOX[r];let ci=V.cord?V.cord.indexOf(r):-1;const oi=(UI.ord||[]).indexOf(r);if(oi>=0&&G.q&&G.q.kind==='clashOrder')ci=oi;
    if(ci>=0){const done=V.reg[r].done,cur=V.clash&&V.clash.r===r;const x=r===0?B.x+34:(r===1?B.x+34:B.x+B.w-34),y=r===0?B.y+34:B.y+34;
      f.push('<g transform="translate('+x+' '+y+')"><circle r="22" fill="'+(cur?'#e8c867':done?'#3a3a3a':'#7c1b2c')+'" stroke="#fff3c4" stroke-width="2.6"/><text y="8.5" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="24" fill="'+(cur?'#2b1808':'#fff3c4')+'">'+['I','II','III'][ci]+'</text></g>')}
    // supporters: little discs in the faction colour under each slot
    const n=G.np,cols=S.cols>=n?n:S.cols,rows=Math.ceil(n/cols),sw=UI.phone?44:38,sh=UI.phone?62:54,gap=6,tw=cols*sw+(cols-1)*gap,th=rows*sh+(rows-1)*gap;
    for(let s=0;s<n;s++){const sp=V.pl[s].supp,cnt=sp.r[r]+sp.x[r];if(!cnt)continue;const c=s%cols,rw=Math.floor(s/cols);const x=S.cx-tw/2+c*(sw+gap)+sw/2,y=S.cy-th/2+rw*(sh+gap)+sh+(UI.phone?10:9);
      f.push('<g transform="translate('+x+' '+y+')"><circle r="'+(UI.phone?11:10)+'" fill="'+fcol(s)+'" stroke="#fff3c4" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="'+TBKit.fonts.display+'">'+cnt+'</text></g>')}}
  regionChips(f);
  if(UI.phone&&(UI.bs||0)>=250){ // phones: the kit's banners are hidden, so every location gets a short name tag of its own
    for(let l=0;l<6;l++){const P=LOCPOS[l],name=LOCN[l],fs=36,words=name.split(' ');const lines=name.length>8&&words.length>1?[words[0],words.slice(1).join(' ')]:[name];
      const wd=Math.max(...lines.map(t=>t.length))*fs*.6+18,ht=lines.length*fs+8;const cx=Math.max(wd/2+4,Math.min(996-wd/2,P[0])),top=P[1]+52;
      f.push('<g class="locname"><rect x="'+Math.round(cx-wd/2)+'" y="'+top+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="10" fill="#1d120b" fill-opacity=".82"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+(i+1)*fs-4)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>')}}
  ov.innerHTML=f.join('')}
function setHl(ids,regs,rec){MAP.hl=ids||[];MAP.hlR=regs||[];MAP.rec=rec||{};applyHl()}
function applyHl(){const m=MAP.m;if(!m)return;const sel=null;m.highlight(MAP.hl.map(l=>LOCID[l]));m.select(sel);
  for(let l=0;l<6;l++){const g=m.locEl(LOCID[l]);if(g){const on=MAP.hl.includes(l);g.classList.toggle('glow',on);g.classList.toggle('rec',on&&MAP.rec.loc===l)}}
  if(MAP.pan)MAP.pan.querySelectorAll('[data-reg]').forEach(g=>{const r=+g.getAttribute('data-reg');const on=(MAP.hlR||[]).includes(r);g.classList.toggle('rglow',on);g.classList.toggle('rrec',on&&MAP.rec.reg===r)});
  drawSelName()}
// Phones: the kit's name banners are hidden (they were clipped and overlapped the region labels and reward coins). A tapped location shows its name here instead, in a spot with nothing else: below the circle in the top row and the upper half of the side columns, above it in the lower half.
function drawSelName(){const g=MAP.sg;if(!g)return;if(UI.phone){g.innerHTML='';return}if(!UI.phone||UI.pop!=='loc'||!UI.popArg||UI.popArg.l==null){g.innerHTML='';return}
  const l=UI.popArg.l,P=LOCPOS[l],name=LOCN[l],fs=34,words=name.split(' ');let lines=[name];if(name.length>9&&words.length>1){const h=Math.ceil(words.length/2);lines=[words.slice(0,h).join(' '),words.slice(h).join(' ')]}
  const wd=Math.max(...lines.map(t=>t.length))*fs*.66+30,ht=lines.length*(fs+8)+14,below=l<2||l===2||l===4;let cx=P[0];cx=Math.max(wd/2+8,Math.min(1000-wd/2-8,cx));const top=below?P[1]+60:P[1]-60-ht;
  g.innerHTML='<g><rect x="'+Math.round(cx-wd/2)+'" y="'+Math.round(top)+'" width="'+Math.round(wd)+'" height="'+ht+'" rx="14" fill="#1d120b" fill-opacity=".92" stroke="#e8c867" stroke-width="3"/>'+lines.map((t,i)=>'<text x="'+Math.round(cx)+'" y="'+Math.round(top+7+(i+1)*(fs+8)-6)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#f6e6b4">'+esc(t)+'</text>').join('')+'</g>'}
// brief flourish when the region's cards are flipped (kit reveal on the region's slots)
function mapReveal(ev){if(!MAP.m||!ANIM)return Promise.resolve();const a=LOCID[2*ev.r];const ents=ev.parts.filter(s=>ev.cardsF&&ev.cardsF[s]&&ev.cardsF[s].length).map(s=>{const ids=ev.cardsF[s];let tot=0;for(const id of ids)tot+=TB.cardInfo(G,id).strength;return {seat:s,value:tot,winner:ev.winner===s}});
  if(!ents.length)return Promise.resolve();try{return MAP.m.revealSlots(a,ents,{stagger:140}).catch(()=>{})}catch(e){return Promise.resolve()}}
function mapResetReveal(r){try{MAP.m&&MAP.m.resetReveal(LOCID[2*r])}catch(e){}MAP.slotDirty=true}
// strength chips per region: what you know of each side (your hidden cards, revealed cards, Supporters; a rival's hidden card is "?"),
// the live preview during a Clash, and the final totals (crown = winner) once it is fought
const CHIPPOS=[[500,312],[296,822],[704,822]];
function regionChips(f){if(!G||!UI.V||G.phase==='setup')return;const V=UI.V,me=vs();const live=G.clash&&['day','night','tally'].includes(G.step)?preview(V):null;
  for(let r=0;r<3;r++){const R=V.reg[r];const res=UI.clashRes[r];const anySup=V.pl.some(p=>p.supp.r[r]);if(!R.down.length&&!R.up.length&&!anySup&&!res)continue;if(R.done&&!res)continue;
    const seats=youFirst(V.pl.map(p=>p.seat));const pills=[];
    for(const s of seats){let txt,win=false;
      if(res&&res.tot&&res.tot[s]!=null){txt=String(res.tot[s]);win=res.winner===s}
      else if(live&&live.r===r&&live.tot[s]!=null){txt=String(live.tot[s]);win=live.win.length===1&&live.win[0]===s}
      else{let known=0,unk=0;for(const id of R.up)if(ownerOf(id)===s&&!R.took.includes(id))known+=TB.cardInfo(G,id).strength;for(const id of R.down)if(ownerOf(id)===s){if(id>=0)known+=TB.cardInfo(G,id).strength;else unk++}
        const sp=V.pl[s].supp.r[r]*(G.rm&&G.rm.masonry&&G.rm.masonry.includes(s)?2:1);if(!unk&&!known&&!sp)continue;txt=unk?'?'+(known+sp?'+'+(known+sp):''):String(known+sp)}
      pills.push({s,txt,win})}
    if(!pills.length)continue;const fs=pills.length<=2?76:pills.length===3?62:52,pw=p=>Math.max(fs*1.3,p.txt.length*fs*.62+fs*.55),ph=Math.round(fs*1.28),gap=8;const tot=pills.reduce((a,p)=>a+pw(p),0)+gap*(pills.length-1);
    let x=CHIPPOS[r][0]-tot/2;const y=CHIPPOS[r][1];
    f.push('<g class="rchip" data-reg="'+r+'">'+pills.map(p=>{const w=pw(p);const g='<g transform="translate('+Math.round(x)+' '+(y-ph/2)+')"><rect width="'+Math.round(w)+'" height="'+ph+'" rx="'+ph/2+'" fill="'+fcol(p.s)+'" stroke="'+(p.win?'#ffd24a':'#fff3c4')+'" stroke-width="'+(p.win?8:3)+'"/>'+
      '<text x="'+Math.round(w/2)+'" y="'+(ph/2+fs*.36)+'" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="'+fs+'" fill="#fff" stroke="#000" stroke-opacity=".45" stroke-width="3" paint-order="stroke">'+esc(p.txt)+(p.s===me?'':'')+'</text></g>';x+=w+gap;return g}).join('')+'</g>')}}
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
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;const t=statusText();const r=Math.max(1,G.round);
  el.innerHTML='<span class="st-r" aria-hidden="true">R'+r+'/'+G.rounds+'</span>'+(t.seat>=0&&G.pl[t.seat]?'<i class="st-d" style="background:'+fcol(t.seat)+'"></i>':'')+'<span class="st-t" role="status" aria-label="'+esc(t.text)+'">'+esc(t.text)+'</span>'}
// the one status line (8 words or fewer): what to do now, or what the computer just did
function words8(x){const w=String(x||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);return w.length<=8?w.join(' '):w.slice(0,7).join(' ').replace(/[,:;.]$/,'')+'\u2026'}
function statusText(){const o=t=>({text:words8(t),seat:-1});
  if(!G)return o('');if(G.over)return o('The reign is over');
  const c=UI.card;
  if(c&&c.kind==='pass')return o('Pass the device');
  if(c&&c.kind==='over')return o('The reign is over');
  if(c&&c.kind==='news'&&c.items&&c.items[0]){const it=c.items[0];return {text:words8(plain(it.text)),seat:it.s}}
  if(c&&c.kind==='event'){const e=c.ev;if(e.t==='bids')return o('Bids revealed');if(e.t==='clash')return {text:words8(UI._clashLine||'The Clash'),seat:-1};if(e.t==='summary')return o(e.last?'The last round is over':'Round '+e.round+' is over')}
  const s=viewSeatForQ();const q=G.q;
  if(q&&s!=null){const M=UI.bf;const co=UI._coachTitle;if(co)return o(co);
    if(M&&M.kind){switch(M.kind){
      case 'bid':return o(UI.hand!=null?'Tap the bid spot':'Pick a card to bid');
      case 'bidRes':return o('Take a Kingdom Card');
      case 'herald':return o('Place your Herald');
      case 'place':return o(UI.hand!=null?'Tap the glowing region':placeProgress());
      case 'tie':return o('Tie! Add a card or pass');
      case 'location':return o('Claim a location');
      case 'clashOrder':return o((UI.ord||[]).length?'Tap the next region':'Tap the first Clash');
      case 'menu':{const ph=menuPhase(q);if(ph==='Day'){try{const P=preview();if(P&&P.dead.some(d=>ownerOf(d.id)===s))return o('A Deadly card will eliminate yours')}catch(e){}}return o(ph==='Spring'&&M.regs.length?'Tap a region to send Supporters':ph==='Day'?'Use a power, or Done':ph==='Autumn'?'Autumn: use a power, or Done':'Use a power, or Done')}
      default:return o(promptText(q,s))}}
    return o(promptText(q,s))}
  // somebody else is deciding
  const last=G.log[G.log.length-1];const n=UI.nowT&&UI.nowT.at===G.logN?UI.nowT:null;
  if(n)return {text:words8(plain(n.t)),seat:n.s};
  if(q&&q.seats.length){const names=q.seats.map(x=>shortName(x).replace(' (you)',''));return {text:words8(names.join(' and ')+' is deciding'),seat:q.seats[0]}}
  if(last)return {text:words8(plain(last.t)),seat:last.s};
  return o('')}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){}
// ---------------------------------------------------------------- recommended move (+ the guided script may choose a simpler teaching move)
function qKey(s,mv){return G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0)+':'+(UI.cfg&&UI.cfg.guided?1:0)}
function getRec(s,mv){const key=qKey(s,mv);if(UI._rk===key)return UI._rec;UI._rk=key;let A=null;try{A=advise(s,mv)}catch(e){console.warn('advise',e.message)}
  UI._adv=A;UI._rec=A?A.m:null;UI._recWhy=A?A.why:'';return UI._rec}
// suggestions are on in the guided game and in rounds 1-2; later only on request (the "Suggest a move" button)
function hintsAuto(){return isGuided()||UI.guide!=='off'&&G.round<=2}
function hintsShown(s,mv){return hintsAuto()||UI.hintQ===qKey(s,mv)}
const recK=()=>UI._recShown&&UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') chooses early, but this card then sits under the Kingdom Card and cannot fight.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+') keeps your strong cards for the Clashes. You may choose late; you can always take your card back.':
      'A middle bid ('+i.strength+') can still win a good Kingdom Card while your strongest cards stay free for the Clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>shortName(p.seat));
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: win here and you take 1 Influence from each.':'Win this region and claim it, and your Herald earns +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes, nobody wins this region.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    const hr=G.pl[s].herald>=0?G.pl[s].herald>>1:-1;return 'Strength '+i.strength+' in '+r+(mv.r===hr?' (your Herald waits here)':'')+(i.strength>=7?': a strong card where the prize is worth it.':i.strength<=2?': a cheap card, a bluff that saves better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Nothing on offer is worth a card: take it back and keep your hand full.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card from a rival; their card under it goes back to their hand.';const kk=TB.kingdomInfo(mv.kc);return 'It works for you every round you keep it: '+lcFirst(kk.text)+'.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'')+'.'+(G.pl[s].herald===mv.loc?' Your Herald is here: +1 more, and you take 1 from each rival Herald here.':'')}
  if(k==='clashOrder')return 'Your strongest region fights first.';
  if(G.q.t==='menu')return menuWhy(mv);
  if(G.q.t==='sel'){if(mv.t==='seldone')return 'Nothing more here is worth it right now.';
    if(k==='siteBuy')return 'Site of Power cards are stronger than your basic cards; buying one now makes your deck better for the rest of the game.';
    if(k==='shrine')return 'Cards at the bottom of your deck come back later, after a reshuffle; weak cards there leave room for better draws.';
    if(k==='ossuary')return 'It brings a useful card back from your discard pile.';
    if(k==='rally'||k==='brine')return 'Taking strong cards back to your hand saves them from Winter\'s discard.';
    return 'Of the choices here this one gains you the most.'}
  if(k==='occupier')return 'The card under a Kingdom Card cannot fight.';
  if(k==='slot')return 'The Kingdom Card you replace is the one that helps you least now.';
  if(k==='councilOut')return 'A card back in your hand can fight again next round.';
  if(k==='flank'||k==='journeyDest')return 'Your card does more good there.';
  if(k==='castle'||k==='wilderness')return mv.skip||/^Skip/.test(mv.label||'')?'No card here is worth giving up.':'This card is worth less in your hand than what you gain.';
  if(q.t==='pick'&&mv.yes!=null)return mv.yes?'Using it now gains more than saving it.':'Saving it for a better moment is worth more.';
  return 'Of the choices here this one gains you the most.'}
function menuWhy(m){if(m.t==='done')return 'Nothing else here helps right now, so finish this step.';const a=m.a||'';
  if(a==='supp')return 'Each Supporter adds +1 Strength in that region\'s first Clash. Supporters on the map go to the Lost Pile in Winter.';
  if(a==='govern')return 'A card in a Council gives a lasting bonus every round.';
  if(a==='journey')return 'Lore buys your faction\'s Site of Power cards: stronger cards for later rounds.';
  if(a.startsWith('t:'))return 'A Tactic of your faction ('+tacUses(vs(),a.slice(2))+').';
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
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(plain(m.label))+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Suggested</span>':'')+'</button>'}
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
  if(m.t==='done')return doneText();if(m.t==='seldone')return m.label;
  if(G.q.t==='menu'&&m.a==='supp')return 'Send '+m.p.n+' to '+REG[m.p.r].replace('The ','');
  if(G.q.t==='menu'&&m.a==='journey')return 'Journey with '+cinfo(m.p.id).name;
  if(G.q.t==='menu'&&m.a==='govern')return 'Govern: '+cinfo(m.p.id).name+' into the '+DD.COUNCIL_NAMES[m.p.c];
  // the same power offered several ways: the button says which one (it matches the Suggested row)
  const t=m.label.replace(/:.*$/,''),vq=viewSeatForQ();if(G.q.t==='menu'&&vq!=null&&legal(vq).filter(x=>x.t==='act'&&(x.label||'').replace(/:.*$/,'')===t).length>1)return m.label.replace(/\.$/,'');
  return m.label.replace(/\s*\([^)]*\)\s*$/,'').replace(/:.*$/,'')}
function doneText(){const ph=menuPhase(G.q);return ph==='Spring'?'Done with Spring':ph==='Day'?'Done: fight the Clash':ph==='Autumn'?'Done with Autumn':'Done'}
function renderMain(){const el=$('#main'),ft=$('#act');if(!el||!ft)return;const q=G.q;
  const qk=(q?q.kind+'|'+q.title+'|'+G.logN:'')+'|'+(UI.card?UI.card.kind:'');
  const set=(h,f,sheet)=>{if(el.innerHTML!==h)el.innerHTML=h;el.classList.toggle('on',!!sheet&&!!h);f=f||'';if(ft._h!==f){ft._h=f;ft.innerHTML=f}ft.classList.toggle('has',!!f);if(UI._qk!==qk){UI._qk=qk;el.scrollTop=0;UI.sheetOpen=false;UI.ord=[]}moreCue()};
  UI._recShown=false;UI.bf=null;UI._coachTitle='';
  if(G.over){set('','');setHl([]);return}
  if(UI.card&&UI.card.kind!=='tip'){set('','');setHl([]);return}
  const s=viewSeatForQ();
  if(!q||s==null){set('',UI.mode==='watch'?watchControls():'');setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const shown=!!rec&&hintsShown(s,mv);UI._recShown=shown;const rm=shown?mv.find(m=>m.k===rec.k):null;
  const co=typeof coachFor==='function'?coachFor(s,mv,rm):null;UI._coachOn=!!co;UI._coachTitle=co&&/^New/.test(co.title||'')?co.title:'';
  const M=bfModel(s,mv,rm);UI.bf=M;M.sug=rec?(mv.find(m=>m.k===rec.k)||null):null;const pulse=!!(co&&co.pulse);
  const hintBtn='';   // the lightbulb in the top bar (gx-help) replaces the old Hint button
  let h='',f='',sheet=false;const hl=[],hr=[],recT={};
  const pass=mv.find(m=>m.pass);
  switch(M.kind){
   case 'bid':if(rm&&rm.id!=null)recT.spot=1;break;
   case 'bidRes':{const ret=mv.find(m=>m.t==='return');if(ret)f+='<button class="btn'+(rm&&rm.k===ret.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(ret.k)+'">'+ico('card')+'<span>Keep my card</span></button>';break}
   case 'herald':case 'location':M.locs.forEach(l=>hl.push(l));if(rm)recT.loc=rm.loc;break;
   case 'place':case 'tie':{if(UI.hand!=null)M.regsFor(UI.hand).forEach(r=>hr.push(r));if(rm&&rm.r!=null)recT.reg=rm.r;else if(rm&&q.kind==='tie'&&G.clash)recT.reg=G.clash.r;
     if(pass)f+='<button class="btn'+(rm&&rm.pass?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(pass.k)+'">Pass</button>';break}
   case 'clashOrder':{M.nextRegs().forEach(r=>hr.push(r));if(rm&&rm.order){const nx=rm.order[(UI.ord||[]).length];if(nx!=null)recT.reg=nx}
     if((UI.ord||[]).length)f+='<button class="btn" data-a="ordundo">'+ico('x')+'<span>Undo</span></button>';break}
   case 'menu':{const done=mv.find(m=>m.t==='done');M.regs.forEach(r=>hr.push(r));if(rm&&rm.a==='supp'&&rm.p)recT.reg=rm.p.r;
     if(done)f+='<button class="btn'+(rm&&rm.k===done.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(doneText())+'</button>';
     if(M.powers.length){const rp=rm&&rm.t==='act'&&rm.a!=='supp';f+='<button class="btn'+(rp?' pri'+(pulse?' pulse':''):'')+'" data-a="powers" aria-pressed="'+!!UI.sheetOpen+'">Powers <b>'+M.powers.length+'</b></button>';
       if(UI.sheetOpen||(rp&&UI.guide==='full'&&G.round>1&&false)){const r=menuHTML(s,mv,rm,pulse);h+='<div class="step" data-q="menu"><h3 class="st">'+esc(menuTitle(q))+'</h3>'+r.h+'</div>';sheet=true}}
     break}
   default:{ // anything else: a compact list above the tray
     h+='<div class="step" data-q="'+q.kind+'"><h3 class="st">'+esc(co&&co.title&&/^New/.test(co.title)?co.title:(KIND_NAME[q.kind]||titleOf(q)))+'</h3>';
     h+='<p class="pr">'+gloss(promptText(q,s))+'</p>';
     if(NET.on&&q.simul){const oth=q.seats.filter(x=>x!==s);if(oth.length)h+='<p class="hint dec">Waiting: '+esc(shortT(oth.map(seatWho).join(', ')))+'</p>'}
     if(q.t==='sel'){const r=selHTML(s,mv,rm,q,pulse);h+=r.h;f+=r.f}
     else{h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>';if(rm)f+=pbtn(rm,recBtnText(rm),pulse)}
     h+='</div>';sheet=true}}
  set(h,hintBtn+f,sheet);setHl(hl,hr,recT)}
// a gentle cue when the decision list continues below the visible part
function moreCue(){const el=$('#main');if(!el)return;const on=el.scrollHeight>el.clientHeight+8&&el.scrollTop+el.clientHeight<el.scrollHeight-8;el.classList.toggle('more-below',on)}
document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='main')moreCue()},true);
function menuTitle(q){const ph=menuPhase(q);if(ph==='Day')return G.clash?'Before the Clash in '+REG[G.clash.r]:'Day';return ph?'Your options this '+ph:'Your options'}
const QNAME={discardPick:'Discard a card',discardDown:'Too many cards',applause:'Set the turn order',flank:'Flank',castle:'Govern',wilderness:'Journey',siteBuy:'Spend Lore',ossuary:'Ossuary bonus',shrine:'Moss Altar bonus',harvest:'The Favour',rally:'Rally',retreat:'Retreat',ambushCard:'Ambush',occupier:'Choose the occupier',slot:'Choose a slot',placeRegion:'Choose a region',placeLoc:'Choose a location',journeyDest:'Journey',brine:'Brine-Hardened',edict:'A Tactic',relics:'Council of Coin',order:'Turn order'};
function titleOf(q){if(q.t==='menu'){const ph=menuPhase(q);return ph?ph+' actions':'Your actions'}if(QNAME[q.kind])return QNAME[q.kind];const t=(q.title||'').replace(/^[^:]*:\s*/,'');return t.length>28?'Your choice':t}
function promptText(q,s){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick a secret bid';
    case 'herald':return 'Place your Herald';
    case 'place':return t.indexOf('fewer')>=0&&t.split(' ').length<=8?t:'Hide a card: '+placeProgress();
    case 'bidRes':return 'Take a Kingdom Card';
    case 'location':return 'Claim a location';
    case 'discardPick':return 'Discard a card';
    case 'applause':return 'Set the turn order';
    case 'clashOrder':return 'Choose the Clash order';
    default:if(q.t==='menu'){const ph=menuPhase(q);return ph==='Day'?'Use a power, or tap Done':'Use a power, or tap Done'}return shortT(plain(t))}}
function shortT(x){const w=String(x||'').split(/\s+/).filter(Boolean);return w.length<=8?w.join(' '):w.slice(0,7).join(' ').replace(/[,:;.]$/,'')+'...'}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggested:</b> '+esc(shortRec(rm))+' <span class="why2">'+gloss(UI._recWhy||'')+'</span></span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' ('+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';if(m.t==='done')return 'finish this step.';if(m.t==='act'&&m.a!=='supp')return m.label.replace(/:.*$/,'')+'.';if(m.t==='act')return m.label+'.';return m.label.replace(/\.$/,'')+'.'}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal).sort((a,b)=>(recK()===b.k)-(recK()===a.k))){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+(m.t==='steal'?'<p class="st-n">'+shortT(stealPreview(s,m).replace(/<[^>]*>/g,''))+'</p>':'')+'<button class="btn" data-a="'+(m.t==='steal'?'confirm':'mv')+'" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+'</button></div></div>'}
  for(const m of ret){const rec=recK()===m.k;h+='<div class="offer ret'+(rec?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take nothing</p><button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Take it back</button></div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): one screen per season. Every option is a row (what it costs, what it does, what you gain), all visible,
// the list scrolls above the pinned action row, and one Done button ends the season.
const MGROUP=[['supp','Supporters',''],['cmd','Card abilities','Powers printed on your cards in play.'],['t','Tactics','Your faction\'s Tactics.'],['fav','Kingdom\'s Favour',''],['kc','Kingdom Cards and HQ','Powers of what you hold.'],['council','Councils',''],['govern','Govern','Once a round: a hand card with votes goes into a Council.'],['journey','Journey','Once a round: a hand card goes away for Lore.'],['other','Other','']];
function mgroup(a){if(a==='supp'||a==='govern'||a==='journey')return a;const p=a.split(':')[0];if(p==='cmd'||p==='card')return 'cmd';if(p==='t'||p==='fav'||p==='council')return p;if(/^kc\d/.test(a)||p==='hq')return 'kc';return 'other'}
function rowInfo(s,m){const a=m.a||'',lab=m.label||'';const i=lab.indexOf(':');let title=i>0?lab.slice(0,i):lab,eff=i>0?lab.slice(i+1).trim():'',cost='',gain='';
  if(a.startsWith('t:'))cost='Tactic: '+tacUses(s,a.slice(2));
  else if(a.startsWith('fav:'))cost='Favour: '+(G.fav.h===s?G.fav.u+' use'+(G.fav.u>1?'s':'')+' left':'used without the disc');
  else if(a==='journey'){title='Journey with '+cinfo(m.p.id).name;eff='The card goes '+(cinfo(m.p.id).traits.includes('path')?'to your Discard Pile (Pathfinder)':'to the Lost Pile')+'.';cost='the card leaves your hand';gain='+'+cinfo(m.p.id).lore+' Lore'}
  else if(a==='govern'){title='Govern with '+cinfo(m.p.id).name;eff='Into the '+DD.COUNCIL_NAMES[m.p.c]+': '+CPLAIN[m.p.c];cost='the card leaves your hand';gain=cinfo(m.p.id).votes+' vote'+(cinfo(m.p.id).votes>1?'s':'')}
  else if(/then discard this card|discard it\b|discard it and|discard this card/i.test(lab))cost='the Kingdom Card is used up';
  return {title,eff:eff.replace(/^./,c=>c.toUpperCase()),cost,gain}}
function rowHTML(s,m,day){const I=rowInfo(s,m);const rec=recK()===m.k;let g=I.gain;
  if(day){const r=simCached(m);if(r&&r.P)g='then: '+youFirst(Object.keys(r.P.tot).map(Number)).map(x=>(x===s?'you ':sideName(x)+' ')+r.P.tot[x]).join(' vs ')}
  const conf=m.a==='t:cln_t3';
  return '<div class="orow'+(rec?' rec':'')+'"><div class="ob"><b>'+gloss(I.title)+'</b>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+(I.eff&&I.eff.split(/\s+/).length<=8?'<span class="oe">'+gloss(I.eff)+'</span>':'')+((I.cost||g)?'<small class="oc2">'+(I.cost?'<em>Cost:</em> '+esc(shortT(I.cost)):'')+(I.cost&&g?' · ':'')+(g?'<em>Gain:</em> '+esc(shortT(g)):'')+'</small>':'')+'</div><button class="btn sm" data-a="'+(conf?'confirm':'mv')+'" data-k="'+esc(m.k)+'">Use</button></div>'}
function simCached(m){const key=G.logN+'|'+m.k;UI._simc=UI._simc||{};if(UI._simc.n!==G.logN)UI._simc={n:G.logN};if(!(key in UI._simc)){let r=null;try{r=simDay(m)}catch(e){}UI._simc[key]=r}return UI._simc[key]}
function menuHTML(s,mv,rm,pulse){let h='';const ph=menuPhase(G.q),day=ph==='Day';const acts=visibleActs(mv).filter(m=>m.t==='act'&&m.a!=='supp');
  const byG={};for(const m of acts){(byG[mgroup(m.a)]=byG[mgroup(m.a)]||[]).push(m)}
  const rk=recK();for(const g in byG)byG[g].sort((x,y)=>(y.k===rk)-(x.k===rk));
  const rg=acts.find(m=>m.k===rk);const GORD=rg?MGROUP.slice().sort((x,y)=>(y[0]===mgroup(rg.a))-(x[0]===mgroup(rg.a))):MGROUP;
  for(const [g,nmG] of GORD){const L=byG[g];if(!L)continue;h+='<p class="grp-h">'+gloss(nmG)+'</p>'+L.map(m=>rowHTML(s,m,day)).join('')}
  return {h,f:''}}
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
// ---------------------------------------------------------------- hand: a fanned strip along the bottom (tap = lift, tap again or drag onto the glowing spot = play; hold = read)
function cssPx(n,d){try{const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n));return v>0?v:d}catch(e){return d}}
function renderHand(){const el=$('#handw');if(!el)return;const s=vs();
  if(!G||s<0||isPassing()||G.over){el.innerHTML='';el._h='';el.hidden=true;return}
  if(UI.dragging)return;
  el.hidden=false;const V=UI.V,P=V.pl[s];const M=UI.bf;
  if(M&&M.kind==='bidRes'&&!UI.desk){const h=roadRowHTML(s,M);el.classList.add('road');if(el._h!==h){el._h=h;el.innerHTML=h}return}
  el.classList.remove('road');
  const ids0=P.hand.filter(id=>id>=0).sort((a,b)=>cinfo(b).strength-cinfo(a).strength||a-b);
  // cards keep their slot while the hand only shrinks (no reflow under the next tap); a new card or a new round lays the hand out again
  const qk=G.q?G.q.kind:'';let HS=UI.handSlots;if(!HS||HS.round!==G.round||HS.seat!==s||HS.kind!==qk||ids0.some(id=>!HS.order.includes(id))||!ids0.length)HS=UI.handSlots={round:G.round,seat:s,kind:qk,order:ids0.slice()};
  const ids=HS.order;const inHand=new Set(ids0);
  const use=M&&M.use?M.use:new Set();const rcId=M&&M.rec&&M.rec.id!=null?M.rec.id:null;
  const PAD=UI.desk?32:16;const W=Math.max(160,(el.clientWidth||innerWidth)-8-2*PAD);const cw=cssPx('--cw',50),ch=Math.round(cw*1.4308);
  const n=ids.length,step=n>1?Math.min(cw+6,(W-cw)/(n-1)):0;const tot=n>1?cw+step*(n-1):cw;const off=Math.max(0,(W-tot)/2);
  let h='<div class="hand" role="list" aria-label="Your hand" style="height:'+(ch+24)+'px">';
  ids.forEach((id,i)=>{if(!inHand.has(id))return;const on=UI.hand===id,pl=use.has(id);const mid=(n-1)/2,rot=n>1?(i-mid)*Math.min(3.6,22/n):0,ty=n>1?Math.round(Math.pow(Math.abs(i-mid)/Math.max(1,mid),2)*4):0;
    h+='<button class="hc'+(on?' on':'')+(pl?' glow pl':'')+(rcId===id?' rg':'')+(use.size&&!pl?' dim':'')+'" role="listitem" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" style="left:'+Math.round(PAD+off+i*step)+'px;width:'+cw+'px;height:'+ch+'px;z-index:'+(on?50:i+1)+';--rot:'+rot.toFixed(1)+'deg;--ty:'+ty+'px" aria-label="'+esc(cinfo(id).name)+', strength '+cinfo(id).strength+'">'+cardEl(id,UI.desk?Math.min(cw,110):cw).outerHTML+'</button>'});
  h+='</div>';if(el._h!==h){el._h=h;el.innerHTML=h}}
// bid resolution: the Great Road lies where the hand was; tap a glowing Kingdom Card to take it (a steal asks first)
const roadX=()=>{const x=innerHeight<600?16:40;document.documentElement.style.setProperty('--roadx',x+'px');return x}; // extra height the kingdom-card row gets on a portrait phone, so the paintings and names can be read
function roadRowHTML(s,M){const mv=M.mv;const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal');const V=UI.V;const items=[];
  for(let i=0;i<V.road.length;i++){const kc=V.road[i];if(!kc)continue;items.push({kc,m:take.find(x=>x.kc===kc&&x.i===i)||null})}
  for(const m of take)if(m.dk!=null)items.push({kc:m.kc,m,deck:1});
  for(const m of steal)items.push({kc:m.kc,m,steal:1});
  if(!items.length)return '<div class="hand roadrow"></div>';
  const W=Math.max(180,((UI.land?(($('#handw')||{}).clientWidth||innerWidth*.38):innerWidth))-12);const zone=cssPx('--ch',72)+24+(UI.land?0:roadX());let w=Math.max(34,Math.min(UI.land?60:72,Math.floor((zone-(innerHeight<600?40:34))/1.4308),Math.floor(W/items.length)-8));if(UI.desk)w=Math.max(70,Math.min(124,Math.floor((($('.gx-dock')||{}).clientWidth||W)/Math.max(4,items.length))-26));const rk=recK();
  return '<div class="hand roadrow" role="list" aria-label="The Great Road">'+items.map(it=>{const m=it.m;const rec=m&&rk===m.k;const col=it.steal?fcol(m.s2):'';
    const att=m?(it.steal?'data-a="confirm" data-k="'+esc(m.k)+'"':'data-a="mv" data-k="'+esc(m.k)+'"'):'data-a="kc" data-n="'+it.kc+'"';
    return '<button class="kcb'+(m?' glow':' dim')+(rec?' rg':'')+(it.steal?' steal':'')+'" role="listitem" '+att+' data-n="'+it.kc+'" style="width:'+Math.max(w+4,Math.min(84,Math.floor(W/items.length)-6))+'px'+(col?';--fc:'+col:'')+'"'+' aria-label="'+esc((it.steal?'Steal ':m?'Take ':'')+TB.kingdomInfo(it.kc).name)+'">'+kcEl(it.kc,UI.desk?Math.min(w,110):w).outerHTML+'<span class="kn">'+esc(TB.kingdomInfo(it.kc).name)+'</span>'+(it.steal?'<i class="stl">'+ico('x')+'</i>':'')+'</button>'}).join('')+'</div>'}
// desktop: the Great Road stays on the table above the hand (taking a card, when it is your turn, happens here)
function renderDeskRoad(){const el=$('#road');if(!el)return;
  if(!UI.desk||!G||!UI.V||isPassing()||G.over){if(UI.desk){el.hidden=true;el.innerHTML='';el._h=''}return}
  el.hidden=false;const s=vs(),M=UI.bf;const st=$('#barstat .st-t');const ins=st?st.textContent:'';
  let row;if(M&&M.kind==='bidRes')row=roadRowHTML(s,M);
  else{const V=UI.V;const w=Math.max(70,Math.min(124,Math.floor((($('.gx-dock')||{}).clientWidth||600)/4)-30));
    row='<div class="hand roadrow" role="list" aria-label="The Great Road">'+V.road.map(n=>n?'<button class="kcb" role="listitem" data-a="kc" data-n="'+n+'" style="width:'+(w+4)+'px" aria-label="'+esc(TB.kingdomInfo(n).name)+'">'+kcEl(n,Math.min(w,110)).outerHTML+'<span class="kn">'+esc(TB.kingdomInfo(n).name)+'</span></button>':'').join('')+'</div>'}
  const h='<h4 class="dk-h">The Great Road</h4>'+row+(ins?'<p class="dk-ins">'+esc(ins)+'</p>':'');if(el._h!==h){el._h=h;el.innerHTML=h}}
// ---------------------------------------------------------------- the seats: score, hand and the face-down bid, along the top
function renderRivals(){const el=$('#rivals');if(!el)return;if(!G||!UI.V)return;const V=UI.V;
  const act=G.q?new Set(G.q.seats):new Set();const me=vs();const n=G.np;
  const top=Math.max(...V.pl.map(p=>p.inf));const lead=V.pl.filter(p=>p.inf===top).length===1&&top>0;
  const ev=UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'?UI.card:null;
  const bidNow=G.q&&G.q.kind==='bid';UI._bidSeen=UI._bidSeen||{};if(UI._bidRound!==G.round){UI._bidRound=G.round;UI._bidSeen={}}
  const chips=G.pl.map(p=>{const s=p.seat,P=V.pl[s];const kfac=TBKit.FACTIONS[FK[P.fac]];const turn=act.has(s)&&!ev;
    const favs=V.fav.h===s?'<span class="rv-f" title="Holds the Kingdom\'s Favour">'+ico('star')+'</span>':'';
    let bc='';const b=P.bid;
    if(b!=null&&b!==false){let up=b>=0&&G.bidRev;let flip='';
      if(ev){const rk=ev.rank?ev.rank.indexOf(s):-1;up=rk>=0&&rk<(ev.revN||0);flip=up&&rk===(ev.revN||0)-1?' flip':''}
      else if(s===me&&!G.bidRev)up=false;
      const isNew=!UI._bidSeen[s]&&bidNow&&s!==me;UI._bidSeen[s]=1;
      if(s===me&&!G.bidRev&&!ev)bc='';
      else if(up){const v=(G.bstr&&G.bstr[s]!=null&&G.bstr[s]>=0)?G.bstr[s]:(b>=0?cinfo(b).strength:'?');bc='<span class="bidc up'+flip+'" aria-label="Bid '+v+'"><b>'+v+'</b></span>'}
      else bc='<span class="bidc back'+(isNew?' new':'')+'" aria-label="Face-down bid"></span>'}
    const sb=P.supp&&P.supp.b?'<span class="rv-s" title="Supporters at home" aria-label="'+P.supp.b+' Supporters">'+ico('users')+P.supp.b+'</span>':'';
    return '<button class="rv'+(s===me?' me':'')+(turn?' turn':'')+'" data-a="rival" data-s="'+s+'" style="--fc:'+kfac.main+'" aria-label="'+esc(P.name)+': '+P.inf+' influence, '+P.hand.length+' cards in hand. Tap for details">'+
      '<span class="rv-e">'+emb(s,22)+'</span><span class="rv-t"><b>'+(s===me&&(NET.on||humans().length===1)?'You':esc(shortName(s).replace(' (you)','')))+(lead&&P.inf===top?' <span class="rv-l" title="In the lead">'+ico('crown')+'</span>':'')+'</b><small>'+ico('card')+P.hand.length+sb+'</small></span>'+bc+'<span class="rv-n" data-s="'+s+'">'+P.inf+'</span>'+favs+'</button>'}).join('');
  const h='<div class="race-c'+(n>2?' many':'')+(n>3?' four':'')+'">'+chips+'</div>';if(el._h!==h){el._h=h;el.innerHTML=h}}
// ---------------------------------------------------------------- pop-ups (live in the dock zone, never over the board)
function openPop(kind,arg){if(!G)return;if(typeof hideGloss==='function')hideGloss();UI.pop=kind;UI.popArg=arg||{};renderPop();applyHl();if(typeof bfFinger==='function')bfFinger();if(typeof sfx==='function')sfx('tap')}
function closePop(quiet){if(!UI.pop)return;UI.pop=null;UI.popArg=null;UI.hand=null;const p=$('#ppop');if(p){p.hidden=true;p.innerHTML=''}applyHl();if(typeof bfFinger==='function')bfFinger();if(!quiet)renderAll()}
function optsFor(s,id){if(s==null||s<0||!G.q||!G.q.seats.includes(s))return [];return legal(s).filter(m=>m.id===id||(typeof m.v==='number'&&m.v===id))}
function actLabel(m){if(m.t==='bid')return 'Bid with this card';if(m.t==='place')return 'Play face-down at '+REG[m.r];if(G.q.kind==='tie'&&m.id!=null)return 'Play face-down into the tied clash';if(m.t==='sel')return 'Choose this card';return m.label}
function popShell(title,body,cls){return '<div class="pp-h"><b>'+title+'</b><button class="pp-x" data-a="pclose" aria-label="Close">'+ico('x')+'</button></div><div class="pp-b '+(cls||'')+'">'+body+'</div>'}
function renderPop(){const el=$('#ppop');if(!el)return;
  if(!UI.pop||!G||(UI.card&&UI.card.kind!=='tip')){el.hidden=true;el.innerHTML='';return}
  const a=UI.popArg||{};let html='';
  try{switch(UI.pop){case 'confirm':html=confirmHTML(a.k);break;case 'card':html=popCard(a.id,a.read);break;case 'loc':html=popLoc(a.l);break;case 'region':html=popRegion(a.r);break;case 'rival':html=popRival(a.s);break;case 'kingdom':html=popKingdom();break;case 'kc':html=popKC(a.n);break;default:html=''}}catch(e){console.warn('pop',e.message);html=''}
  if(!html){el.hidden=true;return}
  const first=el.hidden;el.hidden=false;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.innerHTML=html;if(first)el.classList.add('in');else el.classList.remove('in');
  el.dataset.kind=UI.pop;el.dataset.read=a.read?'1':'';
  sizePopCard()}
function sizePopCard(){const el=$('#ppop');const c=el&&el.querySelector('.pp-card');if(!c)return;const W=el.clientWidth,H=el.clientHeight;
  const big=c.dataset.kc!=null||el.dataset.kind==='card';const w=big?Math.max(120,Math.min(c.dataset.kc!=null?300:270,W*.74,(innerHeight*.86-(c.dataset.kc!=null?130:190))/1.4308)):Math.max(96,Math.min(260,W*.42,(H-150)/1.4308));c.innerHTML='';c.appendChild(c.dataset.kc!=null?kcEl(+c.dataset.kc,w):cardEl(+c.dataset.cid,w))}
function popCard(id,read){const s=vs();const i=cinfo(id);const mine=!read&&ownerOf(id)===s;const acts=mine?optsFor(s,id):[];const rec=mine&&UI._rec&&G.q?UI._rec:null;let h='';
  if(acts.length){h+='<div class="pp-act">';for(const m of acts.slice(0,10)){const isRec=UI._recShown&&rec&&rec.k===m.k;h+='<button class="btn'+(isRec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(actLabel(m))+(isRec?' (suggested)':'')+'</button>'}
    h+='</div>'}
  else if(mine)h+='<p class="hint">Nothing to do with this card right now.</p>';
  h+='<div class="pp-row"><div class="pp-card" data-cid="'+id+'" data-owner="'+ownerOf(id)+'"'+(mine?' data-up="1"':'')+'></div><div class="pp-info"><h4>'+esc(i.name)+'</h4>'+cardDetail(id)+'</div></div>';
  if(i.kind==='hq')h+='<p class="hint">'+gloss('An HQ card is not a card for your hand: once bought it stays in front of you as a permanent power.')+'</p>';
  return popShell(esc(i.name),h,'pc-b')}
function popKC(n){const k=TB.kingdomInfo(n);let who='';for(const P of G.pl){P.ks.forEach((T,j)=>{if(T&&T.kc===n)who='Held by '+P.name+(T.occ!=null&&UI.V.pl[P.seat].ks[j].occ>=0&&false?'':'')+'.'});if(P.sup.includes(n))who='In '+P.name+'\'s Supply.'}
  if(G.road.includes(n))who='On the Great Road.';
  return popShell(esc(k.name),'<div class="pp-row"><div class="pp-card" data-kc="'+n+'"></div><div class="pp-info"><h4>'+esc(k.name)+'</h4><p class="cd-tx">'+gloss(k.text)+'</p><p class="cd-stat">'+gloss(SUIT_N[k.suit]+' suit · '+({board:'sits on your board, with a card tucked under it',supply:'goes to your Supply',region:'placed on a region',loc:'placed on a location','none':'one-shot'}[k.place]||k.place))+'</p><p class="hint">'+who+'</p></div></div>')}
function heraldChips(l){const o=G.pl.filter(p=>p.herald===l);return o.length?o.map(p=>'<span class="hchip" style="--fc:'+fcol(p.seat)+'">'+esc(shortName(p.seat))+'</span>').join(' '):'<em>none yet</em>'}
function popLoc(l){const s=vs();const L=DD.LOCS[l],V=UI.V;const q=G.q;let h='';
  h+='<p class="lc-r">'+esc(REG[l>>1])+' · reward <b>+'+L[2]+' Influence</b></p>';
  h+='<p class="lc-x">'+(L[3]?gloss(shortT(L[3])):'Plain Influence only')+'</p>';
  h+='<p class="lc-h"><b>Heralds here:</b> '+heraldChips(l)+'</p>';
  const mk=V.pl.map((p,i)=>p.mk[l]?esc(shortName(i))+' '+p.mk[l]:'').filter(Boolean);if(mk.length)h+='<p class="lc-h"><b>Whisper markers:</b> '+mk.join(', ')+'</p>';
  if(V.loc[l].kc.length)h+='<p class="lc-h"><b>Kingdom Cards here:</b> '+V.loc[l].kc.map(k=>esc(TB.kingdomInfo(k.n).name)+' ('+esc(nameOf(k.o))+')').join(', ')+'</p>';
  if(l===2)h+='<p class="lc-h"><b>Favour:</b> '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' holds it ('+V.fav.u+' uses left)':'on the board')+'</p>';
  const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];const info=h;h='';
  if(q&&q.kind==='herald'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Place my Herald here'+(rec?' (recommended)':'')+'</button></div>';h+='<p class="why">'+ico('star')+'<span><b>'+(rec?'Why this one':'Think about it')+':</b> '+gloss(whyFor(s,m))+'</span></p>'}}
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
  h+='<p class="lc-h"><b>'+gloss('Tactics')+':</b></p><ul class="tacl">'+DD.TACTICS[P.fac].map((t,i)=>'<li class="tac'+(P.tac[i].burn?' burn':P.tac[i].ex?' ex':'')+'"><b>'+esc(t.nm)+'</b> <small>'+(P.tac[i].burn?'burned':P.tac[i].ex?'used up':t.mk>0?P.tac[i].mk+' use'+(P.tac[i].mk===1?'':'s')+' left, once a round':'once per game')+'</small><br>'+gloss(t.txt.replace(/^SETUP[^.]*\.\s*/,''))+'</li>').join('')+'</ul>';
  h+='<p class="lc-h"><b>Site of Power:</b> '+(P.site.length?P.site.map(id=>esc(TB.cardName(G,id))+' ('+cinfo(id).cost+')').join(', '):'<em>empty</em>')+(P.hq.length?'. HQ: '+P.hq.map(id=>esc(TB.cardName(G,id))).join(', '):'')+'</p>';
  h+='<p class="lc-h"><b>'+gloss('Favour')+' power:</b> '+esc(DD.FAVOUR[P.fac].nm)+': '+gloss(DD.FAVOUR[P.fac].txt)+'</p>';
  return popShell(esc(P.name),h,'rv-b')}
function popKingdom(){const V=UI.V;let h='';
  h+='<h5>The Great Road</h5><div class="road4">'+V.road.map(n=>n?'<button class="kcth" data-a="kc" data-n="'+n+'" aria-label="'+esc(TB.kingdomInfo(n).name)+'">'+kcEl(n,52).outerHTML+'</button>':'<span class="kcth empty"></span>').join('')+'</div><p class="hint">Kingdom Card deck: '+V.kdeck.length+' left. Tap a card to read it.</p>';
  h+='<h5>Councils</h5>';for(const c of DD.COUNCILS){const ids=V.council[c];h+='<p class="lc-h"><b>'+esc(DD.COUNCIL_NAMES[c])+'</b>: '+(ids.length?ids.map(id=>esc(TB.cardName(G,id))+' ('+esc(shortName(ownerOf(id)))+', '+cinfo(id).votes+')').join(', '):'<em>empty</em>')+'</p><p class="small">'+esc(DD.COUNCIL_TXT[c])+'</p>'}
  h+='<h5>Favour and order</h5><p class="lc-h">Favour: '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' ('+V.fav.u+' uses left)':'on the Gleaning Meadow')+'</p><p class="lc-h">Order this round: '+V.order.map((s,i)=>(i+1)+'. '+esc(shortName(s))).join(', ')+'</p><p class="lc-h">Lost Pile: '+V.lost.length+' card'+(V.lost.length===1?'':'s')+'.</p>';
  return popShell('The Kingdom',h,'kg-b')}
// ---------------------------------------------------------------- the one card (events, pass the device, coach tips, game over)
function shouldShowEvent(ev){if(ev.t==='clash')return true;if(ev.t==='bids')return true;if(ev.t==='summary')return true;if(ev.t==='news')return wantNews();return false}
function showEvent(ev){if(ev.t==='news'){showNews(ev);return}UI.card={kind:'event',ev};if(ev.t==='clash'){UI.noAnim=true}}
function showOver(){if(UI.cfg&&UI.cfg.tutorial)return;if(UI.card&&UI.card.kind==='over')return;UI.card={kind:'over'};clearSave();if(typeof campOver==='function')campOver()}
const TIPS={bid:['Bids','Every round starts with a secret bid. The highest bid picks a Kingdom Card first; the card you bid then sits under it and cannot fight.'],
  herald:['Heralds','Your Herald is public. If you win a region and claim the location where your Herald stands, you gain +1 Influence and take 1 from every rival Herald there.'],
  place:['Hidden cards','You hide one card at each of the three regions. Put big cards where the prize matters and cheap ones elsewhere.'],
  menu:['Actions','Supporters add +1 Strength each in a region\'s first Clash. Open the list for other actions, or finish the step.'],
  clashOrder:['Clash order','The player with the least Influence chooses the order of the three Clashes.'],
  location:['Winning','The winner claims one of the region\'s two locations: its Influence and its bonus.'],
  bidRes:['Your bid','Take a Kingdom Card from the Great Road, steal one a rival holds (your bid must beat the card under it), or take your card back.']};
function maybeTip(){return typeof coachGate==='function'&&coachGate()}
function renderCard(){const el=$('#pc');if(!el)return;const c=UI.card;
  // events, news and bids are played on the board itself (see bfEvent); only the pass screen and the final result use the card layer
  if(c&&(c.kind==='event'||c.kind==='news')){el.hidden=true;el.innerHTML='';UI._cardKey=null;if(!c._st){c._st=1;if(c.kind==='event')bfEvent(c);else bfNews(c)}return}
  if(!c){el.hidden=true;el.innerHTML='';UI._cardKey=null;return}
  const key=JSON.stringify([c.kind,c.seat,c.k]);
  if(UI._cardKey===key&&!el.hidden)return;UI._cardKey=key;
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');el.dataset.kind=c.kind;
  let h='';
  if(c.kind==='pass'){const s=c.seat;h='<div class="cd cd-pass" style="--fc:'+fcol(s)+'"><div class="cd-sc"><div class="cd-e">'+emb(s,56)+'</div><h3>Pass the device to '+esc(nameOf(s))+'</h3><p>Everyone else look away.</p></div><div class="cd-ft"><button class="btn pri big" data-a="take" data-s="'+s+'">I am '+esc(shortName(s))+': show my cards</button></div></div>'}
  else if(c.kind==='over'){h=overHTML()}
  el.innerHTML=h;
  const b=el.querySelector('.btn.pri');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function cdWrap(cls,body,foot){return '<div class="cd '+cls+'"><div class="cd-sc">'+body+'</div><div class="cd-ft">'+foot+'</div></div>'}
function bidWhy(b){const pr=cinfo(b.id).strength;if(b.str===pr)return '';const ed=G.log.filter(e=>e.r===G.round&&/Crown's Edict/.test(e.t)&&/plays/.test(e.t));
  if(b.str===0&&pr>0&&ed.length)return 'printed '+pr+', set to 0 by '+plain(ed[ed.length-1].t.replace(/ plays .*$/,''))+'\'s Crown\'s Edict';if(b.str===pr+5)return 'printed '+pr+', +5 from Sentinel Towers';return 'printed '+pr}
// the strength breakdown of one side of a Clash: every part is labelled and the parts add up to the total
function brkHTML(ev,s){const B=(ev.brk&&ev.brk[s])||null;const dead=(ev.dead&&ev.dead[s])||[];let h='<ul class="bk">';
  if(B){for(const x of B)h+='<li><span>'+gloss(x.l)+'</span><i>'+(x.n<0?'−'+(-x.n):'+'+x.n)+'</i></li>';if(!B.length)h+='<li><span>no cards, no Supporters</span><i>0</i></li>'}
  else{for(const id of (ev.cardsF&&ev.cardsF[s])||[])h+='<li><span>'+esc(TB.cardName(G,id))+'</span><i>+'+cinfo(id).strength+'</i></li>';if(ev.supp&&ev.supp[s])h+='<li><span>'+ev.supp[s]+' Supporters</span><i>+'+ev.supp[s]+'</i></li>'}
  for(const id of dead)h+='<li class="dead"><span>'+esc(TB.cardName(G,id))+' (eliminated)</span><i>0</i></li>';
  return h+'<li class="tot"><span>Total</span><i>'+ev.tot[s]+'</i></li></ul>'}
function eventHTML(ev){const note=typeof coachEvent==='function'?coachEvent(ev):'';const cn=note?'<p class="coach">'+gloss(note)+'</p>':'';const me=vs();
  if(ev.t==='bids'){const rows=ev.bids.slice().sort((a,b)=>b.str-a.str||ev.order.indexOf(a.seat)-ev.order.indexOf(b.seat));
    return cdWrap('cd-bids','<h3>Bids revealed</h3>'+(cn?'':'<p class="sub">'+gloss('Highest bid chooses first')+'</p>')+'<div class="bidrow">'+rows.map((b,i)=>{const w=bidWhy(b);return '<div class="bd" style="--fc:'+fcol(b.seat)+'"><span class="bd-n">'+(i+1)+'</span><span class="bd-c">'+TBKit.card(cardSpec(b.id),UI.phone?(UI.short?40:52):64).outerHTML+'</span><span class="bd-t"><b>'+esc(b.seat===me?'You':shortName(b.seat))+'</b><small>'+esc(TB.cardName(G,b.id))+'</small><i>'+b.str+'</i>'+(w?'<small class="bd-w">'+gloss(w)+'</small>':'')+'</span></div>'}).join('')+'</div>'+cn,'<button class="btn pri" data-a="evok">Continue</button>')}
  if(ev.t==='clash'){const w=ev.winner,tie=w<0;const parts=youFirst(ev.parts);
    const names=parts.map(s=>'<b>'+esc(s===me?'You':sideName(s))+'</b> '+ev.tot[s]).join(' · ');
    const res=tie?'A tie: '+names+'. Nobody wins here yet.':(w===me?'<b>You win</b> '+esc(REG[ev.r])+': '+names+'.':'<b>'+esc(sideName(w))+'</b> wins '+esc(REG[ev.r])+': '+names+'.');
    const night=(ev.logs||[]).filter(t=>!/^(.* reveals |Strength in |Clash [IV]+: |.* wins the Clash|Tie in |Added cards are revealed)/.test(t)).slice(0,10).map(t=>'<li class="'+(/[Ee]liminat/.test(t)&&!/Invulnerable/.test(t)?'warn':'')+'">'+gloss(plain(t))+'</li>').join('');
    return cdWrap('cd-clash','<h3>Clash '+(ev.idx>=0?['I','II','III'][ev.idx]:'')+': '+esc(REG[ev.r])+(ev.n>1?' (replay)':'')+'</h3><div class="cl-panel" id="clp"></div><p class="cl-res" id="clres" hidden>'+res+'</p>'+
      '<div class="bkg'+(parts.length>2?' stack':'')+'" id="clbk" hidden>'+parts.map(s=>'<div class="bks'+(w===s?' win':'')+'" style="--fc:'+fcol(s)+'"><b>'+esc(s===me?'You':sideName(s))+'</b>'+brkHTML(ev,s)+'</div>').join('')+'</div>'+
      (night?'<ul class="cl-log" id="cllog" hidden><li class="cl-h">In this Clash</li>'+night+'</ul>':'<ul id="cllog" hidden></ul>')+cn+'<div class="cl-inf" id="clinf" hidden>'+infChips(ev.inf0,ev.inf1)+'</div>','<button class="btn pri" data-a="evok" id="clok" hidden>Continue</button>')}
  if(ev.t==='summary'){const why=ev.why||[];const order=youFirst(ev.inf1.map((_,s)=>s));
    return cdWrap('cd-sum','<h3>End of round '+ev.round+' of '+ev.rounds+'</h3><table class="sumt"><thead><tr><th></th><th>This round</th><th>Total</th></tr></thead><tbody>'+order.map(s=>{const v=ev.inf1[s];const L=why[s]||[];return '<tr style="--fc:'+fcol(s)+'"><td><b>'+esc(s===me?'You':sideName(s))+'</b></td><td>'+sgn(v-ev.inf0[s])+'</td><td><b>'+v+'</b></td></tr>'+(L.length?'<tr class="sw"><td colspan="3">'+L.map(x=>gloss(x[0])+' '+(x[1]>0?'+':'−')+Math.abs(x[1])).join(', ')+'</td></tr>':'')}).join('')+'</tbody></table>'+cn+
      ((ev.winter&&ev.winter.length)||ev.warns.length?'<ul class="cl-log warn">'+ev.warns.concat(ev.winter||[]).filter(t=>!/Winter: .* played cards/.test(t)||true).map(t=>'<li>'+gloss(plain(t))+'</li>').join('')+'</ul>':'')+
      '<p class="sub">'+(ev.last?'That was the last round: the final count follows.':gloss('Next round everyone refills their hand. The leader on the Order Track acts first. '+(ev.rounds-ev.round)+' round'+(ev.rounds-ev.round>1?'s':'')+' left.'))+'</p>','<button class="btn pri" data-a="evok">'+(ev.last?'See the result':'Start round '+(ev.round+1))+'</button>')}
  return ''}
function infChips(a,b){return a.map((v,s)=>b[s]!==v?'<span style="--fc:'+fcol(s)+'">'+esc(shortName(s))+' '+sgn(b[s]-v)+'</span>':'').join('')}
function playClash(ev,root){const panel=root.querySelector('#clp');if(!panel)return;const w=ev.winner;
  const items=youFirst(ev.parts).map(s=>{const ids=(ev.cardsF&&ev.cardsF[s])||ev.cards[s]||[];const best=ids.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength)[0];
    const spec=best!=null?cardSpec(best):{faction:FK[G.pl[s].fac],title:'No card',value:0,type:'ploy',art:'banner',text:'No card fights here: only Supporters count.'};
    const dead=(ev.dead&&ev.dead[s])||[];const spec2=best==null&&dead.length?Object.assign(cardSpec(dead[0]),{text:'Eliminated at Night.'}):spec;
    return {faction:FK[G.pl[s].fac],name:(s===vs()?'You':sideName(s))+(ids.length>1?' · '+ids.length+' cards':'')+(best==null&&!dead.length?' · no card':best==null?' · card eliminated':''),card:best==null&&dead.length?spec2:spec,strength:ev.tot[s],winner:w===s}});
  const sc=root.querySelector('.cd-sc')||root;const hid=[...sc.children].filter(c=>c.hidden&&c.id!=='clok');hid.forEach(c=>c.hidden=false);let rest=0;for(const c of sc.children)if(c!==panel)rest+=c.offsetHeight+8;hid.forEach(c=>c.hidden=true);const sz=Math.max(62,Math.min(110,Math.floor((root.clientWidth-30)/Math.max(2,items.length))-14,Math.floor((sc.clientHeight-rest-30-50)/1.43/1.08)));
  const cp=TBKit.clashPanel(panel,items,{size:sz,tie:w<0});UI._cp=cp;
  const fin=()=>{['#clres','#clbk','#cllog','#clinf','#clok'].forEach(q=>{const e=root.querySelector(q);if(e)e.hidden=false});UI.clashRes[ev.r]={winner:w,tot:ev.tot};
    const b=root.querySelector('#clok');if(b)try{b.focus({preventScroll:true})}catch(e){}if(typeof sfx==='function')sfx(w<0?'tie':'win')};
  if(!ANIM){cp.el.querySelectorAll('.tb-flipcard').forEach(f=>f.classList.add('tb-up'));cp.el.querySelectorAll('.tb-clash-col').forEach(c=>c.classList.add('tb-shown'));fin();return}
  mapReveal(ev);
  setTimeout(()=>{const key=UI._cardKey;cp.play().then(()=>{if(UI._cardKey===key)fin()})},350)}
function overHTML(){const o=G.over;const rk=o.ranking;const win=o.winner;const me=vs();const iWon=(NET.on||humans().length===1)&&win===me;
  const head=iWon?'You win the throne!':esc(nameOf(win).replace(/^You$/,'You'))+' takes the throne';const nmS=s=>(s===me&&(NET.on||humans().length===1))?'You ('+sideName(s)+')':shortName(s);
  const endImg='<img class="endart" src="media/end-'+((iWon||(!NET.on&&humans().length!==1))?'win':'lose')+'.webp" alt="" draggable="false" onerror="this.remove()">';
  const body=endImg+'<h3>'+head+'</h3><p class="sub">'+esc(DD.FNAME[G.pl[win].fac])+' ends with <b>'+G.pl[win].inf+'</b> Influence'+(o.tieBreak?' (tie broken by '+(o.tieBreak==='favour'?'the Kingdom\'s Favour':'turn order')+')':'')+'.</p><ol class="rank">'+rk.map((s,i)=>'<li style="--fc:'+fcol(s)+'"><b>'+(i+1)+'. '+esc(nmS(s))+'</b><span>'+G.pl[s].inf+' Influence'+(o.bonus&&o.bonus[s]?' <small>(+'+o.bonus[s]+' from the emptied Site of Power)</small>':'')+'</span></li>').join('')+'</ol>'+(typeof overBreakdown==='function'?overBreakdown():'');
  const foot=NET.on?(isHost()?'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="netopen">Lobby</button>':'<button class="btn" data-a="netleave">Leave</button>'):'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="menu">Main menu</button>';
  const gnote=typeof isGuided==='function'&&isGuided()?'<p class="coach">'+gloss('You have played a whole game. Next time try a full game from Play: choose the faction whose story you like, 3 players, 5 rounds. Suggestions show in rounds 1 and 2; after that tap Suggest a move when you want one.')+'</p>':'';
  return cdWrap('cd-over',body+gnote+(NET.on&&!isHost()?'<p class="sub">The host can start another game.</p>':''),foot)}
// ===================== part 5: render loop, clicks, drawers (rules, log, board, menu), start screen =====================
function renderAll(){if(!G||!UI.started)return;
  try{UI.V=isClient()?G:TB.stripView(G,isPassing()?-1:vs())}catch(e){console.error('view '+e.message);return}  // a client's G is already its own stripped copy
  if(isPassing()){if(GX.open)GX.close();const bb=$('#boardbody');if(bb)bb.innerHTML='';if(UI.pop)closePop(true)}
  if(!(UI.card&&UI.card.kind==='event'))renderMap();else if(!MAP.m)renderMap();
  renderMain();renderBar();renderHand();renderDeskRoad();renderRivals();renderSpots();setHB();renderCard();renderPop();updateLive();
  document.documentElement.dataset.step=String(roadIdx());
  if(typeof bfAfter==='function')bfAfter();
  netAfter();
  const lb=$('#logbody');if(lb&&GX.open==='logd')renderLog()}
function setHB(){}
function updateLive(){const l=$('#live');if(!l)return;const last=G.log[G.log.length-1];if(last&&UI._liveN!==last.i){UI._liveN=last.i;l.textContent=last.t}}
// ---------------------------------------------------------------- clicks
document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('[data-a]');
  // an open detail sheet closes on any tap outside it (that tap does nothing else)
  if(UI.pop&&G&&UI.started&&!(e.target.closest&&e.target.closest('#ppop,.gx-drawer,#start,#netbox'))){closePop();e.stopPropagation();return}
  if(!t){return}
  const a=t.dataset.a;
  if(netClick(a,t))return;
  switch(a){
   case 'mv':{if(!humanMove(t.dataset.k)){renderAll()}break}
   case 'hand':{handTap(+t.dataset.id);break}
   case 'spot':spotTap();break;
   case 'powers':{UI.sheetOpen=!UI.sheetOpen;renderAll();break}
   case 'ordundo':{UI.ord=[];renderAll();break}
   case 'loc':openPop('loc',{l:+t.dataset.l});break;
   case 'rival':openPop('rival',{s:+t.dataset.s});break;
   case 'kc':openPop('kc',{n:+t.dataset.n});break;
   case 'road4':openPop('kingdom');break;
   case 'pclose':closePop();break;
   case 'newsok':newsOk();break;
   case 'hint':{const s=viewSeatForQ();if(s!=null){UI.hintQ=qKey(s,legal(s));renderAll()}break}
   case 'confirm':{UI.pop='confirm';UI.popArg={k:t.dataset.k};renderPop();break}
   case 'take':{const s=+t.dataset.s;UI.holder=s;UI.passed=s;UI.card=null;UI._cardKey=null;UI.pop=null;pump();break}
   case 'evok':{evDone();break}
   case 'tipx':UI.tip[t.dataset.k]='x';renderAll();break;
   case 'gloss':showGloss(t.dataset.t);break;
   case 'gclose':hideGloss();break;
   case 'nowlog':GX.show('logd');break;
   case 'title':UI.sv='title';renderStart();break;
   case 'story':storyOpen();break;
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
   case 'music':renderMusic();GX.show('musd');break;
   case 'mpick':musicPick(t.dataset.s,t.dataset.c);renderMusic();break;
   case 'mall':{const on=MLOOPS.every(k=>MS.pick[k]==='all');MLOOPS.forEach(k=>musicPick(k,on?MDEF[k]:'all'));renderMusic();break}
   case 'mprev':musicPreview(t.dataset.s);renderMusic();break;
   case 'mprevx':musicPreviewStop();renderMusic();break;
   case 'mmus':UI.music=!UI.music;try{localStorage.setItem('tb_mus',UI.music?'1':'0')}catch(x){}if(window.GA)GA.setMusic(UI.music);musicSync();renderMusic();break;
   case 'gdset':UI.guide=t.dataset.v;renderMenu();break;
   case 'snd':UI.sound=!UI.sound;try{localStorage.setItem('tb_snd',UI.sound?'1':'0')}catch(x){}if(window.GA)GA.setSfx(UI.sound);renderMenu();break;
   case 'cback':try{localStorage.setItem('tb_back',t.dataset.v==='court'?'court':'default')}catch(x){}renderMenu();break;
   case 'mus':UI.music=!UI.music;try{localStorage.setItem('tb_mus',UI.music?'1':'0')}catch(x){}if(window.GA)GA.setMusic(UI.music);musicSync();renderMenu();break;
   case 'gfx':UI.lowGfx=!UI.lowGfx;try{localStorage.setItem('tb_gfx',UI.lowGfx?'low':'high')}catch(x){}UI.mapReset=true;renderAll();renderMenu();break;
   case 'savenow':saveGame();toast('Saved. You can continue from the start screen.');break;
   case 'newgame':GX.close();showStart();break;
   case 'spd':UI.speed=+t.dataset.v;renderMenu();break;
   case 'logall':UI.logAll=!UI.logAll;renderLog();break;
  }});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.pop&&!GX.open){closePop();e.preventDefault()}});
function toast(t){UI.toast=t;const l=$('#live');if(l)l.textContent=t}
// start screens (title, setup, online): see part 7
function startFromCfg(c){hideStart();const o={np:c.np,length:c.length,faction:c.faction,levels:c.levels,guide:c.guide,seatFactions:c.seats.map(s=>s.faction),humanSeats:c.humanSeats};
  if(c.tutorial&&typeof tutStart==='function')tutStart();else if(c.guided)newGame('guided',o);else newGame(c.mode==='watch'?'ai':c.mode,o)}
function afterStart(){closePop(true);GX.close();UI.mapReset=true;renderAll();pump()}
// ---------------------------------------------------------------- drawers
function renderLog(){const el=$('#logbody');if(!el||!G)return;const L=G.log.slice().reverse();let h='<p class="small">Newest first. Tap an underlined word for its meaning. <button class="btn" data-a="logall">'+(UI.logAll?'Show key events only':'Show everything')+'</button></p><ol class="log">';
  let r=-1;for(const e of L){if(!UI.logAll&&e.c!=='big'&&e.c!=='warn'&&!(e.m&&['inf','steal','elim','kcsteal','tac','fav','inv'].includes(e.m.k)))continue;if(e.r!==r){r=e.r;h+='<li class="lr">Round '+r+'</li>'}h+='<li class="'+(e.c||'')+'"><i style="background:'+(e.s>=0?fcol(e.s):'#777')+'"></i>'+gloss(plain(e.t))+'</li>'}
  el.innerHTML=h+'</ol>'}
function renderMenu(){const el=$('#setbody');if(!el)return;
  const seg=(a,cur,opts)=>'<div class="seg">'+opts.map(([v,l])=>'<button class="'+(String(cur)===String(v)?'on':'')+'" data-a="'+a+'" data-v="'+v+'">'+l+'</button>').join('')+'</div>';
  el.innerHTML=(NET.on?'<div class="mrow"><button class="btn pri" data-a="netopen">Online lobby</button>'+(isHost()?'<button class="btn" data-a="newgame">Change setup</button>':'')+'<button class="btn" data-a="netleave">Leave the room</button></div>':'<div class="mrow"><button class="btn pri" data-a="newgame">New game / main menu</button><button class="btn" data-a="savenow">Save now</button></div>')+
   (typeof tutBtn==='function'?'<div class="mrow">'+tutBtn('btn')+'</div>':'')+'<div class="mrow"><span>Guide</span>'+seg('gdset',UI.guide,[['full','Full tips'],['light','Light'],['off','Off']])+'</div>'+
   (typeof hlpInit==='function'&&(hlpInit(),typeof GXH!=='undefined')?GXH.settingsHTML({rowClass:'mrow',btnClass:'btn'}):'')+
   '<div class="mrow"><span>Computer speed</span>'+seg('spd',UI.speed,[[1,'x1'],[2,'x2'],[4,'x4']])+'</div>'+
   '<div class="mrow"><span>Sound</span><button class="btn" data-a="snd" aria-pressed="'+UI.sound+'">'+(UI.sound?'On':'Off')+'</button><span>Music</span><button class="btn" data-a="mus" aria-pressed="'+UI.music+'">'+(UI.music?'On':'Off')+'</button><button class="btn" data-a="music">Pick the songs…</button></div>'+
   (()=>{let c='default';try{c=localStorage.getItem('tb_back')==='court'?'court':'default'}catch(e){}const st=GXC&&GXC.unlocked?GXC.unlocked().some(x=>x.type==='cardback'):false;return '<div class="mrow"><span>Card back</span><button class="btn" data-a="cback" data-v="default" aria-pressed="'+(c==='default')+'">Thorn crown</button><button class="btn" data-a="cback" data-v="court" aria-pressed="'+(c==='court')+'">Crowned stag</button>'+(st?'<span class="small">An unlocked story back is used while you have one.</span>':'')+'</div>'})()+
   '<div class="mrow"><span>Graphics</span><button class="btn" data-a="gfx" aria-pressed="'+!!UI.lowGfx+'">'+(UI.lowGfx?'Low (fast)':'High')+'</button>'+(window.PerfHUD?PerfHUD.buttonsHTML('btn'):'')+'</div>'+
   '<h4>Credits</h4><p class="small">Art, map, cards and icons are original: pictures painted by Am015-dev, plus procedural drawings. Fonts: Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1. The game rules follow a published game family; every name and text here is our own wording. Music by Am015-dev.</p>'}
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
<p>The guided first game walks you through this once. Underlined words in the game can be tapped for their meaning.</p></div>
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
  GX.drawer('musd','Music',(()=>{const d=document.createElement('div');d.id='musbody';return d})());
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
function musicFor(){musicSync()}
// ---------------------------------------------------------------- phone mode + board-first layout
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
// Layout (CSS grid in head.html): portrait = seats strip, the map (fills what is left), the tray (action row + hand fan);
// wide = the map square on the left, seats + tray on the right. The map is always the biggest thing on the screen.
function phApply(){const was=UI.phone,wasLand=UI.land;const on=phDetect();const root=document.documentElement;
  const W=innerWidth,H=innerHeight;UI.phone=on;UI.land=W>=H*1.15;UI.short=on?(UI.land?H<370:H<600):H<560;
  root.classList.toggle('ph',on);root.classList.toggle('ph-p',on&&!UI.land);root.classList.toggle('ph-l',on&&UI.land);root.classList.toggle('short',!!UI.short);
  root.classList.toggle('bf-w',UI.land);root.classList.toggle('bf-p',!UI.land);UI.desk=UI.land&&!on;root.classList.toggle('desk',UI.desk);
  const barH=on?44:48;
  let cw=UI.land?Math.max(44,Math.min(66,Math.floor((H-barH-52-46-24-16)/1.4308))):(H<600?44:H<820?50:H<1000?56:66);
  if(!UI.land){ // portrait: the map is as wide as the screen; whatever height is left over goes to a bigger hand
    const mn=$('.gx-main'),rv=$('#rivals');const Hm=(mn&&mn.clientHeight)||(H-barH),rh=(rv&&rv.offsetHeight)||52;
    const hh=Hm-rh-46-W-10;cw=Math.max(cw,Math.min(on?64:76,Math.floor((hh-24)/1.4308)))}
  if(UI.desk){ // desktop: the right column is the table; the hand gets big, readable cards
    const R=W-Math.max(150,Math.min(H-barH,Math.round(W*.62)));cw=Math.max(66,Math.min(116,Math.floor((H-barH)*.125),Math.floor((R-48)/3.9)))}
  root.style.setProperty('--cw',cw+'px');root.style.setProperty('--ch',Math.round(cw*1.4308)+'px');root.style.setProperty('--barh',barH+'px');
  if(UI.land)root.style.setProperty('--bs',Math.max(150,Math.min(H-barH,Math.round(W*.62)))+'px');
  sizeMap();
  if((was!==on||wasLand!==UI.land)&&G){UI.mapReset=true;renderAll()}}
// the map square: as big as the board area allows (portrait: the width; wide: the left column)
function sizeMap(){const bd=$('#board');if(!bd)return;const W=bd.clientWidth,H=bd.clientHeight;if(!W||!H)return;const S=Math.max(120,Math.floor(Math.min(W,H)));
  document.documentElement.style.setProperty('--ms',S+'px');UI.bs=S}
function phoneRefresh(){}
function toggleZoom(){}
function wantSmall(){return false}
// One relayout path for resize, orientationchange, visualViewport and the board's ResizeObserver (iOS reports the old size right after rotating, so it re-measures at ~400 ms).
let _rz=0,_rz2=0,_rzSig='';
function relayout(force){const bd=$('#board'),sig=innerWidth+'x'+innerHeight+'|'+(bd?bd.clientWidth+'x'+bd.clientHeight:'');if(!force&&sig===_rzSig)return;_rzSig=sig;
  phApply();if(G&&UI.started)renderAll();else if(typeof renderStart==='function'){const st=$('#start');if(st&&!st.hidden)renderStart()}}
function onResize(){clearTimeout(_rz);clearTimeout(_rz2);_rz=setTimeout(()=>relayout(),80);_rz2=setTimeout(()=>relayout(),420)}
addEventListener('resize',onResize);addEventListener('orientationchange',onResize);
try{if(window.visualViewport)visualViewport.addEventListener('resize',onResize)}catch(e){}
try{if(window.ResizeObserver){const bd=document.getElementById('board');if(bd)new ResizeObserver(onResize).observe(bd)}}catch(e){}
// ---------------------------------------------------------------- boot
function boot(){
  try{UI.sound=localStorage.getItem('tb_snd')!=='0';UI.music=localStorage.getItem('tb_mus')!=='0';UI.lowGfx=localStorage.getItem('tb_gfx')==='low'}catch(e){}
  try{if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tbt'});GA.setSfx(UI.sound);GA.setMusic(UI.music)}}catch(e){}
  try{if(window.PerfHUD)PerfHUD.register({game:'Thornbound Throne',levels:['high','low'],names:{high:'High',low:'Low'},getLevel:()=>UI.lowGfx?'low':'high',isAuto:()=>false,setLevel:(l,why)=>{if(why==='apply'){UI.lowGfx=l==='low';UI.mapReset=true;G&&renderAll()}},isAnimating:()=>UI.busy,anchor:'.gx-board',corner:'tl'})}catch(e){}
  GX.init({key:'tb'});setupDrawers();phApply();netInit();
  TBKit.ready.then(()=>{document.documentElement.classList.add('tb-ready');if(!UI.started)showStart()});
  document.addEventListener('pointerdown',()=>{try{if(window.GA)GA.unlock();musicSync()}catch(e){}},{once:true});setInterval(()=>{try{musicSync()}catch(e){}},700)}
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
  out=out.replace(/\b([Yy])ou \((?:[Tt]he )?you\) wins\b/,'$1ou win');   // "The game ends. X (faction) wins" when X is you
  if(subj)out=out.replace(/\btheir\b/,'your').replace(/^(You [^.]*?) and has /,'$1 and have ').replace(/^(You [^.]*?) and is /,'$1 and are ');return out}
// ---------------------------------------------------------------- "what's happening": the newest public event, in plain words
const PHASEN={spring:'Spring',summer:'Day',autumn:'Autumn'};
function aiFallback(s,q,mv){const N=G.pl[s].name;const k=q.kind;
  if(k==='bid')return N+' bids.';if(k==='place'&&mv.r!=null)return N+' hides a card next to '+REG[mv.r]+'.';
  if(q.t==='menu'&&mv.t==='done')return null;   // trivia: not narrated
  if(k==='edict')return mv.yes?N+' plays a Tactic.':null;if(k==='statue'||k==='harvest')return N+' decides about a card.';
  return null}
function renderNow(){const el=$('#now');if(!el||!G)return;
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
  if(G.logN===l0&&q&&mv){const t=aiFallback(s,q,mv);if(t)UI.nowT={at:G.logN,s,t}}}})();
// ---------------------------------------------------------------- glossary: every game word can be tapped for its meaning
const GLOSS=[
 ['influence',/\bInfluence\b/,'Influence','The score. Whoever holds the most Influence when the last round ends wins the throne. You gain it by winning Clashes and claiming locations.'],
 ['kingdom card',/\bKingdom Cards?\b/,'Kingdom Card','A shared power card. Win one with your bid: it sits on your board with your bid card tucked under it, and its power works for you as long as you keep it (at most two).'],
 ['great road',/\bGreat Road\b/,'Great Road','The row of four face-up Kingdom Cards you can bid for. Cards nobody takes slide along, and the oldest is thrown away each round.'],
 ['herald',/\bHeralds?\b/,'Herald','Your one public envoy. Put it on a location in Spring. If you then win that region and claim that location, you gain +1 Influence and take 1 from every rival Herald standing there.'],
 ['supporter',/\bSupporters?\b/,'Supporter','Five small helpers on your board. Each one you send to a region adds +1 Strength there in its first Clash. In Winter, Supporters on the map go to the Lost Pile: they are gone unless a Council of Pledges or another power brings them back.'],
 ['clash',/\bClash(es)?\b/,'Clash','The fight in one region. Everyone\'s hidden cards there are flipped, abilities are used, and the highest total Strength (cards + Supporters) wins the region.'],
 ['strength',/\bStrength\b/,'Strength','The big number at the top left of a card. In a Clash you add up the Strength of your cards there, +1 per Supporter.'],
 ['region',/\bregions?\b/i,'Region','One of the three areas of the map: the Uplands, the Tablelands and the Sinks. Each has two locations and one Clash per round.'],
 ['location',/\blocations?\b/i,'Location','One of the six places on the map. The winner of a region\'s Clash claims one of its two locations: its Influence plus its bonus.'],
 ['bid',/\bbids?\b/i,'Bid','A card you choose secretly at the start of a round. Its Strength is the bid: the highest bid picks a Kingdom Card first.'],
 ['tactic',/\bTactics?\b/,'Tactic','Four special powers of your faction. Most work once per game, then they are Exhausted. A Tactic that starts with markers (like Open Waterways) works once a round until its markers are used up.'],
 ['lore',/\bLore\b/,'Lore','A second currency. You gain it with a Journey and spend it on your faction\'s Site of Power cards: stronger cards and permanent powers.'],
 ['site of power',/\bSite of Power\b/,'Site of Power','Your faction\'s five extra cards, bought with Lore. If you buy them all, your leftover Lore turns into Influence at the end.'],
 ['govern',/\bGovern\b/,'Govern','An Autumn action, once a round: move a hand card that shows votes into one of the three Councils.'],
 ['journey',/\bJourney\b/,'Journey','An Autumn action, once a round: send away a hand card that shows Lore, and gain that much Lore.'],
 ['council',/\bCouncils?\b/,'Council','Three Councils (Coin, Whispers, Pledges). Cards with votes placed there give you a lasting benefit every round.'],
 ['attrition',/\bAttrition\b/,'Attrition','When you must draw and your deck is empty, your discard pile becomes a new deck and your hand size drops by one (never below 3).'],
 ['favour',/\b(Kingdom's )?Favour\b/,'Kingdom\'s Favour','A disc you claim at the Gleaning Meadow. While you hold it you may use your faction\'s Favour power (three uses), and if Influence is tied when the game ends, the holder wins (it does not decide Clash ties).'],
 ['order track',/\bOrder Track\b/,'Order Track','The turn order. At the start of each round the player with the most Influence goes first; the last one chooses the Clash order. Ties go to the player higher on it.'],
 ['winter',/\bWinter\b/,'Winter','The end of a round: Heralds go home, Supporters on the map go to the Lost Pile, and played cards go to the discard pile.'],
 ['autumn',/\bAutumn\b/,'Autumn','After the Clashes: once each you may Govern and Journey, and use Autumn abilities such as Rally.'],
 ['ambush',/\bAmbush\b/,'Ambush','A Day ability: add a hidden card from your hand to this Clash.'],
 ['retreat',/\bRetreat\b/,'Retreat','A Day ability: pull your cards, Herald or Supporters out of this region.'],
 ['flank',/\bFlank\b/,'Flank','A Day ability: move this card to a region that has not fought yet.'],
 ['deadly',/\bDeadly\b/,'Deadly','A Night effect: every opposing card in the Clash is Eliminated (to the Lost Pile) unless it is Invulnerable. Two Deadly cards eliminate each other.'],
 ['rally',/\bRally\b/,'Rally','An Autumn ability: take your cards on the map back into your hand before Winter discards them.'],
 ['deploy',/\bDeploy\b/,'Deploy','An Autumn ability: put a card face up next to a region; it stays through the next Winter(s).'],
 ['lost pile',/\bLost Pile\b/,'Lost Pile','Where Eliminated cards and spent Supporters go. They do not come back when your deck is reshuffled.'],
 ['hand size',/\bhand size\b/i,'Hand size','How many cards you draw up to each round (6 at the start). Attrition lowers it.'],
 ['occupier',/\boccup(ier|ying|ies|y)\b/i,'Occupier','The card tucked under a Kingdom Card (your bid card). It cannot fight. A rival can steal the Kingdom Card with a bid stronger than it; then it comes back to your hand.'],
 ['exhausted',/\bExhausted\b/,'Exhausted','A used Tactic. It cannot be used again unless something refreshes it.'],
 ['heir',/\bHeirs?\b/,'Heir','Your strongest basic card (Strength 10), the one you start with. Some cards and Kingdom Cards give Heirs extra powers.'],
 ['captain',/\bCaptains?\b/,'Captain','A card type (Strength 6 to 9). It has no ability of its own; some powers name Captains.'],
 ['follower',/\bFollowers?\b/,'Follower','A card type (Strength 1 to 4). Followers are Invulnerable, and the basic Agent eliminates itself when it meets one.'],
 ['agent',/\bAgents?\b/,'Agent','A card type. The basic Agent is Deadly, but it eliminates itself if an opposing Follower is in the same Clash.'],
 ['cavalry',/\bCavalry\b/,'Cavalry','A card type of riders; the basic one can Flank.'],
 ['war machine',/\bWar [Mm]achines?\b/,'War machine','A card type: a big Invulnerable engine that can Deploy.'],
 ['champion',/\bChampions?\b/,'Champion','A strong Site of Power card (Strength 11).'],
 ['trader',/\bTraders?\b/,'Trader','A card type with votes and Lore but no Strength; it can Rally.'],
 ['ruse',/\bRuse\b/,'Ruse','A Strength 0 bluff card: it can Ambush or Retreat.'],
 ['invulnerable',/\bInvulnerable\b/,'Invulnerable','This card cannot be Eliminated.'],
 ['resilient',/\bResilient\b/,'Resilient','If this card is Eliminated it goes to your Discard Pile (you get it back later), not the Lost Pile.'],
 ['pathfinder',/\bPathfinder\b/,'Pathfinder','If this card is used for a Journey it goes to your Discard Pile instead of the Lost Pile.'],
 ['eliminate',/\b[Ee]liminat(e|es|ed|ion)\b/,'Eliminated','Removed from a Clash before the count: the card goes to the Lost Pile (Resilient cards: to the Discard Pile). Deadly cards eliminate opposing cards at Night.'],
 ['active',/\bActive\b/,'Active','A face-up card next to a region. Only Active cards fight and use their powers.'],
 ['hq',/\bHQ\b/,'HQ','A Site of Power card that is a permanent power: once bought it stays in front of you and never goes to your hand.'],
 ['discard pile',/\bDiscard Pile\b/,'Discard Pile','Your used cards. When your deck runs out, the Discard Pile becomes your new deck (Attrition).'],
 ['vote',/\bvotes?\b/i,'Vote','The gavel number on a card. Votes count in a Council when you Govern with the card.'],
 ['supply',/\bSupply\b/,'Supply','The things in front of you: your Influence, Lore and permanent cards.'],
 ['herald reward',/\bHerald Reward\b/,'Herald Reward','When you claim the location where your Herald stands: +1 Influence, and you take 1 from every rival Herald on it.'],
 ['spring',/\bSpring\b/,'Spring','The first part of a round: bids, Heralds, hidden cards, then optional Spring powers such as sending Supporters.'],
 ['day',/\bDay\b/,'Day','Before each Clash, with the cards face up: players may use Day powers (Ambush, Retreat, Flank, some Tactics).'],
 ['night',/\bNight\b/,'Night','Right after Day, before the count: Night effects happen by themselves. Deadly cards eliminate opposing cards.'],
 ['council of coin',/\bCouncil of Coin\b/,'Council of Coin','When you claim a Herald Reward you may take your cards out of this Council for Influence equal to their votes.'],
 ['council of whispers',/\bCouncil of Whispers\b/,'Council of Whispers','In Autumn, place markers on locations; four on one location claim its bonus.'],
 ['council of pledges',/\bCouncil of Pledges\b/,'Council of Pledges','In Autumn, bring Supporters back to your board: one per vote, one more for the biggest voter.'],
 ['kingdom deck',/\bKingdom Deck\b/,'Kingdom Deck','The face-down pile that refills the Great Road.'],
];
const GL={};GLOSS.forEach(g=>GL[g[0]]=g);
// escape + wrap the first appearance of each term in this text with a tappable chip
// card and Kingdom Card names are never split into glossary words ("Night Ferry Captain" stays a name)
let _nameRe=null;function nameRe(){if(_nameRe)return _nameRe;const D=TB.DATA,n=[];for(const f in D.BASICNAMES)n.push(...D.BASICNAMES[f]);for(const f in D.SITE)for(const c of D.SITE[f])n.push(c.nm);for(const k of D.KC)n.push(k.nm);for(const t in D.TACTICS)for(const x of D.TACTICS[t])n.push(x.nm);for(const f in D.FAVOUR)n.push(D.FAVOUR[f].nm);
  const u=[...new Set(n)].filter(Boolean).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));_nameRe=new RegExp('('+u.join('|')+')','g');return _nameRe}
function gloss(text){if(text==null)return '';text=String(text);const hits=[];const masked=[];{const re=nameRe();re.lastIndex=0;let m;while((m=re.exec(text)))masked.push([m.index,m.index+m[0].length])}
  const inName=(i,n)=>masked.some(([a,b])=>i<b&&i+n>a);
  for(const [k,re] of GLOSS){const g=new RegExp(re.source,re.flags.replace('g','')+'g');let m;while((m=g.exec(text))){if(!inName(m.index,m[0].length)){hits.push({i:m.index,n:m[0].length,k});break}}}
  hits.sort((a,b)=>a.i-b.i||b.n-a.n);let out='',p=0;
  for(const h of hits){if(h.i<p)continue;out+=esc(text.slice(p,h.i));const nw=!(UI.glSeen&&UI.glSeen[h.k]);out+='<button type="button" class="gl'+(nw?' new':'')+'" data-a="gloss" data-t="'+esc(h.k)+'" aria-label="'+esc(text.substr(h.i,h.n))+': what does it mean?">'+esc(text.substr(h.i,h.n))+'</button>';p=h.i+h.n}
  return out+esc(text.slice(p))}
function showGloss(k){const g=GL[k];const el=$('#gdef');if(!g||!el)return;UI.glSeen=UI.glSeen||{};UI.glSeen[k]=1;
  el.innerHTML='<p><b>'+esc(g[2])+'</b>: '+esc(g[3])+'</p><button class="pp-x" data-a="gclose" aria-label="Close">'+ico('x')+'</button>';el.hidden=false;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');if(typeof sfx==='function')sfx('tap')}
function hideGloss(){const el=$('#gdef');if(el){el.hidden=true;el.innerHTML=''}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.more)UI.moreOpen=d.open},true);
// ---------------------------------------------------------------- the guided first game: fixed deal, one thing per step
// Deal: you lead the Heathbound Clans against the Gilded Court (Easy), 4 rounds, seed 23 (picked with the seed search in the clarity pass: round 1 has no elimination, one Clash lost, one won with Supporters on the contested Herald location, so the +1 and the steal happen).
// Cairn Field and win there with your Heir and two Supporters: the +2, the Herald's +1 and the steal all happen in round 1.
const GUIDED={seed:23,lastNormal:0,ai:9,faction:'clans',rival:'nobility'};
const isGuided=()=>!!(UI.cfg&&UI.cfg.guided&&!NET.on);
// the old coach pop-ups (goal / map / round) are replaced by the staged tutorial (part 12, shell/gx-tutor.js)
function coachGate(){if(!G||!G.q)return false;if(!isGuided())return false;UI.coachDone=UI.coachDone||{};
  // the guided game skips a season for you when nothing you have learnt yet can be used in it
  const s=viewSeatForQ();if(s!=null&&G.q.t==='menu'&&G.round<3&&menuPhase(G.q)!=='Day'){const mv=legal(s);if(!visibleActs(mv).some(m=>m.t==='act')){const d=mv.find(m=>m.t==='done');if(d){if(!UI._skipT)UI._skipT=setTimeout(()=>{UI._skipT=0;humanMoveAuto(d.k)},0);return true}}}
  return false}
const menuPhase=q=>((q.title||'').match(/(Spring|Day|Autumn)/)||[])[1]||'';
const byLabel=(mv,txt)=>mv.find(m=>(m.label||'').indexOf(txt)>=0);
const BONUSK=['castle','wilderness','harvest','shrine','ossuary'];
// teaching moves for round 1 (falls back to the normal suggestion when the scripted card is not there)
function coachRec(s,mv){if(!isGuided()||!G.q)return null;if(UI.cfg.tutorial){const tr=tutRec(s,mv);if(tr!==undefined)return tr}const q=G.q,k=q.kind;
  if(G.round===1){
    if(k==='bid')return byLabel(mv,'Sailing Hall');
    if(k==='bidRes'){const takes=mv.filter(m=>m.t==='take');const pref=[11,13,17,5,46,51,14,39];for(const n of pref){const m=takes.find(x=>x.kc===n);if(m)return m}
      return takes.find(m=>!/Tactic|Favour|Council|Lore|Govern|Journey|SETUP/.test(TB.kingdomInfo(m.kc).text))||null}
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return riv?mv.find(m=>m.loc===riv.herald):byLabel(mv,'Cairn Field')}
    if(k==='place'){const P=G.pl[s];const heir=P.hand.find(id=>cinfo(id).archetype==='heir');if(heir!=null)return mv.find(m=>m.id===heir&&m.r===1);const big=P.hand.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength);
      if(big.length)return mv.find(m=>m.id===big[0]&&m.r===0)||mv.find(m=>m.id===big[0]);return null}
    if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'&&G.pl[s].supp.r[1]===0){const m=mv.find(x=>x.a==='supp'&&x.p.r===1&&x.p.n===2);if(m)return m}return mv.find(m=>m.t==='done')}
    if(k==='harvest')return mv.find(m=>m.yes)||null;
    if(BONUSK.includes(k))return mv.find(m=>m.skip||m.t==='seldone')||null}
  return null}
const STEPN=(n,t)=>'Step '+n+' of 6 · '+t;
const NEWK={cmd:['Card abilities','Some of your cards have a power printed on them (Flank, Ambush, Retreat, Rally, Deploy). The card says when it works. Why you\'d want it: move a card to where it wins, or save it for later.'],
  lore:['Journey','Send a hand card away to gain its Lore. Why you\'d want it: Lore buys your Site of Power cards, which are stronger than your basic cards.'],
  tactic:['Tactics','Four special powers of your faction. Most work once per game, some once a round. Why you\'d want them: one well-timed Tactic can turn a Clash.'],
  favour:['The Kingdom\'s Favour','A faction power with three uses, from the Gleaning Meadow. Why you\'d want it: an extra push when you need it, and if Influence is tied when the game ends, the holder wins (it does not decide Clash ties).'],
  govern:['Govern and Councils','Put a hand card with votes into a Council. Why you\'d want it: each Council gives a lasting power (Influence, Supporters back, or location bonuses).'],
  council:['Councils','Your cards in a Council give you a power. Why you\'d want it: it works every round while the cards stay there.'],
  kc:['Kingdom Card powers','Some Kingdom Cards and HQ cards have a power you choose when to use. Why you\'d want it: each row says what it costs and what it gives.']};
// the coach line that replaces the prompt in round 1 (and the first time something new appears later)
function coachFor(s,mv,rm){UI._coachShown=null;if(!isGuided()||!G.q||UI.cfg.tutorial)return null;const q=G.q,k=q.kind,R=G.round;UI.coachDone=UI.coachDone||{};
  const nm=id=>cinfo(id).name+' ('+cinfo(id).strength+')';
  if(R===1){
    if(k==='bid')return {title:STEPN(1,'Bid'),pulse:1,noRec:1,text:'Pick a hand card as a secret bid: the higher bid picks a Kingdom Card first, and your bid card is tucked under it.'+(rm?' '+nm(rm.id)+' is a fair bid that keeps your big cards for the Clashes.':'')};
    if(k==='bidRes')return {title:STEPN(2,'Take a Kingdom Card'),pulse:1,noRec:1,text:'A Kingdom Card is a lasting power; your bid card stays tucked under it.'+(rm&&rm.kc?' Take '+TB.kingdomInfo(rm.kc).name+' (tap it to read it).':'')};
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return {title:STEPN(3,'Place your Herald'),pulse:1,noRec:1,text:'Win the region where your Herald stands and claim its location: +1 Influence, and you take 1 from each rival Herald there.'+(riv&&rm?' The Court is on '+LOCN[riv.herald]+': join it.':'')}}
    if(k==='place'){const n=UI.V.reg.reduce((a,R2)=>a+R2.down.filter(id=>id>=0&&ownerOf(id)===s).length,0);
      return {title:STEPN(4,'Hide a card at each region'),pulse:1,noRec:1,text:'Card '+Math.min(3,n+1)+' of 3, hidden until the Clash. '+(rm?nm(rm.id)+' to '+REG[rm.r]+(cinfo(rm.id).archetype==='heir'?': your strongest card where both Heralds wait.':'.'):'Choose a card for each region.')}}
    if(q.t==='menu'&&menuPhase(q)==='Spring'){const sent=G.pl[s].supp.r[1]>0;return {title:STEPN(5,'Send Supporters'),pulse:1,noRec:1,text:sent?'Two Supporters stand with your Heir. Now tap Done with Spring.':'Each Supporter you send adds +1 Strength in a region\'s first Clash, but it is gone after this round. Send 2 to the Tablelands to back your Heir.'}}
    if(k==='clashOrder')return {title:STEPN(6,'The Clashes'),pulse:1,noRec:1,text:'You are last in turn order, so you choose which region fights first. Any order works: take the suggested one.'};
    if(q.t==='menu'&&menuPhase(q)==='Day')return {title:STEPN(6,'The Clash in '+(G.clash?REG[G.clash.r]:'a region')),pulse:1,noRec:1,text:'The cards are face up: the box shows each side\'s Strength. Later you can use Day powers here; for now tap Done and the Clash is fought.'};
    if(k==='location')return {title:'You won: claim a location',pulse:1,noRec:1,text:'Pick one of the region\'s two locations.'+(rm?' '+whyFor(s,rm):'')};
    if(k==='tie')return {title:'A tie!',pulse:1,text:'Both sides have the same total. Each of you may add one more hidden card, or pass. If nobody adds one, nobody wins here.'};
    if(BONUSK.includes(k))return {title:'Location bonus: '+(QNAME[k]||'a bonus'),pulse:1,noRec:1,text:({castle:'The Spire Court lets you put a card into a Council. Councils come in round 3: skip it for now.',wilderness:'Thornwild lets you send a card on a Journey for Lore. Lore comes in round 2: skip it for now.',harvest:'The Gleaning Meadow gives you the Kingdom\'s Favour: a power for later, and it wins ties. Claim it.',shrine:'Moss Altar lets you put cards at the bottom of your deck. Choose none for now.',ossuary:'You drew cards back from your Discard Pile. You may also discard some: choose none for now.'})[k]}}
  if(q.t==='menu'){const L=visibleActs(mv).filter(m=>m.t==='act');for(const K of ['cmd','lore','tactic','favour','govern','council','kc']){if(UI.coachDone['new_'+K])continue;if(L.some(m=>actKind(m.a)===K)){UI._coachShown='new_'+K;return {title:'New: '+NEWK[K][0],text:NEWK[K][1]}}}}
  if(k==='siteBuy'&&!UI.coachDone.new_site){UI._coachShown='new_site';return {title:'New: spend Lore',text:'Lore buys your Site of Power cards. A card with a Strength goes to your hand; an HQ card is a permanent power that stays in front of you. Keep the Lore if nothing fits yet.'}}
  return null}
function coachEvent(ev){return '';if(!isGuided())return '';UI.coachDone=UI.coachDone||{};const k='ev_'+ev.t;
  if(ev.t==='bids'&&G.round===1)return 'Both bids are revealed. The higher bid chooses first; a tie goes to whoever is higher on the Order Track.';
  if(ev.t==='clash'&&G.round===1&&!UI.coachDone[k+ev.r]){return ev.idx===0?'The hidden cards are flipped. Each side adds the Strength of its cards and +1 per Supporter (the list under the cards). The higher total wins the region.':''}
  if(ev.t==='summary'&&ev.round===1){const me=humans()[0];const a=ev.inf1[me],b=Math.max(...ev.inf1.filter((_,i)=>i!==me));return 'Scoring: you have '+a+' Influence, the Court has '+b+'. '+(a>b?'You lead!':a===b?'Level.':'Keep going.')+' The leader acts first next round. '+(G.rounds-1)+' rounds to go.'}
  return ''}
// guided: a "New: ..." line counts as read once you act on that screen
(function(){const o=humanMove;humanMove=function(k){if(G)UI.nowMark=G.logN;const sh=UI._coachShown;const r=o(k);if(r&&sh&&UI.coachDone)UI.coachDone[sh]=1;return r}})();
// end screen: where the Influence came from (from the engine's own counters; a client without them shows nothing)
function overBreakdown(){if(!G.infl)return '';const rows=youFirst(G.pl.map(p=>p.seat)).map(s=>{const L=G.infl[s]||{};const parts=Object.keys(L).map(k=>[k,L[k]]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  return '<li style="--fc:'+fcol(s)+'"><b>'+esc(s===vs()?'You':sideName(s))+'</b><span>'+(parts.length?parts.map(x=>gloss(x[0])+' '+(x[1]>0?'+':'−')+Math.abs(x[1])).join(', '):'nothing')+'</span><em>= '+G.pl[s].inf+'</em></li>'}).join('');
  return '<h4 class="bdh">Where the Influence came from</h4><ul class="rank bd2">'+rows+'</ul>'}
// ---------------------------------------------------------------- title + setup
const STORY={
 nobility:{story:'The old court still dresses for dinner in a palace with no king. Its stewards count every coin and every vote, and they mean to crown one of their own before the frost.',enjoy:'Choose the Gilded Court if you enjoy steady income, sturdy cards and winning the Councils.',tag:'Defence and votes · easy to learn'},
 clans:{story:'From the cold coasts the clans ride in with the tide. They move fast, bring many hands, and strike where the valley folk least expect them.',enjoy:'Choose the Heathbound Clans if you enjoy big swings, riders that switch regions and crowds of Supporters.',tag:'Speed and numbers · easy to learn'},
 uprising:{story:'In the dockside alleys, printers and ferrymen pass notes by lantern-light. They cannot win a fair fight, so they never fight fair.',enjoy:'Choose the Lantern Rising if you enjoy bluffs, ambushes and knocking your rivals\' cards out of the game.',tag:'Tricks and ambushes · medium'},
 gathering:{story:'Under the moon the Choir sings to what others threw away. Lost cards return to them, small cards win their fights, and patience is their weapon.',enjoy:'Choose the Pale Choir if you enjoy clever combinations and playing the long game.',tag:'Combos and patience · harder'}};
const sv={mode:'me',np:3,faction:'clans',length:'standard',guide:'full',levels:['normal','normal','normal','normal']};
function titleArtSvg(){return '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+
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
// painted key art (desktop + phone) over the drawn scene, which stays as the fallback while it loads
function titleArt(){return titleArtSvg()+'<picture><source media="(max-aspect-ratio:4/5)" srcset="media/title-phone.webp"><img class="tkey" src="media/title.webp" alt="" draggable="false" onerror="this.remove()"></picture>'}
function hideStart(){$('#start').hidden=true;document.body.classList.remove('in-start')}
function renderStart(){const el=$('#start');if(!el||el.hidden)return;const top=el.scrollTop;
  const view=NET.on?'online':(UI.sv||'title');el.dataset.v=view;
  if(view==='title'){const sav=hasSave();
    el.innerHTML='<div class="ttl"><div class="ttl-art">'+titleArt()+'</div><div class="ttl-in"><h1 class="logo"><small>THE</small>Thornbound Throne</h1><p class="tag">The king is dead. Four factions reach for his crown.</p><p class="tag goal">Win by holding the most Influence when the last round ends.</p><div class="tmid"></div><div class="tbtns">'+
      (firstTime()?tutBtn('tbtn go'):'')+(window.CAMPAIGN&&typeof GXC!=='undefined'?'<button class="tbtn'+(firstTime()?'':' go')+' story" data-a="story"><b>Story</b><span>'+campLine()+'</span></button>':'')+'<button class="tbtn'+(window.CAMPAIGN&&typeof GXC!=='undefined'||firstTime()?'':' go')+'" data-a="play"><b>Play</b><span>against the computer</span></button>'+(firstTime()?'':tutBtn('tbtn'))+
      '<button class="tbtn" data-a="online"><b>Online</b><span>with friends, free, no sign-up</span></button>'+
      (sav?'<button class="tbtn" data-a="cont"><b>Resume</b><span>your game, round '+Math.max(1,sav.G.round)+' of '+sav.G.rounds+'</span></button>':'')+
      '</div><div class="tlinks"><button class="tlink" data-a="rules">How to play</button><button class="tlink" data-a="music">Music</button></div></div><p class="st-c">Original art and words. Fonts: Cinzel and EB Garamond (SIL OFL).</p></div>';return}
  const ONL=view==='online';
  el.innerHTML='<div class="setup"><div class="bgart">'+titleArt()+'</div>'+(ONL?onlineSetupHTML():setupHTML())+'</div>'+(UI.phone&&UI.cfgOpen&&!ONL?cfgDialogHTML():'');
  el.scrollTop=top}
function firstTime(){try{return !localStorage.getItem('tb_played')}catch(e){return true}}
function facCard(f,on){const k=TBKit.FACTIONS[FK[f]],S=STORY[f];return '<button class="fcard'+(on?' on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'" aria-pressed="'+on+'"><span class="ft"><span class="fe">'+TBKit.token('influence',{faction:FK[f]},44).outerHTML+'</span><span><b>'+esc(DD.FNAME[f])+'</b><small>'+esc(S.tag)+'</small></span></span><p>'+esc(S.story)+'</p><p class="enj">'+esc(S.enjoy)+'</p>'+(on?'<span class="fpick">Your faction ✓</span>':'')+'</button>'}
function seatRows(ONL,plan){const n=ONL?plan.np:sv.np;const rest=FIDS.filter(f=>f!==sv.faction);let h='';
  for(let i=0;i<n;i++){const f=i===0?sv.faction:rest[i-1];const k=TBKit.FACTIONS[FK[f]];const human=ONL?i<plan.hum.length:i===0;
    h+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(ONL?'Online: '+esc(plan.hum[i].nm)+(i===0?' (you)':''):'You'):'Computer')+'</small></span>'+(human?'':levelSeg(i))+'</div>'}
  return '<div class="seats">'+h+'</div>'}
function levelSeg(i){return '<div class="seg" role="radiogroup" aria-label="Computer level">'+['easy','normal','hard'].map(l=>'<button class="'+(sv.levels[i]===l?'on':'')+'" data-a="lv" data-i="'+i+'" data-v="'+l+'" aria-pressed="'+(sv.levels[i]===l)+'">'+(l==='easy'?'Easy (for learning)':l[0].toUpperCase()+l.slice(1))+'</button>').join('')+'</div>'}
function optionsHTML(ONL,plan){return '<div class="opts2">'+(ONL?'':'<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div></div>')+
  '<div class="row"><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="row"><span>Tips</span><div class="seg">'+[['full','Full'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+seatRows(ONL,plan)+'</div>'}
function sumLine(){const n=sv.np-1,R=({short:4,standard:5,extended:6}[sv.length]);return 'You lead <b>'+esc(DD.FSHORT[sv.faction])+'</b> against '+n+' computer'+(n>1?'s':'')+' · most Influence after round '+R+' wins'}
function setupHTML(){const ph=UI.phone;const k=TBKit.FACTIONS[FK[sv.faction]];
  const guide='';
  const ft=firstTime();const gbtn=tutBtn('sbtn'+(ft?' big':''));
  const go='<div class="sgo">'+(ft?gbtn:'')+'<button class="sbtn'+(ft?'':' big')+'" data-a="start" data-start="go"><b>Start the game</b><span>'+esc(DD.FSHORT[sv.faction])+' vs '+(sv.np-1)+' computer'+(sv.np>2?'s':'')+' ('+sv.levels.slice(1,sv.np).map(l=>l==='easy'?'Easy':l==='hard'?'Hard':'Normal').filter((x,i,a)=>a.indexOf(x)===i).join('/')+') · '+({short:4,standard:5,extended:6}[sv.length])+' rounds</span></button><div class="sgrid3">'+(ft?'<button class="sbtn" data-a="rules"><b>How to play</b><span>the rules in short</span></button>':gbtn)+
    '<button class="sbtn" data-a="mode" data-v="hot" data-go="1" data-start="hot"><b>Hot-seat</b><span>'+sv.np+' people, one device</span></button>'+
    '<button class="sbtn" data-a="mode" data-v="watch" data-go="1" data-start="watch"><b>Watch</b><span>the computers play</span></button></div></div>';
  const head='<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>'+(ph?'New game':'Choose your faction')+'</h2></div>';
  if(ph)return head+(firstTime()?guide:'')+'<div class="ssum" style="--fc:'+k.main+'"><span class="fe">'+TBKit.token('influence',{faction:FK[sv.faction]},40).outerHTML+'</span><span class="sline">'+sumLine()+'</span><button class="btn" data-a="cfgopen" aria-label="Change faction, players, length and levels">Change</button></div>'+'<div class="opts2 qnp"><div class="row"><span>Computers</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'" aria-label="'+(n-1)+' computer opponent'+(n>2?'s':'')+'">'+(n-1)+'</button>').join('')+'</div></div></div><p class="ssub">'+esc(STORY[sv.faction].enjoy)+'</p>'+go;
  return head+'<p class="ssub">Each faction plays the same rules with its own cards and powers. Pick the story you like.</p>'+(firstTime()?guide:'')+'<div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+go}
function cfgDialogHTML(){return '<div class="cfgdlg" role="dialog" aria-label="Configure the game"><div class="cfghead"><b>Configure</b><button class="btn" data-a="cfgclose">Done</button></div><div class="cfgbody"><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+'</div><div class="cfgfoot"><button class="btn pri big" data-a="cfgclose">Done</button></div></div>'}
function onlineSetupHTML(){const host=NET.on&&isHost(),plan=host?netPlan():null;
  return '<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Play online</h2></div><p class="ssub">Host a room and send friends the code or link. Every browser connects directly, nobody sees another hand, and empty seats go to the computer.</p>'+onlineBlock()+
   (host?'<h2 class="sh2">Your faction</h2><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(true,plan)+'<div class="sgo"><button class="sbtn big" data-a="start" data-start="go"><b>Start online game</b></button>'+(G&&UI.started?'<button class="sbtn" data-a="netback"><b>Back to the game</b></button>':'')+'</div>':'')}
function startFromSetup(){hideStart();try{localStorage.setItem('tb_played','1')}catch(e){}const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv.map((l,i)=>i===0?l:sv.levels[i]),guide:sv.guide};
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
// ===================== part 8: cause and effect (news events), suggestions you can trust, teaching layers, previews =====================
// ---------------------------------------------------------------- teaching layers (guided game only; normal games show the full rules)
// round 1: cards, bids, Herald, hidden cards, Supporters, clashes, claiming. round 2 adds Lore, Sites of Power, Autumn and card abilities.
// round 3 adds Tactics, the Favour, Councils (Govern) and Kingdom Card powers.
const LAYER={1:{},2:{lore:1,site:1,autumn:1,cmd:1},3:{lore:1,site:1,autumn:1,cmd:1,tactic:1,favour:1,council:1,govern:1,kc:1}};
function layer(){if(!isGuided()||!G)return null;return LAYER[Math.min(3,Math.max(1,G.round))]}
function taught(kind){const L=layer();return !L||kind==='supp'||!!L[kind]}
function actKind(a){a=a||'';if(a==='supp')return 'supp';if(a==='journey')return 'lore';if(a==='govern')return 'govern';const p=a.split(':')[0];
  if(p==='t')return 'tactic';if(p==='fav')return 'favour';if(p==='council')return 'council';if(p==='cmd'||p==='card')return 'cmd';return 'kc'}
// options that cannot do anything useful right now are not shown (they stay legal for the engine)
function uselessAct(m){if(!G||!G.clash)return false;const open=[0,1,2].filter(r=>r!==G.clash.r&&!G.reg[r].done).length;
  if(m.a==='t:cln_t2'&&!open)return true;  // Flank for the Round, but no region is left to move to
  return false}
function visibleActs(mv){return mv.filter(m=>m.t!=='act'||(taught(actKind(m.a))&&!uselessAct(m)))}
// the guided Court plays the same layers: no Tactics, Favour or Kingdom Card powers (all optional) before round 3, so nothing appears that was not taught
(function(){const o=aiChoose;aiChoose=function(seat,level){const m=o(seat,level);try{if(isGuided()&&G.pl[seat].ai&&G.q&&G.round<3){const k=G.q.kind,L=legal(seat);
      if(k==='edict'){const n=L.find(x=>x.yes===0);if(n)return n}
      if(G.q.t==='menu'&&m&&m.t==='act'&&!taught(actKind(m.a))){const ok=L.filter(x=>x.t==='act'&&taught(actKind(x.a)));const d=L.find(x=>x.t==='done');return (m.a==='supp'?m:null)||ok.find(x=>x.a==='supp')||d||m}}}catch(e){}return m}})();
// ---------------------------------------------------------------- news: every engine log line becomes a short narrated event (computer moves) or an
// event card (anything that touches you: Influence, eliminations, steals, rivals' Tactics). The sentence is the log sentence, so the log matches.
function wantNews(){return !!ANIM&&!UI.noNews}
function touchesMe(e,me){if(me<0)return false;const m=e.m;if(!m)return e.s===me;if(m.s===me||m.v===me)return true;if(m.ids&&m.ids.some(id=>ownerOf(id)===me))return true;return false}
const BIGK=['inf','steal','elim','kcsteal','rm','inv','tac','fav'];
function newsItem(e,human,me){const t=e.t,m=e.m||{};
  if(/^(Strength in |Clash [IV]+: |The Thornbound Throne begins|Round \d+ of \d+ begins)/.test(t)||/ reveals /.test(t)||/ bids .*\(Strength/.test(t))return null;
  if(m.k==='rm'&&m.why==='Winter'||m.k==='supp')return null;            // listed on the end-of-round card
  if(m.k==='tally')return null;
  const mine=touchesMe(e,me);
  if(human&&e.s===me&&!['inf','steal','elim','kcsteal','inv'].includes(m.k))return null;   // your own plain choices are not narrated back to you
  const big=me>=0&&(mine&&BIGK.includes(m.k)||(m.k==='tac'||m.k==='fav'||m.k==='kcsteal')&&e.s!==me)||m.k==='elim'&&UI.mode==='watch';
  return {t:'news',at:e.i,s:e.s,text:t,k:m.k||'',big:!!big,keep:!big&&(m.k==='inf'||m.k==='steal'||((m.k==='move'||m.k==='elim')&&inMyClash())),mine,m:e.m||null}}
// a rival's move inside a Clash you fight in is never skipped by a tap
function inMyClash(){const me=vs();try{return me>=0&&!!G.clash&&!!(G.clash.cards[me]||[]).length}catch(e){return false}}
function newsSince(l0,seat){const me=vs();const human=seat!=null&&G.pl[seat]&&!G.pl[seat].ai;const out=[];for(const e of G.log){if(e.i<=l0)continue;const it=newsItem(e,human,me);if(it)out.push(it)}return out}
(function(){const o=doMove;doMove=function(mv){const q=G&&G.q?{kind:G.q.kind,t:G.q.t,title:G.q.title}:null;const l0=G?G.logN:0,e0=UI.evq.length,seat=mv&&mv.seat;
  const ok=o(mv);if(!ok||!G)return ok;
  const added=UI.evq.splice(e0);let news=[];
  if(wantNews()){news=newsSince(l0,seat);}
  // eliminations inside a Clash are told on the Clash card itself (with the breakdown), not twice
  const cl=added.filter(e=>e.t==='clash').map(e=>e.r);news=news.filter(n=>!((n.k==='elim'||n.k==='inv')&&n.m&&cl.includes(n.m.r)));
  const all=added.concat(news).sort((a,b)=>(a.at||0)-(b.at||0));UI.evq.push(...all);return ok}})();
// news on an online client: the host sends only state, so the client narrates the new log lines it receives
function netNews(l0){if(!wantNews()||!G)return;const me=vs();for(const e of G.log){if(e.i<=l0)continue;const it=newsItem(e,false,me);if(it&&!(it.s===me&&!it.big))UI.evq.push(it)}}
function infK(it){return it.m&&(it.m.k==='inf'||it.m.k==='steal')}
function showNews(first){const items=[first];if(first.big&&infK(first)){while(UI.evq.length&&items.length<4){const n=UI.evq[0];if(n.t!=='news'||!n.big||!infK(n))break;items.push(UI.evq.shift())}}
  if(!first.big){while(UI.evq.length&&items.length<4){const n=UI.evq[0];if(n.t!=='news'||n.big)break;items.push(UI.evq.shift())}}
  const c={kind:'news',items,big:first.big,id:(UI._nid=(UI._nid||0)+1)};UI.card=c;
  const dur=newsDur(c);
  clearTimeout(UI._nt);UI._nt=setTimeout(()=>{if(UI.card===c&&!(typeof tutHold==='function'&&tutHold(c))){UI.card=null;pump()}},dur)}
// how long a news card stays: short for plain computer moves, longer when it changes Influence or your Clash (a tap always skips)
function newsDur(c){const sp=Math.max(1,Math.min(UI.speed||1,4));if(c.big)return 1800/sp;const k=c.items.some(x=>x.keep);return Math.max(k?1300:600,500+300*c.items.length)/sp}
function newsOk(){const c=UI.card;if(!c||c.kind!=='news')return;clearTimeout(UI._nt);UI.card=null;
  if(!c.big){UI.evq=UI.evq.filter(e=>!(e.t==='news'&&!e.big&&!e.keep))}   // a tap skips the rest of the narration (cards that touch you, Influence changes and moves in your Clash still come)
  pump()}
const NEWSHEAD={inf:'Influence',steal:'Influence stolen',elim:'Eliminated',kcsteal:'Kingdom Card stolen',rm:'A card leaves play',inv:'Saved by Invulnerable',tac:'A Tactic',fav:'The Kingdom\'s Favour'};
function newsHead(it,items){const me=vs();if(items&&items.length>1&&items.every(infK)){const d={};for(const x of items){const m=x.m;if(m.k==='inf')d[m.s]=(d[m.s]||0)+m.n;else{d[m.s]=(d[m.s]||0)+m.n;d[m.v]=(d[m.v]||0)-m.n}}
    return Object.keys(d).filter(s=>d[s]).sort((a,b)=>(b==me)-(a==me)).map(s=>(+s===me?'You':sideName(+s))+' '+(d[s]>0?'+':'\u2212')+Math.abs(d[s])).join(' \u00b7 ')+' Influence'}
  const m=it.m||{};if(m.k==='inf')return (m.n>0?'+':'−')+Math.abs(m.n)+' Influence';if(m.k==='steal')return m.v===me?'−'+m.n+' Influence: stolen':'+'+m.n+' Influence: stolen';return NEWSHEAD[m.k]||'What happened'}
function renderNews(){const el=$('#news');if(el&&!el.hidden){el.hidden=true;el.innerHTML=''}}
// ---------------------------------------------------------------- previews: what the Night step and the tally give if nobody else acts
function preview(V){try{return TB.clashPreview(V||UI.V)}catch(e){return null}}
function sideName(s){return shortName(s).replace(' (you)','')}
function youFirst(parts){const me=vs();return parts.slice().sort((a,b)=>(b===me)-(a===me))}
function scoreLine(P){if(!P)return '';return youFirst(Object.keys(P.tot).map(Number)).map(s=>esc(s===vs()?'You':sideName(s))+' <b>'+P.tot[s]+'</b>').join(' · ')}
function previewHTML(P,title){if(!P)return '';const me=vs();let h='<div class="pv" aria-label="Clash preview">'+(title===''?'':'<p class="pv-t">'+esc(title||('Clash in '+REG[P.r]))+(P.skip?' (no Day or Night steps here)':'')+'</p>');
  h+='<div class="pv-g'+(Object.keys(P.tot).length>2?' stack':'')+'">'+youFirst(Object.keys(P.tot).map(Number)).map(s=>'<div class="pv-s'+(P.win.length===1&&P.win[0]===s?' win':'')+'" style="--fc:'+fcol(s)+'"><b>'+esc(s===me?'You':sideName(s))+'</b><ul>'+(P.brk[s]||[]).map(x=>'<li><span>'+gloss(x.l)+'</span><i>'+(x.n<0?'−'+(-x.n):(x.n>0?'+':'')+x.n)+'</i></li>').join('')+
    P.dead.filter(d=>ownerOf(d.id)===s).map(d=>'<li class="dead"><span>'+esc(TB.cardName(G,d.id))+'</span><small class="dn">dies at Night</small><i>'+TB.cardInfo(G,d.id).strength+'</i></li>').join('')+'</ul><p class="pv-tot">= '+P.tot[s]+'</p></div>').join('')+'</div>';
  for(const d of P.dead)h+='<p class="pv-n warn">'+ico('eye')+'<span>At Night: '+gloss(plain(d.t))+'.</span></p>';
  for(const d of P.saved)h+='<p class="pv-n">'+ico('eye')+'<span>'+gloss(plain(TB.cardName(G,d.id)+' is Invulnerable: it survives the Night'))+'.</span></p>';
  if(P.hidden)h+='<p class="pv-n">'+P.hidden+' face-down card'+(P.hidden>1?'s':'')+' added by Ambush will be revealed before the Night.</p>';
  if(P.watcher)h+='<p class="pv-n">'+gloss('A Rite of the Watcher is in this Clash: the lowest Strength above 0 wins.')+'</p>';
  const w=P.win;h+='<p class="pv-r">'+(w.length>1?'As it stands: a tie.':w[0]===me?'As it stands: <b>you win</b> this Clash.':'As it stands: <b>'+esc(sideName(w[0]))+'</b> wins this Clash.')+(G.q&&G.q.t==='menu'?' Rivals may still act.':'')+'</p>';
  return h+'</div>'}
function outcome(P,me){if(!P)return 0;return P.win.length===1?(P.win[0]===me?2:0):(P.win.includes(me)?1:0)}
// try one Day move on a copy of my own view: the resulting preview (sub-questions are tried option by option, one level deep)
function simDay(m){const me=vs();const tryOne=(V,mv)=>{const r=TB.apply(V,Object.assign({},mv,{seat:me}));if(!r.ok)return null;return V};
  let V=JSON.parse(JSON.stringify(UI.V));if(!tryOne(V,m))return null;
  if(V.q&&V.q.seats.includes(me)&&V.q.t!=='menu'){const subs=(V.q.o[me]||[]);let best=null;
    for(const sm of subs){if(sm.skip||sm.pass)continue;const W=JSON.parse(JSON.stringify(V));if(!tryOne(W,sm))continue;if(W.clash&&W.clash.added&&W.clash.added.length){for(const id of W.clash.added)if(id>=0&&ownerOf(id)===me){(W.clash.cards[me]=W.clash.cards[me]||[]).push(id)}}
      const P=preview(W);if(!P)continue;const sc=outcome(P,me)*100+(P.tot[me]-Math.max(0,...Object.keys(P.tot).filter(s=>+s!==me).map(s=>P.tot[s])));if(!best||sc>best.sc)best={sc,P,sub:sm}}return best}
  const P=preview(V);if(!P)return null;return {sc:outcome(P,me)*100+(P.tot[me]-Math.max(0,...Object.keys(P.tot).filter(s=>+s!==me).map(s=>P.tot[s]))),P}}
// ---------------------------------------------------------------- the advisor: a suggestion always comes with the reason that produced it
function advise(s,mv){if(!G||!G.q||!mv||!mv.length)return null;const q=G.q,k=q.kind;
  const coach=typeof coachRec==='function'?coachRec(s,mv):null;if(coach)return {m:coach,why:whyFor(s,coach)};
  if(q.t==='menu'){const ph=menuPhase(q);return ph==='Day'?adviseDay(s,mv):adviseMenu(s,mv,ph)}
  if(k==='occupier'){const ids=mv.filter(m=>m.id!=null).map(m=>m.id);if(!ids.length)return null;const sc=id=>{const i=cinfo(id);return i.strength*10+i.votes+i.lore};const w=ids.slice().sort((a,b)=>sc(a)-sc(b))[0];const m=mv.find(x=>x.id===w);
    return {m,why:cinfo(w).name+' ('+cinfo(w).strength+') is your weakest card: a card under a Kingdom Card cannot fight. (A stronger one would make the Kingdom Card harder to steal.)'}}
  if(k==='slot'||k==='order'||k==='applause'||k==='discardDown'||k==='discardPick')return null;
  if(k==='clashOrder')return adviseOrder(s,mv);
  const m=suggest(s);if(!m)return null;const why=reasonFor(s,m);return why?{m,why}:null}
function reasonFor(s,m){const q=G.q,k=q.kind;
  if(['bid','herald','place','tie','bidRes','location'].includes(k))return whyFor(s,m);
  if(k==='siteBuy'){if(m.t==='seldone')return 'Keep your Lore: '+(q.chosen&&q.chosen.length?'you have bought enough for now.':'nothing here is worth it yet.');const i=cinfo(m.v);return i.kind==='hq'?i.name+' is an HQ: a permanent power that stays in front of you (it never goes to your hand). '+lcFirst(i.text)+'.':i.name+' goes to your hand: Strength '+i.strength+(i.text?', and '+lcFirst(i.text):'')+'.'}
  if(k==='castle'||k==='wilderness'){if(m.skip)return 'Keep the card: it is worth more in your hand than this bonus.';return whyFor(s,m)}
  if(k==='harvest')return m.yes?'The Favour lets you use '+DD.FAVOUR[G.pl[s].fac].nm+' up to three times, and it breaks a tie at the end.':'';
  if(k==='helm')return m.yes?'Your eliminated card comes back to your hand instead of staying lost.':'';
  if(k==='placeLoc')return 'Whenever anyone claims '+LOCN[m.loc]+', you gain 1 Influence.';
  if(k==='flank'){const r=m.r;return 'The card moves to '+REG[r]+', which has not fought yet; it adds its Strength there.'}
  if(q.t==='sel'&&(k==='rally'||k==='brine')){if(m.t==='seldone')return 'That is enough cards back in your hand.';return cinfo(m.v).name+' ('+cinfo(m.v).strength+') comes back to your hand instead of going to the discard pile in Winter.'}
  if(q.t==='sel'&&(k==='shrine'||k==='ossuary')&&m.t==='seldone')return 'Keep your cards: nothing here needs to go.';
  if(k==='councilOut')return m.to==='hand'?'Back in your hand, the card can fight again next round.':'';
  return ''}   // not sure: no suggestion
function adviseOrder(s,mv){const me=s,V=UI.V;const known=r=>{let t=0;for(const id of V.reg[r].down)if(id>=0&&ownerOf(id)===me)t+=cinfo(id).strength;for(const id of V.reg[r].up)if(ownerOf(id)===me)t+=cinfo(id).strength;return t+V.pl[me].supp.r[r]};
  const rs=[0,1,2].sort((a,b)=>known(b)-known(a));const m=mv.find(x=>x.order&&x.order.join()===rs.join());if(!m)return null;
  return {m,why:'Your strongest region fights first ('+rs.map(r=>REG[r].replace('The ','')+' '+known(r)).join(', then ')+'), so a win there comes before rivals can move cards.'}}
function tacUses(seat,id){const i=DD.TACTICS[G.pl[seat].fac].findIndex(t=>t.id===id);if(i<0)return '';const def=DD.TACTICS[G.pl[seat].fac][i],t=G.pl[seat].tac[i];return def.mk>0?t.mk+' use'+(t.mk===1?'':'s')+' left, once a round':'once per game'}
const CPLAIN={relics:'when you claim your Herald Reward you may cash in your cards here for Influence equal to their votes.',secrets:'in Autumn you place markers on locations; four on one location claim its bonus.',oaths:'in Autumn you bring Supporters back to your board, one per vote (one more if you have the most votes there).'};
function adviseMenu(s,mv,ph){const m=suggest(s);if(!m)return null;if(m.t==='act'&&!taught(actKind(m.a)))return null;const a=m.a||'';
  // the last Autumn: only Influence still counts
  if(ph==='Autumn'&&G.round>=G.rounds&&m.t==='act'&&!/Influence/.test(m.label||'')&&!(a==='journey'&&!G.pl[s].site.length)){const d=mv.find(x=>x.t==='done');const inf=mv.find(x=>x.t==='act'&&/Influence/.test(x.label||'')&&taught(actKind(x.a)));
    if(inf)return {m:inf,why:'This is the last round: only Influence counts now. '+actWhy(s,inf)};return d?{m:d,why:'This is the last round: only Influence counts now, and nothing here gives Influence.'}:null}
  if(m.t==='done')return {m,why:ph==='Spring'?'Nothing here is worth spending this round.':'Nothing here gains you more than it costs.'};
  if(a==='supp'){const r=m.p.r,n=m.p.n;const mine=UI.V.reg[r].down.filter(id=>id>=0&&ownerOf(id)===s).map(id=>cinfo(id).strength);
    return {m,why:'Send '+n+' Supporter'+(n>1?'s':'')+' to '+REG[r]+': +'+n+' Strength in its first Clash'+(mine.length?' (your hidden card there has Strength '+mine.join('+')+')':'')+'. Supporters on the map go to the Lost Pile in Winter.'}}
  return {m,why:actWhy(s,m)}}
function actWhy(s,m){const a=m.a||'',L=(m.label||'').replace(/^[^:]*:\s*/,'');
  if(a.startsWith('t:'))return 'A Tactic ('+tacUses(s,a.slice(2))+'): '+lcFirst(L)+'.';
  if(a.startsWith('fav:'))return 'Your Favour ('+(G.fav.h===s?G.fav.u+' uses left':'')+'): '+lcFirst(L)+'.';
  if(a==='journey'){const id=m.p.id,l=cinfo(id).lore,P=G.pl[s];const mn=P.site.length?Math.min(...P.site.map(x=>cinfo(x).cost)):0;return '+'+l+' Lore (you would have '+(P.lore+l)+')'+(P.site.length?'; your cheapest Site of Power card costs '+mn+'.':'.')}
  if(a==='govern'){const c=m.p.c;return cinfo(m.p.id).votes+' vote'+(cinfo(m.p.id).votes>1?'s':'')+' into the '+DD.COUNCIL_NAMES[c]+': '+CPLAIN[c]}
  if(a==='cmd:rally')return 'Rally: the card goes back to your hand instead of the discard pile in Winter.';
  if(a==='cmd:deploy')return 'Deploy: the card stays on the map through Winter and fights there next round.';
  if(a==='council:oaths')return 'Council of Pledges: Supporters come back to your board for next round.';
  return lcFirst(L)?L.replace(/^./,c=>c.toUpperCase()).replace(/\.?$/,'.'):''}
function adviseDay(s,mv){const me=s;const P0=preview();if(!P0)return null;const o0=outcome(P0,me);const done=mv.find(m=>m.t==='done');
  const vsTxt=P=>youFirst(Object.keys(P.tot).map(Number)).map(x=>(x===me?'you ':sideName(x)+' ')+P.tot[x]).join(' vs ');
  if(o0===2)return done?{m:done,why:'You win this Clash as it stands ('+vsTxt(P0)+'), so keep your powers for later.'}:null;
  const acts=visibleActs(mv).filter(m=>m.t==='act');let best=null;
  for(const m of acts){if(/^fav:/.test(m.a)&&G.pl[me].fac==='clans')continue;const r=simDay(m);if(!r)continue;const o=outcome(r.P,me);if(o<=o0)continue;
    const cost=/discard|Discard/.test(m.label)?1:0;const sc=o*100-cost*5+(r.P.tot[me]||0)/100;if(!best||sc>best.sc)best={sc,m,P:r.P,sub:r.sub}}
  if(best){const name=(best.m.label||'').replace(/:.*$/,'');return {m:best.m,why:name+' changes this Clash: '+vsTxt(P0)+' now, '+vsTxt(best.P)+' after it'+(outcome(best.P,me)===2?' (you would win)':' (a tie)')+(best.sub&&best.sub.label?' ('+best.sub.label.replace(/^Move to /,'move to ')+')':'')+'.',P:best.P}}
  const dead=P0.dead.filter(d=>ownerOf(d.id)===me);
  const ret=acts.find(m=>m.a==='cmd:retreat');if(ret&&dead.length)return {m:ret,why:'You lose this Clash as it stands ('+vsTxt(P0)+') and '+TB.cardName(G,dead[0].id)+' would be eliminated: Retreat takes cards back to your hand.'};
  const fl=acts.find(m=>m.a==='cmd:flank'||m.a==='t:cln_t2');if(fl&&o0===0&&[0,1,2].some(r=>r!==G.clash.r&&!G.reg[r].done))return {m:fl,why:'You cannot win here ('+vsTxt(P0)+'): Flank moves the card to a region that has not fought yet, where it still counts.'};
  return done?{m:done,why:'Nothing you can do here changes the result ('+vsTxt(P0)+').',P:P0}:null}
// ---------------------------------------------------------------- confirm sheet: anything that resolves at once and can hurt shows "your N vs their M" first
function stealPreview(s,m){const P=G.pl[s],V=G.pl[m.s2],T=V.ks[m.j];if(!T)return '';const bid=G.bstr[s],crew=G.pl[s].ks.some(x=>x&&x.kc===9)?3:0;const theirs=cinfo(T.occ).strength+(V.ks.some(x=>x&&x.kc===5)?5:0);
  const zero=P.bid!=null&&cinfo(P.bid).text&&/treat the Occupying card's Strength as 0/.test(cinfo(P.bid).text);
  return 'Your bid '+bid+(crew?' + 3 (Cutthroat Crew) = '+(bid+crew):'')+' vs their '+esc(cinfo(T.occ).name)+' '+(zero?'0 (your card ignores it)':theirs)+': you take '+esc(TB.kingdomInfo(T.kc).name)+'. Their '+esc(cinfo(T.occ).name)+' goes back to their hand, and your bid card is tucked under it.'}
function confirmHTML(k){const s=viewSeatForQ();if(s==null)return '';const m=legal(s).find(x=>x.k===k);if(!m)return '';let body='';
  if(m.t==='steal')body='<p class="cf-p">'+stealPreview(s,m)+'</p>';
  else if(m.a==='t:cln_t3'){const T=G.pl[m.p.s2].ks[m.p.j];body='<p class="cf-p">'+gloss('Riverbank Raiders (a Tactic, once per game): take '+TB.kingdomInfo(T.kc).name+' from '+sideName(m.p.s2)+' with no Strength check. Their '+cinfo(T.occ).name+' goes back to their hand; you tuck a card from your hand under it.')+'</p>'}
  else body='<p class="cf-p">'+esc(m.label)+'</p>';
  return popShell('Before you do it','<div class="cf">'+body+'<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(k)+'">'+esc(m.t==='steal'?'Steal it':'Do it')+'</button><button class="btn" data-a="pclose">Not now</button></div></div>','cf-b')}
// ---------------------------------------------------------------- story mode (gx-campaign.js, data: campaign.json)
// A chapter is a normal game with its own table, computer level and at most one twist. Twists exist only here; seat 1 is always the boss.
function campOpts(def){const s=def.setup||{};const np=Math.max(2,Math.min(4,s.np||2));const lv=['normal'];for(let i=1;i<np;i++)lv.push(def.opponent.aiLevel||'normal');
  const o={np,length:s.length||'short',faction:s.faction||'clans',levels:lv,seed:s.seed==null?undefined:s.seed,guide:def.hints?'full':'off',camp:def};
  if(s.seatFactions)o.seatFactions=s.seatFactions.slice(0,np);
  const t=def.twist;if(t&&t.id==='boss-first'){const rest=[];for(let i=2;i<np;i++)rest.push(i);for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]]}o.order=[1].concat(rest,[0])}
  return o}
// twists that change the opening state: called right after TB.newGame
function campApply(def){const t=def.twist;if(!t||!G)return;const nm=G.pl[1]?G.pl[1].name:'The boss';
  if(t.id==='boss-lore'){G.pl[1].lore=t.param==null?2:t.param;lg('Boss rule: '+nm+' starts with '+G.pl[1].lore+' Lore.',1,'big')}
  else if(t.id==='boss-favour'){G.fav={h:1,u:3};lg('Boss rule: '+nm+' starts holding the Kingdom\'s Favour.',1,'big')}
  else if(t.id==='boss-first'){lg('Boss rule: '+nm+' acts first this season.',1,'big')}
  else if(t.id==='sharp-mind'){lg('Boss rule: '+nm+' thinks twice as long before each move.',1,'big')}}
function campMetrics(g){const me=g.pl[0];const rivals=g.pl.slice(1).map(p=>p.inf);const won=!!(g.over&&g.over.winner===0);
  const cnt=re=>g.log.filter(e=>e.s===0&&re.test(e.t)).length;
  let gov=0;try{['relics','secrets','oaths'].forEach(k=>g.council[k].forEach(id=>{if(((id/100)|0)===0)gov++}))}catch(e){}
  return {won,score:me.inf,margin:me.inf-Math.max.apply(null,rivals),rounds:g.round,clashWins:cnt(/wins the Clash/),heraldHits:(g.infl&&g.infl[0]&&g.infl[0]['Herald Reward'])||0,
    kingdomCards:(me.ks||[]).filter(x=>x).length,steals:cnt(/ steals .* from | takes .* from /),siteBought:5-(me.site?me.site.length:5),governs:gov,
    favourUses:g.log.filter(e=>e.m&&e.m.k==='fav'&&e.m.s===0).length,favourHeld:g.fav.h===0,eliminated:g.log.filter(e=>e.m&&e.m.k==='elim'&&e.s===0).length,handSize:me.hs}}
function campIsWon(g,def){return !!(g.over&&g.over.winner===0)}
function campOver(){if(!UI.camp||UI.campDone||typeof GXC==='undefined'||!GXC.active())return;UI.campDone=true;const g=G;
  setTimeout(()=>{if(G===g&&GXC.active()){try{clearSave()}catch(e){}GXC.finish(g)}},window.CAMP_WAIT!=null?window.CAMP_WAIT:2200)}
function campLine(){try{const p=GXC.progress(),ch=window.CAMPAIGN.chapters,n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;return n?n+' of '+ch.length+' chapters done':'chapters, bosses, three acts'}catch(e){return 'chapters, bosses, three acts'}}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'thornbound',artBase:'media/',headButtons:()=>{const b=document.createElement('button');b.type='button';b.className='gxc-ib';b.textContent='Tutorial';b.setAttribute('aria-label','Replay the tutorial');b.addEventListener('click',()=>{GXC.close();tutStart()});return [b]},data:window.CAMPAIGN,startChapter:def=>{hideStart();newGame('me',campOpts(def))},isWon:campIsWon,metrics:campMetrics,
    onExit(){showStart()},scores:g=>g.pl.map(p=>p.inf),seats:g=>g.pl.map((p,i)=>({name:p.name,me:i===0,ai:i?p.ai:undefined}))})}
campInit();
// ===================== part 10: board-first play =====================
// The map is the screen. Pieces sit on it, legal spots glow, you tap or drag the piece itself, and the computer's moves play out on the board.
// Text: one status line (8 words or fewer) in the top bar. Everything else is shown, not written.
// ---------------------------------------------------------------- the decision, as the board sees it
function bfModel(s,mv,rm){const q=G.q,k=q.kind;const M={s,q,mv,rec:rm,kind:'other',use:new Set(),locs:[],regs:[],powers:[]};
  for(const m of mv){if(m.id!=null&&m.id>=0)M.use.add(m.id);if(typeof m.v==='number'&&m.v>=0&&m.v<10000)M.use.add(m.v)}
  if(q.t==='menu'){M.kind='menu';M.use=new Set();M.regs=[...new Set(mv.filter(m=>m.t==='act'&&m.a==='supp'&&m.p&&m.p.n===1).map(m=>m.p.r))];M.powers=visibleActs(mv).filter(m=>m.t==='act'&&m.a!=='supp')}
  else if(k==='bid'||k==='bidRes'||k==='place'||k==='tie'||k==='clashOrder')M.kind=k;
  else if(k==='herald'||k==='location'){M.kind=k;M.locs=mv.filter(m=>m.loc!=null).map(m=>m.loc)}
  if(M.kind!=='bid'&&M.kind!=='place'&&M.kind!=='tie'&&M.kind!=='other')M.use=new Set();
  M.regsFor=id=>{const o=[];for(const m of mv){if(m.id!==id)continue;if(k==='place'&&m.r!=null)o.push(m.r);else if(k==='tie'&&G.clash)o.push(G.clash.r)}return [...new Set(o)]};
  M.nextRegs=()=>{const o=UI.ord||[];const set=new Set();for(const m of mv)if(m.order&&o.every((r,i)=>m.order[i]===r)&&m.order.length>o.length)set.add(m.order[o.length]);return [...set]};
  return M}
function cardMoves(id){const M=UI.bf;if(!M||!M.mv)return [];const out=[];
  for(const m of M.mv){if(m.id!==id&&!(typeof m.v==='number'&&m.v===id))continue;
    if(M.kind==='bid')out.push({type:'spot',k:m.k});
    else if(M.kind==='place')out.push({type:'region',r:m.r,k:m.k});
    else if(M.kind==='tie')out.push({type:'region',r:G.clash?G.clash.r:null,k:m.k});
    else if(M.kind==='other')out.push({type:'direct',k:m.k})}
  return out}
const cardDriven=M=>!!M&&(M.kind==='bid'||M.kind==='place'||M.kind==='tie');
// tap a card: it lifts and its targets glow; tap it again (or the glowing spot) to play it
function handTap(id){const M=UI.bf;const cm=M&&M.kind?cardMoves(id):[];
  if(!cm.length){UI.hand=null;openPop('card',{id});return}
  if(cardDriven(M)){
    if(UI.hand===id){if(cm.length===1){commitCard(id,cm[0]);return}UI.hand=null;renderAll();return}
    UI.hand=id;if(typeof sfx==='function')sfx('tap');renderAll();return}
  if(cm.length===1){humanMove(cm[0].k);return}
  openPop('card',{id})}
function commitCard(id,c){UI.hand=null;
  try{const el=$('#handw .hc[data-id="'+id+'"]');let dest=null;if(c.type==='spot'){const sp=$('#spots .bspot');dest=sp&&sp.getBoundingClientRect()}else if(c.type==='region'&&c.r!=null&&MAP.m){const R=regionRect(c.r);dest={left:R.left+R.width/2-14,top:R.top+R.height/2-20,width:28,height:40}}
    if(el&&dest)flyEl(el.innerHTML,el.getBoundingClientRect(),dest,{ms:380})}catch(e){}
  humanMove(c.k)}
// ---------------------------------------------------------------- taps on the map
function regionTap(r){const M=UI.bf;if(!M||!M.kind||(UI.card&&UI.card.kind!=='tip'))return false;
  if(M.kind==='place'||M.kind==='tie'){if(UI.hand!=null){const c=cardMoves(UI.hand).find(x=>x.type==='region'&&x.r===r);if(c){commitCard(UI.hand,c);return true}}return false}
  if(M.kind==='menu'){const m=M.mv.find(x=>x.t==='act'&&x.a==='supp'&&x.p&&x.p.r===r&&x.p.n===1);if(m){bfPopAt(regionRect(r),'+1',fcol(M.s));humanMove(m.k);return true}return false}
  if(M.kind==='clashOrder'){orderTap(r);return true}
  return false}
function locTap(l){const M=UI.bf;if(!M||!M.kind||(UI.card&&UI.card.kind!=='tip'))return false;
  if(M.kind==='herald'||M.kind==='location'){const m=M.mv.find(x=>x.loc===l);if(m){humanMove(m.k);return true}return false}
  return regionTap(l>>1)}
function orderTap(r){const M=UI.bf;if(!M||M.kind!=='clashOrder'||!M.nextRegs().includes(r))return;UI.ord=(UI.ord||[]).concat(r);
  const o=UI.ord;const cand=M.mv.filter(m=>m.order&&o.every((x,i)=>m.order[i]===x));
  if(cand.length===1){humanMove(cand[0].k);return}
  renderAll()}
// ---------------------------------------------------------------- the bid spot (on the table, bottom of the map)
function renderSpots(){const el=$('#spots');if(!el)return;if(!G||!UI.V){el.innerHTML='';return}
  const me=vs(),M=UI.bf,P=me>=0?UI.V.pl[me]:null;const has=P&&P.bid!=null&&P.bid>=0;const asking=!!M&&M.kind==='bid';
  const showBack=has&&!G.bidRev;
  if(!P||isPassing()||(!has&&!asking)){if(el._h!==''){el._h='';el.innerHTML=''}return}
  const S=UI.bs||360;const w=Math.round(Math.max(40,Math.min(60,S*.13))),h=Math.round(w*1.4308);
  const glow=asking&&UI.hand!=null,rec=asking&&M.rec&&M.rec.id!=null;const retk=M&&M.kind==='bidRes'&&M.mv.some(m=>m.t==='return');
  const h2='<button class="bspot'+(glow?' glow hot':'')+(glow&&rec?' rec':'')+(has?' full':'')+(retk?' glow':'')+'" id="bidspot" data-a="spot" style="width:'+w+'px;height:'+h+'px" aria-label="'+(has?'Your bid':'Bid spot')+'">'+(has?'<span class="bs-c" data-owner="'+me+'" data-up="1">'+cardEl(P.bid,w).outerHTML+'</span>':'<span class="bs-l">'+ico('crown')+'</span>')+'</button>';
  if(el._h!==h2){el._h=h2;el.innerHTML=h2}}
function spotTap(){const M=UI.bf;if(!M)return;
  if(M.kind==='bid'&&UI.hand!=null){const c=cardMoves(UI.hand).find(x=>x.type==='spot');if(c){commitCard(UI.hand,c)}return}
  if(M.kind==='bidRes'){const m=M.mv.find(x=>x.t==='return');if(m)humanMove(m.k)}}
// ---------------------------------------------------------------- effects: flights, score pops
function flyEl(html,from,to,o){o=o||{};const fx=$('#fx');if(!fx||!ANIM||!from||!to||UI.reduce)return;const ms=(o.ms||420)/Math.max(1,Math.min(UI.speed||1,4));
  const e=document.createElement('div');e.className='fly '+(o.cls||'');e.innerHTML=html||'';fx.appendChild(e);
  const w=from.width||40,h=from.height||56;e.style.cssText='left:'+from.left+'px;top:'+from.top+'px;width:'+w+'px;height:'+h+'px';
  const dx=to.left+(to.width||0)/2-(from.left+w/2),dy=to.top+(to.height||0)/2-(from.top+h/2),sc=Math.max(.3,(to.width||w)/w);
  const done=()=>{if(e.parentNode)e.remove()};
  try{const a=e.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale('+sc+')',opacity:o.fade?0.2:1}],{duration:ms,easing:'cubic-bezier(.2,.7,.2,1)'});a.onfinish=done}catch(x){}
  setTimeout(done,ms+250)}
const BACK_HTML='<span class="bidc back big"></span>';
function seatEl(s){return document.querySelector('#rivals .rv[data-s="'+s+'"]')}
// a score pop: appears where it was earned, then flies to the seat's score chip
function bfPopAt(rect,txt,col,seat,cb){const fx=$('#fx');if(!fx||!ANIM||!rect)return;
  const e=document.createElement('div');e.className='pop';e.textContent=txt;e.style.cssText='left:'+(rect.left+rect.width/2)+'px;top:'+(rect.top+rect.height/2)+'px;--fc:'+(col||'#e8c867');fx.appendChild(e);
  const sp=Math.max(1,Math.min(UI.speed||1,4));const done=()=>{if(e.parentNode)e.remove()};
  const chip=seat!=null?document.querySelector('#rivals .rv[data-s="'+seat+'"] .rv-n'):null;
  try{const a=e.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(-50%,-90%) scale(1.25)',opacity:1,offset:.35},{transform:'translate(-50%,-90%) scale(1.15)',opacity:1,offset:.6},
      chip?{transform:'translate('+(chip.getBoundingClientRect().left+chip.getBoundingClientRect().width/2-(rect.left+rect.width/2)-0)+'px,'+(chip.getBoundingClientRect().top+8-(rect.top+rect.height/2))+'px) scale(.5)',opacity:.15}:{transform:'translate(-50%,-150%) scale(.8)',opacity:0}],{duration:1150/sp,easing:'ease-in-out'});
    a.onfinish=()=>{done();if(chip){chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump')}}}catch(x){}
  setTimeout(done,1400/sp)}
function locRect(l){try{const p=MAP.m.locPos(LOCID[l]);const c=mapToClient(p.x,p.y);return {left:c.x-10,top:c.y-10,width:20,height:20}}catch(e){return null}}
function regionRect(r){const b=REGBOX[r];const a=mapToClient(b.x,b.y),c=mapToClient(b.x+b.w,b.y+b.h);return {left:a.x,top:a.y,width:c.x-a.x,height:c.y-a.y}}
function mapToClient(x,y){const el=MAP.m.el,M=el.getScreenCTM&&el.getScreenCTM();if(!M)return {x:0,y:0};return {x:M.a*x+M.e,y:M.d*y+M.f}}
function mapPt(cx,cy){try{const M=MAP.m.el.getScreenCTM();return M?{x:(cx-M.e)/M.a,y:(cy-M.f)/M.d}:null}catch(e){return null}}
function locFromText(t){for(let l=0;l<6;l++)if(t.indexOf(LOCN[l])>=0)return l;return -1}
function bfNews(c){if(!ANIM)return;
  for(const it of c.items){const m=it.m;if(!m||(m.k!=='inf'&&m.k!=='steal'))continue;
    const doPop=(seat,n)=>{if(!n)return;let rect=null;const l=locFromText(it.text||'');if(l>=0)rect=locRect(l);else if(G.clash&&G.clash.r!=null)try{const R=regionRect(G.clash.r);rect={left:R.left+R.width/2,top:R.top+R.height/2,width:0,height:0}}catch(e){}
      if(!rect){const ch=seatEl(seat);if(ch)rect=ch.getBoundingClientRect()}
      bfPopAt(rect,(n>0?'+':'−')+Math.abs(n),fcol(seat),seat)};
    if(m.k==='inf')doPop(m.s,m.n);else{doPop(m.s,m.n);doPop(m.v,-m.n)}}
  if(typeof sfx==='function'&&c.items.some(infK))sfx('inf')}
// a computer's card lands on the map: it flies there from its seat
function bfSlot(r,s,old,nw){if(!ANIM||UI.noAnim||!nw||!nw.faceDown||(old&&old.count>=nw.count)||s===vs())return;
  const from=seatEl(s),slot=MAP.m.slotEl(LOCID[2*r],s);if(!from||!slot)return;const f=from.getBoundingClientRect(),t=slot.getBoundingClientRect();
  flyEl(BACK_HTML,{left:f.left+f.width/2-14,top:f.top+f.height/2-20,width:28,height:40},t,{ms:520})}
// ---------------------------------------------------------------- events played on the board (bids, clashes, round end): no panels, a tap skips
function evDone(){const c=UI.card;if(!c||c.kind!=='event')return;clearTimeout(UI._evT);UI.card=null;UI._cardKey=null;UI.noAnim=false;UI._cp=null;UI._clashLine='';UI.mapReset=false;MAP.slotDirty=true;pump()}
function bfSkip(){const c=UI.card;if(!c)return false;if(c.kind==='event'){evDone();return true}if(c.kind==='news'){newsOk();return true}return false}
const spd=()=>Math.max(1,Math.min(UI.speed||1,4));
function bfAuto(c,ms){clearTimeout(UI._evT);UI._evT=setTimeout(()=>{if(UI.card===c&&!(typeof tutHold==='function'&&tutHold(c)))evDone()},ANIM?ms/spd():0)}
function bfEvent(c){const ev=c.ev;if(ev.t==='bids')bfBids(c);else if(ev.t==='clash')bfClash(c);else if(ev.t==='summary')bfSummary(c);else bfAuto(c,300)}
function bfBids(c){const ev=c.ev;c.rank=ev.bids.slice().sort((a,b)=>a.str-b.str||ev.order.indexOf(b.seat)-ev.order.indexOf(a.seat)).map(b=>b.seat);c.revN=0;
  const step=()=>{if(UI.card!==c)return;if(c.revN<c.rank.length){c.revN++;if(typeof sfx==='function')sfx('flip');renderRivals();setTimeout(step,ANIM?420/spd():0)}else bfAuto(c,1100)};
  renderBar();renderRivals();setTimeout(step,ANIM?350/spd():0)}
function clashLine(ev){const me=vs(),w=ev.winner,reg=REG[ev.r];if(w<0)return 'Tie in '+reg;
  const best=Math.max(0,...ev.parts.filter(x=>x!==w).map(x=>ev.tot[x]));return (w===me?'You win ':sideName(w)+' wins ')+reg+', '+ev.tot[w]+' to '+best}
function elimLine(ev){const d=ev.dead||{};const me=vs();const o=Object.keys(d).map(Number).filter(s=>d[s]&&d[s].length);if(!o.length)return '';const s=o.sort((a,b)=>(b===me)-(a===me))[0];const n=d[s].length;
  return (s===me?'You lose ':sideName(s)+' loses ')+n+' card'+(n>1?'s':'')}
function bfClash(c){const ev=c.ev;UI.noAnim=true;UI.clashBrk=UI.clashBrk||{};UI.clashBrk[ev.r]={tot:ev.tot,brk:ev.brk,parts:ev.parts};
  const fin=()=>{if(UI.card!==c)return;UI.clashRes[ev.r]={winner:ev.winner,tot:ev.tot};try{drawOverlay()}catch(e){}UI._clashLine=clashLine(ev);renderBar();if(typeof sfx==='function')sfx(ev.winner<0?'tie':'win');
    const el=elimLine(ev);const hold=el?1500:1100;
    if(el)setTimeout(()=>{if(UI.card===c){UI._clashLine=el;renderBar()}},900/spd());
    bfAuto(c,hold+300)};
  UI._clashLine='The Clash in '+REG[ev.r];renderBar();
  if(!ANIM){fin();return}
  const p=mapReveal(ev);Promise.resolve(p).then(()=>{if(UI.card===c)setTimeout(fin,150/spd())})}
function bfSummary(c){const ev=c.ev;renderBar();
  if(ANIM)ev.inf1.forEach((v,s)=>{const d=v-ev.inf0[s];if(d){const ch=seatEl(s);if(ch)bfPopAt(ch.getBoundingClientRect(),(d>0?'+':'−')+Math.abs(d),fcol(s),s)}});
  bfAuto(c,1400)}
// a tap on the board or the status line skips the narration
document.addEventListener('pointerdown',e=>{if(!UI.card||!G)return;if(UI.card.kind!=='event'&&UI.card.kind!=='news')return;
  if(e.target.closest&&e.target.closest('#board,.gx-bar #barstat,#rivals')){if(bfSkip())UI._nc=1}},true);
// ---------------------------------------------------------------- long-press: a small tooltip near the thing (8 words or fewer)
const LOC_SHORT=['Govern','Journey','Favour','','Deck bottom','Recover cards'];
function tipFor(kind,arg){const V=UI.V;if(!V)return '';
  if(kind==='loc'){const l=arg;const hd=G.pl.filter(p=>p.herald===l).map(p=>'<i class="td" style="background:'+fcol(p.seat)+'"></i>').join('');return '<b>'+esc(LOCN[l])+'</b> <em>+'+DD.LOCS[l][2]+'</em> '+esc(LOC_SHORT[l])+(hd?' '+hd:'')}
  if(kind==='region'){const r=arg;const bk=UI.clashBrk&&UI.clashBrk[r];
    if(bk&&UI.clashRes[r])return '<b>'+esc(REG[r].replace('The ',''))+'</b> '+youFirst(bk.parts).map(s=>esc(s===vs()?'You':sideName(s))+' <b>'+bk.tot[s]+'</b>'+(bk.brk&&bk.brk[s]&&bk.brk[s].length?' = '+bk.brk[s].map(x=>x.n).join('+').replace(/\+-/g,'−'):'')).join(' · ');
    const R=V.reg[r];const parts=youFirst(V.pl.map(p=>p.seat)).map(s=>{let known=0,unk=0;for(const id of R.up)if(ownerOf(id)===s)known+=cinfo(id).strength;for(const id of R.down)if(ownerOf(id)===s){if(id>=0)known+=cinfo(id).strength;else unk++}
      const sp=V.pl[s].supp.r[r];const t=known+sp;return (s===vs()?'You':esc(sideName(s)))+' <b>'+(unk?'?'+(t?'+'+t:''):t)+'</b>'});
    return '<b>'+esc(REG[r].replace('The ',''))+'</b> '+parts.join(' · ')}
  return ''}
function showTip(html,rect){const t=$('#tip');if(!t||!html)return;t.innerHTML=html;t.hidden=false;t.style.left='0px';t.style.top='0px';
  const tw=t.offsetWidth,th=t.offsetHeight;let x=rect.left+rect.width/2-tw/2,y=rect.top-th-8;if(y<(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barh'))||44)+4)y=rect.top+rect.height+8;
  x=Math.max(6,Math.min(innerWidth-tw-6,x));t.style.left=Math.round(x)+'px';t.style.top=Math.round(y)+'px';clearTimeout(UI._tipT);UI._tipT=setTimeout(hideTip,3600)}
function hideTip(){const t=$('#tip');if(t&&!t.hidden){t.hidden=true;t.innerHTML=''}}
// map: hold a location or a region
(function(){let d=null;
  document.addEventListener('pointerdown',e=>{hideTip();const mb=e.target.closest&&e.target.closest('#mapbox');if(!mb||!G||!UI.started||UI.card)return;if(e.target.closest('#spots'))return;
    d={x:e.clientX,y:e.clientY,pid:e.pointerId,t:setTimeout(()=>{if(!d)return;const p=mapPt(d.x,d.y);if(!p)return;let kind=null,arg=null,rect=null;
      for(let l=0;l<6;l++)if(Math.hypot(p.x-LOCPOS[l][0],p.y-LOCPOS[l][1])<70){kind='loc';arg=l;rect=locRect(l);break}
      if(!kind)for(let r=0;r<3;r++){const b=REGBOX[r];if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){kind='region';arg=r;const R=regionRect(r);rect={left:R.left+R.width/2-10,top:R.top+30,width:20,height:20};break}}
      if(kind){UI._nc=1;showTip(tipFor(kind,arg),rect)}d=null},480)}},true);
  const end=()=>{if(d){clearTimeout(d.t);d=null}};
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
  document.addEventListener('pointermove',e=>{if(d&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)end()},true)})();
// hand: hold a card to read it, drag a usable card onto the glowing spot
(function(){let d=null;
  const dropAt=(x,y)=>{const sp=$('#spots .bspot');if(sp){const r=sp.getBoundingClientRect();if(x>=r.left-18&&x<=r.right+18&&y>=r.top-18&&y<=r.bottom+18)return {type:'spot'}}
    const p=mapPt(x,y);if(p)for(let r=0;r<3;r++){const b=REGBOX[r];if(p.x>=b.x-20&&p.x<=b.x+b.w+20&&p.y>=b.y-20&&p.y<=b.y+b.h+20)return {type:'region',r}}return null};
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#handw .hc');if(!b||(e.button&&e.button>0))return;
    const id=+b.dataset.id;d={id,b,x:e.clientX,y:e.clientY,drag:false,pid:e.pointerId,g:null};
    d.lp=setTimeout(()=>{if(d&&!d.drag){const i=d.id;d=null;UI._nc=1;UI.hand=null;openPop('card',{id:i,read:1})}},520)},true);
  document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.pid)return;
    if(!d.drag){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;clearTimeout(d.lp);
      if(!cardDriven(UI.bf)||!cardMoves(d.id).length){d=null;return}
      d.drag=true;UI.dragging=true;UI.hand=d.id;const g=document.createElement('div');g.className='dragc';const w=cssPx('--cw',50)*1.2;g.innerHTML=cardEl(d.id,w).outerHTML;document.body.appendChild(g);d.g=g;d.b.classList.add('lifted');UI.dragging=false;renderMain();renderSpots();UI.dragging=true}
    if(d.g){d.g.style.transform='translate('+(e.clientX-30)+'px,'+(e.clientY-70)+'px)';const t=dropAt(e.clientX,e.clientY);document.body.classList.toggle('over-t',!!t)}
    e.preventDefault()},true);
  const fin=(e,ok)=>{if(!d)return;clearTimeout(d.lp);const x=d;d=null;if(!x.drag)return;UI.dragging=false;document.body.classList.remove('over-t');if(x.g)x.g.remove();x.b.classList.remove('lifted');UI._ncT=Date.now()+70;
    if(ok){const t=dropAt(e.clientX,e.clientY);const c=t&&cardMoves(x.id).find(m=>m.type===t.type&&(t.type==='spot'||m.r===t.r));if(c){commitCard(x.id,c);return}}
    renderAll()};
  document.addEventListener('pointerup',e=>fin(e,true),true);document.addEventListener('pointercancel',e=>fin(e,false),true)})();
// ---------------------------------------------------------------- the ghost finger: shows the first move of each kind (and every move while hints are on in the guided game and in Story)
// a tap that ended a hold, a drag or a skip must not also act
document.addEventListener('pointerup',()=>{if(UI._nc){UI._nc=0;UI._ncT=Date.now()+70}},true);
document.addEventListener('click',e=>{if(UI._ncT&&Date.now()<UI._ncT){UI._ncT=0;e.stopPropagation();e.preventDefault()}},true);
const learnKey=()=>G&&G.q?(G.q.t==='menu'?'menu':G.q.kind):'';
function lsGetJ(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}}
function fingerWanted(kind){if(isGuided()||UI.camp)return true;return !(lsGetJ('tb_fl')[kind]>=1)}
(function(){const o=humanMove;humanMove=function(k){const kind=learnKey();const r=o(k);if(r&&kind){try{const L=lsGetJ('tb_fl');L[kind]=(L[kind]||0)+1;localStorage.setItem('tb_fl',JSON.stringify(L))}catch(e){}}return r}})();
function ctr(r){return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null}
// planFor(M,rm): where the move rm is made on the board: {from,to} points (from = the card to pick up first), fromR/toR rects, key. Used by the ghost finger and by the lightbulb.
function planFor(M,rm,o){o=o||{};if(!M||!M.kind||!rm)return null;
  let from=null,to=null,fromR=null,toR=null;const el=sel=>{const e=document.querySelector(sel);return e?e.getBoundingClientRect():null};const K=rm.k;
  const T=r=>{toR=r;return ctr(r)},F=r=>{fromR=r;return ctr(r)};
  try{
    if(UI.pop){if(UI.pop==='confirm')to=T(el('#ppop [data-a=mv]'));else return null}
    else switch(M.kind){
    case 'bid':{to=T(el('#spots .bspot'));if(UI.hand==null||o.full)from=F(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'place':case 'tie':{if(rm.pass){to=T(el('#act [data-k="'+K+'"]'));break}const r=rm.r!=null?rm.r:(G.clash?G.clash.r:null);if(r!=null)to=T(regionRect(r));if(UI.hand==null||o.full)from=F(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'herald':case 'location':{to=T(locRect(rm.loc));break}
    case 'bidRes':{to=T(el('#handw [data-k="'+K+'"]')||el('#act [data-k="'+K+'"]'));break}
    case 'clashOrder':{const nx=rm.order&&rm.order[(UI.ord||[]).length];if(nx!=null)to=T(regionRect(nx));break}
    case 'menu':{if(rm.a==='supp'&&rm.p)to=T(regionRect(rm.p.r));else if(UI.sheetOpen)to=T(el('#main [data-k="'+K+'"]'));else to=T(el('#act [data-k="'+K+'"]')||(rm.t==='act'&&rm.a!=='supp'?el('#act [data-a=powers]'):el('#act .btn.pri')));break}
    default:{to=T(el('#act [data-k="'+K+'"]')||el('#main [data-k="'+K+'"]'));break}
  }}catch(e){return null}
  return to?{from,to,fromR,toR,key:M.kind+'|'+(K||'')+'|'+(UI.hand==null?0:1)+'|'+(UI.pop||'')+'|'+(UI.sheetOpen?1:0)+'|'+Math.round(to.x)+','+Math.round(to.y)}:null}
function fingerPlan(){const M=UI.bf,rm=M&&M.rec;if(!M||!M.kind||!rm||UI.card||UI.dragging||!fingerWanted(learnKey())||(typeof tutOn==='function'&&tutOn()))return null;return planFor(M,rm)}
function bfFinger(){const f=$('#finger');if(!f)return;const p=ANIM&&!UI.reduce?fingerPlan():null;
  if(!p){if(!f.hidden){f.hidden=true;try{f._a&&f._a.cancel()}catch(e){}f._k=''}return}
  if(f._k===p.key&&!f.hidden)return;f._k=p.key;f.hidden=false;try{f._a&&f._a.cancel()}catch(e){}
  const a=p.from||p.to,b=p.to;const kf=p.from?[{transform:'translate('+a.x+'px,'+a.y+'px) scale(1.25)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px) scale(1)',opacity:1,offset:.14},{transform:'translate('+a.x+'px,'+a.y+'px) scale(.9)',opacity:1,offset:.28},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.9)',opacity:1,offset:.72},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.2)',opacity:.9,offset:.86},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.4)',opacity:0}]
    :[{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.3)',opacity:0},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1)',opacity:1,offset:.3},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.85)',opacity:1,offset:.55},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.35)',opacity:0}];
  try{f._a=f.animate(kf,{duration:p.from?2300:1500,iterations:Infinity,easing:'ease-in-out'})}catch(e){f.style.transform='translate('+b.x+'px,'+b.y+'px)'}}
function bfAfter(){bfFinger();if(typeof hlpAfter==='function')hlpAfter()}
// the computer acts at a watchable pace (about 0.6 s per move; tap to skip narration)
function autoSkip(h){if(NET.on||hotSeat()||!G||!G.q||G.q.t!=='menu')return false;
  const mv=legal(h);const acts=visibleActs(mv).filter(m=>m.t==='act');const d=mv.find(m=>m.t==='done');if(!d||acts.length)return false;
  return humanMoveAuto(d.k)}
// a move the game makes for you (a season with nothing to use): not a tap, so the tutorial does not gate it
function humanMoveAuto(k){UI._tutIn=1;try{return humanMove(k)}finally{UI._tutIn=0}}
// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the advisor's own move (UI.bf.sug, the same one the glowing suggestion uses) + a short why + rules cards.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 card:(n)=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#fbf1d2" stroke="#7a1f31" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="28" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+n+'</text></svg>',
 back:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#7a1f31" stroke="#c99a35" stroke-width="3"/><path d="M32 16l11 16-11 16-11-16z" fill="none" stroke="#e8c867" stroke-width="3"/></svg>',
 crown:()=>'<svg viewBox="0 0 64 64"><path d="M8 48h48l-4-28-13 12-7-19-7 19-13-12z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="48" width="48" height="6" rx="2" fill="#c99a35" stroke="#8a6a1a" stroke-width="2"/></svg>',
 kc:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#fbf1d2" stroke="#c99a35" stroke-width="3"/><path d="M20 38h24l-2-14-7 6-3-10-3 10-7-6z" fill="#e8c867" stroke="#8a6a1a" stroke-width="2" stroke-linejoin="round"/><path d="M22 46h20M22 51h14" stroke="#7a1f31" stroke-width="2.5" stroke-linecap="round"/></svg>',
 herald:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="17" r="9" fill="#2f7a9a" stroke="#12384a" stroke-width="3"/><path d="M19 56Q32 18 45 56z" fill="#2f7a9a" stroke="#12384a" stroke-width="3" stroke-linejoin="round"/><path d="M32 8V2l10 3-10 3" fill="#c0392b" stroke="#7a1f31" stroke-width="1.5"/></svg>',
 swords:()=>'<svg viewBox="0 0 64 64"><path d="M12 12l36 36M52 12L16 48" stroke="#55412a" stroke-width="5" stroke-linecap="round"/><path d="M10 52l8-8M54 52l-8-8" stroke="#c99a35" stroke-width="6" stroke-linecap="round"/><path d="M20 38l6 6M44 38l-6 6" stroke="#c99a35" stroke-width="4" stroke-linecap="round"/></svg>',
 supp:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="8" fill="#7a9a2f" stroke="#33430f" stroke-width="3"/><path d="M20 52Q32 24 44 52z" fill="#7a9a2f" stroke="#33430f" stroke-width="3" stroke-linejoin="round"/><text x="52" y="16" text-anchor="middle" font-size="16" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">+1</text></svg>',
 region:()=>'<svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="10" fill="#8fb77a" stroke="#4b6b3a" stroke-width="3"/><circle cx="21" cy="26" r="8" fill="#e8c867" stroke="#8a6a1a" stroke-width="2.5"/><circle cx="43" cy="38" r="8" fill="#e8c867" stroke="#8a6a1a" stroke-width="2.5"/></svg>',
 loc:(t)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8c867" stroke="#8a6a1a" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+(t||'+1')+'</text></svg>',
 scroll:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="4" fill="#fbf1d2" stroke="#8a6a1a" stroke-width="3"/><path d="M21 22h22M21 31h22M21 40h14" stroke="#7a1f31" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="10" r="5" fill="#c99a35"/><circle cx="50" cy="54" r="5" fill="#c99a35"/></svg>',
 gavel:()=>'<svg viewBox="0 0 64 64"><rect x="10" y="16" width="30" height="14" rx="3" transform="rotate(-30 25 23)" fill="#8a5a2a" stroke="#4a2f14" stroke-width="3"/><path d="M30 34l22 22" stroke="#4a2f14" stroke-width="7" stroke-linecap="round"/></svg>',
 star:()=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(122,31,49,.15)" stroke="#7a1f31" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#7a1f31" stroke-width="5"/><path d="M16 48L48 16" stroke="#7a1f31" stroke-width="5"/></svg>',
 hand:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="22" width="14" height="30" rx="3" transform="rotate(-18 15 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="25" y="14" width="14" height="34" rx="3" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="42" y="22" width="14" height="30" rx="3" transform="rotate(18 49 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hq=s=>()=>document.querySelector(s);
const hfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
const HLP_STEPS={
 bid:{target:hq('#handw'),title:'Make a secret bid',text:'Tap a card to bid it, then tap the glowing spot. The highest bid picks first.',pic:()=>HP.back()},
 bidRes:{target:hq('#handw'),title:'Take a Kingdom Card',text:'Tap a glowing Kingdom Card for a lasting power. Or tap Keep my card.',pic:()=>HP.kc()},
 occupier:{target:hfirst('#handw'),title:'Tuck a card under',text:'Pick the hand card that sits under your new Kingdom Card. It cannot fight.',pic:()=>HP.back()},
 herald:{target:hfirst('.tb-loc.glow.rec .tb-ring','.tb-loc.glow .tb-ring'),title:'Place your Herald',text:'Tap a glowing location. Your Herald pays off only if you win that region.',pic:()=>HP.herald()},
 place:{target:hq('#handw'),title:'Hide a card',text:'Tap a card, then tap a region. It stays hidden until the Clash.',pic:()=>HP.region()},
 tie:{target:hfirst('#act .btn','#handw'),title:'A tie!',text:'Add one more hidden card to break it, or tap Pass.',pic:()=>HP.swords()},
 spring:{target:hfirst('.tbx-pan g.rglow rect','#act .btn'),title:'Send Supporters',text:'Tap a region to send a Supporter: +1 Strength in its first Clash. Then tap Done.',pic:()=>HP.supp()},
 day:{target:hfirst('#act .btn.pri','#act .btn'),title:'The Clash',text:'The cards are face up. Highest total Strength wins. Tap Done to fight.',pic:()=>HP.swords()},
 autumn:{target:hfirst('#act [data-a=powers]','#act .btn.pri','#act .btn'),title:'Autumn options',text:'Optional: Govern or Journey with a card. Tap Powers to look, or Done to skip.',pic:()=>HP.scroll()},
 clashOrder:{target:hfirst('.tbx-pan g.rglow rect'),title:'Order the Clashes',text:'Tap the regions in the order they will fight.',pic:()=>HP.swords()},
 location:{target:hfirst('.tb-loc.glow.rec .tb-ring','.tb-loc.glow .tb-ring'),title:'Claim a location',text:'You won! Tap one of the two locations to claim its Influence.',pic:()=>HP.loc('+1')},
 bonus:{target:hfirst('#main','#handw','#act .btn'),title:'Location bonus',text:'Optional extra from your location. Choose an option, or skip it.',pic:()=>HP.star()},
 siteBuy:{target:hfirst('#main','#handw','#act .btn'),title:'Spend your Lore',text:'Lore buys stronger Site of Power cards. Keep it if nothing fits.',pic:()=>HP.scroll()},
 discardDown:{target:hfirst('#main','#handw','#act .btn'),title:'Too many cards',text:'Your hand is over its limit. Discard cards down to the limit.',pic:()=>HP.hand()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Hold the most Influence when the last round ends. Influence is your score.',pic:()=>hpics([['star','Influence'],'>',['crown','Winner']])},
 {title:'One round',text:'Bid for a Kingdom Card, place your Herald, hide cards, send Supporters, fight the Clashes.',pic:()=>hpics([['back','Bid'],'>',['herald','Herald'],'>',['swords','Clash']])},
 {phase:'bid',title:'Bid in secret',text:'Pick one hand card as your secret bid. The highest bid chooses a Kingdom Card first.',pic:()=>hpics([['card','Your card',5],'>',['back','Secret bid']])},
 {phase:'bid',title:'The bid goes under',text:'Your bid card is tucked under the Kingdom Card you take, so it cannot fight this round.',pic:()=>hpics([['back','Bid'],'>',['kc','Kingdom Card']])},
 {phase:'bid',title:'Cheap or strong?',text:'A cheap bid keeps your strong cards for the Clashes. A high bid picks first.',pic:()=>hpics([['card','Cheap',1],['card','Strong',9]])},
 {phase:'bidRes',title:'A lasting power',text:'A Kingdom Card works for you every round you keep it. Tap a glowing one to read it.',pic:()=>hpics([['kc','Kingdom Card'],'>',['star','Power']])},
 {phase:'bidRes',title:'Nothing good?',text:'Tap Keep my card to take your bid back, or steal a Kingdom Card from a rival.',pic:()=>hpics([['back','Your bid'],'>',['hand','Back to hand']])},
 {phase:'occupier',title:'Tuck a card under',text:'The card under your Kingdom Card cannot fight. Choose your weakest one.',pic:()=>hpics([['card','Weak',1],'>',['kc','Kingdom Card']])},
 {phase:'occupier',title:'A strong card is safer',text:'A stronger card under it makes your Kingdom Card harder for rivals to steal.',pic:()=>hpics([['card','Strong',9],'>',['kc','Harder to steal']])},
 {phase:'herald',title:'Place your Herald',text:'Tap a glowing location. Your Herald pays off only if you win that location\'s region.',pic:()=>hpics([['herald','Herald'],'>',['loc','Location']])},
 {phase:'herald',title:'Win there, earn more',text:'Win the region and claim the location: +1 Influence, and take 1 from each rival Herald there.',pic:()=>hpics([['swords','Win'],'>',['loc','Claim','+1']])},
 {phase:'place',title:'Hide a card',text:'Tap a card, then tap a region (or drag it there). It stays face down until the Clash.',pic:()=>hpics([['card','Pick',5],'>',['region','Region']])},
 {phase:'place',title:'The highest total wins',text:'At the Clash all cards flip. The highest total Strength in a region wins it.',pic:()=>hpics([['back','Flip'],'>',['swords','Compare']])},
 {phase:'place',title:'Or pass',text:'Pass keeps your cards in your hand. If everyone passes, nobody wins that region.',pic:()=>hpics([['pass','Pass'],'>',['hand','Keep cards']])},
 {phase:'tie',title:'A tie!',text:'The totals are equal. Each side may add one more hidden card, or pass.',pic:()=>hpics([['swords','Equal'],'>',['card','One more']])},
 {phase:'tie',title:'No extra card?',text:'If nobody adds a card, nobody wins this region.',pic:()=>hpics([['pass','Nobody wins']])},
 {phase:'spring',title:'Send Supporters',text:'Tap a region to send a Supporter: +1 Strength there in its first Clash.',pic:()=>hpics([['supp','Supporter'],'>',['region','Region']])},
 {phase:'spring',title:'They do not last',text:'Supporters on the map are lost in Winter. Tap Done when you are finished.',pic:()=>hpics([['supp','Used'],'>',['pass','Lost in Winter']])},
 {phase:'day',title:'The Clash',text:'The cards are face up. The highest total Strength wins the region. Tap Done to fight it.',pic:()=>hpics([['card','Yours',5],['swords','vs'],['card','Theirs',3]])},
 {phase:'day',title:'Powers first',text:'Some cards and Tactics can act now, before the result. Tap Powers to look.',pic:()=>hpics([['star','Power'],'>',['swords','Clash']])},
 {phase:'autumn',title:'Autumn options',text:'After the Clashes you may Govern or Journey with a card. Tap Done to skip both.',pic:()=>hpics([['scroll','Journey'],['gavel','Govern']])},
 {phase:'autumn',title:'Journey: gain Lore',text:'Send a card on a Journey for Lore. Lore buys stronger Site of Power cards.',pic:()=>hpics([['card','Card',2],'>',['scroll','Lore']])},
 {phase:'autumn',title:'Govern: lasting power',text:'A card with votes goes into a Council for a lasting power.',pic:()=>hpics([['card','Votes',3],'>',['gavel','Council']])},
 {phase:'clashOrder',title:'Order the Clashes',text:'Tap the regions in the order they fight. Your strongest region first is a good start.',pic:()=>hpics([['region','1st'],'>',['region','2nd'],'>',['region','3rd']])},
 {phase:'clashOrder',title:'One Clash per region',text:'Each region fights once per round. The winner claims one of its two locations.',pic:()=>hpics([['swords','Clash'],'>',['loc','Claim']])},
 {phase:'location',title:'Claim a location',text:'You won the region! Tap one of its two locations to claim its Influence.',pic:()=>hpics([['region','Won'],'>',['loc','Claim']])},
 {phase:'location',title:'Herald bonus',text:'If your Herald stands there you gain 1 more, and take 1 from each rival Herald.',pic:()=>hpics([['herald','Herald'],'>',['loc','Bonus','+1']])},
 {phase:'bonus',title:'Location bonus',text:'Some locations give an optional extra. Choose an option, or skip it.',pic:()=>hpics([['loc','Location'],'>',['star','Bonus']])},
 {phase:'bonus',title:'Read before you pick',text:'Tap an option to read it. Skipping is always allowed, and keeps your cards.',pic:()=>hpics([['scroll','Read it'],'>',['pass','Skip']])},
 {phase:'siteBuy',title:'Spend your Lore',text:'Lore buys Site of Power cards. A card with Strength goes to your hand.',pic:()=>hpics([['scroll','Lore'],'>',['card','New card',6]])},
 {phase:'siteBuy',title:'HQ cards',text:'An HQ card is a permanent power that stays in front of you.',pic:()=>hpics([['kc','HQ'],'>',['star','Always on']])},
 {phase:'discardDown',title:'Too many cards',text:'Your hand is over its size limit. Discard cards down to the limit.',pic:()=>hpics([['hand','Too many'],'>',['pass','Discard']])},
 {phase:'discardDown',title:'Pick the weakest',text:'Keep your strong cards for the Clashes. Discard the weakest ones.',pic:()=>hpics([['card','Keep',9],['card','Discard',1]])}
];
// ---------------------------------------------------------------- phases
// the phase the player is deciding in (null when there is nothing to decide on the board)
function hlpPhaseOf(M){if(!M||!M.kind)return null;const q=G&&G.q;if(!q)return null;
  if(M.kind==='menu'){const ph=menuPhase(q);return ph?ph.toLowerCase():null}
  if(M.kind!=='other')return M.kind;
  if(BONUSK.includes(q.kind))return 'bonus';
  return (q.kind==='siteBuy'||q.kind==='occupier'||q.kind==='discardDown')?q.kind:null}
const hlpPhase=()=>{try{return hlpPhaseOf(UI.bf)}catch(e){return null}};
// why (<= 15 words), from the advisor's own move
function capW(t,n){const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''}
function whyShort(M,m){const s=M.s,k=M.kind,q=G.q;let t='';
  if(k==='bid'){const i=cinfo(m.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);const rank=hand.indexOf(i.strength)+1;
    t=i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid picks first, but this card then cannot fight.':rank>=hand.length-1?'A cheap bid keeps your strong cards for the Clashes.':'A middle bid can still win a good card and keeps your best free.'}
  else if(k==='bidRes'){t=m.t==='return'?'Nothing on offer is worth a card: take yours back.':m.t==='steal'?'Steal a Kingdom Card: their bid card returns to their hand.':'This Kingdom Card works for you every round you keep it.'}
  else if(k==='herald'){const l=m.loc,inf=DD.LOCS[l][2];const riv=G.pl.some(p=>p.seat!==s&&p.herald===l);t=LOCN[l]+' pays +'+inf+' Influence. '+(riv?'Win it to take 1 from each rival Herald.':'Win its region for +1 more.')}
  else if(k==='location'){const l=m.loc;t=LOCN[l]+' pays +'+DD.LOCS[l][2]+' Influence.'+(G.pl[s].herald===l?' Your Herald is here: +1 more.':'')}
  else if(k==='place'||k==='tie'){if(m.pass)t='Passing keeps your cards. If all pass, nobody wins.';else{const st=cinfo(m.id).strength;t=st>=7?'Strength '+st+': a strong card where the prize is worth it.':st<=2?'Strength '+st+': a cheap bluff that saves better cards.':'Strength '+st+': a solid middle card for this region.'}}
  else if(k==='clashOrder')t='Your strongest region fights first.';
  else if(k==='menu'){const a=m.a||'';
    if(m.t==='done')t=menuPhase(q)==='Spring'?'Nothing here is worth spending this round.':'Nothing here gains you more than it costs.';
    else if(a==='supp'){const n=m.p.n;t='Send '+n+' Supporter'+(n>1?'s':'')+': +'+n+' Strength in '+REG[m.p.r]+'\'s first Clash.'}
    else if(a==='journey')t='A Journey gains Lore, which buys Site of Power cards.';
    else if(a==='govern')t='Votes into a Council give a lasting power.';
    else if(a==='cmd:rally')t='Rally: the card returns to your hand in Winter.';
    else if(a==='cmd:deploy')t='Deploy: the card stays on the map and fights next round.';
    else if(a==='council:oaths')t='Supporters come back to your board next round.';
    else if(a.startsWith('t:'))t='This Tactic helps you most right now.';
    else if(a.startsWith('fav:'))t='Use your Favour while you hold it.';
    else t='The best option at this step right now.'}
  else{const w=String(UI._recWhy||'').split(/(?<=[.!?:;])\s+/)[0].replace(/[.:;]$/,'.');t=w}
  return capW(t,15)}
function hlpSuggest(){const M=UI.bf;if(!M||!M.kind||UI.card||UI.dragging||!M.sug)return null;
  const plan=()=>planFor(UI.bf,UI.bf.sug,{full:1});const p=planFor(M,M.sug,{full:1});if(!p||!p.toR)return null;
  const why=whyShort(M,M.sug);if(!why)return null;
  return {why,key:M.sug.k,target:()=>{const q=plan();return (q&&q.toR)||p.toR},from:p.fromR?()=>{const q=plan();return (q&&q.fromR)||p.fromR}:null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'thornbound',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.glow,.rglow,.rec,.rrec,#act .btn,#main .opt,#main [data-a=mv],#spots .bspot'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase})}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;
  const st=$('#start');const busy=!G||!UI.started||G.over||UI.card||UI.pop||UI.dragging||(typeof tutOn==='function'&&tutOn())||(st&&!st.hidden)||isPassing();
  GXH.phase(busy?null:hlpPhase())}
// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged one-round game that teaches every rule by doing it once =====================
// The staged game is the guided deal (seed 23, you lead the Heathbound Clans against the Gilded Court on Easy) cut to ONE round (engine length 'tutorial').
// The computer is scripted by the fixed seed plus the teaching moves below (tutRec): the same cards every time, so each rule appears on cue.
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act).
const TUT_GAME='thornbound';
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(UI.cfg&&UI.cfg.tutorial);
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart});
// ---------------------------------------------------------------- the script: which card, which region (hand ids are fixed by the seed; names are checked)
const tutHand=()=>G.pl[0].hand.slice();
const tutHeir=()=>tutHand().find(id=>cinfo(id).archetype==='heir');
const tutBidId=()=>{const h=tutHand();return h.find(id=>/Sailing Hall/.test(cinfo(id).name))||h.slice().sort((a,b)=>cinfo(a).strength-cinfo(b).strength).find(id=>cinfo(id).strength>=3&&cinfo(id).archetype!=='heir')};
const tutPlaced=()=>{try{return UI.V.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&ownerOf(id)===0).length,0)}catch(e){return 0}};
// the next hidden card (the engine takes the regions in order: Uplands, Tablelands, Sinks): the strongest ordinary card, then the Heir where both Heralds wait, then the next strongest
function tutPlace(){const n=tutPlaced(),left=tutHand(),heir=tutHeir();
  if(n===1)return heir!=null&&left.includes(heir)?[heir,1]:null;
  const h=left.filter(id=>id!==heir).sort((a,b)=>cinfo(b).strength-cinfo(a).strength);return h.length?[h[0],n]:null}
function tutRec(s,mv){const q=G.q,k=q.kind;
  if(k==='bid'){const id=tutBidId();return mv.find(m=>m.id===id)||undefined}
  if(k==='place'){const p=tutPlace();if(!p)return undefined;return mv.find(m=>m.id===p[0]&&m.r===p[1])||mv.find(m=>m.id===p[0])||undefined}
  if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'){if(G.pl[s].supp.r[1]<2){const m=mv.find(x=>x.a==='supp'&&x.p&&x.p.r===1&&x.p.n===1);if(m)return m}return mv.find(m=>m.t==='done')||undefined}return undefined}
  if(k==='clashOrder'){const m=mv.find(x=>x.order&&x.order.join()==='0,1,2');return m||undefined}
  return undefined}
// ---------------------------------------------------------------- the Court is scripted too (the cards are fixed by the seed): it takes Cairn Field, wins the Uplands and the Sinks, and
// leaves the Tablelands (where your Herald and Supporters are) to you. Everything else it plays by the normal Easy AI.
function tutAI(seat){if(!(UI.cfg&&UI.cfg.tutorial)||!G||!G.q||seat!==1||G.round!==1)return null;const k=G.q.kind,mv=legal(seat);
  if(k==='herald')return mv.find(m=>m.loc===3)||null;
  if(k==='place'){const n=G.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&Math.floor(id/100)===1).length,0);const want=[112,110,113][n];
    return mv.find(m=>m.id===want&&m.r===n)||null}
  if(G.q.t==='menu'&&menuPhase(G.q)==='Spring'){if(G.pl[1].supp.r[1]<2){const m=mv.find(x=>x.a==='supp'&&x.p&&x.p.r===1&&x.p.n===1);if(m)return m}return mv.find(m=>m.t==='done')||null}
  return null}
(function(){const o=aiChoose;aiChoose=function(seat,level){const m=tutAI(seat);return m||o(seat,level)}})();
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
const tkind=k=>!!(UI.bf&&UI.bf.kind===k&&!UI.card&&!UI.pop);
const tfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
// a hand card's visible strip (the next card overlaps its right side), so the tap lands on that card
function tutHandRect(id){const e=document.querySelector('#handw .hc[data-id="'+id+'"]');if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;let right=r.right;
  if(!e.classList.contains('on')){const nx=e.nextElementSibling;if(nx&&nx.classList.contains('hc')){const q=nx.getBoundingClientRect();if(q.left>r.left+8)right=Math.min(right,q.left)}}
  return {left:r.left,top:r.top,width:Math.max(24,right-r.left),height:r.height}}
const tutReg=r=>()=>{try{return MAP.m?regionRect(r):null}catch(e){return null}};
function tutLoc(){const e=document.querySelector('.tb-loc.glow.rec .tb-ring')||document.querySelector('.tb-loc.glow .tb-ring');return e&&e.getBoundingClientRect().width?e:null}
// keep a hand card lifted for the "just tap the region" steps
function tutSelect(id){if(UI.hand===id)return true;if(!UI.bf||UI.bf.kind!=='place'||!UI.bf.use.has(id))return false;UI.hand=id;renderAll();return UI.hand===id}
const mvOf=a=>a.what==='move'?a:null;
const isMove=(a,kind)=>a.what==='move'&&a.kind===kind;
const myInf=()=>G.pl[0].inf, rivInf=()=>G.pl[1].inf;
const locOf=m=>m&&m.loc!=null?LOCN[m.loc]:'';
function tutSteps(){
  let p2=null,p3=null,clashSeen=null;
  return [
 {id:'map',title:'The kingdom',say:'Three regions, two locations each. Every location you claim pays Influence.',target:tq('#mapbox svg'),wait:null,ready:()=>tkind('bid')},
 {id:'goal',title:'Your goal',say:'Influence is your score. After the last round, the most Influence wins.',target:tq('#rivals'),wait:null,ready:()=>tkind('bid')},
 {id:'bid1',title:'Bid in secret',say:()=>'Every round starts with a secret bid. Tap your '+cinfo(tutBidId()).strength+' to pick it.',target:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutBidId()},ready:()=>tkind('bid')&&UI.hand==null},
 {id:'bid2',title:'Face down',say:'Tap the spot to bid it face down. Nobody sees it yet.',target:tq('#bidspot'),from:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>isMove(a,'bid')},ready:()=>tkind('bid')&&UI.hand===tutBidId()&&!!document.querySelector('#bidspot.glow')},
 {id:'reveal',title:'Highest bid first',say:()=>{const b=G.bstr||[];const m=b[0],t=b[1];return m>t?'Bids flip: your '+m+' beats their '+t+', so you choose first.':m<t?'Bids flip: their '+t+' beats your '+m+', so they choose first.':'Bids flip. A tie goes to the higher on the Order Track.'},
   target:tq('#rivals'),wait:null,hold:c=>c.kind==='event'&&c.ev.t==='bids',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'&&UI.card.rank&&UI.card.revN>=UI.card.rank.length)},
 {id:'kc',title:'A Kingdom Card',say:'Take a Kingdom Card: a power you keep. Your bid card goes under it. Tap the glowing one.',target:tfirst('#handw .kcb.glow.rg','#handw .kcb.glow'),
   wait:{type:'tap',match:a=>isMove(a,'bidRes')&&a.mv&&a.mv.t==='take'},ready:()=>tkind('bidRes')},
 {id:'herald',title:'Place your Herald',say:()=>'Your Herald marks a location. Tap '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing one')+', where the Court stands too.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'herald')},ready:()=>tkind('herald')&&!!tutLoc()},
 {id:'place1',title:'Hide a card',say:()=>'Hide one card at every region, face down. Start with your '+cinfo(tutPlace()[0]).strength+'.',target:()=>tutHandRect(tutPlace()&&tutPlace()[0]),
   wait:{type:'tap',match:a=>a.what==='select'&&tutPlace()&&a.id===tutPlace()[0]},ready:()=>tkind('place')&&tutPlaced()===0&&UI.hand==null},
 {id:'place1b',title:'Where it fights',say:'Tap the Uplands. Your card stays hidden until the Clash.',target:tutReg(0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===0},ready:()=>tkind('place')&&tutPlaced()===0&&tutPlace()&&UI.hand===tutPlace()[0]},
 {id:'place2',title:'Your Heir',say:'Your Heir, your strongest card, goes where both Heralds stand: the Tablelands.',target:tutReg(1),also:()=>tutHandRect(p2||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===1},ready:()=>tkind('place')&&tutPlaced()===1&&!!tutPlace()&&(p2=tutPlace()[0],tutSelect(p2))},
 {id:'place3',title:'Last card',say:()=>'Your '+cinfo(p3=tutPlace()[0]).strength+' goes to the Sinks. Tap the region.',target:tutReg(2),also:()=>tutHandRect(p3||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===2},ready:()=>tkind('place')&&tutPlaced()===2&&!!tutPlace()&&(p3=tutPlace()[0],tutSelect(p3))},
 {id:'supp',title:'Supporters',say:'Each Supporter adds +1 Strength here this round. Tap the Tablelands twice.',target:tutReg(1),
   wait:{type:'tap',times:2,match:a=>isMove(a,'menu')&&a.mv&&a.mv.a==='supp'&&a.mv.p&&a.mv.p.r===1},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]<2&&/Spring/.test(G.q.title||'')},
 {id:'spring',title:'Spring is over',say:'Supporters are placed. Tap Done to end Spring.',target:tfirst('#act [data-a=mv].pri','#act [data-a=mv]'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&a.mv.t==='done'},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]>=2&&/Spring/.test(G.q.title||'')},
 {id:'order',title:'Clash order',say:'You choose which region fights first. Tap the Uplands, then the Tablelands.',target:()=>tutReg((UI.ord||[]).length?1:0)(),
   wait:{type:'tap',times:2,match:a=>a.what==='order'},ready:()=>tkind('clashOrder')},
 {id:'clash',title:'The Clash',say:()=>{const ev=UI.card&&UI.card.ev;if(!ev)return '';const t=ev.tot,me=t[0],o=Math.max(...Object.keys(t).filter(s=>+s!==0).map(s=>t[s]));return ev.winner===0?'Cards flip. Highest total wins: your '+me+' beats '+o+'.':ev.winner<0?'Cards flip. Totals are equal: nobody wins here.':'Cards flip. Highest total wins: the Court\'s '+o+' beats your '+me+'.'},
   target:()=>{const ev=UI.card&&UI.card.ev;return ev?tutReg(ev.r)():null},wait:null,hold:c=>c.kind==='event'&&c.ev.t==='clash'&&!clashSeen,onNext:()=>{clashSeen=1;evDone()},
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='clash'&&UI.clashRes[UI.card.ev.r])},
 {id:'claim',title:'Claim a location',say:()=>'You won the Tablelands! Tap '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing location')+': your Herald there earns more.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'location')},ready:()=>tkind('location')&&!!tutLoc()},
 {id:'score',title:'Scoring',say:()=>'Location +2, your Herald +1, and 1 stolen from the Court. You now have '+myInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='news'&&c.big&&c.items.some(infK),onNext:()=>newsOk(),pending:'Watch the board',
   ready:()=>!!(UI.card&&UI.card.kind==='news'&&UI.card.big&&UI.card.items.some(infK))},
 {id:'round',title:'Round over',say:()=>'The round ends: Supporters go home and played cards are discarded. You have '+myInf()+', the Court '+rivInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='event'&&c.ev.t==='summary',onNext:()=>evDone(),pending:'Watch the board',
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='summary')},
 {id:'end',title:'The game ends',say:()=>'Real games last 4 to 6 rounds. The most Influence wins: '+(myInf()>rivInf()?'you win, '+myInf()+' to '+rivInf()+'!':myInf()===rivInf()?'a tie goes to the Favour holder.':'the Court wins, '+rivInf()+' to '+myInf()+'.'),
   target:tq('#rivals'),wait:null,ready:()=>!!(G&&G.over&&!UI.card)}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Bid, Herald, hidden cards, Supporters, Clashes, scoring. Now the Story begins.':'Bid, Herald, hidden cards, Supporters, Clashes, scoring. Round 2 adds Journeys, Tactics and more: the lightbulb explains them.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:()=>{try{GX.close()}catch(e){}hideStart();hideGloss();closePop(true);newGame('tutorial')},
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first){showStart();GXC.play(first.id)}
      else if(c==='story'&&typeof GXC!=='undefined'){showStart();GXC.open()}
      else{UI.sv='setup';UI.cfgOpen=false;showStart();UI.sv='setup';renderStart()}},
    onExit:()=>{tutLeave();showStart();if(o&&typeof GXC!=='undefined')GXC.open()}})}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave(){clearTimeout(_pumpT);clearTimeout(UI._evT);clearTimeout(UI._nt);UI.started=false;UI.card=null;UI.evq=[];UI.hand=null;try{GXH.hide()}catch(e){}try{const f=$('#finger');if(f)f.hidden=true}catch(e){}}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=humanMove;humanMove=function(k){
  if(tutOn()&&!UI._tutIn){const s=viewSeatForQ();const mv=s!=null?legal(s).find(m=>m.k===k):null;if(!GXT.act({type:'tap',what:'move',k,kind:G.q&&G.q.kind,mv}))return false}
  return o(k)}})();
(function(){const o=handTap;handTap=function(id){
  if(tutOn()){const M=UI.bf;const commit=!!(M&&cardDriven(M)&&UI.hand===id&&cardMoves(id).length===1);
    if(!commit&&!GXT.act({type:'tap',what:'select',id}))return}
  return o(id)}})();
(function(){const o=orderTap;orderTap=function(r){
  if(tutOn()){const M=UI.bf;if(!M||M.kind!=='clashOrder'||!M.nextRegs().includes(r))return;if(!GXT.act({type:'tap',what:'order',r}))return;
    UI._tutIn=1;try{return o(r)}finally{UI._tutIn=0}}
  return o(r)}})();
// ===================== part 13: painted extras (media/*.webp beside the page): card back and table =====================
// The drawn card back and the CSS table stay while a picture loads, in jsdom, and (table only) on Low graphics.
const PX=(function(){
  if(/jsdom/i.test(navigator.userAgent||''))return {tick(){}};
  const R=document.documentElement,seen={};let curT='',curB='';
  function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
  function load(f,cb){if(seen[f])return cb();const im=new Image();im.onload=()=>{seen[f]=1;cb()};im.src='media/'+f+'.webp'}
  // face-down cards: the thorn-crown back, or the latest card back unlocked in the story
  function backApply(){let pb='default';try{pb=localStorage.getItem('tb_back')==='court'?'court':'default'}catch(e){}
    const id=unl('cardback')||pb;if(id===curB)return;
    load('back-'+id,()=>{curB=id;TBKit.setBack('media/back-'+id+'.webp')})}
  // table: the candlelit court (phone version in portrait), or an unlocked table, behind the map
  function tableApply(){R.dataset.gfx=UI.lowGfx?'low':'high';
    const id=unl('table')||'court',ph=id==='court'&&matchMedia('(orientation:portrait)').matches,f=ph?'table-court-phone':'table-'+id;
    if(f===curT)return;load(f,()=>{curT=f;R.style.setProperty('--tbl-img','url(media/'+f+'.webp)');R.dataset.timg='1'})}
  // painted kingdom map (map.webp / map-phone.webp), used when present; locations stay on top
  let curM='';
  function mapApply(){const f=matchMedia('(orientation:portrait)').matches?'map-phone':'map';if(f===curM||UI.lowGfx)return;
    const im=new Image();im.onload=()=>{curM=f;TBKit.setMapImg('media/'+f+'.webp');R.dataset.mapimg='1'};im.src='media/'+f+'.webp'}
  // painted track lane tile and throne centrepiece (media/track.webp, media/throne.webp)
  let curS=0;
  function surfApplyUI(){if(curS||UI.lowGfx)return;curS=1;
    load('track',()=>TBKit.setTrackImg('media/track.webp'));load('throne',()=>TBKit.setThroneImg('media/throne.webp'))}
  // Basic cards: art/basic-<faction>.webp (embedded in TB_ART, already in PA) when it exists, else a crop of the faction's campaign portrait
  const BFB={gilded:'camp-halvard',heath:'camp-ysolde',lantern:'camp-rook',choir:'camp-orlen'};let bdone=false;
  function basicApply(){if(bdone)return;bdone=true;const extra={};let n=0;const fin=()=>{if(--n>0)return;TBKit.setArt(Object.assign({},PA,extra));if(typeof renderAll==='function'&&typeof G!=='undefined'&&G)try{renderAll()}catch(e){}};
    const ks=Object.keys(BFB).filter(f=>!PA['basic-'+f]);n=ks.length;if(!n)return;
    ks.forEach(f=>{const im=new Image();im.onload=()=>{extra['basic-'+f]='media/'+BFB[f]+'.webp';fin()};im.onerror=fin;im.src='media/'+BFB[f]+'.webp'})}
  function tick(){backApply();tableApply();mapApply();surfApplyUI();basicApply()}
  ['back-default','back-court','table-court','table-court-phone'].forEach(n=>{new Image().src='media/'+n+'.webp'});
  return {tick};
})();
// ===================== part 14: music per screen + the Music picker =====================
// Slots: tavern = title/menu, main = the game, fight = the last round, victory / defeat = the end card. Each has a saved choice: a, b, shuffle or off.
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Final round'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'The Gilded Hall at Midnight','tavern-b':'Whispers Beneath the Throne','main-a':'The Quiet Ledger','main-b':'Velvet Daggers','fight-a':'Siege of the Glass Kingdom','fight-b':'Thornfield Advance','victory-a':'All Hail the Victor','victory-b':'Fanfare for a New King','defeat-a':'Lanterns in the Frostwood','defeat-b':'A Lullaby for Empty Halls'};
const MDEF={tavern:'all',main:'all',fight:'all',victory:'a',defeat:'a'};
const MS={pick:Object.assign({},MDEF),res:{},sh:{},want:null,wslot:null,prev:null,prevT:0,last:null,since:0};
// 'all' = shuffle through every looping song (menu, game and final-round tracks), a new one every ~2.5 min
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MS.pick,JSON.parse(localStorage.getItem('tb_mpick')||'{}'))}catch(e){}
function musicWant(){const st=$('#start');if(!G||!UI.started||(st&&!st.hidden))return ['tavern',0];
  if(G.over){const me=vs(),single=NET.on||humans().length===1,won=single?G.over.winner===me:humans().length!==0;return [won?'victory':'defeat',1]}
  return [G.round>=G.rounds?'fight':'main',0]}
function musicName(slot){const c=MS.pick[slot]||MDEF[slot];if(c==='off')return '-';
  if(c==='all'){if(!MS.res[slot]){const pool=MALL.filter(k=>k!==MS.last);MS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MS.res[slot]}
  if(c==='shuffle'){if(!MS.res[slot]){MS.sh[slot]=MS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MS.sh[slot];MS.res[slot]=slot+'-'+'ab'[MS.sh[slot]]}return MS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicPick(slot,c){MS.pick[slot]=c;MS.res[slot]=null;try{localStorage.setItem('tb_mpick',JSON.stringify(MS.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(MS.wslot===slot&&!MS.prev){MS.want=null;musicSync()}}
// one cross-faded track at a time; called from a slow tick, the first tap, and after the music button or a pick
function musicSync(){try{PX.tick()}catch(e){}
  if(!window.GA||!UI.music||MS.prev)return;const w=musicWant();if(MS.wslot!==w[0]){MS.wslot=w[0];MS.res[w[0]]=null}
  else if(MS.pick[w[0]]==='all'&&!w[1]&&MS.since&&Date.now()-MS.since>MALL_MS)MS.res[w[0]]=null;
  const n=musicName(w[0]);if(MS.want===n)return;MS.want=n;MS.since=Date.now();if(n!=='-')MS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main'){setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=MS.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}}
function musicPreview(slot){if(!window.GA||!UI.music||MS.wslot===slot)return;try{GA.unlock()}catch(e){}const n=musicName(slot);if(n==='-')return;
  clearTimeout(MS.prevT);MS.prev=slot;MS.want=null;GA.music(n,{fade:.5,once:true});
  MS.prevT=setTimeout(()=>{MS.prev=null;MS.want=null;musicSync();renderMusic()},8000)}
function musicPreviewStop(){if(!MS.prev)return;clearTimeout(MS.prevT);MS.prev=null;MS.want=null;musicSync()}
function renderMusic(){const b=$('#musbody');if(!b)return;const on=UI.music;let vol=.5;try{vol=GA.state().musVol}catch(e){}
  const rows=MSLOTS.map(([k,nm])=>{const cur=MS.pick[k],act=MS.wslot===k&&on&&cur!=='off';
    const ch=['a','b'].map(v=>'<button class="mchip'+(cur===v?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="'+v+'">'+esc(MTITLE[k+'-'+v])+'</button>');
    ch.push('<button class="mchip'+(cur==='shuffle'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="shuffle">⇄ Shuffle</button>',(MLOOPS.includes(k)?'<button class="mchip'+(cur==='all'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="all">⇄ All songs</button>':''),'<button class="mchip'+(cur==='off'?' on':'')+'" data-a="mpick" data-s="'+k+'" data-c="off">Off</button>');
    const pv=MS.prev===k?'<button class="mchip prev" data-a="mprevx" data-s="'+k+'">■ Stop preview</button>':(!act&&cur!=='off'&&on?'<button class="mchip prev" data-a="mprev" data-s="'+k+'">▶ Preview</button>':'');
    return '<div class="mrow2"><h5>'+nm+(act?' <small>playing now</small>':'')+'</h5><div class="mchips">'+ch.join('')+pv+'</div></div>'}).join('');
  const h='<div class="music"><div class="mtop"><button class="mchip'+(on?' on':'')+'" data-a="mmus">Music: '+(on?'on':'off')+'</button><label class="mvol">Volume <input type="range" id="mvol" min="0" max="1" step="0.05" value="'+vol+'" aria-label="Music volume"></label></div><div class="mtop"><button class="mchip'+(MLOOPS.every(k=>MS.pick[k]==='all')?' on':'')+'" data-a="mall">⇄ Shuffle all songs</button></div>'+rows+'</div>';
  if(b._h!==h){b._h=h;b.innerHTML=h}}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='mvol'&&window.GA)GA.setVolume('music',+e.target.value)});
