// ---------- the round: event, morale, production, action (plan + resolve), weather, night ----------
const SC=()=>SCEN[G.scen]||{};
const SPEC=k=>(SC().specials||{})[k];
// dice colour an action rolls with (a scenario action borrows the explore dice)
function dtype(a){return a.type==='special'?(SPEC(a.tgt).dice||null):a.type}
FR.round=fr=>{push({f:'fn',k:'startRound'},{f:'fn',k:'event'},{f:'fn',k:'morale'},{f:'fn',k:'prod'},{f:'fn',k:'plan'})};
FN.startRound=fr=>{G.phase='start';beat('dawn',{round:G.round});G.noMix=false;G.prod={};G.itemsAway=0;G.plan={acts:[],nextId:1,extraBuild:0,thrifty:null,hands:0,used:{}};G.wxEarly=null;
  for(const c of G.chars){c.used={};c.only=null;c.noSkills=false;c.pawnMinus=c.pmNext||0;c.pmNext=0;c.rrNow=c.rr||c.rrNext;c.rrNext=0}
  lg(`— Round ${G.round} of ${G.rounds} —`,'round');fx('round');
  // characters who spent the night in the wild come back
  for(const c of G.chars)if(c.out){const a=c.out.after;c.out=null;lg(`${c.nm} finds the way back to camp.`);ops(a,{actor:c.i})}
  if(G.ev.wait){const k=G.ev.wait;G.ev.wait=null;lg(`The waiting ${cname(k)} attacks before dawn!`,'bad');push({f:'fn',k:'fight',beast:Object.assign({},BEAST[k]),who:G.first,ctx:{}})}
  SC().roundStart&&SC().roundStart()};
FN.event=fr=>{G.phase='event';if(G.round===1)return;drawEvent()};
function drawEvent(){if(!G.ev.deck.length){lg('The event deck is empty.');return}const k=G.ev.deck.shift();const c=CARD[k];beat('event',{card:k,late:!!(c.deck||c.type)});
  if(c.deck||c.type){ // an adventure or mystery card shuffled in earlier: resolve its event half, then draw again
    lg(`Event: ${c.ev.n} (from ${c.n}).`,'bad');fx('event',k);G.ev.disc.push(k);push({f:'fn',k:'drawEvent'});ops(c.ev.ops,{actor:G.first,card:k,half:'ev'});return}
  lg(`Event: ${c.n}.`,'big');fx('event',k);G.lastEvent=k;
  const place={f:'fn',k:'placeThreat',card:k};push(place);
  ops(c.ev,{actor:G.first,card:k,half:'ev',pay:[G.first]});
  if(c.icon==='book'){lg('A book event: the scenario’s own trouble strikes.');SC().book&&SC().book({actor:G.first})}
  else if(['build','gather','explore'].includes(c.icon)){G.tok[c.icon].adv=1;lg(`A "?" marker goes on the ${TNAME[c.icon].toLowerCase()} action.`)}}
FN.drawEvent=fr=>drawEvent();
FN.placeThreat=fr=>{const old=G.ev.threat[0];G.ev.threat[0]=G.ev.threat[1];G.ev.threat[1]=fr.card;
  if(old){beat('threat',{card:old});lg(`${cname(old)} was never dealt with: ${CARD[old].th.n.toLowerCase()} is too late.`,'bad');G.ev.disc.push(old);ops(CARD[old].te,{actor:G.first,card:old,half:'te',pay:living().map(c=>c.i)})}};
FN.morale=fr=>{G.phase='morale';beat('morning');const c=firstC();const m=G.morale;
  if(G.chars.length===1&&m<3)morale(1);const mm=G.morale;
  if(mm<0)loseDet(c,-mm,'low morale');else if(mm===1||mm===2)gainDet(c,mm);else if(mm===3){if(c.w&&(!c.human||true)){const o=[{l:'Gain 2 determination',ops:[['det','first',2]]},{l:'Heal 1 wound',ops:[['heal','first',1]]}];ask(c.i,'Morale is high!',o,{kind:'morale'})}else gainDet(c,2)}
  if(has('diary'))gainDet(c,1);if(has('drums'))gainDet(c,2)};
FN.prod=fr=>{G.phase='prod';beat('prod');const t=campTile();const m=G.map[G.camp.pos];if(G.prod.skip||!t||m.fog){lg('No production this round.','bad');return}
  let food=0,wd=0;t.src.forEach((s,i)=>{if(m.exh[i])return;if(s==='wood')wd++;else food++});
  if(m.tok.c_food)food++;if(m.tok.c_food2)food++;if(m.tok.food&&!t.src.some(s=>s!=='wood')&&!m.exh[9])food++;if(m.tok.c_wood&&t.src.includes('wood'))wd++;
  if(G.shortcut!=null&&tileAt(G.shortcut)){const st=tileAt(G.shortcut);const j=st.src.findIndex((s,i)=>!G.map[G.shortcut].exh[i]);if(j>=0){if(st.src[j]==='wood')wd++;else food++}}
  if(G.prod.nofood)food=0;if(G.prod.nowood)wd=0;if(G.prod.plusWoodNoFood){wd++;food=0}if(G.prod.minusFood)food=Math.max(0,food-1);if(G.prod.half){food=Math.floor(food/2);wd=Math.floor(wd/2)}
  if(has('pit')){const f=DICE['build-wound'][rnd(6)];if(f==='wound'){food+=2;lg('The pit traps something: +2 food.','good')}}
  lg(`Production: +${food} food, +${wd} wood.`);G.res.food+=food;G.res.wood+=wd;fx('res','food')};
FN.plan=fr=>{G.phase='plan';beat('plan');if(G.items.some(i=>i.k==='stormglass'&&i.uses>0)&&false){}
  lg('Plan the day: place every pawn on an action.','step');SC().prePlan&&SC().prePlan()};
