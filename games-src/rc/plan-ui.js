// ---------- the planning table: priorities, your plan, then jobs by category (one open at a time) ----------
UI.cat=null;
const CATS=[['build','🔨','Build'],['gather','🧺','Gather'],['explore','🧭','Explore'],['threat','⚠️','Threats'],['hunt','🏹','Hunt'],['camp','🏕️','Camp & rest'],['special','⭐','Scenario']];
function planHtml(){
  if(storyActive())return `<div class="waiting"><div class="big">📖</div><p>${typeof netOn==='function'&&netOn()?'The day is being told on the island, on everyone’s screen at once. The first player ★ steps through it with <b>Continue</b>.':'The day is being told on the island. Step through it with <b>Continue</b> (or Enter), or turn on <b>Play by itself</b>.'}</p></div>`+journalHtml();
  if(!planOpen())return `${typeof netWaitHtml==='function'?netWaitHtml():''}<p class="muted">${G.over?'The game is over.':'The castaways are busy…'}</p>`+recentHtml();
  if(allAI())return `<p class="muted">The computer castaways are planning the day.</p>`+recentHtml();
  const st=pstep();const titles=['What today needs','Give each pawn a job','Check the risks','Start the day'];
  const bar=`<div class="wz-steps" aria-label="Planning: step ${st} of 4">${titles.map((t,k)=>`<button class="wz-s ${k+1<st?'done':k+1===st?'now':''}" data-pgo="${k+1}" ${k+1===st?'aria-current="step"':''}><i>${k+1<st?'✓':k+1}</i><span>${t}</span></button>`).join('')}</div>`;
  const head=`<h3 class="wz-t">${st}. ${titles[st-1]}</h3>`;
  const body=st===1?wzNeeds():st===2?wzAssign():st===3?wzReview():wzConfirm();
  return `<div class="wz">${bar}${typeof netPlanBar==='function'?netPlanBar():''}${guideTip('plan'+st)}${head}${body}</div>`}
// ---------- plan step state ----------
UI.ps={round:0,step:1,skip:[],pick:false};
function pstep(){if(!G)return 1;if(UI.ps.round!==G.round){UI.ps={round:G.round,step:1,skip:[],pick:false};UI.sugWhy={}}return UI.ps.step}
function resetPlanSteps(){UI.ps={round:0,step:1,skip:[],pick:false};UI.rec=null;UI.sugWhy={}}
function setPStep(n){pstep();UI.ps.step=Math.max(1,Math.min(4,n));UI.ps.pick=false;if(UI.ps.step!==2)UI.sel=null;UI.toTop=1}
// the pawns you plan for, in order: your castaways' pawns, then the helpers (Friday, the dog, ...)
function wizPawns(){const hs=new Set(G.chars.filter(c=>c.human&&!c.dead).map(c=>c.i));const hm=typeof helperMine!=='function'||helperMine();const all=allPawns().filter(p=>p.c!=null?hs.has(p.c):hm);return all.filter(p=>p.c!=null).concat(all.filter(p=>p.c==null))}
function curPawn(){const placed=placedIds();const free=wizPawns().filter(p=>!placed.has(p.id)&&!UI.ps.skip.includes(p.id));if(UI.sel&&free.some(p=>p.id===UI.sel))return pawnInfo(UI.sel);return free.find(p=>p.c!=null)||free[0]||null}
function pawnNice(p){if(p.c==null)return pawnLabel(p);const c=P(p.c);const n=pawnsOf(c);return n>1?`${c.nm} (${p.id.endsWith('_0')?'1st':'2nd'} pawn)`:c.nm}
function riskWords(a){const n=actNeed(a);const k=a.pw.length;if(k<n.need)return `<b class="warn">Not enough pawns: needs ${n.need-k} more</b>`;
  if(n.roll&&k<n.max){const dt=dtype(a);const o=dt?diceOdds(dt):{s:80,w:1,q:3};return `<b class="roll">Rolls the dice: ${o.s}% chance it works, ${o.w} in 6 chance of a wound.</b> <small>Add 1 more pawn to make it certain.</small>`}
  return `<b class="sure">Certain: enough pawns, no dice.</b>`}
