// ===================== The Thornbound Throne: rules engine =====================
// Plain JS, no dependencies. Works in the browser (global TB) and in node (require('./engine.js') after data.js).
// G is ONE serialisable object (JSON-safe, no functions). All randomness goes through G.rng (mulberry32), so a game is a pure function
// of (seed, sequence of moves). Engine steps that still have to run sit on the agenda G.ag as {h:handlerKey,d:data}; the one thing the
// game is waiting for is G.q (a "question"): either one seat, or several seats answering simultaneously and secretly (bids, face-down cards).
// Public API (all take G first):  TB.newGame(opts)  TB.moves(G,seat)  TB.apply(G,move)  TB.pending(G)  TB.view(G,seat)  TB.stripView(G,seat)
//                                 TB.scores(G)  TB.invariants(G)  TB.describe(G)   plus TB.card(id,G) helpers for the UI.
// Card ids: faction card = seat*100+k (k 0..13 basic, 14..18 site of power). Kingdom cards are the ints 1..51. Locations 0..5
// (castle, wilderness, harvest field, battlefield, shrine, necropolis); location l belongs to region l>>1.
(function(g){
const TB=g.TB=g.TB||{};const D=TB.DATA;
let G=null;
const COUNCILS=D.COUNCILS,NLOC=6,NREG=3;
const LEN={short:4,standard:5,extended:6,tutorial:1};   // 'tutorial' = one round, used only by the staged tutorial game
// ---------------------------------------------------------------- rng
function rnd(n){let t=(G.rng=(G.rng+0x6D2B79F5)|0);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);const x=a[i];a[i]=a[j];a[j]=x}return a}
const clone=o=>JSON.parse(JSON.stringify(o));
const own=id=>(id/100)|0;
function stat(k){G.stats[k]=(G.stats[k]||0)+1}
function lg(t,seat,c,m){G.logN++;const e={i:G.logN,r:G.round,t,s:seat==null?-1:seat,c:c||''};if(m)e.m=m;G.log.push(e);if(G.log.length>600)G.log.splice(0,G.log.length-600)}
const nm=s=>G.pl[s].name;
const FN=s=>D.FNAME[G.pl[s].fac];
// ---------------------------------------------------------------- card data
function cdef(id){const s=own(id),k=id%100;return k<14?D.BASIC[k]:D.SITE[G.pl[s].fac][k-14]}
function cname(id){if(id<0)return 'a hidden card';const k=id%100;return k<14?D.BASICNAMES[G.pl[own(id)].fac][k]:cdef(id).nm}
const KCD=n=>D.KC[n-1];
const kname=n=>KCD(n).nm;
const NOMOD={};
function cm(id){return G.cmod[id]||(G.cmod[id]={})}
// where is a card (active region index) -> -1 when not Active
function regOf(id){for(let r=0;r<NREG;r++)if(G.reg[r].up.includes(id))return r;return -1}
function downReg(id){for(let r=0;r<NREG;r++)if(G.reg[r].down.includes(id))return r;return -1}
const holds=(s,n)=>G.pl[s].ks.some(x=>x&&x.kc===n);
const hqHas=(P,def)=>P.hq.some(id=>cdef(id).id===def);
const holdsHQ=(s,def)=>hqHas(G.pl[s],def);
const isHeirCard=id=>eff(id).ar==='heir';
function blankLvl(id){const r=regOf(id);if(r<0)return 0;const sd=own(id);let b=0;
  for(const k of G.reg[r].kc){if(k.n===49&&k.o!==sd){b=Math.max(b,2);stat('kc49')}}
  if(G.clash&&G.clash.r===r&&cdef(id).ar!=='heir'){for(let o=0;o<G.np;o++){if(o===sd)continue;for(const c of (G.clash.cards[o]||[]))if(cdef(c).fx.includes('hedge')){b=1}}}
  return b}
// effective card information: strength, archetype, traits, commands, effect codes, votes, lore
function eff(id){const sd=own(id),m=G.cmod[id]||NOMOD,d=cdef(id),src=m.copy!=null?cdef(m.copy):d,bl=blankLvl(id);
  const tr=new Set(),cmd={},fx=new Set();let s=d.s,ar=bl===1?'':src.ar,v=bl?0:src.v,l=bl?0:src.l;
  const addCm=(c)=>{const o=cmd[c.n];if(!o)cmd[c.n]={n:c.n,x:c.x||0,self:!!c.self};else{if((c.x||0)>o.x)o.x=c.x;if(!c.self)o.self=false}};
  if(!bl){for(const t of src.tr)tr.add(t);for(const c of src.cm)addCm(c);for(const f of src.fx)fx.add(f)}
  if(m.add)for(const a of m.add){const ad=cdef(a);s+=ad.s;if(!bl){for(const t of ad.tr)tr.add(t);for(const c of ad.cm)addCm(c);for(const f of ad.fx)fx.add(f)}}
  if(m.gt)for(const t of m.gt)tr.add(t.t);
  if(m.gc)for(const c of m.gc)addCm(c);
  // global grants from what the owner holds (these are "gained", never blanked)
  const P=G.pl[sd];
  if(holds(sd,1))tr.add('path');
  if(hqHas(P,'cln_hq2')&&!tr.has('res'))tr.add('res');
  const a=ar;
  if(a==='heir'){if(holds(sd,35)){addCm({n:'deadly'});addCm({n:'retreat'})}if(holds(sd,39))addCm({n:'flank'});if(holds(sd,41))addCm({n:'deploy',x:1});
    if(G.rm.mandate.includes(sd))tr.add('inv');if(G.rm.lanes.includes(sd))addCm({n:'deadly'})}
  if(a==='trader'&&hqHas(P,'cln_hq1'))addCm({n:'flank'});
  if((a==='follower'||a==='cavalry')&&holds(sd,36))addCm({n:'deploy',x:1});
  if(hqHas(P,'nob_hq')&&d.v===0)v+=1;
  if(a==='follower'&&holds(sd,3))v+=(G.order[0]===sd?1:2);
  if(holds(sd,8)&&d.l===1&&!bl)l+=1;
  return {s,ar:a,tr,cm:cmd,fx,v,l}}
const strOf=id=>eff(id).s;
const hasCmd=(id,n)=>!!eff(id).cm[n];
// ---------------------------------------------------------------- zones
function removeFrom(arr,x){const i=arr.indexOf(x);if(i>=0){arr.splice(i,1);return true}return false}
// take a faction card out of whatever zone holds it (returns the zone name); the caller puts it somewhere else
function detach(id){const sd=own(id),P=G.pl[sd];let z=null;
  for(const k of ['hand','deck','disc','site','hq']){if(removeFrom(P[k],id)){z=k;break}}
  if(!z){for(let r=0;r<NREG;r++){if(removeFrom(G.reg[r].up,id)){z='up';break}if(removeFrom(G.reg[r].down,id)){z='down';break}}}
  if(!z){for(const c of COUNCILS)if(removeFrom(G.council[c],id)){z='council';break}}
  if(!z&&removeFrom(G.lost,id))z='lost';
  if(!z&&removeFrom(G.burned,id))z='burned';
  if(!z){for(let s=0;s<G.np;s++){const ks=G.pl[s].ks;for(let i=0;i<ks.length;i++)if(ks[i]&&ks[i].occ===id){ks[i].occ=null;z='occ';break}if(z)break}}
  if(!z){for(let s=0;s<G.np;s++)if(G.pl[s].bid===id){G.pl[s].bid=null;z='bid';break}}
  if(!z&&G.limbo.includes(id)){removeFrom(G.limbo,id);z='limbo'}
  if(G.clash){for(const s in G.clash.cards)removeFrom(G.clash.cards[s],id);removeFrom(G.clash.added,id)}
  const m=G.cmod[id];if(m){if(z==='up'||z==='council'){m.tok=0}}
  for(const s in G.peek)removeFrom(G.peek[s],id);
  return z}
function enforceHand(seat){now('enforceHand',{seat})}
function toHand(seat,id){const P=G.pl[seat];detach(id);if(P.hand.length>=P.hs){P.deck.unshift(id);lg(nm(seat)+' has no room in hand: '+cname(id)+' goes on top of their deck.',seat)}else P.hand.push(id)}
function toDisc(id){detach(id);G.pl[own(id)].disc.push(id)}
function toLost(id){detach(id);G.lost.push(id)}
function toBurn(id){detach(id);G.burned.push(id)}
function toDeckTop(id){detach(id);G.pl[own(id)].deck.unshift(id)}
function toDeckBottom(id){detach(id);G.pl[own(id)].deck.push(id)}
// Active card leaves the map: remove tokens & fix up
function leaveActive(id){const m=G.cmod[id];if(m)m.tok=0}
// ---------------------------------------------------------------- resources
// every Influence change is booked in G.infl[seat][reason] (the end screen's breakdown) and logged with a cause (m.k 'inf' / 'steal')
function book(seat,why,n){if(!G.infl)G.infl=G.pl.map(()=>({}));const L=G.infl[seat]||(G.infl[seat]={});L[why]=(L[why]||0)+n;if(!L[why])delete L[why]}
function gainInf(seat,n,why,detail){if(n<=0)return 0;why=why||'other';G.pl[seat].inf+=n;stat('inf');const k='src:'+G.pl[seat].fac+':'+why;G.stats[k]=(G.stats[k]||0)+n;book(seat,why,n);
  lg(nm(seat)+' gains '+n+' Influence ('+why+(detail?': '+detail:'')+').',seat,'',{k:'inf',s:seat,n,why});return n}
function stealInf(thief,victim,n,why,detail){const a=Math.min(n,G.pl[victim].inf);if(a<=0)return 0;why=why||'Herald Reward';G.pl[victim].inf-=a;G.pl[thief].inf+=a;
  book(thief,why+': taken from rivals',a);book(victim,'Taken by rivals ('+why+')',-a);
  lg(nm(thief)+' steals '+a+' Influence from '+nm(victim)+' ('+why+(detail?': '+detail:'')+').',thief,'',{k:'steal',s:thief,v:victim,n:a,why});return a}
function loseInf(seat,n,why){const a=Math.min(n,G.pl[seat].inf);if(a<=0)return 0;G.pl[seat].inf-=a;book(seat,why||'Lost',-a);lg(nm(seat)+' loses '+a+' Influence ('+(why||'lost')+').',seat,'',{k:'inf',s:seat,n:-a,why:why||'Lost'});return a}
// a faction card leaves play for a public pile: one log line with the cause (m.k 'rm')
function rmLog(t,seat,ids,to,why,c){if(!ids.length)return;lg(t,seat,c||'',{k:'rm',ids:ids.slice(),to,why})}
function gainLore(seat,n,why){if(n<=0)return;G.pl[seat].lore+=n;stat('lore');if(why)lg(nm(seat)+' gains '+n+' Lore ('+why+').',seat);now('siteBuy',{seat})}
function setHS(seat,v){const P=G.pl[seat];const nv=Math.max(3,Math.min(8,v));if(nv!==v)stat('hsClamp');P.hs=nv}
// ---------------------------------------------------------------- agenda / questions
function now(h,d){G.ag.splice(G.agI++,0,{h,d:d||{}})}
function later(h,d){G.ag.push({h,d:d||{}})}
const AG={},PICKH={},SELH={},QH={};
function mkq(kind,title,seats,simul,ctx){return {kind,title,seats:seats.slice(),simul:!!simul,o:{},ctx:ctx||{},got:{}}}
// one seat picks one option. opts: [{k,label,...}] (k unique). Answer calls PICKH[h](seat,opt,ctx)
function askPick(seat,kind,title,opts,h,ctx){if(!opts.length)return false;const q=mkq(kind,title,[seat],false,ctx);q.h=h;q.t='pick';
  q.o[seat]=opts.map(o=>Object.assign({t:'pick'},o));G.q=q;return true}
// one seat picks any number of items in order. items: [{v,label}]. Answer calls SELH[h](seat,chosenValues,ctx)
function askSel(seat,kind,title,items,h,ctx,lim){lim=lim||{};const q=mkq(kind,title,[seat],false,ctx);q.h=h;q.t='sel';q.items=items;q.chosen=[];q.budget=lim.budget||null;q.min=lim.min||0;q.max=lim.max==null?items.length:lim.max;
  if(q.max>items.length)q.max=items.length;if(q.min>q.max)q.min=q.max;
  if(!items.length){return false}
  buildSel(q,seat);G.q=q;return true}
function buildSel(q,seat){const o=[];const spent=q.budget?q.chosen.reduce((t,c)=>t+q.budget.cost[c],0):0;const left=q.items.filter(it=>!q.chosen.some(c=>c===it.v)&&(!q.budget||q.budget.cost[it.v]<=q.budget.cap-spent));
  if(q.chosen.length<q.max)for(const it of left)o.push({t:'sel',k:'s:'+it.v,v:it.v,label:it.label});
  if(q.chosen.length>=q.min)o.push({t:'seldone',k:'done',label:q.chosen.length?'Done ('+q.chosen.length+' chosen)':'Choose none'});
  q.o[seat]=o}
// a yes/no style helper
function askYN(seat,kind,title,yes,no,h,ctx){return askPick(seat,kind,title,[{k:'yes',label:yes,yes:1},{k:'no',label:no,yes:0}],h,ctx)}
function flow(){let n=0;while(G&&G.phase!=='over'&&!G.q&&G.ag.length){if(n++>6000)throw new Error('agenda runaway');const x=G.ag.shift();G.agI=0;if(!AG[x.h])throw new Error('no agenda handler '+x.h);AG[x.h](x.d)}G.agI=0}
// ---------------------------------------------------------------- order helpers
const pos=s=>G.order.indexOf(s);
function seatsFrom(list){return list.slice().sort((a,b)=>pos(a)-pos(b))}
const others=s=>G.order.filter(x=>x!==s);
const cardsOfSeatActive=s=>{const o=[];for(let r=0;r<NREG;r++)for(const id of G.reg[r].up)if(own(id)===s)o.push(id);return o};
const regionName=r=>D.RNAMES[r];
const locName=l=>D.LOCS[l][1];
const councilName=c=>D.COUNCIL_NAMES[c];
const votesOf=id=>eff(id).v;
function cvotes(seat,c){let v=0;for(const id of G.council[c])if(own(id)===seat)v+=votesOf(id);const mk=G.cmk[c][seat];v+=mk[0];if(G.council.relics.concat(G.council.secrets,G.council.oaths).some(id=>own(id)===seat&&cdef(id).fx.includes('whisperer')))v+=mk[1];return v}
function slotOf(seat,n){return G.pl[seat].ks.findIndex(x=>x&&x.kc===n)}
const occCount=s=>G.pl[s].ks.filter(x=>x&&x.occ!=null).length;
function cardLbl(id){const e=eff(id);return cname(id)+' ('+e.s+')'}
// ---------------------------------------------------------------- setup
const newRM=()=>({masonry:[],tempests:-1,lanes:[],mandate:[],lock:{}});
TB.newGame=function(o){o=o||{};const pls=o.players||[];const np=pls.length;if(np<2||np>4)throw new Error('The Thornbound Throne is for 2 to 4 players (solo mode is not built yet).');
  const seed=o.seed!=null?(o.seed>>>0):Math.floor(Math.random()*2147483647);const len=LEN[o.length]?o.length:'standard';
  G={v:1,seed,rng:seed,np,len,rounds:LEN[len],round:0,phase:'setup',step:'',order:[],pl:[],reg:[],council:{relics:[],secrets:[],oaths:[]},cmk:{relics:[],secrets:[],oaths:[]},
    lost:[],burned:[],kburn:[],limbo:[],klimbo:[],road:[0,0,0,0],kdeck:[],kdisc:[],fav:{h:-1,u:3},cmod:{},rm:newRM(),used:{},cord:[],clash:null,peek:{},loc:[],bstr:[],bq:[],taken:false,infl:[],
    ag:[],agI:0,q:null,log:[],logN:0,stats:{},over:null,bidRev:false};
  for(let r=0;r<NREG;r++)G.reg.push({up:[],down:[],took:[],kc:[],done:false,n:0});
  for(let l=0;l<NLOC;l++)G.loc.push({kc:[]});
  for(const c of COUNCILS)for(let i=0;i<np;i++)G.cmk[c].push([0,0]);
  for(let i=0;i<np;i++){const f=pls[i].faction;if(D.FACTIONS.indexOf(f)<0)throw new Error('unknown faction '+f);
    const P={seat:i,name:pls[i].name||D.FSHORT[f],ai:pls[i].ai||null,fac:f,inf:0,lore:0,hs:6,hand:[],deck:[],disc:[],site:[],hq:[],ks:[null,null,null],sup:[],
      tac:D.TACTICS[f].map(t=>({ex:false,mk:t.mk,burn:false})),herald:-1,supp:{b:5,r:[0,0,0],x:[0,0,0],l:0},mk:[0,0,0,0,0,0],bid:null,gate:0};
    G.pl.push(P);G.peek[i]=[];G.infl.push({});
    for(let k=14;k<19;k++)P.site.push(i*100+k);
    const deck=[];for(let k=0;k<13;k++)deck.push(i*100+k);shuffle(deck);P.deck=deck;P.hand=[i*100+13];
    while(P.hand.length<6)P.hand.push(P.deck.shift())}
  G.order=o.order?o.order.slice():shuffle([...Array(np).keys()]);
  G.kdeck=shuffle([...Array(51).keys()].map(x=>x+1));
  for(let i=3;i>=0;i--)G.road[i]=G.kdeck.shift();
  lg('The Thornbound Throne begins: '+np+' players, '+G.rounds+' rounds ('+len+'). Order: '+G.order.map(s=>nm(s)).join(', ')+'.');
  later('roundStart');flow();return G};
// ---------------------------------------------------------------- API
function setG(x){G=x}
TB.pending=function(Gx){return Gx.q?{seats:Gx.q.seats.slice(),kind:Gx.q.kind,title:Gx.q.title,simul:Gx.q.simul,type:Gx.q.t}:null};
TB.moves=function(Gx,seat){if(!Gx.q||!Gx.q.seats.includes(seat))return [];return (Gx.q.o[seat]||[]).map(o=>Object.assign({seat},o))};
TB.question=function(Gx,seat){const q=Gx.q;if(!q||!q.seats.includes(seat))return null;return {kind:q.kind,title:q.title,type:q.t,simul:q.simul,seats:q.seats.slice(),max:q.max,chosen:q.chosen?q.chosen.slice():undefined}};
TB.apply=function(Gx,mv){G=Gx;
  try{const q=G.q;if(!q)return {ok:false,err:'nothing is pending'};const seat=mv&&mv.seat;
    if(!q.seats.includes(seat))return {ok:false,err:'not your decision'};
    const opt=(q.o[seat]||[]).find(o=>o.k===mv.k);if(!opt)return {ok:false,err:'illegal move'};
    G.agI=0;const log0=G.logN;answer(q,seat,opt);flow();
    return {ok:true,log:G.log.filter(e=>e.i>log0)}}
  catch(e){return {ok:false,err:e.message,exc:true,stack:e.stack}}};