// ---------- planning: actions and pawns ----------
function pawnsOf(c){if(c.npc)return c.dead?0:1;return c.dead||c.out?0:Math.max(1,2-(c.pawnMinus||0))}
// extra pawns available this round: [{id,t:[types],one}] from items, finds, skills
function extraPawns(){const o=[];const add=(id,t,n)=>o.push({id,t:[].concat(t),n:n||''});
  if(has('map'))add('map','explore','Map');if(has('belts'))add('belts','gather','Belts');if(has('raft'))add('raft',['gather','explore'],'Raft');if(has('lantern'))add('lantern','build','Lantern');if(has('shield'))add('shield','hunt','Shield');
  if(G.sc.ropeladder)add('ropeladder','explore','Rope Ladder');
  G.xp.forEach((x,i)=>add('xp'+i,x.t==='any'?TYPES:x.t,x.src==='candles'||x.src==='m_candles'?'Candle':x.src==='m_compass'?'Compass':'Helper'));
  const hn=G.items.find(i=>i.k==='hammer'&&i.uses>0);if(hn)add('hammer','build','Hammer and Nails');
  if(G.plan.hands)add('hands','build','Extra Hands');
  if(G.dog)add('dog',['hunt','explore'],'Dog');
  return o}
// every pawn that exists this round: characters (2 each), Friday, extras
function allPawns(){const o=[];for(const c of G.chars){const n=pawnsOf(c);for(let k=0;k<n;k++)o.push({id:'c'+c.i+'_'+k,c:c.i})}if(G.fri&&!G.fri.dead)o.push({id:'fri',f:1});for(const x of extraPawns())o.push({id:x.id,x:1,t:x.t,n:x.n});return o}
function placedIds(){const s=new Set();for(const a of G.plan.acts)for(const p of a.pw)s.add(p);return s}
function pawnInfo(id){return allPawns().find(p=>p.id===id)}
// pawn requirement: base need (roll with this many), +1 more = sure success
function actNeed(a){switch(a.type){
  case 'threat':{const c=CARD[G.ev.threat[a.tgt]];return {need:c.th.pw==='1-2'?1:c.th.pw,roll:false,max:c.th.pw==='1-2'?2:c.th.pw}}
  case 'hunt':return {need:2,roll:false,max:2};
  case 'camp':return {need:1+(G.tok.camp.time?1:0),roll:false,max:1+(G.tok.camp.time?1:0)};
  case 'rest':return {need:1,roll:false,max:1};
  case 'tmap':return {need:2,roll:false,max:2};
  case 'special':{const s=SPEC(a.tgt);if(!s.dice)return {need:s.need||2,roll:false,max:s.need||2};let n=1+(s.need?s.need-1:0);if(G.tok.explore.time)n++;const p=s.pos?s.pos():null;if(p!=null){if(dist(G.camp.pos,p)>=2)n++;if(G.map[p].tok.time)n++;if(G.map[p].fog)n++}return {need:n,roll:true,max:n+1}}
  default:{let n=1;if(G.tok[a.type].time)n++;if(a.type==='gather'||a.type==='explore'){const p=a.type==='gather'?a.tgt.pos:a.tgt;const d=dist(G.camp.pos,p);if(d>=2)n++;if(G.map[p].tok.time)n++;if(G.map[p].fog)n++}
    if(a.type==='build'&&a.tgt&&a.tgt.cross!=null&&G.map[a.tgt.cross].fog)n++;
    if(a.type==='build'&&a.forceRoll)return {need:n,roll:true,max:n};return {need:n,roll:true,max:n+1}}}}
// what an action costs in resources (reserved while planning)
function actCost(a){const c={food:0,wood:0,fur:0};
  if(a.type==='threat'){const r=CARD[G.ev.threat[a.tgt]].th.req||{};const alt=r.alt?r.alt[a.alt||0]:r;for(const k in (alt.res||{}))c[k]+=alt.res[k]}
  if(a.type==='build'){const t=a.tgt.k;
    if(t==='shelter'||t==='roof'||t==='pal'){const tb=SRP_COST[Math.min(4,Math.max(2,G.np))];if(a.pay==='fur')c.fur+=tb.fur;else c.wood+=tb.wood+G.cost[t]}
    else if(t==='weapon')c.wood+=1+G.cost.weapon;
    else{const I=invReq(t);const r=I.alt?I.alt[a.alt||0]:(I.r||{});for(const k in r)c[k]+=r[k]}
    if(G.tok.build.wood&&c.wood&&firstWoodBuild(a))c.wood++}
  if(G.plan.thrifty===a.id&&c.wood)c.wood--;
  return c}