// ---------- step 1: what today needs ----------
function wzNeeds(){const need=eatersNeed(),have=food(),planF=plannedFood();const cl=clouds();const S=SCENARIOS[G.scen];const dieN={rain:'rain die',snow:'winter die',animals:'hungry-animals die'};
  const row=(ok,label,val,note)=>`<div class="nd ${ok?'ok':'bad'}"><b>${label}</b><span class="v">${val}</span><small>${note}</small></div>`;
  const low=living().filter(c=>!c.npc).sort((a,b)=>lifeLeft(a)-lifeLeft(b))[0];
  let h='';
  h+=goalCard();
  const ml=morningLines();if(ml.length)h+=`<div class="morn"><b>This morning:</b><ul>${ml.map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ul></div>`;
  h+=`<div class="needs">`+row(have+planF>=need+wxFoodLoss(),'Food for tonight',`${have+planF} of ${need}${wxFoodLoss()?' +'+wxFoodLoss():''}`,`Everyone eats 1 food at night. Hungry: 2 wounds each.${planF?` (${planF} of it is planned.)`:''}${wxFoodLoss()?` Rain above your roof will likely ruin about ${wxFoodLoss()} food first.`:''}`)
    +row(hasShelter(),'Shelter',hasShelter()?'yes':'none',hasShelter()?'Keeps you from sleeping in the open.':'Tonight everyone loses 1 life without one.')
    +row(cl.est<=G.camp.roof,'Roof',`${G.camp.roof}`,`Weather tonight: ${cl.dice.length?cl.dice.map(d=>dieN[d]).join(', '):'calm'}${G.wx.rain?` +${G.wx.rain} rain`:''}${G.wx.snow?` +${G.wx.snow} snow`:''}${G.wx.storm?' + a storm':''}. Each cloud above the roof ruins 1 food and 1 wood.`)
    +row(!G.ev.wait||BEAST[G.ev.wait].str<=G.weapon,'Weapon',`${G.weapon}`,G.ev.wait?`A ${BEAST[G.ev.wait].n} (strength ${BEAST[G.ev.wait].str}) attacks at dawn.`:'Used when you hunt or a beast attacks.')
    +(low?row(lifeLeft(low)>3,'Lowest life',`${esc(low.nm)} ${lifeLeft(low)}`,lifeLeft(low)<=3?'Close to death: this castaway should rest.':'If anyone dies, you all lose.'):'')+`</div>`;
  const th=G.ev.threat.map((k,i)=>{if(!k)return '';const c=CARD[k];const r=c.th.req||{};const rq=reqText(r);return `<div class="thr ${i===0?'hot':''}"><b>Threat: ${esc(c.th.n)}</b><span>${i===0?'Strikes at the next dawn unless you deal with it today.':'Strikes in two days. You can deal with it today or tomorrow.'}</span><small>To deal with it: ${c.th.pw==='1-2'?'1 or 2':c.th.pw} pawn${c.th.pw===1?'':'s'}${rq?', needs '+esc(rq):''}. Reward: ${opsText(c.th.rw||c.th.rw2||c.th.rw1)||'none'}. If ignored: ${opsText(c.te)||'nothing'}.</small></div>`}).join('');
  h+=th?`<h4>Threat cards</h4>${th}`:`<p class="muted small">No threat cards on the board.</p>`;
  const pr=priorities().filter(p=>!p.done&&!p.info);if(pr.length)h+=`<h4>What matters most today</h4><ol class="plist">${pr.map(p=>`<li class="${p.red?'red':''}" ${posAttr(p.act)}><b>${esc(p.title)}</b><span>${esc(p.why)}</span></li>`).join('')}</ol>`;
  const mates=mateHtml();if(mates)h+=mates;
  return h}