function answer(q,seat,opt){
  if(q.t==='pick'){G.q=null;PICKH[q.h](seat,opt,q.ctx)}
  else if(q.t==='sel'){if(opt.t==='sel'){q.chosen.push(opt.v);if(q.chosen.length<q.max){buildSel(q,seat);return}}G.q=null;SELH[q.h](seat,q.chosen,q.ctx)}
  else if(q.t==='menu'){G.q=null;QH.menu(seat,opt,q.ctx)}
  else if(q.t==='simul'){const S=SIM[q.h];if(S.ans(q,seat,opt)){removeFrom(q.seats,seat);delete q.o[seat]}if(!q.seats.length){G.q=null;S.fin(q)}}
  else throw new Error('bad question type')}
const SIM={};
// ---------------------------------------------------------------- round skeleton
AG.roundStart=()=>{G.round++;G.phase='start';G.step='';G.rm=newRM();G.used={};G.cord=[];G.clash=null;G.bidRev=false;G.taken=false;
  for(const R of G.reg){R.took=[];R.done=false;R.n=0}
  lg('Round '+G.round+' of '+G.rounds+' begins.',null,'big');
  later('startYear');later('bidPlace');later('bidReveal');later('bidOrder');later('bidNext');later('bidEnd');later('heralds',{i:0});later('placeCards');
  later('menus',{step:'spring',i:0});later('clashOrder');later('regionLoop',{i:0});later('menus',{step:'autumn',i:0});later('winter')};
// ---------------------------------------------------------------- start of the year
function attrition(seat){const P=G.pl[seat];stat('attrition');
  P.deck=P.deck.concat(shuffle(P.disc.splice(0)));
  const si=P.sup.indexOf(4);
  if(si>=0){stat('kc4');P.sup.splice(si,1);G.kdisc.push(4);lg(nm(seat)+' suffers Attrition: the Veiled Patron is discarded instead of losing hand size.',seat,'warn')}
  else{if(P.hs>3){P.hs--;lg(nm(seat)+' suffers Attrition: their Discard Pile becomes a new Deck and hand size drops to '+P.hs+'.',seat,'warn')}else lg(nm(seat)+' suffers Attrition: their Discard Pile becomes a new Deck (hand size is already at the minimum).',seat,'warn')}}
function drawUp(seat){const P=G.pl[seat];let att=false;while(P.hand.length<P.hs){if(!P.deck.length){if(att)break;att=true;attrition(seat);if(!P.deck.length)break;continue}P.hand.push(P.deck.shift())}if(P.hand.length>P.hs)enforceHand(seat)}
function drawN(seat,n){const P=G.pl[seat];let att=false;for(let i=0;i<n&&P.hand.length<P.hs;i++){if(!P.deck.length){if(att)break;att=true;attrition(seat);if(!P.deck.length)break}P.hand.push(P.deck.shift())}if(P.hand.length>P.hs)enforceHand(seat)}
AG.enforceHand=d=>{const P=G.pl[d.seat];if(P.hand.length<=P.hs)return;const n=P.hand.length-P.hs;
  askSel(d.seat,'discardDown','Your hand is over its limit ('+P.hs+'): choose '+n+' card'+(n>1?'s':'')+' to discard.',P.hand.map(id=>({v:id,label:cardLbl(id)})),'discardDown',{why:'hand size '+P.hs},{min:n,max:n})};
SELH.discardDown=(seat,ch,d)=>{for(const id of ch)toDisc(id);const why=(d&&d.why)||'hand size';rmLog(nm(seat)+' discards '+ch.map(cname).join(', ')+(why==='hand size'||/^hand size/.test(why)?' to fit their hand size ('+G.pl[seat].hs+').':' ('+why+').'),seat,ch,'disc',why);enforceHand(seat)};
AG.startYear=()=>{G.phase='start';G.step='draw';
  if(G.round>1){for(const s of G.order)drawUp(s);
    const prev=G.order.slice();const arr=prev.slice().sort((a,b)=>G.pl[b].inf-G.pl[a].inf||prev.indexOf(b)-prev.indexOf(a));
    const ap=G.pl.findIndex(p=>holds(p.seat,27));
    if(ap>=0){stat('kc27');now('applause',{seat:ap,left:arr.slice(),chosen:[]})}
    else{G.order=arr;lg('Order Track: '+G.order.map(s=>nm(s)+' ('+G.pl[s].inf+')').join(', ')+'.')}}};
AG.applause=d=>{if(d.left.length<=1){G.order=d.chosen.concat(d.left);lg('Order Track chosen by '+nm(d.seat)+' (Herald of Applause): '+G.order.map(nm).join(', ')+'.',d.seat);return}
  askPick(d.seat,'applause','Herald of Applause: who takes place '+(d.chosen.length+1)+' on the Order Track?',d.left.map(s=>({k:'s'+s,who:s,label:nm(s)+' ('+G.pl[s].inf+' Influence)'})),'applause',d)};
PICKH.applause=(seat,opt,d)=>{const left=d.left.filter(x=>x!==opt.who);now('applause',{seat:d.seat,left,chosen:d.chosen.concat([opt.who])})};
// ---------------------------------------------------------------- spring: bids
SIM.bid={ans(q,seat,opt){const P=G.pl[seat];detach(opt.id);P.bid=opt.id;return true},fin(){}};
AG.bidPlace=()=>{G.phase='spring';G.step='bid';G.bidRev=false;G.taken=false;const seats=G.order.filter(s=>G.pl[s].hand.length);if(!seats.length)return;
  const q=mkq('bid','Choose a card from your hand to bid with (secret until everyone has chosen).',seats,true);q.t='simul';q.h='bid';
  for(const s of seats)q.o[s]=G.pl[s].hand.map(id=>({t:'bid',k:'b:'+id,id,label:'Bid with '+cardLbl(id)}));G.q=q};
function bidStrOf(seat){const P=G.pl[seat];if(P.bid==null)return -1;let s=strOf(P.bid);if(holds(seat,5))s+=5;return s}
AG.bidReveal=()=>{G.bidRev=true;G.step='bidreveal';G.bstr=[];
  for(let s=0;s<G.np;s++){G.bstr.push(bidStrOf(s));if(G.pl[s].bid!=null){const pr=strOf(G.pl[s].bid);lg(nm(s)+' bids '+cname(G.pl[s].bid)+' (Strength '+G.bstr[s]+(G.bstr[s]!==pr?': printed '+pr+', +5 from Sentinel Towers':'')+').',s)}}
  const ed=G.order.filter(s=>G.pl[s].bid!=null&&edictIdx(s)>=0&&!G.pl[s].tac[edictIdx(s)].ex&&!G.pl[s].tac[edictIdx(s)].burn);
  if(ed.length)now('edict',{list:ed,i:0})};
function edictIdx(s){return D.TACTICS[G.pl[s].fac].findIndex(t=>t.id==='nob_t3')}
AG.edict=d=>{if(d.i>=d.list.length)return;const s=d.list[d.i];now('edict',{list:d.list,i:d.i+1});
  askYN(s,'edict','Crown\'s Edict: set every opponent\'s Bidding Strength to 0 this Round?','Use Crown\'s Edict (then it is Exhausted)','Keep it',  'edict',{seat:s})};
PICKH.edict=(seat,opt,d)=>{if(!opt.yes)return;const i=edictIdx(seat);G.pl[seat].tac[i].ex=true;stat('t:nob_t3');
  for(let s=0;s<G.np;s++)if(s!==seat)G.bstr[s]=G.pl[s].bid==null?-1:0;lg(nm(seat)+' plays Crown\'s Edict: every opponent\'s Bidding Strength is 0.',seat,'big')};
AG.bidOrder=()=>{G.step='bidres';G.bq=G.order.filter(s=>G.pl[s].bid!=null).sort((a,b)=>G.bstr[b]-G.bstr[a]||pos(a)-pos(b));G.bfirst=true};
function canSteal(seat,s2,j){const T=G.pl[s2].ks[j];if(!T||T.occ==null)return false;if(holds(seat,5))return false;
  const bid=G.pl[seat].bid;let mine=G.bstr[seat]+(holds(seat,9)?3:0);let theirs=strOf(T.occ)+(holds(s2,5)?5:0);if(cdef(bid).fx.includes('steal0'))theirs=0;return mine>theirs}
function bidOpts(seat){const o=[];G.road.forEach((kc,i)=>{if(kc)o.push({t:'take',k:'gr:'+i,kc,i,label:'Take '+kname(kc)+' from the Great Road'})});
  if(G.pl[seat].sup.includes(34)){for(let i=0;i<Math.min(2,G.kdeck.length);i++)o.push({t:'take',k:'dk:'+i,kc:G.kdeck[i],dk:i,label:'Take '+kname(G.kdeck[i])+' from the top of the Kingdom Deck (Dead King\'s Gaze)'})}
  for(const s2 of others(seat))for(let j=0;j<3;j++)if(canSteal(seat,s2,j)){const T=G.pl[s2].ks[j];o.push({t:'steal',k:'st:'+s2+':'+j,s2,j,kc:T.kc,label:'Steal '+kname(T.kc)+' from '+nm(s2)+' (their '+cname(T.occ)+' occupies it, Strength '+(strOf(T.occ)+(holds(s2,5)?5:0))+')'})}
  o.push({t:'return',k:'ret',label:'Take your bidding card back to your hand'});return o}
AG.bidNext=()=>{if(!G.bq.length)return;const seat=G.bq.shift();
  if(G.bfirst){G.bfirst=false;if(holds(seat,5)){gainInf(seat,1,'Sentinel Towers: first to resolve a Bid');stat('kc5')}}
  now('bidNext',{});
  askPick(seat,'bidRes',nm(seat)+', resolve your Bid ('+cname(G.pl[seat].bid)+', Strength '+G.bstr[seat]+').',bidOpts(seat),'bidRes',{})};
PICKH.bidRes=(seat,opt)=>{const P=G.pl[seat],bid=P.bid;
  if(opt.t==='return'){lg(nm(seat)+' takes their bidding card back.',seat);toHand(seat,bid);return}
  if(opt.t==='take'){G.taken=true;let kc=opt.kc;
    if(opt.dk!=null){const i=G.kdeck.indexOf(kc);G.kdeck.splice(i,1);stat('kc34')}else G.road[opt.i]=0;
    lg(nm(seat)+' takes '+kname(kc)+'.',seat,'big');acquireKC(seat,kc,bid);return}
  if(opt.t==='steal'){const V=G.pl[opt.s2],T=V.ks[opt.j];const kc=T.kc,oc=T.occ;V.ks[opt.j]=null;kcLeave(opt.s2,kc);toHand(opt.s2,oc);stat('steal');
    lg(nm(seat)+' steals '+kname(kc)+' from '+nm(opt.s2)+' (bid '+G.bstr[seat]+(holds(seat,9)?' +3 Cutthroat Crew':'')+' beats the occupier '+cname(oc)+'); '+cname(oc)+' returns to '+nm(opt.s2)+'\'s hand.',seat,'big',{k:'kcsteal',s:seat,v:opt.s2,kc});
    const crew=G.pl.findIndex((p,i)=>holds(i,9));if(kc===9){stat('kc9');gainInf(seat,1,'Cutthroat Crew stolen')}else if(crew>=0){stat('kc9');gainInf(crew,1,'Cutthroat Crew: a Kingdom Card was stolen')}
    acquireKC(seat,kc,bid,{stolen:true})}};
AG.bidEnd=()=>{refillRoad(G.taken?1:2);G.bq=[]};
function drawKingdom(){if(!G.kdeck.length&&G.kdisc.length){G.kdeck=shuffle(G.kdisc.splice(0));lg('The Kingdom Discard is shuffled into a new Kingdom Deck.')}return G.kdeck.length?G.kdeck.shift():0}
function refillRoad(discards){const road=G.road;
  for(let n=0;n<discards;n++){for(let i=3;i>=0;i--)if(road[i]){G.kdisc.push(road[i]);lg('The Great Road discards '+kname(road[i])+'.');road[i]=0;break}}
  const cards=road.filter(Boolean);road.fill(0);for(let i=0;i<cards.length;i++)road[4-cards.length+i]=cards[i];
  for(let i=3;i>=0;i--)if(!road[i]){const c=drawKingdom();if(c)road[i]=c}}
// ---------------------------------------------------------------- acquiring Kingdom Cards
function ringMark(seat,kc){if(holdsHQ(seat,'upr_hq2')){const c=KCD(kc).suit,mk=G.cmk[c][seat];if(mk[0]<2){mk[0]++;stat('hq:upr_hq2');lg(nm(seat)+' places a marker on the '+councilName(c)+' (Underground Ring).',seat)}}}
function acquireKC(seat,kc,occ,o){o=o||{};if(!G.klimbo.includes(kc))G.klimbo.push(kc);ringMark(seat,kc);const meta=KCD(kc),P=G.pl[seat];
  if(meta.place==='board'){const slots=o.slot!=null?[o.slot]:[0,1];const empty=slots.filter(j=>!P.ks[j]);
    if(empty.length){placeOnSlot(seat,kc,occ,empty[0]);return}
    if(slots.length===1){placeOnSlot(seat,kc,occ,slots[0]);return}
    askPick(seat,'slot','Where do you keep '+kname(kc)+'? The Kingdom Card you replace is discarded and its occupier returns to your hand.',slots.map(j=>({k:'sl'+j,slot:j,label:'Replace '+kname(P.ks[j].kc)+' (occupied by '+cname(P.ks[j].occ)+')'})),'slot',{seat,kc,occ})}
  else now('kcBold',{seat,kc,occ})}
PICKH.slot=(seat,opt,d)=>placeOnSlot(d.seat,d.kc,d.occ,opt.slot);
function placeOnSlot(seat,kc,occ,j){const P=G.pl[seat],old=P.ks[j];removeFrom(G.klimbo,kc);
  if(old){P.ks[j]=null;kcLeave(seat,old.kc);G.kdisc.push(old.kc);lg(nm(seat)+' discards '+kname(old.kc)+' to make room.',seat);if(old.occ!=null)toHand(seat,old.occ)}
  detach(occ);P.ks[j]={kc,occ};stat('acq:kc'+kc);lg(nm(seat)+' occupies '+kname(kc)+' with '+cname(occ)+'.',seat);
  if(kc===17)setHS(seat,P.hs+1)}
function kcLeave(seat,kc){if(kc===17){setHS(seat,G.pl[seat].hs-1);enforceHand(seat)}}
// remove the Kingdom Card in slot j from a player's board. occ: 'hand' | 'disc' ; dest: 'kdisc' | 'burn'
function dropKC(seat,j,occ,dest){const P=G.pl[seat],T=P.ks[j];if(!T)return;P.ks[j]=null;kcLeave(seat,T.kc);
  if(dest==='burn')G.kburn.push(T.kc);else G.kdisc.push(T.kc);
  if(T.occ!=null){if(occ==='disc'){G.pl[seat].disc.push(T.occ);rmLog(nm(seat)+'\'s '+cname(T.occ)+' (under '+kname(T.kc)+') goes to the Discard Pile with it.',seat,[T.occ],'disc',kname(T.kc))}else toHand(seat,T.occ)}}
AG.kcBold=d=>{const {seat,kc,occ}=d,P=G.pl[seat];if(occ!=null){toDisc(occ);rmLog(nm(seat)+'\'s bidding card '+cname(occ)+' goes to the Discard Pile ('+kname(kc)+' is not kept on the board, so nothing is tucked under it).',seat,[occ],'disc',kname(kc))}
  stat('acq:kc'+kc);
  if(kc===4||kc===34){removeFrom(G.klimbo,kc);P.sup.push(kc);lg(nm(seat)+' places '+kname(kc)+' in their Supply.',seat);return}
  if(kc===7){stat('kc7');removeFrom(G.klimbo,7);G.kdisc.push(7);const lc=P.site.map(id=>cdef(id).lc);if(!lc.length){lg('The Lighthouse finds nothing left on the Site of Power.',seat);return}
    const mn=Math.min(...lc),c=P.site.filter(id=>cdef(id).lc===mn);
    if(c.length===1)buySite(seat,c[0],true);else askPick(seat,'lighthouse','The Lighthouse: choose which cheapest Site of Power card you acquire.',c.map(id=>({k:'c'+id,id,label:cname(id)})),'lighthouse',{});return}
  if(kc===10||kc===43||kc===49){askPick(seat,'placeRegion','Place '+kname(kc)+' on a Region.',[0,1,2].map(r=>({k:'r'+r,r,label:regionName(r)})),'placeRegion',{seat,kc});return}
  if(kc===11){askPick(seat,'placeLoc','Place '+kname(kc)+' on a Location.',[0,1,2,3,4,5].map(l=>({k:'l'+l,loc:l,label:locName(l)+' ('+regionName(l>>1)+')'})),'placeLoc',{seat,kc});return}};
PICKH.lighthouse=(seat,opt)=>buySite(seat,opt.id,true);
PICKH.placeRegion=(seat,opt,d)=>{removeFrom(G.klimbo,d.kc);G.reg[opt.r].kc.push({n:d.kc,o:d.seat});lg(nm(d.seat)+' places '+kname(d.kc)+' on '+regionName(opt.r)+'.',d.seat)};
PICKH.placeLoc=(seat,opt,d)=>{removeFrom(G.klimbo,d.kc);G.loc[opt.loc].kc.push({n:d.kc,o:d.seat});lg(nm(d.seat)+' places '+kname(d.kc)+' on '+locName(opt.loc)+'.',d.seat)};
// buy / acquire a Site of Power card (free: no Lore paid)
function buySite(seat,id,free){const P=G.pl[seat],d=cdef(id);if(!P.site.includes(id))return;detach(id);stat('site:'+d.id);
  if(d.kind==='hq'){P.hq.push(id);if(d.id==='gth_hq')P.gate=3;lg(nm(seat)+' acquires '+d.nm+' (HQ).',seat,'big')}
  else{toHand(seat,id);lg(nm(seat)+' acquires '+d.nm+(free?' for free':'')+'.',seat,'big');if(d.fx.includes('acqGovern3'))now('acqGovern',{seat,id,i:0})}}
AG.siteBuy=d=>{const P=G.pl[d.seat];if(!P.site.length||P.lore<=0)return;const mn=Math.min(...P.site.map(id=>cdef(id).lc));if(P.lore<mn)return;
  const cost={};for(const id of P.site)cost[id]=cdef(id).lc;
  askSel(d.seat,'siteBuy','You gained Lore (you have '+P.lore+'). Spend it on Site of Power cards now, or keep it for the next time you gain Lore.',P.site.map(id=>({v:id,label:cname(id)+' (cost '+cost[id]+(cdef(id).kind==='hq'?', HQ':'')+')'})),'siteBuy',{},{min:0,max:P.site.length,budget:{cap:P.lore,cost}})};
