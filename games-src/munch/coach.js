// ---------- coach: hints, warnings and the story layer. It only READS the game: every "what if" runs on a throw-away copy of G. ----------
const PERSONA={Pip:['the Plucky','first through every door, rarely first out'],Morwen:['the Grudge-Keeper','never forgets a curse, and always pays it back'],Grub:['the Mercenary','helps anyone… for a price'],
  Tansy:['the Lucky','trips over treasure wherever she goes'],Bodkin:['the Braggart','loud, proud and usually wrong'],Wrenna:['the Schemer','smiles sweetly and plans three turns ahead']};
const BARKS={
  Pip:{curse:['Sorry! Not sorry.','It had to be someone.'],help:['Heroes stick together!'],refuse:['Maybe next time!'],boost:['Oops, did I do that?'],stab:['Just a little poke!'],steal:['Your problem now!']},
  Morwen:{curse:['Oh, you wanted to WIN that?','I keep a list. You’re on it.','Nothing personal. Well… a little personal.'],help:['Fine. But I’ll remember this.'],refuse:['Help you? I’d rather hug the Nerd.'],boost:['Let’s make this interesting.','A little extra for your friend there.'],stab:['That’s for last time.'],steal:['Here, have my problem.']},
  Grub:{curse:['Business is business.','Nobody paid me not to.'],help:['One treasure and my axe is yours.','Pleasure doing business.'],refuse:['Not for that price, friend.','Grub works for pay.'],boost:['Somebody paid me to say: surprise!'],stab:['Nothing personal. Just coin.'],steal:['This one’s on the house.']},
  Tansy:{curse:['Whoops! Clumsy me.','Luck of the draw!'],help:['Lucky for you I’m here!'],refuse:['Not feeling lucky today.'],boost:['Feeling lucky, monster?'],stab:['Butterfingers!'],steal:['Lucky you!']},
  Bodkin:{curse:['Behold my mighty curse!'],help:['Stand back, I’ll handle this!'],refuse:['Beneath me, frankly.'],boost:['Even the monster needs a hero. Me.'],stab:['A masterful stab, if I say so myself.'],steal:['Watch and learn!']},
  Wrenna:{curse:['All part of the plan.','Did that hurt? Good.'],help:['Of course, darling. For now.'],refuse:['That doesn’t suit my plans.'],boost:['Just evening the odds.'],stab:['Shh. You didn’t see that.'],steal:['Exactly as planned.']}};
function heroTitle(p){const x=PERSONA[p.nm];return x?`${p.nm} ${x[0]}`:p.nm}
const isMe=i=>G&&i>=0&&G.mode!=='ai'&&P(i)&&P(i).human&&(G.mode!=='hot'||i===viewSeat())&&i===viewSeat();
const nmY=i=>esc(P(i).nm)+(isMe(i)?' (you)':'');
const plural=n=>n===1?'':'s';
const theM=n=>/^the /i.test(n)?n:'the '+n;const TheM=n=>{const t=theM(n);return t[0].toUpperCase()+t.slice(1)};
// ---- what-if: run fn on a copy of the game, then put everything back ----
function sim(fn){const g0=G,fx0=UI.fx.slice(),rej=UI.rej,le=UI.lastErr,ce=console.error;let r=null;
  try{G=JSON.parse(JSON.stringify(g0));console.error=function(){};r=fn()}catch(e){r=null}finally{G=g0;UI.fx=fx0;UI.rej=rej;UI.lastErr=le;console.error=ce}return r}
// the computer's choice for this seat at Normal skill, without touching the dice
function aiSafe(s){const p=P(s);const lv=p.lv,rng=G.rng;try{p.lv='normal';return aiMove(s)}catch(e){return null}finally{p.lv=lv;G.rng=rng}}
// ---- the "about to win" check ----
function fightGain(cb){let lv=0;const pure=cb.help<0&&cb.pb===0&&cb.bers===0&&itemBonus(P(cb.who),cb)===0;for(const m of cb.mons){const d=mdef(m);lv+=d.lv||1;if(d.sp==='fire'&&cb.fire)lv++;if(d.sp==='pure'&&pure)lv++}for(const k of cb.killed)if(k.kill){lv+=k.def.lv||1;if(k.def.sp==='pure'&&pure)lv++;if(k.def.sp==='fire'&&cb.fire)lv++}return lv}
function winThreat(cb){cb=cb||(G&&G.cb);if(!cb||G.winner||(!cb.mons.length&&!cb.killed.length))return null;if(cb.stage==='run'||!winning(cb))return null;const f=P(cb.who);const g=fightGain(cb);if(f.lvl+g<R.WIN)return null;return {who:cb.who,gain:g}}
function stopEval(who){if(G.winner)return G.winner==='P'+(who+1)?{stop:false,m:99}:{stop:true,m:-99};const cb=G.cb;if(!cb)return {stop:true,m:-99};if(cb.who!==who)return {stop:true,m:-50};
  const d=sideStr(cb)-monStr(cb);return {stop:!winThreat(cb),m:d}}