// the goal, its progress and how to work on it today: first thing on the planning page
// the chapter's own checkpoint and how to reach it (story campaign)
const CAMP_HOW={surviveDays:'Keep everyone alive: food for every night (fish and birds on the map), and rest anyone low on life.',build:'Build the <b>Shelter</b> (a job in Build). It costs wood, so gather wood first, and put 2 pawns on it to make it certain.',explored:'Send pawns to the ❔ places next to the land you know (Explore). Two pawns make it certain.',crosses:'Raise a <b>Cross</b> (a job in Build, 2 wood) on a different tile each time.',temple:'Explore until you find the temple, then search it (a Scenario job).'};
function campCard(){const g=G.cmp.goal;const cp=campParts();const d=typeof campDef==='function'&&campDef();const v=g.value;const by=v.byDay||v.surviveDays;
  const parts=cp.map(([l,h,n])=>`<li class="${(n===true?h:h>=n)?'ok':''}">${esc(l)} ${n===true?(h?'✓':'✗'):`${Math.min(h,n)}/${n}`}</li>`).join('');
  const how=Object.keys(CAMP_HOW).filter(k=>v[k]).map(k=>CAMP_HOW[k]).join(' ');
  const st=d&&d.stars?`<p class="cst">Stars: ${d.stars.slice(0,d.maxStars||3).map(s=>'☆ '+esc(s.text)).join(' · ')}</p>`:'';
  return `<div class="daycard goal1"><div class="dk">📖 ${d?esc(d.title)+' · ':''}chapter goal · day ${G.round}${by?' of '+by:''}</div><b>${esc(g.text)}</b><ul class="cgp">${parts}</ul><p>${how}</p>${st}</div>`}
function goalCard(){if(G.cmp&&G.cmp.goal&&G.cmp.goal.type==='custom')return campCard();const S=SCENARIOS[G.scen];let how='',btn='';
  if(G.scen==='marooned'){const room=SCEN.marooned.pileRoom();const w=pileWhy(1);
    how=`${has('fire')?'Fire is built.':'Build <b>Fire</b> (a job in Build).'} Add wood to the <b>signal pile</b> one stage a day (1, 2, 3, 4, then 5 wood): it must be full on day 10, 11 or 12.`;
    const fw=Math.max(0,G.res.wood-committed().wood);btn=room?`<button class="btn sm pileb" data-a="pilemax" ${w?'aria-disabled="true"':''}>Add ${Math.max(1,Math.min(room,fw))} wood to the pile${fw<room&&fw>0?` (${room} finish today’s stage)`:''}</button>${w?`<small>${esc(w==='no spare wood'?`needs ${room} spare wood`:w)}</small>`:''}`:G.sc.pile>=15?'':'<small>Today’s pile stage is done.</small>'}
  else how=esc(S.x);
  return `<div class="daycard goal1"><div class="dk">🎯 Your goal · day ${G.round} of ${G.rounds}</div><b>${esc(SC().goal?SC().goal():S.x)}</b><p>${how}</p>${btn?`<div class="gb">${btn}</div>`:''}</div>`}
