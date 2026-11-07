// ===================== tutorial (shell/gx-tutor.js): a staged one-battle game that teaches every rule by doing it once =====================
// RULES CHECKLIST (from the rules drawer, RULES_HTML in data.js, and rules-notes.md). Each line names the step that teaches it.
//  goal: destroy every enemy ship ........................................ goal, win
//  plan: secretly pick a maneuver on the dial (speed, direction) ......... ship, dial
//  colours: green easy, white normal, red hard = stress token ............ marks, stress
//  asteroids: a path through one hurts and skips the action ............. marks
//  reveal: all dials stay hidden until Fly ............................... fly
//  activation order: lowest pilot skill moves first ...................... order
//  actions: focus, evade, target lock, barrel roll, boost (one a turn) .. action, lock, locktgt
//  stress: no actions, no red moves until a green one ................... stress
//  combat order: highest pilot skill shoots first ........................ order
//  firing arc and range 1-3, target choice ............................... shoot
//  attack dice (hit, crit, focus, blank) and range bonuses .............. shoot, dice
//  focus token: focus results become hits ................................ usefocus
//  defence dice (evade, focus, blank), evade cancels hits ................ res1
//  evade token (the enemy spends one) ..................................... res1
//  pilot ability (Kael: a focus result becomes an evade) ................. defend
//  shields first, then hull; damage cards; crits face up ................. res2, torp
//  target lock and the torpedo (range 2-3, spends the lock) ............. lock, locktgt, torp
//  end of round: unused focus and evade tokens vanish, locks stay ........ res2
//  how a battle ends: the last enemy ship is destroyed ................... win
// Not taught by doing (explained by the rules cards and the bulb): barrel roll and boost moves, bumping, flying off the mat, initiative ties.
const TUT_GAME='nebula-aces';
const TUT={on:false,dice:[],seed:20261008};
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&TUT.on&&!!G&&!!G.tut;
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:tutFirst(),cls:cls,launch:tutStart});
const tutFirst=()=>{try{return !localStorage.getItem('na_played')}catch(e){return true}};
// ---------------------------------------------------------------- the staged battle: fixed squads, positions, rock, dice and enemy maneuvers
const TUT_SQ=[[{p:'kael',u:['u_plasma']}],[{p:'slate',u:[]}]];
const TUT_START={me:{x:457,y:140},foe:{x:457,y:710}};
const TUT_ROCK={x:330,y:215,r:34,n:8,rot:.5,k:[1,.9,1.05,.85,1,.95,1.1,.9]};
// the enemy: round 1 straight 2 (green) and an evade token; round 2 a red K-turn 3 (stress, so no action and no red next)
const TUT_FOE=[{m:{s:2,t:'S'},act:'E'},{m:{s:3,t:'K'},act:null}];
// the dice, in the order the engine rolls them (a = attack, d = defence): my shot (range 3), Slate's defence, Slate's shot, my defence, my shot (range 1), Slate's defence;
// TUT.force holds the faces of the lock reroll (indexes into the attack die: 0 hit, 3 crit)
const TUT_DICE=()=>[{k:'a',f:['hit','focus','blank']},{k:'d',f:['blank','blank','focus','blank']},{k:'a',f:['hit','hit']},{k:'d',f:['focus','blank','blank']},{k:'a',f:['hit','hit','blank','blank']},{k:'d',f:['evade','blank','blank']}];
const TUT_REROLL=[3,0];
// Kael's moves: round 1 straight 2, round 2 straight 1 (both green)
const TUT_ME=[{s:2,t:'S'},{s:1,t:'S'}];
const dialIx=(s,m)=>dialOf(s).findIndex(x=>x.s===m.s&&x.t===m.t&&(m.d==null||x.d===m.d));
const tutRound=()=>Math.max(1,Math.min(2,G?G.round:1));
{const o=rollN;rollN=function(faces,n){if(TUT.on&&!TUT.free&&G&&G.tut&&TUT.dice.length){const k=faces===ATK_FACES?'a':faces===DEF_FACES?'d':'';
    if(k&&TUT.dice[0].k===k){const q=TUT.dice.shift().f.slice(0,n);while(q.length<n)q.push(faces[rnd(8)]);return q}}
  return o.apply(this,arguments)}}
{const o=aiPlan;aiPlan=function(k){if(!(G&&G.tut&&!TUT.free&&k===1))return o.apply(this,arguments);
    for(const s of alive().filter(x=>x.side===1)){const i=dialIx(s,TUT_FOE[tutRound()-1].m);if(i>=0)s.dial=i;else return o.apply(this,arguments)}}}
{const o=aiAction;aiAction=function(s,acts){if(!(G&&G.tut&&!TUT.free&&s.side===1))return o.apply(this,arguments);const a=TUT_FOE[tutRound()-1].act;acts=acts||actionsFor(s);return a&&acts.some(x=>x.a===a)?[a]:['skip']}}
{const o=suggestDial;suggestDial=function(s){if(G&&G.tut&&!TUT.free&&s.side===0){const i=dialIx(s,TUT_ME[tutRound()-1]);if(i>=0)return i}return o.apply(this,arguments)}}
{const o=rnd;rnd=function(n){if(TUT.on&&G&&G.tut&&TUT.force&&TUT.force.length&&n===8)return TUT.force.shift();return o.apply(this,arguments)}}
{const o=applyAtkMod;applyAtkMod=function(k,sel){if(TUT.on&&!TUT.free&&G&&G.tut&&k==='tl'&&sel&&sel.length)TUT.force=TUT_REROLL.slice(0,sel.length);return o.apply(this,arguments)}}
{const o=save;save=function(){if(TUT.on&&G&&G.tut)return;return o.apply(this,arguments)}}
{const o=guided;guided=function(){return tutOn()||TUT.coach?false:o()}}
{const o=coachKey;coachKey=function(){return tutOn()||TUT.coach?null:o()}}
function tutStage(){
  window.TUTPH=true;try{PHN.apply()}catch(e){}   // every step points at the board-first layer: desktop and tablets get it for the lesson
  try{boot3D()}catch(e){}
  if(typeof NET!=='undefined'&&NET.on)netLeave(true);
  TUT.on=true;TUT.free=true;TUT.dice=[];coachReset();try{BF.seenBrief=TUT.seed;PHN.briefSeen=TUT.seed}catch(e){}
  Object.assign(UI,{mode:'solo',camp:null,info:false,stats:false,rules:false,build:null,draft:{},pass:null,sel:null,sugCache:null,autoSetup:false,advOpen:false,hints:false,hold:null,holdK:[],paused:false,sumSeen:0});
  newGame({fac:[0,1],players:[{human:true},{human:false,lvl:'easy'}],squads:TUT_SQ.map(sq=>sq.map(e=>({p:e.p,u:e.u.slice()}))),ex:{noRocks:true},seed:TUT.seed});
  G.tut=1;G.rocks.push(Object.assign({},TUT_ROCK,{k:TUT_ROCK.k.slice()}));
  while(G.phase==='ask'&&G.q&&G.q.key==='deploy'&&G.round===0){const q=G.q;resolveAsk(q.opts[Math.floor(q.opts.length/2)].k);if(G.q&&G.q.kid===q.kid)break}
  const me=G.ships.find(s=>s.side===0),foe=G.ships.find(s=>s.side===1);
  Object.assign(me,TUT_START.me,{h:Math.PI/2});Object.assign(foe,TUT_START.foe,{h:-Math.PI/2});
  resetGuide();flowReset();UI.sumSeen=0;try{BF.seenBrief=G.seed;PHN.briefSeen=G.seed}catch(e){}
  UI.wonSnd=G.seed;try{BF.hideBan()}catch(e){}camView('tilt');render()}
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>hv(sel);
const tqAll=sel=>()=>[...document.querySelectorAll(sel)].filter(e=>!e.closest('[hidden],[data-help]')&&e.getBoundingClientRect().width>2);
function shipRect(id){return()=>{try{const s=ship(id);if(!s||!s.alive||typeof V3==='undefined'||!V3.camera||!BF.px)return null;const c=V3.r.domElement.getBoundingClientRect();
    const p=BF.shownXY(s),q=BF.px(p.x,p.y,1),r=Math.max(26,BF.shipR(s)*1.5);return {left:c.left+q[0]-r,top:c.top+q[1]-r,width:2*r,height:2*r}}catch(e){return null}}}
