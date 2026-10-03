// ===================== The Thornbound Throne: computer players =====================
// Three levels, one rule: a computer seat decides only from what its seat may know. Every decision first builds a "world" with TB.poison():
// a copy of the game in which everything the seat cannot see (rivals' hands, every deck order, face-down cards it has not peeked at, unrevealed
// bids, the RNG) is replaced by a random arrangement consistent with the seat's view. Heuristics below read only the seat's own cards and
// public information, so their result does not depend on which hidden world was drawn; the hard level uses the sampled worlds on purpose.
//   easy   : plays the heuristics 55% of the time, otherwise a random legal move; never plans ahead.
//   normal : the heuristics (region values, Kingdom Card values, ambush/retreat/flank logic, Govern/Journey economy, Herald placement).
//   hard   : heuristics plus determinised rollouts: for the big hidden-information decisions (bid, face-down cards, Herald, clash order, tied
//            Clash, Day actions, Great Road choice) it samples worlds consistent with its view, plays each candidate to the end of the round
//            with the normal policy for everybody, and keeps the best average result. Time-boxed (default 220 ms per decision).
// API: TB.AI.choose(G,seat,level) -> a move from TB.moves(G,seat);  TB.AI.step(G) plays every pending computer seat once;
//      TB.AI.run(G,{maxSteps,stopFor:[humanSeats]}) plays until a human decision (or the end).
(function(g){const TB=g.TB,D=TB.DATA;const AI=TB.AI={};
const own=id=>(id/100)|0;const NREG=3;
// ---------------------------------------------------------------- small utils
function mkRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function hashStr(h,x){h=Math.imul(h^(x|0),2246822519)>>>0;h^=h>>>13;return h>>>0}
function viewSeed(G,seat,salt){let h=0x9e3779b9^(salt||0);h=hashStr(h,seat);h=hashStr(h,G.round);h=hashStr(h,G.logN);h=hashStr(h,G.q?G.q.kind.length*31+G.q.title.length:0);h=hashStr(h,G.pl[seat].inf);for(const id of G.pl[seat].hand)h=hashStr(h,id+1);for(const s of G.pl)h=hashStr(h,s.inf*7+s.lore);return h}
const cd=(S,id)=>{const k=id%100;return k<14?D.BASIC[k]:D.SITE[S.pl[own(id)].fac][k-14]};
const nameOf=(S,id)=>TB.cardName(S,id);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sum=a=>a.reduce((x,y)=>x+y,0);
const LOCV=[1.5,1.5,1.7,2.2,1.2,1.3];            // rough worth of claiming each Location (influence + its text)
const LOCINF=[1,1,1,2,1,1];
// Kingdom Card values (0-8) as a computer sees them
const KCV=[0,4,4,3,5,7,3,4,3,4,3,4,5,5,4,3,3,6,3,2,3,2,2,4,3,3,4,3,3,3,3,3,4,3,3,5,4,3,4,3,3,3,3,5,3,3,4,3,4,3,3,4,3];
const kcv=n=>KCV[n]||3;
function heirOf(S,seat){return seat*100+13}
// ---------------------------------------------------------------- state readers (own + public information only)
function roundsLeft(S){return S.rounds-S.round}
function myDown(S,seat,r){return S.reg[r].down.filter(id=>own(id)===seat)}
function strengthNow(S,id){return TB.cardInfo(S,id).strength}
function regionOfLoc(l){return l>>1}
function herald(S,seat){return S.pl[seat].herald}
// worth of claiming location l for `seat` (including Herald swing)
function locValue(S,seat,l){let v=LOCV[l];const P=S.pl[seat];
  if(P.herald===l){v+=1;for(const o of S.pl)if(o.seat!==seat&&o.herald===l&&S.pl[o.seat].inf>0)v+=1}
  if(l===2){if(S.fav.h===seat&&S.fav.u===3)v-=0.6}
  if(l===0||l===1){/*govern/journey need a card*/if(!P.hand.length&&!P.deck.length)v-=0.4}
  return v}
function regionValue(S,seat,r){return Math.max(locValue(S,seat,2*r),locValue(S,seat,2*r+1))}
function oppHeraldPressure(S,seat,r){let n=0;for(const o of S.pl)if(o.seat!==seat&&o.herald>=0&&(o.herald>>1)===r)n++;return n}
function kcsOf(S,seat){return S.pl[seat].ks.filter(x=>x).map(x=>x.kc)}
function haveKC(S,seat,n){return S.pl[seat].ks.some(x=>x&&x.kc===n)}
// hidden pool of a rival: the cards that are in their hand, deck, face-down or bid (everything not in a public place)
function hiddenPool(S,o){const P=S.pl[o];const known=new Set();for(const id of P.disc.concat(P.site,P.hq))known.add(id);for(const id of S.lost.concat(S.burned))if(own(id)===o)known.add(id);
  for(const R of S.reg)for(const id of R.up)if(own(id)===o)known.add(id);for(const c of ['relics','secrets','oaths'])for(const id of S.council[c])if(own(id)===o)known.add(id);for(const T of P.ks)if(T&&T.occ!=null)known.add(T.occ);
  const pool=[];for(let k=0;k<19;k++){const id=o*100+k;if(!known.has(id)&&!P.hq.includes(id))pool.push(id)}return pool}
function poolStrengths(S,o){return hiddenPool(S,o).map(id=>cd(S,id).s).sort((a,b)=>b-a)}
// ---------------------------------------------------------------- card utility (what a card is worth keeping in hand)
function keepValue(S,seat,id){const d=cd(S,id);let v=d.s*0.6;if(d.kind==='heir')v+=5;if(d.kind==='adv')v+=2;const cm=d.cm.map(c=>c.n);if(cm.includes('deadly'))v+=1;if(cm.includes('ambret'))v+=1.5;if(cm.includes('flank'))v+=0.8;if(cm.includes('deploy'))v+=0.5;return v}
function journeyValue(d){return d.l}
// ---------------------------------------------------------------- the clash picture (public after reveal; own down cards known)
function clashPic(S,seat){const c=S.clash;if(!c)return null;const out={tot:{},me:0,best:0,bestSeat:-1};
  for(const s of c.parts){let t=0;for(const id of (c.cards[s]||[]))t+=TB.cardInfo(S,id).strength;t+=S.pl[s].supp.r[c.r]*(S.rm.masonry.includes(s)?2:1)+(c.bonus[s]||0);out.tot[s]=t}
  out.me=out.tot[seat]||0;for(const s of c.parts)if(s!==seat&&out.tot[s]>=out.best){out.best=out.tot[s];out.bestSeat=s}return out}
// ---------------------------------------------------------------- bid
function pickBidCard(S,seat,mv,lv,rng){const P=S.pl[seat];const best=Math.max(0,...S.road.filter(Boolean).map(kcv));
  let target=clamp(2+(best-3)*1.0+(P.ks.some(x=>x)?0:0.5)+(lv.bidT||0),0,8);if(P.ks[0]&&P.ks[1])target=clamp(target+1,0,9);
  let top=null,topS=-1e9;
  for(const m of mv){const id=m.id,d=cd(S,id);let s=-Math.abs(d.s-target)*0.8-keepValue(S,seat,id)*0.35;
    if(d.kind==='heir')s-=8;if(d.kind==='adv')s-=2;if(d.s===0)s+=0.3;s+=rng()*lv.noise;if(s>topS){topS=s;top=m}}
  return top}
// resolve a bid: take / steal / return
function evalTake(S,seat,kc){let v=kcv(kc);const P=S.pl[seat];const slots=P.ks.filter(x=>x);
  if(P.ks[0]&&P.ks[1]){const worst=Math.min(...kcsOf(S,seat).map(kcv));v-=worst*0.8}
  if(P.ks.slice(0,2).filter(x=>x).length===2&&false)v-=1;
  // dedupe: a second copy-like role is worth less
  return v}
function bidRes(S,seat,mv,lv,rng){let best=null,bs=-1e9;
  for(const m of mv){let s;
    if(m.t==='return')s=1.4+0.2*S.pl[seat].hand.length*0;
    else if(m.t==='take')s=evalTake(S,seat,m.kc)-0.7*(S.pl[seat].bid!=null?keepValue(S,seat,S.pl[seat].bid)*0.25:0);
    else s=evalTake(S,seat,m.kc)+1.2;
    s+=rng()*lv.noise;if(s>bs){bs=s;best=m}}
  return best}
// ---------------------------------------------------------------- placing face-down cards
function planPlacement(S,seat,rng,lv,hand){hand=hand||S.pl[seat].hand;const n=Math.min(3,hand.length);
  const ids=hand.slice().sort((a,b)=>cd(S,b).s-cd(S,a).s);
  const rv=[0,1,2].map(r=>regionValue(S,seat,r)+0.15*rng());
  const order=[0,1,2].sort((a,b)=>rv[b]-rv[a]);
  // choose cards: strongest, but keep the Ruse (ambush trick) when a heavy hitter stays in hand
  let pick=ids.slice(0,n);
  const ruse=hand.find(id=>cd(S,id).cm.some(c=>c.n==='ambret'));
  if(ruse!=null&&!pick.includes(ruse)&&ids.length>=4&&cd(S,ids[0]).s>=6&&rng()<0.55*lv.cunning){pick=ids.slice(1,n);pick.push(ruse)}
  else if(ruse!=null&&pick.includes(ruse)&&cd(S,ids[0]).s>=7&&rng()<0.25*lv.cunning){}
  pick.sort((a,b)=>cd(S,b).s-cd(S,a).s);
  // bluff / sacrifice variations
  const assign=[null,null,null];
  let seq=pick.slice();
  if(seq.length>=2&&rng()<0.22*lv.cunning){const t=seq[0];seq[0]=seq[1];seq[1]=t}
  if(seq.length===3&&rng()<0.12*lv.cunning){const t=seq[1];seq[1]=seq[2];seq[2]=t}
  // a Ruse goes where it will ambush: the best region (the heavy card is in hand)
  const rIdx=seq.findIndex(id=>cd(S,id).cm.some(c=>c.n==='ambret'));
  if(rIdx>0&&hand.length>3){const rr=seq.splice(rIdx,1)[0];seq.unshift(rr)}
  for(let i=0;i<seq.length;i++)assign[order[i]]=seq[i];
  return assign}
// ---------------------------------------------------------------- menus
function scoreAct(S,seat,m,lv){const a=m.a,p=m.p||{},P=S.pl[seat],step=S.q.ctx.step;const rl=roundsLeft(S);
  const clash=S.clash,pic=clash?clashPic(S,seat):null;
  const myStrongHand=P.hand.reduce((b,id)=>Math.max(b,cd(S,id).s),0);
  switch(a){
  case 'supp':{ // place Supporters where the best chance to win is, spread over the remaining rounds
    const onMap=sum(P.supp.r)+sum(P.supp.x);const avail=P.supp.b+onMap;const lim=rl<=0?avail:Math.ceil(avail*(lv.sup||1.5)/(rl+1));const room=lim-onMap;if(room<=0)return -1;const want=Math.min(P.supp.b,room);if(p.n!==want)return -1;
    // region where my own face-down cards are strongest relative to the prize
    let bestR=0,bs=-1e9;for(let r=0;r<NREG;r++){const mine=sum(myDown(S,seat,r).map(id=>cd(S,id).s));const s=regionValue(S,seat,r)*2+mine*0.15+S.pl[seat].supp.r[r]*0.5;if(s>bs){bs=s;bestR=r}}
    return p.r===bestR?2.2:-1}
  case 't:nob_t1':return P.supp.r.reduce((x,y)=>x+y,0)>=2?2:-1;
  case 't:nob_t2':return 0.8;
  case 't:cln_t1':return 2+(P.supp.r.some(x=>x>=2)?1:0);
  case 't:upr_t1':return P.hand.some(id=>cd(S,id).kind==='heir')||S.reg.some(R=>R.down.some(id=>id===heirOf(S,seat)))?1.8:0.4;
  case 't:upr_t3':return occCountP(P)*0.9*(S.np-1)*0.7;
  case 't:upr_t4':return 0.2;
  case 't:gth_t2':return S.kdisc.length>=5&&P.hand.length>=4?1.3:0.2;
  case 'hq:cln_hq2':return 1.4;
  case 'kc2':return 3;case 'kc13':return 2.6;case 'kc14':return P.hand.length<P.hs?1.6:-1;case 'kc23':return 1.1;case 'kc26':return Math.max(0,...S.road.map(kcv))>=5?1.8:0.2;
  case 'kc6':return P.tac.some(t=>t.ex&&!t.burn)?1.2:0.1;case 'kc19':return P.hand.length<=3?0.6:0.1;case 'kc25':return G_lostStrong(S,seat)?1.5:-1;case 'kc38':return myStrongHand>=8?1.2:0.2;case 'kc30':return 0.6;case 'kc47':return 0.2;
  case 'kc20':case 'kc20a':return 0.1;
  case 'cmd:deploySpring':return 2.3;
  case 'cmd:ambush':{if(!pic)return 0;const need=pic.best-pic.me+1;const bestHand=P.hand.reduce((b,id)=>Math.max(b,cd(S,id).s),0);const gate=m.p.mode==='ar'&&false;
      if(pic.me>pic.best+bestHand*0.5)return -1;if(bestHand>=need)return 3+(bestHand-need)*0.1;return bestHand>=need-2?0.9:0.2}
  case 'cmd:retreat':{if(!pic)return 0;const mineCards=(S.clash.cards[seat]||[]).reduce((t,id)=>t+TB.cardInfo(S,id).strength,0);const danger=oppDeadly(S,seat);
      if(danger&&mineCards>=4)return 3.4;if(pic.me+3<pic.best&&mineCards>=6)return 2.6;return -1}
  case 'cmd:flank':{if(!pic)return 0;const losing=pic.me<=pic.best;const dests=[0,1,2].filter(r=>r!==S.clash.r&&!S.reg[r].done);if(!dests.length)return -1;
      const card=p.card;const st=TB.cardInfo(S,card).strength;if(losing&&pic.me-st<pic.best&&st>=3)return 2.4;if(!losing&&pic.me-st>pic.best+1)return 2.0;return -1}
  case 't:cln_t2':return 0.5;case 't:upr_t2':return oppDeadly(S,seat)?2.5:0.3;
  case 't:gth_t1':return pic&&pic.me<pic.best?1.5:-1;case 't:gth_t3':return 0.3;
  case 'hq:cln_hq1':return 0.2;case 'hq:gth_hq':return 1.0;case 'card:fang':return 2.2;
  case 'kc21':return 0.2;case 'kc22':return 0.3;case 'kc29':return 0.2;case 'kc40':return 0.2;case 'kc44':return 0.4;
  case 'kc45':return pic&&P.hand.length&&myStrongHand>=pic.best-pic.me?1.6:0.3;
  case 'kc46':return pic&&pic.me<=pic.best&&pic.me+5>pic.best?3.2:-1;
  case 'kc50':return pic&&(S.clash.cards[seat]||[]).length&&opponentsHave(S,seat)>=2?2.4:0.5;
  case 'kc51':return oppDeadly(S,seat)?3.5:-1;
  case 'fav:spring':case 'fav:day':case 'fav:autumn':return favScore(S,seat,p);
  case 'govern':return governScore(S,seat,p,lv);
  case 'journey':return journeyScore(S,seat,p,lv);
  case 'cmd:rally':{const id=p.card;const d=cd(S,id);const a2=TB.cardInfo(S,id);return d.kind==='heir'?2.6:a2.strength>=7?2.0:a2.commands.includes('deploy')?-1:0.6}
  case 'cmd:deploy':return p.r===bestRegion(S,seat)?2.1:1.7;
  case 'council:secrets':return 1.4;case 'council:oaths':return 2.3;
  case 't:nob_t4':{let rival=0,mine=0;for(const c of ['relics','secrets','oaths'])for(const id of S.council[c]){if(own(id)===seat)mine++;else rival++}return rival*0.8+(mine>=2?0.8:0)-0.3}
  case 't:cln_t3':return Math.max(0,...S.pl.filter(o=>o.seat!==seat).flatMap(o=>kcsOf(S,o.seat)).map(kcv))>=4&&!P.ks.every(x=>x)?2.2:0.4;
  case 't:cln_t4':return P.hand.length+2<=P.hs&&S.round<S.rounds?1.0:-1;
  case 't:gth_t4':{const junk=P.disc.filter(id=>keepValue(S,seat,id)<1.6).length+cardsActive(S,seat).filter(id=>keepValue(S,seat,id)<0.8).length;return junk>=2?1.2+0.3*Math.min(3,junk):-1}
  case 'hq:nob_hq':return p.cap>=0&&p.inf?3:p.cap>=0?1.8:1.5;
  case 'hq:upr_hq1':return kcv(p.kc)-2.2;
  case 'card:hallseats':return 0.2;case 'card:rampart':return 1.6;case 'card:whisperer':return 2.2;
  case 'kc10':return 1.0;case 'kc16':return P.hs<8?1.8:-1;case 'kc24':return 0.2;case 'kc31':return G_ownLost(S,seat).length>=3?1.8:0.3;
  case 'kc32':return TB.cardInfo(S,p.id).strength>=7||cd(S,p.id).kind==='heir'?2.3:0.3;
  case 'kc36':return P.hand.length<P.hs?1.2:-1;case 'kc37':return 1.5;case 'kc42':return 2.0;case 'kc48':return 1.0;
  }
  return 0.1}
function cardsActive(S,seat){const o=[];for(const R of S.reg)for(const id of R.up)if(own(id)===seat)o.push(id);return o}
function occCountP(P){return P.ks.filter(x=>x&&x.occ!=null).length}
function G_ownLost(S,seat){return S.lost.filter(id=>own(id)===seat)}
function G_lostStrong(S,seat){return G_ownLost(S,seat).some(id=>cd(S,id).s>=7)}
function opponentsHave(S,seat){let n=0;for(const o of S.clash.parts)if(o!==seat)n+=(S.clash.cards[o]||[]).length;return n}
function oppDeadly(S,seat){const c=S.clash;if(!c)return false;for(const o of c.parts){if(o===seat)continue;for(const id of (c.cards[o]||[]))if(TB.cardInfo(S,id).commands.includes('deadly'))return true}return false}
function bestRegion(S,seat){let b=0,bs=-1;for(let r=0;r<NREG;r++){const s=regionValue(S,seat,r);if(s>bs){bs=s;b=r}}return b}
function favScore(S,seat,p){switch(p.f){case 'nobility':return 2.8;case 'clans':return S.clash&&clashPic(S,seat)&&clashPic(S,seat).me<=clashPic(S,seat).best?2.0:0.6;case 'uprising':return 1.6;case 'gathering':return 1.2}return 0.5}
function governScore(S,seat,p,lv){lv=lv||LV.normal;const id=p.id,d=cd(S,id);const keep=keepValue(S,seat,id);if(d.kind==='heir')return -1;
  const v=TB.cardInfo(S,id).votes;const want=bestCouncil(S,seat,lv);const cb=p.c===want?0.8:0;const sc=1.0+v*0.7+cb-keep*0.18+(lv.gb||0);return sc>1.15?sc:-1}
function bestCouncil(S,seat,lv){lv=lv||LV.normal;const v=c=>TB.votes(S,seat,c);let best='relics',b=-1;for(const c of ['relics','oaths','secrets']){const s=v(c)*1.0+(c==='relics'?0.6:c==='oaths'?0.5+(lv.oaths||0):0);if(s>b){b=s;best=c}}return best}
function journeyScore(S,seat,p,lv){lv=lv||LV.normal;const P=S.pl[seat],id=p.id,d=cd(S,id),info=TB.cardInfo(S,id);const gain=info.lore;if(d.kind==='heir')return -1;
  const costs=P.site.map(x=>cd(S,x).lc);if(!costs.length)return -1;const mn=Math.min(...costs);const after=P.lore+gain;const buyNow=after>=mn;
  let s=0.6+gain*0.5+(info.traits.includes('path')?1.3:0)+(buyNow?1.6:(after+2>=mn?0.6:0))-keepValue(S,seat,id)*0.2;
  if(S.round>=S.rounds)s-=1.0;s+=(lv.jb||0);return s>0.9?s:-1}
// ---------------------------------------------------------------- pick policies by question kind
const PICK={};
PICK.applause=(S,seat,q,mv)=>{const lead=S.pl[seat].inf>=Math.max(...S.pl.map(p=>p.inf));return mv.find(m=>lead?m.who===seat:m.who!==seat&&false)||mv.slice().sort((a,b)=>(a.who===seat?1:0)-(b.who===seat?1:0))[0]};
PICK.edict=(S,seat,q,mv)=>{const my=S.bstr[seat];const best=Math.max(...S.bstr.filter((x,i)=>i!==seat));const bestKC=Math.max(0,...S.road.map(kcv));return mv.find(m=>!!m.yes===(best>my&&bestKC>=5))};
PICK.herald=(S,seat,q,mv,lv,rng)=>{let b=null,bs=-1e9;for(const m of mv){const l=m.loc;let s=LOCV[l]*(1+0.15*(l===3))+rng()*lv.noise*0.5;
    const others=S.pl.filter(o=>o.seat!==seat&&o.herald===l).length;s-=others*0.7;if(l===3)s+=0.5;
    s+=Math.min(0.8,0.2*sum(myDown(S,seat,l>>1).map(id=>cd(S,id).s))/3);s+=rng()*0.5;if(s>bs){bs=s;b=m}}return b};
PICK.clashOrder=(S,seat,q,mv,lv,rng)=>{ // put my best prize first when I am strong; the Region where rivals have Heralds last
  let b=null,bs=-1e9;for(const m of mv){const o=m.order;let s=0;for(let i=0;i<3;i++){const r=o[i];const w=[1.0,0.1,-0.8][i];s+=w*(regionValue(S,seat,r)+0.04*sum(myDown(S,seat,r).map(id=>cd(S,id).s)))}s+=rng()*0.4;if(s>bs){bs=s;b=m}}return b};
PICK.tie=(S,seat,q,mv,lv,rng)=>{const hand=S.pl[seat].hand;const c=S.clash;const rv=regionValue(S,seat,c.r);if(!hand.length)return mv.find(m=>m.pass);
  const strong=mv.filter(m=>!m.pass).sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s);const mid=strong[Math.floor(strong.length/3)]||strong[0];
  if(rv>=1.8||rng()<0.6)return mid||mv.find(m=>m.pass);return mv.find(m=>m.pass)};
PICK.location=(S,seat,q,mv,lv,rng)=>{let b=null,bs=-1e9;for(const m of mv){const s=locValue(S,seat,m.loc)+rng()*0.2*lv.noise;if(s>bs){bs=s;b=m}}return b};
PICK.joustLoc=PICK.location;
PICK.castle=(S,seat,q,mv,lv)=>{let b=null,bs=0.9;for(const m of mv){if(m.skip)continue;const s=governScore(S,seat,{id:m.id,c:m.c},lv)+0.3;if(s>bs){bs=s;b=m}}return b||mv.find(m=>m.skip)};
PICK.wilderness=(S,seat,q,mv,lv)=>{let b=null,bs=0.6;for(const m of mv){if(m.skip)continue;const s=journeyScore(S,seat,{id:m.id},lv)+0.4;if(s>bs){bs=s;b=m}}return b||mv.find(m=>m.skip)};
PICK.harvest=(S,seat,q,mv)=>mv.find(m=>m.yes);
PICK.bidRes=null;
PICK.slot=(S,seat,q,mv)=>{let b=null,bs=1e9;for(const m of mv){const kc=S.pl[seat].ks[m.slot].kc;const v=kcv(kc);if(v<bs){bs=v;b=m}}return b};
PICK.statue=(S,seat,q,mv)=>mv.find(m=>!!m.yes);
PICK.burnTactic=(S,seat,q,mv)=>mv.slice().sort((a,b)=>(S.pl[seat].tac[b.i].ex?1:0)-(S.pl[seat].tac[a.i].ex?1:0))[0];
PICK.gleaners=(S,seat,q,mv)=>mv.filter(m=>!m.skip).sort((a,b)=>kcv(b.kc)-kcv(a.kc))[0];
PICK.crone=(S,seat,q,mv)=>{const o=mv.filter(m=>!m.skip).sort((a,b)=>kcv(b.kc)-kcv(a.kc))[0];return o&&kcv(o.kc)>=3.5?o:mv.find(m=>m.skip)};
PICK.occupier=(S,seat,q,mv)=>mv.slice().sort((a,b)=>keepValue(S,seat,a.id)-keepValue(S,seat,b.id))[0];
PICK.lighthouse=(S,seat,q,mv)=>mv[0];
PICK.ambushCard=(S,seat,q,mv)=>{const c=S.clash,pic=clashPic(S,seat);const need=pic?pic.best-pic.me+1:1;const s=mv.slice().sort((a,b)=>cd(S,a.id).s-cd(S,b.id).s);return s.find(m=>cd(S,m.id).s>=need)||s[s.length-1]};
PICK.flank=(S,seat,q,mv)=>mv.slice().sort((a,b)=>regionValue(S,seat,b.r)-regionValue(S,seat,a.r))[0];
PICK.flankSupp=(S,seat,q,mv)=>mv.slice().sort((a,b)=>b.n-a.n)[0];
PICK.contraband=(S,seat,q,mv)=>mv.find(m=>!!m.yes);
PICK.starlight=(S,seat,q,mv)=>mv.slice().sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0];
PICK.gate2=(S,seat,q,mv)=>mv.find(m=>!!m.yes);
PICK.mirror=(S,seat,q,mv)=>mv.slice().sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0];
PICK.favNob=(S,seat,q,mv)=>mv.find(m=>m.inf);
PICK.favClan=(S,seat,q,mv)=>{const c=S.clash;const rv=[2*c.r,2*c.r+1];return mv.filter(m=>!m.skip).sort((a,b)=>locValue(S,seat,b.loc)-locValue(S,seat,a.loc))[0]||mv[0]};
PICK.favClanSup=(S,seat,q,mv)=>mv.filter(m=>!m.skip).sort((a,b)=>S.pl[seat].supp.r[b.r]-S.pl[seat].supp.r[a.r])[0]||mv.find(m=>m.skip);
PICK.favUpr=(S,seat,q,mv)=>mv.slice().sort((a,b)=>regionValue(S,seat,b.r)-regionValue(S,seat,a.r))[0];
PICK.favUpr2=(S,seat,q,mv)=>mv.find(m=>m.skip);
PICK.favGath=(S,seat,q,mv)=>mv.filter(m=>!m.skip).sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0];
PICK.secPlace=(S,seat,q,mv)=>{const P=S.pl[seat];return mv.slice().sort((a,b)=>(P.mk[b.loc]+(b.loc===1||b.loc===2?0.6:0)+(b.loc===0?0.3:0))-(P.mk[a.loc]+(a.loc===1||a.loc===2?0.6:0)+(a.loc===0?0.3:0)))[0]};
PICK.helm=(S,seat,q,mv)=>mv.find(m=>!!m.yes);
PICK.cellar=(S,seat,q,mv)=>mv.find(m=>m.inf);
PICK.councilOut=(S,seat,q,mv)=>mv.find(m=>m.to==='hand')||mv[0];
PICK.journeyDest=(S,seat,q,mv)=>mv.find(m=>m.deck)||mv[0];
PICK.forge=(S,seat,q,mv)=>mv.find(m=>!m.skip)||mv[0];
PICK.tavern=(S,seat,q,mv)=>mv.find(m=>m.skip);
PICK.ferry1=(S,seat,q,mv)=>mv.slice().sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0];
PICK.ferry2=(S,seat,q,mv)=>mv.slice().sort((a,b)=>keepValue(S,seat,a.id)-keepValue(S,seat,b.id))[0];
PICK.govern3=(S,seat,q,mv)=>mv.filter(m=>!m.skip).sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0]||mv[0];
PICK.placeRegion=(S,seat,q,mv)=>mv.slice().sort((a,b)=>regionValue(S,seat,b.r)-regionValue(S,seat,a.r))[0];
PICK.placeLoc=(S,seat,q,mv)=>mv.slice().sort((a,b)=>LOCV[b.loc]-LOCV[a.loc])[0];
PICK.offering2=(S,seat,q,mv)=>mv.filter(m=>!m.skip).sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0]||mv[0];
// ---------------------------------------------------------------- sel policies: return the values to choose, in order
const SEL={};
SEL.discardDown=(S,seat,q)=>{const P=S.pl[seat];return q.items.map(it=>it.v).sort((a,b)=>keepValue(S,seat,a)-keepValue(S,seat,b)).slice(0,q.min)};
SEL.discardPick=SEL.discardDown;
SEL.siteBuy=(S,seat,q)=>{const P=S.pl[seat];const cap=P.lore;const ids=q.items.map(it=>it.v);const val=id=>{const d=cd(S,id);return (d.kind==='hq'?3.2:d.kind==='adv'?2.8:0)+d.s*0.12+d.lc*0.05};
  const sorted=ids.sort((a,b)=>val(b)-val(a));let left=cap;const out=[];for(const id of sorted){const c=cd(S,id).lc;if(c<=left){out.push(id);left-=c}}return out};
