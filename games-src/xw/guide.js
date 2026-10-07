// ---------- guidance layer (interface only, no rules): coach moments, advisor, round recap, attack result cards, radio chatter, auto-setup ----------
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
try{UI.coachDone=JSON.parse(localStorage.getItem('na_coach')||'{}')||{}}catch(e){}
Object.assign(UI,{ev:{},evG:null,results:[],kills:[],taken:{},radio:null,coachOn:null,advOpen:false,recapSeen:0,statLast:{},statChg:{},statG:null,autoSetup:false,pendAtk:null});
function resetGuide(){Object.assign(UI,{ev:{},evG:G,results:[],kills:[],taken:{},radio:null,coachOn:null,recapSeen:0,pendAtk:null})}
// ---- every log line also feeds the recap and the radio (the battle log itself is unchanged, apart from one plainer phrase) ----
const _lg0=lg;lg=function(side,t){t=String(t).replace(/ jinks: /,' uses its pilot ability (1 focus → evade): ');_lg0(side,t);try{if(G)noteLog(side,t)}catch(e){}};
function noteLog(side,t){if(UI.evG!==G)resetGuide();const r=G.round;const L=(UI.ev[r]=UI.ev[r]||[]);L.push({s:side,t});if(L.length>120)L.shift();
  const P=UI.pendAtk;if(P){const d=ship(P.d);const m=d&&t.startsWith(d.name+' suffers a critical hit: ')&&t.slice(d.name.length+26).split('.')[0];if(m){const c=Object.keys(DAMAGE).find(k=>DAMAGE[k].n===m);if(c)P.crits.push(c)}}
  radioFor(side,t);
  // the battle can end where the rules code does not redraw (a cockpit fire at the start of combat): redraw once
  if(G.winner&&t===G.winText&&(isHuman(0)||isHuman(1)))setTimeout(()=>{try{render()}catch(e){}},0)}
const byName=(n,side)=>G.ships.find(s=>s.name===n&&(side==null||side<0||s.side===side));
function say(s,lines,vars){if(!s)return;let t=pickLine(lines);for(const k in vars||{})t=t.split('{'+k+'}').join(vars[k]);UI.radio={who:shortName(s),side:s.side,t,r:G.round}}
function radioFor(side,t){let m;
  if(/ fires (.*)at /.test(t)&&G.atk){const a=ship(G.atk.a),d=ship(G.atk.d);if(a&&d)say(a,CHAT.fire[G.fac[a.side]]||CHAT.fire[0],{t:callSign(d)});return}
  if(m=t.match(/^(.+) is destroyed!/)){const v=byName(m[1],side);if(!v)return;const me=soloSide();const friend=alive().find(o=>o.side===v.side),foe=alive().find(o=>o.side!==v.side);
    if(me>=0&&v.side===me&&friend)say(friend,CHAT.lost,{v:callSign(v)});else if(foe)say(foe,CHAT.boom,{v:callSign(v)});return}
  if(m=t.match(/^(.+) bumps into /)){say(byName(m[1],side),CHAT.bump);return}
  if(m=t.match(/^(.+) suffers a critical hit: ([^.]+)\./)){say(byName(m[1],side),CHAT.crit,{c:m[2]});return}
  if(m=t.match(/^(.+) evades every shot/)){say(byName(m[1],side),CHAT.miss);return}
  if(m=t.match(/^(.+) (flies through|lands on) an asteroid/)){say(byName(m[1],side),CHAT.rock);return}
  if(m=t.match(/^(.+) flies a red maneuver/)){if(Math.random()<.4)say(byName(m[1],side),CHAT.stress);return}
  if(/^Round \d+:/.test(t)&&G.round>=2){const al=alive();if(al.length){const s=al[Math.floor(Math.random()*al.length)];say(s,CHAT.round[G.fac[s.side]]||CHAT.round[0])}}}
// ---- attack result cards: snapshot the defender when the defense is final, compare when the attack is over ----
// (no engine function is wrapped here: the rules code runs whole rounds on one call stack when animations are off)
function attackWatch(){if(!G)return;const A=G.atk;const P=UI.pendAtk;if(P&&P.A!==A)finishAtk();
  if(A&&G.phase==='dmod'&&(!UI.pendAtk||UI.pendAtk.A!==A)){const d=ship(A.d);if(d)UI.pendAtk={A,a:A.a,d:A.d,rg:A.rg,r:G.round,sh0:d.sh,hp0:d.hull-hullDmg(d),crits:[],rolled:cnt(A.dice,'hit')+cnt(A.dice,'crit')}}}