// ---------- step 2: one pawn at a time ----------
function wzAssign(){const list=wizPawns();const placed=placedIds();const cur=curPawn();
  const row=`<div class="pawnrow">${list.map((p,k)=>{const a=G.plan.acts.find(x=>x.pw.includes(p.id));const on=cur&&cur.id===p.id;const col=p.c!=null?PCOL[p.c%6]:p.f?'#f3f3f3':'#8d8d8d';
    return `<button class="pw ${on?'on':''} ${a?'set':''}" style="--pc:${col}" data-pawn="${p.id}" title="${esc(pawnNice(p))}${a?': '+esc(actLabel(a)):''}"><i></i><span>${k+1}. ${esc(pawnLabel(p).split(' ')[0])}</span><small>${a?'✓ '+esc(actLabel(a).replace(/^Threat: /,'')):UI.ps.skip.includes(p.id)?'no job':'…'}</small></button>`}).join('')}</div>`;
  let h='';
  if(!cur){h+=row+`<div class="alldone">✓ Every pawn has a job. Press <b>Next</b> to check the risks, or tap a pawn above to change its job.</div>`;return h+planSoFar()}
  UI.sel=cur.id;const k=list.findIndex(p=>p.id===cur.id)+1;const rec=recPlan().map[cur.id];
  h+=`<div class="curp" style="--pc:${cur.c!=null?PCOL[cur.c%6]:'#9a9a9a'}"><div class="cp-n">Pawn ${k} of ${list.length}</div><b>${esc(pawnNice(cur))}</b>${cur.c!=null?`<small>${lifeLeft(P(cur.c))} life left</small>`:`<small>${cur.f?'A helper: works alone or with you. Never needs food or shelter.':'A helper: '+(cur.t||[]).map(t=>TNAME[t]).join(' / ')+' only.'}</small>`}</div>`;
  if(rec&&!placeWhy(cur.id,rec.type,rec.tgt,rec.alt)){const risk=rec.sure?`Certain${rec.with.length?` (with ${esc(rec.with.join(' + '))})`:''}: no dice.`:rec.odds?`Rolls the dice: ${rec.odds.s}% chance it works${rec.with.length?` (with ${esc(rec.with.join(' + '))})`:''}.`:'Rolls the dice.';
    h+=`<div class="rec"><div class="rk">Recommended job</div><b>${esc(rec.label)}</b><span>${rec.why?'Why: '+esc(rec.why)+'.':'Why: a good use of a spare pawn today.'}</span><span class="${rec.sure?'sure':'roll'}">${risk}</span>
      <div class="rb"><button class="btn go" data-a="rec">✔ Give ${esc(pawnLabel(cur).split(' ')[0])} this job</button><button class="btn ghost" data-a="pick" aria-expanded="${UI.ps.pick}">${UI.ps.pick?'Hide other jobs':'Choose another job'}</button></div></div>`}
  else{UI.ps.pick=true;h+=`<p class="wz-p">Pick a job for ${esc(pawnLabel(cur))} below, or tap a place on the island.</p>`}
  h+=row;
  if(cur.c==null)h+=`<button class="btn xs ghost" data-a="pskip">Leave ${esc(pawnLabel(cur))} without a job today</button>`;
  if(UI.ps.pick){const quick=priorities().filter(p=>!p.done&&p.act&&!placeWhy(cur.id,p.act.type,p.act.tgt,p.act.alt));
    if(quick.length)h+=`<h4>Today’s needs ${esc(pawnLabel(cur).split(' ')[0])} can help with</h4><div class="qpick">${quick.map(p=>`<button class="btn sm" data-pq="${priorities().indexOf(p)}" ${posAttr(p.act)}>${esc(p.title)}</button>`).join('')}</div>`;
    if(UI.tileSel!=null)h+=tileFocusHtml(UI.tileSel);
    h+=`<h4>All jobs</h4><div class="cats">${CATS.filter(([kk])=>kk!=='special'||Object.keys(SC().specials||{}).length||G.kept.m_tmap).map(([kk,ic,n])=>{const c=catCount(kk);return `<button class="cat ${UI.cat===kk?'on':''}" data-cat="${kk}" ${c?'':'aria-disabled="true"'}><span>${ic}</span>${n}<small>${c?c+' possible':'none now'}</small></button>`}).join('')}</div>`;
    if(UI.cat)h+=`<div class="catbody">${catHtml(UI.cat)}</div>`}
  h+=`<p class="hint">One pawn on a job rolls the dice: it can fail or hurt. A second pawn on the same job makes it certain. Places two steps from camp need one more pawn.</p>`;
  return h+planSoFar()}