SEL.shrine=(S,seat,q)=>[];SEL.ossuary=(S,seat,q)=>{const P=S.pl[seat];const junk=q.items.map(it=>it.v).filter(id=>keepValue(S,seat,id)<1.2);return P.hand.length-junk.length>=3?junk.slice(0,Math.max(0,P.hand.length-3)):[]};
SEL.relics=(S,seat,q)=>q.items.map(it=>it.v);
SEL.rally=(S,seat,q)=>q.items.map(it=>it.v).filter(id=>typeof id==='number').sort((a,b)=>keepValue(S,seat,b)-keepValue(S,seat,a)).slice(0,Math.max(q.min,Math.min(q.max,S.pl[seat].hs-S.pl[seat].hand.length)));
SEL.retreat=(S,seat,q)=>{const out=[];for(const it of q.items){if(it.v==='H'||it.v==='S'||typeof it.v==='number'){if(typeof it.v==='number'&&TB.cardInfo(S,it.v).strength>=2)out.push(it.v);if(it.v==='S'||it.v==='H')out.push(it.v)}}return out};
SEL.roving=(S,seat,q)=>[];SEL.sirens=(S,seat,q)=>q.items.map(it=>it.v).filter(s=>s!==seat);
SEL.rumours=(S,seat,q)=>[seat].filter(s=>S.pl[s].hand.length>=3&&q.items.some(it=>it.v===s)&&S.pl[s].hand.reduce((t,id)=>t+cd(S,id).s,0)<12);
SEL.order=(S,seat,q)=>q.items.map(it=>it.v).sort((a,b)=>cd(S,b).s-cd(S,a).s);
SEL.inquest=(S,seat,q)=>q.items.map(it=>it.v).filter(id=>cd(S,id).s>=6);
SEL.brine=(S,seat,q)=>q.items.map(it=>it.v).sort((a,b)=>keepValue(S,seat,b)-keepValue(S,seat,a)).slice(0,q.max);
SEL.offering=(S,seat,q)=>q.items.map(it=>it.v).filter(id=>keepValue(S,seat,id)<1.6).sort((a,b)=>keepValue(S,seat,a)-keepValue(S,seat,b)).slice(0,3);SEL.ledger=(S,seat,q)=>q.items.map(it=>it.v).filter(id=>own(id)!==seat);
// ---------------------------------------------------------------- the policy (one decision)
const LV={easy:{noise:3,cunning:0.2,rnd:0.5},normal:{noise:0.6,cunning:1,rnd:0,sup:1.5,jb:0,gb:0,bidT:0,hb:1,kcw:1,oaths:1},hard:{noise:0.3,cunning:1,rnd:0,sup:1.5,jb:0,gb:0,bidT:0,hb:1,kcw:1,oaths:1}};
for(const k of ['easy']){LV[k].sup=1.5;LV[k].jb=0;LV[k].gb=0;LV[k].bidT=0;LV[k].hb=1;LV[k].kcw=1}
function policy(S,seat,lv,rng){const q=S.q;const mv=TB.moves(S,seat);if(mv.length<=1)return mv[0];
  lv=lv||LV.normal;rng=rng||Math.random;const k=q.kind;let m=null;
  if(q.t==='sel'){const want=(SEL[k]||(()=>[]))(S,seat,q);const next=want.find(v=>!q.chosen.includes(v)&&mv.some(x=>x.t==='sel'&&x.v===v));
    if(next!==undefined&&q.chosen.length<q.max)m=mv.find(x=>x.t==='sel'&&x.v===next);
    if(!m){m=mv.find(x=>x.t==='seldone');if(!m)m=mv[0]}return m}
  if(k==='bid'||k==='joust')m=k==='bid'?pickBidCard(S,seat,mv,lv,rng):mv.slice().sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[Math.floor(mv.length/2)];
  else if(k==='bidRes')m=bidRes(S,seat,mv,lv,rng);
  else if(k==='place')m=placeStep(S,seat,mv,lv,rng);
  else if(k==='menu')m=menuPick(S,seat,mv,lv,rng);
  else if(PICK[k])m=PICK[k](S,seat,q,mv,lv,rng);
  return m||mv[0]}
