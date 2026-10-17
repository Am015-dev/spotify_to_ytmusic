// ---------- computer players: rule-based Normal; Easy adds mistakes; Hard keeps a safety margin, plays the leader harder and saves its tricks ----------
// The AI reads only public information about other seats (levels, tables, hand sizes), never their hands or the decks.
function threat(o){return o.lvl*10+pStr(o)}
function leader(ex){return alive().filter(o=>o.i!==ex).sort((a,b)=>threat(b)-threat(a))[0]}
function cardValue(p,id){const c=cd(id);switch(c.t){
  case 'item':return (c.b||0)*3+(c.run||0)*2+(c.g||0)/300+(reqOK(p,c)?2:-3)+(c.sp?2:0);
  case 'oneshot':return (c.b||0)*2+(c.sp?5:0)+(c.g||0)/400;
  case 'level':return 9;case 'curse':return 4;case 'monster':return 2+(c.lvl<pStr(p)?3:0);case 'enh':return 3+(c.b>0?1:0);
  case 'race':case 'class':return 5;default:return 4}}
function aiLootPick(o,loot){return loot.slice().sort((a,b)=>cardValue(o,b)-cardValue(o,a))[0]}
function aiWantsWard(p,c){const heavy=(c.ops||[]).some(o=>['lvl','death','item','pick','clsOr1','race','cls','swap','tax','pers','sex'].includes(o[0]));return heavy&&(p.lvl>=3||p.eq.length>0)}
function aiLawyerSwap(f){return true}
function aiGlue(o,r){const w=P(r.w);const c=mdef(runMon(r));const nasty=(c.bad||[]).some(x=>x[0]==='death'||(x[0]==='lvl'&&(x[1]==='all'||x[1]>=2)));return (threat(w)>=threat(o)||w.lvl>=8)&&nasty}
// a choice the rules hand to this seat
function aiPick(p,why,opts,cont){const worth=id=>id==='hand'?3:itemWorth(p,id)+cardValue(p,id)/3;
  switch(why){
  case 'lose':case 'taxpay':case 'slug':return opts.slice().sort((a,b)=>worth(a)-worth(b))[0];
  case 'trait':return opts.slice().sort((a,b)=>cardValue(p,a)-cardValue(p,b))[0];
  case 'handOr':return p.hand.length<=2||(p.lvl<=2)?'hand':(p.hand.reduce((a,id)=>a+cardValue(p,id),0)>14?'lvl':'hand');
  case 'take':case 'loot':case 'dowse':return opts.slice().sort((a,b)=>(b==='hand'?3:cardValue(p,b))-(a==='hand'?3:cardValue(p,a)))[0];
  }return opts[0]}
function aiWantsWindow(o){const cur=curPl();if(!cur||cur===o)return false;const vm=playsFor(o.i).filter(m=>{const c=cd(m.card);return c.t==='curse'||c.t==='level'||c.sp==='steal'||c.sp==='hire'});
  return !!aiWindowPick(o,vm)}
function aiWindowPick(p,vm){const cur=curPl();
  const lv=vm.find(m=>cd(m.card).t==='level'&&m.tgt===p.i);if(lv)return lv;
  const hire=vm.find(m=>cd(m.card).sp==='hire');if(hire)return hire;
  const st=vm.filter(m=>cd(m.card).sp==='steal').sort((a,b)=>P(b.tgt).lvl-P(a.tgt).lvl);if(st.length&&p.lvl<R.WIN-1)return st[0];
  const cs=vm.filter(m=>cd(m.card).t==='curse'&&m.tgt===cur.i);const soft=p.lv==='easy'&&cur.human&&cur.lvl<=Math.min(...alive().map(o=>o.lvl));if(cs.length&&!soft&&(threat(cur)>=threat(p)||cur.lvl>=7))return cs.sort((a,b)=>curseHarm(cur,b.card)-curseHarm(cur,a.card))[0];
  return null}