function planSoFar(){if(!G.plan.acts.length)return '';return `<details class="sofar" ${UI.ps.sofar?'open':''}><summary data-a="sofar">The plan so far (${G.plan.acts.length} job${G.plan.acts.length>1?'s':''})</summary><div class="plan">${G.plan.acts.map(a=>planLine(a)).join('')}</div></details>`}
// ---------- step 3: every job with its risk ----------
function wzReview(){let h=`<p class="wz-p">Each job shows its risk. <b>Certain</b> jobs always work. Jobs that <b>roll the dice</b> can fail or cost a wound. Tap a pawn’s name to take it off a job.</p>`;
  if(!G.plan.acts.length)return h+`<p class="muted">Nothing planned yet. Go back to step 2, or press ✨ Plan it for me.</p>`;
  const W=UI.sugWhy||{};
  h+=`<div class="review">${G.plan.acts.slice().sort((x,y)=>ORDER_T.indexOf(x.type)-ORDER_T.indexOf(y.type)).map((a,k)=>{const c=actCost(a);const cost=Object.entries(c).filter(([r,v])=>v).map(([r,v])=>`${v} ${RNAME[r]}`).join(' + ');const why=W[JSON.stringify([a.type,a.tgt])];
    const payT=a.type==='build'&&['shelter','roof','pal'].includes(a.tgt.k)&&(a.pay==='fur'||G.res.fur>=SRP_COST[Math.min(4,Math.max(2,G.np))].fur)?` <button class="btn xs" data-pay="${a.id}" title="Pay with wood or fur">pay with ${a.pay==='fur'?'fur':'wood'}</button>`:'';
    return `<div class="rv" ${posAttr(a)}><div class="rv-n">${k+1}</div><div><b>${esc(actLabel(a))}</b><div class="plp">${a.pw.map(pid=>{const p=pawnInfo(pid);return p?chip(p,{rm:1,placed:1}):''}).join('')}</div><div class="rsk">${riskWords(a)}</div>${cost?`<small>Costs ${cost}.${payT}</small>`:''}${why?`<small class="why">Why: ${esc(why)}.</small>`:''}</div></div>`}).join('')}</div>`;
  const pb=planProblems();if(pb.length)h+=`<div class="probs">${pb.slice(0,4).map(x=>`<div>• ${esc(x)}</div>`).join('')}</div>`;
  const open=priorities().filter(p=>!p.done&&!p.info&&p.act);if(open.length)h+=`<div class="notcov"><b>Not covered today:</b> ${open.map(p=>`<span class="${p.red?'red':''}">${esc(p.title)}</span>`).join(' · ')}</div>`;
  h+=`<div class="rb"><button class="btn xs ghost" data-a="clear">Clear my plan</button></div><label class="chk"><input type="checkbox" data-a="moveask" ${G.moveAsk?'checked':''}> Ask me tonight whether to move the camp</label>`;
  return h}
// ---------- step 4: confirm ----------
function wzConfirm(){const acts=G.plan.acts;const roll=acts.filter(a=>{const n=actNeed(a);return n.roll&&a.pw.length<n.max}).length;const pb=planProblems();const red=uncoveredRed();
  const pr=priorities().filter(p=>!p.info||p.done);
  let h=`<p class="wz-p">${acts.length} job${acts.length===1?'':'s'}: ${acts.length-roll} certain, ${roll} roll${roll===1?'s':''} the dice.</p>`;
  h+=`<ul class="checks">${pr.map(p=>`<li class="${p.done?'ok':p.red?'bad':'meh'}">${p.done?'✓':p.red?'✗':'–'} ${esc(p.title)}</li>`).join('')}</ul>`;
  if(pb.length)h+=`<div class="probs">${pb.slice(0,3).map(x=>`<div>• ${esc(x)}</div>`).join('')}<div>Go back to step 2 to fix this.</div></div>`;
  if(red.length)h+=`<div class="probs warn2">${red.map(p=>esc(p.confirm||('⚠ '+p.title+' is not covered.'))).join('<br>')}<div>You can still start, or press ✨ Plan it for me.</div></div>`;
  h+=`<p class="wz-p">When you start, the day plays out one step at a time: <b>Actions</b> (job by job), then <b>Weather</b>, then <b>Night</b>. The plan can’t be changed after that.</p>`;
  return h}
