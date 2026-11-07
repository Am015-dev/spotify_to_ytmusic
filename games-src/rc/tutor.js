// ===================== the tutorial (Chapter 0, shell/gx-tutor.js): a staged two-day game that teaches every rule by doing it once =====================
// The staged game is Marooned with a Carpenter and a Cook (+ Friday), fixed seed and decks (tutDeal, called by newGame), never saved (refresh skips G.tut).
// Day 1: explore, dice or sure, arrange the camp, night without a shelter (wounds). Day 2: event card and threat, fog, build the shelter, gather food,
// weather and a skill, the end. Each step spotlights ONE thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act).
// The scenes of the day play by themselves, except the ones a step explains: tutClaimed() keeps those on screen until the step's Next.
const TUT_GAME='shipwreck-isle',TUT_SEED=7,TUT_FOG=6;
let TUT_STEPS=[];const TUT_KEEP={};
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(G&&G.tut);
// the staged deal: called by newGame before the first scene. Day 1 has no event card; day 2 turns over Chill Rain (a rain cloud and a threat).
function tutDeal(){G.tut=1;G.res.food=1;G.tileDeck=[4,10,6,1,3,2,5,7,9,11];G.ev.threat=[null,null];G.ev.deck=['chillrain'].concat(G.ev.deck.filter(k=>k!=='chillrain'))}
// ---------------------------------------------------------------- where each step points
const tpt=(id,sz)=>()=>{try{const p=BF.tilePt(id);return p?{left:p.ox+p.x-sz/2,top:p.oy+p.y-sz/2,width:sz,height:sz}:null}catch(e){return null}};
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
const tcur=()=>{try{const c=curPawn();return c&&c.id}catch(e){return null}};
const tplan=r=>!!(G&&G.tut&&BF.on&&PHO.st==='plan2'&&!PHO.pop&&!UI.confirm&&!UI.modal&&G.round===r);
// a job row in the pop-up of a place; the pop-up list scrolls, so the row is brought into view first
function tutRow(type,pred){const pop=document.querySelector('#ppop');if(!pop||pop.hidden)return null;
  for(const r of pop.querySelectorAll('.bfr[data-place]')){let o=null;try{o=JSON.parse(decodeURIComponent(r.dataset.place))}catch(e){}
    if(!o||o.type!==type||(pred&&!pred(o)))continue;
    const sc=pop.querySelector('.pp-b')||pop,a=sc.getBoundingClientRect(),b=r.getBoundingClientRect();
    if(b.top<a.top+2||b.bottom>a.bottom-2){sc.scrollTop+=(b.top+b.bottom)/2-(a.top+a.bottom)/2}
    const c=r.getBoundingClientRect();return c.width&&c.top>=a.top-1&&c.bottom<=a.bottom+1?r:null}
  return null}
// a scene of the day, on screen now
const tbeat=pred=>()=>{try{if(!G||!G.tut||PHO.st!=='story')return false;const i=storyIdx();const b=i>=0&&UI.beats[i];return !!b&&!!pred(b)}catch(e){return false}};
const bAct=(r,type)=>b=>b.kind==='act'&&b.round===r&&!!b.data&&b.data.type===type;
const bKind=(r,k)=>b=>b.kind===k&&b.round===r;
const tcamp=()=>tpt(G.camp.pos,64)();
const tutNext=()=>{try{storyNext()}catch(e){}};
// a scene that a step (this one or a later one) explains is held until its Next; the others play by themselves
function tutClaimed(i){if(!tutOn())return false;const b=UI.beats[i];if(!b)return false;const n=Math.max(0,GXT.index());
  for(let j=n;j<TUT_STEPS.length;j++){const s=TUT_STEPS[j];if(s.beat&&s.beat(b))return true}return false}
