// PURPOSE: every Flight School drill and lesson mini stage is a real lesson: demo, three escalating rounds, 3 in a row, round counter, time on the clear card
// FLAG: schoolfull (?schoolfull=0)
// TEST: school-full-test.js
/* ---------- SCHOOL FULL (owner, 21 Oct 2026: "the flight school extra lessons last 5 seconds wtf is this"). Flag RET.schoolfull (default ON; ?schoolfull=0 =
   the old one-success drills and one-pass lessons). Every drill (school.js DR: tut steps, counter foes, gate, fan, on foot) and every lesson mini stage
   (lessons.js LSN) now runs as: DEMO (8 s: the drill's own targets and foes play out with a "WATCH" line, nothing counts), then ROUND 1/3 (slow: the world at
   60 % speed, hits forgiven), ROUND 2/3 (normal, a hit breaks the streak), ROUND 3/3 (faster plus the previous skill: an aimed fan to dodge in the fly
   drills, gap walls in the lesson sandbox, no hit allowed on foot). A drill round needs 3 successes in a row and lasts at least SF.RMIN seconds (after 3 in a
   row it says KEEP GOING until then); a lesson round is one clean run of all its phases (repeated until SF.RMIN). A fail (hit in rounds 2-3, or SF.REPMAX
   s without a success) repeats that round, never back to the list. Counter: coach bar "R2/3 · 1/3", lesson head "ROUND 2/3", a badge on foot. The clear
   card / line shows time and rounds. Saves only what school.js / lessons.js already save (mnr_school, mnr_lessons). Test: nightrun/school-full-test.js. */