const SRP_COST={2:{wood:2,fur:1},3:{wood:3,fur:2},4:{wood:4,fur:3}};
function firstWoodBuild(a){for(const b of G.plan.acts){if(b.type!=='build')continue;const t=b.tgt.k;const w=['shelter','roof','pal'].includes(t)?b.pay!=='fur':t==='weapon'||!!((invReq(t)||{}).r||{}).wood;if(w)return b.id===a.id}return false}
function committed(ex){const c={food:0,wood:0,fur:0};for(const a of G.plan.acts){if(a.id===ex)continue;const k=actCost(a);for(const r in k)c[r]+=k[r]}return c}
function afford(a){const k=actCost(a),m=committed(a.id);return (G.res.wood-m.wood>=k.wood)&&(G.res.fur-m.fur>=k.fur)&&(G.res.food+G.res.pfood-m.food>=k.food)}
// why an action target can't be planned now (null = fine)
function targetWhy(type,tgt,alt,forC){
  switch(type){
  case 'threat':{const k=G.ev.threat[tgt];if(!k)return 'no card there';if(G.plan.acts.some(a=>a.type==='threat'&&a.tgt===tgt))return 'already planned';const r=CARD[k].th.req||{};const o=r.alt?r.alt[alt||0]:r;
    for(const it of o.items||[])if(!has(it)||G.itemsAway)return `needs ${INVENTIONS[it].n}`;if(o.weapon&&G.weapon<o.weapon)return `needs weapon ${o.weapon}`;return null}
  case 'hunt':return G.hunt.length?(G.plan.acts.filter(a=>a.type==='hunt').length>=G.hunt.length?'no more beasts to hunt':null):'no beasts in the hunting grounds yet';
  case 'build':{const t=tgt.k;if(t==='shelter')return hasShelter()?(G.camp.shelter?'already built':'this tile already gives shelter'):null;
    if(t==='roof'||t==='pal')return hasShelter()||G.plan.acts.some(a=>a.type==='build'&&a.tgt.k==='shelter')?null:'needs a shelter first';
    if(t==='weapon')return null;if(t==='cross'){if(tgt.cross==null)return 'pick a tile';if(!tileAt(tgt.cross))return 'not an explored tile';if(G.sc.crosses&&G.sc.crosses.includes(tgt.cross))return 'this tile already has a cross';if(G.plan.acts.some(a=>a.type==='build'&&a.tgt.k==='cross'&&a.tgt.cross===tgt.cross))return 'already planned';}
    if(!G.inv.board.includes(t)&&!Object.keys(SCENARIOS[G.scen].invs||{}).includes(t)&&!(INVENTIONS[t]&&INVENTIONS[t].kind==='personal'))return 'not available';
    if(G.plan.acts.some(a=>a.type==='build'&&a.tgt.k===t)&&!invReq(t).multi)return 'already planned';
    return invWhy(t,forC)}
  case 'gather':{const t=tileAt(tgt.pos);if(!t)return 'not an explored tile';if(tgt.pos===G.camp.pos)return 'the camp tile produces by itself';const s=srcs(tgt.pos).find(x=>x.i===tgt.i);if(!s)return 'no such source';if(s.ex)return 'this source is used up';
    if(dist(G.camp.pos,tgt.pos)>2)return 'too far from camp';if(G.map[tgt.pos].cov)return 'this terrain is spoiled';if(G.plan.acts.some(a=>a.type==='gather'&&a.tgt.pos===tgt.pos&&a.tgt.i===tgt.i))return 'already planned';return null}
  case 'explore':{if(G.map[tgt].tile!=null)return G.map[tgt].down?'cut off':'already explored';if(!MAP[tgt].adj.some(p=>tileAt(p)))return 'not next to an explored tile';if(!G.tileDeck.length)return 'no island tiles left';
    if(dist(G.camp.pos,tgt)>2)return 'too far from camp';if(G.plan.acts.some(a=>a.type==='explore'&&a.tgt===tgt))return 'already planned';return null}
  case 'tmap':return G.kept.m_tmap?null:'no pirate map';
  case 'special':{const s=SPEC(tgt);if(!s)return 'not in this scenario';if(G.plan.acts.some(a=>a.type==='special'&&a.tgt===tgt))return 'already planned';return s.why()}
  }return null}
// validate the whole plan: returns list of problems (empty = ready)
function planProblems(){const pr=[];const placed=placedIds();
  for(const p of allPawns())if(p.c!=null&&!placed.has(p.id))pr.push(`${P(p.c).nm} still has a pawn to place.`);
  for(const a of G.plan.acts){const n=actNeed(a);const ps=a.pw.map(pawnInfo).filter(Boolean);const lead=ps.find(p=>p.c!=null)||ps.find(p=>p.f);
    if(!lead)pr.push(`${actLabel(a)} needs a character (or Friday) to lead it.`);
    if(ps.length<n.need)pr.push(`${actLabel(a)} needs ${n.need} pawn${n.need>1?'s':''}.`);
    const why=targetWhy(a.type,a.tgt,a.alt,lead&&lead.c!=null?P(lead.c):null);if(why&&why!=='already planned')pr.push(`${actLabel(a)}: ${why}.`);
    if(!afford(a))pr.push(`${actLabel(a)}: not enough resources.`)}
  return pr}
function actLabel(a){switch(a.type){case 'threat':return `Threat: ${CARD[G.ev.threat[a.tgt]]?CARD[G.ev.threat[a.tgt]].th.n:'?'}`;case 'build':return `Build ${buildName(a.tgt)}`;case 'gather':{const t=tileAt(a.tgt.pos);const s=srcs(a.tgt.pos).find(x=>x.i===a.tgt.i);return `Gather ${s?(s.s==='wood'?'wood':'food'):'?'} at place ${a.tgt.pos+1}${t?' ('+t.terr+')':''}`}
  case 'explore':return `Explore place ${a.tgt+1}`;case 'tmap':return "Follow the pirate's map";case 'special':return SPEC(a.tgt)?SPEC(a.tgt).n:'Special';default:return TNAME[a.type]}}
function buildName(t){const k=t.k;return {shelter:'a shelter',roof:'the roof',pal:'the palisade',weapon:'a better weapon'}[k]||(k==='cross'?`a Cross at place ${t.cross+1}`:invReq(k).n)}
// can this pawn join this action?
function pawnWhy(pid,a){const p=pawnInfo(pid);if(!p)return 'no such pawn';if(placedIds().has(pid))return 'already placed';
  if(p.x){if(!p.t.includes(a.type))return `only for ${p.t.map(t=>TNAME[t].toLowerCase()).join(' or ')}`}
  if(p.c!=null){const c=P(p.c);if(c.only&&!c.only.includes(a.type))return `${c.nm} can only ${c.only.map(x=>TNAME[x].toLowerCase()).join(', ')}`;
    if(c.npc&&a.type!=='rest')return `${c.nm} can only rest`;
    if(G.noMix&&a.pw.some(q=>{const o=pawnInfo(q);return o&&o.c!=null&&o.c!==p.c}))return 'no mixing characters this round';
    if(a.type==='build'&&a.tgt&&INVENTIONS[a.tgt.k]&&INVENTIONS[a.tgt.k].kind==='personal'&&!a.pw.some(q=>{const o=pawnInfo(q);return o&&o.c!=null})&&c.k!==INVENTIONS[a.tgt.k].owner)return `the ${CHARS[INVENTIONS[a.tgt.k].owner].n} must lead this`;}
  const n=actNeed(a);if(a.pw.length>=n.max)return 'this action is full';return null}
