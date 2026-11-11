// ---------- round flow (interface only, no rules): roadmap, turn-order queue, step boxes, notices, guided pauses, end-of-round summary ----------
Object.assign(UI,{notes:{},flowG:null,sumSeen:0,roadInfo:null,hold:null,holdK:[],resSeen:0,draftR:null});
const PHASES=[
  {n:'Planning',sub:'set dials',t:'<b>Planning:</b> every pilot secretly picks one maneuver on its dial. Nobody moves yet.'},
  {n:'Activation',sub:'move + act',t:'<b>Activation:</b> one ship at a time reveals its dial and moves, <b>lowest pilot skill first</b>. After moving, each ship takes one action.'},
  {n:'Combat',sub:'shoot',t:'<b>Combat:</b> one ship at a time may shoot an enemy inside its arc at range 1-3, <b>highest pilot skill first</b>.'},
  {n:'End',sub:'summary',t:'<b>End:</b> unused focus and evade tokens are removed (target locks and stress stay). Then the next round starts.'}];
function flowReset(){Object.assign(UI,{notes:{},hpAt:{},flowG:G,sumSeen:G&&G.round>=2?G.round-1:0,roadInfo:null,hold:null,holdK:[],resSeen:0,draftR:null})}
function flowSync(){if(G&&UI.flowG!==G)flowReset()}
// ---- guidance level: "full" explains every step, "light" keeps one line. Auto = full for the first round of the first battle ----
const guideMode=()=>LS.get('na_guide')||'auto';
function guided(){const m=guideMode();if(m==='full')return true;if(m==='light')return false;return !tourOff()&&(!G||roundShown()<=1)}
function guideBtn(){const b=document.querySelector('.na-guide');if(b){const on=guided();b.innerHTML=`📘 Guide: <b>${on?'full':'light'}</b>`;b.setAttribute('aria-pressed',String(on));b.title=on?'Step-by-step help is on. Tap for short help only.':'Short help. Tap for step-by-step help.'}}
// ---- where we are: the summary of round N shows at the start of round N+1, before any dial is set ----
function sumPending(){return !!(G&&!G.winner&&G.phase==='plan'&&planSide()>=0&&G.round>=2&&UI.sumSeen<G.round-1&&!UI.info)}
function roundShown(){return G?(sumPending()?G.round-1:G.round):0}
function stepShown(){if(!G)return 0;if(G.winner)return 5;if(G.round===0)return 0;if(sumPending())return 4;return G.phase==='plan'?1:Math.min(4,G.step||1)}
// guided pauses stop the host's engine, so online games never pause
const holdOK=()=>ANIM&&!(typeof NET!=='undefined'&&NET.on);
const mine=s=>s&&isHuman(s.side)&&(typeof NET==='undefined'||!NET.on||s.side===NET.mySide);
const nm=s=>esc(s.name);
const youTag=s=>mine(s)&&soloSide()>=0?' (you)':'';
// ---- the roadmap strip ----
function renderRoad(){const el=$('steps');if(!el)return;if(!G){el.innerHTML='';return}const st=stepShown(),R=roundShown();
  let h=`<div class="road" role="list" aria-label="Round roadmap"><span class="rn">${G.round===0?'Setup':G.winner?'Over':'Round '+R}</span>`;
  PHASES.forEach((p,i)=>{const k=i+1;const cls=G.winner||k<st?'done':k===st?'on':'next';
    h+=`<button class="ph ${cls}" data-road="${i}" role="listitem" aria-current="${k===st?'step':'false'}" aria-expanded="${UI.roadInfo===i}"><b><span class="lg">${p.n}</span><span class="sh">${['Plan','Act','Combat','End'][i]||p.n}</span></b><i>${cls==='done'?'<span class="mk">✓</span><span class="tx"> finished</span>':cls==='on'?'<span class="mk">●</span><span class="tx"> now</span>':'<span class="tx">'+p.sub+'</span>'}</i></button>`});
  h+='</div>';
  const info=UI.roadInfo!=null?PHASES[UI.roadInfo].t:G.round===0?'<b>Setup:</b> place the asteroids and the ships, then round 1 starts. Every round has the same 4 phases.':'';
  if(info)h+=`<p class="roadinfo">${info}${UI.roadInfo!=null?' <button class="linkb" data-road="x" aria-label="Close explanation">✕</button>':''}</p>`;
  el.innerHTML=h}
document.addEventListener('click',e=>{const t=e.target.closest('[data-road]');if(!t)return;const v=t.dataset.road;UI.roadInfo=v==='x'||UI.roadInfo===+v?null:+v;renderRoad()});
// ---- the turn-order queue ----
function queueData(){if(!G||G.round===0||G.winner||sumPending())return null;const st=G.step;
  if(G.phase==='plan'){const ps=planSide();const ord=psOrder(true);return {title:'Move order',rule:'lowest skill first',ids:ord.map(s=>s.id),cur:null,
    tag:s=>s.side===ps?(UI.draft[s.id]!=null?'dial ✓':'dial ?'):isHuman(s.side)?'':s.dial!=null?'dial set':'',
    why:'Everyone plans at the same time, in secret. Then ships move in this order: <b>lowest pilot skill first</b>'+tieText(ord)+'.'}}
  if(!G.order)return null;const ids=G.order;const cur=G.oi<ids.length?ids[G.oi]:null;const R=G.round;const N=UI.notes[R]||[];
  if(st===2)return {title:'Activation order',rule:'lowest skill first',ids,cur,done:i=>i<G.oi,
    tag:(s,i)=>{const n=N.find(x=>x.id===s.id&&x.lost);return n?'no action':i<G.oi?'moved ✓':i===G.oi?'now':''},
    why:'Lowest pilot skill moves first, so the best pilots move last and can react'+tieText(ids.map(ship))+'.'};
  if(st===3)return {title:'Combat order',rule:'highest skill first',ids,cur,done:i=>i<G.oi,
    tag:(s,i)=>{if(!s.alive)return 'destroyed';const n=N.find(x=>x.id===s.id&&x.kind==='noshot');return n?'no shot':i<G.oi?(s.fired?'fired ✓':'done'):i===G.oi?'now':''},
    why:'Highest pilot skill shoots first. A ship destroyed by a higher-skill pilot never gets to shoot'+tieText(ids.map(ship))+'.'};
  return null}