function curseHarm(t,id){const c=cd(id);let h=0;for(const o of c.ops||[]){if(o[0]==='lvl')h+=o[1]*5;if(o[0]==='item'||o[0]==='pick')h+=itemPool(t,o[1]).length?4:0;if(o[0]==='race'||o[0]==='cls'||o[0]==='clsOr1')h+=3;if(o[0]==='pers')h+=3;if(o[0]==='sex')h+=4;if(o[0]==='tax')h+=2;if(o[0]==='grab')h+=Math.min(2,t.hand.length)*2}return h}
function handBoost(p){let b=0;for(const id of p.hand){const c=cd(id);if(c.t==='oneshot'&&c.b&&!c.sp)b+=c.b}if(isCls(p,'warrior'))b+=Math.min(R.BERSERK,Math.max(0,p.hand.length-2));return b}
function isDeadly(c){return (c.bad||[]).some(o=>o[0]==='death'||o[0]==='orcs'||o[0]==='dread')}
// choose a move for seat s from its legal moves
function aiMove(s){const p=P(s),vm=validMoves(s);if(!vm.length)return null;const by=a=>vm.filter(m=>m.act===a);
  if(p.lv==='easy'&&rnd(100)<22){const safe=vm.filter(m=>!['toss','give','pick','use','sell'].includes(m.act)&&!(m.act==='play'&&cd(m.card).t==='curse'&&m.tgt===s)&&!(m.act==='play'&&m.tgt==='m'&&G.cb&&G.cb.who===s));if(safe.length)return safe[rnd(safe.length)]}
  if(G.q)return aiAnswer(p,vm);
  const ph=G.phase;
  if(ph==='setup'||ph==='main'||ph==='after'||ph==='post'){const m=aiCalm(p,vm);if(m)return m;
    if(ph==='setup')return by('ready')[0];
    if(ph==='main'){const res=by('resurrect');if(res.length&&G.dd.length){const top=cd(G.dd[G.dd.length-1]);if((top.t==='monster'&&top.lvl+2<pStr(p)+handBoost(p)&&!isDeadly(top))||['race','class','special'].includes(top.t))return res.sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card))[0]}return by('kick')[0]}
    if(ph==='after'){const tr=by('trouble').filter(m=>{const c=cd(m.card);return c.lvl+(p.lv==='hard'?3:2)<pStr(p)+handBoost(p)&&!isDeadly(c)&&!(c.sp==='noescape'&&c.lvl>3)&&c.sp!=='lvlonly'});if(tr.length&&p.lv!=='easy'&&p.lvl<R.WIN)return tr.sort((a,b)=>cd(b.card).lvl-cd(a.card).lvl)[0];return by('loot')[0]}
    if(ph==='post')return by('end')[0]}
  if(ph==='window'){return aiWindowPick(p,vm.filter(m=>m.act==='play'))||by('pass')[0]}
  if(ph==='charity'){return vm.slice().sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card))[0]}
  if(ph==='combat'){const cb=G.cb;
    if(cb.stage==='act')return aiFight(p,vm);
    if(cb.stage==='others'){if(s===cb.help){const m=aiHelpBoost(p,vm);return m||by('pass')[0]}return aiInterfere(p,vm)||by('pass')[0]}}
  return vm[vm.length-1]}