// ---------- plan moves (validated) ----------
function addAct(type,tgt,alt,pay){const a={id:G.plan.nextId++,type,tgt,alt:alt||0,pw:[],pay:pay||'wood'};G.plan.acts.push(a);return a}
// ---------- resolving the actions ----------
FN.go=fr=>{G.phase='act';beat('go',{n:G.plan.acts.length});lg('The castaways set off.','step');
  const order=[];for(const t of ['threat','hunt','build','gather','explore','special','tmap','camp','rest'])for(const a of G.plan.acts)if(a.type===t)order.push(a.id);
  push(...order.map(id=>({f:'fn',k:'resolve',id})),{f:'fn',k:'endActions'},{f:'fn',k:'weather'},{f:'fn',k:'night'},{f:'fn',k:'endRound'})};
function actLeader(a){const ps=a.pw.map(pawnInfo).filter(Boolean);const l=ps.find(p=>p.c!=null);return l?l.c:(ps.find(p=>p.f)?-1:G.first)}
FN.resolve=fr=>{const a=G.plan.acts.find(x=>x.id===fr.id);if(!a)return;const actor=actLeader(a);const ctx={actor,fut:true,act:a.id,pay:actor>=0?[actor]:[]};
  const c=actor>=0?P(actor):null;if(c&&c.dead)return;a.done=true;beat('act',{id:a.id,type:a.type,tgt:a.tgt,card:a.type==='threat'?G.ev.threat[a.tgt]:null,label:actLabel(a),actor,pw:a.pw.slice(),pos:a.type==='gather'?a.tgt.pos:a.type==='explore'?a.tgt:a.type==='build'&&a.tgt.k==='cross'?a.tgt.cross:a.type==='special'&&SPEC(a.tgt).pos?SPEC(a.tgt).pos():null});
  // danger markers: a tile with a danger token hurts anyone acting there with no weapon
  const pos=a.type==='gather'?a.tgt.pos:a.type==='explore'?a.tgt:null;
  if(pos!=null&&G.map[pos].tok.beast&&G.weapon<1&&c)wound(c,1,'danger on that tile');
  if(a.type==='explore'&&G.tok.explore.beast&&G.weapon<1&&c){wound(c,1,'predators nearby')}
  switch(a.type){
  case 'threat':{const k=G.ev.threat[a.tgt];if(!k)return;const card=CARD[k];const cost=actCost(a);for(const r in cost)if(cost[r])pay(r,cost[r],(ctx.pay||[]).map(P),false);
    lg(`${c?c.nm:'Friday'} deals with ${card.n}: ${card.th.n}.`,'good');G.ev.threat[a.tgt]=null;G.ev.disc.push(k);fx('threat');
    const rw=card.th.pw==='1-2'?(a.pw.length>=2?card.th.rw2:card.th.rw1):card.th.rw;ops(rw,ctx);if(k==='bicker')ops([['det','all',0]],ctx);break}
  case 'hunt':{if(!G.hunt.length){lg('The hunting grounds are empty.');return}const k=G.hunt.shift();lg(`${c?c.nm:'Friday'} goes hunting and finds ${cname(k)}!`,'big');push({f:'fn',k:'fight',beast:Object.assign({},BEAST[k]),who:actor,ctx,hunted:true});break}
  case 'camp':{if(G.tok.camp.black){delete G.tok.camp.black;lg('The camp work is wasted this time (a marker was on the action).','bad');break}delete G.tok.camp.time;
    const bi=G.items.find(i=>i.k==='bible'&&i.uses>0);
    if(G.np===4){ask(actor>=0?actor:'team','Arrange the camp (4 castaways)',[{l:'Gain 2 determination',ops:[['det','actor',bi?3:2]].concat(bi?[['heal','actor',1]]:[]),ctx},{l:'Morale +1',ops:[['morale',1]],ctx}],{kind:'camp'})}
    else{if(bi){bi.uses--;gainDet(c,3);heal(c,1);lg('The prayer book lifts everyone.','good')}else gainDet(c,2);morale(1)}break}
  case 'rest':{if(!c){break}if(c.npc){heal(c,1);break}if(has('bed')){heal(c,2);gainDet(c,1)}else{heal(c,1);if(G.kept.m_hammock)gainDet(c,1)}break}
  case 'tmap':{delete G.kept.m_tmap;lg("Following the pirate's map…",'big');push({f:'fn',k:'mystery',spec:{treasure:2,draw:2},ctx,drawn:0,res:{},got:[]});break}
  default:{const n=actNeed(a);const dt=dtype(a);const roll=a.pw.length<=n.need&&n.roll&&!!dt;const T=dt?G.tok[dt]:{};const forceAdv=!!T.adv&&!(a.type==='special'&&SPEC(a.tgt).advWound);if(dt){delete T.adv;if(T.time)delete T.time}
    const fri=a.pw.includes('fri')&&actor===-1;
    if(roll){const d=rollDice(dt);push({f:'fn',k:'afterRoll',id:a.id,d,forceAdv,actor,fri,rerolls:{}})}
    else push({f:'fn',k:'outcome',id:a.id,d:{w:false,s:true,q:false},forceAdv,actor,fri})}}};