// ---------------------------------------------------------------- the steps, in the order the rules come up
function tutSteps(){return [
 {id:'goal',title:"Cook: our goal",say:"Our ship is gone. Light a fire and stack 15 wood by day 12. A ship will see it.",target:tcamp,wait:null,ready:()=>tplan(1)},
 {id:'lose',title:"Cook: what kills us",say:"Hunger and wounds kill. If anyone dies, or no ship comes by day 12, we are done.",target:tcamp,wait:null,ready:()=>tplan(1)},
 {id:'day',title:"Cook: a day",say:"Every day goes the same way: event card, camp supplies, our plan, the work, weather, night.",target:tq('#phlabel'),wait:null,ready:()=>tplan(1)},
 {id:'pawns',title:"Cook: who does what",say:"Carpenter builds, I cook and heal. Each of us has two pawns, one job each. Friday helps.",target:tq('#bf .pawnrow'),wait:null,ready:()=>tplan(1)},
 {id:'explore',title:"Cook: explore",say:"What lies beside the camp? Send the Carpenter to explore there, before nightfall.",target:tpt(11,56),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.id===11},ready:()=>tplan(1)&&tcur()==='c0_0'&&!G.plan.acts.length},
 {id:'dice',title:"Cook: the risk",say:"Alone he must roll three dice and might get hurt. Two pawns working together never roll.",target:tq('#bfchips .bfg[data-t="11"] .bfa'),wait:null,
   ready:()=>tplan(1)&&!!document.querySelector('#bfchips .bfg[data-t="11"] .bfa')},
 {id:'second',title:"Cook: safe hands",say:"Don't gamble with our carpenter. Send the second Carpenter pawn there too: now it's sure.",target:tpt(11,56),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.id===11},ready:()=>tplan(1)&&tcur()==='c0_1'},
 {id:'camp1',title:"Cook: my turn",say:"Good, no dice. Now me: what can I do at camp?",target:()=>tcamp(),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.id===G.camp.pos},ready:()=>tplan(1)&&tcur()==='c1_0'},
 {id:'camp2',title:"Cook: tidy up",say:"Tidy the camp, earn determination ✊ for skills, and lift morale. Everyone sleeps better.",target:()=>tutRow('camp'),
   wait:{type:'tap',match:a=>a.what==='place'&&a.kind==='camp'},ready:()=>G&&G.tut&&G.round===1&&!!PHO.pop&&!!tutRow('camp')},
 {id:'go1',title:"Cook: off we go",say:"Everyone has a job. Off we go. The day plays out one scene at a time.",target:tq('#bf .btn.go'),
   wait:{type:'tap',match:a=>a.what==='go'},ready:()=>tplan(1)&&!planProblems().length&&!!document.querySelector('#bf .btn.go')},
 {id:'found',title:"Cook: new land",say:()=>{const t=tileAt(11);return t?'Carpenter is back: '+t.terr+' with '+t.src.join(' and ')+'. Tomorrow we can gather there.':'The Carpenter found new land.'},target:tpt(11,56),wait:null,
   beat:bAct(1,'explore'),ready:tbeat(bAct(1,'explore')),onNext:tutNext},
 {id:'night1',title:"Cook: night",say:"Night falls. Everyone eats 1 food, and with no shelter each of us takes a wound.",target:tcamp,wait:null,
   beat:bKind(1,'night'),ready:tbeat(bKind(1,'night')),onNext:tutNext},
 {id:'daysum1',title:"Cook: ouch",say:"Ouch. Each wound costs a life ♥; resting heals one. Tomorrow we build a shelter, I promise.",target:tcamp,wait:null,
   beat:bKind(1,'daysum'),ready:tbeat(bKind(1,'daysum')),onNext:tutNext},
 {id:'event',title:"Cook: morning",say:()=>{const b=UI.beats[storyIdx()];const c=b&&b.data&&CARD[b.data.card];return 'Day two. '+(c?c.n:'The sky')+' rolls in: a rain cloud for tonight.'},target:tq('#bfcard'),wait:null,
   beat:bKind(2,'event'),ready:()=>tbeat(bKind(2,'event'))()&&!!document.querySelector('#bfcard')},
 {id:'threat',title:"Cook: danger",say:"That card left a danger at camp. Handle it within two days or it strikes us.",target:tcamp,wait:null,
   beat:bKind(2,'event'),ready:tbeat(bKind(2,'event')),onNext:tutNext},
 {id:'fog',title:"Cook: fog",say:"Fog hides this place. Work there needs one more pawn, and fog on the camp starves it.",target:tpt(TUT_FOG,56),wait:null,
   onEnter:()=>{try{G.map[TUT_FOG].fog=1;UI.sel=null;refresh()}catch(e){}},ready:()=>tplan(2)},
 {id:'build1',title:"Cook: shelter",say:"Shelter first, so nights stop hurting. Carpenter, to the camp.",target:()=>tcamp(),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.id===G.camp.pos},ready:()=>tplan(2)&&tcur()==='c0_0'},
 {id:'build2',title:"Cook: the plan",say:"A shelter costs 2 wood and ends the night wounds. Choose it.",target:()=>tutRow('build',o=>o.tgt&&o.tgt.k==='shelter'),
   wait:{type:'tap',match:a=>a.what==='place'&&a.kind==='build'&&a.tgt&&a.tgt.k==='shelter'},ready:()=>G&&G.tut&&G.round===2&&!!PHO.pop&&!!tutRow('build',o=>o.tgt&&o.tgt.k==='shelter')},
 {id:'gather1',title:"Cook: food",say:"We need food. I'll gather at the hills: choose that place.",target:tpt(11,56),
   wait:{type:'tap',match:a=>a.what==='tile'&&a.id===11},ready:()=>tplan(2)&&tcur()==='c1_0'},
 {id:'gather2',title:"Cook: fishing",say:"Fishing is best: choose Fish, then my second pawn joins so it is sure.",target:()=>tutRow('gather',o=>o.tgt&&o.tgt.i===1),
   wait:{type:'tap',match:a=>a.what==='place'&&a.kind==='gather'&&a.tgt&&a.tgt.i===1},ready:()=>G&&G.tut&&G.round===2&&!!PHO.pop&&!!tutRow('gather',o=>o.tgt&&o.tgt.i===1)},
 {id:'go2',title:"Cook: go",say:"Shelter and supper are planned. Let the day begin.",target:tq('#bf .btn.go'),
   wait:{type:'tap',match:a=>a.what==='go'},ready:()=>tplan(2)&&!planProblems().length&&!!document.querySelector('#bf .btn.go')},
 {id:'weather',title:"Cook: rain",say:"Clouds above our roof ruin 1 food and 1 wood each. We have no roof, so brace.",target:tcamp,wait:null,
   beat:bKind(2,'weather'),ready:tbeat(bKind(2,'weather'))},
 {id:'skill',title:"Cook: my skill",say:"Not tonight! Spend 3 determination ✊ and I wave off the rain cloud. Use my skill.",target:tq('#bf [data-ans="1"]'),
   wait:{type:'tap',match:a=>a.what==='answer'&&a.i===1},ready:()=>PHO.st==='story'&&!!G.q&&/Moonshine/.test(G.q.title||'')&&!!document.querySelector('#bf [data-ans="1"]')},
 {id:'night2',title:"Cook: night",say:"Dry and safe: the shelter spared us every wound. Everyone eats 1 food.",target:tcamp,wait:null,
   beat:bKind(2,'night'),ready:tbeat(bKind(2,'night')),onNext:tutNext},
 {id:'end',title:"Cook: the road",say:"Twelve days like this: fire plus 15 wood wins. A death or no rescue loses. Ready?",target:tcamp,wait:null,
   beat:bKind(2,'daysum'),ready:tbeat(bKind(2,'daysum'))}
]}
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
function tutStart(o){if(typeof GXT==='undefined')return;const pro=!!(o&&o.prologue);const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];TUT_STEPS=tutSteps();
  GXT.start({game:TUT_GAME,steps:TUT_STEPS,story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:pro?'We survived two days. The ship’s log is open: now the Story begins.':'Jobs, dice, camp, weather, wounds, skills. A real game lasts 12 days.',
    endButtons:pro&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutBegin,
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first&&typeof GXC!=='undefined')GXC.play(first.id);
      else if(c==='story'&&typeof GXC!=='undefined')campOpen();
      else openStart()},
    onExit:()=>{tutLeave();openStart();if(pro&&typeof GXC!=='undefined')campOpen()}})}   // skipping the Story prologue goes on to the chapter map
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
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=on3DTile;on3DTile=function(id){
  if(tutOn()&&!UI._tutIn){if(!GXT.act({type:'tap',what:'tile',id}))return;UI._tutIn=1;try{return o(id)}finally{UI._tutIn=0}}
  return o(id)}})();