// outside combat: race/class, equip, sell, level up
function aiCalm(p,vm){const by=a=>vm.filter(m=>m.act===a);
  for(const m of vm.filter(m=>m.act==='play')){const c=cd(m.card);
    if(c.t==='level'&&m.tgt===p.i)return m;
    if(c.t==='race'&&(p.race.length===0||(p.half!=null&&p.race.length<2&&!p.race.some(x=>cd(x).race===c.race))))return m;
    if(c.t==='class'&&(p.cls.length===0||(p.sup!=null&&p.cls.length<2&&!p.cls.some(x=>cd(x).cls===c.cls))))return m;
    if(c.t==='special'&&(c.sp==='half'||c.sp==='super'||c.sp==='hire'||c.sp==='divine'))return m;
    if(c.t==='special'&&c.sp==='cheat'){const e=p.eq.find(e=>e.id===m.tgt);if(e&&(cd(e.id).b||0)>=3)return m}
    if(c.t==='special'&&c.sp==='steal'&&G.phase!=='setup'){const l=leader(p.i);if(l&&m.tgt===l.i)return m}
    if(c.t==='item'){if(!equipWhy(p,m.card)&&!bigWhy(p,m.card))return m;if(!c.big)return m}
    if(c.t==='oneshot'&&c.sp==='dowse'&&G.phase==='post'&&(G.dd.length+G.td.length)>6)return m;
    if(c.t==='curse'&&G.phase!=='setup'&&m.tgt!==p.i){const l=leader(p.i);if(l&&m.tgt===l.i&&(l.lvl>=p.lvl+1||l.lvl>=7)&&curseHarm(l,m.card)>=3)return m}}
  // wear the best: equip upgrades, swap a worse worn item for a better carried one
  const eq=by('equip').sort((a,b)=>(cd(b.card).b||0)-(cd(a.card).b||0));if(eq.length)return eq[0];
  for(const e of p.eq.filter(e=>!e.on)){const c=cd(e.id);if(!reqOK(p,c,e))continue;const worn=p.eq.filter(x=>x.on&&x.id!==e.id&&x.cheat==null).find(x=>{const d=cd(x.id);return (d.slot&&d.slot===c.slot)||(c.hands&&d.hands)});
    if(worn&&(cd(worn.id).b||0)<(c.b||0)&&!equipWhy(p,e.id,worn.id)){const um=vm.find(m=>m.act==='unequip'&&m.card===worn.id);if(um)return um}}
  // sell for a level: junk first (carried items we can't use, spare one-shots)
  if(by('sell').length&&G.phase!=='setup'){const set=aiSellSet(p);if(set)return {act:'sell',cards:set.join(',')}}
  // thief: steal a small item from the leader when the odds are fine
  const st=by('steal').filter(m=>(cd(m.card).b||0)>=2);if(st.length&&p.lv!=='easy'&&p.lvl>1&&!G.stole){const l=leader(p.i);const x=st.find(m=>l&&m.tgt===l.i)||null;if(x)return x}
  return null}
function aiSellSet(p){const pool=sellable(p).map(id=>{const e=p.eq.find(x=>x.id===id);const c=cd(id);const use=e&&e.on?(c.b||0)*3+(c.run||0)*2:c.t==='oneshot'?(c.b||0)+(c.sp?4:0):(c.t==='item'&&reqOK(p,c)&&!equipWhy(p,id))?(c.b||0)*2:0;return {id,g:c.g||0,use}}).filter(x=>x.g>0);
  pool.sort((a,b)=>a.use/a.g-b.use/b.g);const pick=[];let tot=0;for(const x of pool){if(sellValue(p,pick.map(y=>y.id))>=R.SELL)break;if(x.use>=6&&p.lvl<7)continue;pick.push(x)}
  const ids=pick.map(x=>x.id);if(ids.length&&sellValue(p,ids)>=R.SELL&&p.lvl<R.WIN-1){while(ids.length>1){const t=ids.slice(0,-1);if(sellValue(p,t)>=R.SELL)ids.pop();else break}return ids}return null}