function counterCands(me,who){return validMoves(me).filter(m=>{if(!['play','join','backstab'].includes(m.act)||m.card==null)return false;const c=cd(m.card);
  if(m.act==='play'&&m.tgt==='p')return false;if(c.t==='level'||c.t==='race'||c.t==='class'||c.t==='item')return false;if(c.t==='curse'&&m.tgt!==who)return false;if(c.t==='enh'&&c.b<0)return false;if(c.sp==='steal'&&m.tgt!==who)return false;return true})}
function findCounter(me,who){const ms=counterCands(me,who);if(!ms.length)return {none:true};
  const res=ms.map(m=>({m,r:sim(()=>{apply(norm(m),me);if(!G.q)runOps();return stopEval(who)})})).filter(x=>x.r);
  const stops=res.filter(x=>x.r.stop).sort((a,b)=>a.r.m-b.r.m||cardValue(P(me),a.m.card)-cardValue(P(me),b.m.card));if(stops.length)return {one:stops[0].m};
  const top=res.sort((a,b)=>a.r.m-b.r.m).slice(0,5);
  for(const a of top)for(const b of top){if(a===b||a.m.card===b.m.card)continue;const r=sim(()=>{apply(norm(a.m),me);if(!G.q)runOps();if(!P(me).hand.includes(b.m.card))return null;apply(norm(b.m),me);if(!G.q)runOps();return stopEval(who)});if(r&&r.stop)return {two:[a.m,b.m]}}
  return {none:true,tried:ms.length}}
function winWarnHTML(me){const cb=G.cb;const t=winThreat(cb);if(!t)return '';const f=P(t.who);const sc=`${sideStr(cb)} vs ${monStr(cb)}`;
  if(isMe(t.who))return `<div class="winwarn me" role="status"><b>🏆 Win this fight and you WIN THE GAME!</b> <span>${sc}. Rivals get one last chance to stop you.</span></div>`;
  const she=f.sex==='f'?'she':'he',her=f.sex==='f'?'her':'him';
  let h=`<div class="winwarn" role="alert"><b>⚠ If ${esc(f.nm)} wins this fight ${she} WINS THE GAME.</b> <span>${sc}${f.lvl<R.WIN?`, level ${f.lvl} + ${t.gain}`:''}.</span>`;
  if(me<0||!P(me).human||t.who===me){return h+'</div>'}
  const now=sideToAct()===me&&cb.stage==='others'&&!G.q;
  const c=now?coach(me).counter:(G.q?null:sim(()=>{const x=G.cb;x.stage='others';x.ord=[me];x.oi=0;return findCounter(me,t.who)}));
  const lbl=m=>`${moveLabel(m)}${m.card!=null?'':''}`;
  if(!c)h+=`<span>Wait for your chance to interfere.</span>`;
  else if(c.one)h+=`<span>Best counter: <b>${lbl(c.one)}</b>${cd(c.one.card)?` (${esc(cname(c.one.card))})`:''}.${now?'':' Your chance comes when '+she+' presses Fight.'}</span>${now?`<div class="acts"><button class="btn primary rec" data-mv='${esc(JSON.stringify(c.one))}'>Stop ${her}: ${lbl(c.one)}</button></div>`:''}`;
  else if(c.two)h+=`<span>Stop ${her} with two cards: <b>${lbl(c.two[0])}</b> (${esc(cname(c.two[0].card))}), then <b>${lbl(c.two[1])}</b> (${esc(cname(c.two[1].card))}).</span>${now?`<div class="acts"><button class="btn primary rec" data-mv='${esc(JSON.stringify(c.two[0]))}'>Step 1: ${lbl(c.two[0])}</button></div>`:''}`;
  else h+=`<span><b>You can’t stop this one</b> with the cards in your hand.</span>`;
  return h+'</div>'}