function placeStep(S,seat,mv,lv,rng){const q=S.q,st=q.st[seat];const r2=mkRng(viewSeed(S,seat,17));const plan=planPlacement(S,seat,r2,lv,S.pl[seat].hand.concat(myDownAll(S,seat)));
  if(st.small){let b=null,bs=-1e9;for(const m of mv){const s=cd(S,m.id).s*regionValue(S,seat,m.r)+rng()*0.1;if(s>bs){bs=s;b=m}}return b}
  const want=plan[st.n];return mv.find(m=>m.id===want)||mv.slice().sort((a,b)=>cd(S,b.id).s-cd(S,a.id).s)[0]}
function myDownAll(S,seat){const o=[];for(let r=0;r<NREG;r++)o.push(...myDown(S,seat,r));return o}
function menuPick(S,seat,mv,lv,rng){let best=null,bs=0.5;for(const m of mv){if(m.t!=='act')continue;const s=scoreAct(S,seat,m,lv)+rng()*lv.noise*0.4;if(s>bs){bs=s;best=m}}return best||mv.find(m=>m.t==='done')}
AI.policy=policy;AI.LV=LV;
// ---------------------------------------------------------------- rollouts (hard level)
function evaluate(S,seat){const inf=S.pl.map(p=>p.inf);const me=inf[seat];const opp=inf.filter((x,i)=>i!==seat);let s=me-sum(opp)/opp.length;
  const assets=p=>sum(p.ks.filter(x=>x).map(x=>kcv(x.kc)))*0.12+p.lore*0.12+(5-p.site.length)*0.2+p.hs*0.15;
  s+=assets(S.pl[seat])-sum(S.pl.filter((p,i)=>i!==seat).map(assets))/opp.length;
  if(S.over){s+=(S.over.winner===seat?4:-1)}return s}
