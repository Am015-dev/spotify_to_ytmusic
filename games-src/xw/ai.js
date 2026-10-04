var AIW={off:2.6,def:.8,tough:.4};// planning weights (tuned with the gauntlet)
// ---------- computer pilots ----------
// Planning is simultaneous and dials are secret, so the AI never reads enemy dials: it samples plausible enemy
// maneuvers (a determinisation per sample, re-drawn each time) and scores each of its own maneuvers against them.
const LV={easy:{samples:3,noise:3.5,look:0},normal:{samples:6,noise:.6,look:0},hard:{samples:14,noise:0,look:1}};
// expected damage of an attack with n attack dice into m defense dice, optionally with focus on either side
function expDmg(n,m,af,df){const ah=n*(.5+(af?.25:0)),de=m*(.375+(df?.25:0));return Math.max(0,ah-de)+(ah>0?.08*n:0)}
function threatTo(att,atkPose,def,defPose){const r=arcReach(atkPose,B(att),defPose,B(def),att.arc);if(!r)return 0;const rg=rangeOf(r.d);if(rg>3)return 0;
  const n=att.atk+(rg===1?1:0),m=def.agi+(rg===3?1:0);return expDmg(n,m,true,true)}
function remaining(s){return s.hull-hullDmg(s)+s.sh}
// plausible maneuvers an enemy might fly: weighted toward white/green mid speeds, and away from edges
function enemyGuess(e,k){const d=dialOf(e).map((m,i)=>({m,i}));const w=d.map(o=>{let x=o.m.c==='r'?(e.stress?0:.35):o.m.c==='g'?1.3:1;x*=o.m.s===2||o.m.s===3?1.4:1;const p=finalPose(e,B(e),o.m);if(offBoard(p,B(e)))x*=.02;return x});
  const out=[];for(let j=0;j<k;j++){let r=rnd(1000)/1000*w.reduce((a,b)=>a+b,0);let pick=d[0];for(let i=0;i<d.length;i++){r-=w[i];if(r<=0){pick=d[i];break}}out.push(finalPose(e,B(e),pick.m))}return out}
function scorePose(s,p,m,enemyPoses,friends,lv){let sc=0;const b=B(s);
  if(offBoard(p,b))return -1000;
  if(G.rocks.some(o=>polyOverlap(corners(p,b),rockPoly(o))))sc-=9;
  else{const tp=tplPoints(s,b,m,6);if(G.rocks.some(o=>{const R=rockPoly(o);return tp.some(q=>polyPointDist(q,R)<=TPL_W/2)}))sc-=4.5}
  for(const f of friends)if(polyOverlap(corners(p,b),corners(f.p,B(f.s))))sc-=f.now?7:4;// wingmen still sitting where we'll end, or ending there first
  if(m.c==='r')sc-=s.stress?8:1.6;if(m.c==='g'&&s.stress)sc+=1.8;if(m.t==='K'&&!s.stress)sc+=.4;
  const ed=Math.min(p.x,p.y,MAT-p.x,MAT-p.y),lim=b/2+50;if(ed<lim)sc-=(lim-ed)/12;// big bases need more room from the edge
  let off=0,def=0,near=1e9;
  for(const [e,poses] of enemyPoses){let o=0,d=0;for(const ep of poses){o+=threatTo(s,p,e,ep)*(1+1.4/Math.max(1,remaining(e)));d+=threatTo(e,ep,s,p);near=Math.min(near,len(sub(ep,p)))}off+=o/poses.length;def+=d/poses.length}
  // reward shots, fear return fire less than we value our own; flanking (a shot with no return fire) is the ideal
  sc+=off*AIW.off-def*(AIW.def+(remaining(s)<=2?.8:0))*(1-AIW.tough*Math.min(1,remaining(s)/6));if(off>.3&&def<.15)sc+=1.2;
  if(near>330)sc-=(near-330)/60;
  if(lv.noise)sc+=(rnd(1000)/1000-.5)*lv.noise*2;return sc}