SELH.siteBuy=(seat,ch)=>{const P=G.pl[seat];for(const id of ch){const c=cdef(id).lc;if(P.lore<c)continue;P.lore-=c;buySite(seat,id,false)}};
AG.acqGovern=d=>{const P=G.pl[d.seat];if(d.i>=3)return;const c=COUNCILS[d.i];now('acqGovern',{seat:d.seat,id:d.id,i:d.i+1});
  const el=G.lost.concat(P.disc).filter(id=>own(id)===d.seat&&votesOf(id)>=1);if(!el.length)return;
  askPick(d.seat,'govern3','Govern with a card from your Lost Pile or Discard Pile into the '+councilName(c)+' (or skip).',el.map(id=>({k:'c'+id,id,label:cardLbl(id)+' ('+votesOf(id)+' votes)'})).concat([{k:'skip',skip:1,label:'Skip'}]),'govern3',{seat:d.seat,c})};
PICKH.govern3=(seat,opt,d)=>{if(opt.skip)return;toCouncil(seat,opt.id,d.c);stat('acqGovern')};
function toCouncil(seat,id,c){if(holds(seat,3)&&eff(id).ar==='follower')stat('kc3');detach(id);G.council[c].push(id);lg(nm(seat)+' moves '+cname(id)+' into the '+councilName(c)+'.',seat)}
// ---------------------------------------------------------------- heralds and face-down cards
AG.heralds=d=>{G.step='herald';if(d.i>=G.np)return;const s=G.order[d.i];now('heralds',{i:d.i+1});
  askPick(s,'herald','Place your Herald on a Location (everyone will see it).',[0,1,2,3,4,5].map(l=>({k:'l'+l,loc:l,label:'Place your Herald at '+locName(l)+' ('+regionName(l>>1)+')'})),'herald',{})};
PICKH.herald=(seat,opt)=>{G.pl[seat].herald=opt.loc;lg(nm(seat)+' places their Herald at '+locName(opt.loc)+'.',seat)};
function placeOpts(q,seat){const P=G.pl[seat],st=q.st[seat],o=[];
  if(st.small){for(const id of P.hand)for(let r=0;r<NREG;r++)if(!st.regs.includes(r))o.push({t:'place',k:'p:'+id+':'+r,id,r,label:'Place '+cardLbl(id)+' face-down next to '+regionName(r)})}
  else for(const id of P.hand)o.push({t:'place',k:'p:'+id,id,r:st.n,label:'Place '+cardLbl(id)+' face-down next to '+regionName(st.n)});
  return o}
SIM.place={ans(q,seat,opt){const st=q.st[seat];detach(opt.id);G.reg[opt.r].down.push(opt.id);st.n++;st.regs.push(opt.r);
  const P=G.pl[seat];if(st.n>=3||(st.small&&!P.hand.length))return true;q.o[seat]=placeOpts(q,seat);return false},fin(){}};
function mkPlace(seats,small){const q=mkq('place',small?'You hold fewer than three cards: place each next to a Region (face-down).':'Place one face-down card next to each Region.',seats,true);q.t='simul';q.h='place';q.st={};
  for(const s of seats){q.st[s]={n:0,small,regs:[]};q.o[s]=placeOpts(q,s)}G.q=q}
AG.placeBig=()=>{const seats=G.order.filter(s=>G.pl[s].hand.length>=3);if(seats.length)mkPlace(seats,false)};
AG.placeSmall=d=>{if(G.pl[d.seat].hand.length)mkPlace([d.seat],true)};
AG.placeCards=()=>{G.step='place';const small=G.order.filter(s=>G.pl[s].hand.length<3&&G.pl[s].hand.length>0);for(const s of small)now('placeSmall',{seat:s});now('placeBig')};
// ---------------------------------------------------------------- action steps (menus)
const ACT={};
function act(name,step,gen,run,card){ACT[name]={name,step,gen,run,card:!!card}}
const usedK=(seat,k)=>!!G.used[seat+':'+k];
const useK=(seat,k)=>{G.used[seat+':'+k]=1};
function menuOpts(seat,d){const o=[];const ctx={step:d.step,seat};
  for(const name in ACT){const A=ACT[name];if(A.step!==d.step)continue;if(d.restrict&&!A.card)continue;
    let rs=A.gen(seat,ctx)||[];if(d.restrict)rs=rs.filter(r=>r.p&&d.restrict.includes(r.p.card));
    rs.forEach((r,i)=>o.push({t:'act',k:name+'|'+(r.id!=null?r.id:i),a:name,p:r.p||{},label:r.label}))}
  o.push({t:'done',k:'done',label:'End my '+({spring:'Spring',day:'Day',autumn:'Autumn'}[d.step])+' actions'});return o}
AG.menus=d=>{const list=d.list||G.order;if(d.i>=list.length)return;const seat=list[d.i];
  G.phase=({spring:'spring',day:'summer',autumn:'autumn'})[d.step];G.step=d.step+'Actions';
  const opts=menuOpts(seat,d);if(opts.length<=1&&!d.acted){now('menus',Object.assign({},d,{i:d.i+1,acted:0}));return}
  const q=mkq('menu',nm(seat)+': '+({spring:'Spring',day:'Day',autumn:'Autumn'})[d.step]+' actions',[seat],false,d);q.t='menu';q.o[seat]=opts;G.q=q};
QH.menu=(seat,opt,d)=>{if(opt.t==='done'){now('menus',Object.assign({},d,{i:d.i+1,acted:0}));return}
  const A=ACT[opt.a];stat('act:'+opt.a);A.run(seat,opt.p,{step:d.step,seat});now('menus',Object.assign({},d,{acted:1}))};
// ---------------------------------------------------------------- summer: clashes
AG.clashOrder=()=>{G.phase='summer';G.step='clashorder';const placer=G.rm.tempests>=0?G.rm.tempests:G.order[G.order.length-1];
  const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  askPick(placer,'clashOrder','Place the Clash Markers: choose the order in which the Regions are resolved.',perms.map(p=>({k:'o'+p.join(''),order:p,label:p.map(r=>regionName(r)).join(', then ')})),'clashOrder',{})};
PICKH.clashOrder=(seat,opt)=>{G.cord=opt.order.slice();lg(nm(seat)+' places the Clash Markers: '+G.cord.map(regionName).join(', then ')+'.',seat)};
AG.regionLoop=d=>{if(d.i>=3)return;now('startRegion',{i:d.i});now('regionLoop',{i:d.i+1})};
AG.startRegion=d=>{const r=G.cord[d.i];G.curReg=r;lg('Clash '+['I','II','III'][d.i]+': '+regionName(r)+'.',null,'big');beginClash(r,G.order.slice(),true)};
function beginClash(r,parts,first){const R=G.reg[r];R.n++;G.clash={r,parts:parts.slice(),first,cards:{},added:[],used:{},bonus:{},n:R.n,skip:G.reg[r].kc.some(k=>k.n===47),winner:-1,tot:{}};now('clashReveal')}
AG.clashReveal=()=>{const c=G.clash,R=G.reg[c.r];G.phase='summer';G.step='reveal';
  for(const id of R.down.splice(0)){R.up.push(id);stat('reveal:'+G.pl[own(id)].fac+':'+cdef(id).id);for(const s in G.peek)removeFrom(G.peek[s],id)}
  for(const s of c.parts)c.cards[s]=R.up.filter(id=>own(id)===s&&!R.took.includes(id));
  for(const s of c.parts)lg(nm(s)+' reveals '+(c.cards[s].length?c.cards[s].map(cardLbl).join(', '):'no cards')+(G.pl[s].supp.r[c.r]?' and has '+G.pl[s].supp.r[c.r]+' Supporter'+(G.pl[s].supp.r[c.r]>1?'s':''):'')+'.',s);
  now('clashDay')};
AG.clashDay=()=>{const c=G.clash;G.step='day';if(c.skip){lg('The Day and Night steps are skipped in '+regionName(c.r)+'.');now('clashTally');return}now('dayRound',{restrict:null})};
AG.dayRound=d=>{const c=G.clash;now('menus',{step:'day',i:0,list:seatsFrom(c.parts),restrict:d.restrict});now('afterDay')};
AG.afterDay=()=>{const c=G.clash,R=G.reg[c.r];
  if(c.added.length){const nw=c.added.slice();c.added=[];for(const id of nw){if(removeFrom(R.down,id)){R.up.push(id);const s=own(id);(c.cards[s]=c.cards[s]||[]).push(id);for(const x in G.peek)removeFrom(G.peek[x],id)}}
    lg('Added cards are revealed: '+nw.map(id=>nm(own(id))+' - '+cardLbl(id)).join('; ')+'.');now('dayRound',{restrict:nw})}
  else now('clashNight')};
// Night: who eliminates whom, and why (pure; used by the Night step and by TB.clashPreview)
function nightMarks(all){const E={};const mark=(t,src,why,with_)=>{(E[t]=E[t]||[]).push({src,why,w:with_})};const opp=(a,b)=>own(a)!==own(b);
  for(const id of all){const e=eff(id),sd=own(id);
    if(e.cm.deadly)for(const t of all)if(opp(id,t))mark(t,id,'deadly');
    if(e.fx.has('agentDrawback')){const f=all.find(t=>opp(id,t)&&eff(t).ar==='follower');if(f!=null)mark(id,id,'drawback',f)}
    if(e.fx.has('hedge')){const h=all.find(t=>opp(id,t)&&eff(t).ar==='heir');if(h!=null)mark(id,id,'hedge',h)}
    if(e.fx.has('cellar'))for(const t of all)if(opp(id,t)&&['heir','captain'].includes(eff(t).ar))mark(t,id,'cellar');
    if(holds(sd,35)&&e.ar==='heir'){const f=all.find(t=>opp(id,t)&&eff(t).ar==='follower');if(f!=null)mark(id,id,'knives',f)}}
  return E}
function elimWhy(id,marks){const sd=own(id),who=nm(sd)+'\'s '+cname(id)+' ('+strOf(id)+')';
  const ext=marks.filter(x=>x.src!==id),self=marks.find(x=>x.src===id);
  if(ext.length){const srcs=[...new Set(ext.map(x=>x.src))];const kinds=[...new Set(ext.map(x=>x.why))];
    const by=srcs.map(x=>nm(own(x))+'\'s '+cname(x)).join(' and ');
    const why=kinds.includes('deadly')?'Deadly removes every opposing card in the Clash':'Cellar Fuse removes every opposing Heir and Captain in the Clash';
    return {t:by+' ('+(kinds.includes('deadly')?'Deadly':'Cellar Fuse')+') eliminates '+who+': '+why,why:kinds.includes('deadly')?'Deadly':'Cellar Fuse',by:srcs}}
  if(self){const w=self.w!=null?nm(own(self.w))+'\'s '+cname(self.w):'an opposing card';
    if(self.why==='drawback')return {t:who+' eliminates itself: its drawback removes it when an opposing Follower ('+w+') is in the Clash',why:'drawback',by:[id]};
    if(self.why==='hedge')return {t:who+' eliminates itself: Hedge Skirmishers are removed when an opposing Heir ('+w+') is in the Clash',why:'drawback',by:[id]};
    if(self.why==='knives')return {t:who+' is eliminated by its own Knives\' Fellowship: an opposing Follower ('+w+') is in the Clash with the Heir',why:'Knives\' Fellowship',by:[id]}}
  return {t:who+' is eliminated',why:'eliminated',by:[]}}
AG.clashNight=()=>{const c=G.clash,R=G.reg[c.r];G.step='night';const all=[];for(const s of c.parts)for(const id of (c.cards[s]||[]))all.push(id);
  const E=nightMarks(all);
  const dead=[],kills={};
  for(const id of all){if(!E[id])continue;if(eff(id).tr.has('inv')){stat('invulnerable');const W=elimWhy(id,E[id]);lg(nm(own(id))+'\'s '+cname(id)+' is Invulnerable: '+W.t.replace(/ eliminates .*$/,'').replace(/ (eliminates itself|is eliminated).*$/,'')+' cannot remove it.',own(id),'',{k:'inv',ids:[id],by:W.by,why:W.why,r:c.r});continue}
    dead.push(id);for(const x of E[id])if(x.src!==id)kills[x.src]=(kills[x.src]||0)+1}
  if(!dead.length){now('clashTally');return}
  const trig=[];
  for(const id of dead){const res=eff(id).tr.has('res'),sd=own(id);if(res)stat('resilient');const W=elimWhy(id,E[id]);detach(id);
    if(res)G.pl[sd].disc.push(id);else G.lost.push(id);stat('elim');lg(W.t+(res?'. Resilient: it goes to the Discard Pile, not the Lost Pile.':'. It goes to the Lost Pile.'),sd,'warn',{k:'elim',ids:[id],by:W.by,why:W.why,to:res?'disc':'lost',r:c.r});
    if(eff0(id,'heir')&&holds(sd,41)){const j=slotOf(sd,41);if(j>=0){toHand(sd,id);dropKC(sd,j,'hand','kdisc');stat('kc41');lg('Banner Marshal returns the Heir to hand and is discarded.',sd,'',{k:'save',ids:[id],why:'Banner Marshal'})}}
    else if(holds(sd,33))trig.push({t:'helm',id,seat:sd})}
  for(const sc in kills){const id=+sc,sd=own(id);
    if(G.rm.lanes.includes(sd)){gainInf(sd,1,'Doctrine of Back Lanes','their '+cname(id)+' eliminated a card');gainLore(sd,1,'Doctrine of Back Lanes')}
    if(holds(sd,35)&&cdef(id).ar==='heir'){gainInf(sd,1,'Knives\' Fellowship','their Heir eliminated a card');stat('kc35')}
    if(cdef(id).fx.includes('cellar'))trig.push({t:'cellar',id,seat:sd})}
  for(const t of trig)now('elimTrig',t);now('clashTally')};
function eff0(id,ar){return cdef(id).ar===ar}
AG.elimTrig=d=>{if(d.t==='helm'){if(!G.lost.includes(d.id)&&!G.pl[d.seat].disc.includes(d.id))return;askYN(d.seat,'helm','Dead King\'s Helm: move your Eliminated '+cname(d.id)+' to your hand?','Move it to my hand','Leave it','helm',d)}
  else askPick(d.seat,'cellar','Cellar Fuse eliminated cards: gain 1 Influence or 1 Lore.',[{k:'inf',inf:1,label:'Gain 1 Influence'},{k:'lore',inf:0,label:'Gain 1 Lore'}],'cellar',d)};
PICKH.helm=(seat,opt,d)=>{if(opt.yes){stat('kc33');toHand(seat,d.id)}};
PICKH.cellar=(seat,opt)=>{stat('cellar');if(opt.inf)gainInf(seat,1,'Cellar Fuse');else gainLore(seat,1,'Cellar Fuse')};
// total Strength of a side in the current Clash; brk (optional array) receives the labelled parts, which always add up to the total
function clashStrength(seat,brk){const c=G.clash;let t=0;const B=brk||[];for(const id of (c.cards[seat]||[])){const v=strOf(id);t+=v;const m=G.cmod[id];B.push({l:cname(id)+(m&&m.add&&m.add.length?' (with '+m.add.map(cname).join(', ')+')':''),n:v,id})}
  const sp=G.pl[seat].supp.r[c.r];if(sp){stat('supporterStrength');t+=sp;B.push({l:sp+' Supporter'+(sp>1?'s':''),n:sp,k:'sup'});if(G.rm.masonry.includes(seat)){t+=sp;B.push({l:'Doctrine of Masonry: +1 per Supporter',n:sp,k:'masonry'})}}
  if(c.bonus[seat]){t+=c.bonus[seat];B.push({l:'Blade That Dreamed',n:c.bonus[seat],k:'bonus'})}
  for(const k of G.reg[c.r].kc)if(k.n===43&&k.o!==seat){const h=Math.ceil(t/2);B.push({l:'Frozen Bastion ('+nm(k.o)+') halves it',n:h-t,k:'half'});t=h;stat('kc43')}return t}
AG.clashTally=()=>{const c=G.clash,R=G.reg[c.r];G.step='tally';const tot={},brk={};for(const s of c.parts){brk[s]=[];tot[s]=clashStrength(s,brk[s])}c.tot=tot;c.brk=brk;
  lg('Strength in '+regionName(c.r)+': '+c.parts.map(s=>nm(s)+' '+tot[s]).join(', ')+'.',-1,'',{k:'tally',r:c.r,tot:Object.assign({},tot),brk:JSON.parse(JSON.stringify(brk))});
  const watcher=c.parts.some(s=>(c.cards[s]||[]).some(id=>eff(id).fx.has('watcher')));
  let w;if(watcher){const pos_=c.parts.filter(s=>tot[s]>0);if(pos_.length){const b=Math.min(...pos_.map(s=>tot[s]));w=pos_.filter(s=>tot[s]===b);lg('A Rite of the Watcher is Active: the lowest Strength above 0 wins this Clash.')}else{w=c.parts.slice()}}
  else{const b=Math.max(...c.parts.map(s=>tot[s]));w=c.parts.filter(s=>tot[s]===b)}
  for(const s of c.parts){for(const id of (c.cards[s]||[]))if(!R.took.includes(id))R.took.push(id);const sp=G.pl[s].supp;sp.x[c.r]+=sp.r[c.r];sp.r[c.r]=0}
  if(w.length===1){c.winner=w[0];stat('clashWin');lg(nm(w[0])+' wins the Clash in '+regionName(c.r)+'.',w[0],'big');now('preRewards',{tie:false})}
  else{stat('clashTie');lg('Tie in '+regionName(c.r)+' between '+w.map(nm).join(' and ')+'.');c.tied=seatsFrom(w);c.tp=0;for(const t of c.tied)now('tieAsk',{seat:t});now('tieEnd')}};
AG.tieAsk=d=>{const s=d.seat,hand=G.pl[s].hand;if(!hand.length)return;
  askPick(s,'tie','Tied Clash in '+regionName(G.clash.r)+': play a face-down card from your hand to begin a new Clash, or pass.',hand.map(id=>({k:'c'+id,id,label:'Play '+cardLbl(id)+' face-down'})).concat([{k:'pass',pass:1,label:'Pass'}]),'tie',{})};
PICKH.tie=(seat,opt)=>{const c=G.clash;if(opt.pass){lg(nm(seat)+' passes.',seat);return}detach(opt.id);G.reg[c.r].down.push(opt.id);c.tp++;lg(nm(seat)+' plays a face-down card into the tied Clash.',seat)};
AG.tieEnd=()=>{const c=G.clash;if(c.tp>0){stat('reclash');const parts=c.tied.slice();endClashMods();beginClash(c.r,parts,false)}else{lg('Nobody breaks the tie: '+regionName(c.r)+' is resolved with no rewards.');now('preRewards',{tie:true})}};
function endClashMods(){for(const id in G.cmod){const m=G.cmod[id];if(m.gc)m.gc=m.gc.filter(x=>x.u!=='clash');if(m.gt)m.gt=m.gt.filter(x=>x.u!=='clash');if(m.ret){delete m.ret}if(m.cg){delete m.cg}}}
AG.preRewards=d=>{const c=G.clash,r=c.r,R=G.reg[r];
  if(G.rm.tempests>=0){const s=G.rm.tempests;const sup=G.pl.map(p=>p.supp.r[r]+p.supp.x[r]);const mx=Math.max(...sup);
    if(sup[s]>0&&sup[s]===mx&&sup.filter(x=>x===mx).length===1){gainInf(s,1,'Doctrine of Tempests','most Supporters in '+regionName(r));}
    const act=G.pl.map((p,i)=>R.up.filter(id=>own(id)===i).length);const ma=Math.max(...act);
    if(act[s]>0&&act[s]===ma&&act.filter(x=>x===ma).length===1)gainLore(s,1,'Doctrine of Tempests: most Active cards')}
  if(d.tie){now('regionDone');return}
  const w=c.winner;
  for(const id of R.up)if(own(id)===w&&cdef(id).fx.includes('skyrun')&&eff(id).fx.has('skyrun')){gainInf(w,1,'Skyrunners');stat('cln_a3')}
  if(holds(w,17)&&R.up.some(id=>own(id)===w&&eff(id).ar==='heir')){gainInf(w,1,'Monarch\'s Seal-Ring');stat('kc17')}
  const l0=2*r;askPick(w,'location','Choose a Location in '+regionName(r)+' to claim.',[l0,l0+1].map(l=>({k:'l'+l,loc:l,label:locName(l)+': '+D.LOCS[l][2]+' Influence'+(D.LOCS[l][3]?' and '+D.LOCS[l][3].replace(/\.$/,''):'')})),'location',{})};
