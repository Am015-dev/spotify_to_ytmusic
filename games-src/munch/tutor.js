// ===================== the tutorial (shell/gx-tutor.js): a staged, never-saved game that teaches every rule by doing it once =====================
// The staged game is a real game (engine, board, buttons) with a FIXED deal: three heroes, you (Pip) first, the two computer heroes scripted (tutAI).
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports exactly that action (GXT.act).
//
// RULES CHECKLIST (read from rules-html.js, hlp.js rules cards and rules-test.js) -> the step that teaches it by doing:
//   goal: first to level 10, last level only from a monster ........ goal (Next), finale
//   start: level 1, 4 door + 4 treasure cards, set up before the 1st turn . elf, powers, bucket, ready
//   races and classes give powers (Elf +1 run; Warrior, Wizard, Thief, Cleric)  elf (do), powers (Next)
//   items: wear automatically, add to strength, slots, lost items .. bucket (do), bad (lost hat)
//   sell items worth 1,000 gold for a level ........................ sellbtn, sellpick, sellconfirm
//   kick open the door: monster = fight; hand / curse / other ..... kick (monster), kick2 (card to hand); curse is played in curse
//   combat strength = level + items; higher wins; ties to the monster . potion (compare), help (compare)
//   one-shot potions add to either side ............................ potion
//   monster boosts, anyone may meddle in a fight .................... meddle
//   ask a rival for help, the helper's strength adds, Elf helper levels  help, who, fight
//   win: levels + treasure (Treasure Pile draws 3) ................. win
//   run away: roll 5 or 6, Elf +1, fail = Bad Stuff (even death) ... run, bad
//   curses can be played on anyone, before their door .............. curse
//   no monster behind the door: loot a card or look for trouble ..... trouble (do), text names loot
//   charity: hand limit 5, extras go to the lowest level ............ charity
//   what the computer does: kicks, fights, runs, curses by the same rules . curse step text, meddle (watch Morwen), finale
//   how the game ends (level 10 by a monster) ....................... finale
const TUT_GAME='doorkick-dungeon';
let TUTG=false;
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(G&&G.tut);
const tutFirst=()=>{try{return !localStorage.getItem('dkd_offer')&&!localStorage.getItem('dkd_learned')&&!localStorage.getItem('dkd_bf')&&!localStorage.getItem(SAVE)}catch(e){return true}};
const tutSkipped=()=>{try{return !!localStorage.getItem('dkd_tutskip')}catch(e){return false}};
const tutBtn=cls=>typeof GXT==='undefined'||(G&&G.mode==='net'&&!G.winner)?'':GXT.menuHTML({game:TUT_GAME,first:tutFirst(),cls:cls,launch:()=>tutStart()});
// ---------------------------------------------------------------- the fixed deal
const TUT_SEED=20261008;
const kdef=id=>G.C[id];                         // a card's key ('elf', 'imp', ...)
const myId=key=>P(0).hand.find(i=>kdef(i)===key);
function tutDeal(){
  for(const p of G.pl){for(const id of p.hand.splice(0))(cd(id).d==='door'?G.door:G.tr).push(id)}
  const take=key=>{for(const dk of [G.door,G.tr]){const i=dk.findIndex(id=>G.C[id]===key);if(i>=0)return dk.splice(i,1)[0]}throw new Error('tutorial card '+key)};
  const deal=(s,keys)=>keys.forEach(k=>P(s).hand.push(take(k)));
  deal(0,['elf','gargantuan','lizards','hexlvl','bucket','swash','fizz','rod']);
  deal(1,['elf','dwarf','halfling','mixed','rascal','gooey','antler','kneecaps']);
  deal(2,['dwarf','dwarf','elf','double','stompy','cudgel','pole','sandwich']);
  P(1).lvl=3;P(2).lvl=3;P(1).lv='normal';P(2).lv='normal'}