// ---- fight advice for the fighter ----
function runOdds(p,cb){let all=1;const rows=[];for(const m of cb.mons){const c=mdef(m);let pr,need=null;
    if(c.sp==='noescape')pr=0;else if(cb.wall)pr=1;else if(c.nop&&p.lvl<=c.nop&&!(c.sp==='nopNotElf'&&isRace(p,'elf')))pr=1;
    else{const mod=runMod(p,cb,m)+(cb.used['f'+p.i]||0)+persMod(p,'die');need=R.RUN-mod;pr=Math.max(0,Math.min(6,7-need))/6}
    all*=pr;rows.push({c,pr,need})}return {all,rows}}
const pct=x=>Math.round(x*100)+'%';
function helpOffers(me){const cb=G.cb;const asks=validMoves(me).filter(m=>m.act==='ask');const who=[...new Set(asks.map(m=>m.tgt))];const out=[];
  for(const i of who){const o=P(i);const wins=sideStr(cb)+pStr(o)>monStr(cb)||(sideStr(cb)+pStr(o)===monStr(cb)&&(isCls(o,'warrior')||isCls(P(me),'warrior')));const ns=asks.filter(m=>m.tgt===i).map(m=>m.opt).sort((a,b)=>a-b);
    let yes=null;if(wins&&!o.human){for(const n of ns){const ok=sim(()=>{apply({act:'ask',tgt:i,opt:n},me);if(!G.q)return G.cb&&G.cb.help===i;if(G.q.who!==i)return false;const a=aiMove(i);return !!a&&a.opt==='yes'});if(ok){yes=n;break}}}
    out.push({i,str:pStr(o),wins,yes,human:o.human})}return out}
function cardFixes(me){const cb=G.cb;const vm=validMoves(me);const seen=new Set();const out=[];
  for(const m of vm){if(!['play','berserk','turn','skip','shoo','bribe','charm'].includes(m.act))continue;if(m.act==='play'){const c=cd(m.card);if(m.tgt==='m'||c.t==='curse'||c.t==='level'||(c.t==='enh'&&c.b>0)||c.sp==='transfer'||c.sp==='wander'||c.sp==='steal'||c.sp==='hire'||c.sp==='divine')continue}
    const k=m.act==='play'?mvKey(m):m.act;if(seen.has(k))continue;
    const r=sim(()=>{apply(norm(m),me);if(!G.q)runOps();if(G.winner)return 'win';if(!G.cb)return 'gone';return G.cb.who===me&&winning(G.cb)?'win':null});
    if(r){seen.add(k);out.push({m,r,v:m.card!=null?cardValue(P(me),m.card):0})}}
  return out.sort((a,b)=>(a.r==='win'?0:1)-(b.r==='win'?0:1)||a.v-b.v)}
function fightAdvice(me){const cb=G.cb,p=P(me);const a=sideStr(cb),b=monStr(cb);const lines=[];let rec=null,why='';
  if(winning(cb)){const boosts=p.hand.filter(id=>cd(id).t==='oneshot'&&cd(id).b&&!cd(id).sp);const rivals=alive().filter(o=>o!==p&&o.hand.length).length;
    rec={act:'fight'};why=`You win ${a} vs ${b}${a===b?' (Warriors win ties)':''}.`;lines.push(`Press <b>Fight!</b> Before it ends, each rival (${rivals} with cards) gets one chance to boost the monster.`);
    if(boosts.length)lines.push(`Keep ${esc(cname(boosts[0]))} (+${cd(boosts[0]).b}) ready in case they do.`);else if(a-b<3&&rivals)lines.push('Your lead is small: a single monster boost could turn it.');
    return {rec,why,lines}}
  const offers=helpOffers(me),fixes=cardFixes(me),odds=runOdds(p,cb);
  const bad=cb.mons.map(m=>`<b>${esc(mdef(m).n)}</b>: ${esc(mdef(m).badt||'lose a level')}`).join('; ');
  const yes=offers.filter(o=>o.yes!=null).sort((x,y)=>x.yes-y.yes||threat(P(x.i))-threat(P(y.i)));
  const winFix=fixes.find(f=>f.r==='win'),goneFix=fixes.find(f=>f.r==='gone');
  const deadly=cb.mons.some(m=>isDeadly(mdef(m)))||cb.mons.some(m=>(mdef(m).bad||[]).some(o=>o[0]==='lvl'&&(o[1]==='all'||o[1]>=3)));
  const runTxt=odds.rows.length===1?(odds.rows[0].pr===0?'impossible':odds.rows[0].pr===1?'automatic':`roll ${odds.rows[0].need}+ (${pct(odds.all)})`):`${pct(odds.all)} to get away from all of them`;
  why=`You lose ${a} vs ${b}.`;
  if(yes.length){const o=yes[0];rec={act:'ask',tgt:o.i,opt:o.yes};why+=` Ask ${esc(P(o.i).nm)}: ${o.str} strength makes ${a+o.str} vs ${b}, and ${P(o.i).sex==='f'?'she':'he'}’ll help for ${o.yes} treasure${plural(o.yes)}.`}
  else if(winFix){rec=winFix.m;why+=` ${moveLabel(winFix.m)}${winFix.m.card!=null?' ('+esc(cname(winFix.m.card))+')':''} wins it.`}
  else if(goneFix&&(deadly||odds.all<.5)){rec=goneFix.m;why+=` ${moveLabel(goneFix.m)}${goneFix.m.card!=null?' ('+esc(cname(goneFix.m.card))+')':''} gets rid of it: safer than running (${pct(odds.all)}).`}
  else{rec={act:'run'};why+=` Nobody will help and no card wins it: run away (${runTxt}).`}
  const hl=offers.map(o=>`${esc(P(o.i).nm)} (${o.str}): ${!o.wins?'not enough':o.human?'would win, if they agree':o.yes!=null?`wins, helps for ${o.yes}`:'would win but won’t help'}`);
  if(hl.length)lines.push('Helpers: '+hl.join(' · ')+'.');else if(cb.nohelp)lines.push('Nobody may help against this monster.');
  if(winFix&&rec!==winFix.m)lines.push(`Or play ${esc(winFix.m.card!=null?cname(winFix.m.card):moveLabel(winFix.m))}: it wins the fight.`);
  lines.push(odds.all>=1?`Running: automatic here.`:`Running: ${runTxt}. If caught: ${bad}.`);
  return {rec,why,lines}}