PICKH.location=(seat,opt)=>{lg(nm(seat)+' claims '+locName(opt.loc)+'.',seat);now('locReward',{seat,l:opt.loc,noInf:false});now('heraldRw',{seat,l:opt.loc});now('regionDone')};
AG.regionDone=()=>{const c=G.clash;if(!c)return;G.reg[c.r].done=true;endClashMods();G.clash=null};
AG.locReward=d=>{const {seat,l}=d;stat('loc'+l);if(!d.noInf)gainInf(seat,D.LOCS[l][2],locName(l));
  for(const k of G.loc[l].kc)if(k.n===11){gainInf(k.o,1,'Trade League Hall');stat('kc11')}
  locText(seat,l)};
function locText(seat,l){const P=G.pl[seat];
  if(l===0){const src=P.hand.concat(cardsOfSeatActive(seat)).filter(id=>votesOf(id)>=1);if(!src.length)return;const o=[];
    for(const id of src)for(const c of COUNCILS)o.push({k:'g'+id+c,id,c,label:'Govern: '+cname(id)+' ('+votesOf(id)+' votes) into the '+councilName(c)+', discarding every other card there'});
    o.push({k:'skip',skip:1,label:'Skip the Spire Court'});askPick(seat,'castle','Spire Court: Govern with one Active or hand card?',o,'castle',{})}
  else if(l===1){const src=journeySources(seat,true);if(!src.length)return;
    askPick(seat,'wilderness','Thornwild: Journey with one Active or hand card?',src.map(id=>({k:'j'+id,id,label:'Journey with '+cname(id)+' (+'+eff(id).l+' Lore)'})).concat([{k:'skip',skip:1,label:'Skip Thornwild'}]),'wilderness',{})}
  else if(l===2){if(G.fav.h===seat&&G.fav.u===3)return;askYN(seat,'harvest','Gleaning Meadow: claim the Kingdom\'s Favour?','Claim the Favour','Skip','harvest',{})}
  else if(l===4){const src=P.hand.concat(cardsOfSeatActive(seat));if(!src.length)return;
    askSel(seat,'shrine','Moss Altar: choose up to three Active or hand cards to put at the bottom of your deck (first chosen goes under first).',src.map(id=>({v:id,label:cardLbl(id)})),'shrine',{},{min:0,max:3})}
  else if(l===5){P.disc=shuffle(P.disc);const room=Math.max(0,P.hs-P.hand.length);const n=Math.min(3,room,P.disc.length);
    if(n>0){const got=P.disc.splice(0,n);for(const id of got)P.hand.push(id);lg(nm(seat)+' draws '+n+' card'+(n>1?'s':'')+' from their shuffled Discard Pile.',seat)}
    if(P.hand.length)askSel(seat,'ossuary','Ossuary: you may discard any number of cards from your hand.',P.hand.map(id=>({v:id,label:cardLbl(id)})),'ossuary',{},{min:0,max:P.hand.length})}}
PICKH.castle=(seat,opt)=>{if(opt.skip)return;stat('castle');toCouncilFrom(seat,opt.id,opt.c,true)};
PICKH.wilderness=(seat,opt)=>{if(opt.skip)return;stat('wilderness');doJourney(seat,opt.id)};
PICKH.harvest=(seat,opt)=>{if(!opt.yes)return;claimFavour(seat)};
SELH.shrine=(seat,ch)=>{for(const id of ch)toDeckBottom(id);if(ch.length)lg(nm(seat)+' puts '+ch.length+' card'+(ch.length>1?'s':'')+' at the bottom of their deck.',seat);stat('shrine')};
SELH.ossuary=(seat,ch)=>{for(const id of ch)toDisc(id);if(ch.length)rmLog(nm(seat)+' discards '+ch.map(cname).join(', ')+' (Ossuary bonus).',seat,ch,'disc','Ossuary');stat('necropolis')};
function claimFavour(seat){G.fav.h=seat;G.fav.u=3;lg(nm(seat)+' claims the Kingdom\'s Favour.',seat,'big');stat('favour')}
// Govern: move card into council. discardOthers: Spire Court rule
function toCouncilFrom(seat,id,c,discardOthers){if(discardOthers){const rm=G.council[c].slice();toCouncil(seat,id,c);const ids=rm.filter(x=>x!==id);if(ids.length)leaveCouncil(ids,nm(seat)+' Governed at the Spire Court, which clears the '+councilName(c))}else toCouncil(seat,id,c)}
// cards leaving a council: to owner's discard, with the optional "to hand" / "to Lost Pile" riders
function leaveCouncil(ids,why){why=why||'removed';for(const id of ids){const sd=own(id);detach(id);G.pl[sd].disc.push(id);
  rmLog(nm(sd)+'\'s '+cname(id)+' leaves the council ('+why+') and goes to their Discard Pile.',sd,[id],'disc',why);
  const opts=[];if(hqHas(G.pl[sd],'cln_hq1')||holds(sd,18))opts.push('hand');if(cdef(id).fx.includes('whisperer'))opts.push('lost');
  if(opts.length)now('councilOut',{id,seat:sd,opts})}}
AG.councilOut=d=>{const o=[{k:'stay',stay:1,label:'Leave it in the Discard Pile'}];if(d.opts.includes('hand'))o.push({k:'hand',to:'hand',label:'Move '+cname(d.id)+' to your hand'});if(d.opts.includes('lost'))o.push({k:'lost',to:'lost',label:'Move '+cname(d.id)+' to the Lost Pile'});
  if(!G.pl[d.seat].disc.includes(d.id))return;askPick(d.seat,'councilOut',cname(d.id)+' was removed from a Council.',o,'councilOut',d)};
PICKH.councilOut=(seat,opt,d)=>{if(opt.stay)return;if(opt.to==='hand'){toHand(seat,d.id);stat('councilToHand')}else{toLost(d.id);rmLog(nm(seat)+' moves '+cname(d.id)+' to the Lost Pile (Whisperer of Names).',seat,[d.id],'lost','Whisperer of Names')}};
AG.heraldRw=d=>{const {seat,l}=d,P=G.pl[seat];if(P.herald!==l)return;stat('heraldRw');gainInf(seat,1,'Herald Reward','their Herald stands on '+locName(l));
  for(const o of others(seat))if(G.pl[o].herald===l)stealInf(seat,o,1,'Herald Reward',nm(o)+'\'s Herald also stands on '+locName(l));
  const items=[];for(const id of G.council.relics)if(own(id)===seat)items.push({v:id,label:cardLbl(id)+' ('+votesOf(id)+' vote'+(votesOf(id)>1?'s':'')+')'});
  const mk=G.cmk.relics[seat];for(let i=0;i<mk[0];i++)items.push({v:'mu'+i,label:'Marker (1 vote)'});for(let i=0;i<mk[1];i++)items.push({v:'mw'+i,label:'Whisper marker (1 vote)'});
  if(items.length)askSel(seat,'relics','Council of Coin: remove any of your cards or markers to gain Influence equal to the Votes removed.',items,'relics',{},{min:0,max:items.length})};
SELH.relics=(seat,ch)=>{let v=0;const cards=[];const mk=G.cmk.relics[seat];
  for(const x of ch){if(typeof x==='number'){v+=votesOf(x);cards.push(x)}else if(x[1]==='u'){mk[0]--;v++}else{mk[1]--;v++}}
  if(!ch.length)return;if(cards.length)leaveCouncil(cards,'cashed in at the Council of Coin');gainInf(seat,v,'Council of Coin','votes cashed in');stat('relicsUse')};
// ---------------------------------------------------------------- action helpers
const lockedFor=(seat,r)=>G.rm.lock[r]!=null&&G.rm.lock[r]!==seat&&G.reg[r].n<=1&&!G.reg[r].done;
const tacI=(seat,id)=>D.TACTICS[G.pl[seat].fac].findIndex(t=>t.id===id);
const tacOK=(seat,id)=>{const i=tacI(seat,id);if(i<0)return false;const t=G.pl[seat].tac[i];return !t.ex&&!t.burn&&!usedK(seat,'t:'+id)};
const TACFX={nob_t1:'their Supporters give 2 Strength each this Round and stay on the Map in Winter',nob_t2:'rivals may not add, move or swap cards into a locked Region in its first Clash',nob_t3:'every opponent\'s bid counts 0 this Round',nob_t4:'rivals\' cards leave a Council',
  cln_t1:'they choose the Clash order and earn bonuses for the most Supporters and Active cards',cln_t2:'a card gains Flank for the Round',cln_t3:'they take a rival\'s Kingdom Card',cln_t4:'cards come back to their hand',
  upr_t1:'their Heirs gain Deadly, and each elimination earns them 1 Influence and 1 Lore',upr_t2:'a card gains Retreat for this Clash',upr_t3:'each opponent discards cards',upr_t4:'they swap a rival\'s face-down cards',
  gth_t1:'two Supporters bring a card back from the Lost Pile',gth_t2:'they take a Kingdom Card from the discard',gth_t3:'they swap two of their Active cards',gth_t4:'cards go to the Lost Pile for Lore'};
function tacUse(seat,id){const i=tacI(seat,id),t=G.pl[seat].tac[i],def=D.TACTICS[G.pl[seat].fac][i];useK(seat,'t:'+id);stat('t:'+id);if(def.mk>0){t.mk--;if(t.mk<=0)t.ex=true}else t.ex=true;
  lg(nm(seat)+' uses the Tactic '+def.nm+(TACFX[id]?': '+TACFX[id]:'')+(def.mk>0?' ('+t.mk+' use'+(t.mk===1?'':'s')+' left)':'')+'.',seat,'big',{k:'tac',s:seat,id})}
function tactic(id,step,gen,run){act('t:'+id,step,(seat,ctx)=>tacOK(seat,id)?gen(seat,ctx):[],(seat,p,ctx)=>{tacUse(seat,id);run(seat,p,ctx)})}
function kcact(n,step,key,gen,run,card){const nmk='kc'+n+(key||'');act(nmk,step,(seat,ctx)=>{const j=slotOf(seat,n);if(j<0||usedK(seat,nmk))return[];return gen(seat,ctx,j)},(seat,p,ctx)=>{useK(seat,nmk);stat('kc'+n);run(seat,p,ctx,slotOf(seat,n))},card)}
const myClash=seat=>(G.clash&&G.clash.cards[seat])||[];
const lblC=id=>cname(id);
function moveActive(id,dest){const r0=regOf(id);if(r0>=0)removeFrom(G.reg[r0].up,id);else detach(id);G.reg[dest].up.push(id);const c=G.clash,sd=own(id);
  if(c){if(c.r===r0&&c.cards[sd])removeFrom(c.cards[sd],id);if(c.r===dest&&c.cards[sd]&&!G.reg[dest].took.includes(id)&&!c.cards[sd].includes(id))c.cards[sd].push(id)}}
function supOn(seat,r){const s=G.pl[seat].supp;return s.r[r]+s.x[r]}
function dropSupp(seat,r,n){const s=G.pl[seat].supp;let k=n;const a=Math.min(k,s.r[r]);s.r[r]-=a;k-=a;const b=Math.min(k,s.x[r]);s.x[r]-=b;return a+b}
function addGain(id,kind,v,u){const m=cm(id);if(kind==='c'){(m.gc=m.gc||[]).push({n:v,u})}else{(m.gt=m.gt||[]).push({t:v,u})}}
function placeOrdered(seat,ids,where,draw){ids=ids.slice();
  if(where==='top'){for(let i=ids.length-1;i>=0;i--)toDeckTop(ids[i])}else for(const id of ids)toDeckBottom(id);
  if(draw)drawN(seat,draw)}
function orderThen(seat,ids,where,draw){if(ids.length<=1||ids.length>4){placeOrdered(seat,ids.length>4?shuffle(ids.slice()):ids,where,draw);return}
  askSel(seat,'order','Put these cards '+(where==='top'?'on top of':'at the bottom of')+' your deck in the order you choose (first chosen goes '+(where==='top'?'on top)':'under first)')+'.',ids.map(id=>({v:id,label:cardLbl(id)})),'orderCards',{where,draw},{min:ids.length,max:ids.length})}
SELH.orderCards=(seat,ch,d)=>placeOrdered(seat,ch,d.where,d.draw);
// ---------------------------------------------------------------- SPRING actions
act('supp','spring',seat=>{const b=G.pl[seat].supp.b;if(!b)return[];const o=[];for(let r=0;r<NREG;r++)for(let n=1;n<=b;n++)o.push({id:r+'n'+n,p:{r,n},label:'Place '+n+' Supporter'+(n>1?'s':'')+' on '+regionName(r)});return o},
  (seat,p)=>{const s=G.pl[seat].supp;s.b-=p.n;s.r[p.r]+=p.n;lg(nm(seat)+' places '+p.n+' Supporter'+(p.n>1?'s':'')+' in '+regionName(p.r)+'.',seat)});
tactic('nob_t1','spring',()=>[{label:'Doctrine of Masonry: your Supporters give 2 Strength this Round and stay on the Map in Winter'}],seat=>{G.rm.masonry.push(seat)});
tactic('nob_t2','spring',seat=>{const o=[];for(let r=0;r<NREG;r++)if(G.reg[r].up.some(id=>own(id)===seat&&eff(id).ar==='war_machine'))o.push({id:r,p:{r},label:'Martial Writ: lock '+regionName(r)+' (rivals may not add, move or swap cards into it for its first Clash)'});return o},(seat,p)=>{G.rm.lock[p.r]=seat});
tactic('cln_t1','spring',()=>[{label:'Doctrine of Tempests: you place the Clash Markers and earn bonuses for Supporters and Active cards'}],seat=>{G.rm.tempests=seat});
tactic('upr_t1','spring',()=>[{label:'Doctrine of Back Lanes: your Heirs gain Deadly; eliminating cards earns 1 Influence and 1 Lore'}],seat=>{G.rm.lanes.push(seat)});
tactic('upr_t3','spring',seat=>{const n=occCount(seat);if(!n||!others(seat).some(o=>G.pl[o].hand.length))return[];return [{label:'Midnight Pressure: each opponent discards '+n+' card'+(n>1?'s':'')+' from hand'}]},seat=>{const n=occCount(seat);for(const o of others(seat))now('mpDiscard',{seat:o,n,by:seat})});
AG.mpDiscard=d=>{const P=G.pl[d.seat];const n=Math.min(d.n,P.hand.length);if(!n)return;askSel(d.seat,'discardPick','Midnight Pressure: discard '+n+' card'+(n>1?'s':'')+' from your hand.',P.hand.map(id=>({v:id,label:cardLbl(id)})),'discardDown',{why:'Midnight Pressure from '+(d.by!=null?nm(d.by):'a rival')},{min:n,max:n})};
tactic('upr_t4','spring',seat=>others(seat).some(o=>G.reg.filter(R=>R.down.some(id=>own(id)===o)).length>=2)?[{label:'Forged Dispatches: swap two face-down cards of a rival (repeat on other rivals)'}]:[],seat=>{now('forge',{seat,list:others(seat),i:0})});
AG.forge=d=>{if(d.i>=d.list.length)return;const o=d.list[d.i];now('forge',{seat:d.seat,list:d.list,i:d.i+1});
  const rs=[0,1,2].filter(r=>G.reg[r].down.some(id=>own(id)===o)&&!lockedFor(d.seat,r));const op=[];
  for(let a=0;a<rs.length;a++)for(let b=a+1;b<rs.length;b++)op.push({k:'s'+rs[a]+rs[b],a:rs[a],b:rs[b],label:'Swap '+nm(o)+'\'s face-down cards in '+regionName(rs[a])+' and '+regionName(rs[b])});
  if(!op.length)return;op.push({k:'skip',skip:1,label:'Leave '+nm(o)+' alone'});askPick(d.seat,'forge','Forged Dispatches: swap two of '+nm(o)+'\'s face-down cards?',op,'forge',{o})};
PICKH.forge=(seat,opt,d)=>{if(opt.skip)return;const A=G.reg[opt.a].down,B=G.reg[opt.b].down;const ia=A.findIndex(id=>own(id)===d.o),ib=B.findIndex(id=>own(id)===d.o);const x=A[ia];A[ia]=B[ib];B[ib]=x;
  lg(nm(seat)+' swaps two of '+nm(d.o)+'\'s face-down cards.',seat)};
tactic('gth_t2','spring',seat=>G.kdisc.length&&G.pl[seat].hand.length?[{label:'Night Gleaners: look at five random cards of the Kingdom Discard and acquire one'}]:[],seat=>{G.kdisc=shuffle(G.kdisc);const five=G.kdisc.slice(0,5);
  askPick(seat,'gleaners','Night Gleaners: choose one of five random discarded Kingdom Cards to acquire (you will occupy it with a card from your hand).',five.map(kc=>({k:'k'+kc,kc,label:kname(kc)+': '+KCD(kc).txt})).concat([{k:'skip',skip:1,label:'Take none'}]),'gleaners',{})});
PICKH.gleaners=(seat,opt)=>{if(opt.skip)return;askPick(seat,'occupier','Choose the card from your hand that will occupy '+kname(opt.kc)+'.',G.pl[seat].hand.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'gleanersOcc',{kc:opt.kc})};
PICKH.gleanersOcc=(seat,opt,d)=>{removeFrom(G.kdisc,d.kc);lg(nm(seat)+' acquires '+kname(d.kc)+' from the Kingdom Discard.',seat,'big');acquireKC(seat,d.kc,opt.id)};
act('hq:cln_hq2','spring',seat=>{const P=G.pl[seat];if(!hqHas(P,'cln_hq2')||usedK(seat,'hq:cln_hq2')||!P.supp.l)return[];return [0,1,2].map(r=>({id:r,p:{r},label:'Haven Quay: move up to two Supporters from the Lost Pile to '+regionName(r)}))},
  (seat,p)=>{useK(seat,'hq:cln_hq2');const s=G.pl[seat].supp;const n=Math.min(2,s.l);s.l-=n;s.r[p.r]+=n;lg(nm(seat)+' moves '+n+' Supporter'+(n>1?'s':'')+' from the Lost Pile to '+regionName(p.r)+'.',seat)});