// in combat as the fighter
function aiFight(p,vm){const cb=G.cb;const by=a=>vm.filter(m=>m.act===a);const win=winning(cb);const gap=monStr(cb)-sideStr(cb)+(fighters(cb).some(f=>isCls(f,'warrior'))?0:1);
  const deadly=cb.mons.some(m=>isDeadly(mdef(m)));const margin=p.lv==='hard'?Math.min(5,1+alive().filter(o=>o!==p&&o.hand.length>2).length):1;
  const lead=monStr(cb)<sideStr(cb)?sideStr(cb)-monStr(cb):0;
  // a lonely win: take it, unless others can easily swing it and we have spare boosts
  const plays=vm.filter(m=>m.act==='play');const boosts=plays.filter(m=>m.tgt==='p'&&cd(m.card).t==='oneshot').sort((a,b)=>(cd(b.card).b||0)-(cd(a.card).b||0));
  const bers=by('berserk').sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card));const turn=by('turn').sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card));
  if(win){if(lead<margin&&p.lv==='hard'&&bers.length&&p.hand.length>3)return bers[0];if(lead<margin&&p.lv==='hard'&&turn.length)return turn[0];return by('fight')[0]}
  // losing: cheap fixes first
  const skip=by('skip');if(skip.length)return skip[0];const shoo=by('shoo');if(shoo.length)return shoo[0];
  const avail=boosts.reduce((a,m)=>a+(cd(m.card).b||0),0)+bers.length+turn.length*R.TURN_B;
  if(avail>=gap||deadly){if(turn.length)return turn[0];if(boosts.length&&(avail>=gap))return boosts[0];if(bers.length&&avail>=gap)return bers[0]}
  const weaken=plays.filter(m=>cd(m.card).t==='enh'&&cd(m.card).b<0);if(weaken.length&&gap<=5)return weaken[0];
  const dbl=plays.find(m=>cd(m.card).sp==='dbl');if(dbl&&sideStr(cb)*2>monStr(cb))return dbl;
  const water=plays.find(m=>cd(m.card).sp==='elfwater');if(water&&gap<=2*fighters(cb).filter(f=>isRace(f,'elf')).length)return water;
  const borrow=plays.find(m=>cd(m.card).sp==='borrow');if(borrow)return borrow;
  const garlic=plays.find(m=>cd(m.card).sp==='garlic'&&typeof m.tgt==='number');if(garlic)return garlic;
  // ask for help: the ally whose strength closes the gap, offering as little as works
  const asks=by('ask');if(asks.length){const cand=[...new Set(asks.map(m=>m.tgt))].map(i=>P(i)).filter(o=>pStr(o)+sideStr(cb)>monStr(cb)).sort((a,b)=>threat(a)-threat(b));
    if(cand.length){const tr=cbTreasure(cb);const n=Math.min(tr,Math.max(1,Math.ceil(tr/2)));const m=asks.find(m=>m.tgt===cand[0].i&&m.opt===n)||asks.filter(m=>m.tgt===cand[0].i).pop();if(m)return m}}
  // escape tools
  const lunch=plays.find(m=>cd(m.card).sp==='lunch');if(lunch)return lunch;
  const poly=plays.filter(m=>['poly','lamp'].includes(cd(m.card).sp));if(poly.length&&(deadly||cb.mons.length===1))return poly.sort((a,b)=>mStr(cb.mons[b.tgt],cb)-mStr(cb.mons[a.tgt],cb))[0];
  const flee=plays.find(m=>cd(m.card).sp==='flee');if(flee&&deadly)return flee;
  const ch=by('charm');if(ch.length&&(p.hand.length<=3||deadly))return ch.sort((a,b)=>mStr(cb.mons[b.tgt],cb)-mStr(cb.mons[a.tgt],cb))[0];
  const tran=plays.filter(m=>cd(m.card).sp==='transfer');if(tran.length&&deadly){const t=tran.sort((a,b)=>threat(P(b.tgt))-threat(P(a.tgt)))[0];return t}
  const brb=by('bribe').sort((a,b)=>itemWorth(p,a.card)-itemWorth(p,b.card));if(brb.length)return brb[0];
  const wall=plays.find(m=>cd(m.card).sp==='wall');if(wall&&(deadly||cb.mons.some(m=>(mdef(m).bad||[]).some(o=>o[0]==='lvl'&&(o[1]==='all'||o[1]>=2)))))return wall;
  const fl=by('flight').sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card));if(fl.length&&p.hand.length>1)return fl[0];
  return by('run')[0]||by('fight')[0]}