const tutIdle=()=>!BF.wave&&performance.now()>=BF.flyUntil&&!V3.ez;
const tutPlan=()=>!!(G&&BF.on&&G.phase==='plan'&&planSide()>=0&&!UI.hold&&tutIdle());
const tutMyTurn=ph=>!!(G&&BF.on&&G.phase===ph&&G.cur==='s1'&&humanTurn()&&tutIdle());
const tutHoldRes=who=>!!(UI.hold&&UI.hold.kind==='res'&&UI.hold.R&&UI.hold.R[who]==='s1');
const tutIx=n=>{const s=ship('s1');return s?dialIx(s,TUT_ME[n]):-1};
function tutSteps(){return tutStory([
 {id:'ship',title:'Plan in secret',say:'Touch your ship to see where it can fly.',target:tq('.bfring.need'),wait:{type:'tap',match:a=>a.what==='ship'&&a.id==='s1'},ready:()=>tutPlan()&&!!hv('.bfring.need')},
 {id:'dial',title:'Pick a maneuver',say:'Any line you like. Green is easy, red strains the engines.',target:()=>hv('.bfm:not(.set)'),also:tqAll('.bfm:not(.set)'),wait:{type:'tap',match:a=>a.what==='dial'},ready:()=>BF.sel==='s1'&&tutIdle()&&!!hv('.bfm:not(.set)')}
])}
function tutStory(steps){for(const st of steps){const L=LORE.tut[st.id];if(L){st.title=L.t;st.say=L.s}}return steps}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// the games call this from their input handlers BEFORE applying the tap; false = not what the step asks
function tutGate(a){return !tutOn()||GXT.act(Object.assign({type:'tap'},a))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  tutClearOffer();
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:false,
    endTitle:LORE.coachIntro.title,endText:LORE.coachIntro.text,endButtons:[{id:'free',label:LORE.coachIntro.btn}],
    setup:()=>{try{GX.close()}catch(e){}try{toggleMenu(false)}catch(e){}try{GXC.close()}catch(e){}try{GXH.hide()}catch(e){}tutStage()},
    onDone:()=>{coachStart(o,first)},
    onExit:()=>{tutLeave();UI.info=true;render()}})}