function aiPlan(k){const lv=LV[G.players[k].lvl]||LV.normal;const mine=alive().filter(s=>s.side===k).sort((a,b)=>psOf(a)-psOf(b));
  const enemyPoses=enemiesOf(mine[0]||{side:k}).map(e=>[e,enemyGuess(e,lv.samples)]);const friends=[];
  for(const s of mine){const opts=dialOf(s).map((m,i)=>({m,i,p:finalPose(s,B(s),m)}));let best=null,bv=-1e9;
    // wingmen that move after this ship are still at their start positions when it arrives
    const avoid=friends.concat(mine.filter(f=>f!==s&&f.dial==null&&psOf(f)>=psOf(s)).map(f=>({s:f,p:{x:f.x,y:f.y,h:f.h},now:true})));
    for(const o of opts){let v=scorePose(s,o.p,exColor(s,o.m),enemyPoses,avoid,lv);
      if(lv.look&&v>-500){// hard: also look one round further ahead: can this pose still reach a shot next round?
        let nx=-1e9;for(const m2 of dialOf(s)){if(exColor(s,m2).c==='r'&&(s.stress||exColor(s,o.m).c==='r'))continue;const p2=finalPose(o.p,B(s),m2);if(offBoard(p2,B(s)))continue;let t=0;for(const [e,ps] of enemyPoses)t+=threatTo(s,p2,e,ps[0]);nx=Math.max(nx,t)}v+=Math.max(0,nx)*.7}
      if(v>bv){bv=v;best=o}}
    s.dial=best.i;friends.push({s,p:best.p})}}
// an opponent choosing a non-red maneuver for a stressed ship picks the one that is worst for it
function aiPickForcedWhite(s,wh){const enemyPoses=enemiesOf(s).map(e=>[e,[{x:e.x,y:e.y,h:e.h}]]);let worst=wh[0],wv=1e9;
  for(const o of wh){const v=scorePose(s,finalPose(s,B(s),o.x),exColor(s,o.x),enemyPoses,[],{noise:0});if(v<wv){wv=v;worst=o}}return worst}
// where an enemy will be: its revealed spotter-read dial if it has not moved yet, else where it is
function aiPose(side,e){if(!e.moved){const sp=alive().find(o=>o.side===side&&o.flags.peek&&o.flags.peek.id===e.id);if(sp)return finalPose(e,B(e),dialOf(e)[sp.flags.peek.m])}return {x:e.x,y:e.y,h:e.h}}
// the action-step choice; acts restricts it (free actions), otherwise every legal action
function aiAction(s,acts){acts=acts||actionsFor(s);if(!acts.length)return ['skip'];const lv=LV[G.players[s.side].lvl]||LV.normal;
  if(lv===LV.easy&&rnd(3)===0){const a=acts[rnd(acts.length)];return [a.a,a.targets?a.targets[0]:a.opts?0:undefined]}
  const here={x:s.x,y:s.y,h:s.h};const EP=e=>aiPose(s.side,e);const shots=enemiesOf(s).filter(e=>{const r=arcReach(s,B(s),EP(e),B(e),s.arc);return r&&rangeOf(r.d)<=3});
  const threats=enemiesOf(s).filter(e=>threatTo(e,EP(e),s,here)>0);
  // a barrel roll or boost that turns no-shot into a shot, or dodges out of danger
  const moveActs=acts.filter(a=>a.a==='BR'||a.a==='BO'||a.a==='EH'||a.a==='DD').map(a=>a.a==='DD'?Object.assign({},a,{opts:a.opts.map(o=>({p:finalPose(s,B(s),o.m)}))}):a);let bestMove=null,bm=0;
  const base=enemiesOf(s).reduce((t,e)=>t+threatTo(s,here,e,EP(e))*2-threatTo(e,EP(e),s,here)*1.5,0);
  for(const a of moveActs)a.opts.forEach((o,i)=>{const p=o.p;let gain=0;for(const e of enemiesOf(s)){gain+=threatTo(s,p,e,EP(e))*2-threatTo(e,EP(e),s,p)*1.5}
    const pen=a.a==='DD'?(onBar(s,'BO')?.6:1.6):(a.a==='EH'&&!onBar(s,'BR')?.6:0);if(gain-base-pen>bm+.3){bm=gain-base-pen;bestMove=[a.a,i]}});
  if(bestMove&&(!shots.length||bm>1.2))return bestMove;
  const has=k=>acts.find(a=>a.a===k);
  const special=acts.find(a=>['PA','EX','SL'].includes(a.a));if(special&&special.a==='EX'&&shots.length)return ['EX'];if(special&&special.a==='SL')return ['SL',special.targets[0]];if(special&&special.a==='PA'&&!shots.length)return ['PA'];
  if(acts.find(a=>a.a==='PM')&&enemiesOf(s).some(e=>within(e,s,2)))return ['PM'];
  const sab=acts.find(a=>a.a==='SB');if(sab&&!shots.length)return ['SB',sab.targets[0]];
  if(shots.length&&has('MK')&&(!threats.length||!has('F')))return ['MK'];// deadshot beats focus when nothing shoots back
  if(threats.length&&!shots.length&&has('JK'))return ['JK'];
  if(shots.length&&has('F'))return ['F'];
  if(has('TL')){const w=s.ups.some(u=>UPGRADES[u.id]&&UPGRADES[u.id].wpn&&UPGRADES[u.id].wpn.need==='TL'&&!u.gone);const t=has('TL').targets.map(ship).sort((a,b)=>remaining(a)-remaining(b));if(w||(!shots.length&&!threats.length))return ['TL',t[0].id]}
  if(threats.length&&has('E'))return ['E'];if(has('F'))return ['F'];if(has('E'))return ['E'];if(has('TL'))return ['TL',has('TL').targets[0]];
  const other=acts.find(a=>!['BR','BO','EH','DD','PM','SB','PA','EX'].includes(a.a)&&!a.targets&&!a.opts);if(other)return [other.a];return ['skip']}