kcact(2,'spring','',seat=>G.council.relics.concat(G.council.secrets,G.council.oaths).some(id=>own(id)===seat)?[{label:'Statue Wrights: gain 1 Influence for holding a card in a Council'}]:[],(seat,p,ctx,j)=>{gainInf(seat,1,'Statue Wrights');
  if(COUNCILS.every(c=>G.council[c].some(id=>own(id)===seat)))askYN(seat,'statue','Statue Wrights: discard it to gain 2 more Influence?','Discard it for 2 Influence','Keep it','statue',{})});
PICKH.statue=(seat,opt)=>{if(!opt.yes)return;const j=slotOf(seat,2);if(j<0)return;dropKC(seat,j,'hand','kdisc');gainInf(seat,2,'Statue Wrights')};
kcact(6,'spring','',seat=>G.pl[seat].tac.some(t=>!t.burn)?[{label:'Buried Hall: burn one of your Tactics for Lore'}]:[],seat=>{
  askPick(seat,'burnTactic','Buried Hall: which Tactic do you burn? (an Unexhausted one gives 3 Lore, an Exhausted one 1)',G.pl[seat].tac.map((t,i)=>t.burn?null:{k:'t'+i,i,label:'Burn '+D.TACTICS[G.pl[seat].fac][i].nm+(t.ex?' (Exhausted: 1 Lore)':' (Unexhausted: 3 Lore)')}).filter(Boolean),'burnTactic',{})});
PICKH.burnTactic=(seat,opt)=>{const t=G.pl[seat].tac[opt.i];const was=!t.ex;t.burn=true;t.ex=true;t.mk=0;gainLore(seat,was?3:1,'Buried Hall')};
kcact(13,'spring','',()=>[{label:'Faraway Hermitage: gain 1 Influence if you have no Lore, otherwise 1 Lore'}],seat=>{if(G.pl[seat].lore===0)gainInf(seat,1,'Faraway Hermitage');else gainLore(seat,1,'Faraway Hermitage')});
kcact(14,'spring','',seat=>G.pl[seat].disc.length&&G.pl[seat].hand.length<G.pl[seat].hs?G.pl[seat].disc.map(id=>({id,p:{id},label:'Counterfeit Amnesties: move '+cardLbl(id)+' from your Discard Pile to your hand'})):[],(seat,p)=>{toHand(seat,p.id)});
kcact(19,'spring','',seat=>[{label:'Rumours Underground: choose players who put their hand under their deck and redraw'}],seat=>{
  askSel(seat,'rumours','Rumours Underground: choose any number of players (each puts their whole hand at the bottom of their deck, then draws that many cards).',G.order.filter(s=>G.pl[s].hand.length).map(s=>({v:s,label:nm(s)+' ('+G.pl[s].hand.length+' cards)'})),'rumours',{},{min:0})});
SELH.rumours=(seat,ch)=>{for(const s of seatsFrom(ch))now('rumourOne',{seat:s})};
AG.rumourOne=d=>{const P=G.pl[d.seat];const n=P.hand.length;if(!n)return;const ids=P.hand.slice();orderThen(d.seat,ids,'bottom',n)};
function swapOpts(seat){const P=G.pl[seat],o=[];const tg=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===seat)tg.push({id,w:'council '+councilName(c)});
  P.ks.forEach((T,j)=>{if(T&&T.occ!=null)tg.push({id:T.occ,w:'occupying '+kname(T.kc)})});
  for(const h of P.hand)for(const t of tg)o.push({id:h+'x'+t.id,p:{h,t:t.id},label:'Swap '+cname(h)+' (hand) with '+cname(t.id)+' ('+t.w+')'});return o}
function doSwapHandTarget(seat,h,t){const P=G.pl[seat];let where=null;for(const c of COUNCILS)if(G.council[c].includes(t))where={c};
  if(where){const arr=G.council[where.c];arr[arr.indexOf(t)]=h;removeFrom(P.hand,h);P.hand.push(t);lg(nm(seat)+' swaps '+cname(h)+' into the '+councilName(where.c)+'.',seat)}
  else{for(const T of P.ks)if(T&&T.occ===t){T.occ=h;removeFrom(P.hand,h);P.hand.push(t)}lg(nm(seat)+' swaps an occupier.',seat)}}
kcact(20,'spring','',seat=>swapOpts(seat),(seat,p)=>doSwapHandTarget(seat,p.h,p.t));
kcact(20,'autumn','a',seat=>swapOpts(seat),(seat,p)=>doSwapHandTarget(seat,p.h,p.t));
kcact(23,'spring','',()=>[0,1,2].map(r=>({id:r,p:{r},label:'Tavern Keeper: look at all face-down cards in '+regionName(r)})),(seat,p)=>{
  for(const id of G.reg[p.r].down)if(own(id)!==seat&&!G.peek[seat].includes(id))G.peek[seat].push(id);
  lg(nm(seat)+' looks at the face-down cards in '+regionName(p.r)+' (Tavern Keeper).',seat);
  const mine=[0,1,2].filter(r=>G.reg[r].down.some(id=>own(id)===seat&&true)&&!lockedFor(seat,r));const op=[];
  for(let a=0;a<mine.length;a++)for(let b=a+1;b<mine.length;b++)op.push({k:'s'+mine[a]+mine[b],a:mine[a],b:mine[b],label:'Swap your face-down cards in '+regionName(mine[a])+' and '+regionName(mine[b])});
  if(op.length){op.push({k:'skip',skip:1,label:'Do not swap'});askPick(seat,'tavern','Tavern Keeper: you may swap two of your own face-down cards.',op,'tavern',{})}});
PICKH.tavern=(seat,opt)=>{if(opt.skip)return;const A=G.reg[opt.a].down,B=G.reg[opt.b].down;const ia=A.findIndex(id=>own(id)===seat),ib=B.findIndex(id=>own(id)===seat);const x=A[ia];A[ia]=B[ib];B[ib]=x;lg(nm(seat)+' swaps two of their face-down cards.',seat)};
kcact(25,'spring','',seat=>{const lost=G.lost.filter(id=>own(id)===seat);return lost.length&&G.pl[seat].hand.length?[{label:'The Ferryman: swap a card in your hand with one of yours in the Lost Pile'}]:[]},seat=>{
  const lost=G.lost.filter(id=>own(id)===seat);askPick(seat,'ferry1','The Ferryman: choose the card to bring back from the Lost Pile.',lost.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'ferry1',{})});
PICKH.ferry1=(seat,opt)=>askPick(seat,'ferry2','The Ferryman: choose the card from your hand that goes to the Lost Pile.',G.pl[seat].hand.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'ferry2',{lost:opt.id});
PICKH.ferry2=(seat,opt,d)=>{toLost(opt.id);toHand(seat,d.lost);rmLog(nm(seat)+' swaps '+cname(opt.id)+' for '+cname(d.lost)+' from the Lost Pile (The Ferryman).',seat,[opt.id],'lost','The Ferryman')};
kcact(26,'spring','',seat=>G.road.some(Boolean)&&G.pl[seat].hand.length?[{label:'Crone of Autumn: burn this card, then acquire up to two Kingdom Cards from the Great Road'}]:[],(seat,p,ctx,j)=>{dropKC(seat,j,'hand','burn');now('crone',{seat,n:2})});
AG.crone=d=>{if(d.n<=0||!G.road.some(Boolean)||!G.pl[d.seat].hand.length)return;
  askPick(d.seat,'crone','Crone of Autumn: choose a Kingdom Card from the Great Road to acquire ('+d.n+' left).',G.road.map((kc,i)=>kc?{k:'g'+i,kc,i,label:kname(kc)+': '+KCD(kc).txt}:null).filter(Boolean).concat([{k:'skip',skip:1,label:'Stop'}]),'crone',{n:d.n})};
PICKH.crone=(seat,opt,d)=>{if(opt.skip)return;askPick(seat,'occupier','Choose the card from your hand that will occupy '+kname(opt.kc)+'.',G.pl[seat].hand.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'croneOcc',{kc:opt.kc,i:opt.i,n:d.n})};
PICKH.croneOcc=(seat,opt,d)=>{G.road[d.i]=0;lg(nm(seat)+' acquires '+kname(d.kc)+' (Crone of Autumn).',seat,'big');acquireKC(seat,d.kc,opt.id);now('croneRefill',{});now('crone',{seat,n:d.n-1})};
AG.croneRefill=()=>{refillRoad(0)};
kcact(30,'spring','',seat=>G.pl.some(p=>p.herald>=0)?[0,1,2,3,4,5].map(l=>({id:l,p:{l},label:'Sirens\' Mere: move Heralds to '+locName(l)+' (then discard this card)'})):[],(seat,p,ctx,j)=>{
  dropKC(seat,j,'hand','kdisc');const items=G.pl.filter(q=>q.herald>=0&&q.herald!==p.l).map(q=>({v:q.seat,label:nm(q.seat)+'\'s Herald (at '+locName(q.herald)+')'}));
  if(items.length)askSel(seat,'sirens','Sirens\' Mere: choose which Heralds move to '+locName(p.l)+'.',items,'sirens',{l:p.l},{min:0})});
SELH.sirens=(seat,ch,d)=>{for(const s of ch)G.pl[s].herald=d.l;if(ch.length)lg(nm(seat)+' moves '+ch.length+' Herald'+(ch.length>1?'s':'')+' to '+locName(d.l)+'.',seat)};
kcact(38,'spring','',seat=>G.order.some(s=>G.pl[s].hand.length)?[{label:'Grand Joust: every player secretly plays a card; highest unique Strength claims any Location Reward'}]:[],(seat,p,ctx,j)=>{
  dropKC(seat,j,'hand','kdisc');const seats=G.order.filter(s=>G.pl[s].hand.length);const q=mkq('joust','Grand Joust: choose a card from your hand to play (secret).',seats,true);q.t='simul';q.h='joust';
  for(const s of seats)q.o[s]=G.pl[s].hand.map(id=>({t:'bid',k:'b:'+id,id,label:'Play '+cardLbl(id)}));q.pl={};G.q=q});
SIM.joust={ans(q,seat,opt){q.pl[seat]=opt.id;detach(opt.id);G.limbo.push(opt.id);return true},fin(q){const ids=Object.keys(q.pl).map(s=>q.pl[s]);
    lg('Grand Joust: '+Object.keys(q.pl).map(s=>nm(+s)+' plays '+cname(q.pl[s])+' ('+strOf(q.pl[s])+')').join(', ')+'.');
    const cnt={};for(const id of ids)cnt[strOf(id)]=(cnt[strOf(id)]||0)+1;
    const keep=[];for(const s in q.pl){const id=q.pl[s];if(cnt[strOf(id)]>1){removeFrom(G.limbo,id);G.pl[own(id)].disc.push(id);rmLog(nm(own(id))+'\'s '+cname(id)+' is discarded: another card in the Grand Joust has the same Strength.',own(id),[id],'disc','Grand Joust')}else keep.push(+s)}
    let win=-1;if(keep.length){win=keep.sort((a,b)=>strOf(q.pl[b])-strOf(q.pl[a]))[0]}
    for(const s of keep){const id=q.pl[s];removeFrom(G.limbo,id);G.pl[s].hand.push(id)}
    if(win<0){lg('Grand Joust: every card was discarded; nobody wins.');return}
    lg(nm(win)+' wins the Grand Joust.',win,'big');
    askPick(win,'joustLoc','Grand Joust: choose any Location Reward to claim.',[0,1,2,3,4,5].map(l=>({k:'l'+l,loc:l,label:locName(l)+': '+D.LOCS[l][2]+' Influence'+(D.LOCS[l][3]?' and '+D.LOCS[l][3].replace(/\.$/,''):'')})),'joustLoc',{})}};
PICKH.joustLoc=(seat,opt)=>{now('locReward',{seat,l:opt.loc,noInf:false})};
act('kc47','spring',seat=>{const j=slotOf(seat,47);if(j<0||usedK(seat,'kc47'))return[];return [0,1,2].map(r=>({id:r,p:{r},label:'Broken Gnomon: place it on '+regionName(r)+' and discard its occupier (no Day or Night steps there this Round)'}))},
  (seat,p)=>{useK(seat,'kc47');stat('kc47');const j=slotOf(seat,47),P=G.pl[seat],T=P.ks[j];P.ks[j]=null;kcLeave(seat,47);if(T.occ!=null){P.disc.push(T.occ);rmLog(nm(seat)+'\'s '+cname(T.occ)+' (under Broken Gnomon) goes to the Discard Pile.',seat,[T.occ],'disc','Broken Gnomon')}G.reg[p.r].kc.push({n:47,o:seat});lg(nm(seat)+' places Broken Gnomon on '+regionName(p.r)+': no Day or Night steps there this Round.',seat,'big')});
// Favour (own, Honour Guard, Wax Pretender)
function favModes(seat,step){const o=[];const P=G.pl[seat],hold=G.fav.h===seat&&G.fav.u>0,stepOf=f=>D.FAVOUR[f].step;
  if(stepOf(P.fac)===step){if(hold){const lim=holds(seat,15)?2:1;if((G.used[seat+':fav:own']||0)<lim)o.push({f:P.fac,mode:'own'})}
    else if(holds(seat,15)&&!G.used[seat+':fav:honour'])o.push({f:P.fac,mode:'honour'})}
  if(holds(seat,28)&&!G.used[seat+':fav:wax']){const seen={};for(const s2 of others(seat)){const f=G.pl[s2].fac;if(stepOf(f)===step&&!seen[f]){seen[f]=1;o.push({f,mode:'wax'})}}}
  return o}
for(const step of ['spring','day','autumn'])act('fav:'+step,step,(seat,ctx)=>{if(step==='day'&&!G.clash)return[];return favModes(seat,step).map((m,i)=>({id:m.mode+m.f,p:m,label:'Kingdom\'s Favour'+(m.mode==='own'?'':m.mode==='honour'?' (Honour Guard, without the disc)':' (Wax Pretender, copying the '+D.FSHORT[m.f]+')')+': '+D.FAVOUR[m.f].nm+' - '+D.FAVOUR[m.f].txt}))},
  (seat,p)=>{G.used[seat+':fav:'+p.mode]=(G.used[seat+':fav:'+p.mode]||0)+1;stat('fav:'+p.f);if(p.mode==='honour'||(p.mode==='own'&&holds(seat,15)))stat('kc15');if(p.mode==='wax')stat('kc28');lg(nm(seat)+' uses the Kingdom\'s Favour: '+D.FAVOUR[p.f].nm+' ('+D.FAVOUR[p.f].txt.replace(/\.$/,'')+').',seat,'big',{k:'fav',s:seat,f:p.f});
    if(p.mode==='own'){G.fav.u--;if(G.fav.u<=0){G.fav.h=-1;G.fav.u=3;lg('The Kingdom\'s Favour returns to the Gleaning Meadow.')}}
    favEffect(seat,p.f)});
function favEffect(seat,f){
  if(f==='nobility')askPick(seat,'favNob','Sovereign Mandate: choose one.',[{k:'inf',inf:1,label:'Gain 1 Influence'},{k:'inv',inf:0,label:'Your Heirs gain Invulnerable for the rest of the Round'}],'favNob',{});
  else if(f==='clans'){const c=G.clash;if(!c)return;const l0=2*c.r;askPick(seat,'favClan','Tide-Seer\'s Call: move your Herald to a Location in '+regionName(c.r)+'.',[l0,l0+1].map(l=>({k:'l'+l,loc:l,label:'Move your Herald to '+locName(l)})).concat([{k:'skip',skip:1,label:'Leave your Herald'}]),'favClan',{n:2})}
  else if(f==='uprising')askPick(seat,'favUpr','Watchers in the Wall: choose a Region to look at all its face-down cards.',[0,1,2].map(r=>({k:'r'+r,r,label:'Look at the face-down cards in '+regionName(r)})),'favUpr',{});
  else if(f==='gathering'){const l=G.pl[seat].herald;if(l<0)return;const r=l>>1;const c=G.reg[r].up.filter(id=>own(id)===seat);if(!c.length)return;
    askPick(seat,'favGath','Moon-Herald\'s Boon: move one of your Active cards in '+regionName(r)+' to your hand.',c.map(id=>({k:'c'+id,id,label:cardLbl(id)})).concat([{k:'skip',skip:1,label:'Skip'}]),'favGath',{})}}
PICKH.favNob=(seat,opt)=>{if(opt.inf)gainInf(seat,1,'Sovereign Mandate');else{G.rm.mandate.push(seat);lg(nm(seat)+'\'s Heirs are Invulnerable this Round.',seat)}};
PICKH.favClan=(seat,opt,d)=>{const c=G.clash;if(!opt.skip){G.pl[seat].herald=opt.loc;lg(nm(seat)+' moves their Herald to '+locName(opt.loc)+'.',seat)}now('favClanSup',{seat,n:2})};
AG.favClanSup=d=>{const c=G.clash;if(!c||d.n<=0)return;const o=[];for(let r=0;r<NREG;r++)if(r!==c.r&&G.pl[d.seat].supp.r[r]>0)o.push({k:'r'+r,r,label:'Move a Supporter from '+regionName(r)+' to '+regionName(c.r)});
  if(!o.length)return;o.push({k:'skip',skip:1,label:'Stop'});askPick(d.seat,'favClanSup','Tide-Seer\'s Call: move up to two Supporters from other Regions here ('+d.n+' left).',o,'favClanSup',{n:d.n})};
PICKH.favClanSup=(seat,opt,d)=>{if(opt.skip)return;const c=G.clash;G.pl[seat].supp.r[opt.r]--;G.pl[seat].supp.r[c.r]++;now('favClanSup',{seat,n:d.n-1})};
PICKH.favUpr=(seat,opt)=>{for(const id of G.reg[opt.r].down)if(own(id)!==seat&&!G.peek[seat].includes(id))G.peek[seat].push(id);lg(nm(seat)+' looks at the face-down cards in '+regionName(opt.r)+'.',seat);
  const P=G.pl[seat],o=[];for(let r=0;r<NREG;r++){const mine=G.reg[r].down.find(id=>own(id)===seat);if(mine==null||lockedFor(seat,r))continue;
    for(const T of P.ks)if(T&&T.occ!=null)o.push({k:'o'+r+T.occ,r,mine,with:T.occ,label:'Swap your face-down card in '+regionName(r)+' with '+cname(T.occ)+' (occupying '+kname(T.kc)+')'});
    for(const h of P.hand)o.push({k:'h'+r+h,r,mine,with:h,label:'Swap your face-down card in '+regionName(r)+' with '+cname(h)+' (from your hand)'})}
  if(o.length){o.push({k:'skip',skip:1,label:'Do not swap'});askPick(seat,'favUpr2','Watchers in the Wall: you may swap one of your face-down cards.',o,'favUpr2',{})}};
