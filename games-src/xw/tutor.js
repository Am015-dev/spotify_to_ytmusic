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
{const o=rollN;rollN=function(faces,n){if(TUT.on&&G&&G.tut&&TUT.dice.length){const k=faces===ATK_FACES?'a':faces===DEF_FACES?'d':'';
    if(k&&TUT.dice[0].k===k){const q=TUT.dice.shift().f.slice(0,n);while(q.length<n)q.push(faces[rnd(8)]);return q}}
  return o.apply(this,arguments)}}
{const o=aiPlan;aiPlan=function(k){if(!(G&&G.tut&&k===1))return o.apply(this,arguments);
    for(const s of alive().filter(x=>x.side===1)){const i=dialIx(s,TUT_FOE[tutRound()-1].m);if(i>=0)s.dial=i;else return o.apply(this,arguments)}}}
{const o=aiAction;aiAction=function(s,acts){if(!(G&&G.tut&&s.side===1))return o.apply(this,arguments);const a=TUT_FOE[tutRound()-1].act;acts=acts||actionsFor(s);return a&&acts.some(x=>x.a===a)?[a]:['skip']}}
{const o=suggestDial;suggestDial=function(s){if(G&&G.tut&&s.side===0){const i=dialIx(s,TUT_ME[tutRound()-1]);if(i>=0)return i}return o.apply(this,arguments)}}
{const o=rnd;rnd=function(n){if(TUT.on&&G&&G.tut&&TUT.force&&TUT.force.length&&n===8)return TUT.force.shift();return o.apply(this,arguments)}}
{const o=applyAtkMod;applyAtkMod=function(k,sel){if(TUT.on&&G&&G.tut&&k==='tl'&&sel&&sel.length)TUT.force=TUT_REROLL.slice(0,sel.length);return o.apply(this,arguments)}}
{const o=save;save=function(){if(TUT.on&&G&&G.tut)return;return o.apply(this,arguments)}}
{const o=guided;guided=function(){return tutOn()?false:o()}}
{const o=coachKey;coachKey=function(){return tutOn()?null:o()}}
function tutStage(){
  try{boot3D()}catch(e){}
  if(typeof NET!=='undefined'&&NET.on)netLeave(true);
  TUT.on=true;TUT.dice=TUT_DICE();try{BF.seenBrief=TUT.seed;PHN.briefSeen=TUT.seed}catch(e){}
  Object.assign(UI,{mode:'solo',camp:null,info:false,stats:false,rules:false,build:null,draft:{},pass:null,sel:null,sugCache:null,autoSetup:false,advOpen:false,hints:false,hold:null,holdK:[],paused:false,sumSeen:0});
  newGame({fac:[0,1],players:[{human:true},{human:false,lvl:'hard'}],squads:TUT_SQ.map(sq=>sq.map(e=>({p:e.p,u:e.u.slice()}))),ex:{noRocks:true},seed:TUT.seed});
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
function tutSteps(){return [
 // ---- round 1: goal, plan, reveal, order, action, shot, dice, damage
 {id:'goal',title:'Your goal',say:'Destroy the enemy ship. Yours is at the bottom, theirs at the top.',target:shipRect('s2'),also:shipRect('s1'),wait:null,ready:()=>tutPlan()&&G.round===1},
 {id:'ship',title:'Plan in secret',say:'Everyone picks a move in secret first. Tap your ship to see its moves.',target:tq('.bfring.need'),wait:{type:'tap',match:a=>a.what==='ship'&&a.id==='s1'},ready:()=>tutPlan()&&!!hv('.bfring.need')},
 {id:'marks',title:'Red and rocks',say:'Red moves give a stress token. ! marks an asteroid: it hurts and skips your action.',target:tq('.bfm.danger'),also:tqAll('.bfm.danger,.bfm.r'),wait:null,ready:()=>BF.sel==='s1'&&tutIdle()&&!!hv('.bfm.danger')&&!!hv('.bfm.r')},
 {id:'dial',title:'Pick a maneuver',say:'Number is speed, arrow is direction, green is easy. Tap the green straight 2.',target:()=>hv('.bfm[data-bfm="'+tutIx(0)+'"]'),wait:{type:'tap',match:a=>a.what==='dial'&&a.i===tutIx(0)},ready:()=>BF.sel==='s1'&&tutIdle()&&!!hv('.bfm[data-bfm="'+tutIx(0)+'"]')},
 {id:'fly',title:'Reveal the dials',say:'Dials stay secret until everyone is set. Tap Fly to reveal them.',target:tq('[data-bf=fly]'),wait:{type:'tap',match:a=>a.what==='fly'},ready:()=>tutPlan()&&!!hv('[data-bf=fly]:not([disabled])')},
 {id:'order',title:'Skill sets the order',say:'Lowest pilot skill flies first: Slate (3), then Kael (8). The highest shoots first.',target:shipRect('s1'),also:shipRect('s2'),wait:null,ready:()=>tutMyTurn('action')&&G.round===1},
 {id:'action',title:'One action',say:'After moving, a ship gets one action: focus, evade, lock, roll or boost. Tap Focus.',target:tq('.bfact[data-bfa="F"]'),wait:{type:'tap',match:a=>a.what==='action'&&a.a==='F'},ready:()=>tutMyTurn('action')&&!!hv('.bfact[data-bfa="F"]')},
 {id:'shoot',title:'Take your shot',say:()=>{try{const s=ship('s1'),w=weaponsFor(s)[0],t=w.targets[0],sd=shotDice(s,w,t,ship(t.id));return `In your arc at range ${t.rg}: you roll ${sd.atk} dice, it rolls ${sd.def}. Tap it.`}catch(e){return 'The enemy is in your arc. Tap it to shoot.'}},
   target:tq('.bftgt'),wait:{type:'tap',match:a=>a.what==='fire'&&a.t==='s2'},ready:()=>tutMyTurn('target')&&!!hv('.bftgt')},
 {id:'dice',title:'Your attack dice',say:'Hit and crit deal damage. A focus result does nothing, unless you spend focus.',target:tq('#bfdice'),wait:null,ready:()=>!!(G&&G.phase==='amod'&&G.atk&&G.atk.a==='s1'&&humanTurn()&&hv('#bfdice')&&tutIdle())},
 {id:'usefocus',title:'Spend your focus',say:'Your focus token turns the focus result into a hit.',target:tq('#bfbtns [data-act=amod][data-k=focus]'),wait:{type:'tap',match:a=>a.what==='ui'&&a.act==='amod'&&a.k==='focus'},ready:()=>!!hv('#bfbtns [data-act=amod][data-k=focus]')},
 {id:'roll',title:'Roll the defence',say:'Nothing else to improve. Tap Roll: the enemy then rolls its defence dice.',target:tq('#bfbtns [data-act=amod][data-k=done]'),wait:{type:'tap',match:a=>a.what==='ui'&&a.act==='amod'&&a.k==='done'},ready:()=>!!(G&&G.phase==='amod'&&G.atk&&G.atk.a==='s1'&&G.atk.dice.length&&!G.atk.dice.includes('focus')&&hv('#bfbtns [data-act=amod][data-k=done]'))},
 {id:'res1',title:'Hits minus evades',say:'Each evade cancels one hit. Slate spent its evade token: one hit gets through.',target:tq('#bfdice'),wait:null,hold:c=>c==='res',ready:()=>tutHoldRes('a')&&!!hv('#bfdice'),onNext:()=>releaseHold()},
 {id:'defend',title:'Pilot power',say:'Slate fires back. Kael may turn one focus result into an evade. Tap it.',target:tq('#bfbtns [data-act=dmod][data-k=kael]'),wait:{type:'tap',match:a=>a.what==='ui'&&a.act==='dmod'&&a.k==='kael'},ready:()=>!!(G&&G.phase==='dmod'&&G.atk&&G.atk.d==='s1'&&humanTurn()&&hv('#bfbtns [data-act=dmod][data-k=kael]'))},
 {id:'res2',title:'Shields go first',say:'Damage strips shields before hull. Unused focus and evade tokens vanish at round end.',target:tq('#bfdice'),wait:null,hold:c=>c==='res',ready:()=>tutHoldRes('d')&&!!hv('#bfdice'),onNext:()=>releaseHold()},
 // ---- round 2: stress, target lock and the reroll, a point-blank shot, victory
 {id:'auto',title:'Round 2',say:'Tap Auto: the computer suggests a move for each ship. You can always choose your own.',target:tq('[data-bf=auto]'),wait:{type:'tap',match:a=>a.what==='auto'},ready:()=>tutPlan()&&G.round===2&&!!hv('[data-bf=auto]')},
 {id:'fly2',title:'Fly again',say:'Tap Fly. Slate has the lower skill, so it moves before you.',target:tq('[data-bf=fly]'),wait:{type:'tap',match:a=>a.what==='fly'},ready:()=>tutPlan()&&G.round===2&&!!hv('[data-bf=fly]:not([disabled])')},
 {id:'stress',title:'Red means stress',say:'Slate flew a red K-turn: stress token, no action, and it now faces away.',target:shipRect('s2'),also:shipRect('s1'),wait:null,ready:()=>tutMyTurn('action')&&G.round===2},
 {id:'lock',title:'Target lock',say:'A lock lets you reroll attack dice against that enemy. Tap Lock.',target:tq('.bfact[data-bfa="TL"]'),wait:{type:'tap',match:a=>a.what==='action'&&a.a==='TL'},ready:()=>tutMyTurn('action')&&!!hv('.bfact[data-bfa="TL"]')},
 {id:'shoot2',title:'Point blank',say:'Range 1 adds an attack die. Slate faces away, so it cannot shoot back. Tap it.',target:tq('.bftgt'),wait:{type:'tap',match:a=>a.what==='fire'&&a.t==='s2'},ready:()=>tutMyTurn('target')&&!!hv('.bftgt')},
 {id:'reroll',title:'Spend your lock',say:'Two blanks. Spend the lock to roll them again.',target:tq('#bfbtns [data-act=amod][data-k=tl]'),wait:{type:'tap',match:a=>a.what==='ui'&&a.act==='amod'&&a.k==='tl'},ready:()=>!!(G&&G.phase==='amod'&&G.atk&&G.atk.a==='s1'&&hv('#bfbtns [data-act=amod][data-k=tl]'))},
 {id:'confirm',title:'Choose the dice',say:'The blank dice are ticked. Tap Reroll to roll just those.',target:tq('#bfbtns [data-bfq=ok]'),wait:{type:'tap',match:a=>a.what==='ask'&&a.k==='ok'},
   ready:()=>{try{if(G&&G.phase==='ask'&&G.q&&G.q.key==='dice'&&!G.atk.pre){const bl=G.atk.dice.map((f,i)=>f==='blank'?i:-1).filter(i=>i>=0);const sel=G.q.opts.filter(o=>/^☑/.test(o.l)).length;
       if(sel<bl.length){const k='t'+bl[sel];if(G.q.opts.some(o=>o.k===k))uiAct({act:'ask',k});return false}G.atk.pre=1}}catch(e){}
     return !!(G&&G.phase==='ask'&&G.q&&G.q.key==='dice'&&G.atk.pre&&hv('#bfbtns [data-bfq=ok]'))}},
 {id:'roll2',title:'Roll and finish',say:'Better dice. Tap Roll to see if Slate survives.',target:tq('#bfbtns [data-act=amod][data-k=done]'),wait:{type:'tap',match:a=>a.what==='ui'&&a.act==='amod'&&a.k==='done'},ready:()=>!!(G&&G.phase==='amod'&&G.atk&&G.atk.a==='s1'&&G.atk.rr&&G.atk.rr.some(Boolean)&&hv('#bfbtns [data-act=amod][data-k=done]'))},
 {id:'win',title:'Victory',say:'No enemy ships left. The battle ends when every ship on one side is destroyed. You won!',target:tq('#bftop'),wait:null,ready:()=>!!(G&&G.winner&&BF.on&&!UI.stats&&hv('#bftop')&&tutIdle())}
]}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// the games call this from their input handlers BEFORE applying the tap; false = not what the step asks
function tutGate(a){return !tutOn()||GXT.act(Object.assign({type:'tap'},a))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  tutClearOffer();
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Plan, fly, act, shoot, defend. Now the Story begins.':'Plan, fly, act, shoot, defend. Shields, hull, stress and locks come with you.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:()=>{try{GX.close()}catch(e){}try{toggleMenu(false)}catch(e){}try{GXC.close()}catch(e){}try{GXH.hide()}catch(e){}tutStage()},
    onDone:r=>{tutLeave();const c=r&&r.choice;lsPlayed();
      if(c==='chapter'&&first){GXC.play(first.id)}
      else if(c==='story'&&typeof GXC!=='undefined'){UI.info=true;render();GXC.open()}
      else startGame('solo')},
    onExit:()=>{tutLeave();UI.info=true;render()}})}
// leave the staged game: nothing of it is saved, the dice script and the pauses are cleared
function tutLeave(){TUT.on=false;TUT.dice=[];TUT.force=null;try{if(BF.holdT){clearTimeout(BF.holdT);BF.holdT=0}BF.wave=null;BF.sel=null;BF.sub=null}catch(e){}
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