// ---- reasons for calm-phase suggestions ----
function firstSentence(t){const m=String(t||'').match(/^[^.!]*[.!]/);return m?m[0]:t}
function reasonPlay(m,me){const c=m.card!=null?cd(m.card):null;const p=P(me);switch(m.act){
  case 'play':if(c.t==='race'||c.t==='class'){const x=String(c.x||'');return esc(x.length>72?x.slice(0,x.lastIndexOf(' ',70))+'…':x)}if(c.t==='level')return m.tgt===me?'a free level':'';if(c.t==='item'){const b=(c.elfb&&isRace(p,'elf'))?c.elfb:(c.b||0);return equipWhy(p,m.card)?'carried: sell it later':`+${b} strength`}
    if(c.t==='curse')return `hurts ${esc(P(m.tgt).nm)}, who leads`;if(c.sp==='half'||c.sp==='super'||c.sp==='hire')return firstSentence(c.x);if(c.sp==='steal')return 'a level from the leader';return '';
  case 'equip':return `+${cd(m.card).b||0} strength`;case 'unequip':return 'makes room for something better';case 'sell':return 'junk for a level';default:return ''}}
function planLabel(m,me){if(m.act==='play'&&m.card!=null&&cd(m.card).t==='special'&&/^Play/.test(moveLabel(m)))return `Play ${esc(cname(m.card))}`;if(m.act==='sell')return `Sell ${m.cards.split(',').map(x=>esc(cname(+x))).join(' + ')}`;const l=moveLabel(m);const c=m.card!=null?cd(m.card):null;
  if(m.act==='play'&&c)return c.t==='race'||c.t==='class'?`Become ${esc(c.n)}`:c.t==='item'?`Put on ${esc(c.n)}`:c.t==='level'?`${esc(c.n)}`:`${l} (${esc(c.n)})`;
  if(m.act==='equip')return `Wear ${esc(cname(m.card))}`;return l}
function calmPlan(me){return sim(()=>{const out=[];for(let k=0;k<7;k++){if(sideToAct()!==me||G.q)break;const m=aiSafe(me);if(!m)break;
  const r=reasonPlay(m,me);out.push({m,label:planLabel(m,me),why:r});if(!['play','equip','unequip','sell','drop'].includes(m.act))break;const x=performMove(m,me);if(!x.success)break}return out})||[]}
function discardWhy(id,me){const c=cd(id),p=P(me);if(c.t==='monster')return c.lvl>=pStr(p)+3?`Lv ${c.lvl}: you can’t beat it`:'a monster you can fight later, but weakest here';if(c.t==='curse')return 'weakest card left';
  if(c.t==='item')return !reqOK(p,c)?'you can’t use it':`only +${c.b||0}`;if(c.t==='oneshot')return `only +${c.b||0}`;if(c.t==='race'||c.t==='class')return 'you already have one';return 'weakest card'}