if(RET.schoolfull===undefined)RET.schoolfull=!/[?&]schoolfull=0/.test(location.search);
const SF={DEMO:8,RMIN:12,NEED:3,REPMAX:25,LSMAX:60,log:[],last:null,get on(){return !!RET.schoolfull;}};
{const st=document.createElement('style');st.textContent=`#tutB.drl.sf .tn{display:block;flex:0 0 auto;font:700 13px var(--mono);color:#ffe14d;white-space:nowrap}
#sfBadge{position:fixed;z-index:9200;left:50%;top:calc(158px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:calc(100% - 32px);box-sizing:border-box;padding:6px 12px;border-radius:10px;
background:rgba(13,8,32,.86);border:2px solid #ffe14d;color:#fff;font:700 14px var(--mono);text-align:center;pointer-events:none}#sfBadge[hidden]{display:none}`;document.head.appendChild(st);}
const sfBadge=document.createElement('div');sfBadge.id='sfBadge';sfBadge.hidden=true;sfBadge.setAttribute('aria-live','polite');document.body.appendChild(sfBadge);
const sfGoal=(r,say)=>r===1?'SLOW: '+say:r===3?say+' + dodge':say;
/* ===== 1. tut-engine drills (one step in TUT.D): wrap the step ===== */
SF.wrap=(b,d)=>{const o={id:b.id,base:b,ph:'demo',r:0,k:0,T:0,rt:0,pt:0,gap:0,hp:0,fails:0,rounds:0,
  get free(){return b.free;},get foes(){return b.foes;},
  say(){return o.ph==='demo'?'WATCH: '+b.say():sfGoal(o.r,b.say());},
  init(){o.ph='demo';o.r=0;o.k=0;o.T=0;o.rt=0;o.pt=0;o.gap=0;o.fails=0;o.rounds=0;o.hp=P.hp;tutB.classList.add('sf');b.init();o.cnt();SF.last={id:d.id,kind:'tut',o};},
  tgt(){return o.gap>0?null:b.tgt?b.tgt():null;},
  beat(i){if(o.gap>0)return;if(b.beat)b.beat(i);if(o.r===3&&o.ph==='play'&&i%4===0&&!/^(dodge|fan)$/.test(b.id))o.over();},
  perfect(k){if(o.gap<=0&&b.perfect)b.perfect(k);},
  end(){if(b.end)b.end();tutB.classList.remove('sf');},
  cnt(){const n=$('tutN');if(!n)return;const t=o.ph==='demo'?'DEMO '+Math.max(0,Math.ceil(SF.DEMO-o.T)):'R'+o.r+'/3 · '+Math.min(o.k,SF.NEED)+'/'+SF.NEED;if(n.textContent!==t)n.textContent=t;},
  clear(){G.en=G.en.filter(e=>!e.tut);G.eb=G.eb.filter(x=>!x.tut);G.pk=G.pk.filter(p=>!p.tut);},
  rep(){o.clear();o.pt=0;b.init();if(b.id==='weapons'&&o.wDone){b.p=1;b.es=[.25,.4,.55,.7].map((f,i)=>tutEn('drone',{x:W+30+i*40,y:f*H,amp:0}));}   // the slot sheet once, then the fusion fights
   TUT.line(o.k>=SF.NEED?'KEEP GOING: '+b.say():sfGoal(o.r,b.say()));},
  round(r){o.r=r;o.k=0;o.rt=0;o.ph='play';o.gap=1.6;o.clear();TUT.line('ROUND '+r+'/3: '+sfGoal(r,b.say()));floater(P.x,P.y-56,'ROUND '+r+'/3','#ffe14d');AU.sfx('tier');},
  fail(why){o.fails++;o.k=0;o.rt=0;o.gap=1.4;o.clear();TUT.line(why);floater(P.x,P.y-50,'ROUND '+o.r+' AGAIN','#ff6a7a');SF.log.push({id:d.id,ev:'fail',r:o.r,why});},
  over(){const x=W-30,y=clamp(P.y+rnd(-50,50),50,H-60),a=Math.atan2(P.y-y,P.x-x);for(let k=-1;k<=1;k++)tutEb(x,y,a+k*.24,135);},
  tick(dt){o.T+=dt;if(TUT.t>5)return false;TUT.t=0;o.cnt();          // TUT.t > 5 = forced by the __school.late() hook: let the engine time out
    if(o.ph==='demo'){if(o.T>=SF.DEMO)o.round(1);return false;}
    if(o.gap>0){o.gap-=dt;if(o.gap<=0)o.rep();o.hp=P.hp;return false;}
    o.rt+=dt;o.pt+=dt;if(o.r===1)G.slow=Math.min(G.slow,.6);
    if(o.r>=2&&P.hp<o.hp){o.hp=P.hp;o.fail('HIT: round '+o.r+' again, 3 in a row');return false;}o.hp=P.hp;
    if(o.pt>SF.REPMAX){o.fail('Too slow: round '+o.r+' again');return false;}
    if(b.tick(dt)){o.k++;o.wDone=1;floater(P.x,P.y-50,o.k+' IN A ROW','#3dffb0');AU.sfx('perfect');SF.log.push({id:d.id,ev:'ok',r:o.r,k:o.k});
      if(o.k>=SF.NEED&&o.rt>=SF.RMIN){o.rounds++;if(o.r>=3){o.ph='done';TUT.t=+o.T.toFixed(1);SF.log.push({id:d.id,ev:'clear',t:o.T,rounds:o.rounds});return true;}o.round(o.r+1);}
      else o.gap=.9;}
    return false;}};
  return o;};
