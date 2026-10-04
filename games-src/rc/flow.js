// ---------- the round, planned: a roadmap of the 7 steps of a day, a card that opens each step, and the end-of-day summary ----------
// Presentation only: nothing here changes the rules. It reads G (or the story's snapshot of G) and UI.
const PH7=[
  {k:'event',n:'Event',tip:'A new event card is turned over. It can hurt you now, and it stays as a threat you can deal with later.',
    what:'An event card is turned over. It may do something right away, and then it waits as a threat. Ignored threats strike two days later.',dec:'Nothing yet. You can deal with a threat when you plan.'},
  {k:'morale',n:'Morale',tip:'Good morale gives the first player determination (used for skills). Bad morale takes it away.',
    what:'The camp’s mood is checked. Above 0 the first player (★) gains that much determination; below 0 they lose it.',dec:'Nothing. This step runs by itself.'},
  {k:'prod',n:'Production',tip:'The place where your camp stands gives you its food and wood.',
    what:'The place where your camp stands gives you its food and wood for today.',dec:'Nothing. This step runs by itself.'},
  {k:'plan',n:'Plan',tip:'You give every pawn a job for the day. This is the step where you choose.',
    what:'You give every pawn a job for the day, in 4 small steps.',dec:'Everything: who does which job.'},
  {k:'act',n:'Actions',tip:'The jobs are done one at a time. Certain jobs always work; the others roll dice.',
    what:'Your jobs are done one at a time, in this order. A job with enough pawns is certain. A job with fewer pawns rolls 3 dice: it can fail, hurt, or start an adventure.',dec:'Only if a card asks you something.'},
  {k:'weather',n:'Weather',tip:'Rain and snow clouds hit the camp. Each level of roof keeps one cloud off.',
    what:'The weather dice are rolled. Every cloud above your roof ruins 1 food and 1 wood (or costs a wound if you have none).',dec:'Nothing. This step runs by itself.'},
  {k:'night',n:'Night',tip:'Everyone eats 1 food and sleeps. Without a shelter each castaway loses 1 life.',
    what:'Everyone eats 1 food. Anyone left hungry loses 2 life. Without a shelter everyone loses 1 life. Fresh food spoils.',dec:'Nothing, unless you can treat the wounded.'}];
const PHI=k=>PH7.findIndex(p=>p.k===k);
const AUTO_PH=['morale','prod','weather','night'];
UI.quick=false;try{UI.quick=localStorage.getItem('swi_quick')==='1'}catch(e){}
function quickOn(r){return !!UI.quick&&r>=2}
function setQuick(v){UI.quick=!!v;try{localStorage.setItem('swi_quick',v?'1':'0')}catch(e){}}
function phaseKey(ph){return {start:'event',event:'event',morale:'morale',prod:'prod',plan:'plan',act:'act',actdone:'act',weather:'weather',night:'night'}[ph]||'event'}
function beatPhase(b){return b.kind==='daysum'?'done':b.kind==='intro'?null:b.kind==='over'?'over':phaseKey(b.phase)}
// where the player is right now: the scene on screen, else the live game
function flowNow(){if(!G)return null;const i=storyIdx();if(i>=0){const b=UI.beats[i];if(b.kind==='intro')return {round:0,k:null};if(b.kind==='daysum')return {round:b.data.round,k:'done'};return {round:b.round,k:beatPhase(b)}}
  if(G.over)return {round:G.round,k:'over'};return {round:G.round,k:phaseKey(G.phase)}}
function roadmapHtml(){const f=flowNow();if(!f)return '';const idx=PHI(f.k);const all=f.k==='done'||f.k==='over';
  if(UI.phxAt!==f.k+f.round){UI.phxAt=f.k+f.round;UI.phx=null}
  const right=f.k===null?'The shipwreck':f.k==='over'?'Game over':f.k==='done'?'Day done':`Step ${idx+1} of 7`;
  const items=PH7.map((p,i)=>{const st=all||i<idx?'done':i===idx?'now':'next';return `<li><button class="rm-p ${st} ${UI.phx===p.k?'open':''}" data-phx="${p.k}" aria-current="${st==='now'?'step':'false'}" title="${esc(p.n)}: ${esc(p.tip)}"><i>${st==='done'?'✓':i+1}</i><span>${p.n}</span></button></li>`}).join('');
  const tp=UI.phx&&PH7[PHI(UI.phx)];
  return `<div class="rm-h"><b>${f.round?`Day ${f.round} of ${G.rounds}`:'Before day 1'}</b><span>${right}${idx>=0&&!all?' · '+PH7[idx].n:''}</span></div><ol class="rm-l" aria-label="The 7 steps of a day">${items}</ol>${tp?`<div class="rm-tip" role="note"><b>${tp.n}:</b> ${esc(tp.tip)} <button class="btn xs ghost" data-phx="${tp.k}" aria-label="Close">✕</button></div>`:''}`}