function tieText(list){const ps=list.filter(Boolean).map(psOf);const tie=ps.some((v,i)=>ps.indexOf(v)!==i);return tie?` (a tie goes to the side with initiative: ${esc(sideName(G.init))})`:''}
function renderQueue(){const el=$('queue');if(!el)return;const q=queueData();if(!q){el.innerHTML='';return}
  el.innerHTML=`<div class="qrow" role="list" aria-label="${q.title}"><span class="ql"><span class="qt">${q.title} </span><em>(${q.rule})</em>:</span>${q.ids.map((id,i)=>{const s=ship(id);if(!s)return '';const t=q.tag(s,i);
    return `<button class="qc f${FACTIONS[G.fac[s.side]].col} ${id===q.cur?'cur':''} ${q.done&&q.done(i)?'done':''} ${s.alive?'':'dead'} ${mine(s)?'me':''}" data-sel="${id}" role="listitem" title="${nm(s)}: pilot skill ${psOf(s)}"><b>${esc(shortName(s))}${mine(s)&&soloSide()>=0?'<span class="qy"> (you)</span>':''}</b><i><span class="qs">skill </span>${psOf(s)}${t?`<span class="qx"> · ${t}</span>`:''}${/✓/.test(t)?'<span class="qd"> ✓</span>':''}</i></button>`}).join('<span class="qa" aria-hidden="true">›</span>')}</div><p class="qwhy">${q.why}</p>`;
}
// ---- notices: lost actions, no shot, rocks, forced moves (from the battle log; the log itself is unchanged) ----
function addNote(n){flowSync();const R=G.round;const L=(UI.notes[R]=UI.notes[R]||[]);if(L.some(x=>x.id===n.id&&x.kind===n.kind))return null;n.r=R;n.t0=Date.now();L.push(n);
  const s=ship(n.id);if(n.hold&&s&&mine(s)&&guided()&&holdOK()&&!G.winner&&!UI.hold)UI.hold={kind:'note',n};return n}
const _lgF=lg;lg=function(side,t){_lgF(side,t);try{if(G)flowLog(side,t)}catch(e){}};
function flowLog(side,t){let m;const by=n=>byName(n,side);
  if(m=t.match(/^(.+) bumps into (.+) and skips its action\./)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'bump',lost:true,hold:true,t:`<b>${nm(s)}${youTag(s)} bumped into ${esc(m[2])}: action lost.</b> Why: its move ended on top of ${esc(m[2])}, so it stopped short and skips its action. Ships that touch can't shoot each other this round.`,tip:'Next time pick a shorter, longer or sideways move so the bases do not overlap.'});return}
  if(m=t.match(/^(.+) is stressed and can't take an action/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'stressed',lost:true,hold:true,t:`<b>${nm(s)}${youTag(s)} is stressed: action lost.</b> Why: a ship with a stress token (from a red move) can't take actions.`,tip:'Fly a green move (straight or gentle bank) to clear the stress.'});return}
  if(m=t.match(/^(.+) (flies through|lands on) an asteroid: rolls (\w+)/)){const s=by(m[1]);if(!s)return;const on=m[2]==='lands on',f=m[3];
    addNote({id:s.id,kind:'rock',lost:true,hold:true,t:`<b>${nm(s)}${youTag(s)} ${on?'landed on':'flew through'} an asteroid: action lost.</b> It rolled a damage die: <b>${f}</b> (${f==='hit'?'1 damage':f==='crit'?'1 damage and a damage card':'no damage'})${on?', and a ship sitting on an asteroid can\'t shoot this round':''}.`,tip:'Check the ghost before you lock: a template that touches a rock costs your action.'});return}
  if(m=t.match(/^(.+) flies a red maneuver and takes a stress/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'red',t:`${nm(s)}${youTag(s)} flew a red move and got a <b>stress token</b>: no action while stressed, and no red moves until a green move clears it.`});return}
  if(m=t.match(/^(.+) flies a green maneuver and clears/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'green',t:`${nm(s)}${youTag(s)} flew a green move and cleared a stress token.`});return}
  if(m=t.match(/^(.+) is stressed and can't fly the red (.+?); (.+) picks (.+) instead/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'forced',hold:true,t:`<b>${nm(s)}${youTag(s)} was stressed and could not fly its red ${esc(m[2])}.</b> The other side picked ${esc(m[4])} for it instead. Stressed ships can't fly red moves.`});return}
  if(m=t.match(/^(.+) flies off the battlefield/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'off',hold:true,t:`<b>${nm(s)}${youTag(s)} flew off the battlefield and is lost.</b> A move that ends outside the mat destroys the ship.`});return}
  if(m=t.match(/^(.+) is ionised and drifts/)){const s=by(m[1]);if(s)addNote({id:s.id,kind:'ion',lost:true,t:`${nm(s)}${youTag(s)} was ionised: it drifted straight 1 instead of its dial and gets no action.`});return}}