// ---- one coach result per game state (renders happen often) ----
function coach(me){if(!G||me<0||!P(me)||!P(me).human)return {};const key=[G.ln,G.turn,G.phase,sideToAct(),G.q&&G.q.kind,G.cb&&G.cb.stage,G.cb&&G.cb.who,UI.hints,me].join('|');if(UI.coachKey===key)return UI.coachRes;
  let r={};try{r=coachNow(me)}catch(e){r={}}UI.coachKey=key;UI.coachRes=r;return r}
function vm0(me){return validMoves(me)}
function coachNow(me){const s=sideToAct();const p=P(me);const r={};if(s!==me)return r;const cb=G.cb;
  if(G.q){const q=G.q;const m=aiSafe(me);r.rec=m;
    if(q.kind==='help'){const f=P(q.from);const g=fightGain(cb);if(f.lvl+g>=R.WIN){r.rec={act:'opt',opt:'no'};r.why=`Refuse! Winning this fight makes ${esc(f.nm)} level ${R.WIN}: ${f.sex==='f'?'she':'he'} would WIN THE GAME.`}
      else{const tot=sideStr(cb)+pStr(p),mb=monStr(cb);const w=tot>mb||(tot===mb&&(isCls(p,'warrior')||isCls(f,'warrior')));const elf=isRace(p,'elf');const ahead=f.lvl-p.lvl;
        if(!w){r.rec={act:'opt',opt:'no'};r.why=`Refuse: even together you lose ${tot} vs ${mb}, and you would both have to run.`}
        else if((q.n>=1||elf)&&ahead<3){r.rec={act:'opt',opt:'yes'};r.why=`Say yes: together you win ${tot} vs ${mb}, and you get ${q.n} treasure${plural(q.n)}${elf?' plus a level (you’re an Elf)':''}. ${esc(f.nm)} gains ${g} level${plural(g)}.`}
        else{r.rec={act:'opt',opt:'no'};r.why=ahead>=3?`Refuse: you’d win together, but ${esc(f.nm)} is already ${ahead} levels ahead of you and would gain ${g} more.`:`Refuse: you’d win together, but there’s no pay and ${esc(f.nm)} gains ${g} level${plural(g)}.`}}}
    else if(q.kind==='ward')r.why=m&&m.opt==='yes'?'Cancel it: this curse would really hurt.':'Let it happen: it’s a mild one, keep your ring for something worse.';
    else if(q.kind==='rescue'){const c=mdef(runMon(cb.runs[q.run]));const ops=c.bad||[];const heavy=ops.some(o=>['death','orcs','dread','race','cls','clsOr','clsOr1','swap','hippo','troll','pixie','lowest','gold','handOr','slugs'].includes(o[0])||(o[0]==='lvl'&&(o[1]==='all'||o[1]>=2))||(o[0]==='item'&&o[2]==='all'));const use=vm0(me).filter(x=>x.act==='use').sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card));
      if(heavy&&use.length){r.rec=use[0];r.why=`Use ${esc(cname(use[0].card))}: the Bad Stuff (${esc(c.badt||'')}) is worse than losing the card.`}else{r.rec={act:'opt',opt:'no'};r.why=`Take it: “${esc(c.badt||'lose a level')}” is mild, keep your escape card for something worse.`}}
    else if(q.kind==='pick'&&m){const v=q.opts[m.opt];r.why=typeof v==='number'?`Pick ${esc(cname(v))}.`:''}
    return r}
  const ph=G.phase;
  if(ph==='combat'&&cb){if(cb.stage==='act'&&cb.who===me){const a=fightAdvice(me);r.rec=a.rec;r.why=a.why;r.lines=a.lines;return r}
    if(cb.stage==='others'){{const t=winThreat(cb);if(t&&t.who!==me){r.counter=findCounter(me,t.who);r.rec=r.counter.one||(r.counter.two&&r.counter.two[0])||{act:'pass'};if(r.rec.card!=null)r.card=r.rec.card;r.threat=true;return r}}
      // steal the fight: Not-My-Problem on yourself when you would win it
      const tr=validMoves(me).filter(m=>m.act==='play'&&cd(m.card).sp==='transfer'&&m.tgt===me);
      if(tr.length&&cb.who!==me){const x=sim(()=>{apply(norm(tr[0]),me);const c=G.cb;return c&&c.who===me&&winning(c)?{a:sideStr(c),b:monStr(c),lv:fightGain(c),tr:cbTreasure(c),deadly:c.mons.some(m=>isDeadly(mdef(m)))}:null});
        if(x&&!x.deadly&&x.a-x.b>=1&&p.lvl+x.lv<=R.WIN){r.rec=tr[0];r.card=tr[0].card;r.why=`Steal this fight! With ${esc(cname(tr[0].card))} you take it over: ${x.a} vs ${x.b}, +${x.lv} level${plural(x.lv)}${p.lvl+x.lv>=R.WIN?' and THE WIN':''} and ${x.tr} treasure${plural(x.tr)} for you.`;return r}}
      if(cb.help===me){r.rec={act:'pass'};r.why=winning(cb)?'You’re helping and winning: let it be.':'You’re helping but losing: a one-shot for the heroes would turn it.';const m=aiSafe(me);if(m)r.rec=m;return r}
      const m=aiSafe(me);r.rec=m||{act:'pass'};if(m&&m.act!=='pass'){r.card=m.card;r.why=`${esc(P(cb.who).nm)} is ${P(cb.who).lvl>=p.lvl+1?'ahead of you':'dangerous'}: ${moveLabel(m)} makes the monster win.`}
      else r.why=winning(cb)?`${esc(P(cb.who).nm)} wins this one. Nothing worth spending on it: let it be.`:`${esc(P(cb.who).nm)} is losing already: let it be.`;return r}}
  if(ph==='charity'){const m=aiSafe(me);if(m){r.rec=m;r.card=m.card;r.disc=true;r.why=`Too many cards: ${m.act==='give'?'give away':'discard'} the weakest. Suggested: <b>${esc(cname(m.card))}</b> (${discardWhy(m.card,me)}).`}return r}
  if(ph==='window'){const m=aiSafe(me);const cur=curPl();r.rec=m||{act:'pass'};if(m&&m.act!=='pass'){r.card=m.card;r.why=`${moveLabel(m)} with ${esc(cname(m.card))}: ${cd(m.card).t==='level'?'a free level':`${esc(cur.nm)} ${cur.lvl>p.lvl?'is ahead of you':cur.lvl===p.lvl?'is level with you':'is close behind'}, and a curse now hits before ${cur.sex==='f'?'her':'his'} turn`}.`}else r.why=`Nothing worth playing on ${esc(cur.nm)} right now: let ${cur.sex==='f'?'her':'him'} go on.`;
    const by=((G.rv||{})[me]||{})[cur.i];if(by&&by.curse>=2&&p.hand.some(id=>cd(id).t==='curse'))r.why+=` ${esc(cur.nm)} has cursed you ${by.curse} times. Payback?`;return r}
  if(['setup','main','after','post'].includes(ph)){const plan=calmPlan(me);if(plan.length){r.rec=plan[0].m;if(plan[0].m.card!=null&&['play','equip','unequip'].includes(plan[0].m.act))r.card=plan[0].m.card;r.plan=plan}
    const lead=alive().filter(o=>o!==p).sort((a,b)=>b.lvl-a.lvl)[0];
    if(lead&&lead.lvl-p.lvl>=3&&ph!=='setup')r.catchup=`You’re ${lead.lvl-p.lvl} levels behind ${esc(lead.nm)}. Help ${esc(lead.nm)}’s rivals for treasure, curse the leader, and stay out of fights you can’t win.`;
    if(ph==='after'&&p.hand.length<=1)r.low=`You’re down to ${p.hand.length} card${plural(p.hand.length)}: loot the room to refill.`;
    return r}
  return r}