function posOf(act){if(!act)return null;if(act.type==='gather')return act.tgt.pos;if(act.type==='explore')return act.tgt;if(act.type==='build'&&act.tgt&&act.tgt.cross!=null)return act.tgt.cross;return null}
const posAttr=act=>{const p=posOf(act);return p!=null?`data-pos="${p}"`:''};
function prioHtml(p,i){const btn=p.pile?`<button class="btn sm" data-a="pilemax" ${pileWhy(1)?'disabled':''}>Add wood</button>`:p.skill?`<button class="btn sm go" data-skill="${p.skill}">Use it</button>`:p.can?`<button class="btn sm go" data-do="${i}">Do it</button>`:p.move?`<button class="btn sm go" data-do="${i}" title="Takes ${esc(p.move.nm)} off “${esc(p.move.label)}”">Move ${esc(p.move.nm)} here</button>`:'';
  const note=p.move?`<em class="mv">Every pawn has a job. This moves ${esc(p.move.nm)} off “${esc(p.move.label)}”.</em>`:p.cant?`<em class="no">Not possible now: ${esc(p.cant)}.</em>`:'';
  return `<div class="prio ${p.red?'red':''} ${p.cant?'cant':''} ${p.info?'info':''}" ${posAttr(p.act)}><div class="pi">${p.icon}</div><div class="pt"><b>${esc(p.title)}</b><span>${esc(p.why)}</span>${note}</div>${btn}</div>`}
// what the computer teammates planned (and did) this morning
function mateHtml(){const m=UI.mate;if(!m||m.round!==G.round||!m.lines.length)return '';return `<div class="mate"><b>🤖 Your computer teammates planned:</b>${m.lines.map(l=>`<span>${esc(l)}</span>`).join('')}</div>`}
function mateNews(before,mark,chars){if(typeof document==='undefined'||UI.sim)return;const lines=[];for(const a of G.plan.acts){const ids=a.pw.filter(id=>{const p=pawnInfo(id);return !before.has(id)&&p&&(p.c==null||chars.includes(p.c))});if(ids.length)lines.push(`${pawnGroup(ids)} → ${actLabel(a)}`)}
  const also=G.log.filter(l=>l.i>mark&&(l.c==='step'||/signal pile|Used:/.test(l.t))).reverse().map(l=>l.t.replace(/\.$/,''));for(const x of also)lines.push(x);
  UI.mate={round:G.round,lines}}
function diceOdds(dt){const n=f=>DICE[dt+'-'+f].filter(x=>x===(f==='wound'?'wound':f==='success'?'success':'?')).length;return {s:Math.round(n('success')/6*100),w:n('wound'),q:n('adventure')}}
function pawnsText(n,far){return n.roll?`${n.need} pawn${n.need>1?'s':''}: dice · ${n.max}: sure${far?' · far from camp (+1 pawn)':''}`:`${n.need} pawn${n.need>1?'s':''}, no dice`}
function planLine(a){const n=actNeed(a);const k=a.pw.length;const dt=dtype(a);let chance;
  if(k<n.need)chance=`<b class="warn">needs ${n.need-k} more</b>`;else if(n.roll&&k<n.max){const o=dt?diceOdds(dt):{s:80,w:1,q:3};chance=`<b class="roll" title="One pawn fewer than sure: the dice decide. Add 1 more pawn for a sure success. A failure gives the leader 2 determination.">🎲 ${o.s}% success · ${o.w}-in-6 wound risk</b>`}else chance='<b class="sure">✔ sure</b>';
  const c=actCost(a);const cost=Object.entries(c).filter(([r,v])=>v).map(([r,v])=>`${v}${RICON[r]}`).join(' ');
  const payT=a.type==='build'&&['shelter','roof','pal'].includes(a.tgt.k)&&(a.pay==='fur'||G.res.fur>=SRP_COST[Math.min(4,Math.max(2,G.np))].fur)?`<button class="btn xs" data-pay="${a.id}" title="Pay with wood or fur">${a.pay==='fur'?'🧶 fur':'🪵 wood'}</button>`:'';
  return `<div class="pl" ${posAttr(a)}><span class="pli">${ACT_ICON[a.type]||'•'}</span><div class="plt"><b>${esc(actLabel(a))}</b><div class="plp">${a.pw.map(pid=>{const p=pawnInfo(pid);return p?chip(p,{rm:1,placed:1}):''}).join('')} ${chance} ${cost?`<span class="cost">${cost}</span>`:''} ${payT}</div></div></div>`}