// ---------------------------------------------------------------- the coached game: free play, the guide speaks when a rule first matters
const NCH={shown:{},q:[],cur:null,on:false,o:null,first:null,tm:0};
// for external checks (qa-bot coached mode): running = the free-play part is on, explained = rule ids spoken so far, done = the result card was shown
window.GXCOACH={get running(){return !!NCH.on},get explained(){return Object.keys(NCH.shown)},get done(){return !!NCH.finished},get rules(){return Object.keys(LORE.coach).filter(k=>LORE.coach[k].rule)}};
function coachReset(){NCH.finished=false;NCH.shown={};NCH.q=[];NCH.cur=null;NCH.on=false;clearTimeout(NCH.tm);document.querySelectorAll('#na-coach,#na-coachend').forEach(e=>e.remove())}
function coachStart(o,first){NCH.on=true;NCH.o=o;NCH.first=first;TUT.coach=true;try{GXT.markDone(TUT_GAME)}catch(e){}coachSay('goal');coachSay('fly0');render()}
function coachSay(id){if(!NCH.on||NCH.shown[id]||!LORE.coach[id])return;NCH.shown[id]=1;NCH.q.push(id);coachPump()}
function coachPump(){if(NCH.cur||!NCH.q.length)return;const id=NCH.q.shift(),L=LORE.coach[id];NCH.cur=id;let e=document.getElementById('na-coach');
  if(!e){e=document.createElement('div');e.id='na-coach';e.setAttribute('data-help','');e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e)}
  e.className=(L.who==='slate'?'na-slate':'');e.innerHTML='<i class="na-por"></i><div class="na-ct"><b>'+L.t+'</b><span>'+L.s+'</span><button type="button" class="na-lv" data-na="leave">Leave lesson</button></div><button type="button" class="na-cx" data-na="dismiss" aria-label="Dismiss">\u2715</button>';e.hidden=false;
  clearTimeout(NCH.tm);NCH.tm=setTimeout(coachHide,Math.max(5200,L.s.length*70))}