// a free action someone offers this ship; null declines
function aiFree(s,acts,why){if(why==='tarn'){// after attacking: only move if it gets clearly safer or lines up a better position
    const here={x:s.x,y:s.y,h:s.h};const v=p=>enemiesOf(s).reduce((t,e)=>t-threatTo(e,e,s,p),0);let best=null,bv=v(here)+.2;
    for(const a of acts)(a.opts||[]).forEach((o,i)=>{const x=v(o.p);if(x>bv){bv=x;best=[a.a,i]}});return best}
  const c=aiAction(s,acts);return c[0]==='skip'?null:c}
// which friend gets something: prefer one that has a shot and hasn't fired, then one without focus
function aiPickFriend(fr){const sc=o=>(enemiesOf(o).some(e=>{const r=arcReach(o,B(o),e,B(e),o.arc);return r&&rangeOf(r.d)<=3})?2:0)+(o.fired?0:1)+(o.focus?0:1)+(o.stress?-5:0);return fr.slice().sort((a,b)=>sc(b)-sc(a))[0]||null}
function aiPickFocus(fr){return aiPickFriend(fr)}
function aiPickPS(fr){if(!fr.length)return null;const shot=o=>enemiesOf(o).some(e=>{const r=arcReach(o,B(o),e,B(e),o.arc);return r&&rangeOf(r.d)<=3});return fr.slice().sort((a,b)=>(shot(b)-shot(a))||(psOf(a)-psOf(b)))[0]}
function aiLockPick(f,ts){const t=ts.map(ship);const inArc=o=>{const r=arcReach(f,B(f),o,B(o),f.arc);return r&&rangeOf(r.d)<=3};return t.sort((a,b)=>(inArc(b)-inArc(a))||(remaining(a)-remaining(b)))[0]}
function aiJan(j,s,d){return j.alive&&!j.stress}// an extra attack die is worth her stress token
function aiOrrin(y,s){return y.stress===0}// take a friend's stress only while unstressed
function aiBrakk(d,c,faceup){const D=DAMAGE[c];if(hullDmg(d)+(faceup&&D.k==='direct'?2:1)>=d.hull)return true;return faceup&&critRank(c)>=2}// save it for a nasty crit or a killing blow
function critRank(c){return ({direct:5,cockpit:4,blinded:3,weak:3,engine:2,frame:2,fire:2,noact:2,wounded:2,breach:2,stunned:1}[DAMAGE[c].k]||1)}
function aiMaarek(three){let b=0;three.forEach((c,i)=>{if(critRank(c)>critRank(three[b]))b=i});return b}
// dice the computer rerolls: blanks, and focus results it can't turn into anything
function aiRerollAtk(s,pool,max){const A=G.atk,d=ship(A.d);const canF=(s.focus>0&&!pilotHas(d,'hex'))||(s.flags.dead&&!A.used.includes('dead'));
  const bad=i=>A.dice[i]==='blank'||(A.dice[i]==='focus'&&!canF);return pool.filter(bad).sort((a,b)=>(A.dice[a]==='blank'?0:1)-(A.dice[b]==='blank'?0:1)).slice(0,max)}