// why a ship has no legal target (read-only, the same checks weaponsFor makes)
function whyNot(s,e){if(s.flags.noAtk)return 'it is sitting on an asteroid, so it can\'t attack this round';
  const dc=s.dmg.find(x=>x.up&&DAMAGE[x.c].k==='noatk');if(dc)return `its damage card ${esc(DAMAGE[dc.c].n)} stops it attacking`;
  if(G.touch.some(p=>(p[0]===s.id&&p[1]===e.id)||(p[1]===s.id&&p[0]===e.id))&&!exTouchOK(s,e))return `touching ${nm(s)} (ships in contact can't shoot each other)`;
  const r=arcReach(s,B(s),e,B(e),s.arc);if(!r){const rr=rangeOf(baseDist(s,B(s),e,B(e)));return rr<=3?`outside the firing arc (it is at range ${rr}, but not in front)`:'outside the firing arc and too far'}
  const rg=rangeOf(r.d);if(rg>3)return 'too far: range 4 or more (weapons reach range 1-3)';
  return 'protected: a guardian pilot next to it draws the fire'}
function noShotText(s){const en=enemiesOf(s);const why=en.length?en.map(e=>`${nm(e)} is ${whyNot(s,e)}`).join('; '):'no enemies left';
  return `<b>${nm(s)}${youTag(s)} can't shoot this round.</b> ${s.flags.noAtk?'It is sitting on an asteroid, so it can\'t attack.':why.charAt(0).toUpperCase()+why.slice(1)+'.'}`}
// combat skips ships without a target without a word: note them (and pause in guided mode) before the skip happens
const _nextAttacker=nextAttacker;nextAttacker=function(){let pause=false;
  try{if(G&&!G.winner&&G.order){for(let i=G.oi;i<G.order.length;i++){const s=ship(G.order[i]);if(!s)continue;const psNow=psOf(s);
      if((s.alive||s.flags.dyingPS===psNow)&&!s.fired&&weaponsFor(s).length)break;
      if(s.alive&&!s.fired){const n=addNote({id:s.id,kind:'noshot',t:noShotText(s),tip:'Plan a move that ends with an enemy in front of you, at range 1-3.'});if(n&&mine(s)&&guided()&&holdOK()&&!UI.hold){UI.hold={kind:'note',n};pause=true}}}}}catch(e){}
  if(pause){UI.holdK.push(()=>_nextAttacker());refresh();return}return _nextAttacker()};
// guided pauses: the engine's own "later" steps wait while a pause box is up (the computer waits too)
for(const f of ['nextActivationLater','nextAttackerLater']){const o=window[f];if(typeof o!=='function')continue;window[f]=function(){const a=arguments;if(UI.hold&&ANIM&&G&&!G.winner){UI.holdK.push(()=>o.apply(null,a));return}return o.apply(null,a)}}
const _schedF=schedule;schedule=function(){if(UI.hold&&G&&!G.winner)return;return _schedF()};
function releaseHold(){UI.hold=null;const ks=UI.holdK.splice(0);render();for(const k of ks)try{k()}catch(e){console.error(e)}schedule()}
// a finished attack that involved a human ship: in guided mode it pauses on the result
function flowWatch(){flowSync();if(!G)return;if(G.winner&&UI.hold){UI.hold=null;UI.holdK=[]}const R=UI.results[0];
  if(R&&R.t>UI.resSeen){UI.resSeen=R.t;const a=ship(R.a),d=ship(R.d);if((guided()||(window.PHN&&PHN.on))&&holdOK()&&!G.winner&&!UI.hold&&(mine(a)||mine(d)))UI.hold={kind:'res',R}}
  if(G.phase!=='plan'&&UI.draftR!==G.round)UI.draftR=null;if(G.phase==='plan'&&UI.draftR!==G.round){UI.draft={};UI.draftR=G.round}}
function holdHTML(){const H=UI.hold;const g=guided();let h='';
  if(H.kind==='res'){const R=H.R;const a=ship(R.a),d=ship(R.d);h+=`<p class="head">Combat · attack result</p>${stepList(['Choose a target','Roll and modify dice','Result'],2)}${resultHTML(R)}${R.dice?`<div class="drow"><span class="dl">Attack dice · ${esc(shortName(a))}</span><div class="dice">${R.dice.map(f=>die(f,'atk')).join('')||'<i class="muted small">none</i>'}</div></div><div class="drow"><span class="dl">Defence dice · ${esc(shortName(d))}</span><div class="dice">${R.def.map(f=>die(f,'def')).join('')||'<i class="muted small">none</i>'}</div></div>`:''}`;
    if(g)h+=`<p class="small">${R.dmg?'Damage goes to the <b>shields</b> first, then the <b>hull</b>. A ship with 0 hull is destroyed.':'Each ✦ evade result cancels one hit, so nothing got through.'}${R.crits.length?' A crit also deals a <b>damage card</b> face up, with a lasting effect.':''}</p>`}
  else{const n=H.n;const s=ship(n.id);h+=`<p class="head">${n.kind==='noshot'?'Combat':'Activation'} · ${s?esc(shortName(s)):''}</p><div class="note ${n.lost||n.kind==='noshot'?'lost':''}">${n.t}${n.tip?` <i>${n.tip}</i>`:''}</div>`}
  return h+`<div class="acts main"><button class="btn primary" data-a="hold">Continue ▶<small>${nextText()}</small></button></div>`}