function coachHide(){clearTimeout(NCH.tm);NCH.cur=null;const e=document.getElementById('na-coach');if(e)e.hidden=true;setTimeout(coachPump,350)}
// rules that came up are explained at that moment; this runs after every render
function coachTick(){if(!NCH.on||!G||!G.tut)return;const me=G.ships.find(x=>x.side===0);if(!me)return;
  if(G.winner){coachEnd();return}
  const ht=humanTurn(),ph=G.phase;
  if(ph==='plan'&&planSide()>=0){if(me.alive&&UI.draft&&UI.draft[me.id]!=null)coachSay('fly');if(BF.sel&&G.round>=2)coachSay('marks')}
  if(G.round>=1&&(ph==='action'||ph==='activate'))coachSay('order');
  if(ph==='action'&&ht){coachSay('action');try{if(actionsFor(me).some(a=>a.a==='TL'))coachSay('lock')}catch(e){}}
  if(ph==='target'&&ht)coachSay('shoot');
  if(G.atk&&ph==='amod'&&G.atk.a===me.id&&ht){coachSay('dice');try{if(atkMods().some(m=>/focus/i.test(m.k)))coachSay('usefocus')}catch(e){}}
  if(G.atk&&ph==='dmod'&&G.atk.d===me.id&&ht){try{if(defMods().length)coachSay('defend')}catch(e){}}
  if(UI.hold&&UI.hold.kind==='res'&&UI.hold.R){const R=UI.hold.R;if(R.a===me.id){if(R.dmg)coachSay('goodshot');else coachSay('res1');if(R.def&&R.def.includes('evade'))coachSay('res1')}else if(R.d===me.id){coachSay(R.dmg?'gothit':'res1');if(R.dmg)coachSay('res2')}
    if(R.dmg)coachSay('res2')}
  if(G.ships.some(x=>x.alive&&x.stress>0))coachSay('stress');
  if(G.round>=2)coachSay('endround')}
{const o=render;render=function(){const r=o.apply(this,arguments);try{coachTick()}catch(e){console.error(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-na]');if(!b)return;const k=b.dataset.na;
  if(k==='dismiss')coachHide();
  else if(k==='leave'){tutLeave();lsPlayed();UI.info=true;render()}
  else if(k==='play'||k==='story'||k==='chapter'){const o=NCH.first;coachReset();tutLeave();lsPlayed();
    if(k==='chapter'&&o){GXC.play(o.id)}else if(k==='story'&&typeof GXC!=='undefined'){UI.info=true;render();GXC.open()}else startGame('solo')}},true);
// the end: the real numbers walked through, then what did not come up
function coachEnd(){if(document.getElementById('na-coachend')||!NCH.on)return;NCH.on=false;clearTimeout(NCH.tm);const c=document.getElementById('na-coach');if(c)c.hidden=true;NCH.finished=true;
  const mine=G.ships.filter(x=>x.side===0),foe=G.ships.filter(x=>x.side===1),won=G.winner==='P1';
  const hp=a=>a.filter(x=>x.alive).reduce((t,x)=>t+Math.max(0,x.hull-hullDmg(x))+x.sh,0);
  const later=LORE.laterAlways.concat(Object.keys(LORE.coach).filter(k=>LORE.coach[k].rule&&!NCH.shown[k]).map(k=>LORE.coach[k].t+': '+LORE.coach[k].s));
  const d=document.createElement('div');d.id='na-coachend';d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">'+(won?LORE.coachEnd.win:LORE.coachEnd.lose)+'</div><div class="gxt-ex"><b>Your numbers</b><br>Your ships left: '+mine.filter(x=>x.alive).length+' (hull and shields '+hp(mine)+'). Rival ships left: '+foe.filter(x=>x.alive).length+'. Rounds: '+G.round+'.<br>'+esc(winLine())+'<br>A battle ends when one side has no ships left.</div>'
    +'<div class="gxt-ex"><b>Things you will meet later</b><ul class="na-later">'+later.map(t=>'<li>'+t+'</li>').join('')+'</ul></div>'
    +'<div class="gxt-eb">'+(NCH.o&&NCH.first?'<button type="button" class="gxt-b pri" data-na="chapter">Start chapter 1</button>':'<button type="button" class="gxt-b pri" data-na="play">Play a real game</button><button type="button" class="gxt-b" data-na="story">Story mode</button>')+'</div></div>';
  document.body.appendChild(d);TUT.coach=false}
// leave the staged game: nothing of it is saved, the dice script and the pauses are cleared
function tutLeave(){TUT.on=false;TUT.free=false;TUT.coach=false;try{coachReset()}catch(e){}if(window.TUTPH){window.TUTPH=false;try{PHN.apply()}catch(e){}}TUT.dice=[];TUT.force=null;try{if(BF.holdT){clearTimeout(BF.holdT);BF.holdT=0}BF.wave=null;BF.sel=null;BF.sub=null}catch(e){}
  UI.hold=null;UI.holdK=[];UI.stats=false;UI.draft={};try{GXH.hide()}catch(e){}if(G&&G.tut){G.tut=0}}
function lsPlayed(){try{localStorage.setItem('na_played','1')}catch(e){}}
// first-time players who tap Launch are offered the lesson first
function tutOffer(mode){if(typeof GXT==='undefined'||!tutFirst()||GXT.status(TUT_GAME).seen||mode!=='solo')return false;tutClearOffer();
  const d=document.createElement('div');d.className='gxt-end';d.id='tutoffer';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in about 5 minutes, one tap at a time.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-tutoffer="play">Just play</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-tutoffer]');if(!b)return;e.stopPropagation();tutClearOffer();
    if(b.dataset.tutoffer==='learn')tutStart();else{lsPlayed();startGame(mode)}});
  return true}
function tutClearOffer(){const d=document.getElementById('tutoffer');if(d)d.remove()}
// the in-game menu keeps a Tutorial entry (first option) whose label follows the progress
function tutMenu(){const m=document.getElementById('more');if(!m||typeof GXT==='undefined')return;const old=m.querySelector('[data-gxt-open]');const h=tutBtn('btn');
  if(old)old.outerHTML=h;else m.insertAdjacentHTML('afterbegin',h)}
{const o=toggleMenu;toggleMenu=function(open){try{tutMenu()}catch(e){}return o.apply(this,arguments)}}
try{tutMenu()}catch(e){}
{const o=startGame;startGame=function(){if(!TUT.on)lsPlayed();return o.apply(this,arguments)}}