function renderRoadmap(){const el=$('#roadmap');if(!el)return;const h=G&&UI.modal!=='start'?roadmapHtml():'';el.hidden=!h;if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}}
// the card that opens a step of the day (shown on the first scene of that step)
function phaseHeadHtml(i){const b=UI.beats[i];const k=beatPhase(b);const ix=PHI(k);if(ix<0)return '';const prev=UI.beats[i-1];
  const first=!prev||prev.round!==b.round||beatPhase(prev)!==k;if(!first)return '';const p=PH7[ix];const short=quickOn(b.round);
  let what=p.what;if(k==='event'&&b.round===1)what='There is no event card on the first day. From day 2 a new card is turned over every morning.';
  if(k==='act'){const n=(b.data&&b.data.n)||0;if(n)what=`Your ${n} job${n>1?'s are':' is'} done one at a time. `+p.what.replace(/^Your jobs are done one at a time, in this order\. /,'')}
  const qk=AUTO_PH.includes(k)&&k!=='night'?`<label class="chk qk"><input type="checkbox" data-a="quick" ${UI.quick?'checked':''}> From day 2, skip the automatic steps (Morale, Production, Weather). Their results still show in the day summary.</label>`:'';
  return `<div class="phead ${AUTO_PH.includes(k)?'auto':''}"><div class="ph-n">Step ${ix+1} of 7 · ${p.n}</div>${short?'':`<p><b>What happens:</b> ${esc(what)}</p><p><b>You decide:</b> ${esc(p.dec)}</p>`}${short?'':qk}</div>`}
// ---------- snapshots: the state at a scene ----------
function beatState(k){const b=UI.beats[k];if(!b)return null;if(k>=UI.beats.length-1||!b.snap)return G;if(!b.obj)b.obj=JSON.parse(b.snap);return b.obj}
function withState(s,fn){if(!s||s===G)return fn();const real=G;G=Object.assign({},s,{log:real.log,stk:[]});try{return fn()}finally{G=real}}
const lifeOf=(g,c)=>c.dead?0:CHARS[c.k].die-c.w;
// ---------- end of the day: what changed, what comes tomorrow, the one thing to do first ----------
function daySumData(i){const b=UI.beats[i];const r=b.data.round;let k0=-1;for(let k=i-1;k>=0;k--){const x=UI.beats[k];if(x.round!==r)break;if(x.kind==='plan'||x.kind==='go'){k0=k;if(x.kind==='plan')break}}
  const A=k0>=0?beatState(k0):null;const B=beatState(i);return {r,A,B}}