PICKH.favUpr2=(seat,opt)=>{if(opt.skip)return;const P=G.pl[seat],R=G.reg[opt.r],i=R.down.indexOf(opt.mine);let wasOcc=false;
  for(const T of P.ks)if(T&&T.occ===opt.with){T.occ=opt.mine;wasOcc=true}
  if(!wasOcc)removeFrom(P.hand,opt.with);else{}
  R.down[i]=opt.with;if(!wasOcc)P.hand.push(opt.mine);if(wasOcc){}lg(nm(seat)+' swaps one of their face-down cards.',seat)};
PICKH.favGath=(seat,opt)=>{if(opt.skip)return;toHand(seat,opt.id)};
// ---------------------------------------------------------------- DAY actions: commands
act('cmd:ambush','day',seat=>{const c=G.clash,o=[];if(lockedFor(seat,c.r))return o;
  for(const id of myClash(seat)){const e=eff(id),P=G.pl[seat];const src=cm(id).ambD?P.disc:P.hand;if(!src.length)continue;
    if(e.cm.ambush&&!c.used[id+':amb'])o.push({id:id+'a',p:{card:id,mode:'amb'},label:'Ambush with '+cname(id)+': add a face-down card from your '+(cm(id).ambD?'Discard Pile':'hand')+' to this Clash'});
    if(e.cm.ambret&&!c.used[id+':ar'])o.push({id:id+'r',p:{card:id,mode:'ar'},label:'Ambush (instead of Retreat) with '+cname(id)+': add a face-down card from your hand to this Clash'})}return o},
  (seat,p)=>{const c=G.clash,P=G.pl[seat];c.used[p.card+':'+p.mode]=1;const src=cm(p.card).ambD?P.disc:P.hand;
    askPick(seat,'ambushCard','Ambush: choose the card to add face-down to the Clash.',src.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'ambushCard',{from:p.card})},true);
PICKH.ambushCard=(seat,opt,d)=>{const c=G.clash;detach(opt.id);G.reg[c.r].down.push(opt.id);c.added.push(opt.id);stat('ambush');lg(nm(seat)+' ambushes: a face-down card joins the Clash.',seat,'big')};
act('cmd:retreat','day',seat=>{const c=G.clash,o=[];for(const id of myClash(seat)){const e=eff(id);
    if(e.cm.retreat&&!c.used[id+':ret'])o.push({id:id+'t',p:{card:id,mode:'ret'},label:'Retreat with '+cname(id)+': send cards, Herald or Supporters here back'});
    if(e.cm.ambret&&!c.used[id+':ar'])o.push({id:id+'r',p:{card:id,mode:'ar'},label:'Retreat (instead of Ambush) with '+cname(id)+': send cards, Herald or Supporters here back'})}return o},
  (seat,p)=>{const c=G.clash;c.used[p.card+':'+p.mode]=1;doRetreat(seat,p.card)},true);
function doRetreat(seat,src){const c=G.clash,r=c.r,P=G.pl[seat];const items=G.reg[r].up.filter(id=>own(id)===seat).map(id=>({v:id,label:cardLbl(id)}));
  if(P.herald>=0&&(P.herald>>1)===r)items.push({v:'H',label:'Your Herald (at '+locName(P.herald)+')'});
  if(P.supp.r[r]>0)items.push({v:'S',label:'Your '+P.supp.r[r]+' Supporter'+(P.supp.r[r]>1?'s':'')+' in this Region'});
  askSel(seat,'retreat','Retreat: choose what returns (cards to hand, Herald or Supporters to your board).',items,'retreat',{src},{min:0})}
SELH.retreat=(seat,ch,d)=>{const P=G.pl[seat],c=G.clash;const cards=[];for(const x of ch){if(x==='H'){P.herald=-1}else if(x==='S'){P.supp.b+=P.supp.r[c.r];P.supp.r[c.r]=0}else cards.push(x)}
  for(const id of cards){const m=G.cmod[id];toHand(seat,id);if(m&&m.ret){delete m.ret;now('contraband',{seat,id})}}
  if(ch.length)lg(nm(seat)+' Retreats from '+regionName(c.r)+': '+ch.map(x=>x==='H'?'their Herald goes home':x==='S'?'their Supporters go back to the board':cname(x)+' goes back to their hand').join(', ')+'.',seat,'big',{k:'move',ids:cards.slice(),why:'Retreat',r:c.r});stat('retreat')};
AG.contraband=d=>{if(!G.pl[d.seat].hand.includes(d.id)||eff(d.id).l<1)return;askYN(d.seat,'contraband','Contraband Gap: Journey with '+cname(d.id)+' now?','Journey with it','No','contraband',d)};
PICKH.contraband=(seat,opt,d)=>{if(opt.yes)doJourney(seat,d.id)};
act('cmd:flank','day',seat=>{const c=G.clash,o=[];const dests=[0,1,2].filter(r=>r!==c.r&&!G.reg[r].done&&!lockedFor(seat,r));if(!dests.length)return o;
  for(const id of myClash(seat))if(eff(id).cm.flank&&!c.used[id+':flank'])o.push({id,p:{card:id},label:'Flank with '+cname(id)+': move it to another unresolved Region'});return o},
  (seat,p)=>{const c=G.clash;c.used[p.card+':flank']=1;const dests=[0,1,2].filter(r=>r!==c.r&&!G.reg[r].done&&!lockedFor(seat,r));
    askPick(seat,'flank','Flank: choose the Region '+cname(p.card)+' moves to.',dests.map(r=>({k:'r'+r,r,label:'Move to '+regionName(r)})),'flank',{card:p.card})},true);
PICKH.flank=(seat,opt,d)=>{const c=G.clash,from=c.r;if(holds(seat,39)&&cdef(d.card).ar==='heir')stat('kc39');moveActive(d.card,opt.r);stat('flank');lg(nm(seat)+'\'s '+cname(d.card)+' Flanks from '+regionName(from)+' to '+regionName(opt.r)+' (it fights there instead).',seat,'big',{k:'move',ids:[d.card],why:'Flank',r:from,to:opt.r});
  if(cdef(d.card).fx.includes('flankSupp')&&G.pl[seat].supp.r[from]>0){const k=G.pl[seat].supp.r[from];askPick(seat,'flankSupp','Torchbearer Raiders: move Supporters from '+regionName(from)+' to '+regionName(opt.r)+'?',[...Array(k+1).keys()].map(n=>({k:'n'+n,n,label:n?'Move '+n+' Supporter'+(n>1?'s':''):'Move none'})),'flankSupp',{from,to:opt.r})}};
PICKH.flankSupp=(seat,opt,d)=>{const s=G.pl[seat].supp;s.r[d.from]-=opt.n;s.r[d.to]+=opt.n;if(opt.n)lg(nm(seat)+' moves '+opt.n+' Supporter'+(opt.n>1?'s':'')+' with the Flank.',seat)};
// DAY: tactics
tactic('cln_t2','day',seat=>myClash(seat).filter(id=>['heir','captain','war_machine'].includes(eff(id).ar)).map(id=>({id,p:{card:id},label:'Open Waterways: '+cname(id)+' gains Flank for the Round'})),(seat,p)=>{addGain(p.card,'c','flank','round')});
tactic('upr_t2','day',seat=>myClash(seat).map(id=>({id,p:{card:id},label:'Hideouts: '+cname(id)+' gains Retreat until the end of this Clash'})),(seat,p)=>{addGain(p.card,'c','retreat','clash')});
tactic('gth_t1','day',seat=>{const c=G.clash;return supOn(seat,c.r)>=2&&G.lost.some(id=>own(id)===seat)?[{label:'Doctrine of Starlight: send two of your Supporters here to the Lost Pile, then bring a card back from the Lost Pile'}]:[]},seat=>{const c=G.clash;dropSupp(seat,c.r,2);G.pl[seat].supp.l+=2;
  askPick(seat,'starlight','Doctrine of Starlight: choose a card from the Lost Pile to place here (Active).',G.lost.filter(id=>own(id)===seat).map(id=>({k:'c'+id,id,label:cardLbl(id)})),'starlight',{})});
PICKH.starlight=(seat,opt)=>{const c=G.clash;detach(opt.id);G.reg[c.r].up.push(opt.id);(c.cards[seat]=c.cards[seat]||[]).push(opt.id);lg(nm(seat)+' returns '+cname(opt.id)+' from the Lost Pile to '+regionName(c.r)+'.',seat,'big')};
tactic('gth_t3','day',seat=>{const a=cardsOfSeatActive(seat),o=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const ra=regOf(a[i]),rb=regOf(a[j]);if(ra!==rb&&!lockedFor(seat,ra)&&!lockedFor(seat,rb))o.push({id:a[i]+'x'+a[j],p:{a:a[i],b:a[j]},label:'Beyond the Lamp-Line: swap '+cname(a[i])+' ('+regionName(ra)+') and '+cname(a[j])+' ('+regionName(rb)+')'})}return o},
  (seat,p)=>{const ra=regOf(p.a),rb=regOf(p.b);moveActive(p.a,rb);moveActive(p.b,ra)});
act('hq:cln_hq1','day',seat=>{if(!hqHas(G.pl[seat],'cln_hq1')||usedK(seat,'hq:cln_hq1'))return[];if(!cardsOfSeatActive(seat).some(id=>eff(id).cm.flank))return[];return COUNCILS.map(c=>({id:c,p:{c},label:'Roving Mission: move your Active cards with Flank into the '+councilName(c)}))},
  (seat,p)=>{useK(seat,'hq:cln_hq1');const items=cardsOfSeatActive(seat).filter(id=>eff(id).cm.flank).map(id=>({v:id,label:cardLbl(id)}));askSel(seat,'roving','Roving Mission: choose the cards that go into the '+councilName(p.c)+'.',items,'roving',{c:p.c},{min:0})});
SELH.roving=(seat,ch,d)=>{for(const id of ch)toCouncil(seat,id,d.c);if(ch.length)stat('hq:cln_hq1')};
act('hq:gth_hq','day',seat=>{const P=G.pl[seat];if(!hqHas(P,'gth_hq')||P.gate<1||usedK(seat,'hq:gth_hq'))return[];return myClash(seat).map(id=>({id,p:{card:id},label:'Threshold Gate: give '+cname(id)+' Ambush until the end of the Round'}))},
  (seat,p)=>{useK(seat,'hq:gth_hq');stat('hq:gth_hq');const P=G.pl[seat];P.gate--;addGain(p.card,'c','ambush','round');if(P.gate>=1)askYN(seat,'gate2','Threshold Gate: spend another marker so it Ambushes with a card from your Discard Pile?','Yes (spend a marker)','No','gate2',{card:p.card})});
PICKH.gate2=(seat,opt,d)=>{if(opt.yes){G.pl[seat].gate--;cm(d.card).ambD=true}};
act('card:fang','day',seat=>{const o=[];const lost=G.lost.filter(id=>own(id)===seat);if(!lost.length)return o;for(const id of myClash(seat))if(eff(id).fx.has('fang')&&!usedK(seat,'c:'+id+':fang'))for(const l of lost)o.push({id:id+'x'+l,p:{card:id,l},label:'Rite of the Fang ('+cname(id)+'): burn '+cardLbl(l)+' from your Lost Pile and add its Strength, Traits, Commands and text'});return o},
  (seat,p)=>{useK(seat,'c:'+p.card+':fang');stat('gth_a3');const m=cm(p.card);(m.add=m.add||[]).push(p.l);toBurn(p.l);rmLog(nm(seat)+' burns '+cname(p.l)+' (Rite of the Fang): '+cname(p.card)+' gains its Strength and powers this Round.',seat,[p.l],'burn','Rite of the Fang','big')},true);
// DAY: Kingdom cards
kcact(21,'day','',seat=>others(seat).some(o=>myClash(o).length)?[{label:'Tome of Real Names: reveal your hand and return rivals\' matching cards here to their hands'}]:[],(seat,p,ctx,j)=>{const P=G.pl[seat],c=G.clash;
  lg(nm(seat)+' reveals their hand: '+P.hand.map(cardLbl).join(', ')+'.',seat);const ss=new Set(P.hand.map(id=>cdef(id).s)),aa=new Set(P.hand.map(id=>cdef(id).ar));
  for(const o of others(seat))for(const id of myClash(o).slice())if(ss.has(cdef(id).s)||aa.has(cdef(id).ar)){toHand(o,id);lg(cname(id)+' is returned to '+nm(o)+'\'s hand.',o)}
  dropKC(seat,j,'hand','kdisc')});
kcact(22,'day','',seat=>{const c=G.clash,k=G.pl[seat].supp.r[c.r];if(!k)return[];const o=[];for(let n=1;n<=k;n++){o.push({id:'b'+n,p:{n,to:-1},label:'Dead Lamp: send '+n+' Supporter'+(n>1?'s':'')+' here back to your board'});
    for(let r=0;r<NREG;r++)if(r!==c.r&&!G.reg[r].done)o.push({id:r+'n'+n,p:{n,to:r},label:'Dead Lamp: move '+n+' Supporter'+(n>1?'s':'')+' here to '+regionName(r)})}return o},(seat,p)=>{const c=G.clash,s=G.pl[seat].supp;s.r[c.r]-=p.n;if(p.to<0)s.b+=p.n;else s.r[p.to]+=p.n});
kcact(29,'day','',seat=>G.lost.length?myClash(seat).map(id=>({id,p:{card:id},label:'Mirror of Many Faces: turn '+cname(id)+' into a copy of a card in the Lost Pile'})):[],(seat,p)=>{
  askPick(seat,'mirror','Mirror of Many Faces: choose which Lost Pile card '+cname(p.card)+' copies (its Strength stays).',G.lost.map(id=>({k:'c'+id,id,label:cname(id)+' (Strength '+cdef(id).s+', '+cdef(id).ar+')'})),'mirror',{card:p.card})});
PICKH.mirror=(seat,opt,d)=>{cm(d.card).copy=opt.id;lg(nm(seat)+'\'s '+cname(d.card)+' becomes a copy of '+cname(opt.id)+' for the Round.',seat,'big')};
kcact(40,'day','',seat=>{const o=[],P=G.pl[seat];const tg=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===seat)tg.push(id);for(const T of P.ks)if(T&&T.occ!=null)tg.push(T.occ);
  for(const a of myClash(seat))for(const t of tg)if(!lockedFor(seat,G.clash.r))o.push({id:a+'x'+t,p:{a,t},label:'Concealed Ways: swap '+cname(a)+' (Active here) with '+cname(t)+' (in a Council or occupying a Kingdom Card)'});return o},(seat,p)=>{
  const P=G.pl[seat];const r=regOf(p.a);let found=false;
  for(const c of COUNCILS){const i=G.council[c].indexOf(p.t);if(i>=0){G.council[c][i]=p.a;found=true}}
  if(!found)for(const T of P.ks)if(T&&T.occ===p.t){T.occ=p.a;found=true}
  removeFrom(G.reg[r].up,p.a);removeFrom(G.clash.cards[seat],p.a);G.reg[r].up.push(p.t);if(!G.reg[r].took.includes(p.t))G.clash.cards[seat].push(p.t);leaveActive(p.a);lg(nm(seat)+' swaps '+cname(p.a)+' for '+cname(p.t)+' (Concealed Ways).',seat,'big')});
kcact(44,'day','',seat=>myClash(seat).map(id=>({id,p:{card:id},label:'Contraband Gap: '+cname(id)+' gains Retreat this Clash (and may Journey when it Retreats)'})),(seat,p)=>{addGain(p.card,'c','retreat','clash');cm(p.card).ret=1});
kcact(45,'day','',seat=>myClash(seat).map(id=>({id,p:{card:id},label:'Hunting-Horn: '+cname(id)+' gains Ambush this Clash'})),(seat,p)=>{addGain(p.card,'c','ambush','clash')});
kcact(46,'day','',seat=>[{label:'Blade That Dreamed: +5 Strength in this Clash (discard it and its occupier)'}],(seat,p,ctx,j)=>{G.clash.bonus[seat]=(G.clash.bonus[seat]||0)+5;dropKC(seat,j,'disc','kdisc')});
kcact(50,'day','',seat=>myClash(seat).map(id=>({id,p:{card:id},label:'Dead King\'s Lance: '+cname(id)+' gains Deadly this Clash (discard it and its occupier)'})),(seat,p,ctx,j)=>{addGain(p.card,'c','deadly','clash');dropKC(seat,j,'disc','kdisc')});
kcact(51,'day','',seat=>myClash(seat).map(id=>({id,p:{card:id},label:'Dead King\'s Aegis: '+cname(id)+' gains Invulnerable this Clash (discard it)'})),(seat,p,ctx,j)=>{addGain(p.card,'t','inv','clash');dropKC(seat,j,'hand','kdisc')});
// ---------------------------------------------------------------- AUTUMN actions
function journeySources(seat,wild){const P=G.pl[seat];let ids=P.hand.slice();if(wild||holds(seat,1))ids=ids.concat(cardsOfSeatActive(seat));return ids.filter(id=>eff(id).l>=1)}
function doJourney(seat,id){const e=eff(id),L=e.l,pf=e.tr.has('path');stat('journey');if(regOf(id)>=0&&holds(seat,1))stat('kc1');if(holds(seat,8)&&cdef(id).l===1)stat('kc8');
  if(holds(seat,18)){askPick(seat,'journeyDest','Sky Harbour: where does '+cname(id)+' go after the Journey?',[{k:'norm',deck:0,label:pf?'To your Discard Pile (Pathfinder)':'To the Lost Pile'},{k:'deck',deck:1,label:'To the bottom of your deck'}],'journeyDest',{id,L,pf});return}
  finishJourney(seat,id,L,pf,0)}
PICKH.journeyDest=(seat,opt,d)=>{if(opt.deck)stat('kc18');finishJourney(seat,d.id,d.L,d.pf,opt.deck)};
function finishJourney(seat,id,L,pf,deck){if(pf)stat('pathfinder');if(deck)toDeckBottom(id);else if(pf)toDisc(id);else toLost(id);
  const to=deck?'the bottom of their deck':pf?'their Discard Pile (Pathfinder)':'the Lost Pile';
  if(deck)lg(nm(seat)+' Journeys with '+cname(id)+' and gains '+L+' Lore; the card goes to '+to+'.',seat,'big');else rmLog(nm(seat)+' Journeys with '+cname(id)+' and gains '+L+' Lore; the card goes to '+to+'.',seat,[id],pf?'disc':'lost','Journey','big');
  if(pf&&holds(seat,12)){gainInf(seat,1,'Crystal Warrens','Journey with a Pathfinder');L+=1;stat('kc12')}gainLore(seat,L)}