// the second pawn of a castaway joins the same job by itself (the pair is taught once, on day 1)
function tutJoin(type,tgt,alt){try{const c=curPawn();if(!c||c.c==null||!/_1$/.test(c.id))return;const e=place(c.id,type,tgt,alt);if(!e){sfx('place');UI.sel=null;wizPlaced();refresh()}}catch(e){console.warn('tutJoin',e)}}
(function(){const o=doPlace;doPlace=function(type,tgt,alt){
  if(tutOn()&&!UI._tutIn){if(!GXT.act({type:'tap',what:'place',kind:type,tgt,alt}))return;UI._tutIn=1;try{o(type,tgt,alt);tutJoin(type,tgt,alt)}finally{UI._tutIn=0}return}
  return o(type,tgt,alt)}})();
(function(){const o=tryStart;tryStart=function(force){
  if(tutOn()&&!UI._tutIn){if(!GXT.act({type:'tap',what:'go'}))return;UI._tutIn=1;try{return o(force)}finally{UI._tutIn=0}}
  return o(force)}})();
(function(){const o=answer;answer=function(i){
  if(tutOn()&&!UI._tutIn){if(!GXT.act({type:'tap',what:'answer',i}))return;UI._tutIn=1;try{return o(i)}finally{UI._tutIn=0}}
  return o(i)}})();