function aiRerollDef(d,pool){const A=G.atk;const b=pool.find(i=>A.def[i]==='blank');if(b!=null)return [b];const f=pool.find(i=>A.def[i]==='focus');if(f!=null&&!d.focus)return [f];return []}
function aiSlipDie(pool){const A=G.atk;const c=pool.find(i=>A.dice[i]==='crit');if(c!=null)return [c];const h=pool.find(i=>A.dice[i]==='hit');return [h!=null?h:pool[0]]}
function aiTarget(s){const ws=weaponsFor(s);if(!ws.length)return ['skip'];let best=null,bv=0;
  for(const w of ws)for(const t of w.targets){const d=ship(t.id);const sd=shotDice(s,w,t,d);
    let v=expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)+(d.evade?-.5:0);if(v>=remaining(d))v+=3;v*=1+d.cost/60;if(w.k!=='P')v-=.4;// keep one-shot weapons for good shots
    if(v>bv){bv=v;best=[w.k,t.id]}}
  return best||['skip']}
function aiAmod(){const A=G.atk,s=ship(A.a);const mods=atkMods();const has=k=>mods.find(m=>m.k===k);
  for(const k of ['horace','wailer','joren','krell','iveth'])if(has(k)&&aiRerollAtk(s,rerollPool(k),REROLL_MAX[k]).length)return k;
  if(has('jax')&&cnt(A.dice,'hit')+cnt(A.dice,'crit')<A.dice.length/3)return 'jax';
  if(has('tl')&&aiRerollAtk(s,rerollPool('tl'),99).length)return 'tl';
  for(const k of ['gutter','hired','b2h','b2f','rook','f2c','dead'])if(has(k))return k;
  if(has('focus'))return 'focus';return 'done'}
function aiDmod(){const A=G.atk,d=ship(A.d);const mods=defMods();const r=preview(A);if(r.hits+r.crits===0)return 'done';
  for(const k of ['instr','ibtd'])if(mods.find(m=>m.k===k)&&aiRerollDef(d,defPool(k)).length)return k;if(mods.find(m=>m.k==='kael'))return 'kael';
  const incoming=r.hits+r.crits;
  if(mods.find(m=>m.k==='focus')&&(d.fired||incoming>=1))return 'focus';if(mods.find(m=>m.k==='evade'))return 'evade';return 'done'}
function aiStep(){if(!G||G.winner||UI.paused)return;if(typeof NET!=='undefined'&&NET.on&&NET.role==='client')return;const k=sideToAct();if(k<0||isHuman(k))return;
  if(G.phase==='plan'){aiPlan(k);if([0,1].every(planDone))beginActivation();else refresh();return}
  const s=ship(G.cur);
  if(G.phase==='action'){const [a,arg]=aiAction(s);if(!doAction(s,a,arg))doAction(s,'skip')}
  else if(G.phase==='target'){const [w,t]=aiTarget(s);declare(s,w,t)}
  else if(G.phase==='amod'){const k2=aiAmod();if(k2==='done')atkDone();else applyAtkMod(k2)}
  else if(G.phase==='dmod'){const k2=aiDmod();if(k2==='done')defDone();else applyDefMod(k2)}
  else if(G.phase==='damod'){const ms=exDAMods();const A=G.atk;const m=ms.find(m=>m.k==='jam')||ms.find(m=>m.k==='slip'&&cnt(A.dice,'crit')+cnt(A.dice,'hit')>=2);if(m)applyDAMod(m.k);else damodDone()}
  else if(G.phase==='ask'){resolveAsk(G.q.opts[G.q.opts.length-1].k)}}
function schedule(){if(!G||G.winner||UI.pending||UI.paused)return;const k=sideToAct();if(k<0||isHuman(k))return;UI.pending=true;
  setTimeout(()=>{UI.pending=false;aiStep()},ANIM?(G.phase==='amod'||G.phase==='dmod'?AIDELAY*.7:AIDELAY):0)}