function nextText(){if(!G||!G.order)return '';const st=G.step;const N=UI.notes[G.round]||[];const nx=G.order.slice(Math.max(0,G.oi)).map(ship).find(s=>s&&s.alive&&s.id!==(UI.hold&&UI.hold.n&&UI.hold.n.id)&&!(st===3&&N.some(x=>x.id===s.id&&x.kind==='noshot')));
  if(st===2)return nx?`Next: ${nm(nx)} moves`:'Next: combat';if(st===3)return nx?`Next: ${nm(nx)} may shoot`:'Next: end of the round';return ''}
function stepList(ls,cur){return `<ol class="sub" aria-label="Steps">${ls.map((l,i)=>`<li class="${i<cur?'done':i===cur?'on':''}">${i<cur?'✓ ':''}${l}</li>`).join('')}</ol>`}
// the latest notices of this round (non-blocking), and the last attack result
function renderNotice(){const el=$('notice');if(!el)return;if(!G||G.winner||UI.info||sumPending()||(UI.hold&&!humanTurn()&&planSide()<0)){el.innerHTML='';return}let h='';
  const N=(UI.notes[G.round]||[]).filter(n=>!['green'].includes(n.kind)&&Date.now()-n.t0<90000&&!(UI.hold&&UI.hold.n===n));
  const pick=N.filter(n=>mine(ship(n.id))).concat(N.filter(n=>!mine(ship(n.id))&&['bump','rock','off','noshot'].includes(n.kind))).slice(-2);
  h+=pick.map(n=>`<div class="note small ${n.lost||n.kind==='noshot'?'lost':''}">${n.t}</div>`).join('');
  if(G.phase!=='plan'){const R=UI.results.find(r=>r.r===G.round&&Date.now()-r.t<45000);if(R&&!(UI.hold&&UI.hold.R===R))h+=resultHTML(R)}
  el.innerHTML=h}
// ---- step boxes for each decision ----
const MVW={T:'Turn',B:'Bank',S:'Straight',K:'K-turn'};
function mvWords(m){return m.s===0?'Full stop':m.t==='S'?`Straight ${m.s}`:m.t==='K'?`K-turn ${m.s} (turn around)`:`${MVW[m.t]} ${m.d<0?'left':'right'} ${m.s}`}
const colWords=c=>c==='g'?'green = easy, clears a stress token':c==='r'?'red = hard, gives a stress token (no action while stressed)':'white = normal';
function rockHits(s,m){const key=[G.round,s.id,s.x,s.y,s.h,m.s,m.t,m.d||0].join('|');const C=UI.rhC=(UI.rhC&&UI.rhC.g===G)?UI.rhC:{g:G,v:{}};if(key in C.v)return C.v[key];return C.v[key]=rockHits0(s,m)}
function rockHits0(s,m){const b=B(s),p=finalPose(s,b,m);if(G.rocks.some(o=>polyOverlap(corners(p,b),rockPoly(o))))return 2;return tplPoints(s,b,m,4).some(q=>G.rocks.some(o=>polyPointDist(q,rockPoly(o))<=TPL_W/2))?1:0}
function recBox(s,sug){if(!UI.hints)return '';const m=dialOf(s)[sug],c=exColor(s,m).c;const si=sugInfo(s,sug);
  const bad=dialOf(s).filter((x,i)=>i!==sug&&rockHits(s,x)).length;const rock=bad&&!rockHits(s,m)?` It also avoids the asteroids that ${bad} other move${bad>1?'s':''} would hit.`:'';
  let alt='';if(c==='r'){const a=saferAlt(s);if(a!=null&&a!==sug)alt=` Safer: <b>${mvWords(dialOf(s)[a])}</b>.`}
  return `<div class="recbox"><span class="rk">★ Recommended</span> <b>${mvWords(m)}</b> <span class="cw ${c}">${c==='g'?'green':c==='r'?'red':'white'}</span>: ${si.why}.${rock} <span class="${c==='r'?'warn':'muted'}">${si.cost}</span>${alt}
    ${UI.draft[s.id]===sug?'':`<button class="btn sm" data-dial="${sug}" data-ship="${s.id}">Use it</button>`}</div>`}