function rollout(S0,seat,movesFirst,rng,rolloutLV){const S=JSON.parse(JSON.stringify(S0));S.log=[];const r0=S.round;let steps=0;
  for(const mv of movesFirst){const r=TB.apply(S,mv);if(!r.ok)return null}
  while(S.phase!=='over'&&S.round===r0&&steps++<600){const p=TB.pending(S);if(!p)break;
    for(const s of p.seats){const q=TB.pending(S);if(!q||!q.seats.includes(s))continue;const m=policy(S,s,rolloutLV,rng);if(!m)return null;const r=TB.apply(S,m);if(!r.ok)return null}}
  return evaluate(S,seat)}
// evaluate candidate move sequences by rollouts in sampled worlds; returns the index of the best
function pickByRollouts(G,seat,cands,budgetMs,rng,samples){const t0=Date.now();const n=cands.length;const tot=new Array(n).fill(0),cnt=new Array(n).fill(0);
  let rounds=0;const poisonRng=mkRng(viewSeed(G,seat,99));
  while(samples?rounds<samples:(Date.now()-t0<budgetMs||rounds<1)){const S=TB.poison(G,seat,poisonRng);
    for(let i=0;i<n;i++){const v=rollout(S,seat,cands[i],rng,LV.normal);if(v!=null){tot[i]+=v;cnt[i]++}if(!samples&&Date.now()-t0>budgetMs*1.5)break}
    rounds++;if(rounds>40)break}
  let b=0,bs=-1e9;for(let i=0;i<n;i++){const s=cnt[i]?tot[i]/cnt[i]:-1e9;if(s>bs){bs=s;b=i}}return {best:b,mean:cnt.map((c,i)=>c?tot[i]/c:null),samples:rounds}}