function catCount(k){try{return catRows(k).filter(r=>!r.why).length}catch(e){return 0}}
// every job in a category: {type,tgt,alt,title,sub,why}
function catRows(k){const o=[];const add=(type,tgt,title,sub,alt)=>{const why=targetWhy(type,tgt,alt||0,null);const pl=why==='already planned'&&findAct(type,tgt);o.push({type,tgt,alt:alt||0,title,sub,why:why==='already planned'&&(MULTI.includes(type)||pl&&pl.pw.length<actNeed(pl).max)?null:why})};
  if(k==='build'){const tb=SRP_COST[Math.min(4,Math.max(2,G.np))];
    add('build',{k:'shelter'},'🏠 Shelter',`${tb.wood} wood or ${tb.fur} fur · no more wounds for sleeping outside`);add('build',{k:'roof'},'☂️ Roof +1',`${tb.wood+G.cost.roof} wood or ${tb.fur} fur · keeps 1 cloud off`);add('build',{k:'pal'},'🧱 Palisade +1',`${tb.wood+G.cost.pal} wood or ${tb.fur} fur · walls against beasts and storms`);add('build',{k:'weapon'},'🗡️ Weapon +1',`${1+G.cost.weapon} wood · for hunting and fights`);
    const invs=[...new Set(G.inv.board.concat(Object.keys(SCENARIOS[G.scen].invs||{})).concat(Object.keys(INVENTIONS).filter(x=>INVENTIONS[x].kind==='personal'&&G.chars.some(c=>c.k===INVENTIONS[x].owner&&!c.dead))))].filter(x=>x!=='cross'&&(!has(x)||invReq(x).multi));
    for(const x of invs){const I=invReq(x);add('build',{k:x},`${I.kind==='scen'?'⭐ ':'💡 '}${I.n}`,`${invNeedPlain(I)} · ${I.x}`)}
    if(G.scen==='hexed')for(const m of G.map)if(tileAt(m.id)&&!G.sc.crosses.includes(m.id))add('build',{k:'cross',cross:m.id},`✝️ Cross at place ${m.id+1}`,`2 wood · ${tileAt(m.id).terr}${m.fog?' · fog: +1 pawn':''}`)}
  if(k==='gather')for(const m of G.map){const t=tileAt(m.id);if(!t||m.id===G.camp.pos||dist(G.camp.pos,m.id)>2)continue;for(const s of srcs(m.id)){if(s.ex)continue;const n=actNeed({type:'gather',tgt:{pos:m.id,i:s.i}});add('gather',{pos:m.id,i:s.i},`${s.s==='wood'?'🪵 Wood':s.s==='fish'?'🐟 Fish':'🦜 Birds'} · place ${m.id+1} (${t.terr})`,`+${gatherYield(m.id,s.i)} ${s.s==='wood'?'wood':'food'} · ${pawnsText(n,dist(G.camp.pos,m.id)>=2)}${m.tok.time?' · slow going (+1 pawn)':''}${m.tok.beast?' · danger: 1 wound without a weapon':''}`)}}
  if(k==='explore')for(const m of MAP){if(G.map[m.id].tile!=null||!m.adj.some(p=>tileAt(p))||dist(G.camp.pos,m.id)>2)continue;const n=actNeed({type:'explore',tgt:m.id});add('explore',m.id,`❔ Explore place ${m.id+1}`,`new land · ${pawnsText(n,dist(G.camp.pos,m.id)>=2)}${G.map[m.id].fog?' · fog (+1 pawn)':''}`)}
  if(k==='threat')G.ev.threat.forEach((c0,i)=>{if(!c0)return;const c=CARD[c0];const r=c.th.req||{};const alts=r.alt?r.alt.length:1;for(let al=0;al<alts;al++)add('threat',i,`⚠️ ${c.th.n}`,`${i===0&&G.ev.threat[1]?'strikes at next dawn · ':''}${c.th.pw==='1-2'?'1–2':c.th.pw} pawn${c.th.pw===1?'':'s'}${reqText(alts>1?r.alt[al]:r)?' · needs '+reqText(alts>1?r.alt[al]:r)+' ('+haveText(alts>1?r.alt[al]:r)+')':''} · reward: ${opsText(c.th.rw||c.th.rw2||c.th.rw1)||'peace'} · if ignored: ${opsText(c.te)||'nothing'}`,al)});
  if(k==='hunt')add('hunt',null,'🏹 Hunt a beast',`2 pawns, no dice · ${G.hunt.length} beast${G.hunt.length===1?'':'s'} in the hunting grounds · your weapon ${G.weapon} against its strength: each point short is a wound · gives food and fur`);
  if(k==='camp'){add('camp',null,'🏕️ Arrange the camp',G.np===4?'+2 ✊ determination or morale +1':'+2 ✊ determination (spend ✊ on skills) and morale +1');add('rest',null,'😴 Rest',has('bed')?'heal 2 and +1 determination':'heal 1 wound')}
  if(k==='special'){for(const s of Object.keys(SC().specials||{}))add('special',s,`⭐ ${SPEC(s).n}`,specialSub(s));if(G.kept.m_tmap)add('tmap',null,"🗺️ Follow the pirate's map",'2 pawns · 2 mystery cards')}
  return o}