function planHTML(ps){const my=alive().filter(s=>s.side===ps);if(!UI.sel||!my.find(s=>s.id===UI.sel))UI.sel=(my.find(s=>UI.draft[s.id]==null)||my[0]).id;const s=ship(UI.sel);
  const idx=my.indexOf(s),nset=my.filter(x=>UI.draft[x.id]!=null).length,all=nset===my.length,g=guided();const sug=suggestDial(s);
  const di=UI.hoverDial!=null?UI.hoverDial:UI.draft[s.id];const ord=psOrder(true);
  const title=all?`Planning · all ${my.length>1?my.length+' dials':'dials'} set: lock them in`:`Planning · ship ${idx+1} of ${my.length}: choose a maneuver`;
  let h=`<p class="head">${title}</p>${stepList(my.map((x,i)=>`${esc(shortName(x))}${my.length>1?'':': pick a move'}`).concat(['Lock in']),all?my.length:idx)}`;
  if(g)h+=`<p class="now-t">${all?`Press <b>Lock in dials</b>. Then <b>Activation</b> starts: ships reveal their dials and move one by one, lowest pilot skill first (${ord.map(x=>esc(shortName(x))+' '+psOf(x)).join(' → ')}).`
    :`Tap a maneuver on <b>${nm(s)}</b>'s dial below. A ghost appears on the board where the ship would end.`}</p>`;
  else h+=`<p class="now-t">${all?'Press <b>Lock in dials</b>.':`Choose ${nm(s)}'s maneuver.`}</p>`;
  if(my.length>1)h+=`<div class="shipTabs">${my.map((x,i)=>`<button class="btn tab ${x.id===UI.sel?'on':''}" data-sel="${x.id}">Ship ${i+1}: ${esc(shortName(x))} ${UI.draft[x.id]!=null?'✓':''}</button>`).join('')}</div>`;
  if(s.stress)h+=`<p class="warn small"><b>${nm(s)} is stressed:</b> red moves are blocked, and it gets no action this round unless a green move clears the stress first.</p>`;
  h+=`<div class="dlegend" aria-label="Dial colours"><span class="sw g"></span>green = easy (clears stress) <span class="sw w"></span>white = normal <span class="sw r"></span>red = hard (gives stress)</div>`;
  h+=`<div class="dialwrap">${dialGrid(s,sug)}<div class="dialinfo"><span class="dname"><b>${nm(s)}</b> · pilot skill ${psOf(s)}${s.rev&&G.round>1?` · last round: ${mvWords(s.rev)}`:''}</span>
    <p class="small mvread">${di!=null?moveRead(s,di):g?'Tap (or hover) a maneuver to see where it goes. The number is the speed, the arrow the direction.':'Choose a maneuver.'}</p></div></div>`;
  h+=recBox(s,sug);if(g&&!all)h+=`<p class="small muted">The enemy is choosing too, in secret, so it may not stay where it is. Nobody moves until every dial is locked.</p>`;
  h+=`<div class="acts main"><button class="btn primary" data-a="lock" ${all?'':'disabled'}>Lock in dials${all?'':`<small>${my.length-nset} ship${my.length-nset>1?'s':''} still need${my.length-nset>1?'':'s'} a maneuver</small>`}</button><button class="btn" data-a="autodial">Use recommended${my.length>1?' for all':''}</button></div>`;
  return h}
