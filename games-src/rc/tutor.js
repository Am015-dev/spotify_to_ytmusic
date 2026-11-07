// ===================== the tutorial (Chapter 0, shell/gx-tutor.js): a staged two-day game that teaches every rule by doing it once =====================
// The staged game is Marooned with a Carpenter and a Cook (+ Friday), fixed seed and decks (tutDeal, called by newGame), never saved (refresh skips G.tut).
// Day 1: explore, dice or sure, arrange the camp, night without a shelter (wounds). Day 2: event card and threat, fog, build the shelter, gather food,
// weather and a skill, the end. Each step spotlights ONE thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act).
// The scenes of the day play by themselves, except the ones a step explains: tutClaimed() keeps those on screen until the step's Next.
const TUT_GAME='shipwreck-isle',TUT_SEED=7,TUT_FOG=6;
const TUT_KEEP={};
const tutOn=()=>false;   // the spotlight tutorial is gone; the coached game (below) replaced it
// the staged deal: called by newGame before the first scene. Day 1 has no event card; day 2 turns over Chill Rain (a rain cloud and a threat).
function tutDeal(){G.tut=1;G.res.food=1;G.tileDeck=[4,10,6,1,3,2,5,7,9,11];G.ev.threat=[null,null];G.ev.deck=['chillrain'].concat(G.ev.deck.filter(k=>k!=='chillrain'))}
// ---------------------------------------------------------------- the staged game starts and stops
function tutBegin(){try{GX.close()}catch(e){}try{closeMenu()}catch(e){}
  TUT_KEEP.auto=UI.auto;TUT_KEEP.ghost=BF.ghostDone;UI.auto=false;UI.pause=false;BF.ghostDone=true;
  UI.modal=null;UI.report=null;UI.overSeen=false;UI.sel=null;UI.tileSel=null;UI.fx.length=0;UI.fxSeen=0;UI.cmpDone=false;UI.cmpDef=null;UI.guide={on:false,seen:{}};
  const m=document.getElementById('modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}
  resetPlanSteps();const keep=DEFSEED;DEFSEED=TUT_SEED;
  try{newGame({scen:'marooned',chars:['carpenter','cook'],humans:[true,true],mode:'solo',friday:true,dog:false,items:0,diff:'easy',noIntro:true,tutorial:true})}finally{DEFSEED=keep}
  UI.reportMark=G.logN;V3.layout=null;for(const k in V3.tiles){V3.scene&&V3.scene.remove(V3.tiles[k].g)}V3.tiles={};refresh()}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave(){clearTimeout(BF.autoT);BF.autoT=null;try{BF.cardClear()}catch(e){}try{GXH.hide()}catch(e){}
  if(TUT_KEEP.auto!=null)UI.auto=TUT_KEEP.auto;if(TUT_KEEP.ghost!=null)BF.ghostDone=TUT_KEEP.ghost;TUT_KEEP.auto=TUT_KEEP.ghost=null;
  try{PHO.closePop(true)}catch(e){}
  G=null;UI.beats.length=0;UI.shown=-1;UI.sel=null;UI.tileSel=null;V3.layout=null;for(const k in V3.tiles){V3.scene&&V3.scene.remove(V3.tiles[k].g)}V3.tiles={};try{render()}catch(e){console.error(e)}}

// ---------------------------------------------------------------- COACHED FIRST GAME (flag ?coach=1, off by default; owner 7 Nov addendum 4)
// A real game from turn 1 (all legal moves free; stacked seed and deck only make the cases come up). The Cook speaks just in time: one bubble at a time,
// never blocks input, dismissible. Each rule is explained the first time it matters; the rest go on a "Things you'll meet later" card. No forced taps.
const COACH={timer:0,done:{},cur:null,later:0,pro:false,forced:{},finished:false};
window.GXCOACH={get running(){return !!(G&&G.coach)},get explained(){return Object.keys(COACH.done).filter(k=>k!=='later')},get done(){return !!COACH.finished}};
const cbeat=()=>{try{if(!G||PHO.st!=='story')return null;const i=storyIdx();return i>=0?UI.beats[i]:null}catch(e){return null}};
const cplan=()=>!!(G&&(PHO.st==='plan'||PHO.st==='plan2')&&!PHO.pop&&!UI.modal);
const cact=t=>{try{return G.plan.acts.find(a=>a.pw.length&&a.type===t)}catch(e){return null}};
const ccard=k=>{try{return CARD[k].n}catch(e){return 'the card'}};
const cwx=()=>{try{return (viewState()||G).lastWx||{}}catch(e){return {}}};
// kind: 'rule' (first time it matters), 'move' (a good or poor choice, one line why), 'rival' (what the island just did to us)
const COACH_RULES=[
 {id:'goal',when:()=>cplan()&&G.round===1,say:"Our ship is gone. Light a fire and stack 15 wood by day 12: a ship will see it. Pick a pawn, then a glowing place."},
 {id:'pawns',when:()=>cplan()&&G.round===1&&G.plan.acts.some(a=>a.pw.length),say:"Each pawn does one job. I cook and heal, the Carpenter builds, Friday helps."},
 {id:'dice',when:()=>cplan()&&!!G.plan.acts.find(a=>a.pw.length===1&&actNeed(a).roll),say:"One pawn alone rolls dice and can fail or get hurt. A second pawn makes it sure."},
 {id:'sure',kind:'move',when:()=>cplan()&&!!G.plan.acts.find(a=>a.pw.length>=2),say:"Good move: two pawns, no dice. A sure thing."},
 {id:'explore',when:()=>cplan()&&!!cact('explore'),say:"Exploring finds new land; we can gather there from tomorrow."},
 {id:'build',when:()=>cplan()&&!!cact('build'),say:"Building costs wood. A shelter costs 2 wood and ends night wounds."},
 {id:'gather',when:()=>cplan()&&!!cact('gather'),say:"Food and wood arrive after all the jobs are done, not before."},
 {id:'camp',when:()=>cplan()&&!!cact('camp'),say:"Tidying the camp earns determination ✊ for skills and lifts morale."},
 {id:'ready',kind:'move',when:()=>cplan()&&G.plan.acts.some(a=>a.pw.length)&&(()=>{try{return planProblems().length===0}catch(e){return false}})(),say:"Good plan: everyone has a job. Tap Start day when you are ready."},
 {id:'noshelter',kind:'move',when:()=>cplan()&&G.round>=2&&!hasShelter()&&!cact('build'),say:"Poor move: no shelter and no build planned. Tonight everyone takes a wound."},
 {id:'nofood',kind:'move',when:()=>cplan()&&G.round>=2&&food()<eatersNeed()&&!cact('gather')&&!cact('hunt'),say:"Poor move: food is short for tonight and nobody gathers. Hunger costs 2 wounds."},
 {id:'prod',when:()=>{const b=cbeat();return b&&b.kind==='prod'},say:"Each morning the camp's sources give 1 food or 1 wood."},
 {id:'event',kind:'rival',when:()=>{const b=cbeat();return b&&b.kind==='event'},say:()=>{const b=cbeat();return 'The island moves: “'+ccard(b&&b.data&&b.data.card)+'”. Its effect happens now, then it waits as a threat.'}},
 {id:'threat',kind:'rival',when:()=>{const b=cbeat();return b&&b.kind==='threat'||cplan()&&G.ev&&G.ev.threat&&G.ev.threat.some(Boolean)},say:"A threat sits at camp. Deal with it in time, or the card strikes."},
 {id:'morning',when:()=>{const b=cbeat();return b&&b.kind==='morning'},say:"Morale moves our determination each morning. Low morale costs wounds."},
 {id:'found',when:()=>{const b=cbeat();return b&&b.kind==='finds'},say:"The day's haul reaches camp. New land is now ours to use."},
 {id:'fight',when:()=>{const b=cbeat();return b&&(b.kind==='fight'||b.kind==='adventure'||b.kind==='mystery')},say:"Adventures, mysteries and beasts are risky: weapons and dice decide."},
 {id:'weather',kind:'rival',when:()=>{const b=cbeat();return b&&b.kind==='weather'},say:()=>{const w=cwx(),n=(w.rain||0)+(w.snow||0);return (n?'The weather brings '+n+' cloud'+(n>1?'s':'')+'. ':'The sky is calm. ')+'Clouds above our roof (level '+G.camp.roof+') ruin 1 food and 1 wood each.'}},
 {id:'night',when:()=>{const b=cbeat();return b&&b.kind==='night'},say:"Night: everyone eats 1 food (or takes 2 wounds). No shelter means a wound each."},
 {id:'wounds',when:()=>{const b=cbeat();return b&&b.kind==='daysum'},say:"Each wound costs a life ♥. Resting heals one. Build a shelter soon."},
 {id:'skill',when:()=>cplan()&&G.round>=2&&G.chars.some(c=>!c.npc&&c.det>=2),say:"We have determination ✊. Open the Camp tab and use a skill: once per round, and it can turn a bad roll."},
 {id:'fog',when:()=>cplan()&&G.map.some(m=>m.fog),say:"Fog hides a place: work there needs one more pawn, and a fogged camp makes nothing."}
];
const COACH_LATER=[
 ["Hunting","Hunt beasts for food and fur; your weapon level decides the fight."],["Resting","A rest job heals 1 wound."],
 ["Distance","Places two tiles from camp need one extra pawn."],["Items and inventions","Build inventions for lasting help; some become items."],
 ["Snow and storms","Winter clouds cost wood; a storm hits last."],["Healing at night","Pot, fire and rum can heal before sleep."],
 ["Moving camp","Move camp at night; it halves your roof and palisade."],["Other scenarios","Hexed Isle, Stranded Friend and Settlers add their own goals."]];
const TUT_KEY='gxt-'+TUT_GAME;
const coachMark=p=>{try{const o=JSON.parse(localStorage.getItem(TUT_KEY)||'{}');Object.assign(o,p);localStorage.setItem(TUT_KEY,JSON.stringify(o))}catch(e){}};
function coachEl(){let e=document.getElementById('coachb');if(!e){e=document.createElement('div');e.id='coachb';e.className='coachb';e.setAttribute('role','status');document.body.appendChild(e);
  e.addEventListener('click',ev=>{const b=ev.target.closest('[data-coach]');if(!b)return;const k=b.dataset.coach;if(k==='x')coachHide();else coachFinish(k)})}return e}
function coachSkipEl(){let e=document.getElementById('coachskip');if(!e){e=document.createElement('button');e.id='coachskip';e.className='coachskip';e.type='button';e.textContent='Skip tutorial';e.setAttribute('aria-label','Skip the tutorial and leave this game');document.body.appendChild(e);
  e.addEventListener('click',()=>coachFinish('skip'))}return e}
function coachHide(){const e=document.getElementById('coachb');if(e)e.hidden=true;COACH.cur=null}
function coachShow(id,say,kind){const e=coachEl();COACH.cur=id;COACH.shownAt=Date.now();e.hidden=false;e.dataset.rule=id;e.dataset.kind=kind||'rule';e.innerHTML='<b class="cn">Cook</b><span class="ct"></span><button type="button" data-coach="x" aria-label="Dismiss">✕</button>';e.querySelector('.ct').textContent=say}
// the end of the coached game: the final scoring walked through rule by rule with the player's real numbers, then what comes later
function coachFinal(){COACH.finished=true;const over=!!G.over,w=!!(G.over&&G.over.win);const alive=G.chars.filter(c=>!c.npc&&!c.dead).length,tot=G.chars.filter(c=>!c.npc).length;
  const fire=has('fire'),pile=(G.sc&&G.sc.pile)||0;
  const walk=[['Goal: fire',fire?'✓ lit':'✗ not lit'],['Goal: wood pile',pile+' of 15'],['Rescue window','days 10 to 12 (you ended on day '+G.round+')'],['Everyone alive',alive+' of '+tot+(alive<tot?': a death loses':'')],['Shelter',hasShelter()?'built (no night wounds)':'none (a wound each night)'],['Roof and palisade',G.camp.roof+' and '+G.camp.pal],['Food and wood left',food()+' and '+G.res.wood]];
  const e=coachEl();COACH.cur='later';e.hidden=false;e.dataset.rule='later';e.dataset.kind='final';
  const btns=(COACH.pro?'<button type="button" class="cb" data-coach="chapter">Start chapter 1</button>':(over?'':'<button type="button" class="cb" data-coach="keep">Keep playing</button>')+'<button type="button" class="cb" data-coach="play">Play a real game</button><button type="button" class="cb" data-coach="story">Story</button>');
  e.innerHTML='<b class="cn">Cook: '+(over?(w?'rescued!':'we did not make it'):'you have the hang of it')+'</b><span class="ct">'+(over?'Here is how it scored, rule by rule:':'Here is how the goal stands, rule by rule:')+'</span><ul class="walk">'+walk.map(x=>'<li><b>'+x[0]+':</b> '+x[1]+'</li>').join('')+'</ul><span class="ct">Things you’ll meet later:</span><ul>'+COACH_LATER.map(x=>'<li><b>'+x[0]+'.</b> '+x[1]+'</li>').join('')+'</ul><div class="cbs">'+btns+'</div>';
  coachMark({done:1,open:0,step:0})}
function coachFinish(k){if(k==='keep'){coachStop();try{delete G.tut;delete G.coach;refresh()}catch(e){}return}coachStop();const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  if(k==='skip')coachMark({skipped:1,open:0});
  tutLeave();
  if(k==='chapter'&&first&&typeof GXC!=='undefined')GXC.play(first.id);
  else if(k==='story'&&typeof GXC!=='undefined')campOpen();
  else{openStart();if(k==='skip'&&COACH.pro&&typeof GXC!=='undefined')campOpen()}}
function coachTick(){try{
  if(!G||!G.coach){coachStop();return}
  if(G.over){if(!COACH.done.later){COACH.done.later=1;coachFinal()}return}
  // make the situations come up once: fog on a place and determination for a skill, from day 2
  if(cplan()&&G.round>=2){if(!COACH.forced.fog&&!G.map.some(m=>m.fog)){COACH.forced.fog=1;try{G.map[TUT_FOG].fog=1;refresh()}catch(e){}}
    if(!COACH.forced.det){COACH.forced.det=1;for(const c of G.chars)if(!c.npc)c.det=Math.max(c.det||0,3);try{refresh()}catch(e){}}}
  if(!COACH.done.later&&cplan()&&G.round>=4&&Object.keys(COACH.done).length>=14){COACH.done.later=1;coachFinal();return}
  if(COACH.cur&&Date.now()-COACH.shownAt>9000)coachHide();
  if(COACH.cur)return;
  for(const r of COACH_RULES){if(COACH.done[r.id])continue;let ok=false;try{ok=!!r.when()}catch(e){}if(ok){COACH.done[r.id]=1;let t=r.say;try{if(typeof t==='function')t=t()}catch(e){t=''}if(t){coachShow(r.id,t,r.kind);return}}}
 }catch(e){console.error(e)}}
function coachStop(){clearInterval(COACH.timer);COACH.timer=0;coachHide();const k=document.getElementById('coachskip');if(k)k.remove()}
function coachStart(){COACH.finished=false;COACH.done={};COACH.cur=null;COACH.later=0;COACH.forced={};tutBegin();G.coach=1;coachMark({open:1,done:0,skipped:0});coachSkipEl();clearInterval(COACH.timer);COACH.timer=setInterval(coachTick,600);coachTick()}
window.COACHX={rules:COACH_RULES.map(r=>r.id),done:()=>Object.keys(COACH.done),state:COACH};

function tutStart(o){COACH.pro=!!(o&&o.prologue);coachStart()}
// ---------------------------------------------------------------- menus: the title, the in-game menu, the chapter list, the first Play and the first Story tap
const tutFirst=()=>{try{return typeof GXT!=='undefined'&&!GXT.status(TUT_GAME).seen&&!localStorage.getItem(SAVE)&&!localStorage.getItem('swi_ghost')&&!localStorage.getItem('swi_tutoffer')}catch(e){return false}};
function tutBlock(pos){if(typeof GXT==='undefined')return '';const f=tutFirst();
  if(pos==='top')return f?'<div class="mb guided">'+GXT.menuHTML({game:TUT_GAME,first:true,cls:'btn go big',launch:tutStart})+'</div>':'';
  return f?'':'<div class="mb">'+GXT.menuHTML({game:TUT_GAME,first:false,cls:'btn',launch:tutStart})+'</div>'}
function tutFillMenu(){const e=document.getElementById('tutset');if(e&&typeof GXT!=='undefined')e.innerHTML=GXT.menuHTML({game:TUT_GAME,first:false,cls:'gx-ibtn',launch:tutStart})}
{const o=toggleMenu;toggleMenu=function(){try{tutFillMenu()}catch(e){}return o.apply(this,arguments)}}
function tutHeadButtons(){const b=document.createElement('button');b.type='button';b.className='gxc-ib';b.textContent='Tutorial';b.setAttribute('aria-label','Replay the tutorial');
  b.addEventListener('click',()=>{GXC.close();tutStart()});return [b]}
// Story: the tutorial runs first (Chapter 0) until it has been finished once
function tutStoryGate(){if(typeof GXT==='undefined'||GXT.isDone(TUT_GAME))return false;tutStart({prologue:true});return true}
// a first-time player tapping Play is offered the tutorial once
function tutOffer(){if(!tutFirst()||document.querySelector('.tutoffer'))return false;
  const d=document.createElement('div');d.className='gxt-end tutoffer';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in 5 minutes, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-tutoffer="play">Play anyway</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tutoffer]');if(!b)return;e.stopPropagation();d.remove();
    try{localStorage.setItem('swi_tutoffer','1')}catch(err){}
    if(b.dataset.tutoffer==='learn')tutStart();else{UI.guide.on=false;UI.cmpDef=null;beginGame()}});
  return true}