/* ===== 2. lesson mini stages (lessons.js sandbox) ===== */
const sfHead=m=>{const F=m.F,h=$('lsHead');if(!F||!h)return;h.textContent=m.L.n+' · '+(m.state==='demo'?'DEMO '+Math.max(0,Math.ceil(F.demo)):'ROUND '+F.r+'/3 · part '+(m.pi+1)+'/'+m.L.ph.length);};
function sfLsFail(m,why){const F=m.F;F.fails++;F.rt=0;SF.log.push({id:m.L.id,ev:'fail',r:F.r,why});lsPhase(0);lsLine(why,'bad');m.sayT=2.2;}
function sfGapWall(m){const n=12,g=1+Math.floor(Math.random()*(n-4));for(let i=0;i<n;i++)if(i<g||i>g+2)m.eb.push({x:m.w+10,y:m.h*(i+.5)/n,vx:-95,r:6,hz:1});}
{const s0=lsShow;lsShow=function(id){const r=s0.apply(this,arguments),m=LS.m;if(!r||!m||!SF.on)return r;
  m.F={r:0,T:0,rt:0,demo:SF.DEMO,fails:0,rounds:0,hz:0};m.state='demo';lsLine('WATCH: '+m.P.say);sfHead(m);SF.last={id,kind:'lesson',m};
  const f0=m.fail;m.fail=why=>{if(m.state)return;f0(why);if(m.F.r>=2&&/^hit/i.test(String(why)))sfLsFail(m,'HIT: round '+m.F.r+' again');};
  return r;};}
{const p0=lsPhase;lsPhase=function(i){const r=p0.apply(this,arguments),m=LS.m;if(m&&m.F&&m.F.r){lsLine(sfGoal(m.F.r,m.P.say));sfHead(m);}return r;};}
{const t0=lsTick;lsTick=function(m,dt){const F=m.F;if(!F||!SF.on||F.done)return t0(m,dt);F.T+=dt;
  if(m.state==='demo'){F.demo-=dt;const f=m.fo.find(x=>!x.dead);if(f)m.s.ty=f.y;t0(m,dt);sfHead(m);
    if(F.demo<=0){m.state='';F.r=1;F.rt=0;lsPhase(0);lsLine('ROUND 1/3: '+sfGoal(1,m.P.say),'ok');m.sayT=1.6;}return;}
  if(!m.state){F.rt+=dt;if(F.rt>SF.LSMAX){sfLsFail(m,'Too slow: round '+F.r+' again');return;}}
  t0(m,dt*(F.r===1?.6:F.r===3?1.2:1));
  if(F.r===3&&!m.state&&m.P.fly!==0&&!/^(c-wall|t-dash)$/.test(m.P.id)){F.hz-=dt;if(F.hz<=0){F.hz=3.2;sfGapWall(m);}}};}
{const c0=lsClear;lsClear=function(){const m=LS.m,F=m&&m.F;if(!F||!SF.on||F.done)return c0();
  if(F.rt<SF.RMIN){lsPhase(0);lsLine('KEEP GOING: '+m.P.say,'ok');m.sayT=1.6;return;}
  F.rounds++;SF.log.push({id:m.L.id,ev:'round',r:F.r});
  if(F.r<3){F.r++;F.rt=0;lsPhase(0);lsLine('ROUND '+F.r+'/3: '+sfGoal(F.r,m.P.say),'ok');m.sayT=1.6;return;}
  F.done=1;c0();const t=Math.round(F.T);SF.log.push({id:m.L.id,ev:'clear',t:F.T,rounds:F.rounds});
  lsLine('LESSON CLEAR · '+t+' s · 3/3 rounds','ok');const h=$('lsHead');if(h)h.textContent=m.L.n+' · CLEAR · '+t+' s';};}
/* ===== 3. the on-foot drill (school.js SCH.foot): kills in a row per round, a fall repeats the round ===== */
const ftT=()=>window.FOOT&&FOOT.S?FOOT.S.time||0:0,ftC=f=>f.F.acc+ftT();   // drill clock: on-foot game time, summed over restarts
SF.footStart=f=>{f.F={r:0,k:0,acc:-ftT(),rt0:0,hurts:0,fails:0,rounds:0};SF.last={id:f.d.id,kind:'foot',f};sfBadge.hidden=false;SF.footCnt(f);};
SF.footCnt=f=>{const F=f.F;if(!F)return;const t=ftC(f);
  if(!F.r&&t>=SF.DEMO){F.r=1;F.k=0;F.rt0=t;F.hurts=FOOT.S?FOOT.S.hurts|0:0;}
  sfBadge.textContent=!F.r?'WATCH: run right, tap to shoot · '+Math.max(0,Math.ceil(SF.DEMO-t)):'ROUND '+F.r+'/3 · '+Math.min(F.k,SF.NEED)+'/'+SF.NEED+' · '+(F.r===1?'shoot 3 foes':F.r===2?'3 foes in a row':'3 foes, no hit');};