function finishAtk(){const P=UI.pendAtk;if(!P||!G)return;UI.pendAtk=null;const a=ship(P.a),d=ship(P.d);if(!a||!d)return;
  const hp1=d.alive?d.hull-hullDmg(d):0,sh1=d.sh,dmg=Math.max(0,P.sh0-sh1)+Math.max(0,P.hp0-hp1);
  UI.taken[d.id]=(UI.taken[d.id]||0)+dmg;if(!d.alive)UI.kills.push({by:a.id,v:d.id,r:P.r,rg:P.rg});
  const R={dice:(P.A.dice||[]).slice(),def:(P.A.def||[]).slice(),rolled:P.rolled,a:a.id,d:d.id,dmg,sh0:P.sh0,sh1,hp0:P.hp0,hp1,crits:P.crits,dead:!d.alive,r:P.r,rg:P.rg,t:Date.now()};UI.results.unshift(R);if(UI.results.length>40)UI.results.length=40;
  if(d.alive&&dmg&&!P.crits.length)say(d,sh1>0?CHAT.shields:P.sh0>0?CHAT.shieldsdown:CHAT.hull)}
function resultHTML(R,plain){const a=ship(R.a),d=ship(R.d);if(!a||!d)return '';const me=soloSide();const you=d.side===me,yours=a.side===me;
  const an=yours?`You (${esc(a.name)})`:esc(a.name),dn=you?`you (${esc(d.name)})`:esc(d.name);
  let h=`<b>${an}</b> ${R.dmg||R.crits.length?(yours?'hit':'hits'):(yours?'missed':'misses')} <b>${dn}</b>`;
  if(R.dmg){const parts=[];if(R.sh0!==R.sh1)parts.push(`shields ${R.sh0} → ${R.sh1}`);if(R.hp0!==R.hp1)parts.push(`hull ${R.hp0} → ${R.hp1}`);h+=`: <b>${R.dmg} damage</b>${parts.length?' ('+parts.join(', ')+')':''}.`}
  else h+=R.rolled===0?': no hits rolled.':': every hit was cancelled by evade results.';
  // the arithmetic, so a cancelled shot is never a mystery: hits and crits rolled against evades rolled
  {const c=(L,f)=>(L||[]).filter(x=>x===f).length;const hi=c(R.dice,'hit'),cr=c(R.dice,'crit'),ev=c(R.def,'evade');
    if(R.rolled!==0)h+=` <span class="sum">(${hi} hit${hi===1?'':'s'}${cr?` + ${cr} crit${cr>1?'s':''}`:''} vs ${ev} evade${ev===1?'':'s'}${R.def&&R.def.length?` from ${R.def.length} defence ${R.def.length===1?'die':'dice'}`:''}; each evade cancels one)</span>`}
  if(plain)return h+(R.crits.length?' Crit: '+R.crits.map(c=>DAMAGE[c].n).join(', ')+'.':'')+(R.dead?' Destroyed!':'');
  for(const c of R.crits)h+=`<div class="crit">✸ CRIT <b>${esc(DAMAGE[c].n)}</b>: ${you?'your ':esc(d.name)+'’s '}${esc(critPlain(c,d))}</div>`;
  if(R.dead)h+=`<div class="bad"><b>${you?'You are':esc(d.name)+' is'} destroyed!</b></div>`;
  return `<div class="result ${you?'hurt':yours?'good':''}">${h}</div>`}
// ---- stat changes pulse for a moment ----
function trackStats(){if(!G)return;if(UI.statG!==G){UI.statLast={};UI.statChg={};UI.statG=G}const now=Date.now();
  for(const s of G.ships){const v={ps:psOf(s),a:primary(s),g:agility(s),h:s.alive?s.hull-hullDmg(s):0,s:s.sh};const o=UI.statLast[s.id];if(o)for(const k in v)if(v[k]!==o[k])(UI.statChg[s.id]=UI.statChg[s.id]||{})[k]=now;UI.statLast[s.id]=v}}