function moveRead(s,i){const m=dialOf(s)[i],c=exColor(s,m).c;return `<b>${mvWords(m)}</b> · <span class="cw ${c}">${colWords(c)}</span><br>${poseReport(s,m)}`}
function inArcOf(s,p){const b=B(s);p=p||s;return enemiesOf(s).map(e=>{const r=arcReach(p,b,e,B(e),s.arc);return r&&rangeOf(r.d)<=3?{e,rg:rangeOf(r.d)}:null}).filter(Boolean).sort((a,b)=>a.rg-b.rg)}
function arcsOnMe(s,p){const b=B(s);p=p||s;return enemiesOf(s).map(e=>{const q=arcReach(e,B(e),p,b,e.arc);return q&&rangeOf(q.d)<=3?{e,rg:rangeOf(q.d)}:null}).filter(Boolean).sort((a,b)=>a.rg-b.rg)}
function actNow(s,o,a){const mi=inArcOf(s),th=arcsOnMe(s);
  if(o.a==='F')return mi.length?`Now: ${nm(mi[0].e)} is in your arc at range ${mi[0].rg}. When you shoot, every ◉ focus result becomes a hit (or an evade if you are shot).`:`Now: nobody is in your arc to shoot, but focus still turns ◉ results into evades if you are shot.`;
  if(o.a==='E')return th.length?`Now: you are in ${nm(th[0].e)}'s arc (range ${th[0].rg}). The evade token cancels one of its hits.`:'Now: no enemy has you in its arc, so it may go unused (it is removed at the end of the round).';
  if(o.a==='TL'){const t=ship(o.arg);if(!t)return '';const rg=rangeOf(baseDist(s,B(s),t,B(t)));const ina=mi.some(x=>x.e===t);return `Lock ${nm(t)} (range ${rg}): when you attack it you may reroll any attack dice. The lock stays until you use it.${ina?'':' It is not in your arc right now.'}`}
  if(o.p&&/^(BR|BO|EH|DD)$/.test(o.a)){const mi2=inArcOf(s,o.p),th2=arcsOnMe(s,o.p);return `${o.a==='BO'?'Surge forward':o.a==='DD'?'Turn hard':'Slide sideways'} (hover to see the ghost). Ends ${mi2.length?`with ${nm(mi2[0].e)} in your arc at range ${mi2[0].rg}`:'with nobody in your arc'}${th2.length?`, in ${nm(th2[0].e)}'s arc`:', outside every enemy arc'}.`}
  return a&&a.d?a.d:''}
function recAct(s){const acts=actionsFor(s);if(acts.some(a=>/^RP\d/.test(a.a)))return acts.find(a=>/^RP\d/.test(a.a)).a;const mi=inArcOf(s),th=arcsOnMe(s);const has=x=>acts.some(a=>a.a===x);
  if(!mi.length&&th.length&&has('E'))return 'E';if(has('F'))return 'F';if(has('E'))return 'E';return null}
function actionHTML(s){const acts=actionsFor(s);const g=guided();const rec=recAct(s);const ord=G.order||[];const i=ord.indexOf(s.id);
  let h=`<p class="head">Activation · ${esc(shortName(s))}: choose one action</p>${stepList([`Reveal and move: ${s.rev?mvWords(s.rev):'moved'}`,'Choose one action'],1)}`;
  if(g)h+=`<p class="now-t"><b>${nm(s)}</b> moved ${i===ord.length-1?'last':'now'}: ships move from lowest to highest pilot skill, and its skill is ${psOf(s)}. After moving it may take <b>one action</b>. Each button says what it does right now; ★ is recommended.</p>`;
  else h+=`<p class="now-t">You flew <b>${s.rev?mvWords(s.rev):''}</b>. Take one action.</p>`;
  h+='<div class="acts col">'+actOpts(s,acts).sort((x,y)=>(/^RP\d/.test(y.a)?1:0)-(/^RP\d/.test(x.a)?1:0)).map(o=>{const a=acts.find(x=>x.a===o.a);const r=o.a===rec&&(o.a!=='TL')?' rec':'';
    if(/^RP\d/.test(o.a)){const x=s.dmg[+o.a.slice(2)],D=DAMAGE[x.c];return `<button class="btn rep${r}" data-act="action" data-a2="${o.a}" title="${esc(D.t)}">${r?'★ ':''}🔧 Repair ${esc(D.n)}<small>${D.fix==='any'?'Always works':`Roll 1 attack die: ${D.fix==='hit'?'a hit':'a hit or crit'} fixes it`}. Right now: ${esc(critPlain(x.c,s))}</small></button>`}
    const lab=o.a==='F'?'◉ Focus':o.a==='E'?'✦ Evade':o.a==='TL'?'⌖ '+esc(o.l):esc(o.l);
    return `<button class="btn${r}" data-act="action" data-a2="${o.a}" ${o.arg!=null?`data-arg="${esc(o.arg)}"`:''} ${o.p?`data-hov="${o.a}:${o.arg}"`:''} title="${esc(a&&a.d||'')}">${r?'★ ':''}${lab}<small>${actNow(s,o,a)}</small></button>`}).join('')+
    `<button class="btn ghost" data-act="action" data-a2="skip">Skip action<small>Take nothing this time.</small></button></div>`;
  return h}
function targetHTML(s){const g=guided();const ws=weaponsFor(s);const opts=[];for(const w of ws)for(const t of w.targets){const d=ship(t.id);const sd=shotDice(s,w,t,d);opts.push({w,t,d,n:sd.atk,m:sd.def,e:expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)})}
  const best=opts.slice().sort((a,b)=>b.e-a.e)[0];const ord=G.order||[];
  let h=`<p class="head">Combat · ${esc(shortName(s))}: choose a target</p>${stepList(['Choose a target','Roll and modify dice','Result'],0)}`;
  if(g)h+=`<p class="now-t"><b>${nm(s)}</b> shoots ${ord.indexOf(s.id)===0?'first':'now'}: ships shoot from highest to lowest pilot skill (its skill is ${psOf(s)}). You may shoot <b>one</b> enemy inside your arc (the yellow wedge) at range 1-3; the valid targets are marked on the board. Range 1: +1 attack die. Range 3 or a rock in the way: +1 defence die.</p>`;
  else h+=`<p class="now-t">Pick a target${G.bonus?' (bonus attack, primary weapon only)':''}.</p>`;
  h+='<div class="acts col">'+opts.map(o=>`<button class="btn${o===best?' rec':''}" data-act="fire" data-w="${o.w.k}" data-t="${o.t.id}">${o===best?'★ ':''}🎯 Shoot ${nm(o.d)}${o.w.k!=='P'?' with '+esc(o.w.n):''}<small>range ${o.t.rg}${o.t.obstructed?' · a rock is in the way: +1 defence die':''} · you roll ${o.n} attack ${o.n===1?'die':'dice'}, it rolls ${o.m} defence · expected ≈${o.e.toFixed(1)} damage</small></button>`).join('');
  const cant=enemiesOf(s).filter(e=>!opts.some(o=>o.d===e));
  h+=`<button class="btn ghost" data-act="fire" data-w="skip">Hold fire<small>Skip this attack.</small></button></div>`;
  if(cant.length)h+=`<p class="small muted">Can't shoot: ${cant.map(e=>`${nm(e)} is ${whyNot(s,e)}`).join('; ')}.</p>`;
  return h}
const DLEG='<p class="dleg">✹ hit = 1 damage · ✸ crit = 1 damage + a damage card · ◉ focus = a hit (or evade) only if you spend a focus token · ✦ evade = cancels 1 hit · blank = nothing</p>';
function diceRows(A){const a=ship(A.a),d=ship(A.d);return `<div class="drow"><span class="dl">Attack dice · ${esc(shortName(a))} rolled ${A.dice.length}</span><div class="dice">${A.dice.map(f=>die(f,'atk')).join('')||'<i class="muted small">none</i>'}</div></div>`+
  (A.step==='dmod'?`<div class="drow"><span class="dl">Defence dice · ${esc(shortName(d))} rolled ${A.def.length}</span><div class="dice">${A.def.map(f=>die(f,'def')).join('')||'<i class="muted small">none</i>'}</div></div>`:'')}