act('govern','autumn',seat=>{if(usedK(seat,'govern'))return[];const o=[];for(const id of G.pl[seat].hand)if(votesOf(id)>=1)for(const c of COUNCILS)o.push({id:id+c,p:{id,c},label:'Govern: move '+cname(id)+' ('+votesOf(id)+' vote'+(votesOf(id)>1?'s':'')+') into the '+councilName(c)});return o},(seat,p)=>{useK(seat,'govern');toCouncil(seat,p.id,p.c);stat('govern')});
act('journey','autumn',seat=>usedK(seat,'journey')?[]:journeySources(seat,false).map(id=>({id,p:{id},label:'Journey: send '+cname(id)+' away for '+eff(id).l+' Lore'+(eff(id).tr.has('path')?' (Pathfinder: it goes to your Discard Pile)':' (it goes to the Lost Pile)')})),(seat,p)=>{useK(seat,'journey');doJourney(seat,p.id)});
act('cmd:rally','autumn',seat=>{const o=[];for(const id of cardsOfSeatActive(seat)){const e=eff(id),R=e.cm.rally;if(!R||usedK(seat,'a:'+id+':rally'))continue;
    o.push({id,p:{card:id},label:R.self?'Rally (self): '+cname(id)+' returns to your hand':'Rally: return up to '+R.x+' of your Active cards to your hand'})}return o},
  (seat,p)=>{useK(seat,'a:'+p.card+':rally');stat('rally');const R=eff(p.card).cm.rally;
    if(R.self){toHand(seat,p.card);lg(nm(seat)+' Rallies '+cname(p.card)+' to their hand.',seat);return}
    askSel(seat,'rally','Rally: choose up to '+R.x+' of your Active cards to return to your hand.',cardsOfSeatActive(seat).map(id=>({v:id,label:cardLbl(id)})),'rally',{},{min:1,max:R.x})},true);
SELH.rally=(seat,ch)=>{for(const id of ch)toHand(seat,id);lg(nm(seat)+' Rallies '+ch.map(cname).join(' and ')+' to their hand.',seat)};
function deployGen(step){return seat=>{const o=[];for(const id of G.pl[seat].hand){const e=eff(id),D_=e.cm.deploy;if(!D_||usedK(seat,'a:'+id+':deploy:'+step))continue;for(let r=0;r<NREG;r++)o.push({id:id+'r'+r,p:{card:id,r,x:D_.x},label:'Deploy '+cname(id)+' face-up next to '+regionName(r)+' (token'+(D_.x>1?'s':'')+': '+D_.x+')'})}return o}}
function deployRun(step){return (seat,p)=>{if(holds(seat,36)&&['follower','cavalry'].includes(cdef(p.card).ar))stat('kc36');if(step==='spring')stat('kc37');if(holds(seat,41)&&cdef(p.card).ar==='heir')stat('kc41');useK(seat,'a:'+p.card+':deploy:'+step);detach(p.card);G.reg[p.r].up.push(p.card);cm(p.card).tok=p.x;stat('deploy');lg(nm(seat)+' Deploys '+cname(p.card)+' to '+regionName(p.r)+'.',seat,'big')}}
act('cmd:deploy','autumn',deployGen('autumn'),deployRun('autumn'));
act('cmd:deploySpring','spring',seat=>holds(seat,37)?deployGen('spring')(seat):[],deployRun('spring'));
act('council:secrets','autumn',seat=>!usedK(seat,'sec')&&cvotes(seat,'secrets')>0?[{label:'Council of Whispers: place '+cvotes(seat,'secrets')+' marker'+(cvotes(seat,'secrets')>1?'s':'')+' on Locations (4 on one Location claims its reward)'}]:[],seat=>{useK(seat,'sec');stat('councilSecrets');now('secPlace',{seat,n:cvotes(seat,'secrets')})});
AG.secPlace=d=>{if(d.n<=0){const P=G.pl[d.seat];const full=[0,1,2,3,4,5].filter(l=>P.mk[l]>=4);for(const l of full){P.mk[l]=0;lg(nm(d.seat)+' claims '+locName(l)+' with their markers.',d.seat,'big');now('locReward',{seat:d.seat,l,noInf:true})}return}
  const P=G.pl[d.seat];askPick(d.seat,'secPlace','Council of Whispers: place a marker ('+d.n+' left).',[0,1,2,3,4,5].map(l=>({k:'l'+l,loc:l,label:'Marker on '+locName(l)+' (you have '+P.mk[l]+')'})),'secPlace',{n:d.n})};
PICKH.secPlace=(seat,opt,d)=>{G.pl[seat].mk[opt.loc]++;now('secPlace',{seat,n:d.n-1})};
act('council:oaths','autumn',seat=>{if(usedK(seat,'oaths'))return[];const v=cvotes(seat,'oaths');if(v<1)return[];const mx=Math.max(...G.order.map(s=>cvotes(s,'oaths')));const strict=v===mx&&G.order.filter(s=>cvotes(s,'oaths')===mx).length===1;const n=v+(strict?1:0);
    const sp=G.pl[seat].supp;const avail=sp.l+sp.r.reduce((a,b)=>a+b,0)+sp.x.reduce((a,b)=>a+b,0);if(!avail)return[];return [{p:{n},label:'Council of Pledges: return up to '+n+' Supporters from the Map or Lost Pile to your board'}]},
  (seat,p)=>{useK(seat,'oaths');stat('councilOaths');moveSupporters(seat,p.n)});
function moveSupporters(seat,n){const sp=G.pl[seat].supp;let k=n,got=0;
  for(let r=0;r<NREG&&k>0;r++){const a=Math.min(k,sp.x[r]);sp.x[r]-=a;k-=a;got+=a}
  for(let r=0;r<NREG&&k>0;r++){const a=Math.min(k,sp.r[r]);sp.r[r]-=a;k-=a;got+=a}
  {const a=Math.min(k,sp.l);sp.l-=a;k-=a;got+=a}
  sp.b+=got;lg(nm(seat)+' returns '+got+' Supporter'+(got!==1?'s':'')+' to their board.',seat)}
tactic('nob_t4','autumn',seat=>COUNCILS.some(c=>G.council[c].some(id=>own(id)!==seat))||COUNCILS.some(c=>G.council[c].some(id=>own(id)===seat))?COUNCILS.map(c=>({id:c,p:{c},label:'Inquest: discard all rivals\' cards in the '+councilName(c)+', then take your Council cards to the top of your deck for Lore'})):[],(seat,p)=>{
  const rm=G.council[p.c].filter(id=>own(id)!==seat);if(rm.length)leaveCouncil(rm,nm(seat)+'\'s Inquest discards rivals\' cards in the '+councilName(p.c));now('inquest',{seat})});
AG.inquest=d=>{const items=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===d.seat)items.push({v:id,label:cardLbl(id)+' ('+councilName(c)+')'});if(!items.length)return;
  askSel(d.seat,'inquest','Inquest: choose any of your Council cards to move to the top of your deck, in order (first chosen on top). You gain 1 Lore each.',items,'inquest',{},{min:0})};
SELH.inquest=(seat,ch)=>{if(!ch.length)return;placeOrdered(seat,ch,'top',0);gainLore(seat,ch.length,'Inquest')};
tactic('cln_t3','autumn',seat=>{if(holds(seat,5)||!G.pl[seat].hand.length)return[];const o=[];for(const s2 of others(seat))G.pl[s2].ks.forEach((T,j)=>{if(T&&T.occ!=null)o.push({id:s2+'s'+j,p:{s2,j},label:'Riverbank Raiders: take '+kname(T.kc)+' from '+nm(s2)})});return o},(seat,p)=>{
  askPick(seat,'occupier','Riverbank Raiders: choose the card from your hand that will occupy it.',G.pl[seat].hand.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'raiders',p)});
PICKH.raiders=(seat,opt,d)=>{const V=G.pl[d.s2],T=V.ks[d.j];if(!T)return;const kc=T.kc,oc=T.occ;V.ks[d.j]=null;kcLeave(d.s2,kc);toHand(d.s2,oc);stat('steal');lg(nm(seat)+' takes '+kname(kc)+' from '+nm(d.s2)+' (Riverbank Raiders).',seat,'big');
  const crew=G.pl.findIndex((p,i)=>holds(i,9));if(kc===9){stat('kc9');gainInf(seat,1,'Cutthroat Crew stolen')}else if(crew>=0){stat('kc9');gainInf(crew,1,'Cutthroat Crew: a Kingdom Card was stolen')}acquireKC(seat,kc,opt.id,{stolen:true})};
tactic('cln_t4','autumn',seat=>{const P=G.pl[seat];return P.hand.length<P.hs&&cardsOfSeatActive(seat).concat(P.disc).length?[{label:'Brine-Hardened: return Active and/or Discard Pile cards to your hand'}]:[]},seat=>{const P=G.pl[seat];
  askSel(seat,'brine','Brine-Hardened: choose cards from your Active cards and Discard Pile to return to your hand (up to '+(P.hs-P.hand.length)+').',cardsOfSeatActive(seat).map(id=>({v:id,label:cardLbl(id)+' (Active)'})).concat(P.disc.map(id=>({v:id,label:cardLbl(id)+' (Discard Pile)'}))),'brine',{},{min:0,max:P.hs-P.hand.length})});
SELH.brine=(seat,ch)=>{for(const id of ch)toHand(seat,id);if(ch.length)lg(nm(seat)+' returns '+ch.length+' card'+(ch.length>1?'s':'')+' to their hand (Brine-Hardened).',seat)};
tactic('gth_t4','autumn',seat=>{const P=G.pl[seat];return cardsOfSeatActive(seat).concat(P.disc).length?[{label:'Offering: send Active/Discard cards to the Lost Pile for Lore'}]:[]},seat=>{const P=G.pl[seat];
  askSel(seat,'offering','Offering: choose up to three Active and/or Discard Pile cards to move to the Lost Pile (1 Lore each).',cardsOfSeatActive(seat).map(id=>({v:id,label:cardLbl(id)+' (Active)'})).concat(P.disc.map(id=>({v:id,label:cardLbl(id)+' (Discard Pile)'}))),'offering',{},{min:0,max:3})});
SELH.offering=(seat,ch)=>{for(const id of ch)toLost(id);if(ch.length){rmLog(nm(seat)+' sends '+ch.map(cname).join(', ')+' to the Lost Pile (Offering).',seat,ch,'lost','Offering');gainLore(seat,ch.length,'Offering')}
  const P=G.pl[seat];if(P.disc.length&&P.hand.length<P.hs)now('offering2',{seat})};
AG.offering2=d=>{const P=G.pl[d.seat];if(!P.disc.length||P.hand.length>=P.hs)return;askPick(d.seat,'offering2','Offering: you may move a card from your Discard Pile to your hand.',P.disc.map(id=>({k:'c'+id,id,label:cardLbl(id)})).concat([{k:'skip',skip:1,label:'Skip'}]),'offering2',{})};
PICKH.offering2=(seat,opt)=>{if(!opt.skip)toHand(seat,opt.id)};
act('hq:nob_hq','autumn',seat=>{const P=G.pl[seat];if(!hqHas(P,'nob_hq')||usedK(seat,'hq:nob_hq'))return[];const caps=P.disc.filter(id=>eff(id).ar==='captain');const both=pos(seat)>0;const o=[];
    o.push({id:'inf',p:{cap:-1,inf:1},label:'Counting House: gain 1 Influence'});for(const c of caps){o.push({id:'c'+c,p:{cap:c,inf:0},label:'Counting House: move '+cardLbl(c)+' from your Discard Pile to your hand'});if(both)o.push({id:'b'+c,p:{cap:c,inf:1},label:'Counting House: move '+cardLbl(c)+' to your hand AND gain 1 Influence'})}return o},
  (seat,p)=>{useK(seat,'hq:nob_hq');stat('hq:nob_hq');if(p.cap>=0)toHand(seat,p.cap);if(p.inf)gainInf(seat,1,'Counting House')});
act('hq:upr_hq1','autumn',seat=>{const P=G.pl[seat];if(!hqHas(P,'upr_hq1')||usedK(seat,'hq:upr_hq1')||P.ks[2])return[];const caps=P.hand.filter(id=>['captain','champion'].includes(eff(id).ar));if(!caps.length)return[];
    return G.road.map((kc,i)=>kc&&KCD(kc).place==='board'?{id:'g'+i,p:{i,kc},label:'Smugglers\' Hollow: acquire '+kname(kc)+' from the Great Road with a Captain or Champion from your hand'}:null).filter(Boolean)},
  (seat,p)=>{useK(seat,'hq:upr_hq1');const caps=G.pl[seat].hand.filter(id=>['captain','champion'].includes(eff(id).ar));
    askPick(seat,'occupier','Smugglers\' Hollow: choose the Captain or Champion that occupies '+kname(p.kc)+'.',caps.map(id=>({k:'c'+id,id,label:cardLbl(id)})),'hollow',p)});
PICKH.hollow=(seat,opt,d)=>{G.road[d.i]=0;lg(nm(seat)+' acquires '+kname(d.kc)+' through Smugglers\' Hollow.',seat,'big');acquireKC(seat,d.kc,opt.id,{slot:2});now('croneRefill',{})};
act('card:hallseats','autumn',seat=>{const o=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===seat&&eff(id).fx.has('hallseats')&&!usedK(seat,'c:'+id+':hall'))for(const c2 of COUNCILS)if(c2!==c)o.push({id:id+c2,p:{id,c:c2},label:'Hall of Seats: move it from the '+councilName(c)+' to the '+councilName(c2)});return o},(seat,p)=>{useK(seat,'c:'+p.id+':hall');stat('nob_a2');toCouncil(seat,p.id,p.c)});
act('card:rampart','autumn',seat=>{const o=[];for(const id of cardsOfSeatActive(seat))if(eff(id).fx.has('rampart')&&!usedK(seat,'c:'+id+':ramp')&&supOn(seat,regOf(id))>=2)o.push({id,p:{id},label:'Ivory Rampart: place an Influence token on it (stays Active through Winter)'});return o},(seat,p)=>{useK(seat,'c:'+p.id+':ramp');stat('nob_a4');cm(p.id).tok=(cm(p.id).tok||0)+1});
act('card:whisperer','autumn',seat=>{const o=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===seat&&eff(id).fx.has('whisperer')&&!usedK(seat,'c:'+id+':wh'))for(const c2 of COUNCILS)o.push({id:id+c2,p:{id,c:c2},label:'Whisperer of Names: place a marker on the '+councilName(c2)});return o},(seat,p)=>{useK(seat,'c:'+p.id+':wh');stat('gth_a2');G.cmk[p.c][seat][1]++});
act('kc10','autumn',seat=>{const o=[];if(usedK(seat,'kc10'))return o;for(let r=0;r<NREG;r++)if(G.reg[r].kc.some(k=>k.n===10&&k.o===seat))for(const id of G.reg[r].up)if(own(id)===seat&&votesOf(id)>=1)for(const c of COUNCILS)o.push({id:id+c,p:{id,c},label:'Shadow Assembly: Govern with '+cname(id)+' (Active in '+regionName(r)+') into the '+councilName(c)});return o},(seat,p)=>{useK(seat,'kc10');stat('kc10');toCouncil(seat,p.id,p.c)});
kcact(16,'autumn','',seat=>{const o=[];for(const c of COUNCILS)for(const id of G.council[c])if(own(id)===seat)o.push({id,p:{id},label:'Derelict Manor: discard '+cname(id)+' from the '+councilName(c)+' to raise your hand size by 1 (then discard this card)'});return G.pl[seat].hs>=8?[]:o},(seat,p,ctx,j)=>{leaveCouncil([p.id],'traded for +1 hand size with Derelict Manor');setHS(seat,G.pl[seat].hs+1);dropKC(seat,j,'hand','kdisc')});
kcact(24,'autumn','',seat=>{const o=[];for(const id of cardsOfSeatActive(seat))for(const c of COUNCILS)o.push({id:id+c,p:{id,c},label:'Chamberlain\'s Ledger: move '+cname(id)+' into the '+councilName(c)+', then discard any cards there'});return o},(seat,p,ctx,j)=>{toCouncil(seat,p.id,p.c);dropKC(seat,j,'hand','kdisc');
  const items=G.council[p.c].filter(x=>x!==p.id).map(x=>({v:x,label:cardLbl(x)+' ('+nm(own(x))+')'}));if(items.length)askSel(seat,'ledger','Chamberlain\'s Ledger: discard any cards in the '+councilName(p.c)+'.',items,'ledger',{},{min:0})});
SELH.ledger=(seat,ch)=>{if(ch.length)leaveCouncil(ch,nm(seat)+'\'s Chamberlain\'s Ledger')};
kcact(31,'autumn','',seat=>{const l=G.lost.filter(id=>own(id)===seat);return l.length?[{id:'t',p:{top:1},label:'Dawn-Blue Chime: put all your Lost Pile cards on top of your deck (then discard this card)'},{id:'b',p:{top:0},label:'Dawn-Blue Chime: put all your Lost Pile cards at the bottom of your deck (then discard this card)'}]:[]},(seat,p,ctx,j)=>{
  const l=G.lost.filter(id=>own(id)===seat);dropKC(seat,j,'hand','kdisc');orderThen(seat,l,p.top?'top':'bottom',0)});
kcact(32,'autumn','',seat=>cardsOfSeatActive(seat).map(id=>({id,p:{id},label:'Rusted Colossus: return '+cname(id)+' to your hand'})),(seat,p)=>{toHand(seat,p.id)});
kcact(36,'autumn','',seat=>{const P=G.pl[seat];return P.hand.length<P.hs?P.disc.filter(id=>eff(id).ar==='follower').map(id=>({id,p:{id},label:'Village Muster: move '+cardLbl(id)+' from your Discard Pile to your hand'})):[]},(seat,p)=>{toHand(seat,p.id)});
kcact(37,'autumn','',seat=>cardsOfSeatActive(seat).filter(id=>eff(id).cm.deploy).map(id=>({id,p:{id},label:'Siege Workshop: place an Influence token on '+cname(id)+' (keeps it Active through Winter)'})),(seat,p)=>{cm(p.id).tok=(cm(p.id).tok||0)+1});
kcact(42,'autumn','',seat=>{const sp=G.pl[seat].supp;return sp.l+sp.r.reduce((a,b)=>a+b,0)+sp.x.reduce((a,b)=>a+b,0)>0?[{label:'Rally Standard: return up to two Supporters from the Map or Lost Pile to your board'}]:[]},seat=>moveSupporters(seat,2));
kcact(48,'autumn','',seat=>G.pl[seat].tac.map((t,i)=>t.ex&&!t.burn?{id:i,p:{i},label:'Oddment Band: make '+D.TACTICS[G.pl[seat].fac][i].nm+' Unexhausted again (discard this card and its occupier)'}:null).filter(Boolean),(seat,p,ctx,j)=>{
  const t=G.pl[seat].tac[p.i];t.ex=false;t.mk=D.TACTICS[G.pl[seat].fac][p.i].mk;G.used[seat+':t:'+D.TACTICS[G.pl[seat].fac][p.i].id]=0;dropKC(seat,j,'disc','kdisc')});
// ---------------------------------------------------------------- winter and game end
AG.winter=()=>{G.phase='winter';G.step='effects';
  for(let r=0;r<NREG;r++){const keep=[];for(const k of G.reg[r].kc){if(k.n===43||k.n===47||k.n===49){G.kdisc.push(k.n);lg(kname(k.n)+' is discarded in Winter.')}else keep.push(k)}G.reg[r].kc=keep}
  now('cleanup')};