// as a helper in the others-window: add a boost only when the fight is lost otherwise
function aiHelpBoost(p,vm){const cb=G.cb;if(winning(cb))return null;const b=vm.filter(m=>m.act==='play'&&m.tgt==='p'&&cd(m.card).t==='oneshot').sort((a,c)=>(cd(c.card).b||0)-(cd(a.card).b||0));if(b.length&&sideStr(cb)+(cd(b[0].card).b||0)>monStr(cb))return b[0];const be=vm.find(m=>m.act==='berserk');return be||null}
// someone else's fight: stop the leader, and always stop a winning kill
function aiInterfere(p,vm){const cb=G.cb;const f=P(cb.who);if(!winning(cb))return null;
  const lvGain=cb.mons.reduce((a,m)=>a+(mdef(m).lv||1),0);const wouldWin=f.lvl+lvGain>=R.WIN;const lead=leader(-1);
  const hostile=wouldWin||(lead&&lead.i===cb.who&&f.lvl>=p.lvl+1)||(p.lv==='hard'&&f.lvl>=p.lvl+2);if(!hostile)return null;
  const gap=sideStr(cb)-monStr(cb)+(fighters(cb).some(x=>isCls(x,'warrior'))?1:0);
  const opts=vm.filter(m=>m.act==='play'||m.act==='join').map(m=>{const c=cd(m.card);let b=0;
    if(m.act==='join')b=cd(m.card).lvl;else if(c.t==='enh'&&c.b>0)b=c.b;else if(c.t==='enh'&&c.sp==='mate')b=mStr(cb.mons[m.tgt],cb);else if(c.t==='oneshot'&&m.tgt==='m'&&!c.sp)b=c.b||0;else if(c.sp==='wander')b=cd(m.tgt).lvl;else if(c.sp==='illusion')b=cd(m.opt).lvl-mStr(cb.mons[m.tgt],cb);
    return {m,b}}).filter(x=>x.b>0).sort((a,b)=>b.b-a.b);
  const bs=vm.filter(m=>m.act==='backstab');
  if(opts.length&&(opts[0].b>=gap||wouldWin))return opts[0].m;
  if(bs.length&&gap<=2)return bs[0];
  if(wouldWin){const cs=vm.filter(m=>m.act==='play'&&cd(m.card).t==='curse'&&m.tgt===cb.who).sort((a,b)=>curseHarm(f,b.card)-curseHarm(f,a.card));if(cs.length)return cs[0];const tr=vm.find(m=>m.act==='play'&&cd(m.card).sp==='transfer'&&m.tgt===p.i);if(tr&&p.lvl+lvGain<R.WIN+1&&sideStr(cb)-pStr(f)+pStr(p)>monStr(cb))return tr}
  return null}
function aiAnswer(p,vm){const q=G.q;const yes={act:'opt',opt:'yes'},no={act:'opt',opt:'no'};
  switch(q.kind){
  case 'help':{const cb=G.cb;const f=P(cb.who);const lvGain=cb.mons.reduce((a,m)=>a+(mdef(m).lv||1),0);if(f.lvl+lvGain>=R.WIN)return no;
    const would=sideStr(cb)+pStr(p)>monStr(cb)||(sideStr(cb)+pStr(p)===monStr(cb)&&(isCls(p,'warrior')||isCls(f,'warrior')));const worth=q.n>=1||isRace(p,'elf');const risky=cb.mons.some(m=>isDeadly(mdef(m)));
    const friend=threat(f)<=threat(p)+15||p.lv==='easy';return (would&&worth&&friend&&!(risky&&!would))?yes:no}
  case 'rescue':{const r=G.cb.runs[q.run];const c=mdef(runMon(r));const bad=isDeadly(c)||(c.bad||[]).some(o=>o[0]==='lvl'&&(o[1]==='all'||o[1]>=2))||c.lvl>=10;const use=vm.filter(m=>m.act==='use');
    const cheap=use.find(m=>cd(m.card).sp==='ratstick')||use.find(m=>cd(m.card).sp==='die');if(cheap)return cheap;if(use.length&&bad)return use[0];return no}
  case 'pick':{const v=aiPick(p,q.why,q.opts,q.cont);return {act:'pick',opt:Math.max(0,q.opts.indexOf(v))}}
  case 'glue':return aiGlue(p,G.cb.runs[q.run])?yes:no;
  case 'lawyer':return yes;
  case 'fetch':return yes;
  case 'ward':return aiWantsWard(p,cd(q.curse))?yes:no}
  return vm[0]}
// ---- the scheduler: the computer acts one step at a time so humans can follow ----
let aiTimer=null;
function schedule(){if(aiTimer||!G||G.winner||UI.pause)return;if(G.mode==='net'&&(G.nw||typeof isHost!=='function'||!isHost()))return;const s=sideToAct();if(s<0)return;if(P(s).human)return;if(UI.busy)return;
  const base=ANIM?AIDELAY/(UI.speed||1):0;const hold=ANIM&&UI.hold?UI.hold-Date.now():0;aiTimer=setTimeout(()=>{aiTimer=null;aiStep()},Math.max(base,hold))}
function aiStep(){if(!G||G.winner)return;const s=sideToAct();if(s<0||P(s).human)return;const m=aiMove(s);if(!m){console.error('AI has no move in '+G.phase);return}
  const r=performMove(m,s);if(!r.success){console.error('AI move rejected: '+r.error+' '+mvKey(m));const vm=validMoves(s).filter(x=>x.act!=='sell');if(vm.length)performMove(vm[vm.length-1],s)}
  refresh()}