SF.footKill=(f,end)=>{const F=f.F;if(!F||F.t)return;SF.footCnt(f);if(!F.r)return;const S=FOOT.S||{},h=S.hurts|0;
  if(F.r>=2&&h>F.hurts){F.hurts=h;F.k=0;F.rt0=ftC(f);F.fails++;SF.log.push({id:f.d.id,ev:'fail',r:F.r,why:'hit'});}
  F.k++;SF.log.push({id:f.d.id,ev:'ok',r:F.r,k:F.k});
  if(F.k>=SF.NEED&&ftC(f)-F.rt0>=SF.RMIN){F.rounds++;if(F.r>=3){F.t=ftC(f);SF.log.push({id:f.d.id,ev:'clear',t:F.t,rounds:F.rounds});sfBadge.hidden=true;setTimeout(()=>end(true),400);return;}
    F.r++;F.k=0;F.rt0=ftC(f);F.hurts=S.hurts|0;}
  SF.footCnt(f);};
setInterval(()=>{const f=SCH.foot;if(f&&f.F&&!f.end&&!f.F.t)SF.footCnt(f);else if(!sfBadge.hidden)sfBadge.hidden=true;},250);
SF.footDown=f=>{const F=f.F;if(!F||F.t)return false;F.k=0;F.fails++;F.acc+=ftT();SF.log.push({id:f.d.id,ev:'fail',r:F.r,why:'down'});
  setTimeout(()=>{if(SCH.foot!==f||f.end)return;let ok=false;try{FOOT.stop();ok=FOOT.start('street1');}catch(e){}
    if(!ok){SCH.footEndNow&&SCH.footEndNow(false);return;}F.acc-=ftT();F.rt0=ftC(f);F.hurts=0;SF.footCnt(f);},0);return true;};
if(RET.schoolfull){SCH.wrap=SF.wrap;SCH.sf=SF;}
window.__schoolfull={get on(){return SF.on;},get log(){return SF.log;},SF,
  get state(){const L=SF.last;if(!L)return null;if(L.kind==='tut'){const o=L.o;return{id:L.id,kind:'tut',ph:o.ph,r:o.r,k:o.k,T:o.T,rounds:o.rounds,fails:o.fails,gap:o.gap};}
    if(L.kind==='lesson'){const F=L.m.F;return{id:L.id,kind:'lesson',ph:L.m.state==='demo'?'demo':F.done?'done':'play',r:F.r,T:F.T,rounds:F.rounds,fails:F.fails,state:L.m.state,pid:L.m.P.id};}
    const F=L.f.F;return{id:L.id,kind:'foot',r:F.r,k:F.k,rounds:F.rounds,fails:F.fails,T:F.t||ftC(L.f),ph:F.t?'done':F.r?'play':'demo'};},
  // oracle hooks for the test bot: one real success of the current rep / lesson phase
  rep(){const L=SF.last;if(!L)return false;if(L.kind==='tut'){const b=L.o.base,t=b.tick;b.tick=function(){b.tick=t;return true;};return true;}
    if(L.kind==='lesson'){const m=L.m;if(m.state)return false;m.win('oracle');return true;}return false;},
  lsWin(){const m=LS.m;if(!m||m.state)return false;m.win('oracle');return true;},lsSim(){cancelAnimationFrame(LS.raf);LS.raf=0;},lsStep(dt){if(LS.m)lsTick(LS.m,dt);},lsFail(){const m=LS.m;if(m&&!m.state)m.fail('hit');},
  hit(){P.hp=Math.max(1,P.hp-1);}};