AI.pickByRollouts=pickByRollouts;
function completionMoves(S,seat,hand,firstRegion,rng){ // heuristic completion: remaining cards by strength into remaining Regions by value
  const ids=hand.slice().sort((a,b)=>cd(S,b).s-cd(S,a).s);const regs=[];for(let r=firstRegion;r<3;r++)regs.push(r);regs.sort((a,b)=>regionValue(S,seat,b)-regionValue(S,seat,a));
  const out=[];regs.forEach((r,i)=>{if(ids[i]!=null)out.push({r,id:ids[i]})});out.sort((a,b)=>a.r-b.r);return out.map(x=>({seat,k:'p:'+x.id,t:'place',id:x.id,r:x.r}))}
function hardChoose(G,seat,rng,budget,samples){const q=G.q,k=q.kind;const mv=TB.moves(G,seat);if(mv.length<=1)return mv[0];
  const S=TB.poison(G,seat,mkRng(viewSeed(G,seat,5)));
  const base=policy(S,seat,LV.hard,rng);
  if(k==='place'){const st=q.st[seat];if(st.small||st.n>=2)return base;
    // stateless: at every step choose the card for the next Region by rollouts (heuristic completion for the Regions after it)
    const hand=G.pl[seat].hand;const ids=hand.slice().sort((a,b)=>cd(S,b).s-cd(S,a).s);const cs=[];
    for(const id of ids){if(cs.length>=6)break;cs.push(id)}
    const ruse=hand.find(id=>cd(S,id).cm.some(c=>c.n==='ambret'));if(ruse!=null&&!cs.includes(ruse))cs.push(ruse);
    const bm=base&&base.id;if(bm!=null&&!cs.includes(bm))cs.push(bm);
    const seqs=cs.map(id=>{const first=mv.find(m=>m.id===id);const rest=hand.filter(x=>x!==id);return [first].concat(completionMoves(S,seat,rest,st.n+1,rng))});
    const res=pickByRollouts(G,seat,seqs,budget/(st.n===0?1.5:3),rng,samples);return seqs[res.best][0]}
  if(k==='herald'||k==='clashOrder'||k==='location'||k==='tie'||k==='bidRes'||k==='bid'||(k==='menu'&&menuCritical(G,seat,mv))){
    let cs=mv;if(k==='menu')cs=menuCandidates(S,seat,mv);if(k==='bid')cs=bidCandidates(S,seat,mv,rng);if(cs.length<=1)return cs[0]||base;
    const seqs=cs.map(m=>[m]);const res=pickByRollouts(G,seat,seqs,budget,rng,samples);return cs[res.best]}
  return base}