// the treasure you draw for beating the Lizards: first draw (Backstabber's Shiv), then the Treasure Pile (3 more cards at once: Sour Drink, Snooze Syrup, Jerkin)
function tutStackTreasure(){const take=key=>{const i=G.tr.findIndex(id=>G.C[id]===key);return i>=0?G.tr.splice(i,1)[0]:null};
  const order=['jerkin','snooze','sour','pile','shiv'].map(take).filter(x=>x!=null);   // pushed last = drawn first: shiv (first draw), pile, sour, snooze, jerkin
  for(const id of order)G.tr.push(id)}
function tutTop(key){const i=G.door.findIndex(id=>G.C[id]===key);if(i<0)return false;const id=G.door.splice(i,1)[0];G.door.push(id);return true}
// the die: find a generator state whose next d6 is v (rnd() adds 0x6D2B79F5 to G.rng first)
function tutRoll(v){for(let r=1;r<5000;r++){let t=r+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);if(1+Math.floor(((t^t>>>14)>>>0)/4294967296*6)===v){G.rng=r;return true}}return false}
// ---------------------------------------------------------------- the computer heroes are scripted, so every rule appears on cue
function tutAI(s){if(!tutOn()||!G||s===0)return null;const vm=validMoves(s),p=P(s);const by=a=>vm.find(m=>m.act===a);
  if(G.q){if(G.q.kind==='help')return {act:'opt',opt:s===1?'yes':'no'};return null}
  switch(G.phase){
    case 'setup':{const pl=vm.find(m=>(m.act==='play'||m.act==='equip')&&m.card!=null&&(cd(m.card).t==='item'||(cd(m.card).t==='race'&&!p.race.length))&&!(cd(m.card).t==='item'&&cd(m.card).req&&!!equipWhy(p,m.card)));return pl||by('ready')}
    case 'window':return by('pass');
    case 'main':if(s===1)tutTop('imp');else tutTop('double');return by('kick');
    case 'after':return by('loot');
    case 'post':return by('end');
    case 'charity':return vm.slice().sort((a,b)=>cardValue(p,a.card)-cardValue(p,b.card))[0];
    case 'combat':{const cb=G.cb;
      if(cb.stage==='others')return by('pass');
      if(cb.stage==='act'){if(winning(cb))return by('fight');tutRoll(1);return by('run')}}}
  return null}
(function(){const o=aiMove;aiMove=function(s){const m=tutAI(s);return m||o.apply(this,arguments)}})();
// ---------------------------------------------------------------- never saved: the staged game does not touch the real saved game
(function(){const o=refresh;refresh=function(){
  if(TUTG||(G&&G.tut)){if(G&&!G.winner)autoPass();render();schedule();sounds();return}
  return o.apply(this,arguments)}})();
// the help kit stays quiet while the tutorial runs
(function(){const o1=hlpPhase;hlpPhase=function(){return tutOn()?null:o1.apply(this,arguments)};
  const o2=hlpSuggest;hlpSuggest=function(){return tutOn()?null:o2.apply(this,arguments)}})();