// cards that are legal but would hurt you (dimmed, with a warning)
function riskyCard(me,id){const c=cd(id),p=P(me);if(c.t==='monster'&&G.phase==='after'&&G.active===me){const r=sim(()=>{apply({act:'trouble',card:id},me);if(!G.cb)return null;return {a:sideStr(G.cb),b:monStr(G.cb),w:winning(G.cb)}});if(r&&!r.w)return `Lv ${c.lvl}${r.b!==c.lvl?' ('+r.b+' here)':''} vs your ${r.a}: you’d lose`}return ''}
// ---- the story layer: barks, hits on you, narrated outcomes ----
function pickLine(arr,n){return arr[Math.abs(n)%arr.length]}
function youify(t,nm){const e=nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return t.replace(new RegExp(`${e}'s`,'g'),'your').replace(new RegExp(`^💀 ${e} dies`),'💀 You die').replace(new RegExp(`^${e} is`),'You are').replace(new RegExp(`^${e} (loses|discards|drops|has|can|rolls|stays)`),(m,v)=>'You '+({loses:'lose',discards:'discard',drops:'drop',has:'have',can:'can',rolls:'roll',stays:'stay'})[v]).replace(new RegExp(`\\b${e}\\b`,'g'),'you').replace(/^./,x=>x.toUpperCase())}
function scanLog(){if(!G)return;if(UI.gid!==G.gid){UI.gid=G.gid;UI.ln=G.ln||0;UI.bark={};UI.toast=null;UI.barkLog=[];return}
  const seen=UI.ln||0;if((G.ln||0)<=seen)return;const nw=G.log.filter(l=>l.n>seen).reverse();UI.ln=G.ln||0;const now=Date.now();const me=viewSeat();const hits=[];UI.bark=UI.bark||{};UI.barkLog=UI.barkLog||[];
  const human=me>=0&&P(me).human&&G.mode!=='ai';const nm=human?P(me).nm:null;
  for(const l of nw){const t=l.t;
    if(l.s>=0&&!P(l.s).human){let k=null;if(/ curses (?!themselves)/.test(t))k='curse';else if(/ agrees to help/.test(t))k='help';else if(/ refuses to help/.test(t))k='refuse';else if(/ tougher with | for the monsters\.| as an uninvited guest/.test(t))k='boost';else if(/ backstabs /.test(t))k='stab';else if(/ now has to fight!/.test(t))k='steal';
      if(k){const B=BARKS[P(l.s).nm]||BARKS.Pip;const line=pickLine(B[k],l.n);UI.bark[l.s]={t:line,until:now+8000};UI.barkLog.unshift({s:l.s,t:line,n:l.n});UI.barkLog.length=Math.min(UI.barkLog.length,6)}}
    if(human){const e=nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const re=new RegExp(`curses ${e}:|from ${e}'s hand|from ${e}\\.|^${e} loses|^💀 ${e} dies|^${e} discards \\d|backstabs ${e}|: ${e} now has to fight|steals a level from ${e}|^${e} drops to|^${e} is hit by a curse|^${e} is now|^${e} can no longer`);
      if(re.test(t)&&!/charity|charms|a bribe|thrown for the hound|snack|to make room|takes off/.test(t))hits.push(youify(t,nm));
      if(l.s===me&&/^Bad Stuff from /.test(t))hits.push(t)}}
  if(hits.length){UI.toast={t:hits.slice(0,4).join(' '),until:now+7000};if(ANIM&&AIDELAY>0)UI.hold=now+1800}}