function diceHead(A){const a=ship(A.a),d=ship(A.d);const def=G.phase==='dmod'||G.phase==='damod';const iDef=humanTurn()&&def&&mine(d)&&!mine(a);
  const title=iDef?`Combat · you are shot: ${esc(shortName(a))} → ${esc(shortName(d))}`:`Combat · ${esc(shortName(a))} attacks ${esc(shortName(d))}`;
  const g=guided();let t='';
  if(humanTurn()&&g){if(G.phase==='amod')t='Your attack dice are rolled. Spend a token to improve them, then press <b>Done</b>: the defender rolls next.';
    else if(G.phase==='dmod')t='The defence dice are rolled. Each ✦ evade cancels one hit. Spend a token to add evades, then press <b>Done</b> to take the damage that is left.';
    else if(G.phase==='damod')t='Before the attack is final, you may tamper with the attacker\'s dice.'}
  // cause before effect: why this shot is possible and what the range did to the dice
  const arcW=a.arc==='T'?'turret (it shoots all round)':a.arc==='A'?'front or rear arc':'front arc';
  const why=`<p class="small why">${iDef?'You are':esc(shortName(d))+' is'} in ${esc(shortName(a))}'s ${arcW} at range ${A.rg}${A.rg===1?': +1 attack die':A.rg===3?': +1 defence die':''}${A.obs?' · a rock is in the way: +1 defence die':''}.</p>`;
  return `<p class="head">${title}</p>${why}${stepList(['Choose a target',G.phase==='amod'?'Attack dice: modify':'Defence dice: modify','Result'],1)}${t?`<p class="now-t">${t}</p>`:''}`}
// the "nothing to do right now" box: who is acting and when it is your turn
function watchHTML(){const s=G.cur&&ship(G.cur);const st=G.step;let t='',sub='';
  if(G.phase==='plan')return `<p class="head">Planning · waiting for the other pilots</p><p class="now-t">They are setting their dials in secret.</p>`;
  if(s&&st===2){t=`Activation · ${esc(shortName(s))} (skill ${psOf(s)}) ${G.phase==='action'?'takes an action':'reveals and moves'}`;sub=s.rev&&s.moved?`It revealed <b>${mvWords(s.rev)}</b>.`:'It reveals its dial and moves.'}
  else if(s&&st===3){const A=G.atk;t=A?`Combat · ${esc(shortName(ship(A.a)))} attacks ${esc(shortName(ship(A.d)))}`:`Combat · ${esc(shortName(s))} (skill ${psOf(s)}) is choosing a target`}
  else t=G.phase==='combat'?'Combat…':G.phase==='activate'?'Activation…':G.phase==='end'?'End of the round…':'…';
  const ord=G.order||[];const next=ord.slice(G.oi+1).map(ship).find(x=>x&&x.alive&&mine(x));
  if(next&&(st===2||st===3))sub+=` ${sub?'':''}Your ${nm(next)} ${st===2?'moves':'shoots'} after ${ord.slice(G.oi,ord.indexOf(next.id)).length} more ship${ord.slice(G.oi,ord.indexOf(next.id)).length>1?'s':''}.`;
  if(G.atk&&st===3&&G.phase==='amod'){const A=G.atk;sub+=' '+diceRows(A)}
  if(guided())sub+=' <span class="muted">Nothing to do: watch the board until it is your turn.</span>';
  return `<p class="head">${t}</p><p class="now-t">${sub}</p>`}
// ---- the end-of-round summary (it shows at the start of the next round, before any dial is set) ----
// hull+shields of every ship at the first moment each round is seen, so the summary counts every point of damage (crit cards, asteroids, bombs), not only shots
function hpMark(){if(!G)return;flowSync();const H=UI.hpAt=UI.hpAt||{};if(H[G.round])return;H[G.round]={};for(const s of G.ships)H[G.round][s.id]=s.alive?s.hull-hullDmg(s)+s.sh:0}
function hpText(s){const h=Math.max(0,s.hull-hullDmg(s));return `${h}/${s.hull} hull${s.shMax?` · ${s.sh}/${s.shMax} shield${s.shMax===1?'':'s'}`:''}`}
// log lines of round R about damage that didn't come from a shot (newest-first log, between "Round R:" and the next round's line)
function roundHarm(R,side){const L=G.log;let a=L.findIndex(l=>l.s===-1&&l.t.startsWith(`Round ${R}:`));if(a<0)a=L.length;let b=L.findIndex(l=>l.s===-1&&l.t.startsWith(`Round ${R+1}:`));if(b<0)b=-1;
  return L.slice(b+1,a).filter(l=>l.s===side&&/asteroid: rolls|critical hit|cockpit fire|hull breach|secondary blast|is shaken|concussed|detonates|flies off|loses its|restores a shield|patches it up|repair/.test(l.t)).map(l=>l.t).reverse()}