// ---------------------------------------------------------------- where each step points
const tvis=e=>{if(!e||e.closest('[hidden]'))return false;const r=e.getBoundingClientRect();return r.width>3&&r.height>3};
const tq=(...sels)=>()=>{for(const s of sels)for(const e of document.querySelectorAll(s))if(tvis(e))return e;return null};
// a button that pulses (scales) keeps the same place: its layout box, not its animated box
const tstable=sel=>()=>{const e=document.querySelector(sel);if(!tvis(e))return null;const o=e.offsetParent;if(!o)return e;const r=o.getBoundingClientRect();return {left:r.left+e.offsetLeft,top:r.top+e.offsetTop,width:e.offsetWidth,height:e.offsetHeight}};
const tchip=i=>tq(`#phopps [data-opp="${i}"]`,`#app .opps [data-opp="${i}"]`);
const mv=a=>`#prompt [data-mv*='"act":"${a}"']`;
function tcardEl(key){const id=myId(key);return id==null?null:document.querySelector(`.mine .hand [data-card="${id}"]`)}
// the visible strip of a hand card (its neighbour overlaps it); the hand scrolls the card into view first
function tcard(key){const e=tcardEl(key);if(!tvis(e))return null;let r=e.getBoundingClientRect();if(r.left<4||r.right>innerWidth-4){try{e.scrollIntoView({inline:'center',block:'nearest'})}catch(x){}r=e.getBoundingClientRect()}return hslice(e)}
const tclear=()=>!document.getElementById('bfrev')&&!BF.kicking&&UI.pass==null&&!GX.open&&document.getElementById('modal').hidden&&!BF.drag;
const tmine=()=>!!G&&!G.winner&&sideToAct()===0&&!G.q&&tclear();
const nowStr=()=>{const cb=G.cb;return cb?[sideStr(cb),monStr(cb)]:[0,0]};
const tpick=key=>()=>myId(key);
// ---------------------------------------------------------------- the steps
function tutSteps(){
  return [
 {id:'goal',title:'Race to level 10',say:'Be first to reach level 10. The final level can only come from killing a monster.',target:tq('.bfbig','.mine .top'),wait:null,
   ready:()=>G.phase==='setup'&&tmine()&&!!document.querySelector('.bfbig')},
 {id:'elf',title:'Play your race',say:'Tap your Elf, then tap your hero. Races give powers.',target:tq('.bfbig'),also:()=>tcard('elf'),pick:tpick('elf'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='elf'},from:()=>tcard('elf'),ready:()=>G.phase==='setup'&&tmine()&&BF.pick==null&&!!tcard('elf')&&!!document.querySelector('.bfbig')},
 {id:'powers',title:'Races and classes',say:'Your Elf runs better. Classes add powers too: Warriors win ties, Wizards flee, Thieves stab, Clerics fight undead.',target:tq('.mine .gear'),wait:null,
   ready:()=>G.phase==='setup'&&tmine()&&P(0).race.length>0},
 {id:'bucket',title:'Wear an item',say:()=>'Items go on by themselves and add to your strength. Tap the Bucket, then your hero.',target:tq('.bfbig'),also:()=>tcard('bucket'),pick:tpick('bucket'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='bucket'},from:()=>tcard('bucket'),ready:()=>G.phase==='setup'&&tmine()&&BF.pick==null&&!!tcard('bucket')&&!!document.querySelector('.bfbig')},
 {id:'ready',title:'Ready!',say:'Everyone gears up before the first door. Tap Ready.',target:tq(mv('ready')),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='ready'},ready:()=>G.phase==='setup'&&tmine()&&P(0).eq.some(e=>e.on)&&BF.pick==null},
 {id:'sellbtn',title:'Sell for a level',say:'Every 1,000 gold of items you sell buys a level. Tap Sell.',target:tq('#prompt [data-a="sellmode"]'),
   wait:{type:'tap',match:a=>a.what==='sellmode'},ready:()=>G.phase==='main'&&G.active===0&&tmine()&&!UI.sell},
 {id:'sellpick',title:'Pick what to sell',say:()=>'Tap the Rod: it is worth '+cd(myId('rod')).g.toLocaleString('en')+' gold.',target:()=>tcard('rod'),
   wait:{type:'tap',match:a=>a.what==='sellpick'&&kdef(a.id)==='rod'},ready:()=>tmine()&&!!UI.sell&&!!tcard('rod')},
 {id:'sellconfirm',title:'Cash it in',say:'That is over 1,000 gold. Tap Sell for a free level.',target:tq('.sellbar .btn.primary'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='sell'},ready:()=>tmine()&&!!UI.sell&&UI.sell.length>0&&!!tq('.sellbar .btn.primary:not([disabled])')()},
 {id:'kick',title:'Kick open the door',say:'Tap the door and see what is behind it!',target:tq('.bfdoor'),wait:{type:'tap',match:a=>a.what==='kick'},
   ready:()=>G.phase==='main'&&G.active===0&&tmine()&&P(0).lvl>=2&&!!document.querySelector('.bfdoor')&&(tutTop('hatmuncher'),true)},
 {id:'potion',title:'A monster! Fight it',say:()=>{const [a,b]=nowStr();return 'Monster '+b+', you '+a+'. The higher number wins. Tap your potion, then your side.'},target:tq('.arena .score.hero'),also:()=>tcard('fizz'),pick:tpick('fizz'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='fizz'&&a.z==='fh'},from:()=>tcard('fizz'),
   ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&tmine()&&BF.pick==null&&!!tcard('fizz')&&!!document.querySelector('.arena .score.hero')},
 {id:'run',title:'Too strong: run!',say:()=>{const [a,b]=nowStr();return 'Still '+a+' against '+b+'. You lose. Run away: roll 5 or 6 to escape (Elves get +1).'},target:tq('.fbtns .runb'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='run'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&tmine()&&G.cb.os.length>0&&!!document.querySelector('.fbtns .runb')},
 {id:'bad',title:'Caught! Bad Stuff',say:()=>'You rolled '+(G.lastRoll?G.lastRoll.v:1)+'. A failed run means the monster’s Bad Stuff: it ate your hat. Some even kill you.',target:tq('.mine .gear','.mine .top'),wait:null,
   ready:()=>G.phase==='post'&&!G.cb&&!!G.out&&!G.out.won&&tclear()},
 {id:'end1',title:'End your turn',say:'You may wear or sell more now. Then tap End turn.',target:tq(mv('end')),wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='end'},
   ready:()=>G.phase==='post'&&tmine()},
 {id:'curse',title:'Curse a rival',say:'Before Morwen kicks, you may curse her. Anyone can curse anyone. Tap Rotten Luck, then Morwen.',target:tchip(1),also:()=>tcard('hexlvl'),pick:tpick('hexlvl'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='hexlvl'&&a.z==='p1'},from:()=>tcard('hexlvl'),
   ready:()=>G.phase==='window'&&G.active===1&&tmine()&&BF.pick==null&&!!tcard('hexlvl')&&!!tchip(1)()},
 {id:'meddle',title:'Meddle in her fight',say:'Morwen fights alone. Anyone may interfere! Tap Gargantuan, then her monster: +10 for it.',target:tq('.arena .row.mons .mon'),also:()=>tcard('gargantuan'),pick:tpick('gargantuan'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='gargantuan'},from:()=>tcard('gargantuan'),
   ready:()=>!!G.cb&&G.cb.who===1&&G.cb.stage==='others'&&tmine()&&BF.pick==null&&!!tcard('gargantuan')&&!!document.querySelector('.arena .row.mons .mon')},
 {id:'rivals',title:'The computer plays too',say:'Morwen and Grub follow the same rules: they kick doors, fight, run, curse and ask for help.',target:tq('#phopps','#app .opps'),wait:null,
   ready:()=>G.active===2&&!G.winner},
 {id:'kick2',title:'Your turn again',say:'Kick the door. Not every door hides a monster.',target:tq('.bfdoor'),wait:{type:'tap',match:a=>a.what==='kick'},
   ready:()=>G.phase==='main'&&G.active===0&&G.turn>1&&tmine()&&!!document.querySelector('.bfdoor')&&(tutTop('halfling'),true)},
 {id:'trouble',title:'Look for trouble',say:'No monster. You may loot a free card, or fight one from your hand: tap Lizards, then the door.',target:tq('.arena'),also:()=>tcard('lizards'),pick:tpick('lizards'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='lizards'},from:()=>tcard('lizards'),
   ready:()=>G.phase==='after'&&tmine()&&BF.pick==null&&!!tcard('lizards')},
 {id:'help',title:'Ask for help',say:()=>{const [a,b]=nowStr();return 'Lizards '+b+', you '+a+': you lose. Ask a rival to join you. Tap Help.'},target:tq('.fbtns .helpb'),
   wait:{type:'tap',match:a=>a.what==='askmenu'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.who===0&&G.cb.help<0&&tmine()&&!!document.querySelector('.fbtns .helpb')},
 {id:'who',title:'Pick a helper',say:'Morwen is an Elf, so she helps for free. Others want treasure. Tap Morwen.',target:tchip(1),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='ask'&&a.m.tgt===1},ready:()=>!!BF.ask&&!!tchip(1)()},
 {id:'fight',title:'Fight!',say:()=>{const [a,b]=nowStr();return 'Together you have '+a+' against '+b+'. Higher wins, ties go to the monster. Tap Fight!'},target:tstable('.fbtns .fightb'),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='fight'},ready:()=>!!G.cb&&G.cb.stage==='act'&&G.cb.help===1&&tmine()&&!!document.querySelector('.fbtns .fightb')},
 {id:'win',title:'Victory!',say:'You beat it: +1 level, and you drew the treasure. A Treasure Pile gave 3 more cards. Tap End turn.',target:tq(mv('end')),
   wait:{type:'tap',match:a=>a.what==='move'&&a.m.act==='end'},ready:()=>G.phase==='post'&&!G.cb&&!!G.out&&G.out.won&&tmine()},
 {id:'charity',title:'Too many cards',say:'You may keep 5 cards. Give the extras to the lowest-level hero: tap the Halfling, then Morwen.',target:tchip(1),also:()=>tcard('halfling'),pick:tpick('halfling'),
   wait:{type:'drag',match:a=>a.what==='drop'&&kdef(a.id)==='halfling'&&a.z==='p1'},from:()=>tcard('halfling'),
   ready:()=>G.phase==='charity'&&tmine()&&BF.pick==null&&!!tcard('halfling')&&!!tchip(1)()},
 {id:'finale',onEnter:()=>{UI.pause=true},title:'You know the rules',say:()=>'First to level 10 wins, and the last level needs a monster kill. You are level '+P(0).lvl+'. Go and win!',target:tq('.mine .top'),wait:null,
   ready:()=>G.active!==0&&!G.winner}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutSetup(){try{GX.close()}catch(e){}
  TUTG=true;clearTimeout(aiTimer);aiTimer=null;UI.pass=null;UI.lastSeat=-1;UI.menu=null;UI.zoom=null;UI.sell=null;UI.cmp=null;UI.pause=false;
  BF.pick=null;BF.ask=null;BF.kicking=false;UI.spd0=UI.speed;UI.speed=Math.max(1.5,UI.speed||1);
  const lvl0=UI.lvl,n0=UI.n,nm0=UI.names;UI.lvl='normal';UI.names=null;DEFSEED=TUT_SEED;
  try{newGame('F',3)}finally{UI.lvl=lvl0;UI.n=n0;UI.names=nm0;DEFSEED=null}
  G.tut=1;G.learn=false;G.rng=TUT_SEED;
  G.active=G.first=0;G.setupOrd=[0,1,2];G.setupI=0;G.log=[];G.ln=0;lg(-1,'The tutorial dungeon opens: you, Morwen and Grub.');
  tutDeal();tutStackTreasure();tutTop('hatmuncher');
  UI.hints=false;render()}