const CAT_TIP={gather:'1 pawn rolls the dice (it may fail or hurt); 1 more pawn makes it sure. Places 2 steps from camp need +1 pawn. Numbers are the places on the map.',explore:'Explore a ❔ place next to the land you know. 1 pawn rolls the dice, 1 more makes it sure; 2 steps from camp: +1 pawn.',build:'Building rolls the dice with 1 pawn (4-in-6 wound risk!); 2 pawns make it sure.',threat:'Threat cards strike at the next dawn if they are still in the left slot. Dealing with one needs no dice.'};
function catHtml(k){const rows=catRows(k);const ok=rows.filter(r=>!r.why),no=rows.filter(r=>r.why);const tip=CAT_TIP[k]?`<p class="cattip">ℹ️ ${CAT_TIP[k]}</p>`:'';
  const line=r=>{const key=encodeURIComponent(JSON.stringify({type:r.type,tgt:r.tgt,alt:r.alt}));const planned=findActAny(r.type,r.tgt,r.alt);const sel=UI.sel;const pw=sel&&!r.why?placeWhy(sel,r.type,r.tgt,r.alt):null;
    return `<div class="job ${r.why?'no':''} ${planned?'has':''}" ${posAttr({type:r.type,tgt:r.tgt})}>${r.type==='build'&&r.tgt&&r.tgt.k&&INVENTIONS[r.tgt.k]?artImg('inv',r.tgt.k,'rowart'):''}<div class="jt"><b>${esc(r.title)}</b><span>${esc(r.sub)}${r.why?` <em>(${esc(r.why)})</em>`:''}</span></div>${r.why?'':`<button class="btn add" data-place="${key}" ${pw?'aria-disabled="true"':''} title="${esc(pw||'Put '+(sel?pawnLabel(pawnInfo(sel)):'a pawn')+' on this')}">+</button>`}</div>`};
  return tip+(ok.length?ok.map(line).join(''):'<p class="muted small">Nothing possible here right now.</p>')+(no.length?`<details class="later"><summary>Not possible yet (${no.length})</summary>${no.map(line).join('')}</details>`:'')}

// the day so far, never ahead of the story
function journalHtml(){const i=storyIdx();if(i<0)return '';const from=Math.max(0,lastPlanBeat(i)+1);const out=[];
  for(let k=from;k<=i;k++){const b=UI.beats[k];if(skippable(k))continue;const h=beatHtml(k);out.push(`<li class="${k===i?'now':''}"><b>${h.icon} ${h.title}</b>${beatLines(k).filter(MEANINGFUL).slice(0,6).map(l=>`<span class="${l.c}">${esc(l.t)}</span>`).join('')}</li>`)}
  return `<h3>Journal · today</h3><ol class="journal">${out.join('')}</ol>`}