function menuCritical(G,seat,mv){return mv.some(m=>m.t==='act'&&['cmd:ambush','cmd:retreat','cmd:flank','kc46','kc50','kc51','kc45'].includes(m.a))}
function menuCandidates(S,seat,mv){const sc=mv.map(m=>m.t==='act'?{m,s:scoreAct(S,seat,m,LV.hard)}:{m,s:0.5}).sort((a,b)=>b.s-a.s);const out=sc.filter(x=>x.s>0.5).slice(0,4).map(x=>x.m);const d=mv.find(m=>m.t==='done');if(d&&!out.includes(d))out.push(d);return out}
function bidCandidates(S,seat,mv,rng){const hand=mv.slice().sort((a,b)=>cd(S,a.id).s-cd(S,b.id).s);const out=[];const pick=pickBidCard(S,seat,mv,LV.hard,rng);if(pick)out.push(pick);for(const m of hand){if(out.length>=4)break;if(!out.includes(m)&&cd(S,m.id).kind!=='heir')out.push(m)}return out}
// ---------------------------------------------------------------- public API
AI.choose=function(G,seat,level,opts){opts=opts||{};level=level||(G.pl[seat].ai)||'normal';const rng=mkRng(viewSeed(G,seat,1));
  const lv=LV[level]||LV.normal;
  if(level==='easy'){const mv=TB.moves(G,seat);if(mv.length<=1)return mv[0];
    const S=TB.poison(G,seat,mkRng(viewSeed(G,seat,5)));
    if(rng()<lv.rnd){const k=G.q.kind;if(k==='menu'){const nm=mv.filter(m=>m.t==='done');if(rng()<0.6&&nm.length)return nm[0]}
      if(G.q.t==='sel'){const d=mv.find(m=>m.t==='seldone');if(d&&rng()<0.6)return d}return mv[Math.floor(rng()*mv.length)]}
    return policy(S,seat,lv,rng)}
  if(level==='hard')return hardChoose(G,seat,rng,opts.budget||AI.budgetMs,opts.samples);
  const S=TB.poison(G,seat,mkRng(viewSeed(G,seat,5)));return policy(S,seat,lv,rng)};