function rollDice(type){return {w:DICE[type+'-wound'][rnd(6)]==='wound',s:DICE[type+'-success'][rnd(6)]==='success',q:DICE[type+'-adventure'][rnd(6)]==='?'}}
FN.afterRoll=fr=>{const a=G.plan.acts.find(x=>x.id===fr.id);const d=fr.d;const c=fr.actor>=0?P(fr.actor):null;
  // forced reroll of a success (marker on the action space, or a curse on the character)
  const dt=dtype(a);if(d.s&&!fr.forced&&(G.tok[dt].reroll||(c&&c.rrNow))){fr.forced=1;if(G.tok[dt].reroll)delete G.tok[dt].reroll;const s2=DICE[dt+'-success'][rnd(6)]==='success';lg(`A forced reroll of the success die: ${s2?'still a success':'now a failure'}.`,s2?'':'bad');d.s=s2}
  beatSet({dice:Object.assign({},d),dtype:dt});G.lastRoll={type:dt,d:Object.assign({},d),who:fr.actor,id:(G.lastRoll?G.lastRoll.id:0)+1};fx('dice',a.type);
  lg(`${c?c.nm:'Friday'} rolls for ${actLabel(a).toLowerCase()}: ${d.w?'a wound':'no wound'}, ${d.s?'success':'failure'}, ${d.q?'an adventure':'no adventure'}.`);
  // rerolls from skills (once each)
  const opts=[];const sk=c&&!c.noSkills?CHARS[c.k].skills.find(s=>s.reroll===dt):null;
  if(sk&&!c.used[sk.k]&&c.det>=2)for(const die of ['w','s','q'])if((die==='w'&&d.w)||(die==='s'&&!d.s)||(die==='q'&&d.q))opts.push({l:`${sk.n}: reroll the ${{w:'wound',s:'success',q:'adventure'}[die]} die (2 determination)`,frames:[{f:'fn',k:'reroll',id:fr.id,d,die,skill:sk.k,actor:fr.actor,forceAdv:fr.forceAdv,fri:fr.fri,forced:fr.forced}]});
  if(G.fri&&!G.fri.dead&&a.pw.includes('fri')&&G.fri.det>=2&&!fr.friUsed)for(const die of ['w','s','q'])if((die==='w'&&d.w)||(die==='s'&&!d.s)||(die==='q'&&d.q))opts.push({l:`Friday: reroll the ${{w:'wound',s:'success',q:'adventure'}[die]} die (2 of his determination)`,frames:[{f:'fn',k:'reroll',id:fr.id,d,die,skill:'fri',actor:fr.actor,forceAdv:fr.forceAdv,fri:fr.fri,forced:fr.forced,friUsed:1}]});
  const done={f:'fn',k:'outcome',id:fr.id,d,forceAdv:fr.forceAdv,actor:fr.actor,fri:fr.fri};
  if(opts.length){ask(c?c.i:'team','Keep this roll?',[{l:'Keep the roll',frames:[done]}].concat(opts),{kind:'dice',dice:d,type:dt,force:1});return}
  push(done)};
FN.reroll=fr=>{const d=Object.assign({},fr.d);const a=G.plan.acts.find(x=>x.id===fr.id);
  if(fr.skill==='fri'){G.fri.det-=2}else{const c=P(fr.actor);c.used[fr.skill]=1;c.det-=2}
  const dt=dtype(a);const nv=fr.die==='w'?DICE[dt+'-wound'][rnd(6)]==='wound':fr.die==='s'?DICE[dt+'-success'][rnd(6)]==='success':DICE[dt+'-adventure'][rnd(6)]==='?';d[fr.die]=nv;
  lg(`Reroll of the ${{w:'wound',s:'success',q:'adventure'}[fr.die]} die: ${fr.die==='w'?(nv?'a wound':'no wound'):fr.die==='s'?(nv?'success':'failure'):(nv?'an adventure':'no adventure')}.`);
  push({f:'fn',k:'afterRoll',id:fr.id,d,forceAdv:fr.forceAdv,actor:fr.actor,fri:fr.fri,forced:1,friUsed:fr.friUsed})};
FN.outcome=fr=>{const a=G.plan.acts.find(x=>x.id===fr.id);const d=fr.d;const c=fr.actor>=0?P(fr.actor):null;const ctx={actor:fr.actor,fut:true,act:a.id,pay:c?[c.i]:[]};
  if(d.w){if(c)wound(c,1,'a mishap');else friWound(1)}
  if(G.over)return;
  const advFrames=[];const sw=a.type==='special'&&SPEC(a.tgt).advWound;
  if(d.q||fr.forceAdv){if(sw){if(c)wound(c,1,'rough water');else friWound(1)}else if(fr.fri&&!fr.forceAdv){friWound(1)}else advFrames.push({f:'fn',k:'adventure',deck:dtype(a)||'explore',ctx:Object.assign({},ctx,advCtx(a))})}
  if(G.over)return;
  if(!d.s){lg(`${actLabel(a)} fails.`,'bad');if(c)gainDet(c,2);else if(fr.fri&&G.fri&&!G.fri.dead){G.fri.det+=2;lg('Friday gains 2 determination.','good')}push(...advFrames);return}
  push({f:'fn',k:'success',id:a.id,ctx},...advFrames)};
function advCtx(a){if(a.type==='gather'){const s=srcs(a.tgt.pos).find(x=>x.i===a.tgt.i);return {pos:a.tgt.pos,srcI:a.tgt.i,gres:s&&s.s==='wood'?'wood':'food'}}if(a.type==='explore')return {pos:a.tgt,explore:1};return {}}
FN.success=fr=>{const a=G.plan.acts.find(x=>x.id===fr.id);const ctx=fr.ctx;const c=ctx.actor>=0?P(ctx.actor):null;
  if(a.type==='build'){const cost=actCost(a);for(const r in cost)if(cost[r])pay(r,cost[r],(ctx.pay||[]).map(P),false);if(G.tok.build.wood&&cost.wood)delete G.tok.build.wood;
    const t=a.tgt.k;if(t==='shelter'){G.camp.shelter=true;lg('🏠 A shelter is built!','big');fx('build')}else if(t==='roof')roofPal('roof',1);else if(t==='pal')roofPal('pal',1);else if(t==='weapon')weapon(1);
    else if(t==='cross')SC().built&&SC().built('cross',ctx.actor,a.tgt.cross);else completeInv(t,ctx.actor);return}
  if(a.type==='gather'){const s=srcs(a.tgt.pos).find(x=>x.i===a.tgt.i);if(!s)return;const r=s.s==='wood'?'wood':'food';let n=1;const m=G.map[a.tgt.pos];if(m.tok[r]&&s.s!=='parrot'||(r==='food'&&m.tok.food&&!s.tok))n++;
    for(const it of ['basket','sack'])if(has(it)&&!G.plan.used[it]){G.plan.used[it]=1;n++}
    lg(`${c?c.nm:'Friday'} gathers ${n} ${r}.`,'good');gain(r,n,ctx);return}
  if(a.type==='explore'){exploreTile(a.tgt,ctx)}
  if(a.type==='special'){lg(`${actLabel(a)}: success!`,'good');SPEC(a.tgt).win(ctx)}};