function tutLeave(){TUTG=false;UI.pause=false;clearTimeout(aiTimer);aiTimer=null;if(UI.spd0!=null){UI.speed=UI.spd0;UI.spd0=null}BF.pick=null;BF.ask=null;
  try{GXH.hide()}catch(e){}G=null;UI.info=true;UI.menu=null;UI.zoom=null;UI.sell=null;UI.pass=null;DEFSEED=null;render()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Gear up, kick, fight, run, help, curse, sell, charity. Now the Story begins.':'Gear up, kick, fight, run, help, curse, sell, charity. The lightbulb explains the rest.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:tutSetup,
    onDone:r=>{const c=r&&r.choice;tutLeave();
      if(c==='chapter'&&first)GXC.play(first.id);
      else if(c==='story'&&typeof campOpen==='function')campOpen()},
    onExit:()=>{tutLeave();if(o&&typeof campOpen==='function'){try{localStorage.setItem('dkd_tutskip','1')}catch(e){}campOpen()}}})}   // skipping the Chapter 0 prologue goes on to the Story map, and Story does not ask again
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=uiAct;uiAct=function(m){
  if(tutOn()&&!UI._tutIn){if(m.act==='kick'){if(!UI._tutKick){render();return}UI._tutKick=0}else{if(!GXT.act({type:'tap',what:'move',m})){render();return}if(m.act==='run')tutRoll(1)}}
  return o.apply(this,arguments)}})();