AI.budgetMs=200;
AI.step=function(G,opts){opts=opts||{};const p=TB.pending(G);if(!p)return {moved:0,waiting:[]};const waiting=[];let moved=0;
  for(const s of p.seats.slice()){const q=TB.pending(G);if(!q||!q.seats.includes(s))continue;const ai=G.pl[s].ai;if(!ai||(opts.humans&&opts.humans.includes(s))){waiting.push(s);continue}
    const m=AI.choose(G,s,ai,opts);if(!m)throw new Error('AI found no move for seat '+s+' in '+q.kind);const r=TB.apply(G,m);if(!r.ok)throw new Error('AI made an illegal move ('+q.kind+' '+m.k+'): '+r.err+(r.stack?'\n'+r.stack:''));moved++}
  return {moved,waiting}};
AI.run=function(G,opts){opts=opts||{};let n=0;const max=opts.maxSteps||20000;
  while(G.phase!=='over'&&n<max){const r=AI.step(G,opts);if(!r.moved)return {steps:n,waiting:r.waiting,stalled:!r.waiting.length&&!!TB.pending(G)};n+=r.moved}
  return {steps:n,waiting:[],over:G.phase==='over'}};
})(typeof globalThis!=="undefined"?globalThis:this);
if(typeof module!=="undefined")module.exports=TB;