function daySumHtml(i){const {r,A,B}=daySumData(i);const S=SCENARIOS[G.scen];const ch=[];
  if(A&&B){const nm={food:'Food',pfood:'Dry food',wood:'Wood',fur:'Fur'};for(const k of ['food','pfood','wood','fur']){const a=A.res[k]+(A.fut&&A.fut[k]||0),z=B.res[k];if(a!==z)ch.push({t:`${nm[k]}: ${a} → ${z}`,c:z>a?'good':'bad'})}
    const why=dayWhy(r);B.chars.forEach((c,j)=>{const o=A.chars[j];if(!o||c.npc&&G.scen!=='stranded')return;const la=lifeOf(A,o),lz=lifeOf(B,c);const w=why.hurt[c.nm]?` (${why.hurt[c.nm].join(', ')})`:'';if(c.dead&&!o.dead)ch.push({t:`${c.nm} died${w}`,c:'bad'});else if(la!==lz)ch.push({t:`${c.nm}: ${la} → ${lz} life${lz<la?w:''}`,c:lz>la?'good':'bad'})});
    if(why.food.length){const f=ch.find(x=>/^Food:/.test(x.t));if(f)f.t+=` (${why.food.join(', ')})`}
    if(A.fri&&B.fri&&A.fri.w!==B.fri.w)ch.push({t:`Friday: ${FRIDAY.die-A.fri.w} → ${Math.max(0,FRIDAY.die-B.fri.w)} life`,c:B.fri.w>A.fri.w?'bad':'good'});
    if(A.morale!==B.morale)ch.push({t:`Morale: ${A.morale} → ${B.morale}`,c:B.morale>A.morale?'good':'bad'});
    const sa=withState(A,()=>hasShelter()),sz=withState(B,()=>hasShelter());if(sa!==sz)ch.push({t:sz?'Shelter built':'Shelter lost',c:sz?'good':'bad'});
    for(const [k,n] of [['roof','Roof'],['pal','Palisade']])if(A.camp[k]!==B.camp[k])ch.push({t:`${n}: ${A.camp[k]} → ${B.camp[k]}`,c:B.camp[k]>A.camp[k]?'good':'bad'});
    if(A.weapon!==B.weapon)ch.push({t:`Weapon: ${A.weapon} → ${B.weapon}`,c:B.weapon>A.weapon?'good':'bad'});
    for(const k of Object.keys(B.inv.built))if(!A.inv.built[k])ch.push({t:`Made: ${withState(B,()=>invReq(k).n)}`,c:'good'});
    const ea=A.map.filter(m=>m.tile!=null).length,ez=B.map.filter(m=>m.tile!=null).length;if(ez>ea)ch.push({t:`Explored ${ez-ea} new place${ez-ea>1?'s':''}`,c:'good'});
    if(G.scen==='marooned'&&A.sc.pile!==B.sc.pile)ch.push({t:`Signal pile: ${A.sc.pile} → ${B.sc.pile} of 15 wood`,c:'good'});
    if(G.scen==='hexed'&&A.sc.crosses.length!==B.sc.crosses.length)ch.push({t:`Crosses: ${A.sc.crosses.length} → ${B.sc.crosses.length} of 5`,c:'good'})}
  const tm=withState(B,()=>tomorrowInfo(r));
  return {kicker:`End of day ${r} of ${G.rounds}`,title:'How the day went',
    body:`<div class="dsum">${!A?'':`<h4>What changed today</h4>`+(ch.length?`<ul class="chg">${ch.map(x=>`<li class="${x.c}">${esc(x.t)}</li>`).join('')}</ul>`:'<p class="muted small">Nothing changed.</p>')}
      <h4>Coming tomorrow (day ${r+1})</h4><ul class="tmr">${tm.lines.map(l=>`<li class="${l.c||''}">${esc(l.t)}</li>`).join('')}</ul>
      <div class="top1"><div class="rk">Most important tomorrow</div><b>${esc(tm.top.t)}</b><span>${esc(tm.top.why)}</span></div></div>`}}
// why life and food went down on day r, read from the log: {hurt:{name:['no shelter ×2',...]}, food:['eaten 2','spoiled 1',...]}
function dayWhy(r){const hurt={},food=[];const cnt={};
  for(const l of G.log.slice().reverse()){if(l.r!==r)continue;let m=/^(.+?) takes (\d+) wounds? \((.+)\)\./.exec(l.t);
    if(m){const k=m[1]+'|'+m[3];cnt[k]=(cnt[k]||0)+(+m[2]);continue}
    m=/^☠ (.+?) dies \((.+)\)/.exec(l.t);if(m){const k=m[1]+'|'+m[2];cnt[k]=(cnt[k]||0)+1;continue}
    if((m=/^Everyone eats \((\d+) food\)/.exec(l.t)))food.push(`eaten ${m[1]}`);
    else if((m=/^(\d+) food spoils/.exec(l.t)))food.push(`${m[1]} spoiled overnight`);
    else if((m=/(\d+) food and \d+ wood are ruined/.exec(l.t)))food.push(`${m[1]} ruined by rain`);
    else if((m=/^Lean season: (\d+) food/.exec(l.t)))food.push(`${m[1]} lost to the lean season`)}
  for(const k in cnt){const [nm,w]=k.split('|');(hurt[nm]=hurt[nm]||[]).push(`${w}${cnt[k]>1?' ×'+cnt[k]:''}`)}
  return {hurt,food}}