(function(){const o=bfDrop;bfDrop=function(id,z,at){
  if(tutOn()&&!UI._tutIn){if(!GXT.act({type:'tap',what:'drop',id,z}))return false;UI._tutIn=1;try{return o(id,z,at)}finally{UI._tutIn=0}}
  return o(id,z,at)}})();
(function(){const o=bfKick;bfKick=function(){if(tutOn()&&!BF.kicking){if(!GXT.act({type:'tap',what:'kick'}))return;UI._tutKick=1}return o.apply(this,arguments)}})();
function tutBlock(e){e.stopPropagation();e.stopImmediatePropagation();e.preventDefault()}
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  // Story: the first tap runs the tutorial as Chapter 0
  if(t.closest('[data-a="story"]')&&!tutOn()&&typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME)&&!GXT.running()&&!tutSkipped()){tutBlock(e);tutStart({prologue:true});return}
  // Play for the first time: offer the tutorial once
  const sb=t.closest('[data-start]');
  if(sb&&sb.dataset.start!=='ai'&&sb.dataset.start!=='net'&&!UI._offerOk&&!tutOn()&&typeof GXT!=='undefined'&&tutFirst()&&!GXT.status(TUT_GAME).seen){tutBlock(e);tutOffer(sb);return}
  if(!tutOn())return;
  if(t.closest('[data-help],[data-gxt-skip]'))return;
  const ak=t.closest('[data-a="askmenu"]');if(ak){if(!GXT.act({type:'tap',what:'askmenu'}))tutBlock(e);return}
  const sm=t.closest('[data-a="sellmode"]');if(sm){if(!GXT.act({type:'tap',what:'sellmode'}))tutBlock(e);return}
  const card=t.closest('.mine .hand [data-card],.mine .gear [data-card]');
  if(card){const id=+card.dataset.card;
    if(UI.sell){if(!GXT.act({type:'tap',what:'sellpick',id}))tutBlock(e);return}
    const st=GXT.current(),pk=st&&st.pick?st.pick():null;
    if(pk!=null&&pk===id&&BF.pick!==id)return;           // the card this step asks you to pick up: let the board lift it (no advance yet)
    GXT.act({type:'tap',what:'card',id});tutBlock(e);return}
  const ch=t.closest('[data-opp]');if(ch&&BF.pick==null&&!BF.ask){GXT.act({type:'tap',what:'chip'});tutBlock(e)}
},true);
// ---------------------------------------------------------------- the offer to first-time players, and the Skip/exit hooks
function tutOffer(btn){const hadPulse=btn.classList.contains('pulse');btn.classList.remove('pulse');let d=document.getElementById('tutoffer');if(d)d.remove();d=document.createElement('div');d.id='tutoffer';d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Learn the game');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in 5 minutes, one tap at a time. Or jump straight in.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b pulse" data-tutoffer="play">Just play</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',ev=>{const b=ev.target.closest('[data-tutoffer]');if(!b)return;ev.stopPropagation();const k=b.dataset.tutoffer;d.remove();if(hadPulse)btn.classList.add('pulse');try{localStorage.setItem('dkd_offer','1')}catch(x){}
    if(k==='learn')tutStart();else{UI._offerOk=1;try{btn.click()}finally{UI._offerOk=0}}})}