function exploreTile(pos,ctx){const no=G.tileDeck.shift();if(no==null)return;const m=G.map[pos];m.tile=no;const t=TILES.find(x=>x.no===no);G.stats.explored++;
  const before=new Set();for(const x of G.map)if(x.id!==pos){const tt=tileAt(x.id);if(tt&&!x.cov)before.add(tt.terr)}
  lg(`🗺 New land at place ${pos+1}: ${t.terr}${t.src.length?' with '+t.src.join(' and '):''}${t.shelter?', a natural shelter':''}.`,'big');fx('explore',pos);
  if(!before.has(t.terr))lg(`First ${t.terr} found: new inventions may now be possible.`,'good');
  if(m.tok.scorch){delete m.tok.scorch;if(t.src.length)m.exh[0]=1}
  if(t.beast&&G.beast.length){G.hunt.push(G.beast.shift());shuffle(G.hunt);lg('Animal tracks: a new beast joins the hunting grounds.')}
  for(let i=0;i<t.disc;i++)drawDisc(ctx);
  if(t.totem)SC().totem&&SC().totem(pos,ctx)}
FN.adventure=fr=>{const deck=fr.deck;if(!G.adv[deck].length){G.adv[deck]=shuffle(G.advDisc.filter(k=>CARD[k].deck===deck));G.advDisc=G.advDisc.filter(k=>CARD[k].deck!==deck)}const k=G.adv[deck].shift();if(!k)return;const c=CARD[k];
  beat('adventure',{card:k,deck});lg(`Adventure: ${c.n}.`,'big');fx('adventure',k);G.lastAdv=k;const ctx=Object.assign({},fr.ctx,{card:k});
  if(c.decide){ask(ctx.actor>=0?ctx.actor:'team',`Adventure: ${c.n}`,[{l:advDecideLabel(c,0),ops:c.decide[0],ctx,frames:[{f:'fn',k:'advDiscard',card:k}]},{l:advDecideLabel(c,1),ops:c.decide[1],ctx,frames:[{f:'fn',k:'advShuffle',card:k}]}],{kind:'adv',card:k,force:1});return}
  if(c.shuffle)push({f:'fn',k:'advShuffle',card:k});else push({f:'fn',k:'advDiscard',card:k});ops(c.ops,ctx)};
function advDecideLabel(c,i){const o=c.decide[i];if(i===0)return o.length?`${opsText(o)} (then the card is gone)`:'Leave it (discard the card)';return `${opsText(o)||'Keep it'} (the card goes into the event deck: “${c.ev.n}” may strike later)`}
FN.advDiscard=fr=>{G.advDisc.push(fr.card)};
FN.advShuffle=fr=>{G.ev.deck.push(fr.card);shuffle(G.ev.deck);lg('The card is shuffled into the event deck.')};
FN.endActions=fr=>{const haul=RES.filter(r=>G.fut[r]).map(r=>`+${G.fut[r]} ${RNAME[r]}`);const finds=G.own.some(o=>o.k==='fallentree'||o.k==='larvae');if(haul.length||finds){beat('finds',{});if(haul.length)lg(`The day’s haul reaches camp: ${haul.join(', ')}.`,'good')}
  for(const r of RES){if(G.fut[r]){G.res[r]+=G.fut[r];G.fut[r]=0}}for(const o of G.own)o.fut=false;
  // trade-in-now finds
  for(let i=G.own.length-1;i>=0;i--){const k=G.own[i].k;if(k==='fallentree'||k==='larvae')useDisc(i,true)}
  G.xp=G.xp.filter((x,i)=>!(G.plan.acts.some(a=>a.pw.includes('xp'+i))&&x.uses<=1)).map((x,i)=>x);
  for(const a of G.plan.acts){if(a.pw.includes('hammer')){const it=G.items.find(i=>i.k==='hammer');if(it)it.uses--}}
  G.items=G.items.filter(i=>i.uses>0);G.plan.acts.forEach(a=>a.done=true);G.phase='actdone';SC().afterActions&&SC().afterActions()};
// ---------- weather ----------
FN.weather=fr=>{G.phase='weather';beat('weather');const S=SCENARIOS[G.scen];const dice=(S.wx[G.round]||[]).slice();if(G.wx.animals)dice.push('animals');
  let rain=G.wx.rain,snow=G.wx.snow;const out=[];const roll=G.wxEarly||{};
  for(const d of new Set(dice)){if(d==='rain'){const f=roll.rain||DICE['weather-rain'][rnd(6)];out.push('rain die: '+f);if(f==='1 rain')rain++;else if(f==='2 rain')rain+=2;else snow++}
    if(d==='snow'){const f=roll.snow||DICE['weather-winter'][rnd(6)];out.push('winter die: '+f);if(f==='1 snow')snow++;else if(f==='2 snow')snow+=2;else rain+=2}
    if(d==='animals'){let f=roll.animals||DICE['weather-animals'][rnd(6)];if(G.kept.sc_powder&&f!=='blank'){delete G.kept.sc_powder;f=DICE['weather-animals'][rnd(6)];out.push('gunpowder reroll');}out.push('animals die: '+f);G.wxAnimal=f}}
  if(!dice.includes('animals'))G.wxAnimal=null;
  G.wxNow={rain,snow,storm:G.wx.storm,animal:G.wxAnimal,out};G.lastWx=Object.assign({},G.wxNow,{round:G.round});
  if(!dice.length&&!rain&&!snow&&!G.wx.storm){lg('Weather: calm.');G.wx={rain:0,snow:0,storm:0,animals:0};return}
  lg(`Weather: ${out.map(x=>x.replace(/^rain die: /,'🌧 rain die shows ').replace(/^winter die: /,'❄️ winter die shows ').replace(/^animals die: /,'🐾 animals die: ')).join(', ')||'no weather dice'}${G.wx.rain||G.wx.snow||G.wx.storm?', plus clouds from event cards':''} → ${rain} rain cloud${rain===1?'':'s'}, ${snow} snow cloud${snow===1?'':'s'}${G.wx.storm?', a storm':''}.`,'big');fx('weather');
  push({f:'fn',k:'weather2'});
  // optional helps: the Cook's moonshine
  const cook=living().find(c=>c.k==='cook'&&!c.used.moonshine&&!c.noSkills&&c.det>=3);if(cook&&(rain+snow>G.camp.roof||snow)){ask(cook.i,'Use Moonshine in this weather?',[{l:'No',frames:[]},{l:'Ignore 1 rain cloud (3 determination)',frames:[{f:'fn',k:'moon',m:'rain',c:cook.i}]}].concat(snow?[{l:'Turn 1 snow cloud into rain (3 determination)',frames:[{f:'fn',k:'moon',m:'snow',c:cook.i}]}]:[]),{kind:'weather'})}};