const pulse=(s,k)=>{const c=UI.statChg[s.id];return c&&c[k]&&Date.now()-c[k]<2600?' pulse':''};
// ---- recommended setup spots (the highlighted default) and auto-placement ----
function recOpt(q){if(q.key==='rock'){let best=q.opts[0],bv=1e9;for(const o of q.opts){const m=/^([A-E])([1-5])$/.exec(o.l);if(!m)continue;const v=Math.abs('ABCDE'.indexOf(m[1])-2)+Math.abs(+m[2]-4)*1.2;if(v<bv){bv=v;best=o}}
    return {o:best,why:'in their half, where it blocks their approach and not yours'}}
  if(q.key==='deploy'){let best=q.opts[0],bv=1e9;for(const o of q.opts){const n=+String(o.l).slice(5);const v=Math.abs(n-5);if(v<bv){bv=v;best=o}}return {o:best,why:best.l==='Spot 5'?'the centre: start central so you can turn either way':'the free spot nearest the centre, so you can turn either way'}}
  return {o:q.opts[0],why:''}}
// Auto-place answers every remaining setup question of the human side at once, with the recommended spot
function autoPlaceAll(){if(typeof isClient==='function'&&isClient()){if(humanTurn())netSend({act:'autoplace'});return}let guard=0;while(G&&G.round<1&&!G.winner&&G.phase==='ask'&&G.q&&['rock','deploy'].includes(G.q.key)&&humanTurn()&&guard++<40){const kid=G.q.kid;uiAct({act:'ask',k:recOpt(G.q).o.k});if(G.q&&G.q.kid===kid)break}render()}
// ---- suggestion with its reason and its cost ----
function sugInfo(s,i){const m0=dialOf(s)[i],m=exColor(s,m0),b=B(s),p=finalPose(s,b,m0);const en=enemiesOf(s);
  const mine=en.map(e=>{const r=arcReach(p,b,e,B(e),s.arc);return r&&rangeOf(r.d)<=3?{e,rg:rangeOf(r.d)}:null}).filter(Boolean).sort((x,y)=>x.rg-y.rg);
  const theirs=en.filter(e=>{const q=arcReach(e,B(e),p,b,e.arc);return q&&rangeOf(q.d)<=3});
  const d0=Math.min(...en.map(e=>baseDist(s,b,e,B(e)))),d1=Math.min(...en.map(e=>baseDist(p,b,e,B(e))));let why;
  if(mine.length&&!theirs.length)why=`puts ${esc(mine[0].e.name)} in your arc at range ${mine[0].rg} while you stay out of its arc`;
  else if(mine.length)why=`lines up a shot on ${esc(mine[0].e.name)} at range ${mine[0].rg} (it may shoot back)`;
  else if(!theirs.length)why=d1<d0-20&&rangeOf(d1)>=3?'closes in but stays out of their arcs: they must come to you':'stays out of their arcs: they must come to you';
  else why='the best of the moves left, though you may end up in an enemy arc';
  why+=', if they stay where they are';
  const clip=tplPoints(s,b,m0,4).some(q=>G.rocks.some(o=>polyPointDist(q,rockPoly(o))<=TPL_W/2));
  const cost=m.c==='r'?'Cost: red = a stress token, so no action this turn and no red moves until a green one clears it.':m.c==='g'?(s.stress?'Bonus: green clears your stress.':'Cost: none (green is an easy move).'):'Cost: none (white).';
  const allRock=dialOf(s).every(x=>rockHits(s,x));
  return {why:allRock?'every move from here touches an asteroid; this one does the least harm':why,cost:cost+(clip?' Risk: it clips an asteroid (roll 1 attack die for damage, and no action this round).':'')}}
function saferAlt(s){const c=UI.sugCache;if(!c||!c.sc)return null;let best=-1,bv=-1e9;dialOf(s).forEach((m,i)=>{if(exColor(s,m).c==='r'||(s.stress&&false))return;if(c.sc[i]>bv){bv=c.sc[i];best=i}});return best>=0?best:null}
// ---- coach moments for the first round ----
const COACH={dial:{n:1,t:'<b>Pick where your ship will fly.</b> Hover or tap a maneuver on the dial to see its ghost on the mat (the dashed one is the suggestion), then press <b>Lock in dials</b>. The enemy picks at the same time, in secret.'},
  action:{n:2,t:'<b>Take one action.</b> Focus turns your ◉ results into hits when you attack, or into evades when you are shot. It is the safe default.'},
  attack:{n:3,t:'<b>Only enemies inside the yellow wedge (your arc) can be shot.</b> Closer is better: range 1 adds an attack die, range 3 adds a defense die.'},
  end:{n:4,t:'<b>That was one round:</b> Plan → Move (lowest skill first) → Combat (highest skill first) → End. Here is what happened:'}};