AG.cleanup=()=>{G.step='cleanup';
  for(const P of G.pl){P.herald=-1;const sp=P.supp;
    if(G.rm.masonry.includes(P.seat)){for(let r=0;r<NREG;r++){sp.r[r]+=sp.x[r];sp.x[r]=0}}
    else{let n=0;for(let r=0;r<NREG;r++){n+=sp.r[r]+sp.x[r];sp.l+=sp.r[r]+sp.x[r];sp.r[r]=0;sp.x[r]=0}if(n)lg('Winter: '+nm(P.seat)+'\'s '+n+' Supporter'+(n>1?'s':'')+' on the map go'+(n>1?'':'es')+' to the Lost Pile ('+sp.b+' left on their board).',P.seat,'',{k:'supp',s:P.seat,n})}}
  G.cord=[];const gone={};
  for(let r=0;r<NREG;r++)for(const id of G.reg[r].up.slice()){const m=G.cmod[id];if(m&&m.tok>0){m.tok--;stat('tokenDecay')}else{G.reg[r].up.splice(G.reg[r].up.indexOf(id),1);G.pl[own(id)].disc.push(id);(gone[own(id)]=gone[own(id)]||[]).push(id)}}
  for(const s in gone)rmLog('Winter: '+nm(+s)+'\'s played cards go to their Discard Pile ('+gone[s].map(cname).join(', ')+').',+s,gone[s],'disc','Winter');
  for(const id in G.cmod){const m=G.cmod[id];delete m.gc;delete m.gt;delete m.copy;delete m.add;delete m.ambD;delete m.ret;if(!m.tok)delete G.cmod[id]}
  for(const s in G.peek)G.peek[s]=[];
  G.rm=newRM();G.used={};G.clash=null;
  if(G.round>=G.rounds)endGame();else later('roundStart')};
function ranking(){const idx=s=>pos(s);return G.pl.map(p=>p.seat).sort((a,b)=>G.pl[b].inf-G.pl[a].inf||((G.fav.h===b)-(G.fav.h===a))||idx(a)-idx(b))}
function endGame(){const bonus={};for(const P of G.pl){if(P.site.length===0&&P.lore>=2){const b=Math.floor(P.lore/2);P.inf+=b;bonus[P.seat]=b;stat('loreToInfluence');book(P.seat,'Leftover Lore (empty Site of Power)',b);lg(nm(P.seat)+' has emptied their Site of Power: '+P.lore+' Lore becomes '+b+' Influence.',P.seat,'big',{k:'inf',s:P.seat,n:b,why:'Leftover Lore (empty Site of Power)'})}}
  const rk=ranking();G.over={winner:rk[0],ranking:rk,scores:G.pl.map(p=>p.inf),bonus,tieBreak:null};
  const top=G.pl[rk[0]].inf,tied=rk.filter(s=>G.pl[s].inf===top);if(tied.length>1)G.over.tieBreak=(G.fav.h>=0&&tied.includes(G.fav.h))?'favour':'order';
  G.phase='over';G.step='';G.q=null;G.ag=[];lg('The game ends. '+nm(rk[0])+' ('+FN(rk[0])+') wins with '+top+' Influence.',rk[0],'big')}
TB.scores=Gx=>{G=Gx;return Gx.pl.map(p=>({seat:p.seat,name:p.name,faction:p.fac,inf:p.inf,lore:p.lore,rank:ranking().indexOf(p.seat)+1}))};
// ---------------------------------------------------------------- hidden information
const hide=id=>-(own(id)+1);
TB.stripView=function(Gx,seat){const V=clone(Gx);V.me=seat;delete V.rng;V.seed=0;V.ag=[];V.agI=0;
  const hid=(id)=>id<0?id:hide(id);
  for(const p of V.pl){if(p.seat!==seat){p.hand=p.hand.map(hide);p.deck=p.deck.map(hide);if(p.bid!=null&&!Gx.bidRev)p.bid=hide(p.bid);p.peek=undefined}else{p.deck=p.deck.slice().sort((a,b)=>a-b)}}
  const seen=new Set(Gx.peek[seat]||[]);
  for(const R of V.reg)R.down=R.down.map(id=>own(id)===seat||seen.has(id)?id:hide(id));
  V.kdeck=V.kdeck.map(()=>0);V.limbo=V.limbo.map(id=>own(id)===seat?id:hide(id));
  V.peek={[seat]:(V.peek[seat]||[]).slice()};
  if(V.clash)V.clash.added=V.clash.added.map(id=>own(id)===seat?id:hide(id));
  for(const id in V.cmod){const k=+id;const hiddenCard=V.pl[own(k)].hand.includes(k)&&own(k)!==seat||V.pl[own(k)].deck.includes(k)&&own(k)!==seat;if(hiddenCard)delete V.cmod[id]}
  if(V.q){const q=V.q;if(!q.seats.includes(seat)){q.o={};q.ctx={};q.items=q.items?[]:undefined;q.chosen=q.chosen?[]:undefined;q.budget=undefined}else{for(const s in q.o)if(+s!==seat)delete q.o[s]}
    if(q.pl){const np={};for(const s in q.pl)np[s]=+s===seat?q.pl[s]:hide(q.pl[s]);q.pl=np}q.got={};if(q.st){const st={};if(q.st[seat])st[seat]=q.st[seat];q.st=st}
    if(q.simul){q.ctx={}}}
  return V};
TB.view=TB.stripView;
// scramble everything `seat` may not see (used by hidden-test): other hands, all deck orders, face-down others' cards, bids before reveal, rng
TB.poison=function(Gx,seat,rngf){const P=clone(Gx);const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rngf()*(i+1));const x=a[i];a[i]=a[j];a[j]=x}return a};
  const seen=new Set(Gx.peek[seat]||[]);const map={};
  // pool per owner of hidden faction cards: other hands, other decks, others' unrevealed bids, others' unseen face-down cards and secret Joust cards
  for(let o=0;o<P.np;o++){if(o===seat)continue;const pool=[];const slots=[];
    const pl=P.pl[o];for(let i=0;i<pl.hand.length;i++){pool.push(pl.hand[i]);slots.push(['hand',i])}for(let i=0;i<pl.deck.length;i++){pool.push(pl.deck[i]);slots.push(['deck',i])}
    if(pl.bid!=null&&!P.bidRev){pool.push(pl.bid);slots.push(['bid',0])}
    for(let r=0;r<NREG;r++)for(let i=0;i<P.reg[r].down.length;i++){const id=P.reg[r].down[i];if(own(id)===o&&!seen.has(id)){pool.push(id);slots.push(['down',r,i])}}
    for(let i=0;i<P.limbo.length;i++){const id=P.limbo[i];if(own(id)===o){pool.push(id);slots.push(['limbo',i])}}
    const olds=pool.slice();pool.sort((a,b)=>a-b);sh(pool);let k=0;
    for(const sl of slots){const id=pool[k];map[olds[k]]=id;k++;if(sl[0]==='hand')pl.hand[sl[1]]=id;else if(sl[0]==='deck')pl.deck[sl[1]]=id;else if(sl[0]==='bid')pl.bid=id;else if(sl[0]==='limbo')P.limbo[sl[1]]=id;else P.reg[sl[1]].down[sl[2]]=id}}
  if(P.clash)P.clash.added=P.clash.added.map(id=>map[id]!=null?map[id]:id);
  if(P.q&&P.q.pl)for(const s in P.q.pl)if(map[P.q.pl[s]]!=null)P.q.pl[s]=map[P.q.pl[s]];
  // own deck order is not known either
  P.pl[seat].deck.sort((a,b)=>a-b);sh(P.pl[seat].deck);
  const keepTop=holdsDK(Gx,seat)&&Gx.q&&Gx.q.kind==='bidRes'&&Gx.q.seats.includes(seat)?2:0;const top=P.kdeck.slice(0,keepTop),rest=sh(P.kdeck.slice(keepTop).sort((a,b)=>a-b));P.kdeck=top.concat(rest);
  P.rng=(rngf()*4294967296)|0;P.seed=(rngf()*4294967296)>>>0;
  if(P.q&&P.q.simul)for(const s in P.q.got)if(+s!==seat)delete P.q.got[s];
  return P};
function holdsDK(Gx,s){return Gx.pl[s].sup.includes(34)}
// ---------------------------------------------------------------- invariants (used by tests)
TB.invariants=function(Gx){const E=[];G=Gx;const np=Gx.np;
  const seen={};const put=(id,w)=>{if(seen[id]!=null)E.push('card '+id+' in two places: '+seen[id]+' and '+w);else seen[id]=w};
  for(const P of Gx.pl){const s=P.seat;for(const k of ['hand','deck','disc','site','hq'])for(const id of P[k]){if(own(id)!==s)E.push('card '+id+' in wrong player zone '+k);put(id,s+k)}
    P.ks.forEach((T,j)=>{if(T&&T.occ!=null)put(T.occ,s+'occ'+j)});if(P.bid!=null)put(P.bid,s+'bid')}
  for(let r=0;r<NREG;r++){for(const id of Gx.reg[r].up)put(id,'up'+r);for(const id of Gx.reg[r].down)put(id,'down'+r)}
  for(const c of COUNCILS)for(const id of Gx.council[c])put(id,'council'+c);for(const id of Gx.lost)put(id,'lost');for(const id of Gx.burned)put(id,'burned');for(const id of Gx.limbo)put(id,'limbo');
  for(const P of Gx.pl)for(let k=0;k<19;k++)if(seen[P.seat*100+k]==null)E.push('card '+(P.seat*100+k)+' is nowhere');
  const kseen={};const kput=(n,w)=>{if(kseen[n])E.push('KC '+n+' twice: '+kseen[n]+' and '+w);else kseen[n]=w};
  for(const n of Gx.kdeck)kput(n,'deck');for(const n of Gx.klimbo)kput(n,'limbo');for(const n of Gx.road)if(n)kput(n,'road');for(const n of Gx.kdisc)kput(n,'disc');for(const n of Gx.kburn)kput(n,'burn');
  for(const P of Gx.pl){P.ks.forEach((T,j)=>{if(T)kput(T.kc,P.seat+'slot'+j)});for(const n of P.sup)kput(n,P.seat+'sup')}
  for(const R of Gx.reg)for(const k of R.kc)kput(k.n,'region');for(const L of Gx.loc)for(const k of L.kc)kput(k.n,'loc');
  for(let n=1;n<=51;n++)if(!kseen[n])E.push('KC '+n+' is nowhere');
  const q=Gx.q;const pendingDiscard=(Gx.ag.some(x=>x.h==='enforceHand'))||(q&&q.kind==='discardDown');
  for(const P of Gx.pl){if(P.hs<3||P.hs>8)E.push('hand size '+P.hs+' out of range for '+P.seat);if(P.hand.length>P.hs&&!pendingDiscard)E.push('hand over limit '+P.seat+': '+P.hand.length+'>'+P.hs);
    if(P.inf<0||P.lore<0)E.push('negative tokens '+P.seat);const sp=P.supp;const tot=sp.b+sp.l+sp.r.reduce((a,b)=>a+b,0)+sp.x.reduce((a,b)=>a+b,0);if(tot!==5)E.push('supporters '+P.seat+' total '+tot);
    if(sp.b<0||sp.l<0||sp.r.some(x=>x<0)||sp.x.some(x=>x<0))E.push('negative supporters');
    if(P.herald<-1||P.herald>5)E.push('bad herald');if(P.ks[2]&&!hqHas(P,'upr_hq1'))E.push('hollow slot without HQ');if(P.gate<0)E.push('gate<0');
    P.tac.forEach(t=>{if(t.mk<0)E.push('tactic markers<0')});for(let l=0;l<6;l++)if(P.mk[l]<0)E.push('mk<0');
    const all=P.site.length+P.hq.length+P.hand.length+P.deck.length+P.disc.length;void all}
  for(const id in Gx.cmod)if((Gx.cmod[id].tok||0)<0)E.push('tok<0');
  for(const c of COUNCILS)for(let s=0;s<np;s++){const m=Gx.cmk[c][s];if(m[0]<0||m[1]<0||m[0]>2&&false)E.push('council marker')}
  if(Gx.road.length!==4)E.push('road size');
  if(Gx.fav.u<1||Gx.fav.u>3)E.push('favour uses');
  return E};
// ---------------------------------------------------------------- UI helpers
TB.cardInfo=function(Gx,id){G=Gx;if(id<0)return {hidden:true,owner:-id-1};const e=eff(id),d=cdef(id);return {id,name:cname(id),owner:own(id),kind:d.kind,strength:e.s,archetype:e.ar,traits:[...e.tr],commands:Object.keys(e.cm),votes:e.v,lore:e.l,cost:d.lc,text:d.txt,tokens:(Gx.cmod[id]&&Gx.cmod[id].tok)||0}};
// what the Night step and the tally would give if nothing else happened (pure: works on a copy; a stripped view is enough because Clash cards are face up)
TB.clashPreview=function(Gx){if(!Gx||!Gx.clash)return null;const keep=G;const S=clone(Gx);G=S;try{const c=S.clash;const all=[];for(const s of c.parts)for(const id of (c.cards[s]||[]))if(id>=0)all.push(id);
    const dead=[],saved=[];if(!c.skip){const E=nightMarks(all);for(const id of all){if(!E[id])continue;const W=elimWhy(id,E[id]);if(eff(id).tr.has('inv'))saved.push({id,t:W.t,by:W.by});else dead.push({id,t:W.t,why:W.why,by:W.by,res:eff(id).tr.has('res')})}}
    for(const d of dead)for(const s in c.cards)removeFrom(c.cards[s],d.id);
    const tot={},brk={};for(const s of c.parts){brk[s]=[];tot[s]=clashStrength(s,brk[s])}
    const watcher=c.parts.some(s=>(c.cards[s]||[]).some(id=>id>=0&&eff(id).fx.has('watcher')));let win;
    if(watcher){const p=c.parts.filter(s=>tot[s]>0);const b=p.length?Math.min(...p.map(s=>tot[s])):0;win=p.length?p.filter(s=>tot[s]===b):c.parts.slice()}else{const b=Math.max(...c.parts.map(s=>tot[s]));win=c.parts.filter(s=>tot[s]===b)}
    return {r:c.r,dead,saved,tot,brk,win,watcher,hidden:(S.reg[c.r].down||[]).filter(id=>id<0).length,skip:!!c.skip}}
  finally{G=keep}};
TB.kingdomInfo=n=>{const k=KCD(n);return {n,name:k.nm,suit:k.suit,text:k.txt,place:k.place}};
TB.votes=(Gx,seat,c)=>{G=Gx;return cvotes(seat,c)};
TB.cardName=(Gx,id)=>{G=Gx;return cname(id)};
TB.order=Gx=>Gx.order.slice();
TB.winner=Gx=>Gx.over?Gx.over.winner:-1;
TB.test={
  // put a faction card into a zone. zone: hand|deck|disc|lost|burned|site|hq|up|down|council|occ. arg: region (up/down), council name, or [seat,slot] (occ)
  put(Gx,id,zone,arg){G=Gx;detach(id);const sd=own(id),P=Gx.pl[sd];
    if(zone==='hand')P.hand.push(id);else if(zone==='deck')P.deck.unshift(id);else if(zone==='disc')P.disc.push(id);else if(zone==='lost')Gx.lost.push(id);else if(zone==='burned')Gx.burned.push(id);
    else if(zone==='site')P.site.push(id);else if(zone==='hq')P.hq.push(id);else if(zone==='up')Gx.reg[arg].up.push(id);else if(zone==='down')Gx.reg[arg].down.push(id);else if(zone==='council')Gx.council[arg].push(id);
    else if(zone==='occ'){const T=Gx.pl[arg[0]].ks[arg[1]];T.occ=id}else throw new Error('zone '+zone)},
  kcRemove(Gx,n){removeFrom(Gx.kdeck,n);removeFrom(Gx.kdisc,n);removeFrom(Gx.kburn,n);removeFrom(Gx.klimbo,n);const i=Gx.road.indexOf(n);if(i>=0)Gx.road[i]=0;
    for(const P of Gx.pl){P.ks.forEach((T,j)=>{if(T&&T.kc===n){if(T.occ!=null)P.disc.push(T.occ);P.ks[j]=null}});removeFrom(P.sup,n)}for(const R of Gx.reg)R.kc=R.kc.filter(k=>k.n!==n);for(const L of Gx.loc)L.kc=L.kc.filter(k=>k.n!==n)},
  giveKC(Gx,seat,n,occ,slot){this.kcRemove(Gx,n);G=Gx;const P=Gx.pl[seat];slot=slot==null?(P.ks[0]?1:0):slot;if(P.ks[slot]){Gx.kdisc.push(P.ks[slot].kc);if(P.ks[slot].occ!=null)P.hand.push(P.ks[slot].occ)}
    if(occ==null)occ=P.hand[0];detach(occ);P.ks[slot]={kc:n,occ};if(n===17)setHS(seat,P.hs+1)},
  road(Gx,i,n){this.kcRemove(Gx,n);if(Gx.road[i])Gx.kdisc.push(Gx.road[i]);Gx.road[i]=n},
  // run agenda steps from here: steps = [[handler,data],...]
  run(Gx,steps){G=Gx;Gx.q=null;Gx.ag=steps.map(x=>({h:x[0],d:x[1]||{}}));Gx.agI=0;flow()},
  flowNow(Gx){G=Gx;flow()},
  // re-queue the whole current Round (Spring bids onward) after a scene has been edited
  restart(Gx){G=Gx;Gx.q=null;Gx.ag=[];Gx.agI=0;Gx.used={};Gx.rm=newRM();Gx.bidRev=false;Gx.taken=false;
    for(const R of Gx.reg){R.took=[];R.done=false;R.n=0}later('bidPlace');later('bidReveal');later('bidOrder');later('bidNext');later('bidEnd');later('heralds',{i:0});later('placeCards');later('menus',{step:'spring',i:0});later('clashOrder');later('regionLoop',{i:0});later('menus',{step:'autumn',i:0});later('winter');flow()},
  // answer the pending question of a seat with the first move whose key (or predicate) matches
  answer(Gx,seat,m){const mv=TB.moves(Gx,seat);const f=typeof m==='function'?mv.find(m):mv.find(x=>x.k===m||x.label===m||(x.t===m));if(!f)throw new Error('no such move for seat '+seat+': '+m+' among '+mv.map(x=>x.k).join(','));const r=TB.apply(Gx,f);if(!r.ok)throw new Error('apply failed: '+r.err+(r.stack?'\n'+r.stack:''));return f},
  info:{eff:id=>eff(id),cdef:id=>cdef(id),cname:id=>cname(id)}
};
TB.ACT=ACT;TB.internal={eff:id=>eff(id),setG,cdef,cname,own,rnd,shuffle,clone,detach,toHand,gainInf,gainLore,AG,PICKH,SELH,flow,now,later,holds,cvotes,regOf,strOf,locName,regionName,kname,KCD,bidOpts,acquireKC,placeOnSlot,dropKC,askPick,askSel,refillRoad,toCouncil,toLost,toDisc,toBurn,leaveCouncil,doJourney,moveSupporters,slotOf,newRM,get G(){return G}};
if(typeof module!=="undefined")module.exports=TB;
})(typeof globalThis!=="undefined"?globalThis:this);