FN.moon=fr=>{const c=P(fr.c);c.used.moonshine=1;c.det-=3;if(fr.m==='rain')G.wxNow.rain=Math.max(0,G.wxNow.rain-1);else{G.wxNow.snow--;G.wxNow.rain++}lg(`${c.nm} brews something strong: the weather bites less.`,'good')};
FN.weather2=fr=>{const w=G.wxNow;
  if(has('furnace')&&w.snow){w.snow--;lg('The furnace keeps 1 snow cloud off.','good')}
  if(G.kept.m_clothes&&w.snow){w.snow--;w.rain++}
  while(G.kept.m_blankets&&w.snow){G.kept.m_blankets--;w.snow--;lg('Wool blankets keep out 1 snow cloud.','good');if(!G.kept.m_blankets)delete G.kept.m_blankets}
  const li=G.own.findIndex(o=>o.k==='leaves'&&!o.fut);if(li>=0&&w.rain&&w.rain+w.snow>G.camp.roof){G.own.splice(li,1);w.rain--;lg('Big leaves keep out 1 rain cloud.','good')}
  if(G.sc.canvas&&w.rain){w.rain--}
  // heating: 1 wood per snow cloud
  if(w.snow){const miss=pay('wood',w.snow,living(),true);if(miss){lg(`Not enough wood to keep warm (${miss} short).`,'bad');for(const c of living())wound(c,miss,'the cold')}}
  // clouds against the roof
  const over=Math.max(0,w.rain+w.snow-G.camp.roof);if(over){lg(`${over} cloud${over>1?'s get':' gets'} past the roof: ${over} food and ${over} wood are ruined.`,'bad');for(let i=0;i<over;i++){const m1=pay('food',1,living(),true),m2=pay('wood',1,living(),true);if(m1+m2)for(const c of living())wound(c,m1+m2,'soaked and cold')}}
  if(w.animal==='discard 1 food'){const m=pay('food',1,living(),true);if(m)for(const c of living())wound(c,1,'hungry animals')}
  if(w.animal==='palisade -1'){roofPal('pal',-1)}
  if(w.animal==='fight beast strength 3'){const s=Math.max(0,3-G.weapon);lg(`Hungry animals attack the camp (strength 3 vs weapon ${G.weapon}).`,'bad');if(s)for(const c of living())wound(c,s,'hungry animals')}
  if(w.storm){lg('The storm batters the camp.','bad');for(let i=0;i<w.storm;i++)roofPal('pal',-1)}
  const wf=(SCENARIOS[G.scen].wxFood||{})[G.round];if(wf){lg(`Lean season: ${wf} food must be discarded.`,'bad');const m=pay('food',wf,living(),true);if(m)for(const c of living())wound(c,m,'the lean season')}
  G.wx={rain:0,snow:0,storm:0,animals:0};SC().afterWeather&&SC().afterWeather()};
// ---------- night ----------
FN.night=fr=>{G.phase='night';beat('night');lg('Night falls.','step');fx('night');const eaters=living().filter(c=>!c.out);
  const need=eaters.length;const have=G.res.food+G.res.pfood;
  if(have>=need){pay('food',need,[],true);lg(`Everyone eats (${need} food).`)}else{const hungry=need-have;pay('food',have,[],true);
    const o=eaters.slice().sort((a,b)=>(CHARS[b.k].die-b.w)-(CHARS[a.k].die-a.w));const starve=o.slice(0,hungry);
    if(eaters.some(c=>c.human)&&hungry<eaters.length){push({f:'fn',k:'night2'});ask('team',`Only ${have} food for ${need} castaways. Who goes hungry (2 wounds each)?`,combos(eaters,hungry).map(g=>({l:g.map(c=>c.nm).join(' and '),frames:[{f:'fn',k:'starve',ids:g.map(c=>c.i)}]})),{kind:'starve'});return}
    for(const c of starve)wound(c,2,'hunger')}
  push({f:'fn',k:'night2'})};
function combos(arr,k){const out=[];const go=(s,acc)=>{if(acc.length===k){out.push(acc.slice());return}for(let i=s;i<arr.length;i++){acc.push(arr[i]);go(i+1,acc);acc.pop()}};go(0,[]);return out.slice(0,20)}
FN.starve=fr=>{for(const i of fr.ids)wound(P(i),2,'hunger')};
FN.night2=fr=>{if(G.over)return;SC().nightKids&&SC().nightKids();if(G.over)return;
  if(G.night.food){for(let k=0;k<G.night.food;k++){for(const c of living()){if(G.res.food+G.res.pfood>0)pay('food',1,[],true);else wound(c,1,'not enough to eat')}}G.night.food=0}
  if(G.fri&&!G.fri.dead){} // Friday does not eat
  // healing that food or items allow tonight (optional)
  push({f:'fn',k:'night3'});nightHeals()};