function toastHTML(){const t=UI.toast;if(!t||t.until<Date.now())return '';const fresh=UI.toastSeen!==t;UI.toastSeen=t;return `<div class="toast${fresh?' fresh':''}" role="alert"><b>💥 Ouch!</b> ${esc(t.t)}</div>`}
function barkOf(i){const b=UI.bark&&UI.bark[i];return b&&b.until>Date.now()?b.t:''}
// narrated fight outcome (the table caption and the dock)
function narrate(o){const f=P(o.who),h=o.help>=0?P(o.help):null;const you=isMe(o.who);const F=you?'You':esc(f.nm);const M0=o.mons[0]||'monster';const M=esc(M0.replace(/^the /i,''));const n=o.turn+o.who;
  if(o.won){const t=you?[`You beat the ${M} senseless${h?` with ${esc(h.nm)}`:''}.`,`${h?`You and ${esc(h.nm)}`:'You'} send the ${M} howling back into the dark.`,`The ${M} never stood a chance against you${h?` and ${esc(h.nm)}`:''}.`]
      :[`${F}${h?` and ${nmY(h.i)}`:''} beat the ${M} senseless.`,`${F} sends the ${M} howling back into the dark${h?` with ${nmY(h.i)}’s help`:''}.`,`The ${M} never stood a chance against ${F}${h?` and ${nmY(h.i)}`:''}.`];return pickLine(t,n)}
  const mine=o.runs.filter(r=>r.w===o.who);if(o.dead&&o.dead.includes(o.who))return you?`The ${M} gets you. The rivals pick over your stuff.`:`The ${M} gets ${F}. The rivals pick over the body.`;
  if(mine.length){const caught=mine.some(r=>!r.ok);return caught?(you?`You flee the ${M}… not fast enough.`:`${F} flees the ${M}… not fast enough.`):(you?`You flee the ${M}, heart pounding. No harm done.`:`${F} flees the ${M}, heart pounding.`)}
  return `The ${M} is gone. Nobody gets its treasure.`}