const tourOff=()=>LS.get('na_tour')==='1';
function coachKey(){if(tourOff()||!G||G.winner||UI.info)return null;if(G.phase==='plan'&&planSide()>=0)return G.round>=2?'end':'dial';if(!humanTurn())return null;
  if(G.phase==='action')return 'action';if(G.phase==='target')return 'attack';return null}
function coachStep(){const k=coachKey();if(UI.coachOn&&UI.coachOn!==k){UI.coachDone[UI.coachOn]=1;LS.set('na_coach',JSON.stringify(UI.coachDone));if(['dial','action','attack','end'].every(x=>UI.coachDone[x]))LS.set('na_tour','1')}
  UI.coachOn=k&&!UI.coachDone[k]?k:null;return UI.coachOn}
function coachTag(){const el=document.getElementById('coachtag');if(el)el.remove()}   // the old on-board arc tag is replaced by the help kit's coach bubbles (hlp.js)
// ---- end-of-round recap ----
function recapItems(R){const me=soloSide()>=0?soloSide():planSide();const ev=UI.ev[R]||[];const out=[];const isMine=n=>G.ships.some(s=>s.name===n&&s.side===me);
  for(const e of ev){let m;const t=e.t;
    if(m=t.match(/^(.+) bumps into (.+) and skips its action\./)){const a=e.s===me,b=isMine(m[2])&&!a;out.push(`💥 ${a?`You (${esc(m[1])}) bumped into ${esc(m[2])}`:b?`${esc(m[1])} bumped into you (${esc(m[2])})`:`${esc(m[1])} bumped into ${esc(m[2])}`}. The ship that bumps skips its action, and ships touching each other can't fire at each other.${a?' <i>Tip: plan a longer or sideways move.</i>':''}`)}
    else if((m=t.match(/^(.+) is stressed and can't take an action/))&&e.s===me)out.push(`😵 You (${esc(m[1])}) were stressed from a red move, so no action. Fly a green move to clear it.`);
    else if((m=t.match(/^(.+) flies a red maneuver and takes a stress/))&&e.s===me)out.push(`❗ ${esc(m[1])} flew a red move and took stress: no action this turn, and no red moves until a green one clears it.`);
    else if((m=t.match(/^(.+) flies a green maneuver and clears/))&&e.s===me)out.push(`✅ ${esc(m[1])} cleared its stress with a green move.`);
    else if(m=t.match(/^(.+) (flies through|lands on) an asteroid/))out.push(`🪨 ${esc(m[1])} ${m[2]==='lands on'?'landed on':'flew through'} an asteroid: a damage roll and no action${m[2]==='lands on'?', and no shooting this round':''}.`);
    else if(m=t.match(/^(.+) is stressed and can't fly the red/))out.push(`🔁 ${esc(m[1])} revealed a red move while stressed, so the other side picked a white one for it.`);
    else if(m=t.match(/^(.+) flies off the battlefield/))out.push(`🚫 ${esc(m[1])} flew off the battlefield and was destroyed.`)}
  const res=UI.results.filter(r=>r.r===R).reverse();res.forEach(r=>out.push('🎯 '+resultHTML(r,true)));
  if(!res.length)out.push('No shots were fired: nobody had an enemy inside its arc at range 1-3.');
  for(const s of alive().filter(s=>s.side===me&&s.stress))out.push(`<span class="warn">Now: ${esc(s.name)} is stressed: no red moves and no action; a green move clears it.</span>`);
  return out}
function recapHTML(){const R=G.round-1;const items=recapItems(R);const tour=UI.coachOn==='end';
  return `<div class="recap ${tour?'coach':''}"><h3>${tour?'<span class="cn">4</span> Coach · ':''}Round ${R} recap</h3>${tour?`<p class="small">${COACH.end.t}</p>`:''}<ul>${items.slice(0,7).map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="acts"><button class="btn sm" data-a="recapok">Got it</button><button class="btn ghost sm" data-a="recapoff">Don't show again</button></div></div>`}
// ---- the advisor: what should I do now, and why ----
function advice(){if(!G)return {say:'Press Launch.',why:'The defaults are a good first battle; the first round is guided.'};if(G.winner)return {say:'The battle is over.',why:'Read the debrief, then fly the next sortie.'};
  const P=G.phase;
  if(P==='ask'&&G.q&&humanTurn()){const q=G.q;
    if(q.key==='rock')return {say:'Put rocks where they block their approach, not yours.',why:`The middle of their half (★ ${recOpt(q).o.l}) is good. Or just press Auto-place: in a first game it doesn't matter much. Flying through a rock damages you; shooting past one gives the defender +1 die.`};
    if(q.key==='deploy'){const s=G.ships.find(x=>q.title==='Deploy '+x.name&&x.flags.unplaced)||G.ships.find(x=>x.flags.unplaced&&x.side===q.side);const ps=s?psOf(s):0;const eps=G.ships.filter(x=>x.side!==q.side).map(psOf);
      const cmp=ps>Math.max(...eps)?`, higher than theirs, so you move last (you can react to them) and shoot first.`:ps<Math.min(...eps)?`, lower than theirs, so you move first and shoot last: keep your distance until you can line up a shot.`:', about the same as theirs.';
      return {say:`Start near the centre (★ ${recOpt(q).o.l}) so you can turn either way.`,why:`Your pilot skill is ${ps}${cmp}`}}
    if(q.key==='forced')return {say:'Pick the move that leaves their ship worst placed.',why:'Far from you, or pointing away from you, so it can\'t shoot next round.'};
    if(q.key==='dice')return {say:'Tick your blank dice (and ◉ if you have no focus to spend), then Confirm.',why:'Rerolled dice can come up hits or crits; each die can only be rerolled once.'};
    if(q.key==='init')return {say:'Take initiative.',why:'On pilot-skill ties you move and fire first, and you win if both last ships die together.'};
    return {say:esc(q.title)+': an optional card choice.',why:'Read the question: the highlighted button is the usual pick, and "No" keeps the card for later.'}}
  if(P==='plan'&&planSide()>=0&&UI.sel&&ship(UI.sel)){const s=ship(UI.sel);const en=enemiesOf(s);if(!en.length)return {say:'No enemies left.',why:''};
    const ds=en.map(e=>({e,d:baseDist(s,B(s),e,B(e))})).sort((a,b)=>a.d-b.d);const near=ds[0].e,rg=rangeOf(ds[0].d);let say,why;
    if(s.stress){say="You're stressed: no red moves and no action.";why='Fly a green move (straight 1-2, gentle banks) to clear it.'}
    else if(rg>=4){say="They're out of range.";why='Close in with a straight 3-4, or bank to stay outside their arcs: they must come to you.'}
    else{say=`${esc(near.name)} is at range ${rg}.`;why=`Everyone rolls +1 attack die at range 1${pilotHas(near,'knife')?`, and ${esc(near.name)} one more`:''}. Stay at range 2, or line up so it's in your arc but you're not in its arc.`}
    const bumped=(UI.ev[G.round-1]||[]).some(e=>e.t.startsWith(s.name+' bumps into'));if(bumped)why='You bumped last round: no action, and touching ships can\'t fire. Pick a shorter or sideways move this time. '+why;
    const rp=s.dmg.find(x=>x.up&&DAMAGE[x.c].fix);if(rp)why+=` After your crit (${DAMAGE[rp.c].n}): ${critPlain(rp.c,s)}`;
    const sg=suggestDial(s),si=sugInfo(s,sg);why+=` <br>💡 ${mText(dialOf(s)[sg])}: ${si.why}. ${si.cost}`;return {say,why}}
  if(!humanTurn())return {say:'Wait: the computer is acting.',why:'Watch the mat. The result cards and the radio tell you what happened.'};
  const s=G.cur&&ship(G.cur);
  if(P==='action'&&s){const acts=actionsFor(s);const rp=acts.find(a=>/^RP\d/.test(a.a));
    if(rp){const x=s.dmg[+rp.a.slice(2)];return {say:`Repair ${DAMAGE[x.c].n}.`,why:critPlain(x.c,s)+' Fixing it is usually worth more than one focus.'}}
    const inArc=enemiesOf(s).filter(e=>{const r=arcReach(s,B(s),e,B(e),s.arc);return r&&rangeOf(r.d)<=3});const theirs=enemiesOf(s).filter(e=>{const q=arcReach(e,B(e),s,B(s),e.arc);return q&&rangeOf(q.d)<=3});
    const has=a=>acts.some(x=>x.a===a);
    if(!inArc.length&&theirs.length&&has('E'))return {say:'Evade.',why:`You're in ${esc(theirs[0].name)}'s arc with no shot of your own: an evade token cancels one hit. Focus works too and is more flexible.`};
    if(has('F'))return {say:inArc.length?`Focus: ${esc(inArc[0].name)} is in your arc.`:'Focus.',why:'Focus turns your ◉ results into hits now, or into evades if you\'re shot. Target lock only if you\'ll surely shoot that ship (it lets you reroll).'};
    return {say:'Take the first action listed.',why:'Hover each one to preview it.'}}
  if(P==='target'&&s){const opts=[];for(const w of weaponsFor(s))for(const t of w.targets){const d=ship(t.id);const sd=shotDice(s,w,t,d);opts.push({d,w,t,n:sd.atk,m:sd.def,e:expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)})}
    opts.sort((a,b)=>b.e-a.e);if(!opts.length)return {say:'Hold fire.',why:'Nobody is inside your arc.'};const o=opts[0];const other=opts.find(x=>x.d!==o.d);
    return {say:`Shoot ${esc(o.d.name)}${o.w.k!=='P'?' with '+esc(o.w.n):''}.`,why:`Range ${o.t.rg} gives you ${o.n} dice vs ${o.m} (≈${o.e.toFixed(1)} damage).${other?` ${esc(other.d.name)} is only ≈${other.e.toFixed(1)}.`:''}`}}
  const A=G.atk;
  if(P==='amod'&&A){const ms=atkMods();const f=ms.find(m=>m.k==='focus'),tl=ms.find(m=>m.k==='tl');const hc=cnt(A.dice,'hit')+cnt(A.dice,'crit'),fc=cnt(A.dice,'focus');
    if(tl&&cnt(A.dice,'blank')+(!f?fc:0)>0)return {say:'Spend your target lock: reroll your blanks.',why:'Rerolled dice can come up hits. You lose the lock after this attack.'};
    if(f)return {say:'Spend focus.',why:`Your ◉ ${fc>1?'become hits':'becomes a hit'}: ${hc+fc} hit${hc+fc===1?'':'s'} before they roll.`};
    if(ms.length)return {say:esc(ms[0].l)+'.',why:esc(ms[0].d)};return {say:'Press Done.',why:'Nothing left to improve: the defender rolls next.'}}
  if(P==='dmod'&&A){const ms=defMods();const r=preview(A);if(r.hits+r.crits===0)return {say:'Press Done.',why:'Every hit is already cancelled: keep your tokens.'};
    const l=ms.find(m=>m.k==='kael'),f=ms.find(m=>m.k==='focus'),ev=ms.find(m=>m.k==='evade');
    if(l)return {say:'Use your pilot ability.',why:'Change 1 ◉ to an evade for free. Every evade cancels a hit.'};
    if(f)return {say:'Spend focus.',why:'Your ◉ become evades; every evade cancels a hit.'};if(ev)return {say:'Spend your evade token.',why:'+1 evade cancels one more hit.'};
    if(ms.length)return {say:esc(ms[0].l)+'.',why:esc(ms[0].d)};return {say:'Press Done.',why:`${r.hits+r.crits} will get through: shields absorb damage first, then the hull.`}}
  if(P==='damod')return {say:'Tamper with their dice.',why:'Using it can cancel their best die; it is usually worth it.'};
  return {say:'Follow the highlighted button.',why:''}}
// ---- the guidance box in the dock ----
function renderCoach(){const el=$('coach');if(!el)return;const rc=$('recap');if(rc)rc.innerHTML='';if(!G||UI.info){el.innerHTML='';return}let h='';
  if(UI.advOpen){const a=advice();h+=`<div class="adv" role="status"><button class="gx-x" data-a="advise" aria-label="Close advice">×</button><b>🧭 ${a.say}</b> ${a.why}</div>`}
  if(G.round===0&&!G.winner)h+=briefingHTML();
  el.innerHTML=h;coachTag();
  const rd=$('radio');if(rd){const r=UI.radio;rd.innerHTML=r&&G.round-r.r<=1&&!G.winner?`📻 Radio · <b class="f${G.fac[r.side]}">${esc(r.who)}</b>: “${esc(r.t)}”`:''}}