function nightHeals(){const opts=[];const hurt=living().filter(c=>c.w>0);if(!hurt.length)return;const hasFood=G.res.food+G.res.pfood>0;
  if(has('pot')&&!G.night.pot&&hasFood)opts.push({l:'Pot: 1 food heals 1 wound',k:'pot'});if(has('fireplace')&&!G.night.fire&&hasFood)opts.push({l:'Fireplace: 1 food heals 2 wounds',k:'fire'});
  const rum=G.items.find(i=>i.k==='rum'&&i.uses>0);if(rum)opts.push({l:`Flask of Rum: heal 1 (${rum.uses} left)`,k:'rum'});
  if(G.kept.m_barrel&&!G.night.barrel)opts.push({l:'Water Cask: everyone heals 1 (once)',k:'barrel'});if(G.kept.m_wine)opts.push({l:'Bottle of Brandy: heal 2 (once)',k:'wine'});
  const vi=G.own.findIndex(o=>o.k==='veggies'&&!o.fut);if(vi>=0&&has('pot'))opts.push({l:'Wild vegetables: heal 2',k:'veg'});
  if(living().some(c=>c.k==='cook'&&!c.used.remedy&&!c.noSkills&&c.det>=2)&&hasFood)opts.push({l:'Home Remedy (Cook, 2 determination): 1 food heals 2',k:'remedy'});
  if(!opts.length)return;
  ask('team',`Night: treat the wounded?${G.res.food&&!has('cellar')&&!G.kept.m_boxes?` (${G.res.food} food left over will spoil tonight anyway)`:''}`,[{l:'Done for tonight',frames:[]}].concat(opts.map(o=>({l:o.l,frames:[{f:'fn',k:'nheal',h:o.k}]}))),{kind:'nheal',force:1})}
FN.nheal=fr=>{const who=living().filter(c=>c.w>0).sort((a,b)=>(a.w/CHARS[a.k].die>b.w/CHARS[b.k].die?-1:1))[0];if(!who)return;const h=fr.h;
  if(h==='pot'){pay('food',1,[],true);G.night.pot=1;heal(who,1)}if(h==='fire'){pay('food',1,[],true);G.night.fire=1;heal(who,2)}
  if(h==='rum'){const r=G.items.find(i=>i.k==='rum');r.uses--;heal(who,1)}if(h==='barrel'){G.night.barrel=1;for(const c of living())heal(c,1)}if(h==='wine'){delete G.kept.m_wine;heal(who,2)}
  if(h==='veg'){const vi=G.own.findIndex(o=>o.k==='veggies');G.own.splice(vi,1);heal(who,2)}if(h==='remedy'){const ck=living().find(c=>c.k==='cook');ck.used.remedy=1;ck.det-=2;pay('food',1,[],true);heal(who,2)}
  nightHeals()};
FN.night3=fr=>{if(G.over)return;G.items=G.items.filter(i=>i.uses>0);
  push({f:'fn',k:'night4'});
  // optionally move the camp
  const alt=MAP[G.camp.pos].adj.filter(p=>tileAt(p)&&!G.map[p].fog);if(alt.length&&G.chars.some(c=>c.human)&&G.moveAsk){G.moveAsk=0;push({f:'fn',k:'moveCamp'})}else if(alt.length&&!G.chars.some(c=>c.human)){const p=aiMoveCamp();if(p!=null)push({f:'fn',k:'doMove',p})}};
FN.night4=fr=>{if(G.over)return;SC().night&&SC().night();if(G.over)return;
  if(!hasShelter()){lg('No shelter: everyone sleeps in the open.','bad');for(const c of living())if(!c.out)wound(c,1,'sleeping in the open')}
  for(const c of G.chars)if(c.out&&!c.dead){wound(c,1,'a night in the wild')}
  if(G.night.wound){for(const c of living())wound(c,G.night.wound,'a bad night');G.night.wound=0}
  for(const i in G.night.marks){wound(P(+i),G.night.marks[i],'fever')}G.night.marks={};
  if(G.kept.m_web&&!has('medicine'))wound(firstC(),1,'the web’s poison');
  if(G.over)return;
  // food spoils
  const keep=has('cellar')||G.kept.m_boxes;let barrel=G.kept.m_barrel&&G.night.barrel?Math.min(2,G.res.food):0;
  if(G.res.food&&!keep){const lost=G.res.food-barrel;if(lost>0)lg(`${lost} food spoils overnight.`,'bad');G.res.food=barrel}
  G.night.pot=0;G.night.fire=0;G.night.barrel=0};
FN.endRound=fr=>{if(G.over)return;SC().endRound&&SC().endRound();if(G.over)return;
  if(G.round>=G.rounds){G.over={win:false,why:G.scen==='marooned'?'Time ran out: no ship came.':'Time ran out.'};lg('The last round ends without rescue.','bad');fx('lose');return}
  beat('daysum',{round:G.round});G.round++;if(G.chars.length>1)passFirst();G.stk.push({f:'round'})};
// ---------- invariants and test hooks ----------
function checkInvariants(){if(!G)return[];const v=[];for(const r of RES){if(G.res[r]<0)v.push(`${r} negative`);if(G.fut[r]<0)v.push(`future ${r} negative`)}
  if(G.camp.roof<0||G.camp.pal<0||G.weapon<0)v.push('track negative');if(G.morale<-3||G.morale>3)v.push('morale out of range');
  for(const c of G.chars){if(c.det<0)v.push(c.nm+' determination negative');if(c.w<0)v.push(c.nm+' wounds negative')}
  if(G.fri&&G.fri.det<0)v.push('Friday determination negative');
  const evs=G.ev.deck.length+G.ev.disc.length;if(evs>200)v.push('event deck runaway');
  if(!G.over&&!G.q&&!G.stk.length&&G.phase!=='plan')v.push('stuck: nothing to do in '+G.phase);
  return v}
function render_game_to_text(){if(!G)return '{}';return JSON.stringify({round:G.round,phase:G.phase,over:G.over,q:G.q&&{title:G.q.title,opts:G.q.opts.map(o=>o.l)},res:G.res,camp:G.camp,weapon:G.weapon,morale:G.morale,chars:G.chars.map(c=>({nm:c.nm,w:c.w,det:c.det,dead:c.dead})),threat:G.ev.threat.map(k=>k&&cname(k)),plan:G.plan.acts.map(actLabel),log:G.log.slice(0,6).map(l=>l.t)})}