// run inside withState(state at the end of day r)
function tomorrowInfo(r){const S=SCENARIOS[G.scen];const L=[];const n=r+1;const dieN={rain:'rain die',snow:'winter die',animals:'hungry-animals die'};
  if(n>G.rounds)return {lines:[{t:'This was the last day.'}],top:{t:'—',why:''}};
  const wx=S.wx[n]||[];L.push({t:wx.length?`Weather tomorrow night: ${wx.map(d=>dieN[d]).join(', ')} (your roof is ${G.camp.roof}).`:'Weather tomorrow night: calm, unless a card adds clouds.',c:wx.length>G.camp.roof?'bad':''});
  const eaters=living().filter(c=>!c.out).length;const t=campTile();const pf=t?t.src.filter((s,i)=>s!=='wood'&&!G.map[G.camp.pos].exh[i]).length:0;const have=food();
  L.push({t:`Food: ${eaters} needed tomorrow night. You have ${have}${pf?`, and the camp gives about ${pf} in the morning`:''}.`,c:have+pf<eaters?'bad':''});
  if(G.ev.wait){const B2=BEAST[G.ev.wait];L.push({t:`At dawn a ${B2.n} attacks: strength ${B2.str} against your weapon ${G.weapon}.`,c:B2.str>G.weapon?'bad':''})}
  const t0=G.ev.threat[0],t1=G.ev.threat[1];
  if(!hasShelter())L.push({t:'No shelter yet: everyone loses 1 life every night until you build one.',c:'bad'});
  if(t0)L.push({t:`At dawn “${CARD[t0].th.n}” strikes, because nobody dealt with it: ${opsText(CARD[t0].te)||'nothing much'}.`,c:'bad'});
  if(t1)L.push({t:`“${CARD[t1].th.n}” can still be dealt with tomorrow. If not, it strikes the morning after.`});
  if(n>=2)L.push({t:'A new event card is turned over in the morning.'});
  // the one priority
  let top=null;const nd=living().filter(c=>!c.npc&&lifeOf(G,c)<=3).sort((a,b)=>lifeOf(G,a)-lifeOf(G,b))[0];
  const tb=SRP_COST[Math.min(4,Math.max(2,G.np))];
  if(nd)top={t:`Rest the ${nd.nm}`,why:`Only ${lifeOf(G,nd)} life left. Resting heals 1. If anyone dies, you all lose.`};
  else if(have+pf<eaters)top={t:'Find food',why:`You need ${eaters} food tomorrow night and can count on only ${have+pf}. Hungry castaways lose 2 life each.`};
  else if(!hasShelter())top={t:G.res.wood>=tb.wood?'Build a shelter':'Collect wood for a shelter',why:`A shelter costs ${tb.wood} wood (you have ${G.res.wood}). Without one everyone loses 1 life every night.`};
  else if(G.ev.wait&&BEAST[G.ev.wait].str>G.weapon)top={t:'Make a better weapon',why:'A beast attacks at dawn. Every point it is stronger than your weapon is a wound.'};
  else if(wx.filter(d=>d!=='animals').length>G.camp.roof)top={t:'Raise the roof',why:`Tomorrow brings ${wx.filter(d=>d!=='animals').length} weather dice and your roof is ${G.camp.roof}. Every cloud above it ruins food and wood.`};
  else if(t1&&opsValue(CARD[t1].te)<0)top={t:`Deal with “${CARD[t1].th.n}”`,why:`If it is still there the morning after, it strikes: ${opsText(CARD[t1].te)}.`};
  else top={t:'Work toward the goal',why:SC().goal?SC().goal():S.x};
  return {lines:L,top}}
// ---------- the morning so far (for plan step 1) ----------
function morningLines(){const out=[];for(let k=UI.beats.length-1;k>=0;k--){const b=UI.beats[k];if(b.round!==G.round)break;if(['dawn','event','threat','morning','prod','fight','adventure','mystery'].includes(b.kind))out.unshift(...beatLines(k).filter(MEANINGFUL).map(l=>l))}
  const ev=G.lastEvent&&G.round>1?G.log.find(l=>/^Event:/.test(l.t)&&l.r===G.round):null;
  return (ev?[{t:ev.t,c:'big'}]:[]).concat(out).slice(0,7)}
const ORDER_T=['threat','hunt','build','gather','explore','special','tmap','camp','rest'];
// "Job 2 of 4" for an action scene
function jobNo(i){const b=UI.beats[i];let k=0,g=-1;for(let j=i;j>=0;j--){const x=UI.beats[j];if(x.round!==b.round)break;if(x.kind==='act')k++;if(x.kind==='go'){g=j;break}}if(g<0)return null;const n=UI.beats[g].data.n||0;return n?{k,n}:null}