function outcomeHead(o){const you=isMe(o.who);const f=P(o.who);const lost=(o.lost||[]).find(x=>x.i===o.who);
  if(o.won)return {cls:'win',h:you?'🎉 Victory!':`⚔ ${esc(f.nm)} wins the fight`,sub:`+${o.lv} level${plural(o.lv)} · ${o.tr} treasure${plural(o.tr)}${o.help>=0?` (${esc(P(o.help).nm)} helped)`:''}`};
  if(o.dead&&o.dead.includes(o.who))return {cls:'bad',h:'💀 Killed!',sub:`${you?'You lose':esc(f.nm)+' loses'} every item and card (level and race stay)`};
  const mine=o.runs.filter(r=>r.w===o.who);if(mine.length){const caught=mine.some(r=>!r.ok);const d=lost&&lost.d<0?`−${-lost.d} level${plural(-lost.d)}`:'';
    return caught?{cls:'bad',h:'💥 Caught: Bad Stuff!',sub:d||'the Bad Stuff hits'}:{cls:'run',h:'🏃 Ran away',sub:d?d+' just for fleeing':'no harm done'}}
  return {cls:'run',h:'The fight is over',sub:'the monsters left: no treasure'}}
// ---- end of game recap ----
function recapHTML(){const W=G.winner?P(+G.winner.slice(1)-1):null;const me=viewSeat();const human=me>=0&&P(me).human&&G.mode==='F';const L=[];
  if(W)L.push(`${human&&W.i===me?'You':esc(heroTitle(W))} won with ${W.st.kills} kill${plural(W.st.kills)}${W.st.helps?` and ${W.st.helps} help${plural(W.st.helps)}`:''}.`);
  if(human){const p=P(me);const rv=(G.rv||{})[me]||{};const by=Object.keys(rv).map(k=>({i:+k,n:rv[k].curse,x:rv[k].curse+rv[k].boost+rv[k].stab})).sort((a,b)=>b.n-a.n||b.x-a.x);
    L.push(`You reached level ${p.lvl}. You were cursed ${p.st.cursed} time${plural(p.st.cursed)}${by[0]&&by[0].n?`, most by ${esc(P(by[0].i).nm)} (${by[0].n})`:''}.`);
    const moms=(G.mom||[]).filter(m=>m.who===me);const st=moms.find(m=>m.stolen);const big=moms.slice().sort((a,b)=>b.lvl-a.lvl)[0];
    L.push(st?`Best moment: stealing a fight with Not-My-Problem and beating ${esc(theM(st.mon))}.`:big?`Best moment: beating ${esc(theM(big.mon))} (level ${big.lvl})${big.help>=0?` with ${esc(P(big.help).nm)}’s help`:''}.`:p.st.helps?`Best moment: helping rivals ${p.st.helps} time${plural(p.st.helps)}.`:'Best moment: surviving. The dungeon will remember you. Vaguely.');
    const nem=by.find(x=>x.x>=2);if(nem&&!(W&&W.i===me))L.push(`Your nemesis: ${esc(heroTitle(P(nem.i)))}.`)}
  return `<div class="recap">${L.map(x=>`<p>${x}</p>`).join('')}</div>`}
function introHTML(n,mode){const names=(UI.names||HERO_NAMES).slice(0,n);const me=mode==='F'?names[0]:null;const riv=names.filter(x=>x!==me);
  return `<p class="intro">The Doorkick Dungeon opens once a year. ${n} fools go in; one comes out a <b>Level 10 Legend</b>.</p><ul class="cast">${me?`<li><b>You: ${esc(me)} ${PERSONA[me]?PERSONA[me][0]:''}</b></li>`:''}${riv.map(x=>`<li><b>${esc(x)} ${PERSONA[x]?PERSONA[x][0]:''}</b>${PERSONA[x]?': '+PERSONA[x][1]:''}</li>`).join('')}</ul>`}
// ---- auto-continue: skip a prompt where the only legal move is "pass" (and nothing is at stake) ----
function autoPass(){if(G&&G.mode==='net')return;for(let k=0;k<12&&G&&!G.winner;k++){const s=sideToAct();if(s<0||!P(s).human)return;
  if(!(G.phase==='window'||(G.phase==='combat'&&G.cb&&G.cb.stage==='others'))||G.q)return;const vm=validMoves(s);if(vm.length!==1||vm[0].act!=='pass')return;if(G.cb&&winThreat(G.cb))return;
  const r=performMove(vm[0],s);if(!r.success)return}}