function summaryHTML(){const R=G.round-1,me=soloSide()>=0?soloSide():planSide();const g=guided();
  const res=UI.results.filter(r=>r.r===R).reverse();const side=id=>{const s=ship(id);return s?s.side:-1};
  const dealt=res.filter(r=>side(r.a)===me).reduce((a,r)=>a+r.dmg,0);let taken=res.filter(r=>side(r.d)===me).reduce((a,r)=>a+r.dmg,0);hpMark();
  const H0=UI.hpAt&&UI.hpAt[R],H1=UI.hpAt&&UI.hpAt[R+1];if(H0&&H1){const lost=k=>G.ships.filter(s=>s.side===k&&H0[s.id]!=null&&H1[s.id]!=null).reduce((a,s)=>a+Math.max(0,H0[s.id]-H1[s.id]),0);taken=Math.max(taken,lost(me))}
  const my=G.ships.filter(s=>s.side===me);const stress=my.filter(s=>s.alive).reduce((a,s)=>a+s.stress,0);
  let h=`<p class="head">Round ${R} summary</p>`;
  if(g)h+=`<p class="now-t">That was one full round: <b>Planning</b> (secret dials) → <b>Activation</b> (move and act, lowest skill first) → <b>Combat</b> (shoot, highest skill first) → <b>End</b>. Every round works the same way.</p>`;
  h+=`<div class="sumgrid"><div><b>${dealt}</b><span>damage dealt</span></div><div class="${taken?'hurt':''}"><b>${taken}</b><span>damage taken</span></div><div class="${stress?'hurt':''}"><b>${stress}</b><span>stress on your ship${my.length>1?'s':''}</span></div></div>`;
  const ev=[];for(const r of res)ev.push('🎯 '+resultHTML(r,true));
  for(const n of (UI.notes[R]||[]))if(n.kind!=='red'||!(UI.notes[R]||[]).some(x=>x.id===n.id&&x.kind==='stressed'))ev.push((n.lost||n.kind==='noshot'?'⚠ ':'')+n.t);
  for(const t of roundHarm(R,me))ev.push((/restores|patches|repair/.test(t)?'✚ ':'💥 ')+esc(t));
  if(!res.length)ev.push('No shots were fired this round.');
  h+=`<h4>What happened</h4><ul class="sumlist">${ev.slice(0,8).map(x=>`<li>${x}</li>`).join('')}</ul>`;
  h+=`<h4>Your ship${my.length>1?'s':''} now</h4><ul class="sumlist">${my.map(s=>s.alive?`<li><b>${nm(s)}</b>: hull ${s.hull-hullDmg(s)}/${s.hull} · shields ${s.sh}/${s.shMax}${s.stress?` · <span class="warn">stress ${s.stress}</span>`:''}${s.dmg.filter(x=>x.up).map(x=>` · <span class="crit">${esc(DAMAGE[x.c].n)}: ${esc(critPlain(x.c,s))}</span>`).join('')}</li>`:`<li class="muted"><b>${nm(s)}</b>: destroyed</li>`).join('')}</ul>`;
  const tips=watchTips(me,R);if(tips.length)h+=`<h4>Watch next round</h4><ul class="sumlist tips">${tips.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  if(g)h+=`<p class="small muted">End phase: unused focus and evade tokens were removed. Target locks and stress stay.</p>`;
  return h+`<div class="acts main"><button class="btn primary" data-a="nextround">Continue to Round ${G.round} ▶<small>Planning: set your dial${my.filter(s=>s.alive).length>1?'s':''}</small></button></div>`}
function watchTips(me,R){const out=[];for(const s of alive().filter(x=>x.side===me)){const b=B(s);const en=enemiesOf(s);if(!en.length)continue;
    if(s.stress){out.push(`${nm(s)} is stressed: pick a <b>green</b> move to clear it. Red moves are blocked and it gets no action while stressed.`)}
    const mi=inArcOf(s),th=arcsOnMe(s);const near=en.map(e=>({e,rg:rangeOf(baseDist(s,b,e,B(e)))})).sort((a,c)=>a.rg-c.rg)[0];
    if(th.length&&!mi.length)out.push(`${nm(th[0].e)} has ${nm(s)} in its arc at range ${th[0].rg}: turn, or move out of that wedge.`);
    else if(mi.length)out.push(`${nm(mi[0].e)} is in ${nm(s)}'s arc at range ${mi[0].rg}: a short move can keep it there${th.length?' (but it can shoot back)':''}.`);
    else if(near.rg>=4)out.push(`The enemy is far away (range 4 or more): close in with a fast straight, or bank and let them come to you.`);
    const edge=Math.min(s.x,s.y,MAT-s.x,MAT-s.y);if(edge<RANGE*1.1)out.push(`${nm(s)} is close to the edge: a fast move could fly off the mat, which destroys the ship.`);
    if(s.dmg.some(x=>x.up&&DAMAGE[x.c].fix))out.push(`${nm(s)} can try to repair its damage card as its action.`)}
  if((UI.notes[R]||[]).some(n=>n.kind==='bump'&&mine(ship(n.id))))out.push('You bumped last round: pick a move whose ghost does not overlap another ship.');
  return out.slice(0,3)}
// ---- one render step for the new parts ----
function renderFlow(){flowSync();renderRoad();renderQueue();renderNotice();guideBtn();
  if(typeof GX!=='undefined'&&GX.app){GX.app.classList.toggle('na-sum',sumPending());GX.app.classList.toggle('na-dec',!!(G&&!G.winner&&!UI.info&&G.phase!=='plan'&&(humanTurn()||UI.hold)))}}
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!G||!UI.hold||humanTurn()||(e.target&&/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)))return;const b=document.querySelector('#prompt [data-a="hold"]');if(b){b.click();e.preventDefault()}});
// the recommended dice modification (the same reasoning as the advisor)
function recMod(){const A=G.atk;if(!A)return null;
  if(G.phase==='amod'){const ms=atkMods();const f=ms.find(m=>m.k==='focus'),tl=ms.find(m=>m.k==='tl');const fc=cnt(A.dice,'focus');if(tl&&cnt(A.dice,'blank')+(!f?fc:0)>0)return 'tl';if(f&&fc)return 'focus';return ms.length?null:'done'}
  if(G.phase==='dmod'){const r=preview(A);if(r.hits+r.crits===0)return 'done';const ms=defMods();for(const k of ['kael','focus','evade'])if(ms.some(m=>m.k===k))return k;return ms.length?null:'done'}return null}
